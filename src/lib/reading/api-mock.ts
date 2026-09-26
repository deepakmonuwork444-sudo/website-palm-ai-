/**
 * Mock backend for previews and screenshots (ARCHITECTURE.md §9
 * PUBLIC_READING_MODE=mock, plan §12.10). Nothing leaves the browser.
 *
 * It answers like the real server — including the free rule (1 as a guest,
 * 1 more after the email code, then 0), refusals and refunds — with a STORED
 * REAL scanner result: the app's palm4_v2 scan of its stock guide photo
 * (2026-09-20 retest record), so the app's own pipeline runs end to end. The
 * lines belong to that photo, not the visitor's: the report says "Preview".
 *
 * `?mockError=<code>` makes the next reading step fail once with that server
 * code (e.g. not_a_palm, daily_capacity_reached, scanner_unavailable, offline),
 * to preview every error screen. Email codes: any address; code 123456 works;
 * an address containing "taken" answers "already has an account".
 */

import type { HandSide } from './palm/features/observation/taxonomy';
import type { LineServiceResponse } from './palm/features/lines/types';
import type { VisionOutput } from './palm/features/observation/schema';
import scanJson from './mock/scan-response.json';
import visionJson from './mock/vision-output.json';
import type { Balance, CodeResult, EventRow, ReadingApi, VerifyResult, WebSession, WebUser } from './api';
import { ReadingError, errorFromFunction, type ReadingErrorCode } from './errors';

export const MOCK_CODE = '123456';
const STEP_MS = { gate: 500, start: 300, scan: 1600, extract: 1800, complete: 300 };

export interface MockOptions {
  /** Injected wait (tests pass an instant one). */
  sleep?: (ms: number) => Promise<void>;
  /** Fail the next step once with this server code. */
  failOnce?: string | null;
  /** Which step fails (default: the first one the code belongs to). */
  failAt?: 'gate' | 'start' | 'scan' | 'extract' | 'complete';
}

const STEP_OF: Partial<Record<ReadingErrorCode, NonNullable<MockOptions['failAt']>>> = {
  turnstile: 'gate',
  web_pass_required: 'start',
  daily_capacity_reached: 'start',
  service_paused: 'start',
  needs_email_verification: 'start',
  no_readings_left: 'start',
  too_many_attempts: 'start',
  rate_limited: 'start',
  scanner_unavailable: 'scan',
  image_too_large: 'scan',
  not_a_palm: 'extract',
  invalid_session: 'extract',
  offline: 'extract',
  server: 'complete',
};

export function createMockApi(options: MockOptions = {}): ReadingApi & { state: () => Record<string, unknown> } {
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  let failure = options.failOnce ?? null;
  let failAt = options.failAt ?? (failure ? (STEP_OF[failure as ReadingErrorCode] ?? 'extract') : null);
  let user: WebUser | null = null;
  let verified = false;
  let used = 0;
  let passUntil = 0;
  let pendingEmail: string | null = null;
  /** The last photos "sent" (QA: the preview checks they carry no EXIF). */
  const images: { scan: string | null; extract: string | null } = { scan: null, extract: null };
  const sessions = new Map<string, { id: string; key: string; charged: string | null; completed: boolean }>();

  function maybeFail(step: NonNullable<MockOptions['failAt']>) {
    if (!failure || failAt !== step) return;
    const code = failure;
    failure = null;
    failAt = null;
    if (code === 'offline') throw new ReadingError('offline', 'mock');
    // The server's own names (web-gate answers turnstile_failed).
    if (code === 'turnstile') throw errorFromFunction(403, { error: 'turnstile_failed' });
    throw errorFromFunction(code === 'not_a_palm' ? 422 : 409, { error: code, refunded: true, reason: code === 'not_a_palm' ? 'no_palm' : undefined });
  }

  function balance(): Balance {
    if (!verified) {
      return { freeNow: used < 1 ? 1 : 0, freeRemaining: Math.max(0, 2 - used), emailNeeded: used >= 1 };
    }
    const left = Math.max(0, 2 - used);
    return { freeNow: left, freeRemaining: left, emailNeeded: false };
  }

  return {
    mode: 'mock',
    state: () => ({ user, verified, used, sessions: sessions.size, images: { ...images } }),

    async currentUser() {
      return user;
    },

    async ensureGuest() {
      if (!user) user = { id: `mock-user-${Date.now().toString(36)}`, email: null, isGuest: true };
      return user;
    },

    async balance() {
      return balance();
    },

    async webGate(token: string) {
      await sleep(STEP_MS.gate);
      maybeFail('gate');
      if (!token) throw new ReadingError('turnstile', 'no token');
      passUntil = Date.now() + 10 * 60_000;
    },

    async startWebReading(_handSide: HandSide, _isDominant: boolean, key: string): Promise<WebSession> {
      await sleep(STEP_MS.start);
      if (!user) throw new ReadingError('unauthenticated');
      const existing = [...sessions.values()].find((s) => s.key === key);
      if (existing) return { id: existing.id, chargedAs: existing.charged };
      if (Date.now() > passUntil) throw new ReadingError('web_pass_required');
      maybeFail('start');
      const b = balance();
      if (b.freeNow <= 0) throw new ReadingError(b.emailNeeded ? 'needs_email_verification' : 'no_readings_left');
      const session = { id: `mock-session-${sessions.size + 1}-${Date.now().toString(36)}`, key, charged: null, completed: false };
      sessions.set(session.id, session);
      return { id: session.id, chargedAs: null };
    },

    async scan(sessionId: string, image: string, _hand: HandSide, onUploaded?: () => void) {
      images.scan = image;
      await sleep(STEP_MS.scan / 4);
      onUploaded?.();
      await sleep((STEP_MS.scan * 3) / 4);
      if (!sessions.has(sessionId)) throw new ReadingError('invalid_session');
      maybeFail('scan');
      return { status: 'ok', response: structuredClone(scanJson) as unknown as LineServiceResponse, latencyMs: STEP_MS.scan };
    },

    async extract(sessionId: string, image: string) {
      images.extract = image;
      await sleep(STEP_MS.extract);
      const session = sessions.get(sessionId);
      if (!session) throw new ReadingError('invalid_session');
      maybeFail('extract');
      if (!session.charged) {
        session.charged = verified ? 'free_email' : 'free_guest';
        used += 1;
      }
      return { output: structuredClone(visionJson) as unknown as VisionOutput, latencyMs: STEP_MS.extract, costUnits: null };
    },

    async complete(sessionId: string): Promise<WebSession> {
      await sleep(STEP_MS.complete);
      const session = sessions.get(sessionId);
      if (!session) throw new ReadingError('invalid_session');
      maybeFail('complete');
      session.completed = true;
      return { id: session.id, chargedAs: session.charged };
    },

    async fail() {},

    async sendEmailCode(email: string): Promise<CodeResult> {
      await sleep(STEP_MS.start);
      if (/taken/i.test(email)) return 'taken';
      pendingEmail = email;
      return 'sent';
    },

    async sendSignInCode(email: string): Promise<CodeResult> {
      await sleep(STEP_MS.start);
      pendingEmail = email;
      return 'sent';
    },

    async verifyCode(email: string, code: string): Promise<VerifyResult> {
      await sleep(STEP_MS.start);
      if (code !== MOCK_CODE || email !== pendingEmail) return 'wrong';
      verified = true;
      user = { id: user?.id ?? 'mock-user', email, isGuest: false };
      return 'ok';
    },

    async logEvents(_rows: EventRow[]) {},
  };
}
