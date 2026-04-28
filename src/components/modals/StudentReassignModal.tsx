'use client';

import { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader2, AlertCircle, RefreshCw, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { 
  useGetClassArmsQuery, 
  useGetClassLevelsQuery, 
  useReassignStudentMutation,
  type ReassignStudentDto
} from '@/lib/store/api/schoolAdminApi';
import { useCurrentAdminPermissions } from '@/hooks/usePermissions';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface StudentReassignModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    currentLevel: string;
    enrollmentId: string;
    academicYear: string;
  } | null;
  schoolId: string;
  schoolType: 'PRIMARY' | 'SECONDARY' | 'TERTIARY';
}

export function StudentReassignModal({
  isOpen,
  onClose,
  student,
  schoolId,
  schoolType
}: StudentReassignModalProps) {
  const { isPrincipal } = useCurrentAdminPermissions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reassignStudent] = useReassignStudentMutation();

  const [formData, setFormData] = useState({
    targetClassArmId: '',
    targetClassLevel: '',
    reason: '',
  });

  // Reset form when student changes or modal opens
  useEffect(() => {
    if (isOpen && student) {
      setFormData({
        targetClassArmId: '',
        targetClassLevel: student.currentLevel,
        reason: '',
      });
    }
  }, [isOpen, student]);

  // Fetch ClassArms and Levels for selection
  const { data: classArmsResponse, isLoading: isLoadingArms } = useGetClassArmsQuery(
    { schoolId, schoolType },
    { skip: !isOpen || !schoolId }
  );

  const { data: classLevelsResponse, isLoading: isLoadingLevels } = useGetClassLevelsQuery(
    { schoolId },
    { skip: !isOpen || !schoolId }
  );

  const arms = classArmsResponse?.data || [];
  const levels = classLevelsResponse?.data || [];

  // Group arms by level
  const armsByLevel = useMemo(() => {
    return levels.reduce((acc, level) => {
      acc[level.id] = arms.filter(arm => arm.classLevelId === level.id);
      return acc;
    }, {} as Record<string, typeof arms>);
  }, [arms, levels]);

  const isLevelChange = student && formData.targetClassLevel && student.currentLevel !== formData.targetClassLevel;
  const isRestricted = isLevelChange && !isPrincipal;

  const handleReassign = async () => {
    if (!student || !formData.targetClassLevel || !formData.targetClassArmId) {
      toast.error('Please select a target class.');
      return;
    }

    if (isRestricted) {
      toast.error('Cross-level reassignment requires principal approval.');
      return;
    }

    setIsSubmitting(true);
    try {
      const reassignDto: ReassignStudentDto = {
        targetClassLevel: formData.targetClassLevel,
        academicYear: student.academicYear,
        targetClassArmId: formData.targetClassArmId,
        reason: formData.reason,
      };

      await reassignStudent({
        schoolId,
        studentId: student.id,
        reassign: reassignDto,
      }).unwrap();

      toast.success('Student reassigned successfully');
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to reassign student');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reassign Student"
      size="md"
    >
      <div className="space-y-6">
        {/* Student Summary */}
        <div className="p-4 bg-light-surface dark:bg-dark-bg/50 rounded-xl border border-light-border dark:border-dark-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold">
              {student?.firstName[0]}{student?.lastName[0]}
            </div>
            <div>
              <p className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                {student?.firstName} {student?.lastName}
              </p>
              <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
                Current Level: <span className="font-medium text-blue-600 dark:text-blue-400">{student?.currentLevel}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Reassignment Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1.5">
              Target Class Selection
            </label>
            {isLoadingArms || isLoadingLevels ? (
              <div className="h-10 w-full bg-light-surface dark:bg-dark-surface animate-pulse rounded-md border border-light-border dark:border-dark-border" />
            ) : (
              <select
                value={formData.targetClassArmId}
                onChange={(e) => {
                  const selectedArm = arms.find(a => a.id === e.target.value);
                  setFormData({
                    ...formData,
                    targetClassArmId: e.target.value,
                    targetClassLevel: selectedArm ? selectedArm.classLevelName : '',
                  });
                }}
                className="w-full px-3 py-2 bg-light-card dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-md text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              >
                <option value="">Select the new class...</option>
                {levels.map(level => {
                  const levelArms = armsByLevel[level.id] || [];
                  if (levelArms.length === 0) return null;
                  return (
                    <optgroup key={level.id} label={level.name}>
                      {levelArms.map(arm => (
                        <option key={arm.id} value={arm.id}>
                          {level.name} - {arm.name}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1.5">
              Reason for Move (for school records)
            </label>
            <Input
              placeholder="e.g., Parent request, better fit for student performance..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />
          </div>

          {/* Security / Approval Context */}
          {isLevelChange && (
            <div className={cn(
              "p-4 rounded-xl border flex gap-3",
              isRestricted 
                ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30"
                : "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30"
            )}>
              {isRestricted ? (
                <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
              )}
              <div className="space-y-1">
                <p className={cn(
                  "text-sm font-semibold",
                  isRestricted ? "text-red-900 dark:text-red-300" : "text-amber-900 dark:text-amber-300"
                )}>
                  {isRestricted ? "Approval Required" : "Cross-Level Move Detected"}
                </p>
                <p className={cn(
                  "text-xs leading-relaxed",
                  isRestricted ? "text-red-800 dark:text-red-400/80" : "text-amber-800 dark:text-amber-400/80"
                )}>
                  {isRestricted 
                    ? "Moving a student to a different class level (e.g. JSS1 to JSS2) can only be performed by a Principal or School Administrator with elevated oversight."
                    : "You are moving this student to a different grade level. This action will be logged for administrative audit."
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleReassign}
            disabled={isSubmitting || isRestricted || !formData.targetClassArmId}
            className="gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isRestricted ? 'Restricted Action' : 'Complete Reassignment'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
