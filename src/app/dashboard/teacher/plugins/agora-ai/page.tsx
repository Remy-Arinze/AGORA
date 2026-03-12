'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FadeInUp } from '@/components/ui/FadeInUp';
import { Sparkles, FileText, FileQuestion, BookOpen, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { useTeacherDashboard } from '@/hooks/useTeacherDashboard';
import {
  useGenerateLessonPlanMutation,
  useGenerateAssessmentMutation,
  useGenerateQuizMutation,
} from '@/lib/store/api/aiApi';
import toast from 'react-hot-toast';

export default function AgoraAIPage() {
  const { school } = useTeacherDashboard();
  const schoolId = school?.id;

  const [generateLessonPlan, { isLoading: isGeneratingLessonPlan }] = useGenerateLessonPlanMutation();
  const [generateAssessment, { isLoading: isGeneratingAssessment }] = useGenerateAssessmentMutation();
  const [generateQuiz, { isLoading: isGeneratingQuiz }] = useGenerateQuizMutation();

  const [lessonPlanTopic, setLessonPlanTopic] = useState('');
  const [lessonPlanSubject, setLessonPlanSubject] = useState('');
  const [lessonPlanGrade, setLessonPlanGrade] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);

  const [quizTopic, setQuizTopic] = useState('');
  const [quizSubject, setQuizSubject] = useState('');
  const [quizGrade, setQuizGrade] = useState('');
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
          objectives: ['Understand key concepts', 'Apply knowledge practically'], // You can add UI for this later
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
    <ProtectedRoute roles={['TEACHER']}>
      <div className="w-full">
        {/* Header */}
        <FadeInUp from={{ opacity: 0, y: -20 }} to={{ opacity: 1, y: 0 }} duration={0.5} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Sparkles className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="font-bold text-light-text-primary dark:text-dark-text-primary" style={{ fontSize: 'var(--text-page-title)' }}>
                Agora AI
              </h1>
              <p className="text-light-text-secondary dark:text-dark-text-secondary">
                Your AI-powered assistant for lesson planning, assessments, and grading
              </p>
            </div>
          </div>
        </FadeInUp>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lesson Plan Generator */}
          <Card>
            <CardHeader>
              <CardTitle className="font-bold text-light-text-primary dark:text-dark-text-primary flex items-center gap-2" style={{ fontSize: 'var(--text-section-title)' }}>
                <FileText className="h-5 w-5 text-indigo-500" />
                Generate Lesson Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Subject</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md dark:bg-dark-surface dark:border-dark-border"
                      placeholder="e.g., Biology"
                      value={lessonPlanSubject}
                      onChange={(e) => setLessonPlanSubject(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Class</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md dark:bg-dark-surface dark:border-dark-border"
                      placeholder="e.g., SS 1"
                      value={lessonPlanGrade}
                      onChange={(e) => setLessonPlanGrade(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Topic</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md dark:bg-dark-surface dark:border-dark-border"
                    placeholder="e.g., Photosynthesis"
                    value={lessonPlanTopic}
                    onChange={(e) => setLessonPlanTopic(e.target.value)}
                  />
                </div>

                <Button
                  variant="primary"
                  onClick={handleGenerateLessonPlan}
                  isLoading={isGeneratingLessonPlan}
                  disabled={!lessonPlanTopic || !lessonPlanSubject || !lessonPlanGrade}
                  className="w-full"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Lesson Plan (10 Credits)
                </Button>

                {generatedPlan && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-dark-surface rounded-lg max-h-64 overflow-y-auto">
                    <h3 className="font-semibold mb-2">{generatedPlan.title}</h3>
                    <div className="text-sm">
                      <strong>Objectives:</strong>
                      <ul className="list-disc pl-5 mb-2">
                        {generatedPlan.objectives?.map((obj: string, i: number) => <li key={i}>{obj}</li>)}
                      </ul>
                      <strong>Introduction:</strong>
                      <p className="mb-2">{generatedPlan.introduction}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Quiz Generator */}
          <Card>
            <CardHeader>
              <CardTitle className="font-bold text-light-text-primary dark:text-dark-text-primary flex items-center gap-2" style={{ fontSize: 'var(--text-section-title)' }}>
                <FileQuestion className="h-5 w-5 text-indigo-500" />
                Quick Quiz Generator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Subject</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md dark:bg-dark-surface dark:border-dark-border"
                      placeholder="e.g., Mathematics"
                      value={quizSubject}
                      onChange={(e) => setQuizSubject(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Class</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md dark:bg-dark-surface dark:border-dark-border"
                      placeholder="e.g., JSS 2"
                      value={quizGrade}
                      onChange={(e) => setQuizGrade(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Topic</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md dark:bg-dark-surface dark:border-dark-border"
                    placeholder="e.g., Algebraic Fractions"
                    value={quizTopic}
                    onChange={(e) => setQuizTopic(e.target.value)}
                  />
                </div>

                <Button
                  variant="primary"
                  onClick={handleGenerateQuiz}
                  isLoading={isGeneratingQuiz}
                  disabled={!quizTopic || !quizSubject || !quizGrade}
                  className="w-full"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Quiz Questions (5 Credits)
                </Button>

                {generatedQuiz && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-dark-surface rounded-lg max-h-64 overflow-y-auto">
                    <h3 className="font-semibold mb-2">Generated Questions:</h3>
                    {generatedQuiz.map((q: any, index: number) => (
                      <div key={index} className="mb-4 text-sm">
                        <p className="font-medium">{index + 1}. {q.question}</p>
                        {q.options && (
                          <ul className="pl-4 mt-1">
                            {q.options.map((opt: string, i: number) => (
                              <li key={i}>{opt}</li>
                            ))}
                          </ul>
                        )}
                        <p className="text-green-600 dark:text-green-400 mt-1">Answer: {q.correctAnswer}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
