# Competitor teardown 05: palmly.ai

Researched on 2026-09-26. The method was read-only. I sent about 60 sequential requests to palmly.ai: robots, sitemap, the homepage and 3 locale homepages, every nav, app and legal page, the React Router route manifest, one public price endpoint and about 15 static JS bundles. I also made 5 requests to the Wayback Machine and RDAP and ran 8 web searches.
I did not sign up, log in, upload, submit a form or start a payment.

Main evidence sources:
- The raw SSR HTML of each page, including the metadata and JSON-LD.
- The React Router lazy route manifest (`/__manifest?paths=...`).
- The English UI dictionary of about 480 keys that ships in `/assets/client-DjYPaYxV.js`. It shows the paywall, credit and blog screens that were not reachable live.
- The public price endpoint `/herm/api/v1/version/prices`.

Labels used in this report:
- **observed**: seen directly in the page.
- **from UI strings / JS**: in the shipped code, but not viewed live.
- **unknown**: not visible.

> **Big caveat: the site was half-broken during the research.**
> - The TLS certificate **expired on 2026-09-24**. It was a TrustAsia DV certificate valid from 2026-06-26 to 2026-09-24 (openssl). Normal browsers therefore show a full-page security warning, and plain `curl` refuses to connect (`SEC_E_CERT_EXPIRED`). I used `curl -k` to observe the pages.
> - `/sitemap.xml`, `/blog`, `/agents`, `/agents/numerology-calculator` and `/zh/blog` all returned **HTTP 500 "Unexpected Server Error"**. I got the same result on a retry about 30 minutes later.
> - As a result, the blog count and the agent (tool) count are **unknown**. What is described below comes from the JS templates, the UI strings and the search index.

---

## 1. Snapshot

| Item | Finding |
|---|---|
| What it is | A global, English-first **AI palm reading web app**. An AI persona, **"Vera"** ("Your reader"), reads the palm. Tarot, birth chart, weekly horoscope and a follow-up chat are bolted on as a "workspace". The tagline is "One palm photo, a clearer self-reflection." |
| Operator | **SINGAPORE IWEAVER PTE. LTD**, 60 Paya Lebar Road #11-53, Singapore. The contact email is `iweaver@iweaver.ai` (https://palmly.ai/about-us). iWeaver is an AI-productivity company, so Palmly looks like a vertical spin-off. Public RDAP lists a Chengdu (China) company as the domain registrant (registrar: SeaArea Group Limited). |
| Age | The domain was **registered 2026-06-26** (RDAP). The first Wayback snapshot is **2026-07-30**. The site is about 3 months old. |
| Platform (inference) | The site is a white-label skin on iWeaver's generic AI-agent backend. The evidence: the API sits at `/herm/api/v1`, the auth token key is `iweaver.hermes.authToken`, `parent_id: "Lunara"` is sent on profile calls, and the CSS root class is `lunara-root`. The chat engine renders "widgets" and "mindmaps". The price endpoint returns iWeaver's multi-LLM plans (see §4). The model that powers Palmly's readings is **unknown**. |
| Business model | Freemium with three paid layers: (1) a **free palm "teaser"**, (2) a **one-time $7.99 unlock** of the full 4-section palm report, shown next to a struck-through $19.99, and (3) **"Stardust" credits (✦)** for follow-up questions (1 ✦ each), tarot spreads and the natal chart (3 ✦). There are also "Plan / Upgrade Plan / Pay-as-you-go" strings (from UI strings). All prices are in USD. |
| Payments | The JS loads **Airwallex** checkout elements (`checkout.airwallex.com/assets/elements.bundle.min.js`), and the paywall has an in-page card form (card number, MM/YY, CVC). The privacy notice says instead that "All payment data is stored by **Stripe**". The two do not match. |
| Login | **Google OAuth only** (`/auth/google/url`). No email or phone login was found. |
| Languages / regions | 9 languages: **en, zh, ja, ko, es, de, fr, it, pt**. Each has a path prefix (`/zh`, `/ja` …), a translated `<title>` and meta description, `<html lang>` set per locale, and hreflang plus x-default. There is **no Hindi or any Indian language**, and nothing targets India (USD only, no UPI). |
| Apps | **None.** The site is web-only. There are no Play Store or App Store links anywhere. |
| Tech stack | **React Router v7** in framework mode: SSR, `window.__reactRouterContext`, lazy route discovery via `/__manifest`. Built with React and Vite (hashed `/assets/*.js`). Styling is Tailwind utility classes. Icons are Lucide. HTTP uses axios. Text uses i18next-style `t()` with `landing` and `reading` namespaces. The server header is `nginx`, with no CDN headers seen (IP 43.173.117.74). **GA4 `G-WMRKQLFLYP` is the only tracking tag**: no Meta, TikTok or Google Ads pixel. |
| Traffic / volume | **Unknown.** The only number shown is the homepage claim "Over 120,000 readings and counting". It is a hard-coded UI string (`readingsNumber = 120,000`) that was already present in the 2026-07-30 snapshot, about 1 month after the domain was registered. It cannot be verified. |

