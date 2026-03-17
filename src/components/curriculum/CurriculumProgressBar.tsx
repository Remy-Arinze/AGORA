'use client';

import React from 'react';

export interface CurriculumProgressBarProps {
  completed: number;
  total: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'linear' | 'circular';
}

export function CurriculumProgressBar({
  completed,
  total,
  showLabel = true,
  size = 'sm',
  variant = 'linear'
}: CurriculumProgressBarProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (variant === 'circular') {
    const strokeWidth = size === 'sm' ? 3 : size === 'md' ? 4 : 5;
    const radius = size === 'sm' ? 14 : size === 'md' ? 20 : 28;
    const center = size === 'sm' ? 16 : size === 'md' ? 24 : 32;
    const svgSize = size === 'sm' ? 32 : size === 'md' ? 48 : 64;

    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const colorClass = percentage === 100
      ? 'text-green-500'
      : percentage >= 50
        ? 'text-blue-500'
        : 'text-amber-500';

    return (
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center">
          <svg className="transform -rotate-90" width={svgSize} height={svgSize}>
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-500 ease-out ${colorClass}`}
            />
          </svg>
          {/* Optional center percentage */}
          {size !== 'sm' && !showLabel && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`font-semibold ${size === 'lg' ? 'text-sm' : 'text-xs'}`}>
                {percentage}%
              </span>
            </div>
          )}
        </div>

        {showLabel && (
          <div className="flex flex-col">
            <span className="text-xs text-light-text-muted dark:text-dark-text-muted leading-tight">
              Progress
            </span>
            <span className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary leading-tight">
              {completed}/{total} <span className="text-xs font-normal text-light-text-secondary dark:text-dark-text-secondary">weeks</span>
            </span>
          </div>
        )}
      </div>
    );
  }

  // Linear progression
  const height = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2.5';

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-light-text-muted dark:text-dark-text-muted">
            Progress
          </span>
          <span className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">
            {completed}/{total} weeks
          </span>
        </div>
      )}
      <div className={`w-full ${height} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}>
        <div
          className={`${height} rounded-full transition-all duration-300 ${percentage === 100
              ? 'bg-green-500'
              : percentage >= 50
                ? 'bg-blue-500'
                : 'bg-amber-500'
            }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {!showLabel && (
        <span className="text-xs text-light-text-muted dark:text-dark-text-muted mt-1">
          {percentage}%
        </span>
      )}
    </div>
  );
}

