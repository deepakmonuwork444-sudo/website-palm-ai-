import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { compareHands } from '../../src/lib/tools/hand/compare';
import { CUT } from '../../src/lib/tools/hand/cutoffs';
import { toHands, unpad } from '../../src/lib/tools/hand/detector';
import {
  fingerHeadline,
  fingersTogether,
  indexRingBand,
  levelBand,
  percentDiff,
  readFingerLength,
  readGaps,
  readIndexRing,
  readLittle,
  readThumb,
  thumbOpenBand,
  wideGaps,
} from '../../src/lib/tools/hand/fingers';
import type { DetectedHand, Handedness, Landmark, PhotoHands } from '../../src/lib/tools/hand/landmarks';
import { angleBetween, cross, handCrop, isPalmFacing, measureHand, pathLength, toPx } from '../../src/lib/tools/hand/measure';
import { MODEL_BYTES, MODEL_SHA256, WASM_BYTES, downloadMb, mbText } from '../../src/lib/tools/hand/model-files';
import { HANDOFF_MAX_AGE_MS, decodeHandOff, encodeHandOff, notAnImage } from '../../src/lib/tools/hand/photo';
import { fingerBand, handShape, palmBand, scalePosition } from '../../src/lib/tools/hand/shape';
import { assessHand, otherSide } from '../../src/lib/tools/hand/verdict';
import { BOOKS } from '../../src/lib/tools/sources';
import fixtures from '../fixtures/palms/landmarks.json';
import example from '../../src/lib/tools/hand/examples/right-palm.json';

/* ── A synthetic hand with known geometry (1000 × 1000 px, fingers pointing up) ── */

interface HandSpec {
  palmLength?: number;
  palmWidth?: number;
  fingers?: { index: number; middle: number; ring: number; little: number };
  thumb?: number;
  thumbAngle?: number;
  spread?: number;
  side?: Handedness;
  /** Build a right hand's geometry but label it the other way (= the back of the hand). */
  back?: boolean;
  bend?: number;
}

function dir(deg: number): { x: number; y: number } {
  const r = (deg * Math.PI) / 180;
  return { x: Math.sin(r), y: -Math.cos(r) };
}

function build(spec: HandSpec = {}): DetectedHand {
  const L = spec.palmLength ?? 400;
  const W = spec.palmWidth ?? 260;
  const f = spec.fingers ?? { index: 330, middle: 360, ring: 340, little: 270 };
  const s = spec.spread ?? 6;
  const pts: { x: number; y: number }[] = new Array(21);
  pts[0] = { x: 500, y: 900 };
  const base = {
    index: { x: 500 + W / 2, y: 905 - L },
    middle: { x: 500, y: 900 - L },
    ring: { x: 500 - W / 4, y: 902 - L },
    little: { x: 500 - W / 2, y: 905 - L },
  };
  const angle = { index: s, middle: 0, ring: -s, little: -2 * s };
  const idx = { index: 5, middle: 9, ring: 13, little: 17 } as const;
  for (const name of ['index', 'middle', 'ring', 'little'] as const) {
    let p = base[name];
    pts[idx[name]] = p;
    const parts = [0.45, 0.3, 0.25];
    parts.forEach((part, k) => {
      const bendDeg = name === 'middle' && spec.bend ? spec.bend * (k + 1) : 0;
      const d = dir(angle[name] + bendDeg);
      p = { x: p.x + d.x * f[name] * part, y: p.y + d.y * f[name] * part };
      pts[idx[name] + k + 1] = p;
    });
  }
  const T = spec.thumb ?? 240;
  pts[1] = { x: 500 + W * 0.45, y: 900 - L * 0.2 };
  pts[2] = { x: 500 + W * 0.62, y: 900 - L * 0.45 };
  const td = dir(s + (spec.thumbAngle ?? 40));
  pts[3] = { x: pts[2].x + td.x * T * 0.55, y: pts[2].y + td.y * T * 0.55 };
  pts[4] = { x: pts[3].x + td.x * T * 0.45, y: pts[3].y + td.y * T * 0.45 };
  const mirror = spec.side === 'Left';
  const landmarks: Landmark[] = pts.map((p) => ({ x: (mirror ? 1000 - p.x : p.x) / 1000, y: p.y / 1000, z: 0 }));
  const side: Handedness = spec.side ?? 'Right';
  return { landmarks, world: null, handedness: spec.back ? otherSide(side) : side, handednessScore: 0.95 };
}

