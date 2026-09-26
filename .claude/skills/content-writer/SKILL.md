---
name: content-writer
description: "Use when writing or editing any words on the PalmSays website (palmsays.com): guides (line pillars, hubs, marriage/children/simian/lifespan topics), tool-page text, blog posts, Hindi (Devanagari/Hinglish) pages, FAQs, limits boxes, alt text, button and error microcopy, the author/editorial/about pages, or llms.txt text. Triggers: 'write the heart line guide', 'translate to Hindi', 'add FAQ', 'fix this copy', 'is this claim OK', 'add sources', palmistry meanings, bad-news or sensitive lines. Applies CONTENT_GUIDE.md: templates, honesty/YMYL rules, sources that must match the app's knowledge, Hindi rules, review steps, anti-thin and anti-scaled-content rules."
---

# Content writer (PalmSays)

Source of truth: `CONTENT_GUIDE.md`. Keyword and outline: `KEYWORD_MAP.md` and `SEO_PLAYBOOK.md` (use the `seo-page` skill for titles, schema and URLs). Owner decisions: `WEBSITE_MASTER_PLAN.md` §15b.

The app's palmistry knowledge (read-only, **never edit**) is in `D:\palm ai\palm-ai-new--feat-m1-foundation`:
- `src/features/engagement/lessons.ts`: the lesson facts (EN + HI);
- `src/features/knowledge/`: `corpus-rules.ts` (meanings with citations), `sources.ts` (books and rights), `hand-role.ts` (which hand);
- `tools/extract/citations.ts`: `BLOCKED_CLAIMS`;
- `knowledge/raw/<tradition>/`: the book texts;
- `web/guides/content.mjs`: the existing EN + HI drafts of the 6 P1 guides.

## Workflow

1. **Brief:**
   - primary keyword and owned secondaries (KEYWORD_MAP);
   - the outline (SEO_PLAYBOOK §3–5, or R11 §2 for P2/P3);
   - FAQ questions from autocomplete (R11 §1).
   - Never answer in full a question another page owns: one line and a link.
2. **Gather facts before writing:**
   - the lesson facts (CONTENT_GUIDE §9.1);
   - the matching rules in `corpus-rules.ts` (each has a `meaning`, a `caveat` and `citations`);
   - for topics with no app rule (marriage, children, Mercury, simian, M, crosses, signs, hand types, fingers): the book chapter in `knowledge/raw/`.
3. **Draft in the fixed template:**
   - guide → CONTENT_GUIDE §5 (19 blocks; block 11 is a **tool card**, never an embedded tool);
   - tool page → §6;
   - blog → §7.
   - Hit the word range in §8: complete, not padded.
4. **Cite every meaning:**
   - a source chip (author, title, year, locator) and the `ruleIds` in front matter;
   - write in our own words;
   - quote only public-domain books, ≤ 25 words, never a blocked claim;
   - Benham, Raphael, Saint-Germain, St. Hill, Williams and Jain are **facts only** (rights unknown);
   - never cite "Hast Rekha Shastra (general tradition)": cite a book.
5. **Honesty pass** (below), then the fact check against the app (CONTENT_GUIDE §10 step 4).
6. **Hindi** (when needed): write it as Hindi from the checked English (same claims, same hedges), set `status: checked`, and hand it to the owner or the named Hindi reviewer. Never publish unread Hindi.
7. **Set front matter** (CONTENT_GUIDE §13): `ymyl`, `sources`, `ruleIds`, `tool`, `status`. YMYL pages wait for the owner's OK.

## Honesty rules (the short version of CONTENT_GUIDE §4)

- **Never predict:** dates, ages, marriage timing, divorce, number of marriages, whether or how many children, lifespan, death, health, fertility, money amounts.
- **The app's 7 blocked-claim types are banned here too:** death or lifespan, medical, guaranteed money outcome, fatalistic harm, criminality, character accusation, gender destiny. Name a famous scary reading only to take it apart.
- **Sensitive meanings:**
  - answer the fear in the **first sentence**, then normalise ("very common");
  - attribute ("palmistry books read this as…"), give the photo explanation when true, end with agency;
  - use the three-part block: what we see → what the tradition says → what it can't tell you.
