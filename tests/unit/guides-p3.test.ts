import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { PAGE_QUIZZES } from '../../src/components/guides/new/quizzes';
import { PAGES } from '../../src/config/pages';
import { diagram, diagramFiles } from '../../src/lib/diagrams';
import { entity, PAGE_ENTITIES } from '../../src/lib/entities';
import { isVariant } from '../../src/lib/guides/palm-geometry';

/**
 * The four Phase 3 guides (SEMANTIC_SEO_PLAN.md §6.2 N-8 to N-11): /palmistry-m/, /lucky-signs/,
 * /money-line/, /career-palmistry/. Same pattern as the P2 guides (guides-p2.test.ts), plus the
 * owner's writing standard of 2026-10-01: no em dash, no AI-sounding words, and the honesty points
 * each page exists to make (no classical M, no classical money line, no line decides income).
 */

const ROOT = process.cwd();
const read = (path: string) => readFileSync(join(ROOT, path), 'utf8').replace(/\r\n/g, '\n');

interface Page {
  path: string;
  file: string;
  parent: string;
  title: string;
  h2: string[];
  cta: boolean;
  diagram?: string;
  /** Sentences the page must make (its reason to exist). */
  must: RegExp[];
}

const P3: Page[] = [
  {
    path: '/palmistry-m/',
    file: 'palmistry-m.mdx',
    parent: '/hand-lines/',
    title: 'Where is the M on your palm?',
    h2: [
      'What forms the M on your palm?',
      'Is the M on your palm rare?',
      'What does the M on your palm mean?',
      'M on the left hand, right hand or both hands',
      'Can a phone photo show the M?',
      'Check yourself: M on the palm quiz',
      'Myths about the M on the palm',
    ],
    cta: true,
    diagram: 'm-on-palm-four-lines-chart',
    must: [/No classical palmistry book reads it/, /No study and no classical palmistry book we use counts/],
  },
  {
    path: '/lucky-signs/',
    file: 'lucky-signs.mdx',
    parent: '/hand-lines/',
    title: 'Where are lucky signs on your palm?',
    h2: [
      'What are lucky signs on the palm?',
      'Lucky signs one by one',
      'Indian auspicious signs: conch, wheel, lotus and flag',
      'Which palm signs do the books not call lucky?',
      'Are lucky signs rare?',
      'Can a phone photo show these signs?',
      'Lucky signs in the left and right hand',
      'Check yourself: lucky signs quiz',
      'Myths about lucky signs',
    ],
    cta: false,
    diagram: 'lucky-signs-on-palm-chart',
    must: [/we call none of them rare/, /no mark brings luck or money/],
  },
  {
    path: '/money-line/',
    file: 'money-line.mdx',
    parent: '/hand-lines/',
    title: 'Where is the “money line” on your palm?',
    h2: [
      'Is there a money line on the palm?',
      'Which lines do palmistry books read for work and money?',
      'What is the money triangle?',
      'What if you have no money line?',
      'Money line for women and men, left and right hand',
      'Can a phone photo show these lines?',
      'Check yourself: money line quiz',
      'Myths about the money line',
    ],
    cta: false,
    must: [/No classical palmistry book names a money line/, /Palm lines don’t decide what you earn/],
  },
  {
    path: '/career-palmistry/',
    file: 'career-palmistry.mdx',
    parent: '/palm-reading/',
    title: 'Which parts of your palm does career palmistry read?',
    h2: [
      'What is career palmistry?',
      'Which palm lines are read for career?',
      'What is the business line in palmistry?',
      'Does hand shape show the right job?',
      'Mounts and fingers in a career reading',
      'Can palmistry tell you which job to choose?',
      'Career palmistry for women and men',
      'Can a phone photo show your career lines?',
      'Check yourself: career palmistry quiz',
      'Myths about career palmistry',
    ],
    cta: true,
    diagram: 'seven-hand-types-chart',
    must: [/palm lines don’t decide your income/, /No classical book we use names a business line/],
  },
];

/** The owner's banned AI-sounding words and phrases (2026-10-01), whole words. */
const AI_WORDS =
  /\b(delve|tapestry|testament|realm|embark|unleash|unlock the secrets|navigate|it'?’?s important to note|dive into|look no further|whether you'?’?re|seamless|elevate|vibrant|intricate|myriad|pivotal|robust|leverage|holistic|nuanced|comprehensive|ultimate guide|in conclusion|moreover|furthermore|additionally|journey|crucial)\b/i;

