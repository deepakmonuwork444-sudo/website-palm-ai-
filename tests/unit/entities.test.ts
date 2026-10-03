import { describe, expect, it } from 'vitest';

import { PAGES } from '../../src/config/pages';
import { site } from '../../src/config/site';
import { BLOG_POST_PATH } from '../../src/lib/blog';
import {
  AUTHOR_SAME_AS,
  ENTITIES,
  PAGE_ENTITIES,
  PAGES_WITHOUT_ENTITIES,
  entity,
  entitySameAs,
  isEntityId,
  wikidataIds,
} from '../../src/lib/entities';
import { guideDates } from '../../src/lib/guides/dates';
import { en } from '../../src/i18n/en';
import { hi } from '../../src/i18n/hi';
import {
  APP_ID,
  BANNED_SCHEMA_TYPES,
  articleSchema,
  citationSchema,
  diagramImageSchema,
  mobileApplicationSchema,
  organizationSchema,
  primaryImageSchema,
  toGraph,
  webApplicationSchema,
  webPageSchema,
  websiteSchema,
} from '../../src/lib/schema';

/**
 * Every Wikidata item fetched live on 2026-09-28 (wbgetentities: label, description, sitelinks)
 * and matched to the SAME thing (SEMANTIC_SEO_PLAN.md §5.3). A new id must be verified the same
 * way and added here in the same change; never a guessed id.
 */
const VERIFIED_WIKIDATA = new Set([
  'Q182687', // palmistry
  'Q1700006', // life line
  'Q3906698', // palmar crease
  'Q1934946', // single transverse palmar crease
  'Q904206', // dermatoglyphics
  'Q33767', // hand
  'Q2001588', // palm
  'Q620207', // finger
  'Q83360', // thumb
  'Q178022', // fingerprint
  'Q530315', // thenar eminence
  'Q1089522', // hypothenar eminence
  'Q7410688', // Samudrika Shastra
  'Q740253', // Hindu astrology
  'Q34362', // astrology
  'Q1043197', // divination
  'Q483677', // pseudoscience
  'Q653175', // Barnum effect
  'Q2421902', // handedness
  'Q19978810', // dominant hand
  'Q110875660', // chiromancer (palmist)
  'Q728021', // Cheiro
  'Q5343439', // Edward Heron-Allen
  'Q2824807', // Adolphe Desbarrolles
]);
/** Items that must never be used (wrong things with the same words, plan §5.3). */
const NEVER = ['Q2195421', 'Q1615182', 'Q113174138', 'Q125364068'];

/** Every object in a JSON-LD value, depth first. */
function nodes(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.flatMap(nodes);
  if (!value || typeof value !== 'object') return [];
  const record = value as Record<string, unknown>;
  return [record, ...Object.values(record).flatMap(nodes)];
}

describe('entity registry (src/lib/entities.ts)', () => {
  it('has about 40 terms with unique, anchor-safe ids, both names and a short definition', () => {
    expect(ENTITIES.length).toBeGreaterThanOrEqual(38);
    const ids = ENTITIES.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const item of ENTITIES) {
      expect(item.id).toMatch(/^[a-z][a-z0-9-]*$/);
      expect(item.name.en.length).toBeGreaterThan(1);
      expect(item.name.hi).toMatch(/[ऀ-ॿ]/);
      const words = item.def.split(/\s+/).length;
      expect(words, item.id).toBeLessThanOrEqual(40);
      expect(item.def).not.toMatch(/→| · |\p{Extended_Pictographic}/u);
    }
  });

  it('uses only verified Wikidata items, never a known wrong one', () => {
    for (const id of wikidataIds()) expect(VERIFIED_WIKIDATA.has(id), id).toBe(true);
    const text = JSON.stringify([ENTITIES, AUTHOR_SAME_AS]);
    for (const id of NEVER) expect(text).not.toContain(`"${id}"`);
    // Terms with no item of their own have no sameAs (their @id is the identity).
    for (const id of ['heart-line', 'head-line', 'fate-line', 'mount-venus'] as const) expect(entitySameAs(entity(id))).toEqual([]);
    expect(entitySameAs(entity('palmistry'))).toEqual([
      'https://www.wikidata.org/wiki/Q182687',
      'https://en.wikipedia.org/wiki/Palmistry',
      `https://hi.wikipedia.org/wiki/${encodeURIComponent('हस्तरेखा_शास्त्र')}`,
    ]);
    expect(entitySameAs(entity('palmistry'), 'hi')[1]).toContain('hi.wikipedia.org');
  });

  it('owner pages are built pages', () => {
    const paths = new Set(PAGES.map((page) => page.path));
    for (const item of ENTITIES) if (item.owner) expect(paths.has(item.owner), `${item.id} → ${item.owner}`).toBe(true);
  });

  it('every built content page has about (1–2) and at most 8 mentions, all resolving to registry ids', () => {
    for (const page of PAGES) {
      if (PAGES_WITHOUT_ENTITIES.includes(page.path)) continue;
      // Blog posts carry about/mentions in their front matter (tests/unit/blog.test.ts, check-web).
      if (BLOG_POST_PATH.test(page.path)) continue;
      const found = PAGE_ENTITIES[page.path];
      expect(found, `${page.path} has no entry in PAGE_ENTITIES`).toBeDefined();
      expect(found!.about.length).toBeGreaterThanOrEqual(1);
      expect(found!.about.length).toBeLessThanOrEqual(2);
      expect((found!.mentions ?? []).length).toBeLessThanOrEqual(8);
      for (const id of [...found!.about, ...(found!.mentions ?? [])]) expect(isEntityId(id), `${page.path}: ${id}`).toBe(true);
      expect(new Set(found!.mentions ?? []).size).toBe((found!.mentions ?? []).length);
      for (const id of found!.about) expect(found!.mentions ?? []).not.toContain(id);
    }
    for (const path of Object.keys(PAGE_ENTITIES)) expect(PAGES.some((page) => page.path === path), path).toBe(true);
  });
});

