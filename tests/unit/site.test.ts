import { describe, expect, it } from 'vitest';

import { absoluteUrl, assetLinksJson, fingerprintProblems, playListingUrl, playStoreUrl, site } from '../../src/config/site';

const SHA = Array.from({ length: 32 }, (_, i) => (i + 16).toString(16).toUpperCase().padStart(2, '0')).join(':');

describe('site config', () => {
  it('holds the owner-decided brand, domain and the app package', () => {
    expect(site.brand).toBe('PalmSays');
    expect(site.baseUrl).toBe('https://palmsays.com');
    expect(site.playPackage).toBe('com.palmreadai.app');
    expect(site.webReadingEnabled).toBe(false);
    expect(site.appPrices).toMatchObject({ planFromPerMonth: 149, packFrom: 199, verified: false });
  });
});

describe('playStoreUrl', () => {
  it('builds the Play link with an encoded utm referrer', () => {
    const url = new URL(playStoreUrl({ medium: 'app_page', campaign: 'get' }));
    expect(url.origin + url.pathname).toBe('https://play.google.com/store/apps/details');
    expect(url.searchParams.get('id')).toBe('com.palmreadai.app');
    const referrer = new URLSearchParams(url.searchParams.get('referrer') ?? '');
    expect(Object.fromEntries(referrer)).toEqual({ utm_source: 'web', utm_medium: 'app_page', utm_campaign: 'get' });
    expect(playStoreUrl({ medium: 'home', campaign: 'hero' })).toContain(
      'referrer=utm_source%3Dweb%26utm_medium%3Dhome%26utm_campaign%3Dhero',
    );
  });

  it('adds hl=hi for Hindi pages only', () => {
    expect(playStoreUrl({ medium: 'home', campaign: 'x', locale: 'hi' })).toMatch(/&hl=hi$/);
    expect(playStoreUrl({ medium: 'home', campaign: 'x', locale: 'en' })).not.toContain('hl=');
  });

  it('refuses utm tokens that would break the referrer', () => {
    expect(() => playStoreUrl({ medium: 'Home Page', campaign: 'x' })).toThrow(/utm_medium/);
    expect(() => playStoreUrl({ medium: 'home', campaign: 'a&b=c' })).toThrow(/utm_campaign/);
    expect(() => playStoreUrl({ medium: '', campaign: 'x' })).toThrow();
  });

  it('gives the plain listing for structured data', () => {
    expect(playListingUrl()).toBe('https://play.google.com/store/apps/details?id=com.palmreadai.app');
  });
});

describe('absoluteUrl', () => {
  it('joins the base URL and a root-relative path', () => {
    expect(absoluteUrl('/')).toBe('https://palmsays.com/');
    expect(absoluteUrl('/hi/app/')).toBe('https://palmsays.com/hi/app/');
    expect(absoluteUrl('/app/', 'https://preview.example.dev/')).toBe('https://preview.example.dev/app/');
  });
  it('rejects relative paths', () => {
    expect(() => absoluteUrl('app/')).toThrow();
  });
});

describe('assetlinks', () => {
  it('is not built while the fingerprint list is empty (never faked)', () => {
    expect(assetLinksJson('com.palmreadai.app', [])).toBeNull();
  });
  it('builds a valid statement from well-formed fingerprints', () => {
    const json = assetLinksJson('com.palmreadai.app', [SHA.toLowerCase()]);
    const parsed = JSON.parse(json ?? '');
    expect(parsed[0].relation).toEqual(['delegate_permission/common.handle_all_urls']);
    expect(parsed[0].target).toEqual({
      namespace: 'android_app',
      package_name: 'com.palmreadai.app',
      sha256_cert_fingerprints: [SHA],
    });
  });
  it('rejects malformed or duplicate fingerprints', () => {
    expect(fingerprintProblems(['AB:CD'])).toHaveLength(1);
    expect(fingerprintProblems([SHA, SHA.toLowerCase()])).toContain('a fingerprint is listed twice');
    expect(() => assetLinksJson('com.palmreadai.app', ['nope'])).toThrow(/assetlinks/);
  });
});
