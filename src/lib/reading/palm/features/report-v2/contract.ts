// COPIED from palm-ai-new--feat-m1-foundation/src/features/report-v2/contract.ts at app commit fbc2232d837f (2026-09-30).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import type {
  ContinuityClass,
  CurvatureClass,
  DepthClass,
  HandSide,
  LengthClass,
  LineType,
  QualityIssue,
  Zone,
} from '../observation/taxonomy';
import type { Dominance } from '../observation/schema';
import type { BookCitation } from '../reading/books';

/**
 * Report V2 — the Palm Experience data contract (phase 1).
 *
 * Everything the V2 screens (Reveal, Palm Map, Show Me, Discoveries...) may
 * show comes from this one object, built deterministically by
 * `buildPalmExperience` from a saved ReadingOutcome. No screen reads the raw
 * observation. An LLM may later rewrite `shortCopy`/`deepCopy` from selected
 * observations; it never adds a fact, a line or a meaning.
 *
 * Three truth layers per observation, never mixed:
 *   A `observed`       — physical evidence only ("heart line depth: deep").
 *   B `classification` — the palmistry class that evidence falls in.
 *   C `interpretation` — the tradition's reading, framed as "traditionally
 *                        read as", never causal, only from a rule's meaning.
 *
 * Versioned: bump PALM_EXPERIENCE_VERSION on any breaking field change.
 * No React Native imports: unit-tested in Node.
 */

export const PALM_EXPERIENCE_VERSION = 1;

export type Bilingual = { en: string; hi: string };

/** User-facing visibility words. A UI shows these, never a raw percentage. */
export type Visibility = 'clear' | 'visible' | 'faint' | 'uncertain';

/**
 * traced:       the palm line scanner followed the crease (geometry exists).
 * ai_described: the vision AI described it from the photo (no geometry, lower confidence).
 * not_read:     nothing read it.
 */
export type EvidenceKind = 'traced' | 'ai_described' | 'not_read';

/** Normalised [x, y] on the kept JPEG, origin top-left. */
export type NormPoint = [number, number];

export type SemanticName = LineType | 'unclassified';

export interface DetectedLine {
  /** Stable id, `line.<type>`: the same prefix rule paths use. */
  lineId: string;
  /** The name the evidence supports; 'unclassified' when the crease failed the line's definition. */
  semanticName: SemanticName;
  aliases: { en: string[]; hi: string[] };
  present: boolean;
  evidenceKind: EvidenceKind;
  /** How sure the crease is really there (scanner pixel confidence, or the AI's own confidence). */
  visualConfidence: number | null;
  /** How sure it is THIS line (scanner ontology checks). Null when nothing checked it. Kept separate. */
  semanticConfidence: number | null;
  visibility: Visibility;
  /** Traced only. Null for anything the AI merely described. */
  polyline: NormPoint[] | null;
  start: NormPoint | null;
  end: NormPoint | null;
  startZone: Zone | null;
  endZone: Zone | null;
  length: { class: LengthClass | null; normalized: number | null };
  curvature: { class: CurvatureClass | null; netTurningDeg: number | null; chordArcRatio: number | null };
  continuity: ContinuityClass | null;
  depth: { class: DepthClass | null; value: number | null };
  /** Traced only. */
  breaks: NormPoint[];
  /** Traced only. */
  forks: NormPoint[];
  /** Empty until the scanner outputs branches. */
  branches: NormPoint[];
  /** Where this traced line crosses another traced line (computed, deterministic). */
  intersections: { withLineId: string; point: NormPoint }[];
  /** Lines it crosses or shares a rule with. */
  relatedLineIds: string[];
  /** Scanner ontology checks that failed, by id. */
  failedChecks: string[];
  modelVersion: string | null;
  ontologyVersion: string | null;
}

export interface ExperienceFocus {
  lineId: string;
  /** Polyline index range [i, j] to highlight. Absent: the whole line. */
  segment?: [number, number];
  point?: NormPoint;
}

export interface ExperienceObservation {
  /** Stable hash of ruleId + featureIds. Same reading, same id. */
  observationId: string;
  /** Observation paths behind it, e.g. `line.heart.depth`. At least one. */
  featureIds: string[];
  ruleId: string;
  /** Tradition id, e.g. `western_classical`. Traditions are never merged. */
  traditionalSystem: string;
  traditionName: Bilingual;
  sourceRefs: BookCitation[];
  /** Placeholder until phase 3 ranking: the match confidence. */
  importance: number;
  confidence: number;
  visibility: Visibility;
  /** The weakest evidence behind it: an observation resting on one AI-described line is ai_described. */
  evidenceKind: EvidenceKind;
  /** Layer A: physical evidence only. */
  observed: Bilingual;
  /** Layer B: the palmistry class. */
  classification: Bilingual;
  /** Layer C: the tradition's reading, framed as traditional, from the rule's meaning only. */
  interpretation: Bilingual;
  /** False when `interpretation.hi` still carries unreviewed English meaning. */
  interpretationHiReviewed: boolean;
  /** LLM rewrites of selected facts (later phases). Null until then. */
  shortCopy: Bilingual | null;
  deepCopy: Bilingual | null;
  /** What SHOW ME highlights. Null when the observation is not about a line. */
  focus: ExperienceFocus | null;
  /** False when there is no traced geometry to show: the UI must not offer SHOW ME. */
  showable: boolean;
}

export type GapReason = 'not_analysed' | 'not_seen' | 'unclassified' | 'not_described';

export interface ExperienceGap {
  lineId: string;
  reason: GapReason;
  message: Bilingual;
}

export interface PalmExperience {
  version: typeof PALM_EXPERIENCE_VERSION;
  readingId: string;
  photo: { uri: string; aspect: number } | null;
  hand: {
    side: HandSide;
    /** The scanned hand's role (DEC-014); unknown and ambidextrous are real values, never "non-dominant". */
    dominance: Dominance;
    /** Scanner hand landmarks (21), when the scan ran and kept them. */
    landmarks: NormPoint[] | null;
    palmWidthNormalized: number | null;
  };
  quality: { passed: boolean; issues: QualityIssue[]; scanMetrics: Record<string, number | boolean> | null };
  lines: DetectedLine[];
  observations: ExperienceObservation[];
  gaps: ExperienceGap[];
  counts: { readable: number; traced: number; aiDescribed: number; lowConfidence: number };
  provenance: {
    /** 'absent': the reading predates the scanner or was made without it. */
    scanStatus: 'ok' | 'unavailable' | 'absent';
    scanReason: string | null;
    serviceVersion: string | null;
    modelVersion: string | null;
    ontologyVersion: string | null;
    extractor: { provider: string; model: string; version: string };
  };
}