---

## 2. Full route inventory

The sitemap is declared in robots.txt (`Sitemap: https://palmly.ai/sitemap.xml`), but it returns **500 with a 23-byte body, "Unexpected Server Error"**. `sitemap_index.xml` and `sitemap-index.xml` return 404. There is therefore **no sitemap-based inventory**. The routes below come from robots.txt, the nav and footer links, the route manifest and the JS.

### 2a. Public / SEO routes

| Pattern | Count | Status on 2026-09-26 | Example |
|---|---|---|---|
| Homepage + locale homes | **9** (en at `/`, plus 8 prefixes) | 200, translated title and meta | `/`, `/zh` ("免费在线 AI 手相解读"), `/ja` ("無料AI手相占いオンライン"), `/es` ("Lectura de palma con IA gratis en línea"), `/pt` ("Leitura de palma com IA grátis online") |
| Agents index | 1 per locale (`/agents`, `/{loc}/agents`) | **500** | https://palmly.ai/agents |
| Agent (tool) landing pages | **unknown**. At least 1 is known from the search index | **500** | https://palmly.ai/agents/numerology-calculator (Google title: "Numerology Calculator Reading Online \| Palmly") |
| Blog index | 1 per locale (`/blog`, `/{loc}/blog`) | **500** | https://palmly.ai/blog, https://palmly.ai/zh/blog |
| Blog posts | **unknown**. Web search found **0** indexed posts | not testable | `/blog/:slug`, `/{loc}/blog/:slug` (route manifest) |
| Company / legal | 5 (each with locale alternates) | 200 | `/about-us`, `/contact-us`, `/privacy`, `/terms-of-use`, `/disclaimer` |

### 2b. App routes (all `Disallow`ed in robots.txt)

`/palm-reading`, `/tarot`, `/astrology`, `/weekly-horoscope`, `/chat`, `/history`, `/account`, `/workspace`, `/oauth`, `/payment-successful`.
The first five return 200 with SSR shells that have **no meta description, no canonical, no hreflang and no H1** (observed).

### 2c. API (observed in JS)

All under `/herm/api/v1`:
- `/auth/google/url`
- `/user/profile?parent_id=Lunara`
- `/version/prices` (public GET, 200)
- `/pay/once/create`
- `/lunara/unlock` (returns `paid_report`)

### 2d. Programmatic SEO

The only programmatic pattern is **`/agents/:slug`**. It is a CMS-driven "tool landing page factory" inherited from the iWeaver platform.
- **Fields per agent:** `slug`, `h1`, `description`, `meta_description`, `category`, `input_config` (layouts: `file`, `link`, `input`, or all three).
- **Page sections (from JS):** hero with a tabbed input widget ("Upload your material" / "Write your question" / "Paste a link"), free HTML sections, "How to use", "Features", "Use cases", "More Agents to explore", "Frequently Asked Questions", and a CTA ("Start your reading").
- **Title pattern:** "{Tool} Reading Online | Palmly".
- The agents index meta title is "Palmly Agents — Free AI Palm, Tarot & Astrology Tools". The intro reads: "Palm, tarot, astrology, and numerology — a family of free AI agents…".

A **"Palmistry glossary"** footer key (`footerPalmistry`) exists in the UI strings but is not rendered or routed. It looks like a planned programmatic cluster that has not shipped.

---

## 3. Homepage teardown (https://palmly.ai/)

The page is SSR (all text is in the HTML), 62 KB of HTML, with 3 images: the logo, `palm-Ca475szW.webp` ("Glowing Palm"), and the logo again. The visual style is a dark violet and gold "atmosphere" with glow blobs and stars.

