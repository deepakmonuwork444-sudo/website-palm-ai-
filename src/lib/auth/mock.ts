/**
 * Preview (mock) accounts: `npm run dev` and preview builds with
 * PUBLIC_READING_MODE=mock. Nothing is sent anywhere.
 *
 * The pretend session is written to the SAME `palmsays-auth` entry, in the
 * shape supabase-js uses, so the header, the reading and the account page all
 * see one account, exactly as they will in live mode. It carries `mock: true`
 * and the live client deletes such an entry before it starts
 * (src/lib/supabase-client.ts), so it can never reach the real server.
 *
 * - "Continue with Google" (preview button) signs in as Deepak Kumar,
 *   deepak@example.com (given name Deepak). `?mockGoogle=existing` pretends that
 *   Google account already exists with its free readings used (case 2).
 * - Email codes: any 6 digits work, except 000000 (to preview "wrong code").
 */

import type { Balance, CodeResult, VerifyResult } from '../reading/balance';
import type { AccountApi, AccountReading, CodeVia } from './account';
import type { GoogleOutcome } from './google';
import { AUTH_STORAGE_KEY, browserStorage, storedUser, type KeyValueStore, type StoredUser } from './state';

export const MOCK_USAGE_KEY = 'palmsays-mock-usage';
export const MOCK_GOOGLE_USER = { email: 'deepak@example.com', givenName: 'Deepak', fullName: 'Deepak Kumar' } as const;
/** Free readings per person (guest 1 + 1 after sign-up), as the server's rule (DEC-046). */
const FREE_TOTAL = 2;

export interface MockAccountState {
  user: StoredUser | null;
  /** Free readings used by this account. */
  used: number;
}

export function readMockState(store: KeyValueStore | null): MockAccountState {
  if (!store) return { user: null, used: 0 };
  try {
    const raw = store.getItem(AUTH_STORAGE_KEY);
    const isMock = raw ? JSON.parse(raw)?.mock === true : false;
    const user = isMock ? storedUser(raw) : null;
    const used = Number(store.getItem(MOCK_USAGE_KEY) ?? 0);
    return { user, used: user && Number.isFinite(used) ? Math.max(0, Math.floor(used)) : 0 };
  } catch {
    return { user: null, used: 0 };
  }
}

/** Writes the pretend session in supabase-js's shape (with `mock: true`). */
export function writeMockState(store: KeyValueStore | null, state: MockAccountState): void {
  if (!store) return;
  try {
    if (!state.user) {
      store.removeItem(AUTH_STORAGE_KEY);
      store.removeItem(MOCK_USAGE_KEY);
      return;
    }
    const u = state.user;
    const session = {
      mock: true,
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      token_type: 'bearer',
      expires_at: 4_102_444_800,
      user: {
        id: u.id,
        email: u.email ?? '',
        is_anonymous: u.isGuest,
        app_metadata: u.viaGoogle ? { provider: 'google', providers: ['google'] } : { provider: u.isGuest ? 'anonymous' : 'email', providers: u.isGuest ? [] : ['email'] },
        user_metadata: u.viaGoogle ? { given_name: u.givenName, full_name: u.fullName, name: u.fullName, email: u.email } : {},
        identities: u.viaGoogle ? [{ provider: 'google' }] : [],
      },
    };
    store.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    store.setItem(MOCK_USAGE_KEY, String(state.used));
  } catch {
    // Storage blocked: the pretend account lasts for this page only.
  }
}

export function mockBalance(state: MockAccountState): Balance {
  const left = Math.max(0, FREE_TOTAL - state.used);
  if (!state.user || state.user.isGuest) return { freeNow: state.used < 1 ? 1 : 0, freeRemaining: left, emailNeeded: state.used >= 1 && left > 0 };
  return { freeNow: left, freeRemaining: left, emailNeeded: false };
}

function newId(): string {
  return `mock-user-${Date.now().toString(36)}`;
}

/** The Google preview: link to the guest (same id), or sign in; `existing` = that Google account already exists. */
export function mockGoogle(state: MockAccountState, existing: boolean): { state: MockAccountState; outcome: GoogleOutcome } {
  const google: StoredUser = { id: newId(), email: MOCK_GOOGLE_USER.email, isGuest: false, givenName: MOCK_GOOGLE_USER.givenName, fullName: MOCK_GOOGLE_USER.fullName, viaGoogle: true };
  if (existing) return { state: { user: google, used: FREE_TOTAL }, outcome: { ok: true, linked: false, switched: Boolean(state.user?.isGuest) } };
  if (state.user?.isGuest) return { state: { user: { ...google, id: state.user.id }, used: state.used }, outcome: { ok: true, linked: true, switched: false } };
  return { state: { user: google, used: 0 }, outcome: { ok: true, linked: false, switched: false } };
}

export function mockCodeUser(state: MockAccountState, email: string, via: CodeVia): MockAccountState {
  const user: StoredUser = { id: via === 'email_change' && state.user ? state.user.id : newId(), email, isGuest: false, givenName: null, fullName: null, viaGoogle: false };
  return { user, used: via === 'email_change' ? state.used : 0 };
}

export function createMockAccount(options: { store?: KeyValueStore | null; search?: string; sleep?: (ms: number) => Promise<void>; savedReadings?: () => Promise<{ id: string; createdAt: string; handSide: string; synthesis: unknown }[]> } = {}): AccountApi {
  const store = options.store === undefined ? browserStorage() : options.store;
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const existing = new URLSearchParams(options.search ?? '').get('mockGoogle') === 'existing';
  const listeners = new Set<() => void>();
  let pending: string | null = null;
  const notify = () => {
    for (const listener of listeners) listener();
  };
  const saved = async () => (options.savedReadings ? options.savedReadings().catch(() => []) : []);

  return {
    mode: 'mock',
    async me() {
      return readMockState(store).user;
    },
    async balance() {
      return readMockState(store).user ? mockBalance(readMockState(store)) : null;
    },
    async google(): Promise<GoogleOutcome> {
      await sleep(600);
      const next = mockGoogle(readMockState(store), existing);
      writeMockState(store, next.state);
      notify();
      return next.outcome;
    },
    async sendCode(email: string): Promise<CodeResult> {
      await sleep(400);
      if (/taken/i.test(email)) return 'taken';
      pending = email;
      return 'sent';
    },
    async verifyCode(email: string, code: string, via: CodeVia): Promise<VerifyResult> {
      await sleep(400);
      if (!/^\d{6}$/.test(code) || code === '000000' || email !== pending) return 'wrong';
      writeMockState(store, mockCodeUser(readMockState(store), email, via));
      notify();
      return 'ok';
    },
    async readings(): Promise<AccountReading[]> {
      if (!readMockState(store).user) return [];
      return (await saved())
        .map((r): AccountReading => ({ id: r.id, createdAt: r.createdAt, handSide: r.handSide === 'left' || r.handSide === 'right' ? r.handSide : null }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async openReading(id: string) {
      const reading = (await saved()).find((r) => r.id === id);
      return (reading?.synthesis ?? null) as Awaited<ReturnType<AccountApi['openReading']>>;
    },
    async signOut() {
      writeMockState(store, { user: null, used: 0 });
      notify();
    },
    onChange(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
