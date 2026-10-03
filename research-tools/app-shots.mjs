// Viewport shots of one page in both themes. Usage: node research-tools/app-shots.mjs <url> <outDir> <width> <theme> y=...
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [url, out, width, theme, ...ys] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 }, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 100)); } });
const tag = url.replace(/^https?:\/\/[^/]+/, '').replace(/[/?=&.]/g, '_') || 'home';
for (const y of ys) {
  await page.evaluate((v) => window.scrollTo(0, v), Number(y.slice(2)));
  await page.waitForTimeout(1100);
  await page.screenshot({ path: `${out}/${tag}-${width}-${theme}-${y}.png` });
}
await browser.close();
console.log('done');
