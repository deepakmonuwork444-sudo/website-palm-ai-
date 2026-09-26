// COPIED from palm-ai-new--feat-m1-foundation/src/features/knowledge/synthesis/story.ts at app commit 38389f51b74d (2026-09-26).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import type { Bilingual } from '../../../i18n';
import { humanisePath, humaniseValue, renderShort, type BandHint, type Lang } from '../../reading/humanise';
import { TRAITS, type TraitId } from '../traits';

import { HYSTERESIS, STORY_HEADLINES, TRAIT_PHRASES, pairKey } from './constants';
import type { GatedMatch } from './gate';
import { rankTraits } from './rank';

/**
 * The Palm Story (plan §3.8): a headline from the two strongest traits and
 * one sentence per theme, each composed from a rule's evidence phrase and a
 * trait phrase. Never a single rule's long text, never free prose.
 */

const ARROW = ' → ';

/** Looks up the stored neighbour class of a borderline trigger (index.ts supplies it). */
export type AltValueLookup = (path: string) => string | null | undefined;

function evidencePhrase(g: GatedMatch, lang: Lang, altValueFor: AltValueLookup): string {
  const template = lang === 'en' ? g.match.rule.short : g.match.rule.shortHi;
  const resolve = (path: string) => {
    const trigger = g.match.triggeredBy.find((t) => t.path === path);
    if (!trigger) return null;
    const hint: BandHint = { band: trigger.band, altValue: trigger.altValue ?? altValueFor(path) };
    return humaniseValue(path, trigger.value, hint, lang);
  };
  const rendered = template ? renderShort(template, resolve) : null;
  if (rendered) return rendered;
  // No short line, or a placeholder the triggers cannot fill: name each feature and its value.
  return g.match.triggeredBy
    .map((t) => `${humanisePath(t.path, lang)}: ${humaniseValue(t.path, t.value, { band: t.band, altValue: altValueFor(t.path) }, lang)}`)
    .join(', ');
}

/** "{feature phrase} → {trait phrase}" in both languages. */
export function sentenceFor(g: GatedMatch, trait: TraitId, altValueFor: AltValueLookup): Bilingual {
  const phrase = TRAIT_PHRASES[trait];
  return {
    en: `${evidencePhrase(g, 'en', altValueFor)}${ARROW}${phrase.en}`,
    hi: `${evidencePhrase(g, 'hi', altValueFor)}${ARROW}${phrase.hi}`,
  };
}

export function storyHeadline(top: TraitId[]): Bilingual | null {
  const [a, b] = top;
  if (!a) return null;
  if (!b) return TRAITS[a].label;
  const curated = STORY_HEADLINES[pairKey(a, b)];
  if (curated) return curated;
  return { en: `${TRAITS[a].label.en} · ${TRAITS[b].label.en}`, hi: `${TRAITS[a].label.hi} · ${TRAITS[b].label.hi}` };
}

/** The previous reading's headline traits, still carried by this reading's evidence (index.ts). */
export interface HeldHeadline {
  traits: TraitId[];
  score: number;
}

const sumOf = (traits: TraitId[], scores: Map<TraitId, number>) => traits.reduce((sum, t) => sum + (scores.get(t) ?? 0), 0);

/**
 * Null when there is no theme to tell: the UI says so and shows the evidence layer.
 *
 * Headline hysteresis (DEC-023): the previous reading's headline traits stay
 * while their evidence is still there (any band), unless the new top pair
 * scores at least `themeTakeoverRatio` x their defence (max of score now /
 * then). A borderline change alone never renames the Palm Story.
 */
export function buildStory(
  sentences: Bilingual[],
  scores: Map<TraitId, number>,
  held: HeldHeadline | null = null,
): { headline: Bilingual; sentences: Bilingual[]; traits: TraitId[]; score: number } | null {
  if (sentences.length === 0) return null;
  const top = rankTraits(scores).slice(0, 2);
  let traits = top;
  if (held && held.traits.length > 0 && held.traits.join('|') !== top.join('|')) {
    const defence = Math.max(sumOf(held.traits, scores), held.score);
    if (sumOf(top, scores) < defence * HYSTERESIS.themeTakeoverRatio) traits = held.traits;
  }
  const headline = storyHeadline(traits);
  if (!headline) return null;
  const unique = sentences.filter((s, i) => sentences.findIndex((o) => o.en === s.en) === i);
  return { headline, sentences: unique, traits, score: Math.round(sumOf(traits, scores) * 1000) / 1000 };
}
