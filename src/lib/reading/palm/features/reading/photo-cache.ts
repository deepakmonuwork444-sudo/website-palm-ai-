// COPIED from palm-ai-new--feat-m1-foundation/src/features/reading/photo-cache.ts at app commit fbc2232d837f (2026-09-30).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import type { HandSide } from '../observation/taxonomy';
import type { VisionResult } from '../vision/provider';

/**
 * The same photo, read again, gives the same reading.
 *
 * The vision model is not perfectly repeatable, so a byte-identical photo of
 * the same hand could come back described a little differently — and the
 * reading with it. This keeps the model's description of the last few photos
 * on the phone, keyed by a hash of the photo and the hand side, and the
 * pipeline reuses it instead of asking the model again.
 *
 * Only descriptions that became a complete reading are stored (the pipeline
 * saves after every check has passed), at most `MAX_ENTRIES`, newest first.
 * Never the photo itself — only its hash and the written description.
 *
 * Storage is plugged in by the app (reading/store.ts); without it (tests,
 * web preview) nothing is cached and every reading asks the model.
 */

export interface CacheStorage {
  getItem: (name: string) => string | null | Promise<string | null>;
  setItem: (name: string, value: string) => unknown;
}

export const PHOTO_CACHE_KEY = 'palm-observation-cache';
export const MAX_ENTRIES = 20;

interface Entry {
  key: string;
  result: VisionResult;
}

let storage: CacheStorage | null = null;

export function configurePhotoCache(next: CacheStorage | null): void {
  storage = next;
}

/** FNV-1a over the string's UTF-16 code units, 32-bit, as 8 hex digits. */
function fnv1a(input: string, seed: number): string {
  let hash = seed >>> 0;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/**
 * A stable key for one photo and hand: two FNV-1a passes with different seeds
 * plus the length. Not cryptographic — it only has to tell photos apart.
 */
export function photoKey(base64: string, side: HandSide): string {
  return `${side}:${base64.length}:${fnv1a(base64, 0x811c9dc5)}${fnv1a(base64, 0x01000193)}`;
}

function readEntries(): Entry[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(PHOTO_CACHE_KEY);
    if (typeof raw !== 'string') return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is Entry =>
        typeof e === 'object' &&
        e !== null &&
        typeof (e as Entry).key === 'string' &&
        typeof (e as Entry).result === 'object' &&
        (e as Entry).result !== null &&
        Array.isArray((e as Entry).result.output?.lines),
    );
  } catch {
    return [];
  }
}

/** The saved description for this photo and hand, or null. */
export function cachedExtraction(key: string): VisionResult | null {
  return readEntries().find((e) => e.key === key)?.result ?? null;
}

/** Saves a description that produced a complete reading; keeps the newest `MAX_ENTRIES`. */
export function saveExtraction(key: string, result: VisionResult): void {
  if (!storage) return;
  try {
    const entries = [{ key, result }, ...readEntries().filter((e) => e.key !== key)].slice(0, MAX_ENTRIES);
    storage.setItem(PHOTO_CACHE_KEY, JSON.stringify(entries));
  } catch {
    // Best-effort: a reading never fails because it could not be remembered.
    return;
  }
}
