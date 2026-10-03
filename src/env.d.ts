/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** `production` for the live site; anything else (or unset) builds a noindex preview. */
  readonly PUBLIC_ENV?: string;
  /** Supabase (or, after WEB-SRV-002, api.palmsays.com) URL for the legacy account pages. Public. */
  readonly PUBLIC_SUPABASE_URL?: string;
  /** The publishable (anon) key. Public by design; never an `sb_secret_` key. */
  readonly PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  /** Web reading (src/lib/reading/config.ts): `mock` | `live` | `off`; honoured on preview builds only. */
  readonly PUBLIC_READING_MODE?: string;
  /** Preview builds only: another https proxy in front of Supabase (never *.supabase.co). Production uses site.apiUrl. */
  readonly PUBLIC_API_URL?: string;
  /** Cloudflare Turnstile site key of the palmsays.com widget. Public by design. */
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
  /** Google Web client ID (the app's, shared: one Google user = one account). Public by design. Without it the Google button is hidden (email code still works). */
  readonly PUBLIC_GOOGLE_WEB_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
