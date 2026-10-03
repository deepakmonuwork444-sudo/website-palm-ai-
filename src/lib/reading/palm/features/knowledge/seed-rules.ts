// COPIED from palm-ai-new--feat-m1-foundation/src/features/knowledge/seed-rules.ts at app commit fbc2232d837f (2026-09-30).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import type { TraitId } from './traits';
import type { KbRule, RuleCategory, RuleCondition, RuleTrait } from './types';

/**
 * Seed knowledge base.
 *
 * Every rule here is `draft`: written from widely-attested classical palmistry
 * but NOT yet verified against a physical source. The engine will not fire
 * them unless `includeDraftRules` is explicitly on, and any report built from
 * them must say the knowledge base is provisional.
 *
 * They exist so the end-to-end pipeline can be built and tested before the
 * real corpus arrives. They are a scaffold, not the product.
 *
 * Wording is our own throughout. No source is quoted.
 */

interface RuleOpts {
  caveat?: string;
  sources?: string[];
  conflictGroup?: string;
  minConfidence?: number;
  specificity?: number;
}

/** Trait tags and the evidence phrase (see `types.ts`). Every seed rule carries them; all are `normal`. */
interface RuleTags {
  traits: RuleTrait[];
  short: string;
  shortHi: string;
}

/** A trait this rule's evidence speaks to. The role is the rule's, not the trait's. */
function t(id: TraitId, role: RuleTrait['role'] = 'strength'): RuleTrait {
  return { id, role };
}

function r(
  ruleId: string,
  tradition: string,
  conditions: RuleCondition[],
  category: RuleCategory,
  meaning: string,
  tags: RuleTags,
  opts: RuleOpts = {},
): KbRule {
  return {
    ruleId,
    tradition,
    conditions,
    minConfidence: opts.minConfidence ?? 0.55,
    interpretation: { category, meaning, caveat: opts.caveat ?? null },
    sourceIds: opts.sources ?? ['cheiro-loth-1897'],
    specificity: opts.specificity ?? conditions.length,
    conflictGroup: opts.conflictGroup ?? null,
    validationStatus: 'draft',
    traits: tags.traits,
    weight: 'normal',
    short: tags.short,
    shortHi: tags.shortHi,
  };
}

const WC = 'western_classical';
const IHR = 'indian_hast_rekha';
const BENHAM = ['benham-lshr-1900'];
const HAST = ['hast-rekha-general'];

