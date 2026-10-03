# PalmSays design system

Direction A, **"Nakshatra Night Web"** (owner approved, 2026-09-26). This is the web edition of the app's "Nakshatra Night — Glass edition" brand. The page is dark by default, and a Day toggle switches it to a light theme.

**Status:** this is the source of truth for every PalmSays UI decision. `WEBSITE_MASTER_PLAN.md` §5 and `research/08-design-direction.md` are the history behind it. Where they disagree, this file wins. To change a token, update it here and in `src/styles/global.css` in the same commit, then log the change in the plan's §17.

**Labels used below:**
- *(derived)*: a value this file computed that the research did not give. Its contrast was checked with the WCAG 2.x formula on 2026-09-26.
- *(open)*: an owner decision or a measurement is still needed.
- *(rec)*: a recommendation. Change it if evidence says otherwise.

**Where the values come from:**
- Brand tokens are the app's own values, taken from `palm-ai-new--feat-m1-foundation/src/theme/index.ts` and `src/components/billing/premium.tsx` (read-only).
- Copy and the reasons behind each rule are in `UX_PSYCHOLOGY.md`.

**The owner's `competitors ss/` screenshots** are Semrush domain overviews, not UI. They set the SEO bar, not the visual one. Organic traffic per month: palmist.io 19.1K, palmreading.pro 6.1K, pandit.ai 2.9K, palmmitra.in 280. Visual references are in `research/screens/`.

---

## 1. The brief in six rules

1. **The subject is a real hand with its lines traced on it.** The traced palm is the hero and the one bold thing on any page. There are no stars, zodiac wheels, nebulae, stats rows or ॐ decoration.
2. **One filled-gold action per viewport state** (see §7.1). Everything else is quieter.
3. **Night is the brand default.** Day is a reading theme for guides, the blog and print. The choice is stored in `localStorage` only.
4. **Hindi is first-class.** It has its own serif, a larger size, taller lines, zero letter-spacing, and `lang="hi"` on every Devanagari element.
5. **The design never lies.** No fake proof, no pressure devices, no hidden costs, no prediction imagery. The copy rules are in `UX_PSYCHOLOGY.md`.
6. **Built for an ₹8,000 Android phone on slow 4G.** Pages are static HTML, there is one animation per page, mobile gets no blur, and the budgets in §11 apply.

---

## 2. Colour

Contrast figures are WCAG 2.x ratios. AA needs 4.5 for body text and 3.0 for large text and UI boundaries.

### 2.1 Night theme (default)

| CSS var | Hex / value | Role | Contrast |
|---|---|---|---|
| `--page` | `#0B0A1F` | Page background | fg 17.1, muted 10.4, faint 5.9 |
| `--surface-1` | `#15132F` | Cards, header, footer, sheets | fg 15.8, muted 9.7, faint 5.5 |
| `--surface-2` | `#1E1B42` | Inputs, raised items, secondary button | fg 14.3, muted 8.7, faint 4.9 |
| `--surface-3` | `#2A2654` | Tracks and disabled fills. **Never faint text on it (4.2).** | muted 7.5 |
| `--border` / `--border-strong` | `#2A2654` / `#3A3570` | Decorative dividers only (1.7:1) | — |
| `--control-border` | `#6F68A6` *(derived)* | Boundaries of inputs and toggles | 3.6 on surface-1, 3.3 on surface-2, 3.9 on page |
| `--edge` | `rgba(246,240,225,0.08)` | The soft 1px ivory edge of a content card | — |
| `--hairline` | `rgba(230,184,92,0.32)` | The one gold frame per page (the hero palm or the upload card) and selected controls | — |
| `--fg` | `#F6F0E1` | Main text (moonlit ivory) | see above |
| `--fg-muted` | `#C3B9D8` | Secondary text | see above |
| `--fg-faint` | `#8F88B5` | Captions only (13px or larger) | see above |
| `--accent` | `#E6B85C` | Gold as text, links and icons | 10.6 on page, 9.8 on s1, 8.8 on s2 |
| `--accent-soft` | `rgba(230,184,92,0.14)` | Fill of a selected chip or segment | — |
| gold stops | `#F5D98B` → `#E6B85C` → `#CFA049` | Gold button gradient (135°); `#CFA049` is also the pressed fill | label `#1F1300`: 13.2 / 9.9 / 7.6 |
| `--on-gold` | `#1F1300` | Text on gold. **Never white on gold (1.7).** | — |
| `--focus` | `#F5D98B` | Focus ring | 14.1 on page |
| `--success` / `--warning` / `--danger` | `#2BB3A3` / `#FFC857` / `#FF6B6B` | Status, **always with an icon and words** | 7.5 / 12.7 / 7.0 on page |
| `--glass` / `--glass-edge` | `rgba(21,19,47,0.88)` / `rgba(246,240,225,0.14)` | Floating layer only (§4.3) | fg ≈ 15.8 |
| `--scrim` | `rgba(6,5,18,0.72)` | Behind sheets | — |
| hero gradient | `#221A4E → #15132F` (180°) | The one framed brand moment (hero frame, lock sheet, share card) | fg 13.9, gold 8.6 |

### 2.2 Day theme (guides, blog, print, or the user's choice)

| CSS var | Hex / value | Contrast |
|---|---|---|
| `--page` | `#F7F5FC`: a cool lavender-white, **deliberately not cream** | fg 16.2, muted 8.1, faint 5.0 |
| `--surface-1` | `#FFFFFF` (cards) | fg 17.5, muted 8.7, faint 5.5 |
| `--surface-2` | `#ECE8F7` (raised items, inputs) | fg 14.6, muted 7.3, faint 4.5 (captions only) |
| `--surface-3` | `#DDD7EE` *(derived)* | fg 12.6, muted 6.3 |
| `--border` / `--border-strong` | `#E4DFF3` / `#C9C1E0` *(derived)* | Decorative only |
| `--control-border` | `#7A72A8` *(derived)* | 4.1 on page, 4.4 on white |
| `--edge` | `rgba(23,19,61,0.08)` *(derived)* | — |
| `--hairline` | `rgba(122,82,0,0.32)` *(derived)* | — |
| `--fg` / `--fg-muted` / `--fg-faint` | `#17133D` / `#4B4574` / `#6A6492` | see above |
| `--accent` | `#7A5200` ("goldInk"): links and gold-as-text | 6.4 on page, 6.9 on white, 5.8 on s2 |
| `--accent-soft` | `rgba(122,82,0,0.10)` *(derived)* | — |
| Brand gold `#E6B85C` | **Fill only**, with `#1F1300` text. On paper it is 1.7:1, so it is never text, a thin line or an icon on Day. The gold button gets a 1px `--hairline` border on Day so its shape holds. | — |
| `--focus` | `#7A5200` | 6.4 on page |
| `--success` / `--warning` / `--danger` | `#0F7A6E` / `#8A5A00` / `#B3261E` *(derived)* | 4.8 / 5.5 / 6.1 on page |
| `--glass` / `--glass-edge` | `rgba(247,245,252,0.92)` / `rgba(23,19,61,0.12)` *(derived)* | — |

**Theme mechanics:**
- `<html data-theme="night|day">`. A tiny inline script in `<head>` reads `localStorage` inside try/catch and sets the attribute before first paint, so the page never flashes the wrong theme. This script is the one allowed exception to the "0 KB JS" rule on guide pages.
- With no stored choice the theme is Night. The page does **not** follow `prefers-color-scheme`, because the hero moment is designed for dark. That choice is the owner's to revisit.
- Printing always uses the Day values.
- `color-scheme: dark` on Night and `light` on Day, so native controls and scrollbars match the theme.

