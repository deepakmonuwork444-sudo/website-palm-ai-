// COPIED from palm-ai-new--feat-m1-foundation/src/features/lines/bands.ts at app commit 38389f51b74d (2026-09-26).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import { bandOf, type LineObservation, type Observed, type PalmObservation, type StabilityBand } from '../observation/schema';

import { BAND_CONFIG, type Band } from './band-config';
import type { LengthClass } from '../observation/taxonomy';

import {
  classifyHeadLifeJoinBanded,
  classifyHeadShapeBanded,
  classifyHeartEndBanded,
  classifyLifeArcBanded,
  type BandedClass,
} from './derived';

/**
 * Stability bands (DEC-019): whether a classed measurement sits clear of its
 * class cut-off (`firm`) or so close that a re-shot photo could land on the
 * other side (`borderline`). A borderline value keeps its class, names the
 * neighbouring class (`altValue`) and is matched at a damped confidence; the
 * raw scanner / model confidence is never changed. An attribute without a band
 * is `unknown` (older readings, AI-described values): never assumed firm.
 *
 * Pure: unit-tested in Node.
 */

/** Bump whenever a gap, factor or the banding rule itself changes: reports carry it. */
export const BANDS_VERSION = '2026-09-23.1';

/** Rule matching sees a borderline value at confidence x this. */
export const BORDERLINE_FACTOR = 0.6;

export { BAND_CONFIG, type Band, type BandConfig, type BandedFeature } from './band-config';

/**
 * The scanner's length cut-offs (ontology.json `features.length`, version
 * `LENGTH_CUTOFFS_ONTOLOGY_VERSION`), palm widths, copied so a stored ratio can
 * be re-banded without the scanner. A test compares them with the file.
 */
export const LENGTH_CUTOFFS_ONTOLOGY_VERSION = '2026-09-23.1';
/** Re-scaled for palm4_v2 on 2026-09-23 (BUG-028): benchmark/derived-calibration/2026-09-23-palm4_v2-length.md. */
export const LENGTH_CUTOFFS: Record<'heart' | 'head' | 'life' | 'fate', { shortBelow: number; longFrom: number }> = {
  heart: { shortBelow: 0.99, longFrom: 1.23 },
  head: { shortBelow: 0.94, longFrom: 1.21 },
  life: { shortBelow: 1.12, longFrom: 1.41 },
  fate: { shortBelow: 0.52, longFrom: 0.85 },
};

/** One class boundary: `below` applies under `at`, `from` at and above it. */
export interface Cutoff<T> {
  at: number;
  below: T;
  from: T;
}

const round3 = (n: number) => Math.round(n * 1000) / 1000;

/**
 * Bands a ratio against ordered cut-offs: borderline when it lies within
 * `gapFraction` x cut-off of the nearest cut-off (strictly inside), with the
 * class on the other side of that cut-off as `altValue`. Same rule as the
 * scanner's `features.length_band`.
 */
export function bandForRatio<T>(ratio: number, cutoffs: readonly Cutoff<T>[], gapFraction: number): { band: Band; altValue: T | null } {
  let nearest: Cutoff<T> | null = null;
  let best = Infinity;
  for (const cut of cutoffs) {
    const d = Math.abs(ratio - cut.at);
    if (d < best) {
      best = d;
      nearest = cut;
    }
  }
  if (!nearest || !(best < gapFraction * nearest.at)) return { band: 'firm', altValue: null };
  return { band: 'borderline', altValue: ratio < nearest.at ? nearest.from : nearest.below };
}

/** What rule matching uses: the raw confidence, damped for borderline evidence. `unknown` is not damped here (the gate treats it). */
export function effectiveConfidenceFor(confidence: number, band: StabilityBand): number {
  return band === 'borderline' ? round3(confidence * BORDERLINE_FACTOR) : confidence;
}

export function lengthCutoffs(line: keyof typeof LENGTH_CUTOFFS): Cutoff<LengthClass>[] {
  const cut = LENGTH_CUTOFFS[line];
  return [
    { at: cut.shortBelow, below: 'short', from: 'medium' },
    { at: cut.longFrom, below: 'medium', from: 'long' },
  ];
}

/** Class and band of a normalised length, exactly as the scanner computes them. */
export function lengthBand(line: keyof typeof LENGTH_CUTOFFS, normalizedLength: number): BandedClass<LengthClass> {
  const cut = LENGTH_CUTOFFS[line];
  const value: LengthClass = normalizedLength < cut.shortBelow ? 'short' : normalizedLength < cut.longFrom ? 'medium' : 'long';
  const { band, altValue } = bandForRatio(normalizedLength, lengthCutoffs(line), BAND_CONFIG[`line.${line}.length`].gapFraction);
  return { value, band, altValue };
}

