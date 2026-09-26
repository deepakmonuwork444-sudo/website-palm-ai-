// COPIED from palm-ai-new--feat-m1-foundation/src/features/lines/derived.ts at app commit 38389f51b74d (2026-09-26).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import type { CurvatureClass, Zone } from '../observation/taxonomy';

import { BAND_CONFIG, type Band } from './band-config';

/**
 * Geometry a palmist reads that the scanner's per-line classes miss, computed
 * deterministically from the traced polylines and the 21 hand landmarks.
 *
 * Why this exists (e2e audit, 2026-09-18, 12 real palms):
 * - The books' "curved / sloping head line" is about SLOPE toward the Moon;
 *   the scanner's curvature is BEND (chord ÷ arc). A straight but steeply
 *   sloping head line was read as "practical common sense".
 * - The books' "curved life line" is a line that "sweeps far out into the hand"
 *   (a wide Mount of Venus); a tight curve hugging the thumb was read as
 *   "outgoing, energetic" — the opposite.
 * - Heart-line endings were boxed by fixed u bands; on real hands the gap
 *   between index and middle finger sits near u 0.17, so endings between the
 *   fingers were read as "under the index finger".
 * - Head and life starts at the normal place (palm edge, between thumb and
 *   index) straddle the jupiter / mars_negative border at v = 0.20, so every
 *   palm got either "ambition" or "quick temper".
 * - Whether the head line is joined to the life line — the first thing a
 *   palmist checks — was not measured at all.
 *
 * Frame: the scanner's own palm frame (services/palm-lines/pipeline/palm_frame.py):
 * u along the knuckle line, 0 at the index knuckle (landmark 5), 1 at the
 * little-finger knuckle (17); v down the palm, 0 on the knuckle line, 1 at the
 * wrist (0). Lengths in palm widths. Pixel metric, so non-square photos work.
 *
 * Thresholds CALIBRATED 2026-09-18 (version 2026-09-18.2) on the hand-labelled
 * Roboflow palmistry_seg photos: every feature computed from the LABEL
 * polylines (truth, classed at book-defined boundaries in palm-frame units) and
 * from the SCANNER polylines; scanner cut-offs and dead bands fitted on train
 * (427) for correct - 2 x wrong, reported on test+valid (69). Report and
 * confusion tables: benchmark/derived-calibration-2026-09-18.md (script:
 * benchmark/derived-calibration/calibrate.mjs). The plain `classifyX` functions
 * return null in a dead band ("not read"). The `classifyXBanded` versions
 * (DEC-019, `BAND_CONFIG[...].useGap`) read a dead-band value as the NEAREST
 * class marked `borderline`, naming the other side as `altValue`, so a
 * borderline palm says "medium-to-long, borderline" rather than nothing or
 * something wrong; the cut-offs themselves are unchanged. Dataset photos only
 * (640 px, 11k Hands): recheck on phone photos.
 *
 * Pure: unit-tested in Node.
 */

export const DERIVED_GEOMETRY_VERSION = '2026-09-19.1';

export type Pt = readonly [number, number];

/** A class with its stability band; `altValue` is the neighbouring class when borderline. */
export interface BandedClass<T> {
  value: T;
  band: Band;
  altValue: T | null;
}

const firm = <T>(value: T): BandedClass<T> => ({ value, band: 'firm', altValue: null });

/**
 * A firmly classed value that sits within `margin` of a dead-band edge is
 * borderline: the class across that band is nearly as likely. `edges` lists
 * each dead-band edge on this class's side with the class across it.
 */
function nearEdge<T>(plain: T, x: number, margin: number, edges: readonly { at: number; across: T }[]): BandedClass<T> {
  let best: { d: number; across: T } | null = null;
  for (const edge of edges) {
    const d = Math.abs(x - edge.at);
    if (d <= margin && (best === null || d < best.d)) best = { d, across: edge.across };
  }
  return best ? { value: plain, band: 'borderline', altValue: best.across } : firm(plain);
}

/** A value strictly inside the dead band (lo, hi): the nearer side, borderline, the other side as the alternative. */
function gapFill<T>(x: number, lo: number, hi: number, below: T, above: T): BandedClass<T> {
  return x <= (lo + hi) / 2
    ? { value: below, band: 'borderline', altValue: above }
    : { value: above, band: 'borderline', altValue: below };
}

export interface PalmFrame {
  /** Normalised image point -> (u, v). */
  toUV(p: Pt): [number, number];
  /** Distance between two normalised image points, in palm widths. */
  dist(a: Pt, b: Pt): number;
  /** Unit vectors, in pixels: along the knuckle line and down the palm. */
  across: [number, number];
  down: [number, number];
  /** A normalised point in pixels. */
  px(p: Pt): [number, number];
  /** Palm width in pixels. */
  widthPx: number;
}

