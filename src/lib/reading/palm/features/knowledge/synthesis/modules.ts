// COPIED from palm-ai-new--feat-m1-foundation/src/features/knowledge/synthesis/modules.ts at app commit 38389f51b74d (2026-09-26).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import type { Bilingual } from '../../../i18n';
import type { PalmObservation } from '../../observation/schema';
import {
  COMBINATION_COPY,
  FAMILY_PATTERNS,
  PATTERN_LABELS,
  SPECIAL_PATTERN_COPY,
  TENSION_COPY,
  TRAIT_CONTENT,
  type PatternId,
  type TraitContent,
} from '../trait-content';
import { TRAITS, TRAIT_AREAS, type AreaId, type TraitId } from '../traits';

import { independentCount, type AreaCluster } from './cluster';
import { HYSTERESIS, pairKey } from './constants';
import { byScore, sortedUnique, storyTraitsOf, traitsOf, type GatedMatch } from './gate';
import { rankTraits, traitScores } from './rank';
import type { Claim, ClaimKind, FeatureRef, Module, ModuleId, ModuleState, Overview, Recap, Synthesis, Tension } from './types';

/**
 * The finished reading (Stage 2a, DEC-025): Life at a Glance, one section per
 * life area, and a closing recap, composed deterministically from the same
 * gated evidence as the Palm Story.
 *
 * - Every sentence is a `Claim` carrying its traits, rules and palm features;
 *   a claim with no rule behind it is never made.
 * - Sentences come from the curated trait content (trait-content.ts), chosen by
 *   the section's own area: love uses how a trait shows in relationships,
 *   money only a trait with a money expression (the money gate), and so on.
 * - No sentence appears twice on a report: a later section skips a sentence an
 *   earlier one used, rather than repeating it or adding filler.
 * - The overall pattern is read from the Palm Story's headline traits, which
 *   are held across rescans of the same hand (DEC-023); each section's leading
 *   trait is held the same way.
 * - A section without enough clear evidence says so, with a factual reason.
 */

/** A synthesis with the finished reading (SYNTHESIS_VERSION 7+); older ones keep the Story + theme layout. */
export type FinishedSynthesis = Synthesis & { overview: Overview; modules: Record<ModuleId, Module> };

export function hasFinishedReading(s: Synthesis | null | undefined): s is FinishedSynthesis {
  return Boolean(s?.overview && s.modules);
}

export const MODULE_AREA: Record<ModuleId, AreaId> = {
  love: 'love',
  career: 'career',
  money: 'money',
  personality: 'self',
  direction: 'direction',
};

export const MODULE_LABELS: Record<ModuleId, Bilingual> = {
  love: { en: 'Love & Relationships', hi: 'प्यार और रिश्ते' },
  career: { en: 'Career', hi: 'करियर' },
  money: { en: 'Money', hi: 'पैसा' },
  personality: { en: 'Personality & Inner Patterns', hi: 'व्यक्तित्व और भीतरी स्वभाव' },
  direction: { en: 'Life Direction & Challenges', hi: 'जीवन की दिशा और चुनौतियाँ' },
};

/** The section's subject inside a sentence. */
const MODULE_SUBJECT: Record<ModuleId, Bilingual> = {
  love: { en: 'relationship', hi: 'रिश्तों के बारे में' },
  career: { en: 'career', hi: 'करियर के बारे में' },
  money: { en: 'money', hi: 'पैसे के बारे में' },
  personality: { en: 'personality', hi: 'व्यक्तित्व के बारे में' },
  direction: { en: 'life-direction', hi: 'जीवन की दिशा के बारे में' },
};

/**
 * The same topic in the oblique case, for "… के बारे में". Hindi needs it:
 * "आपके व्यक्तित्व के बारे में", never "आपका व्यक्तित्व के बारे में".
 */