/**
 * An attribute with its band attached. `info` null leaves the attribute as it
 * is (no band = unknown). The raw `confidence` is never touched; matching reads
 * `effectiveConfidence`.
 */
export function withBand<T>(attribute: Observed<T>, info: { band: Band; altValue: T | null } | null): Observed<T> {
  if (!info) return attribute;
  const { band: _band, altValue: _alt, effectiveConfidence: _eff, ...raw } = attribute;
  return {
    ...raw,
    band: info.band,
    ...(info.band === 'borderline' ? { altValue: info.altValue } : {}),
    effectiveConfidence: effectiveConfidenceFor(attribute.confidence, info.band),
  };
}

/** The attribute without any band field: `unknown`. */
export function withoutBand<T>(attribute: Observed<T>): Observed<T> {
  const { band: _band, altValue: _alt, effectiveConfidence: _eff, ...raw } = attribute;
  return raw;
}

/** Band and neighbour of a banded class, or null for a firm-only / absent read. */
function infoOf<T>(banded: BandedClass<T> | null, stored: T | null): { band: Band; altValue: T | null } | null {
  // The stored class must be the one this geometry gives, or the observation was
  // classed under other cut-offs (older ontology) and its band stays unknown.
  if (!banded || stored === null || banded.value !== stored) return null;
  return { band: banded.band, altValue: banded.altValue };
}

/**
 * Recomputes every band from the geometry stored with an observation, for the
 * legacy migration and for re-banding after a calibration change. Returns a
 * NEW observation; the input is not touched.
 *
 * What it can recompute:
 * - `line.<heart|head|life|fate>.length` from `evidence.normalizedLength`
 *   (scanner ratio) against `LENGTH_CUTOFFS`;
 * - head `curvature` (slope) from `lineScan.geometry.headSlopeDeg` +
 *   `evidence.curvature.chordArcRatio`; life `curvature` (arc) from
 *   `geometry.lifeReach`; head `derived.life_join` from `geometry.headLifeGap`;
 *   heart `endZone` from `geometry.heartEndPosition`.
 * What it cannot: anything without stored geometry (AI-described lines,
 * readings before the scanner or before derived geometry, partial traces),
 * a class that disagrees with today's cut-offs, depth, continuity, start
 * zones, marks, mounts and hand shape. Those come back without a band
 * (`unknown`), never `firm`.
 */
export function bandsForObservation(obs: PalmObservation): PalmObservation {
  const geometry = obs.lineScan?.geometry;
  const lines = obs.lines.map((line): LineObservation => {
    const next: LineObservation = {
      ...line,
      length: withoutBand(line.length),
      depth: withoutBand(line.depth),
      curvature: withoutBand(line.curvature),
      continuity: withoutBand(line.continuity),
      startZone: withoutBand(line.startZone),
      endZone: withoutBand(line.endZone),
      ...(line.derived
        ? { derived: Object.fromEntries(Object.entries(line.derived).map(([k, v]) => [k, withoutBand(v)])) }
        : {}),
    };
    if (line.source !== 'line-service' || !line.visible || !line.evidence) return next;

    const ratio = line.evidence.normalizedLength;
    if (ratio !== null && !line.evidence.partial && line.type in LENGTH_CUTOFFS) {
      const banded = lengthBand(line.type as keyof typeof LENGTH_CUTOFFS, ratio);
      next.length = withBand(next.length, infoOf(banded, line.length.value));
    }
    if (!geometry) return next;

    if (line.type === 'head') {
      const chord = line.evidence.curvature?.chordArcRatio ?? null;
      next.curvature = withBand(next.curvature, infoOf(classifyHeadShapeBanded(geometry.headSlopeDeg, chord), line.curvature.value));
      const join = next.derived?.life_join;
      if (join) {
        next.derived = { ...next.derived, life_join: withBand(join, infoOf(classifyHeadLifeJoinBanded(geometry.headLifeGap), join.value)) };
      }
    }
    if (line.type === 'life') {
      next.curvature = withBand(next.curvature, infoOf(classifyLifeArcBanded(geometry.lifeReach), line.curvature.value));
    }
    if (line.type === 'heart') {
      next.endZone = withBand(next.endZone, infoOf(classifyHeartEndBanded(geometry.heartEndPosition), line.endZone.value));
    }
    return next;
  });
  return { ...obs, lines };
}

/** How many of a line's attributes carry each band; for tests and the retest benchmark. */
export function countBands(line: LineObservation): Record<StabilityBand, number> {
  const counts: Record<StabilityBand, number> = { firm: 0, borderline: 0, unknown: 0 };
  for (const attribute of [line.length, line.depth, line.curvature, line.continuity, line.startZone, line.endZone]) {
    counts[bandOf(attribute)] += 1;
  }
  return counts;
}
