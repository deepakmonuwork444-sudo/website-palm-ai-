/**
 * The self-hosted hand model (ARCHITECTURE.md "On-device hand model").
 * Nothing loads from a third-party CDN: the wasm runtime comes out of the
 * pinned npm package at build time (hashed under /_astro/), the model file
 * sits in public/models/ with its licence. The byte sizes drive the honest
 * download progress (a compressed transfer still counts real bytes), and a
 * unit test checks them against the files, so a version bump can't drift.
 *
 * - Runtime: @mediapipe/tasks-vision 1.0.1 (Apache-2.0, Google).
 * - Model: hand_landmarker.task, float16, version 1 (Apache-2.0, Google),
 *   from storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/,
 *   sha256 fbc2a30080c3c557093b5ddfc334698132eb341044ccee322ccf8bcf3607cde1.
 */

export const MODEL_URL = '/models/hand-landmarker/float16-1/hand_landmarker.task';
export const MODEL_BYTES = 7_819_105;
export const MODEL_SHA256 = 'fbc2a30080c3c557093b5ddfc334698132eb341044ccee322ccf8bcf3607cde1';

export const WASM_BYTES = { simd: 11_756_954, noSimd: 10_960_242 } as const;

/** What the page tells people before the first download: the two files, rounded up. */
export function downloadMb(simd = true): number {
  return Math.ceil((MODEL_BYTES + (simd ? WASM_BYTES.simd : WASM_BYTES.noSimd)) / 1_000_000);
}

/** "4.2 of 20 MB" style numbers: one decimal below 10, whole above. */
export function mbText(bytes: number): string {
  const mb = bytes / 1_000_000;
  return mb < 10 ? mb.toFixed(1) : String(Math.round(mb));
}
