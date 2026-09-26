// COPIED from palm-ai-new--feat-m1-foundation/src/features/knowledge/synthesis/cluster.ts at app commit 38389f51b74d (2026-09-26).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import { AREAS, TRAIT_AREAS, type AreaId } from '../traits';

import { GATE, HYSTERESIS, RANK } from './constants';
import { byScore, traitsOf, type GatedMatch } from './gate';

/**
 * Cross-feature theme clustering and area gating (plan §3.5, §3.6).
 *
 * Every rule falls into the areas its traits map to (`TRAIT_AREAS`). An area
 * is open only on firm evidence: one firm `strong` match at or above
 * `GATE.strongOpenMinEffective`, or at least two firm matches that read
 * independent features (no trigger path in common). Borderline evidence never
 * opens or closes an area; once an area is open it adds a quarter of its
 * weight to the score.
 *
 * Cross-scan hysteresis: an area that was open in the person's previous
 * reading of the same hand stays open while `canHold` is true, so one feature
 * slipping from firm to borderline between two photos cannot remove a section.
 * It never opens an area that was not open before.
 */

export interface AreaCluster {
  area: AreaId;
  /** Kept firm matches, best first. */
  firm: GatedMatch[];
  /** Kept borderline matches, best first. */
  borderline: GatedMatch[];
  /** Matches conflict resolution took out of this area; provenance only. */
  suppressed: GatedMatch[];
  open: boolean;
  /** Open only because it was open in the previous reading and `canHold` still holds. */
  held: boolean;
  /** The documented area score; 0 when the area is not open. */
  score: number;
}

const round4 = (n: number) => Math.round(n * 10000) / 10000;

export function areasOf(g: GatedMatch): AreaId[] {
  const out = new Set<AreaId>();
  for (const trait of traitsOf(g)) for (const area of TRAIT_AREAS[trait]) out.add(area);
  return AREAS.filter((area) => out.has(area));
}

function pathsOf(g: GatedMatch): Set<string> {
  return new Set(g.match.triggeredBy.map((t) => t.path));
}

/**
 * How many of the matches read features none of the others read: greedy,
 * best first, so the answer never depends on input order.
 */
export function independentCount(matches: GatedMatch[]): number {
  const taken = new Set<string>();
  let count = 0;
  for (const g of [...matches].sort(byScore)) {
    const paths = pathsOf(g);
    if ([...paths].some((p) => taken.has(p))) continue;
    for (const p of paths) taken.add(p);
    count += 1;
  }
  return count;
}

export function isOpen(firm: GatedMatch[]): boolean {
  if (firm.some((g) => g.strong && g.effective >= GATE.strongOpenMinEffective)) return true;
  return independentCount(firm) >= 2;
}

/** Every trigger carries a measured band: firm or borderline, never `unknown`. */
function isBanded(g: GatedMatch): boolean {
  return g.match.triggeredBy.every((t) => t.band === 'firm' || t.band === 'borderline');
}

/**
 * Whether an area that was open before may stay open: it still has
 * `HYSTERESIS.minFirmToHold` firm matches, and beside one of them at least
 * `HYSTERESIS.minSupportToHold` further banded matches (firm or borderline,
 * never unknown) that read features neither that firm match nor each other
 * read. No firm match at all, or only unknown-band support: it closes.
 */
export function canHold(firm: GatedMatch[], borderline: GatedMatch[]): boolean {
  if (firm.length < HYSTERESIS.minFirmToHold || firm.length === 0) return false;
  const banded = [...firm, ...borderline].filter(isBanded);
  return firm.some((anchor) => {
    const anchorPaths = pathsOf(anchor);
    const support = banded.filter((g) => g !== anchor && ![...pathsOf(g)].some((p) => anchorPaths.has(p)));
    return independentCount(support) >= HYSTERESIS.minSupportToHold;
  });
}

export function clusterAreas(
  kept: GatedMatch[],
  suppressed: GatedMatch[],
  previouslyOpen: ReadonlySet<AreaId> = new Set(),
): Record<AreaId, AreaCluster> {
  const clusters = Object.fromEntries(
    AREAS.map((area): [AreaId, AreaCluster] => [
      area,
      { area, firm: [], borderline: [], suppressed: [], open: false, held: false, score: 0 },
    ]),
  ) as Record<AreaId, AreaCluster>;

  for (const g of [...kept].sort(byScore)) {
    for (const area of areasOf(g)) clusters[area][g.band].push(g);
  }
  for (const g of [...suppressed].sort(byScore)) {
    for (const area of areasOf(g)) clusters[area].suppressed.push(g);
  }
  for (const area of AREAS) {
    const cluster = clusters[area];
    cluster.open = isOpen(cluster.firm);
    if (!cluster.open && previouslyOpen.has(area) && canHold(cluster.firm, cluster.borderline)) {
      cluster.open = true;
      cluster.held = true;
    }
    if (!cluster.open) continue;
    const firmSum = cluster.firm.reduce((sum, g) => sum + g.evidenceScore, 0);
    const borderlineSum = cluster.borderline.reduce((sum, g) => sum + g.evidenceScore, 0);
    cluster.score = round4(firmSum + RANK.borderlineWeight * borderlineSum);
  }
  return clusters;
}
