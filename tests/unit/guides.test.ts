import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { PAGES } from '../../src/config/pages';
import { APP_RULE_IDS } from '../../src/lib/guides/app-rules';
import { BOOKS, bookLabel, isBookId } from '../../src/lib/guides/books';
import { formatDate, inlineMarkdown, plainText, stepNeighbours, STEPS, wordCount } from '../../src/lib/guides/guides';
import { isVariant, VARIANTS } from '../../src/lib/guides/palm-geometry';

/**
 * Guide content rules the zod schema can't express (CONTENT_GUIDE.md §4, §5,
 * §9.3): answer-first length, rule ids and books that exist, drawings that
 * exist, the limits box (high up on YMYL pages), Devanagari only inside <Hi>,
 * every guide registered in the page registry.
 */

const DIR = join(process.cwd(), 'src', 'content', 'guides');
const files = readdirSync(DIR).filter((name) => name.endsWith('.mdx'));

interface Guide {
  file: string;
  front: string;
  body: string;
}

const guides: Guide[] = files.map((file) => {
  const raw = readFileSync(join(DIR, file), 'utf8').replace(/\r\n/g, '\n');
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error(`${file}: no front matter`);
  return { file, front: match[1] ?? '', body: match[2] ?? '' };
});

/** A one-line scalar from the front matter (quoted or not). */
function scalar(front: string, key: string): string | undefined {
  const line = front.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'))?.[1]?.trim();
  if (line === undefined) return undefined;
  return line.replace(/^'(.*)'$/, '$1').replace(/^"(.*)"$/, '$1').replace(/''/g, "'");
}

