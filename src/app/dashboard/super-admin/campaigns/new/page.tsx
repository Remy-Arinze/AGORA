'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { FadeInUp } from '@/components/ui/FadeInUp';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useCreateCampaignMutation } from '@/lib/store/api/engagementApi';
import { useGetSchoolsQuery } from '@/lib/store/api/schoolsApi';
import {
  ArrowLeft,
  Save,
  Info,
  Users,
  Globe,
  Building2,
  CheckSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const TARGET_OPTIONS = [
  { value: 'ALL_SCHOOLS',      label: 'All Schools',      icon: Globe,       description: 'Sends to every school on the platform' },
  { value: 'ACTIVE_SCHOOLS',   label: 'Active Schools',   icon: CheckSquare, description: 'Only schools currently marked as active' },
  { value: 'INACTIVE_SCHOOLS', label: 'Inactive Schools', icon: Building2,   description: "Schools that haven't been active recently" },
  { value: 'SPECIFIC_SCHOOLS', label: 'Specific Schools', icon: Users,       description: 'Handpick the exact schools to receive this' },
];

const TYPE_OPTIONS = [
  { value: 'EMAIL',   label: 'Email Only' },
  { value: 'IN_APP', label: 'In-App Notification Only' },
  { value: 'BOTH',   label: 'Email + In-App' },
];

const labelClass = 'block text-sm font-medium text-light-text-primary dark:text-white mb-1.5';
const helperClass = 'text-xs text-light-text-secondary dark:text-[#9ca3af] mt-1';
const sectionTitleClass = 'font-semibold text-light-text-primary dark:text-white mb-4 pb-2 border-b border-light-border dark:border-[#1a1f2e]';

export default function NewCampaignPage() {
  const router = useRouter();
  const [createCampaign, { isLoading }] = useCreateCampaignMutation();
  const { data: schoolsResponse, isLoading: isLoadingSchools } = useGetSchoolsQuery({ page: 1, limit: 200 });
  const schools = schoolsResponse?.data?.data ?? [];

  const [form, setForm] = useState({
    name: '',
    subject: '',
    content: '',
    type: 'EMAIL',
    target: 'ALL_SCHOOLS',
    targetSchools: [] as string[],
  });

  const handleField = (key: keyof typeof form, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleSchool = (id: string) => {
    setForm((prev) => ({
      ...prev,
      targetSchools: prev.targetSchools.includes(id)
        ? prev.targetSchools.filter((s) => s !== id)
        : [...prev.targetSchools, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.target === 'SPECIFIC_SCHOOLS' && form.targetSchools.length === 0) {
      toast.error('Please select at least one school for specific targeting.');
      return;
    }
    try {
      await createCampaign(form).unwrap();
      toast.success('Campaign saved as draft!');
      router.push('/dashboard/super-admin/campaigns');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create campaign');
    }
  };

  return (
    <ProtectedRoute roles={['SUPER_ADMIN']}>
      <div className="w-full max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <FadeInUp from={{ opacity: 0, y: -16 }} to={{ opacity: 1, y: 0 }} duration={0.4}>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/super-admin/campaigns">
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1
                className="font-bold text-light-text-primary dark:text-white"
                style={{ fontSize: 'var(--text-page-title)' }}
              >
                New Campaign
              </h1>
              <p
                className="text-light-text-secondary dark:text-[#9ca3af]"
                style={{ fontSize: 'var(--text-page-subtitle)', fontFamily: 'var(--font-outfit), sans-serif' }}
              >
                Drafts are saved and must be manually activated before sending.
              </p>
            </div>
          </div>
        </FadeInUp>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: Basics */}
          <FadeInUp from={{ opacity: 0, y: 16 }} to={{ opacity: 1, y: 0 }} duration={0.4}>
            <Card>
              <CardContent className="p-6 space-y-5" style={{ padding: 'var(--card-padding)' }}>
                <p className={sectionTitleClass} style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                  Campaign Basics
                </p>

                <div>
                  <label htmlFor="name" className={labelClass}>Internal Campaign Name</label>
                  <Input
                    id="name"
                    placeholder="e.g. May Feature Spotlight — AI Curriculum"
                    value={form.name}
                    onChange={(e) => handleField('name', e.target.value)}
                    required
                  />
                  <p className={helperClass}>Only visible to Super Admins — not shown in the email.</p>
                </div>

                <div>
                  <label className={labelClass}>Delivery Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {TYPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleField('type', opt.value)}
                        className={cn(
                          'rounded-lg border px-3 py-2.5 text-sm font-medium transition-all',
                          form.type === opt.value
                            ? 'bg-[#2490FD]/10 border-[#2490FD] text-[#2490FD]'
                            : 'border-light-border dark:border-[#1a1f2e] text-light-text-secondary dark:text-[#9ca3af] hover:bg-light-hover dark:hover:bg-[#1a1f2e]'
                        )}
                        style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeInUp>

          {/* Section 2: Targeting */}
          <FadeInUp from={{ opacity: 0, y: 16 }} to={{ opacity: 1, y: 0 }} duration={0.45}>
            <Card>
              <CardContent className="p-6 space-y-4" style={{ padding: 'var(--card-padding)' }}>
                <p className={sectionTitleClass} style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                  Target Audience
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TARGET_OPTIONS.map(({ value, label, icon: Icon, description }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleField('target', value)}
                      className={cn(
                        'text-left rounded-xl border p-4 transition-all',
                        form.target === value
                          ? 'bg-[#2490FD]/10 border-[#2490FD]'
                          : 'border-light-border dark:border-[#1a1f2e] hover:bg-light-hover dark:hover:bg-[#1a1f2e]'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon
                          className={cn('h-4 w-4', form.target === value ? 'text-[#2490FD]' : 'text-light-text-muted dark:text-[#6b7280]')}
                        />
                        <span
                          className={cn(
                            'font-medium',
                            form.target === value ? 'text-[#2490FD]' : 'text-light-text-primary dark:text-white'
                          )}
                          style={{ fontSize: 'var(--text-body)', fontFamily: 'var(--font-outfit), sans-serif' }}
                        >
                          {label}
                        </span>
                      </div>
                      <p className="text-light-text-secondary dark:text-[#9ca3af]" style={{ fontSize: 'var(--text-small)' }}>
                        {description}
                      </p>
                    </button>
                  ))}
                </div>

                {/* School picker for SPECIFIC_SCHOOLS */}
                {form.target === 'SPECIFIC_SCHOOLS' && (
                  <div className="mt-2">
                    <label className={labelClass}>Select Schools</label>
                    {isLoadingSchools ? (
                      <div className="flex items-center justify-center py-6">
                        <LoadingSpinner size="sm" />
                      </div>
                    ) : (
                      <div className="max-h-52 overflow-y-auto rounded-lg border border-light-border dark:border-[#1a1f2e] divide-y divide-light-border dark:divide-[#1a1f2e]">
                        {schools.map((school: any) => (
                          <label
                            key={school.id}
                            className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-light-hover dark:hover:bg-[#1a1f2e] transition-colors"
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-light-border dark:border-[#374151] accent-[#2490FD]"
                              checked={form.targetSchools.includes(school.id)}
                              onChange={() => toggleSchool(school.id)}
                            />
                            <span
                              className="text-light-text-primary dark:text-white"
                              style={{ fontSize: 'var(--text-body)' }}
                            >
                              {school.name}
                            </span>
                            {form.targetSchools.includes(school.id) && (
                              <span className="ml-auto text-[#2490FD]" style={{ fontSize: 'var(--text-small)' }}>
                                Selected
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    )}
                    {form.targetSchools.length > 0 && (
                      <p className="text-[#2490FD] mt-1" style={{ fontSize: 'var(--text-small)' }}>
                        {form.targetSchools.length} school{form.targetSchools.length > 1 ? 's' : ''} selected
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeInUp>

          {/* Section 3: Content */}
          <FadeInUp from={{ opacity: 0, y: 16 }} to={{ opacity: 1, y: 0 }} duration={0.5}>
            <Card>
              <CardContent className="p-6 space-y-5" style={{ padding: 'var(--card-padding)' }}>
                <p className={sectionTitleClass} style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                  Message Content
                </p>

                <div>
                  <label htmlFor="subject" className={labelClass}>Email Subject Line</label>
                  <Input
                    id="subject"
                    placeholder="e.g. Exclusive Upgrade Offer for Your School"
                    value={form.subject}
                    onChange={(e) => handleField('subject', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="content" className={labelClass}>Email Body</label>
                  <Textarea
                    id="content"
                    placeholder="Write your message here... HTML is supported for rich emails."
                    value={form.content}
                    onChange={(e) => handleField('content', e.target.value)}
                    rows={10}
                    required
                  />
                  <div className="flex items-start gap-1.5 mt-2">
                    <Info className="h-3.5 w-3.5 text-light-text-muted dark:text-[#6b7280] mt-0.5 flex-shrink-0" />
                    <p className={helperClass} style={{ marginTop: 0 }}>
                      Available variables: <code className="bg-light-surface dark:bg-[#151a23] px-1 py-0.5 rounded text-blue-400">{'{schoolName}'}</code>{' '}
                      <code className="bg-light-surface dark:bg-[#151a23] px-1 py-0.5 rounded text-blue-400">{'{adminName}'}</code>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeInUp>

          {/* Footer Actions */}
          <FadeInUp from={{ opacity: 0 }} to={{ opacity: 1 }} duration={0.5}>
            <div className="flex justify-end gap-3">
              <Link href="/dashboard/super-admin/campaigns">
                <Button variant="secondary" type="button" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                  Cancel
                </Button>
              </Link>
              <Button
                variant="primary"
                type="submit"
                disabled={isLoading}
                style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
              >
                {isLoading ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4 mr-2" />}
                Save as Draft
              </Button>
            </div>
          </FadeInUp>
        </form>
      </div>
    </ProtectedRoute>
  );
}
