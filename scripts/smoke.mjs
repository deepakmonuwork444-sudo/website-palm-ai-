/**
 * Launch smoke test (WEB-FEAT-016): opens every page of the built site in the
 * installed Chrome (playwright-core from research-tools/) at phone width
 * (390×844) and checks what a visitor would hit first:
 *   HTTP 200 · no console errors or page errors · no failed same-site request ·
 *   no sideways scroll · exactly one <h1> · <title> + meta description ·
 *   canonical = https://palmsays.com<path> on indexable pages · every visible image loads.
 *
 *   npm run build && npm run smoke            (serves dist/ itself on http://localhost:4333)
 *   node scripts/smoke.mjs --only /app/,/tools/   a few pages
 *   node scripts/smoke.mjs --serve               only serve dist/ on :4333 (Lighthouse), Ctrl+C to stop
 *
 * Pages = the sitemap URLs + the noindex pages of src/config/pages.ts.
 * The little server copies Workers' html_handling "auto-trailing-slash".
 */

import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PAGES } from '../src/config/pages.ts';
import { site } from '../src/config/site.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(join(root, 'research-tools', 'package.json'));
const { chromium } = require('playwright-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const DIST = join(root, 'dist');
const PORT = 4333;
const LOCAL = `http://localhost:${PORT}`;
const WIDTH = 390;

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('No build in dist/. Run npm run build first.');
  process.exit(1);
}

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.mp4': 'video/mp4',
  '.webm': 'video/webm', '.glb': 'model/gltf-binary', '.wasm': 'application/wasm', '.tflite': 'application/octet-stream',
  '.task': 'application/octet-stream', '.ico': 'image/x-icon', '.pdf': 'application/pdf',
};

const isFile = (path) => existsSync(path) && statSync(path).isFile();

function resolve(pathname) {
  const clean = decodeURIComponent(pathname).replace(/^\/+/, '');
  const full = join(DIST, clean);
  if (!full.startsWith(DIST)) return { status: 404 };
  if (clean === '' || clean.endsWith('/')) return isFile(join(full, 'index.html')) ? { file: join(full, 'index.html') } : { status: 404 };
  if (isFile(full)) return { file: full };
  if (isFile(`${full}.html`)) return { file: `${full}.html` };
  if (isFile(join(full, 'index.html'))) return { redirect: `/${clean}/` };
  return { status: 404 };
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', LOCAL);
  const found = resolve(url.pathname);
  if (found.redirect) {
    res.writeHead(301, { Location: found.redirect + url.search }).end();
    return;
  }
  const file = found.file ?? join(DIST, '404.html');
  const status = found.file ? 200 : 404;
  if (!isFile(file)) {
    // dist/ is being rebuilt under us (another build running): answer plainly instead of crashing.
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('not found');
    return;
  }
  const size = statSync(file).size;
  const type = TYPES[extname(file)] ?? 'application/octet-stream';
  const range = req.headers.range?.match(/bytes=(\d*)-(\d*)/);
  if (range && status === 200) {
    const start = range[1] ? Number(range[1]) : 0;
    const end = range[2] ? Number(range[2]) : size - 1;
    res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 });
    createReadStream(file, { start, end }).pipe(res);
    return;
  }
  res.writeHead(status, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes' });
  if (req.method === 'HEAD') res.end();
  else createReadStream(file).pipe(res);
});

// Pages: every sitemap URL + the noindex registry pages.
const sitemapPaths = [];
const index = readFileSync(join(DIST, 'sitemap-index.xml'), 'utf8');
for (const [, groupUrl] of index.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const xml = readFileSync(join(DIST, new URL(groupUrl).pathname), 'utf8');
  for (const [, loc] of xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>/g)) sitemapPaths.push(new URL(loc).pathname);
}
const extra = PAGES.filter((page) => !page.indexable && page.path !== '/404').map((page) => page.path);
const onlyArg = process.argv.indexOf('--only');
const only = onlyArg !== -1 ? process.argv[onlyArg + 1].split(',') : null;
const paths = [...new Set([...sitemapPaths, ...extra])].filter((path) => !only || only.includes(path));
const indexable = new Set(sitemapPaths);

