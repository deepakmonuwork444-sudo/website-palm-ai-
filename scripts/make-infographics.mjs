/**
 * Blog infographics and the simple palm charts (owner 2026-10-01, CONTENT_GUIDE.md §15 "Blog infographics"):
 * one idea per image, labels sitting on what they name (no numbered legends), big text, few words.
 *
 *   node scripts/make-infographics.mjs            all of them
 *   node scripts/make-infographics.mjs matrix     only ids containing "matrix"
 *
 * Writes, for every entry of src/lib/diagrams.ts made here: public/img/diagrams/<id>.{png,webp,avif}
 * (1800 px wide), <id>-900.{webp,avif} and a tall phone layout <id>-tall.{webp,avif} (1080 px wide,
 * text at 38 px or more so it reads on a 390 px screen).
 *
 * What is drawn and what is not (WEB-DEC-047/048):
 * - Hands are the site's own DRAWN hand (src/lib/guides/palm-geometry.ts), never a photo with drawn lines.
 * - The only photo is a licensed REAL palm photo: design-v4/guide-assets/real-palm.png (Pexels photo
 *   8058729 by Hanna Pad (Anna Nekrashevich), Pexels License; design-v4/photo-credits.json). It is a
 *   right hand, thumb on the viewer's right. Lines on it come only from the real scanner's output for
 *   that photo (real-palm.scan.json); only lines the scan marks present are drawn, nothing by hand.
 *   The "same palm, different photo" tiles are real image edits of it (light, angle, blur) in Chrome.
 * - Icons: our own flat outline icons (the path data of src/components/Icon.astro, 24 px grid, round
 *   caps), drawn as inline SVG. No AI image and no image generator anywhere in these files.
 * Natural style (owner 2026-10-02, "natural premium", never an AI filter): solid fills only (page
 * #0B0A1F, panel #15132F, raised #1E1B42) with a crisp border (#2E2A5C) and small corners; no glow, no
 * light pool, no grain, no blur filter, no drop shadow, no glossy or multi-stop gradient; the palm line
 * colours are clean solid strokes; ivory #F6F0E1 text with #D4CCE6 for secondary words, gold as a solid
 * accent. Rendered with the installed Chrome (playwright-core from research-tools/), encoded with sharp.
 */

import { mkdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

import { DIAGRAMS } from '../src/lib/diagrams.ts';
import { BASE_PATHS, PALM_OUTLINE, VARIANTS } from '../src/lib/guides/palm-geometry.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(join(root, 'research-tools', 'package.json'));
const { chromium } = require('playwright-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = join(root, 'public', 'img', 'diagrams');
const ASSETS = join(root, 'design-v4', 'guide-assets');
const only = process.argv[2];

const font = (pkg, file) => `data:font/woff2;base64,${readFileSync(join(root, 'node_modules', '@fontsource', pkg, 'files', file)).toString('base64')}`;
const spec = (id) => {
  const found = DIAGRAMS.find((item) => item.id === id);
  if (!found) throw new Error(`make-infographics: ${id} is not in src/lib/diagrams.ts`);
  return found;
};
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Site tokens (global.css), the same as make-diagrams.mjs.
const C = {
  page: '#0B0A1F',
  panel: '#15132F',
  raised: '#1E1B42',
  border: '#2E2A5C',
  skin: '#262150',
  ink: '#0D0B28',
  halo: '#1A1440',
  gold: '#E6B85C',
  goldBright: '#F5D98B',
  onGold: '#1F1300',
  text: '#F6F0E1',
  muted: '#D4CCE6',
  dim: '#A39CC4',
  heart: '#FF4D5E',
  head: '#4C8DFF',
  life: '#2FD06A',
  fate: '#B26BFF',
  yes: '#2FD06A',
  no: '#FF6B6B',
};
const MAIN = ['heart', 'head', 'life', 'fate'];
const colour = (kind) => (kind === 'minor' ? C.goldBright : C[kind]);

// ---------------------------------------------------------------------------
// Text

function wrap(text, max) {
  const lines = [];
  for (const part of String(text).split('\n')) {
    let line = '';
    for (const word of part.split(' ')) {
      if (max && line && `${line} ${word}`.length > max) {
        lines.push(line);
        line = word;
      } else line = line ? `${line} ${word}` : word;
    }
    lines.push(line);
  }
  return lines;
}
/** Text block; `max` wraps at that many characters. Returns SVG. */
function T(x, y, text, { size = 36, weight = 400, fill = C.text, anchor = 'start', serif = false, max = 0, lh = 1.22, opacity = 1 } = {}) {
  const lines = wrap(text, max);
  const fam = serif ? 'Cormorant, serif' : 'Mukta, sans-serif';
  return `<text x="${x}" y="${y}" font-family="${fam}" font-weight="${weight}" font-size="${size}" fill="${fill}" fill-opacity="${opacity}" text-anchor="${anchor}"${serif ? ' style="font-variant-numeric: lining-nums"' : ''}>${lines
    .map((l, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : size * lh}">${esc(l)}</tspan>`)
    .join('')}</text>`;
}
const nLines = (text, max) => wrap(text, max).length;

// ---------------------------------------------------------------------------
// Frame, cards, icons

/**
 * Flat outline icons: the path data of src/components/Icon.astro (24 px grid, 1.75 stroke, round caps
 * and joins), copied here by Icon.astro name.
 */
const ICON_PATHS = {
  scan: '<path d="M4 8.2V6.6A2.6 2.6 0 0 1 6.6 4h1.6M15.8 4h1.6A2.6 2.6 0 0 1 20 6.6v1.6M20 15.8v1.6a2.6 2.6 0 0 1-2.6 2.6h-1.6M8.2 20H6.6A2.6 2.6 0 0 1 4 17.4v-1.6M7 12h10"/>',
  book: '<path d="M4 5.6A1.6 1.6 0 0 1 5.6 4H10a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4ZM20 5.6A1.6 1.6 0 0 0 18.4 4H14a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6Z"/>',
  shield: '<path d="M12 3.2 5.5 5.8v5.6c0 4.2 2.8 7.6 6.5 9.1 3.7-1.5 6.5-4.9 6.5-9.1V5.8Z"/><path d="M9.3 12.2l1.9 1.9 3.6-3.7"/>',
  phone: '<rect x="7" y="2.8" width="10" height="18.4" rx="2.6"/><path d="M10.8 5.7h2.4"/>',
  lock: '<rect x="5" y="10.5" width="14" height="9.5" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5M12 14.3v2"/>',
  lines: '<path d="M19.5 8.2c-4.4-1.8-9.2-1.6-13 .6M4.5 12.4c5-.6 10 1 13.6 4.6M4.5 12.4c3.6 2 5.8 5 6.2 8.6"/>',
  compare: '<path d="M4.5 8.5h13.5M15 5.2l3.3 3.3L15 11.8M19.5 15.5H6M9 12.2l-3.3 3.3L9 18.8"/>',
  spark: '<path d="M12 4v4M12 16v4M4 12h4M16 12h4"/><circle cx="12" cy="12" r="1.4"/>',
  camera: '<path d="M4 8.6A2.6 2.6 0 0 1 6.6 6h1.5l1.5-2.1h4.8L15.9 6h1.5A2.6 2.6 0 0 1 20 8.6v8a2.6 2.6 0 0 1-2.6 2.6H6.6A2.6 2.6 0 0 1 4 16.6Z"/><circle cx="12" cy="12.4" r="3.3"/>',
  check: '<path d="M5 12.6l4.2 4.2L19 7"/>',
};
/** The roles used in the data below, mapped to the closest Icon.astro icon. */
const ICON_FOR = { scanner: 'scan', book: 'book', shield: 'shield', tag: 'phone', trash: 'lock', magnifier: 'lines', repeat: 'compare', chat: 'spark', camera: 'camera', checklist: 'check' };

const frame = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${C.page}"/>
  ${body}
</svg>`;

/** A flat card: one solid fill, a crisp border, small corners. `tint` = a flat wash of one colour. */
function card(x, y, w, h, { r = 12, tint = '', tintOpacity = 0.1 } = {}) {
  return `<rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${h - 2}" rx="${r}" fill="${C.panel}" stroke="${C.border}" stroke-width="2"/>
  ${tint ? `<rect x="${x + 2}" y="${y + 2}" width="${w - 4}" height="${h - 4}" rx="${r - 1}" fill="${tint}" fill-opacity="${tintOpacity}"/>` : ''}`;
}

/** A flat icon: a solid raised tile with a crisp border and the outline icon in gold, centred. */
function icon(name, x, y, size, { stroke = C.gold } = {}) {
  const paths = ICON_PATHS[ICON_FOR[name] ?? name];
  if (!paths) throw new Error(`make-infographics: no icon ${name}`);
  const glyph = size * 0.58;
  const k = glyph / 24;
  return `<rect x="${x + 1}" y="${y + 1}" width="${size - 2}" height="${size - 2}" rx="${Math.min(12, size * 0.12)}" fill="${C.raised}" stroke="${C.border}" stroke-width="2"/>
  <g transform="translate(${x + (size - glyph) / 2} ${y + (size - glyph) / 2}) scale(${k})" fill="none" stroke="${stroke}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${paths}</g>`;
}

/** Title (gold serif) and an optional subtitle. Returns { svg, bottom }. */
/** Where the phone layout's title breaks (characters a line), so it breaks at a natural place. */
const TALL_TITLE_MAX = {
  'four-main-palm-lines-chart': 19,
  'minor-palm-lines-chart': 18,
  'palm-lines-form-timeline': 21,
  'palm-lines-what-changes': 16,
  'palm-app-five-checks': 19,
  'chatbot-vs-palm-scanner-flow': 19,
  'how-rare-palm-lines-numbers': 24,
};
function heading(d, tall, sub = '') {
  const x = tall ? 56 : 80;
  const size = tall ? 64 : 66;
  const max = tall ? (TALL_TITLE_MAX[d.id] ?? 27) : 60;
  const lines = nLines(d.name, max);
  let svg = T(x, tall ? 104 : 104, d.name, { size, weight: 700, serif: true, fill: C.text, max, lh: 1.05 });
  let bottom = (tall ? 104 : 104) + (lines - 1) * size * 1.05;
  if (sub) {
    const subSize = tall ? 40 : 36;
    const subMax = tall ? 46 : 90;
    svg += T(x, bottom + subSize * 1.5, sub, { size: subSize, fill: C.muted, max: subMax });
    bottom += subSize * 1.5 + (nLines(sub, subMax) - 1) * subSize * 1.22;
  }
  return { svg, bottom };
}

/** The note (what the image is) and the credit + licence line. */
function footer(w, h, page, note, tall, licence = 'CC BY 4.0') {
  if (tall) {
    const credit = `PalmSays · ${licence} · palmsays.com${page}`;
    const cl = nLines(credit, 40);
    const nl = nLines(note, 50);
    const creditTop = h - 38 - (cl - 1) * 42;
    return `${T(56, creditTop - 62 - (nl - 1) * 46, note, { size: 38, fill: C.muted, max: 50 })}
  ${T(56, creditTop, credit, { size: 34, fill: C.dim, max: 40, lh: 1.24 })}`;
  }
  return `${T(80, h - 92, note, { size: 34, fill: C.muted })}
  ${T(80, h - 44, `PalmSays · palmsays.com${page} · ${licence}`, { size: 30, weight: 700, fill: C.gold })}`;
}

// ---------------------------------------------------------------------------
// The drawn palm (palm units, viewBox 36 30 178 230)

/**
 * Palm at scale `s`, top-left of the palm box at (x, y).
 * focus: [{ d, kind }] coloured lines; context: dimmed main lines; fine: thin muted fine lines;
 * ring: [cx, cy, r] a soft gold ring round a small line; extra: SVG in palm units.
 */
function palm(x, y, s, { focus = [], context = [], fine = [], ring = null, extra = '' } = {}) {
  const px = (n) => n / s; // pixels to palm units
  const big = s >= 3;
  const fw = px(big ? 11 : 7);
  const cw = px(big ? 5 : 3.4);
  return `<g transform="translate(${x - 36 * s} ${y - 30 * s}) scale(${s})">
    <path d="${PALM_OUTLINE}" fill="${C.skin}" stroke="${C.gold}" stroke-width="${px(2.4)}" stroke-linejoin="round"/>
    ${ring ? `<circle cx="${ring[0]}" cy="${ring[1]}" r="${ring[2]}" fill="${C.gold}" fill-opacity="0.16" stroke="${C.gold}" stroke-width="${px(3)}" stroke-dasharray="${px(8)} ${px(5)}"/>` : ''}
    ${context.map((d) => `<path d="${d}" fill="none" stroke="${C.dim}" stroke-opacity="0.6" stroke-width="${cw}" stroke-linecap="round"/>`).join('')}
    ${fine.map((d) => `<path d="${d}" fill="none" stroke="${C.muted}" stroke-opacity="0.55" stroke-width="${px(big ? 2.6 : 1.8)}" stroke-linecap="round"/>`).join('')}
    ${focus.map((f) => `<path d="${f.d}" fill="none" stroke="${colour(f.kind)}" stroke-width="${fw}" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}
    ${extra}
  </g>`;
}
const P = (x, y, s, [u, v]) => [x + (u - 36) * s, y + (v - 30) * s];

/** Minor lines where Cheiro's Palmistry for All (1916) places them (the same paths as the old palm chart). */
const MINOR = {
  sun: { name: 'Sun line', where: 'Up towards the ring finger', d: ['M90 200 C 90 180, 89 160, 88 138'] },
  mercury: { name: 'Mercury line', where: 'Up towards the little finger', d: ['M104 244 C 92 216, 78 184, 62 150'] },
  marriage: { name: 'Marriage lines', where: 'Short lines on the edge, under the little finger', d: ['M50 134 C 53 134, 57 133.5, 60 133', 'M50 140 C 53 140, 56 139.5, 59 139'], ring: [55, 137, 11] },
  bracelets: { name: 'Bracelets', where: 'Creases across the wrist', d: ['M76 247 C 100 250, 126 250, 146 247'] },
  girdle: { name: 'Girdle of Venus', where: 'A curve above the heart line', d: ['M131 130 C 119 122, 93 122, 80 133'] },
  intuition: { name: 'Intuition line', where: 'A curve on the outer palm', d: ['M64 164 C 56 182, 57 200, 66 214'] },
  travel: { name: 'Travel lines', where: 'Short lines low on the outer edge', d: ['M60 227 C 64 226.5, 68 226, 72 225', 'M63 236 C 67 235.5, 71 235, 75 234'], ring: [67, 231, 13] },
  mars: { name: 'Line of Mars', where: 'Just inside the life line', d: ['M167 180 C 150 190, 141 210, 144 236'] },
  solomon: { name: 'Ring of Solomon', where: 'Round the base of the index finger', d: ['M137 123 C 143 130, 153 130, 160 122'], ring: [148, 126, 15] },
};
const minorView = (key) => ({ focus: MINOR[key].d.map((d) => ({ d, kind: 'minor' })), context: MAIN.map((l) => BASE_PATHS[l]), ring: MINOR[key].ring ?? null });
const mainView = (line) => ({ focus: [{ d: BASE_PATHS[line], kind: line }], context: MAIN.filter((l) => l !== line).map((l) => BASE_PATHS[l]) });
function variantView(name, ring = null) {
  const v = VARIANTS[name];
  const context = MAIN.filter((line) => line !== v.kind)
    .map((line) => (v.context && line in v.context ? v.context[line] : BASE_PATHS[line]))
    .filter(Boolean);
  return { focus: v.paths.map((d) => ({ d, kind: v.kind })), context, ring };
}

/** A small rounded tag. */
function chip(cx, cy, text, size, { fill = C.gold, fg = C.onGold, outline = false } = {}) {
  const w = text.length * size * 0.54 + size * 1.3;
  const h = size * 1.62;
  return `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="${Math.min(12, h / 2)}" fill="${outline ? 'none' : fill}" ${outline ? `stroke="${fill}" stroke-width="2.5"` : ''}/>
    ${T(cx, cy + size * 0.35, text, { size, weight: 700, fill: outline ? fill : fg, anchor: 'middle' })}`;
}

/**
 * A card with a small palm on top and its words under it (vertical), or the palm on the left (horizontal).
 */
function palmCard({ x, y, w, h, s, view, name, where, tag, nameSize, whereSize, nameMax, whereMax, nameFill = C.text, horizontal = false }) {
  const pw = 178 * s;
  const ph = 230 * s;
  let out = card(x, y, w, h);
  if (horizontal) {
    out += palm(x + 26, y + (h - ph) / 2, s, view);
    const tx = x + 26 + pw + 26;
    const nl = nLines(name, nameMax);
    const wl = nLines(where, whereMax);
    const block = nl * nameSize * 1.15 + 14 + wl * whereSize * 1.22;
    const ty = y + (h - block) / 2 + nameSize * 0.85;
    out += T(tx, ty, name, { size: nameSize, weight: 700, fill: nameFill, max: nameMax, lh: 1.15 });
    out += T(tx, ty + (nl - 1) * nameSize * 1.15 + 14 + whereSize * 1.1, where, { size: whereSize, fill: C.muted, max: whereMax });
    return out;
  }
  out += palm(x + (w - pw) / 2, y + 22, s, view);
  const cx = x + w / 2;
  let ty = y + 22 + ph + 20 + nameSize;
  out += T(cx, ty, name, { size: nameSize, weight: 700, fill: nameFill, max: nameMax, anchor: 'middle', lh: 1.12 });
  ty += (nLines(name, nameMax) - 1) * nameSize * 1.12 + 12 + whereSize;
  out += T(cx, ty, where, { size: whereSize, fill: C.muted, max: whereMax, anchor: 'middle' });
  if (tag) out += chip(cx, y + h - 26 - whereSize * 0.85, tag.text, whereSize * 0.92, tag.style ?? {});
  return out;
}

// ---------------------------------------------------------------------------
// 1. Palm reading chart: the 4 main lines (labels on the lines)

const MAIN_WORDS = {
  heart: { name: 'Heart line', where: 'The top line, under the fingers', dot: [84, 146], at: [80, 133] },
  head: { name: 'Head line', where: 'Across the middle of the palm', dot: [90, 179], at: [78, 199] },
  life: { name: 'Life line', where: 'Curves round the thumb', dot: [128, 212.5], at: [165, 219] },
  fate: { name: 'Fate line', where: 'Runs up the middle of the palm', dot: [112.4, 236], at: [76, 240] },
};

/** Label pill sitting on its line: a dot on the line, a short stem, the name in a pill edged in the line's colour. */
function linePill(x, y, s, line, size) {
  const k = MAIN_WORDS[line];
  const [dx, dy] = P(x, y, s, k.dot);
  const [cx, cy] = P(x, y, s, k.at);
  const w = k.name.length * size * 0.55 + size * 1.4;
  const h = size * 1.7;
  return `<line x1="${dx}" y1="${dy}" x2="${cx}" y2="${cy}" stroke="${C[line]}" stroke-width="4"/>
    <circle cx="${dx}" cy="${dy}" r="${size * 0.26}" fill="${C[line]}" stroke="${C.page}" stroke-width="3"/>
    <rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="12" fill="${C.page}" stroke="${C[line]}" stroke-width="4"/>
    ${T(cx, cy + size * 0.35, k.name, { size, weight: 700, anchor: 'middle' })}`;
}

function mainLinesChart() {
  const d = spec('four-main-palm-lines-chart');
  const all = { focus: MAIN.map((l) => ({ d: BASE_PATHS[l], kind: l })) };
  const note = 'A drawing, not a real palm. Each label sits on its line.';
  // Wide: the big palm with labels on its lines, four single-line cards on the right.
  const s = 4.1;
  const px = 70;
  const py = 160;
  const cards = (x0, y0, cw, ch, gap, ms, nameSize, whereSize, max) =>
    MAIN.map((line, i) =>
      palmCard({ x: x0 + (i % 2) * (cw + gap), y: y0 + Math.floor(i / 2) * (ch + gap), w: cw, h: ch, s: ms, view: mainView(line), name: MAIN_WORDS[line].name, where: MAIN_WORDS[line].where, nameSize, whereSize, nameMax: 20, whereMax: max, nameFill: C[line] }),
    ).join('');
  const wide = frame(d.width, d.height, `${heading(d, false).svg}
  ${palm(px, py, s, all)}
  ${MAIN.map((l) => linePill(px, py, s, l, 40)).join('')}
  ${cards(900, 160, 405, 465, 30, 1.15, 42, 34, 20)}
  ${footer(d.width, d.height, '/hand-lines/', note, false)}`);
  const ts = 5.0;
  const tx = (d.tall.width - 178 * ts) / 2;
  const h = heading(d, true);
  const ty = h.bottom + 70;
  const tall = frame(d.tall.width, d.tall.height, `${h.svg}
  ${palm(tx, ty, ts, all)}
  ${MAIN.map((l) => linePill(tx, ty, ts, l, 46)).join('')}
  ${cards(40, ty + 230 * ts + 60, 485, 520, 30, 1.2, 48, 40, 19)}
  ${footer(d.tall.width, d.tall.height, '/hand-lines/', note, true)}`);
  return { wide, tall };
}

// ---------------------------------------------------------------------------
// 2. Minor palm lines (one small palm per line)

function minorChart() {
  const d = spec('minor-palm-lines-chart');
  const keys = Object.keys(MINOR);
  const note = 'A drawing, not a real palm. Many palms have only some of these lines.';
  const head = heading(d, false, 'Thinner lines that vary from hand to hand. Each is in gold.');
  const cw = 530;
  const ch = 300;
  const gap = 30;
  const x0 = (d.width - 3 * cw - 2 * gap) / 2;
  const wide = frame(d.width, d.height, `${head.svg}
  ${keys.map((k, i) => palmCard({ x: x0 + (i % 3) * (cw + gap), y: head.bottom + 50 + Math.floor(i / 3) * (ch + gap), w: cw, h: ch, s: 1.08, view: minorView(k), name: MINOR[k].name, where: MINOR[k].where, nameSize: 42, whereSize: 34, nameMax: 14, whereMax: 17, nameFill: C.gold, horizontal: true })).join('')}
  ${footer(d.width, d.height, '/hand-lines/', note, false)}`);
  const th = heading(d, true, 'Thinner lines that vary from hand to hand. Each is in gold.');
  const tw = 320;
  const tg = 20;
  const tch = 700;
  const tall = frame(d.tall.width, d.tall.height, `${th.svg}
  ${keys.map((k, i) => palmCard({ x: 40 + (i % 3) * (tw + tg), y: th.bottom + 50 + Math.floor(i / 3) * (tch + tg), w: tw, h: tch, s: 1.5, view: minorView(k), name: MINOR[k].name, where: MINOR[k].where, nameSize: 42, whereSize: 38, nameMax: 11, whereMax: 14, nameFill: C.gold })).join('')}
  ${footer(d.tall.width, d.tall.height, '/hand-lines/', note, true)}`);
  return { wide, tall };
}

// ---------------------------------------------------------------------------
// 3. Rare palm lines at a glance

const RARE = [
  { name: 'Simian line', where: 'One crease right across the palm', view: () => variantView('simian'), tag: { text: 'About 1 in 30 people' } },
  { name: 'Sydney line', where: 'Head line runs to the outer edge', view: () => variantView('head-long'), tag: { text: '2 to 9 in 100 palms' } },
  { name: 'Double head line', where: 'Two head lines, one above the other', view: () => variantView('head-double'), tag: { text: 'No count found', style: { fill: C.dim, outline: true } } },
  { name: 'Girdle of Venus', where: 'A curve above the heart line', view: () => minorView('girdle'), tag: { text: 'No count found', style: { fill: C.dim, outline: true } } },
  { name: 'Intuition line', where: 'A curve on the outer palm', view: () => minorView('intuition'), tag: { text: 'No count found', style: { fill: C.dim, outline: true } } },
  { name: 'Ring of Solomon', where: 'A curve round the index finger', view: () => minorView('solomon'), tag: { text: 'No count found', style: { fill: C.dim, outline: true } } },
];

function rareChart() {
  const d = spec('rare-palm-lines-at-a-glance');
  const note = 'Drawings, not real palms. Counts: MedlinePlus and crease studies.';
  const head = heading(d, false, 'Only two of them have ever been counted in real hands.');
  const cw = 530;
  const ch = 670;
  const gap = 30;
  const x0 = (d.width - 3 * cw - 2 * gap) / 2;
  const wide = frame(d.width, d.height, `${head.svg}
  ${RARE.map((r, i) => palmCard({ x: x0 + (i % 3) * (cw + gap), y: head.bottom + 50 + Math.floor(i / 3) * (ch + gap), w: cw, h: ch, s: 1.62, view: r.view(), name: r.name, where: r.where, tag: r.tag, nameSize: 46, whereSize: 36, nameMax: 22, whereMax: 26 })).join('')}
  ${footer(d.width, d.height, '/blog/rarest-palm-lines/', note, false)}`);
  const th = heading(d, true, 'Only two of them have ever been counted in real hands.');
  const tw = 485;
  const tch = 680;
  const tall = frame(d.tall.width, d.tall.height, `${th.svg}
  ${RARE.map((r, i) => palmCard({ x: 40 + (i % 2) * (tw + 30), y: th.bottom + 50 + Math.floor(i / 2) * (tch + 26), w: tw, h: tch, s: 1.52, view: r.view(), name: r.name, where: r.where, tag: r.tag, nameSize: 48, whereSize: 40, nameMax: 18, whereMax: 21 })).join('')}
  ${footer(d.tall.width, d.tall.height, '/blog/rarest-palm-lines/', note, true)}`);
  return { wide, tall };
}

// ---------------------------------------------------------------------------
// 4. How rare? Only two have real numbers

function dots(x, y, cols, rows, gap, r, lit, half = 0) {
  let out = '';
  for (let i = 0; i < cols * rows; i++) {
    const cx = x + (i % cols) * gap;
    const cy = y + Math.floor(i / cols) * gap;
    if (i < lit) out += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.gold}"/>`;
    else if (i < lit + half) out += `<circle cx="${cx}" cy="${cy}" r="${r - 1.5}" fill="${C.gold}" fill-opacity="0.25" stroke="${C.gold}" stroke-width="3"/>`;
    else out += `<circle cx="${cx}" cy="${cy}" r="${r * 0.62}" fill="${C.dim}" fill-opacity="0.45"/>`;
  }
  return out;
}

