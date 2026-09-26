// COPIED from palm-ai-new--feat-m1-foundation/src/features/vision/provider.ts at app commit 38389f51b74d (2026-09-26).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import type { VisionOutput } from '../observation/schema';
import type { HandSide } from '../observation/taxonomy';

/**
 * The seam that keeps the product independent of any one model.
 *
 * Business logic depends on this interface and never on a provider. Free
 * quotas change, models get deprecated, and the deprecated UForm entry in
 * Cloudflare's catalogue is a standing reminder of why this seam exists.
 */

export interface VisionInput {
  /** Local file URI. Never a remote URL — we do not upload from the client. */
  imageUri: string;
  /** Already-downscaled base64, if the caller has one, to avoid re-encoding. */
  base64?: string;
  handSide: HandSide;
  /**
   * The server session this extraction belongs to. Required by the remote
   * provider: the Edge Function only calls the model against a session the
   * signed-in user owns and still has allowance for.
   */
  sessionId?: string;
  signal?: AbortSignal;
  /** Called with the model's text so far, when the provider can stream it. */
  onPartial?: (text: string) => void;
  /**
   * What the palm line scanner found on this photo. The server uses it to
   * refuse (and refund) an answer the app would refuse anyway (0013).
   */
  scan?: { traced: boolean; mainLines: number };
}

export interface VisionResult {
  output: VisionOutput;
  latencyMs: number;
  /** Neurons, tokens, or whatever the provider bills in. Null when free. */
  costUnits: number | null;
}

export interface PalmVisionProvider {
  readonly id: string;
  readonly model: string;
  readonly version: string;
  /** False for anything that leaves the device — drives the privacy notice. */
  readonly runsOnDevice: boolean;
  extract(input: VisionInput): Promise<VisionResult>;
}

/**
 * Failure taxonomy.
 *
 * Since 0013 the server charges a reading at its first model call and refunds
 * it itself when the provider fails or the photo is not a readable palm, so a
 * provider failure or a bad photo never spends a reading. `noCharge` carries
 * the server's word on that for each failure.
 */
export type VisionFailureKind =
  | 'unavailable'
  | 'timeout'
  | 'rate_limited'
  | 'quota_exhausted'
  | 'malformed_output'
  | 'rejected_by_provider'
  /** The USER's free readings are used up (not our provider budget). */
  | 'reading_quota_exhausted'
  /** The user started too many readings today. */
  | 'daily_limit'
  /** The server was never reached: offline, or the connection dropped. */
  | 'network'
  /** The server no longer accepts the sign-in (session expired or revoked). */
  | 'unauthenticated'
  /** A guest's free reading is used: a free account (email code or Google) gives 1 more (0013, DEC-036). */
  | 'needs_email_verification'
  /** The owner paused readings, or today's capacity is used up (0013). */
  | 'service_busy'
  /** This reading had its 3 model calls; a new reading is needed (0013). */
  | 'too_many_attempts'
  /** The server found no readable palm in the photo; `reason` says which check (0013). */
  | 'not_a_palm';

export class VisionError extends Error {
  readonly kind: VisionFailureKind;
  readonly consumesQuota = false;
  readonly providerId: string;
  /**
   * The server says nothing is charged for this attempt: refused before the
   * reading was charged, or charged and then refunded. False = unknown (e.g.
   * the connection dropped after the server took the photo) — the screen then
   * makes no promise, and a retry reuses the same session at no extra cost.
   */
  readonly noCharge: boolean;
  /** For `not_a_palm`: which check failed (back_of_hand, no_palm, no_main_lines, unclear_lines). */
  readonly reason: string | null;

  constructor(
    kind: VisionFailureKind,
    providerId: string,
    message: string,
    extra: { noCharge?: boolean; reason?: string | null } = {},
  ) {
    super(message);
    this.name = 'VisionError';
    this.kind = kind;
    this.providerId = providerId;
    this.noCharge = extra.noCharge ?? false;
    this.reason = extra.reason ?? null;
  }
}

/** Edge Function codes that are refused before any reading is charged. */
const REFUSED_BEFORE_CHARGE: ReadonlySet<string> = new Set([
  'provider_not_configured',
  'image_too_large',
  'bad_image',
  'invalid_body',
  // The upload stalled; the body is read before anything is claimed.
  'body_timeout',
  'invalid_session',
  'unauthenticated',
  'needs_email_verification',
  'no_readings_left',
  'reading_quota_exhausted',
  'service_paused',
  'daily_capacity_reached',
  'daily_limit',
  'too_many_attempts',
]);

