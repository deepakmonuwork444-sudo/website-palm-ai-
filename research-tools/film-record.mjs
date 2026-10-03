// Records the REAL mock-mode /reading/ flow (astro dev, .env.development: a stored real scan,
// labelled "Preview") at phone size for the 3D product film (public/media/README.md).
// Frames come from Chrome's own screencast (full quality, wall-clock timestamps), natural speed.
// Usage: node research-tools/film-record.mjs <baseUrl> <outDir> <en|hi>
// Writes <outDir>/f00001.jpg ... and <outDir>/timeline.json ({ frames: [{file, t}], marks }).
import { chromium } from 'playwright-core';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [base = 'http://localhost:4321', out = 'film-rec', lang = 'en'] = process.argv.slice(2);
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const W = 390;
const H = 800; // + a 44 px status strip on the phone = 844 (390 x 844 screen)
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
await page.addInitScript(() => {
  try {
    localStorage.setItem('palmsays-theme', 'night');
  } catch {}
  document.documentElement?.setAttribute('data-theme', 'night');
});
await page.goto(`${base}/reading/${lang === 'hi' ? '?lang=hi' : ''}`, { waitUntil: 'networkidle' });
await page.waitForSelector('.rd-card', { timeout: 30000 });
await page.locator('input[type=file]:not([capture])').setInputFiles('public/samples/hero-palm-1200.jpg');
await page.waitForSelector('.rd-review', { timeout: 30000 });
await page.locator('.rd-review .btn-gold').click();
await page.waitForSelector('.rd-intake');
await page.locator('.rd-intake input[type=text]').fill(lang === 'hi' ? 'दीपक' : 'Deepak');
const pills = await page.locator('.rd-pill').allInnerTexts();
await page.locator('.rd-pill').nth(1).click(); // man
await page.locator('.rd-intake .btn-gold').click();
await page.waitForTimeout(450);
await page.locator('.rd-segmented').nth(0).locator('button').nth(1).click();
await page.locator('.rd-segmented').nth(1).locator('button').nth(1).click();
await page.locator('.rd-intake .btn-gold').click();
await page.waitForTimeout(450);
await page.locator('.rd-intake input[type=date]').fill('1990-03-12');
await page.locator('.rd-intake input[type=time]').fill('10:30');
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(400);

// Screencast: every painted frame, with its timestamp.
const cdp = await ctx.newCDPSession(page);
const frames = [];
cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
  frames.push({ t: metadata.timestamp, buf: Buffer.from(data, 'base64') });
  cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
});
const now = () => Date.now() / 1000;
const marks = {};
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 93, maxWidth: W * 2, maxHeight: H * 2, everyNthFrame: 1 });
await page.waitForTimeout(300);
marks.start = now();
await page.locator('.rd-intake .btn-gold').click();
await page.waitForSelector('.rd-report', { timeout: 60000 });
marks.report = now();
await page.waitForTimeout(1000);

// Smooth, eased scrolls (a person reading), measured in the page.
const glide = (to, ms) =>
  page.evaluate(
    ([to, ms]) =>
      new Promise((done) => {
        const from = window.scrollY;
        const t0 = performance.now();
        const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
        const step = (now) => {
          const k = Math.min(1, (now - t0) / ms);
          window.scrollTo(0, from + (to - from) * ease(k));
          if (k < 1) requestAnimationFrame(step);
          else done();
        };
        requestAnimationFrame(step);
      }),
    [to, ms],
  );
const topOf = (sel) => page.evaluate((sel) => {
  const el = document.querySelector(sel);
  return el ? el.getBoundingClientRect().top + window.scrollY : null;
}, sel);
const glanceSel = await page.evaluate(() => {
  const h = [...document.querySelectorAll('.rd-report h2, .rd-report h3')].find((e) => /glance|एक नज़र|नजर/i.test(e.textContent || ''));
  if (!h) return null;
  const card = h.closest('section, article, div');
  card?.setAttribute('data-film-glance', '');
  return '[data-film-glance]';
});
const glanceTop = glanceSel ? await topOf(glanceSel) : null;
const keepTop = await topOf('.rd-keep');
marks.scroll1 = now();
if (glanceTop != null) await glide(Math.max(0, glanceTop - 110), 1200);
marks.glance = now();
await page.waitForTimeout(1300);
marks.scroll2 = now();
if (keepTop != null) await glide(Math.max(0, keepTop - 110), 1400);
marks.keep = now();
await page.waitForTimeout(1500);
marks.end = now();
await cdp.send('Page.stopScreencast');
await page.waitForTimeout(200);

frames.sort((a, b) => a.t - b.t);
const list = frames.map((f, i) => {
  const file = `f${String(i + 1).padStart(5, '0')}.jpg`;
  writeFileSync(join(out, file), f.buf);
  return { file, t: f.t };
});
const t0 = marks.start;
const rel = Object.fromEntries(Object.entries(marks).map(([k, v]) => [k, +(v - t0).toFixed(3)]));
const gaps = list.slice(1).map((f, i) => f.t - list[i].t);
writeFileSync(join(out, 'timeline.json'), JSON.stringify({ lang, t0, marks: rel, frames: list.map((f) => ({ file: f.file, t: +(f.t - t0).toFixed(4) })) }, null, 1));
console.log(JSON.stringify({ lang, pills, frames: list.length, marks: rel, fps: +(list.length / (list.at(-1).t - list[0].t)).toFixed(1), maxGapMs: Math.round(Math.max(...gaps) * 1000), glance: !!glanceTop, errors }));
await browser.close();
