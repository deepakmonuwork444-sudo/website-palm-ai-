import { describe, expect, it } from 'vitest';

import { readFileSync } from 'node:fs';

import { findPage } from '../../src/config/pages';
import {
  GRIEVANCE_PLACEHOLDER,
  LEGACY_LEGAL_TARGETS,
  LEGAL_PAGES,
  PREVIEW_PLACEHOLDERS,
  legacyRedirectHtml,
  publicKeyProblem,
  renderLegal,
  resolveCompany,
  resolveLegalValues,
  sha256Source,
} from '../../src/lib/legal';

const jwt = (payload: object) => ['e30', Buffer.from(JSON.stringify(payload)).toString('base64url'), 'sig'].join('.');

const inputs = {
  brand: 'PalmSays',
  baseUrl: 'https://palmsays.com/',
  operatorName: 'Example Operator',
  contactEmail: 'hello@palmsays.com',
  supabaseUrl: 'https://abc.supabase.co',
  supabaseKey: 'sb_publishable_abc',
};

describe('publicKeyProblem', () => {
  it('accepts publishable and anon keys only', () => {
    expect(publicKeyProblem('sb_publishable_x')).toBeNull();
    expect(publicKeyProblem(jwt({ role: 'anon' }))).toBeNull();
    expect(publicKeyProblem('sb_secret_x')).toMatch(/secret/);
    expect(publicKeyProblem(jwt({ role: 'service_role' }))).toMatch(/service_role/);
    expect(publicKeyProblem('')).toMatch(/empty/);
    expect(publicKeyProblem('a.b')).toMatch(/neither/);
  });
});

