import { bookTradition, type Cite } from './sources';

/**
 * Line meaning finders (tools 4–7) — pure logic.
 *
 * The person answers a few questions about their line; each answer sets one
 * feature (the same features the app's scan records: length, depth, curve,
 * continuity, start and end zone, forks). Rules are a hand-copied subset of
 * the app's corpus rules (`src/features/knowledge/corpus-rules.ts`, read
 * 2026-09-26), each keeping its app `ruleId`, its meaning word for word and
 * its book citations, so a finder result says exactly what the app says.
 * Caveats: only the ones the app shows with a reading ("consumer" scope);
 * refusals of health, lifespan or harsh claims stay in the app's provenance
 * layer and are summed up once in the page's limits box instead.
 * To be replaced by the synced `lib/palm` copy when WEB-FEAT-018 lands.
 */

export type LineName = 'heart' | 'head' | 'life' | 'fate';
export type Feature =
  | 'visible'
  | 'length'
  | 'depth'
  | 'curvature'
  | 'continuity'
  | 'start'
  | 'end'
  | 'join'
  | 'fork'
  | 'branchUp'
  | 'double';
export type FeatureValue = string | number | boolean;
export type Observation = Partial<Record<Feature, FeatureValue>>;

export interface Condition {
  feature: Feature;
  op: 'eq' | 'in' | 'gte';
  value: FeatureValue | readonly string[];
}

export interface LineRule {
  /** The app's ruleId (corpus-rules.ts). */
  id: string;
  tradition: 'western' | 'indian';
  when: readonly Condition[];
  /** The app's meaning, word for word. */
  meaning: string;
  /** The app's caveat when it is shown with a reading; null otherwise. */
  caveat: string | null;
  cites: readonly Cite[];
}

/** A book passage for a feature the app has no rule for (CONTENT_GUIDE.md §9.4). */
export interface BookNote {
  id: string;
  when: readonly Condition[];
  text: string;
  cites: readonly Cite[];
}

/** A small drawing of the option on the stylised palm. */
export interface ThumbPath {
  d: string;
  line: LineName;
  style?: 'thick' | 'thin' | 'chain';
}

export interface FinderOption {
  value: string;
  label: string;
  /** How the result names it: "Ends under the index finger". */
  evidence: string;
  set: Observation;
  thumb?: readonly ThumbPath[];
}

export interface FinderQuestion {
  id: string;
  legend: string;
  help?: string;
  options: readonly FinderOption[];
}

export interface LineFinder {
  line: LineName;
  questions: readonly FinderQuestion[];
  rules: readonly LineRule[];
  notes?: readonly BookNote[];
  /** An answer that makes the other answers irrelevant (e.g. "I can't see a fate line"). */
  exclusive?: { feature: Feature; value: FeatureValue };
}

export type Answers = Record<string, string | undefined>;

/** Value of "Not sure" in every question: it sets nothing. */
export const NOT_SURE = 'not-sure';

export function matches(condition: Condition, obs: Observation): boolean {
  const actual = obs[condition.feature];
  if (actual === undefined) return false;
  switch (condition.op) {
    case 'eq':
      return actual === condition.value;
    case 'in':
      return Array.isArray(condition.value) && (condition.value as readonly string[]).includes(String(actual));
    case 'gte':
      return typeof actual === 'number' && typeof condition.value === 'number' && actual >= condition.value;
    default:
      return false;
  }
}

/** The observation built from the answers (unanswered and "Not sure" set nothing). */
export function observationFrom(finder: LineFinder, answers: Answers): Observation {
  const obs: Observation = {};
  for (const question of finder.questions) {
    const picked = answers[question.id];
    if (!picked || picked === NOT_SURE) continue;
    const option = question.options.find((item) => item.value === picked);
    if (option) Object.assign(obs, option.set);
  }
  const exclusive = finder.exclusive;
  if (exclusive && obs[exclusive.feature] === exclusive.value) return { [exclusive.feature]: exclusive.value };
  return obs;
}

