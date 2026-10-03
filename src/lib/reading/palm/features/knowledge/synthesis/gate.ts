// COPIED from palm-ai-new--feat-m1-foundation/src/features/knowledge/synthesis/gate.ts at app commit fbc2232d837f (2026-09-30).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import type { PalmObservation } from '../../observation/schema';
import type { TraitId } from '../traits';
import type { MatchedRule } from '../types';

import { GATE, RANK } from './constants';

/**
 * Evidence quality gate (plan §3.1, owner's addition 11b.1).
 *
 * A match is `firm` only when every trigger carries a firm band and the
 * effective confidence (the weakest trigger, damped where borderline) reaches
 * `GATE.firmMinEffective`. Anything else is `borderline`: an `unknown` band
 * (older readings, AI-described values, marks) counts like borderline and is
 * never assumed firm. A match with any trigger the camera could not settle
 * (below `GATE.uncertainDrop`) is dropped altogether.
 *
 * A `strong` rule is strong only on firm evidence; on borderline evidence it
 * is scored like a normal rule.
 */

export type EvidenceBand = 'firm' | 'borderline';

export interface GatedMatch {
  match: MatchedRule;
  band: EvidenceBand;
  /** The rule's `weight: 'strong'` honoured, i.e. strong AND firm. */
  strong: boolean;
  /** The weakest trigger's effective confidence: what `evidenceScore` uses. */
  effective: number;
  evidenceScore: number;
  /** This rule plus any duplicate merged into it (dedupe.ts); the first is the rule itself. */
  ruleIds: string[];
  traditions: string[];
}

const round4 = (n: number) => Math.round(n * 10000) / 10000;

/** effective x specificity weight x rule weight (plan §3.5). */
export function evidenceScore(match: MatchedRule, strong: boolean): number {
  const specW = Math.min(RANK.specCap, 1 + RANK.specStep * (match.rule.conditions.length - 1));
  const weightW = strong ? RANK.strongWeight : RANK.normalWeight;
  return round4(match.confidence * specW * weightW);
}

/**
 * The lines whose triggers only ever support (DEC-024): a `GATE.weakLines`
 * line read as faint, or traced below `GATE.weakLineMinConfidence`.
 */
export function weakLinesOf(obs: PalmObservation): Set<string> {
  const weak = new Set<string>();
  for (const line of obs.lines) {
    if (!(GATE.weakLines as readonly string[]).includes(line.type) || !line.visible) continue;
    if (line.depth.value === 'faint' || line.confidence < GATE.weakLineMinConfidence) weak.add(line.type);
  }
  return weak;
}

/** `line.fate.length` → `fate`; null for a path that is not on a line. */
function lineOfPath(path: string): string | null {
  const parts = path.split('.');
  return parts[0] === 'line' && parts[1] ? parts[1] : null;
}

export function gateMatch(match: MatchedRule, weakLines: ReadonlySet<string> = new Set()): GatedMatch | null {
  if (match.triggeredBy.length === 0) return null;
  if (match.triggeredBy.some((t) => t.confidence < GATE.uncertainDrop)) return null;
  const effective = Math.min(...match.triggeredBy.map((t) => t.confidence));
  const onWeakLine = match.triggeredBy.some((t) => {
    const line = lineOfPath(t.path);
    return line !== null && weakLines.has(line);
  });
  const allFirm = !onWeakLine && match.triggeredBy.every((t) => t.band === 'firm');
  const band: EvidenceBand = allFirm && effective >= GATE.firmMinEffective ? 'firm' : 'borderline';
  const strong = band === 'firm' && match.rule.weight === 'strong';
  return {
    match,
    band,
    strong,
    effective,
    evidenceScore: evidenceScore(match, strong),
    ruleIds: [match.rule.ruleId],
    traditions: [match.rule.tradition],
  };
}

/** Score desc, then rule id: the one order every later step relies on. */
export function byScore(a: GatedMatch, b: GatedMatch): number {
  return b.evidenceScore - a.evidenceScore || compareIds(a.match.rule.ruleId, b.match.rule.ruleId);
}

export function compareIds(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Every trait a rule speaks to, whatever the role. */
export function traitsOf(g: GatedMatch): TraitId[] {
  return (g.match.rule.traits ?? []).map((t) => t.id);
}

/**
 * The traits a rule may put into the Story and theme wording: `strength` and
 * `neutral`. A `watch` or `tension` role still clusters into its area and
 * takes part in conflicts, but never becomes a headline.
 */
export function storyTraitsOf(g: GatedMatch): TraitId[] {
  return (g.match.rule.traits ?? []).filter((t) => t.role === 'strength' || t.role === 'neutral').map((t) => t.id);
}

export const sortedUnique = (values: string[]): string[] => [...new Set(values)].sort(compareIds);
