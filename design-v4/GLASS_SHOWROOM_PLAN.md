# Glass showroom pass: site-wide premium plan (WEB-DEC-042, proposed)

Status: **BUILT 2026-09-26**; gate PASS; waiting for the owner phone test. Builds on WEB-DEC-041 (glass cards on home Tools + Guides).

Owner brief: make the whole site feel like a luxury glass showroom (3D depth, glass, shadows, rounded corners, lighting, smooth motion) **without** changing pages, layout, content flow, navy + gold identity or information architecture. Fast, readable, not cluttered.

## 1. Rules that do not change

- Same pages, same sections, same order, same text. Glass and motion are finish only.
- Same content on phone, tablet and desktop (Google mobile-first indexing). Animations never hide text: every element is visible in the HTML without JS.
- One gold action per viewport state. Glass never turns a secondary action gold.
- Text contrast ≥ 4.5:1 on every glass surface, in Night and Day, English and Hindi (checked with numbers, not by eye).
- Real product visuals only (real app/reading screens, real sample scan). No fake screens, no fake numbers.
- Reading flow logic, credits, privacy copy and SEO tags are not touched. CSS and presentation only.

## 2. Foundation (one place, `src/styles/global.css`)

Everything else uses these tokens, so the look stays consistent and can be tuned in one file.

- **Radius scale:** 8 (chips, inputs), 12 (inner tiles/wells), 20 (cards), 28 (big panels, phone frames, sheets), pill (buttons). Nested radius = outer minus padding, so corners look concentric.
- **Elevation (3 levels):** `e1` resting card, `e2` hovered / floating, `e3` sheets and the sticky bar. Each is a stack of 2-3 soft shadows (tight contact shadow + wide ambient), Night and Day versions.
- **Glass (3 levels):** `glass-1` cards (the WEB-DEC-041 fill), `glass-2` floating bars (header, sticky CTA), `glass-3` sheets and dialogs (strongest blur). Top-edge light line on all; a faint gradient border ("rim light").
- **Light:** `glass-stage` section glow (violet top-left, gold bottom-right) on alternating sections, so the page has depth without being noisy. A soft moving sheen only on the one hero-level object per page.
- **3D:** gentle perspective tilt (max 4°) that follows the pointer, **desktop only**, on phone mockups, the sample report and the app phone. Tiny vanilla script (< 1.5 KB), no library.
- **Motion tokens:** 150 ms (colour), 240 ms (lift), 420 ms (entrances), one ease-out curve. Scroll reveal: fade + 12 px rise, once, staggered 60 ms, via IntersectionObserver. Content is visible when JS is off: the hidden start state applies only after the script adds `data-reveal` to `<html>`, and a 1.5 s fallback shows everything if the observer never fires. Transforms only, so no layout shift (CLS stays 0).
- **Safety switches:** `prefers-reduced-motion` → no tilt, no reveal, no sheen. `prefers-reduced-transparency` → solid surfaces. Low-end devices (≤ 4 cores, ≤ 4 GB, Save-Data; the existing lite check in `hand-story.ts`) → no backdrop blur, no tilt. Backdrop blur on cards only on desktop with a hover pointer; phones get the same layered look from gradients (blur is what makes cheap Android phones stutter).

## 3. Rollout by area

1. **Site shell:** header (glass-2 after scroll, rim light, active-link underline glides), menu sheet (glass-3, rows as glass rows), footer (glass panel with a glowing top divider, rounded link groups), sticky CTA bar (glass-2 + e3), 404 page.
2. **Buttons and small parts:** gold button gets a 3D bevel (top highlight, inner bottom shade, soft gold glow on hover, presses down 1 px); secondary = glass pill; outline = rim-lit; chips, store button, QR tile, locked card (frosted), breadcrumbs, focus rings (gold glow ring).
3. **Home:** hand story (only the headline card and scan button get the polish; its motion stays as built); "What your palm reveals" cards; how-it-works phones become 3D phone frames (real screenshots, reflection sheen, tilt on desktop); tools + guides (done, align to tokens); sample report band becomes a glass "report on a pedestal" with the locked parts frosted; FAQ as a glass accordion with smooth open/close; app section card with 3D phone + glass QR tile.
4. **/app/ and /hi/app/:** price card, packs and plans as glass tiers (the free tier highlighted by rim light, not gold fill), store button, phone mockup.
5. **Tools hub + 13 tool pages:** `ToolLayout` + `tools.css`: tool panel as glass-1, photo drop zone as a glowing glass well with animated dashed rim while dragging, result cards e1/e2, choice chips as glass pills, progress bar with a light sweep.
6. **Guides (11) :** `GuideLayout`, FindPanel, figure frames (photo in a rounded glass frame with e1), Variation cards, KeyPoint / LimitsBox / Myth callouts as tinted glass, ToolCard, RelatedGuides, EndCta.
7. **Reading flow (`reading.css`, React):** screens, upload, scan wait, report sections and locks, sheets: CSS only, same components and logic.
8. **Legal pages, about stub:** readable prose on a single glass panel; nothing else.

Work order: 1 → 2 first (shared), then 3-8 in parallel by area, each touching only its own files. One combined phone test sheet at the end.

## 4. Checks before calling it done

- `npm run gate` (check, lint, tests, build, check:web): CSS/JS weight budgets must still pass.
- Screenshots of every page type at 390 and 1440, Night and Day, English and Hindi (`research-tools/section-shots.mjs`, extended to full pages).
- A throttled run (4× CPU slowdown, like a cheap Android) scrolling the home page: no jank from blur or reveal.
- Contrast numbers for text on each glass level.
- Reduced motion and reduced transparency screenshots.

## 5. Docs to update when built

`DESIGN_SYSTEM.md` §4 (elevation, glass, motion rewritten to this system), `DECISIONS.md` WEB-DEC-042, `PROJECT_MASTER.md` handoff.
