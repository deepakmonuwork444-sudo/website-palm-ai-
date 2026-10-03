// COPIED from palm-ai-new--feat-m1-foundation/src/features/lines/live-scan.ts at app commit fbc2232d837f (2026-09-30).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import type { Bilingual } from '../../i18n';

import type { LineScanOutcome } from './types';

/**
 * What the analysing screen draws on the user's own photo while the reading is
 * made. Everything here comes from the scanner's answer: the 21 hand landmarks
 * it found and the lines it traced. Nothing is estimated or invented; a scan
 * with no hand draws no hand, a line it did not accept is not drawn.
 */

export type Pt = [number, number];

/** MediaPipe's HAND_CONNECTIONS: the hand skeleton between the 21 landmarks. */
export const HAND_CONNECTIONS: readonly (readonly [number, number])[] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20],
];

/** The order lines are drawn in, and the only lines ever drawn. */
export const LIVE_LINE_ORDER = ['heart', 'head', 'life', 'fate'] as const;
export type LiveLineType = (typeof LIVE_LINE_ORDER)[number];

/** Below this mean crease probability a traced line is drawn dashed (as in the report). */
export const LIVE_FAINT_BELOW = 0.6;

export interface LiveTrace {
  type: LiveLineType;
  /** Normalised 0..1 on the photo that was scanned. */
  points: Pt[];
  faint: boolean;
}

export interface LiveScanData {
  /** `outline` is the hand's real skin boundary from the scanner, null when it sent none (older build or not found). */
  hand: { landmarks: Pt[]; hull: Pt[]; outline: Pt[] | null; score: number } | null;
  lines: LiveTrace[];
}

interface ScanLineLike {
  present: boolean;
  label: string;
  pixel_confidence: number;
  polyline: readonly (readonly [number, number])[];
}

/**
 * The hand and the accepted traces of a scan, ready to draw. Null for a scan
 * that did not answer (nothing real to draw). A line is drawn only when the
 * scanner found it and accepted it under its own name, like the report does.
 */
export function liveScanFromScan(scan: LineScanOutcome): LiveScanData | null {
  if (scan.status !== 'ok') return null;
  const { hand, lines } = scan.response;
  const all = (lines ?? {}) as Partial<Record<string, ScanLineLike>>;
  const traces: LiveTrace[] = [];
  for (const type of LIVE_LINE_ORDER) {
    const line = all[type];
    if (!line || !line.present || line.label !== type || line.polyline.length < 2) continue;
    traces.push({
      type,
      points: line.polyline.map((p) => [p[0], p[1]] as Pt),
      faint: line.pixel_confidence < LIVE_FAINT_BELOW,
    });
  }
  const landmarks = hand ? hand.landmarks.map((p) => [p[0], p[1]] as Pt) : [];
  const outline = hand?.outline && hand.outline.length >= 8 ? hand.outline.map((p) => [p[0], p[1]] as Pt) : null;
  return {
    hand:
      hand && landmarks.length === 21
        ? { landmarks, hull: expandHull(convexHull(landmarks), 1.18), outline, score: hand.handednessScore }
        : null,
    lines: traces,
  };
}

const cross = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

/** Convex hull (Andrew's monotone chain), counter-clockwise in y-down space order, no repeated end point. */
export function convexHull(points: readonly Pt[]): Pt[] {
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (sorted.length < 3) return sorted;
  const lower: Pt[] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2]!, lower[lower.length - 1]!, p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: Pt[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i]!;
    while (upper.length >= 2 && cross(upper[upper.length - 2]!, upper[upper.length - 1]!, p) <= 0) upper.pop();
    upper.push(p);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

/**
 * The hull pushed out from its centre by `factor`. Landmarks sit on the joints,
 * inside the skin, so the unexpanded hull would clip the fingertips and palm edge.
 */
