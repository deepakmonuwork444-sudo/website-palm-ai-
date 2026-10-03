/**
 * The live scan on the web (WEB-DEC-043): timings and pure helpers around the
 * APP's own maths. The camera (cameraAt, palmCamera, boxCamera, idleCameras),
 * the side labels (placeSideLabels) and the curves (smoothPath) are copied
 * verbatim from the app (src/lib/reading/palm/, scripts/sync-palm-lib.mjs);
 * this file only adds what a browser needs: CSS transforms, keyframe offsets,
 * the web's short tour and the words over the photo.
 *
 * The app's numbers (src/components/palm/LiveScan.tsx) are kept: beam 1440 ms
 * each way, edge glow 1600 ms, 3 s of scanning before the hand is drawn, the
 * palm move 1200 ms, 21 dots 40 ms apart, the focus 500 ms, each line 1500 ms,
 * reduce motion = one 720 ms fade. Web only: the reading is ready almost at
 * once, so the show plays BEFORE the report, with a "Skip to my reading" button.
 *
 * Calmer web pace (owner 2026-09-27: "slow, smooth zoom… each line drawn slowly
 * one by one with its name… ~8–12 s"): a long gliding push-in onto the palm,
 * soft dots, each line drawn over 1.6 s with an eased pen and a pause before
 * the next, its name fading in; then a short settle and the report
 * (`webRevealTimeline`, PACE). The tour (each traced line, then the palm)
 * plays ONLY while the reading is still being written, never to pad a ready
 * one. Presentation only: the server's work is never delayed.
 */

import type { Locale } from '../../config/site';
import { COPY } from './copy';
import {
  LIVE_LINE_ORDER,
  boundsOf,
  boxCamera,
  cameraInverse,
  cameraPoint,
  CAMERA_REST,
  type Camera,
  type Pt,
  type TourStop,
} from './palm/features/lines/live-scan';
import { placeSideLabels, type SideLabel } from './palm/features/lines/side-labels';
import type { TracedLine, TracedLineName } from './store';

/** The beam sweeps at least this long before the hand is drawn (the app's MIN_SCAN_MS). */
export const MIN_SCAN_MS = 3000;
/** One beam pass, each way (the app: 1440 ms; the web glides slower, owner 2026-09-27). */
export const BEAM_MS = 2200;
/** The gold edge glow, each way, until the hand is found. */
export const GLOW_MS = 2000;
/** Outside the hand the photo dims to this (the app's FOCUS_DIM). */
export const FOCUS_DIM = 0.42;
/** The soft edge of the focus mask, px. */
export const FEATHER = 10;
/** The skeleton once the lines draw (the app's BONES_DIM), over 720 ms. */
export const BONES_DIM = 0.45;
export const BONES_DIM_MS = 720;
/** Reduce motion: the hand and lines fade in once, over this long (the app: motion.slow × 2). */
export const FADE_MS = 720;
export const DOT_COUNT = 21;
/**
 * The web's calmer pace for the reveal (owner 2026-09-27). Times in ms from
 * the moment the scanner's hand is shown.
 */
export const PACE = {
  /** The camera glides onto the palm (long, soft landing; lines start during its last, nearly still part). */
  palmMoveMs: 3200,
  /** The 21 landmarks fade in, one after another. */
  dotsDelayMs: 500,
  dotStaggerMs: 55,
  dotPopMs: 480,
  /** Outside the hand the photo dims. */
  focusFadeMs: 900,
  /** The first line starts drawing. */
  linesStartMs: 2600,
  /** Each line draws itself this long, eased, then a pause before the next. */
  lineDrawMs: 1600,
  lineGapMs: 450,
  /** A line's name fades in this long, from 45 % of its line. */
  nameInMs: 700,
  /** After the last line, the finished palm stays this long before the report. */
  settleMs: 1400,
  /** The tour (only while the reading is still being written): one camera move. */
  tourMoveMs: 1600,
} as const;

/** Web tour (only while the reading is not ready): one stop per traced line (move included), then the whole palm. */
export const TOUR_LINE_MS = 2600;
export const TOUR_PALM_MS = 2000;
/** The light starts along a toured line when the camera has nearly arrived (the app's RUN_DELAY_MS rule). */
export const RUN_DELAY_MS = Math.round(PACE.tourMoveMs * 0.6);
export const RUN_MS = TOUR_LINE_MS - RUN_DELAY_MS - 400;
/** The finished palm (or a hand with no line) stays this long before the report. */
export const HOLD_MS = PACE.settleMs;

