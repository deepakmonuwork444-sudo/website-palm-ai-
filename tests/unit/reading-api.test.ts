import { describe, expect, it } from 'vitest';

import scanResponse from '../../src/lib/reading/mock/scan-response.json';
import visionOutput from '../../src/lib/reading/mock/vision-output.json';
import { parseBalance, parseExtraction, parseScan } from '../../src/lib/reading/api';
import { codeResultOf, createLiveApi, verifyResultOf } from '../../src/lib/reading/api-live';
import { acceptPublishableKey, missingForLive, resolveApiUrl, resolveReadingMode } from '../../src/lib/reading/config';
import { ReadingError, codeFromMessage, errorFromFunction, errorFromRpc, planFor, type ReadingErrorCode } from '../../src/lib/reading/errors';
import { ERROR_COPY } from '../../src/lib/reading/copy';

/**
 * The backend contract (ARCHITECTURE.md §11 F6) as the website reads it:
 * every server code → the right screen, only the proxy URL, the right headers.
 */

describe('server error codes → what the screen does (F6, plan §8.3)', () => {
  const cases: [number, string, ReadingErrorCode, string][] = [
    [402, 'no_readings_left', 'no_readings_left', 'zero'],
    [403, 'needs_email_verification', 'needs_email_verification', 'signup'],
    [409, 'invalid_session', 'invalid_session', 'retry'],
    [413, 'image_too_large', 'image_too_large', 'retry'],
    [422, 'not_a_palm', 'not_a_palm', 'retake'],
    [429, 'daily_capacity_reached', 'daily_capacity_reached', 'stop'],
    // extract-palm answers the same name with 503: the name decides.
    [503, 'daily_capacity_reached', 'daily_capacity_reached', 'stop'],
    [429, 'too_many_attempts', 'too_many_attempts', 'retry'],
    [429, 'rate_limited', 'rate_limited', 'retry'],
    [503, 'scanner_unavailable', 'scanner_unavailable', 'retry'],
    [503, 'service_paused', 'service_paused', 'stop'],
    [402, 'quota_exhausted', 'daily_capacity_reached', 'stop'],
    [403, 'turnstile_failed', 'turnstile', 'retry'],
    [502, 'turnstile_unreachable', 'turnstile', 'retry'],
    [401, 'unauthenticated', 'unauthenticated', 'retry'],
    [408, 'body_timeout', 'offline', 'retry'],
  ];
  it.each(cases)('%i %s → %s (%s)', (status, name, code, kind) => {
    const error = errorFromFunction(status, { error: name });
    expect(error.code).toBe(code);
    expect(planFor(code).kind).toBe(kind);
    expect(ERROR_COPY[code].title.en.length).toBeGreaterThan(3);
    expect(ERROR_COPY[code].body.hi.length).toBeGreaterThan(3);
  });

  it('a refund is the server\'s word; an unknown 5xx promises nothing', () => {
    expect(errorFromFunction(422, { error: 'not_a_palm', refunded: true, reason: 'back_of_hand' })).toMatchObject({ noCharge: true, reason: 'back_of_hand' });
    expect(errorFromFunction(502, { error: 'provider_unavailable', refunded: false }).noCharge).toBe(false);
    expect(errorFromFunction(502, { error: 'provider_unavailable', refunded: true }).noCharge).toBe(true);
    expect(errorFromFunction(500, null).code).toBe('server');
  });

  it('Postgres exception names from the RPCs (start_web_reading, claim_extraction)', () => {
    expect(codeFromMessage('web_pass_required')).toBe('web_pass_required');
    expect(codeFromMessage('ERROR:  needs_email_verification')).toBe('needs_email_verification');
    expect(codeFromMessage('session_not_in_progress')).toBe('invalid_session');
    expect(codeFromMessage('daily_limit')).toBe('too_many_attempts');
    expect(codeFromMessage('something else')).toBeNull();
    expect(errorFromRpc({ message: 'TypeError: Failed to fetch' }).code).toBe('offline');
    expect(errorFromRpc({ message: 'no_readings_left', code: 'P0014' }).code).toBe('no_readings_left');
    expect(planFor('web_pass_required')).toEqual({ kind: 'retry', auto: 'regate' });
    expect(planFor('offline')).toEqual({ kind: 'retry', auto: 'when-online' });
  });
});