const MODULE_ABOUT: Record<ModuleId, Bilingual> = {
  love: { en: 'love and relationships', hi: 'प्यार और रिश्तों' },
  career: { en: 'career', hi: 'करियर' },
  money: { en: 'money', hi: 'पैसे' },
  personality: { en: 'your personality', hi: 'आपके व्यक्तित्व' },
  direction: { en: 'your life direction', hi: 'आपकी ज़िंदगी की दिशा' },
};

const MODULE_TOPIC: Record<ModuleId, Bilingual> = {
  love: { en: 'love and relationships', hi: 'प्यार और रिश्ते' },
  career: { en: 'career', hi: 'करियर' },
  money: { en: 'money', hi: 'पैसा' },
  personality: { en: 'your personality', hi: 'आपका व्यक्तित्व' },
  direction: { en: 'your life direction', hi: 'आपकी जीवन की दिशा' },
};

/** The line whose clarity most decides each section, for the "not enough evidence" reason. */
const KEY_LINE: Record<ModuleId, 'heart' | 'head' | 'life' | 'fate'> = {
  love: 'heart',
  career: 'head',
  money: 'fate',
  personality: 'head',
  direction: 'fate',
};

const LINE_NAMES: Record<'heart' | 'head' | 'life' | 'fate', Bilingual> = {
  heart: { en: 'heart line', hi: 'हृदय रेखा' },
  head: { en: 'head line', hi: 'मस्तिष्क रेखा' },
  life: { en: 'life line', hi: 'जीवन रेखा' },
  fate: { en: 'fate line', hi: 'भाग्य रेखा' },
};

/**
 * What each section asks the reader at the end. A question, never a claim: the
 * palm cannot know whether this is true of your life, so the report asks
 * instead of asserting (owner's brief, 2026-09-20). It carries no evidence and
 * is therefore not a Claim.
 */
/**
 * How the reading closes. The old closing repeated the three things the glance
 * had already said, which taught the reader nothing; this says plainly what a
 * palm cannot tell anyone (DEC-026), which is new, true, and the thing a
 * paying reader most needs to hear before they act on any of it.
 */
export const READING_LIMITS: readonly Bilingual[] = [
  {
    en: 'It cannot give you a date. No age, year or month for anything — a palm does not carry them.',
    hi: 'यह कोई तारीख़ नहीं बता सकती। किसी बात की उम्र, साल या महीना नहीं — हथेली में ये होते ही नहीं।',
  },
  {
    en: 'It cannot tell you about illness, having children, or how long you will live.',
    hi: 'यह बीमारी, संतान या आपकी उम्र के बारे में कुछ नहीं बता सकती।',
  },
  {
    en: 'It cannot decide anything for you. It describes tendencies, not what will happen.',
    hi: 'यह आपके लिए कोई फ़ैसला नहीं कर सकती। यह झुकाव बताती है, आगे क्या होगा यह नहीं।',
  },
];

const GLANCE_QUESTION: Bilingual = {
  en: 'Does this first picture sound like you?',
  hi: 'क्या पहली नज़र में यह आपको अपनी ही बात लगती है?',
};

const MODULE_QUESTION: Record<ModuleId, Bilingual> = {
  love: { en: 'Does this match how closeness actually feels for you?', hi: 'क्या रिश्तों में आपको सचमुच ऐसा ही महसूस होता है?' },
  career: { en: 'Does this match how you actually work?', hi: 'क्या आप सचमुच ऐसे ही काम करते हैं?' },
  money: { en: 'Is this how you actually handle money?', hi: 'क्या आप पैसों को सचमुच ऐसे ही सँभालते हैं?' },
  personality: { en: 'Does this sound like you?', hi: 'क्या यह आपको अपनी ही बात लगती है?' },
  direction: { en: 'Does this match the direction your life has taken so far?', hi: 'क्या अब तक आपकी ज़िंदगी इसी दिशा में चली है?' },
};