const photoOf = (...hands: DetectedHand[]): PhotoHands => ({ width: 1000, height: 1000, hands });

describe('hand measurement maths', () => {
  it('measures palm, fingers and ratios in photo pixels', () => {
    const m = measureHand(build(), 1000, 1000);
    expect(m.palmLength).toBeCloseTo(400, 6);
    expect(m.palmWidth).toBeCloseTo(260, 6);
    expect(m.palmRatio).toBeCloseTo(400 / 260, 6);
    expect(m.fingers.middle).toBeCloseTo(360, 6);
    expect(m.fingerRatio).toBeCloseTo(0.9, 6);
    expect(m.indexRingLength).toBeCloseTo(330 / 340, 6);
    expect(m.thumbRatio).toBeCloseTo(240 / 330, 6);
    expect(m.straightness.middle).toBeCloseTo(1, 6);
    expect(m.outside).toBe(0);
  });

  it('uses the photo’s own aspect: a wide photo does not stretch the ratios', () => {
    const hand = build();
    // The same pixels described in a 2000 × 1000 photo: x halves in 0–1 terms.
    const wide = { ...hand, landmarks: hand.landmarks.map((p) => ({ ...p, x: p.x / 2 })) };
    const a = measureHand(hand, 1000, 1000);
    const b = measureHand(wide, 2000, 1000);
    expect(b.palmRatio).toBeCloseTo(a.palmRatio, 6);
    expect(b.thumbAngle).toBeCloseTo(a.thumbAngle, 6);
  });

  it('measures the thumb angle and finger gaps in degrees', () => {
    const m = measureHand(build({ thumbAngle: 70, spread: 12 }), 1000, 1000);
    expect(m.thumbAngle).toBeCloseTo(70, 4);
    expect(m.gaps.indexMiddle).toBeCloseTo(12, 4);
    expect(m.gaps.middleRing).toBeCloseTo(12, 4);
    expect(m.gaps.ringLittle).toBeCloseTo(12, 4);
    expect(angleBetween({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 })).toBeCloseTo(90, 6);
    expect(angleBetween({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 })).toBe(0);
  });

  it('tells the index tip reach and the little finger reach from the knuckle line', () => {
    const m = measureHand(build({ fingers: { index: 360, middle: 380, ring: 330, little: 300 } }), 1000, 1000);
    expect(m.indexRingReach).toBeGreaterThan(0);
    expect(m.thumbSet).toBeCloseTo(0.45, 6);
    expect(pathLength(toPx(build().landmarks, 1000, 1000), [9, 10, 11, 12])).toBeCloseTo(360, 6);
  });

  it('knows the palm from the back of the hand, for both hands', () => {
    expect(measureHand(build({ side: 'Right' }), 1000, 1000).palmFacing).toBe(true);
    expect(measureHand(build({ side: 'Left' }), 1000, 1000).palmFacing).toBe(true);
    expect(measureHand(build({ side: 'Right', back: true }), 1000, 1000).palmFacing).toBe(false);
    expect(measureHand(build({ side: 'Left', back: true }), 1000, 1000).palmFacing).toBe(false);
    const p = toPx(build().landmarks, 1000, 1000);
    expect(cross(p[0]!, p[5]!, p[17]!)).toBeLessThan(0);
    expect(isPalmFacing(p, 'Right')).toBe(true);
  });

  it('crops the view to the hand with a margin, inside the photo', () => {
    const box = handCrop(build().landmarks, 1000, 1000);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.w).toBeLessThanOrEqual(1000);
    expect(box.y + box.h).toBeLessThanOrEqual(1000);
    const p = toPx(build().landmarks, 1000, 1000);
    for (const q of p) {
      expect(q.x).toBeGreaterThanOrEqual(box.x);
      expect(q.y).toBeLessThanOrEqual(box.y + box.h);
    }
  });

  it('flags bent fingers and points outside the photo', () => {
    expect(measureHand(build({ bend: 40 }), 1000, 1000).straightness.middle).toBeLessThan(0.9);
    const cut = build({ fingers: { index: 330, middle: 700, ring: 340, little: 270 } });
    expect(measureHand(cut, 1000, 1000).outside).toBeGreaterThan(0);
  });
});

