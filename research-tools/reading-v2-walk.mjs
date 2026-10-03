// Walk the mock /reading/ flow v2 (questions → live scan → personal report → PDF) and screenshot each step.
// Usage: node research-tools/reading-v2-walk.mjs <baseUrl> <outDir> <width> <theme> <lang> [reduce]
// Saves the PDF as <outDir>/palm-reading-<width>-<theme>-<lang>.pdf and prints the show's timings.
import { chromium } from 'playwright-core';
import { copyFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [base, out, width = '390', theme = 'night', lang = 'en', reduce = ''] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const ctx = await browser.newContext({
  viewport: { width: Number(width), height: Number(width) < 800 ? 844 : 900 },
  deviceScaleFactor: Number(width) < 800 ? 2 : 1,
  hasTouch: Number(width) < 800,
  reducedMotion: reduce ? 'reduce' : 'no-preference',
  acceptDownloads: true,
});
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));
const tag = `${width}-${theme}-${lang}${reduce ? '-reduce' : ''}`;
const shot = async (name, full = false) => {
  await page.waitForTimeout(350);
  await page.screenshot({ path: `${out}/${name}-${tag}.png`, fullPage: full });
};
await page.addInitScript((t) => {
  try {
    localStorage.setItem('palmsays-theme', t);
  } catch {}
  document.documentElement.setAttribute('data-theme', t);
}, theme);
await page.goto(`${base}/reading/${lang === 'hi' ? '?lang=hi' : ''}`, { waitUntil: 'networkidle' });
await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
await page.waitForSelector('.rd-card', { timeout: 30000 });
await page.locator('input[type=file]:not([capture])').setInputFiles('public/samples/hero-palm-1200.jpg');
await page.waitForSelector('.rd-review', { timeout: 30000 });
await shot('1-review', true);
await page.locator('.rd-review .btn-gold').click();
await page.waitForSelector('.rd-intake');
await shot('2-intake-you');
await page.locator('.rd-intake input[type=text]').fill(lang === 'hi' ? 'दीपिका' : 'Deepak');
await page.locator('.rd-pill').nth(lang === 'hi' ? 0 : 1).click();
await shot('2b-intake-you-filled');
await page.locator('.rd-intake .btn-gold').click();
await page.waitForTimeout(450);
await page.locator('.rd-segmented').nth(0).locator('button').nth(1).click();
await page.locator('.rd-segmented').nth(1).locator('button').nth(1).click();
await shot('3-intake-hands');
await page.locator('.rd-intake .btn-gold').click();
await page.waitForTimeout(450);
await page.locator('.rd-intake input[type=date]').fill('1990-03-12');
await page.locator('.rd-intake input[type=time]').fill('10:30');
await shot('4-intake-birth', true);
const t0 = Date.now();
await page.locator('.rd-intake .btn-gold').click();
// The show: frames through the reveal.
const frames = reduce ? [1500] : [1500, 4200, 6000, 8000, 10000, 12500];
let last = 0;
for (const at of frames) {
  await page.waitForTimeout(Math.max(0, at - last));
  last = at;
  if (await page.locator('.rd-report').count()) break;
  await page.screenshot({ path: `${out}/5-scan-${String(at).padStart(5, '0')}-${tag}.png` });
}
await page.waitForSelector('.rd-report', { timeout: 60000 });
const showMs = Date.now() - t0;
await page.waitForTimeout(900);
await shot('6-report', true);
await page.locator('.rd-keep').scrollIntoViewIfNeeded();
await shot('7-keep');
const [download] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), page.locator('.rd-pdf').click()]);
// Saved outside the project first: the dev server watches the project folder.
const tmpPdf = join(tmpdir(), `palm-reading-${tag}.pdf`);
const pdfPath = `${out}/palm-reading-${tag}.pdf`;
await download.saveAs(tmpPdf);
await page.waitForTimeout(500);
await shot('8-keep-after-pdf');
await page.locator('.rd-edit-details').click();
await page.waitForSelector('dialog[open]');
await shot('9-edit-sheet');
console.log(JSON.stringify({ tag, showMs, pdf: pdfPath, file: download.suggestedFilename(), errors }));
await browser.close();
copyFileSync(tmpPdf, pdfPath);
