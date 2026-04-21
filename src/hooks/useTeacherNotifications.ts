'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import toast from 'react-hot-toast';

interface NotificationPayload {
    type: string;
    studentName?: string;
    assessmentTitle?: string;
    subjectName?: string;
    assessmentId?: string;
    submissionId?: string;
    timestamp: string;
    // Student reassignment fields
    sourceClassName?: string;
    targetClassName?: string;
    sourceClassId?: string;
    targetClassId?: string;
}

/**
 * Hook that opens an SSE connection to the backend notification stream
 * and shows real-time toast notifications for assessment submissions.
 * Only active for TEACHER role users.
 */
export function useTeacherNotifications() {
    const user = useSelector((state: RootState) => state.auth.user);
    const accessToken = useSelector((state: RootState) => (state.auth as any).accessToken);
    const reduxSchoolId = useSelector((state: RootState) => (state.auth as any).currentSchoolId);
    const schoolId = reduxSchoolId || (user as any)?.schoolId;

    const eventSourceRef = useRef<EventSource | null>(null);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const retryCountRef = useRef(0);
    const MAX_RETRIES = 5;

    const connect = useCallback(() => {
        if (!schoolId || !accessToken || user?.role !== 'TEACHER') return;

        // Close any existing connection
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const url = `${envUrl}/schools/${schoolId}/notifications/stream?token=${encodeURIComponent(accessToken)}`;

        const es = new EventSource(url);
        eventSourceRef.current = es;

        es.addEventListener('connected', () => {
            retryCountRef.current = 0; // Reset retry counter on successful connection
        });

        es.addEventListener('notification', (event) => {
            try {
                const data: NotificationPayload = JSON.parse(event.data);

                if (data.type === 'ASSESSMENT_SUBMITTED') {
                    toast(
                        `📝 ${data.studentName} just submitted their ${data.subjectName} ${data.assessmentTitle}`,
                        {
                            duration: 6000,
                            icon: '🔔',
                            style: {
                                borderRadius: '16px',
                                background: 'var(--light-card)',
                                color: 'var(--light-text-primary)',
                                fontWeight: '600',
                                fontSize: 'var(--text-body)',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                border: '1px solid var(--light-border)',
                            },
                        }
                    );
                } else if (data.type === 'STUDENT_REASSIGNED') {
                    const message = data.targetClassName 
                        ? `🔄 ${data.studentName} reassigned: ${data.sourceClassName} ➡️ ${data.targetClassName}`
                        : `🔄 ${data.studentName} reassigned from ${data.sourceClassName}`;

                    toast(message, {
                        duration: 8000,
                        icon: '🏫',
                        style: {
                            borderRadius: '16px',
                            background: 'var(--light-card)',
                            color: 'var(--light-text-primary)',
                            fontWeight: '600',
                            fontSize: 'var(--text-body)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                            border: '1px solid var(--light-border)',
                        },
                    });
                }
            } catch {
                // Ignore malformed events
            }
        });

        es.onerror = () => {
            es.close();
            eventSourceRef.current = null;

            // Exponential backoff retry
            if (retryCountRef.current < MAX_RETRIES) {
                const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000);
                retryCountRef.current++;
                retryTimeoutRef.current = setTimeout(connect, delay);
            }
        };
    }, [schoolId, accessToken, user?.role]);

    useEffect(() => {
        connect();

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, [connect]);
}
