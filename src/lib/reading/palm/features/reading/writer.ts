// COPIED from palm-ai-new--feat-m1-foundation/src/features/reading/writer.ts at app commit 38389f51b74d (2026-09-26).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import type {
  MatchedRule,
  ReadingEvidence,
  RuleCategory,
  TriggeringObservation,
} from '../knowledge/types';
import { sourceById } from '../knowledge/sources';
import type { Dominance } from '../observation/schema';

import { featureLine } from './humanise';

/**
 * The deterministic writer.
 *
 * It reorganises matched evidence into readable prose. It cannot add a
 * meaning, cannot resolve a conflict, and cannot mention a feature that no
 * rule matched. Everything it emits is traceable to a rule id.
 *
 * This is also the outage fallback: if every language provider is down, the
 * product still produces a complete, honest report.
 */

const CATEGORY_TITLES: Record<RuleCategory, string> = {
  temperament: 'How you come across',
  emotional_life: 'Your emotional life',
  thinking_style: 'How you think',
  vitality: 'Energy and constitution',
  work_and_direction: 'Work and direction',
  money_and_effort: 'Money and effort',
  relationships: 'Closeness and relationships',
  communication: 'How you communicate',
};

export interface ReportEvidenceLine {
  ruleId: string;
  observed: string;
  meaning: string;
  confidence: number;
  sources: string[];
  tradition: string;
  /**
   * The observation paths that fired the rule, kept machine-readable so the
   * summary can attribute an insight to a line without re-parsing prose.
   * Optional because reports saved before this field existed do not have it.
   */
  paths?: string[];
  /**
   * Book and chapter for each source, for rules extracted from the corpus.
   * Absent for seed rules and for reports saved before citations existed.
   */
  citations?: { title: string; locator: string }[];
}

export interface ReportSection {
  category: RuleCategory;
  title: string;
  paragraphs: string[];
  caveats: string[];
  conflictNote: string | null;
  evidence: ReportEvidenceLine[];
}

export interface ReadingReport {
  generatedAt: string;
  /**
   * True when any rule behind this report has not been checked against its
   * book by a person. Must be surfaced. Decided by the rules that matched, so
   * it clears once those rules are reviewed.
   */
  provisional: boolean;
  opening: string;
  sections: ReportSection[];
  uncertainty: string | null;
  gaps: string | null;
  disclaimer: string;
}

const DISCLAIMER =
  'This is a traditional palmistry interpretation, offered for reflection and entertainment. ' +
  'It is not scientifically established, it does not predict the future, and it is never ' +
  'medical, financial or legal advice.';

/**
 * Turns a dotted path plus its value into something a person can read, band
 * aware (DEC-019): a borderline value names both classes and says so, e.g.
 * "life line length: short-to-medium · borderline". Never a raw enum token.
 */
export function describeObservation(t: TriggeringObservation): string {
  return featureLine(t.path, t.value, { band: t.band, altValue: t.altValue }, 'en');
}

function toEvidenceLine(match: MatchedRule): ReportEvidenceLine {
  return {
    ruleId: match.rule.ruleId,
    observed: match.triggeredBy.map(describeObservation).join('; '),
    meaning: match.rule.interpretation.meaning,
    // How clearly the camera saw it: the raw (undamped) trace confidence, the
    // same source as a theme's "how clearly seen", so one feature gets one word.
    confidence: Math.min(...match.triggeredBy.map((t) => t.rawConfidence ?? t.confidence)),
    sources: match.rule.sourceIds.map((id) => sourceById(id)?.title ?? id),
    tradition: match.rule.tradition.replace(/_/g, ' '),
    paths: match.triggeredBy.map((t) => t.path),
    ...(match.rule.citations?.length
      ? {
          citations: match.rule.citations.map((c) => ({
            title: sourceById(c.sourceId)?.title ?? c.sourceId,
            locator: c.locator,
          })),
        }
      : {}),
  };
}

function traditionName(key: string): string {
  if (key === 'indian_hast_rekha') return 'Hast Rekha Shastra';
  if (key === 'western_classical') return 'the classical Western texts';
  return key.replace(/_/g, ' ');
}

function buildConflictNote(section: ReadingEvidence['sections'][number]): string | null {
  if (section.conflicts.length === 0) return null;
  const traditions = new Set<string>();
  for (const conflict of section.conflicts) {
    for (const match of conflict.matches) traditions.add(match.rule.tradition);
  }
  const names = [...traditions].map(traditionName);
  const joined = names.length === 2 ? `${names[0]} and ${names[1]}` : names.join(', ');
  const list = joined.charAt(0).toUpperCase() + joined.slice(1);
  return `${list} read this feature differently, so both readings are shown rather than one being chosen for you.`;
}

