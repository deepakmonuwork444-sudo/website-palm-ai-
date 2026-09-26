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
 * Exit 1 on any error. Warnings never fail the build.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, posix, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

import { PAGES, registryProblems } from '../src/config/pages.ts';
import { SHA256_FINGERPRINT, site } from '../src/config/site.ts';

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
const BANNED_SCHEMA = ['AggregateRating', 'Review', 'HowTo', 'Product'];
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
  jsGzip: { home: 60 * 1024, other: 10 * 1024 },
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

function main() {
  if (!existsSync(DIR)) {
    console.error(`No built site at ${DIR}/. Run npm run build first.`);
    process.exit(1);
  }
  for (const problem of registryProblems()) error('src/config/pages.ts', problem);

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
  for (const path of APP_LINK_PATHS) {
    if (!fileForPath(path, fileSet)) problemOrWarn(path, 'frozen App Link page (F1) is not built yet (guides step)');
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
    });
  }
  const byUrl = new Map([...pages.values()].map((page) => [page.url, page]));

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
        if (data['@type'] === 'FAQPage' && (html.match(/<details\b/gi) ?? []).length < 3) error(file, 'FAQPage with fewer than 3 visible FAQs');
      } catch (problem) {
        error(file, `JSON-LD does not parse: ${problem.message}`);
      }
    }

    // Links: internal ones resolve (and their #fragment exists); Play ones carry the package + referrer.
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
      for (const jsFile of jsFiles) js += gz(readFileSync(join(DIR, jsFile), 'utf8'));
      const jsBudget = isHome ? BUDGET.jsGzip.home : BUDGET.jsGzip.other;
      if (js > jsBudget) error(file, `our JS is ${kb(js)} gzip (budget ${kb(jsBudget)})`);
      page.weights = { html: htmlGz, css, js };

      // Fonts: English pages never preload Devanagari; at most 2 preloads.
      const preloads = tags(html, 'link').filter((l) => l.rel === 'preload' && l.as === 'font');
      if (preloads.length > 2) error(file, `${preloads.length} font preloads (max 2)`);
      if (page.lang === 'en' && preloads.some((l) => /devanagari/.test(l.href ?? ''))) error(file, 'English page preloads a Devanagari font');
    }
  }

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
        const alternates = [...body.matchAll(/<xhtml:link rel="alternate" hreflang="([^"]+)" href="([^"]+)"\/>/g)]
          .map((m) => `${m[1]} ${decode(m[2])}`)
          .sort();
        const head = (page?.alternates ?? []).map((a) => `${a.lang} ${a.href}`).sort();
        if (page && alternates.join('|') !== head.join('|')) error(groupFile, `${loc}: sitemap hreflang differs from the <head> tags`);
      }
    }
  }
  for (const url of indexableUrls) if (!seen.has(url)) error('sitemaps', `do not list ${url}`);

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
