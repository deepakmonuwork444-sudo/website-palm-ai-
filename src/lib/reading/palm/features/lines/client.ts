// COPIED from palm-ai-new--feat-m1-foundation/src/features/lines/client.ts at app commit fbc2232d837f (2026-09-30).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import type { HandSide } from '../observation/taxonomy';

import { lineServiceResponseSchema, serviceLineSchema, type LineScanOutcome, type LineServiceResponse } from './types';

/**
 * Client for the palm line scanner (services/palm-lines, hosted on Modal).
 *
 * Every real build reaches it only through our scan-palm Edge Function, with
 * the signed-in user's token and the reading session the scan belongs to. The
 * scanner key and Modal's proxy token stay on the server: nothing about the
 * scanner ships in the app (security audit 2026-09-22, H-3).
 *
 * Plain `fetch`, no native modules, so it works in Expo Go and is unit-tested
 * in Node. The caller sends the SAME downscaled JPEG it keeps for the report,
 * so the scanner's coordinates are coordinates on the photo the overlay shows.
 */

/**
 * Whole-scan budget. A sleeping free Space takes 30-60 s to wake; a laptop on
 * the same Wi-Fi answers in a few seconds. 100 s covers a cold start plus one
 * retry, and is still short enough that the user is told something honest.
 */
export const LINE_SERVICE_TIMEOUT_MS = 100_000;
/** One request may take this long (a cold start answers inside it). */
export const LINE_SERVICE_ATTEMPT_MS = 65_000;
/** After this long the analysing screen says the scanner is still starting. */
export const LINE_SERVICE_SLOW_MS = 5_000;
/** How long to wait before asking a Space that answered 502/503/504 again. */
const RETRY_DELAY_MS = 4_000;
/** A dropped connection or a request that timed out is tried again ONCE, after this pause. */
const TRANSPORT_RETRY_DELAY_MS = 2_000;
/** Not worth a transport retry with less than this left of the budget. */
const MIN_RETRY_WINDOW_MS = 10_000;
/**
 * How long the quick "can we reach the scanner at all" check may take. An
 * unreachable host (other Wi-Fi, a firewall, the laptop asleep) never answers,
 * so without it the photo upload hangs for the whole budget and a retry.
 * 15 s: the hosted scanner (Modal) takes ~7 s to wake from idle (2026-09-21).
 */
export const LINE_SERVICE_PROBE_MS = 15_000;

export type LineServiceErrorKind =
  | 'not_configured'
  | 'unauthorized'
  | 'bad_request'
  | 'timeout'
  | 'network'
  | 'server'
  | 'bad_response'
  /** Paused by the owner, today's scanner ceiling reached, or this session scanned too often. */
  | 'busy';

export class LineServiceError extends Error {
  constructor(
    readonly kind: LineServiceErrorKind,
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'LineServiceError';
  }
}

/** Failures that are ours to fix (config, the Space itself), not the user's connection. */
export const LINE_SERVICE_OUR_FAULT: ReadonlySet<LineServiceErrorKind> = new Set([
  'not_configured',
  'unauthorized',
  'bad_request',
  'server',
  'bad_response',
]);

/** The key a laptop scanner is started with (scripts/start-dev.cmd). Deliberately not a secret. */
export const DEV_SCANNER_KEY = 'dev';

/**
 * Where the scanner is and how to reach it.
 * - `edge` (every real build): the scan-palm Edge Function, called with the
 *   public anon key and the signed-in user's token. No scanner key.
 * - `dev` (__DEV__ builds only, e.g. Expo Go): a scanner on the laptop, with
 *   the fixed local key above. Release builds never use this mode.
 */
export type LineServiceConfig =
  | { mode: 'edge'; url: string; anonKey: string }
  | { mode: 'dev'; url: string; key: typeof DEV_SCANNER_KEY };

export interface LineServiceEnv {
  supabaseUrl?: string | undefined;
  anonKey?: string | undefined;
  /** Slug of the scan-palm Edge Function. Empty = the scanner is off in this build. */
  scanFunction?: string | undefined;
  /** A laptop scanner, honoured only when `dev` is true. */
  devUrl?: string | undefined;
  /** True only in a __DEV__ build. */
  dev?: boolean | undefined;
}

/** This machine or the home network: the only hosts plain http is accepted for, and only in __DEV__. */
function isLocalHost(url: string): boolean {
  const host = url.replace(/^https?:\/\//, '').split(/[/:?#]/)[0]?.toLowerCase() ?? '';
  return (
    host === 'localhost' ||
    host.endsWith('.local') ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host)
  );
}

