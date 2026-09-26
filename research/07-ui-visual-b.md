# 07-B — Visual UI/UX teardown: PalmMitra and PANDIT AI

Observed on 2026-09-26 in local Chrome (Playwright, headless). Views were a 390 px Android phone at 1x and 2x, and a 1440 px desktop.

The research was read-only. Nothing was uploaded, signed up for, submitted, chatted with or paid. The only clicks opened menus, the sample-report modal and the download modal.

For text, pricing and SEO facts, read `02-palmmitra-in.md` and `04-pandit-ai.md`. This file covers only **what the pages look like and how they feel to use**.

**Evidence.** All paths below are relative to `research/screens/`:

- **`<site>/<page>__mobile__fold.png`**, **`__desktop__fold.png`**, **`__full.png`** and **`__desktop__styles.json`**: captures from `shot.mjs`.
- **`<site>/scroll/*_NN.png`**: one phone screen per image, taken while stepping down the page. `shot.mjs` could not take full-page shots of PalmMitra home or the PANDIT palm, topic and question pages, so these frames replace them.
  - PalmMitra home: `pm_home_m_01…24` (mobile) and `pm_home_d_01…18` (desktop).
  - PANDIT: `pa_home_m`, `pa_palm_m`, `pa_topic_m`, `pa_q_m`, `pa_calc_m` and `pa_report_m`.
  - In the PANDIT content captures, fixed overlays (toast, bottom nav, header) were hidden after frame 01 so the content could be read.
- **`<site>/state_*.png`**: an open menu, the sample-report modal, or the desktop QR download modal.
- **Mobile-quality numbers** (tap targets, font sizes, overflow, animations, bytes) come from a separate probe script.
  - Byte counts are **lower bounds**, summed from `content-length` headers.
  - Load times were measured on the owner's broadband connection, not on 4G.

---

# PART 1 — PalmMitra (palmmitra.in)

## 1. Visual identity

- **Palette.** Hex values are from `www_palmmitra_in__desktop__styles.json`.
  - Page background: **#0B0920**, a near-black indigo.
  - Raised surfaces: **#221F47**. Glass cards use `linear-gradient(135deg, #0B0920 95%→80%)`.
  - Primary text: **#F6F4EE**, a warm off-white. Secondary text: **#B8AC94**, a warm parchment grey.
  - Brand accent: **gold #F0B428 → #F6C655**, used as a gradient on every primary CTA, and gold tints at 5–20% alpha on chips.
  - Success: **#10B981**, on the FREE pills.
  - PalmMatch has its own **pink/rose gradient**, used on its CTA and the "Hero Product" pill; the exact hex was not in the extract.
  - The hero glow is a plum-purple radial behind the art.
- **Light or dark.** Dark by default (`<html class="dark">`). The mobile menu has a "Light mode" toggle, and a sun icon sits in the desktop header.
- **Fonts.**
  - Headings are **Playfair Display**, a high-contrast serif. The H1 is 68 px on desktop and 34 px on mobile; H2s are 48 px on desktop and about 28 px on mobile.
  - Body text is **Inter**, at 14–16 px.
  - Key words in headings are set in gold ("Rooted in **Ancient**", "Upload Your **Dominant Hand**").
- **Type-scale feel.** Editorial and luxurious: a big serif display face against a small sans. On mobile the micro-copy gets very small; 54 text elements are ≤11 px on the home page.
- **Spacing density.** Airy. Sections have 80–120 px of vertical padding, and cards 24–32 px of inner padding. The home page is about **15,900 px tall on mobile**, roughly 19 thumb-scrolls.
- **Corner radius.**
  - `9999px` pills are everywhere (158 instances).
  - Inputs and small buttons use 12 px; primary CTAs and cards use 16 px; large panels use 24 px.
- **Shadows and glow.** Every card has a soft gold glow, `0 8px 32px rgba(240,180,40,.08)`, plus a 1 px gold inset top highlight: a "lit from above" glass look. Primary CTAs glow gold. There is no heavy drop shadow.
- **Imagery.**
  - The hero shows **one 3D render of a gold iPhone** with floating result cards ("Heart Line · Deep Emotions", "Your Career Line is Strong → 2026 Growth Ahead"). The render sits inside a slowly rotating dotted orbit ring.
  - Everything else is line-art: a gold outline palm with glowing lines (the explorer), a mandala/sacred-geometry motif faintly in section backgrounds, and small ornament dividers (◆, ✦, concentric circles).
  - The only photos are the testimonial avatars.
  - Evidence: `www_palmmitra_in__desktop__fold.png`, `scroll/pm_home_m_06.png`.
- **Iconography.** Lucide line icons in gold, inside 40–48 px rounded-square tiles with a dark tint. The style is consistent throughout.
- **Indian cultural cues.**
  - Every section eyebrow is **ॐ + a Sanskrit word in Latin italics** ("ॐ Margadarshan", "ॐ Gyan Shakti", "ॐ Drishtant", "ॐ Sampatti Yoga", "ॐ Kaal Chakra").
  - There is a **Diwali "Festive Season" banner with one Hinglish line** ("Is Diwali, jaaniye aap dono ki hast rekhayein kya kehti hain…").
  - Other cues: a ₹ INR selector in the header, "less than a chai and samosa", and "Made with love in India".
  - **No Devanagari text** appears anywhere except ॐ. The Indian-ness is decoration, not language.
  - Evidence: `scroll/pm_home_m_03.png`, `pm_home_d_02.png`.
- **Motion** (32 running animations on the home page, 14 of them infinite). What can be inferred from the page:
  - The orbit ring rotates.
  - A benefit marquee strip scrolls sideways.
  - The live dot in the hero pill pulses.
  - The primary CTAs glow.
  - A countdown ticks every second.
  - The testimonial carousel auto-advances.
  - **framer-motion scroll-reveal** fades each block in as it enters the viewport.
  - Side-effect of the scroll-reveal: when content never enters the viewport, it stays invisible. Full-page captures show **big blank gaps** where blocks never revealed. Evidence: `www_palmmitra_in_guides_marriage_lines_palm_meaning__mobile__full.png` and `www_palmmitra_in_upload__mobile__full.png`. If the reveal observer fails, users see empty space.

## 2. Home page layout, mobile first

**Persistent chrome.**
- Header, 70 px: logo, a **₹ INR currency dropdown** (102×44, taking prime space) and a hamburger.
- **Sticky bottom CTA, 102 px:** a gold "Analyze My Palm — Free →" button with a proof line underneath: "100% Private · 4.9 Rating · Free Preview".
- Together they cover about **20% of the viewport**, which is acceptable.

