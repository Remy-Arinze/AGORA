'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FadeInUp } from '@/components/ui/FadeInUp';
import {
    Sparkles,
    Plus,
    Pencil,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Loader2,
    GraduationCap,
    Users,
    ShieldCheck,
    Globe,
    BookOpen,
    Wand2,
    Music2,
    Workflow,
    ChevronDown,
    ChevronUp,
    AlertTriangle,
} from 'lucide-react';
import {
    useAdminListSkillsQuery,
    useAdminCreateSkillMutation,
    useAdminUpdateSkillMutation,
    useAdminToggleSkillMutation,
    useAdminDeleteSkillMutation,
    type LoisSkillDto,
    type CreateSkillInput,
    type SkillCategory,
    type SkillTargetRole,
} from '@/lib/store/api/aiApi';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES: { value: SkillCategory; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'behavior', label: 'Behavior', icon: <Wand2 className="h-3.5 w-3.5" />, color: 'text-blue-500 bg-blue-500/10' },
    { value: 'knowledge', label: 'Knowledge', icon: <BookOpen className="h-3.5 w-3.5" />, color: 'text-emerald-500 bg-emerald-500/10' },
    { value: 'tone', label: 'Tone', icon: <Music2 className="h-3.5 w-3.5" />, color: 'text-purple-500 bg-purple-500/10' },
    { value: 'workflow', label: 'Workflow', icon: <Workflow className="h-3.5 w-3.5" />, color: 'text-orange-500 bg-orange-500/10' },
];

const ROLE_OPTIONS: { value: SkillTargetRole; label: string; icon: React.ReactNode }[] = [
    { value: 'ALL', label: 'All Users', icon: <Globe className="h-3.5 w-3.5" /> },
    { value: 'TEACHER', label: 'Teachers', icon: <Users className="h-3.5 w-3.5" /> },
    { value: 'SCHOOL_ADMIN', label: 'School Admins', icon: <ShieldCheck className="h-3.5 w-3.5" /> },
    { value: 'STUDENT', label: 'Students', icon: <GraduationCap className="h-3.5 w-3.5" /> },
];

const CATEGORY_DESCRIPTIONS: Record<SkillCategory, string> = {
    behavior: 'How Lois responds — e.g. Socratic mode, encouragement style, confirmation habits',
    knowledge: 'What Lois knows — inject domain knowledge, curriculum details, school policies',
    tone: 'Voice and language — formal, friendly, age-appropriate, Nigerian terminology',
    workflow: 'Step-by-step processes — e.g. always confirm before generating, ask clarifying questions first',
};

const PLACEHOLDERS: Record<SkillCategory, string> = {
    behavior: `When a student asks a question, respond with a guiding question first before giving the answer. Use the Socratic method to help students think critically.\n\nIf the student seems frustrated, acknowledge their effort first before continuing.`,
    knowledge: `This school follows the WAEC and NECO curriculum framework. Nigerian academic terms:\n- "JSS" = Junior Secondary School (Years 7-9)\n- "SS" = Senior Secondary School (Years 10-12)\n- "CA" = Continuous Assessment (30%)\n- "Exam" = End-of-term examination (70%)\n\nAlways frame content around WAEC/NECO objectives when relevant.`,
    tone: `Use warm, encouraging language with students. Avoid academic jargon unless the student uses it first.\n\nFor school admins, be concise and data-driven. Lead with the key figure, then context.\n\nAlways address users by their first name when available.`,
    workflow: `Before generating any quiz or assessment:\n1. Confirm the subject and class level\n2. Ask how many questions are needed\n3. Ask the difficulty level (easy/medium/hard)\nOnly proceed after receiving all three answers.`,
};

function getCategoryStyle(category: string) {
    return CATEGORIES.find((c) => c.value === category) ?? CATEGORIES[0];
}

function getRoleLabels(targetRoles: string): string {
    return targetRoles
        .split(',')
        .map((r) => ROLE_OPTIONS.find((o) => o.value === r.trim())?.label ?? r.trim())
        .join(', ');
}

// ── Skill form modal ──────────────────────────────────────────────────────────
interface SkillFormProps {
    skill?: LoisSkillDto | null;
    onClose: () => void;
}