describe('resolveLegalValues', () => {
  it('fills visible placeholders on a preview build', () => {
    const values = resolveLegalValues(
      { ...inputs, operatorName: null, contactEmail: undefined, supabaseUrl: '', supabaseKey: null },
      false,
    );
    expect(values.operatorName).toBe(PREVIEW_PLACEHOLDERS.operatorName);
    expect(values.contactEmail).toBe(PREVIEW_PLACEHOLDERS.contactEmail);
    expect(values.baseUrl).toBe('https://palmsays.com');
  });

  it('fails a production build that lacks real values', () => {
    expect(() => resolveLegalValues({ ...inputs, operatorName: null }, true)).toThrow(/company\.name/);
    expect(() => resolveLegalValues({ ...inputs, supabaseKey: undefined }, true)).toThrow(/PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  });

  it('refuses a secret key and a non-https URL', () => {
    expect(() => resolveLegalValues({ ...inputs, supabaseKey: 'sb_secret_x' }, true)).toThrow(/refusing/);
    expect(() => resolveLegalValues({ ...inputs, supabaseUrl: 'http://abc.supabase.co' }, true)).toThrow(/https/);
  });
});

describe('renderLegal', () => {
  const values = resolveLegalValues(inputs, true);

  it('fills the brand, address and operator (escaped)', () => {
    const template =
      '<meta charset="utf-8" /><title>{{BRAND}}</title><link href="{{BASE_URL}}/privacy"><p>{{OPERATOR_NAME}} {{CONTACT_EMAIL}}</p>';
    const html = renderLegal('t', template, { ...values, operatorName: 'A & B' });
    expect(html).toContain('<title>PalmSays</title>');
    expect(html).toContain('https://palmsays.com/privacy');
    expect(html).toContain('A &#38; B');
  });

  it('injects the public Supabase config before the page script and allows it by hash', () => {
    const page = `<meta http-equiv="Content-Security-Policy" content="script-src {{CONFIG_SCRIPT_HASH}} ${sha256Source('run()')}; connect-src {{SUPABASE_ORIGIN}}" />
<script>run()</script>`;
    const html = renderLegal('t', page, values);
    const body = 'window.SUPABASE_URL="https://abc.supabase.co";window.SUPABASE_ANON_KEY="sb_publishable_abc";';
    expect(html).toContain(`<script>${body}</script>`);
    expect(html).toContain(sha256Source(body));
    expect(html).toContain('connect-src https://abc.supabase.co');
    expect(html.indexOf(body)).toBeLessThan(html.indexOf('run()</script>'));
  });

  it('fails on an inline script missing from the CSP and on leftover placeholders', () => {
    const unhashed = `<meta http-equiv="Content-Security-Policy" content="script-src 'none'" /><script>x()</script>`;
    expect(() => renderLegal('t', unhashed, values)).toThrow(/not in the page's CSP/);
    expect(() => renderLegal('t', '{{SOMETHING}}', values)).toThrow(/SOMETHING/);
  });

  it('adds noindex on preview builds only when it is missing', () => {
    const plain = '<meta charset="utf-8" /><title>x</title>';
    expect(renderLegal('t', plain, values, { forceNoindex: true })).toContain('<meta name="robots" content="noindex, nofollow" />');
    expect(renderLegal('t', plain, values)).not.toContain('robots');
    const already = '<meta charset="utf-8" /><meta name="robots" content="noindex" />';
    expect(renderLegal('t', already, values, { forceNoindex: true }).match(/name="robots"/g)).toHaveLength(1);
  });
});

describe('resolveCompany (owner item 9)', () => {
  const none = { name: null, email: null, grievanceContact: null };

  it('shows visible placeholders on a preview build that check-web can find', () => {
    const company = resolveCompany(none, false);
    expect(company.name).toBe(PREVIEW_PLACEHOLDERS.operatorName);
    expect(company.email).toBe(PREVIEW_PLACEHOLDERS.contactEmail);
    expect(company.grievanceContact).toBe(GRIEVANCE_PLACEHOLDER);
    expect(company.missing).toEqual(['company.name', 'company.email', 'company.grievanceContact']);
    // scripts/check-web.mjs reports these exact markers (an error on a production build).
    for (const value of [company.name, company.email, company.grievanceContact]) {
      expect(value).toMatch(/\[OWNER NAME|owner@example\.invalid/);
    }
  });

  it('refuses a production build without the real details, and passes with them', () => {
    expect(() => resolveCompany(none, true)).toThrow(/company\.name, company\.email, company\.grievanceContact/);
    const real = { name: 'Example Pvt Ltd', email: 'hello@palmsays.com', grievanceContact: 'A. Person, grievance@palmsays.com' };
    expect(resolveCompany(real, true)).toEqual({ ...real, missing: [] });
  });
});

describe('frozen legal URLs (F3)', () => {
  it('public/_redirects sends all 8 variants to the new pages with a 301', () => {
    const rules = readFileSync('public/_redirects', 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => line.split(/\s+/));
    const expected = LEGAL_PAGES.flatMap((name) => [
      [`/${name}.html`, LEGACY_LEGAL_TARGETS[name], '301'],
      [`/${name}`, LEGACY_LEGAL_TARGETS[name], '301'],
    ]);
    expect(rules).toEqual(expected);
    for (const name of LEGAL_PAGES) {
      expect(LEGACY_LEGAL_TARGETS[name]).toBe(`/${name}/`);
      expect(findPage(LEGACY_LEGAL_TARGETS[name])).toBeDefined();
    }
  });

  it('keeps a noindex fallback file at each .html URL that forwards with the query and #… part', () => {
    for (const name of LEGAL_PAGES) {
      const html = legacyRedirectHtml(name, { brand: 'Palm<Says', baseUrl: 'https://palmsays.com/' });
      const target = LEGACY_LEGAL_TARGETS[name];
      expect(html).toContain('<meta name="robots" content="noindex" />');
      expect(html).toContain(`<link rel="canonical" href="https://palmsays.com${target}" />`);
      expect(html).toContain(`content="0; url=${target}"`);
      expect(html).toContain('Palm&#60;Says');
      expect(html.match(/<h1>/g)).toHaveLength(1);
      const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? '';
      expect(script).toBe(`location.replace("${target}"+location.search+location.hash);`);
      expect(html).toContain(sha256Source(script));
    }
  });

  it('registers the new pages, with delete-account and reset-password noindex', () => {
    expect(findPage('/privacy/')?.indexable).toBe(true);
    expect(findPage('/terms/')?.indexable).toBe(true);
    expect(findPage('/delete-account/')?.indexable).toBe(false);
    expect(findPage('/reset-password/')?.indexable).toBe(false);
    for (const legacy of ['/privacy', '/terms', '/delete-account', '/reset-password']) expect(findPage(legacy)?.indexable).toBe(false);
  });
});
