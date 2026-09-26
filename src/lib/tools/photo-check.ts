/**
 * Palm photo checker — pure logic (tool 3). Ported from the app's
 * `src/features/quality/metrics.ts` + `verdict.ts` (read 2026-09-26): the same
 * pixel statistics and the same STARTING-VALUE thresholds, run on a 96px
 * decode. No DOM and no I/O here, so every threshold is unit-tested in Node.
 *
 * Honest limits (the app says the same): these are cheap pixel statistics.
 * They can tell "a skin-coloured area, bright and sharp enough", nothing more.
 * They cannot prove every line is readable and cannot tell a palm from the
 * back of a hand. The thresholds are not benchmarked on a labelled set yet.
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
  clippedFraction: number;
  skinContrast: number;
}

/** The analysis size the thresholds were calibrated for (long edge, px). */
export const ANALYSIS_EDGE = 96;

export const THRESHOLDS = {
  minSourceEdge: 600,
  minBlurScore: 55,
  minLuminance: 45,
  maxLuminance: 214,
  maxClippedFraction: 0.25,
  minSkinContrast: 0.06,
  minSkinFraction: 0.1,
  minPalmFraction: 0.28,
} as const;

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

/** Variance of the Laplacian: the standard cheap focus measure. */
export function laplacianVariance(gray: Float64Array, width: number, height: number): number {
  if (width < 3 || height < 3) return 0;
  let count = 0;
  let sum = 0;
  let sumSq = 0;
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const i = y * width + x;
      const value =
        (gray[i - width] ?? 0) + (gray[i + width] ?? 0) + (gray[i - 1] ?? 0) + (gray[i + 1] ?? 0) - 4 * (gray[i] ?? 0);
      count += 1;
      sum += value;
      sumSq += value * value;
    }
  }
  if (count === 0) return 0;
  const mean = sum / count;
  return Math.max(0, sumSq / count - mean * mean);
}

/**
 * Skin chroma, deliberately wide so it works across Indian skin tones (a
 * narrow test would fail darker skin, which would be wrong and unjust).
 */