1. **Header (sticky, blurred).** Wordmark logo, nav **Agents · Blog** (hidden below 880px behind a menu), a language switcher ("English"), **Log in**, and a **Start free** button.
2. **Hero.**
   - **H1:** "Free AI Palm Reading Online", an exact-match keyword title.
   - **Subtitle** (the same text as the meta description, and it repeats "AI palm reading" twice): "Upload a clear photo of your palm and get an instant AI-powered palm reading… love style, career direction, personality patterns, money habits, and near-future themes for entertainment and self-reflection."
   - **Photo checklist chips:** Open palm · Good light · Full hand.
   - **4 feature cards (H3), each tied to a palm feature:**
     - Love style (heart line, attachment rhythm)
     - Career signal (head line, ambition)
     - Personality (hand shape, line depth)
     - Near future (current direction, timing cues)
3. **Upload module ("Free Palm Preview · Free").**
   - A **second H1**: "One palm photo, a clearer self-reflection."
   - A drag-and-drop zone with **Browse** and the copy "or browse your device — we read it once and never store it".
   - An optional text box, "Vera reads what matters to you" (placeholder: "What would you like to know? e.g. love, career, personality…").
   - The primary CTA **"Read my palm"**.
   - A "Secure processing — Your photo is processed and not stored." badge.
   - A trust strip: "Photos processed instantly, never stored | For entertainment only | 18+".
4. **H2 "Three steps to your reading".**
   1. Snap or upload.
   2. "A professional palm reading agent interprets your palm lines" (heart, head, life, hand shape, line depth).
   3. Unlock the full story: "love, career, health, and the year ahead".
5. **Sample ("A glimpse").** An archetype card, **"The Visionary Hand"**, with two sentences of teaser copy, then "Unlock to read your full reading" and "[ unlock the answers in your palm ]".
6. **H2 "A reading that talks back".** Three benefits:
   - Ask follow-up questions
   - Personal to your palm photo
   - "Palm, tarot & stars in one place" (cross-reference with birth chart and tarot)
7. **Social proof.**
   - "**Over 120,000 readings and counting**".
   - 3 testimonials (Maya R., Devin K., Priya S.) in a looping marquee (rendered 3× in the HTML). **Each is labelled "Illustrative"**, which means the quotes are not real users.
   - No ratings, press logos or review widgets.
8. **FAQ (H2 "Frequently asked"), 5 questions.** There is no FAQPage schema.
   - Is it accurate? It is for entertainment only.
   - Is it really free? "first palm reading starts free. A complete in-depth reading is a one-time unlock; other tools use Stardust credits."
   - Is my photo stored? "No".
   - How can an AI read a palm? The answer contains a grammar slip: "The Agents analyzes…".
   - What else? Tarot, birth chart, free weekly horoscope.
9. **Footer.** Brand line "AI palm reading, tarot, astrology, and horoscope tools…"; Company (About, Contact); Legal (Privacy, Terms, Disclaimer); "© 2026 Palmly · For entertainment purposes only. Not a substitute for professional advice." The UI strings define Tools, Learn and "Palmistry glossary" footer columns, but they are not rendered.

**Internal links on the homepage: only 8 unique `<a href>`**: `/`, `/agents`, `/blog`, `/about-us`, `/contact-us`, `/privacy`, `/terms-of-use`, `/disclaimer`. The tools are reached through JS buttons, not crawlable links. There is no pricing section and no price anywhere on the homepage.

The 2026-07-30 Wayback snapshot is almost identical. The copy has not been iterated since launch.

---

## 4. Palm-reading product flow (as far as visible without uploading)

1. **Entry.** From the homepage widget, or from `/palm-reading`. That page is a "workspace" with a **Vera side rail** ("Vera · Your reader", with suggested questions "What does my heart line mean?", "Is this a good year for love?", "Where should I focus?"). The status label reads "Offline" in the SSR HTML; it is probably updated client-side (not verified).
2. **Input.** "Step 1 · Your palm — Show Vera your hand".
   - Drag and drop, browse, or **"Use webcam" / "Capture palm"** (camera preview).
   - **JPG/PNG only, under 5 MB** (UI error strings).
   - Tips: "Good, even lighting · Your full palm in frame · Hold steady, palm flat".
3. **Login / credits.**
   - The header "Log in" uses Google OAuth.
   - The `/chat` page shows "✦ 0 ✦ available" for a guest.
   - Whether the **free teaser needs login** is **unknown** (not tested).
   - No email capture is visible in the reading flow.
4. **Processing "ritual".** "Vera is reading your palm", with rotating lines:
   - "tracing your life line…"
   - "Following your heart line…"
   - "Measuring your fate line…"
   - "**Aligning what we find with the stars…**"

   It ends with "This takes a moment — the lines are worth reading slowly."
