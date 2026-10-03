/**
 * Per-page share images (WEB-FEAT-015): one 1200×630 JPEG per indexable page
 * and language, with the page's own H1 on the brand look (deep indigo, gold,
 * the home hero's 3D hand with the 4 lines). Uses the installed Chrome
 * (playwright-core from research-tools/, as make-images.mjs does).
 *
 *   npm run build          (the titles are read from dist/)
 *   npm run og             writes public/og/*.jpg + src/config/og-images.json
 *   npm run build          so every page's og:image points at its own file
 *
 *   --dir <folder>         read the titles from another build folder (default dist/)
 *   --only /a/,/b/         redo only these pages and MERGE them into the manifest; every other
 *                          image and entry is kept (safe while other work adds pages in parallel)
 *
 * Run it again when a page's H1 changes or a page is added: check-web warns
 * when an image's text no longer matches its page. Pages without an entry keep
 * the default share image (public/og-default*.png). Hindi images double as the
 * conjunct test (हस्तरेखा) for Tiro Devanagari.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PAGES } from '../src/config/pages.ts';
import { h1Text, ogSlug } from './og-lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(join(root, 'research-tools', 'package.json'));
const { chromium } = require('playwright-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const arg = (name) => (process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : undefined);
const DIST = join(root, arg('--dir') ?? 'dist');
const ONLY = arg('--only')?.split(',').map((path) => path.trim()).filter(Boolean) ?? null;
const OUT = join(root, 'public', 'og');
const MANIFEST = join(root, 'src', 'config', 'og-images.json');

if (!existsSync(join(DIST, 'index.html'))) {
  console.error(`No build in ${DIST}. Run npm run build first.`);
  process.exit(1);
}

const dataUrl = (file, type) => `data:${type};base64,${readFileSync(join(root, file)).toString('base64')}`;
const font = (pkg, file) => dataUrl(join('node_modules', '@fontsource', pkg, 'files', file), 'font/woff2');
const DEVA = 'unicode-range: U+0900-097F, U+1CD0-1CF9, U+200C-200D, U+20A8, U+20B9, U+25CC, U+A830-A839, U+A8E0-A8FF;';
const fontCss = `
@font-face { font-family: Mukta; font-weight: 400; src: url(${font('mukta', 'mukta-latin-400-normal.woff2')}) format('woff2'); }
@font-face { font-family: Mukta; font-weight: 400; src: url(${font('mukta', 'mukta-devanagari-400-normal.woff2')}) format('woff2'); ${DEVA} }
@font-face { font-family: Mukta; font-weight: 700; src: url(${font('mukta', 'mukta-latin-700-normal.woff2')}) format('woff2'); }
@font-face { font-family: Mukta; font-weight: 700; src: url(${font('mukta', 'mukta-devanagari-700-normal.woff2')}) format('woff2'); ${DEVA} }
@font-face { font-family: Display; font-weight: 700; src: url(${font('cormorant-garamond', 'cormorant-garamond-latin-700-normal.woff2')}) format('woff2'); }
@font-face { font-family: Display; font-weight: 700; src: url(${font('tiro-devanagari-hindi', 'tiro-devanagari-hindi-devanagari-400-normal.woff2')}) format('woff2'); ${DEVA} }
`;

const wordmark = readFileSync(join(root, 'src', 'components', 'Logo.astro'), 'utf8')
  .match(/<svg class="logo-word"[\s\S]*?<\/svg>/)[0]
  .replace('class="logo-word"', 'class="word"')
  .replace(/ role="img" aria-label=\{site\.brand\}/, '');
const HAND = dataUrl('public/images/hero/hand-v1-900.webp', 'image/webp');

// Classic line colours (DESIGN_SYSTEM.md §2.3, global.css Night tokens).
const LINES = {
  en: [['Heart', '#FF4D5E'], ['Head', '#4C8DFF'], ['Life', '#2FD06A'], ['Fate', '#B26BFF']],
  hi: [['हृदय', '#FF4D5E'], ['मस्तिष्क', '#4C8DFF'], ['जीवन', '#2FD06A'], ['भाग्य', '#B26BFF']],
};

function kicker(path, locale) {
  if (path === '/' || path === '/hi/') return locale === 'hi' ? 'मुफ़्त AI हस्तरेखा' : 'Free AI palm reading';
  if (/\/app\/$/.test(path)) return locale === 'hi' ? 'Android ऐप' : 'Android app';
  if (path.includes('/tools/')) return locale === 'hi' ? 'मुफ़्त टूल' : path === '/tools/' ? 'Free tools' : 'Free palm tool';
  if (/^(?:\/hi)?\/blog\//.test(path)) return locale === 'hi' ? 'ब्लॉग' : 'Blog';
  return locale === 'hi' ? 'हस्तरेखा गाइड' : 'Palmistry guide';
}

const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

function card({ title, locale, path }) {
  const hi = locale === 'hi';
  const n = [...title].length;
  const size = hi ? (n > 48 ? 50 : n > 32 ? 56 : 62) : n > 64 ? 50 : n > 46 ? 58 : n > 30 ? 66 : 74;
  const chips = LINES[locale]
    .map(([name, color]) => `<li><i style="background:${color};box-shadow:0 0 12px ${color}"></i>${escapeHtml(name)}</li>`)
    .join('');
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><style>${fontCss}
*{box-sizing:border-box}
html,body{margin:0;width:1200px;height:630px;overflow:hidden}
body{position:relative;color:#F6F0E1;font-family:Mukta,sans-serif;
  background:radial-gradient(640px 520px at 930px 330px,rgba(178,107,255,0.30),transparent 70%),
    radial-gradient(420px 360px at 930px 360px,rgba(230,184,92,0.20),transparent 70%),
    linear-gradient(155deg,#241C55 0%,#15132F 48%,#0B0A1F 100%)}
body::before{content:"";position:absolute;inset:18px;border-radius:30px;border:1px solid rgba(230,184,92,0.30);
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.06)}
.dust{position:absolute;inset:0;background-image:radial-gradient(1.2px 1.2px at 12% 20%,rgba(246,240,225,.5),transparent),
  radial-gradient(1px 1px at 48% 12%,rgba(230,184,92,.6),transparent),radial-gradient(1.4px 1.4px at 88% 16%,rgba(246,240,225,.45),transparent),
  radial-gradient(1px 1px at 64% 86%,rgba(230,184,92,.5),transparent),radial-gradient(1.2px 1.2px at 30% 92%,rgba(246,240,225,.35),transparent),
  radial-gradient(1px 1px at 96% 70%,rgba(230,184,92,.55),transparent),radial-gradient(1.3px 1.3px at 58% 40%,rgba(246,240,225,.3),transparent)}
.copy{position:absolute;left:78px;top:64px;bottom:64px;width:660px;display:flex;flex-direction:column}
.word{height:30px;width:auto;fill:#F6F0E1;display:block;align-self:flex-start}
.kicker{margin-top:auto;align-self:flex-start;font-weight:700;font-size:21px;letter-spacing:${hi ? 0 : '0.02em'};color:#E6B85C;
  padding:5px 16px;border-radius:999px;background:rgba(230,184,92,0.12);border:1px solid rgba(230,184,92,0.38)}
h1{margin:18px 0 0;font-family:Display,serif;font-weight:700;font-size:${size}px;line-height:${hi ? 1.45 : 1.06};
  letter-spacing:${hi ? 0 : '-0.01em'};font-synthesis:none;text-wrap:balance;display:-webkit-box;-webkit-line-clamp:${hi ? 3 : 4};-webkit-box-orient:vertical;overflow:hidden}
.rule{margin:26px 0 0;width:96px;height:2px;background:linear-gradient(90deg,#E6B85C,rgba(230,184,92,0))}
ul{display:flex;gap:10px;list-style:none;margin:22px 0 auto;padding:0}
li{display:flex;align-items:center;gap:9px;white-space:nowrap;font-size:20px;color:#C3B9D8;padding:4px 14px 4px 12px;border-radius:999px;
  background:rgba(21,19,47,0.75);border:1px solid rgba(246,240,225,0.12)}
i{width:11px;height:11px;border-radius:50%;display:block}
.url{position:absolute;left:78px;bottom:40px;font-size:20px;color:#8F88B5;letter-spacing:0.02em}
.hand{position:absolute;right:28px;top:22px;width:560px;height:586px;display:flex;align-items:center;justify-content:center}
.hand::before{content:"";position:absolute;width:430px;height:430px;border-radius:50%;
  border:1px solid rgba(230,184,92,0.35);box-shadow:0 0 80px rgba(230,184,92,0.18),inset 0 0 60px rgba(178,107,255,0.18)}
.hand img{position:relative;width:600px;height:600px;object-fit:contain;filter:drop-shadow(0 24px 40px rgba(0,0,0,0.45))}
</style></head><body><div class="dust"></div>
<div class="hand"><img src="${HAND}" alt=""></div>
<div class="copy">${wordmark}<span class="kicker">${escapeHtml(kicker(path, locale))}</span><h1>${escapeHtml(title)}</h1><div class="rule"></div><ul>${chips}</ul></div>
<div class="url">palmsays.com</div></body></html>`;
}

/** The built HTML file for a registry path (directory pages only; the legal .html pages keep their own head). */
function builtFile(path) {
  if (!path.endsWith('/')) return null;
  const file = join(DIST, path.replace(/^\//, ''), 'index.html');
  return existsSync(file) ? file : null;
}

const jobs = [];
for (const page of PAGES) {
  if (!page.indexable) continue;
  if (ONLY && !ONLY.includes(page.path)) continue;
  const file = builtFile(page.path);
  if (!file) continue;
  const title = h1Text(readFileSync(file, 'utf8'));
  if (!title) {
    console.warn(`skip ${page.path}: no <h1>`);
    continue;
  }
  jobs.push({ path: page.path, locale: page.locale, title, out: `${ogSlug(page.path)}.jpg` });
}

mkdirSync(OUT, { recursive: true });
const keep = new Set(jobs.map((job) => job.out));
// A full run removes images of pages that are gone; --only never removes anything.
if (!ONLY) for (const name of readdirSync(OUT)) if (!keep.has(name)) rmSync(join(OUT, name));

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const manifest = {};
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  for (const job of jobs) {
    await page.setContent(card(job), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: join(OUT, job.out), type: 'jpeg', quality: 84 });
    manifest[job.path] = { image: `/og/${job.out}`, title: job.title };
  }
} finally {
  await browser.close();
}
// --only: merge into the manifest as it is on disk right now, so entries written by other work stay.
const merged = ONLY && existsSync(MANIFEST) ? { ...JSON.parse(readFileSync(MANIFEST, 'utf8')), ...manifest } : manifest;
writeFileSync(MANIFEST, `${JSON.stringify(merged, null, 2)}\n`);
console.log(`wrote ${jobs.length} share images to public/og/ and src/config/og-images.json`);
