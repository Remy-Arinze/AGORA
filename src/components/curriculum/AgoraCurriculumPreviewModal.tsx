'use client';

import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Info,
  Layers,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import { useGetAgoraCurriculumPreviewQuery } from '@/lib/store/api/schoolAdminApi';

interface AgoraCurriculumPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  curriculumId: string;
  schoolId: string;
  onSelect: (curriculumId: string) => void;
}

export function AgoraCurriculumPreviewModal({
  isOpen,
  onClose,
  curriculumId,
  schoolId,
  onSelect,
}: AgoraCurriculumPreviewModalProps) {
  const { data: preview, isLoading } = useGetAgoraCurriculumPreviewQuery(
    { schoolId, curriculumId },
    { skip: !isOpen || !curriculumId }
  );

  const [activeTerm, setActiveTerm] = useState<number>(1);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      hideHeader={true}
      size="4xl"
      className="p-0 border-none shadow-2xl rounded-2xl"
      contentClassName="p-0"
    >
      <div className="flex flex-col bg-white dark:bg-dark-surface font-sans h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-light-border dark:border-dark-border bg-light-card dark:bg-dark-bg/50">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={onClose}
              className="flex items-center gap-2 text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="font-black uppercase tracking-widest text-[10px]">Back to Library</span>
            </button>
            <div className="flex items-center gap-2">
               <div className="px-2 py-1 rounded bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                 Pre-Verified Template
               </div>
            </div>
          </div>

          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="font-black text-light-text-primary dark:text-dark-text-primary font-heading tracking-tight leading-none uppercase text-2xl">
                {isLoading ? (
                  <div className="h-8 w-64 bg-light-surface dark:bg-dark-surface rounded animate-pulse" />
                ) : (
                  preview?.subjectName
                )}
              </h2>
              <div className="flex items-center gap-2 text-light-text-muted dark:text-dark-text-secondary font-bold uppercase tracking-widest text-[10px]">
                <span>{preview?.gradeLevel?.replace('_', ' ')}</span>
                <div className="h-1 w-1 rounded-full bg-light-border dark:bg-dark-border" />
                <span>v{preview?.version || '1.0'}</span>
                <div className="h-1 w-1 rounded-full bg-light-border dark:bg-dark-border" />
                <span>3 Terms Consolidated</span>
              </div>
            </div>

            {!isLoading && (
              <Button 
                className="bg-blue-600 hover:bg-blue-500 px-8 h-12 rounded-xl font-black uppercase tracking-[0.15em] shadow-lg shadow-blue-500/10 transition-all hover:scale-[1.02] active:scale-[0.98] text-xs"
                onClick={() => onSelect(curriculumId)}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Adopt this Curriculum
              </Button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Overview & Stats */}
          <div className="w-80 border-r border-light-border dark:border-dark-border bg-light-surface/30 dark:bg-dark-surface/10 p-6 overflow-y-auto space-y-8">
            <div className="space-y-4">
              <h3 className="font-black text-light-text-primary dark:text-dark-text-primary text-xs uppercase tracking-widest flex items-center gap-2">
                <Info className="h-3.5 w-3.5 text-blue-500" />
                Curriculum Overview
              </h3>
              <div className="bg-white dark:bg-dark-bg p-4 rounded-xl border border-light-border dark:border-dark-border shadow-sm">
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-light-surface dark:bg-dark-surface rounded animate-pulse" />
                    <div className="h-3 w-4/5 bg-light-surface dark:bg-dark-surface rounded animate-pulse" />
                    <div className="h-3 w-full bg-light-surface dark:bg-dark-surface rounded animate-pulse" />
                  </div>
                ) : (
                  <p className="text-xs font-bold text-light-text-muted dark:text-dark-text-muted leading-relaxed whitespace-pre-wrap">
                    {preview?.overview || 'No overview available for this curriculum.'}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-black text-light-text-primary dark:text-dark-text-primary text-xs uppercase tracking-widest flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-purple-500" />
                Structure Details
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Total Topics', value: preview?.terms?.reduce((acc: number, t: any) => acc + (t.topics?.length || 0), 0) || 0 },
                  { label: 'Duration', value: '39 Weeks' },
                  { label: 'Complexity', value: 'Intermediate' },
                  { label: 'Last Updated', value: new Date(preview?.updatedAt).toLocaleDateString() },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-light-border/50 dark:border-dark-border/50 last:border-0">
                    <span className="text-[10px] font-bold text-light-text-muted dark:text-dark-text-secondary uppercase">{stat.label}</span>
                    <span className="text-[10px] font-black text-light-text-primary dark:text-dark-text-primary">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-600">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Lois Recommendation</span>
              </div>
              <p className="text-[10px] font-bold text-amber-600/80 leading-tight">
                This curriculum follows the NERDC guidelines perfectly while adding modern practical activities.
              </p>
            </div>
          </div>

          {/* Main Content - Term Breakdown */}
          <div className="flex-1 flex flex-col overflow-hidden bg-light-card dark:bg-dark-bg">
            {/* Term Tabs */}
            <div className="flex border-b border-light-border dark:border-dark-border px-6">
              {[1, 2, 3].map((term) => (
                <button
                  key={term}
                  onClick={() => setActiveTerm(term)}
                  className={cn(
                    "px-8 py-5 text-xs font-black uppercase tracking-[0.2em] transition-all relative",
                    activeTerm === term
                      ? "text-blue-600"
                      : "text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary"
                  )}
                >
                  Term {term}
                  {activeTerm === term && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Topics List */}
            <div className="flex-1 overflow-y-auto p-8 space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-20 bg-light-surface dark:bg-dark-surface rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : (
                preview?.terms?.find((t: any) => t.number === activeTerm)?.topics?.map((topic: any, idx: number) => (
                  <div 
                    key={idx}
                    className="p-5 rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-surface/50 hover:border-blue-500/30 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-light-surface dark:bg-dark-surface flex items-center justify-center text-xs font-black text-light-text-muted dark:text-dark-text-secondary border border-light-border dark:border-dark-border group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all">
                        W{topic.weekNumber}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                           <h4 className="font-black text-light-text-primary dark:text-dark-text-primary uppercase tracking-tight text-sm">
                             {topic.topic}
                           </h4>
                           <span className="text-[10px] font-bold text-light-text-muted dark:text-dark-text-secondary">
                             {topic.subTopics?.length || 0} Sub-topics
                           </span>
                        </div>
                        {topic.subTopics && topic.subTopics.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {topic.subTopics.map((st: string, sidx: number) => (
                              <span key={sidx} className="px-2 py-0.5 rounded bg-light-surface dark:bg-dark-surface text-[10px] font-bold text-light-text-muted dark:text-dark-text-secondary border border-light-border dark:border-dark-border">
                                {st}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-[10px] font-bold text-light-text-muted dark:text-dark-text-muted line-clamp-2 italic">
                          {topic.objectives?.[0] || 'No objective provided.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="p-4 bg-light-surface dark:bg-dark-surface rounded-xl">
                      <Calendar className="h-8 w-8 text-light-text-muted opacity-20" />
                    </div>
                    <p className="font-black text-light-text-primary dark:text-dark-text-primary uppercase tracking-tight text-sm">No Topics for Term {activeTerm}</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
