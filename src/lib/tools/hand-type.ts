import type { Cite } from './sources';

/**
 * Hand type quiz (tool 9) — pure logic.
 *
 * The earth / air / fire / water system is a MODERN system (20th-century
 * palmistry). The classical books the app uses do not describe it, so the page
 * labels it as the popular modern system and never writes "the tradition says"
 * about it (CONTENT_GUIDE.md §9.4, owner decision). The older books sort hands
 * into seven types instead (Cheiro, Palmistry for All, 1916, Part II, ch. I);
 * the page names those with their source.
 *
 * Measurement cut-offs are our own rule of thumb, stated on the page; results
 * near a cut-off are reported as "between two types", never forced.
 */

export type PalmShape = 'square' | 'long';
export type FingerLength = 'short' | 'long';
export type Element = 'earth' | 'air' | 'fire' | 'water';

export const ELEMENTS: Record<Element, { name: string; palm: PalmShape; fingers: FingerLength; summary: string }> = {
  earth: {
    name: 'Earth hand',
    palm: 'square',
    fingers: 'short',
    summary: 'In this modern system an earth hand is linked with a practical, steady nature: someone who likes doing things with their hands and trusts what is concrete.',
  },
  air: {
    name: 'Air hand',
    palm: 'square',
    fingers: 'long',
    summary: 'An air hand is linked with a curious, talkative mind, at home with ideas, words and other people.',
  },
  fire: {
    name: 'Fire hand',
    palm: 'long',
    fingers: 'short',
    summary: 'A fire hand is linked with energy and enthusiasm: quick to start things and drawn to action.',
  },
  water: {
    name: 'Water hand',
    palm: 'long',
    fingers: 'long',
    summary: 'A water hand is linked with sensitivity and imagination, tuned in to feelings and moods.',
  },
};

export const MODERN_SYSTEM_NOTE =
  'The four-element system is a modern way of sorting hands, popular in 20th-century palmistry books. The classical books we cite elsewhere do not use it.';

export const CHEIRO_TYPES: Cite = { book: 'cheiro-palmistry-for-all-1916', locator: 'Part II, ch. I: The Study of the Shape of the Hands' };
export const CHEIRO_SEVEN = ['elementary', 'square', 'spatulate', 'philosophic', 'conic', 'psychic', 'mixed'] as const;

export function elementOf(palm: PalmShape, fingers: FingerLength): Element {
  if (palm === 'square') return fingers === 'short' ? 'earth' : 'air';
  return fingers === 'short' ? 'fire' : 'water';
}

/** Every element that fits the answers; an unknown answer keeps both of its options. */
export function candidates(palm: PalmShape | null, fingers: FingerLength | null): Element[] {
  const palms: PalmShape[] = palm ? [palm] : ['square', 'long'];
  const fingerList: FingerLength[] = fingers ? [fingers] : ['short', 'long'];
  const out: Element[] = [];
  for (const p of palms) for (const f of fingerList) out.push(elementOf(p, f));
  return out;
}

/**
 * Our rule of thumb, stated on the page:
 * - palm: length (wrist crease to the base of the middle finger) ÷ width (across the knuckles).
 *   ≤ 1.15 square, ≥ 1.25 long, in between → borderline.
 * - fingers: middle finger length ÷ palm length. ≤ 0.75 short, ≥ 0.85 long, in between → borderline.
 */
export const CUTOFFS = {
  palm: { square: 1.15, long: 1.25 },
  fingers: { short: 0.75, long: 0.85 },
} as const;

export type Measured<T> = { value: T; borderline: false } | { value: null; borderline: true } | null;

const valid = (n: number) => Number.isFinite(n) && n > 0 && n < 60;

export function palmShapeFromCm(palmLength: number, palmWidth: number): Measured<PalmShape> {
  if (!valid(palmLength) || !valid(palmWidth)) return null;
  const ratio = palmLength / palmWidth;
  if (ratio <= CUTOFFS.palm.square) return { value: 'square', borderline: false };
  if (ratio >= CUTOFFS.palm.long) return { value: 'long', borderline: false };
  return { value: null, borderline: true };
}

export function fingerLengthFromCm(fingerLength: number, palmLength: number): Measured<FingerLength> {
  if (!valid(fingerLength) || !valid(palmLength)) return null;
  const ratio = fingerLength / palmLength;
  if (ratio <= CUTOFFS.fingers.short) return { value: 'short', borderline: false };
  if (ratio >= CUTOFFS.fingers.long) return { value: 'long', borderline: false };
  return { value: null, borderline: true };
}

/** Parses "8.5", "8,5" or " 8 " into a number; NaN for anything else. */
export function parseCm(text: string): number {
  const clean = text.trim().replace(',', '.');
  return /^\d{1,2}(\.\d{1,2})?$/.test(clean) ? Number(clean) : Number.NaN;
}
