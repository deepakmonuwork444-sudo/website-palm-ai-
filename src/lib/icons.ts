/**
 * PalmSays icon set v4 (DESIGN_SYSTEM.md §8): one bespoke, solid duotone set on a
 * 24px grid. Main shapes are solid `currentColor`; supporting shapes sit in one
 * group at 40 % (`S`), so overlaps never darken and the second tone follows the
 * theme (deep gold on Night, light ink on Day). Strokes only where a stroke is the
 * shape (checks, chevrons, palm lines): 2–2.4px, round caps and joins. No
 * gradients, no glow, no emoji. Each concept has its own drawing; the palm-line
 * icons are one mini palm with that line drawn in the full tone.
 *
 * Shared by Icon.astro (static pages) and reading/Icons.tsx (the React island):
 * import single icons by name so the island only bundles what it uses.
 */

/** Attributes every icon <svg> carries (children inherit them). */
export const ICON_SVG_ATTRS = {
  viewBox: '0 0 24 24',
  fill: 'currentColor',
  'stroke-width': '2.2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
} as const;

const n = (v: number): string => String(Math.round(v * 100) / 100);

/** Rounded rectangle as path data (for even-odd cut-outs). */
const rr = (x: number, y: number, w: number, h: number, r: number): string =>
  `M${n(x + r)} ${n(y)}h${n(w - 2 * r)}a${n(r)} ${n(r)} 0 0 1 ${n(r)} ${n(r)}v${n(h - 2 * r)}a${n(r)} ${n(r)} 0 0 1 ${n(-r)} ${n(r)}h${n(-(w - 2 * r))}a${n(r)} ${n(r)} 0 0 1 ${n(-r)} ${n(-r)}v${n(-(h - 2 * r))}a${n(r)} ${n(r)} 0 0 1 ${n(r)} ${n(-r)}z`;
/** Circle as path data. */
const ci = (cx: number, cy: number, r: number): string =>
  `M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-2 * r)} 0z`;

/** Second tone: one group, so overlapping shapes stay one even tint. */
const S = (inner: string): string => `<g opacity=".4">${inner}</g>`;
/** Solid shape. */
const P = (d: string): string => `<path d="${d}"/>`;
/** Solid shape with even-odd cut-outs. */
const E = (d: string): string => `<path d="${d}" fill-rule="evenodd"/>`;
/** Stroke (2.2 by default). */
const L = (d: string, w?: number): string =>
  `<path d="${d}" fill="none" stroke="currentColor"${w ? ` stroke-width="${w}"` : ''}/>`;
/** A palm line: full tone, 2.5px, so it reads at 24px. */
const HL = (d: string): string => L(d, 2.5);

/** Thick check mark as a filled outline (to cut out of a badge). */
const checkCut = (cx: number, cy: number, s: number): string => {
  const p = [[-2.7, 0], [-1.5, -1.15], [-0.75, -0.4], [1.75, -2.9], [2.95, -1.75], [-0.75, 1.95]];
  return `M${p.map(([x, y]) => `${n(cx + (x ?? 0) * s)} ${n(cy + (y ?? 0) * s)}`).join('L')}Z`;
};

/**
 * The open hand as ONE outline (palm facing, thumb on the left): four rounded
 * fingers split by short notches, a thumb, a flat wrist. Used light (a 24 % fill
 * with a crisp full-tone outline) under palm lines, or solid on its own.
 */
const HAND_D =
  'M9.2 22C8 21 7.2 19.8 6.6 18.6C6 17.4 5.4 16.6 5 15.9L3.23 10.87A1.45 1.45 0 0 1 5.97 9.93L7.7 14.9' +
  'V5.75A1.55 1.55 0 0 1 10.8 5.75V10.6V3.95A1.55 1.55 0 0 1 13.9 3.95V10.6V4.75A1.55 1.55 0 0 1 17 4.75V10.6V7.4A1.4 1.4 0 0 1 19.8 7.4' +
  'V15.4C19.8 19.2 17.6 22 14.8 22Z';