5. **Free teaser** (`free_report`: `type`, `openingRead`). It contains:
   - an **archetype name** (e.g. "The Visionary Hand")
   - an "Element: {{element}}" label
   - **"Detected Features"**
   - line labels for **Heart / Head / Life / Fate**, each in a colour (for example heart = rose)
   - "The Initial Reading"
   - "Your palm reveals…"

   **There is no evidence of a line overlay drawn on the user's photo.** The lines appear as coloured labels and icons in the UI code.
6. **Locked teasers.** Four cards, each with a real one-line hook and a "🔒 Unlock to read in full" label:
   - *Love line*: "you love deliberately, not desperately"
   - *Career path*: "A strong fate line, lightly forked near the top — two callings ask for you at once"
   - *Health & energy*: "Your life line guards a deep reserve, but **a single island warns of one season of depletion**"
   - *Year ahead*: "the next twelve months turn a private hope public"
7. **Paywall.** "Your complete reading — Unlock all four sections Vera traced in your palm — yours to keep, forever."
   - Love & relationships (heart line)
   - Career & money (fate line + forks)
   - Health & energy (life line reserve)
   - Your year ahead (12-month timing)

   The price is **$7.99, next to a struck-through $19.99**, with "One-time payment • Yours forever", "Unlock for $7.99", an in-page card form (Airwallex) and "Secure · Instant access · For entertainment only". After payment the user is redirected to `/payment-successful?message_id=…&amount=…`, and `/lunara/unlock` returns the `paid_report`.
8. **Paid report.** Contains a `letter`, a `shareCard`, "Deep Dive Analysis", "Save & Share / Share Your Destiny", and a share toast ("Link copied — share your Visionary Hand ✦").
9. **After the reading.**
   - A chat with Vera where **each follow-up question costs 1 ✦**. When credits run out: "Out of Stardust — top up to keep asking."
   - A "Buy Stardust" drawer ("Stardust powers your follow-up questions and card draws"), with a "Best value" pack label and "Upgrade Plan".
   - **Stardust pack sizes and prices: unknown** (served by the backend; not opened).
10. **Price endpoint.** `/herm/api/v1/version/prices` (public) returns iWeaver platform plans, each with a list of LLMs (DeepSeek, GPT, Gemini, Claude, Grok):
    - Pro: $9.9/mo, $24.9/quarter, $79/yr
    - Ultra: $29.9/mo, $69.9/quarter, $198/yr
    - Unlimit: $79.9/mo, $299/yr

    **Whether Palmly users are ever shown these plans is unknown.** They look like the parent platform's pricing.
11. **App store links: none.** There is no app. Retention depends on the web: History, the chat and the weekly horoscope.

---

## 5. Free tools

| Tool | URL | Input | Output | AI or static | Gated? | Target keyword (inferred) | Quality notes |
|---|---|---|---|---|---|---|---|
| Palm reading | /palm-reading (and the home widget) | Palm photo (JPG/PNG, max 5 MB) or webcam, plus an optional question | Archetype + element + detected features + opening read; 4 locked sections | AI (LLM vision; model unknown) | Teaser free; full report **$7.99** one-time | "free ai palm reading online", "ai palm reading" | Robots-disallowed, with no meta, H1 or canonical. The homepage carries all the SEO. |
| Chat with Vera | /chat | Text | Chat answers with widgets and mindmaps | AI | **1 ✦ per follow-up** | none (app page) | This is the monetisation engine. SSR shows "Offline". |
| Tarot | /tarot | Spread (Single / Three-card / Celtic cross) + optional question | Card draw + "Vera reads the spread" + overall reading | AI with a static deck | Stardust (the per-spread cost comes from the backend; "+4" is shown near Celtic cross) | "free tarot reading" | Robots-disallowed. Off-core for us. |
| Birth chart | /astrology | Date, time and place of birth | Sun / Moon / Rising reading ("The Deep Water Chart" sample) | AI (chart maths unknown) | **3 ✦** ("Natal chart reading 3 ✦") | "birth chart calculator" | Robots-disallowed. |
| Weekly horoscope | /weekly-horoscope | Zodiac sign | Weekly text + Love / Career / Energy chips + lucky day | **Static / sample** | Free ("Free · updated Mondays") | "weekly horoscope" | **Stale: on 26 Sep it still showed "Week of June 8".** Robots-disallowed. |
| Numerology calculator | /agents/numerology-calculator | Full name + birth date (from the search snippet) | Core numbers (Pythagorean), a personal reading | AI | "Every Palmly agent is free to try" | "numerology calculator" | Indexed in search, but **500 now**. |
| Other agents | /agents/:slug | File / link / text tabs | unknown | AI | unknown | unknown | The count is unknown; the index is 500. |

