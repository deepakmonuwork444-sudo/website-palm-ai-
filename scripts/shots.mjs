/**
 * Smoke screenshots of the built site (QA_RELEASE.md §2.1, palmsays-ui skill §4).
 *
 *   npm run build && npm run shots               /, /hi/, /app/
 *   npm run shots -- /hi/app/ /404.html          other paths
 *
 * Starts `astro preview` on a free local port, runs research-tools/shot.mjs
 * (mobile 390×844 @2x + desktop 1440×900, fold + full page) into
 * qa/shots/<date>-<branch>/, and writes fonts.json: the font files each page
 * really downloaded (English pages must not fetch Devanagari).
 */

import { execSync, spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const paths = process.argv.slice(2).filter((arg) => arg.startsWith('/'));
const targets = paths.length ? paths : ['/', '/hi/', '/app/'];

const freePort = () =>
  new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });

let branch = 'local';
try {
  branch = execSync('git branch --show-current', { cwd: root }).toString().trim().replace(/[^\w.-]+/g, '-') || 'local';
} catch {
  // Not a git checkout: keep "local".
}
const date = new Date().toISOString().slice(0, 10);
const outDir = join(root, 'qa', 'shots', `${date}-${branch}`);
mkdirSync(outDir, { recursive: true });

const port = await freePort();
let base = `http://127.0.0.1:${port}`;
const astroBin = join(root, 'node_modules', 'astro', 'bin', 'astro.mjs');
const preview = spawn(process.execPath, [astroBin, 'preview', '--host', '127.0.0.1', '--port', String(port)], {
  cwd: root,
  stdio: ['ignore', 'pipe', 'pipe'],
});
let previewOutput = '';
preview.stdout.on('data', (chunk) => (previewOutput += chunk));
preview.stderr.on('data', (chunk) => (previewOutput += chunk));
const stop = () => {
  if (!preview.killed && preview.exitCode === null) preview.kill();
};
process.on('exit', stop);

try {
  // Wait for the preview server (max 30 s). Astro allows one preview per project:
  // if one is already running (e.g. the owner's), reuse it.
  const deadline = Date.now() + 30_000;
  for (;;) {
    if (preview.exitCode !== null) {
      const running = previewOutput.match(/already running[\s\S]*?URL:\s*(http:\/\/\S+)/);
      if (!running) throw new Error(`astro preview stopped:\n${previewOutput}`);
      base = running[1].replace(/\/+$/, '');
      console.log(`Using the preview server that is already running: ${base}`);
    }
    try {
      const response = await fetch(`${base}/`);
      if (response.ok) break;
    } catch {
      // not up yet
    }
    if (Date.now() > deadline) throw new Error('astro preview did not start; run npm run build first');
    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  const urls = targets.map((path) => `${base}${path}`);
  execSync(`"${process.execPath}" "${join(root, 'research-tools', 'shot.mjs')}" "${outDir}" ${urls.map((u) => `"${u}"`).join(' ')}`, {
    cwd: join(root, 'research-tools'),
    stdio: 'inherit',
  });

  // Which font files each page downloads, on a phone-sized viewport.
  const require = createRequire(join(root, 'research-tools', 'package.json'));
  const { chromium } = require('playwright-core');
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const fonts = {};
  try {
    for (const url of urls) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await context.newPage();
      const files = [];
      page.on('requestfinished', (request) => {
        if (request.resourceType() === 'font') files.push(new URL(request.url()).pathname.split('/').pop());
      });
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 700) {
          window.scrollTo(0, y);
          await new Promise((resolve) => setTimeout(resolve, 60));
        }
      });
      await page.waitForTimeout(400);
      fonts[url.replace(base, '')] = files.sort();
      await context.close();
    }
  } finally {
    await browser.close();
  }
  writeFileSync(join(outDir, 'fonts.json'), `${JSON.stringify(fonts, null, 2)}\n`);
  console.log(`\nfonts per page:\n${JSON.stringify(fonts, null, 2)}`);
  console.log(`\nScreenshots: ${outDir}`);
} finally {
  stop();
}
