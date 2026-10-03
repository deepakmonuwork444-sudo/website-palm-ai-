import { describe, expect, it } from 'vitest';

import goldenInput from '../../src/lib/reading/mock/golden-input.json';
import scanResponse from '../../src/lib/reading/mock/scan-response.json';
import { MOCK_SAMPLE, createMockApi } from '../../src/lib/reading/api-mock';
import { COPY } from '../../src/lib/reading/copy';
import type { EncodedCopy, PreparedPhoto } from '../../src/lib/reading/image';
import {
  TOUR_LINE_MS,
  TOUR_PALM_MS,
  alongPolyline,
  camTransform,
  inLiveOrder,
  labelTexts,
  labelWidth,
  lineTracedWords,
  liveLabels,
  tourMs,
  tourWords,
} from '../../src/lib/reading/live-show';
import { ReadingFlow, handFromScan, isStalePreview, tracedLinesFromObservation, tracedLinesFromScan, type FlowDeps, type SamplePhoto } from '../../src/lib/reading/machine';
import { smoothPath } from '../../src/lib/reading/palm/components/deep-report/access';
import { CAMERA_MAX_SCALE, LIVE_FAINT_BELOW, cameraAt, palmCamera, tourStops } from '../../src/lib/reading/palm/features/lines/live-scan';
import type { LineServiceResponse } from '../../src/lib/reading/palm/features/lines/types';
import type { GateResult } from '../../src/lib/reading/palm/features/quality/gate';
import { handOf, isFaint, memoryStore, type SavedReading, type TracedLine } from '../../src/lib/reading/store';
import { fakeTokenSource } from '../../src/lib/reading/turnstile';

/**
 * The live scan and the report photo (WEB-DEC-043): the app's copied maths
 * (curves, camera), the faint flag and the hand carried through the flow,
 * old saved readings still opening, and the preview drawing its stored lines
 * only on the sample palm they belong to.
 */

const scan = () => structuredClone(scanResponse) as unknown as LineServiceResponse;
const PASS = goldenInput.reading.gate as unknown as GateResult;

describe('the app maths the web now uses (copied verbatim)', () => {
  it('smoothPath: Catmull-Rom through the points as cubic Béziers, rounded to 0.1 px', () => {
    expect(smoothPath([])).toBe('');
    expect(smoothPath([[3, 4]])).toBe('M3 4');
    expect(
      smoothPath([
        [0, 0],
        [10, 0],
        [20, 10],
      ]),
    ).toBe('M0 0 C1.7 0 6.7 -1.7 10 0 C13.3 1.7 18.3 8.3 20 10');
  });

  it('cameraAt never lets an edge of the photo show, and never zooms past 1.6', () => {
    expect(cameraAt([0, 0], 1.5, 100, 200)).toEqual({ scale: 1.5, tx: 25, ty: 50 });
    expect(cameraAt([50, 100], 5, 100, 200).scale).toBe(CAMERA_MAX_SCALE);
    expect(cameraAt([10, 10], 0.5, 100, 200)).toEqual({ scale: 1, tx: 0, ty: 0 });
    for (const [fx, fy, s] of [
      [0, 0, 1.6],
      [100, 200, 1.3],
      [-40, 500, 1.2],
      [55, 10, 1.45],
    ] as const) {
      const c = cameraAt([fx, fy], s, 100, 200);
      expect(Math.abs(c.tx)).toBeLessThanOrEqual(50 * (c.scale - 1) + 1e-9);
      expect(Math.abs(c.ty)).toBeLessThanOrEqual(100 * (c.scale - 1) + 1e-9);
    }
  });

  it('the camera becomes one CSS transform, pans as a share of the box', () => {
    expect(camTransform({ scale: 1.25, tx: 25, ty: -50 }, 100, 200)).toBe('translate(25%, -25%) scale(1.25)');
    expect(camTransform({ scale: 1, tx: 0, ty: 0 }, 0, 0)).toBe('translate(0%, 0%) scale(1)');
  });

  it('the palm framing of the stored scan stays inside the photo', () => {
    const hand = handFromScan(scan())!;
    const cam = palmCamera(hand.landmarks, hand.landmarks, 360, 480);
    expect(cam.scale).toBeGreaterThanOrEqual(1.25);
    expect(Math.abs(cam.tx)).toBeLessThanOrEqual(180 * (cam.scale - 1) + 1e-9);
    expect(Math.abs(cam.ty)).toBeLessThanOrEqual(240 * (cam.scale - 1) + 1e-9);
  });
});