export interface WebTimeline {
  dotsStart: number;
  dotsMs: number;
  focusStart: number;
  linesStart: number;
  lineStarts: number[];
  /** The last line has finished drawing. */
  linesEnd: number;
  /** linesEnd + the settle: when the report may open (if the reading is ready). */
  totalMs: number;
}

/** When each part of the reveal starts, at the web's calmer pace (PACE). */
export function webRevealTimeline(dotCount: number, lineCount: number): WebTimeline {
  const dots = Math.max(0, Math.floor(dotCount));
  const lines = Math.max(0, Math.floor(lineCount));
  const dotsStart = PACE.dotsDelayMs;
  const dotsMs = dots > 0 ? (dots - 1) * PACE.dotStaggerMs + PACE.dotPopMs : 0;
  const focusStart = dotsStart + Math.round(dotsMs * 0.7);
  const linesStart = Math.max(PACE.linesStartMs, focusStart + Math.round(PACE.focusFadeMs * 0.6));
  const step = PACE.lineDrawMs + PACE.lineGapMs;
  const lineStarts = Array.from({ length: lines }, (_, i) => linesStart + i * step);
  const linesEnd = lines > 0 ? linesStart + lines * PACE.lineDrawMs + (lines - 1) * PACE.lineGapMs : focusStart + PACE.focusFadeMs;
  return { dotsStart, dotsMs, focusStart, linesStart, lineStarts, linesEnd, totalMs: linesEnd + PACE.settleMs };
}
/** Words under the scan change this often (the app's WORD_MS). */
export const WORD_MS = 2500;

/** React Native's Easing curves as CSS timing functions. */
export const EASE = {
  /** Easing.inOut(Easing.sin) */
  sine: 'cubic-bezier(0.37, 0, 0.63, 1)',
  /** Easing.inOut(Easing.cubic) */
  cubic: 'cubic-bezier(0.65, 0, 0.35, 1)',
  /** Easing.inOut(Easing.quad) */
  quad: 'cubic-bezier(0.45, 0, 0.55, 1)',
  /** Animated.timing's default, Easing.inOut(Easing.ease) */
  standard: 'ease-in-out',
  /** Web: a long, soft landing (the camera onto the palm, names fading in). */
  glide: 'cubic-bezier(0.33, 0, 0.12, 1)',
  /** Web: the pen starts gently and slows into the end of a line. */
  draw: 'cubic-bezier(0.45, 0.05, 0.3, 1)',
} as const;

/** Name labels (the app: caption 12/18 px, padding spacing.sm 8, gaps spacing.xs 4). */
export const LABEL_FONT = 12;
export const LABEL_H = 22;
export const LABEL_PAD = 4;
export const LABEL_GAP = 4;

/** A label box's width for its text, as the app sizes it (no text measuring). */
export function labelWidth(text: string): number {
  return text.length * LABEL_FONT * 0.6 + 16;
}

const round = (n: number, digits = 3) => {
  const f = 10 ** digits;
  return Math.round(n * f) / f + 0;
};

/**
 * The camera as a CSS transform on the view that holds the photo and every
 * mark on it (transform-origin: centre). Pans are percentages of the box, so
 * the framing survives a resize of the box.
 */
export function camTransform(camera: Camera, width: number, height: number): string {
  const x = width > 0 ? (camera.tx / width) * 100 : 0;
  const y = height > 0 ? (camera.ty / height) * 100 : 0;
  return `translate(${round(x)}%, ${round(y)}%) scale(${round(camera.scale, 4)})`;
}

/** The traced lines in the app's drawing order: heart, head, life, fate. */
export function inLiveOrder(lines: readonly TracedLine[]): TracedLine[] {
  return LIVE_LINE_ORDER.flatMap((type) => lines.filter((line) => line.type === type));
}

export function toPx(points: readonly (readonly [number, number])[], width: number, height: number): Pt[] {
  return points.map((p) => [p[0] * width, p[1] * height] as Pt);
}

