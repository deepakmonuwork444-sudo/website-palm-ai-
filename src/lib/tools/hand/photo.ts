/**
 * Opening a picked photo for the photo tools (browser only), reusing the
 * reading's image pipeline (src/lib/reading/image.ts): decoded through an
 * <img> (the browser applies the EXIF rotation there), re-encoded without
 * EXIF, 1,080 px copy for showing and scanning, 96 px copy for the pixel
 * check. The original file is never kept or sent anywhere by these tools.
 *
 * The hand-off between tools (photo checker → hand type → finger reader)
 * keeps the 1,080 px copy in this tab's sessionStorage for one page load:
 * it never leaves the device, is removed as soon as the next tool reads it,
 * and is gone when the tab closes.
 */

import { ReadingError } from '../../reading/errors';
import { base64ToBytes, isHeicFile, preparePhoto, type PreparedPhoto } from '../../reading/image';
import type { ToolId } from '../registry';

export type OpenProblem = 'heic' | 'decode' | 'not-image';

export class PhotoOpenError extends Error {
  readonly problem: OpenProblem;
  constructor(problem: OpenProblem) {
    super(problem);
    this.name = 'PhotoOpenError';
    this.problem = problem;
  }
}

export const OPEN_TEXT: Record<OpenProblem, string> = {
  heic: 'This photo is in HEIC format, which this browser can’t open. Please choose a JPG. On an iPhone, set Camera, Formats to Most Compatible.',
  decode: 'This browser couldn’t open that photo. Please choose a JPG or PNG picture of your hand.',
  'not-image': 'That file isn’t a photo. Please choose a JPG or PNG picture of your hand.',
};

/**
 * A file that is plainly not an image. Some Android pickers send no type at
 * all: then only a known non-image name is refused and the decoder decides.
 * HEIC always goes to the decoder (Safari opens it; others get the HEIC message).
 */
export function notAnImage(file: { type?: string; name?: string }): boolean {
  if (isHeicFile(file)) return false;
  const type = file.type ?? '';
  if (type) return !type.startsWith('image/');
  return /\.(pdf|docx?|txt|mp4|mov|3gp|zip|apk)$/i.test(file.name ?? '');
}

export async function openPhoto(file: Blob & { name?: string }): Promise<PreparedPhoto> {
  if (notAnImage(file)) throw new PhotoOpenError('not-image');
  try {
    return await preparePhoto(file);
  } catch (caught) {
    if (caught instanceof ReadingError && caught.code === 'heic') throw new PhotoOpenError('heic');
    throw new PhotoOpenError('decode');
  }
}

/** The 1,080 px copy as something a canvas can draw. */
export async function drawable(prepared: PreparedPhoto): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(prepared.blob);
    } catch {
      // Older Safari: fall back to an <img>.
    }
  }
  const url = URL.createObjectURL(prepared.blob);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/* ── Hand-off between tools ──────────────────────────────────────────── */

export const HANDOFF_KEY = 'palmsays:tool-photo';
/** A hand-off older than this is ignored (a tab left open overnight). */
export const HANDOFF_MAX_AGE_MS = 30 * 60_000;

export interface HandOff {
  base64: string;
  from: ToolId;
  at: number;
}

export function encodeHandOff(base64: string, from: ToolId, now = Date.now()): string {
  return JSON.stringify({ base64, from, at: now } satisfies HandOff);
}

export function decodeHandOff(raw: string | null, now = Date.now()): HandOff | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<HandOff>;
    if (typeof value.base64 !== 'string' || value.base64.length < 100 || typeof value.at !== 'number' || typeof value.from !== 'string') return null;
    if (now - value.at > HANDOFF_MAX_AGE_MS || value.at > now + 60_000) return null;
    return value as HandOff;
  } catch {
    return null;
  }
}

/** Keep the photo for the next tool in this tab. False when the browser refuses (private mode, full storage). */
export function handOffPhoto(prepared: PreparedPhoto, from: ToolId): boolean {
  try {
    sessionStorage.setItem(HANDOFF_KEY, encodeHandOff(prepared.scan.base64, from));
    return true;
  } catch {
    return false;
  }
}

/** The photo another tool handed over, removed as it is read. */
export function takeHandedPhoto(): { blob: Blob; from: ToolId } | null {
  let raw: string | null;
  try {
    raw = sessionStorage.getItem(HANDOFF_KEY);
    sessionStorage.removeItem(HANDOFF_KEY);
  } catch {
    return null;
  }
  const value = decodeHandOff(raw);
  if (!value) return null;
  try {
    return { blob: new Blob([base64ToBytes(value.base64) as BlobPart], { type: 'image/jpeg' }), from: value.from };
  } catch {
    return null;
  }
}
