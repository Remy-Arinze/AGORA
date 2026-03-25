'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import {
    useGetAssessmentByIdQuery,
    useGetClassStudentsQuery,
    useGetMyTeacherSchoolQuery,
    type AssessmentType,
    type QuestionType
} from '@/lib/store/api/schoolAdminApi';
import {
    ArrowLeft,
    FileText,
    Users,
    CheckCircle2,
    Clock,
    Calendar,
    Award,
    ChevronRight,
    Loader2,
    Sparkles
} from 'lucide-react';
import { FadeInUp } from '@/components/ui/FadeInUp';
import toast from 'react-hot-toast';

export default function AssessmentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const assessmentId = params.id as string;
    const [activeTab, setActiveTab] = useState<'submissions' | 'questions'>('submissions');

    const { data: schoolResponse } = useGetMyTeacherSchoolQuery();
    const schoolId = schoolResponse?.data?.id;

    const { data: assessmentResponse, isLoading: isLoadingAssessment } = useGetAssessmentByIdQuery(
        { schoolId: schoolId!, assessmentId },
        { skip: !schoolId || !assessmentId }
    );
    const assessment = assessmentResponse?.data; // Use data from ResponseDto

    const classId = assessment?.classId;

    const { data: studentsResponse, isLoading: isLoadingStudents } = useGetClassStudentsQuery(
        { schoolId: schoolId!, classId: classId! },
        { skip: !schoolId || !classId }
    );
    const students = studentsResponse?.data || []; // Use data from ResponseDto

    if (isLoadingAssessment) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!assessment) {
        return (
            <div className="p-8 text-center">
                <p>Assessment not found.</p>
                <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
            </div>
        );
    }

    return (
        <ProtectedRoute roles={['TEACHER']}>
            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
                {/* Header */}
                <FadeInUp from={{ opacity: 0, y: -20 }} to={{ opacity: 1, y: 0 }} duration={0.5}>
                    <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Badge variant={assessment.type === 'EXAM' ? 'danger' : assessment.type === 'QUIZ' ? 'primary' : 'success'}>
                                    {assessment.type}
                                </Badge>
                                <span className={`text-xs font-bold uppercase tracking-wider ${assessment.status === 'PUBLISHED' ? 'text-green-500' : 'text-amber-500'
                                    }`}>
                                    {assessment.status}
                                </span>
                            </div>
                            <h1 className="font-bold text-light-text-primary dark:text-dark-text-primary" style={{ fontSize: 'var(--text-page-title)' }}>
                                {assessment.title}
                            </h1>
                            <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1 max-w-2xl" style={{ fontSize: 'var(--text-page-subtitle)' }}>
                                {assessment.description || 'No description provided.'}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                toast.success('Link copied to clipboard!');
                            }}>
                                Copy Link
                            </Button>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                Edit Assessment
                            </Button>
                        </div>
                    </div>
                </FadeInUp>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Custom Tabs */}
                        <div className="border-b border-light-border dark:border-dark-border">
                            <div className="flex space-x-1">
                                {(['submissions', 'questions'] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => {
                                            const url = new URL(window.location.href);
                                            url.searchParams.set('tab', tab);
                                            window.history.replaceState({}, '', url);
                                            // Force re-render if needed, though local state is better
                                            setActiveTab(tab);
                                        }}
                                        className={`flex items-center gap-2 px-6 py-4 font-bold transition-all whitespace-nowrap border-b-2 uppercase tracking-wider ${activeTab === tab
                                                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                                                : 'border-transparent text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'
                                            }`}
                                        style={{ fontSize: 'var(--text-tiny)' }}
                                    >
                                        {tab === 'submissions' ? <Users className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {activeTab === 'submissions' && (
                            <section className="space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold">Student Submissions</h2>
                                    <span className="text-xs font-bold uppercase tracking-widest text-light-text-muted">Total: {students.length}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {students.map((student: any) => {
                                                const studentSubmission = assessment.submissions?.find((s: any) => s.studentId === student.id);
                                                const status = studentSubmission
                                                    ? (studentSubmission.status === 'GRADED' ? 'Graded' : 'Submitted')
                                                    : 'Pending';

                                                return (
                                                    <div
                                                        key={student.id}
                                                        className="flex items-center justify-between p-4 border border-light-border dark:border-dark-border rounded-xl hover:bg-light-surface/50 dark:hover:bg-dark-surface/50 transition-colors cursor-pointer"
                                                        onClick={() => router.push(`/dashboard/teacher/assessments/${assessmentId}/grade/${student.id}`)}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">
                                                                {student.firstName[0]}{student.lastName[0]}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                                                                    {student.firstName} {student.lastName}
                                                                </p>
                                                                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                                                    ID: {student.uid}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <Badge variant={status === 'Graded' ? 'success' : status === 'Submitted' ? 'primary' : 'outline'} className="text-xs uppercase">
                                                                {status}
                                                            </Badge>
                                                            <ChevronRight className="h-5 w-5 text-light-text-muted" />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                 </div>
                            </section>
                        )}
 
                        {activeTab === 'questions' && (
                             <div className="space-y-6">
                                 {assessment.questions?.map((q: any, idx: number) => (
                                     <Card key={q.id}>
                                         <CardContent className="pt-6">
                                             <div className="flex items-start justify-between mb-4">
                                                 <div className="flex items-center gap-3">
                                                     <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                                                         {idx + 1}
                                                     </span>
                                                     <div>
                                                         <p className="font-bold text-lg">{q.text}</p>
                                                         <span className="text-xs uppercase text-light-text-muted font-bold tracking-widest">{q.type.replace('_', ' ')}</span>
                                                     </div>
                                                 </div>
                                                 <Badge variant="outline">{q.points} Points</Badge>
                                             </div>

                                             {q.type === 'MULTIPLE_CHOICE' && q.options && (
                                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                                     {(Array.isArray(q.options) ? q.options : (typeof q.options === 'string' ? JSON.parse(q.options) : [])).map((opt: string, optIdx: number) => (
                                                         <div
                                                             key={optIdx}
                                                             className={`p-3 border rounded-xl flex items-center gap-3 ${opt === q.correctAnswer
                                                                 ? 'border-green-500 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-300'
                                                                 : 'border-light-border dark:border-dark-border '
                                                                 }`}
                                                         >
                                                             <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${opt === q.correctAnswer ? 'bg-green-500 text-white' : 'bg-light-bg dark:bg-dark-surface'
                                                                 }`}>
                                                                 {String.fromCharCode(65 + optIdx)}
                                                             </div>
                                                             <span className="text-sm">{opt}</span>
                                                         </div>
                                                     ))}
                                                 </div>
                                             )}

                                             {q.correctAnswer && q.type !== 'MULTIPLE_CHOICE' && (
                                                 <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl">
                                                     <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">Correct Answer</p>
                                                     <p className="text-sm">{q.correctAnswer}</p>
                                                 </div>
                                             )}
                                         </CardContent>
                                     </Card>
                                 ))}
                             </div>
                        )}
                    </div>

                    {/* Sidebar Stats */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Assessment Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <Clock className="h-4 w-4 text-light-text-muted" />
                                    <span className="text-light-text-secondary">Due Date:</span>
                                    <span className="font-bold ml-auto">{assessment.dueDate ? new Date(assessment.dueDate).toLocaleDateString() : 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Award className="h-4 w-4 text-light-text-muted" />
                                    <span className="text-light-text-secondary">Max Score:</span>
                                    <span className="font-bold ml-auto">{assessment.maxScore}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-light-text-muted" />
                                    <span className="text-light-text-secondary">Questions:</span>
                                    <span className="font-bold ml-auto">{assessment.questions?.length || 0}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="h-4 w-4 text-light-text-muted" />
                                    <span className="text-light-text-secondary">Created:</span>
                                    <span className="font-bold ml-auto">{new Date(assessment.createdAt).toLocaleDateString()}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-indigo-50 dark:bg-blue-600 border-0 overflow-hidden relative shadow-lg">
                            <Sparkles className="absolute top-[-10px] right-[-10px] h-24 w-24 opacity-10 dark:opacity-20 rotate-12 text-indigo-500 dark:text-white" />
                            <CardContent className="pt-6 relative z-10">
                                <h3 className="font-bold text-lg mb-2 text-indigo-900 dark:text-white">AI Grading Assistant</h3>
                                <p className="text-sm text-indigo-700/80 dark:text-white/90 mb-6 leading-relaxed">
                                    Speed up your work! Let our AI analyze essay and short answers based on your rubric.
                                </p>
                                <Button className="w-full bg-indigo-600 dark:bg-white text-white dark:text-blue-600 hover:bg-indigo-700 dark:hover:bg-blue-50 font-bold border-0 h-10">
                                    Open AI Grader
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
