/**
 * Tool B (finger reader from a photo): the measured fingers and thumb →
 * what the classical books say, each with its source. Meanings are in our
 * own words ("is read as"), checked against the corpus text on 2026-09-26
 * (app repo knowledge/raw; quotes verified line by line). Books marked
 * `unknown` rights in sources.ts are cited for facts only, never quoted.
 *
 * Left out on purpose: predictions (Frith on marriage, Dale on partners),
 * insulting wording (Cheiro's "animal nature", Benham's monkey comparison),
 * money judgements (the "miserly" thumb). Where books disagree, we say so.
 *
 * Not measured: how low or high the thumb is set. On the 485 test palms the
 * thumb's base point moved with the thumb's angle (correlation −0.5), so a
 * photo can't separate the two; the page explains this instead of guessing.
 */

import type { Cite } from '../sources';
import { CUT } from './cutoffs';
import type { HandMeasures } from './measure';

export type IndexRing = 'index' | 'ring' | 'equal';
export type Level = 'short' | 'average' | 'long';
export type ThumbOpen = 'close' | 'moderate' | 'wide';
export type GapName = 'indexMiddle' | 'middleRing' | 'ringLittle';

const C1916: Cite['book'] = 'cheiro-palmistry-for-all-1916';
const C1900: Cite['book'] = 'cheiro-language-of-the-hand-1900';
const GUIDE: Cite['book'] = 'cheiro-guide-to-the-hand-1900';
const HERON: Cite['book'] = 'heron-allen-manual-of-cheirosophy-1885';
const FRITH: Cite['book'] = 'frith-practical-palmistry-1895';
const BENHAM: Cite['book'] = 'benham-laws-of-scientific-hand-reading-1900';

const FINGERS_1916: Cite = { book: C1916, locator: 'Part II, ch. III: The Fingers' };
const RULES_1916: Cite = { book: C1916, locator: 'Rules for Rapid Observation' };
const FINGERS_1900: Cite = { book: C1900, locator: 'Part I, ch. XI: The Fingers' };
const THUMB_1900: Cite = { book: C1900, locator: 'Part I, ch. IX: The Thumb' };

export interface Reading {
  /** What was found, in words. */
  finding: string;
  /** What palmistry says about it. */
  meaning: string;
  cites: Cite[];
  /** Where the books disagree, or a limit of the photo. */
  note?: string;
}

export function indexRingBand(ratio: number): IndexRing {
  if (ratio < CUT.indexRing.ringLonger) return 'ring';
  if (ratio > CUT.indexRing.indexLonger) return 'index';
  return 'equal';
}

export function levelBand(value: number, cut: { short: number; long: number }): Level {
  if (value <= cut.short) return 'short';
  if (value >= cut.long) return 'long';
  return 'average';
}

export function thumbOpenBand(degrees: number): ThumbOpen {
  if (degrees < CUT.thumbAngle.close) return 'close';
  if (degrees >= CUT.thumbAngle.wide) return 'wide';
  return 'moderate';
}

export function wideGaps(gaps: HandMeasures['gaps']): GapName[] {
  const wide = CUT.gaps.wide;
  return (Object.keys(wide) as GapName[]).filter((name) => gaps[name] >= wide[name]);
}

export function fingersTogether(gaps: HandMeasures['gaps']): boolean {
  return Math.max(gaps.indexMiddle, gaps.middleRing, gaps.ringLittle) < CUT.gaps.together;
}

/** "3% shorter" / "about the same" — whole percents, the precision a photo supports. */
export function percentDiff(ratio: number): number {
  return Math.round(Math.abs(ratio - 1) * 100);
}

