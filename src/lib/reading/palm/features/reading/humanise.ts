// COPIED from palm-ai-new--feat-m1-foundation/src/features/reading/humanise.ts at app commit fbc2232d837f (2026-09-30).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import type { StabilityBand } from '../observation/schema';
import {
  CONTINUITY_CLASSES,
  CURVATURE_CLASSES,
  DEPTH_CLASSES,
  LENGTH_CLASSES,
  PROMINENCE_CLASSES,
  type LineType,
  type MarkKind,
  type MountType,
  type PalmShape,
  type Zone,
} from '../observation/taxonomy';

/**
 * Turns the taxonomy's enum tokens into words a person can read, in English
 * and Hindi, with the stability band (DEC-019) spelled out: a borderline
 * value always shows BOTH classes and the word borderline
 * ("medium-to-long · borderline" / "मध्यम-से-लंबी · सीमा पर"), never one class
 * as if it were settled.
 *
 * Pure, no React Native imports: unit-tested in Node. Nothing here reads a
 * rule or an observation; callers hand in the path, the value and the band.
 */

export type Lang = 'en' | 'hi';
export type Bi = { en: string; hi: string };
type Scalar = string | number | boolean | null;

export interface BandHint {
  band?: StabilityBand | undefined;
  altValue?: Scalar | undefined;
}

const BORDERLINE: Bi = { en: 'borderline', hi: 'सीमा पर' };
const NOT_SEEN: Bi = { en: 'not seen', hi: 'दिखी नहीं' };

export const LINE_NAMES: Record<LineType, Bi> = {
  life: { en: 'life line', hi: 'जीवन रेखा' },
  head: { en: 'head line', hi: 'मस्तिष्क रेखा' },
  heart: { en: 'heart line', hi: 'हृदय रेखा' },
  fate: { en: 'fate line', hi: 'भाग्य रेखा' },
  sun: { en: 'sun line', hi: 'सूर्य रेखा' },
  mercury: { en: 'Mercury line', hi: 'बुध रेखा' },
  relationship: { en: 'relationship line', hi: 'संबंध रेखा' },
  travel: { en: 'travel line', hi: 'यात्रा रेखा' },
  intuition: { en: 'intuition line', hi: 'अंतर्ज्ञान रेखा' },
  girdle_of_venus: { en: 'girdle of Venus', hi: 'शुक्र मेखला' },
};

export const MOUNT_NAMES: Record<MountType, Bi> = {
  jupiter: { en: 'Mount of Jupiter', hi: 'गुरु पर्वत' },
  saturn: { en: 'Mount of Saturn', hi: 'शनि पर्वत' },
  apollo: { en: 'Mount of Apollo', hi: 'सूर्य पर्वत' },
  mercury: { en: 'Mount of Mercury', hi: 'बुध पर्वत' },
  venus: { en: 'Mount of Venus', hi: 'शुक्र पर्वत' },
  luna: { en: 'Mount of the Moon', hi: 'चंद्र पर्वत' },
  mars_positive: { en: 'upper Mount of Mars', hi: 'ऊपरी मंगल पर्वत' },
  mars_negative: { en: 'lower Mount of Mars', hi: 'निचला मंगल पर्वत' },
};

/** Where on the palm, in everyday words: the place a person can find on their own hand. */
export const ZONE_NAMES: Record<Zone, Bi> = {
  jupiter: { en: 'under the index finger', hi: 'तर्जनी के नीचे' },
  saturn: { en: 'under the middle finger', hi: 'मध्यमा के नीचे' },
  apollo: { en: 'under the ring finger', hi: 'अनामिका के नीचे' },
  mercury: { en: 'under the little finger', hi: 'छोटी उंगली के नीचे' },
  venus: { en: 'the ball of the thumb', hi: 'अंगूठे के नीचे का उभार' },
  luna: { en: 'the outer lower palm', hi: 'हथेली का बाहरी निचला हिस्सा' },
  mars_positive: { en: 'the outer edge of the palm', hi: 'हथेली का बाहरी किनारा' },
  mars_negative: { en: 'the inner edge above the thumb', hi: 'अंगूठे के ऊपर का भीतरी किनारा' },
  plain_of_mars: { en: 'the middle of the palm', hi: 'हथेली का बीच' },
  wrist: { en: 'the wrist', hi: 'कलाई' },
  between_jupiter_and_saturn: { en: 'between the index and middle fingers', hi: 'तर्जनी और मध्यमा के बीच' },
  under_index: { en: 'under the index finger', hi: 'तर्जनी के नीचे' },
  under_middle: { en: 'under the middle finger', hi: 'मध्यमा के नीचे' },
  under_ring: { en: 'under the ring finger', hi: 'अनामिका के नीचे' },
  under_little: { en: 'under the little finger', hi: 'छोटी उंगली के नीचे' },
};

