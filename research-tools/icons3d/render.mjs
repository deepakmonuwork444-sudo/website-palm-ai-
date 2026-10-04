// Renders the PalmSays 3D icon set (icons.js) and exports it for the site.
//
//   node research-tools/icons3d/render.mjs [--only=a,b] [--sheet=<path.png>] [--no-export]
//
// 1. Opens render.html in headless Chromium (three.js from the website's node_modules, WebGL on SwiftShader).
// 2. Saves each icon as a 512 px transparent PNG master in research-tools/icons3d/out/.
// 3. Exports public/images/icons3d/<name>-{96,192,288}.{avif,webp} (1x/2x/3x of a 96 px tile).
// 4. Draws a contact sheet of every icon on navy and on light, at 128 px and at 48 px (--sheet, default out/sheet.png).
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const site = resolve(import.meta.dirname, '../..');
const outDir = join(import.meta.dirname, 'out');
const pubDir = join(site, 'public/images/icons3d');
const SIZES = [96, 192, 288];
// The site files are cut from the 512 px master to one fixed square that holds every icon and its shadow
// (union of all icons: x 95-452, y 75-397), so all icons keep one scale and fill their tiles.
const CROP = { left: 85, top: 48, width: 376, height: 376 };
const types = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.html': 'text/html', '.png': 'image/png', '.webp': 'image/webp' };

const server = createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const body = await readFile(join(site, path));
    res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' }); res.end(body);
  } catch { res.writeHead(404); res.end(); }
}).listen(0);
const port = server.address().port;
const launch = { headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] };
let browser;
try { browser = await chromium.launch(launch); } catch { browser = await chromium.launch({ ...launch, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }); }

try {
  const tab = await browser.newPage();
  tab.on('pageerror', (e) => console.error('page error:', e.message));
  const q = args.only ? `?only=${args.only}` : '';
  await tab.goto(`http://127.0.0.1:${port}/research-tools/icons3d/render.html${q}`, { waitUntil: 'commit' });
  await tab.waitForFunction(() => window.__ready, null, { timeout: 600000 });
  const icons = await tab.evaluate(() => window.__icons);
  await mkdir(outDir, { recursive: true }); await mkdir(pubDir, { recursive: true });
  for (const [name, url] of Object.entries(icons)) {
    const png = Buffer.from(url.split(',')[1], 'base64');
    await writeFile(join(outDir, `${name}.png`), png);
    if (args['no-export']) continue;
    for (const px of SIZES) {
      const img = sharp(png).extract(CROP).resize(px, px, { kernel: 'lanczos3' });
      await img.clone().avif({ quality: 62, effort: 6 }).toFile(join(pubDir, `${name}-${px}.avif`));
      await img.clone().webp({ quality: 86, alphaQuality: 90, effort: 6 }).toFile(join(pubDir, `${name}-${px}.webp`));
    }
  }
  console.log(`rendered ${Object.keys(icons).length} icons`);

  // Contact sheet: every master (not only this run) on navy and on light, big and at 48 px.
  const { readdir } = await import('node:fs/promises');
  const all = (await readdir(outDir)).filter((f) => f.endsWith('.png') && f !== 'sheet.png').map((f) => f.slice(0, -4));
  const cell = (n, px) => `<figure><img src="/public/images/icons3d/${n}-${px > 96 ? 288 : 96}.webp" width="${px}" height="${px}"><figcaption>${n}</figcaption></figure>`;
  const band = (bg, fg, px) => `<section style="background:${bg};color:${fg}">${all.map((n) => cell(n, px)).join('')}</section>`;
  const html = `<!doctype html><html><head><style>
    body{margin:0;font:13px Georgia,serif;width:1800px} section{display:grid;grid-template-columns:repeat(12,1fr);gap:4px 0;padding:14px 10px}
    figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:2px} figcaption{opacity:.75;font-size:11px}
  </style></head><body>${band('#0B0A1F', '#F6F0E1', 128)}${band('#F5F2EA', '#3a3550', 128)}${band('#0B0A1F', '#F6F0E1', 48)}${band('#FFFFFF', '#3a3550', 48)}</body></html>`;
  await writeFile(join(outDir, 'sheet.html'), html);
  await tab.setViewportSize({ width: 1800, height: 800 });
  await tab.goto(`http://127.0.0.1:${port}/research-tools/icons3d/out/sheet.html`);
  await tab.waitForLoadState('networkidle');
  const sheet = typeof args.sheet === 'string' ? args.sheet : join(outDir, 'sheet.png');
  await mkdir(resolve(sheet, '..'), { recursive: true });
  await tab.screenshot({ path: sheet, fullPage: true });
  console.log(`sheet: ${sheet}`);
} finally {
  await browser.close(); server.close();
}
