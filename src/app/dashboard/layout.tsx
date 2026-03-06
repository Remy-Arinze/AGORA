'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SidebarNew } from '@/components/layout/SidebarNew';
import { Navbar } from '@/components/layout/Navbar';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/lib/store/store';
import { cn } from '@/lib/utils';

function MainContent({ children, showNavbar }: { children: React.ReactNode, showNavbar: boolean }) {
  return (
    <main
      className={cn(
        "flex-1 min-h-screen transition-all duration-300 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] scrollbar-hide overflow-y-auto overflow-x-hidden w-full",
        // Leave 250px on desktop for the fixed sidebar
        "md:ml-[250px]",
        // Leave padding on top if Navbar or mobile header is present
        showNavbar ? "pt-[80px] md:pt-[100px]" : "pt-[80px] md:pt-8",
        // Generous bottom padding for scrolling
        "px-4 pb-20 md:px-8"
      )}
    >
      {children}
    </main>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const userRole = useSelector((state: RootState) => state.auth.user?.role);

  // Hide navbar for SUPER_ADMIN and SCHOOL_ADMIN
  const showNavbar = userRole !== 'SUPER_ADMIN' && userRole !== 'SCHOOL_ADMIN';

  return (
    <div className="min-h-screen bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] transition-colors duration-200 flex overflow-hidden w-full relative">
      {showNavbar && <Navbar />}
      <SidebarNew hideMobileHeader={showNavbar} />
      <MainContent showNavbar={showNavbar}>{children}</MainContent>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  // Hide scrollbar on dashboard
  useEffect(() => {
    document.documentElement.classList.add('scrollbar-hide');
    document.body.classList.add('scrollbar-hide');

    return () => {
      document.documentElement.classList.remove('scrollbar-hide');
      document.body.classList.remove('scrollbar-hide');
    };
  }, []);

  return (
    <ProtectedRoute>
      <SidebarProvider animate={true}>
        <DashboardContent>{children}</DashboardContent>
      </SidebarProvider>
    </ProtectedRoute>
  );
}

