/**
 * Accessibility check (WEB-FEAT-016): runs axe-core on the key pages of a
 * running build in the installed Chrome (playwright-core from research-tools/),
 * at phone width (390×844) and desktop (1280×900), in the default night theme.
 * CSP is bypassed only so axe can be injected.
 * Fails (exit 1) on any "serious" or "critical" violation; minor/moderate ones
 * are listed but do not fail.
 *
 *   npm run build && node scripts/smoke.mjs --serve   (serves dist/ on :4333)
 *   npm run a11y                                       (in another)
 *   node scripts/a11y.mjs --base http://localhost:4321 --only /,/app/
 */

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(join(root, 'research-tools', 'package.json'));
const { chromium } = require('playwright-core');
const axeSource = readFileSync(createRequire(join(root, 'package.json')).resolve('axe-core/axe.min.js'), 'utf8');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i > 0 ? process.argv[i + 1] : undefined;
};
const BASE = (arg('--base') ?? 'http://localhost:4333').replace(/\/$/, '');
const PAGES = (arg('--only') ?? '/,/app/,/palm-reading/,/tools/,/reading/').split(',');
const VIEWPORTS = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'desktop', width: 1280, height: 900 },
];
const FAIL_ON = new Set(['serious', 'critical']);

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
let failures = 0;
let notes = 0;
try {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, reducedMotion: 'reduce', bypassCSP: true });
    for (const path of PAGES) {
      const page = await context.newPage();
      const res = await page.goto(BASE + path, { waitUntil: 'load', timeout: 60_000 });
      if (!res || !res.ok()) {
        console.log(`FAIL ${vp.name} ${path}: HTTP ${res?.status() ?? 'no response'}`);
        failures += 1;
        await page.close();
        continue;
      }
      await page.waitForTimeout(800);
      await page.addScriptTag({ content: axeSource });
      const result = await page.evaluate(() =>
        // eslint-disable-next-line no-undef
        axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] } }),
      );
      for (const v of result.violations) {
        const bad = FAIL_ON.has(v.impact ?? '');
        if (bad) failures += 1;
        else notes += 1;
        console.log(`${bad ? 'FAIL' : 'note'} ${vp.name} ${path} [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length})`);
        for (const node of v.nodes.slice(0, bad ? 5 : 2)) console.log(`       ${node.target.join(' ')}`);
      }
      if (result.violations.length === 0) console.log(`ok   ${vp.name} ${path} (${result.passes.length} rules passed)`);
      await page.close();
    }
    await context.close();
  }
} finally {
  await browser.close();
}

console.log(`\naxe: ${failures} serious/critical, ${notes} minor/moderate (base ${BASE})`);
process.exit(failures > 0 ? 1 : 0);
