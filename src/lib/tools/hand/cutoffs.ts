/**
 * The cut-offs that turn photo measurements (measure.ts) into words.
 *
 * Where they come from (2026-09-26): MediaPipe's hand model was run on the
 * 496 open-palm photos of the public "Palmistry_seg" set (Roboflow, CC BY 4.0,
 * kept in the app repo's dataset/raw/palmistry_seg for the line benchmark); it
 * found one hand in 485. Measured with measure.ts:
 *
 *   palm length ÷ width        p33 1.51  p50 1.55  p67 1.60
 *   middle finger ÷ palm       p33 0.84  p50 0.87  p67 0.90
 *   index ÷ ring (knuckle–tip) p25 0.955 p50 0.978 p75 1.00
 *   little ÷ ring              p25 0.79  p50 0.81  p75 0.83
 *   thumb ÷ index              p33 0.71  p50 0.74  p67 0.76
 *   gaps (°) p80: index–middle 14.4, middle–ring 9.6, ring–little 19.0
 *
 * Palm shape and finger length have no fixed scale in the books ("square",
 * "long" are judged by eye), so the middle third of those 485 palms is
 * reported as "between two types", never forced. Angles (thumb) are absolute.
 * Index vs ring uses a ±2 % "about equal" band, about the model's point noise.
 * All of these are stated on the tool pages; change them there too.
 */

export const CALIBRATION = {
  photos: 485,
  set: 'Palmistry_seg (Roboflow, CC BY 4.0)',
  date: '2026-09-26',
} as const;

export const CUT = {
  /** palm length ÷ width: ≤ square, ≥ long. */
  palm: { square: 1.5, long: 1.6 },
  /** middle finger ÷ palm length: ≤ short, ≥ long. */
  fingers: { short: 0.84, long: 0.9 },
  /** index ÷ ring length: < ring longer, > index longer. */
  indexRing: { ringLonger: 0.98, indexLonger: 1.02 },
  /** little ÷ ring length: ≤ short, ≥ long. */
  little: { short: 0.79, long: 0.83 },
  /** thumb ÷ index length: ≤ short, ≥ long. */
  thumbLength: { short: 0.71, long: 0.77 },
  /** degrees between thumb and index: < close, ≥ wide. */
  thumbAngle: { close: 25, wide: 60 },
  /** degrees between neighbouring fingers: all < together = held together; ≥ wide per gap. */
  gaps: { together: 5, wide: { indexMiddle: 14, middleRing: 10, ringLittle: 19 } },
} as const;

/** Photo checks before any measurement is trusted. */
export const CHECK = {
  /** A finger whose straight-line ÷ along-the-bones length is below this is bent. */
  straight: 0.9,
  /** Palm length in pixels below this is too small to measure. */
  minPalmPx: 60,
  /** Hand's longest side ÷ photo's longest side below this: "move closer" (a warning, not a stop). */
  smallHand: 0.3,
} as const;
