// Export the home hero poster from the live three.js scene (the exact first frame), then write AVIF/WebP sizes.
// Usage: node hero-poster.mjs [url]   (dev server on 4321)
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const url = process.argv[2] ?? 'http://localhost:4321/';
const root = resolve(import.meta.dirname, '..');
const sharp = createRequire(resolve(root, 'package.json'))('sharp');
const out = resolve(root, 'public/images/hero');
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => {
  Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
  Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
  window.__hero3d = { posterOnly: true, keep: true };
});
page.on('pageerror', (e) => console.log('pageerror:', e.message));
await page.goto(url, { waitUntil: 'load' });
await page.waitForFunction(() => window.__hero3d?.ready || window.__hero3d?.failed, null, { timeout: 120000 });
const data = await page.evaluate(() => document.querySelector('.h3-canvas')?.toDataURL('image/png'));
await browser.close();
if (!data) throw new Error('no canvas');
const png = Buffer.from(data.split(',')[1], 'base64');
writeFileSync(resolve(root, 'research/hero3d/poster-1200.png'), png);
for (const w of [600, 900, 1200]) {
  const img = sharp(png).resize(w, w);
  await img.clone().avif({ quality: 58, effort: 7 }).toFile(`${out}/hand-v1-${w}.avif`);
  await img.clone().webp({ quality: 82, alphaQuality: 90, effort: 6 }).toFile(`${out}/hand-v1-${w}.webp`);
}
console.log('poster written');
