/**
 * Is this photo good enough to measure? One clear problem at a time, each
 * with a fix in plain words (UX_PSYCHOLOGY.md §10: say what went wrong and
 * how to fix it, no "Oops"). Pure: unit-tested with fixture landmark sets.
 */

import { CHECK } from './cutoffs';
import type { DetectedHand, Handedness, PhotoHands } from './landmarks';
import { measureHand, type HandMeasures } from './measure';

export type HandProblem = 'no_hand' | 'two_hands' | 'cut_off' | 'too_small' | 'fingers_bent' | 'back_of_hand';
export type HandWarning = 'small_in_frame';

export type HandVerdict =
  | { ok: true; hand: DetectedHand; side: Handedness; measures: HandMeasures; warnings: HandWarning[] }
  | { ok: false; problem: HandProblem; hand: DetectedHand | null; measures: HandMeasures | null };

export const PROBLEM_TEXT: Record<HandProblem, { title: string; fix: string }> = {
  no_hand: {
    title: 'We couldn’t find a hand in this photo',
    fix: 'Fit your whole hand in the frame, from the wrist to the fingertips, with a little space around it. Use good light, and a plain background helps.',
  },
  two_hands: {
    title: 'We found two hands',
    fix: 'Take a photo of one hand at a time, with the other hand out of the frame.',
  },
  cut_off: {
    title: 'Part of your hand is outside the photo',
    fix: 'Step back a little so your wrist and all five fingertips are inside the frame.',
  },
  too_small: {
    title: 'Your hand is too small in this photo',
    fix: 'Hold the phone closer, about a forearm’s length away, so your hand fills most of the frame.',
  },
  fingers_bent: {
    title: 'Your fingers look bent',
    fix: 'Open your hand flat with the fingers straight. Bent fingers look shorter, so the numbers would be wrong.',
  },
  back_of_hand: {
    title: 'This looks like the back of your hand',
    fix: 'Turn your hand so the palm, with its lines, faces the camera.',
  },
};

export const WARNING_TEXT: Record<HandWarning, string> = {
  small_in_frame: 'Your hand is small in this photo. The result still works, but a closer photo is more exact.',
};

/**
 * @param override — the person said "this is my palm" after a back-of-hand
 *   verdict (the model's left/right guess, which that check relies on, is
 *   wrong for about 1 photo in 160 in our test set).
 */
export function assessHand(photo: PhotoHands, override: { palm?: boolean } = {}): HandVerdict {
  if (photo.hands.length === 0) return { ok: false, problem: 'no_hand', hand: null, measures: null };
  if (photo.hands.length > 1) return { ok: false, problem: 'two_hands', hand: null, measures: null };
  const hand = photo.hands[0]!;
  const measures = measureHand(hand, photo.width, photo.height);
  const fail = (problem: HandProblem): HandVerdict => ({ ok: false, problem, hand, measures });

  if (measures.outside > 0) return fail('cut_off');
  if (measures.palmLength < CHECK.minPalmPx) return fail('too_small');
  const s = measures.straightness;
  if (Math.min(s.index, s.middle, s.ring) < CHECK.straight) return fail('fingers_bent');
  if (!measures.palmFacing && !override.palm) return fail('back_of_hand');

  const warnings: HandWarning[] = [];
  if (measures.size < CHECK.smallHand) warnings.push('small_in_frame');
  // A palm the person confirmed although the model's guess said "back": the guess of the side was the wrong one.
  const side = measures.palmFacing ? hand.handedness : otherSide(hand.handedness);
  return { ok: true, hand, side, measures: { ...measures, palmFacing: true }, warnings };
}

export function otherSide(side: Handedness): Handedness {
  return side === 'Left' ? 'Right' : 'Left';
}

export function sideName(side: Handedness): 'left' | 'right' {
  return side === 'Left' ? 'left' : 'right';
}
