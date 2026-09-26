import { findPage, PAGES, type PageEntry } from '../config/pages';
import { absoluteUrl, site, type Locale } from '../config/site';

export interface HreflangLink {
  hreflang: Locale | 'x-default';
  href: string;
}

/**
 * hreflang links for a page (SEO_PLAYBOOK.md §7): `en` + `hi` + `x-default` → English,
 * only when the page and its twin are both live and indexable. The same function
 * feeds the <head> tags and the sitemap alternates, so they always match.
 */
export function hreflangLinks(
  path: string,
  pages: readonly PageEntry[] = PAGES,
  baseUrl: string = site.baseUrl,
): HreflangLink[] {
  const page = findPage(path, pages);
  if (!page?.indexable || !page.twin) return [];
  const twin = findPage(page.twin, pages);
  if (!twin?.indexable || twin.twin !== page.path || twin.locale === page.locale) return [];
  const en = page.locale === 'en' ? page : twin;
  const hi = page.locale === 'hi' ? page : twin;
  return [
    { hreflang: 'en', href: absoluteUrl(en.path, baseUrl) },
    { hreflang: 'hi', href: absoluteUrl(hi.path, baseUrl) },
    { hreflang: 'x-default', href: absoluteUrl(en.path, baseUrl) },
  ];
}

/** The absolute, self-referencing canonical URL (never the twin's). */
export function canonicalUrl(path: string, baseUrl: string = site.baseUrl): string {
  return absoluteUrl(path, baseUrl);
}

/** `<meta name="robots">` content: noindex on previews and utility pages (F8). */
export function robotsContent(indexable: boolean, preview: boolean): string {
  if (preview || !indexable) return 'noindex, nofollow';
  return 'index, follow, max-image-preview:large';
}

/** Character count as search results count it (code points, so Devanagari is not over-counted). */
export function charCount(text: string): number {
  return [...text].length;
}