const NO_COUNT = ['Double head line', 'No head line', 'Girdle of Venus', 'Intuition line', 'Ring of Solomon', 'Mystic cross', 'Letter M'];

function howRareChart() {
  const d = spec('how-rare-palm-lines-numbers');
  const note = 'Sources: MedlinePlus; crease studies from Ethiopia and Sydney.';
  const warn = 'A “1 in 1,000” claim with no source is a guess.';
  const head = heading(d, false);
  const top = head.bottom + 50;
  const cw = 530;
  const ch = 790;
  const gap = 30;
  const x0 = (d.width - 3 * cw - 2 * gap) / 2;
  const col = (i) => x0 + i * (cw + gap);
  const noCount = (x, y, w, size, rowH) =>
    NO_COUNT.map((name, i) => `<rect x="${x}" y="${y + i * rowH}" width="${w}" height="${rowH - 14}" rx="10" fill="${C.raised}" stroke="${C.border}" stroke-width="2"/>
      ${T(x + w / 2, y + i * rowH + (rowH - 14) / 2 + size * 0.36, name, { size, weight: 700, anchor: 'middle', fill: C.text })}`).join('');
  const wide = frame(d.width, d.height, `${head.svg}
  ${card(col(0), top, cw, ch, { tint: C.gold, tintOpacity: 0.06 })}
  ${T(col(0) + cw / 2, top + 78, 'Simian line', { size: 46, weight: 700, anchor: 'middle' })}
  ${T(col(0) + cw / 2, top + 210, '1 in 30', { size: 120, weight: 700, serif: true, anchor: 'middle', fill: C.gold })}
  ${T(col(0) + cw / 2, top + 268, 'people', { size: 40, anchor: 'middle', fill: C.muted })}
  ${dots(col(0) + 105, top + 360, 6, 5, 64, 17, 1)}
  ${T(col(0) + cw / 2, top + ch - 42, 'MedlinePlus', { size: 34, anchor: 'middle', fill: C.dim })}
  ${card(col(1), top, cw, ch, { tint: C.gold, tintOpacity: 0.06 })}
  ${T(col(1) + cw / 2, top + 78, 'Sydney line', { size: 46, weight: 700, anchor: 'middle' })}
  ${T(col(1) + cw / 2, top + 210, '2 to 9', { size: 120, weight: 700, serif: true, anchor: 'middle', fill: C.gold })}
  ${T(col(1) + cw / 2, top + 268, 'in 100 palms, by study', { size: 40, anchor: 'middle', fill: C.muted })}
  ${dots(col(1) + 112, top + 330, 10, 10, 34.5, 10, 2, 7)}
  ${T(col(1) + cw / 2, top + ch - 42, 'Three studies', { size: 34, anchor: 'middle', fill: C.dim })}
  ${card(col(2), top, cw, ch)}
  ${T(col(2) + cw / 2, top + 78, 'No reliable count', { size: 46, weight: 700, anchor: 'middle' })}
  ${T(col(2) + cw / 2, top + 132, 'Books describe them. Nobody counted.', { size: 30, anchor: 'middle', fill: C.muted })}
  ${noCount(col(2) + 50, top + 175, cw - 100, 36, 84)}
  ${T(d.width / 2, top + ch + 82, warn, { size: 44, weight: 700, anchor: 'middle', fill: C.gold })}
  ${footer(d.width, d.height, '/blog/rarest-palm-lines/', note, false)}`);

  const th = heading(d, true);
  const W = d.tall.width;
  let y = th.bottom + 50;
  const panel = (title, big, unit, src, grid) => {
    const out = `${card(40, y, W - 80, 540, { tint: C.gold, tintOpacity: 0.06 })}
    ${T(90, y + 92, title, { size: 52, weight: 700 })}
    ${T(90, y + 250, big, { size: 128, weight: 700, serif: true, fill: C.gold })}
    ${T(90, y + 330, unit, { size: 42, fill: C.muted, max: 18 })}
    ${T(90, y + 490, src, { size: 38, fill: C.dim })}
    ${grid}`;
    y += 570;
    return out;
  };
  const p1 = panel('Simian line', '1 in 30', 'people', 'MedlinePlus', dots(620, y + 110, 6, 5, 70, 19, 1));
  const p2 = panel('Sydney line', '2 to 9', 'in 100 palms, by study', 'Three studies', dots(612, y + 92, 10, 10, 40, 11.5, 2, 7));
  const listTop = y;
  const p3 = `${card(40, listTop, W - 80, 760)}
    ${T(90, listTop + 92, 'No reliable count', { size: 52, weight: 700 })}
    ${T(90, listTop + 150, 'Books describe them. Nobody counted.', { size: 40, fill: C.muted })}
    ${NO_COUNT.map((name, i) => {
      const cx = 90 + (i % 2) * 460;
      const cy = listTop + 200 + Math.floor(i / 2) * 140;
      return `<rect x="${cx}" y="${cy}" width="430" height="110" rx="10" fill="${C.raised}" stroke="${C.border}" stroke-width="2"/>${T(cx + 215, cy + 70, name, { size: 42, weight: 700, anchor: 'middle' })}`;
    }).join('')}`;
  const tall = frame(W, d.tall.height, `${th.svg}${p1}${p2}${p3}
  ${T(56, listTop + 850, warn, { size: 48, weight: 700, fill: C.gold, max: 34 })}
  ${footer(W, d.tall.height, '/blog/rarest-palm-lines/', note, true)}`);
  return { wide, tall };
}

