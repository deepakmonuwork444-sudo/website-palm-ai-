// COPIED from palm-ai-new--feat-m1-foundation/src/features/lines/band-config.ts at app commit fbc2232d837f (2026-09-30).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import type { StabilityBand } from '../observation/schema';

/**
 * Per-feature stability band settings (DEC-019), in their own module so that
 * `derived.ts` (which classifies with them) and `bands.ts` (which bands with
 * `derived.ts`) do not import each other. `bands.ts` re-exports all of it.
 */

export type Band = Exclude<StabilityBand, 'unknown'>;

export type BandConfig =
  /** A measured ratio within `gapFraction` x cut-off of a class cut-off is borderline. */
  | { gapFraction: number; useGap?: never }
  /** The feature's calibrated dead band (lines/derived.ts) is the gap: a value inside it is read as the nearest class, borderline. */
  /**
   * `edgeMargin` (the feature's own units): a value OUTSIDE the dead band but
   * within this distance of its edge is borderline too. Without it a value
   * hopping across the whole band between two photos stayed "firm" on both
   * (retest smoke run 2026-09-19: heart end 0.432 vs 0.506 around the 0.45-0.50 band).
   */
  | { useGap: true; edgeMargin: number; gapFraction?: never };

/**
 * PROVISIONAL first calibration (2026-09-19): every `gapFraction` here is 0.06
 * of the cut-off, chosen from the scanner's length spread on the labelled set,
 * NOT from repeated photos of the same palm. The retest benchmark
 * (benchmark/retest/) replaces each value per feature; do not tune by hand.
 * The scanner reads the same fractions from ontology.json
 * (`features.length.<line>.band_fraction`); a test keeps the two equal.
 */
export const BAND_CONFIG = {
  'line.heart.length': { gapFraction: 0.06 },
  'line.head.length': { gapFraction: 0.06 },
  'line.life.length': { gapFraction: 0.06 },
  'line.fate.length': { gapFraction: 0.06 },
  // edgeMargin = the scanner's MEASURED error where one is documented
  // (benchmark/derived-calibration-2026-09-18.md): head slope error ~4 deg (p80),
  // heart end typical error 0.15. The others have no measured error yet and are
  // PROVISIONAL; the retest benchmark replaces all of them per feature.
  'derived.headSlope': { useGap: true, edgeMargin: 4 },
  'derived.lifeReach': { useGap: true, edgeMargin: 0.05 },
  'derived.headLifeJoin': { useGap: true, edgeMargin: 0.01 },
  'derived.heartEnd': { useGap: true, edgeMargin: 0.15 },
  'derived.fateLifeStart': { useGap: true, edgeMargin: 0.01 },
} as const satisfies Record<string, BandConfig>;

export type BandedFeature = keyof typeof BAND_CONFIG;
