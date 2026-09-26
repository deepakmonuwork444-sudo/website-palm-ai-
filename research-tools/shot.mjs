// Screenshot + style extraction for competitor UI research (read-only browsing).
// Usage: node shot.mjs <outDir> <url> [url...]
// For each URL: mobile (390x844 @2x) above-fold + full page, desktop (1440x900) above-fold + full page,
// plus a JSON of fonts, colours and CTA styles found on the page.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const [outDir, ...urls] = process.argv.slice(2);
if (!outDir || urls.length === 0) {
  console.error('usage: node shot.mjs <outDir> <url...>');
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });

const slug = (u) =>
  u.replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/gi, '_').replace(/_+$/, '').slice(0, 80) || 'page';

const views = [
  {
    name: 'mobile',
    context: {
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      userAgent:
        'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Mobile Safari/537.36',
    },
  },
  { name: 'desktop', context: { viewport: { width: 1440, height: 900 } } },
];

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
try {
  for (const view of views) {
    const context = await browser.newContext(view.context);
    const page = await context.newPage();
    for (const url of urls) {
      const base = path.join(outDir, `${slug(url)}__${view.name}`);
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch(() =>
          page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }),
        );
        await page.waitForTimeout(2500);
        await page.screenshot({ path: `${base}__fold.png` });
        // Scroll to trigger lazy content, then capture the full page (capped height).
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight && y < 20000; y += 700) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 120));
          }
          window.scrollTo(0, 0);
        });
        await page.waitForTimeout(800);
        const height = await page.evaluate(() => document.body.scrollHeight);
        await page.screenshot({
          path: `${base}__full.png`,
          fullPage: height <= 16000,
          clip: height > 16000 ? { x: 0, y: 0, width: view.context.viewport.width, height: 16000 } : undefined,
        });
        if (view.name === 'desktop') {
          const styles = await page.evaluate(() => {
            const count = (m, k) => m.set(k, (m.get(k) || 0) + 1);
            const fonts = new Map();
            const colors = new Map();
            const bgs = new Map();
            for (const el of Array.from(document.querySelectorAll('body *')).slice(0, 4000)) {
              const cs = getComputedStyle(el);
              if (el.childNodes.length && el.textContent.trim()) count(fonts, cs.fontFamily.split(',')[0].trim());
              if (el.textContent.trim()) count(colors, cs.color);
              if (cs.backgroundColor !== 'rgba(0, 0, 0, 0)') count(bgs, cs.backgroundColor);
            }
            const top = (m, n) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
            const ctas = Array.from(document.querySelectorAll('a,button'))
              .filter((b) => b.offsetWidth > 80 && b.offsetHeight > 30 && b.textContent.trim().length < 40)
              .slice(0, 12)
              .map((b) => {
                const cs = getComputedStyle(b);
                return {
                  text: b.textContent.trim(),
                  bg: cs.backgroundColor,
                  bgImage: cs.backgroundImage.slice(0, 120),
                  color: cs.color,
                  radius: cs.borderRadius,
                  font: `${cs.fontWeight} ${cs.fontSize}`,
                };
              });
            const h = (sel) => Array.from(document.querySelectorAll(sel)).slice(0, 8).map((e) => e.textContent.trim().slice(0, 120));
            return {
              title: document.title,
              bodyBg: getComputedStyle(document.body).backgroundColor,
              fonts: top(fonts, 6),
              textColors: top(colors, 8),
              backgrounds: top(bgs, 8),
              ctas,
              h1: h('h1'),
              h2: h('h2'),
              pageHeight: document.body.scrollHeight,
            };
          });
          fs.writeFileSync(`${base}__styles.json`, JSON.stringify({ url, ...styles }, null, 2));
        }
        console.log('ok', view.name, url);
      } catch (e) {
        console.log('FAIL', view.name, url, String(e).slice(0, 160));
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
}
