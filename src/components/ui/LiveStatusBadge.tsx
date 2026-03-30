import React from 'react';
import { Badge } from './Badge';
import { Clock, BookOpen, Coffee, Sun, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CurrentActivity {
  type: string;
  title: string;
  location?: string;
  context?: string;
  startTime: string;
  endTime: string;
}

interface LiveStatusBadgeProps {
  activity?: CurrentActivity | null;
  className?: string;
  showIcon?: boolean;
  showDetails?: boolean;
  size?: 'sm' | 'md';
}

export function LiveStatusBadge({ 
  activity, 
  className, 
  showIcon = true, 
  showDetails = false,
  size = 'md'
}: LiveStatusBadgeProps) {
  if (!activity) {
    return (
      <div className={cn("flex items-center gap-1.5 text-light-text-muted dark:text-dark-text-muted", className)}>
        <div className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-700" />
        <span style={{ fontSize: size === 'sm' ? 'var(--text-tiny)' : 'var(--text-body)' }}>Available</span>
      </div>
    );
  }

  const isLesson = activity.type === 'LESSON' || activity.type === 'LECTURE';
  const isBreak = activity.type === 'BREAK' || activity.type === 'LUNCH';
  
  let icon = <Clock className="h-3 w-3" />;
  if (isLesson) icon = <BookOpen className="h-3 w-3" />;
  if (activity.type === 'BREAK') icon = <Coffee className="h-3 w-3" />;
  if (activity.type === 'LUNCH') icon = <Utensils className="h-3 w-3" />;
  if (activity.type === 'ASSEMBLY') icon = <Sun className="h-3 w-3" />;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center gap-2">
        <Badge 
          variant={isLesson ? 'success' : isBreak ? 'warning' : 'info'}
          className={cn(
            "flex items-center gap-1.5 px-2 py-0.5 rounded-full whitespace-nowrap animate-pulse",
            size === 'sm' ? "text-[10px]" : "text-xs"
          )}
        >
          {showIcon && icon}
          <span className="font-bold">LIVE: {activity.title}</span>
        </Badge>
        {size === 'md' && activity.location && (
          <span className="text-[10px] text-light-text-muted dark:text-dark-text-muted italic">
            @{activity.location}
          </span>
        )}
      </div>
      
      {showDetails && activity.context && (
        <p className="text-[10px] text-light-text-secondary dark:text-dark-text-secondary pl-1">
          {activity.context} • {activity.startTime} - {activity.endTime}
        </p>
      )}
    </div>
  );
}