// ---------------------------------------------------------------------------
// 5. When palm lines form (timeline, a growing drawn hand)

const STAGES = [
  { when: 'Weeks 8 to 13', sub: 'in the womb', what: 'The palm creases form', s: 0.72 },
  { when: 'Birth', sub: '', what: 'Heart, head and life lines already in place', s: 0.95 },
  { when: 'Childhood', sub: '', what: 'The same lines, in the same places', s: 1.18 },
  { when: 'Adult', sub: '', what: 'Major lines stay. Fine lines can come and go.', s: 1.42, fine: true },
];
const FINE = ['M70 205 C 76 200, 84 199, 92 201', 'M140 196 C 146 202, 150 210, 151 218', 'M98 222 C 104 218, 110 218, 116 221', 'M62 176 C 66 172, 72 170, 78 171', 'M120 176 C 124 182, 126 188, 126 196'];
const THREE = ['heart', 'head', 'life'];
const stageView = (st) => ({ focus: THREE.map((l) => ({ d: BASE_PATHS[l], kind: l })), fine: st.fine ? FINE : [] });

function timelineChart() {
  const d = spec('palm-lines-form-timeline');
  const note = 'Drawings, not real palms. Timing: Stevens and colleagues, 1988.';
  const head = heading(d, false, 'The heart, head and life lines stay where they formed.');
  const colW = 410;
  const x0 = (d.width - 4 * colW) / 2;
  const base = head.bottom + 470; // palms stand on this line
  const axis = base + 60;
  const wide = frame(d.width, d.height, `${head.svg}
  <line x1="${x0 + 40}" y1="${axis}" x2="${x0 + 4 * colW - 40}" y2="${axis}" stroke="${C.border}" stroke-width="5" stroke-linecap="round"/>
  ${STAGES.map((st, i) => {
    const cx = x0 + colW * i + colW / 2;
    const pw = 178 * st.s;
    const ph = 230 * st.s;
    return `${palm(cx - pw / 2, base - ph, st.s, stageView(st))}
    <circle cx="${cx}" cy="${axis}" r="20" fill="${C.gold}" stroke="${C.page}" stroke-width="6"/>
    ${T(cx, axis + 92, st.when, { size: 46, weight: 700, anchor: 'middle', fill: C.gold })}
    ${st.sub ? T(cx, axis + 140, st.sub, { size: 36, anchor: 'middle', fill: C.muted }) : ''}
    ${T(cx, axis + (st.sub ? 200 : 152), st.what, { size: 38, anchor: 'middle', max: 18 })}`;
  }).join('')}
  ${footer(d.width, d.height, '/blog/do-palm-lines-change/', note, false)}`);

  const th = heading(d, true, 'The heart, head and life lines stay where they formed.');
  const rowH = 430;
  const top = th.bottom + 60;
  const tall = frame(d.tall.width, d.tall.height, `${th.svg}
  <line x1="110" y1="${top + 60}" x2="110" y2="${top + 3 * rowH + 60}" stroke="${C.border}" stroke-width="5" stroke-linecap="round"/>
  ${STAGES.map((st, i) => {
    const y = top + i * rowH;
    const s = st.s * 1.15;
    const pw = 178 * s;
    const ph = 230 * s;
    return `<circle cx="110" cy="${y + 60}" r="20" fill="${C.gold}" stroke="${C.page}" stroke-width="6"/>
    ${T(170, y + 78, st.when, { size: 52, weight: 700, fill: C.gold })}
    ${st.sub ? T(170, y + 134, st.sub, { size: 40, fill: C.muted }) : ''}
    ${T(170, y + (st.sub ? 200 : 146), st.what, { size: 44, max: 17 })}
    ${palm(1040 - pw, y + 20 + (rowH - 40 - ph) / 2, s, stageView(st))}`;
  }).join('')}
  ${footer(d.tall.width, d.tall.height, '/blog/do-palm-lines-change/', note, true)}`);
  return { wide, tall };
}

