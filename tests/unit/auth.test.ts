import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import goldenInput from '../../src/lib/reading/mock/golden-input.json';
import { lockedServerReading } from '../../src/lib/account/server-reading';
import { createMockAccount, mockBalance, readMockState } from '../../src/lib/auth/mock';
import { GOOGLE_CSP, allowGoogleSignIn } from '../../src/lib/auth/csp';
import { acceptGoogleClientId, googleFailureOf, isIdentityTaken, isLinkUnavailable, linkOrSignIn, newNonce, sha256Hex, type IdTokenAuth } from '../../src/lib/auth/google';
import { HEADER_AUTH_SCRIPT, inlineScriptHash } from '../../src/lib/auth/header-script';
import { signOutLocal } from '../../src/lib/auth/live';
import { AUTH_STORAGE_KEY, HAD_ACCOUNT_KEY, PROFILE_KEY, displayName, hadAccount, initialOf, signedInUser, storedUser, type KeyValueStore } from '../../src/lib/auth/state';
import { createMockApi } from '../../src/lib/reading/api-mock';
import { parseBalance, type ReadingApi } from '../../src/lib/reading/api';
import { isInAppBrowser } from '../../src/lib/reading/browser';
import type { EncodedCopy, PreparedPhoto } from '../../src/lib/reading/image';
import { ReadingFlow, type FlowDeps } from '../../src/lib/reading/machine';
import type { GateResult } from '../../src/lib/reading/palm/features/quality/gate';
import { palmObservationSchema } from '../../src/lib/reading/palm/features/observation/schema';
import { FREE_LOCKED_SECTIONS } from '../../src/lib/reading/palm/features/reading/access';
import { memoryStore } from '../../src/lib/reading/store';
import { fakeTokenSource } from '../../src/lib/reading/turnstile';

/** WEB-FEAT-029/062 (WEB_AUTH_PLAN.md §4 cases, §5.8 tests). */

function memoryStorage(initial: Record<string, string> = {}): KeyValueStore & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => (key in data ? data[key]! : null),
    setItem: (key, value) => {
      data[key] = String(value);
    },
    removeItem: (key) => {
      delete data[key];
    },
  };
}

const session = (user: Record<string, unknown>) => JSON.stringify({ access_token: 'a', refresh_token: 'r', user });
const GUEST = session({ id: 'g1', is_anonymous: true, email: '' });
const GOOGLE_USER = session({
  id: 'u1',
  is_anonymous: false,
  email: 'deepak@example.com',
  user_metadata: { given_name: 'Deepak', full_name: 'Deepak Kumar' },
  app_metadata: { provider: 'google', providers: ['google'] },
});

function fakeAuth(link: { error: { message?: string; code?: string; status?: number } | null }, signIn: { error: { message?: string; code?: string; status?: number } | null } = { error: null }) {
  const calls: string[] = [];
  const auth: IdTokenAuth = {
    linkIdentity: vi.fn(async (c) => {
      calls.push(`link:${c.token}:${c.nonce}`);
      return link;
    }),
    signInWithIdToken: vi.fn(async (c) => {
      calls.push(`signIn:${c.token}:${c.nonce}`);
      return signIn;
    }),
  };
  return { auth, calls };
}

