---
name: palmsays-ui
description: Use whenever building or changing any PalmSays website UI, page, component, style or animation — Astro pages and layouts, React/Preact islands, Tailwind 4 tokens in global.css, colours, fonts, spacing, icons, images, SVG diagrams, motion, responsive layout, the Day/Night theme or Hindi (Devanagari) typography. Covers the home hero and upload card, line-trace viewer, locked cards, tool pages, guide blocks, header, footer, sheets, forms, store buttons and QR tile. Loads Anthropic's frontend-design guidance and DESIGN_SYSTEM.md, enforces the non-negotiables, and ends with mobile 390 + desktop 1440 screenshots.
---

# PalmSays UI

The PalmSays site (palmsays.com) uses Direction A, **"Nakshatra Night Web"**: temple gold on midnight indigo, with a real traced palm as the hero. It is dark by default and has a Day toggle. Every UI change must look premium, match the app's brand, and stay honest and fast on a budget Android phone.

## 1. Load before touching UI

1. **`.claude/skills/frontend-design/SKILL.md`**: Anthropic's official guidance. Follow its process: plan, review the plan against the brief, build, then critique with screenshots. The brief here is fixed by `DESIGN_SYSTEM.md`. Where the two differ, **DESIGN_SYSTEM.md wins**.
2. **`DESIGN_SYSTEM.md`**: always read §1 (the brief), §2 (colour), §3.4 (type rules) and §13 (never do). Then read the §7 component you are touching, and §5, §6 or §11 if you change motion, tokens or weight.
3. For copy, CTAs, lock or credit messaging, store buttons or flows, also load the **`ux-conversion`** skill.
4. **`PROJECT_MASTER.md`**: find the feature ID and its status. A **new** feature needs a plan in chat and the owner's approval before any code. Never rebuild a component that already exists; search `src/components` and `src/islands` first.

## 2. Non-negotiables

- **Tokens only.**
  - Use the classes from `src/styles/global.css` (`bg-page`, `bg-surface-1`, `text-fg`, `text-fg-muted`, `text-accent`, `border-edge`, `rounded-card`, `text-h2`, `gold-fill` …).
  - No raw hex, no `px` font sizes, no arbitrary values (`[#…]`, `[13px]`), no default Tailwind palette.
  - A missing token is added to DESIGN_SYSTEM.md **and** global.css, with its contrast checked.
- **One filled-gold action per viewport state.**
  - The header uses an outline button.
  - The bottom bar hides while the hero or upload card is visible.
  - A sheet's gold button replaces the page's.
  - Secondary actions stay readable (surface-2 fill), never tiny or grey.
- **Night is the default, and Day must also work.** Line colours follow the surface, not the theme. On photos and on the diagram palm, always use the trace colours with the `#1A1440` halo. Brand gold is never text or a thin line on Day; use `--accent` (goldInk there).
- **Hindi typography:**
  - `lang="hi"` on every Devanagari element.
  - Tiro Devanagari Hindi for display text (28px and up), Mukta for everything else.
  - **Letter-spacing is 0**, never italic, line height ≥ 1.45 on Hindi headings, no clipped vowel marks, no fixed heights.
  - Devanagari on English pages uses `.script-system`, so English pages never download a Devanagari font.
  - Mukta weights are 400 and 700 only.
- **No template chrome:**
  - no ALL-CAPS or tracked eyebrows;
  - no single accented word in a headline;
  - no "A · B · C" strings, no "→" on buttons, no emoji icons, no flags;
  - no stars, zodiac wheels, nebulae or ॐ decoration;
  - no identical cards everywhere.
- **Depth:**
  - **no box shadows**; depth comes from surface steps plus the 1px edge;
  - the gold hairline appears once per page;
  - glass is for floating layers only, and blur only at ≥ 1024px with hover. **Never blur on mobile.**
- **Motion:**
  - one orchestrated moment per page (the beam, then the line trace); everything else answers input;
  - animate only `transform`, `opacity` and `stroke-dashoffset`;
  - content is visible without JS;
  - respect `prefers-reduced-motion` and Save-Data.
  - Traced lines must sit **exactly** on the photo (the viewer spec is in §7.5).
