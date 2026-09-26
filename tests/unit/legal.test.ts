import { describe, expect, it } from 'vitest';

import { PREVIEW_PLACEHOLDERS, publicKeyProblem, renderLegal, resolveLegalValues, sha256Source } from '../../src/lib/legal';

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