- **Limits box** on every guide and tool page; it links to `/is-palmistry-real/`.
- **Care line** (Tele-MANAS 14416 / 988) only on `/life-line/`, `/life-line/broken/` and the "predict death" post.
- **Simian line:** medical facts first (MedlinePlus / UF Health level): a normal variation, not a diagnosis. "Single palmar crease" is the respectful medical name.
- **Mercury "health line":** never read as health.
- **Life line length ≠ lifespan**, ever.
- **When traditions disagree, show both.** Phone photos can't show islands, stars, crosses or triangles; say so.
- **AI claims:** "AI traces your lines; meanings come from a fixed rule set built from classical books." Never "accurate", "scientific", "AI palmist", "trained on ancient texts". Don't claim the rules are "expert-reviewed" (they are all `draft` in the app).
- **No remedies** (gems, pujas, mantras). No invented numbers, reviews, testimonials, timers or "was" prices. "Free" always says exactly what is free, from `site.ts`, with the price next to every store button.
- **Religion:** one neutral line only.
- **Banned words:** CONTENT_GUIDE §11 (EN + HI). Allowed: "your last free reading" (a fact).

## Voice

- **English:**
  - calm, warm and plain; short sentences; "you";
  - specific, not mystical; British spelling; sentence-case headings;
  - "PalmSays", one word;
  - no fake first-person expertise.
- **Hindi:**
  - Devanagari body in simple spoken Hindi, warm "आप";
  - key term first use: "हृदय रेखा (Heart Line / hriday rekha)";
  - titles Devanagari first + Hinglish; H1 Devanagari + a Hinglish subtitle;
  - FAQ with 1–2 Hinglish-typed questions; Hinglish only where search demands;
  - "रीडिंग", not "क्रेडिट"; Latin digits in the body; alt text in Hindi;
  - avoid bare "जीवन रेखा" in titles (a hospital brand); use "हाथ में जीवन रेखा".

## Anti-thin and anti-scaled content

- Every page answers something no other PalmSays page answers. Check KEYWORD_MAP before adding an H2.
- No templated sets per zodiac sign, city, gender, age or name. "For female / which hand" is a section, never a page.
- A variation gets its own URL only with separate demand **and** 1,000+ unique useful words with its own images; otherwise it is an H3.
- **Tool pages:** 400–900 real words under the tool.
  - Tools 4–7 need line-specific "how to spot it", types, limits and FAQ.
  - Shared boilerplate ≤ 30%.
  - Never paste the pillar's variation cards: ≤ 2 sentences per type, with a link.
- No bulk machine translation. Pace: ≤ 8 new indexable URLs a week.
- A short, complete page beats a padded one. Merge rather than add when pages overlap.

## Done when

- [ ] The template blocks are in order; the word range is met; the answer-first paragraph is ≤ 40 words.
- [ ] Every meaning has a source chip; `ruleIds` exist; no-rule topics cite a book chapter you actually read.
- [ ] The facts match CONTENT_GUIDE §9.1; there is no blocked claim and no banned word.
- [ ] The limits box is present (and the care line where required); the three-part block is used on sensitive meanings.
- [ ] Every "free" is qualified; prices and counts come from config.
- [ ] Hindi: written as Hindi, same hedges; reviewer or owner named in `reviewedBy` before publishing.
- [ ] YMYL pages: owner OK recorded.
- [ ] Byline: "Written by Deepak Chauhan" only once his author page is live (else "the PalmSays team"); "Reviewed by" only for a real reviewer.

Report back in short, simple Hinglish: what was written, what still needs the reviewer or owner, and any claim left unverified.
