'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import type { Theme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

// ── Icons ────────────────────────────────────────────────────────────────────

const SunIcon = ({ className }: { className?: string }) => (
  <svg className={cn('w-4 h-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = ({ className }: { className?: string }) => (
  <svg className={cn('w-4 h-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const SystemIcon = ({ className }: { className?: string }) => (
  <svg className={cn('w-4 h-4', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const ChevronIcon = () => (
  <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

// ── Option config ─────────────────────────────────────────────────────────────

const OPTIONS: { value: Theme; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { value: 'light',  label: 'Light',  Icon: SunIcon   },
  { value: 'dark',   label: 'Dark',   Icon: MoonIcon  },
  { value: 'system', label: 'System', Icon: SystemIcon },
];

function TriggerIcon({ theme }: { theme: Theme }) {
  if (theme === 'dark')   return <MoonIcon   className="text-slate-300" />;
  if (theme === 'system') return <SystemIcon className="text-[var(--agora-blue,#2490FD)]" />;
  return                         <SunIcon    className="text-yellow-500" />;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ThemeDropdown({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!mounted) return <div className="h-9 w-9" />;

  return (
    <div ref={ref} className={cn('relative', className)}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select theme"
        className={cn(
          'flex items-center gap-1.5 h-9 px-2.5 rounded-lg text-sm font-medium',
          'transition-colors focus:outline-none',
          'hover:bg-black/5 dark:hover:bg-white/10',
          open && 'bg-black/5 dark:bg-white/10',
        )}
      >
        <TriggerIcon theme={theme} />
        <ChevronIcon />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          className={cn(
            'absolute right-0 top-full mt-2 w-36 z-50',
            'rounded-xl border border-black/10 dark:border-white/10',
            'bg-white dark:bg-[var(--dark-surface,#1f1f23)]',
            'shadow-lg shadow-black/10 dark:shadow-black/40',
            'py-1 overflow-hidden',
            'animate-in fade-in-0 zoom-in-95 duration-100',
          )}
        >
          {OPTIONS.map(({ value, label, Icon }) => {
            const active = theme === value;
            return (
              <button
                key={value}
                role="option"
                aria-selected={active}
                onClick={() => { setTheme(value); setOpen(false); }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors text-left',
                  active
                    ? 'bg-[var(--agora-blue,#2490FD)]/10 text-[var(--agora-blue,#2490FD)]'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10',
                )}
              >
                <Icon className={active ? 'text-[var(--agora-blue,#2490FD)]' : 'opacity-70'} />
                <span>{label}</span>
                {active && (
                  <svg className="ml-auto w-3.5 h-3.5 text-[var(--agora-blue,#2490FD)]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