/** The URL without a trailing slash if it is https (or local http when allowed), else null. */
function acceptedUrl(raw: string | undefined, allowLocalHttp: boolean): string | null {
  const url = raw?.trim().replace(/\/+$/, '');
  // No user@host forms: they make the real host hard to read.
  if (!url || url.includes('@')) return null;
  if (/^https:\/\/[^\s/]+/.test(url)) return url;
  return allowLocalHttp && /^http:\/\/[^\s/]+/.test(url) && isLocalHost(url) ? url : null;
}

/**
 * Reads the config. `process.env.EXPO_PUBLIC_*` must be written out literally:
 * Expo inlines those member expressions at build time and nothing else. None
 * of them is a secret.
 */
export function lineServiceConfig(
  env: LineServiceEnv = {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    scanFunction: process.env.EXPO_PUBLIC_SCAN_FUNCTION,
    devUrl: process.env.EXPO_PUBLIC_PALM_LINES_DEV_URL,
    dev: typeof __DEV__ !== 'undefined' && __DEV__,
  },
): LineServiceConfig | null {
  const dev = env.dev === true;
  const devUrl = dev ? acceptedUrl(env.devUrl, true) : null;
  if (devUrl) return { mode: 'dev', url: devUrl, key: DEV_SCANNER_KEY };

  const base = acceptedUrl(env.supabaseUrl, dev);
  const anonKey = env.anonKey?.trim();
  const slug = env.scanFunction?.trim();
  if (!base || !anonKey || !slug || !/^[a-z0-9][a-z0-9_-]{0,62}$/.test(slug)) return null;
  return { mode: 'edge', url: `${base}/functions/v1/${slug}`, anonKey };
}

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

/** The signed-in user's access token (edge mode); null when nobody is signed in. */
export type AccessTokenGetter = () => Promise<string | null | undefined>;

export interface AnalyseLinesInput {
  imageBase64: string;
  handSide: HandSide;
  config: LineServiceConfig;
  /** Edge mode: the open reading session this scan belongs to (scan-palm refuses a scan without one). */
  sessionId?: string | null;
  /** Edge mode: the signed-in user's token. */
  getAccessToken?: AccessTokenGetter;
  fetchImpl?: FetchLike;
  /** Whole-scan budget, all attempts included. */
  timeoutMs?: number;
  /** Budget of one request. */
  attemptTimeoutMs?: number;
  slowAfterMs?: number;
  /** Called once if the scan is still running after `slowAfterMs`. */
  onSlow?: () => void;
  /** Injectable for tests. */
  sleep?: (ms: number) => Promise<void>;
}

/** scan-palm refusals that mean "not now": paused by the owner, today's ceiling, or this session scanned 3 times. */
const BUSY_CODES: ReadonlySet<string> = new Set(['service_paused', 'daily_capacity_reached', 'too_many_attempts']);
/** Answers that asking again cannot change (scan-palm already waited for the scanner, or a secret is missing). */
const FINAL_CODES: ReadonlySet<string> = new Set([...BUSY_CODES, 'scanner_unavailable', 'server_not_configured', 'scanner_not_configured']);

function errorCode(body: unknown): unknown {
  return typeof body === 'object' && body !== null ? (body as { error?: unknown }).error : undefined;
}

