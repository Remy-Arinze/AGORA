'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  useGetDowngradePreviewQuery,
  useDowngradeToFreeMutation,
} from '@/lib/store/api/subscriptionsApi';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { useCurrentAdminPermissions } from '@/hooks/usePermissions';
import { ShieldCheck } from 'lucide-react';

export default function DowngradeToFreePage() {
  const { isPrincipal, isLoading: isLoadingAuth } = useCurrentAdminPermissions();
  const { data, isLoading, error, refetch } = useGetDowngradePreviewQuery(undefined, {
    skip: !isPrincipal,
  });
  const preview = data?.data;
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmed, setConfirmed] = useState(false);
  const [downgrade, { isLoading: submitting }] = useDowngradeToFreeMutation();

  const pickExactly = preview?.pickExactly ?? 0;
  const requiresPick = preview?.requiresStudentPick ?? false;

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        if (next.size >= pickExactly) return prev;
        next.add(id);
      }
      return next;
    });
  };

  const canGoStep3 = useMemo(() => {
    if (!requiresPick) return true;
    return selected.size === pickExactly;
  }, [requiresPick, selected.size, pickExactly]);

  const runDowngrade = async () => {
    const keep = requiresPick ? Array.from(selected) : [];
    await downgrade({ keepEnrollmentIds: keep }).unwrap();
    window.location.href = '/dashboard/school/subscription';
  };

  if (isLoadingAuth || isLoading) {
    return (
      <div className="p-8 text-center text-zinc-600 dark:text-zinc-400">Loading…</div>
    );
  }

  if (!isPrincipal) {
    return (
      <div className="max-w-lg mx-auto p-8 text-center space-y-4">
        <ShieldCheck className="w-14 h-14 text-zinc-300 dark:text-zinc-600 mx-auto" />
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Access restricted</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Only school leaders (Owner, Principal, or Head Teacher) can run a downgrade to the Free plan.
        </p>
        <Link
          href="/dashboard/school"
          className="inline-flex items-center justify-center rounded-lg border border-zinc-300 dark:border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (error || !preview) {
    return (
      <div className="max-w-lg mx-auto p-8 space-y-4">
        <p className="text-zinc-700 dark:text-zinc-300">
          Downgrade is not available right now (you may still be in grace, or billing may already be on the Free
          plan).
        </p>
        <Link
          href="/dashboard/school/subscription"
          className="inline-flex items-center justify-center rounded-lg border border-zinc-300 dark:border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800"
        >
          Back to subscription
        </Link>
        <Button variant="ghost" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Downgrade to Free</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Your data is kept. Locked enrollments and suspended staff seats are restored automatically when the school
          renews a paid plan — they cannot be cleared manually to bypass caps.
        </p>
      </div>

      {step === 1 && (
        <div className="space-y-4 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
          <h2 className="font-medium">Step 1 — Impact</h2>
          <ul className="text-sm space-y-2 text-zinc-700 dark:text-zinc-300 list-disc pl-5">
            <li>Operational students: {preview.operationalStudentCount}</li>
            <li>Free tier allows: {preview.freeMaxStudents} students</li>
            {requiresPick && (
              <li className="font-medium text-amber-800 dark:text-amber-200">
                You must pick exactly {pickExactly} enrollments to stay active. The rest will be billing-locked
                (login blocked for those students until renewal).
              </li>
            )}
            <li>Teachers over free cap after downgrade: {preview.teachersToSuspendIfNoAction} may be suspended.</li>
            <li>Admins over free cap: {preview.adminsToSuspendIfNoAction} may be suspended.</li>
          </ul>
          <Button onClick={() => setStep(requiresPick ? 2 : 3)}>Continue</Button>
        </div>
      )}

      {step === 2 && requiresPick && (
        <div className="space-y-4 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
          <h2 className="font-medium">Step 2 — Pick students to keep active ({selected.size}/{pickExactly})</h2>
          <p className="text-xs text-zinc-500">Newest enrollments listed first. Select exactly {pickExactly}.</p>
          <div className="max-h-80 overflow-y-auto border border-zinc-100 dark:border-zinc-800 rounded-lg divide-y divide-zinc-100 dark:divide-zinc-800">
            {preview.enrollments.map((e) => (
              <label key={e.enrollmentId} className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.has(e.enrollmentId)}
                  onChange={() => toggle(e.enrollmentId)}
                />
                <span className="flex-1">
                  {e.name}{' '}
                  <span className="text-zinc-500">({e.publicId ?? e.studentId.slice(0, 8)})</span>
                </span>
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button disabled={!canGoStep3} onClick={() => setStep(3)}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
          <h2 className="font-medium">Step 3 — Confirm</h2>
          <label className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <Checkbox checked={confirmed} onCheckedChange={(v) => setConfirmed(!!v)} />
            <span>
              I understand that students not kept active may be billing-locked, and excess teachers/admins may be
              suspended until we renew. This cannot be used to keep paid headcount on a Free plan.
            </span>
          </label>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(requiresPick ? 2 : 1)}>
              Back
            </Button>
            <Button disabled={!confirmed || submitting} onClick={runDowngrade}>
              {submitting ? 'Processing…' : 'Confirm downgrade'}
            </Button>
          </div>
        </div>
      )}

      <Link href="/dashboard/school/subscription" className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline">
        Cancel
      </Link>
    </div>
  );
}
