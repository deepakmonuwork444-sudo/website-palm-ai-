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

/** Visible placeholder for the grievance contact; the "[OWNER NAME" prefix is what check-web looks for. */
export const GRIEVANCE_PLACEHOLDER = '[OWNER NAME: set company.grievanceContact in src/config/site.ts]';

export interface CompanyDetails {
  /** The operator: a person's name or a company's name (an individual operator needs no company or GSTIN). */
  name: string;
  email: string;
  grievanceContact: string;
  /** The Grievance Officer's name; defaults to the operator (a sole operator is their own officer). */
  grievanceOfficer: string;
  /** Town, district, state and country, when published. Optional: no street address is required. */
  location: string | null;
  /** Names of the site.ts fields still showing a placeholder (preview builds only; production throws). */
  missing: string[];
}

/** What site.ts may give: name, email and grievance contact are required; location and officer are optional. */
export interface CompanyInput {
  name: string | null;
  email: string | null;
  grievanceContact: string | null;
  grievanceOfficer?: string | null | undefined;
  location?: string | null | undefined;
}

/**
 * The operator details the trust and legal pages print (owner item 9). A preview build shows
 * visible placeholders, which check-web reports (a warning on preview, an error on production);
 * a production build refuses to render without the real values.
 */
export function resolveCompany(
  company: CompanyInput,
  production: boolean,
): CompanyDetails {
  const missing: string[] = [];
  const pick = (value: string | null, field: string, placeholder: string): string => {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
    missing.push(`company.${field}`);
    return placeholder;
  };
  const name = pick(company.name, 'name', PREVIEW_PLACEHOLDERS.operatorName);
  const details: CompanyDetails = {
    name,
    email: pick(company.email, 'email', PREVIEW_PLACEHOLDERS.contactEmail),
    grievanceContact: pick(company.grievanceContact, 'grievanceContact', GRIEVANCE_PLACEHOLDER),
    grievanceOfficer: company.grievanceOfficer?.trim() || name,
    location: company.location?.trim() || null,
    missing,
  };
  if (production && missing.length) {
    throw new Error(`Trust and legal pages: missing ${missing.join(', ')} in src/config/site.ts for a production build (owner item 9).`);
  }
  return details;
}

/** The four frozen legacy URLs and the page each one now lives at (ARCHITECTURE.md §11 F3). */
export const LEGACY_LEGAL_TARGETS: Record<LegalPage, string> = {
  privacy: '/privacy/',
  terms: '/terms/',
  'delete-account': '/delete-account/',
  'reset-password': '/reset-password/',
};

/**
 * The fallback file kept at a frozen `.html` URL. In production public/_redirects answers
 * these URLs with a 301 before any file is looked at (Workers: "redirects are always followed,
 * regardless of whether or not an asset matches"), so this page is only seen if the redirect
 * is ever removed: it then sends the visitor on, keeping the query and the #… part.
 */
export function legacyRedirectHtml(name: LegalPage, { brand, baseUrl }: { brand: string; baseUrl: string }): string {
  const target = LEGACY_LEGAL_TARGETS[name];
  const script = `location.replace(${JSON.stringify(target)}+location.search+location.hash);`;
  const safeBrand = escapeHtml(brand);
  const absolute = `${baseUrl.replace(/\/+$/, '')}${target}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src ${sha256Source(script)}; base-uri 'none'; form-action 'none'" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<meta http-equiv="refresh" content="0; url=${target}" />
<link rel="canonical" href="${absolute}" />
<title>This page has moved | ${safeBrand}</title>
<script>${script}</script>
</head>
<body>
<h1>This page has moved</h1>
<p><a href="${target}">Open the ${safeBrand} page at ${absolute}</a></p>
</body>
</html>
`;
}

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
