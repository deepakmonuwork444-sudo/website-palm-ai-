// COPIED from palm-ai-new--feat-m1-foundation/src/features/knowledge/engine.ts at app commit fbc2232d837f (2026-09-30).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import { legacyDominance } from '../observation/dominance';
import { bandOf, type PalmObservation, type Region, type StabilityBand } from '../observation/schema';
import { isReliableMark, type MarkKind } from '../observation/taxonomy';

import type {
  ConditionValue,
  EvidenceSection,
  KbRule,
  MatchedRule,
  ReadingEvidence,
  RuleCondition,
  TriggeringObservation,
} from './types';
import { RULE_CATEGORIES } from './types';

type Scalar = string | number | boolean | null;

interface Resolved {
  value: Scalar;
  /** What matching compares with a rule's floor: the raw confidence, damped when borderline (lines/bands.ts). */
  confidence: number;
  /** The confidence as observed, never damped. */
  rawConfidence: number;
  /** `unknown` for anything without a band field: older readings, AI-described values, marks. */
  band: StabilityBand;
  /** The neighbouring class when `band` is borderline. */
  altValue?: Scalar;
  regions: Region[];
}

interface ObservedField {
  value: Scalar;
  confidence: number;
  band?: string;
  altValue?: Scalar;
  effectiveConfidence?: number;
}

/** An observed attribute, capped by its line's / mount's own confidence. */
function fromObserved(field: ObservedField, ceiling: number, regions: Region[]): Resolved {
  return {
    value: field.value,
    confidence: Math.min(field.effectiveConfidence ?? field.confidence, ceiling),
    rawConfidence: Math.min(field.confidence, ceiling),
    band: bandOf(field),
    ...(field.band === 'borderline' && field.altValue !== undefined ? { altValue: field.altValue } : {}),
    regions,
  };
}

const LINE_ATTRS = {
  length: 'length',
  depth: 'depth',
  curvature: 'curvature',
  continuity: 'continuity',
  start_zone: 'startZone',
  end_zone: 'endZone',
} as const;

type LineAttrKey = keyof typeof LINE_ATTRS;

function isLineAttr(key: string): key is LineAttrKey {
  return Object.prototype.hasOwnProperty.call(LINE_ATTRS, key);
}

/**
 * Reads a dotted path out of an observation.
 *
 * Returns undefined when the path names something the observation does not
 * contain at all. Returns a Resolved with value null when the feature was
 * looked for and could not be seen. Those are different failures.
 */
export function resolvePath(obs: PalmObservation, path: string): Resolved | undefined {
  const parts = path.split('.');
  const root = parts[0];

  if (root === 'hand') {
    const key = parts[1];
    if (key === 'shape') return fromObserved(obs.hand.shape, 1, []);
    // Declared by the person, not measured: firm.
    if (key === 'side') return { value: obs.hand.side, confidence: 1, rawConfidence: 1, band: 'firm', regions: [] };
    if (key === 'is_dominant') {
      // DEC-014: `isDominant` is a compatibility boolean (false for "both" and
      // "not sure"). Read the role instead; an unknown role settles nothing.
      const role = legacyDominance(obs.hand);
      if (role === 'dominant' || role === 'non_dominant') {
        return { value: role === 'dominant', confidence: 1, rawConfidence: 1, band: 'firm', regions: [] };
      }
      return { value: null, confidence: 1, rawConfidence: 1, band: 'unknown', regions: [] };
    }
    return undefined;
  }

  if (root === 'mount') {
    const mount = obs.mounts.find((m) => m.type === parts[1]);
    if (!mount || parts[2] !== 'prominence') return undefined;
    return fromObserved(mount.prominence, mount.confidence, mount.region ? [mount.region] : []);
  }

  if (root === 'line') {
    const line = obs.lines.find((l) => l.type === parts[1]);
    // A line outside the scan's scope settles nothing, not even its absence.
    if (!line || line.notAnalysed) return undefined;
    const attr = parts[2];
    if (attr === undefined) return undefined;

    if (attr === 'visible') {
      // A traced line's presence passed the scanner's own checks: firm. A model's word: unknown.
      const band: StabilityBand = line.source === 'line-service' ? 'firm' : 'unknown';
      return { value: line.visible, confidence: line.confidence, rawConfidence: line.confidence, band, regions: line.regions };
    }

    // A line nobody could see settles nothing about its attributes.
    if (!line.visible) {
      return { value: null, confidence: line.confidence, rawConfidence: line.confidence, band: 'unknown', regions: line.regions };
    }

    if (attr === 'marks') {
      const kind = parts[3];
      if (kind === undefined) return undefined;
      const marks = line.marks.filter((m) => m.kind === kind);
      const count = marks.reduce((sum, m) => sum + m.count, 0);
      const markConfidence = marks.length
        ? Math.min(...marks.map((m) => m.confidence))
        : line.confidence;
      const confidence = Math.min(markConfidence, line.confidence);
      return {
        value: count,
        confidence,
        rawConfidence: confidence,
        band: 'unknown',
        regions: marks.flatMap((m) => (m.region ? [m.region] : line.regions)),
      };
    }

    if (isLineAttr(attr)) return fromObserved(line[LINE_ATTRS[attr]], line.confidence, line.regions);
    // App-derived geometry (lines/derived.ts), e.g. line.head.life_join.
    const derived = line.derived?.[attr];
    if (derived) return fromObserved(derived, line.confidence, line.regions);
    return undefined;
  }

  return undefined;
}

