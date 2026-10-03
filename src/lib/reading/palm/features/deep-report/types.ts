// COPIED from palm-ai-new--feat-m1-foundation/src/features/deep-report/types.ts at app commit fbc2232d837f (2026-09-30).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
/**
 * The premium ("deep") report: the contract between generation and the report UI.
 *
 * Everything user-facing is bilingual and equally complete in both languages.
 * What the photo shows (`feature`, `location`) is kept apart from what the
 * tradition says (`traditional`) and how it applies here (`personal`).
 * Coordinates are normalised 0..1 on the saved photo, origin top-left.
 */

import type { LineEvidence } from '../observation/schema';

export interface Bi {
  en: string;
  hi: string;
}

export type DeepLineType = 'life' | 'head' | 'heart' | 'fate' | 'sun' | 'mercury';

export type Point = [x: number, y: number];

export interface TracedLine {
  type: DeepLineType;
  visible: boolean;
  /** 0..1, how sure the model is that the traced path is this line. */
  confidence: number;
  /** Points along the line, start to end (up to 100 from the scanner). Empty when not visible. */
  path: Point[];
  start: Bi;
  end: Bi;
  /**
   * 'line-service' when the path was traced from the crease pixels. Only such
   * lines are drawn on the photo; older reports (no source) never are.
   */
  source?: 'line-service' | 'model';
  /** Outside the current scan scope (fate, sun, mercury): never drawn or described as seen. */
  notAnalysed?: boolean;
  /** Mean crease probability along the path, 0..1. Low values draw dashed. */
  pixelConfidence?: number;
  /** Where the crease breaks, on the photo. */
  breaks?: Point[];
  /** Where a branch leaves the crease, on the photo. */
  forks?: Point[];
  /** The scanner's raw features for this line, so every statement can be traced. */
  evidence?: LineEvidence;
}

/** How the photo scanned, shown in the report's "Scan quality" block. */
export interface ScanQuality {
  status: 'ok' | 'unavailable';
  reason?: string;
  metrics: Record<string, number | boolean>;
  lines: {
    type: 'heart' | 'head' | 'life' | 'fate';
    /** 'traced': found and fits the definition; 'unidentified': a crease that failed it; 'not_found'. */
    result: 'traced' | 'unidentified' | 'not_found';
    pixelConfidence: number;
    semanticConfidence: number;
  }[];
  ontologyVersion?: string;
}

export type DeepSectionId =
  | 'overview'
  | 'life'
  | 'head'
  | 'heart'
  | 'fate'
  | 'other_lines'
  | 'markings'
  | 'personality'
  | 'career_money'
  | 'relationships'
  | 'strengths_challenges'
  | 'summary';

export const DEEP_SECTION_ORDER: readonly DeepSectionId[] = [
  'overview',
  'life',
  'head',
  'heart',
  'fate',
  'other_lines',
  'markings',
  'personality',
  'career_money',
  'relationships',
  'strengths_challenges',
  'summary',
];

export interface DeepObservation {
  id: string;
  /** The line this observation comes from, so the photo can highlight it. */
  line?: DeepLineType;
  /** Where on the photo, when it is a specific spot (a fork, a break, a cross). */
  point?: Point;
  /** What is visible. */
  feature: Bi;
  /** Exactly where on the palm. */
  location: Bi;
  /** What traditional palmistry reads in it. */
  traditional: Bi;
  /** How that applies to this person, framed as a tendency, never a fact. */
  personal: Bi;
  /** 0..1 */
  confidence: number;
  /** The matched rules this meaning rests on, as the writer cited them. */
  ruleIds?: string[];
}

export interface DeepSection {
  id: DeepSectionId;
  title: Bi;
  intro: Bi;
  observations: DeepObservation[];
}

/** One branch of the mind map: palm feature → theme → interpretation. */
export interface ThemeLink {
  feature: Bi;
  theme: Bi;
  interpretation: Bi;
  line?: DeepLineType;
}

/** A detected-feature summary for a simple bar, not a scientific measurement. */
export interface FeatureScore {
  label: Bi;
  /** 0..1: how clear / prominent the feature is in this photo. */
  value: number;
  line?: DeepLineType;
}

export interface DeepReport {
  version: 1;
  generatedAt: string;
  model: string;
  /** Local file on this phone (never uploaded after analysis); null if it was not kept. */
  photoUri: string | null;
  /** Width / height of the saved photo, for laying out the overlay. */
  photoAspect: number | null;
  lines: TracedLine[];
  sections: DeepSection[];
  strengths: Bi[];
  challenges: Bi[];
  mindMap: ThemeLink[];
  featureScores: FeatureScore[];
  summary: Bi;
  disclaimer: Bi;
  /**
   * The "Overall reading": a 150-250 word summary grounded only in the measured
   * line features and matched rules. Absent on older reports.
   */
  overall?: Bi;
  /** Absent on reports made before the line scanner. */
  scanQuality?: ScanQuality;
  /** Lines this reading did not analyse (shown as "Not analysed yet"). */
  notAnalysed?: DeepLineType[];
}