- **Accessibility:**
  - 48 × 48px hit areas;
  - a visible focus ring (`--focus`, 2px, offset 2px);
  - contrast of 4.5:1 for text and 3:1 for UI;
  - icons always with text; state never shown by colour alone;
  - text at 200% zoom with no horizontal scroll; alt text in the page's language.
- **Performance** (DESIGN_SYSTEM.md §11):
  - guides ship 0 KB JS; the home page ≤ 60 KB; tool pages ≤ 70 KB, or ≤ 20 KB for rule-based tools; `/reading/` ≤ 180 KB;
  - fonts self-hosted, split by `unicode-range`, at most 2 preloads;
  - hero AVIF ≤ 45 KB at 480w;
  - no third-party scripts except Turnstile on `/reading/`.
- **Honesty in pixels:**
  - no fake counters, countdowns, struck prices, "viewing now" or invented ratings;
  - no blurred or "██" locked text (locked text is never in the DOM);
  - no prediction imagery;
  - no AI-generated hands;
  - no cookie banner (and no cookies);
  - the price line under every store button.

## 3. Build checklist

1. **Plan in chat.** Say which tokens and components you'll use, the layout at 390 and at 1440, the one gold action per state, and the one bold thing. Review the plan against DESIGN_SYSTEM.md §1 and §13, and against frontend-design's list of AI-default looks. Revise anything generic before coding.
2. **Build mobile first (390px)**, then the tablet and desktop gutters (20 / 32 / 48). Text containers are at most 680px wide.
3. **Semantics first:** real `<button>` and `<a>` elements, one `<h1>`, no skipped headings, `<figure>` + `<figcaption>` for traced photos, `<details>` for FAQs, labels above fields.
4. **English and Hindi twins:** build the `/hi/` version from the same component, with the `:lang(hi)` sizes. Test mixed-script lines and digits.
5. **All states:** default, hover, focus, pressed, busy, disabled, error, empty, "not clearly seen", reduced motion, Night and Day.
6. **Weight:** check the gzip size of any new JS, CSS, font or image against §11. Islands load `client:visible` or `client:idle`, never `client:load`, unless they are the hero action.
7. **Grep before finishing:** no raw hex, `shadow-`, `blur-`, `tracking-`, `uppercase`, `→`, `·` joins or emoji in the files you changed.

## 4. Verify: screenshots, then look at them

Run in the website folder (`D:\palm ai\palm-ai-website`). On this machine PowerShell blocks `npm.ps1`, so use `npm.cmd` and `npx.cmd`.

```
npm.cmd run dev                                   # Astro dev server, usually http://localhost:4321/
node research-tools/shot.mjs .shots/<date>-<page> http://localhost:4321/<path>/ http://localhost:4321/hi/<path>/
```

- `shot.mjs` saves these for each URL:
  - mobile 390×844 @2x, fold and full page;
  - desktop 1440×900, fold and full page;
  - a `__styles.json` of the fonts, colours and CTAs it found.
- It waits about 2.5s, so the fold shot shows the finished hero trace.
- Keep `.shots/` out of git (add it to `.gitignore`).
- **Open the PNGs with Read and check:**
  - Is exactly one gold action visible in each fold?
  - Is the upload card fully inside the first mobile screen, with nothing overlapping it?
  - Do the lines sit exactly on the photo? Are "not clearly seen" lines dashed chips, and never drawn?
  - Is the Hindi rendered in Tiro and Mukta, with no clipped vowel marks, no tracking and no system-font fallback?
  - Is there no horizontal scroll at 390px, and do fixed bars take 20% of the height or less?
  - Is the contrast readable (no faint text on surface-3), with no leftover default Tailwind colours in `__styles.json`?
  - Does anything look like a generic astrology or SaaS template? If so, fix it.
- **Day theme:** capture it too when a page is Day-relevant (guides, blog). *(rec)* Let the inline theme script accept `?theme=day` for previews, without writing to storage.
- **One screenshot round per meaningful visual change.** Don't loop, and don't re-shoot after tiny style-only edits.
- **Report:** tell the owner in short, simple Hinglish what changed, and include the screenshot paths. Update `PROJECT_MASTER.md` (status from evidence, with the screenshot paths as evidence) in the same turn.
