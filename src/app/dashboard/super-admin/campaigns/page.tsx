'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { FadeInUp } from '@/components/ui/FadeInUp';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { StatCard } from '@/components/dashboard/StatCard';
import {
  useGetCampaignsQuery,
  useActivateCampaignMutation,
  useDeleteCampaignMutation,
  Campaign,
} from '@/lib/store/api/engagementApi';
import {
  Megaphone,
  Plus,
  Send,
  Trash2,
  CheckCircle2,
  Clock,
  BarChart2,
  XCircle,
  Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<Campaign['status'], string> = {
  DRAFT: 'bg-gray-500/10 text-gray-400',
  SCHEDULED: 'bg-yellow-500/10 text-yellow-400',
  ACTIVE: 'bg-blue-500/10 text-blue-400',
  PAUSED: 'bg-orange-500/10 text-orange-400',
  COMPLETED: 'bg-green-500/10 text-green-400',
  CANCELLED: 'bg-red-500/10 text-red-400',
};

const TARGET_LABELS: Record<string, string> = {
  ALL_SCHOOLS: 'All Schools',
  ACTIVE_SCHOOLS: 'Active Schools',
  INACTIVE_SCHOOLS: 'Inactive Schools',
  SPECIFIC_SCHOOLS: 'Specific Schools',
};

export default function CampaignsPage() {
  const { data: campaigns = [], isLoading, error } = useGetCampaignsQuery();
  const [activateCampaign, { isLoading: isActivating }] = useActivateCampaignMutation();
  const [deleteCampaign] = useDeleteCampaignMutation();
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalSent = campaigns.reduce((acc, c) => acc + (c.metrics?.sent ?? 0), 0);
  const draftCount = campaigns.filter((c) => c.status === 'DRAFT').length;
  const completedCount = campaigns.filter((c) => c.status === 'COMPLETED').length;
  const activeCount = campaigns.filter((c) => c.status === 'ACTIVE').length;

  const handleActivate = async (campaign: Campaign) => {
    if (!confirm(`Activate "${campaign.name}"? This will immediately dispatch the campaign to all targeted schools.`)) return;
    setActivatingId(campaign.id);
    try {
      await activateCampaign(campaign.id).unwrap();
      toast.success('Campaign activated successfully!');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to activate campaign');
    } finally {
      setActivatingId(null);
    }
  };

  const handleDelete = async (campaign: Campaign) => {
    if (!confirm(`Delete "${campaign.name}"? This cannot be undone.`)) return;
    setDeletingId(campaign.id);
    try {
      await deleteCampaign(campaign.id).unwrap();
      toast.success('Campaign deleted.');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete campaign');
    } finally {
      setDeletingId(null);
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
          <p className="text-red-600 dark:text-red-400">Failed to load campaigns. Please try again.</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute roles={['SUPER_ADMIN']}>
      <div className="w-full space-y-6">
        {/* Header */}
        <FadeInUp
          from={{ opacity: 0, y: -20 }}
          to={{ opacity: 1, y: 0 }}
          duration={0.5}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h1
              className="font-bold text-light-text-primary dark:text-white mb-2"
              style={{ fontSize: 'var(--text-page-title)' }}
            >
              Engagement Campaigns
            </h1>
            <p
              className="text-light-text-secondary dark:text-[#9ca3af]"
              style={{ fontSize: 'var(--text-page-subtitle)', fontFamily: 'var(--font-outfit), sans-serif' }}
            >
              Curate and dispatch targeted email &amp; in-app campaigns
            </p>
          </div>
          <Link href="/dashboard/super-admin/campaigns/new">
            <Button variant="primary" size="sm" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </Link>
        </FadeInUp>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            title="Total Campaigns"
            value={campaigns.length}
            icon={<Megaphone className="text-blue-600 dark:text-blue-400" style={{ width: 'var(--stat-icon-size)', height: 'var(--stat-icon-size)' }} />}
          />
          <StatCard
            title="Emails Sent"
            value={totalSent}
            icon={<Mail className="text-purple-600 dark:text-purple-400" style={{ width: 'var(--stat-icon-size)', height: 'var(--stat-icon-size)' }} />}
          />
          <StatCard
            title="Completed"
            value={completedCount}
            icon={<CheckCircle2 className="text-green-600 dark:text-green-500" style={{ width: 'var(--stat-icon-size)', height: 'var(--stat-icon-size)' }} />}
          />
          <StatCard
            title="Drafts"
            value={draftCount}
            icon={<Clock className="text-orange-500 dark:text-orange-400" style={{ width: 'var(--stat-icon-size)', height: 'var(--stat-icon-size)' }} />}
          />
        </div>

        {/* Campaign List */}
        <div>
          <p
            className="font-medium text-light-text-secondary dark:text-[#9ca3af] mb-4 opacity-70"
            style={{ fontSize: 'var(--text-section-title)' }}
          >
            All Campaigns
          </p>

          {campaigns.length === 0 ? (
            <Card>
              <CardContent className="py-16 flex flex-col items-center justify-center text-center gap-3">
                <Megaphone className="h-12 w-12 text-light-text-muted dark:text-[#374151] mb-2" />
                <p
                  className="font-medium text-light-text-secondary dark:text-[#9ca3af]"
                  style={{ fontSize: 'var(--text-body)' }}
                >
                  No campaigns yet
                </p>
                <p className="text-light-text-muted dark:text-[#6b7280]" style={{ fontSize: 'var(--text-small)' }}>
                  Create your first campaign to start engaging schools on the platform.
                </p>
                <Link href="/dashboard/super-admin/campaigns/new" className="mt-2">
                  <Button variant="primary" size="sm">
                    <Plus className="h-4 w-4 mr-2" /> Create Campaign
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {campaigns.map((campaign, i) => (
                <FadeInUp
                  key={campaign.id}
                  from={{ opacity: 0, y: 16 }}
                  to={{ opacity: 1, y: 0 }}
                  duration={0.4}
                >
                  <Card className="flex flex-col h-full hover:shadow-md transition-shadow duration-200">
                    <CardContent className="flex flex-col flex-1 p-5 gap-4" style={{ padding: 'var(--card-padding)' }}>
                      {/* Top row: name + status badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p
                            className="font-semibold text-light-text-primary dark:text-white truncate"
                            style={{ fontSize: 'var(--text-card-title)', fontFamily: 'var(--font-outfit), sans-serif' }}
                          >
                            {campaign.name}
                          </p>
                          <p
                            className="text-light-text-secondary dark:text-[#9ca3af] truncate mt-0.5"
                            style={{ fontSize: 'var(--text-body)' }}
                          >
                            {campaign.subject}
                          </p>
                        </div>
                        <span
                          className={cn(
                            'flex-shrink-0 px-2.5 py-0.5 rounded-full font-medium',
                            STATUS_COLORS[campaign.status]
                          )}
                          style={{ fontSize: 'var(--text-small)', fontFamily: 'var(--font-outfit), sans-serif' }}
                        >
                          {campaign.status}
                        </span>
                      </div>

                      {/* Meta */}
                      <div className="space-y-1.5 text-light-text-secondary dark:text-[#9ca3af]" style={{ fontSize: 'var(--text-body)' }}>
                        <div className="flex justify-between">
                          <span>Target</span>
                          <span className="font-medium text-light-text-primary dark:text-white">
                            {TARGET_LABELS[campaign.target] ?? campaign.target}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Type</span>
                          <span className="font-medium text-light-text-primary dark:text-white">{campaign.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Created</span>
                          <span className="font-medium text-light-text-primary dark:text-white">
                            {new Date(campaign.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {campaign.metrics?.sent != null && (
                          <div className="flex justify-between text-blue-500">
                            <span className="flex items-center gap-1">
                              <BarChart2 className="h-3.5 w-3.5" /> Sent
                            </span>
                            <span className="font-medium">{campaign.metrics.sent}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-auto pt-4 border-t border-light-border dark:border-[#1a1f2e] flex items-center justify-end gap-2">
                        {campaign.status === 'DRAFT' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleActivate(campaign)}
                            disabled={activatingId === campaign.id}
                            style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
                          >
                            {activatingId === campaign.id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <Send className="h-4 w-4 mr-1.5" />
                            )}
                            Activate
                          </Button>
                        )}
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(campaign)}
                          disabled={deletingId === campaign.id}
                        >
                          {deletingId === campaign.id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </FadeInUp>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
