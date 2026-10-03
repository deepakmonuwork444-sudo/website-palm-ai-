import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

import {
  analysisSize,
  checklist,
  computeMetrics,
  evaluateQuality,
  fileProblem,
  FIX_MESSAGES,
  handFound,
  largestBlob,
  NO_HAND_FIX,
  NO_HAND_TITLE,
  type ImageMetrics,
  isSkinChroma,
  laplacianVariance,
  THRESHOLDS,
  toGrayscale,
} from '../../src/lib/tools/photo-check';
import { boxBlur, paintFlat, paintPalm, scaleBrightness, SKIN_DARK, SKIN_LIGHT } from './tools-synthetic';

const W = 96;
const H = 120;
const FULL = { w: 1200, h: 1500 };
const verdictOf = (image: ReturnType<typeof paintPalm>, w = FULL.w, h = FULL.h) => evaluateQuality(computeMetrics(image), w, h);

describe('photo checker metrics (ported from the app quality gate)', () => {
  it('passes a sharp palm in even light', () => {
    const verdict = verdictOf(paintPalm(W, H, SKIN_LIGHT));
    expect(verdict.issues).toEqual([]);
    expect(verdict.passed).toBe(true);
    expect(checklist(verdict).every((row) => row.state === 'pass')).toBe(true);
  });

  it('passes darker skin in even light (skin test is deliberately wide)', () => {
    const verdict = verdictOf(paintPalm(W, H, SKIN_DARK));
    expect(verdict.issues).not.toContain('no_palm_detected');
    expect(verdict.issues).not.toContain('low_contrast');
  });

  it('flags a blurred photo', () => {
    const verdict = verdictOf(boxBlur(paintPalm(W, H, SKIN_LIGHT), 3));
    expect(verdict.issues).toContain('too_blurry');
    expect(checklist(verdict).find((row) => row.id === 'sharp')).toMatchObject({ state: 'fail', note: FIX_MESSAGES.too_blurry });
  });

  it('talks about the light, not the palm, when it is too dark', () => {
    const verdict = verdictOf(scaleBrightness(paintPalm(W, H, SKIN_LIGHT), 0.18));
    expect(verdict.primaryIssue).toBe('too_dark');
    expect(verdict.issues).not.toContain('no_palm_detected');
    const rows = checklist(verdict);
    expect(rows.find((row) => row.id === 'light')?.state).toBe('fail');
    expect(rows.find((row) => row.id === 'palm')?.state).toBe('unknown');
    expect(rows.find((row) => row.id === 'lines')?.state).toBe('unknown');
  });

  it('flags a blown-out photo as too bright', () => {
    const verdict = verdictOf(scaleBrightness(paintPalm(W, H, SKIN_LIGHT), 2.4));
    expect(verdict.issues).toContain('too_bright');
  });

  it('finds no palm in a photo of something else', () => {
    const verdict = verdictOf(paintFlat(W, H, [40, 90, 160]));
    expect(verdict.primaryIssue).toBe('no_palm_detected');
    expect(checklist(verdict).find((row) => row.id === 'lines')?.state).toBe('unknown');
  });

  it('says the hand is too far when it is small in the frame', () => {
    const verdict = verdictOf(paintPalm(W, H, SKIN_LIGHT, 0.4));
    expect(verdict.primaryIssue).toBe('palm_too_small_in_frame');
  });

  it('passes a whole hand that covers only part of the frame (wrist to fingertips, space around)', () => {
    // About the share a real wrist-to-fingertips photo has: this used to be called "far away".
    const verdict = verdictOf(paintPalm(W, H, SKIN_LIGHT, 0.75));
    expect(verdict.metrics.skinFraction).toBeLessThan(0.28);
    expect(verdict.issues).toEqual([]);
  });

  it('says too close, not too far, when skin fills the whole frame', () => {
    const verdict = verdictOf(paintPalm(W, H, SKIN_LIGHT, 3));
    expect(verdict.primaryIssue).toBe('palm_too_close');
    expect(checklist(verdict).find((row) => row.id === 'palm')).toMatchObject({ state: 'fail', note: FIX_MESSAGES.palm_too_close });
  });

  it('finds no hand when the only skin-coloured patch sits at the edge (a clay pot behind a leaf)', () => {
    const image = paintFlat(W, H, [40, 110, 50]);
    for (let y = 0; y < 30; y += 1) {
      for (let x = 0; x < 50; x += 1) {
        const o = (y * W + x) * 4;
        image.data[o] = SKIN_LIGHT[0];
        image.data[o + 1] = SKIN_LIGHT[1];
        image.data[o + 2] = SKIN_LIGHT[2];
      }
    }
    const verdict = verdictOf(image);
    expect(verdict.primaryIssue).toBe('no_palm_detected');
    expect(FIX_MESSAGES.no_palm_detected).toBe(`${NO_HAND_TITLE}. ${NO_HAND_FIX}`);
  });

  it('does not call a white background glare when the palm itself is fine', () => {
    const image = paintPalm(W, H, SKIN_LIGHT);
    for (let i = 0; i < image.data.length; i += 4) {
      if (image.data[i] === 150) image.data.fill(255, i, i + 3);
    }
    const verdict = verdictOf(image);
    expect(verdict.metrics.clippedFraction).toBeGreaterThan(0.25);
    expect(verdict.issues).not.toContain('too_bright');
  });

  it('flags a photo smaller than the minimum edge first', () => {
    const verdict = verdictOf(paintPalm(W, H, SKIN_LIGHT), 480, 640);
    expect(verdict.primaryIssue).toBe('too_small');
    expect(checklist(verdict)[0]).toMatchObject({ id: 'size', state: 'fail' });
  });

  it('keeps the app thresholds', () => {
    expect(THRESHOLDS).toEqual({
      minSourceEdge: 600,
      minBlurScore: 55,
      minLuminance: 45,
      maxLuminance: 214,
      maxClippedFraction: 0.25,
      minSkinContrast: 0.06,
      minHandArea: 0.03,
      handCentreX: [0.25, 0.75],
      handCentreY: [0.25, 0.8],
      minHandSpan: 0.45,
      maxHandArea: 0.9,
    });
  });

  it('computes sane building blocks', () => {
    const flat = paintFlat(8, 8, [100, 100, 100]);
    const gray = toGrayscale(flat);
    expect(gray[0]).toBeCloseTo(100, 5);
    expect(laplacianVariance(gray, 8, 8)).toBe(0);
    expect(laplacianVariance(gray, 2, 2)).toBe(0);
    expect(isSkinChroma(...SKIN_LIGHT)).toBe(true);
    expect(isSkinChroma(40, 90, 160)).toBe(false);
  });
});

