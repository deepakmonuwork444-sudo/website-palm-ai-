# Competitor teardown 04: PANDIT AI (https://pandit.ai/)

Researched on 2026-09-26. Read-only: no sign-up, no uploads, no forms, no payments, no chat with their AI.
Budget: about 51 requests to pandit.ai (robots, sitemap, llms.txt, 4 HTML shells, the main JS/CSS bundle and 40 lazy-loaded page chunks, 3 HEAD checks), plus 1 Google Play listing fetch. An App Store fetch failed, so iOS numbers are **unknown**.

**How the content was read:** pandit.ai is a client-side React app. Every URL returns the same 5.7 KB HTML shell with an empty `<div id="root">`, and all copy lives inside JavaScript chunks. I downloaded the public JS chunks for each route and pulled the visible strings, headings, JSON-LD builders and component logic out of them. Quotes below come from those bundles. Word counts are estimates from string content, not rendered counts.

---

## 1. Snapshot

| Item | Finding | Evidence |
|---|---|---|
| What it is | An AI Vedic astrology **app** (voice call and chat with an "AI Pandit", kundli, palm scanner, face scanner, daily readings, paid reports, kundli matching). The website is a marketing and SEO layer that pushes installs. Every feature page ends in "Download Pandit AI". | `/`, `/call`, `/palm-scanner`, `/kundli` bundles; mobile bottom nav = Home · Connect · **Download** · Palm · Face |
| Positioning | "World's 1st Voice AI Pandit", "Speak to AI Astrologer on Call", "The Smartest Pandit Ever", "Precise · Personal · Private" | Home hero bundle (`Index-*.js`), `/faq` |
| Company | STULINK PRIVATE LIMITED (CIN U72200CH2021PTC043994, a Chandigarh RoC code). The FAQ answer "Who created Pandit AI?" says instead: "headquartered in California, USA". The two statements contradict each other. | Footer string in `main.js`; `/disclaimer`; `/faq` |
| Business model | Free app download. **Pay-per-use**: voice and chat billed **per minute**, at **₹50–₹200/min in India** and **$1–$3/min internationally** (final rate shown in-app). One-time purchases for reports and for palm and face scans ("One-time payment per scan. Includes PDF report."). No subscription. Payment through App Store or Google Play. No refunds on delivered sessions or reports; 7-day window for technical errors only. Free items: daily kundli reading, daily Mulank, birth chart, basic chart analysis. | `/pricing-policy` ("Last updated: September 08, 2025"), `/refund-policy`, `/faq` "Pricing and Payment" |
| Apps | Android `com.app.pandit.ai`. Google Play (IN) on 2026-09-26: **4.8★, 119 reviews, 10K+ downloads, updated 19 Aug 2026, in-app purchases**. iOS `id6752389345` (rating and count **unknown**). | play.google.com listing; store URLs in `main.js` |
| Languages / regions | The **website is English-only** (`<html lang="en">`, no hreflang, no `/hi/` routes). The whole site contains only 3 Devanagari words (script names on `/chat`). Transliterated Hindi terms are used heavily: *hastrekha, Hridaya Rekha, Vivah Rekha, Santan Rekha, Kalatra Bhava, Videsh Yog*. The app claims "50+ languages"; the site lists 19 (10 Indian + 9 foreign). Targets India first and the diaspora second (activity toasts rotate Dubai, Singapore, London, Toronto, New York, Sydney, Kathmandu, Colombo). | `LanguagesFlowSection`, `main.js` city list |
| Framework | **Vite + React SPA** (React Router, TanStack Query, Radix/shadcn UI, Tailwind, framer-motion, lucide icons). Client-side rendering only. **No SSR or prerender**: Googlebot gets the same empty shell. | `index.html`; `/assets/index-tWjsgWnJ.js` |
| Builder / hosting | **Built and hosted on Lovable** (asset paths `/__l5e/assets-v1/...`, a `lovable.app` preview URL left in the calculator code, and the `/~flock.js` analytics proxy). **Cloudflare** in front (`Server: cloudflare`, `__cf_bm` cookie). Assets on Cloudflare R2 (`r2_key`). Hashed assets use `max-age=31536000, immutable`; HTML uses `no-cache`. | Response headers; `main.js` |
| Analytics / tags | GA4 `G-GXF9VKX6ZK`, Lovable's first-party analytics (`/~flock.js` with `/~api/analytics`), Google Search Console verification meta. No Meta pixel, Clarity or Hotjar seen. | `index.html` |
| CMS | None. All content is hard-coded in React components: one JS chunk per page, one config object per calculator. | chunk list in `main.js` |
| i18n | None on the web. There is a dark/light theme toggle (`localStorage 'pandit-theme'`). | `index.html` |
| GEO / AI search | `llms.txt` lists all 59 pages with rich one-line summaries. robots.txt **explicitly allows** GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended, CCBot, Bytespider and others. | `/robots.txt`, `/llms.txt` |
| Social | YouTube @Panditaiapp, Facebook, Instagram, TikTok @pandit.ai, LinkedIn, X @PanditAIapp | Organization JSON-LD `sameAs` |
| Traffic | **Unknown**. No public traffic figure was seen. | — |

---

## 2. Full route inventory

The sitemap (`https://pandit.ai/sitemap.xml`) is a single urlset with **59 URLs** and no sitemap index, image sitemap or blog sitemap. Every `lastmod` is **2026-09-20 (43)** or **2026-09-21 (16)**, which means the whole file was bulk-stamped rather than dated per page. `changefreq` and `priority` are set on every entry. The router in `main.js` matches the sitemap exactly, plus 3 hidden routes.

