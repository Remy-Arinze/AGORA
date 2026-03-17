'use client';

import { useRef, useState, useEffect, useId } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, parse, isValid, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';
import 'react-day-picker/dist/style.css';

export interface DatePickerProps {
  /** Value in YYYY-MM-DD format (for form state) */
  value: string;
  /** Called with YYYY-MM-DD when date changes */
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  /** Min date YYYY-MM-DD */
  min?: string;
  /** Max date YYYY-MM-DD */
  max?: string;
  wrapperClassName?: string;
  /** Display format for the trigger (default MMM d, yyyy) */
  displayFormat?: string;
}

const DISPLAY_FORMAT = 'MMM d, yyyy';
const VALUE_FORMAT = 'yyyy-MM-dd';

function parseValue(value: string): Date | undefined {
  if (!value || value.trim() === '') return undefined;
  const d = parse(value, VALUE_FORMAT, new Date());
  return isValid(d) ? d : undefined;
}

function toValueFormat(date: Date): string {
  return format(startOfDay(date), VALUE_FORMAT);
}

export function DatePicker({
  value,
  onChange,
  label,
  error,
  required,
  disabled,
  placeholder = 'Select date',
  id: idProp,
  min,
  max,
  wrapperClassName,
  displayFormat = DISPLAY_FORMAT,
}: DatePickerProps) {
  const id = idProp ?? useId();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedDate = parseValue(value);
  const minDate = min ? parseValue(min) : undefined;
  const maxDate = max ? parseValue(max) : undefined;

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    onChange(toValueFormat(date));
    setOpen(false);
  };

  const displayText = selectedDate ? format(selectedDate, displayFormat) : '';

  return (
    <div ref={wrapperRef} className={cn('w-full relative', wrapperClassName)}>
      {label && (
        <label
          htmlFor={id}
          className="block font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1"
          style={{ fontSize: 'var(--text-body)' }}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <button
        type="button"
        id={id}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={label ? `${label}${displayText ? `, ${displayText}` : ''}` : undefined}
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className={cn(
          'w-full px-3 py-2 border rounded-lg text-left flex items-center gap-2',
          'text-light-text-primary dark:text-dark-text-primary',
          'border-light-border dark:border-dark-border',
          'focus:outline-none focus:border-dark-border focus:ring-0',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'min-h-[40px]',
          '[background-color:var(--input-field-bg)]',
          error && 'border-red-500 dark:border-red-500',
          !displayText && 'text-light-text-muted dark:text-dark-text-muted'
        )}
      >
        <Calendar
          className="h-4 w-4 flex-shrink-0 text-light-text-muted dark:text-dark-text-muted"
          aria-hidden
        />
        <span
          className={cn('flex-1 truncate', !displayText && 'text-light-text-muted dark:text-dark-text-muted')}
          style={!displayText ? { fontSize: 'var(--text-placeholder)' } : undefined}
        >
          {displayText || placeholder}
        </span>
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1 p-2 rounded-lg border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-surface shadow-lg date-picker-dropdown"
          role="dialog"
          aria-label="Choose date"
        >
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            disabled={
              minDate || maxDate
                ? ([
                    ...(minDate ? [{ before: minDate }] : []),
                    ...(maxDate ? [{ after: maxDate }] : []),
                  ] as Array<{ before: Date } | { after: Date }>)
                : undefined
            }
            defaultMonth={selectedDate ?? minDate ?? maxDate ?? new Date()}
            required={required}
            showOutsideDays
            captionLayout="dropdown"
            fromYear={(minDate ?? new Date(new Date().getFullYear() - 100, 0, 1)).getFullYear()}
            toYear={(maxDate ?? new Date(new Date().getFullYear() + 20, 0, 1)).getFullYear()}
          />
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
