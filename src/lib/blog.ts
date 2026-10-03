import { absoluteUrl, type Locale } from '../config/site';
import { webPageSchema } from './schema';
import type { PageEntities } from './entities';

/**
 * The /blog/ section (SEMANTIC_SEO_PLAN.md §6.2 N-7, N-14, N-15, N-20; WEB-DEC-057). Pure helpers
 * shared by src/layouts/BlogLayout.astro, src/pages/blog/index.astro and the unit tests.
 * Posts live in src/content/blog/*.mdx (schema: src/content.config.ts `blog`).
 */

export const BLOG_PATH = '/blog/';
/** A post's canonical path: one level under /blog/. */
export const BLOG_POST_PATH = /^\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*\/$/;

export type PostStatus = 'draft' | 'checked' | 'owner-ok' | 'published';
export type Ymyl = 'none' | 'marriage' | 'children' | 'lifespan' | 'health';

/**
 * The same publishing rule as the guides (GuideLayout, CONTENT_GUIDE.md §10): a preview build shows
 * every post; a production build refuses a `draft`, and a YMYL post without the owner's OK.
 */
export function publishProblem(post: { path: string; status: PostStatus; ymyl: Ymyl }, preview: boolean): string | null {
  if (preview) return null;
  const ownerOk = post.status === 'owner-ok' || post.status === 'published';
  if (post.status === 'draft') return `${post.path}: status "draft" can't be published (CONTENT_GUIDE.md §10)`;
  if (post.ymyl !== 'none' && !ownerOk) return `${post.path}: status "${post.status}" can't be published (CONTENT_GUIDE.md §10: YMYL posts need the owner's OK)`;
  return null;
}

/** The care line goes with the limits box on lifespan and health posts (CONTENT_GUIDE.md §4). */
export const needsCareLine = (ymyl: Ymyl): boolean => ymyl === 'lifespan' || ymyl === 'health';

export interface PostSummary {
  path: string;
  title: string;
  summary: string;
  published: string;
  updated: string;
}

/** Newest first; the same day sorts by title, so the order never flips between builds. */
export function sortPosts<T extends PostSummary>(posts: readonly T[]): T[] {
  return [...posts].sort((a, b) => b.published.localeCompare(a.published) || a.title.localeCompare(b.title));
}

/** Reading speed for the "N min read" line (words a minute, a calm adult pace). */
export const READING_WPM = 220;

/**
 * The words a reader reads in a post's MDX body: imports, JSX tags (figures, cards), link targets,
 * table rules and markdown marks are left out; a `{expression}` counts as one word (a number).
 */
export function readingWords(body: string): number {
  const text = body
    .replace(/^---\n[\s\S]*?\n---\n/, '')
    .replace(/^(?:import|export)\s.*$/gm, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\{[^{}]*\}/g, ' 1 ')
    .replace(/\]\([^)]*\)/g, ' ')
    .replace(/[#*_|>[\]`]/g, ' ')
    .replace(/-{3,}/g, ' ');
  return text.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word)).length;
}

/** Minutes to read a post body, rounded, never under 1. */
export const readingMinutes = (body: string): number => Math.max(1, Math.round(readingWords(body) / READING_WPM));

/** The post's cover: its first infographic (`<DiagramFigure id="…" />` in the body), or null. */
export function coverDiagramId(body: string): string | null {
  return body.match(/<DiagramFigure\s[^>]*\bid="([a-z0-9-]+)"/)?.[1] ?? null;
}

/** A post as a card (/blog/ index, "Keep reading"): the summary plus topic, reading time and cover. */
export interface PostCard extends PostSummary {
  topic: string;
  minutes: number;
  cover: string | null;
}

/** A card from a post's front matter and MDX body. */
export function toPostCard(
  data: { path: string; h1: string; summary: string; published: string; updated: string; topic: string },
  body: string,
): PostCard {
  return {
    path: data.path,
    title: data.h1,
    summary: data.summary,
    published: data.published,
    updated: data.updated,
    topic: data.topic,
    minutes: readingMinutes(body),
    cover: coverDiagramId(body),
  };
}

/** Most words a key takeaway may have (owner, 2026-10-01: short bullets a reader takes in at a glance). */
export const TAKEAWAY_MAX_WORDS = 15;

/**
 * "Keep reading" on a post: up to `limit` other posts, its `related` posts first (in their order),
 * then the newest of the rest. Only posts in `all` (the caller passes live ones) are picked.
 */
export function pickKeepReading<T extends PostSummary>(current: { path: string; related: readonly string[] }, all: readonly T[], limit = 3): T[] {
  const others = all.filter((post) => post.path !== current.path);
  const byPath = new Map(others.map((post) => [post.path, post]));
  const first = current.related.flatMap((path) => byPath.get(path) ?? []);
  const rest = sortPosts(others).filter((post) => !first.includes(post));
  return [...first, ...rest].slice(0, limit);
}

/** The /blog/ index: a CollectionPage (`{url}#webpage`) with an ItemList of the posts, in the page's order. */
export function blogIndexSchema(input: {
  name: string;
  description: string;
  locale: Locale;
  entities: PageEntities;
  posts: readonly PostSummary[];
}): Record<string, unknown> {
  return {
    ...webPageSchema({
      path: BLOG_PATH,
      name: input.name,
      description: input.description,
      locale: input.locale,
      type: 'CollectionPage',
      entities: input.entities,
      breadcrumb: true,
    }),
    ...(input.posts.length
      ? {
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: input.posts.length,
            itemListElement: input.posts.map((post, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: post.title,
              url: absoluteUrl(post.path),
            })),
          },
        }
      : {}),
  };
}

