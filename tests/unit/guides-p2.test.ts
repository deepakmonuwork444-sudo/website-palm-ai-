import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { PAGE_QUIZZES } from '../../src/components/guides/new/quizzes';
import { PAGES } from '../../src/config/pages';
import { diagram, diagramFiles } from '../../src/lib/diagrams';
import { PAGE_ENTITIES } from '../../src/lib/entities';
import { isVariant, VARIANTS } from '../../src/lib/guides/palm-geometry';

/**
 * The five P2 guides (SEMANTIC_SEO_PLAN.md Phase 2 row 2.5, WEB-DEC-054): /palm-mounts/, /hand-types/,
 * /palmistry-fingers/, /sun-line/, /palm-crosses/. Heading spec (entity → attribute → value), the
 * "Check yourself" quiz rules, alt text and captions on the new blocks, sources, registration.
 */

const ROOT = process.cwd();
const read = (path: string) => readFileSync(join(ROOT, path), 'utf8').replace(/\r\n/g, '\n');

interface Page {
  path: string;
  file: string;
  parent: string;
  /** The module title (the page's only "where / what / which" heading). */
  title: string;
  /** H2s that must appear, in this order. */
  h2: string[];
  /** The scan button: only where the app reads the topic. */
  cta: boolean;
  diagram?: string;
}

const P2: Page[] = [
  {
    path: '/palm-mounts/',
    file: 'palm-mounts.mdx',
    parent: '/palm-reading/',
    title: 'Where are the mounts on your palm?',
    h2: [
      'What are the mounts of the palm?',
      'Mount by mount: where each one is and what it is read for',
      'How to read a mount: full, flat or leaning',
      'Mounts and the lines that start on them',
      'Marks on the mounts',
      'Mounts in the left and right hand, for women and men',
      'Check yourself: palm mounts quiz',
      'Myths about the palm mounts',
    ],
    cta: true,
    diagram: 'mounts-of-the-palm-chart',
  },
  {
    path: '/hand-types/',
    file: 'hand-types.mdx',
    parent: '/palm-reading/',
    title: 'What hand type do you have?',
    h2: [
      'How to tell your hand type',
      'The four element hands (a modern system)',
      'Cheiro’s seven hand types (the classical system)',
      'What if your hand fits more than one type?',
      'How hand type fits the rest of a palm reading',
      'Hand types in the left and right hand, for women and men',
      'Check yourself: hand types quiz',
      'Myths about hand types',
    ],
    cta: false,
    diagram: 'seven-hand-types-chart',
  },
  {
    path: '/palmistry-fingers/',
    file: 'palmistry-fingers.mdx',
    parent: '/palm-reading/',
    title: 'Which finger is which in palmistry?',
    h2: [
      'Finger by finger: the planet names',
      'Is your index finger longer than your ring finger?',
      'Are your fingers long or short for your palm?',
      'The thumb in palmistry',
      'The three sections of each finger (phalanges)',
      'Knotty fingers or smooth fingers: the joints',
      'Gaps between the fingers',
      'Lines on the fingers',
      'Check yourself: fingers quiz',
      'Myths about the fingers in palmistry',
    ],
    cta: false,
  },
  {
    path: '/sun-line/',
    file: 'sun-line.mdx',
    parent: '/hand-lines/',
    title: 'Where is the sun line on your palm?',
    h2: [
      'What is the sun line in palmistry?',
      'Sun line types and their meanings',
      'Is the sun line the success line?',
      'Sun line vs fate line',
      'Marks on the sun line',
      'Sun line in the left and right hand, for women and men',
      'Check yourself: sun line quiz',
      'Myths about the sun line',
    ],
    cta: true,
  },
  {
    path: '/palm-crosses/',
    file: 'palm-crosses.mdx',
    parent: '/hand-lines/',
    title: 'Where is the mystic cross on your palm?',
    h2: [
      'What is a mystic cross?',
      'Is an X on the palm the same thing?',
      'What does a cross on a mount mean?',
      'Crosses on the lines',
      'Can a phone photo show a cross?',
      'Crosses in the left and right hand',
      'Check yourself: palm crosses quiz',
      'Myths about crosses on the palm',
    ],
    cta: false,
  },
];

