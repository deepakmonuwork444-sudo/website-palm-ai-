/**
 * Guide template v4, "teach by seeing" (WEB-DEC-047): the real palm photo the
 * guides teach on, and everything drawn on it, worked out at BUILD time.
 *
 * The photo is a licensed REAL palm photo (Pexels 8058729 by Hanna Pad, Pexels License; 1800 × 2400,
 * public/images/guides/palm-hero-*, 2026-10-02, design-v4/photo-credits.json), credited wherever it shows. Its lines
 * come ONLY from the app's real palm4_v2 scan of this exact photo
 * (src/lib/guides/scans/guide-palm-scan.json, the app's services/palm-lines pipeline run
 * locally, pasted unedited). The reading preview (/reading/) keeps its own photo and
 * scan (src/lib/reading/mock/). A line the scanner did not return clearly is never
 * drawn (WEB-DEC-038 honesty rule).
 *
 * The maths is the app's, synced verbatim (src/lib/reading/palm/**): the
 * curves (smoothPath), the side labels (placeSideLabels), the palm centre.
 * Only used in Astro front matter: nothing here ships to the browser.
 *
 * Units: the photo's drawing frame (FRAME_WIDTH = 360 wide × the file's own aspect; for the
 * HD guide photo that is 360 × 480). The hero shows the photo pushed in by
 * PUSH around a fixed origin (a CSS class), so labels are laid out in the
 * pushed-in "screen" frame and carried back into photo pixels.
 */

import { z } from 'zod';

import scanJson from './scans/guide-palm-scan.json';
import leftPalmScanJson from './scans/left-palm-scan.json';
import { smoothPath } from '../reading/palm/components/deep-report/access';
import { LIVE_FAINT_BELOW, palmCentre, type Pt } from '../reading/palm/features/lines/live-scan';
import { placeSideLabels } from '../reading/palm/features/lines/side-labels';

export type GuideLine = 'heart' | 'head' | 'life' | 'fate';
/** The app's drawing order (LIVE_LINE_ORDER). */
export const GUIDE_LINES: readonly GuideLine[] = ['heart', 'head', 'life', 'fate'];

/** Drawing units are always this many wide (× the photo's own aspect), so line widths, labels and type look the same on every photo. */
export const FRAME_WIDTH = 360;

export interface GuidePhoto {
  /** The drawing frame in units: FRAME_WIDTH × the photo's aspect (every shape, label and crop is in these). */
  width: number;
  height: number;
  /** The file's own pixel size (the <img> width and height attributes). */
  file: { width: number; height: number };
  avif: string;
  webp: string;
  fallback: string;
  /** The one file every cropped view points its SVG <image> at (sharp on a 2x phone). */
  crop: string;
  /**
   * Extra framing for the hero: a fixed zoom toward the palm centre (1 = the whole photo), so
   * the room around a hand can fall outside the frame. It only moves the camera; the scanner's
   * coordinates are never changed.
   */
  zoom: number;
}

/** The drawing frame for a file of this pixel size. */
export const frameOf = (file: { width: number; height: number }) => ({ width: FRAME_WIDTH, height: Math.round((FRAME_WIDTH * file.height) / file.width) });

/** Every size the HD guide photo ships at (public/images/guides/palm-hero-<w>.avif|webp, 1800 px source). */
export const GUIDE_PHOTO_WIDTHS = [600, 900, 1200, 1800] as const;
const GUIDE_PALM_FILE = { width: 1800, height: 2400 } as const;
const heroSet = (ext: string) => GUIDE_PHOTO_WIDTHS.map((w) => `/images/guides/palm-hero-${w}.${ext} ${w}w`).join(', ');
export const GUIDE_PHOTO: GuidePhoto = {
  ...frameOf(GUIDE_PALM_FILE),
  file: GUIDE_PALM_FILE,
  avif: heroSet('avif'),
  webp: heroSet('webp'),
  fallback: '/images/guides/palm-hero-900.webp',
  // The lesson crops zoom in 2–3×: the 1800 px file keeps them sharp on a 3× phone.
  crop: '/images/guides/palm-hero-1800.webp',
  zoom: 1,
};

