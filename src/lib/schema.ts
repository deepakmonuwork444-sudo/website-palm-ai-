import { absoluteUrl, playListingUrl, playStoreUrl, site, type Locale } from '../config/site';
import ogImages from '../config/og-images.json';
import { AUTHOR_SAME_AS, entity, entityPath, entitySameAs, type EntityId, type PageEntities } from './entities';
import { BOOKS, isBookId, type Book } from './guides/books';

/**
 * JSON-LD builders (SEO_PLAYBOOK.md §6, SEMANTIC_SEO_PLAN.md §5.2, WEB-DEC-049). Every page
 * gets ONE `@graph` (BaseLayout joins the nodes) with stable `@id`s:
 *   https://palmsays.com/#organization, /#website, /about/deepak-chauhan/#person, /app/#app,
 *   {url}#webpage, {url}#article, {url}#primaryimage, {url}#breadcrumb, {url}#app (tools),
 *   /tools/#collection, /palmistry-terms/#<term> (src/lib/entities.ts).
 * Never ratings: no AggregateRating, Review, HowTo, or Product/Offer for app packs. No FAQPage
 * (Google retired the FAQ rich result in May 2026, owner decision D9; the visible FAQs stay).
 * check-web fails if any of these appear.
 */

type JsonLd = Record<string, unknown>;

const CONTEXT = 'https://schema.org';
export const ORGANIZATION_ID = `${site.baseUrl}/#organization`;
export const WEBSITE_ID = `${site.baseUrl}/#website`;
export const AUTHOR_PATH = '/about/deepak-chauhan/';
export const PERSON_ID = `${site.baseUrl}${AUTHOR_PATH}#person`;
export const APP_ID = `${site.baseUrl}/app/#app`;
export const TOOLS_COLLECTION_ID = `${site.baseUrl}/tools/#collection`;
export const EDITORIAL_POLICY_URL = absoluteUrl('/editorial-policy/');
/** Wikidata items the organization knows about: palmistry, Samudrika Shastra, palmar crease (plan §5.2). */
const KNOWS_ABOUT = ['Q182687', 'Q7410688', 'Q3906698'].map((id) => `https://www.wikidata.org/wiki/${id}`);

/** `{url}#<part>` for a page path. */
export function pageId(path: string, part: 'webpage' | 'article' | 'primaryimage' | 'breadcrumb' | 'app' | 'collection'): string {
  return `${absoluteUrl(path)}#${part}`;
}

/** The page's own share image (scripts/make-og.mjs), else the default one: the same file as og:image. */
export function pageImage(path: string, locale: Locale): string {
  const own = (ogImages as Record<string, { image: string } | undefined>)[path]?.image;
  return own ?? (locale === 'hi' ? '/og-default-hi.png' : '/og-default.png');
}

/** One JSON-LD block for the page: every node in a single `@graph` (nested graphs are flattened). */
export function toGraph(blocks: readonly JsonLd[]): JsonLd {
  const nodes: JsonLd[] = [];
  for (const block of blocks) {
    const { '@context': _context, '@graph': inner, ...rest } = block;
    if (Array.isArray(inner)) nodes.push(...(inner as JsonLd[]));
    if (Object.keys(rest).length) nodes.push(rest);
  }
  return { '@context': CONTEXT, '@graph': nodes };
}

/**
 * A registry term as a small inline node, so a page is self-describing even when a crawler doesn't
 * join `@id`s across pages (plan §5.2). Hindi pages get the Hindi name (never English JSON-LD text there).
 */
export function termNode(id: EntityId, locale: Locale, full = false): JsonLd {
  const item = entity(id);
  const sameAs = entitySameAs(item, locale);
  return {
    '@type': 'DefinedTerm',
    '@id': absoluteUrl(entityPath(id)),
    name: locale === 'hi' ? item.name.hi : item.name.en,
    ...(full && locale === 'hi' ? { alternateName: item.name.en } : {}),
    ...(full && item.owner ? { url: absoluteUrl(item.owner) } : {}),
    ...(sameAs.length ? { sameAs: full ? sameAs : sameAs.slice(0, 1) } : {}),
  };
}

/** `about` (full nodes) and `mentions` (short nodes) for a page, from src/lib/entities.ts. */
export function entityProps(entities: PageEntities | null | undefined, locale: Locale): JsonLd {
  if (!entities) return {};
  const about = entities.about.map((id) => termNode(id, locale, true));
  const mentions = (entities.mentions ?? []).map((id) => termNode(id, locale));
  return { about: about.length === 1 ? about[0] : about, ...(mentions.length ? { mentions } : {}) };
}

