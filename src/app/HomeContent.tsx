'use client';

import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { FadeInUp } from '@/components/ui/FadeInUp';
import { AnimateInView } from '@/components/ui/AnimateInView';
import { RootState } from '@/lib/store/store';
import { LandingNavbar } from '@/components/layout/LandingNavbar';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import { useGetPublicSchoolsQuery, useGetPlatformStatsQuery } from '@/lib/store/api/publicApi';
import { useState, useEffect, useRef } from 'react';
import { PricingTable } from '@/components/subscriptions/PricingTable';

// Helper to format large numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M+';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K+';
  }
  return num.toString() + '+';
};

export default function HomeContent() {
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted before using persisted auth state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Hide scrollbar on landing page
  useEffect(() => {
    document.documentElement.classList.add('scrollbar-hide');
    document.body.classList.add('scrollbar-hide');

    return () => {
      document.documentElement.classList.remove('scrollbar-hide');
      document.body.classList.remove('scrollbar-hide');
    };
  }, []);

  // Fetch real platform data
  const { data: stats, error: statsError, isLoading: statsLoading } = useGetPlatformStatsQuery();
  const { data: schools, error: schoolsError, isLoading: schoolsLoading } = useGetPublicSchoolsQuery();

  // Debug: log errors in development
  if (process.env.NODE_ENV === 'development') {
    if (statsError) console.error('Stats API error:', statsError);
    if (schoolsError) console.error('Schools API error:', schoolsError);
  }

  // Only use user state after hydration to avoid mismatch
  const isLoggedIn = isMounted && !!user;

  const handleGetStarted = () => {
    if (isLoggedIn && user) {
      const roleMap: Record<string, string> = {
        SUPER_ADMIN: '/dashboard/super-admin',
        SCHOOL_ADMIN: '/dashboard/school',
        TEACHER: '/dashboard/teacher',
        STUDENT: '/dashboard/student',
      };
      router.push(roleMap[user.role] || '/dashboard');
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--dark-bg)] text-[var(--dark-text-primary)] transition-colors duration-300 overflow-x-hidden relative">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-32 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto mt-12 md:mt-16 z-10">
          <FadeInUp from={{ opacity: 0, y: 30 }} to={{ opacity: 1, y: 0 }} delay={0.1} duration={0.8}>
            <h1 className="text-5xl md:text-[4rem] font-bold text-[var(--dark-text-primary)] leading-tight mb-8 tracking-tight font-heading">
              A digital borderless academic identity <br className="hidden md:block" /> for every student
            </h1>
          </FadeInUp>

          <FadeInUp from={{ opacity: 0, y: 20 }} to={{ opacity: 1, y: 0 }} delay={0.3} duration={0.8}>
            <p className="text-lg md:text-xl text-[var(--dark-text-secondary)] mb-12 max-w-2xl mx-auto leading-relaxed">
              One student identity, verified across every institution.
              Agora connects the African education ecosystem through a secure, lifelong registry.
            </p>
          </FadeInUp>

          <FadeInUp from={{ opacity: 0, y: 20 }} to={{ opacity: 1, y: 0 }} delay={0.5} duration={0.8} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              variant="primary"
              onClick={handleGetStarted}
              className="px-10 py-4 text-base rounded hover:scale-105 font-bold bg-agora-blue text-white w-full sm:w-auto hover:bg-agora-blue/90"
            >
              Get Started Free
            </Button>
            <Link href="#features" className="w-full sm:w-auto">
              <span className="inline-flex items-center justify-center px-10 py-4 text-base rounded hover:scale-105 font-bold border border-[var(--dark-text-primary)] text-[var(--dark-text-primary)] hover:bg-[var(--dark-text-primary)] hover:text-[var(--dark-bg)] transition-colors duration-300 w-full cursor-pointer">
                How it works
              </span>
            </Link>
          </FadeInUp>
        </div>

        {/* Dashboard Mockup Perspective */}
        <FadeInUp from={{ opacity: 0, y: 50 }} to={{ opacity: 1, y: 0 }} delay={0.7} duration={1} className="w-full max-w-5xl mx-auto mt-24 relative z-10 px-4">
          {/* Subtle glow behind the mockup */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[var(--agora-blue)]/20 blur-[100px] rounded-full pointer-events-none z-[-1]" />

          <div
            className="w-full rounded-xl border border-[var(--dark-border)] bg-[var(--dark-surface)] overflow-hidden relative mx-auto"
            style={{
              transform: "perspective(1200px) rotateX(12deg) scale(1.05)",
              transformOrigin: "top center",
              boxShadow: "0 25px 60px -12px rgba(0, 0, 0, 0.4), 0 0 40px 0 rgba(36, 144, 253, 0.1)"
            }}
          >
            {/* Top Bar of Mockup */}
            <div className="h-10 border-b border-white/5 bg-[#1b1b1c] flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <div className="ml-auto w-32 h-4 bg-white/5 rounded-full" />
            </div>

            {/* Dashboard Mockup Body */}
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-4 gap-6 bg-[#1f1f22]">
              {/* Sidebar Skeleton */}
              <div className="hidden md:flex flex-col gap-4 border-r border-white/5 pr-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded bg-agora-blue/20 flex-shrink-0" />
                  <div className="h-5 w-20 bg-white/10 rounded-md" />
                </div>
                {[...Array(6)].map((_, i) => (
                  <div key={`nav-${i}`} className="flex items-center gap-3 py-1">
                    <div className={`w-4 h-4 rounded-sm ${i === 1 ? 'bg-agora-blue' : 'bg-white/10'}`} />
                    <div className={`h-3 w-full rounded-md ${i === 1 ? 'bg-white/20' : 'bg-white/5'}`} />
                  </div>
                ))}
              </div>

              {/* Main Content Skeleton */}
              <div className="md:col-span-3 flex flex-col gap-6">
                <div className="flex justify-between items-center hidden sm:flex pb-2">
                  <div className="h-6 w-48 bg-white/10 rounded-md" />
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/10" />
                    <div className="w-8 h-8 rounded-full bg-white/10" />
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={`stat-${i}`} className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <div className="h-3 w-1/2 bg-white/10 rounded mb-3" />
                      <div className="h-7 w-3/4 bg-white/20 rounded mb-2" />
                      <div className="h-2 w-1/3 bg-agora-success/50 rounded" />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white/5 rounded-xl border border-white/5 h-[280px] p-5 relative overflow-hidden">
                    <div className="h-4 w-32 bg-white/10 rounded-md mb-8" />
                    {/* Simulated chart */}
                    <div className="absolute bottom-0 left-0 right-0 h-48 px-5 pb-5">
                      <div className="w-full h-full border-b border-l border-white/10 relative">
                        {/* Grid lines */}
                        <div className="absolute top-1/4 left-0 right-0 h-px bg-white/5" />
                        <div className="absolute top-2/4 left-0 right-0 h-px bg-white/5" />
                        <div className="absolute top-3/4 left-0 right-0 h-px bg-white/5" />

                        <svg className="absolute inset-0 w-full h-full text-agora-accent" preserveAspectRatio="none" viewBox="0 0 100 100">
                          <path d="M0,80 Q10,70 20,75 T40,50 T60,65 T80,30 T100,45 L100,100 L0,100 Z" fill="url(#gradient)" opacity="0.3" />
                          <path d="M0,80 Q10,70 20,75 T40,50 T60,65 T80,30 T100,45" fill="transparent" stroke="currentColor" strokeWidth="2.5" />
                          <defs>
                            <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
                              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl border border-white/5 p-5 flex flex-col h-[280px]">
                    <div className="h-4 w-28 bg-white/10 rounded-md mb-6" />
                    <div className="flex flex-col gap-4 flex-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={`list-${i}`} className="flex items-center gap-4">
                          <div className={`w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-agora-success' : 'bg-agora-blue'}`} />
                          <div className="flex-1">
                            <div className="h-3 w-full bg-white/10 rounded mb-1.5" />
                            <div className="h-2 w-1/2 bg-white/5 rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeInUp>
      </section>

      {/* Key Features Section */}
      <section data-navbar-light="true" className="py-24 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimateInView className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--dark-text-primary)] mb-4 font-heading">
              Powerful Unified Management System
            </h2>
            <p className="text-base md:text-lg text-[var(--dark-text-secondary)] max-w-2xl mx-auto">
              Everything schools need to digitize legacy records and verify student identities.
            </p>
          </AnimateInView>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimateInView from={{ opacity: 0, x: -30 }} to={{ opacity: 1, x: 0 }} className="flex gap-6 p-8 rounded-3xl hover:bg-white dark:hover:bg-white/5 border border-transparent hover:border-agora-blue/20 transition-all duration-300 group shadow-sm hover:shadow-xl">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-agora-blue/10 rounded-2xl flex items-center justify-center group-hover:bg-agora-blue transition-colors duration-300">
                  <svg className="w-8 h-8 text-agora-blue group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--dark-text-primary)] mb-3 font-heading">
                  Multi-Tenant Architecture
                </h3>
                <p className="text-sm text-[var(--dark-text-secondary)] leading-relaxed">
                  Each school gets a white-label portal with total isolation. Perfect for districts, networks, and government systems.
                </p>
              </div>
            </AnimateInView>

            <AnimateInView from={{ opacity: 0, x: 30 }} to={{ opacity: 1, x: 0 }} className="flex gap-6 p-8 rounded-3xl hover:bg-white dark:hover:bg-white/5 border border-transparent hover:border-agora-success/20 transition-all duration-300 group shadow-sm hover:shadow-xl">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-agora-success/10 rounded-2xl flex items-center justify-center group-hover:bg-agora-success transition-colors duration-300">
                  <svg className="w-8 h-8 text-agora-success group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--dark-text-primary)] mb-3 font-heading">
                  Secure & Immutable
                </h3>
                <p className="text-sm text-[var(--dark-text-secondary)] leading-relaxed">
                  Once a parent claims a profile, it becomes locked. We prevent identity fraud and ensure academic trust.
                </p>
              </div>
            </AnimateInView>

            <AnimateInView from={{ opacity: 0, x: -30 }} to={{ opacity: 1, x: 0 }} className="flex gap-6 p-8 rounded-3xl hover:bg-white dark:hover:bg-white/5 border border-transparent hover:border-agora-accent/20 transition-all duration-300 group shadow-sm hover:shadow-xl">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-agora-accent/10 rounded-2xl flex items-center justify-center group-hover:bg-agora-accent transition-colors duration-300">
                  <svg className="w-8 h-8 text-agora-accent group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--dark-text-primary)] mb-3 font-heading">
                  Seamless Transfers
                </h3>
                <p className="text-sm text-[var(--dark-text-secondary)] leading-relaxed">
                  Move between schools with complete academic history. Debt checking ensures clean transfers for institutions.
                </p>
              </div>
            </AnimateInView>

            <AnimateInView from={{ opacity: 0, x: 30 }} to={{ opacity: 1, x: 0 }} className="flex gap-6 p-8 rounded-3xl hover:bg-white dark:hover:bg-white/5 border border-transparent hover:border-agora-blue/20 transition-all duration-300 group shadow-sm hover:shadow-xl">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-agora-blue/10 rounded-2xl flex items-center justify-center group-hover:bg-agora-blue transition-colors duration-300">
                  <svg className="w-8 h-8 text-agora-blue group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--dark-text-primary)] mb-3 font-heading">
                  Offline-First
                </h3>
                <p className="text-sm text-[var(--dark-text-secondary)] leading-relaxed">
                  Works offline with local persistence. Perfect for areas with unreliable internet connectivity.
                </p>
              </div>
            </AnimateInView>
          </div>
        </div>
      </section>

      {/* Agora AI Section */}
      <section data-navbar-light="true" className="py-24 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimateInView from={{ opacity: 0, x: -30 }} to={{ opacity: 1, x: 0 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 text-blue-400 text-sm font-semibold mb-6">
                {/* <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg> */}
                Introducing Agora AI
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-[var(--dark-text-primary)] mb-6 leading-tight font-heading">
                Your Intelligent <br className="hidden md:block" />
                Education Assistant
              </h2>
              <p className="text-lg text-[var(--dark-text-secondary)] mb-8 leading-relaxed">
                Agora AI is designed to supercharge educators and administrators.
                Save countless hours on grading and gain deep insights into student performance with our advanced AI tools.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-[var(--dark-text-primary)] font-semibold text-lg mb-1 font-heading">Automated AI Grading</h4>
                    <p className="text-[var(--dark-text-secondary)] leading-relaxed text-sm">Instantly evaluating essays and assignments using custom rubrics, ensuring fair and consistent feedback.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
                    <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-[var(--dark-text-primary)] font-semibold text-lg mb-1 font-heading">Detailed Analytics</h4>
                    <p className="text-[var(--dark-text-secondary)] leading-relaxed text-sm">Get profound insights into cohort performance, identify learning gaps automatically, and personalize student paths.</p>
                  </div>
                </div>
              </div>
            </AnimateInView>

            <AnimateInView from={{ opacity: 0, x: 30 }} to={{ opacity: 1, x: 0 }} delay={0.2} className="relative mt-8 lg:mt-0">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 shadow-2xl backdrop-blur-sm group">
                <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors duration-500" />
                <div className="relative z-10 flex flex-col gap-6">
                  {/* Mock UI for AI Grading */}
                  <div className="bg-[var(--dark-surface)] rounded-xl p-4 border border-[var(--dark-border)] shadow-lg transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                    <div className="flex items-center gap-3 mb-3 border-b border-[var(--dark-border)] pb-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-[var(--dark-text-primary)]">English Essay Analysis</span>
                      <span className="ml-auto text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded-full">Graded in 1.2s</span>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="w-[85%] h-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                      </div>
                      <div className="flex justify-between text-xs text-[var(--dark-text-muted)]">
                        <span>Originality: 98%</span>
                        <span>Grammar: 92%</span>
                        <span className="text-agora-success font-medium">Score: 85/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Mock UI for AI Generation */}
                  <div className="bg-[var(--dark-surface)] rounded-xl p-4 border border-[var(--dark-border)] shadow-lg transform rotate-2 hover:rotate-0 transition-transform duration-300 ml-8">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 mt-1 shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-[var(--dark-text-primary)] block mb-1">Agora AI Assistant</span>
                        <p className="text-xs text-[var(--dark-text-secondary)] bg-[var(--dark-bg)] p-3 rounded-lg border border-[var(--dark-border)] leading-relaxed">
                          "Based on recent test scores, I recommend focusing next week's lesson on quadratic equations. Here is a generated lesson plan draft..."
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimateInView>
          </div>
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section id="pricing" data-navbar-light="true" className="py-24 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimateInView className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-indigo-900/50 text-indigo-400 rounded-full text-xs font-semibold mb-4">
              Flexible Pricing
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--dark-text-primary)] mb-4 font-heading">
              Simple, transparent pricing
            </h2>
            <p className="text-base md:text-lg text-[var(--dark-text-secondary)] max-w-2xl mx-auto">
              Choose the plan that best fits your institution's needs
            </p>
          </AnimateInView>

          <AnimateInView delay={0.2}>
            <PricingTable className="" />
          </AnimateInView>
        </div>
      </section>

      {/* Schools Using Agora Section */}
      <section data-navbar-light="true" className="py-24 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimateInView className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-blue-900/50 text-blue-400 rounded-full text-xs font-semibold mb-4">
              Trusted Partners
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--dark-text-primary)] mb-4 font-heading">
              Schools Using Agora
            </h2>
            <p className="text-base md:text-lg text-[var(--dark-text-secondary)] max-w-2xl mx-auto">
              Join the growing network of forward-thinking institutions
            </p>
          </AnimateInView>

          <AnimateInView delay={0.2} className="relative overflow-hidden">
            {/* Carousel - scrolling right to left */}
            <div className="relative py-8">
              {/* Gradient fade edges */}
              <div
                className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
                style={{
                  background: 'linear-gradient(to right, var(--dark-bg), transparent)',
                }}
              />
              <div
                className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
                style={{
                  background: 'linear-gradient(to left, var(--dark-bg), transparent)',
                }}
              />

              {schools && schools.length > 0 ? (
                <div className="flex gap-8 md:gap-12 animate-scroll items-center">
                  {/* First set of logos */}
                  {schools.map((school) => (
                    <div
                      key={school.id}
                      className="flex-shrink-0 flex items-center justify-center group"
                    >
                      {school.logo ? (
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center p-3 transition-transform duration-300 group-hover:scale-110 shadow-lg">
                          <Image
                            src={school.logo}
                            alt={school.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 border border-white/10">
                          <span className="text-white text-xl md:text-2xl font-bold">
                            {school.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                  {/* Duplicate set for seamless loop */}
                  {schools.map((school) => (
                    <div
                      key={`${school.id}-duplicate`}
                      className="flex-shrink-0 flex items-center justify-center group"
                    >
                      {school.logo ? (
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center p-3 transition-transform duration-300 group-hover:scale-110 shadow-lg">
                          <Image
                            src={school.logo}
                            alt={school.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 border border-white/10">
                          <span className="text-white text-xl md:text-2xl font-bold">
                            {school.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                // Show placeholder when no schools or loading
                <div className="flex gap-8 md:gap-12 items-center">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center opacity-40 border border-dashed border-gray-300 dark:border-gray-600"
                    >
                      <svg className="w-8 h-8 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </AnimateInView>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-20 left-20 w-64 h-64 bg-agora-blue rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-agora-accent rounded-full blur-3xl animate-pulse delay-1000" />
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <AnimateInView duration={0.8}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--dark-text-primary)] mb-6 leading-tight tracking-tight font-heading">
              Ready to Transform Education in Africa?
            </h2>
            <p className="text-base md:text-lg text-[var(--dark-text-secondary)] mb-12 max-w-3xl mx-auto leading-relaxed">
              Join schools, parents, and students building the future of
              digital education identity.
            </p>
          </AnimateInView>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--dark-bg)] text-[var(--dark-text-secondary)] py-16 border-t border-[var(--dark-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-1">
              <Image
                src="/assets/logos/agora_worded_white.png"
                alt="Agora - Verified Academic History Logo"
                width={140}
                height={38}
                className="h-8 w-auto mb-6 opacity-90 transition-opacity"
              />
              <p className="text-xs leading-relaxed text-[var(--dark-text-muted)] max-w-[240px]">
                The Chain-of-Trust Registry for the African education ecosystem. Securing academic identities forever.
              </p>
            </div>
            <div>
              <h4 className="text-[var(--agora-blue)] font-semibold mb-6 text-sm font-heading uppercase tracking-widest">Product</h4>
              <ul className="space-y-4 text-[var(--dark-text-secondary)] text-sm">
                <li><Link href="#features" className="hover:text-[var(--agora-blue)] transition-colors">Features</Link></li>
                <li><Link href="/products" className="hover:text-[var(--agora-blue)] transition-colors">Solutions</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[var(--agora-blue)] font-semibold mb-6 text-sm font-heading uppercase tracking-widest">Company</h4>
              <ul className="space-y-4 text-[var(--dark-text-secondary)] text-sm">
                <li><Link href="/about" className="hover:text-[var(--agora-blue)] transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-[var(--agora-blue)] transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[var(--agora-blue)] font-semibold mb-6 text-sm font-heading uppercase tracking-widest">Legal</h4>
              <ul className="space-y-4 text-[var(--dark-text-secondary)] text-sm">
                <li><Link href="/privacy" className="hover:text-[var(--agora-blue)] transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-[var(--agora-blue)] transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-[var(--dark-border)] flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[var(--dark-text-muted)]">&copy; 2026 Agora. All rights reserved.</p>
            <div className="flex gap-6">
              {/* Placeholder for social links if needed */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