const INDEX_MCP = 5;
const MIDDLE_MCP = 9;
const PINKY_MCP = 17;
const WRIST = 0;

/** Same construction as the scanner. Null when the landmarks are missing or degenerate. */
export function palmFrame(landmarks: readonly Pt[] | undefined, imageW: number, imageH: number): PalmFrame | null {
  if (!landmarks || landmarks.length !== 21 || !(imageW > 0) || !(imageH > 0)) return null;
  const px = (p: Pt): [number, number] => [p[0] * imageW, p[1] * imageH];
  const o = px(landmarks[INDEX_MCP]!);
  const k = px(landmarks[PINKY_MCP]!);
  const w = px(landmarks[WRIST]!);
  const ax: [number, number] = [k[0] - o[0], k[1] - o[1]];
  const width = Math.hypot(ax[0], ax[1]);
  if (width < 1e-6) return null;
  const across: [number, number] = [ax[0] / width, ax[1] / width];
  let down: [number, number] = [-across[1], across[0]];
  if ((w[0] - o[0]) * down[0] + (w[1] - o[1]) * down[1] < 0) down = [-down[0], -down[1]];
  const length = (w[0] - o[0]) * down[0] + (w[1] - o[1]) * down[1];
  if (length < 1e-6) return null;
  return {
    px,
    widthPx: width,
    across,
    down,
    toUV(p) {
      const q = px(p);
      const r = [q[0] - o[0], q[1] - o[1]];
      return [(r[0]! * across[0] + r[1]! * across[1]) / width, (r[0]! * down[0] + r[1]! * down[1]) / length];
    },
    dist(a, b) {
      const p = px(a);
      const q = px(b);
      return Math.hypot(p[0] - q[0], p[1] - q[1]) / width;
    },
  };
}

// ------------------------------------------------------------------ zones --

/**
 * The scanner's zone boxes, copied from services/palm-lines/pipeline/ontology.json
 * (`zones.order`, version 2026-09-17.1). A test compares the two so they cannot drift.
 */
export const ZONE_BOXES: readonly { zone: Zone; u: readonly [number, number]; v: readonly [number, number] }[] = [
  { zone: 'wrist', u: [-9, 9], v: [0.85, 9] },
  { zone: 'jupiter', u: [-9, 0.22], v: [-9, 0.2] },
  { zone: 'between_jupiter_and_saturn', u: [0.22, 0.3], v: [-9, 0.3] },
  { zone: 'saturn', u: [0.3, 0.52], v: [-9, 0.3] },
  { zone: 'apollo', u: [0.52, 0.76], v: [-9, 0.3] },
  { zone: 'mercury', u: [0.76, 9], v: [-9, 0.3] },
  { zone: 'mars_negative', u: [-9, 0.25], v: [0.2, 0.5] },
  { zone: 'venus', u: [-9, 0.35], v: [0.5, 9] },
  { zone: 'mars_positive', u: [0.75, 9], v: [0.3, 0.6] },
  { zone: 'luna', u: [0.6, 9], v: [0.6, 9] },
];

/**
 * A start or end point closer than this (palm-frame units) to its zone's border is not read.
 * Calibrated 2026-09-18 (benchmark/derived-calibration-2026-09-18.md, endpoint zones):
 * head start, margin 0 -> 9 wrong zones of 289 (train); 0.02 -> 0 wrong on train and
 * test+valid; 0.04 only silenced 66 more palms without removing any error.
 */
export const ZONE_MARGIN = 0.02;

export function zoneOf(uv: readonly [number, number]): Zone {
  const [u, v] = uv;
  for (const box of ZONE_BOXES) {
    if (box.u[0] <= u && u < box.u[1] && box.v[0] <= v && v < box.v[1]) return box.zone;
  }
  return 'plain_of_mars';
}

/**
 * How far inside its zone a point sits: the distance to the nearest finite
 * edge of its box (edges at ±9 are the palm's own edge, not a neighbour).
 * For the fallback zone, the distance to the nearest box.
 */
export function zoneMargin(uv: readonly [number, number]): number {
  const [u, v] = uv;
  const zone = zoneOf(uv);
  if (zone === 'plain_of_mars') {
    let best = Infinity;
    for (const box of ZONE_BOXES) {
      const du = Math.max(box.u[0] - u, 0, u - box.u[1]);
      const dv = Math.max(box.v[0] - v, 0, v - box.v[1]);
      best = Math.min(best, Math.hypot(du, dv));
    }
    return best;
  }
  const box = ZONE_BOXES.find((b) => b.zone === zone)!;
  const edges = [
    box.u[0] > -9 ? u - box.u[0] : Infinity,
    box.u[1] < 9 ? box.u[1] - u : Infinity,
    box.v[0] > -9 ? v - box.v[0] : Infinity,
    box.v[1] < 9 ? box.v[1] - v : Infinity,
  ];
  return Math.min(...edges);
}