export function expandHull(hull: readonly Pt[], factor: number): Pt[] {
  if (hull.length === 0) return [];
  const cx = hull.reduce((s, p) => s + p[0], 0) / hull.length;
  const cy = hull.reduce((s, p) => s + p[1], 0) / hull.length;
  return hull.map((p) => [cx + (p[0] - cx) * factor, cy + (p[1] - cy) * factor] as Pt);
}

/**
 * The hand's own shape for the focus mask, in the same units as `points`: the
 * palm polygon (a heel just past the wrist, the thumb base and the four
 * knuckles) and stroke widths from the palm's own width. Filled and stroked
 * wide, the polygon covers the palm edges; the finger bones stroked at
 * `fingerWidth` cover the fingers. A convex hull of the landmarks cut the palm
 * heel and the edge under the little finger off.
 */
export function handSilhouette(points: readonly Pt[]): { palm: Pt[]; fingerWidth: number; palmPad: number } {
  const p = (i: number): Pt => points[i] ?? [0, 0];
  const palmWidth = Math.hypot(p(5)[0] - p(17)[0], p(5)[1] - p(17)[1]);
  const wrist = p(0);
  const knuckle = p(9);
  const heel: Pt = [wrist[0] + (wrist[0] - knuckle[0]) * 0.15, wrist[1] + (wrist[1] - knuckle[1]) * 0.15];
  return { palm: [heel, p(1), p(2), p(5), p(9), p(13), p(17)], fingerWidth: palmWidth * 0.34, palmPad: palmWidth * 0.45 };
}

/**
 * How the photo is framed on the hand once the scanner has found it: scaled by
 * `scale` about `origin` (pixels in the photo box). A hand shot from a distance
 * is pushed in on; a hand that already fills the photo is left alone. The
 * origin always stays inside the box, so the scaled photo still covers all of
 * it and no empty edge can show.
 */
export interface HandFocus {
  scale: number;
  origin: Pt;
}

/** The kept photo is 1080 px on its long edge; pushed in further than this it turns soft. */
export const FOCUS_MAX_SCALE = 2;
/** A push-in smaller than this reads as a jolt, not a move: the hand already fills the photo. */
export const FOCUS_MIN_SCALE = 1.15;
/** Room left around the hand, as a share of its own size on each side. */
export const FOCUS_MARGIN = 0.12;

/** `shape` is normalised to the photo (0..1): the hand's outline, or its landmark hull. */
export function handFocus(shape: readonly Pt[], width: number, height: number): HandFocus {
  const none: HandFocus = { scale: 1, origin: [width / 2, height / 2] };
  if (shape.length < 3 || width <= 0 || height <= 0) return none;
  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
  const xs = shape.map((p) => clamp01(p[0]) * width);
  const ys = shape.map((p) => clamp01(p[1]) * height);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const handW = (maxX - minX) * (1 + 2 * FOCUS_MARGIN);
  const handH = (maxY - minY) * (1 + 2 * FOCUS_MARGIN);
  if (handW <= 0 || handH <= 0) return none;
  const scale = Math.min(FOCUS_MAX_SCALE, width / handW, height / handH);
  if (scale < FOCUS_MIN_SCALE) return none;
  // The fixed point that carries the hand's centre to the box centre, kept inside the box.
  const fixed = (centre: number, box: number) => Math.min(box, Math.max(0, (scale * centre - box / 2) / (scale - 1)));
  return { scale, origin: [fixed((minX + maxX) / 2, width), fixed((minY + maxY) / 2, height)] };
}

/** Where a point on the photo box (pixels) lands once the photo is framed by `focus`. */
export function focusPoint(p: Pt, focus: HandFocus): Pt {
  const [ox, oy] = focus.origin;
  return [ox + focus.scale * (p[0] - ox), oy + focus.scale * (p[1] - oy)];
}

export interface LabelBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Where each line's name sits: above its anchor, else below, else stepped
 * away until it overlaps no earlier label, always inside the photo. Lines that
 * start at one point (life and head, often) used to stack their names there.
 */
