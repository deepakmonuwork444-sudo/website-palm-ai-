// WEB SHIM for palm-ai-new--feat-m1-foundation/src/features/quality/gate.ts — written by scripts/sync-palm-lib.mjs, not copied.
// The app version needs React Native; the copied files only use what is below.

import type { QualityVerdict } from './verdict';

/** Same shape as the app's gate result; the web computes it in src/lib/reading/quality.ts. */
export interface GateResult extends QualityVerdict {
  sourceWidth: number;
  sourceHeight: number;
}
