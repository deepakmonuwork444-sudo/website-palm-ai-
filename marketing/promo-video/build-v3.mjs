// PalmSays promo video v3 (1080x1920, 30 fps, 60 s): v2 storyboard with a glass + smoothness pass.
// Scenes are HTML (scene-v3.html) driven by a time value and captured in headless Chrome at 60 fps,
// in parallel workers; frame pairs are then blended (tmix) down to 30 fps for real motion blur.
// Nothing is installed; nothing ships with the site (marketing/ is outside public/).
//
// Usage (from the website folder):  node marketing/promo-video/build-v3.mjs [--stills 0.5,1.9,...] [--keep] [--rerecord]
//   Starts its own `astro dev` on port 4399 (--ignore-lock, so another session's server on 4321
//   is left alone) to screen-record real tool and guide pages at 390 px and 60 fps, renders the
//   scene, writes palmsays-promo-en-60s-v3-9x16-nomusic.mp4, -9x16.mp4 (+ ambient pad),
//   cover-60s-v3.jpg and contact-sheet-60s-v3.jpg next to this file, then deletes .work-v3.
import { execFileSync, spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const { chromium } = createRequire(join(root, 'research-tools', 'package.json'))('playwright-core');
const ffmpeg = createRequire(join(root, 'package.json'))('ffmpeg-static');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const FPS = 30;
const SUB = 60; // internal render rate; pairs are blended to FPS
const T = 60;
const args = process.argv.slice(2);
const args0 = (k, d) => (args.includes(k) ? Number(args[args.indexOf(k) + 1]) : d);
const WORKERS = args0('--workers', 1); // 1 by default: the owner's laptop has 6 GB RAM
const stills = args.includes('--stills') ? args[args.indexOf('--stills') + 1].split(',').map(Number) : null;
const keep = args.includes('--keep') || !!stills;
const work = join(here, '.work-v3');
const OUT = {
  plain: join(here, 'palmsays-promo-en-60s-v3-9x16-nomusic.mp4'),
  music: join(here, 'palmsays-promo-en-60s-v3-9x16.mp4'),
  cover: join(here, 'cover-60s-v3.jpg'),
  sheet: join(here, 'contact-sheet-60s-v3.jpg'),
};
const ff = (a) => execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...a], { stdio: ['ignore', 'inherit', 'inherit'] });
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
// Constant-velocity scroll with short eased ramps (trapezoid velocity profile).
const glide = (u, r = 0.2) => {
  u = clamp(u); const v = 1 / (1 - r);
  if (u < r) return (v * u * u) / (2 * r);
  if (u > 1 - r) return 1 - (v * (1 - u) * (1 - u)) / (2 * r);
  return v * (u - r / 2);
};
const t00 = Date.now();
const log = (...m) => console.log(`[promo-v3 ${((Date.now() - t00) / 1000).toFixed(0)}s]`, ...m);

// Real pages recorded at 390 px, 60 fps (night theme). Only tools that work on the page today
// (registry live: true, no photo needed) and published guides. n = frames at 60 fps.
const RECS = [
  { tag: 't0', path: '/tools/palm-map/', n: 132, at: 'main h1', dist: 520 },
  { tag: 't1', path: '/tools/heart-line-finder/', n: 132, at: 'main h1', dist: 520 },
  { tag: 't2', path: '/tools/which-hand-quiz/', n: 132, at: 'main h1', dist: 250 },
  { tag: 't3', path: '/tools/palm-signs-checker/', n: 132, at: 'main h1', dist: 520 },
  { tag: 'g0', path: '/heart-line/', n: 152, at: 0, dist: 560 },
  { tag: 'g1', path: '/palm-reading/', n: 152, at: 0, dist: 560 },
  { tag: 'g2', path: '/is-palmistry-real/', n: 152, at: 0, dist: 560 },
];
const recDone = (r) => existsSync(join(work, 'site', `${r.tag}${String(r.n - 1).padStart(4, '0')}.jpg`));

mkdirSync(work, { recursive: true });

