/**
 * Photo tools, end to end in a real browser (headless Chrome), with real palm
 * photos (tests/fixtures/palms/, free licences, see ATTRIBUTION.txt):
 *
 *   npm run build && node tests/e2e/photo-tools.mjs
 *
 * For each tool: picks a photo, waits for the real result (the hand model
 * runs in the page), saves mobile 390×844 @2x and desktop 1440×900 shots to
 * qa/shots/<date>-photo-tools/, and FAILS if any request after the pick
 * sends data (POST/PUT) or goes anywhere but this site — the photo must
 * never leave the device. Mock mode (line finder, lines of left vs right)
 * runs with ?reading=mock on the preview build.
 */

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const fixtures = join(root, 'tests', 'fixtures', 'palms');
const date = new Date().toISOString().slice(0, 10);
const outDir = join(root, 'qa', 'shots', `${date}-photo-tools`);
mkdirSync(outDir, { recursive: true });

const freePort = () =>
  new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });

const port = await freePort();
let base = `http://127.0.0.1:${port}`;
const preview = spawn(process.execPath, [join(root, 'node_modules', 'astro', 'bin', 'astro.mjs'), 'preview', '--host', '127.0.0.1', '--port', String(port)], {
  cwd: root,
  stdio: ['ignore', 'pipe', 'pipe'],
});
let previewOutput = '';
preview.stdout.on('data', (chunk) => (previewOutput += chunk));
preview.stderr.on('data', (chunk) => (previewOutput += chunk));
const stop = () => {
  if (!preview.killed && preview.exitCode === null) preview.kill();
};
process.on('exit', stop);

const deadline = Date.now() + 60_000;
for (;;) {
  if (preview.exitCode !== null) {
    const running = previewOutput.match(/already running[\s\S]*?URL:\s*(http:\/\/\S+)/);
    if (!running) throw new Error(`astro preview stopped:\n${previewOutput}`);
    base = running[1].replace(/\/+$/, '');
  }
  try {
    if ((await fetch(`${base}/tools/`)).ok) break;
  } catch {
    // not up yet
  }
  if (Date.now() > deadline) throw new Error(`astro preview did not start; run npm run build first
${previewOutput}`);
  await new Promise((resolve) => setTimeout(resolve, 400));
}

const require = createRequire(join(root, 'research-tools', 'package.json'));
const { chromium } = require('playwright-core');
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });

const views = {
  mobile: {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Mobile Safari/537.36',
  },
  desktop: { viewport: { width: 1440, height: 900 } },
};

const failures = [];
const log = [];

async function run(view, name, path, steps) {
  const context = await browser.newContext(views[view]);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  let picked = false;
  const after = [];
  page.on('request', (request) => {
    if (picked) after.push({ method: request.method(), url: request.url() });
  });
  await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  const pick = async (selector, file) => {
    picked = true;
    await page.setInputFiles(selector, join(fixtures, file));
  };
  const started = Date.now();
  try {
    await steps(page, pick);
  } catch (error) {
    failures.push(`${view} ${name}: ${error.message.split('\n')[0]}`);
  }
  const ms = Date.now() - started;
  const leaks = after.filter((r) => r.method !== 'GET' || !r.url.startsWith(base) && !r.url.startsWith('blob:') && !r.url.startsWith('data:'));
  if (leaks.length) failures.push(`${view} ${name}: request after the pick left the page: ${JSON.stringify(leaks.slice(0, 3))}`);
  // MediaPipe logs its own start-up lines through console.error (e.g. 'INFO: Created TensorFlow Lite XNNPACK delegate').
  const real = errors.filter((e) => !/favicon|Failed to load resource: the server responded with a status of 404|^INFO:|^W\d{4}|^I\d{4}|gl_context|Graph successfully started/.test(e));
  if (real.length) failures.push(`${view} ${name}: page errors: ${real.slice(0, 2).join(' | ')}`);
  await page.screenshot({ path: join(outDir, `${name}__${view}__full.png`), fullPage: true });
  log.push({ view, name, ms, requestsAfterPick: after.map((r) => `${r.method} ${r.url.replace(base, '')}`) });
  await context.close();
}

const result = (page, selector = '[data-photo-tool] .t-result-title') => page.waitForSelector(selector, { timeout: 120_000 });
const cardShot = async (page, selector, file) => {
  const el = await page.$(selector);
  if (el) await el.screenshot({ path: join(outDir, file) });
};

