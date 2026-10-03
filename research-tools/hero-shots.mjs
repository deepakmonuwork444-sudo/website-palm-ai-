// Home hero 3D QA: screenshots with the live WebGL hand (SwiftShader), optional frame series and fps under CPU throttling.
// Usage: node hero-shots.mjs <url> <outDir> <width> [--theme=day] [--frames=N] [--fps] [--reduced] [--scroll=y1,y2] [--drag]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const [url, out, width, ...flags] = process.argv.slice(2);
const flag = (name) => flags.find((f) => f.startsWith(`--${name}`))?.split('=')[1] ?? (flags.includes(`--${name}`) ? true : undefined);
mkdirSync(out, { recursive: true });
const w = Number(width);
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  // Real GPU (D3D11) by default; --soft for SwiftShader.
  args: flags.includes('--soft') ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] : ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'],
});
const context = await browser.newContext({
  viewport: { width: w, height: w < 600 ? 844 : 900 },
  deviceScaleFactor: 1,
  hasTouch: w < 600,
  isMobile: w < 600,
  reducedMotion: flag('reduced') ? 'reduce' : 'no-preference',
});
const page = await context.newPage();
const theme = flag('theme');
await page.addInitScript(([t, no3d]) => {
  Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
  // --no3d: a 2 GB device, so the page keeps the poster (a baseline for the fps numbers).
  Object.defineProperty(navigator, 'deviceMemory', { get: () => (no3d ? 2 : 8) });
  window.__hero3d = { keep: true };
  if (t) try { localStorage.setItem('palmsays-theme', t); } catch {}
}, [theme, !!flag('no3d')]);
page.on('pageerror', (e) => console.log('pageerror:', e.message));
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('console:', m.text()); });
const tag = `${w}${theme ? '-' + theme : ''}${flag('reduced') ? '-reduced' : ''}`;
await page.goto(url, { waitUntil: 'load' });
await page.screenshot({ path: `${out}/${tag}-poster.png` });
const ok = await page.waitForFunction(() => window.__hero3d?.ready || window.__hero3d?.failed, null, { timeout: 90000 }).then(() => page.evaluate(() => !!window.__hero3d.ready)).catch(() => false);
console.log('3d ready:', ok);
await page.waitForTimeout(900);
await page.screenshot({ path: `${out}/${tag}-live.png` });
const frames = Number(flag('frames') ?? 0);
for (let i = 0; i < frames; i++) {
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${out}/${tag}-f${String(i).padStart(2, '0')}.png` });
}
if (flag('drag')) {
  const box = await page.locator('.h3-canvas').boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    for (let i = 1; i <= 12; i++) await page.mouse.move(box.x + box.width / 2 + i * 14, box.y + box.height / 2);
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${out}/${tag}-drag.png` });
    await page.mouse.up();
  }
}
if (flag('fps')) {
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const measure = () => page.evaluate(() => new Promise((resolve) => {
    const times = [];
    const start = performance.now();
    const tick = (t) => { times.push(t); if (t - start < 3000) requestAnimationFrame(tick); else resolve(times); };
    requestAnimationFrame(tick);
  }));
  const report = (label, times) => {
    const d = times.slice(1).map((t, i) => t - times[i]).sort((a, b) => a - b);
    console.log(`${label}: ${(1000 * (times.length - 1) / (times.at(-1) - times[0])).toFixed(1)} fps avg, median ${d[Math.floor(d.length / 2)].toFixed(1)} ms, p95 ${d[Math.floor(d.length * 0.95)].toFixed(1)} ms`);
  };
  report('hero on screen, 4x CPU', await measure());
  await page.evaluate(() => { let y = 0; const id = setInterval(() => { y += 40; window.scrollTo(0, y); if (y > 1600) clearInterval(id); }, 16); });
  report('scrolling past hero, 4x CPU', await measure());
  report('hero off screen, 4x CPU', await measure());
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
}
for (const y of String(flag('scroll') ?? '').split(',').filter(Boolean)) {
  await page.evaluate((v) => window.scrollTo(0, Number(v)), y);
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${out}/${tag}-y${y}.png` });
}
console.log(JSON.stringify(await page.evaluate(() => ({
  pastHero: document.documentElement.hasAttribute('data-past-hero'),
  canvas: document.querySelector('.h3-canvas') ? [document.querySelector('.h3-canvas').width, document.querySelector('.h3-canvas').height] : null,
  h1: document.querySelector('h1')?.textContent.replace(/\s+/g, ' ').trim(),
  cta: document.querySelector('[data-hero-cta]')?.getBoundingClientRect().bottom,
}))));
await browser.close();