| Page type | Count | URL pattern | Examples |
|---|---|---|---|
| Homepage | 1 | `/` | https://pandit.ai/ |
| Core feature landing pages (app-only features) | 6 | `/{feature}` | `/call`, `/chat`, `/palm-scanner`, `/face-scanner`, `/daily-readings`, `/kundli` |
| **Palm reading topic pages** | **8** | `/palm-scanner/{topic}` | `/palm-scanner/love-marriage`, `/family-children`, `/business-success`, `/health-wellbeing`, `/wealth-money`, `/luck-destiny`, `/career-success`, `/foreign-travel` |
| Face reading topic pages (mirror of palm) | 8 | `/face-scanner/{topic}` | same 8 topic slugs |
| Paid report explainer pages | 5 | `/reports/{report}` | `/reports/1-year-report`, `/5-year-report`, `/love-marriage-compatibility`, `/money-wealth-forecast`, `/full-kundli-report` |
| "Life question" long-form pages | 8 | `/questions/{question-slug}` | `/questions/when-will-i-get-married`, `/will-my-ex-come-back`, `/which-career-is-best-for-me`, `/should-i-start-my-own-business`, `/will-i-become-wealthy`, `/will-i-settle-abroad`, `/do-i-have-raj-yoga`, `/do-i-have-manglik-dosha` |
| Free calculators (the only interactive web tools) | 8 | `/calculators/:slug` (one template, 8 configs) | `/calculators/marriage-age`, `/kundli-matching`, `/manglik-dosha`, `/luck-score`, `/wealth-potential`, `/business-or-job`, `/abroad-settlement`, `/will-my-ex-come-back` |
| Informational / brand | 7 | `/{slug}` | `/about`, `/ai-astrology`, `/ai-vedic-astrology`, `/how-it-works`, `/faq`, `/guide`, `/download` |
| Comparison pages | 3 | `/pandit-ai-vs-{x}` | `/pandit-ai-vs-chatgpt`, `/pandit-ai-vs-human-astrologer`, `/pandit-ai-vs-astro-apps` |
| Legal | 5 | `/{policy}` | `/privacy-policy`, `/terms`, `/pricing-policy`, `/disclaimer`, `/refund-policy` |
| Hidden (not in sitemap, disallowed in robots) | 2 | — | `/analytics` (internal dashboard), `/test-palm-scanner` (**passcode-gated internal test of a web palm-scan checkout**, see §4) |
| Catch-all | 1 | `*` | React `NotFound`. The server still returns **HTTP 200** (e.g. `/blog` → 200 with the shell), so every 404 is a soft 404. |

**Blog:** none. There is no `/blog`, no posts, no categories and no RSS feed. The "content" consists of the 8 question pages, 16 palm and face topic pages, 5 report pages, 3 comparisons, the FAQ and the guides.

**Programmatic SEO:** only light. There is a template for calculators (`/calculators/:slug`) and a mirrored topic grid of 8 topics × 2 modalities (palm, face). There are no per-zodiac, per-date, per-city, per-name or per-nakshatra pages. Each topic page is a separate hand-written component, not a data-driven template.

Content launch timing: calculator hero-image assets carry `created_at` 2026-09-21. The calculators and the sitemap refresh went live around 20–21 Sep 2026, which is very recent and shows an active SEO push right now.

---

## 3. Homepage teardown (`/`)

The static HTML has only `<title>PANDIT AI - AI Astrology App | Voice Consultations</title>`, a meta description ("Speak with the smartest AI astrologer. Get instant Vedic readings by voice. 24/7 guidance. Free download."), a `meta keywords` tag, OG and Twitter tags, and 3 JSON-LD blocks (WebSite, Organization, SoftwareApplication). The rest is rendered by JS. The section order below is approximate, taken from the import order in `Index-*.js`.

