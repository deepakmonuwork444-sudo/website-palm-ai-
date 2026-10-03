/**
 * The ONE Supabase client of the website (WEB_AUTH_PLAN.md §5.1): the reading
 * (api-live.ts) and the account page (lib/auth/live.ts) share it, so the guest
 * session, Google sign-in and email codes all live in one place. Two clients
 * with the same storage key would fight over the session (random sign-outs).
 *
 * - `storageKey: 'palmsays-auth'` is unchanged, so today's guests keep their session.
 * - `detectSessionInUrl: false`: no redirect sign-in ever lands on our pages
 *   (Google comes as an ID token through GIS, WEB-DEC-045).
 * - Only ever reached through import() (supabase-js never weighs on a first paint)
 *   and only with the proxy URL from readingConfig() — never *.supabase.co.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { AUTH_STORAGE_KEY, browserStorage } from './auth/state';

export interface ClientOptions {
  apiUrl: string;
  publishableKey: string;
  /** Tests inject a fake fetch; such a client is never shared. */
  fetchImpl?: typeof fetch | undefined;
}

export function createSupabase(options: ClientOptions): SupabaseClient {
  const doFetch = options.fetchImpl ?? ((input: RequestInfo | URL, init?: RequestInit) => fetch(input, init));
  return createClient(options.apiUrl, options.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: AUTH_STORAGE_KEY },
    global: { fetch: doFetch },
  });
}

let shared: { key: string; client: SupabaseClient } | null = null;

/** A preview's mock session (lib/auth/mock.ts) must never reach the real server. */
function dropMockSession(): void {
  const store = browserStorage();
  try {
    const raw = store?.getItem(AUTH_STORAGE_KEY);
    if (raw && JSON.parse(raw)?.mock === true) store?.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // Unreadable entry: supabase-js ignores it itself.
  }
}

/** The page's single client (a test's injected fetch gets its own). */
export function sharedSupabase(options: ClientOptions): SupabaseClient {
  if (options.fetchImpl) return createSupabase(options);
  const key = `${options.apiUrl}|${options.publishableKey}`;
  if (shared?.key === key) return shared.client;
  dropMockSession();
  shared = { key, client: createSupabase(options) };
  return shared.client;
}
