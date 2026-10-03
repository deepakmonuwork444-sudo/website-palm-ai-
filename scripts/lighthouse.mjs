/**
 * Lighthouse (WEB-FEAT-016): mobile run (Lighthouse's default form factor:
 * Moto G Power, slow 4G, 4x CPU throttling) on / and /palm-reading/ of a
 * running build. Reports go to qa/lighthouse/ (git-ignored); the four scores
 * are printed. Needs network the first time (npx fetches lighthouse).
 *
 *   npm run build && node scripts/smoke.mjs --serve   (serves dist/ on :4333)
 *   npm run lighthouse                                 (in another)
 *   node scripts/lighthouse.mjs --base http://localhost:4321 --only /app/
 */

import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i > 0 ? process.argv[i + 1] : undefined;
};
const BASE = (arg('--base') ?? 'http://localhost:4333').replace(/\/$/, '');
const PAGES = (arg('--only') ?? '/,/palm-reading/').split(',');
const OUT = join(root, 'qa', 'lighthouse');
const NPX = process.platform === 'win32' ? 'npx.cmd' : 'npx';
mkdirSync(OUT, { recursive: true });

let failed = false;
for (const path of PAGES) {
  const name = path.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'home';
  const outBase = join(OUT, name);
  const run = spawnSync(
    NPX,
    [
      '--yes',
      'lighthouse@12',
      BASE + path,
      '--output=json',
      '--output=html',
      `--output-path=qa/lighthouse/${name}`,
      '--chrome-flags=--headless=new',
      '--quiet',
    ],
    { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' },
  );
  if (run.status !== 0) {
    console.log(`lighthouse failed on ${path} (exit ${run.status})`);
    failed = true;
    continue;
  }
  const report = JSON.parse(readFileSync(`${outBase}.report.json`, 'utf8'));
  const score = (key) => Math.round((report.categories[key]?.score ?? 0) * 100);
  console.log(
    `${path.padEnd(16)} performance ${score('performance')} · accessibility ${score('accessibility')} · best practices ${score('best-practices')} · SEO ${score('seo')}  (${outBase}.report.html)`,
  );
}
process.exit(failed ? 1 : 0);
