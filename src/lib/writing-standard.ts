/**
 * The owner's writing standard (2026-10-01, CONTENT_GUIDE.md §15, WEB-DEC-057): one shared list
 * and one checker, used by scripts/check-web.mjs (source files + built pages) and the unit tests.
 * Pure functions only (Node loads this file directly, so no TS-only runtime syntax).
 *
 * Rules (all ERRORS):
 * 1. No em dash (U+2014) in visible copy or front matter. Use a comma, full stop, colon or brackets.
 * 2. En dash (U+2013) only inside a number range: `1,200–1,800`, `1886–1916`, `pp. 87–90`, `chs. VI–VIII`.
 * 3. No spaced hyphen (` - ` or ` -- `) used as a dash between words.
 * 4. No AI-sounding phrase from AI_PHRASES (case-insensitive, whole words).
 *
 * A real false positive (a quoted book title, a verbatim quote) goes in WRITING_ALLOW with a reason;
 * the rule itself is never weakened.
 */

export type WritingRule = 'em-dash' | 'en-dash' | 'spaced-hyphen' | 'ai-phrase';

export interface WritingProblem {
  rule: WritingRule;
  /** The matched text. */
  match: string;
  /** Index of the match in the checked text. */
  index: number;
  message: string;
}

export interface AiPhrase {
  /** The phrase as written in CONTENT_GUIDE.md §15. */
  phrase: string;
  /** Whole-word, case-insensitive pattern (word forms included where they read the same). */
  pattern: RegExp;
  /** What to write instead. */
  instead: string;
}

/** Straight or curly apostrophe. */
const APOS = "['’]";
const phrase = (text: string, pattern: string, instead: string): AiPhrase => ({
  phrase: text,
  pattern: new RegExp(`(?<![\\p{L}\\p{N}])(?:${pattern})(?![\\p{L}\\p{N}])`, 'iu'),
  instead,
});

/** AI-sounding words and phrases (owner, 2026-10-01). Keep in step with CONTENT_GUIDE.md §15.2. */
export const AI_PHRASES: readonly AiPhrase[] = [
  phrase('delve', 'delv(?:e|es|ed|ing)', 'look at, explain'),
  phrase('tapestry', 'tapestr(?:y|ies)', 'mix, set'),
  phrase('testament to', 'testament to', 'shows'),
  phrase("in today's world", `in today${APOS}s (?:world|age|fast-paced world)`, 'today, now'),
  phrase('in the realm of', 'in the realm of', 'in'),
  phrase('embark', 'embark(?:s|ed|ing)?', 'start'),
  phrase('unleash', 'unleash(?:es|ed|ing)?', 'use, show'),
  phrase('unlock the secrets', 'unlock(?:s|ing)? the (?:secrets|mysteries|power)', 'learn, read'),
  phrase('navigate the complexities', 'navigat(?:e|es|ing) the complexit(?:y|ies)', 'deal with'),
  phrase("it's important to note", `it${APOS}s important to note|it is important to note`, '(say the fact)'),
  phrase('it is worth noting', `it is worth noting|it${APOS}s worth noting`, '(say the fact)'),
  phrase("let's dive", `let${APOS}s dive|let us dive`, '(start with the answer)'),
  phrase('dive into', 'div(?:e|es|ing) (?:deep )?into|deep dive', 'look at'),
  phrase('look no further', 'look no further', '(cut it)'),
  phrase("whether you're a", `whether you${APOS}re an?|whether you are an?`, '(name the reader)'),
  phrase('game-changer', 'game[- ]?chang(?:er|ers|ing)', 'big change'),
  phrase('seamless', 'seamless(?:ly)?', 'smooth, easy'),
  phrase('elevate', 'elevat(?:e|es|ed|ing)', 'raise, improve'),
  phrase('vibrant', 'vibrant(?:ly)?', 'bright, lively'),
  phrase('intricate', 'intricate(?:ly)?', 'detailed, complex'),
  phrase('multifaceted', 'multi-?faceted', 'many-sided'),
  phrase('myriad', 'myriad', 'many'),
  phrase('pivotal', 'pivotal', 'key, central'),
  phrase('robust', 'robust(?:ly)?', 'strong'),
  phrase('leverage', 'leverag(?:e|es|ed|ing)', 'use'),
  phrase('holistic', 'holistic(?:ally)?', 'whole'),
  phrase('nuanced', 'nuanced', 'careful, subtle'),
  phrase('comprehensive guide', 'comprehensive guide', 'guide'),
  phrase('ultimate guide', 'ultimate guide', 'guide'),
  phrase('in conclusion', 'in conclusion', '(cut it)'),
  phrase('moreover', 'moreover', 'also'),
  phrase('furthermore', 'furthermore', 'also'),
  phrase('additionally', 'additionally', 'also'),
  phrase('plethora', 'plethora', 'many'),
  phrase('bustling', 'bustling', 'busy'),
  phrase('beacon', 'beacons?', '(cut it)'),
  phrase('harness the power', 'harness(?:es|ing)? the power', 'use'),
  phrase('a journey of', 'a journey of', '(cut it)'),
  phrase('ever-evolving', 'ever[- ]evolving', 'changing'),
  phrase('crucial role', 'crucial role', 'big part'),
];