/** Light hand: soft fill + crisp outline (`sw` keeps the outline 1.75px when the hand is scaled). */
const lightHand = (sw = 1.75): string => `<path d="${HAND_D}" fill-opacity=".24" stroke="currentColor" stroke-width="${n(sw)}"/>`;
const solidHand = (): string => P(HAND_D);
/** Mini palm: the light hand with lines and marks on it, centred in the box. */
const palm = (inner: string): string => `<g transform="translate(.4 0)">${lightHand()}${inner}</g>`;

// Palm lines on the hand, in their places in the books.
const LINE = {
  heart: 'M19.5 12.6C16.6 12.4 13.6 12.8 10.8 11.2',
  head: 'M7.9 13.4C11.3 13.6 14.8 14.7 18 16.8',
  life: 'M7.9 13.8C10.8 15.7 11.9 18.5 11.6 21.6',
  fate: 'M14.4 21.6C14.1 17.6 13.5 14 12.4 10.9',
  sun: 'M16.8 19C16.6 16 16.3 13.2 15.6 10.9',
  mercury: 'M12.8 20.8C15.2 18 17.3 14.8 18.9 11.6',
} as const;

const heartD = 'M12 20.8S3.2 15.6 3.2 9.4A4.7 4.7 0 0 1 12 7.1a4.7 4.7 0 0 1 8.8 2.3c0 6.2-8.8 11.4-8.8 11.4Z';
const starD = (cx: number, cy: number, r: number): string => {
  const k = r * 0.22;
  return `M${n(cx)} ${n(cy - r)}C${n(cx + k)} ${n(cy - k)} ${n(cx + k)} ${n(cy - k)} ${n(cx + r)} ${n(cy)}C${n(cx + k)} ${n(cy + k)} ${n(cx + k)} ${n(cy + k)} ${n(cx)} ${n(cy + r)}C${n(cx - k)} ${n(cy + k)} ${n(cx - k)} ${n(cy + k)} ${n(cx - r)} ${n(cy)}C${n(cx - k)} ${n(cy - k)} ${n(cx - k)} ${n(cy - k)} ${n(cx)} ${n(cy - r)}Z`;
};
const shieldD = 'M12 2.4 4.4 5.4v6c0 4.7 3.2 8.6 7.6 10.2 4.4-1.6 7.6-5.5 7.6-10.2v-6Z';
const bubbleD = 'M12 3c5.1 0 9.2 3.6 9.2 8.1s-4.1 8.1-9.2 8.1c-1.2 0-2.4-.2-3.5-.6L3.4 20.8l1.5-4.4C3.6 15 2.8 13.1 2.8 11.1 2.8 6.6 6.9 3 12 3Z';
const keyhole = (cx: number, cy: number): string => `M${n(cx - 0.7)} ${n(cy + 1.44)}a1.6 1.6 0 1 1 1.4 0l.45 2.5h-2.3z`;

