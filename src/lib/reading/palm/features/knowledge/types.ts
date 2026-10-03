// COPIED from palm-ai-new--feat-m1-foundation/src/features/knowledge/types.ts at app commit fbc2232d837f (2026-09-30).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import type { Region, StabilityBand } from '../observation/schema';
import type { TraitId } from './traits';

/** Where an interpretation came from. Never lost, never merged away. */
export interface KbSource {
  sourceId: string;
  title: string;
  tradition: string;
  /** Book + page, chapter, or an equivalent precise locator. */
  locator: string;
  /**
   * Rights status decides whether wording may be reproduced.
   * `unknown` and `licensed` sources inform rules; only our own normalised
   * phrasing ever reaches a report.
   */
  rights: 'public_domain' | 'licensed' | 'user_authored' | 'unknown';
  language: string;
  /** Short author name for display ("Cheiro"). Corpus books only. */
  author?: string;
  /** First published. Corpus books only. */
  year?: number;
}

export const RULE_CATEGORIES = [
  'temperament',
  'emotional_life',
  'thinking_style',
  'vitality',
  'work_and_direction',
  'money_and_effort',
  'relationships',
  'communication',
] as const;
export type RuleCategory = (typeof RULE_CATEGORIES)[number];

export const CONDITION_OPERATORS = [
  'eq',
  'neq',
  'in',
  'gte',
  'lte',
  'gt',
  'lt',
  'exists',
] as const;
export type ConditionOperator = (typeof CONDITION_OPERATORS)[number];

export type ConditionValue = string | number | boolean | readonly string[];

export interface RuleCondition {
  /**
   * Dotted path into a PalmObservation. Supported forms:
   *   line.<lineType>.visible | length | depth | curvature | continuity
   *   line.<lineType>.start_zone | end_zone
   *   line.<lineType>.marks.<markKind>     -> integer count
   *   line.head.life_join                  -> joined | separate | wide (lines/derived.ts)
   *   mount.<mountType>.prominence
   *   hand.shape | hand.side | hand.is_dominant
   */
  path: string;
  operator: ConditionOperator;
  value: ConditionValue;
}

export interface Interpretation {
  category: RuleCategory;
  /** Our own normalised wording. Never a quote from an unknown-rights source. */
  meaning: string;
  /** Shown to the user when the tradition itself hedges. */
  caveat: string | null;
  /**
   * Draft Hindi of `meaning`: the same claim and the same hedging, nothing
   * added. Shown only once a person has checked it (see `KbRule.hindiReviewed`).
   */
  meaningHi?: string;
  /** Draft Hindi of `caveat`, under the same rule. */
  caveatHi?: string | null;
  /**
   * Where the caveat is shown. `provenance`: only in Sources / the evidence
   * layer, never on the reading itself (a refusal of health, fertility or
   * lifespan claims; BUG-016). The reading carries one standard health line in
   * its About note instead. Absent = `consumer` (shown with the reading).
   */
  caveatScope?: 'consumer' | 'provenance';
}

/** The precise place in one book that a rule was taken from. */
export interface RuleCitation {
  sourceId: string;
  /** Part, chapter, section or page — enough for a person to find the passage. */
  locator: string;
}

/**
 * How one rule's evidence speaks to a trait (vocabulary in `traits.ts`).
 * The role describes how THIS rule's evidence participates in the trait —
 * `strength` supports it, `watch` is a caution the books attach, `neutral`
 * is a plain pattern, `tension` pulls against it. A "negative" word in the
 * meaning is never automatically a weakness.
 */
export interface RuleTrait {
  id: TraitId;
  role: 'strength' | 'watch' | 'neutral' | 'tension';
}

export interface KbRule {
  ruleId: string;
  tradition: string;
  conditions: RuleCondition[];
  /** Every contributing observation must meet this, or the rule cannot fire. */
  minConfidence: number;
  interpretation: Interpretation;
  sourceIds: string[];
  /**
   * Per-book locators for rules extracted from the corpus. Seed rules predate
   * the corpus and have none, which is exactly why they are superseded.
   */
  citations?: RuleCitation[];
  /** More conditions = more specific = wins ordering against a general rule. */
  specificity: number;
  /**
   * Rules in the same conflict group make competing claims about the same
   * feature. They are all reported, side by side, and never silently merged.
   */
  conflictGroup: string | null;
  /**
   * `draft` until a person checks the rule against the book. `disputed` means
   * the book was found not to say it: such a rule never fires.
   */
  validationStatus: 'draft' | 'human_reviewed' | 'disputed';
  /**
   * True once a person has checked that the Hindi says exactly what the
   * English says. Hindi reaches a report only for a `human_reviewed` rule with
   * this set. Absent means false.
   */
  hindiReviewed?: boolean;
  /** Traits this rule's evidence speaks to, each with its role. Additive; synthesis reads it. */
  traits?: RuleTrait[];
  /** `strong` only for a rule that alone names a whole life-area pattern. Absent means `normal`. */
  weight?: 'strong' | 'normal';
  /**
   * Evidence-level phrase (≤14 words) saying what was seen, with one
   * `{path}` placeholder per condition path, e.g. "{line.heart.length} heart
   * line". The humaniser fills them, band-aware. Never a meaning.
   */
  short?: string;
  /** Draft Hindi of `short`, same placeholders. Listed in `review/short-lines.html` (DEC-018). */
  shortHi?: string;
}

/** What actually made a rule fire. This is the audit trail. */
export interface TriggeringObservation {
  path: string;
  value: string | number | boolean | null;
  /** What matching used: the raw confidence, damped for borderline evidence (lines/bands.ts). */
  confidence: number;
  /** The scanner / model confidence as observed, never damped. */
  rawConfidence: number;
  /** Stability band of the observation; `unknown` when it carries none (never assumed firm). */
  band: StabilityBand;
  /** The neighbouring class when `band` is borderline, so evidence text can say "medium-to-long". */
  altValue?: string | number | boolean | null;
}

export interface MatchedRule {
  rule: KbRule;
  triggeredBy: TriggeringObservation[];
  /** The weakest link: a match is only as good as its least certain input. */
  confidence: number;
  regions: Region[];
}

export interface EvidenceSection {
  category: RuleCategory;
  matches: MatchedRule[];
  /** Populated when a conflict group has more than one live interpretation. */
  conflicts: { conflictGroup: string; matches: MatchedRule[] }[];
}

export interface ReadingEvidence {
  sections: EvidenceSection[];
  /** Features we saw clearly but have no validated rule for. Honest gap. */
  unmatchedObservations: TriggeringObservation[];
  /** Features the photo could not settle. Drives "what to retake" advice. */
  lowConfidencePaths: string[];
  totalMatches: number;
}