describe('Google: link a guest, or sign in (cases 1, 2)', () => {
  it('a guest links Google to the SAME account', async () => {
    const { auth, calls } = fakeAuth({ error: null });
    expect(await linkOrSignIn(auth, { token: 't', nonce: 'n', isGuest: true })).toEqual({ ok: true, linked: true, switched: false });
    expect(calls).toEqual(['link:t:n']);
  });

  it('identity_already_exists → signs in to the existing account with the same token + nonce (guest reading stays here)', async () => {
    const { auth, calls } = fakeAuth({ error: { code: 'identity_already_exists', message: 'Identity is already linked to another user' } });
    expect(await linkOrSignIn(auth, { token: 't', nonce: 'n', isGuest: true })).toEqual({ ok: true, linked: false, switched: true });
    expect(calls).toEqual(['link:t:n', 'signIn:t:n']);
  });

  it('linking switched off → a normal sign-in', async () => {
    const { auth, calls } = fakeAuth({ error: { code: 'manual_linking_disabled', message: 'Manual linking is disabled' } });
    expect(await linkOrSignIn(auth, { token: 't', nonce: 'n', isGuest: true })).toMatchObject({ ok: true, switched: true });
    expect(calls).toHaveLength(2);
  });

  it('any other link error stops (no sign-in into another account)', async () => {
    const { auth, calls } = fakeAuth({ error: { message: 'Unacceptable audience in id_token' } });
    expect(await linkOrSignIn(auth, { token: 't', nonce: 'n', isGuest: true })).toEqual({ ok: false, reason: 'not_configured' });
    expect(calls).toEqual(['link:t:n']);
  });

  it('not a guest → sign in only', async () => {
    const { auth, calls } = fakeAuth({ error: null });
    expect(await linkOrSignIn(auth, { token: 't', nonce: 'n', isGuest: false })).toEqual({ ok: true, linked: false, switched: false });
    expect(calls).toEqual(['signIn:t:n']);
  });

  it('errors become screen words, never raw text', async () => {
    expect(googleFailureOf({ code: 'provider_disabled', message: 'x' })).toBe('not_configured');
    expect(googleFailureOf({ message: 'Nonces mismatch' })).toBe('not_configured');
    expect(googleFailureOf({ status: 429, message: 'x' })).toBe('wait');
    expect(googleFailureOf({ code: 'over_request_rate_limit', message: 'x' })).toBe('wait');
    expect(googleFailureOf({ message: 'Failed to fetch' })).toBe('offline');
    expect(googleFailureOf({ message: 'something else' })).toBe('failed');
    const throwing: IdTokenAuth = { linkIdentity: async () => Promise.reject(new TypeError('Failed to fetch')), signInWithIdToken: async () => ({ error: null }) };
    expect(await linkOrSignIn(throwing, { token: 't', nonce: 'n', isGuest: true })).toEqual({ ok: false, reason: 'offline' });
    expect(isIdentityTaken({ message: 'Identity is already linked to another user' })).toBe(true);
    expect(isLinkUnavailable({ message: 'Manual linking is disabled' })).toBe(true);
    expect(isLinkUnavailable({ message: 'Invalid token' })).toBe(false);
  });
});

