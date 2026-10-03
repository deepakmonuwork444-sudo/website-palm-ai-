/**
 * Renders the static brand images into public/ with the installed Chrome
 * (playwright-core from research-tools/): the default share images (English
 * and Hindi, 1200×630), the Organization logo (512×512) and the Apple touch
 * icon (180×180). Run it again only when the brand art changes:
 *
 *   node scripts/make-images.mjs
 *
 * The palm art is the same drawn palm as src/components/PalmTrace.astro; the
 * Hindi image doubles as the conjunct test (हस्तरेखा) for Tiro and Mukta.
 */

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(join(root, 'research-tools', 'package.json'));
const { chromium } = require('playwright-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const font = (pkg, file) =>
  `data:font/woff2;base64,${readFileSync(join(root, 'node_modules', '@fontsource', pkg, 'files', file)).toString('base64')}`;
const fontCss = `
@font-face { font-family: Mukta; font-weight: 400; src: url(${font('mukta', 'mukta-latin-400-normal.woff2')}) format('woff2'); }
@font-face { font-family: Mukta; font-weight: 400; src: url(${font('mukta', 'mukta-devanagari-400-normal.woff2')}) format('woff2'); unicode-range: U+0900-097F, U+200C-200D, U+25CC; }
@font-face { font-family: Mukta; font-weight: 700; src: url(${font('mukta', 'mukta-latin-700-normal.woff2')}) format('woff2'); }
@font-face { font-family: Mukta; font-weight: 700; src: url(${font('mukta', 'mukta-devanagari-700-normal.woff2')}) format('woff2'); unicode-range: U+0900-097F, U+200C-200D, U+25CC; }
@font-face { font-family: Cormorant; font-weight: 700; src: url(${font('cormorant-garamond', 'cormorant-garamond-latin-700-normal.woff2')}) format('woff2'); }
@font-face { font-family: Tiro; font-weight: 400; src: url(${font('tiro-devanagari-hindi', 'tiro-devanagari-hindi-devanagari-400-normal.woff2')}) format('woff2'); }
`;

const wordmark = readFileSync(join(root, 'src', 'components', 'Logo.astro'), 'utf8').match(/<svg class="logo-word"[\s\S]*?<\/svg>/)[0]
  .replace('class="logo-word"', 'class="word"')
  .replace(/ role="img" aria-label=\{site\.brand\}/, '');

const HAND =
  'M70 252 C 58 222, 50 192, 50 160 L 50 100 A 12 12 0 0 1 74 100 L 75 126 L 78 64 A 12.5 12.5 0 0 1 103 64 L 104 120 L 107 50 A 13 13 0 0 1 133 50 L 133 122 L 136 72 A 12.5 12.5 0 0 1 161 72 L 161 146 C 166 134, 176 118, 186 112 A 11 11 0 0 1 200 128 C 194 148, 182 170, 170 186 C 160 200, 152 220, 150 252 Z';
const LINES = {
  life: ['M160 164 C 134 178, 122 206, 130 244', '#F07A5A'],
  head: ['M160 158 C 132 162, 100 172, 68 190', '#6EA8FF'],
  heart: ['M56 152 C 82 142, 110 148, 140 132', '#F27BB0'],
  fate: ['M111 247 C 112 222, 114 196, 118 152', '#A993FF'],
};
const palm = `<svg class="palm" viewBox="36 30 178 230"><defs><linearGradient id="skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A3078"/><stop offset="1" stop-color="#1D1850"/></linearGradient></defs>
<path d="${HAND}" fill="url(#skin)" stroke="rgba(230,184,92,0.38)" stroke-width="1.2" stroke-linejoin="round"/>
${Object.values(LINES)
  .map(([d, c]) => `<path d="${d}" fill="none" stroke="#1A1440" stroke-width="3.4" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>`)
  .join('')}</svg>`;

const og = ({ lang, title, sub, chips }) => `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>${fontCss}
html,body{margin:0;width:1200px;height:630px;overflow:hidden}
body{background:linear-gradient(160deg,#221A4E 0%,#0B0A1F 70%);color:#F6F0E1;font-family:Mukta,sans-serif;display:grid;grid-template-columns:1fr 430px;align-items:center;gap:40px;padding:0 72px;box-sizing:border-box}
.word{height:30px;fill:#F6F0E1;display:block;margin-bottom:40px}
h1{margin:0;font-family:${lang === 'hi' ? 'Tiro' : 'Cormorant'},serif;font-weight:${lang === 'hi' ? 400 : 700};font-size:${lang === 'hi' ? 62 : 70}px;line-height:${lang === 'hi' ? 1.45 : 1.06};letter-spacing:${lang === 'hi' ? 0 : '-0.01em'}}
p{margin:26px 0 0;font-size:28px;line-height:1.5;color:#C3B9D8;max-width:620px}
ul{display:flex;gap:12px;list-style:none;margin:34px 0 0;padding:0}
li{display:flex;align-items:center;gap:10px;white-space:nowrap;font-size:22px;padding:6px 18px 6px 14px;border-radius:999px;background:#15132F;border:1px solid rgba(246,240,225,0.12)}
i{width:14px;height:14px;border-radius:50%;display:block}
.frame{border-radius:36px;border:1px solid rgba(230,184,92,0.32);background:linear-gradient(180deg,#221A4E,#15132F);padding:30px 34px 20px;display:flex;justify-content:center}
.palm{width:100%;height:auto}
</style></head><body><div>${wordmark}<h1>${title}</h1><p>${sub}</p><ul>${chips
  .map(([name, color]) => `<li><i style="background:${color}"></i>${name}</li>`)
  .join('')}</ul></div><div class="frame">${palm}</div></body></html>`;

const _icon = (size) => `<!doctype html><html><head><style>html,body{margin:0;width:${size}px;height:${size}px;overflow:hidden;background:#0B0A1F}
img{width:${size}px;height:${size}px;display:block}</style></head><body><img src="data:image/svg+xml;base64,${Buffer.from(
  readFileSync(join(root, 'public', 'favicon.svg'), 'utf8').replace('rx="14"', 'rx="0"'),
).toString('base64')}"></body></html>`;

const jobs = [
  {
    out: 'og-default.png',
    size: [1200, 630],
    html: og({
      lang: 'en',
      title: 'AI palm reading that traces your real lines',
      sub: 'Heart, head, life and fate lines on your own palm photo, with what palmistry says about each. Hindi and English.',
      chips: [['Heart line', '#F27BB0'], ['Head line', '#6EA8FF'], ['Life line', '#F07A5A'], ['Fate line', '#A993FF']],
    }),
  },
  {
    out: 'og-default-hi.png',
    size: [1200, 630],
    html: og({
      lang: 'hi',
      title: 'AI हस्तरेखा रीडिंग, जो आपकी असली रेखाएं बनाती है',
      sub: 'आपकी अपनी फ़ोटो पर हृदय, मस्तिष्क, जीवन और भाग्य रेखा, और हस्तरेखा ज्ञान के अनुसार उनका मतलब।',
      chips: [['हृदय रेखा', '#F27BB0'], ['मस्तिष्क रेखा', '#6EA8FF'], ['जीवन रेखा', '#F07A5A'], ['भाग्य रेखा', '#A993FF']],
    }),
  },
  // WEB-DEC-044: logo-512.png and apple-touch-icon.png are now 3D renders (public/media/README.md); don't regenerate them here.
  // { out: 'logo-512.png', size: [512, 512], html: _icon(512) },
  // { out: 'apple-touch-icon.png', size: [180, 180], html: _icon(180) },
];

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
try {
  for (const job of jobs) {
    const page = await browser.newPage({ viewport: { width: job.size[0], height: job.size[1] }, deviceScaleFactor: 1 });
    await page.setContent(job.html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: join(root, 'public', job.out), type: 'png' });
    await page.close();
    console.log(`wrote public/${job.out}`);
  }
} finally {
  await browser.close();
}