1. **Sticky header plus mobile bottom nav.** Home · Connect (`/chat`) · centre **Download** button · Palm · Face. Palm is one of 4 primary nav destinations, which shows palm is a key traffic entry.
2. **Hero.** The headline pills rotate "World's 1st Voice AI Pandit", "Speak to AI Astrologer on Call", "50+ Languages Supported" and "Live Planets · Accurate Predictions". Rotating feature chips: When Will I Get Married?, Best Career Path for You, Chat with an AI Pandit, Palm Scanner, Face Scanner, Free Daily Predictions, Free Daily Mulank, MatchMaking Calculator. Below them, a two-row marquee labelled "they're asking…" shows about 20 user questions ("What does my palm reveal?", "Will I get promoted this year?") and about 20 one-line "answers" ("Heart line shows deep bonds", "Wear blue sapphire for prosperity"). The visual is a transparent talking-girl video (`hero-girl-talking-alpha.webm`, **946 KB, preloaded on mobile**) over animated orbits, particles and a shooting star. Tagline: "Precise · Personal · Private".
3. **Rating strip.** Five stars, "**4.8 · 100K+ Downloads**" (hard-coded; Play shows 10K+ downloads and 119 reviews). A green pulsing "**N viewing now**" counter sits next to it; it is random, see §9.
4. **"As Seen On" logo marquee.** One image with alt text "Yahoo, MarketWatch, India Times, The Tribune, ANI, Morningstar, Business Insider". It links to no articles. This set of logos is typical of paid press-release syndication (unverified).
5. **Voice AI section.** "Speak to AI Pandit Anytime", with sample Q&A chat bubbles (marriage, promotion, gemstone, investments, health).
6. **Features grid.** "Everything You Need for Spiritual Guidance", 8 cards: AI Voice Pandit, Palm Scanner ("Advanced AI reads your palm lines to reveal personality and future insights"), Face Scanner, Daily Predictions, Kundli Analysis, Gun Milan, Career Guidance, Remedies.
7. **Languages flow.** Animated chips for Hindi, Tamil, Telugu, Marathi, Punjabi, Gujarati, Malayalam, Kannada, Bengali, Odia, English, Spanish, French, German, Japanese, Korean, Chinese, Portuguese and Russian.
8. **"The Technology: How We Trained Our AI".** Cards for Vedic Data, AI Training, Live Planetary Data and Speak to AI Pandit. The "Accuracy" block says "Multi-layered validation ensures precise predictions every time" and lists Birth Chart Analysis, Real-Time Planetary Data, Multi-System Validation and AI Vedic Engine.
9. **Comparison table.** "The Smarter Choice: Why PANDIT AI Stands Apart". 7 rows (voice, Vedic-trained, kundli personalisation, palm and face AI, emotional tone, spiritual context, all-in-one) × 4 columns: PANDIT AI, ChatGPT, Human Astrologer, Astro Apps. No competitor brand is named.
10. **Testimonials.** "Loved by Thousands": 15 named cards (Indian first names, a city and a date between 20 May and 24 Jun 2026) and 6 more on the home bundle. None link to a store review.
11. **CTA banner** (image "Happy PANDIT AI users celebrating and a newlywed couple") and a **mobile banner carousel** with 6 slides: Astrology Meets Technology, Palm Reveals Everything, Wedding Guidance, Free Daily Reading, Face Reveals Destiny, Clarity Brings Prosperity.
12. **Footer.** Link columns cover every sitemap URL: features, palm topics, face topics, reports, questions, calculators, compare pages, legal. Also "© STULINK PRIVATE LIMITED (CIN …)" and social icons.
13. **Global overlays on every page:** (a) a **fake activity toast** bottom-left ("User from Pune · Just downloaded PANDIT AI on Android · 12 sec ago", linking to `/download`), see §8/§9; (b) a download modal with device detection, and on desktop a QR code generated through `api.qrserver.com`.

There are no pricing hints on the homepage beyond "Free download"; prices live only in `/pricing-policy` and in the app.

---

## 4. Palm-reading product flow (and the main AI product)

### 4a. What the web palm page is: `/palm-scanner`
- **Title:** "Palm Reading AI | Free AI Palm Scanner Online - PANDIT AI". **Meta description:** "Palm reading AI that scans your palm in seconds. Free online palm reader powered by Vedic Samudrika Shastra… Download PDF report."
- **H1:** "PALM READING / hastrekha", with the sub-line "AI-Powered Vedic Palmistry".
- **There is no scanner on the web.** The page has no input, file upload or camera. The steps read "Open the App → Grant Camera Access → Position Your Palm → Align with Guide → Capture → Wait for Analysis → Review Results + PDF". This makes it an **app-install landing page dressed as a "free online" tool**.
- **Free vs paid contradiction:** the title says "Free AI Palm Scanner Online", but `/faq` says "How much does palm reading cost? One-time payment per scan. Includes PDF report." No price is shown on the web.
- **H2 outline (long-form, ~1,500+ words):** What is Palm Reading AI? · Why Use an AI Palm Scanner? (AI vs traditional palmist) · How Our Palm Scanner Works · What We Analyze · The Lines of Your Palm · The Mounts · Fingers and Special Markings · Left Hand vs Right Hand · Your Palm Reading Results · Vedic Palmistry Tradition · Languages Supported · How to Scan Your Palm (+ tips) · FAQ (10 Qs) · "Palm Reading by Topic" (links to the 8 topic pages) · "Complete Your Reading with Your Birth Chart" (cross-sell to kundli).
- **Claimed report scope:** major lines (Life, Heart, Head, Fate, Sun, Marriage), secondary lines (Marriage, Children, Money), minor lines (Travel, Health, Intuition), breaks, branches and islands, all mounts plus the Plain of Mars, finger lengths, shapes and phalanges, thumb flexibility, and special markings (crosses, stars, squares, triangles, islands, grilles, chains, tridents). Output: a text reading "within seconds" plus a PDF, in 50+ languages.
- **Accuracy copy:** "it never misses a line, never tires… Many users scan their palm with us and with a traditional palmist and find the structural readings line up closely." This is unverifiable and overclaims.
- **Visuals:** 4 phone screenshots (`palm-phone-IMG_2963–2966.png`), a "Scanning…" mock-up, and a "Happy user using AI palm scanner" cut-out.

### 4b. Palm topic pages: `/palm-scanner/{topic}` (8)
- Example: `/palm-scanner/love-marriage`. Title "Love & Marriage Palm Reading | AI Palm Scan - PANDIT AI", H1 "Palm Reading for Love & Marriage", about 1,800 words. The 17 H2s cover the heart line (Hridaya Rekha), marriage lines (Vivah Rekha), timing of marriage, love vs arranged signs, other markings, mounts, **reading compatibility between two palms**, delays and warning markings, **Vedic remedies for marriage delays**, palm + kundli, how to scan, AI vs palmist, and an FAQ.
- `/palm-scanner/career-success`: about 1,000 words, H1 "Career & Success Palm Reading — Find the Career Your Hand Was Made For".
- The health page is described in `llms.txt` as "without medical claims", and the wealth page as "without financial guarantees". Their newer copy is deliberately careful.
- Every topic page ends with an app CTA and a `RelatedContent` block that interlinks all palm, face, report and guide pages.

