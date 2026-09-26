// COPIED from palm-ai-new--feat-m1-foundation/src/features/reading/basis.ts at app commit 38389f51b74d (2026-09-26).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import type { LineObservation, PalmObservation } from '../observation/schema';

/**
 * What each line's reading is based on, said plainly.
 *
 * Three honest answers, and the report must give one for every line:
 * - traced:   the palm line scanner followed the crease pixel by pixel.
 * - ai_photo: the vision AI looked at the photo and described the line
 *             (length, depth, curve, breaks, where it starts and ends). Not
 *             traced, never drawn, read at lower confidence.
 * - not_read: nothing described it clearly, so nothing is based on it.
 *
 * No React Native imports: unit-tested in Node.
 */

export type Bi = { en: string; hi: string };
export type LineBasis = 'traced' | 'ai_photo' | 'not_read';
export type ConfidenceLevel = 'high' | 'moderate' | 'low';

/** The lines a report talks about, in report order. */
export const REPORT_LINES = ['heart', 'head', 'life', 'fate', 'sun', 'mercury'] as const;
export type ReportLine = (typeof REPORT_LINES)[number];

export const REPORT_LINE_NAMES: Record<ReportLine, Bi> = {
  heart: { en: 'Heart line', hi: 'हृदय रेखा' },
  head: { en: 'Head line', hi: 'मस्तिष्क रेखा' },
  life: { en: 'Life line', hi: 'जीवन रेखा' },
  fate: { en: 'Fate line', hi: 'भाग्य रेखा' },
  sun: { en: 'Sun line', hi: 'सूर्य रेखा' },
  mercury: { en: 'Mercury line', hi: 'बुध रेखा' },
};

export const BASIS_LABELS: Record<LineBasis, Bi> = {
  traced: { en: 'Traced on your photo', hi: 'आपकी फोटो पर ट्रेस की गई' },
  ai_photo: { en: 'Seen by AI in your photo, not traced', hi: 'AI ने फोटो में देखी, ट्रेस नहीं की गई' },
  not_read: { en: 'Not read — not seen clearly', hi: 'नहीं पढ़ी गई — साफ़ नहीं दिखी' },
};

const LEVEL_WORDS: Record<ConfidenceLevel, Bi> = {
  high: { en: 'High', hi: 'उच्च' },
  moderate: { en: 'Moderate', hi: 'मध्यम' },
  low: { en: 'Low', hi: 'कम' },
};

export function lineBasis(line: LineObservation | undefined): LineBasis {
  if (!line || line.notAnalysed || !line.visible) return 'not_read';
  // Readings saved before the scanner have no `source`: they were all the AI's.
  return line.source === 'line-service' ? 'traced' : 'ai_photo';
}

export function confidenceLevel(value: number): ConfidenceLevel {
  if (value >= 0.75) return 'high';
  if (value >= 0.5) return 'moderate';
  return 'low';
}

export interface LineBasisInfo {
  type: ReportLine;
  name: Bi;
  basis: LineBasis;
  label: Bi;
  /** The observation's own confidence in this line, 0..1 (0 when not read). */
  confidence: number;
}

export interface ReadingBasis {
  /** traced: every read line traced; ai_photo: none traced; mixed: some of each. */
  mode: 'traced' | 'ai_photo' | 'mixed' | 'nothing';
  /** Mean confidence over the lines that were read, 0..1. */
  confidence: number;
  level: ConfidenceLevel;
  title: Bi;
  body: Bi;
  lines: LineBasisInfo[];
}


function joinNames(lines: LineBasisInfo[], lang: 'en' | 'hi'): string {
  const names = lines.map((l) => (lang === 'en' ? l.name.en.replace(/ line$/, '') : l.name.hi.replace(/ रेखा$/, '')));
  if (names.length <= 1) return names.join('');
  const last = names[names.length - 1];
  return `${names.slice(0, -1).join(', ')} ${lang === 'en' ? 'and' : 'और'} ${last}`;
}