### 2.3 Line colours and the halo rule

**v4 (2026-09-26, owner, `DESIGN_V4_BRIEF.md`):** the website uses the classic set (heart red, head blue, life green, fate purple). The app keeps its own colours. Old values: life `#F07A5A`, head `#6EA8FF`, heart `#F27BB0`, fate `#A993FF`.

| Line | Trace colour (photos and diagram palm, both themes) | On Night page | Day twin (text and dots on paper) | On Day paper | Hindi |
|---|---|---|---|---|---|
| Life | `#2FD06A` | 9.6 | `#137A3A` | 5.0 | जीवन रेखा |
| Head | `#4C8DFF` | 6.1 | `#1F5BC4` | 5.8 | मस्तिष्क रेखा |
| Heart | `#FF4D5E` | 6.0 | `#C8102E` | 5.4 | हृदय रेखा |
| Fate | `#B26BFF` | 6.0 | `#6440D0` | 6.1 | भाग्य रेखा |

**v4 type and footer (2026-09-26):** every section title (`h2`) is set in the display serif, as in the home story (`--fs-h2` 2–3rem, `--lh-h2` 1.1; `--fs-h1` 2.25–3.75rem); an `h2` at h3 size inside a card stays in the sans. Section spacing 4.5rem phone / 8rem desktop. The drawn palm is fine ivory-gold line art on a faint glaze, no filled purple hand. The footer carries no store button: each page's own app block has it, with the price beside it.

- **A line's colour follows the surface it sits on, not the theme.**
  - On a photo, or on the stylised palm (`#3A3078 → #1D1850`), always use the trace colours with a halo.
  - The Day twins are only for line names, dots and diagrams drawn directly on paper.
- **The halo:** every traced line is drawn over a `#1A1440` stroke about 1.4× its width, with round caps and joins, as in the app's `icon.svg`.
  - Without the halo, the life line on the diagram palm is only 4.1:1.
  - *(rec)* Line 3px, halo 4.2px, with `vector-effect: non-scaling-stroke` so that zooming doesn't fatten the lines.
  - **Exception, the web reading's photos (WEB-DEC-043):** the live scan and the report photo use the app's thin, shiny style instead of the halo: a colour glow 3.5 px at 22%, a 1 px core and a 0.4 px white sheen, in screen pixels; faint lines are dashed 4 4. Colours stay the classic trace set above.
- **Line colours are data.** They never appear in UI chrome: not in buttons, borders, headings or backgrounds.
- A "bad-sounding" line keeps its normal colour. Nothing is ever shown in red or as a warning.
- The logo keeps its own pink, cyan and green lines (`#FF7FA6`, `#5FD4FF`, `#6FE89A`) **inside the logo only**.

---

## 3. Typography

### 3.1 Families

