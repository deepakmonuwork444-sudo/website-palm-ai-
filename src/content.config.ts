import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Content collections (WEB-FEAT-006, CONTENT_GUIDE.md §13). Other
 * collections (blog, tools, faqs) are added here when they are built.
 *
 * guides: one MDX file per guide in src/content/guides/. The route is
 * src/pages/[...guide].astro; the page must also be registered in
 * src/config/pages.ts (check-web fails otherwise).
 */

const bookSource = z.object({
  /** An id from src/lib/guides/books.ts (the app's corpus books). */
  book: z.string(),
  /** Chapter, section or page, as precise as the book allows. */
  locator: z.string(),
  note: z.string().optional(),
});

const otherSource = z.object({
  /** A study, medical page or modern book (science and medical facts, CONTENT_GUIDE.md §9.5). */
  title: z.string(),
  author: z.string(),
  year: z.number().int().optional(),
  publisher: z.string().optional(),
  url: z.url().optional(),
  note: z.string().optional(),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/guides' }),
  schema: z.object({
    /** ≤ 60 characters, primary keyword first (SEO_PLAYBOOK.md §1). */
    title: z.string().max(60),
    /** ≤ 155 characters (check-web allows 70–160). */
    description: z.string().min(70).max(160),
    /** The canonical path, with both slashes: `/heart-line/`. */
    path: z.string().regex(/^\/(?:[a-z0-9-]+\/)+$/),
    locale: z.enum(['en', 'hi']).default('en'),
    h1: z.string(),
    subtitle: z.string().optional(),
    /** Answer first: ≤ 40 words (checked by a unit test). */
    answer: z.string(),
    /** The short name used in breadcrumbs, related links and the step pager. */
    crumb: z.string(),
    /** The logical parent guide (breadcrumbs); Home when absent. */
    parent: z.string().optional(),
    /** The main line this guide is about: highlighted in the header drawing. */
    line: z.enum(['heart', 'head', 'life', 'fate']).optional(),
    /** A guide-diagram variant for the header instead of PalmTrace (src/lib/guides/palm-geometry.ts). */
    figureVariant: z.string().optional(),
    figureAlt: z.string(),
    figureCaption: z.string(),
    /** false hides the inline reading CTA under the quick facts (e.g. /simian-line/: no CTA near medical facts, KEYWORD_MAP K10). */
    inlineCta: z.boolean().default(true),
    quickFacts: z.array(z.object({ label: z.string(), value: z.string() })).min(3).max(7),
    /** Paths of 3–4 related guides (SEO_PLAYBOOK.md §11 groups); only live ones are shown. */
    related: z.array(z.string()).max(6),
    /** Position in the 7-step path (CONTENT_GUIDE.md §5 block 17). */
    step: z.number().int().min(1).max(7).optional(),
    ymyl: z.enum(['none', 'marriage', 'children', 'lifespan', 'health']).default('none'),
    /** draft → checked → owner-ok (YMYL) → published (CONTENT_GUIDE.md §10). */
    status: z.enum(['draft', 'checked', 'owner-ok', 'published']),
    published: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    /** Only when a real, named person reviewed the page. */
    reviewedBy: z.object({ name: z.string(), role: z.string(), date: z.string() }).optional(),
    keyword: z.object({ primary: z.string(), secondary: z.array(z.string()).max(15) }),
    /** The app rules the meanings on this page come from (src/lib/guides/app-rules.ts). */
    ruleIds: z.array(z.string()).default([]),
    sources: z.array(z.union([bookSource, otherSource])).min(1),
    /** 3–8 owned questions; answers may use [links](/path/), **bold** and *italic*. */
    faq: z.array(z.object({ q: z.string(), a: z.string() })).min(3).max(8),
  }),
});

export const collections = { guides };
