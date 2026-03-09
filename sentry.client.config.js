import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || 'https://f002b1c05f7deaa589fcee53dcfb7448@o4511013685952512.ingest.de.sentry.io/4511014677315664';

Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 1.0,
    debug: true,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    integrations: [
        Sentry.replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
        }),
    ],
});

console.log("🕵️ Sentry Frontend Initialized. DSN Source:", process.env.NEXT_PUBLIC_SENTRY_DSN ? "Environment Variable" : "Hardcoded Fallback");