/**
 * Known, reviewed false positives. `file` is a repo path (or a built page path such as `/blog/x/`);
 * `text` is a snippet of the exact sentence that may keep the match. Every entry needs a reason.
 */
export interface WritingAllow {
  file: string;
  rule: WritingRule;
  text: string;
  reason: string;
}

export const WRITING_ALLOW: readonly WritingAllow[] = [];

/** A token that can sit on either side of a range dash: a number (with currency) or a Roman numeral. */
const RANGE_LEFT = /(?:\d[\d,.]*|\b[IVXLCDM]+|\b[ivxlcdm]+)\s*$/u;
const RANGE_RIGHT = /^\s*(?:[₹$£€]?\d|[IVXLCDM]+\b|[ivxlcdm]+\b)/u;

/** Every problem in a piece of copy (no comments, no code). */
export function writingProblems(text: string): WritingProblem[] {
  const problems: WritingProblem[] = [];
  for (const m of text.matchAll(/—/gu)) {
    problems.push({ rule: 'em-dash', match: '—', index: m.index, message: 'em dash: use a comma, full stop, colon or brackets' });
  }
  for (const m of text.matchAll(/–/gu)) {
    const before = text.slice(Math.max(0, m.index - 24), m.index);
    const after = text.slice(m.index + 1, m.index + 25);
    if (RANGE_LEFT.test(before) && RANGE_RIGHT.test(after)) continue;
    problems.push({ rule: 'en-dash', match: '–', index: m.index, message: 'en dash outside a number range: use a comma, colon or "to"' });
  }
  for (const m of text.matchAll(/(?<=[\p{L}\p{M}\p{N})’'".,]) -{1,2} (?=[\p{L}\p{N}(‘'"])/gu)) {
    problems.push({ rule: 'spaced-hyphen', match: m[0], index: m.index, message: 'spaced hyphen used as a dash: use a comma, colon or brackets' });
  }
  for (const item of AI_PHRASES) {
    const global = new RegExp(item.pattern.source, 'giu');
    for (const m of text.matchAll(global)) {
      problems.push({ rule: 'ai-phrase', match: m[0], index: m.index, message: `AI-sounding phrase "${m[0]}" (instead: ${item.instead})` });
    }
  }
  return problems.sort((a, b) => a.index - b.index);
}

/** The line (1-based) of an index in a text. */
export function lineAt(text: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i += 1) if (text.charCodeAt(i) === 10) line += 1;
  return line;
}

/** The text around an index, on one line, for messages and allow-list matching. */
export function contextAt(text: string, index: number, radius = 60): string {
  return text
    .slice(Math.max(0, index - radius), index + radius)
    .replace(/\s+/g, ' ')
    .trim();
}

const blank = (match: string) => match.replace(/[^\n]/g, ' ');

/**
 * The copy of a source file with code comments, imports and exports blanked out (line numbers kept).
 * `mdx`: `{/* … *\/}`, `<!-- … -->`, `import`/`export` lines. `ts`: block and line comments.
 */
export function copyOfSource(source: string, kind: 'mdx' | 'ts'): string {
  const text = source.replace(/\r\n/g, '\n');
  if (kind === 'mdx') {
    return text
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, blank)
      .replace(/<!--[\s\S]*?-->/g, blank)
      .replace(/^(?:import|export)\s.*$/gm, blank);
  }
  return text.replace(/\/\*[\s\S]*?\*\//g, blank).replace(/(^|[^:'"`\\])\/\/.*$/gm, (m, lead: string) => lead + blank(m.slice(lead.length)));
}

/** True when a reviewed allow-list entry covers this problem. */
export function isAllowed(file: string, problem: WritingProblem, context: string, allow: readonly WritingAllow[] = WRITING_ALLOW): boolean {
  return allow.some((entry) => entry.file === file && entry.rule === problem.rule && context.includes(entry.text));
}

/** Problems in one source file's copy, with line numbers, minus allow-listed ones. */
export function sourceProblems(
  file: string,
  source: string,
  kind: 'mdx' | 'ts',
  allow: readonly WritingAllow[] = WRITING_ALLOW,
): (WritingProblem & { line: number; context: string })[] {
  const copy = copyOfSource(source, kind);
  return writingProblems(copy)
    .map((problem) => ({ ...problem, line: lineAt(copy, problem.index), context: contextAt(copy, problem.index) }))
    .filter((problem) => !isAllowed(file, problem, problem.context, allow));
}