export const LENGTH_WORDS: Record<(typeof LENGTH_CLASSES)[number], Bi> = {
  short: { en: 'short', hi: 'छोटी' },
  medium: { en: 'medium', hi: 'मध्यम' },
  long: { en: 'long', hi: 'लंबी' },
};

export const DEPTH_WORDS: Record<(typeof DEPTH_CLASSES)[number], Bi> = {
  // "light", never "faint": "Faint" is already how clearly the CAMERA saw a
  // line, and one word cannot mean two things on the same row.
  faint: { en: 'lightly etched', hi: 'हल्की गहराई' },
  moderate: { en: 'medium depth', hi: 'मध्यम गहराई' },
  deep: { en: 'deep', hi: 'गहरी' },
};

/** Curvature means slope for the head line and sweep for the life line (lines/derived.ts). */
export const CURVATURE_WORDS: Record<'head' | 'life' | 'other', Record<(typeof CURVATURE_CLASSES)[number], Bi>> = {
  head: {
    straight: { en: 'straight across', hi: 'सीधी' },
    gentle: { en: 'gently sloping', hi: 'हल्की ढलान वाली' },
    curved: { en: 'strongly sloping', hi: 'ज़्यादा ढलान वाली' },
  },
  life: {
    straight: { en: 'close to the thumb', hi: 'अंगूठे के पास से जाती' },
    gentle: { en: 'a medium sweep', hi: 'मध्यम घुमाव वाली' },
    curved: { en: 'sweeping wide into the palm', hi: 'हथेली में चौड़ा घुमाव लेती' },
  },
  other: {
    straight: { en: 'straight', hi: 'सीधी' },
    gentle: { en: 'gently curved', hi: 'हल्की मुड़ी' },
    curved: { en: 'curved', hi: 'मुड़ी हुई' },
  },
};

export const CONTINUITY_WORDS: Record<(typeof CONTINUITY_CLASSES)[number], Bi> = {
  continuous: { en: 'unbroken', hi: 'बिना टूटी' },
  broken: { en: 'broken', hi: 'टूटी हुई' },
  chained: { en: 'chained', hi: 'ज़ंजीर जैसी' },
};

export const PROMINENCE_WORDS: Record<(typeof PROMINENCE_CLASSES)[number], Bi> = {
  flat: { en: 'flat', hi: 'सपाट' },
  normal: { en: 'normal', hi: 'सामान्य' },
  raised: { en: 'raised', hi: 'उभरा हुआ' },
};

export const SHAPE_WORDS: Record<PalmShape, Bi> = {
  earth: { en: 'earth hand', hi: 'पृथ्वी तत्व का हाथ' },
  air: { en: 'air hand', hi: 'वायु तत्व का हाथ' },
  water: { en: 'water hand', hi: 'जल तत्व का हाथ' },
  fire: { en: 'fire hand', hi: 'अग्नि तत्व का हाथ' },
};

