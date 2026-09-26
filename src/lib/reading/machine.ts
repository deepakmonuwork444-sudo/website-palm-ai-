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
import { rejectionMessages } from './palm/features/lines/merge';
import type { LineServiceResponse } from './palm/features/lines/types';
import type { DominantHand } from './palm/features/observation/schema';
import type { HandSide } from './palm/features/observation/taxonomy';
import type { GateResult } from './palm/features/quality/gate';
import { FREE_LOCKED_SECTIONS, lockSynthesis } from './palm/features/reading/access';
import { LineScannerUnavailableError, QualityRejectedError, runReading } from './palm/features/reading/pipeline';
import type { SectionKey } from './palm/features/reading/report-sections';
import { VisionError } from './palm/features/vision/provider';
import { newKey, webVisionProvider, type Balance, type ReadingApi, type WebUser } from './api';
import type { ReadingMode } from './config';
import { ReadingError, planFor, toReadingError, type ReadingErrorCode } from './errors';
import type { WebEvent } from './events';
import type { EncodedCopy, PreparedPhoto, RgbaCopy } from './image';
import type { ReadingStore, SavedReading, TracedLine, TracedLineName } from './store';
import type { TokenSource } from './turnstile';

export type Stage = 'gating' | 'sending' | 'tracing' | 'found' | 'reading' | 'writing';

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
  | { name: 'working'; stage: Stage; lines: TracedLine[] | null; slow: boolean }
  | { name: 'rejected'; message: Bilingual; noCharge: boolean }
  | { name: 'error'; code: ReadingErrorCode }
  | { name: 'revealed'; readingId: string }
  | { name: 'zero' };

export type SignupMessage = 'codeSent' | 'emailTaken' | 'waitCode' | 'codesOff' | 'badEmail' | 'badCode' | 'wrongCode';

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
    };

export interface PhotoInPlay {
  prepared: PreparedPhoto;
  url: string;
  /** One idempotency key per photo, reused on every retry (never a double charge). */
  key: string;
  gate: GateResult;
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
}

const MAIN_LINES: readonly TracedLineName[] = ['life', 'head', 'heart', 'fate'];
/** A pass lasts 10 minutes on the server; ask again a little before. */
const PASS_REUSE_MS = 9 * 60_000;

/** The scanner's accepted main lines (normalised polylines), drawn in the order life, head, heart, fate. */
export function tracedLinesFromScan(response: LineServiceResponse): TracedLine[] {
  const lines = response.lines;
  if (!lines) return [];
  const out: TracedLine[] = [];
  for (const type of MAIN_LINES) {
    const line = lines[type];
    if (line && line.present && line.label === type && line.polyline.length >= 2) {
      out.push({ type, path: line.polyline.map(([x, y]) => [x, y] as [number, number]) });
    }
  }
  return out;
}

/** The observation's traced main lines (what the saved reading draws). */
export function tracedLinesFromObservation(lines: readonly { type: string; visible: boolean; path?: [number, number][] | undefined }[]): TracedLine[] {
  const out: TracedLine[] = [];
  for (const type of MAIN_LINES) {
    const line = lines.find((l) => l.type === type);
    if (line?.visible && line.path && line.path.length >= 2) out.push({ type, path: line.path });
  }
  return out;
}

export function dominantHandOf(side: HandSide, writes: boolean | null): DominantHand {
  if (writes === null) return 'unknown';
  if (writes) return side;
  return side === 'left' ? 'right' : 'left';
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
    const readings = await this.deps.store.list().catch(() => [] as SavedReading[]);
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
    const photo: PhotoInPlay = { prepared, url: this.deps.objectUrl(prepared.blob), key: newKey(), gate };
    this.set({ photo, screen: { name: 'review' } });
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
    if (this.slowTimer) clearTimeout(this.slowTimer);
    this.slowTimer = null;
  }

  private working(run: number, stage: Stage, lines: TracedLine[] | null = null): void {
    if (run !== this.runId) return;
    const slow = this.state.screen.name === 'working' ? this.state.screen.slow : false;
    this.set({ screen: { name: 'working', stage, lines, slow } });
  }

  private async run(photo: PhotoInPlay): Promise<void> {
    this.cancelRun();
    const run = this.runId;
    this.set({ screen: { name: 'working', stage: 'gating', lines: null, slow: false }, sheet: null });
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

    // 3. Lines found: the real lines draw on the photo.
    this.working(run, 'found', lines);
    this.track('lines_found');
    await this.deps.sleep(this.deps.lineDrawMs ?? 1400);
    if (run !== this.runId) return;

    // 4. Reading: extract-palm through the app's own pipeline (charges the free reading; refunds a bad photo).
    this.working(run, 'reading', lines);
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
    this.working(run, 'writing', lines);
    const synthesis: FinishedSynthesis | null = hasFinishedReading(outcome.synthesis)
      ? lockSynthesis(outcome.synthesis as FinishedSynthesis, FREE_LOCKED_SECTIONS)
      : null;
    await this.completeWithRetry(session.id, outcome);
    if (run !== this.runId) return;

    const drawn = tracedLinesFromObservation(outcome.observation.lines);
    const reading: SavedReading = {
      id: session.id,
      createdAt: this.now().toISOString(),
      handSide: side,
      photo: photo.prepared.blob,
      photoWidth: photo.prepared.scan.width,
      photoHeight: photo.prepared.scan.height,
      lines: drawn,
      missing: MAIN_LINES.filter((type) => !drawn.some((l) => l.type === type)),
      synthesis,
      preview: api.mode === 'mock',
    };
    await this.deps.store.put(reading).catch(() => undefined);
    const balance = await api.balance().catch(() => this.state.balance);
    this.track('reading_done', number);
    const readings = [...this.state.readings.filter((r) => r.id !== reading.id), reading];
    // The photo now belongs to the saved reading; a new one starts clean.
    this.state = { ...this.state, photo: null };
    this.set({
      readings,
      balance,
      lastNotice: false,
      hand: otherSide(side),
      writes: null,
      screen: { name: 'revealed', readingId: reading.id },
      fresh: reading.id,
    });
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

  openSignup(): void {
    this.track('signup_start');
    this.set({ sheet: { kind: 'signup', step: 'email', email: '', via: 'email_change', busy: false, message: null } });
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
