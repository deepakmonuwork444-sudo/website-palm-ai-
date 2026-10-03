import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { PAGES } from '../../src/config/pages';
import { diagram, diagramFiles } from '../../src/lib/diagrams';
import { PAGE_ENTITIES, entity } from '../../src/lib/entities';

/**
 * Semantic SEO Phase 3, guides B (SEMANTIC_SEO_PLAN.md §6.2 N-12, N-13, N-17, N-19; WEB-FEAT-036/045/058):
 * /life-line/broken/, /mercury-line/, /children-line/, /history-of-palmistry/. The YMYL handling
 * (CONTENT_GUIDE.md §4), the owner's writing standard of 2026-10-01 (no em dash, no AI-sounding words,
 * short paragraphs) and the publishing guard (a YMYL page ships only with status owner-ok).
 */

const ROOT = process.cwd();
const read = (path: string) => readFileSync(join(ROOT, path), 'utf8').replace(/\r\n/g, '\n');

interface Page {
  path: string;
  file: string;
  parent: string;
  ymyl: 'none' | 'lifespan' | 'health' | 'children';
  /** The first body H2 (YMYL: the fear or the medical answer comes first). */
  first: string;
  diagram?: string;
  /** Words the answer-first sentence must open with. */
  opens: RegExp;
}

const PAGES_B: Page[] = [
  {
    path: '/life-line/broken/',
    file: 'life-line-broken.mdx',
    parent: '/life-line/',
    ymyl: 'lifespan',
    first: 'Does a broken life line mean death or an accident?',
    diagram: 'broken-life-line-types',
    opens: /^A broken life line is not a sign of death, illness or an accident\./,
  },
  {
    path: '/mercury-line/',
    file: 'mercury-line.mdx',
    parent: '/hand-lines/',
    ymyl: 'health',
    first: 'Is the Mercury line a health line? Not a medical test',
    diagram: 'mercury-line-path',
    opens: /^The Mercury line is a line that runs up the palm towards the little finger\. It is not a medical test/,
  },
  {
    path: '/children-line/',
    file: 'children-line.mdx',
    parent: '/hand-lines/',
    ymyl: 'children',
    first: 'Can palm lines tell how many children you will have?',
    diagram: 'children-lines-position',
    opens: /^No line on your palm can tell whether you’ll have children, or how many\./,
  },
  {
    path: '/history-of-palmistry/',
    file: 'history-of-palmistry.mdx',
    parent: '/palm-reading/',
    ymyl: 'none',
    first: 'Where did palmistry originate?',
    opens: /^Nobody knows exactly where palmistry began\./,
  },
];

const AI_WORDS =
  /\b(delve|tapestry|testament|realm|embark|unleash|unlock the secrets|navigate|it[’']s important to note|dive into|look no further|whether you[’']re|seamless|elevate|vibrant|intricate|myriad|pivotal|robust|leverage|holistic|nuanced|comprehensive|ultimate guide|in conclusion|moreover|furthermore|additionally|journey|crucial)\b/i;