| Use | Latin | Devanagari |
|---|---|---|
| Display, **28px and up only** | Cormorant Garamond 700 | Tiro Devanagari Hindi 400, upright only |
| Body and UI, both scripts | Mukta 400 and 700 | Mukta 400 and 700 (Ek Type's Devanagari-first family; the weights match across scripts) |
| Wordmark | Cinzel, **inside the logo SVG only** (no Cinzel web font) | — |

- **Pairing:** a high-contrast classical serif for the one brand line, against a humanist sans that stays readable at 16–18px on cheap LCD screens. Hindi gets a real Devanagari serif, not a Latin serif's weak fallback.
- This adds zero new fonts compared with the app.
- **Weights are 400 and 700 only.** This changes R08, which listed Mukta 500 for small text and 600 for strong text. There are two reasons:
  - each extra Devanagari weight file is about 100 KB;
  - a weight that has a Latin file but no Devanagari file can make Hindi text in that weight fall back to the system font.
- `font-synthesis: none`, so the browser never fakes bold or italic.

### 3.2 Loading

These sizes were measured from Fontsource `woff2` subsets on 2026-09-26.

| File | KB |
|---|---|
| Mukta latin 400 / 700 | 20.0 / 21.1 |
| Mukta devanagari 400 / 700 | 97.0 / 102.6 |
| Cormorant Garamond latin 700 | 21.8 |
| Tiro Devanagari Hindi devanagari 400 | 96.5 |

- **Self-host** the files through the Astro Fonts API or Fontsource. There are no requests to Google Fonts, which keeps the site cookie-free and saves a DNS lookup.
- **Split by `unicode-range`** (latin, latin-ext, devanagari), so English pages never download a Devanagari file.
  - **Gotcha:** the "हिंदी" / "अA" labels on English pages would pull in the 97 KB Devanagari Mukta file. Render them with the system Devanagari stack (`.script-system`: "Noto Sans Devanagari", "Kohinoor Devanagari", "Nirmala UI", sans-serif; Mukta is **not** in the stack) or as an inline SVG.
- **Preload at most 2 files**:
  - English pages: Mukta latin 400 and Cormorant 700.
  - Hindi pages: Mukta devanagari 400 and Tiro devanagari.
- `font-display: swap`, with metric-matched fallbacks (`size-adjust`, `ascent-override`) so the swap causes no layout shift.
- The Devanagari fallback on Android is the system's Noto Sans Devanagari.

**Budget (§11):**
- **English pages: 63 KB. Passes the ≤ 120 KB budget.**
- **Hindi pages: 337 KB against a ≤ 180 KB budget** (359 KB if a Hindi headline contains Latin text and pulls in Cormorant). This set is Mukta dev 400/700, Mukta latin 400/700 and Tiro dev. **(open)** Recommended path:
  1. Subset the Devanagari files to Hindi code points with layout closure kept (hb-subset through `subfont`, or `pyftsubset --layout-features='*'`).
  2. Subset Tiro at build time to the display strings the Hindi pages actually use (it only ever sets headlines).
  3. Re-measure.
  4. If it is still over budget, the owner decides between a Hindi budget of about 260 KB and using the system Noto Sans Devanagari for Hindi body text.

### 3.3 Type scale

The scale is fluid between 360px and 1280px viewports. Sizes use rem, so browser zoom and the phone's font setting still work. Hindi is one step larger, because Devanagari looks smaller at the same pixel size and its vowel marks need room.

| Token | English size | EN line height | Hindi size | HI line height | Face / weight |
|---|---|---|---|---|---|
| `display` | `clamp(2.5rem, 1.7174rem + 3.478vw, 4.5rem)` (40 → 72) | 1.08 | `clamp(2.125rem, 1.4891rem + 2.826vw, 3.75rem)` (34 → 60) | 1.45 | Cormorant 700 / Tiro |
| `h1` | `clamp(2rem, 1.5109rem + 2.174vw, 3.25rem)` (32 → 52) | 1.15 | `clamp(1.75rem, 1.3587rem + 1.739vw, 2.75rem)` (28 → 44) | 1.45 | Cormorant 700 / Tiro |
| `h2` | `clamp(1.625rem, 1.3804rem + 1.087vw, 2.25rem)` (26 → 36) | 1.2 | `clamp(1.5rem, 1.3043rem + 0.870vw, 2rem)` (24 → 32) | 1.5 | Mukta 700 |
| `h3` | `clamp(1.25rem, 1.1522rem + 0.435vw, 1.5rem)` (20 → 24) | 1.3 | same | 1.55 | Mukta 700 |
| `lead` | `clamp(1.1875rem, 1.1386rem + 0.217vw, 1.3125rem)` (19 → 21) | 1.55 | `clamp(1.25rem, 1.2011rem + 0.217vw, 1.375rem)` (20 → 22) | 1.7 | Mukta 400 |
| `body` | 1.0625rem (17) | 1.6 | 1.125rem (18) | 1.75 | Mukta 400 |
| `small` | 0.9375rem (15) | 1.5 | 1rem (16) | 1.6 | Mukta 400 |
| `caption` (the minimum) | 0.8125rem (13) | 1.45 | 0.875rem (14) | 1.55 | Mukta 400 |

### 3.4 Rules

- **Letter-spacing is 0 on anything that can render Devanagari.** Tracking breaks the shirorekha, the top line that joins the letters. The only exception is −0.01em on English display text (`:lang(en)`). **No ALL-CAPS labels** and no tracked-caps eyebrows.
- **Line length:** at most 68ch in English and about 60ch in Hindi. Body text never runs the full width of the page.
- **Hindi headings:** line height 1.45 or more. Never clip the vowel marks: no `overflow: hidden` on a single line of Devanagari, and no fixed heights.
- **Devanagari is never italic.** Cormorant italic isn't loaded; for emphasis use weight 700 or a quote block.
- **`lang` on every element whose language differs from the page** (`<span lang="hi">हृदय रेखा</span>`). The CSS switches the Hindi fonts and sizes through `:lang(hi)`.
- **Digits:**
  - Body digits are Latin, as people type them.
  - Devanagari numerals are only for the decorative step numbers on `/hi/`.
  - Test mixed-script lines. Cormorant has old-style figures, so keep it off prices and numbers in body text.
- **Sentence case everywhere.** Never accent one word in a headline with colour, italic or bold (a template tell). No "A · B · C" meta strings. No "→" appended to buttons or links.

---

## 4. Space, layout, radius, depth

### 4.1 Spacing and layout

- **4pt scale:** 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. This is Tailwind's default `--spacing: 0.25rem`, so `p-4` is 16px.
- **Side gutter:** 20px under 768px, 32px from 768px, 48px from 1024px.
- **Section spacing:** 64px on mobile, 112px on desktop.
- **Containers:** text 680px, content 1,120px, wide 1,280px.
- **Breakpoints:** Tailwind's defaults (`sm` 640, `md` 768, `lg` 1024, `xl` 1280). Design at 390 first, then check 1440.
- No horizontal scroll at 360–390px. Text can scale to 200%.
- Fixed bars together take up **20% of the screen height or less**.
- **Alignment:**
  - Text is left-aligned, including in Hindi.
  - Only the hero headline block may be centred, and only on mobile, and only if it is 3 lines or fewer.
  - Tables become stacked cards at 390px. Never use a 3-column table on a phone.

### 4.2 Radius (hierarchy, not decoration)

| Token | px | Use |
|---|---|---|
| `tag` | 8 | Tags, progress bars |
| `input` | 12 | Inputs, the QR tile, small boxes, notices |
| `card` | 20 | Cards |
| `hero` | 28 | The one hero frame, the upload card, sheets |
| `pill` | 9999 | Buttons, chips, the language and theme toggles |

Not everything gets 20. Identical radius on everything is the "SaaS card kit" tell.

### 4.3 Elevation and glass

- **Showroom system (WEB-DEC-042, owner 2026-09-26; supersedes the rules below where they differ):** the whole site uses the "Showroom layer" at the end of `src/styles/global.css`: a fixed aurora + film grain behind `body`; rim-lit glass (`.glass-card`, `.card`, `.glass-panel`, `.glass-well`, `.chip-glass`: `--glass-1` fill over an almost-opaque `--glass-base`, `--rim` gradient border, `--shine` top highlight, `--e1/--e2/--e3` elevation); gold foil text (`.foil`, `<em>` in h1/h2); 3D gold `.btn-gold` with a shine sweep, glass `.btn-secondary`; real-looking `.device` phone frames; card titles (`h3`) in the display serif. Motion: `src/scripts/showroom.ts` reveals blocks on scroll (hidden only after the script runs; off under reduced motion) and, on desktop with a fine pointer, adds a card spotlight and device tilt. Backdrop blur only on desktop with hover and not on low-end devices (`html[data-lite]`). Fixed colours used by components are named tokens in `@theme static` (no raw hex in components). The header is a floating glass capsule; the footer a lit glass floor.
- **Glass cards (WEB-DEC-041, owner 2026-09-26, replaces "no box shadows"):** main-section cards use `.glass-card` (`global.css`): the `--gc-fill` layered gradient, a 1px `--gc-edge`, a top-edge shine and soft depth (`--gc-depth`); links lift 3px with a gold edge + glow on hover (`--gc-depth-hover`; no lift under reduced motion). Inset tiles use `.glass-well`; the section behind them gets `.glass-stage` (soft coloured light). Backdrop blur only on desktop with a hover pointer; phones get the same look without blur. Keep each section's layout; the glass is finish, not a redesign. First used: home Tools + Guides.
- Elsewhere depth still comes from the 3 surface steps and the 1px `--edge`.
  - The app's `GoldButton` glow is **not** carried over to the web.
  - Shadow and blur utilities are removed from Tailwind (§6) so they can't creep in.
- **The gold `--hairline` appears once per page**, on the single hero (the palm frame or the upload card). Selected controls may also use it.
- **Glass is for the floating layer only:** the sticky header after 24px of scroll, the mobile bottom CTA bar, the menu sheet and the language sheet. It is `--glass` plus a 1px `--glass-edge`.
  - **Reading content is never on glass.**
  - `backdrop-filter: blur(12px)` is used only when `(min-width: 1024px) and (hover: hover)` and `@supports` both pass.
  - The blur is removed under `prefers-reduced-transparency: reduce`.
  - **Never blur on mobile.** It is the most expensive CSS effect on Mali and PowerVR phone GPUs.

---

## 5. Motion

| Token | Value | Use |
|---|---|---|
| `--dur-fast` | 150ms | Colour and opacity on press, hover and focus |
| `--dur-normal` | 200ms | Chip select, accordion icon |
| `--dur-sheet` | 240ms | Sheets slide in or out |
| `--dur-beam` | 1200ms | Scan beam, one pass |
| `--dur-draw` | 900ms per line, 150ms stagger | Line draw-in |
| `--ease-out-cubic` | `cubic-bezier(0.215, 0.61, 0.355, 1)` | Everything (it matches the app's `Easing.out(cubic)`) |
| press | `scale(0.98)`, pressed gold `#CFA049` | Buttons and tappable cards |

**The one orchestrated moment per page:** the scan beam and the trace.
1. A 34px gold beam passes down the photo once. It uses `linear-gradient(to bottom, rgba(245,217,139,0), rgba(245,217,139,.28), rgba(245,217,139,.95))`, moves with `translateY` from −34px to the photo's height, and its opacity keyframes are 0 → 1 at 8% → 1 at 85% → 0 (the app's `ScanSweep`).
2. The lines draw in the order life, head, heart, fate. Each path gets `pathLength="1"` and animates `stroke-dashoffset` from 1 to 0, so no JS is needed to measure path lengths.
3. The labels fade in.

On the hero this runs as CSS only, once. On the user's own photo, the beam runs **only while the server is really working**, and the lines draw when the real scan returns.

**Everything else responds to the user:** press, open, expand, confirm.
- **The only loop allowed** is a soft ring pulse while the server is really working.
- No scroll-triggered entrances, no fade-up on sections, no parallax, no hover effects beyond the glass-card lift (§4.3), no marquees, no looping background.

**Rules:**
- Animate only `transform`, `opacity` and `stroke-dashoffset`.
- **Content is visible by default.** Nothing needs JavaScript or an observer to appear.
- Under `prefers-reduced-motion: reduce`, the final state shows instantly, with lines drawn and no beam. Progress is announced as text through `aria-live="polite"`.
- Under `Save-Data` or `prefers-reduced-data: reduce`, skip the hero animation and serve the 480w image.
- **Traced lines sit exactly on the photo.** The owner rejected a misaligned, rushed scan animation in the app. See the viewer spec in §7.

---

## 6. Tailwind 4 tokens: `src/styles/global.css`

`@theme inline` is required. The utilities must read the live variables so that `:lang(hi)` and `[data-theme]` overrides work at each element. With a plain `@theme`, `var()` would be resolved once at `:root`. The resets remove Tailwind's default palette, shadows and blur, so **only our tokens exist**.

```css
@import "tailwindcss";

@custom-variant day (&:where([data-theme="day"], [data-theme="day"] *));

@theme inline {
  --color-*: initial; --shadow-*: initial; --inset-shadow-*: initial; --drop-shadow-*: initial;
  --blur-*: initial; --radius-*: initial; --text-*: initial; --tracking-*: initial; --font-*: initial;

  /* colour roles: bg-page, bg-surface-1, text-fg, text-fg-muted, border-edge, border-control … */
  --color-page: var(--page);
  --color-surface-1: var(--surface-1);
  --color-surface-2: var(--surface-2);
  --color-surface-3: var(--surface-3);
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --color-control: var(--control-border);
  --color-edge: var(--edge);
  --color-hairline: var(--hairline);
  --color-glass: var(--glass);
  --color-glass-edge: var(--glass-edge);
  --color-scrim: var(--scrim);
  --color-fg: var(--fg);
  --color-fg-muted: var(--fg-muted);
  --color-fg-faint: var(--fg-faint);
  --color-accent: var(--accent);            /* gold as text/link/icon; goldInk on Day */
  --color-accent-soft: var(--accent-soft);
  --color-focus: var(--focus);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-danger: var(--danger);
  --color-gold-bright: #F5D98B;              /* fills only */
  --color-gold: #E6B85C;
  --color-gold-pressed: #CFA049;
  --color-on-gold: #1F1300;
  /* line names/dots follow the theme; trace-* are fixed (photos + diagram palm) */
  --color-line-life: var(--line-life);
  --color-line-head: var(--line-head);
  --color-line-heart: var(--line-heart);
  --color-line-fate: var(--line-fate);
  --color-trace-life: #F07A5A;
  --color-trace-head: #6EA8FF;
  --color-trace-heart: #F27BB0;
  --color-trace-fate: #A993FF;
  --color-halo: #1A1440;
  --color-palm-top: #3A3078;
  --color-palm-bottom: #1D1850;
  --color-qr-dark: #0B0A1F;
  --color-qr-light: #F6F0E1;

  --font-sans: var(--ff-sans);
  --font-display: var(--ff-display);

  --text-display: var(--fs-display);  --text-display--line-height: var(--lh-display);
  --text-h1: var(--fs-h1);            --text-h1--line-height: var(--lh-h1);
  --text-h2: var(--fs-h2);            --text-h2--line-height: var(--lh-h2);
  --text-h3: var(--fs-h3);            --text-h3--line-height: var(--lh-h3);
  --text-lead: var(--fs-lead);        --text-lead--line-height: var(--lh-lead);
  --text-body: var(--fs-body);        --text-body--line-height: var(--lh-body);
  --text-small: var(--fs-small);      --text-small--line-height: var(--lh-small);
  --text-caption: var(--fs-caption);  --text-caption--line-height: var(--lh-caption);

  --tracking-display-en: -0.01em;     /* English display only; zeroed under :lang(hi) */

  --radius-tag: 0.5rem; --radius-input: 0.75rem; --radius-card: 1.25rem; --radius-hero: 1.75rem; --radius-pill: 9999px;

  --spacing-gutter: var(--gutter);
  --spacing-section: var(--section);
  --container-text: 42.5rem; --container-content: 70rem; --container-wide: 80rem;

  --ease-out-cubic: cubic-bezier(0.215, 0.61, 0.355, 1);
}

:root, [data-theme="night"] {
  color-scheme: dark;
  --page: #0B0A1F; --surface-1: #15132F; --surface-2: #1E1B42; --surface-3: #2A2654;
  --border: #2A2654; --border-strong: #3A3570; --control-border: #6F68A6;
  --edge: rgba(246,240,225,0.08); --hairline: rgba(230,184,92,0.32);
  --glass: rgba(21,19,47,0.88); --glass-edge: rgba(246,240,225,0.14); --scrim: rgba(6,5,18,0.72);
  --fg: #F6F0E1; --fg-muted: #C3B9D8; --fg-faint: #8F88B5;
  --accent: #E6B85C; --accent-soft: rgba(230,184,92,0.14); --focus: #F5D98B;
  --success: #2BB3A3; --warning: #FFC857; --danger: #FF6B6B;
  --line-life: #F07A5A; --line-head: #6EA8FF; --line-heart: #F27BB0; --line-fate: #A993FF;
  --hero-gradient: linear-gradient(180deg, #221A4E, #15132F);
}
[data-theme="day"] {
  color-scheme: light;
  --page: #F7F5FC; --surface-1: #FFFFFF; --surface-2: #ECE8F7; --surface-3: #DDD7EE;
  --border: #E4DFF3; --border-strong: #C9C1E0; --control-border: #7A72A8;
  --edge: rgba(23,19,61,0.08); --hairline: rgba(122,82,0,0.32);
  --glass: rgba(247,245,252,0.92); --glass-edge: rgba(23,19,61,0.12); --scrim: rgba(23,19,61,0.45);
  --fg: #17133D; --fg-muted: #4B4574; --fg-faint: #6A6492;
  --accent: #7A5200; --accent-soft: rgba(122,82,0,0.10); --focus: #7A5200;
  --success: #0F7A6E; --warning: #8A5A00; --danger: #B3261E;
  --line-life: #B5391A; --line-head: #1F5BC4; --line-heart: #B02A6E; --line-fate: #6440D0;
  --hero-gradient: linear-gradient(180deg, #FFFFFF, #F7F5FC);
}
/* @media print { :root { …repeat the Day block… } } */

:root {
  --gold-gradient: linear-gradient(135deg, #F5D98B, #E6B85C 50%, #CFA049);
  --ff-sans: "Mukta", "Mukta Fallback", "Noto Sans Devanagari", system-ui, sans-serif;
  --ff-display: "Cormorant Garamond", "Cormorant Fallback", Georgia, serif;
  --fs-display: clamp(2.5rem, 1.7174rem + 3.478vw, 4.5rem);   --lh-display: 1.08;
  --fs-h1: clamp(2rem, 1.5109rem + 2.174vw, 3.25rem);          --lh-h1: 1.15;
  --fs-h2: clamp(1.625rem, 1.3804rem + 1.087vw, 2.25rem);      --lh-h2: 1.2;
  --fs-h3: clamp(1.25rem, 1.1522rem + 0.435vw, 1.5rem);        --lh-h3: 1.3;
  --fs-lead: clamp(1.1875rem, 1.1386rem + 0.217vw, 1.3125rem); --lh-lead: 1.55;
  --fs-body: 1.0625rem; --lh-body: 1.6;
  --fs-small: 0.9375rem; --lh-small: 1.5;
  --fs-caption: 0.8125rem; --lh-caption: 1.45;
  --gutter: 1.25rem; --section: 4rem;
  --dur-fast: 150ms; --dur-normal: 200ms; --dur-sheet: 240ms; --dur-beam: 1200ms; --dur-draw: 900ms; --stagger-line: 150ms;
}
@media (min-width: 48rem) { :root { --gutter: 2rem; } }
@media (min-width: 64rem) { :root { --gutter: 3rem; --section: 7rem; } }

:lang(hi) {
  --ff-display: "Tiro Devanagari Hindi", "Cormorant Garamond", serif;
  --fs-display: clamp(2.125rem, 1.4891rem + 2.826vw, 3.75rem); --lh-display: 1.45;
  --fs-h1: clamp(1.75rem, 1.3587rem + 1.739vw, 2.75rem);        --lh-h1: 1.45;
  --fs-h2: clamp(1.5rem, 1.3043rem + 0.870vw, 2rem);            --lh-h2: 1.5;
  --lh-h3: 1.55;
  --fs-lead: clamp(1.25rem, 1.2011rem + 0.217vw, 1.375rem);     --lh-lead: 1.7;
  --fs-body: 1.125rem; --lh-body: 1.75;
  --fs-small: 1rem; --lh-small: 1.6;
  --fs-caption: 0.875rem; --lh-caption: 1.55;
  letter-spacing: 0;
}

@layer base {
  html { background: var(--page); color: var(--fg); font-family: var(--ff-sans); font-synthesis: none;
         -webkit-text-size-adjust: 100%; -webkit-tap-highlight-color: transparent; }
  body { font-size: var(--fs-body); line-height: var(--lh-body); }
  :lang(hi) .tracking-display-en { letter-spacing: 0; }
  :focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
  .script-system { font-family: "Noto Sans Devanagari", "Kohinoor Devanagari", "Nirmala UI", sans-serif; }
}

@utility gold-fill { background-image: var(--gold-gradient); color: #1F1300; }
@utility hero-fill { background-image: var(--hero-gradient); }
@utility glass { background-color: var(--glass); border: 1px solid var(--glass-edge); }
@media (min-width: 64rem) and (hover: hover) {
  @supports (backdrop-filter: blur(12px)) { .glass { backdrop-filter: blur(12px); } }
}
@media (prefers-reduced-transparency: reduce) { .glass { backdrop-filter: none; } }

@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important;
                         transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
}
```

**Checks after scaffolding** *(rec)*:
- Confirm that `bg-transparent` and `text-current` still work after `--color-*: initial`.
- Add a Stylelint/ESLint rule, or a `scripts/check-site.mjs` grep, that fails on raw hex, `px` font sizes, `shadow-`, `blur-` or `tracking-` inside `src/components` and `src/islands`.

---

## 7. Components

Every control has a hit area of at least 48 × 48px (extend it with padding or `::after` when the visual is smaller). Every control has a visible focus ring, real `<button>` or `<a>` semantics, and correct `lang` on its text.

### 7.1 Buttons and links

- **Gold button (primary).**
  - A pill 52px tall (48 minimum). `gold-fill`, Mukta 700 at 17px, sentence case, **no arrow, no emoji**.
  - Pressed: `#CFA049` and scale 0.98.
  - Busy: it keeps a label that says what is happening ("Reading your palm…"), shows a spinner, and has `aria-busy`.
  - Disabled: it fades to 60% opacity and is never drawn grey.
  - On Day it gets a 1px `--hairline` border.
- **"One per viewport state":** at any scroll position, with any sheet open, at most one filled-gold element is visible.
  - The header uses an outline button.
  - The mobile bottom bar hides while the hero or upload card is on screen.
  - An open sheet's gold button replaces the page's (the page behind it is inert).
  - End blocks on long pages are fine, because they are never on screen at the same time as the hero.
- **Secondary button:** a `surface-2` fill with `fg` text (14.3:1), 48px, pill. It must stay clearly readable. Never a tiny grey "continue" link next to a huge primary (that is interface interference).
- **Outline button** (header "Read my palm"): 1px `--accent` border, `--accent` text, pill, 40px visual height with a 48px hit area.
- **Text link:** `--accent`, underlined in body text. In navigation lists the underline shows on hover and focus. The link text names the destination; never "click here".

### 7.2 Chips

- **Promise chips** (static facts such as "First reading free"):
  - Pill, 32px visual height, `surface-2`, an `--edge` border, an outline icon plus Mukta 400 at `small`.
  - They are **not interactive** and must not look like buttons (no hover state). Each chip is its own element; never join chips with "·".
- **Choice chips** (tip filters, line chips, hand choice): 48px hit area.
  - Selected: `--accent-soft` fill, `--hairline` border, a check icon and `aria-pressed="true"`. Colour is never the only signal.
- **Line chip:** a 10px dot in the trace colour plus the bilingual name ("हृदय रेखा / Heart line"). Tapping it highlights that line and quiets the others to 35% opacity.
- **"Not clearly seen" chip:**
  - A **1.5px dashed** `--fg-muted` border, a hollow dot, and the label "not clearly seen" / "साफ़ नहीं दिखी".
  - Its line is **never drawn** and never looks complete.
  - Tapping it explains why: light, crop or crease.

### 7.3 Upload card (the home hero)

- **Frame:** 28 radius, `surface-1`, and the page's one gold `--hairline`.
- **Phone:** at least 240px tall. Two big targets:
  - gold "Take a palm photo" (`<input type="file" accept="image/*" capture="environment">`);
  - the text link "Choose from gallery".
- **Desktop:** gold "Upload a palm photo", plus drag and drop and paste. Also "Easier on your phone" with a QR code that opens the same page.
- **Inside the card, in this order:**
  1. 3 tip chips with tiny real good/bad thumbnails: "Open palm", "Good light", "Whole hand in the frame".
  2. The **privacy line** with the link "What happens to my photo?", which opens a panel in place.
  3. The **free qualifier** at readable contrast (never faint).
- **Below the card:** "No photo handy? Try a sample hand."
- The photo is downscaled in the browser to 1280px at JPEG 0.85, which also strips EXIF, before anything is sent.
- **Capture review**, after the photo is picked:
  - the real photo;
  - the real problem ("Too dark — move near a window and retake");
  - "Use this photo" (gold) and "Retake" (secondary);
  - a hand choice: a Left / Right segmented control, defaulting to Right, plus "Is this the hand you write with?".
- A failed local check costs nothing, and the card says so.

### 7.4 Scan progress

- One status block that shows the **real current server stage**: "Uploading", "Checking photo", "Tracing lines", "Writing your reading". It has one bar, and the text lives in an `aria-live` region.
- No fake checklists or timers. "Usually about {p50} seconds" appears only once that time has been measured.
- After p90, show the slow-network line and a retry.
- The beam runs over the user's own photo while the scan is in progress.

### 7.5 Line-trace viewer

- **Photo size:** the user's photo, at most 45% of the screen height on mobile.
- **Alignment:** the wrapper has `aspect-ratio: {w}/{h}` taken from the photo. The `<img>` and the `<svg viewBox="0 0 {w} {h}" preserveAspectRatio="none">` both fill it with `inset: 0`. Paths stay in the photo's pixel coordinates, so the lines always sit exactly on the photo. Test this at 390px, at 1440px and zoomed in.
- **Lines:**
  - Trace colours with a halo, drawn in the order life, head, heart, fate.
  - A line the scan didn't return is not drawn; its chip is dashed (§7.2).
  - *(WEB-DEC-043)* In the web reading this is now the app's live scan (`LiveScan.tsx`: palm zoom, landmark dots, lines drawn heart, head, life, fate, a short tour, "Skip to my reading") and the app's report photo (`ReportPhoto.tsx`: side labels with leaders, "All lines" + one chip per line, tap to pick one); the SVG is drawn in the photo box's own pixels.
- **Line chips** sit under the photo. Tapping one highlights its line.
- **Full screen:** tapping the photo opens a full-screen view with native pinch-zoom (`touch-action: pinch-zoom`, no library).
- **For screen readers:** `<figure>` plus a `<figcaption>` that lists the lines found and not found.
- **Meaning block, one per line:**
  1. "What the scan saw": the evidence sentence.
  2. "What palmistry says": attributed to the tradition.
  3. The source book, in `small` and `fg-muted`.
- **At-a-glance card:** 2–3 personal takeaways, placed under the photo **before** any line detail. It is the page's one gold-framed card.

### 7.6 Locked card

- **Contents:** the part's title, **its real first sentence, fully readable**, and a "Tap to open" pill. The whole card is the tap target.
- **No blur and no hidden text.** The locked text is never in the DOM; it is dropped before rendering (DEC-038/042). There are no "██" bars and no fake faded paragraphs. A decorative fade may only tint the card's background, never text.
- Show "You've read 2 of 4 parts" near the locked cards.
- **The action matches the step in the flow:**
  - reading 1: "Read one more palm free — sign up" (the sheet explains that sign-up does not open this reading);
  - reading 2 or zero readings left: the app.
- **Lock sheet:** the hero gradient, the first sentence, "The rest of this part is in the app", the app promise, the price line and the continuity line. Gold is the store button (Android) or the QR code (desktop). On iPhone the honest note replaces the store button.

### 7.7 Tool card and tool page (all 12 tools have their own page; owner decision)

- **Hub layout:** not a uniform grid.
  - The **photo checker** gets a wide featured card with a live mini-demo.
  - The rest are rows on mobile and a 3-column grid on desktop, **grouped by what they really are**: "Uses AI" (reading, line finder), "Runs on your phone" (photo checker), "Traditional meanings — not AI" (finders, quizzes, map).
- **Each card:** a line or shape glyph in the tool's line colour, the name, one line saying what you get, and a "No sign-up" tag **only when true**. No stars, "popular" badges or usage counts.
- **Tool page, in order:**
  1. Breadcrumb.
  2. An icon tile and an H1 phrased as a benefit.
  3. One promise line and an honest label ("Runs on your phone — your photo never leaves this device" / "Uses AI to trace your lines" / "Traditional meanings — not AI").
  4. **The tool card directly under the H1**, with the privacy note under its button.
  5. The result appears in place.
  6. "Check this on your own palm".
  7. How it works.
  8. What palmistry says, with sources.
  9. "What this tool can't tell you".
  10. FAQ.
  11. The matching guide.
  12. The other tools (sticky on desktop).
  13. The end block.
- Each tool page carries 400–900 words of real content. The matching guide **links** to the tool and never embeds a second copy.

### 7.8 Guide blocks (zero JS)

| Block | Spec |
|---|---|
| Breadcrumbs | Logical, not taken from the URL. Visible, with `BreadcrumbList`. `small`, `fg-muted`, 48px-tall tappable rows. |
| Byline | Separate lines: "Written by {author}", "Reviewed by {reviewer}", "Last reviewed {date}". No "·" strings. |
| AnswerFirst | 40 words or fewer, `lead` size, directly under the H1 |
| Header image | That line traced on the sample photo (that line only). Real photo, trace colours with a halo. |
| QuickFacts | `surface-1` card, 20 radius. Rows: Hindi and Sanskrit name, other names, where it sits, what the tradition reads, which hand. |
| TOC | A collapsible chip on mobile, a sticky side list on desktop. The label is "On this page" / "इस पेज पर" (sentence case). |
| VariationCard | An SVG thumbnail (the stylised palm, trace colours), the meaning, and the source. Stacked on mobile. |
| MythVsReality | Two columns on desktop, stacked on mobile. Labels are words, not ✗/✓ colour alone. |
| LimitsBox | "What palmistry can't tell you". A calm `surface-2` card with an outline info icon; no red, no warning icon. Links to `/is-palmistry-real/`. |
| SourcesList | Numbered (a real list), with the book, author and year |
| PhotoTips | 3 tips with real thumbnails |
| Faq | Native `<details>`/`<summary>`, 48px summary rows, plus FAQPage schema |
| StepOf7 | "Step 3 of 7" pager. Numbers are allowed here because it is a real sequence. |
| Tool link | A card that links to the tool's own page (never an embedded copy) |
| EndCta | Gold "Read my palm free", then a secondary Play badge with the price line (a QR code on desktop) |
| Related | 3–4 guides, as text links with line glyphs |

Prose sits on `surface-1` at 680px wide at most. Long sections use `content-visibility: auto`.

**Guide v4 blocks (WEB-DEC-047, pilot /palm-reading/):** `TracedPalm` hero (no `data-tilt` on teaching figures; photo ≤ 400 CSS px; the report's line look in photo pixels: glow 4.5 at 30%, core 1.6, sheen 0.5; SVG type ≥ 13 px at 320 px; final frame by default, the one-time show only with motion allowed); teaching blocks share `src/components/guides/teach.css` (`tb-`, tokens only, 48 px targets): glossary glyphs, flow, step tiles, do/don't photos, drawn hands, hand-shape silhouettes, line lessons (photo crop at ~1x + 3 drawn forms at one scale), 4-questions sheet, mount areas (gold dashed, numbered, legend with Hindi), Not this / This pairs, radio quiz with :has() feedback. Same DOM on every screen size.

### 7.9 Store button, price line, QR tile

- **Store button:** the official Google Play badge, **unmodified** (Google's brand rules), 48px or taller.
  - **Android:** a direct Play link with `referrer=utm_source%3Dweb%26utm_medium%3D{page}%26utm_campaign%3D{placement}`.
  - **iPhone:** no badge. Show the honest note instead.
  - **Desktop:** the badge plus the QR tile, "Send to my WhatsApp" and the remote-install line.
  - Never an APK link, never an App Store badge.
- **Price line**, always directly under the badge, in `small` and `fg-muted` (never faint). The values come from `site.ts`: free download, about {X} MB, paid readings from ₹{price}, no ads. Plus "Only from Google Play".
- **QR tile:**
  - `#0B0A1F` modules on an `#F6F0E1` tile (17.1:1). Never gold on indigo, which scans badly.
  - A 4-module quiet zone, at least 132px, 12 radius, no logo in the middle.
  - Generated as SVG at build time, with no third-party QR service.
  - Caption: "Scan with your phone camera".

### 7.10 Header, menus, toggles

- **Mobile header:** 56px. Logo on the left; अA and the menu on the right.
  - On `/`, there is no header button while the hero's gold button is on screen.
  - On other pages, the outline "Read my palm" button appears.
  - It turns into glass after 24px of scroll.
- **Desktop header** *(rec: 64px)*: logo, Palm lines, How to read palms, Tools, Blog, App, the हिंदी / English pill, Day / Night, and the outline "Read my palm". **No wallet or money items.**
- **Menu sheet:**
  1. Gold "Read my palm free".
  2. Nav rows (48px).
  3. "Get the app", or the iPhone note on iPhone.
  4. हिंदी / English.
  5. Day / Night.
- **Language control:** a "हिंदी / English" pill with each name in its own script. **Never flags.**
  - Mobile uses the compact **अA** glyph.
  - It is a **link to the twin URL** (`/hi/…` ↔ `/…`), not a JavaScript swap, and it sets no cookie.
  - The "हिंदी" label on English pages uses `.script-system` (§3.2).
- **Theme toggle:** a sun/moon icon **with a text label** ("Day" / "Night"), `aria-pressed`, and the choice stored in `localStorage`.
- **Mobile bottom CTA bar:**
  - Glass, "Read my palm free" plus 3 true points ("First reading free", "No sign-up", "Photo not stored on servers").
  - It appears only after the hero button scrolls away, and hides while any upload card is visible. It is never shown on `/reading/`.
  - It respects `env(safe-area-inset-bottom)`.
  - All fixed bars together take up 20% of the screen height or less.
- **In-app browser notice** (WhatsApp, Instagram or Facebook browser): an inline notice, "Open in Chrome for the best result", with a copy-link button. Not a modal.

### 7.11 Footer

- **Top:** the logo and one honest line: "Palmistry is a tradition for reflection. It does not predict health, lifespan or exact dates."
- **Link groups:** Read, Tools, Learn, Company, Legal. On mobile these are accordions with 48px rows.
- **App:** the device-aware store button.
- **Cookie line:** "No cookies, no ad trackers", **only while it is true**.
- **Company details:** company name, contact, grievance contact, "Readings are for people 18+", "Made in India", and © with the build year.
- **No cookie banner, ever.** Analytics must stay cookieless for this to remain true.

### 7.12 Forms and sheets

- **Fields:**
  - The label sits **above** the field, and is never only a placeholder.
  - Inputs are 48px, 12 radius, `surface-2` fill, a 1px `--control-border`, and 17px text (16px or more stops iOS from zooming in).
  - Use the right `type`, `inputmode` and `autocomplete`.
- **Code entry:** one field, `autocomplete="one-time-code" inputmode="numeric" maxlength="6"`. Never 6 separate boxes.
- **Errors:** below the field, with an icon and text, linked by `aria-describedby`. The error says what went wrong and how to fix it. No "Oops", no apologies.
- **Opt-ins** are unticked and worded positively.
- **Submit labels say what happens:** "Send my code", "Verify".
- **Sheets:** a bottom sheet on mobile and a side panel or dialog on desktop, 28 radius, sliding in over 240ms over `--scrim`.
  - Focus is trapped inside, Esc closes the sheet, and focus returns to the control that opened it.
  - Closing is always a visible "Not now" / "अभी नहीं" plus ×.
- **Notices:** 12 radius, an icon plus text, and a status colour only on the icon and border. They are never shown by colour alone.

### 7.13 Other pieces

- **Palm map:** an SVG hand whose 4 lines and 7 mounts are real `<button>`s, reachable by keyboard.
  - A tap or focus opens a meaning sheet (a bottom sheet on mobile, a side panel on desktop).
  - The sheet links to the guide and to "See it on your palm".
  - Without JS it falls back to a list of links.
- **Share card:**
  - Drawn with canvas on the device, on the user's own traced photo, with the hero gradient frame.
  - It shows the logo, a one-line archetype and the site URL. **The name is off by default.**
  - A preview shows exactly what will be shared. "Share on WhatsApp" is first.
- **Zero-readings screen:**
  - The 2 saved readings as cards ("Save as image", "Remove from this browser").
  - One app card with the price line.
  - "Not now? Keep learning free — guides and tools."
  - No guilt copy.

---

## 8. Iconography

**v4 (2026-10-03, premium pass wave 1, owner approved the pass):** one bespoke set replaces the thin Ionicons-style outlines, the repeated glyphs and the AI-3D price icons.

- **Source:** `src/lib/icons.ts` (inline SVG markup, one named export per icon) rendered by `Icon.astro`, `MediaIcon.astro` (feature size, square, accent colour) and `reading/Icons.tsx` (React island). No sprite files, no icon font, no images.
- **Style:** solid duotone on a 24px grid. Main shapes solid `currentColor`; supporting shapes in one group at 40 % opacity (so overlaps never darken and the second tone follows the theme). Rounded geometry. Strokes only where the stroke is the shape (checks, chevrons, palm lines): 2–2.5px, round caps and joins. No gradients, glow, shadows or 3D.
- **Colour:** `var(--accent)` (gold on Night, goldInk `#7A5200` on Day; brand gold is never an icon colour on Day). Line colours stay data and are not used in icons.
- **One drawing per concept:** a mini palm with the one line drawn for each palm line (heart, head, life, fate, sun, mercury, marriage), one icon per tool (`src/lib/tools/tool-icons.ts`), gift / crown / bolt for pricing, privacy / document / trash / key / pen for the legal heroes. Preview sheet: rebuilt from the module at 24/48/96px on Night and Day.
- **Sizing:** a feature icon fills about 60–80 % of its tile; never a small glyph in a big empty box.
- **Icons always come with a visible text label.** Decorative icons are `aria-hidden`; icon-only controls need an `aria-label` and a 48px hit area.
- **No emoji in the UI**, no emoji image sets, no AI-rendered icon images.

## 9. Imagery and diagrams

- **The hero is a real, consented photo traced by our model.** The paths are our model's actual output exported as SVG, never hand-drawn.
  - The label reads: "A real photo, traced by {brand}. Your reading is made from your own photo."
- **Real hands only:** varied Indian skin tones, men and women, daylight, a plain background, written consent. **Never AI-generated hands**; finger errors destroy trust and would contradict the "real tracing" claim.
- **Diagrams are original SVG files** (so Google Images can index them): the stylised palm (`#3A3078 → #1D1850`) with the trace colours and halo. One illustration system covers every guide, tool and blog thumbnail.
- **The trace motif appears only where it carries meaning:** the hero sample, each guide's header, tool-card glyphs and the share card. Never as dividers or background decoration.
- **Not used:** star fields, zodiac wheels, nebulae, swirly or mandala dividers, stock "mystic" art, ॐ as ornament, 3D hands, AI art.
- **Guide v4 (WEB-DEC-047):** the guides teach on ONE real photo, the app's scan-guide palm (360 × 480; 2x = Lanczos3 + light sharpen, never AI upscaling), traced only with the app's real scan of it; every crop is an SVG viewBox on that one file. **Exception (WEB-DEC-048):** the /which-hand-to-read/ hero alone shows the owner's own consented left palm (`public/samples/left-palm-*`) traced with its real palm4_v2@8a252bb scan; the lesson crops stay on the one scan-guide photo. Never show Palmistry_seg or 11K Hands dataset photos on the site. **Update 2026-09-28:** the teaching photo is now an AI-made HD palm (1792 × 2400, AVIF/WebP 600–1800 w, frame 360 × 482), labelled "AI-made", traced only by the real scanner output for that image. **3D render tiles** (AI-made, `src/lib/guides/images.ts`, `.tb-render`: square, `--r-well` radius, hairline rim, `--shine` + `--e2`, dark studio background, same in Night and Day) are allowed for teaching illustrations (hand shapes, which hand, words to know) and must be labelled as AI images. Never draw palm lines (SVG or otherwise) on an AI image unless they are real scanner output for that exact image; a render's own built-in glow is part of the illustration and never presented as a reading.
- **Formats:** AVIF with a WebP fallback, `width` and `height` always set, `loading="lazy"` below the fold, and `fetchpriority="high"` only on the hero.

## 10. The 7 wow moments (honest and fast)

| # | Moment | Cost |
|---|---|---|
| 1 | **The hero palm traces itself:** a real sample photo, one gold beam, then the life, head, heart and fate lines draw in, then their labels | about 45 KB AVIF + about 4 KB SVG + about 1 KB CSS. **No JS.** |
| 2 | **The same moment on your own palm:** the beam runs while the scan is really working, and your lines draw when it returns. A missing line becomes a dashed "not clearly seen" chip. | Part of the `/reading/` island. The overlay is a few KB of JSON drawn as SVG. |
| 3 | **"Try a sample hand":** the full viewer on a stored real result, with no upload | A static JSON result (a few KB) plus the viewer |
| 4 | **Interactive palm map** on `/hand-lines/`: tap a line or mount for its meaning | SVG + about 3 KB JS, with a no-JS list fallback |
| 5 | **Photo checker:** instant local ticks ("Bright enough", "Sharp", "Whole palm") | Canvas-only, no ML download, ≤ 40 KB JS |
| 6 | **Bilingual headline:** the same hero set large in Tiro Devanagari on `/hi/` | 0 KB extra; the Tiro subset is already in the Hindi font budget |
| 7 | **WhatsApp share card** on the user's traced photo, generated on the device | Canvas, about 2 KB JS, no upload |

**Not doing:** 3D hands, WebGL, particles, Lottie, autoplay video, parallax, glass tilt, scroll-jacking, cursor effects. All are slow on budget Android phones, and none of them is evidence.

## 11. Performance budget

**How we test:**
- Lighthouse mobile (Moto G Power profile, 4× CPU slowdown, Slow 4G) on every build.
- One real Android Go-class phone before each release.
- Field data at p75 from Cloudflare Web Analytics and Search Console.

| Page type | HTML (gzip) | CSS (gzip) | Our JS (gzip) | Fonts | Images | LCP / INP / CLS (p75) |
|---|---|---|---|---|---|---|
| Guides, blog, legal | ≤ 35 KB | ≤ 25 KB | **0 KB** (the theme script is inline and under 0.5 KB). ≤ 10 KB with an embedded Preact or plain-TS extra. | EN ≤ 120 KB, HI ≤ 180 KB *(open, §3.2)* | LCP image ≤ 80 KB; others ≤ 60 KB | ≤ 2.0 s / ≤ 150 ms / ≤ 0.05 |
| Home | ≤ 30 KB | ≤ 25 KB | ≤ 60 KB on load. The upload starter is a small Astro script, not React. | same | Hero AVIF ≤ 45 KB at 480w and ≤ 90 KB at 960w | ≤ 2.3 s / ≤ 150 ms / ≤ 0.05 |
| Tool pages (all 12) | ≤ 25 KB | ≤ 25 KB | Rule-based tools: ≤ 10–20 KB (Preact or plain TS). AI and photo tools: ≤ 70 KB (a React island loaded when visible; switch to Preact if over). | same | ≤ 60 KB each | ≤ 2.0 s / ≤ 150 ms / ≤ 0.05 |
| `/reading/` | small shell | ≤ 25 KB | ≤ 180 KB at first. The rule engine loads only after upload starts; the HEIC decoder only if decoding fails. | same | The user's photo, processed off the main thread where possible | INP ≤ 150 ms |

**Other rules:**
- TTFB ≤ 200 ms (static files on Cloudflare).
- No tag managers, ad scripts or third-party fonts. Turnstile only on `/reading/`.
- No `backdrop-filter` on mobile.
- `/_astro/*` is cached for a year as immutable. HTML uses `max-age=0, must-revalidate`.

## 12. Accessibility floor

- **Touch targets** are at least 48 × 48px. Neighbouring hit areas may touch but never overlap.
- **Contrast:** 4.5:1 for text and 3:1 for UI boundaries and large text. Every pair in §2 is checked; faint text is for captions only.
- **Focus:** a visible 2px `--focus` outline with a 2px offset on every control. Never `outline: none` without a replacement.
- **Language:**
  - `<html lang>` matches the page;
  - every inline span in the other language gets its own `lang`;
  - alt text is in the page's language;
  - `hreflang` pairs link the two versions of each page.
- **Scaling and layout:** text scales to 200% with no horizontal scroll, containers use `min-height` rather than fixed heights, and reading order follows visual order.
- **Motion:** reduced motion is respected (§5). No flashing.
- **Signals:** errors and states never rely on colour alone. Icons always have text. `aria-live` announces scan progress and form results.
- **Structure:** FAQs use `<details>`. The traced photo has a `figcaption` listing the lines found. There is one `<h1>` per page, and headings are never skipped.

## 13. Never do

**Pressure and fake proof:**
- Fake counters ("viewing now", "120 readings this week"), "just downloaded" toasts, countdown timers, "offer ends".
- Struck-through "was" prices, decoy tiers, invented download or reading numbers, unlinked "As Seen On" logos.
- Testimonials with stock or AI avatars, "Illustrative" reviews, AI personas shown as people.

**False or scary content:**
- Dated, health, marriage-date, children-count or lifespan predictions anywhere: in hero art, samples, teasers or locked-card titles.
- Blurred or "██" fake locked text, or showing text that is actually locked.
- "Free" without saying what is free. Price hidden until after upload.

**Clutter over the product:**
- Two gold buttons in one viewport.
- A store badge competing with the hero action.
- Interstitials, full-screen install prompts, more than one dismissible banner.
- **Cookie banners, especially one covering the hero.** We ship no cookie banner at all.
- Fixed bars covering more than 20% of the screen.

**Generic "AI astrology" styling:**
- Glass everywhere, `backdrop-filter` on mobile, box shadows, gradient washes.
- Starfields, nebulae, zodiac wheels, marquees, autoplay video, parallax, scroll-reveal that hides content, fade-up on every section.
- One gold keyword in a headline, tracked ALL-CAPS eyebrows, "A · B · C" strings, "→" on buttons, mono labels, emoji icons, flags for languages.
- The same radius and card on everything; a uniform 12-tool grid.
- Cream + serif + terracotta; near-black + one acid accent.

**Bad typography:**
- Letter-spacing on Devanagari, italic Devanagari, clipped vowel marks.
- Cormorant below 28px, text below 13px.
- White text on gold; gold text or thin gold lines on Day paper.
- 3-column tables at 390px.

**Heavy media and false identity:**
- Multi-MB images, AI-generated hands, APK links, an App Store badge before an iOS app exists.
- Ad or remarketing pixels.

## 14. Deliberate differences from the app

| App | Web | Why |
|---|---|---|
| `GoldButton` glow shadow and default arrow icon | No shadow, no arrow | The no-shadow rule; "→" is template chrome |
| Cinzel `overlineCaps` section labels | Not used; Cinzel stays in the logo | Tracked caps are template chrome |
| "·" joined copy and emoji line labels (DEC-042) | Separate lines or chips; line-colour dots | The "A · B · C" tell; emoji render differently across Android versions |
| Mukta 400–800 | Mukta 400 and 700 only | Font budget (§3.2) |
| Motion 140 / 220 / 360 ms | 150 / 200 / 240 ms plus the beam timings | Web response motion from R08 |

## 15. Open items

1. **The Hindi font budget:** measured at 337 KB against the 180 KB budget (§3.2). Subsetting and re-measuring is needed, then possibly an owner decision.
2. **Real hand photos:** 3–5 consented hands for the hero and the sample hands, with varied skin tones, men and women. Who shoots them?
3. **Store values:** the price, size and Play rating shown on store buttons come from `site.ts`, and must be [verify]-ed against Play before launch.
4. **Derived Day tokens** (§2.2): check them on screen with the owner. The ratios pass, but the look hasn't been reviewed.
