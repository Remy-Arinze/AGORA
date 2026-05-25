'use client';

import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  Sparkles, 
  Star, 
  Clock, 
  ChevronRight, 
  Edit3, 
  Plus, 
  FileCheck, 
  AlertTriangle,
  Loader2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { FadeInUp } from '@/components/ui/FadeInUp';
import { 
  useGetSchemeOfWorkForClassQuery, 
  useUpdateSchemeOfWorkWeekMutation 
} from '@/lib/store/api/schoolAdminApi';
import { SchemeOfWorkStatusBadge } from './SchemeOfWorkStatusBadge';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface SchemeOfWorkViewProps {
  schoolId: string;
  classId: string;
  role: 'TEACHER' | 'STUDENT' | 'SCHOOL_ADMIN';
  terminology?: any;
  isReadOnly?: boolean;
}

export function SchemeOfWorkView({ schoolId, classId, role, terminology, isReadOnly }: SchemeOfWorkViewProps) {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  
  // Fetch class-specific Scheme of Work
  const { data: response, isLoading, isError, refetch } = useGetSchemeOfWorkForClassQuery(
    { schoolId, classId },
    { skip: !schoolId || !classId, pollingInterval: 10000 } // Polling while status is GENERATING
  );

  const [updateWeek, { isLoading: isUpdating }] = useUpdateSchemeOfWorkWeekMutation();

  const scheme = response?.data;
  const weeks = scheme?.weeks || [];
  
  // Progress calculation
  const progress = useMemo(() => {
    if (weeks.length === 0) return 0;
    const deliveredCount = weeks.filter(w => w.isDelivered).length;
    return Math.round((deliveredCount / weeks.length) * 100);
  }, [weeks]);

  const handleToggleDelivery = async (weekId: string, currentStatus: boolean) => {
    if (role === 'STUDENT' || isReadOnly) return;
    
    try {
      await updateWeek({
        schoolId,
        weekId,
        data: { isDelivered: !currentStatus }
      }).unwrap();
      toast.success(currentStatus ? 'Week marked as pending' : 'Week marked as delivered!');
    } catch (err) {
      toast.error('Failed to update delivery status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-dark-surface/50 rounded-2xl border border-dashed border-light-border dark:border-dark-border">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-light-text-secondary dark:text-dark-text-secondary font-medium animate-pulse">
          Lois is retrieving your tailored Scheme of Work...
        </p>
      </div>
    );
  }

  if (isError || !scheme) {
    return (
      <div className="text-center py-16 bg-white dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border shadow-sm">
        <div className="max-w-md mx-auto space-y-4 px-6">
          <BookOpen className="h-12 w-12 text-light-text-muted dark:text-dark-text-muted mx-auto opacity-30" />
          <div>
            <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">No Active Scheme of Work</h3>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-2">
              Your School Admin hasn't generated or published a Scheme of Work for this class yet. 
              {role === 'TEACHER' && " You can request one if the subject curriculum is ready."}
            </p>
          </div>
          {role !== 'STUDENT' && (
            <Button variant="primary" size="sm" onClick={() => refetch()} className="mt-4">
              Refresh Status
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (scheme.status === 'GENERATING') {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
        <div className="relative mb-6">
          <Sparkles className="h-12 w-12 text-blue-600 animate-pulse" />
          <div className="absolute -top-1 -right-1">
            <span className="flex h-4 w-4 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
            </span>
          </div>
        </div>
        <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">Tailoring your Academic Plan</h3>
        <p className="text-sm text-blue-700 dark:text-blue-300 max-w-sm text-center px-6">
          Our AI is mapping the curriculum topics to your 12-week term structure. 
          This usually takes less than 60 seconds.
        </p>
        <div className="mt-8 w-64">
           <Progress value={45} className="h-1.5" />
           <p className="text-[10px] uppercase tracking-wider font-bold text-blue-500 mt-2 text-center">Optimizing Outcomes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Overview Card */}
      <Card className="overflow-hidden border-none shadow-premium bg-gradient-to-br from-indigo-600 to-blue-700 dark:from-indigo-900 dark:to-blue-900">
        <CardContent className="p-8 text-white relative">
          {/* Decorative Sparks */}
          <div className="absolute top-0 right-0 p-4 opacity-20 transform rotate-12">
            <Sparkles className="w-32 h-32" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md px-3 font-bold">
                  TERM {scheme.termId?.slice(-1) || '1'} 12-WEEK PLAN
                </Badge>
                <SchemeOfWorkStatusBadge status={scheme.status} />
              </div>
              
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight">Scheme of Work</h2>
                <p className="text-blue-100 mt-1 font-medium opacity-90 max-w-2xl">
                  {role === 'STUDENT' 
                    ? "Welcome to your learning journey! Here's what we'll be covering this term, explained simply."
                    : `Comprehensive weekly delivery plan optimized by Lois AI. Combined version ${scheme.version}.`}
                </p>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <div className="space-y-2 flex-1 max-w-xs">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-blue-100">
                    <span>Term Completion</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.5)]" 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 px-6 py-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
               <span className="text-4xl font-black">{weeks.filter(w => w.isDelivered).length}</span>
               <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Weeks Completed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Plan List */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-bold text-light-text-primary dark:text-dark-text-primary ml-1">
          <Clock className="w-5 h-5 text-blue-500" />
          Weekly Roadmap
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {weeks.map((week, index) => {
            const isExpanded = expandedWeek === index;
            const isDelivered = week.isDelivered;
            
            return (
              <FadeInUp key={week.id} delay={index * 0.05}>
                <div 
                  className={cn(
                    "group transition-all duration-300 rounded-2xl border bg-white dark:bg-dark-surface overflow-hidden",
                    isDelivered 
                      ? "border-green-200 dark:border-green-900/30 ring-1 ring-green-100 dark:ring-green-900/10" 
                      : "border-light-border dark:border-dark-border shadow-soft hover:shadow-lg hover:-translate-y-0.5",
                    isExpanded && "border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/10"
                  )}
                >
                  {/* Card Header Row */}
                  <div 
                    className="p-5 sm:p-6 flex items-center justify-between cursor-pointer select-none"
                    onClick={() => setExpandedWeek(isExpanded ? null : index)}
                  >
                    <div className="flex items-center gap-5 flex-1 min-w-0">
                      <div 
                        className={cn(
                          "flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center transition-colors border",
                          isDelivered 
                            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400" 
                            : "bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400"
                        )}
                      >
                        <span className="text-[10px] font-black uppercase tracking-tighter opacity-80 leading-none">Week</span>
                        <span className="text-xl font-black leading-tight">{week.weekNumber}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {isDelivered && (
                            <Badge variant="success" className="h-5 px-1.5 py-0 text-[10px] font-black uppercase bg-green-500 text-white border-none">
                              Completed
                            </Badge>
                          )}
                          <span className="text-[10px] font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-widest leading-none">
                            {week.assessmentType || "LECTURE"}
                          </span>
                        </div>
                        <h4 className="font-bold text-light-text-primary dark:text-dark-text-primary truncate sm:text-lg" style={{ fontSize: 'var(--text-card-title)' }}>
                          {week.topic}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 ml-4">
                      {role !== 'STUDENT' && !isReadOnly && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleDelivery(week.id, !!week.isDelivered);
                          }}
                          className={cn(
                            "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border uppercase tracking-wider",
                            isDelivered
                              ? "bg-green-600 text-white border-green-600 shadow-lg shadow-green-600/20"
                              : "bg-white dark:bg-dark-surface text-light-text-primary dark:text-white border-light-border dark:border-dark-border hover:border-blue-500"
                          )}
                        >
                          {isDelivered ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-current" />}
                          {isDelivered ? "Delivered" : "Mark as Delivered"}
                        </button>
                      )}
                      
                      <div className={cn(
                        "p-2 rounded-full transition-transform duration-300",
                        isExpanded ? "rotate-90 bg-light-bg dark:bg-dark-surface" : "text-light-text-muted"
                      )}>
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-light-border dark:border-dark-border bg-light-bg/30 dark:bg-dark-surface/30">
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Learning Outcomes */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                             <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                               <Star className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                             </div>
                             <h5 className="font-bold text-sm uppercase tracking-wider text-light-text-primary dark:text-dark-text-primary">
                               {role === 'STUDENT' ? "What you'll learn" : "Learning Outcomes"}
                             </h5>
                          </div>
                          
                          <ul className="space-y-3">
                            {(role === 'STUDENT' ? week.studentFriendlyOutcomes : week.learningOutcomes).map((outcome, idx) => (
                              <li key={idx} className="flex gap-3 text-sm text-light-text-secondary dark:text-dark-text-secondary leading-relaxed group/li">
                                <span className="flex-shrink-0 mt-1 h-3.5 w-3.5 rounded-full bg-blue-100 dark:bg-blue-900/60 border border-blue-200 dark:border-blue-700 flex items-center justify-center text-[8px] font-bold text-blue-600 dark:text-blue-400">
                                  {idx + 1}
                                </span>
                                {outcome}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Activities & Resources */}
                        <div className="space-y-6">
                           <div className="space-y-3">
                             <h5 className="text-[10px] font-black uppercase tracking-widest text-light-text-muted dark:text-dark-text-muted">Suggested Activities</h5>
                             <div className="flex flex-wrap gap-2">
                               {week.suggestedActivities.map((act, idx) => (
                                 <Badge key={idx} variant="outline" className="text-[10px] font-medium py-1 px-3 border-light-border dark:border-dark-border bg-white dark:bg-dark-surface">
                                   {act}
                                 </Badge>
                               ))}
                             </div>
                           </div>

                           <div className="space-y-3">
                             <h5 className="text-[10px] font-black uppercase tracking-widest text-light-text-muted dark:text-dark-text-muted">Study Resources</h5>
                             <div className="space-y-2">
                               {week.resources.map((res, idx) => (
                                 <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border group/res cursor-pointer hover:border-blue-400 transition-colors">
                                    <div className="p-1 px-2.5 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-bold text-xs">AI</div>
                                    <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary group-hover/res:text-blue-600 transition-colors">{res}</span>
                                    <ArrowRight className="w-4 h-4 ml-auto text-light-text-muted opacity-0 group-hover/res:opacity-100 transition-all" />
                                 </div>
                               ))}
                               {weeks[0].resources.length === 0 && (
                                 <p className="text-xs text-light-text-muted italic">No specific resources recommended by AI.</p>
                               )}
                             </div>
                           </div>
                        </div>
                      </div>

                      {/* Teacher Notes Footer */}
                      {role !== 'STUDENT' && (week.teacherNotes || week.privateTeacherNotes) && (
                        <div className="mx-6 mb-6 p-4 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 flex gap-4">
                           <Edit3 className="w-5 h-5 text-amber-600 flex-shrink-0" />
                           <div className="space-y-1">
                              <h6 className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400">Teacher's Strategic Notes</h6>
                              <p className="text-xs text-amber-900 dark:text-amber-200/80 leading-relaxed italic">
                                "{week.teacherNotes || week.privateTeacherNotes}"
                              </p>
                           </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </FadeInUp>
            );
          })}
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4 border-t border-light-border dark:border-dark-border opacity-60">
        <div className="flex items-center gap-2 text-xs text-light-text-muted dark:text-dark-text-muted">
           <Sparkles className="w-3.5 h-3.5" />
           <span>Dynamically generated academic delivery strategy</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-light-text-muted">
           <span className="flex items-center gap-1.5"><FileCheck className="w-3.5 h-3.5" /> Published {new Date(scheme.updatedAt).toLocaleDateString()}</span>
           <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Version {scheme.version}.0</span>
        </div>
      </div>
    </div>
  );
}
