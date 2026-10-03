/**
 * Diagram set part 1 (SEMANTIC_SEO_PLAN.md §7.4, WEB-FEAT-056, WEB-DEC-053): renders labelled
 * palmistry diagrams as real image files for image search, the same way as the palm chart
 * (scripts/make-palm-chart.mjs):
 *
 *   node scripts/make-diagrams.mjs            all diagrams
 *   node scripts/make-diagrams.mjs heart      only ids containing "heart"
 *
 * Writes, for each diagram in src/lib/diagrams.ts (except the palm chart, made by its own script):
 * public/img/diagrams/<id>.{png,webp,avif} (wide, ≥ 1800 px), <id>-900.{webp,avif} and a tall phone
 * layout <id>-tall.{webp,avif}, where the words stay readable on a 360 px screen.
 *
 * Code-drawn only: the site's drawn hand and line shapes (src/lib/guides/palm-geometry.ts, the same
 * hand as PalmChart / PalmTrace / the variation cards), the site's line colours, English labels and
 * the registry's Hindi names (src/lib/entities.ts). Never a photo, never an AI image, never a line
 * drawn on a photo (WEB-DEC-047/048). "PalmSays" credit and the licence (CC BY 4.0, D11) in every
 * image. Rendered with the installed Chrome (playwright-core from research-tools/), encoded with sharp.
 *
 * Natural style (owner 2026-10-02, "natural premium", not an AI filter): solid fills only (page #0B0A1F,
 * panel #15132F, raised #1E1B42) with a crisp border (#2E2A5C) and small corners; no glow, no light pool,
 * no grain, no blur, no drop shadow, no glossy or multi-stop gradient. The palm is one flat fill with a
 * solid gold outline; the line colours are clean solid strokes with no glow underlay. Text is ivory
 * #F6F0E1 (main) and #D4CCE6 (secondary) at real font weights.
 */

import { mkdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

import { DIAGRAMS } from '../src/lib/diagrams.ts';
import { ENTITIES } from '../src/lib/entities.ts';
import { BASE_PATHS, HAND_SHAPES, HAND_SHAPE_ORDER, PALM_OUTLINE, VARIANTS } from '../src/lib/guides/palm-geometry.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(join(root, 'research-tools', 'package.json'));
const { chromium } = require('playwright-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = join(root, 'public', 'img', 'diagrams');
const only = process.argv[2];

const font = (pkg, file) => `data:font/woff2;base64,${readFileSync(join(root, 'node_modules', '@fontsource', pkg, 'files', file)).toString('base64')}`;
const term = (id) => {
  const found = ENTITIES.find((item) => item.id === id);
  if (!found) throw new Error(`make-diagrams: unknown term ${id}`);
  return found;
};
const spec = (id) => {
  const found = DIAGRAMS.find((item) => item.id === id);
  if (!found) throw new Error(`make-diagrams: ${id} is not in src/lib/diagrams.ts`);
  return found;
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Site tokens (global.css), the same as make-palm-chart.mjs.
const C = {
  page: '#0B0A1F',
  panel: '#15132F',
  raised: '#1E1B42',
  border: '#2E2A5C',
  halo: '#0B0A1F',
  skin: '#1E1B42',
  skinStrong: '#262150',
  gold: '#E6B85C',
  goldBright: '#F5D98B',
  onGold: '#1F1300',
  text: '#F6F0E1',
  muted: '#D4CCE6',
  dim: '#8A84B0',
  heart: '#FF4D5E',
  head: '#4C8DFF',
  life: '#2FD06A',
  fate: '#B26BFF',
};
const MAIN = ['heart', 'head', 'life', 'fate'];
const colour = (kind) => (kind === 'minor' ? C.goldBright : C[kind]);

/** Simple word wrap for SVG text: at most `max` characters a line. */
function wrap(text, max) {
  const lines = [];
  for (const part of text.split('\n')) {
    let line = '';
    for (const word of part.split(' ')) {
      if (line && `${line} ${word}`.length > max) {
        lines.push(line);
        line = word;
      } else line = line ? `${line} ${word}` : word;
    }
    lines.push(line);
  }
  return lines;
}
const textLines = (x, y, lines, lh, cls, anchor = 'start') =>
  `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${lines.map((l, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : lh}">${esc(l)}</tspan>`).join('')}</text>`;

const frame = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${C.page}"/>
  ${body}
</svg>`;

/** The credit + licence lines (bottom). */
const credit = (w, h, page, note, tall) =>
  tall
    ? `${textLines(56, h - 118, wrap(note, 52), 40, 'note')}
  <text x="56" y="${h - 36}" class="licence">PalmSays · palmsays.com${page} · CC BY 4.0</text>`
    : `<text x="80" y="${h - 36}" class="note">${esc(note)}</text>
  <text x="${w - 80}" y="${h - 72}" class="credit" text-anchor="end">PalmSays · palmsays.com${page}</text>
  <text x="${w - 80}" y="${h - 36}" class="licence" text-anchor="end">Licence: CC BY 4.0 · credit “PalmSays (palmsays.com)”</text>`;

/**
 * The drawn palm (palm units, viewBox 36 30 178 230) at scale `s`, top-left of the palm box at (x, y).
 * `focus` = coloured lines, `context` = dimmed lines for orientation, `extra` = SVG in palm units on top.
 */
function palm(x, y, s, { focus = [], context = [], extra = '', strong = false } = {}) {
  const w = (n) => n; // stroke widths are in palm units (scaled with the drawing)
  return `<g transform="translate(${x - 36 * s} ${y - 30 * s}) scale(${s})">
    <path d="${PALM_OUTLINE}" fill="${strong ? C.skinStrong : C.skin}" stroke="${C.gold}" stroke-width="${s < 2 ? 0.9 : 0.5}" stroke-linejoin="round"/>
    ${context.map((d) => `<path d="${d}" fill="none" stroke="${C.dim}" stroke-opacity="0.55" stroke-width="${w(s < 2 ? 1.6 : 1.1)}" stroke-linecap="round"/>`).join('')}
    ${focus.map((f) => `<path d="${f.d}" fill="none" stroke="${colour(f.kind)}" stroke-width="${w(s < 2 ? 3 : 1.9)}" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}
    ${extra}
  </g>`;
}

/** A variation from palm-geometry.ts as focus + context lines. */
function variant(name) {
  const v = VARIANTS[name];
  if (!v) throw new Error(`make-diagrams: unknown variant ${name}`);
  const context = MAIN.filter((line) => line !== v.kind)
    .map((line) => (v.context && line in v.context ? v.context[line] : BASE_PATHS[line]))
    .filter(Boolean);
  return { focus: v.paths.map((d) => ({ d, kind: v.kind })), context };
}

// ---------------------------------------------------------------------------
// Line diagrams: where the line starts and ends + six common forms side by side.

const LINE_DIAGRAMS = {
  heart: {
    id: 'heart-line-start-end-and-types',
    page: '/heart-line/',
    start: 'Starts on the little-finger edge of the palm',
    end: 'Ends under the index finger, the middle finger or between them',
    startAt: { cx: 56, cy: 152, rx: 6.5, ry: 6.5 },
    endAt: { cx: 130, cy: 131, rx: 17, ry: 9 },
    forms: [
      ['heart-end-index', 'Curves up to\nthe index finger'],
      ['heart-end-middle', 'Ends under\nthe middle finger'],
      ['heart-straight', 'Straight across\nthe palm'],
      ['heart-short', 'Short'],
      ['heart-fork', 'Forked at\nthe end'],
      ['heart-broken', 'Broken'],
    ],
    note: 'A drawing, not a real palm. Every hand is different.',
  },
  head: {
    id: 'head-line-start-end-and-types',
    page: '/head-line/',
    start: 'Starts between the thumb and index finger, often joined to the life line',
    end: 'Ends anywhere from the middle of the palm to its outer edge',
    startAt: { cx: 160, cy: 159, rx: 7, ry: 7 },
    endAt: { cx: 80, cy: 192, rx: 27, ry: 30 },
    forms: [
      ['head-straight', 'Straight'],
      ['head-sloping', 'Slopes down\ntowards the wrist'],
      ['head-long', 'Long, to the\nouter edge'],
      ['head-short', 'Short'],
      ['head-fork', 'Forked end\n(writer’s fork)'],
      ['head-separate', 'Starts apart from\nthe life line'],
    ],
    note: 'A drawing, not a real palm. Every hand is different.',
  },
  life: {
    id: 'life-line-start-end-and-types',
    page: '/life-line/',
    start: 'Starts between the thumb and index finger',
    end: 'Curves around the ball of the thumb towards the wrist',
    startAt: { cx: 160, cy: 164, rx: 7, ry: 7 },
    endAt: { cx: 132, cy: 243, rx: 15, ry: 10 },
    forms: [
      ['life-wide', 'Wide curve'],
      ['life-close', 'Close to\nthe thumb'],
      ['life-long', 'Long'],
      ['life-short', 'Short (not a\nshort life)'],
      ['life-double', 'Double\n(sister line)'],
      ['life-broken', 'Broken'],
    ],
    note: 'A drawing, not a real palm. A short life line is not a short life.',
  },
  fate: {
    id: 'fate-line-start-end-and-types',
    page: '/fate-line/',
    start: 'Starts near the wrist, from the life line or from the mount of the Moon',
    end: 'Runs up towards the middle finger',
    startAt: { cx: 104, cy: 236, rx: 36, ry: 16 },
    endAt: { cx: 119, cy: 133, rx: 10, ry: 7 },
    forms: [
      ['fate-wrist', 'From the wrist'],
      ['fate-from-life', 'From the\nlife line'],
      ['fate-from-luna', 'From the mount\nof the Moon'],
      ['fate-late', 'Starts in the\nmiddle of the palm'],
      ['fate-broken', 'Broken'],
      ['fate-absent', 'No fate line\n(common)'],
    ],
    note: 'A drawing, not a real palm. Many palms have no fate line.',
  },
};

/** The zone marks on the big palm: 1 = start, 2 = end (palm units). */
function zones(line, cfg) {
  const zone = (z, n) => `<ellipse cx="${z.cx}" cy="${z.cy}" rx="${z.rx}" ry="${z.ry}" fill="${C[line]}" fill-opacity="0.16" stroke="${C.gold}" stroke-width="0.55" stroke-dasharray="1.6 1.2"/>
    <circle cx="${z.cx + z.rx * 0.72}" cy="${z.cy - z.ry - 4}" r="5.2" fill="${C.gold}" stroke="${C.halo}" stroke-width="0.8"/>
    <text x="${z.cx + z.rx * 0.72}" y="${z.cy - z.ry - 4}" dy="2.2" class="badge">${n}</text>`;
  return zone(cfg.startAt, 1) + zone(cfg.endAt, 2);
}

/** A numbered key row: gold badge + wrapped text. */
function keyRow(n, text, x, y, size, max) {
  const lines = wrap(text, max);
  const r = size * 0.62;
  return `<g><circle cx="${x}" cy="${y - size * 0.34}" r="${r}" fill="${C.gold}"/><text x="${x}" y="${y - size * 0.34}" dy="${size * 0.24}" class="num-s" style="font-size:${Math.round(size * 0.66)}px">${n}</text>
    ${textLines(x + r + 20, y, lines, size * 1.25, 'key', 'start').replace('class="key"', `class="key" style="font-size:${size}px"`)}</g>`;
}

/** Every tile has room for a two-line label, so the rows line up. */
const tileHeight = (s, labelSize) => 230 * s + 20 + labelSize * 2.4 + 24;

/** One form tile: small palm + label. */
function tile(name, label, x, y, s, labelSize, tileW) {
  const v = variant(name);
  const lines = label.split('\n');
  const palmW = 178 * s;
  const palmH = 230 * s;
  const px = x + (tileW - palmW) / 2;
  return `<g>
    <rect x="${x}" y="${y}" width="${tileW}" height="${tileHeight(s, labelSize)}" rx="12" fill="${C.panel}" stroke="${C.border}" stroke-width="2"/>
    ${palm(px, y + 12, s, { ...v, strong: true })}
    ${textLines(x + tileW / 2, y + palmH + 18 + labelSize, lines, labelSize * 1.2, 'tile', 'middle').replace('class="tile"', `class="tile" style="font-size:${labelSize}px"`)}
  </g>`;
}

function lineDiagram(line) {
  const cfg = LINE_DIAGRAMS[line];
  const d = spec(cfg.id);
  const big = { focus: [{ d: BASE_PATHS[line], kind: line }], context: MAIN.filter((l) => l !== line).map((l) => BASE_PATHS[l]), extra: zones(line, cfg), strong: true };

  // Wide: big palm left, key + six forms right.
  const W = d.width;
  const H = d.height;
  const tileW = 280;
  const wide = frame(W, H, `<text x="80" y="96" class="title">${esc(d.name)}</text>
  ${palm(40, 150, 4.3, big)}
  <rect x="860" y="146" width="880" height="236" rx="12" fill="${C.panel}" stroke="${C.border}" stroke-width="2"/>
  ${keyRow(1, cfg.start, 910, 222, 32, 44)}
  ${keyRow(2, cfg.end, 910, 222 + wrap(cfg.start, 44).length * 40 + 50, 32, 44)}
  ${cfg.forms.map(([name, label], i) => tile(name, label, 860 + (i % 3) * (tileW + 20), 408 + Math.floor(i / 3) * (tileHeight(1.1, 28) + 14), 1.1, 28, tileW)).join('')}
  ${credit(W, H, cfg.page, cfg.note, false)}`);

  // Tall: title, big palm, key, then the six forms in a 3 × 2 grid.
  const TW = d.tall.width;
  const TH = d.tall.height;
  const tTile = 316;
  const tall = frame(TW, TH, `${textLines(56, 86, wrap(d.name, 34), 64, 'title title-tall')}
  ${palm(170, 190, 4.0, big)}
  ${keyRow(1, cfg.start, 86, 1172, 40, 44)}
  ${keyRow(2, cfg.end, 86, 1172 + wrap(cfg.start, 44).length * 50 + 60, 40, 44)}
  ${cfg.forms.map(([name, label], i) => tile(name, label, 40 + (i % 3) * (tTile + 16), 1410 + Math.floor(i / 3) * (tileHeight(1.3, 34) + 16), 1.3, 34, tTile)).join('')}
  ${credit(TW, TH, cfg.page, cfg.note, true)}`);
  return { wide, tall };
}

// ---------------------------------------------------------------------------
// Mounts chart: the drawn palm with 9 numbered areas + names, Hindi names and where.

const MOUNTS = [
  { id: 'mount-jupiter', where: 'under the index finger', at: { cx: 149, cy: 131, rx: 11, ry: 8 } },
  { id: 'mount-saturn', where: 'under the middle finger', at: { cx: 120, cy: 130, rx: 10, ry: 6.5 } },
  { id: 'mount-sun', where: 'under the ring finger', at: { cx: 91, cy: 133, rx: 10, ry: 7 } },
  { id: 'mount-mercury', where: 'under the little finger', at: { cx: 63, cy: 137, rx: 10, ry: 7.5 } },
  { id: 'mount-mars-inner', label: 'Mount of Mars (thumb side)', hi: 'मंगल पर्वत', where: 'inside the start of the life line, below Jupiter', at: { cx: 153, cy: 177, rx: 7.5, ry: 6.5 } },
  { id: 'mount-venus', where: 'the ball of the thumb, inside the life line', at: { cx: 143, cy: 216, rx: 11, ry: 22 } },
  { id: 'mount-moon', where: 'outer edge, low, above the wrist', at: { cx: 71, cy: 224, rx: 13, ry: 19 } },
  { id: 'mount-mars-outer', label: 'Mount of Mars (outer edge)', hi: 'मंगल पर्वत', where: 'between the heart and head lines', at: { cx: 62, cy: 172, rx: 9, ry: 9 } },
  { id: 'plain-of-mars', where: 'the hollow centre of the palm', at: { cx: 104, cy: 192, rx: 14, ry: 13 } },
];

function mountAreas() {
  return MOUNTS.map((m, i) => {
    const a = m.at;
    return `<ellipse cx="${a.cx}" cy="${a.cy}" rx="${a.rx}" ry="${a.ry}" fill="${C.gold}" fill-opacity="${m.id === 'plain-of-mars' ? 0.1 : 0.2}" stroke="${C.gold}" stroke-width="0.5"${m.id === 'plain-of-mars' ? ' stroke-dasharray="1.6 1.2"' : ''}/>
      <circle cx="${a.cx}" cy="${a.cy}" r="5.2" fill="${C.gold}" stroke="${C.halo}" stroke-width="0.8"/>
      <text x="${a.cx}" y="${a.cy}" dy="2.2" class="badge">${i + 1}</text>`;
  }).join('');
}

function mountRow(i, m, x, y, big) {
  const t = term(m.id);
  const size = big ? 38 : 32;
  const r = size * 0.6;
  return `<g><circle cx="${x}" cy="${y - size * 0.34}" r="${r}" fill="${C.gold}"/><text x="${x}" y="${y - size * 0.34}" dy="${size * 0.24}" class="num-s" style="font-size:${Math.round(size * 0.66)}px">${i + 1}</text>
    <text x="${x + r + 20}" y="${y}" class="key-b" style="font-size:${size}px">${esc(m.label ?? t.name.en)} <tspan class="hi" style="font-size:${size}px">${esc(m.hi ?? t.name.hi)}</tspan></text>
    <text x="${x + r + 20}" y="${y + size * 1.15}" class="key-s" style="font-size:${Math.round(size * 0.82)}px">${esc(m.where)}</text></g>`;
}

function mountsChart() {
  const d = spec('mounts-of-the-palm-chart');
  const faint = { context: MAIN.map((l) => BASE_PATHS[l]), extra: mountAreas(), strong: true };
  const wide = frame(d.width, d.height, `<text x="80" y="96" class="title">${esc(d.name)}</text>
  ${palm(70, 150, 4.8, faint)}
  <rect x="1000" y="150" width="740" height="1030" rx="12" fill="${C.panel}" stroke="${C.border}" stroke-width="2"/>
  ${MOUNTS.map((m, i) => mountRow(i, m, 1052, 232 + i * 106, false)).join('')}
  ${credit(d.width, d.height, '/palm-mounts/', 'A drawing, not a real palm. Mounts are soft areas, not lines.', false)}`);
  const tall = frame(d.tall.width, d.tall.height, `${textLines(56, 86, wrap(d.name, 32), 64, 'title title-tall')}
  ${palm(130, 210, 4.6, faint)}
  ${MOUNTS.map((m, i) => mountRow(i, m, 84, 1330 + i * 118, true)).join('')}
  ${credit(d.tall.width, d.tall.height, '/palm-mounts/', 'A drawing, not a real palm. Mounts are soft areas, not lines.', true)}`);
  return { wide, tall };
}

// ---------------------------------------------------------------------------
// Cheiro's seven hand types, side by side (HAND_SHAPES silhouettes, viewBox 0 0 64 84).

const SHAPE_WORDS = {
  elementary: ['Elementary', 'Short, thick palm,\nshort fingers'],
  square: ['Square', 'Square palm,\nsquare fingertips'],
  spatulate: ['Spatulate', 'Fingertips that\nwiden at the ends'],
  philosophic: ['Philosophic', 'Long hand,\nknotty joints'],
  conic: ['Conic', 'Rounded,\ntapering fingers'],
  psychic: ['Psychic', 'Long, narrow hand,\npointed fingers'],
  mixed: ['Mixed', 'Each finger a\ndifferent shape'],
};

function shape(key, x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="${HAND_SHAPES[key]}" fill="${C.skinStrong}" stroke="${C.gold}" stroke-width="${0.9 / (s / 3)}" stroke-linejoin="round"/></g>`;
}