/** HTTP status + body -> our error vocabulary. Exported for tests. */
export function toLineServiceError(status: number, body: unknown): LineServiceError {
  const code = errorCode(body);
  const text = typeof code === 'string' ? code : `http_${status}`;
  if (typeof code === 'string' && BUSY_CODES.has(code)) return new LineServiceError('busy', text, status);
  // scan-palm could not get an answer from the scanner in time: a sleeping or overloaded server.
  if (code === 'scanner_unavailable') return new LineServiceError('server', text, status);
  if (status === 401 || status === 403) return new LineServiceError('unauthorized', text, status);
  if (status === 503 && (code === 'server_not_configured' || code === 'scanner_not_configured')) {
    return new LineServiceError('not_configured', text, status);
  }
  if (status === 400 || status === 408 || status === 409 || status === 413 || status === 422) {
    return new LineServiceError('bad_request', text, status);
  }
  return new LineServiceError('server', text, status);
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Statuses a waking or restarting server answers with; worth asking again. */
function isWaking(status: number, body: unknown): boolean {
  const code = errorCode(body);
  if (typeof code === 'string' && FINAL_CODES.has(code)) return false;
  return status === 502 || status === 503 || status === 504;
}

/** The request for this config: the scan-palm function with the user's token, or (dev) a laptop scanner. */
async function scanTarget(
  config: LineServiceConfig,
  getAccessToken: AccessTokenGetter | undefined,
  path: '/v1/analyse' | '/health',
): Promise<{ url: string; headers: Record<string, string> }> {
  if (config.mode === 'dev') return { url: `${config.url}${path}`, headers: { 'x-api-key': config.key } };
  const token = await getAccessToken?.().catch(() => null);
  // Never sent without a user: scan-palm would only refuse it.
  if (!token) throw new LineServiceError('unauthorized', 'not_signed_in');
  return { url: config.url, headers: { apikey: config.anonKey, authorization: `Bearer ${token}` } };
}

export async function analyseLines(input: AnalyseLinesInput): Promise<LineServiceResponse> {
  const fetchImpl = input.fetchImpl ?? ((url, init) => fetch(url, init));
  const sleep = input.sleep ?? wait;
  const timeoutMs = input.timeoutMs ?? LINE_SERVICE_TIMEOUT_MS;
  const attemptMs = Math.min(input.attemptTimeoutMs ?? LINE_SERVICE_ATTEMPT_MS, timeoutMs);
  const deadline = Date.now() + timeoutMs;
  const slowTimer = input.onSlow ? setTimeout(input.onSlow, input.slowAfterMs ?? LINE_SERVICE_SLOW_MS) : null;
  // The scanner's own request body; scan-palm also needs the session it belongs to.
  const payload = { imageBase64: input.imageBase64, handSide: input.handSide };
  const body = JSON.stringify(input.config.mode === 'edge' ? { sessionId: input.sessionId, ...payload } : payload);
  const timedOut = () => new LineServiceError('timeout', 'No answer before the deadline.');
  /** Dropped connections / timed-out requests retried so far (at most one). */
  let transportRetries = 0;

  try {
    for (;;) {
      const remaining = deadline - Date.now();
      if (remaining <= 0) throw timedOut();
      // Per request: the stored token may have been refreshed since the last one.
      const target = await scanTarget(input.config, input.getAccessToken, '/v1/analyse');
      // A fresh controller per request: an aborted signal cannot be reused.
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), Math.min(attemptMs, remaining));
      let response: Response;
      let text: string;
      try {
        try {
          response = await fetchImpl(target.url, {
            method: 'POST',
            headers: { 'content-type': 'application/json', ...target.headers },
            body,
            signal: controller.signal,
          });
          text = await response.text();
        } catch (caught) {
          const error = controller.signal.aborted
            ? timedOut()
            : new LineServiceError('network', caught instanceof Error ? caught.message : 'Could not reach the line scanner.');
          // One automatic retry: Wi-Fi hiccups and a Space that dropped the
          // first request while booting are common and cheap to ride out.
          if (transportRetries < 1 && deadline - Date.now() > MIN_RETRY_WINDOW_MS) {
            transportRetries += 1;
            await sleep(TRANSPORT_RETRY_DELAY_MS);
            continue;
          }
          throw error;
        }
      } finally {
        clearTimeout(timer);
      }

      let parsed: unknown = null;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        parsed = null;
      }

      if (!response.ok) {
        if (isWaking(response.status, parsed) && Date.now() + RETRY_DELAY_MS < deadline) {
          await sleep(RETRY_DELAY_MS);
          continue;
        }
        throw toLineServiceError(response.status, parsed);
      }

      const result = lineServiceResponseSchema.safeParse(dropMalformedFate(parsed));
      if (!result.success) {
        throw new LineServiceError('bad_response', `Unexpected response: ${result.error.issues[0]?.path.join('.') ?? 'body'}`);
      }
      return result.data;
    }
  } finally {
    if (slowTimer) clearTimeout(slowTimer);
  }
}

/**
 * `lines.fate` is additive (palm4 scanner only). A fate entry this app cannot
 * read is dropped, so the reading falls back to the AI's description of fate
 * instead of losing the whole scan.
 */
export function dropMalformedFate(body: unknown): unknown {
  if (!body || typeof body !== 'object') return body;
  const lines = (body as { lines?: unknown }).lines;
  if (!lines || typeof lines !== 'object' || !('fate' in lines)) return body;
  const { fate, ...rest } = lines as Record<string, unknown>;
  if (fate === undefined || serviceLineSchema.safeParse(fate).success) return body;
  return { ...(body as object), lines: rest };
}