**Menu** (`state_mobile_menu.png`): the menu drops down as a glass card. A gold "Scan My Palm — Free" button sits on top, followed by 7 anchor links and a Light mode toggle. It is clean, with about 58 px rows.

The home sections, in order:

1. **Hero** (`www_palmmitra_in__mobile__fold.png`).
   - Top to bottom: the phone render (it takes about 35% of the fold and is small, so the result cards in it are unreadable on a phone) → proof pill "● 12,400+ readings · 4.9★ from 2,100 reviews" → a 3-line serif H1 with the middle line in gold → a 3-line sub-head → **an upload dropzone card inside the hero** (camera icon in a dashed gold ring, "Snap your palm / Free reading begins instantly", an "Upload" pill, "🔒 Private · never shared", file types) → a full-width gold CTA "✦ Get My Free Palm Reading →" (56 px) → a ghost "👁 View Sample Report".
   - **Mobile above the fold** shows the art, proof, H1, sub-head, dropzone and CTA. The value, the proof and the action all fit in one screen. This is the strongest part of the site.
   - **Desktop** (`www_palmmitra_in__desktop__fold.png`) uses two columns: copy, dropzone and CTAs on the left, the phone with its orbit on the right. The trust-strip label peeks in at the bottom of the fold.
2. **Micro-proof row** (`pm_home_m_02`): "⚡ Results in 2 min · 🛡 100% private · ★ Free preview", then a tiny grey line: "No sign-up or card needed · Free preview · Full report ₹299". **Putting the price inside the first scroll is good honesty.**
3. **Trust wall**, "Why 12,000+ people trust PalmMitra": 7 centred icon chips, stacked vertically on mobile (it looks like a list) and as 2 rows of pills on desktop. It is dense and repetitive, since the same stats appear 4 times on the page.
4. **Diwali banner**: a gold-bordered glass card with a gold "✦ FESTIVE SEASON" eyebrow, a serif headline, the Hinglish line and a gold text link. It feels timely and human.
5. **Benefit marquee**: a horizontally scrolling strip ("3 free AI questions with your reading · English & Hinglish…"). Easy to ignore, but it gives the page movement.
6. **How it works**, "From Photo to Destiny in 3 Steps" (`pm_home_m_03/04`).
   - Three big cards. Each has a large serif numeral (01/02/03), a **time badge** ("< 30 sec", "~90 sec", "Instant"), an icon tile, a title and one paragraph.
   - After the cards: 4 check-pills ("No account needed to start"…) and a CTA.
   - The **time badges are an excellent device**: they turn the process into a visible, short journey.
7. **"Tap a line, see what it reveals"** (`pm_home_m_06`).
   - An illustrated gold palm in a glowing frame; the selected line (heart) is lit in bright gold.
   - Below it, 6 pill chips (Heart / Head / Life / Fate / Sun / Mounts, each 44 px) and a text card that explains the chosen line in 2–3 sentences.
   - Then an honest "What is palm reading?" paragraph ("tradition, not a science… no line predicts lifespan or illness").
   - **This is the most "wow" and most learnable interaction on the page**, but it uses a generic drawing, not the user's own palm.
8. **PalmMatch teaser**: a small glass card that links to the couples product.
9. **"Five Truths Written In Your Palm"** (`pm_home_m_08/09`): five outcome cards, each with a colour-coded category eyebrow (Career & Wealth in gold, Love & Marriage in pink, Money in teal, 5-Year Timeline in amber, Spiritual in gold) and a "Most sought after" badge. The copy promises "exact years" and a "5-Year Timeline". It is visually rich, and the copy is risky.
10. **Sample report**, "This Is What Your Report Reveals" (`pm_home_m_10/11/12`).
    - A **gold-to-purple gradient header card** shows stats (2,000+ words · 15 markers · 5 life sections · ★ 4.9).
    - Section cards follow. "Life Line Analysis" and "Heart Line Meaning" carry green **FREE** pills and readable text; "Fate Line Direction" carries a gold **PREMIUM** pill with 🔒 and **blurred text**.
    - Then the gold CTA "Unlock My Full Reading" and the line "2 sections free · Full 2,000-word report unlocked at ₹299".
    - **Classic curiosity-gap paywall preview, executed well.**
11. **Comparison**, "Not All Readings Are Created Equal" (`pm_home_m_13`): a feature grid with ✗ in grey tiles and ✓ in gold tiles. On mobile it collapses to 2 columns and notes "Full 3-way comparison on desktop". The price row reads Free / "From ₹0".
12. **About** (`pm_home_m_14/15`): long paragraphs, 3 icon cards (AI-Powered / 100% Private / Ancient Wisdom) and "Learn More About Us".
13. **Testimonials**, "Real People. Real Revelations." (`pm_home_m_16`).
    - Two stat tiles (4.9 Average Rating, 2,100+ Verified Reviews), then a one-card carousel.
    - Each card has a headline chip ("Relationship prediction came true"), 5 stars, a quote, an avatar photo, a name with a green "✓ Verified", a job and city, the plan ("Monthly Plan", a plan that does not exist) and a date ("Feb 2025").
    - Footer line: "All reviews from verified purchases".
14. **FAQ**, "Your Questions, Honestly Answered" (`pm_home_m_17/18`): a boxed accordion of 12 items with serif questions. It is readable, and the rows are about 60 px tall.
15. **Pricing**, "ॐ Sampatti Yoga — Start Free. Unlock Everything." (`pm_home_m_19–22`, `pm_home_d_15`).
    - A badge "● 120+ readings completed this week" and a 4-line stat list.
    - **Four stacked cards:** Free ₹0 → **Insight ₹299** ("Most Popular", gold border and glow) → **PalmMatch ₹999** (pink "Hero Product") → **Elite ₹4,999** ("Most Premium").
    - Each card has a big serif price, "one-time · Pay once. Yours forever.", a checklist, a CTA and "Money-back guarantee — full refund if unhappy".
    - Then "🔒 Secure payments via Razorpay · UPI, Cards, Wallets accepted".
    - The price typography is lovely. On desktop the 4 cards sit side by side and the ₹299 card is visually the default choice.