/**
 * The palm's own thumb-side edge sits a little beyond the index knuckle. A
 * line starting at u below this is at the edge between thumb and index — the
 * ordinary start of the head and life lines — not ON the Mount of Jupiter
 * (book boundary: inside the index knuckle, u >= 0; 79% of labelled head lines
 * start outside it).
 */
export const JUPITER_MOUNT_MIN_U = 0;
/**
 * Whether a head or life start in the Jupiter box is read as "on Jupiter" at all.
 * 2026-09-18 benchmark (benchmark/derived-calibration-2026-09-18.md): the best
 * scanner cut (u >= 0.10, dead band 0.02-0.10) found 9 of 64 labelled on-Jupiter
 * head starts on train with 10 false ones (precision 47%), 1 of 4 right on
 * test+valid. Not readable: every Jupiter-box start is reported as the palm edge.
 */
export const JUPITER_START_READABLE = false;
/**
 * Whether the life line's END zone is read. 2026-09-18 benchmark: scanner and
 * label end zones agree on 85 of 253 train palms (34%) and 15 of 46 test+valid;
 * the scanner's life line stops short of, or runs past, the labelled end.
 */
export const LIFE_END_ZONE_READABLE = false;

// ------------------------------------------------------------- geometry --

function distToPolyline(frame: PalmFrame, p: Pt, path: readonly Pt[]): number {
  let best = Infinity;
  for (let i = 0; i < path.length; i++) {
    best = Math.min(best, frame.dist(p, path[i]!));
    if (i > 0) {
      // Point-to-segment in pixels.
      const a = frame.px(path[i - 1]!);
      const b = frame.px(path[i]!);
      const q = frame.px(p);
      const ab = [b[0] - a[0], b[1] - a[1]];
      const len2 = ab[0]! * ab[0]! + ab[1]! * ab[1]!;
      if (len2 > 0) {
        const t = Math.max(0, Math.min(1, ((q[0] - a[0]) * ab[0]! + (q[1] - a[1]) * ab[1]!) / len2));
        const c = [a[0] + t * ab[0]!, a[1] + t * ab[1]!];
        best = Math.min(best, Math.hypot(q[0] - c[0]!, q[1] - c[1]!) / frame.widthPx);
      }
    }
  }
  return best;
}

/**
 * Head–life start gap, palm widths. When the two lines are joined, the
 * segmentation gives the shared start to one line only, so the other line's
 * traced start is its branch point ON the first line: the gap is the smaller
 * of "life start to head line" and "head start to life line".
 */
export function headLifeGap(frame: PalmFrame, head: readonly Pt[], life: readonly Pt[]): number | null {
  if (head.length < 2 || life.length < 2) return null;
  return Math.min(distToPolyline(frame, life[0]!, head), distToPolyline(frame, head[0]!, life));
}

export type HeadLifeJoin = 'joined' | 'separate' | 'wide';
/**
 * Joined at or below; separate from `SEPARATE_MIN` up to `SEPARATE_MAX`; wide from `WIDE_MIN`. Gaps between are not read.
 * Calibrated 2026-09-18 (benchmark/derived-calibration-2026-09-18.md): the books'
 * "joined" = the starts touch; labelled gaps are bimodal with the valley at
 * 0.03-0.05 palm widths (book boundary 0.04). The scanner never reports a gap
 * below ~0.03 even for joined lines (it hands the shared start to one line), so
 * its cut sits higher: joined <= 0.055, dead band 0.055-0.075. Agreement on read
 * palms: train 156/179 (87%), test+valid 23/31 (74%). "Wide" (a marked space)
 * never occurred: no labelled gap reached 0.18 in 410 palms, so 0.20 is a guard,
 * NOT verified.
 */
export const JOINED_MAX = 0.055;
export const SEPARATE_MIN = 0.075;
export const SEPARATE_MAX = 0.2;
export const WIDE_MIN = 0.2;

export function classifyHeadLifeJoin(gap: number | null): HeadLifeJoin | null {
  if (gap === null || !Number.isFinite(gap)) return null;
  if (gap <= JOINED_MAX) return 'joined';
  if (gap >= SEPARATE_MIN && gap < SEPARATE_MAX) return 'separate';
  if (gap >= WIDE_MIN) return 'wide';
  return null;
}

