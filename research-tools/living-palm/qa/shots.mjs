// Quality gate shots for one built hand.
//   node research-tools/living-palm/qa/shots.mjs <slug> <outDir> [assetsDir]
// Renders qa/viewer.html with the hand's assets at 390x844@3 and 1440x900@1: idle (no lines), lines drawn + labels,
// rotated -18 and +18 degrees; then writes <outDir>/<slug>-phone-sheet.jpg and -desktop-sheet.jpg for a quick look.
// Needs playwright-core (research-tools/node_modules) and a Chromium from %LOCALAPPDATA%/ms-playwright.
import { createRequire } from 'module'; import http from 'http'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const LP = path.resolve(HERE, '..');
const { chromium } = createRequire(path.resolve(LP, '../package.json'))('playwright-core');
const sharp = createRequire(path.join(LP, 'package.json'))('sharp');
const [slug, outDir, assetsArg] = process.argv.slice(2);
const ASSETS = path.resolve(assetsArg || path.resolve(LP, '../../public/models/living-palm', slug));
fs.mkdirSync(outDir, { recursive: true });
const THREE_DIR = path.join(LP, 'node_modules/three') + '/';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]);
  const p = u.startsWith('/assets/') ? path.join(ASSETS, u.slice(8)) : path.join(HERE, u === '/' ? 'viewer.html' : u);
  if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(r); });
await new Promise((r) => srv.listen(0, r)); const port = srv.address().port;
const LOCAL = process.env.LOCALAPPDATA || 'C:/Users/acer/AppData/Local';
const exe = path.join(LOCAL, 'ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe');
const browser = await chromium.launch({ executablePath: fs.existsSync(exe) ? exe : undefined, args: [`--use-angle=${process.env.GL || 'd3d11'}`, '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-gpu'] });
const STATES = [{ name: 'idle', eval: '__lines(-1)', wait: 400 }, { name: 'lines', eval: '__lines(1)', wait: 1800 },
  { name: 'rotL', eval: '__pose(-18,0)', wait: 1600 }, { name: 'rotR', eval: '__pose(18,0)', wait: 1600 }];
for (const [tag, w, h, dpr] of [['phone', 390, 844, 3], ['desktop', 1440, 900, 1]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, isMobile: w < 600, hasTouch: w < 600 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.log('[page]', m.text().slice(0, 200)); });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort()); // offline-safe; Georgia fallback
  await page.route(/unpkg\.com\/three@[^/]+\/(.*)$/, (route) => { const f = THREE_DIR + route.request().url().replace(/^.*unpkg\.com\/three@[^/]+\//, ''); fs.existsSync(f) ? route.fulfill({ path: f, contentType: 'text/javascript' }) : route.abort(); });
  await page.goto(`http://localhost:${port}/?shot&motion&base=assets`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.__ready === true || document.documentElement.classList.contains('no3d'), null, { timeout: 60000 });
  const files = [];
  for (const s of STATES) { await page.evaluate(s.eval); await page.waitForTimeout(s.wait); const f = path.join(outDir, `${slug}-${tag}-${s.name}.png`); await page.screenshot({ path: f }); files.push(f); }
  // label overlap check in screen space (lines state is the one with labels shown)
  await page.evaluate('__pose(0,0)'); await page.evaluate('__lines(1)'); await page.waitForTimeout(1500);
  const boxes = await page.evaluate(() => [...document.querySelectorAll('.label.on')].map((e) => { const r = e.getBoundingClientRect(); return { k: e.dataset.k, x: r.x, y: r.y, w: r.width, h: r.height }; }));
  const ov = []; for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) { const a = boxes[i], b = boxes[j]; if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) ov.push(a.k + '/' + b.k); }
  console.log(tag, 'labels', boxes.map((b) => `${b.k}@${b.x.toFixed(0)},${b.y.toFixed(0)}`).join(' '), ov.length ? 'OVERLAP ' + ov.join(',') : 'no overlap');
  await ctx.close();
  // contact sheet (4 states side by side)
  const TW = tag === 'phone' ? 300 : 560; const tiles = await Promise.all(files.map((f) => sharp(f).resize(TW).toBuffer({ resolveWithObject: true })));
  const TH = tiles[0].info.height; await sharp({ create: { width: TW * 4 + 18, height: TH, channels: 3, background: '#000' } })
    .composite(tiles.map((t, i) => ({ input: t.data, left: i * (TW + 6), top: 0 }))).jpeg({ quality: 86 }).toFile(path.join(outDir, `${slug}-${tag}-sheet.jpg`));
}
await browser.close(); srv.close(); console.log('shots in', outDir);
