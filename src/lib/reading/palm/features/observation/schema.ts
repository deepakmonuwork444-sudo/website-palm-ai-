// COPIED from palm-ai-new--feat-m1-foundation/src/features/observation/schema.ts at app commit 38389f51b74d (2026-09-26).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import { z } from 'zod';

import {
  CONTINUITY_CLASSES,
  CURVATURE_CLASSES,
  DEPTH_CLASSES,
  HAND_SIDES,
  LENGTH_CLASSES,
  LINE_TYPES,
  MARK_KINDS,
  MOUNT_TYPES,
  PALM_SHAPES,
  PROMINENCE_CLASSES,
  QUALITY_ISSUES,
  ZONES,
} from './taxonomy';

export const PALM_OBSERVATION_SCHEMA_VERSION = 1;

export const confidence = z.number().min(0).max(1);

/**
 * Every observed attribute is a value plus a confidence, and the value may be
 * null. `null` means "I could not see this" and is a first-class answer — the
 * whole architecture depends on a model being able to say it.
 */
function observed<T extends z.ZodTypeAny>(value: T) {
  return z.object({
    value: value.nullable(),
    /** The raw model / scanner confidence. Never mutated by the app (DEC-019). */
    confidence,
    /**
     * Stability band (DEC-019, `lines/bands.ts`): `firm` = the measurement sits
     * clear of every class cut-off; `borderline` = within the configured gap of
     * a cut-off, so the neighbouring class (`altValue`) is nearly as likely;
     * absent = `unknown` (older observations, AI-described values). Only firm
     * evidence may open a life area or enter the Palm Story.
     */
    band: z.enum(STABILITY_BANDS).optional(),
    /** The neighbouring class when `band` is `borderline`. */
    altValue: value.nullable().optional(),
    /**
     * What rule matching uses instead of `confidence` when set (a damped value
     * for borderline evidence). Internal; never shown to the user.
     */
    effectiveConfidence: confidence.optional(),
  });
}

/** `unknown` is the absent band: older observations and AI-described values. */
export const STABILITY_BANDS = ['firm', 'borderline'] as const;
export type StabilityBand = (typeof STABILITY_BANDS)[number] | 'unknown';

export type Observed<T> = {
  value: T | null;
  confidence: number;
  band?: (typeof STABILITY_BANDS)[number];
  altValue?: T | null;
  effectiveConfidence?: number;
};

/** The band of an attribute, with absence read as `unknown` (never as firm). */
export function bandOf(attribute: { band?: string | undefined } | null | undefined): StabilityBand {
  return attribute?.band === 'firm' || attribute?.band === 'borderline' ? attribute.band : 'unknown';
}

/**
 * Which hand the person uses most, as they told us (DEC-014). `unknown` is a
 * first-class answer: it never becomes "non-dominant".
 */
export const DOMINANT_HANDS = ['left', 'right', 'both', 'unknown'] as const;
export type DominantHand = (typeof DOMINANT_HANDS)[number];
export const DOMINANCES = ['dominant', 'non_dominant', 'ambidextrous', 'unknown'] as const;
export type Dominance = (typeof DOMINANCES)[number];

/** Normalised 0..1 box, so it survives any resize or crop. */
export const regionSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  w: z.number().min(0).max(1),
  h: z.number().min(0).max(1),
});
export type Region = z.infer<typeof regionSchema>;

/** Normalised [x, y] on the analysed photo, origin top-left. */
export const pointSchema = z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)]);
export type PalmPoint = z.infer<typeof pointSchema>;

export const markSchema = z.object({
  kind: z.enum(MARK_KINDS),
  count: z.number().int().min(1).max(20),
  confidence,
  zone: z.enum(ZONES).nullable(),
  region: regionSchema.nullable(),
  /** Where the mark sits. Optional: observations saved before v2 have none. */
  point: pointSchema.optional(),
});
export type MarkObservation = z.infer<typeof markSchema>;

/** A normalised point that may sit a hair outside the photo (a crease running to the edge). */
const evidencePointSchema = z.tuple([z.number(), z.number()]);

/**
 * The line scanner's raw measurements for one heart, head, life or (palm4
 * scanner, 2026-09-19+) fate line, kept
 * with the observation so every statement in a report can be traced back to
 * the pixels it came from. Field names follow the service response.
 */
