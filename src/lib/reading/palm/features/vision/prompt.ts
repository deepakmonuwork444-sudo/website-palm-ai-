// COPIED from palm-ai-new--feat-m1-foundation/src/features/vision/prompt.ts at app commit fbc2232d837f (2026-09-30).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import {
  CONTINUITY_CLASSES,
  CURVATURE_CLASSES,
  DEPTH_CLASSES,
  LENGTH_CLASSES,
  MAJOR_LINES,
  ZONES,
} from '../observation/taxonomy';

/**
 * The extraction prompt.
 *
 * Three jobs, in order of importance:
 *   1. Constrain the model to our vocabulary. Anything outside it is rejected
 *      downstream, so a wide prompt just wastes a call.
 *   2. Make `null` the easy answer. A model that feels obliged to fill every
 *      field will invent palm features, and fluent invention is the exact
 *      failure this whole architecture exists to prevent.
 *   3. Forbid interpretation. The model reports what is visible. It is never
 *      asked what anything means.
 *
 * Trimmed 2026-09-30 (owner, DEC-049): the model is no longer asked for the
 * hand shape (earth/air/fire/water), mounts, crossings, marks, or the fate,
 * sun and mercury lines. Since the truth gate (DEC-047, lines/truth.ts) none
 * of them reaches a rule or the report: the hand type is measured from the
 * scanner's landmarks, mounts are taught from the landmarks, and fate is read
 * only when the scanner traces it (merge.ts discards the model's fate either
 * way). What the model still gives: its warnings (back of hand, no palm —
 * read by the pipeline and by extract-palm's refund checks) and a description
 * of the heart, head and life lines (their visibility feeds the same checks;
 * their attributes are the fallback report when no scanner is configured).
 * The call itself stays: the server charges the reading at it
 * (claim_extraction). Parsing stays tolerant (normalise.ts, extract-palm
 * checks.ts): an older function that still sends the dropped fields parses
 * fine, and the truth gate removes them.
 */

function list(values: readonly string[]): string {
  return values.join(' | ');
}

/**
 * Lines the parser accepts from the model. Wider than what is asked
 * (PROMPTED_LINES): an older deployed prompt still returns fate, sun and
 * mercury, and those answers must keep parsing (the truth gate drops them).
 */
export const EXTRACTED_LINES = [...MAJOR_LINES, 'sun', 'mercury'] as const;
export type ExtractedLineType = (typeof EXTRACTED_LINES)[number];

/** The lines the model is asked to describe (2026-09-30): the three the scanner also traces. */
export const PROMPTED_LINES = ['heart', 'head', 'life'] as const satisfies readonly ExtractedLineType[];

export const EXTRACTION_SYSTEM_PROMPT = `You are a careful visual annotator.

You are shown a photograph of a human palm. Your ONLY job is to report what is
visually present. You are NOT a palm reader. You must never state, imply or
hint at what any feature means, predicts, or says about the person.

Rules you must follow exactly:
- Report ONLY features you can actually see in this image.
- If you cannot see something clearly, use null. null is the correct and
  expected answer for anything uncertain. Do not guess to fill a field.
- Confidence is a number from 0 to 1 reflecting how sure you are about that
  specific value. Be honest and be conservative.
- If the image shows the back of a hand, not a palm, set every line visible to
  false and add "possible back of hand" to warnings.
- Output valid JSON only. No prose, no markdown fences, no explanation.`;

// The answer used to be cut off by max_tokens on real palms. Every field here
// earns its tokens: the old `regions` boxes and `notes` are gone (the path
// replaces the boxes, and the app derives a box from it), optional fields the
// app defaults are not spelled out as nulls, and (2026-09-30) nothing the
// truth gate discards is asked for any more.
export function buildExtractionPrompt(): string {
  return `Annotate this palm photograph.

Return JSON with exactly this shape:

{
  "lines": [
    {
      "type": ${list(PROMPTED_LINES)},
      "visible": true | false,
      "confidence": 0.0-1.0,
      "length": { "value": ${list(LENGTH_CLASSES)} | null, "confidence": 0.0-1.0 },
      "depth": { "value": ${list(DEPTH_CLASSES)} | null, "confidence": 0.0-1.0 },
      "curvature": { "value": ${list(CURVATURE_CLASSES)} | null, "confidence": 0.0-1.0 },
      "continuity": { "value": ${list(CONTINUITY_CLASSES)} | null, "confidence": 0.0-1.0 },
      "startZone": { "value": <zone> | null, "confidence": 0.0-1.0 },
      "endZone": { "value": <zone> | null, "confidence": 0.0-1.0 },
      "path": [ [x, y], ... ]
    }
  ],
  "warnings": [ "short plain-language note" ]
}

<zone> must be one of: ${list(ZONES)}

Coordinates: [x, y] with x and y from 0 to 1, measured from the TOP-LEFT corner of
this image (x to the right, y downward). Round to 2 decimals.
- path: 4 to 10 points that follow the crease you see, from its start to its end.
  Use [] when the line is not visible.

Which end of a line is its start and which is its end:
- life: startZone is the end between the thumb and the index finger; endZone is the end near the wrist.
- head: startZone is the end on the thumb side; endZone is the end toward the outer edge of the palm.
- heart: startZone is the end at the little-finger edge of the palm; endZone is the end under the index or middle finger.

Where each zone is on the palm:
- jupiter / under_index: the pad under the index finger.
- saturn / under_middle: the pad under the middle finger.
- apollo / under_ring: the pad under the ring finger.
- mercury / under_little: the pad under the little finger.
- venus: the base of the thumb, inside the curve of the life line.
- luna: the outer edge of the palm (little-finger side), just above the wrist.
- mars_positive: the outer edge of the palm, between mercury and luna.
- mars_negative: the thumb side of the palm, just above venus and inside the life line.
- plain_of_mars: the hollow centre of the palm.

Include exactly one entry for each of the three lines (${list(PROMPTED_LINES)}) even
when it is not visible — set "visible": false, "path": [] and leave the attributes null.
Report no other line.`;
}

/** Rough token budget, to sanity-check cost before a call goes out. */
export function approximatePromptSize(): number {
  return Math.ceil((EXTRACTION_SYSTEM_PROMPT.length + buildExtractionPrompt().length) / 4);
}