export function placeLabels(
  items: readonly { anchor: Pt; w: number; h: number }[],
  width: number,
  height: number,
  gap: number,
): LabelBox[] {
  const placed: LabelBox[] = [];
  const inside = (x: number, y: number, w: number, h: number): LabelBox => ({
    x: Math.max(gap, Math.min(width - w - gap, x)),
    y: Math.max(gap, Math.min(height - h - gap, y)),
    w,
    h,
  });
  const overlaps = (b: LabelBox) =>
    placed.some((o) => b.x < o.x + o.w + gap && o.x < b.x + b.w + gap && b.y < o.y + o.h + gap && o.y < b.y + b.h + gap);
  for (const { anchor, w, h } of items) {
    const x = anchor[0] - w / 2;
    const tries = [anchor[1] - h - gap, anchor[1] + gap];
    for (let k = 1; k <= 8; k++) tries.push(anchor[1] + gap + k * (h + gap), anchor[1] - h - gap - k * (h + gap));
    let box = inside(x, tries[0]!, w, h);
    for (const y of tries) {
      const candidate = inside(x, y, w, h);
      if (!overlaps(candidate)) {
        box = candidate;
        break;
      }
    }
    placed.push(box);
  }
  return placed;
}

/** Where a line's name is anchored: three quarters along it, where lines have spread apart. */
export function labelAnchor(points: readonly Pt[]): Pt {
  return points[Math.floor((points.length - 1) * 0.75)] ?? [0, 0];
}

/**
 * What is happening now, per real pipeline stage (the analysing screen's
 * `step`, set by the pipeline as it reaches each stage). No timer: only the
 * stage the reading is really in. The analysing screen shows a separate
 * "report N% ready" number tied to these same stages (owner, 2026-09-21, see
 * features/reading/progress.ts); a confidence or accuracy % stays banned.
 */
export const LIVE_STEP_CAPTIONS: readonly Bilingual[] = [
  { en: 'Scanning your photo for your hand…', hi: 'फोटो में आपका हाथ खोजा जा रहा है…' },
  {
    en: 'AI is reading line depth and length, then matching with the books…',
    hi: 'AI रेखाओं की गहराई और लंबाई पढ़ रहा है, फिर किताबों से मिलान होगा…',
  },
  { en: 'Matched with the books — saving your reading…', hi: 'किताबों से मिलान हुआ — रीडिंग सहेजी जा रही है…' },
  { en: 'Opening your report…', hi: 'आपकी रिपोर्ट खुल रही है…' },
];

export function liveStepCaption(step: number): Bilingual {
  const i = Math.max(0, Math.min(LIVE_STEP_CAPTIONS.length - 1, Math.floor(step)));
  return LIVE_STEP_CAPTIONS[i]!;
}

/** The caption while a hand found by the scanner is drawn. */
export function handFoundCaption(side: 'left' | 'right'): Bilingual {
  // Words only: a percentage here reads like accuracy of the reading (BUG-011).
  // (The report-progress % on the analysing screen is allowed, owner 2026-09-21;
  // a confidence % on a hand or line never is.)
  return side === 'left'
    ? { en: 'Found your hand · left hand', hi: 'आपका हाथ मिला · बायाँ हाथ' }
    : { en: 'Found your hand · right hand', hi: 'आपका हाथ मिला · दायाँ हाथ' };
}

const LINE_NAME: Record<LiveLineType, Bilingual> = {
  heart: { en: 'Heart line', hi: 'हृदय रेखा' },
  head: { en: 'Head line', hi: 'मस्तिष्क रेखा' },
  life: { en: 'Life line', hi: 'जीवन रेखा' },
  fate: { en: 'Fate line', hi: 'भाग्य रेखा' },
};