describe('faint lines and the hand, from the scan to the saved reading', () => {
  it('a line under pixel_confidence 0.6 is faint (dashed); the rest are not', () => {
    const response = scan();
    response.lines!.heart!.pixel_confidence = 0.5;
    response.lines!.fate!.pixel_confidence = LIVE_FAINT_BELOW;
    const lines = tracedLinesFromScan(response);
    expect(lines.map((l) => [l.type, l.faint])).toEqual([
      ['life', false],
      ['head', false],
      ['heart', true],
      ['fate', false],
    ]);
    // The observation's lines take the scan's flag by type.
    const saved = tracedLinesFromObservation(
      lines.map((l) => ({ type: l.type, visible: true, path: l.path })),
      lines,
    );
    expect(saved.find((l) => l.type === 'heart')?.faint).toBe(true);
    expect(saved.find((l) => l.type === 'life')?.faint).toBe(false);
  });

  it('keeps the scanner hand: 21 landmarks, handedness, no outline when none was sent', () => {
    const hand = handFromScan(scan());
    expect(hand?.landmarks).toHaveLength(21);
    expect(hand?.handedness).toBe('Left');
    expect(hand?.outline).toBeNull();
    expect(handFromScan({ ...scan(), hand: null } as unknown as LineServiceResponse)).toBeNull();
  });

  it('a reading saved before WEB-DEC-043 (no faint, no hand) still opens: nothing faint, no hand', async () => {
    const old = {
      id: 'old-1',
      createdAt: '2026-09-25T10:00:00.000Z',
      handSide: 'left',
      photo: new Blob(['x']),
      photoWidth: 810,
      photoHeight: 1080,
      lines: [{ type: 'heart', path: [[0.1, 0.2], [0.3, 0.4]] }],
      missing: ['life', 'head', 'fate'],
      synthesis: null,
      preview: false,
    } as unknown as SavedReading;
    const store = memoryStore([old]);
    const [back] = await store.list();
    expect(back!.lines.every((l) => !isFaint(l))).toBe(true);
    expect(handOf(back!)).toBeNull();
    expect(handOf({ hand: { landmarks: [[0, 0]], handedness: 'Left', outline: null } })).toBeNull();
    expect(isFaint({ type: 'head', path: [], faint: true })).toBe(true);
  });
});

