'use client';

import { School } from '@/hooks/useSchools';
import { Users, UserCog, Clock, CheckCircle2, XCircle, CreditCard } from 'lucide-react';

interface SchoolStatsCardProps {
  school: School;
  subscriptionTier?: string | null;
}

const TIER_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  FREE:     { bg: 'bg-gray-100 dark:bg-gray-800',         text: 'text-gray-600 dark:text-gray-400',   label: 'Free'      },
  PRO:      { bg: 'bg-blue-100 dark:bg-blue-900/30',      text: 'text-blue-700 dark:text-blue-400',   label: 'Pro'       },
  PRO_PLUS: { bg: 'bg-purple-100 dark:bg-purple-900/30',  text: 'text-purple-700 dark:text-purple-400', label: 'Pro Plus' },
  CUSTOM:   { bg: 'bg-amber-100 dark:bg-amber-900/30',    text: 'text-amber-700 dark:text-amber-400', label: 'Custom'    },
};

function StatRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-[var(--light-bg)] dark:bg-[var(--dark-surface)] rounded-lg">
      <div className="flex items-center gap-2">
        {icon}
        <span
          className="text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)]"
          style={{ fontSize: 'var(--text-body)' }}
        >
          {label}
        </span>
      </div>
      {value}
    </div>
  );
}

export function SchoolStatsCard({ school, subscriptionTier }: SchoolStatsCardProps) {
  const tier = subscriptionTier?.toUpperCase() ?? 'FREE';
  const tierStyle = TIER_STYLES[tier] ?? TIER_STYLES.FREE;

  return (
    <div className="space-y-2">
      {/* Teachers */}
      <StatRow
        icon={<Users className="h-4 w-4 text-green-600 dark:text-green-400" />}
        label="Teachers"
        value={
          <span
            className="font-bold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]"
            style={{ fontSize: 'var(--text-section-title)' }}
          >
            {school.teachersCount}
          </span>
        }
      />

      {/* Admins */}
      <StatRow
        icon={<UserCog className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
        label="Admins"
        value={
          <span
            className="font-bold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)]"
            style={{ fontSize: 'var(--text-section-title)' }}
          >
            {school.admins.length}
          </span>
        }
      />

      {/* Created */}
      <StatRow
        icon={<Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
        label="Created"
        value={
          <span
            className="text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)]"
            style={{ fontSize: 'var(--text-body)' }}
          >
            {new Date(school.createdAt).toLocaleDateString()}
          </span>
        }
      />

      {/* Status */}
      <StatRow
        icon={
          school.isActive
            ? <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            : <XCircle className="h-4 w-4 text-gray-400" />
        }
        label="Status"
        value={
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-medium ${
              school.isActive
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
            }`}
            style={{ fontSize: 'var(--text-small)' }}
          >
            {school.isActive ? 'Active' : 'Inactive'}
          </span>
        }
      />

      {/* Subscription tier */}
      <StatRow
        icon={<CreditCard className="h-4 w-4 text-[var(--agora-blue)]" />}
        label="Plan"
        value={
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full font-medium ${tierStyle.bg} ${tierStyle.text}`}
            style={{ fontSize: 'var(--text-small)' }}
          >
            {tierStyle.label}
          </span>
        }
      />
    </div>
  );
}
