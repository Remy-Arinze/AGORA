'use client';

import Link from 'next/link';
import { LandingNavbar } from '@/components/layout/LandingNavbar';
import { PricingTable } from '@/components/subscriptions/PricingTable';
import { FadeInUp } from '@/components/ui/FadeInUp';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <LandingNavbar />
      <main className="pt-24 pb-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <FadeInUp from={{ opacity: 0, y: 16 }} to={{ opacity: 1, y: 0 }} duration={0.5}>
            <h1
              className="font-bold text-light-text-primary dark:text-dark-text-primary mb-4"
              style={{ fontSize: 'var(--text-page-title)' }}
            >
              Plans &amp; pricing
            </h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto" style={{ fontSize: 'var(--text-body)' }}>
              Transparent tiers for most schools, plus a <strong>Custom</strong> path when you&apos;re above{' '}
              <strong>2,000 students</strong> or need tailored limits. School leaders can upgrade in-app; larger
              institutions can request a quote — Super Admins curate custom plans in the dashboard.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium bg-blue-600 hover:bg-blue-700 text-white"
              >
                Sign in to upgrade
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium border border-light-border dark:border-dark-border text-light-text-primary dark:text-dark-text-primary hover:bg-light-card dark:hover:bg-dark-surface"
              >
                Back to home
              </Link>
            </div>
          </FadeInUp>
        </div>

        <PricingTable showInstitutionPlanCard className="px-0" />
      </main>
    </div>
  );
}
