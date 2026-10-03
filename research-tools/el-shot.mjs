// Element screenshots at a given width, pixel ratio and theme.
// Usage: node el-shot.mjs <url> <outDir> <width> <dpr> <night|day> <selector> [selector...]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const [url, out, width, dpr, theme, ...selectors] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 }, deviceScaleFactor: Number(dpr) });
await page.addInitScript((t) => { try { localStorage.setItem('theme', t); } catch {} document.documentElement.dataset.theme = t; }, theme);
await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate((t) => { document.documentElement.dataset.theme = t; }, theme);
if (process.env.OPEN) await page.evaluate((s) => document.querySelectorAll(s).forEach((d) => { d.open = true; }), process.env.OPEN);
let i = 0;
for (const sel of selectors) {
  const [css, nth = '0'] = sel.split('@');
  const el = page.locator(css).nth(Number(nth));
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await el.screenshot({ path: `${out}/${width}-${theme}-${String(i++).padStart(2, '0')}.png` });
}
await browser.close();
console.log('done');