export function organizationSchema(): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: site.brand,
    url: `${site.baseUrl}/`,
    logo: { '@type': 'ImageObject', url: absoluteUrl('/logo-512.png'), width: 512, height: 512 },
    founder: { '@id': PERSON_ID },
    publishingPrinciples: EDITORIAL_POLICY_URL,
    knowsAbout: KNOWS_ABOUT,
    // sameAs: real social profiles only, once they exist and are kept up (plan D12). The Play listing is the app's, not ours.
  };
}

export function websiteSchema(locale: Locale): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: site.brand,
    url: `${site.baseUrl}/`,
    inLanguage: ['en', 'hi'],
    publisher: { '@id': ORGANIZATION_ID },
    ...(locale === 'hi' ? { alternateName: site.brandHi ?? undefined } : {}),
  };
}

export interface Crumb {
  name: string;
  path: string;
}

/** Its own block (Breadcrumbs.astro); `@id` = the last crumb's page + #breadcrumb, which the WebPage points to. */
export function breadcrumbSchema(items: readonly Crumb[]): JsonLd {
  const last = items[items.length - 1];
  return {
    '@context': CONTEXT,
    '@type': 'BreadcrumbList',
    ...(last ? { '@id': pageId(last.path, 'breadcrumb') } : {}),
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** The page's share image as the `#primaryimage` node (all share images are 1200 × 630). */
export function primaryImageSchema(path: string, locale: Locale): JsonLd {
  return {
    '@type': 'ImageObject',
    '@id': pageId(path, 'primaryimage'),
    url: absoluteUrl(pageImage(path, locale)),
    width: 1200,
    height: 630,
  };
}

/** Our own diagram or line drawing (never a photo) with its CC BY 4.0 licence (WEB-DEC-050, D11). */
export function diagramImageSchema(input: { url: string; name: string; caption?: string; id?: string }): JsonLd {
  const licence = site.diagramLicence;
  return {
    '@type': 'ImageObject',
    ...(input.id ? { '@id': input.id } : {}),
    contentUrl: absoluteUrl(input.url),
    name: input.name,
    ...(input.caption ? { caption: input.caption } : {}),
    license: licence.url,
    acquireLicensePage: absoluteUrl(licence.pagePath),
    creditText: licence.credit,
    creator: { '@id': ORGANIZATION_ID },
    copyrightHolder: { '@id': ORGANIZATION_ID },
  };
}

export interface WebPageInput {
  path: string;
  name: string;
  locale: Locale;
  type?: 'WebPage' | 'AboutPage' | 'CollectionPage' | 'ProfilePage';
  description?: string;
  entities?: PageEntities | null | undefined;
  /** The page renders Breadcrumbs.astro (its BreadcrumbList carries `{url}#breadcrumb`). */
  breadcrumb?: boolean;
  /** Adds `primaryImageOfPage` → `{url}#primaryimage` (add primaryImageSchema to the graph too). */
  primaryImage?: boolean;
  mainEntity?: string;
  lastReviewed?: string;
}

export function webPageSchema(input: WebPageInput): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': input.type ?? 'WebPage',
    '@id': pageId(input.path, 'webpage'),
    url: absoluteUrl(input.path),
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    isPartOf: { '@id': WEBSITE_ID },
    inLanguage: input.locale,
    ...(input.breadcrumb ? { breadcrumb: { '@id': pageId(input.path, 'breadcrumb') } } : {}),
    ...(input.primaryImage ? { primaryImageOfPage: { '@id': pageId(input.path, 'primaryimage') } } : {}),
    ...(input.mainEntity ? { mainEntity: { '@id': input.mainEntity } } : {}),
    ...(input.lastReviewed ? { lastReviewed: input.lastReviewed } : {}),
    ...entityProps(input.entities, input.locale),
  };
}

/** A guide's source as a citation: corpus books as `Book` (author sameAs only when verified), others as CreativeWork. */
export type CitationSource = { book: string } | { title: string; author: string; url?: string | undefined };

