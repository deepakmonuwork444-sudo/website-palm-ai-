# Palm Read AI Website — Master Plan v2

**Status:** PLAN v2 READY — waiting for owner OK (2026-09-26). This replaces v1 from the same day, which the owner rated "about 20% ready".

**Project:** a separate folder, `D:\palm ai\palm-ai-website`. The app repo (`D:\palm ai\palm-ai-new--feat-m1-foundation`) is never edited from here. Every change the app repo needs is written in §8.7 as a spec only.

**Brand and domain:** not final yet. The brand strings, domain, API host, Play package, app prices and free-reading numbers all live in one file, `src/config/site.ts` (§12.2). In this plan:
- `Palm Read AI` is the working brand.
- `<domain>` is the future domain.
- `api.<domain>` is the app's proxy Worker.

**Evidence tags.** Each claim names its source:

| Tag | Source |
|---|---|
| R01–R05 | `research/01-palmist-io.md`, `02-palmmitra-in.md`, `03-palmreading-pro.md`, `04-pandit-ai.md`, `05-palmly-ai.md` (competitor text teardowns) |
| R06, R07 | `research/06-ui-visual-a.md`, `07-ui-visual-b.md` (visual UI/UX; screenshots in `research/screens/`) |
| R08 | `research/08-design-direction.md` (design directions, the app's brand tokens) |
| R09 | `research/09-stack-architecture.md` (stack, GitHub research, read-only check of the app repo) |
| R10 | `research/10-user-psychology.md` |
| R11 | `research/11-seo-placement.md` |
| v1 | the first version of this plan (keyword table, owner decisions) |
| owner | a decision the owner has already made |
| rec | my recommendation where the research gives no direct answer; needs owner OK |
| verify | a fact about our product to check on the real backend before it goes on a page |

---

## 0. Executive summary (for the owner)

1. **What we build:** a fast Hindi and English website whose home page *is* a free AI palm reading. The visitor sees their own heart, head, life and fate lines drawn on their palm photo, then gets a short reading. Around it sit 2 hubs, 4 line guides, honest topic guides, 12 free tools, a blog, and an `/app/` page that leads to the Android app on Google Play.
2. **Free rule (owner):** reading 1 is free as a guest. Reading 2 comes after a free email sign-up; it is a *new* reading and does not unlock reading 1. After that there are 0 free readings, and the site says "Continue in the app", with the app's price next to the button. The website takes no payments.
3. **Why we win:** none of the 5 competitors traces real lines on the user's own photo, has Hindi pages that Google indexes, or links a Play Store app well. All 5 use fake counters, timers, prices or reviews [R01–R07]. We lead with proof, real Hindi, honesty, and a source for each meaning.
4. **Look and stack:** Direction A, "Nakshatra Night Web" — the app's own indigo and gold, one gold button per screen, one trace animation, no cookie banner [R08]. Astro 7 static pages with React 19 islands, hosted on Cloudflare Workers (not Pages). Supabase is reached only through the app's proxy Worker, because Indian ISPs block `supabase.co` [R09].
5. **Time — "one day" is not realistic:** **P1**, a launchable site with the live reading, is about 27 h of website work plus about 11 h of server work in the app repo, roughly 5 working days. **P2**, the research's "week 1" (11 guides, 8 tools, 5 posts, the PDF, Hindi tools), is about 45 h more plus about 20 h of extras. P1 + P2 is about 103 h, which is 2–3 working weeks with owner review [R09 §4.1, §14].
6. **Blocked on:** (a) the brand and domain; (b) server work in the app repo: migrations 0016/0017 (the live database gives **2 guest + 2 after email** readings, and the email-code path is untested), the proxy Worker's IP fixes, a web-only Turnstile check, a **separate web daily cap** (the ~34 AI readings a day are shared with the app), CORS, email sending, and exact-path App Links; (c) a website section in the privacy policy, because the photo goes to **two** services (Modal in the USA and Cloudflare Workers AI) and the traced line points **are** stored, so "sent once" and "never stored" wording must go; (d) the Play App Signing SHA-256; (e) the decisions in §16.
7. **Can start today, without the domain:** the scaffold, the design system, the P1 content (Hindi drafts already exist in the app repo), the tools, and the full reading screen in mock mode on a private preview.
8. **Your next step:** read §3.3 (the hero promise) and §16 (the decisions), then either say "go with the recommendations" or change what you want.

---

## 1. Goals, success metrics and non-goals

### 1.1 Goals

| # | Goal | Why |
|---|---|---|
| G1 | Turn English and Hindi palm-reading searches into readings started on the site | The keyword map is guides plus one tool, and Hindi is uncontested [v1, R11 §4] |
| G2 | Give a real free reading that proves the product: the user's own lines traced on their photo | Our clearest advantage; no competitor does it [R01–R07] |
| G3 | Turn satisfied readers into Android installs through Google Play, measured per page | The website is the top of the app funnel [owner, R10 §7] |
| G4 | Build honest, sourced guides and tools that rank, get shared on WhatsApp and get cited by AI answers | Competitors are small, new and contradict themselves [R01–R05, R11 §1] |
| G5 | Host the app's legal pages and App Links on the same domain | The app already links these URLs [v1, R09 §3.12] |

### 1.2 Success metrics

All counts are cookie-free totals. Web search, website, Play Store and App Store numbers are always reported separately (§13).

| Metric | Definition | Source | Target |
|---|---|---|---|
| Search clicks and impressions | Non-brand only, by page group (home, pillars, hubs, Hindi, tools, blog) | Search Console [R11 §3.11] | Measure a baseline in the first 30 days, then set targets [rec] |
| Indexed P1 pages | Indexed ÷ submitted, per sitemap | Search Console | Every P1 page indexed by day 30 [rec] |
| Upload starts | Visitors who pick or take a photo ÷ home visits | Funnel events + Cloudflare Web Analytics | Baseline first |
| Photo-check pass rate | Photos that pass the in-browser check ÷ photos checked | Funnel events | Baseline first |
| Readings started and finished | Starts, finishes and errors by code | Funnel events + `reading_sessions.source='web'` [R09 S4] | Baseline first |
| Reading time | p50 and p90, from "Use this photo" to the report on screen | Measured on the web build | Copy may only quote the measured p50 [R10 §1] |
| Sign-ups | Verified emails ÷ first readings finished | Funnel events | Baseline first |
| Second readings | Free readings after email that finish | Funnel events + sessions | Baseline first |
| Store clicks | Per page, placement and device | Funnel events | Baseline first |
| Installs by source | `utm_source=web`, `utm_medium=<page>`, `utm_campaign=<placement>` | Play Console acquisition [R09 §3.10] | Baseline first |
| Core Web Vitals (p75, mobile) | LCP, INP, CLS | Cloudflare RUM, Search Console | LCP ≤ 2.0 s on guides and ≤ 2.3 s on home; INP ≤ 150 ms; CLS ≤ 0.05 [R09 §3.9, R11 §3.6] |
| Cost and abuse | Web readings per day against the web cap; 429 errors; Turnstile failures | `app_usage_daily` | Never above the owner's budget |
| Honesty KPI | 1–3★ Play reviews that mention "free", "fake", "scam" or "charged" | Play Console | Falls towards zero [R10 §7.5] |

### 1.3 Non-goals

- **No payments on the website:** no wallet, card or UPI fields. Billing stays in Google Play [v1, R10 §4].
- **No predictions and no prediction tools** [owner]. That means no dates, ages, lifespan, health, divorce, number of marriages or children, or money amounts. There is no marriage-age calculator, even though R03 suggests one.
- **No other astrology products:** no AI astrologer chat, horoscopes, kundli, tarot or face reading [R01, R04 X8, R05].
- **No App Store badge and no iPhone promises** until an iOS app exists [R10 §7.2].
- **No public reading pages** (no indexable `/r/<id>`). Share cards are images made on the device [R03, R11 §3.2].
- **No mass templated pages**, for example per city, per gender or per zodiac sign [R11 §3.9].
- **No ads, ad pixels or remarketing tags** [R10 §4].
- **No Google sign-in at launch.** Its OAuth callback runs on the blocked Supabase host, so it waits until after week 2 and Jio/Airtel tests [R09 §3.6].
- **No palm tracing in the browser** [R09 §2.1–2.2]. No open-source project traces palm lines at production quality, and we must not ship AGPL code or model weights trained on scraped photos. Our backend's tracing remains the product.

---

## 2. Competitor landscape

### 2.1 The five competitors (full teardowns in `research/01–05`)

**1. palmist.io [R01].**
- **What they have:** 33 URLs: a scanner, a learn hub with 7 line guides (about 2,000 words each, all published the same day), 5 tools and 12 zodiac pages. No blog.
- **How they make money:** AI "astrologer" chat (₹4/message), voice calls (₹25/min) and a ₹199 marriage report, with ₹151 of free credit on sign-up.
- **Weak spots:** 13 languages, but switched only in the browser, so Google sees English only. No Play Store link.
- **Learn:**
  - upload box in the hero with a privacy line;
  - a free sign-in unlocks the full reading;
  - a fixed line-guide template (quick facts, variations, myths, FAQ, "step n of 7", scan button).
- **Avoid:** exact marriage dates, gemstones, human-named bots with ratings.

**2. palmmitra.in [R02].**
- **What they have:** 19 URLs and 10 guides (about 810 words each, all live on 2026-09-25, no images). No tools, no Devanagari Hindi, no app.
- **How they make money:** ₹299 report, ₹999 couples report, ₹4,999 lifetime plan, chat packs of ₹149–349 or ₹799 a month.
- **Learn:**
  - upload box in the hero, with the upload starting while the details are typed;
  - guides with an FAQ and a topic-matched button (their guides have no diagrams; ours will);
  - a Hinglish win-back message after an abandoned UPI payment.
- **Avoid:** a self-restarting countdown, fixed "live" counts, unverifiable testimonials, numbers that conflict across pages, a refund promise the terms contradict, and exact-year or health predictions.

**3. palmreading.pro [R03].**
- **What they have:** 18 URLs: home, 11 English posts (1,050–2,200 words), legal pages and 3 Japanese pages. No tools, no app, no Hindi.
- **How they make money:** $3.99 one time via Stripe, no account. The free preview shows love and half of career.
- **Learn:**
  - a real sample report at the top of the homepage, with one main action;
  - one fixed blog layout (contents, table, myth vs reality, photo tips, FAQ, reader button);
  - a shareable archetype card.
- **Avoid:** an AI-drawn "palm map" whose labels don't sit on the lines, unsourced stats, the "trained on ancient texts" claim, and privacy text contradicted by ad scripts.

**4. pandit.ai [R04].**
- **What they have:** 59 URLs: 8 palm topics, 8 face topics, 8 life-question pages, 8 free calculators, 5 report pages and 3 comparisons. No blog, no Hindi.
- **How they make money:** per-minute calls (₹50–200 in India, $1–3 abroad).
- **Their app:** Android, 4.8★ from 119 reviews, 10K+ downloads on Play; the site claims 100K+.
- **How it's built:** with Lovable, as a JS-only app. Every link shares the homepage preview, and unknown URLs give soft 404s.
- **Learn:**
  - life-question pages that lead to a free tool and then the app;
  - palm topic pages;
  - palm tools with no sign-up;
  - store buttons that detect the phone, a QR code on desktop, tracking tags;
  - `llms.txt`.
- **Avoid:** fake "viewing now" counters, "just downloaded" pop-ups, "NASA data", "World's 1st".
- **Watch:** a hidden, unreleased pay-first web palm scanner that draws the same fixed lines for everyone. We should launch our free real-tracing web reading first.

**5. palmly.ai [R05].**
- **What they have:** about 3 months old (Singapore's iWeaver, on a shared AI backend). Web only, 9 languages, no Hindi.
- **How they make money:** a free teaser, then a $7.99 unlock shown beside a struck-through "$19.99", plus credits for follow-up questions.
- **Current state:** half broken. The certificate expired on 2026-09-24, and the blog, tools and sitemap return 500 errors. About 5 tools are blocked in robots.txt. "120,000 readings" is hard-coded.
- **Learn:**
  - upload box, photo-tip chips and one "Read my palm" button;
  - locked section cards, each with one real hook line;
  - `/hi/`-style locale pages with translated structured data;
  - one template for all tool pages;
  - an archetype share card.
- **Avoid:** fake discounts, invented social proof, health predictions.

### 2.2 Visual and UX scorecard (1–10) [R06, R07]

| Site | Look | First impression | Clarity | Trust | Premium | Mobile UX | Conversion | Main visual lesson |
|---|---|---|---|---|---|---|---|---|
| palmist.io | Dark night sky `#08060F`, gold CTA `#F5B642`, Fraunces + Inter | 8 | 6 | 7 | 8 | 6 | 7 | The tap-a-line palm diagram is their best idea. On mobile, the fixed bottom bar and chat bubble cover the upload button. |
| palmreading.pro | Light "antique paper" `#FCFAF6`, purple CTA `#50349C`, Cormorant + Inter | 8 | 8 | 6 | 8 | 6 | 8 | Sample report above the fold. On mobile the upload is 1.5 screens down. Gold links are only 1.94:1 contrast. |
| palmly.ai (archived copy) | Dark violet `#160F30`, gold gradient, serif + Inter 300 | 8 desktop, 6 mobile | 7 | 4 | 8 | 5 | 7 | Photo chips at the upload point. The site is down (expired certificate, 500 errors). |
| palmmitra.in | Dark indigo `#0B0920`, gold `#F0B428`, Playfair + Inter | 8 | 8 | 5 | 8 | 7 | 9 | The only site with the dropzone and CTA inside the first mobile screen. The CTA label is 1.7:1 contrast, and the timer is fake. |
| pandit.ai | White with orange `#FE4810`, Poppins/Inter, headings fall back to Times | 6 | 5 | 3 | 5 | 4 | 7 | Phone-aware store button and a desktop QR code. Fixed bars take 37% of the phone screen, and the home page is 5 MB or more. |

No competitor traces lines on a real photo in the hero, explains any line in Hindi on the page, or links the Play Store well [R06, combined scorecard].

### 2.3 Findings across all five

- **Tracing.** None of the five traces the real lines on the user's own photo. They use fixed drawings or AI sketches. Our tracing is the clearest advantage [v1, R01–R05].
- **Hindi.** None has real Devanagari Hindi pages indexed by Google. Hindi palm searches (हस्तरेखा, hast rekha, hath ki rekha) are open [v1, R11 §4.1].
- **Size and age.** All five sites are small (18–59 URLs), and their content is new; several published everything on one day [v1].
- **Upload placement.** Of the 4 sites with a web reading, 3 put the upload action below the first mobile screen or under fixed bars; only palmmitra gets it right. pandit.ai has no web reading at all [R06, R07].
- **App links.** Only pandit.ai promotes an app. palmist.io's code mentions an Android app, but the site never links to it. None of the five links a Play Store app well, so store buttons with phone detection and a QR code are unclaimed [v1, R01 §1, R04].
- **Fake proof.** Every competitor uses fake or unverifiable trust signals. Honest proof is a differentiator and avoids consumer-law risk [v1, R10 §5].
- **Self-contradiction.** Each competitor's own pages disagree on speed, markers, readings, refunds or photo storage [R02 §9, R03 §9]. One set of facts that every page reads from is a differentiator (§4.7).
- **Cookie banners.** 4 of the 9 inspiration sites cover the first screen with a cookie banner. A site with no cookies and no banner looks more premium [R08 §2].

### 2.4 What we import (patterns only, adapted, never copied)

| # | Pattern | Seen at (evidence) | Our version | Phase |
|---|---|---|---|---|
| 1 | The tool is the hero, fully inside the first mobile screen | palmmitra, `palmmitra/www_palmmitra_in__mobile__fold.png` [R07] | H1 + one line + the upload card. No tab bar or chat bubble over it. | P1 |
| 2 | Show the output before asking for input | palmreading.pro sample card; palmist tap-a-line [R06] | A consented real photo whose lines (our model's real output) draw themselves once | P1 |
| 3 | Photo tips and chips at the moment of upload, plus a check before sending | palmly chips; palmist's tips sit 2 screens down [R06] | Chips with tiny good/bad thumbnails. Our port of the app's photo-quality check runs before anything is sent. | P1 |
| 4 | Locked cards, each with one real line | palmly hooks [R05] | Same as the app (DEC-038/042): the real first sentence, no blur, no fear hooks | P1 |
| 5 | "3 steps" with time badges | palmmitra `scroll/pm_home_m_03–04` [R07] | Only measured times. No badge until we have measured them. | P1 |
| 6 | Store button that knows the device, QR code on desktop, UTM tag per placement | pandit `state_desktop_download_qr.png` [R07] | QR built into the page at build time (no third-party QR service). Honest note for iPhone users. | P1 |
| 7 | Sticky bottom CTA with 3 true micro-points | palmmitra [R07] | One bar only, shown after the hero button scrolls away. All fixed bars together ≤ 20% of the screen. | P1 |
| 8 | A fixed guide template | palmist quick facts; palmreading.pro TOC and myth vs reality; palmmitra topic-matched CTA [R01, R03, R06, R07] | Adds a diagram per variation, a limits box, a sources box and a Hindi twin | P1 |
| 9 | Calculator-style tool template | pandit `/calculators/*` [R07] | "Stays in this browser" line only when true. "What this result can't tell you" section. Our own SVG instead of 1.5 MB photos. | P1 |
| 10 | Meaning tables with a small diagram per row | pandit palm topic pages [R07] | Stacked cards on mobile (no clipped 3-column tables) | P1 |
| 11 | Clearly labelled sample | pandit "Illustration only" [R07] | "Sample reading. Your reading is made from your own photo." | P1 |
| 12 | Share card for WhatsApp | palmreading.pro, palmly [R03, R05] | Drawn in the browser on the user's own traced photo. The preview shows exactly what is shared. No name by default. | P1 |
| 13 | Proper language URLs | palmly `/zh`, `/ja`… [R05] | `/hi/` with hreflang, `<html lang="hi">` and translated JSON-LD (palmly missed the JSON-LD) | P1 |
| 14 | `llms.txt` | pandit, palmmitra [R02, R04] | Facts read from the same config file as the pages | P1 |
| 15 | One illustration system for all diagrams | palmreading.pro blog thumbnails [R06] | Our line colours, SVG files, marked as licensable | P1–P2 |
| 16 | Life-question structure: short answer, "what this doesn't mean", "what it can't tell you", ways to get an answer | pandit `/questions/*` [R07] | Folded into the honest guides (marriage, children, is-palmistry-real). No separate question URLs. [rec] | P2 |
| 17 | "What do you want to know?" question box | palmly [R06] | Only as chips that order our 4 real parts. If the chosen part is preview-only on the web, say so **before** the scan; a chip that leads to a locked part would be bait [rec]. | P2, test first |
| 18 | Festival banner with a local-language line | palmmitra Diwali card [R07] | Karva Chauth, Diwali and wedding season, linking to guides and compare-hands in the app. Real Devanagari. No deadlines. | P3 |
| 19 | Question-led footer link map | pandit mega-footer [R07] | Bilingual, 48 px rows, accordions on mobile | P1 |
| 20 | "No photo? Try a sample" | remove.bg [R08] | "Try a sample hand" runs the full viewer on a stored real result, with no upload | P1 |

### 2.5 Never do (each item was seen at a competitor)

**Fake proof and pressure**
- Fake live activity: "viewing now" counters and "User from Pune just downloaded" toasts [R04, R07].
- Fake deadlines: resetting countdowns and "120+ readings this week" badges [R02, R07].
- Struck-through "was" prices and decoy tiers [R02, R05].
- Made-up or unverifiable numbers, for example [R01, R04, R05]:
  - "100K+ downloads" when Play shows 10K+;
  - "50,000+" or "120,000" readings;
  - "As Seen On" logos with no links.
- Testimonials with stock or AI avatars, "Verified" badges, "prediction came true" stories, or labelled "Illustrative" [R02, R03, R05].
- AI personas presented as humans with ratings, or wording like "professional palm reading agent" [R01, R05].

**False claims**
- Dated or health predictions anywhere: in hero art, samples or locked teasers ("2026 growth", "a season of depletion", "Vitality Index") [R02, R05, R07].
- Superlatives and pseudo-science: "World's 1st", "NASA data", "trained on 1,000+ texts", "never misses a line", "scientific accuracy" [R02, R03, R04].
- "Free" in titles for paid or app-only features, hidden prices, or surprise paywalls in some regions [R03, R04].
- An email wall before the first result while saying "no sign-up" [R02, R07].
- Privacy copy that contradicts the real data flow or the site's own scripts [R02, R03, R05].
- Decorative Indian-ness (ॐ and Sanskrit in Latin letters) on a site that has no Devanagari [R07].

**Layout and speed**
- Hiding the upload action on mobile (below art, under tab bars or chat bubbles), two primary buttons in the hero, or leading with the paid path [R06].
- Fixed bars taking more than 20% of the phone screen [R07].
- Low-contrast buttons and links: white on gold (1.7:1), white on orange (3.4:1), gold links on ivory (1.94:1) [R06, R07].
- Heavy media: multi-MB PNGs, autoplay hero video, 90+ looping animations, or scroll-reveal that leaves content invisible when JS fails [R07].

**Technical basics**
- Client-only rendering, homepage metadata on every URL, soft 404s, identical OG tags on every page, leftover template OG images [R01–R05].
- Letting a certificate expire or pages return 500 errors [R05].

---

## 3. Positioning and the "wow"

### 3.1 Positioning line

"The palm-reading site that shows its work: your real lines traced on your own photo, read in Hindi or English, with the source behind each meaning and a plain list of what palmistry can't tell you." [R03 §10, R08 §1, R10 §0]

### 3.2 Differentiators

| Differentiator | How the page proves it | Competitor gap | Evidence |
|---|---|---|---|
| Real tracing on the user's photo | The hero sample is our model's real output on a consented photo. The reveal draws the user's own lines. A line that isn't clear is shown dashed as "not clearly seen" and is never guessed. | All 5 draw fixed lines, AI sketches, or nothing | R01–R05, R08 §3 |
| Real Hindi | Devanagari pages under `/hi/` with hreflang, Hindi errors and buttons, and a Tiro Devanagari headline | None has indexed Devanagari pages | R01–R05, R11 §4.1 |
| Honesty as a feature | A "What palmistry can't tell you" box on every reading and guide. A "What's free" box before the scan. No predictions and no fake proof. | All 5 use fake counters, timers or prices, or dated predictions | R10 §4–5 |
| Sources | The classical source under each meaning (the app already stores a source per rule) | Competitors cite nothing, or only Wikipedia and Britannica | R03 §6, R09 §3.3, R11 §2 |
| A real app, with the real price | A store button that knows the device, with the size and price next to it | Only pandit promotes an app, and it hides its prices. palmist never links its app. | R01, R04, R10 §7.4 |
| Fast, static, shareable | Every page is its own HTML with its own title and OG image, so WhatsApp previews are correct | palmmitra and pandit preview every link as the homepage | R02 §7, R04 §7 |

### 3.3 The exact hero promise

Numbers such as "2 free readings" come from config and must match the server (§4.7).

| Element | English (`/`) | Hindi (`/hi/`) | Source |
|---|---|---|---|
| `<title>` | Free AI Palm Reading Online – See Your Lines on Your Photo | फ्री हस्तरेखा स्कैनर ऑनलाइन \| Hast Rekha Scanner | R11 §2.1, §4.2 |
| Meta description | Upload or snap a palm photo and see your heart, head, life and fate lines traced on your own hand. First reading free, no email. No fake predictions. | हथेली की एक फ़ोटो डालें और उस पर अपनी हृदय, मस्तिष्क, जीवन और भाग्य रेखा देखें। पहली रीडिंग मुफ़्त, बिना साइन-अप। हिंदी और English में। | R11 §2.1, R10 §3.1 |
| H1 | Free AI palm reading — see your own lines traced on your photo | मुफ़्त AI हस्तरेखा रीडिंग — अपनी फ़ोटो पर अपनी असली रेखाएं देखें | R10 §3.2 and R11 §2.1 merged [rec] |
| Sub-line | Take one photo of your palm. We trace your heart, head, life and fate lines and show what palmistry says about them. | हथेली की एक फ़ोटो लें। हम आपकी हृदय, मस्तिष्क, जीवन और भाग्य रेखा बनाकर दिखाते हैं कि हस्तरेखा उनके बारे में क्या कहती है। | [rec] |
| Gold button (phone) | Take a palm photo | हथेली की फ़ोटो लें | R08 §7 |
| Gold button (desktop) | Upload a palm photo | हथेली की फ़ोटो डालें | R08 §7 |
| Second option | Choose from gallery | गैलरी से चुनें | R08 §7 |
| Chips | First reading free · No sign-up · No payment on this site | पहली रीडिंग मुफ़्त · साइन-अप नहीं · इस साइट पर कोई पेमेंट नहीं | R10 §3.2, §4 |
| "Free" qualifier (inside the card, readable contrast) | 2 free readings on this site. The full reading is in our Android app (paid). | इस साइट पर 2 रीडिंग मुफ़्त। पूरी रीडिंग हमारे Android ऐप में है (पैसे वाली)। | India's rules against "drip pricing" [R10 §5.3] |
| Privacy line | We analyse your photo and don't store it on any server. A copy stays on this device. *What happens to my photo?* | हम आपकी फ़ोटो जांचते हैं, पर किसी सर्वर पर सेव नहीं करते। एक कॉपी सिर्फ़ इसी डिवाइस पर रहती है। *मेरी फ़ोटो का क्या होता है?* | R09 §3.7 [verify that both providers keep nothing] |
| Sample label | A real photo, traced by Palm Read AI. Your reading is made from your own photo. | असली फ़ोटो, जिस पर रेखाएं Palm Read AI ने बनाई हैं। आपकी रीडिंग आपकी अपनी फ़ोटो से बनेगी। | R08 §6, R07 WOW 12 |

The chips are separate pill elements. On screen the "·" does not appear as a text separator (R08 bans "A · B · C" strings).

### 3.4 Wow moments (honest and fast) [R08 §8]

1. **The hero palm traces itself.**
   - A real sample photo (AVIF, about 45 KB).
   - One gold beam passes over it.
   - The four lines draw in (life, head, heart, fate), then their labels appear.
   - The paths are our model's actual output on that photo.
   - Cost: about 5 KB of SVG and CSS, no JavaScript.
2. **The same moment on your palm.** The lines draw onto the user's photo as soon as the real scan returns. A missing line becomes a dashed chip saying "not clearly seen".
3. **"Try a sample hand."** The full viewer runs on a stored real result with no upload, for desktop users and people who don't want to share a photo.
4. **Interactive palm map** on `/hand-lines/`. Tap a line or mount to see its meaning and a link to its guide.
5. **Photo checker.** Instant ticks on the phone: "Bright enough", "Sharp", "Whole palm".
6. **Bilingual headline.** The same hero, set large in Tiro Devanagari on `/hi/`.
7. **WhatsApp share card**, drawn on the user's traced photo on their own device.

Not doing: 3D hands, WebGL, particles, Lottie, autoplay video, parallax, glass tilt or scroll-jacking. They are slow on budget Android phones, and none of them is evidence [R08 §8].

---

## 4. User psychology

### 4.1 Personas [R10 §2]

These are built from market data, competitor reviews and search patterns. No interviews were run, so check them against real visitors after launch.

| Persona | Who and device | Trigger and typical searches | Main fear | What earns trust | Leaves when | Converts through |
|---|---|---|---|---|---|---|
| **A. Sunita**, 34, Hindi-first, Tier-2 town | ₹8–10k Android, Jio 4G, voice search in Hindi | A WhatsApp reel or a family wedding. "हाथ की रेखा देखना", "shadi ki rekha kaise dekhe" | Money being taken, her photo misused, English forms | Hindi on every screen, big buttons, "no payment on this site", seeing her own lines | An English-only step, a slow page, a password, a scary line | Free Hindi reading → the app in Hindi |
| **B. Priya**, 27, urban, English | Mid-range Android, 5G | A reel, a friend's share card, a breakup or job change. "ai palm reading online free", "M on palm meaning" | Data sold, spam, cringe upsells, generic text | Clean design, a real sample, "a tradition, not a science", a premium share card | Fake timers, forced sign-up, vague text | Share card → second reading → app |
| **C. Jessica**, 31, US | iPhone (60.7% of US mobile traffic is iOS) | "palm reading online", "free palm reading scanner upload picture" | "$1 trial, then $42 subscription" traps, card requests | No card, no sign-up, "for fun and reflection" | Any card field | Web readings and guides, with an honest "no iPhone app yet" |
| **D. Rahul**, 29, skeptic | Android | "is palmistry real", "can AI read palms" | The same text for everyone | An honest page, lines exactly on the photo, "not clear" states, sources, the other-hand test | "100% accurate", "NASA", fake reviews | `/is-palmistry-real/` → reading → other hand |
| **E. Neha**, 26, anxious | Android, late at night | "shadi kab hogi hath ki rekha", "divorce line", "short life line" | Getting a verdict; fear-based selling | A calm first line, no dates, something she can do | She gets scared, or we "predict" | Honest guides → reading |
| **F. Anjali**, 45, returning learner | Android + family laptop | "how to read palm lines", "hast rekha gyan pdf" | Thin or wrong content | Diagrams, Hindi names, sources, a quiz | She feels talked down to | PDF opt-in, quiz, the app's lessons and compare-hands |

### 4.2 Funnel stages: mindset, risk, design answer, copy [R10 §3, corrected with R09]

| # | Stage | Mindset | Main risk | Design answer |
|---|---|---|---|---|
| 1 | Search result or WhatsApp preview | "Free? In Hindi? Will it really read *my* hand, or is it a money trick?" | A "free" title that later asks for money; a wrong preview that looks like spam | The title and snippet say exactly what is free; every page has its own OG image |
| 2 | Landing (the first 5 seconds) | "Is it real, free, in my language? What will I get?" | A cluttered hero, a competing store badge, English only, a slow hero image | One H1 and one gold button; the traced real sample; 3 true chips; the हिंदी/English switch; hero image 45–90 KB; no video |
| 3 | First scroll | "Show me an example. What's the catch?" | Hidden terms create suspicion | In order: the sample (meaning first), the 3 steps, the **What's free** box, "Why free?", the honesty box |
| 4 | Upload decision (the biggest fear) | "Where does my hand photo go? It's like a fingerprint. Will my photo work?" | Privacy fear, failure, a blocked camera, uploads failing in the WhatsApp or Instagram browser | Privacy line and "What happens to my photo?" at the button; 3 picture chips; a hand choice with a default; a gallery option; an in-browser check before sending (a failed check costs nothing) |
| 5 | Waiting | "Is it stuck? Is it doing anything real?" | An unexplained wait; fake steps that a skeptic spots | Only real stages (§8.1); the lines draw in as soon as the scan returns; the measured p50; a way out after p90 |
| 6 | Reveal (the peak) | "Is this really about *me*?" | Generic text that could fit anyone (the Barnum effect) | Meaning and traced photo together; each meaning shows what we see on your line, what the tradition reads, and its source; "not clear" states; a self-check; a kind ending; "Try your other hand" |
| 7 | The lock (after reading 1) | "Ah, here's the catch." | Feeling baited | The lock is announced before the scan; the real first sentence; "2 of 4 parts"; main button "Read one more palm free — sign up"; tapping a locked part makes the app the main button in that sheet; a note says sign-up doesn't open this reading |
| 8 | Sign-up | "Now the spam starts. Another password?" | Forced accounts; unwanted contact | Email and a 6-digit code; no password or phone; say which emails we send; "delete account" one link away; Google later |
| 9 | Reading 2 | "Let me try the other hand." / "Will it say the same thing?" | Only finding out afterwards that it was the last one | Say "last" **before** the scan; the other-hand tip; a two-hands teaser afterwards (the full comparison is in the app) |
| 10 | No free readings left | "So it was a trap." | A dead end, guilt copy, a surprise price | Thanks; the 2 saved readings with "save as image"; one next step (the app) with its price; a free path to guides and tools; no guilt |
| 11 | Store-button click | "Will it fit? Is it the real app? Will it ask for money straight away?" | Surprise costs (the top reason people abandon, 40%) | A device-aware button with size and price under it; Google Play only, never an APK; the same visual as the Play listing |
| 12 | First app open | "Does it remember me?" | An unexpected new scan feels like bait | Say it on the website **before** install: a fresh photo in the app, and the same email |

**Copy for each stage.** `{p50}` and `{X}` come from config.

| # | English | Hindi |
|---|---|---|
| 1–2 | Title, meta description, H1 and chips: see §3.3 | §3.3 |
| 3 | "Why free? So you can see it work on your own palm first. The full reading lives in our app — that's how we pay our bills." | "मुफ़्त क्यों? ताकि आप पहले अपनी हथेली पर खुद देख लें कि यह काम करता है। पूरी रीडिंग हमारे ऐप में है — उसी से हमारा ख़र्च चलता है।" |
| 3 | **What's free box:** "On this website: 2 free readings — 1 now, 1 more after a free sign-up (a new reading, for example your other hand). Each shows Love and Personality in full, plus the first sentence of Career & Money and Life Direction. The full reading is in our Android app: free to install, full readings are paid (packs from ₹{price})." | "इस वेबसाइट पर 2 रीडिंग मुफ़्त — 1 अभी, और 1 मुफ़्त साइन-अप के बाद (नई रीडिंग, जैसे आपका दूसरा हाथ)। हर रीडिंग में प्यार और स्वभाव पूरा, और करियर-पैसा व जीवन की दिशा का पहला वाक्य। पूरी रीडिंग हमारे Android ऐप में है: ऐप मुफ़्त, पूरी रीडिंग पैसे वाली (पैक ₹{price} से)।" |
| 3 | "Palmistry is an old tradition, not a science. We show what the tradition says about your lines — not your future." | "हस्तरेखा एक पुरानी परंपरा है, विज्ञान नहीं। हम बताते हैं कि परंपरा आपकी रेखाओं के बारे में क्या कहती है — आपका भविष्य नहीं।" |
| 4 | Tips: "Open palm / Good light / Whole hand in the frame" | "खुली हथेली / अच्छी रोशनी / पूरा हाथ फ़्रेम में" |
| 4 | "Which hand? Most people start with the hand they write with." | "कौन सा हाथ? ज़्यादातर लोग उस हाथ से शुरू करते हैं जिससे लिखते हैं।" |
| 4 | "Your phone may ask to allow the camera. We only take one photo of your palm." | "फ़ोन कैमरे की अनुमति मांग सकता है। हम सिर्फ़ आपकी हथेली की एक फ़ोटो लेते हैं।" |
| 4 | "Too dark — move near a window or turn on a light." | "फ़ोटो में अंधेरा है — खिड़की के पास जाएं या लाइट जलाएं।" |
| 4 | "A little blurry — hold the phone still for a second." | "फ़ोटो थोड़ी धुंधली है — एक सेकंड फ़ोन स्थिर रखें।" |
| 4 | "Mehndi or ink can hide lines. If a line isn't clear, we'll tell you instead of guessing." | "मेहंदी या स्याही से रेखाएं छिप सकती हैं। कोई रेखा साफ़ न दिखे तो हम अंदाज़ा नहीं लगाएंगे, आपको बता देंगे।" |
| 5 | "Usually about {p50} seconds." | "आमतौर पर लगभग {p50} सेकंड।" |
| 5 | "Taking longer than usual — your internet may be slow. You can wait, or try again." | "आज थोड़ा ज़्यादा समय लग रहा है — शायद इंटरनेट धीमा है। रुकें, या दोबारा कोशिश करें।" |
| 5 | Only once the idempotency key is verified: "Trying again won't use a free reading." | "दोबारा कोशिश से मुफ़्त रीडिंग ख़र्च नहीं होगी।" |
| 6 | "Your heart line curves up toward your first finger (the pink line). In palmistry this is read as warm, open-hearted love." | "आपकी हृदय रेखा ऊपर तर्जनी उंगली की ओर मुड़ती है (गुलाबी रेखा)। हस्तरेखा में इसे खुले दिल और गर्मजोशी वाले प्यार का संकेत माना जाता है।" |
| 6 | "Look at your own hand now — can you see this curve?" | "अब अपना हाथ देखिए — क्या आपको यह मोड़ दिख रहा है?" |
| 6 | "Your fate line isn't clear in this photo. We didn't guess." | "इस फ़ोटो में आपकी भाग्य रेखा साफ़ नहीं दिखी। हमने अंदाज़ा नहीं लगाया।" |
| 7 | "You've read 2 of 4 parts." | "आपने 4 में से 2 हिस्से पढ़ लिए।" |
| 7 | "Signing up gives you a new reading. It doesn't open the locked parts of this one." | "साइन-अप करने से एक नई रीडिंग मिलती है। इस रीडिंग के बंद हिस्से नहीं खुलते।" |
| 8 | "Get 1 more free reading — sign up with your email. We'll email you a 6-digit code. No password needed." | "एक और मुफ़्त रीडिंग पाएं — अपने ईमेल से साइन-अप करें। हम आपको 6 अंकों का कोड ईमेल करेंगे। कोई पासवर्ड नहीं चाहिए।" |
| 8 | "We only email you about your account." / "Delete your account anytime on the Account page." | "हम आपको सिर्फ़ आपके अकाउंट से जुड़े ईमेल भेजेंगे।" / "अपना अकाउंट कभी भी Account पेज पर जाकर हटा सकते हैं।" |
| 9 | "This is your 2nd and last free reading on this website." | "यह वेबसाइट पर आपकी दूसरी और आख़िरी मुफ़्त रीडिंग है।" |
| 9 | "Many palm readers say the hand you don't write with shows what you were born with, and your writing hand shows what you've made of it." | "कई हस्तरेखा जानकार मानते हैं कि जिस हाथ से आप नहीं लिखते, वह जन्म का स्वभाव दिखाता है, और लिखने वाला हाथ बताता है कि आपने उसे कैसे जिया।" |
| 10 | "You've used both free web readings. Your 2 readings are saved in this browser — clearing browser data removes them. Save them as images to keep." | "आपने वेबसाइट की दोनों मुफ़्त रीडिंग इस्तेमाल कर लीं। आपकी 2 रीडिंग इसी ब्राउज़र में सेव हैं — ब्राउज़र का डेटा साफ़ करने पर ये हट जाएंगी। रखना चाहें तो इमेज के रूप में सेव कर लें।" |
| 10 | **App card:** "Want the full reading? The Android app has all 4 parts, lessons and compare-your-hands. Free to install. Full readings: one-time packs from ₹{price}, or a plan you can cancel anytime in Google Play." (List only the features verified in §4.7.) | "पूरी रीडिंग चाहिए? Android ऐप में चारों हिस्से, सीखने के पाठ और दोनों हाथों की तुलना। ऐप डाउनलोड मुफ़्त। पूरी रीडिंग: ₹{price} से एक-बार वाले पैक, या ऐसा प्लान जिसे Google Play में कभी भी बंद कर सकते हैं।" |
| 10 | "Not now? Keep learning free — guides and tools." | "अभी नहीं? मुफ़्त में सीखते रहें — गाइड और टूल।" |
| 11 | "Free download · about {X} MB · optional paid readings · no ads" | "मुफ़्त डाउनलोड · लगभग {X} MB · पैसे वाली रीडिंग आपकी मर्ज़ी से · कोई विज्ञापन नहीं" |
| 11 | "Only from Google Play — never an APK file." | "सिर्फ़ Google Play से — कोई APK फ़ाइल नहीं।" |
| 12 | "In the app you'll take a fresh photo — it takes about a minute. Your web readings stay in this browser." | "ऐप में एक नई फ़ोटो लेनी होगी — करीब एक मिनट लगता है। वेबसाइट की रीडिंग इसी ब्राउज़र में रहेंगी।" |
| — | The iPhone note: see §4.3 | §4.3 |

### 4.3 Fears and the trust mechanics that remove them

Every mechanic must be true on launch day. If one isn't, change the product or drop the claim [R10 §4].

| Fear | What we show | Where | Wording | Must be true |
|---|---|---|---|---|
| Palm photo privacy ("it's like a fingerprint") | The privacy line at upload; the "What happens to my photo?" panel (§8.5); EXIF data removed; no photo in a share card unless the user chooses it | Upload point, reading page, footer, privacy page | §3.3 and §8.5 | The photo goes through two processors and neither stores it [verify]; line points are stored and we say so |
| "Is this a scam? Will I be charged?" | "No payment on this site." Company name, real contact and grievance contact in the footer. No card or UPI field anywhere. | Hero chip, footer, lock, zero-readings screen | "We never ask for card or UPI on this website." / "इस वेबसाइट पर हम कभी कार्ड या UPI नहीं मांगते।" | No payments on the web |
| Hidden subscriptions (the top complaint in 1–3★ competitor reviews [R10 §4]) | The app's price next to every store button: packs are one-time; plans auto-renew; the trial length; how to cancel in Google Play | Store buttons, `/app/`, zero-readings screen | "Packs are one-time. Plans renew until you cancel in Google Play — we remind you before a trial ends." / "पैक एक बार के होते हैं। प्लान तब तक चलते हैं जब तक आप Google Play में बंद न करें — ट्रायल ख़त्म होने से पहले हम याद दिलाते हैं।" | Prices from config that follows Play; the app's trial reminder works [verify on a phone] |
| Spam after giving an email | Exact list of emails we send; any marketing opt-in unticked; no phone number; delete account | Sign-up sheet | §4.2 stage 8 | We send only account email until an opt-in system exists |
| Scary predictions | "What palmistry can't tell you" box; no dates, ages or outcomes; a calm first line (§4.5) | Reading, all guides | "No line on your palm can tell how long you'll live, whether you'll marry, or whether you'll have children." / "हथेली की कोई रेखा यह नहीं बता सकती कि आप कितना जिएंगे, शादी होगी या नहीं, या संतान होगी या नहीं।" | The report has no health section (already true) |
| Being judged for how the hand looks | Never comment on how a hand looks. No warning colours for "bad" lines. Readings are private by default. | Upload tips, reading, share sheet | "Every hand is readable — rough hands, scars and mehndi are fine. We only look at the lines." / "हर हाथ पढ़ा जा सकता है — खुरदरे हाथ, निशान या मेहंदी, कोई बात नहीं। हम सिर्फ़ रेखाएं देखते हैं।" | The report writer uses no words about appearance |
| Data sold | "We don't sell your data. No ads, ever." The privacy page names every processor. No ad pixels. | Footer, privacy page, sign-up | "We don't sell your data, and there are no ads — ever." / "हम आपका डेटा नहीं बेचते, और कोई विज्ञापन नहीं — कभी नहीं।" | DEC-011 (no ads); the analytics list matches the policy |
| Fake AI ("same text for everyone") | Lines on their photo; an evidence sentence and a source per meaning; "not clear" states; "Try your other hand"; a `/how-it-works/` page | Reveal, second-reading hook, `/how-it-works/` | "Our AI finds and traces your lines. The meanings come from classical palmistry books — the source is under each one." / "हमारा AI आपकी रेखाएं ढूंढकर बनाता है। उनके अर्थ पुरानी हस्तरेखा किताबों से हैं — हर अर्थ के नीचे किताब का नाम है।" | A source per rule exists (FEAT-009) |
| "I'll make a mistake", or language fear | Hindi everywhere, including errors; icons always with words; retry everywhere; a failed photo costs nothing | Whole flow | "Nothing can go wrong — you can always try again." / "कुछ ग़लत नहीं होगा — आप कभी भी दोबारा कोशिश कर सकते हैं।" | Retry doesn't use up a reading [verify] |
| "No iPhone app?" (US: 60.7% of phones are iPhones) | An honest note at app moments only; no App Store badge | Lock sheet, zero-readings screen, `/app/` | "The iPhone app isn't ready yet. You can keep using the website — guides and tools are free." / "iPhone ऐप अभी तैयार नहीं है। आप वेबसाइट इस्तेमाल करते रहें — गाइड और टूल मुफ़्त हैं।" | No iOS app exists |

**Trust basics on every page:**
- company name, contact and grievance contact;
- privacy, terms and delete-account pages;
- the age rule ("readings are for people 18+", as DPDP requires parental consent for under-18s; palmmitra's 13+ is a risk [R02]);
- a "last reviewed" date on every guide.

### 4.4 Honest motivation levers [R10 §5.1–5.2]

| Lever | How we use it (true version) | Never |
|---|---|---|
| Real scarcity | "2 free readings on the website", with a real counter: "1 of 2 used" / "2 में से 1 इस्तेमाल हुई" | Timers, "only 3 left today", "offer ends" |
| Curiosity gap | The real first sentence of each locked part | Blurred fake text, "██" teasers |
| Goal gradient | "2 of 4 parts read", and pipeline steps that tick when they really finish | Progress bars on a timer |
| Endowed progress | Only progress the user really made ("Photo checked", "Lines found") | "You're 80% done" bonuses |
| Personal, checkable statements | Each meaning names the visible feature it comes from, plus "check it on your hand" | Vague lines that fit anyone |
| Reciprocity | A useful free reading, "save as image", free guides and tools, the PDF | Gifts that need payment details |
| Authority, honestly | A classical source under each meaning; a named author and reviewer | "Trained on 1,000+ texts", "NASA", "world's first" |
| Social proof, only when real | The live Play rating with its count and a link, once it reaches 4.0★ with 100+ ratings [rec]; real totals, rounded down and dated | Hard-coded counts, "viewing now", "Illustrative" testimonials |
| Identity and sharing | A share card on the user's own traced lines, with a preview and no name by default | Public indexable reading pages |
| Real seasons | Content tied to Karva Chauth, wedding season, Valentine's | Deadlines tied to those events |

Loss framing is allowed only for true, useful facts, such as "saved in this browser only" or "this is your last free web reading". "Don't miss your destiny" is never allowed.

### 4.5 Bad-news lines: tone rules [R10 §6]

1. Answer the fear calmly in the first sentence.
2. Normalise: "This is very common."
3. Attribute, never predict: "Palmistry books read this as…" / "परंपरा में इसे … माना जाता है". Never "you will".
4. Never give dates, ages, lifespan, illness, divorce, number of children or money amounts.
5. Name a scary folk reading only to take it apart ("Some books call this a divorce sign. It can't tell that.").
6. When true, give the photo explanation: light, a crease or the crop can make a line look broken or short.
7. End with agency: something the person controls.
8. Always include the "What palmistry can't tell you" box.
9. Sell no remedies: no gems, pujas or mantras.
10. Keep it visually calm. A line keeps its normal colour whether its reading sounds "good" or "bad". No red highlights and no warning icons.
11. In Hindi, use the warm "आप" and everyday words.
12. On lifespan and death-anxiety guides only, add a small care line at the end: Tele-MANAS **14416** in India, **988** in the US.

**The three-part block for every sensitive meaning:**
1. What we see.
2. What the tradition says, attributed.
3. What it can't tell you, and what you can do.

**Examples:**
- **Short life line (EN):** "Your life line looks short in this photo. That's very common — and in palmistry, the life line's length is **not** read as how long you'll live. Traditionally it's linked to your energy and how you handle big changes. A line can also look short when the photo crops it or the light is flat. *Palmistry can't tell your lifespan or your health — for health, talk to a doctor.*"
- **Short life line (HI):** "इस फ़ोटो में आपकी जीवन रेखा छोटी दिख रही है। ऐसा बहुत लोगों में होता है — और हस्तरेखा में जीवन रेखा की लंबाई से उम्र **नहीं** आंकी जाती। परंपरा में इसे आपकी ऊर्जा और बड़े बदलावों को संभालने के तरीके से जोड़ा जाता है। फ़ोटो में रेखा कट जाए या रोशनी कम हो, तब भी रेखा छोटी दिख सकती है। *हस्तरेखा उम्र या सेहत नहीं बता सकती — सेहत के लिए डॉक्टर से बात करें।*"
- **"Divorce line" (EN):** "Some books call a broken or forked marriage line a 'divorce sign'. Many palm readers today don't read it that way — the small lines under your little finger can't tell anyone's future in a marriage. Traditionally a break is read as a phase that needs attention: talking, time, a change. A relationship depends on the two people in it, not on a line."
- **Other examples:** broken life line, "when will I marry", children lines, island, faint line and the care line are in R10 §6.4. Copy them as written.

**Words**

| Use (EN) | Use (HI) | Never (EN) | Never (HI) |
|---|---|---|---|
| tradition says, is read as | परंपरा में माना जाता है | you will, destined, guaranteed | आपके साथ होगा, तय है, पक्का |
| tendency, style, phase | झुकाव, स्वभाव, दौर | danger, warning, bad sign | ख़तरा, चेतावनी, बुरा संकेत |
| change of direction | दिशा में बदलाव | death, early death, short life | मृत्यु, अकाल मृत्यु, कम उम्र |
| not clear in this photo | इस फ़ोटो में साफ़ नहीं | divorce is certain | तलाक तय |
| self-reflection | खुद को समझना | accurate, 100%, scientific | सटीक, 100%, वैज्ञानिक |
| — | — | dosha, inauspicious, remedy for sale; hurry, last chance | दोष, अशुभ, उपाय; जल्दी करें, आख़िरी मौका |

"आख़िरी मुफ़्त रीडिंग" (last free reading) is allowed because it is a plain fact.

### 4.6 Dark patterns we will never ship

**India: the CCPA's *Guidelines for Prevention and Regulation of Dark Patterns, 2023*** [R10 §5.3]. They cover websites and apps. A misleading ad can bring up to 2 years in jail and a ₹10 lakh fine for a first offence (Consumer Protection Act s.89).

| # | CCPA pattern | What it would look like here | Our rule |
|---|---|---|---|
| 1 | False urgency, including false popularity | Timers, "120 people reading now" | Never. Real, dated numbers only, or none. |
| 2 | Basket sneaking | The app adding a plan to a pack purchase | Never pre-add anything |
| 3 | Confirm shaming | "No thanks, I don't care about my love life" | A plain "Not now" / "अभी नहीं" |
| 4 | Forced action | Email before the first reading; phone number; app install needed to see free content | The first reading needs nothing; the second needs only an email |
| 5 | Subscription trap | An app trial without clear cancel steps | The website explains "cancel in Google Play"; the app keeps its trial reminder |
| 6 | Interface interference | A huge "Install" next to a tiny grey "Continue on web" | Secondary options stay readable (AA contrast, 48 px targets) |
| 7 | Bait and switch | Implying sign-up opens the locked parts | Copy says exactly what sign-up gives (§4.2, stage 7) |
| 8 | **Drip pricing**, including "free" without saying that continued use needs a purchase | "Free palm reading", with the paid app revealed only at the end | The "free" qualifier in the hero, the "What's free" box, and the price next to every store button |
| 9 | Disguised ads | Sponsored posts styled as guides | None; anything sponsored is labelled |
| 10 | Nagging | Install banners on every page view | At most one small banner, dismissible, hidden for 30 days after dismissal [rec]. Never an interstitial. |
| 11 | Trick questions | "Uncheck to not stop receiving tips" | Positive, single-meaning wording; opt-ins unticked |
| 12 | SaaS billing | Silent renewals | The app keeps its renewal line and trial reminder (DEC-038/044) |
| 13 | Rogue malware | APK downloads, scareware | Google Play links only |

**Also in India:**
- ASCI's guidelines on deceptive design in ads;
- DPDP 2023: a plain itemised notice, withdrawal as easy as consent (s.6(4)), and parental consent for under-18s.

**United States:**
- the FTC Act §5;
- the FTC rule on fake reviews and testimonials (16 CFR 465, in force since 21 Oct 2024, up to about $51,744 per violation);
- the FTC's 2022 dark-patterns report;
- ROSCA and state auto-renewal laws (the federal "click-to-cancel" rule was struck down on 8 July 2025, but easy cancel remains our rule);
- CAN-SPAM for any marketing email.

**Google:**
- Play's rules on misleading claims (a palm app was rejected for this), subscriptions, and ratings and reviews;
- Search guidance against intrusive interstitials, including app-install prompts.

### 4.7 Facts every page reads from one config file [R10 §1, corrected by R09]

Pages must never type these numbers or claims directly. They read them from `site.ts` (static pages) or from the server (live values).

| Fact | Value today | Status |
|---|---|---|
| Free web readings | **Plan:** 1 as a guest, 1 after email, then 0. **Live database today: 2 guest + 2 after email (migration 0013).** The 1 + 1 rule needs migration 0016 (plus 0017 for locks and unlock) applied, and the email-code path has never been tested. | Blocked on S1. The reading screen reads `reading_balance()`. Static copy comes from config, and a build check compares it with the server [rec]. |
| What a free reading shows | Love and personality in full. Career & money and life direction show their first sentence (`lockSynthesis`, DEC-038). | App fact [R09 §3.5] |
| What sign-up gives | A new reading. It does not open reading 1's locked parts. | owner, R10 §3.7 |
| Payments on the web | None | owner |
| Photo path | 1. The browser shrinks the photo, and re-encoding removes EXIF data including GPS. 2. A 1,080 px copy goes to `scan-palm` → Modal (USA), which traces the lines. 3. A 768 px copy goes to `extract-palm` → Cloudflare Workers AI. 4. Both go through `api.<domain>`. The app's code says the photo is "not stored anywhere". | R09 §3.6–3.7. [verify] that Modal and Workers AI keep no copies or logs |
| What *is* stored on the server | Traced line points (up to 100 per line), 21 hand landmarks, the written observation, the report and its rule IDs, and session details. Stored in Supabase under the guest or email user until deleted. | R09 §3.7 |
| Where web readings are shown from | This browser (IndexedDB), photo included. Not moved to the app. | R09 §3.6 |
| Free readings shared between web and app | Unknown. Guest readings belong to the browser's anonymous user. The email reading is tied to a one-way code of the email, kept even after deletion, so the same email in the app probably gets no second email reading. | [verify], then show only if true |
| App platforms | Android only; no iPhone app | owner |
| App prices | Packs: 4 for ₹199, 10 for ₹349, 25 for ₹749, 50 for ₹1,299 (one-time, never expire). Plans: ₹149/month, ₹299/month, or ₹999/year with a 3-day trial of 5 readings; they auto-renew and can be cancelled in Google Play. No ads. | R10 §1 (DEC-011/043/044). [verify] per country from Play before launch |
| App features, free vs paid | All 4 parts, lines on the photo, compare hands, lessons, quiz, PDF and share card, Hindi + English | [verify] which ones are free |
| App size | About {X} MB | [verify] |
| Reading time | Measured p50 only | [verify] on the web build, on a low-end phone |
| Play rating shown | Only at 4.0★ or more with 100+ ratings | [rec] R10 §5.1 |
| Age rule | 18+ | [verify] against the app's terms |

---

## 5. Design system

### 5.1 Direction

**Recommended: A — "Nakshatra Night, Web edition"** [R08 §5]. Why:
- It is the same brand as the app. A visitor who taps "Get the app" lands somewhere that looks like where they came from, which lifts Play conversion and removes "is this the same company?" doubt.
- Gold on deep indigo reads as temple and jewellery gold: auspicious and premium, unlike the saffron-and-yellow marketplace look of Astrotalk and AstroSage.
- It adds zero new fonts compared with the app.
- Dark pages are a little cheaper on AMOLED phones.

From the other two directions we borrow B's editorial discipline for the light "Day" reading theme, and C's single signature moment: the scan beam, not the glass.

**Alternatives:**
- **B, "Rekha Ink".** Editorial and light-first: Eczar + IBM Plex Sans Devanagari, indigo ink and a turmeric-coloured trace line.
  - For: calm and credible for US readers.
  - Against: it looks like a different company from the app, sits close to Co-Star's look, and adds 2 new fonts.
- **C, "Chandni Glass".** Plum-violet, aurora teal, frosted glass, Anek Devanagari.
  - For: the biggest "wow" in a desktop demo.
  - Against: it is the generic astrology look, it breaks the app's "no blur" rule (DEC-029), and it drops frames on budget Android phones.

**Design rules taken from Anthropic's frontend-design guidance** [R08 §1]:
- The hero is the most characteristic thing of our subject: a real hand with its lines traced. No stars, zodiac wheels or stats row.
- One boldness per page, and one orchestrated motion.
- No single gold keyword in headlines, no tracked-caps eyebrows, no "A · B · C" text strings, and no "→" on buttons. (R06 suggested a gold keyword; R08 rejects it as a template tell.)
- Sentence case. Buttons say what happens ("Read my palm", not "Submit").

### 5.2 Colour: dark theme (default) [R08 §3–4A]

Contrast values are WCAG 2.x ratios. AA needs 4.5 for body text and 3.0 for large text and UI.

| Token | Hex | Role | Contrast pairs |
|---|---|---|---|
| page | `#0B0A1F` | Page background | ivory 17.1, muted 10.4, faint 5.9 (captions only) |
| surface1 | `#15132F` | Cards, header, footer | ivory 15.8, muted 9.7, faint 5.5 |
| surface2 | `#1E1B42` | Inputs, raised items | ivory 14.3, muted 8.7, faint 4.9 (keep faint text off surface3) |
| surface3 | `#2A2654` | Tracks, disabled states | — |
| border / borderStrong | `#2A2654` / `#3A3570` | Dividers | — |
| edge | `rgba(246,240,225,0.08)` | Soft 1 px edge on content cards | — |
| hairline | `rgba(230,184,92,0.32)` | The one gold frame per screen (hero palm or upload card) | — |
| text / textMuted / textFaint | `#F6F0E1` / `#C3B9D8` / `#8F88B5` | Text | see page row |
| accent (gold) | `#E6B85C` | Gold text, links, icons on dark | 10.6 on page |
| accentBright / accentPressed | `#F5D98B` / `#CFA049` | Gradient stops, pressed state | — |
| Gold button | Gradient `#F5D98B → #E6B85C → #CFA049`, label `#1F1300` | The one filled action per screen state | 13.2 / 9.9 / 7.6 (passes at every stop) |
| success / warning / danger | `#2BB3A3` / `#FFC857` / `#FF6B6B` | Status, always with an icon | — |
| Hero gradient | `#221A4E → #15132F` | The one framed brand moment | — |
| Focus ring | 2 px `#F5D98B` + 2 px gap in the page colour | Every control | — |

### 5.3 Colour: "Day" theme (for guides, blog and print)

| Token | Hex | Contrast |
|---|---|---|
| paper | `#F7F5FC` (cool lavender-white, deliberately not cream) | ink `#17133D` 16.2 |
| card | `#FFFFFF` | ink 17.5; muted `#4B4574` 8.7 |
| raised | `#ECE8F7` | faint `#6A6492` 4.5 (captions only) |
| goldInk | `#7A5200` | Links and gold-as-text: 6.4 on paper |
| Brand gold | `#E6B85C` | Only 1.7 on paper, so on Day it is **only a fill**, with `#1F1300` text; never text or a thin line |

### 5.4 Line colours

| Line | Dark (app theme) | On page | Day version | On paper | Hindi |
|---|---|---|---|---|---|
| Life | `#F07A5A` | 7.1 | `#B5391A` | 5.5 | जीवन रेखा |
| Head | `#6EA8FF` | 8.1 | `#1F5BC4` | 5.8 | मस्तिष्क रेखा |
| Heart | `#F27BB0` | 7.6 | `#B02A6E` | 5.7 | हृदय रेखा |
| Fate | `#A993FF` | 7.7 | `#6440D0` | 6.1 | भाग्य रेखा |

Rules:
- Line colours are data colours. They are never used for UI chrome.
- Every traced line is drawn over a darker halo stroke (`#1A1440`, about 1.4× the line width). This keeps it readable on any skin tone. On the diagram palm (`#3A3078`), the life line is only 4.1:1 without the halo.
- The diagram palm gradient is `#3A3078 → #1D1850`.
- The logo keeps its own pink, cyan and green lines (`#FF7FA6`, `#5FD4FF`, `#6FE89A`) inside the logo only (decision D3) [R08 §3].

### 5.5 Fonts [R08 §3–4A, R09 §3.9]

| Use | Latin | Devanagari | Notes |
|---|---|---|---|
| Display (28 px and up only) | Cormorant Garamond 600/700 | Tiro Devanagari Hindi 400, upright | The app's two serifs. Cormorant's small x-height fails at body sizes. |
| Body and UI | Mukta 400/600/700 | Mukta (the same family; a Devanagari-first design by Ek Type) | Weights match across both scripts |
| Wordmark | Cinzel, only inside the logo SVG | — | No Cinzel web font and no tracked caps anywhere else |

Loading rules:
- Self-host all fonts through the Astro Fonts API, so there are no third-party font requests.
- Split files by `unicode-range`, so English pages never download Devanagari.
- Preload at most 2 WOFF2 files.
- Font budget: 120 KB or less on English pages, 180 KB or less on Hindi pages.
- Use `font-display: swap` with metric-matched fallbacks. The Android fallback for Devanagari is the system's Noto Sans Devanagari.
- Letter-spacing is 0 on anything that can show Devanagari, because tracking breaks the top line (shirorekha).
- Test mixed-script lines and digits. palmreading.pro's Cormorant turned digits in Japanese text into old-style figures [R06].
- Body digits are Latin (as people type). Devanagari numerals only for the decorative step numbers on `/hi/` [rec].

### 5.6 Type scale [R08 §4A]

Fluid (`clamp`), ratio 1.25 on mobile rising to 1.333 on desktop. Hindi is one step larger because Devanagari looks smaller at the same pixel size and needs room for vowel marks.

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

- Line length: at most 68 characters for English and about 60 for Hindi.
- Slight negative tracking (−0.01em) is allowed only on English display text (`:lang(en)`).

### 5.7 Spacing and layout

- **Spacing scale (4 pt base):** 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- **Side gutter:** 20 px on mobile (as in the app), 32 on tablet, 48 on desktop.
- **Section spacing:** 64 on mobile, 112 on desktop.
- **Content widths:** text 680 px, content 1,120 px, wide 1,280 px.
- No horizontal scroll at 390 px, and text can scale to 200%.

### 5.8 Corner radius

| Radius | Used for |
|---|---|
| 8 | Tags, progress |
| 12 | Inputs, the QR tile, small boxes |
| 20 | Cards |
| 28 | The one hero frame, the upload card, sheets |
| Pill | Buttons, chips, the language toggle |

Radius shows hierarchy, so not everything gets 20.

### 5.9 Depth and glass

- No box shadows. Depth comes from the three surface steps plus the 1 px ivory edge.
- Only the page's single hero gets the gold hairline.
- Glass is used only on floating layers: the sticky header once scrolled, the mobile bottom CTA bar, and the menu and language sheet. The glass is `rgba(21,19,47,0.88)` with a 1 px `rgba(246,240,225,0.14)` edge.
- `backdrop-filter: blur(12px)` is used only on screens 1,024 px or wider that have hover and pass an `@supports` check. It is off for `prefers-reduced-transparency`, and never on mobile, where it is the most expensive CSS effect on budget phone GPUs.
- Reading content is never on glass.

### 5.10 Icons

- Ionicons outline (MIT licence, the same set as the app), served as an inline SVG sprite of about 20 icons.
- 1.75 px stroke on a 24 px grid, round caps.
- A small custom set in the same stroke for the 4 lines, the mounts and the 4 hand shapes.
- No emoji as icons. The app's ❤️🧠⭐ line labels become line-colour dots.
- Icons always come with a text label.

### 5.11 Imagery

- **Real hands only:** varied Indian skin tones, men and women, daylight, a plain background, written consent. Never AI-generated hands; finger errors destroy trust and would contradict the "real tracing" claim.
- **Diagrams:** the app's stylised palm with the 4 line colours, served as SVG *files* so Google Images can index them.
- **The trace motif** appears only where it carries meaning: the hero sample, each guide's header (that line only), tool cards (a line glyph) and the share card.
- **Not used:** star fields, zodiac wheels, swirly dividers, stock "mystic" art.
- **Indian feel** comes from real Devanagari, not decorative ॐ [R07].

### 5.12 Motion

**The one orchestrated moment per page:**
1. A gold beam passes down the palm once (1.2 s, ease-out).
2. Each line draws in with `stroke-dashoffset` (0.9 s, staggered 150 ms: life, head, heart, fate).
3. The labels fade in.

**Everything else only responds to the user:**
- button press scales to 0.98;
- colour and opacity changes take 150–200 ms;
- sheets slide in over 240 ms.

**Rules:**
- No scroll-triggered entrances, parallax or looping background animation. The only loop is a soft ring pulse, shown only while the server is really working.
- With `prefers-reduced-motion: reduce`, the final state shows instantly and progress is given as text through `aria-live`.
- With `Save-Data` or `prefers-reduced-data`, skip the hero animation and serve the 480 px image.
- Animate only `transform`, `opacity` and `stroke-dashoffset`.
- Content is visible by default. Nothing depends on JavaScript to appear [R07 never-do 9].
- Traced lines must sit exactly on the photo. The owner rejected a misaligned, rushed scan animation before [R10 §8H].

### 5.13 Component inventory [R08 §7, adapted]

Every control has a hit area of at least 48 px, a visible focus ring and correctly language-tagged text.

| Component | Spec |
|---|---|
| Header | Logo on the left. On the right: the language control and a "Read my palm" **outline** button. No second gold button while the page's gold button is on screen. Turns into floating glass after 24 px of scroll. |
| Gold button | Pill, 52 px tall (48 minimum), gold gradient, `#1F1300` Mukta 700 at 17 px, sentence case, no arrow. **One per screen state.** Pressed: `#CFA049` and scale 0.98. When busy it keeps its label ("Reading your palm…") and shows a spinner. |
| Secondary / text button | surface2 fill with ivory text (14.3:1), or a gold text link underlined on hover and focus |
| Upload card | 28 radius, surface1, gold hairline (the page's one framed hero). **Phone:** at least 240 px tall, with "Take a palm photo" (`capture="environment"`) and "Choose from gallery". **Desktop:** drag and drop, paste, browse. 3 tip chips with tiny real thumbnails (good vs bad). The privacy line and the "free" qualifier. The "Try a sample hand" link sits just below the card (§7.1). |
| Capture review | The real photo, the real problem ("Too dark…"), and "Use this photo" / "Retake". A port of the app's `quality/review.ts`. |
| Hand choice | Left / Right as a segmented control, plus "Is this the hand you write with?" Defaults to the right hand. |
| Scan progress | One status block that shows the **real current stage** (§8.1) and one bar. No fake timers or checklists. The gold beam runs over the user's photo while the scan is really running. |
| Line-trace viewer | The user's photo, at most 45% of the screen height on mobile, with an SVG overlay in the photo's own coordinates. Line chips below (colour dot + Hindi/English name); tapping one highlights that line. A line that wasn't traced gets a dashed chip "not clearly seen" and is **never drawn**. Tapping the photo opens a full-screen, pinch-zoomable view. `figure` + `figcaption` lists the lines found, for screen readers. |
| At-a-glance card | Meaning first: 2–3 personal takeaways under the photo, before any line detail. The page's one gold-framed card. |
| Meaning block | "What the scan saw" (the evidence sentence), "What palmistry says" (attributed), and the source book line |
| Locked card | Title, the real first sentence, and a "Tap to open" pill. The whole card is the tap target. **No blur and no hidden text:** locked text is dropped before rendering, same as the app (DEC-038/042). |
| Lock sheet | Opens on a locked-card tap. The main action is the app (with the price line); the secondary is "Read one more palm free — sign up". On iPhone: the honest note instead of the store button. |
| Sign-up sheet | Email → 6-digit code → verified. Shows what sign-up gives and which emails we send. |
| Two-hands teaser | After reading 2: both traced photos side by side with one line; "Compare them properly in the app" |
| Tool card | Not a uniform grid. One featured tool (the photo checker) as a wide card with a live mini-demo; the rest as rows on mobile and a 3-column grid on desktop, grouped by type. Each has a line glyph, a name, one line of what you get, and a "No sign-up" tag only when true. |
| Guide blocks (zero JS) | QuickFacts, TOC, VariationCard (diagram + meaning + source), MythVsReality, LimitsBox (links to `/is-palmistry-real/`), SourcesList, PhotoTips, Faq (`<details>`), StepOf7 pager, EndCta, Related, Byline |
| Palm map | An SVG hand with the 4 lines and 7 mounts as real, keyboard-focusable `<button>`s. Opens a meaning sheet (a bottom sheet on mobile, a side panel on desktop). Without JS it falls back to a list of links. |
| Store button | The official Google Play badge, unmodified, at least 48 px tall. Android: a direct Play link with a `referrer` UTM. iPhone: the honest note. Desktop: the badge plus the QR tile. Size and price line underneath. |
| QR tile | Dark `#0B0A1F` modules on an ivory `#F6F0E1` tile (17.1:1), a 4-module quiet zone, at least 132 px, built at build time as SVG, captioned "Scan with your phone camera". No logo in the middle. |
| Language control | A "हिंदी / English" pill, each name in its own script, never flags. The mobile header uses a compact **अA** glyph. It is a **link** to the twin URL, not a JavaScript switch. |
| Theme toggle | Day / Night; the choice is remembered in `localStorage` only |
| Mobile bottom CTA bar | Floating glass. Shown only after the hero button scrolls away, and hidden whenever an upload card is visible. Respects the phone's safe area. Not shown on `/reading/`. |
| Share card | Drawn on a canvas in the browser, on the user's own traced photo: logo, a one-line archetype, the site URL. "Share on WhatsApp" first. A preview shows exactly what will be shared. |
| Notices and errors | An icon plus text, never colour alone. Says what went wrong and how to fix it. No "Oops". |
| In-app browser notice | Shown inside the WhatsApp, Instagram or Facebook browser: "Open in Chrome for the best result", with a copy-link button |
| Footer | §6.4 |
| Breadcrumbs | §6.5 |

### 5.14 Performance budget for budget Android phones (one table from R08, R09 and R11)

**How we test:** Lighthouse mobile (Moto G Power profile, 4× CPU slowdown, Slow 4G), plus one real Android Go-class phone. Field data (p75) comes from Cloudflare Web Analytics and Search Console.

| Page type | HTML (gzip) | CSS (gzip) | Our JS (gzip) | Fonts | Images | LCP / INP / CLS (p75) |
|---|---|---|---|---|---|---|
| Guides, blog, legal | ≤ 35 KB | ≤ 25 KB | **0 KB** by default. Up to 10 KB when an embedded tool is on the page (palm map, which-hand quiz, finders, signs checker). Embedded tools are built with Preact (React-compatible, about 4 KB) or plain TypeScript, not React [rec, R09 §1.2 risk 3]. | ≤ 120 KB English, ≤ 180 KB Hindi | LCP image ≤ 80 KB; other images ≤ 60 KB | ≤ 2.0 s / ≤ 150 ms / ≤ 0.05 |
| Home | ≤ 30 KB | ≤ 25 KB | **≤ 60 KB on load.** The upload starter is a small Astro script, not React. | same | Hero AVIF ≤ 45 KB at 480 px and ≤ 90 KB at 960 px, `fetchpriority="high"` | ≤ 2.3 s / ≤ 150 ms / ≤ 0.05 |
| Tool pages | ≤ 25 KB | ≤ 25 KB | ≤ 70 KB (React plus one island, loaded when visible; switch to Preact if over) | same | — | ≤ 2.0 s / ≤ 150 ms / ≤ 0.05 |
| `/reading/` | small shell | ≤ 25 KB | ≤ 180 KB at first. The rule engine loads only after the upload starts. The Turnstile script comes from Cloudflare. The HEIC decoder loads only if decoding fails. | same | User photo processed off the main thread where possible | INP ≤ 150 ms |

Other rules:
- Server response time (TTFB) ≤ 200 ms (static files on Cloudflare).
- No tag managers or ad scripts.
- No `backdrop-filter` on mobile.
- `content-visibility: auto` on long guide sections.
- `/_astro/*` cached for a year as immutable; HTML set to `max-age=0, must-revalidate`.
- Lighthouse CI on every build.

**Where the research disagreed:**
- R08 wanted tool pages at 40 KB or less, but React alone is about 60 KB gzipped [R09 §1.2]. Tools take R09's 70 KB.
- The home page keeps R08's and R11's 60 KB by not using React for the upload starter.

### 5.15 Accessibility floor

- Touch targets at least 48 × 48 px.
- WCAG AA contrast (every colour pair above is checked).
- Visible focus rings.
- Alt text in the page's own language.
- `lang` set correctly on every element.
- Text scales to 200% without horizontal scroll.
- Devanagari is never letter-spaced or clipped (Hindi headings have a line height of 1.45 or more).
- Icons always have text; errors never rely on colour alone.
- FAQs use native `<details>`.
- The traced-photo `figcaption` lists the lines that were found.

---

## 6. Information architecture

### 6.1 Route table

**Rendering:**
- **SSG:** static HTML built ahead of time.
- **+island:** static HTML with one interactive component.
- **Client-only:** a static shell whose content is drawn in the browser.
- **Build file:** generated at build time.

**App Link** means Android opens the app for this exact path (with or without the trailing slash) once S9 is live.

| URL | Page type | Primary keyword | Rendering | Indexed? | Hindi pair | App Link | Phase |
|---|---|---|---|---|---|---|---|
| `/` | Home = the free reading | free palm reading | SSG + upload-starter script | yes | `/hi/` | no | P1 |
| `/reading/` | Reading flow | — | Client-only (`ReadingApp`) | **noindex**; left out of the sitemap but not blocked in robots.txt | one route; the UI follows the visitor's language | no | P1 |
| `/palm-reading/` | Hub: how to read palms | how to read palms | SSG | yes | `/hi/palm-reading/` | **yes** | P1 |
| `/hand-lines/` | Hub: lines on the palm + chart | lines on palm | SSG + palm map | yes | `/hi/hand-lines/` | **yes** | P1 |
| `/heart-line/` | Line pillar | heart line palm | SSG (+ finder in P2) | yes | `/hi/heart-line/` | **yes** | P1 |
| `/head-line/` | Line pillar | head line palmistry | SSG (+ finder in P2) | yes | `/hi/head-line/` | **yes** | P1 |
| `/life-line/` | Line pillar | life line palm | SSG (+ finder in P2) | yes | `/hi/life-line/` | **yes** | P1 |
| `/fate-line/` | Line pillar | fate line palm | SSG (+ finder in P2) | yes | `/hi/fate-line/` | **yes** | P1 |
| `/is-palmistry-real/` | Honesty page | is palmistry real | SSG | yes | later | no | P1 |
| `/which-hand-to-read/` | Guide + quiz | which hand to read palm | SSG + quiz | yes | `/hi/which-hand-to-read/` (P2) | no | P1 |
| `/tools/` | Tools hub | free palm reading tools | SSG | yes | `/hi/tools/` (P2) | no | P1 |
| `/tools/palm-photo-checker/` | Standalone tool | how to take a palm photo for reading | SSG + island | yes | `/hi/tools/palm-photo-checker/` (P2) | no | P1 |
| `/app/` | App page | palm reading app | SSG + a 1 KB device script | yes | `/hi/app/` | no | P1 |
| `/account/` | Account: readings left, delete data, sign out | — | Client-only | noindex | — | no | P1 |
| `/privacy/`, `/terms/` | Legal | — | SSG | yes | Hindi summary later | no | P1 |
| `/delete-account/`, `/reset-password/` | Account pages | — | SSG + small island | noindex | — | no | P1 |
| `/privacy.html`, `/terms.html`, `/delete-account.html`, `/reset-password.html` | Old URLs that the app and Play Console use | — | 301 redirect to the new URL (§12.11) | — | — | no | P1 |
| `/hi/` | Hindi home | ऑनलाइन हस्तरेखा स्कैनर / hast rekha scanner | SSG + script | yes | `/` | no | P1, after owner review |
| `/hi/palm-reading/`, `/hi/hand-lines/`, the 4 `/hi/<line>/` pillars | Hindi hubs and pillars | §11.3 | SSG | yes | English twins | **yes** | P1, each after owner review |
| `/hi/app/` | Hindi app page | hast rekha app | SSG | yes | `/app/` | no | P1, after owner review |
| `/404` | Not found (bilingual) | — | SSG | noindex | — | — | P1 |
| `/sitemap-index.xml` and group sitemaps, `/robots.txt`, `/llms.txt` | Crawl files | — | Build file | — | — | — | P1 |
| `/.well-known/assetlinks.json` | App Links proof | — | Build file; `application/json`, no redirect, skipped while the fingerprint list is empty | — | — | — | P1 (switched on with S9) |
| `/og/<path>.png` | Share images | — | Build file | — | one per language | — | P1 |
| `/life-line/broken/` | Sub-page | broken life line | SSG | yes | none at first (no hreflang) | **no** (exact paths only) | P2, first |
| `/career-palmistry/` | Guide | career palmistry | SSG | yes | later | no | P2 |
| `/marriage-line/` | Honest guide (no tool) | marriage line palm | SSG | yes | `/hi/marriage-line/` | no | P2 |
| `/palmistry-m/` | Guide | m on palm | SSG | yes | `/hi/palmistry-m/` | no | P2 |
| `/money-line/` | Guide | money line on palm | SSG | yes | `/hi/money-line/` | no | P2 |
| `/hand-types/` | Guide + hand-type finder | types of hands in palmistry | SSG + island | yes | later | no | P2 |
| `/simian-line/` | Sensitive guide (medical facts first) | simian line | SSG | yes | later | no | P2 |
| `/sun-line/` | Guide | sun line palmistry | SSG | yes | later | no | P2 |
| `/palm-crosses/` | Guide | cross on palm | SSG | yes | later | no | P2 |
| `/children-line/` | Honest guide (no tool) | children lines on palm | SSG | yes | `/hi/children-line/` | no | P2 |
| `/lucky-signs/` | Guide + signs checker | rare lucky signs on palm | SSG + island | yes | `/hi/lucky-signs/` | no | P2 (moved up from P3 to host tool 10) |
| `/tools/palm-line-finder/` | Standalone AI tool | palm line finder | SSG + island | yes | later | no | P2 (decision D19) |
| `/tools/palm-reading-quiz/` | Standalone quiz | palm reading quiz | SSG + island | yes | later | no | P2 |
| `/palmistry-pdf/` (was `/palm-reading-pdf/`) | Lead magnet | palm reading pdf | SSG + opt-in | page yes; the PDF file noindex | `/hi/palmistry-pdf/` | no | Built in P2; published with the Hindi PDF |
| `/about/`, `/about/<name>/`, `/editorial-policy/`, `/how-it-works/` | Trust pages | — | SSG | yes | later | no | P2 (live before the P2 guides) |
| `/blog/`, `/blog/<slug>/`, `/blog/page/<n>/` | Blog | long-tail questions | SSG | yes | `/hi/blog/<slug>/` when translated | no | P2 (posts 1–5) |
| `/indian-palmistry/` and `/hi/hast-rekha/` | Culture hub | indian palmistry / हस्तरेखा शास्त्र | SSG | yes | paired only if the content is equivalent | no | P3 |
| `/chinese-palmistry/` | Guide (needs a specialist source) | chinese palmistry | SSG | yes | — | no | P3 |
| `/palm-mounts/`, `/history-of-palmistry/`, `/palmistry-fingers/`, `/mercury-line/` | Guides | §10.1 | SSG | yes | later | no | P3 |

**App Link list (S9):**
- `/palm-reading`, `/hand-lines`, `/heart-line`, `/head-line`, `/life-line`, `/fate-line`;
- the same six under `/hi/`;
- each with and without the trailing slash.

Every other path opens in the browser. This follows R09 S9 and R11 §3.2.

### 6.2 URL rules [R09 §3.2, R11 §3.2]

- Lowercase, hyphens, ASCII only, 1–3 words, no dates, no `.html`. Always a trailing slash: Astro `trailingSlash: 'always'` and `build.format: 'directory'`, plus Workers `html_handling: "auto-trailing-slash"`.
- One host: apex or `www`, with the other 301-redirected to it. HTTPS only, with HSTS.
- Slugs are permanent (App Links depend on them).
- `/hi/` pages reuse the English slugs. The app opens only `/hi/<english-slug>`, and Devanagari URLs turn into `%E0%A4…` when shared on WhatsApp. Hindi-only pages get ASCII Hinglish slugs (`/hi/hast-rekha/`).
- URL parameters (`utm_*`, tool states such as `?shape=forked`) are never indexed; the canonical is always the clean URL.
- Rename `/palm-reading-pdf/` to `/palmistry-pdf/` (decision D16), so no App Link rule could ever catch it. Nothing is live yet, so this is free.

### 6.3 Navigation

**Mobile header (56 px)**
- Logo, **अA**, menu.
- On `/`: no header button while the hero's gold button is on screen. On other pages: a "Read my palm" outline button.
- Turns into glass after 24 px of scroll.

**Mobile menu sheet**
1. "Read my palm free" — the gold button in this sheet.
2. Palm lines
3. How to read palms
4. Tools
5. Blog
6. Is palmistry real?
7. Get the app (Android) or the iPhone note
8. हिंदी / English
9. Day / Night

**Mobile bottom CTA bar**
- Shows "Read my palm free" and three true points: "First reading free", "No sign-up", "Photo not stored on servers".
- Appears after the hero button leaves the screen; hidden while an upload card is visible.
- All fixed bars together stay at or below 20% of the screen height [R07].

**Desktop header**
- Logo, Palm lines, How to read palms, Tools, Blog, App, the हिंदी / English pill, Day / Night, and a "Read my palm" outline button.
- No wallet or money items [R06].

**Hindi labels:** हाथ की रेखाएं, हस्तरेखा कैसे पढ़ें, टूल, ब्लॉग, ऐप, मेरी हथेली पढ़ें.

### 6.4 Footer [R08 §7, R10 §4, R11 §3.1]

- **Top:** the logo and one honest line: "Palmistry is a tradition for reflection. It does not predict health, lifespan or exact dates." / "हस्तरेखा खुद को समझने की एक परंपरा है। यह सेहत, उम्र या तारीख़ें नहीं बताती।"
- **Link groups** (accordions with 48 px rows on mobile):
  - **Read:** free reading, palm lines, how to read palms, which hand, is palmistry real?
  - **Tools:** the hub plus the 3 standalone tools
  - **Learn:** blog, हिंदी, Hindi PDF
  - **Company:** about, editorial policy, how it works, contact
  - **Legal:** privacy, terms, delete account
- **App:** the store button, which knows the device (the honest note on iPhone).
- **Cookie line:** "No cookies, no ad trackers", only while that is true.
- **Company details:** company name, contact email, a grievance contact for data questions (DPDP) [R02 §9], "Readings are for people 18+", "Made in India", and © with the build year.
- A link appears only once its page is live; the build check fails on broken links.

### 6.5 Breadcrumbs

Breadcrumbs are logical, not taken from the URL, because URLs stay flat for App Links [R11 §3.1]. Each is visible on the page and marked up as `BreadcrumbList`.

| Page | Breadcrumb |
|---|---|
| Line pillar | Home › Palm lines › Heart line |
| Sub-page | Home › Palm lines › Life line › Broken life line |
| Which hand | Home › How to read palms › Which hand to read |
| Tool | Home › Tools › Palm photo checker |
| Blog post | Home › Blog › *post title* |
| Hindi pillar | होम › हाथ की रेखाएं › हृदय रेखा |

### 6.6 Internal-link graph [R11 §3.1]

```
                     /  (free AI palm reading = the page that converts)
                     ▲ every page links here (CTA)
        ┌────────────┴──────────────┐
  HUB /hand-lines/                HUB /palm-reading/
  (what lines mean)               (how to read: which hand, hand types,
  links to every line/sign page    4 pillars, mounts, fingers, PDF, quiz)
        ▼
  PILLARS /heart-line/ /head-line/ /life-line/(+broken) /fate-line/   ◄ "Step n of 7" chain
        │ each links to 2–4 siblings, its finder, home and /is-palmistry-real/
        ▼
  SPOKES   marriage · children · sun · money · career · mercury · M · crosses · lucky signs · simian · mounts · fingers
  CONTEXT  is-palmistry-real · history · indian (↔ /hi/hast-rekha/) · chinese · which-hand
  TOOLS    /tools/ → tool pages → the pillar they explain → home → /app/
  BLOG     each post links 1 pillar + home; each pillar links ≤ 3 posts
  /app/    linked from home, every page's end block and the footer
  /hi/*    Hindi pages link to Hindi pages; the language switch links the English twin
```

**Rules**
- Every indexed page is within 3 clicks of home, and has at least 2 internal links pointing to it (checked at build).
- Anchor text is the target's topic in natural words, varied. Never "click here". One link per target per section.
- Every "What palmistry can't tell you" box links to `/is-palmistry-real/`, the site-wide trust page.

**Related-link groups (3–4 links each)**
- heart, head, simian, marriage
- life, fate, broken, mercury
- fate, career, sun, money
- M, crosses, lucky signs, mounts

---

## 7. Page-by-page wireframes (mobile first, 390 × 844)

Each block lists what goes on it, what it is for, its copy direction and its button. "Gold" means the one gold button for that screen.

### 7.1 Home `/` [R06, R07, R08, R10, R11 §2.1]

| # | Block | Purpose | Copy direction | Button |
|---|---|---|---|---|
| 0 | Header (56 px): logo, अA, menu | Orient without competing | — | none while the hero is visible |
| 1 | **Hero, all inside the first screen:** H1 (2–3 lines), sub-line (1–2 lines), the 3 promise chips, and the upload card (gold button, gallery link, 3 tip chips, the privacy line with its link, the "free" qualifier) | Value, proof of honesty, and the action together | §3.3 exactly | **Gold:** "Take a palm photo" (desktop: "Upload a palm photo"). Text link: "Choose from gallery" |
| 2 | **Traced sample** (its top edge shows at the fold): a real consented photo, beam and trace once, line chips (colour dot, Hindi/English name); tap a chip for a 2-line meaning. Label: "A real photo, traced by Palm Read AI." Link: "No photo handy? Try a sample hand." | Show the output before the ask. The wow moment. | Plain labels; the meanings follow the tone rules | Text: "Try a sample hand" |
| 3 | Sample "at a glance" card: 2–3 takeaways, "2 of 4 parts free on the web", locked-card preview | Show what you get and where the lock is | "Sample reading — your reading is made from your own photo." | Small Play badge (the device-aware version) |
| 4 | How it works: 3 numbered steps (a real sequence), with time badges only once measured | Make the journey feel short and real | 1 Take a photo. 2 We trace your lines. 3 Read what they mean. | none |
| 5 | **What's free** box: now / after sign-up / in the app (paid, price from config), plus "Why free?" | Rules out drip pricing; builds trust | §4.2 stage 3 | none |
| 6 | What AI palm reading can and can't tell you (the honesty box) | Skeptic trust; protects on sensitive topics | "Palmistry is an old tradition, not a science…" | Link: `/is-palmistry-real/` |
| 7 | Learn the lines: 4 line cards (to the pillars) and a palm map teaser (to `/hand-lines/`) | Internal links; learner path | One line per card | Links |
| 8 | Free tools: the photo checker as a wide featured card, plus 3 rows | Tools hub entry | "No sign-up" only when true | Link: `/tools/` |
| 9 | Get the app: what the app does (only true features), size, price line, "fresh photo in the app", iPhone note | App bridge with the price stated | §4.2 stages 11–12 | Store button (device-aware) |
| 10 | FAQ, 8 questions [R11 §2.1] | Long-tail questions, objections | Answer in the first sentence | none |
| 11 | Footer | §6.4 | — | Store badge |
| — | Sticky bottom CTA bar | Keeps the action reachable | "Read my palm free" + 3 true points | Gold (only while the hero is off screen) |

About 900–1,400 words sit under the tool [R11]. Desktop: two columns, with the traced sample on the left and the upload card on the right, both above the fold [R06: palmist and palmly desktop folds].

### 7.2 Guide template (every guide) [R01, R03, R06, R07, R11 §2]

1. Breadcrumb.
2. H1 with a one-line subtitle (on Hindi pages, a small Hinglish subtitle).
3. **Byline**, on separate lines: "Written by {author}", "Reviewed by {reviewer}", "Last reviewed {date}".
4. **Answer first:** 1–2 sentences (40 words or fewer) that answer the page's main question. This is the part featured snippets and AI answers lift.
5. **Header image:** that line traced on the sample photo (`ImageObject`, licensable).
6. **Quick facts card:** Hindi and Sanskrit name, other names, where it sits, what the tradition reads, which hand.
7. **Small inline CTA:** "Find your heart line on your own photo" (a text link to the home upload card).
8. **TOC:** a collapsible chip on mobile, a sticky side list on desktop.
9. **Sections:** H2s phrased as the questions people type, each answered in its first sentence.
10. **Variation cards:** an SVG thumbnail, the meaning and its source, one card per type. Stacked on mobile; no 3-column tables at 390 px.
11. **Embedded tool** (`#finder`, from P2): "Traditional meaning, not AI".
12. **Myth vs reality** card (two columns, stacked on mobile).
13. **"What palmistry cannot tell you" box**, linking to `/is-palmistry-real/`.
14. Photo tips.
15. FAQ (`<details>`).
16. Sources box.
17. **"Step n of 7" pager.** The steps match the 7 steps of `/palm-reading/`: which hand, hand shape, heart, head, life, fate, mounts and signs. An unpublished step links to its section in `/palm-reading/` [rec].
18. **End block:** gold "Read my palm free"; a secondary Play badge (QR code on desktop) with the price line.
19. Related guides (3–4).

The Day theme is available. Prose sits on surface1 at 680 px wide at most.

### 7.3 Line pillar example: `/heart-line/` (P1, App Link) [R11 §2.1]

1. Breadcrumb: Home › Palm lines › Heart line.
2. H1: "Heart line meaning in palmistry (the love line)".
3. Answer first: where the line is, and that it is read for how you love. Say plainly that it can't name a soulmate or a wedding date.
4. Header: the heart line traced in pink on the sample photo.
5. Quick facts:
   - Hindi name: हृदय रेखा (Hriday Rekha);
   - also called the love line;
   - where: from under the little finger towards the index finger;
   - which hand.
6. H2 "Where is the heart line?"
7. H2 "Is the love line the same as the heart line?"
8. H2 "Heart line types and meanings": 12 variation cards (long, short, curved, straight, ending under the index finger, ending under the middle finger, ending between them, forked, broken, chained, double, faint).
9. H2 "Marks on the heart line".
10. H2 "Left vs right hand".
11. H2 "When the heart and head line join (simian line)".
12. Limits box: "What the heart line can't tell you".
13. H2 "Find your heart line on your photo" (the finder from P2; in P1, a CTA card).
14. FAQ (6).
15. Sources.
16. Step 3 of 7.
17. End block.

Target length: 2,200–3,000 words at SERP depth. The P1 version starts compact (§11.2).

### 7.4 Tool templates [R07 WOW 5, R09 §3.4]

**Embedded tool block (inside a guide):**
1. H2 phrased as the task ("Find your heart line type").
2. The island, with the note "Traditional meanings — not AI".
3. The result card, with the meaning and source.
4. "See your real line" → the home upload.
5. The result can be shared through `?shape=…`; its canonical stays the clean URL.

**Standalone tool page (`ToolLayout`):**
1. Breadcrumb.
2. An icon tile and an H1 phrased as a benefit.
3. A one-line promise and an honest label:
   - photo checker: "Runs on your phone — your photo never leaves this device";
   - line finder: "Uses AI to trace your lines";
   - quiz: "A quiz on diagrams — no photo needed".
4. The tool card directly under the H1, with the privacy note under its button.
5. The result appears in place.
6. "Check this on your own palm" (a CTA to home).
7. How it works (3 steps).
8. "What this tool can't tell you".
9. FAQ.
10. Related guides.
11. A list of the other tools (sticky on desktop).
12. End block with the store button.

400–900 words of real content, so no tool page is thin [R09 §3.4].

### 7.5 The three standalone tools

**Palm photo checker** `/tools/palm-photo-checker/` (P1)
- **Input:** take or choose a photo.
- **Output:** instant ticks for "Bright enough", "Sharp", "Whole palm in frame" and "Straight", each with a fix. Good and bad example thumbnails.
- **Then:** "Use this photo for a free reading" hands the photo to `/reading/` through the browser, so there is no second pick.
- **Built from:** a port of the app's `quality/{metrics,verdict,review}.ts` on a canvas. No ML model download (hand-detection models are several MB) [R08 §8, R09 §3.5].

**Palm line finder** `/tools/palm-line-finder/` (P2; decision D19)
- **Input:** a photo.
- **Output:** the traced lines with their names and "not clearly seen" states. No meanings.
- **Then:** "What do they mean? Get your free reading."
- **Built from:** the same pipeline as the reading, stopping after `scan-palm`.

**Spot-the-line quiz** `/tools/palm-reading-quiz/` (P2)
- **Input:** 10 questions on diagrams.
- **Output:** a score card, shareable and with no personal data.
- **Then:** "Now find them on your palm".
- **Built from:** a web version of the app's quiz.

### 7.6 `/app/` [R10 §7, R11 §2.4]

1. **H1:** "Palm Read AI — the palm reading app that traces your real lines". One-line promise.
2. **Real app screenshots.** The first one matches the website hero, so it feels like the same product.
3. **What the app does:** only features it has today (list from §4.7, [verify] which are free).
4. **What's free and what's paid:** a price table from config; "packs are one-time and never expire"; "plans renew until you cancel in Google Play"; the trial reminder.
5. **Your photos and privacy (in the app).**
6. **What it can't do** (the honest limits).
7. **Get it:**
   - Android: badge, size, "Only from Google Play — never an APK".
   - Desktop: QR code, "Send to my WhatsApp" (`wa.me/?text=`), and "Install from Google Play on this computer — it goes to your phone".
   - iPhone: the honest note.
8. **Continuity:** "In the app you'll take a fresh photo — about a minute. Use the same email."
9. **FAQ.**

600–1,000 words.

### 7.7 Hindi home `/hi/` [R11 §4, R06 WOW 2]

- Same layout as `/`, with `lang="hi"` on `<html>`.
- H1 set in Tiro Devanagari (§3.3), with a small Hinglish line under it: "Hath ki rekha online check — free".
- Chips: "पहली रीडिंग मुफ़्त · साइन-अप नहीं · इस साइट पर कोई पेमेंट नहीं".
- Tip chips: "खुली हथेली / अच्छी रोशनी / पूरा हाथ".
- Sample line labels in Hindi (हृदय रेखा…).
- FAQ in Devanagari, with 1–2 questions written the way people type in Hinglish ("hath ki rekha kaise dekhe?").
- Errors in Hindi.
- Step numbers may be १ २ ३.
- The English slug stays in the URL. The language pill links to `/`.
- The Hindi page goes live only after the owner (or the named Hindi reviewer) has read it.

### 7.8 Blog post [R03, R11 §2.4]

1. Breadcrumb.
2. H1.
3. Byline and dates.
4. Answer first.
5. TOC.
6. Sections, with one diagram per major section.
7. A mid-post inline CTA to the matching tool or pillar.
8. FAQ.
9. Sources.
10. End block.
11. Links to 1 pillar and home, plus up to 3 related posts.

1,000–1,800 words [rec, from R03's 1,050–2,200 range].

### 7.9 Reading page `/reading/`, including the zero-readings state [R08 §7, R10 §3, R09 §3.6]

| State | What the screen shows | Main action |
|---|---|---|
| Review | The photo, the local check result ("Too dark — move near a window and retake"), hand choice (Left / Right, plus "Is this the hand you write with?") | Gold: "Use this photo" / text: "Retake" |
| Working | The user's photo with the beam; one status line on the real stage (§8.1); "Usually about {p50} seconds" once measured | none; "Try again" after p90 |
| Reveal (reading 1) | Traced photo and line chips; the at-a-glance card; Love and Personality in full, each meaning with evidence and source; 2 locked cards showing their real first sentence; "You've read 2 of 4 parts"; the honesty box; the share card button | Gold: "Read one more palm free — sign up". Secondary: "See the full reading in the app" |
| Lock sheet (tap on a locked card) | The card's first sentence; "The rest of this part is in the app"; the app promise; the price line; the continuity line; the iPhone note on iPhone | Gold: store button (Android) or QR (desktop). Secondary: "Read one more palm free" |
| Sign-up sheet | What sign-up gives (a new reading, not this one's locked parts); email field; "We'll email a 6-digit code"; which emails we send | Gold: "Send my code", then "Verify" |
| Before reading 2 | "This is your 2nd and last free reading on this website." Other-hand tip. | Gold: "Take a photo of my other hand" |
| Reveal (reading 2) | As reading 1, plus the two-hands teaser | Gold: the store button (the web has nothing left to give) |
| **Zero readings** | Title: "You've used both free readings on this website". The 2 saved readings as cards (thumbnail, date, "Save as image", "Remove from this browser"). App card: true feature list, price line, "fresh photo in the app (about a minute)", same email. iPhone: the honest note. "Not now? Keep learning free — guides and tools." No guilt, no nagging. | Gold: store button (Android) or QR (desktop). Links to guides and tools. |
| Returning visitor | Opens straight to the saved readings (from IndexedDB) and the balance from `reading_balance()` | Depends on the balance |

---

## 8. The web reading and credits flow

### 8.1 Sequence [R09 §3.6, which mirrors the app's `src/app/analysing.tsx`]

All server calls go to `api.<domain>`, the app's proxy Worker in front of Supabase. Every function call sends `apikey: <publishable key>` and `Authorization: Bearer <user access token>`; the functions call `auth.getUser()`, so the key alone gets a 401.

| # | Where | What happens | Server call | Uses a free reading? | What is stored |
|---|---|---|---|---|---|
| 1 | Home or a tool | Pick or take a photo. The file goes to IndexedDB, then the browser opens `/reading/`. | — | no | Photo in this browser |
| 2 | `/reading/` | `createImageBitmap` decodes with the EXIF rotation applied and resizes early. The canvas re-encode drops all EXIF data, including GPS. The local photo check runs (the app's metrics) and the review screen appears. The user picks a hand and says whether it is their writing hand. | — | no | — |
| 3 | During the review | Cloudflare Turnstile (managed widget, action `reading`) runs in the background. | Cloudflare | no | Turnstile signals at Cloudflare |
| 4 | During the review | `auth.signInAnonymously()`, or the existing session is reused. It runs only once the user has a photo, never on page load. | `/auth/v1` | no | Session token in `localStorage` |
| 5 | During the review | `POST functions/v1/web-gate {token}` checks the token with Cloudflare (hostname and action must match) and writes a 10-minute web pass. | **new, S3** | no | `private.web_pass` |
| 6 | On "Use this photo" | `rpc start_web_reading(hand, dominant, idempotency_key)` requires the pass, uses up the **web** cap, marks the session `source='web'`, then runs the normal `start_reading`. | **new, S4** | web cap only | `reading_sessions` |
| 7 | Stage: "Tracing your lines" | `POST scan-palm {sessionId, image 1080 px, handSide}` → Modal (USA) traces the lines. **When it returns, the lines draw onto the photo one by one** (real output, animated). | existing | no | [verify] Modal keeps nothing |
| 8 | Stage: "Reading your palm" | `POST extract-palm {sessionId, image 768 px, scan}` → `claim_extraction` **charges `free_guest`** → Cloudflare Workers AI writes the observation. | existing | **yes, reading 1** (refunded on 422 and 503) | [verify] Workers AI keeps nothing |
| 9 | Stage: "Writing your reading" | In the browser: `buildEvidence → synthesise → buildReading` → 4 sections → `lockSynthesis` (DEC-038). Locked text is dropped before rendering. | — | — | — |
| 10 | Save | Insert `palm_observations` and `reading_reports`, then `rpc complete_reading`. | existing | — | Line points, 21 landmarks, observation, report and rule IDs, in Supabase |
| 11 | Reveal | Traced photo, report and locks. Save {1,080 px photo, observation, report} to IndexedDB. | — | — | IndexedDB |
| 12 | Sign-up | `updateUser({email})` sends a 6-digit code; `verifyOtp('email_change')` keeps the same user ID, and a database trigger links the email ledger. | Auth + SMTP (S8) | — | Email and a one-way email code |
| 13 | Reading 2 | Steps 2–11 again (the other hand is suggested). Charged as `free_email`. | as above | **yes, reading 2** | as above |
| 14 | After | `rpc reading_balance()` returns `free_remaining = 0`, and the zero-readings screen shows. | existing | — | — |

**Progress stages the user sees:** only the real ones.
1. "Photo checked" (local).
2. "Sending securely" (upload progress).
3. "Tracing your lines" (while `scan-palm` is running).
4. "Lines found", with the lines drawing on the photo.
5. "Reading your palm" (while `extract-palm` is running).
6. "Writing your reading" (local).
7. Done.

There is no per-line ticking during the server wait, because the scan returns all lines at once. Showing per-line ticks while waiting would be fake [R10 §3.5].

### 8.2 States

The normal path:
1. idle
2. picked
3. checking (local)
4. review (passed, or failed with a reason)
5. gating (Turnstile, session, web pass)
6. scanning
7. lines drawn
8. reading (extract)
9. writing
10. revealed (reading 1)
11. lock sheet or sign-up sheet
12. code sent
13. verified
14. notice before the last free reading
15. back through states 2–9 with the other hand's photo
16. revealed (reading 2)
17. zero readings

Error states (§8.3) can happen from gating onwards. A returning visitor opens at "revealed" (from IndexedDB) or at "zero" (from the server balance).

### 8.3 Errors and edge cases [R09 §3.6 error codes, R10 §3.4–3.5]

| Case | Cause | English | Hindi | Reading used? |
|---|---|---|---|---|
| Photo too dark, blurry, small or tilted | Local check | The specific fix from §4.2, stage 4 | §4.2, stage 4 | No (nothing was sent) |
| HEIC file won't open | `createImageBitmap` fails on desktop Chrome/Firefox | "This photo type (HEIC) doesn't open here. Take a new photo with your phone, or upload a JPG." | "यह फ़ोटो (HEIC) यहां नहीं खुल रही। फ़ोन से नई फ़ोटो लें या JPG फ़ोटो डालें।" | No |
| No camera, or camera blocked | Desktop, or permission | Show the gallery upload and "Easier on your phone: scan this code to open this page there." | "फ़ोन पर आसान है: यह कोड स्कैन करें और यही पेज फ़ोन पर खोलें।" | No |
| In-app browser | WhatsApp, Instagram or Facebook browser detected | "For the best result, open this page in Chrome." (copy-link button) | "सबसे अच्छे नतीजे के लिए यह पेज Chrome में खोलें।" | No |
| Turnstile fails | Bot check or network | "We couldn't complete a quick safety check. Check your connection and try again." | "एक छोटी सुरक्षा जांच पूरी नहीं हो सकी। इंटरनेट देखें और दोबारा कोशिश करें।" | No |
| 402 `no_readings_left` | Balance is 0 | Go to the zero-readings state | — | — |
| 403 `needs_email_verification` | Email not verified | "Enter the 6-digit code we emailed you." | "हमने जो 6 अंकों का कोड ईमेल किया है, उसे डालें।" | No |
| 409 `invalid_session` | Stale session | Restart the session silently. If that fails: "Something went wrong on our side. Please try again." | "हमारी तरफ़ से कुछ गड़बड़ हुई। कृपया दोबारा कोशिश करें।" | No |
| 413 | Image too large | Shrink it again and retry once, automatically | — | No |
| 422 `not_a_palm` | No palm found | "We couldn't find a palm in this photo. Show your open palm, fingers together, in good light." | "इस फ़ोटो में हथेली नहीं मिली। खुली हथेली, उंगलियां साथ, अच्छी रोशनी में फ़ोटो लें।" | No (refunded) |
| 429 `daily_capacity_reached` | Web daily cap reached | "Today's free readings on the website are used up. Please try again tomorrow — or continue in the app." | "आज वेबसाइट की मुफ़्त रीडिंग ख़त्म हो गईं। कल फिर कोशिश करें — या ऐप में जारी रखें।" | No |
| 429 `too_many_attempts` / `rate_limited` | Per-IP or per-user limit. Indian mobile networks put many users behind one IP (CGNAT). | "Too many tries from this network right now. Please try again later." | "इस नेटवर्क से अभी बहुत ज़्यादा कोशिशें हुई हैं। थोड़ी देर बाद कोशिश करें।" | No |
| 503 `scanner_unavailable` | Modal is down | "Our line scanner is busy. Please try again in a few minutes." | "हमारा रेखा स्कैनर अभी व्यस्त है। कुछ मिनट बाद कोशिश करें।" | No (refunded) |
| Offline mid-reading | Network drop | "You're offline. We'll continue when you're back." Retry with the same idempotency key. | "आप ऑफ़लाइन हैं। इंटरनेट आते ही हम आगे बढ़ेंगे।" | No double charge [verify] |
| Slower than p90 | Slow 4G | §4.2, stage 5 | §4.2, stage 5 | No |
| Email already has an account | `updateUser` refuses it | "This email already has an account. Sign in with a code instead." Reading 1 stays in this browser. | "इस ईमेल से पहले से अकाउंट है। कोड से साइन-इन करें।" | That account's balance applies [verify] |
| Browser data cleared | IndexedDB wiped | Readings are gone from this browser. If signed in, the balance is still right. | — | — |
| Two tabs | Double start | One idempotency key per photo | — | No double charge |

### 8.4 What is stored where [R09 §3.7]

| Data | Where | How long |
|---|---|---|
| Original photo | The user's device only | — |
| Two smaller copies (1,080 px and 768 px, sent as base64) | In transit only, through `api.<domain>` to Modal (USA) and Cloudflare Workers AI. The app's code says "not stored anywhere". No storage bucket exists. | In transit [verify providers] |
| Photo used to show the reading | This browser's IndexedDB; never uploaded again | Until the user removes it or clears site data |
| Traced line points (up to 100 per line), 21 hand landmarks, the written observation | Supabase `palm_observations`, linked to the guest or email user | Until the user deletes it or the account (cascade delete) |
| Report and matched rule IDs; session details (hand, status, how it was charged) | Supabase `reading_reports`, `reading_sessions` | Same |
| Salted daily IP code | `private.session_ip`, `guest_ip_daily` | 2 days or less |
| One-way email code + free readings used | `private.free_grants` | **Kept after deletion**, for fraud prevention (the current privacy page already says so) |
| Token-usage log | `private.llm_usage` (0016) | 180 days |
| Session tokens | Browser `localStorage` | Until sign-out or clearing |
| Turnstile signals | Cloudflare | Cloudflare's policy |
| Page views and Web Vitals | Cloudflare Web Analytics, no cookies | Aggregated |
| Funnel counts | `log_event_counts` daily totals, with no user ID | Per migration 0021 |

### 8.5 Privacy copy that matches reality

Never use these words: "sent once", "never stored", "we keep nothing", "deleted right after". All four are wrong for the web path, as R09 §3.7 shows.

**(a) Upload line:** as in §3.3, with the link "What happens to my photo?"

**(b) The "What happens to my photo?" panel.** It opens in place and is also on `/privacy/#website`.

| # | English | Hindi |
|---|---|---|
| 1 | Before anything is sent, your browser makes the photo smaller and removes hidden data such as your location. | कुछ भी भेजने से पहले आपका ब्राउज़र फ़ोटो छोटी करता है और उसमें छिपी जानकारी (जैसे लोकेशन) हटा देता है। |
| 2 | Two small copies go through our server to two services. Modal (USA) traces your lines. Cloudflare Workers AI reads your palm's features. Neither stores the photo. | फ़ोटो की दो छोटी कॉपी हमारे सर्वर से होकर दो सेवाओं तक जाती हैं: Modal (अमेरिका) आपकी रेखाएं बनाता है, Cloudflare Workers AI हथेली की बनावट पढ़ता है। दोनों में से कोई फ़ोटो सेव नहीं करता। |
| 3 | We save your traced line points, 21 points that mark your hand's shape, and your written reading to your account — not the photo. You can delete them any time on the Account page. | हम आपके अकाउंट में रेखाओं के बिंदु, हाथ की बनावट के 21 बिंदु और आपकी लिखी रीडिंग सेव करते हैं — फ़ोटो नहीं। इन्हें आप कभी भी Account पेज से हटा सकते हैं। |
| 4 | A copy of the photo stays in this browser so you can see your reading again. Clearing browser data removes it. | फ़ोटो की एक कॉपी इसी ब्राउज़र में रहती है ताकि आप अपनी रीडिंग दोबारा देख सकें। ब्राउज़र का डेटा साफ़ करने पर यह हट जाती है। |
| 5 | If you sign up, we keep a one-way code of your email so the free reading can't be repeated — even after you delete your account. | साइन-अप करने पर हम आपके ईमेल का एक एकतरफ़ा कोड रखते हैं ताकि मुफ़्त रीडिंग दोबारा न ली जा सके — अकाउंट हटाने के बाद भी। |
| 6 | A quick Cloudflare check (Turnstile) stops bots. Page statistics come from Cloudflare Web Analytics, with no cookies. | बॉट रोकने के लिए Cloudflare की एक छोटी जांच (Turnstile) होती है। पेज के आंकड़े Cloudflare Web Analytics से आते हैं, बिना कुकी के। |

Rows 2 and 3 need checks before launch:
- Row 2: [verify] Modal's and Workers AI's retention and logging.
- Row 3: [verify] that guest users can delete their data.

**(c) The "On the website" section of the privacy page.** It must be live before the reading is.
- **What we collect:** the §8.4 table in plain words.
- **Who processes it:**
  - Modal (USA): line tracing;
  - Cloudflare: hosting, proxy, Workers AI, Turnstile, Web Analytics;
  - Supabase: database and sign-in;
  - the email provider, if one is chosen (for example Brevo, S8).
- **What we don't do:** no cookies, no ads, no selling data.
- **How long we keep each item:** from §8.4.
- **Your rights under DPDP:** access, correction and erasure through `/account/` and `/delete-account/`. Withdrawing consent is as easy as giving it. A grievance contact.
- **Age:** 18+.
- **Cross-border processing:** said plainly.
- **Last updated:** the date.

The app's current `privacy.html` covers only the phone ("A small copy stays only on your phone") and does not mention stored line coordinates or the token log [R09 §3.7].

### 8.6 Abuse and cost controls [R09 §3.8, S2–S4, S12]

1. **Turnstile** (managed) on every reading start, checked on the server in `web-gate`. The token is single-use and valid for 300 seconds; the hostname and action must match. The result is a 10-minute web pass.
2. **Separate web caps:** `web_guest_free_daily_cap` and `web_llm_daily_cap`, plus a `web_scan` cap if the line finder doesn't use a reading (D19). Each has a kill switch. The app's own caps stay untouched.
3. **Per IP:** 6 guest free readings a day. Supabase allows 30 anonymous sign-ins per hour per IP, which only works per user once S2 stops every proxied visitor looking like one IP.
4. **Per session:** at most 3 scan or extraction claims.
5. **Email ledger by normalised one-way code:** Gmail dots and `+tags` are stripped; disposable domains get less.
6. **The proxy Worker's rate-limiting binding**, per IP, on `/functions/v1/*`.
7. **Anonymous sign-in only after a photo is picked**, never on page load.
8. **Monitoring:** a daily look at the web counters in `app_usage_daily`, 429 errors and Turnstile failures. An alert at 80% of the web cap [rec].
9. **Honest messages** for people blocked by mistake behind shared mobile IPs (§8.3).
10. **Later:** Play Integrity in the app, then require either a Turnstile pass or a Play Integrity verdict for any guest free reading (S12).
11. **Accepted risk:** someone can clear their browser data and get another guest reading. The per-IP and daily caps limit this.
12. **Accepted risk (the same as the app):** the rule engine runs in the browser, so a technical user could rebuild locked text. Locked text is dropped before rendering and never shown.

### 8.7 Server changes needed in the app repo (spec only; do not edit the app repo from here) [R09 §3.6]

| # | Change | Why | Size | Needed for |
|---|---|---|---|---|
| S1 | Apply 0015 → 0016 → 0017 in the documented order (0020 only if the app repo has already decided on it; its content is not described in this research), then test guest → email on a real phone | The live rule is 2 + 2 (0013); the web promise of 1 + 1 needs 0016; locks and unlock need 0017; the email-code path has never been tested | 3 h incl. test | Live reading |
| S2 | Deploy `services/supabase-proxy` as `api.<domain>`. Set `app_limits.trusted_proxy_worker`. Fix Auth per-IP limits: either raise them, or send `Sb-Forwarded-For` with an `sb_secret_` key used only for `/auth/v1` (D14). | The ISP block (BUG-030). Without the fix, every visitor looks like one IP, giving 30 anonymous sign-ins an hour for the whole site. | 2 h + owner decision | Live reading |
| S3 | New function `web-gate` (JWT required): POST `{token}` → Turnstile `siteverify` with `TURNSTILE_SECRET`, `remoteip` and an `idempotency_key`. Accept only `hostname ∈ {<domain>, www.<domain>}` and `action = "reading"`. Write `private.web_pass(user_id, expires_at)`. | Turnstile tokens are single-use, last 300 seconds and must be checked on the server | 2 h | Live reading |
| S4 | New RPC `start_web_reading(p_hand_side, p_is_dominant, p_idempotency_key)`. It requires an unexpired pass; consumes new `app_usage_daily` kinds `web_guest_free` / `web_llm` against new `app_limits.web_guest_free_daily_cap` / `web_llm_daily_cap`; marks `reading_sessions.source = 'web'`; then runs the normal `start_reading` logic. The app's `start_reading` is unchanged. Optional: a `lines_only` mode with a `web_scan` cap for the line finder (D19). | Stops the web from using up the app's shared caps; gives the web its own kill switch | 2 h (+ about 0.5 h for the optional mode [rec]) | Live reading |
| S5 | Owner budget decision: raise `llm_daily_cap` (34 a day in total today) and set the web caps before any web launch | Otherwise the site stops after about 30 readings a day | decision (D13) | Live reading |
| S6 | CORS: replace `*` with an allow-list (`https://<domain>`, `https://www.<domain>`) in the 4 browser-called functions (extract-palm, scan-palm, write-report, delete-account) and in `web-gate`. Keep the `authorization, x-client-info, apikey, content-type` headers. | Defence in depth. The native app sends no Origin, so it is unaffected. | 0.5 h | Live reading |
| S7 | Auth dashboard: Site URL `https://<domain>/`; redirect URLs `https://<domain>/**` (plus the planned `palmreadai://**`). **Do not** turn on Supabase's project-wide captcha; the app's anonymous sign-in sends no token. | The Site URL currently points at a page that doesn't exist | 0.25 h | Live reading |
| S8 | Custom SMTP (for example Brevo), Confirm email on, an OTP email template that shows the code | Supabase's built-in email is limited to 2 emails an hour | 1 h | Sign-up |
| S9 | App Links: set `APP_LINK_HOST`; intent filters with **exact `path` entries** (`/heart-line` and `/heart-line/`, the same under `/hi/`) instead of `pathPrefix`; publish the real SHA-256 fingerprint | `pathPrefix` would catch `/palm-reading-pdf/` and `/life-line/broken/`, which the app's router refuses, so users would land on the app's Home | 1 h + the owner's SHA-256 | App Links |
| S10 | Apply 0021 and let the site call `log_event_counts` (already granted to `anon`) with `app_version = 'web'` | Funnel counts in one place, with no cookies | 0.5 h | Measurement |
| S11 | After the site is live: retire `web/`, `scripts/deploy-web.mjs` and `build-web*.mjs` (owner approval); point `EXPO_PUBLIC_WEB_BASE_URL` at the domain; update the legal links in the app and Play Console to the new URLs | One deployer per domain | 0.5 h | Cleanup |
| S12 | Later: Play Integrity in the app, then "Turnstile pass OR Play Integrity verdict" for any guest free reading | The only way to make guest free readings hard to farm on both paths | later | Abuse |
| S13 | PDF opt-in list: a web-only function that adds a double-opt-in contact to the email provider's list, with an unsubscribe link and a postal address in marketing email (CAN-SPAM) | The lead magnet (§11.4) needs somewhere to store consent | about 1–2 h [rec; not sized in research] | PDF |

**Totals**
- **Before the live reading:** S1–S4 and S6–S8, about **11 h** (10.75 h). S5 is a decision.
- **Later:** S9 (1 h + SHA-256), S10 (0.5 h), S11 (0.5 h), then S12 and S13.

**App-side changes (not server; later, with owner approval)**
- Optionally map `/<line>/*` to that line's lesson in the app's router, as an alternative to exact paths [R11 §5].
- A first-run note for installs with `utm_source=web` [R10 §7.5].
- Make the Play listing's first screenshot the same traced-palm visual as the website hero [R10 §7.5].
- Optionally carry the web reading's observations into the account (D23).

---

## 9. Tools

The owner decides D5. The recommendation, from R11 §2.4: only 3 standalone tool pages, with topic tools living inside their guide, so there are no competing thin pages. Labels are honest: only tools 1–2 use AI; tool 3 runs on the phone; tools 4–12 are traditional meanings from the app's rule set, built into the page at build time [R09 §3.4].

| # | Tool | Page | Standalone? | Input | Output | AI or rules | Keyword | Phase |
|---|---|---|---|---|---|---|---|---|
| 1 | Free AI palm reading | `/` then `/reading/` | Yes (it is the home page) | Palm photo (camera or gallery), hand | Traced lines on the photo + the 4-part reading (2 parts open, 2 showing their first sentence) | AI: Modal line scan + Workers AI observation; meanings from the app's rule engine in the browser | free palm reading | P1 |
| 2 | Palm line finder | `/tools/palm-line-finder/` | Yes | Palm photo | Traced lines with names and "not clearly seen" states; no meanings; leads to the reading | AI (Modal scan only) | palm line finder / palm line scanner | P2 (D19) |
| 3 | Palm photo checker | `/tools/palm-photo-checker/` | Yes | Photo | Bright, sharp, whole palm, straight — each with a fix; "Use this photo" | Rules in the browser (the app's quality metrics); the photo never leaves the device | how to take a palm photo for reading | P1 |
| 4 | Heart line meaning finder | `/heart-line/#finder` | Inside the guide | Pick the shape from diagrams | Traditional meaning + source + "See your real line" | Rules | heart line meaning | P2 |
| 5 | Head line meaning finder | `/head-line/#finder` | Inside | Same | Same | Rules | head line meaning | P2 |
| 6 | Life line meaning finder | `/life-line/#finder` | Inside | Same | Same, plus "length is not lifespan" | Rules | life line meaning | P2 |
| 7 | Fate line meaning finder | `/fate-line/#finder` | Inside | Same, including "no fate line" | Same | Rules | fate line meaning | P2 |
| 8 | Which-hand quiz | `/which-hand-to-read/` | Inside | 3–4 taps (writing hand, what you want to read, tradition) | Which hand to scan, and why | Rules | which hand to read palm | P1 |
| 9 | Hand-type finder | `/hand-types/` | Inside | 2 measurements (palm shape, finger length) | Earth, air, fire or water + a share card | Rules | what hand type do I have | P2 |
| 10 | Rare-signs checker | `/lucky-signs/` | Inside | Tick the signs you see (M, cross, star, triangle, fish, island) | Traditional meanings + sources | Rules | rare lucky signs on palm | P2 |
| 11 | Interactive palm map | `/hand-lines/` | Inside | Tap a line or mount | Meaning sheet + guide link + "See it on your palm" | Static | palm reading chart | P1 |
| 12 | Spot-the-line quiz | `/tools/palm-reading-quiz/` | Yes | 10 questions on diagrams | Score card (shareable, no personal data) | Static (web version of the app's quiz) | palm reading quiz | P2 |
| — | Palm reading PDF | `/palmistry-pdf/` | Lead magnet | Email (opt-in, S13) | A Hindi + English PDF guide | — | palm reading pdf / हस्त रेखा ज्ञान pdf | Built in P2 |

- **Changes from R09's P1 day plan:** tool 9 moves to P2 with its page `/hand-types/`; its ≈ 1 h is listed in §14.4. The palm map (tool 11) takes its P1 slot at the same effort. If the owner rejects D5, tools 4–10 get their own `/tools/<tool>/` pages (about 1 h each for the extra 400–900 words), and tool 9 returns to P1.
- **Not built (owner decision):** marriage-age, number-of-children, lifespan and compatibility-score tools.
- **Two-hands comparison:** a teaser appears after reading 2 (§7.9). It is not a separate tool.
- **Later option:** MediaPipe Hand Landmarker (Apache-2.0) as an "is this an open palm?" check, lazy-loaded on `/reading/` only, if photo-check failures justify its few MB [R09 §2.1].

---

## 10. SEO

### 10.1 Keyword map

**Sources:**
- The owner's export: US database only, English, about 300 keywords with volume, KD (keyword difficulty) and intent, checked 2026-09-26 [v1].
- Google autocomplete for Hindi and Hinglish queries, which gives no volumes [R11 §4.1].

**Wanted from the owner:**
- the same export for the India database, saved at `research/keywords-in.tsv`;
- the raw US CSV, saved at `research/keywords-us.tsv`.

Totals are summed US monthly search volume per page. They are demand, not traffic we will get.

**Regrouping decisions** (kept from v1, so pages don't compete with each other):
- "Love line" keywords go to `/heart-line/`.
- Life-line keywords that sat in the big "lines on palm" group move to `/life-line/`.
- "Left hand palm reading for female", "which hand to read" and "palmistry left hand" go to `/which-hand-to-read/`.
- Dictionary-style "life line define" searches are skipped.
- "palm reading" (301K, KD 52) is the head term. Home and `/palm-reading/` carry it, but we don't plan around ranking for it.

| Page (URL) | Main keywords | US vol | KD | App fit | Hindi twin | Phase |
|---|---|---|---|---|---|---|
| `/` (the free AI palm reading) | free palm reading, palm reading scanner/online/app, scan palm, upload picture palm reading, ai palm reading, hand reader online | ~21K | 5–38 | Direct (the web reading) | `/hi/` | P1 |
| `/hand-lines/` (lines hub + chart) | lines on palm astrology, palm reading lines, palmistry lines, meaning of lines in the palm, what your palm lines say, palm diagram, palmistry images, what are the lines on your palm called | ~50K | 21–36 | Direct | `/hi/hand-lines/` | P1 |
| `/palm-reading/` (how to read a palm) | palm reading guide, how to read palm lines, how to read a palm, palmistry hand, palm reading pdf (a section; the page is `/palmistry-pdf/`) | ~9K (+ head term) | 3–31 | Direct | `/hi/palm-reading/` | P1 |
| `/heart-line/` (heart line = love line) | heart line, palm reading heart line, heart line palmistry, love line on palm, broken/forked heart line | ~11K | 5–42 | Traced by the app | `/hi/heart-line/` | P1 |
| `/life-line/` | life line on palm, palm reading life line short, double/forked life line, life expectancy palm reading | ~8.3K | 12–27 | Traced by the app | `/hi/life-line/` | P1 |
| `/life-line/broken/` | broken life line, split life line, broken in two | (in the life-line total) | low | Traced by the app | later | P2, first |
| `/fate-line/` (destiny, luck and career line) | palm reading destiny line, fate line palm, fate line, palmistry luck line, career line palmistry | ~6.7K | 2–28 | Traced by the app | `/hi/fate-line/` | P1 |
| `/head-line/` | head line palmistry, head line palm, split/forked/broken head line | ~1.5K | 0–23 | Traced by the app | `/hi/head-line/` | P1 |
| `/is-palmistry-real/` | palm reading and astrology are examples of, is palmistry true/real, how accurate is palm reading | ~2.7K | 14–35 | Honesty angle | later | P1 |
| `/which-hand-to-read/` (+ quiz) | left hand palm reading for female, which hand to read, left or right hand | ~1.1K | 7–13 | Direct (the app asks this) | `/hi/which-hand-to-read/` | P1 |
| `/marriage-line/` | hand line reading marriage line, chiromancy marriage line, marriage line palm/in hand, palmistry and marriage, number of marriages, divorce line, marriage line age | ~12.7K | 0–24 | The app does not read it | `/hi/marriage-line/` | P2 — honest guide, no tool (owner) |
| `/simian-line/` | one line on palm, simian line, straight line across palm | ~3K | 11–39 | No | later | P2 (medical care) |
| `/hand-types/` (+ finder) | types of hands, different types of hands, element hands, fire/water hand | ~2.6K | 0–42 | No | later | P2 |
| `/palmistry-m/` | palmistry m, palm reading letter m, m sign on palm | ~1.5K | 13–28 | No | `/hi/palmistry-m/` | P2 |
| `/money-line/` | money line in hand, wealth line, rich line, money triangle | ~1.5K | 9–28 | Career & money part | `/hi/money-line/` | P2 |
| `/career-palmistry/` | career palmistry (880, KD 5), job palmistry, line of success | ~1.2K | 1–19 | Career & money part | later | P2, first |
| `/sun-line/` | sun line palmistry, apollo line | ~1.1K | 2–29 | No | later | P2 |
| `/palm-crosses/` | palmistry crosses, cross on palm, x and m on palm | ~1K | 19–23 | No | later | P2 |
| `/children-line/` | children line on palm, how many children | ~1K | 5–16 | No | `/hi/children-line/` | P2 — honest guide, no tool (owner) |
| `/lucky-signs/` (fish, star, triangle; + checker) | rare lucky signs on palm, fish sign, palmistry star | ~1K | 4–26 | No | `/hi/lucky-signs/` | P2 (moved up from P3) |
| `/chinese-palmistry/` | chinese palmistry / palm reading | ~1.1K | 16 | No | — | P3 (needs a specialist source) |
| `/indian-palmistry/` (+ `/hi/hast-rekha/`) | palmistry india, indian hand reading, vedic palm reading, palm reading hindu | ~350 US | 14–30 | Direct (India-first app) | `/hi/hast-rekha/` | P3 |
| `/palm-mounts/` | palm reading mounts, mount of luna/moon | ~350 | 1–7 | Lesson exists | later | P3 |
| `/history-of-palmistry/` | history/origin of palmistry | ~260 | 29–33 | No | — | P3 |
| `/palmistry-fingers/` | palmistry fingers | ~250 | 5–29 | No | — | P3 |
| `/palmistry-pdf/` (lead magnet) | palm reading pdf, palmistry guide pdf | ~260 | 3–19 | Email opt-in | `/hi/palmistry-pdf/` | Built in P2 |
| `/mercury-line/` | line of mercury ("health line") | ~140 | 4–9 | No | — | P3 (no health claims) |
| `/tools/palm-line-finder/`, `/tools/palm-photo-checker/`, `/tools/palm-reading-quiz/` | palm line finder; how to take a palm photo; palm reading quiz | not in the export | — | Direct | `/hi/tools/…` | P1–P2 |
| `/app/` | palm reading app, is there an app that reads your palm | App-store pages own this search result | — | Direct (ASO) | `/hi/app/` | P1 |

**Low-difficulty wins to write first** [v1]: career palmistry (880, KD 5), marriage line palm (1,000, KD 7), palmistry and marriage (590, KD 6), free online palm reading scanner (320, KD 7), upload picture palm reading free online (260, KD 5), rare lucky signs (260, KD 6), broken heart line (210, KD 5), palm reading career line (110, KD 2).

**Search-result lessons** [R11 §1.13]:
- Guides that rank run 1,100–3,600 words (median about 1,650).
- Tool pages that rank carry 1,100–5,600 words below the tool.
- Pictures win in this niche (Pinterest, stock, YouTube, "with pictures" searches).
- Short head terms are ambiguous, so always put "palm" or "palmistry" in the title and H1.
- "For female" and "which hand" questions appear in every family; handle them inside each page, never as gendered pages.
- Fear queries are common, and answering them honestly is both our ranking angle and our brand.

### 10.2 P1 titles, H1s and meta descriptions [R11 §2.1, §4.2]

**Rules for every page:**
- Title of 60 characters or fewer, keyword first, no brand suffix (the site name comes from `WebSite` schema).
- Meta description of 155 characters or fewer.
- The first paragraph answers the main question in 40 words or fewer.
- H2s are the questions people type.

| URL | Title | H1 | Meta description | Words | Main H2 outline |
|---|---|---|---|---|---|
| `/` | Free AI Palm Reading Online – See Your Lines on Your Photo | Free AI palm reading — see your own lines traced on your photo | Upload or snap a palm photo and see your heart, head, life and fate lines traced on your own hand. First reading free, no email. No fake predictions. | 900–1,400 | See a real sample reading · How the free palm reading scanner works · What your free reading covers · What AI palm reading can and can't tell you · Learn the lines on your palm · Free palmistry tools · Get the app · Questions people ask |
| `/hand-lines/` | Lines on Your Palm: Names, Meanings & Palm Reading Chart | Lines on your palm and what they mean | A labelled palm reading chart of every line on your hand – heart, head, life, fate, sun, marriage and more – and what palmistry says each one means. | 2,500–3,500 | Palm reading chart · What are the lines on your palm called? (names table) · The three major lines · The fate line · Minor lines · Signs on the lines · Left or right hand · Do palm lines change? · What is the rarest line? · What palm lines cannot tell you · FAQ |
| `/palm-reading/` | How to Read Palms: A Step-by-Step Guide for Beginners | How to read palms: a beginner's step-by-step guide | Learn palm reading in 7 steps: pick the right hand, find your hand shape, read the heart, head, life and fate lines, then the mounts. Free palm chart. ("and PDF" is added once the PDF is live.) | 2,500–3,300 | What you need · Steps 1–7 · For a woman or a man · Common beginner mistakes · Questions palmistry can't answer · Practise: the quiz · FAQ |
| `/heart-line/` | Heart Line on Palm: Meaning, Types & the Love Line | Heart line meaning in palmistry (the love line) | What your heart line (love line) says in palmistry: long or short, curved or straight, forked, broken or chained – with a picture of each type. | 2,200–3,000 | §7.3 |
| `/head-line/` | Head Line Palmistry: Meaning, Forks, Breaks & Types | Head line meaning in palmistry | What the head line says about how you think: long, short, straight, sloping, forked (the writer's fork) or broken – with a picture of each type. | 1,800–2,500 | Where is it? · Types (10) · Marks · Head line vs heart line · What it can't tell you (not an IQ test) · FAQ |
| `/life-line/` | Life Line on Palm: Meaning, Short, Broken & Double Lines | Life line meaning: what it shows (and what it doesn't) | The life line does not show how long you live. See what palmistry really reads in it – short, long, broken, double or forked – with a picture of each. | 2,200–3,000 | Where is it? · **Does a short life line mean a short life? (No)**, placed first · Types · Life line age calculation: why we don't do it · Left vs right · Life line vs fate line · FAQ |
| `/fate-line/` | Fate Line on Palm: Meaning, Career Line & No Fate Line | Fate line meaning in palmistry | The fate line (destiny or career line) in palmistry: where it starts, breaks and doubles – and what it means if you have no fate line at all. With pictures. | 2,000–2,800 | Where is it? · Is it the career or luck line? · **No fate line (it's common)**, high up · Where it starts · Breaks, forks, doubles · Fate line and career · What it can't tell you · FAQ |
| `/is-palmistry-real/` | Is Palmistry Real? What Science Says About Palm Reading | Is palmistry real? An honest answer from a palm-reading app | Palmistry is not a science and can't predict the future. What research says, why readings still feel accurate, and how to enjoy palm reading honestly. | 1,800–2,500 | The short answer · What science says (Barnum/Forer effect, cold reading, confirmation bias) · Where palm lines come from · "Palm reading and astrology are examples of…" · Can it predict death, marriage or children? · Do lines change? · So why read palms? · How Palm Read AI handles this · FAQ · Sources |
| `/which-hand-to-read/` | Which Hand to Read in Palmistry: Left or Right? | Which hand do you read in palmistry — left or right? | Most palmists read your dominant hand for your present and the other for your potential. What Indian tradition says for women, plus a 20-second quiz. | 1,200–1,800 | Quick answer · The quiz (embedded) · Dominant vs non-dominant · For women and men (Western vs Indian tradition) · Left-handed? · Which hand for each line · FAQ |
| `/tools/` | Free Palm Reading Tools: Scanner, Quizzes & Line Finders | Free palm reading tools [rec] | Free palmistry tools: read your palm from a photo, check your photo, find which hand to read and learn the lines. Clear labels show which ones use AI. [rec] | 400–600 | Featured tool · Photo tools · Quizzes and finders · Which tools use AI |
| `/tools/palm-photo-checker/` | Palm Photo Checker: Is Your Photo Good Enough to Read? | Palm photo checker [rec] | Check your palm photo before a reading: light, sharpness and whole-palm framing, checked on your phone. Your photo never leaves your device. [rec] | 500–800 | §7.4 |
| `/app/` | Palm Read AI App: Free Palm Reading App for Android | Palm Read AI — the palm reading app that traces your real lines | Scan your palm with your phone camera, see your lines traced and read what they mean. Free to start on Android. What's free, what's paid, and your privacy. | 600–1,000 | §7.6 |

**Hindi P1 titles**
- **Rules:** Devanagari first, then a Hinglish phrase after a separator; about 55 characters or fewer, because Devanagari is wider [R11 §4.2].
- **Titles:**
  - `/hi/`: "फ्री हस्तरेखा स्कैनर ऑनलाइन | Hast Rekha Scanner"
  - `/hi/palm-reading/`: "हाथ की रेखा कैसे देखें (चित्र सहित) | Hath Ki Rekha"
  - `/hi/hand-lines/`: "हाथ की रेखाएं और उनका मतलब | Hast Rekha Gyan"
  - `/hi/fate-line/`: "भाग्य रेखा: कहां होती है, प्रकार और फोटो | Bhagya Rekha"
  - `/hi/heart-line/`: "हृदय रेखा: मतलब, प्रकार और चित्र | Hriday Rekha" [rec, R11 pattern]
  - `/hi/head-line/`: "मस्तिष्क रेखा: प्रकार और मतलब (चित्र सहित)" [rec]
  - `/hi/life-line/`: "हाथ में जीवन रेखा: मतलब और चित्र | Life Line in Hindi" [rec]. Bare "जीवन रेखा" is mostly a hospital brand in autocomplete, so avoid it [R11 §4.1].
- **H1s:** in Devanagari, with a small Hinglish subtitle.

The full P2/P3 blueprints (titles, H1s, meta descriptions, outlines, FAQs, image alt text, links) are in R11 §2.2–2.4. They are adopted as written, except the changes in Appendix A.

### 10.3 Structured data [R11 §2, §2.4]

| Page | Types | Notes |
|---|---|---|
| Home | `WebSite` (name, alternateName, url), `Organization` (logo; `sameAs` = Play listing and our socials), `WebApplication` (LifestyleApplication, operatingSystem "Any", `offers` price 0 in INR and USD, `isAccessibleForFree` true) | No ratings |
| Guides | `Article` (headline, image, datePublished, dateModified, `author` → a `Person` URL, publisher → Organization) + `BreadcrumbList` + `ImageObject` for diagrams (creator, creditText, license, acquireLicensePage) | Licence fields earn the "Licensable" badge in Google Images and attribution links |
| FAQ | Always visible in the HTML. `FAQPage` JSON-LD only on pages with 3 or more FAQs, expecting no rich result (Google limited FAQ rich results to government and health sites in 2023). | [rec] |
| Standalone tools | `WebApplication` + `BreadcrumbList` | — |
| `/tools/` | `CollectionPage` + `ItemList` + `BreadcrumbList` | — |
| `/app/` | `MobileApplication` (operatingSystem ANDROID, the Play Console category, `offers` price 0, installUrl = the Play link with `referrer=utm_source%3Dweb%26utm_medium%3Dapp_page`) + `BreadcrumbList` | **No `aggregateRating`.** The Play rating was not collected on our page. |
| Blog | `BlogPosting` + `BreadcrumbList` | — |
| Author pages | `Person` | — |
| `/is-palmistry-real/` | `Article` with a `citation` list | — |
| Hindi pages | The same types, with `inLanguage: "hi"` and a Hindi headline and description | palmly served English JSON-LD on every language [R05] |
| Never | `HowTo` (retired in 2023); `AggregateRating` or `Review` anywhere, until we collect reviews on our own site under Google's rules; never copy the Play rating into schema | pandit and astroyogi use self-serving ratings [R04, R11 §1.13] |

### 10.4 Canonical and hreflang [R11 §3.3]

- Every indexed page has a self-referencing absolute canonical, for example `https://<domain>/heart-line/`.
- hreflang is used only between true translations: `en` ↔ `hi`, plus `x-default` pointing to the English URL. Both pages list each other; a one-sided pair makes the build check fail.
- Use plain `hi` and `en`, not `hi-IN` or `en-US`. No separate Hinglish pages; Hinglish lives inside the Hindi page.
- Hindi-only pages (for example `/hi/hast-rekha/` when there is no equivalent English page) get `hreflang="hi"` pointing to themselves only, with no x-default.
- `/life-line/broken/` gets no hreflang until a real Hindi version exists.
- Never set a Hindi page's canonical to its English twin.
- hreflang goes in the `<head>`. If it is also in `sitemap-hi.xml`, the two must match exactly.

### 10.5 Sitemaps, robots.txt, llms.txt and AI crawlers

**Sitemaps.** `/sitemap-index.xml` points to 5 group sitemaps: `sitemap-core.xml`, `sitemap-guides.xml`, `sitemap-tools.xml`, `sitemap-blog.xml` and `sitemap-hi.xml`.
- They are built with the sitemap integration's chunking or a small build endpoint [rec].
- Each is submitted separately in Search Console, so indexing can be filtered per group.
- Only pages that return 200, are canonical and are indexable go in.
- `lastmod` changes only when the main content changes [R11 §3.4].

**`robots.txt`** (settles a conflict between R09 and R11):

```
User-agent: *
Allow: /
Sitemap: https://<domain>/sitemap-index.xml
```

`/reading/` and `/account/` are **not** disallowed. They carry `noindex`, and Google has to be able to crawl them to see it; they are never in the sitemap. R11 had listed them as disallowed, and R09's reasoning wins. There is no `/api/` path on the site, because the API lives on `api.<domain>`.

**AI crawlers (decision D6).**
- **Recommendation:** allow the search-and-answer bots (OAI-SearchBot, PerplexityBot, Claude-SearchBot; Googlebot already covers AI Overviews), so we can be cited.
- **Training bots** (GPTBot, ClaudeBot, CCBot, Google-Extended) are a policy choice. Blocking Google-Extended does not affect Google Search.
- **If any bot is blocked:** give it its own group, and repeat every disallow inside each named group. palmmitra's robots file fails at this [R02 §7].

**`/llms.txt`.** Short Markdown:
- what Palm Read AI is;
- the honesty rules (what we never predict);
- the free rule;
- links to home, `/hand-lines/`, the 4 pillars, `/is-palmistry-real/`, `/app/` and `/hi/`.

Facts come from `site.ts`, so it cannot drift (palmmitra's `llms.txt` contradicts its site) [R02]. It is cheap, but no search engine has said it uses the file [R11 §3.4].

**PDF lead magnet (decision D17).** The landing page is indexable. The PDF file itself carries `X-Robots-Tag: noindex`, so search can't bypass the opt-in.

### 10.6 E-E-A-T (trust signals for search) [R11 §3.7]

All of these are built before the P2 guides publish.

| Page or element | Contents |
|---|---|
| `/about/` | Who makes Palm Read AI, why, the company details, contact |
| `/about/<name>/` | A real person: photo, how they know palmistry (years, books, readings), what they don't claim. A separate page for the Hindi reviewer. No invented personas. |
| `/editorial-policy/` | Where meanings come from (named classical sources per meaning — for example Cheiro, *Language of the Hand*, 1894; W. G. Benham, *The Laws of Scientific Hand Reading*, 1900, both public domain; the Samudrika Shastra tradition for Indian readings). What we never predict. How AI is used (it traces lines on the photo; the text comes from a fixed rule set reviewed by a person). How corrections work. How often pages are updated. |
| `/how-it-works/` | What the AI does with the photo, where it is processed and how long anything is kept. It must match §8.4 word for word. |
| Every guide | Byline, reviewer, "last reviewed" date, sources box. `author.url` in `Article`. |

If no real palmistry-experienced person can be named, fall back to an honest "Written by the Palm Read AI team, reviewed by {real name}" [R01 V7].

### 10.7 Image SEO [R11 §3.5, §3.10]

- **Diagrams** are original SVG *files*, used through `<img src="/img/diagrams/heart-line-types.svg" alt=… width height>`, because inline SVG is not indexed by Google Images. They have readable labels, our colours, a tiny site URL in the corner, captions and licence fields.
- **Photos** (real traced palms) are AVIF and WebP in `<picture>`, with `srcset` at 480/768/1,200/1,600 px and explicit width and height. The hero image is 80 KB or less and never lazy-loaded; other images are 60 KB or less.
- **Google Discover:** every guide has one raster image at least 1,200 px wide, used as `og:image` and `Article.image`, plus `max-image-preview:large` on every page. Titles are honest, not clickbait.
- **File names** describe the image (`forked-heart-line.svg`), and alt text describes what is shown.
- **Only real, consented hand photos.** Never user uploads.
- **Search terms to cover** with labelled diagrams: "palm reading chart", "palmistry images", "हस्त रेखा चित्र सहित", "भाग्य रेखा फोटो", "विवाह रेखा की फोटो". **Discover candidates:** M on palm, lucky signs, simian line, hand-type result.

### 10.8 Core Web Vitals

Budgets are in §5.14: LCP ≤ 2.0 s on guides and ≤ 2.3 s on home, INP ≤ 150 ms, CLS ≤ 0.05, TTFB ≤ 200 ms. Check them in Search Console's Core Web Vitals report (field data) and in Lighthouse CI on every build (lab data) [R11 §3.6].

### 10.9 Search Console setup [R11 §3.11]

- Use a Domain property. Add Bing Webmaster Tools (imported from Search Console) and turn on IndexNow through Cloudflare Crawler Hints.
- Turn on the free BigQuery bulk export on day 1.
- **Page groups** as regex filters, bookmarked:

  | Group | Regex |
  |---|---|
  | Home | `^https://<domain>/$` |
  | Hindi | `/hi/` |
  | Pillars | `/(heart\|head\|life\|fate)-line/` |
  | Hubs | `/(hand-lines\|palm-reading)/$` |
  | Honest topics (YMYL) | `/(marriage-line\|children-line\|simian-line\|mercury-line\|is-palmistry-real)/` |
  | Tools | `/tools/` |
  | Blog | `/blog/` |
  | App page | `/app/$` |

- **Brand filter:** exclude `palm read ai|palmreadai` to see non-brand growth.
- **App Links effect:** on Android phones with the app installed, taps on the 6 App Link paths open the app. Search Console counts the click, but web analytics sees no visit. Expect more Search Console clicks than web sessions on those pages.
- **Before launch:** a 10-minute manual check of 12 keywords in an incognito US Google session: images pack, video pack, the first 4 "People also ask" questions, AI Overview yes/no [R11 §0].

### 10.10 30/60/90-day SEO roadmap (aligned with the build phases in §14) [R11 §3.12]

"Days" means days after launch. The build (§14) can finish sooner, but publishing is paced: at most 5–8 new guides a week, and each Hindi page goes live only once it has been reviewed [R11 §3.9].

**Days 0–30: launch P1, then start P2**
- Pages:
  - P1 live;
  - then `/life-line/broken/`, the trust pages, and the line-finder and quiz tool pages.
- Technical:
  - split sitemaps, robots.txt, canonical and hreflang, breadcrumbs;
  - schema checked in the Rich Results Test;
  - CWV budgets met in Lighthouse CI;
  - 404 page and redirects working.
- Original diagram set: a master chart and about 40 variation SVGs.
- Hindi: `/hi/` and the 2 hubs, then the pillars as the owner reviews them.
- Search Console, Bing and the BigQuery export set up. Request indexing for the P1 set once.
- Links:
  - the Play listing links to the site;
  - our own social profiles;
  - our licensed diagrams shared in a few palmistry communities;
  - no link buying.

**Days 31–60: low-difficulty wins and Hindi pillars**
- P2 guides in this order: career palmistry (KD 5), marriage line (KD 7), M on palm, money line, hand types (+ finder), simian line, sun line, palm crosses, children lines, lucky signs (+ checker).
- Blog posts 1–5.
- Hindi, as each page is reviewed:
  - any of the 4 pillars not yet live;
  - marriage and which-hand;
  - M, money, lucky signs, children;
  - the tools hub (§11.3 rows 4–7 and 9–15).
- First Search Console pass: rewrite titles and meta descriptions on pages in positions 1–10 with CTR under 2%.
- Re-map Hindi targets once the India export arrives.

**Days 61–90: depth and assets**
- P3 pages: mounts, history, fingers, mercury line, Indian palmistry with `/hi/hast-rekha/`, Chinese palmistry.
- Publish the PDF (English and Hindi). Blog posts 6–7.
- Refresh P1 pages from queries sitting at positions 8–20.
- Embed the first 60–90-second videos on the 4 pillars (`VideoObject`).
- Review "Crawled – currently not indexed" pages; merge rather than add.
- KPIs reported separately: indexed ÷ submitted, non-brand impressions and clicks by group, CTR by group, organic reading starts, store clicks by page, Hindi share of impressions.

---

## 11. Content plan

### 11.1 Guide template blocks (in order)

The order is in §7.2. Every block must earn its place.

| Block | What it contains | Why |
|---|---|---|
| Answer first | 40 words or fewer | Featured snippets and AI answers |
| Quick facts | Hindi and Sanskrit names | Authenticity; catches Hinglish searches |
| Variation cards | A diagram per type | Images win in this niche |
| Myth vs reality | Common myths answered | Trust |
| Limits box | What palmistry can't tell you, plus the §4.5 tone rules on sensitive topics | Safety on sensitive topics |
| Sources | Per meaning | E-E-A-T |
| Photo tips | How to take the photo | Feeds the reading |
| FAQ | Questions from autocomplete | Long-tail searches |
| Step pager | Step n of 7 | Learning path |
| End CTA | Gold button + Play badge | Conversion |

### 11.2 Word counts (from the search-result study [R11 §1, §2])

| Page | Target at SERP depth | P1 first version |
|---|---|---|
| Home (below the tool) | 900–1,400 | same |
| `/hand-lines/`, `/palm-reading/` | 2,500–3,500 / 2,500–3,300 | compact but complete [rec] |
| Heart, life / fate / head pillars | 2,200–3,000 / 2,000–2,800 / 1,800–2,500 | compact but complete [rec] |
| `/is-palmistry-real/` | 1,800–2,500, every claim cited | full |
| `/which-hand-to-read/` | 1,200–1,800 | full |
| `/life-line/broken/` | 1,200–1,800 | — |
| Marriage, hand types, indian palmistry | 1,800–2,500 | — |
| Career, chinese | 1,500–2,200 | — |
| Simian, lucky signs, mounts, history | 1,500–2,000 | — |
| M, money, sun, crosses | 1,200–1,800 | — |
| Fingers, children, mercury | 1,200–1,600 / 1,000–1,500 / 1,000–1,400 | — |
| Standalone tools / `/tools/` / `/app/` | 400–900 / 400–600 / 600–1,000 | same |
| Blog posts | 1,000–1,800 [rec, from R03] | — |

R09 gave 2.5 h to port 6 P1 pages. The P1 versions therefore start from the app's existing EN + HI guide text (`web/guides/content.mjs`) plus sources. They reach the SERP-depth targets in the days 31–60 refresh.

A complete, shorter page beats a padded long one [rec, consistent with R11's "complete, not padded" rule].

### 11.3 Hindi plan [R11 §4]

**Script rules:**
- **Body text:** simple, spoken-style Devanagari. On first use, key terms get Hinglish or English in brackets: "हृदय रेखा (Heart Line / hriday rekha)".
- **Titles:** Devanagari first, then a Hinglish phrase.
- **H1:** Devanagari, with a small Hinglish subtitle.
- **FAQ:** Devanagari, plus 1–2 questions written in Hinglish.
- **URLs:** English slugs under `/hi/`.
- **Pages:** no separate Hinglish pages.
- **Structured data:** `inLanguage: "hi"`.
- **Modifiers to cover on every Hindi page:** चित्र सहित / with photo, महिला / पुरुष (for female / for male), कहां होती है / कौन सी है, pdf, app / scanner, signs on lines (त्रिशूल, मछली, त्रिभुज, क्रॉस, चतुर्भुज), दो मुखी (forked).

| # | Hindi URL | English twin | Main Hindi / Hinglish targets | Phase |
|---|---|---|---|---|
| 1 | `/hi/` | `/` | ऑनलाइन हस्तरेखा स्कैनर free · hast rekha scanner online · hath ki rekha online check | P1 |
| 2 | `/hi/palm-reading/` | `/palm-reading/` | हाथ की रेखा कैसे देखें · hath ki rekha kaise dekhe · हस्त रेखा ज्ञान चित्र सहित | P1 |
| 3 | `/hi/hand-lines/` | `/hand-lines/` | हाथ की रेखाएं क्या बताती है · हस्तरेखा ज्ञान | P1 |
| 4–7 | `/hi/fate-line/`, `/hi/heart-line/`, `/hi/head-line/`, `/hi/life-line/` | pillars | भाग्य रेखा · हृदय रेखा · मस्तिष्क रेखा · हाथ में जीवन रेखा | P1 if reviewed in time, otherwise days 31–60 |
| 8 | `/hi/app/` | `/app/` | hast rekha app · हस्तरेखा app | P1 |
| 9 | `/hi/marriage-line/` | `/marriage-line/` | शादी की रेखा · विवाह रेखा · shadi ki rekha konsi hoti hai | P2 |
| 10 | `/hi/which-hand-to-read/` | `/which-hand-to-read/` | palm reading for female which hand · महिला का कौन सा हाथ देखें | P2 |
| 11 | `/hi/palmistry-m/` | `/palmistry-m/` | hath me m ka nishan · हाथ में M का निशान | P2 |
| 12 | `/hi/money-line/` | `/money-line/` | धन रेखा · dhan rekha in hand | P2 |
| 13 | `/hi/lucky-signs/` | `/lucky-signs/` | हाथ में त्रिशूल / मछली / त्रिभुज का निशान | P2 |
| 14 | `/hi/children-line/` | `/children-line/` | संतान रेखा · santan rekha | P2 |
| 15 | `/hi/tools/` (+ tools) | `/tools/` | हस्त रेखा स्कैनर इन हिंदी | P2 |
| 16 | `/hi/palmistry-pdf/` | `/palmistry-pdf/` | हस्त रेखा ज्ञान pdf · hast rekha book pdf | P2 build; publish in days 61–90 |
| 17 | `/hi/hast-rekha/` | `/indian-palmistry/` (only if equivalent) | हस्तरेखा शास्त्र · hast rekha shastra | P3 |

**Rule:** a Hindi page goes live only after the owner or the named Hindi reviewer has read it. Nothing is machine-published [R11 §4.3, R09 risk 10]. When an English page changes, its Hindi twin is re-checked within 2 weeks.

### 11.4 Lead magnet: the Hindi palm-reading PDF [R11 §4.3, R01 A7]

- **Why Hindi first:** PDF demand is much stronger in Hindi ("हस्त रेखा ज्ञान pdf", "हाथ की रेखा देखने का तरीका pdf") than in English.
- **What's in it:** a printable palm chart with the 4 lines and mounts; how to read each line in 1 page each; "what palmistry can't tell you"; photo tips; a link to the free reading. 8–12 pages [rec]. English version second.
- **Opt-in:**
  - an email field;
  - a separate, **unticked** box for "one palm tip a week";
  - a plain notice (DPDP);
  - double opt-in through S13;
  - one-click unsubscribe;
  - a postal address in any marketing email (CAN-SPAM).
- **Indexing:** the PDF file is `noindex` (D17).
- **Follow-up:** only the delivery email, until a weekly-tip email is approved later.

### 11.5 Blog plan [R11 §2.4]

The blog is not the main SEO engine; the guides are. The blog holds long-tail questions, photo how-tos, myths, app news and Hindi articles. Each post links to one pillar and to home.

| # | Post | Why |
|---|---|---|
| 1 | `/blog/palm-reading-chatgpt-vs-palm-scanner/` | Autocomplete: "palm reading free chatgpt". A chatbot can't show where your lines are. |
| 2 | `/blog/best-palm-reading-apps/` | An honest test, with our own app disclosed. Targets the listicle slot. |
| 3 | `/blog/do-palm-lines-change/` | The pillars' FAQs link here |
| 4 | `/blog/how-to-take-a-palm-photo/` | Supports the photo checker |
| 5 | `/blog/palm-reading-for-female/` | Strong autocomplete in English and Hindi |
| 6 | `/blog/rarest-palm-lines/` | Curiosity; a Discover candidate |
| 7 | `/blog/can-palm-reading-predict-death/` | A fear query, answered honestly; links to the life line |

**Pace:** posts 1–5 in P2 (days 31–60), 6–7 in days 61–90. Then about 1 post a week in English plus Hindi posts as they are reviewed [rec]. No dates in URLs.

### 11.6 Review workflow (every page)

1. **Brief** from §10 and R11: keyword, outline, FAQ taken from autocomplete.
2. **Draft** (Claude), from the app's rule set and classical sources.
3. **Automatic checks** (`check-site.mjs`):
   - title and meta description length; one H1; canonical;
   - hreflang pairs both ways; no broken links;
   - the sitemap equals the indexable pages;
   - every `ymyl` page has the `LimitsBox`;
   - the banned-words list (§4.5);
   - no year, age or count predictions;
   - every `ruleIds` entry exists in `lib/palm`;
   - `updated` date is not before `published` [R09 §3.3].
4. **Fact and source check.** Every meaning has a source. The simian page uses only MedlinePlus or UF Health level medical facts.
5. **Named English reviewer** reads it, which adds "Reviewed by" and the date.
6. **Hindi:** written as Hindi, then read by the owner or the named Hindi reviewer.
7. **Owner OK** for sensitive topics: marriage, children, lifespan, simian line, mercury line.
8. **Publish:** at most 5–8 new guides a week.
9. **Refresh:**
   - P1 pages every 3 months, driven by Search Console queries at positions 8–20;
   - P2 and P3 pages every 6 months;
   - tools checked monthly;
   - `/app/` on every app release;
   - a yearly blog prune (posts with no impressions after 12 months are merged into their pillar) [R11 §3.8].

### 11.7 Guardrails against "scaled content" [R11 §3.9]

- **No templated pages** per zodiac sign × line, per city, per gender, per age or per name.
- **A variation gets its own URL only if** it has clear separate demand (about 200+ US searches a month, or strong autocomplete) **and** 1,000+ useful unique words with its own images. `/life-line/broken/` qualifies; everything else is an H3 inside the pillar.
- **Tool results never create indexable URLs.**
- **No bulk publishing of machine translations.**
- **Fewer, strong pages** rather than many thin ones. Google's March 2024 spam policy targets pages made mainly to rank, however they were made.

---

## 12. Tech stack and architecture

### 12.1 Decisions

| Area | Decision | Why | Source |
|---|---|---|---|
| Framework | Astro 7.3.x, `output: 'static'`, exact pinned versions, `trailingSlash: 'always'`, `build.format: 'directory'` | Static HTML per page and 0 KB JS on guides. Cloudflare owns the Astro team. Scored 92/100 vs SvelteKit 78 and Next.js 74. | R09 §1 |
| Interactivity | React 19 islands (`client:visible` or `client:idle`) for the reading flow (`ReadingApp`, one island, `client:only`), the standalone tools and the account pages. Embedded guide tools use Preact or plain TypeScript to stay within 10 KB (§5.14). Tiny shared state through nanostores. The home upload starter is a plain Astro script. | Islands don't share state; keep home and guides light | R09 §1.2 |
| Content | MDX content collections with Zod 4 schemas. MDX kept simple: components, few remark plugins. | Astro 7 has a new Rust Markdown pipeline | R09 §1.1 |
| Styling | Tailwind 4 `@theme` tokens (shadcn variable names). Zero-JS `.astro` components on static pages; shadcn components only inside islands; native `<details>` for FAQs. | One token set | R09 §2.4 |
| Hosting | Cloudflare Workers with static assets (`wrangler.jsonc`, `assets.directory: "./dist"`, no Worker script) — **not Pages** | Astro's Cloudflare adapter v14 dropped Pages. New features land on Workers first. Static requests are free. Nothing is live yet, so nothing breaks. | R09 §0, §1.1 |
| Backend access | Only `api.<domain>` (the app's `palm-api` proxy Worker) in front of Supabase | Indian ISPs DNS-block `*.supabase.co` (BUG-030) | R09 §3.6 |
| i18n | Astro i18n routing (English default, Hindi under `/hi/`). Paraglide JS for UI strings. Our `SeoHead` component writes hreflang and x-default. The sitemap adds i18n alternates. | Astro doesn't write hreflang tags itself | R09 §2.3 |
| Auth | Supabase JS through the proxy: an anonymous guest, then email + 6-digit code (`updateUser` + `verifyOtp('email_change')`). Google sign-in later. | Same as the app; the OAuth callback runs on the blocked host | R09 §3.6 |
| Bot check | Cloudflare Turnstile (`react-turnstile`, 2.6 KB), checked in the web-only `web-gate` function. Never Supabase's project-wide captcha. | The app's anonymous sign-in sends no token | R09 S3, S7 |
| Site images | Astro `<Picture>` → AVIF + WebP at 480/960/1,440 px with explicit sizes. Diagrams as SVG files. | No layout shift; image search | R09 §3.9, R11 §3.5 |
| User photos | Native `createImageBitmap` + canvas (EXIF rotation applied, EXIF removed). `pica` only if lines blur. HEIC fallback per D15. Never put `image/heic` in `accept`. | 0 KB; privacy | R09 §2.5 |
| Line overlay | Plain inline SVG in the photo's coordinates, drawn in with `stroke-dasharray`. `perfect-freehand` optional (2 KB). | 0 KB | R09 §2.6 |
| OG images | `astro-og-canvas` at build time, with Hindi text shaping tested on day 1. Fallback: a Playwright screenshot script. Not Satori for Hindi. | Satori has known Devanagari shaping bugs | R09 §2.6 |
| QR codes | `uqr` at build time, output as SVG | No third-party QR service | R09 §2.7 |
| Site search | None at launch. Pagefind (which supports Hindi) at about 40 posts. | The site is small | R09 §3.11 |
| Analytics | Cloudflare Web Analytics (no cookies) + funnel counts sent to `log_event_counts` (0021) | No cookie banner needed | R09 §3.10 |
| Tests | Vitest (lib/palm parity, lib/web), Playwright smoke tests (home, reading with a mocked backend, `/hi/`), `check-site.mjs`, Lighthouse CI | — | R09 §3.1 |
| CI/CD | GitHub → Workers Builds (or a GitHub Action with a pinned wrangler): `astro check && vitest run && astro build && node scripts/check-site.mjs` | — | R09 §3.12 |
| Not used | Next.js (a runtime on every page; SSR on the free plan is fragile), SvelteKit (a new language for future sessions), AGPL libraries such as kerykeion, LGPL code bundled into our own files, model weights trained on scraped photos, third-party tag managers | — | R09 §1–2 |

### 12.2 Folder structure [R09 §3.1]

```
palm-ai-website/
  astro.config.mjs        static output, site, trailingSlash 'always', i18n {en, hi}, react, mdx, sitemap(i18n)
  wrangler.jsonc          assets ./dist, html_handling auto-trailing-slash, not_found_handling 404-page
  public/_headers         security + cache headers (§12.9)
  public/_redirects       /privacy.html → /privacy/ 301, etc. (§12.11)
  messages/en.json, hi.json   UI strings (Paraglide); guides are MDX, not strings
  src/config/site.ts      THE ONE PLACE: brand, brandHi, domain, apiUrl (api.<domain>), Supabase publishable key,
                          Turnstile site key, playPackage (com.palmreadai.app), locales, free-reading numbers,
                          app prices + size (from Play), measured p50, Play rating threshold, iosAppAvailable=false
  src/content.config.ts   collections: guides, blog, tools, faqs
  src/content/guides/{en,hi}/*.mdx · blog/{en,hi}/*.mdx · tools/*.yaml
  src/layouts/            Base, Guide, Tool, Legal, Blog
  src/components/         zero-JS .astro: SeoHead, LangSwitch, StoreButton, QrCode, Faq, LimitsBox, SourcesList,
                          StepOf7, Breadcrumbs, PalmDiagram, QuickFacts, VariationCard, Byline
  src/islands/            React: ReadingApp, PhotoChecker, LineFinder, SpotTheLineQuiz, AccountPanel, DeleteAccount, PdfOptIn
                          Preact / plain TS (≤ 10 KB, embedded in guides): PalmMap, WhichHandQuiz, LineMeaningFinder,
                          HandTypeFinder, SignsChecker
  src/scripts/            upload-start.ts (home, no React)
  src/lib/palm/           COPIED pure TypeScript from the app + SOURCE.md (app commit, date, file list, sha256)
  src/lib/web/            supabase.ts (via proxy), image.ts, quality.ts, api.ts, idb.ts, events.ts, store-link.ts
  src/pages/              index, [...slug] (guides, both languages), tools/…, blog/…, app, reading, account,
                          privacy, terms, delete-account, reset-password, 404, robots.txt.ts, llms.txt.ts,
                          .well-known/assetlinks.json.ts, og/[...path].png.ts, hi/…
  src/styles/global.css   Tailwind 4 @theme tokens (§5)
  scripts/sync-palm-lib.mjs · scripts/check-site.mjs
  tests/                  vitest + Playwright
```

### 12.3 Content collections (guides) [R09 §3.3]

**Fields:**
- `title` (≤ 60), `description` (70–160), `locale` (`en` | `hi`), `slug`;
- `translationKey` (pairs English and Hindi; the build fails on one-sided pairs);
- `pillar`, `isPillar`;
- `keywordCluster` {primary, secondary ≤ 15, usVolume, kd, inVolume};
- `related` (≤ 6), `tool` (a reference), `appLesson` (the deep-link target);
- `sources[]` {title, author, year, url, ruleIds} (at least 1);
- `reviewedBy` {name, role, date}, `published`, `updated`;
- `ymyl` (`none` | `marriage` | `children` | `lifespan` | `health`), which forces the limits box and the wording checks;
- `stepOf7`, `faq[]` (≤ 8), `heroImage`, `draft`, `noindex`.

The blog reuses these and adds `pillarLink` and `author`. Tools are YAML files with:
- `id`, and titles and descriptions per language;
- `kind` (`photo-ai` | `photo-local` | `quiz` | `picker` | `map`);
- `usesAI` (shown as a label);
- `island`, `relatedGuides`, `faq`, `limits`, `howItWorks`.

### 12.4 Languages

- `astro.config`: `i18n { defaultLocale: 'en', locales: ['en','hi'], routing: { prefixDefaultLocale: false } }`.
- `<html lang="hi">` on Hindi pages (Pagefind and screen readers depend on it).
- `:lang(hi)` CSS sets taller line heights and the Devanagari fonts.
- The reading screen is one route whose language follows the page the visitor came from, or their saved choice.
- Report text uses the app's `localise.ts`, so Hindi reports are the app's own.

### 12.5 Accounts

- The session lives in `localStorage`.
- `/account/` shows the email (if any), free readings left (`reading_balance()`), "Delete my data and account" (the app's `delete-account` function, using the site's bundled supabase-js rather than a CDN copy), and sign out.
- **[verify]** that deletion works for guest users.
- **Later [rec]:** signed-in users can reopen past report text from the server (without the photo).

### 12.6 Reusing the app's code: copy, never link [R09 §3.5]

**How:** `scripts/sync-palm-lib.mjs <app-commit>`
- copies a whitelist of files into `src/lib/palm/`;
- rewrites their imports;
- **fails** if any file imports `react-native`, `expo*`, or `@/lib/…` from outside the whitelist;
- writes `SOURCE.md` (commit, date, files, sha256).

The app's own tests are copied too and run here as a parity check. The web shows `ruleSetVersion`, and the sync is re-run on every app rule change.

**What moves, and how:**

| Treatment | Files |
|---|---|
| Copied as is | `knowledge/**`, `knowledge/synthesis/**`, `reading/{report-sections, access, summary, humanise, localise, basis, books, focus, writer, pipeline}`, `observation/*`, `lines/{bands, derived, merge, types, band-config}`, `report-v2/*`, `quality/{metrics, verdict, live, review}`, the pure parts of `vision/*`, `lib/base64`, `theme` colours |
| Small web shims | `quality/gate.ts` (canvas instead of expo-image-manipulator), `vision/remote.ts` and `lines/client.ts` (browser fetch and canvas), `reading/repository.ts` and `access-api.ts` (the web Supabase client) |
| Rewritten for the web | `start-scan.ts`, `store.ts`, `report-lang.ts` |

**Bundle rule:** the knowledge and synthesis code is the largest JavaScript in the site. It loads with `import()` on `/reading/` only after the upload starts, never on guide pages. Tools get small build-time slices of the rule data as props.

### 12.7 Analytics without cookies [R09 §3.10]

- **Page views and Web Vitals:** Cloudflare Web Analytics. It sets no cookies and collects no personal data, but it has no custom events.
- **Funnel events** (§13.3): batched and sent to `log_event_counts` (S10) with `app_version='web'`, using `fetch(…, {keepalive: true})` on `pagehide`. Counts only: no user ID, no cookie. These are listed in the privacy page, and no consent banner is needed.
- **Play installs per page:** the Play link carries `&referrer=utm_source%3Dweb%26utm_medium%3D<page>%26utm_campaign%3D<placement>` and shows up in Play Console's acquisition report.
- **Decision D11:** cookie-free analytics only. That keeps "no cookie banner" true.
- **[verify] before the footer says "No cookies":** open the live site in browser devtools and confirm that no cookie is set. Cloudflare's bot features can set a `__cf_bm` cookie (seen on pandit.ai's Cloudflare setup [R04 §1]), and Turnstile's own storage must be checked too. If a cookie appears, turn the feature off or drop the claim.

### 12.8 OG images

- One 1,200 × 630 image per page and language, built at build time from the brand background and the title.
- It must pass a Hindi conjunct test on day 1 (हस्तरेखा, ज्ञान). The fallback is the Playwright screenshot script.
- Share cards for individual readings are drawn in the browser (canvas → PNG → Web Share API / WhatsApp), never on a server [R09 §3.11].

### 12.9 Security [R09 §3.8]

**Headers (`_headers`, every page):**
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin` — so Play and analytics can see our referrer. Stricter on `/reading/`, `/account/` and the legal account pages.
- `X-Frame-Options: DENY` and `frame-ancestors 'none'`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()` — the `capture` file input opens the camera app, which this rule does not block.

**CSP:** Astro's built-in CSP (hashes of its own scripts and styles), plus:
- `default-src 'self'; img-src 'self' data: blob:`
- `connect-src 'self' https://api.<domain> https://cloudflareinsights.com`
- `script-src 'self' https://challenges.cloudflare.com https://static.cloudflareinsights.com`
- `frame-src https://challenges.cloudflare.com; worker-src 'self' blob:`
- `object-src 'none'; base-uri 'none'; form-action 'self'`
- No `unsafe-eval`. `'wasm-unsafe-eval'` only on `/reading/`, and only if a WASM decoder is added.

**Secrets:**
- The site holds only public values: the publishable key (`sb_publishable_…`, since legacy anon keys are deprecated by the end of 2026), the Turnstile site key and the proxy URL.
- `TURNSTILE_SECRET` lives only in Supabase function secrets.
- The deploy token is scoped to this Worker.
- No `.env` values in git.

**Rate limits and abuse controls:** all live on the server side (Turnstile gate, web caps, per-IP limits, the proxy Worker's rate-limiting binding). They are listed in §8.6. The static site itself needs none.

**Cross-site scripting:** report text is rendered as React text (no `dangerouslySetInnerHTML`). MDX is written by us. There is no user-generated content.

**Uptime:** monitor `/`, `/hi/`, `/sitemap-index.xml`, one tool page and `api.<domain>`, with certificate-expiry alerts. palmly went down because its certificate expired [R05].

### 12.10 Deployment, previews and rollback [R09 §3.12]

- **Deploy:** GitHub → Workers Builds on every push to `main`.
- **Previews:** `wrangler versions upload --preview-alias <branch>` gives `<branch>-palm-web.<account>.workers.dev`.
  - Every preview page carries `noindex`.
  - The reading runs in **mock mode** (a stored real result), because the app has one Supabase project for both dev and prod.
  - A preview with the real backend only sits behind Cloudflare Access.
- **Rollback:** `wrangler rollback` or the dashboard (the last 100 versions). Practise it once on day 1, and confirm that static assets roll back with the version.

### 12.11 Moving the legal pages (settles a conflict between R09 and R11)

- **The move:** `privacy`, `terms`, `delete-account` and `reset-password` move from the app's `web/` folder into Astro pages that use the shared layout.
- **New canonical URLs:** `/privacy/`, `/terms/`, `/delete-account/`, `/reset-password/`.
- **Old URLs keep working:** the `.html` names that the app and Play Console already use get a `301` redirect in `_redirects`. Browsers keep the `#…` part across a redirect.
- **Test before launch:** all 8 URL variants on the preview. Without these rules, Workers' default would send `/privacy.html` to `/privacy` with a 307.
- **Changes inside the pages:**
  - `delete-account` uses the site's bundled supabase-js.
  - `reset-password` becomes "enter the code from the email", or a pointer to the app. Its old link flow is orphaned, because the app now resets with a 6-digit code.
- **App Links file:** `assetlinks.json` is served with no redirect, as `application/json`.
- **Update links:** point the app and Play Console at the new URLs at the next app release (S11).
- **Fallback:** if Play Console's URL check rejects the redirect, serve the `.html` pages directly with a self-canonical (R11's original advice).

### 12.12 Photo handling on real phones [R09 §2.5, §3.9]

1. Decode with `createImageBitmap(file, { resizeWidth })`, so a 48 MP photo is never decoded at full size on a budget phone.
2. Make one canvas pass per size:
   - 1,080 px: kept in the browser and sent to the scan;
   - 768 px: sent to extract;
   - 96 px: used for the quality check (the app's own gate size).
3. Process off the main thread where possible.
4. HEIC:
   - on an iPhone, Safari's picker usually hands over a JPEG [verify on a real iPhone];
   - if decoding fails on desktop, apply decision D15.
5. Keep `accept="image/*"`, with `capture="environment"` on the phone's camera button.
6. The in-app browser notice (§8.3).

---

## 13. Measurement plan and dashboard

### 13.1 Sources (always kept separate)

| Stream | Tool | What it answers |
|---|---|---|
| Web search | Search Console (+ Bing, BigQuery export) | Impressions, clicks, CTR and position per page group; indexing per sitemap; Hindi share |
| Website | Cloudflare Web Analytics | Visits per page, referrers (WhatsApp, Instagram), countries, devices, CWV field data |
| Funnel | `log_event_counts` (`app_version='web'`) + `reading_sessions.source='web'` + `app_usage_daily` | Uploads, checks, readings, sign-ups, store clicks; cost and abuse |
| Google Play | Play Console | Store visitors and installs by `utm_source=web` / `utm_medium=<page>` / `utm_campaign=<placement>`; the honesty KPI in reviews |
| App Store | none (no iOS app) | Count `iphone_note_shown` events to size iPhone demand |

### 13.2 Dashboard (one page, weekly)

A Looker Studio report on Search Console + BigQuery, plus a saved Supabase SQL view for the funnel [rec].

| Panel | What it shows |
|---|---|
| A. Search | Non-brand clicks and impressions by group; Hindi share; top rising queries at positions 8–20; indexed ÷ submitted |
| B. Site | Visits by page and referrer; CWV (LCP, INP, CLS) by page type |
| C. Funnel | Home visit → upload start → check pass → reading start → reading done → sign-up → reading 2 → zero state → store click. The weekly rate at each step. |
| D. Play | Installs by page and placement from the website; store-listing conversion |
| E. Cost and abuse | Web readings per day against the web cap; 429 errors by code; Turnstile failures; refunds (422, 503) |
| F. Honesty | 1–3★ reviews mentioning free, fake, scam or charged |

**Note for panel A:** App Links make Search Console clicks higher than web sessions on the 6 App Link paths.

### 13.3 Funnel events [rec; check the names against migration 0021's accepted list]

- **Upload and photo check:** `upload_start`, `photo_check_pass`, `photo_check_fail{reason}`, `sample_hand_open`
- **Reading:** `reading_start`, `lines_found`, `reading_done`, `reading_error{code}`
- **Locks and sign-up:** `lock_tap{section}`, `signup_start`, `signup_done`, `reading2_start`, `reading2_done`
- **App hand-off:** `zero_state_view`, `store_click{page, placement, device}`, `qr_view`, `whatsapp_self`, `iphone_note_shown`, `inapp_browser_note`
- **Other:** `share_card_create`, `tool_use{tool}`, `pdf_optin`

No personal data goes into any event.

### 13.4 Weekly report

One page:
1. Search
2. Site
3. Funnel
4. Play
5. Cost and abuse
6. Honesty KPI
7. Actions for next week

Web search, website, Play and App Store numbers are never added together [v1, R11 §3.12].

---

## 14. Build plan

Hours are focused build time with Claude doing the coding. Owner time (reviewing, reading Hindi, dashboard steps, photos, phone tests) comes on top [R09 §4.1].

### 14.1 Phases

| Phase | Scope | Hours | Depends on |
|---|---|---|---|
| **P0: decisions and set-up** | The owner answers the §16 A-list; picks the brand and domain; gives Cloudflare account access; creates the Turnstile site; schedules the consented hand photos | owner time (about 1–2 h) | — |
| **P1: launchable site** | The static P1 site, the three P1 tools (photo checker, which-hand quiz, palm map), and the live reading with sign-up and the zero state | **≈ 27 h** website | Days 1–2 can run now; Day 3 needs S1–S4, S6–S8 and the domain |
| **P1-server: app repo** | S1–S4, S6–S8 (a separate session in the app repo) | **≈ 11 h** | Owner approval; S5 budget |
| **P2: the "week 1" scope in R09** | P2 guides, tools 2, 4–7, 10, 12, blog posts 1–5, the PDF with opt-in, the India keyword pass, Hindi tools | **≈ 45 h** | P1 live; trust pages; S13 for the PDF |
| **P2 extras** (not in R09's hours) | Trust pages; about 40 original SVG diagrams; Hindi twins of 6 P2 guides; the hand-type finder (tool 9, moved out of P1) | **≈ 20 h** [rec, not measured] | A named author and reviewer |
| **P3: later** | §14.5 | open | Data from P1 and P2 |

**Total for P1 + P2:** about 27 + 11 + 45 + 20 = **about 103 h**. That is roughly 12 focused working days, or 2–3 calendar weeks with owner review. It is not one day, and not one week.

### 14.2 P1 by day [R09 §4.1]

**Day 1: static P1 site on a preview (≈ 10 h)**

| Task | Hours |
|---|---|
| Scaffold Astro 7 + React + MDX + Tailwind 4 + sitemap + wrangler; CI to a preview URL | 1.0 |
| Design tokens (§5), base layout, header, footer, language switch, SeoHead (canonical, hreflang, OG, JSON-LD), StoreButton + QR | 2.0 |
| Content schema and the Guide layout (all §7.2 blocks) | 1.5 |
| Port `/palm-reading/`, `/hand-lines/` and the 4 pillars (EN + HI drafts from the app's `web/guides/content.mjs`), adding sources | 2.5 |
| `/app/`, the `/tools/` hub, the legal pages with redirects, a draft of the privacy "On the website" section | 1.5 |
| robots.txt, llms.txt, sitemap check, OG images (English + Hindi test), `check-site`, Lighthouse, deploy (to the domain once it exists), Search Console | 1.5 |

**Day 2: tools and the reading client (≈ 9 h)**

| Task | Hours |
|---|---|
| Sync script, copy `lib/palm`, parity tests | 1.5 |
| Image pipeline, photo check, the home upload starter | 1.5 |
| Tools: the photo checker page, the which-hand quiz, the palm map on `/hand-lines/` | 2.5 |
| `/is-palmistry-real/` and `/which-hand-to-read/` | 2.0 |
| `/hi/` home and fixes from the pillar review | 1.5 |

**Day 3: the live reading (≈ 8 h). Needs S1–S4 and S6–S8.**

| Task | Hours |
|---|---|
| ReadingApp states, Turnstile, guest session, API calls, error screens (§8.3) | 3.0 |
| Report view with locks, SVG traced lines, IndexedDB, share card | 2.5 |
| Email-code sign-up, second reading, the zero state and app hand-off | 1.5 |
| Real-phone tests: Android Chrome on Jio and Airtel mobile data, iPhone Safari, and the WhatsApp in-app browser | 1.0 |

**App-repo server work (≈ 11 h):** S1 3 h, S2 2 h, S3 2 h, S4 2 h, S6 0.5 h, S7 0.25 h, S8 1 h.

### 14.3 P2 breakdown (≈ 45 h) [R09 §4.1]

| Task | Hours |
|---|---|
| 11 P2 guides at about 1.5–2 h each, with sources, in this order: `/life-line/broken/`, career, marriage, M, money, hand types, simian, sun, crosses, children, lucky signs | 20 |
| Tools 2 (line finder), 4–7 (four meaning finders), 10 (signs checker), 12 (quiz) | 10 |
| Blog posts 1–5 | 7 |
| PDF lead magnet and opt-in (needs S13) | 3 |
| India keyword pass and internal links | 2 |
| Hindi versions of the tools hub and tools | 3 |

`/indian-palmistry/` and `/chinese-palmistry/` moved to P3 to keep the guide count at 10–12. The first needs its Hindi culture twin; the second needs a specialist source [R11 §2.2].

### 14.4 Extras not in R09's hours [rec, estimates, not measured]

| Extra | Estimate |
|---|---|
| Trust pages (about, author, editorial policy, how it works) | ≈ 3 h |
| Original diagram set (master chart + about 40 variation SVGs, R11 §3.12) | ≈ 10 h |
| Hindi twins of 6 P2 guides (which-hand, marriage, M, money, lucky signs, children) | ≈ 6 h, plus owner reading time |
| Hand-type finder (tool 9). In R09 it sat in P1; the palm map took its slot (§9). | ≈ 1 h |

### 14.5 P3 (later, ordered by expected value)

1. The remaining P3 guides and `/hi/hast-rekha/`.
2. Blog posts 6–7, then ongoing posts.
3. Hindi pages not yet live, as they are reviewed: `/hi/hast-rekha/`, Hindi blog posts, and Hindi twins of the P3 guides.
4. First videos on the pillars.
5. Google sign-in (after Jio and Airtel tests).
6. The MediaPipe open-palm check (if the data shows a need).
7. Question chips at upload (A/B tested, §2.4 #17).
8. Festival banners.
9. Carrying the web reading into the app (D23).
10. Pagefind search at about 40 posts.
11. Play Integrity (S12).
12. An iPhone button when an iOS app exists.

### 14.6 Dependencies (what blocks what)

| Item | Blocked by |
|---|---|
| Live reading (Day 3) | S1, S2, S3, S4, S6, S7, S8; the domain (`api.<domain>`, Turnstile hostname, CORS); S5 budget |
| Public launch and indexing | The domain; the privacy "On the website" section; the legal pages; Search Console |
| App Links | S9; the Play App Signing SHA-256; the domain; `assetlinks.json` |
| The hero sample on a real photo | Consented hand photos (D7) and our model's real output for them. Until then, a stylised diagram labelled "diagram". |
| Hindi pages going live | The owner or reviewer reading them |
| Bylines and E-E-A-T | A named author and Hindi reviewer (D8) |
| The PDF | S8 (SMTP), S13 (list), CAN-SPAM address |
| The price line by store buttons | App prices in config, checked against Play |
| Time badges and "about {p50} seconds" | Measured p50 and p90 |
| "Free readings shared with the app" copy | Verified behaviour (§4.7) |

### 14.7 What can start before the domain exists

- **All of Days 1 and 2**, on a `*.workers.dev` preview with `noindex` and the reading in mock mode.
- **Content:** all P1 writing, the diagrams, Hindi drafts, the privacy section text.
- **Server work:** S1 (migrations and phone test), S3 and S4 (the hostname list is config).
- **Owner:** the photo shoot, the author and reviewer, the India keyword export.

**Needs the domain:**
- S2 (`api.<domain>`), S6 (CORS), S7 (Site URL), S9 (App Links);
- the Turnstile hostname;
- absolute canonical and OG URLs;
- Search Console;
- the email sender domain (SPF and DKIM for S8);
- Play Console links.

---

## 15. Top 12 risks

| # | Risk | Impact | Mitigation |
|---|---|---|---|
| 1 | Indian ISPs block `*.supabase.co` (BUG-030) | The reading fails for many Indian visitors | The site only ever calls `api.<domain>` (S2). Test on Jio and Airtel mobile data before launch. |
| 2 | Behind the proxy, every visitor looks like one IP | 30 anonymous sign-ins an hour for the whole site; one shared per-IP guest bucket | `trusted_proxy_worker` (0016), plus raised Auth limits or `Sb-Forwarded-For` for `/auth/v1` only (S2, D14) |
| 3 | The free rule differs from the promise (live 2 + 2; 0016/0017 not applied; the email-code path untested) | Copy that isn't true; legal and trust damage | S1 before any "1 free + 1 after sign-up" copy. The reading screen reads `reading_balance()`; a build check compares config with the server. |
| 4 | Web traffic uses up the app's shared cap (about 34 AI readings a day), or costs jump | The app stops working, or bills surprise | Separate web caps with a kill switch (S4), the owner's budget (S5), an alert at 80%, an honest "used up today" message |
| 5 | People farming free readings (clearing storage, scripts) | Cost; the free offer gets abused | The §8.6 layers; Play Integrity later (S12) |
| 6 | Privacy wording doesn't match reality (two processors, stored line points) | DPDP, Play policy and trust risk | The §8.5 copy; the privacy "On the website" section reviewed before the reading goes live; [verify] processor retention |
| 7 | Consumer-law exposure on "free" and on proof (CCPA drip pricing and false urgency; the FTC reviews rule; Play's misleading-claims rule) | Fines, store rejection, bad reviews | The "free" qualifier, the What's-free box, the price line by every store button, the facts config (§4.7), the dark-pattern checklist (§4.6) in every review |
| 8 | App Links catch too much, or fail verification | Users land on the app's Home, or links don't open the app | Exact paths (S9), the `/palmistry-pdf/` rename, `assetlinks.json` with no redirect, a test on a real phone |
| 9 | The copied `lib/palm` drifts from the app | The website and the app give different readings | Sync script with commit and sha256, parity tests, `ruleSetVersion` shown, re-sync on every rule change |
| 10 | Photo problems on real devices: HEIC from desktop, huge images on budget phones, EXIF rotation, slow 4G with two uploads, in-app browsers | Failed readings and drop-off | §8.3 and §12.12; early downscale; in-app browser notice; real-phone tests |
| 11 | Hindi quality and SEO: thin or machine Hindi, broken Devanagari in OG images, one-sided hreflang, scaled-content penalties | Hindi pages don't rank, or the whole site is hurt | The owner or reviewer reads every page first, the Hindi OG test on day 1, the `check-site` hreflang check, at most 5–8 new guides a week |
| 12 | The wow moment fails: traced lines misaligned on some phones, or no consented sample photo | The owner already rejected a misaligned scan animation; trust drops | Overlay drawn in the photo's own coordinates from real model output; tested on real phones at 3 screen sizes; reduced-motion version; consented photos before launch (fallback: a labelled diagram) |

**Also watch:**
- Expectations: "one day" versus about 103 h.
- pandit.ai launching its web scanner first [R04 §4c].
- Astro 7 is only three months old (pin versions).
- The app uses one Supabase project for dev and prod (previews run in mock mode).
- Play Console may reject the 301 on legal URLs (§12.11 fallback).
- Locked text can technically be rebuilt in the browser (the same as the app).
- Uptime and certificate expiry (monitored, §12.9).

---

## 15b. Owner decisions made on 2026-09-26 (these override anything elsewhere in this plan — e.g. §6.1, §9 and §10 still describe 3 standalone tools; the owner chose all 12 standalone. Day-to-day source of truth is now the topic docs: PROJECT_MASTER.md, KEYWORD_MAP.md, SEO_PLAYBOOK.md, DESIGN_SYSTEM.md, ARCHITECTURE.md)

- **Domain: `palmsays.com`.** Put it in the site config as the single base URL; the app's App Links host, `EXPO_PUBLIC_WEB_BASE_URL` and `assetlinks.json` will point here. **Brand: PalmSays** (owner confirmed 2026-09-26). Build the website in a NEW session opened in this folder (owner choice).
- **Design: Direction A "Nakshatra Night Web"**, **dark by default with a Day toggle** (localStorage only). Preview canvas: https://claude.ai/artifact/QWw4kfsXH3LhZAnTv7TdTi (private to the owner).
- **Tools: all 12 get their own standalone page** (owner chose this over the 3-standalone recommendation). Guard against thin pages: every tool page carries real content under the tool — how it works, what palmistry says with sources, honest limits, FAQ, links to the matching guide and the reading — and the matching guide links to the tool instead of embedding a second copy (one canonical home per tool, no duplicate content).
- **Author: Deepak Chauhan** — founder and entrepreneur (owner-provided: 25, has built 6+ websites and apps). Owner will send the full author details for the author page. A Hindi reviewer is still needed.
- **Migrations:** owner says all pending SQL is applied (0016, 0017, 0019, 0020, 0021). Not verified by Claude — the Palm Read AI Supabase project is not in the Supabase account connected to Claude. Verify the free-reading rule (1 + 1) and the web cap on the live project before building the reading flow.
- Earlier: honest guides for marriage/children/lifespan; web free report = same as the app.

## 16. Owner decisions needed

Each item has a recommendation. Saying "go with the recommendations" is a valid answer.

### A. Needed before or during P1

| # | Decision | Recommendation | Source |
|---|---|---|---|
| D1 | Brand and domain | Decide before the Day 1 deploy to a real domain. Everything else can start on a preview. All brand strings live in `site.ts`. | owner, R09 §3.1 |
| D2 | Design direction | **A, "Nakshatra Night Web"**, with B's Day reading theme and C's single scan beam | R08 §5 |
| D3 | Line colours on the web | Use the **app theme colours** (life `#F07A5A`, head `#6EA8FF`, heart `#F27BB0`, fate `#A993FF`). Keep the icon's pink, cyan and green inside the logo only. | R08 §3 |
| D4 | Dark default, or follow the phone's system theme | **Dark by default everywhere, with a Day toggle** remembered in `localStorage`; print is always Day. Alternative: Day by default on guides and blog. | R08 §5, R06 WOW 13 |
| D5 | Tool pages: 12 standalone, or 3 standalone with the rest inside guides | **3 standalone** (photo checker, line finder, quiz); the rest inside their guides | R11 §2.4 |
| D6 | AI crawlers | **Allow the search and answer bots.** Training bots: allow at launch and revisit at 90 days (blocking Google-Extended doesn't affect Search). | R11 §3.4 |
| D7 | Real hand photos with consent | 3–5 hands (varied skin tones, men and women), written consent. The owner's family is fine. Never AI hands. | R08 §10 |
| D8 | Named author and Hindi reviewer | Real people with author pages. The fallback is "written by the team, reviewed by {name}". | R11 §3.7, R01 V7 |
| D9 | Keyword exports | Export the India database and save it at `research/keywords-in.tsv`; save the US CSV at `research/keywords-us.tsv` | v1, R11 §5 |
| D10 | Migrations in the app repo | **Apply 0015 → 0016 → 0017** (0020 only if already decided in the app repo; 0021 for funnel counts) and test guest → email on a real phone before any "1 + 1" copy | R09 S1, S10 |
| D11 | Analytics | **Cookie-free only** (Cloudflare Web Analytics + `log_event_counts`), so there is no cookie banner | R08 §7, R09 §3.10 |
| D12 | Hosting | **Cloudflare Workers** static assets, not Pages | R09 §0 |
| D13 | Budget | Raise the shared `llm_daily_cap` and set a web cap. Start the web cap small, watch cost per reading weekly and raise it step by step. The numbers are the owner's. | R09 S4, S5 |
| D14 | Proxy client IP for Supabase Auth | **`Sb-Forwarded-For` with a secret key used only for `/auth/v1`**, so per-user limits stay meaningful. The alternative is simply raising the limits. [rec] | R09 S2 |
| D15 | HEIC files from desktop | **Start with the "upload a JPG" message** (no licence risk). Add the LGPL `heic-to` file, lazy-loaded and unmodified, only if HEIC failures show up in the events. [rec] | R09 §2.5 |
| D16 | Rename `/palm-reading-pdf/` to `/palmistry-pdf/` | **Yes.** Nothing is live, so it is free, and no App Link rule can catch it. | R09 §4.3 |
| D18 | Legal URLs | **New URLs (`/privacy/` etc.) with a 301 from `.html`**, tested on the preview; fall back to serving `.html` if Play Console objects | R09 §3.12 vs R11 §3.2 |
| D20 | Age rule on the web | **18+**, the same as the app's terms [verify] | R10 §4, §9 |
| D24 | Failed or unclear photos | They **must not use a free reading.** The local check blocks bad photos before sending; 422 and 503 are already refunded. [verify] retry and idempotency. | R10 §3.4 |

### B. Needed before P2

| # | Decision | Recommendation | Source |
|---|---|---|---|
| D17 | PDF: email-gated? Should the PDF file be indexable? | **Email opt-in (double opt-in, unticked tips box); the PDF file is `noindex`; Hindi PDF first** | R11 §3.4, §4.3 |
| D19 | Does the palm line finder use a free reading? | **No.** It is lines only, has its own small `web_scan` daily cap and needs Turnstile (a small S4 addition). Alternative: it counts as a reading. [rec] | R09 §3.4, §3.6 |
| D21 | When the Play rating is shown | Only at **4.0★ or more with 100+ ratings**, live and linked | R10 §5.1 |
| D22 | iPhone waitlist | **No waitlist** until an iOS app is really planned. Show the honest note only. | R10 §7.2 |

### C. Later

| # | Decision | Recommendation | Source |
|---|---|---|---|
| D23 | Carry web readings into the account for the app (observations only, never the photo) | A bigger lever, but it is an app change and the app couldn't show the traced overlay. **Decide after launch data.** | R10 §3.12 |
| D25 | Google sign-in on the web | **After week 2**, once tested on Jio and Airtel (the callback runs on the Supabase host) | R09 §3.6 |
| D26 | Weekly palm-tip email | Only once there is a real sender, unsubscribe and content plan; opt-in only | R10 §3.8 |

---

## 17. Next actions and status

### 17.1 Next actions

**Owner (now):**
1. Read §0, §3.3 and §16. Answer the A-list, or say "use the recommendations".
2. Brand and domain, or "build on the preview first".
3. Approve a separate app-repo session for S1–S4 and S6–S8, and set the budget (S5, D13).
4. Export the India keywords and save both CSVs (D9).
5. Arrange 3–5 consented hand photos (D7).
6. Name the author and the Hindi reviewer (D8).

**Claude, after the OK (this website repo):**
1. P1 Day 1, then Day 2, on a preview URL.
2. Day 3 once the server work is done.
3. Real-phone tests.
4. Launch.
5. Search Console, Bing and the BigQuery export.
6. The 10-minute US search-result check.
7. P2 in the §14.3 order.

**App-repo session (separate):**
1. S1.
2. S2.
3. S3 and S4.
4. S6–S8.
5. After launch: S9–S11.
6. Later: S12 and S13.

### 17.2 Status

| Phase | What | Status | Evidence |
|---|---|---|---|
| 1 | Deep analysis of 5 competitors (text + visual) | PLAN v2 READY — waiting for owner OK | `research/01–05`, `06–07`, `research/screens/` |
| 2 | A separate plan per competitor | PLAN v2 READY — waiting for owner OK | `research/01–05` §10; this file §2 |
| 3 | Combined best-feature plan | PLAN v2 READY — waiting for owner OK | This file §2.4–§4, §9 |
| 4 | 200+ keyword analysis | PLAN v2 READY — waiting for owner OK | This file §10.1; `research/11`. The India/Hindi export is still wanted. |
| 5 | Website architecture and master plan | PLAN v2 READY — waiting for owner OK | This file §5–§16; `research/08–11` |
| Build P1 / P2 / P3 | Code | NOT STARTED — blocked on owner OK, domain and server work | §14 |

---

## Appendix A. What v2 corrects in v1

| # | v1 (or an earlier research draft) said | v2 says | Source |
|---|---|---|---|
| 1 | Deploy to Cloudflare Pages | Cloudflare **Workers** with static assets; Astro's adapter v14 dropped Pages | R09 §0 |
| 2 | Reuse the "existing free-reading rules (1 guest + 1 after email)" | The live database gives **2 guest + 2 after email** (0013). 1 + 1 needs 0016/0017 applied, and the email-code path is untested. | R09 §0, S1 |
| 3 | "Photo stays in the browser, sent once for analysis" | Sent **twice** (Modal, USA; Cloudflare Workers AI). Traced points and landmarks **are stored**. The privacy page needs an "On the website" section. | R09 §3.7 |
| 4 | Reuse the "existing daily limits" | The ~34-a-day AI cap is **shared with the app**; the web needs its own cap and kill switch | R09 S4, S5 |
| 5 | Supabase JS in the browser | Only through the app's **proxy Worker** (ISP block), which first needs its IP fixes | R09 §3.6, S2 |
| 6 | "Day 1 (P1)" | P1 ≈ 27 h + ≈ 11 h server; P2 ≈ 45 h; extras ≈ 20 h. About 103 h, or 2–3 weeks in total. | R09 §4.1 |
| 7 | Sign-up "email + password or Google" | Email + 6-digit code; Google after week 2 | R09 §3.6 |
| 8 | 12 tools, each on its own page | 3 standalone, the rest inside their guides (D5) | R11 §2.4 |
| 9 | "Report 2 after sign-up" (could read as unlocking report 1) | Sign-up gives a **new** reading; report 1's locked parts stay locked, and the copy says so | R10 §3.7 |
| 10 | Readings kept in the browser only | Plus: say **before install** that the app needs a fresh photo | R10 §3.12 |
| 11 | Play button with UTM | Plus: the price and size next to **every** store button and a qualified "free" (CCPA drip pricing) | R10 §5.3 |
| 12 | App Store badge "when an iPhone app exists" | An honest iPhone note now (about 61% of US phones are iPhones) | R10 §7.2 |
| 13 | App Links: "serve the paths" | Exact-path intent filters; `/life-line/broken/` opens in the browser; `/palm-reading-pdf/` renamed to `/palmistry-pdf/` | R09 S9, R11 §3.2 |
| 14 | A `/hi/` mirror | Devanagari body, mixed-script titles, English slugs, owner review before publishing, a translation order | R11 §4 |
| 15 | (not covered) | No open-source palm tracer to reuse; no AGPL code; no weights trained on scraped photos | R09 §2 |
| 16 | "Legal pages moved, keep URLs" | New canonical URLs + 301 from `.html`, tested; fallback to serving `.html` | R09 §3.12, R11 §3.2 |
| 17 | `robots.txt` not specified | `/reading/` and `/account/` noindex but **not** disallowed | R09 §3.2 over R11 §3.4 |
| 18 | "The app's anonymous daily counts extended" | `log_event_counts` via 0021; cookie-free; web, Play and App Store reported separately | R09 S10, R11 §3.11 |
| 19 | No design system | Direction A: tokens, fonts, motion, components, budgets | R08 |
| 20 | Life-question pages (pandit pattern) | Folded into the honest guides; no `/questions/` URLs (scaled-content risk) | R11 §3.9 [rec] |
| 21 | R10 privacy line "used once… then deleted", "Continue with Google first", "password rules" | Replaced by §3.3 / §8.5 copy that matches the backend, and the email-code sign-up | R09 §3.6–3.7 |
| 22 | R06: a gold keyword in headlines and Devanagari eyebrows | Dropped as template tells; boldness is spent on the traced palm | R08 §1, §6 |
| 23 | `/lucky-signs/` P3, `/indian-palmistry/` and `/chinese-palmistry/` P2 | `/lucky-signs/` moves to P2 (low KD; hosts tool 10); the other two move to P3 (specialist sources, Hindi culture twin) | v1 low-KD list, R11 §2.2 |