describe('parsing the server answers', () => {
  it('reading_balance → the free numbers; packs and plans only as the appPaid flag (never counted as free, case 21)', () => {
    expect(parseBalance({ free_now: 1, free_remaining: 2, email_needed: false, paid_available: 9, subscription: { active: true } })).toEqual({
      freeNow: 1,
      freeRemaining: 2,
      emailNeeded: false,
      appPaid: true,
    });
    expect(parseBalance(null)).toEqual({ freeNow: 0, freeRemaining: 0, emailNeeded: false });
    expect(parseBalance({ free_now: -3, free_remaining: 'x', email_needed: 'yes' })).toEqual({ freeNow: 0, freeRemaining: 0, emailNeeded: false });
  });

  it('scan-palm: ok, refused by the scanner, or not a scan at all', () => {
    expect(parseScan(scanResponse, 10).status).toBe('ok');
    const refused = { ...scanResponse, quality: { ok: false, reasons: [{ code: 'back_of_hand', message: { en: 'Turn your hand over.', hi: 'हाथ पलटें।' } }] }, lines: null };
    expect(parseScan(refused, 10).status).toBe('rejected');
    expect(() => parseScan({ nope: true }, 10)).toThrow(ReadingError);
  });

  it('extract-palm: the server-validated observation, validated again with the app\'s schema', () => {
    const result = parseExtraction({ observation: visionOutput, repairs: ['fixed a bracket'], latencyMs: 1234, costUnits: 99 });
    expect(result.latencyMs).toBe(1234);
    expect(result.costUnits).toBe(99);
    expect(result.output.warnings).toContain('fixed a bracket');
    expect(() => parseExtraction({})).toThrow();
  });
});

describe('config: only the proxy, only public keys', () => {
  it('production follows the flag only; previews may switch with ?reading=', () => {
    expect(resolveReadingMode({ flag: false, preview: false, query: 'live', env: 'mock' })).toBe('off');
    expect(resolveReadingMode({ flag: true, preview: false, query: 'mock' })).toBe('live');
    expect(resolveReadingMode({ flag: false, preview: true, query: 'mock' })).toBe('mock');
    expect(resolveReadingMode({ flag: false, preview: true, query: null, env: 'live' })).toBe('live');
    expect(resolveReadingMode({ flag: false, preview: true, query: 'bogus', env: undefined })).toBe('off');
  });

  it('never *.supabase.co (blocked by Indian ISPs); a preview may use another https proxy', () => {
    const fallback = 'https://api.palmsays.com';
    expect(resolveApiUrl({ preview: true, override: 'https://oeuaauluqlqkuplulzsc.supabase.co' }, fallback)).toBe(fallback);
    expect(resolveApiUrl({ preview: false, override: 'https://palm-api.acct.workers.dev' }, fallback)).toBe(fallback);
    expect(resolveApiUrl({ preview: true, override: 'https://palm-api.acct.workers.dev/' }, fallback)).toBe('https://palm-api.acct.workers.dev');
    expect(resolveApiUrl({ preview: true, override: 'http://evil.example' }, fallback)).toBe(fallback);
    expect(resolveApiUrl({ preview: true, override: 'https://x.example/path' }, fallback)).toBe(fallback);
  });

  it('refuses secret keys', () => {
    expect(acceptPublishableKey('sb_publishable_abcdefghijklmnop')).toBe('sb_publishable_abcdefghijklmnop');
    expect(acceptPublishableKey('sb_secret_abcdefghijklmnop')).toBeNull();
    const jwt = (role: string) => `eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify({ role })).replace(/=+$/, '')}.sig`;
    expect(acceptPublishableKey(jwt('anon'))).toBe(jwt('anon'));
    expect(acceptPublishableKey(jwt('service_role'))).toBeNull();
    expect(missingForLive({ mode: 'live', preview: true, apiUrl: 'https://api.palmsays.com', publishableKey: null, turnstileSiteKey: null })).toEqual([
      'PUBLIC_SUPABASE_PUBLISHABLE_KEY',
      'PUBLIC_TURNSTILE_SITE_KEY',
    ]);
  });
});

