// PalmSays promo video v1 (1080x1920, 30 fps, 20 s) for Instagram Reels / YouTube Shorts.
// Scenes are HTML (scene.html) driven by a time value and captured frame by frame in headless
// Chrome, then encoded with the project's ffmpeg-static. Nothing is installed; nothing ships
// with the site (marketing/ is outside public/).
//
// Usage (from the website folder):  node marketing/promo-video/build.mjs [--stills 0.5,1.9,...] [--keep]
//   Starts its own `astro dev` on port 4399 to screen-record the real home page at 390 px,
//   renders all frames, writes palmsays-promo-en-9x16.mp4 (+ ambient pad), -nomusic.mp4,
//   cover.jpg and contact-sheet.jpg next to this file, then deletes the .work folder.
import { execFileSync, spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const { chromium } = createRequire(join(root, 'research-tools', 'package.json'))('playwright-core');
const ffmpeg = createRequire(join(root, 'package.json'))('ffmpeg-static');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const FPS = 30;
const T = 20;
const args = process.argv.slice(2);
const stills = args.includes('--stills') ? args[args.indexOf('--stills') + 1].split(',').map(Number) : null;
const keep = args.includes('--keep') || !!stills;
const work = join(here, '.work');
const OUT = {
  music: join(here, 'palmsays-promo-en-9x16.mp4'),
  plain: join(here, 'palmsays-promo-en-9x16-nomusic.mp4'),
  cover: join(here, 'cover.jpg'),
  sheet: join(here, 'contact-sheet.jpg'),
};
const ff = (a) => execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...a], { stdio: ['ignore', 'inherit', 'inherit'] });
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const eInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const log = (...m) => console.log(`[promo ${((Date.now() - t00) / 1000).toFixed(0)}s]`, ...m);
const t00 = Date.now();

mkdirSync(work, { recursive: true });

// 1) Product-film frames for scene 2: the live line trace (heart -> fate), cropped to the palm card.
const filmDir = join(work, 'film');
if (!existsSync(join(filmDir, '0150.jpg'))) {
  mkdirSync(filmDir, { recursive: true });
  ff(['-ss', '3.3', '-t', '5.2', '-i', join(root, 'public/media/video/product-film-en.mp4'),
    '-vf', 'crop=540:660:370:0,scale=820:1002:flags=lanczos,unsharp=5:5:0.6', '-q:v', '2', join(filmDir, '%04d.jpg')]);
}
const filmN = readdirSync(filmDir).length;
log('film frames', filmN);

