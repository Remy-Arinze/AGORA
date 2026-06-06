'use client';

import { useTheme } from '@/contexts/ThemeContext';
import type { Theme } from '@/contexts/ThemeContext';
import { Button } from './Button';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const CYCLE: Theme[] = ['light', 'dark', 'system'];

// Sun icon
const SunIcon = () => (
  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

// Moon icon
const MoonIcon = () => (
  <svg className="w-5 h-5 text-gray-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

// Monitor / system icon
const SystemIcon = () => (
  <svg className="w-5 h-5 text-[var(--agora-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LABELS: Record<Theme, string> = {
  light: 'Switch to dark mode',
  dark: 'Switch to system default',
  system: 'Switch to light mode',
};

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleClick = () => {
    const next = CYCLE[(CYCLE.indexOf(theme) + 1) % CYCLE.length];
    setTheme(next);
  };

  // Don't render until mounted so the icon always matches the real stored theme
  if (!mounted) {
    return <div className={cn('h-9 w-9', className)} />;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={cn('relative p-0 h-9 w-9', className)}
      aria-label={LABELS[theme]}
      title={LABELS[theme]}
    >
      {theme === 'light'  && <SunIcon />}
      {theme === 'dark'   && <MoonIcon />}
      {theme === 'system' && <SystemIcon />}
    </Button>
  );
}
