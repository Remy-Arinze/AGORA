/**
 * Production-ready type guards for complex data structures
 * Ensures type safety across all dashboard components
 */

import { isNotNullOrUndefined, isNotEmptyString } from './safety-utils';

/**
 * Type guard for School object
 */
export function isSchool(obj: any): obj is {
  id: string;
  name: string;
  hasPrimary: boolean;
  hasSecondary: boolean;
  hasTertiary: boolean;
  logo?: string | null;
  city?: string | null;
  state?: string | null;
  admins?: any[];
  currentAdmin?: {
    id: string;
    role: string;
    firstName: string;
    lastName: string;
  } | null;
} {
  return (
    isNotNullOrUndefined(obj) &&
    typeof obj === 'object' &&
    isNotEmptyString(obj.id) &&
    isNotEmptyString(obj.name) &&
    typeof obj.hasPrimary === 'boolean' &&
    typeof obj.hasSecondary === 'boolean' &&
    typeof obj.hasTertiary === 'boolean'
  );
}

/**
 * Type guard for User object
 */
export function isUser(obj: any): obj is {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  role: string;
} {
  return (
    isNotNullOrUndefined(obj) &&
    typeof obj === 'object' &&
    isNotEmptyString(obj.id) &&
    isNotEmptyString(obj.email) &&
    isNotEmptyString(obj.role)
  );
}

/**
 * Type guard for Teacher object
 */
export function isTeacher(obj: any): obj is {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  subjects?: string[];
  classes?: any[];
} {
  return (
    isNotNullOrUndefined(obj) &&
    typeof obj === 'object' &&
    isNotEmptyString(obj.id) &&
    isNotEmptyString(obj.firstName) &&
    isNotEmptyString(obj.lastName) &&
    isNotEmptyString(obj.email)
  );
}

/**
 * Type guard for Student object
 */
export function isStudent(obj: any): obj is {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  classLevel: string;
  status: string;
  profileImage?: string | null;
} {
  return (
    isNotNullOrUndefined(obj) &&
    typeof obj === 'object' &&
    isNotEmptyString(obj.id) &&
    isNotEmptyString(obj.name) &&
    isNotEmptyString(obj.admissionNumber) &&
    isNotEmptyString(obj.classLevel) &&
    isNotEmptyString(obj.status)
  );
}

/**
 * Type guard for Class/Course object
 */
export function isClass(obj: any): obj is {
  id: string;
  name: string;
  type: 'PRIMARY' | 'SECONDARY' | 'TERTIARY';
  studentsCount?: number;
  teachers?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    subject?: string;
    isPrimary?: boolean;
    isFormTeacher?: boolean;
  }>;
} {
  return (
    isNotNullOrUndefined(obj) &&
    typeof obj === 'object' &&
    isNotEmptyString(obj.id) &&
    isNotEmptyString(obj.name) &&
    ['PRIMARY', 'SECONDARY', 'TERTIARY'].includes(obj.type)
  );
}

/**
 * Type guard for TimetablePeriod object
 */
export function isTimetablePeriod(obj: any): obj is {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  type: 'LESSON' | 'BREAK';
  subjectName?: string;
  className?: string;
  classArmName?: string;
  roomName?: string;
} {
  return (
    isNotNullOrUndefined(obj) &&
    typeof obj === 'object' &&
    isNotEmptyString(obj.id) &&
    isNotEmptyString(obj.dayOfWeek) &&
    isNotEmptyString(obj.startTime) &&
    isNotEmptyString(obj.endTime) &&
    ['LESSON', 'BREAK'].includes(obj.type)
  );
}

/**
 * Type guard for Session object
 */
export function isSession(obj: any): obj is {
  id: string;
  name: string;
  isActive: boolean;
  schoolId: string;
} {
  return (
    isNotNullOrUndefined(obj) &&
    typeof obj === 'object' &&
    isNotEmptyString(obj.id) &&
    isNotEmptyString(obj.name) &&
    typeof obj.isActive === 'boolean' &&
    isNotEmptyString(obj.schoolId)
  );
}

/**
 * Type guard for Term object
 */
export function isTerm(obj: any): obj is {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  sessionId: string;
  isActive: boolean;
} {
  return (
    isNotNullOrUndefined(obj) &&
    typeof obj === 'object' &&
    isNotEmptyString(obj.id) &&
    isNotEmptyString(obj.name) &&
    isNotEmptyString(obj.startDate) &&
    isNotEmptyString(obj.endDate) &&
    isNotEmptyString(obj.sessionId) &&
    typeof obj.isActive === 'boolean'
  );
}

/**
 * Type guard for Dashboard Stats object
 */
