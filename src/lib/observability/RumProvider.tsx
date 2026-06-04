'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/lib/store/store';
import { initOpenObserve, setRumUser, clearRumUser } from './openobserve-rum';

/**
 * Boots OpenObserve RUM once on mount, then keeps the RUM user context
 * in sync with the Redux auth state whenever the user logs in or out.
 *
 * Mount this inside StoreProvider so it has access to the Redux store.
 */
export function RumProvider({ children }: { children: React.ReactNode }) {
  const user = useSelector((state: RootState) => state.auth.user);

  // Initialise once
  useEffect(() => {
    initOpenObserve();
  }, []);

  // Keep user context in sync
  useEffect(() => {
    if (user) {
      setRumUser({
        id: user.id,
        name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || user.id,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
      });
    } else {
      clearRumUser();
    }
  }, [user]);

  return <>{children}</>;
}