**In total:** about 5 visible tools, all on one chat engine. None of them is a standalone deterministic calculator or an educational interactive tool. None is indexable except the agents pages, which are currently broken.

---

## 6. Blog and content

- **Status:** `/blog` returns **500**. The UI has a "No posts yet." string. **Web search found 0 indexed blog posts.** The post count, lengths, cadence and authors are **unknown**, and the blog may be empty.
- **Planned design (from blog JS and UI strings):**
  - Name: "**The Palmly Journal**". Meta title: "The Palmly Journal — Palm Reading Guides & Insights". Description: "Grounded guides to palmistry, palm lines, and self-reflection — written to help you read between the lines."
  - Categories: Love, Palm Lines, Getting Started, Career, Traditions, Guides, Meanings, Readings, How-to, Compatibility, Tips, plus palmistry / tarot / astrology / horoscope mapping.
  - Features: a FEATURED post, `author_name` and `author_avatar`, "{{count}} min read", `published_at`, excerpt, pagination, a **Table of Contents**, share buttons (X / Facebook / LinkedIn / copy link), "Keep reading" related posts, and a **newsletter box** ("Read between the lines, weekly — One grounded palmistry guide in your inbox, no noise.").
  - Blog pages are localised (`/{loc}/blog/:slug`, with hreflang built by the SEO helper).
- **E-E-A-T:** only an author name and avatar field. There is no author bio page and no palmist credentials. The About page has no team names.
- **Internal linking to the product:** unknown, because no posts exist or are visible.

---

## 7. SEO implementation

| Area | Finding |
|---|---|
| Titles | Homepage: "Free AI Palm Reading Online". This is exact-match and has **no brand**. Locale homes use translated exact-match titles. Legal pages: "About Palmly · Palmly" (the brand is doubled). App pages: "Palm Reading — Palmly". Agents: "{Tool} Reading Online \| Palmly". |
| Meta descriptions | Homepage: 280+ characters, so Google truncates it, and it repeats "AI palm reading". About and Disclaimer are **cut by code at about 160 characters with "…"**. Contact: "We'd Love To Hear From You" (weak). App pages: **none**. |
| H1 | The homepage has **two H1s** (and so does `/zh`). App pages have **no H1**. The legal pages have 1. |
| Canonical | Self-referencing on the home, locale and legal pages. None on app pages. |
| hreflang | 9 languages + x-default, reciprocal, on the home and legal pages (10 alternate links each). None on app pages. |
| JSON-LD | **Only `WebApplication`** on the homepage (`price 0 USD`, `inLanguage` 9). The same **English** JSON-LD is served on `/zh` and the other locales. There is no Organization, FAQPage (despite the FAQ), Article, BreadcrumbList or SoftwareApplication rating. |
| OG / Twitter | og:title, description, url and site_name are set, with twitter:card `summary_large_image`, but **there is no og:image or twitter:image**, so share previews have no picture. |
| Robots | `Allow: /` but **disallows every tool page**, so the palm, tarot, astrology and horoscope tools can never rank. The sitemap line points to a **500**. |
| Sitemap hygiene | Broken (500). |
| URL style | Clean, lowercase and hyphenated, with no trailing slash. Locales use a prefix (`/zh/...`) and English has none. |
| Internal linking | Very thin: 8 unique links on the homepage, and the tool CTAs are JS buttons. |
| Rendering and speed | SSR HTML, which is good. The homepage has **24 `modulepreload` scripts**. The **all-languages translation bundle (`client-*.js`) is 283 KB uncompressed** and loads on every page. The JS I sampled alone is about 635 KB uncompressed, not counting react-dom. The homepage took about 2.1 s to respond in one sample, with no CDN headers. |
| Mobile | A viewport meta and a responsive Tailwind layout. The nav collapses into a "Menu" button below 880px. |
| Availability | **The TLS cert expired 2026-09-24**, and the blog, agents and sitemap return 500s. This is currently a severe SEO and UX failure. |
| Keyword themes | "free ai palm reading online", "ai palm reading", "palm reading online", "read your palm online" (footer tagline), "numerology calculator", tarot, "birth chart", "weekly horoscope". The translated forms are 手相 (zh/ja), "lectura de palma" (es) and "leitura de palma" (pt). **There is nothing in Hindi or for India** ("hast rekha", "हस्तरेखा", "palm reading in hindi"). |

