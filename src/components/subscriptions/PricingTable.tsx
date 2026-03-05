'use client';

import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { useSubscription, SubscriptionTier } from '@/hooks/useSubscription';
import { useGetPublicPlansQuery, useGetPlansForSchoolQuery } from '@/lib/store/api/subscriptionsApi';
import { Check, X, Sparkles } from 'lucide-react';
import { FadeInUp } from '@/components/ui/FadeInUp';

interface PricingTableProps {
  onSelectPlan?: (tier: SubscriptionTier, isYearly: boolean) => void;
  className?: string;
}

export function PricingTable({ onSelectPlan, className = '' }: PricingTableProps) {
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

  const handleSelectPlan = async (tier: SubscriptionTier) => {
    setLoadingTier(tier);
    try {
      if (onSelectPlan) {
        await onSelectPlan(tier, isYearly);
      } else if (tier === SubscriptionTier.CUSTOM) {
        window.location.href = 'mailto:sales@agora.ng?subject=Custom%20Plan%20Inquiry';
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

  const formatPrice = (price: number | null, tierCode: string) => {
    if (tierCode === SubscriptionTier.PRO_PLUS && (price === null || price === 0)) return 'Contact Sales';
    if (tierCode === SubscriptionTier.CUSTOM && (price === null || price === 0)) return 'Custom';
    if (price === 0) return 'Free';
    return `₦${price?.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-light-card dark:bg-dark-surface h-[600px] rounded-3xl border border-light-border dark:border-dark-border" />
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Billing Toggle Removed */}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
        {plans.map((plan, i) => {
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
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
                    <div className="font-bold text-light-text-primary dark:text-dark-text-primary tracking-tight text-4xl">
                      {formatPrice(price, plan.tierCode)}
                    </div>
                    {price !== null && price > 0 && (
                      <div className="text-light-text-secondary dark:text-dark-text-secondary font-medium mb-1" style={{ fontSize: 'var(--text-body)' }}>
                        /mo
                      </div>
                    )}
                  </div>
                  {plan.yearlyPrice && plan.monthlyPrice && plan.monthlyPrice > 0 ? (
                    <div className="text-xs text-green-600 dark:text-green-500 px-3 py-1 rounded-full w-fit ">
                      Save one month with annual billing
                    </div>
                  ) : null}
                </div>

                {/* Features List */}
                <ul className="flex-1 space-y-4 mb-8">
                  {plan.features.map((feature: any, index: number) => (
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
                    : isCurrentPlan
                      ? 'Current Active Plan'
                      : plan.cta}
                </button>
              </div>
            </FadeInUp>
          );
        })}
      </div>
    </div>
  );
}
