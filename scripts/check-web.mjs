/**
 * check-web (a.k.a. check-site): validates the built site in dist/ before any
 * preview or production deploy (QA_RELEASE.md §3). Ported from the app repo's
 * scripts/check-web.mjs and extended for PalmSays.
 *
 *   npm run check:web                 checks dist/
 *   npm run check:web -- --dir dist   same, explicit
 *
 * The page registry (src/config/pages.ts) and site config (src/config/site.ts)
 * are the expectations; Node 24 loads them directly (type stripping).
 * A preview build (PUBLIC_ENV not "production") is detected from the home
 * page's robots tag: then every page must be noindex and placeholder values
 * are warnings; in a production build they are errors.
 *
 * Writing standard (owner, 2026-10-01; CONTENT_GUIDE.md §15, src/lib/writing-standard.ts): no em
 * dash, en dash only in number ranges, no spaced hyphen as a dash, no AI-sounding phrase. Checked in
 * the source of the guides, blog posts and UI strings (src/i18n/en.ts, hi.ts, guide strings; code
 * comments skipped) and in the visible text of every built guide, blog post and the /blog/ index.
 *
 * Exit 1 on any error. Warnings never fail the build.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, posix, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

import { PAGES, registryProblems } from '../src/config/pages.ts';
import { SHA256_FINGERPRINT, site } from '../src/config/site.ts';
import { ENTITIES, PAGE_ENTITIES, PAGES_WITHOUT_ENTITIES, TERMS_PATH } from '../src/lib/entities.ts';
import { contextAt, isAllowed, sourceProblems, writingProblems } from '../src/lib/writing-standard.ts';
import { h1Text } from './og-lib.mjs';

const errors = [];
const warnings = [];
const error = (where, message) => errors.push(`${where}: ${message}`);
const warn = (where, message) => warnings.push(`${where}: ${message}`);

const dirArg = process.argv.indexOf('--dir');
const DIR = dirArg !== -1 ? process.argv[dirArg + 1] : 'dist';
const BASE = site.baseUrl;
const ORIGIN = new URL(BASE).origin;

/** Frozen App Link pages (ARCHITECTURE.md §11 F1). Built in step 2 (guides). */
const APP_LINK_PATHS = ['/palm-reading/', '/hand-lines/', '/heart-line/', '/head-line/', '/life-line/', '/fate-line/'].flatMap(
  (path) => [path, `/hi${path}`],
);
/** Frozen legal URLs (F3), always built as files at these exact names. */
const LEGAL_FILES = ['privacy.html', 'terms.html', 'delete-account.html', 'reset-password.html'];
const NOINDEX_FILES = ['delete-account.html', 'reset-password.html', '404.html'];
const REQUIRED_FILES = [
  ...LEGAL_FILES,
  '404.html',
  'robots.txt',
  'llms.txt',
  'sitemap-index.xml',
  '_headers',
  'favicon.svg',
  'apple-touch-icon.png',
  'logo-512.png',
  'og-default.png',
  'og-default-hi.png',
];
/** Per-page share images written by scripts/make-og.mjs. */
const OG_IMAGES = existsSync('src/config/og-images.json') ? JSON.parse(readFileSync('src/config/og-images.json', 'utf8')) : {};
// FAQPage: Google retired the FAQ rich result (May 2026); owner decision D9, WEB-DEC-049. The visible FAQs stay.
const BANNED_SCHEMA = ['AggregateRating', 'Review', 'HowTo', 'Product', 'FAQPage'];
/** Registry terms' @ids (src/lib/entities.ts): https://palmsays.com/palmistry-terms/#<id>. */
const TERM_ID_PREFIX = `${BASE}${TERMS_PATH}#`;
/** Ids of the glossary page itself ({url}#webpage, #breadcrumb, #set, #img-…), not terms (WEB-DEC-053). */
const PAGE_PARTS = new Set(['webpage', 'breadcrumb', 'primaryimage', 'article', 'collection', 'app', 'set']);
const isTermId = (id) => id.startsWith(TERM_ID_PREFIX) && !PAGE_PARTS.has(id.slice(TERM_ID_PREFIX.length)) && !id.slice(TERM_ID_PREFIX.length).startsWith('img-');
const ENTITY_BY_ID = new Map(ENTITIES.map((item) => [item.id, item]));
/**
 * Knowledge-based trust (SEMANTIC_SEO_PLAN.md §5.5 rule 3): the "free on this website" claim of the home FAQ,
 * EN + HI. It may ship only while a visitor can really finish a scan on the site (src/lib/reading/open.ts).
 */
