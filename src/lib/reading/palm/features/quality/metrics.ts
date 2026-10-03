// COPIED from palm-ai-new--feat-m1-foundation/src/features/quality/metrics.ts at app commit fbc2232d837f (2026-09-30).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
/**
 * Pure image metrics. No React Native, no native modules, no I/O — which
 * means every threshold here is unit-testable in plain Node.
 *
 * These run on a downscaled decode (96px on the long edge is plenty), so the
 * cost is negligible and nothing leaves the device. A photo that fails here
 * never reaches a vision provider, which is the cheapest possible rejection.
 */

export interface RgbaImage {
  data: Uint8Array | Uint8ClampedArray;
  width: number;
  height: number;
}

export interface ImageMetrics {
  meanLuminance: number;
  contrast: number;
  blurScore: number;
  skinFraction: number;
  centreOccupancy: number;
  /** Share of pixels at or near pure white. The real overexposure signal. */
  clippedFraction: number;
  /**
   * Std dev of luma over skin pixels, divided by their mean (Weber contrast).
   * Creases are shadows, i.e. multiplicative darkening, so this reads the same
   * for dark and light skin. A plain luminance std dev would not — darker skin
   * has a smaller luminance range and would be rejected as "low contrast" for
   * being dark. 0 when there is no skin to measure.
   */
  skinContrast: number;
}

/** Rec. 601 luma, the standard perceptual weighting. */
function luma(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export function toGrayscale(image: RgbaImage): Float64Array {
  const { data, width, height } = image;
  const gray = new Float64Array(width * height);
  for (let i = 0; i < width * height; i += 1) {
    const o = i * 4;
    gray[i] = luma(data[o] ?? 0, data[o + 1] ?? 0, data[o + 2] ?? 0);
  }
  return gray;
}

/**
 * Variance of the Laplacian: the standard cheap focus measure. A sharp image
 * has strong second derivatives at edges; a blurred one does not.
 */
export function laplacianVariance(gray: Float64Array, width: number, height: number): number {
  if (width < 3 || height < 3) return 0;
  const values: number[] = [];
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const i = y * width + x;
      const centre = gray[i] ?? 0;
      const sum =
        (gray[i - width] ?? 0) + (gray[i + width] ?? 0) + (gray[i - 1] ?? 0) + (gray[i + 1] ?? 0);
      values.push(sum - 4 * centre);
    }
  }
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  return variance;
}

/**
 * Loose YCbCr skin test. Deliberately wide so it works across the full range
 * of Indian skin tones — this is a "is there a hand here at all" check, and a
 * narrow threshold would fail darker skin, which would be both wrong and unjust.
 */
/**
 * Skin chroma only, with a very low luma floor. Chroma survives darkening —
 * a crease on dark skin is still skin-coloured, just in shadow — so this is
 * the predicate for measuring contrast WITHIN a palm. Using the stricter
 * presence classifier for that silently dropped the darkest crease pixels,
 * which on dark skin are the creases themselves.
 *
 * cr >= 133, not 130: warm dark greys (a wall, a table) sit at ~130 and were
 * being counted as skin. Dark skin tones sit at 140+ because red dominates.
 */
export function isSkinChroma(r: number, g: number, b: number): boolean {
  const y = luma(r, g, b);
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  return y > 12 && cb >= 77 && cb <= 135 && cr >= 133 && cr <= 180;
}

/** Presence classifier: skin chroma at a luminance that is clearly not shadow. */
export function isSkinPixel(r: number, g: number, b: number): boolean {
  return luma(r, g, b) > 40 && isSkinChroma(r, g, b);
}

export function computeMetrics(image: RgbaImage): ImageMetrics {
  const { data, width, height } = image;
  const total = width * height;
  const gray = toGrayscale(image);

  let sum = 0;
  let clipped = 0;
  for (let i = 0; i < total; i += 1) {
    const g = gray[i] ?? 0;
    sum += g;
    if (g >= 245) clipped += 1;
  }
  const meanLuminance = total > 0 ? sum / total : 0;

  let sqDiff = 0;
  for (let i = 0; i < total; i += 1) sqDiff += ((gray[i] ?? 0) - meanLuminance) ** 2;
  const contrast = total > 0 ? Math.sqrt(sqDiff / total) : 0;

  const cx0 = Math.floor(width * 0.25);
  const cx1 = Math.ceil(width * 0.75);
  const cy0 = Math.floor(height * 0.25);
  const cy1 = Math.ceil(height * 0.75);

  let skin = 0;
  let centreSkin = 0;
  let centreTotal = 0;
  let chromaCount = 0;
  let skinLumaSum = 0;
  let skinLumaSq = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const o = (y * width + x) * 4;
      const r = data[o] ?? 0;
      const gg = data[o + 1] ?? 0;
      const bb = data[o + 2] ?? 0;
      const chroma = isSkinChroma(r, gg, bb);
      const hit = chroma && (gray[y * width + x] ?? 0) > 40;
      if (hit) skin += 1;
      if (chroma) {
        const g = gray[y * width + x] ?? 0;
        chromaCount += 1;
        skinLumaSum += g;
        skinLumaSq += g * g;
      }
      if (x >= cx0 && x < cx1 && y >= cy0 && y < cy1) {
        centreTotal += 1;
        if (hit) centreSkin += 1;
      }
    }
  }

  return {
    meanLuminance,
    contrast,
    blurScore: laplacianVariance(gray, width, height),
    skinFraction: total > 0 ? skin / total : 0,
    centreOccupancy: centreTotal > 0 ? centreSkin / centreTotal : 0,
    clippedFraction: total > 0 ? clipped / total : 0,
    skinContrast: skinContrastOf(chromaCount, skinLumaSum, skinLumaSq),
  };
}

function skinContrastOf(count: number, sum: number, sumSq: number): number {
  if (count < 16) return 0;
  const mean = sum / count;
  if (mean <= 0) return 0;
  const variance = Math.max(0, sumSq / count - mean * mean);
  return Math.sqrt(variance) / mean;
}
