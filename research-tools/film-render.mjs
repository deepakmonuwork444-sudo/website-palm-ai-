// Renders the 3D product film (research-tools/film/scene.js) frame by frame in headless Chrome
// (WebGL), with the REAL recorded /reading/ frames from film-record.mjs on the phone screen,
// then encodes MP4 (H.264) + WebM (VP9) + poster with the project's ffmpeg-static and sharp.
// Usage: node research-tools/film-render.mjs <recDir> <workDir> <name> [--preview N] [--only-encode]
//   <name> e.g. product-film-en -> public/media/video/<name>.mp4/.webm/-poster.avif/.webp
import { chromium } from 'playwright-core';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const require = createRequire(join(root, 'package.json'));
const ffmpeg = require('ffmpeg-static');
const sharp = require('sharp');

const args = process.argv.slice(2);
const [recDir, work, name] = args;
const flag = (f) => args.includes(f);
const previewEvery = flag('--preview') ? Number(args[args.indexOf('--preview') + 1]) : 0;
const FPS = 30;

const tl = JSON.parse(readFileSync(join(recDir, 'timeline.json'), 'utf8'));
const m = tl.marks;
// The edit: the live scan from "found your hand" through the fourth line, a short dissolve
// into the report as it opens, then the report scrolling to the at-a-glance card and Keep & share.
const recA0 = 3.9;
const durA = 13.75 - recA0;
const recB0 = m.report + 0.35;
const durB = m.end - 0.15 - recB0;
const dissolve = 0.5;
const T = durA - dissolve + durB;
const b = durA - dissolve; // report starts showing
const g = b + (m.scroll1 - recB0); // scroll to the glance card
// [t, camYaw, camPitch, dist(mm), targetX, targetY, roll, phoneYaw]
const keys = [
  [0, -32, 10, 470, 0, 0, -1.5, -6],
  [1.6, -23, 7, 310, 0, 2, -1, -4],
  [3.2, -14, 5, 162, 0, 3, -0.5, -2],
  [6.0, -8, 3, 152, 1, 3, 0, 0],
  [b - 1.0, 5, 3, 160, 0, 3, 0.5, 2],
  [b + 0.5, 12, 5, 250, 0, 8, 1, 4],
  [g + 1.6, 17, 4, 205, 0, 20, 1, 5],
  [T - 2.2, 12, 5, 222, 0, 14, 0.5, 4],
  [T - 0.9, 15, 5, 238, 0, 16, 0.8, 5],
  [T, 20, 8, 330, 0, 6, 1.2, 6],
];
const cfg = { frames: tl.frames, recA0, durA, recB0, durB, dissolve, keys, fadeIn: 0.45, fadeOut: 0.6 };

const framesDir = join(work, `${name}-frames`);
if (!flag('--only-encode')) {
  rmSync(framesDir, { recursive: true, force: true });
  mkdirSync(framesDir, { recursive: true });
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'],
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const types = { '.js': 'text/javascript', '.html': 'text/html', '.jpg': 'image/jpeg' };
  await page.route('http://film.local/**', (route) => {
    const path = decodeURIComponent(new URL(route.request().url()).pathname);
    let file;
    if (path.startsWith('/three/')) file = join(root, 'node_modules', 'three', path.slice(7));
    else if (path.startsWith('/rec/')) file = join(recDir, path.slice(5));
    else if (path.startsWith('/film/')) file = join(here, 'film', path.slice(6));
    else file = join(here, 'film', 'index.html');
    try {
      route.fulfill({ status: 200, contentType: types[extname(file)] ?? 'application/octet-stream', body: readFileSync(file) });
    } catch {
      route.fulfill({ status: 404, body: '' });
    }
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
  await page.goto('http://film.local/');
  await page.waitForFunction(() => window.filmReady === true, null, { timeout: 60000 }).catch(() => {
    console.error(errors);
    process.exit(1);
  });
  console.log(JSON.stringify(await page.evaluate(() => window.film.info())));
  await page.evaluate((c) => window.film.init(c), cfg);
  const total = Math.round(T * FPS);
  const t0 = Date.now();
  let n = 0;
  for (let i = 0; i < total; i++) {
    if (previewEvery && i % previewEvery) continue;
    const url = await page.evaluate((t) => window.film.frame(t), i / FPS);
    writeFileSync(join(framesDir, `f${String(i).padStart(4, '0')}.png`), Buffer.from(url.split(',')[1], 'base64'));
    n++;
    if (n % 60 === 0) console.log(`${i}/${total} ${((Date.now() - t0) / n).toFixed(0)} ms/frame`);
  }
  console.log(JSON.stringify({ T: +T.toFixed(2), frames: total, rendered: n, errors }));
  await browser.close();
}

if (!previewEvery) {
  const out = join(root, 'public', 'media', 'video');
  mkdirSync(out, { recursive: true });
  const run = (a) => execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...a], { stdio: 'inherit' });
  const input = ['-framerate', String(FPS), '-i', join(framesDir, 'f%04d.png')];
  const vf = 'scale=1280:720:flags=lanczos,format=yuv420p';
  const mp4 = join(out, `${name}.mp4`);
  const webm = join(out, `${name}.webm`);
  const crf = process.env.CRF ?? '25';
  run([...input, '-an', '-vf', vf, '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'veryslow', '-tune', 'film', '-crf', crf, '-g', '60', '-movflags', '+faststart', mp4]);
  run([...input, '-an', '-vf', vf, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', process.env.VP9_CRF ?? '38', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '1', '-g', '120', webm]);
  // Poster: a frame just after the fade-in (what reduced-motion visitors keep).
  const posterFrame = readdirSync(framesDir).sort()[Math.round(0.6 * FPS)];
  const png = join(framesDir, posterFrame);
  await sharp(png).resize(1280, 720).avif({ quality: 55, effort: 6 }).toFile(join(out, `${name}-poster.avif`));
  await sharp(png).resize(1280, 720).webp({ quality: 76, effort: 6 }).toFile(join(out, `${name}-poster.webp`));
  for (const f of [mp4, webm, join(out, `${name}-poster.avif`), join(out, `${name}-poster.webp`)]) console.log(`${f.slice(root.length + 1)}  ${(statSync(f).size / 1024).toFixed(1)} KB`);
}
