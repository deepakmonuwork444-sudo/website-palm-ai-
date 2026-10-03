/**
 * The header's account state (Header.astro), run inline before first paint on
 * every page: "Sign in" or the round initial + menu. Plain JS, no imports, no
 * Supabase: it only reads this browser's stored session.
 *
 * Signed in = a stored `palmsays-auth` session whose user is NOT a guest (a
 * guest has a session too, and a guest must never see "Sign out"). It also
 * remembers that this browser had an account (case 20) and exposes
 * `window.__palmsaysAuthSync` so the account page and the reading can refresh
 * the header after a sign-in or sign-out (lib/auth/state.ts syncHeader()).
 * Never throws: blocked storage = signed out.
 *
 * Astro does not hash `is:inline` scripts into its CSP, so Header.astro adds
 * inlineScriptHash(HEADER_AUTH_SCRIPT). tests/unit/auth.test.ts runs this text.
 */

import { createHash } from 'node:crypto';

export const HEADER_AUTH_SCRIPT = `(() => {
  const sync = () => {
    let user = null;
    let name = '';
    try {
      const s = JSON.parse(localStorage.getItem('palmsays-auth') || 'null');
      const u = s && s.user;
      if (u && typeof u.id === 'string' && u.is_anonymous !== true && (s.access_token || s.refresh_token)) user = u;
      if (user) {
        const me = JSON.parse(localStorage.getItem('palmsays-me') || 'null');
        const m = user.user_metadata || {};
        name = (me && typeof me.name === 'string' && me.name.trim()) || m.given_name || m.full_name || m.name || user.email || '';
        localStorage.setItem('palmsays-had-account', '1');
      }
    } catch {
      user = user || null;
    }
    document.documentElement.toggleAttribute('data-signed-in', Boolean(user));
    for (const el of document.querySelectorAll('[data-auth-in]')) el.hidden = !user;
    for (const el of document.querySelectorAll('[data-auth-out]')) el.hidden = Boolean(user);
    const letter = (Array.from(String(name).trim())[0] || '•').toLocaleUpperCase();
    for (const el of document.querySelectorAll('[data-account-initial]')) el.textContent = letter;
  };
  window.__palmsaysAuthSync = sync;
  sync();
})();`;

/** The CSP hash of an inline script's exact text (build time only). */
export function inlineScriptHash(code: string): `sha256-${string}` {
  return `sha256-${createHash('sha256').update(code).digest('base64')}`;
}
