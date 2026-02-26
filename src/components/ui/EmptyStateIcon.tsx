'use client';

import { cn } from '@/lib/utils';

/** Icon names under public/assets/icons used for empty states */
export type EmptyStateIconType =
  | 'person_outline'      // Staff, students, teachers, lecturers, no people
  | 'document_not_found'   // No results, no data, resources, subjects, courses, curriculum
  | 'document'             // Documents, reports (19.png)
  | 'location'             // Faculties, departments, building, levels
  | 'statistics';         // Dashboard, overview, permissions, timetable

const ICON_PATHS: Record<EmptyStateIconType, string> = {
  person_outline: '/assets/icons/person_outline.png',
  document_not_found: '/assets/icons/document_not_found_icon.png',
  document: '/assets/icons/19.png',
  location: '/assets/icons/location_icon.png',
  statistics: '/assets/icons/statistics_icon.png',
};

interface EmptyStateIconProps {
  type: EmptyStateIconType;
  className?: string;
  size?: number;
}

const DEFAULT_SIZE = 48;

export function EmptyStateIcon({ type, className, size = DEFAULT_SIZE }: EmptyStateIconProps) {
  const src = ICON_PATHS[type];
  const sizeClass = size === 48 ? 'h-12 w-12' : size === 32 ? 'h-8 w-8' : undefined;
  const style = sizeClass ? undefined : { width: size, height: size };

  return (
    <img
      src={src}
      alt=""
      role="presentation"
      className={cn('mx-auto mb-4 object-contain', sizeClass, className)}
      style={style}
    />
  );
}
