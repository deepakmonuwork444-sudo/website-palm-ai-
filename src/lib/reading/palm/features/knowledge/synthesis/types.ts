// COPIED from palm-ai-new--feat-m1-foundation/src/features/knowledge/synthesis/types.ts at app commit fbc2232d837f (2026-09-30).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import type { Bilingual } from '../../../i18n';
import type { Dominance, StabilityBand } from '../../observation/schema';
import type { HandSide } from '../../observation/taxonomy';
import type { Visibility } from '../../report-v2/contract';
import type { PatternId } from '../trait-content';
import type { AreaId, TraitId } from '../traits';

/**
 * The deterministic synthesis of one reading (DEC-015, DEC-019): what the
 * report shows first, frozen on the outcome at completion and never
 * recomputed on open. Every visible sentence points back to the rules and
 * palm features that produced it.
 */

export const SYNTHESIS_SCHEMA_VERSION = 2 as const;

/** One palm feature that took part, as the user can be shown it. */
export interface FeatureRef {
  /** Rule condition path, e.g. `line.heart.length`. */
  path: string;
  /** The traced line the feature belongs to, when it is a line feature. */
  lineType?: string;
  /** The observed class or value, raw (humanised only at render time). */
  value: string | number | boolean | null;
  /** The neighbouring class when `band` is borderline. */
  altValue?: string | null;
  band: StabilityBand;
  /** The scanner's / model's own confidence, untouched. */
  rawConfidence: number;
  /** How clearly the camera saw it, in words (report-v2 `visibilityFor`). */
  visibility: Visibility;
  /**
   * The feature sits on a weak line (DEC-024): it supported this claim but
   * could never open the area or lead the section. Rendered as such, so a
   * light fate line is never shown as the reason a section is confident.
   */
  weakLine?: true;
}

export type AreaState = 'open' | 'insufficient';

export interface AreaSynthesis {
  area: AreaId;
  state: AreaState;
  /** The documented ranking score (0 when insufficient). */
  score: number;
  firmCount: number;
  borderlineCount: number;
  /**
   * Present (true) only when the firm evidence alone would not have opened the
   * area this time: it stayed open because it was open in the person's
   * previous reading of this hand and the evidence is still there, one part of
   * it now borderline (cross-scan hysteresis, `HYSTERESIS`).
   */
  heldFromPrevious?: true;
  traits: TraitId[];
  ruleIds: string[];
  featureRefs: FeatureRef[];
}

export interface Theme {
  id: string;
  area: AreaId;
  headline: Bilingual;
  /** One short sentence: feature phrase → trait phrase. */
  line: Bilingual;
  score: number;
  traits: TraitId[];
  /**
   * Present (true) only for a theme of the previous reading of this hand kept
   * although its story evidence is borderline this time (hysteresis): its
   * sentence rests on that borderline read, and the evidence says so.
   */
  heldFromPrevious?: true;
  featureRefs: FeatureRef[];
  ruleIds: string[];
  traditions: string[];
}

export interface Tension {
  a: TraitId;
  b: TraitId;
  ruleIds: string[];
}

export interface Suppressed {
  ruleId: string;
  trait: TraitId;
  reason: 'weaker_evidence' | 'tie' | 'tradition_disagreement' | 'borderline_only';
  /** The rule that won, when there is one. */
  by?: string;
}

export type ScanQualityWord = 'excellent' | 'good' | 'partial' | 'unavailable';
export type TraditionLabel = 'indian' | 'western' | 'indian_western' | 'none';

/** The report's life sections (Stage 2a). Career and money render together as "Career & Money". */
export const MODULE_IDS = ['love', 'career', 'money', 'personality', 'direction'] as const;
export type ModuleId = (typeof MODULE_IDS)[number];

/**
 * How much clear palm evidence stands behind a section: words about the
 * evidence, never a score about the person.
 */
export type ModuleState = 'strong' | 'supported' | 'limited' | 'insufficient';

export type ClaimKind =
  | 'overall'
  | 'story'
  | 'strength'
  | 'challenge'
  | 'primary'
  | 'showsUp'
  | 'need'
  | 'watch'
  | 'tension'
  | 'bestFit'
  | 'thinking'
  | 'reflection';

/**
 * One visible sentence of the reading, with what produced it. Every claim
 * rests on at least one rule and one palm feature (tested), so a tap on it can
 * light up the palm line it came from.
 */
export interface Claim {
  id: string;
  kind: ClaimKind;
  text: Bilingual;
  traitIds: TraitId[];
  ruleIds: string[];
  featureRefs: FeatureRef[];
}

export interface Module {
  id: ModuleId;
  area: AreaId;
  state: ModuleState;
  primary: Claim | null;
  showsUp?: Claim;
  strength?: Claim;
  /** Love only: what the person tends to seek. */
  need?: Claim;
  /** "Watch for" (a blind spot in Personality): the gentle other side of the leading tendency. */
  watch?: Claim;
  /** A tension between two tendencies, both on firm evidence. */
  tension?: Claim;
  /** Career: best-fit setting; Personality: thinking style; Direction: a reflection. */
  extra: Claim[];
  /**
   * One plain, factual line about the evidence: why the section is limited or
   * insufficient, or — when it is open but leans on a weak line — that the line
   * only supported it (DEC-024).
   */
  note?: Bilingual;
  /** A reflective question to close the section. Not a claim: it asserts nothing. */
  question?: Bilingual;
  /** Up to 3 rules behind the leading claim, for "What the books say". */
  basisRuleIds: string[];
  /** The leading trait and its score, so the next reading of this hand can hold it (DEC-023). */
  primaryTrait?: TraitId;
  primaryScore?: number;
  heldFromPrevious?: true;
}

export interface Overview {
  pattern: PatternId;
  patternLabel: Bilingual;
  /** The first line: which lines of this hand the reading was read from. */
  opening: Bilingual;
  sentence: Bilingual;
  story: Claim[];
  strongestModule: ModuleId | null;
  strength: Claim | null;
  challenge: Claim | null;
  /** A reflective question to close the glance. Not a claim: it asserts nothing. */
  question?: Bilingual;
}

export interface Recap {
  sentence: Bilingual;
  remember: { label: Bilingual; claimId: string | null }[];
}

export interface Synthesis {
  synthesisVersion: string;
  ruleSetVersion: string;
  bandsVersion: string;
  reportSchemaVersion: typeof SYNTHESIS_SCHEMA_VERSION;
  generatedAt: string;
  /** Set when built once from a reading saved before synthesis existed. */
  migratedFrom?: 'legacy-v1';
  hand: { side: HandSide; dominance: Dominance };
  scanQuality: ScanQualityWord;
  tradition: TraditionLabel;
  /** Null when no area opened: the UI says so plainly and shows the evidence layer. */
  story: {
    headline: Bilingual;
    sentences: Bilingual[];
    /** The one or two traits the headline names (absent on readings before SYNTHESIS_VERSION 6). */
    traits?: TraitId[];
    /** Their firm evidence score in this reading; the next reading's hold compares against it. */
    score?: number;
  } | null;
  /** Zero to three, never filler. */
  themes: Theme[];
  areas: Record<AreaId, AreaSynthesis>;
  tensions: Tension[];
  suppressed: Suppressed[];
  provenance: { ruleIds: string[]; featureRefs: FeatureRef[]; missingRuleIds?: string[] };
  /** Life at a Glance (SYNTHESIS_VERSION 7+). Absent on older readings, which keep the Story + theme layout. */
  overview?: Overview | null;
  /** Every life section, always present from version 7, each with its evidence state. */
  modules?: Record<ModuleId, Module>;
  recap?: Recap | null;
}