/** As `classifyHeadLifeJoin`, with the joined / separate dead band read as borderline. */
export function classifyHeadLifeJoinBanded(gap: number | null): BandedClass<HeadLifeJoin> | null {
  const plain = classifyHeadLifeJoin(gap);
  if (plain && gap !== null) {
    return nearEdge<HeadLifeJoin>(plain, gap, BAND_CONFIG['derived.headLifeJoin'].edgeMargin, [
      ...(plain === 'joined' ? [{ at: JOINED_MAX, across: 'separate' as const }] : []),
      ...(plain === 'separate' ? [{ at: SEPARATE_MIN, across: 'joined' as const }, { at: SEPARATE_MAX, across: 'wide' as const }] : []),
      ...(plain === 'wide' ? [{ at: WIDE_MIN, across: 'separate' as const }] : []),
    ]);
  }
  if (gap === null || !Number.isFinite(gap) || !BAND_CONFIG['derived.headLifeJoin'].useGap) return null;
  if (gap > JOINED_MAX && gap < SEPARATE_MIN) return gapFill(gap, JOINED_MAX, SEPARATE_MIN, 'joined', 'separate');
  return null;
}

/** Head line slope: angle of its start->end chord below the knuckle line, degrees (positive = toward the wrist). */
export function headSlopeDeg(frame: PalmFrame, head: readonly Pt[]): number | null {
  if (head.length < 2) return null;
  const s = frame.px(head[0]!);
  const e = frame.px(head[head.length - 1]!);
  const d = [e[0] - s[0], e[1] - s[1]];
  const along = d[0]! * frame.across[0] + d[1]! * frame.across[1];
  const down = d[0]! * frame.down[0] + d[1]! * frame.down[1];
  if (Math.abs(along) < 1e-9 && Math.abs(down) < 1e-9) return null;
  return (Math.atan2(down, Math.abs(along)) * 180) / Math.PI;
}

/**
 * Straight across below this slope (and barely bent); slightly sloping in the band; very sloping from `HEAD_VERY_SLOPING_DEG`.
 * Calibrated 2026-09-18 (benchmark/derived-calibration-2026-09-18.md). Book
 * boundaries, from the median labelled head line (start u -0.07 v 0.13, span 0.91
 * palm widths, palm length/width 1.34): <= 14 deg ends at the top of Upper Mars
 * ("straight across"); >= 26 deg ends in the lower half of Upper Mars, heading
 * into the Moon. Labelled slopes are unimodal (p5 12, p50 19, p95 28) and the
 * scanner's slope error is ~4 deg (p80), so "straight" cannot be told apart: the
 * fitted scanner cut reads it only at <= 6.5 deg, which no palm reached. Gently
 * sloping — the books' ordinary head line — is 78% of labelled palms. Agreement
 * on read palms: train 223/255 (87%), test+valid 34/38 (89%).
 */
export const HEAD_STRAIGHT_MAX_DEG = 6.5;
/** The scanner's chord/arc runs lower than the labels' (p50 0.94 vs 0.99): 0.95 blocked most straight traces. */
export const HEAD_STRAIGHT_MIN_CHORD_ARC = 0.9;
export const HEAD_SLOPING_MIN_DEG = 13.5;
export const HEAD_SLOPING_MAX_DEG = 25.5;
export const HEAD_VERY_SLOPING_DEG = 25.5;

/**
 * The head line's shape as the books mean it: straight across, gently
 * sloping, or strongly sloping toward the Moon. Bend alone does not decide it.
 */
export function classifyHeadShape(slopeDeg: number | null, chordArcRatio: number | null): CurvatureClass | null {
  if (slopeDeg === null) return null;
  if (slopeDeg >= HEAD_VERY_SLOPING_DEG) return 'curved';
  if (slopeDeg >= HEAD_SLOPING_MIN_DEG && slopeDeg < HEAD_SLOPING_MAX_DEG) return 'gentle';
  if (slopeDeg <= HEAD_STRAIGHT_MAX_DEG && (chordArcRatio ?? 0) >= HEAD_STRAIGHT_MIN_CHORD_ARC) return 'straight';
  return null;
}

/**
 * As `classifyHeadShape`, with the straight / sloping dead band read as
 * borderline. "Straight" still needs a barely bent line: a bent line in the
 * band is borderline sloping with no alternative, and a flat but bent line
 * stays unread (that is not a gap).
 */
