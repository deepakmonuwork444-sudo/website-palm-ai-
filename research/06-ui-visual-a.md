# UI/UX visual teardown A: palmist.io, palmreading.pro, palmly.ai

Researched on 2026-09-26. Read-only: I did not upload, sign up, submit a form or pay anything.

Screens are in `research/screens/<site>/`. The file names follow `<page-slug>__<mobile|desktop>__<fold|full>.png`. Each site also has a `__styles.json` file with fonts, colours, CTA styles and H1/H2 text. This note builds on the text teardowns `01-palmist-io.md`, `03-palmreading-pro.md` and `05-palmly-ai.md`. Anything about flows that the screenshots cannot show comes from those files and is marked **(text research)**.

**Capture notes**

- **palmly.ai.** The live site could not be captured:
  - https fails with `SEC_E_CERT_EXPIRED`, because the certificate expired on 2026-09-24;
  - http returns a 301 redirect back to https.
  - I used the latest **Wayback snapshot (2026-07-30)**. Only the **homepage** is archived. The Wayback API has no snapshot for /palm-reading, /agents, /agents/numerology-calculator or /blog, so the palmly reading, tool and guide templates are described from text research only.
  - The archived page scrolls inside an inner container. I made the full-page capture (`palmly_archive_home__*__full.png`) by growing the viewport to the height of the content.
  - Web fonts and the hero image may not all load from the archive. The mobile hero image shows as an almost black box.
- **Retakes.** The standard tool timed out on several palmreading.pro pages and on the palmist `/palmistry` mobile full page, because the laptop was short of memory while other sessions were also capturing. I retook those with a scratch copy of the tool that uses a CDP screenshot. Those retakes are 1× (390 px wide), and mobile full pages are capped at 7,800 px.
- **Capture artifact.** In `palmist_io__mobile__full.png` and `palmreading_pro__mobile__full.png`, the top of the page appears again at the bottom. That comes from the capture, not from the site.

---

## Site 1: palmist.io (India-first palm reading plus AI astrologer marketplace)

Pages captured:

| Page | Files |
|---|---|
| Home | `palmist_io__{mobile,desktop}__{fold,full}.png` |
| Scanner | `palmist_io_palm_reading__*` |
| Guide hub | `palmist_io_palmistry__*` |
| Guide | `palmist_io_palmistry_heart_line__*` |
| Tools | `palmist_io_numerology__*`, `palmist_io_kundli__*` |
| Pricing | `palmist_io_pricing__*` |
| Paid report | `palmist_io_reports_marriage__*` |

### 1. Visual identity

**Mode: dark "night sky".**
- Body `#08060F`.
- Cards `#12121C` with 1 px borders in white at 5–10% opacity.
- Radial glows: violet at top-left, magenta at top-right, teal at the bottom. There are also faint star dots.
- The same backdrop is used on every page.

**Palette** (from `palmist_io__desktop__styles.json`):

| Role | Colour |
|---|---|
| Main text | `#F6F3FF` |
| Muted text | white at 45 / 55 / 60 / 80% opacity |
| Primary accent: gold | `#F5B642` |
| Primary CTA | gradient `#FFD67E → #F5B642` with dark text `#2A1A00` |
| Secondary accent: violet (only the "Sign in" button) | `#8B5CF6` |
| Text links | violet-300 `#C4B5FD` |
| Eyebrows | violet-200 `#DDD6FE` |
| "Replies instantly" chip and the "Free" labels on pricing | teal-400 (≈ `#00D5BE`) |
| Line colours on the palm diagram (from the `/palmistry` styles) | heart rose `#FB7185`, head violet `#C4B5FD`, life teal `#5EEAD4`, fate amber `#FBBF24` |

**Type.**
- Headings use **Fraunces**, a soft high-contrast serif. Body text uses **Inter**.
- The signature move is a **two-tone H1** with the keyword in gold: "Your AI *palm reader* is ready.", "Free AI *palm reading scanner*", "Pay only for *what you use*".
- The scale is large and editorial: the H1 is about 44 px on mobile and about 64 px on desktop, and body text is 17–18 px on mobile.
- Eyebrows are small caps with wide letter-spacing ("FREE · INSTANT · PRIVATE", "PALMISTRY GUIDE").

**Shape.**
- Pills everywhere: buttons, chips, the language switcher and the nav.
- Cards have a radius of about 24 px. The header is a **floating rounded glass bar**.
- There are almost no drop shadows. Depth comes from borders and glows.

**Imagery.**
- No real palm photos anywhere, and no sample report.
- There is one custom flat purple SVG hand, with the selected line highlighted in its colour.
- Emoji icons (🖐️ ✨ 🪐 ❤️ 🔮 🔢) sit in rounded-square tiles.
- Persona cards use photo-realistic "Indian astrologer" portraits (Jyoti, Pandit Aryan …), which look AI-generated.

**Motion** (as far as screens show it):
- a scrolling trust marquee (desktop fold);
- an interactive line diagram with tabs;
- a floating chat button;
- a raised centre "Ask" button in the bottom bar.

Density is airy on desktop. On mobile it becomes one very long single column (home is about 8,800 CSS px tall).

