import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { PAGES } from '../../src/config/pages';
import { APP_RULE_IDS } from '../../src/lib/guides/app-rules';
import { BOOKS, bookLabel, isBookId } from '../../src/lib/guides/books';
import { formatDate, inlineMarkdown, plainText, stepNeighbours, STEPS, wordCount } from '../../src/lib/guides/guides';
import { isVariant, VARIANTS } from '../../src/lib/guides/palm-geometry';
import { regionView, SAMPLE, ZONES } from '../../src/lib/guides/sample-palm';

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

/** Heading anchors as the MDX build makes them (github-slugger rules for our headings). */
function slug(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s/g, '-');
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

      it('gives every card a short meaning and a self-check (template v3)', () => {
        for (const [tag] of guide.body.matchAll(/<Variation\b[^>]*>/g)) {
          const gist = tag.match(/\bgist="([^"]+)"/)?.[1];
          const check = tag.match(/\bcheck="([^"]+)"/)?.[1];
          expect(gist, tag.slice(0, 70)).toBeTruthy();
          expect(check, tag.slice(0, 70)).toBeTruthy();
          expect(wordCount(gist ?? ''), gist).toBeLessThanOrEqual(16);
        }
      });

      it('points every answer chip at a card, a heading on this page or a live page', () => {
        const hrefs = [...guide.front.matchAll(/^\s+href: '([^']+)'$/gm)].map((m) => m[1] ?? '');
        const headings = [...guide.body.matchAll(/^##+ (.+)$/gm)].map((m) => slug(m[1] ?? ''));
        const cards = [...guide.body.matchAll(/<Variation\b[^>]*>/g)].map(
          ([tag]) => tag.match(/\bid="([^"]+)"/)?.[1] ?? `type-${tag.match(/\bvariant="([^"]+)"/)?.[1] ?? ''}`,
        );
        for (const href of hrefs) {
          if (href.startsWith('#')) expect([...cards, ...headings], href).toContain(href.slice(1));
          else expect(PAGES.some((page) => page.path === href), href).toBe(true);
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

describe('the sample palm (Find your line module)', () => {
  const { crop } = SAMPLE;
  const inside = (x: number, y: number) => x >= crop.x && x <= crop.x + crop.w && y >= crop.y && y <= crop.y + crop.h;

  it('keeps every zone, label and pin on the part of the photo that is shown', () => {
    for (const [name, zone] of Object.entries(ZONES)) {
      expect(inside(zone.cx, zone.cy), `${name} centre`).toBe(true);
      expect(inside(zone.labelX, zone.labelY) && inside(zone.labelX, zone.labelY + 62), `${name} label`).toBe(true);
      expect(inside(zone.pinX, zone.pinY), `${name} pin`).toBe(true);
    }
    expect(crop.x + crop.w).toBeLessThanOrEqual(SAMPLE.width);
    expect(crop.y + crop.h).toBeLessThanOrEqual(SAMPLE.height);
  });

  it('marks areas, never traced lines, while no real scan of this photo exists', () => {
    expect(regionView('heart')).toMatchObject({ mode: 'area', source: 'guide' });
    expect(regionView('all').mode).toBe('pins');
    expect(regionView('all').zones).toHaveLength(4);
    expect(regionView('none').zones).toHaveLength(0);
  });
});

describe('/hand-lines/, the palm lines hub (SEMANTIC_SEO_PLAN.md U2, WEB-DEC-051)', () => {
  const hub = guides.find((guide) => guide.file === 'hand-lines.mdx')!;
  const h3s = [...hub.body.matchAll(/^### (.+)$/gm)].map((m) => m[1]);

  it('sits under /palm-reading/ in the breadcrumb and answers "what are the lines called" first', () => {
    expect(scalar(hub.front, 'parent')).toBe('/palm-reading/');
    expect(scalar(hub.front, 'answer')).toMatch(/^The lines on your palm are called the heart line, head line and life line/);
  });

  it('covers the six missing minor lines, each attributed to a named book, with no reading the honesty rules ban', () => {
    for (const name of ['Girdle of Venus', 'Intuition line', 'Travel lines', 'Line of Mars (sister line)', 'Ring of Solomon', 'Via lasciva']) {
      expect(h3s, name).toContain(name);
      const section = hub.body.split(`### ${name}\n`)[1]!.trim().split('\n\n')[0]!;
      expect(section, name).toMatch(/Cheiro/);
      expect(wordCount(plainText(section)), name).toBeLessThanOrEqual(80);
    }
    expect(hub.body).not.toMatch(/\b(death|danger|sensual|drugs?|insanity)\b/i);
    expect(hub.front).toMatch(/ch\. XI: The Girdle of Venus.*ch\. XII: The Line of Intuition and the Via Lasciva.*ch\. XIII: La Croix Mystique, the Ring of Solomon.*ch\. XIV: Travels/);
  });

  it('has a Hindi names table, flags the names that wait for the Hindi reviewer, and answers "how many lines"', () => {
    for (const hindi of ['हृदय रेखा', 'मस्तिष्क रेखा', 'जीवन रेखा', 'भाग्य रेखा', 'शुक्र वलय', 'यात्रा रेखा']) expect(hub.body).toContain(`<Hi>${hindi}</Hi>`);
    expect(hub.body).toMatch(/\(shukra valay\)\*/);
    expect(hub.body).toMatch(/still wait for a check by our Hindi reviewer/);
    expect(h3s).toContain('How many lines are on your palm?');
    expect(hub.body).not.toMatch(/^## Want to see your own lines traced\?/m);
  });

  it('shows the two simple charts as real image files, labels on the lines, no numbered legend (owner 2026-10-01)', () => {
    expect(hub.body).toContain('<DiagramFigure id="four-main-palm-lines-chart" />');
    expect(hub.body).toContain('<DiagramFigure id="minor-palm-lines-chart" />');
    expect(hub.body).not.toMatch(/PalmChart|palm-reading-chart-lines/);
    const dir = join(process.cwd(), 'public', 'img', 'diagrams');
    for (const id of ['four-main-palm-lines-chart', 'minor-palm-lines-chart']) {
      for (const end of ['.png', '.webp', '.avif', '-900.webp', '-900.avif', '-tall.webp', '-tall.avif']) expect(readdirSync(dir), id + end).toContain(id + end);
      const png = readFileSync(join(dir, `${id}.png`));
      expect(png.readUInt32BE(16), 'PNG width').toBeGreaterThanOrEqual(1600);
    }
    expect(readdirSync(dir).some((file) => file.startsWith('palm-reading-chart-lines'))).toBe(false);
  });

  it('names its targets in the chip links (anchor rule R2)', () => {
    for (const line of ['Heart', 'Head', 'Life', 'Fate']) expect(hub.front).toContain(`link: '${line} line meaning'`);
  });
});
