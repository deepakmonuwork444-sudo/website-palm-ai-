import { describe, expect, it } from 'vitest';

import { PAGES, SITEMAP_GROUPS, type PageEntry } from '../../src/config/pages';
import { hreflangLinks } from '../../src/lib/seo';
import { activeGroups, sitemapIndexXml, sitemapPages, sitemapXml } from '../../src/lib/sitemap';

const fixture: PageEntry[] = [
  { path: '/', locale: 'en', indexable: true, sitemap: 'core', twin: '/hi/', lastmod: '2026-09-26' },
  { path: '/hi/', locale: 'hi', indexable: true, sitemap: 'hi', twin: '/', lastmod: '2026-09-20' },
  { path: '/reading/', locale: 'en', indexable: false },
  { path: '/account/', locale: 'en', indexable: false },
  { path: '/tools/', locale: 'en', indexable: true, sitemap: 'tools' },
];

describe('sitemap filter', () => {
  it('lists only indexable pages of the group (never /reading/ or /account/)', () => {
    expect(sitemapPages('core', fixture).map((page) => page.path)).toEqual(['/']);
    const all = SITEMAP_GROUPS.flatMap((group) => sitemapPages(group, fixture).map((page) => page.path));
    expect(all).not.toContain('/reading/');
    expect(all).not.toContain('/account/');
  });

  it('skips empty groups', () => {
    expect(activeGroups(fixture)).toEqual(['core', 'tools', 'hi']);
    // The live registry: exactly the groups that have at least one indexable page, in SITEMAP_GROUPS order.
    const used = SITEMAP_GROUPS.filter((group) => PAGES.some((page) => page.indexable && page.sitemap === group));
    expect(activeGroups(PAGES)).toEqual(used);
    expect(activeGroups(PAGES)).toEqual(expect.arrayContaining(['core', 'guides', 'hi']));
  });

  it('writes hreflang alternates identical to the head tags', () => {
    const xml = sitemapXml('core', fixture, 'https://palmsays.com');
    expect(xml).toContain('<loc>https://palmsays.com/</loc>');
    expect(xml).toContain('<lastmod>2026-09-26</lastmod>');
    for (const link of hreflangLinks('/', fixture)) {
      expect(xml).toContain(`<xhtml:link rel="alternate" hreflang="${link.hreflang}" href="${link.href}"/>`);
    }
    expect(sitemapXml('tools', fixture)).not.toContain('xhtml:link');
  });

  it('indexes every non-empty group', () => {
    const xml = sitemapIndexXml(fixture, 'https://palmsays.com');
    expect(xml).toContain('<loc>https://palmsays.com/sitemap-core.xml</loc>');
    expect(xml).toContain('<loc>https://palmsays.com/sitemap-hi.xml</loc>');
    expect(xml).toContain('<loc>https://palmsays.com/sitemap-tools.xml</loc>');
    expect(xml).not.toContain('sitemap-blog.xml');
  });

  it('covers every indexable registered page exactly once', () => {
    const listed = activeGroups().flatMap((group) => sitemapPages(group).map((page) => page.path));
    const indexable = PAGES.filter((page) => page.indexable).map((page) => page.path);
    expect([...listed].sort()).toEqual([...indexable].sort());
  });
});
