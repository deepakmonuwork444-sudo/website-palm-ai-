// COPIED from palm-ai-new--feat-m1-foundation/src/features/knowledge/synthesis/conflicts.ts at app commit fbc2232d837f (2026-09-30).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import { TRAIT_RELATIONS, type TraitId } from '../traits';

import { byScore, compareIds, sortedUnique, traitsOf, type GatedMatch } from './gate';
import type { Suppressed, Tension } from './types';

/**
 * Conflict resolution (plan §3.3, owner's addition 11b.2).
 *
 * (a) Exclusive trait pairs (`TRAIT_RELATIONS`): the side with more firm
 *     evidence wins; every rule carrying the losing trait is suppressed with
 *     `weaker_evidence`. Equal firm evidence: both sides are suppressed with
 *     `tie` and the pair is recorded as a tension. A side with no firm
 *     evidence at all cannot win or tie.
 * (b) Cross-tradition conflict groups (`KbRule.conflictGroup`, more than one
 *     tradition present): resolved only among the group's own matches by
 *     their evidence score. One clear winner keeps its place and the rest are
 *     suppressed as `weaker_evidence`; a tie suppresses them all as
 *     `tradition_disagreement`. Overall tradition counts are never used.
 *
 * A suppressed rule keeps its place in provenance and in its areas' rule ids
 * but feeds no trait, theme or Story sentence.
 */

export interface ConflictResult {
  kept: GatedMatch[];
  /** The matches taken out, for area rule ids and provenance. */
  suppressedMatches: GatedMatch[];
  suppressed: Suppressed[];
  tensions: Tension[];
}

function firmSum(side: GatedMatch[]): number {
  return side.filter((g) => g.band === 'firm').reduce((sum, g) => sum + g.evidenceScore, 0);
}

function record(out: Suppressed[], g: GatedMatch, reason: Suppressed['reason'], trait: TraitId | null, by?: string) {
  const traits = trait ? [trait] : traitsOf(g);
  for (const ruleId of g.ruleIds) {
    for (const t of traits) out.push({ ruleId, trait: t, reason, ...(by ? { by } : {}) });
  }
}

export function resolveConflicts(matches: GatedMatch[]): ConflictResult {
  const live = new Set<GatedMatch>([...matches].sort(byScore));
  const suppressedMatches: GatedMatch[] = [];
  const suppressed: Suppressed[] = [];
  const tensions: Tension[] = [];

  const drop = (g: GatedMatch) => {
    live.delete(g);
    suppressedMatches.push(g);
  };
  const carrying = (trait: TraitId) => [...live].filter((g) => traitsOf(g).includes(trait));

  // (a) exclusive pairs, in the fixed order of the relation table.
  for (const { a, b, kind } of TRAIT_RELATIONS) {
    if (kind !== 'exclusive') continue;
    const sideA = carrying(a);
    const sideB = carrying(b);
    if (sideA.length === 0 || sideB.length === 0) continue;
    const sumA = firmSum(sideA);
    const sumB = firmSum(sideB);
    if (sumA === 0 && sumB === 0) continue;
    if (sumA === sumB) {
      const ruleIds = sortedUnique([...sideA, ...sideB].flatMap((g) => g.ruleIds));
      for (const g of sideA) {
        record(suppressed, g, 'tie', a);
        drop(g);
      }
      for (const g of sideB) {
        if (live.has(g)) {
          record(suppressed, g, 'tie', b);
          drop(g);
        }
      }
      tensions.push({ a, b, ruleIds });
      continue;
    }
    const [winners, losers, lostTrait] = sumA > sumB ? [sideA, sideB, b] : [sideB, sideA, a];
    const by = (winners.filter((g) => g.band === 'firm').sort(byScore)[0] as GatedMatch).match.rule.ruleId;
    for (const g of losers) {
      if (!live.has(g)) continue;
      record(suppressed, g, 'weaker_evidence', lostTrait, by);
      drop(g);
    }
  }

  // (b) cross-tradition conflict groups.
  const groups = new Map<string, GatedMatch[]>();
  for (const g of live) {
    const group = g.match.rule.conflictGroup;
    if (!group) continue;
    groups.set(group, [...(groups.get(group) ?? []), g]);
  }
  for (const [, members] of [...groups.entries()].sort(([a], [b]) => compareIds(a, b))) {
    if (new Set(members.map((g) => g.match.rule.tradition)).size < 2) continue;
    const ordered = [...members].sort(byScore);
    const best = ordered[0] as GatedMatch;
    const tied = ordered.filter((g) => g.evidenceScore === best.evidenceScore);
    if (tied.length > 1) {
      for (const g of ordered) {
        record(suppressed, g, 'tradition_disagreement', null);
        drop(g);
      }
      continue;
    }
    for (const g of ordered.slice(1)) {
      record(suppressed, g, 'weaker_evidence', null, best.match.rule.ruleId);
      drop(g);
    }
  }

  return {
    kept: [...live].sort(byScore),
    suppressedMatches: suppressedMatches.sort(byScore),
    suppressed: suppressed.sort((x, y) => compareIds(x.ruleId, y.ruleId) || compareIds(x.trait, y.trait)),
    tensions,
  };
}
