'use client';

import { useState, useEffect, useMemo } from 'react';
import { FadeInUp } from '@/components/ui/FadeInUp';
import { DatePicker } from '@/components/ui/DatePicker';
import { Button } from '@/components/ui/Button';
import {
    Calendar,
    Loader2,
    X,
    Lock,
    Info,
    AlertTriangle,
    CheckCircle,
} from 'lucide-react';
import {
    useUpdateTermDatesMutation,
    type Term,
    type AcademicSession,
} from '@/lib/store/api/schoolAdminApi';
import toast from 'react-hot-toast';

interface EditTermDatesModalProps {
    isOpen: boolean;
    onClose: () => void;
    term: Term;
    session: AcademicSession;
    schoolId: string;
    termLabel?: string; // "Term" or "Semester"
}

/**
 * Determines the editability state for the term's start date.
 *
 * Rules:
 * - DRAFT terms: always editable
 * - ACTIVE terms: editable pre-term or within 7 days of the original start date
 * - COMPLETED/ARCHIVED: modal shouldn't even open for these (backend guard)
 */
function getStartDateEditability(term: Term): {
    editable: boolean;
    message: string;
    variant: 'success' | 'warning' | 'locked';
    daysRemaining?: number;
} {
    if (term.status === 'DRAFT') {
        return {
            editable: true,
            message: 'This term hasn\'t started yet — dates are fully adjustable.',
            variant: 'success',
        };
    }

    if (term.status === 'ACTIVE') {
        const now = new Date();
        const startDate = new Date(term.startDate);
        const gracePeriodEnd = new Date(startDate);
        gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);

        if (now < startDate) {
            // Term is ACTIVE but hasn't actually started yet (upcoming)
            return {
                editable: true,
                message: 'This term hasn\'t started yet — start date is fully adjustable.',
                variant: 'success',
            };
        }

        if (now <= gracePeriodEnd) {
            const daysLeft = Math.ceil(
                (gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );
            return {
                editable: true,
                message: `Start date can be changed for ${daysLeft} more ${daysLeft === 1 ? 'day' : 'days'}.`,
                variant: 'warning',
                daysRemaining: daysLeft,
            };
        }

        return {
            editable: false,
            message: 'Start date is locked after the first week of the term to protect academic records.',
            variant: 'locked',
        };
    }

    // COMPLETED / ARCHIVED — shouldn't reach here due to backend guard
    return {
        editable: false,
        message: 'Completed terms cannot be modified.',
        variant: 'locked',
    };
}