/**
 * The owner's own LEFT palm (consent 2026-09-28, public/samples/LICENSE.txt): 960 × 1280,
 * photographed indoors, thumb on the left. Its lines are the app's real palm4_v2@8a252bb scan
 * of this exact photo (src/lib/guides/scans/left-palm-scan.json, pasted unedited). Only the
 * /which-hand-to-read/ hero uses it (WEB-DEC-048); the lesson crops stay on GUIDE_PHOTO.
 */
const LEFT_PALM_FILE = { width: 960, height: 1280 } as const;
export const LEFT_PALM_PHOTO: GuidePhoto = {
  ...frameOf(LEFT_PALM_FILE),
  file: LEFT_PALM_FILE,
  avif: '/samples/left-palm-480.avif 480w, /samples/left-palm-960.avif 960w',
  webp: '/samples/left-palm-480.webp 480w, /samples/left-palm-960.webp 960w',
  fallback: '/samples/left-palm-480.webp',
  crop: '/samples/left-palm-960.webp',
  // The hand fills this photo: 1.05 trims the room at the edges; more would cut the middle fingertip and its name.
  zoom: 1.05,
};

/** Which real photo + real scan a guide's traced hero shows (front matter `find.photo`). */
export type GuideHeroKey = 'guide-palm' | 'left-palm';
export const GUIDE_HEROES: Record<GuideHeroKey, { photo: GuidePhoto; scan: unknown; source: string }> = {
  'guide-palm': { photo: GUIDE_PHOTO, scan: scanJson, source: 'src/lib/guides/scans/guide-palm-scan.json' },
  'left-palm': { photo: LEFT_PALM_PHOTO, scan: leftPalmScanJson, source: 'src/lib/guides/scans/left-palm-scan.json' },
};

/** The hero's final push-in (1.0 → 1.1 while the lines draw). */
export const PUSH = 1.1;
/** SVG type in the hero's screen units: the photo is 288 px wide at a 320 px screen (0.8 px a unit), so ≥ 13 px. */
export const TYPE = 16.5;
/** Line name boxes (screen units). */
export const LABEL_H = 26;
export const LABEL_PAD = 6;
export const LABEL_GAP = 4;
/** At most this many points per line before smoothing (HTML weight). */
export const MAX_POINTS = 24;

/** Mukta 600 averages about 0.56 em a character; Devanagari counts its marks as characters, so it only over-reserves. */
export const textWidth = (text: string, size = TYPE) => [...text].length * size * 0.56;
export const labelWidth = (text: string) => Math.round(textWidth(text) + 14);

const point = z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)]);
const scanSchema = z.object({
  model: z.object({ name: z.string().min(1) }),
  image: z.object({ width: z.number().positive(), height: z.number().positive() }),
  hand: z.object({ landmarks: z.array(point) }).nullable().optional(),
  lines: z.record(
    z.string(),
    z.object({
      present: z.boolean(),
      flagged: z.boolean().optional(),
      pixel_confidence: z.number().optional(),
      polyline: z.array(point).optional(),
    }),
  ),
});

export interface GuideTrace {
  line: GuideLine;
  /** Photo pixels, rounded to 1 px, at most MAX_POINTS. */
  points: Pt[];
  /** The scanner saw it faintly (pixel_confidence < LIVE_FAINT_BELOW): drawn dashed, never "drawn in". */
  faint: boolean;
  /** The app's smoothed curve through the points, whole pixels. */
  d: string;
}

export interface GuideScan {
  model: string;
  width: number;
  height: number;
  /** Only lines the scanner really returned (present, not flagged, ≥ 2 points), in the app's order. */
  lines: GuideTrace[];
  /** Lines it did not return clearly: a "not clearly seen" note, never a drawing. */
  missing: GuideLine[];
  /** The 21 hand landmarks in photo pixels, or null when the scan found no hand. */
  landmarks: Pt[] | null;
}