export function isDashboardStats(obj: any): obj is {
  totalStudents: number;
  totalTeachers: number;
  activeCourses: number;
  pendingAdmissions: number;
  studentsChange: number;
  teachersChange: number;
  coursesChange: number;
  pendingAdmissionsChange: number;
} {
  return (
    isNotNullOrUndefined(obj) &&
    typeof obj === 'object' &&
    typeof obj.totalStudents === 'number' &&
    typeof obj.totalTeachers === 'number' &&
    typeof obj.activeCourses === 'number' &&
    typeof obj.pendingAdmissions === 'number' &&
    typeof obj.studentsChange === 'number' &&
    typeof obj.teachersChange === 'number' &&
    typeof obj.coursesChange === 'number' &&
    typeof obj.pendingAdmissionsChange === 'number'
  );
}

/**
 * Type guard for Pagination object
 */
export function isPagination(obj: any): obj is {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
} {
  return (
    isNotNullOrUndefined(obj) &&
    typeof obj === 'object' &&
    typeof obj.total === 'number' &&
    typeof obj.page === 'number' &&
    typeof obj.limit === 'number' &&
    typeof obj.totalPages === 'number' &&
    typeof obj.hasNext === 'boolean' &&
    typeof obj.hasPrev === 'boolean'
  );
}

/**
 * Type guard for API Response object
 */
export function isApiResponse<T>(obj: any, dataGuard?: (data: any) => data is T): obj is {
  success: boolean;
  message: string;
  data?: T;
  warnings?: string[];
} {
  return (
    isNotNullOrUndefined(obj) &&
    typeof obj === 'object' &&
    typeof obj.success === 'boolean' &&
    isNotEmptyString(obj.message) &&
    (obj.data === undefined || dataGuard?.(obj.data) !== false)
  );
}

/**
 * Type guard for Error object
 */
export function isError(obj: any): obj is {
  status?: number;
  data?: {
    message?: string;
    error?: string;
  };
  message?: string;
} {
  return (
    isNotNullOrUndefined(obj) &&
    typeof obj === 'object' &&
    (obj.status === undefined || typeof obj.status === 'number')
  );
}

/**
 * Type guard for School Admin object
 */
export function isSchoolAdmin(obj: any): obj is {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
} {
  return (
    isNotNullOrUndefined(obj) &&
    typeof obj === 'object' &&
    isNotEmptyString(obj.id) &&
    isNotEmptyString(obj.firstName) &&
    isNotEmptyString(obj.lastName) &&
    isNotEmptyString(obj.email) &&
    isNotEmptyString(obj.role) &&
    typeof obj.isActive === 'boolean'
  );
}

/**
 * Type guard for Permission object
 */
export function isPermission(obj: any): obj is {
  resource: string;
  type: string;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
} {
  return (
    isNotNullOrUndefined(obj) &&
    typeof obj === 'object' &&
    isNotEmptyString(obj.resource) &&
    isNotEmptyString(obj.type) &&
    typeof obj.canRead === 'boolean' &&
    typeof obj.canWrite === 'boolean' &&
    typeof obj.canDelete === 'boolean'
  );
}

/**
 * Array type guards
 */
export function isSchoolArray(arr: any): arr is ReturnType<typeof isSchool>[] {
  return Array.isArray(arr) && arr.every(isSchool);
}

export function isUserArray(arr: any): arr is ReturnType<typeof isUser>[] {
  return Array.isArray(arr) && arr.every(isUser);
}

export function isTeacherArray(arr: any): arr is ReturnType<typeof isTeacher>[] {
  return Array.isArray(arr) && arr.every(isTeacher);
}

export function isStudentArray(arr: any): arr is ReturnType<typeof isStudent>[] {
  return Array.isArray(arr) && arr.every(isStudent);
}

export function isClassArray(arr: any): arr is ReturnType<typeof isClass>[] {
  return Array.isArray(arr) && arr.every(isClass);
}

export function isTimetablePeriodArray(arr: any): arr is ReturnType<typeof isTimetablePeriod>[] {
  return Array.isArray(arr) && arr.every(isTimetablePeriod);
}

/**
 * Utility function to safely cast with type guard
 */
export function safeCast<T>(
  obj: any,
  typeGuard: (obj: any) => obj is T,
  fallback: T
): T {
  return typeGuard(obj) ? obj : fallback;
}

/**
 * Utility function to safely cast array with type guard
 */
export function safeCastArray<T>(
  arr: any,
  typeGuard: (obj: any) => obj is T,
  fallback: T[]
): T[] {
  return Array.isArray(arr) && arr.every(typeGuard) ? arr : fallback;
}