await new Promise((ok) => server.listen(PORT, ok));
if (process.argv.includes('--serve')) {
  // Only serve dist/ (for Lighthouse or a manual look); stop with Ctrl+C.
  console.log(`serving dist/ on ${LOCAL}`);
  await new Promise(() => {});
}
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const results = [];
try {
  const context = await browser.newContext({ viewport: { width: WIDTH, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  for (const path of paths) {
    const page = await context.newPage();
    const problems = [];
    page.on('console', (message) => {
      if (message.type() === 'error') problems.push(`console: ${message.text().slice(0, 200)}`);
    });
    page.on('pageerror', (error) => problems.push(`page error: ${error.message.slice(0, 200)}`));
    page.on('requestfailed', (request) => {
      const failure = request.failure()?.errorText ?? '';
      // Media the browser stops on purpose (preload switched, video paused) is not a failure.
      if (/ERR_ABORTED/.test(failure) && /\.(mp4|webm)$/.test(new URL(request.url()).pathname)) return;
      problems.push(`request failed: ${request.url().replace(LOCAL, '')} (${failure})`);
    });
    page.on('response', (response) => {
      if (response.url().startsWith(LOCAL) && response.status() >= 400) problems.push(`HTTP ${response.status()}: ${response.url().replace(LOCAL, '')}`);
    });
    const response = await page.goto(LOCAL + path, { waitUntil: 'load', timeout: 60000 }).catch((error) => {
      problems.push(`navigation: ${error.message.slice(0, 160)}`);
      return null;
    });
    if (response && response.status() !== 200) problems.push(`status ${response.status()}`);
    if (response) {
      // Scroll through the page so lazy images and reveal effects load, then check.
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((ok) => setTimeout(ok, 60));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      // Lazy images off to the side (carousels, closed panels) never come near the viewport: load them now,
      // so "did not load" means a real broken file, not an image the visitor has not reached.
      await page.evaluate(async () => {
        const pending = [...document.images].filter((img) => !img.complete || img.naturalWidth === 0);
        for (const img of pending) img.loading = 'eager';
        await Promise.race([
          Promise.all(pending.map((img) => img.decode().catch(() => {}))),
          new Promise((ok) => setTimeout(ok, 8000)),
        ]);
      });
      const facts = await page.evaluate(() => {
        const images = [...document.images].filter((img) => img.getClientRects().length > 0 && getComputedStyle(img).visibility !== 'hidden');
        return {
          scrollWidth: document.documentElement.scrollWidth,
          h1: document.querySelectorAll('h1').length,
          title: document.title.trim(),
          description: document.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() ?? '',
          canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null,
          broken: images.filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.currentSrc || img.src),
        };
      });
      if (facts.scrollWidth > WIDTH) problems.push(`sideways scroll: page is ${facts.scrollWidth}px wide at ${WIDTH}px`);
      if (facts.h1 !== 1) problems.push(`${facts.h1} <h1> elements`);
      if (!facts.title) problems.push('no <title>');
      if (!facts.description) problems.push('no meta description');
      if (indexable.has(path) && facts.canonical !== `${site.baseUrl}${path}`) problems.push(`canonical ${facts.canonical}, expected ${site.baseUrl}${path}`);
      for (const src of facts.broken) problems.push(`image did not load: ${src.replace(LOCAL, '')}`);
    }
    results.push({ path, problems: [...new Set(problems)] });
    console.log(`${problems.length ? 'FAIL' : 'ok  '}  ${path}${problems.length ? `\n        ${[...new Set(problems)].join('\n        ')}` : ''}`);
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}

const failed = results.filter((result) => result.problems.length);
console.log(failed.length ? `\nsmoke FAILED: ${failed.length} of ${results.length} pages have problems.` : `\nsmoke PASSED: ${results.length} pages, 0 problems.`);
process.exit(failed.length ? 1 : 0);