describe('cut-offs and bands', () => {
  it('keeps every band in order', () => {
    expect(CUT.palm.square).toBeLessThan(CUT.palm.long);
    expect(CUT.fingers.short).toBeLessThan(CUT.fingers.long);
    expect(CUT.indexRing.ringLonger).toBeLessThan(1);
    expect(CUT.indexRing.indexLonger).toBeGreaterThan(1);
    expect(CUT.thumbAngle.close).toBeLessThan(CUT.thumbAngle.wide);
  });

  it('palm shape: square up to the cut, long from it, between in the middle', () => {
    expect(palmBand(CUT.palm.square)).toBe('square');
    expect(palmBand(CUT.palm.square + 0.001)).toBe('between');
    expect(palmBand(CUT.palm.long - 0.001)).toBe('between');
    expect(palmBand(CUT.palm.long)).toBe('long');
    expect(fingerBand(CUT.fingers.short)).toBe('short');
    expect(fingerBand(0.87)).toBe('between');
    expect(fingerBand(CUT.fingers.long)).toBe('long');
  });

  it('hand type: one element when both are clear, two when one is between, four when both are', () => {
    expect(handShape({ palmRatio: 1.4, fingerRatio: 0.8 }).elements).toEqual(['earth']);
    expect(handShape({ palmRatio: 1.4, fingerRatio: 0.95 }).elements).toEqual(['air']);
    expect(handShape({ palmRatio: 1.7, fingerRatio: 0.8 }).elements).toEqual(['fire']);
    expect(handShape({ palmRatio: 1.7, fingerRatio: 0.95 }).elements).toEqual(['water']);
    expect(handShape({ palmRatio: 1.55, fingerRatio: 0.95 }).elements).toEqual(['air', 'water']);
    expect(handShape({ palmRatio: 1.55, fingerRatio: 0.87 }).elements).toHaveLength(4);
  });

  it('fingers: index vs ring with a ±2% equal band; thumb angle bands; gaps', () => {
    expect(indexRingBand(0.97)).toBe('ring');
    expect(indexRingBand(0.98)).toBe('equal');
    expect(indexRingBand(1.02)).toBe('equal');
    expect(indexRingBand(1.03)).toBe('index');
    expect(percentDiff(0.955)).toBe(5);
    expect(thumbOpenBand(24.9)).toBe('close');
    expect(thumbOpenBand(25)).toBe('moderate');
    expect(thumbOpenBand(60)).toBe('wide');
    expect(levelBand(0.79, CUT.little)).toBe('short');
    expect(levelBand(0.81, CUT.little)).toBe('average');
    expect(levelBand(0.83, CUT.little)).toBe('long');
    expect(wideGaps({ indexMiddle: 14, middleRing: 3, ringLittle: 19 })).toEqual(['indexMiddle', 'ringLittle']);
    expect(fingersTogether({ indexMiddle: 4.9, middleRing: 1, ringLittle: 2 })).toBe(true);
    expect(fingersTogether({ indexMiddle: 5, middleRing: 1, ringLittle: 2 })).toBe(false);
  });

  it('the scale marker stays on the drawn scale', () => {
    expect(scalePosition(1.2, 1.3, 1.85)).toBe(0);
    expect(scalePosition(2, 1.3, 1.85)).toBe(1);
    expect(scalePosition(1.575, 1.3, 1.85)).toBeCloseTo(0.5, 6);
  });
});

