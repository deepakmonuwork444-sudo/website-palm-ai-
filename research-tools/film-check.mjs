// Checks that a page's in-view 3D film really plays, at 390 and 1440, and shoots it.
// Usage: node research-tools/film-check.mjs <url> <filmSelector> <outPrefix>   (e.g. http://localhost:4321/app/ .app-film qa/film/app)
import { chromium } from 'playwright-core';

const [url, sel, out] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
for (const width of [390, 1440]) {
  const mobile = width < 800;
  const page = await browser.newPage({ viewport: { width, height: mobile ? 844 : 900 }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: 'center' }), sel);
  await page.waitForTimeout(3000);
  const state = await page.evaluate((s) => {
    const v = document.querySelector(`${s} video[data-inview-video]`);
    return v ? { src: v.currentSrc.split('/').pop(), paused: v.paused, time: +v.currentTime.toFixed(2), ready: v.readyState, box: v.getBoundingClientRect().width.toFixed(0) } : null;
  }, sel);
  console.log(JSON.stringify({ width, ...state }));
  await page.screenshot({ path: `${out}-${width}.png` });
  await page.close();
}
await browser.close();
