// COPIED from palm-ai-new--feat-m1-foundation/src/features/reading/books.ts at app commit fbc2232d837f (2026-09-30).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import { HAND_ROLE_CONVENTION, HAND_ROLE_NOTES } from '../knowledge/hand-role';
import { LINE_BOOK_NOTES } from '../knowledge/line-notes';
import { KNOWLEDGE_RULES } from '../knowledge/rules';
import { KB_SOURCES, sourceById } from '../knowledge/sources';
import type { KbRule, RuleCitation } from '../knowledge/types';
import type { Dominance, Observed, PalmObservation } from '../observation/schema';

import { REPORT_LINES, readingBasis, type Bi, type LineBasisInfo, type ReportLine } from './basis';
import { featureLine, type BandHint } from './humanise';
import type { ReadingReport, ReportEvidenceLine } from './writer';

/**
 * "What the books say": every traditional meaning in a report, with the book
 * it came from, grouped by line.
 *
 * Citations are resolved from the CURRENT rule by id (so a report saved before
 * citations existed still names its book), falling back to what the report
 * stored. A title is always a human-readable book title, never a source id.
 *
 * No React Native imports: unit-tested in Node.
 */

export interface BookCitation {
  title: string;
  author: string | null;
  year: number | null;
  /** Chapter or section, when the rule has one. */
  locator: string | null;
  /** "Palmistry for All (Cheiro, 1916), Part I, ch. VI — The Line of the Sun" */
  label: string;
}

export interface BookEntry {
  ruleId: string;
  /** The observed feature, as the writer described it: "sun line depth: deep". */
  observed: string;
  /** The rule paths behind it, so the UI can re-read the value in words (`observedText`). */
  paths?: string[];
  meaning: string;
  confidence: number;
  tradition: string;
  citations: BookCitation[];
}

export interface LineBooks {
  type: ReportLine;
  basis: LineBasisInfo;
  entries: BookEntry[];
  /** Why the books give this line no meaning here, when that was decided. */
  note: (Bi & { citations: BookCitation[] }) | null;
}

function toCitation(sourceId: string, locator: string | null): BookCitation {
  const source = sourceById(sourceId);
  const title = source?.title ?? sourceId;
  const byline = [source?.author, source?.year].filter((part) => part !== undefined).join(', ');
  const book = byline ? `${title} (${byline})` : title;
  return {
    title,
    author: source?.author ?? null,
    year: source?.year ?? null,
    locator,
    label: locator ? `${book}, ${locator}` : book,
  };
}

function fromRuleCitations(citations: readonly RuleCitation[]): BookCitation[] {
  return citations.map((c) => toCitation(c.sourceId, c.locator));
}

/** The books behind one evidence line, human-readable and de-duplicated. */
export function citationsFor(entry: ReportEvidenceLine, rules: readonly KbRule[] = KNOWLEDGE_RULES): BookCitation[] {
  const rule = rules.find((r) => r.ruleId === entry.ruleId);
  let citations: BookCitation[];
  if (rule?.citations?.length) {
    citations = fromRuleCitations(rule.citations);
  } else if (entry.citations?.length) {
    citations = entry.citations.map((c) => {
      // Prefer the corpus entry (it has an author and year) over a seed entry with the same title.
      const known = KB_SOURCES.filter((source) => source.title === c.title).sort((x, y) => Number(Boolean(y.author)) - Number(Boolean(x.author)))[0];
      return known ? toCitation(known.sourceId, c.locator) : { title: c.title, author: null, year: null, locator: c.locator, label: `${c.title}, ${c.locator}` };
    });
  } else {
    citations = entry.sources.map((title) => ({ title, author: null, year: null, locator: null, label: title }));
  }
  const seen = new Set<string>();
  return citations.filter((c) => (seen.has(c.label) ? false : (seen.add(c.label), true)));
}

type Scalar = string | number | boolean | null;

const LINE_FIELDS: Record<string, 'length' | 'depth' | 'curvature' | 'continuity' | 'startZone' | 'endZone'> = {
  length: 'length',
  depth: 'depth',
  curvature: 'curvature',
  continuity: 'continuity',
  start_zone: 'startZone',
  end_zone: 'endZone',
};

