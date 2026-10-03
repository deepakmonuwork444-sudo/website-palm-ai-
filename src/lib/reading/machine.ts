/**
 * The web reading flow (plan §8.1–8.3, skill web-reading-flow): one controller
 * for the whole island, with every dependency injected so the flow is tested
 * in Node with a mock backend (tests/unit/reading-machine.test.ts).
 *
 * idle → checking (local) → review (pass / fail) → working: gating (Turnstile,
 * guest session, web pass, start_web_reading) → sending → tracing (scan-palm)
 * → found (the real lines draw) → reading (extract-palm) → writing (the app's
 * pipeline + locks, in the browser) → revealed → lock / sign-up sheets → code
 * → verified → notice before the last free reading → … → revealed 2 → zero.
 *
 * The server owns the free rule (F4): this file never counts readings; it
 * reads reading_balance() and reacts to the server's refusals. The report is
 * built by the app's own runReading (copied), locked with lockSynthesis before
 * anything is stored or shown, so a locked part's text never reaches the DOM.
 */

import type { FinishedSynthesis } from './palm/features/knowledge/synthesis/modules';
import { hasFinishedReading } from './palm/features/knowledge/synthesis/modules';
import { analysedSide } from './palm/features/lines/client';
import { LIVE_FAINT_BELOW } from './palm/features/lines/live-scan';
import { rejectionMessages } from './palm/features/lines/merge';
import type { LineServiceResponse } from './palm/features/lines/types';
import type { DominantHand } from './palm/features/observation/schema';
import type { HandSide } from './palm/features/observation/taxonomy';
import type { GateResult } from './palm/features/quality/gate';
import { FREE_LOCKED_SECTIONS, lockSynthesis } from './palm/features/reading/access';
import { LineScannerUnavailableError, QualityRejectedError, runReading } from './palm/features/reading/pipeline';
import type { SectionKey } from './palm/features/reading/report-sections';
import { VisionError } from './palm/features/vision/provider';
import type { GoogleFailure } from '../auth/google';
import { newKey, webVisionProvider, type Balance, type ReadingApi, type WebUser } from './api';
import type { ReadingMode } from './config';
import { ReadingError, planFor, toReadingError, type ReadingErrorCode } from './errors';
import type { WebEvent } from './events';
import type { EncodedCopy, PreparedPhoto, RgbaCopy } from './image';
import type { ReadingStore, SavedReading, StoredHand, TracedLine, TracedLineName } from './store';
import type { TokenSource } from './turnstile';

/** `done`: the reading is saved while the live scan still plays (holdForShow); the report opens on endShow(). */
export type Stage = 'gating' | 'sending' | 'tracing' | 'found' | 'reading' | 'writing' | 'done';

export interface Bilingual {
  en: string;
  hi: string;
}

export type Screen =
  | { name: 'loading' }
  | { name: 'off' }
  | { name: 'idle' }
  | { name: 'checking' }
  | { name: 'review' }
  | {
      name: 'working';
      stage: Stage;
      /** The scanner's accepted lines; null until the scan answers. */
      lines: TracedLine[] | null;
      /** The scanner's hand (landmarks, outline); null until the scan answers or when it found none. */
      hand: StoredHand | null;
      /** The hand the reading uses (the scanner may correct the choice); null before the scan. */
      side: HandSide | null;
      slow: boolean;
      /** The saved reading, once stage is `done`. */
      readingId: string | null;
    }
  | { name: 'rejected'; message: Bilingual; noCharge: boolean }
  | { name: 'error'; code: ReadingErrorCode }
  | { name: 'revealed'; readingId: string }
  | { name: 'zero' };

export type SignupMessage = 'codeSent' | 'emailTaken' | 'waitCode' | 'codesOff' | 'badEmail' | 'badCode' | 'wrongCode' | GoogleMessage;

/** Google sign-in did not finish (lib/auth/google.ts GoogleFailure → the sheet's words). */
export type GoogleMessage = 'googleOff' | 'googleOffline' | 'googleWait' | 'googleFailed';

const GOOGLE_MESSAGE: Record<GoogleFailure, GoogleMessage> = {
  not_configured: 'googleOff',
  offline: 'googleOffline',
  wait: 'googleWait',
  failed: 'googleFailed',
};