function compare(
  value: Scalar,
  operator: RuleCondition['operator'],
  expected: ConditionValue,
): boolean {
  if (operator === 'exists') return value !== null;
  if (value === null) return false;

  switch (operator) {
    case 'eq':
      return value === expected;
    case 'neq':
      return value !== expected;
    case 'in':
      return Array.isArray(expected) && expected.includes(String(value));
    case 'gte':
    case 'lte':
    case 'gt':
    case 'lt': {
      if (typeof value !== 'number' || typeof expected !== 'number') return false;
      if (operator === 'gte') return value >= expected;
      if (operator === 'lte') return value <= expected;
      if (operator === 'gt') return value > expected;
      return value < expected;
    }
    default:
      return false;
  }
}

/** A rule touching a mark we cannot yet detect reliably must not fire. */
function usesFragileMark(rule: KbRule): boolean {
  return rule.conditions.some((c) => {
    const parts = c.path.split('.');
    if (parts[0] !== 'line' || parts[2] !== 'marks') return false;
    const kind = parts[3];
    return kind !== undefined && !isReliableMark(kind as MarkKind);
  });
}

export interface MatchOptions {
  /** Off for MVP. Turn on only when a benchmark earns it. */
  allowFragileMarks?: boolean;
  /**
   * Seed rules are written from widely-attested classical palmistry but their
   * source locators are not yet verified against the real corpus. Off by
   * default. When on, the report must say the knowledge base is provisional.
   * A `disputed` rule — one a reviewer found the book does not support —
   * never fires, whatever this says.
   */
  includeDraftRules?: boolean;
  /** Rules below this are never shown, whatever the observation says. */
  minRuleConfidence?: number;
}

