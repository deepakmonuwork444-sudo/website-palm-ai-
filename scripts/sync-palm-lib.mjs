/**
 * sync-palm-lib: copies the app's pure TypeScript reading code into
 * src/lib/reading/palm/ (ARCHITECTURE.md §8 + F7, plan §12.6). The web reading
 * runs the app's OWN pipeline (runReading → buildEvidence → writeReport →
 * synthesise) and locks (lockSynthesis), so the web and the app give the
 * same reading for the same scan.
 *
 *   node scripts/sync-palm-lib.mjs                      app repo next to this one
 *   node scripts/sync-palm-lib.mjs "D:\path\to\app"     another checkout
 *
 * - Follows every relative import (value and type) from ENTRIES; the copy keeps
 *   the app's own folder layout under src/lib/reading/palm/ so no import is
 *   rewritten.
 * - Fails if a copied file imports anything but relative files and `zod`
 *   (no react-native, expo, zustand, supabase).
 * - Two files are WEB SHIMS, written here, never copied: i18n/index.ts (the
 *   app's one reads the profile store) and features/quality/gate.ts (the app's
 *   one decodes with expo-image-manipulator; the web decodes with a canvas in
 *   src/lib/reading/quality.ts).
 * - Each copy starts with a header naming its source path and the app commit.
 *   SOURCE.md lists every file with the sha256 of the app's original; the
 *   parity test (tests/unit/reading-palm.test.ts) checks the copies against it.
 * - If the app's test build exists (run `npm.cmd test` in the app repo first),
 *   the app's own compiled code reads the mock scan once and the result is
 *   saved as tests/fixtures/palm-golden.json: the web copy must give exactly
 *   the same reading (the parity test).
 *
 * Never edit src/lib/reading/palm/ by hand: change the app, then re-run this.
 */

import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = resolve(process.argv[2] ?? join(root, '..', 'palm-ai-new--feat-m1-foundation'));
const appSrc = join(app, 'src');
const dest = join(root, 'src', 'lib', 'reading', 'palm');

/** What the web reading calls. Everything they import comes along. */
const ENTRIES = [
  'features/reading/pipeline.ts',
  'features/reading/access.ts',
  'features/reading/report-sections.ts',
  'features/vision/normalise.ts',
  'features/vision/provider.ts',
  'features/quality/metrics.ts',
  'features/quality/verdict.ts',
  'features/lines/types.ts',
  'features/lines/merge.ts',
  'features/lines/client.ts',
  'features/observation/dominance.ts',
  'features/observation/schema.ts',
];

const SHIM_HEADER = (path) =>
  `// WEB SHIM for palm-ai-new--feat-m1-foundation/src/${path} — written by scripts/sync-palm-lib.mjs, not copied.\n` +
  '// The app version needs React Native; the copied files only use what is below.\n\n';

const SHIMS = {
  'i18n/index.ts':
    SHIM_HEADER('i18n/index.ts') +
    `export type Lang = 'en' | 'hi';

export interface Bilingual {
  en: string;
  hi: string;
}

export function pick(lang: Lang, en: string, hi: string): string {
  return lang === 'hi' ? hi : en;
}

export function pickB(lang: Lang, text: Bilingual): string {
  return lang === 'hi' ? text.hi : text.en;
}
`,
  'features/quality/gate.ts':
    SHIM_HEADER('features/quality/gate.ts') +
    `import type { QualityVerdict } from './verdict';

/** Same shape as the app's gate result; the web computes it in src/lib/reading/quality.ts. */
export interface GateResult extends QualityVerdict {
  sourceWidth: number;
  sourceHeight: number;
}
`,
};

const ALLOWED_PACKAGES = new Set(['zod']);

function fail(message) {
  console.error(`sync-palm-lib: ${message}`);
  process.exit(1);
}

if (!existsSync(appSrc)) fail(`app repo not found at ${app} (pass its path as the first argument)`);

const rel = (file) => relative(appSrc, file).split(sep).join('/');
const sha256 = (text) => createHash('sha256').update(text).digest('hex');