export type Sheet =
  | { kind: 'lock'; section: SectionKey }
  | {
      kind: 'signup';
      step: 'email' | 'code';
      email: string;
      /** email_change: a guest adds an email; email: sign in to an existing account. */
      via: 'email_change' | 'email';
      busy: boolean;
      message: SignupMessage | null;
      /** signIn: this browser had an account and was signed out (case 20): "Sign in to read". */
      reason?: 'signup' | 'signIn';
    };

export interface PhotoInPlay {
  prepared: PreparedPhoto;
  url: string;
  /** One idempotency key per photo, reused on every retry (never a double charge). */
  key: string;
  gate: GateResult;
  /**
   * The photo the lines are drawn on: the visitor's own (live), or in preview
   * (mock) mode the sample palm the stored scan belongs to (WEB-DEC-043). The
   * photo check always runs on the visitor's own photo.
   */
  shown: ShownPhoto;
}

export interface ShownPhoto {
  url: string;
  width: number;
  height: number;
  /** True: the preview's sample palm, not the visitor's photo. */
  sample: boolean;
}

/** Preview (mock) mode only: the photo the stored mock scan was made from. */
export interface SamplePhoto {
  url: string;
  width: number;
  height: number;
  /** The photo's bytes, saved with the preview reading instead of the visitor's photo. */
  load(): Promise<Blob>;
}

export interface FlowState {
  mode: ReadingMode;
  screen: Screen;
  sheet: Sheet | null;
  photo: PhotoInPlay | null;
  hand: HandSide;
  /** "Is this the hand you write with?" — null until answered. */
  writes: boolean | null;
  user: WebUser | null;
  balance: Balance | null;
  readings: SavedReading[];
  /** Show "This is your … last free reading" before the next scan. */
  lastNotice: boolean;
  /** The reading revealed just now (its lines draw in once); null for a reading opened later. */
  fresh: string | null;
  /**
   * guestNotMoved: Google (or a code) signed in to an EXISTING account, so the guest's
   * reading stays in this browser only and was not moved into it (owner, case 2).
   */
  notice: 'guestNotMoved' | null;
}

export interface FlowDeps {
  mode: ReadingMode;
  api: ReadingApi | null;
  tokens: TokenSource;
  store: ReadingStore;
  preparePhoto(file: Blob): Promise<PreparedPhoto>;
  shrink(blob: Blob): Promise<EncodedCopy>;
  checkPhoto(check: RgbaCopy, sourceWidth: number, sourceHeight: number): GateResult;
  objectUrl(blob: Blob): string;
  revokeUrl(url: string): void;
  sleep(ms: number): Promise<void>;
  track?(event: WebEvent, detail?: string): void;
  /** Calls back once when the browser is online again. */
  onceOnline?(callback: () => void): void;
  now?(): Date;
  /** How long "Lines found" shows while the real lines draw (ms). */
  lineDrawMs?: number;
  /** After this long in one reading, say it is slow and offer "Try again". */
  slowAfterMs?: number;
  /** Preview (mock) mode: draw and keep the lines on this sample palm, never on the visitor's photo. */
  sample?: SamplePhoto;
  /**
   * The page plays the live scan before the report (WEB-DEC-043): a finished
   * reading waits in stage `done` until endShow() ("Skip" or the show's end).
   */
  holdForShow?: boolean;
  /** This browser had a real account and is signed out now: ask to sign in instead of making a new guest (case 20). */
  hadAccount?(): boolean;
}

const MAIN_LINES: readonly TracedLineName[] = ['life', 'head', 'heart', 'fate'];

/** What the scan found, carried on the working screen for the live scan. */
interface ScanFound {
  lines: TracedLine[];
  hand: StoredHand | null;
  side: HandSide;
}
/** A pass lasts 10 minutes on the server; ask again a little before. */
const PASS_REUSE_MS = 9 * 60_000;

/**
 * The scanner's accepted main lines (normalised polylines), in the order life,
 * head, heart, fate. `faint`: the crease was seen weakly (pixel_confidence
 * below the app's LIVE_FAINT_BELOW, 0.6), drawn dashed as in the app.
 */
