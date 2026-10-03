// Full-page screenshots. Usage: node research-tools/page-shots.mjs <baseUrl> <outDir> <path>[:width[:theme]] ...
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const [base, out, ...specs] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
for (const spec of specs) {
  const [path, width = '1440', theme = 'night'] = spec.split(':');
  const page = await browser.newPage({ viewport: { width: Number(width), height: 900 }, deviceScaleFactor: 1 });
  await page.goto(base + path, { waitUntil: 'networkidle' });
  await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
  // Scroll through once so lazy images and reveals run.
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } window.scrollTo(0, 0); });
  await page.waitForTimeout(400);
  const name = `${path.replace(/\//g, '_') || 'home'}-${width}-${theme}`;
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
  await page.close();
}
await browser.close();
console.log('done');
