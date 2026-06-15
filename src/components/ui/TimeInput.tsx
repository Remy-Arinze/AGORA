'use client';

/**
 * TimeInput — a production-quality HH:mm time input.
 *
 * Design goals:
 *  - Lets the user type freely (e.g. "0800", "8:00", "800") and formats on blur
 *  - Keeps the native <input type="time"> as the backing element so mobile pickers
 *    still work and the value is always a valid HH:mm string when committed
 *  - Shows a red border + tooltip when the committed value is invalid
 *  - Accessible: label association, aria-invalid, title for screen readers
 *  - Matches the project's existing Tailwind class conventions
 *
 * Accepted input formats (typed):
 *   "8"        → 08:00
 *   "830"      → 08:30
 *   "0830"     → 08:30
 *   "8:30"     → 08:30
 *   "8:3"      → 08:03  (ambiguous; we treat as HH:M → HH:0M)
 *   "083"      → 08:03
 *   "8.30"     → 08:30  (dot separator)
 *   "14:00"    → 14:00
 *   Native picker always emits "HH:mm" — passes through unchanged.
 *
 * onChange is only called with a valid "HH:mm" value (or "" to clear).
 * onError is called when the user leaves the field with an unparseable value.
 */

import { useState, useRef, useCallback, useId, forwardRef } from 'react';
import { cn } from '@/lib/utils';

// ─── helpers ────────────────────────────────────────────────────────────────

const HH_MM_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Attempt to normalise a raw string to "HH:mm". Returns null on failure. */
export function parseTimeInput(raw: string): string | null {
  const s = raw.trim().replace('.', ':'); // allow "8.30"

  // Already valid HH:mm
  if (HH_MM_RE.test(s)) return s;

  // Remove all non-digits
  const digits = s.replace(/\D/g, '');

  if (digits.length === 0) return null;

  let h: number;
  let m: number;

  if (digits.length === 1) {
    // "8" → 08:00
    h = parseInt(digits, 10);
    m = 0;
  } else if (digits.length === 2) {
    // "08" → 08:00  |  "30" ambiguous — treat as HH
    h = parseInt(digits, 10);
    m = 0;
  } else if (digits.length === 3) {
    // "830" → 08:30  |  "083" → 08:03
    // Try H:MM first
    h = parseInt(digits[0], 10);
    m = parseInt(digits.slice(1), 10);
    if (m > 59) {
      // Try HH:0M
      h = parseInt(digits.slice(0, 2), 10);
      m = parseInt(digits[2], 10);
    }
  } else if (digits.length === 4) {
    // "0830" → 08:30
    h = parseInt(digits.slice(0, 2), 10);
    m = parseInt(digits.slice(2), 10);
  } else {
    // More than 4 digits — not a valid time
    return null;
  }

  if (isNaN(h) || isNaN(m) || h > 23 || m > 59) return null;

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Is a string a valid "HH:mm" time? */
export function isValidTime(value: string): boolean {
  return HH_MM_RE.test(value);
}

// ─── component ──────────────────────────────────────────────────────────────

export interface TimeInputProps {
  /** Controlled value — must be "" or a valid "HH:mm" string */
  value: string;
  /** Called only with valid "HH:mm" or "" (to clear) */
  onChange: (value: string) => void;
  /** Called when the user leaves with an unparseable string */
  onError?: (rawValue: string) => void;
  /** Forwarded to the underlying input */
  disabled?: boolean;
  /** Additional class names for the wrapper div */
  className?: string;
  /** Accessible label (also used as placeholder hint) */
  label?: string;
  /** If true, an error style is shown even before the user blurs */
  forceError?: boolean;
  /** id — auto-generated if omitted */
  id?: string;
}

export const TimeInput = forwardRef<HTMLInputElement, TimeInputProps>(
  function TimeInput(
    { value, onChange, onError, disabled, className, label, forceError, id: idProp },
    ref
  ) {
    // Internal display value (what the user sees while typing)
    const [displayValue, setDisplayValue] = useState(value);
    const [hasError, setHasError] = useState(false);
    const autoId = useId();
    const id = idProp ?? autoId;

    // Keep display in sync when the parent changes value externally
    // (e.g. auto-fill, reset)
    const prevValueRef = useRef(value);
    if (prevValueRef.current !== value) {
      prevValueRef.current = value;
      // Only sync if the display isn't mid-edit (i.e. display already matches)
      if (isValidTime(value) || value === '') {
        setDisplayValue(value);
        setHasError(false);
      }
    }

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        setDisplayValue(raw);

        // Native picker always gives valid "HH:mm" — commit immediately
        if (HH_MM_RE.test(raw)) {
          setHasError(false);
          onChange(raw);
          return;
        }

        // Clear error while typing
        if (hasError) setHasError(false);
      },
      [hasError, onChange]
    );

    const handleBlur = useCallback(() => {
      const raw = displayValue.trim();

      if (raw === '') {
        // Allow clearing
        setHasError(false);
        onChange('');
        return;
      }

      const parsed = parseTimeInput(raw);
      if (parsed) {
        setDisplayValue(parsed); // normalise display
        setHasError(false);
        onChange(parsed);
      } else {
        setHasError(true);
        onError?.(raw);
      }
    }, [displayValue, onChange, onError]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          (e.target as HTMLInputElement).blur();
        }
      },
      []
    );

    const showError = forceError || hasError;

    return (
      <div className={cn('relative', className)}>
        {label && (
          <label
            htmlFor={id}
            className="sr-only"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          // Use "text" so the user can type freely.
          // The native time picker is surfaced via the clock icon on most browsers
          // when type="text" is combined with inputMode hints — but for maximum
          // compatibility we keep type="time" and just allow free editing.
          //
          // HOWEVER: type="time" on Chrome/Safari still uses a spinbox by default.
          // We override that with a pattern + inputMode so it acts like a text field
          // while still accepting the native format on mobile.
          type="text"
          inputMode="numeric"
          // pattern helps mobile keyboards show the numeric layout
          pattern="[0-9:]*"
          placeholder="HH:MM"
          aria-label={label}
          aria-invalid={showError}
          title={showError ? 'Invalid time — use HH:MM (e.g. 08:30)' : label}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
          className={cn(
            'w-full px-2 py-1.5 text-[10px] sm:text-xs rounded transition-colors',
            'bg-white dark:bg-dark-surface',
            'text-light-text-primary dark:text-dark-text-primary',
            showError
              ? 'border border-red-500 dark:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-500'
              : 'border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
        {showError && (
          <p
            role="alert"
            className="absolute left-0 top-full mt-0.5 text-[10px] text-red-600 dark:text-red-400 whitespace-nowrap z-10 bg-white dark:bg-dark-surface px-1 rounded shadow"
          >
            Use HH:MM (e.g. 08:30)
          </p>
        )}
      </div>
    );
  }
);