// ---------- UI ----------
export const sun = `${P(ci(12, 12, 4.4))}${L('M12 2.4v2.2M12 19.4v2.2M2.4 12h2.2M19.4 12h2.2M5.2 5.2l1.55 1.55M17.25 17.25l1.55 1.55M5.2 18.8l1.55-1.55M17.25 6.75l1.55-1.55')}`;
export const moon = P('M20.4 14.6A8.8 8.8 0 1 1 9.4 3.6a7 7 0 0 0 11 11Z');
export const menu = L('M4 8.2h16M4 15.8h10.5');
export const closeX = L('M6.4 6.4l11.2 11.2M17.6 6.4 6.4 17.6');
export const chevron = L('M9.2 5.6l6.4 6.4-6.4 6.4', 2.3);
export const arrow = L('M4.4 12h14.4M13.2 6.2l5.8 5.8-5.8 5.8');
export const check = L('M4.8 12.6l4.6 4.6L19.2 7.2', 2.5);
export const tick = `${S(P(ci(12, 12, 9.8)))}${L('M7.4 12.4l3.1 3.1 6.1-6.3', 2.4)}`;
export const info = `${S(P(ci(12, 12, 9.8)))}${P(rr(10.85, 10.4, 2.3, 7.2, 1.15))}${P(ci(12, 7.4, 1.45))}`;
export const lock = `${S(L('M7.9 10.6V8.1a4.1 4.1 0 0 1 8.2 0v2.5', 2.4))}${E(rr(4.4, 10, 15.2, 11.6, 3) + keyhole(12, 14.2))}`;
export const shield = `${S(P(shieldD))}${L('M8.4 12.2l2.5 2.5 4.7-4.9', 2.4)}`;
export const privacy = `${S(P(shieldD))}${L('M10 11.2V9.6a2 2 0 0 1 4 0v1.6', 2)}${E(rr(8.6, 10.8, 6.8, 5.6, 1.4) + ci(12, 13.6, 1))}`;
export const phone = `${S(P(rr(8.1, 4.6, 7.8, 12.4, 1)))}${E(rr(6.2, 2.2, 11.6, 19.6, 3) + rr(8.1, 4.6, 7.8, 12.4, 1))}${S(P(rr(10.6, 18.6, 2.8, 1.2, 0.6)))}`;
export const camera = `${E('M2.4 9.6A2.8 2.8 0 0 1 5.2 6.8h2.3l1.3-2a1.8 1.8 0 0 1 1.5-.8h3.4a1.8 1.8 0 0 1 1.5.8l1.3 2h2.3a2.8 2.8 0 0 1 2.8 2.8v8.2a2.8 2.8 0 0 1-2.8 2.8H5.2a2.8 2.8 0 0 1-2.8-2.8Z' + ci(12, 13.4, 4.6))}${S(P(ci(12, 13.4, 2.9)))}`;
export const picture = `${S(P(rr(2.4, 4.2, 19.2, 15.6, 3.2)))}${P('M2.4 16.4l5.1-5.1a1.6 1.6 0 0 1 2.3 0l4 4 1.6-1.6a1.6 1.6 0 0 1 2.3 0l3.9 3.9v.9a3.2 3.2 0 0 1-3.2 3.2H5.6a3.2 3.2 0 0 1-3.2-3.2Z')}${P(ci(16, 8.9, 1.9))}`;
export const scan = `${S(P(rr(7.2, 7.2, 9.6, 9.6, 2.2)))}${L('M3.4 8.6V6.6a3.2 3.2 0 0 1 3.2-3.2h2M15.4 3.4h2a3.2 3.2 0 0 1 3.2 3.2v2M20.6 15.4v2a3.2 3.2 0 0 1-3.2 3.2h-2M8.6 20.6h-2a3.2 3.2 0 0 1-3.2-3.2v-2')}${L('M5.2 12h13.6')}`;
export const eye = `${S(P('M1.6 12C4.1 7.5 7.7 5.2 12 5.2s7.9 2.3 10.4 6.8c-2.5 4.5-6.1 6.8-10.4 6.8S4.1 16.5 1.6 12Z'))}${E(ci(12, 12, 4) + ci(12, 12, 1.5))}`;
export const target = `${S(P(ci(12, 12, 8.4)))}${L('M12 1.8v3.6M12 18.6v3.6M1.8 12h3.6M18.6 12h3.6')}${P(ci(12, 12, 2.8))}`;
export const replay = `${L('M5.3 13.4A7 7 0 1 0 7.6 6.6', 2.3)}${P('M3.9 3.7a.8.8 0 0 1 1.3-.6l4.6 3.8a.8.8 0 0 1-.4 1.4l-4.9.8a.8.8 0 0 1-.9-.8Z')}`;
export const download = `${S(P(rr(2.8, 15.4, 18.4, 6, 2.6)))}${L('M12 3.2v11M7.4 9.8l4.6 4.6 4.6-4.6', 2.4)}`;
export const share = `${S(P(rr(4, 9.6, 16, 12, 3)))}${L('M12 15V3.4M7.8 7.4 12 3.2l4.2 4.2', 2.4)}`;
export const chain = `${S(L('M10.3 13.7a4.1 4.1 0 0 0 5.8 0l3-3a4.1 4.1 0 0 0-5.8-5.8l-1 1', 2.4))}${L('M13.7 10.3a4.1 4.1 0 0 0-5.8 0l-3 3a4.1 4.1 0 0 0 5.8 5.8l1-1', 2.4)}`;
export const chat = E(bubbleD + ci(8, 11.1, 1.3) + ci(12, 11.1, 1.3) + ci(16, 11.1, 1.3));
export const pen = `<g transform="rotate(45 12 12)">${S(P(rr(9.7, 1.4, 4.6, 3.4, 1.4)))}${P(rr(9.7, 5.4, 4.6, 11.6, 0.9))}${S(P('M9.7 17.6h4.6L12 22.4Z'))}</g>`;
export const globe = `<circle cx="12" cy="12" r="9.3" fill-opacity=".24" stroke="currentColor" stroke-width="2"/>${L('M12 2.8c-2.5 2.6-3.7 5.6-3.7 9.2s1.2 6.6 3.7 9.2c2.5-2.6 3.7-5.6 3.7-9.2S14.5 5.4 12 2.8ZM2.8 12h18.4', 2)}`;
export const language = `${S(P(rr(9.6, 9.2, 12, 12, 3)))}${E(rr(2.4, 2.6, 11.6, 11.6, 3) + 'M8.2 5.2 11.4 11.6H9.5L8.9 10.3H7.5L6.9 11.6H5Z' + 'M8.2 7.9 8.65 9H7.75Z')}${L('M14.6 13.2h6M19.2 13.2v6.4M15 14.8c1.2-.7 2.6-.1 2.3 1.1-.2.6-.8.9-1.4.9.8 0 1.6.5 1.6 1.3 0 1.1-1.4 1.5-2.5.8M16.8 16.9h2.4', 1.8)}`;
export const book = `${S(P('M2.4 5.4c3.4-1 6.4-.6 8.7 1.4v13.6c-2.3-1.8-5.3-2.2-8.7-1.3Z'))}${P('M21.6 5.4c-3.4-1-6.4-.6-8.7 1.4v13.6c2.3-1.8 5.3-2.2 8.7-1.3Z')}`;
export const docPage = `${S(P('M6.8 2.4h7.4l5.4 5.4v11a2.8 2.8 0 0 1-2.8 2.8H6.8A2.8 2.8 0 0 1 4 18.8V5.2a2.8 2.8 0 0 1 2.8-2.8Z'))}${P('M14.2 2.4v3.8a1.6 1.6 0 0 0 1.6 1.6h3.8Z')}${L('M8 12.2h7.6M8 15.6h7.6M8 19h4.6', 2)}`;
export const trash = `${S(P('M5.4 8.4h13.2l-.9 11a2.6 2.6 0 0 1-2.6 2.4H8.9a2.6 2.6 0 0 1-2.6-2.4Z'))}${L('M3.6 6.2h16.8M9.2 6V4.6A1.4 1.4 0 0 1 10.6 3.2h2.8a1.4 1.4 0 0 1 1.4 1.4V6', 2.3)}${L('M10 11.6v6.2M14 11.6v6.2', 2)}`;
export const key = `${E(ci(7.4, 12, 5.2) + ci(6.3, 12, 1.8))}${P(rr(11, 10.85, 10.8, 2.3, 1.15))}${S(P(rr(16, 12.4, 2.3, 4.4, 0.9) + rr(19.4, 12.4, 2.3, 3.2, 0.9)))}`;
export const spark = P(starD(12, 12, 9.6));