export function tracedLinesFromScan(response: LineServiceResponse): TracedLine[] {
  const lines = response.lines;
  if (!lines) return [];
  const out: TracedLine[] = [];
  for (const type of MAIN_LINES) {
    const line = lines[type];
    if (line && line.present && line.label === type && line.polyline.length >= 2) {
      out.push({ type, path: line.polyline.map(([x, y]) => [x, y] as [number, number]), faint: line.pixel_confidence < LIVE_FAINT_BELOW });
    }
  }
  return out;
}

/** The scanner's hand (21 landmarks, handedness, outline when sent); null when it found none. */
export function handFromScan(response: LineServiceResponse): StoredHand | null {
  const hand = response.hand;
  if (!hand || hand.landmarks.length !== 21) return null;
  const outline = hand.outline && hand.outline.length >= 8 ? hand.outline.map(([x, y]) => [x, y] as [number, number]) : null;
  return { landmarks: hand.landmarks.map(([x, y]) => [x, y] as [number, number]), handedness: hand.handedness, outline };
}

/** The observation's traced main lines (what the saved reading draws); `faint` comes from the scan's lines. */
export function tracedLinesFromObservation(
  lines: readonly { type: string; visible: boolean; path?: [number, number][] | undefined }[],
  scanned: readonly TracedLine[] = [],
): TracedLine[] {
  const out: TracedLine[] = [];
  for (const type of MAIN_LINES) {
    const line = lines.find((l) => l.type === type);
    if (line?.visible && line.path && line.path.length >= 2) {
      out.push({ type, path: line.path, faint: scanned.find((s) => s.type === type)?.faint === true });
    }
  }
  return out;
}

export function dominantHandOf(side: HandSide, writes: boolean | null): DominantHand {
  if (writes === null) return 'unknown';
  if (writes) return side;
  return side === 'left' ? 'right' : 'left';
}

/** A preview reading from before WEB-DEC-043: the sample scan's lines on the visitor's own photo. */
export function isStalePreview(reading: Pick<SavedReading, 'preview' | 'hand'>): boolean {
  return reading.preview && reading.hand === undefined;
}

function otherSide(side: HandSide): HandSide {
  return side === 'left' ? 'right' : 'left';
}

/** A VisionError the app pipeline threw → our error code. */
function fromVision(error: VisionError): ReadingError {
  switch (error.kind) {
    case 'network':
      return new ReadingError('offline', error.kind);
    case 'rate_limited':
      return new ReadingError('rate_limited', error.kind);
    case 'quota_exhausted':
    case 'service_busy':
      return new ReadingError('daily_capacity_reached', error.kind);
    case 'reading_quota_exhausted':
      return new ReadingError('no_readings_left', error.kind);
    case 'needs_email_verification':
      return new ReadingError('needs_email_verification', error.kind);
    case 'daily_limit':
    case 'too_many_attempts':
      return new ReadingError('too_many_attempts', error.kind);
    case 'unauthenticated':
      return new ReadingError('unauthenticated', error.kind);
    default:
      return new ReadingError('server', error.kind, { noCharge: error.noCharge });
  }
}

export class ReadingFlow {
  private state: FlowState;
  private listeners = new Set<() => void>();
  private runId = 0;
  private passAt = 0;
  private slowTimer: ReturnType<typeof setTimeout> | null = null;
  /** The live scan ended (or "Skip" was tapped) for the current run: the report opens as soon as it is saved. */
  private showEnded = false;

  constructor(private readonly deps: FlowDeps) {
    this.state = {
      mode: deps.mode,
      screen: { name: deps.mode === 'off' ? 'off' : 'loading' },
      sheet: null,
      photo: null,
      hand: 'right',
      writes: null,
      user: null,
      balance: null,
      readings: [],
      lastNotice: false,
      fresh: null,
      notice: null,
    };
  }

  /* ── store plumbing (useSyncExternalStore) ── */

  getState = (): FlowState => this.state;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private set(patch: Partial<FlowState>): void {
    this.state = { ...this.state, ...patch };
    for (const listener of this.listeners) listener();
  }

  private track(event: WebEvent, detail?: string): void {
    this.deps.track?.(event, detail);
  }