// 2) Screen recording of the real home page at 390 px (tools + guides sections), own dev server.
const siteDir = join(work, 'site');
let dev;
if (!existsSync(join(siteDir, 'b0069.jpg'))) {
  mkdirSync(siteDir, { recursive: true });
  const base = 'http://localhost:4399';
  dev = spawn(process.execPath, [join(root, 'node_modules/astro/bin/astro.mjs'), 'dev', '--port', '4399'], { cwd: root, stdio: 'ignore' });
  for (let i = 0; ; i++) {
    try { if ((await fetch(base + '/')).ok) break; } catch { /* not up yet */ }
    if (i > 90) throw new Error('dev server did not start');
    await new Promise((r) => setTimeout(r, 1000));
  }
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 750 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'no-preference' });
    const page = await ctx.newPage();
    await page.addInitScript(() => { try { localStorage.setItem('palmsays-theme', 'night'); } catch { /* storage blocked */ } document.documentElement?.setAttribute('data-theme', 'night'); });
    await page.goto(base + '/', { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'html{scroll-behavior:auto!important} .sticky-cta{display:none!important}' });
    // Pass over the whole page once so lazy images and reveal-on-scroll blocks are settled.
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 250) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 70)); } });
    await page.waitForTimeout(800);
    const segs = [{ id: 'tools', tag: 'a', dist: 600 }, { id: 'guides', tag: 'b', dist: 560 }];
    for (const s of segs) {
      const top = await page.evaluate((id) => {
        const el = document.getElementById(id);
        const hdr = document.querySelector('header');
        return el.getBoundingClientRect().top + window.scrollY - (hdr ? hdr.getBoundingClientRect().height : 60) - 16;
      }, s.id);
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top);
      await page.waitForTimeout(700);
      for (let i = 0; i < 70; i++) {
        const y = top + s.dist * eInOut(clamp((i - 6) / 58));
        await page.evaluate((y) => new Promise((r) => { window.scrollTo({ top: y, behavior: 'instant' }); requestAnimationFrame(() => requestAnimationFrame(r)); }), y);
        await page.screenshot({ path: join(siteDir, `${s.tag}${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 92 });
      }
    }
  } finally {
    await browser.close();
    dev.kill();
  }
  log('site recorded');
}

// 3) Render the scene frame by frame and pipe PNGs straight into ffmpeg.
const types = { '.html': 'text/html', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--force-color-profile=srgb', '--hide-scrollbars'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.route('http://promo.local/**', (route) => {
  const p = decodeURIComponent(new URL(route.request().url()).pathname);
  let file;
  if (p.startsWith('/pub/')) file = join(root, 'public', p.slice(5));
  else if (p.startsWith('/fonts/')) file = join(root, 'node_modules/@fontsource', p.slice(7));
  else if (p.startsWith('/work/')) file = join(work, p.slice(6));
  else file = join(here, 'scene.html');
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
await page.evaluate(([film, a, b]) => { window.FILM.n = film; window.SITE.nA = a; window.SITE.nB = b; }, [filmN, 70, 70]);
log('scene ready', JSON.stringify(info));

if (stills) {
  const dir = join(work, 'stills');
  mkdirSync(dir, { recursive: true });
  for (const t of stills) {
    await page.evaluate((t) => window.render(t), t);
    await page.screenshot({ path: join(dir, `t${t.toFixed(2)}.jpg`), type: 'jpeg', quality: 90 });
  }
  console.log('stills in', dir, errors);
  await browser.close();
  process.exit(0);
}

const video = join(work, 'video.mp4');
const enc = spawn(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
  '-c:v', 'libx264', '-preset', 'slow', '-tune', 'film', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', String(FPS), '-g', '60', '-movflags', '+faststart', video], { stdio: ['pipe', 'inherit', 'inherit'] });
const encDone = new Promise((res, rej) => enc.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg ' + c)))));
const total = T * FPS;
for (let i = 0; i < total; i++) {
  await page.evaluate((t) => window.render(t), i / FPS);
  const buf = await page.screenshot({ type: 'png' });
  if (!enc.stdin.write(buf)) await new Promise((r) => enc.stdin.once('drain', r));
  if (i % 60 === 0) log(`frame ${i}/${total}`);
}
enc.stdin.end();
await encDone;
await browser.close();
if (errors.length) console.warn('page errors:', errors);

// 4) Placeholder music: a soft, warm ambient pad synthesised here (no samples, no copyright).
const pad = join(work, 'pad.wav');
{
  const SR = 48000, N = SR * T;
  const chords = [ // A maj9 -> F#m9 -> D maj9 -> E6sus (Hz), one chord per 5 s
    [110.0, 164.81, 207.65, 246.94, 277.18],
    [92.5, 138.59, 164.81, 207.65, 220.0],
    [73.42, 146.83, 185.0, 220.0, 277.18],
    [82.41, 123.47, 164.81, 185.0, 246.94],
  ];
  const L = new Float32Array(N), R = new Float32Array(N);
  const sm = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
  for (let c = 0; c < chords.length; c++) {
    const a = c * 5 - 0.8, b = c * 5 + 5.8;
    for (let n = 0; n < chords[c].length; n++) {
      const f = chords[c][n], amp = (n === 0 ? 0.9 : 0.55) / (1 + n * 0.35);
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
  // gentle low-pass, a small room (feedback delays), master fades, normalise to -14 dBFS peak
  const lp = (x, fc) => { const k = 1 - Math.exp(-2 * Math.PI * fc / SR); let y = 0; for (let i = 0; i < x.length; i++) { y += k * (x[i] - y); x[i] = y; } };
  lp(L, 1400); lp(R, 1400);
  const room = (x, ds) => { const out = Float32Array.from(x); for (const [d, g] of ds) { const D = Math.round(d * SR); const buf = new Float32Array(N); for (let i = 0; i < N; i++) { buf[i] = x[i] + (i >= D ? buf[i - D] * g : 0); out[i] += 0.12 * (i >= D ? buf[i - D] : 0); } } return out; };
  const Lr = room(L, [[0.0297, 0.72], [0.0411, 0.7], [0.0533, 0.68]]);
  const Rr = room(R, [[0.0331, 0.72], [0.0437, 0.7], [0.0571, 0.68]]);
  let peak = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR, m = Math.sin(Math.PI / 2 * clamp(t / 1.5)) * Math.sin(Math.PI / 2 * clamp((T - t) / 2.5));
    Lr[i] *= m; Rr[i] *= m; peak = Math.max(peak, Math.abs(Lr[i]), Math.abs(Rr[i]));
  }
  const g = 0.2 / peak;
  const wav = Buffer.alloc(44 + N * 4);
  wav.write('RIFF', 0); wav.writeUInt32LE(36 + N * 4, 4); wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(2, 22);
  wav.writeUInt32LE(SR, 24); wav.writeUInt32LE(SR * 4, 28); wav.writeUInt16LE(4, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(N * 4, 40);
  for (let i = 0; i < N; i++) { wav.writeInt16LE(Math.round(clamp(Lr[i] * g, -1, 1) * 32767), 44 + i * 4); wav.writeInt16LE(Math.round(clamp(Rr[i] * g, -1, 1) * 32767), 46 + i * 4); }
  writeFileSync(pad, wav);
}

// 5) Final files.
const aac = ['-c:a', 'aac', '-b:a', '192k', '-ar', '48000'];
ff(['-i', video, '-i', pad, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', ...aac, '-shortest', '-movflags', '+faststart', OUT.music]);
ff(['-i', video, '-f', 'lavfi', '-t', String(T), '-i', 'anullsrc=r=48000:cl=stereo', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', ...aac, '-shortest', '-movflags', '+faststart', OUT.plain]);
ff(['-ss', '1.95', '-i', video, '-frames:v', '1', '-q:v', '2', OUT.cover]);
const pick = [0.1, 1.9, 3.0, 5.6, 7.6, 10.0, 12.2, 14.4, 16.2, 19.9];
ff(['-i', OUT.music, '-vf', `select='${pick.map((s) => `eq(n\\,${Math.round(s * FPS)})`).join('+')}',scale=324:576,tile=5x2:padding=8:color=0x333333`, '-frames:v', '1', '-fps_mode', 'passthrough', '-q:v', '3', OUT.sheet]);
if (!keep) rmSync(work, { recursive: true, force: true });
for (const f of Object.values(OUT)) log(f.slice(root.length + 1), `${(statSync(f).size / 1024 / 1024).toFixed(2)} MB`);
