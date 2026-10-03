/**
 * Real scanner output for a sample photo, read at BUILD TIME from
 * public/samples/<name>.json (the scan-palm response for that exact photo:
 * polylines normalised 0–1 to the photo, the same shape as
 * src/lib/reading/mock/scan-response.json).
 *
 * The home hero draws lines ONLY from this file. No file, a bad file, or a
 * scan made for a different image size ratio → no lines at all (the hero then
 * shows the real photo with the beam and "your lines appear after the scan").
 * Lines are never drawn by hand (DESIGN_SYSTEM.md §9).
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { z } from 'zod';

export type SampleLineName = 'life' | 'head' | 'heart' | 'fate';
export const SAMPLE_LINE_ORDER: readonly SampleLineName[] = ['life', 'head', 'heart', 'fate'];

const point = z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)]);
const line = z.object({
  present: z.boolean(),
  flagged: z.boolean().optional(),
  polyline: z.array(point).optional(),
});
const scanSchema = z.object({
  model: z.object({ name: z.string().min(1) }),
  image: z.object({ width: z.number().positive(), height: z.number().positive() }),
  lines: z.object({ life: line.optional(), head: line.optional(), heart: line.optional(), fate: line.optional() }),
});

export interface SampleScan {
  model: string;
  width: number;
  height: number;
  /** Only lines the scanner really returned (present, not flagged, ≥ 2 points), in photo pixels. */
  lines: { name: SampleLineName; d: string }[];
  /** Lines the scanner did not return clearly: shown as dashed "not clearly seen" chips, never drawn. */
  missing: SampleLineName[];
}

/** Parse a scanner response; null when it is not a usable real scan for a photo of `aspect` (w/h). */
export function parseSampleScan(raw: unknown, aspect: number): SampleScan | null {
  const parsed = scanSchema.safeParse(raw);
  if (!parsed.success) return null;
  const { image, lines, model } = parsed.data;
  // A scan made for another crop would put the lines in the wrong place: refuse it.
  if (Math.abs(image.width / image.height - aspect) > 0.01) return null;
  const drawn: SampleScan['lines'] = [];
  const missing: SampleLineName[] = [];
  for (const name of SAMPLE_LINE_ORDER) {
    const entry = lines[name];
    const points = entry?.polyline ?? [];
    if (!entry || !entry.present || entry.flagged || points.length < 2) {
      missing.push(name);
      continue;
    }
    const d = points
      .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${(x * image.width).toFixed(1)} ${(y * image.height).toFixed(1)}`)
      .join('');
    drawn.push({ name, d });
  }
  if (drawn.length === 0) return null;
  return { model: model.name, width: image.width, height: image.height, lines: drawn, missing };
}

/** public/samples/<name>.json → a usable scan, or null (the normal case until a real scan exists). */
export function loadSampleScan(name: string, aspect: number, root: string = process.cwd()): SampleScan | null {
  const file = join(root, 'public', 'samples', `${name}.json`);
  if (!existsSync(file)) return null;
  try {
    return parseSampleScan(JSON.parse(readFileSync(file, 'utf8')), aspect);
  } catch {
    return null;
  }
}