### 2. Home layout teardown (mobile first)

**Mobile fold** (`palmist_io__mobile__fold.png`), top to bottom:
1. The floating glass header: logo, an "English" language pill and a violet **Sign in** button. It is tall, about 65 px.
2. The eyebrow chip "★ Free AI palm reading · 13 languages".
3. A 2-line serif H1.
4. A 4-line subline that is mostly about astrologers.
5. Emoji "avatars" with "50,000+ readings delivered".
6. The link "Ask an astrologer →".
7. The label "✋ Read my palm — free".
8. The **upload dropzone, only half visible**.

**Problem:** the dropzone's gold **"Reveal my palm reading" button is off-screen**, and it is also **covered by the fixed 5-tab bottom bar** (Palm, Horoscope, raised gold **Ask**, Explore, **Wallet**). A floating chat bubble overlaps the dropzone text. The first thing a mobile user can tap is "Ask an astrologer", the paid path, not the free scan.

**Desktop fold** (`palmist_io__desktop__fold.png`) is excellent:
- a 2-column hero: copy on the left, the upload card on the right, with the gold CTA and the privacy line "🔒 Your photo is analyzed instantly — we don't keep it" all visible;
- the trust marquee runs along the bottom edge of the fold;
- the nav is centred: Palm Reading, Astrology, Tarot, Horoscope, Pricing.

**Sections in order** (`palmist_io__mobile__full.png`, sheets 1–3):

| # | Section | What it shows | Verdict |
|---|---|---|---|
| 1 | Trust marquee | "AI astrologers reply instantly", "Private & secure — we don't keep your photo", "Available 24×7, even at 3 AM"… | Cheap but effective reassurance. It is astrologer-heavy. |
| 2 | "Learn to read a palm — right here" | The SVG hand plus 6 line chips (heart, head, life, fate, marriage, money). Each chip shows a 2-line meaning, "Read the full guide →" and a gold "Read my palm — free". | **Best idea on the site.** It is educational, interactive and links internally. The downside is a stylised hand, not your hand. |
| 3 | "What is palm reading?" | Three long paragraphs: Hast Rekha Shastra, Cheiro, and "a structured mirror, not prophecy". | Honest and on-brand for India, but it is a wall of text on mobile. |
| 4 | "How to get your free reading" | 3 numbered cards and "Scan my palm now — free". | Clear. It repeats the "89% of our readers are on mobile" stat. |
| 5 | "Everything the stars hold — in one app" | 6 tool cards stacked in one column (about 400 px each on mobile). | It is too long on mobile and should be a 2-column grid or a horizontal scroller. |
| 6 | "Talk to our AI astrologers" | A horizontal carousel of persona cards: photo, ★4.9 · 24k+ chats, languages, ₹4/message, ₹25/min, Chat and Call buttons. | The strongest money section. Price rows are transparent, but the "human" photos for AI personas are ethically shaky. |
| 7 | "Instant reports" | Row list, each marked "Free" in gold. | Scannable. |
| 8 | FAQ | 7 accordions in pill-shaped rows. | Standard. |
| 9 | Closing CTA card | "Your future is written in your palm." with a gold CTA. | **Contradicts** the honesty copy in section 3. |
| 10 | Footer | Stacked columns: Readings, Company (Pricing, Contact, **Wallet**), Legal (Delete account, Refund), and the line "Not a substitute for professional advice." | Compliance-grade. There is no Play Store badge anywhere. |

**Sticky elements on mobile:** the header, the 5-tab bottom bar, and the chat button. Together they cover about 20% of a 844 px screen.

### 3. Reading / upload UX

The `/palm-reading` page (`palmist_io_palm_reading__mobile__fold.png` / `__full.png`):
- a centred eyebrow, "FREE · INSTANT · PRIVATE";
- the two-tone H1 "Free AI *palm reading scanner*";
- the sub "reads the lines it actually finds — in English plus 12 Indian languages";
- the dropzone, fully in view here, with a hand-emoji tile, "Drop your palm photo here, or click to browse" and "JPG, PNG, GIF, WebP · up to 16MB";
- the privacy line.

There is **no visible button until a file is chosen**. The input has no camera-first wording.

**The photo tips are far below the upload**: 4 tip cards ("Use natural light", "Hold your palm flat, shoot from directly above", "Scan your dominant hand", "Your phone camera is enough"). They come after "The four major palm lines" and "How palm reading works". They should sit right next to the dropzone.

The flow after upload **(text research)**:
- A "Step n of N" quiz: language, writing hand, gender, date of birth, focus, name, birth time and place. Each question has a "💡 why we ask" line.
- "Reading the lines…".
- A partial result, then a **free sign-in gate**: "Unlock my full reading — free · no card needed".
- Full chapters, a "Traced from your photo (indicative)" note, and upsells to astrologer chat and call and the ₹199 Marriage Timing Report.

**Paywall presentation** (`palmist_io_reports_marriage__mobile__full.png`):
- a serif H1;
- 5 gold ✦ bullets that promise "marriage windows with exact dates";
- a price card, "₹199 · One-time purchase · yours forever · in your language", with the gold button "Sign in to see your report".

