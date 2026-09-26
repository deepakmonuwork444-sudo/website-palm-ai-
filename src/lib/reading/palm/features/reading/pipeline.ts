// COPIED from palm-ai-new--feat-m1-foundation/src/features/reading/pipeline.ts at app commit 38389f51b74d (2026-09-26).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import { scanQuality, type DeepStatus } from '../deep-report/normalise';
import type { DeepReport } from '../deep-report/types';
import type { Synthesis } from '../knowledge/synthesis/types';
import { buildEvidence } from '../knowledge/engine';
import { KNOWLEDGE_RULES } from '../knowledge/rules';
import { synthesise } from '../knowledge/synthesis';
import type { KbRule } from '../knowledge/types';
import { mergeVisionWithScan, rejectionMessages } from '../lines/merge';
import type { LineScanOutcome } from '../lines/types';
import { dominanceOf } from '../observation/dominance';
import {
  PALM_OBSERVATION_SCHEMA_VERSION,
  palmObservationSchema,
  type DominantHand,
  type PalmObservation,
} from '../observation/schema';
import type { HandSide } from '../observation/taxonomy';
import type { GateResult } from '../quality/gate';
import { RETAKE_MESSAGES_HI, toImageQuality } from '../quality/verdict';
import { VisionError, type PalmVisionProvider } from '../vision/provider';

import { cachedExtraction, photoKey, saveExtraction } from './photo-cache';
import { writeReport, type ReadingReport } from './writer';

/**
 * The reading pipeline.
 *
 * Order is load-bearing: the gate runs before any provider call, validation
 * runs before any interpretation, and interpretation is deterministic. A
 * failure at any step throws rather than degrading into a guess. Since 0013 the
 * server charges the reading at the first model call and itself refunds a
 * provider failure or a photo with no readable palm (the same checks as below,
 * run on the server with the scanner's hint).
 */

export interface ReadingInput {
  imageUri: string;
  base64?: string;
  handSide: HandSide;
  /** Which hand the person uses most (DEC-014); the hand's role is derived from it and `handSide`. */
  dominantHand: DominantHand;
  gate: GateResult;
  provider: PalmVisionProvider;
  /** Server session id, when signed in. The remote provider requires it. */
  sessionId?: string;
  rules?: KbRule[];
  /**
   * Whether rules nobody has checked against the book yet may fire (default
   * true while the knowledge base is being reviewed). The report's own
   * `provisional` flag is decided by the rules that actually matched.
   */
  provisionalKnowledge?: boolean;
  /** The model's text while it is still being written, for a live preview. */
  onPartial?: (text: string) => void;
  /**
   * The palm line scanner's result, run BEFORE the server session started.
   * When given, heart/head/life geometry comes only from it; fate/sun/mercury
   * come from the vision model's description (never drawn), or are "not
   * analysed" when it did not describe them (see lines/merge.ts). Omitted only
   * by callers that predate the scanner (older tests).
   */
  lineScan?: LineScanOutcome;
  /**
   * `photoKey(base64, side)` of the photo (photo-cache.ts). When given, or when
   * `base64` is, a byte-identical photo of the same hand reuses the saved
   * description instead of asking the model again.
   */
  photoKey?: string;
  /**
   * The frozen synthesis of this person's most recent earlier reading of the
   * same hand side, when there is one (cross-scan hysteresis, synthesis/
   * cluster.ts): a section open there is not dropped over a borderline-only
   * change. Omitted or null: the reading is synthesised on its own.
   */
  previousSynthesis?: Synthesis | null;
  /**
   * Called when this photo's saved description is reused instead of asking
   * the model: the reading is still charged by the server (claim_extraction).
   */
  onCachedExtraction?: () => Promise<void>;
}

export interface ReadingOutcome {
  observation: PalmObservation;
  report: ReadingReport;
  /** Only ever true for a complete, validated reading. Drives the quota. */
  countsAgainstQuota: boolean;
  /**
   * The user's own palm photo, kept on this phone. Saved with the outcome
   * before the report opens, so it never waits for the deep report.
   */
  photo?: { uri: string; aspect: number };
  /**
   * The premium written report, added after the reading completes. Absent for
   * readings saved before it existed, and when no backend could write it.
   */
  deep?: DeepReport;
  /**
   * The deterministic synthesis shown first (DEC-015), frozen at completion.
   * `null` = could not be built (the report falls back to the older layout);
   * absent = a reading saved before synthesis existed, migrated once on load.
   */
  synthesis?: Synthesis | null;
  /** How the deep report was generated, so the report screen can offer a retry. */
  deepStatus?: DeepStatus;
}

