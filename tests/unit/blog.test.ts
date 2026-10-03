import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { PAGES, isLive } from '../../src/config/pages';
import {
  BLOG_PATH,
  BLOG_POST_PATH,
  blogIndexSchema,
  coverDiagramId,
  needsCareLine,
  pickKeepReading,
  publishProblem,
  readingMinutes,
  readingWords,
  sortPosts,
  TAKEAWAY_MAX_WORDS,
} from '../../src/lib/blog';
import { DIAGRAMS } from '../../src/lib/diagrams';
import { isEntityId } from '../../src/lib/entities';
import { plainText, wordCount } from '../../src/lib/guides/guides';
import { articleSchema, PERSON_ID } from '../../src/lib/schema';
import { sitemapXml } from '../../src/lib/sitemap';
import { sourceProblems } from '../../src/lib/writing-standard';

/**
 * The /blog/ section (WEB-DEC-057): the collection, layout, route and index are wired the way the
 * guides are, and every post file follows the rules the zod schema can't express. The real build is
 * checked by check-web (BlogPosting JSON-LD, listed on /blog/, limits box on YMYL posts).
 */

const root = process.cwd();
const read = (...parts: string[]) => readFileSync(join(root, ...parts), 'utf8');
const BLOG_DIR = join(root, 'src', 'content', 'blog');
const files = existsSync(BLOG_DIR) ? readdirSync(BLOG_DIR).filter((name) => name.endsWith('.mdx')) : [];

interface Post {
  file: string;
  raw: string;
  front: string;
}
const posts: Post[] = files.map((file) => {
  const raw = read('src', 'content', 'blog', file).replace(/\r\n/g, '\n');
  const front = raw.match(/^---\n([\s\S]*?)\n---\n/)?.[1];
  if (front === undefined) throw new Error(`${file}: no front matter`);
  return { file, raw, front };
});

/** A one-line scalar from the front matter (quoted or not). */
function scalar(front: string, key: string): string | undefined {
  const line = front.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'))?.[1]?.trim();
  if (line === undefined) return undefined;
  return line.replace(/^'(.*)'$/, '$1').replace(/^"(.*)"$/, '$1').replace(/''/g, "'");
}