The disclaimer "Astrology describes supportive periods, never certainties" sits *under* the bottom bar, where it is hidden.

**Pricing page** (`palmist_io_pricing__mobile__full.png`) is very India-native:
- "Pay only for *what you use*";
- a gift card, "Start free: 2 questions + a 60-second call";
- ₹4/message and ₹25/min, with "Metered per second — never overpay";
- every report marked "Free" in teal;
- wallet packs from ₹49 to ₹1000 with teal "+₹200 bonus" chips, "Extra 10% on UPI. First recharge: 100% bonus.", and "Secure payment via PayU — UPI, cards & netbanking".

### 4. Tool and guide templates

**Tool template** (`palmist_io_numerology__mobile__full.png`, `palmist_io_kundli__mobile__fold.png`):
- A centred emoji icon tile.
- A short serif H1 ("Numerology", "Your Kundli").
- A sub that states the free part and the sign-in upsell: "free, no login. Sign in for the full reading…".
- A glass form card: labels above inputs, dark inputs, the native `dd-mm-yyyy` date picker. On Kundli there is also "☐ I don't know my exact birth time (we'll compute for 12:00 noon)".
- A gold "Reveal my numbers" button that is dimmed until the form is valid.
- A privacy note under the button: "For a signed-out visit nothing is saved".
- Below that: an explainer, 5 number-meaning cards, an FAQ, then an upsell card "Want these numbers read just for you?" with a gold "Ask an astrologer" button and a dark-teal "📞 Call now" button.

This is a clean, repeatable pattern. On mobile the form fills the whole fold, and the result appears below it.

**Guide template** (`palmist_io_palmistry_heart_line__mobile__full.png`, `palmist_io_palmistry__mobile__fold.png`):
- Breadcrumb, then the eyebrow "PALMISTRY GUIDE", then a 3–4-line serif H1.
- A long intro, then an **SVG diagram card with caption** ("Where the heart line sits on the palm").
- A **QUICK FACTS card** that works like a definition table: Sanskrit name "Hriday Rekha (हृदय रेखा)", Western name, where it is, what it governs, which hand.
- H2 sections, variation cards (wavy, absent…), a myth-busting paragraph, 6 FAQ accordions, and a closing CTA card ("What does your *heart line* say?", with the gold button "Get my free palm reading").

On readability:
- Body text is 17–18 px with a generous line height.
- Muted white on near-black is tiring to read for 2,000+ words.
- There is no table of contents and no mid-article CTA.
- Inline links are violet and underlined.
- The fixed bottom bar hides the last lines of the reading position.

### 5. Psychology used

- **Trust:**
  - the privacy line at the moment of upload;
  - "we don't keep it" repeated;
  - an honest "not a science" section;
  - DPDP-aware legal pages and a "Delete account" link;
  - "why we ask" hints in the quiz (text research).
- **Social proof:**
  - "50,000+ readings delivered", shown next to emoji circles rather than faces;
  - persona ratings (★4.9, 24k+ chats) that cannot be verified.
  - There are no user reviews.
- **Urgency / FOMO:** hardly any. The "3 AM" line quietly targets late-night anxiety.
- **Fear handling:**
  - price: "Free" everywhere, "no subscription, no auto-charge", per-second metering, the first 2 questions free;
  - privacy: covered above.
- **Curiosity:**
  - "Tap any line to see what a palmist reads in it. Then let our AI read yours for real.";
  - "exact dates" on the marriage report, which is a high-risk claim.

### 6. Mobile quality

- **Tap targets** are good: pills of 44 px or more and a large bottom bar.
- **Text size** is good: body 17–18 px.
- **Overlap bugs:**
  - the fixed bottom bar and the chat button cover the hero CTA and page content on every page (the fold images for home, heart-line, numerology, kundli, pricing and marriage);
  - on the marriage page the bar covers the disclaimer.
- **Contrast:**
  - muted text at 45% white is 4.47:1 (borderline);
  - "Sign in" in white on `#8B5CF6` is **4.23:1**, which fails AA for normal-size text;
  - gold on black is 11:1, which is fine.
- **Weight** (text research): HTML is 130–215 KB per page, including a 140–166 KB inline RSC payload, plus about 201 KB of compressed JS. That is medium-heavy for low-end Android.

### 7. Scorecard

| First impression | Clarity | Trust | Premium feel | Mobile UX | Conversion design |
|---|---|---|---|---|---|
| 8 | 6 (the free scan competes with the paid astrologer path) | 7 | 8 | 6 (fixed bars hide the CTA) | 7 |

---

## Site 2: palmreading.pro (global English/Japanese single-page reader, $3.99 unlock)

Pages captured:

| Page | Files |
|---|---|
| Home | `palmreading_pro__*` |
| Blog index | `palmreading_pro_blog__*` |
| Guide | `palmreading_pro_blog_palm_reading_lines__*` |
| "Tool-like" guide | `palmreading_pro_blog_marriage_line_age_calculation__*` |
| Japanese home | `palmreading_pro_ja__*` |

There are **no tool, pricing or reading pages**: they return 404 (text research).