/**
 * Ramer–Douglas–Peucker: drops points that lie within `eps` px of the line
 * through their neighbours, so the curve stays on the scanner's polyline
 * (HTML weight; tests/unit/guide-visuals.test.ts checks the distance).
 */
export function simplify(points: readonly Pt[], eps = 0.5): Pt[] {
  if (points.length < 3) return [...points];
  const [a, b] = [points[0]!, points[points.length - 1]!];
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  let worst = 0;
  let at = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i]!;
    const d = Math.abs((b[0] - a[0]) * (a[1] - p[1]) - (a[0] - p[0]) * (b[1] - a[1])) / len;
    if (d > worst) [worst, at] = [d, i];
  }
  if (worst <= eps) return [a, b];
  return [...simplify(points.slice(0, at + 1), eps).slice(0, -1), ...simplify(points.slice(at), eps)];
}

/** Evenly spaced points, both ends kept. */
export function thin(points: readonly Pt[], max = MAX_POINTS): Pt[] {
  if (points.length <= max) return [...points];
  return Array.from({ length: max }, (_, i) => points[Math.round((i * (points.length - 1)) / (max - 1))]!);
}

/** smoothPath's numbers rounded to whole pixels. */
export const wholePx = (d: string) => d.replace(/-?\d+\.\d+/g, (n) => String(Math.round(Number(n)) + 0));

/** A scanner response → what the guides may draw; null when it is not a usable scan of a photo of `photo`'s shape. */
export function parseGuideScan(raw: unknown, photo: { width: number; height: number } = GUIDE_PHOTO): GuideScan | null {
  const parsed = scanSchema.safeParse(raw);
  if (!parsed.success) return null;
  const { image, lines, model, hand } = parsed.data;
  // A scan of another crop would put every line in the wrong place.
  if (Math.abs(image.width / image.height - photo.width / photo.height) > 0.01) return null;
  const px = (p: readonly [number, number]): Pt => [Math.round(p[0] * photo.width), Math.round(p[1] * photo.height)];
  const out: GuideTrace[] = [];
  const missing: GuideLine[] = [];
  for (const line of GUIDE_LINES) {
    const entry = lines[line];
    const raw = entry?.polyline ?? [];
    if (!entry || !entry.present || entry.flagged || raw.length < 2) {
      missing.push(line);
      continue;
    }
    const points = thin(simplify(raw.map(px).filter((p, i, all) => i === 0 || p[0] !== all[i - 1]![0] || p[1] !== all[i - 1]![1])));
    if (points.length < 2) {
      missing.push(line);
      continue;
    }
    out.push({ line, points, faint: (entry.pixel_confidence ?? 1) < LIVE_FAINT_BELOW, d: wholePx(smoothPath(points)) });
  }
  const landmarks = hand && hand.landmarks.length === 21 ? hand.landmarks.map(px) : null;
  return { model: model.name, width: photo.width, height: photo.height, lines: out, missing, landmarks };
}

/** The app's real scan of a hero photo (throws at build time if it ever stops being usable). */
const cached = new Map<GuideHeroKey, GuideScan>();
export function guideScan(key: GuideHeroKey = 'guide-palm'): GuideScan {
  const hit = cached.get(key);
  if (hit) return hit;
  const hero = GUIDE_HEROES[key];
  const scan = parseGuideScan(hero.scan, hero.photo);
  if (!scan) throw new Error(`traced-palm: ${hero.source} is not a usable scan of its photo`);
  cached.set(key, scan);
  return scan;
}

// ---------------------------------------------------------------------------
// The hero's push-in ("camera").

export interface Camera {
  /** The zoom origin in photo pixels (matches the CSS class). */
  ox: number;
  oy: number;
  scale: number;
  /** Fixed CSS classes that set the same origin, plus the framing zoom if any (no inline style under the hashed CSP). */
  classes: string[];
}