function SkillForm({ skill, onClose }: SkillFormProps) {
    const isEditing = !!skill;
    const [create, { isLoading: isCreating }] = useAdminCreateSkillMutation();
    const [update, { isLoading: isUpdating }] = useAdminUpdateSkillMutation();

    const [form, setForm] = useState<CreateSkillInput>({
        name: skill?.name ?? '',
        description: skill?.description ?? '',
        content: skill?.content ?? '',
        targetRoles: skill?.targetRoles ?? 'ALL',
        category: skill?.category ?? 'behavior',
        isActive: skill?.isActive ?? true,
        priority: skill?.priority ?? 100,
        internalNotes: skill?.internalNotes ?? '',
    });

    const [showAdvanced, setShowAdvanced] = useState(false);
    const isSaving = isCreating || isUpdating;

    // Parse targetRoles into a set for the checkbox UI
    const selectedRoles = new Set(
        (form.targetRoles ?? 'ALL').split(',').map((r) => r.trim().toUpperCase())
    );

    const toggleRole = (role: SkillTargetRole) => {
        const next = new Set(selectedRoles);
        if (role === 'ALL') {
            setForm((p) => ({ ...p, targetRoles: 'ALL' }));
            return;
        }
        next.delete('ALL');
        if (next.has(role)) next.delete(role);
        else next.add(role);
        if (next.size === 0) next.add('ALL');
        setForm((p) => ({ ...p, targetRoles: [...next].join(',') }));
    };

    const handleSubmit = async () => {
        if (!form.name?.trim()) { toast.error('Name is required'); return; }
        if (!form.description?.trim()) { toast.error('Description is required'); return; }
        if (!form.content?.trim()) { toast.error('Skill instructions cannot be empty'); return; }

        const payload = {
            ...form,
            internalNotes: form.internalNotes?.trim() || null,
            priority: Number(form.priority) || 100,
        };

        try {
            if (isEditing) {
                await update({ id: skill!.id, body: payload }).unwrap();
                toast.success('Skill updated.');
            } else {
                await create(payload).unwrap();
                toast.success('Skill created.');
            }
            onClose();
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to save skill.');
        }
    };

    const catStyle = getCategoryStyle(form.category ?? 'behavior');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-light-card dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-light-card dark:bg-dark-surface border-b border-light-border dark:border-dark-border">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[var(--agora-blue)]/10">
                            <Sparkles className="h-4 w-4 text-[var(--agora-blue)]" />
                        </div>
                        <h2 className="font-bold text-light-text-primary dark:text-dark-text-primary" style={{ fontSize: 'var(--text-card-title)', fontFamily: 'var(--font-heading)' }}>
                            {isEditing ? 'Edit Skill' : 'New Skill'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors p-1">
                        ✕
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Name */}
                    <div className="space-y-1.5">
                        <label className="font-semibold text-light-text-primary dark:text-dark-text-primary" style={{ fontSize: 'var(--text-small)' }}>
                            Skill Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={form.name}
                            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                            placeholder="e.g. Exam Prep Tutor, WAEC Knowledge Base"
                            maxLength={100}
                            className="w-full px-3 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--agora-blue)]/30 transition-all"
                            style={{ fontSize: 'var(--text-body)' }}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="font-semibold text-light-text-primary dark:text-dark-text-primary" style={{ fontSize: 'var(--text-small)' }}>
                            Description <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={form.description}
                            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                            placeholder="What does this skill do? (visible in dashboard only)"
                            maxLength={300}
                            className="w-full px-3 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--agora-blue)]/30 transition-all"
                            style={{ fontSize: 'var(--text-body)' }}
                        />
                    </div>

                    {/* Category + Target Roles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="font-semibold text-light-text-primary dark:text-dark-text-primary" style={{ fontSize: 'var(--text-small)' }}>Category</label>
                            <div className="grid grid-cols-2 gap-2">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.value}
                                        type="button"
                                        onClick={() => setForm((p) => ({ ...p, category: cat.value }))}
                                        className={cn(
                                            'flex items-center gap-2 px-3 py-2 rounded-xl border transition-all',
                                            form.category === cat.value
                                                ? 'border-[var(--agora-blue)] bg-[var(--agora-blue)]/10'
                                                : 'border-light-border dark:border-dark-border hover:border-[var(--agora-blue)]/40'
                                        )}
                                    >
                                        <span className={cn('flex-shrink-0', cat.color)}>{cat.icon}</span>
                                        <span className="font-medium text-light-text-primary dark:text-dark-text-primary" style={{ fontSize: 'var(--text-small)' }}>
                                            {cat.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <p className="text-light-text-muted dark:text-dark-text-muted" style={{ fontSize: 'var(--text-tiny)' }}>
                                {CATEGORY_DESCRIPTIONS[form.category ?? 'behavior']}
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="font-semibold text-light-text-primary dark:text-dark-text-primary" style={{ fontSize: 'var(--text-small)' }}>Target Roles</label>
                            <div className="space-y-2">
                                {ROLE_OPTIONS.map((role) => {
                                    const active = selectedRoles.has(role.value);
                                    return (
                                        <button
                                            key={role.value}
                                            type="button"
                                            onClick={() => toggleRole(role.value)}
                                            className={cn(
                                                'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all text-left',
                                                active
                                                    ? 'border-[var(--agora-blue)] bg-[var(--agora-blue)]/10'
                                                    : 'border-light-border dark:border-dark-border hover:border-[var(--agora-blue)]/40'
                                            )}
                                        >
                                            <span className={cn('flex-shrink-0', active ? 'text-[var(--agora-blue)]' : 'text-light-text-muted dark:text-dark-text-muted')}>
                                                {role.icon}
                                            </span>
                                            <span className="font-medium text-light-text-primary dark:text-dark-text-primary" style={{ fontSize: 'var(--text-small)' }}>
                                                {role.label}
                                            </span>
                                            {active && (
                                                <span className="ml-auto w-4 h-4 rounded-full bg-[var(--agora-blue)] flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white" style={{ fontSize: '0.5rem' }}>✓</span>
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="space-y-1.5">
                        <label className="font-semibold text-light-text-primary dark:text-dark-text-primary" style={{ fontSize: 'var(--text-small)' }}>
                            Skill Instructions <span className="text-red-500">*</span>
                        </label>
                        <p className="text-light-text-muted dark:text-dark-text-muted" style={{ fontSize: 'var(--text-tiny)' }}>
                            These instructions are injected directly into Lois's system prompt. Write them as directives to Lois.
                        </p>
                        <textarea
                            value={form.content}
                            onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                            placeholder={PLACEHOLDERS[form.category ?? 'behavior']}
                            rows={10}
                            maxLength={5000}
                            className="w-full px-3 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary font-mono resize-y focus:outline-none focus:ring-2 focus:ring-[var(--agora-blue)]/30 transition-all"
                            style={{ fontSize: '0.75rem', lineHeight: '1.6' }}
                        />
                        <div className="flex justify-end">
                            <span
                                className={cn('tabular-nums', (form.content?.length ?? 0) > 4500 ? 'text-red-500' : 'text-light-text-muted dark:text-dark-text-muted')}
                                style={{ fontSize: 'var(--text-small)' }}
                            >
                                {form.content?.length ?? 0}/5000
                            </span>
                        </div>
                    </div>

                    {/* Advanced toggle */}
                    <div>
                        <button
                            type="button"
                            onClick={() => setShowAdvanced((v) => !v)}
                            className="flex items-center gap-1.5 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
                            style={{ fontSize: 'var(--text-small)' }}
                        >
                            {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            Advanced options
                        </button>

                        {showAdvanced && (
                            <div className="mt-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="font-semibold text-light-text-primary dark:text-dark-text-primary" style={{ fontSize: 'var(--text-small)' }}>
                                            Priority
                                        </label>
                                        <p className="text-light-text-muted dark:text-dark-text-muted" style={{ fontSize: 'var(--text-tiny)' }}>
                                            Lower = injected earlier (0–999)
                                        </p>
                                        <input
                                            type="number"
                                            min={0}
                                            max={999}
                                            value={form.priority}
                                            onChange={(e) => setForm((p) => ({ ...p, priority: parseInt(e.target.value) || 100 }))}
                                            className="w-full px-3 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--agora-blue)]/30 transition-all"
                                            style={{ fontSize: 'var(--text-body)' }}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="font-semibold text-light-text-primary dark:text-dark-text-primary" style={{ fontSize: 'var(--text-small)' }}>
                                            Active on creation
                                        </label>
                                        <p className="text-light-text-muted dark:text-dark-text-muted" style={{ fontSize: 'var(--text-tiny)' }}>
                                            Toggle to enable/disable immediately
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
                                            className="flex items-center gap-2 mt-2"
                                        >
                                            {form.isActive
                                                ? <ToggleRight className="h-6 w-6 text-[var(--agora-blue)]" />
                                                : <ToggleLeft className="h-6 w-6 text-light-text-muted dark:text-dark-text-muted" />}
                                            <span className="font-medium" style={{ fontSize: 'var(--text-small)' }}>
                                                {form.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="font-semibold text-light-text-primary dark:text-dark-text-primary" style={{ fontSize: 'var(--text-small)' }}>
                                        Internal Notes
                                    </label>
                                    <p className="text-light-text-muted dark:text-dark-text-muted" style={{ fontSize: 'var(--text-tiny)' }}>
                                        Never injected into Lois — your own documentation
                                    </p>
                                    <textarea
                                        value={form.internalNotes ?? ''}
                                        onChange={(e) => setForm((p) => ({ ...p, internalNotes: e.target.value }))}
                                        placeholder="e.g. Added 2026-06-10 for exam prep season. Review after WAEC results."
                                        rows={3}
                                        maxLength={2000}
                                        className="w-full px-3 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-[var(--agora-blue)]/30 transition-all"
                                        style={{ fontSize: 'var(--text-body)' }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer actions */}
                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-light-border dark:border-dark-border">
                        <Button variant="ghost" size="sm" onClick={onClose} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isSaving} className="min-w-[110px] gap-1.5">
                            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                            {isEditing ? 'Save Changes' : 'Create Skill'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Skill card ────────────────────────────────────────────────────────────────
interface SkillCardProps {
    skill: LoisSkillDto;
    index: number;
    onEdit: (s: LoisSkillDto) => void;
    onDelete: (id: string) => void;
}

function SkillCard({ skill, index, onEdit, onDelete }: SkillCardProps) {
    const [toggle, { isLoading: isToggling }] = useAdminToggleSkillMutation();
    const catStyle = getCategoryStyle(skill.category);
    const [expanded, setExpanded] = useState(false);

    return (
        <FadeInUp staggerIndex={index} staggerDelay={0.04}>
            <div className={cn(
                'rounded-2xl border transition-all duration-200',
                skill.isActive
                    ? 'border-light-border dark:border-dark-border bg-light-card dark:bg-dark-surface hover:shadow-md'
                    : 'border-dashed border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg opacity-60'
            )}>
                {/* Top accent line */}
                <div className={cn('h-0.5 rounded-t-2xl', skill.isActive ? `bg-${skill.category === 'behavior' ? 'blue' : skill.category === 'knowledge' ? 'emerald' : skill.category === 'tone' ? 'purple' : 'orange'}-500` : 'bg-gray-300 dark:bg-gray-700')} />

                <div className="p-4">
                    <div className="flex items-start gap-3">
                        {/* Category icon */}
                        <div className={cn('flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl border border-light-border dark:border-dark-border', catStyle.color)}>
                            {catStyle.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                <span className="font-bold text-light-text-primary dark:text-dark-text-primary" style={{ fontSize: 'var(--text-body)' }}>
                                    {skill.name}
                                </span>
                                <span className={cn('px-2 py-0.5 rounded-full font-medium flex-shrink-0', catStyle.color)} style={{ fontSize: 'var(--text-tiny)' }}>
                                    {catStyle.label}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-light-text-secondary dark:text-dark-text-secondary flex-shrink-0" style={{ fontSize: 'var(--text-tiny)' }}>
                                    {getRoleLabels(skill.targetRoles)}
                                </span>
                                <span className="text-light-text-muted dark:text-dark-text-muted flex-shrink-0" style={{ fontSize: 'var(--text-tiny)' }}>
                                    p:{skill.priority}
                                </span>
                            </div>
                            <p className="text-light-text-secondary dark:text-dark-text-secondary" style={{ fontSize: 'var(--text-small)' }}>
                                {skill.description}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                            <button
                                onClick={() => toggle(skill.id)}
                                disabled={isToggling}
                                title={skill.isActive ? 'Deactivate' : 'Activate'}
                                className="p-1.5 rounded-lg hover:bg-light-bg dark:hover:bg-dark-bg transition-colors"
                            >
                                {isToggling
                                    ? <Loader2 className="h-4 w-4 animate-spin text-light-text-muted dark:text-dark-text-muted" />
                                    : skill.isActive
                                        ? <ToggleRight className="h-5 w-5 text-[var(--agora-blue)]" />
                                        : <ToggleLeft className="h-5 w-5 text-light-text-muted dark:text-dark-text-muted" />
                                }
                            </button>
                            <button
                                onClick={() => onEdit(skill)}
                                title="Edit skill"
                                className="p-1.5 rounded-lg hover:bg-light-bg dark:hover:bg-dark-bg text-light-text-secondary dark:text-dark-text-secondary hover:text-[var(--agora-blue)] transition-colors"
                            >
                                <Pencil className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => onDelete(skill.id)}
                                title="Delete skill"
                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-light-text-muted dark:text-dark-text-muted hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setExpanded((v) => !v)}
                                title="Preview instructions"
                                className="p-1.5 rounded-lg hover:bg-light-bg dark:hover:bg-dark-bg text-light-text-muted dark:text-dark-text-muted transition-colors"
                            >
                                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Expanded instructions preview */}
                    {expanded && (
                        <div className="mt-3 pt-3 border-t border-light-border dark:border-dark-border">
                            <pre
                                className="whitespace-pre-wrap font-mono text-light-text-secondary dark:text-dark-text-secondary bg-light-bg dark:bg-dark-bg rounded-xl p-3 max-h-48 overflow-y-auto"
                                style={{ fontSize: '0.7rem', lineHeight: '1.6' }}
                            >
                                {skill.content}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </FadeInUp>
    );
}

// ── Main SkillsTab export ─────────────────────────────────────────────────────
export function SkillsTab() {
    const { data, isLoading } = useAdminListSkillsQuery();
    const [deleteSkill, { isLoading: isDeleting }] = useAdminDeleteSkillMutation();

    const [showForm, setShowForm] = useState(false);
    const [editingSkill, setEditingSkill] = useState<LoisSkillDto | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [filterCategory, setFilterCategory] = useState<SkillCategory | 'all'>('all');
    const [filterRole, setFilterRole] = useState<string>('all');

    const skills = data?.data ?? [];
    const activeCount = skills.filter((s) => s.isActive).length;

    const filtered = skills.filter((s) => {
        const catMatch = filterCategory === 'all' || s.category === filterCategory;
        const roleMatch = filterRole === 'all' || s.targetRoles.split(',').map((r) => r.trim()).includes(filterRole);
        return catMatch && roleMatch;
    });

    const handleEdit = (skill: LoisSkillDto) => {
        setEditingSkill(skill);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (deletingId !== id) { setDeletingId(id); return; } // first click = confirm
        try {
            await deleteSkill(id).unwrap();
            toast.success('Skill deleted.');
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to delete skill.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-5">
            {/* Info banner */}
            <FadeInUp staggerIndex={0}>
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-br from-[#2490FD]/5 via-purple-500/5 to-transparent border border-[#2490FD]/15">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#2490FD]/10 border border-[#2490FD]/20 flex-shrink-0">
                        <Sparkles className="h-5 w-5 text-[#2490FD]" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-light-text-primary dark:text-dark-text-primary mb-0.5" style={{ fontSize: 'var(--text-body)' }}>
                            Lois Skills — {activeCount} active of {skills.length} total
                        </p>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary" style={{ fontSize: 'var(--text-small)' }}>
                            Skills are DB-stored instruction blocks injected into Lois's system prompt at runtime. Active skills matching the user's role are loaded on every chat turn — no deployment needed to make Lois smarter.
                        </p>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => { setEditingSkill(null); setShowForm(true); }} className="flex-shrink-0 gap-1.5">
                        <Plus className="h-3.5 w-3.5" />
                        New Skill
                    </Button>
                </div>
            </FadeInUp>

            {/* Filters */}
            <FadeInUp staggerIndex={1}>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFilterCategory('all')}
                        className={cn('px-3 py-1.5 rounded-xl border transition-all font-medium', filterCategory === 'all' ? 'border-[var(--agora-blue)] bg-[var(--agora-blue)]/10 text-[var(--agora-blue)]' : 'border-light-border dark:border-dark-border text-light-text-secondary dark:text-dark-text-secondary hover:border-[var(--agora-blue)]/40')}
                        style={{ fontSize: 'var(--text-small)' }}
                    >
                        All categories
                    </button>
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => setFilterCategory(cat.value)}
                            className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all font-medium', filterCategory === cat.value ? 'border-[var(--agora-blue)] bg-[var(--agora-blue)]/10 text-[var(--agora-blue)]' : 'border-light-border dark:border-dark-border text-light-text-secondary dark:text-dark-text-secondary hover:border-[var(--agora-blue)]/40')}
                            style={{ fontSize: 'var(--text-small)' }}
                        >
                            <span className={cat.color}>{cat.icon}</span>
                            {cat.label}
                        </button>
                    ))}
                    <div className="h-6 w-px bg-light-border dark:bg-dark-border self-center mx-1" />
                    <button
                        onClick={() => setFilterRole('all')}
                        className={cn('px-3 py-1.5 rounded-xl border transition-all font-medium', filterRole === 'all' ? 'border-[var(--agora-blue)] bg-[var(--agora-blue)]/10 text-[var(--agora-blue)]' : 'border-light-border dark:border-dark-border text-light-text-secondary dark:text-dark-text-secondary hover:border-[var(--agora-blue)]/40')}
                        style={{ fontSize: 'var(--text-small)' }}
                    >
                        All roles
                    </button>
                    {ROLE_OPTIONS.filter((r) => r.value !== 'ALL').map((role) => (
                        <button
                            key={role.value}
                            onClick={() => setFilterRole(role.value)}
                            className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all font-medium', filterRole === role.value ? 'border-[var(--agora-blue)] bg-[var(--agora-blue)]/10 text-[var(--agora-blue)]' : 'border-light-border dark:border-dark-border text-light-text-secondary dark:text-dark-text-secondary hover:border-[var(--agora-blue)]/40')}
                            style={{ fontSize: 'var(--text-small)' }}
                        >
                            {role.icon}
                            {role.label}
                        </button>
                    ))}
                </div>
            </FadeInUp>

            {/* Skills list */}
            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-[var(--agora-blue)]" />
                </div>
            ) : filtered.length === 0 ? (
                <FadeInUp>
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border mb-4">
                            <Sparkles className="h-7 w-7 text-light-text-muted dark:text-dark-text-muted" />
                        </div>
                        <p className="font-semibold text-light-text-primary dark:text-dark-text-primary mb-1" style={{ fontSize: 'var(--text-body)' }}>
                            {skills.length === 0 ? 'No skills yet' : 'No skills match your filters'}
                        </p>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary max-w-sm mb-4" style={{ fontSize: 'var(--text-small)' }}>
                            {skills.length === 0
                                ? 'Create your first skill to start making Lois smarter. Skills are injected into every chat session for matching user roles.'
                                : 'Try adjusting your category or role filter.'}
                        </p>
                        {skills.length === 0 && (
                            <Button variant="primary" size="sm" onClick={() => { setEditingSkill(null); setShowForm(true); }} className="gap-1.5">
                                <Plus className="h-3.5 w-3.5" />
                                Create First Skill
                            </Button>
                        )}
                    </div>
                </FadeInUp>
            ) : (
                <div className="space-y-3">
                    {/* Delete confirmation banner */}
                    {deletingId && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-700/30">
                            <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                            <p className="flex-1 text-red-700 dark:text-red-400" style={{ fontSize: 'var(--text-small)' }}>
                                Click Delete again to confirm — this cannot be undone.
                            </p>
                            <Button variant="danger" size="sm" onClick={() => handleDelete(deletingId)} disabled={isDeleting} className="flex-shrink-0 gap-1.5">
                                {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                Delete
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeletingId(null)} className="flex-shrink-0">Cancel</Button>
                        </div>
                    )}

                    {filtered.map((skill, i) => (
                        <SkillCard
                            key={skill.id}
                            skill={skill}
                            index={i}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* Form modal */}
            {showForm && (
                <SkillForm
                    skill={editingSkill}
                    onClose={() => { setShowForm(false); setEditingSkill(null); }}
                />
            )}
        </div>
    );
}
