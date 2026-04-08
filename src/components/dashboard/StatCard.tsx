'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { FadeInUp } from '@/components/ui/FadeInUp';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  trend?: number;
}

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  trend,
}: StatCardProps) {
  const changeColors = {
    positive: 'text-[var(--agora-success)]',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-dark-text-secondary',
  };

  return (
    <FadeInUp duration={0.3} className="h-full">
      <Card className="hover:shadow-lg transition-shadow duration-200 h-full">
        <CardContent className="h-full flex flex-col justify-center" style={{ padding: 'var(--stat-card-padding)' }}>
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)] mb-0.5 truncate" style={{ fontSize: 'var(--text-stat-label)' }}>
                {title}
              </p>
              <p className="font-bold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)] leading-tight truncate" style={{ fontSize: 'var(--text-stat-value)' }}>
                {value}
              </p>
              {change && (
                <div className="flex items-center gap-1 mt-0.5">
                  {changeType === 'positive' && (
                    <svg className="w-3 h-3 text-[var(--agora-success)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  )}
                  {changeType === 'negative' && (
                    <svg className="w-3 h-3 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                  )}
                  <span className={`font-medium ${changeColors[changeType]} truncate`} style={{ fontSize: 'var(--text-small)' }}>
                    {change}
                  </span>
                </div>
              )}
            </div>
            {icon && (
              <div className="flex-shrink-0 self-start sm:self-auto flex items-center justify-center bg-blue-500/10 dark:bg-blue-500/20 p-2 sm:p-2.5 rounded-xl h-10 w-10 sm:h-12 sm:w-12 transition-colors duration-200">
                {icon}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </FadeInUp>
  );
}

