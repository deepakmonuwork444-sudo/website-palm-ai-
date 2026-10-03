/**
 * The on-device hand finder (browser only): MediaPipe Hand Landmarker,
 * self-hosted, loaded ONLY after a person picks a photo (never on page load).
 *
 * - The wasm runtime and the model are downloaded with our own fetch, so the
 *   progress the page shows is the real byte count. The wasm bytes are handed
 *   to MediaPipe as a blob: URL (one download, no double fetch); the model
 *   goes in as a buffer. Both then sit in the HTTP cache (immutable paths),
 *   so a second visit starts at once.
 * - Pages that use it add `'wasm-unsafe-eval'` (WebAssembly) and `blob:` to
 *   their CSP (src/lib/tools/hand/csp.ts); every other page keeps the strict one.
 * - Nothing is uploaded: the photo is only ever drawn on a canvas here.
 * - Low-end phones: the photo is downscaled to 768 px before the model runs,
 *   and the page paints its "Finding your hand" line before the work starts.
 * - Recall: on 206 phone photos of palms (many darker skin tones) the default
 *   settings missed 11. A 0.3 confidence plus a second pass with a 20 % grey
 *   border (the palm finder misses hands that fill the frame) found 202.
 */

import loaderSimd from '@mediapipe/tasks-vision/vision_wasm_internal.js?url';
import binarySimd from '@mediapipe/tasks-vision/vision_wasm_internal.wasm?url';
import loaderNoSimd from '@mediapipe/tasks-vision/vision_wasm_nosimd_internal.js?url';
import binaryNoSimd from '@mediapipe/tasks-vision/vision_wasm_nosimd_internal.wasm?url';
import type { HandLandmarker as HandLandmarkerType, HandLandmarkerResult } from '@mediapipe/tasks-vision';

import type { DetectedHand, Handedness, Landmark, PhotoHands } from './landmarks';
import { MODEL_BYTES, MODEL_URL, WASM_BYTES } from './model-files';

export const INFERENCE_EDGE = 768;
export const PAD_FRACTION = 0.2;
const CONFIDENCE = 0.3;

export interface LoadProgress {
  loaded: number;
  total: number;
}

export type DetectorErrorCode = 'offline' | 'unsupported' | 'failed';

export class DetectorError extends Error {
  readonly code: DetectorErrorCode;
  constructor(code: DetectorErrorCode, detail = '') {
    super(detail ? `${code}: ${detail}` : code);
    this.name = 'DetectorError';
    this.code = code;
  }
}

let loading: Promise<HandLandmarkerType> | null = null;

async function download(url: string, expected: number, onBytes: (bytes: number) => void): Promise<Uint8Array> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new DetectorError('offline', url);
  }
  if (!response.ok) throw new DetectorError('failed', `${url} ${response.status}`);
  if (!response.body) {
    const bytes = new Uint8Array(await response.arrayBuffer());
    onBytes(bytes.length);
    return bytes;
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    let step: ReadableStreamReadResult<Uint8Array>;
    try {
      step = await reader.read();
    } catch {
      throw new DetectorError('offline', url);
    }
    if (step.done) break;
    chunks.push(step.value);
    received += step.value.length;
    onBytes(Math.min(received, expected));
  }
  const out = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

