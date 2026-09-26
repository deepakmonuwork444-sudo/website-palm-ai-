// COPIED from palm-ai-new--feat-m1-foundation/src/features/lines/types.ts at app commit 38389f51b74d (2026-09-26).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import { z } from 'zod';

import { CURVATURE_CLASSES, DEPTH_CLASSES, LENGTH_CLASSES, ZONES } from '../observation/taxonomy';

/**
 * The palm line scanner's response (services/palm-lines, POST /v1/analyse),
 * validated before anything in the app reads it. Line fields keep the
 * service's snake_case names; `merge.ts` maps them onto the observation.
 *
 * Coordinates are normalised 0..1 on the exact JPEG that was sent, origin
 * top-left.
 */

const point = z.tuple([z.number(), z.number()]);

/**
 * Lines the scanner can trace. Fate only with the opt-in palm4 model
 * (PALM_LINES_MODEL=palm4, ontology 2026-09-19.1+): an additive `lines.fate`.
 */
export const TRACED_LINES = ['heart', 'head', 'life', 'fate'] as const;
export type TracedLineType = (typeof TRACED_LINES)[number];

export const PHASE_ONE_LINES = ['heart', 'head', 'life'] as const;
export type PhaseOneLine = (typeof PHASE_ONE_LINES)[number];

export const serviceLineSchema = z.object({
  present: z.boolean(),
  label: z.enum(['heart', 'head', 'life', 'fate', 'unknown']),
  model_class: z.enum(TRACED_LINES),
  flagged: z.boolean(),
  /**
   * Ontology 2026-09-18.1+: the line keeps its name but is not traced end to
   * end (an extent check failed), so it has no length class. Optional: older
   * scanner builds do not send it.
   */
  partial: z.boolean().optional(),
  pixel_confidence: z.number().min(0).max(1),
  semantic_confidence: z.number().min(0).max(1),
  polyline: z.array(point).max(100),
  start: point.nullable(),
  end: point.nullable(),
  normalized_length: z.number().min(0),
  length_class: z.enum(LENGTH_CLASSES).nullable(),
  /**
   * Ontology 2026-09-19.2+ (DEC-019): whether the length sits clear of its
   * class cut-off, and the neighbouring class when it does not. Optional:
   * older scanner builds do not send them; null when there is no length class.
   */
  length_band: z.enum(['firm', 'borderline']).nullable().optional(),
  length_alt: z.enum(LENGTH_CLASSES).nullable().optional(),
  curvature: z
    .object({ chord_arc_ratio: z.number(), net_turning_deg: z.number(), class: z.enum(CURVATURE_CLASSES) })
    .nullable(),
  continuity: z.enum(['continuous', 'broken']).nullable(),
  breaks: z.array(point),
  forks: z.array(point),
  depth_proxy: z.object({ value: z.number(), class: z.enum(DEPTH_CLASSES) }).nullable(),
  start_zone: z.enum(ZONES).nullable(),
  end_zone: z.enum(ZONES).nullable(),
  semantic: z
    .object({
      checks: z.array(
        z.object({ id: z.string(), passed: z.boolean().optional(), hard: z.boolean().optional(), skipped: z.boolean().optional() }),
      ),
    })
    .nullable(),
});
export type ServiceLine = z.infer<typeof serviceLineSchema>;

const bilingual = z.object({ en: z.string(), hi: z.string() });

export const lineServiceResponseSchema = z.object({
  version: z.string(),
  ontologyVersion: z.string().optional(),
  /** The model's SHA-256 is no longer sent (2026-09-22, audit S-158); optional for older builds. */
  model: z.object({ name: z.string(), sha256: z.string().optional() }),
  image: z.object({ width: z.number(), height: z.number() }),
  hand: z
    .object({
      handedness: z.string(),
      handednessScore: z.number(),
      /** 21 MediaPipe hand landmarks, normalised on the sent JPEG (may sit a hair outside 0..1). */
      landmarks: z.array(point).length(21),
      palmWidth: z.number(),
      /** Palm width as a fraction of the image width. Optional: older service builds do not send it. */
      palmWidthNormalized: z.number().min(0).optional(),
      /** The hand's skin outline (normalised polygon), display only. Optional: added 2026-09-21. */
      outline: z.array(point).min(8).optional(),
    })
    .nullable(),
  quality: z.object({
    ok: z.boolean(),
    reasons: z.array(z.object({ code: z.string(), message: bilingual })),
    metrics: z.record(z.string(), z.union([z.number(), z.boolean()])).optional(),
  }),
  lines: z
    .object({
      heart: serviceLineSchema,
      head: serviceLineSchema,
      life: serviceLineSchema,
      /** Additive: only a scanner running the palm4 model traces fate. */
      fate: serviceLineSchema.optional(),
    })
    .nullable(),
  notAnalysed: z.array(z.string()),
  /**
   * Additive, optional: the service read the photo as the other hand. Either
   * the side it used or `true` ("the other one"). See client `analysedSide`.
   */
  sideCorrected: z.union([z.enum(['left', 'right']), z.boolean()]).nullable().optional(),
  timingsMs: z.record(z.string(), z.number()),
});
export type LineServiceResponse = z.infer<typeof lineServiceResponseSchema>;

/** What the reading pipeline is told about the scan. */
export type LineScanOutcome =
  | { status: 'ok'; response: LineServiceResponse; latencyMs: number }
  /** The photo failed the scanner's quality gate: the reading must stop before a session starts. */
  | { status: 'rejected'; response: LineServiceResponse; latencyMs: number }
  /** The scan could not run. The reading continues without any line drawn on the photo. */
  | { status: 'unavailable'; reason: string };