  private now(): Date {
    return this.deps.now?.() ?? new Date();
  }

  /** The reading on screen. */
  reading(id: string): SavedReading | null {
    return this.state.readings.find((r) => r.id === id) ?? null;
  }

  /* ── start ── */

  async init(): Promise<void> {
    if (this.state.mode === 'off' || !this.deps.api) {
      this.set({ screen: { name: 'off' } });
      return;
    }
    const stored = await this.deps.store.list().catch(() => [] as SavedReading[]);
    // Preview readings saved before WEB-DEC-043 drew the sample scan's lines on the visitor's
    // own photo (owner: lines not on the real creases). They carry no `hand`: drop them.
    const stale = stored.filter(isStalePreview);
    for (const r of stale) await this.deps.store.remove(r.id).catch(() => undefined);
    const readings = stored.filter((r) => !isStalePreview(r));
    // A stored session only: nobody is signed in on page load (invariant 5).
    const user = await this.deps.api.currentUser().catch(() => null);
    const balance = user ? await this.deps.api.balance().catch(() => null) : null;
    const latest = readings[readings.length - 1];
    let screen: Screen = { name: 'idle' };
    if (balance && balance.freeRemaining === 0 && readings.length > 0) screen = { name: 'zero' };
    else if (latest) screen = { name: 'revealed', readingId: latest.id };
    if (screen.name === 'zero') this.track('zero_state_view');
    this.set({
      readings,
      user,
      balance,
      screen,
      lastNotice: Boolean(user && !user.isGuest && balance && balance.freeNow > 0 && balance.freeRemaining === 1),
      hand: latest ? otherSide(latest.handSide) : 'right',
    });
  }

  /* ── photo ── */

  async pick(file: Blob): Promise<void> {
    this.clearPhoto();
    this.set({ screen: { name: 'checking' }, sheet: null });
    this.track('upload_start');
    let prepared: PreparedPhoto;
    try {
      prepared = await this.deps.preparePhoto(file);
    } catch (caught) {
      const error = toReadingError(caught);
      const code = error.code === 'heic' ? 'heic' : 'decode';
      this.track('photo_check_fail', code);
      this.set({ screen: { name: 'error', code } });
      return;
    }
    const gate = this.deps.checkPhoto(prepared.check, prepared.sourceWidth, prepared.sourceHeight);
    this.track(gate.passed ? 'photo_check_pass' : 'photo_check_fail', gate.passed ? '' : (gate.primaryIssue ?? ''));
    const url = this.deps.objectUrl(prepared.blob);
    const sample = this.sample();
    const shown: ShownPhoto = sample
      ? { url: sample.url, width: sample.width, height: sample.height, sample: true }
      : { url, width: prepared.scan.width, height: prepared.scan.height, sample: false };
    const photo: PhotoInPlay = { prepared, url, key: newKey(), gate, shown };
    this.set({ photo, screen: { name: 'review' } });
  }

  /** Preview (mock) mode's sample palm; null in live mode. */
  private sample(): SamplePhoto | null {
    return this.deps.api?.mode === 'mock' ? (this.deps.sample ?? null) : null;
  }

  setHand(hand: HandSide): void {
    this.set({ hand });
  }

  setWrites(writes: boolean): void {
    this.set({ writes });
  }

  retake(): void {
    this.cancelRun();
    this.clearPhoto();
    this.set({ screen: { name: 'idle' }, sheet: null });
  }

  private clearPhoto(): void {
    if (this.state.photo) this.deps.revokeUrl(this.state.photo.url);
    this.state = { ...this.state, photo: null };
  }

  /* ── the reading ── */

  /** "Use this photo": only for a photo that passed the local check. */
  async use(): Promise<void> {
    const photo = this.state.photo;
    if (!photo || !photo.gate.passed || !this.deps.api) return;
    if (this.deps.hadAccount?.()) {
      // Signed out on a browser that had an account: no silent new guest (and no new free reading).
      const current = await this.deps.api.currentUser().catch(() => null);
      if (!current) {
        this.openSignup('signIn');
        return;
      }
    }
    await this.run(photo);
  }