describe('the web show (live-show.ts)', () => {
  const lines = tracedLinesFromScan(scan());

  it('draws in the app order heart, head, life, fate and tours those lines, then the palm', () => {
    expect(inLiveOrder(lines).map((l) => l.type)).toEqual(['heart', 'head', 'life', 'fate']);
    const stops = tourStops(lines.map((l) => l.type));
    expect(stops).toEqual(['heart', 'head', 'life', 'fate', 'palm']);
    expect(tourMs(stops)).toBe(4 * TOUR_LINE_MS + TOUR_PALM_MS);
    // A line the scanner did not trace is never toured (or drawn).
    expect(tourStops(['life'])).toEqual(['life', 'palm']);
    expect(tourStops([])).toEqual([]);
  });

  it('the pen tip runs along the line by length, from 0 to 1', () => {
    const along = alongPolyline([
      [0, 0],
      [3, 4],
      [3, 4],
      [3, 14],
    ]);
    expect(along.map((a) => a.offset)).toEqual([0, 1 / 3, 1]);
    expect(alongPolyline([[1, 1]])).toEqual([]);
  });

  it('names: full when they fit in 30% of the photo, else short; always inside the photo, never overlapping', () => {
    expect(labelTexts(['heart', 'life'], 'en', 400)).toEqual(['Heart line', 'Life line']);
    expect(labelTexts(['heart', 'life'], 'en', 280)).toEqual(['Heart', 'Life']);
    const w = 285;
    const h = 380;
    const ordered = inLiveOrder(lines).map((l) => ({ type: l.type, points: l.path.map(([x, y]) => [x * w, y * h] as [number, number]) }));
    const texts = labelTexts(ordered.map((l) => l.type), 'hi', w);
    const placed = liveLabels(ordered, texts, w, h, null);
    expect(placed).toHaveLength(4);
    for (const { box } of placed) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.w).toBeLessThanOrEqual(w);
      expect(box.y + box.h).toBeLessThanOrEqual(h);
    }
    for (const a of placed) {
      for (const b of placed) {
        if (a === b) continue;
        const apart = a.box.x + a.box.w <= b.box.x || b.box.x + b.box.w <= a.box.x || a.box.y + a.box.h <= b.box.y || b.box.y + b.box.h <= a.box.y;
        expect(apart, `${a.type} / ${b.type}`).toBe(true);
      }
    }
    expect(labelWidth('Heart')).toBeCloseTo(52);
  });

  it('words over the photo: English and Hindi, no arrows, no middle-dot joins, no emoji', () => {
    expect(lineTracedWords('heart', false, 'en')).toBe('Heart line traced');
    expect(lineTracedWords('heart', true, 'hi')).toBe('हृदय रेखा मिली, इस फ़ोटो में हल्की');
    expect(tourWords('head', 'en')).toBe('Reading your head line…');
    expect(tourWords('palm', 'hi')).toMatch(/[ऀ-ॿ]/);
    const added = [
      COPY.skipToReading,
      COPY.scanPhotoLabel,
      COPY.samplePhotoLabel,
      ...COPY.scanWords,
      ...COPY.readWords,
      COPY.handFound.left,
      COPY.handFound.right,
      COPY.lineTraced,
      COPY.lineTracedFaint,
      COPY.tourLine,
      COPY.tourPalm,
      COPY.opening,
      COPY.previewLabel,
      COPY.allLines,
      COPY.linesOnPhoto,
      COPY.photoHint,
      COPY.stages.ready,
      ...Object.values(COPY.linesShort),
    ];
    for (const text of added) {
      expect(text.en.length).toBeGreaterThan(0);
      expect(text.hi).toMatch(/[ऀ-ॿ]/);
      for (const s of [text.en, text.hi]) {
        expect(s).not.toMatch(/→/);
        expect(s).not.toMatch(/ · /);
        expect(s).not.toMatch(/\p{Extended_Pictographic}/u);
      }
    }
  });
});

/* ── The flow: the preview's sample photo, and the report waiting for the show ── */

function photo(): PreparedPhoto {
  const copy = (width: number, height: number): EncodedCopy => ({ base64: '/9j/VISITOR', width, height, bytes: 12 });
  return {
    sourceWidth: 3000,
    sourceHeight: 4000,
    scan: copy(810, 1080),
    extract: copy(576, 768),
    check: { data: new Uint8ClampedArray(72 * 96 * 4), width: 72, height: 96 },
    blob: new Blob(['visitor-jpeg']),
  };
}

function flowWith(extra: Partial<FlowDeps> = {}) {
  const api = createMockApi({ sleep: async () => {} });
  const deps: FlowDeps = {
    mode: 'mock',
    api,
    tokens: fakeTokenSource(),
    store: memoryStore(),
    preparePhoto: async () => photo(),
    shrink: async () => ({ base64: '/9j/small', width: 675, height: 900, bytes: 8 }),
    checkPhoto: () => PASS,
    objectUrl: () => 'blob:visitor',
    revokeUrl: () => {},
    sleep: async () => {},
    lineDrawMs: 0,
    ...extra,
  };
  return { flow: new ReadingFlow(deps), api };
}

async function readOnce(flow: ReadingFlow): Promise<void> {
  await flow.init();
  await flow.pick(new Blob(['photo']));
  flow.setHand('left');
  flow.setWrites(true);
  await flow.use();
}

const sampleBlob = new Blob(['sample-webp']);
const sample = (load: SamplePhoto['load'] = async () => sampleBlob): SamplePhoto => ({ ...MOCK_SAMPLE, load });