// ---------------------------------------------------------------------------
// 6. Same palm, different photo (real edits of one real, licensed palm photo)

/**
 * The real palm photo (Pexels 8058729, Hanna Pad, Pexels License; design-v4/photo-credits.json) and its
 * real scanner output. A right hand, thumb on the viewer's right. Crops are fractions of the photo, set
 * from the scan's hand landmarks and outline (the palm runs from about x 0.15 to 0.75, y 0.45 to 0.87).
 */
const HERO = join(ASSETS, 'real-palm.png');
const HERO_W = 1800;
const HERO_H = 2400;
/** The background colour of the photo (its top-left corner), for the tilted tile. */
const HERO_BG = 'rgb(233,230,215)';
const PALM_CROP = { x: 0.1, y: 0.38, w: 0.68, h: 0.52 };
let PHOTOS = null;

async function makePhotos(browser) {
  const left = Math.round(PALM_CROP.x * HERO_W);
  const top = Math.round(PALM_CROP.y * HERO_H);
  const width = Math.round(PALM_CROP.w * HERO_W);
  const height = Math.round(PALM_CROP.h * HERO_H);
  const crop = await sharp(HERO).extract({ left, top, width, height }).resize(800).jpeg({ quality: 90 }).toBuffer();
  const meta = await sharp(crop).metadata();
  const src = `data:image/jpeg;base64,${crop.toString('base64')}`;
  const W = meta.width;
  const H = meta.height;
  const fullW = Math.round(W / PALM_CROP.w);
  const fullH = Math.round((fullW * HERO_H) / HERO_W);
  const full = `data:image/jpeg;base64,${(await sharp(HERO).resize(fullW).jpeg({ quality: 90 }).toBuffer()).toString('base64')}`;
  const pageFor = (style, overlay = '', wrapStyle = '') => `<!doctype html><html><body style="margin:0;background:${C.panel}">
    <div style="position:relative;width:${W}px;height:${H}px;overflow:hidden;background:${C.panel};${wrapStyle}">
      <img src="${src}" style="display:block;width:${W}px;height:${H}px;${style}">${overlay}
    </div></body></html>`;
  const shots = {
    daylight: pageFor(''),
    side: pageFor(
      'filter: contrast(1.35) brightness(0.98);',
      `<div style="position:absolute;inset:0;background:linear-gradient(100deg, rgba(255,236,200,0.2) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0.7) 58%, rgba(0,0,0,0.94) 100%);mix-blend-mode:multiply"></div>`,
    ),
    // The tilt uses the whole photo, placed so the palm crop fills the frame, so no cut edge of the crop
    // (the thumb runs past it on the right) turns into view.
    angle: `<!doctype html><html><body style="margin:0;background:${HERO_BG}">
    <div style="position:relative;width:${W}px;height:${H}px;overflow:hidden;background:${HERO_BG};perspective:700px">
      <img src="${full}" style="position:absolute;left:${-PALM_CROP.x * fullW}px;top:${-PALM_CROP.y * fullH}px;width:${fullW}px;height:${fullH}px;transform:rotateY(38deg) rotateX(12deg) scale(1.3);transform-origin:${(PALM_CROP.x + PALM_CROP.w / 2) * 100}% ${(PALM_CROP.y + PALM_CROP.h / 2) * 100}%">
    </div></body></html>`,
    dim: pageFor('filter: brightness(0.42) blur(5px) contrast(0.9);'),
  };
  PHOTOS = { W, H };
  for (const [key, html] of Object.entries(shots)) {
    const tab = await browser.newPage({ viewport: { width: W, height: H } });
    await tab.setContent(html, { waitUntil: 'load' });
    const png = await tab.screenshot({ type: 'jpeg', quality: 90, clip: { x: 0, y: 0, width: W, height: H } });
    await tab.close();
    PHOTOS[key] = `data:image/jpeg;base64,${png.toString('base64')}`;
  }
}

/** The licence line of an image with the photo in it: our drawing is CC BY 4.0, the photo keeps its own licence. */
const PHOTO_LICENCE = 'drawing CC BY 4.0, photo Pexels License';

const PHOTO_TILES = [
  { key: 'daylight', name: 'Even daylight', what: 'Lines show as they are', good: true },
  { key: 'side', name: 'Side light', what: 'Shadows look like breaks' },
  { key: 'angle', name: 'At an angle', what: 'Lines look squeezed' },
  { key: 'dim', name: 'Dim and blurry', what: 'Fine lines fade, close lines merge' },
];

function photoTile(t, x, y, w, ph, nameSize, whatSize, max) {
  const h = ph + 40 + nameSize + 16 + Math.max(...PHOTO_TILES.map((x) => nLines(x.what, max))) * whatSize * 1.22 + 30;
  const clip = `clip-${t.key}-${x}-${y}`;
  return {
    h,
    svg: `${card(x, y, w, h)}
    <clipPath id="${clip}"><rect x="${x + 16}" y="${y + 16}" width="${w - 32}" height="${ph}" rx="8"/></clipPath>
    <image href="${PHOTOS[t.key]}" x="${x + 16}" y="${y + 16}" width="${w - 32}" height="${ph}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clip})"/>
    <rect x="${x + 16}" y="${y + 16}" width="${w - 32}" height="${ph}" rx="8" fill="none" stroke="${t.good ? C.yes : C.border}" stroke-width="${t.good ? 5 : 2}"/>
    ${T(x + w / 2, y + ph + 40 + nameSize, t.name, { size: nameSize, weight: 700, anchor: 'middle', fill: t.good ? C.yes : C.gold })}
    ${T(x + w / 2, y + ph + 40 + nameSize + 16 + whatSize, t.what, { size: whatSize, anchor: 'middle', max })}`,
  };
}

function photoChart() {
  const d = spec('same-palm-different-photo');
  const note = 'One real palm photo (Hanna Pad, Pexels), edited four ways. The palm did not change.';
  const head = heading(d, false, 'Compare photos taken in the same even daylight, from straight above.');
  const tw = 395;
  const gap = 26;
  const x0 = (d.width - 4 * tw - 3 * gap) / 2;
  const wide = frame(d.width, d.height, `${head.svg}
  ${PHOTO_TILES.map((t, i) => photoTile(t, x0 + i * (tw + gap), head.bottom + 50, tw, 470, 42, 34, 19).svg).join('')}
  ${footer(d.width, d.height, '/blog/do-palm-lines-change/', note, false, PHOTO_LICENCE)}`);
  const th = heading(d, true, 'Compare photos taken in the same even daylight, from straight above.');
  const ttw = 485;
  const rowH = 820;
  const tall = frame(d.tall.width, d.tall.height, `${th.svg}
  ${PHOTO_TILES.map((t, i) => photoTile(t, 40 + (i % 2) * (ttw + 30), th.bottom + 50 + Math.floor(i / 2) * rowH, ttw, 540, 48, 40, 17).svg).join('')}
  ${footer(d.tall.width, d.tall.height, '/blog/do-palm-lines-change/', note, true, PHOTO_LICENCE)}`);
  return { wide, tall };
}

