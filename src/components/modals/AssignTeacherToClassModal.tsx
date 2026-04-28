'use client';

import { useState, useMemo, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { 
  useGetStaffListQuery,
  useAssignTeacherToClassMutation,
  useGetClassesQuery,
  StaffListItem,
} from '@/lib/store/api/schoolAdminApi';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Loader2, Search, User, CheckCircle } from 'lucide-react';

interface AssignTeacherToClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
  classId: string;
  className: string;
  schoolType: 'PRIMARY' | 'SECONDARY' | 'TERTIARY';
  existingTeachers: Array<{ teacherId: string; subject: string | null; isPrimary: boolean }>;
  onSuccess?: () => void;
}

export function AssignTeacherToClassModal({
  isOpen,
  onClose,
  schoolId,
  classId,
  className,
  schoolType,
  existingTeachers,
  onSuccess,
}: AssignTeacherToClassModalProps) {
  const [selectedTeacher, setSelectedTeacher] = useState<StaffListItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch teachers
  const { data: staffResponse, isLoading: isLoadingStaff } = useGetStaffListQuery(
    { schoolType }, // Backend filtering preferred
    { skip: !isOpen }
  );

  // Fetch all PRIMARY classes to get already-assigned teachers (only for PRIMARY schools)
  const { data: allClassesResponse, isLoading: isLoadingClasses } = useGetClassesQuery(
    { schoolId, type: 'PRIMARY' },
    { skip: !isOpen || schoolType !== 'PRIMARY' }
  );

  const [assignTeacher, { isLoading: isAssigning }] = useAssignTeacherToClassMutation();

  // Filter to only show teachers
  const teachers = useMemo(() => {
    const allStaff: StaffListItem[] = staffResponse?.data?.items || [];
    return allStaff.filter((s: StaffListItem) => s.type === 'teacher');
  }, [staffResponse]);

  // Get teacher IDs who are already assigned as form teachers in OTHER PRIMARY classes
  const teachersAssignedToOtherClasses = useMemo(() => {
    if (schoolType !== 'PRIMARY' || !allClassesResponse?.data) return new Set<string>();
    
    const assignedIds = new Set<string>();
    allClassesResponse.data.forEach((cls) => {
      if (cls.id === classId) return;
      cls.teachers?.forEach((teacher) => {
        if (teacher.isPrimary) {
          assignedIds.add(teacher.teacherId);
        }
      });
    });
    
    return assignedIds;
  }, [schoolType, allClassesResponse, classId]);

  // Filter teachers by search and matching schoolType
  const filteredTeachers = useMemo(() => {
    let result = teachers;

    // Filter by school type (double check on frontend)
    result = result.filter((t: StaffListItem) => t.schoolType === schoolType || !t.schoolType);

    // For PRIMARY schools, exclude teachers who are already form teachers in other classes
    if (schoolType === 'PRIMARY') {
      result = result.filter((t: StaffListItem) => !teachersAssignedToOtherClasses.has(t.id));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t: StaffListItem) =>
          t.firstName.toLowerCase().includes(query) ||
          t.lastName.toLowerCase().includes(query) ||
          t.email?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [teachers, searchQuery, schoolType, teachersAssignedToOtherClasses]);

  // Check if teacher is already assigned as a lead in this same class
  const isTeacherAlreadyFormTeacher = useMemo(() => {
    if (!selectedTeacher) return false;
    return existingTeachers.some(
      (t) => t.teacherId === selectedTeacher.id && t.isPrimary
    );
  }, [selectedTeacher, existingTeachers]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedTeacher(null);
      setSearchQuery('');
    }
  }, [isOpen]);

  const handleSelectTeacher = (teacher: StaffListItem) => {
    setSelectedTeacher(teacher);
  };

  const handleAssign = async () => {
    if (!selectedTeacher) return;

    try {
      await assignTeacher({
        schoolId,
        classId,
        assignment: {
          teacherId: selectedTeacher.id,
          isPrimary: true, // Assigning as the main Form/Primary teacher
          subject: undefined
        },
      }).unwrap();

      toast.success(`${selectedTeacher.firstName} ${selectedTeacher.lastName} assigned to ${className}`);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to assign teacher');
    }
  };

  const canAssign = useMemo(() => {
    if (!selectedTeacher) return false;
    if (isTeacherAlreadyFormTeacher) return false;
    return true;
  }, [selectedTeacher, isTeacherAlreadyFormTeacher]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Teacher"
      size="lg"
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="relative px-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-light-text-muted dark:text-dark-text-muted" />
          <input
            type="text"
            placeholder="Search teachers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border-2 border-light-border dark:border-dark-border rounded-2xl bg-light-bg dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-agora-blue transition-all font-bold text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Teacher Selection List */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-widest px-1">
              Select {schoolType === 'PRIMARY' ? 'Primary' : 'Form'} Teacher
            </h4>
            <div className="max-h-[350px] overflow-y-auto scrollbar-hide space-y-2 pr-2">
              {(isLoadingStaff || (schoolType === 'PRIMARY' && isLoadingClasses)) ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-agora-blue" />
                </div>
              ) : filteredTeachers.length === 0 ? (
                <div className="text-center py-12 bg-light-surface dark:bg-dark-surface/30 rounded-2xl border-2 border-dashed border-light-border dark:border-dark-border">
                  <User className="h-10 w-10 text-light-text-muted dark:text-dark-text-muted mx-auto mb-2 opacity-20" />
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary font-bold">
                    No matching teachers found
                  </p>
                </div>
              ) : (
                filteredTeachers.map((teacher) => {
                  const isSelected = selectedTeacher?.id === teacher.id;
                  const isAssignedToThisClass = existingTeachers.some(t => t.teacherId === teacher.id && t.isPrimary);

                  return (
                    <div
                      key={teacher.id}
                      onClick={() => handleSelectTeacher(teacher)}
                      className={cn(
                        "p-3 border-2 rounded-2xl cursor-pointer transition-all flex items-center justify-between group",
                        isSelected
                          ? "border-agora-blue bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/10"
                          : "border-light-border dark:border-dark-border hover:border-agora-blue/50 hover:bg-light-surface dark:hover:bg-dark-bg"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--avatar-placeholder-bg)] flex items-center justify-center text-[var(--avatar-placeholder-text)] font-black text-xs shadow-inner overflow-hidden flex-shrink-0">
                          {teacher.profileImage ? (
                            <img src={teacher.profileImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span>{teacher.firstName[0]}{teacher.lastName[0]}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-light-text-primary dark:text-dark-text-primary truncate leading-tight">
                            {teacher.firstName} {teacher.lastName}
                          </p>
                          <p className="text-[10px] text-light-text-secondary dark:text-dark-text-secondary font-medium truncate">
                            {teacher.email || teacher.phone}
                          </p>
                        </div>
                      </div>
                      {isAssignedToThisClass && (
                        <CheckCircle className="h-4 w-4 text-green-500 fill-green-500/10 flex-shrink-0" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Confirmation Sidebar */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-widest px-1">
              Finalize
            </h4>
            <div className={cn(
              "p-5 border-2 rounded-2xl h-full flex flex-col justify-between transition-all",
              selectedTeacher 
                ? "border-agora-blue bg-agora-blue/5 dark:bg-agora-blue/10" 
                : "border-dashed border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface/30 px-8 py-12"
            )}>
              {selectedTeacher ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-3xl bg-[var(--avatar-placeholder-bg)] mx-auto flex items-center justify-center text-[var(--avatar-placeholder-text)] font-black text-3xl shadow-xl mb-4 border-4 border-white dark:border-dark-bg overflow-hidden">
                      {selectedTeacher.profileImage ? (
                        <img src={selectedTeacher.profileImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{selectedTeacher.firstName[0]}{selectedTeacher.lastName[0]}</span>
                      )}
                    </div>
                    <h5 className="text-xl font-black text-light-text-primary dark:text-dark-text-primary leading-tight">
                      {selectedTeacher.firstName} {selectedTeacher.lastName}
                    </h5>
                    <p className="text-sm font-bold text-agora-blue mt-1">
                      {schoolType === 'PRIMARY' ? 'Primary Class Teacher' : 'Form Teacher'}
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-agora-blue/20">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-light-text-secondary dark:text-dark-text-secondary uppercase">Assigning to</span>
                      <span className="text-light-text-primary dark:text-dark-text-primary uppercase">{className}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-light-text-secondary dark:text-dark-text-secondary uppercase">School Type</span>
                      <span className="text-agora-blue">{schoolType}</span>
                    </div>
                  </div>

                  {isTeacherAlreadyFormTeacher && (
                    <div className="p-3 bg-red-100/50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl">
                      <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-tighter text-center">
                        Teacher already assigned as lead
                      </p>
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleAssign}
                    disabled={!canAssign || isAssigning}
                    className="w-full h-11 text-sm font-black shadow-lg shadow-blue-500/30"
                  >
                    {isAssigning ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      'Confirm Assignment'
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center justify-center h-full opacity-40">
                  <div className="w-12 h-12 rounded-2xl bg-light-border dark:bg-dark-surface flex items-center justify-center mb-3">
                    <User className="h-6 w-6 text-light-text-muted dark:text-dark-text-muted" />
                  </div>
                  <p className="text-xs font-black text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-widest">
                    Select a teacher <br/> to proceed
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-2">
          <button 
            type="button" 
            onClick={onClose}
            className="text-xs font-black text-light-text-muted hover:text-red-500 transition-colors uppercase tracking-widest p-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
