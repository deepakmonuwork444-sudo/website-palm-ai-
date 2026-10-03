// Crops and encodes the tool-page hand stills rendered by tool-hand-render.mjs into public/media/tools/.
// Usage: node tool-hand-export.mjs <rendersDir>
//   <rendersDir>/r-base.png, r-square.png, r-long.png, r-short.png, r-longf.png  (2000 x 2500 each, same camera)
// Every file shares one coordinate system, the "palm frame" of src/lib/tools/palm-geometry.ts (1000 x 1300):
// the base image IS that frame; the hand-type images are the same frame moved up by 45 units.
import { createRequire } from 'node:module';
import { mkdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const sharp = createRequire(resolve(root, 'package.json'))('sharp');
const dir = resolve(process.argv[2] ?? resolve(root, 'qa/tools-3d/src'));
const out = resolve(root, 'public/media/tools');
mkdirSync(out, { recursive: true });

const FRAME = { left: 200, top: 120, width: 1600, height: 2080 }; // render px -> palm frame (x 0.625)
const TYPE_FRAME = { ...FRAME, top: FRAME.top - 72 }; // 45 frame units higher
const webp = { quality: 80, alphaQuality: 88, effort: 6 };
const avif = { quality: 55, effort: 7 };
const files = [];
const save = async (img, name, formats = ['webp']) => {
  for (const f of formats) {
    const path = `${out}/${name}.${f}`;
    await img.clone()[f](f === 'webp' ? webp : avif).toFile(path);
    files.push(`${name}.${f} ${(statSync(path).size / 1024).toFixed(1)} KB`);
  }
};

const base = sharp(`${dir}/r-base.png`).extract(FRAME);
const basePng = await base.png().toBuffer();
// Thumbnails and figures draw on these through SVG <image> (webp); the small plate uses <picture>.
await save(sharp(basePng).resize(800, 1040), 'hand-right-800');
await save(sharp(basePng).resize(1000, 1300), 'hand-right-1000');
await save(sharp(basePng).resize(192, 250), 'hand-right-192', ['avif', 'webp']);
await save(sharp(basePng).flop().resize(192, 250), 'hand-left-192', ['avif', 'webp']);
for (const [src, name] of [['r-square', 'palm-square'], ['r-long', 'palm-long'], ['r-short', 'fingers-short'], ['r-longf', 'fingers-long']]) {
  const png = await sharp(`${dir}/${src}.png`).extract(TYPE_FRAME).png().toBuffer();
  await save(sharp(png).resize(480, 624), `${name}-480`, ['avif', 'webp']);
}
console.log(files.join('\n'));
