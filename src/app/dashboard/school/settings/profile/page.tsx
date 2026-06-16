'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FadeInUp } from '@/components/ui/FadeInUp';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Checkbox } from '@/components/ui/Checkbox';
import {
  useGetMySchoolQuery,
  useUpdateMySchoolMutation,
  useRequestEditTokenMutation,
  useVerifyEditTokenMutation,
} from '@/lib/store/api/schoolAdminApi';
import { useGetLoisConfigQuery, useUpsertLoisConfigMutation, useDeleteLoisConfigMutation } from '@/lib/store/api/aiApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import type { School } from '@/lib/store/api/schoolsApi';
import { Save, Mail, CheckCircle, AlertCircle, Loader2, Bot, RotateCcw } from 'lucide-react';
import { PermissionGate } from '@/components/permissions/PermissionGate';
import { PermissionResource, PermissionType } from '@/hooks/usePermissions';
import { CountrySelector } from '@/components/ui';
import { cn } from '@/lib/utils';

type Tab = 'profile' | 'lois';

function SettingsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const user = useSelector((state: RootState) => state.auth.user);
  const schoolId = user?.schoolId;

  return (
    <ProtectedRoute roles={['SCHOOL_ADMIN']}>
      <div className="w-full max-w-4xl mx-auto p-6">
        <FadeInUp from={{ opacity: 0, y: -20 }} to={{ opacity: 1, y: 0 }} duration={0.5} className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)] mb-1" style={{ fontSize: 'var(--text-page-title)' }}>
            Settings
          </h1>
          <p className="text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)]" style={{ fontSize: 'var(--text-body)' }}>
            Manage your school profile and Lois AI configuration.
          </p>
        </FadeInUp>

        {/* Tab bar */}
        <div className="flex gap-1 mb-6 bg-[var(--light-bg)] dark:bg-[var(--dark-surface)] rounded-xl p-1 w-fit border border-[var(--light-border)] dark:border-[var(--dark-border)]">
          {([
            { key: 'profile', label: 'School Profile' },
            { key: 'lois', label: 'Lois AI', icon: <Bot className="h-4 w-4" /> },
          ] as { key: Tab; label: string; icon?: React.ReactNode }[]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                activeTab === tab.key
                  ? 'bg-white dark:bg-[var(--dark-bg)] text-[var(--agora-blue)] shadow-sm'
                  : 'text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)] hover:text-[var(--light-text-primary)] dark:hover:text-[var(--dark-text-primary)]',
              )}
              style={{ fontSize: 'var(--text-body)' }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && <SchoolProfileTab token={token} router={router} />}
        {activeTab === 'lois' && schoolId && <LoisConfigTab schoolId={schoolId} />}
      </div>
    </ProtectedRoute>
  );
}

// ── School Profile tab (unchanged logic, extracted) ──────────────────────────

