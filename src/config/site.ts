/**
 * THE ONE PLACE for brand, URLs, package, prices, flags and free numbers
 * (ARCHITECTURE.md §5). Pages and components never type these values.
 *
 * Pure constants and pure helpers only: no `import.meta.env` here, so the
 * Astro config and the unit tests can import this file too. Build-time
 * environment values live in `src/config/env.ts`.
 */

export const LOCALES = ['en', 'hi'] as const;
export type Locale = (typeof LOCALES)[number];

/** A SHA-256 certificate fingerprint as Play Console prints it: 32 hex pairs joined by colons. */
export const SHA256_FINGERPRINT = /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/;

/**
 * Every membership plan the app's paywall sells, in whole rupees, in the app's
 * order (Yearly first). App repo: src/features/billing/preview-prices.ts and
 * subscription.ts (DEC-043, DEC-044). [verify] against Google Play before launch.
 */
const APP_PLANS = [
  { id: 'yearly', inr: 999, per: 'year', readingsPerMonth: 20, trialDays: 3, trialReadings: 5 },
  { id: 'monthly', inr: 299, per: 'month', readingsPerMonth: 20, trialDays: 0, trialReadings: 0 },
  { id: 'lite', inr: 149, per: 'month', readingsPerMonth: 6, trialDays: 0, trialReadings: 0 },
] as const;
/** One-time reading packs (app repo: products.ts): pay once, never expire. `tag` is the app's pack label. [verify] against Google Play. */
const APP_PACKS = [
  { readings: 4, inr: 199, tag: 'me' },
  { readings: 10, inr: 349, tag: 'family' },
  { readings: 25, inr: 749, tag: 'bigFamily' },
  { readings: 50, inr: 1299, tag: 'friends' },
] as const;

export const site = {
  brand: 'PalmSays',
  /** Hindi form of the brand: not decided by the owner yet (ARCHITECTURE.md §5). */
  brandHi: null as string | null,
  domain: 'palmsays.com',
  baseUrl: 'https://palmsays.com',
  /** The app's proxy Worker in front of Supabase. Not live until WEB-SRV-002. */
  apiUrl: 'https://api.palmsays.com',

  /** Android package, read from the app repo's app.json `android.package` on 2026-09-26. */
  playPackage: 'com.palmreadai.app',
  /** The app's current name on Google Play (it is renamed to PalmSays only after WEB-SRV-014). */
  appNameOnPlay: 'Palm Read AI',
  appScheme: 'palmreadai',
  /**
   * Play App Signing (+ upload key) SHA-256 fingerprints for /.well-known/assetlinks.json.
   * Empty = the file is NOT built (a made-up fingerprint is never published). Owner item 6.
   */
  assetlinksSha256: [] as string[],
  iosAppAvailable: false,

  /**
   * Feature flag: the live web reading (WEB-FEAT-026) needs server work that is not
   * deployed yet (WEB-SRV-002…007). While false, the home page never offers an upload
   * and never shows a fake reading.
   */
  webReadingEnabled: false,

  /** Static copy only; the reading screen always asks the server (F4). Not verified (WEB-SRV-001). */
  freeReadings: { guest: 1, afterEmail: 1 },

  /**
   * App prices shown next to every store button.
   * [verify] against Google Play per country before launch (DESIGN_SYSTEM.md §15.3).
   */
  appPrices: {
    currency: 'INR',
    /** Derived from appPlans / appPacks below (one source of truth). */
    planFromPerMonth: Math.min(...APP_PLANS.filter((plan) => plan.per === 'month').map((plan) => plan.inr)),
    packFrom: Math.min(...APP_PACKS.map((pack) => pack.inr)),
    verified: false,
  },
  /** Each plan and pack with its own price, for the /app/ price boxes. */
  appPlans: APP_PLANS,
  appPacks: APP_PACKS,
  /** What packs and plans give (app repo: src/features/billing/products.ts, subscription.ts). Change with the app. */
  appOffer: {
    packSizes: APP_PACKS.map((pack) => pack.readings),
    liteMonthlyReadings: APP_PLANS[2].readingsPerMonth,
    fullMonthlyReadings: APP_PLANS[1].readingsPerMonth,
  },
  /** Download size in MB; null hides the size line until it is measured. */
  appSizeMb: null as number | null,

  ageRule: 18,
  /**
   * Operator details for the footer and legal pages (owner item 9, confirmed by the owner 2026-10-04).
   * PalmSays is run by an individual, not a company: there is no company registration and no GSTIN,
   * and no street address or phone is published. Never invent one.
   */
  company: {
    /** The operator ("we" in the terms): an individual. */
    name: 'Deepak Chauhan' as string | null,
    /** Town, district, state, country: the only address the owner publishes. */
    location: 'Nokha, Bikaner, Rajasthan, India' as string | null,
    /** Contact, support, refunds help and the Grievance Officer's email (one inbox). */
    email: 'dc556316@gmail.com' as string | null,
    /** Grievance Officer (IT Rules 2021, rule 3(2); DPDP Act 2023). */
    grievanceOfficer: 'Deepak Chauhan' as string | null,
    /** One line for places that print the grievance contact as text. */
    grievanceContact: 'Deepak Chauhan, Grievance Officer (dc556316@gmail.com)' as string | null,
  },
  /** How fast grievances are handled (IT Rules 2021, rule 3(2)(a)): acknowledge within 24 hours, resolve within 15 days. */
  grievanceTimes: { acknowledgeHours: 24, resolveDays: 15 },
  author: {
    name: 'Deepak Chauhan',
    /** Real profiles of the author (Person sameAs). Only profiles the owner gave. */
    sameAs: ['https://www.linkedin.com/in/deepakchauhan333/'] as readonly string[],
    linkedin: 'https://www.linkedin.com/in/deepakchauhan333/',
    locality: 'Nokha',
    region: 'Rajasthan',
    district: 'Bikaner',
    country: 'IN',
  },
  /**
   * The day palmsays.com goes public, YYYY-MM-DD (WEB-DEC-049, owner decision D10). null until the
   * owner deploys (OWNER_GUIDE.md §13). When set, it is every guide's `datePublished` unless the guide's
   * own `published` date is later (src/lib/guides/dates.ts). Never set it to a future or past guess.
   */
  launchDate: null as string | null,
  /**
   * Licence for our own palm diagrams and line drawings, never the photos (WEB-DEC-050, owner decision D11).
   * Used by the editorial policy text and the `license` of diagram ImageObjects (src/lib/schema.ts).
   */
  diagramLicence: {
    name: 'CC BY 4.0',
    url: 'https://creativecommons.org/licenses/by/4.0/',
    /** The credit line people must give when they reuse a diagram. */
    credit: 'PalmSays (palmsays.com)',
    /** Where the licence is explained on our site (the editorial policy section). */
    pagePath: '/editorial-policy/#diagram-licence',
  },
  /** Cloudflare Web Analytics is not set up yet; the footer cookie line depends on this list staying cookie-free. */
  cookieFree: true,
} as const;

