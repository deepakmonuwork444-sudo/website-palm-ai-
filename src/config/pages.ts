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
  // Legal pages in the site layout (WEB-FEAT-013, WEB-DEC-029). English only: the app and Play link the English text.
  { path: '/privacy/', locale: 'en', indexable: true, sitemap: 'core', lastmod: '2026-10-04', label: 'Privacy policy' },
  { path: '/terms/', locale: 'en', indexable: true, sitemap: 'core', lastmod: '2026-10-04', label: 'Terms of use' },
  // Refund policy (2026-10-04): matches terms section 8 (purchases and refunds through Google Play).
  { path: '/refunds/', locale: 'en', indexable: true, sitemap: 'core', lastmod: '2026-10-04', label: 'Refund policy' },
  { path: '/delete-account/', locale: 'en', indexable: false },
  { path: '/reset-password/', locale: 'en', indexable: false },
  // Frozen legacy legal URLs (F3): public/_redirects sends them to the pages above with a 301. The small
  // fallback files behind the redirect (/privacy.html etc.) are noindex and never in a sitemap.
  { path: '/privacy', locale: 'en', indexable: false },
  { path: '/terms', locale: 'en', indexable: false },
  { path: '/delete-account', locale: 'en', indexable: false },
  { path: '/reset-password', locale: 'en', indexable: false },
  // Trust pages (WEB-FEAT-035, SEO_PLAYBOOK.md §14). English only until a reviewed Hindi twin exists.
  { path: '/about/', locale: 'en', indexable: true, sitemap: 'core', lastmod: '2026-10-04', label: 'About PalmSays' },
  { path: '/editorial-policy/', locale: 'en', indexable: true, sitemap: 'core', lastmod: '2026-09-28', label: 'Editorial policy' },
  { path: '/404', locale: 'en', indexable: false },
  // The web reading (WEB-FEAT-026): noindex, never in a sitemap (F8). One route for both languages.
  { path: '/reading/', locale: 'en', indexable: false },
  // Sign-in and the account (WEB-FEAT-029/062): noindex, never in a sitemap (F8). Two pages, no hreflang pair
  // (twins must both be indexable); the language switch links them (BaseLayout langPath).
  { path: '/account/', locale: 'en', indexable: false },
  { path: '/hi/account/', locale: 'hi', indexable: false },
  // Guides (src/content/guides/*.mdx, WEB-FEAT-006–010, 038, 042, 069). No hreflang until a reviewed Hindi twin exists.
  { path: '/palm-reading/', locale: 'en', indexable: true, sitemap: 'core', lastmod: '2026-09-28', label: 'How to read palm lines' },
  { path: '/hand-lines/', locale: 'en', indexable: true, sitemap: 'core', lastmod: '2026-09-28', label: 'Lines on your palm' },
  { path: '/heart-line/', locale: 'en', indexable: true, sitemap: 'core', lastmod: '2026-09-28', label: 'Heart line' },
  { path: '/head-line/', locale: 'en', indexable: true, sitemap: 'core', lastmod: '2026-09-28', label: 'Head line' },
  { path: '/life-line/', locale: 'en', indexable: true, sitemap: 'core', lastmod: '2026-09-28', label: 'Life line' },
  { path: '/fate-line/', locale: 'en', indexable: true, sitemap: 'core', lastmod: '2026-09-28', label: 'Fate line' },
  { path: '/is-palmistry-real/', locale: 'en', indexable: true, sitemap: 'core', lastmod: '2026-09-28', label: 'Is palmistry true?' },
  { path: '/which-hand-to-read/', locale: 'en', indexable: true, sitemap: 'core', lastmod: '2026-09-28', label: 'Which hand to read' },
  { path: '/marriage-line/', locale: 'en', indexable: true, sitemap: 'guides', lastmod: '2026-09-28', label: 'Marriage line' },
  { path: '/head-line/double/', locale: 'en', indexable: true, sitemap: 'guides', lastmod: '2026-09-26', label: 'Double head line' },
  { path: '/simian-line/', locale: 'en', indexable: true, sitemap: 'guides', lastmod: '2026-09-28', label: 'Simian line' },
  // P2 guides (SEMANTIC_SEO_PLAN.md row 2.5, WEB-DEC-054): mounts, hand types and fingers sit under /palm-reading/, the sun line and crosses under /hand-lines/.
  { path: '/palm-mounts/', locale: 'en', indexable: true, sitemap: 'guides', lastmod: '2026-09-28', label: 'Palm mounts' },
  { path: '/hand-types/', locale: 'en', indexable: true, sitemap: 'guides', lastmod: '2026-09-28', label: 'Hand types in palmistry' },
  { path: '/palmistry-fingers/', locale: 'en', indexable: true, sitemap: 'guides', lastmod: '2026-09-28', label: 'Fingers in palmistry' },
  { path: '/sun-line/', locale: 'en', indexable: true, sitemap: 'guides', lastmod: '2026-09-28', label: 'Sun line' },
  { path: '/palm-crosses/', locale: 'en', indexable: true, sitemap: 'guides', lastmod: '2026-09-28', label: 'Crosses on the palm' },
  // Phase 3 guides (SEMANTIC_SEO_PLAN.md §6.2 N-8 to N-11): the M, signs and money line under /hand-lines/, career palmistry under /palm-reading/.
  { path: '/palmistry-m/', locale: 'en', indexable: true, sitemap: 'guides', lastmod: '2026-10-01', label: 'M on the palm' },
  { path: '/lucky-signs/', locale: 'en', indexable: true, sitemap: 'guides', lastmod: '2026-10-01', label: 'Lucky signs on the palm' },
  { path: '/money-line/', locale: 'en', indexable: true, sitemap: 'guides', lastmod: '2026-10-01', label: 'Money line' },
  { path: '/career-palmistry/', locale: 'en', indexable: true, sitemap: 'guides', lastmod: '2026-10-01', label: 'Career palmistry' },
  // Phase 3 guides B (§6.2 N-12, N-13, N-17, N-19): broken life line under /life-line/, Mercury and children lines
  // under /hand-lines/, the history under /palm-reading/. Broken, Mercury and children are YMYL: preview only until owner-ok.
  { path: '/life-line/broken/', locale: 'en', indexable: true, sitemap: 'guides', lastmod: '2026-10-01', label: 'Broken life line' },
  { path: '/mercury-line/', locale: 'en', indexable: true, sitemap: 'guides', lastmod: '2026-10-01', label: 'Mercury line' },
  { path: '/children-line/', locale: 'en', indexable: true, sitemap: 'guides', lastmod: '2026-10-01', label: 'Children lines' },
  { path: '/history-of-palmistry/', locale: 'en', indexable: true, sitemap: 'guides', lastmod: '2026-10-01', label: 'History of palmistry' },
  // The glossary = the entity registry page (src/pages/palmistry-terms/, WEB-DEC-053). /hi/palmistry-terms/ waits for the Hindi reviewer.
  { path: '/palmistry-terms/', locale: 'en', indexable: true, sitemap: 'core', lastmod: '2026-09-28', label: 'Palmistry terms' },
  // Blog (WEB-DEC-057): the index, then one row per post (src/content/blog/<slug>.mdx, path /blog/<slug>/), sitemap group 'blog'.
  { path: '/blog/', locale: 'en', indexable: true, sitemap: 'blog', lastmod: '2026-10-01', label: 'Blog' },
  // Phase 3 posts (SEMANTIC_SEO_PLAN.md §6.2 N-7, N-14, N-15; WEB-FEAT-052).
  { path: '/blog/rarest-palm-lines/', locale: 'en', indexable: true, sitemap: 'blog', lastmod: '2026-10-01', label: 'Rare palm lines' },
  { path: '/blog/do-palm-lines-change/', locale: 'en', indexable: true, sitemap: 'blog', lastmod: '2026-10-01', label: 'Do palm lines change?' },
  { path: '/blog/best-palm-reading-apps/', locale: 'en', indexable: true, sitemap: 'blog', lastmod: '2026-10-01', label: 'Best palm reading apps' },
  { path: '/blog/palm-reading-chatgpt-vs-palm-scanner/', locale: 'en', indexable: true, sitemap: 'blog', lastmod: '2026-10-01', label: 'ChatGPT vs palm scanner' },
  // Author page (SEO_PLAYBOOK.md §14): indexable since the owner sent his photo and story (2026-10-04).
  { path: '/about/deepak-chauhan/', locale: 'en', indexable: true, sitemap: 'core', lastmod: '2026-10-04', label: 'Deepak Chauhan, founder' },
  // Tools (src/pages/tools/, WEB-FEAT-012, 021–023, 047–051; slugs from KEYWORD_MAP.md §3). English only until /hi/tools/ is reviewed.
  { path: '/tools/', locale: 'en', indexable: true, sitemap: 'tools', lastmod: '2026-09-26', label: 'Free palm reading tools' },
  { path: '/tools/palm-photo-checker/', locale: 'en', indexable: true, sitemap: 'tools', lastmod: '2026-09-26', label: 'Palm photo checker' },
  { path: '/tools/heart-line-finder/', locale: 'en', indexable: true, sitemap: 'tools', lastmod: '2026-09-26', label: 'Heart line finder' },
  { path: '/tools/head-line-finder/', locale: 'en', indexable: true, sitemap: 'tools', lastmod: '2026-09-26', label: 'Head line finder' },
  { path: '/tools/life-line-finder/', locale: 'en', indexable: true, sitemap: 'tools', lastmod: '2026-09-26', label: 'Life line finder' },
  { path: '/tools/fate-line-finder/', locale: 'en', indexable: true, sitemap: 'tools', lastmod: '2026-09-26', label: 'Fate line finder' },
  { path: '/tools/which-hand-quiz/', locale: 'en', indexable: true, sitemap: 'tools', lastmod: '2026-09-26', label: 'Which-hand quiz' },
  { path: '/tools/hand-type-quiz/', locale: 'en', indexable: true, sitemap: 'tools', lastmod: '2026-09-26', label: 'Hand type from your photo' },
  // v3 photo tools (2026-09-26): measured on the visitor's own photo, on the device.
  { path: '/tools/finger-reader/', locale: 'en', indexable: true, sitemap: 'tools', lastmod: '2026-09-26', label: 'Finger reader' },
  { path: '/tools/left-vs-right-palm/', locale: 'en', indexable: true, sitemap: 'tools', lastmod: '2026-09-26', label: 'Left vs right hand' },
  { path: '/tools/palm-signs-checker/', locale: 'en', indexable: true, sitemap: 'tools', lastmod: '2026-09-26', label: 'Palm signs checker' },
  { path: '/tools/palm-map/', locale: 'en', indexable: true, sitemap: 'tools', lastmod: '2026-09-26', label: 'Interactive palm map' },
  { path: '/tools/palm-reading-quiz/', locale: 'en', indexable: true, sitemap: 'tools', lastmod: '2026-09-26', label: 'Palm reading quiz' },
  // Tool 2 needs the scanning server's lines-only mode: noindex until LINE_SCAN_LIVE (src/lib/tools/registry.ts; a unit test keeps them in step).
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

/**
 * The best live target for a link on a `locale` page: the translation when it is
 * live, else the English page (lang: 'en', for hreflang on the <a>), else null.
 * Keeps Hindi nav/footer links from vanishing while guides and tools are English only.
 */
export function localizedLink(
  path: string,
  locale: Locale,
  localize: (path: string, locale: Locale) => string,
  pages: readonly PageEntry[] = PAGES,
): { href: string; lang?: Locale } | null {
  const own = localize(path, locale);
  if (isLive(own, pages)) return { href: own };
  if (isLive(path, pages)) return locale === 'en' ? { href: path } : { href: path, lang: 'en' };
  return null;
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