/** The caption while one traced line draws itself on. */
export function lineTracedCaption(type: LiveLineType, faint: boolean): Bilingual {
  const name = LINE_NAME[type];
  return faint
    ? { en: `${name.en} traced · faint in this photo`, hi: `${name.hi} मिली · इस फोटो में हल्की` }
    : { en: `${name.en} traced`, hi: `${name.hi} मिली` };
}

/* ------------------------------------------------------------------------- */
/* DEC-037 (A): the moving camera over the live scan (owner, 2026-09-24).    */
/* ------------------------------------------------------------------------- */

/**
 * The live scan's "camera": the photo AND everything drawn on it sit in one
 * view, moved by `translate(tx, ty) scale(scale)` about the box centre. A
 * content point p (pixels of the photo box) lands on screen at
 * c + t + scale × (p − c). Because the overlay is inside that same view,
 * nothing drawn can drift off the photo whatever the camera does (the BUG-015
 * class of error is impossible by construction).
 */
export interface Camera {
  scale: number;
  tx: number;
  ty: number;
}

export const CAMERA_REST: Camera = { scale: 1, tx: 0, ty: 0 };
/**
 * The closest the camera goes. The drawn lines and the hand-focus layer are
 * SVG, which the phone draws once at the box's own size; pushed in further
 * than this they turn visibly soft.
 */
export const CAMERA_MAX_SCALE = 1.6;
/** Ken Burns while the scanner works: 1 → 1.15 over about 6 s. */
export const KEN_BURNS_SCALE = 1.15;
export const KEN_BURNS_MS = 6000;
/** Each slow drift after the Ken Burns, until the hand is found. */
export const DRIFT_MS = 5000;
/** The framing on the palm once the landmarks are in (at least this close). */
export const PALM_SCALE = 1.25;
/** The camera's move onto the palm, and each move of the line tour. */
export const PALM_MOVE_MS = 1200;
export const TOUR_MOVE_MS = 1100;
/** One stop of the line tour during the AI step. */
export const TOUR_STOP_MS = 3000;
/** The closest a tour stop frames a line (it never pulls back past the whole photo). */
export const TOUR_MIN_SCALE = 1.2;
/** Room left around a framed line, as a share of its box on each side. */
export const TOUR_PAD = 0.15;
/** Words under the scan change this often. */
export const WORD_MS = 2500;

const clampN = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * The camera that shows content point `focus` (pixels) as near the box centre
 * as it can at `scale`, never so far that an edge of the photo shows: with
 * |t| ≤ c × (scale − 1) the scaled photo always covers the whole box.
 */
export function cameraAt(focus: Pt, scale: number, width: number, height: number): Camera {
  if (!(width > 0) || !(height > 0)) return CAMERA_REST;
  const s = clampN(Number.isFinite(scale) ? scale : 1, 1, CAMERA_MAX_SCALE);
  const cx = width / 2;
  const cy = height / 2;
  const fx = Number.isFinite(focus[0]) ? focus[0] : cx;
  const fy = Number.isFinite(focus[1]) ? focus[1] : cy;
  const limX = cx * (s - 1);
  const limY = cy * (s - 1);
  // `+ 0` turns a -0 into 0.
  return { scale: s, tx: clampN(s * (cx - fx), -limX, limX) + 0, ty: clampN(s * (cy - fy), -limY, limY) + 0 };
}

/** Where content point `p` shows on screen under `camera` (the same maths the view's transform does). */
export function cameraPoint(p: Pt, camera: Camera, width: number, height: number): Pt {
  const cx = width / 2;
  const cy = height / 2;
  return [cx + camera.tx + camera.scale * (p[0] - cx), cy + camera.ty + camera.scale * (p[1] - cy)];
}