// ---------------------------------------------------------------------------
// 7. What stays, what can change

const STAYS = ['Heart, head and life lines', 'Where each line runs', 'Fingerprint ridges'];
const CHANGES = ['How deep or clear a line looks', 'Fine lines and small creases', 'Bath wrinkles, for a while'];

const tick = (cx, cy, r, c = C.yes) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" fill-opacity="0.18" stroke="${c}" stroke-width="3"/><path d="M${cx - r * 0.45} ${cy + r * 0.02} L${cx - r * 0.1} ${cy + r * 0.36} L${cx + r * 0.48} ${cy - r * 0.34}" fill="none" stroke="${c}" stroke-width="${r * 0.22}" stroke-linecap="round" stroke-linejoin="round"/>`;
const cross = (cx, cy, r, c = C.no) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" fill-opacity="0.16" stroke="${c}" stroke-width="3"/><path d="M${cx - r * 0.36} ${cy - r * 0.36} L${cx + r * 0.36} ${cy + r * 0.36} M${cx + r * 0.36} ${cy - r * 0.36} L${cx - r * 0.36} ${cy + r * 0.36}" stroke="${c}" stroke-width="${r * 0.22}" stroke-linecap="round"/>`;
const wave = (cx, cy, r, c = C.gold) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" fill-opacity="0.18" stroke="${c}" stroke-width="3"/><path d="M${cx - r * 0.5} ${cy + r * 0.05} C ${cx - r * 0.3} ${cy - r * 0.35}, ${cx - r * 0.05} ${cy - r * 0.35}, ${cx} ${cy} S ${cx + r * 0.3} ${cy + r * 0.35}, ${cx + r * 0.5} ${cy - r * 0.05}" fill="none" stroke="${c}" stroke-width="${r * 0.2}" stroke-linecap="round"/>`;
const bullet = (cx, cy, r, c = C.muted) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" fill-opacity="0.12" stroke="${c}" stroke-width="3"/><circle cx="${cx}" cy="${cy}" r="${r * 0.32}" fill="${c}"/>`;
const half = (cx, cy, r, c = C.gold) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" fill-opacity="0.12" stroke="${c}" stroke-width="3"/><path d="M${cx} ${cy - r * 0.62} A ${r * 0.62} ${r * 0.62} 0 0 0 ${cx} ${cy + r * 0.62} Z" fill="${c}"/><circle cx="${cx}" cy="${cy}" r="${r * 0.62}" fill="none" stroke="${c}" stroke-width="${r * 0.12}"/>`;
const unknown = (cx, cy, r, c = C.dim) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" fill-opacity="0.14" stroke="${c}" stroke-width="3"/>${T(cx, cy + r * 0.42, '?', { size: r * 1.2, weight: 700, anchor: 'middle', fill: '#D9D3F2' })}`;

function staysChart() {
  const d = spec('palm-lines-what-changes');
  const note = 'Drawing by PalmSays.';
  const head = heading(d, false);
  const top = head.bottom + 50;
  const cw = 800;
  const ch = 560;
  const x0 = (d.width - 2 * cw - 40) / 2;
  const side = (x, y, w, h, iconName, title, items, sym, tint, size, titleSize, iconSize, rowH, max) => `${card(x, y, w, h, { tint, tintOpacity: 0.08 })}
    ${icon(iconName, x + 30, y + 20, iconSize)}
    ${T(x + 40 + iconSize, y + 20 + iconSize / 2 + titleSize * 0.35, title, { size: titleSize, weight: 700, fill: tint })}
    ${items.map((it, i) => `${sym(x + 80, y + iconSize + 70 + i * rowH, size * 0.72)}${T(x + 140, y + iconSize + 70 + i * rowH + size * 0.35, it, { size, max })}`).join('')}`;
  const wide = frame(d.width, d.height, `${head.svg}
  ${side(x0, top, cw, ch, 'shield', 'Stays for life', STAYS, tick, C.yes, 44, 56, 170, 112, 32)}
  ${side(x0 + cw + 40, top, cw, ch, 'repeat', 'Can change', CHANGES, wave, C.gold, 44, 56, 170, 112, 32)}
  ${footer(d.width, d.height, '/blog/do-palm-lines-change/', note, false)}`);
  const th = heading(d, true);
  const ttop = th.bottom + 50;
  const tall = frame(d.tall.width, d.tall.height, `${th.svg}
  ${side(40, ttop, 1000, 580, 'shield', 'Stays for life', STAYS, tick, C.yes, 50, 62, 180, 130, 30)}
  ${side(40, ttop + 620, 1000, 580, 'repeat', 'Can change', CHANGES, wave, C.gold, 50, 62, 180, 130, 30)}
  ${footer(d.tall.width, d.tall.height, '/blog/do-palm-lines-change/', note, true)}`);
  return { wide, tall };
}

// ---------------------------------------------------------------------------
// 8. Five checks before you trust a palm app / 11. How to check any palm reading

const APP_CHECKS = [
  { icon: 'scanner', text: 'Shows your real lines on your photo' },
  { icon: 'book', text: 'Names its sources' },
  { icon: 'shield', text: 'No health or lifespan claims' },
  { icon: 'tag', text: 'Prices on the store listing' },
  { icon: 'trash', text: 'Lets you delete your data' },
];
const READING_STEPS = [
  { icon: 'scanner', text: 'Ask it to show the line on your photo' },
  { icon: 'magnifier', text: 'Ask about a line you don’t have' },
  { icon: 'repeat', text: 'Ask the same question twice' },
  { icon: 'book', text: 'Ask which book says that' },
  { icon: 'shield', text: 'Drop any health or lifespan answer' },
];

/** Five cards: icon, mark (a tick box or a step number) and a few words. `flow` adds arrows between them. */
function fiveCards(d, items, { page, note, sub, flow }) {
  const mark = (i, cx, cy, r) =>
    flow
      ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.gold}"/>${T(cx, cy + r * 0.42, String(i + 1), { size: r * 1.2, weight: 700, anchor: 'middle', fill: C.onGold })}`
      : tick(cx, cy, r);
  const head = heading(d, false, sub);
  const top = head.bottom + 50;
  const cw = 310;
  const gap = flow ? 37 : 30;
  const x0 = (d.width - 5 * cw - 4 * gap) / 2;
  const ch = 500;
  const wide = frame(d.width, d.height, `${head.svg}
  ${items.map((it, i) => {
    const x = x0 + i * (cw + gap);
    return `${card(x, top, cw, ch)}
    ${icon(it.icon, x + (cw - 160) / 2, top + 64, 160)}
    ${mark(i, x + 44, top + 44, 26)}
    ${T(x + cw / 2, top + 290, it.text, { size: 40, weight: 700, anchor: 'middle', max: 13, lh: 1.15 })}
    ${flow && i < 4 ? `<path d="M${x + cw + 6} ${top + ch / 2} l ${gap - 12} 0 m -12 -12 l 12 12 l -12 12" fill="none" stroke="${C.gold}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` : ''}`;
  }).join('')}
  ${footer(d.width, d.height, page, note, false)}`);
  const th = heading(d, true, sub);
  const ttop = th.bottom + 50;
  const rowH = 250;
  const tall = frame(d.tall.width, d.tall.height, `${th.svg}
  ${items.map((it, i) => {
    const y = ttop + i * (rowH + 26);
    return `${card(40, y, 1000, rowH)}
    ${icon(it.icon, 60, y + 25, 200)}
    ${flow ? mark(i, 82, y + 48, 30) : mark(i, 980, y + rowH / 2, 34)}
    ${T(290, y + rowH / 2 + 50 * 0.35 - (nLines(it.text, 22) - 1) * 50 * 0.58, it.text, { size: 50, weight: 700, max: 22, lh: 1.16 })}
    ${flow && i < 4 ? `<path d="M540 ${y + rowH + 3} l 0 20 m -10 -10 l 10 10 l 10 -10" fill="none" stroke="${C.gold}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` : ''}`;
  }).join('')}
  ${footer(d.tall.width, d.tall.height, page, note, true)}`);
  return { wide, tall };
}

