'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  useCreateAssessmentMutation,
  useGetTermsQuery,
  useGetMyTeacherProfileQuery,
  useGetTeacherSubjectsForClassQuery,
  type AssessmentType,
} from '@/lib/store/api/schoolAdminApi';
import { useTeacherDashboard } from '@/hooks/useTeacherDashboard';
import { DatePicker } from '@/components/ui/DatePicker';
import { ArrowLeft, Plus, Trash2, CheckCircle2, Loader2, Sparkles, Send, AlertCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function CreateAssessmentPage() {
  const router = useRouter();
  const [createAssessment, { isLoading: isSaving }] = useCreateAssessmentMutation();
  const { classes, school, activeTerm, isLoadingClasses: classesLoading } = useTeacherDashboard();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'QUIZ' as AssessmentType,
    classId: '',
    subjectId: '',
    termId: '',
    dueDate: '',
    maxScore: 100,
  });

  // Fetch subjects teacher can grade for this class
  const { data: teacherSubjectsResponse, isLoading: isLoadingSubjects } = useGetTeacherSubjectsForClassQuery(
    { classId: formData.classId },
    { skip: !formData.classId }
  );

  const teacherSubjects = teacherSubjectsResponse?.data?.subjects || [];
  const canGradeAll = teacherSubjectsResponse?.data?.canGradeAllSubjects;

  // Class subjects from the teacher profile logic
  const selectedClass = classes?.find((c: any) => c.id === formData.classId);

  const schoolId = school?.id;
  const { data: termsRes, isFetching: isFetchingTerms } = useGetTermsQuery({ schoolId: schoolId || '' }, { skip: !schoolId });

  const searchParams = useSearchParams();
  const isAiSource = searchParams.get('source') === 'ai';

  const [questions, setQuestions] = useState<any[]>([]);
  const [publishImmediately, setPublishImmediately] = useState(false);
  const [autoDistribute, setAutoDistribute] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState<'PUBLISH' | 'DRAFT' | null>(null);

  // Local states to avoid snapping to 0 while typing
  const [localPoints, setLocalPoints] = useState<Record<number, string>>({});
  const [localMaxScore, setLocalMaxScore] = useState(formData.maxScore.toString());

  // Load data from localStorage (if coming from AI chat)
  useEffect(() => {
    if (!isAiSource) {
      localStorage.removeItem('agora_ai_assessment_context');
      return;
    }

    const aiContext = localStorage.getItem('agora_ai_assessment_context');
    if (aiContext) {
      try {
        const data = JSON.parse(aiContext);

        const newMaxScore = data.maxScore || 100;
        setFormData(prev => ({
          ...prev,
          title: data.title || (data.toolName === 'generate_quiz' ? 'New Quiz' : 'New Assessment'),
          description: data.description || '',
          type: (data.type?.toUpperCase() === 'QUIZ' ? 'QUIZ' : data.type?.toUpperCase() === 'EXAM' ? 'EXAM' : 'ASSIGNMENT') as AssessmentType,
          subjectId: data.subjectId || prev.subjectId,
          classId: data.classId || prev.classId,
          maxScore: newMaxScore
        }));
        setLocalMaxScore(newMaxScore.toString());

        const questionsList = data.questions || [];
        if (questionsList.length > 0) {
          const mappedQuestions = questionsList.map((q: any, i: number) => {
            const inferredType = q.type?.toUpperCase() || (data.toolName === 'generate_quiz' ? 'MULTIPLE_CHOICE' : 'SHORT_ANSWER');
            return {
              text: q.question || q.text || q.prompt || '',
              type: (inferredType === 'MULTIPLE_CHOICE' ? 'MULTIPLE_CHOICE' : inferredType === 'ESSAY' ? 'ESSAY' : 'SHORT_ANSWER'),
              options: Array.isArray(q.options) ? q.options : (inferredType === 'MULTIPLE_CHOICE' ? (q.choices || ['', '', '', '']) : []),
              correctAnswer: q.correctAnswer || q.answer || '',
              points: Number(q.points) || 1,
              order: i
            };
          });
          setQuestions(mappedQuestions);
        }
      } catch (e) {
        console.error('Failed to parse AI context', e);
      }
    }
  }, [isAiSource]);

  // Handle mass point update when maxScore or questions.length change (Auto-distribution)
  useEffect(() => {
    if (questions.length > 0 && autoDistribute) {
      const evenPoints = Math.round(((formData.maxScore || 0) / questions.length) * 10) / 10;

      // Update local points map
      const newLocalPoints: Record<number, string> = {};
      questions.forEach((_, i) => {
        newLocalPoints[i] = evenPoints.toString();
      });
      setLocalPoints(newLocalPoints);

      // Update actual questions state
      setQuestions(prev => prev.map(q => ({ ...q, points: evenPoints })));
    }
  }, [formData.maxScore, questions.length, autoDistribute]);

  // Track total points for manual weighing
  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);
  const isPointMismatch = autoDistribute ? false : Math.abs(totalPoints - formData.maxScore) > 0.01;

  // Auto-select term if active session exists
  useEffect(() => {
    if (activeTerm && !formData.termId) {
      setFormData(prev => ({ ...prev, termId: activeTerm.id }));
    }
  }, [activeTerm]);

  // Auto-select class if teacher only has one
  useEffect(() => {
    if (classes?.length === 1 && !formData.classId) {
      setFormData(prev => ({ ...prev, classId: classes[0].id }));
    }
  }, [classes, formData.classId]);

  // Attempt to match subject ID if coming from AI
  useEffect(() => {
    if (isAiSource && formData.classId && !formData.subjectId) {
      const aiContext = localStorage.getItem('agora_ai_assessment_context');
      if (aiContext) {
        try {
          const data = JSON.parse(aiContext);

          // 1. Check for pre-resolved ID from backend
          if (data.subjectId) {
            setFormData(prev => ({ ...prev, subjectId: data.subjectId }));
            return;
          }

          // 2. Fallback to name matching
          const subjectName = data.subject || data.subjectName;
          if (subjectName && teacherSubjects.length > 0) {
            const matchedSubject = teacherSubjects.find((s: any) =>
              s.name?.toLowerCase() === subjectName.toLowerCase() ||
              s.code?.toLowerCase() === subjectName.toLowerCase()
            );

            if (matchedSubject) {
              setFormData(prev => ({ ...prev, subjectId: matchedSubject.id }));
            }
          }
        } catch (e) {
          console.error('[CreateAssessment] Failed to auto-match subject', e);
        }
      }
    }
  }, [isAiSource, formData.classId, teacherSubjects, formData.subjectId]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        type: 'MULTIPLE_CHOICE',
        options: ['', '', '', ''],
        correctAnswer: '',
        points: 0, // Will be auto-calculated by effect
        order: questions.length
      }
    ]);
  };

  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx).map((q, i) => ({ ...q, order: i })));
  };

  const updateQuestion = (idx: number, field: string, value: any) => {
    const newQs = [...questions];
    newQs[idx] = { ...newQs[idx], [field]: value };
    setQuestions(newQs);
  };

  const handlePointChange = (idx: number, val: string) => {
    setLocalPoints(prev => ({ ...prev, [idx]: val }));
    if (val !== '' && !isNaN(Number(val))) {
      // Turn off auto-distribute if teacher manually edits a point value
      if (autoDistribute) setAutoDistribute(false);

      const num = Number(val);
      const newQs = [...questions];
      newQs[idx] = { ...newQs[idx], points: num };
      setQuestions(newQs);
    }
  };

  const validatePoints = (idx: number) => {
    const val = localPoints[idx];
    if (val === '' || isNaN(Number(val)) || Number(val) < 0) {
      const evenPoints = Math.round(((formData.maxScore || 0) / questions.length) * 10) / 10;
      handlePointChange(idx, evenPoints.toString());
    }
  };

  const handleMaxScoreChange = (val: string) => {
    setLocalMaxScore(val);
    if (val !== '' && !isNaN(Number(val))) {
      setFormData({ ...formData, maxScore: Number(val) });
    }
  };

  const validateMaxScore = () => {
    if (localMaxScore === '' || isNaN(Number(localMaxScore)) || Number(localMaxScore) <= 0) {
      setLocalMaxScore('100');
      setFormData({ ...formData, maxScore: 100 });
    }
  };

  // Strict validation for publishing, more lenient for drafts
  const isBasicsValid = !!(
    formData.title?.trim() &&
    formData.classId &&
    formData.subjectId &&
    formData.termId &&
    formData.dueDate &&
    questions.length > 0 &&
    questions.every(q => q.text?.trim())
  );

  const isValidToPublish = isBasicsValid && !isPointMismatch;
  const isValidToSave = isBasicsValid;

  const handleSave = async () => {
    if (!schoolId) return;

    try {
      setIsSaving(true);
      const status = showConfirmModal === 'PUBLISH' ? 'PUBLISHED' : 'DRAFT';
      const selectedClassObject = classes?.find((c: any) => c.id === formData.classId);

      await createAssessment({
        schoolId,
        classId: formData.classId,
        dto: {
          ...formData,
          classId: formData.classId || undefined,
          classArmId: selectedClassObject?.classArmId || undefined,
          subjectId: formData.subjectId || undefined,
          termId: formData.termId || undefined,
          status,
          questions: questions.map(q => ({
            text: q.text,
            type: q.type,
            options: q.options,
            correctAnswer: q.correctAnswer,
            points: Number(q.points),
            order: q.order
          }))
        }
      }).unwrap();

      toast.success(status === 'PUBLISHED' ? 'Assessment Published!' : 'Draft Saved!');
      localStorage.removeItem('agora_ai_assessment_context');
      router.push(`/dashboard/teacher/classes/${formData.classId}`);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create assessment');
    } finally {
      setIsSaving(false);
      setShowConfirmModal(null);
    }
  };

  return (
    <ProtectedRoute roles={['TEACHER']}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                Review & Save Assessment
              </h1>
              <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm">
                Review logic, points distribution, and assign to your class.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal('DRAFT')}
                disabled={!isValidToSave || isSaving}
                isFlat
                size="md"
                className="h-11 px-6 rounded-xl font-bold border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 opacity-70" />
                  <span>Save as Draft</span>
                </div>
              </Button>

              <Button
                onClick={() => {
                  if (isPointMismatch) {
                    toast.error("Total question points must match the Maximum Score before publishing.");
                    return;
                  }
                  setShowConfirmModal('PUBLISH');
                }}
                disabled={!isValidToSave || isSaving}
                isFlat
                size="md"
                className={cn(
                  "h-11 px-8 rounded-xl font-bold transition-all",
                  isValidToPublish ? "bg-[#2490FD] hover:bg-[#1a7ae6] text-white shadow-sm" : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                )}
              >
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  <span>Publish Now</span>
                </div>
              </Button>
            </div>
          </div>

          {!activeTerm && publishImmediately && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl flex items-center gap-3 text-amber-800 dark:text-amber-400 text-xs font-semibold">
              <AlertCircle size={16} className="shrink-0" />
              Publishing is disabled because there is no active academic term found. Please save as a draft.
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-6 !overflow-visible border-none shadow-sm dark:bg-dark-surface">
              <CardHeader>
                <CardTitle>Assessment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="h-12 text-lg font-semibold"
                    placeholder="e.g. Chemistry Quiz"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Due Date <span className="text-red-500">*</span>
                    </label>
                    <DatePicker
                      value={formData.dueDate}
                      onChange={val => setFormData({ ...formData, dueDate: val })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Maximum Score</label>
                    <div className="space-y-1">
                      <Input
                        type="text"
                        value={localMaxScore}
                        onChange={e => handleMaxScoreChange(e.target.value)}
                        onBlur={() => validateMaxScore()}
                        className={cn("h-10", isPointMismatch && "border-red-500 focus:ring-red-500")}
                      />
                      {!autoDistribute && (
                        <div className="flex flex-col gap-2 p-2 rounded-lg bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-slate-800">
                          <div className={cn(
                            "flex items-center justify-between text-[10px] font-bold uppercase tracking-wider",
                            isPointMismatch ? "text-red-500" : "text-emerald-500"
                          )}>
                            <div className="flex items-center gap-1.5">
                              {isPointMismatch ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
                              Total: {totalPoints} / {formData.maxScore}
                            </div>

                            {isPointMismatch && (
                              <button
                                onClick={() => handleMaxScoreChange(totalPoints.toString())}
                                className="px-2 py-0.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-600 transition-colors"
                              >
                                Match Score
                              </button>
                            )}
                          </div>

                          {isPointMismatch && (
                            <button
                              onClick={() => setAutoDistribute(true)}
                              className="text-[9px] text-slate-400 hover:text-indigo-500 text-left transition-colors flex items-center gap-1"
                            >
                              <Sparkles size={10} /> Re-enable Auto-distribution
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Instructions</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full min-h-[100px] p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-black/20 text-sm outline-none"
                    placeholder="Provide instructions..."
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Questions ({questions.length})</h2>
                <Button variant="outline" size="sm" onClick={addQuestion} className="rounded-full">
                  <Plus className="w-4 h-4 mr-2" /> Add Question
                </Button>
              </div>

              {questions.map((q, idx) => (
                <Card key={idx} className="relative group overflow-hidden border-indigo-500/10 hover:border-indigo-500/30 transition-all">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-start gap-6">
                        <div className="flex-1">
                          <textarea
                            value={q.text}
                            onChange={e => updateQuestion(idx, 'text', e.target.value)}
                            className="w-full bg-transparent border-none outline-none font-bold text-lg resize-none placeholder:opacity-50"
                            placeholder="Type your question..."
                            rows={1}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="text"
                            className="w-20 h-9 text-center bg-indigo-500/5 font-bold"
                            value={localPoints[idx] || ''}
                            onChange={e => handlePointChange(idx, e.target.value)}
                            onBlur={() => validatePoints(idx)}
                            title="Points"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeQuestion(idx)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {['MULTIPLE_CHOICE', 'SHORT_ANSWER', 'ESSAY'].map(t => (
                          <button
                            key={t}
                            onClick={() => updateQuestion(idx, 'type', t)}
                            className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border",
                              q.type === t ? "bg-indigo-600 text-white border-indigo-600" : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                            )}
                          >
                            {t.replace('_', ' ')}
                          </button>
                        ))}
                      </div>

                      {q.type === 'MULTIPLE_CHOICE' && q.options && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          {q.options.map((opt: string, optIdx: number) => (
                            <div key={optIdx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-slate-800">
                              <input
                                type="radio"
                                checked={q.correctAnswer === opt && opt !== ''}
                                onChange={() => updateQuestion(idx, 'correctAnswer', opt)}
                                className="w-4 h-4 accent-indigo-600"
                              />
                              <input
                                type="text"
                                value={opt}
                                onChange={e => {
                                  const newOptions = [...q.options!];
                                  newOptions[optIdx] = e.target.value;
                                  updateQuestion(idx, 'options', newOptions);
                                }}
                                className="flex-1 bg-transparent border-none outline-none text-sm"
                                placeholder={`Option ${optIdx + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {(q.type === 'SHORT_ANSWER' || q.type === 'ESSAY') && (
                        <div className="bg-slate-50 dark:bg-black/20 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Sample Answer</label>
                          <textarea
                            value={q.correctAnswer}
                            onChange={e => updateQuestion(idx, 'correctAnswer', e.target.value)}
                            className="w-full bg-transparent border-none outline-none text-sm resize-none"
                            placeholder="Correct answer/Rubric..."
                            rows={2}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6 text-white ">
            <Card className="sticky top-8 bg-[var(--agora-blue)] border-none shadow-xl shadow-indigo-500/20 !overflow-visible">
              <CardHeader>
                <CardTitle className='text-white'>Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-200 mb-2">
                    Class <span className="text-red-300">*</span>
                  </label>
                  <select
                    value={formData.classId}
                    onChange={e => setFormData({ ...formData, classId: e.target.value, subjectId: '' })}
                    disabled={classesLoading || !classes}
                    className="w-full bg-white/10 p-3 rounded-lg font-bold outline-none border border-white/20 disabled:opacity-50 [&>option]:text-black"
                  >
                    <option value="">{(classesLoading || !classes) ? 'Fetching classes...' : 'Select a class...'}</option>
                    {classes?.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-100">Auto-distribute Points</p>
                    <p className="text-[9px] text-indigo-200/60 leading-tight mt-0.5">Keep points balanced across all questions</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoDistribute(!autoDistribute)}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      autoDistribute ? "bg-emerald-500" : "bg-white/20"
                    )}
                  >
                    <span className={cn(
                      "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                      autoDistribute ? "translate-x-4" : "translate-x-0"
                    )} />
                  </button>
                </div>

                {formData.subjectId ? (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between group">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-100/40 mb-1">
                        Subject <span className="text-red-300/40">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                        <span className="text-white font-bold">
                          {teacherSubjects.find(s => s.id === formData.subjectId)?.name || "Selected Subject"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setFormData({ ...formData, subjectId: '' })}
                      className="text-[10px] font-bold uppercase tracking-widest text-indigo-100/40 hover:text-white transition-colors"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-100/70 mb-2">
                      {isLoadingSubjects ? "Fetching Subjects..." : "Select Subject"} <span className="text-red-300">*</span>
                    </label>
                    <select
                      value={formData.subjectId}
                      onChange={e => setFormData({ ...formData, subjectId: e.target.value })}
                      disabled={!formData.classId || isLoadingSubjects}
                      className="w-full bg-white/10 p-3 rounded-lg font-bold outline-none border border-white/20 disabled:opacity-50 [&>option]:text-black"
                    >
                      <option value="">{isLoadingSubjects ? "Loading..." : "Select subject..."}</option>
                      {teacherSubjects.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-200 mb-2">
                    Academic Term <span className="text-red-300">*</span>
                  </label>
                  <select
                    value={formData.termId}
                    onChange={e => setFormData({ ...formData, termId: e.target.value })}
                    disabled={isFetchingTerms || !termsRes}
                    className="w-full bg-white/10 p-3 rounded-lg font-bold outline-none border border-white/20 disabled:opacity-50 [&>option]:text-black"
                  >
                    <option value="">{(isFetchingTerms || !termsRes) ? 'Fetching terms...' : 'Select term...'}</option>
                    {/* Ensure active term is always an option even if list is loading */}
                    {activeTerm && !((termsRes?.data as any)?.items?.find((t: any) => t.id === activeTerm.id)) && (
                      <option key={activeTerm.id} value={activeTerm.id}>{activeTerm.name} (Current)</option>
                    )}
                    {/* Map terms from the items list */}
                    {(termsRes?.data as any)?.items?.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                    {/* Fallback for direct array data */}
                    {Array.isArray(termsRes?.data) && termsRes.data.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 border-t border-white/10 opacity-70">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span className="text-xs font-medium">AI Insights Active</span>
                  </div>
                  <p className="text-[10px] italic leading-relaxed">
                    Assessment generated by Lois based on context.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showConfirmModal !== null}
        onClose={() => setShowConfirmModal(null)}
        title={showConfirmModal === 'PUBLISH' ? 'Publish Assessment' : 'Save as Draft'}
        size="sm"
      >
        <div className="space-y-6">
          <div className={cn(
            "p-4 rounded-2xl border flex items-start gap-4",
            showConfirmModal === 'PUBLISH'
              ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
              : "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20 text-indigo-800 dark:text-indigo-300"
          )}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/50 shrink-0">
              {showConfirmModal === 'PUBLISH' ? <Send className="w-5 h-5 text-emerald-600" /> : <div className="w-5 h-5 rounded-full border-2 border-indigo-600" />}
            </div>
            <div>
              <p className="font-bold text-sm mb-1">Confirm Action</p>
              <p className="text-xs leading-relaxed opacity-70">
                {showConfirmModal === 'PUBLISH'
                  ? "Publishing will make this assessment visible to students immediately."
                  : "Saving as draft will keep this assessment hidden from students until published."}
              </p>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1 h-12 rounded-xl" onClick={() => setShowConfirmModal(null)}>Cancel</Button>
            <Button
              className={cn(
                "flex-1 h-12 rounded-xl text-white font-bold",
                showConfirmModal === 'PUBLISH' ? "bg-emerald-600" : "bg-indigo-600"
              )}
              onClick={handleSave}
              isLoading={isSaving}
            >
              Continue
            </Button>
          </div>
        </div>
      </Modal>
    </ProtectedRoute>
  );
}