const WEB_FREE_CLAIMS = [/On this website you get \d+ free readings/i, /इस वेबसाइट पर \d+ रीडिंग मुफ़्त/];
const WEB_SOON_MARKERS = [/opens soon/i, /जल्द शुरू होगा/];
/** CONTENT_GUIDE.md §11, whole words, checked on visible text of our own pages (legal copies excluded). */
const BANNED_WORDS = [
  /\bguaranteed\b/i,
  /\bdestined\b/i,
  /\b100%/,
  /\baccurate\b/i,
  /\bscientifically proven\b/i,
  /\bunlock your destiny\b/i,
  /\blast chance\b/i,
  /\blimited offer\b/i,
  /\bhurry\b/i,
  /\bAI palmist\b/i,
  /सटीक/,
  /(^|\s)पक्का(\s|$|।)/,
  /जल्दी करें/,
  /आख़िरी मौका/,
];
const BUDGET = {
  // Tool pages: HTML ≤ 25 KB (QA_RELEASE.md §2.3); their JS stays under the 10 KB "other" budget (rule tools, DESIGN_SYSTEM.md §11).
  htmlGzip: { home: 30 * 1024, tool: 25 * 1024, other: 35 * 1024 },
  cssGzip: 25 * 1024,
  // Photo tool pages (data-tool-kind hand/device/ai): the 70 KB tool budget of QA_RELEASE.md §2.3; the heavy hand model loads only after a photo is picked and is not counted here.
  // other: 11 KB since WEB-DEC-042 (the site-wide showroom motion script, ~0.7 KB, ships on every page).
  // account: /account/ + /hi/account/ INCLUDING their React island (component + renderer + static imports; WEB-FEAT-029,
  // measured 110.2 KB with the site scripts on 2026-09-27, React DOM alone ~64 KB). Supabase and Google's script load later by import() and are not counted.
  jsGzip: { home: 60 * 1024, photoTool: 70 * 1024, other: 11 * 1024, account: 120 * 1024 },
};

const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(Number.parseInt(n, 16)));

