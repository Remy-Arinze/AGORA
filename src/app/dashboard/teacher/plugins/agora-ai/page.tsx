'use client';

import { AgoraChat } from '@/components/ai/AgoraChat';
import { Sparkles, BrainCircuit, ShieldCheck, Zap } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useGetMyTeacherSchoolQuery } from '@/lib/store/api/schoolAdminApi';
import { FadeInUp } from '@/components/ui/FadeInUp';

export default function AgoraAIPage() {
    const { data: schoolResponse } = useGetMyTeacherSchoolQuery();
    const schoolId = schoolResponse?.data?.id;

    return (
        <ProtectedRoute roles={['TEACHER']}>
            <div className="min-h-screen bg-light-bg dark:bg-[transparent] text-light-text-primary dark:text-white overflow-hidden relative flex flex-col transition-colors duration-300">
                <div className="flex-1 w-full max-w-7xl mx-auto px-2 md:px-6 py-4 md:py-6 relative z-10 flex flex-col">
                    {/* Main Chat Interface */}
                    <FadeInUp duration={0.8} className="flex-1 flex flex-col">
                        {schoolId ? (
                            <AgoraChat schoolId={schoolId} />
                        ) : (
                            <div className="flex-1 flex items-center justify-center bg-light-card/50 dark:bg-white/5 italic text-light-text-muted dark:text-white/20">
                                Connecting to your school network...
                            </div>
                        )}
                    </FadeInUp>
                </div>
            </div>
        </ProtectedRoute>
    );
}