describe('preview mode shows the stored lines only on their own sample palm', () => {
  it('the sample is the stored scan’s own photo size', () => {
    expect(MOCK_SAMPLE).toEqual({ url: '/samples/mock-scan-palm.webp', width: 360, height: 480 });
  });

  it('checks and sends the visitor’s photo, but draws and keeps the lines on the sample palm', async () => {
    const { flow, api } = flowWith({ sample: sample() });
    await flow.init();
    await flow.pick(new Blob(['photo']));
    const inPlay = flow.getState().photo!;
    expect(inPlay.url).toBe('blob:visitor');
    expect(inPlay.shown).toEqual({ url: '/samples/mock-scan-palm.webp', width: 360, height: 480, sample: true });
    flow.setHand('left');
    await flow.use();
    expect(api.state().images).toMatchObject({ scan: '/9j/VISITOR' });
    const reading = flow.getState().readings[0]!;
    expect(reading.photo).toBe(sampleBlob);
    expect([reading.photoWidth, reading.photoHeight]).toEqual([360, 480]);
    expect(reading.preview).toBe(true);
    expect(reading.lines).toHaveLength(4);
    expect(reading.lines.every((l: TracedLine) => typeof l.faint === 'boolean')).toBe(true);
    expect(handOf(reading)?.landmarks).toHaveLength(21);
  });

  it('if the sample cannot load, no line is kept on the visitor’s photo', async () => {
    const { flow } = flowWith({ sample: sample(async () => Promise.reject(new Error('offline'))) });
    await readOnce(flow);
    const reading = flow.getState().readings[0]!;
    expect(reading.photo).not.toBe(sampleBlob);
    expect(reading.lines).toEqual([]);
    expect(reading.missing).toEqual(['life', 'head', 'heart', 'fate']);
    expect(handOf(reading)).toBeNull();
  });

  it('without a sample (live) the lines stay on the visitor’s own photo', async () => {
    const { flow } = flowWith();
    await flow.init();
    await flow.pick(new Blob(['photo']));
    expect(flow.getState().photo!.shown).toEqual({ url: 'blob:visitor', width: 810, height: 1080, sample: false });
    flow.setHand('left');
    await flow.use();
    const reading = flow.getState().readings[0]!;
    expect([reading.photoWidth, reading.photoHeight]).toEqual([810, 1080]);
    expect(reading.lines).toHaveLength(4);
  });
});

describe('the report waits for the live scan (holdForShow)', () => {
  it('a finished reading waits in stage done, with the scan data, until the show ends', async () => {
    const { flow } = flowWith({ holdForShow: true });
    await readOnce(flow);
    const s = flow.getState().screen;
    expect(s.name).toBe('working');
    if (s.name !== 'working') return;
    expect(s.stage).toBe('done');
    expect(s.readingId).toBe(flow.getState().readings[0]!.id);
    expect(s.lines).toHaveLength(4);
    expect(s.hand?.landmarks).toHaveLength(21);
    expect(s.side).toBe('left');
    expect(flow.getState().photo).not.toBeNull();
    flow.endShow();
    expect(flow.getState().screen).toEqual({ name: 'revealed', readingId: s.readingId });
    expect(flow.getState().photo).toBeNull();
    expect(flow.getState().fresh).toBe(s.readingId);
  });

  it('"Skip" before the reading is saved opens the report the moment it is', async () => {
    const { flow } = flowWith({ holdForShow: true });
    await flow.init();
    await flow.pick(new Blob(['photo']));
    const running = flow.use();
    flow.endShow();
    await running;
    expect(flow.getState().screen.name).toBe('revealed');
  });

  it('after the show, a new photo starts clean: no report opens by itself', async () => {
    const { flow } = flowWith({ holdForShow: true });
    await readOnce(flow);
    flow.endShow();
    flow.startNew();
    await flow.pick(new Blob(['photo 2']));
    await flow.use().catch(() => undefined);
    // Reading 2 needs the email code first (the server's free rule); nothing opened by itself.
    expect(flow.getState().screen.name).not.toBe('revealed');
  });
});

describe('old preview readings', () => {
  it('drops a preview reading saved before WEB-DEC-043 (sample lines on the visitor photo)', () => {
    expect(isStalePreview({ preview: true })).toBe(true);
    expect(isStalePreview({ preview: true, hand: null })).toBe(false);
    expect(isStalePreview({ preview: false })).toBe(false);
  });
});
