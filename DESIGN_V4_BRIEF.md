# Design v4 brief: ultra-premium cinematic redesign (owner, 2026-09-26)

This file holds the owner's answers to the 28-question creative interview. It is the source of truth for the v4 redesign of the whole site. `DESIGN_SYSTEM.md` tokens stay valid unless this file changes them. Honesty rules from `CONTENT_GUIDE.md` / `UX_PSYCHOLOGY.md` still apply everywhere.

## Vision
The site should feel like a multi-million-dollar product: cinematic, mature, never childish. A visitor's reaction should be "wow, it feels real". The story runs in 5 chapters: (1) a world of hands, (2) one hand is scanned in the demo loop, (3) "your turn" with live camera or upload, (4) a cinematic reveal of the result, (5) trust and the app.

## Owner answers
| # | Topic | Decision |
|---|---|---|
| 1 | Mood | **Cinematic dark luxury**: deep indigo/black, gold light, jewellery-ad / Apple-product-page reveals |
| 2 | Hero hands source | **AI photoreal (Higgsfield)**, 10–15 hands |
| 3 | Hand motion | **Float in from left/right with depth parallax** (near hands faster, far hands slower, focus/blur) |
| 4 | Variety | **Different ages** (young → elderly) |
| 5 | Headline language | **English first** (Hindi via toggle; `/hi/` stays Hindi) |
| 6 | Low-end phones | **Smart lite version**: full 3D on capable devices, the same look from light video/photo layers on low-end ones; reduced-motion respected |
| 7 | Hero interaction | **Mouse moves the hands (desktop), phone tilt adds depth (gyroscope), touch/hover makes a hand's lines glow gold** |
| 8 | Intro | **No intro**: content first, animation runs alongside |
| 9 | Scan demo | **The real product made cinematic**: a real photo, lines from our REAL scanner, animated |
| 10 | Demo hand | **The owner's or a volunteer's real hand** (consented photo from the owner) |
| 11 | Demo playback | **Auto loop** |
| 12 | Demo end | **Result card + "Your turn — scan your palm"** |
| 13 | User capture | **Live camera with hand-outline guide + auto-capture, and upload, both** |
| 14 | While waiting | **Real server stages live**: lines appear one by one on the photo, with the gold scan beam |
| 15 | Result reveal | **Cinematic line by line**: zoom to each line, glow, meaning, then the full report |
| 16 | Result photo | **The user's own photo with depth/parallax + glowing lines** (tilt/mouse) |
| 17 | Testimonials | **Real reviews from closed-test users/family/friends** with photo + hand consent; never invented |
| 18 | Testimonial design | **Face + their traced hand + quote**, slow-sliding cards with depth |
| 19 | Trust | **"Where your photo goes" animation, founder story (Deepak Chauhan), real "palms read" counter (only with real data)** |
| 20 | FOMO | **Personal free-readings counter, the real first line of locked parts, share card** |
| 21 | Colours | **Indigo + gold, richer** (3D light, deep shadows, gold glints) |
| 22 | Sound | **None** |
| 23 | Desktop cursor | **Magnetic buttons + light that follows the cursor on cards** |
| 24 | Extra wow | **Scroll-driven 3D palm map, couple compatibility (tradition only, no marriage dates), palm art poster (download/share)** |
| 25 | Scope | **Whole site redesigned together** |
| 26 | Asset budget | **Higgsfield credits**: show 3–4 samples first, generate the rest after approval |
| 27 | Pace | **Quality first, in phases**, each phase shown on localhost for approval |
| 28 | Approval | **Visual preview first** (design canvas + AI hand samples), then code |

## Follow-up decisions (owner, 2026-09-26, after the first samples)
- **Hero hands:** the Higgsfield look is approved (young woman, man 40s, elderly woman). Generate 10–12 more in varied poses and ages, with the forearm fading into darkness (never cut off), then make transparent cut-outs for the floating layer. Raw PNGs go in `design-v4/samples/` (not in git); optimised AVIF/WebP go in `public/` only when used.
- **Line colours on the website:** classic, as in the owner's references: **heart red, head blue, life green, fate purple**. This replaces the app-derived line colours in `DESIGN_SYSTEM.md` for the website only; the app is unchanged.
- **Line labels:** **pill-box labels** joined to the line by a thin leader line (owner reference `design-v4/samples/ChatGPT Image … (9).png`). A line that isn't found is shown as a "No fate line"-style note, never drawn.
- **Owner's ChatGPT hand photos** (`design-v4/samples/ChatGPT Image …`, 5 hands, each plain and annotated) are AI-generated. On the site they may appear only as a labelled **"demo hand"**, and the lines shown on them must come from our real scanner, never the hand-drawn annotations. The annotated versions are a style reference and a rough benchmark for the scanner. A real (non-AI) consented hand photo is still wanted for the demo loop (answer 10).

## Hero change: one hand at a time (owner, 2026-09-26, after the first v4 preview)
The first preview put ~9 hands in one frame. The owner rejected it: it looked like a "horror movie" crowd of hands. This **replaces answer 3** (float in with parallax):
- **Never a crowd of hands in one frame.** One hand is in focus at a time (at most a faint hint of the next during the change).
- **Scroll story:** as the visitor scrolls, a different hand (a different age) comes in sharp, holds with one short line of text, then **blurs and fades away** while the next one arrives. The last beat is "Now, yours": a gold hand outline and the scan button.
- **Calm, not creepy:** open palms facing the camera, warm gold key light and halo, the forearm fading softly; no hands reaching up out of the dark, no dim ghost hands at the edges.
- **Every device:** all beats (text + image + alt) are in the HTML on phone, tablet and desktop. Lite mode swaps blur for a plain fade; reduced motion shows the beats as normal stacked sections.

## Build status
| Phase | What | State |
|---|---|---|
| 1 | Home opening: hand scroll story (WEB-DEC-040) | Built on localhost 2026-09-26, gate green, waiting for owner review |
| 2 | Scan demo loop (needs a consented real hand photo + real scanner lines) | Not started (waiting on the photo) |
| 3 | Live camera with hand outline + upload, real server stages | Not started (needs the server deploy) |
| 4 | Cinematic line-by-line result | Not started |
| 5 | Palm map, trust (real reviews, founder), rest of the site | Not started (waiting on reviews, founder photo and story) |

## Same site on every device (owner reminder, Google mobile-first indexing)
One responsive site: the same URL, HTML content, headings, links, images/alt text, structured data and meta on phone, tablet and desktop. Only presentation adapts (layout, image sizes, 3D/animation intensity, the low-end "lite" mode). Lite mode swaps heavy effects for lighter ones but never removes content. Every screen is checked at 390px, 768–1024px and 1440px.

## Non-negotiables carried over
- Lines shown as "traced" are always real scanner output, never drawn.
- AI-generated hands are decorative only (hero, backgrounds), never presented as a real user's reading.
- No fake testimonials, counters, countdowns or discounts.
- Performance: LCP stays fast (text first). Heavy 3D loads lazily on capable devices; lite layers on low-end Android.
- Accessibility: reduced motion, keyboard, contrast, 48px targets.

## Waiting on the owner
- 1–3 consented real palm photos for the scan demo (owner/volunteer).
- Real reviews with face + hand photo consent from test users.
- Founder photo + story (Deepak Chauhan).
- Server deploy (app repo `OWNER_GUIDE.md` Step 9) so the real scan works.
