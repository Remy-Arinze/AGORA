'use client';

import { useSubscription, SubscriptionTier } from '@/hooks/useSubscription';
import { useToolAccess } from '@/hooks/useToolAccess';
import { PricingTable } from '@/components/subscriptions/PricingTable';
import { FadeInUp } from '@/components/ui/FadeInUp';
import { Sparkles, Zap, ShieldCheck, ChevronDown } from 'lucide-react';

export default function SubscriptionPage() {
  const { subscription, summary, isLoading } = useSubscription();
  const { aiCredits, accessibleTools } = useToolAccess();

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-12 w-64 bg-light-card dark:bg-dark-surface rounded-lg"></div>
        <div className="h-[250px] w-full bg-light-card dark:bg-dark-surface rounded-3xl"></div>
        <div className="h-[600px] w-full bg-light-card dark:bg-dark-surface rounded-3xl"></div>
      </div>
    );
  }

  const tier = summary?.tier || SubscriptionTier.FREE;

  const tierInfo: Record<string, { name: string; color: string; bgClass: string; icon: any }> = {
    [SubscriptionTier.FREE]: {
      name: 'Free Plan',
      color: 'text-light-text-secondary dark:text-dark-text-secondary',
      bgClass: 'bg-gray-50 dark:bg-gray-900/40',
      icon: ShieldCheck
    },
    [SubscriptionTier.PRO]: {
      name: 'Pro',
      color: 'text-blue-600 dark:text-blue-400',
      bgClass: 'bg-blue-50 dark:bg-blue-900/20',
      icon: Sparkles
    },
    [SubscriptionTier.PRO_PLUS]: {
      name: 'Pro+',
      color: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-50 dark:bg-amber-900/20',
      icon: ShieldCheck
    },
    [SubscriptionTier.CUSTOM]: {
      name: 'Custom',
      color: 'text-purple-600 dark:text-purple-400',
      bgClass: 'bg-purple-50 dark:bg-purple-900/20',
      icon: Zap
    },
  };

  const currentTierInfo = tierInfo[tier];
  const Icon = currentTierInfo.icon;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12">
      {/* Header section */}
      <FadeInUp from={{ opacity: 0, y: 20 }} to={{ opacity: 1, y: 0 }} duration={0.6}>
        <div className="relative overflow-hidden rounded-3xl bg-light-card dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-md">
          <div className="relative p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">

              <div className="max-w-xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-light-bg dark:bg-dark-bg text-light-text-secondary dark:text-dark-text-secondary border border-light-border dark:border-dark-border" style={{ fontSize: 'var(--text-small)' }}>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Subscription active
                </div>
                <h1 className="font-extrabold tracking-tight text-light-text-primary dark:text-dark-text-primary" style={{ fontSize: 'var(--text-page-title)' }}>
                  Billing & Plans
                </h1>
                <p className="text-light-text-secondary dark:text-dark-text-secondary leading-relaxed" style={{ fontSize: 'var(--text-body)' }}>
                  Manage your subscription, track your AI token consumption, and unlock the full potential of Agora.
                </p>
              </div>

              {/* Current Plan Overview Card inside header */}
              <div className={`shrink-0 w-full md:w-80 p-6 rounded-2xl ${currentTierInfo.bgClass} border border-light-border dark:border-dark-border shadow-sm`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="uppercase tracking-widest text-light-text-muted dark:text-dark-text-muted mb-1" style={{ fontSize: 'var(--text-small)' }}>
                      Current Plan
                    </p>
                    <h2 className={`font-black ${currentTierInfo.color} flex items-center gap-2`} style={{ fontSize: 'var(--text-card-title)' }}>
                      <Icon className="w-5 h-5" />
                      {currentTierInfo.name}
                    </h2>
                  </div>
                </div>

                {subscription?.endDate && (
                  <p className="font-medium text-light-text-secondary dark:text-dark-text-secondary mb-6" style={{ fontSize: 'var(--text-small)' }}>
                    Renews on <span className="font-bold">{new Date(subscription.endDate).toLocaleDateString()}</span>
                  </p>
                )}

                <div className="space-y-4 pt-4 border-t border-light-border dark:border-dark-border">
                  <div className="flex justify-between items-center" style={{ fontSize: 'var(--text-body)' }}>
                    <span className="text-light-text-secondary dark:text-dark-text-secondary font-medium">AI Tokens</span>
                    <span className="font-bold text-light-text-primary dark:text-dark-text-primary">
                      {aiCredits.remaining === -1 ? 'Unlimited' : `${aiCredits.remaining.toLocaleString()}`}
                      {aiCredits.total > 0 && aiCredits.total !== -1 && (
                        <span className="text-light-text-muted dark:text-dark-text-muted font-medium"> / {aiCredits.total.toLocaleString()}</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center" style={{ fontSize: 'var(--text-body)' }}>
                    <span className="text-light-text-secondary dark:text-dark-text-secondary font-medium">Admin Seats</span>
                    <span className="font-bold text-light-text-primary dark:text-dark-text-primary">
                      {summary?.limits.maxAdmins === -1 ? 'Unlimited' : summary?.limits.maxAdmins}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeInUp>

      {/* Pricing Section */}
      <FadeInUp from={{ opacity: 0, scale: 0.95 }} to={{ opacity: 1, scale: 1 }} duration={0.6} delay={0.1}>
        <div className="text-center mb-10 mt-16">
          <h2 className="font-extrabold text-light-text-primary dark:text-dark-text-primary mb-4" style={{ fontSize: 'var(--text-section-title)' }}>
            {tier === SubscriptionTier.FREE ? 'Upgrade your workflow' : 'Manage your scaling'}
          </h2>
          <p className="text-light-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto" style={{ fontSize: 'var(--text-body)' }}>
            Agora AI generates high-quality curriculum, quizzes, and automated essay grades so your teachers can focus on teaching.
          </p>
        </div>

        <PricingTable />
      </FadeInUp>

      {/* Modern FAQ */}
      <FadeInUp from={{ opacity: 0, y: 30 }} to={{ opacity: 1, y: 0 }} duration={0.6} delay={0.2} className="pt-20">
        <div className="bg-light-card dark:bg-dark-surface rounded-3xl border border-light-border dark:border-dark-border p-8 md:p-12">
          <div className="flex flex-col md:flex-row gap-12">
            <div className="md:w-1/3">
              <div className="sticky top-8">
                <h3 className="font-bold text-light-text-primary dark:text-dark-text-primary mb-4" style={{ fontSize: 'var(--text-section-title)' }}>
                  Common questions
                </h3>
                <p className="text-light-text-secondary dark:text-dark-text-secondary" style={{ fontSize: 'var(--text-body)' }}>
                  Everything you need to know about billing, AI credits, and upgrading.
                </p>
                <div className="mt-8">
                  <a href="mailto:support@agora.ng" className="inline-flex items-center gap-2 font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors" style={{ fontSize: 'var(--text-body)' }}>
                    Get in touch <Zap className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            <div className="md:w-2/3 space-y-6">
              {[
                {
                  q: 'What happens when I upgrade?',
                  a: 'Your new plan activates immediately. You get instant access to the Agora AI engine and your AI credits will be instantly topped up to the new tier\'s allowance (e.g., 5,000 credits for Pro).'
                },
                {
                  q: 'How do AI Credits work?',
                  a: 'Every time a teacher generates a lesson plan, quiz, or grades an essay, a few tokens are consumed. For context, 5,000 tokens per month is enough to automatically grade thousands of handwritten essays.'
                },
                {
                  q: 'What if we run out of tokens mid-month?',
                  a: 'Your token bank resets automatically at the start of your billing cycle. If you hit your limit early, contact us or use the "Top Up" feature (coming soon) to buy discounted Token Packs instantly.'
                },
                {
                  q: 'Can I downgrade my plan?',
                  a: 'Yes, you can cancel or downgrade at any time. Your current plan will remain active for the remainder of the billing period.'
                }
              ].map((faq, i) => (
                <details key={i} className="group overflow-hidden rounded-2xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border">
                  <summary className="flex justify-between items-center cursor-pointer p-6 list-none font-semibold text-light-text-primary dark:text-dark-text-primary transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50" style={{ fontSize: 'var(--text-body)' }}>
                    {faq.q}
                    <ChevronDown className="w-5 h-5 text-light-text-muted dark:text-dark-text-muted group-open:-rotate-180 transition-transform duration-300" />
                  </summary>
                  <div className="px-6 pb-6 text-light-text-secondary dark:text-dark-text-secondary leading-relaxed" style={{ fontSize: 'var(--text-body)' }}>
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </FadeInUp>
    </div>
  );
}
