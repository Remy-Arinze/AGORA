/**
 * Production-ready utility functions for null safety and error handling
 * Implements consistent patterns across all dashboard components
 */

/**
 * Safely extracts error message from various error formats
 * Standardizes error handling across the application
 */
export function getErrorMessage(error: unknown): string {
  if (!error) return 'An unexpected error occurred';

  // Handle RTK Query error format
  if (error && typeof error === 'object' && 'data' in error) {
    const errorData = error.data as any;
    return errorData?.message || errorData?.error || 'An unexpected error occurred';
  }

  // Handle Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle objects with message property
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as any).message || 'An unexpected error occurred';
  }

  // Handle network errors with status
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as any).status;
    if (status === 401) return 'Authentication failed. Please log in again.';
    if (status === 403) return 'You do not have permission to perform this action.';
    if (status === 404) return 'The requested resource was not found.';
    if (status === 429) return 'Too many requests. Please try again later.';
    if (status >= 500) return 'Server error. Please try again later.';
  }

  return 'An unexpected error occurred';
}

/**
 * Safely gets nested property value with fallback
 * Prevents runtime errors from accessing undefined nested properties
 */
export function safeGet<T>(
  obj: any,
  path: string,
  fallback: T
): T {
  try {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (current == null || typeof current !== 'object') {
        return fallback;
      }
      current = current[key];
    }

    return current !== undefined && current !== null ? current : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Type guard for checking if a value is not null or undefined
 */
export function isNotNullOrUndefined<T>(value: T | null | undefined): value is T {
  return value != null;
}

/**
 * Type guard for checking if a string is not empty
 */
export function isNotEmptyString(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Safely formats numbers with fallback
 */
export function safeFormatNumber(num: number | null | undefined, fallback: string = '0'): string {
  if (num == null || isNaN(num)) return fallback;
  try {
    return num.toLocaleString();
  } catch {
    return fallback;
  }
}

/**
 * Safely formats dates with fallback
 */
export function safeFormatDate(
  date: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions,
  fallback: string = 'N/A'
): string {
  if (!date) return fallback;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return fallback;
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    });
  } catch {
    return fallback;
  }
}

/**
 * Safely accesses array with index bounds checking
 */
export function safeArrayGet<T>(
  array: T[] | null | undefined,
  index: number,
  fallback: T
): T {
  if (!Array.isArray(array) || index < 0 || index >= array.length) {
    return fallback;
  }
  return array[index] ?? fallback;
}

/**
 * Safely finds item in array with fallback
 */
export function safeArrayFind<T>(
  array: T[] | null | undefined,
  predicate: (item: T) => boolean,
  fallback: T | null
): T | null {
  if (!Array.isArray(array)) return fallback;
  return array.find(predicate) ?? fallback;
}

/**
 * Creates a safe API parameter object by filtering out undefined values
 */
export function safeApiParams<T extends Record<string, any>>(
  params: T
): Partial<T> {
  const result: Partial<T> = {};
  
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      result[key as keyof T] = value;
    }
  }
  
  return result;
}

/**
 * Safely gets user display name with multiple fallbacks
 */
export function safeGetUserName(
  user: { firstName?: string | null; lastName?: string | null; name?: string | null; email?: string | null } | null | undefined,
  fallback: string = 'User'
): string {
  if (!user) return fallback;

  // Try full name first
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`.trim();
  }

  // Try individual names
  if (user.firstName) return user.firstName;
  if (user.lastName) return user.lastName;
  if (user.name) return user.name;

  // Try email as last resort
  if (user.email) {
    const emailName = user.email.split('@')[0];
    return emailName || fallback;
  }

  return fallback;
}

/**
 * Safely gets school type with fallback
 */
export function safeGetSchoolType(
  school: { hasPrimary?: boolean; hasSecondary?: boolean; hasTertiary?: boolean } | null | undefined
): 'PRIMARY' | 'SECONDARY' | 'TERTIARY' | null {
  if (!school) return null;

  const types: ('PRIMARY' | 'SECONDARY' | 'TERTIARY')[] = [];
  if (school.hasPrimary) types.push('PRIMARY');
  if (school.hasSecondary) types.push('SECONDARY');
  if (school.hasTertiary) types.push('TERTIARY');

  // Return single type if only one exists
  if (types.length === 1) return types[0];

  // Return null for mixed types or no types
  return null;
}

/**
 * Type guard for admin role checking
 */
export function isAdminRole(role: string | null | undefined): role is string {
  return isNotEmptyString(role);
}

/**
 * Type guard for checking if user has specific role
 */
export function hasRole(
  user: { role?: string } | null | undefined,
  requiredRole: string
): boolean {
  return isAdminRole(user?.role) && user.role === requiredRole;
}

/**
 * Safely creates array from potentially undefined value
 */
export function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

/**
 * Safely executes function with error handling
 */
export function safeExecute<T>(
  fn: () => T,
  fallback: T,
  onError?: (error: unknown) => void
): T {
  try {
    return fn();
  } catch (error) {
    onError?.(error);
    return fallback;
  }
}