/** Every <tag ...> as an attribute map (values decoded). */
function tags(html, name) {
  const found = [];
  for (const [, body] of html.matchAll(new RegExp(`<${name}\\b([^>]*)>`, 'gi'))) {
    const attrs = {};
    for (const [, key, value] of body.matchAll(/([a-zA-Z][\w:-]*)(?:="([^"]*)")?/g)) attrs[key.toLowerCase()] = decode(value ?? '');
    found.push(attrs);
  }
  return found;
}

const chars = (s) => [...s].length;
const gz = (text) => gzipSync(Buffer.from(text)).length;
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

/** Built file for a served path, as Workers (html_handling: auto-trailing-slash) serves it. */
function fileForPath(path, fileSet) {
  const clean = decodeURIComponent(path).replace(/^\//, '');
  const candidates =
    clean === '' || clean.endsWith('/')
      ? [`${clean}index.html`]
      : [clean, `${clean}.html`, `${clean}/index.html`];
  return candidates.find((candidate) => fileSet.has(candidate)) ?? null;
}

/** The registry path a built HTML file is served at. */
function pathForFile(file) {
  if (file === 'index.html') return '/';
  if (file.endsWith('/index.html')) return `/${file.slice(0, -'index.html'.length)}`;
  return `/${file.replace(/\.html$/, '')}`;
}

/**
 * A module script plus every chunk it imports statically (what the browser
 * fetches before the script runs). Dynamic import() chunks load later and are
 * not counted. Without this, a page whose script imports shared chunks would
 * be under-counted against its JS budget.
 */
function moduleFiles(entry, fileSet, seen = new Set()) {
  if (seen.has(entry) || !fileSet.has(entry)) return seen;
  seen.add(entry);
  const code = readFileSync(join(DIR, entry), 'utf8');
  const dir = posix.dirname(entry);
  for (const [, spec] of code.matchAll(/\bimport\s*(?:[^"';()]*?\bfrom\s*)?["'](\.{1,2}\/[^"']+\.js)["']/g)) {
    moduleFiles(posix.normalize(posix.join(dir, spec)), fileSet, seen);
  }
  return seen;
}

function visibleText(html) {
  return decode(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<head[\s\S]*?<\/head>/i, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

/** Every JSON-LD node on a page (in @graph or not, nested ones too) and every bare {"@id": …} reference. */
function jsonLdNodes(html) {
  const nodes = [];
  const refs = [];
  const visit = (value, top) => {
    if (Array.isArray(value)) {
      for (const item of value) visit(item, false);
      return;
    }
    if (!value || typeof value !== 'object') return;
    const keys = Object.keys(value);
    if (keys.length === 1 && keys[0] === '@id') {
      refs.push(value['@id']);
      return;
    }
    if (value['@type'] || top) nodes.push(value);
    for (const inner of Object.values(value)) visit(inner, false);
  };
  for (const [, block] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(block);
      if (Array.isArray(data['@graph'])) for (const node of data['@graph']) visit(node, true);
      else visit(data, true);
    } catch {
      // Reported by the parse check.
    }
  }
  return { nodes, refs };
}

/**
 * @id references resolve: ids of this page ({url}#…) on the page itself, site-wide ids (organization,
 * website, person, app, tools collection) somewhere in the build, terms in src/lib/entities.ts.
 * An @id is never defined with two different types.
 */
function checkGraph(page, definedIds) {
  const { file, jsonLd, url } = page;
  const local = new Set(jsonLd.nodes.map((node) => node['@id']).filter(Boolean));
  const types = new Map();
  for (const node of jsonLd.nodes) {
    const id = node['@id'];
    if (!id) continue;
    const type = JSON.stringify(node['@type']);
    if (types.has(id) && types.get(id) !== type) error(file, `JSON-LD @id ${id} is defined with two types`);
    types.set(id, type);
    if (isTermId(id) && !ENTITY_BY_ID.has(id.slice(TERM_ID_PREFIX.length))) {
      error(file, `JSON-LD term ${id} is not in src/lib/entities.ts`);
    }
  }
  for (const ref of jsonLd.refs) {
    if (isTermId(ref)) {
      if (!ENTITY_BY_ID.has(ref.slice(TERM_ID_PREFIX.length))) error(file, `JSON-LD points to ${ref}, which is not in src/lib/entities.ts`);
      continue;
    }
    const own = ref.startsWith(`${url}#`);
    if (own ? !local.has(ref) : !definedIds.has(ref)) error(file, `JSON-LD @id ${ref} is not defined ${own ? 'on this page' : 'anywhere in the build'}`);
  }
}

/**
 * Entities (plan §5.2): each content page's WebPage (or CollectionPage) carries the about terms of
 * src/lib/entities.ts, and every term is named in the visible text (about: error; mentions: warning).
 */
function checkPageEntities(page) {
  const { file, path, entry, jsonLd, html } = page;
  const expected = PAGE_ENTITIES[path] ?? blogEntities(page);
  if (!expected) {
    if (entry?.indexable && !PAGES_WITHOUT_ENTITIES.includes(path)) error(file, 'indexable page has no about/mentions in src/lib/entities.ts (PAGE_ENTITIES)');
    return;
  }
  const holder = jsonLd.nodes.find((node) => node['@id'] === `${page.url}#webpage` || node['@id'] === `${page.url}#collection`);
  const aboutIds = [holder?.about ?? []].flat().map((node) => node?.['@id']);
  for (const id of expected.about) {
    if (!aboutIds.includes(`${TERM_ID_PREFIX}${id}`)) error(file, `JSON-LD WebPage has no about "${id}" (src/lib/entities.ts)`);
  }
  const text = visibleText(html).toLowerCase();
  const named = (id) => {
    const item = ENTITY_BY_ID.get(id);
    return Boolean(item) && [item.name.en, item.name.hi, ...(item.alt ?? [])].some((name) => text.includes(name.toLowerCase()));
  };
  for (const id of expected.about) if (!named(id)) error(file, `about term "${id}" is not named in the page text`);
  for (const id of expected.mentions ?? []) if (!named(id)) warn(file, `mentions term "${id}" is not named in the page text`);
}

/**
 * Blog pages (WEB-DEC-057) set about/mentions in their front matter, not in src/lib/entities.ts: the
 * expected terms are the ones their WebPage/CollectionPage declares (at least one about term).
 */
function blogEntities(page) {
  if (!page.path.startsWith('/blog/')) return undefined;
  const holder = page.jsonLd.nodes.find((node) => node['@id'] === `${page.url}#webpage`);
  const ids = (value) =>
    [value ?? []]
      .flat()
      .map((node) => node?.['@id'])
      .filter((id) => id?.startsWith(TERM_ID_PREFIX))
      .map((id) => id.slice(TERM_ID_PREFIX.length));
  const about = ids(holder?.about);
  if (!about.length) {
    error(page.file, 'blog page has no about term in its JSON-LD WebPage (front matter `about`, src/lib/entities.ts ids)');
    return undefined;
  }
  return { about, mentions: ids(holder?.mentions) };
}

/** Repo files whose copy follows the writing standard (CONTENT_GUIDE.md §15): the MDX content and the UI strings. */
const WRITING_SOURCES = [
  ...['src/content/guides', 'src/content/blog'].flatMap((dir) =>
    existsSync(dir) ? readdirSync(dir).filter((name) => name.endsWith('.mdx')).map((name) => `${dir}/${name}`) : [],
  ),
  'src/i18n/en.ts',
  'src/i18n/hi.ts',
  'src/lib/guides/strings.ts',
];

/** Writing standard in the source copy (front matter included, code comments skipped), reported as file:line. */
function checkWritingSources() {
  for (const file of WRITING_SOURCES) {
    if (!existsSync(file)) continue;
    for (const problem of sourceProblems(file, readFileSync(file, 'utf8'), file.endsWith('.mdx') ? 'mdx' : 'ts')) {
      error(`${file}:${problem.line}`, `${problem.message}: "…${problem.context}…" (CONTENT_GUIDE.md §15)`);
    }
  }
}

/** Writing standard in the visible text of a built guide, blog post or the /blog/ index (header, footer and end blocks included). */
function checkWritingPage(page) {
  const { file, html, path } = page;
  if (!/<article class="(?:guide|blog-post)\b/.test(html) && path !== '/blog/') return;
  const text = visibleText(html);
  const seen = new Set();
  for (const problem of writingProblems(text)) {
    const context = contextAt(text, problem.index, 40);
    if (isAllowed(path, problem, context)) continue;
    const key = `${problem.rule}|${context}`;
    if (seen.has(key)) continue;
    seen.add(key);
    error(file, `${problem.message}: "…${context}…" (CONTENT_GUIDE.md §15)`);
  }
}

/** Rule 3 (plan §5.5): no "free readings on this website" claim while the web reading is off, and never beside "opens soon". */
function checkWebReadingClaims(page, preview) {
  if (page.legal) return;
  const text = visibleText(page.html);
  if (!WEB_FREE_CLAIMS.some((pattern) => pattern.test(text))) return;
  if (!preview && !site.webReadingEnabled) error(page.file, 'claims free readings on this website while site.webReadingEnabled is false (home FAQ: the "opens soon" answer)');
  if (WEB_SOON_MARKERS.some((pattern) => pattern.test(text))) error(page.file, 'says both "free readings on this website" and "opens soon": the page contradicts itself');
}

function main() {
  if (!existsSync(DIR)) {
    console.error(`No built site at ${DIR}/. Run npm run build first.`);
    process.exit(1);
  }
  for (const problem of registryProblems()) error('src/config/pages.ts', problem);
  checkWritingSources();

  const files = walk(DIR).map((full) => relative(DIR, full).replaceAll('\\', '/'));
  const fileSet = new Set(files);
  for (const file of REQUIRED_FILES) if (!fileSet.has(file)) error(file, 'missing from the build');

  const homeHtml = fileSet.has('index.html') ? readFileSync(join(DIR, 'index.html'), 'utf8') : '';
  const preview = /<meta name="robots" content="[^"]*noindex/.test(homeHtml);
  const problemOrWarn = preview ? warn : error;

  // Secrets and placeholders anywhere in text output.
  for (const file of files) {
    if (!/\.(html|xml|txt|json|js|css|webmanifest)$|^_headers$/.test(file)) continue;
    const text = readFileSync(join(DIR, file), 'utf8');
    // A real secret key is the prefix plus a long key; supabase-js itself only names the prefix (key-format check).
    if (/sb_secret_[A-Za-z0-9_-]{8,}|service_role|TURNSTILE_SECRET/.test(text)) error(file, 'contains a secret marker (sb_secret_… key / service_role / TURNSTILE_SECRET)');
    if (/\{\{[A-Z_]+\}\}/.test(text)) error(file, 'has an unfilled {{PLACEHOLDER}}');
    if (/\[OWNER NAME|owner@example\.invalid|preview\.invalid/.test(text)) {
      problemOrWarn(file, 'has preview placeholder values (company details / PUBLIC_SUPABASE_* not set)');
    }
    if (/palm-read-ai\.pages\.dev/.test(text)) error(file, 'links to the old address palm-read-ai.pages.dev');
  }

  // Registry ↔ build.
  const htmlFiles = files.filter((file) => file.endsWith('.html'));
  for (const page of PAGES) {
    if (!fileForPath(page.path, fileSet)) error(page.path, 'is in src/config/pages.ts but was not built');
  }
  for (const file of htmlFiles) {
    if (!PAGES.some((page) => page.path === pathForFile(file))) error(file, 'is built but not registered in src/config/pages.ts');
  }
  // A missing App Link page is an error only once App Links are switched on (assetlinks.json built):
  // until then the app opens none of these URLs, so the site can launch without the /hi/ guides.
  const appLinksOn = site.assetlinksSha256.length > 0;
  for (const path of APP_LINK_PATHS) {
    if (!fileForPath(path, fileSet)) (appLinksOn ? problemOrWarn : warn)(path, 'frozen App Link page (F1) is not built yet (guides step)');
  }

  // Pass 1: read every page.
  const pages = new Map();
  for (const file of htmlFiles) {
    const html = readFileSync(join(DIR, file), 'utf8');
    const path = pathForFile(file);
    const entry = PAGES.find((page) => page.path === path);
    const robots = tags(html, 'meta').find((m) => m.name === 'robots')?.content ?? '';
    pages.set(file, {
      file,
      html,
      path,
      entry,
      url: `${BASE}${path}`,
      noindex: /noindex/i.test(robots),
      canonical: tags(html, 'link').find((l) => l.rel === 'canonical')?.href ?? null,
      alternates: tags(html, 'link')
        .filter((l) => l.rel === 'alternate' && l.hreflang)
        .map((l) => ({ lang: l.hreflang, href: l.href })),
      lang: html.match(/<html[^>]*\blang="([^"]+)"/i)?.[1] ?? null,
      metas: tags(html, 'meta'),
      legal: LEGAL_FILES.includes(file),
      jsonLd: jsonLdNodes(html),
    });
  }
  const byUrl = new Map([...pages.values()].map((page) => [page.url, page]));
  // Every @id defined anywhere in the build (organization, website, person, app, the tools collection…).
  const definedIds = new Set([...pages.values()].flatMap((page) => page.jsonLd.nodes.map((node) => node['@id']).filter(Boolean)));

  // Pass 2: per page.
  for (const page of pages.values()) {
    const { file, html, entry } = page;
    const indexable = entry?.indexable ?? false;

    const title = decode(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? '');
    if (!title) error(file, 'no <title>');
    else if (indexable && chars(title) > 60) error(file, `title is ${chars(title)} characters (max 60): "${title}"`);
    if (!page.lang) error(file, '<html> has no lang');
    else if (entry && page.lang !== entry.locale) error(file, `lang="${page.lang}" but the registry says ${entry.locale}`);
    const h1s = (html.match(/<h1\b/gi) ?? []).length;
    if (h1s !== 1) error(file, `has ${h1s} <h1> elements (exactly one)`);

    // Indexing (F8).
    if (NOINDEX_FILES.includes(file) && !page.noindex) error(file, 'must carry noindex');
    if (preview && !page.noindex) error(file, 'preview build: every page must carry noindex');
    if (!preview && indexable && page.noindex) error(file, 'indexable page carries noindex in a production build');

    if (indexable) {
      const description = page.metas.find((m) => m.name === 'description')?.content ?? '';
      if (!description) error(file, 'no meta description');
      else if (chars(description) > 160 || chars(description) < 70) error(file, `meta description is ${chars(description)} characters (70–160)`);
      else if (chars(description) > 155) warn(file, `meta description is ${chars(description)} characters (aim for ≤ 155)`);
      if (page.canonical !== page.url) error(file, `canonical is ${page.canonical}, expected ${page.url}`);
      if (!page.legal) {
        for (const property of ['og:title', 'og:description', 'og:url', 'og:type', 'og:image']) {
          if (!page.metas.some((m) => m.property === property && m.content)) error(file, `no ${property}`);
        }
        const ogImage = page.metas.find((m) => m.property === 'og:image')?.content;
        if (ogImage && !fileSet.has(ogImage.replace(`${BASE}/`, ''))) error(file, `og:image ${ogImage} is not in the build`);
        // Per-page share images (scripts/make-og.mjs): warn when missing or when the page's H1 changed since.
        const og = OG_IMAGES[page.path];
        if (!og) warn(file, 'no per-page share image yet (npm run og after a build)');
        else if (og.title !== h1Text(html)) warn(file, `share image text is stale ("${og.title}"): npm run og after a build`);
        if (page.metas.find((m) => m.property === 'og:url')?.content !== page.url) error(file, 'og:url is not the canonical URL');
        if (!/max-image-preview:large/.test(page.metas.find((m) => m.name === 'robots')?.content ?? '') && !preview) {
          error(file, 'indexable page without max-image-preview:large');
        }
      }
    }

    // hreflang (SEO_PLAYBOOK.md §7): self, x-default → en, reciprocal, only for registered twins.
    const expectedTwin = entry?.twin;
    if (page.alternates.length && !expectedTwin) error(file, 'has hreflang but no twin in the registry');
    if (expectedTwin && !page.alternates.length) error(file, `registry twin ${expectedTwin} but no hreflang tags`);
    if (page.alternates.length) {
      const langs = page.alternates.map((a) => a.lang);
      if (new Set(langs).size !== langs.length) error(file, 'an hreflang value is listed twice');
      const self = page.alternates.find((a) => a.lang === page.lang);
      if (!self || self.href !== page.url) error(file, `hreflang="${page.lang}" must point to the page itself (${page.url})`);
      const xDefault = page.alternates.find((a) => a.lang === 'x-default');
      const en = page.alternates.find((a) => a.lang === 'en');
      if (!xDefault) error(file, 'hreflang set has no x-default');
      else if (!en || xDefault.href !== en.href) error(file, 'x-default must point to the English page');
      for (const alternate of page.alternates) {
        if (alternate.lang === 'x-default') continue;
        const target = byUrl.get(alternate.href);
        if (!target) {
          error(file, `hreflang="${alternate.lang}" points to ${alternate.href}, which is not a built page`);
          continue;
        }
        if (target.lang !== alternate.lang) error(file, `hreflang="${alternate.lang}" points to a page whose lang is "${target.lang}"`);
        if (!target.alternates.some((back) => back.href === page.url && back.lang === page.lang)) {
          error(file, `hreflang is not reciprocal: ${target.file} does not link back with hreflang="${page.lang}"`);
        }
      }
    }

    // Structured data.
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
    for (const block of blocks) {
      try {
        const data = JSON.parse(block);
        if (data['@context'] !== 'https://schema.org') error(file, 'JSON-LD @context must be https://schema.org');
        const serialised = JSON.stringify(data);
        for (const type of BANNED_SCHEMA) {
          if (new RegExp(`"@type":"${type}"|"${type.charAt(0).toLowerCase()}${type.slice(1)}"`).test(serialised)) {
            error(file, `JSON-LD contains banned ${type}`);
          }
        }
      } catch (problem) {
        error(file, `JSON-LD does not parse: ${problem.message}`);
      }
    }
    // One @graph per page (BaseLayout); Breadcrumbs.astro adds the BreadcrumbList as its own block.
    const pageBlocks = blocks.filter((block) => !block.includes('"@type":"BreadcrumbList"'));
    if (pageBlocks.length > 1 || pageBlocks.some((block) => !block.includes('"@graph"'))) error(file, 'JSON-LD must be one @graph block (BaseLayout joins the nodes)');
    checkGraph(page, definedIds);
    checkPageEntities(page);
    checkWebReadingClaims(page, preview);
    checkWritingPage(page);

    // Links: internal ones resolve (and their #fragment exists); Play ones carry the package + referrer.
    // A Play listing of ANOTHER app cited in the Sources box (a comparison post, CONTENT_GUIDE.md §7) is a
    // citation, not a store button: it is exempt, but only there, and never for our own package.
    const citedPlay = new Set(
      tags(html.match(/<ol class="sources-list[^"]*"[^>]*>[\s\S]*?<\/ol>/)?.[0] ?? '', 'a')
        .map((link) => link.href)
        .filter((href) => href?.startsWith('https://play.google.com/store/apps/details?') && new URL(href).searchParams.get('id') !== site.playPackage),
    );
    let storeLinks = 0;
    for (const a of tags(html, 'a')) {
      const href = a.href;
      if (!href || href.startsWith('mailto:')) continue;
      let target;
      try {
        target = new URL(href, page.url);
      } catch {
        error(file, `bad link ${href}`);
        continue;
      }
      if (target.host === 'play.google.com') {
        if (citedPlay.has(href)) continue;
        // The visitor's own Google Play order history (the refund steps on /refunds/) is not a store listing.
        if (target.pathname === '/store/account/orderhistory') continue;
        if (target.searchParams.get('id') !== site.playPackage) error(file, `Play link without id=${site.playPackage}`);
        const referrer = new URLSearchParams(target.searchParams.get('referrer') ?? '');
        if (referrer.get('utm_source') !== 'web' || !referrer.get('utm_medium') || !referrer.get('utm_campaign')) {
          error(file, `Play link without referrer utm_source=web + utm_medium + utm_campaign: ${href}`);
        }
        if ('data-store-link' in a) storeLinks += 1;
        continue;
      }
      if (/^https?:$/.test(target.protocol) && target.origin !== ORIGIN) continue;
      if (href.startsWith('#') || target.pathname === new URL(page.url).pathname) {
        const id = target.hash.slice(1);
        if (id && !new RegExp(`\\sid="${id}"`).test(html)) error(file, `in-page link #${id} has no target`);
        continue;
      }
      const targetFile = fileForPath(target.pathname, fileSet);
      if (!targetFile) {
        error(file, `broken link ${href}`);
        continue;
      }
      const id = target.hash.slice(1);
      if (id && targetFile.endsWith('.html')) {
        const targetHtml = pages.get(targetFile)?.html ?? '';
        if (!new RegExp(`\\sid="${id}"`).test(targetHtml)) error(file, `link ${href}: #${id} does not exist in ${targetFile}`);
      }
    }
    // Every store button has its price line (UX_PSYCHOLOGY.md §8.3).
    const priceLines = (html.match(/class="price-line\b/g) ?? []).length;
    if (storeLinks !== priceLines) error(file, `${storeLinks} store button(s) but ${priceLines} price line(s)`);

    if (!page.legal) {
      // A searched phrase that a sentence denies ("is palmistry accurate? No.") is wrapped in
      // <span data-denial> and skipped here (CONTENT_GUIDE.md §11: "a denial marked for review").
      const text = visibleText(html.replace(/<span\b[^>]*\bdata-denial\b[^>]*>[\s\S]*?<\/span>/gi, ' '));
      const denials = (html.match(/\bdata-denial\b/g) ?? []).length;
      if (denials > 2) error(file, `${denials} data-denial phrases (max 2 per page)`);
      // Every guide carries the limits box (CONTENT_GUIDE.md §4.11).
      if (/<article class="guide\b/.test(html) && !/\bdata-limits-box\b/.test(html)) error(file, 'guide without the "What palmistry can’t tell you" box');
      // A YMYL blog post carries the limits box too (BlogLayout adds it from `ymyl`, WEB-DEC-057).
      const ymyl = html.match(/<article class="blog-post\b[^>]*\bdata-ymyl="([a-z]+)"/)?.[1];
      if (ymyl && ymyl !== 'none' && !/\bdata-limits-box\b/.test(html)) error(file, `YMYL (${ymyl}) blog post without the "What palmistry can’t tell you" box`);
      for (const word of BANNED_WORDS) {
        const hit = text.match(word);
        if (hit) error(file, `banned wording "${hit[0].trim()}" (CONTENT_GUIDE.md §11)`);
      }

      // Weight budgets (QA_RELEASE.md §2.3).
      const isHome = page.path === '/' || page.path === '/hi/';
      const htmlGz = gz(html);
      const htmlBudget = isHome ? BUDGET.htmlGzip.home : page.path.startsWith('/tools/') ? BUDGET.htmlGzip.tool : BUDGET.htmlGzip.other;
      if (htmlGz > htmlBudget) error(file, `HTML is ${kb(htmlGz)} gzip (budget ${kb(htmlBudget)})`);
      let css = 0;
      for (const link of tags(html, 'link').filter((l) => l.rel === 'stylesheet' && l.href?.startsWith('/'))) {
        const cssFile = link.href.replace(/^\//, '');
        if (fileSet.has(cssFile)) css += gz(readFileSync(join(DIR, cssFile), 'utf8'));
      }
      for (const [, body] of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) css += gz(body);
      if (css > BUDGET.cssGzip) error(file, `CSS is ${kb(css)} gzip (budget ${kb(BUDGET.cssGzip)})`);
      let js = 0;
      const jsFiles = new Set();
      for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
        if (/application\/ld\+json/.test(attrs)) continue;
        const src = attrs.match(/src="([^"]+)"/)?.[1];
        if (src?.startsWith('/')) moduleFiles(src.replace(/^\//, ''), fileSet, jsFiles);
        else if (body.trim()) js += gz(body);
      }
      const isAccount = page.path === '/account/' || page.path === '/hi/account/';
      if (isAccount) {
        // The sign-in island is the page: count what it loads before it runs.
        for (const [, src] of html.matchAll(/(?:component|renderer)-url="\/([^"]+)"/g)) moduleFiles(src, fileSet, jsFiles);
      }
      for (const jsFile of jsFiles) js += gz(readFileSync(join(DIR, jsFile), 'utf8'));
      const photoTool = /data-tool-kind="(hand|device|ai)"/.test(html);
      const jsBudget = isHome ? BUDGET.jsGzip.home : isAccount ? BUDGET.jsGzip.account : photoTool ? BUDGET.jsGzip.photoTool : BUDGET.jsGzip.other;
      if (js > jsBudget) error(file, `our JS is ${kb(js)} gzip (budget ${kb(jsBudget)})`);
      page.weights = { html: htmlGz, css, js };

      // Fonts: English pages never preload Devanagari; at most 2 preloads.
      const preloads = tags(html, 'link').filter((l) => l.rel === 'preload' && l.as === 'font');
      if (preloads.length > 2) error(file, `${preloads.length} font preloads (max 2)`);
      if (page.lang === 'en' && preloads.some((l) => /devanagari/.test(l.href ?? ''))) error(file, 'English page preloads a Devanagari font');
    }
  }

  // Blog (WEB-DEC-057): every post is a BlogPosting, sits in the 'blog' sitemap group and is listed on /blog/.
  const blogIndex = pages.get('blog/index.html');
  const blogPosts = [...pages.values()].filter((page) => page.path !== '/blog/' && page.path.startsWith('/blog/'));
  for (const post of blogPosts) {
    if (!post.jsonLd.nodes.some((node) => node['@id'] === `${post.url}#article` && node['@type'] === 'BlogPosting')) {
      error(post.file, 'blog post without its BlogPosting JSON-LD ({url}#article)');
    }
    if (post.entry?.indexable && post.entry.sitemap !== 'blog') error(post.file, `blog post registered in sitemap group "${post.entry.sitemap}" (expected "blog")`);
    if (blogIndex && !tags(blogIndex.html, 'a').some((a) => a.href === post.path)) error('blog/index.html', `does not list ${post.path}`);
  }
  if (blogIndex && blogPosts.length === 0) warn('blog/index.html', 'lists no posts yet (an empty index is thin: publish the first posts before launch)');

  // Sitemaps: index → group files → exactly the indexable registry pages, alternates = head tags.
  const indexableUrls = new Set(PAGES.filter((page) => page.indexable).map((page) => `${BASE}${page.path}`));
  const seen = new Set();
  if (fileSet.has('sitemap-index.xml')) {
    const index = readFileSync(join(DIR, 'sitemap-index.xml'), 'utf8');
    const groupUrls = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decode(m[1]));
    if (groupUrls.length === 0) error('sitemap-index.xml', 'lists no sitemaps');
    for (const groupUrl of groupUrls) {
      const groupFile = groupUrl.replace(`${BASE}/`, '');
      if (!fileSet.has(groupFile)) {
        error('sitemap-index.xml', `lists ${groupUrl}, which is not built`);
        continue;
      }
      const xml = readFileSync(join(DIR, groupFile), 'utf8');
      for (const [, body] of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
        const loc = decode(body.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? '');
        if (seen.has(loc)) error(groupFile, `${loc} is listed twice`);
        seen.add(loc);
        const page = byUrl.get(loc);
        if (!indexableUrls.has(loc)) error(groupFile, `lists ${loc}, which is not an indexable registered page`);
        if (!page) error(groupFile, `lists ${loc}, which is not built`);
        const lastmod = body.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
        if (lastmod && !/^\d{4}-\d{2}-\d{2}$/.test(lastmod)) error(groupFile, `bad lastmod ${lastmod}`);
        // Image sitemap (SEMANTIC_SEO_PLAN.md §7.2): each <image:loc> is a built file that the page really shows.
        for (const [, imageUrl] of body.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)) {
          const imagePath = decode(imageUrl).replace(BASE, '');
          if (!fileSet.has(imagePath.slice(1))) error(groupFile, `${loc}: image ${imagePath} is not built`);
          else if (page && !page.html.includes(imagePath)) error(groupFile, `${loc}: lists image ${imagePath}, which the page does not show`);
        }
        const alternates = [...body.matchAll(/<xhtml:link rel="alternate" hreflang="([^"]+)" href="([^"]+)"\/>/g)]
          .map((m) => `${m[1]} ${decode(m[2])}`)
          .sort();
        const head = (page?.alternates ?? []).map((a) => `${a.lang} ${a.href}`).sort();
        if (page && alternates.join('|') !== head.join('|')) error(groupFile, `${loc}: sitemap hreflang differs from the <head> tags`);
      }
    }
  }
  for (const url of indexableUrls) if (!seen.has(url)) error('sitemaps', `do not list ${url}`);

  // llms.txt says the same about the web reading as the pages (knowledge-based trust, plan §5.5).
  if (fileSet.has('llms.txt') && !preview && !site.webReadingEnabled) {
    const llms = readFileSync(join(DIR, 'llms.txt'), 'utf8');
    if (!/not open yet/.test(llms)) error('llms.txt', 'must say the free web reading is not open yet (site.webReadingEnabled is false)');
  }

  // robots.txt (SEO_PLAYBOOK.md §10).
  if (fileSet.has('robots.txt')) {
    const robots = readFileSync(join(DIR, 'robots.txt'), 'utf8');
    if (!robots.split(/\r?\n/).includes(`Sitemap: ${BASE}/sitemap-index.xml`)) error('robots.txt', `must contain "Sitemap: ${BASE}/sitemap-index.xml"`);
    if (/^Disallow:\s*\/\s*$/m.test(robots)) error('robots.txt', 'blocks the whole site');
    if (/^Disallow:\s*\/(reading|account)/m.test(robots)) error('robots.txt', 'must not disallow /reading/ or /account/ (they carry noindex)');
  }

  // _headers (SECURITY_PRIVACY.md §5).
  if (fileSet.has('_headers')) {
    const headers = readFileSync(join(DIR, '_headers'), 'utf8');
    const blocks = headers.split(/\r?\n(?=\S)/);
    const all = blocks.find((part) => part.startsWith('/*')) ?? '';
    for (const [name, pattern] of [
      ['Strict-Transport-Security', /Strict-Transport-Security:\s*max-age=31536000/],
      ['X-Content-Type-Options', /X-Content-Type-Options:\s*nosniff/],
      ['frame-ancestors', /Content-Security-Policy:[^\n]*frame-ancestors 'none'/],
      ['X-Frame-Options', /X-Frame-Options:\s*DENY/],
      ['Permissions-Policy', /Permissions-Policy:\s*camera=\(\)/],
      ['Referrer-Policy', /Referrer-Policy:\s*strict-origin-when-cross-origin/],
    ]) {
      if (!pattern.test(all)) error('_headers', `the /* block has no ${name}`);
    }
    const assets = blocks.find((part) => part.startsWith('/.well-known/assetlinks.json')) ?? '';
    if (!/Content-Type:\s*application\/json/i.test(assets)) error('_headers', 'needs a /.well-known/assetlinks.json block with Content-Type: application/json');
  }

  // assetlinks.json (F2): never faked, never emitted while the SHA list is empty.
  const assetLinksFile = '.well-known/assetlinks.json';
  if (fileSet.has(assetLinksFile)) {
    if (site.assetlinksSha256.length === 0) error(assetLinksFile, 'built while site.assetlinksSha256 is empty');
    try {
      const statements = JSON.parse(readFileSync(join(DIR, assetLinksFile), 'utf8'));
      if (!Array.isArray(statements) || statements.length === 0) throw new Error('must be a non-empty array');
      for (const statement of statements) {
        if (!statement.relation?.includes('delegate_permission/common.handle_all_urls')) throw new Error('relation must include delegate_permission/common.handle_all_urls');
        const target = statement.target ?? {};
        if (target.namespace !== 'android_app') throw new Error('target.namespace must be android_app');
        if (target.package_name !== site.playPackage) throw new Error(`package_name must be ${site.playPackage}`);
        const prints = target.sha256_cert_fingerprints;
        if (!Array.isArray(prints) || prints.length === 0) throw new Error('sha256_cert_fingerprints is empty');
        for (const print of prints) if (!SHA256_FINGERPRINT.test(print)) throw new Error(`bad fingerprint ${print}`);
      }
    } catch (problem) {
      error(assetLinksFile, problem.message);
    }
  } else if (site.assetlinksSha256.length > 0) {
    error(assetLinksFile, 'site.assetlinksSha256 has fingerprints but the file was not built');
  } else {
    warn(assetLinksFile, 'not built (site.assetlinksSha256 is empty); Android App Links stay unverified until the owner adds the Play SHA-256');
  }

  // Source rules (DESIGN_SYSTEM.md §6): tokens only in components.
  for (const dir of ['src/components', 'src/islands']) {
    if (!existsSync(dir)) continue;
    for (const full of walk(dir)) {
      if (!/\.(astro|tsx|ts|jsx)$/.test(full)) continue;
      // Comments may name colours or use arrows; only code counts.
      const source = readFileSync(full, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
      const where = relative('.', full).replaceAll('\\', '/');
      const hex = source.match(/(?<![\w&])#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![\w-])/);
      if (hex) error(where, `raw hex colour ${hex[0]} in a component (use a token)`);
      if (/\b(shadow|blur|drop-shadow)-(sm|md|lg|xl|2xl|\[)/.test(source)) error(where, 'shadow/blur utility in a component');
      if (/\btracking-(?!display-en)[a-z]/.test(source)) error(where, 'tracking utility in a component');
      if (/\buppercase\b/.test(source)) error(where, 'uppercase in a component (sentence case only)');
      if (/→/.test(source)) error(where, '"→" in a component');
    }
  }

  // Report.
  const htmlCount = pages.size;
  console.log(`\ncheck-web: ${DIR}/ — ${htmlCount} pages, ${indexableUrls.size} indexable, base ${BASE}${preview ? ' (PREVIEW build: noindex everywhere)' : ' (PRODUCTION build)'}`);
  for (const page of pages.values()) {
    if (page.weights) {
      console.log(`  weight   ${page.file}: HTML ${kb(page.weights.html)}, CSS ${kb(page.weights.css)}, JS ${kb(page.weights.js)} (gzip)`);
    }
  }
  for (const line of warnings) console.log(`  warning  ${line}`);
  for (const line of errors) console.log(`  ERROR    ${line}`);
  console.log(errors.length ? `\nFAILED: ${errors.length} error(s), ${warnings.length} warning(s).` : `\nPASSED: 0 errors, ${warnings.length} warning(s).`);
  process.exit(errors.length ? 1 : 0);
}

main();