const hintOf = (field: Observed<Scalar>): BandHint => ({ band: field.band ?? 'unknown', altValue: field.altValue });

/** The saved value behind a rule path, with its band: no confidence maths, no engine. */
function fieldAt(observation: PalmObservation, path: string): { value: Scalar; hint: BandHint } | null {
  const [root, second, attr, fourth] = path.split('.');
  if (root === 'hand') {
    if (second === 'shape') return { value: observation.hand.shape.value, hint: hintOf(observation.hand.shape) };
    if (second === 'side') return { value: observation.hand.side, hint: {} };
    if (second === 'is_dominant') return { value: observation.hand.isDominant, hint: {} };
    return null;
  }
  if (root === 'mount') {
    const mount = observation.mounts.find((m) => m.type === second);
    return mount && attr === 'prominence' ? { value: mount.prominence.value, hint: hintOf(mount.prominence) } : null;
  }
  if (root === 'line') {
    const line = observation.lines.find((l) => l.type === second);
    if (!line || !attr) return null;
    if (attr === 'visible') return { value: line.visible, hint: {} };
    if (attr === 'marks') {
      if (!fourth) return null;
      return { value: line.marks.filter((m) => m.kind === fourth).reduce((n, m) => n + m.count, 0), hint: {} };
    }
    const key = LINE_FIELDS[attr];
    const field = key ? line[key] : line.derived?.[attr];
    return field ? { value: field.value, hint: hintOf(field) } : null;
  }
  return null;
}

/**
 * What the palm showed for one evidence line, in the reader's language and
 * in words (DEC-019: a borderline value names both classes). Re-read from the
 * saved observation by the rule's paths, so a report saved with raw tokens
 * still reads cleanly; the stored `observed` string is only the fallback.
 */
export function observedText(
  entry: Pick<ReportEvidenceLine, 'observed' | 'paths'>,
  observation: PalmObservation | null,
  lang: 'en' | 'hi' = 'en',
): string {
  const paths = entry.paths ?? [];
  if (observation && paths.length > 0) {
    const parts = paths.map((path) => {
      const field = fieldAt(observation, path);
      return field ? featureLine(path, field.value, field.hint, lang) : null;
    });
    if (parts.every((p): p is string => p !== null)) return parts.join('; ');
  }
  return entry.observed.replace(/_/g, ' ');
}

/** "From: A, ch. 1; B, ch. 2" — the inline line under a meaning. */
export function fromLine(citations: readonly BookCitation[], lang: 'en' | 'hi' = 'en'): string {
  if (citations.length === 0) return '';
  return `${lang === 'hi' ? 'स्रोत' : 'From'}: ${citations.map((c) => c.label).join('; ')}`;
}

/** Books for a paragraph of a section: every evidence line that says it. */
export function citationsForMeaning(
  evidence: readonly ReportEvidenceLine[],
  meaning: string,
  rules: readonly KbRule[] = KNOWLEDGE_RULES,
): BookCitation[] {
  const seen = new Set<string>();
  return evidence
    .filter((entry) => entry.meaning === meaning)
    .flatMap((entry) => citationsFor(entry, rules))
    .filter((c) => (seen.has(c.label) ? false : (seen.add(c.label), true)));
}

/**
 * "Because the palm shows: heart line depth: deep" — the observed features
 * behind a meaning, shown under it with its book, so no statement stands
 * without its basis.
 */
export function becauseLine(
  evidence: readonly ReportEvidenceLine[],
  meaning: string,
  lang: 'en' | 'hi' = 'en',
  observation: PalmObservation | null = null,
): string {
  const seen = new Set<string>();
  const observed = evidence
    .filter((entry) => entry.meaning === meaning && entry.observed)
    .map((entry) => observedText(entry, observation, lang))
    .filter((o) => (seen.has(o) ? false : (seen.add(o), true)));
  if (observed.length === 0) return '';
  return `${lang === 'hi' ? 'क्योंकि हथेली पर दिखा' : 'Because the palm shows'}: ${observed.join('; ')}`;
}

