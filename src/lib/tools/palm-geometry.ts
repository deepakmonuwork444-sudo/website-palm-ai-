/**
 * The stylised right palm shared by every tool diagram (the same drawing as
 * `components/PalmTrace.astro`, DESIGN_SYSTEM.md §9): thumb on the right,
 * little finger on the left, as you see your own right palm. Coordinates are
 * in the SVG viewBox below; it is always labelled as a drawing.
 */

export const PALM_VIEWBOX = '36 30 178 230';

export const PALM_OUTLINE =
  'M70 252 C 58 222, 50 192, 50 160 L 50 100 A 12 12 0 0 1 74 100 L 75 126 L 78 64 A 12.5 12.5 0 0 1 103 64 L 104 120 L 107 50 A 13 13 0 0 1 133 50 L 133 122 L 136 72 A 12.5 12.5 0 0 1 161 72 L 161 146 C 166 134, 176 118, 186 112 A 11 11 0 0 1 200 128 C 194 148, 182 170, 170 186 C 160 200, 152 220, 150 252 Z';

export type LineName = 'life' | 'head' | 'heart' | 'fate';

/** Picker thumbnails zoom into the part of the palm where each line runs, so options are easy to tell apart. */
export const THUMB_VIEW: Record<LineName, string> = {
  heart: '44 40 150 140',
  head: '44 96 150 130',
  life: '70 110 140 150',
  fate: '44 100 150 160',
};

export const LINE_ORDER: readonly LineName[] = ['heart', 'head', 'life', 'fate'];

export const LINE_PATHS: Record<LineName, string> = {
  life: 'M160 164 C 134 178, 122 206, 130 244',
  head: 'M160 158 C 132 162, 100 172, 68 190',
  heart: 'M56 152 C 82 142, 110 148, 140 132',
  fate: 'M111 247 C 112 222, 114 196, 118 152',
};

export type MountId = 'jupiter' | 'saturn' | 'sun' | 'mercury' | 'venus' | 'moon' | 'mars-thumb' | 'mars-outer';

export const MOUNT_ORDER: readonly MountId[] = ['jupiter', 'saturn', 'sun', 'mercury', 'venus', 'moon', 'mars-thumb', 'mars-outer'];

/** Mount areas as ellipses (cx, cy, rx, ry), placed where the app's vision prompt defines each zone. */
export const MOUNT_AREAS: Record<MountId, { cx: number; cy: number; rx: number; ry: number }> = {
  jupiter: { cx: 149, cy: 122, rx: 11, ry: 10 },
  saturn: { cx: 120, cy: 117, rx: 11, ry: 10 },
  sun: { cx: 90, cy: 120, rx: 11, ry: 10 },
  mercury: { cx: 62, cy: 128, rx: 10, ry: 10 },
  venus: { cx: 156, cy: 212, rx: 14, ry: 22 },
  moon: { cx: 68, cy: 224, rx: 13, ry: 20 },
  'mars-thumb': { cx: 165, cy: 176, rx: 9, ry: 8 },
  'mars-outer': { cx: 58, cy: 170, rx: 8, ry: 12 },
};

/** Where each line's tap target sits on the drawing (spaced ≥ 24 units, about 48px at phone size). */
export const LINE_PINS: Record<LineName, { x: number; y: number }> = {
  heart: { x: 80, y: 146 },
  head: { x: 97, y: 176 },
  life: { x: 128, y: 236 },
  fate: { x: 115, y: 202 },
};

/** A point in the viewBox as a percentage of the drawing, for HTML buttons laid over it. */
export function toPercent(x: number, y: number): { left: number; top: number } {
  const [minX, minY, width, height] = PALM_VIEWBOX.split(' ').map(Number) as [number, number, number, number];
  return {
    left: Math.round(((x - minX) / width) * 1000) / 10,
    top: Math.round(((y - minY) / height) * 1000) / 10,
  };
}
