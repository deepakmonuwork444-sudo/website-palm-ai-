// Contact sheet of rendered film frames. Usage: node research-tools/film-sheet.mjs <framesDir> <out.png> [every=30] [cols=4] [width=480]
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const sharp = createRequire(join(process.cwd(), 'package.json'))('sharp');
const [dir, out, every = '30', cols = '4', width = '480'] = process.argv.slice(2);
const w = Number(width);
const h = Math.round((w * 9) / 16);
const files = readdirSync(dir).filter((f) => f.endsWith('.png')).sort().filter((f) => Number(f.match(/\d+/)[0]) % Number(every) === 0);
const c = Number(cols);
const comps = [];
for (const [i, f] of files.entries()) {
  const x = (i % c) * w;
  const y = Math.floor(i / c) * (h + 20);
  comps.push({ input: await sharp(join(dir, f)).resize(w, h).toBuffer(), left: x, top: y + 20 });
  const sec = (Number(f.match(/\d+/)[0]) / 30).toFixed(1);
  comps.push({ input: Buffer.from(`<svg width="${w}" height="20"><text x="4" y="15" fill="#ccc" font-size="14" font-family="Arial">${sec}s</text></svg>`), left: x, top: y });
}
await sharp({ create: { width: c * w, height: Math.ceil(files.length / c) * (h + 20), channels: 3, background: '#000' } }).composite(comps).png().toFile(out);
console.log(out, files.length);