/**
 * The extract-palm function's error vocabulary → our failure taxonomy.
 * `refunded` is the function's own word on whether the charge was given back.
 */
export function visionErrorFromCode(
  code: string,
  providerId: string,
  extra: { refunded?: boolean; reason?: string | null } = {},
): VisionError {
  const noCharge = REFUSED_BEFORE_CHARGE.has(code) || extra.refunded === true;
  const make = (kind: VisionFailureKind, message: string) =>
    new VisionError(kind, providerId, message, { noCharge, reason: extra.reason ?? null });
  switch (code) {
    case 'rate_limited':
      return make('rate_limited', 'Provider rate limited the request.');
    case 'quota_exhausted':
      return make('quota_exhausted', 'Daily neuron budget is spent.');
    case 'timeout':
      return make('timeout', 'Provider did not respond in time.');
    case 'provider_not_configured':
      return make('unavailable', 'No provider credentials configured.');
    case 'image_too_large':
      return make('rejected_by_provider', 'Image exceeded the size limit.');
    case 'bad_image':
      return make('rejected_by_provider', 'Image was not a JPEG or PNG.');
    case 'empty_response':
      return make('malformed_output', 'Provider returned nothing.');
    case 'reading_quota_exhausted':
    case 'no_readings_left':
      return make('reading_quota_exhausted', 'User allowance is used up.');
    case 'daily_limit':
      return make('daily_limit', 'User hit the daily session limit.');
    case 'needs_email_verification':
      return make('needs_email_verification', 'Guest free readings are used; an email code is needed.');
    case 'service_paused':
    case 'daily_capacity_reached':
      return make('service_busy', `Readings are not running: ${code}`);
    case 'too_many_attempts':
      return make('too_many_attempts', 'This session had its model calls.');
    case 'not_a_palm':
      return make('not_a_palm', `No readable palm: ${extra.reason ?? 'unknown'}`);
    case 'unauthenticated':
      // A 401 after a long idle: the stored session was refused. The fix is to
      // sign in again, not "the service is unavailable".
      return make('unauthenticated', 'The sign-in was not accepted.');
    default:
      // provider_unavailable and anything unknown.
      return make('unavailable', `Provider failed: ${code}`);
  }
}

/**
 * A dropped connection or a deadline: worth one quiet automatic retry. Never a
 * refusal (4xx, quota, sign-in, bad output) — those would fail the same way.
 */
export function isTransientVisionFailure(error: unknown): boolean {
  return error instanceof VisionError && (error.kind === 'network' || error.kind === 'timeout');
}

/**
 * The error screen's title for a failure that is the connection's or the
 * server's, not the photo's: each cause says what really happened, so a busy
 * or paused server is never called a "connection problem". Null means the
 * screen's general title fits.
 */
const FAILURE_TITLES: Partial<Record<VisionFailureKind, { en: string; hi: string }>> = {
  network: { en: 'No internet — your photo is kept', hi: 'इंटरनेट नहीं है — आपकी फोटो रखी हुई है' },
  timeout: { en: 'That took too long — your photo is kept', hi: 'बहुत देर लगी — आपकी फोटो रखी हुई है' },
  rate_limited: { en: 'Our reader is busy — your photo is safe', hi: 'हमारा रीडर अभी व्यस्त है — आपकी फोटो सुरक्षित है' },
  unavailable: { en: 'Our reader is not answering — your photo is kept', hi: 'हमारा रीडर जवाब नहीं दे रहा — आपकी फोटो रखी हुई है' },
  service_busy: { en: 'Readings are paused for a while', hi: 'रीडिंग कुछ देर के लिए रुकी हैं' },
  quota_exhausted: { en: "Today's reading capacity is used up", hi: 'आज की रीडिंग क्षमता पूरी हो गई' },
};

export function failureTitle(kind: VisionFailureKind | null | undefined): { en: string; hi: string } | null {
  return kind ? (FAILURE_TITLES[kind] ?? null) : null;
}

