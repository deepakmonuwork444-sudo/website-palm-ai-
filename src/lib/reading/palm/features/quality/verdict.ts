// COPIED from palm-ai-new--feat-m1-foundation/src/features/quality/verdict.ts at app commit 38389f51b74d (2026-09-26).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import type { ImageQuality } from '../observation/schema';
import type { QualityIssue } from '../observation/taxonomy';

import type { ImageMetrics } from './metrics';

/**
 * Thresholds are calibrated against a 96px-long-edge decode.
 *
 * They are STARTING VALUES, not benchmarked ones. `BUILD_QA_MASTER.md`
 * requires a labelled evaluation set before any accuracy claim is made. Until
 * that exists these are tuned to be forgiving: a false accept costs one wasted
 * inference, a false reject costs a frustrated user, and the second is worse.
 */
export const THRESHOLDS = {
  minSourceEdge: 600,
  minBlurScore: 55,
  minLuminance: 45,
  maxLuminance: 214,
  /**
   * A blown-out palm on a mid-grey background averages ~200 and slips under
   * maxLuminance. The share of clipped pixels catches it regardless of what
   * is behind the hand.
   */
  maxClippedFraction: 0.25,
  /** Relative (Weber) contrast within skin. Bias-neutral across skin tones. */
  minSkinContrast: 0.06,
  /** Below this there is no palm; between this and minPalmFraction it is too far. */
  minSkinFraction: 0.1,
  minPalmFraction: 0.28,
} as const;

/**
 * KNOWN BIAS RISK, to be checked against the labelled set before launch:
 * blurScore and contrast are luminance-only. Darker skin has less luminance
 * contrast against its own creases, so minBlurScore and minContrast may reject
 * sharp photos of darker palms that would pass for lighter ones. The synthetic
 * dark-skin case passes, but it is a synthetic case. Real photos decide this.
 */

/** One plain-language sentence per issue. No jargon, no blame. */
export const RETAKE_MESSAGES: Record<QualityIssue, string> = {
  too_small: 'That photo is a little small. Move closer, or use your main camera.',
  too_blurry: 'That came out blurry. Rest your hand on something and hold still for a moment.',
  too_dark: 'It is too dark to see the lines. Try facing a window, or turn on a light.',
  too_bright:
    'The light is washing the lines out. Step out of direct sun or move away from the lamp.',
  low_contrast:
    'The lines are not standing out. Flat, even light from the side usually shows them better.',
  no_palm_detected: 'We could not find a palm in that photo. Fill the frame with your open hand.',
  palm_too_small_in_frame: 'Your palm is a little far away. Bring it closer to fill the frame.',
  possible_back_of_hand:
    'That looks like the back of your hand. Turn it over so the palm faces the camera.',
};

/** The same guidance in Hindi. Same order and meaning as RETAKE_MESSAGES. */
export const RETAKE_MESSAGES_HI: Record<QualityIssue, string> = {
  too_small: 'फोटो थोड़ी छोटी है। पास आएँ, या मुख्य कैमरा इस्तेमाल करें।',
  too_blurry: 'फोटो धुंधली आई। हाथ किसी चीज़ पर टिकाएँ और एक पल स्थिर रखें।',
  too_dark: 'रेखाएँ देखने के लिए बहुत अँधेरा है। खिड़की की ओर मुँह करें या लाइट जलाएँ।',
  too_bright: 'रोशनी रेखाओं को मिटा रही है। सीधी धूप या लैंप से थोड़ा हटें।',
  low_contrast: 'रेखाएँ साफ़ नहीं उभर रहीं। बगल से आती हल्की, बराबर रोशनी में बेहतर दिखती हैं।',
  no_palm_detected: 'फोटो में हथेली नहीं मिली। खुले हाथ से पूरा फ्रेम भरें।',
  palm_too_small_in_frame: 'हथेली थोड़ी दूर है। फ्रेम भरने के लिए पास लाएँ।',
  possible_back_of_hand: 'यह हाथ का पिछला हिस्सा लगता है। हाथ पलटें ताकि हथेली कैमरे की ओर हो।',
};

export function retakeMessage(issue: QualityIssue, lang: 'en' | 'hi'): string {
  return lang === 'hi' ? RETAKE_MESSAGES_HI[issue] : RETAKE_MESSAGES[issue];
}

export interface QualityVerdict {
  passed: boolean;
  issues: QualityIssue[];
  /** The issue behind primaryMessage, so the UI can show it in either language. */
  primaryIssue: QualityIssue | null;
  /** The single most useful thing to tell the user right now. */
  primaryMessage: string | null;
  metrics: ImageMetrics;
}

/**
 * Issues are ordered by how much they block a reading. The user gets told
 * about the first one only — a list of six complaints is not guidance.
 */
const ISSUE_PRIORITY: QualityIssue[] = [
  'too_small',
  'too_dark',
  'too_bright',
  'no_palm_detected',
  'possible_back_of_hand',
  'too_blurry',
  'palm_too_small_in_frame',
  'low_contrast',
];

export function evaluateQuality(
  metrics: ImageMetrics,
  sourceWidth: number,
  sourceHeight: number,
): QualityVerdict {
  const issues: QualityIssue[] = [];

  const tooDark = metrics.meanLuminance < THRESHOLDS.minLuminance;
  const tooBright =
    metrics.meanLuminance > THRESHOLDS.maxLuminance ||
    metrics.clippedFraction > THRESHOLDS.maxClippedFraction;

  if (Math.min(sourceWidth, sourceHeight) < THRESHOLDS.minSourceEdge) issues.push('too_small');
  if (tooDark) issues.push('too_dark');
  if (tooBright) issues.push('too_bright');

  // Skin hue cannot be judged in a photo that is too dark or blown out, and a
  // darker-skinned palm in dim light fails the skin test first. Telling that
  // user "we could not find a palm" would be both wrong and unjust — the
  // honest, useful message is about the light.
  // Skin-based judgements only make sense in usable light. In the dark, or
  // blown out, the honest message is about the light and nothing else.
  const skinJudgeable = !tooDark && !tooBright;
  const palmPresent = metrics.skinFraction >= THRESHOLDS.minSkinFraction;

  if (skinJudgeable && !palmPresent) issues.push('no_palm_detected');
  if (skinJudgeable && palmPresent && metrics.skinFraction < THRESHOLDS.minPalmFraction) {
    issues.push('palm_too_small_in_frame');
  }
  if (metrics.blurScore < THRESHOLDS.minBlurScore) issues.push('too_blurry');
  // Low contrast is a statement about the creases, so it needs a palm to
  // measure. Without one it would just be noise on top of 'no palm'.
  if (skinJudgeable && palmPresent && metrics.skinContrast < THRESHOLDS.minSkinContrast) {
    issues.push('low_contrast');
  }

  const primary = ISSUE_PRIORITY.find((issue) => issues.includes(issue));

  return {
    passed: issues.length === 0,
    issues,
    primaryIssue: primary ?? null,
    primaryMessage: primary ? RETAKE_MESSAGES[primary] : null,
    metrics,
  };
}

export function toImageQuality(
  verdict: QualityVerdict,
  width: number,
  height: number,
): ImageQuality {
  return {
    passed: verdict.passed,
    issues: verdict.issues,
    blurScore: verdict.metrics.blurScore,
    meanLuminance: Math.min(255, Math.max(0, verdict.metrics.meanLuminance)),
    contrast: verdict.metrics.contrast,
    width,
    height,
  };
}
