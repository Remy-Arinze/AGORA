'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { usePermissionFilteredSidebar } from '@/hooks/useSidebarConfig';

export default function AdminDashboard() {
  const router = useRouter();
  const { sections, isLoadingPermissions } = usePermissionFilteredSidebar();

  useEffect(() => {
    if (isLoadingPermissions) return;

    // Find the first accessible link from the sidebar sections
    const firstAccessibleLink = sections.flatMap((section) => section.items)[0]?.href;

    // Redirect to the first accessible page, or fallback to overview (which will show Access Denied if truly no access)
    router.replace(firstAccessibleLink || '/dashboard/school/overview');
  }, [router, sections, isLoadingPermissions]);

  return (
    <ProtectedRoute roles={['SCHOOL_ADMIN']}>
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    </ProtectedRoute>
  );
}