export function polylineLength(points: readonly Pt[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += Math.hypot(points[i]![0] - points[i - 1]![0], points[i]![1] - points[i - 1]![1]);
  return total;
}

/**
 * Each point of a polyline with its share (0..1) of the length so far: the
 * keyframes of a pen tip running along the line at an even speed. Points that
 * add no length are dropped (offsets must rise).
 */
export function alongPolyline(points: readonly Pt[]): { offset: number; point: Pt }[] {
  const total = polylineLength(points);
  if (points.length < 2 || total <= 0) return [];
  const out: { offset: number; point: Pt }[] = [{ offset: 0, point: points[0]! }];
  let run = 0;
  for (let i = 1; i < points.length; i++) {
    run += Math.hypot(points[i]![0] - points[i - 1]![0], points[i]![1] - points[i - 1]![1]);
    const offset = i === points.length - 1 ? 1 : run / total;
    if (offset > out[out.length - 1]!.offset) out.push({ offset, point: points[i]! });
  }
  if (out[out.length - 1]!.offset < 1) out[out.length - 1]!.offset = 1;
  return out;
}

/** The labels' words: full names ("Heart line") when every box fits in 30% of the photo's width, else short ("Heart"). */
export function labelTexts(types: readonly TracedLineName[], locale: Locale, width: number): string[] {
  const long = types.map((type) => COPY.lines[type][locale]);
  return long.every((text) => labelWidth(text) <= width * 0.3) ? long : types.map((type) => COPY.linesShort[type][locale]);
}

export interface LiveLabel {
  type: TracedLineName;
  text: string;
  /** In the photo box's own pixels (the camera's content space); w and h are the label's size on screen. */
  box: SideLabel;
}

/**
 * Names in columns at the edges of what is on screen in `camera`'s framing
 * (the palm framing, where the lines draw), carried back into the photo's own
 * pixels so they ride with the camera: the app's LiveScan `sideLabels`.
 */
export function liveLabels(
  lines: readonly { type: TracedLineName; points: readonly Pt[] }[],
  texts: readonly string[],
  width: number,
  height: number,
  camera: Camera | null,
): LiveLabel[] {
  if (width <= 0 || height <= 0 || lines.length === 0) return [];
  const cam = camera ?? CAMERA_REST;
  const toBox = (p: Pt): Pt => cameraPoint(p, cam, width, height);
  const back = (p: Pt): Pt => cameraInverse(p, cam, width, height);
  const placed = placeSideLabels(
    lines.map((line, i) => {
      const all = line.points.map(toBox);
      // Anchor each leader on the part of the line that is on screen in this framing.
      const seen = all.filter(([x, y]) => x >= 0 && x <= width && y >= 0 && y <= height);
      return { key: line.type, points: seen.length > 0 ? seen : all, w: labelWidth(texts[i] ?? ''), h: LABEL_H };
    }),
    width,
    height,
    LABEL_PAD,
    LABEL_GAP,
  );
  const out: LiveLabel[] = [];
  lines.forEach((line, i) => {
    const at = placed.find((b) => b.key === line.type);
    if (!at) return;
    const from = back(at.from);
    out.push({
      type: line.type,
      text: texts[i] ?? '',
      box: { ...at, x: at.side === 'left' ? from[0] - at.w : from[0], y: from[1] - at.h / 2, from, anchor: back(at.anchor) },
    });
  });
  return out;
}

/** The tour's framing of each traced line (its points and its label), as the app's `cams.tour`. */
export function tourCameras(
  lines: readonly { type: TracedLineName; points: readonly Pt[] }[],
  labels: readonly LiveLabel[],
  width: number,
  height: number,
): Map<TracedLineName, Camera> {
  const out = new Map<TracedLineName, Camera>();
  for (const line of lines) {
    const pts = [...line.points];
    const label = labels.find((l) => l.type === line.type)?.box;
    if (label) pts.push([label.x, label.y], [label.x + label.w, label.y + label.h]);
    const b = boundsOf(pts);
    if (b) out.set(line.type, boxCamera(b, width, height));
  }
  return out;
}

/** How long each tour stop lasts on the web: a line 2.6 s, the whole palm 2 s. */
export function stopMs(stop: TourStop): number {
  return stop === 'palm' ? TOUR_PALM_MS : TOUR_LINE_MS;
}

/** One pass of the web's short tour, in ms (the report opens after it once the reading is ready). */
export function tourMs(stops: readonly TourStop[]): number {
  return stops.reduce((sum, stop) => sum + stopMs(stop), 0);
}

/** "{line}" in a template → the line's name. */
export function withLine(template: string, line: string): string {
  return template.replace('{line}', line);
}

/** The words over the photo while a traced line draws itself on. */
export function lineTracedWords(type: TracedLineName, faint: boolean, locale: Locale): string {
  return withLine((faint ? COPY.lineTracedFaint : COPY.lineTraced)[locale], COPY.lines[type][locale]);
}

/** The words over the photo at one tour stop. */
export function tourWords(stop: TourStop, locale: Locale): string {
  if (stop === 'palm') return COPY.tourPalm[locale];
  const name = COPY.lines[stop][locale];
  return withLine(COPY.tourLine[locale], locale === 'en' ? name.toLowerCase() : name);
}