  /** "Try again" on an error or a slow reading: the same photo and the same key. */
  async retry(): Promise<void> {
    const photo = this.state.photo;
    if (!photo) {
      this.set({ screen: { name: 'idle' } });
      return;
    }
    await this.run(photo);
  }

  private cancelRun(): void {
    this.runId += 1;
    this.showEnded = false;
    if (this.slowTimer) clearTimeout(this.slowTimer);
    this.slowTimer = null;
  }

  private working(run: number, stage: Stage, found: ScanFound | null = null): void {
    if (run !== this.runId) return;
    const slow = this.state.screen.name === 'working' ? this.state.screen.slow : false;
    this.set({ screen: { name: 'working', stage, lines: found?.lines ?? null, hand: found?.hand ?? null, side: found?.side ?? null, slow, readingId: null } });
  }

  /**
   * The live scan finished, or "Skip to my reading" was tapped: the report
   * opens now if the reading is saved, else the moment it is.
   */
  endShow(): void {
    this.showEnded = true;
    const screen = this.state.screen;
    if (screen.name === 'working' && screen.stage === 'done' && screen.readingId) this.reveal(screen.readingId);
  }

  private reveal(readingId: string, patch: Partial<FlowState> = {}): void {
    // The photo now belongs to the saved reading; a new one starts clean.
    this.state = { ...this.state, photo: null };
    this.set({ ...patch, screen: { name: 'revealed', readingId } });
  }

  private async run(photo: PhotoInPlay): Promise<void> {
    this.cancelRun();
    const run = this.runId;
    this.set({ screen: { name: 'working', stage: 'gating', lines: null, hand: null, side: null, slow: false, readingId: null }, sheet: null });
    if (this.deps.slowAfterMs) {
      this.slowTimer = setTimeout(() => {
        const screen = this.state.screen;
        if (run === this.runId && screen.name === 'working') this.set({ screen: { ...screen, slow: true } });
      }, this.deps.slowAfterMs);
    }
    const tried = { restart: false, shrink: false, regate: false, resign: false };
    let scanCopy = photo.prepared.scan;
    try {
      for (;;) {
        try {
          await this.runOnce(run, photo, scanCopy);
          return;
        } catch (caught) {
          if (run !== this.runId) return;
          const error = caught instanceof VisionError ? fromVision(caught) : toReadingError(caught);
          const plan = planFor(error.code);
          if (plan.kind === 'retry' && plan.auto === 'restart-session' && !tried.restart) {
            // The session closed under us (expired, refunded): a new one, once, silently.
            tried.restart = true;
            photo.key = newKey();
            continue;
          }
          if (plan.kind === 'retry' && plan.auto === 'shrink' && !tried.shrink) {
            tried.shrink = true;
            scanCopy = await this.deps.shrink(photo.prepared.blob);
            continue;
          }
          if (plan.kind === 'retry' && plan.auto === 'regate' && !tried.regate) {
            tried.regate = true;
            this.passAt = 0;
            continue;
          }
          if (plan.kind === 'retry' && plan.auto === 'resign-in' && !tried.resign) {
            tried.resign = true;
            this.passAt = 0;
            continue;
          }
          this.failWith(error);
          return;
        }
      }
    } finally {
      if (run === this.runId && this.slowTimer) {
        clearTimeout(this.slowTimer);
        this.slowTimer = null;
      }
    }
  }