describe('the live client talks only to the proxy, with apikey + the user token', () => {
  const API = 'https://api.palmsays.com';
  const KEY = 'sb_publishable_test_key_123456';
  const now = Math.floor(Date.now() / 1000);
  const session = {
    access_token: 'user-jwt',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: now + 3600,
    refresh_token: 'refresh',
    user: { id: '11111111-1111-4111-8111-111111111111', aud: 'authenticated', role: 'authenticated', email: '', is_anonymous: true, app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() },
  };

  function fakeFetch() {
    const calls: { url: string; init: RequestInit | undefined }[] = [];
    const impl = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      calls.push({ url, init });
      const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
      if (url.includes('/auth/v1/signup')) return json(session);
      if (url.includes('/functions/v1/web-gate')) return json({ ok: true, expiresAt: new Date().toISOString() });
      if (url.includes('/rest/v1/rpc/start_web_reading')) return json({ message: 'daily_capacity_reached', code: 'P0012' }, 400);
      if (url.includes('/rest/v1/rpc/reading_balance')) return json({ free_now: 1, free_remaining: 2, email_needed: false });
      if (url.includes('/functions/v1/extract-palm')) return json({ error: 'not_a_palm', refunded: true, reason: 'no_palm' }, 422);
      return json({}, 404);
    }) as typeof fetch;
    return { calls, impl };
  }

  it('guest sign-in, web pass, balance and refusals, all through api.palmsays.com', async () => {
    const { calls, impl } = fakeFetch();
    const api = createLiveApi({ apiUrl: API, publishableKey: KEY, fetchImpl: impl });
    expect(await api.currentUser()).toBeNull();
    const user = await api.ensureGuest();
    expect(user).toEqual({ id: session.user.id, email: null, isGuest: true });

    await api.webGate('0.turnstile-token');
    const gate = calls.find((c) => c.url.endsWith('/functions/v1/web-gate'))!;
    const headers = new Headers(gate.init?.headers);
    expect(headers.get('apikey')).toBe(KEY);
    expect(headers.get('authorization')).toBe('Bearer user-jwt');
    expect(JSON.parse(String(gate.init?.body))).toEqual({ token: '0.turnstile-token' });

    expect(await api.balance()).toEqual({ freeNow: 1, freeRemaining: 2, emailNeeded: false });
    await expect(api.startWebReading('left', true, 'key-12345678')).rejects.toMatchObject({ code: 'daily_capacity_reached' });
    await expect(api.extract('11111111-1111-4111-8111-111111111111', '/9j/abc', { traced: true, mainLines: 3 })).rejects.toMatchObject({ code: 'not_a_palm', noCharge: true });

    expect(calls.length).toBeGreaterThan(4);
    for (const call of calls) {
      expect(call.url.startsWith(`${API}/`), call.url).toBe(true);
      expect(call.url).not.toMatch(/supabase\.co/);
    }
    const start = calls.find((c) => c.url.includes('start_web_reading'))!;
    expect(JSON.parse(String(start.init?.body))).toEqual({ p_hand_side: 'left', p_is_dominant: true, p_idempotency_key: 'key-12345678' });
  });

  it('auth answers become plain outcomes, never Supabase\'s text', () => {
    expect(codeResultOf({ code: 'email_exists', message: 'A user with this email address has already been registered' })).toBe('taken');
    expect(codeResultOf({ code: 'over_email_send_rate_limit', message: 'x' })).toBe('wait');
    expect(codeResultOf({ code: 'otp_disabled', message: 'x' })).toBe('unavailable');
    expect(codeResultOf({ code: 'email_address_invalid', message: 'x' })).toBe('invalid');
    expect(verifyResultOf({ code: 'otp_expired', message: 'Token has expired or is invalid' })).toBe('wrong');
    expect(verifyResultOf({ status: 429, message: 'rate limit' })).toBe('wait');
  });
});