/**
 * The side the scanner actually analysed. A service build may answer with an
 * additive `sideCorrected` field: the side it read instead ('left'/'right'),
 * or `true` for "the other side". Absent or false means the side sent.
 */
export function analysedSide(response: LineServiceResponse, sent: HandSide): HandSide {
  const corrected = response.sideCorrected;
  if (corrected === 'left' || corrected === 'right') return corrected;
  if (corrected === true) return sent === 'left' ? 'right' : 'left';
  return sent;
}

/** True when the scanner refused the photo as the back of the hand, or as the other hand. */
export function isWrongSideRejection(scan: LineScanOutcome): boolean {
  return scan.status === 'rejected' && scan.response.hand !== null && scan.response.quality.reasons.some((r) => r.code === 'back_of_hand');
}

/**
 * True when the scanner answers at all (any HTTP status) within `ms`. A waking
 * server still answers, so this only fails fast on a host that cannot be
 * reached. Dev: GET /health on the laptop. Edge: scan-palm's warm-up call
 * (throttled per account on the server), which also wakes the scanner; never
 * sent without a signed-in user.
 */
export async function scannerReachable(
  config: LineServiceConfig,
  ms: number,
  fetchImpl?: FetchLike,
  getAccessToken?: AccessTokenGetter,
): Promise<boolean> {
  const doFetch = fetchImpl ?? ((url: string, init?: RequestInit) => fetch(url, init));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const target = await scanTarget(config, getAccessToken, '/health');
    await doFetch(
      target.url,
      config.mode === 'dev'
        ? { method: 'GET', signal: controller.signal }
        : {
            method: 'POST',
            headers: { 'content-type': 'application/json', ...target.headers },
            body: JSON.stringify({ warm: true }),
            signal: controller.signal,
          },
    );
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Wakes a sleeping scanner while the user frames the photo, so the scan itself
 * does not pay the start-up. Fire-and-forget: never throws, nothing waits on it.
 * Edge mode needs a signed-in user; without one (a first reading, before the
 * guest sign-in) nothing is sent.
 */
export function warmScanner(getAccessToken?: AccessTokenGetter, config: LineServiceConfig | null = lineServiceConfig()): void {
  if (config) void scannerReachable(config, LINE_SERVICE_PROBE_MS, undefined, getAccessToken);
}

/**
 * The scan for one reading, as the pipeline needs it. Never throws: anything
 * that stops the scan becomes `unavailable`, and a failed quality gate becomes
 * `rejected`. Only `reason: 'not_configured'` (no scan function in this build)
 * lets the reading continue without the scanner; every other `unavailable`
 * stops the reading before the AI is asked (pipeline `assertScanAccepted`).
 */
export async function scanForReading(
  input: Omit<AnalyseLinesInput, 'config' | 'imageBase64'> & {
    config: LineServiceConfig | null;
    imageBase64: string | null;
    onError?: (error: LineServiceError) => void;
    /**
     * Dev mode: first check the laptop scanner answers /health within this
     * many ms. Edge mode skips it: the session was just opened on the same
     * server, so it is reachable.
     */
    probeMs?: number;
  },
): Promise<LineScanOutcome> {
  if (!input.config) return { status: 'unavailable', reason: 'not_configured' };
  if (!input.imageBase64) return { status: 'unavailable', reason: 'no_photo' };
  if (input.config.mode === 'edge' && !input.sessionId) {
    input.onError?.(new LineServiceError('bad_request', 'no_session'));
    return { status: 'unavailable', reason: 'no_session' };
  }
  if (
    input.config.mode === 'dev' &&
    input.probeMs !== undefined &&
    !(await scannerReachable(input.config, input.probeMs, input.fetchImpl))
  ) {
    const error = new LineServiceError('network', 'The line scanner could not be reached.');
    input.onError?.(error);
    return { status: 'unavailable', reason: 'network' };
  }
  const started = Date.now();
  try {
    const response = await analyseLines({ ...input, config: input.config, imageBase64: input.imageBase64 });
    const latencyMs = Date.now() - started;
    return response.quality.ok && response.lines
      ? { status: 'ok', response, latencyMs }
      : { status: 'rejected', response, latencyMs };
  } catch (caught) {
    const error =
      caught instanceof LineServiceError ? caught : new LineServiceError('bad_response', String((caught as Error)?.message ?? caught));
    input.onError?.(error);
    // The Space answering "server_not_configured" is a broken deployment, not
    // a build without a scanner: it must not unlock the no-scanner fallback.
    return { status: 'unavailable', reason: error.kind === 'not_configured' ? 'server_not_configured' : error.kind };
  }
}