export function classifyHeadShapeBanded(slopeDeg: number | null, chordArcRatio: number | null): BandedClass<CurvatureClass> | null {
  const plain = classifyHeadShape(slopeDeg, chordArcRatio);
  if (plain && slopeDeg !== null) {
    return nearEdge<CurvatureClass>(plain, slopeDeg, BAND_CONFIG['derived.headSlope'].edgeMargin, [
      ...(plain === 'straight' ? [{ at: HEAD_STRAIGHT_MAX_DEG, across: 'gentle' as const }] : []),
      ...(plain === 'gentle' ? [{ at: HEAD_SLOPING_MIN_DEG, across: 'straight' as const }, { at: HEAD_SLOPING_MAX_DEG, across: 'curved' as const }] : []),
      ...(plain === 'curved' ? [{ at: HEAD_VERY_SLOPING_DEG, across: 'gentle' as const }] : []),
    ]);
  }
  if (slopeDeg === null || !Number.isFinite(slopeDeg) || !BAND_CONFIG['derived.headSlope'].useGap) return null;
  if (slopeDeg > HEAD_STRAIGHT_MAX_DEG && slopeDeg < HEAD_SLOPING_MIN_DEG) {
    const straightPossible = (chordArcRatio ?? 0) >= HEAD_STRAIGHT_MIN_CHORD_ARC;
    const filled = gapFill<CurvatureClass>(slopeDeg, HEAD_STRAIGHT_MAX_DEG, HEAD_SLOPING_MIN_DEG, 'straight', 'gentle');
    if (straightPossible) return filled;
    return { value: 'gentle', band: 'borderline', altValue: null };
  }
  return null;
}

/**
 * Life-line reach: how far across the palm the line sweeps at mid-palm
 * (v = 0.5), as a multiple of the middle finger's position (u of landmark 9).
 * 1.0 = the line passes straight below the middle finger.
 */
export function lifeReach(frame: PalmFrame, life: readonly Pt[], middleKnuckle: Pt): number | null {
  if (life.length < 2) return null;
  const middleU = frame.toUV(middleKnuckle)[0];
  if (!(middleU > 0.05)) return null;
  const uv = life.map((p) => frame.toUV(p));
  for (let i = 1; i < uv.length; i++) {
    const [u0, v0] = uv[i - 1]!;
    const [u1, v1] = uv[i]!;
    if ((v0 - 0.5) * (v1 - 0.5) <= 0 && v1 !== v0) {
      const u = u0 + ((u1 - u0) * (0.5 - v0)) / (v1 - v0);
      return u / middleU;
    }
  }
  return null;
}

/**
 * Hugs the thumb at or below; sweeps wide from `LIFE_WIDE_MIN`; medium between the dead bands.
 * Calibrated 2026-09-18 (benchmark/derived-calibration-2026-09-18.md). The books
 * compare arcs (narrow vs wide Mount of Venus) without a fixed position, and the
 * labelled reach is unimodal (p25 1.53, p50 1.72, p75 1.95), so the classes are
 * the narrowest and widest quarters (book boundaries 1.55 / 1.95). The scanner's
 * reach is within 0.04 of the label's on 80% of palms. Agreement on read palms:
 * train 216/219 (99%), test+valid 38/39 (97%); the old values agreed on 7 of 38.
 */
export const LIFE_NARROW_MAX = 1.525;
export const LIFE_MEDIUM_MIN = 1.575;
export const LIFE_MEDIUM_MAX = 1.925;
export const LIFE_WIDE_MIN = 1.975;
/** Beyond this the crease runs out across the palm, not around the thumb: not read as a life-line arc. Longest labelled reach on train: 2.39. */
export const LIFE_REACH_MAX = 2.4;

/** Life arc as the books mean "curved" (sweeping into the palm) vs "straight" (narrowing Venus). */
export function classifyLifeArc(reach: number | null): CurvatureClass | null {
  if (reach === null || !Number.isFinite(reach)) return null;
  if (reach > LIFE_REACH_MAX) return null;
  if (reach <= LIFE_NARROW_MAX) return 'straight';
  if (reach >= LIFE_WIDE_MIN) return 'curved';
  if (reach >= LIFE_MEDIUM_MIN && reach <= LIFE_MEDIUM_MAX) return 'gentle';
  return null;
}

/** As `classifyLifeArc`, with both dead bands read as borderline. A reach past `LIFE_REACH_MAX` stays unread. */
export function classifyLifeArcBanded(reach: number | null): BandedClass<CurvatureClass> | null {
  const plain = classifyLifeArc(reach);
  if (plain && reach !== null) {
    return nearEdge<CurvatureClass>(plain, reach, BAND_CONFIG['derived.lifeReach'].edgeMargin, [
      ...(plain === 'straight' ? [{ at: LIFE_NARROW_MAX, across: 'gentle' as const }] : []),
      ...(plain === 'gentle' ? [{ at: LIFE_MEDIUM_MIN, across: 'straight' as const }, { at: LIFE_MEDIUM_MAX, across: 'curved' as const }] : []),
      ...(plain === 'curved' ? [{ at: LIFE_WIDE_MIN, across: 'gentle' as const }] : []),
    ]);
  }
  if (reach === null || !Number.isFinite(reach) || !BAND_CONFIG['derived.lifeReach'].useGap) return null;
  if (reach > LIFE_NARROW_MAX && reach < LIFE_MEDIUM_MIN) return gapFill<CurvatureClass>(reach, LIFE_NARROW_MAX, LIFE_MEDIUM_MIN, 'straight', 'gentle');
  if (reach > LIFE_MEDIUM_MAX && reach < LIFE_WIDE_MIN) return gapFill<CurvatureClass>(reach, LIFE_MEDIUM_MAX, LIFE_WIDE_MIN, 'gentle', 'curved');
  return null;
}