export function readIndexRing(m: HandMeasures): Reading & { band: IndexRing } {
  const band = indexRingBand(m.indexRingLength);
  const pct = percentDiff(m.indexRingLength);
  if (band === 'index') {
    return {
      band,
      finding: `Your index finger is about ${pct}% longer than your ring finger.`,
      meaning:
        'The index finger is the finger of Jupiter. When it is the longer of the two, palmistry reads it as a drive to lead and to take charge.',
      cites: [FINGERS_1916, { book: BENHAM, locator: 'ch. XI: The Fingers in General' }],
      note: 'Cheiro adds that an index finger almost as long as the middle finger is read as pride.',
    };
  }
  if (band === 'ring') {
    return {
      band,
      finding: `Your ring finger is about ${pct}% longer than your index finger.`,
      meaning:
        'The ring finger is the finger of the Sun, or Apollo. When it is the longer of the two, palmistry reads it as a love of beauty and art, and a wish to be recognised for what you do.',
      cites: [FINGERS_1916, { book: BENHAM, locator: 'ch. XI: The Fingers in General' }],
      note: 'This is the most common result: in most hands the ring finger is a little longer.',
    };
  }
  return {
    band,
    finding: 'Your index and ring fingers are about the same length.',
    meaning: 'Cheiro reads index and ring fingers of equal length as a sign of a balanced mind, and calls it rare to find.',
    cites: [RULES_1916],
    note: 'The books disagree here: Heron-Allen (1885) and Cheiro’s own earlier book read equal fingers as a wish to shine in art.',
  };
}

export function readFingerLength(m: HandMeasures): Reading & { band: Level } {
  const band = levelBand(m.fingerRatio, CUT.fingers);
  const cites = [FINGERS_1900, { book: FRITH, locator: 'Part I, §III: Fingers' }];
  if (band === 'long') {
    return {
      band,
      finding: 'Your fingers are long for your palm.',
      meaning: 'Long fingers are read as a love of detail: noticing small things, and sometimes worrying over them.',
      cites,
    };
  }
  if (band === 'short') {
    return {
      band,
      finding: 'Your fingers are short for your palm.',
      meaning: 'Short fingers are read as quick and impulsive: taking in the whole picture and not liking to fuss over detail.',
      cites,
    };
  }
  return {
    band,
    finding: 'Your fingers are of average length for your palm.',
    meaning: 'Neither the long-finger reading (love of detail) nor the short-finger reading (quick and impulsive) applies strongly.',
    cites,
  };
}

export function readThumb(m: HandMeasures): Reading & { open: ThumbOpen; length: Level } {
  const open = thumbOpenBand(m.thumbAngle);
  const length = levelBand(m.thumbRatio, CUT.thumbLength);
  const degrees = Math.round(m.thumbAngle);
  const openText: Record<ThumbOpen, { finding: string; meaning: string; cites: Cite[] }> = {
    close: {
      finding: `Your thumb is held close to your hand, at about ${degrees}° from your index finger.`,
      meaning: 'A thumb held close to the side of the hand is read as a careful, reserved nature that keeps its thoughts to itself.',
      cites: [THUMB_1900],
    },
    moderate: {
      finding: `Your thumb opens at a moderate angle, about ${degrees}° from your index finger.`,
      meaning:
        'Cheiro says a thumb should neither stand at a right angle nor lie too close to the hand. A moderate opening is read as independent without going to extremes.',
      cites: [THUMB_1900],
    },
    wide: {
      finding: `Your thumb is held wide open, about ${degrees}° from your index finger.`,
      meaning:
        'A wide space between the thumb and the first finger is read as independence of will and fearlessness. Near a right angle, the books read it as a nature that goes to extremes.',
      cites: [FINGERS_1916, RULES_1916],
    },
  };
  const lengthText: Record<Level, string> = {
    long: 'Your thumb is long for your hand. A long thumb is read as a strong will, guided by reason.',
    short: 'Your thumb looks short for your hand. A smaller thumb is read as being guided more by feeling than by reasoning.',
    average: 'Your thumb is of average length for your hand.',
  };
  const lengthCites: Cite[] = length === 'average' ? [] : [RULES_1916, { book: HERON, locator: 'Sect. I, §8: The Thumb, ¶200' }];
  return {
    open,
    length,
    finding: openText[open].finding,
    meaning: `${openText[open].meaning} ${lengthText[length]}`,
    cites: [...openText[open].cites, ...lengthCites],
    note: 'How you hold your thumb in this photo is what is measured, so hold your hand the way it opens naturally. Thumbs often turn sideways to the camera, which can make them look shorter.',
  };
}