export class QualityRejectedError extends Error {
  readonly primaryMessage: string;
  /** The same message in Hindi, for the Hindi UI. */
  readonly hindiMessage: string;
  readonly consumesQuota = false;
  /**
   * Nothing is charged for this attempt: refused before the model was asked
   * (gate, scanner), or refused by the server, which refunded it. False only
   * for a refusal made here after the server had charged the reading.
   */
  readonly noCharge: boolean;

  constructor(primaryMessage: string, hindiMessage: string, noCharge = true) {
    super(primaryMessage);
    this.name = 'QualityRejectedError';
    this.primaryMessage = primaryMessage;
    this.hindiMessage = hindiMessage;
    this.noCharge = noCharge;
  }
}

/** Scanner failures that are the connection or a sleeping/overloaded server: worth a plain "try again". */
const SCANNER_OFFLINE_REASONS: ReadonlySet<string> = new Set(['network', 'timeout', 'server']);

/**
 * The line scanner is set up for this build but could not scan this photo
 * (offline, timed out, errored, or busy: paused by the owner, today's scanner
 * ceiling reached). The reading stops here, before the AI is asked: a line
 * report is never built from the AI's guess when the scanner should have
 * traced the lines. Nothing is used; the same photo can be retried.
 */
export class LineScannerUnavailableError extends Error {
  readonly consumesQuota = false;
  /** The connection or the server, not our setup: "try again in a minute" is honest. */
  readonly offline: boolean;
  readonly messages: { en: string; hi: string };

  constructor(readonly reason: string) {
    super(`Line scanner unavailable: ${reason}`);
    this.name = 'LineScannerUnavailableError';
    this.offline = SCANNER_OFFLINE_REASONS.has(reason);
    this.messages = this.offline
      ? {
          en: 'The line scanner is offline or not answering right now, so no report was made — we never guess your lines. Nothing was used. Check your internet and try again.',
          hi: 'लाइन स्कैनर अभी ऑफ़लाइन है या जवाब नहीं दे रहा, इसलिए रिपोर्ट नहीं बनाई गई — हम आपकी रेखाओं का अंदाज़ा नहीं लगाते। कुछ भी खर्च नहीं हुआ। इंटरनेट देखें और फिर कोशिश करें।',
        }
      : reason === 'busy'
      ? {
          en: 'The line scanner is very busy right now, so no report was made — we never guess your lines. Nothing was used. Please try again later.',
          hi: 'लाइन स्कैनर अभी बहुत व्यस्त है, इसलिए रिपोर्ट नहीं बनाई गई — हम आपकी रेखाओं का अंदाज़ा नहीं लगाते। कुछ भी खर्च नहीं हुआ। कृपया थोड़ी देर बाद फिर कोशिश करें।',
        }
      : {
          en: 'The line scanner could not scan this photo right now (a problem on our side), so no report was made — we never guess your lines. Nothing was used. Please try again in a little while.',
          hi: 'लाइन स्कैनर अभी यह फोटो स्कैन नहीं कर सका (हमारी तरफ़ की दिक्कत), इसलिए रिपोर्ट नहीं बनाई गई — हम आपकी रेखाओं का अंदाज़ा नहीं लगाते। कुछ भी खर्च नहीं हुआ। थोड़ी देर बाद फिर कोशिश करें।',
        };
  }
}

/**
 * Stops a reading the line scanner refused (no hand, back of hand, blur...)
 * or could not scan although it is configured. Called before the AI is asked
 * and before anything is charged, so neither costs anything. Only a build with
 * no scanner at all (`reason: 'not_configured'`, no scan function set) continues
 * on the AI's description, and that report is labelled as untraced.
 */
export function assertScanAccepted(scan: LineScanOutcome | undefined): void {
  if (scan?.status === 'unavailable' && scan.reason !== 'not_configured') {
    throw new LineScannerUnavailableError(scan.reason);
  }
  if (scan?.status !== 'rejected') return;
  const message = rejectionMessages(scan);
  throw new QualityRejectedError(message.en, message.hi);
}