### 4c. Hidden signal: they are building a paid web palm scanner
`/test-palm-scanner` (passcode "Private preview", disallowed in robots, internal title "Palm Scanner Test Flow | Internal") loads `PalmScanTest-*.js`. The public JS shows:
- **Pay first:** a "Buy Palm Scanner" card listing "Auto camera palm scan with live line mapping · Life, head, heart, fate and sun line reading · Mounts, finger ratios and hand-shape analysis · Career, love, health-as-energy and timing themes · Full written report you can revisit anytime", with "Test price $0.00" and "Sandbox checkout — no card is taken".
- **Capture:** browser camera through `getUserMedia` with auto-capture ("Place your right palm inside the frame", "Hold steady — capturing your palm", "Too dark — move to better light"), plus an "Upload a palm photo" fallback when the camera is blocked or unsupported.
- **Wait theatre:** "Analysing your palm — This usually takes about two minutes", with staged messages ("Cleaning up the palm image → Detecting major and minor lines → Measuring mounts and finger ratios → … → Cross-checking with Vedic palmistry rules → Writing your personalised report") and a "Skip the wait (test only)" button.
- **"Live line mapping" is drawn from fixed SVG paths** (hard-coded curves such as `M98,86 C86,126…` for the life, head, heart, fate and sun lines). In this test build the lines are **not traced from the user's photo**, and the report is sample text ("Hand shape — Fire hand", "Right hand · 5 major lines · 7 mounts read").
- The chunk has no backend or API calls yet, so this is a flow prototype.
- **Implication for us:** within weeks or months they will likely launch a paid web palm scan priced in USD, with a card or cart checkout. Our free first reading, real tracing on the user's own photo, and Hindi-first positioning need to be live and indexed before then.

### 4d. Main AI product (voice/chat), as visible
- `/call`: H1 "Talk to an AI Astrologer: Live Voice Consultations". `/chat`: H1 "Call or Chat Anytime: AI Astrologer On Demand". Both are app-only.
- Pricing on those pages is vague ("charged per minute… a fraction of typical human astrologer fees"; human rates framed as "Often $2-10+ per minute" and "Often ₹20-100+ per message"). The concrete figures appear only in `/pricing-policy`: **₹50–₹200/min in India, $1–$3/min internationally**.
- Users can switch between male and female pandits (Play listing).
- Reports (`/reports/*`) are in-app paid products. The web pages explain structure only (1-Year report: "11 sections", a rolling 12 months "from the day you get it", a sample month labelled "Illustration only—not a real prediction") and show **no price**.

---

## 5. Free tools

The only interactive tools on the web are the 8 calculators. Scanners, kundli, daily readings, call and chat are app-only landing pages, with 0 inputs in their bundles.

Common calculator template (`CalculatorPage-*.js`, config in `main.js`):
- **Input:** first and last name, birth day, month and year, hour, minute and AM/PM ("Use the closest known time if you are unsure"), and a birth place searched from bundled A–Z city JSON files (worldwide, no external geocoder). Kundli matching asks for a second person. The ex calculator adds relationship status and "How long since it ended?".
- **Process:** runs **fully in the browser**. There is no API call or AI; it is a rule-based Vedic model (Moon Nakshatra, Vimshottari Dasha, house lords).
- **Output:** a labelled result card plus chart facts (Lagna, Moon sign, Moon Nakshatra, running Mahadasha and Antardasha, etc.), a disclaimer, an FAQ, and "Get your full reading in the PANDIT AI app".
- **Gating:** none. "Takes a few seconds · No sign-up needed".
- **Schema:** `WebApplication` + `Offer`.
- **Hero images:** 5 per calculator, some PNGs at **1.38–1.53 MB each**.

| Tool | URL | Input | Output (result label) | AI or static | Gated? | Target keyword (inferred from metaTitle) | Quality notes |
|---|---|---|---|---|---|---|---|
| Marriage Age Calculator | /calculators/marriage-age | Name, DOB, time, place | "Your strongest marriage window" (a Dasha window, not a date) | Static rules | No | "marriage age calculator", "at what age will I get married" | Honest disclaimer ("not a guaranteed marriage date") |
| Kundli Matching | /calculators/kundli-matching | Two people's birth data | "Your educational Guna Milan score" out of 36, all 8 Kootas | Static | No | "kundli matching calculator", "guna milan score out of 36" | Covers Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi; "not a marriage verdict" |
| Manglik Dosha | /calculators/manglik-dosha | Birth data | "Your Manglik pattern" (Mars from Lagna, Moon, Venus) | Static | No | "manglik dosha calculator", "am I manglik" | "Calm, no-fear" framing, which reads well |
| Luck Score | /calculators/luck-score | Birth data | "Your current luck score" across career, money, love and wellbeing | Static (their own house model) | No | "luck score calculator", "how lucky is my chart" | Admits the score is "a transparent PANDIT AI house model, not a number found in classical texts" |
| Wealth Potential | /calculators/wealth-potential | Birth data | "Your wealth-building pattern" (Dhan Yoga: 2/5/9/11 lords) | Static | No | "dhan yoga in kundli", "wealth calculator astrology" | "Not financial advice" |
| Business or Job | /calculators/business-or-job | Birth data | "Your work-style split" (%) | Static | No | "business or job calculator kundli" | "Never tells you to quit a job" |
| Abroad Settlement | /calculators/abroad-settlement | Birth data | "Your Videsh Yog pattern" | Static | No | "will I settle abroad", "videsh yog calculator" | "No visa predictions" |
| Will My Ex Come Back | /calculators/will-my-ex-come-back | Birth data + relationship status + time since breakup | "Your current relationship-cycle lean" | Static | No | "will my ex come back astrology" | "Never supports vashikaran… cannot predict another person": an ethical guardrail on a risky query |

