# 08 — Design direction for the Palm Read AI website

Research date: 2026-09-26. Read-only work: nothing was signed up for, uploaded or submitted, and the app repo was only read.
Status: **PROPOSAL — waiting for owner OK.** No website code has been written.

Sources used:
- Anthropic's public `frontend-design` skill. The copies in `anthropics/claude-code` (plugins/frontend-design) and `anthropics/skills` are byte-identical (9,390 bytes). Also Anthropic's `theme-factory` and `brand-guidelines` skills.
- Screenshots of 9 sites in `research/screens/inspiration/`: mobile 390×844 and desktop 1440×900, fold and full page, plus a styles JSON for each.
- The app's own brand, read from `palm-ai-new--feat-m1-foundation`: `src/theme/index.ts`, `src/components/billing/premium.tsx`, `src/components/ui/*`, `assets/brand/*.svg`, and PROJECT_MASTER DEC-029 / DEC-042 / FEAT-033.
- Google Fonts metadata, downloaded live on 2026-09-26. It lists 62 families with Devanagari; every font named below is in that list.
- WCAG contrast ratios computed with the WCAG 2.x formula. The script is in the session scratchpad and is not part of the repo.

---

## 1. What Anthropic's design guidance says, and how it applies to us

Only the rules that change our decisions:

