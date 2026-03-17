'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FadeInUp } from '@/components/ui/FadeInUp';
import {
  BookOpen,
  Clock,
  FileText,
  GraduationCap,
  Award,
  TrendingUp,
  Calendar,
  Loader2,
  AlertCircle,
  MapPin,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import {
  useGetUpcomingEventsQuery,
  useGetMyStudentCalendarQuery,
} from '@/lib/store/api/schoolAdminApi';
import {
  useStudentDashboard,
  getStudentTodaySchedule,
  getStudentTerminology
} from '@/hooks/useStudentDashboard';
import { format, parseISO } from 'date-fns';

export default function StudentOverviewPage() {
  // Use unified dashboard hook for core data
  const {
    student,
    school,
    schoolType,
    activeEnrollment,
    activeClass,
    activeTerm,
    timetable,
    stats,
    isLoading,
    hasError,
    errorMessage,
  } = useStudentDashboard();

  const terminology = getStudentTerminology(schoolType);
  const schoolId = school?.id;
  const activeTermId = activeTerm?.id;

  // Get today's schedule
  const todaySchedule = useMemo(() => {
    return getStudentTodaySchedule(timetable);
  }, [timetable]);

  // Get calendar data (events) for next 7 days
  const startDate = new Date().toISOString().split('T')[0];
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7);
  const endDateStr = endDate.toISOString().split('T')[0];

  const { data: calendarResponse } = useGetMyStudentCalendarQuery(
    { startDate, endDate: endDateStr },
    { skip: !schoolId }
  );
  const calendarData = calendarResponse?.data;
  const calendarEvents = calendarData?.events || [];

  // Get upcoming events (fallback to events query if calendar doesn't have events)
  const { data: upcomingEventsResponse } = useGetUpcomingEventsQuery(
    { schoolId: schoolId!, days: 7, schoolType: schoolType || undefined },
    { skip: !schoolId || (calendarEvents && calendarEvents.length > 0) }
  );
  const upcomingEvents = calendarEvents.length > 0 ? calendarEvents : (upcomingEventsResponse?.data || []);

  if (isLoading) {
    return (
      <ProtectedRoute roles={['STUDENT']}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-light-text-muted dark:text-dark-text-muted mx-auto mb-4 animate-spin" />
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              Loading dashboard...
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (hasError || !student) {
    return (
      <ProtectedRoute roles={['STUDENT']}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              {errorMessage || 'Unable to load student profile'}
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const studentName = `${student.firstName} ${student.lastName}`.trim();

  return (
    <ProtectedRoute roles={['STUDENT']}>
      <div className="w-full space-y-8 pb-10">
        {/* Personalized Welcome Section */}
        <FadeInUp from={{ opacity: 0, y: -20 }} to={{ opacity: 1, y: 0 }} duration={0.6}>
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-[2.5rem] overflow-hidden group transition-all duration-500 border border-blue-100/20 dark:border-blue-700/10">
            {/* Inner Glass Layer */}
            <div className="absolute inset-0 bg-white/40 dark:bg-white/5 backdrop-blur-3xl z-0" />

            {/* Animated accent gradient */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-500/10 to-transparent dark:from-blue-500/5 z-0" />

            <div className="relative flex-1 space-y-5 text-center md:text-left z-10 w-full">
              <div className="space-y-2">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <div className="h-1 w-8 bg-blue-600 rounded-full" />
                  <p className="font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-[0.1em]" style={{ fontSize: 'var(--text-body)' }}>Dashboard Overview</p>
                </div>
                <h1 className="font-black text-light-text-primary dark:text-dark-text-primary tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: '1' }}>
                  Hey, {student.firstName}! 👋
                </h1>
                <p className="text-light-text-secondary dark:text-dark-text-secondary max-w-lg" style={{ fontSize: 'var(--text-page-subtitle)' }}>
                  You&apos;re currently enrolled in <span className="font-bold text-blue-600 dark:text-blue-400">{activeEnrollment?.classLevel || 'your classes'}</span>.
                  Ready for today&apos;s journey?
                </p>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <Badge className="px-4 py-1.5 rounded-xl font-semibold border-blue-200/50 dark:border-blue-700/30 text-blue-600 dark:text-blue-400 bg-white/30 dark:bg-white/5 backdrop-blur-md" style={{ fontSize: 'var(--text-body)' }}>
                  {activeTerm?.name || 'Current Term'}
                </Badge>
                <Badge className="px-4 py-1.5 rounded-xl font-semibold border-blue-200/50 dark:border-blue-700/30 text-blue-600 dark:text-blue-400 bg-white/30 dark:bg-white/5 backdrop-blur-md" style={{ fontSize: 'var(--text-body)' }}>
                  {school?.name || 'Your School'}
                </Badge>
              </div>
            </div>

            <div className="relative hidden md:flex items-center gap-8 z-10">
              <div className="text-right">
                <p className="font-semibold text-light-text-muted uppercase tracking-[0.1em] mb-1" style={{ fontSize: 'var(--text-body)' }}>Academic Pulse</p>
                <p className="font-semibold text-blue-600 dark:text-blue-400" style={{ fontSize: 'var(--text-page-title)' }}>{stats.averageScore}%</p>
              </div>
              <div className="h-20 w-[1px] bg-gradient-to-b from-transparent via-blue-200 dark:via-blue-800 to-transparent" />
              <div className="relative">
                <div className="absolute inset-0 bg-black dark:bg-white blur-2xl opacity-5 group-hover:opacity-10 transition-opacity" />
                <GraduationCap className="h-16 w-16 text-black dark:text-white relative z-10 rotate-3 transform transition-transform group-hover:rotate-0" />
              </div>
            </div>
          </div>
        </FadeInUp>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="xl:col-span-2 space-y-8">

            {/* The "Daily Pulse" - Schedule & Events Combined */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="font-bold text-light-text-primary dark:text-dark-text-primary" style={{ fontSize: 'var(--text-card-title)' }}>
                  Your Daily Journey
                </h2>
                <Link href="/dashboard/student/timetables">
                  <Button variant="ghost" className="text-blue-600">Full Schedule</Button>
                </Link>
              </div>

              {todaySchedule.length > 0 ? (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-100 dark:before:bg-blue-900/40">
                  {todaySchedule.map((period: any, index: number) => {
                    const nowTime = new Date();
                    const [startHour, startMin] = period.startTime.split(':').map(Number);
                    const [endHour, endMin] = period.endTime.split(':').map(Number);
                    const startTime = new Date();
                    startTime.setHours(startHour, startMin, 0, 0);
                    const endTime = new Date();
                    endTime.setHours(endHour, endMin, 0, 0);
                    const isOngoing = nowTime >= startTime && nowTime <= endTime;
                    const isUpcoming = nowTime < startTime;

                    const isFreePeriod = period.type !== 'LESSON' ||
                      (!period.subjectName && !period.subject?.name && !period.courseName && !period.course?.name);

                    const periodTitle = isFreePeriod ? 'Study Break ☕' : (period.subjectName || period.subject?.name || period.courseName || period.course?.name);

                    return (
                      <FadeInUp key={period.id || index} delay={index * 0.1}>
                        <div className="relative group">
                          {/* Dot on the timeline */}
                          <div className={`absolute -left-[22px] top-6 w-3 h-3 rounded-full border-2 transition-all ${isOngoing ? 'bg-blue-600 border-white dark:border-blue-900 animate-ping' : 'bg-white dark:bg-blue-950 border-blue-200 dark:border-blue-900'
                            }`} />

                          <Card className={`overflow-hidden transition-all duration-300 ${isOngoing
                            ? 'border-blue-500 scale-[1.02]'
                            : 'hover:border-blue-300 dark:hover:border-blue-800'
                            }`}>
                            <CardContent className="p-5">
                              <div className="flex items-center justify-between gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                      {period.startTime} — {period.endTime}
                                    </p>
                                    {isOngoing && <Badge className="bg-blue-600 text-[10px] h-4">ACTIVE NOW</Badge>}
                                  </div>
                                  <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
                                    {periodTitle}
                                  </h3>
                                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary flex items-center gap-2">
                                    <MapPin className="h-3 w-3" />
                                    {period.roomName || period.room?.name || 'Room to be assigned'}
                                  </p>
                                </div>
                                {isFreePeriod ? (
                                  <Clock className="h-8 w-8 transition-colors text-black dark:text-white" />
                                ) : (
                                  <BookOpen className="h-8 w-8 transition-colors text-black dark:text-white" />
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </FadeInUp>
                    );
                  })}
                </div>
              ) : (
                <Card className="border-dashed py-12 text-center">
                  <div className="bg-slate-100 dark:bg-dark-surface h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-light-text-muted" />
                  </div>
                  <h3 className="text-lg font-bold">A Clean Slate!</h3>
                  <p className="text-light-text-secondary max-w-[200px] mx-auto text-sm">
                    No classes scheduled for today. Take some time for self-study and rest.
                  </p>
                </Card>
              )}
            </section>
          </div>

          {/* Side Column */}
          <div className="space-y-8">

            {/* Quick Shortcuts - More Visual */}
            <section className="space-y-4">
              <h2 className="font-bold px-2" style={{ fontSize: 'var(--text-card-title)' }}>Shortcuts</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Classes', icon: BookOpen, color: 'blue', link: '/dashboard/student/classes' },
                  { label: 'Results', icon: FileText, color: 'green', link: '/dashboard/student/results' },
                  { label: 'Resources', icon: GraduationCap, color: 'purple', link: '/dashboard/student/resources' },
                  { label: 'Calendar', icon: Calendar, color: 'orange', link: '/dashboard/student/calendar' }
                ].map((action, i) => (
                  <Link key={i} href={action.link}>
                    <button className="w-full group p-4 rounded-2xl bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border hover:border-blue-500 transition-all text-center space-y-3">
                      <action.icon className="h-6 w-6 mx-auto group-hover:scale-110 transition-transform text-black dark:text-white" />
                      <span className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary group-hover:text-blue-600 transition-colors">
                        {action.label}
                      </span>
                    </button>
                  </Link>
                ))}
              </div>
            </section>

            {/* Upcoming Events - Card Style */}
            {upcomingEvents.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h2 className="font-bold" style={{ fontSize: 'var(--text-card-title)' }}>Events</h2>
                  <Link href="/dashboard/student/calendar">
                    <Button variant="ghost" size="sm" className="text-xs">View All</Button>
                  </Link>
                </div>
                <Card className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white border-none overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-5 space-y-5">
                      {upcomingEvents.slice(0, 3).map((event: any, i: number) => (
                        <div key={i} className="flex gap-4 group cursor-pointer">
                          <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur-md flex flex-col items-center justify-center text-[10px] font-bold uppercase overflow-hidden shrink-0">
                            <span className="bg-white/40 w-full text-center py-0.5">{format(parseISO(event.startDate), 'MMM')}</span>
                            <span className="text-sm leading-none pt-1">{format(parseISO(event.startDate), 'd')}</span>
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold truncate group-hover:underline underline-offset-2">{event.title}</h4>
                            <p className="text-[11px] opacity-80">{format(parseISO(event.startDate), 'h:mm a')} • {event.location || 'Online'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-black/10 p-4 flex items-center justify-between text-xs font-bold border-t border-white/10 uppercase tracking-widest">
                      <span>3 Events Upcoming</span>
                      <TrendingUp className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Quick Stats Summary */}
            <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/40">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-light-text-muted uppercase tracking-widest mb-1">Knowledge Progress</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-black text-light-text-primary dark:text-dark-text-primary">{stats.averageScore}%</span>
                      <TrendingUp className="h-5 w-5 text-black dark:text-white" />
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                        style={{ width: `${stats.averageScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-light-text-muted uppercase tracking-wider">Reports In</p>
                      <p className="text-xl font-black">{stats.totalGrades}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-light-text-muted uppercase tracking-wider">New Grades</p>
                      <p className="text-xl font-black text-black dark:text-white">+{stats.recentGradesCount}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
