/**
 * The reading's one backend contract (ARCHITECTURE.md §11 F6). Two
 * implementations: api-live.ts (the proxy at api.palmsays.com, supabase-js
 * with the publishable key) and api-mock.ts (previews: a stored real scan,
 * nothing leaves the browser). The flow (machine.ts) only knows this file.
 */

import type { HandSide } from './palm/features/observation/taxonomy';
import { dropMalformedFate } from './palm/features/lines/client';
import { lineServiceResponseSchema, type LineScanOutcome } from './palm/features/lines/types';
import type { ReadingOutcome } from './palm/features/reading/pipeline';
import { normaliseVisionPayload } from './palm/features/vision/normalise';
import { VisionError, visionErrorFromCode, type PalmVisionProvider, type VisionResult } from './palm/features/vision/provider';
import { ReadingError } from './errors';

export interface Balance {
  /** Free readings usable right now. */
  freeNow: number;
  /** Free readings still to come, including the one a guest gets by signing up. */
  freeRemaining: number;
  /** The next free reading needs an email code first. */
  emailNeeded: boolean;
}

export interface WebUser {
  id: string;
  email: string | null;
  isGuest: boolean;
}

export interface WebSession {
  id: string;
  /** How the server charged it (free_guest / free_email); null before the model call. */
  chargedAs: string | null;
}

export type CodeResult = 'sent' | 'taken' | 'wait' | 'unavailable' | 'invalid';
export type VerifyResult = 'ok' | 'wrong' | 'wait';

export interface EventRow {
  event: string;
  detail: string;
  variant: string;
  app_version: string;
  n: number;
  day: string;
}

export interface ScanHint {
  traced: boolean;
  mainLines: number;
}

export interface ReadingApi {
  readonly mode: 'mock' | 'live';
  /** The signed-in user from this browser's stored session; never signs anyone in. */
  currentUser(): Promise<WebUser | null>;
  /** Guest sign-in (anonymous), reusing a stored session. Only after a photo is picked. */
  ensureGuest(): Promise<WebUser>;
  balance(): Promise<Balance>;
  /** Cloudflare Turnstile token → a 10-minute web pass (web-gate). */
  webGate(token: string): Promise<void>;
  startWebReading(handSide: HandSide, isDominant: boolean, idempotencyKey: string): Promise<WebSession>;
  /** `onUploaded` fires when the photo has been sent (the "Sending securely" → "Tracing your lines" switch). */
  scan(sessionId: string, imageBase64: string, handSide: HandSide, onUploaded?: () => void): Promise<LineScanOutcome>;
  extract(sessionId: string, imageBase64: string, hint: ScanHint | undefined): Promise<VisionResult>;
  /** Saves the observation and report, then completes the session (idempotent). */
  complete(sessionId: string, outcome: ReadingOutcome): Promise<WebSession>;
  fail(sessionId: string, kind: string): Promise<void>;
  /** A guest adds an email to the SAME account: a 6-digit code is emailed (email_change). */
  sendEmailCode(email: string): Promise<CodeResult>;
  /** The email already has an account: sign in to it with a code (never creates one). */
  sendSignInCode(email: string): Promise<CodeResult>;
  verifyCode(email: string, code: string, kind: 'email_change' | 'email'): Promise<VerifyResult>;
  logEvents(rows: EventRow[], keepalive?: boolean): Promise<void>;
}

/** `reading_balance()` → the three numbers the website uses (packs and plans are the app's). */
export function parseBalance(data: unknown): Balance {
  const row = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  const num = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0);
  return { freeNow: num(row.free_now), freeRemaining: num(row.free_remaining), emailNeeded: row.email_needed === true };
}

/** scan-palm's 200 body → the pipeline's LineScanOutcome, validated like the app does. */
export function parseScan(body: unknown, latencyMs: number): LineScanOutcome {
  const parsed = lineServiceResponseSchema.safeParse(dropMalformedFate(body));
  if (!parsed.success) throw new ReadingError('server', 'scan_bad_response');
  const response = parsed.data;
  return response.quality.ok && response.lines ? { status: 'ok', response, latencyMs } : { status: 'rejected', response, latencyMs };
}

/** extract-palm's 200 body → a VisionResult, validated with the app's own schema. */
export function parseExtraction(body: unknown): VisionResult {
  const data = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const payload = data.observation && typeof data.observation === 'object' ? data.observation : data.raw;
  if (payload === undefined || payload === null) throw new VisionError('malformed_output', 'cloudflare-workers-ai', 'no body');
  let normalised;
  try {
    normalised = normaliseVisionPayload(payload as string | object);
  } catch {
    throw new VisionError('malformed_output', 'cloudflare-workers-ai', 'not an observation');
  }
  const repairs = Array.isArray(data.repairs) ? data.repairs.filter((r): r is string => typeof r === 'string').map((r) => r.slice(0, 200)) : [];
  return {
    output: { ...normalised.output, warnings: [...normalised.output.warnings, ...repairs, ...normalised.repairs].slice(0, 20) },
    latencyMs: typeof data.latencyMs === 'number' ? data.latencyMs : 0,
    costUnits: typeof data.costUnits === 'number' ? data.costUnits : null,
  };
}

/** The app pipeline's vision seam, backed by extract-palm through this API. */
export function webVisionProvider(api: ReadingApi, sessionId: string): PalmVisionProvider {
  let model = 'unknown-until-first-call';
  return {
    id: 'cloudflare-workers-ai',
    version: '1.0.0',
    runsOnDevice: false,
    get model() {
      return model;
    },
    async extract(input) {
      if (!input.base64) throw new VisionError('unavailable', 'cloudflare-workers-ai', 'no photo');
      try {
        const result = await api.extract(sessionId, input.base64, input.scan);
        model = api.mode === 'mock' ? 'mock' : 'llama-4-scout-17b-16e-instruct';
        return result;
      } catch (caught) {
        // A server refusal keeps its name so the pipeline turns not_a_palm into the retake message.
        if (caught instanceof ReadingError && caught.code === 'not_a_palm') {
          throw visionErrorFromCode('not_a_palm', 'cloudflare-workers-ai', { refunded: caught.noCharge, reason: caught.reason });
        }
        throw caught;
      }
    },
  };
}

/** A new random idempotency key (one per photo, reused on every retry of that photo). */
export function newKey(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `k-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}