for (const page of P2) {
  const raw = read(`src/content/guides/${page.file}`);
  const [, front = '', body = ''] = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/) ?? [];
  const h2s = [...body.matchAll(/^## (.+)$/gm)].map((m) => m[1]);

  describe(page.path, () => {
    it('is registered in the guides sitemap, under its parent, with about/mentions', () => {
      const entry = PAGES.find((p) => p.path === page.path);
      expect(entry?.indexable).toBe(true);
      expect(entry?.sitemap).toBe('guides');
      expect(front).toMatch(new RegExp(`^parent: ${page.parent}$`, 'm'));
      expect(PAGE_ENTITIES[page.path]?.about.length).toBeGreaterThan(0);
      expect(front).toMatch(/^ymyl: none$/m);
      expect(front).toMatch(/^status: checked$/m);
    });

    it('opens with the traced real photo and one module title; the scan button only where the app reads the topic', () => {
      expect(front).toMatch(/^ {2}show: animate$/m);
      expect(front).toContain(`title: '${page.title}'`);
      expect(/^ {2}cta: false$/m.test(front)).toBe(!page.cta);
      // The module is the page's only "where is it" heading.
      expect(h2s.filter((h) => /^Where (is|are)\b/.test(h ?? ''))).toEqual([]);
    });

    it('follows its heading vector, H2 by H2, with the quiz before the one limits box and the myths after', () => {
      expect(h2s).toEqual(page.h2);
      const quiz = body.indexOf('## Check yourself:');
      const limits = body.indexOf('<LimitsBox');
      const myths = body.indexOf('## Myths about');
      expect(quiz).toBeGreaterThan(-1);
      expect(limits).toBeGreaterThan(quiz);
      expect(myths).toBeGreaterThan(limits);
      expect(body.match(/<LimitsBox\b/g)?.length).toBe(1);
      expect(body).toContain(`<PageQuiz page="${page.path}" />`);
    });

    it('asks attribute questions as H3 and puts value cards at H4', () => {
      for (const [tag] of body.matchAll(/<Variation\b[^>]*>/g)) expect(tag, tag.slice(0, 60)).not.toMatch(/\blevel=/);
      if (/<Variation\b/.test(body)) {
        expect([...body.matchAll(/^### (.+)$/gm)].some((m) => /\?$/.test(m[1] ?? ''))).toBe(true);
      }
    });

    it('cites its sources with locators, and every drawing exists', () => {
      const books = [...front.matchAll(/^\s+- book: ([\w-]+)\n\s+locator: '(.+)'$/gm)];
      expect(books.length).toBeGreaterThanOrEqual(3);
      for (const [, , locator] of books) expect((locator ?? '').length).toBeGreaterThan(8);
      for (const [, name] of body.matchAll(/\['([a-z-]+)', '/g)) expect(isVariant(name ?? ''), name).toBe(true);
    });

    it('links to the method page, the glossary and the app in its own words, never "Open the guide"', () => {
      expect(body).toContain('](/palm-reading/)');
      expect(body).toMatch(/\]\(\/palmistry-terms\/#[a-z-]+\)/);
      expect(raw).not.toMatch(/Open the guide|See what the app does|their own page/);
      const contextual = new Set([...body.matchAll(/\]\((\/[a-z/-]+)(?:#[a-z-]+)?\)/g)].map((m) => m[1]));
      expect(contextual.size, 'R5: at least 5 in-body links').toBeGreaterThanOrEqual(5);
    });

    it('never draws on the photo except the scanner’s own output: sun lines and crosses are drawings', () => {
      expect(body).not.toMatch(/<PhotoCrop\b/);
      if (page.path === '/sun-line/' || page.path === '/palm-crosses/') expect(body).toMatch(/\*\*drawing\*\*/);
    });

    if (page.diagram) {
      it('shows its chart file, listed for this page in the diagram registry', () => {
        expect(body).toContain(`<DiagramFigure id="${page.diagram}" />`);
        const item = diagram(page.diagram!);
        expect(item.pages).toContain(page.path);
        for (const file of diagramFiles(item)) expect(existsSync(join(ROOT, 'public/img/diagrams', file)), file).toBe(true);
      });
    }
  });
}

describe('P2 quizzes (Check yourself)', () => {
  it('has a question set for each of the five pages, and every set belongs to a built page', () => {
    // Later guides (Phase 3) add their own sets; each must still be a registered page.
    expect(Object.keys(PAGE_QUIZZES)).toEqual(expect.arrayContaining(P2.map((p) => p.path)));
    for (const path of Object.keys(PAGE_QUIZZES)) expect(PAGES.some((page) => page.path === path), path).toBe(true);
  });

  for (const [path, items] of Object.entries(PAGE_QUIZZES)) {
    it(`${path}: 2 or 3 questions, at most 3 options, exactly one right answer, an answer for every option`, () => {
      expect(items.length).toBeGreaterThanOrEqual(2);
      expect(items.length).toBeLessThanOrEqual(3);
      for (const item of items) {
        expect(item.options.length, item.q).toBeGreaterThanOrEqual(2);
        expect(item.options.length, item.q).toBeLessThanOrEqual(3);
        expect(item.options.filter((o) => o.ok).length, item.q).toBe(1);
        for (const option of item.options) expect(option.fb.trim().length, option.text).toBeGreaterThan(5);
      }
    });
  }

  it('no arrows, middle dots, emoji or banned words in the quiz words', () => {
    const words = JSON.stringify(PAGE_QUIZZES);
    expect(words).not.toMatch(/[→←·]|\p{Extended_Pictographic}/u);
    expect(words).not.toMatch(/\bguaranteed\b|\bdestined\b|\baccurate\b|100%/i);
  });
});

describe('P2 teaching blocks: alt text, captions, honesty', () => {
  for (const name of ['FingerMap', 'HandDrawings']) {
    it(`${name}: every figure has a caption; every image and drawing has alt text; no inline style`, () => {
      const source = read(`src/components/guides/new/${name}.astro`);
      const markup = source.slice(source.lastIndexOf('---') + 3);
      expect((markup.match(/<figure\b/g) ?? []).length).toBeGreaterThan(0);
      expect((markup.match(/<figure\b/g) ?? []).length).toBe((markup.match(/<figcaption\b/g) ?? []).length);
      for (const [tag] of markup.matchAll(/<svg\b[^>]*role="img"[^>]*>/g)) expect(tag).toMatch(/aria-label=/);
      for (const [tag] of markup.matchAll(/<PhotoCrop\b[^>]*>/g)) expect(tag).toMatch(/\balt=\{/);
      expect(source).not.toMatch(/data-tilt|\sstyle=|define:vars/);
    });
  }

  it('FingerMap marks places from the scanner landmarks only: dots, numbers and words, never a path on the photo', () => {
    const source = read('src/components/guides/new/FingerMap.astro');
    expect(source).not.toMatch(/<path\b/);
    expect(source).toMatch(/real palm photo \(Hanna Pad, Pexels\)/);
  });

  it('labels the element hands as a modern system and every drawing as a drawing', () => {
    const source = read('src/components/guides/new/HandDrawings.astro');
    expect(source).toMatch(/modern four-element system/);
    expect(source).toMatch(/not real hands/i);
    expect(read('src/content/guides/hand-types.mdx')).toMatch(/\*\*modern\*\* way of sorting hands/);
  });

  it('draws the sun line and crosses in gold (minor), never as one of the four scanned lines', () => {
    const names = Object.keys(VARIANTS).filter((name) => /^(sun|cross)-/.test(name));
    expect(names.length).toBeGreaterThanOrEqual(20);
    for (const name of names) expect((VARIANTS as Record<string, { kind: string }>)[name]!.kind, name).toBe('minor');
  });
});