export interface WriteOptions {
  handSide: 'left' | 'right';
  /** The scanned hand's role (`dominanceOf`); unknown and ambidextrous are framed neutrally. */
  dominance: Dominance;
  /**
   * @deprecated Ignored. Whether a report is provisional is decided by the
   * rules that actually matched (`ReadingReport.provisional`).
   */
  provisionalKnowledge?: boolean;
}

/** True when any matched rule has not yet been checked against its book. */
export function hasUnreviewedMatch(evidence: ReadingEvidence): boolean {
  return evidence.sections.some((section) =>
    section.matches.some((match) => match.rule.validationStatus !== 'human_reviewed'),
  );
}

/** How the opening names the hand and frames it; neutral when the role is not known or does not apply. */
const HAND_FRAMING: Record<Dominance, { role: string; note: string }> = {
  dominant: {
    role: ', your dominant hand',
    note: 'The dominant hand is traditionally read as the life you are actively making.',
  },
  non_dominant: {
    role: ', your non-dominant hand',
    note: 'The non-dominant hand is traditionally read as what you started with rather than what you have done with it.',
  },
  ambidextrous: {
    role: '',
    note: 'You use both hands, so the tradition of one writing hand and one other hand is not applied; this hand is read on its own.',
  },
  unknown: {
    role: '',
    note: 'We do not know which hand you use most, so this reading is not framed as the writing hand or the other hand; it is read on its own.',
  },
};

function buildOpening(evidence: ReadingEvidence, options: WriteOptions): string {
  const hand = `${options.handSide} hand`;
  const framing = HAND_FRAMING[options.dominance];
  const count = evidence.totalMatches;

  if (count === 0) {
    return (
      `This is your ${hand}${framing.role}. The photo was clear enough to work with, but nothing ` +
      'in it matched a reading we can stand behind. That is an honest result, not a failure — ' +
      'a closer, flatter photograph in even light usually changes it.'
    );
  }

  // No count: "N readings" is an engineering number, not something a reader needs (BUG-016).
  return `This is your ${hand}${framing.role}. ${framing.note}`;
}

const MOUNT_NAMES: Record<string, string> = {
  jupiter: 'Jupiter',
  saturn: 'Saturn',
  apollo: 'Apollo',
  mercury: 'Mercury',
  venus: 'Venus',
  luna: 'the Moon',
  mars_positive: 'upper Mars',
  mars_negative: 'lower Mars',
};

/** "line.fate" -> "the fate line"; "mount.apollo" -> "the mount of Apollo". */
export function describeFeaturePath(path: string): string {
  const [kind, name] = path.split('.');
  if (!name) return path;
  if (kind === 'mount') return `the mount of ${MOUNT_NAMES[name] ?? name}`;
  if (kind === 'line') return `the ${name.replace(/_/g, ' ')} line`;
  return name;
}

function buildUncertainty(evidence: ReadingEvidence): string | null {
  if (evidence.lowConfidencePaths.length === 0) return null;
  const unique = [...new Set(evidence.lowConfidencePaths.map(describeFeaturePath))];
  const list = unique.length > 3 ? `${unique.slice(0, 3).join(', ')} and others` : unique.join(', ');
  return (
    `We could not see ${list} clearly enough to read ${unique.length === 1 ? 'it' : 'them'}. ` +
    'Rather than guess, we left that out. A flatter palm, held still in even light, usually helps.'
  );
}

function buildGaps(evidence: ReadingEvidence): string | null {
  if (evidence.unmatchedObservations.length === 0) return null;
  const count = evidence.unmatchedObservations.length;
  return (
    `We also saw ${count} ${count === 1 ? 'feature' : 'features'} clearly but have no verified ` +
    `interpretation for ${count === 1 ? 'it' : 'them'} yet. As our source library grows, ` +
    `${count === 1 ? 'it' : 'they'} will appear here rather than being filled in with guesswork.`
  );
}

export function writeReport(evidence: ReadingEvidence, options: WriteOptions): ReadingReport {
  const sections: ReportSection[] = evidence.sections.map((section) => {
    const seen = new Set<string>();
    const paragraphs: string[] = [];
    const caveats: string[] = [];

    for (const match of section.matches) {
      const meaning = match.rule.interpretation.meaning;
      if (seen.has(meaning)) continue;
      seen.add(meaning);
      paragraphs.push(meaning);

      const caveat = match.rule.interpretation.caveat;
      if (caveat && !caveats.includes(caveat)) caveats.push(caveat);
    }

    return {
      category: section.category,
      title: CATEGORY_TITLES[section.category],
      paragraphs,
      caveats,
      conflictNote: buildConflictNote(section),
      evidence: section.matches.map(toEvidenceLine),
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    provisional: hasUnreviewedMatch(evidence),
    opening: buildOpening(evidence, options),
    sections,
    uncertainty: buildUncertainty(evidence),
    gaps: buildGaps(evidence),
    disclaimer: DISCLAIMER,
  };
}