### 1. Visual identity

**Mode: light, warm "antique paper".**
- Body `#FCFAF6`.
- Alternate sections are sand `#F5F1EA`.
- Borders are beige `#C4B5A2`.
- There is a light/dark/system theme toggle in the header and footer.

**Palette** (from `palmreading_pro__desktop__styles.json`, converted from lab):

| Role | Colour |
|---|---|
| Text | deep indigo `#1B1434` |
| Secondary text | `#5D5978` |
| Accent: gold | `#DDB049` (eyebrows, "guide →" links, the hand-drawn underline swash) |
| **CTA: royal purple** | `#50349C` with ivory text |
| Muted captions | `#9A8C7E` |

**Type.**
- **Cormorant Garamond** is used for the logo, the H1, the sample report and the line-card titles.
- **Inter** is used for body text *and* for the heavy H2s ("Ancient Palmistry, Reimagined with AI", "How Your AI Palm Reading Works").
- The mix is inconsistent: some H2s are Cormorant ("Palm Reading 101"), others are heavy sans.
- The H1 has a **gold hand-drawn underline** under "Seconds".

**Shape.**
- A pill announcement bar.
- Buttons have a 10 px radius, which is more "app" than "mystic".
- Cards have a 16–24 px radius.
- The sample card and the dropzone have soft **lavender-tinted shadows**.

**Imagery: vintage engraving / ink sketch.**
- A pencil muse illustration.
- A hand sketch with coloured line overlays, labelled "Plate I · The Map of Your Palm", with the user's real photo in a round inset.
- Blog thumbnails use one consistent line-art hand template with coral labels on beige.
- Icons are thin line icons in the Lucide style.

**Motion:** minimal. The sample card has a "Click to expand" modal. On desktop the hero has a faint moon-and-branches background drawing.

### 2. Home layout teardown (mobile first)

**Mobile fold** (`palmreading_pro__mobile__fold.png`):
- The logo and a **hamburger menu, with no CTA in the header**.
- The announcement pill "Free AI palm reading online is now live →".
- A centred Cormorant H1, "Free AI Palm Reading Online in ~~Seconds~~" (the last word gets the gold swash).
- A 4-line sub ending "no signup required".
- Then the **SAMPLE report card** fills the rest of the screen: the archetype "Counselor", "Water × Sloping Mind", the italic tagline "The one people tell the unfinished version of the story to", and "Plate I: The Map of Your Palm" with the photo inset.

**The upload box starts below the fold.** It sits roughly 1.5 screens down on mobile (`palmreading_pro__mobile__full.png`, sheet 1).

**Desktop fold** (`palmreading_pro__desktop__full.png`, top) is the right layout: the sample card on the left and the dropzone on the right, both above the fold, with "Free online preview · No signup · Secure photo storage" under them.

**Sections in order:**

| # | Section | What it shows | Verdict |
|---|---|---|---|
| 1 | Hero: sample card plus dropzone | Circle upload icon, "Drop your palm photo" in Cormorant, a purple "⤴ Upload Palm Photo" button, "JPG, PNG, or HEIC · up to 10 MB". | **The sample report is the single best hero device of the three sites.** It shows the output before asking for anything. |
| 2 | "Ancient Palmistry, Reimagined with AI" | 4 icon benefits: Instant, Tradition Meets AI, **Transparent Photo Handling**, Detailed Insights. | The privacy benefit honestly says the photo is "stored securely for service-quality review". |
| 3 | "How Your AI Palm Reading Works" | 4 centred numbered steps. The **price appears only inside step 3**: "Unlock the full report for $3.99". | Honest-ish, but the price is buried. |
| 4 | "Palm Features Our AI Looks For" | 6 bordered cells (a 3×2 grid on desktop). "Unclear details are marked uncertain, not invented". | A good honesty line. |
| 5 | "Palm Reading 101: The Lines That Matter" | 6 line cards with gold "Heart line guide →" links. | A clean hub that feeds the blog. |
| 6 | Bridge paragraph | Underlined links: beginner's guide, which hand, "read your palm free". | Good internal linking. |
| 7 | "Trusted by Online Palm Reading Users" | Big purple stats: **10,000+ / 8 / 30s / 4.8★**. | None has a source. "30s" contradicts the 60–90 s loader in the text research. |
| 8 | "AI Palm Reading Reviews" | 6 quote cards with full name, job and city (David Chen, Software Engineer, San Francisco…), sketched avatars, and "Best $3.99 I've spent this year". | These look fabricated and are a trust risk. |
| 9 | FAQ | 7 accordions. | Standard. |
| 10 | CTA band | "Start Your AI Palm Reading Preview", "Free preview, no signup", and a purple button. | Fine. |
| 11 | Footer | Product and Company links, the theme toggle, 日本語, Privacy and Terms, X, email. | Minimal. |

**Sticky elements:** none on mobile. There is no sticky CTA, even though the header hides the "Read My Palm" button behind the hamburger.