const appChecks = () =>
  fiveCards(spec('palm-app-five-checks'), APP_CHECKS, { page: '/blog/best-palm-reading-apps/', note: 'Drawing by PalmSays.', sub: 'Run them in the first five minutes, before any trial ends.', flow: false });
const readingSteps = () =>
  fiveCards(spec('check-any-palm-reading-steps'), READING_STEPS, { page: '/blog/palm-reading-chatgpt-vs-palm-scanner/', note: 'Drawing by PalmSays.', sub: 'The same test works on a chatbot, an app or a person.', flow: true });

// ---------------------------------------------------------------------------
// 9. Comparison matrix (only facts from the post's own table)

// y = yes, n = no, p = only on one store, u = not clear from the listing. Columns as COLS.
const COLS = [
  { icon: 'scanner', label: 'Shows your lines' },
  { icon: 'book', label: 'Names sources' },
  { icon: 'shield', label: 'No health claims' },
  { icon: 'tag', label: 'Prices shown' },
  { icon: 'trash', label: 'Delete your data' },
];
const APPS = [
  { name: 'Astroline', marks: 'unnpp' },
  { name: 'Life Palmistry', marks: 'unnnn' },
  { name: 'Nebula', marks: 'unyyp' },
  { name: 'Palm Reading & Fortune Teller', marks: 'nnnpn' },
  { name: 'Palmist', marks: 'unyyu' },
  { name: 'PalmistryHD', marks: 'unnpn' },
  { name: 'PalmSays (our app)', marks: 'yyyyy', ours: true },
];
const SYM = { y: tick, n: cross, p: half, u: unknown };
const KEY = [
  ['y', 'Yes'],
  ['p', 'Only on one store'],
  ['u', 'Not clear from the listing'],
  ['n', 'No'],
];

function matrixChart() {
  const d = spec('palm-apps-comparison-matrix');
  const note = 'From each store listing, 1 October 2026. Listings change.';
  const sub = 'Six popular apps, from their store listings. PalmSays is our app.';
  // Wide: name | 5 symbols per row. Tall (stacked): the name on its own line, the 5 symbols under it.
  const draw = (W, { x, top, nameW, colW, rowH, iconSize, labelSize, labelMax, nameSize, nameMax, symR, keySize, tall }) => {
    const labelLines = Math.max(...COLS.map((c) => nLines(c.label, labelMax)));
    const headH = iconSize + 20 + labelLines * labelSize * 1.15 + 20;
    const tableH = headH + APPS.length * rowH + 30;
    let out = card(x - 20, top, W - 2 * (x - 20), tableH);
    COLS.forEach((c, i) => {
      const cx = x + nameW + colW * i + colW / 2;
      out += icon(c.icon, cx - iconSize / 2, top + 16, iconSize);
      out += T(cx, top + iconSize + 20 + labelSize, c.label, { size: labelSize, weight: 700, anchor: 'middle', max: labelMax, lh: 1.15 });
    });
    APPS.forEach((a, r) => {
      const y = top + headH + r * rowH;
      if (a.ours) out += `<rect x="${x - 6}" y="${y + 6}" width="${W - 2 * (x - 6)}" height="${rowH - 12}" rx="10" fill="${C.gold}" fill-opacity="0.1" stroke="${C.gold}" stroke-width="2.5"/>`;
      else if (r % 2 === 0) out += `<rect x="${x - 6}" y="${y + 6}" width="${W - 2 * (x - 6)}" height="${rowH - 12}" rx="10" fill="${C.raised}"/>`;
      const fill = a.ours ? C.gold : C.text;
      if (tall) {
        out += T(x + 14, y + 16 + nameSize, a.name, { size: nameSize, weight: 700, fill });
        [...a.marks].forEach((m, i) => {
          out += SYM[m](x + nameW + colW * i + colW / 2, y + 16 + nameSize * 1.3 + symR + 8, symR);
        });
        return;
      }
      const nl = nLines(a.name, nameMax);
      out += T(x + 14, y + rowH / 2 + nameSize * 0.36 - (nl - 1) * nameSize * 0.56, a.name, { size: nameSize, weight: 700, max: nameMax, lh: 1.12, fill });
      [...a.marks].forEach((m, i) => {
        out += SYM[m](x + nameW + colW * i + colW / 2, y + rowH / 2, symR);
      });
    });
    // Key: symbols with words, under the table.
    const ky = top + tableH + (tall ? 70 : 64);
    // Flow layout: items left to right, a new row when the next one would not fit.
    let kx = x;
    let kyy = ky;
    KEY.forEach(([m, words]) => {
      const itemW = keySize * 1.7 + words.length * keySize * 0.46 + keySize * 1.4;
      if (kx > x && kx + itemW > W - x) {
        kx = x;
        kyy += keySize * 2.1;
      }
      out += SYM[m](kx + keySize * 0.7, kyy - keySize * 0.32, keySize * 0.7);
      out += T(kx + keySize * 1.7, kyy, words, { size: keySize, fill: C.muted });
      kx += itemW;
    });
    return out;
  };
  const head = heading(d, false, sub);
  const wide = frame(d.width, d.height, `${head.svg}
  ${draw(d.width, { x: 90, top: head.bottom + 50, nameW: 470, colW: 238, rowH: 104, iconSize: 112, labelSize: 34, labelMax: 11, nameSize: 38, nameMax: 22, symR: 30, keySize: 34, tall: false })}
  ${footer(d.width, d.height, '/blog/best-palm-reading-apps/', note, false)}`);
  const th = heading(d, true, sub);
  const tall = frame(d.tall.width, d.tall.height, `${th.svg}
  ${draw(d.tall.width, { x: 40, top: th.bottom + 50, nameW: 0, colW: 200, rowH: 166, iconSize: 112, labelSize: 38, labelMax: 10, nameSize: 44, nameMax: 40, symR: 36, keySize: 40, tall: true })}
  ${footer(d.tall.width, d.tall.height, '/blog/best-palm-reading-apps/', note, true)}`);
  return { wide, tall };
}

// ---------------------------------------------------------------------------
// 10. Chatbot vs palm scanner (the scanner's real lines on the real photo)

const SCAN = JSON.parse(readFileSync(join(ASSETS, 'real-palm.scan.json'), 'utf8'));
/** The palm and the thumb (on the viewer's right), from the scan's outline; the fingertips are cut. */
const FLOW_CROP = { x: 0.08, y: 0.36, w: 0.82, h: 0.58 };
let FLOW_PHOTO = null;
async function makeFlowPhoto() {
  const crop = await sharp(HERO)
    .extract({ left: Math.round(FLOW_CROP.x * HERO_W), top: Math.round(FLOW_CROP.y * HERO_H), width: Math.round(FLOW_CROP.w * HERO_W), height: Math.round(FLOW_CROP.h * HERO_H) })
    .resize(760)
    .jpeg({ quality: 88 })
    .toBuffer();
  FLOW_PHOTO = `data:image/jpeg;base64,${crop.toString('base64')}`;
}
const FLOW_AR = (FLOW_CROP.h * HERO_H) / (FLOW_CROP.w * HERO_W);

/** The photo at (x, y, w); with `lines`, the scanner's own polylines for this photo on top. */
function flowPhoto(x, y, w, lines, id) {
  const h = w * FLOW_AR;
  const map = ([u, v]) => [x + ((u - FLOW_CROP.x) / FLOW_CROP.w) * w, y + ((v - FLOW_CROP.y) / FLOW_CROP.h) * h];
  const traced = lines
    ? MAIN.filter((l) => SCAN.lines[l]?.present)
        .map((l) => {
          const pts = SCAN.lines[l].polyline.map(map).map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(' ');
          return `<polyline points="${pts}" fill="none" stroke="${C[l]}" stroke-width="${w / 52}" stroke-linecap="round" stroke-linejoin="round"/>`;
        })
        .join('')
    : '';
  return {
    h,
    svg: `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/></clipPath>
    <g clip-path="url(#${id})"><image href="${FLOW_PHOTO}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>${traced}</g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="none" stroke="${C.border}" stroke-width="2"/>`,
  };
}

