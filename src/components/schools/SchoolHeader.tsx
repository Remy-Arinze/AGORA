'use client';

import { FadeInUp } from '@/components/ui/FadeInUp';
import { Button } from '@/components/ui/Button';
import { EntityAvatar } from '@/components/ui/EntityAvatar';
import { School } from '@/hooks/useSchools';
import { Pencil, Trash2 } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';

interface SchoolHeaderProps {
  school: School;
  onEdit: () => void;
  onDelete: () => void;
  onVerify?: () => void;
  onReject?: () => void;
  onActivate?: () => void;
  onDeactivate?: () => void;
}

export function SchoolHeader({ school, onEdit, onDelete, onVerify, onReject, onActivate, onDeactivate }: SchoolHeaderProps) {
  return (
    <FadeInUp from={{ opacity: 0, y: -20 }} to={{ opacity: 1, y: 0 }} className="mb-8">
      <BackButton className="mb-4" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* School Logo/Avatar */}
          <EntityAvatar
            name={school.name}
            imageUrl={school.logo || undefined}
            size="xl"
            variant="rounded"
          />
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                {school.name}
              </h1>

              {(school.registrationStatus === 'UNAPPROVED' || school.registrationStatus === 'PENDING') ? (
                <span
                  className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-medium"
                  style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
                >
                  Unapproved
                </span>
              ) : school.registrationStatus === 'REJECTED' ? (
                <span
                  className="px-3 py-1 bg-gray-500/10 text-gray-500 rounded-full text-xs font-medium"
                  style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
                >
                  Rejected
                </span>
              ) : !school.isActive ? (
                <span
                  className="px-3 py-1 bg-orange-500/10 text-orange-500 rounded-full text-xs font-medium"
                  style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
                >
                  Inactive
                </span>
              ) : (
                <span
                  className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-medium"
                  style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
                >
                  Active
                </span>
              )}
            </div>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              Detailed information about the school, admin, teachers, and plugins
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {school.registrationStatus === 'UNAPPROVED' && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={onVerify}
                className="bg-green-600 hover:bg-green-700 text-white font-medium"
                style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
              >
                Approve
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={onReject}
                className="text-red-600 border-red-200 hover:bg-red-50 font-medium"
                style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
              >
                Reject
              </Button>
            </>
          )}

          {school.registrationStatus === 'VERIFIED' && (
            school.isActive ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={onDeactivate}
                className="text-orange-600 border-orange-200 hover:bg-orange-50 font-medium"
                style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
              >
                Deactivate
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={onActivate}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
              >
                Activate
              </Button>
            )
          )}

          {((school.registrationStatus === 'UNAPPROVED' && (onVerify || onReject)) ||
            (school.registrationStatus === 'VERIFIED' && (onActivate || onDeactivate))) && (
              <div className="w-px h-6 bg-light-border dark:bg-dark-border mx-2" />
            )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="text-light-text-secondary dark:text-dark-text-secondary hover:text-[#2490FD] p-2"
            title="Edit School"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-light-text-secondary dark:text-dark-text-secondary hover:text-red-500 p-2"
            title="Delete School"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </FadeInUp >
  );
}