---

## 8. Acquisition and conversion

- **Attraction:**
  - SEO on the homepage plus 8 locale homepages (the main bet).
  - `/agents/*` tool landing pages. These are the scalable bet, but they are currently broken.
  - A blog that is planned but empty or broken.
  - No paid-ads pixels were seen (only GA4).
  - Social: a Discord invite on the contact page, share links for readings and charts, and blog share buttons.
- **CTAs:** "Start free" in the header, **"Read my palm"** as the primary CTA, "Try free →" on agents, and "Start your reading" and "Read my palm free" on the agent and index pages.
- **Email capture:** only the blog newsletter box. There is no lead magnet and no email step in the reading flow. No popups were seen in SSR; any JS popups are unknown.
- **Upsell ladder:**
  1. Free teaser.
  2. $7.99 one-time unlock, with the $19.99 anchor.
  3. Stardust credits for each follow-up question and each tarot or natal-chart reading.
  4. "Upgrade Plan" (not clear).
- **Persuasion devices:**
  - Named persona (Vera).
  - "ritual" loading copy.
  - Archetype naming ("The Visionary Hand").
  - Locked cards that show a real one-line hook.
  - The strikethrough price.
  - The "Over 120,000 readings" counter.
  - "Illustrative" testimonials.
  - "yours to keep, forever".
- **Retention hooks:** History of readings, follow-up chat, a free weekly horoscope "updated Mondays" (not actually updated), and cross-tools (palm + tarot + birth chart).
- **App promotion:** none.

---

## 9. Strengths, weaknesses, gaps and risks

### Strengths
- A **clean single-action homepage**: the upload box sits in the first screen, with photo-quality chips and "Read my palm".
- **Strong teaser-to-paywall mechanics.** Each locked section shows one specific, emotionally loaded hook sentence, the price is one clear number, and the payment form is in the page.
- **Archetype naming plus a share card** gives an identity hook that people want to share.
- **Follow-up questions as a paid chat** earn more after the first sale.
- **Proper locale architecture:** prefixed URLs, translated titles and meta, `<html lang>`, reciprocal hreflang, and x-default.
- A **CMS tool-landing template** (`/agents/:slug`) with How to use, Features, Use cases, FAQ and More tools. This is a good structure for scaling free-tool SEO.
- A planned blog template with TOC, reading time, author, categories, related posts and a newsletter.
- A tidy legal set (Disclaimer with 18+, entertainment-only wording).

### Weaknesses
- **Operationally fragile.** The TLS cert has expired, and the blog, agents and sitemap return 500s. That kills trust, crawling and conversions right now.
- **Every tool page is robots-disallowed** and has no meta, H1 or canonical. The only rankable surfaces are the homepage, locale homepages and legal pages.
- The **blog and glossary are empty or unbuilt**, so there is no topical authority. Search found only 2 indexed URLs.
- **Stale content:** the "updated Mondays" horoscope was stuck on "Week of June 8".
- Two H1s, no og:image, English JSON-LD on localised pages, no FAQPage schema, and meta descriptions that are too long or truncated.
- A heavy all-locale JS bundle is loaded on every page.
- **No app, no India focus, and no Hindi.** USD pricing with no UPI.
- **Text-only line "detection"** with no visual evidence of tracing on the user's own photo.
- Google-only login.

