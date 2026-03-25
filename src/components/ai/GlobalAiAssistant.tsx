'use client';

import React, { useState, useEffect } from 'react';
import { FloatingAiCta } from './FloatingAiCta';
import { AiChatDrawer } from './AiChatDrawer';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { useParams, usePathname } from 'next/navigation';
import { useTeacherDashboard } from '@/hooks/useTeacherDashboard';

export const GlobalAiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  
  const user = useSelector((state: RootState) => state.auth.user);
  const reduxSchoolId = useSelector((state: RootState) => (state.auth as any).currentSchoolId);
  const params = useParams();
  const pathname = usePathname();
  const schoolId = (params?.schoolId as string) || reduxSchoolId || (user as any)?.schoolId;

  // For teachers, we want to ensure all their classes/assignments are loaded too
  const { isReady: teacherDataReady } = useTeacherDashboard();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) return null;

  // Logging for debugging (visible in browser console)
  // if (typeof window !== 'undefined') console.log('[GlobalAiAssistant] User:', user?.role, 'SchoolId:', schoolId);

  // Define target roles for the floating assistant
  // The user specifically mentioned "principal roles" and "school owner"
  const isAuthorized = 
    user?.role === 'SCHOOL_ADMIN' || 
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'TEACHER' ||
    (user as any)?.roleRank === 'PRINCIPAL';

  // Hiding the assistant on specific "Heavy Focus" screens
  const isHiddenPage = 
    pathname?.includes('/assessments/new') || 
    pathname?.includes('/assessments/edit') ||
    (pathname?.includes('/assessments/') && pathname.split('/').length > 4) || // Catch [id] but not the list
    pathname?.includes('/plugins/agora-ai');

  // Strict data readiness gate: 
  // 1. Must have a user and a school context
  // 2. If teacher, must have their assignments (teacherDataReady)
  const isDataReady = !!user && !!schoolId && (user.role === 'TEACHER' ? teacherDataReady : true);

  if (!isAuthorized || !isDataReady || isHiddenPage) return null;

  return (
    <>
      <FloatingAiCta onClick={() => setIsOpen(true)} />
      <AiChatDrawer 
        schoolId={schoolId} 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
};