export const lineEvidenceSchema = z.object({
  /** The name the geometry supports: the line itself, or 'unknown' when it failed the ontology checks. */
  label: z.enum(['heart', 'head', 'life', 'fate', 'unknown']),
  modelClass: z.enum(['heart', 'head', 'life', 'fate']),
  present: z.boolean(),
  pixelConfidence: confidence,
  semanticConfidence: confidence,
  normalizedLength: z.number().min(0).nullable(),
  lengthClass: z.enum(LENGTH_CLASSES).nullable(),
  curvature: z
    .object({ chordArcRatio: z.number(), netTurningDeg: z.number(), class: z.enum(CURVATURE_CLASSES) })
    .nullable(),
  continuity: z.enum(['continuous', 'broken']).nullable(),
  breaks: z.array(evidencePointSchema).max(20),
  forks: z.array(evidencePointSchema).max(20),
  depthProxy: z.object({ value: z.number(), class: z.enum(DEPTH_CLASSES) }).nullable(),
  startZone: z.enum(ZONES).nullable(),
  endZone: z.enum(ZONES).nullable(),
  /** The line is named but not traced end to end: its ends are not where the line ends. */
  partial: z.boolean().optional(),
  /** Ontology checks that failed, by id. Empty for an accepted line. */
  failedChecks: z.array(z.string().max(60)).max(20),
});
export type LineEvidence = z.infer<typeof lineEvidenceSchema>;

export const lineSchema = z.object({
  type: z.enum(LINE_TYPES),
  visible: z.boolean(),
  confidence,
  length: observed(z.enum(LENGTH_CLASSES)),
  depth: observed(z.enum(DEPTH_CLASSES)),
  curvature: observed(z.enum(CURVATURE_CLASSES)),
  continuity: observed(z.enum(CONTINUITY_CLASSES)),
  startZone: observed(z.enum(ZONES)),
  endZone: observed(z.enum(ZONES)),
  marks: z.array(markSchema).max(20),
  regions: z.array(regionSchema).max(8),
  notes: z.string().max(400).nullable(),
  /**
   * The line traced from its start to its end, for drawing it on the photo.
   * Optional so observations saved before extraction v2 still validate. Up to
   * 100 points: the line scanner samples the real crease every few pixels.
   */
  path: z.array(pointSchema).max(100).optional(),
  /**
   * Who measured this line: 'line-service' is the palm line scanner (geometry
   * from crease pixels), 'model' the general vision model. Optional: older
   * observations have none, and only 'line-service' lines are drawn on the photo.
   */
  source: z.enum(['line-service', 'model']).optional(),
  /**
   * True for a line nothing read in this reading: the scanner does not trace it
   * and the vision model did not describe it as visible (and, in readings saved
   * before 2026-09-17, every fate, sun and mercury line). Such a line is
   * recorded as not visible with confidence 0 and no rule may read it.
   * A fate/sun/mercury line the model did describe has `source: 'model'` instead.
   */
  notAnalysed: z.boolean().optional(),
  /** The scanner's raw features for this line (heart, head, life; fate when the scanner traced it). */
  evidence: lineEvidenceSchema.optional(),
  /**
   * Features derived in the app from traced geometry (lines/derived.ts) that
   * have no field of their own, e.g. `life_join` on the head line. Rules read
   * them as `line.<type>.<key>`. Optional: older observations have none.
   */
  derived: z.record(z.string().max(40), observed(z.string().max(40))).optional(),
});
export type LineObservation = z.infer<typeof lineSchema>;

export const CROSSING_KINDS = ['intersection', 'cross'] as const;

/**
 * Where two lines meet, or a small X-shaped mark. Kept apart from `marks`:
 * crosses are fragile marks the rule engine must never interpret, but the
 * report may still say where one is visible.
 */
export const crossingSchema = z.object({
  kind: z.enum(CROSSING_KINDS),
  lines: z.array(z.enum(LINE_TYPES)).max(2),
  point: pointSchema,
  confidence,
});
export type CrossingObservation = z.infer<typeof crossingSchema>;

export const mountSchema = z.object({
  type: z.enum(MOUNT_TYPES),
  prominence: observed(z.enum(PROMINENCE_CLASSES)),
  confidence,
  region: regionSchema.nullable(),
});
export type MountObservation = z.infer<typeof mountSchema>;

export const imageQualitySchema = z.object({
  passed: z.boolean(),
  issues: z.array(z.enum(QUALITY_ISSUES)),
  blurScore: z.number().min(0),
  meanLuminance: z.number().min(0).max(255),
  contrast: z.number().min(0),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});
export type ImageQuality = z.infer<typeof imageQualitySchema>;

export const extractorSchema = z.object({
  provider: z.string().min(1).max(60),
  model: z.string().min(1).max(120),
  version: z.string().min(1).max(40),
  latencyMs: z.number().int().min(0),
  /** Cloudflare neurons, tokens, or whatever the provider bills in. */
  costUnits: z.number().min(0).nullable(),
});
export type ExtractorInfo = z.infer<typeof extractorSchema>;

