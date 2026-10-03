/**
 * /delete-account/ (WEB-FEAT-013, ARCHITECTURE.md §11 F3): delete an account without the app.
 * A port of the app's web/delete-account.html flow, with the site's bundled supabase-js
 * (plan §12.11) instead of the CDN copy:
 *   1. prove it is you: email + password, or email + a 6-digit code (Google and code accounts);
 *   2. tick the box;
 *   3. the app's `delete-account` function deletes the account now (one retry); if it can't be
 *      reached, `request_account_deletion` erases the data now and queues the account.
 * The client keeps nothing (persistSession false, own storage key), and it talks to the public
 * Supabase URL the old page used (PUBLIC_SUPABASE_URL), allowed on this page only (CSP).
 */
import type { SupabaseClient } from '@supabase/supabase-js';

import { AUTH_STORAGE_KEY, browserStorage, storedUser } from '../lib/auth/state';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const HOW = {
  password: 'Sign in with the email and password you use in the app.',
  code: 'Type the email of your account, tap "Email me a 6-digit code", then type the code.',
};
const SWITCH = {
  password: 'Signed in with Google or an email code? Use an email code instead',
  code: 'Use my password instead',
};

function setup(form: HTMLFormElement): void {
  const url = form.dataset.supabaseUrl ?? '';
  const key = form.dataset.supabaseKey ?? '';
  const configured = /^https:\/\//.test(url) && !url.includes('.invalid') && key.length > 0;

  const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
  const email = $<HTMLInputElement>('da-email');
  const password = $<HTMLInputElement>('da-password');
  const code = $<HTMLInputElement>('da-code');
  const passwordBlock = $<HTMLElement>('da-password-block');
  const codeBlock = $<HTMLElement>('da-code-block');
  const sendCode = $<HTMLButtonElement>('da-send-code');
  const switchMode = $<HTMLButtonElement>('da-switch');
  const how = $<HTMLElement>('da-how');
  const confirmBox = $<HTMLInputElement>('da-confirm');
  const submit = $<HTMLButtonElement>('da-submit');
  const status = $<HTMLElement>('da-status');

  let mode: 'password' | 'code' = 'password';
  let client: SupabaseClient | null = null;

  const show = (message: string, ok: boolean) => {
    status.textContent = message;
    status.dataset.state = ok ? 'ok' : 'error';
  };

  async function getClient(): Promise<SupabaseClient> {
    if (!client) {
      const { createClient } = await import('@supabase/supabase-js');
      client = createClient(url, key, {
        // Nothing stays in this browser once the tab closes; never touches the site's own session.
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: 'palmsays-delete-account' },
      });
    }
    return client;
  }

  switchMode.addEventListener('click', () => {
    mode = mode === 'password' ? 'code' : 'password';
    const useCode = mode === 'code';
    passwordBlock.hidden = useCode;
    codeBlock.hidden = !useCode;
    password.required = !useCode;
    code.required = useCode;
    how.textContent = HOW[mode];
    switchMode.textContent = SWITCH[mode];
    status.textContent = '';
    delete status.dataset.state;
  });

  sendCode.addEventListener('click', async () => {
    const address = email.value.trim();
    if (!EMAIL.test(address)) return show('Type the email of your account first.', false);
    if (!configured) return show('This page is not set up yet. Please email us instead (address below).', false);
    sendCode.disabled = true;
    try {
      // Never creates an account: this page only deletes existing ones.
      const { error } = await (await getClient()).auth.signInWithOtp({ email: address, options: { shouldCreateUser: false } });
      if (error && (error.status === 429 || /rate limit|security purposes/i.test(error.message || ''))) {
        show('Please wait a minute before asking for another code.', false);
      } else {
        // Worded the same whether or not the email has an account.
        show('If an account exists for this email, we sent a 6-digit code to it. Check Spam too.', true);
      }
    } catch {
      show('We could not send a code. Check your internet and try again.', false);
    }
    // Supabase allows one code a minute per email.
    window.setTimeout(() => {
      sendCode.disabled = false;
    }, 60_000);
  });

  // Second step: nothing is deleted until the box is ticked.
  confirmBox.addEventListener('change', () => {
    submit.disabled = !confirmBox.checked;
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!confirmBox.checked) return show('Please tick the box to confirm you want everything deleted.', false);
    if (!configured) return show('This page is not set up yet. Please email us instead (address below).', false);
    submit.disabled = true;
    show('Working…', true);
    try {
      const supabase = await getClient();
      let userId: string | null = null;
      if (mode === 'code') {
        const token = code.value.replace(/\D/g, '');
        if (token.length !== 6) {
          submit.disabled = false;
          return show('Type the 6 digits from the email.', false);
        }
        const { data, error } = await supabase.auth.verifyOtp({ email: email.value.trim(), token, type: 'email' });
        if (error) {
          submit.disabled = false;
          return show('That code did not work. It may be mistyped or too old. Check it, or send a new one.', false);
        }
        userId = data.user?.id ?? null;
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: email.value.trim(), password: password.value });
        if (error) {
          submit.disabled = false;
          return show('That email and password did not match an account. Signed in with Google? Use an email code instead.', false);
        }
        userId = data.user?.id ?? null;
      }

      // Deletes the account itself, immediately (app repo supabase/functions/delete-account).
      let result = await supabase.functions.invoke('delete-account', { method: 'POST' });
      if (result.error) {
        // One more try first: a cold start or a short network drop is the usual cause.
        await new Promise((resolve) => window.setTimeout(resolve, 1500));
        result = await supabase.functions.invoke('delete-account', { method: 'POST' });
      }
      if (result.error) {
        // Fallback: erase the data now and queue the account for removal.
        const queued = await supabase.rpc('request_account_deletion');
        if (queued.error) {
          submit.disabled = false;
          return show('We could not complete that. Please email us and we will do it by hand.', false);
        }
        await supabase.auth.signOut({ scope: 'local' });
        forgetSiteSession(userId);
        form.hidden = true;
        return show('Your readings have been deleted. Your account is queued and will be removed within 30 days.', true);
      }

      await supabase.auth.signOut({ scope: 'local' });
      forgetSiteSession(userId);
      form.hidden = true;
      show('Done. Your account, readings and profile have been permanently deleted.', true);
    } catch {
      submit.disabled = false;
      show('Something went wrong. Please email us and we will do it by hand.', false);
    }
  });
}

/** If this browser was signed in to the deleted account on the website, drop that stale session. */
function forgetSiteSession(userId: string | null): void {
  if (!userId) return;
  const store = browserStorage();
  try {
    if (store && storedUser(store.getItem(AUTH_STORAGE_KEY))?.id === userId) store.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // Storage blocked: nothing to forget.
  }
}

const form = document.getElementById('da-form');
if (form instanceof HTMLFormElement) setup(form);