export const SEED_RULES: KbRule[] = [
  // ---- heart line: emotional life and relationships ----
  r('heart-deep', WC, [{ path: 'line.heart.depth', operator: 'eq', value: 'deep' }],
    'emotional_life',
    'Feelings register strongly and tend to be held for a long time rather than passing quickly.',
    { traits: [t('affectionate'), t('steady')], short: '{line.heart.depth} heart line', shortHi: '{line.heart.depth} हृदय रेखा' },
    { sources: BENHAM }),

  r('heart-faint', WC, [{ path: 'line.heart.depth', operator: 'eq', value: 'faint' }],
    'emotional_life',
    'Emotional life is kept private, and closeness is offered slowly rather than all at once.',
    { traits: [t('reserved')], short: '{line.heart.depth} heart line', shortHi: '{line.heart.depth} हृदय रेखा' },
    { sources: BENHAM }),

  r('heart-end-jupiter', WC,
    [{ path: 'line.heart.end_zone', operator: 'eq', value: 'jupiter' }],
    'relationships',
    'An idealistic streak in affection — a tendency to look for something to admire in a partner.',
    { traits: [t('idealistic')], short: 'heart line ending {line.heart.end_zone}', shortHi: '{line.heart.end_zone} ख़त्म होती हृदय रेखा' }),

  r('heart-end-saturn', WC,
    [{ path: 'line.heart.end_zone', operator: 'eq', value: 'saturn' }],
    'relationships',
    'Affection is more self-contained, and attachment is given deliberately rather than readily.',
    { traits: [t('reserved')], short: 'heart line ending {line.heart.end_zone}', shortHi: '{line.heart.end_zone} ख़त्म होती हृदय रेखा' }),

  r('heart-branches-up', IHR,
    [{ path: 'line.heart.marks.branch_up', operator: 'gte', value: 2 }],
    'relationships',
    'Warmth tends to be shown outwardly, in gestures other people can see.',
    { traits: [t('affectionate'), t('sociable')], short: 'heart line with upward branches ({line.heart.marks.branch_up})', shortHi: 'हृदय रेखा पर ऊपर जाती शाखाएँ ({line.heart.marks.branch_up})' },
    { sources: HAST }),

  r('heart-deep-jupiter', WC,
    [
      { path: 'line.heart.depth', operator: 'eq', value: 'deep' },
      { path: 'line.heart.end_zone', operator: 'eq', value: 'jupiter' },
    ],
    'relationships',
    'Strong feeling combined with an idealistic streak: attachments form deeply and are held to a high standard.',
    { traits: [t('affectionate'), t('idealistic')], short: '{line.heart.depth} heart line ending {line.heart.end_zone}', shortHi: '{line.heart.end_zone} ख़त्म होती {line.heart.depth} हृदय रेखा' },
    { specificity: 4, caveat: 'Read as a tendency, not as a prediction about any particular relationship.' }),

  // ---- head line: thinking style ----
  r('head-long', WC, [{ path: 'line.head.length', operator: 'eq', value: 'long' }],
    'thinking_style',
    'A thorough way of thinking — a preference for following an idea all the way through before acting.',
    { traits: [t('thorough')], short: '{line.head.length} head line', shortHi: '{line.head.length} मस्तिष्क रेखा' }),

  r('head-short', WC, [{ path: 'line.head.length', operator: 'eq', value: 'short' }],
    'thinking_style',
    'A direct, decisive way of thinking that prefers to reach the point quickly.',
    { traits: [t('decisive'), t('practical')], short: '{line.head.length} head line', shortHi: '{line.head.length} मस्तिष्क रेखा' }),

  r('head-straight', WC, [{ path: 'line.head.curvature', operator: 'eq', value: 'straight' }],
    'thinking_style',
    'A practical turn of mind, more comfortable with the concrete than the speculative.',
    { traits: [t('practical')], short: '{line.head.curvature} head line', shortHi: '{line.head.curvature} मस्तिष्क रेखा' },
    { sources: BENHAM }),

  r('head-curved', WC, [{ path: 'line.head.curvature', operator: 'eq', value: 'curved' }],
    'thinking_style',
    'An imaginative turn of mind that reaches for possibility before practicality.',
    { traits: [t('imaginative')], short: '{line.head.curvature} head line', shortHi: '{line.head.curvature} मस्तिष्क रेखा' },
    { sources: BENHAM }),

  r('head-broken', IHR, [{ path: 'line.head.continuity', operator: 'eq', value: 'broken' }],
    'thinking_style',
    'A mind that changes direction rather than running in one straight line — periods of rethinking.',
    { traits: [t('changeable', 'neutral')], short: '{line.head.continuity} head line', shortHi: '{line.head.continuity} मस्तिष्क रेखा' },
    { sources: HAST, caveat: 'In this tradition a break describes a change of direction. It says nothing about health.' }),

  r('head-fork', WC, [{ path: 'line.head.marks.fork', operator: 'gte', value: 1 }],
    'communication',
    'An ability to hold two sides of a question at once and argue either.',
    { traits: [t('versatile')], short: 'head line with a fork ({line.head.marks.fork})', shortHi: 'मस्तिष्क रेखा में फ़ोर्क ({line.head.marks.fork})' }),

  r('head-long-curved', WC,
    [
      { path: 'line.head.length', operator: 'eq', value: 'long' },
      { path: 'line.head.curvature', operator: 'eq', value: 'curved' },
    ],
    'thinking_style',
    'Depth and imagination together: ideas are followed a long way, and they tend to start from possibility rather than precedent.',
    { traits: [t('thorough'), t('imaginative')], short: '{line.head.length}, {line.head.curvature} head line', shortHi: '{line.head.length}, {line.head.curvature} मस्तिष्क रेखा' },
    { specificity: 4 }),

  // ---- life line: vitality ----
  r('life-deep', WC, [{ path: 'line.life.depth', operator: 'eq', value: 'deep' }],
    'vitality',
    'A steady physical constitution that recovers well from effort.',
    { traits: [t('steady'), t('energetic')], short: '{line.life.depth} life line', shortHi: '{line.life.depth} जीवन रेखा' },
    { sources: BENHAM, caveat: 'A description of general constitution, not a health assessment.' }),

  r('life-curved', WC, [{ path: 'line.life.curvature', operator: 'eq', value: 'curved' }],
    'vitality',
    'Energy that tends to be spent outwardly — on people, movement and activity.',
    { traits: [t('energetic'), t('sociable')], short: '{line.life.curvature} life line', shortHi: '{line.life.curvature} जीवन रेखा' }),

  r('life-straight', IHR, [{ path: 'line.life.curvature', operator: 'eq', value: 'straight' }],
    'vitality',
    'Energy that is held closer in and spent more selectively.',
    { traits: [t('low_key')], short: '{line.life.curvature} life line', shortHi: '{line.life.curvature} जीवन रेखा' },
    { sources: HAST }),

  // A genuine cross-tradition disagreement, kept as a disagreement.
  // Neither interpretation makes any claim about lifespan, and neither may.
  r('life-short-wc', WC, [{ path: 'line.life.length', operator: 'eq', value: 'short' }],
    'vitality',
    'In this reading the length of the life line describes how energy is distributed, not how long it lasts — a shorter line suggests energy arriving in concentrated bursts.',
    { traits: [t('energetic', 'neutral')], short: '{line.life.length} life line', shortHi: '{line.life.length} जीवन रेखा' },
    { conflictGroup: 'life_line_length_meaning', sources: BENHAM,
      caveat: 'This tradition is explicit that the line is not a measure of lifespan.' }),

  r('life-short-ihr', IHR, [{ path: 'line.life.length', operator: 'eq', value: 'short' }],
    'vitality',
    'Here the emphasis falls on constitution and rest: a shorter line is read as a call to pace effort rather than as anything ominous.',
    { traits: [t('low_key', 'neutral')], short: '{line.life.length} life line', shortHi: '{line.life.length} जीवन रेखा' },
    { conflictGroup: 'life_line_length_meaning', sources: HAST,
      caveat: 'Traditions differ on this feature. Both are shown rather than one being chosen for you.' }),

  // ---- fate line: work and direction ----
  r('fate-present', WC, [{ path: 'line.fate.visible', operator: 'eq', value: true }],
    'work_and_direction',
    'A felt sense of direction — the feeling that work and circumstance are heading somewhere.',
    { traits: [t('determined', 'neutral')], short: '{line.fate.visible} fate line', shortHi: '{line.fate.visible} भाग्य रेखा' }),

  r('fate-absent', IHR, [{ path: 'line.fate.visible', operator: 'eq', value: false }],
    'work_and_direction',
    'Direction is self-chosen rather than given. In this tradition an absent fate line is read as independence, not as misfortune.',
    { traits: [t('independent')], short: '{line.fate.visible} fate line', shortHi: '{line.fate.visible} भाग्य रेखा' },
    { sources: HAST }),

  r('fate-start-luna', WC, [{ path: 'line.fate.start_zone', operator: 'eq', value: 'luna' }],
    'work_and_direction',
    'A path shaped substantially by other people — work that involves the public, or opportunities that arrive through others.',
    { traits: [t('influenced_by_others')], short: 'fate line starting {line.fate.start_zone}', shortHi: '{line.fate.start_zone} से शुरू होती भाग्य रेखा' }),

  // ---- mounts: temperament ----
  r('mount-venus-raised', WC,
    [{ path: 'mount.venus.prominence', operator: 'eq', value: 'raised' }],
    'temperament',
    'Warmth and appetite for life — enjoyment of company, food, music and physical comfort.',
    { traits: [t('affectionate'), t('sociable')], short: '{mount.venus.prominence} Venus mount', shortHi: '{mount.venus.prominence} शुक्र पर्वत' },
    { sources: BENHAM }),

  r('mount-jupiter-raised', WC,
    [{ path: 'mount.jupiter.prominence', operator: 'eq', value: 'raised' }],
    'temperament',
    'Ambition and a natural pull toward leading rather than following.',
    { traits: [t('ambitious'), t('leader')], short: '{mount.jupiter.prominence} Jupiter mount', shortHi: '{mount.jupiter.prominence} गुरु पर्वत' },
    { sources: BENHAM }),

  r('mount-luna-raised', WC,
    [{ path: 'mount.luna.prominence', operator: 'eq', value: 'raised' }],
    'temperament',
    'A strong imaginative life — a mind that wanders productively.',
    { traits: [t('imaginative')], short: '{mount.luna.prominence} Moon mount', shortHi: '{mount.luna.prominence} चंद्र पर्वत' },
    { sources: BENHAM }),

  r('mount-mercury-raised', IHR,
    [{ path: 'mount.mercury.prominence', operator: 'eq', value: 'raised' }],
    'communication',
    'Quickness with words and a talent for reading a room.',
    { traits: [t('quick_witted'), t('sociable')], short: '{mount.mercury.prominence} Mercury mount', shortHi: '{mount.mercury.prominence} बुध पर्वत' },
    { sources: HAST }),
];

/** Rules that reference a feature the MVP vision layer cannot yet see reliably. */
export const SEED_RULE_COUNT = SEED_RULES.length;
