'use client';

import { openobserveRum } from '@openobserve/browser-rum';
import { openobserveLogs } from '@openobserve/browser-logs';

const RUM_OPTIONS = {
  clientToken: 'rum4rDSyAmYSThCy65j',
  applicationId: 'agora-web',
  site: 'console-observe.agora-schools.com',
  service: 'agora-frontend',
  env: process.env.NODE_ENV || 'production',
  version: '1.0.0',
  organizationIdentifier: 'default',
  insecureHTTP: false,
  apiVersion: 'v1' as const,
};

let initialized = false;

export function initOpenObserve() {
  // Only initialise once, and only in the browser
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  openobserveRum.init({
    applicationId: RUM_OPTIONS.applicationId,
    clientToken: RUM_OPTIONS.clientToken,
    site: RUM_OPTIONS.site,
    organizationIdentifier: RUM_OPTIONS.organizationIdentifier,
    service: RUM_OPTIONS.service,
    env: RUM_OPTIONS.env,
    version: RUM_OPTIONS.version,
    trackResources: true,
    trackLongTasks: true,
    trackUserInteractions: true,
    apiVersion: RUM_OPTIONS.apiVersion,
    insecureHTTP: RUM_OPTIONS.insecureHTTP,
    defaultPrivacyLevel: 'mask-user-input', // mask inputs; keep all other events
    sessionSampleRate: 100,        // capture every session
    sessionReplaySampleRate: 50,   // replay 50% of sessions
  });

  openobserveLogs.init({
    clientToken: RUM_OPTIONS.clientToken,
    site: RUM_OPTIONS.site,
    organizationIdentifier: RUM_OPTIONS.organizationIdentifier,
    service: RUM_OPTIONS.service,
    env: RUM_OPTIONS.env,
    version: RUM_OPTIONS.version,
    forwardErrorsToLogs: true,     // uncaught JS errors → OpenObserve
    insecureHTTP: RUM_OPTIONS.insecureHTTP,
    apiVersion: RUM_OPTIONS.apiVersion,
  });

  openobserveRum.startSessionReplayRecording();
}

export interface RumUser {
  id: string;
  name: string;
  email: string | null;
  role: string;
  schoolId?: string | null;
}

export function setRumUser(user: RumUser) {
  if (typeof window === 'undefined') return;
  openobserveRum.setUser({
    id: user.id,
    name: user.name,
    email: user.email ?? undefined,
    role: user.role,
    school_id: user.schoolId ?? undefined,
  });
}

export function clearRumUser() {
  if (typeof window === 'undefined') return;
  openobserveRum.clearUser();
}
