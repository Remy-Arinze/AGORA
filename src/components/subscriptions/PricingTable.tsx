'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { RootState } from '@/lib/store/store';
import { useSubscription, SubscriptionTier } from '@/hooks/useSubscription';
import {
  useGetPublicPlansQuery,
  useGetPlansForSchoolQuery,
  type SubscriptionPlanDto,
  type FeatureDto,
} from '@/lib/store/api/subscriptionsApi';
import { Check, X, Sparkles } from 'lucide-react';
import { FadeInUp } from '@/components/ui/FadeInUp';

const CUSTOM_PLAN_MAILTO =
  'mailto:sales@agora.ng?subject=Custom%20Agora%20plan%20(2000%2B%20students)&body=School%20name%3A%0AApproximate%20student%20count%3A%0AContact%20email%2Fphone%3A%0ANotes%3A';

function toFiniteNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

function formatNairaAmount(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Drop DB feature bullets that duplicate caps / credits so we can render from plan fields (source of truth). */
function isStaleCapacityFeature(text: string): boolean {
  const t = text.trim();
  return (
    /^(\d{1,7}|Unlimited)\s+students\b/i.test(t) ||
    /^(\d{1,7}|Unlimited)\s+teachers?\b/i.test(t) ||
    /^(\d{1,7}|Unlimited)\s+admin\b/i.test(t) ||
    /^\d{1,7}\s+Agora AI credits\b/i.test(t) ||
    /^No Agora AI\b/i.test(t) ||
    /^Unlimited Agora AI credits\b/i.test(t)
  );
}

function aiCreditsFeature(plan: SubscriptionPlanDto): FeatureDto {
  if (plan.aiCredits === -1) {
    return { text: 'Unlimited Agora AI credits / month', included: true, isGlowing: true };
  }
  if (plan.aiCredits === 0) {
    return { text: 'Agora AI Assistant & grading', included: false };
  }
  return {
    text: `${plan.aiCredits.toLocaleString('en-NG')} Agora AI credits / month`,
    included: true,
    isGlowing: true,
  };
}

function capacityFeatures(plan: SubscriptionPlanDto): FeatureDto[] {
  const students: FeatureDto =
    plan.maxStudents === -1
      ? { text: 'Unlimited students', included: true }
      : { text: `${Number(plan.maxStudents).toLocaleString('en-NG')} students`, included: true };
  const teachers: FeatureDto =
    plan.maxTeachers === -1
      ? { text: 'Unlimited teachers', included: true }
      : { text: `${Number(plan.maxTeachers).toLocaleString('en-NG')} teachers`, included: true };
  const admins: FeatureDto =
    plan.maxAdmins === -1
      ? { text: 'Unlimited admin users', included: true }
      : { text: `${Number(plan.maxAdmins).toLocaleString('en-NG')} admin users`, included: true };
  return [students, teachers, admins];
}

function mergePlanFeatures(plan: SubscriptionPlanDto): FeatureDto[] {
  const tail = (plan.features || []).filter((f) => !isStaleCapacityFeature(f.text));
  return [...capacityFeatures(plan), aiCreditsFeature(plan), ...tail];
}

interface PricingTableProps {
  onSelectPlan?: (tier: SubscriptionTier, isYearly: boolean) => void;
  className?: string;
  /** When true, shows a fourth “Custom (2000+ students)” column with quote request + super-admin hint. */
  showInstitutionPlanCard?: boolean;
}

export function PricingTable({ onSelectPlan, className = '', showInstitutionPlanCard = false }: PricingTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isYearly] = useState(false);
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null);

  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = !!user;

  const { subscription, canUpgradeTo, upgrade } = useSubscription();

  const currentTier = subscription?.tier || SubscriptionTier.FREE;

  const { data: publicPlansResponse, isLoading: isLoadingPublic } = useGetPublicPlansQuery(undefined, {
    skip: isAuthenticated,
  });

  const { data: schoolPlansResponse, isLoading: isLoadingSchool } = useGetPlansForSchoolQuery(undefined, {
    skip: !isAuthenticated,
  });

  const plans = useMemo(() => {
    if (isAuthenticated && schoolPlansResponse?.data) {
      return schoolPlansResponse.data;
    }
    if (!isAuthenticated && publicPlansResponse?.data) {
      return publicPlansResponse.data;
    }
    return [];
  }, [isAuthenticated, schoolPlansResponse, publicPlansResponse]);

  const isLoading = isAuthenticated ? isLoadingSchool : isLoadingPublic;

  // Auto-trigger plan selection if coming back from auth
  useEffect(() => {
    const planFromUrl = searchParams?.get('plan') as SubscriptionTier;
    if (isAuthenticated && planFromUrl && !isLoading && plans.length > 0) {
      const selectedPlan = plans.find(p => p.tierCode === planFromUrl);
      if (selectedPlan && canUpgradeTo(planFromUrl)) {
        // Scroll to pricing if not already there
        const pricingSection = document.getElementById('pricing');
        if (pricingSection) {
          pricingSection.scrollIntoView({ behavior: 'smooth' });
        }

        // Remove the param from URL to prevent re-triggering
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);

        handleSelectPlan(planFromUrl);
      }
    }
  }, [isAuthenticated, isLoading, plans, searchParams]);

  const handleSelectPlan = async (tier: SubscriptionTier) => {
    if (!isAuthenticated) {
      router.push(`/auth/login?plan=${tier}`);
      return;
    }

    setLoadingTier(tier);
    try {
      if (onSelectPlan) {
        await onSelectPlan(tier, isYearly);
      } else if (tier === SubscriptionTier.CUSTOM) {
        window.location.href = CUSTOM_PLAN_MAILTO;
      } else if (canUpgradeTo(tier)) {
        const result = await upgrade(tier, isYearly);
        if (result.success && result.url) {
          window.location.href = result.url;
        }
      }
    } finally {
      // Re-enable if it didn't redirect
      setLoadingTier(null);
    }
  };

  const formatPrice = (price: unknown, tierCode: string) => {
    const n = toFiniteNumber(price);
    if (tierCode === SubscriptionTier.PRO_PLUS && (n === null || n === 0)) return 'Contact Sales';
    if (tierCode === SubscriptionTier.CUSTOM && (n === null || n === 0)) return 'Custom';
    if (n === null || n === 0) return 'Free';
    return formatNairaAmount(n);
  };

  const gridCols = showInstitutionPlanCard ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3';
  const skeletonCount = showInstitutionPlanCard ? 4 : 3;

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 ${gridCols} gap-8 items-stretch max-w-7xl mx-auto ${className}`}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="animate-pulse bg-light-card dark:bg-dark-surface h-[600px] rounded-3xl border border-light-border dark:border-dark-border" />
        ))}
      </div>
    );
  }

  const institutionFeatures = [
    { text: '2,000+ students (tailored caps)', included: true },
    { text: 'Custom teachers, admins & AI credits', included: true },
    { text: 'Bespoke pricing & onboarding', included: true },
    { text: 'Assigned Agora success contact', included: true },
  ];

  return (
    <div className={className}>
      {/* Billing Toggle Removed */}

      {/* Pricing Cards */}
      <div className={`grid grid-cols-1 ${gridCols} gap-8 items-stretch max-w-7xl mx-auto`}>
        {plans.map((plan, i) => {
          const rawPrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
          const price = toFiniteNumber(rawPrice);
          const displayFeatures = mergePlanFeatures(plan);
          const isCurrentPlan = plan.tierCode === currentTier;
          const canSelect = canUpgradeTo(plan.tierCode as SubscriptionTier) || plan.tierCode === SubscriptionTier.CUSTOM;

          const isPrimary = plan.accent === 'blue';

          return (
            <FadeInUp
              key={plan.tierCode}
              from={{ opacity: 0, y: 30 }}
              to={{ opacity: 1, y: 0 }}
              duration={0.5}
              delay={i * 0.1}
              className={`relative flex flex-col h-full bg-light-card dark:bg-dark-surface rounded-3xl transition-all duration-500 ${plan.highlight
                ? 'border-2 border-primary dark:border-primary scale-[1.02] z-10'
                : 'border border-light-border dark:border-dark-border'
                }`}
            >
              {/* Popular Badge */}
              {plan.highlight && (
                <div className="absolute -top-4 inset-x-0 flex justify-center">
                  <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-500 text-white font-bold uppercase tracking-wider shadow-md">
                    <span style={{ fontSize: 'var(--text-small)' }}>Most Popular</span>
                  </div>
                </div>
              )}

              {/* Card Content Base */}
              <div className="p-8 flex-1 flex flex-col">
                <div className="mb-6">
                  <h3 className={`font-bold mb-1 ${isPrimary ? 'text-blue-600 dark:text-blue-400' : 'text-light-text-primary dark:text-dark-text-primary'
                    }`} style={{ fontSize: 'var(--text-section-title)' }}>
                    {plan.name}
                  </h3>
                  <p className="text-light-text-secondary dark:text-dark-text-secondary h-10" style={{ fontSize: 'var(--text-body)' }}>
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-5 pb-5 border-b border-light-border dark:border-dark-border flex flex-col gap-2">
                  <div className="flex items-end gap-2">
                    <div className="font-bold text-light-text-primary dark:text-dark-text-primary tracking-tight text-4xl tabular-nums">
                      {formatPrice(rawPrice, plan.tierCode)}
                    </div>
                    {price !== null && price > 0 && (
                      <div className="text-light-text-secondary dark:text-dark-text-secondary font-medium mb-1" style={{ fontSize: 'var(--text-body)' }}>
                        /mo
                      </div>
                    )}
                  </div>
                  {toFiniteNumber(plan.yearlyPrice) &&
                  toFiniteNumber(plan.monthlyPrice) &&
                  toFiniteNumber(plan.monthlyPrice)! > 0 ? (
                    <div className="text-xs text-green-600 dark:text-green-500 px-3 py-1 rounded-full w-fit ">
                      Save one month with annual billing
                    </div>
                  ) : null}
                </div>

                {/* Features List */}
                <ul className="flex-1 space-y-4 mb-8">
                  {displayFeatures.map((feature, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${feature.included
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
                        : 'bg-gray-100 text-light-text-muted dark:bg-gray-800 dark:text-dark-text-muted'
                        }`}>
                        {feature.included ? (
                          <Check className="w-3 h-3 stroke-[3]" />
                        ) : (
                          <X className="w-3 h-3 stroke-[3]" />
                        )}
                      </div>
                      <span className={`${feature.included
                        ? feature.isGlowing
                          ? 'font-semibold text-blue-600 dark:text-blue-400'
                          : 'text-light-text-primary dark:text-dark-text-primary font-medium'
                        : 'text-light-text-muted dark:text-dark-text-muted'
                        }`} style={{ fontSize: 'var(--text-body)' }}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(plan.tierCode)}
                  disabled={isCurrentPlan || loadingTier !== null || (!canSelect && plan.tierCode !== SubscriptionTier.FREE)}
                  className={`w-full py-4 px-6 rounded-xl font-bold transition-all duration-300 ${isCurrentPlan
                    ? 'bg-light-bg dark:bg-dark-bg text-light-text-muted dark:text-dark-text-muted cursor-not-allowed border border-light-border dark:border-dark-border'
                    : plan.highlight
                      ? 'bg-blue-600 hover:bg-blue-700 text-white border border-transparent'
                      : canSelect
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border border-transparent hover:bg-gray-800 dark:hover:bg-gray-100'
                        : 'bg-light-bg dark:bg-dark-bg text-light-text-muted dark:text-dark-text-muted cursor-not-allowed border border-light-border dark:border-dark-border'
                    }`}
                  style={{ fontSize: 'var(--text-body)' }}
                >
                  {loadingTier === plan.tierCode
                    ? 'Processing...'
                    : !isAuthenticated
                      ? (plan.tierCode === SubscriptionTier.FREE ? 'Continue' : 'Get Started')
                      : isCurrentPlan
                        ? 'Current Active Plan'
                        : (plan.tierCode === SubscriptionTier.FREE && currentTier !== SubscriptionTier.FREE)
                          ? 'Included in subscription'
                          : plan.cta}
                </button>
              </div>
            </FadeInUp>
          );
        })}

        {showInstitutionPlanCard && (
          <FadeInUp
            key="institution-custom"
            from={{ opacity: 0, y: 30 }}
            to={{ opacity: 1, y: 0 }}
            duration={0.5}
            delay={plans.length * 0.1}
            className="relative flex flex-col h-full bg-light-card dark:bg-dark-surface rounded-3xl border border-violet-300/80 dark:border-violet-700/60 transition-all duration-500"
          >
            <div className="absolute -top-4 inset-x-0 flex justify-center">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-violet-600 text-white font-bold uppercase tracking-wider shadow-md text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                Institutions
              </div>
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <div className="mb-6">
                <h3
                  className="font-bold mb-1 text-violet-700 dark:text-violet-300"
                  style={{ fontSize: 'var(--text-section-title)' }}
                >
                  Custom
                </h3>
                <p className="text-light-text-secondary dark:text-dark-text-secondary h-10" style={{ fontSize: 'var(--text-body)' }}>
                  For schools above 2,000 students or unique requirements — we design limits and pricing with you.
                </p>
              </div>
              <div className="mb-5 pb-5 border-b border-light-border dark:border-dark-border flex flex-col gap-2">
                <div className="font-bold text-light-text-primary dark:text-dark-text-primary tracking-tight text-3xl">
                  Let&apos;s talk
                </div>
                <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Curated plans, linked to your school after Agora confirms scope.
                </div>
              </div>
              <ul className="flex-1 space-y-4 mb-8">
                {institutionFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="text-light-text-primary dark:text-dark-text-primary font-medium" style={{ fontSize: 'var(--text-body)' }}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              <a
                href={CUSTOM_PLAN_MAILTO}
                className="w-full py-4 px-6 rounded-xl font-bold transition-all duration-300 bg-violet-600 hover:bg-violet-700 text-white border border-transparent text-center mb-3"
                style={{ fontSize: 'var(--text-body)' }}
              >
                Request a quote
              </a>
              {user?.role === 'SUPER_ADMIN' && (
                <Link
                  href="/dashboard/super-admin/plans"
                  className="w-full py-3 px-6 rounded-xl font-semibold text-center border border-violet-400/60 dark:border-violet-600 text-violet-800 dark:text-violet-200 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors text-sm"
                >
                  Create or assign plan (Super Admin)
                </Link>
              )}
              <p className="mt-3 text-xs text-center text-light-text-muted dark:text-dark-text-muted">
                Super Admins: use Subscription Plans to attach a non-public CUSTOM plan to a school after agreeing pricing.
              </p>
            </div>
          </FadeInUp>
        )}
      </div>
    </div>
  );
}
