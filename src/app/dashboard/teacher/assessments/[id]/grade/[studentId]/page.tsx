'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
    useGetAssessmentByIdQuery,
    useGradeAssessmentSubmissionMutation,
    useGetMyTeacherSchoolQuery,
    type AssessmentAnswer
} from '@/lib/store/api/schoolAdminApi';
import {
    ArrowLeft,
    CheckCircle2,
    Loader2,
    Sparkles,
    MessageSquare,
    Save
} from 'lucide-react';
import { FadeInUp } from '@/components/ui/FadeInUp';
import toast from 'react-hot-toast';

export default function GradeAssessmentPage() {
    const params = useParams();
    const router = useRouter();
    const assessmentId = params.id as string;
    const studentId = params.studentId as string;

    const { data: schoolResponse } = useGetMyTeacherSchoolQuery();
    const schoolId = schoolResponse?.data?.id;

    const { data: assessmentResponse, isLoading: isLoadingAssessment } = useGetAssessmentByIdQuery(
        { schoolId: schoolId!, assessmentId },
        { skip: !schoolId || !assessmentId }
    );
    const assessment = assessmentResponse?.data || assessmentResponse;

    const submission = assessment?.submissions?.find((s: any) => s.studentId === studentId);
    const [gradeSubmission, { isLoading: isGrading }] = useGradeAssessmentSubmissionMutation();

    const [questionScores, setQuestionScores] = useState<Record<string, number>>({});
    const [questionFeedback, setQuestionFeedback] = useState<Record<string, string>>({});
    const [overallFeedback, setOverallFeedback] = useState('');
    const [totalScore, setTotalScore] = useState(0);

    useEffect(() => {
        if (submission) {
            const initialScores: Record<string, number> = {};
            const initialFeedback: Record<string, string> = {};

            submission.answers?.forEach((ans: AssessmentAnswer) => {
                initialScores[ans.questionId] = ans.score || 0;
                initialFeedback[ans.questionId] = ans.teacherFeedback || '';
            });

            setQuestionScores(initialScores);
            setQuestionFeedback(initialFeedback);
            setOverallFeedback(submission.teacherFeedback || '');
            setTotalScore(submission.totalScore || 0);
        }
    }, [submission]);

    useEffect(() => {
        const sum = Object.values(questionScores).reduce((a, b) => a + b, 0);
        setTotalScore(sum);
    }, [questionScores]);

    const handleScoreChange = (questionId: string, score: number, maxPoints: number) => {
        if (score > maxPoints) score = maxPoints;
        if (score < 0) score = 0;
        setQuestionScores(prev => ({ ...prev, [questionId]: score }));
    };

    const handleFeedbackChange = (questionId: string, feedback: string) => {
        setQuestionFeedback(prev => ({ ...prev, [questionId]: feedback }));
    };

    const handleSubmit = async () => {
        if (!submission) return;

        try {
            await gradeSubmission({
                schoolId: schoolId!,
                submissionId: submission.id,
                dto: {
                    totalScore,
                    teacherFeedback: overallFeedback,
                    questionScores,
                    questionFeedback
                }
            }).unwrap();

            toast.success('Assessment graded successfully!');
            router.back();
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to submit grade');
        }
    };

    if (isLoadingAssessment) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!assessment || !submission) {
        return (
            <div className="p-8 text-center max-w-md mx-auto">
                <Card>
                    <CardContent className="pt-8">
                        <p className="mb-4">No submission found for this student.</p>
                        <Button onClick={() => router.back()} className="w-full">
                            Go Back
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <ProtectedRoute roles={['TEACHER']}>
            <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
                {/* Header */}
                <FadeInUp from={{ opacity: 0, y: -20 }} to={{ opacity: 1, y: 0 }} duration={0.5}>
                    <div className="flex items-center justify-between mb-6">
                        <Button variant="ghost" onClick={() => router.back()}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Submissions
                        </Button>
                        <Badge className="bg-blue-600">
                            {totalScore} / {assessment.maxScore}
                        </Badge>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
                            Grade Submission
                        </h1>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary">
                            Student: <span className="font-bold text-light-text-primary dark:text-dark-text-primary">{submission.student?.firstName} {submission.student?.lastName}</span>
                        </p>
                        <p className="text-sm text-light-text-muted">
                            Assessment: {assessment.title}
                        </p>
                    </div>
                </FadeInUp>

                {/* Questions and Answers */}
                <div className="space-y-6">
                    {assessment.questions?.map((q: any, idx: number) => {
                        const answer = submission.answers?.find((a: any) => a.questionId === q.id);
                        return (
                            <FadeInUp key={q.id} delay={idx * 0.1}>
                                <Card className="overflow-hidden border-l-4 border-l-blue-500">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="space-y-1">
                                                <h3 className="font-bold text-lg">Question {idx + 1}</h3>
                                                <p className="text-light-text-primary dark:text-dark-text-primary">{q.text}</p>
                                                <Badge variant="outline" className="text-[10px] uppercase">{q.type.replace('_', ' ')}</Badge>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-bold text-light-text-muted uppercase tracking-wider">Points</span>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="number"
                                                        className="w-16 h-8 text-center font-bold"
                                                        value={questionScores[q.id] || 0}
                                                        onChange={(e) => handleScoreChange(q.id, Number(e.target.value), q.points)}
                                                        max={q.points}
                                                        min={0}
                                                    />
                                                    <span className="text-sm font-bold opacity-50">/ {q.points}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-light-zinc/30 dark:bg-dark-zinc/30 p-4 rounded-xl border border-light-border dark:border-dark-border mb-4">
                                            <p className="text-xs font-bold text-light-text-muted uppercase tracking-widest mb-2">Student Answer</p>
                                            <p className="text-sm italic">
                                                {q.type === 'MULTIPLE_CHOICE'
                                                    ? (answer?.selectedOption || 'No option selected')
                                                    : (answer?.text || 'No answer provided')}
                                            </p>

                                            {q.type === 'MULTIPLE_CHOICE' && q.correctAnswer && (
                                                <div className="mt-3 flex items-center gap-2">
                                                    <Badge variant={answer?.selectedOption === q.correctAnswer ? 'success' : 'danger'} className="text-[10px]">
                                                        {answer?.selectedOption === q.correctAnswer ? 'Correct' : 'Incorrect'}
                                                    </Badge>
                                                    <span className="text-xs text-light-text-muted">Correct Answer: <span className="font-bold text-green-600">{q.correctAnswer}</span></span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-xs font-bold text-light-text-muted uppercase tracking-wider">
                                                <MessageSquare className="h-3 w-3" />
                                                Feedback for student
                                            </div>
                                            <Input
                                                placeholder="Add specific feedback for this answer..."
                                                value={questionFeedback[q.id] || ''}
                                                onChange={(e) => handleFeedbackChange(q.id, e.target.value)}
                                                className="text-sm"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </FadeInUp>
                        );
                    })}
                </div>

                {/* Overall Feedback */}
                <FadeInUp delay={0.3}>
                    <Card className="bg-blue-50/30 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                        <CardHeader>
                            <CardTitle className="text-blue-700 dark:text-blue-300">Overall Assessment Feedback</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <textarea
                                className="w-full min-h-[120px] p-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-white/50 dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Provide overall feedback on the student's performance..."
                                value={overallFeedback}
                                onChange={(e) => setOverallFeedback(e.target.value)}
                            />

                            <div className="flex items-center justify-between pt-4 border-t border-blue-200 dark:border-blue-800">
                                <div className="text-blue-700 dark:text-blue-300">
                                    <p className="text-xs font-bold uppercase tracking-widest">Final Calculated Score</p>
                                    <p className="text-3xl font-black">{totalScore} <span className="text-sm font-normal opacity-60">/ {assessment.maxScore}</span></p>
                                </div>
                                <Button
                                    size="lg"
                                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-8"
                                    onClick={handleSubmit}
                                    isLoading={isGrading}
                                >
                                    <Save className="h-4 w-4" />
                                    Submit Final Grade
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </FadeInUp>
            </div>
        </ProtectedRoute>
    );
}
