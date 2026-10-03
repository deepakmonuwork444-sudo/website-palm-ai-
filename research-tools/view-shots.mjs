// Viewport screenshots at section anchors. Usage: node view-shots.mjs <url> <outDir> <width> <selector>...
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const [url, out, width, ...selectors] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: Number(width), height: Number(width) < 600 ? 844 : 900 }, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle' });
let i = 0;
for (const sel of selectors) {
  if (sel.startsWith('y=')) await page.evaluate((y) => window.scrollTo(0, y), Number(sel.slice(2)));
  else await page.evaluate((s) => { const el = document.querySelector(s); if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 64); }, sel);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${out}/${width}-${String(i++).padStart(2, '0')}.png` });
}
await browser.close();
console.log('done');
