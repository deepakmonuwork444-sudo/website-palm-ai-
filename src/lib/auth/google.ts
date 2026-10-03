/**
 * "Continue with Google" on the website (WEB-DEC-045, WEB_AUTH_PLAN.md §2):
 * Google Identity Services gives an ID token on our page, and Supabase signs
 * in with it through the proxy (never a redirect to *.supabase.co).
 *
 * The link-or-sign-in rule is ported from the app's src/features/auth/google.ts
 * (same Web client ID, same Supabase Google provider, so a Google user is the
 * same person in both):
 * - a GUEST links Google to the same account (`linkIdentity` with the ID token,
 *   same user id: the guest reading and its free count stay);
 * - when that Google account already belongs to someone (identity_already_exists)
 *   or linking is off, it signs in to the Google account normally — the guest's
 *   reading stays in this browser only and the screen says so (owner, case 2);
 * - anyone else signs in with the ID token.
 *
 * Nonce: a fresh random value per attempt; Google gets its SHA-256 hex, Supabase
 * the raw value. While the project's "Skip nonce check" is ON (the app needs it)
 * Supabase ignores it (plan §2) — harmless, and ready for when it is turned off.
 *
 * Pure: no Supabase or Google import, unit tested in Node.
 */

export interface AuthErrorLike {
  message?: string | undefined;
  code?: string | undefined;
  status?: number | undefined;
  name?: string | undefined;
}

export interface IdTokenCredentials {
  provider: 'google';
  token: string;
  nonce: string;
}

/** The two supabase-js calls this needs (auth.linkIdentity / auth.signInWithIdToken). */
export interface IdTokenAuth {
  linkIdentity(credentials: IdTokenCredentials): Promise<{ error: AuthErrorLike | null }>;
  signInWithIdToken(credentials: IdTokenCredentials): Promise<{ error: AuthErrorLike | null }>;
}

/** Why Google sign-in failed, in words the screen can show. */
export type GoogleFailure = 'not_configured' | 'offline' | 'wait' | 'failed';

export type GoogleOutcome =
  | {
      ok: true;
      /** Google was added to the guest account (same user id). */
      linked: boolean;
      /** Signed in to a DIFFERENT (existing) account: the guest reading stayed in this browser. */
      switched: boolean;
    }
  | { ok: false; reason: GoogleFailure };

function lower(error: AuthErrorLike): string {
  return String(error.message ?? '').toLowerCase();
}

/** The Google identity belongs to another user already. */
export function isIdentityTaken(error: AuthErrorLike): boolean {
  const text = lower(error);
  return error.code === 'identity_already_exists' || text.includes('identity is already linked') || text.includes('already linked to another user');
}

/** Linking is not possible here (switched off, or not supported): fall back to a normal sign-in. */
export function isLinkUnavailable(error: AuthErrorLike): boolean {
  const text = lower(error);
  return error.code === 'manual_linking_disabled' || text.includes('manual linking') || text.includes('linking is disabled');
}

/** Supabase's error → what the screen says (never Supabase's raw text). */
export function googleFailureOf(error: AuthErrorLike): GoogleFailure {
  const text = lower(error);
  const code = String(error.code ?? '');
  if (code === 'provider_disabled' || (text.includes('provider') && text.includes('not enabled')) || text.includes('unsupported provider')) return 'not_configured';
  // Wrong client ID in Supabase ("Unacceptable audience") or a nonce mismatch: a setup problem.
  if (text.includes('audience') || text.includes('nonce') || code === 'bad_jwt' || text.includes('bad_jwt')) return 'not_configured';
  if (code.startsWith('over_') || text.includes('rate limit') || error.status === 429) return 'wait';
  if (/fetch|network|load failed/.test(text) || error.name === 'AuthRetryableFetchError') return 'offline';
  return 'failed';
}

export async function linkOrSignIn(
  auth: IdTokenAuth,
  input: { token: string; nonce: string; isGuest: boolean },
  log: (error: AuthErrorLike) => void = () => undefined,
): Promise<GoogleOutcome> {
  const credentials: IdTokenCredentials = { provider: 'google', token: input.token, nonce: input.nonce };
  try {
    if (input.isGuest) {
      const linked = await auth.linkIdentity(credentials);
      if (!linked.error) return { ok: true, linked: true, switched: false };
      log(linked.error);
      if (!isIdentityTaken(linked.error) && !isLinkUnavailable(linked.error)) return { ok: false, reason: googleFailureOf(linked.error) };
      // The same token again (not yet used for a session: the link was refused).
      const signedIn = await auth.signInWithIdToken(credentials);
      if (signedIn.error) {
        log(signedIn.error);
        return { ok: false, reason: googleFailureOf(signedIn.error) };
      }
      return { ok: true, linked: false, switched: true };
    }
    const signedIn = await auth.signInWithIdToken(credentials);
    if (signedIn.error) {
      log(signedIn.error);
      return { ok: false, reason: googleFailureOf(signedIn.error) };
    }
    return { ok: true, linked: false, switched: false };
  } catch (caught) {
    const error: AuthErrorLike = { message: caught instanceof Error ? caught.message : String(caught), name: caught instanceof Error ? caught.name : 'Error' };
    log(error);
    return { ok: false, reason: googleFailureOf(error) };
  }
}

/** A fresh random nonce (32 bytes, hex). */
export function newNonce(random: (bytes: Uint8Array<ArrayBuffer>) => Uint8Array = (bytes) => crypto.getRandomValues(bytes)): string {
  return Array.from(random(new Uint8Array(new ArrayBuffer(32))), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** SHA-256 of the nonce as lowercase hex: what Google puts in the ID token and Supabase compares. */
export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** A Google Web client ID (public by design); anything else is ignored. */
export function acceptGoogleClientId(value: string | null | undefined): string | null {
  const id = value?.trim();
  return id && /^[0-9]+-[a-z0-9]+\.apps\.googleusercontent\.com$/.test(id) ? id : null;
}
