// Click through the mock /reading/ flow and screenshot each screen.
// Usage: node research-tools/reading-shots.mjs <baseUrl> <outDir> <width> <theme> [lang]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [base, out, width = '390', theme = 'night', lang = 'en'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const ctx = await browser.newContext({ viewport: { width: Number(width), height: 860 }, deviceScaleFactor: 1, hasTouch: Number(width) < 800 });
const page = await ctx.newPage();
const tag = `${width}-${theme}-${lang}`;
const shot = async (name, full = false) => { await page.waitForTimeout(500); await page.screenshot({ path: `${out}/${name}-${tag}.png`, fullPage: full }); };
await page.goto(`${base}/reading/${lang === 'hi' ? '?lang=hi' : ''}`, { waitUntil: 'networkidle' });
await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
await page.waitForSelector('.rd-card', { timeout: 20000 });
await shot('1-pick', true);
await page.locator('input[type=file]:not([capture])').setInputFiles('public/samples/hero-palm-1200.jpg');
await page.waitForTimeout(2500);
await shot('2-review', true);
const use = page.locator('.rd-review .btn-gold');
if (await use.count()) await use.first().click();
await page.waitForTimeout(1800);
await shot('3-working');
await page.waitForSelector('.rd-report', { timeout: 90000 }).catch(() => {});
await page.waitForTimeout(1500);
await shot('4-report', true);
const lock = page.locator('.rd-locked');
if (await lock.count()) {
  await lock.first().click();
  await page.waitForTimeout(1200);
  await shot('5-lock-sheet');
  await page.locator('dialog[open] .rd-x').click();
}
const gold = page.locator('.rd-actions .btn-gold');
if (await gold.count()) {
  await gold.first().click();
  await page.waitForTimeout(1200);
  await shot('6-signup-sheet');
  await page.locator('dialog[open] .rd-x').click();
}
await browser.close();
console.log('done');