16. **Final CTA**, "Your Destiny Won't Wait — Neither Should You" (`pm_home_m_23`): a purple gradient panel with "Join 12,400+ Indians…" and a **₹50 OFFER EXPIRES IN 23:59:28** countdown in three gold digit boxes, then the CTA. The deadline is a fake one that resets.
17. **Footer** (`pm_home_m_24`): the logo and ॐ tagline, Instagram and X, then 3 link groups (Company / Legal / Support) as one long single column with 56 px rows, and a boxed disclaimer. **There is no link to any guide except "Palmistry Guides".**

**Why the home page works:** there is one job (scan a palm), the tool sits in the hero, the gold CTA repeats in the same shape and colour, the "free vs ₹299" split is visible early, and the paywall preview makes the product feel real.

**Why it doesn't fully work:** it is 19 screens long and says the same thing 4 times (the stats appear in the hero pill, trust wall, testimonials and pricing). The phone art is too small to read. Its dated-prediction claims and fake urgency undercut the honest copy in the explorer and the FAQ.

## 3. Reading and upload UX (`/upload`, `/palmmatch`)

- **Entry** (`www_palmmitra_in_upload__mobile__fold.png`).
  - A gold pill "✦ Free scan · No payment needed to start", then a serif H1 "Upload Your **Dominant Hand**" and a sub-head claiming "150+ palm markers" (the home page says 15).
  - A **3-step stepper**: Upload Palm → Your Details → Get Reading. It shows gold numbered circles, with the active step ringed in gold.
- **Step 1 · Capture.**
  - A dashed gold-bordered card with a "✦ STEP 1 · CAPTURE" pill, a palm/hamsa icon in a progress-style ring, and "Photograph Your Dominant Hand".
  - A one-line rule: "Right hand if right-handed · Left if left-handed".
  - **3 tip mini-cards**: Open palm / Good light / Stay close.
  - On mobile a **sticky gold "📷 Take / choose photo" bar** sits at the bottom. The secondary button is "Upload from Gallery", followed by "Private · Instant AI verify · JPG·PNG·WEBP".
  - A 2×2 reassurance grid: "Photo used only for analysis", "Report ready in under 2 min", "AI-powered palm analysis", "Rated 4.9 by 12,400+ users".
- **Step 2 · "About You"** (`sl` full-page slices 01–02). It shows "30 SECONDS" and "🔒 PRIVATE" badges and 4 fields:
  - Name.
  - Age, with the helper "Anchors your life timeline (13–100)".
  - **Email (required)**, with the helper "Secure report link sent here. Never shared".
  - Report Language, with **Hinglish as the default**.

  The form is visible before the photo is taken, which makes the flow feel short. It is still **4 fields plus an email wall before any value**, despite "No sign-up" on the home page.
- **"What You'll Unlock" panel** (desktop, `www_palmmitra_in_upload__desktop__fold.png`).
  - A right-hand card lists 7 report sections: "Personality Profile" is **FREE** and the other 6 are **🔒 PREMIUM**, including "Health & Vitality" and "Future Predictions".
  - On mobile this panel sits below the form and animates in on scroll; in the full-page capture it never appeared.
  - Showing the free/paid split *before* upload is honest and sets expectations. Locking "health" is not.
- **Loading theatre and result reveal** (not run; from the sample modal and the text research). `state_mobile_sample_modal_1/2.png` shows the report design:
  - A header "SAMPLE PREVIEW · Your Destiny **Report**" with a close button.
  - A **hero quote card** with gold corner brackets: *"Your strongest growth cycle begins mid-2026 and peaks in 2028."*, labelled "AI DESTINY ANALYSIS".
  - Section cards with a gold left rule, an icon tile, a title, an eyebrow in gold capitals ("VITALITY · RESILIENCE") and a FREE or PREMIUM pill. Premium bodies are blurred.
  - The report *looks* premium. The headline promise is a dated prediction.
- **Price and payment:** ₹299 is shown on the home page, the upload micro-copy and the pricing cards. Razorpay, UPI, cards and wallets are named in text, but **no UPI or app logos (GPay, PhonePe) appear**, so the "UPI is accepted" signal is weak.
- **PalmMatch** (`sl … palmmatch full_01/02`).
  - The Diwali banner sits on top.
  - Then a **sample compatibility card, "Priya & Arjun · 87%"**: a big serif percentage and 4 coloured progress bars (Emotional Bond 91% pink, Communication 84% blue, Shared Goals 89% gold, Spiritual Alignment 78% violet), plus "Long-term potential: Strong".
  - Then the upload tile with **camera-viewfinder corner brackets** ("Tap to upload palm photo · Gallery · Camera") and the fields.
  - The disabled CTA "Continue — add their palm" is dimmed until the form is valid.
  - A trust row reads "Images encrypted · Deleted after analysis · AI compares both palms · Ready in under 3 min", followed by a 4-question FAQ.
  - The sample card is the most **shareable-looking visual** on either site.

## 4. Tool, topic and guide templates

- **Tools:** none exist. The only interactive element is the home-page line explorer.
- **Guides hub** (`sl … guides full_01`): an ॐ eyebrow, the serif H1 "Palmistry **Guides**", filter chips (All / Fundamentals / Life Line / Marriage & Relationships / Wealth & Career), then large cards (category pill + ⏱ read time, a 3-line serif title, a 3-line excerpt, "Read the guide →"). **No images or diagrams appear on any card.**
- **Guide article** (`…marriage_lines… full_01–03`, `__mobile__fold`):
  - Breadcrumb → category pill + read time → a 3-line serif H1 → a 2-paragraph answer-first intro.
  - A **boxed "IN THIS GUIDE" TOC** with gold numerals.
  - Each H2 is a serif heading followed by body text in 16 px parchment-on-indigo. A gold-bordered **pull-quote card** carries the key takeaway.
  - A gold-bullet summary list, then a **mid-article CTA box matched to the topic** ("Want both palms read side by side?", with a gold "Check our compatibility" button).
  - Then the FAQ and "Continue reading" cards.
  - **Readability is good** (line length about 38 characters on mobile, generous leading). **There is not a single diagram** in an article about where the marriage lines sit.
  - In-text links: none.
- **Help center** (`www_palmmitra_in_help__mobile__fold.png`): an icon tile and serif H1, then category accordions ("Getting Started"…). Consistent with the rest of the site.

## 5. Psychology

- **Trust signals.**
  - The numbers pill and 7-chip trust wall, a Razorpay and 256-bit SSL chip, "Private · never shared" *inside* the upload box, "Money-back guarantee" under every price, and a boxed disclaimer.
  - Honest copy lines: "Palmistry is a tradition, not a science… no line predicts lifespan", and the FAQ "Is this scientifically accurate or just entertainment?".
