/**
 * The real palm photo behind every guide's "Find your line" module (guide
 * template v3). It is the home page's sample photo, shared: public/samples/
 * hero-palm-*.{avif,webp,jpg}; source, photographer and licence are in
 * public/samples/LICENSE.txt (Pexels License, 2026-09-26).
 *
 * Honesty rule (owner, 2026-09-26): a line's REGION may be marked from the
 * scanner only when real scanner output for THIS photo exists: the scan-palm
 * response saved as public/samples/hero-palm.json (polylines normalised 0–1).
 * Until then the guides mark the anatomical area where each line runs, as a
 * clearly labelled "where to look" area, never a drawn line.
 *
 * All shapes are in the photo's own pixels (1200 × 1600, DESIGN_SYSTEM.md
 * §7.5), so they sit on the same spot of the hand at any screen size.
 */

export type GuideLine = 'heart' | 'head' | 'life' | 'fate';
export type ZoneKey = GuideLine | 'marriage' | 'simian';
export type RegionKey = ZoneKey | 'all' | 'none';

export interface Zone {
  /** Which colour and label the zone uses. */
  line: ZoneKey;
  /** An ellipse in photo pixels, rotated (degrees, clockwise) around its centre. */
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rotate: number;
  /** Top-left corner of the label, in photo pixels (one zone shown). */
  labelX: number;
  labelY: number;
  /** A point on the line itself: the pin used when all 4 lines are shown at once. */
  pinX: number;
  pinY: number;
}

export interface SamplePhoto {
  width: number;
  height: number;
  /** The <picture> sources, smallest first. */
  avif: { src: string; w: number }[];
  webp: { src: string; w: number }[];
  fallback: string;
  /** The part of the photo the module shows (the palm), in photo pixels. */
  crop: { x: number; y: number; w: number; h: number };
  alt: string;
  credit: { author: string; site: string; url: string; licence: string };
}

export const SAMPLE: SamplePhoto = {
  width: 1200,
  height: 1600,
  avif: [
    { src: '/samples/hero-palm-480.avif', w: 480 },
    { src: '/samples/hero-palm-960.avif', w: 960 },
  ],
  webp: [
    { src: '/samples/hero-palm-480.webp', w: 480 },
    { src: '/samples/hero-palm-960.webp', w: 960 },
  ],
  fallback: '/samples/hero-palm-1200.jpg',
  crop: { x: 60, y: 600, w: 1140, h: 1000 },
  alt: 'A real open right palm in daylight, fingers spread, with its creases clearly visible.',
  credit: { author: 'Hanna Pad', site: 'Pexels', url: 'https://www.pexels.com/photo/close-up-shot-of-a-palm-8058739/', licence: 'Pexels License' },
};

/**
 * Where each line runs on THIS photo: the anatomical area, checked by eye
 * against the creases (right palm, thumb on the right). Not a tracing. Check
 * them again whenever the photo changes (npm run shots on a guide page).
 */
export const ZONES: Record<ZoneKey, Zone> = {
  // Little-finger edge, rising to end under the middle and index fingers.
  heart: { line: 'heart', cx: 400, cy: 930, rx: 290, ry: 72, rotate: -27, labelX: 110, labelY: 700, pinX: 545, pinY: 858 },
  // From the thumb side, joined to the life line, sloping down across the palm.
  head: { line: 'head', cx: 510, cy: 1005, rx: 385, ry: 62, rotate: -18, labelX: 150, labelY: 1150, pinX: 300, pinY: 1080 },
  // Around the ball of the thumb, from between thumb and index finger towards the wrist.
  life: { line: 'life', cx: 690, cy: 1190, rx: 95, ry: 315, rotate: 25, labelX: 640, labelY: 1500, pinX: 612, pinY: 1380 },
  // Up the middle of the palm towards the middle finger.
  fate: { line: 'fate', cx: 545, cy: 1125, rx: 60, ry: 300, rotate: 21, labelX: 250, labelY: 1440, pinX: 478, pinY: 1210 },
  // The outer edge under the little finger, above the start of the heart line.
  marriage: { line: 'marriage', cx: 185, cy: 935, rx: 72, ry: 58, rotate: 0, labelX: 110, labelY: 700, pinX: 185, pinY: 935 },
  // Where the heart and head lines run: one line would take the place of both.
  simian: { line: 'simian', cx: 500, cy: 950, rx: 400, ry: 135, rotate: -20, labelX: 110, labelY: 690, pinX: 500, pinY: 950 },
};

interface ScanFile {
  lines?: Partial<Record<GuideLine, { present?: boolean; polyline?: [number, number][] }>>;
}

// Real scanner output for this exact photo, if someone has saved it (never hand-made).
const scanFiles = import.meta.glob<ScanFile>('/public/samples/hero-palm.json', { eager: true, import: 'default' });
const SCAN: ScanFile | null = Object.values(scanFiles)[0] ?? null;

export interface RegionView {
  zones: Zone[];
  /** 'area' = one zone, shaded; 'pins' = the 4 lines at once, a pin on each (overlapping areas would be a mess). */
  mode: 'area' | 'pins';
  /** 'scan' = the area comes from real scanner output; 'guide' = the anatomical "where to look" area. */
  source: 'scan' | 'guide';
}

/** An area around a real scanned line (its padded bounding box), as a zone. */
function zoneFromScan(polyline: [number, number][], base: Zone): Zone {
  const xs = polyline.map(([x]) => x * SAMPLE.width);
  const ys = polyline.map(([, y]) => y * SAMPLE.height);
  const pad = 0.04 * SAMPLE.width;
  const minX = Math.min(...xs) - pad;
  const maxX = Math.max(...xs) + pad;
  const minY = Math.min(...ys) - pad;
  const maxY = Math.max(...ys) + pad;
  const mid = Math.floor(polyline.length / 2);
  const pinX = xs[mid] ?? base.pinX;
  const pinY = ys[mid] ?? base.pinY;
  return { ...base, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, rx: (maxX - minX) / 2, ry: (maxY - minY) / 2, rotate: 0, pinX, pinY };
}

const isLine = (key: ZoneKey): key is GuideLine => key === 'heart' || key === 'head' || key === 'life' || key === 'fate';

export function regionView(key: RegionKey): RegionView {
  if (key === 'none') return { zones: [], mode: 'area', source: 'guide' };
  const mode = key === 'all' ? 'pins' : 'area';
  const keys: ZoneKey[] = key === 'all' ? ['heart', 'head', 'life', 'fate'] : [key];
  const scanned = keys.map((k) => (isLine(k) ? SCAN?.lines?.[k] : undefined));
  if (scanned.every((line) => line && line.present !== false && (line.polyline?.length ?? 0) > 1)) {
    return { zones: keys.map((k, i) => zoneFromScan(scanned[i]!.polyline!, ZONES[k])), mode, source: 'scan' };
  }
  return { zones: keys.map((k) => ZONES[k]), mode, source: 'guide' };
}
