'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark'; // what's actually applied
  setTheme: (t: Theme) => void;
  isDashboardRoute: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(resolved: 'light' | 'dark') {
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('agora-theme') as Theme | null;
    // Default to light if nothing stored (first visit)
    const initial: Theme = (stored === 'light' || stored === 'dark' || stored === 'system') ? stored : 'light';
    const resolved = initial === 'system' ? getSystemPreference() : initial;

    setThemeState(initial);
    setResolvedTheme(resolved);
    applyTheme(resolved);
    setMounted(true);
  }, []);

  // Listen for OS-level changes when theme is 'system'
  useEffect(() => {
    if (!mounted) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const resolved = e.matches ? 'dark' : 'light';
        setResolvedTheme(resolved);
        applyTheme(resolved);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    const resolved = newTheme === 'system' ? getSystemPreference() : newTheme;
    setThemeState(newTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
    // Always persist the chosen mode — including 'system' — so it survives reload
    localStorage.setItem('agora-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, isDashboardRoute: true }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