### Contradictory or misleading claims (risk list)
1. **"Over 120,000 readings and counting"** appears on a domain registered 2026-06-26. It is a hard-coded string, already present on 2026-07-30. It is unverifiable and probably inflated.
2. **The testimonials are fabricated but labelled "Illustrative".** The label is honest, but the quotes are still invented social proof.
3. **The $19.99 struck-through "reference price"** has no evidence of ever being charged. This is a fake-discount risk under consumer-protection and dark-pattern rules (the US FTC; India's CCPA Dark Patterns Guidelines 2023, if they ever sell there).
4. **Health predictions** ("a single island warns of one season of depletion"; the paid "Health & energy" section) contradict the About page's own promise that Vera "never makes claims about your health or how long you'll live". This is also a policy risk for app stores and ads.
5. **"A professional palm reading agent"** presents an AI model as professional expertise.
6. **Loading copy "Aligning what we find with the stars…"** implies an astrology step that the palm flow does not appear to do.
7. **Privacy claims do not match:**
   - The homepage says the photo is "never stored".
   - The privacy notice does not mention photos or images at all, and says "We do not process sensitive information".
   - A shipped UI string says "**Palmly is a demo.** … no real account, payment, or photo is stored", yet the site takes real card payments.
   - The privacy notice names **Stripe**, while the code loads **Airwallex**.
8. **"Every Palmly agent is free to try"** alongside Stardust costs of 3 ✦ and more is borderline messaging.
9. **"Yours to keep, forever"** is made on a site whose Terms say the company "is not obliged to backup any User Content… may be deleted at any time".

---

## 10. Plan for us (Palm Read AI) based on this competitor

We learn patterns only. We must never copy their text, images, persona or design.

### ADOPT (proven patterns that fit us)
| Priority | What | Why / how for us |
|---|---|---|
| **P1** | **Put the upload box in the first screen** with 3 photo-quality chips and one dominant CTA | The single-action hero is the right pattern. For us: our Hindi/English upload card, the chips "खुली हथेली · अच्छी रोशनी · पूरा हाथ", and a single "मेरी हथेली पढ़ें" button. |
| **P1** | **Locked-section teaser with one real hook line per section** | This maps directly onto our 4 parts (love, personality, career & money, life direction). The free web report shows the full first section and one honest hook line for each other section, then points the user to email sign-up (2nd report) or the app. |
| **P1** | **Proper locale architecture** | `/` (English) and `/hi/` (Hindi) with self-canonicals, reciprocal hreflang, x-default, translated titles, meta **and JSON-LD** (they missed the last one), and `<html lang="hi">`. |
| **P1** | **SSR / static HTML for every marketing and tool page** | Their SSR is good. Unlike them, we should pre-render blog, tool and glossary pages at build time, so a backend outage can never return 500s on SEO pages. |
| **P2** | **A tool-landing template**: widget on top, then How to use, Features, Use cases, FAQ, More tools, CTA | Use one template for all 10+ free tools. Add FAQPage and BreadcrumbList schema, which they lack. |
| **P2** | **Blog template features**: TOC, reading time, author, category chips, related posts, share | Add a real author bio page (E-E-A-T) plus "Last updated" dates. |
| **P2** | **Archetype name plus a share card** | We already have a share card and PDF. Add a short bilingual archetype title (in Hindi and English) and render it **on the user's traced photo**. |

### ADAPT (good idea, do it our way)
| Priority | Their idea | Our version |
|---|---|---|
| **P1** | $7.99 one-time web unlock | Our funnel is: 1st web report free, 2nd after email, then **the app**. Use the locked-card UI to sell the *app* ("Full 4-part reading + line tracing + lessons in the app"), with Play Store buttons. If we ever sell on the web: INR, UPI, and no fake anchor price. |
| **P2** | Paid follow-up chat per question | Our upsell could be "Ask 1 question about your reading" inside the app (credits or subscription). On the web, use one free follow-up as an email or app hook, not a pay-per-message wall. |
| **P2** | "Ritual" loading phrases | Make the steps **true**: show our real pipeline (hand detected → heart line traced → head line traced …) with the lines appearing on the photo. It is honest, and it shows off our line tracing, which they cannot. |
| **P2** | Cross-tools (tarot, birth chart) | For India, keep palm as the core. Add only light, relevant tools: name numerology in Hindi, love compatibility from palm or hand type, and marriage-line (vivah rekha) and money-line guides. Skip generic tarot unless there is demand. |
| **P3** | Weekly horoscope as a Monday habit | Only do this if it is automated and dated correctly (Hindi rashifal). Stale "updated Mondays" content is worse than none. A better fit is a **weekly Hindi palm tip** by email or WhatsApp. |
| **P3** | A named AI guide persona | We could have a friendly named guide, but it must always be clearly labelled as AI. It must not be called a "professional palmist". |

### AVOID (their mistakes or risks)
| Priority | Avoid | Reason |
|---|---|---|
| **P1** | Invented counters ("Over 120,000 readings") and invented or "illustrative" testimonials | These destroy trust and carry regulatory risk. Show live counts from our DB and real Play Store reviews, or nothing. |
| **P1** | Fake strike-through "was" prices | This is a dark-pattern and misleading-pricing risk (CCPA 2023 guidelines, and the Consumer Protection Act). |
| **P1** | Health or lifespan predictions in readings or teasers | This violates their own promise and is risky under Play policy and in ads. Our 4 parts contain no health section, and it should stay that way. |
| **P1** | Privacy copy that differs from the real data flow | Our photo-handling claim must match the privacy policy and the actual storage (DPDP Act 2023). Name the real processors. |
| **P1** | Letting certs, sitemaps or CMS pages break | Auto-renew TLS with expiry alerts, generate the sitemap at build time, add an uptime monitor on `/`, `/blog`, `/sitemap.xml` and the tool pages, and keep static fallbacks. |
| **P1** | Robots-blocking the tools | Our tool pages must be indexable SSR landing pages. Only result, account and payment pages should be `noindex`. |
| **P2** | Two H1s, a missing og:image, over-long meta descriptions, English JSON-LD on Hindi pages | These are cheap fixes to get right from day one. |
| **P2** | One JS bundle that contains every language | Split the translations per locale. Our Hindi pages must be fast on low-end Android over 4G. |
| **P2** | Implying things the product doesn't do ("aligning with the stars", "professional agent") | We keep the claims honest and verifiable. |

### Where we can clearly beat them
1. **Hindi first, plus English.** They have 9 languages but **no Hindi or Indian language**, and no India pricing. The Hindi palmistry keywords ("हस्तरेखा", "hast rekha", "palm reading in hindi", "vivah rekha", "bhagya rekha") are completely open against this competitor.
2. **Real line tracing on the user's own photo.** They list "Detected Features" as text only. We show the traced heart, head, life and fate lines, which is visible proof and a better share card.
3. **Honesty as a feature.** Real numbers, real reviews, no fake anchors, no health claims, and a transparent "how our AI traces lines" page.
4. **An app plus learning content.** Lessons, the quiz, compare hands and the PDF give a retention loop they don't have (they have no app).
5. **Reliability and technical SEO basics.** They are live-broken today: expired cert, 500 on the blog, agents and sitemap.

### Specific page and tool ideas for our site
- **P1: a `/hi/` homepage.** Title along the lines of "मुफ्त AI हस्तरेखा रीडिंग — अपनी हथेली की फोटो से" (our own wording), with the upload box, the 4-part teaser and the Play Store button.
- **P1: a Palm photo quality checker (free tool).** A client-side check of brightness, blur and whether the hand is fully in frame, run before upload. It is useful, cheap to build, lowers failed uploads, and no competitor seen has it.
- **P1: a Sample report page.** A fully visible example reading on a demo palm with the traced lines. They only show a blurred teaser.
- **P1: a bilingual palmistry glossary** (`/hi/hastrekha/hriday-rekha`, `/palmistry/heart-line` …). Programmatic Hindi and English line, mount and sign pages that link to the tools and the upload. They planned a glossary but never shipped it.
- **P2: interactive line guides.** "Heart line meaning checker", "Marriage line (vivah rekha) guide", "Fate line checker" and "Hand shape (earth/air/fire/water) quiz". The user picks an illustrated shape and gets a meaning, with a CTA to trace their own palm.
- **P2: "Left or right hand — which to read?"** plus "Palm reading for beginners in Hindi". These are high-intent explainers that link into our app lessons.
- **P2: "How our AI reads your palm"**, a transparency and E-E-A-T page covering what is detected, what is interpretation, the limits, the privacy policy and the 18+ rule.
- **P3: name numerology in Hindi and palm-based love compatibility**, as tools that feed the Compare Hands feature.

### Sources (all fetched 2026-09-26)
- https://palmly.ai/ (homepage HTML; also `/zh`, `/ja`, `/es`, `/pt`)
- https://palmly.ai/robots.txt, https://palmly.ai/sitemap.xml (500)
- https://palmly.ai/palm-reading, /tarot, /astrology, /weekly-horoscope, /chat (app SSR shells)
- https://palmly.ai/blog, /agents, /agents/numerology-calculator, /zh/blog (all 500)
- https://palmly.ai/about-us, /contact-us, /privacy, /terms-of-use, /disclaimer
- https://palmly.ai/__manifest?paths=… (route manifest), https://palmly.ai/herm/api/v1/version/prices
- JS bundles: `/assets/client-DjYPaYxV.js` (UI strings), `palm-D0JK8l9n.js`, `auth-YUp5h-n0.js`, `chat-store-5InCTrTc.js`, `lunara-layout-D_UHcqQc.js`, `agent-detail-CvK3l9j9.js`, `blog-index-CcjoC9YK.js`, `seo-tXZPvc4a.js`
- The TLS certificate via `openssl s_client` (notAfter 2026-09-24)
- Wayback: https://web.archive.org/web/20260730034905/https://palmly.ai/ (the only snapshot)
- RDAP for the domain: registered 2026-06-26
- Web searches ("site:palmly.ai" and 7 others): only `/` and `/agents/numerology-calculator` were found indexed
