'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FadeInUp } from '@/components/ui/FadeInUp';
import {
    Sparkles,
    MessageSquare,
    Shield,
    BookOpen,
    RotateCcw,
    Save,
    Eye,
    EyeOff,
    Loader2,
    CheckCircle2,
    Info,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import {
    useAdminGetLoisConfigQuery,
    useAdminUpsertLoisConfigMutation,
    useAdminDeleteLoisConfigMutation,
    useAdminGetSystemPromptPreviewQuery,
    type LoisConfigInput,
} from '@/lib/store/api/aiApi';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface LoisConfigPanelProps {
    schoolId: string;
    schoolName: string;
}

const FIELD_LIMITS = {
    customGreeting: 300,
    toneNote: 500,
    restrictedTopics: 500,
    schoolContext: 1000,
};

function CharCounter({ value, max }: { value: string; max: number }) {
    const count = value?.length ?? 0;
    const pct = (count / max) * 100;
    return (
        <span
            className={cn(
                'tabular-nums transition-colors',
                pct >= 100
                    ? 'text-red-500 font-semibold'
                    : pct >= 80
                        ? 'text-amber-500'
                        : 'text-light-text-muted dark:text-dark-text-muted'
            )}
            style={{ fontSize: 'var(--text-small)' }}
        >
            {count}/{max}
        </span>
    );
}

interface FieldCardProps {
    icon: React.ReactNode;
    accent: string;
    title: string;
    description: string;
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
    maxLength: number;
    multiline?: boolean;
    rows?: number;
}

function FieldCard({
    icon,
    accent,
    title,
    description,
    placeholder,
    value,
    onChange,
    maxLength,
    multiline = false,
    rows = 3,
}: FieldCardProps) {
    return (
        <Card className="border-light-border dark:border-dark-border overflow-hidden group hover:shadow-md transition-all duration-200">
            <div className={cn('h-0.5 w-full transition-all duration-300 group-hover:h-1', accent)} />
            <CardHeader className="pb-2">
                <CardTitle
                    className="flex items-center gap-2.5 font-bold text-light-text-primary dark:text-dark-text-primary"
                    style={{ fontSize: 'var(--text-body)' }}
                >
                    <span
                        className={cn(
                            'flex items-center justify-center w-7 h-7 rounded-lg',
                            accent.replace('bg-', 'bg-').replace('-500', '-500/10').replace('-600', '-600/10'),
                        )}
                        style={{ background: 'color-mix(in srgb, currentColor 10%, transparent)' }}
                    >
                        {icon}
                    </span>
                    {title}
                </CardTitle>
                <p
                    className="text-light-text-secondary dark:text-dark-text-secondary mt-0.5"
                    style={{ fontSize: 'var(--text-small)' }}
                >
                    {description}
                </p>
            </CardHeader>
            <CardContent>
                <div className="space-y-1.5">
                    {multiline ? (
                        <textarea
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={placeholder}
                            rows={rows}
                            maxLength={maxLength}
                            className="w-full px-3 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-[var(--agora-blue)]/30 transition-all"
                            style={{ fontSize: 'var(--text-body)' }}
                        />
                    ) : (
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={placeholder}
                            maxLength={maxLength}
                            className="w-full px-3 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--agora-blue)]/30 transition-all"
                            style={{ fontSize: 'var(--text-body)' }}
                        />
                    )}
                    <div className="flex justify-end pr-1">
                        <CharCounter value={value} max={maxLength} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function SystemPromptPreview() {
    const [show, setShow] = useState(false);
    const { data, isLoading } = useAdminGetSystemPromptPreviewQuery(undefined, { skip: !show });

    return (
        <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-surface overflow-hidden">
            <button
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
                onClick={() => setShow((v) => !v)}
                type="button"
            >
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        <Eye className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                        <p
                            className="font-semibold text-light-text-primary dark:text-dark-text-primary"
                            style={{ fontSize: 'var(--text-body)' }}
                        >
                            System Prompt Preview
                        </p>
                        <p
                            className="text-light-text-secondary dark:text-dark-text-secondary"
                            style={{ fontSize: 'var(--text-small)' }}
                        >
                            Read-only structural template used by Lois
                        </p>
                    </div>
                </div>
                {show ? (
                    <ChevronUp className="h-4 w-4 text-light-text-muted dark:text-dark-text-muted" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-light-text-muted dark:text-dark-text-muted" />
                )}
            </button>

            {show && (
                <div className="border-t border-light-border dark:border-dark-border px-5 py-4">
                    {isLoading ? (
                        <div className="flex items-center gap-2 py-4 text-light-text-secondary dark:text-dark-text-secondary">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span style={{ fontSize: 'var(--text-body)' }}>Loading prompt…</span>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-start gap-2 mb-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
                                <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                <p
                                    className="text-amber-700 dark:text-amber-400"
                                    style={{ fontSize: 'var(--text-small)' }}
                                >
                                    {data?.data?.note}
                                </p>
                            </div>
                            <pre
                                className="whitespace-pre-wrap font-mono text-light-text-secondary dark:text-dark-text-secondary bg-light-bg dark:bg-dark-bg rounded-xl p-4 max-h-80 overflow-y-auto border border-light-border dark:border-dark-border"
                                style={{ fontSize: '0.7rem', lineHeight: '1.6' }}
                            >
                                {data?.data?.prompt}
                            </pre>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export function LoisConfigPanel({ schoolId, schoolName }: LoisConfigPanelProps) {
    const { data, isLoading, refetch } = useAdminGetLoisConfigQuery(schoolId);
    const [upsert, { isLoading: isSaving }] = useAdminUpsertLoisConfigMutation();
    const [deleteConfig, { isLoading: isDeleting }] = useAdminDeleteLoisConfigMutation();

    const [form, setForm] = useState<LoisConfigInput>({
        customGreeting: '',
        toneNote: '',
        restrictedTopics: '',
        schoolContext: '',
    });
    const [isDirty, setIsDirty] = useState(false);

    // Populate from API data
    useEffect(() => {
        if (data?.data) {
            setForm({
                customGreeting: data.data.customGreeting ?? '',
                toneNote: data.data.toneNote ?? '',
                restrictedTopics: data.data.restrictedTopics ?? '',
                schoolContext: data.data.schoolContext ?? '',
            });
        } else if (!isLoading) {
            setForm({ customGreeting: '', toneNote: '', restrictedTopics: '', schoolContext: '' });
        }
        setIsDirty(false);
    }, [data, isLoading]);

    const update = (key: keyof LoisConfigInput) => (val: string) => {
        setForm((prev) => ({ ...prev, [key]: val }));
        setIsDirty(true);
    };

    const handleSave = async () => {
        // Nullify empty strings before saving
        const payload: LoisConfigInput = {
            customGreeting: form.customGreeting?.trim() || null,
            toneNote: form.toneNote?.trim() || null,
            restrictedTopics: form.restrictedTopics?.trim() || null,
            schoolContext: form.schoolContext?.trim() || null,
        };
        try {
            await upsert({ schoolId, body: payload }).unwrap();
            toast.success('Lois configuration saved.');
            setIsDirty(false);
            refetch();
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to save config.');
        }
    };

    const handleReset = async () => {
        try {
            await deleteConfig(schoolId).unwrap();
            toast.success('Config reset to platform defaults.');
            setIsDirty(false);
            refetch();
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to reset config.');
        }
    };

    const hasConfig = !!data?.data;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-[var(--agora-blue)]" />
                    <span
                        className="text-light-text-secondary dark:text-dark-text-secondary animate-pulse"
                        style={{ fontSize: 'var(--text-body)' }}
                    >
                        Loading Lois configuration…
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Hero banner */}
            <FadeInUp staggerIndex={0}>
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2490FD]/10 via-purple-500/5 to-indigo-500/10 border border-[#2490FD]/20 dark:border-[#2490FD]/10 p-6">
                    {/* Decorative blobs */}
                    <div className="pointer-events-none absolute -top-8 -right-8 w-40 h-40 rounded-full bg-[#2490FD]/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-8 left-1/3 w-32 h-32 rounded-full bg-purple-500/10 blur-3xl" />

                    <div className="relative flex items-start gap-4">
                        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-[#2490FD]/15 border border-[#2490FD]/20">
                            <Sparkles className="h-6 w-6 text-[#2490FD]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3
                                className="font-bold text-light-text-primary dark:text-dark-text-primary mb-1"
                                style={{ fontSize: 'var(--text-card-title)', fontFamily: 'var(--font-heading)' }}
                            >
                                Lois Personality for {schoolName}
                            </h3>
                            <p
                                className="text-light-text-secondary dark:text-dark-text-secondary"
                                style={{ fontSize: 'var(--text-body)' }}
                            >
                                Customize how Lois presents herself to this school's users. Structural rules, SQL schema hints, and role-based tool routing are platform-managed and cannot be changed here.
                            </p>
                        </div>
                        {hasConfig && (
                            <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                                <CheckCircle2 className="h-3.5 w-3.5 text-[var(--agora-success)]" />
                                <span
                                    className="font-medium text-[var(--agora-success)]"
                                    style={{ fontSize: 'var(--text-small)' }}
                                >
                                    Custom config active
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </FadeInUp>

            {/* Fields grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <FadeInUp staggerIndex={1}>
                    <FieldCard
                        icon={<MessageSquare className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                        accent="bg-blue-500"
                        title="Custom Greeting"
                        description="How Lois opens a new conversation with users at this school."
                        placeholder="e.g. Welcome to Greenfield Academy! I'm Lois, your AI assistant."
                        value={form.customGreeting ?? ''}
                        onChange={update('customGreeting')}
                        maxLength={FIELD_LIMITS.customGreeting}
                    />
                </FadeInUp>

                <FadeInUp staggerIndex={2}>
                    <FieldCard
                        icon={<Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />}
                        accent="bg-purple-500"
                        title="Tone Guidance"
                        description="Describe the personality and tone Lois should adopt for this school."
                        placeholder="e.g. Be formal and encouraging. Use Nigerian school terminology."
                        value={form.toneNote ?? ''}
                        onChange={update('toneNote')}
                        maxLength={FIELD_LIMITS.toneNote}
                        multiline
                        rows={4}
                    />
                </FadeInUp>

                <FadeInUp staggerIndex={3}>
                    <FieldCard
                        icon={<Shield className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />}
                        accent="bg-red-500"
                        title="Restricted Topics"
                        description="Topics Lois should refuse to discuss with users of this school."
                        placeholder="e.g. political opinions, religious debates, competitor products"
                        value={form.restrictedTopics ?? ''}
                        onChange={update('restrictedTopics')}
                        maxLength={FIELD_LIMITS.restrictedTopics}
                        multiline
                        rows={4}
                    />
                </FadeInUp>

                <FadeInUp staggerIndex={4}>
                    <FieldCard
                        icon={<BookOpen className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
                        accent="bg-emerald-500"
                        title="School Context"
                        description="Background about the school injected into every Lois session."
                        placeholder="e.g. We are a faith-based secondary school in Lagos. We follow WAEC/NECO curriculum."
                        value={form.schoolContext ?? ''}
                        onChange={update('schoolContext')}
                        maxLength={FIELD_LIMITS.schoolContext}
                        multiline
                        rows={5}
                    />
                </FadeInUp>
            </div>

            {/* System Prompt Preview */}
            <FadeInUp staggerIndex={5}>
                <SystemPromptPreview />
            </FadeInUp>

            {/* Action Bar */}
            <FadeInUp staggerIndex={6}>
                <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-light-card dark:bg-dark-surface border border-light-border dark:border-dark-border">
                    <div>
                        {isDirty ? (
                            <p
                                className="font-medium text-amber-600 dark:text-amber-400"
                                style={{ fontSize: 'var(--text-small)' }}
                            >
                                You have unsaved changes
                            </p>
                        ) : hasConfig ? (
                            <p
                                className="font-medium text-[var(--agora-success)]"
                                style={{ fontSize: 'var(--text-small)' }}
                            >
                                Configuration is up to date
                            </p>
                        ) : (
                            <p
                                className="text-light-text-muted dark:text-dark-text-muted"
                                style={{ fontSize: 'var(--text-small)' }}
                            >
                                Using platform defaults
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {hasConfig && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleReset}
                                disabled={isDeleting || isSaving}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 gap-1.5"
                            >
                                {isDeleting ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <RotateCcw className="h-3.5 w-3.5" />
                                )}
                                Reset to defaults
                            </Button>
                        )}
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleSave}
                            disabled={isSaving || isDeleting || !isDirty}
                            className="gap-1.5 min-w-[110px]"
                        >
                            {isSaving ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Save className="h-3.5 w-3.5" />
                            )}
                            Save Changes
                        </Button>
                    </div>
                </div>
            </FadeInUp>
        </div>
    );
}