describe('schema graph (src/lib/schema.ts)', () => {
  const heart = PAGE_ENTITIES['/heart-line/']!;
  const guideGraph = toGraph([
    webPageSchema({ path: '/heart-line/', name: 'x', locale: 'en', entities: heart, breadcrumb: true, primaryImage: true }),
    articleSchema({
      headline: 'h',
      description: 'd',
      path: '/heart-line/',
      locale: 'en',
      datePublished: '2026-09-26T00:00:00+05:30',
      dateModified: '2026-09-26T00:00:00+05:30',
      authorName: site.author.name,
      entities: heart,
      citation: citationSchema([
        { book: 'cheiro-palmistry-for-all-1916' },
        { book: 'cheiro-palmistry-for-all-1916' },
        { book: 'dale-indian-palmistry-1895' },
        { title: 'A study', author: 'Someone', url: 'https://example.org/' },
      ]),
    }),
    primaryImageSchema('/heart-line/', 'en'),
  ]);
  const all = nodes(guideGraph);

  it('is one @graph with stable ids that resolve inside the page or site-wide', () => {
    expect(guideGraph['@context']).toBe('https://schema.org');
    const graph = guideGraph['@graph'] as Record<string, unknown>[];
    expect(graph.every((node) => !('@context' in node))).toBe(true);
    const defined = new Set(all.map((node) => node['@id']).filter(Boolean));
    const siteWide = new Set(['https://palmsays.com/#organization', 'https://palmsays.com/#website', 'https://palmsays.com/about/deepak-chauhan/#person']);
    const refs = all.filter((node) => Object.keys(node).length === 1 && '@id' in node).map((node) => String(node['@id']));
    // The breadcrumb is Breadcrumbs.astro's own block on the same page.
    for (const ref of refs) expect(defined.has(ref) || siteWide.has(ref) || ref === 'https://palmsays.com/heart-line/#breadcrumb', ref).toBe(true);
    expect(defined.has('https://palmsays.com/heart-line/#webpage')).toBe(true);
    expect(defined.has('https://palmsays.com/heart-line/#article')).toBe(true);
  });

  it('names its entities: about = the heart line term, author = the Person @id, image = the page share image', () => {
    const article = all.find((node) => node['@type'] === 'Article')!;
    expect((article.about as Record<string, unknown>)['@id']).toBe('https://palmsays.com/palmistry-terms/#heart-line');
    expect((article.author as Record<string, unknown>)['@id']).toBe('https://palmsays.com/about/deepak-chauhan/#person');
    expect(article.publishingPrinciples).toBe('https://palmsays.com/editorial-policy/');
    const image = all.find((node) => node['@type'] === 'ImageObject')!;
    expect(image.url).toBe('https://palmsays.com/og/heart-line.jpg');
  });

  it('cites each corpus book once, with a verified author sameAs only where one exists', () => {
    const article = all.find((node) => node['@type'] === 'Article')!;
    const citation = article.citation as Record<string, unknown>[];
    expect(citation.filter((item) => item['@type'] === 'Book')).toHaveLength(2);
    const cheiro = citation.find((item) => item.name === 'Palmistry for All')!;
    expect((cheiro.author as Record<string, unknown>).sameAs).toContain('https://www.wikidata.org/wiki/Q728021');
    const dale = citation.find((item) => item.name === 'Indian Palmistry')!;
    expect((dale.author as Record<string, unknown>).sameAs).toBeUndefined();
  });

  it('Hindi pages get Hindi term names (no English JSON-LD text there)', () => {
    const page = webPageSchema({ path: '/hi/', name: 'x', locale: 'hi', entities: PAGE_ENTITIES['/hi/'] });
    const names = nodes(page).filter((node) => node['@type'] === 'DefinedTerm').map((node) => String(node.name));
    for (const name of names) expect(name).toMatch(/[ऀ-ॿ]/);
  });

  it('never contains FAQPage, ratings, reviews, HowTo or Product', () => {
    const text = JSON.stringify([
      guideGraph,
      organizationSchema(),
      websiteSchema('en'),
      webApplicationSchema({ name: 'x', path: '/tools/palm-map/', locale: 'en', description: 'y', entities: PAGE_ENTITIES['/tools/palm-map/'], inToolsCollection: true }),
      mobileApplicationSchema({ locale: 'en', description: 'z', featureList: en.appPage.does }),
    ]);
    for (const type of BANNED_SCHEMA_TYPES) expect(text).not.toContain(`"${type}"`);
    expect(text).not.toMatch(/aggregateRating|"review"/i);
  });

  it('the app keeps its current Play name and the brand together; the organization points to the editorial policy', () => {
    const app = mobileApplicationSchema({ locale: 'en', description: 'z' });
    expect(app['@id']).toBe(APP_ID);
    expect(app.name).toBe(site.appNameOnPlay);
    if ((site.appNameOnPlay as string) !== site.brand) expect(app.alternateName).toBe(site.brand);
    const org = organizationSchema();
    expect(org.publishingPrinciples).toBe('https://palmsays.com/editorial-policy/');
    expect(org.knowsAbout).toContain('https://www.wikidata.org/wiki/Q182687');
  });

  it('diagram images carry the CC BY 4.0 licence with credit (D11)', () => {
    const image = diagramImageSchema({ url: '/img/guides/palm-lines-chart.svg', name: 'Palm lines chart' });
    expect(image.license).toBe('https://creativecommons.org/licenses/by/4.0/');
    expect(image.acquireLicensePage).toBe('https://palmsays.com/editorial-policy/#diagram-licence');
    expect(image.creditText).toBe(site.diagramLicence.credit);
  });
});

