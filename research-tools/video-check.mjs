// Checks that the home "How it works" film really plays, and shoots the section. Usage: node video-check.mjs <url> <out.png>
import { chromium } from 'playwright-core';

const [url, out] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(() => document.querySelector('#how-it-works')?.scrollIntoView());
await page.waitForTimeout(2500);
const state = await page.evaluate(() => {
  const v = document.querySelector('video[data-inview-video]');
  return v ? { paused: v.paused, time: v.currentTime.toFixed(2), ready: v.readyState, lite: document.documentElement.hasAttribute('data-lite') } : null;
});
console.log(JSON.stringify(state));
await page.evaluate(() => window.scrollBy(0, -120));
await page.waitForTimeout(400);
await page.screenshot({ path: out });
await browser.close();
