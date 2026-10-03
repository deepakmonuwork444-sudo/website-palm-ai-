/**
 * Google Identity Services in the browser (WEB-DEC-045). The script
 * (https://accounts.google.com/gsi/client, ~90 KB from Google) loads only on
 * /account/ and /reading/, and only when a sign-in card or sheet is on screen
 * (never on the home page or SEO pages). Those three pages allow Google's
 * origins in their own CSP (src/lib/auth/csp.ts); no other page does.
 *
 * Popup mode (no redirect), FedCM on where the browser has it. Each attempt
 * gets a fresh nonce: GIS receives its SHA-256, the credential callback hands
 * back the raw value for Supabase (lib/auth/google.ts).
 */

import type { Locale } from '../../config/site';
import { newNonce, sha256Hex } from './google';

const GIS_SRC = 'https://accounts.google.com/gsi/client';
const LOAD_MS = 15_000;

interface GisButtonOptions {
  type: 'standard';
  theme: 'outline' | 'filled_black' | 'filled_blue';
  size: 'large';
  text: 'continue_with' | 'signin_with';
  shape: 'pill';
  logo_alignment: 'center' | 'left';
  width?: number;
  locale?: string;
}

interface GisId {
  initialize(config: Record<string, unknown>): void;
  renderButton(parent: HTMLElement, options: GisButtonOptions): void;
  prompt(): void;
  cancel(): void;
  disableAutoSelect(): void;
}

export interface GoogleCredential {
  token: string;
  nonce: string;
}

let loading: Promise<GisId> | null = null;

function gisOnPage(): GisId | null {
  const g = (window as Window & { google?: { accounts?: { id?: GisId } } }).google;
  return g?.accounts?.id ?? null;
}

/** Loads Google's script once per page. Rejects when it is blocked or too slow (the email code still works). */
export function loadGis(): Promise<GisId> {
  const ready = gisOnPage();
  if (ready) return Promise.resolve(ready);
  if (loading) return loading;
  loading = new Promise<GisId>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GIS_SRC;
    script.async = true;
    const timer = window.setTimeout(() => reject(new Error('gis timeout')), LOAD_MS);
    script.onload = () => {
      window.clearTimeout(timer);
      const id = gisOnPage();
      if (id) resolve(id);
      else reject(new Error('gis missing'));
    };
    script.onerror = () => {
      window.clearTimeout(timer);
      reject(new Error('gis blocked'));
    };
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    loading = null;
    throw error;
  });
  return loading;
}

export interface GoogleSession {
  /** Draws Google's own button into `parent` (fresh nonce already set). */
  render(parent: HTMLElement): void;
  /** One Tap (FedCM). Only on /account/ and after the first free reading. */
  prompt(): void;
  cancel(): void;
}

/**
 * Sets up GIS with a fresh nonce and hands every credential to `onCredential`.
 * After each credential it re-initialises with a NEW nonce (a retry never reuses one).
 */
export async function startGoogle(options: { clientId: string; locale: Locale; onCredential: (credential: GoogleCredential) => void }): Promise<GoogleSession> {
  const id = await loadGis();
  const parents = new Set<HTMLElement>();
  let raw = '';

  const buttonOptions = (parent: HTMLElement): GisButtonOptions => ({
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'continue_with',
    shape: 'pill',
    logo_alignment: 'center',
    width: Math.max(200, Math.min(400, Math.round(parent.clientWidth || 320))),
    locale: options.locale === 'hi' ? 'hi' : 'en',
  });

  async function init(): Promise<void> {
    raw = newNonce();
    const hashed = await sha256Hex(raw);
    id.initialize({
      client_id: options.clientId,
      nonce: hashed,
      ux_mode: 'popup',
      context: 'signin',
      auto_select: false,
      cancel_on_tap_outside: true,
      itp_support: true,
      use_fedcm_for_prompt: true,
      use_fedcm_for_button: true,
      callback: (response: { credential?: string }) => {
        const token = response.credential;
        const nonce = raw;
        if (token) options.onCredential({ token, nonce });
        // The next attempt (a retry after a network drop) gets a new nonce.
        void init().then(() => {
          for (const parent of parents) if (parent.isConnected) id.renderButton(parent, buttonOptions(parent));
        });
      },
    });
  }

  await init();
  return {
    render(parent) {
      parents.add(parent);
      id.renderButton(parent, buttonOptions(parent));
    },
    prompt() {
      try {
        id.prompt();
      } catch {
        // One Tap is optional; the button still works.
      }
    },
    cancel() {
      try {
        id.cancel();
      } catch {
        // Nothing open.
      }
    },
  };
}

/** After a sign-out: Google must not sign the person straight back in (case 13). */
export function disableGoogleAutoSelect(): void {
  const id = typeof window === 'undefined' ? null : gisOnPage();
  try {
    id?.disableAutoSelect();
  } catch {
    // GIS not loaded: nothing to switch off.
  }
}
