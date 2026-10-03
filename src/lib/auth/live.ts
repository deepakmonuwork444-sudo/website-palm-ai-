/**
 * The live account backend (WEB-FEAT-029/062): the page's ONE shared Supabase
 * client (src/lib/supabase-client.ts), reached only through the proxy URL
 * from readingConfig(). Loaded with import() on /account/ and /reading/ only.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import { parseBalance } from '../reading/balance';
import { sharedSupabase } from '../supabase-client';
import type { AccountApi, AccountReading, CodeVia } from './account';
import { codeResultOf, verifyResultOf } from './codes';
import { linkOrSignIn, type AuthErrorLike, type GoogleOutcome, type IdTokenAuth } from './google';
import { storedUser } from './state';

/** supabase-js's two ID-token calls, typed for linkOrSignIn. */
export function idTokenAuthOf(supabase: SupabaseClient): IdTokenAuth {
  return {
    async linkIdentity(credentials) {
      // supabase-js ≥ 2.100: linkIdentity with an ID token links it to the signed-in (guest) user.
      const { error } = await supabase.auth.linkIdentity({ provider: credentials.provider, token: credentials.token, nonce: credentials.nonce });
      return { error: error as AuthErrorLike | null };
    },
    async signInWithIdToken(credentials) {
      const { error } = await supabase.auth.signInWithIdToken({ provider: credentials.provider, token: credentials.token, nonce: credentials.nonce });
      return { error: error as AuthErrorLike | null };
    },
  };
}

export function googleUserOf(supabase: SupabaseClient, input: { token: string; nonce: string; isGuest: boolean }): Promise<GoogleOutcome> {
  return linkOrSignIn(idTokenAuthOf(supabase), input);
}

/**
 * Sign out of THIS browser only. The default scope is global and would also
 * sign the person out of the app on their phone (WEB_AUTH_PLAN.md case 13).
 */
export async function signOutLocal(auth: { signOut(options: { scope: 'local' }): Promise<unknown> }): Promise<void> {
  try {
    await auth.signOut({ scope: 'local' });
  } catch {
    // Offline: supabase-js has already removed the local session.
  }
}

function handOf(value: unknown): AccountReading['handSide'] {
  return value === 'left' || value === 'right' ? value : null;
}

export function createLiveAccount(options: { apiUrl: string; publishableKey: string }): AccountApi {
  const supabase = sharedSupabase(options);

  return {
    mode: 'live',

    async me() {
      const { data } = await supabase.auth.getSession();
      return data.session ? storedUser(JSON.stringify(data.session)) : null;
    },

    async balance() {
      const { data, error } = await supabase.rpc('reading_balance');
      return error ? null : parseBalance(data);
    },

    async google(token, nonce) {
      const { data } = await supabase.auth.getSession();
      return googleUserOf(supabase, { token, nonce, isGuest: data.session?.user.is_anonymous === true });
    },

    async sendCode(email: string, via: CodeVia) {
      const { error } =
        via === 'email_change'
          ? await supabase.auth.updateUser({ email })
          : await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
      return error ? codeResultOf(error) : 'sent';
    },

    async verifyCode(email: string, code: string, via: CodeVia) {
      const { error } = await supabase.auth.verifyOtp({ email, token: code, type: via });
      return error ? verifyResultOf(error) : 'ok';
    },

    async readings() {
      const { data, error } = await supabase
        .from('reading_reports')
        .select('id, created_at, reading_sessions(hand_side)')
        .order('created_at', { ascending: false })
        .limit(30);
      if (error) throw new Error('readings');
      return (data ?? []).map((row) => {
        const session = row.reading_sessions as { hand_side?: unknown } | { hand_side?: unknown }[] | null;
        const side = Array.isArray(session) ? session[0]?.hand_side : session?.hand_side;
        return { id: String(row.id), createdAt: String(row.created_at), handSide: handOf(side) };
      });
    },

    async openReading(id: string) {
      const { data: report } = await supabase.from('reading_reports').select('session_id, payload').eq('id', id).maybeSingle();
      if (!report) return null;
      const { data: observation } = await supabase.from('palm_observations').select('payload').eq('session_id', report.session_id).maybeSingle();
      if (!observation) return null;
      const generatedAt = (report.payload as { generatedAt?: unknown } | null)?.generatedAt;
      // The palm engine (rules + synthesis) loads only when a reading is opened.
      const { lockedServerReading } = await import('../account/server-reading');
      return lockedServerReading(observation.payload, typeof generatedAt === 'string' ? generatedAt : new Date().toISOString());
    },

    async signOut() {
      await signOutLocal(supabase.auth);
    },

    onChange(listener) {
      const { data } = supabase.auth.onAuthStateChange(() => listener());
      return () => data.subscription.unsubscribe();
    },
  };
}
