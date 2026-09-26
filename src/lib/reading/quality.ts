/**
 * The local photo check: the app's own metrics and verdict (copied, see
 * palm/SOURCE.md) on the 96 px copy, in this browser. A photo that fails never
 * leaves the device and never costs a reading. The app decodes with
 * expo-image-manipulator; this is the web's canvas equivalent (the app's
 * quality/gate.ts is replaced by a type-only web shim).
 */

import type { GateResult } from './palm/features/quality/gate';
import { computeMetrics } from './palm/features/quality/metrics';
import { RETAKE_MESSAGES, RETAKE_MESSAGES_HI, evaluateQuality } from './palm/features/quality/verdict';
import type { QualityIssue } from './palm/features/observation/taxonomy';
import type { RgbaCopy } from './image';

export function checkPhoto(check: RgbaCopy, sourceWidth: number, sourceHeight: number): GateResult {
  const verdict = evaluateQuality(computeMetrics(check), sourceWidth, sourceHeight);
  return { ...verdict, sourceWidth, sourceHeight };
}

/** The one fix to show, in the visitor's language. */
export function retakeText(issue: QualityIssue | null, locale: 'en' | 'hi'): string | null {
  if (!issue) return null;
  return locale === 'hi' ? RETAKE_MESSAGES_HI[issue] : RETAKE_MESSAGES[issue];
}
