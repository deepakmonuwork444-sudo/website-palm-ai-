/**
 * The guides' HD teaching images (WEB-DEC-047, 2026-09-28): AI-made photos and
 * 3D renders (design-v4/guide-assets/, 1792 × 2400 or 2048 × 2048 PNG),
 * exported with sharp to AVIF + WebP in public/images/guides/. Always labelled
 * as AI-made where they show; never a drawn palm line on them (only the real
 * scanner's lines go on a photo, src/lib/guides/traced-palm.ts).
 */

export interface GuideImage {
  avif: string;
  webp: string;
  /** The fallback file (smallest WebP). */
  src: string;
  /** The largest file's pixel size (the <img> width and height: its aspect). */
  width: number;
  height: number;
}

/** Square renders (hand shapes, which hand, words to know). */
export const TILE_WIDTHS = [256, 512] as const;
/** The 1792 × 2400 "don't" example photos. */
export const PHOTO_WIDTHS = [300, 600] as const;

const set = (base: string, widths: readonly number[], ext: 'avif' | 'webp') => widths.map((w) => `${base}-${w}.${ext} ${w}w`).join(', ');

function image(base: string, widths: readonly number[], height: (w: number) => number): GuideImage {
  const largest = widths[widths.length - 1]!;
  return { avif: set(base, widths, 'avif'), webp: set(base, widths, 'webp'), src: `${base}-${widths[0]}.webp`, width: largest, height: height(largest) };
}

/** A square render: shape-<type>, hand-writing, hand-other, word-<key>. */
export const tile = (name: string): GuideImage => image(`/images/guides/${name}`, TILE_WIDTHS, (w) => w);

/** A "don't" example photo: dark, fist, far, back (same shape as the guide palm). */
export const examplePhoto = (key: string): GuideImage => image(`/images/guides/photo-dont-${key}`, PHOTO_WIDTHS, (w) => Math.round((w * 2400) / 1792));

/** The render for each "Words to know" term; the writing hand reuses the which-hand render. */
export const WORD_TILE: Record<string, string> = {
  line: 'word-line',
  crease: 'word-crease',
  mount: 'word-mount',
  fork: 'word-fork',
  break: 'word-break',
  hand: 'hand-writing',
};

/** Every file a srcset above points at (tests/unit/guide-visuals.test.ts checks they all ship). */
export const srcsetFiles = (img: GuideImage) => `${img.avif}, ${img.webp}`.split(/,\s*/).map((entry) => entry.split(' ')[0]!);
