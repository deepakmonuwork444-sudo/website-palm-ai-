import { describe, expect, it, vi } from 'vitest';

import goldenInput from '../../src/lib/reading/mock/golden-input.json';
import { createMockApi, MOCK_CODE } from '../../src/lib/reading/api-mock';
import type { ReadingApi } from '../../src/lib/reading/api';
import { ReadingError } from '../../src/lib/reading/errors';
import type { EncodedCopy, PreparedPhoto } from '../../src/lib/reading/image';
import { ReadingFlow, type FlowDeps, type FlowState, type Screen } from '../../src/lib/reading/machine';
import type { GateResult } from '../../src/lib/reading/palm/features/quality/gate';
import { SECTION_MODULES } from '../../src/lib/reading/palm/features/reading/report-sections';
import { buildReportView, nextStep } from '../../src/lib/reading/report';
import { memoryStore } from '../../src/lib/reading/store';
import { fakeTokenSource } from '../../src/lib/reading/turnstile';

/**
 * The reading flow end to end on the mock backend (which answers like the
 * server: the free rule, refusals, refunds). Every step is instant here.
 */

const PASS = goldenInput.reading.gate as unknown as GateResult;
const FAIL: GateResult = { ...PASS, passed: false, issues: ['too_dark'], primaryIssue: 'too_dark', primaryMessage: 'too dark' };

function photo(): PreparedPhoto {
  const copy = (width: number, height: number): EncodedCopy => ({ base64: '/9j/4AAQSkZJRgABAQ', width, height, bytes: 12 });
  return {
    sourceWidth: 3000,
    sourceHeight: 4000,
    scan: copy(810, 1080),
    extract: copy(576, 768),
    check: { data: new Uint8ClampedArray(72 * 96 * 4), width: 72, height: 96 },
    blob: new Blob(['jpeg']),
  };
}

interface Harness {
  flow: ReadingFlow;
  api: ReturnType<typeof createMockApi>;
  screens: string[];
  events: string[];
  online: (() => void)[];
  deps: FlowDeps;
}

function harness(options: { failOnce?: string; failAt?: 'gate' | 'start' | 'scan' | 'extract' | 'complete'; gate?: GateResult; api?: ReadingApi; tokens?: FlowDeps['tokens'] } = {}): Harness {
  const api = createMockApi({ sleep: async () => {}, failOnce: options.failOnce ?? null, ...(options.failAt ? { failAt: options.failAt } : {}) });
  const screens: string[] = [];
  const events: string[] = [];
  const online: (() => void)[] = [];
  const deps: FlowDeps = {
    mode: 'mock',
    api: options.api ?? api,
    tokens: options.tokens ?? fakeTokenSource(),
    store: memoryStore(),
    preparePhoto: async () => photo(),
    shrink: vi.fn(async () => ({ base64: '/9j/small', width: 675, height: 900, bytes: 8 })),
    checkPhoto: () => options.gate ?? PASS,
    objectUrl: () => 'blob:photo',
    revokeUrl: () => {},
    sleep: async () => {},
    track: (event, detail) => events.push(detail ? `${event}:${detail}` : event),
    onceOnline: (callback) => online.push(callback),
    lineDrawMs: 0,
  };
  const flow = new ReadingFlow(deps);
  flow.subscribe(() => {
    const s = flow.getState().screen;
    const label = s.name === 'working' ? `working:${s.stage}` : s.name === 'error' ? `error:${s.code}` : s.name;
    if (screens[screens.length - 1] !== label) screens.push(label);
  });
  return { flow, api: api, screens, events, online, deps };
}

const screen = (flow: ReadingFlow): Screen => flow.getState().screen;
const state = (flow: ReadingFlow): FlowState => flow.getState();

async function readOnce(h: Harness): Promise<void> {
  await h.flow.pick(new Blob(['photo']));
  h.flow.setHand('left');
  h.flow.setWrites(true);
  await h.flow.use();
}

