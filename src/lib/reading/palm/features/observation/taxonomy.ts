// COPIED from palm-ai-new--feat-m1-foundation/src/features/observation/taxonomy.ts at app commit fbc2232d837f (2026-09-30).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
/**
 * The controlled vocabulary a vision provider is allowed to speak.
 *
 * A model may only return values from these lists. Anything else fails
 * validation and the reading is rejected rather than quietly accepted.
 * This is the mechanism that stops a model inventing palmistry.
 *
 * The taxonomy is extensible on purpose: different Indian traditions name
 * things differently, and the corpus decides the final canonical set.
 */

export const HAND_SIDES = ['left', 'right'] as const;
export type HandSide = (typeof HAND_SIDES)[number];

export const MAJOR_LINES = ['life', 'head', 'heart', 'fate'] as const;

export const MINOR_LINES = [
  'sun',
  'mercury',
  'relationship',
  'travel',
  'intuition',
  'girdle_of_venus',
] as const;

export const LINE_TYPES = [...MAJOR_LINES, ...MINOR_LINES] as const;
export type LineType = (typeof LINE_TYPES)[number];
export type MajorLineType = (typeof MAJOR_LINES)[number];

export const MOUNT_TYPES = [
  'jupiter',
  'saturn',
  'apollo',
  'mercury',
  'venus',
  'luna',
  'mars_positive',
  'mars_negative',
] as const;
export type MountType = (typeof MOUNT_TYPES)[number];

/** Palm regions used for where a line starts, ends, or a mark sits. */
export const ZONES = [
  'jupiter',
  'saturn',
  'apollo',
  'mercury',
  'venus',
  'luna',
  'mars_positive',
  'mars_negative',
  'plain_of_mars',
  'wrist',
  'between_jupiter_and_saturn',
  'under_index',
  'under_middle',
  'under_ring',
  'under_little',
] as const;
export type Zone = (typeof ZONES)[number];

export const LENGTH_CLASSES = ['short', 'medium', 'long'] as const;
export type LengthClass = (typeof LENGTH_CLASSES)[number];

export const DEPTH_CLASSES = ['faint', 'moderate', 'deep'] as const;
export type DepthClass = (typeof DEPTH_CLASSES)[number];

export const CURVATURE_CLASSES = ['straight', 'gentle', 'curved'] as const;
export type CurvatureClass = (typeof CURVATURE_CLASSES)[number];

export const CONTINUITY_CLASSES = ['continuous', 'broken', 'chained'] as const;
export type ContinuityClass = (typeof CONTINUITY_CLASSES)[number];

export const PROMINENCE_CLASSES = ['flat', 'normal', 'raised'] as const;
export type ProminenceClass = (typeof PROMINENCE_CLASSES)[number];

export const PALM_SHAPES = ['earth', 'air', 'water', 'fire'] as const;
export type PalmShape = (typeof PALM_SHAPES)[number];

/**
 * Marks. Ordered roughly by how reliably a phone photo can show them.
 * `RELIABLE_MARKS` is what the MVP is allowed to interpret; the rest are
 * observed and stored but excluded from reports until benchmarking earns them.
 */
export const RELIABLE_MARKS = ['break', 'branch_up', 'branch_down', 'fork'] as const;
export const FRAGILE_MARKS = [
  'island',
  'chain',
  'cross',
  'star',
  'square',
  'triangle',
  'tassel',
] as const;

export const MARK_KINDS = [...RELIABLE_MARKS, ...FRAGILE_MARKS] as const;
export type MarkKind = (typeof MARK_KINDS)[number];

export function isReliableMark(kind: MarkKind): boolean {
  return (RELIABLE_MARKS as readonly string[]).includes(kind);
}

/** Why a photo was rejected. Each maps to one plain-language retake message. */
export const QUALITY_ISSUES = [
  'too_small',
  'too_blurry',
  'too_dark',
  'too_bright',
  'low_contrast',
  'no_palm_detected',
  'palm_too_small_in_frame',
  'possible_back_of_hand',
] as const;
export type QualityIssue = (typeof QUALITY_ISSUES)[number];