**Japanese home** (`palmreading_pro_ja__mobile__fold.png`) is fully localized, **including the sample card** ("カウンセラー", "あなたの手相図"). However, Cormorant renders the Latin digits inside Japanese as old-style figures ("写真1枚で30秒"), which looks broken. The lesson for our Hindi pages: pick a **Devanagari-capable display pair** and check how the digits look.

### 3. Reading / upload UX (text research plus the visible hero)

- **Input:** a click or drag-and-drop file picker with no `capture` attribute, no camera screen, no hand outline and no quality check. Photo tips live **only in blog posts**.
- **Step 2 of 3, "Ready when you are.":** the photo preview with "Read My Palm" and "Different Photo". This is a commitment step.
- **Region prepaid gate:** in some regions the button reads "Pay {price} & Read My Palm", with no preview. This is a hidden surprise.
- **Loading theatre:** 6 scripted steps ("Identifying the major lines…" → "Composing your personalized reading…"), "usually 60–90 seconds".
- **Result:** "Your Free Preview is Ready". It shows the archetype, the Love chapter and **half of Career, cut mid-chapter on purpose**.
- **Paywall:**
  - "We found {found} readable palm markers. Your preview revealed {shown}.";
  - a value stack;
  - a struck-through price anchor (~~$25–50~~ in person) against **$3.99**;
  - locked chapter teasers;
  - "Your preview ends here, the reading doesn't.";
  - Stripe checkout.
- **After payment:** a magic link and an email copy; a public share page at `/r/{slug}`; a square "identity card" for sharing.

### 4. Guide template

The guide template (`palmreading_pro_blog_palm_reading_lines__desktop__fold.png` and the mobile full pages):

**Desktop** is 3 columns:
- a **sticky "On this page" table of contents** on the left, with nested H3s;
- the article in the centre, about 590 px wide;
- on the right, an **empty "PalmReading.pro" box**, a leftover placeholder that looks broken.

**Mobile** has no table of contents: breadcrumb, then a bold Inter H1, then the date, then the article.

**Content blocks:**
- one line-art diagram per major section, in a consistent style;
- a comparison **table** ("Line / Where it sits / What it traditionally reveals"). With 3 wrapped columns at 390 px it is cramped;
- bullet lists with bold lead-ins;
- "Myth vs. Reality";
- the FAQ as bold question plus answer text (no accordion);
- "Sources & Further Reading" (Britannica, Wikipedia);
- a "Keep exploring" paragraph with sibling links.

**CTA placement:** there are **no CTA buttons in articles**, only inline text links ("free AI palm reading") in the intro and in a closing H2, "Let AI Place Your Line on the Timeline".

**"Tool-shaped" demand page:**
- `palmreading_pro_blog_marriage_line_age_calculation__mobile__full.png` teaches a calculation with an "Age Ranges by Position" table and never offers an interactive calculator. That gap is ours to fill.
- It does have excellent honest framing: "Why the Calculation Reads 'Tendency,' Not Dates" and "No crease can know your wedding date".

**Blog index** (`palmreading_pro_blog__mobile__full.png`):
- a card grid with consistent line-art thumbnails, title, 3-line excerpt, date and domain;
- attractive and coherent;
- on mobile the intro text has **no side padding** and touches the screen edges.

### 5. Psychology used

- **Trust:**
  - "No signup" repeated 4 or more times;
  - a real sample before the upload;
  - "A reflection, not a forecast";
  - "unclear details are marked uncertain, not invented";
  - sources cited in the blog.
- **Social proof:** unsourced stats, and reviews with invented-looking full names, jobs and cities. This is the weakest part.
- **Urgency / FOMO:** "is now live" in the announcement bar, and the preview cut mid-chapter (loss aversion).
- **Fear handling:**
  - price: a low $3.99 against a struck-through $25–50 anchor;
  - "One-time payment · Secure Stripe checkout";
  - privacy: clear, but it admits the photo is stored.
- **Curiosity:**
  - Barnum-style second-person copy in the sample ("You clear your workspace for exactly ten minutes before…");
  - the archetype name;
  - "{found} markers found, {shown} revealed".

### 6. Mobile quality

- **Text:** 16–18 px, readable.
- **Tap targets:** the purple button is about 40 px tall, which is OK.
- **No CTA in the mobile header, and the upload is below the fold.**
- **Contrast failures:**
  - the gold "guide →" links (`#DDB049` on `#FCFAF6`) are **1.94:1**;
  - the muted captions (`#9A8C7E`) are **3.13:1**.
- **Layout:** tables wrap badly at 390 px, and the blog index has no gutter.
- **Weight** (text research): about 372 KB of compressed JS in 21 Next.js chunks for a landing page. The OG image is a 910 KB leftover from the ShipAny boilerplate.

### 7. Scorecard

| First impression | Clarity | Trust | Premium feel | Mobile UX | Conversion design |
|---|---|---|---|---|---|
| 8 | 8 (one action only) | 6 (fake-looking proof) | 8 | 6 | 8 |

---

## Site 3: palmly.ai (dark-violet "AI reader Vera", $7.99 unlock). Wayback homepage only

Files:
- `web_archive_org_web_20260730034905if_https_palmly_ai__{mobile,desktop}__fold.png`
- `palmly_archive_home__{mobile,desktop}__full.png`
- `…__desktop__styles.json`