/** Origins the CSS knows, in % of the photo: 30, 35 … 70. */
export const ORIGIN_STEPS = [30, 35, 40, 45, 50, 55, 60, 65, 70] as const;
const snap = (pct: number) => ORIGIN_STEPS.reduce((best, step) => (Math.abs(step - pct) < Math.abs(best - pct) ? step : best), 50);

/** Framing zooms the CSS knows (`.tpz-<percent>`); 1 = the whole photo, no class. */
export const ZOOM_STEPS = [1, 1.05, 1.1] as const;

/**
 * The push-in toward the palm centre (the app's palmCentre), snapped to a CSS origin class.
 * `zoom` frames the photo tighter (a GuidePhoto's `zoom`): the final frame is zoom × scale.
 */
export function heroCamera(scan: GuideScan, scale = PUSH, zoom = 1): Camera {
  const centre = scan.landmarks ? palmCentre(scan.landmarks.map(([x, y]) => [x / scan.width, y / scan.height] as Pt)) : ([0.5, 0.5] as Pt);
  const x = snap(centre[0] * 100);
  const y = snap(centre[1] * 100);
  const z = ZOOM_STEPS.reduce<number>((best, step) => (Math.abs(step - zoom) < Math.abs(best - zoom) ? step : best), 1);
  const classes = [`tpo-x${x}`, `tpo-y${y}`];
  if (z !== 1) classes.push(`tpz-${Math.round(z * 100)}`);
  return { ox: (x / 100) * scan.width, oy: (y / 100) * scan.height, scale: scale * z, classes };
}

export const toScreen = (p: Pt, cam: Camera): Pt => [cam.ox + (p[0] - cam.ox) * cam.scale, cam.oy + (p[1] - cam.oy) * cam.scale];
export const toPhoto = (p: Pt, cam: Camera): Pt => [cam.ox + (p[0] - cam.ox) / cam.scale, cam.oy + (p[1] - cam.oy) / cam.scale];

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const overlaps = (a: Box, b: Box, gap = 0) =>
  a.x < b.x + b.w + gap && b.x < a.x + a.w + gap && a.y < b.y + b.h + gap && b.y < a.y + a.h + gap;

const r1 = (n: number) => Math.round(n * 10) / 10 + 0;

export interface LineLabel {
  line: GuideLine;
  text: string;
  /** The name box and the leader, in SCREEN units (what the reader sees in the final frame). */
  screen: Box & { anchor: Pt; from: Pt };
  /** The same, carried back into photo pixels (drawn inside the pushed-in view). */
  box: Box;
  anchor: Pt;
  from: Pt;
  font: number;
}

/** Line names at the photo's edges with thin leaders (the app's placeSideLabels), in the final pushed-in frame. */
export function lineLabels(scan: GuideScan, texts: Record<GuideLine, string>, cam: Camera): LineLabel[] {
  const inView = (p: Pt) => p[0] >= 0 && p[0] <= scan.width && p[1] >= 0 && p[1] <= scan.height;
  const placed = placeSideLabels(
    scan.lines.map((trace) => {
      const all = trace.points.map((p) => toScreen(p, cam));
      const seen = all.filter(inView);
      return { key: trace.line, points: seen.length > 0 ? seen : all, w: labelWidth(texts[trace.line]), h: LABEL_H };
    }),
    scan.width,
    scan.height,
    LABEL_PAD,
    LABEL_GAP,
  );
  return placed.map((at) => {
    const line = at.key as GuideLine;
    const topLeft = toPhoto([at.x, at.y], cam);
    return {
      line,
      text: texts[line],
      screen: { x: at.x, y: at.y, w: at.w, h: at.h, anchor: at.anchor, from: at.from },
      box: { x: r1(topLeft[0]), y: r1(topLeft[1]), w: r1(at.w / cam.scale), h: r1(at.h / cam.scale) },
      anchor: toPhoto(at.anchor, cam).map(r1) as Pt,
      from: toPhoto(at.from, cam).map(r1) as Pt,
      font: r1(TYPE / cam.scale),
    };
  });
}

