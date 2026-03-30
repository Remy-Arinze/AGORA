'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
    useGetAssessmentByIdQuery,
    useSubmitAssessmentMutation,
    useGetMyStudentProfileQuery,
    type AssessmentQuestion,
} from '@/lib/store/api/schoolAdminApi';
import {
    ArrowLeft,
    Clock,
    Award,
    CheckCircle2,
    Loader2,
    Send,
    AlertCircle,
    Info
} from 'lucide-react';
import { ConfirmModal } from '@/components/ui/Modal';
import { FadeInUp } from '@/components/ui/FadeInUp';
import toast from 'react-hot-toast';

export default function StudentAssessmentPage() {
    const params = useParams();
    const router = useRouter();
    const assessmentId = params.id as string;

    const { data: studentResponse } = useGetMyStudentProfileQuery();
    const schoolId = studentResponse?.data?.enrollments?.[0]?.school?.id;
    const studentId = studentResponse?.data?.id;

    const { data: assessmentResponse, isLoading: isLoadingAssessment } = useGetAssessmentByIdQuery(
        { schoolId: schoolId!, assessmentId },
        { skip: !schoolId || !assessmentId }
    );
    const assessment = assessmentResponse?.data; // Use data from ResponseDto

    const [submitAssessment, { isLoading: isSubmitting }] = useSubmitAssessmentMutation();

    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [isStarted, setIsStarted] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [pendingUnansweredCount, setPendingUnansweredCount] = useState(0);

    // Find student's submission if it exists
    const submission = assessment?.submissions?.find(s => s.studentId === studentId);
    const isSubmitted = !!submission;
    const isGraded = submission?.status === 'GRADED';

    const handleAnswerChange = (questionId: string, value: any) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const performSubmission = async () => {
        if (!assessment || !schoolId) return;

        try {
            const dtoAnswers = assessment.questions?.map((q: AssessmentQuestion) => {
                const answer = answers[q.id];
                if (q.type === 'MULTIPLE_CHOICE') {
                    return { questionId: q.id, selectedOption: answer };
                } else {
                    return { questionId: q.id, text: answer };
                }
            }) || [];

            await submitAssessment({
                schoolId,
                assessmentId,
                dto: { answers: dtoAnswers }
            }).unwrap();

            toast.success('Assessment submitted successfully!');
            router.back();
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to submit assessment');
        }
    };

    const handleSubmit = async () => {
        if (!assessment) return;

        // Check if all questions are answered
        const unansweredCount = assessment.questions?.filter(q => !answers[q.id]).length || 0;
        if (unansweredCount > 0) {
            setPendingUnansweredCount(unansweredCount);
            setIsConfirmModalOpen(true);
            return;
        }

        await performSubmission();
    };

    if (isLoadingAssessment || assessment === undefined) {
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
        <ProtectedRoute roles={['STUDENT']}>
            <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
                {/* Header */}
                <FadeInUp from={{ opacity: 0, y: -20 }} to={{ opacity: 1, y: 0 }} duration={0.5}>
                    <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Class
                    </Button>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Badge variant={assessment.type === 'EXAM' ? 'danger' : assessment.type === 'QUIZ' ? 'primary' : 'success'}>
                                    {assessment.type}
                                </Badge>
                                <span className={`text-xs font-bold uppercase tracking-wider ${isSubmitted ? 'text-green-500' : 'text-amber-500'}`}>
                                    {isSubmitted ? (isGraded ? 'Graded' : 'Submitted') : 'Pending'}
                                </span>
                            </div>
                            <h1 className="font-black text-light-text-primary dark:text-dark-text-primary uppercase tracking-tight" style={{ fontSize: 'var(--text-page-title)' }}>
                                {assessment.title}
                            </h1>
                            <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1 max-w-2xl" style={{ fontSize: 'var(--text-regular)' }}>
                                {assessment.description || 'No description provided.'}
                            </p>
                        </div>
                        {isGraded && (
                            <div className="bg-green-600 text-white p-4 rounded-2xl shadow-lg border-b-4 border-green-800 flex flex-col items-center justify-center min-w-[120px]">
                                <span className="font-bold uppercase tracking-widest opacity-80" style={{ fontSize: 'var(--text-tiny)' }}>Final Score</span>
                                <span className="font-black" style={{ fontSize: 'var(--text-stat-value)', lineHeight: 1 }}>{submission.totalScore} / {assessment.maxScore}</span>
                            </div>
                        )}
                    </div>
                </FadeInUp>

                {/* Status Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-light-surface/50 dark:bg-dark-surface/50 border-none">
                        <CardContent className="p-4 flex items-center gap-3">
                            <Clock className="h-5 w-5 text-blue-500" />
                            <div>
                                <p className="text-[10px] font-bold text-light-text-muted uppercase tracking-widest">Due Date</p>
                                <p className="text-sm font-bold">{assessment.dueDate ? new Date(assessment.dueDate).toLocaleDateString() : 'No deadline'}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-light-surface/50 dark:bg-dark-surface/50 border-none">
                        <CardContent className="p-4 flex items-center gap-3">
                            <Award className="h-5 w-5 text-purple-500" />
                            <div>
                                <p className="text-[10px] font-bold text-light-text-muted uppercase tracking-widest">Max Points</p>
                                <p className="text-sm font-bold">{assessment.maxScore} pts</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-light-surface/50 dark:bg-dark-surface/50 border-none">
                        <CardContent className="p-4 flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <div>
                                <p className="text-[10px] font-bold text-light-text-muted uppercase tracking-widest">Questions</p>
                                <p className="text-sm font-bold">{assessment.questions?.length || 0} Items</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {!isSubmitted ? (
                    !isStarted ? (
                        <Card className="overflow-hidden border-2 border-blue-100 dark:border-blue-900/30">
                            <CardContent className="p-8 text-center space-y-6">
                                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
                                    <Info className="h-10 w-10" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold">Ready to start?</h2>
                                    <p className="text-light-text-secondary dark:text-dark-text-secondary max-w-md mx-auto">
                                        Once you start, please ensure you have a stable internet connection. You can submit your answers once you've completed all questions.
                                    </p>
                                </div>
                                <Button
                                    size="md"
                                    className="px-12 bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 text-lg rounded-xl shadow-xl"
                                    onClick={() => setIsStarted(true)}
                                >
                                    Start Assessment
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-8">
                            <div className="space-y-6">
                                {assessment.questions?.map((q, idx: number) => (
                                    <FadeInUp key={q.id} delay={idx * 0.1}>
                                        <Card className="overflow-hidden bg-light-card dark:bg-dark-surface border-none shadow-md">
                                            <CardContent className="p-6 md:p-8">
                                                <div className="flex items-start justify-between mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <span className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black">
                                                            {idx + 1}
                                                        </span>
                                                        <h3 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
                                                            {q.text}
                                                        </h3>
                                                    </div>
                                                    <Badge variant="outline" className="text-[10px] font-bold opacity-60">
                                                        {q.points} PTS
                                                    </Badge>
                                                </div>

                                                {q.type === 'MULTIPLE_CHOICE' ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {(Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]')).map((option: string, optIdx: number) => (
                                                            <button
                                                                key={optIdx}
                                                                className={`p-4 text-left border-2 rounded-xl transition-all font-medium flex items-center gap-4 ${answers[q.id] === option
                                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-inner'
                                                                    : 'border-light-border dark:border-dark-border hover:border-blue-300 dark:hover:border-blue-700'
                                                                    }`}
                                                                onClick={() => handleAnswerChange(q.id, option)}
                                                            >
                                                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${answers[q.id] === option
                                                                    ? 'bg-blue-500 text-white shadow-md'
                                                                    : 'bg-light-zinc dark:bg-dark-zinc opacity-50'
                                                                    }`}>
                                                                    {String.fromCharCode(65 + optIdx)}
                                                                </span>
                                                                {option}
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : q.type === 'SHORT_ANSWER' ? (
                                                    <Input
                                                        placeholder="Type your answer here..."
                                                        value={answers[q.id] || ''}
                                                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                        className="h-12 text-lg"
                                                    />
                                                ) : (
                                                    <Textarea
                                                        placeholder="Write your detailed response here..."
                                                        value={answers[q.id] || ''}
                                                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                        className="min-h-[200px] text-lg p-6 bg-light-zinc/30 dark:bg-dark-zinc/30"
                                                    />
                                                )}
                                            </CardContent>
                                        </Card>
                                    </FadeInUp>
                                ))}
                            </div>

                            <div className="flex flex-col items-center gap-4 py-8">
                                <Button
                                    size="md"
                                    className="px-12 bg-green-600 hover:bg-green-700 text-white font-bold h-16 text-xl rounded-2xl shadow-2xl gap-3 w-full md:w-auto"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    ) : (
                                        <Send className="h-6 w-6" />
                                    )}
                                    Submit Assessment
                                </Button>
                                <p className="text-light-text-muted text-sm font-medium">Please review your answers before submitting.</p>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="space-y-8">
                        <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-blue-900 dark:text-blue-300">Assessment Submitted</h3>
                                    <p className="text-sm text-blue-700 dark:text-blue-400">
                                        Submitted on {new Date(submission.submittedAt).toLocaleString()}
                                    </p>
                                </div>
                                {isGraded && (
                                    <div className="ml-auto text-right">
                                        <p className="text-[10px] font-black text-blue-600/60 uppercase tracking-widest leading-none">Status</p>
                                        <p className="text-xl font-black text-blue-700 dark:text-blue-400 leading-tight">GRADED</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {isGraded && submission.teacherFeedback && (
                            <Card className="border-l-4 border-l-purple-500 overflow-hidden">
                                <CardContent className="p-6">
                                    <h3 className="text-sm font-bold text-light-text-muted uppercase tracking-widest mb-2">Teacher's Feedback</h3>
                                    <p className="text-lg italic text-light-text-primary dark:text-dark-text-primary">
                                        "{submission.teacherFeedback}"
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        <div className="space-y-6">
                            {assessment.questions?.map((q, idx: number) => {
                                const answer = submission.answers?.find(a => a.questionId === q.id);
                                return (
                                    <Card key={q.id} className="opacity-90">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-8 h-8 rounded-full bg-light-zinc dark:bg-dark-zinc flex items-center justify-center font-bold text-sm">
                                                        {idx + 1}
                                                    </span>
                                                    <h3 className="font-bold text-lg">{q.text}</h3>
                                                </div>
                                                {isGraded && (
                                                    <Badge variant="outline" className="font-bold">
                                                        {answer?.score || 0} / {q.points} Points
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="bg-light-zinc/20 dark:bg-dark-zinc/20 p-4 rounded-xl border border-light-border dark:border-dark-border">
                                                <p className="text-xs font-bold text-light-text-muted uppercase tracking-widest mb-2">Your Answer</p>
                                                <p className="text-sm">
                                                    {q.type === 'MULTIPLE_CHOICE'
                                                        ? (answer?.selectedOption || 'Not answered')
                                                        : (answer?.text || 'Not answered')}
                                                </p>
                                            </div>

                                            {isGraded && answer?.teacherFeedback && (
                                                <div className="mt-4 flex items-start gap-2 bg-purple-50 dark:bg-purple-900/10 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                                                    <AlertCircle className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5" />
                                                    <p className="text-xs text-purple-700 dark:text-purple-300">
                                                        <span className="font-bold">Feedback:</span> {answer.teacherFeedback}
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}
                <ConfirmModal
                    isOpen={isConfirmModalOpen}
                    onClose={() => setIsConfirmModalOpen(false)}
                    onConfirm={performSubmission}
                    title="Unanswered Questions"
                    message={`You have ${pendingUnansweredCount} unanswered question${pendingUnansweredCount !== 1 ? 's' : ''}. Are you sure you want to submit?`}
                    confirmText="Submit Anyway"
                    cancelText="Go Back"
                    variant="warning"
                    isLoading={isSubmitting}
                />
            </div>
        </ProtectedRoute>
    );
}