describe('reading flow: the happy path', () => {
  it('idle → checking → review → gating → sending → tracing → found → reading → writing → revealed', async () => {
    const h = harness();
    await h.flow.init();
    expect(screen(h.flow).name).toBe('idle');
    await readOnce(h);
    expect(h.screens).toEqual([
      'idle',
      'checking',
      'review',
      'working:gating',
      'working:sending',
      'working:tracing',
      'working:found',
      'working:reading',
      'working:writing',
      'revealed',
    ]);
    expect(h.events).toEqual(['upload_start', 'photo_check_pass', 'reading_start:1', 'lines_found', 'reading_done:1']);
  });

  it('saves the reading already locked, with the real traced lines, and asks the server for the balance', async () => {
    const h = harness();
    await h.flow.init();
    await readOnce(h);
    const s = state(h.flow);
    expect(s.readings).toHaveLength(1);
    const reading = s.readings[0]!;
    expect(reading.preview).toBe(true);
    expect(reading.lines.map((l) => l.type)).toEqual(['life', 'head', 'heart', 'fate']);
    expect(reading.missing).toEqual([]);
    expect(reading.synthesis).not.toBeNull();
    // Locked modules carry only their lead (first sentence) and nothing else.
    for (const key of ['career-money', 'direction'] as const) {
      for (const id of SECTION_MODULES[key]) {
        const m = reading.synthesis!.modules[id];
        expect(m.extra).toEqual([]);
        expect(m.showsUp ?? m.strength ?? m.need ?? m.watch ?? m.tension).toBeUndefined();
      }
    }
    // Guest after reading 1: nothing free now, the next one needs the email code (server numbers).
    expect(s.balance).toEqual({ freeNow: 0, freeRemaining: 1, emailNeeded: true });
    expect(nextStep(s.balance, s.user)).toBe('signup');
    expect(buildReportView(reading.synthesis!, 'hi').locked).toHaveLength(2);
  });

  it('a photo that fails the local check never reaches the server', async () => {
    const h = harness({ gate: FAIL });
    const start = vi.spyOn(h.api, 'startWebReading');
    const guest = vi.spyOn(h.api, 'ensureGuest');
    await h.flow.init();
    await h.flow.pick(new Blob(['dark']));
    expect(screen(h.flow).name).toBe('review');
    await h.flow.use();
    expect(screen(h.flow).name).toBe('review');
    expect(start).not.toHaveBeenCalled();
    expect(guest).not.toHaveBeenCalled();
    expect(h.events).toContain('photo_check_fail:too_dark');
  });

  it('no guest sign-in before a photo is picked', async () => {
    const h = harness();
    const guest = vi.spyOn(h.api, 'ensureGuest');
    await h.flow.init();
    expect(guest).not.toHaveBeenCalled();
    expect(state(h.flow).user).toBeNull();
  });
});

describe('reading flow: sign-up gives a NEW reading, then zero', () => {
  it('reading 1 → sign-up → code → last-reading notice → reading 2 → app', async () => {
    const h = harness();
    await h.flow.init();
    await readOnce(h);
    h.flow.openSignup();
    await h.flow.submitEmail('not-an-email');
    expect(state(h.flow).sheet).toMatchObject({ kind: 'signup', step: 'email', message: 'badEmail' });
    await h.flow.submitEmail('asha@example.com');
    expect(state(h.flow).sheet).toMatchObject({ kind: 'signup', step: 'code', message: 'codeSent', via: 'email_change' });
    await h.flow.submitCode('111111');
    expect(state(h.flow).sheet).toMatchObject({ message: 'wrongCode' });
    await h.flow.submitCode('12 34');
    expect(state(h.flow).sheet).toMatchObject({ message: 'badCode' });
    await h.flow.submitCode(MOCK_CODE);
    expect(state(h.flow).sheet).toBeNull();
    expect(screen(h.flow).name).toBe('idle');
    expect(state(h.flow).lastNotice).toBe(true);
    // The locked parts of reading 1 stay locked: sign-up never touches it.
    const first = state(h.flow).readings[0]!;
    expect(first.synthesis!.modules.direction.extra).toEqual([]);
    // The other hand is suggested.
    expect(state(h.flow).hand).toBe('right');

    await h.flow.pick(new Blob(['other hand']));
    h.flow.setWrites(false);
    await h.flow.use();
    expect(screen(h.flow).name).toBe('revealed');
    expect(state(h.flow).readings).toHaveLength(2);
    expect(state(h.flow).balance).toEqual({ freeNow: 0, freeRemaining: 0, emailNeeded: false });
    expect(nextStep(state(h.flow).balance, state(h.flow).user)).toBe('app');
    expect(h.events).toEqual(expect.arrayContaining(['signup_start', 'signup_done', 'reading_start:2', 'reading_done:2']));

    // A third try: the server says no — the zero state, never a count kept here.
    h.flow.startNew();
    await h.flow.pick(new Blob(['again']));
    await h.flow.use();
    expect(screen(h.flow).name).toBe('zero');
  });

  it('an email that already has an account: sign in with a code instead', async () => {
    const h = harness();
    await h.flow.init();
    await readOnce(h);
    h.flow.openSignup();
    await h.flow.submitEmail('taken@example.com');
    expect(state(h.flow).sheet).toMatchObject({ step: 'email', message: 'emailTaken' });
    const signIn = vi.spyOn(h.api, 'sendSignInCode');
    await h.flow.signInInstead();
    expect(signIn).toHaveBeenCalledWith('taken@example.com');
    expect(state(h.flow).sheet).toMatchObject({ step: 'code', via: 'email' });
  });

  it('a returning visitor with no free readings opens at zero', async () => {
    const h = harness();
    await h.flow.init();
    await readOnce(h);
    h.flow.openSignup();
    await h.flow.submitEmail('asha@example.com');
    await h.flow.submitCode(MOCK_CODE);
    await h.flow.pick(new Blob(['2']));
    await h.flow.use();
    const again = new ReadingFlow({ ...h.deps, store: h.deps.store });
    await again.init();
    expect(again.getState().screen.name).toBe('zero');
    expect(again.getState().readings).toHaveLength(2);
  });
});

