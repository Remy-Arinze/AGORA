'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SidebarNew } from '@/components/layout/SidebarNew';
import { Navbar } from '@/components/layout/Navbar';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/lib/store/store';
import { cn } from '@/lib/utils';

function MainContent({ children }: { children: React.ReactNode }) {
  const { open } = useSidebar();

  return (
    <main
      className={cn(
        "flex-1 p-4 md:p-8 transition-all duration-300 bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] scrollbar-hide overflow-y-auto",
        open ? "md:ml-[250px]" : "md:ml-[80px]"
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
    <div className="h-screen bg-[var(--light-bg)] dark:bg-[var(--dark-bg)] transition-colors duration-200 flex flex-col overflow-hidden">
      {showNavbar && <Navbar />}
      <div className={cn(
        "flex flex-1 overflow-hidden relative",
        showNavbar && "pt-16"
      )}>
        <SidebarNew hideMobileHeader={showNavbar} />
        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

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
      <SidebarProvider open={open} setOpen={setOpen} animate={true}>
        <DashboardContent>{children}</DashboardContent>
      </SidebarProvider>
    </ProtectedRoute>
  );
}