function shapeCell(key, i, cx, y, s, nameSize, textSize) {
  const [name, words] = SHAPE_WORDS[key];
  const w = 64 * s;
  return `${shape(key, cx - w / 2, y, s)}
    <text x="${cx}" y="${y + 84 * s + nameSize + 14}" class="key-b" text-anchor="middle" style="font-size:${nameSize}px">${i + 1}. ${esc(name)}</text>
    ${textLines(cx, y + 84 * s + nameSize + 16 + textSize * 1.25, words.split('\n'), textSize * 1.25, 'key-s', 'middle').replace('class="key-s"', `class="key-s" style="font-size:${textSize}px"`)}`;
}

function shapesChart() {
  const d = spec('seven-hand-types-chart');
  const colW = (d.width - 120) / 7;
  const wide = frame(d.width, d.height, `<text x="80" y="96" class="title">${esc(d.name)}</text>
  <rect x="50" y="140" width="${d.width - 100}" height="${d.height - 270}" rx="12" fill="${C.panel}" stroke="${C.border}" stroke-width="2"/>
  ${HAND_SHAPE_ORDER.map((key, i) => shapeCell(key, i, 60 + colW * i + colW / 2, 168, 3.7, 34, 25)).join('')}
  ${credit(d.width, d.height, '/hand-types/', 'Drawings of a type, never a real hand. Source: Cheiro, Palmistry for All (1916), Part II, ch. I.', false)}`);
  const tcol = d.tall.width / 3;
  const tall = frame(d.tall.width, d.tall.height, `${textLines(56, 86, wrap(d.name, 32), 64, 'title title-tall')}
  ${HAND_SHAPE_ORDER.map((key, i) => {
    const row = Math.floor(i / 3);
    const col = row === 2 ? 1 : i % 3;
    return shapeCell(key, i, tcol * col + tcol / 2, 240 + row * 540, 3.6, 40, 32);
  }).join('')}
  ${credit(d.tall.width, d.tall.height, '/hand-types/', 'Drawings of a type, never a real hand. Source: Cheiro, Palmistry for All (1916).', true)}`);
  return { wide, tall };
}

