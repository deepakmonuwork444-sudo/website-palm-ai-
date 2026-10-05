// Living palm posters (home hero, src/components/home/LivingPalm.astro): renders the live palm's first
// frame from a built site, at the posters' 5:7 framing on a transparent background, twice: without its
// lines (the first paint) and with them (devices that get no live 3D). Prints each label's place on the
// poster (percent) for src/scripts/living-palm-hands.ts.
//
//   npx.cmd astro build --outDir dist-hero, serve it (any static server), then:
//   node research-tools/living-palm-poster.mjs http://localhost:4361/ hero-palm-a
// Needs a real GPU (Chromium headless shell with --use-angle=d3d11 on Windows).
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright-core');
const sharp = require('sharp');

const [base = 'http://localhost:4361/', slug = 'hero-palm-a'] = process.argv.slice(2);
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'models', 'living-palm', slug);
mkdirSync(out, { recursive: true });
const shell = join(process.env.LOCALAPPDATA ?? '', 'ms-playwright', 'chromium_headless_shell-1234', 'chrome-headless-shell-win64', 'chrome-headless-shell.exe');

const browser = await chromium.launch({ executablePath: shell, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu'] });
const page = await (await browser.newContext({ viewport: { width: 1000, height: 900 }, deviceScaleFactor: 2.5 })).newPage();
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.addInitScript(() => {
  window.__livingPalm = { shot: true, keep: true };
});
await page.goto(base, { waitUntil: 'load' });
await page.waitForFunction(() => window.__livingPalm?.ready || window.__livingPalm?.failed, null, { timeout: 90000 });
// The frame at the posters' size: 480 x 672 CSS px at DPR 2.5 = 1200 x 1680.
await page.evaluate(() => {
  const f = document.querySelector('[data-lp-frame]');
  Object.assign(f.style, { position: 'fixed', left: '0', top: '0', width: '480px', height: '672px', inset: 'auto' });
  window.__livingPalm.scene.pose(0, 0);
});

const grab = async (lines) => {
  await page.evaluate((p) => window.__livingPalm.scene.setLines(p), lines);
  await page.waitForTimeout(800);
  const url = await page.evaluate(async () => {
    const blob = await window.__livingPalm.scene.snapshot();
    return new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.readAsDataURL(blob);
    });
  });
  return Buffer.from(url.split(',')[1], 'base64');
};
const clean = await grab(0);
const withLines = await grab(1);
const spots = await page.evaluate(async () => window.__livingPalm.scene.labelSpots());
await browser.close();

const write = async (png, name, widths) => {
  for (const w of widths) {
    const img = sharp(png).resize({ width: w });
    await img.clone().avif({ quality: 60, effort: 7 }).toFile(join(out, `${name}-${w}.avif`));
    await img.clone().webp({ quality: 82, alphaQuality: 90, effort: 6 }).toFile(join(out, `${name}-${w}.webp`));
  }
};
await write(clean, 'poster', [600, 900, 1200]);
await write(withLines, 'poster-lines', [600, 900]);
const round = (v) => Math.round(v * 10) / 10;
console.log('poster labels:', JSON.stringify(Object.fromEntries(Object.entries(spots).map(([k, [x, y]]) => [k, [round(x), round(y)]]))));