export function isSkinChroma(r: number, g: number, b: number): boolean {
  const y = luma(r, g, b);
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  return y > 12 && cb >= 77 && cb <= 135 && cr >= 133 && cr <= 180;
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
      const g = gray[y * width + x] ?? 0;
      const chroma = isSkinChroma(data[o] ?? 0, data[o + 1] ?? 0, data[o + 2] ?? 0);
      const hit = chroma && g > 40;
      if (hit) skin += 1;
      if (chroma) {
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

  let skinContrast = 0;
  if (chromaCount >= 16) {
    const mean = skinLumaSum / chromaCount;
    if (mean > 0) skinContrast = Math.sqrt(Math.max(0, skinLumaSq / chromaCount - mean * mean)) / mean;
  }

  return {
    meanLuminance,
    contrast,
    blurScore: laplacianVariance(gray, width, height),
    skinFraction: total > 0 ? skin / total : 0,
    centreOccupancy: centreTotal > 0 ? centreSkin / centreTotal : 0,
    clippedFraction: total > 0 ? clipped / total : 0,
    skinContrast,
  };
}

export type QualityIssue =
  | 'too_small'
  | 'too_dark'
  | 'too_bright'
  | 'no_palm_detected'
  | 'palm_too_small_in_frame'
  | 'too_blurry'
  | 'low_contrast';

/** One plain sentence per issue, from the app's RETAKE_MESSAGES (same order of blame: none). */
export const FIX_MESSAGES: Record<QualityIssue, string> = {
  too_small: 'That photo is a little small. Move closer, or use your main camera.',
  too_blurry: 'That came out blurry. Rest your hand on something and hold still for a moment.',
  too_dark: 'It is too dark to see the lines. Try facing a window, or turn on a light.',
  too_bright: 'The light is washing the lines out. Step out of direct sun or move away from the lamp.',
  low_contrast: 'The lines are not standing out. Flat, even light from the side usually shows them better.',
  no_palm_detected: 'We could not find a palm in that photo. Fill the frame with your open hand.',
  palm_too_small_in_frame: 'Your palm is a little far away. Bring it closer to fill the frame.',
};

/** The user hears about the most blocking issue first (the app's ISSUE_PRIORITY). */
const ISSUE_PRIORITY: QualityIssue[] = [
  'too_small',
  'too_dark',
  'too_bright',
  'no_palm_detected',
  'too_blurry',
  'palm_too_small_in_frame',
  'low_contrast',
];

export interface QualityVerdict {
  passed: boolean;
  issues: QualityIssue[];
  primaryIssue: QualityIssue | null;
  metrics: ImageMetrics;
}

export function evaluateQuality(metrics: ImageMetrics, sourceWidth: number, sourceHeight: number): QualityVerdict {
  const issues: QualityIssue[] = [];
  const tooDark = metrics.meanLuminance < THRESHOLDS.minLuminance;
  const tooBright =
    metrics.meanLuminance > THRESHOLDS.maxLuminance || metrics.clippedFraction > THRESHOLDS.maxClippedFraction;

  if (Math.min(sourceWidth, sourceHeight) < THRESHOLDS.minSourceEdge) issues.push('too_small');
  if (tooDark) issues.push('too_dark');
  if (tooBright) issues.push('too_bright');

  // Skin can only be judged in usable light: in the dark the honest message is about the light.
  const skinJudgeable = !tooDark && !tooBright;
  const palmPresent = metrics.skinFraction >= THRESHOLDS.minSkinFraction;
  if (skinJudgeable && !palmPresent) issues.push('no_palm_detected');
  if (skinJudgeable && palmPresent && metrics.skinFraction < THRESHOLDS.minPalmFraction) {
    issues.push('palm_too_small_in_frame');
  }
  if (metrics.blurScore < THRESHOLDS.minBlurScore) issues.push('too_blurry');
  if (skinJudgeable && palmPresent && metrics.skinContrast < THRESHOLDS.minSkinContrast) issues.push('low_contrast');

  const primaryIssue = ISSUE_PRIORITY.find((issue) => issues.includes(issue)) ?? null;
  return { passed: issues.length === 0, issues, primaryIssue, metrics };
}

/** The four ticks the page shows (DESIGN_SYSTEM.md §10, wow moment 5), plus photo size. */
export type CheckId = 'size' | 'light' | 'sharp' | 'palm' | 'lines';
export type CheckState = 'pass' | 'fail' | 'unknown';

export interface CheckRow {
  id: CheckId;
  label: string;
  state: CheckState;
  /** The fix when it fails, or why it could not be judged. */
  note: string | null;
}

const LABELS: Record<CheckId, string> = {
  size: 'Big enough',
  light: 'Bright enough, not washed out',
  sharp: 'Sharp, not blurry',
  palm: 'Whole palm in the frame',
  lines: 'Lines stand out',
};

const NEEDS_LIGHT = 'We can check this once the light is right.';
const NEEDS_PALM = 'We can check this once your palm fills the frame.';

/** The verdict as five rows, in the order a person fixes them. */
export function checklist(verdict: QualityVerdict): CheckRow[] {
  const has = (issue: QualityIssue) => verdict.issues.includes(issue);
  const lightBad = has('too_dark') || has('too_bright');
  const palmBad = has('no_palm_detected') || has('palm_too_small_in_frame');
  const row = (id: CheckId, state: CheckState, note: string | null): CheckRow => ({ id, label: LABELS[id], state, note });

  const lightIssue: QualityIssue | null = has('too_dark') ? 'too_dark' : has('too_bright') ? 'too_bright' : null;
  const palmIssue: QualityIssue | null = has('no_palm_detected')
    ? 'no_palm_detected'
    : has('palm_too_small_in_frame')
      ? 'palm_too_small_in_frame'
      : null;

  return [
    row('size', has('too_small') ? 'fail' : 'pass', has('too_small') ? FIX_MESSAGES.too_small : null),
    row('light', lightIssue ? 'fail' : 'pass', lightIssue ? FIX_MESSAGES[lightIssue] : null),
    row('sharp', has('too_blurry') ? 'fail' : 'pass', has('too_blurry') ? FIX_MESSAGES.too_blurry : null),
    lightBad
      ? row('palm', 'unknown', NEEDS_LIGHT)
      : row('palm', palmIssue ? 'fail' : 'pass', palmIssue ? FIX_MESSAGES[palmIssue] : null),
    lightBad
      ? row('lines', 'unknown', NEEDS_LIGHT)
      : palmBad
        ? row('lines', 'unknown', NEEDS_PALM)
        : row('lines', has('low_contrast') ? 'fail' : 'pass', has('low_contrast') ? FIX_MESSAGES.low_contrast : null),
  ];
}

/** Size of the analysis decode for a photo: 96px on the long edge, aspect kept, at least 1px. */
export function analysisSize(width: number, height: number, edge: number = ANALYSIS_EDGE): { width: number; height: number } {
  if (!(width > 0 && height > 0)) return { width: 0, height: 0 };
  const scale = edge / Math.max(width, height);
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

/** File types a browser can decode here. HEIC gets "please choose a JPG" (D15). */
export function fileProblem(type: string, name: string): 'heic' | 'not-image' | null {
  const lower = name.toLowerCase();
  if (/image\/hei[cf]/.test(type) || /\.(heic|heif)$/.test(lower)) return 'heic';
  if (type && !type.startsWith('image/')) return 'not-image';
  if (!type && !/\.(jpe?g|png|webp|gif|avif|bmp)$/.test(lower)) return 'not-image';
  return null;
}
