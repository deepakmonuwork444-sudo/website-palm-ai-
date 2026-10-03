// COPIED from palm-ai-new--feat-m1-foundation/src/features/lines/truth.ts at app commit fbc2232d837f (2026-09-30).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import type { LineObservation, PalmObservation } from '../observation/schema';
import type { LineType } from '../observation/taxonomy';

import {
  AI_ONLY_LINES,
  AI_ONLY_LINES_FATE_TRACED_WARNING,
  AI_ONLY_LINES_WARNING,
  MODEL_PARTS_WARNING,
  notAnalysedLine,
} from './merge';

/**
 * The truth gate (plan "Plus report: everything real", 2026-09-29).
 *
 * Everything the report says about the user's hand must be measured on their
 * photo. Four things in an observation were only ever the general vision
 * model's guess, and none of them may reach a rule, the synthesis or any
 * user-visible finding:
 *
 * - the hand shape (earth / air / fire / water), which the model guessed from
 *   the photo — the measured hand type (features/hand) replaces it;
 * - mount prominence ("a raised Jupiter mount"): a flat photo cannot show how
 *   full a pad is, and the model cannot localise it. Mounts stay in the report
 *   only as a learning part placed from the landmarks (features/hand/mounts.ts);
 * - fate, sun and mercury lines that exist only in the model's words (the
 *   scanner traces heart, head, life and, with palm4, fate);
 * - crossings, whose positions the model placed without being able to localise.
 *
 * Parsing stays tolerant: the schema still accepts all of them, so readings
 * saved before this gate load unchanged; the gate is applied on top.
 * Heart, head and life described by the model when no scanner is configured
 * (a development build only; see pipeline `assertScanAccepted`) are kept: that
 * report is labelled as untraced everywhere it is shown.
 *
 * Pure: unit-tested in Node.
 */

/** Warnings that only described the model-only parts; they go with them. */
const MODEL_PART_WARNINGS: ReadonlySet<string> = new Set([
  MODEL_PARTS_WARNING,
  AI_ONLY_LINES_WARNING,
  AI_ONLY_LINES_FATE_TRACED_WARNING,
]);

/** A fate, sun or mercury line the scanner did not trace, but the model described. */
export function isModelOnlyLine(line: LineObservation): boolean {
  return (
    (AI_ONLY_LINES as readonly LineType[]).includes(line.type) &&
    line.source !== 'line-service' &&
    line.notAnalysed !== true
  );
}

/** Rule / feature paths that rest only on the model's guess, for filtering stored text. */
export function isGatedPath(path: string, observation?: PalmObservation): boolean {
  const [root, second] = path.split('.');
  if (root === 'mount') return true;
  if (root === 'hand' && second === 'shape') return true;
  if (root === 'crossing') return true;
  if (root === 'line' && second && (AI_ONLY_LINES as readonly string[]).includes(second)) {
    // A traced fate line is real; only an untraced one is the model's guess.
    const line = observation?.lines.find((l) => l.type === second);
    return !(line && line.source === 'line-service');
  }
  return false;
}

/** True when the observation still carries anything the gate removes. */
export function hasModelOnlyClaims(observation: PalmObservation): boolean {
  return (
    observation.hand.shape.value !== null ||
    observation.hand.shape.confidence > 0 ||
    observation.mounts.length > 0 ||
    (observation.crossings?.length ?? 0) > 0 ||
    observation.lines.some(isModelOnlyLine) ||
    observation.warnings.some((w) => MODEL_PART_WARNINGS.has(w))
  );
}

/**
 * The observation with every model-only claim removed: no hand shape, no
 * mounts, no crossings, and every untraced fate / sun / mercury line recorded
 * as "not analysed" (not visible, confidence 0, no rule may read it). Returns
 * the same object when there is nothing to remove.
 */
export function gateObservation(observation: PalmObservation): PalmObservation {
  if (!hasModelOnlyClaims(observation)) return observation;
  const { crossings: _crossings, ...rest } = observation;
  return {
    ...rest,
    hand: { ...observation.hand, shape: { value: null, confidence: 0 } },
    lines: observation.lines.map((line) => (isModelOnlyLine(line) ? notAnalysedLine(line.type) : line)),
    mounts: [],
    warnings: observation.warnings.filter((w) => !MODEL_PART_WARNINGS.has(w)),
  };
}
