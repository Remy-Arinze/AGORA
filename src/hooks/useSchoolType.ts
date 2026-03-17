import { useMemo, useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { useGetMySchoolQuery, useGetMyStudentSchoolQuery, useGetMyTeacherSchoolQuery } from '@/lib/store/api/schoolAdminApi';
import type { SchoolType } from '@/lib/store/api/schoolAdminApi';

/**
 * Roles that have unrestricted access to all school types.
 * Only school_owner can switch between types freely.
 * All other admin roles are locked to their assigned schoolType.
 */
const UNRESTRICTED_ADMIN_ROLES = ['school_owner'] as const;

/**
 * Checks if a role is a principal-level role (Principal, Head Teacher, Headmaster, Headmistress, School Owner).
 */
export const isPrincipalRole = (role?: string | null) => {
  if (!role) return false;
  const r = role.toLowerCase().trim();
  return [
    'principal',
    'school_principal',
    'head_teacher',
    'headmaster',
    'headmistress',
    'school_owner',
  ].includes(r);
};

export interface SchoolTypeInfo {
  hasPrimary: boolean;
  hasSecondary: boolean;
  hasTertiary: boolean;
  isMixed: boolean;
  availableTypes: SchoolType[];
  primaryType: SchoolType | 'MIXED';
  currentType: SchoolType | null;
  setCurrentType: (type: SchoolType) => void;
  /** True if the admin is locked to a specific school type (cannot switch) */
  isLocked: boolean;
}

/**
 * Hook to get school type information and manage current type selection.
 *
 * For mixed schools:
 * - School owners can freely switch between school types via the switcher.
 * - All other admins are locked to the schoolType they were assigned to.
 *   Their `currentType` is always their assigned type, and `setCurrentType` is a no-op.
 * - Admins with no assigned schoolType (legacy/school-wide) retain the switcher.
 *
 * Works for school admins, students, and teachers.
 */
export function useSchoolType(): SchoolTypeInfo {
  const user = useSelector((state: RootState) => state.auth.user);

  // Use appropriate endpoint based on user role
  const { data: schoolAdminResponse } = useGetMySchoolQuery(undefined, {
    skip: user?.role !== 'SCHOOL_ADMIN',
  });
  const { data: studentSchoolResponse } = useGetMyStudentSchoolQuery(undefined, {
    skip: user?.role !== 'STUDENT',
  });
  const { data: teacherSchoolResponse } = useGetMyTeacherSchoolQuery(undefined, {
    skip: user?.role !== 'TEACHER',
  });

  // Get school from appropriate response
  const school = useMemo(() => {
    if (user?.role === 'STUDENT') return studentSchoolResponse?.data;
    if (user?.role === 'TEACHER') return teacherSchoolResponse?.data;
    return schoolAdminResponse?.data;
  }, [user?.role, studentSchoolResponse, teacherSchoolResponse, schoolAdminResponse]);

  const [currentType, setCurrentTypeState] = useState<SchoolType | null>(null);

  // Determine if this admin is locked to a specific school type
  const adminSchoolType = user?.adminSchoolType as SchoolType | null | undefined;
  const adminRole = user?.adminRole;
  const isUnrestrictedRole = adminRole
    ? UNRESTRICTED_ADMIN_ROLES.some(r => r === adminRole.toLowerCase())
    : false;

  // Admin is locked if they have an assigned schoolType AND are NOT an unrestricted role
  const isLocked = !!(
    user?.role === 'SCHOOL_ADMIN' &&
    adminSchoolType &&
    !isUnrestrictedRole
  );

  // Get school type context from school data
  const schoolType = useMemo(() => {
    if (!school) {
      return {
        hasPrimary: false,
        hasSecondary: false,
        hasTertiary: false,
        isMixed: false,
        availableTypes: [] as SchoolType[],
        primaryType: 'PRIMARY' as SchoolType | 'MIXED',
      };
    }

    // Use schoolType from API if available, otherwise compute from flags
    if (school.schoolType) {
      return school.schoolType;
    }

    // Fallback: compute from flags
    const availableTypes: SchoolType[] = [];
    if (school.hasPrimary) availableTypes.push('PRIMARY');
    if (school.hasSecondary) availableTypes.push('SECONDARY');
    if (school.hasTertiary) availableTypes.push('TERTIARY');

    const isMixed = availableTypes.length > 1;
    const primaryType: SchoolType | 'MIXED' =
      isMixed ? 'MIXED' : (availableTypes[0] || 'PRIMARY');

    return {
      hasPrimary: school.hasPrimary,
      hasSecondary: school.hasSecondary,
      hasTertiary: school.hasTertiary,
      isMixed,
      availableTypes,
      primaryType,
    };
  }, [school]);

  // Initialize and sync current type
  useEffect(() => {
    if (typeof window === 'undefined' || schoolType.availableTypes.length === 0) {
      return;
    }

    // If admin is locked to a specific type, always use that
    if (isLocked && adminSchoolType) {
      setCurrentTypeState(adminSchoolType);
      return;
    }

    // For unrestricted users, use localStorage preference
    const stored = localStorage.getItem('selectedSchoolType');
    if (stored && schoolType.availableTypes.includes(stored as SchoolType)) {
      setCurrentTypeState(stored as SchoolType);
    } else {
      // Default to first available type or primary type
      const defaultType = schoolType.availableTypes.length > 0
        ? schoolType.availableTypes[0]
        : (schoolType.primaryType !== 'MIXED' ? schoolType.primaryType : null);
      if (defaultType) {
        setCurrentTypeState(defaultType);
        localStorage.setItem('selectedSchoolType', defaultType);
      }
    }
  }, [schoolType, isLocked, adminSchoolType]);

  // Listen for type changes from other components (only for unrestricted users)
  useEffect(() => {
    if (typeof window === 'undefined' || isLocked) return;

    const handleTypeChange = () => {
      const stored = localStorage.getItem('selectedSchoolType');
      if (stored && schoolType.availableTypes.includes(stored as SchoolType)) {
        setCurrentTypeState(stored as SchoolType);
      }
    };

    window.addEventListener('schoolTypeChanged', handleTypeChange);
    return () => window.removeEventListener('schoolTypeChanged', handleTypeChange);
  }, [schoolType, isLocked]);

  // Set current type — no-op for locked admins
  const setCurrentType = useCallback((type: SchoolType) => {
    if (isLocked) return; // Locked admins cannot switch types
    if (typeof window !== 'undefined' && schoolType.availableTypes.includes(type)) {
      localStorage.setItem('selectedSchoolType', type);
      setCurrentTypeState(type);
      window.dispatchEvent(new Event('schoolTypeChanged'));
    }
  }, [isLocked, schoolType.availableTypes]);

  // For locked admins, always return their fixed type regardless of state
  const effectiveType = isLocked && adminSchoolType ? adminSchoolType : currentType;

  return {
    ...schoolType,
    currentType: effectiveType,
    setCurrentType,
    isLocked,
  };
}