// ---------------------------------------------------------------------------
// Semantic SEO Phase 3 (WEB-FEAT-039/046): the M on the palm and the signs sheet. Same hand, same rules:
// drawings only; the signs are gold marks where the books place them (VARIANTS sign-*), never on a photo.

/** A numbered key row whose badge has a line's colour (the M chart names the four major lines). */
function colourRow(n, text, x, y, size, max, fill) {
  const lines = wrap(text, max);
  const r = size * 0.62;
  return `<g><circle cx="${x}" cy="${y - size * 0.34}" r="${r}" fill="${fill}"/><text x="${x}" y="${y - size * 0.34}" dy="${size * 0.24}" class="num-s" style="font-size:${Math.round(size * 0.66)}px">${n}</text>
    ${textLines(x + r + 20, y, lines, size * 1.25, 'key', 'start').replace('class="key"', `class="key" style="font-size:${size}px"`)}</g>`;
}

/** Rows stacked by their wrapped height. */
function stackRows(rows, x, y0, size, max, gap, draw) {
  let y = y0;
  return rows
    .map((row, i) => {
      const out = draw(i, row, x, y);
      y += wrap(row.text, max).length * size * 1.25 + gap;
      return out;
    })
    .join('');
}

const pin = (x, y, n, fill = C.gold) =>
  `<circle cx="${x}" cy="${y}" r="5.2" fill="${fill}" stroke="${C.halo}" stroke-width="0.8"/><text x="${x}" y="${y}" dy="2.2" class="badge">${n}</text>`;