/** Built in this order; Personality last, so it gathers what the life areas did not say. */
const BUILD_ORDER: readonly ModuleId[] = ['love', 'career', 'money', 'direction', 'personality'];

/** Traits that describe a way of thinking, for Personality's "how you think". */
const THINKING_TRAITS: readonly TraitId[] = [
  'logical',
  'practical',
  'cautious',
  'thorough',
  'focused',
  'decisive',
  'imaginative',
  'quick_witted',
  'versatile',
];

export interface ReadingContext {
  obs: PalmObservation;
  clusters: Record<AreaId, AreaCluster>;
  /** Every kept match (all areas). */
  kept: GatedMatch[];
  /** Firm trait scores (rank.ts `traitScores`). */
  scores: Map<TraitId, number>;
  tensions: Tension[];
  /** The Palm Story's (held) headline traits; empty when no story. */
  headlineTraits: TraitId[];
  refs: (matches: GatedMatch[]) => FeatureRef[];
  /** The usable previous synthesis of this hand (same versions), for the holds. */
  previous: Synthesis | null;
  /** Lines that may only support, never open or lead (DEC-024). */
  weakLines: ReadonlySet<string>;
}

export interface Reading {
  overview: Overview;
  modules: Record<ModuleId, Module>;
  recap: Recap | null;
}

/** The field a section speaks with for a trait; null when the trait has nothing to say there. */
function sectionText(id: ModuleId, content: TraitContent): Bilingual | null {
  if (id === 'love') return content.relationship ?? content.coreMeaning;
  if (id === 'career') return content.work ?? content.coreMeaning;
  // The money gate: never a personality sentence in the money section.
  if (id === 'money') return content.money ?? null;
  if (id === 'direction') return content.growth ?? content.coreMeaning;
  return content.coreMeaning;
}

class Composer {
  private readonly used = new Set<string>();
  private count = 0;

  constructor(private readonly ctx: ReadingContext) {}

  /** Kept matches carrying a trait (any role), best first; firm before borderline. */
  matchesFor(traits: TraitId[], pool: GatedMatch[] = this.ctx.kept): GatedMatch[] {
    const carrying = pool.filter((g) => traitsOf(g).some((t) => traits.includes(t)));
    const firm = carrying.filter((g) => g.band === 'firm').sort(byScore);
    const soft = carrying.filter((g) => g.band !== 'firm').sort(byScore);
    return [...firm, ...soft];
  }

  /** Whether this sentence is already on the report (a claim with it would come back undefined). */
  isUsed(text: Bilingual | null | undefined): boolean {
    return Boolean(text?.en && this.used.has(text.en));
  }

  /** A claim, or undefined when its sentence is already on the report or nothing supports it. */
  claim(kind: ClaimKind, text: Bilingual | null | undefined, traits: TraitId[], matches: GatedMatch[]): Claim | undefined {
    if (!text || !text.en || matches.length === 0 || this.used.has(text.en)) return undefined;
    this.used.add(text.en);
    this.count += 1;
    return {
      id: `c${this.count}:${kind}`,
      kind,
      text,
      traitIds: [...traits],
      ruleIds: sortedUnique(matches.flatMap((g) => g.ruleIds)),
      featureRefs: this.ctx.refs(matches),
    };
  }
}

/** The area's traits a section may lead with, best first: firm evidence; for a held area, its borderline read. */
function areaTraits(area: AreaId, cluster: AreaCluster, scores: Map<TraitId, number>): { traits: TraitId[]; scores: Map<TraitId, number> } {
  const inArea = (matches: GatedMatch[]) => [...new Set(matches.flatMap(storyTraitsOf))].filter((t) => TRAIT_AREAS[t].includes(area));
  const firm = inArea(cluster.firm);
  if (firm.length > 0) return { traits: rankTraits(scores, firm), scores };
  if (!cluster.held) return { traits: [], scores };
  const softScores = traitScores(cluster.borderline, true);
  return { traits: rankTraits(softScores, inArea(cluster.borderline)), scores: softScores };
}

