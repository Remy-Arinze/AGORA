'use client';

import React from 'react';
import { 
  Sparkles, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Loader2,
  ChevronRight,
  PlusCircle,
  MoreVertical,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubjectCurriculumCardProps {
  subject: any;
  onSetup: () => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onCancel?: () => void; // New prop
  canEdit?: boolean;
}

export function SubjectCurriculumCard({
  subject,
  onSetup,
  onView,
  onEdit,
  onCancel,
  canEdit = false,
}: SubjectCurriculumCardProps) {
  const status = (subject.status as string) || 'NOT_SET_UP';
  const hasScheme = !!subject.schemeId && status !== 'NOT_SET_UP' && status !== 'CANCELLED';

  const handleClick = () => {
    if (status === 'GENERATING') return;
    
    if (hasScheme) {
      onView(subject.schemeId);
    } else {
      onSetup();
    }
  };

  const getStatusDisplay = () => {
    switch (status) {
      case 'GENERATING':
        return (
          <div className="flex flex-col items-center justify-center py-4 space-y-3">
            <div className="relative">
              <Loader2 className="h-8 w-8 text-agora-blue animate-spin" />
              <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-agora-accent animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-[9px] font-black text-agora-blue dark:text-blue-400 animate-pulse tracking-widest uppercase font-heading">
                Drafting Strategy...
              </p>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel?.();
                }}
                className="text-[8px] font-black text-red-500 hover:text-red-600 uppercase tracking-widest border border-red-500/20 rounded-lg px-3 py-1 hover:bg-red-500/5 transition-all"
              >
                Stop & Refund
              </button>
            </div>
          </div>
        );
      case 'CANCELLED':
        return (
          <div className="flex flex-col items-center justify-center py-6 space-y-2 text-center">
            <XCircle className="h-6 w-6 text-orange-500/80" />
            <p className="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-tight">
              Generation Cancelled
            </p>
            <span className="text-[8px] text-light-text-muted dark:text-dark-text-muted font-heading uppercase font-bold tracking-widest bg-orange-50 dark:bg-orange-950/20 px-2 py-0.5 rounded-full">Reset to initialize</span>
          </div>
        );
      case 'FAILED':
        return (
          <div className="flex flex-col items-center justify-center py-6 space-y-2 text-center">
            <XCircle className="h-6 w-6 text-red-500/80" />
            <p className="text-[9px] font-black text-red-600 dark:text-red-400 uppercase tracking-tight">
              AI Generation Timeout
            </p>
            <span className="text-[8px] text-light-text-muted dark:text-dark-text-muted font-heading uppercase font-bold tracking-widest bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-full">Click to try again</span>
          </div>
        );
      case 'PUBLISHED':
        return (
          <div className="flex flex-col space-y-3 pt-2">
            <div className="flex items-center justify-between text-[9px]">
              <span className="font-black text-light-text-muted dark:text-dark-text-muted uppercase tracking-widest font-heading">Syllabus Completion</span>
              <span className="font-black text-agora-success font-heading tracking-tight">85%</span>
            </div>
            <div className="h-1.5 w-full bg-light-border dark:bg-dark-border rounded-full overflow-hidden">
              <div 
                className="h-full bg-agora-success rounded-full transition-all duration-1000" 
                style={{ width: '85%' }}
              />
            </div>
          </div>
        );
      case 'DRAFT':
        return (
          <div className="mt-2 flex items-center justify-center gap-2 py-4 bg-light-surface dark:bg-dark-surface/30 border border-light-border dark:border-dark-border rounded-xl">
            <Clock className="h-3 w-3 text-amber-600" />
            <span className="text-[9px] font-black text-amber-700 dark:text-amber-300 uppercase tracking-[0.15em] font-heading">Review in progress</span>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center py-6 space-y-2 border-2 border-dashed border-light-border dark:border-dark-border rounded-2xl group-hover:border-agora-blue/10 group-hover:bg-agora-blue/[0.01] transition-all">
            <div className="h-7 w-7 rounded-full bg-light-surface dark:bg-dark-surface/50 flex items-center justify-center text-light-text-muted dark:text-dark-text-muted group-hover:text-agora-blue transition-colors">
              <PlusCircle className="h-3.5 w-3.5" />
            </div>
            <p className="text-[9px] font-black text-light-text-muted dark:text-dark-text-muted uppercase tracking-widest font-heading">Initialize Plan</p>
          </div>
        );
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={cn(
        "group relative bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-[24px] p-6 transition-all duration-500",
        status === 'GENERATING' ? "cursor-wait opacity-80" : "cursor-pointer hover:border-agora-blue/20 hover:shadow-2xl hover:shadow-agora-blue/5 hover:-translate-y-0.5 active:scale-[0.98]"
      )}
    >
      {/* Top Section */}
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-1">
          <h3 className="font-heading font-black text-xl text-light-text-primary dark:text-dark-text-primary leading-tight lowercase first-letter:uppercase">
            {subject.subjectName}
          </h3>
          <div className="flex items-center gap-1.5 pt-1">
            {status === 'PUBLISHED' ? (
              <span className="text-[8px] font-black text-agora-success uppercase tracking-widest flex items-center gap-1 font-heading">
                <div className="h-1 w-1 rounded-full bg-agora-success animate-pulse" />
                Live Strategy
              </span>
            ) : status === 'GENERATING' ? (
              <span className="text-[8px] font-black text-agora-blue uppercase tracking-widest flex items-center gap-1 font-heading">
                <Loader2 className="h-2 w-2 animate-spin" />
                Working...
              </span>
            ) : (
              <span className="text-[8px] font-black text-light-text-muted dark:text-dark-text-muted uppercase tracking-widest flex items-center gap-1 font-heading opacity-60">
                <AlertCircle className="h-2 w-2" />
                Incomplete
              </span>
            )}
          </div>
        </div>
        
        <button className="h-8 w-8 rounded-xl flex items-center justify-center text-light-text-muted dark:text-dark-text-muted hover:bg-light-surface dark:hover:bg-dark-surface/50 transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0">
          {hasScheme ? <ChevronRight className="h-4 w-4" /> : <MoreVertical className="h-4 w-4" />}
        </button>
      </div>

      {/* Status Specific Content */}
      <div className="mb-2 h-[80px] flex flex-col justify-center">
        {getStatusDisplay()}
      </div>

      {/* Hover Background Accent */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-5 transition-opacity">
        <Sparkles className="h-14 w-14 text-agora-blue" />
      </div>

      {/* Border Highlight Effect on Hover */}
      <div className={cn(
        "absolute inset-0 rounded-[24px] pointer-events-none border-2 border-transparent transition-all duration-500",
        hasScheme ? "group-hover:border-agora-success/5" : "group-hover:border-agora-blue/5"
      )} />
    </div>
  );
}