const M_KEY = [
  { line: 'heart', text: 'Heart line: the top stroke', at: [84, 138] },
  { line: 'head', text: 'Head line: the stroke across the middle', at: [97, 182] },
  { line: 'life', text: 'Life line: the curve round the thumb', at: [143, 196] },
  { line: 'fate', text: 'Fate line: the line up the middle that closes the M', at: [103, 226] },
];

function mChart() {
  const d = spec('m-on-palm-four-lines-chart');
  const big = {
    focus: MAIN.map((line) => ({ d: BASE_PATHS[line], kind: line })),
    extra: M_KEY.map((k, i) => pin(k.at[0], k.at[1], i + 1, C[k.line])).join(''),
    strong: true,
  };
  const forms = [
    ['m-four-lines', 'All four lines meet:\na full M'],
    ['m-no-fate', 'No fate line:\nno full M'],
  ];
  const note = 'A drawing, not a real palm. No classical palmistry book reads an M.';
  const row = (size, max) => (i, k, x, y) => colourRow(i + 1, k.text, x, y, size, max, C[k.line]);
  const wide = frame(d.width, d.height, `<text x="80" y="96" class="title">${esc(d.name)}</text>
  ${palm(40, 150, 4.3, big)}
  <rect x="860" y="146" width="880" height="370" rx="12" fill="${C.panel}" stroke="${C.border}" stroke-width="2"/>
  ${stackRows(M_KEY, 910, 222, 32, 44, 30, row(32, 44))}
  ${forms.map(([name, label], i) => tile(name, label, 860 + i * 450, 548, 1.6, 30, 430)).join('')}
  ${credit(d.width, d.height, '/palmistry-m/', note, false)}`);
  const tall = frame(d.tall.width, d.tall.height, `${textLines(56, 86, wrap(d.name, 32), 64, 'title title-tall')}
  ${palm(170, 230, 4.0, big)}
  ${stackRows(M_KEY, 86, 1232, 40, 40, 34, row(40, 40))}
  ${forms.map(([name, label], i) => tile(name, label, 40 + i * 520, 1660, 1.9, 34, 480)).join('')}
  ${credit(d.tall.width, d.tall.height, '/palmistry-m/', note, true)}`);
  return { wide, tall };
}

