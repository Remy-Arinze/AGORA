'use client';

import { Button } from '@/components/ui/Button';
import { LandingNavbar } from '@/components/layout/LandingNavbar';
import * as Sentry from '@sentry/nextjs';

export default function SentryTestPage() {
    const triggerBrowserError = () => {
        // Normal Error
        throw new Error('Agora Frontend: Explicit Browser Error Triggered');
    };

    const triggerReferenceError = () => {
        // ReferenceError
        // @ts-ignore
        return nonExistentFunction();
    };

    const triggerManualCapture = () => {
        try {
            // @ts-ignore
            const result = someBadCalculation / 0;
            throw new Error('Something went wrong during manual capture test');
        } catch (error) {
            Sentry.captureException(error);
            alert('Error captured manually in Sentry!');
        }
    };

    return (
        <div className="min-h-screen bg-[var(--dark-bg)] text-[var(--dark-text-primary)] transition-colors duration-300">
            <LandingNavbar />

            <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
                <h1 className="text-4xl font-bold mb-8 font-heading">Sentry Troubleshooting & Debugging</h1>
                <p className="text-xl opacity-80 mb-6">
                    Use the buttons below to verify that Sentry is correctly capturing and reporting errors from your frontend.
                </p>

                {/* Sentry Status Banner */}
                <div className="mb-12 p-4 bg-white/5 rounded-xl border border-white/10 inline-block text-left">
                    <p className="text-sm font-mono flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${process.env.NEXT_PUBLIC_SENTRY_DSN || true ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        Sentry DSN Source: <span className="opacity-60">{process.env.NEXT_PUBLIC_SENTRY_DSN ? "Environment (.env)" : "Hardcoded Fallback"}</span>
                    </p>
                    <p className="text-sm font-mono flex items-center gap-2 mt-2">
                        <span className={`w-2 h-2 rounded-full ${Sentry.isInitialized() ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        SDK Initialized: <span className="opacity-60">{Sentry.isInitialized() ? 'YES' : 'NO'}</span>
                    </p>
                    <p className="text-xs opacity-40 mt-1">
                        If "SDK Initialized" is NO, the Sentry initialization files are not being executed.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 bg-[var(--dark-surface)] rounded-2xl border border-white/5 shadow-2xl flex flex-col items-center">
                        <h2 className="text-xl font-bold mb-4">Rendering/Runtime Errors</h2>
                        <p className="mb-6 opacity-70">These will be caught by the global ErrorBoundary in your root layout.</p>
                        <div className="flex flex-col gap-4 w-full">
                            <Button
                                variant="outline"
                                onClick={triggerBrowserError}
                                className="hover:bg-red-500/10 border-red-500/20 text-red-400"
                            >
                                Trigger Explicit Error
                            </Button>
                            <Button
                                variant="outline"
                                onClick={triggerReferenceError}
                                className="hover:bg-red-500/10 border-red-500/20 text-red-400"
                            >
                                Trigger Reference Error
                            </Button>
                        </div>
                    </div>

                    <div className="p-8 bg-[var(--dark-surface)] rounded-2xl border border-white/5 shadow-2xl flex flex-col items-center">
                        <h2 className="text-xl font-bold mb-4">Manual Monitoring</h2>
                        <p className="mb-6 opacity-70">Test explicit capturing for handled exceptions in your code.</p>
                        <div className="flex flex-col gap-4 w-full">
                            <Button
                                variant="primary"
                                onClick={triggerManualCapture}
                                className="bg-agora-blue text-white"
                            >
                                Sentry.captureException()
                            </Button>
                        </div>
                    </div>

                    <div className="p-8 bg-[var(--dark-surface)] rounded-2xl border border-white/5 shadow-2xl flex flex-col items-center md:col-span-2">
                        <h2 className="text-xl font-bold mb-4">Backend Sentry Test</h2>
                        <p className="mb-6 opacity-70">Verify that the API correctly reports server-side errors to Sentry via the global filter.</p>
                        <a
                            href="http://localhost:4000/sentry-debug"
                            target="_blank"
                            className="px-8 py-3 bg-[var(--dark-bg)] border border-white/10 rounded-xl hover:bg-white/5 transition-colors font-bold"
                        >
                            Open Backend Debug Route (External)
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
}
