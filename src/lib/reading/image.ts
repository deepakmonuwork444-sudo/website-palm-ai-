/**
 * Photo handling in the browser (plan §12.12, SECURITY_PRIVACY.md §3).
 *
 * - Decoded through an <img> (browsers apply the EXIF rotation there), drawn
 *   on a canvas and re-encoded as JPEG: the re-encode carries no EXIF at all,
 *   so GPS and camera data never leave the device.
 * - Three copies, long edge: 1,080 px (sent to the line scanner, kept in this
 *   browser for the report), 768 px (sent to the reading), 96 px RGBA (the
 *   local photo check only, never sent). The original file never leaves.
 * - HEIC: desktop Chrome/Firefox cannot decode it → a clear "take a new photo
 *   or upload a JPG" (D15), never a silent failure.
 *
 * The pure helpers are unit-tested; the canvas part runs only in a browser.
 */

import { ReadingError } from './errors';

export const SCAN_EDGE = 1080;
export const EXTRACT_EDGE = 768;
export const CHECK_EDGE = 96;
export const JPEG_QUALITY = 0.85;
/** Second try after a 413 from the server: smaller and lighter. */
export const SHRUNK_SCAN_EDGE = 900;
export const SHRUNK_QUALITY = 0.72;

export interface EncodedCopy {
  base64: string;
  width: number;
  height: number;
  bytes: number;
}

export interface RgbaCopy {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export interface PreparedPhoto {
  /** The original's size (after EXIF rotation): the local check's "too small" test reads it. */
  sourceWidth: number;
  sourceHeight: number;
  scan: EncodedCopy;
  extract: EncodedCopy;
  check: RgbaCopy;
  /** The 1,080 px JPEG, for this browser's saved readings. */
  blob: Blob;
}

/** Width and height with the long edge at most `edge` (never upscaled). */
export function targetSize(width: number, height: number, edge: number): { width: number; height: number } {
  if (!(width > 0) || !(height > 0)) throw new RangeError('targetSize: empty image');
  const scale = Math.min(1, edge / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

/** A HEIC/HEIF file by its type or name (phones sometimes send an empty type). */
export function isHeicFile(file: { type?: string; name?: string }): boolean {
  return /image\/hei[cf]/i.test(file.type ?? '') || /\.hei[cf]$/i.test(file.name ?? '');
}

/** True when a JPEG's bytes carry an EXIF block (APP1 "Exif\0\0") before the image data. */
export function jpegHasExif(bytes: Uint8Array): boolean {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return false;
  let i = 2;
  while (i + 4 <= bytes.length) {
    if (bytes[i] !== 0xff) return false;
    const marker = bytes[i + 1]!;
    // Start of scan / end of image: no more metadata segments.
    if (marker === 0xda || marker === 0xd9) return false;
    const length = (bytes[i + 2]! << 8) | bytes[i + 3]!;
    if (marker === 0xe1 && bytes[i + 4] === 0x45 && bytes[i + 5] === 0x78 && bytes[i + 6] === 0x69 && bytes[i + 7] === 0x66) return true;
    i += 2 + length;
  }
  return false;
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(binary);
}

export function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}

/* ── Browser only ─────────────────────────────────────────────────────── */

function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('decode'));
    };
    img.src = url;
  });
}

function canvasOf(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function draw(source: CanvasImageSource, from: { width: number; height: number }, edge: number): HTMLCanvasElement {
  const size = targetSize(from.width, from.height, edge);
  const canvas = canvasOf(size.width, size.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no 2d canvas');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, size.width, size.height);
  return canvas;
}

function toJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('encode'))), 'image/jpeg', quality);
  });
}

async function encode(canvas: HTMLCanvasElement, quality: number): Promise<{ copy: EncodedCopy; blob: Blob }> {
  const blob = await toJpeg(canvas, quality);
  const bytes = new Uint8Array(await blob.arrayBuffer());
  return { blob, copy: { base64: bytesToBase64(bytes), width: canvas.width, height: canvas.height, bytes: bytes.length } };
}

/** The three copies of a picked photo. Throws ReadingError heic / decode. */
export async function preparePhoto(file: Blob & { name?: string }): Promise<PreparedPhoto> {
  let img: HTMLImageElement;
  try {
    img = await loadImage(file);
  } catch {
    throw new ReadingError(isHeicFile(file) ? 'heic' : 'decode');
  }
  const source = { width: img.naturalWidth, height: img.naturalHeight };
  if (!source.width || !source.height) throw new ReadingError('decode');

  // One full decode for the 1,080 copy; the smaller copies come from it.
  const scanCanvas = draw(img, source, SCAN_EDGE);
  const scan = await encode(scanCanvas, JPEG_QUALITY);
  const extractCanvas = draw(scanCanvas, scanCanvas, EXTRACT_EDGE);
  const extract = await encode(extractCanvas, JPEG_QUALITY);
  const checkCanvas = draw(scanCanvas, scanCanvas, CHECK_EDGE);
  const pixels = checkCanvas.getContext('2d')!.getImageData(0, 0, checkCanvas.width, checkCanvas.height);

  return {
    sourceWidth: source.width,
    sourceHeight: source.height,
    scan: scan.copy,
    extract: extract.copy,
    check: { data: pixels.data, width: pixels.width, height: pixels.height },
    blob: scan.blob,
  };
}

/** After a 413: a smaller, lighter scan copy from the saved 1,080 px JPEG. */
export async function shrinkCopy(blob: Blob, edge = SHRUNK_SCAN_EDGE, quality = SHRUNK_QUALITY): Promise<EncodedCopy> {
  const img = await loadImage(blob);
  const canvas = draw(img, { width: img.naturalWidth, height: img.naturalHeight }, edge);
  return (await encode(canvas, quality)).copy;
}
