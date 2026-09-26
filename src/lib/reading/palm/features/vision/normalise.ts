// COPIED from palm-ai-new--feat-m1-foundation/src/features/vision/normalise.ts at app commit 38389f51b74d (2026-09-26).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import { CROSSING_KINDS, visionOutputSchema, type VisionOutput } from '../observation/schema';
import {
  CONTINUITY_CLASSES,
  CURVATURE_CLASSES,
  DEPTH_CLASSES,
  LENGTH_CLASSES,
  MAJOR_LINES,
  MOUNT_TYPES,
  PALM_SHAPES,
  PROMINENCE_CLASSES,
  RELIABLE_MARKS,
  ZONES,
} from '../observation/taxonomy';

import { EXTRACTED_LINES, type ExtractedLineType } from './prompt';

/**
 * Repairs real model output into something the schema will accept.
 *
 * The one rule that governs every transform here: repair may only ever LOSE
 * information or LOWER confidence. It must never invent a value, raise a
 * confidence, or turn an "I don't know" into an answer. A model that returned
 * garbage should end up with an honest empty observation, not a confident
 * fictional one.
 */

const UNKNOWN_STRINGS = new Set(['', 'unknown', 'n/a', 'na', 'none', 'null', 'not visible', '?']);

/** Strips markdown fences and any prose around the JSON body. */
export function extractJsonBody(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = (fenced?.[1] ?? raw).trim();
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return candidate;
  return candidate.slice(start, end + 1);
}

/**
 * Closes a JSON answer the model stopped writing half-way (max_tokens, a
 * dropped stream). Cuts back to the last complete element or key-value pair
 * and closes whatever is still open. Everything after that point is lost,
 * never guessed. Returns the input unchanged when there is nothing to close.
 */
export function closeTruncatedJson(text: string): string {
  const begin = text.indexOf('{');
  if (begin < 0) return text;
  let stack = '';
  let inString = false;
  let escaped = false;
  let safeEnd = -1;
  let safeStack = '';

  for (let i = begin; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{' || ch === '[') stack += ch;
    else if (ch === '}' || ch === ']') {
      stack = stack.slice(0, -1);
      if (stack.length === 0) return text.slice(begin, i + 1);
      safeEnd = i + 1;
      safeStack = stack;
    } else if (ch === ',') {
      // Everything before a separator is a finished element or pair.
      safeEnd = i;
      safeStack = stack;
    }
  }
  if (safeEnd < 0) return text;
  const closers = [...safeStack]
    .reverse()
    .map((open) => (open === '{' ? '}' : ']'))
    .join('');
  return text.slice(begin, safeEnd) + closers;
}

/**
 * JSON.parse with the repairs a small model's output routinely needs: fences
 * and prose around the body, trailing commas, and an answer cut off mid-way.
 * @throws SyntaxError when nothing JSON-shaped can be recovered.
 */
export function parseModelJson(raw: string): { value: unknown; repairs: string[] } {
  const repairs: string[] = [];
  const body = extractJsonBody(raw);
  if (body !== raw.trim()) repairs.push('stripped prose or markdown fences around the JSON');
  const withoutTrailingCommas = (s: string) => s.replace(/,(\s*[}\]])/g, '$1');
  try {
    return { value: JSON.parse(body) as unknown, repairs };
  } catch {
    // Fall through to the repairs below.
  }
  try {
    const value = JSON.parse(withoutTrailingCommas(body)) as unknown;
    repairs.push('removed trailing commas');
    return { value, repairs };
  } catch {
    // Fall through.
  }
  try {
    // Seen live from Llama 4 Scout: `"marks":}` — a key with its value missing.
    const value = JSON.parse(withoutTrailingCommas(fillMissingValues(body))) as unknown;
    repairs.push('filled keys that had no value with null');
    return { value, repairs };
  } catch {
    // Probably cut off: repair from the first brace of the raw text, since
    // extractJsonBody cut at a '}' that may sit in the middle of the answer.
  }
  const closed = closeTruncatedJson(fillMissingValues(raw));
  const value = JSON.parse(withoutTrailingCommas(fillMissingValues(closed))) as unknown;
  repairs.push('response was cut off; kept only the complete part');
  return { value, repairs };
}

/**
 * Inserts `null` where a key's colon is followed directly by `,` `}` or `]`
 * (or the end of the text). String-aware, so text inside values is untouched.
 */
export function fillMissingValues(text: string): string {
  let out = '';
  let inString = false;
  let escaped = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    out += ch;
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
    } else if (ch === ':') {
      let j = i + 1;
      while (j < text.length && /\s/.test(text[j]!)) j++;
      if (j >= text.length || text[j] === ',' || text[j] === '}' || text[j] === ']') out += ' null';
    }
  }
  return out;
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

