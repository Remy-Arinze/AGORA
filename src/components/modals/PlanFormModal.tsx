import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreatePlanAdminMutation, useUpdatePlanAdminMutation, SubscriptionPlanDto, SubscriptionTier } from '@/lib/store/api/subscriptionsApi';
import { toast } from 'react-hot-toast';
import { Trash2, Plus } from 'lucide-react';

interface PlanFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan?: SubscriptionPlanDto | null;
}

export function PlanFormModal({ isOpen, onClose, plan }: PlanFormModalProps) {
    const [createPlan, { isLoading: isCreating }] = useCreatePlanAdminMutation();
    const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanAdminMutation();

    const [formData, setFormData] = useState({
        tierCode: SubscriptionTier.FREE,
        name: '',
        description: '',
        monthlyPrice: 0,
        yearlyPrice: 0,
        cta: 'Upgrade',
        accent: 'blue',
        highlight: false,
        isPublic: true,
        customSchoolId: '',
        features: [{ text: '', included: true, isGlowing: false }],
    });

    useEffect(() => {
        if (plan) {
            setFormData({
                tierCode: plan.tierCode,
                name: plan.name,
                description: plan.description || '',
                monthlyPrice: plan.monthlyPrice,
                yearlyPrice: plan.yearlyPrice,
                cta: plan.cta,
                accent: plan.accent,
                highlight: plan.highlight,
                isPublic: plan.isPublic,
                customSchoolId: plan.customSchoolId || '',
                features: plan.features?.length > 0 ? plan.features : [{ text: '', included: true, isGlowing: false }],
            });
        } else {
            setFormData({
                tierCode: SubscriptionTier.FREE,
                name: '',
                description: '',
                monthlyPrice: 0,
                yearlyPrice: 0,
                cta: 'Upgrade',
                accent: 'blue',
                highlight: false,
                isPublic: true,
                customSchoolId: '',
                features: [{ text: '', included: true, isGlowing: false }],
            });
        }
    }, [plan, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: Partial<SubscriptionPlanDto> = {
                ...formData,
                customSchoolId: formData.customSchoolId || null,
            };

            if (plan) {
                await updatePlan({ id: plan.id, data: payload }).unwrap();
                toast.success('Plan updated successfully');
            } else {
                await createPlan(payload).unwrap();
                toast.success('Plan created successfully');
            }
            onClose();
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to save plan');
        }
    };

    const addFeature = () => {
        setFormData({
            ...formData,
            features: [...formData.features, { text: '', included: true, isGlowing: false }],
        });
    };

    const removeFeature = (index: number) => {
        const newFeatures = [...formData.features];
        newFeatures.splice(index, 1);
        setFormData({ ...formData, features: newFeatures });
    };

    const updateFeature = (index: number, key: string, value: any) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = { ...newFeatures[index], [key]: value };
        setFormData({ ...formData, features: newFeatures });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={plan ? 'Edit Subscription Plan' : 'Create Custom Plan'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Tier Code</label>
                        <select
                            value={formData.tierCode}
                            onChange={(e) => setFormData({ ...formData, tierCode: e.target.value as SubscriptionTier })}
                            className="w-full flex h-10 w-full rounded-md border border-light-border dark:border-dark-border bg-transparent px-3 py-2 text-sm placeholder:text-light-text-muted dark:placeholder:text-dark-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2490FD] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                        >
                            {Object.values(SubscriptionTier).map((tier) => (
                                <option key={tier} value={tier}>
                                    {tier}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Plan Name</label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <Input
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Monthly Price (₦)</label>
                        <Input
                            type="number"
                            value={formData.monthlyPrice}
                            onChange={(e) => setFormData({ ...formData, monthlyPrice: Number(e.target.value) })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Yearly Price (₦)</label>
                        <Input
                            type="number"
                            value={formData.yearlyPrice}
                            onChange={(e) => setFormData({ ...formData, yearlyPrice: Number(e.target.value) })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">CTA Text</label>
                        <Input
                            value={formData.cta}
                            onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Accent Color</label>
                        <select
                            value={formData.accent}
                            onChange={(e) => setFormData({ ...formData, accent: e.target.value })}
                            className="w-full flex h-10 w-full rounded-md border border-light-border dark:border-dark-border bg-transparent px-3 py-2 text-sm placeholder:text-light-text-muted dark:placeholder:text-dark-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2490FD] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="blue">Blue (Primary)</option>
                            <option value="gray">Gray</option>
                            <option value="amber">Amber</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                        <input
                            type="checkbox"
                            id="highlight"
                            checked={formData.highlight}
                            onChange={(e) => setFormData({ ...formData, highlight: e.target.checked })}
                            className="w-4 h-4 text-[#2490FD] bg-transparent border-light-border dark:border-dark-border"
                        />
                        <label htmlFor="highlight" className="text-sm font-medium">Highlight / Most Popular</label>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                        <input
                            type="checkbox"
                            id="isPublic"
                            checked={formData.isPublic}
                            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                            className="w-4 h-4 text-[#2490FD] bg-transparent border-light-border dark:border-dark-border"
                        />
                        <label htmlFor="isPublic" className="text-sm font-medium">Is Public</label>
                    </div>

                    {!formData.isPublic && (
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Custom School ID</label>
                            <Input
                                value={formData.customSchoolId}
                                onChange={(e) => setFormData({ ...formData, customSchoolId: e.target.value })}
                                placeholder="Required for private custom plans"
                            />
                        </div>
                    )}
                </div>

                {/* Features Checklist */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold" style={{ fontSize: 'var(--text-section-title)' }}>Features</h3>
                        <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                            <Plus className="w-4 h-4 mr-2" /> Add Feature
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {formData.features.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-4 border border-light-border dark:border-dark-border rounded-lg bg-light-surface dark:bg-dark-surface">
                                <div className="flex-1 space-y-3">
                                    <Input
                                        placeholder="Feature logic text (e.g. 5,000 AI Credits)"
                                        value={feature.text}
                                        onChange={(e) => updateFeature(idx, 'text', e.target.value)}
                                        required
                                    />
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={feature.included}
                                                onChange={(e) => updateFeature(idx, 'included', e.target.checked)}
                                            />
                                            <span>Included</span>
                                        </label>
                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={feature.isGlowing}
                                                onChange={(e) => updateFeature(idx, 'isGlowing', e.target.checked)}
                                            />
                                            <span>Glowing Text</span>
                                        </label>
                                    </div>
                                </div>
                                <Button type="button" variant="danger" size="icon" onClick={() => removeFeature(idx)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-light-border dark:border-dark-border">
                    <Button variant="ghost" onClick={onClose} type="button">
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isCreating || isUpdating}>
                        {plan ? 'Update Plan' : 'Create Plan'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