// ---------- Life areas (home "what your palm reveals") ----------
export const heart = P(heartD);
export const love = `${S(`<path d="${heartD}" transform="translate(9.6 .4) scale(.56)"/>`)}<path d="${heartD}" transform="translate(-.4 4.2) scale(.8)"/>`;
export const person = `${P(ci(12, 7.7, 4.3))}${S(P('M3.6 20.2c.9-4.4 4.3-7.4 8.4-7.4s7.5 3 8.4 7.4a1.5 1.5 0 0 1-1.5 1.8H5.1a1.5 1.5 0 0 1-1.5-1.8Z'))}`;
export const briefcase = `${L('M8.9 6.8V5.4a1.9 1.9 0 0 1 1.9-1.9h2.4a1.9 1.9 0 0 1 1.9 1.9v1.4', 2.2)}${P('M2.6 9.8a3 3 0 0 1 3-3h12.8a3 3 0 0 1 3 3v3.1H2.6Z')}${S(P('M2.6 14.5h18.8v3.8a3 3 0 0 1-3 3H5.6a3 3 0 0 1-3-3Z'))}${P(rr(10.2, 11.6, 3.6, 4.2, 1.1))}`;
export const compass = `${S(P(ci(12, 12, 9.8)))}${E('M16.6 7.4 13.5 13.5 7.4 16.6 10.5 10.5Z' + ci(12, 12, 1.1))}`;
export const balance = `${P(rr(10.9, 5, 2.2, 14.6, 1.1))}${P(rr(6.4, 19.2, 11.2, 2.6, 1.3))}${P(ci(12, 4.2, 1.9))}${L('M4.4 7.4h15.2M4.4 7.4v3.6M19.6 7.4v3.6', 2)}${S(P('M1 11.6h6.8a3.4 3.4 0 0 1-6.8 0Z' + 'M16.2 11.6H23a3.4 3.4 0 0 1-6.8 0Z'))}`;
export const question = `${S(P(bubbleD))}${L('M9.4 8.9a2.7 2.7 0 1 1 4 2.3c-.8.4-1.4 1-1.4 1.9v.4', 2.3)}${P(ci(12, 16.2, 1.35))}`;

