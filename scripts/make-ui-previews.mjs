/**
 * Real screens of the reading page for the home page's "How it works" row
 * (public/samples/ui-step-{1,2,3}-{en,hi}.webp). Captured from the built site
 * in PREVIEW mock mode (`/reading/?reading=mock`: the app's real pipeline on a
 * stored real scan; nothing is sent anywhere):
 *   1. the first screen (photo tips + the photo button);
 *   2. the tracing screen, on the home page's own sample photo (the scan has
 *      not returned yet, so no line is drawn on it);
 *   3. the start of the finished reading's TEXT (at a glance + Love). The
 *      traced photo is left out on purpose: the stored scan belongs to another
 *      photo, so its lines would not sit on this one.
 *
 *   npm run build && node scripts/make-ui-previews.mjs [baseUrl]
 *
 * Serves dist/ itself. Needs a preview build (PUBLIC_ENV not "production"), Chrome and
 * research-tools/node_modules (playwright-core). Re-run when the reading UI changes.
 */

import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer as createHttpServer } from 'node:http';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(join(root, 'research-tools', 'package.json'));
const { chromium } = require('playwright-core');
const sharp = require(join(root, 'node_modules', 'sharp'));
const OUT = join(root, 'public', 'samples');
const PHOTO = join(root, 'public', 'samples', 'hero-palm-1200.jpg');

const freePort = () =>
  new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });

// A tiny static server over dist/ (astro preview allows only one instance per project).
const TYPES = { html: 'text/html; charset=utf-8', js: 'text/javascript', css: 'text/css', json: 'application/json', svg: 'image/svg+xml', png: 'image/png', webp: 'image/webp', avif: 'image/avif', jpg: 'image/jpeg', woff2: 'font/woff2', txt: 'text/plain' };
let base = process.argv[2];
let server = null;
if (!base) {
  const port = await freePort();
  base = `http://127.0.0.1:${port}`;
  server = createHttpServer((req, res) => {
    let path = decodeURIComponent(new URL(req.url, base).pathname);
    if (path.endsWith('/')) path += 'index.html';
    const file = join(root, 'dist', path);
    if (!file.startsWith(join(root, 'dist')) || !existsSync(file) || statSync(file).isDirectory()) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'content-type': TYPES[extname(file).slice(1)] ?? 'application/octet-stream' });
    res.end(readFileSync(file));
  }).listen(port, '127.0.0.1');
}

/** Save a 4:5 clip from the top of an element (page coordinates) as a 560 x 700 WebP. */
async function save(page, locator, name) {
  const clip = await locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + window.scrollX, y: r.top + window.scrollY, width: r.width };
  });
  const png = await page.screenshot({ fullPage: true, clip: { ...clip, height: Math.round((clip.width * 5) / 4) } });
  await sharp(png).resize(560, 700, { fit: 'cover', position: 'top' }).webp({ quality: 76, effort: 6 }).toFile(join(OUT, name));
  console.log(`wrote public/samples/${name}`);
}

const photo = readFileSync(PHOTO).toString('base64');
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  for (const locale of ['en', 'hi']) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.goto(`${base}/reading/?reading=mock${locale === 'hi' ? '&lang=hi' : ''}`, { waitUntil: 'networkidle' });
    const pick = page.locator('.rd-pick');
    await pick.waitFor();
    await page.waitForTimeout(400);
    await save(page, pick, `ui-step-1-${locale}.webp`);

    await page.evaluate(async (b64) => {
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const file = new File([bytes], 'palm.jpg', { type: 'image/jpeg' });
      const input = document.querySelectorAll('input[type=file]')[1];
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }, photo);
    await page.locator('.rd-review').waitFor({ timeout: 20_000 });
    await page.locator('.rd-review .rd-seg').first().click();
    await page.locator('.rd-review button.btn-gold').first().click();
    const working = page.locator('.rd-working');
    await working.waitFor({ timeout: 20_000 });
    await page.waitForTimeout(700);
    await save(page, working, `ui-step-2-${locale}.webp`);

    await page.locator('.rd-glance').waitFor({ timeout: 30_000 });
    await page.waitForTimeout(600);
    await save(page, page.locator('.rd-glance'), `ui-step-3-${locale}.webp`);
    await context.close();
  }
} finally {
  await browser.close();
  server?.close();
}
