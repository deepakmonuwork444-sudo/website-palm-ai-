import { PAGES, SITEMAP_GROUPS, type PageEntry, type SitemapGroup } from '../config/pages';
import { absoluteUrl, site } from '../config/site';
import { hreflangLinks } from './seo';

/** Indexable pages of one sitemap group, sorted by path. noindex pages never appear (F8). */
export function sitemapPages(group: SitemapGroup, pages: readonly PageEntry[] = PAGES): PageEntry[] {
  return pages
    .filter((page) => page.indexable && page.sitemap === group)
    .sort((a, b) => a.path.localeCompare(b.path));
}

/** Groups that have at least one page; empty groups get no file and no index entry. */
export function activeGroups(pages: readonly PageEntry[] = PAGES): SitemapGroup[] {
  return SITEMAP_GROUPS.filter((group) => sitemapPages(group, pages).length > 0);
}

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function sitemapXml(
  group: SitemapGroup,
  pages: readonly PageEntry[] = PAGES,
  baseUrl: string = site.baseUrl,
): string {
  const urls = sitemapPages(group, pages).map((page) => {
    const alternates = hreflangLinks(page.path, pages, baseUrl)
      .map((link) => `\n    <xhtml:link rel="alternate" hreflang="${link.hreflang}" href="${escapeXml(link.href)}"/>`)
      .join('');
    const lastmod = page.lastmod ? `\n    <lastmod>${page.lastmod}</lastmod>` : '';
    return `  <url>\n    <loc>${escapeXml(absoluteUrl(page.path, baseUrl))}</loc>${lastmod}${alternates}\n  </url>`;
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}

export function sitemapIndexXml(pages: readonly PageEntry[] = PAGES, baseUrl: string = site.baseUrl): string {
  const entries = activeGroups(pages).map((group) => {
    const lastmod = sitemapPages(group, pages)
      .map((page) => page.lastmod ?? '')
      .sort()
      .pop();
    return `  <sitemap>\n    <loc>${absoluteUrl(`/sitemap-${group}.xml`, baseUrl)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </sitemap>`;
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</sitemapindex>',
    '',
  ].join('\n');
}