/**
 * How much the section may claim. "Clear signs" is the strongest word the
 * report has, so one rule never earns it on its own: a strong rule must be
 * corroborated by a second, independent feature, or three firm matches must
 * read three different features. Otherwise the section says "Some signs".
 */
function stateOf(cluster: AreaCluster): ModuleState {
  if (cluster.open) {
    const paths = new Set(cluster.firm.flatMap((g) => g.match.triggeredBy.map((t) => t.path)));
    const corroborated = cluster.firm.some((g) => g.strong) && independentCount(cluster.firm) >= 2;
    return corroborated || (cluster.firm.length >= 3 && paths.size >= 3) ? 'strong' : 'supported';
  }
  return cluster.firm.length + cluster.borderline.length > 0 ? 'limited' : 'insufficient';
}

/**
 * The honest note for a section that IS open but leans on a weak line
 * (DEC-024): the same light line that closes another section must not sit
 * silently inside this one's reasons.
 */
function supportNote(claims: Claim[], weakLines: ReadonlySet<string>): Bilingual | undefined {
  if (weakLines.size === 0) return undefined;
  const used = new Set<string>();
  for (const claim of claims) {
    for (const ref of claim.featureRefs) if (ref.lineType && weakLines.has(ref.lineType)) used.add(ref.lineType);
  }
  if (used.size === 0) return undefined;
  const names = [...used].sort().map((line) => LINE_NAMES[line as keyof typeof LINE_NAMES]).filter(Boolean);
  if (names.length === 0) return undefined;
  const en = names.map((n) => n.en).join(' and ');
  const hi = names.map((n) => n.hi).join(' और ');
  return {
    en: `Your ${en} was light in this photo, so it was only used as support here.`,
    hi: `इस फोटो में आपकी ${hi} हल्की थी, इसलिए यहाँ इसे सिर्फ़ सहारे के तौर पर लिया गया है।`,
  };
}

function note(id: ModuleId, kind: 'insufficient' | 'limited' | 'money_gate', obs: PalmObservation): Bilingual {
  const subject = MODULE_SUBJECT[id];
  const base: Bilingual =
    kind === 'money_gate'
      ? {
          en: 'Your palm showed signs the books link to effort and character, but none they tie clearly to money.',
          hi: 'आपकी हथेली में मेहनत और स्वभाव के संकेत दिखे, पर किताबें इनमें से किसी को साफ़ तौर पर पैसे से नहीं जोड़तीं।',
        }
      : kind === 'limited'
        ? {
            en: `We saw some signs here, but not clearly enough to give you a specific ${subject.en} reading.`,
            hi: `यहाँ कुछ संकेत दिखे, पर इतने साफ़ नहीं कि ${subject.hi} पक्की बात कही जा सके।`,
          }
        : {
            en: `We did not see enough clear palm evidence to give you a specific ${subject.en} reading.`,
            hi: `हमें हथेली में इतने साफ़ संकेत नहीं दिखे कि ${subject.hi} कोई ख़ास बात कही जा सके।`,
          };
  const key = KEY_LINE[id];
  const line = obs.lines.find((l) => l.type === key);
  const unclear = !line || !line.visible || line.confidence < 0.5 || line.depth.value === 'faint';
  if (kind === 'money_gate' || !unclear) return base;
  const name = LINE_NAMES[key];
  return {
    en: `${base.en} Your ${name.en} was not clear enough in this photo.`,
    hi: `${base.hi} इस फोटो में आपकी ${name.hi} पूरी साफ़ नहीं दिखी।`,
  };
}

/**
 * The first line of the report: which lines of THIS hand the reading was
 * actually read from. It opens with the palm, not with a verdict, so the
 * reader knows what was looked at before they are told anything about
 * themselves. Only lines the camera saw are named.
 */