  private async runOnce(run: number, photo: PhotoInPlay, scanCopy: EncodedCopy): Promise<void> {
    const api = this.deps.api!;
    const hand = this.state.hand;
    const writes = this.state.writes;

    // 1. Gating: guest session (only now, after a photo), Turnstile, web pass, session.
    this.working(run, 'gating');
    const user = await api.ensureGuest();
    if (run !== this.runId) return;
    this.set({ user });
    if (!this.passAt || this.now().getTime() - this.passAt > PASS_REUSE_MS) {
      let token: string;
      try {
        token = await this.deps.tokens.token();
      } catch {
        throw new ReadingError('turnstile', 'widget');
      }
      await api.webGate(token);
      this.passAt = this.now().getTime();
    }
    const session = await api.startWebReading(hand, writes === true, photo.key);
    if (run !== this.runId) return;
    const number = user.isGuest ? '1' : '2';
    this.track('reading_start', number);

    // 2. Sending, then tracing (scan-palm) — real stages: the switch is the upload finishing.
    this.working(run, 'sending');
    const scan = await api.scan(session.id, scanCopy.base64, hand, () => this.working(run, 'tracing'));
    if (run !== this.runId) return;
    if (scan.status === 'rejected') {
      await api.fail(session.id, 'scan_rejected');
      this.track('reading_error', 'not_a_palm');
      this.set({ screen: { name: 'rejected', message: rejectionMessages(scan), noCharge: true } });
      return;
    }
    if (scan.status !== 'ok') throw new ReadingError('scanner_unavailable', scan.reason);
    const side = analysedSide(scan.response, hand);
    const lines = tracedLinesFromScan(scan.response);
    const found: ScanFound = { lines, hand: handFromScan(scan.response), side };

    // 3. Lines found: the real hand and lines draw on the photo (the live scan).
    this.working(run, 'found', found);
    this.track('lines_found');
    const drawMs = this.deps.lineDrawMs ?? 1400;
    if (drawMs > 0) await this.deps.sleep(drawMs);
    if (run !== this.runId) return;

    // 4. Reading: extract-palm through the app's own pipeline (charges the free reading; refunds a bad photo).
    this.working(run, 'reading', found);
    let outcome;
    try {
      outcome = await runReading({
        imageUri: `web:${session.id}`,
        base64: photo.prepared.extract.base64,
        handSide: side,
        dominantHand: dominantHandOf(side, writes),
        gate: photo.gate,
        provider: webVisionProvider(api, session.id),
        sessionId: session.id,
        lineScan: scan,
      });
    } catch (caught) {
      if (caught instanceof QualityRejectedError) {
        if (run !== this.runId) return;
        await api.fail(session.id, 'rejected');
        this.track('reading_error', 'not_a_palm');
        this.set({ screen: { name: 'rejected', message: { en: caught.primaryMessage, hi: caught.hindiMessage }, noCharge: caught.noCharge } });
        return;
      }
      if (caught instanceof LineScannerUnavailableError) throw new ReadingError('scanner_unavailable', caught.reason);
      throw caught;
    }
    if (run !== this.runId) return;

    // 5. Writing: locks applied BEFORE anything is stored or shown.
    this.working(run, 'writing', found);
    const synthesis: FinishedSynthesis | null = hasFinishedReading(outcome.synthesis)
      ? lockSynthesis(outcome.synthesis as FinishedSynthesis, FREE_LOCKED_SECTIONS)
      : null;
    await this.completeWithRetry(session.id, outcome);
    if (run !== this.runId) return;

    let drawn = tracedLinesFromObservation(outcome.observation.lines, lines);
    let savedHand = found.hand;
    let kept: { blob: Blob; width: number; height: number } = { blob: photo.prepared.blob, width: photo.prepared.scan.width, height: photo.prepared.scan.height };
    const sample = photo.shown.sample ? this.sample() : null;
    if (sample) {
      // Preview: the stored scan belongs to the sample palm, so the reading keeps THAT photo.
      try {
        kept = { blob: await sample.load(), width: sample.width, height: sample.height };
      } catch {
        // Never draw the sample's lines on the visitor's photo.
        drawn = [];
        savedHand = null;
      }
      if (run !== this.runId) return;
    }
    const reading: SavedReading = {
      id: session.id,
      createdAt: this.now().toISOString(),
      handSide: side,
      photo: kept.blob,
      photoWidth: kept.width,
      photoHeight: kept.height,
      lines: drawn,
      missing: MAIN_LINES.filter((type) => !drawn.some((l) => l.type === type)),
      hand: savedHand,
      synthesis,
      preview: api.mode === 'mock',
    };
    await this.deps.store.put(reading).catch(() => undefined);
    const balance = await api.balance().catch(() => this.state.balance);
    this.track('reading_done', number);
    const readings = [...this.state.readings.filter((r) => r.id !== reading.id), reading];
    const saved = { readings, balance, lastNotice: false, hand: otherSide(side), writes: null, fresh: reading.id };
    if (this.deps.holdForShow && !this.showEnded && run === this.runId) {
      // The live scan is still playing: the report opens on endShow().
      this.set({ ...saved, screen: { name: 'working', stage: 'done', lines, hand: found.hand, side, slow: false, readingId: reading.id } });
      return;
    }
    this.reveal(reading.id, saved);
  }