/** What the user is told, in both UI languages. Never the raw provider error. */
export const VISION_FAILURE_MESSAGES: Record<VisionFailureKind, { en: string; hi: string }> = {
  unavailable: {
    en: 'The reading service is not answering right now. Please try again in a little while.',
    hi: 'रीडिंग सेवा अभी जवाब नहीं दे रही है। थोड़ी देर बाद फिर कोशिश करें।',
  },
  timeout: {
    en: 'That took too long and we stopped it. Try again with the same photo — it will not use another reading.',
    hi: 'बहुत देर लग रही थी, इसलिए रोक दिया। इसी फोटो से फिर कोशिश करें — इससे दूसरी रीडिंग खर्च नहीं होगी।',
  },
  rate_limited: {
    en: 'A lot of readings are running right now. Try again in a minute with the same photo — it will not use another reading.',
    hi: 'अभी बहुत सारी रीडिंग चल रही हैं। एक मिनट बाद इसी फोटो से फिर कोशिश करें — इससे दूसरी रीडिंग खर्च नहीं होगी।',
  },
  quota_exhausted: {
    en: "Today's reading capacity is used up. Please try again tomorrow.",
    hi: 'आज की रीडिंग क्षमता पूरी हो गई है। कृपया कल फिर कोशिश करें।',
  },
  malformed_output: {
    en: 'The analysis came back in a form we could not trust, so we discarded it rather than guess.',
    hi: 'विश्लेषण ऐसे रूप में आया जिस पर भरोसा नहीं किया जा सकता, इसलिए अंदाज़ा लगाने के बजाय उसे हटा दिया।',
  },
  rejected_by_provider: {
    en: 'The analysis service would not process that image. Try a fresh photo.',
    hi: 'विश्लेषण सेवा ने यह फोटो स्वीकार नहीं की। नई फोटो लेकर देखें।',
  },
  reading_quota_exhausted: {
    en: "You've used your free readings. Nothing more has been charged.",
    hi: 'आपकी मुफ़्त रीडिंग पूरी हो गई हैं। कोई और शुल्क नहीं लिया गया।',
  },
  daily_limit: {
    en: "You've started a lot of readings today. Please come back tomorrow.",
    hi: 'आज आपने बहुत सारी रीडिंग शुरू कीं। कृपया कल फिर आएँ।',
  },
  network: {
    en: 'You seem to be offline, or the connection dropped. Check your internet and try again with the same photo — it will not use another reading.',
    hi: 'लगता है इंटरनेट बंद है या कनेक्शन टूट गया। इंटरनेट जाँचकर इसी फोटो से फिर कोशिश करें — इससे दूसरी रीडिंग खर्च नहीं होगी।',
  },
  unauthenticated: {
    en: 'Your sign-in has expired. Sign in again and try once more — nothing was used up.',
    hi: 'आपका साइन इन समाप्त हो गया है। फिर से साइन इन करके कोशिश करें — कुछ भी खर्च नहीं हुआ।',
  },
  needs_email_verification: {
    en: 'You have had your free reading as a guest. Create a free account — Google, or your email with a 6-digit code, no password — and this reading is free too. No reading was used for this try.',
    hi: 'मेहमान के तौर पर आपकी मुफ़्त रीडिंग हो गई। मुफ़्त खाता बनाएँ — Google से, या 6 अंकों के कोड से ईमेल पक्का करके, बिना पासवर्ड — और यह रीडिंग भी मुफ़्त होगी। इस कोशिश में कोई रीडिंग खर्च नहीं हुई।',
  },
  service_busy: {
    en: 'We are very busy right now, so readings are paused for a while. Please try again later — no reading was used.',
    hi: 'अभी बहुत भीड़ है, इसलिए रीडिंग कुछ देर के लिए रुकी हैं। कृपया बाद में कोशिश करें — कोई रीडिंग खर्च नहीं हुई।',
  },
  too_many_attempts: {
    en: 'This reading was already tried several times. Please start a new reading with a fresh photo.',
    hi: 'यह रीडिंग कई बार कोशिश हो चुकी है। कृपया नई फोटो के साथ नई रीडिंग शुरू करें।',
  },
  not_a_palm: {
    en: "We couldn't read a palm in this photo, so no reading was used. Take a new photo of your open palm, close to the camera.",
    hi: 'इस फोटो में हमें पढ़ने लायक हथेली नहीं मिली, इसलिए कोई रीडिंग खर्च नहीं हुई। अपनी खुली हथेली की नई फोटो लें, कैमरे के पास से।',
  },
};
