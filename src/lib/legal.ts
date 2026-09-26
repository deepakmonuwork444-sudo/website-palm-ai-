import { createHash } from 'node:crypto';

/**
 * Renders the four frozen legal pages (ARCHITECTURE.md §11 F3):
 * /privacy.html, /terms.html, /delete-account.html, /reset-password.html.
 *
 * The templates in src/legal/ were copied on 2026-09-26 from the app repo's
 * web/ folder (working tree on top of commit 44cb4fc) and keep its
 * placeholders, so the brand change is exactly {{BRAND}} → site.brand.
 * This is a port of the app's scripts/build-web.mjs: only PUBLIC values are
 * injected (Supabase URL + publishable key), and only into the pages that ask
 * for them via {{CONFIG_SCRIPT_HASH}}; every inline script must be allowed by
 * its sha256 in the page's own CSP, or rendering fails.
 */

export const LEGAL_PAGES = ['privacy', 'terms', 'delete-account', 'reset-password'] as const;
export type LegalPage = (typeof LEGAL_PAGES)[number];

export interface LegalValues {
  brand: string;
  baseUrl: string;
  operatorName: string;
  contactEmail: string;
  supabaseUrl: string;
  supabaseKey: string;
}

export interface LegalInputs {
  brand: string;
  baseUrl: string;
  operatorName: string | null | undefined;
  contactEmail: string | null | undefined;
  supabaseUrl: string | null | undefined;
  supabaseKey: string | null | undefined;
}

/** Visible placeholders for preview builds; check-web refuses them in production. */
export const PREVIEW_PLACEHOLDERS = {
  operatorName: '[OWNER NAME: set company.name in src/config/site.ts]',
  contactEmail: 'owner@example.invalid',
  supabaseUrl: 'https://preview.invalid',
  supabaseKey: 'sb_publishable_preview',
} as const;

/**
 * Why `key` must not be published in a web page, or null when it is a public
 * key: a legacy JWT whose role is "anon", or an `sb_publishable_…` key.
 * Refused: `sb_secret_…`, a JWT with any other role (service_role), anything unreadable.
 */
export function publicKeyProblem(key: unknown): string | null {
  if (typeof key !== 'string' || key.trim() === '') return 'an empty key';
  const value = key.trim();
  if (value.startsWith('sb_secret_')) return 'a secret key (sb_secret_...)';
  if (value.startsWith('sb_publishable_')) return null;
  const parts = value.split('.');
  if (parts.length !== 3) return 'a key that is neither an anon JWT nor a publishable key';
  let payload: unknown;
  try {
    payload = JSON.parse(Buffer.from(parts[1] ?? '', 'base64url').toString('utf8'));
  } catch {
    return 'a JWT that cannot be read';
  }
  const role = payload !== null && typeof payload === 'object' ? (payload as { role?: unknown }).role : undefined;
  if (role !== 'anon') return `a key with role "${String(role ?? 'none')}"`;
  return null;
}

/**
 * Fills missing values with visible placeholders on a preview build; on a
 * production build a missing value is an error (the legal pages must name the
 * real operator and contact).
 */
export function resolveLegalValues(inputs: LegalInputs, production: boolean): LegalValues {
  const missing: string[] = [];
  const pick = (value: string | null | undefined, name: string, placeholder: string): string => {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
    if (production) missing.push(name);
    return placeholder;
  };
  const values: LegalValues = {
    brand: inputs.brand,
    baseUrl: inputs.baseUrl.replace(/\/+$/, ''),
    operatorName: pick(inputs.operatorName, 'company.name (src/config/site.ts)', PREVIEW_PLACEHOLDERS.operatorName),
    contactEmail: pick(inputs.contactEmail, 'company.email (src/config/site.ts)', PREVIEW_PLACEHOLDERS.contactEmail),
    supabaseUrl: pick(inputs.supabaseUrl, 'PUBLIC_SUPABASE_URL', PREVIEW_PLACEHOLDERS.supabaseUrl),
    supabaseKey: pick(inputs.supabaseKey, 'PUBLIC_SUPABASE_PUBLISHABLE_KEY', PREVIEW_PLACEHOLDERS.supabaseKey),
  };
  if (missing.length) throw new Error(`Legal pages: missing ${missing.join(', ')} for a production build.`);
  const problem = publicKeyProblem(values.supabaseKey);
  if (problem) throw new Error(`Legal pages: refusing to publish ${problem}. Only the publishable (anon) key is public.`);
  let url: URL;
  try {
    url = new URL(values.supabaseUrl);
  } catch {
    throw new Error(`Legal pages: PUBLIC_SUPABASE_URL is not a URL: ${values.supabaseUrl}`);
  }
  if (url.protocol !== 'https:') throw new Error('Legal pages: PUBLIC_SUPABASE_URL must use https.');
  return values;
}

export function sha256Source(text: string): string {
  return `'sha256-${createHash('sha256').update(text, 'utf8').digest('base64')}'`;
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/**
 * Renders one legal template. Throws on a leftover placeholder or an inline
 * script missing from the CSP. `forceNoindex` (preview builds) adds a robots
 * noindex tag to pages that don't already carry one.
 */
export function renderLegal(
  name: string,
  template: string,
  values: LegalValues,
  { forceNoindex = false }: { forceNoindex?: boolean } = {},
): string {
  let html = template
    .replaceAll('{{BRAND}}', escapeHtml(values.brand))
    .replaceAll('{{BASE_URL}}', values.baseUrl)
    .replaceAll('{{OPERATOR_NAME}}', escapeHtml(values.operatorName))
    .replaceAll('{{CONTACT_EMAIL}}', escapeHtml(values.contactEmail));

  if (html.includes('{{CONFIG_SCRIPT_HASH}}')) {
    const body = `window.SUPABASE_URL=${JSON.stringify(values.supabaseUrl)};window.SUPABASE_ANON_KEY=${JSON.stringify(values.supabaseKey)};`;
    // The config must exist before the page's own script reads it: insert it before the first <script.
    html = html.replace('<script', `<script>${body}</script>\n<script`);
    html = html
      .replaceAll('{{CONFIG_SCRIPT_HASH}}', sha256Source(body))
      .replaceAll('{{SUPABASE_ORIGIN}}', new URL(values.supabaseUrl).origin);
  }

  if (forceNoindex && !/<meta name="robots"/.test(html)) {
    html = html.replace(/<meta charset="utf-8" \/>/, '<meta charset="utf-8" />\n<meta name="robots" content="noindex, nofollow" />');
  }

  const leftover = html.match(/\{\{[A-Z_]+\}\}/);
  if (leftover) throw new Error(`${name}: ${leftover[0]} is not filled in by src/lib/legal.ts`);

  const csp = html.match(/http-equiv="Content-Security-Policy" content="([^"]*)"/)?.[1] ?? '';
  for (const [, body] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    const hash = sha256Source(body ?? '');
    if (!csp.includes(hash)) {
      throw new Error(`${name}: an inline script is not in the page's CSP (${hash}). Update the hash in src/legal/${name}.html.`);
    }
  }
  return html;
}
