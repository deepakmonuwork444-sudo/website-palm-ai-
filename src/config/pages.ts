import type { Locale } from './site';

/**
 * Registry of every built HTML page. The sitemaps, hreflang tags, nav/footer
 * links and scripts/check-web.mjs all read this, so they cannot drift apart.
 * Add a page here in the same commit that adds its route (ARCHITECTURE.md §3).
 */

export const SITEMAP_GROUPS = ['core', 'guides', 'tools', 'blog', 'hi'] as const;
export type SitemapGroup = (typeof SITEMAP_GROUPS)[number];

export interface PageEntry {
  /** The canonical path as the host serves it (`/app/`; the legacy legal pages are `/privacy`). */
  path: string;
  locale: Locale;
  /** false = `noindex`, never in a sitemap (F8). */
  indexable: boolean;
  /** Required for indexable pages (SEO_PLAYBOOK.md §9). */
  sitemap?: SitemapGroup;
  /** The translation's path. Only set when both pages are live (hreflang pairs, §7). */
  twin?: string;
  /** Last real content change, YYYY-MM-DD (sitemap `lastmod`). */
  lastmod?: string;
  /** Short link text for generated lists (llms.txt, footer), when the page has one. */
  label?: string;
}

export const PAGES: readonly PageEntry[] = [
  { path: '/', locale: 'en', indexable: true, sitemap: 'core', twin: '/hi/', lastmod: '2026-09-26' },
  { path: '/app/', locale: 'en', indexable: true, sitemap: 'core', twin: '/hi/app/', lastmod: '2026-09-26' },
  { path: '/hi/', locale: 'hi', indexable: true, sitemap: 'hi', twin: '/', lastmod: '2026-09-26' },
  { path: '/hi/app/', locale: 'hi', indexable: true, sitemap: 'hi', twin: '/app/', lastmod: '2026-09-26' },
  // Frozen legacy legal URLs (F3): built as /privacy.html etc.; Workers serves them without ".html".
  { path: '/privacy', locale: 'en', indexable: true, sitemap: 'core', lastmod: '2026-09-25' },
  { path: '/terms', locale: 'en', indexable: true, sitemap: 'core', lastmod: '2026-09-25' },
  { path: '/delete-account', locale: 'en', indexable: false },
  { path: '/reset-password', locale: 'en', indexable: false },
  { path: '/404', locale: 'en', indexable: false },
  // The web reading (WEB-FEAT-026): noindex, never in a sitemap (F8). One route for both languages.
  { path: '/reading/', locale: 'en', indexable: false },
  // Guides (src/content/guides/*.mdx, WEB-FEAT-006–010, 038, 042, 069). No hreflang until a reviewed Hindi twin exists.
  { path: '/palm-reading/', locale: 'en', indexable: true, sitemap: 'core', lastmod: '2026-09-26', label: 'How to read palm lines' },
  { path: '/hand-lines/', locale: 'en', indexable: true, sitemap: 'core', lastmod: '2026-09-26', label: 'Lines on your palm' },
  { path: '/heart-line/', locale: 'en', indexable: true, sitemap: 'core', lastmod: '2026-09-26', label: 'Heart line' },
  { path: '/head-line/', locale: 'en', indexable: true, sitemap: 'core', lastmod: '2026-09-26', label: 'Head line' },
  { path: '/life-line/', locale: 'en', indexable: true, sitemap: 'core', lastmod: '2026-09-26', label: 'Life line' },
  { path: '/fate-line/', locale: 'en', indexable: true, sitemap: 'core', lastmod: '2026-09-26', label: 'Fate line' },
  { path: '/is-palmistry-real/', locale: 'en', indexable: true, sitemap: 'core', lastmod: '2026-09-26', label: 'Is palmistry true?' },
  { path: '/which-hand-to-read/', locale: 'en', indexable: true, sitemap: 'core', lastmod: '2026-09-26', label: 'Which hand to read' },
  { path: '/marriage-line/', locale: 'en', indexable: true, sitemap: 'guides', lastmod: '2026-09-26', label: 'Marriage line' },
  { path: '/head-line/double/', locale: 'en', indexable: true, sitemap: 'guides', lastmod: '2026-09-26', label: 'Double head line' },
  { path: '/simian-line/', locale: 'en', indexable: true, sitemap: 'guides', lastmod: '2026-09-26', label: 'Simian line' },
  // Author page stub: noindex until the owner sends the full bio (SEO_PLAYBOOK.md §14).
  { path: '/about/deepak-chauhan/', locale: 'en', indexable: false },
  // Tools (src/pages/tools/, WEB-FEAT-012, 021–023, 047–051; slugs from KEYWORD_MAP.md §3). English only until /hi/tools/ is reviewed.
  { path: '/tools/', locale: 'en', indexable: true, sitemap: 'tools', lastmod: '2026-09-26', label: 'Free palm reading tools' },
  { path: '/tools/palm-photo-checker/', locale: 'en', indexable: true, sitemap: 'tools', lastmod: '2026-09-26', label: 'Palm photo checker' },
  { path: '/tools/heart-line-finder/', locale: 'en', indexable: true, sitemap: 'tools', lastmod: '2026-09-26', label: 'Heart line finder' },
  { path: '/tools/head-line-finder/', locale: 'en', indexable: true, sitemap: 'tools', lastmod: '2026-09-26', label: 'Head line finder' },
  { path: '/tools/life-line-finder/', locale: 'en', indexable: true, sitemap: 'tools', lastmod: '2026-09-26', label: 'Life line finder' },
  { path: '/tools/fate-line-finder/', locale: 'en', indexable: true, sitemap: 'tools', lastmod: '2026-09-26', label: 'Fate line finder' },
  { path: '/tools/which-hand-quiz/', locale: 'en', indexable: true, sitemap: 'tools', lastmod: '2026-09-26', label: 'Which-hand quiz' },
  { path: '/tools/hand-type-quiz/', locale: 'en', indexable: true, sitemap: 'tools', lastmod: '2026-09-26', label: 'Hand type quiz' },
  { path: '/tools/palm-signs-checker/', locale: 'en', indexable: true, sitemap: 'tools', lastmod: '2026-09-26', label: 'Palm signs checker' },
  { path: '/tools/palm-map/', locale: 'en', indexable: true, sitemap: 'tools', lastmod: '2026-09-26', label: 'Interactive palm map' },
  { path: '/tools/palm-reading-quiz/', locale: 'en', indexable: true, sitemap: 'tools', lastmod: '2026-09-26', label: 'Palm reading quiz' },
  // Tool 2 needs the scanning server: noindex while site.webReadingEnabled is false (flip both with WEB-FEAT-047; a unit test keeps them in step).
  { path: '/tools/palm-line-finder/', locale: 'en', indexable: false, label: 'Palm line finder' },
];

