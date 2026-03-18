'use client';

import React, { useState } from 'react';
import { FloatingAiCta } from './FloatingAiCta';
import { AiChatDrawer } from './AiChatDrawer';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { useParams } from 'next/navigation';

export const GlobalAiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const reduxSchoolId = useSelector((state: RootState) => (state.auth as any).currentSchoolId);
  const params = useParams();
  const schoolId = (params?.schoolId as string) || reduxSchoolId || (user as any)?.schoolId;

  // Logging for debugging (visible in browser console)
  // if (typeof window !== 'undefined') console.log('[GlobalAiAssistant] User:', user?.role, 'SchoolId:', schoolId);

  // Define target roles for the floating assistant
  // The user specifically mentioned "principal roles" and "school owner"
  const isAuthorized = 
    user?.role === 'SCHOOL_ADMIN' || 
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'TEACHER' || // Teachers see it too in their dashboard
    (user as any)?.roleRank === 'PRINCIPAL';

  if (!isAuthorized || !schoolId) return null;

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
