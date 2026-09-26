import { absoluteUrl, playListingUrl, playStoreUrl, site, type Locale } from '../config/site';

/**
 * JSON-LD builders (SEO_PLAYBOOK.md §6). Never ratings: no AggregateRating,
 * Review, HowTo, or Product/Offer for app packs. check-web fails if any appear.
 */

type JsonLd = Record<string, unknown>;

const CONTEXT = 'https://schema.org';
export const ORGANIZATION_ID = `${site.baseUrl}/#organization`;
export const WEBSITE_ID = `${site.baseUrl}/#website`;

export function organizationSchema(): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: site.brand,
    url: `${site.baseUrl}/`,
    logo: absoluteUrl('/logo-512.png'),
    sameAs: [playListingUrl()],
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

export function breadcrumbSchema(items: readonly Crumb[]): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export interface ArticleInput {
  headline: string;
  description: string;
  path: string;
  locale: Locale;
  image: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  authorUrl?: string;
}

/** For guides (step 2). Dates are ISO dates; the author is a real Person, never the Organization. */
export function articleSchema(input: ArticleInput): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'Article',
    headline: input.headline,
    description: input.description,
    mainEntityOfPage: absoluteUrl(input.path),
    image: [absoluteUrl(input.image)],
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    inLanguage: input.locale,
    author: { '@type': 'Person', name: input.authorName, ...(input.authorUrl ? { url: absoluteUrl(input.authorUrl) } : {}) },
    publisher: { '@id': ORGANIZATION_ID },
  };
}

export interface WebApplicationInput {
  name: string;
  path: string;
  locale: Locale;
  description: string;
}

/** Home (only while the web reading is live) and the tool pages. Free, runs in any browser. */
export function webApplicationSchema(input: WebApplicationInput): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'WebApplication',
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
  };
}

export interface MobileApplicationInput {
  locale: Locale;
  description: string;
}

/** `/app/`: the Android app. No aggregateRating (the Play rating was not collected on our site). */
export function mobileApplicationSchema(input: MobileApplicationInput): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'MobileApplication',
    name: site.appNameOnPlay,
    alternateName: site.brand,
    description: input.description,
    operatingSystem: 'ANDROID',
    // [verify] against the Play Console category before launch (SEO_PLAYBOOK.md §6).
    applicationCategory: 'LifestyleApplication',
    installUrl: playStoreUrl({ medium: 'app_page', campaign: 'schema' }),
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    inLanguage: input.locale,
    publisher: { '@id': ORGANIZATION_ID },
  };
}

/** Serialises JSON-LD for a <script type="application/ld+json"> block, safe against `</script>`. */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** Schema types that must never appear on this site. */
export const BANNED_SCHEMA_TYPES = ['AggregateRating', 'Review', 'HowTo', 'Product'] as const;
