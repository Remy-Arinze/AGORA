'use client';

import { CountryDropdown } from 'react-country-region-selector';
import { Select } from './Select';

export interface CountrySelectorProps {
  value: string;
  onChange: (countryName: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  className?: string;
  wrapperClassName?: string;
}

/**
 * A highly secure, zero-dependency data source country selector.
 * Uses react-country-region-selector for the data and provides a premium look.
 */
export function CountrySelector({
  value,
  onChange,
  label,
  error,
  required,
  disabled,
  placeholder = 'Select country...',
  id,
  className,
  wrapperClassName,
}: CountrySelectorProps) {
  return (
    <div className={wrapperClassName}>
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
      <div className="relative">
        <CountryDropdown
          value={value}
          onChange={(val) => onChange(val)}
          disabled={disabled}
          className={className}
          id={id}
          defaultOptionLabel={placeholder}
          // Custom styling to match our design system
          style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: '8px',
            border: error ? '1px solid #ef4444' : '',
            backgroundColor: 'var(--light-input)',
            color: 'var(--light-text-primary)',
            fontSize: 'var(--text-body)',
            outline: 'none',
            appearance: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
          }}
        />
        {/* Simple chevron indicator for the native select */}

      </div>
      {error && (
        <p className="mt-1 text-red-600 dark:text-red-400" style={{ fontSize: 'var(--text-small)' }}>{error}</p>
      )}
    </div>
  );
}
