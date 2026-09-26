// COPIED from palm-ai-new--feat-m1-foundation/src/features/knowledge/synthesis/index.ts at app commit 38389f51b74d (2026-09-26).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import type { ScanQuality } from '../../deep-report/types';
import { BANDS_VERSION } from '../../lines/bands';
import { legacyDominance } from '../../observation/dominance';
import type { PalmObservation } from '../../observation/schema';
import { visibilityFor } from '../../report-v2/build';
import type { EvidenceKind } from '../../report-v2/contract';
import { buildEvidence, type MatchOptions } from '../engine';
import { RULE_SET_VERSION } from '../rule-set-version';
import { AREAS, AREA_LABELS, type AreaId, type TraitId } from '../traits';
import type { KbRule, TriggeringObservation } from '../types';

import { clusterAreas, type AreaCluster } from './cluster';
import { resolveConflicts } from './conflicts';
import { SYNTHESIS_VERSION } from './constants';
import { dedupe } from './dedupe';
import { byScore, compareIds, gateMatch, sortedUnique, storyTraitsOf, weakLinesOf, type GatedMatch } from './gate';
import { buildReading } from './modules';
import { rankThemes, traitScores, type RankedTheme } from './rank';
import { buildStory, sentenceFor, type AltValueLookup, type HeldHeadline } from './story';
import { findTensions, sortTensions } from './tensions';
import {
  SYNTHESIS_SCHEMA_VERSION,
  type AreaSynthesis,
  type FeatureRef,
  type ScanQualityWord,
  type Synthesis,
  type Theme,
  type TraditionLabel,
} from './types';

/**
 * The deterministic synthesis pipeline (plan §3):
 *
 *   matchRules → gate → dedupe → conflicts → tensions → cluster → rank → story
 *
 * Pure: the same observation and rules always give the same Synthesis (the
 * only outside input is `generatedAt`). It throws on an internal error; the
 * reading pipeline catches and stores `synthesis: null`.
 */

export interface SynthesiseOptions {
  /** ISO time stamped on the result; the caller's clock, never read here. */
  generatedAt: string;
  /** The deep report's scan-quality block when it exists; else read from the observation. */
  scanQuality?: ScanQuality | null;
  matchOptions?: MatchOptions;
  /**
   * The frozen synthesis of the most recent earlier reading of the SAME person
   * and the SAME hand side, for cross-scan hysteresis (cluster.ts `canHold`):
   * an area open there is not closed by a borderline-only change. Ignored when
   * its side or any of its versions differ from this run's. It can never open
   * an area, and it is an input like any other: same observation, rules and
   * previous give the same Synthesis.
   */
  previous?: Synthesis | null;
}

const LINE_ATTRS: Record<string, 'length' | 'depth' | 'curvature' | 'continuity' | 'startZone' | 'endZone'> = {
  length: 'length',
  depth: 'depth',
  curvature: 'curvature',
  continuity: 'continuity',
  start_zone: 'startZone',
  end_zone: 'endZone',
};

/** The stored attribute behind a rule path, for its `altValue`. */
function attributeAt(obs: PalmObservation, path: string): { altValue?: unknown } | undefined {
  const [root, second, attr] = path.split('.');
  if (root === 'line') {
    const line = obs.lines.find((l) => l.type === second);
    if (!line || attr === undefined) return undefined;
    const key = LINE_ATTRS[attr];
    if (key) return line[key];
    return line.derived?.[attr];
  }
  if (root === 'mount' && attr === 'prominence') return obs.mounts.find((m) => m.type === second)?.prominence;
  if (root === 'hand' && second === 'shape') return obs.hand.shape;
  return undefined;
}

function altValueFor(obs: PalmObservation, path: string): string | null {
  const alt = attributeAt(obs, path)?.altValue;
  return typeof alt === 'string' ? alt : null;
}

function evidenceKindFor(obs: PalmObservation, path: string): EvidenceKind {
  const [root, second] = path.split('.');
  if (root !== 'line') return 'ai_described';
  const line = obs.lines.find((l) => l.type === second);
  return line?.source === 'line-service' ? 'traced' : 'ai_described';
}

function featureRef(obs: PalmObservation, t: TriggeringObservation, weakLines: ReadonlySet<string> = new Set()): FeatureRef {
  const [root, second] = t.path.split('.');
  const alt = t.band !== 'borderline' ? null : typeof t.altValue === 'string' ? t.altValue : altValueFor(obs, t.path);
  return {
    path: t.path,
    ...(root === 'line' && second ? { lineType: second } : {}),
    value: t.value,
    ...(alt !== null ? { altValue: alt } : {}),
    band: t.band,
    rawConfidence: t.rawConfidence,
    visibility: visibilityFor(t.rawConfidence, evidenceKindFor(obs, t.path)),
    ...(root === 'line' && second && weakLines.has(second) ? { weakLine: true as const } : {}),
  };
}

/**
 * One ref per path. Features that actually carried the claim come first: a weak
 * line only ever supported it (DEC-024), so it never heads the list of reasons.
 * Inside each group the order is the path, so it never depends on input order.
 */
