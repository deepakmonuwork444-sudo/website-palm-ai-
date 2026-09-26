/**
 * The backend's error vocabulary → what the reading screen does
 * (ARCHITECTURE.md §11 F6, plan §8.3). The codes are the ones the app repo's
 * functions and RPCs really answer (extract-palm, scan-palm, web-gate,
 * start_web_reading / claim_extraction exceptions); the same code can come
 * with different HTTP statuses (extract-palm answers daily_capacity_reached
 * with 503, scan-palm with 429), so the name decides, never the status.
 */

export type ReadingErrorCode =
  | 'no_readings_left'
  | 'needs_email_verification'
  | 'invalid_session'
  | 'image_too_large'
  | 'not_a_palm'
  | 'daily_capacity_reached'
  | 'too_many_attempts'
  | 'rate_limited'
  | 'scanner_unavailable'
  | 'service_paused'
  | 'offline'
  | 'turnstile'
  | 'web_pass_required'
  | 'unauthenticated'
  | 'not_configured'
  | 'heic'
  | 'decode'
  | 'server';

export class ReadingError extends Error {
  readonly code: ReadingErrorCode;
  /** The server gave the reading back, or never charged it. */
  readonly noCharge: boolean;
  /** For not_a_palm: which check failed (back_of_hand, no_palm, no_main_lines, unclear_lines). */
  readonly reason: string | null;

  constructor(code: ReadingErrorCode, detail = '', extra: { noCharge?: boolean; reason?: string | null } = {}) {
    super(detail ? `${code}: ${detail}` : code);
    this.name = 'ReadingError';
    this.code = code;
    this.noCharge = extra.noCharge ?? true;
    this.reason = extra.reason ?? null;
  }
}

/** Server codes (function JSON `error`, or a Postgres exception name) → our code. */
const SERVER_CODES: Record<string, ReadingErrorCode> = {
  no_readings_left: 'no_readings_left',
  reading_quota_exhausted: 'no_readings_left',
  needs_email_verification: 'needs_email_verification',
  invalid_session: 'invalid_session',
  session_not_found: 'invalid_session',
  session_not_in_progress: 'invalid_session',
  session_expired: 'invalid_session',
  image_too_large: 'image_too_large',
  body_too_large: 'image_too_large',
  not_a_palm: 'not_a_palm',
  daily_capacity_reached: 'daily_capacity_reached',
  // The AI provider's own daily budget (extract-palm, refunded): same honest message.
  quota_exhausted: 'daily_capacity_reached',
  too_many_attempts: 'too_many_attempts',
  extraction_already_claimed: 'too_many_attempts',
  daily_limit: 'too_many_attempts',
  rate_limited: 'rate_limited',
  scanner_unavailable: 'scanner_unavailable',
  service_paused: 'service_paused',
  web_pass_required: 'web_pass_required',
  turnstile_failed: 'turnstile',
  turnstile_unreachable: 'turnstile',
  origin_not_allowed: 'not_configured',
  not_configured: 'not_configured',
  scanner_not_configured: 'not_configured',
  provider_not_configured: 'not_configured',
  unauthenticated: 'unauthenticated',
  not_authenticated: 'unauthenticated',
  body_timeout: 'offline',
};

/** The first known code inside a Postgres message ("no_readings_left" or "ERROR: no_readings_left ..."). */
export function codeFromMessage(message: string | null | undefined): ReadingErrorCode | null {
  const text = String(message ?? '');
  for (const [name, code] of Object.entries(SERVER_CODES)) {
    if (new RegExp(`\\b${name}\\b`).test(text)) return code;
  }
  return null;
}

/** A function's `{ error, refunded, reason }` body + HTTP status → a ReadingError. */
export function errorFromFunction(status: number, body: unknown): ReadingError {
  const b = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const name = typeof b.error === 'string' ? b.error : '';
  const reason = typeof b.reason === 'string' ? b.reason.slice(0, 40) : null;
  const refunded = b.refunded === true;
  const code = SERVER_CODES[name] ?? (status === 401 ? 'unauthenticated' : status === 413 ? 'image_too_large' : 'server');
  // Refused before any charge, or given back: only a charged-and-kept failure is not "noCharge".
  const noCharge = refunded || code !== 'server' || status < 500;
  return new ReadingError(code, name || `http_${status}`, { noCharge, reason });
}

/** An RPC error (supabase-js `{ message, code }`) → a ReadingError. */
export function errorFromRpc(error: { message?: string | null; code?: string | null } | null | undefined): ReadingError {
  const code = codeFromMessage(error?.message) ?? (isNetworkMessage(error?.message) ? 'offline' : 'server');
  return new ReadingError(code, String(error?.code ?? ''));
}

function isNetworkMessage(message: string | null | undefined): boolean {
  return /failed to fetch|networkerror|network request failed|load failed|fetch failed|timed? ?out|aborted/i.test(String(message ?? ''));
}

/** Anything thrown → a ReadingError (a dropped connection becomes `offline`). */
export function toReadingError(caught: unknown): ReadingError {
  if (caught instanceof ReadingError) return caught;
  const message = caught instanceof Error ? `${caught.name} ${caught.message}` : String(caught);
  if (isNetworkMessage(message)) return new ReadingError('offline', message.slice(0, 80));
  return new ReadingError('server', message.slice(0, 80), { noCharge: false });
}

/** How the flow reacts to each code (plan §8.3). */
export type ErrorPlan =
  | { kind: 'zero' }
  | { kind: 'signup' }
  | { kind: 'retake' }
  | { kind: 'retry'; auto?: 'restart-session' | 'shrink' | 'regate' | 'resign-in' | 'when-online' }
  | { kind: 'stop' };

export function planFor(code: ReadingErrorCode): ErrorPlan {
  switch (code) {
    case 'no_readings_left':
      return { kind: 'zero' };
    case 'needs_email_verification':
      return { kind: 'signup' };
    case 'not_a_palm':
    case 'heic':
    case 'decode':
      return { kind: 'retake' };
    case 'invalid_session':
      return { kind: 'retry', auto: 'restart-session' };
    case 'image_too_large':
      return { kind: 'retry', auto: 'shrink' };
    case 'web_pass_required':
      return { kind: 'retry', auto: 'regate' };
    case 'unauthenticated':
      return { kind: 'retry', auto: 'resign-in' };
    case 'offline':
      return { kind: 'retry', auto: 'when-online' };
    case 'turnstile':
    case 'scanner_unavailable':
    case 'rate_limited':
    case 'too_many_attempts':
    case 'server':
      return { kind: 'retry' };
    case 'daily_capacity_reached':
    case 'service_paused':
    case 'not_configured':
      return { kind: 'stop' };
  }
}
