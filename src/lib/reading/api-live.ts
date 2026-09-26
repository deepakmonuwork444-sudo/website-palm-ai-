/**
 * The live backend: the app's Supabase project, reached ONLY through the proxy
 * Worker (config.apiUrl = https://api.palmsays.com; never *.supabase.co, which
 * Indian ISPs block). supabase-js with the publishable key handles the guest
 * session (localStorage), email codes and RPCs; the Edge Functions are called
 * with plain fetch so their own error bodies ({ error, refunded, reason }) are
 * read, always with `apikey` + `Authorization: Bearer <user token>`.
 *
 * Loaded with import() only when a live reading starts, so supabase-js never
 * weighs on the first paint.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { HandSide } from './palm/features/observation/taxonomy';
import type { ReadingOutcome } from './palm/features/reading/pipeline';
import {
  parseBalance,
  parseExtraction,
  parseScan,
  type Balance,
  type CodeResult,
  type EventRow,
  type ReadingApi,
  type ScanHint,
  type VerifyResult,
  type WebSession,
  type WebUser,
} from './api';
import { ReadingError, errorFromFunction, errorFromRpc } from './errors';

/** Per request, as the app: a cold scanner answers inside 65 s, the reading inside 100 s. */
const SCAN_MS = 65_000;
const EXTRACT_MS = 100_000;
const GATE_MS = 20_000;

interface AuthErrorLike {
  message?: string | undefined;
  code?: string | undefined;
  status?: number | undefined;
}

function userOf(user: { id: string; email?: string | null; is_anonymous?: boolean } | null | undefined): WebUser | null {
  if (!user) return null;
  return { id: user.id, email: user.email || null, isGuest: user.is_anonymous === true };
}

/** Supabase Auth error → the sheet's outcome (never Supabase's raw text). */
export function codeResultOf(error: AuthErrorLike): CodeResult {
  const text = String(error.message ?? '').toLowerCase();
  const code = String(error.code ?? '');
  if (code === 'email_exists' || text.includes('already been registered') || text.includes('already registered')) return 'taken';
  if (code === 'otp_disabled' || code === 'email_provider_disabled' || code === 'signup_disabled' || text.includes('disabled')) return 'unavailable';
  if (code === 'user_not_found' || text.includes('signups not allowed')) return 'invalid';
  if (code.startsWith('over_') || text.includes('rate limit') || text.includes('security purposes') || error.status === 429) return 'wait';
  if (code === 'email_address_invalid' || text.includes('invalid')) return 'invalid';
  throw new ReadingError(/fetch|network/i.test(text) ? 'offline' : 'server', code || 'auth');
}

export function verifyResultOf(error: AuthErrorLike): VerifyResult {
  const text = String(error.message ?? '').toLowerCase();
  const code = String(error.code ?? '');
  if (code.startsWith('over_') || text.includes('rate limit') || error.status === 429) return 'wait';
  if (/fetch|network/.test(text)) throw new ReadingError('offline', 'verify');
  return 'wrong';
}

/**
 * POST with upload progress (XMLHttpRequest): the only honest way to know
 * when the photo has left the device, so "Sending securely" switches to
 * "Tracing your lines" at the real moment (plan §8.1, no fake stages).
 */
function postWithUpload(url: string, headers: Record<string, string>, body: string, timeoutMs: number, onUploaded: () => void): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    for (const [name, value] of Object.entries(headers)) xhr.setRequestHeader(name, value);
    xhr.timeout = timeoutMs;
    xhr.upload.onload = () => onUploaded();
    xhr.onload = () => {
      let json: unknown;
      try {
        json = xhr.responseText ? JSON.parse(xhr.responseText) : null;
      } catch {
        json = null;
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(json);
      else reject(errorFromFunction(xhr.status, json));
    };
    xhr.onerror = () => reject(new ReadingError('offline', 'scan: network'));
    xhr.ontimeout = () => reject(new ReadingError(navigator.onLine === false ? 'offline' : 'server', 'scan: timeout'));
    xhr.send(body);
  });
}

