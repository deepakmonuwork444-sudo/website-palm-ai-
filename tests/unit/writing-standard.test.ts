import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { AI_PHRASES, copyOfSource, isAllowed, sourceProblems, WRITING_ALLOW, writingProblems } from '../../src/lib/writing-standard';

/** The owner's writing standard (2026-10-01, CONTENT_GUIDE.md §15, WEB-DEC-057). */

const rules = (text: string) => writingProblems(text).map((problem) => `${problem.rule}:${problem.match}`);

describe('dashes', () => {
  it('rejects every em dash', () => {
    expect(rules('Love — and loss.')).toEqual(['em-dash:—']);
  });

  it('allows an en dash only inside a number range', () => {
    expect(rules('1,200–1,800 words, 1886–1916, pp. 87–90, chs. VI–VIII, ₹199–₹349, ages 20 – 30')).toEqual([]);
    expect(rules('heart – head')).toEqual(['en-dash:–']);
    expect(rules('Online – See your lines')).toEqual(['en-dash:–']);
  });

  it('rejects a spaced hyphen used as a dash, not a hyphenated word or a list item', () => {
    expect(rules('the line - and its fork')).toEqual(['spaced-hyphen: - ']);
    expect(rules('the line -- and its fork')).toEqual(['spaced-hyphen: -- ']);
    expect(rules('a well-made, left-hand line\n- a list item')).toEqual([]);
  });
});

describe('AI-sounding phrases', () => {
  it('covers the owner’s list', () => {
    const listed = AI_PHRASES.map((item) => item.phrase);
    for (const phrase of [
      'delve', 'tapestry', 'testament to', "in today's world", 'in the realm of', 'embark', 'unleash', 'unlock the secrets',
      'navigate the complexities', "it's important to note", 'it is worth noting', "let's dive", 'dive into', 'look no further',
      "whether you're a", 'game-changer', 'seamless', 'elevate', 'vibrant', 'intricate', 'multifaceted', 'myriad', 'pivotal',
      'robust', 'leverage', 'holistic', 'nuanced', 'comprehensive guide', 'ultimate guide', 'in conclusion', 'moreover',
      'furthermore', 'additionally', 'plethora', 'bustling', 'beacon', 'harness the power', 'a journey of', 'ever-evolving', 'crucial role',
    ]) {
      expect(listed, phrase).toContain(phrase);
    }
  });

  it('matches whole words in any case, with curly or straight apostrophes', () => {
    expect(rules('Moreover, let’s dive into it. It’s important to note.')).toEqual([
      'ai-phrase:Moreover',
      'ai-phrase:let’s dive',
      'ai-phrase:dive into',
      'ai-phrase:It’s important to note',
    ]);
    expect(rules('Elevated mounts; delving; Whether you’re a beginner')).toEqual(['ai-phrase:Elevated', 'ai-phrase:delving', 'ai-phrase:Whether you’re a']);
    // Not inside other words.
    expect(rules('robustness, leveraged-buyout aside: diver, beaconsfield')).toEqual(['ai-phrase:leveraged']);
  });
});

describe('source files', () => {
  it('skips code comments and keeps line numbers', () => {
    const ts = "// a — b\nconst a = 'x';\n/* — */\nconst b = 'y — z';";
    expect(sourceProblems('x.ts', ts, 'ts').map((p) => `${p.line}:${p.rule}`)).toEqual(['4:em-dash']);
    expect(copyOfSource("const u = 'https://palmsays.com/';", 'ts')).toContain('https://palmsays.com/');
    const mdx = "---\ntitle: 'A — B'\n---\nimport X from './x';\n{/* — */}\nText — more.";
    expect(sourceProblems('x.mdx', mdx, 'mdx').map((p) => `${p.line}:${p.rule}`)).toEqual(['2:em-dash', '6:em-dash']);
  });

  it('honours a reviewed allow-list entry for that file and sentence only', () => {
    const allow = [{ file: 'a.mdx', rule: 'ai-phrase' as const, text: 'The Ultimate Guide to Hands', reason: 'a book title' }];
    const [problem] = writingProblems('Read The Ultimate Guide to Hands (1901).');
    expect(problem).toBeDefined();
    if (!problem) return;
    expect(isAllowed('a.mdx', problem, 'Read The Ultimate Guide to Hands (1901).', allow)).toBe(true);
    expect(isAllowed('b.mdx', problem, 'Read The Ultimate Guide to Hands (1901).', allow)).toBe(false);
    for (const entry of WRITING_ALLOW) expect(entry.reason.length, entry.text).toBeGreaterThan(10);
  });

  it('passes on the UI strings (src/i18n, guide template strings)', () => {
    for (const file of ['src/i18n/en.ts', 'src/i18n/hi.ts', 'src/lib/guides/strings.ts']) {
      const problems = sourceProblems(file, readFileSync(join(process.cwd(), file), 'utf8'), 'ts');
      expect(problems.map((p) => `${file}:${p.line} ${p.message}`)).toEqual([]);
    }
  });
});
