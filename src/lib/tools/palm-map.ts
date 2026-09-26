import { LINE_ORDER, LINE_PINS, MOUNT_AREAS, MOUNT_ORDER, type LineName, type MountId } from './palm-geometry';
import type { Cite } from './sources';

/**
 * Interactive palm map (tool 11) — the content of every spot on the map.
 * "Where" and "read for" follow the app's lessons (`engagement/lessons.ts`);
 * the book line for each mount is the app's corpus rule for a full (raised)
 * mount, word for word, with its ruleId. The two Mars mounts are named by
 * position, never by "positive/negative" (the app and Cheiro name them the
 * other way round; CONTENT_GUIDE.md §9.1).
 */

export type SpotId = LineName | MountId;

export interface MapSpot {
  id: SpotId;
  kind: 'line' | 'mount';
  name: string;
  /** Hindi name (shown with lang="hi"). */
  hi: string;
  where: string;
  readFor: string;
  /** What the example below describes, e.g. "A straight head line:". */
  bookLead: string;
  /** A line from the books (the app's rule meaning, word for word), attributed. */
  book: string;
  ruleId: string | null;
  cite: Cite;
  /** The matching guide (links render only when that page is live). */
  guide: string | null;
  /** The finder tool for this line, if any. */
  tool: string | null;
  pin: { x: number; y: number };
}

const LOTH_MOUNTS: Cite = { book: 'cheiro-language-of-the-hand-1900', locator: 'Part I, ch. XV — The Mounts, pp. 63–65' };

const LINES: Record<LineName, Omit<MapSpot, 'id' | 'kind' | 'pin'>> = {
  heart: {
    name: 'Heart line',
    hi: 'हृदय रेखा',
    where: 'The uppermost major line, running across the palm just below the fingers.',
    readFor: 'Traditionally read for emotional life and the way a person relates to others.',
    bookLead: 'A heart line that ends under the index finger:',
    book: 'Loyal, steady affection held to high ideals — once you are truly attached, you tend to stay attached.',
    ruleId: 'cx-heart-end-index',
    cite: { book: 'cheiro-palmistry-for-all-1916', locator: 'Part I, ch. VII — The Line of Heart' },
    guide: '/heart-line/',
    tool: '/tools/heart-line-finder/',
  },
  head: {
    name: 'Head line',
    hi: 'मस्तिष्क रेखा',
    where: 'Crosses the middle of the palm. It often begins together with the life line before the two separate.',
    readFor: 'Traditionally read for how you think, learn and decide.',
    bookLead: 'A straight head line:',
    book: 'Practical common sense — a mind that prefers the concrete and can be relied on to carry a decision through.',
    ruleId: 'cx-head-straight',
    cite: { book: 'cheiro-palmistry-for-all-1916', locator: 'Part I, ch. II — The Line of Head' },
    guide: '/head-line/',
    tool: '/tools/head-line-finder/',
  },
  life: {
    name: 'Life line',
    hi: 'जीवन रेखा',
    where: 'Curves around the base of the thumb, from between the thumb and index finger towards the wrist.',
    readFor: 'Traditionally read for vitality, stability and how a person meets change.',
    bookLead: 'A shorter life line:',
    book: 'A shorter life line. Even the old books warn against reading its length as a count of years, and it is not read that way here.',
    ruleId: 'cx-life-short',
    cite: { book: 'markun-what-you-should-know-about-palmistry-1927', locator: 'the section on the Line of Life' },
    guide: '/life-line/',
    tool: '/tools/life-line-finder/',
  },
  fate: {
    name: 'Fate line',
    hi: 'भाग्य रेखा',
    where: 'Runs up the middle of the palm towards the middle finger.',
    readFor: 'Traditionally read for direction, work and a sense of purpose.',
    bookLead: 'No fate line at all (common, and not a bad sign):',
    book: 'Direction is not set out in advance — work tends to follow circumstances and choices as they come, rather than one fixed track.',
    ruleId: 'cx-fate-absent',
    cite: { book: 'markun-what-you-should-know-about-palmistry-1927', locator: 'the section on the Fate Line' },
    guide: '/fate-line/',
    tool: '/tools/fate-line-finder/',
  },
};