const GAP_WORDS: Record<GapName, { between: string; meaning: string }> = {
  indexMiddle: { between: 'index and middle fingers', meaning: 'independence of thought' },
  middleRing: { between: 'middle and ring fingers', meaning: 'independence from circumstances' },
  ringLittle: { between: 'ring and little fingers', meaning: 'independence in action' },
};

export function readGaps(m: HandMeasures): Reading & { wide: GapName[]; together: boolean } {
  const wide = wideGaps(m.gaps);
  const together = fingersTogether(m.gaps);
  const note = 'Older books disagree: Heron-Allen (1885) and Frith (1895) read gaps between the fingers as curiosity instead.';
  if (together) {
    return {
      wide,
      together,
      finding: 'You hold your fingers close together.',
      meaning: 'Fingers held close together are read as a respect for custom and for what other people think.',
      cites: [{ book: GUIDE, locator: 'Part I, ch. IV: The Spaces Between the Fingers' }],
      note,
    };
  }
  if (wide.length === 0) {
    return {
      wide,
      together,
      finding: 'The spaces between your fingers are even, with no gap much wider than usual.',
      meaning: 'Palmists look for one gap that is clearly wider than the rest. Yours are even, so no gap reading applies.',
      cites: [FINGERS_1900],
    };
  }
  const list = wide.map((name) => GAP_WORDS[name]);
  const between = list.map((item) => item.between).join(' and between your ');
  const meanings = list.map((item) => item.meaning).join(', and ');
  return {
    wide,
    together,
    finding: `There is a wide gap between your ${between}.`,
    meaning: `With the fingers open, palmistry reads this as ${meanings}.`,
    cites: [FINGERS_1900, FINGERS_1916],
    note,
  };
}

export function readLittle(m: HandMeasures): Reading & { band: Level } {
  const band = levelBand(m.fingers.ring > 0 ? m.fingers.little / m.fingers.ring : 0, CUT.little);
  if (band === 'long') {
    return {
      band,
      finding: 'Your little finger is long compared with your ring finger.',
      meaning: 'The little finger is the finger of Mercury. When long, it is read as a gift for expression (in speaking and writing) and for influencing people.',
      cites: [FINGERS_1900, FINGERS_1916],
    };
  }
  if (band === 'short') {
    return {
      band,
      finding: 'Your little finger is short compared with your ring finger.',
      meaning: 'Cheiro reads a short little finger as finding it harder to put thoughts into words; he adds that such people often write better than they speak.',
      cites: [FINGERS_1916, RULES_1916],
      note: 'The books disagree: Heron-Allen (1885) and Frith (1895) read a short little finger as quick perception.',
    };
  }
  return {
    band,
    finding: 'Your little finger is of average length compared with your ring finger.',
    meaning: 'Neither the long reading (a gift for expression) nor the short reading applies strongly.',
    cites: [FINGERS_1900],
  };
}

/** The one-line summary at the top of the result. */
export function fingerHeadline(m: HandMeasures): string {
  const ir = indexRingBand(m.indexRingLength);
  const open = thumbOpenBand(m.thumbAngle);
  const first = ir === 'index' ? 'Index finger longer than ring' : ir === 'ring' ? 'Ring finger longer than index' : 'Index and ring fingers equal';
  const second = open === 'close' ? 'thumb held close' : open === 'wide' ? 'thumb held wide open' : 'thumb at a moderate angle';
  return `${first}, ${second}`;
}
