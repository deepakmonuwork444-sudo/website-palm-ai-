/**
 * Cloudflare Turnstile (managed widget, action `reading`), checked ONLY by the
 * web-gate function (never Supabase Auth's project-wide CAPTCHA, which would
 * break the app's guest sign-in). The script loads from
 * challenges.cloudflare.com (allowed in the CSP) only when a reading starts.
 * Tokens are single-use and valid for 300 s: one fresh token per web pass.
 */

export interface TokenSource {
  /** Where the widget may show itself when Cloudflare needs a click. */
  attach(container: HTMLElement | null): void;
  /** A fresh token; rejects when the check cannot finish. */
  token(): Promise<string>;
}

interface TurnstileApi {
  render(container: HTMLElement, options: Record<string, unknown>): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const TOKEN_TIMEOUT_MS = 45_000;

let loading: Promise<TurnstileApi> | null = null;

function loadScript(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loading ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('turnstile missing')));
    script.onerror = () => {
      loading = null;
      reject(new Error('turnstile script'));
    };
    document.head.append(script);
  });
  return loading;
}

export function turnstileSource(siteKey: string, language: 'en' | 'hi'): TokenSource {
  let container: HTMLElement | null = null;
  let widgetId: string | null = null;

  return {
    attach(next) {
      container = next;
    },
    async token() {
      const api = await loadScript();
      const host = container ?? document.body;
      if (widgetId) {
        api.remove(widgetId);
        widgetId = null;
      }
      return new Promise<string>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('turnstile timeout')), TOKEN_TIMEOUT_MS);
        const done = (fn: () => void) => {
          clearTimeout(timer);
          fn();
        };
        widgetId = api.render(host, {
          sitekey: siteKey,
          action: 'reading',
          appearance: 'interaction-only',
          language,
          callback: (token: string) => done(() => resolve(token)),
          'error-callback': () => done(() => reject(new Error('turnstile error'))),
          'timeout-callback': () => done(() => reject(new Error('turnstile timeout'))),
        });
      });
    },
  };
}

/** Previews and tests: no network, a fixed token. */
export function fakeTokenSource(token = 'mock-turnstile-token'): TokenSource {
  return {
    attach() {},
    async token() {
      return token;
    },
  };
}
