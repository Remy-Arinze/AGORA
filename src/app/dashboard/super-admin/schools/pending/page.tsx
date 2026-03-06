'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FadeInUp } from '@/components/ui/FadeInUp';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { EntityAvatar } from '@/components/ui/EntityAvatar';
import { CheckCircle, XCircle, Clock, Search, School as SchoolIcon } from 'lucide-react';
import Link from 'next/link';
import { BackButton } from '@/components/ui/BackButton';
import { useGetPendingSchoolsQuery, useVerifySchoolMutation, useRejectSchoolMutation } from '@/lib/store/api/schoolsApi';
import toast from 'react-hot-toast';

export default function PendingSchoolsPage() {
    const router = useRouter();
    const { data, isLoading, error, refetch } = useGetPendingSchoolsQuery();
    const [verifySchool, { isLoading: isVerifying }] = useVerifySchoolMutation();
    const [rejectSchool, { isLoading: isRejecting }] = useRejectSchoolMutation();

    const [rejectionReason, setRejectionReason] = useState<string>('');
    const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);

    const pendingSchools = data?.data || [];

    const handleVerify = async (id: string, name: string) => {
        try {
            const response = await verifySchool(id).unwrap();
            if (response.success) {
                toast.success(`${name} has been verified successfully.`);
                refetch();
            } else {
                toast.error(response.message || 'Failed to verify school.');
            }
        } catch (err: any) {
            toast.error(err?.data?.message || err?.message || 'Error verifying school.');
        }
    };

    const handleReject = async (id: string, name: string) => {
        if (!rejectionReason) {
            toast.error('Please provide a reason for rejection.');
            return;
        }

        try {
            const response = await rejectSchool({ id, reason: rejectionReason }).unwrap();
            if (response.success) {
                toast.success(`${name} has been rejected.`);
                setRejectionReason('');
                setSelectedSchoolId(null);
                refetch();
            } else {
                toast.error(response.message || 'Failed to reject school.');
            }
        } catch (err: any) {
            toast.error(err?.data?.message || err?.message || 'Error rejecting school.');
        }
    };

    if (isLoading) {
        return (
            <ProtectedRoute roles={['SUPER_ADMIN']}>
                <div className="w-full flex items-center justify-center min-h-[400px]">
                    <LoadingSpinner size="lg" />
                </div>
            </ProtectedRoute>
        );
    }

    if (error) {
        return (
            <ProtectedRoute roles={['SUPER_ADMIN']}>
                <div className="w-full text-center py-12">
                    <p className="text-red-500">Failed to load pending registrations. Please try again.</p>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute roles={['SUPER_ADMIN']}>
            <div className="w-full space-y-6">
                <FadeInUp from={{ opacity: 0, y: -20 }} to={{ opacity: 1, y: 0 }} duration={0.5} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <BackButton />
                        </div>
                        <h1
                            className="font-bold text-light-text-primary dark:text-white mb-2"
                            style={{ fontSize: 'var(--text-page-title)', fontFamily: 'var(--font-outfit), sans-serif', letterSpacing: '-0.02em' }}
                        >
                            Unapproved Registrations
                        </h1>
                        <p
                            className="text-light-text-secondary dark:text-[#9ca3af]"
                            style={{ fontSize: 'var(--text-page-subtitle)', fontFamily: 'var(--font-outfit), sans-serif' }}
                        >
                            Review and act on new school applications
                        </p>
                    </div>
                </FadeInUp>

                {pendingSchools.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">No unapproved applications</h3>
                            <p className="text-[#9ca3af]">All school registrations have been reviewed.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {pendingSchools.map((school) => {
                            const admin = school.admins?.[0]; // Assuming first admin is the principal
                            const isRejectingThis = selectedSchoolId === school.id;

                            const levels = [];
                            if (school.hasPrimary) levels.push('Primary');
                            if (school.hasSecondary) levels.push('Secondary');
                            if (school.hasTertiary) levels.push('Tertiary');

                            return (
                                <FadeInUp key={school.id} from={{ opacity: 0, x: -20 }} to={{ opacity: 1, x: 0 }} duration={0.5}>
                                    <Card className="hover:bg-light-hover dark:hover:bg-[#1f2937] transition-all duration-200">
                                        <CardContent className="p-6">
                                            <div className="flex flex-col md:flex-row gap-6">
                                                {/* Avatar */}
                                                <div className="flex-shrink-0">
                                                    <EntityAvatar
                                                        name={school.name}
                                                        imageUrl={school.logo || undefined}
                                                        size="lg"
                                                        variant="rounded"
                                                    />
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 space-y-4">
                                                    <div>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h3
                                                                className="text-xl font-semibold text-white"
                                                                style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
                                                            >
                                                                {school.name}
                                                            </h3>
                                                            <span
                                                                className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500"
                                                                style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
                                                            >
                                                                Unapproved
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-4 text-sm text-[#9ca3af]" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                                                            <span className="flex items-center gap-1">
                                                                <SchoolIcon className="w-4 h-4" />
                                                                {levels.join(', ')}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-black/20 p-4 rounded-lg">
                                                        <div>
                                                            <p className="text-[#9ca3af] mb-1">Contact Email</p>
                                                            <p className="text-white font-medium">{school.email || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[#9ca3af] mb-1">Contact Phone</p>
                                                            <p className="text-white font-medium">{school.phone || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[#9ca3af] mb-1">Location</p>
                                                            <p className="text-white font-medium">{school.city || 'N/A'}, {school.state || 'N/A'}, {school.country}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[#9ca3af] mb-1">School Owner</p>
                                                            <p className="text-white font-medium">
                                                                {admin ? `${admin.firstName} ${admin.lastName}` : 'N/A'}
                                                            </p>
                                                            <p className="text-[#9ca3af] text-xs">
                                                                {admin?.email || ''} {admin?.phone ? `• ${admin.phone}` : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex flex-col gap-3 min-w-[200px] justify-center border-t md:border-t-0 md:border-l border-[#1a1f2e] pt-4 md:pt-0 md:pl-6">
                                                    {!isRejectingThis ? (
                                                        <>
                                                            <Button
                                                                variant="primary"
                                                                onClick={() => handleVerify(school.id, school.name)}
                                                                disabled={isVerifying || isRejecting}
                                                                className="w-full flex items-center justify-center gap-2 bg-[#2DA44E] hover:bg-[#2c974b] text-white shadow-lg border-0"
                                                                style={{ fontFamily: 'var(--font-outfit), sans-serif', fontWeight: 600 }}
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                                Approve School
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => setSelectedSchoolId(school.id)}
                                                                disabled={isVerifying || isRejecting}
                                                                className="w-full flex items-center justify-center gap-2 border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300"
                                                                style={{ fontFamily: 'var(--font-outfit), sans-serif', fontWeight: 600 }}
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                                Reject Registration
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            <label className="block text-sm font-medium text-white">Reason for rejection *</label>
                                                            <textarea
                                                                value={rejectionReason}
                                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                                className="w-full px-3 py-2 text-sm border border-[#1a1f2e] rounded-lg bg-[#0d1117] text-white focus:outline-none focus:ring-2 focus:ring-red-500 h-24 resize-none"
                                                                placeholder="E.g. Cannot verify school credentials..."
                                                                required
                                                            />
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    variant="primary"
                                                                    onClick={() => handleReject(school.id, school.name)}
                                                                    disabled={isRejecting || !rejectionReason.trim()}
                                                                    className="flex-1 bg-red-600 hover:bg-red-700"
                                                                >
                                                                    Confirm
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    onClick={() => {
                                                                        setSelectedSchoolId(null);
                                                                        setRejectionReason('');
                                                                    }}
                                                                    disabled={isRejecting}
                                                                    className="flex-1"
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </FadeInUp>
                            );
                        })}
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