/** Singular and plural, for mark counts. */
export const MARK_WORDS: Record<MarkKind, { en: [string, string]; hi: string }> = {
  break: { en: ['break', 'breaks'], hi: 'टूट' },
  branch_up: { en: ['upward branch', 'upward branches'], hi: 'ऊपर जाती शाखा' },
  branch_down: { en: ['downward branch', 'downward branches'], hi: 'नीचे जाती शाखा' },
  fork: { en: ['fork', 'forks'], hi: 'कांटा' },
  island: { en: ['island', 'islands'], hi: 'द्वीप' },
  chain: { en: ['chain', 'chains'], hi: 'ज़ंजीर' },
  cross: { en: ['cross', 'crosses'], hi: 'क्रॉस' },
  star: { en: ['star', 'stars'], hi: 'तारा' },
  square: { en: ['square', 'squares'], hi: 'चौकोर' },
  triangle: { en: ['triangle', 'triangles'], hi: 'त्रिभुज' },
  tassel: { en: ['tassel', 'tassels'], hi: 'झालर' },
};

/** App-derived classes (lines/derived.ts): head `life_join`, fate `life_start`. */
export const DERIVED_WORDS: Record<string, Record<string, Bi>> = {
  life_join: {
    joined: { en: 'joined to the life line', hi: 'जीवन रेखा से जुड़ी' },
    separate: { en: 'separate from the life line', hi: 'जीवन रेखा से अलग' },
    wide: { en: 'well apart from the life line', hi: 'जीवन रेखा से काफ़ी दूर' },
  },
  life_start: {
    from_life: { en: 'rising from the life line', hi: 'जीवन रेखा से निकलती' },
    separate: { en: 'starting apart from the life line', hi: 'जीवन रेखा से अलग शुरू होती' },
  },
};

const ATTRIBUTE_NAMES: Record<string, Bi> = {
  length: { en: 'length', hi: 'लंबाई' },
  depth: { en: 'depth', hi: 'गहराई' },
  curvature: { en: 'shape', hi: 'आकार' },
  continuity: { en: 'continuity', hi: 'निरंतरता' },
  start_zone: { en: 'start', hi: 'शुरुआत' },
  end_zone: { en: 'ending', hi: 'अंत' },
  life_join: { en: 'join with the life line', hi: 'जीवन रेखा से जुड़ाव' },
  life_start: { en: 'start near the life line', hi: 'जीवन रेखा के पास शुरुआत' },
  visible: { en: 'presence', hi: 'मौजूदगी' },
};

/**
 * The Hindi attribute names that are masculine, so the phrase takes का rather
 * than की: "मस्तिष्क रेखा का आकार", never "मस्तिष्क रेखा की आकार".
 */
const MASCULINE_ATTRS = new Set(['curvature', 'end_zone', 'life_join']);

const HAND_SIDES: Record<string, Bi> = {
  left: { en: 'left hand', hi: 'बायाँ हाथ' },
  right: { en: 'right hand', hi: 'दायाँ हाथ' },
};

/** Synthesis words (synthesis/types.ts), as the report shows them. Words only, never a number. */
export const SCAN_QUALITY_WORDS: Record<'excellent' | 'good' | 'partial' | 'unavailable', Bi> = {
  excellent: { en: 'Excellent', hi: 'बहुत अच्छी' },
  good: { en: 'Good', hi: 'अच्छी' },
  partial: { en: 'Partly visible', hi: 'आंशिक रूप से दिखी' },
  unavailable: { en: 'Not available', hi: 'उपलब्ध नहीं' },
};

/** The tradition tag; null for `none`, so no tag is shown rather than a wrong one. */
export const TRADITION_WORDS: Record<'indian' | 'western' | 'indian_western', Bi> = {
  indian: { en: 'Indian classical palmistry', hi: 'भारतीय हस्तरेखा शास्त्र' },
  western: { en: 'Western classical palmistry', hi: 'पाश्चात्य शास्त्रीय हस्तरेखा' },
  indian_western: { en: 'Indian + Western classical palmistry', hi: 'भारतीय + पाश्चात्य शास्त्रीय हस्तरेखा' },
};

export function traditionWords(label: string | undefined): Bi | null {
  return (TRADITION_WORDS as Record<string, Bi | undefined>)[label ?? ''] ?? null;
}

