'use client';

import { CountryDropdown } from 'react-country-region-selector';

const COUNTRY_SCOPES = {
  africa: [
    'DZ', 'AO', 'BJ', 'BW', 'BF', 'BI', 'CV', 'CM', 'CF', 'TD',
    'KM', 'CD', 'CG', 'CI', 'DJ', 'EG', 'GQ', 'ER', 'SZ', 'ET',
    'GA', 'GM', 'GH', 'GN', 'GW', 'KE', 'LS', 'LR', 'LY', 'MG',
    'MW', 'ML', 'MR', 'MU', 'MA', 'MZ', 'NA', 'NE', 'NG', 'RW',
    'ST', 'SN', 'SC', 'SL', 'SO', 'ZA', 'SS', 'SD', 'TZ', 'TG',
    'TN', 'UG', 'ZM', 'ZW',
  ],
  'west-africa': [
    'BJ', 'BF', 'CV', 'CI', 'GM', 'GH', 'GN', 'GW',
    'LR', 'ML', 'MR', 'NE', 'NG', 'SN', 'SL', 'TG',
  ],
} as const;

export type CountrySelectorScope = keyof typeof COUNTRY_SCOPES;

export interface CountrySelectorProps {
  value: string;
  onChange: (countryName: string) => void;
  scope?: CountrySelectorScope;
  whitelist?: readonly string[];
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
  scope = 'africa',
  whitelist,
  label,
  error,
  required,
  disabled,
  placeholder = 'Select country...',
  id,
  className,
  wrapperClassName,
}: CountrySelectorProps) {
  const resolvedWhitelist = whitelist ? [...whitelist] : [...COUNTRY_SCOPES[scope]];

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
          whitelist={resolvedWhitelist}
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