/** The books behind the rule ids a deep-report observation cites; unknown ids are skipped. */
export function citationsForRuleIds(ruleIds: readonly string[], rules: readonly KbRule[] = KNOWLEDGE_RULES): BookCitation[] {
  const seen = new Set<string>();
  return ruleIds
    .map((id) => rules.find((r) => r.ruleId === id))
    .filter((rule): rule is KbRule => rule !== undefined)
    .flatMap((rule) =>
      rule.citations?.length ? fromRuleCitations(rule.citations) : rule.sourceIds.map((id) => toCitation(id, null)),
    )
    .filter((c) => (seen.has(c.label) ? false : (seen.add(c.label), true)));
}

/** What one rule says, for the evidence layer: its meaning, its hedge and its books. */
export interface RuleEvidence {
  ruleId: string;
  tradition: string;
  meaning: Bi;
  caveat: Bi | null;
  /** `provenance`: shown in Sources only, never with the reading (BUG-016). */
  caveatScope: 'consumer' | 'provenance';
  citations: BookCitation[];
}

/**
 * The rules behind a theme or section, as the reader may inspect them.
 * Hindi only where a person checked it (`hindiReviewed`); otherwise English.
 * Unknown ids are skipped rather than invented.
 */
export function rulesEvidence(ruleIds: readonly string[], rules: readonly KbRule[] = KNOWLEDGE_RULES): RuleEvidence[] {
  return ruleIds
    .map((id) => rules.find((r) => r.ruleId === id))
    .filter((rule): rule is KbRule => rule !== undefined)
    .map((rule) => {
      const hi = rule.hindiReviewed === true && rule.validationStatus === 'human_reviewed';
      const { meaning, meaningHi, caveat, caveatHi } = rule.interpretation;
      return {
        ruleId: rule.ruleId,
        tradition: rule.tradition,
        meaning: { en: meaning, hi: hi && meaningHi ? meaningHi : meaning },
        caveat: caveat ? { en: caveat, hi: hi && caveatHi ? caveatHi : caveat } : null,
        caveatScope: rule.interpretation.caveatScope ?? 'consumer',
        citations: rule.citations?.length ? fromRuleCitations(rule.citations) : rule.sourceIds.map((id) => toCitation(id, null)),
      };
    });
}

export interface HandRole {
  dominance: Dominance;
  title: Bi;
  body: Bi;
  /** How the book's right/left maps to the writing hand — tradition, said as such. */
  convention: Bi;
  citations: BookCitation[];
}

/** What the hand being read stands for, from `observation.hand.dominance` (`legacyDominance` for old readings). */
export function handRoleOf(dominance: Dominance): HandRole {
  const note = HAND_ROLE_NOTES[dominance];
  return {
    dominance,
    title: note.title,
    body: note.body,
    convention: HAND_ROLE_CONVENTION,
    citations: fromRuleCitations(note.cites),
  };
}

function lineOfPath(path: string): ReportLine | null {
  const [kind, name] = path.split('.');
  if (kind !== 'line' || !name) return null;
  return (REPORT_LINES as readonly string[]).includes(name) ? (name as ReportLine) : null;
}

/**
 * Per line: basis, and each matched meaning with its books. Pass the report
 * as presented (see localise.ts) so checked Hindi shows where it exists.
 */
export function buildLineBooks(
  report: ReadingReport,
  observation: PalmObservation,
  rules: readonly KbRule[] = KNOWLEDGE_RULES,
): LineBooks[] {
  const basis = readingBasis(observation);
  return REPORT_LINES.map((type) => {
    const seen = new Set<string>();
    const entries: BookEntry[] = [];
    for (const section of report.sections) {
      for (const entry of section.evidence) {
        const paths = entry.paths ?? [];
        if (!paths.some((p) => lineOfPath(p) === type) || seen.has(entry.ruleId)) continue;
        seen.add(entry.ruleId);
        entries.push({
          ruleId: entry.ruleId,
          observed: entry.observed,
          ...(entry.paths ? { paths: entry.paths } : {}),
          meaning: entry.meaning,
          confidence: entry.confidence,
          tradition: entry.tradition,
          citations: citationsFor(entry, rules),
        });
      }
    }
    const note = LINE_BOOK_NOTES[type];
    return {
      type,
      basis: basis.lines.find((l) => l.type === type)!,
      entries,
      note: note ? { en: note.en, hi: note.hi, citations: fromRuleCitations(note.cites) } : null,
    };
  });
}