function opening(obs: PalmObservation): Bilingual {
  const order: (keyof typeof LINE_NAMES)[] = ['life', 'head', 'heart', 'fate'];
  const seen = order.filter((key) => obs.lines.some((l) => l.type === key && l.visible));
  // "हथेली" is feminine, so the Hindi takes बाईं / दाईं, not बाएँ / दाएँ.
  const side: Bilingual = obs.hand.side === 'left' ? { en: 'left', hi: 'बाईं' } : { en: 'right', hi: 'दाईं' };
  if (seen.length === 0) {
    return {
      en: `We looked at your ${side.en} palm, but the photo did not show its main lines clearly enough to read them.`,
      hi: `हमने आपकी ${side.hi} हथेली देखी, पर इस फोटो में उसकी मुख्य रेखाएँ पढ़ने लायक साफ़ नहीं दिखीं।`,
    };
  }
  const names = seen.map((key) => LINE_NAMES[key]);
  const en = names.length === 1 ? names[0]!.en : `${names.slice(0, -1).map((n) => n.en).join(', ')} and ${names[names.length - 1]!.en}`;
  const hi = names.length === 1 ? names[0]!.hi : `${names.slice(0, -1).map((n) => n.hi).join(', ')} और ${names[names.length - 1]!.hi}`;
  return {
    en: `We looked at your ${side.en} palm and read the ${en}. Everything below comes from those lines and from what the old palmistry books say about them.`,
    hi: `हमने आपकी ${side.hi} हथेली देखी और उसमें ${hi} पढ़ी। नीचे जो कुछ लिखा है, वह इन्हीं रेखाओं से और पुरानी हस्तरेखा किताबों से आया है।`,
  };
}

function familyPattern(traits: TraitId[]): { pattern: PatternId; sentence: Bilingual; reflection: Bilingual } {
  const [a, b] = traits;
  if (!a) return { pattern: 'insufficient', ...SPECIAL_PATTERN_COPY.insufficient };
  if (b && TENSION_COPY[pairKey(a, b)]) return { pattern: 'strong_conflicted', ...SPECIAL_PATTERN_COPY.strong_conflicted };
  const fa = TRAIT_CONTENT[a].family;
  const fb = TRAIT_CONTENT[b ?? a].family;
  const key = fa < fb ? `${fa}|${fb}` : `${fb}|${fa}`;
  const entry = FAMILY_PATTERNS[key];
  if (!entry) throw new Error(`no family pattern for ${key}`);
  return entry;
}

function strongestModule(clusters: Record<AreaId, AreaCluster>): ModuleId | null {
  let best: ModuleId | null = null;
  let bestScore = 0;
  for (const id of BUILD_ORDER) {
    const cluster = clusters[MODULE_AREA[id]];
    if (cluster.open && cluster.score > bestScore) {
      best = id;
      bestScore = cluster.score;
    }
  }
  return best;
}