/** The content point that shows at screen point `p` under `camera` (the inverse of `cameraPoint`). */
export function cameraInverse(p: Pt, camera: Camera, width: number, height: number): Pt {
  const cx = width / 2;
  const cy = height / 2;
  const s = camera.scale > 0 ? camera.scale : 1;
  return [cx + (p[0] - cx - camera.tx) / s, cy + (p[1] - cy - camera.ty) / s];
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function boundsOf(points: readonly Pt[]): Bounds | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of points) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  return minX <= maxX ? { minX, minY, maxX, maxY } : null;
}

/** The camera framing `box` (pixels) with `pad` room around it, scale kept in [min, max]. */
export function boxCamera(
  box: Bounds,
  width: number,
  height: number,
  { pad = TOUR_PAD, min = TOUR_MIN_SCALE, max = CAMERA_MAX_SCALE }: { pad?: number; min?: number; max?: number } = {},
): Camera {
  if (!(width > 0) || !(height > 0)) return CAMERA_REST;
  // A line lying flat still gets a sensible height to frame (a tenth of the box).
  const bw = Math.max(box.maxX - box.minX, width * 0.1) * (1 + 2 * pad);
  const bh = Math.max(box.maxY - box.minY, height * 0.1) * (1 + 2 * pad);
  const scale = clampN(Math.min(width / bw, height / bh), min, max);
  return cameraAt([(box.minX + box.maxX) / 2, (box.minY + box.maxY) / 2], scale, width, height);
}