  /** complete_reading is idempotent: a dropped answer is retried twice before giving up. */
  private async completeWithRetry(sessionId: string, outcome: Parameters<ReadingApi['complete']>[1]): Promise<void> {
    for (let attempt = 0; ; attempt += 1) {
      try {
        await this.deps.api!.complete(sessionId, outcome);
        return;
      } catch (caught) {
        const error = toReadingError(caught);
        if (error.code !== 'offline' || attempt >= 2) throw error;
        await this.deps.sleep(1500 * (attempt + 1));
      }
    }
  }

  private failWith(error: ReadingError): void {
    const plan = planFor(error.code);
    this.track('reading_error', error.code === 'web_pass_required' ? 'turnstile' : error.code === 'unauthenticated' || error.code === 'not_configured' || error.code === 'heic' || error.code === 'decode' || error.code === 'server' ? 'other' : error.code);
    if (plan.kind === 'zero') {
      this.track('zero_state_view');
      this.set({ screen: { name: 'zero' } });
      void this.refreshBalance();
      return;
    }
    if (plan.kind === 'signup') {
      this.set({ screen: { name: 'review' } });
      this.openSignup();
      return;
    }
    this.set({ screen: { name: 'error', code: error.code } });
    if (plan.kind === 'retry' && plan.auto === 'when-online') {
      this.deps.onceOnline?.(() => {
        if (this.state.screen.name === 'error' && this.state.screen.code === 'offline') void this.retry();
      });
    }
  }

  async refreshBalance(): Promise<void> {
    if (!this.deps.api || !this.state.user) return;
    const balance = await this.deps.api.balance().catch(() => null);
    if (balance) this.set({ balance });
  }

  /* ── report, sheets ── */

  showReading(id: string): void {
    if (this.reading(id)) this.set({ screen: { name: 'revealed', readingId: id }, sheet: null, fresh: null });
  }

  showZero(): void {
    this.track('zero_state_view');
    this.set({ screen: { name: 'zero' }, sheet: null });
  }

  async removeReading(id: string): Promise<void> {
    await this.deps.store.remove(id).catch(() => undefined);
    const readings = this.state.readings.filter((r) => r.id !== id);
    const screen = this.state.screen.name === 'revealed' && this.state.screen.readingId === id ? ({ name: 'zero' } as Screen) : this.state.screen;
    this.set({ readings, screen });
  }

  /** "Read another palm" / "Take a photo of my other hand". */
  startNew(): void {
    this.cancelRun();
    this.clearPhoto();
    const b = this.state.balance;
    const last = Boolean(b && b.freeNow > 0 && b.freeRemaining === 1 && this.state.user && !this.state.user.isGuest);
    this.set({ screen: { name: 'idle' }, sheet: null, lastNotice: last });
  }

  openLock(section: SectionKey): void {
    this.track('lock_tap', section);
    this.set({ sheet: { kind: 'lock', section } });
  }

  openSignup(reason: 'signup' | 'signIn' = 'signup'): void {
    this.track('signup_start');
    this.set({ sheet: { kind: 'signup', step: 'email', email: '', via: 'email_change', busy: false, message: null, reason } });
  }

  dismissNotice(): void {
    this.set({ notice: null });
  }