describe('photo verdicts (one problem at a time, each with a fix)', () => {
  it('no hand, two hands, cut off, bent fingers, too small', () => {
    expect(assessHand(photoOf())).toMatchObject({ ok: false, problem: 'no_hand' });
    expect(assessHand(photoOf(build(), build({ side: 'Left' })))).toMatchObject({ ok: false, problem: 'two_hands' });
    expect(assessHand(photoOf(build({ fingers: { index: 330, middle: 700, ring: 340, little: 270 } })))).toMatchObject({ ok: false, problem: 'cut_off' });
    expect(assessHand(photoOf(build({ bend: 40 })))).toMatchObject({ ok: false, problem: 'fingers_bent' });
    const tiny = build();
    const small: PhotoHands = { width: 100, height: 100, hands: [tiny] };
    expect(assessHand(small)).toMatchObject({ ok: false, problem: 'too_small' });
  });

  it('the back of the hand is refused, unless the person says it is the palm — then the side flips too', () => {
    const back = photoOf(build({ side: 'Right', back: true }));
    expect(assessHand(back)).toMatchObject({ ok: false, problem: 'back_of_hand' });
    const forced = assessHand(back, { palm: true });
    expect(forced.ok).toBe(true);
    if (forced.ok) expect(forced.side).toBe('Right');
  });

  it('a good hand passes with its side and measures', () => {
    const v = assessHand(photoOf(build({ side: 'Left' })));
    expect(v.ok).toBe(true);
    if (v.ok) {
      expect(v.side).toBe('Left');
      expect(v.warnings).toEqual([]);
    }
  });
});

describe('real photos (model output stored in tests/fixtures/palms/landmarks.json)', () => {
  const photos = fixtures.photos as unknown as Record<string, PhotoHands>;
  const verdict = (name: string) => assessHand(photos[name]!);

  it('a right palm and its mirror image read as right and left', () => {
    const right = verdict('right-palm.jpg');
    const left = verdict('left-palm-mirrored.jpg');
    expect(right.ok && right.side).toBe('Right');
    expect(left.ok && left.side).toBe('Left');
  });

  it('the back of a hand, a palm leaf and a too-close crop are refused with the right problem', () => {
    expect(verdict('back-of-hand.jpg')).toMatchObject({ ok: false, problem: 'back_of_hand' });
    expect(verdict('no-hand-leaf.jpg')).toMatchObject({ ok: false, problem: 'no_hand' });
    expect(verdict('palm-too-close.jpg')).toMatchObject({ ok: false, problem: 'no_hand' });
  });

  it('a sideways-stored photo (EXIF orientation 6) measures like the upright one', () => {
    const a = verdict('right-palm.jpg');
    const b = verdict('right-palm-exif-rotated.jpg');
    expect(a.ok && b.ok).toBe(true);
    if (a.ok && b.ok) {
      expect(photos['right-palm-exif-rotated.jpg']!.height).toBeGreaterThan(photos['right-palm-exif-rotated.jpg']!.width);
      expect(Math.abs(a.measures.palmRatio - b.measures.palmRatio)).toBeLessThan(0.05);
      expect(Math.abs(a.measures.fingerRatio - b.measures.fingerRatio)).toBeLessThan(0.05);
    }
  });

  it('the stored example still passes and reads between air and water', () => {
    const v = assessHand(example as unknown as PhotoHands);
    expect(v.ok).toBe(true);
    if (v.ok) expect(handShape(v.measures).elements).toEqual(['air', 'water']);
  });

  it('left vs right: a hand compared with itself has no differences', () => {
    const a = verdict('right-palm.jpg');
    if (!a.ok) throw new Error('fixture');
    expect(compareHands(a.measures, a.measures).differences).toBe(0);
    const other = compareHands(a.measures, { ...a.measures, thumbAngle: 70, palmRatio: 1.3 });
    expect(other.differences).toBeGreaterThan(0);
    expect(other.rows.find((row) => row.label === 'Thumb opening')?.differs).toBe(true);
  });
});