/**
 * How the palm line scanner went for this reading. `unavailable` means the
 * scan could not run (not configured, offline, timed out): heart, head and life
 * then come from the general model, are capped at lower confidence and are
 * never drawn on the photo.
 */
export const lineScanInfoSchema = z.object({
  status: z.enum(['ok', 'unavailable']),
  /** Why it was unavailable, e.g. 'not_configured', 'timeout'. */
  reason: z.string().max(40).optional(),
  version: z.string().max(20).optional(),
  model: z.string().max(80).optional(),
  modelSha256: z.string().max(64).optional(),
  ontologyVersion: z.string().max(40).optional(),
  /** Scan quality measurements (sharpness, light, hand size), numbers or flags only. */
  qualityMetrics: z.record(z.string().max(40), z.union([z.number(), z.boolean()])).optional(),
  /** Lines not read: the scanner's own scope when it ran, otherwise lines no observer described. */
  notAnalysed: z.array(z.string().max(30)).max(12).optional(),
  latencyMs: z.number().int().min(0).optional(),
  /**
   * The scanner's 21 hand landmarks (MediaPipe order), normalised on the kept
   * JPEG, origin top-left. Optional: absent when the scan did not run, found no
   * hand, or the reading predates them. Kept for mounts, the palm frame and
   * reference comparison (Report V2); no rule reads them.
   */
  landmarks: z.array(evidencePointSchema).length(21).optional(),
  /** Palm width as a fraction of the image width, from the same landmarks. */
  palmWidthNormalized: z.number().min(0).optional(),
  /**
   * Measurements the app derived from the traced lines and landmarks
   * (lines/derived.ts), kept as the audit trail for the classes rules read:
   * head–life gap, head slope, life reach, heart end position, version.
   */
  geometry: z
    .object({
      version: z.string().max(20),
      headLifeGap: z.number().nullable(),
      headSlopeDeg: z.number().nullable(),
      lifeReach: z.number().nullable(),
      heartEndPosition: z.number().nullable(),
      /** Fate start to the traced life line, palm widths (2026-09-19+, fate traced only). */
      fateLifeGap: z.number().nullable().optional(),
    })
    .optional(),
});
export type LineScanInfo = z.infer<typeof lineScanInfoSchema>;

export const palmObservationSchema = z.object({
  schemaVersion: z.literal(PALM_OBSERVATION_SCHEMA_VERSION),
  capturedAt: z.string().datetime(),
  hand: z.object({
    /** Which hand this photo is. Declared by the user, never inferred. */
    side: z.enum(HAND_SIDES),
    /**
     * COMPATIBILITY ONLY (DEC-014): `dominance === 'dominant'`, written for the
     * `reading_sessions.is_dominant` column and readings saved before
     * `dominance` existed. `false` never means "confirmed non-dominant";
     * consumer code must read `dominance`.
     */
    isDominant: z.boolean(),
    /** Which hand the person uses most, as asked (Right / Left / Both / Not sure). Absent on older readings. */
    dominantHand: z.enum(DOMINANT_HANDS).optional(),
    /** The scanned hand's role, derived from `side` + `dominantHand` (`dominanceOf`). Authoritative. */
    dominance: z.enum(DOMINANCES).optional(),
    shape: observed(z.enum(PALM_SHAPES)),
  }),
  imageQuality: imageQualitySchema,
  lines: z.array(lineSchema).max(LINE_TYPES.length),
  mounts: z.array(mountSchema).max(MOUNT_TYPES.length),
  warnings: z.array(z.string().max(200)).max(20),
  extractor: extractorSchema,
  crossings: z.array(crossingSchema).max(12).optional(),
  /** The palm line scanner's run for this reading. Absent on readings made before it existed. */
  lineScan: lineScanInfoSchema.optional(),
});

export type PalmObservation = z.infer<typeof palmObservationSchema>;

/**
 * The shape a vision provider must return. It excludes everything the client
 * already knows (hand side, capture time, quality, extractor metadata) so the
 * model is given the smallest possible surface to get wrong.
 */
export const visionOutputSchema = z.object({
  lines: z.array(lineSchema).max(LINE_TYPES.length),
  mounts: z.array(mountSchema).max(MOUNT_TYPES.length),
  handShape: observed(z.enum(PALM_SHAPES)),
  warnings: z.array(z.string().max(200)).max(20),
  crossings: z.array(crossingSchema).max(12).optional(),
});
export type VisionOutput = z.infer<typeof visionOutputSchema>;
