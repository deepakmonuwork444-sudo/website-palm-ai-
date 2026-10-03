/**
 * Account facts read from THIS browser's storage (WEB-FEAT-029/062). Pure and
 * tiny: no Supabase import, so the reading shell, the header and the account
 * page can all use it without loading supabase-js.
 *
 * - `palmsays-auth`: supabase-js's own session entry (src/lib/supabase-client.ts).
 *   A GUEST (anonymous sign-in) has one too, so "signed in" always means a
 *   session whose user is not anonymous.
 * - `palmsays-me`: the name the visitor typed on the account page (this
 *   browser only, never sent; SECURITY_PRIVACY.md §1).
 * - `palmsays-had-account`: this browser has seen a real (non-guest) account.
 *   After a sign-out the reading asks to sign in again instead of silently
 *   making a new guest with a new free reading (WEB_AUTH_PLAN.md case 20).
 *
 * The header's inline script (src/components/Header.astro) repeats the
 * signed-in check in plain JS; tests/unit/auth.test.ts runs that script too.
 */

export const AUTH_STORAGE_KEY = 'palmsays-auth';
export const PROFILE_KEY = 'palmsays-me';
export const HAD_ACCOUNT_KEY = 'palmsays-had-account';

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface StoredUser {
  id: string;
  email: string | null;
  isGuest: boolean;
  givenName: string | null;
  fullName: string | null;
  /** Signed in (or linked) with Google. */
  viaGoogle: boolean;
}

/** The browser's localStorage, or null when it is blocked (private mode, some in-app browsers). */
export function browserStorage(): KeyValueStore | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

/** supabase-js's stored session → its user; null when there is none or it can't be read. */
export function storedUser(raw: string | null | undefined): StoredUser | null {
  if (!raw) return null;
  let session: unknown;
  try {
    session = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!session || typeof session !== 'object') return null;
  const s = session as Record<string, unknown>;
  const user = s.user && typeof s.user === 'object' ? (s.user as Record<string, unknown>) : null;
  if (!user || typeof user.id !== 'string' || !(s.access_token || s.refresh_token)) return null;
  const meta = user.user_metadata && typeof user.user_metadata === 'object' ? (user.user_metadata as Record<string, unknown>) : {};
  const app = user.app_metadata && typeof user.app_metadata === 'object' ? (user.app_metadata as Record<string, unknown>) : {};
  const providers = Array.isArray(app.providers) ? app.providers : [app.provider];
  const identities = Array.isArray(user.identities) ? user.identities : [];
  const viaGoogle = providers.includes('google') || identities.some((i) => i && typeof i === 'object' && (i as { provider?: unknown }).provider === 'google');
  const fullName = text(meta.full_name) ?? text(meta.name);
  return {
    id: user.id,
    email: text(user.email) ?? text(meta.email),
    isGuest: user.is_anonymous === true,
    givenName: text(meta.given_name) ?? (fullName ? (fullName.split(/\s+/)[0] ?? null) : null),
    fullName,
    viaGoogle,
  };
}

/** A real account is signed in here: a session exists AND its user is not a guest. */
export function signedInUser(store: KeyValueStore | null): StoredUser | null {
  if (!store) return null;
  try {
    const user = storedUser(store.getItem(AUTH_STORAGE_KEY));
    return user && !user.isGuest ? user : null;
  } catch {
    return null;
  }
}

/** The name typed on the account page (this browser only). */
export function profileName(store: KeyValueStore | null): string {
  if (!store) return '';
  try {
    const raw = store.getItem(PROFILE_KEY);
    const data = raw ? (JSON.parse(raw) as { name?: unknown }) : null;
    return text(data?.name) ?? '';
  } catch {
    return '';
  }
}

export function saveProfileName(store: KeyValueStore | null, name: string): void {
  try {
    if (!store) return;
    if (name) store.setItem(PROFILE_KEY, JSON.stringify({ name }));
    else store.removeItem(PROFILE_KEY);
  } catch {
    // Storage blocked: the name lasts for this page only.
  }
}

/** The name to greet and pre-fill: the typed one, else Google's given name. Never the email. */
export function displayName(store: KeyValueStore | null, user: StoredUser | null): string {
  return profileName(store) || user?.givenName || '';
}

/** The header's round initial: the name's first letter, else the email's, else a dot. */
export function initialOf(name: string, email: string | null): string {
  const source = name || email || '';
  const first = Array.from(source.trim())[0];
  return first ? first.toLocaleUpperCase() : '•';
}

export function hadAccount(store: KeyValueStore | null): boolean {
  try {
    return store?.getItem(HAD_ACCOUNT_KEY) === '1';
  } catch {
    return false;
  }
}

export function markHadAccount(store: KeyValueStore | null): void {
  try {
    store?.setItem(HAD_ACCOUNT_KEY, '1');
  } catch {
    // Storage blocked.
  }
}

/** Refreshes the header after a sign-in or sign-out on this page (the inline script in Header.astro defines it). */
export function syncHeader(): void {
  if (typeof window === 'undefined') return;
  (window as Window & { __palmsaysAuthSync?: () => void }).__palmsaysAuthSync?.();
}