export function createLiveApi(options: { apiUrl: string; publishableKey: string; fetchImpl?: typeof fetch }): ReadingApi {
  const { apiUrl, publishableKey } = options;
  const doFetch = options.fetchImpl ?? ((input: RequestInfo | URL, init?: RequestInit) => fetch(input, init));
  const supabase: SupabaseClient = createClient(apiUrl, publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: 'palmsays-auth' },
    global: { fetch: doFetch },
  });

  async function accessToken(): Promise<string> {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new ReadingError('unauthenticated', 'no session');
    return token;
  }

  async function authHeaders(): Promise<Record<string, string>> {
    const token = await accessToken();
    return { 'content-type': 'application/json', apikey: publishableKey, authorization: `Bearer ${token}` };
  }

  async function callFunction(name: string, body: unknown, timeoutMs: number): Promise<unknown> {
    const token = await accessToken();
    let response: Response;
    try {
      response = await doFetch(`${apiUrl}/functions/v1/${name}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', apikey: publishableKey, authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (caught) {
      const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
      const timedOut = caught instanceof DOMException && (caught.name === 'TimeoutError' || caught.name === 'AbortError');
      // A deadline with the network up is the server being slow: "try again", never "you're offline".
      throw new ReadingError(offline || !timedOut ? 'offline' : 'server', `${name}: ${timedOut ? 'timeout' : 'network'}`);
    }
    const json = await response.json().catch(() => null);
    if (!response.ok) throw errorFromFunction(response.status, json);
    return json;
  }

  async function rpc<T>(name: string, args?: Record<string, unknown>): Promise<T> {
    const { data, error } = await supabase.rpc(name, args);
    if (error) throw errorFromRpc(error);
    return data as T;
  }

  return {
    mode: 'live',

    async currentUser() {
      const { data } = await supabase.auth.getSession();
      return userOf(data.session?.user);
    },

    async ensureGuest() {
      const { data } = await supabase.auth.getSession();
      const existing = userOf(data.session?.user);
      if (existing) return existing;
      const { data: signedIn, error } = await supabase.auth.signInAnonymously();
      if (error || !signedIn.user) {
        const status = (error as AuthErrorLike | null)?.status;
        if (status === 429) throw new ReadingError('rate_limited', 'anonymous sign-in');
        throw new ReadingError(/fetch|network/i.test(error?.message ?? '') ? 'offline' : 'server', 'anonymous sign-in');
      }
      return userOf(signedIn.user)!;
    },

    async balance(): Promise<Balance> {
      return parseBalance(await rpc('reading_balance'));
    },

    async webGate(token) {
      await callFunction('web-gate', { token }, GATE_MS);
    },

    async startWebReading(handSide: HandSide, isDominant: boolean, idempotencyKey: string): Promise<WebSession> {
      const row = await rpc<{ id?: string; charged_as?: string | null } | null>('start_web_reading', {
        p_hand_side: handSide,
        p_is_dominant: isDominant,
        p_idempotency_key: idempotencyKey,
      });
      if (!row?.id) throw new ReadingError('server', 'no session');
      return { id: row.id, chargedAs: row.charged_as ?? null };
    },

    async scan(sessionId, imageBase64, handSide, onUploaded) {
      const started = Date.now();
      const body =
        typeof XMLHttpRequest === 'undefined' || !onUploaded
          ? await callFunction('scan-palm', { sessionId, imageBase64, handSide }, SCAN_MS)
          : await postWithUpload(`${apiUrl}/functions/v1/scan-palm`, await authHeaders(), JSON.stringify({ sessionId, imageBase64, handSide }), SCAN_MS, onUploaded);
      return parseScan(body, Date.now() - started);
    },

    async extract(sessionId: string, imageBase64: string, hint: ScanHint | undefined) {
      const body = await callFunction('extract-palm', { sessionId, imageBase64, ...(hint ? { scan: hint } : {}) }, EXTRACT_MS);
      return parseExtraction(body);
    },

    async complete(sessionId: string, outcome: ReadingOutcome): Promise<WebSession> {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user.id;
      if (!userId) throw new ReadingError('unauthenticated', 'complete');
      const matchedRuleIds = outcome.report.sections.flatMap((s) => s.evidence.map((e) => e.ruleId));
      // A retry finds its rows already there (unique per session): not a failure.
      const observation = await supabase.from('palm_observations').insert({
        session_id: sessionId,
        user_id: userId,
        schema_version: outcome.observation.schemaVersion,
        payload: outcome.observation,
        extractor_provider: outcome.observation.extractor.provider,
        extractor_model: outcome.observation.extractor.model,
        extractor_version: outcome.observation.extractor.version,
        latency_ms: outcome.observation.extractor.latencyMs,
        cost_units: outcome.observation.extractor.costUnits,
      });
      if (observation.error && observation.error.code !== '23505') throw errorFromRpc(observation.error);
      const report = await supabase.from('reading_reports').insert({
        session_id: sessionId,
        user_id: userId,
        payload: outcome.report,
        provisional: outcome.report.provisional,
        matched_rule_ids: matchedRuleIds,
      });
      if (report.error && report.error.code !== '23505') throw errorFromRpc(report.error);
      const row = await rpc<{ id?: string; charged_as?: string | null } | null>('complete_reading', { p_session_id: sessionId });
      return { id: row?.id ?? sessionId, chargedAs: row?.charged_as ?? null };
    },

    async fail(sessionId, kind) {
      try {
        await supabase.rpc('fail_reading', { p_session_id: sessionId, p_failure_kind: kind.slice(0, 60) });
      } catch {
        // Bookkeeping only: the visitor already sees the real error.
      }
    },

    async sendEmailCode(email) {
      const { error } = await supabase.auth.updateUser({ email });
      return error ? codeResultOf(error) : 'sent';
    },

    async sendSignInCode(email) {
      const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
      return error ? codeResultOf(error) : 'sent';
    },

    async verifyCode(email, code, kind) {
      const { error } = await supabase.auth.verifyOtp({ email, token: code, type: kind });
      return error ? verifyResultOf(error) : 'ok';
    },

    async logEvents(rows: EventRow[], keepalive = false) {
      if (rows.length === 0) return;
      try {
        // Anonymous counts: the publishable key only, no user token, no cookie.
        await doFetch(`${apiUrl}/rest/v1/rpc/log_event_counts`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', apikey: publishableKey },
          body: JSON.stringify({ p_rows: rows }),
          keepalive,
        });
      } catch {
        // Counting must never break the reading.
      }
    },
  };
}