The live site is currently down: its certificate expired, and /blog and /agents return 500 errors.

### 1. Visual identity

**Mode: dark, deep violet.**
- Body `#160F30`.
- An "atmosphere" layer with purple glow and scattered stars.
- **Glass cards**: `rgba(255,255,255,0.06)` with a 1 px border and a radius of about 24 px.

**Palette:**

| Role | Colour |
|---|---|
| Text | `#ECE6F6` |
| Muted text | `#A19AAB` and `#8A80A6` |
| Gold eyebrow ("FREE PALM PREVIEW") | `#FCD98B` |
| CTA | gradient `#F0D690 → #E9C77B`, dark text `#1A132F`, pill shape |
| Lavender icon accents | `#846BA3` |

**Type.**
- A heavy serif H1 ("Free AI Palm Reading Online"). The styles file reports `ui-serif`, so the archived page may be showing a fallback font.
- Inter at a **light (300) weight** for the subline and the card text. It looks elegant, but it is thin on small screens.
- A second H1 in light sans: "One palm photo, a clearer self-reflection."

**Imagery.** The strongest "wow" art of the three sites: a **glowing neon hand made of zodiac glyphs, stars and "LINE OF LIFE" lettering**, in a black panel. Four glass feature cards are overlaid in its corners (Love style, Career signal, Personality, Near future), each tied to a palm feature.

**Icons:** thin line icons in circular chips.

**Motion:**
- a testimonial marquee;
- glows;
- **big ghost numerals "1 2 3"** behind the step cards, in a zig-zag layout on desktop;
- a hatched "locked" placeholder panel.

### 2. Home layout teardown (mobile first)

**Mobile fold** (`…palmly_ai__mobile__fold.png`):
- the logo, "English" and a hamburger (**no CTA**);
- a 2-line serif H1;
- a **6-line thin grey subline** that is keyword-stuffed ("This AI palm reading helps you…");
- the hero art panel, which rendered as an almost black box in the archive;
- the "FREE PALM PREVIEW · Free" upload card starts at the very bottom.

**The upload action is below the fold.**

**Desktop fold** (`…palmly_ai__desktop__fold.png`) is **the best desktop hero of the three sites**:
- the H1 and sub;
- one large rounded panel split in two: the glowing palm with 3 photo-requirement chips ("◉ OPEN PALM ◉ GOOD LIGHT ◉ FULL HAND") and the 4 feature cards on the left;
- the upload flow on the right: the dropzone with "we read it once and never store it", a **"What would you like to know?" question box** ("Vera reads what matters to you"), a gold **"Read my palm"** button (dimmed until a photo is added) and "🔒 Secure processing · Your photo is processed and not stored";
- the trust pill "Photos processed instantly, never stored | For entertainment only | 18+" just below.

**Sections** (`palmly_archive_home__mobile__full.png`, `__desktop__full.png`):

| # | Section | Verdict |
|---|---|---|
| 1 | Hero panel plus upload card (above) | The photo chips are the smartest micro-guidance on any site. The question box personalises the reading from the first step. |
| 2 | "Three steps to your reading": ghost numerals plus glass cards | Nice depth. The copy is weak ("A professional palm reading agent interprets…"). |
| 3 | "✧ A GLIMPSE": sample archetype "The Visionary Hand", 2 sentences of teaser copy, "🔒 Unlock to read your full reading →", and a hatched locked panel "[ unlock the answers in your palm ]" | A good curiosity device, but no real palm and no line trace is shown. |
| 4 | "A reading that talks back": a 3-card bento (Ask follow-up questions, Personal to your palm photo, Palm, tarot & stars) | It sells the retention loop (chat). |
| 5 | "Over **120,000** readings and counting" (number in gold) plus a testimonial marquee | Each testimonial is **labelled "ILLUSTRATIVE"**. That is honest, but it makes the social proof fall flat. |
| 6 | "Frequently asked": 5 accordions in one glass card | Standard. |
| 7 | Footer: Company, Legal, "For entertainment purposes only" | Thin. There is no Tools or Learn column. |

### 3. Reading / upload UX (text research)

1. **Workspace.** `/palm-reading` is a "workspace" with a **Vera side rail** of suggested questions. "Step 1 · Your palm — Show Vera your hand" offers drag-and-drop, browse, or **"Use webcam / Capture palm"**. Only JPG/PNG under 5 MB is accepted. The tips are even lighting, full palm in frame, and hold steady.
2. **Processing ritual.** "Vera is reading your palm…", with the lines "tracing your life line…", "Following your heart line…" and "Aligning what we find with the stars…", ending with "the lines are worth reading slowly."
3. **Free teaser:**
   - the archetype;
   - "Element";
   - "Detected Features";
   - **colour-coded line labels** (heart = rose). These are labels only, with **no overlay on the photo**;
   - "The Initial Reading".
4. **4 locked cards**, each with a real one-line hook and "🔒 Unlock to read in full". One uses fear: "a single island warns of one season of depletion".
5. **Paywall.** "Your complete reading… yours to keep, forever": **$7.99 next to a struck-through $19.99**, an in-page card form, "Secure · Instant access · For entertainment only".
6. **After payment.** A letter-style report, a share card, and paid follow-up chat with "Stardust" credits.