/** Why a rule was left out of the Palm Story, said plainly. */
export const SUPPRESSED_WORDS: Record<'weaker_evidence' | 'tie' | 'tradition_disagreement' | 'borderline_only', Bi> = {
  weaker_evidence: { en: 'a clearer feature said more', hi: 'एक और साफ़ बनावट ने ज़्यादा बताया' },
  tie: { en: 'two readings weighed the same, so neither was chosen', hi: 'दो बातें बराबर थीं, इसलिए कोई नहीं चुनी गई' },
  tradition_disagreement: { en: 'traditions read this feature differently', hi: 'परंपराएँ इस बनावट को अलग-अलग पढ़ती हैं' },
  borderline_only: { en: 'the feature sat on a borderline, so it could not open a theme', hi: 'बनावट सीमा पर थी, इसलिए इससे कोई विषय नहीं खुला' },
};

/** Any token the tables do not know: underscores become spaces, never shown raw. */
function fallback(token: string): Bi {
  const words = token.replace(/_/g, ' ');
  return { en: words, hi: words };
}

/** The vocabulary a path's values come from, with each class's order for "a-to-b" phrases. */
function vocabularyFor(path: string, value: string): { words: Bi; order: number } {
  const parts = path.split('.');
  const [root, second, attr] = parts;
  const pick = <K extends string>(table: Record<K, Bi>, list: readonly string[]) => {
    const words = (table as Record<string, Bi | undefined>)[value] ?? fallback(value);
    return { words, order: list.indexOf(value) };
  };
  if (root === 'line') {
    if (attr === 'length') return pick(LENGTH_WORDS, LENGTH_CLASSES);
    if (attr === 'depth') return pick(DEPTH_WORDS, DEPTH_CLASSES);
    if (attr === 'curvature') {
      const table = second === 'head' ? CURVATURE_WORDS.head : second === 'life' ? CURVATURE_WORDS.life : CURVATURE_WORDS.other;
      return pick(table, CURVATURE_CLASSES);
    }
    if (attr === 'continuity') return pick(CONTINUITY_WORDS, CONTINUITY_CLASSES);
    if (attr === 'start_zone' || attr === 'end_zone') return pick(ZONE_NAMES, []);
    if (attr !== undefined && DERIVED_WORDS[attr]) return pick(DERIVED_WORDS[attr]!, Object.keys(DERIVED_WORDS[attr]!));
  }
  if (root === 'mount' && attr === 'prominence') return pick(PROMINENCE_WORDS, PROMINENCE_CLASSES);
  if (root === 'hand' && second === 'shape') return pick(SHAPE_WORDS, []);
  if (root === 'hand' && second === 'side') return pick(HAND_SIDES, []);
  return { words: fallback(value), order: -1 };
}

function scalarWords(path: string, value: Scalar, lang: Lang): string {
  if (value === null) return NOT_SEEN[lang];
  const parts = path.split('.');
  if (typeof value === 'boolean') {
    if (parts[0] === 'hand' && parts[1] === 'is_dominant') {
      return value ? { en: 'dominant hand', hi: 'प्रमुख हाथ' }[lang] : { en: 'other hand', hi: 'दूसरा हाथ' }[lang];
    }
    return value ? { en: 'visible', hi: 'दिखती है' }[lang] : { en: 'not visible', hi: 'नहीं दिखती' }[lang];
  }
  if (typeof value === 'number') {
    const kind = parts[0] === 'line' && parts[2] === 'marks' ? parts[3] : undefined;
    const mark = kind ? MARK_WORDS[kind as MarkKind] : undefined;
    if (!mark) return String(value);
    if (value === 0) return lang === 'en' ? `no ${mark.en[0]}` : `कोई ${mark.hi} नहीं`;
    return lang === 'en' ? `${value} ${value === 1 ? mark.en[0] : mark.en[1]}` : `${value} ${mark.hi}`;
  }
  return vocabularyFor(path, value).words[lang];
}

/**
 * The value in words. Borderline: both classes in taxonomy order, joined with
 * "-to-" (single words) or " or " (phrases), then "· borderline".
 */