describe('guide dates (launchDate, D10)', () => {
  it('keeps the front matter dates until the launch date is set', () => {
    expect(site.launchDate).toBeNull();
    expect(guideDates('2026-09-26', '2026-09-27', null)).toEqual({ published: '2026-09-26', modified: '2026-09-27' });
  });

  it('publishes every older guide on the launch day, never before it', () => {
    expect(guideDates('2026-09-26', '2026-09-26', '2026-10-05')).toEqual({ published: '2026-10-05', modified: '2026-10-05' });
    // A real update after launch stays the modified date; a guide added after launch keeps its own date.
    expect(guideDates('2026-09-26', '2026-10-20', '2026-10-05')).toEqual({ published: '2026-10-05', modified: '2026-10-20' });
    expect(guideDates('2026-11-01', '2026-11-01', '2026-10-05')).toEqual({ published: '2026-11-01', modified: '2026-11-01' });
  });
});

describe('home FAQ follows the web reading state (X2, plan §5.5 rule 3)', () => {
  const answer = (dict: typeof en, open: boolean) => dict.home.faq.items[0]!.a(1, 1, open);

  it('says "on this website" only while the web scan is open', () => {
    expect(answer(en, true)).toContain('On this website you get 2 free readings');
    expect(answer(en, false)).not.toMatch(/On this website you get/);
    expect(answer(en, false)).toContain('opens soon');
    expect(answer(en, false)).toContain('Android app gives you 2 free readings');
    expect(answer(hi, true)).toMatch(/इस वेबसाइट पर 2 रीडिंग मुफ़्त/);
    expect(answer(hi, false)).not.toMatch(/इस वेबसाइट पर 2 रीडिंग मुफ़्त/);
    expect(answer(hi, false)).toContain('जल्द शुरू होगा');
  });
});
