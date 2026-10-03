/**
 * Reading configuration: which mode runs, where the API is, the public keys.
 *
 * - `off`: the reading is not open yet (site.webReadingEnabled = false). The
 *   page says so honestly and never fakes a reading.
 * - `mock`: previews and screenshots. Runs the app's real pipeline on a stored
 *   real scanner result (src/lib/reading/mock/); nothing leaves the browser.
 * - `live`: the real backend, ONLY through the proxy (site.apiUrl).
 *
 * Production builds follow the flag and nothing else. Preview builds
 * (PUBLIC_ENV ≠ production, always noindex) may switch with `?reading=mock|live|off`
 * or PUBLIC_READING_MODE, so the flow can be tested once the server is deployed
 * without flipping the flag for everyone.
 *
 * Only PUBLIC_* values are read (ARCHITECTURE.md §9): the publishable key and
 * the Turnstile site key are public by design.
 */

import { site } from '../../config/site';

export type ReadingMode = 'off' | 'mock' | 'live';

const MODES: readonly ReadingMode[] = ['off', 'mock', 'live'];

function asMode(value: string | null | undefined): ReadingMode | null {
  const clean = value?.trim().toLowerCase();
  return clean && (MODES as readonly string[]).includes(clean) ? (clean as ReadingMode) : null;
}

export function resolveReadingMode(input: {
  flag: boolean;
  preview: boolean;
  query?: string | null | undefined;
  env?: string | null | undefined;
}): ReadingMode {
  const byFlag: ReadingMode = input.flag ? 'live' : 'off';
  if (!input.preview) return byFlag;
  return asMode(input.query) ?? asMode(input.env) ?? byFlag;
}

/**
 * The API base URL. Never `*.supabase.co` (blocked by Indian ISPs, invariant 4):
 * such an override is ignored. A preview may point at another https proxy (or a
 * local one on http://localhost); production always uses site.apiUrl.
 */
export function resolveApiUrl(input: { preview: boolean; override?: string | null | undefined }, fallback: string = site.apiUrl): string {
  const raw = input.override?.trim().replace(/\/+$/, '');
  if (!input.preview || !raw) return fallback;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return fallback;
  }
  if (/(^|\.)supabase\.(co|in|net)$/i.test(url.hostname)) return fallback;
  const local = url.protocol === 'http:' && /^(localhost|127\.0\.0\.1)$/.test(url.hostname);
  if (url.protocol !== 'https:' && !local) return fallback;
  if (url.pathname !== '/' || url.search || url.hash || url.username) return fallback;
  return url.origin;
}

/** A publishable key only: `sb_publishable_…` or a legacy anon JWT. Secret keys are refused. */
export function acceptPublishableKey(value: string | null | undefined): string | null {
  const key = value?.trim();
  if (!key) return null;
  // Allow-list only: a publishable key, or a JWT whose role is anon. Anything else (a secret key) is refused.
  if (/^sb_publishable_[A-Za-z0-9_-]{10,}$/.test(key)) return key;
  if (/^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(key)) {
    try {
      const payload = JSON.parse(atob(key.split('.')[1]!.replace(/-/g, '+').replace(/_/g, '/'))) as { role?: unknown };
      return payload.role === 'anon' ? key : null;
    } catch {
      return null;
    }
  }
  return null;
}

export interface ReadingConfig {
  mode: ReadingMode;
  preview: boolean;
  apiUrl: string;
  publishableKey: string | null;
  turnstileSiteKey: string | null;
}

const PREVIEW_MODE_KEY = 'palmsays-preview-reading';

/**
 * Previews only: `?reading=live|mock|off` is remembered in this browser, so moving
 * between pages (header menu → /account/) keeps the chosen mode. Production never reads it.
 */
function previewQuery(preview: boolean, query: string | null): string | null {
  if (!preview || typeof localStorage === 'undefined') return query;
  try {
    if (asMode(query)) localStorage.setItem(PREVIEW_MODE_KEY, query as string);
    return query ?? localStorage.getItem(PREVIEW_MODE_KEY);
  } catch {
    return query;
  }
}

/** The live config, read in the browser. */
export function readingConfig(search: string = typeof location === 'undefined' ? '' : location.search): ReadingConfig {
  const env = import.meta.env;
  const preview = env.PUBLIC_ENV?.trim() !== 'production';
  const query = previewQuery(preview, new URLSearchParams(search).get('reading'));
  return {
    mode: resolveReadingMode({ flag: site.webReadingEnabled, preview, query, env: env.PUBLIC_READING_MODE }),
    preview,
    apiUrl: resolveApiUrl({ preview, override: env.PUBLIC_API_URL }),
    publishableKey: acceptPublishableKey(env.PUBLIC_SUPABASE_PUBLISHABLE_KEY),
    turnstileSiteKey: env.PUBLIC_TURNSTILE_SITE_KEY?.trim() || null,
  };
}

/** What a live run still needs; empty = ready. */
export function missingForLive(config: ReadingConfig): string[] {
  const missing: string[] = [];
  if (!config.publishableKey) missing.push('PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  if (!config.turnstileSiteKey) missing.push('PUBLIC_TURNSTILE_SITE_KEY');
  return missing;
}