describe('photo checker helpers', () => {
  it('scales the analysis copy to 96px on the long edge', () => {
    expect(analysisSize(3000, 4000)).toEqual({ width: 72, height: 96 });
    expect(analysisSize(4000, 3000)).toEqual({ width: 96, height: 72 });
    expect(analysisSize(0, 100)).toEqual({ width: 0, height: 0 });
  });

  it('spots HEIC and non-images by type or name', () => {
    expect(fileProblem('image/heic', 'IMG_1.HEIC')).toBe('heic');
    expect(fileProblem('', 'palm.heif')).toBe('heic');
    expect(fileProblem('application/pdf', 'x.pdf')).toBe('not-image');
    expect(fileProblem('', 'notes.txt')).toBe('not-image');
    expect(fileProblem('image/jpeg', 'palm.jpg')).toBeNull();
    expect(fileProblem('', 'palm.JPG')).toBeNull();
  });
});

const base: ImageMetrics = {
  meanLuminance: 140,
  contrast: 50,
  blurScore: 500,
  skinFraction: 0.3,
  centreOccupancy: 0.7,
  clippedFraction: 0,
  skinContrast: 0.2,
  centreClippedFraction: 0,
  handArea: 0.3,
  handSpan: 0.7,
  handCentreX: 0.5,
  handCentreY: 0.6,
  handEdges: 1,
};
const issuesOf = (over: Partial<ImageMetrics>) => evaluateQuality({ ...base, ...over }, 1200, 1600).issues;