for (const page of PAGES_B) {
  const raw = read(`src/content/guides/${page.file}`);
  const [, front = '', body = ''] = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/) ?? [];
  const h2s = [...body.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
  const answer = front.match(/^answer: '(.*)'$/m)?.[1] ?? '';

  describe(page.path, () => {
    it('is registered in the guides sitemap, under its parent, with its about term owned by this page', () => {
      const entry = PAGES.find((p) => p.path === page.path);
      expect(entry).toMatchObject({ indexable: true, sitemap: 'guides', locale: 'en' });
      expect(front).toMatch(new RegExp(`^parent: ${page.parent}$`, 'm'));
      const about = PAGE_ENTITIES[page.path]?.about ?? [];
      expect(about.length).toBeGreaterThan(0);
      if (page.path !== '/history-of-palmistry/') expect(entity(about[0]!).owner).toBe(page.path);
    });

    it('is checked, not owner-ok: a YMYL page waits for the owner before a production build', () => {
      expect(front).toMatch(/^status: checked$/m);
      expect(front).toMatch(new RegExp(`^ymyl: ${page.ymyl}$`, 'm'));
    });

    it('answers first, in 40 words or fewer, with the plain answer', () => {
      expect(answer).toMatch(page.opens);
      expect(answer.split(/\s+/).length).toBeLessThanOrEqual(40);
      expect(answer).not.toMatch(/\]\(/);
    });

    it('leads with the fear or the medical answer, then the one limits box', () => {
      expect(h2s[0]).toBe(page.first);
      expect(body.match(/<LimitsBox\b/g)?.length).toBe(1);
      if (page.ymyl !== 'none') expect(body.indexOf('<LimitsBox') / body.length).toBeLessThan(0.35);
      // The care line belongs on lifespan pages only (CONTENT_GUIDE.md §4.3 rule 12).
      expect(/<LimitsBox\b[^>]*\bcare\b/.test(body)).toBe(page.ymyl === 'lifespan');
    });

    it('never predicts: no age, date, count of children, sex of a child or illness reading', () => {
      const text = `${front}\n${body}`.replace(/^keyword:\n(?:\s+.*\n?)*/m, '');
      expect(text).not.toMatch(/\byou will (die|have \d|marry)\b/i);
      expect(text).not.toMatch(/\b(sons?|daughters?)\b/i);
      expect(text).not.toMatch(/\b\d+ children\b/i);
      expect(text).not.toMatch(/\bguaranteed\b|\bdestined\b|\baccurate\b|100%/i);
    });

    it('meets the writing standard: no em dash, no AI-sounding words, paragraphs of at most 3 sentences', () => {
      expect(raw).not.toContain('—');
      expect(raw).not.toMatch(AI_WORDS);
      for (const para of body.split(/\n\n+/)) {
        const line = para.trim();
        if (!line || /^[<#|\-:]/.test(line) || line.startsWith('import ')) continue;
        const sentences = line.replace(/\[[^\]]*\]\([^)]*\)/g, 'x').match(/[^.?!]+[.?!]+(?=\s|$)/g) ?? [];
        expect(sentences.length, line.slice(0, 80)).toBeLessThanOrEqual(3);
      }
    });

    it('links to at least 5 other pages in its own words, never "Open the guide"', () => {
      const targets = new Set([...body.matchAll(/\]\((\/[a-z/-]+)(?:#[a-z-]+)?\)/g)].map((m) => m[1]));
      expect(targets.size).toBeGreaterThanOrEqual(5);
      for (const target of targets) expect(PAGES.some((p) => p.path === target), target).toBe(true);
      expect(raw).not.toMatch(/Open the guide|See what the app does|their own page/);
    });

    it('cites every book meaning with a locator', () => {
      const books = [...front.matchAll(/^\s+- book: ([\w-]+)\n\s+locator: '(.+)'$/gm)];
      expect(books.length).toBeGreaterThanOrEqual(page.path === '/history-of-palmistry/' ? 3 : 2);
      for (const [, , locator] of books) expect((locator ?? '').length).toBeGreaterThan(8);
    });

    if (page.diagram) {
      it('shows its HD diagram file, listed for this page (image sitemap)', () => {
        expect(body).toContain(`<DiagramFigure id="${page.diagram}" />`);
        const item = diagram(page.diagram!);
        expect(item.pages).toContain(page.path);
        expect(item.width).toBeGreaterThanOrEqual(1800);
        for (const file of diagramFiles(item)) expect(existsSync(join(ROOT, 'public/img/diagrams', file)), file).toBe(true);
      });
    }
  });
}

describe('honesty on the YMYL pages', () => {
  it('broken life line: names the dark reading only to refuse it, and gives "one or both hands"', () => {
    const body = read('src/content/guides/life-line-broken.mdx');
    expect(body).toMatch(/We name that reading only to set it aside/);
    expect(body).toMatch(/^## Is your life line broken on one hand or both hands\?$/m);
    expect(body).toMatch(/Mark of Preservation/);
  });

  it('Mercury line: "not a medical test" before any tradition, and no scan button near it', () => {
    const raw = read('src/content/guides/mercury-line.mdx');
    const body = raw.split(/^---$/m).slice(2).join('---');
    expect(body.indexOf('not a medical test')).toBeLessThan(body.indexOf('Cheiro'));
    expect(raw).toMatch(/^inlineCta: false$/m);
    expect(raw).toMatch(/^ {2}cta: false$/m);
  });

  it('children lines: says plainly that no line can tell how many, and has no scan button', () => {
    const raw = read('src/content/guides/children-line.mdx');
    expect(raw).toMatch(/No line on your palm can show whether you will have children, how many/);
    expect(raw).toMatch(/^ {2}cta: false$/m);
  });

  it('the publishing guard refuses a YMYL guide without the owner’s OK in a production build', () => {
    const layout = read('src/layouts/GuideLayout.astro');
    expect(layout).toMatch(/g\.ymyl !== 'none' && !ownerOk/);
    expect(layout).toMatch(/throw new Error/);
  });
});
