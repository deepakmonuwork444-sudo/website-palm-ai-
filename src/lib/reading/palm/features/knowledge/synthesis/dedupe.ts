// COPIED from palm-ai-new--feat-m1-foundation/src/features/knowledge/synthesis/dedupe.ts at app commit 38389f51b74d (2026-09-26).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import { byScore, sortedUnique, traitsOf, type GatedMatch } from './gate';

/**
 * Two rules that read the same features and speak to the same traits are
 * corroboration, not two pieces of evidence (plan §3.2): the one with the
 * higher evidence score stays and the other's ids and traditions are merged
 * into it, so provenance keeps both.
 */

export function dedupeKey(g: GatedMatch): string {
  const paths = sortedUnique(g.match.triggeredBy.map((t) => t.path));
  const traits = sortedUnique(traitsOf(g));
  return `${paths.join(',')}#${traits.join(',')}`;
}

export function dedupe(gated: GatedMatch[]): GatedMatch[] {
  const kept = new Map<string, GatedMatch>();
  for (const g of [...gated].sort(byScore)) {
    const key = dedupeKey(g);
    const existing = kept.get(key);
    if (!existing) {
      kept.set(key, { ...g, ruleIds: [...g.ruleIds], traditions: [...g.traditions] });
      continue;
    }
    existing.ruleIds = [existing.ruleIds[0] as string, ...sortedUnique([...existing.ruleIds.slice(1), ...g.ruleIds])];
    existing.traditions = sortedUnique([...existing.traditions, ...g.traditions]);
  }
  return [...kept.values()].sort(byScore);
}