// ---------- Palm and its lines ----------
export const handIcon = `<g transform="translate(.4 0)">${solidHand()}</g>`;
export const palmLines = palm(L(LINE.heart, 2.3) + L(LINE.head, 2.3) + L(LINE.life, 2.3));
export const lineHeart = palm(HL(LINE.heart));
export const lineHead = palm(HL(LINE.head));
export const lineLife = palm(HL(LINE.life));
export const lineFate = palm(HL(LINE.fate));
export const lineSun = palm(HL(LINE.sun));
export const lineMercury = palm(HL(LINE.mercury));
/** Marriage line: on the palm's edge under the little finger, above a faint heart line for reference. */
export const lineMarriage = palm(`<g opacity=".45">${L(LINE.heart, 1.8)}</g>${HL('M17.8 10.9H20.7')}`);

// ---------- Tools (one icon each) ----------
export const reading = `${L('M2.6 7.6V5.8a3.2 3.2 0 0 1 3.2-3.2h1.8M16.4 2.6h1.8a3.2 3.2 0 0 1 3.2 3.2v1.8M21.4 16.4v1.8a3.2 3.2 0 0 1-3.2 3.2h-1.8M7.6 21.4H5.8a3.2 3.2 0 0 1-3.2-3.2v-1.8', 2.2)}<g transform="translate(3.6 3.3) scale(.7)">${lightHand(1.75 / 0.7)}${L(LINE.heart, 3)}${L(LINE.head, 3)}${L(LINE.life, 3)}</g>`;
/** Line finder: the palm with one line, and a magnifier. */
export const lineFinder = `<g transform="translate(-.6 .1) scale(.8)">${lightHand(1.75 / 0.8)}${L(LINE.head, 3.1)}</g>${E(ci(17, 17, 4.6) + ci(17, 17, 2.7))}${L('M20.4 20.4l1.8 1.8', 2.8)}`;
export const handShape = `<g transform="translate(.5 .3) scale(.84)">${solidHand()}</g>${L('M21.6 9.4v9.2M20.4 9.4h2.4M20.4 18.6h2.4M6 22.4h10M6 21.2v2.4M16 21.2v2.4', 1.8)}`;
/** Finger reader: the hand with the ring finger drawn solid. */
export const fingers = palm(P('M13.9 10.8V4.75A1.55 1.55 0 0 1 17 4.75V10.8Z'));
export const handsCompare = `<g transform="translate(-.5 3.6) scale(.64)">${lightHand(1.75 / 0.64)}</g><g transform="translate(24.5 3.6) scale(-.64 .64)">${solidHand()}</g>`;
export const photoCheck = `${S(P(rr(2.4, 3.4, 17, 14, 3)))}${P('M2.4 13.6l4.4-4.4a1.5 1.5 0 0 1 2.1 0l3.6 3.6 1.2-1.2a1.5 1.5 0 0 1 2.1 0l1.6 1.6v.6a7 7 0 0 0-3.4 3.6H5.4a3 3 0 0 1-3-3Z')}${P(ci(14.4, 7.6, 1.6))}${E(ci(17.4, 17.4, 5.2) + checkCut(17.4, 17.6, 0.95))}`;
export const whichHand = `${palm('')}${E(ci(17.4, 17.4, 5.2) + checkCut(17.4, 17.6, 0.95))}`;
/** Palm signs: one hand with a small star on the mount under the ring finger. */
export const signs = palm(P(starD(15.6, 14.4, 3.5)));
export const palmMap = palm([ci(9.3, 12.4, 1.5), ci(15.5, 12.4, 1.5), ci(10, 18, 1.6), ci(17.4, 18, 1.6)].map(P).join(''));
export const quiz = `${P(ci(5, 6.2, 2.4))}${L('M10 6.2h10.2')}${S(P(ci(5, 12, 2.4) + ci(5, 17.8, 2.4)) + L('M10 12h10.2M10 17.8h7'))}`;