/** The signs sheet: each sign a gold mark (VARIANTS) where the books place it, numbered, with its Hindi name. */
const SIGN_KEY = [
  { variant: 'sign-star-jupiter', term: 'star', text: 'three or more short lines crossing at one point, on a mount', at: [161, 131] },
  { variant: 'sign-triangle-saturn', term: 'triangle', text: 'a small, clearly formed triangle, on a mount', at: [107, 125] },
  { variant: 'sign-square-life', term: 'square', text: 'a small box, often over a break in a line', at: [138, 205] },
  { variant: 'sign-fish', term: 'fish', text: 'a small fish shape at the base of the palm, above the wrist (Indian books)', at: [85, 232] },
  { variant: 'sign-trident', term: 'trident', text: 'three short lines rising from one stem; the books give no fixed place (Indian books)', at: [75, 137] },
];

function signsChart() {
  const d = spec('lucky-signs-on-palm-chart');
  const marks = SIGN_KEY.flatMap((k) => VARIANTS[k.variant].paths.map((p) => ({ d: p, kind: 'minor' })));
  const big = {
    focus: marks,
    // The life line with the break the square covers (sign-square-life), the other lines as usual.
    context: MAIN.map((l) => (l === 'life' ? VARIANTS['sign-square-life'].context.life : BASE_PATHS[l])),
    extra: SIGN_KEY.map((k, i) => pin(k.at[0], k.at[1], i + 1)).join(''),
    strong: true,
  };
  const rowText = (k) => `${term(k.term).name.en}: ${k.text}`;
  const draw = (size, max) => (i, k, x, y) =>
    `${keyRow(i + 1, k.text, x, y, size, max)}<text x="${x + size * 0.62 + 20}" y="${y + wrap(k.text, max).length * size * 1.25}" class="hi" style="font-size:${Math.round(size * 0.9)}px">${esc(term(k.term).name.hi)}</text>`;
  // Each row is its wrapped text plus one line for the Hindi name (the gap).
  const rows = SIGN_KEY.map((k) => ({ ...k, text: rowText(k) }));
  const note = 'A drawing, not a real palm. Signs are small; most phone photos can’t show them.';
  const wide = frame(d.width, d.height, `<text x="80" y="96" class="title">${esc(d.name)}</text>
  ${palm(70, 150, 4.6, big)}
  <rect x="940" y="150" width="800" height="1000" rx="12" fill="${C.panel}" stroke="${C.border}" stroke-width="2"/>
  ${stackRows(rows, 992, 236, 32, 38, 32 * 1.25 + 44, draw(32, 38))}
  ${credit(d.width, d.height, '/lucky-signs/', note, false)}`);
  const tall = frame(d.tall.width, d.tall.height, `${textLines(56, 86, wrap(d.name, 32), 64, 'title title-tall')}
  ${palm(130, 230, 4.6, big)}
  ${stackRows(rows, 86, 1350, 40, 40, 40 * 1.25 + 52, draw(40, 40))}
  ${credit(d.tall.width, d.tall.height, '/lucky-signs/', note, true)}`);
  return { wide, tall };
}

// ---------------------------------------------------------------------------
// Semantic SEO Phase 3, guides B (WEB-FEAT-036/045/058): the broken life line, the Mercury line and the
// children lines. Same hand and rules: drawings only (VARIANTS life-break-*, mercury-*, children-*).