/** A heart/head/life line the AI only described counts as read at or above this confidence. */
export const MIN_DESCRIBED_LINE_CONFIDENCE = 0.4;
/** How many of heart, head and life must be readable before an untraced report is written. */
export const MIN_DESCRIBED_MAIN_LINES = 2;

const MAIN_LINES = ['heart', 'head', 'life'] as const;

/**
 * Heart, head and life lines described clearly enough to read: visible, at a
 * usable confidence, with at least two of their shape attributes settled. A
 * line with only "visible: true" and nothing else says nothing a book can read.
 */
export function readableMainLines(observation: PalmObservation): number {
  return observation.lines.filter((line) => {
    if (!(MAIN_LINES as readonly string[]).includes(line.type)) return false;
    if (!line.visible || line.notAnalysed || line.confidence < MIN_DESCRIBED_LINE_CONFIDENCE) return false;
    const settled = [line.length, line.depth, line.curvature, line.continuity, line.startZone, line.endZone].filter(
      (attribute) => attribute.value !== null && attribute.confidence >= MIN_DESCRIBED_LINE_CONFIDENCE,
    ).length;
    return settled >= 2;
  }).length;
}

/** Shown when the photo has no palm in it (a table, a wall...). Thrown before completion, so nothing is used. */
export const NO_PALM_MESSAGE = {
  en: "We couldn't find a palm in this photo, so no reading was used. Take a new photo of your open palm, close to the camera, filling the outline.",
  hi: 'इस फोटो में हमें हथेली नहीं मिली, इसलिए कोई रीडिंग खर्च नहीं हुई। अपनी खुली हथेली की नई फोटो लें — कैमरे के पास, ताकि वह पूरे आकार में भर जाए।',
} as const;

/** The palm side is needed: the photo shows the back of the hand. */
export const BACK_OF_HAND_MESSAGE = {
  en:
    'We need the front of the hand — the palm side, with the fingers open. ' +
    'This photo looks like the back of the hand, so there are no palm lines to read.',
  hi:
    'हमें हाथ का सामने वाला हिस्सा चाहिए — हथेली, उँगलियाँ खुली हुई। ' +
    'यह फोटो हाथ के पिछले हिस्से की लगती है, इसलिए पढ़ने के लिए कोई रेखा नहीं है।',
} as const;

/** The scanner saw creases but none fits the heart, head or life line. */
export const NO_MAIN_LINES_MESSAGE = {
  en:
    'We found creases on this palm but could not identify the heart, head or life line with confidence. ' +
    'Try again with the whole palm flat, fingers open, in even light.',
  hi:
    'इस हथेली पर रेखाएँ तो दिखीं, पर हृदय, मस्तिष्क या जीवन रेखा भरोसे से पहचानी नहीं जा सकी। ' +
    'पूरी हथेली सीधी रखें, उँगलियाँ खुली हों और रोशनी एक-सी हो, फिर कोशिश करें।',
} as const;

/** Without traced lines, fewer than two main lines were clear enough to read. */
export const UNCLEAR_LINES_MESSAGE = {
  en:
    'The heart, head and life lines were not clear enough in this photo to read them properly, so no report was made from it. ' +
    'Retake it with the whole palm flat and filling the frame, fingers open, in bright even light.',
  hi:
    'इस फोटो में हृदय, मस्तिष्क और जीवन रेखा इतनी साफ़ नहीं दिखीं कि उन्हें ठीक से पढ़ा जा सके, इसलिए इससे रिपोर्ट नहीं बनाई गई। ' +
    'पूरी हथेली सीधी और फ्रेम में भरी हुई रखें, उँगलियाँ खुली हों और रोशनी तेज़ व एक-सी हो, फिर फोटो लें।',
} as const;

/** The retake message for the server's `not_a_palm` reason (extract-palm/checks.ts). */
export function rejectionMessage(reason: string | null): { en: string; hi: string } {
  if (reason === 'back_of_hand') return BACK_OF_HAND_MESSAGE;
  if (reason === 'no_main_lines') return NO_MAIN_LINES_MESSAGE;
  if (reason === 'unclear_lines') return UNCLEAR_LINES_MESSAGE;
  return NO_PALM_MESSAGE;
}

