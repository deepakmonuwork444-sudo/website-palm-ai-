/**
 * Compress the AI-made 3D media for the website (public/media/README.md).
 * Uses the project's own ffmpeg (devDependency ffmpeg-static) and sharp; nothing
 * is installed outside the project.
 *
 *   node scripts/compress-media.mjs video <source.mp4> <name> [crop]
 *     -> public/media/video/<name>.mp4 (H.264) + <name>.webm (VP9), muted, 720p max,
 *        plus the poster <name>-poster.avif / .webp (first frame). crop = ffmpeg w:h:x:y.
 *   node scripts/compress-media.mjs image <source.png> <out path without extension> <width> [width...]
 *     -> <out>-<width>.avif + .webp for each width (transparent PNGs keep their alpha).
 *   node scripts/compress-media.mjs icon <source.png> <out path without extension>
 *     -> <out>-96.webp and <out>-192.webp (3D icons, alpha kept).
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpeg from 'ffmpeg-static';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [mode, source, name, ...rest] = process.argv.slice(2);
const size = (file) => `${(statSync(file).size / 1024).toFixed(1)} KB`;
const run = (args) => execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });

if (mode === 'video') {
  const out = join(root, 'public', 'media', 'video');
  mkdirSync(out, { recursive: true });
  const crop = rest[0] ? `crop=${rest[0]},` : '';
  const vf = `${crop}scale='min(1280,iw)':-2,fps=24,format=yuv420p`;
  const mp4 = join(out, `${name}.mp4`);
  const webm = join(out, `${name}.webm`);
  run(['-i', source, '-an', '-vf', vf, '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'veryslow', '-crf', '22', '-movflags', '+faststart', mp4]);
  run(['-i', source, '-an', '-vf', vf, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '32', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', webm]);
  const frame = join(out, `${name}-poster.png`);
  run(['-i', source, '-vf', `${crop}scale='min(1280,iw)':-2`, '-frames:v', '1', frame]);
  await sharp(frame).avif({ quality: 55, effort: 6 }).toFile(join(out, `${name}-poster.avif`));
  await sharp(frame).webp({ quality: 74, effort: 6 }).toFile(join(out, `${name}-poster.webp`));
  rmSync(frame);
  for (const file of [mp4, webm, join(out, `${name}-poster.avif`), join(out, `${name}-poster.webp`)]) console.log(`${file.slice(root.length + 1)}  ${size(file)}`);
} else if (mode === 'image') {
  mkdirSync(dirname(name), { recursive: true });
  for (const width of rest.map(Number)) {
    const base = sharp(source).resize({ width, withoutEnlargement: true });
    await base.clone().avif({ quality: 62, effort: 6 }).toFile(`${name}-${width}.avif`);
    await base.clone().webp({ quality: 80, effort: 6, alphaQuality: 90 }).toFile(`${name}-${width}.webp`);
    console.log(`${name}-${width}: avif ${size(`${name}-${width}.avif`)}, webp ${size(`${name}-${width}.webp`)}`);
  }
} else if (mode === 'icon') {
  mkdirSync(dirname(name), { recursive: true });
  for (const width of [96, 192]) {
    await sharp(source).resize(width, width, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 82, effort: 6, alphaQuality: 90, smartSubsample: true }).toFile(`${name}-${width}.webp`);
    console.log(`${name}-${width}.webp  ${size(`${name}-${width}.webp`)}`);
  }
} else {
  console.error('usage: compress-media.mjs video|image|icon <source> <name|out> [...]');
  process.exit(1);
}