/** The items of a front-matter block list (`key:` then `  - item` lines). */
function list(front: string, key: string): string[] {
  const block = front.match(new RegExp(`^${key}:\\s*\\n((?:\\s+- .*\\n?)+)`, 'm'))?.[1] ?? '';
  return [...block.matchAll(/^\s+- (.*)$/gm)].map((m) => (m[1] ?? '').trim().replace(/^['"]|['"]$/g, ''));
}

describe('guide files', () => {
  it('there are guides to check', () => {
    expect(guides.length).toBeGreaterThanOrEqual(9);
  });

  for (const guide of guides) {
    describe(guide.file, () => {
      const path = scalar(guide.front, 'path');

      it('is registered as an English page in src/config/pages.ts', () => {
        expect(path).toMatch(/^\/[a-z0-9/-]+\/$/);
        const page = PAGES.find((entry) => entry.path === path);
        expect(page, `${path} missing from PAGES`).toBeDefined();
        expect(page?.locale).toBe('en');
      });

      it('answers first in 40 words or fewer', () => {
        const answer = scalar(guide.front, 'answer');
        expect(answer, 'answer must be a one-line string').toBeTruthy();
        expect(wordCount(plainText(answer ?? ''))).toBeLessThanOrEqual(40);
      });

      it('cites only rules the app has', () => {
        for (const id of list(guide.front, 'ruleIds')) expect(APP_RULE_IDS, `unknown rule ${id}`).toContain(id);
      });

      it('cites only books from the app catalogue', () => {
        const ids = [
          ...[...guide.front.matchAll(/book:\s*([\w-]+)/g)].map((m) => m[1] ?? ''),
          ...[...guide.body.matchAll(/src=\{\[([^\]]*)\]\}/g)].flatMap((m) => [...(m[1] ?? '').matchAll(/'([^']+)'/g)].map((q) => q[1] ?? '')),
        ];
        for (const id of ids) expect(isBookId(id), `unknown book ${id}`).toBe(true);
      });

      it('uses only drawings that exist', () => {
        const names = [
          ...[...guide.body.matchAll(/\bvariant="([^"]+)"/g)].map((m) => m[1] ?? ''),
          ...(scalar(guide.front, 'figureVariant') ? [scalar(guide.front, 'figureVariant') ?? ''] : []),
        ];
        for (const name of names) expect(isVariant(name), `unknown drawing ${name}`).toBe(true);
      });

      it('has the limits box, high on the page when the topic is sensitive', () => {
        const at = guide.body.indexOf('<LimitsBox');
        expect(at).toBeGreaterThan(-1);
        if (/^ymyl:\s*(lifespan|marriage|health|children)/m.test(guide.front)) {
          expect(at / guide.body.length, 'YMYL: limits box in the first half').toBeLessThan(0.5);
        }
      });

      it('puts Devanagari in the body only inside <Hi> (English pages load no Devanagari font)', () => {
        const outside = guide.body.replace(/<Hi>[\s\S]*?<\/Hi>/g, '');
        expect(outside).not.toMatch(/[ऀ-ॿ]/);
      });

      it('uses no banned wording outside a marked denial', () => {
        // The keyword list and the blueprint meta may hold searched phrases ("is palmistry accurate");
        // everything a reader sees in the body, answer, facts and FAQ is checked.
        const front = guide.front.replace(/^keyword:\n(?:\s+.*\n?)*/m, '').replace(/^description:.*$/m, '');
        const text = `${front}\n${guide.body}`.replace(/<span data-denial>[\s\S]*?<\/span>/g, '');
        for (const word of [/\bguaranteed\b/i, /\bdestined\b/i, /100%/, /\baccurate\b/i, /\bAI palmist\b/i, /\bhurry\b/i, /\bunlock your destiny\b/i]) {
          expect(text).not.toMatch(word);
        }
      });
    });
  }
});

describe('guide helpers', () => {
  it('renders trusted inline markdown and escapes everything else', () => {
    expect(inlineMarkdown('See [the heart line](/heart-line/) **now**')).toBe(
      'See <a class="text-link" href="/heart-line/">the heart line</a> <strong>now</strong>',
    );
    expect(inlineMarkdown('<script>x</script>')).toBe('&lt;script&gt;x&lt;/script&gt;');
    expect(inlineMarkdown('[bad](javascript:alert(1))')).not.toContain('href');
  });

  it('marks Devanagari with lang="hi" and the system font on English pages only', () => {
    expect(inlineMarkdown('हृदय रेखा (hriday rekha)')).toBe('<span lang="hi" class="script-system">हृदय रेखा</span> (hriday rekha)');
    expect(inlineMarkdown('हृदय रेखा', 'hi')).toBe('हृदय रेखा');
  });

  it('gives JSON-LD the same words as the page', () => {
    expect(plainText('Read [which hand](/which-hand-to-read/) **first**')).toBe('Read which hand first');
  });

  it('counts words in both scripts', () => {
    expect(wordCount('The heart line’s end')).toBe(4);
    expect(wordCount('हाथ की रेखा')).toBe(3);
  });

  it('skips steps whose page is not live yet', () => {
    const live = (path: string) => !['/hand-types/', '/palm-mounts/'].includes(path);
    expect(stepNeighbours(1, live).next?.n).toBe(3);
    expect(stepNeighbours(3, live).prev?.n).toBe(1);
    expect(stepNeighbours(6, live).next).toBeUndefined();
    expect(STEPS).toHaveLength(7);
  });

  it('formats dates without time-zone drift', () => {
    expect(formatDate('2026-09-26', 'en')).toBe('26 September 2026');
    expect(formatDate('2026-01-01', 'hi')).toBe('1 जनवरी 2026');
  });

  it('knows every book by author, title and year', () => {
    expect(bookLabel('cheiro-palmistry-for-all-1916')).toBe('Cheiro, Palmistry for All (1916)');
    expect(isBookId('hast-rekha-general')).toBe(false);
    for (const book of Object.values(BOOKS)) expect(book.year).toBeGreaterThan(1800);
  });

  it('draws every variant with at least one known kind', () => {
    for (const [name, variant] of Object.entries(VARIANTS)) {
      expect(['heart', 'head', 'life', 'fate', 'minor'], name).toContain(variant.kind);
    }
  });
});
