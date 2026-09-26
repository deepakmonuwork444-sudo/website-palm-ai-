import { describe, expect, it } from 'vitest';

import {
  analysisSize,
  checklist,
  computeMetrics,
  evaluateQuality,
  fileProblem,
  FIX_MESSAGES,
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

  it('says the palm is too far when it covers little of the frame', () => {
    const verdict = verdictOf(paintPalm(W, H, SKIN_LIGHT, 0.6));
    expect(verdict.issues).toContain('palm_too_small_in_frame');
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
      minSkinFraction: 0.1,
      minPalmFraction: 0.28,
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