describe('photo checker decision logic', () => {
  it('passes a normal whole-hand photo', () => {
    expect(issuesOf({})).toEqual([]);
  });

  it('needs a hand-sized area in the middle of the photo', () => {
    expect(handFound(base)).toBe(true);
    expect(issuesOf({ handArea: 0.02 })).toContain('no_palm_detected');
    expect(issuesOf({ handCentreX: 0.15 })).toContain('no_palm_detected');
    expect(issuesOf({ handCentreY: 0.12 })).toContain('no_palm_detected');
    // A hand rising from the bottom edge sits a little low: still a hand.
    expect(issuesOf({ handCentreY: 0.75 })).toEqual([]);
  });

  it('judges distance from the hand size, never both near and far', () => {
    expect(issuesOf({ handSpan: 0.3, handArea: 0.06 })).toEqual(['palm_too_small_in_frame']);
    expect(issuesOf({ handArea: 0.95, handSpan: 1, handEdges: 4 })).toEqual(['palm_too_close']);
    // Skin to all four edges but not filling the frame (a hand with the arm across it): fine.
    expect(issuesOf({ handArea: 0.6, handSpan: 1, handEdges: 4 })).toEqual([]);
  });

  it('judges glare on the middle of the photo', () => {
    expect(issuesOf({ clippedFraction: 0.5 })).toEqual([]);
    expect(issuesOf({ centreClippedFraction: 0.3 })).toContain('too_bright');
  });

  it('measures the biggest connected area', () => {
    const mask = new Uint8Array(10 * 10);
    for (let y = 2; y < 8; y += 1) for (let x = 3; x < 7; x += 1) mask[y * 10 + x] = 1;
    mask[0] = 1;
    const blob = largestBlob(mask, 10, 10);
    expect(blob.area).toBeCloseTo(0.24, 5);
    expect(blob.span).toBeCloseTo(0.6, 5);
    expect(blob.centreX).toBeCloseTo(0.5, 5);
    expect(blob.centreY).toBeCloseTo(0.5, 5);
    expect(blob.edges).toBe(0);
    expect(largestBlob(new Uint8Array(4), 2, 2).area).toBe(0);
  });
});

/** The browser's 96 px check copy, made the same way from a real photo (EXIF turned upright). */
async function realVerdict(path: string) {
  const { data, info } = await sharp(path).rotate().resize(96, 96, { fit: 'inside' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  // A real phone photo is at least 1,080 px; the fixtures are small copies, so size is judged as a phone photo.
  return evaluateQuality(computeMetrics({ data: new Uint8Array(data), width: info.width, height: info.height }), 1080, 1440);
}

describe('photo checker on real photos (tests/fixtures/palms, design-v4/guide-assets)', () => {
  it('passes normal whole-hand palm photos', async () => {
    for (const file of [
      'tests/fixtures/palms/right-palm.jpg',
      'tests/fixtures/palms/right-palm-exif-rotated.jpg',
      'tests/fixtures/palms/palm-outdoors.jpg',
      'design-v4/guide-assets/real-palm-pexels-8058729-original.jpg',
    ]) {
      expect((await realVerdict(file)).issues, file).toEqual([]);
    }
  });

  it('finds no hand in a palm-tree leaf', async () => {
    expect((await realVerdict('tests/fixtures/palms/no-hand-leaf.jpg')).primaryIssue).toBe('no_palm_detected');
  });

  it('never tells a too-close palm to come closer', async () => {
    const verdict = await realVerdict('tests/fixtures/palms/palm-too-close.jpg');
    expect(verdict.passed).toBe(false);
    expect(verdict.issues).not.toContain('palm_too_small_in_frame');
  });
});