export function EditTermDatesModal({
    isOpen,
    onClose,
    term,
    session,
    schoolId,
    termLabel = 'Term',
}: EditTermDatesModalProps) {
    const [updateTermDates, { isLoading }] = useUpdateTermDatesMutation();

    // Local form state
    const [startDate, setStartDate] = useState(term.startDate.split('T')[0]);
    const [endDate, setEndDate] = useState(term.endDate.split('T')[0]);
    const [halfTermStart, setHalfTermStart] = useState(
        term.halfTermStart ? term.halfTermStart.split('T')[0] : ''
    );
    const [halfTermEnd, setHalfTermEnd] = useState(
        term.halfTermEnd ? term.halfTermEnd.split('T')[0] : ''
    );

    // Reset form when the modal opens or term changes
    useEffect(() => {
        if (isOpen) {
            setStartDate(term.startDate.split('T')[0]);
            setEndDate(term.endDate.split('T')[0]);
            setHalfTermStart(term.halfTermStart ? term.halfTermStart.split('T')[0] : '');
            setHalfTermEnd(term.halfTermEnd ? term.halfTermEnd.split('T')[0] : '');
        }
    }, [isOpen, term]);

    const startDateEditability = useMemo(() => getStartDateEditability(term), [term]);

    // Session bounds for date pickers
    const sessionStartDate = session.startDate.split('T')[0];
    const sessionEndDate = session.endDate.split('T')[0];

    // Validation
    const validationError = useMemo(() => {
        if (!startDate || !endDate) return 'Both start and end dates are required.';
        const s = new Date(startDate);
        const e = new Date(endDate);
        if (s >= e) return 'Start date must be before end date.';

        const sessionStart = new Date(sessionStartDate);
        const sessionEnd = new Date(sessionEndDate);
        if (s < sessionStart) return `Start date cannot be before session start (${sessionStartDate}).`;
        if (e > sessionEnd) return `End date cannot be after session end (${sessionEndDate}).`;

        // Half-term validation
        if (halfTermStart && halfTermEnd) {
            const hts = new Date(halfTermStart);
            const hte = new Date(halfTermEnd);
            if (hts >= hte) return 'Half-term start must be before half-term end.';
            if (hts < s) return 'Half-term break cannot start before the term starts.';
            if (hte > e) return 'Half-term break cannot end after the term ends.';
        } else if ((halfTermStart && !halfTermEnd) || (!halfTermStart && halfTermEnd)) {
            return 'Both half-term start and end dates are required, or leave both empty.';
        }

        return null;
    }, [startDate, endDate, halfTermStart, halfTermEnd, sessionStartDate, sessionEndDate]);

    // Check if anything actually changed
    const hasChanges = useMemo(() => {
        const origStart = term.startDate.split('T')[0];
        const origEnd = term.endDate.split('T')[0];
        const origHalfStart = term.halfTermStart ? term.halfTermStart.split('T')[0] : '';
        const origHalfEnd = term.halfTermEnd ? term.halfTermEnd.split('T')[0] : '';

        return (
            startDate !== origStart ||
            endDate !== origEnd ||
            halfTermStart !== origHalfStart ||
            halfTermEnd !== origHalfEnd
        );
    }, [startDate, endDate, halfTermStart, halfTermEnd, term]);

    const canSubmit = !validationError && hasChanges && !isLoading;

    const handleSave = async () => {
        if (!canSubmit) return;

        const payload: Record<string, string | undefined> = {};
        const origStart = term.startDate.split('T')[0];
        const origEnd = term.endDate.split('T')[0];
        const origHalfStart = term.halfTermStart ? term.halfTermStart.split('T')[0] : '';
        const origHalfEnd = term.halfTermEnd ? term.halfTermEnd.split('T')[0] : '';

        if (startDate !== origStart) payload.startDate = startDate;
        if (endDate !== origEnd) payload.endDate = endDate;
        if (halfTermStart !== origHalfStart) payload.halfTermStart = halfTermStart || undefined;
        if (halfTermEnd !== origHalfEnd) payload.halfTermEnd = halfTermEnd || undefined;

        try {
            await updateTermDates({
                schoolId,
                sessionId: session.id,
                termId: term.id,
                data: payload,
            }).unwrap();
            toast.success(`${termLabel} dates updated successfully.`);
            onClose();
        } catch (error: any) {
            toast.error(error?.data?.message || `Failed to update ${termLabel.toLowerCase()} dates.`);
        }
    };

    if (!isOpen) return null;

    const StatusIcon =
        startDateEditability.variant === 'success'
            ? CheckCircle
            : startDateEditability.variant === 'warning'
                ? AlertTriangle
                : Lock;

    const statusColorClass =
        startDateEditability.variant === 'success'
            ? 'text-green-600 dark:text-green-400'
            : startDateEditability.variant === 'warning'
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-gray-500 dark:text-gray-400';

    const statusBgClass =
        startDateEditability.variant === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : startDateEditability.variant === 'warning'
                ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            <FadeInUp
                from={{ opacity: 0, scale: 0.95, y: 20 }}
                to={{ opacity: 1, scale: 1, y: 0 }}
                duration={0.25}
                className="relative z-10 w-full max-w-lg mx-4 bg-[var(--light-card)] dark:bg-dark-surface rounded-xl shadow-2xl border border-[var(--light-border)] dark:border-gray-700 overflow-visible"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--light-border)] dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
                                Adjust {term.name} Dates
                            </h2>
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                {session.name} · {term.status}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <X className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-5 overflow-visible">
                    {/* Start date editability status */}
                    <div className={`flex items-start gap-2.5 p-3 rounded-lg border ${statusBgClass}`}>
                        <StatusIcon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${statusColorClass}`} />
                        <p className={`text-sm ${statusColorClass}`}>
                            {startDateEditability.message}
                        </p>
                    </div>

                    {/* Start Date */}
                    <div className="overflow-visible">
                        <div className="flex items-center gap-2 mb-1.5">
                            <label className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                                Start Date
                            </label>
                            {!startDateEditability.editable && (
                                <Lock className="h-3.5 w-3.5 text-gray-400" />
                            )}
                        </div>
                        <DatePicker
                            value={startDate}
                            onChange={setStartDate}
                            disabled={!startDateEditability.editable}
                            min={sessionStartDate}
                            max={endDate || sessionEndDate}
                            placeholder="Select start date"
                        />
                    </div>

                    {/* End Date */}
                    <div className="overflow-visible">
                        <label className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary block mb-1.5">
                            End Date
                        </label>
                        <DatePicker
                            value={endDate}
                            onChange={setEndDate}
                            min={startDate || sessionStartDate}
                            max={sessionEndDate}
                            placeholder="Select end date"
                        />
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                            Must be within session bounds (ends {new Date(sessionEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})
                        </p>
                    </div>

                    {/* Half-Term Break (collapsible) */}
                    <div className="border border-[var(--light-border)] dark:border-gray-700 rounded-lg p-4 overflow-visible">
                        <div className="flex items-center gap-2 mb-3">
                            <Info className="h-4 w-4 text-light-text-secondary dark:text-dark-text-secondary" />
                            <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                                Half-Term Break
                            </span>
                            <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                (Optional)
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 overflow-visible">
                            <DatePicker
                                value={halfTermStart}
                                onChange={setHalfTermStart}
                                min={startDate || sessionStartDate}
                                max={halfTermEnd || endDate || sessionEndDate}
                                placeholder="Break starts"
                            />
                            <DatePicker
                                value={halfTermEnd}
                                onChange={setHalfTermEnd}
                                min={halfTermStart || startDate || sessionStartDate}
                                max={endDate || sessionEndDate}
                                placeholder="Break ends"
                            />
                        </div>
                        {(halfTermStart || halfTermEnd) && (
                            <button
                                onClick={() => {
                                    setHalfTermStart('');
                                    setHalfTermEnd('');
                                }}
                                className="text-xs text-red-500 hover:text-red-600 mt-2 underline"
                            >
                                Clear half-term dates
                            </button>
                        )}
                    </div>

                    {/* Validation Error */}
                    {validationError && hasChanges && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                            <AlertTriangle className="h-4 w-4 mt-0.5 text-red-500 flex-shrink-0" />
                            <p className="text-sm text-red-600 dark:text-red-400">{validationError}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--light-border)] dark:border-gray-700">
                    <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!canSubmit}
                        className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </div>
            </FadeInUp>
        </div>
    );
}