**Palm-specific web tools: none.** They have no palm quiz, line identifier, hand-shape finder, finger-ratio tool or marriage-line calculator on the web. Everything palm-related is text or sends users to the app. This is the gap we can own.

---

## 6. Blog / content

- **Blog: none.** There are no categories, dated posts or authors; `/blog` is a soft 404.
- **Evergreen long-form instead:** about 30 content pages:
  - 8 question pages: "When Will I Get Married? What Your Birth Chart Really Says", with "13 sections", a TOC, an image gallery, "Free to start · Works even without a birth time", and around 1,000–1,600 words each.
  - 16 palm and face topic pages: around 1,000–1,800 words each.
  - 5 report pages and 3 comparisons.
  - `/faq` with **145 questions** in about 20 categories (Getting Started, Palm Reading Questions, Pricing and Payment, Privacy and Security, Remedies and Mantras, Dasha System, and so on). Title: "AI Astrology FAQ - 100+ Questions Answered".
  - `/guide`, `/ai-astrology`, `/ai-vedic-astrology`, `/how-it-works`.
- **Formats:** a TOC with section count, H2-heavy explainer, comparison tables (e.g. "Generic yearly horoscope vs PANDIT AI 1-Year Report"), FAQ accordions, image galleries, "Illustration only" sample output, and app CTAs mid-page and at the end.
- **Topic clusters:** marriage and love (strongest), career, money and wealth, abroad settlement, Manglik and doshas, Raj Yoga, ex back, palm by topic, face by topic, AI-vs comparisons.
- **Update cadence:** unknown per page, since no visible dates exist. The sitemap stamps everything 2026-09-20/21 and legal pages say "Last updated: September 08, 2025". Asset timestamps show the calculators were added in September 2026.
- **E-E-A-T:** weak. The `Article` schema author is always the Organization "PANDIT AI". There is no named astrologer, palmist or reviewer, no credentials, no "reviewed by" line and no sources. The About page has no founders or team names ("a dedicated team…").
- **Internal linking:** strong. A global `RelatedContent` module links every feature, palm topic, face topic, report, guide, FAQ and comparison page. The footer links all 59 URLs. Question pages link to the matching calculator and report, and palm pages cross-sell kundli.
- **Images:** custom AI-style illustrations and phone screenshots, hosted on R2 via Lovable, some very heavy (1.5 MB PNG).
- **Hindi or Indian-language content: effectively zero.** Only transliterated Sanskrit and Hindi terms appear in English copy.

---

## 7. SEO implementation

| Area | Finding |
|---|---|
| Rendering | **CSR-only SPA.** Every URL returns an identical 5,704-byte shell with the **homepage** title, description, OG and JSON-LD. The per-page `document.title`, meta description, canonical link, `og:*` and JSON-LD are injected by JS after load. Google can render this, but slowly and less reliably. **Social crawlers (WhatsApp, Facebook, X) and most AI crawlers do not run JS, so every shared deep link previews as the homepage.** |
| Title pattern | `{Primary keyword} \| {Secondary} - PANDIT AI` or `… \| PANDIT AI`, e.g. "Palm Reading AI \| Free AI Palm Scanner Online - PANDIT AI", "Free Kundli Online - Most Accurate Birth Chart \| Live NASA Data \| PANDIT AI", "Marriage Age Calculator: At What Age Will I Get Married?". Brand casing is inconsistent ("Pandit AI" on legal pages). |
| Meta description | Keyword-dense, with benefit and "Free", e.g. "Get your complete Kundli FREE - Ascendant, Mahadasha, … Powered by live NASA planetary data." |
| Meta keywords | Present (useless for Google). Example on /kundli: "Free Kundli, Kundli online, birth chart, Janam Kundli, Free Kundli by date of birth…" |
| H1 | One per page, often two-part with a span ("PALM READING / hastrekha" + "AI-Powered Vedic Palmistry"). Question pages use the question itself as the H1. |
| Canonical | Set by JS only (`Q4(canonicalUrl)`); **not in the static HTML**. |
| hreflang | **None.** No language alternates. |
| JSON-LD | Static on every URL: WebSite, Organization (sameAs ×5, contactPoint), SoftwareApplication with **hard-coded `aggregateRating 4.8 / ratingCount 10000`**. Per page via JS: FAQPage, HowTo (palm scan steps), Article (author = Organization), BreadcrumbList, WebApplication + Offer (calculators), and a **Product schema whose AggregateRating and Reviews are computed from their own on-site testimonials**. Google's review-snippet rules disallow self-serving or fabricated review markup. HowTo rich results are deprecated, and FAQ rich results are restricted to authoritative gov/health sites. |
| OG / Twitter | A static homepage set (`og-image.jpg`) is present. Per-page OG is set by JS and therefore invisible to social scrapers. |
| robots.txt | Very long and explicit: allow-all for about 45 named bots including every major AI crawler; disallow only `/analytics` and `/test-palm-scanner`; points to sitemap and `llms.txt`. |
| Sitemap hygiene | 59 URLs, complete and matching the router. Bulk `lastmod` values, `priority` and `changefreq` (ignored by Google), no image sitemap. |
| Status codes | **Soft 404s** (unknown paths return 200). `www.pandit.ai` returns a **302** (temporary) to the apex instead of a 301. |
| URL style | Clean, lowercase, hyphenated, shallow (`/palm-scanner/love-marriage`, `/questions/when-will-i-get-married`, `/calculators/manglik-dosha`). The brand word "scanner" sits in topic URLs instead of "palm-reading". |
| Internal linking | Very dense (RelatedContent module + mega footer + in-content cross-sells). |
| Page weight | Main JS **638 KB raw** (served gzipped) + CSS **140 KB raw** + per-route chunks of 30–80 KB + the **946 KB hero video preloaded on mobile** + calculator PNG heroes of **~1.4–1.5 MB each**. Many infinite CSS animations (orbits, particles, glow, marquee, shooting star). Google Fonts preconnect. Lighthouse and CWV scores: **unknown** (not measured). |
| Mobile | Mobile-first UI: bottom nav, mobile-only hero video, swipe carousels, device-aware store buttons. |
| Keyword themes clearly targeted | *palm reading AI, free AI palm scanner online, hastrekha, palm reading for love & marriage / career / money / foreign travel / children, face reading AI*; *talk to AI astrologer, AI astrologer call/chat, AI vedic astrology, AI pandit*; *free kundli online, janam kundli, kundli matching, guna milan score out of 36, manglik dosha calculator, marriage age calculator, when will I get married, will my ex come back, will I settle abroad, dhan yoga, raj yoga*; *daily horoscope, daily mulank*; *pandit ai vs chatgpt / human astrologer / astro apps*. |