/**
 * Where the heart line ends across the fingers: 0 under the index finger's
 * centre, 1 under the middle finger's centre (from this hand's own knuckles).
 */
export function heartEndPosition(frame: PalmFrame, heart: readonly Pt[], middleKnuckle: Pt): number | null {
  if (heart.length < 2) return null;
  const middleU = frame.toUV(middleKnuckle)[0];
  if (!(middleU > 0.05)) return null;
  return frame.toUV(heart[heart.length - 1]!)[0] / middleU;
}

/**
 * Calibrated 2026-09-18 (benchmark/derived-calibration-2026-09-18.md). Book
 * boundaries: t 0.5 is the gap between index and middle finger; "between" =
 * within 0.1 of it, under the index below 0.4, under the middle finger from 0.6.
 * The scanner ends ~0.1 further toward the middle finger than the label (median),
 * typical error 0.15, hence the shifted cuts and dead bands. Agreement on read
 * palms: train 220/262 (84%), test+valid 32/41 (78%).
 */
export const HEART_INDEX_MAX = 0.45;
export const HEART_BETWEEN_MIN = 0.5;
export const HEART_BETWEEN_MAX = 0.55;
export const HEART_MIDDLE_MIN = 0.7;
/** Past the middle finger's centre the line still ends under it until the ring finger. */
export const HEART_MIDDLE_MAX = 1.45;

export function classifyHeartEnd(t: number | null): Zone | null {
  if (t === null || !Number.isFinite(t)) return null;
  if (t <= HEART_INDEX_MAX) return 'jupiter';
  if (t >= HEART_BETWEEN_MIN && t <= HEART_BETWEEN_MAX) return 'between_jupiter_and_saturn';
  if (t >= HEART_MIDDLE_MIN && t <= HEART_MIDDLE_MAX) return 'saturn';
  return null;
}

/** As `classifyHeartEnd`, with both dead bands read as borderline. An ending past the middle finger stays unread. */
export function classifyHeartEndBanded(t: number | null): BandedClass<Zone> | null {
  const plain = classifyHeartEnd(t);
  if (plain && t !== null) {
    return nearEdge<Zone>(plain, t, BAND_CONFIG['derived.heartEnd'].edgeMargin, [
      ...(plain === 'jupiter' ? [{ at: HEART_INDEX_MAX, across: 'between_jupiter_and_saturn' as const }] : []),
      ...(plain === 'between_jupiter_and_saturn' ? [{ at: HEART_BETWEEN_MIN, across: 'jupiter' as const }, { at: HEART_BETWEEN_MAX, across: 'saturn' as const }] : []),
      ...(plain === 'saturn' ? [{ at: HEART_MIDDLE_MIN, across: 'between_jupiter_and_saturn' as const }] : []),
    ]);
  }
  if (t === null || !Number.isFinite(t) || !BAND_CONFIG['derived.heartEnd'].useGap) return null;
  if (t > HEART_INDEX_MAX && t < HEART_BETWEEN_MIN) return gapFill<Zone>(t, HEART_INDEX_MAX, HEART_BETWEEN_MIN, 'jupiter', 'between_jupiter_and_saturn');
  if (t > HEART_BETWEEN_MAX && t < HEART_MIDDLE_MIN) return gapFill<Zone>(t, HEART_BETWEEN_MAX, HEART_MIDDLE_MIN, 'between_jupiter_and_saturn', 'saturn');
  return null;
}

// ----------------------------------------------------------------- fate --

/**
 * Fate start / end zones are read only this far (palm-frame units) inside their
 * zone, wider than ZONE_MARGIN. PROVISIONAL, 2026-09-19: palm4 fate traces vs the
 * labelled fate polylines on palmistry_seg test+valid (66 lines, also palm4's
 * early-stopping set): margin 0.02 -> start zone agrees 42/54, end 40/50;
 * 0.04 -> start 29/36 (81%), end 18/20 (90%). Not checked on phone photos.
 */