const MOUNTS: Record<MountId, Omit<MapSpot, 'id' | 'kind' | 'pin' | 'tool'>> = {
  jupiter: {
    name: 'Mount of Jupiter (Guru)',
    hi: 'गुरु पर्वत',
    where: 'The pad under the index finger.',
    readFor: 'Traditionally linked with ambition.',
    bookLead: 'When this mount is full, the books read:',
    book: 'Ambition, pride and enthusiasm — a wish to lead, organise and carry a goal through.',
    ruleId: 'cx-mount-jupiter-raised',
    cite: LOTH_MOUNTS,
    guide: null,
  },
  saturn: {
    name: 'Mount of Saturn (Shani)',
    hi: 'शनि पर्वत',
    where: 'The pad under the middle finger.',
    readFor: 'Traditionally linked with responsibility.',
    bookLead: 'When this mount is full, the books read:',
    book: 'Seriousness and prudence — a liking for quiet, solitude and earnest work.',
    ruleId: 'cx-mount-saturn-raised',
    cite: LOTH_MOUNTS,
    guide: null,
  },
  sun: {
    name: 'Mount of the Sun (Surya)',
    hi: 'सूर्य पर्वत',
    where: 'The pad under the ring finger.',
    readFor: 'Traditionally linked with creativity.',
    bookLead: 'When this mount is full, the books read:',
    book: 'Enthusiasm for beauty — art, poetry and pleasing surroundings — with a warm, generous manner.',
    ruleId: 'cx-mount-apollo-raised',
    cite: LOTH_MOUNTS,
    guide: null,
  },
  mercury: {
    name: 'Mount of Mercury (Budh)',
    hi: 'बुध पर्वत',
    where: 'The pad under the little finger.',
    readFor: 'Traditionally linked with communication.',
    bookLead: 'When this mount is full, the books read:',
    book: 'Quick wit and a ready tongue, with a flair for commerce, science and anything that needs a sharp mind.',
    ruleId: 'cx-mount-mercury-raised',
    cite: { book: 'cheiro-palmistry-for-all-1916', locator: 'Part II, ch. X — The Mount of Mercury' },
    guide: null,
  },
  venus: {
    name: 'Mount of Venus (Shukra)',
    hi: 'शुक्र पर्वत',
    where: 'The base of the thumb, inside the curve of the life line.',
    readFor: 'Traditionally linked with warmth.',
    bookLead: 'When this mount is full, the books read:',
    book: 'Warmth, sympathy and a love of beauty — colour, music and the company of others.',
    ruleId: 'cx-mount-venus-raised',
    cite: LOTH_MOUNTS,
    guide: null,
  },
  moon: {
    name: 'Mount of the Moon (Chandra)',
    hi: 'चंद्र पर्वत',
    where: 'The outer edge of the palm, on the little-finger side, just above the wrist.',
    readFor: 'Traditionally linked with imagination.',
    bookLead: 'When this mount is full, the books read:',
    book: 'A strong imagination and romantic ideals, with a love of travel, scenery and anything new.',
    ruleId: 'cx-mount-luna-raised',
    cite: LOTH_MOUNTS,
    guide: null,
  },
  'mars-thumb': {
    name: 'Mars, near the thumb (Mangal)',
    hi: 'मंगल पर्वत (अंगूठे की ओर)',
    where: 'On the thumb side, just above the Mount of Venus and inside the life line.',
    readFor: 'Traditionally linked with courage.',
    bookLead: 'When this mount is full, the books read:',
    book: 'Active courage and a fighting spirit — quick to stand up for yourself, with a temper that flares and passes.',
    ruleId: 'cx-mount-mars-thumb-raised',
    cite: LOTH_MOUNTS,
    guide: null,
  },
  'mars-outer': {
    name: 'Mars, on the outer edge (Mangal)',
    hi: 'मंगल पर्वत (बाहरी किनारे पर)',
    where: 'On the outer edge of the palm, between the Mount of Mercury and the Mount of the Moon.',
    readFor: 'Traditionally linked with courage and self-control.',
    bookLead: 'When this mount is full, the books read:',
    book: 'Moral courage and self-control — steady resistance to what seems wrong, and calm under pressure.',
    ruleId: 'cx-mount-mars-outer-raised',
    cite: LOTH_MOUNTS,
    guide: null,
  },
};

export const MAP_SPOTS: readonly MapSpot[] = [
  ...LINE_ORDER.map((id) => ({ id, kind: 'line' as const, pin: LINE_PINS[id], ...LINES[id] })),
  ...MOUNT_ORDER.map((id) => ({
    id,
    kind: 'mount' as const,
    pin: { x: MOUNT_AREAS[id].cx, y: MOUNT_AREAS[id].cy },
    tool: null,
    ...MOUNTS[id],
  })),
];

export function spotById(id: string): MapSpot | undefined {
  return MAP_SPOTS.find((spot) => spot.id === id);
}