/** MediaPipe fingertips: thumb, index, middle, ring, little. */
export const FINGER_TIPS = [4, 8, 12, 16, 20] as const;

export interface FingerLabel {
  /** 0 thumb … 4 little (the order of FINGER_TIPS). */
  finger: number;
  text: string;
  /** Screen units: the text's box (no pill, the text has a dark edge). */
  screen: Box;
  /** Photo pixels: the text's centre baseline point. */
  x: number;
  y: number;
  font: number;
}

/**
 * Finger names just above each fingertip, in the final frame. A name that
 * would touch another is lifted above it; everything stays inside the photo.
 */
export function fingerLabels(scan: GuideScan, texts: readonly string[], cam: Camera, avoid: readonly Box[] = []): FingerLabel[] {
  if (!scan.landmarks) return [];
  const h = Math.round(TYPE * 1.05);
  const boxes: (Box & { finger: number })[] = FINGER_TIPS.map((tip, finger) => {
    const [x, y] = toScreen(scan.landmarks![tip]!, cam);
    const w = Math.round(textWidth(texts[finger] ?? ''));
    return { finger, x: x - w / 2, y: y - 8 - h, w, h };
  });
  // Tallest fingers first, so a lifted name never lands on one placed before it.
  const order = [...boxes].sort((a, b) => a.y - b.y);
  const done: Box[] = [...avoid];
  for (const box of order) {
    box.x = Math.min(Math.max(box.x, LABEL_PAD), scan.width - LABEL_PAD - box.w);
    for (let guard = 0; guard < 8; guard++) {
      const hit = done.find((other) => overlaps(box, other, 2));
      if (!hit) break;
      box.y = hit.y - 2 - box.h;
    }
    box.y = Math.max(box.y, LABEL_PAD);
    done.push(box);
  }
  return boxes.map((box) => {
    const [x, y] = toPhoto([box.x + box.w / 2, box.y + box.h * 0.8], cam);
    return {
      finger: box.finger,
      text: texts[box.finger] ?? '',
      screen: { x: r1(box.x), y: r1(box.y), w: box.w, h: box.h },
      x: r1(x),
      y: r1(y),
      font: r1(TYPE / cam.scale),
    };
  });
}

// ---------------------------------------------------------------------------
// Mounts: AREAS placed from the scanner's hand landmarks, as the books place
// them (Cheiro, Markun). Never lines, never measured "raised".

export type MountKey = 'jupiter' | 'saturn' | 'sun' | 'mercury' | 'venus' | 'moon' | 'marsInner' | 'marsOuter';
/** The order the guide's text lists them (Guru, Shani, Surya, Budh, Shukra, Chandra, then the two Mangal). */
export const MOUNT_ORDER: readonly MountKey[] = ['jupiter', 'saturn', 'sun', 'mercury', 'venus', 'moon', 'marsInner', 'marsOuter'];

