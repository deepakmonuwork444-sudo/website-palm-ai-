/**
 * Internal broken-link checker over the built site (WEB-FEAT-016). Every
 * same-site URL in dist/ must resolve to a built file, the way Workers static
 * assets serve it (html_handling "auto-trailing-slash"), and every #fragment
 * pointing into an HTML page must exist there. Covers <a>, <link>, <img>/<source>
 * src + srcset, <script>, <video> poster, og:/twitter: images, CSS url(),
 * sitemap <loc> + hreflang alternates, robots.txt and llms.txt.
 *
 *   npm run build && npm run links        (or: node scripts/links.mjs --dir dist)
 *
 * External links are not fetched (Play, sources): check-web covers Play links.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { site } from '../src/config/site.ts';

const dirArg = process.argv.indexOf('--dir');
const DIR = dirArg !== -1 ? process.argv[dirArg + 1] : 'dist';
const ORIGIN = new URL(site.baseUrl).origin;

if (!existsSync(DIR)) {
  console.error(`No built site at ${DIR}/. Run npm run build first.`);
  process.exit(1);
}

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
const files = walk(DIR).map((full) => relative(DIR, full).replaceAll('\\', '/'));
const fileSet = new Set(files);

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#38;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

function fileForPath(path) {
  let clean;
  try {
    clean = decodeURIComponent(path).replace(/^\//, '');
  } catch {
    return null;
  }
  const candidates = clean === '' || clean.endsWith('/') ? [`${clean}index.html`] : [clean, `${clean}.html`, `${clean}/index.html`];
  return candidates.find((candidate) => fileSet.has(candidate)) ?? null;
}

/** The URL a built file is served at. */
function urlForFile(file) {
  if (file === 'index.html') return `${ORIGIN}/`;
  if (file.endsWith('/index.html')) return `${ORIGIN}/${file.slice(0, -'index.html'.length)}`;
  return `${ORIGIN}/${file.replace(/\.html$/, '')}`;
}

const idCache = new Map();
function hasId(file, id) {
  if (!idCache.has(file)) {
    const html = readFileSync(join(DIR, file), 'utf8');
    idCache.set(file, new Set([...html.matchAll(/\s(?:id|name)="([^"]+)"/g)].map((m) => m[1])));
  }
  return idCache.get(file).has(id);
}

const problems = [];
let checked = 0;

function check(from, raw, base) {
  const value = decode(raw.trim());
  // Skipped: non-web schemes, template text, and fragment-only url(#id) / url(%23id) refs inside inline SVG data.
  if (!value || /^(data|blob|mailto|tel|javascript|about):/i.test(value) || /^(\{|\$\{|%23|var\()/.test(value)) return;
  let url;
  try {
    url = new URL(value, base);
  } catch {
    problems.push(`${from}: bad URL "${value}"`);
    return;
  }
  if (!/^https?:$/.test(url.protocol) || url.origin !== ORIGIN) return;
  checked += 1;
  const target = fileForPath(url.pathname);
  if (!target) {
    problems.push(`${from}: broken link ${value}`);
    return;
  }
  const id = decodeURIComponent(url.hash.slice(1));
  // .svg too: every <use href="/img/guides/palm-sprite.svg?v=…#id"> must name an id the sprite has (WEB-DEC-052).
  if (id && /\.(html|svg)$/.test(target) && !hasId(target, id)) problems.push(`${from}: ${value} → #${id} does not exist in ${target}`);
}

for (const file of files) {
  const full = join(DIR, file);
  if (file.endsWith('.html')) {
    const html = readFileSync(full, 'utf8').replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, '');
    const base = urlForFile(file);
    for (const [, tag, attrs] of html.matchAll(/<(a|link|img|source|script|video|audio|iframe|meta|use|image)\b([^>]*)>/gi)) {
      const attr = (name) => attrs.match(new RegExp(`\\s${name}="([^"]*)"`, 'i'))?.[1];
      const name = tag.toLowerCase();
      if (name === 'meta') {
        const property = attr('property') ?? attr('name') ?? '';
        if (/^(og:image|og:url|twitter:image)$/.test(property)) check(file, attr('content') ?? '', base);
        continue;
      }
      if (name === 'link' && /preconnect|dns-prefetch/.test(attr('rel') ?? '')) continue;
      for (const key of ['href', 'src', 'poster', 'xlink:href']) {
        const value = attr(key);
        if (value !== undefined) check(file, value, base);
      }
      for (const key of ['srcset', 'imagesrcset']) {
        const value = attr(key);
        if (value) for (const part of value.split(',')) check(file, part.trim().split(/\s+/)[0] ?? '', base);
      }
    }
    for (const [, value] of html.matchAll(/url\((?:'|")?([^'")]+)(?:'|")?\)/g)) check(file, value, base);
  } else if (file.endsWith('.css')) {
    const css = readFileSync(full, 'utf8');
    for (const [, value] of css.matchAll(/url\((?:'|")?([^'")]+)(?:'|")?\)/g)) check(file, value, `${ORIGIN}/${file}`);
  } else if (file.endsWith('.xml')) {
    const xml = readFileSync(full, 'utf8');
    for (const [, value] of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) check(file, value, `${ORIGIN}/`);
    for (const [, value] of xml.matchAll(/<xhtml:link[^>]*href="([^"]+)"/g)) check(file, value, `${ORIGIN}/`);
  } else if (file === 'robots.txt' || file === 'llms.txt') {
    const text = readFileSync(full, 'utf8');
    for (const [value] of text.matchAll(/https?:\/\/[^\s)<>"]+/g)) check(file, value, `${ORIGIN}/`);
  }
}

console.log(`\nlinks: ${DIR}/, ${files.length} files, ${checked} internal URLs checked`);
for (const line of [...new Set(problems)]) console.log(`  ERROR    ${line}`);
console.log(problems.length ? `\nFAILED: ${new Set(problems).size} broken link(s).` : '\nPASSED: 0 broken links.');
process.exit(problems.length ? 1 : 0);
