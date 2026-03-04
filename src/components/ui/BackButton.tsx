'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  /** Optional label, if provided shows text next to arrow */
  label?: string;
  /** Fallback URL if no history exists */
  fallbackUrl?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Reusable back navigation button
 * Uses router.back() to navigate to the previous page
 */
export function BackButton({
  label,
  fallbackUrl,
  className,
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    // Check if there's history to go back to (history.length includes the current page)
    if (typeof window !== 'undefined' && window.history.length > 2) {
      router.back();
    } else if (fallbackUrl) {
      router.push(fallbackUrl);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleBack}
      className={cn(
        'inline-flex items-center text-light-text-secondary dark:text-dark-text-secondary hover:text-[#2490FD] transition-colors focus:outline-none',
        className
      )}
      title={label || "Go Back"}
    >
      <ArrowLeft className="h-5 w-5" />
      {label && <span className="ml-2 font-medium">{label}</span>}
    </button>
  );
}

export default BackButton;