export interface MountArea {
  key: MountKey;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/**
 * Each mount's area from the landmarks: under each finger's base knuckle
 * (5, 9, 13, 17), toward the wrist (0); Venus on the ball of the thumb;
 * the Moon on the outer edge above the wrist; Mars inside the life line's
 * start (thumb side) and on the outer edge above the Moon.
 */
export function mountAreas(scan: GuideScan): MountArea[] {
  const lm = scan.landmarks;
  if (!lm) return [];
  const wrist = lm[0]!;
  const palm = Math.hypot(lm[5]![0] - lm[17]![0], lm[5]![1] - lm[17]![1]);
  const r = palm * 0.16;
  const under = (i: number, t: number) => lerp(lm[i]!, wrist, t);
  // The outer edge: from the little finger's knuckle toward the wrist, pushed out by a quarter palm.
  const edge = (t: number): Pt => {
    const [x, y] = lerp(lm[17]!, wrist, t);
    const out = lm[17]![0] > lm[5]![0] ? 1 : -1;
    return [x + out * palm * 0.12, y];
  };
  const at = (key: MountKey, [cx, cy]: Pt, rx: number, ry: number): MountArea => ({ key, cx: Math.round(cx), cy: Math.round(cy), rx: Math.round(rx), ry: Math.round(ry) });
  return [
    at('jupiter', under(5, 0.06), r, r * 0.7),
    at('saturn', under(9, 0.06), r, r * 0.7),
    at('sun', under(13, 0.06), r, r * 0.7),
    at('mercury', under(17, 0.05), r * 0.9, r * 0.7),
    at('marsInner', lerp(lm[2]!, lm[9]!, 0.3), r * 0.9, r * 0.75),
    at('venus', lerp(lm[1]!, lm[9]!, 0.34), r * 1.25, r * 1.4),
    at('marsOuter', edge(0.33), r * 0.85, r),
    at('moon', edge(0.62), r * 0.95, r * 1.3),
  ];
}

// ---------------------------------------------------------------------------
// Cropped views of the same photo (one file, SVG viewBox crops).

/** A window around `points`, `pad` pixels of room, `aspect` = w / h, kept inside the photo; whole pixels. */
export function cropAround(points: readonly Pt[], pad: number, aspect: number, photo: { width: number; height: number } = GUIDE_PHOTO): Box {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of points) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  let w = maxX - minX + pad * 2;
  let h = maxY - minY + pad * 2;
  if (w / h > aspect) h = w / aspect;
  else w = h * aspect;
  w = Math.min(w, photo.width);
  h = Math.min(h, photo.height);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const x = Math.min(Math.max(cx - w / 2, 0), photo.width - w);
  const y = Math.min(Math.max(cy - h / 2, 0), photo.height - h);
  return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) };
}

/** The crop that shows one traced line with room around it (square). */
export function lineCrop(scan: GuideScan, line: GuideLine, pad = 24, aspect = 1): Box | null {
  const trace = scan.lines.find((t) => t.line === line);
  return trace ? cropAround(trace.points, pad, aspect, scan) : null;
}

/** The crop that shows where two lines start (heart vs head), square. */
export function startsCrop(scan: GuideScan, lines: readonly GuideLine[]): Box {
  const pts = scan.lines.filter((t) => lines.includes(t.line)).flatMap((t) => t.points);
  return pts.length > 0 ? cropAround(pts, 18, 1, scan) : { x: 0, y: 0, w: scan.width, h: scan.height };
}

/** The palm (the knuckles, the thumb's base and the wrist), for the mount map. */
export function palmCrop(scan: GuideScan, pad = 22): Box {
  const lm = scan.landmarks;
  if (!lm) return { x: 0, y: 0, w: scan.width, h: scan.height };
  return cropAround([0, 1, 2, 5, 9, 13, 17].map((i) => lm[i]!), pad, 0.9, scan);
}

/** The base of the four fingers (their creases) down to the heart line, for "finger crease or heart line?". */
export function fingerBaseCrop(scan: GuideScan): Box {
  const lm = scan.landmarks;
  const heart = scan.lines.find((t) => t.line === 'heart')?.points ?? [];
  const pts: Pt[] = lm ? [lm[6]!, lm[18]!, lm[5]!, lm[17]!, ...heart] : heart;
  return cropAround(pts, 14, 4 / 3, scan);
}

// ---------------------------------------------------------------------------
// The 4 line guides (guide v4 rollout): one line in focus.

/** MediaPipe base knuckles and the joint above them: index, middle, ring, little. */
export const FINGER_BASES = [
  [5, 6],
  [9, 10],
  [13, 14],
  [17, 18],
] as const;

export interface FingerGuide {
  /** 1 index … 4 little (the landmark's finger). */
  finger: number;
  /** Photo units: from the base knuckle landmark, down the finger's own axis into the palm. */
  from: Pt;
  to: Pt;
}

/**
 * Dotted finger guides: from each finger's base knuckle (the scanner's landmark), straight on down
 * that finger's own axis into the palm, half a palm width long. They show "under which finger";
 * they are guides, never palm lines (the caption says so).
 */
