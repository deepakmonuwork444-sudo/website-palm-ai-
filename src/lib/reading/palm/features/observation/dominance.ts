// COPIED from palm-ai-new--feat-m1-foundation/src/features/observation/dominance.ts at app commit 38389f51b74d (2026-09-26).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import type { Dominance, DominantHand } from './schema';
import type { HandSide } from './taxonomy';

/**
 * The role of the scanned hand (DEC-014). Side and dominance are separate
 * facts: the side comes from the photo, the dominant hand from the person.
 * When the scanner corrects the side, call this again with the corrected side
 * — never negate the old answer.
 */
export function dominanceOf(side: HandSide, dominantHand: DominantHand | null | undefined): Dominance {
  if (dominantHand === 'both') return 'ambidextrous';
  if (dominantHand === 'left' || dominantHand === 'right') return dominantHand === side ? 'dominant' : 'non_dominant';
  return 'unknown';
}

/**
 * The role for readings saved before `dominance` existed. Those readings
 * asked "is it the hand you write with?", so their boolean is a real answer,
 * unlike the compatibility boolean written today for `unknown`.
 */
export function legacyDominance(hand: { dominance?: Dominance | undefined; dominantHand?: DominantHand | undefined; isDominant: boolean; side: HandSide }): Dominance {
  if (hand.dominance) return hand.dominance;
  if (hand.dominantHand) return dominanceOf(hand.side, hand.dominantHand);
  return hand.isDominant ? 'dominant' : 'non_dominant';
}