export function findPage(path: string, pages: readonly PageEntry[] = PAGES): PageEntry | undefined {
  return pages.find((page) => page.path === path);
}

/** True when a page exists in the build; links to pages that don't exist yet are not rendered. */
export function isLive(path: string, pages: readonly PageEntry[] = PAGES): boolean {
  const bare = path.split('#')[0] || '/';
  return pages.some((page) => page.path === bare);
}

/** Problems in the registry itself (checked by unit tests and check-web). */
export function registryProblems(pages: readonly PageEntry[] = PAGES): string[] {
  const problems: string[] = [];
  const paths = new Set<string>();
  for (const page of pages) {
    if (paths.has(page.path)) problems.push(`${page.path}: listed twice`);
    paths.add(page.path);
    if (page.indexable && !page.sitemap) problems.push(`${page.path}: indexable but in no sitemap group`);
    if (!page.indexable && page.sitemap) problems.push(`${page.path}: noindex but in a sitemap group`);
    if (page.indexable && page.locale === 'hi' && page.sitemap !== 'hi') problems.push(`${page.path}: Hindi pages belong in sitemap-hi`);
    if (page.lastmod && !/^\d{4}-\d{2}-\d{2}$/.test(page.lastmod)) problems.push(`${page.path}: bad lastmod`);
    if (page.twin) {
      const twin = pages.find((other) => other.path === page.twin);
      if (!twin) problems.push(`${page.path}: twin ${page.twin} is not a page`);
      else {
        if (twin.twin !== page.path) problems.push(`${page.path}: twin ${page.twin} does not point back`);
        if (twin.locale === page.locale) problems.push(`${page.path}: twin has the same locale`);
        if (!twin.indexable || !page.indexable) problems.push(`${page.path}: hreflang twins must both be indexable`);
      }
    }
  }
  return problems;
}