export function humaniseValue(path: string, value: Scalar, hint: BandHint | undefined, lang: Lang): string {
  const main = scalarWords(path, value, lang);
  if (hint?.band !== 'borderline') return main;
  const alt = hint.altValue;
  if (alt === null || alt === undefined || alt === value || typeof value !== 'string' || typeof alt !== 'string') {
    return `${main} · ${BORDERLINE[lang]}`;
  }
  const a = vocabularyFor(path, value);
  const b = vocabularyFor(path, alt);
  const [first, second] = a.order >= 0 && b.order >= 0 && b.order < a.order ? [b, a] : [a, b];
  const x = first.words[lang];
  const y = second.words[lang];
  const singleWords = !/\s/.test(x) && !/\s/.test(y);
  const joiner = singleWords ? (lang === 'en' ? '-to-' : '-से-') : lang === 'en' ? ' or ' : ' या ';
  return `${x}${joiner}${y} · ${BORDERLINE[lang]}`;
}

/** The feature itself in words: "heart line length" / "हृदय रेखा की लंबाई". */
export function humanisePath(path: string, lang: Lang): string {
  const [root, second, attr, fourth] = path.split('.');
  if (root === 'line' && second) {
    const line = (LINE_NAMES as Record<string, Bi | undefined>)[second] ?? fallback(second);
    if (attr === undefined || attr === 'visible') return line[lang];
    if (attr === 'marks') {
      const mark = fourth ? MARK_WORDS[fourth as MarkKind] : undefined;
      const markWords = mark ? { en: mark.en[1], hi: mark.hi } : fallback(fourth ?? 'marks');
      return lang === 'en' ? `${markWords.en} on the ${line.en}` : `${line.hi} पर ${markWords.hi}`;
    }
    const attribute = ATTRIBUTE_NAMES[attr] ?? fallback(attr);
    const of = MASCULINE_ATTRS.has(attr) ? 'का' : 'की';
    return lang === 'en' ? `${line.en} ${attribute.en}` : `${line.hi} ${of} ${attribute.hi}`;
  }
  if (root === 'mount' && second) {
    return ((MOUNT_NAMES as Record<string, Bi | undefined>)[second] ?? fallback(second))[lang];
  }
  if (root === 'hand') {
    if (second === 'shape') return { en: 'hand shape', hi: 'हाथ का आकार' }[lang];
    if (second === 'side') return { en: 'hand', hi: 'हाथ' }[lang];
    if (second === 'is_dominant') return { en: 'dominant hand', hi: 'प्रमुख हाथ' }[lang];
  }
  return fallback(path.replace(/\./g, ' '))[lang];
}

/**
 * One evidence feature as a person reads it: "heart line length: medium-to-long
 * · borderline", "2 upward branches on the heart line", "heart line: visible".
 * Every value and path goes through the tables above, so no enum token leaks.
 */
export function featureLine(path: string, value: Scalar, hint: BandHint | undefined, lang: Lang): string {
  const [root, second, attr] = path.split('.');
  const words = humaniseValue(path, value, hint, lang);
  if (root === 'line' && second && attr === 'marks' && typeof value === 'number') {
    const line = humanisePath(`line.${second}`, lang);
    return lang === 'en' ? `${words} on the ${line}` : `${line} पर ${words}`;
  }
  return `${humanisePath(path, lang)}: ${words}`;
}

/**
 * Fills `{path}` placeholders in a rule's `short` / `shortHi` template from
 * `resolve(path)`, e.g. "{line.heart.length}, {line.heart.curvature} heart
 * line". Returns null when any placeholder cannot be resolved, so a caller
 * falls back rather than printing a half sentence or a raw path.
 */
export function renderShort(template: string, resolve: (path: string) => string | null | undefined): string | null {
  let missing = false;
  const text = template.replace(/\{([^{}]+)\}/g, (_match, path: string) => {
    const words = resolve(path.trim());
    if (words === null || words === undefined || words === '') {
      missing = true;
      return '';
    }
    return words;
  });
  return missing ? null : text.replace(/\s+/g, ' ').trim();
}