- **Social proof.** Reading counts appear 4 times. Testimonials carry photos, "Verified", a job and city, a plan and a date. The number "12,400+" is inconsistent with "2,100 reviews", and "Monthly Plan" refers to a plan that does not exist.
- **Urgency and FOMO (fake).**
  - "₹50 OFFER EXPIRES IN 23:59:28" (a 24-hour timer that resets).
  - "120+ readings completed this week" (a hard-coded badge).
  - "Your Destiny Won't Wait — Neither Should You".
- **Curiosity hooks.** Blurred PREMIUM sections, "Know your next breakthrough year before it arrives", "The 3 years that will change your life — mapped out", a sample headline with specific years, and the "Tap a line" explorer.
- **Fear handling.**
  - Price: "Free preview · no card", "less than a chai and samosa", "Pay once. Yours forever.", a money-back line, and a decoy Elite ₹4,999 that makes ₹299 feel small.
  - Privacy: the privacy chips, plus "Deleted after analysis" on PalmMatch.
  - Scams: nothing specific.
- **WhatsApp.** There is none on the public pages: no WhatsApp button, share action or opt-in.

## 6. Mobile quality

- **Tap targets.** 71 tappable elements on the home page; 11 are under 44 px and 4 under 32 px (inline text links such as "Read my heart line — free" at 20 px tall). Primary CTAs are 52–58 px and the chips are 44 px. Mostly good.
- **Text size.** 54 of about 390 text nodes are ≤11 px. These are the proof micro-copy lines ("No sign-up or card needed · Free preview · Full report ₹299") in low-contrast parchment on indigo, and they are hard to read outdoors.
- **Contrast bug.** The gold CTA label is **#F6F4EE on #F0B428 — about 1.7:1**, which fails WCAG badly (AA needs 4.5:1, or 3:1 for large text). It is visible on every "Get My Free Palm Reading" button. Dark text on gold (for example #1A1206 on #F0B428) would give about 10:1.
- **Overflow.** No horizontal page scroll (document width is 390). Decorative orbit and glow layers overflow, but they are clipped.
- **Speed feel.** The load event fired at about 0.5 s on broadband, with 62 requests and at least 720 KB. The first paint feels instant, although the site is client-rendered. 32 animations are always running; the page scrolls smoothly on a desktop CPU, but a budget Android phone could struggle with the glow and blur.
- **Accessibility.**
  - 5 of 14 images have no alt text.
  - The language `<select>` renders as a 1×1 px element (a custom Radix trigger).
  - `lang="en"` is fixed even where Hinglish copy appears.
  - Scroll-reveal content is invisible until it enters the viewport.

## 7. Scorecard (1–10)

| Axis | Score | Why |
|---|---|---|
| First impression | **8** | Dark indigo and gold look premium and "mystic done tastefully". The hero is clear. The phone art is too small. |
| Clarity | **8** | One job, one CTA colour, a 3-step promise with time badges. Repetition bloats the page to 19 screens. |
| Trust | **5** | Honest disclaimers are undermined by a resetting timer, inconsistent numbers (15 vs 150+ markers, 12,400 vs 2,100) and suspect "verified" testimonials. |
| Premium feel | **8** | Playfair plus gold glow, glass cards and ornament dividers. Held back by the contrast failure and generic line-art. |
| Mobile UX | **7** | Tool in the hero, a sticky CTA, 56 px buttons. Tiny grey micro-copy, a 1.7:1 CTA contrast and a long scroll. |
| Conversion design | **9** | Dropzone in the hero, free/paid split shown early, blurred preview, 4-tier decoy pricing, repeated CTAs. Some of it relies on dark patterns. |

---

# PART 2 — PANDIT AI (pandit.ai)

## 1. Visual identity

