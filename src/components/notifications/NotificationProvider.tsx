'use client';

import React, { ReactNode } from 'react';
import { useTeacherNotifications } from '@/hooks/useTeacherNotifications';
import { useStudentNotifications } from '@/hooks/useStudentNotifications';

/**
 * Global Notification Provider that initializes the real-time notification hooks.
 * This should be wrapped around the dashboard layout.
 */
export function NotificationProvider({ children }: { children: ReactNode }) {
    // Initialize the real-time notification listeners
    useTeacherNotifications();
    useStudentNotifications();

    return <>{children}</>;
}
