import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    const percentage = Math.min(Math.max(0, value), max);

    return (
      <div
        ref={ref}
        className={cn(
          'relative h-4 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800',
          className
        )}
        {...props}
      >
        <div
          className="h-full w-full flex-1 bg-blue-600 transition-all duration-300 ease-in-out dark:bg-blue-500"
          style={{ transform: `translateX(-${100 - (percentage / max) * 100}%)` }}
        />
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };
