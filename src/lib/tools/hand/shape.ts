/**
 * Tool A (hand shape from a photo): palm shape + finger length → the
 * element hand type, labelled as the popular modern system (hand-type.ts,
 * CONTENT_GUIDE.md §9.4). A measurement in the middle band is "between",
 * and then both possible types are shown, never forced.
 */

import { candidates, type Element, type FingerLength, type PalmShape } from '../hand-type';
import { CUT } from './cutoffs';
import type { HandMeasures } from './measure';

export type Band<T extends string> = T | 'between';

export interface ShapeResult {
  palm: Band<PalmShape>;
  fingers: Band<FingerLength>;
  palmRatio: number;
  fingerRatio: number;
  /** One element, or two/four when a measurement sits between. */
  elements: Element[];
}

export function palmBand(ratio: number): Band<PalmShape> {
  if (ratio <= CUT.palm.square) return 'square';
  if (ratio >= CUT.palm.long) return 'long';
  return 'between';
}

export function fingerBand(ratio: number): Band<FingerLength> {
  if (ratio <= CUT.fingers.short) return 'short';
  if (ratio >= CUT.fingers.long) return 'long';
  return 'between';
}

export function handShape(m: Pick<HandMeasures, 'palmRatio' | 'fingerRatio'>): ShapeResult {
  const palm = palmBand(m.palmRatio);
  const fingers = fingerBand(m.fingerRatio);
  return {
    palm,
    fingers,
    palmRatio: m.palmRatio,
    fingerRatio: m.fingerRatio,
    elements: candidates(palm === 'between' ? null : palm, fingers === 'between' ? null : fingers),
  };
}

/**
 * Where a value sits on a scale drawn from `min` to `max`, 0–1 (clamped),
 * for the little "your hand on the scale" bar.
 */
export function scalePosition(value: number, min: number, max: number): number {
  if (!(max > min)) return 0.5;
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}

/** The drawn scale ranges: wide enough for 95 % of the 485 test palms. */
export const SCALES = {
  palm: { min: 1.3, max: 1.85 },
  fingers: { min: 0.7, max: 1.05 },
} as const;

/** "1.54" — two decimals, the precision a photo supports. */
export function ratioText(value: number): string {
  return value.toFixed(2);
}