export type Site = typeof site;

/** Utm tokens must stay short, lowercase and URL-safe so Play Console groups them cleanly. */
const UTM_TOKEN = /^[a-z0-9][a-z0-9_-]{0,39}$/;

export interface PlayLinkOptions {
  /** The page type or page, e.g. `home`, `app_page`, `footer`. */
  medium: string;
  /** The placement on that page, e.g. `hero`, `qr`, `app_section`. */
  campaign: string;
  /** Optional Play UI language. */
  locale?: Locale;
}

/**
 * The Google Play listing URL with an install referrer, so Play Console
 * (Acquisition → third-party referrers) can separate website traffic by page
 * and placement: `referrer=utm_source%3Dweb%26utm_medium%3D…%26utm_campaign%3D…`.
 */
export function playStoreUrl({ medium, campaign, locale }: PlayLinkOptions, pkg: string = site.playPackage): string {
  if (!UTM_TOKEN.test(medium)) throw new Error(`playStoreUrl: bad utm_medium "${medium}"`);
  if (!UTM_TOKEN.test(campaign)) throw new Error(`playStoreUrl: bad utm_campaign "${campaign}"`);
  const referrer = `utm_source=web&utm_medium=${medium}&utm_campaign=${campaign}`;
  const params = [`id=${encodeURIComponent(pkg)}`, `referrer=${encodeURIComponent(referrer)}`];
  if (locale === 'hi') params.push('hl=hi');
  return `https://play.google.com/store/apps/details?${params.join('&')}`;
}

/** The plain Play listing (no referrer), for `sameAs` in structured data. */
export function playListingUrl(pkg: string = site.playPackage): string {
  return `https://play.google.com/store/apps/details?id=${encodeURIComponent(pkg)}`;
}

/** An absolute URL on the site for a root-relative path (`/app/` → `https://palmsays.com/app/`). */
export function absoluteUrl(path: string, baseUrl: string = site.baseUrl): string {
  if (!path.startsWith('/')) throw new Error(`absoluteUrl: path must start with "/": ${path}`);
  return `${baseUrl.replace(/\/+$/, '')}${path}`;
}

/** Problems with the fingerprint list; empty when every entry is a valid, unique SHA-256. */
export function fingerprintProblems(list: readonly string[]): string[] {
  const problems: string[] = [];
  const normalised = list.map((value) => value.trim().toUpperCase());
  for (const value of normalised) {
    if (!SHA256_FINGERPRINT.test(value)) problems.push(`not a SHA-256 fingerprint: "${value}"`);
  }
  if (new Set(normalised).size !== normalised.length) problems.push('a fingerprint is listed twice');
  return problems;
}

/**
 * The Digital Asset Links statement for Android App Links, or null while the
 * fingerprint list is empty (the file is then not built). Throws on a bad list.
 */
export function assetLinksJson(pkg: string, fingerprints: readonly string[]): string | null {
  if (fingerprints.length === 0) return null;
  const problems = fingerprintProblems(fingerprints);
  if (problems.length) throw new Error(`assetlinks: ${problems.join('; ')}`);
  const statement = [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: pkg,
        sha256_cert_fingerprints: fingerprints.map((value) => value.trim().toUpperCase()),
      },
    },
  ];
  return `${JSON.stringify(statement, null, 2)}\n`;
}