/** The drawn palm inside a nested <svg> with its own viewBox (palm units): a close-up. */
function zoomBody(v, stroke, extra = '') {
  return `<path d="${PALM_OUTLINE}" fill="${C.skinStrong}" stroke="${C.gold}" stroke-width="${stroke * 0.3}" stroke-linejoin="round"/>
      ${v.context.map((d) => `<path d="${d}" fill="none" stroke="${C.dim}" stroke-opacity="0.6" stroke-width="${stroke * 0.6}" stroke-linecap="round"/>`).join('')}
      ${v.focus.map((f) => `<path d="${f.d}" fill="none" stroke="${colour(f.kind)}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}
      ${extra}`;
}

const zoom = (x, y, w, h, viewBox, body) =>
  `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet">${body}</svg>`;

/** A close-up tile: one variant through `viewBox`, with its label under it. */
function zoomTile(name, label, x, y, w, h, viewBox, labelSize, stroke) {
  const boxH = h - labelSize * 2.4 - 30;
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${C.panel}" stroke="${C.border}" stroke-width="2"/>
    ${zoom(x + 14, y + 14, w - 28, boxH - 14, viewBox, zoomBody(variant(name), stroke))}
    ${textLines(x + w / 2, y + boxH + 10 + labelSize, label.split('\n'), labelSize * 1.2, 'tile', 'middle').replace('class="tile"', `class="tile" style="font-size:${labelSize}px"`)}
  </g>`;
}

/** A small numbered badge for a close-up (palm units, sized for a zoom of about 8–14×). */
const smallPin = (x, y, n) =>
  `<circle cx="${x}" cy="${y}" r="2.4" fill="${C.gold}" stroke="${C.halo}" stroke-width="0.35"/><text x="${x}" y="${y}" dy="1.1" class="badge" style="font-size:3.1px">${n}</text>`;

const BREAKS = [
  ['life-break-clean', '1. A clean break:\nthe ends in line'],
  ['life-break-overlap', '2. Overlapping: one\npiece starts beside'],
  ['life-break-square', '3. A square drawn\nround the gap'],
  ['life-break-sister', '4. A sister line\nacross the gap'],
];
/** The life line and the base of the thumb, close up. */
const LIFE_ZOOM = '98 142 100 112';

function brokenChart() {
  const d = spec('broken-life-line-types');
  const note = 'Drawings, not real palms. A break is read as change, never as death or illness.';
  const tw = 400;
  const gap = 26;
  const x0 = (d.width - 4 * tw - 3 * gap) / 2;
  const wide = frame(d.width, d.height, `<text x="80" y="96" class="title">${esc(d.name)}</text>
  ${BREAKS.map(([name, label], i) => zoomTile(name, label, x0 + i * (tw + gap), 140, tw, 560, LIFE_ZOOM, 30, 1.5)).join('')}
  ${credit(d.width, d.height, '/life-line/broken/', note, false)}`);
  const ttw = 480;
  const tall = frame(d.tall.width, d.tall.height, `${textLines(56, 86, wrap(d.name, 32), 64, 'title title-tall')}
  ${BREAKS.map(([name, label], i) => zoomTile(name, label, 40 + (i % 2) * (ttw + 40), 230 + Math.floor(i / 2) * 610, ttw, 590, LIFE_ZOOM, 34, 1.5)).join('')}
  ${credit(d.tall.width, d.tall.height, '/life-line/broken/', note, true)}`);
  return { wide, tall };
}

function mercuryChart() {
  const d = spec('mercury-line-path');
  const zone = (z, n) => `<ellipse cx="${z.cx}" cy="${z.cy}" rx="${z.rx}" ry="${z.ry}" fill="${C.gold}" fill-opacity="0.16" stroke="${C.gold}" stroke-width="0.55" stroke-dasharray="1.6 1.2"/>
    ${pin(z.cx + z.rx * 0.72, z.cy - z.ry - 4, n)}`;
  const big = { ...variant('mercury-line'), extra: zone({ cx: 92, cy: 232, rx: 22, ry: 13 }, 1) + zone({ cx: 63, cy: 136, rx: 10, ry: 7.5 }, 2), strong: true };
  const start = 'Starts low on the palm; the books differ on exactly where';
  const end = 'Runs up to the mount of Mercury, under the little finger';
  const forms = [
    ['mercury-line', 'Long, up to the\nlittle finger'],
    ['mercury-short', 'Short, under the\nlittle finger'],
    ['mercury-absent', 'No Mercury line\n(common)'],
  ];
  const note = 'A drawing, not a real palm. The Mercury line is not a medical test.';
  const tileW = 280;
  const wide = frame(d.width, d.height, `<text x="80" y="96" class="title">${esc(d.name)}</text>
  ${palm(40, 140, 3.6, big)}
  <rect x="860" y="146" width="880" height="290" rx="12" fill="${C.panel}" stroke="${C.border}" stroke-width="2"/>
  ${keyRow(1, start, 910, 222, 32, 44)}
  ${keyRow(2, end, 910, 222 + wrap(start, 44).length * 40 + 50, 32, 44)}
  ${forms.map(([name, label], i) => tile(name, label, 860 + i * (tileW + 20), 460, 1.1, 28, tileW)).join('')}
  ${credit(d.width, d.height, '/mercury-line/', note, false)}`);
  const tTile = 316;
  const tall = frame(d.tall.width, d.tall.height, `${textLines(56, 86, wrap(d.name, 32), 64, 'title title-tall')}
  ${palm(170, 190, 4.0, big)}
  ${keyRow(1, start, 86, 1172, 40, 44)}
  ${keyRow(2, end, 86, 1172 + wrap(start, 44).length * 50 + 60, 40, 44)}
  ${forms.map(([name, label], i) => tile(name, label, 40 + i * (tTile + 16), 1440, 1.3, 34, tTile)).join('')}
  ${credit(d.tall.width, d.tall.height, '/mercury-line/', note, true)}`);
  return { wide, tall };
}

const EDGE_ZOOM = '38 86 72 72';
const CHILD_KEY = [
  { text: 'Marriage line: a short line in from the edge', at: [68, 133] },
  { text: 'Children lines: fine upright lines on it or just above it (Cheiro)', at: [51, 128] },
  { text: 'Heart line, just below', at: [76, 151] },
];

function childrenChart() {
  const d = spec('children-lines-position');
  const close = zoomBody(variant('children-lines'), 0.75, CHILD_KEY.map((k, i) => smallPin(k.at[0], k.at[1], i + 1)).join(''));
  // The whole palm, with the close-up's area marked (palm units).
  const area = `<rect x="45" y="124" width="32" height="32" rx="3" fill="${C.gold}" fill-opacity="0.12" stroke="${C.goldBright}" stroke-width="0.7" stroke-dasharray="2 1.4"/>`;
  const map = { context: MAIN.map((l) => BASE_PATHS[l]), extra: area, strong: true };
  const note = 'A drawing, not a real palm. No line can tell if you will have children.';
  const rows = (x, y0, size, max) => stackRows(CHILD_KEY, x, y0, size, max, 30, (i, k, x1, y) => keyRow(i + 1, k.text, x1, y, size, max));
  const wide = frame(d.width, d.height, `<text x="80" y="96" class="title">${esc(d.name)}</text>
  ${palm(60, 190, 3.0, map)}
  <rect x="630" y="150" width="620" height="620" rx="12" fill="${C.panel}" stroke="${C.border}" stroke-width="2"/>
  ${zoom(640, 160, 600, 600, EDGE_ZOOM, close)}
  <rect x="1280" y="150" width="460" height="620" rx="12" fill="${C.panel}" stroke="${C.border}" stroke-width="2"/>
  ${rows(1324, 236, 30, 24)}
  ${credit(d.width, d.height, '/children-line/', note, false)}`);
  const tall = frame(d.tall.width, d.tall.height, `${textLines(56, 86, wrap(d.name, 32), 64, 'title title-tall')}
  <rect x="40" y="200" width="1000" height="1000" rx="12" fill="${C.panel}" stroke="${C.border}" stroke-width="2"/>
  ${zoom(50, 210, 980, 980, EDGE_ZOOM, close)}
  ${rows(86, 1300, 38, 24)}
  ${palm(700, 1270, 1.6, map)}
  ${credit(d.tall.width, d.tall.height, '/children-line/', note, true)}`);
  return { wide, tall };
}

// ---------------------------------------------------------------------------

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Mukta; font-weight: 400; src: url(${font('mukta', 'mukta-latin-400-normal.woff2')}) format('woff2'); }
@font-face { font-family: Mukta; font-weight: 700; src: url(${font('mukta', 'mukta-latin-700-normal.woff2')}) format('woff2'); }
@font-face { font-family: MuktaDeva; font-weight: 400; src: url(${font('mukta', 'mukta-devanagari-400-normal.woff2')}) format('woff2'); }
@font-face { font-family: MuktaDeva; font-weight: 700; src: url(${font('mukta', 'mukta-devanagari-700-normal.woff2')}) format('woff2'); }
@font-face { font-family: Cormorant; font-weight: 700; src: url(${font('cormorant-garamond', 'cormorant-garamond-latin-700-normal.woff2')}) format('woff2'); }
html, body { margin: 0; background: ${C.page}; }
svg { display: block; }
.title { font: 700 58px Cormorant, serif; fill: ${C.text}; letter-spacing: -0.01em; }
.title-tall { font-size: 58px; }
.key { font: 400 32px Mukta, sans-serif; fill: ${C.text}; }
.key-b { font: 700 32px Mukta, sans-serif; fill: ${C.text}; }
.key-s { font: 400 26px Mukta, sans-serif; fill: ${C.muted}; }
.hi { font-family: MuktaDeva, Mukta, sans-serif; font-weight: 400; fill: ${C.gold}; }
.tile { font: 700 28px Mukta, sans-serif; fill: ${C.text}; }
.num-s { font: 700 20px Mukta, sans-serif; fill: ${C.onGold}; text-anchor: middle; }
.badge { font: 700 6px Mukta, sans-serif; fill: ${C.onGold}; text-anchor: middle; }
.note { font: 400 26px Mukta, sans-serif; fill: ${C.muted}; }
.credit { font: 700 26px Mukta, sans-serif; fill: ${C.gold}; }
.licence { font: 400 24px Mukta, sans-serif; fill: ${C.muted}; }
</style></head><body>__SVG__</body></html>`;

const JOBS = [
  ...Object.keys(LINE_DIAGRAMS).map((line) => ({ id: LINE_DIAGRAMS[line].id, make: () => lineDiagram(line) })),
  { id: 'mounts-of-the-palm-chart', make: mountsChart },
  { id: 'seven-hand-types-chart', make: shapesChart },
  { id: 'm-on-palm-four-lines-chart', make: mChart },
  { id: 'lucky-signs-on-palm-chart', make: signsChart },
  { id: 'broken-life-line-types', make: brokenChart },
  { id: 'mercury-line-path', make: mercuryChart },
  { id: 'children-lines-position', make: childrenChart },
].filter((job) => !only || job.id.includes(only));

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
try {
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
    console.log(`Wrote ${d.id}.{png,webp,avif} (${d.width}×${d.height}), -900 and -tall (${d.tall.width}×${d.tall.height})`);
  }
} finally {
  await browser.close();
}