function featureRefsFor(obs: PalmObservation, matches: GatedMatch[], weakLines: ReadonlySet<string> = new Set()): FeatureRef[] {
  const byPath = new Map<string, FeatureRef>();
  for (const g of matches) {
    for (const t of g.match.triggeredBy) if (!byPath.has(t.path)) byPath.set(t.path, featureRef(obs, t, weakLines));
  }
  return [...byPath.entries()]
    .sort(([a, refA], [b, refB]) => (refA.weakLine ? 1 : 0) - (refB.weakLine ? 1 : 0) || compareIds(a, b))
    .map(([, ref]) => ref);
}

function ruleIdsOf(matches: GatedMatch[]): string[] {
  return sortedUnique(matches.flatMap((g) => g.ruleIds));
}

export function scanQualityWord(quality: ScanQuality | null | undefined, obs: PalmObservation): ScanQualityWord {
  const status = quality ? quality.status : obs.lineScan?.status;
  if (status !== 'ok') return 'unavailable';
  const traced = quality
    ? quality.lines.filter((l) => l.result === 'traced').map((l) => l.pixelConfidence)
    : obs.lines.flatMap((l) =>
        l.source === 'line-service' && l.visible && l.evidence?.present && l.evidence.label === l.type
          ? [l.evidence.pixelConfidence]
          : [],
      );
  if (traced.length === 0) return 'partial';
  const mean = traced.reduce((sum, c) => sum + c, 0) / traced.length;
  return mean >= 0.75 ? 'excellent' : mean >= 0.5 ? 'good' : 'partial';
}

/** The traditions behind the visible themes, as one label (plan §3.9). */
export function traditionLabel(traditions: string[]): TraditionLabel {
  const indian = traditions.some((t) => /indian/i.test(t));
  const western = traditions.some((t) => /western/i.test(t));
  if (indian && western) return 'indian_western';
  if (indian) return 'indian';
  if (western) return 'western';
  return 'none';
}

/** A previous synthesis the hysteresis may use: same hand, same versions. */
function usablePrevious(previous: Synthesis | null | undefined, obs: PalmObservation): Synthesis | null {
  if (
    !previous ||
    previous.hand?.side !== obs.hand.side ||
    previous.synthesisVersion !== SYNTHESIS_VERSION ||
    previous.ruleSetVersion !== RULE_SET_VERSION ||
    previous.bandsVersion !== BANDS_VERSION
  ) {
    return null;
  }
  return previous;
}

/** The areas a usable previous synthesis had open; none when it is from another hand or another version. */
function previouslyOpenAreas(previous: Synthesis | null | undefined, obs: PalmObservation): Set<AreaId> {
  const usable = usablePrevious(previous, obs);
  return new Set(usable ? AREAS.filter((area) => usable.areas?.[area]?.state === 'open') : []);
}

/** The areas that were themes in a usable previous synthesis. */
function previousThemes(previous: Synthesis | null | undefined, obs: PalmObservation): Map<AreaId, number> {
  const usable = usablePrevious(previous, obs);
  return new Map(usable ? usable.themes.map((t) => [t.area, t.score] as const) : []);
}

/** The previous headline's traits when every one is still carried by a kept match of this reading (any band). */
function heldHeadline(previous: Synthesis | null | undefined, obs: PalmObservation, kept: GatedMatch[]): HeldHeadline | null {
  const story = usablePrevious(previous, obs)?.story;
  if (!story?.traits || story.traits.length === 0) return null;
  const present = new Set(kept.flatMap(storyTraitsOf));
  if (!story.traits.every((t) => present.has(t))) return null;
  return { traits: story.traits, score: story.score ?? 0 };
}

/** A theme sentence's basis: one of the theme's rules and a trait it carries. */
interface SentenceBasis {
  rule: GatedMatch;
  trait: TraitId;
}

/** Every (rule, trait) pair a theme could be told with, best first: trait order, then evidence. */
function sentenceOptions(r: RankedTheme): SentenceBasis[] {
  const pool = [...(r.heldOnBorderline ? r.cluster.borderline : r.cluster.firm)].sort(byScore);
  const options = r.traits.flatMap((trait) => pool.filter((g) => storyTraitsOf(g).includes(trait)).map((rule) => ({ rule, trait })));
  return options.length > 0 ? options : [{ rule: r.topRule, trait: r.traits[0] as TraitId }];
}

/**
 * The sentence basis of each theme, so that two themes never say the same
 * sentence (phone test 2026-09-19: "your nature" and "money" both read "joined
 * to the life line → you tend to think before you act"). Themes with the
 * fewest options choose first; each takes its best pair whose rule and trait
 * are still unused, else whose rule is unused, else its best pair.
 * Deterministic: ties keep the rank order.
 */
