'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
    Sparkles, 
    FileText, 
    FileQuestion, 
    Wand2, 
    Loader2, 
    CheckCircle2, 
    BarChart3, 
    Zap,
    MessageSquare
} from 'lucide-react';
import {
    useGenerateLessonPlanMutation,
    useGenerateAssessmentMutation,
    useGenerateQuizMutation,
} from '@/lib/store/api/aiApi';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface AgoraAiToolsProps {
    schoolId: string;
    defaultSubject?: string;
    defaultGradeLevel?: string;
    lockContext?: boolean;
}

export function AgoraAiTools({
    schoolId,
    defaultSubject = '',
    defaultGradeLevel = '',
    lockContext = false,
}: AgoraAiToolsProps) {
    const [generateLessonPlan, { isLoading: isGeneratingLessonPlan }] = useGenerateLessonPlanMutation();
    const [generateQuiz, { isLoading: isGeneratingQuiz }] = useGenerateQuizMutation();

    const [lessonPlanTopic, setLessonPlanTopic] = useState('');
    const [lessonPlanSubject, setLessonPlanSubject] = useState(defaultSubject);
    const [lessonPlanGrade, setLessonPlanGrade] = useState(defaultGradeLevel);
    const [generatedPlan, setGeneratedPlan] = useState<any>(null);

    const [quizTopic, setQuizTopic] = useState('');
    const [quizSubject, setQuizSubject] = useState(defaultSubject);
    const [quizGrade, setQuizGrade] = useState(defaultGradeLevel);
    const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);

    const handleGenerateLessonPlan = async () => {
        if (!schoolId) return;
        try {
            const response = await generateLessonPlan({
                schoolId,
                body: {
                    topic: lessonPlanTopic,
                    subject: lessonPlanSubject,
                    gradeLevel: lessonPlanGrade,
                    objectives: ['Understand key concepts', 'Apply knowledge practically'],
                },
            }).unwrap();
            setGeneratedPlan(response);
            toast.success('Lesson plan generated successfully!');
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to generate lesson plan');
        }
    };

    const handleGenerateQuiz = async () => {
        if (!schoolId) return;
        try {
            const response = await generateQuiz({
                schoolId,
                body: {
                    topic: quizTopic,
                    subject: quizSubject,
                    gradeLevel: quizGrade,
                    questionCount: 5,
                    questionTypes: ['multiple_choice'],
                    difficulty: 'medium',
                },
            }).unwrap();
            setGeneratedQuiz(response);
            toast.success('Quiz generated successfully!');
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to generate quiz');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Context Notice */}
            {lockContext && (
                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Zap className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-indigo-900 dark:text-indigo-300">Context Locked</p>
                        <p className="text-xs text-indigo-700 dark:text-indigo-400">
                            Agora AI is currently tailored for <span className="font-bold">{defaultSubject || 'this class'}</span> ({defaultGradeLevel}).
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Lesson Plan Generator */}
                <Card className="border-light-border dark:border-dark-border shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                    <div className="h-1 bg-indigo-500 w-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="pb-2">
                        <CardTitle className="font-bold text-light-text-primary dark:text-dark-text-primary flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                <FileText className="h-5 w-5 text-indigo-500" />
                            </div>
                            Lesson Plan Genius
                        </CardTitle>
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary pl-12 -mt-1">
                            Generate detailed classroom guides in seconds.
                        </p>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-5">
                            {!lockContext && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-light-text-secondary dark:text-dark-text-secondary ml-1">Subject</label>
                                        <Input
                                            placeholder="Biology, English..."
                                            value={lessonPlanSubject}
                                            onChange={(e) => setLessonPlanSubject(e.target.value)}
                                            className="bg-gray-50 dark:bg-dark-surface border-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-light-text-secondary dark:text-dark-text-secondary ml-1">Class Level</label>
                                        <Input
                                            placeholder="SS 1, JSS 3..."
                                            value={lessonPlanGrade}
                                            onChange={(e) => setLessonPlanGrade(e.target.value)}
                                            className="bg-gray-50 dark:bg-dark-surface border-none"
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-light-text-secondary dark:text-dark-text-secondary ml-1">Current Topic</label>
                                <Input
                                    placeholder="Which topic are we teaching?"
                                    value={lessonPlanTopic}
                                    onChange={(e) => setLessonPlanTopic(e.target.value)}
                                    className="bg-gray-50 dark:bg-dark-surface border-none"
                                />
                            </div>

                            <Button
                                variant="primary"
                                onClick={handleGenerateLessonPlan}
                                disabled={isGeneratingLessonPlan || !lessonPlanTopic || !lessonPlanSubject || !lessonPlanGrade}
                                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/15"
                            >
                                {isGeneratingLessonPlan ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Wand2 className="h-4 w-4 mr-2" />
                                )}
                                Craft Lesson Plan (10 Credits)
                            </Button>

                            {generatedPlan && (
                                <div className="mt-4 p-5 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/10 dark:to-dark-surface rounded-2xl border border-indigo-100 dark:border-indigo-900/20 max-h-[300px] overflow-y-auto custom-scrollbar">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-indigo-900 dark:text-indigo-400 text-lg">{generatedPlan.title}</h3>
                                        <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        </div>
                                    </div>
                                    <div className="text-sm space-y-4">
                                        <div>
                                            <strong className="block text-[10px] uppercase tracking-widest text-indigo-700 dark:text-indigo-500 mb-2 font-black">Core Objectives:</strong>
                                            <ul className="grid grid-cols-1 gap-2">
                                                {generatedPlan.objectives?.map((obj: string, i: number) => (
                                                    <li key={i} className="flex gap-2 text-indigo-800/80 dark:text-indigo-300/80 bg-white/50 dark:bg-black/20 p-2 rounded-lg border border-indigo-50 dark:border-indigo-900/20">
                                                        <span className="text-indigo-400 font-bold">•</span>
                                                        {obj}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <strong className="block text-[10px] uppercase tracking-widest text-indigo-700 dark:text-indigo-500 mb-2 font-black">Strategic Introduction:</strong>
                                            <p className="text-indigo-800/80 dark:text-indigo-300/80 leading-relaxed italic bg-indigo-50/30 dark:bg-indigo-900/5 p-3 rounded-xl">
                                                &quot;{generatedPlan.introduction}&quot;
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Quiz Generator */}
                <Card className="border-light-border dark:border-dark-border shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                    <div className="h-1 bg-blue-500 w-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="pb-2">
                        <CardTitle className="font-bold text-light-text-primary dark:text-dark-text-primary flex items-center gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <FileQuestion className="h-5 w-5 text-blue-500" />
                            </div>
                            Quiz Flash-Generator
                        </CardTitle>
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary pl-12 -mt-1">
                            Instant assessments to test student logic.
                        </p>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-5">
                            {!lockContext && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-light-text-secondary dark:text-dark-text-secondary ml-1">Subject</label>
                                        <Input
                                            placeholder="Math, Phsyics..."
                                            value={quizSubject}
                                            onChange={(e) => setQuizSubject(e.target.value)}
                                            className="bg-gray-50 dark:bg-dark-surface border-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-light-text-secondary dark:text-dark-text-secondary ml-1">Class</label>
                                        <Input
                                            placeholder="Primary 4, SS 2..."
                                            value={quizGrade}
                                            onChange={(e) => setQuizGrade(e.target.value)}
                                            className="bg-gray-50 dark:bg-dark-surface border-none"
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-light-text-secondary dark:text-dark-text-secondary ml-1">Focus Topic</label>
                                <Input
                                    placeholder="Algebraic expressions, Adnouns..."
                                    value={quizTopic}
                                    onChange={(e) => setQuizTopic(e.target.value)}
                                    className="bg-gray-50 dark:bg-dark-surface border-none"
                                />
                            </div>

                            <Button
                                variant="primary"
                                onClick={handleGenerateQuiz}
                                disabled={isGeneratingQuiz || !quizTopic || !quizSubject || !quizGrade}
                                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/15"
                            >
                                {isGeneratingQuiz ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Wand2 className="h-4 w-4 mr-2" />
                                )}
                                Generate Quiz (5 Credits)
                            </Button>

                            {generatedQuiz && (
                                <div className="mt-4 p-5 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-dark-surface rounded-2xl border border-blue-100 dark:border-blue-900/20 max-h-[300px] overflow-y-auto custom-scrollbar">
                                    <h3 className="font-bold text-blue-900 dark:text-blue-400 mb-4 flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-amber-500" />
                                        Interactive Questions
                                    </h3>
                                    <div className="space-y-4">
                                        {generatedQuiz.map((q: any, index: number) => (
                                            <div key={index} className="text-sm bg-white dark:bg-black/30 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 shadow-sm">
                                                <p className="font-bold text-blue-950 dark:text-blue-200 mb-3">{index + 1}. {q.question}</p>
                                                {q.options && (
                                                    <div className="grid grid-cols-1 gap-2 pl-2">
                                                        {q.options.map((opt: string, i: number) => (
                                                            <div key={i} className="text-xs text-blue-800/70 dark:text-blue-400/70 flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400/40" />
                                                                {opt}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="mt-4 pt-3 border-t border-blue-100 dark:border-blue-900/20 flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase text-green-600 dark:text-green-400 tracking-tighter">ANS: {q.correctAnswer}</span>
                                                    <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2">Refine</Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Niche: Performance Analyst (Locked/Class Specific) */}
                <Card className="border-light-border dark:border-dark-border shadow-xl bg-gradient-to-br from-orange-500/5 to-amber-500/5 overflow-hidden group">
                     <CardHeader className="pb-2">
                        <CardTitle className="font-bold text-light-text-primary dark:text-dark-text-primary flex items-center gap-3">
                            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                <BarChart3 className="h-5 w-5 text-orange-500" />
                            </div>
                            Class Report Generator
                        </CardTitle>
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary pl-12 -mt-1">
                            Analyze grades and suggest improvement plans.
                        </p>
                    </CardHeader>
                    <CardContent className="pt-4 flex flex-col items-center justify-center text-center py-10 relative">
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-3xl shadow-xl mb-4 border border-light-border dark:border-dark-border z-10">
                            <BarChart3 className="h-10 w-10 text-orange-400 opacity-40" />
                        </div>
                        <h4 className="font-bold text-amber-900 dark:text-amber-400 mb-2">Class Deep-Dive</h4>
                        <p className="text-xs text-light-text-muted dark:text-dark-text-muted max-w-[200px] mb-6">
                            Analyze current class grades to generate performance insights.
                        </p>
                        <Button variant="outline" className="rounded-xl border-orange-200 dark:border-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-50">
                            Analyze Class Data
                        </Button>
                        {/* 3D background decor */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-orange-500/10 blur-[60px] pointer-events-none" />
                    </CardContent>
                </Card>

                {/* Niche: Student Feedback (Locked/Class Specific) */}
                <Card className="border-light-border dark:border-dark-border shadow-xl bg-gradient-to-br from-teal-500/5 to-cyan-500/5 overflow-hidden group">
                     <CardHeader className="pb-2">
                        <CardTitle className="font-bold text-light-text-primary dark:text-dark-text-primary flex items-center gap-3">
                            <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                                <MessageSquare className="h-5 w-5 text-teal-500" />
                            </div>
                            Personalized Feedback
                        </CardTitle>
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary pl-12 -mt-1">
                            Generate custom feedback for student reports.
                        </p>
                    </CardHeader>
                    <CardContent className="pt-4 flex flex-col items-center justify-center text-center py-10 relative">
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-3xl shadow-xl mb-4 border border-light-border dark:border-dark-border z-10">
                            <MessageSquare className="h-10 w-10 text-teal-400 opacity-40" />
                        </div>
                        <h4 className="font-bold text-teal-900 dark:text-teal-400 mb-2">Feedback Engine</h4>
                        <p className="text-xs text-light-text-muted dark:text-dark-text-muted max-w-[200px] mb-6">
                            Auto-generate constructive comments based on student work.
                        </p>
                        <Button variant="outline" className="rounded-xl border-teal-200 dark:border-teal-900/30 text-teal-600 dark:text-teal-400 hover:bg-teal-50">
                             Launch Feedback Tools
                        </Button>
                        {/* 3D background decor */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-teal-500/10 blur-[60px] pointer-events-none" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
