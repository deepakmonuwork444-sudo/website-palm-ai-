// COPIED from palm-ai-new--feat-m1-foundation/src/features/knowledge/synthesis/rank.ts at app commit fbc2232d837f (2026-09-30).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import { TRAIT_AREAS, type AreaId, type TraitId } from '../traits';

import type { AreaCluster } from './cluster';
import { AREA_PRIORITY, HYSTERESIS, RANK } from './constants';
import { byScore, compareIds, storyTraitsOf, type GatedMatch } from './gate';

export { evidenceScore } from './gate';

/**
 * Ranking (plan §3.7, §3.8): trait scores from firm evidence only, and the
 * open areas ordered into at most `RANK.maxThemes` themes.
 */

/** Σ evidence score of the firm, kept rules carrying each story trait (`anyBand`: of every rule given). */
export function traitScores(kept: GatedMatch[], anyBand = false): Map<TraitId, number> {
  const scores = new Map<TraitId, number>();
  for (const g of kept) {
    if (!anyBand && g.band !== 'firm') continue;
    for (const trait of storyTraitsOf(g)) scores.set(trait, (scores.get(trait) ?? 0) + g.evidenceScore);
  }
  return scores;
}

/** Traits by score desc, then id; only traits with a score. */
export function rankTraits(scores: Map<TraitId, number>, among?: readonly TraitId[]): TraitId[] {
  return [...scores.entries()]
    .filter(([trait]) => !among || among.includes(trait))
    .sort(([a, sa], [b, sb]) => sb - sa || compareIds(a, b))
    .map(([trait]) => trait);
}

export interface RankedTheme {
  area: AreaId;
  cluster: AreaCluster;
  /** The firm match with the highest evidence score in the area. */
  topRule: GatedMatch;
  /** The area's traits, best first; the first one is the theme's trait. */
  traits: TraitId[];
  /** A previous theme kept on the borderline read of the evidence that was firm then (hysteresis). */
  heldOnBorderline?: true;
}

function areaTraits(area: AreaId, matches: GatedMatch[], scores: Map<TraitId, number>): TraitId[] {
  const present = new Set<TraitId>();
  for (const g of matches) for (const t of storyTraitsOf(g)) if (TRAIT_AREAS[t].includes(area)) present.add(t);
  return rankTraits(scores, [...present]);
}

/**
 * What a theme rests on: its firm evidence; for a previous theme whose firm
 * story evidence has turned borderline (the area itself still held open), that
 * borderline read, flagged. A borderline change alone never removes a theme.
 */
function themeBasis(area: AreaId, cluster: AreaCluster, scores: Map<TraitId, number>, held: boolean): Omit<RankedTheme, 'area' | 'cluster'> | null {
  const traits = areaTraits(area, cluster.firm, scores);
  const topRule = [...cluster.firm].sort(byScore)[0];
  if (topRule && traits.length > 0) return { topRule, traits };
  if (!held) return null;
  const pool = cluster.borderline;
  const heldTraits = areaTraits(area, pool, traitScores(pool, true));
  const heldTop = pool.filter((g) => storyTraitsOf(g).includes(heldTraits[0] as TraitId)).sort(byScore)[0];
  return heldTop && heldTraits.length > 0 ? { topRule: heldTop, traits: heldTraits, heldOnBorderline: true } : null;
}

export function rankThemes(
  clusters: Record<AreaId, AreaCluster>,
  scores: Map<TraitId, number>,
  /** Areas that were themes in the person's previous reading of this hand (usable previous only), with the score each had then. */
  previousThemes: ReadonlyMap<AreaId, number> = new Map(),
): RankedTheme[] {
  const candidates: RankedTheme[] = [];
  for (const area of AREA_PRIORITY) {
    const cluster = clusters[area];
    // A previous theme is measured against the floor by its defence score (below), like a takeover.
    if (!cluster.open || Math.max(cluster.score, previousThemes.get(area) ?? 0) < RANK.themeMin) continue;
    const basis = themeBasis(area, cluster, scores, previousThemes.has(area));
    if (basis) candidates.push({ area, cluster, ...basis });
  }
  const byRank = (x: RankedTheme, y: RankedTheme) =>
    y.cluster.score - x.cluster.score ||
    AREA_PRIORITY.indexOf(x.area) - AREA_PRIORITY.indexOf(y.area) ||
    compareIds(x.topRule.match.rule.ruleId, y.topRule.match.rule.ruleId);
  const ranked = [...candidates].sort(byRank);
  if (ranked.length <= RANK.maxThemes || previousThemes.size === 0) return ranked.slice(0, RANK.maxThemes);

  // Cross-scan hysteresis under the cap: previous themes keep their slots
  // while still open; a newcomer needs a materially higher score to take one.
  // A held theme defends with the higher of its score now and its score then:
  // a feature turning borderline lowers the score without being a real change
  // (retest 2026-09-19: career lost its slot to money on one borderline read).
  const held = ranked.filter((t) => previousThemes.has(t.area)).slice(0, RANK.maxThemes);
  const defence = (t: RankedTheme) => Math.max(t.cluster.score, previousThemes.get(t.area) ?? 0);
  const chosen = [...held];
  for (const candidate of ranked) {
    if (chosen.includes(candidate)) continue;
    if (chosen.length < RANK.maxThemes) {
      chosen.push(candidate);
      continue;
    }
    const weakest = [...chosen].sort(byRank)[chosen.length - 1]!;
    if (held.includes(weakest) && candidate.cluster.score >= defence(weakest) * HYSTERESIS.themeTakeoverRatio) {
      chosen[chosen.indexOf(weakest)] = candidate;
    }
  }
  return chosen.sort(byRank);
}