| Rule (frontend-design skill) | What it means for this site |
|---|---|
| Ground the design in the subject's own world: its materials, vernacular and audience. | Our subject is **a real hand with its lines traced on it**, read in Hindi and English. The traced palm is the hero, not stars, zodiac wheels or purple nebulae. |
| The hero opens with "the most characteristic thing in the subject's world": a demo, image or interactive moment. The "big number + small label + gradient" hero is the default to avoid. | The hero is a real photo whose lines trace themselves, with the upload box beside it. No stats row (Astrotalk's "5Cr+ users" row is exactly the default the skill warns about). |
| Typography carries the personality. Use one or two families, clearly distinct, chosen for this brief. | Direction A uses a serif for brand moments and Mukta for everything else. Each direction has a Devanagari-capable pairing, because Hindi can't be an afterthought. |
| Avoid: accenting one word in a headline, ALL-CAPS labels, unnecessary eyebrow labels. | Nebula (blue second line) and Astrotalk (orange "astrology platform") both do the single-accent headline. We don't. The app's Cinzel tracked caps stay in the **logo SVG only**, never as eyebrows on the web. |
| Numbered markers only for real sequences. | "1 Photo → 2 Check → 3 Traced reading" and the guide's "step n of 7" are real sequences, so they may be numbered. Nothing else gets numbers. |
| One orchestrated motion moment beats scattered effects. No fade-up on every section. | One moment per page: the scan beam and line trace on the hero. Everything else only responds to what the user does. |
| AI-generated look clusters to avoid: cream + serif + terracotta (#D97757); near-black + one acid accent; the SaaS card kit (same radius and shadow everywhere, gradient washes); template chrome (tracked caps, "A · B · C" meta strings, "→" appended to buttons, mono labels, #111 standing in for black). | Our brand (indigo + temple gold) already avoids the first two. On the web we also drop `·` meta strings, `→` on buttons, identical card grids and grey drop shadows (the app already bans shadows: "No blur, no shadows"). |
| Plan first, then review the plan against the brief before building. | This document is that plan. §6 is the self-review. |
| Spend boldness in one place, and critique with screenshots. The quality floor is responsive, visible focus, reduced motion, accessible colour. | The bold thing is the traced palm. §9 sets the quality floor. |
| Writing: plain words, active voice, sentence case, the CTA says what happens, errors say what went wrong and how to fix it. | "Read my palm", not "Submit". A failed photo says "Too dark — move near a window and retake", not "Oops!". |

`theme-factory` adds one useful rule: a theme is **a palette with hex codes plus a header/body font pair, shown to the owner for confirmation before it is applied.** §3–§5 follow that format. `brand-guidelines` is about Anthropic's own brand and doesn't apply, apart from the principle "use the brand's real tokens, never approximations".

---

## 2. Inspiration study (not competitors)

Screens are in `research/screens/inspiration/<site>__{mobile|desktop}__{fold|full}.png`.

| Site | What they do | Take (pattern only) | Avoid |
|---|---|---|---|
| **Co–Star** | Monochrome #F7F7F7 / #141414 bands, serif wordmark, Akkurat + Akkurat Mono, radius 0. The hero is a line-art natal chart and B&W photo objects (moon, a hand, a skull). Press quotes. The email form is written as a sentence: "I was born in ___ on ___". | A diagram as the hero; one idea per band; strong restraint; the sentence-shaped form (for us: "Read my **right** hand in **हिंदी**"). | 12px mono ALL-CAPS labels, the unverifiable "NASA data" claim, grey-on-grey low contrast. |
| **Nebula** | Sand #F4F4E6, navy #212535 text, periwinkle #6378FD accent, a big warm close-up photo "Awaken here", a pill CTA. | Full-bleed human photography gives emotion. | "80% OFF" promo bar (fake-discount pattern), split-colour headline. On mobile the sticky layers overlap the content (visible in the fold shot). |
| **The Pattern** | Off-white #F8F5F4, Fraunces + DM Sans, a real app screen in a phone frame, a quoted app-store review with its source, official store badges. | Show the **real** app screen; quote a real review with its source; use official badges unmodified. | Tracked-caps nav, a hero that is only a phone mockup. |
| **Astrotalk** | White-to-yellow wash, Poppins, yellow pill CTA, astrologer portraits in a temple, the **"अA" language button**. Loads Tiro Devanagari Hindi. | The script-based language glyph (अA); warm Indian cultural cues; a big, friendly single CTA. | "1,240 astrologers online now", "Priya from Mumbai just started a chat" pop-ups, stacked sticky banners, stats row. |
| **AstroSage** | Saffron #FF6F00 + yellow, Roboto, 30+ nav links, native-script language buttons (हिन्दी, தமிழ், తెలుగు…), an app-open interstitial, a QR code on the desktop banner. | Language names in their own script; a QR code for the app on desktop. | Density, interstitial sheets, "India's fastest-growing" self-claims. |
| **CHANI** | A scrapbook collage (grid paper, glitter stickers), an outline script display face, monospace everywhere, a marquee. | Proof that astrology can have a strong, ownable personality. | A mono body face (Devanagari has no monospace tradition), a cookie modal that covers the page, marquees. |
| **Headspace** (wellness) | A friendly rounded sans, one dot as the brand, "Try for $0", app-preview cards. | One dominant CTA with the price stated plainly. | A cookie wall on the first view. |
| **Photoroom** (premium AI) | Neutral #F4F3F0, one violet CTA. The hero shows the AI **working as a status card**: "Analyzing… ✓ Studio shots ✓ Virtual model images". | Show the AI's work as honest stages; this matches our real scan stages. | Glitchy, distorted decorative imagery. |
| **remove.bg** (AI tool) | **The hero is the tool**: "Upload Image" + "or drop a file, paste image or URL" + "No image? Try one of these" sample thumbnails. | A **"No palm photo handy? Try a sample hand"** row, so privacy-shy and desktop visitors see the real result without uploading. | A cookie banner over the upload box. |

**Cross-site lessons**
1. The best sites put **the product's actual output** above the fold: Co-Star's chart, Pattern's app screen, Photoroom's working status, remove.bg's tool. We have the strongest possible version: lines traced on a real palm.
2. Every India-market site leans on noisy trust signals such as live counters, pop-ups and stat rows. A calm, honest premium site stands out there. It also passes US consumer-protection (FTC) scrutiny, which those patterns may not.
3. Four of the nine sites cover the first view with a cookie banner. **A cookie-free site with no banner is a visible premium advantage**, especially on a 390px phone.
4. Nobody except Astrotalk (one element) sets real Devanagari typography with care. Good Hindi type is an open field.

---

## 3. The brand we must match (from the app)

"Nakshatra Night — Glass edition" (DEC-029, FEAT-033). Temple gold on midnight indigo, moonlight-ivory text.

| Token | Hex | Role in the app |
|---|---|---|
| bg | #0B0A1F | page |
| surface1 / 2 / 3 | #15132F / #1E1B42 / #2A2654 | cards and bars / raised and inputs / tracks and disabled |
| border / borderStrong | #2A2654 / #3A3570 | dividers |
| edge | rgba(246,240,225,0.08) | the soft ivory 1px edge of a content card |
| hairline | rgba(230,184,92,0.32) | gold frame: one hero per screen and selected controls |
| text / textMuted / textFaint | #F6F0E1 / #C3B9D8 / #8F88B5 | text |
| accent / accentBright / accentPressed | #E6B85C / #F5D98B / #CFA049 | temple gold; `GOLD` gradient = [bright, accent, pressed] |
| onAccent | #1F1300 | text on gold |
| lineLife / Head / Heart / Fate | #F07A5A / #6EA8FF / #F27BB0 / #A993FF | the four lines; diagrams only, never UI chrome |
| palmSkinTop → Bottom | #3A3078 → #1D1850 | the stylised palm in diagrams |
| success / warning / danger | #2BB3A3 / #FFC857 / #FF6B6B | always paired with an icon |
| hero gradient | #221A4E → #15132F | the one framed brand moment |
| brand-mark bg | #241D5C → #08071C | icon and feature graphic |

**Fonts:**
- **Mukta** 400–800 for UI and body, in both scripts.
- **Cormorant Garamond** 700 / 600 italic for the English serif line.
- **Tiro Devanagari Hindi** for Hindi serif, upright, about 0.86× size with a taller line.
- **Cinzel** for the English wordmark only.
- Letter-spacing is **0 on anything that can render Devanagari**, because tracking breaks the shirorekha. Line height is at least 1.4×.

**Shape and components:**
- 4pt grid, gutter 20. Corners 8 / 12 / 20 / 28 / pill.
- Buttons are pill-shaped, 48 tall. Touch targets are at least 48dp.
- Icons are Ionicons outline.

**Rules that carry over:**
- Exactly one filled-gold action per screen state, and one gold card per screen.
- Glass only on the floating layer.
- No blur, no shadows.
- A line that wasn't clearly seen is shown dashed as "not clearly seen" and never looks complete.
- Scan-then-palmistry separation: "what the scan saw" vs "what palmistry says".
- No hidden text behind a blur on locked cards (DEC-042).
- One gold scan beam passes once while the traced lines fade in (DEC-042 `ScanSweep`).

**Owner decision (brand inconsistency found):**
- `assets/brand/icon.svg` and `feature-graphic.svg` draw the lines in heart **#FF7FA6**, head **#5FD4FF** and life **#6FE89A**.
- The app theme uses life **#F07A5A**, head **#6EA8FF**, heart **#F27BB0** and fate **#A993FF**.
- Proposal: keep the icon colours inside the logo only, and use the **theme line colours** in every trace viewer and diagram on the website, so users see the same colours on the site as in their app report.

---

## 4. Three directions

Each direction is a complete system. Contrast figures are WCAG ratios against the named background. AA needs 4.5 for body text and 3.0 for large text and UI.

### Direction A — "Nakshatra Night, Web edition" (brand continuity)

**Mood:** a temple courtyard after dark. Deep indigo, warm gold, moonlit ivory. Quiet, premium, trustworthy. The only saturated colour on the page is the four traced lines.

**Palette, dark (default):**

| Role | Hex | Text on it / contrast |
|---|---|---|
| page | #0B0A1F | ivory #F6F0E1 **17.1**, muted #C3B9D8 **10.4**, faint #8F88B5 **5.9** (captions only) |
| surface1 (cards, header, footer) | #15132F | ivory 15.8, muted 9.7, faint 5.5 |
| surface2 (inputs, raised) | #1E1B42 | ivory 14.3, muted 8.7, faint **4.9** (just above AA; keep faint off surface3) |
| gold (text, links, icons on dark) | #E6B85C | on page **10.6** |
| gold button | GOLD gradient #F5D98B → #E6B85C → #CFA049 | onAccent #1F1300: **13.2 / 9.9 / 7.6** (passes at every stop) |
| line colours on page | life #F07A5A 7.1 · head #6EA8FF 8.1 · heart #F27BB0 7.6 · fate #A993FF 7.7 | all pass even as small labels |
| line colours on diagram palm #3A3078 | gold 6.1 · life **4.1** | life line in diagrams needs its dark halo stroke (below) |

**Palette, light ("Day" reading theme for guides, blog and print):**

| Role | Hex | Contrast |
|---|---|---|
| paper | #F7F5FC (cool lavender-white, deliberately **not** cream) | ink #17133D **16.2** |
| card | #FFFFFF | ink 17.5, muted #4B4574 8.7 |
| raised | #ECE8F7 | faint #6A6492 4.5 (captions only) |
| links / gold as text | goldInk #7A5200 | 6.4 on paper |
| brand gold | #E6B85C | **1.7 on paper, so never text or thin line on Day.** Fill only, with #1F1300 text. |
| line colours (Day) | life #B5391A 5.5 · head #1F5BC4 5.8 · heart #B02A6E 5.7 · fate #6440D0 6.1 | darker twins of the app colours |

**Fonts:**
- **Display, English:** Cormorant Garamond 600/700. This is the app's serif. Use it only at 28px or more, because its small x-height fails at body sizes.
- **Display, Hindi:** Tiro Devanagari Hindi 400. The app's Hindi serif, drawn by John Hudson (Tiro Typeworks) with true Devanagari calligraphic contrast. Upright only.
- **Body and UI, both scripts:** Mukta 400 / 600 / 700. The app's face, designed by Ek Type as a Devanagari-first family, so the Latin and Hindi weights match exactly.
- **Pairing rationale:** a high-contrast classical serif for the one brand line, against a humanist, low-contrast sans that reads well at 16–18px on cheap LCD screens. Hindi gets its own serif rather than a Latin-first serif's weak Devanagari. Direction A needs **zero new fonts** versus the app.
- **Wordmark:** Cinzel is baked into the logo SVG. No Cinzel webfont is loaded.

**Type scale:**
- The scale is fluid (`clamp`), ratio 1.25 on mobile rising to 1.333 on desktop.
- Hindi body is set one step larger because Devanagari at the same px looks smaller, and matras need room.

| Token | English (px, line height) | Hindi (px, line height) | Face |
|---|---|---|---|
| display | 40 → 72, 1.08 | 34 → 60, 1.45 | Cormorant 700 / Tiro |
| h1 | 32 → 52, 1.15 | 28 → 44, 1.45 | Cormorant 700 / Tiro |
| h2 | 26 → 36, 1.2 | 24 → 32, 1.5 | Mukta 700 |
| h3 | 20 → 24, 1.3 | 20 → 24, 1.55 | Mukta 700 |
| lead | 19 → 21, 1.55 | 20 → 22, 1.7 | Mukta 400 |
| body | 17, 1.6 | 18, 1.75 | Mukta 400 |
| small | 15, 1.5 | 16, 1.6 | Mukta 500 |
| caption (minimum) | 13, 1.45 | 14, 1.55 | Mukta 500 |

- Line length: at most 68ch for English and about 60ch for Hindi.
- Letter-spacing is 0 everywhere. Negative tracking (−0.01em) is allowed only on `:lang(en)` display text.

**Spacing:**
- 4pt base: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- Gutter: 20 mobile (same as the app), 32 tablet, 48 desktop.
- Section rhythm: 64 on mobile, 112 on desktop.
- Container widths: text 680px, content 1120px, wide 1280px.

**Radius:** the app scale.
- 8 for tags and progress.
- 12 for inputs, QR tile and small boxes.
- 20 for cards.
- 28 for the one hero frame, the upload zone and sheets.
- Pill for buttons, chips and the language toggle.
- Hierarchy shows through radius: not everything gets 20.

**Elevation and glass (DEC-029 on the web):**
- No box shadows.
- Depth comes from three solid surface steps plus the 1px ivory `edge`.
- Only the page's single hero (the palm frame) gets the gold `hairline`.
- "Glass" appears only on the floating layer: the sticky header once scrolled, the mobile bottom CTA bar, and the menu/language sheet. It is `rgba(21,19,47,0.88)` plus a 1px `glassEdge` rgba(246,240,225,0.14).
- `backdrop-filter: blur(12px)` is enabled only under `@media (min-width:1024px) and (hover:hover)` and `@supports`. It is off under `prefers-reduced-transparency`.
- No blur on low-end Android: it is the single most expensive CSS effect on Mali/PowerVR GPUs.
- Reading content is never glass.

**Iconography:**
- Ionicons outline, the same set as the app (MIT). It ships as an inline SVG sprite of about 20 icons.
- A 1.75px stroke on a 24 grid, rounded caps.
- Plus a small custom set in the same stroke: the four lines, mounts, and four hand shapes.
- No emoji as icons. Emoji render differently on every Android version. The app's ❤️🧠⭐ line labels become line-colour dots on the web.

**Illustration and photo:**
- **Real hands only**: varied Indian skin tones, men and women, daylight, plain background, photographed with consent.
- **Never AI-generated hands.** Finger errors destroy trust, and it would contradict our "real tracing" claim.
- Diagrams use the app's stylised palm (#3A3078 → #1D1850) with the four line colours.
- **The trace is the motif:** every line is a smooth stroke with round caps, drawn over a darker halo stroke (#1A1440 at about 1.4× width). This is exactly how `icon.svg` draws its lines, and it keeps them readable on any skin tone, light or dark.
- The motif is used only where it carries meaning:
  - the hero sample;
  - each line guide's header (that line traced on the sample photo);
  - tool cards (the relevant line glyph);
  - the share card.
- Never as decoration (no swirly dividers, no star fields).

**Motion:**
- **The one orchestrated moment per page:** a gold beam passes down the palm once (1.2s, ease-out). Then each line draws in with `stroke-dashoffset` over 0.9s, staggered 150ms, in the order life → head → heart → fate. Then the labels fade in.
- **Everything else responds to input:** press scale 0.98, 150–200ms colour/opacity changes, sheets slide 240ms.
- No scroll-triggered entrances, no parallax, no looping ambient animation.
- The only looping motion is a soft ring pulse, and only while the server is really working.
- **Reduced motion:** under `prefers-reduced-motion: reduce`, the final state shows instantly and progress is text-only via `aria-live`.
- **Reduced data:** `Save-Data` or `prefers-reduced-data` skips the hero animation and serves the 480w image.

### Direction B — "Rekha Ink" (editorial, day-first)

**Mood:** a scholar's notebook. Ink drawings on white paper, like a modern Samudrika Shastra printed by a design press. This is the Co-Star / Pattern lineage, calm and credible for US readers. Colour appears only in the traced line.

**Palette, light (default):**

| Role | Hex | Contrast |
|---|---|---|
| paper | #FBFAF7 (neutral near-white, not yellow cream) | ink #1B1A2E **16.3** |
| ink-2 | #5E5A6E | 6.4 on paper |
| rule | #E9E6DF | faint #6B665E 4.6 (captions only) |
| indigo ink (links, primary button fill) | #28237A | 12.5 on paper; white on it ≥ 10 |
| haldi (traced line and highlights) | #E0A526 fill + #1B1A2E halo | text on it #141414 **8.4**; as text it needs haldiInk #8A5A00 (5.7) |
| sindoor (errors only) | #B3261E | 6.3 |

**Palette, dark:** black #000000 page, paper #F2EFE8 text (18.3), muted #B8B2A7 (10.0), haldi #E0A526 (9.6).

**Fonts:**
- **Display:** Eczar 500–800 (variable). Designed by Rosetta with Latin and Devanagari drawn together as one family, so the scripts match in rhythm and weight. It is expressive at large sizes, with sharp wedge terminals that feel like a pen on palm-leaf.
- **Body and UI:** IBM Plex Sans Devanagari 400/500/600. It includes IBM Plex Sans Latin, and its neutral, engineered tone signals "measured, not mystical".
- The two are clearly different (calligraphic vs engineered), as the skill asks.
- **New fonts vs the app: 2.** That weakens brand continuity.

**Scale:**
- Ratio 1.333, a bigger display: English 44 → 88, Hindi 38 → 72.
- Body: English 18/1.6, Hindi 19/1.75.
- Radius 0–8. Editorial and sharp, but not zero everywhere (that is the "broadsheet" tell). Buttons 8.
- Elevation: none. Hairline rules at 1px #E9E6DF separate information.
- Glass: none.

**Icons, illustration and motion:**
- Icons: 1.5px outline, custom drawn.
- Illustration: B&W hand photos with a single haldi trace; the natal-chart equivalent is a precise "palm atlas" line drawing.
- Motion: one pen-stroke draw of the haldi line (1.1s), nothing else. Reduced motion shows it static.

**Risk:**
- It looks like a different company from the app: indigo-gold app vs black-white site.
- It is also the closest to the "broadsheet" AI cluster, and Co-Star owns this look.
- Indian users on sunny outdoor screens do benefit from a light default.

### Direction C — "Chandni Glass" (expressive, cosmic)

**Mood:** moonlight through temple lattice. Deep plum-violet, aurora teal and rose glow, frosted glass panels, luminous lines. This is the Nebula / astrology-app lineage and gets the biggest instant "wow" in a demo.

**Palette, dark (default):**

| Role | Hex | Contrast |
|---|---|---|
| page | #140A2E | white **18.9**, muted #D5CBF0 12.3, faint #A69BC9 7.3 |
| surface | #231048 | white 17.0 |
| glass panel | rgba(255,255,255,0.06) over #231048 + blur(20px), fallback #2A1A4F | white 15.5 |
| aurora (links, focus) | #7CE7D6 | 12.8 |
| rose | #FF9EC4 | 9.8 |
| gold CTA | #F2C66D, text #1B0F33 | **11.2** |
| background gradient | #140A2E → #231048 → #0E3B4A (aurora corner) | decorative |

**Palette, light:** lilac #F5F0FF, ink #1B0F33 (16.2), muted #5B4A86 (6.8), violet link #6B3FD6 (5.7).

**Fonts:**
- **Anek Devanagari** variable, both axes (width 75–125, weight 100–800), **one family for both scripts**. Wide 800 for display, normal 400 for body.
- Tiro Devanagari Hindi for pull quotes.
- The width axis allows a signature moment: the headline widens as the scan completes. It is cheap because it is one variable file.
- **New fonts vs the app: 1–2.**

**Scale, shape and motion:**
- Ratio 1.25, display English 40 → 80.
- Radius 24–32 on everything glass. The risk is the uniform-radius "SaaS card kit" tell.
- Elevation: glass plus a colour glow (`drop-shadow` in aurora at 20% opacity).
- Motion: a shimmering background gradient, glass tilt on hover, line glow pulses, and the scan beam.

**Risk:**
- **This is the generic astrology look** (purple gradient + glow + glass) that Nebula and a hundred template apps already use.
- It contradicts DEC-029 (glass only on the floating layer, no blur).
- `backdrop-filter` and animated gradients drop frames on low-end Android.
- The most "wow" in a desktop demo, and the least honest-feeling and slowest on a ₹8,000 phone.

---

## 5. Recommendation: Direction A, with two borrowings

**Pick A, "Nakshatra Night, Web edition".** Borrow B's editorial discipline for the Day reading theme on guides and blog, and C's single signature moment: the one scan beam, not the glass.

Why this works for **India**:
- It is the same brand as the app, so a visitor who taps "Get the app" lands in a place that looks like where they came from. That lifts Play conversion and cuts "is this the same company?" doubt.
- In Indian visual culture, gold on deep blue reads as *mandir* and jewellery gold: auspicious and premium, not the saffron-and-yellow marketplace look of Astrotalk and AstroSage. That makes it instantly different on a crowded SERP or WhatsApp preview.
- Mukta and Tiro are already proven in the app's Hindi, and Direction A adds zero new fonts, which is the lightest page weight.
- Dark pages are cheaper for AMOLED phones, which are now common even in the ₹10–15k range. This is a small benefit, not a promise.

Why this works for **US users**:
- The dark, restrained, one-accent look sits in the same premium tier as Co-Star and The Pattern, without copying Co-Star's black-and-white.
- The honest "the scan saw / palmistry says" separation and the "not clearly seen" dashed state read as credible. That matters where the category is seen as gimmicky.

Why not B: brand split from the app, and Co-Star owns that look.
Why not C: generic, slow on low-end Android, and it breaks DEC-029.

**Dark or light default:**
- Dark is the site default everywhere; it is the brand.
- A sun/moon toggle in the header switches to Day. The choice is remembered in `localStorage` only (no cookie).
- Guides and blog print in Day.
- We don't auto-follow `prefers-color-scheme` on the home page, because the hero moment is designed for dark. Owner decision if you'd rather follow the system theme.

---

## 6. Self-review against the brief (frontend-design two-pass rule)

| Check | Result |
|---|---|
| Would another AI make the same page for "astrology app landing"? | That default is a purple cosmic gradient, stars, a zodiac wheel, a stats row and a split-colour headline, which is Direction C. **A replaces all of that** with a real traced palm and has no stars at all (the app removed moon and stars from the icon on 2026-09-21 too). |
| Cream + serif + terracotta tell? | No cream: the Day paper is cool #F7F5FC. No terracotta: the life line is a data colour, not a UI accent. |
| Near-black + one acid accent tell? | The page is a saturated indigo #0B0A1F, not tinted black. Gold is warm and brand-owned. |
| SaaS card kit? | Radius follows hierarchy (8/12/20/28), there are no shadows and no gradient washes, and tool cards vary by type (§7). |
| Template chrome? | Dropped: tracked-caps eyebrows, `·` meta strings, `→` on buttons, mono labels. **Note:** the app's DEC-042 copy uses "·". On the web, split those into separate lines or short sentences. |
| One boldness? | Yes: the traced palm (hero + trace viewer). Everything else is quiet. |
| Honest? | No counters, no countdowns, no struck prices, no invented numbers, no AI hands. The sample hero is labelled "A real photo, traced by Palm Read AI". |

Changed after review (things a straight port of the app would have carried over):
1. The app's Cinzel `overlineCaps` section labels. **Not carried to the web**: that is tracked-caps chrome. Cinzel stays in the logo SVG only.
2. The obvious 12-tool layout, a uniform 3×4 card grid. **Changed** to one featured tool plus rows or a grid grouped by type.
3. The app's "·" joined copy and emoji line labels (DEC-042). **Replaced** with short separate lines and line-colour dots.

---

## 7. Component inventory (Direction A)

Every control has at least a 48px hit area, a visible focus ring (2px #F5D98B plus a 2px page-colour gap) and `lang`-correct text.

| Component | Spec |
|---|---|
| **Header** | Logo SVG left; language toggle + "Read my palm" (text button) right. Becomes floating glass after 24px of scroll. Mobile: logo + अA + menu. No second gold button when the hero's gold button is on screen (one dominant action). |
| **Primary button** | Pill, 52 tall (48 minimum), GOLD gradient, #1F1300 Mukta 700 17px, sentence case, no arrow. **One per viewport state.** Pressed: #CFA049 + scale 0.98. Busy state keeps the label ("Reading your palm…") and shows a spinner. |
| **Secondary / text button** | Surface2 fill + ivory text (14.3), or a gold text link with underline on hover and focus. |
| **Upload dropzone** (hero) | A 28-radius surface1 panel with the gold hairline (the page's one framed hero). Mobile, min 240px tall: two big targets, "Take a photo" (`capture="environment"`) and "Choose from gallery". Desktop: drag and drop + paste + browse. Photo-tip chips with tiny real thumbnails: "Daylight", "Whole palm", "Fingers together", "Flat hand". **The one privacy sentence right here**, the same verified wording as the app's `features/reading/privacy-copy.ts` (re-verify against the web photo path before launch). The photo is **downscaled in the browser to 1280px, JPEG 0.85** before upload (≈250 KB instead of 3–6 MB). A **client-side photo check** (brightness, blur via a Laplacian estimate on a 256px canvas, too-small or rotated) gives a capture-review step with the real photo, the real problem, and "Use this photo" / "Retake" (port of the app's `features/quality/review.ts`). Below: **"No photo handy? Try a sample hand"** with 3 real sample palms (remove.bg pattern). |
| **Scan progress** | One status block: the **real current stage** from the server (Uploading → Checking photo → Tracing lines → Writing your reading) + one bar. No fake timers or checklists (owner rule). The gold beam runs over the user's photo while tracing is really happening. |
| **Line-trace viewer** | The user's photo, at most 45% of viewport height on mobile, with an SVG overlay in the photo's own coordinate space. Line chips below (colour dot + name in hi/en): tap one to highlight that line and quiet the others. An untraced line gets a dashed chip "not clearly seen" and is **never drawn**. A "What the scan saw / What palmistry says" pair per line. Tap the photo for a full-screen view with pinch-zoom (native `touch-action: pinch-zoom`, no library). `figure` + `figcaption` lists the lines found, for screen readers. |
| **"At a glance" card** | Meaning first: 2–3 personal takeaways under the photo, before any line detail (app rule). The page's one gold card. |
| **Locked card** | Same as the app (DEC-038/042): title, the first real sentence readable, up to 2 more lines faded under a gradient, and a "Tap to open" pill. The whole card is the tap target. **No blur and no hidden text:** only the lead sentences the free tier already shows. The action matches the flow step: "Save with email to open" for report 2, then "Open in the app". |
| **Tool card** | 12 tools, not a uniform grid. One **featured tool** (Palm photo checker) is a wide card with a live mini-demo. The others are list rows on mobile and a 3-column grid on desktop, grouped by type (Visual / Quiz / Calculator). Each has a line glyph, a name, one line "what you get", and a "No sign-up" tag only if true. |
| **Guide template blocks** | Quick facts box · traced example on the sample photo (that line only) · variations (diagram thumbnails) · myth vs reality (2 columns → stacked) · **"What palmistry cannot tell you"** box (the honest limits) · classical source per meaning (citation block, from the app's rule sources) · photo tips · FAQ (`details/summary` + FAQPage schema) · "Step n of 7" pager (a real sequence) · topic-matched scan CTA · related guides. Prose on surface1 at 680px max; Day theme available. |
| **Interactive palm map** | An SVG hand with 4 lines + 7 mounts as real `<button>`s, keyboard-focusable. Tap or focus shows a meaning sheet (mobile bottom sheet, desktop side panel) with a link to the full guide and "See it on your palm". No-JS fallback: a plain list of links. |
| **Store buttons** | The official Google Play badge, unmodified (Google brand rules), 48px or taller. On Android the link goes straight to Play with `referrer=utm_source=web&utm_campaign=<page>` (ASO kit scheme). On iPhone: "iPhone app coming — read your palm here now" (no App Store badge until an iOS app exists). On desktop: badge + QR tile. |
| **QR tile** | Dark modules #0B0A1F on an ivory #F6F0E1 tile (17.1:1; a gold-on-indigo QR scans badly), 4-module quiet zone, at least 132px. Generated at build time as SVG (no JS), with the caption "Scan with your phone camera". No logo in the centre, to keep error correction headroom. |
| **Language toggle** | A pill segmented control "हिंदी / English", each name in its own script, never flags. The mobile header uses the compact **अA** glyph (Astrotalk pattern) that opens the choice. It is a **link to the equivalent URL** (`/hi/…` ↔ `/…`), not a JS swap: `hreflang` pairs, `<html lang>`, and no cookie. |
| **Mobile bottom CTA bar** | Floating glass, shown only after the hero's CTA scrolls out of view, and hidden when the upload panel is visible, so there is never a duplicate action. Respects `env(safe-area-inset-bottom)`. |
| **Share card** | Drawn with canvas on the user's own traced photo: logo, one-line archetype, site URL. "Share on WhatsApp" first. Nothing is uploaded to make it. |
| **Cookie-free footer** | Logo · one honest line ("Palmistry is a tradition for reflection. It does not predict health, lifespan or exact dates.") · language toggle · Guides / Tools / Blog / About / Privacy / Terms / Contact · Play badge · "No cookies, no ad trackers" (**only if true**: use cookieless analytics such as Cloudflare Web Analytics, Plausible or Umami) · "Made in India". **No cookie banner at all**, a visible difference from 4 of the 9 inspiration sites. |
| **Notices / errors** | An icon + text, never colour alone. Error copy says what went wrong and how to fix it ("Too dark — move near a window and retake"). No apologies. |

---

## 8. Wow moments (honest and fast)

1. **The hero palm traces itself.**
   - A real sample photo (AVIF, about 45 KB), then the gold beam passes once, then the four lines draw in, then labels appear: "Life line", "Head line"…
   - The label under it reads "A real photo, traced by Palm Read AI".
   - The paths are the **actual output of our model** on that photo, exported as SVG, not hand-drawn.
   - Cost: about 4 KB of SVG + about 1 KB of CSS keyframes. **No JS.**
2. **The same moment on *your* palm.**
   - After upload the beam runs over the user's own photo, synced to real server stages, and their lines draw in.
   - A missing line shows as a dashed "not clearly seen" chip.
   - This is the moment no competitor can match: they all draw fixed or AI-sketched lines.
3. **"Try a sample hand".** One tap runs the full viewer on a sample, with zero upload. It gets US desktop and privacy-shy visitors to the wow in 2 seconds.
4. **Interactive palm map.** Tap any line or mount to see its meaning, with a link to the guide. SVG + about 3 KB JS.
5. **Live photo checker tool.** The camera photo gets instant, local ticks ("Bright enough ✓ Sharp ✓ Whole palm ✓"). A useful free tool and a lead-in to the scan. Runs on a canvas; no ML model download (hand detection models are several MB, too heavy).
6. **Bilingual headline.** The home headline is set large in Tiro Devanagari on `/hi/` and in Cormorant on `/`, the same layout in both scripts. A typographic moment no competitor has, and it costs nothing.
7. **WhatsApp share card on the user's traced photo.** Viral, personal, and generated on the device.

Not doing: 3D hands, WebGL, particle starfields, Lottie, autoplay video, glass tilt, scroll-jacking. All are slow on low-end Android and none is evidence.

---

## 9. Performance and quality budget

- **Test device:** Lighthouse mobile (Moto G Power profile, 4× CPU slowdown, Slow 4G), plus one real Android Go-class phone.
- **Core Web Vitals, p75 field:** LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.05.

| Budget | Home | Guide / blog | Tool |
|---|---|---|---|
| HTML + inline critical CSS (gzip) | ≤ 30 KB | ≤ 35 KB | ≤ 25 KB |
| Total CSS (gzip) | ≤ 25 KB | ≤ 25 KB | ≤ 25 KB |
| JS (gzip) | ≤ 60 KB (upload + viewer island, loaded on first interaction or idle) | **0 KB** by default; ≤ 10 KB for the palm map or FAQ extras | ≤ 40 KB |
| Fonts | ≤ 2 preloaded woff2. English pages ≤ 120 KB total; Hindi pages ≤ 180 KB | same | same |
| Hero image | AVIF ≤ 45 KB at 480w and ≤ 90 KB at 960w, WebP fallback, `fetchpriority="high"`, width and height set | — | — |

- **Fonts:**
  - Self-host the fonts (Fontsource or google-webfonts-helper), with no third-party font request. That is cookie-free and privacy-clean, and saves a DNS lookup on 4G.
  - Split fonts by `unicode-range` so English pages never download Devanagari files.
  - Use `font-display: swap` with `size-adjust` fallbacks. The Devanagari fallback on Android is Noto Sans Devanagari, which is decent.
- **CSS:**
  - Animate only `transform`, `opacity` and `stroke-dashoffset`.
  - No `backdrop-filter` on mobile.
  - No `box-shadow` animations.
  - `content-visibility: auto` on long guide sections.
- **Photos:** client-side downscale before upload. The server returns trace paths as JSON, and the overlay is drawn as SVG (a few KB).
- **Accessibility:**
  - Focus ring on every control.
  - `prefers-reduced-motion` respected.
  - Text contrast ≥ 4.5 (all pairs above are checked).
  - Touch targets ≥ 48px.
  - Text scales to 200% without horizontal scroll.
  - Devanagari never letter-spaced or clipped (line height ≥ 1.45 on Hindi headings).

---

## 10. Decisions needed from the owner

1. Approve **Direction A** (recommended), or choose B or C.
2. Line colours on the website: use the **app theme colours** (recommended) and keep the icon's pink/cyan/green inside the logo only?
3. Dark default everywhere with a Day toggle (recommended), or follow the phone's system theme?
4. Consent-based **real hand photos** for the hero and samples: 3–5 hands, varied skin tones, men and women. Who shoots them? The owner's family is fine with written consent.
5. Analytics must be cookieless for the "no cookie banner" promise to stay true.
