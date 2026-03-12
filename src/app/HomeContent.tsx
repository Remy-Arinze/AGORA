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
import { PricingTable } from '@/components/subscriptions/PricingTable';
import { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SkewSection } from '@/components/ui/SkewSection';
import { TransferVisual } from '@/components/ui/TransferVisual';

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

  // Initialize Lenis smooth scroll and sync with GSAP
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Refresh ScrollTrigger after a short delay for accurate positioning
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      lenis.destroy();
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
    };
  }, []);

  // Fetch real platform data
  const { data: stats, error: statsError, isLoading: statsLoading } = useGetPlatformStatsQuery();
  const { data: schools, error: schoolsError, isLoading: schoolsLoading } = useGetPublicSchoolsQuery();

  // Debug: log errors in development
  if (process.env.NODE_ENV === 'development') {
    if (statsError) {
      console.error('Stats API error detail:', {
        error: statsError,
        message: 'status' in statsError ? statsError.status : 'Unknown status',
        data: 'data' in statsError ? statsError.data : 'No data'
      });
    }
    if (schoolsError) {
      console.error('Schools API error detail:', {
        error: schoolsError,
        message: 'status' in schoolsError ? schoolsError.status : 'Unknown status',
        data: 'data' in schoolsError ? schoolsError.data : 'No data'
      });
    }
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

      {/* Global Background Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
        style={{ backgroundImage: 'radial-gradient(circle, var(--agora-blue) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-32 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto mt-12 md:mt-16 z-10">
          <FadeInUp from={{ opacity: 0, y: 30 }} to={{ opacity: 1, y: 0 }} delay={0.1} duration={0.8}>
            <h1 className="text-5xl md:text-[4rem] font-bold text-[var(--dark-text-primary)] leading-tight mb-8 tracking-tight font-heading">
              The Way We Manage Schools Can Be Better
            </h1>
          </FadeInUp>

          <FadeInUp from={{ opacity: 0, y: 20 }} to={{ opacity: 1, y: 0 }} delay={0.3} duration={0.8}>
            <p className="text-lg md:text-xl text-[var(--dark-text-secondary)] mb-12 max-w-2xl mx-auto leading-relaxed">
              Agora bridges the gap between fragmented data across schools, help manage activities, and facilitate transfer of students and their data across schools with a single click.
            </p>
          </FadeInUp>

          <FadeInUp from={{ opacity: 0, y: 20 }} to={{ opacity: 1, y: 0 }} delay={0.5} duration={0.8} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="md"
              variant="primary"
              onClick={handleGetStarted}
              className="rounded hover:scale-105 font-bold bg-agora-blue text-white w-full sm:w-auto hover:bg-agora-blue/90"
            >
              {isLoggedIn ? 'Go to dashboard' : 'Get Started Free'}
            </Button>
            <Link href="/about" className="w-full sm:w-auto">
              <span className="inline-flex items-center justify-center px-4 py-2 text-base rounded hover:scale-105 font-bold border border-[var(--dark-text-primary)] text-[var(--dark-text-primary)] hover:bg-[var(--dark-text-primary)] hover:text-[var(--dark-bg)] transition-colors duration-300 w-full cursor-pointer">
                How it works
              </span>
            </Link>
          </FadeInUp>
        </div>

        {/* Dashboard Mockup Perspective */}
        {/* Hero Banner Image */}
        <FadeInUp from={{ opacity: 0, y: 30 }} to={{ opacity: 1, y: 0 }} delay={0.6} duration={1} className="w-full max-w-6xl mx-auto mt-16 relative z-10 px-4">
          <div className="relative rounded-[2rem] overflow-hidden border border-[var(--dark-border)] h-[300px] md:h-[400px]">
            <Image
              src="/smiling_students_banner.png"
              alt="Smiling students collaborating"
              width={1920}
              height={1080}
              className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-1000"
              priority
            />
            {/* Subtle overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          </div>
        </FadeInUp>

        {/* Dashboard Mockup Perspective - Commented out for now
        <FadeInUp from={{ opacity: 0, y: 50 }} to={{ opacity: 1, y: 0 }} delay={0.7} duration={1} className="w-full max-w-5xl mx-auto mt-24 relative z-10 px-4">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

          <div
            className="w-full rounded-xl border border-[var(--dark-border)] bg-[var(--dark-surface)] overflow-hidden relative mx-auto transition-transform duration-700 hover:scale-[1.07] mockup-perspective"
            style={{
              transformOrigin: "top center",
              boxShadow: "0 25px 60px -12px rgba(0, 0, 0, 0.4), 0 0 40px 0 rgba(36, 144, 253, 0.1)"
            }}
          >
            <div className="h-10 border-b border-white/5 bg-[#1b1b1c] flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <div className="ml-auto w-32 h-4 bg-white/5 rounded-full" />
            </div>

            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-4 gap-6 bg-[#1f1f22]">
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
                    <div className="absolute bottom-0 left-0 right-0 h-48 px-5 pb-5">
                      <div className="w-full h-full border-b border-l border-white/10 relative">
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
        */}
      </section>

      {/* Command Center Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <AnimateInView className="max-w-2xl px-4 md:px-0">
              <span className="inline-block px-4 py-1.5 bg-agora-blue/10 text-agora-blue rounded-full text-[10px] md:text-xs font-bold mb-4 uppercase tracking-wider">
                Management
              </span>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[var(--dark-text-primary)] mb-6 font-heading tracking-tight leading-[1.1]">
                The Command Center <br /> for Modern Education.
              </h2>
              <p className="text-base md:text-lg text-[var(--dark-text-secondary)] leading-relaxed font-light">
                A comprehensive suite of tools designed to manage every aspect of your institution with surgical precision.
              </p>
            </AnimateInView>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Institutional Dashboard - Large Card */}
            <AnimateInView delay={0.1} className="lg:col-span-2 bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 rounded-[2.5rem] p-8 md:p-12 relative group overflow-hidden">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-agora-blue/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-agora-blue/20 transition-colors duration-700" />

              <div className="relative z-10">
                <div className="mb-10 md:mb-12">
                  <h3 className="text-2xl md:text-3xl font-bold text-[var(--dark-text-primary)] mb-4 font-heading">Institutional Dashboard</h3>
                  <p className="text-[var(--dark-text-secondary)] max-w-xl text-base md:text-lg font-light leading-relaxed">
                    Get a 360-degree view of your school's health. Monitor attendance, academic performance, and financial status in real-time.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                  <div className="p-6 md:p-8 rounded-3xl bg-[var(--dark-bg)]/20 border border-[var(--dark-border)] backdrop-blur-md">
                    <p className="text-xs md:text-sm text-[var(--dark-text-muted)] mb-2 font-medium">Active Students</p>
                    <p className="text-3xl md:text-4xl font-bold text-agora-blue tracking-tighter">2,450</p>
                    <div className="mt-4 h-1 w-full bg-agora-blue/20 rounded-full overflow-hidden">
                      <div className="h-full bg-agora-blue w-[85%] rounded-full" />
                    </div>
                  </div>

                  <div className="p-6 md:p-8 rounded-3xl bg-[var(--dark-bg)]/20 border border-[var(--dark-border)] backdrop-blur-md">
                    <p className="text-xs md:text-sm text-[var(--dark-text-muted)] mb-2 font-medium">Teacher Retention</p>
                    <p className="text-3xl md:text-4xl font-bold text-agora-success tracking-tighter">98%</p>
                    <div className="mt-4 h-1 w-full bg-agora-success/20 rounded-full overflow-hidden">
                      <div className="h-full bg-agora-success w-[98%] rounded-full" />
                    </div>
                  </div>

                  <div className="p-6 md:p-8 rounded-3xl bg-[var(--dark-bg)]/20 border border-[var(--dark-border)] backdrop-blur-md">
                    <p className="text-xs md:text-sm text-[var(--dark-text-muted)] mb-2 font-medium">Avg. Performance</p>
                    <p className="text-3xl md:text-4xl font-bold text-agora-accent tracking-tighter">A-</p>
                    <div className="mt-4 h-1 w-full bg-agora-accent/20 rounded-full overflow-hidden">
                      <div className="h-full bg-agora-accent w-[92%] rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </AnimateInView>

            <div className="flex flex-col gap-8">
              {/* Smart Scheduling */}
              <AnimateInView delay={0.2} className="flex-1 bg-[var(--dark-surface)]/30 border border-[var(--dark-border)] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 hover:bg-[var(--dark-surface)]/50 transition-colors group">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-6 h-6 md:w-7 md:h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-lg md:text-xl font-bold text-[var(--dark-text-primary)] mb-3 font-heading">Smart Scheduling</h4>
                <p className="text-[var(--dark-text-secondary)] text-sm leading-relaxed font-light">
                  Automated timetable generation that resolves teacher and room conflicts instantly using advanced algorithms.
                </p>
              </AnimateInView>

              {/* Financial & Term Management */}
              <AnimateInView delay={0.3} className="flex-1 bg-[var(--dark-surface)]/30 border border-[var(--dark-border)] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 hover:bg-[var(--dark-surface)]/50 transition-colors group">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-agora-success/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-6 h-6 md:w-7 md:h-7 text-agora-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg md:text-xl font-bold text-[var(--dark-text-primary)] mb-3 font-heading">Manage terms and Session</h4>
                <p className="text-[var(--dark-text-secondary)] text-sm leading-relaxed font-light">
                  Orchestrate academic sessions and fiscal cycles in total synchronization. Automate term transitions.
                </p>
              </AnimateInView>
            </div>
          </div>
        </div>
      </section>

      {/* Protocol Stream Section */}
      <section data-navbar-light="true" className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimateInView className="text-center mb-16 md:mb-24 px-4">
            <span className="inline-block px-4 py-1.5 bg-[var(--dark-surface)] border border-[var(--dark-border)] text-[var(--dark-text-muted)] rounded-full text-[10px] font-mono mb-6 uppercase tracking-[0.3em]">
              System_Protocol_v2.0
            </span>
            <h2 className="text-4xl md:text-6xl font-bold text-[var(--dark-text-primary)] mb-8 font-heading tracking-tighter leading-[1.1]">
              Unified Data <br /> Infrastructure
            </h2>
            <p className="text-base md:text-xl text-[var(--dark-text-secondary)] max-w-2xl mx-auto leading-relaxed font-light">
              Agora removes the administrative walls between institutions. Transfer students, their grades, and their entire legacy across the globe as fast as a single click securely.
            </p>
          </AnimateInView>

          {/* Protocol Stream Animation */}
          <div className="mb-32">
            <TransferVisual />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimateInView delay={0.1} className="p-6 md:p-8 rounded-2xl bg-[var(--dark-surface)]/20 border border-[var(--dark-border)] hover:border-agora-blue/20 transition-all duration-500 group relative overflow-hidden">
              <div className="flex justify-between items-start mb-6 md:mb-8">
                <div className="text-[10px] font-mono text-agora-blue uppercase tracking-widest opacity-50 group-hover:opacity-100 transition-opacity">
                  PRTCL_MGR_01
                </div>
                <div className="w-8 h-8 rounded-lg bg-agora-blue/5 flex items-center justify-center border border-agora-blue/10">
                  <svg className="w-4 h-4 text-agora-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-[var(--dark-text-primary)] mb-3 font-heading tracking-tight">Data In-Motion</h3>
              <p className="text-sm text-[var(--dark-text-secondary)] leading-relaxed font-light">
                Academic history, verified credentials, and institutional records flow through an encrypted, high-availability backbone.
              </p>
              <div className="mt-8 pt-6 border-t border-[var(--dark-border)] flex gap-2">
                <div className="w-1 h-1 rounded-full bg-agora-blue animate-pulse" />
                <div className="text-[9px] font-mono text-[var(--dark-text-muted)] uppercase">Status: Latency_Optimized</div>
              </div>
            </AnimateInView>

            <AnimateInView delay={0.2} className="p-6 md:p-8 rounded-2xl bg-[var(--dark-surface)]/20 border border-[var(--dark-border)] hover:border-agora-success/20 transition-all duration-500 group relative overflow-hidden">
              <div className="flex justify-between items-start mb-6 md:mb-8">
                <div className="text-[10px] font-mono text-agora-success uppercase tracking-widest opacity-50 group-hover:opacity-100 transition-opacity">
                  AUTH_NODE_02
                </div>
                <div className="w-8 h-8 rounded-lg bg-agora-success/5 flex items-center justify-center border border-agora-success/10">
                  <svg className="w-4 h-4 text-agora-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-[var(--dark-text-primary)] mb-3 font-heading tracking-tight">Smart Verification</h3>
              <p className="text-sm text-[var(--dark-text-secondary)] leading-relaxed font-light">
                Enforce zero-trust financial clearance and automated academic auditing before any data transition is authorized.
              </p>
              <div className="mt-8 pt-6 border-t border-[var(--dark-border)] flex gap-2">
                <div className="w-1 h-1 rounded-full bg-agora-success animate-pulse" />
                <div className="text-[9px] font-mono text-[var(--dark-text-muted)] uppercase">Status: Checksum_Verified</div>
              </div>
            </AnimateInView>

            <AnimateInView delay={0.3} className="p-6 md:p-8 rounded-2xl bg-[var(--dark-surface)]/20 border border-[var(--dark-border)] hover:border-agora-accent/20 transition-all duration-500 group relative overflow-hidden">
              <div className="flex justify-between items-start mb-6 md:mb-8">
                <div className="text-[10px] font-mono text-agora-accent uppercase tracking-widest opacity-50 group-hover:opacity-100 transition-opacity">
                  CONSENSUS_03
                </div>
                <div className="w-8 h-8 rounded-lg bg-agora-accent/5 flex items-center justify-center border border-agora-accent/10">
                  <svg className="w-4 h-4 text-agora-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-[var(--dark-text-primary)] mb-3 font-heading tracking-tight">Protocol Governance</h3>
              <p className="text-sm text-[var(--dark-text-secondary)] leading-relaxed font-light">
                Multi-institution consensus protocols ensure that both schools mutually acknowledge and secure the transfer process.
              </p>
              <div className="mt-8 pt-6 border-t border-[var(--dark-border)] flex gap-2">
                <div className="w-1 h-1 rounded-full bg-agora-accent animate-pulse" />
                <div className="text-[9px] font-mono text-[var(--dark-text-muted)] uppercase">Status: Protocol_Synced</div>
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
              <h2 className="text-3xl md:text-5xl font-bold text-[var(--dark-text-primary)] mb-6 leading-tight font-heading tracking-tight">
                Empower Teachers <br className="hidden md:block" />
                with Agora Ai
              </h2>
              <p className="text-lg text-[var(--dark-text-secondary)] mb-10 leading-relaxed font-light">
                Agora AI is an orchestral intelligence layer designed to remove cognitive load from educators.
                Transition from manual overhead to high-precision pedagogical oversight.
              </p>

              <div className="grid grid-cols-1 gap-6">
                {[
                  {
                    label: 'Assessment_Gen',
                    title: 'Generate math assessments in seconds',
                    desc: 'AI-driven question banking that adapts to curriculum standards and difficulty levels instantly.',
                    icon: (
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    ),
                    color: 'blue'
                  },
                  {
                    label: 'Neural_Grade',
                    title: 'Auto-grade essay submissions',
                    desc: 'Deep linguistic analysis providing students with instant, high-fidelity feedback and rubric-based scores.',
                    icon: (
                      <svg className="w-5 h-5 text-agora-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    ),
                    color: 'success'
                  },
                  {
                    label: 'Predictive_Ops',
                    title: 'Predict student performance trends',
                    desc: 'Machine learning models that identify students at risk and forecast academic outcomes across cohorts.',
                    icon: (
                      <svg className="w-5 h-5 text-agora-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    ),
                    color: 'accent'
                  },
                  {
                    label: 'Path_Optimization',
                    title: 'Personalize learning paths',
                    desc: 'Dynamically reconfigure curriculum delivery based on individual student mastery and velocity.',
                    icon: (
                      <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ),
                    color: 'indigo'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-5 group p-4 rounded-2xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5">
                    <div className={`w-12 h-12 rounded-xl bg-${item.color}-500/10 flex items-center justify-center shrink-0 border border-${item.color}-500/20 group-hover:scale-110 transition-transform duration-500`}>
                      {item.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-[var(--dark-text-primary)] font-bold text-base font-heading">{item.title}</h4>
                        <span className="text-[8px] font-mono text-[var(--dark-text-muted)] uppercase tracking-tighter pt-0.5">{item.label}</span>
                      </div>
                      <p className="text-[var(--dark-text-secondary)] leading-relaxed text-sm font-light">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AnimateInView>

            <AnimateInView from={{ opacity: 0, x: 30 }} to={{ opacity: 1, x: 0 }} delay={0.2} className="relative mt-12 lg:mt-0 px-4 md:px-0">
              <div className="relative rounded-3xl overflow-hidden border border-[var(--dark-border)] bg-gradient-to-br from-[var(--dark-surface)]/20 to-transparent p-6 md:p-8 shadow-xl backdrop-blur-sm group">
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

      {/* Schools Network Section */}
      <section data-navbar-light="true" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] bg-agora-blue/5 rounded-full blur-[160px] pointer-events-none opacity-50" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimateInView className="text-center mb-20 px-4">
            <span className="inline-block px-4 py-1.5 bg-agora-blue/10 border border-agora-blue/20 text-agora-blue rounded-full text-[10px] font-mono mb-6 uppercase tracking-[0.3em]">
              The_Agora_Network
            </span>
            <h2 className="text-4xl md:text-6xl font-bold text-[var(--dark-text-primary)] mb-8 font-heading tracking-tight leading-[1.1]">
              Schools Already <br className="md:hidden" /> Using Agora
            </h2>
            <p className="text-base md:text-xl text-[var(--dark-text-secondary)] max-w-2xl mx-auto leading-relaxed font-light">
              Join the growing ecosystem of world-class institutions digitizing the future of African education.
            </p>
          </AnimateInView>

          <AnimateInView delay={0.2} className="relative overflow-hidden">
            {/* Infinite Technical Marquee */}
            <div className="relative py-12">
              {/* Technical fade masks */}
              <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-[var(--dark-bg)] to-transparent z-10 pointer-events-none hidden md:block" />
              <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-[var(--dark-bg)] to-transparent z-10 pointer-events-none hidden md:block" />

              <div className="flex gap-6 animate-scroll mask-fade-out items-center">
                {schools && schools.length > 0 ? (
                  <>
                    {[...schools, ...schools].map((school, idx) => (
                      <div
                        key={`${school.id}-${idx}`}
                        className="flex-shrink-0 group"
                      >
                        <div className="relative p-6 rounded-2xl bg-[var(--dark-surface)]/20 border border-[var(--dark-border)] backdrop-blur-xl group-hover:border-agora-blue/30 group-hover:bg-[var(--dark-surface)]/40 transition-all duration-700 min-w-[240px] md:min-w-[280px]">
                          <div className="flex items-center gap-5">
                            {/* School Identifier */}
                            <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden bg-[var(--dark-bg)]/50 border border-[var(--dark-border)] flex items-center justify-center p-2 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                              {school.logo ? (
                                <Image
                                  src={school.logo}
                                  alt={school.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                                />
                              ) : (
                                <span className="text-agora-blue font-bold text-xl font-heading">
                                  {school.name.substring(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>

                            {/* Node Metadata */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs md:text-sm font-bold text-[var(--dark-text-primary)] truncate block font-heading">
                                  {school.name}
                                </span>
                                <div className="w-1.5 h-1.5 rounded-full bg-agora-success animate-pulse shrink-0" />
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] md:text-[10px] font-mono text-[var(--dark-text-muted)] uppercase tracking-widest">
                                  NODE_{idx.toString(16).padStart(3, '0').toUpperCase()}
                                </span>
                                <span className="text-[8px] font-mono text-agora-blue/50 group-hover:text-agora-blue transition-colors">
                                  CONNECTED
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  // Skeleton state
                  [1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="w-64 h-24 rounded-2xl bg-[var(--dark-surface)]/30 border border-[var(--dark-border)] animate-pulse shrink-0" />
                  ))
                )}
              </div>
            </div>
          </AnimateInView>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-40 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-agora-blue/5 rounded-full blur-[160px] pointer-events-none" />
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.07]">
            <div className="absolute top-20 left-20 w-96 h-96 bg-agora-blue rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-20 right-20 w-[600px] h-[600px] bg-agora-accent rounded-full blur-[120px] animate-pulse delay-1000" />
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <AnimateInView duration={0.8}>
            <span className="inline-block px-4 py-1.5 bg-agora-blue/10 border border-agora-blue/20 text-agora-blue rounded-full text-[10px] font-mono mb-10 uppercase tracking-[0.4em]">
              Final_Protocol_Handshake
            </span>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[var(--dark-text-primary)] mb-8 leading-[1.05] tracking-tight font-heading">
              Ready to Transform <br className="hidden md:block" /> Education in Africa?
            </h2>
            <p className="text-lg md:text-2xl text-[var(--dark-text-secondary)] mb-14 max-w-3xl mx-auto leading-relaxed font-light">
              Join schools, parents, and students building the future of digital education identity.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button
                size="lg"
                variant="primary"
                onClick={handleGetStarted}
                className="rounded-full px-16 py-8 text-xl hover:scale-105 font-bold transition-all shadow-[0_0_30px_rgba(36,144,253,0.3)] bg-agora-blue hover:bg-agora-blue/90"
              >
                {isLoggedIn ? 'Go to Dashboard' : 'Get Started Free'}
              </Button>
            </div>
          </AnimateInView>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--dark-bg)] text-[var(--dark-text-secondary)] py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-8">
            <div className="col-span-1 md:col-span-1">
              <Image
                src="/assets/logos/agora_worded_white.png"
                alt="Agora - Verified Academic History Logo"
                width={140}
                height={38}
                className="h-8 w-auto mb-8 opacity-90 transition-opacity"
              />
              <p className="text-xs leading-relaxed text-[var(--dark-text-muted)] max-w-[240px] font-light">
                The Chain-of-Trust Registry for the African education ecosystem. Securing academic identities forever.
              </p>
            </div>
            <div>
              <h4 className="text-[var(--dark-text-primary)] font-bold mb-8 text-sm font-heading uppercase tracking-widest">Product</h4>
              <ul className="space-y-4 text-[var(--dark-text-secondary)] text-sm font-light">
                <li><Link href="#features" className="hover:text-agora-blue transition-colors">Features</Link></li>
                <li><Link href="/products" className="hover:text-agora-blue transition-colors">Solutions</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[var(--dark-text-primary)] font-bold mb-8 text-sm font-heading uppercase tracking-widest">Company</h4>
              <ul className="space-y-4 text-[var(--dark-text-secondary)] text-sm font-light">
                <li><Link href="/about" className="hover:text-agora-blue transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-agora-blue transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[var(--dark-text-primary)] font-bold mb-8 text-sm font-heading uppercase tracking-widest">Legal</h4>
              <ul className="space-y-4 text-[var(--dark-text-secondary)] text-sm font-light">
                <li><Link href="/privacy" className="hover:text-agora-blue transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-agora-blue transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t border-[var(--dark-border)] flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-[var(--dark-text-muted)] font-light">&copy; 2026 Agora. All rights reserved.</p>
            <div className="flex gap-8">
              {/* Optional Social Icons */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
