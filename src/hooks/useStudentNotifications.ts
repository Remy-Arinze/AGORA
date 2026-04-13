'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import toast from 'react-hot-toast';

interface StudentNotificationPayload {
    type: string;
    assessmentTitle: string;
    subjectName: string;
    assessmentId: string;
    teacherName?: string;
    score?: number;
    maxScore?: number;
    timestamp: string;
}

/**
 * Hook that opens an SSE connection to the backend notification stream
 * and shows real-time toast notifications for student-specific events
 * like new assessments and published grades.
 * Only active for STUDENT role users.
 */
export function useStudentNotifications() {
    const user = useSelector((state: RootState) => state.auth.user);
    const accessToken = useSelector((state: RootState) => (state.auth as any).accessToken);
    const reduxSchoolId = useSelector((state: RootState) => (state.auth as any).currentSchoolId);
    const schoolId = reduxSchoolId || (user as any)?.schoolId;

    const eventSourceRef = useRef<EventSource | null>(null);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const retryCountRef = useRef(0);
    const MAX_RETRIES = 5;

    const connect = useCallback(() => {
        if (!schoolId || !accessToken || user?.role !== 'STUDENT') return;

        // Close any existing connection
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const url = `${envUrl}/schools/${schoolId}/notifications/stream?token=${encodeURIComponent(accessToken)}`;

        const es = new EventSource(url);
        eventSourceRef.current = es;

        es.onopen = () => {
            console.log('Student SSE connection opened');
            retryCountRef.current = 0;
        };

        es.addEventListener('connected', () => {
            console.log('Student SSE stream connected');
            retryCountRef.current = 0;
        });

        es.addEventListener('notification', (event) => {
            try {
                const data: StudentNotificationPayload = JSON.parse(event.data);

                if (data.type === 'ASSESSMENT_PUBLISHED') {
                    toast.success(
                        `🚀 New ${data.subjectName} Assessment: ${data.assessmentTitle} published by ${data.teacherName || 'your teacher'}!`,
                        {
                            duration: 8000,
                            icon: '📖',
                            style: {
                                borderRadius: '16px',
                                background: 'white',
                                color: '#1e293b',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                fontWeight: '600'
                            }
                        }
                    );
                } else if (data.type === 'GRADE_PUBLISHED') {
                    toast.success(
                        `🎉 Your results for ${data.assessmentTitle} (${data.subjectName}) are out! Score: ${data.score}/${data.maxScore}`,
                        {
                            duration: 10000,
                            icon: '🏆',
                            style: {
                                borderRadius: '16px',
                                background: '#f0f9ff',
                                color: '#0369a1',
                                border: '1px solid #bae6fd',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                fontWeight: '700'
                            }
                        }
                    );
                }
            } catch (err) {
                console.error('Error parsing student notification:', err);
            }
        });

        es.onerror = (err) => {
            console.warn('Student SSE error, retrying...', err);
            es.close();
            eventSourceRef.current = null;

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