### 4. Tool and guide templates (text research only, no screenshots possible)

- The `/agents/:slug` CMS tool landing page has these parts: tool UI (file, link and text tabs), How to use, Features, Use cases, FAQ, and More tools.
- The blog template exists in the code, but no posts are indexed and the page returned a 500 error.

### 5. Psychology used

- **Trust:** "never stored" said 3 times at the moment of upload; "18+"; "For entertainment only".
  - It is undermined by the expired certificate (a full-page browser warning), 500 errors, testimonials labelled "Illustrative", and a grammar slip in the FAQ.
- **Social proof:** "Over 120,000 readings" has no source.
- **Urgency:** the struck-through price anchor ($19.99 → $7.99).
- **Fear handling:** privacy is covered. The price is **not shown anywhere on the homepage**.
- **Curiosity:** the archetype name, a teaser cut off with "…", the hatched locked panel, locked hooks, and "Aligning what we find with the stars".

### 6. Mobile quality

- The upload is below the fold and there is no CTA in the header.
- The **300-weight 13–15 px grey text** on violet is elegant, but it is hard to read outdoors on a budget phone. Measured contrast is fine (6.75:1); the thin strokes are the problem.
- The dimmed "Read my palm" button reads as disabled or broken before the user has added a photo.
- **Weight** (text research): 62 KB of HTML, but a 283 KB translation bundle for all languages and about 635 KB of uncompressed JS load on every page.
- **Reliability** is the worst of the three sites: it is down right now.

### 7. Scorecard

| First impression | Clarity | Trust | Premium feel | Mobile UX | Conversion design |
|---|---|---|---|---|---|
| 8 on desktop, 6 on mobile | 7 | 4 | 8 | 5 | 7 |

---

## Combined scorecard

| Site | First impression | Clarity | Trust | Premium | Mobile UX | Conversion |
|---|---|---|---|---|---|---|
| palmist.io | 8 | 6 | 7 | 8 | 6 | 7 |
| palmreading.pro | 8 | 8 | 6 | 8 | 6 | 8 |
| palmly.ai (archive) | 8 / 6 | 7 | 4 | 8 | 5 | 7 |

**What all three get wrong on mobile:** none of them shows the upload button in the first mobile screen. palmist hides it behind a fixed tab bar. palmreading.pro and palmly push it below a sample or art card, and neither puts a CTA in its mobile header.

**What none of them does:**
- show a line trace on a *real* palm photo in the hero;
- explain *any* line in Hindi on the page;
- link to the Play Store.

Those three gaps are our opening.

---

## WOW: what we should import (adapted, never copied). Ranked by impact

1. **"Live sample on a real palm" hero (our signature).**
   - Combine palmreading.pro's sample report card (`palmreading_pro__mobile__fold.png`) with palmist's tap-a-line diagram (`palmist_io__mobile__full.png`, sheet 1).
   - Ours shows a **real palm photo** whose heart, head, life and fate lines draw themselves in as an SVG stroke animation, played once and short.
   - Each line gets a Hindi and English label (हृदय रेखा / Heart line). Tapping a line opens a 2-line meaning and "Read *my* palm".
   - No competitor traces real lines on a real photo on its website, so this makes our USP visible in 3 seconds.
2. **Upload card fully inside the first mobile screen.**
   - Structure: a 1–2-line H1, a 1-line sub, then the upload card.
   - One gold button, "📷 हथेली की फोटो लें / Take palm photo", using `capture="environment"` with a gallery fallback.
   - palmly's 3 requirement chips ("खुली हथेली · अच्छी रोशनी · पूरा हाथ").
   - A privacy line inside the card.
   - Keep the mobile header slim (logo, language, a small CTA). No bottom tab bar or chat button over the fold.
3. **Photo guidance at the moment of upload, not below it.** Two tiny thumbnails, a ✓ good photo and a ✗ blurry or angled one, plus a check for blur and light in the browser before sending. palmist puts its tips 2 screens down, and palmreading.pro only in the blog. The app already has this capture-guidance knowledge.
4. **"What do you want to know?" chips on the upload card**: शादी / करियर / पैसा / सेहत / प्यार. This adapts palmly's "Vera reads what matters to you" question box as one-tap chips, and it fits the owner's rule to answer life questions first. The result opens on the chosen question.
5. **Locked-teaser cards with real one-line hooks** (palmly, text research) and palmreading.pro's "{found} markers found, {shown} shown".
   - We use them to hand off to the Play Store, not to a web paywall: "Full reading free in the app →" with the Play badge and the real rating.
   - Every hook must be honest and non-fearful: no health or "depletion" hooks.
6. **Shareable archetype / identity card** (palmreading.pro "Keep this: Your archetype, in one card"; palmly share card).
   - Make it a 1080×1350 Hindi-first WhatsApp card showing the user's traced palm thumbnail, one line about their nature, and "A reflection, not a forecast".
   - WhatsApp is the Indian growth channel.