/** Missing or unparseable confidence becomes 0, never a default of "probably fine". */
function toConfidence(value: unknown): number {
  const parsed = typeof value === 'string' ? Number(value) : value;
  if (typeof parsed !== 'number' || !Number.isFinite(parsed)) return 0;
  return Math.min(1, Math.max(0, parsed));
}

function toEnum<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  if (typeof value !== 'string') return null;
  const cleaned = value.trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (UNKNOWN_STRINGS.has(cleaned)) return null;
  return (allowed as readonly string[]).includes(cleaned) ? (cleaned as T) : null;
}

function toObserved<T extends string>(value: unknown, allowed: readonly T[]) {
  const record = asRecord(value);
  const parsed = toEnum(record.value, allowed);
  const confidence = toConfidence(record.confidence);
  // A value we could not map is not a value. Its confidence goes with it.
  return parsed === null ? { value: null, confidence: Math.min(confidence, 0.3) } : { value: parsed, confidence };
}

function toRegion(value: unknown) {
  const record = asRecord(value);
  const nums = ['x', 'y', 'w', 'h'].map((key) => {
    const raw = record[key];
    const num = typeof raw === 'string' ? Number(raw) : raw;
    return typeof num === 'number' && Number.isFinite(num) ? Math.min(1, Math.max(0, num)) : null;
  });
  if (nums.some((n) => n === null)) return null;
  const [x, y, w, h] = nums as number[];
  return { x: x ?? 0, y: y ?? 0, w: w ?? 0, h: h ?? 0 };
}

function toCoordinate(raw: unknown): number | null {
  const num = typeof raw === 'string' ? Number(raw) : raw;
  if (typeof num !== 'number' || !Number.isFinite(num)) return null;
  // A hair outside the frame is rounding; anything further is not a
  // normalised coordinate (pixels, percentages) and is dropped, not rescaled.
  if (num < -0.02 || num > 1.02) return null;
  return Math.round(Math.min(1, Math.max(0, num)) * 1000) / 1000;
}

/** [x, y] or { x, y } → a normalised point, or null. */
export function toPoint(value: unknown): [number, number] | null {
  let rawX: unknown;
  let rawY: unknown;
  if (Array.isArray(value)) {
    if (value.length !== 2) return null;
    [rawX, rawY] = value;
  } else {
    const record = asRecord(value);
    rawX = record.x;
    rawY = record.y;
  }
  const x = toCoordinate(rawX);
  const y = toCoordinate(rawY);
  return x === null || y === null ? null : [x, y];
}

const MAX_PATH_POINTS = 12;

/**
 * A traced line: invalid points dropped, consecutive duplicates merged, capped.
 * Fewer than two points is not a line, so it becomes empty.
 */
export function toPath(value: unknown): [number, number][] {
  if (!Array.isArray(value)) return [];
  const points: [number, number][] = [];
  for (const entry of value) {
    const point = toPoint(entry);
    if (!point) continue;
    const last = points[points.length - 1];
    if (last && last[0] === point[0] && last[1] === point[1]) continue;
    points.push(point);
  }
  if (points.length < 2) return [];
  if (points.length <= MAX_PATH_POINTS) return points;
  // Too many points: keep both ends and an even spread between them.
  const step = (points.length - 1) / (MAX_PATH_POINTS - 1);
  return Array.from({ length: MAX_PATH_POINTS }, (_, i) => points[Math.round(i * step)] as [number, number]);
}

/** The bounding box of a path, so region-based consumers keep working without `regions`. */
function pathRegion(path: [number, number][]) {
  const xs = path.map((p) => p[0]);
  const ys = path.map((p) => p[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  const round = (n: number) => Math.round(n * 1000) / 1000;
  return { x, y, w: round(Math.max(...xs) - x), h: round(Math.max(...ys) - y) };
}

function toCrossings(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      const record = asRecord(entry);
      const kind = toEnum(record.kind, CROSSING_KINDS);
      const point = toPoint(record.point);
      // No location, no crossing: an unplaced mark cannot be shown or checked.
      if (kind === null || point === null) return null;
      const lines = (Array.isArray(record.lines) ? record.lines : [])
        .map((l) => toEnum(l, EXTRACTED_LINES))
        .filter((l): l is ExtractedLineType => l !== null)
        .slice(0, 2);
      return { kind, lines, point, confidence: toConfidence(record.confidence) };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null)
    .slice(0, 12);
}

function toMarks(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      const record = asRecord(entry);
      const kind = toEnum(record.kind, RELIABLE_MARKS);
      // Fragile marks are dropped rather than rejected: the model was told not
      // to report them, and one disobedient field should not lose the reading.
      if (kind === null) return null;
      const countRaw = typeof record.count === 'string' ? Number(record.count) : record.count;
      const count =
        typeof countRaw === 'number' && Number.isFinite(countRaw)
          ? Math.min(20, Math.max(1, Math.round(countRaw)))
          : 1;
      const point = toPoint(record.point);
      return {
        kind,
        count,
        confidence: toConfidence(record.confidence),
        zone: toEnum(record.zone, ZONES),
        region: toRegion(record.region),
        ...(point ? { point } : {}),
      };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null)
    .slice(0, 20);
}

