---
name: seo-page
description: "Use when creating or changing any page's title, meta description, headings (H1/H2), URL or slug, canonical, hreflang, JSON-LD schema, sitemap, robots.txt, llms.txt, breadcrumbs, OG tags, internal links or keyword targeting on the PalmSays website (palmsays.com). Triggers: new guide, tool page, blog post or /hi/ Hindi page; renaming or moving a URL; adding a redirect; 'which keyword should this page target'; SEO audit or fix; Search Console page groups; structured-data or rich-result errors; cannibalisation between pages. Looks up KEYWORD_MAP.md, applies the SEO_PLAYBOOK.md template for the page type, runs the pre-publish checklist and validation."
---

# SEO page workflow (PalmSays)

Docs this skill applies (read the parts you need, don't re-read whole files):
- `KEYWORD_MAP.md`: which URL owns which keyword; cannibalisation rules C1–C21 and H1–H6.
- `SEO_PLAYBOOK.md`: page-type rules (§2), blueprints (§3–5), schema (§6), canonical/hreflang (§7), URLs (§8), sitemaps (§9), robots/llms (§10), links (§11), images (§12), budgets (§13), trust (§14), checklist (§19).
- `CONTENT_GUIDE.md`: the words themselves (use the `content-writer` skill for writing).
- `WEBSITE_MASTER_PLAN.md` §15b: owner decisions, which override everything.

## Workflow

1. **Find the owner of the keyword.** Look up the page's primary keyword in `KEYWORD_MAP.md` §2–4 (English), §3 (tools), §7 (Hindi).
   - The keyword belongs to another URL → don't target it here; link to the owner with it as the anchor.
   - The keyword isn't in the map → add a row with its evidence first. A new URL must pass the new-URL test (SEO_PLAYBOOK §15); otherwise it becomes an H2/H3/FAQ on the closest owner.
2. **Pick the page type** (SEO_PLAYBOOK §2) and copy its blueprint (§3 P1, §4 P2/P3, §5 tools). Use the exact title, meta and H1 when one exists.
3. **Write the head:**
   - title ≤ 60 characters (Hindi ≤ ~55, Devanagari first + Hinglish); primary keyword first; "palm"/"palmistry" for ambiguous heads; no brand suffix except home, `/app/` and trust pages;
   - meta ≤ 155 characters; one H1; the answer-first paragraph ≤ 40 words; H2s phrased as the questions people type;
   - "free" only with the qualifier from `site.ts` on the first screen.
4. **Technical tags** (all server-rendered in the static `<head>` by `SeoHead`):
   - self-referencing absolute canonical with the trailing slash, `https://palmsays.com/...`;
   - hreflang `en` + `hi` + `x-default` (→ English) **only if the twin is live**, on both sides;
   - JSON-LD for the page type (§6); OG/Twitter tags that belong to this page, in its language;
   - `max-image-preview:large`, or `noindex` for the utility pages.
5. **Sitemap and links:**
   - put the URL in the right group sitemap (§9), or in none if it is `noindex`;
   - ≥ 2 internal links in, ≤ 3 clicks from home;
   - links out: the home CTA, `/is-palmistry-real/` from the limits box, 2–4 siblings, the matching tool or guide, `/app/` in the end block.
6. **Run the checklist** (SEO_PLAYBOOK §19) and **validate** (below).
7. **Record it:** update the `KEYWORD_MAP.md` row (URL, status, new keywords) and, after meaningful work, the plan's §17 status, in the same turn.

## Hard rules (never break)

- **Frozen App Link paths:** `/palm-reading`, `/hand-lines`, `/heart-line`, `/head-line`, `/life-line`, `/fate-line` and the same six under `/hi/`, with and without the trailing slash. Never rename, move or redirect them to another path (only the usual no-slash → slash 301 applies). Never add a sub-path (like `/life-line/broken/`) to App Links.
- **Any other URL change** = in one commit:
  - a single-hop 301, kept forever;
  - internal links, sitemap, canonical, hreflang partner, `llms.txt` and the KEYWORD_MAP row updated;
  - never reuse an old slug for a new topic.
- **URL format:**
  - lowercase ASCII, hyphens, 1–3 words, no dates, no `.html`, trailing slash;
  - `/hi/` pages reuse the English slug; Hindi-only pages get ASCII Hinglish slugs.
- **One canonical home per tool:** `/tools/<slug>/` (tool 1 = `/`). Guides link to tools with a tool card and never embed a copy. Tool results never create indexable URLs.
- **Schema never contains** `AggregateRating`, `Review`, the Play rating, `HowTo`, or `Product`/`Offer` for app packs. There is no FAQ rich-result expectation (`FAQPage` only with ≥ 3 visible FAQs).
- **noindex:** `/reading/`, `/account/`, `/delete-account/`, `/reset-password/`, `/404` and tool-result states. Don't block them in robots.txt: Google must crawl them to see the `noindex`.
- **robots.txt allows all crawlers, AI bots included**, unless the owner says to block one. Check that Cloudflare's AI-bot blocking isn't adding disallows.
- **Hindi pages go live only after** the owner or the named Hindi reviewer reads them. Never set a Hindi canonical to the English twin.
- **No numbers typed by hand:** the base URL, brand, prices and free-reading counts come from `src/config/site.ts`.

## Title quick patterns

| Type | Pattern | Example |
|---|---|---|
| Line pillar | `<Line> on Palm: Meaning, Types & …` | Heart Line on Palm: Meaning, Types & the Love Line |
| Spoke guide | `<Topic> on Your Palm: …` | M on Your Palm: What the Letter M Means in Palmistry |
| YMYL guide | an honesty cue | Children Lines on Palm: What Palmistry Says, Honestly |
| Tool | `<Tool name>: <benefit or question>` | Palm Photo Checker: Is Your Photo Good Enough to Read? |
| Hindi | `<Devanagari> \| <Hinglish>` | हृदय रेखा: मतलब, प्रकार और चित्र \| Hriday Rekha |

## Validation

The project is not scaffolded yet. Once it is:
- `check-site` (planned build script) checks:
  - title and meta lengths, one H1, canonical, hreflang pairs both ways;
  - broken links, sitemap = indexable pages, orphans (< 2 inlinks);
  - banned schema types, the `LimitsBox` on YMYL pages, banned words, `ruleIds` exist.
- Google Rich Results Test + validator.schema.org on each template after any `SeoHead` change.
- Lighthouse CI within the SEO_PLAYBOOK §13 budgets.
- After deploy: fetch the live HTML (not the browser DOM) and confirm the title, canonical, hreflang and JSON-LD are in the static `<head>`. Check `/robots.txt` and `/sitemap-index.xml` on the live host.

Until then, check lengths by hand (count characters) and state what wasn't validated.

## Report back (short, Hinglish for the owner)

What page changed, which keyword it targets, anything moved or redirected, and what is still unverified.
