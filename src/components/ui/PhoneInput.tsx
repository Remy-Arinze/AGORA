'use client';

import { cn } from '@/lib/utils';
import { PhoneInput as LibPhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

export interface PhoneInputProps {
  /** E.164 value (e.g. +2348012345678) */
  value: string;
  onChange: (e164: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  /** Default country when value is empty (e.g. NG). Passed as iso2 to the library. */
  defaultCountryCode?: string;
  wrapperClassName?: string;
}

/** Preferred countries shown at top of dropdown (Nigeria first, then common African/other). */
const PREFERRED_COUNTRIES = [
  'ng', 'gh', 'ke', 'za', 'eg', 'et', 'tz', 'ug', 'gb', 'us', 'ca', 'in', 'ae', 'sa', 'fr', 'de', 'cn',
] as const;

export function PhoneInput({
  value,
  onChange,
  label,
  error,
  required,
  disabled,
  placeholder = '8012345678',
  id,
  defaultCountryCode = 'NG',
  wrapperClassName,
}: PhoneInputProps) {
  const defaultCountry = defaultCountryCode.toLowerCase().slice(0, 2) as 'ng' | 'us' | string;

  return (
    <div className={cn('w-full phone-input-wrapper', wrapperClassName)}>
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
      <LibPhoneInput
        defaultCountry={defaultCountry}
        value={value}
        onChange={(phone) => onChange(phone)}
        preferredCountries={PREFERRED_COUNTRIES}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        inputProps={{ id }}
        className="react-international-phone-theme"
        inputClassName={cn(error && '!ring-1 !ring-red-500 dark:!ring-red-500')}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