function toLine(value: unknown, fallbackType: string) {
  const record = asRecord(value);
  const type = toEnum(record.type, EXTRACTED_LINES) ?? fallbackType;
  const visible = record.visible === true || record.visible === 'true';
  // A path for a line the model says it cannot see would draw an invented line.
  const path = visible ? toPath(record.path) : [];
  const regions = (Array.isArray(record.regions) ? record.regions : [])
    .map(toRegion)
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .slice(0, 8);
  return {
    type,
    visible,
    confidence: toConfidence(record.confidence),
    length: toObserved(record.length, LENGTH_CLASSES),
    depth: toObserved(record.depth, DEPTH_CLASSES),
    curvature: toObserved(record.curvature, CURVATURE_CLASSES),
    continuity: toObserved(record.continuity, CONTINUITY_CLASSES),
    startZone: toObserved(record.startZone ?? record.start_zone, ZONES),
    endZone: toObserved(record.endZone ?? record.end_zone, ZONES),
    marks: toMarks(record.marks),
    regions: regions.length === 0 && path.length > 0 ? [pathRegion(path)] : regions,
    notes: typeof record.notes === 'string' && record.notes.trim() ? record.notes.slice(0, 400) : null,
    // Only present when traced, so observations without paths keep their old shape.
    ...(path.length > 0 ? { path } : {}),
  };
}

export interface NormaliseResult {
  output: VisionOutput;
  /** What we had to repair. Recorded so provider quality can be measured. */
  repairs: string[];
}

/**
 * @throws SyntaxError when the payload is not JSON at all. Everything else is
 * repaired downward rather than thrown.
 */
export function normaliseVisionPayload(raw: string | unknown): NormaliseResult {
  const repairs: string[] = [];

  let parsed: unknown = raw;
  if (typeof raw === 'string') {
    // A cut-off answer keeps its complete lines. A line it never reached is
    // recorded below as not seen with confidence 0, so no rule can fire on it.
    const result = parseModelJson(raw);
    repairs.push(...result.repairs);
    parsed = result.value;
  }

  const record = asRecord(parsed);
  const rawLines = Array.isArray(record.lines) ? record.lines : [];
  if (!Array.isArray(record.lines)) repairs.push('no lines array in response');

  const byType = new Map<string, unknown>();
  for (const entry of rawLines) {
    const type = toEnum(asRecord(entry).type, EXTRACTED_LINES);
    if (type && !byType.has(type)) byType.set(type, entry);
  }

  // A major line the model simply forgot is recorded as not seen, never as
  // absent from the reading. Silence is not evidence.
  const lines = MAJOR_LINES.map((type) => {
    const entry = byType.get(type);
    if (entry === undefined) {
      repairs.push(`${type} line missing from response, recorded as not visible`);
      return toLine({ type, visible: false, confidence: 0 }, type);
    }
    return toLine(entry, type);
  });
  // Minor lines are reported only when the model chose to: their absence from
  // the answer says nothing, so no "not visible" entry is made up for them.
  for (const type of EXTRACTED_LINES) {
    const entry = byType.get(type);
    if (entry !== undefined && !(MAJOR_LINES as readonly string[]).includes(type)) lines.push(toLine(entry, type));
  }

  const rawMounts = Array.isArray(record.mounts) ? record.mounts : [];
  const seenMounts = new Set<string>();
  const mounts = rawMounts
    .map((entry) => {
      const mountRecord = asRecord(entry);
      const type = toEnum(mountRecord.type, MOUNT_TYPES);
      if (type === null || seenMounts.has(type)) return null;
      seenMounts.add(type);
      return {
        type,
        prominence: toObserved(mountRecord.prominence, PROMINENCE_CLASSES),
        confidence: toConfidence(mountRecord.confidence),
        region: toRegion(mountRecord.region),
      };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null);

  const warnings = (Array.isArray(record.warnings) ? record.warnings : [])
    .filter((w): w is string => typeof w === 'string' && w.trim().length > 0)
    .map((w) => w.slice(0, 200))
    .slice(0, 20);

  const output = visionOutputSchema.parse({
    lines,
    mounts,
    handShape: toObserved(record.handShape ?? record.hand_shape, PALM_SHAPES),
    warnings,
    ...(Array.isArray(record.crossings) ? { crossings: toCrossings(record.crossings) } : {}),
  });

  return { output, repairs };
}
