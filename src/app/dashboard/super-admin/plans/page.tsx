'use client';

import { useState } from 'react';
import { FadeInUp } from '@/components/ui/FadeInUp';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ConfirmModal } from '@/components/ui/Modal';
import { PlanFormModal } from '@/components/modals/PlanFormModal';
import { useGetAllPlansAdminQuery, useDeletePlanAdminMutation, SubscriptionPlanDto } from '@/lib/store/api/subscriptionsApi';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Check, X, ShieldAlert, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function PlansPage() {
    const { data: response, isLoading, error } = useGetAllPlansAdminQuery();
    const [deletePlan, { isLoading: isDeleting }] = useDeletePlanAdminMutation();

    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanDto | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [planToDelete, setPlanToDelete] = useState<SubscriptionPlanDto | null>(null);

    const handleEdit = (plan: SubscriptionPlanDto) => {
        setSelectedPlan(plan);
        setIsPlanModalOpen(true);
    };

    const handleDeleteClick = (plan: SubscriptionPlanDto) => {
        setPlanToDelete(plan);
        setIsDeleteModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedPlan(null);
        setIsPlanModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!planToDelete) return;
        try {
            await deletePlan(planToDelete.id).unwrap();
            toast.success('Plan deleted successfully');
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to delete plan');
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
                <div className="w-full">
                    <div className="text-center py-12">
                        <p className="text-red-600 dark:text-red-400">Failed to load plans</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    const plans = response?.data || [];

    return (
        <ProtectedRoute roles={['SUPER_ADMIN']}>
            <div className="w-full space-y-6">
                {/* Header Section */}
                <FadeInUp from={{ opacity: 0, y: -20 }} to={{ opacity: 1, y: 0 }} duration={0.5} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="font-bold text-light-text-primary dark:text-white mb-2" style={{ fontSize: 'var(--text-page-title)' }}>
                            Subscription Plans
                        </h1>
                        <p className="text-light-text-secondary dark:text-[#9ca3af]" style={{ fontSize: 'var(--text-page-subtitle)' }}>
                            Manage pricing tiers, custom school plans, and plan features. Schools above 2,000 students typically start from the public{' '}
                            <Link href="/pricing" className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">
                                Pricing page <ExternalLink className="w-3.5 h-3.5" />
                            </Link>{' '}
                            — create a non-public CUSTOM plan here and attach it to the school after pricing is agreed.
                        </p>
                    </div>
                    <Button onClick={handleCreate} variant="primary" size="md">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Plan
                    </Button>
                </FadeInUp>

                {/* Plans List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan, index) => (
                        <FadeInUp key={plan.id} from={{ opacity: 0, scale: 0.95 }} to={{ opacity: 1, scale: 1 }} duration={0.4} delay={index * 0.1}>
                            <Card className={cn(
                                "h-full flex flex-col hover:shadow-lg transition-all border",
                                plan.highlight ? "border-blue-500 shadow-md" : "border-light-border dark:border-dark-border"
                            )}>
                                <CardHeader className="pb-4 border-b border-light-border dark:border-dark-border flex flex-row items-start justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <span className={cn(
                                                "text-xl font-bold",
                                                plan.accent === 'blue' && "text-blue-500",
                                                plan.accent === 'amber' && "text-amber-500"
                                            )}>{plan.name}</span>
                                            {!plan.isPublic && (
                                                <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-full flex items-center">
                                                    <ShieldAlert className="w-3 h-3 mr-1" />
                                                    Private
                                                </span>
                                            )}
                                        </CardTitle>
                                        <p className="text-sm text-light-text-secondary mt-1">{plan.description}</p>
                                        <div className="text-2xl font-black mt-2">
                                            {plan.tierCode === 'FREE' ? 'Free' : plan.tierCode === 'CUSTOM' ? 'Custom' : `₦${plan.monthlyPrice.toLocaleString()}`}
                                            {plan.monthlyPrice > 0 && <span className="text-sm font-medium text-light-text-secondary">/mo</span>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Button variant="outline" size="icon" onClick={() => handleEdit(plan)}>
                                            <Edit2 className="w-4 h-4 text-blue-500" />
                                        </Button>
                                        <Button variant="outline" size="icon" onClick={() => handleDeleteClick(plan)}>
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 flex-1 flex flex-col">
                                    {plan.customSchool && (
                                        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg text-sm">
                                            <p className="font-semibold text-amber-800 dark:text-amber-500">Custom Plan For:</p>
                                            <p className="text-amber-700 dark:text-amber-400">{plan.customSchool.name}</p>
                                        </div>
                                    )}
                                    <ul className="space-y-3 flex-1 overflow-y-auto max-h-60 mb-4 pr-1">
                                        {plan.features.map((feature: any, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-sm">
                                                <div className={cn(
                                                    "mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0",
                                                    feature.included ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
                                                )}>
                                                    {feature.included ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                </div>
                                                <span className={cn(
                                                    feature.included ? (feature.isGlowing ? "font-bold text-blue-600" : "text-light-text-primary dark:text-dark-text-primary") : "text-light-text-muted"
                                                )}>
                                                    {feature.text}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-auto">
                                        <span className="text-xs uppercase tracking-wider font-semibold text-light-text-secondary">Tier: {plan.tierCode}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </FadeInUp>
                    ))}
                    {plans.length === 0 && (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3">
                            <div className="text-center py-12 bg-light-surface rounded-xl border border-light-border border-dashed">
                                <p className="text-light-text-secondary text-lg">No subscription plans found. Create one to get started.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <PlanFormModal
                isOpen={isPlanModalOpen}
                onClose={() => setIsPlanModalOpen(false)}
                plan={selectedPlan}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Subscription Plan"
                message={`Are you sure you want to delete ${planToDelete?.name}? This action cannot be undone.`}
                confirmText="Delete Plan"
                variant="danger"
                isLoading={isDeleting}
            />
        </ProtectedRoute>
    );
}