/**
 * What the scanner found, sent with the photo so the server applies the same
 * refusals as below (extract-palm/checks.ts rejectionFor). Heart, head and life
 * are counted exactly as the merge will count them.
 */
export function scanHintFor(scan: LineScanOutcome | undefined): { traced: boolean; mainLines: number } | undefined {
  if (!scan || scan.status === 'rejected') return undefined;
  if (scan.status !== 'ok') return { traced: false, mainLines: 0 };
  const empty = { lines: [], mounts: [], handShape: { value: null, confidence: 0 }, warnings: [] };
  const merged = mergeVisionWithScan(empty, scan);
  const mainLines = merged.lines.filter((line) => (MAIN_LINES as readonly string[]).includes(line.type) && line.visible).length;
  return { traced: true, mainLines };
}

/**
 * The observation has no "is a palm present" field, so the model's own
 * warnings are read for it ("no hand visible", "this is not a palm", "image
 * shows a table"...). A back-of-hand warning is handled separately.
 */
export function saysNoPalm(warnings: readonly string[]): boolean {
  return warnings.some((w) =>
    /\b(no|not an?|without an?|cannot see an?|can't see an?|could not find an?|does not (show|contain) an?)\s+(human\s+)?(hand|palm)s?\b(?![\s-]+(lines?|creases?|features?|marks?|drawn)\b)|\b(hand|palm)s?\s+(is\s+|are\s+)?not\s+(visible|present|detected|found)\b/i.test(w),
  );
}

export async function runReading(input: ReadingInput): Promise<ReadingOutcome> {
  assertScanAccepted(input.lineScan);
  if (!input.gate.passed) {
    const issue = input.gate.primaryIssue;
    throw new QualityRejectedError(
      input.gate.primaryMessage ?? 'That photo will not give a reliable reading. Try another.',
      issue ? RETAKE_MESSAGES_HI[issue] : 'इस फोटो से भरोसेमंद रीडिंग नहीं मिलेगी। दूसरी फोटो आज़माएँ।',
    );
  }

  // Same photo, same hand: reuse the description saved when it last made a reading.
  const cacheKey = input.photoKey ?? (input.base64 === undefined ? null : photoKey(input.base64, input.handSide));
  const cached = cacheKey ? cachedExtraction(cacheKey) : null;
  if (cached && input.onCachedExtraction) await input.onCachedExtraction();
  const hint = scanHintFor(input.lineScan);
  let result;
  try {
    result =
      cached ??
      (await input.provider.extract({
        imageUri: input.imageUri,
        ...(input.base64 === undefined ? {} : { base64: input.base64 }),
        ...(input.sessionId === undefined ? {} : { sessionId: input.sessionId }),
        ...(input.onPartial === undefined ? {} : { onPartial: input.onPartial }),
        ...(hint === undefined ? {} : { scan: hint }),
        handSide: input.handSide,
      }));
  } catch (error) {
    // The server found no readable palm and refunded the reading: the same
    // retake message the checks below would give.
    if (error instanceof VisionError && error.kind === 'not_a_palm') {
      const message = rejectionMessage(error.reason);
      throw new QualityRejectedError(message.en, message.hi, error.noCharge);
    }
    throw error;
  }

  const scan = input.lineScan;
  const merged = scan && scan.status !== 'rejected' ? mergeVisionWithScan(result.output, scan) : null;

  const dominance = dominanceOf(input.handSide, input.dominantHand);
  const candidate = {
    schemaVersion: PALM_OBSERVATION_SCHEMA_VERSION,
    capturedAt: new Date().toISOString(),
    hand: {
      side: input.handSide,
      // Compatibility only (DEC-014): unknown/both → false; consumers read `dominance`.
      isDominant: dominance === 'dominant',
      dominantHand: input.dominantHand,
      dominance,
      shape: merged?.handShape ?? result.output.handShape,
    },
    imageQuality: toImageQuality(input.gate, input.gate.sourceWidth, input.gate.sourceHeight),
    lines: merged?.lines ?? result.output.lines,
    mounts: merged?.mounts ?? result.output.mounts,
    warnings: merged?.warnings ?? result.output.warnings,
    // With the scanner, the model's crossings are dropped: their positions were
    // placed by a model that cannot localise (lines/merge.ts).
    ...(!merged && result.output.crossings ? { crossings: result.output.crossings } : {}),
    ...(merged ? { lineScan: merged.lineScan } : {}),
    extractor: {
      provider: input.provider.id,
      model: input.provider.model,
      version: input.provider.version,
      latencyMs: result.latencyMs,
      costUnits: result.costUnits,
    },
  };

  // A model that returns something outside the taxonomy has not produced a
  // weak reading, it has produced an untrustworthy one. Discard it.
  const parsed = palmObservationSchema.safeParse(candidate);
  if (!parsed.success) {
    throw new VisionError(
      'malformed_output',
      input.provider.id,
      `Observation failed validation: ${parsed.error.issues.map((i) => i.path.join('.')).join(', ')}`,
    );
  }

  const observation = parsed.data;

  // Palm side only. Two independent signals, because neither alone is enough:
  // the model is asked to flag a back of hand, and a palm with not one visible
  // major line is not a palm we can read. The deterministic gate cannot tell
  // the two sides apart — both have creases — so this check lives here, after
  // extraction. Measured on 2026-09-15: a back-of-hand photograph passed the
  // gate and produced a full reading. It must not.
  const saysBackOfHand = observation.warnings.some((w) => /back of (the )?hand/i.test(w));
  const readable = observation.lines.filter((line) => !line.notAnalysed);
  const noLinesAtAll = readable.every((line) => !line.visible);
  const noMainLines = readable
    .filter((line) => (MAIN_LINES as readonly string[]).includes(line.type))
    .every((line) => !line.visible);
  // Not a hand at all (a table, a wall, a face): the model says so, or it sees
  // no palm line anywhere without calling it the back of a hand. Checked before
  // the "creases" message, which would wrongly suggest a palm was found.
  // Normally the server already refused (and refunded) these photos with the
  // same checks; a refusal that only happens here comes after the charge.
  const noCharge = input.sessionId === undefined;
  if (!saysBackOfHand && (saysNoPalm(observation.warnings) || noLinesAtAll)) {
    throw new QualityRejectedError(NO_PALM_MESSAGE.en, NO_PALM_MESSAGE.hi, noCharge);
  }
  if (scan?.status === 'ok' && noMainLines && !saysBackOfHand) {
    // The scanner saw creases but none fits the heart, head or life line.
    throw new QualityRejectedError(NO_MAIN_LINES_MESSAGE.en, NO_MAIN_LINES_MESSAGE.hi, noCharge);
  }
  if (saysBackOfHand) {
    throw new QualityRejectedError(BACK_OF_HAND_MESSAGE.en, BACK_OF_HAND_MESSAGE.hi, noCharge);
  }

  // Without traced lines, the report rests entirely on the AI's description of
  // the photo. If that description is too thin — fewer than two of the heart,
  // head and life lines readable — a full line report would be built on almost
  // nothing. Ask for a better photo instead. Thrown before the quota is used.
  if (scan?.status !== 'ok' && readableMainLines(observation) < MIN_DESCRIBED_MAIN_LINES) {
    throw new QualityRejectedError(UNCLEAR_LINES_MESSAGE.en, UNCLEAR_LINES_MESSAGE.hi, noCharge);
  }

  const rules = input.rules ?? KNOWLEDGE_RULES;
  const matchOptions = {
    includeDraftRules: input.provisionalKnowledge ?? true,
    minRuleConfidence: 0.5,
  };
  const evidence = buildEvidence(observation, rules, matchOptions);

  const report = writeReport(evidence, {
    handSide: input.handSide,
    dominance,
  });

  // The synthesis is frozen here (DEC-015) and never recomputed on open. It
  // is pure, so a failure is a bug, not a reason to lose the reading: the
  // report then falls back to the older layout.
  let synthesis: Synthesis | null;
  try {
    synthesis = synthesise(observation, rules, {
      generatedAt: report.generatedAt,
      scanQuality: scanQuality(observation) ?? null,
      matchOptions,
      previous: input.previousSynthesis ?? null,
    });
  } catch {
    synthesis = null;
  }

  if (cacheKey && !cached && evidence.totalMatches > 0) saveExtraction(cacheKey, result);

  return {
    observation,
    report,
    synthesis,
    // A reading that matched nothing is not worth keeping. It is still
    // charged: the server charged it at the first model call (0013), and this
    // flag no longer decides anything about money.
    countsAgainstQuota: evidence.totalMatches > 0,
  };
}