export function matchRules(
  obs: PalmObservation,
  rules: KbRule[],
  options: MatchOptions = {},
): MatchedRule[] {
  const allowFragile = options.allowFragileMarks ?? false;
  const floor = options.minRuleConfidence ?? 0;
  const matched: MatchedRule[] = [];

  for (const rule of rules) {
    if (rule.validationStatus === 'disputed') continue;
    if (rule.validationStatus === 'draft' && !(options.includeDraftRules ?? false)) continue;
    if (!allowFragile && usesFragileMark(rule)) continue;

    const triggeredBy: TriggeringObservation[] = [];
    const regions: Region[] = [];
    let ok = true;

    for (const condition of rule.conditions) {
      const resolved = resolvePath(obs, condition.path);
      // Whether a rule FIRES is decided on the raw confidence: a borderline value
      // still shows in the full reading (worded as borderline). The damped
      // effective confidence only scores and ranks it, and the synthesis gate
      // keeps it out of the Palm Story. Deciding the floor on the damped value
      // made a rule appear or vanish on 0.95 vs 1.0 pixel confidence.
      if (!resolved || resolved.rawConfidence < rule.minConfidence) {
        ok = false;
        break;
      }
      if (!compare(resolved.value, condition.operator, condition.value)) {
        ok = false;
        break;
      }
      triggeredBy.push({
        path: condition.path,
        value: resolved.value,
        confidence: resolved.confidence,
        rawConfidence: resolved.rawConfidence,
        band: resolved.band,
        ...(resolved.altValue !== undefined ? { altValue: resolved.altValue } : {}),
      });
      regions.push(...resolved.regions);
    }

    if (!ok || triggeredBy.length === 0) continue;

    const confidence = Math.min(...triggeredBy.map((t) => t.confidence));
    if (Math.min(...triggeredBy.map((t) => t.rawConfidence)) < floor) continue;

    matched.push({ rule, triggeredBy, confidence, regions });
  }

  // Most specific first, then most confident. Deterministic tie-break by id so
  // the same observation always produces the same report. Plain code-unit order,
  // not localeCompare: that depends on the device's locale / ICU data.
  return matched.sort(
    (a, b) =>
      b.rule.specificity - a.rule.specificity ||
      b.confidence - a.confidence ||
      compareRuleIds(a.rule.ruleId, b.rule.ruleId),
  );
}

/** Code-unit order of two ids, the same on every device (as `compareIds` in synthesis/gate.ts). */
function compareRuleIds(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Paths the photo was too poor to settle. Drives honest retake advice.
 *
 * Only confidence matters here. A line confidently observed as NOT visible is
 * a settled fact, not an uncertainty — treating it as both let a report say
 * "an absent fate line means independence" and "we could not see the fate
 * line" in the same breath.
 */
function findLowConfidencePaths(obs: PalmObservation, threshold: number): string[] {
  const paths: string[] = [];
  for (const line of obs.lines) {
    // Not analysed is a scope limit, not a photo problem; retaking would not help.
    if (line.notAnalysed) continue;
    if (line.confidence < threshold) paths.push(`line.${line.type}`);
  }
  for (const mount of obs.mounts) {
    if (mount.confidence < threshold) paths.push(`mount.${mount.type}`);
  }
  return paths;
}

export function buildEvidence(
  obs: PalmObservation,
  rules: KbRule[],
  options: MatchOptions = {},
): ReadingEvidence {
  const matches = matchRules(obs, rules, options);

  const sections: EvidenceSection[] = [];
  for (const category of RULE_CATEGORIES) {
    const inCategory = matches.filter((m) => m.rule.interpretation.category === category);
    if (inCategory.length === 0) continue;

    const groups = new Map<string, MatchedRule[]>();
    for (const match of inCategory) {
      const group = match.rule.conflictGroup;
      if (!group) continue;
      const existing = groups.get(group) ?? [];
      existing.push(match);
      groups.set(group, existing);
    }

    // A conflict only exists when different traditions disagree. Two sources
    // in one tradition saying the same thing is corroboration, not conflict.
    const conflicts = [...groups.entries()]
      .filter(([, group]) => new Set(group.map((m) => m.rule.tradition)).size > 1)
      .map(([conflictGroup, group]) => ({ conflictGroup, matches: group }));

    sections.push({ category, matches: inCategory, conflicts });
  }

  const matchedPaths = new Set(matches.flatMap((m) => m.triggeredBy.map((t) => t.path)));
  const unmatchedObservations: TriggeringObservation[] = [];
  for (const line of obs.lines) {
    if (!line.visible) continue;
    const path = `line.${line.type}.depth`;
    if (matchedPaths.has(path)) continue;
    const resolved = resolvePath(obs, path);
    if (resolved && resolved.value !== null && resolved.confidence >= 0.6) {
      unmatchedObservations.push({
        path,
        value: resolved.value,
        confidence: resolved.confidence,
        rawConfidence: resolved.rawConfidence,
        band: resolved.band,
      });
    }
  }

  return {
    sections,
    unmatchedObservations,
    lowConfidencePaths: findLowConfidencePaths(obs, 0.5),
    totalMatches: matches.length,
  };
}