/** The palm's own centre (normalised): the wrist and the four knuckles, where the lines are. */
export function palmCentre(landmarks: readonly Pt[]): Pt {
  const pts = [0, 5, 9, 13, 17]
    .map((i) => landmarks[i])
    .filter((p): p is Pt => !!p && Number.isFinite(p[0]) && Number.isFinite(p[1]));
  if (pts.length === 0) return [0.5, 0.5];
  return [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
}

/**
 * The framing on the palm once the scanner found the hand: centred on the
 * palm, at least PALM_SCALE, closer for a hand shot from a distance (as close
 * as the whole hand still fits, up to CAMERA_MAX_SCALE).
 */
export function palmCamera(landmarks: readonly Pt[], shape: readonly Pt[], width: number, height: number): Camera {
  if (!(width > 0) || !(height > 0)) return CAMERA_REST;
  const scale = clampN(handFocus(shape, width, height).scale, PALM_SCALE, CAMERA_MAX_SCALE);
  const [x, y] = palmCentre(landmarks);
  return cameraAt([x * width, y * height], scale, width, height);
}

/**
 * The Ken Burns end and the slow drift around the photo's centre while the
 * scanner works (no hand yet): the camera never stands still, never far.
 */
export function idleCameras(width: number, height: number): Camera[] {
  return [
    cameraAt([width * 0.5, height * 0.5], KEN_BURNS_SCALE, width, height),
    cameraAt([width * 0.47, height * 0.46], KEN_BURNS_SCALE + 0.04, width, height),
    cameraAt([width * 0.53, height * 0.53], KEN_BURNS_SCALE - 0.03, width, height),
  ];
}

/** One stop of the line tour: a traced line, or the whole palm between rounds. */
export type TourStop = LiveLineType | 'palm';

/** The lines in drawing order, then the whole palm; nothing to tour without a line. */
export function tourStops(types: readonly LiveLineType[]): TourStop[] {
  const lines = LIVE_LINE_ORDER.filter((t) => types.includes(t));
  return lines.length === 0 ? [] : [...lines, 'palm'];
}

export function tourStopAt(stops: readonly TourStop[], tick: number): TourStop | null {
  const n = stops.length;
  if (n === 0) return null;
  return stops[((Math.floor(tick) % n) + n) % n]!;
}

export function tourCaption(stop: TourStop): Bilingual {
  if (stop === 'palm') return { en: 'Reading your whole palm…', hi: 'पूरी हथेली पढ़ी जा रही है…' };
  const name = LINE_NAME[stop];
  return { en: `Reading your ${name.en.toLowerCase()}…`, hi: `आपकी ${name.hi} पढ़ी जा रही है…` };
}

/** While the scanner looks at the photo (no answer yet). */
export const SCAN_WORDS: readonly Bilingual[] = [
  { en: 'Finding your fingers…', hi: 'आपकी उंगलियाँ खोजी जा रही हैं…' },
  { en: 'Measuring your palm…', hi: 'आपकी हथेली नापी जा रही है…' },
  { en: 'Looking for your lines…', hi: 'आपकी रेखाएँ खोजी जा रही हैं…' },
];
/** While the AI reads the photo with no traced line to tour. */
export const READ_WORDS: readonly Bilingual[] = [
  { en: 'Reading your palm…', hi: 'आपकी हथेली पढ़ी जा रही है…' },
  { en: 'Reading line depth and length…', hi: 'रेखाओं की गहराई और लंबाई पढ़ी जा रही है…' },
  { en: 'Matching with the books…', hi: 'किताबों से मिलान हो रहा है…' },
];

export function rotatingWord(words: readonly Bilingual[], tick: number): Bilingual {
  const n = words.length;
  if (n === 0) return { en: '', hi: '' };
  return words[((Math.floor(tick) % n) + n) % n]!;
}

/** Landmark dots pop one by one: 40 ms apart, each 0 → 1.2 → 1 in `popMs`. */
export const DOT_STAGGER_MS = 40;
export const DOT_POP_MS = 260;
/** A pause after the camera starts moving onto the palm, before the first dot. */
export const DOTS_DELAY_MS = 350;
/** The focus (dim outside the hand) fading in after the dots. */
export const FOCUS_FADE_MS = 500;
/** Each traced line drawing itself on. */
export const LINE_DRAW_MS = 1500;

export interface PopFrame {
  /** Normalised 0..1 on the whole pop animation. */
  start: number;
  peak: number;
  end: number;
}

/** When each of `count` items pops, normalised on one 0 → 1 animation of `totalMs`. */
export function popTimeline(count: number, staggerMs = DOT_STAGGER_MS, popMs = DOT_POP_MS): { totalMs: number; frames: PopFrame[] } {
  const n = Math.max(0, Math.floor(count));
  const totalMs = n === 0 ? 0 : (n - 1) * staggerMs + popMs;
  const frames: PopFrame[] = [];
  for (let i = 0; i < n; i++) {
    const s = (i * staggerMs) / totalMs;
    frames.push({ start: s, peak: s + (popMs * 0.6) / totalMs, end: s + popMs / totalMs });
  }
  return { totalMs, frames };
}

/** The dots that get a light haptic: every `every`-th and the last (never one per dot). */
export function hapticIndices(count: number, every = 5): number[] {
  const n = Math.max(0, Math.floor(count));
  if (n === 0) return [];
  const out: number[] = [];
  for (let i = 0; i < n; i += Math.max(1, every)) out.push(i);
  if (out[out.length - 1] !== n - 1) out.push(n - 1);
  return out;
}

/** When each part of the hand-and-lines reveal starts, in ms after the hand was found. */
export interface RevealTimeline {
  dotsStart: number;
  dotsMs: number;
  focusStart: number;
  linesStart: number;
  /** One per traced line, in drawing order. */
  lineStarts: number[];
  totalMs: number;
}

export function revealTimeline(dotCount: number, lineCount: number): RevealTimeline {
  const dotsMs = popTimeline(dotCount).totalMs;
  const dotsStart = DOTS_DELAY_MS;
  const focusStart = dotsStart + dotsMs;
  const linesStart = focusStart + FOCUS_FADE_MS;
  const lines = Math.max(0, Math.floor(lineCount));
  const lineStarts = Array.from({ length: lines }, (_, i) => linesStart + i * LINE_DRAW_MS);
  return { dotsStart, dotsMs, focusStart, linesStart, lineStarts, totalMs: linesStart + lines * LINE_DRAW_MS };
}