export function fingerGuides(scan: GuideScan, reach = 0.5): FingerGuide[] {
  const lm = scan.landmarks;
  if (!lm) return [];
  const palm = Math.hypot(lm[5]![0] - lm[17]![0], lm[5]![1] - lm[17]![1]);
  return FINGER_BASES.map(([base, joint], i) => {
    const b = lm[base]!;
    const j = lm[joint]!;
    const len = Math.hypot(b[0] - j[0], b[1] - j[1]) || 1;
    const dir: Pt = [(b[0] - j[0]) / len, (b[1] - j[1]) / len];
    const to: Pt = [b[0] + dir[0] * palm * reach, b[1] + dir[1] * palm * reach];
    return { finger: i + 1, from: [Math.round(b[0]), Math.round(b[1])] as Pt, to: [Math.round(to[0]), Math.round(to[1])] as Pt };
  });
}

/**
 * Which end of a traced line is its START, as the books describe it (the scanner's point order is
 * not a reading direction): heart from the little-finger edge, head and life from between the
 * thumb and index finger, fate from the wrist end. Both points are the scanner's own end points.
 */
export function lineEnds(scan: GuideScan, line: GuideLine): { start: Pt; end: Pt } | null {
  const trace = scan.lines.find((t) => t.line === line);
  if (!trace) return null;
  const a = trace.points[0]!;
  const b = trace.points[trace.points.length - 1]!;
  const lm = scan.landmarks;
  let anchor: Pt;
  if (lm) {
    anchor = line === 'heart' ? lm[17]! : line === 'fate' ? lm[0]! : lerp(lm[2]!, lm[5]!, 0.5);
  } else {
    // No landmarks: the photo's own layout (thumb side = the side the head line starts nearer).
    anchor = line === 'fate' ? [scan.width / 2, scan.height] : line === 'heart' ? [scan.width, 0] : [0, scan.height / 2];
  }
  const d = (p: Pt) => Math.hypot(p[0] - anchor[0], p[1] - anchor[1]);
  return d(a) <= d(b) ? { start: a, end: b } : { start: b, end: a };
}

/** A short word beside a dot `p`, pushed away from `other` (the line's other end), kept inside `box`: its centre baseline point. */
export function wordBeside(p: Pt, other: Pt, box: Box, font: number, text: string, gap = 1.1): { x: number; y: number } {
  const len = Math.hypot(p[0] - other[0], p[1] - other[1]) || 1;
  const w = textWidth(text, font);
  const x = p[0] + ((p[0] - other[0]) / len) * font * gap;
  const y = p[1] + ((p[1] - other[1]) / len) * font * gap + font * 0.35;
  return {
    x: r1(Math.min(Math.max(x, box.x + w / 2 + 2), box.x + box.w - w / 2 - 2)),
    y: r1(Math.min(Math.max(y, box.y + font + 2), box.y + box.h - 4)),
  };
}

/** The whole hand (every landmark, room above the fingertips for their names), `aspect` = w / h. */
export function handCrop(scan: GuideScan, aspect = 0.8): Box {
  const lm = scan.landmarks;
  if (!lm) return { x: 0, y: 0, w: scan.width, h: scan.height };
  const top = Math.min(...lm.map((p) => p[1]));
  return cropAround([...lm, [lm[12]![0], top - TYPE * 2]], 14, aspect, scan);
}

/** Where the finger creases run: an AREA across the four finger bases (between knuckle and first joint). */
export function fingerCreaseArea(scan: GuideScan): { cx: number; cy: number; rx: number; ry: number; rotate: number } | null {
  const lm = scan.landmarks;
  if (!lm) return null;
  const a = lerp(lm[5]!, lm[6]!, 0.4);
  const b = lerp(lm[17]!, lm[18]!, 0.4);
  const rotate = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return { cx: Math.round((a[0] + b[0]) / 2), cy: Math.round((a[1] + b[1]) / 2), rx: Math.round(len / 2 + 14), ry: 12, rotate: Math.round(rotate) };
}
