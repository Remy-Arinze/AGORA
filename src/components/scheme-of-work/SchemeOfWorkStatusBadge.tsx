'use client';

import React from 'react';

interface SchemeOfWorkStatusBadgeProps {
  status: 'GENERATING' | 'DRAFT' | 'APPROVED' | 'PUBLISHED' | 'FAILED' | null;
  size?: 'sm' | 'md';
}

export function SchemeOfWorkStatusBadge({ status, size = 'sm' }: SchemeOfWorkStatusBadgeProps) {
  const getStatusConfig = (status: string | null) => {
    switch (status) {
      case 'GENERATING':
        return {
          label: 'Generating AI Plan...',
          className: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 animate-pulse',
        };
      case 'DRAFT':
        return {
          label: 'In Review',
          className: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
        };
      case 'APPROVED':
        return {
          label: 'Approved',
          className: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
        };
      case 'PUBLISHED':
        return {
          label: 'Live / Published',
          className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
        };
      case 'FAILED':
        return {
          label: 'AI Error',
          className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        };
      default:
        return {
          label: 'No Scheme Generated',
          className: 'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
        };
    }
  };

  const config = getStatusConfig(status);
  const sizeClass = size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-bold tracking-tight rounded-full uppercase ${sizeClass} ${config.className}`}>
      {config.label}
    </span>
  );
}