---

## 8. Acquisition and conversion

- **Attraction:**
  - (1) SEO on high-intent Indian life questions (marriage, ex, career, abroad, Manglik) plus tool keywords.
  - (2) Free calculators as link and traffic bait (new in September 2026).
  - (3) GEO/AI answers via `llms.txt` and open AI-crawler rules.
  - (4) Social accounts on YouTube, Instagram, Facebook, TikTok, LinkedIn and X.
  - (5) Probable paid PR (the "As Seen On" logos).
  - Paid ads: no pixel seen on the site, so **unknown**.
- **Primary CTA everywhere:** "Download App" or "Download Pandit AI". Store links carry UTMs (`utm_source=website&utm_medium=cta&utm_campaign=modal`). The download modal auto-detects iOS/Android/desktop and shows a QR code on desktop ("Scan with your phone to download instantly", "Free to download • Auto-detects your device"). The mobile bottom nav has a centre Download button.
- **Social-proof machinery (fabricated, see §9):**
  - A random "viewing now" counter with per-page ranges: home 3,200–5,000, palm 2,100–3,600, call 1,500–2,800, face 1,000–2,000, chat 850–1,700, kundli 700–1,400, daily 500–1,100. It drifts by −8 to +12 per tick, with occasional jumps of −40 to +60.
  - Activity toasts: every 5 s for the first 90 s, "User" from a random city (17 Indian + 9 foreign), with a page-specific message (on the palm page: "Scanned their palm on PANDIT AI", "Got a live palm reading on PANDIT AI"), a random "N sec ago" (3–90), a random avatar, and a click through to `/download`. Dismissal is saved per path in sessionStorage.
  - Hard-coded "4.8 · 100K+ Downloads".
- **Email or WhatsApp capture:** **none** on the web. There is no newsletter, lead form, exit-intent popup or WhatsApp link. The web gives away calculator results with no identity capture, which is lost retargeting potential.
- **Upsells:** calculator result → "Get your full reading in the PANDIT AI app"; palm topic → "Complete Your Reading with Your Birth Chart" (kundli); question page → matching calculator → report → voice call.
- **Pricing presentation:** anchoring against others ("Others ₹199–499 for Mahadasha… ₹999–2,999 for complete report; us FREE"; human astrologers "$2–10+ per minute"). The real per-minute rates (₹50–200) are buried in the policy page. INR for India, USD abroad.
- **Retention hooks (in-app, per the site):** free Daily Kundli reading, Daily Mulank (number, colour, direction, lucky hours), Shubh Muhurat, "remembers your chart", and switching between male and female pandits.

---

## 9. Strengths, weaknesses, gaps and risks

### Strengths
1. **Question-led information architecture.** Pages map to the exact questions Indians ask astrologers (marriage timing, ex, abroad, Manglik, business vs job), and each has a matching calculator and a paid report. This is a clean funnel: question → free tool → app.
2. **Palm topic grid.** 8 life-area palm pages with long, structured, Indian-context copy (Vivah Rekha, Santan Rekha, remedies, love vs arranged).
3. **Responsible-language guardrails in the newest content.** "No vashikaran", "cannot predict another person", "no visa predictions", "never tells you to quit a job", "not a number found in classical texts". This is a good model for policy-sensitive topics.
4. **No-sign-up calculators** with instant results, worldwide city search bundled locally, and zero backend cost.
5. **Dense internal linking, a complete sitemap, and `llms.txt` plus open AI-crawler rules** (well positioned for ChatGPT, Perplexity and Google AI Overviews citations).
6. **Polished mobile UX:** bottom nav, device-aware store buttons, QR code on desktop, UTM tagging.
7. **Recent momentum:** a new calculators batch in September 2026 and a web palm-scan checkout in testing.

### Weaknesses
1. **CSR-only SPA.** Deep links share as the homepage, there are no server-side titles, canonicals or JSON-LD, soft 404s, and a 302 on www. Rankings depend on Google's JS rendering queue.
2. **No blog and no fresh dated content.** There is no author identity or E-E-A-T.
3. **Zero Hindi or regional-language pages** despite "50+ languages" in the app. Hindi search demand ("हाथ की रेखा", "शादी की रेखा", "कुंडली मिलान") is untouched by them.
4. **No real palm tool on the web.** "Free AI Palm Scanner Online" is really an install page, and the palm scan is paid in-app.
5. **Heavy pages:** 638 KB JS, a 946 KB mobile hero video, 1.5 MB PNGs, and many infinite animations.
6. **Low real traction relative to claims:** Play shows 10K+ downloads and 119 reviews.
7. **Palm is one of many features.** Their palm depth is marketing text, and the test build draws template lines rather than tracing the real palm.

