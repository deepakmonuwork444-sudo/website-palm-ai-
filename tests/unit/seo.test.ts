import { describe, expect, it } from 'vitest';

import { PAGES, registryProblems, type PageEntry } from '../../src/config/pages';
import { canonicalUrl, charCount, hreflangLinks, robotsContent } from '../../src/lib/seo';

describe('hreflang builder', () => {
  it('pairs the English and Hindi home pages with x-default → English, on both sides', () => {
    const expected = [
      { hreflang: 'en', href: 'https://palmsays.com/' },
      { hreflang: 'hi', href: 'https://palmsays.com/hi/' },
      { hreflang: 'x-default', href: 'https://palmsays.com/' },
    ];
    expect(hreflangLinks('/')).toEqual(expected);
    expect(hreflangLinks('/hi/')).toEqual(expected);
    expect(hreflangLinks('/app/')).toEqual(hreflangLinks('/hi/app/'));
  });

  it('gives nothing to pages without a live twin, noindex pages and unknown pages', () => {
    expect(hreflangLinks('/privacy')).toEqual([]);
    expect(hreflangLinks('/404')).toEqual([]);
    expect(hreflangLinks('/nope/')).toEqual([]);
  });

  it('never emits a one-sided pair', () => {
    const pages: PageEntry[] = [
      { path: '/a/', locale: 'en', indexable: true, sitemap: 'core', twin: '/hi/a/' },
      { path: '/hi/a/', locale: 'hi', indexable: true, sitemap: 'hi' },
    ];
    expect(hreflangLinks('/a/', pages)).toEqual([]);
    expect(registryProblems(pages)).toContain('/a/: twin /hi/a/ does not point back');
  });

  it('drops the pair when the twin is noindex', () => {
    const pages: PageEntry[] = [
      { path: '/a/', locale: 'en', indexable: true, sitemap: 'core', twin: '/hi/a/' },
      { path: '/hi/a/', locale: 'hi', indexable: false, twin: '/a/' },
    ];
    expect(hreflangLinks('/a/', pages)).toEqual([]);
  });
});

describe('page registry', () => {
  it('has no problems', () => {
    expect(registryProblems(PAGES)).toEqual([]);
  });

  it('keeps the frozen legal URLs and the noindex utility pages', () => {
    for (const path of ['/privacy', '/terms', '/delete-account', '/reset-password']) {
      expect(PAGES.some((page) => page.path === path)).toBe(true);
    }
    for (const path of ['/delete-account', '/reset-password', '/404']) {
      expect(PAGES.find((page) => page.path === path)?.indexable).toBe(false);
    }
  });

  it('flags indexable pages without a sitemap group and Hindi pages outside sitemap-hi', () => {
    expect(registryProblems([{ path: '/x/', locale: 'en', indexable: true }])).toEqual([
      '/x/: indexable but in no sitemap group',
    ]);
    expect(registryProblems([{ path: '/hi/x/', locale: 'hi', indexable: true, sitemap: 'core' }])).toEqual([
      '/hi/x/: Hindi pages belong in sitemap-hi',
    ]);
  });
});

describe('head helpers', () => {
  it('writes a self-referencing absolute canonical', () => {
    expect(canonicalUrl('/hi/app/')).toBe('https://palmsays.com/hi/app/');
  });

  it('noindexes previews and utility pages', () => {
    expect(robotsContent(true, true)).toBe('noindex, nofollow');
    expect(robotsContent(false, false)).toBe('noindex, nofollow');
    expect(robotsContent(true, false)).toBe('index, follow, max-image-preview:large');
  });

  it('counts Devanagari by code points', () => {
    expect(charCount('हृदय रेखा')).toBe(9);
  });
});
