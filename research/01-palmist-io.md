# Competitor teardown 01: palmist.io

Researched on 2026-09-26. The method was read-only. I sent about 50 sequential requests to palmist.io: robots, sitemap, every sitemap URL type, the main flow pages, legal pages, a few 404 probes and the static JS/CSS. I also made 1 request to Google Play and ran 2 web searches.
I did not sign up, upload, submit a form or start a payment.

Main evidence sources:
- The raw HTML of each page, including the metadata, JSON-LD and the inline React Server Components (RSC) payload.
- The English UI dictionary of about 1,380 keys that ships inside every page. It shows screens that sit behind login, such as the quiz, the gated result, the paywalls and the email templates.

Labels used in this report:
- **observed**: seen directly in the page.
- **from UI strings**: taken from the shipped dictionary. The screen exists in code, but I did not view it live.
- **unknown**: not visible.

---

## 1. Snapshot

| Item | Finding |
|---|---|
| What it is | An India-first **AI palm reading + AI astrologer chat/call** web app. The free palm reading is the entry point. The money is made on **pay-per-use chat (₹4/message) and AI voice calls (₹25/min)** with AI "astrologer" personas, plus paid one-off reports (Marriage Timing Report, ₹199). |
| Positioning line | "AI palm reading & astrology. Ancient wisdom, answered instantly." Hero: "Your AI palm reader is ready." |
| Business model | Freemium plus a prepaid **wallet** in INR. There is no subscription ("No subscription, no auto-charge"). Welcome credits are ₹151, which covers 2 free questions and a 60-second call (`globals.welcome = ₹151` in the RSC payload). The first recharge gets a 100% bonus up to ₹200. UPI top-ups get an extra 10%. Recharge packs: ₹49→₹49, ₹100→₹120, ₹300→₹390, ₹500→₹700, ₹1000→₹1500 (https://palmist.io/pricing). |
| Payments | PayU (UPI, cards, netbanking) in India. Stripe/PayPal for international users (Terms §3). Google Play Billing inside the Android app (UI strings `app.wallet.*`, privacy policy). |
| Languages / regions | English plus 12 Indian languages: hi, bn, te, mr, ta, gu, kn, ml, pa, or, as, ur (WebSite JSON-LD `inLanguage`). Language switching is **client-side only**: every URL renders English HTML, `<html lang="en">` is fixed, there are no locale URLs and no hreflang. Sending `Accept-Language: hi` still returns English. Phone login allows "+91 Indian mobile numbers only"; other users use Google or email. |
| Apps | The privacy policy mentions "the Palmist app (Profile, then Delete account)" and Google Play purchases. The UI strings mention "The Palmist app from Google Play". A `twa:false` flag suggests the web build also runs as an Android wrapper. **The website has no Play Store or App Store link anywhere.** The Play listing is unknown. `com.palmist` ("AI Palmist : Hand Reader", 500+ downloads, 2.4★, updated May 2025) is a different, unrelated app. The JSON-LD says `operatingSystem: "Web, iOS"`, which contradicts the Android-only evidence. |
| Owner signals | The only social link is https://x.com/sauravrevankar, which is a personal founder handle used as Organization `sameAs` and `twitter:site`. There is no company name, address or About page (/about returns 404). The contact page shows only an obfuscated support email. This looks like a solo-founder or small-team product. The privacy policy mentions "your account from the old Palmist site", so this is a relaunch of an older site. |
| AI provider | "Microsoft Azure OpenAI" writes the readings, chats and voice answers (privacy policy). Kundli uses "Swiss Ephemeris, sidereal Lahiri". |
| Framework | **Next.js App Router** (`X-Powered-By: Next.js`, RSC `self.__next_f.push` payload, `/_next/static/chunks/app/...`). Fonts are self-hosted via next/font (2 preloaded woff2). The OG image is generated dynamically (`/opengraph-image?…`). |
| Hosting / CDN | **Cloudflare** is in front (`Server: cloudflare`, `cf-cache-status: DYNAMIC`, Cloudflare **Rocket Loader** script injected). The origin host is unknown. HTML is sent with `Cache-Control: private, no-cache, no-store`, so it is rendered fresh on every request. |
| Analytics | GA4 `G-YMZCXLDZ4G` via googletagmanager (observed). The privacy policy also says Microsoft Clarity is used; I did not see it in the HTML, so it probably loads via GTM. |
| Auth | Google sign-in, +91 phone SMS OTP and email OTP, all passwordless (https://palmist.io/login, noindex). |
| PWA | `manifest.webmanifest` (standalone, portrait, `start_url /?src=pwa`). An add-to-home-screen prompt and web push notification opt-in exist (UI strings `pwa.*`). |
| Traffic | **Unknown.** The site claims "50,000+ readings delivered" (homepage, key `home.readingsCount`) and "about 89% of our users are on their phones" (/palm-reading FAQ). Both are self-reported and unverified. |
| Compliance signals | The privacy policy cites India's DPDP Act 2023 (updated September 2026). A self-serve account deletion page exists at /account/delete. Terms: 18+ to purchase, "not professional … advice". Every page has the footer line "Not a substitute for professional advice." |

---

## 2. Full route inventory

### 2a. In the sitemap: 33 URLs, one flat `sitemap.xml`, no index file
robots.txt: `Allow: /`, `Disallow: /api/`, `Disallow: /admin`, `Sitemap: https://palmist.io/sitemap.xml`.

| Page type | Count | URLs | changefreq / priority |
|---|---|---|---|
| Home | 1 | https://palmist.io | weekly / 1.0 |
| Palm scanner (main tool) | 1 | /palm-reading | weekly / 1.0 |
| Palmistry learning hub | 1 | /palmistry | weekly / 0.8 |
| Palmistry line guides | 7 | /palmistry/heart-line, /head-line, /life-line, /fate-line, /marriage-line, /money-line, /simian-line | monthly / 0.7 |
| Other tools | 5 | /kundli, /matching, /tarot, /numerology, /ask | weekly / 0.8 |
| Horoscope hub | 1 | /horoscope | daily / 0.8 |
| Zodiac sign pages (programmatic) | 12 | /horoscope/aries … /horoscope/pisces | daily / 0.7 |
| Pricing | 1 | /pricing | monthly / 0.6 |
| Contact | 1 | /contact | monthly / 0.4 |
| Legal | 3 | /terms, /privacy, /refund | yearly / 0.3 |

Sitemap problem: **all 33 `lastmod` values are the same timestamp** (`2026-09-25T12:09:59.720Z`). The sitemap is generated at build time, so `lastmod` carries no real signal.

### 2b. Live routes that are not in the sitemap
| Route | Status / notes |
|---|---|
| /reports ("Explore") | 200, indexable, not in the sitemap. A catalog of all readings. |
| /reports/marriage | 200, `noindex`. Sales page for the ₹199 Marriage Timing Report. Linked with `?src=explore`. |
| /chat/{persona}, /call/{persona} | Redirect to `/login?next=…`. Persona slugs: `jyoti`, `pandit-vedic`, `tarot-mystic`, `numerologist`. /ask shows a fifth persona, "Celeste" (slug unknown). |
| /login, /wallet | 200, `noindex`. |
| /account/delete | Linked in the footer. Needed for Play Store account-deletion compliance. |
| /blog, /about, /faq, /hi, /llms.txt | **404.** There is **no blog**, no About page, no locale folders and no llms.txt. |

### 2c. Programmatic SEO
Only one programmatic pattern exists: **12 zodiac pages**. There are no per-language URLs, no per-line-variant pages (such as "broken heart line"), no per-city or per-name pages, and no per-number numerology pages. Tracking parameters are used on internal links: `?src=pwa`, `?src=explore`.

---

## 3. Homepage teardown (https://palmist.io)

Title: "Free AI Palm Reading Online — Palmist". Meta description: "Get a free AI palm reading online — upload a photo and Palmist reads your heart, head, life and fate lines in seconds. Then ask AI astrologers about kundli, tarot & more." About 1,560 words in `<main>`.

Sections in order:

1. **Header nav:** logo, Palm Reading, Astrology (→ /kundli), Tarot, Horoscope, Pricing, language button ("English"), Sign in. On mobile there is a bottom tab bar (🖐️ Palm / ✨ Horoscope / ✦ Ask / 📜 Explore / 👛 Wallet) and a floating 💬 feedback button, which gives an app-like shell.
2. **Hero.**
   - Eyebrow: "★ Free AI palm reading · 13 languages".
   - **H1: "Your AI palm reader is ready."**
   - Subline: "Get a free reading in seconds — then chat or call AI astrologers… pay only for what you use."
   - Social proof: "50,000+ readings delivered".
   - CTAs: "Ask an astrologer →" and "🖐️ Read my palm — free".
   - **An upload drop zone sits right in the hero** (JPG/PNG/GIF/WebP, up to 16 MB), with the button "✨ Reveal my palm reading" and the privacy line "🔒 Your photo is analyzed instantly — we don't keep it."
3. **Trust marquee** (a scrolling strip, repeated twice): "First 2 questions + a 60-second call — free when you sign up", "AI astrologers reply instantly", "Private & secure", "Available 24×7, even at 3 AM", "Kundli, tarot, palm & numerology in one place", "Chat or call in your language".
4. **H2 "Learn to read a palm — right here".** An interactive palm diagram (inline SVG) with 6 tab buttons (heart, head, life, fate, marriage, money). Each tab shows a 2-sentence meaning, "Read the full guide →" (deep link to /palmistry/…) and "Read my palm — free". A final link, "Learn to read every line →", points to /palmistry. This mixes education with a tool CTA and builds strong internal links.
5. **H2 "What is palm reading?"** Three paragraphs cover Hast Rekha Shastra / Samudrik Shastra and Cheiro, how a reader looks at a line (start, depth, path, end), and an honesty statement: "not a science… No line on your palm predicts lifespan, illness or misfortune… a structured mirror."
6. **H2 "How to get your free reading".** Three steps: Snap one photo, AI traces your lines, Read it then ask anything. It repeats the "89% on mobile" claim. CTA: "Scan my palm now — free".
7. **H2 "Everything the stars hold — in one app".** Six tool cards: Palm Reading [Free], Kundli & Astrology, Kundli Matching, Tarot, Numerology, Daily Horoscope [Free].
8. **H2 "Talk to our AI astrologers".** Four persona cards with human portrait photos (`/personas/*.webp`, preloaded):

   | Persona | Specialty | Rating shown | Chats shown |
   |---|---|---|---|
   | Jyoti | Hast Rekha / Kundli / Love | ★ 4.9 | 24k+ |
   | Pandit Aryan | Vedic / Kundli / Remedies | ★ 4.8 | 18k+ |
   | Meera | Tarot / Career / Love | ★ 4.9 | 11k+ |
   | Kabir | Numerology / Timing | ★ 4.8 | 7k+ |

   Each card shows languages, ₹4/message, ₹25/min and Chat / Call buttons.
9. **H2 "Instant reports".** A list that marks each report "Free": Detailed Palm Reading, Kundli Report, Kundli Matching, Tarot Spread (**5-card**), Numerology Report.
10. **H2 "Questions people actually ask".** Seven FAQs (mounts, "Is palm reading accurate?", which hand, "Can AI really read palms?", "Is this free?", "Can lines change?", "Where can I learn?"), also sent as FAQPage JSON-LD.
11. **Closing H2 "Your future is written in your palm."** plus "Read my palm — free". This contradicts the honesty copy in section 5.
12. **Footer:**
    - Tagline and "Follow us on X ↗".
    - Readings column: Palm Reading, Palmistry Guide, Kundli, Matching, Tarot, Numerology, Horoscope.
    - Company column: Pricing, Contact, Wallet.
    - Legal column: Terms, Privacy, Delete account, Refund.
    - "Not a substitute for professional advice. © 2026 Palmist."

What the homepage does not have:
- No Play Store or App Store badge.
- No user testimonials or reviews.
- No sample report screenshot and no example palm photo.
- No press mentions.
- No named expert or author.
- No email capture on the page.

---

## 4. Palm-reading product flow (as far as visible without uploading)

Entry points: the hero drop zone on `/` and `/palm-reading` (H1 "Free AI palm reading scanner"). Input is a file picker (`accept=image/jpeg,png,gif,webp`, up to 16 MB). The web page has no live camera or scanner overlay; on mobile the file picker offers the camera. The app build has "Take a photo / Choose from gallery" (UI strings `app.scan.*`).

**Steps (from UI strings, not viewed live):**
1. **Upload photo.** The page shows 4 photo tips: natural light, palm flat shot from above, dominant hand, phone camera is enough.
2. **Onboarding quiz, "Step n of N"** (`palm.quiz.*`). Each question comes with a "💡 why we ask" line:
   - reading language;
   - writing hand ("reflects the life you're actively shaping");
   - gender ("gently tunes how a few lines and mounts are read");
   - date of birth ("ties your palm to your stars — the key to dated predictions");
   - focus: Love / Career / Health / Destiny;
   - name (optional);
   - then birth **time** and birth **place** ("turns your life map into dated years").

   The quiz collects kundli data up front, so the palm reading also becomes the astrology-profile intake.
3. **"Reading the lines…"**, then a **partial result with a sign-in gate**: "🔓 Your full reading is ready → Unlock my full reading — free · Free · no card needed · Google or email". **The gate is a free account, not payment.**
4. **Complete Reading** (stated as free, "every chapter"). Sections from UI strings:
   - Your hand type
   - Heart / Head / Life / Fate / Marriage / Money / Simian line, each with "What this line means"
   - Minor lines
   - Special marks
   - Mounts (all seven)
   - Personality, Love, Career, Wealth, Health
   - Strengths, Challenges
   - Remedies (Upay)
   - Lucky elements: colour, number, day, **gemstone**, **mantra**
   - "Your life, mapped by age" / life timeline, "Grounded in your real birth data … until {year}"

   A trace note says **"Traced from your photo (indicative)"**, so they also draw the lines on the photo, marked as approximate. The reading can be translated ("Translating your report into {language}…"). Each account keeps **one current palm reading**; a rescan replaces it.
5. **Conversion bridges inside the result:**
   - "A question already? Ask Jyoti — *She wrote this reading*".
   - "Talk it through — call your astrologer… hear it in her voice".
   - Pre-written question chips ("What does my fate line say about my career in the next few years?").
   - "Your ₹X in credits covers your next N questions".
6. **Upsell: "Go deeper: your Detailed Palm Report"**, sold with "Your next 5 years, mapped… year-by-year life map timed to your chart, with remedies". The CTA is "Unlock for {price}". The current global `reportPrice` is **₹0**, so it is probably free for now or covered by welcome credits ("Covered by your free welcome credits"). It can be saved as PDF (print).
7. **Paid Marriage Timing Report, ₹199** (/reports/marriage, noindex). It promises "marriage windows with exact dates", "your likely partner", Manglik status, love vs arranged, "Peak months", and gemstone prescription fields (weight, metal, finger, first-wear day), "cross-checked against your palm reading's marriage lines". It carries a disclaimer: "Astrology describes supportive periods, never certainties." One good practice: it refuses to sell without an exact birth time ("we won't sell you guessed dates").

**Free vs gated summary:**

| Item | Free? | Gate |
|---|---|---|
| Palm scan plus partial result | Yes | None |
| Full Complete Reading | Yes | Free sign-in (Google, email or +91 OTP) |
| Detailed Palm Report | Priced by config; currently ₹0 or covered by credits | Account |
| Marriage Timing Report | ₹199 one-time | Account plus payment |
| Chat with an AI persona | 2 free questions, then ₹4/message | Account plus wallet |
| AI voice call | First 60 seconds free, then ₹25/min | Account plus wallet |

**Sample reports and screenshots:** none published anywhere on the public site.

**App store links:** none on the website.

---

## 5. Free tools

| Tool | URL | Input | Output | AI or static | Gated? | Target keyword (inferred) | Quality notes |
|---|---|---|---|---|---|---|---|
| AI palm reading scanner | /palm-reading (and the home hero) | Palm photo, then quiz (hand, gender, DOB, focus, name, birth time and place) | Multi-chapter reading plus indicative line trace | AI vision (Azure OpenAI) | Partial result free; full reading needs free sign-in | "free AI palm reading scanner", "palm reading online" | The strongest page, with photo tips, an 8-question FAQ and HowTo and FAQ schema. Only about 710 words. No example output shown. |
| Palm line explorer | Home section 4 | Tap a line | 2-sentence meaning plus guide link | Static | No | Supports "palm reading lines" | A good teaching widget that feeds internal links. |
| Kundli (birth chart) | /kundli | Name, DOB, time (or "unknown → noon"), place | Chart wheel, ascendant, moon sign, nakshatra; with sign-in: full planets, dashas, AI reading, PDF | Computed (Swiss Ephemeris, Lahiri) plus AI text | Basics without login; the rest needs sign-in | "free kundli", "vedic birth chart" | Solid trust copy ("Real ephemeris, not templates"). FAQPage and Breadcrumb schema. |
| Kundli matching | /matching | Two partners' birth details | 36-point Ashtakoota score explained by AI | Computed plus AI | Unknown depth; probably sign-in for the explanation | "kundli matching", "guna milan" | Thin page: form only, no explainer text or FAQ, no schema besides Org. |
| AI tarot | /tarot | A question, then "Draw my 3 cards" | Past / Present / Future reading by persona "Meera" | AI | Unknown | "free AI tarot reading" | Thin page with no content block. Says 3 cards while the homepage and pricing say "5-card", which is inconsistent. |
| Numerology report | /numerology | Full name, DOB | Five core numbers (Life Path, Expression, Soul Urge, Personality, Birthday) plus overview; deeper reading after sign-in | Deterministic (Pythagorean) plus AI text | Numbers free without login; deep reading needs sign-in | "numerology report", "life path number" | Good explainer and FAQ with FAQPage schema. |
| Daily horoscope | /horoscope plus 12 sign pages | Pick a sign | Daily / weekly / monthly text: love, career, health, lucky colour and number | Probably AI-generated (generic tone) | No | "{sign} horoscope today", "daily horoscope" | **Very thin** (about 60 words per sign per day), with no dates or schema. Every page ends in an "Ask an astrologer" upsell. |
| Ask an AI astrologer | /ask, /chat/*, /call/* | Chat or voice | Persona answers | AI (LLM plus realtime voice) | Login and wallet (2 questions and 60 seconds free) | "ask an astrologer", "talk to astrologer" | The revenue engine. |
| Marriage Timing Report | /reports/marriage | Birth data plus payment | Dated windows, partner profile, remedies | AI plus computed | ₹199 | "marriage prediction by date of birth" (noindex, so not an SEO target) | High-risk claims (see §9). |

**Count:** about 6 public free tools plus 1 teaching widget, far fewer than a "10+ tools" hub. There is no palm-specific mini-tool beyond the main scanner: no hand-shape finder, no marriage-line age calculator, no compare-hands tool, no photo-quality checker.

---

## 6. Blog and content

- **No blog.** `/blog` returns 404, and the sitemap has no posts.
- All editorial content is the **"Palmistry guide": 1 hub plus 7 line guides = 8 long-form articles.**

| Property | Finding |
|---|---|
| Length | About 1,900–2,450 words each (measured in `<main>`): hub about 2,440, heart line about 2,000, money line about 1,980, simian line about 1,910. |
| Dates | Every Article has `datePublished` = `dateModified` = **2026-07-12**, a single batch publish with no updates since. |
| Author / E-E-A-T | Article author and publisher are `Organization: Palmist`. There is **no named author**, yet the copy uses a first-person expert voice ("A master palmist's guide", "My advice: always read both", "Ask anyone who has read thousands of hands"). There is no reviewer, bio or credentials. |
| Format template | Breadcrumb, then H1, then intro, then an "illustration" (one inline SVG diagram per page with a caption, e.g. "Where the heart line sits on the palm"), then a **Quick facts** table (Sanskrit name with Devanagari such as "Hriday Rekha (हृदय रेखा)", Western name, location, what it governs, which hand). After that: how to find it, variations as H3s (short, long, chained, forked, broken, double, wavy, absent…), which hand and can it change, a **myth-busting** block (no health or lifespan prediction), FAQ (6 questions, FAQPage schema), and a CTA box ("What does your heart line say? … Get my free palm reading"). It ends with a **learning path** ("Step 1 of 7", ← Previous / Next →) and "Keep learning" (3 related guides). |
| Topic cluster | One cluster: palm lines (4 major lines, marriage, money, simian). The hub also covers the sun line, girdle of Venus, health line, bracelet lines, which hand, a 4-step method, and depth/break/fork/chain/island/sister-line meanings, but these have **no dedicated pages**. There are no pages on mounts, hand shapes, finger or thumb types, or marks (cross, star, triangle, "M"). |
| Images | Only inline SVG diagrams, with no photos of real palms and no raster images (only the logo `<img>`). |
| Internal linking | Strong within the cluster (contextual anchor links such as "simian line", "marriage line"), plus prev/next and related links. Every guide links to /palm-reading 2–3 times. The homepage line explorer deep-links to 6 guides. |
| Language | English only in HTML. Sanskrit and Hindi terms appear inline only. |
| Update cadence | No evidence of ongoing publishing: one batch in July 2026, nothing since. |

---

## 7. SEO implementation

| Area | Finding | Verdict |
|---|---|---|
| Title pattern | `{Keyword-led title} \| Palmist`, e.g. "Heart line palm reading: meaning, types & how to find it \| Palmist", "Free Kundli — Your Vedic Birth Chart \| Palmist", "Aries Horoscope Today — Daily, Weekly & Monthly \| Palmist". Bug: /reports has "All Readings & Reports — Palmist \| Palmist" (brand twice). | Good, one bug |
| Title placement | Because of Next.js streaming metadata, `<title>`, description, canonical and OG tags are **output in the `<body>`** (the title sits at about byte 48,000 of 198,000, while `</head>` is at byte 1,481), **even for a Googlebot user agent**. Google usually accepts this, but other crawlers and link-preview bots may not. | Risk |
| Meta description | Unique per page and keyword-rich ("Heart line palm reading explained: what your line's curve, length, forks…"). | Good |
| Meta keywords | The same six keywords on every page ("palm reading, palm reading online, free palm reading, AI palm reading, palmistry, palmist"). | Useless |
| H1 | Exactly one per page and keyword-aligned: "Free AI palm reading scanner", "Palm reading lines: a complete guide…". Some tool H1s are weak: "Your Kundli", "Numerology", "Aries". | Mostly good |
| Canonical | Self-referencing and absolute, with no trailing slash (`https://palmist.io/palmistry/heart-line`). | Good |
| hreflang | **None**, despite 13 languages. Non-English readings are invisible to search. | Big gap |
| OG / Twitter | **The same `og:title`, `og:description` and `og:url` = `https://palmist.io` on every page** (only the homepage values are inherited). The dynamic 1200×630 OG image is also the same. Every shared guide therefore previews as the homepage. `twitter:site` is the founder's handle. | Bug |
| JSON-LD | Organization + WebSite (site-wide); home adds WebApplication (price 0 INR, OS "Web, iOS") and FAQPage; /palm-reading adds HowTo and FAQPage; guides add Article, FAQPage and BreadcrumbList; kundli and numerology add FAQPage and BreadcrumbList. Horoscope, tarot and matching have nothing beyond Org. There is no SoftwareApplication with an Android download or rating, no Person author, and no Product/Offer for the paid report. HowTo rich results are no longer shown by Google. | Decent, dated in places |
| robots | Allow all, disallow /api/ and /admin. Private pages use a `noindex` meta tag (login, wallet, marriage report). | Good |
| Sitemap | Flat, 33 URLs, identical auto `lastmod`, `changefreq`/`priority` set (ignored by Google). /reports is missing from it. | Poor hygiene |
| URL style | Short, lowercase, hyphenated, no dates, logical folders (`/palmistry/{line}`, `/horoscope/{sign}`). | Good |
| Internal linking | Header, footer and a mobile tab bar on every page. Contextual links inside guides and "learning path" prev/next. Every tool page ends with an "Ask an astrologer" block. | Good |
| Page weight | HTML is 130–215 KB uncompressed (home 48.6 KB gzipped). **About 140–166 KB of each page is the inline RSC payload**, including the whole ~1,380-key English UI dictionary (even email templates and wallet errors) on every page. 11 JS/CSS static files on home ≈ **201 KB compressed**. Cloudflare Rocket Loader rewrites scripts. HTML is `no-store`, so every hit renders on the server and nothing is edge-cached. | Heavy for what it is |
| Mobile | `viewport-fit=cover`, theme colour, PWA manifest, app-like bottom navigation, large drop zone. Mobile-first design. | Good |
| Images | Hardly any `<img>` (logo plus 4 persona webp), so there is no image-search footprint. Diagrams are inline SVG. | Missed image-search traffic |

**Keyword themes they clearly target** (from titles, H1s and URLs):
- Core: "free AI palm reading online", "palm reading scanner / scan your palm photo", "palm reading lines".
- Line intents: "heart line palm reading", "head line palm reading", "life line meaning", "fate line in palm", "marriage line in palm (age timing)", "money line in palm", "simian line meaning".
- Astrology adjacencies: "free kundli / vedic birth chart", "kundli matching / guna milan", "free AI tarot reading", "numerology report / life path", "daily horoscope", "{sign} horoscope today", "ask an AI astrologer".
- Sanskrit and Hindi terms (Hast Rekha, Hriday Rekha, Vivah Rekha, Dhan Rekha, Bhagya Rekha) appear only as English-page vocabulary. **No Hindi-script pages target हस्त रेखा / हाथ की रेखाएं searches.**

---

## 8. Acquisition and conversion

**How they attract:**
- **SEO** through the tool pages, 8 guides and 12 zodiac pages.
- **Social:** only an X founder account.
- **Paid ads:** no ad pixels seen (no Meta, TikTok or Google Ads remarketing tags in the HTML); GTM could load more (unknown).
- **PWA install prompt** and **Trustpilot** review requests after a "helpful" rating (`chat.rate.trustpilot`).
- **Referral program:** none visible.

**Conversion architecture** (from observation and UI strings):
1. **Free hook:** a palm reading with no login, then a free sign-in to "unlock" the full reading. This captures an account with Google, email or phone in place of a newsletter form.
2. **Profile intake inside the palm quiz** (DOB, time, place). This data then powers kundli, horoscope emails and paid reports ("Saved once, used everywhere").
3. **Persona bridge:** the reading is framed as written by "Jyoti" ("She wrote this reading"), with pre-written question chips leading into chat.
4. **Welcome credits** (₹151, which gives 2 questions and a 60-second call). Limited to "one per person and device".
5. **Soft paywall with several free fallbacks when credits run out:**
   - "come back tomorrow — one question free" (unlocks at 6 AM);
   - "rate a couple of answers — free question" (2 ratings unlock 1 question);
   - "Tell us your exact birth time and the next question is on us";
   - "+1 free question" for rating an answer.
6. **Exit intercept:** "Before you go — what stopped you?" (Too expensive / Later / Just curious / Payment failed). It is followed by a **rescue micro top-up** ("Then let's start small… just N more answers… Pay by UPI").
7. **Pricing levers:** first recharge doubled (up to ₹200), +10% on UPI, tiered pack bonuses, per-second billing on calls.
8. **Upsells:** Detailed Palm Report ("Your next 5 years, mapped") and the Marriage Timing Report (₹199, sold from /reports "Explore" and inside the wallet flow: "Your marriage windows, dated").
9. **Email lifecycle** (templates shipped in the UI strings):
   - Day-1: "Your palm reading from yesterday raised this question".
   - Day-N daily sky email: "Day {n} with Palmist", Moon sign, Mahadasha line, Rahu Kaal window, "From your palm — {section}", "Ask {name} about today".
   - Follow-ups: "{name} looked at your palm again 🪔", "{name} left you a message ✨", "Your free question for today is unlocked".
   - Abandoned payment: "Your {pay} recharge didn't complete — no money was taken… first-recharge bonus is still yours".
   - Every email says "a real person reads every reply".
10. **Retention hooks:**
    - push notifications ("Only about your readings… No daily horoscope spam");
    - saved reading and chat memory ("she remembers");
    - rescan invitations ("lines change over time");
    - "Re-scan my palm — free" when a reading uses an older format.
11. **App promotion:** almost none on the web. It is only mentioned when a web build cannot place calls ("The Palmist app from Google Play can"). There is no badge, smart banner or deep link.

**Popups:** no email popups seen in the SSR HTML. Prompts are contextual (PWA install, notifications, paywall intercepts).

---

## 9. Strengths, weaknesses, gaps and risks

### Strengths
- **Upload in the hero:** zero clicks to start, and the privacy promise sits at the moment of upload.
- **Honest, myth-busting editorial voice** ("not a science", "no line predicts lifespan, illness"). This is good for trust and for Google's YMYL-adjacent quality signals.
- **Well-structured long guides:** quick-facts tables, FAQ schema, learning path and strong contextual internal links. The Sanskrit/Hindi terms add authenticity.
- **Onboarding quiz with a "why we ask" line on each question.** High completion psychology, and it doubles as profile intake.
- **Free sign-in gate instead of a hard paywall.** It captures identity cheaply and fits a "free reading" promise.
- **Sophisticated, humane-sounding monetization:** micro top-ups, UPI bonus, free-question-tomorrow, rate-to-earn, exit survey, abandoned-cart email, "we won't sell you guessed dates".
- **Real calculators** (Swiss Ephemeris kundli, Pythagorean numerology) rather than templates.
- **Mature privacy and compliance work:** the DPDP citation, the named AI processor, detailed deletion scope and self-serve deletion.

### Weaknesses
- **No blog and only 8 articles**, all published on one day with no updates. The content moat is small.
- **The 12 Indian languages are invisible to search:** client-side switching, no hreflang, no Hindi URLs.
- **SEO hygiene bugs:** identical OG title, description and URL on all pages; metadata streamed in `<body>`; identical sitemap `lastmod`; sitewide meta keywords; a duplicate brand in one title; /reports missing from the sitemap.
- **Heavy pages:** the full UI dictionary is inlined on every page, `no-store` HTML means no edge caching, and Rocket Loader is used.
- **Thin tool pages** (tarot, matching, horoscope signs) with no explainer content or schema.
- **No proof of output:** no sample reading, no screenshot of the traced palm, no testimonials, no store rating.
- **No named author or expert.** A first-person "master palmist" voice without a person behind it weakens E-E-A-T.
- **No app store links** and no clear native-app funnel. The JSON-LD claims iOS.
- **Palm tool coverage is narrow:** no mounts or hand-shape pages, no compare-hands tool (even though they write "comparing both hands is where the most interesting insight lives"), no quiz, no share card.

### Contradictory or misleading claims (risk list)
1. **"Every reading is free… You only ever pay to talk to an astrologer"** (/pricing), while a **₹199 Marriage Timing Report** exists and the Detailed Palm Report has an "Unlock for {price}" CTA.
2. **"Unused balance is refundable"** (pricing copy for returning users) versus the Refund Policy: "Money added to your wallet … cannot be refunded or withdrawn."
3. **The honesty copy is undercut by prediction products:** "Your future is written in your palm" (home closing H2), "insights about your… future" (HowTo), "exact dates" of marriage windows, "your likely partner", Manglik status, "Your next 5 years, mapped", a "Health" section, and gemstone prescriptions (weight, metal, finger, first-wear day) plus mantras. This carries consumer-protection and app-store policy risk around deceptive or unverifiable predictions and paid remedies.
4. **AI personas presented like humans:** human names ("Pandit Aryan"), portrait photos, star ratings (★4.9) and "24k+ chats" counts, "hear it in her voice", "She wrote this reading". They are labelled "AI astrologers", but the ratings and counts are unverifiable. **They also contradict the "rate this answer" system, which gives free credit for ratings**, so incentivised ratings may feed displayed stars.
5. **Self-reported, unsourced numbers:** "50,000+ readings delivered", "89% of our users are on mobile".
6. **Inconsistencies:** tarot is 3 cards on /tarot but "5-card" on the home and pricing pages; the JSON-LD says "Web, iOS" while the evidence points to Android.
7. **Data transfer:** palm photos, birth data and chats go to Azure OpenAI and "may be processed outside India". This is disclosed, but it is a sensitivity point for Indian users. The claim "we don't keep your photo" relies on the processor's abuse-monitoring retention.

---

## 10. Plan for us (Palm Read AI) based on this competitor

Ground rule: learn the **patterns** only. Do not copy their text, images, SVGs, persona concepts or design.

### ADOPT (proven patterns that fit us)
| # | Pattern | Why | Priority |
|---|---|---|---|
| A1 | **Upload widget in the homepage hero and on a dedicated "/palm-reading" tool page**, with photo tips (light, flat, dominant hand) and a privacy line at the upload moment. | Zero-click start. The privacy promise removes the biggest objection. We already have capture-guidance knowledge from the app. | P1 |
| A2 | **Free account gate for the full result** (they gate the full reading behind a free sign-in). This matches our plan: report 1 free, report 2 after email, then push to the app. Add a line under the button such as "Free · no card needed". | Cheapest identity capture; keeps the "free" promise honest. | P1 |
| A3 | **Line-guide cluster with a fixed template:** a quick-facts box (Sanskrit/Hindi name, where it is, what it governs, which hand), how to find it, variations as H3s, a myth-busting block, an FAQ with FAQPage schema, a CTA to scan, "Step n of N" prev/next and 3 related links. | Their best SEO asset; the template is solid and scalable. | P1 |
| A4 | **Honest framing as policy:** "tendencies, not verdicts", "no line predicts lifespan or illness". | Matches our honesty stance and protects Play Store and YMYL trust. | P1 |
| A5 | **Public account-deletion page** plus a privacy policy that names the AI processor, retention and deletion scope (DPDP). | Required for Play Store data-safety compliance, and builds trust. | P1 |
| A6 | **Short onboarding questions, each with a one-line "why we ask"** (hand, age band, focus). Collect only what our reading uses. | Raises completion. Our reading does not need birth time or place, so ask less than they do and say so. | P2 |
| A7 | **Lifecycle email for report-2 sign-ups:** a day-1 "your palm raised this question" email, abandoned-flow nudges, "a real person reads replies". | Converts email sign-ups into app installs. | P2 |
| A8 | **Contextual prompts instead of popups** (install and notification prompts only after value is delivered). | Better UX and fewer bounces. | P2 |

### ADAPT (good idea, do it our way)
| # | Their version | Our version | Priority |
|---|---|---|---|
| D1 | A client-side language switch that search cannot see | **Real Hindi URLs** (`/hi/...`) with `hreflang` en↔hi, Hindi titles and H1s ("हस्त रेखा", "हाथ की रेखाएं", "विवाह रेखा", "भाग्य रेखा", "जीवन रेखा", "हृदय रेखा", "मस्तिष्क रेखा") and `<html lang="hi">`. The whole Hindi search market is uncontested by them. | P1 |
| D2 | A homepage line explorer (tap a line to see its meaning) | An interactive explorer that uses **our own traced-line style**, shown on a real sample palm photo, with a link to each guide and to "trace mine". Also the natural place for a Play badge. | P1 |
| D3 | The "indicative" line trace hidden behind upload | **Show it up front:** a public **sample report page** with a traced palm photo and the 4-part reading (love, personality, career & money, life direction), plus an animated before/after on the homepage. They publish no output at all, so this is our clearest proof advantage. | P1 |
| D4 | 12 thin zodiac pages | Skip generic horoscopes, or do only if Hindi-first and genuinely useful. Our programmatic SEO should be **palm-specific**: one page per line variant (e.g. "टूटी हुई जीवन रेखा / broken life line", "double heart line", "M on palm", "cross on palm", "star on palm", "sun line", "girdle of Venus", "bracelet lines"), each bilingual, with an illustration and a CTA to check it on your own photo. | P2 |
| D5 | Kundli and numerology as side tools | Build **cheap deterministic tools that feed palm intent** for our "10+ tools" hub (see the list below). Keep AI tools few and rate-limited. | P2 |
| D6 | A Detailed Report upsell inside the result | On the web, the upsell is **"Get the full reading and lessons in the app"** with a Play deep link. The web does not sell packs, which keeps payments inside Play Billing and keeps the site simple. | P1 |
| D7 | A rescan invitation ("lines change over time") | "Compare your hands / re-check in 6 months" reminders drive app re-engagement through our compare-hands feature. | P3 |

### AVOID (their mistakes or risks)
| # | Avoid | Reason | Priority |
|---|---|---|---|
| V1 | Metadata streamed into `<body>`, identical OG tags sitewide, meta keywords, identical sitemap `lastmod`, a duplicate brand in titles | Easy SEO losses. Use per-page OG (title, description, url, image), real `lastmod` from content dates, and metadata rendered in `<head>` (SSG/ISR). | P1 |
| V2 | `no-store` server rendering for static content, and shipping the whole i18n dictionary on every page | Statically generate guides and tools, cache at the CDN, and ship only the strings each page needs. Core Web Vitals on low-end Android matter for India. | P1 |
| V3 | "Exact dates", "likely partner", gemstone and mantra prescriptions, a health section | Conflicts with honesty and creates policy and consumer-protection risk. We do not do any of this. | P1 |
| V4 | Human-named AI personas with portraits, star ratings and chat counts; ratings rewarded with credits | Misleading. If we ever add chat, label it plainly as AI and show only real, verifiable ratings (e.g. the actual Play rating). | P1 |
| V5 | Contradictory pricing copy ("everything free" alongside paid reports; "refundable" alongside a no-refund policy) | Show one consistent, plain free-vs-paid table. | P1 |
| V6 | Unsourced vanity numbers ("50,000+", "89%") | Only publish numbers we can prove. Otherwise use qualitative trust (privacy, honesty, Hindi). | P2 |
| V7 | Anonymous "master palmist" first-person voice | Use a named author or reviewer page with real background (or an honest "written by the Palm Read AI team, reviewed by …"), plus Person schema. | P2 |
| V8 | No app store links | Put Play badges in the hero, header and footer, on every guide CTA and in result gates. Add a smart app banner and deep links. | P1 |

### Where we can clearly beat them
1. **Hindi-first indexable content.** They have none; we can own हस्त रेखा queries.
2. **Visible real line tracing** on a sample palm and on the user's own photo in the web result. They show nothing before sign-in.
3. **Compare hands.** They say the insight is in comparing both hands but offer no tool. We already have the feature.
4. **Learn-the-lines lessons and a quiz.** They have articles only. An interactive "find your heart line" quiz is a linkable asset.
5. **Share card and PDF.** They offer only "Save as PDF" (print). A WhatsApp-friendly Hindi share card gives us viral reach in India.
6. **Honesty without contradictions.** We can keep the same honest stance they claim, without date predictions or gemstone upsells, and make that part of the brand.
7. **A real blog.** They have zero; even 2 posts a week in Hindi and English beats them within months.

### Specific page and tool ideas for our site
**Core pages (P1):**
- `/` homepage with hero upload and Play badge.
- `/palm-reading` online reader: report 1 free, report 2 after email, then "continue in the app".
- `/sample-report`, a real traced example.
- `/hi/` mirror pages.
- `/learn` hub plus one page per line (heart, head, life, fate, marriage, money/sun, simian), all bilingual.
- Privacy and account deletion pages.
- `/app` landing page with the Play link.

**Free tools for the "10+ tools" hub** (mostly deterministic; each ends with "check it on your own palm"):
- Palm photo quality checker (runs in the browser, checks light, blur and framing before upload; unique and useful). P1
- "Which hand should I read?" helper (dominant vs non-dominant explainer). P2
- Heart line love-style quiz (pick your line shape from illustrations to get a meaning). P1
- Head line thinking-style quiz. P2
- Life line myth-checker ("does a short life line mean a short life?" answered interactively). P2
- Fate line career-path finder. P2
- Marriage line reading helper (traditional reading, clearly labelled as tradition, no dates). P3
- Hand shape / element finder (earth, air, fire, water, from finger and palm proportions). P2
- Mount finder (tap the mounts on a diagram). P3
- Simian line checker. P3
- Palm marks glossary / finder (cross, star, triangle, island, "M"). P2
- Compare-two-hands preview (a teaser of the app feature). P2
- Palm reading quiz / "test your palmistry knowledge" (a shareable score card). P2

**Blog clusters (P2):**
- Line variants: one post per variant, in Hindi and English.
- Marks and signs.
- "Which hand" and myths.
- Palmistry vs astrology basics.
- How AI reads palms (a transparent explainer of our tracing).
- Photo tips.

---

### Sources (all fetched 2026-09-26)
- https://palmist.io/robots.txt · https://palmist.io/sitemap.xml · https://palmist.io/manifest.webmanifest
- https://palmist.io/ · /palm-reading · /palmistry · /palmistry/heart-line · /head-line · /life-line · /fate-line · /marriage-line · /money-line · /simian-line
- https://palmist.io/pricing · /ask · /reports · /reports/marriage · /kundli · /matching · /tarot · /numerology · /horoscope · /horoscope/aries
- https://palmist.io/contact · /terms · /privacy · /refund · /login · /wallet · /chat/jyoti (redirected to login)
- 404s: /blog, /about, /faq, /hi, /llms.txt
- An unrelated app with a similar name, checked to rule it out: https://play.google.com/store/apps/details?id=com.palmist
