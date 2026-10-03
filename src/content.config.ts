import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Content collections (WEB-FEAT-006, CONTENT_GUIDE.md §13). Other
 * collections (tools, faqs) are added here when they are built.
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
    /** The main line this guide is about (line colour, "Step n of 4", the scan prompt). */
    line: z.enum(['heart', 'head', 'life', 'fate']).optional(),
    /**
     * The "Find your line" module at the top (guide template v3, CONTENT_GUIDE.md §5):
     * the real sample photo with a "where to look" region, a curiosity prompt, 2–4
     * look-at-your-own-hand steps and optional answer chips (no JS: radio + :has()).
     */
    find: z.object({
      /** Which region(s) to mark on the photo (src/lib/guides/sample-palm.ts). */
      region: z.enum(['heart', 'head', 'life', 'fate', 'all', 'marriage', 'simian', 'none']),
      /**
       * The photo beside the panel: 'region' = the v3 RegionPhoto (default); 'animate' = guide v4
       * TracedPalm, the app's scan-guide photo with the scanner's real lines drawn one by one (WEB-DEC-047).
       */
      show: z.enum(['region', 'animate']).default('region'),
      /**
       * With `show: animate`, which real photo + its real scan the hero traces (src/lib/guides/traced-palm.ts
       * GUIDE_HEROES): 'guide-palm' = the app's scan-guide palm (default); 'left-palm' = the owner's own left
       * palm, only as the /which-hand-to-read/ hero (WEB-DEC-048).
       */
      photo: z.enum(['guide-palm', 'left-palm']).default('guide-palm'),
      /** Module heading; defaults to "Find your {line}". */
      title: z.string().optional(),
      /** One curiosity line, a question the reader answers by looking at their own hand. */
      prompt: z.string(),
      steps: z.array(z.string()).min(2).max(4),
      /** The question above the answer chips. */
      question: z.string().optional(),
      /** Answer chips: the short meaning shows when picked; `href` jumps to the full card. */
      /** `link`: the words of a chip link that leaves the page (default "Open the guide"); name the target ("Heart line meaning"), WEB-DEC-051 R2. */
      choices: z.array(z.object({ label: z.string(), answer: z.string(), href: z.string().optional(), link: z.string().optional() })).max(5).default([]),
      /** false: no scan button in the module (a topic the scan doesn't read, e.g. marriage lines). */
      cta: z.boolean().default(true),
    }),
    /** The matching tool under /tools/ (linked from the module when that page is live). */
    tool: z.object({ slug: z.string(), name: z.string(), label: z.string().optional() }).optional(),
    /** false hides the scan button (module, sticky bar) on this page, e.g. /simian-line/: no CTA near medical facts (KEYWORD_MAP K10). */
    inlineCta: z.boolean().default(true),
    quickFacts: z.array(z.object({ label: z.string(), value: z.string() })).min(3).max(7),
    /** Paths of 3–4 related guides (SEO_PLAYBOOK.md §11 groups); only live ones are shown. */
    related: z.array(z.string()).max(6),
    /** Position in the 7-step path (src/lib/guides/guides.ts STEPS); steps 3–6 are the 4 main lines ("Step n of 4"). */
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

/**
 * blog: one MDX file per post in src/content/blog/ (WEB-DEC-057; CONTENT_GUIDE.md §7 template, §15
 * writing standard). Route src/pages/[...guide].astro (shared with the guides), layout src/layouts/BlogLayout.astro, index
 * /blog/. Like a guide, each post must be registered in src/config/pages.ts (sitemap group 'blog').
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }),
  schema: z.object({
    /** ≤ 60 characters, primary keyword first (SEO_PLAYBOOK.md §1). */
    title: z.string().max(60),
    /** 70–160 characters (aim for ≤ 155). */
    description: z.string().min(70).max(160),
    /** The canonical path: `/blog/<slug>/` (the file name should be the slug). */
    path: z.string().regex(/^\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*\/$/),
    locale: z.enum(['en', 'hi']).default('en'),
    /** The question the post answers, as people search it. */
    h1: z.string(),
    /** Answer first: ≤ 40 words, the direct answer (checked by a unit test). */
    answer: z.string(),
    /** One line for the /blog/ index (≤ 140 characters). */
    summary: z.string().max(140),
    /** The short name in the breadcrumb (Home / Blog / crumb). */
    crumb: z.string().max(40),
    /** The topic chip above the H1 and on the /blog/ cards, e.g. "Palm lines" (≤ 24 characters). */
    topic: z.string().max(24),
    /** 3–4 key takeaways shown under the cover, from the post's own text (≤ 15 words each, checked by a unit test). */
    takeaways: z.array(z.string()).min(3).max(4),
    /** Shown above the body, e.g. "PalmSays is our app." on a comparison post (CONTENT_GUIDE.md §7). */
    disclosure: z.string().optional(),
    /** The pillar guide this post supports (one contextual link in the end block), e.g. `/palm-reading/`. */
    pillar: z.string().regex(/^\/(?:[a-z0-9-]+\/)+$/),
    /** Up to 3 related posts or guides (only live pages are shown). */
    related: z.array(z.string()).max(3).default([]),
    /** Entity ids from src/lib/entities.ts: the page's `about` (1–2) and `mentions` (JSON-LD, SEMANTIC_SEO_PLAN.md §5.2). */
    about: z.array(z.string()).min(1).max(2),
    mentions: z.array(z.string()).max(8).default([]),
    /** The author's id: only the founder exists today (/about/deepak-chauhan/). */
    author: z.enum(['deepak-chauhan']).default('deepak-chauhan'),
    ymyl: z.enum(['none', 'marriage', 'children', 'lifespan', 'health']).default('none'),
    /** The topic line of the limits box (shown on every YMYL post, and on any post that sets it). */
    limits: z.string().optional(),
    /** draft → checked → owner-ok (YMYL) → published (CONTENT_GUIDE.md §10). */
    status: z.enum(['draft', 'checked', 'owner-ok', 'published']),
    published: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    /** Only when a real, named person reviewed the post. */
    reviewedBy: z.object({ name: z.string(), role: z.string(), date: z.string() }).optional(),
    keyword: z.object({ primary: z.string(), secondary: z.array(z.string()).max(15) }),
    sources: z.array(z.union([bookSource, otherSource])).min(1),
    /** 0–8 questions; answers may use [links](/path/), **bold** and *italic*. */
    faq: z.array(z.object({ q: z.string(), a: z.string() })).max(8).default([]),
  }),
});

export const collections = { guides, blog };