// ---------- Pricing ----------
export const gift = `${S(P(rr(4, 11.4, 16, 10.4, 2.4)))}${P(rr(2.6, 7.4, 18.8, 4.6, 1.8))}${P('M10.8 11.4h2.4v10.4h-2.4Z')}${P('M12 7.4c-.9-3-3.5-4.7-5.2-3.5-1.4 1.1-.4 3.5 5.2 3.5Zm0 0c.9-3 3.5-4.7 5.2-3.5 1.4 1.1.4 3.5-5.2 3.5Z')}`;
export const crown = `<path d="M3.4 8.6l4.5 3.9L12 6l4.1 6.5 4.5-3.9-1.6 9H5Z" stroke="currentColor" stroke-width="1.6"/>${P(ci(3.2, 7.6, 1.6) + ci(12, 4.4, 1.7) + ci(20.8, 7.6, 1.6))}${S(P(rr(5, 18.6, 14, 2.8, 1.3)))}`;
export const bolt = `${S(P(rr(4.6, 4.4, 14.8, 16.8, 3.4)))}<path d="M13.8 1.8 5.6 13.3h5.8l-1.3 8.9 8.3-11.6h-5.8Z" stroke="currentColor" stroke-width="1.2"/>`;

/** Every icon by its semantic name. */
export const ICONS = {
  sun, moon, menu, close: closeX, chevron, arrow, check, tick, info, lock, shield, privacy, phone, camera, image: picture, scan,
  eye, target, replay, download, share, link: chain, chat, pen, globe, language, book, document: docPage, trash, key, spark,
  heart, love, self: person, briefcase, compass, balance, question,
  hand: handIcon, 'palm-lines': palmLines, 'line-heart': lineHeart, 'line-head': lineHead, 'line-life': lineLife,
  'line-fate': lineFate, 'line-sun': lineSun, 'line-mercury': lineMercury, 'line-marriage': lineMarriage,
  reading, 'line-finder': lineFinder, 'hand-shape': handShape, fingers, 'hands-compare': handsCompare,
  'photo-check': photoCheck, 'which-hand': whichHand, signs, 'palm-map': palmMap, quiz,
  gift, crown, bolt,
} as const;

export type IconName = keyof typeof ICONS;