export interface ResultGroup {
  /** The features this group's rules read, e.g. ["end"] or ["length", "continuity"]. */
  features: Feature[];
  /** What the person picked, in words. */
  evidence: string[];
  readings: LineRule[];
  notes: BookNote[];
  /** True when books from both traditions read this feature: both are shown. */
  traditionsDiffer: boolean;
}

export interface FinderResult {
  answered: number;
  groups: ResultGroup[];
}

const featuresOf = (when: readonly Condition[]): Feature[] => [...new Set(when.map((c) => c.feature))];

/** Every rule (and book note) whose conditions all hold, grouped by the feature(s) they read. */
export function evaluate(finder: LineFinder, answers: Answers): FinderResult {
  const obs = observationFrom(finder, answers);
  const answered = finder.questions.filter((q) => answers[q.id] && answers[q.id] !== NOT_SURE).length;
  const groups = new Map<string, ResultGroup>();
  const groupFor = (features: Feature[]): ResultGroup => {
    const key = [...features].sort().join('+');
    let group = groups.get(key);
    if (!group) {
      group = { features, evidence: evidenceFor(finder, answers, features), readings: [], notes: [], traditionsDiffer: false };
      groups.set(key, group);
    }
    return group;
  };
  for (const rule of finder.rules) {
    if (rule.when.every((condition) => matches(condition, obs))) groupFor(featuresOf(rule.when)).readings.push(rule);
  }
  for (const note of finder.notes ?? []) {
    if (note.when.every((condition) => matches(condition, obs))) groupFor(featuresOf(note.when)).notes.push(note);
  }
  const order = (group: ResultGroup) => {
    // Single features first, in question order; combinations ("taken together") after.
    const first = Math.min(...group.features.map((feature) => questionIndex(finder, feature)));
    return (group.features.length > 1 ? 1000 : 0) + first;
  };
  const list = [...groups.values()].sort((a, b) => order(a) - order(b));
  for (const group of list) {
    const traditions = new Set(group.readings.flatMap((rule) => rule.cites.map((cite) => bookTradition(cite.book))));
    group.traditionsDiffer = traditions.size > 1;
  }
  return { answered, groups: list };
}

function questionIndex(finder: LineFinder, feature: Feature): number {
  const index = finder.questions.findIndex((q) => q.options.some((option) => feature in option.set));
  return index === -1 ? 999 : index;
}

function evidenceFor(finder: LineFinder, answers: Answers, features: Feature[]): string[] {
  const out: string[] = [];
  for (const question of finder.questions) {
    const option = question.options.find((item) => item.value === answers[question.id]);
    if (option && features.some((feature) => feature in option.set) && !out.includes(option.evidence)) out.push(option.evidence);
  }
  return out;
}

/**
 * "What palmistry says" (CONTENT_GUIDE.md §6 block 7): one line per option,
 * taken from the first single-feature rule that reads it. Options with no
 * rule are left out (never filled in by us).
 */
export function summaries(finder: LineFinder): { question: string; option: FinderOption; rule: LineRule }[] {
  const out: { question: string; option: FinderOption; rule: LineRule }[] = [];
  for (const question of finder.questions) {
    for (const option of question.options) {
      const rule = finder.rules.find(
        (item) => item.when.length === 1 && item.when.every((condition) => matches(condition, option.set)),
      );
      if (rule) out.push({ question: question.legend, option, rule });
    }
  }
  return out;
}

/**
 * The app's rule for which caveats are provenance (refusals), not reading
 * (`isProvenanceCaveat` in corpus-rules.ts). The finder data must hold none of them.
 */
export const PROVENANCE_CAVEAT =
  /health|fertil|length of life|long life|lifespan|children|marriage|refused|left out|not claimed|not repeated|count of years|bodily|desire|passion|harsh|gloom|melanchol|sadness|selfish|trick|quarrel|vanity|dominate|coldness/i;