7. **Interactive "learn the lines" hand as the guide-hub hero and in every guide.**
   - palmist's chips plus diagram, with deep links. We add the Hindi names and link each line to its guide *and* to the matching free tool.
   - Keep one line-colour system across the app, the site and the diagrams. palmist's heart rose, head violet, life teal and fate amber are a good reference; use our app's own colours if they differ.
8. **One illustration system for 12 tools and the blog.**
   - palmreading.pro's single line-art hand template (`palmreading_pro_blog__mobile__full.png`) makes 11 posts look like one publication.
   - We do the same, with our line colours, on a warm paper background. Every thumbnail is recognisably "ours".
9. **Guide template, combining the best parts:**
   - from palmist: breadcrumb, eyebrow, H1, the diagram card, and a **Quick Facts card** (Sanskrit/Hindi name, where it is, what it governs, which hand);
   - from palmreading.pro: a **sticky "इस पेज पर / On this page" TOC** on desktop, and a collapsible TOC chip on mobile;
   - variation cards;
   - an honest "Myth vs. reality" card;
   - an FAQ accordion;
   - **one mid-article CTA card** plus the end CTA card ("What does *your* heart line say?");
   - a prev/next learning path.
   - On mobile, show tables as stacked cards.
10. **Tool template (palmist numerology/kundli pattern):**
    - a centred icon, a short H1 and a one-line "free, no login";
    - a form card with labels above the fields, native date pickers, and helpers such as "I don't know my birth time (noon used)";
    - a privacy note under the button;
    - the result appears in place;
    - then "Check this on your own palm" (upload CTA), an explainer, the FAQ, and related tools.
    - Build the marriage-line age tool that palmreading.pro only describes in text, with the "tendency, not a date" note.
11. **Honesty as a design element.**
    - Use a calm, distinct card style (not small print) for "What palmistry can and can't tell you".
    - Sources: palmist's "structured mirror", palmreading.pro's "unclear details are marked uncertain, not invented" and "tendency, not dates", and the footer line "A reflection, not a forecast".
    - This is how an India-first brand beats "exact dates" sellers on trust.
12. **Two-tone serif headline with one gold keyword** (palmist), plus an optional hand-drawn gold underline (palmreading.pro). It is a cheap, instantly premium touch.
    - Pair a Latin display serif with a **matching Devanagari serif** (for example Tiro Devanagari Hindi or Noto Serif Devanagari) and test digits in mixed-script text. palmreading.pro's Japanese page shows how this goes wrong.
13. **Theme split:**
    - a dark "night sky" hero and brand areas (palmist and palmly glow and stars);
    - a **light "paper" reading mode** for guides and the blog (palmreading.pro).
    - Long Hindi text reads far better dark-on-light. Offer a toggle only if it costs nothing.
14. **Loading theatre that is true.** Show the *actual* stages (photo check → lines found → reading written) on the user's own photo as the lines appear. palmist, palmreading.pro and palmly all use scripted text.
15. **Transparent rupee pricing, if we sell anything** (palmist pricing page): ₹ amounts, "no subscription, no auto-charge", UPI first, and a clear free-versus-app split. Never reveal the price only after the scan (palmreading.pro's region gate).
16. **Proof strip that uses only real numbers**: the live Play Store rating and install band, and the number of readings from our own database. Keep palmreading.pro's big-number layout but with a source line.
17. **Small delights:**
    - ghost step numerals "१ २ ३" (palmly);
    - a line-chip row with coloured dots (palmist);
    - a sticky slim bottom CTA on long pages that hides while the upload card is on screen.

## Never do

- **Never hide the primary upload action on mobile**: not below a sample or art card (palmreading.pro, palmly) and not under fixed tab bars or chat buttons (palmist, `palmist_io__mobile__fold.png`).
- Never put two primary CTAs in the hero, or lead with the paid path ("Ask an astrologer →" above "Read my palm" on palmist).
- Never use unsourced stats or invented testimonials with names, jobs and cities (palmreading.pro). Never use "Illustrative" quotes as social proof (palmly). Never show AI personas as real humans with ratings (palmist).
- Never contradict the honesty copy with fate or date promises: "Your future is written in your palm", "marriage windows with exact dates", fear hooks about health or "depletion".
- Never claim a speed you don't deliver ("30 seconds" against a 60–90 s loader).
- Never ship low-contrast text: gold links on ivory at 1.94:1, muted beige at 3.13:1, white on violet at 4.23:1, or 300-weight grey body text on dark.
- Never put Wallet or money in the main navigation of a trust-first product.
- Never leave boilerplate leftovers: a template OG image, an empty sidebar box, or an indexable sign-in page.
- Never let a certificate expire or a server error take the site down (palmly). Monitor uptime and certificate renewal.
- Never use 3-column tables at 390 px, full-width text without a gutter, or a font pair that breaks non-Latin digits.
- Never ship heavy JS on content pages (palmist ~201 KB, palmreading.pro ~372 KB compressed, palmly's 283 KB all-language bundle). Budget-Android users in India feel every KB.
- Never hide the price until after the upload, or switch to prepaid for some regions without warning.
