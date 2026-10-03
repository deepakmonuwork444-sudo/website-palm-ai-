/**
 * Measurements from one detected hand (pure maths, unit-tested with fixture
 * landmark sets). Everything is measured in the photo's own pixels, so a
 * stretched photo can never distort a ratio, and every result is a RATIO
 * (no centimetres: a photo has no scale).
 *
 * What each number is (landmark indices from landmarks.ts):
 * - palm length: wrist (0) to the middle finger's base knuckle (9);
 * - palm width: index base knuckle (5) to little-finger base knuckle (17);
 * - finger length: base knuckle → middle joint → top joint → tip, along the bones;
 * - "reach": how far a fingertip would reach up the hand's axis (wrist → 9) if
 *   the finger were held straight, i.e. where the tips end when the fingers
 *   lie together — the comparison palmists make by eye;
 * - thumb opening: the angle between the thumb (2 → 4) and the index finger's
 *   first bone (5 → 6);
 * - thumb set: how far up the palm the thumb's base knuckle (2) sits, as a
 *   share of the palm length;
 * - gaps: the angle between neighbouring fingers' first bones.
 *
 * Knuckle points are joint centres inside the hand, so these numbers are not
 * the ruler numbers a palmist takes from creases; the cut-offs that turn them
 * into words (hand-shape.ts, fingers.ts) were set on these same measurements.
 */

import { FINGER_POINTS, LM, type DetectedHand, type Finger, type Landmark } from './landmarks';

export interface Px {
  x: number;
  y: number;
}

export interface HandMeasures {
  palmLength: number;
  palmWidth: number;
  /** palmLength ÷ palmWidth. */
  palmRatio: number;
  fingers: Record<Finger, number>;
  thumb: number;
  /** Middle finger ÷ palm length. */
  fingerRatio: number;
  /** Index length ÷ ring length (knuckle to tip). */
  indexRingLength: number;
  /** (index reach − ring reach) ÷ palm length: > 0 the index tip reaches higher. */
  indexRingReach: number;
  /** (little tip reach − ring top-joint reach) ÷ palm length: ≥ 0 the little finger passes the ring's top joint. */
  littleReach: number;
  /** Thumb length ÷ index length. */
  thumbRatio: number;
  /** Degrees between the thumb and the index finger's first bone. */
  thumbAngle: number;
  /** Thumb base knuckle height ÷ palm length (higher = set nearer the fingers). */
  thumbSet: number;
  /** Degrees between neighbouring fingers' first bones. */
  gaps: { indexMiddle: number; middleRing: number; ringLittle: number };
  /** Straight-line ÷ along-the-bones length per finger (1 = straight). */
  straightness: Record<Finger, number>;
  /** True when the palm (not the back of the hand) faces the camera. */
  palmFacing: boolean;
  /** 2D palm ratio ÷ the model's 3D palm ratio (1 = held flat to the camera); null without 3D points. */
  flatness: number | null;
  /** Share of the 21 points that fall outside the photo (a cut-off hand). */
  outside: number;
  /** The hand's longest side ÷ the photo's longest side. */
  size: number;
}

export function toPx(points: readonly Landmark[], width: number, height: number): Px[] {
  return points.map((p) => ({ x: p.x * width, y: p.y * height }));
}

export function dist(a: Px, b: Px): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function dist3(a: Landmark, b: Landmark): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

/** Length along a chain of points. */
export function pathLength(points: readonly Px[], chain: readonly number[]): number {
  let total = 0;
  for (let i = 1; i < chain.length; i += 1) total += dist(points[chain[i - 1]!]!, points[chain[i]!]!);
  return total;
}

/** The unsigned angle in degrees (0–180) between two directions a1→a2 and b1→b2. */
export function angleBetween(a1: Px, a2: Px, b1: Px, b2: Px): number {
  const ax = a2.x - a1.x;
  const ay = a2.y - a1.y;
  const bx = b2.x - b1.x;
  const by = b2.y - b1.y;
  const la = Math.hypot(ax, ay);
  const lb = Math.hypot(bx, by);
  if (la === 0 || lb === 0) return 0;
  const cos = Math.min(1, Math.max(-1, (ax * bx + ay * by) / (la * lb)));
  return (Math.acos(cos) * 180) / Math.PI;
}

/** z-component of (b − o) × (c − o) in image coordinates (y down). */
export function cross(o: Px, b: Px, c: Px): number {
  return (b.x - o.x) * (c.y - o.y) - (b.y - o.y) * (c.x - o.x);
}

/**
 * Palm or back of the hand. In image coordinates (y down), a right palm
 * seen from the palm side has the index knuckle → little knuckle turn one
 * way and a right hand's back the other; a left hand mirrors both.
 * Checked on real photos (see DetectedHand.handedness).
 */
export function isPalmFacing(points: readonly Px[], handedness: 'Left' | 'Right'): boolean {
  const turn = cross(points[LM.WRIST]!, points[LM.INDEX_MCP]!, points[LM.LITTLE_MCP]!);
  return handedness === 'Right' ? turn < 0 : turn > 0;
}

