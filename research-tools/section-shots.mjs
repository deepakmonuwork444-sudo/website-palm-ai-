// Screenshots of single home sections (#tools, #guides) at phone and desktop width.
// Usage: node research-tools/section-shots.mjs <baseUrl> <outDir>
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const [base = 'http://localhost:4399', out = 'qa/sections'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const runs = [
  { name: 'en-night-1440', path: '/', width: 1440, theme: 'night' },
  { name: 'en-night-390', path: '/', width: 390, theme: 'night' },
  { name: 'hi-night-390', path: '/hi/', width: 390, theme: 'night' },
  { name: 'en-day-1440', path: '/', width: 1440, theme: 'day' },
];
for (const run of runs) {
  const page = await browser.newPage({ viewport: { width: run.width, height: 900 }, deviceScaleFactor: 1 });
  await page.addInitScript((theme) => { try { localStorage.setItem('theme', theme); } catch {} }, run.theme);
  await page.goto(base + run.path, { waitUntil: 'networkidle' });
  await page.evaluate((theme) => document.documentElement.setAttribute('data-theme', theme), run.theme);
  for (const id of ['tools', 'guides']) {
    const el = page.locator('#' + id);
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await el.screenshot({ path: `${out}/${id}-${run.name}.png` });
  }
  await page.close();
}
await browser.close();
console.log('done');
