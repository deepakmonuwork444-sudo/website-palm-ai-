// COPIED from palm-ai-new--feat-m1-foundation/src/features/knowledge/synthesis/tensions.ts at app commit 38389f51b74d (2026-09-26).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import { TRAIT_RELATIONS } from '../traits';

import { compareIds, sortedUnique, traitsOf, type GatedMatch } from './gate';
import type { Tension } from './types';

/**
 * Contextual tensions (plan §3.4): a `tension` pair read from the same palm
 * on firm evidence is named, and both traits stay. Borderline evidence names
 * nothing: it can only nudge a score.
 */
export function findTensions(kept: GatedMatch[]): Tension[] {
  const firm = kept.filter((g) => g.band === 'firm');
  const out: Tension[] = [];
  for (const { a, b, kind } of TRAIT_RELATIONS) {
    if (kind !== 'tension') continue;
    const withA = firm.filter((g) => traitsOf(g).includes(a));
    const withB = firm.filter((g) => traitsOf(g).includes(b));
    if (withA.length === 0 || withB.length === 0) continue;
    out.push({ a, b, ruleIds: sortedUnique([...withA, ...withB].flatMap((g) => g.ruleIds)) });
  }
  return out;
}

export function sortTensions(tensions: Tension[]): Tension[] {
  return [...tensions].sort((x, y) => compareIds(x.a, y.a) || compareIds(x.b, y.b));
}