export const FATE_ZONE_MARGIN = 0.04;
/**
 * Fate start on the life line (the books' "rising from the life line") vs a
 * separate start, palm widths from the fate start to the traced life line.
 * UNCALIBRATED (no labelled "from life" set): borrowed from the head–life join
 * cut (JOINED_MAX), dead band 0.055-0.1. Kept for the audit trail and Report V2;
 * no rule reads it, and merge.ts keeps it below every rule floor.
 */
export const FATE_FROM_LIFE_MAX = 0.055;
export const FATE_SEPARATE_MIN = 0.1;
export type FateLifeStart = 'from_life' | 'separate';

export function classifyFateLifeStart(gap: number | null): FateLifeStart | null {
  if (gap === null || !Number.isFinite(gap)) return null;
  if (gap <= FATE_FROM_LIFE_MAX) return 'from_life';
  if (gap >= FATE_SEPARATE_MIN) return 'separate';
  return null;
}

/** As `classifyFateLifeStart`, with the dead band read as borderline (still uncalibrated, still not read by rules). */
export function classifyFateLifeStartBanded(gap: number | null): BandedClass<FateLifeStart> | null {
  const plain = classifyFateLifeStart(gap);
  if (plain && gap !== null) {
    return nearEdge<FateLifeStart>(plain, gap, BAND_CONFIG['derived.fateLifeStart'].edgeMargin, [
      plain === 'from_life' ? { at: FATE_FROM_LIFE_MAX, across: 'separate' } : { at: FATE_SEPARATE_MIN, across: 'from_life' },
    ]);
  }
  if (gap === null || !Number.isFinite(gap) || !BAND_CONFIG['derived.fateLifeStart'].useGap) return null;
  if (gap > FATE_FROM_LIFE_MAX && gap < FATE_SEPARATE_MIN) return gapFill<FateLifeStart>(gap, FATE_FROM_LIFE_MAX, FATE_SEPARATE_MIN, 'from_life', 'separate');
  return null;
}

// -------------------------------------------------------------- summary --

export interface EndpointRead {
  /** The zone to read, or null when the point is too close to a border to say. */
  zone: Zone | null;
  /** Why the scanner's zone was not kept as-is. */
  reason: 'ok' | 'border' | 'palm_edge' | 'joined_start' | 'anatomical' | 'partial' | 'unreliable';
}

export interface DerivedGeometry {
  version: string;
  /** Numbers, for the audit trail. Null when a line was not traced. */
  measures: {
    headLifeGap: number | null;
    headSlopeDeg: number | null;
    lifeReach: number | null;
    heartEndPosition: number | null;
    /** Fate start to the traced life line, palm widths. Optional: absent before 2026-09-19. */
    fateLifeGap?: number | null;
  };
  /** Nearest class; inside a dead band it is `borderline` in `bands` (DEC-019). */
  headLifeJoin: HeadLifeJoin | null;
  headShape: CurvatureClass | null;
  lifeArc: CurvatureClass | null;
  /** Fate start on the life line or apart from it (uncalibrated, not read by rules). */
  fateLifeStart: FateLifeStart | null;
  /** Start / end zone decisions per traced line. */
  endpoints: Partial<Record<TracedLine, { start: EndpointRead; end: EndpointRead }>>;
  /**
   * Stability band of each class above, plus the heart ending (its class is
   * `endpoints.heart.end.zone`). Null where the class is null.
   */
  bands: {
    headLifeJoin: BandInfo<HeadLifeJoin> | null;
    headShape: BandInfo<CurvatureClass> | null;
    lifeArc: BandInfo<CurvatureClass> | null;
    heartEnd: BandInfo<Zone> | null;
    fateLifeStart: BandInfo<FateLifeStart> | null;
  };
}

export type BandInfo<T> = Pick<BandedClass<T>, 'band' | 'altValue'>;

const bandInfo = <T>(banded: BandedClass<T> | null): BandInfo<T> | null =>
  banded ? { band: banded.band, altValue: banded.altValue } : null;

export type TracedLine = 'heart' | 'head' | 'life' | 'fate';

export interface TracedLineInput {
  path: readonly Pt[];
  chordArcRatio: number | null;
  /** Not traced end to end: its ends, slope and start gap say nothing. */
  partial?: boolean;
  startZone: Zone | null;
  endZone: Zone | null;
}

function endpointRead(frame: PalmFrame, point: Pt, scannerZone: Zone | null, margin = ZONE_MARGIN): EndpointRead {
  const uv = frame.toUV(point);
  const zone = scannerZone ?? zoneOf(uv);
  if (zoneMargin(uv) < margin) return { zone: null, reason: 'border' };
  return { zone, reason: 'ok' };
}