function resolveImport(from, spec) {
  const base = resolve(dirname(from), spec);
  for (const candidate of [`${base}.ts`, join(base, 'index.ts'), base]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

const files = new Map();
function walk(file) {
  const path = rel(file);
  if (files.has(path)) return;
  if (path in SHIMS) {
    files.set(path, null);
    return;
  }
  const text = readFileSync(file, 'utf8');
  files.set(path, text);
  const importRe = /(?:^|\n)\s*(?:import|export)\s+(?:type\s+)?(?:[^'";]*?\s+from\s+)?['"]([^'"]+)['"]/g;
  for (const match of text.matchAll(importRe)) {
    const spec = match[1];
    if (spec.startsWith('.')) {
      const target = resolveImport(file, spec);
      if (!target) fail(`${path}: cannot resolve ${spec}`);
      walk(target);
    } else if (!ALLOWED_PACKAGES.has(spec)) {
      fail(`${path} imports "${spec}" — only relative files and zod may be copied (no react-native / expo)`);
    }
  }
  if (/\bfrom ['"](react-native|expo[^'"]*)['"]|\brequire\(/.test(text)) fail(`${path} reaches for React Native / Expo / require`);
}
for (const entry of ENTRIES) {
  const file = join(appSrc, entry);
  if (!existsSync(file)) fail(`entry ${entry} does not exist in the app`);
  walk(file);
}

let commit = 'unknown';
let dirty = [];
try {
  commit = execSync('git rev-parse --short=12 HEAD', { cwd: app }).toString().trim();
  const copied = [...files.keys()].filter((path) => files.get(path) !== null).map((path) => `src/${path}`);
  dirty = execSync(`git status --porcelain -- ${copied.map((p) => `"${p}"`).join(' ')}`, { cwd: app })
    .toString()
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
} catch {
  // Not a git checkout: the commit stays "unknown".
}
const date = new Date().toISOString().slice(0, 10);

rmSync(dest, { recursive: true, force: true });
const rows = [];
for (const [path, text] of [...files].sort(([a], [b]) => a.localeCompare(b))) {
  const out = join(dest, ...path.split('/'));
  mkdirSync(dirname(out), { recursive: true });
  if (text === null) {
    writeFileSync(out, SHIMS[path]);
    rows.push(`| \`${path}\` | web shim | — |`);
    continue;
  }
  const header =
    `// COPIED from palm-ai-new--feat-m1-foundation/src/${path} at app commit ${commit} (${date}).\n` +
    '// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).\n' +
    // The app type-checks this file with its own settings; the website's stricter
    // ones (exactOptionalPropertyTypes) are not applied to a verbatim copy.
    '// @ts-nocheck\n';
  writeFileSync(out, header + text);
  rows.push(`| \`${path}\` | ${sha256(text)} | ${Buffer.byteLength(text)} |`);
}

const source = `# src/lib/reading/palm — copied app code (do not edit)

Written by \`scripts/sync-palm-lib.mjs\` on ${date}.

- App repo: \`palm-ai-new--feat-m1-foundation\`
- App commit: \`${commit}\`${dirty.length ? ` **plus uncommitted changes in ${dirty.length} copied file(s)** (the copies are the working tree, not the commit)` : ''}
- Files: ${rows.length} (${Object.keys(SHIMS).length} web shims)

Each copy starts with a 3-line header (source path + commit, "do not edit", \`@ts-nocheck\`); the
sha256 below is of the app's file WITHOUT that header. \`tests/unit/reading-palm.test.ts\` checks it.

| File (under the app's \`src/\`) | sha256 of the app file | bytes |
|---|---|---|
${rows.join('\n')}
`;
writeFileSync(join(dest, 'SOURCE.md'), source);
console.log(`sync-palm-lib: ${rows.length} files from ${commit}${dirty.length ? ' (+ uncommitted changes)' : ''} → src/lib/reading/palm/`);

// Golden reading from the app's own compiled code (parity test input).
const build = join(app, '.test-build', 'src', 'features');
if (!existsSync(join(build, 'reading', 'pipeline.js'))) {
  console.warn('sync-palm-lib: no app test build (.test-build) — run `npm.cmd test` in the app repo, then this again, to refresh tests/fixtures/palm-golden.json');
  process.exit(0);
}
const require = createRequire(import.meta.url);
const { runReading } = require(join(build, 'reading', 'pipeline.js'));
const { lockSynthesis, FREE_LOCKED_SECTIONS } = require(join(build, 'reading', 'access.js'));
const mockScan = JSON.parse(readFileSync(join(root, 'src', 'lib', 'reading', 'mock', 'scan-response.json'), 'utf8'));
const mockVision = JSON.parse(readFileSync(join(root, 'src', 'lib', 'reading', 'mock', 'vision-output.json'), 'utf8'));
const input = JSON.parse(readFileSync(join(root, 'src', 'lib', 'reading', 'mock', 'golden-input.json'), 'utf8'));
const outcome = await runReading({
  ...input.reading,
  lineScan: { status: 'ok', response: mockScan, latencyMs: 0 },
  provider: {
    id: input.provider.id,
    model: input.provider.model,
    version: input.provider.version,
    runsOnDevice: false,
    extract: async () => ({ output: mockVision, latencyMs: 0, costUnits: null }),
  },
});
const stable = (value) => JSON.parse(JSON.stringify(value, (key, v) => (key === 'capturedAt' || key === 'generatedAt' ? '<time>' : v)));
const golden = {
  note: `Computed by the APP's compiled code (commit ${commit}) from src/lib/reading/mock/*.json. Written by scripts/sync-palm-lib.mjs; never edit.`,
  observation: stable(outcome.observation),
  report: stable(outcome.report),
  synthesis: stable(outcome.synthesis),
  locked: stable(outcome.synthesis ? lockSynthesis(outcome.synthesis, FREE_LOCKED_SECTIONS) : null),
};
mkdirSync(join(root, 'tests', 'fixtures'), { recursive: true });
writeFileSync(join(root, 'tests', 'fixtures', 'palm-golden.json'), `${JSON.stringify(golden, null, 1)}\n`);
console.log('sync-palm-lib: tests/fixtures/palm-golden.json written from the app build');
process.exit(0);