export function citationSchema(sources: readonly CitationSource[]): JsonLd[] {
  const seen = new Set<string>();
  const out: JsonLd[] = [];
  for (const source of sources) {
    if ('book' in source) {
      if (!isBookId(source.book) || seen.has(source.book)) continue;
      seen.add(source.book);
      const book: Book = BOOKS[source.book];
      const sameAs = AUTHOR_SAME_AS[book.author];
      out.push({
        '@type': 'Book',
        name: book.title,
        datePublished: String(book.year),
        ...(book.language ? { inLanguage: book.language } : {}),
        author: { '@type': 'Person', name: book.author, ...(sameAs ? { sameAs: [...sameAs] } : {}) },
      });
    } else {
      const key = `${source.title}|${source.author}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ '@type': 'CreativeWork', name: source.title, author: source.author, ...(source.url ? { url: source.url } : {}) });
    }
  }
  return out;
}

export interface ArticleInput {
  headline: string;
  description: string;
  path: string;
  locale: Locale;
  datePublished: string;
  dateModified: string;
  authorName: string;
  /** Only while the author page is built (it is linked). */
  authorUrl?: string;
  entities?: PageEntities | null | undefined;
  citation?: JsonLd[];
  /** 'BlogPosting' for /blog/ posts (src/layouts/BlogLayout.astro); guides stay 'Article'. Same `{url}#article` id. */
  type?: 'Article' | 'BlogPosting';
}

/** For guides and blog posts. Dates are ISO with an offset; the author is a real Person (`@id`), never the Organization. */
export function articleSchema(input: ArticleInput): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': input.type ?? 'Article',
    '@id': pageId(input.path, 'article'),
    isPartOf: { '@id': pageId(input.path, 'webpage') },
    mainEntityOfPage: { '@id': pageId(input.path, 'webpage') },
    headline: input.headline,
    description: input.description,
    image: { '@id': pageId(input.path, 'primaryimage') },
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    inLanguage: input.locale,
    author: {
      '@type': 'Person',
      '@id': PERSON_ID,
      name: input.authorName,
      ...(input.authorUrl ? { url: absoluteUrl(input.authorUrl) } : {}),
    },
    publisher: { '@id': ORGANIZATION_ID },
    publishingPrinciples: EDITORIAL_POLICY_URL,
    ...entityProps(input.entities, input.locale),
    ...(input.citation?.length ? { citation: input.citation } : {}),
  };
}

export interface WebApplicationInput {
  name: string;
  path: string;
  locale: Locale;
  description: string;
  entities?: PageEntities | null | undefined;
  /** A tool page: part of the /tools/ collection. */
  inToolsCollection?: boolean;
}

/** Home (only while the web reading is live) and the tool pages. Free, runs in any browser. */
export function webApplicationSchema(input: WebApplicationInput): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'WebApplication',
    '@id': pageId(input.path, 'app'),
    name: input.name,
    url: absoluteUrl(input.path),
    description: input.description,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Any',
    isAccessibleForFree: true,
    offers: [
      { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
      { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    ],
    inLanguage: input.locale,
    publisher: { '@id': ORGANIZATION_ID },
    ...(input.inToolsCollection ? { isPartOf: { '@id': TOOLS_COLLECTION_ID } } : {}),
    ...entityProps(input.entities, input.locale),
  };
}

export interface MobileApplicationInput {
  locale: Locale;
  description: string;
  /** The page's own "what the app does" sentences (knowledge-based trust: the same words as the page). */
  featureList?: readonly string[];
  entities?: PageEntities | null | undefined;
}

/**
 * `/app/` and `/hi/app/`: the Android app, one `@id` for both. `name` is the app's CURRENT Google Play
 * name (site.appNameOnPlay; "Palm Read AI" until the owner renames the listing, D8), `alternateName`
 * the brand, so the site, the app and the Play listing read as one entity. No aggregateRating (the
 * Play rating was not collected on our site).
 */
export function mobileApplicationSchema(input: MobileApplicationInput): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'MobileApplication',
    '@id': APP_ID,
    name: site.appNameOnPlay,
    ...((site.appNameOnPlay as string) !== site.brand ? { alternateName: site.brand } : {}),
    url: absoluteUrl('/app/'),
    description: input.description,
    operatingSystem: 'ANDROID',
    // [verify] against the Play Console category before launch (SEO_PLAYBOOK.md §6).
    applicationCategory: 'LifestyleApplication',
    sameAs: [playListingUrl()],
    downloadUrl: playListingUrl(),
    installUrl: playStoreUrl({ medium: 'app_page', campaign: 'schema' }),
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    inLanguage: ['en', 'hi'],
    ...(input.featureList?.length ? { featureList: [...input.featureList] } : {}),
    publisher: { '@id': ORGANIZATION_ID },
    ...entityProps(input.entities, input.locale),
  };
}

/** Serialises JSON-LD for a <script type="application/ld+json"> block, safe against `</script>`. */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** Schema types that must never appear on this site (FAQPage: D9, WEB-DEC-049). */
export const BANNED_SCHEMA_TYPES = ['AggregateRating', 'Review', 'HowTo', 'Product', 'FAQPage'] as const;