function themeSentenceBases(ranked: RankedTheme[]): SentenceBasis[] {
  const options = ranked.map(sentenceOptions);
  const order = ranked.map((_, i) => i).sort((x, y) => options[x]!.length - options[y]!.length || x - y);
  const usedRules = new Set<string>();
  const usedTraits = new Set<TraitId>();
  const chosen: SentenceBasis[] = [];
  for (const i of order) {
    const own = options[i]!;
    const pick =
      own.find((o) => !usedRules.has(o.rule.match.rule.ruleId) && !usedTraits.has(o.trait)) ??
      own.find((o) => !usedRules.has(o.rule.match.rule.ruleId)) ??
      own[0]!;
    usedRules.add(pick.rule.match.rule.ruleId);
    usedTraits.add(pick.trait);
    chosen[i] = pick;
  }
  return chosen;
}

function areaSynthesis(obs: PalmObservation, cluster: AreaCluster, weakLines: ReadonlySet<string>): AreaSynthesis {
  const kept = [...cluster.firm, ...cluster.borderline];
  const traits = new Set<TraitId>();
  for (const g of cluster.firm) for (const t of storyTraitsOf(g)) traits.add(t);
  return {
    area: cluster.area,
    state: cluster.open ? 'open' : 'insufficient',
    score: cluster.score,
    firmCount: cluster.firm.length,
    borderlineCount: cluster.borderline.length,
    ...(cluster.held ? { heldFromPrevious: true as const } : {}),
    traits: [...traits].sort(compareIds),
    ruleIds: ruleIdsOf([...kept, ...cluster.suppressed]),
    featureRefs: featureRefsFor(obs, kept, weakLines),
  };
}

export function synthesise(observation: PalmObservation, rules: KbRule[], options: SynthesiseOptions): Synthesis {
  const evidence = buildEvidence(observation, rules, options.matchOptions ?? {});
  const matches = evidence.sections
    .flatMap((s) => s.matches)
    .sort((a, b) => compareIds(a.rule.ruleId, b.rule.ruleId));

  const weakLines = weakLinesOf(observation);
  const gated = matches.flatMap((m) => {
    const g = gateMatch(m, weakLines);
    return g ? [g] : [];
  });
  const deduped = dedupe(gated);
  const conflicts = resolveConflicts(deduped);
  const kept = conflicts.kept;
  const tensions = sortTensions([...conflicts.tensions, ...findTensions(kept)]);
  const clusters = clusterAreas(kept, conflicts.suppressedMatches, previouslyOpenAreas(options.previous, observation));
  const scores = traitScores(kept);
  const ranked = rankThemes(clusters, scores, previousThemes(options.previous, observation));

  const lookup: AltValueLookup = (path) => altValueFor(observation, path);
  const bases = themeSentenceBases(ranked);
  const themes: Theme[] = ranked.map((r, index) => {
    const contributing = [...r.cluster.firm, ...r.cluster.borderline];
    const { rule: sentenceRule, trait: sentenceTrait } = bases[index]!;
    return {
      id: `theme:${r.area}`,
      area: r.area,
      headline: AREA_LABELS[r.area],
      line: sentenceFor(sentenceRule, sentenceTrait, lookup),
      score: r.cluster.score,
      traits: r.traits,
      ...(r.heldOnBorderline ? { heldFromPrevious: true as const } : {}),
      featureRefs: featureRefsFor(observation, contributing, weakLines),
      ruleIds: ruleIdsOf(contributing),
      traditions: sortedUnique(contributing.flatMap((g) => g.traditions)),
    };
  });

  const story = buildStory(
    themes.map((t) => t.line),
    scores,
    heldHeadline(options.previous, observation, kept),
  );
  const areas = Object.fromEntries(AREAS.map((area) => [area, areaSynthesis(observation, clusters[area], weakLines)])) as Record<
    AreaId,
    AreaSynthesis
  >;
  const all = [...kept, ...conflicts.suppressedMatches];
  const reading = buildReading({
    obs: observation,
    clusters,
    kept,
    scores,
    tensions,
    headlineTraits: story?.traits ?? [],
    refs: (matches) => featureRefsFor(observation, matches, weakLines),
    weakLines,
    previous: usablePrevious(options.previous, observation),
  });

  return {
    synthesisVersion: SYNTHESIS_VERSION,
    ruleSetVersion: RULE_SET_VERSION,
    bandsVersion: BANDS_VERSION,
    reportSchemaVersion: SYNTHESIS_SCHEMA_VERSION,
    generatedAt: options.generatedAt,
    hand: { side: observation.hand.side, dominance: legacyDominance(observation.hand) },
    scanQuality: scanQualityWord(options.scanQuality, observation),
    tradition: story ? traditionLabel(themes.flatMap((t) => t.traditions)) : 'none',
    story,
    themes,
    areas,
    tensions,
    suppressed: conflicts.suppressed,
    provenance: { ruleIds: ruleIdsOf(all), featureRefs: featureRefsFor(observation, all, weakLines) },
    overview: reading.overview,
    modules: reading.modules,
    recap: reading.recap,
  };
}

export { SYNTHESIS_VERSION } from './constants';
export type { Synthesis } from './types';