- **Palette.** Hex values are from `pandit_ai__desktop__styles.json` and the calculator and question styles.
  - Background: **#FFFFFF**. Text: **#0F1729** (slate-900). Muted text: **#6B7280**.
  - Brand accent: **orange #FE4810**, used for the announcement bar, buttons, the active nav pill, eyebrows and numbered circles.
  - **Red #EF4343** for ✗ icons and **green #22C55E** for ✓ and the live dot.
  - Peach and cream tints (**#FFFADC** at 25–35%, orange at 5–10%) on the hero wash and callouts.
  - The **footer is dark navy (about #0F1729)**, and so is one "technology" section.
- **Light or dark.** Light by default, with a moon-icon toggle in the header.
- **Fonts.**
  - Body text is **Inter**.
  - The home H1 is **Poppins**, bold, all caps and widely letter-spaced ("WORLD'S SMARTEST PANDIT", with the last word in orange).
  - Section and page headings are declared as **Playfair Display** but **render in a Times-like fallback serif** in our captures ("PALM READING / hastrekha", "What is Palm Reading AI?", card titles and footer headings). The web font appears not to load, so the headings look like an unstyled document.
  - Evidence: `pandit_ai_palm_scanner__desktop__fold.png`, `scroll/pa_palm_m_05.png`.
- **Type-scale feel.** Loud, marketing-style display type at the top, then plain long-form blog text (15–16 px grey #6B7280 on white, with comfortable leading).
- **Spacing density.**
  - Hero and chrome are **cramped**: 5 stacked proof elements sit above the hero art.
  - Content pages are airy: white cards with 16–24 px padding and about 64 px between sections.
- **Corner radius.** `9999px` pills (nav, Download, chips), 10 px buttons, 12–16 px cards with 1 px grey borders. Soft, generic "shadcn" styling.
- **Shadows, glass and gradients.** Mostly flat. Peach radial washes sit behind the hero, dashed orbit arcs with orange dots float around the phone, and a light shadow sits on the toast and the cards.
- **Imagery.**
  - **Glossy cut-out photos of models**: a woman in a sequined lehenga on a phone call, a woman raising her palm, couples looking at phones.
  - Inside **iPhone mock-ups of the app UI**. The mock-ups show "$149" and "$214" wallet balances and **"Buy Palm Reading – $9.99"**, which means USD pricing is shown to Indians.
  - Calculator, question and report pages use **AI-generated lifestyle photo collages** (warm beige interiors) with carousel thumbnails.
  - **No palm diagrams anywhere**, even on the palm pages.
  - Evidence: `pandit_ai__desktop__fold.png`, `scroll/pa_topic_m_01.png`, `scroll/pa_calc_m_02.png`, `scroll/pa_q_m_01.png`.
- **Iconography.** Orange Lucide line icons, 3D emoji-style illustrations in the "technology" grid (a book, a planet, a brain), and store badges.
- **Indian cultural cues.**
  - Models in lehengas and Indian dress, diyas and marigolds in the phone mock, and Indian-name testimonials.
  - Transliterated terms (hastrekha, Hridaya Rekha, Kalatra Bhava, Vivah Rekha) and remedies (Tuesday fasting, Shani mantras).
  - A language band with state names.
  - **No Devanagari**, and no Hinglish on the web.
- **Motion** (the **home page has 100 running animations, 94 of them infinite**):
  - A rotating announcement bar ("World's First Voice AI Astrologer" / "4.8/5 Rating Trusted by 100K+ Users" / "Live NASA Planetary Data").
  - An "AS SEEN ON" logo marquee.
  - A drifting "N VIEWING NOW" counter.
  - **On desktop, curved kinetic text ribbons of questions and answers sweeping across the hero**.
  - A talking-girl alpha video.
  - Orbit arcs with travelling dots, and a sound-wave bar.
  - A testimonial marquee pinned above the bottom nav.
  - **Toasts popping every few seconds**, a languages ribbon, and carousels.

## 2. Home page layout, mobile first (`pandit_ai__mobile__fold.png`, `scroll/pa_home_m_01–14`)

**Persistent chrome.** This is the defining problem:

| Element | Height | Content |
|---|---|---|
| Orange announcement bar | 36 px | Rotating messages, with ‹ › arrows 24×24 |
| White header | 65 px | Hamburger, theme toggle, logo, orange "Download" pill (73×29) |
| Testimonial marquee strip | 56 px | Pinned above the bottom nav |
| Bottom nav | 70 px | Home · Connect · **big orange centre DOWNLOAD** · Palm · Face |
| Activity toast (while shown) | 79–94 px | Covers the content above the strip |
| Back-to-top button | — | Floats over the content |

Together the chrome takes **about 300–320 px of an 844 px screen (about 37%)**, so content gets about 530 px.

The home sections, in order:

1. **Hero.**
   - H1 "WORLD'S SMARTEST PANDIT" → an "AS SEEN ON" logo marquee (ZBusiness, ANI, The Tribune, MarketWatch, The Hindu…) → "★★★★★ 4.8 · 100K+ DOWNLOADS" → a green-dot pill "4,327 VIEWING NOW".
   - Then a **large phone frame**. At 2.5 s it is **blank white** because the video has not loaded (`pandit_ai__mobile__fold.png`); at 3.5 s it shows the app home screen (`pa_home_m_01`).
   - A cut-out model on a phone call overlaps the frame.
   - **The toast immediately covers the bottom of the hero**: "User from London, UK · 44 sec ago · Started a live consultation · ● 31 people viewing this page". So the same fold says **4,327 viewing** and **31 viewing**.
   - Mobile above the fold shows no value proposition beyond "smartest", no palm and no action except Download.
   - Desktop (`pandit_ai__desktop__fold.png`): a centred letter-spaced H1, "AI Voice · Chat · Palm · Face Reading", App Store and Google Play badges, "4.8 · 100K+ downloads · 50+ Languages", the phone, the model, and kinetic question ribbons. Desktop is cleaner and the store badges are visible.
2. **Store badges and a question marquee** ("What are my strengths… for better luck • Ketu…") with a call/voice pill.
3. **"Speak in Any Language"**: a twisted ribbon of language names around a globe icon. Pretty but decorative.
4. **"Voice AI"**: a phone showing a kundli chart plus the model on a call, and chat bubbles (User: "What gemstone to wear?" / Pandit AI: "Blue sapphire aligns with you…").
5. **"The Smarter Choice"**, a comparison (`pa_home_m_04–06`). On mobile it becomes **7 stacked cards**, each showing PANDIT AI ✓ highlighted in peach and ChatGPT, Human Astrologer and Astro Apps with red ✗ or amber –. It takes about 4 screens of scrolling.
6. **"How We Trained Our AI"** (a dark navy card), then **"How We Achieve Accuracy"**: 3D-emoji tiles with badges "Swiss Ephemeris", "**NASA-grade data**", "3 systems combined" and "Decision making".
7. **Features grid**, "Everything You Need for **Spiritual Guidance**": 2-column cards (Face Scanner, Daily Predictions, Kundli Analysis, Gun Milan, Career Guidance, Remedies). Palm is one feature among eight.
8. **Testimonials**, "Loved by Thousands": one large card per slide (quote, stars, avatar, name, city) and "4 / 15" pagination.
9. **Banner carousel**: dark lifestyle banners ("Based on your KUNDLI · Know your day, Before your day · Read Now").
10. **Footer** (`pa_home_m_11–14`): a navy mega-footer with feature chips (Call / Chat / Kundli / Palm Scanner…) and 2-column link lists (Explore, Compare, Resources, Legal, Reports, Palm Scanner topics, Face Scanner topics, Questions, Calculators), then a Google Play badge, 6 social icons, an email, and "© STULINK PRIVATE LIMITED (CIN…)". **It links all 59 URLs**, which is strong for crawl depth, but the links are 14 px tall.

**Why it works:** the device-aware store CTA is always one thumb away, the question-led links in the footer match real Indian searches, and the lifestyle imagery says "for people like you".

**Why it doesn't work:** there is no single job, the palm is buried, and the chrome and fake social proof crowd out content. The hero depends on 700 KB–1 MB of video, and the "World's first / Smartest / NASA" claims shout rather than show.

## 3. Reading and upload UX (`/palm-scanner`, `/download`)

- **There is no web reading.** `/palm-scanner` (`pandit_ai_palm_scanner__mobile__fold.png`, `__desktop__fold.png`) is an app landing page:
  - Breadcrumb, an "AI PALMISTRY" eyebrow, and the H1 "PALM READING / hastrekha" with an **orange serif second line**, "AI-Powered Vedic Palmistry".
  - A sub-head: "world's most advanced… report in under 30 seconds".
  - 4 check-chips (Instant Analysis, All Lines & Mounts, PDF Download, Vedic Authentic).
  - Store badges, "4.8 rating · 100K+ downloads".
  - The phone mock-up shows a model raising her palm with a **horizontal scan line**, an orange "🖐 Scanning…" pill, "18,573 orders ★4.9" and "**Buy Palm Reading – $9.99**".
- **Page body** (`scroll/pa_palm_m_02–22`), about 18,000 px on mobile:
  - A collapsible "Table of Contents" and **five screens of unbroken paragraphs** ("What is Palm Reading AI?").
  - 4 benefit cards and a 3-column comparison table (Factor / Pandit AI / Traditional).
  - A **6-step numbered list with orange circles** (Open the Palm Scanner → Position → Capture → AI Analysis → Receive → Download PDF).
  - "What We Analyze" check-list cards, then mount cards ("Mount of Jupiter · *Below Index Finger* · Leadership, ambition").
  - A languages grid, an FAQ and a "Discover What Your Palms Reveal" chip CTA with a Play badge.
  - Link cards for "Palm Reading by Topic", related guides, and the mega-footer.
  - **Not one diagram shows where a line or mount is**, and the user never sees a line drawn.
- **Download flow.**
  - On an Android phone, **`/download` redirects straight to the Google Play listing** (`pandit_ai_download__mobile__fold.png`). That listing shows **4.8★ · 119 reviews · 10K+ downloads**, which contradicts the site's "100K+". The user sees the contradiction at the exact moment of install.
  - On desktop, "Download App" opens a **QR modal** ("Download Pandit AI · Scan with your phone… · Point your camera at the QR code · iOS / Android · Free to download · Auto-detects your device"). Evidence: `state_desktop_download_qr.png`.
  - This is the **best-built conversion piece** on the site.
- **Result reveal, locks and price:** none are visible on the web. Prices are hidden ("Free download"), and the only prices a visitor sees are in the phone mock-ups, in **USD**. There are no INR or UPI signals at all.

## 4. Tool, topic, question and report templates

**Calculator** (`/calculators/marriage-age`, `scroll/pa_calc_m_01–09`). This is **their best template**.

- **Tool-first hero:** an orange heart icon tile and the serif H1 "At What Age Will I **Get Married?**", with the keyword in orange and a hand-drawn underline swash.
- Directly under it is **the form card**, titled "Your strongest marriage window", with the micro-copy **"🔒 Your details stay in this browser and are not saved by this page."**
- **Fields:**
  - Name, with a leading icon.
  - Date of birth as 3 selects (Day / Month / Year).
  - Time of birth, with "Use the closest known time if you are unsure".
  - Place of birth as a city search.
  - Relationship status as a **segmented control** (Single / Dating / Married).
- A full-width orange CTA "Calculate my reading →", then "Takes a few seconds · No sign-up needed".
- Then a lifestyle collage (a **1.5 MB PNG**), one explanatory paragraph and "🛡 Private in-browser form · Personalised reading".
- H2 "How This Calculator Works", with the inputs as check-cards.
- H2 "Why Astrology Gives a Window", then H2 "**What the Result Does Not Decide**" ("cannot name your future partner… never a judgment of your worth").
- An FAQ, then "Want the full chart context? → Download the app".
- An "EXPLORE CALCULATORS" list with the current tool highlighted in peach; it is a **sticky sidebar** on desktop.
- The CTA sits in the hero, at the end, and on every toast.

**Question page** (`/questions/when-will-i-get-married`, `scroll/pa_q_m_01–21`).

- H1 as the question, then a **hero image carousel** of 6 AI photo thumbnails with the title baked into the first image.
- An intro and the CTA "Check My Marriage Timing".
- An "On this page · **13 sections**" collapsible TOC.
- **"The Short Answer"**: 3 numbered cards with orange circles (chart potential / supportive Dasha / transits agree).
- Deep sections with check-lists.
- A **peach callout "What delay does not mean:"**, then remedies.
- **"Three Things Astrology Cannot Tell You"** as numbered cards (a guaranteed date / the spouse's name / whether to accept a proposal).
- **"How PANDIT AI Can Answer This For You — five ways"**: numbered cards, each with a "**Best for:**" line and an outline button (Ask an AI Astrologer / Start a Call / Scan My Palm / Scan My Face / Reports).
- A "Don't know your birth time?" callout, an FAQ with 8+ questions, related questions and "Explore More Readings" cards.

It is readable, calm and well structured. The wall-of-text sections are broken up by numbered cards and callouts. **The internal links are contextual**, for example "see *Do I Have Manglik Dosha?*" in orange inside a bullet.

**Palm topic page** (`/palm-scanner/love-marriage`, `scroll/pa_topic_m_01–25`).

- A "♡ PALM READING SERIES" eyebrow and a two-line serif H1 with an orange second line.
- A phone mock-up of the model showing her palm, then store badges.
- "On this page · 15 sections".
- Long text, with **2-column meaning tables** ("Where your heart line ends → Traditional meaning in love") and clock-icon cards for **marriage timing bands** ("Close to the heart line → roughly late teens to mid-20s… never an exact date").
- Good content design. **No diagram shows where these lines sit.**

**Report page** (`/reports/1-year-report`, `scroll/pa_report_m_01–17`).

- The H1 "Your Next 12 Months, Month by Month", a photo carousel, an orange subtitle and the CTA "Get My … Report".
- Life-area cards, plus "Wellbeing & energy — *not medical assessment*".
- A **dark sample card labelled "ILLUSTRATION ONLY — NOT A REAL PREDICTION"** with an Area / Outlook / Illustrative summary table. **On mobile the third column is clipped and there is no swipe hint** (`pa_report_m_07`).
- "The Vedic Astrology Behind Your Report" cards.
- **No price is shown.**

## 5. Psychology

- **Trust signals.**
  - "AS SEEN ON" logos (unlinked) and "4.8 · 100K+ downloads".
  - "Swiss Ephemeris", "NASA-grade data", "Live NASA Planetary Data".
  - A CIN number in the footer.
  - Calm guardrail sections on content pages ("What the result does not decide", "Three things astrology cannot tell you", "Illustration only").
  - Privacy micro-copy on calculators ("details stay in this browser").
- **Social proof (fabricated).**
  - The "N VIEWING NOW" counter (3,200–5,000 on the home page).
  - A toast every few seconds, "User from {city} · N sec ago · Just downloaded…" with a random avatar and "N people viewing this page". The two numbers contradict each other on the same screen.
  - A pinned testimonial strip and a 15-card carousel.
- **Urgency and FOMO.** Implied through "live" activity rather than timers. The toast texts are tailored to each page ("Scanned their palm", "Asked PANDIT AI when they will get married").
- **Curiosity hooks.** Kinetic question ribbons ("What does my palm reveal?", "Is 2026 good for travel?"), questions as H1s, and "Your Palm Already Knows Your Future" in the announcement bar.
- **Fear handling.**
  - Content pages handle anxiety well: "What delay does not mean", no guarantees, "not medical assessment", and "Remedies support timing; they don't override it".
  - Price fear is handled by **hiding the price**: "Free download", with per-minute prices buried in policy pages.
  - Privacy: "Your details stay in this browser".
- **WhatsApp.** None.

## 6. Mobile quality

- **Tap targets are poor.**
  - Home page: **105 of 131 tappable elements are under 44 px, and 58 are under 32 px**. Examples: announcement arrows 24×24, header Download 73×29, carousel dots 24–28 px, footer links about 14 px tall.
  - Palm page: 98 of 142 under 44 px. Calculator page: 66 of 109.
- **Text size.** On the home page 99 text nodes are ≤11 px (toasts, the strip, badges). Body text on content pages is 15–16 px grey #6B7280 on white (about 4.8:1), which is fine.
- **Contrast.** White on orange #FE4810 is **about 3.4:1**. That fails AA for the 14 px button labels (it would pass only for large text).
- **Overflow.** There is no page-level horizontal scroll, but tables (a 620 px minimum width on the question page, and the 1-year report sample) scroll inside their containers with **no affordance**, so the right column looks cut off.
- **Speed feel.** It is heavy:

  | Page | Transfer (lower bound) | Requests | Load event |
  |---|---|---|---|
  | Home | ≥5.0 MB | 90 | 2.4 s |
  | Palm page | ≥6.8 MB | 54 | 1.8 s |

  The biggest files are:
  - A **2.1 MB logo-icon PNG**.
  - 700–840 KB alpha WebM videos.
  - About 1–1.1 MB phone-screenshot PNGs.
  - 1.5 MB calculator hero PNGs.

  On 4G on a ₹10k Android phone, the hero phone frame will sit empty and white for seconds. There are also 94 infinite animations.
- **Accessibility.** Toasts steal attention and cover the content. Between 1 and 7 images per page have no alt text. Carousels auto-play with no pause button. The fixed chrome reduces the usable viewport to about 60%. Screen readers will hear toast updates.

## 7. Scorecard (1–10)

| Axis | Score | Why |
|---|---|---|
| First impression | **6** | Bright, energetic and very "Indian consumer app", but cluttered, and the hero phone can be blank. |
| Clarity | **5** | Seven features and no single job. "Palm Scanner" is a brochure; you cannot scan. |
| Trust | **3** | Contradictory live counters, 100K vs 10K on their own Play redirect, unlinked press logos, "NASA", USD prices in the mock-ups. The content-page guardrails save a little. |
| Premium feel | **5** | Stock-model gloss and a Times fallback on headings, with generic shadcn cards. |
| Mobile UX | **4** | 37% of the screen is chrome, 80% of tap targets are under 44 px, 5–7 MB pages, and toasts cover content. |
| Conversion design | **7** | Download is always one tap away, with device detection, a desktop QR code and a question → tool → app ladder. Hurt by the missing web value and the fake proof. |

---

# PART 3 — WOW: what we should import (adapted, never copied)

The ideas are ranked by expected impact on our goals (free web reading → trust → Play Store install). Each item gives the idea, then how we do it better, then the evidence screenshot. **Our advantage everywhere is the user's own photo with real traced lines, plus real Hindi.**

1. **The tool *is* the hero.** From PalmMitra's in-hero dropzone.
   - Our hero shows a sample palm photo with 4 animated traced lines (heart, head, life, fate, in our line colours), a big "अपनी हथेली की फोटो डालें / Upload your palm photo" dropzone, and one line: "पहली reading free · कोई sign-up नहीं · फोटो पढ़ने के बाद delete".
   - Carry the chosen file into the flow and start uploading in the background.
   - Evidence: `palmmitra/www_palmmitra_in__mobile__fold.png`.
2. **The result is shown on *their* photo. This is our "wow" moment, and neither competitor can do it.**
   - PalmMitra's best visual is a *fake* sample card ("Priya & Arjun 87%" with bars), and both competitors draw template lines.
   - Our reveal draws each line onto the user's photo one by one, each with its Hindi name label (हृदय रेखा…), then shows 4 meaning cards: life questions first, short Hindi text.
   - Make a **WhatsApp-ready share card** (photo + traced lines + one-line takeaway, no personal data).
   - Evidence: `palmmitra/…palmmatch__mobile__full.png` (slice 01).
3. **Show "what's free vs in the app" *before* upload.**
   - PalmMitra's desktop "What You'll Unlock" panel, done honestly: rows such as "4 main lines traced — FREE on web", "Detailed 4-part reading — FREE (1st)", "More readings / compare hands — in app".
   - No locked "health" row.
   - Evidence: `palmmitra/www_palmmitra_in_upload__desktop__fold.png`.
4. **A "Tap a line" explorer that uses a real photo.**
   - Chip row plus a highlighted line plus a 2-line meaning, as in PalmMitra, but on a real annotated palm photo with Devanagari names.
   - Reuse it on the home page, every line guide and the glossary tool.
   - Evidence: `palmmitra/scroll/pm_home_m_06.png`.
5. **Tool-first calculator template for our 12 tools.** From PANDIT's calculator:
   - An icon tile and a question H1 with one coloured keyword.
   - The form card directly under it.
   - The privacy line "आपकी जानकारी इसी browser में रहती है".
   - Segmented controls instead of dropdowns where possible.
   - A full-width CTA and "कुछ सेकंड · कोई sign-up नहीं".
   - Then How it works → **"यह result क्या तय नहीं करता"** → FAQ → app CTA → other-tools list (sticky on desktop).
   - Drop the 1.5 MB photo collage. Use our own diagram (SVG, under 30 KB) instead.
   - Evidence: `pandit/scroll/pa_calc_m_01–05.png`.
6. **Life-question page anatomy.** From PANDIT's question page:
   - "Short answer" as 3 numbered cards.
   - A calm tinted callout, "इसका मतलब यह नहीं है…".
   - "हस्तरेखा क्या नहीं बता सकती" cards.
   - A **"Ways to get your answer · Best for:" ladder** (free web tracer → marriage-line tool → app reading → compare hands in the app).
   - Contextual inline links.
   - Put an **upload box at the top**, because our answer can come from their photo.
   - Evidence: `pandit/scroll/pa_q_m_02.png`, `pa_q_m_08.png`, `pa_q_m_11–13.png`.
7. **Meaning tables plus diagrams.** PANDIT's "where your heart line ends → meaning" table is great content design. We pair each row with a small diagram of that ending (inline SVG), and mark the timing bands on a diagram instead of in text.
   - Evidence: `pandit/scroll/pa_topic_m_05.png`, `pa_topic_m_10.png`.
8. **Time-badged "3 steps".** PalmMitra's "< 30 sec / ~90 sec / Instant" badges make the flow feel short. We use **measured** times from our pipeline (photo check → lines traced → reading written), and the loader shows the same real stages.
   - Evidence: `palmmitra/scroll/pm_home_m_03–04.png`.
9. **Device-aware install CTA plus desktop QR modal.** From PANDIT:
   - On Android, show one "Google Play पर app लें" button.
   - On desktop, show a QR modal generated locally (not through a third-party API), with UTM tagging per placement.
   - Show our **real** Play rating only once it exists.
   - Evidence: `pandit/state_desktop_download_qr.png`.
10. **Sticky bottom CTA with 3 trust micro-points.** From PalmMitra: "मुफ़्त reading शुरू करें →" with "फोटो delete · हिंदी/English · No sign-up" underneath.
    - One bar only; keep all fixed chrome **≤20% of the viewport**.
    - Evidence: `palmmitra/scroll/pm_home_m_02.png`, compared with PANDIT's 37% in `pandit/pandit_ai__mobile__fold.png`.
11. **Guide article template.** From PalmMitra:
    - Breadcrumb, a category pill with read time, an answer-first intro, a boxed TOC, a pull-quote takeaway card, bulleted "reading guide" lists, a **mid-article CTA matched to the topic**, and "Continue reading".
    - We add a diagram at the top of every guide, a Hindi twin page and in-text links.
    - Evidence: `palmmitra/www_palmmitra_in_guides_marriage_lines_palm_meaning__mobile__full.png`.
12. **Clearly labelled sample reports.** PANDIT's "ILLUSTRATION ONLY — NOT A REAL PREDICTION" label becomes our "नमूना reading — असली reading आपकी फोटो से बनेगी".
    - Evidence: `pandit/scroll/pa_report_m_06.png`.
13. **Price card craft, without the tricks.** From PalmMitra's pricing: a big price numeral, a "what you get" checklist, "one-time" or "monthly" stated plainly, and a UPI row. We add **real UPI / GPay / PhonePe marks**, where they only name them in text.
    - No fake "was" prices, no decoy tier and no refund promise that contradicts our terms.
    - Evidence: `palmmitra/scroll/pm_home_m_20.png`, `pm_home_d_15.png`.
14. **Seasonal banner with a native-language line.** PalmMitra's Diwali card, redone for Karva Chauth, Diwali and wedding season, linking to compare-hands, with the line **in Devanagari** (they use Hinglish in Latin letters).
    - Evidence: `palmmitra/…palmmatch__mobile__full.png` (slice 01).
15. **Cultural eyebrows, done for real.** PalmMitra's "ॐ + Sanskrit word in Latin letters" is decoration. Ours are short **Devanagari eyebrows** (हस्तरेखा · मार्गदर्शन · प्रश्न-उत्तर) with the English under-label, plus a subtle mandala divider.
    - Evidence: `palmmitra/scroll/pm_home_m_03.png`.
16. **A premium night palette, readable.**
    - Dark indigo plus gold reads "premium mystic" and suits palm reading. If we go dark, use **dark text on gold CTAs** (#1A1206 on #F0B428, about 10:1) and never the 1.7:1 white-on-gold.
    - Keep micro-copy at 13 px or more with at least 4.5:1 contrast.
    - Offer a real light mode.
    - Consider the `08-design-direction.md` choice before adopting any palette.
17. **Question-led footer and link map.** PANDIT's mega-footer (topics, questions, tools, reports) gives crawl depth. Ours is bilingual, with 44 px link rows grouped behind accordions on mobile.
    - Evidence: `pandit/scroll/pa_home_m_12–13.png`.

# Never do

1. **Fake live activity.** No "4,327 viewing now" counters and no "User from Pune just downloaded… 12 sec ago" toasts (PANDIT shows two contradictory counts on one screen; `pandit/pandit_ai__mobile__fold.png`).
2. **Fake deadlines.** No resetting "₹50 offer expires in 23:59:28" timers, and no "120+ readings this week" badges (`palmmitra/scroll/pm_home_m_23.png`).
3. **Inflated or unverifiable numbers.** No "100K+ downloads" that the Play page contradicts, no unlinked "As Seen On" logos, and no reading counts that disagree across pages.
4. **Unverifiable testimonials.** No stock or AI avatars with "Verified" and "prediction came true", and no dates or plans that don't exist (`palmmitra/scroll/pm_home_m_16.png`).
5. **Dated or health predictions.** No dated predictions in hero art or sample reports ("2026 Growth Ahead", "growth cycle… 2028"), and no locked "Health & Vitality" rows.
6. **Chrome over content.** Fixed chrome must never cover more than about 20% of the phone screen. No announcement bar plus review strip plus bottom nav plus toast stacked together.
7. **Low-contrast CTAs.** No white text on gold (1.7:1) or on orange (3.4:1).
8. **Heavy media.** No multi-MB media on the critical path: a 2.1 MB logo PNG, 1.5 MB hero PNGs, 0.7–1 MB autoplay videos, or 90+ infinite animations. Budget: one hero image under 150 KB and one purposeful animation (the line-tracing).
9. **Hidden content.** No scroll-reveal that leaves content invisible if the observer or JS fails; content must render visible by default. No headings that depend on a web font without a matched fallback (PANDIT shows Times).
10. **Misleading labels.** Never use "Free … Online" for an app-only or paid feature, and never show **USD prices or wallets** to an Indian audience.
11. **Hidden table columns.** No tables that clip on mobile without a swipe cue; stack them as cards instead.
12. **Contradictory sign-up promises.** No email wall before the first value while claiming "no sign-up". Our first reading asks for nothing.
13. **Fake Indian-ness.** No Sanskrit words or ॐ used as decoration while the site has zero Devanagari. Our Indian-ness is the language itself.
14. **Buried palm reading.** Never let the palm reading become one feature among eight. Every page leads back to "see your own lines".