for (const view of ['mobile', 'desktop']) {
  await run(view, 'hub', '/tools/', async () => {});

  await run(view, 'hand-type__right-palm', '/tools/hand-type-quiz/', async (page, pick) => {
    await pick('#hand-type-gallery', 'right-palm.jpg');
    await result(page);
    await cardShot(page, '[data-photo-tool]', `hand-type__right-palm__${view}__card.png`);
  });

  await run(view, 'finger-reader__outdoors', '/tools/finger-reader/', async (page, pick) => {
    await pick('#finger-reader-gallery', 'palm-outdoors.jpg');
    await result(page);
    await cardShot(page, '[data-photo-tool]', `finger-reader__outdoors__${view}__card.png`);
  });

  await run(view, 'compare__both-hands', '/tools/left-vs-right-palm/?reading=mock', async (page, pick) => {
    await pick('#cmp-a-gallery', 'right-palm.jpg');
    await page.waitForSelector('[data-slot="a"] .t-ov-figure', { timeout: 120_000 });
    await pick('#cmp-b-gallery', 'left-palm-mirrored.jpg');
    await page.waitForSelector('.t-compare-table', { timeout: 120_000 });
    await page.click('text=Trace the lines on both photos');
    await page.waitForSelector('.t-compare-lines', { timeout: 30_000 });
    await cardShot(page, '[data-compare]', `compare__both-hands__${view}__card.png`);
  });

  if (view === 'mobile') {
    await run(view, 'hand-type__back-of-hand', '/tools/hand-type-quiz/', async (page, pick) => {
      await pick('#hand-type-gallery', 'back-of-hand.jpg');
      await result(page);
      const title = await page.textContent('[data-photo-tool] .t-result-title');
      if (!/back of your hand/i.test(title ?? '')) throw new Error(`expected back-of-hand, got "${title}"`);
    });

    await run(view, 'finger-reader__no-hand', '/tools/finger-reader/', async (page, pick) => {
      await pick('#finger-reader-gallery', 'no-hand-leaf.jpg');
      await result(page);
      const title = await page.textContent('[data-photo-tool] .t-result-title');
      if (!/couldn’t find a hand/i.test(title ?? '')) throw new Error(`expected no hand, got "${title}"`);
    });

    await run(view, 'finger-reader__exif-rotated', '/tools/finger-reader/', async (page, pick) => {
      await pick('#finger-reader-gallery', 'right-palm-exif-rotated.jpg');
      await result(page);
      const box = await page.$eval('[data-photo-tool] .t-ov-photo image', (img) => ({ w: Number(img.getAttribute('width')), h: Number(img.getAttribute('height')) }));
      if (!(box.h > box.w)) throw new Error(`EXIF rotation not applied: ${box.w}x${box.h}`);
    });

    await run(view, 'line-finder__off', '/tools/palm-line-finder/', async () => {});
    await run(view, 'line-finder__mock', '/tools/palm-line-finder/?reading=mock', async (page, pick) => {
      await pick('#lf-gallery', 'palm-outdoors.jpg');
      await page.waitForSelector('[data-line-finder] .t-line-chips', { timeout: 60_000 });
    });

    await run(view, 'checker__ready-then-hand-type', '/tools/palm-photo-checker/', async (page, pick) => {
      // The checker starts when it scrolls into view (whenVisible), as on a phone.
      await page.locator('[data-photo-check]').scrollIntoViewIfNeeded();
      await page.waitForTimeout(800);
      await pick('#pc-gallery', 'palm-outdoors.jpg');
      await page.waitForSelector('text=Use this photo now', { timeout: 30_000 });
      await page.screenshot({ path: join(outDir, `checker__ready__${view}__full.png`), fullPage: true });
      await page.click('text=Find my hand type');
      await page.waitForURL('**/tools/hand-type-quiz/**');
      await result(page);
    });
  }
}

await browser.close();
stop();
writeFileSync(join(outDir, 'run.json'), `${JSON.stringify({ failures, log }, null, 2)}\n`);
console.log(log.map((l) => `${l.view.padEnd(8)} ${l.name.padEnd(34)} ${String(l.ms).padStart(6)} ms  after pick: ${l.requestsAfterPick.length} requests`).join('\n'));
console.log(`\nScreenshots: ${outDir}`);
if (failures.length) {
  console.error(`\nFAILED:\n${failures.join('\n')}`);
  process.exit(1);
}
console.log('All photo-tool checks passed; no request left the site after a photo was picked.');
