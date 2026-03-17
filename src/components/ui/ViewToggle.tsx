'use client';

import { Grid3x3, List } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type Mode = 'grid' | 'list';

interface ViewToggleProps {
  value: Mode;
  onChange: (value: Mode) => void;
  className?: string;
}

export function ViewToggle({ value, onChange, className }: ViewToggleProps) {
  return (
    <div className={cn('flex items-center gap-1 border border-light-border dark:border-[#1a1f2e] rounded-lg p-1', className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange('grid')}
        className={cn(
          'h-8 w-8 p-0',
          value === 'grid'
            ? 'bg-[#2490FD] dark:bg-[#2490FD] text-white'
            : 'text-light-text-secondary dark:text-[#9ca3af] hover:text-light-text-primary dark:hover:text-white'
        )}
      >
        <Grid3x3 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange('list')}
        className={cn(
          'h-8 w-8 p-0',
          value === 'list'
            ? 'bg-[#2490FD] dark:bg-[#2490FD] text-white'
            : 'text-light-text-secondary dark:text-[#9ca3af] hover:text-light-text-primary dark:hover:text-white'
        )}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}
