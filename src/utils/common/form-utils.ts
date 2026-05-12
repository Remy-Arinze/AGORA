/**
 * Production-ready form utilities for consistent form state management
 * Implements null-safe patterns for all dashboard forms
 */

import { useState, useCallback, useEffect } from 'react';
import { safeGet, isNotNullOrUndefined, getErrorMessage } from './safety-utils';

/**
 * Generic form state interface
 */
export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
}

/**
 * Form validation rules
 */
export interface ValidationRule<T> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any, formData: T) => string | null;
  message?: string;
}

/**
 * Form validation schema
 */
export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T>;
};

/**
 * Hook for managing form state with null safety
 */
export function useForm<T extends Record<string, any>>(
  initialData: T,
  validationSchema?: ValidationSchema<T>
) {
  const [formState, setFormState] = useState<FormState<T>>({
    data: { ...initialData },
    errors: {},
    touched: {},
    isDirty: false,
    isValid: true,
    isSubmitting: false,
  });

  /**
   * Validate a single field
   */
  const validateField = useCallback((field: keyof T, value: any, formData: T): string | null => {
    const rules = validationSchema?.[field];
    if (!rules) return null;

    // Required validation
    if (rules.required && (!isNotNullOrUndefined(value) || (typeof value === 'string' && value.trim() === ''))) {
      return rules.message || `${String(field)} is required`;
    }

    // Skip other validations if value is empty and not required
    if (!isNotNullOrUndefined(value) || (typeof value === 'string' && value.trim() === '')) {
      return null;
    }

    // Type-specific validations
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        return rules.message || `${String(field)} must be at least ${rules.minLength} characters`;
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        return rules.message || `${String(field)} must not exceed ${rules.maxLength} characters`;
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        return rules.message || `${String(field)} format is invalid`;
      }
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(value, formData);
      if (customError) return customError;
    }

    return null;
  }, [validationSchema]);

  /**
   * Validate all fields
   */
  const validateForm = useCallback((formData: T): Partial<Record<keyof T, string>> => {
    if (!validationSchema) return {};

    const errors: Partial<Record<keyof T, string>> = {};
    
    for (const field in validationSchema) {
      const error = validateField(field, formData[field], formData);
      if (error) {
        errors[field] = error;
      }
    }

    return errors;
  }, [validationSchema, validateField]);

  /**
   * Handle field value change
   */
  const handleChange = useCallback((field: keyof T, value: any) => {
    setFormState(prev => {
      const newData = { ...prev.data, [field]: value };
      const error = validateField(field, value, newData);
      
      return {
        ...prev,
        data: newData,
        errors: {
          ...prev.errors,
          [field]: error || undefined,
        },
        touched: {
          ...prev.touched,
          [field]: true,
        },
        isDirty: true,
        isValid: !error && Object.keys(prev.errors).filter(k => k !== field).length === 0,
      };
    });
  }, [validateField]);

  /**
   * Handle multiple field changes at once
   */
  const handleMultipleChanges = useCallback((updates: Partial<T>) => {
    setFormState(prev => {
      const newData = { ...prev.data, ...updates };
      const newErrors = { ...prev.errors };
      let isValid = true;

      for (const field in updates) {
        const error = validateField(field as keyof T, updates[field], newData);
        if (error) {
          newErrors[field as keyof T] = error;
          isValid = false;
        } else {
          delete newErrors[field as keyof T];
        }
      }

      return {
        ...prev,
        data: newData,
        errors: newErrors,
        touched: { ...prev.touched, ...Object.keys(updates).reduce((acc, field) => ({ ...acc, [field]: true }), {}) },
        isDirty: true,
        isValid,
      };
    });
  }, [validateField]);

  /**
   * Validate entire form
   */
  const validate = useCallback(() => {
    const errors = validateForm(formState.data);
    setFormState(prev => ({
      ...prev,
      errors,
      isValid: Object.keys(errors).length === 0,
      touched: Object.keys(prev.data).reduce((acc, field) => ({ ...acc, [field]: true }), {}),
    }));
    return Object.keys(errors).length === 0;
  }, [formState.data, validateForm]);

  /**
   * Reset form to initial state
   */
  const reset = useCallback(() => {
    setFormState({
      data: { ...initialData },
      errors: {},
      touched: {},
      isDirty: false,
      isValid: true,
      isSubmitting: false,
    });
  }, [initialData]);

  /**
   * Set submitting state
   */
  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setFormState(prev => ({ ...prev, isSubmitting }));
  }, []);

  /**
   * Get field error message
   */
  const getFieldError = useCallback((field: keyof T): string | undefined => {
    return formState.touched[field] ? formState.errors[field] : undefined;
  }, [formState.errors, formState.touched]);

  /**
   * Check if field has error
   */
  const hasFieldError = useCallback((field: keyof T): boolean => {
    return !!(formState.touched[field] && formState.errors[field]);
  }, [formState.errors, formState.touched]);

  return {
    formState,
    handleChange,
    handleMultipleChanges,
    validate,
    reset,
    setSubmitting,
    getFieldError,
    hasFieldError,
  };
}

/**
 * Safe form submission handler
 */
export async function safeFormSubmit<T>(
  formState: FormState<T>,
  submitFn: (data: T) => Promise<any>,
  onSuccess?: (result: any) => void,
  onError?: (error: string) => void
): Promise<{ success: boolean; result?: any; error?: string }> {
  try {
    const result = await submitFn(formState.data);
    onSuccess?.(result);
    return { success: true, result };
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    onError?.(errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Common validation patterns
 */
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  numeric: /^\d+$/,
  decimal: /^\d+(\.\d+)?$/,
  url: /^https?:\/\/.+/,
  name: /^[a-zA-Z\s\-']+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

/**
 * Common validation rules
 */
export const CommonValidations = {
  required: { required: true },
  email: { pattern: ValidationPatterns.email, message: 'Please enter a valid email address' },
  phone: { pattern: ValidationPatterns.phone, message: 'Please enter a valid phone number' },
  name: { pattern: ValidationPatterns.name, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' },
  password: { pattern: ValidationPatterns.password, message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' },
  minLength: (min: number) => ({ minLength: min, message: `Must be at least ${min} characters` }),
  maxLength: (max: number) => ({ maxLength: max, message: `Must not exceed ${max} characters` }),
};

/**
 * Utility to create safe form data from potentially undefined inputs
 */
export function createSafeFormData<T extends Record<string, any>>(
  rawData: Partial<T> | undefined,
  defaults: T
): T {
  if (!rawData) return defaults;

  const safeData: T = { ...defaults };
  
  for (const key in defaults) {
    if (key in rawData && isNotNullOrUndefined(rawData[key])) {
      safeData[key] = rawData[key]!;
    }
  }

  return safeData;
}

/**
 * Utility to safely extract form values from event targets
 */
export function getFormValue(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): any {
  const target = event.target;
  
  if (target.type === 'checkbox') {
    return (target as HTMLInputElement).checked;
  }
  
  if (target.type === 'number') {
    const value = target.value;
    return value === '' ? '' : Number(value);
  }
  
  return target.value;
}