/** The chatbot's answer: a speech bubble of text bars (no lines on the photo). */
function bubble(x, y, w, h) {
  const bars = [0.92, 0.8, 0.88, 0.62, 0.85, 0.5];
  return `<g><path d="M${x + 30} ${y} h ${w - 60} a 30 30 0 0 1 30 30 v ${h - 90} a 30 30 0 0 1 -30 30 h ${-(w - 140)} l -50 40 l 6 -40 h -16 a 30 30 0 0 1 -30 -30 v ${-(h - 90)} a 30 30 0 0 1 30 -30 z" fill="${C.raised}" stroke="${C.border}" stroke-width="3"/></g>
    ${bars.map((b, i) => `<rect x="${x + 40}" y="${y + 40 + i * ((h - 120) / bars.length)}" width="${(w - 80) * b}" height="${Math.min(22, (h - 120) / bars.length - 14)}" rx="11" fill="${C.muted}" fill-opacity="${i === 3 ? 0.9 : 0.38}"/>`).join('')}
    ${T(x + 40 + (w - 80) * 0.62 + 20, y + 40 + 3 * ((h - 120) / bars.length) + 18, '?', { size: 44, weight: 700, fill: C.no })}`;
}

const ARROW_R = (x, y, len) => `<path d="M${x} ${y} l ${len} 0 m -16 -16 l 16 16 l -16 16" fill="none" stroke="${C.gold}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
const ARROW_D = (x, y, len) => `<path d="M${x} ${y} l 0 ${len} m -16 -16 l 16 16 l 16 -16" fill="none" stroke="${C.gold}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;

function flowChart() {
  const d = spec('chatbot-vs-palm-scanner-flow');
  const note = 'Real palm photo: Hanna Pad, Pexels. Coloured lines: the real PalmSays scanner’s output for it.';
  const head = heading(d, false, 'Same palm photo in. Very different answers out.');
  const top = head.bottom + 46;
  const laneH = 450;
  const lane = (y, kind) => {
    const chat = kind === 'chat';
    const pw = 250;
    const ph = pw * FLOW_AR;
    const p = flowPhoto(130, y + (laneH - ph) / 2, pw, false, `in-${kind}`);
    const resultX = 960;
    const result = chat ? bubble(resultX, y + 70, 290, 250) : flowPhoto(resultX + 20, y + (laneH - ph) / 2, pw, true, `out-${kind}`).svg;
    const say = chat ? ['Describes it in words', 'May describe lines that aren’t there'] : ['Traces each line on your photo', 'Marks a line it can’t see clearly'];
    return `${card(80, y, d.width - 160, laneH, { tint: chat ? C.no : C.yes, tintOpacity: 0.05 })}
    ${p.svg}
    ${ARROW_R(410, y + laneH / 2, 110)}
    ${icon(chat ? 'chat' : 'scanner', 560, y + 70, 220)}
    ${T(670, y + 345, chat ? 'Chatbot' : 'Palm scanner', { size: 46, weight: 700, anchor: 'middle', fill: C.gold })}
    ${ARROW_R(800, y + laneH / 2, 130)}
    ${result}
    ${chat ? bullet(1320, y + 150, 30) : tick(1320, y + 150, 30)}
    ${T(1372, y + 164, say[0], { size: 40, weight: 700, max: 15, lh: 1.12 })}
    ${chat ? cross(1320, y + 300, 30) : tick(1320, y + 300, 30)}
    ${T(1372, y + 314, say[1], { size: 38, fill: chat ? '#FFB3B3' : C.muted, max: 16 })}`;
  };
  const wide = frame(d.width, d.height, `${head.svg}${lane(top, 'chat')}${lane(top + 490, 'scan')}
  ${footer(d.width, d.height, '/blog/palm-reading-chatgpt-vs-palm-scanner/', note, false, PHOTO_LICENCE)}`);

  const th = heading(d, true, 'Same palm photo in. Very different answers out.');
  const ttop = th.bottom + 46;
  const col = (x, kind) => {
    const chat = kind === 'chat';
    const w = 485;
    let y = ttop;
    let out = card(x, y, w, 1500, { tint: chat ? C.no : C.yes, tintOpacity: 0.05 });
    out += icon(chat ? 'chat' : 'scanner', x + (w - 190) / 2, y + 24, 190);
    out += T(x + w / 2, y + 270, chat ? 'Chatbot' : 'Palm scanner', { size: 52, weight: 700, anchor: 'middle', fill: C.gold });
    y += 310;
    const pw = 380;
    const ph = pw * FLOW_AR;
    out += flowPhoto(x + (w - pw) / 2, y, pw, false, `tin-${kind}`).svg;
    y += ph + 20;
    out += ARROW_D(x + w / 2, y, 70);
    y += 100;
    out += chat ? bubble(x + (w - 340) / 2, y + 10, 340, 330) : flowPhoto(x + (w - pw) / 2, y, pw, true, `tout-${kind}`).svg;
    y += ph + 40;
    const say = chat ? ['Describes it in words', 'May describe lines that aren’t there'] : ['Traces each line on your photo', 'Marks a line it can’t see clearly'];
    out += T(x + w / 2, y + 44, say[0], { size: 44, weight: 700, anchor: 'middle', max: 17, lh: 1.12 });
    out += T(x + w / 2, y + 44 + nLines(say[0], 17) * 50 + 20, say[1], { size: 40, anchor: 'middle', max: 19, fill: chat ? '#FFB3B3' : C.muted });
    return out;
  };
  const tall = frame(d.tall.width, d.tall.height, `${th.svg}${col(40, 'chat')}${col(555, 'scan')}
  ${footer(d.tall.width, d.tall.height, '/blog/palm-reading-chatgpt-vs-palm-scanner/', note, true, PHOTO_LICENCE)}`);
  return { wide, tall };
}

// ---------------------------------------------------------------------------

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Mukta; font-weight: 400; src: url(${font('mukta', 'mukta-latin-400-normal.woff2')}) format('woff2'); }
@font-face { font-family: Mukta; font-weight: 700; src: url(${font('mukta', 'mukta-latin-700-normal.woff2')}) format('woff2'); }
@font-face { font-family: Cormorant; font-weight: 700; src: url(${font('cormorant-garamond', 'cormorant-garamond-latin-700-normal.woff2')}) format('woff2'); }
html, body { margin: 0; background: ${C.page}; }
svg { display: block; }
</style></head><body>__SVG__</body></html>`;

const JOBS = [
  { id: 'four-main-palm-lines-chart', make: mainLinesChart },
  { id: 'minor-palm-lines-chart', make: minorChart },
  { id: 'rare-palm-lines-at-a-glance', make: rareChart },
  { id: 'how-rare-palm-lines-numbers', make: howRareChart },
  { id: 'palm-lines-form-timeline', make: timelineChart },
  { id: 'same-palm-different-photo', make: photoChart, photos: true },
  { id: 'palm-lines-what-changes', make: staysChart },
  { id: 'palm-app-five-checks', make: appChecks },
  { id: 'palm-apps-comparison-matrix', make: matrixChart },
  { id: 'chatbot-vs-palm-scanner-flow', make: flowChart },
  { id: 'check-any-palm-reading-steps', make: readingSteps },
].filter((job) => !only || job.id.includes(only));

mkdirSync(OUT, { recursive: true });
await makeFlowPhoto();
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
try {
  if (JOBS.some((job) => job.photos)) await makePhotos(browser);
  const shoot = async (svg, w, h) => {
    const tab = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await tab.setContent(html.replace('__SVG__', svg), { waitUntil: 'load' });
    await tab.evaluate(() => document.fonts.ready);
    const png = await tab.screenshot({ type: 'png', clip: { x: 0, y: 0, width: w, height: h } });
    await tab.close();
    return png;
  };
  const meta = { IFD0: { Copyright: 'PalmSays, CC BY 4.0', Artist: 'PalmSays' } };
  for (const job of JOBS) {
    const d = spec(job.id);
    const { wide, tall } = job.make();
    const png = await shoot(wide, d.width, d.height);
    await sharp(png).withExif(meta).png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(join(OUT, `${d.id}.png`));
    await sharp(png).withExif(meta).webp({ quality: 86 }).toFile(join(OUT, `${d.id}.webp`));
    await sharp(png).avif({ quality: 60 }).toFile(join(OUT, `${d.id}.avif`));
    const small = await sharp(png).resize(900).toBuffer();
    await sharp(small).webp({ quality: 84 }).toFile(join(OUT, `${d.id}-900.webp`));
    await sharp(small).avif({ quality: 58 }).toFile(join(OUT, `${d.id}-900.avif`));
    const tallPng = await shoot(tall, d.tall.width, d.tall.height);
    await sharp(tallPng).webp({ quality: 84 }).toFile(join(OUT, `${d.id}-tall.webp`));
    await sharp(tallPng).avif({ quality: 58 }).toFile(join(OUT, `${d.id}-tall.avif`));
    console.log(`Wrote ${d.id} (${d.width}×${d.height}, tall ${d.tall.width}×${d.tall.height})`);
  }
} finally {
  await browser.close();
}