  /**
   * "Continue with Google" (WEB-DEC-045): the ID token from Google's button or One Tap.
   * A guest links it (same account: the reading and its free count stay); an existing
   * Google account signs in instead and the guest reading stays in this browser only.
   * The visitor stays where they were: the photo they picked, or the report they read.
   */
  async google(token: string, nonce: string): Promise<void> {
    const api = this.deps.api;
    if (!api) return;
    const sheet = this.state.sheet;
    if (sheet?.kind === 'signup') this.set({ sheet: { ...sheet, busy: true, message: null } });
    const outcome = await api.googleSignIn(token, nonce).catch(() => ({ ok: false as const, reason: 'offline' as const }));
    if (!outcome.ok) {
      const current = this.state.sheet;
      if (current?.kind === 'signup') this.set({ sheet: { ...current, busy: false, message: GOOGLE_MESSAGE[outcome.reason] } });
      else this.set({ sheet: { kind: 'signup', step: 'email', email: '', via: 'email_change', busy: false, message: GOOGLE_MESSAGE[outcome.reason] } });
      return;
    }
    this.track('signup_done');
    const user = await api.currentUser().catch(() => this.state.user);
    const balance = await api.balance().catch(() => this.state.balance);
    const notice = outcome.switched ? ('guestNotMoved' as const) : null;
    if (balance && balance.freeRemaining === 0) {
      this.set({ user, balance, sheet: null, notice });
      this.showZero();
      return;
    }
    const screen = this.state.screen;
    const stay = screen.name === 'review' || screen.name === 'revealed' || screen.name === 'zero';
    this.set({
      user,
      balance,
      sheet: null,
      notice,
      lastNotice: Boolean(balance && balance.freeNow > 0 && balance.freeRemaining === 1),
      ...(stay ? {} : { screen: { name: 'idle' } as Screen }),
    });
  }

  closeSheet(): void {
    this.set({ sheet: null });
  }

  async submitEmail(rawEmail: string, via?: 'email_change' | 'email'): Promise<void> {
    const sheet = this.state.sheet;
    if (!sheet || sheet.kind !== 'signup' || !this.deps.api) return;
    const email = rawEmail.trim();
    const mode = via ?? sheet.via;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      this.set({ sheet: { ...sheet, email, message: 'badEmail' } });
      return;
    }
    this.set({ sheet: { ...sheet, email, via: mode, busy: true, message: null } });
    let result;
    try {
      if (mode === 'email_change') {
        // Adding an email needs the guest account it belongs to.
        const user = await this.deps.api.ensureGuest();
        this.set({ user });
        result = await this.deps.api.sendEmailCode(email);
      } else {
        result = await this.deps.api.sendSignInCode(email);
      }
    } catch {
      result = 'wait' as const;
    }
    const current = this.state.sheet;
    if (!current || current.kind !== 'signup') return;
    const message: Record<typeof result, SignupMessage> = {
      sent: 'codeSent',
      taken: 'emailTaken',
      wait: 'waitCode',
      unavailable: 'codesOff',
      invalid: 'badEmail',
    };
    this.set({ sheet: { ...current, busy: false, step: result === 'sent' ? 'code' : 'email', message: message[result] } });
  }

  /** "Sign in with a code instead" after "this email already has an account". */
  async signInInstead(): Promise<void> {
    const sheet = this.state.sheet;
    if (!sheet || sheet.kind !== 'signup') return;
    await this.submitEmail(sheet.email, 'email');
  }

  async submitCode(rawCode: string): Promise<void> {
    const sheet = this.state.sheet;
    if (!sheet || sheet.kind !== 'signup' || !this.deps.api) return;
    const code = rawCode.replace(/\D/g, '').slice(0, 6);
    if (code.length !== 6) {
      this.set({ sheet: { ...sheet, message: 'badCode' } });
      return;
    }
    this.set({ sheet: { ...sheet, busy: true, message: null } });
    let result;
    try {
      result = await this.deps.api.verifyCode(sheet.email, code, sheet.via);
    } catch {
      result = 'wait' as const;
    }
    const current = this.state.sheet;
    if (!current || current.kind !== 'signup') return;
    if (result !== 'ok') {
      this.set({ sheet: { ...current, busy: false, message: result === 'wait' ? 'waitCode' : 'wrongCode' } });
      return;
    }
    this.track('signup_done');
    const user = await this.deps.api.currentUser().catch(() => this.state.user);
    const balance = await this.deps.api.balance().catch(() => this.state.balance);
    if (balance && balance.freeRemaining === 0) {
      this.set({ user, balance, sheet: null });
      this.showZero();
      return;
    }
    this.clearPhoto();
    this.set({
      user,
      balance,
      sheet: null,
      lastNotice: Boolean(balance && balance.freeNow > 0 && balance.freeRemaining === 1),
      screen: { name: 'idle' },
    });
  }

}