/**
 * Everything above, for the lines the scanner accepted. `lines` holds only
 * accepted (named, traced) lines; missing ones give null features.
 */
export function deriveGeometry(
  landmarks: readonly Pt[] | undefined,
  image: { width: number; height: number },
  lines: Partial<Record<TracedLine, TracedLineInput>>,
): DerivedGeometry | null {
  const frame = palmFrame(landmarks, image.width, image.height);
  if (!frame || !landmarks) return null;
  const middle = landmarks[MIDDLE_MCP]!;
  const { heart, head, life, fate } = lines;

  // A partial line's traced ends are not the line's ends: no gap, slope or ending
  // is read from it — nor the life arc: a partial "life line" may be another crease.
  const whole = (l: TracedLineInput | undefined) => (l && !l.partial ? l : undefined);
  const gap = whole(head) && whole(life) ? headLifeGap(frame, head!.path, life!.path) : null;
  const joinBanded = classifyHeadLifeJoinBanded(gap);
  const join = joinBanded?.value ?? null;
  const slope = whole(head) ? headSlopeDeg(frame, head!.path) : null;
  const reach = whole(life) ? lifeReach(frame, life!.path, middle) : null;
  const heartT = whole(heart) ? heartEndPosition(frame, heart!.path, middle) : null;
  const partialEnds = { start: { zone: null, reason: 'partial' }, end: { zone: null, reason: 'partial' } } as const;

  const endpoints: DerivedGeometry['endpoints'] = {};
  const heartEnd = heart?.partial ? null : classifyHeartEndBanded(heartT);
  if (heart?.partial) endpoints.heart = partialEnds;
  else if (heart) {
    const anatomical = heartEnd?.value ?? null;
    endpoints.heart = {
      start: endpointRead(frame, heart.path[0]!, heart.startZone),
      // Endings under the fingers are read against this hand's own knuckles.
      end: { zone: anatomical, reason: anatomical ? 'anatomical' : 'border' },
    };
  }
  for (const [type, line] of [
    ['head', head],
    ['life', life],
  ] as const) {
    if (!line) continue;
    if (line.partial) {
      endpoints[type] = partialEnds;
      continue;
    }
    let start = endpointRead(frame, line.path[0]!, line.startZone);
    const startU = frame.toUV(line.path[0]!)[0];
    if (start.zone === 'jupiter' && (!JUPITER_START_READABLE || startU < JUPITER_MOUNT_MIN_U)) {
      start = { zone: null, reason: 'palm_edge' };
    }
    // A life line joined to the head line: its own start is hidden in the shared start.
    if (type === 'life' && join === 'joined') start = { zone: null, reason: 'joined_start' };
    const end: EndpointRead =
      type === 'life' && !LIFE_END_ZONE_READABLE
        ? { zone: null, reason: 'unreliable' }
        : endpointRead(frame, line.path[line.path.length - 1]!, line.endZone);
    endpoints[type] = { start, end };
  }

  // Fate: zones read with a wider border margin; no end is read from a partial trace.
  if (fate?.partial) endpoints.fate = partialEnds;
  else if (fate) {
    endpoints.fate = {
      start: endpointRead(frame, fate.path[0]!, fate.startZone, FATE_ZONE_MARGIN),
      end: endpointRead(frame, fate.path[fate.path.length - 1]!, fate.endZone, FATE_ZONE_MARGIN),
    };
  }
  const fateGap = whole(fate) && life && life.path.length >= 2 ? distToPolyline(frame, fate!.path[0]!, life.path) : null;

  const round = (n: number | null) => (n === null || !Number.isFinite(n) ? null : Math.round(n * 1000) / 1000);
  const headShape = head ? classifyHeadShapeBanded(slope, head.chordArcRatio) : null;
  const lifeArc = classifyLifeArcBanded(reach);
  const fateLifeStart = classifyFateLifeStartBanded(fateGap);
  return {
    version: DERIVED_GEOMETRY_VERSION,
    measures: {
      headLifeGap: round(gap),
      headSlopeDeg: slope === null ? null : Math.round(slope * 10) / 10,
      lifeReach: round(reach),
      heartEndPosition: round(heartT),
      ...(fate ? { fateLifeGap: round(fateGap) } : {}),
    },
    headLifeJoin: join,
    headShape: headShape?.value ?? null,
    lifeArc: lifeArc?.value ?? null,
    fateLifeStart: fateLifeStart?.value ?? null,
    endpoints,
    bands: {
      headLifeJoin: bandInfo(joinBanded),
      headShape: bandInfo(headShape),
      lifeArc: bandInfo(lifeArc),
      heartEnd: bandInfo(heartEnd),
      fateLifeStart: bandInfo(fateLifeStart),
    },
  };
}