/** A front-matter list, block (`key:` + `  - item`) or inline (`key: [a, b]`). */
function list(front: string, key: string): string[] {
  const inline = front.match(new RegExp(`^${key}:\\s*\\[(.*)\\]\\s*$`, 'm'))?.[1];
  if (inline !== undefined) return inline.split(',').map((item) => item.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
  const block = front.match(new RegExp(`^${key}:\\s*\\n((?:\\s+- .*\\n?)+)`, 'm'))?.[1] ?? '';
  return [...block.matchAll(/^\s+- (.*)$/gm)].map((m) => (m[1] ?? '').trim().replace(/^['"]|['"]$/g, ''));
}

describe('blog wiring', () => {
  it('has a blog content collection next to the guides', () => {
    const config = read('src', 'content.config.ts');
    expect(config).toMatch(/const blog = defineCollection\(\{\s*loader: glob\(\{ pattern: '\*\*\/\*\.mdx', base: '\.\/src\/content\/blog' \}\)/);
    expect(config).toMatch(/export const collections = \{ guides, blog \}/);
    for (const field of ['title', 'description', 'path', 'h1', 'answer', 'summary', 'crumb', 'pillar', 'about', 'mentions', 'author', 'ymyl', 'status', 'published', 'updated', 'sources']) {
      expect(config, field).toMatch(new RegExp(`\\n\\s+${field}: z\\.`));
    }
  });

  it('builds every post through BlogLayout on the guides’ route, and the index from the same collection', () => {
    // One route module with the guides: a second route sharing their components split the guides' CSS (WEB-DEC-057).
    const route = read('src', 'pages', '[...guide].astro');
    expect(existsSync(join(root, 'src', 'pages', 'blog', '[slug].astro'))).toBe(false);
    expect(route).toMatch(/getCollection\('blog'\)/);
    expect(route).toMatch(/entry\.collection === 'blog' \? \(\s*<BlogLayout entry=\{entry\} headings=\{headings\}>/);
    const index = read('src', 'pages', 'blog', 'index.astro');
    expect(index).toMatch(/getCollection\('blog'\)/);
    expect(index).toMatch(/blogIndexSchema\(/);
    const layout = read('src', 'layouts', 'BlogLayout.astro');
    expect(layout).toMatch(/publishProblem\(p, isPreview\)/);
    expect(layout).toMatch(/type: 'BlogPosting'/);
    expect(layout).toMatch(/<LimitsBox /);
    // CSP: no inline style attributes and no define:vars (hashed styles only).
    for (const source of [layout, index, route]) {
      expect(source.replace(/\/\*[\s\S]*?\*\//g, '')).not.toMatch(/\sstyle=|define:vars/);
    }
  });

  it('registers /blog/ as an indexable page in the blog sitemap, linked from the footer', () => {
    expect(PAGES.find((page) => page.path === BLOG_PATH)).toMatchObject({ locale: 'en', indexable: true, sitemap: 'blog', label: 'Blog' });
    expect(sitemapXml('blog')).toContain('<loc>https://palmsays.com/blog/</loc>');
    expect(read('src', 'components', 'Footer.astro')).toMatch(/registryLinks\(\['\/blog\/'\]\)/);
    expect(read('src', 'pages', 'llms.txt.ts')).toMatch(/getCollection\('blog'\)/);
  });

  it('keeps every registered /blog/ page in the blog sitemap group', () => {
    for (const page of PAGES.filter((item) => item.path.startsWith(BLOG_PATH))) {
      expect(page.sitemap, page.path).toBe(page.indexable ? 'blog' : undefined);
      if (page.path !== BLOG_PATH) expect(page.path).toMatch(BLOG_POST_PATH);
    }
  });
});

describe('blog page design (WEB-DEC-058)', () => {
  it('keeps the blog CSS out of the guides: a linked blog.css, no <style> in the blog layout or index', () => {
    const layout = read('src', 'layouts', 'BlogLayout.astro');
    const index = read('src', 'pages', 'blog', 'index.astro');
    for (const source of [layout, index]) {
      expect(source).toContain("styles/blog.css?url';");
      expect(source).toContain('<link slot="head" rel="stylesheet" href={blogCss} />');
      expect(source.replace(/\/\*[\s\S]*?\*\//g, '')).not.toMatch(/<style[\s>]/);
    }
    expect(read('src', 'layouts', 'BaseLayout.astro')).toMatch(/<slot name="head" \/>\s*<\/head>/);
    // Guides keep their own components; only blog entries get the blog figure and table.
    const route = read('src', 'pages', '[...guide].astro');
    expect(route).toMatch(/<GuideLayout entry=\{entry\} headings=\{headings\}>\s*<Content components=\{components\} \/>/);
    expect(route).toContain('blogComponents = { ...components, DiagramFigure: BlogDiagram, table: BlogTable }');
  });

  it('counts reading words without JSX, imports, link targets or table rules', () => {
    const body = [
      "import { site } from '../../config/site';",
      '## When do palm lines form?',
      'Your lines form [before birth](/hand-lines/), at **8 to 13** weeks.',
      '<DiagramFigure id="palm-lines-form-timeline" />',
      '| A | B |',
      '|---|---|',
      '| one | two |',
      'You get {site.freeReadings.guest} readings.',
    ].join('\n');
    // "When do palm lines form?" 5 + the link line 10 + the table cells 4 + "You get 1 readings." 4
    expect(readingWords(body)).toBe(5 + 10 + 4 + 4);
    expect(readingMinutes(body)).toBe(1);
    expect(readingMinutes('word '.repeat(220 * 5))).toBe(5);
    expect(readingMinutes('')).toBe(1);
  });

  it('takes the first infographic as the cover', () => {
    expect(coverDiagramId('text\n<DiagramFigure id="a-one" />\n<DiagramFigure id="b-two" />')).toBe('a-one');
    expect(coverDiagramId('<PalmFigure variant="simian" />')).toBeNull();
  });

  it('picks 3 other posts for Keep reading: related posts first, then the newest', () => {
    const post = (path: string, published: string) => ({ path, title: path, summary: 's', published, updated: published });
    const all = [post('/blog/a/', '2026-10-01'), post('/blog/b/', '2026-10-03'), post('/blog/c/', '2026-10-02'), post('/blog/d/', '2026-10-04'), post('/blog/e/', '2026-09-01')];
    const picked = pickKeepReading({ path: '/blog/a/', related: ['/blog/e/', '/hand-lines/', '/blog/a/'] }, all).map((item) => item.path);
    expect(picked).toEqual(['/blog/e/', '/blog/d/', '/blog/b/']);
    expect(pickKeepReading({ path: '/blog/a/', related: [] }, [all[0]!])).toEqual([]);
  });
});

describe('publishing rule (same as the guides, CONTENT_GUIDE.md §10)', () => {
  const post = (status: 'draft' | 'checked' | 'owner-ok' | 'published', ymyl: 'none' | 'lifespan' = 'none') => ({ path: '/blog/x/', status, ymyl });

  it('lets a preview build show every post', () => {
    expect(publishProblem(post('draft', 'lifespan'), true)).toBeNull();
  });

  it('ships checked or published posts, and YMYL posts only with the owner’s OK', () => {
    expect(publishProblem(post('draft'), false)).toMatch(/draft/);
    expect(publishProblem(post('checked'), false)).toBeNull();
    expect(publishProblem(post('published'), false)).toBeNull();
    expect(publishProblem(post('checked', 'lifespan'), false)).toMatch(/owner/);
    expect(publishProblem(post('owner-ok', 'lifespan'), false)).toBeNull();
  });

  it('adds the care line only on lifespan and health posts', () => {
    expect(needsCareLine('lifespan')).toBe(true);
    expect(needsCareLine('health')).toBe(true);
    expect(needsCareLine('marriage')).toBe(false);
    expect(needsCareLine('none')).toBe(false);
  });
});

describe('blog JSON-LD', () => {
  const a = { path: '/blog/a/', title: 'A', summary: 'a', published: '2026-10-02', updated: '2026-10-02' };
  const b = { path: '/blog/b/', title: 'B', summary: 'b', published: '2026-10-05', updated: '2026-10-06' };
  const c = { path: '/blog/c/', title: 'C', summary: 'c', published: '2026-10-02', updated: '2026-10-02' };

  it('lists posts newest first, ties by title', () => {
    expect(sortPosts([a, b, c]).map((item) => item.path)).toEqual(['/blog/b/', '/blog/a/', '/blog/c/']);
  });

  it('describes /blog/ as a CollectionPage about palmistry with an ItemList of the posts', () => {
    const schema = blogIndexSchema({ name: 'Blog', description: 'd', locale: 'en', entities: { about: ['palmistry'] }, posts: [b, a] });
    expect(schema).toMatchObject({ '@type': 'CollectionPage', '@id': 'https://palmsays.com/blog/#webpage', breadcrumb: { '@id': 'https://palmsays.com/blog/#breadcrumb' } });
    expect(schema.about).toMatchObject({ '@id': 'https://palmsays.com/palmistry-terms/#palmistry' });
    expect(schema.mainEntity).toMatchObject({ '@type': 'ItemList', numberOfItems: 2, itemListElement: [{ position: 1, url: 'https://palmsays.com/blog/b/' }, { position: 2 }] });
    expect(blogIndexSchema({ name: 'Blog', description: 'd', locale: 'en', entities: { about: ['palmistry'] }, posts: [] }).mainEntity).toBeUndefined();
  });

  it('makes a post a BlogPosting by the founder, with the guides’ ids', () => {
    const node = articleSchema({ type: 'BlogPosting', headline: 'h', description: 'd', path: '/blog/x/', locale: 'en', datePublished: 'p', dateModified: 'm', authorName: 'Deepak Chauhan' });
    expect(node).toMatchObject({ '@type': 'BlogPosting', '@id': 'https://palmsays.com/blog/x/#article', author: { '@id': PERSON_ID } });
    // Guides keep Article.
    expect(articleSchema({ headline: 'h', description: 'd', path: '/heart-line/', locale: 'en', datePublished: 'p', dateModified: 'm', authorName: 'x' })['@type']).toBe('Article');
  });
});

describe('blog post files', () => {
  it('holds only posts (one .mdx per post) in src/content/blog/', () => {
    const other = existsSync(BLOG_DIR) ? readdirSync(BLOG_DIR).filter((name) => !name.endsWith('.mdx') && name !== '.gitkeep') : [];
    expect(other).toEqual([]);
  });

  for (const post of posts) {
    describe(post.file, () => {
      const path = scalar(post.front, 'path') ?? '';

      it('lives at /blog/<file name>/ and is registered in the blog sitemap group', () => {
        expect(path).toMatch(BLOG_POST_PATH);
        expect(path).toBe(`/blog/${post.file.replace(/\.mdx$/, '')}/`);
        expect(PAGES.find((page) => page.path === path), `${path} missing from src/config/pages.ts`).toMatchObject({ sitemap: 'blog', indexable: true });
      });

      it('answers first in 40 words or fewer, with a one-line summary', () => {
        expect(wordCount(plainText(scalar(post.front, 'answer') ?? ''))).toBeLessThanOrEqual(40);
        expect(scalar(post.front, 'summary')?.length ?? 0).toBeGreaterThan(20);
      });

      it('uses entity ids from src/lib/entities.ts', () => {
        const ids = [...list(post.front, 'about'), ...list(post.front, 'mentions')];
        expect(list(post.front, 'about').length).toBeGreaterThan(0);
        for (const id of ids) expect(isEntityId(id), `unknown entity ${id}`).toBe(true);
      });

      it('links its pillar and related pages only when they are built', () => {
        expect(isLive(scalar(post.front, 'pillar') ?? ''), 'pillar').toBe(true);
        for (const related of list(post.front, 'related')) expect(isLive(related), related).toBe(true);
      });

      it('follows the writing standard (CONTENT_GUIDE.md §15)', () => {
        expect(sourceProblems(`src/content/blog/${post.file}`, post.raw, 'mdx').map((p) => `${p.line}: ${p.message}`)).toEqual([]);
      });

      it('has a topic chip and 3 to 4 short key takeaways', () => {
        expect(scalar(post.front, 'topic')?.length ?? 0).toBeGreaterThan(1);
        const takeaways = list(post.front, 'takeaways');
        expect(takeaways.length).toBeGreaterThanOrEqual(3);
        expect(takeaways.length).toBeLessThanOrEqual(4);
        for (const item of takeaways) expect(wordCount(plainText(item)), item).toBeLessThanOrEqual(TAKEAWAY_MAX_WORDS);
      });

      it('opens with an infographic, used as its cover and card image', () => {
        const cover = coverDiagramId(post.raw);
        expect(cover).not.toBeNull();
        expect(DIAGRAMS.find((item) => item.id === cover)?.pages).toContain(scalar(post.front, 'path'));
      });

      it('does not write its own limits box (the layout adds it)', () => {
        expect(post.raw).not.toMatch(/<LimitsBox\b/);
      });
    });
  }
});