for (const page of P3) {
  const raw = read(`src/content/guides/${page.file}`);
  const [, front = '', body = ''] = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/) ?? [];
  const h2s = [...body.matchAll(/^## (.+)$/gm)].map((m) => m[1]);

  describe(page.path, () => {
    it('is registered in the guides sitemap, under its parent, with about/mentions, and ships as checked', () => {
      const entry = PAGES.find((p) => p.path === page.path);
      expect(entry?.indexable).toBe(true);
      expect(entry?.sitemap).toBe('guides');
      expect(front).toMatch(new RegExp(`^parent: ${page.parent}$`, 'm'));
      expect(PAGE_ENTITIES[page.path]?.about.length).toBeGreaterThan(0);
      expect(entity(PAGE_ENTITIES[page.path]!.about[0]!).owner).toBe(page.path);
      expect(front).toMatch(/^ymyl: none$/m);
      expect(front).toMatch(/^status: checked$/m);
    });

    it('opens with the traced real photo and one module title; the scan button only where the app reads the topic', () => {
      expect(front).toMatch(/^ {2}show: animate$/m);
      expect(front).toContain(`title: '${page.title}'`);
      expect(/^ {2}cta: false$/m.test(front)).toBe(!page.cta);
      expect(h2s.filter((h) => /^Where (is|are)\b/.test(h ?? ''))).toEqual([]);
    });

    it('follows its heading vector, with the quiz before the one limits box and the myths after', () => {
      expect(h2s).toEqual(page.h2);
      const quiz = body.indexOf('## Check yourself:');
      const limits = body.indexOf('<LimitsBox');
      const myths = body.indexOf('## Myths about');
      expect(limits).toBeGreaterThan(quiz);
      expect(myths).toBeGreaterThan(limits);
      expect(body.match(/<LimitsBox\b/g)?.length).toBe(1);
      expect(body).toContain(`<PageQuiz page="${page.path}" />`);
      expect(PAGE_QUIZZES[page.path]?.length).toBe(3);
    });

    it('cites at least three books with locators; every drawing exists', () => {
      const books = [...front.matchAll(/^\s+- book: ([\w-]+)\n\s+locator: '(.+)'$/gm)];
      expect(books.length).toBeGreaterThanOrEqual(3);
      for (const [, , locator] of books) expect((locator ?? '').length).toBeGreaterThan(8);
      for (const [, name] of body.matchAll(/\['([a-z-]+)', '/g)) expect(isVariant(name ?? ''), name).toBe(true);
      for (const [, name] of body.matchAll(/variant="([a-z-]+)"/g)) expect(isVariant(name ?? ''), name).toBe(true);
    });

    it('links in its own words to the method page, the glossary and at least five other pages', () => {
      expect(body).toContain('](/palm-reading/)');
      expect(body).toMatch(/\]\(\/palmistry-terms\/#[a-z-]+\)/);
      expect(raw).not.toMatch(/Open the guide|See what the app does|their own page|click here/i);
      const contextual = new Set([...body.matchAll(/\]\((\/[a-z/-]+)(?:#[a-z-]+)?\)/g)].map((m) => m[1]));
      expect(contextual.size).toBeGreaterThanOrEqual(5);
    });

    it('meets the writing standard: no em dash, no AI-sounding words, short title and description', () => {
      expect(raw).not.toContain(String.fromCharCode(0x2014));
      expect(raw.replace(/^keyword:\n(?:\s+.*\n?)*/m, '')).not.toMatch(AI_WORDS);
      const title = front.match(/^title: '(.+)'$/m)?.[1] ?? '';
      const description = front.match(/^description: '(.+)'$/m)?.[1] ?? '';
      expect(title.length).toBeLessThanOrEqual(60);
      expect(description.length).toBeLessThanOrEqual(155);
    });

    it('makes the honest points the page exists for, and never draws on the photo', () => {
      for (const must of page.must) expect(raw).toMatch(must);
      expect(body).not.toMatch(/<PhotoCrop\b/);
      expect(body).toMatch(/\*\*drawings?\*\*|\(drawings\)/);
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

describe('Phase 3 registry', () => {
  it('moves the sign and money terms to their new guides', () => {
    expect(entity('m-sign').owner).toBe('/palmistry-m/');
    for (const id of ['star', 'triangle', 'square', 'fish', 'trident'] as const) expect(entity(id).owner).toBe('/lucky-signs/');
    expect(entity('money-line').owner).toBe('/money-line/');
    expect(entity('career-palmistry').owner).toBe('/career-palmistry/');
    // No Wikidata item was verified for these terms: their own @id is the identity.
    for (const id of ['money-triangle', 'line-of-fortune', 'business-line', 'career-palmistry'] as const) expect(entity(id).wikidata).toBeUndefined();
  });
});
