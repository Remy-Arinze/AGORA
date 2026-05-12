'use client';

import { ReactNode, useEffect } from 'react';
import { ProtectedSchoolRoute } from '@/components/permissions/ProtectedSchoolRoute';
import { SchoolBillingShell } from '@/components/billing/SchoolBillingShell';

/**
 * Layout for school admin pages
 * Applies permission-based route protection to all school admin routes
 */
export default function SchoolAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    // Apply a specific class to the body for targeting CSS variables for glassmorphism
    document.body.classList.add('school-dashboard-active');
    return () => {
      document.body.classList.remove('school-dashboard-active');
    };
  }, []);

  return (
    <ProtectedSchoolRoute>
      <SchoolBillingShell />
      {children}
    </ProtectedSchoolRoute>
  );
}

