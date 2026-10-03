/**
 * Tool D (left vs right hand): the two hands' measurements side by side,
 * and which of them differ enough to mention. A difference is only called
 * a difference when the two hands land in different bands (the same bands
 * the single-hand tools use), so photo noise inside a band is never sold
 * as "your hands differ".
 */

import { ELEMENTS } from '../hand-type';
import { indexRingBand, levelBand, thumbOpenBand, type IndexRing, type Level, type ThumbOpen } from './fingers';
import { CUT } from './cutoffs';
import type { HandMeasures } from './measure';
import { handShape, type Band } from './shape';
import type { PalmShape, FingerLength } from '../hand-type';

export interface HandSummary {
  palm: Band<PalmShape>;
  fingers: Band<FingerLength>;
  element: string;
  indexRing: IndexRing;
  thumbOpen: ThumbOpen;
  thumbLength: Level;
}

export interface CompareRow {
  label: string;
  left: string;
  right: string;
  differs: boolean;
}

const PALM_WORD: Record<Band<PalmShape>, string> = { square: 'Square', long: 'Long', between: 'Between square and long' };
const FINGER_WORD: Record<Band<FingerLength>, string> = { short: 'Short', long: 'Long', between: 'Average' };
const IR_WORD: Record<IndexRing, string> = { index: 'Index longer', ring: 'Ring longer', equal: 'About equal' };
const OPEN_WORD: Record<ThumbOpen, string> = { close: 'Held close', moderate: 'Moderate', wide: 'Wide open' };
const LEVEL_WORD: Record<Level, string> = { short: 'Short', average: 'Average', long: 'Long' };

export function summarise(m: HandMeasures): HandSummary {
  const shape = handShape(m);
  const element = shape.elements.map((e) => ELEMENTS[e].name.replace(' hand', '')).join(' or ');
  return {
    palm: shape.palm,
    fingers: shape.fingers,
    element,
    indexRing: indexRingBand(m.indexRingLength),
    thumbOpen: thumbOpenBand(m.thumbAngle),
    thumbLength: levelBand(m.thumbRatio, CUT.thumbLength),
  };
}

export function compareHands(left: HandMeasures, right: HandMeasures): { rows: CompareRow[]; differences: number } {
  const a = summarise(left);
  const b = summarise(right);
  const rows: CompareRow[] = [
    { label: 'Hand type (modern system)', left: a.element, right: b.element, differs: a.element !== b.element },
    { label: 'Palm shape', left: PALM_WORD[a.palm], right: PALM_WORD[b.palm], differs: a.palm !== b.palm },
    { label: 'Finger length', left: FINGER_WORD[a.fingers], right: FINGER_WORD[b.fingers], differs: a.fingers !== b.fingers },
    { label: 'Index vs ring finger', left: IR_WORD[a.indexRing], right: IR_WORD[b.indexRing], differs: a.indexRing !== b.indexRing },
    { label: 'Thumb opening', left: OPEN_WORD[a.thumbOpen], right: OPEN_WORD[b.thumbOpen], differs: a.thumbOpen !== b.thumbOpen },
    { label: 'Thumb length', left: LEVEL_WORD[a.thumbLength], right: LEVEL_WORD[b.thumbLength], differs: a.thumbLength !== b.thumbLength },
  ];
  return { rows, differences: rows.filter((row) => row.differs).length };
}