describe('nonce (plan §2)', () => {
  it('is fresh, 32 random bytes as hex', () => {
    const a = newNonce();
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(newNonce()).not.toBe(a);
  });

  it('Google gets the SHA-256 hex of the raw nonce (what Supabase compares)', async () => {
    expect(await sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    const raw = newNonce();
    expect(await sha256Hex(raw)).toBe(createHash('sha256').update(raw).digest('hex'));
  });

  it('accepts only a Google Web client ID', () => {
    expect(acceptGoogleClientId(' 864260847321-9mpkdijstu971k5p8jeg6p114u1vo442.apps.googleusercontent.com ')).toBe('864260847321-9mpkdijstu971k5p8jeg6p114u1vo442.apps.googleusercontent.com');
    expect(acceptGoogleClientId('')).toBeNull();
    expect(acceptGoogleClientId('GOCSPX-secret')).toBeNull();
  });
});

describe('sign-out is this browser only (case 13)', () => {
  it('always passes scope local (the default, global, would sign the phone app out too)', async () => {
    const signOut = vi.fn(async () => ({ error: null }));
    await signOutLocal({ signOut });
    expect(signOut).toHaveBeenCalledWith({ scope: 'local' });
  });

  it('never throws when offline', async () => {
    await expect(signOutLocal({ signOut: async () => Promise.reject(new Error('Failed to fetch')) })).resolves.toBeUndefined();
  });
});

describe('in-app browsers (case 7)', () => {
  const CHROME = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36';
  it('the generic Android WebView marker "; wv)" counts as in-app', () => {
    expect(isInAppBrowser('Mozilla/5.0 (Linux; Android 14; Pixel 7; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/129.0.0.0 Mobile Safari/537.36')).toBe(true);
    expect(isInAppBrowser(`${CHROME} Instagram 300.0.0.0`)).toBe(true);
  });
  it('Chrome and Chrome Custom Tabs (Chrome\'s own agent) are not', () => {
    expect(isInAppBrowser(CHROME)).toBe(false);
  });
});

describe('who is signed in, from this browser (guest-aware)', () => {
  it('a guest session is NOT signed in', () => {
    expect(storedUser(GUEST)).toMatchObject({ id: 'g1', isGuest: true });
    expect(signedInUser(memoryStorage({ [AUTH_STORAGE_KEY]: GUEST }))).toBeNull();
  });

  it('a Google account is, with its given name', () => {
    const user = signedInUser(memoryStorage({ [AUTH_STORAGE_KEY]: GOOGLE_USER }));
    expect(user).toMatchObject({ id: 'u1', email: 'deepak@example.com', givenName: 'Deepak', viaGoogle: true });
    expect(displayName(memoryStorage({ [PROFILE_KEY]: JSON.stringify({ name: 'Deepu' }) }), user)).toBe('Deepu');
    expect(displayName(memoryStorage(), user)).toBe('Deepak');
    expect(initialOf('', 'zoya@example.com')).toBe('Z');
    expect(initialOf('दीपक', null)).toBe('द');
    expect(initialOf('', null)).toBe('•');
  });

  it('bad JSON, no tokens, or blocked storage → signed out, never a throw', () => {
    expect(storedUser('{nope')).toBeNull();
    expect(storedUser(JSON.stringify({ user: { id: 'x' } }))).toBeNull();
    const blocked: KeyValueStore = {
      getItem: () => {
        throw new Error('SecurityError');
      },
      setItem: () => undefined,
      removeItem: () => undefined,
    };
    expect(signedInUser(blocked)).toBeNull();
    expect(hadAccount(blocked)).toBe(false);
  });
});

/** Runs the header's real inline script (Header.astro) against a fake page. */
function runHeaderScript(storage: KeyValueStore | 'blocked') {
  const script = HEADER_AUTH_SCRIPT;
  const el = () => ({ hidden: false, textContent: '' });
  const nodes = { in: [el(), el()], out: [el()], initial: [el()] };
  const attrs = new Map<string, boolean>();
  const document = {
    documentElement: { toggleAttribute: (name: string, on: boolean) => attrs.set(name, on) },
    querySelectorAll: (selector: string) => (selector === '[data-auth-in]' ? nodes.in : selector === '[data-auth-out]' ? nodes.out : nodes.initial),
  };
  const localStorage =
    storage === 'blocked'
      ? {
          getItem: () => {
            throw new Error('SecurityError');
          },
          setItem: () => undefined,
        }
      : storage;
  const window: Record<string, unknown> = {};
  new Function('document', 'localStorage', 'window', script)(document, localStorage, window);
  return { nodes, attrs, window };
}

describe('the header script (guest-aware, never throws)', () => {
  it('no session → "Sign in"', () => {
    const { nodes, attrs } = runHeaderScript(memoryStorage());
    expect(nodes.out[0]!.hidden).toBe(false);
    expect(nodes.in.every((n) => n.hidden)).toBe(true);
    expect(attrs.get('data-signed-in')).toBe(false);
  });

  it('a GUEST session → still "Sign in" (a guest never sees Sign out)', () => {
    const storage = memoryStorage({ [AUTH_STORAGE_KEY]: GUEST });
    const { nodes } = runHeaderScript(storage);
    expect(nodes.out[0]!.hidden).toBe(false);
    expect(nodes.in.every((n) => n.hidden)).toBe(true);
    expect(storage.data[HAD_ACCOUNT_KEY]).toBeUndefined();
  });

  it('a real account → the initial + menu, and the browser remembers it had an account (case 20)', () => {
    const storage = memoryStorage({ [AUTH_STORAGE_KEY]: GOOGLE_USER });
    const { nodes, attrs, window } = runHeaderScript(storage);
    expect(nodes.out[0]!.hidden).toBe(true);
    expect(nodes.in.every((n) => !n.hidden)).toBe(true);
    expect(nodes.initial[0]!.textContent).toBe('D');
    expect(attrs.get('data-signed-in')).toBe(true);
    expect(storage.data[HAD_ACCOUNT_KEY]).toBe('1');
    expect(typeof window.__palmsaysAuthSync).toBe('function');
  });

  it('the name typed on /account/ wins', () => {
    const { nodes } = runHeaderScript(memoryStorage({ [AUTH_STORAGE_KEY]: GOOGLE_USER, [PROFILE_KEY]: JSON.stringify({ name: 'rahul' }) }));
    expect(nodes.initial[0]!.textContent).toBe('R');
  });

  it('Header.astro runs exactly this script and puts its hash in the page CSP', () => {
    const header = readFileSync(join(__dirname, '../../src/components/Header.astro'), 'utf8');
    expect(header).toContain('set:html={HEADER_AUTH_SCRIPT}');
    expect(readFileSync(join(__dirname, '../../src/layouts/BaseLayout.astro'), 'utf8')).toContain('insertScriptHash(inlineScriptHash(HEADER_AUTH_SCRIPT))');
    expect(inlineScriptHash('abc')).toBe('sha256-ungWv48Bz+pBQUDeXa4iI7ADYaOWF3qctBD/YfIAFa0=');
  });

  it('blocked storage → signed out, no throw', () => {
    const { nodes } = runHeaderScript('blocked');
    expect(nodes.out[0]!.hidden).toBe(false);
  });
});

describe('CSP additions for Google (only the pages that call it)', () => {
  it('adds exactly Google\'s documented sources', () => {
    const calls: string[] = [];
    allowGoogleSignIn({
      csp: {
        insertScriptResource: (r) => calls.push(`script ${r}`),
        insertStyleResource: (r) => calls.push(`style ${r}`),
        insertDirective: (d) => calls.push(d),
      },
    });
    expect(calls).toEqual([
      'script https://accounts.google.com/gsi/client',
      "style 'self'",
      'style https://accounts.google.com/gsi/style',
      'frame-src https://accounts.google.com/gsi/',
      'connect-src https://accounts.google.com/gsi/',
    ]);
    expect(Object.values(GOOGLE_CSP).some((v) => v.includes('*'))).toBe(false);
  });

  it('only /account/, /hi/account/ and /reading/ use it', () => {
    const pages = ['account/index.astro', 'hi/account/index.astro', 'reading/index.astro'];
    for (const page of pages) expect(readFileSync(join(__dirname, '../../src/pages', page), 'utf8')).toContain('allowGoogleSignIn(Astro)');
    for (const page of ['index.astro', 'hi/index.astro', 'app/index.astro']) expect(readFileSync(join(__dirname, '../../src/pages', page), 'utf8')).not.toContain('allowGoogleSignIn');
  });
});

describe('balance: plan / pack holders (case 21)', () => {
  it('flags an app plan or pack, never as free readings', () => {
    expect(parseBalance({ free_now: 0, free_remaining: 0, paid_available: 3 })).toEqual({ freeNow: 0, freeRemaining: 0, emailNeeded: false, appPaid: true });
    expect(parseBalance({ free_now: 0, free_remaining: 0, subscription: { active: true } }).appPaid).toBe(true);
    expect(parseBalance({ free_now: 1, free_remaining: 1, paid_available: 0, unlimited: false, subscription: { active: false } })).toEqual({ freeNow: 1, freeRemaining: 1, emailNeeded: false });
  });
});

describe('preview (mock) accounts', () => {
  const instant = async () => {};

  it('Google links a preview guest to the same id and keeps its free count', async () => {
    const storage = memoryStorage();
    const reading = createMockApi({ sleep: instant, persist: storage });
    const guest = await reading.ensureGuest();
    const account = createMockAccount({ store: storage, sleep: instant });
    expect(await account.me()).toMatchObject({ id: guest.id, isGuest: true });
    expect(await account.google('mock', 'n')).toEqual({ ok: true, linked: true, switched: false });
    expect(await account.me()).toMatchObject({ id: guest.id, isGuest: false, email: 'deepak@example.com', givenName: 'Deepak' });
    expect(signedInUser(storage)?.givenName).toBe('Deepak');
    // The reading sees the same account.
    expect(await reading.currentUser()).toMatchObject({ id: guest.id, isGuest: false });
  });

  it('?mockGoogle=existing: a guest switches to an existing account with its free readings used (case 2)', async () => {
    const storage = memoryStorage();
    await createMockApi({ sleep: instant, persist: storage }).ensureGuest();
    const account = createMockAccount({ store: storage, sleep: instant, search: '?mockGoogle=existing' });
    expect(await account.google('mock', 'n')).toEqual({ ok: true, linked: false, switched: true });
    expect(mockBalance(readMockState(storage))).toEqual({ freeNow: 0, freeRemaining: 0, emailNeeded: false });
  });

  it('email code: any 6 digits, not 000000; sign-out clears the preview session', async () => {
    const storage = memoryStorage();
    const account = createMockAccount({ store: storage, sleep: instant });
    expect(await account.sendCode('a@b.co', 'email')).toBe('sent');
    expect(await account.verifyCode('a@b.co', '000000', 'email')).toBe('wrong');
    expect(await account.verifyCode('a@b.co', '482913', 'email')).toBe('ok');
    expect(await account.balance()).toEqual({ freeNow: 2, freeRemaining: 2, emailNeeded: false });
    await account.signOut();
    expect(await account.me()).toBeNull();
    expect(storage.data[AUTH_STORAGE_KEY]).toBeUndefined();
  });
});

const PASS = goldenInput.reading.gate as unknown as GateResult;

function photo(): PreparedPhoto {
  const copy = (width: number, height: number): EncodedCopy => ({ base64: '/9j/4AAQSkZJRgABAQ', width, height, bytes: 12 });
  return {
    sourceWidth: 3000,
    sourceHeight: 4000,
    scan: copy(810, 1080),
    extract: copy(576, 768),
    check: { data: new Uint8ClampedArray(72 * 96 * 4), width: 72, height: 96 },
    blob: new Blob(['jpeg']),
  };
}

function flowWith(api: ReadingApi, extra: Partial<FlowDeps> = {}): ReadingFlow {
  return new ReadingFlow({
    mode: 'mock',
    api,
    tokens: fakeTokenSource(),
    store: memoryStore(),
    preparePhoto: async () => photo(),
    shrink: async () => ({ base64: '/9j/small', width: 675, height: 900, bytes: 8 }),
    checkPhoto: () => PASS,
    objectUrl: () => 'blob:photo',
    revokeUrl: () => {},
    sleep: async () => {},
    lineDrawMs: 0,
    ...extra,
  });
}

async function readOnce(flow: ReadingFlow): Promise<void> {
  await flow.pick(new Blob(['photo']));
  flow.setHand('left');
  flow.setWrites(true);
  await flow.use();
}

describe('reading flow + Google', () => {
  it('guest reading → Google from the lock sheet → same account, stays on the report, 2nd free reading ready', async () => {
    const api = createMockApi({ sleep: async () => {} });
    const flow = flowWith(api);
    await flow.init();
    await readOnce(flow);
    expect(flow.getState().screen.name).toBe('revealed');
    flow.openLock('career-money');
    await flow.google('tok', 'nonce');
    const s = flow.getState();
    expect(s.user).toMatchObject({ isGuest: false });
    expect(s.sheet).toBeNull();
    expect(s.notice).toBeNull();
    expect(s.screen.name).toBe('revealed');
    expect(s.balance).toMatchObject({ freeNow: 1, freeRemaining: 1 });
  });

  it('Google into an EXISTING account with nothing left → the honest notice and the zero screen', async () => {
    const api = createMockApi({ sleep: async () => {}, googleExisting: true, persist: memoryStorage() });
    const flow = flowWith(api);
    await flow.init();
    await readOnce(flow);
    await flow.google('tok', 'nonce');
    expect(flow.getState().notice).toBe('guestNotMoved');
    expect(flow.getState().screen.name).toBe('zero');
  });

  it('a Google error keeps the sheet open with words, never raw text', async () => {
    const api = createMockApi({ sleep: async () => {} });
    const failing: ReadingApi = { ...api, googleSignIn: async () => ({ ok: false, reason: 'not_configured' }) };
    const flow = flowWith(failing);
    await flow.init();
    flow.openSignup();
    await flow.google('tok', 'nonce');
    expect(flow.getState().sheet).toMatchObject({ kind: 'signup', message: 'googleOff', busy: false });
  });

  it('signed out on a browser that had an account → "Sign in to read", no silent new guest (case 20)', async () => {
    const api = createMockApi({ sleep: async () => {} });
    const ensureGuest = vi.spyOn(api, 'ensureGuest');
    const flow = flowWith(api, { hadAccount: () => true });
    await flow.init();
    await readOnce(flow);
    expect(flow.getState().sheet).toMatchObject({ kind: 'signup', reason: 'signIn' });
    expect(ensureGuest).not.toHaveBeenCalled();
    expect(flow.getState().screen.name).toBe('review');
  });
});

describe('web reading ↔ app schema parity (case 19)', () => {
  it('a web palm_observations payload passes the app\'s palmObservationSchema after the JSON round trip', async () => {
    const api = createMockApi({ sleep: async () => {} });
    let saved: unknown = null;
    const capturing: ReadingApi = {
      ...api,
      complete: async (sessionId, outcome) => {
        saved = JSON.parse(JSON.stringify(outcome.observation));
        return api.complete(sessionId, outcome);
      },
    };
    const flow = flowWith(capturing);
    await flow.init();
    await readOnce(flow);
    expect(saved).not.toBeNull();
    expect(palmObservationSchema.safeParse(saved).success).toBe(true);

    // /account/ rebuilds that reading and locks it like the web report.
    const locked = lockedServerReading(saved, new Date('2026-09-27T00:00:00Z').toISOString());
    expect(locked).not.toBeNull();
    expect(FREE_LOCKED_SECTIONS.length).toBeGreaterThan(0);
    expect(lockedServerReading({ nope: true }, '2026-09-27T00:00:00Z')).toBeNull();
  });

  it('the copied schema is the app\'s file, byte for byte (when the app repo sits next to this one)', () => {
    const app = join(__dirname, '../../../palm-ai-new--feat-m1-foundation/src/features/observation/schema.ts');
    if (!existsSync(app)) return;
    const web = readFileSync(join(__dirname, '../../src/lib/reading/palm/features/observation/schema.ts'), 'utf8').split('\n').slice(3).join('\n');
    expect(web).toBe(readFileSync(app, 'utf8'));
  });
});