export function readingBasis(observation: PalmObservation): ReadingBasis {
  const lines: LineBasisInfo[] = REPORT_LINES.map((type) => {
    const line = observation.lines.find((l) => l.type === type);
    const basis = lineBasis(line);
    return {
      type,
      name: REPORT_LINE_NAMES[type],
      basis,
      label: BASIS_LABELS[basis],
      confidence: basis === 'not_read' ? 0 : (line?.confidence ?? 0),
    };
  });

  const traced = lines.filter((l) => l.basis === 'traced');
  const ai = lines.filter((l) => l.basis === 'ai_photo');
  const notRead = lines.filter((l) => l.basis === 'not_read');
  const read = [...traced, ...ai];
  const confidence = read.length ? read.reduce((sum, l) => sum + l.confidence, 0) / read.length : 0;
  const level = confidenceLevel(confidence);
  const mode: ReadingBasis['mode'] =
    read.length === 0 ? 'nothing' : ai.length === 0 ? 'traced' : traced.length === 0 ? 'ai_photo' : 'mixed';

  const levelText: Bi = {
    en: `Confidence: ${LEVEL_WORDS[level].en}.`,
    hi: `भरोसा: ${LEVEL_WORDS[level].hi}।`,
  };
  const notReadText: Bi = notRead.length
    ? {
        en: ` Not read, because they were not seen clearly: ${joinNames(notRead, 'en')} ${notRead.length === 1 ? 'line' : 'lines'} — nothing in this report is based on ${notRead.length === 1 ? 'it' : 'them'}.`,
        hi: ` साफ़ न दिखने के कारण नहीं पढ़ी गईं: ${joinNames(notRead, 'hi')} रेखा — इस रिपोर्ट में कुछ भी इन पर आधारित नहीं है।`,
      }
    : { en: '', hi: '' };

  let title: Bi;
  let body: Bi;
  if (mode === 'ai_photo') {
    title = { en: 'Lines read from your photo by AI — not traced', hi: 'रेखाएँ AI ने फोटो से पढ़ीं — ट्रेस नहीं की गईं' };
    body = {
      en:
        `No line was traced pixel by pixel for this reading. The AI looked at your photo and described each line it could see — length, depth, curve, breaks, where it starts and ends. ` +
        `Those descriptions were matched to meanings from named palmistry books. Lines are not drawn on your photo because the AI's positions are not exact. ${levelText.en}${notReadText.en}`,
      hi:
        `इस रीडिंग में कोई रेखा पिक्सेल-दर-पिक्सेल ट्रेस नहीं की गई। AI ने आपकी फोटो देखकर हर दिखने वाली रेखा का वर्णन किया — लंबाई, गहराई, घुमाव, टूटन, कहाँ से शुरू और कहाँ खत्म। ` +
        `इन्हीं वर्णनों को नाम वाली हस्तरेखा किताबों के अर्थों से मिलाया गया। फोटो पर रेखाएँ नहीं खींची गईं, क्योंकि AI की बताई जगहें सटीक नहीं होतीं। ${levelText.hi}${notReadText.hi}`,
    };
  } else if (mode === 'mixed') {
    title = { en: 'Some lines traced, some read by AI', hi: 'कुछ रेखाएँ ट्रेस की गईं, कुछ AI ने पढ़ीं' };
    body = {
      en:
        `The ${joinNames(traced, 'en')} ${traced.length === 1 ? 'line was' : 'lines were'} traced on your photo. ` +
        `The ${joinNames(ai, 'en')} ${ai.length === 1 ? 'line was' : 'lines were'} described by the AI from the photo — not traced, not drawn, and read at lower confidence. ${levelText.en}${notReadText.en}`,
      hi:
        `${joinNames(traced, 'hi')} रेखा आपकी फोटो पर ट्रेस की गई। ` +
        `${joinNames(ai, 'hi')} रेखा का वर्णन AI ने फोटो से किया — ट्रेस नहीं की गई, खींची नहीं गई, और कम भरोसे के साथ पढ़ी गई। ${levelText.hi}${notReadText.hi}`,
    };
  } else if (mode === 'traced') {
    title = { en: 'Lines traced on your photo', hi: 'रेखाएँ आपकी फोटो पर ट्रेस की गईं' };
    body = {
      en: `Every line read here was traced from the creases in your photo. ${levelText.en}${notReadText.en}`,
      hi: `यहाँ पढ़ी गई हर रेखा आपकी फोटो की लकीरों से ट्रेस की गई। ${levelText.hi}${notReadText.hi}`,
    };
  } else {
    title = { en: 'No line could be read', hi: 'कोई रेखा पढ़ी नहीं जा सकी' };
    body = {
      en: 'No line was seen clearly enough in this photo, so nothing in this report is based on your lines.',
      hi: 'इस फोटो में कोई रेखा इतनी साफ़ नहीं दिखी, इसलिए इस रिपोर्ट में कुछ भी आपकी रेखाओं पर आधारित नहीं है।',
    };
  }

  return { mode, confidence, level, title, body, lines };
}