function SchoolProfileTab({ token, router }: { token: string | null; router: ReturnType<typeof useRouter> }) {
  const { data: schoolData, isLoading: isLoadingSchool } = useGetMySchoolQuery();
  const school = schoolData?.data;
  const [updateSchool, { isLoading: isUpdating }] = useUpdateMySchoolMutation();
  const [requestToken, { isLoading: isRequestingToken }] = useRequestEditTokenMutation();
  const [verifyToken, { isLoading: isLoadingToken }] = useVerifyEditTokenMutation();

  const [formData, setFormData] = useState<Partial<School>>({ name: '', address: '', city: '', state: '', country: 'Nigeria', phone: '', email: '' } as Partial<School>);
  const [schoolLevels, setSchoolLevels] = useState({ primary: false, secondary: false, tertiary: false });
  const [hasTokenVerification, setHasTokenVerification] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);

  useEffect(() => {
    if (school) {
      setFormData({ name: school.name || '', address: school.address || '', city: school.city || '', state: school.state || '', country: school.country || 'Nigeria', phone: school.phone || '', email: school.email || '' });
      setSchoolLevels({ primary: school.hasPrimary || false, secondary: school.hasSecondary || false, tertiary: school.hasTertiary || false });
    }
  }, [school]);

  useEffect(() => {
    if (token && !hasTokenVerification && !isLoadingToken) {
      verifyToken(token).unwrap().then((response) => {
        if (response.data) {
          setHasTokenVerification(true);
          setVerificationToken(token);
          const c = response.data.changes as any;
          if (c.name) setFormData(p => ({ ...p, name: c.name }));
          if (c.address) setFormData(p => ({ ...p, address: c.address }));
          if (c.city) setFormData(p => ({ ...p, city: c.city }));
          if (c.state) setFormData(p => ({ ...p, state: c.state }));
          if (c.phone) setFormData(p => ({ ...p, phone: c.phone }));
          if (c.email) setFormData(p => ({ ...p, email: c.email }));
          if (c.levels) setSchoolLevels({ primary: c.levels.primary ?? false, secondary: c.levels.secondary ?? false, tertiary: c.levels.tertiary ?? false });
          toast.success('Verification token verified. You can now apply the changes.');
          router.replace('/dashboard/school/settings/profile');
        }
      }).catch((error) => {
        toast.error(error?.data?.message || 'Failed to verify token');
        router.replace('/dashboard/school/settings/profile');
      });
    }
  }, [token, hasTokenVerification, isLoadingToken, verifyToken, router]);

  if (isLoadingSchool) return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;
  if (!school) return <Alert variant="error"><AlertCircle className="h-4 w-4" /><AlertDescription>School not found</AlertDescription></Alert>;

  const hasSensitiveChanges = school && (schoolLevels.primary !== school.hasPrimary || schoolLevels.secondary !== school.hasSecondary || schoolLevels.tertiary !== school.hasTertiary);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasSensitiveChanges && !hasTokenVerification) { toast.error('School type changes require email verification.'); return; }
    try {
      await updateSchool({ data: { ...formData, levels: schoolLevels }, token: hasTokenVerification ? verificationToken || undefined : undefined }).unwrap();
      toast.success('School profile updated successfully!');
      if (token) router.replace('/dashboard/school/settings/profile');
      setHasTokenVerification(false); setVerificationToken(null);
    } catch (error: any) { toast.error(error?.data?.message || 'Failed to update school profile'); }
  };

  return (
    <>
      {hasTokenVerification && (
        <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 mb-6">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-400">Verification token verified. You can now apply your changes.</AlertDescription>
        </Alert>
      )}
      {hasSensitiveChanges && !hasTokenVerification && (
        <Alert className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 mb-6">
          <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertDescription className="text-orange-800 dark:text-orange-400">Changing school type requires email verification. Click &quot;Request Verification&quot; below.</AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader><CardTitle style={{ fontSize: 'var(--text-section-title)' }}>School Information</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><Label htmlFor="name">School Name *</Label><Input id="name" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} required disabled={isUpdating} /></div>
              <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email || ''} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} disabled={isUpdating} /></div>
              <div><Label htmlFor="phone">Phone</Label><Input id="phone" value={formData.phone || ''} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} disabled={isUpdating} /></div>
              <div><Label htmlFor="city">City</Label><Input id="city" value={formData.city || ''} onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))} disabled={isUpdating} /></div>
              <div><Label htmlFor="state">State</Label><Input id="state" value={formData.state || ''} onChange={(e) => setFormData(p => ({ ...p, state: e.target.value }))} disabled={isUpdating} /></div>
              <div><CountrySelector label="Country" value={formData.country || 'Nigeria'} onChange={(val) => setFormData(p => ({ ...p, country: val }))} scope="west-africa" disabled={isUpdating} /></div>
            </div>
            <div><Label htmlFor="address">Address</Label><Input id="address" value={formData.address || ''} onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))} disabled={isUpdating} /></div>
            <div className="border-t pt-6">
              <Label className="text-base font-semibold mb-3 block">School Levels</Label>
              <p className="text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)] mb-4" style={{ fontSize: 'var(--text-body)' }}>Changes to school levels require email verification.</p>
              <div className="space-y-3">
                {(['primary', 'secondary', 'tertiary'] as const).map((level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <Checkbox id={level} checked={schoolLevels[level]} onCheckedChange={(c) => setSchoolLevels(p => ({ ...p, [level]: c === true }))} disabled={isUpdating} />
                    <Label htmlFor={level} className="cursor-pointer capitalize">{level} School</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4 pt-4 border-t">
              {hasSensitiveChanges && !hasTokenVerification && (
                <PermissionGate resource={PermissionResource.OVERVIEW} type={PermissionType.WRITE}>
                  <Button type="button" variant="outline" onClick={async () => {
                    try {
                      const result = await requestToken({ ...formData, levels: schoolLevels }).unwrap();
                      toast.success(result.message || 'Verification email sent!');
                    } catch (e: any) { toast.error(e?.data?.message || 'Failed to request verification'); }
                  }} disabled={isRequestingToken} className="flex items-center gap-2">
                    {isRequestingToken ? <><Loader2 className="h-4 w-4 animate-spin" />Requesting...</> : <><Mail className="h-4 w-4" />Request Verification</>}
                  </Button>
                </PermissionGate>
              )}
              <PermissionGate resource={PermissionResource.OVERVIEW} type={PermissionType.WRITE}>
                <Button type="submit" disabled={isUpdating || (hasSensitiveChanges && !hasTokenVerification)} className="flex items-center gap-2">
                  {isUpdating ? <><Loader2 className="h-4 w-4 animate-spin" />Updating...</> : <><Save className="h-4 w-4" />Save Changes</>}
                </Button>
              </PermissionGate>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

// ── Lois Config tab ───────────────────────────────────────────────────────────

const FIELD_LIMITS = { customGreeting: 300, toneNote: 500, restrictedTopics: 500, schoolContext: 1000 };

const FIELD_HELP: Record<string, string> = {
  customGreeting: "Shown at the start of a new conversation. E.g. \"Welcome to Greenleaf Academy's assistant!\"",
  toneNote: "How Lois should communicate. E.g. \"Always respond formally and avoid slang.\"",
  restrictedTopics: "Topics Lois should decline to discuss. E.g. \"politics, religion, competitor products\"",
  schoolContext: "Background about your school that helps Lois give better answers. E.g. \"We are a faith-based school with a strong STEM focus.\"",
};

function LoisConfigTab({ schoolId }: { schoolId: string }) {
  const { data: configData, isLoading } = useGetLoisConfigQuery(schoolId);
  const [upsert, { isLoading: isSaving }] = useUpsertLoisConfigMutation();
  const [deleteConfig, { isLoading: isResetting }] = useDeleteLoisConfigMutation();

  const [form, setForm] = useState({ customGreeting: '', toneNote: '', restrictedTopics: '', schoolContext: '' });
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (configData?.data) {
      setForm({
        customGreeting: configData.data.customGreeting || '',
        toneNote: configData.data.toneNote || '',
        restrictedTopics: configData.data.restrictedTopics || '',
        schoolContext: configData.data.schoolContext || '',
      });
    }
  }, [configData]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      await upsert({ schoolId, body: { customGreeting: form.customGreeting || null, toneNote: form.toneNote || null, restrictedTopics: form.restrictedTopics || null, schoolContext: form.schoolContext || null } }).unwrap();
      toast.success('Lois configuration saved.');
      setIsDirty(false);
    } catch (e: any) { toast.error(e?.data?.message || 'Failed to save Lois configuration'); }
  };

  const handleReset = async () => {
    if (!confirm('Reset Lois configuration to platform defaults? This cannot be undone.')) return;
    try {
      await deleteConfig(schoolId).unwrap();
      setForm({ customGreeting: '', toneNote: '', restrictedTopics: '', schoolContext: '' });
      setIsDirty(false);
      toast.success('Lois configuration reset to platform defaults.');
    } catch (e: any) { toast.error(e?.data?.message || 'Failed to reset configuration'); }
  };

  if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;

  const fields: { key: keyof typeof form; label: string; multiline?: boolean }[] = [
    { key: 'customGreeting', label: 'Custom Greeting' },
    { key: 'toneNote', label: 'Tone & Communication Style' },
    { key: 'restrictedTopics', label: 'Restricted Topics' },
    { key: 'schoolContext', label: 'School Background', multiline: true },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--agora-blue)]/10">
              <Bot className="h-5 w-5 text-[var(--agora-blue)]" />
            </div>
            <div>
              <CardTitle style={{ fontSize: 'var(--text-section-title)' }}>Lois AI Personality</CardTitle>
              <p className="text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)] mt-0.5" style={{ fontSize: 'var(--text-small)' }}>
                Customise how Lois presents itself to your staff and students. All fields are optional — leave blank to use platform defaults.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {fields.map(({ key, label, multiline }) => {
            const max = FIELD_LIMITS[key as keyof typeof FIELD_LIMITS];
            const len = form[key].length;
            const near = len > max * 0.85;
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor={key} style={{ fontSize: 'var(--text-body)' }}>{label}</Label>
                  <span className={cn('tabular-nums', near ? 'text-orange-500' : 'text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)]')} style={{ fontSize: 'var(--text-tiny)' }}>
                    {len}/{max}
                  </span>
                </div>
                <p className="text-[var(--light-text-muted)] dark:text-[var(--dark-text-muted)] mb-2" style={{ fontSize: 'var(--text-tiny)' }}>{FIELD_HELP[key]}</p>
                {multiline ? (
                  <textarea
                    id={key}
                    value={form[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    maxLength={max}
                    rows={4}
                    className="w-full px-4 py-2 border-2 rounded-lg bg-[var(--light-input)] dark:bg-[var(--dark-input)] text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--agora-blue)] focus:border-[var(--agora-blue)] transition-all border-[var(--light-border)] dark:border-[var(--dark-border)] resize-none"
                    style={{ fontSize: 'var(--text-body)' }}
                  />
                ) : (
                  <Input id={key} value={form[key]} onChange={(e) => handleChange(key, e.target.value)} maxLength={max} />
                )}
              </div>
            );
          })}

          <div className="flex items-center justify-between pt-4 border-t border-[var(--light-border)] dark:border-[var(--dark-border)]">
            <Button type="button" variant="ghost" onClick={handleReset} disabled={isResetting || !configData?.data} className="flex items-center gap-2 text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)] hover:text-red-500">
              {isResetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
              Reset to defaults
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSaving || !isDirty} className="flex items-center gap-2">
              {isSaving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : <><Save className="h-4 w-4" />Save Configuration</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4">
          <div className="flex gap-3 items-start">
            <AlertCircle className="h-5 w-5 text-[var(--agora-blue)] mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-[var(--light-text-primary)] dark:text-[var(--dark-text-primary)] mb-1" style={{ fontSize: 'var(--text-body)' }}>What you can and cannot change</p>
              <p className="text-[var(--light-text-secondary)] dark:text-[var(--dark-text-secondary)]" style={{ fontSize: 'var(--text-small)' }}>
                The fields above control Lois's personality and tone. The structural rules — how Lois accesses school data, routes queries to tools, and enforces security — are managed by Agora and cannot be edited here. This ensures Lois always operates safely and within your school's data boundaries.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SchoolSettingsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><LoadingSpinner size="lg" /></div>}>
      <SettingsPageContent />
    </Suspense>
  );
}