describe('finger readings: sourced, no predictions', () => {
  const measures = [
    measureHand(build(), 1000, 1000),
    measureHand(build({ fingers: { index: 360, middle: 380, ring: 330, little: 300 }, thumbAngle: 70, spread: 16 }), 1000, 1000),
    measureHand(build({ fingers: { index: 340, middle: 300, ring: 340, little: 250 }, thumbAngle: 10, spread: 1 }), 1000, 1000),
  ];
  const banned = /\b(will (marry|die|be rich)|lifespan|divorce|children|wealth|rich|poor|disease|illness|guarantee|predict)/i;

  it('every reading names known books and avoids predictions', () => {
    for (const m of measures) {
      for (const reading of [readIndexRing(m), readThumb(m), readGaps(m), readLittle(m), readFingerLength(m)]) {
        for (const cite of reading.cites) expect(BOOKS[cite.book]).toBeDefined();
        expect(`${reading.finding} ${reading.meaning} ${reading.note ?? ''}`).not.toMatch(banned);
      }
      expect(fingerHeadline(m).length).toBeGreaterThan(10);
    }
  });

  it('finds the right bands on the synthetic hands', () => {
    expect(readIndexRing(measures[1]!).band).toBe('index');
    expect(readThumb(measures[1]!).open).toBe('wide');
    expect(readGaps(measures[1]!).wide).toContain('indexMiddle');
    expect(readThumb(measures[2]!).open).toBe('close');
    expect(readGaps(measures[2]!).together).toBe(true);
    expect(readIndexRing(measures[2]!).band).toBe('equal');
  });
});

describe('model files and the photo hand-off', () => {
  it('the byte sizes and hash match the files we ship', () => {
    const model = readFileSync('public/models/hand-landmarker/float16-1/hand_landmarker.task');
    expect(model.length).toBe(MODEL_BYTES);
    expect(createHash('sha256').update(model).digest('hex')).toBe(MODEL_SHA256);
    expect(statSync('node_modules/@mediapipe/tasks-vision/wasm/vision_wasm_internal.wasm').size).toBe(WASM_BYTES.simd);
    expect(statSync('node_modules/@mediapipe/tasks-vision/wasm/vision_wasm_nosimd_internal.wasm').size).toBe(WASM_BYTES.noSimd);
    expect(readFileSync('public/models/hand-landmarker/LICENSE.txt', 'utf8')).toMatch(/Apache License/);
    expect(downloadMb()).toBe(20);
    expect(mbText(4_200_000)).toBe('4.2');
    expect(mbText(19_600_000)).toBe('20');
  });

  it('maps a padded detection back onto the photo', () => {
    const p = unpad({ x: 0.5, y: 0.5, z: 0.1 }, 100, 800, 600);
    expect(p.x).toBeCloseTo(0.5, 6);
    expect(p.y).toBeCloseTo(0.5, 6);
    expect(unpad({ x: 100 / 1000, y: 0, z: 0 }, 100, 800, 600).x).toBeCloseTo(0, 6);
    const hands = toHands(
      {
        landmarks: [Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5, z: 0, visibility: 0 }))],
        worldLandmarks: [Array.from({ length: 21 }, () => ({ x: 0, y: 0, z: 0, visibility: 0 }))],
        handedness: [[{ categoryName: 'Left', score: 0.9, index: 0, displayName: '' }]],
        handednesses: [[{ categoryName: 'Left', score: 0.9, index: 0, displayName: '' }]],
      },
      0,
      800,
      600,
    );
    expect(hands[0]).toMatchObject({ handedness: 'Left', handednessScore: 0.9 });
  });

  it('a hand-off expires, and rejects junk', () => {
    const now = 1_000_000_000;
    const raw = encodeHandOff('x'.repeat(200), 'photo-checker', now);
    expect(decodeHandOff(raw, now + 1000)?.from).toBe('photo-checker');
    expect(decodeHandOff(raw, now + HANDOFF_MAX_AGE_MS + 1)).toBeNull();
    expect(decodeHandOff('{"base64":"short","at":1,"from":"x"}', now)).toBeNull();
    expect(decodeHandOff('not json', now)).toBeNull();
    expect(decodeHandOff(null, now)).toBeNull();
  });

  it('refuses plain non-images, lets HEIC and nameless picks reach the decoder', () => {
    expect(notAnImage({ type: 'application/pdf', name: 'a.pdf' })).toBe(true);
    expect(notAnImage({ type: 'image/jpeg', name: 'a.jpg' })).toBe(false);
    expect(notAnImage({ type: 'image/heic', name: 'a.heic' })).toBe(false);
    expect(notAnImage({ type: '', name: 'IMG_1.HEIC' })).toBe(false);
    expect(notAnImage({ type: '', name: 'photo' })).toBe(false);
    expect(notAnImage({ type: '', name: 'clip.mp4' })).toBe(true);
  });
});