describe('reading flow: every error has its screen (plan §8.3)', () => {
  it('not_a_palm (refunded) → retake, nothing used', async () => {
    const h = harness({ failOnce: 'not_a_palm' });
    await h.flow.init();
    await readOnce(h);
    const s = screen(h.flow);
    expect(s.name).toBe('rejected');
    if (s.name === 'rejected') {
      expect(s.noCharge).toBe(true);
      expect(s.message.en).toMatch(/palm/i);
      expect(s.message.hi.length).toBeGreaterThan(10);
    }
    expect(h.api.state().used).toBe(0);
    expect(state(h.flow).readings).toHaveLength(0);
  });

  it.each([
    ['daily_capacity_reached', 'error:daily_capacity_reached'],
    ['service_paused', 'error:service_paused'],
    ['rate_limited', 'error:rate_limited'],
    ['scanner_unavailable', 'error:scanner_unavailable'],
    ['turnstile', 'error:turnstile'],
  ])('%s → %s, nothing used', async (code, expected) => {
    const h = harness({ failOnce: code });
    await h.flow.init();
    await readOnce(h);
    expect(h.screens[h.screens.length - 1]).toBe(expected);
    expect(h.api.state().used).toBe(0);
  });

  it('needs_email_verification → the sign-up sheet', async () => {
    const h = harness({ failOnce: 'needs_email_verification' });
    await h.flow.init();
    await readOnce(h);
    expect(state(h.flow).sheet).toMatchObject({ kind: 'signup' });
  });

  it('no_readings_left → zero readings', async () => {
    const h = harness({ failOnce: 'no_readings_left' });
    await h.flow.init();
    await readOnce(h);
    expect(screen(h.flow).name).toBe('zero');
  });

  it('offline mid-reading → retried with the SAME key when back online (no second session)', async () => {
    const h = harness({ failOnce: 'offline' });
    await h.flow.init();
    await readOnce(h);
    expect(screen(h.flow)).toEqual({ name: 'error', code: 'offline' });
    const key = state(h.flow).photo!.key;
    const start = vi.spyOn(h.api, 'startWebReading');
    expect(h.online).toHaveLength(1);
    h.online[0]!();
    await vi.waitFor(() => expect(screen(h.flow).name).toBe('revealed'));
    expect(start).toHaveBeenCalledWith('left', true, key);
    expect(h.api.state().sessions).toBe(1);
    expect(h.api.state().used).toBe(1);
  });

  it('try again after a busy scanner reuses the same key', async () => {
    const h = harness({ failOnce: 'scanner_unavailable' });
    await h.flow.init();
    await readOnce(h);
    const key = state(h.flow).photo!.key;
    const start = vi.spyOn(h.api, 'startWebReading');
    await h.flow.retry();
    expect(screen(h.flow).name).toBe('revealed');
    expect(start).toHaveBeenCalledWith('left', true, key);
    expect(h.api.state().sessions).toBe(1);
  });

  it('invalid_session → one silent restart with a new key', async () => {
    const h = harness({ failOnce: 'invalid_session' });
    await h.flow.init();
    await readOnce(h);
    expect(screen(h.flow).name).toBe('revealed');
    expect(h.api.state().sessions).toBe(2);
    expect(h.api.state().used).toBe(1);
  });

  it('413 → the photo is shrunk once and sent again', async () => {
    const h = harness({ failOnce: 'image_too_large' });
    await h.flow.init();
    await readOnce(h);
    expect(h.deps.shrink).toHaveBeenCalledTimes(1);
    expect(screen(h.flow).name).toBe('revealed');
  });

  it('a Turnstile widget that cannot finish → the safety-check message', async () => {
    const h = harness({
      tokens: {
        attach() {},
        async token() {
          throw new Error('widget');
        },
      },
    });
    await h.flow.init();
    await readOnce(h);
    expect(screen(h.flow)).toEqual({ name: 'error', code: 'turnstile' });
  });

  it('HEIC that will not decode → "take a new photo or upload a JPG"', async () => {
    const h = harness();
    h.deps.preparePhoto = async () => {
      throw new ReadingError('heic');
    };
    await h.flow.init();
    await h.flow.pick(new Blob(['heic']));
    expect(screen(h.flow)).toEqual({ name: 'error', code: 'heic' });
    expect(h.events).toContain('photo_check_fail:heic');
  });
});

describe('the off switch', () => {
  it('with the flag off the flow never starts', async () => {
    const flow = new ReadingFlow({ ...harness().deps, mode: 'off', api: null });
    await flow.init();
    expect(flow.getState().screen.name).toBe('off');
  });
});