### Risks (claims that may be misleading or policy-risky)
- **Fabricated social proof:** random "viewing now" counts and fake "User from {city} just downloaded… 12 sec ago" toasts. This is likely to count as a dark pattern (false urgency or false popularity) under India's CCPA *Guidelines for Prevention and Regulation of Dark Patterns, 2023*, and is also an app-store and ads-policy risk.
- **Inflated metrics:** "100K+ Downloads" on the site and `ratingCount: 10000` in schema, against Play's 10K+ downloads and 119 reviews (iOS unknown). Product schema reviews are built from their own unverifiable testimonials, which violates Google's review-snippet guidelines and risks a manual action.
- **Superlatives and pseudo-science claims:** "World's 1st Voice AI Pandit", "The Smartest Pandit Ever", "Most Accurate Birth Chart Ever Created", "**Live NASA Planetary Data**" (they actually use Swiss Ephemeris, which is only derived from NASA JPL ephemerides), "trained on millions of charts", "knowledge exceeding any individual human astrologer", and for palm, "never misses a line". None of these are substantiated. This carries ASCI and consumer-law exposure.
- **Unverified "As Seen On" media logos** with no links to coverage.
- **"Free" in titles for paid features** (palm scanner): a misleading-advertising risk.
- **Contradictory company identity:** "headquartered in California, USA" vs an Indian private limited company registered in Chandigarh.
- **Monetising sensitive queries per minute** ("Will my ex come back?", health, marriage delay) at ₹50–200/min with a no-refund policy creates reputation and regulatory exposure. Their calm copy mitigates this partly.
- **Face reading (physiognomy) from photos** raises discrimination and "beauty judgement" concerns; they hedge with "without beauty judgements".

---

## 10. Plan for us (Palm Read AI) from this competitor

Principle: learn the **patterns**, never copy their text, images or design. Our edge is **palm-only depth, Hindi first, real line tracing on the user's own photo, honest free-first pricing, and no fake social proof**.

### ADOPT (proven patterns worth doing)
| # | Pattern | Why | Priority |
|---|---|---|---|
| A1 | **Life-question pages linked to a free tool and the app.** For example `/questions/shaadi-kab-hogi-hath-ki-rekha` (Hindi) and `/questions/when-will-i-get-married-palm-reading`. Each page: a short honest answer, what the palm lines say (marriage line, heart line), a "try it on your palm" upload box, then an app CTA. | Their best funnel shape; marriage and love are the highest-intent Indian questions | **P1** |
| A2 | **Palm topic grid** for our 4 report areas plus extras: `/palm-reading/love-marriage`, `/career-money`, `/personality`, `/life-direction`, `/children`, `/foreign-travel`, `/health-energy` (non-medical). Build each in **both `/hi/` and `/en/`**, each showing **a real traced example** on a sample palm. | They rank this grid in English only, with no real imagery of line detection | **P1** |
| A3 | **No-sign-up instant tools** with a clear result card, a calm disclaimer and a "full reading in the app" CTA | Low friction brings traffic and links; their calculators need zero sign-up | **P1** |
| A4 | **Device-aware store buttons + QR code on desktop + UTM per placement** (`utm_campaign=hero / tool-result / report-2-limit / footer`). Generate the QR locally, not through a third-party API. | Measurable web-to-install attribution | **P1** |
| A5 | **`llms.txt` + explicit AI-crawler allow rules + one-line page summaries** | Cheap GEO win; they already do it | **P1** |
| A6 | **Guardrail language for sensitive topics** (no guarantees, cannot read another person, no medical, visa or financial predictions), written natively in Hindi | Trust, plus ad and store policy safety | **P1** |
| A7 | Dense related-content module + full footer link map | Crawl depth and topical authority | **P2** |
| A8 | "Illustration only — not a real prediction" labels on sample reports, plus a report-structure explainer page for our 4-part reading and paid packs | Honest preview that sells the paid report | **P2** |
| A9 | Honest comparison pages: "AI palm reading vs palmist", "Palm Read AI vs ChatGPT for palm reading" (no attacking named brands) | They target "X vs ChatGPT" searches | **P3** |

