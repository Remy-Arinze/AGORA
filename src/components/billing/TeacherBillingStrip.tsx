'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { useGetBillingUiFlagsQuery } from '@/lib/store/api/subscriptionsApi';

export function TeacherBillingStrip() {
  const user = useSelector((s: RootState) => s.auth.user);
  const skip = user?.role !== 'TEACHER';

  const { data } = useGetBillingUiFlagsQuery(undefined, { skip });

  const limited =
    data?.data?.teacherBillingLimited === true || data?.data?.teacherReadOnlyMode === true;
  if (skip || !limited) return null;

  return (
    <div className="sticky top-0 z-[55] border-b border-slate-200 bg-slate-100/95 dark:bg-slate-900/95 dark:border-slate-700 px-4 py-2 text-center text-sm text-slate-800 dark:text-slate-200">
      Your school&apos;s subscription needs attention from an administrator. You can review information, but changes
      may be blocked until they renew or update the plan.
    </div>
  );
}