export function buildReading(ctx: ReadingContext): Reading {
  const c = new Composer(ctx);
  const [a, b] = ctx.headlineTraits;
  const pattern = familyPattern(ctx.headlineTraits);
  const strongest = strongestModule(ctx.clusters);

  // 1. Life at a Glance.
  const story: Claim[] = [];
  let strength: Claim | null = null;
  let challenge: Claim | null = null;
  if (a) {
    const A = TRAIT_CONTENT[a];
    const first = c.claim('story', A.coreMeaning, [a], c.matchesFor([a]));
    if (first) story.push(first);
    const second = b
      ? c.claim('story', COMBINATION_COPY[pairKey(a, b)] ?? TENSION_COPY[pairKey(a, b)] ?? TRAIT_CONTENT[b].coreMeaning, [a, b], c.matchesFor([a, b]))
      : c.claim('story', A.realLife, [a], c.matchesFor([a]));
    if (second) story.push(second);
    if (strongest) {
      const topic = MODULE_ABOUT[strongest];
      const area = ctx.clusters[MODULE_AREA[strongest]];
      const third = c.claim(
        'story',
        { en: `Your palm speaks most clearly about ${topic.en}.`, hi: `आपकी हथेली सबसे साफ़ ${topic.hi} के बारे में बताती है।` },
        [],
        area.firm,
      );
      if (third) story.push(third);
    }
    strength = c.claim('strength', A.strength, [a], c.matchesFor([a])) ?? null;
    const tension = ctx.tensions.find((t) => [a, b].includes(t.a) || [a, b].includes(t.b));
    const tensionText = tension ? TENSION_COPY[pairKey(tension.a, tension.b)] : undefined;
    challenge =
      (tension && c.claim('challenge', tensionText, [tension.a, tension.b], c.matchesFor([tension.a, tension.b]))) ||
      c.claim('challenge', A.watch, [a], c.matchesFor([a])) ||
      null;
  }
  const overview: Overview = {
    pattern: pattern.pattern,
    patternLabel: PATTERN_LABELS[pattern.pattern],
    opening: opening(ctx.obs),
    sentence: pattern.sentence,
    story,
    strongestModule: strongest,
    strength,
    challenge,
    ...(a ? { question: GLANCE_QUESTION } : {}),
  };

  // 2. The life sections.
  const leadTraits = new Set<TraitId>();
  const modules = {} as Record<ModuleId, Module>;
  for (const id of BUILD_ORDER) {
    const area = MODULE_AREA[id];
    const cluster = ctx.clusters[area];
    const base: Module = { id, area, state: stateOf(cluster), primary: null, extra: [], basisRuleIds: [] };
    if (!cluster.open) {
      modules[id] = { ...base, note: note(id, base.state === 'limited' ? 'limited' : 'insufficient', ctx.obs) };
      continue;
    }
    const { traits, scores } = areaTraits(area, cluster, ctx.scores);
    const speaking = traits.filter((t) => sectionText(id, TRAIT_CONTENT[t]) !== null);
    if (speaking.length === 0) {
      modules[id] = { ...base, state: 'limited', note: note(id, id === 'money' ? 'money_gate' : 'limited', ctx.obs) };
      continue;
    }

    // A section leads with a sentence the report has not used yet (the glance or
    // an earlier section may already have said a trait's core meaning): the
    // trait's own section text, else its real-life line, else — when everything
    // this trait has to say is already above — a short pointer back to it, so an
    // open section never comes back without a leading sentence (audit 2026-09-23).
    const ownWords = (trait: TraitId): Bilingual | null => {
      const content = TRAIT_CONTENT[trait];
      const own = sectionText(id, content);
      if (own && !c.isUsed(own)) return own;
      // The money gate: money never falls back to a general personality line.
      if (id === 'money') return null;
      return content.realLife && !c.isUsed(content.realLife) ? content.realLife : null;
    };
    const leadText = (trait: TraitId): Bilingual | null => {
      const words = ownWords(trait);
      if (words || id === 'money') return words;
      const about = MODULE_ABOUT[id];
      const phrase = TRAITS[trait].phrase;
      return {
        en: `What your palm says most clearly about ${about.en} is the point made above: ${phrase.en}.`,
        hi: `${about.hi} के बारे में आपकी हथेली सबसे साफ़ वही बात कहती है जो ऊपर आई है: ${phrase.hi}।`,
      };
    };
    const fresh = (trait: TraitId) => !c.isUsed(sectionText(id, TRAIT_CONTENT[trait]));
    // The leading trait: the best one no earlier section led with and whose own
    // sentence is still unsaid, held across rescans (DEC-023).
    let lead =
      speaking.find((t) => !leadTraits.has(t) && fresh(t)) ??
      speaking.find((t) => fresh(t)) ??
      speaking.find((t) => !leadTraits.has(t) && ownWords(t) !== null) ??
      speaking.find((t) => ownWords(t) !== null) ??
      speaking.find((t) => !leadTraits.has(t)) ??
      speaking[0]!;
    let held = false;
    const prev = ctx.previous?.modules?.[id];
    // The previous lead may be held while its evidence is still here in any band:
    // a borderline-only change never swaps what a section leads with (DEC-023).
    const stillPresent = (trait: TraitId) =>
      sectionText(id, TRAIT_CONTENT[trait]) !== null &&
      leadText(trait) !== null &&
      [...cluster.firm, ...cluster.borderline].some((g) => storyTraitsOf(g).includes(trait)) &&
      TRAIT_AREAS[trait].includes(area);
    if (prev?.primaryTrait && prev.primaryTrait !== lead && stillPresent(prev.primaryTrait)) {
      const defence = Math.max(scores.get(prev.primaryTrait) ?? 0, prev.primaryScore ?? 0);
      if ((scores.get(lead) ?? 0) < defence * HYSTERESIS.themeTakeoverRatio) {
        lead = prev.primaryTrait;
        held = true;
      }
    }
    leadTraits.add(lead);
    const second = speaking.find((t) => t !== lead);
    const L = TRAIT_CONTENT[lead];
    const pool = [...cluster.firm, ...cluster.borderline];
    const leadMatches = c.matchesFor([lead], pool);

    const primary = c.claim('primary', leadText(lead), [lead], leadMatches) ?? null;

    // Money speaks only about money: its second sentence is another trait's money
    // behaviour, never a general personality line (owner's brief, 2026-09-19).
    if (id === 'money') {
      const moneyShowsUp = second ? c.claim('showsUp', TRAIT_CONTENT[second].money, [second], c.matchesFor([second], pool)) : undefined;
      const moneyNote = supportNote([primary, moneyShowsUp].filter((x): x is Claim => Boolean(x)), ctx.weakLines);
      modules[id] = {
        ...base,
        primary,
        ...(moneyNote ? { note: moneyNote } : {}),
        ...(moneyShowsUp ? { showsUp: moneyShowsUp } : {}),
        question: MODULE_QUESTION[id],
        extra: [],
        basisRuleIds: [...new Set(leadMatches.map((g) => g.match.rule.ruleId))].slice(0, 3),
        primaryTrait: lead,
        primaryScore: Math.round((scores.get(lead) ?? 0) * 1000) / 1000,
        ...(held ? { heldFromPrevious: true as const } : {}),
      };
      continue;
    }

    const pair = second ? pairKey(lead, second) : null;
    const showsUp =
      (pair && second && c.claim('showsUp', COMBINATION_COPY[pair], [lead, second], c.matchesFor([lead, second], pool))) ||
      c.claim('showsUp', L.realLife, [lead], leadMatches);
    const strengthClaim =
      c.claim('strength', L.strength, [lead], leadMatches) ||
      (second ? c.claim('strength', TRAIT_CONTENT[second].strength, [second], c.matchesFor([second], pool)) : undefined);
    const need = id === 'love' ? c.claim('need', L.relationshipNeed ?? (second ? TRAIT_CONTENT[second].relationshipNeed : undefined), [lead], leadMatches) : undefined;
    // "Watch for" stays on the section's topic: only a watch trait of this area.
    const watchRole = cluster.firm.flatMap((g) =>
      (g.match.rule.traits ?? []).filter((t) => t.role === 'watch' && TRAIT_AREAS[t.id].includes(area)).map((t) => t.id),
    )[0];
    const watch = watchRole
      ? c.claim('watch', TRAIT_CONTENT[watchRole].watch, [watchRole], c.matchesFor([watchRole], pool)) || c.claim('watch', L.watch, [lead], leadMatches)
      : c.claim('watch', L.watch, [lead], leadMatches);
    const firmTraits = new Set(cluster.firm.flatMap(traitsOf));
    const tensionPair = ctx.tensions.find((t) => firmTraits.has(t.a) && firmTraits.has(t.b));
    const tension = tensionPair
      ? c.claim('tension', TENSION_COPY[pairKey(tensionPair.a, tensionPair.b)], [tensionPair.a, tensionPair.b], c.matchesFor([tensionPair.a, tensionPair.b], pool))
      : undefined;

    const extra: Claim[] = [];
    if (id === 'career') {
      const fit = c.claim('bestFit', L.workEnvironment ?? (second ? TRAIT_CONTENT[second].workEnvironment : undefined), [lead], leadMatches);
      if (fit) extra.push(fit);
    }
    if (id === 'personality') {
      const thinker = traits.find((t) => t !== lead && THINKING_TRAITS.includes(t));
      const thinking = thinker ? c.claim('thinking', TRAIT_CONTENT[thinker].coreMeaning, [thinker], c.matchesFor([thinker], pool)) : undefined;
      if (thinking) extra.push(thinking);
    }
    if (id === 'direction' && a) {
      const reflection = c.claim('reflection', pattern.reflection, ctx.headlineTraits, c.matchesFor(ctx.headlineTraits));
      if (reflection) extra.push(reflection);
    }

    const openNote = supportNote(
      [primary, showsUp, strengthClaim, need, watch, tension, ...extra].filter((x): x is Claim => Boolean(x)),
      ctx.weakLines,
    );
    modules[id] = {
      ...base,
      primary,
      ...(openNote ? { note: openNote } : {}),
      question: MODULE_QUESTION[id],
      ...(showsUp ? { showsUp } : {}),
      ...(strengthClaim ? { strength: strengthClaim } : {}),
      ...(need ? { need } : {}),
      ...(watch ? { watch } : {}),
      ...(tension ? { tension } : {}),
      extra,
      basisRuleIds: [...new Set(leadMatches.map((g) => g.match.rule.ruleId))].slice(0, 3),
      primaryTrait: lead,
      primaryScore: Math.round((scores.get(lead) ?? 0) * 1000) / 1000,
      ...(held ? { heldFromPrevious: true as const } : {}),
    };
  }

  // 3. The closing recap: short labels, never a sentence repeated from above.
  let recap: Recap | null = null;
  if (a) {
    const topic = strongest ? MODULE_TOPIC[strongest] : null;
    const label = PATTERN_LABELS[pattern.pattern];
    const remember: Recap['remember'] = [
      { label: { en: `Your overall pattern: ${label.en}`, hi: `आपका मुख्य स्वभाव: ${label.hi}` }, claimId: strength?.id ?? null },
    ];
    if (challenge) {
      const names = challenge.traitIds.map((t) => TRAITS[t].label);
      // The watch side of the strongest trait: named as its other side, not the same label twice.
      const label: Bilingual =
        challenge.traitIds.length === 1 && challenge.traitIds[0] === a
          ? { en: `Your main challenge: the other side of being ${TRAITS[a].label.en.toLowerCase()}`, hi: `आपकी मुख्य चुनौती: ${TRAITS[a].label.hi} होने का दूसरा पहलू` }
          : { en: `Your main challenge: ${names.map((n) => n.en).join(' and ')}`, hi: `आपकी मुख्य चुनौती: ${names.map((n) => n.hi).join(' और ')}` };
      remember.push({ label, claimId: challenge.id });
    }
    if (strongest) {
      remember.push({ label: { en: `Clearest area: ${MODULE_LABELS[strongest].en}`, hi: `सबसे साफ़ हिस्सा: ${MODULE_LABELS[strongest].hi}` }, claimId: null });
    }
    recap = {
      sentence: topic
        ? { en: `${label.en}, with ${topic.en} as the clearest part of your reading.`, hi: `${label.hi} — आपकी रीडिंग में सबसे साफ़ हिस्सा ${topic.hi} है।` }
        : { en: `${label.en}.`, hi: `${label.hi}।` },
      remember,
    };
  }

  return { overview, modules, recap };
}