### ADAPT (good idea, done our way)
| # | Their version | Our version | Priority |
|---|---|---|---|
| D1 | Web palm scanner planned as **pay first** (USD test price), a 2-minute staged wait, **template SVG lines** | **1st report free** on the web with **real lines traced on the user's photo**; the 2nd report after email sign-up; then 0 credits → app. Progress steps map to real pipeline stages (photo check → hand found → lines traced → reading written), with no fake waiting. | **P1** (ship before they launch) |
| D2 | Astrology calculators (marriage age, luck, wealth) | **10+ palm-first free tools**: Marriage Line Reader (count and position), Heart Line Type finder (tap which image matches), Hand Shape / Element finder (Earth/Air/Fire/Water), **Finger ratio (2D:4D) and Jupiter/ring finger check**, Mount checker, "Which hand should I read?", Life Line myths checker ("does a short life line mean a short life?" answered honestly), Palm line glossary with Hindi names (हृदय रेखा, मस्तिष्क रेखा, जीवन रेखा, भाग्य रेखा), **Compare two hands**, Love compatibility by palm (two uploads), Mulank/Bhagyank numerology (high Hindi demand), Palm-reading quiz | **P1–P2** |
| D3 | FAQ hub with 145 Qs | Around 40–60 real questions in Hindi and English, grouped by line, shown visibly on pages; use FAQPage schema only as a bonus, not a strategy | **P2** |
| D4 | Question-page long-form with TOC and section count | Shorter, scannable, **meaning-first** answers (our premium report standard: life questions first, short sections, on the user's real photo) | **P1** |
| D5 | Mobile bottom nav with a centre Download button | Bottom bar: Home · **Scan palm (free)** · Tools · Learn · Get app. The primary action is our free web reading, not a blind install. | **P2** |
| D6 | Testimonials | Only **real, attributable** quotes (Play Store reviews linked, with consent), shown with the date and store link | **P2** (after real reviews exist) |

### AVOID
| # | What | Reason |
|---|---|---|
| X1 | Random "viewing now" counters and fake "User from Pune just downloaded" toasts | Fabricated; dark-pattern and ads/store-policy risk; destroys trust once noticed |
| X2 | Hard-coded ratings or download counts, and review schema built from our own testimonials | Google manual-action risk; misleading advertising |
| X3 | Superlatives such as "World's 1st", "Smartest", "Most accurate ever", "NASA data", "never misses a line", "trained on millions" | Unsubstantiated; ASCI and consumer-law risk; contradicts our honesty positioning |
| X4 | "Free" in titles for features that are paid | Misleading; high bounce and bad reviews |
| X5 | CSR-only SPA, soft 404s, 302 www redirect, JS-only canonical and OG | Hurts indexing and WhatsApp share previews, and WhatsApp is our key Indian channel. Use SSG/SSR with per-page static meta and real 404s. |
| X6 | 1.5 MB PNG heroes, a ~1 MB autoplay hero video, infinite decorative animations | Slow on budget Android on 4G; use AVIF/WebP under 150 KB and at most one purposeful animation |
| X7 | Unverifiable "As Seen On" logos | Use logos only if the coverage is real, and link to it |
| X8 | Face reading and physiognomy | Out of focus and ethically risky; stay palm-only |
| X9 | Per-minute monetisation of anxious questions with a no-refund policy | Contradicts our clear packs and subscription model and our honesty positioning |

### Where we can be clearly better
1. **Palm focus:** the entire site is about palms. Every page has real line diagrams, traced examples, and lessons for heart, head, life and fate lines. For them, palm is 1 of 7 features and web palm is a brochure.
2. **Hindi first:** full Devanagari pages at `/hi/…` with hreflang `hi-IN`/`en-IN`/`x-default`, targeting searches like "हाथ की रेखा", "शादी की रेखा हाथ में", "भाग्य रेखा", "हस्तरेखा ज्ञान", "palm reading in hindi". They have **zero** Hindi pages.
3. **A real web tool:** an actual upload, a traced overlay on the user's own photo, and a first reading free. They have no web palm tool today, and their prototype uses template lines.
4. **Honesty as a brand:** visible pricing for packs and subscription, "for self-reflection" framing, no fake counters, real reviews, dated content, and a named reviewer (e.g. "Reviewed by {palmist name}, {years} experience") on lessons and posts.
5. **A blog they don't have:** a Hindi and English blog on line meanings, marks (cross, star, island, triangle), myths, marriage line, children line, and a hand-shape series, each embedding the matching free tool. Start with 20–30 posts.
6. **Share cards and WhatsApp previews:** static per-page OG images plus our PDF/share card. Their deep links preview as the homepage on WhatsApp.
7. **Speed:** a static site that is light on budget Androids.

### Concrete page and tool list suggested for our site from this teardown (first wave)
- `/` (hero = free palm upload, with honest "1 free reading" copy) · `/hi/` mirror
- `/online-palm-reading` (the upload tool; 1st free, 2nd after email, then app)
- `/palm-reading/{love-marriage | career-money | personality | life-direction | children | foreign-travel | health-energy}` ×2 languages
- `/lines/{heart-line | head-line | life-line | fate-line | marriage-line | sun-line | children-lines}` (the learn-the-lines lessons, with our diagrams)
- `/questions/{shaadi-kab-hogi | love-ya-arranged-marriage | career-kaunsa-sahi | videsh-yog-hath-mein | kya-meri-life-line-chhoti-hai}` + English equivalents
- `/tools/{marriage-line-reader | hand-shape-finder | finger-ratio | heart-line-type | which-hand-to-read | compare-hands | palm-quiz | mulank-calculator | bhagyank-calculator | love-compatibility}`
- `/blog/…` (Hindi and English), `/pricing` (honest, visible), `/about` (real people), `/app` (store buttons + QR + UTMs), `/llms.txt`

---

### Evidence URLs
- https://pandit.ai/robots.txt · https://pandit.ai/sitemap.xml · https://pandit.ai/llms.txt
- https://pandit.ai/ · https://pandit.ai/palm-scanner · https://pandit.ai/palm-scanner/love-marriage · https://pandit.ai/calculators/marriage-age
- https://pandit.ai/questions/when-will-i-get-married · https://pandit.ai/reports/1-year-report · https://pandit.ai/kundli · https://pandit.ai/faq
- https://pandit.ai/pricing-policy · https://pandit.ai/refund-policy · https://pandit.ai/disclaimer
- JS bundles: `/assets/index-tWjsgWnJ.js` (router, schema builders, toast logic), `/assets/AsSeenOnSection-DsEDqtz1.js` (viewer counter), `/assets/PalmScanTest-D8fvxMvJ.js` (web palm-scan prototype), `/assets/CalculatorPage-zJmhc0tB.js`
- https://play.google.com/store/apps/details?id=com.app.pandit.ai (4.8★, 119 reviews, 10K+ downloads, updated 19 Aug 2026)
