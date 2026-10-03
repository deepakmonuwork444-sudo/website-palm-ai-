// Auth screenshots (WEB-FEAT-029/062) on the running dev server (mock mode).
// Usage: node research-tools/auth-shots.mjs [baseUrl]  → qa/shots/auth/
import { chromium } from 'playwright-core';
import { mkdirSync, readFileSync } from 'node:fs';

const base = process.argv[2] ?? 'http://localhost:4321';
const out = 'qa/shots/auth';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const problems = [];

async function run(width) {
  const context = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 900 }, deviceScaleFactor: width < 600 ? 2 : 1 });
  const page = await context.newPage();
  globalThis.lastPage = page;
  page.on('pageerror', (e) => problems.push(`${width} pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') problems.push(`${width} console: ${m.text()}`);
  });
  const shot = async (name, full = true) => {
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${out}/${width}-${name}.png`, fullPage: full });
  };

  // Header, signed out.
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${out}/${width}-header-signed-out.png`, clip: { x: 0, y: 0, width, height: 96 } });

  // /account/ signed out.
  await page.goto(`${base}/account/?reading=mock`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.acct-auth');
  await shot('account-signed-out');

  // Google (preview) → signed in.
  await page.click('.auth-google-mock');
  await page.waitForSelector('#acct-hello');
  await shot('account-signed-in');

  // Header, signed in (+ the menu on desktop).
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${out}/${width}-header-signed-in.png`, clip: { x: 0, y: 0, width, height: 96 } });
  if (width >= 1024) {
    await page.click('.account-avatar');
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${out}/${width}-header-menu.png`, clip: { x: width - 420, y: 0, width: 420, height: 260 } });
  } else {
    await page.click('[data-menu-open]');
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${out}/${width}-menu-sheet-signed-in.png` });
  }

  // Hindi account page.
  await page.goto(`${base}/hi/account/?reading=mock`, { waitUntil: 'networkidle' });
  await page.waitForSelector('#acct-hello');
  await shot('account-hi-signed-in', false);

  // Sign out from the header link → the "remove readings?" question, then signed out.
  await page.goto(`${base}/account/?reading=mock&signout=1`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.acct-auth');
  await shot('account-after-signout', false);

  // Reading sign-up sheet with Google: a fresh browser, a preview guest reading, then the sheet.
  await context.clearCookies();
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${base}/reading/?reading=mock`, { waitUntil: 'networkidle' });
  // The fixture palm is small (573 px): scale it up in the page so the local photo check passes.
  const big = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = 'data:image/jpeg;base64,' + b64;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width * 1.6;
    c.height = img.height * 1.6;
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.92).split(',')[1];
  }, readFileSync('tests/fixtures/palms/palm-outdoors.jpg').toString('base64'));
  await page.setInputFiles('input[type=file] >> nth=0', { name: 'palm.jpg', mimeType: 'image/jpeg', buffer: Buffer.from(big, 'base64') });
  await page.getByRole('button', { name: /Use this photo/ }).click();
  await page.getByRole('button', { name: /Skip questions/ }).click();
  const skipShow = page.getByRole('button', { name: /Skip to my reading/ });
  await skipShow.click({ timeout: 20_000 }).catch(() => undefined);
  await page.waitForSelector('.rd-report', { timeout: 30_000 });
  await page.getByRole('button', { name: /sign up/i }).first().click();
  await page.waitForSelector('dialog.rd-sheet[open]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}/${width}-signup-sheet-google.png` });

  // Google in the sheet → back on the report, signed in.
  await page.click('dialog.rd-sheet .auth-google-mock');
  await page.waitForFunction(() => !document.querySelector('dialog.rd-sheet[open]'), null, { timeout: 10_000 });
  await page.screenshot({ path: `${out}/${width}-after-google-in-reading.png` });
  await context.close();
}

for (const width of [390, 1440]) {
  try {
    await run(width);
  } catch (error) {
    problems.push(`${width} FAILED: ${error.message.split('\n').slice(0, 3).join(' ')}`);
    await globalThis.lastPage?.screenshot({ path: `${out}/${width}-debug.png` }).catch(() => undefined);
  }
}
await browser.close();
console.log(problems.length ? problems.join('\n') : 'no page errors');