/** Loads the model once per page; later calls reuse it. */
export function loadHandFinder(onProgress?: (progress: LoadProgress) => void): Promise<HandLandmarkerType> {
  loading ??= (async () => {
    if (typeof WebAssembly === 'undefined') throw new DetectorError('unsupported', 'no WebAssembly');
    const vision = await import('@mediapipe/tasks-vision').catch(() => {
      throw new DetectorError('offline', 'runtime');
    });
    const simd = await vision.FilesetResolver.isSimdSupported().catch(() => false);
    const wasmTotal = simd ? WASM_BYTES.simd : WASM_BYTES.noSimd;
    const total = wasmTotal + MODEL_BYTES;
    let wasmNow = 0;
    let modelNow = 0;
    const report = () => onProgress?.({ loaded: wasmNow + modelNow, total });
    report();
    const [wasm, model] = await Promise.all([
      download(simd ? binarySimd : binaryNoSimd, wasmTotal, (n) => {
        wasmNow = n;
        report();
      }),
      download(MODEL_URL, MODEL_BYTES, (n) => {
        modelNow = n;
        report();
      }),
    ]);
    const wasmUrl = URL.createObjectURL(new Blob([wasm as BlobPart], { type: 'application/wasm' }));
    try {
      return await vision.HandLandmarker.createFromOptions(
        { wasmLoaderPath: new URL(simd ? loaderSimd : loaderNoSimd, location.href).href, wasmBinaryPath: wasmUrl },
        {
          baseOptions: { modelAssetBuffer: model, delegate: 'CPU' },
          runningMode: 'IMAGE',
          numHands: 2,
          minHandDetectionConfidence: CONFIDENCE,
          minHandPresenceConfidence: CONFIDENCE,
        },
      );
    } catch (caught) {
      throw new DetectorError('unsupported', caught instanceof Error ? caught.message.slice(0, 120) : 'create');
    } finally {
      URL.revokeObjectURL(wasmUrl);
    }
  })();
  // A failed load can be retried (offline → online).
  loading.catch(() => {
    loading = null;
  });
  return loading;
}

/** Map the model's result from a padded canvas back to the photo's own 0–1 coordinates. */
export function unpad(point: { x: number; y: number; z: number }, pad: number, width: number, height: number): Landmark {
  const outerW = width + 2 * pad;
  const outerH = height + 2 * pad;
  return { x: (point.x * outerW - pad) / width, y: (point.y * outerH - pad) / height, z: point.z };
}

export function toHands(result: HandLandmarkerResult, pad: number, width: number, height: number): DetectedHand[] {
  return result.landmarks.map((points, i) => {
    const category = result.handedness[i]?.[0];
    const handedness: Handedness = category?.categoryName === 'Left' ? 'Left' : 'Right';
    return {
      landmarks: points.map((p) => unpad(p, pad, width, height)),
      world: result.worldLandmarks[i]?.map((p) => ({ x: p.x, y: p.y, z: p.z })) ?? null,
      handedness,
      handednessScore: category?.score ?? 0,
    };
  });
}

function canvas(width: number, height: number): HTMLCanvasElement {
  const el = document.createElement('canvas');
  el.width = width;
  el.height = height;
  return el;
}

/** Let the browser paint the status line before the model blocks the thread. */
export function nextPaint(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
}

/**
 * Finds hands in a decoded photo. Coordinates come back normalised to the
 * photo itself (whatever size it is shown at), so the drawing lines up.
 */
export async function findHands(source: CanvasImageSource & { width: number; height: number }, landmarker: HandLandmarkerType): Promise<PhotoHands> {
  const scale = Math.min(1, INFERENCE_EDGE / Math.max(source.width, source.height));
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));
  const plain = canvas(width, height);
  const ctx = plain.getContext('2d');
  if (!ctx) throw new DetectorError('unsupported', 'no 2d canvas');
  ctx.drawImage(source, 0, 0, width, height);
  await nextPaint();
  let hands = toHands(landmarker.detect(plain), 0, width, height);
  if (hands.length === 0) {
    const pad = Math.round(Math.max(width, height) * PAD_FRACTION);
    const padded = canvas(width + 2 * pad, height + 2 * pad);
    const pctx = padded.getContext('2d')!;
    pctx.fillStyle = 'rgb(128, 128, 128)';
    pctx.fillRect(0, 0, padded.width, padded.height);
    pctx.drawImage(plain, pad, pad);
    await nextPaint();
    hands = toHands(landmarker.detect(padded), pad, width, height);
  }
  return { width, height, hands };
}
