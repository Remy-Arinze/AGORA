'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { SidebarBody, SidebarLink, useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getActivePluginsForTeacher } from '@/lib/plugins';
import { usePermissionFilteredSidebar, type NavItem } from '@/hooks/useSidebarConfig';
import { cn } from '@/lib/utils';
import { SchoolTypeSwitcher } from '@/components/dashboard/SchoolTypeSwitcher';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

function LogoSection() {
  const { open, setOpen } = useSidebar();

  return (
    <div className="mb-4 flex items-center justify-between group">
      <Link
        href="/"
        className="font-normal flex items-center justify-center md:justify-start py-1 px-3 relative z-20"
      >
        <Image
          src="/assets/logos/agora_main.png"
          alt="Agora"
          width={40}
          height={40}
          className="h-8 w-8 object-contain teacher-logo"
          priority
        />
      </Link>
    </div>
  );
}

function LogoutButton() {
  const { logout } = useAuth();
  const { open } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={logout}
      className="flex-1 justify-start gap-2 text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)] hover:bg-[var(--light-card)] dark:hover:bg-[var(--dark-surface)] h-9 px-2 overflow-hidden"
    >
      <LogOut className="h-4 w-4 flex-shrink-0" />
      <span className="font-semibold transition-opacity duration-200" style={{ fontSize: 'var(--text-body)' }}>
        Logout
      </span>
    </Button>
  );
}



export function SidebarNew({ hideMobileHeader }: { hideMobileHeader?: boolean }) {
  const user = useSelector((state: RootState) => state.auth.user);
  const pathname = usePathname();

  // Use permission-filtered sidebar config
  const { sections, isLoadingPermissions } = usePermissionFilteredSidebar();

  if (!user) return null;

  // Process sections and items into a flat-mapped version compatible with SidebarLink
  const processedSections = useMemo(() => {
    return sections.map(section => {
      // Filter out History for teachers
      let items = section.items.filter(item => item.href !== '/dashboard/teacher/history');
      
      return {
        ...section,
        items: items.map(item => {
          const Icon = item.icon;
          return {
            label: item.label,
            href: item.href,
            icon: <Icon className="h-5 w-5 flex-shrink-0" />
          };
        })
      };
    });
  }, [sections]);

  // Handle teacher plugins separately and merge them into the first section
  const finalSections = useMemo(() => {
    const base = [...processedSections];
    if (user.role === 'TEACHER') {
      const activePlugins = getActivePluginsForTeacher();
      if (activePlugins.length > 0 && base.length > 0) {
        const pluginItems = activePlugins.map((plugin) => {
          const isLois = plugin.slug === 'agora-ai';
          const Icon = plugin.icon;
          
          return {
            label: isLois ? 'LOIS' : plugin.name,
            href: `/dashboard/teacher/plugins/${plugin.slug}`,
            icon: isLois ? (
              <div className="h-5 w-5 flex items-center justify-center overflow-hidden">
                <Image 
                  src="/assets/logos/agora_main.png" 
                  alt="Lois" 
                  width={20} 
                  height={20} 
                  className="object-contain" 
                />
              </div>
            ) : <Icon className="h-5 w-5 flex-shrink-0" />,
          };
        });
        
        // Merge into the first section
        base[0] = {
          ...base[0],
          items: [...base[0].items, ...pluginItems]
        };
      }
    }
    return base;
  }, [processedSections, user.role]);
 
  // Show loading state for school admins while permissions load
  const showLoadingSkeleton = user.role === 'SCHOOL_ADMIN' && isLoadingPermissions;

  return (
    <SidebarBody className="justify-between gap-10" hideMobileHeader={hideMobileHeader}>
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
        <LogoSection />

        {/* Navigation Links */}
        <div className="flex flex-col gap-1 flex-1 mt-8">
          {showLoadingSkeleton ? (
            // Loading skeleton while permissions are being fetched
            <>
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="flex items-center gap-3 px-3 py-2 animate-pulse">
                  <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              ))}
            </>
          ) : (
            finalSections.map((section, sectionIdx) => (
              <div key={sectionIdx} className="flex flex-col gap-1">
                {section.title && (
                  <p className="sidebar-section-title px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 mb-2 mt-4">
                    {section.title}
                  </p>
                )}
                {section.items.map((link, idx) => {
                  // Check if there's an exact match for another link in the sidebar
                  // If there is, we don't want to highlight parent links (like /classes) 
                  // when we have a more specific link (like /classes/[id]) active
                  const hasExactMatchInSidebar = finalSections.some(s => 
                    s.items.some(i => i.href !== link.href && pathname === i.href)
                  );

                  const isActive =
                    pathname === link.href ||
                    (pathname.startsWith(link.href + '/') && !hasExactMatchInSidebar) ||
                    (link.href === '/dashboard/super-admin/overview' &&
                      pathname === '/dashboard/super-admin') ||
                    (link.href === '/dashboard/school/overview' &&
                      (pathname === '/dashboard/school' || pathname === '/dashboard')) ||
                    (link.href === '/dashboard/student/overview' &&
                      (pathname === '/dashboard/student' || pathname === '/dashboard')) ||
                    (link.href === '/dashboard/teacher/timetables' &&
                      (pathname === '/dashboard/teacher' || pathname === '/dashboard')) ||
                    (link.href === '/dashboard/teacher/overview' &&
                      (pathname === '/dashboard/teacher' || pathname === '/dashboard'));
                  
                  return (
                    <SidebarLink
                      key={idx}
                      link={link}
                      isActive={isActive}
                    />
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="pt-4 px-2 pb-3">
        {/* School Type Switcher - Handles ADMIN mixed schools */}
        {user.role === 'SCHOOL_ADMIN' && (
          <div className="mb-3 px-1">
            <SchoolTypeSwitcher />
          </div>
        )}
        <div className="border-t border-gray-200 dark:border-[var(--dark-border)] pt-4 flex items-center gap-2">
          <LogoutButton />
          <ThemeToggle className="h-7 w-7 min-w-[28px] focus-visible:ring-0 active:scale-95 transition-all" />
        </div>
      </div>
    </SidebarBody>
  );
}