// 1) Screen recordings with our own dev server.
const siteDir = join(work, 'site');
if (args.includes('--rerecord')) rmSync(siteDir, { recursive: true, force: true });
if (!RECS.every(recDone)) {
  mkdirSync(siteDir, { recursive: true });
  const base = 'http://localhost:4399';
  const dev = spawn(process.execPath, [join(root, 'node_modules/astro/bin/astro.mjs'), 'dev', '--port', '4399', '--ignore-lock'], { cwd: root, stdio: 'ignore' });
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  try {
    for (let i = 0; ; i++) {
      try { if ((await fetch(base + '/')).ok) break; } catch { /* not up yet */ }
      if (i > 90) throw new Error('dev server did not start');
      await new Promise((r) => setTimeout(r, 1000));
    }
    const ctx = await browser.newContext({ viewport: { width: 390, height: 750 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'no-preference' });
    await ctx.addInitScript(() => { try { localStorage.setItem('palmsays-theme', 'night'); } catch { /* storage blocked */ } document.documentElement?.setAttribute('data-theme', 'night'); });
    const page = await ctx.newPage();
    for (const r of RECS) for (let attempt = 0; ; attempt++) try {
      if (recDone(r)) break;
      await page.goto(base + r.path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500); // Vite may reload once on a first visit
      await page.addStyleTag({ content: 'html{scroll-behavior:auto!important} .sticky-cta{display:none!important}' });
      await page.evaluate(async () => { for (let y = 0; y < 2200; y += 200) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } });
      const top = typeof r.at === 'number' ? r.at : await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        const hdr = document.querySelector('header');
        return Math.max(0, el.getBoundingClientRect().top + window.scrollY - (hdr ? hdr.getBoundingClientRect().height : 60) - 20);
      }, r.at);
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top);
      await page.waitForTimeout(700);
      for (let i = 0; i < r.n; i++) {
        const y = top + r.dist * glide((i - 12) / (r.n - 24));
        await page.evaluate((y) => new Promise((res) => { window.scrollTo({ top: y, behavior: 'instant' }); requestAnimationFrame(() => requestAnimationFrame(res)); }), y);
        await page.screenshot({ path: join(siteDir, `${r.tag}${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 92 });
      }
      log('recorded', r.path);
      break;
    } catch (e) {
      rmSync(join(siteDir, `${r.tag}0000.jpg`), { force: true });
      if (attempt >= 3) throw e;
      log('retry', r.path, String(e).split('\n')[0]);
    }
  } finally {
    await browser.close();
    dev.kill();
  }
}

// 2) Scene pages (one browser per worker).
const types = { '.html': 'text/html', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
async function openScene() {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--force-color-profile=srgb', '--hide-scrollbars'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.route('http://promo.local/**', (route) => {
    const p = decodeURIComponent(new URL(route.request().url()).pathname);
    let file;
    if (p.startsWith('/pub/')) file = join(root, 'public', p.slice(5));
    else if (p.startsWith('/fonts/')) file = join(root, 'node_modules/@fontsource', p.slice(7));
    else if (p.startsWith('/work/')) file = join(work, p.slice(6));
    else file = join(here, 'scene-v3.html');
    try { route.fulfill({ status: 200, contentType: types[extname(file)] ?? 'application/octet-stream', body: readFileSync(file) }); }
    catch { route.fulfill({ status: 404, body: '' }); }
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('requestfailed', (r) => errors.push('failed ' + r.url()));
  page.on('response', (r) => r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));
  await page.goto('http://promo.local/');
  const info = await page.evaluate(() => window.ready);
  if (info.fonts.includes(false)) throw new Error('fonts not loaded ' + JSON.stringify(info));
  await page.evaluate((recs) => { for (const r of recs) window.REC[r.tag] = r.n; }, RECS.map(({ tag, n }) => ({ tag, n })));
  return { browser, page, errors };
}

if (stills) {
  const { browser, page, errors } = await openScene();
  const dir = join(work, 'stills');
  mkdirSync(dir, { recursive: true });
  const t0 = Date.now();
  for (const t of stills) {
    await page.evaluate((t) => window.render(t), t);
    await page.screenshot({ path: join(dir, `t${t.toFixed(2)}.jpg`), type: 'jpeg', quality: 90 });
  }
  console.log('stills in', dir, `${((Date.now() - t0) / stills.length).toFixed(0)} ms/frame`, errors);
  await browser.close();
  process.exit(0);
}

// 3) Render 60 fps in parallel segments (near-lossless), then blend pairs to 30 fps.
const total = T * SUB;
const per = Math.ceil(total / WORKERS);
const segs = [];
const allErrors = [];
await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
  const a = w * per, b = Math.min(total, a + per);
  const file = join(work, `seg${w}.mp4`);
  segs[w] = file;
  await new Promise((r) => setTimeout(r, w * 4000)); // stagger start-up
  let enc;
  for (let k = 0; ; k++) {
    try { enc = spawn(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(SUB), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'veryfast', '-threads', '2', '-crf', '10', '-pix_fmt', 'yuv420p', '-r', String(SUB), file], { stdio: ['pipe', 'inherit', 'inherit'] }); break; }
    catch (e) { if (k >= 5) throw e; log(`worker ${w}: spawn retry`, e.code); await new Promise((r) => setTimeout(r, 2000)); }
  }
  const { browser, page, errors } = await openScene();
  const done = new Promise((res, rej) => enc.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg ' + c)))));
  for (let i = a; i < b; i++) {
    await page.evaluate((t) => window.render(t), i / SUB);
    const buf = await page.screenshot({ type: 'jpeg', quality: 96 });
    if (!enc.stdin.write(buf)) await new Promise((r) => enc.stdin.once('drain', r));
    if ((i - a) % 300 === 0) log(`worker ${w}: frame ${i - a}/${b - a}`);
  }
  enc.stdin.end();
  await done;
  await browser.close();
  allErrors.push(...errors);
}));
if (allErrors.length) console.warn('page errors:', allErrors);
const list = join(work, 'segs.txt');
writeFileSync(list, segs.map((s) => `file '${s.replace(/\\/g, '/')}'`).join('\n'));
const video = join(work, 'video.mp4');
ff(['-f', 'concat', '-safe', '0', '-i', list, '-vf', `tmix=frames=2,select='not(mod(n\\,2))',setpts=N/(${FPS}*TB)`, '-r', String(FPS),
  '-c:v', 'libx264', '-preset', 'slow', '-tune', 'film', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-g', '60', '-movflags', '+faststart', video]);
log('video blended');

// 4) Placeholder music: the v1 soft ambient pad, extended to 60 s (chords cycle every 5 s).
const pad = join(work, 'pad.wav');
{
  const SR = 48000, N = SR * T;
  const chords = [
    [110.0, 164.81, 207.65, 246.94, 277.18],
    [92.5, 138.59, 164.81, 207.65, 220.0],
    [73.42, 146.83, 185.0, 220.0, 277.18],
    [82.41, 123.47, 164.81, 185.0, 246.94],
  ];
  const L = new Float32Array(N), R = new Float32Array(N);
  const sm = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
  for (let c = 0; c < T / 5; c++) {
    const chord = chords[c % chords.length];
    const a = c * 5 - 0.8, b = c * 5 + 5.8;
    for (let n = 0; n < chord.length; n++) {
      const f = chord[n], amp = (n === 0 ? 0.9 : 0.55) / (1 + n * 0.35);
      const ph = n * 1.7 + c;
      for (let i = Math.max(0, Math.floor(a * SR)); i < Math.min(N, b * SR); i++) {
        const t = i / SR;
        const env = sm((t - a) / 1.6) * sm((b - t) / 1.6) * amp * (0.88 + 0.12 * Math.sin(2 * Math.PI * 0.13 * t + ph));
        const base = Math.sin(2 * Math.PI * f * t + ph);
        const oct = 0.12 * Math.sin(2 * Math.PI * f * 2 * t + ph * 0.5);
        L[i] += env * (base + 0.6 * Math.sin(2 * Math.PI * (f - 0.35) * t) + oct);
        R[i] += env * (base + 0.6 * Math.sin(2 * Math.PI * (f + 0.35) * t + 0.9) + oct);
      }
    }
  }
  const lp = (x, fc) => { const k = 1 - Math.exp(-2 * Math.PI * fc / SR); let y = 0; for (let i = 0; i < x.length; i++) { y += k * (x[i] - y); x[i] = y; } };
  lp(L, 1400); lp(R, 1400);
  const room = (x, ds) => { const out = Float32Array.from(x); for (const [d, g] of ds) { const D = Math.round(d * SR); const buf = new Float32Array(N); for (let i = 0; i < N; i++) { buf[i] = x[i] + (i >= D ? buf[i - D] * g : 0); out[i] += 0.12 * (i >= D ? buf[i - D] : 0); } } return out; };
  const Lr = room(L, [[0.0297, 0.72], [0.0411, 0.7], [0.0533, 0.68]]);
  const Rr = room(R, [[0.0331, 0.72], [0.0437, 0.7], [0.0571, 0.68]]);
  let peak = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR, m = Math.sin(Math.PI / 2 * clamp(t / 1.5)) * Math.sin(Math.PI / 2 * clamp((T - t) / 3));
    Lr[i] *= m; Rr[i] *= m; peak = Math.max(peak, Math.abs(Lr[i]), Math.abs(Rr[i]));
  }
  const g = 0.2 / peak;
  const wav = Buffer.alloc(44 + N * 4);
  wav.write('RIFF', 0); wav.writeUInt32LE(36 + N * 4, 4); wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(2, 22);
  wav.writeUInt32LE(SR, 24); wav.writeUInt32LE(SR * 4, 28); wav.writeUInt16LE(4, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(N * 4, 40);
  for (let i = 0; i < N; i++) { wav.writeInt16LE(Math.round(clamp(Lr[i] * g, -1, 1) * 32767), 44 + i * 4); wav.writeInt16LE(Math.round(clamp(Rr[i] * g, -1, 1) * 32767), 46 + i * 4); }
  writeFileSync(pad, wav);
}

// 5) Final files + review sheets.
const aac = ['-c:a', 'aac', '-b:a', '192k', '-ar', '48000'];
ff(['-i', video, '-f', 'lavfi', '-t', String(T), '-i', 'anullsrc=r=48000:cl=stereo', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', ...aac, '-shortest', '-movflags', '+faststart', OUT.plain]);
ff(['-i', video, '-i', pad, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', ...aac, '-shortest', '-movflags', '+faststart', OUT.music]);
ff(['-ss', '7.2', '-i', video, '-frames:v', '1', '-q:v', '2', OUT.cover]);
const sheet = (pick, out, tile) => ff(['-i', video, '-vf', `select='${pick.map((s) => `eq(n\\,${Math.round(s * FPS)})`).join('+')}',scale=324:576,tile=${tile}:padding=8:color=0x333333`, '-frames:v', '1', '-fps_mode', 'passthrough', '-q:v', '3', out]);
sheet([0.5, 2.9, 6.8, 9.6, 12.1, 14.6, 17.1, 21.5, 26.0, 29.5, 34.0, 42.5, 47.2, 53.6, 59.5], OUT.sheet, '5x3');
// transitions sheet (review only, kept in the work folder unless --keep is off; copied to scratch by the caller)
sheet([3.3, 7.97, 8.97, 18.0, 23.9, 27.5, 30.97, 33.0, 39.1, 41.5, 45.97, 51.97, 55.1, 55.4, 58.9], join(here, 'transitions-60s-v3.jpg'), '5x3');
if (!keep) rmSync(work, { recursive: true, force: true });
for (const f of Object.values(OUT)) log(f.slice(root.length + 1), `${(statSync(f).size / 1024 / 1024).toFixed(2)} MB`);