/** How far up the hand's axis (wrist → middle knuckle) a point sits, in pixels. */
function heightOn(axisFrom: Px, unit: Px, p: Px): number {
  return (p.x - axisFrom.x) * unit.x + (p.y - axisFrom.y) * unit.y;
}

export function measureHand(hand: DetectedHand, width: number, height: number): HandMeasures {
  const p = toPx(hand.landmarks, width, height);
  const wrist = p[LM.WRIST]!;
  const palmLength = dist(wrist, p[LM.MIDDLE_MCP]!);
  const palmWidth = dist(p[LM.INDEX_MCP]!, p[LM.LITTLE_MCP]!);
  const len = (finger: Finger) => pathLength(p, FINGER_POINTS[finger]);
  const fingers: Record<Finger, number> = { index: len('index'), middle: len('middle'), ring: len('ring'), little: len('little') };
  const thumb = pathLength(p, [LM.THUMB_MCP, LM.THUMB_IP, LM.THUMB_TIP]);

  const safe = (a: number, b: number) => (b > 0 ? a / b : 0);
  const axis = { x: p[LM.MIDDLE_MCP]!.x - wrist.x, y: p[LM.MIDDLE_MCP]!.y - wrist.y };
  const axisLength = Math.hypot(axis.x, axis.y) || 1;
  const unit = { x: axis.x / axisLength, y: axis.y / axisLength };
  const h = (i: number) => heightOn(wrist, unit, p[i]!);
  const reach = (finger: Finger) => h(FINGER_POINTS[finger][0]) + fingers[finger];
  const ringTopJoint = h(LM.RING_MCP) + pathLength(p, [LM.RING_MCP, LM.RING_PIP, LM.RING_DIP]);

  const straight = (finger: Finger) => {
    const [a, , , d] = FINGER_POINTS[finger];
    return safe(dist(p[a]!, p[d]!), fingers[finger]);
  };
  const firstBone = (finger: Finger): [Px, Px] => [p[FINGER_POINTS[finger][0]]!, p[FINGER_POINTS[finger][1]]!];
  const gap = (a: Finger, b: Finger) => angleBetween(...firstBone(a), ...firstBone(b));

  let flatness: number | null = null;
  if (hand.world && hand.world.length === 21) {
    const w = hand.world;
    const ratio3d = safe(dist3(w[LM.WRIST]!, w[LM.MIDDLE_MCP]!), dist3(w[LM.INDEX_MCP]!, w[LM.LITTLE_MCP]!));
    flatness = ratio3d > 0 ? safe(palmLength, palmWidth) / ratio3d : null;
  }

  const xs = p.map((q) => q.x);
  const ys = p.map((q) => q.y);
  const outside = hand.landmarks.filter((q) => q.x < 0 || q.x > 1 || q.y < 0 || q.y > 1).length / hand.landmarks.length;
  const size = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) / Math.max(width, height);

  return {
    palmLength,
    palmWidth,
    palmRatio: safe(palmLength, palmWidth),
    fingers,
    thumb,
    fingerRatio: safe(fingers.middle, palmLength),
    indexRingLength: safe(fingers.index, fingers.ring),
    indexRingReach: safe(reach('index') - reach('ring'), palmLength),
    littleReach: safe(h(LM.LITTLE_MCP) + fingers.little - ringTopJoint, palmLength),
    thumbRatio: safe(thumb, fingers.index),
    thumbAngle: angleBetween(p[LM.THUMB_MCP]!, p[LM.THUMB_TIP]!, ...firstBone('index')),
    thumbSet: safe(h(LM.THUMB_MCP), palmLength),
    gaps: { indexMiddle: gap('index', 'middle'), middleRing: gap('middle', 'ring'), ringLittle: gap('ring', 'little') },
    straightness: { index: straight('index'), middle: straight('middle'), ring: straight('ring'), little: straight('little') },
    palmFacing: isPalmFacing(p, hand.handedness),
    flatness,
    outside,
    size,
  };
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * The part of the photo to show: the hand's bounding box plus `pad` of its
 * size on each side, kept inside the photo. A hand that is small in a wide
 * photo is then shown large enough to see the drawn points (the drawing
 * stays in the photo's own coordinates; only the view is cropped).
 */
export function handCrop(points: readonly Landmark[], width: number, height: number, pad = 0.18): Box {
  const xs = points.map((p) => Math.min(1, Math.max(0, p.x)) * width);
  const ys = points.map((p) => Math.min(1, Math.max(0, p.y)) * height);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const size = Math.max(maxX - minX, maxY - minY);
  const x0 = Math.max(0, minX - size * pad);
  const y0 = Math.max(0, minY - size * pad);
  const x1 = Math.min(width, maxX + size * pad);
  const y1 = Math.min(height, maxY + size * pad);
  return { x: x0, y: y0, w: Math.max(1, x1 - x0), h: Math.max(1, y1 - y0) };
}
