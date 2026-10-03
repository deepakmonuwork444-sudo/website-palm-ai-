import type { Cite } from './sources';

/**
 * Palm signs checker (tool 10) — content and lookup.
 *
 * The app has NO rule for any of these signs (CONTENT_GUIDE.md §9.4), and its
 * scan leaves them out because phone photos can't show them reliably. So the
 * person ticks what they see, and each meaning below comes from a corpus book
 * passage read on 2026-09-26 (app repo, knowledge/raw/), in our own words.
 * Everything the books promise or threaten (wealth, fame, children, illness,
 * doom) is left out and the card says so. The M has no classical source at
 * all, and the card says that too.
 */

export type SignId = 'm' | 'mystic-cross' | 'star' | 'triangle' | 'fish' | 'trident' | 'island';

export interface PalmSign {
  id: SignId;
  name: string;
  hi: string;
  /** A 24×24 outline glyph (DESIGN_SYSTEM.md §8 stroke style). */
  glyph: string;
  where: string;
  /** What the books read, in our words; null when no book we use describes it. */
  booksSay: string | null;
  /** What we leave out, and why. */
  leftOut: string;
  cites: readonly Cite[];
  /** The guide that owns this sign (KEYWORD_MAP C11); linked only when live. */
  guide: string;
}

const PFA_CROSS: Cite = { book: 'cheiro-palmistry-for-all-1916', locator: 'Part I, ch. XIII: La Croix Mystique' };
const PFA_STAR: Cite = { book: 'cheiro-palmistry-for-all-1916', locator: 'Part I, ch. XVI: The Star, the Cross, the Square' };
const PFA_ISLAND: Cite = { book: 'cheiro-palmistry-for-all-1916', locator: 'Part I, ch. XV: The Island, the Circle, the Spot and the Grille' };
export const LOTH_TRIANGLE: Cite = { book: 'cheiro-language-of-the-hand-1900', locator: 'ch. XXII: The Triangle, pp. 131–132' };
const DALE_MARKS: Cite = { book: 'dale-indian-palmistry-1895', locator: 'Signification of Animals, Flowers and Promiscuous Marks Found on the Hand' };
const JAIN_SIGNS: Cite = { book: 'jain-samudrik-shastra-1927', locator: 'The signs in the palm, pp. 3–5' };

export const SIGNS: readonly PalmSign[] = [
  {
    id: 'm',
    name: 'The letter M',
    hi: 'हाथ में M का निशान',
    glyph: 'M4 19 L7.5 5 L12 13 L16.5 5 L20 19',
    where: 'Not a separate mark: the heart, head and life lines (often with the fate line) sit so that together they draw a capital M across the palm.',
    booksSay: null,
    leftOut:
      'None of the classical books we use describes an “M sign”. It is a modern idea. What they do read are the lines that make it, so the honest way to read an M is line by line. Claims online that an M means wealth, luck or a special destiny have no source in these books.',
    cites: [],
    guide: '/palmistry-m/',
  },
  {
    id: 'mystic-cross',
    name: 'Mystic cross',
    hi: 'रहस्यमय क्रॉस',
    glyph: 'M7 7 L17 17 M17 7 L7 17',
    where: 'A small cross, standing on its own, in the space between the heart and head lines, often under the middle finger.',
    booksSay: 'Cheiro reads it as a natural gift for, and interest in, mysticism and the spiritual. It is strongest, he says, when it sits in the middle of that space.',
    leftOut: 'He also says which careers and books such a person will turn to. That is a prediction, so it is left out.',
    cites: [PFA_CROSS],
    guide: '/palm-crosses/',
  },
  {
    id: 'star',
    name: 'Star',
    hi: 'तारा',
    glyph: 'M12 4 V20 M5 8 L19 16 M19 8 L5 16',
    where: 'Three or more short lines crossing at one point, usually on a mount (the pads under the fingers or at the base of the palm).',
    booksSay: 'Cheiro reads a star as a mark that heightens whatever the mount under it stands for: ambition on the Mount of Jupiter under the index finger, imagination on the Mount of the Moon.',
    leftOut:
      'He also promises honour, riches and fame from stars, and reads a star under the middle finger darkly. No mark can promise or threaten an outcome, so neither is repeated.',
    cites: [PFA_STAR],
    guide: '/lucky-signs/',
  },
  {
    id: 'triangle',
    name: 'Triangle',
    hi: 'त्रिभुज',
    glyph: 'M12 5 L20 19 H4 Z',
    where: 'A small, clearly formed triangle on a mount, not one made by ordinary lines happening to cross.',
    booksSay:
      'Cheiro reads a triangle by the mount it sits on: under the index finger, a talent for managing people; under the middle finger, an interest in mystical study; on the Mount of Venus, self-control in love.',
    leftOut: 'He also reads success in business and money from some triangles. That is a promise about an outcome, so it is left out.',
    cites: [LOTH_TRIANGLE],
    guide: '/lucky-signs/',
  },
  {
    id: 'fish',
    name: 'Fish (matsya)',
    hi: 'मछली का निशान',
    glyph: 'M3 12 C 7 6.5, 13 6.5, 17 12 C 13 17.5, 7 17.5, 3 12 Z M17 12 L21 8.5 V15.5 Z',
    where: 'A small fish shape, which the Indian books place near the base of the palm, above the wrist.',
    booksSay: 'In the Indian books the fish is one of the auspicious signs. Chhotelal Jain (1927) reads a fish tail as the mark of a learned person.',
    leftOut: 'Both Mrs Dale (1895) and Jain also promise wealth and children from the fish. No mark can tell that, so it is left out.',
    cites: [JAIN_SIGNS, DALE_MARKS],
    guide: '/lucky-signs/',
  },
  {
    id: 'trident',
    name: 'Trident (trishul)',
    hi: 'त्रिशूल',
    glyph: 'M12 21 V4 M6 5 C 6 11, 18 11, 18 5',
    where: 'Three short lines rising from one stem, like a trident.',
    booksSay: 'Chhotelal Jain (1927) reads a trident in the palm as the sign of a generous, religious-minded person.',
    leftOut: 'He also calls it lucky. That promise is left out.',
    cites: [JAIN_SIGNS],
    guide: '/lucky-signs/',
  },
  {
    id: 'island',
    name: 'Island',
    hi: 'द्वीप',
    glyph: 'M3 12 H8 C 9 8, 15 8, 16 12 C 15 16, 9 16, 8 12 M16 12 H21',
    where: 'A small oval loop in a line, where the line splits and joins up again.',
    booksSay: null,
    leftOut:
      'The old books read islands almost only as signs of weakness or illness. Palm lines are not a health test, so we give no meaning for an island.',
    cites: [PFA_ISLAND],
    guide: '/lucky-signs/',
  },
];

export function signById(id: string): PalmSign | undefined {
  return SIGNS.find((sign) => sign.id === id);
}

/** The picked signs in the page's order; unknown ids are ignored. */
export function pickedSigns(ids: readonly string[]): PalmSign[] {
  const wanted = new Set(ids);
  return SIGNS.filter((sign) => wanted.has(sign.id));
}

/** Quoted with its locator (public-domain book, ≤ 25 words, CONTENT_GUIDE.md §9.3). */
export const CHANCE_CROSSING_QUOTE = '“not formed by the chance crossing of lines”';
