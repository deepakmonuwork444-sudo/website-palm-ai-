# SEO_PLAYBOOK — PalmSays (palmsays.com)

**What this is:** the source of truth for how every PalmSays page is built for search: titles, headings, schema, canonicals, hreflang, sitemaps, robots, internal links, images, speed, trust signals, Search Console and the pre-publish checklist.

**Read with:** `KEYWORD_MAP.md` (which page owns which keyword) and `CONTENT_GUIDE.md` (how to write). **Precedence:** owner decisions in `WEBSITE_MASTER_PLAN.md` §15b > this file > `research/11-seo-placement.md`. Where this file changes the plan, it says so.

**Status:** v1, 2026-09-26. The site is not scaffolded yet. Tags like `[rec]` = recommendation needing owner OK; `[verify]` = a fact to check on the live product before it goes on a page.

**Base URL:** `https://palmsays.com` (apex [rec]; `www` 301 → apex). It lives only in `src/config/site.ts`, with the brand, Play link, prices and free-reading numbers. No page types a URL, price or count by hand.

---

## 1. Rules for every indexable page

| Element | Rule |
|---|---|
| `<title>` | ≤ 60 characters (Hindi ≤ ~55, because Devanagari is wider). Primary keyword first. "palm" or "palmistry" in it for ambiguous heads. **No brand suffix** (Google shows the site name from `WebSite` schema), except home, `/app/`, and the trust pages. No year, emoji, ALL CAPS, "100%" or "accurate". |
| "Free" | Allowed in a title or meta only when the thing is free exactly as described **and** the page's first screen shows the qualifier from `site.ts` ("First reading free. The full reading is in our Android app, paid."). The app is always "free to start", never "free app". |
| Meta description | ≤ 155 characters, unique, a promise plus an honesty cue. Hindi: Devanagari with one Hinglish phrase. |
| H1 | Exactly one, in the page's language, containing the primary keyword or a natural variant. It may differ from the title. |
| First paragraph | Answers the page's main question in ≤ 40 words. This is what featured snippets and AI answers lift. |
| H2s | Phrased as the questions people type (autocomplete / "People also ask" lists in R11 §1 and §2), each answered in its first sentence. Types and variations are H3s. |
| FAQ | 3–8 questions from autocomplete, in native `<details>`, visible in the HTML. A question is answered in full only on the page that owns it (KEYWORD_MAP); other pages give one line and a link. |
| Head tags | Server-rendered in the static `<head>`: title, meta description, canonical, hreflang, OG, Twitter, JSON-LD. Never injected by JavaScript (competitors' JS-only tags break WhatsApp previews, R04). |
| OG / Twitter | Each page has its own `og:title`, `og:description`, `og:url` and 1200 × 630 `og:image` in its own language. `twitter:card = summary_large_image`. |
| Robots meta | `max-image-preview:large` on every indexable page (Discover needs it). `noindex` on the pages in §2's last row. |
| Language | `<html lang="en">` or `lang="hi"`; `inLanguage` in schema matches. |
| Dates | Guides and blog show "Last reviewed {date}". `dateModified` changes only when the main content changes. |

---

## 2. Page types

| Type | URLs | Title pattern | H1 pattern | Required blocks (full order in CONTENT_GUIDE) | Schema | Words |
|---|---|---|---|---|---|---|
| Home = tool 1 | `/`, `/hi/` | §3 exactly | §3 exactly | Hero with upload card; traced sample; what's free; can/can't box; line cards; tools; app; FAQ (8) | `WebSite`, `Organization`, `WebApplication` | 900–1,400 under the tool |
| Hub | `/hand-lines/`, `/palm-reading/` | "<Topic>: <what's inside>" | Plain question or promise | Static chart or 7 steps; limits box; FAQ | `Article`, `BreadcrumbList`, `ImageObject` | 2,500–3,500 / 2,500–3,300 |
| Line pillar | `/heart-line/`, `/head-line/`, `/life-line/`, `/fate-line/` | "<Line> on Palm: Meaning, Types & …" | "<Line> meaning in palmistry" | Where is it · types (one H3 each) · marks · left vs right · limits box · tool card · FAQ · sources · Step n of 7 | `Article`, `BreadcrumbList`, `ImageObject` | 1,800–3,000 |
| Spoke guide | P2 and P3 guides | "<Topic> on Your Palm: …" | "<Topic> in palmistry: …" | Guide template | `Article`, `BreadcrumbList`, `ImageObject` | 1,000–2,500 (CONTENT_GUIDE §8) |
| Sensitive guide (YMYL) | `/marriage-line/`, `/children-line/`, `/simian-line/`, `/mercury-line/`, `/life-line/`, `/life-line/broken/`, blog 7 | Honesty cue in title or meta ("honestly", "what it doesn't mean") | Same as its type | The fear is answered in the first sentence; limits box high on the page; three-part block per meaning; owner OK before publish | Same as its type | Same |
| Sub-page | `/life-line/broken/` | As R11 | As R11 | Breadcrumb 4 levels; no hreflang until a Hindi twin exists | `Article`, `BreadcrumbList` | 1,200–1,800 |
| Tool page | `/tools/<slug>/` | "<Tool name>: <benefit or question>" | Benefit or question | Tool directly under the H1; how it works; what palmistry says (sourced); limits; FAQ; links to the guide and the reading; store button with price | `WebApplication`, `BreadcrumbList` | 400–900 below the tool |
| Tools hub | `/tools/` | §3 | §3 | All 12 tools with honesty labels | `CollectionPage`, `ItemList`, `BreadcrumbList` | 400–600 |
| App page | `/app/`, `/hi/app/` | Brand first | Brand + promise | Screens; what's free and paid (prices from config); privacy; limits; get it; FAQ | `MobileApplication`, `BreadcrumbList` | 600–1,000 |
| Blog post | `/blog/<slug>/` | Keyword first | The question | CONTENT_GUIDE §7 | `BlogPosting`, `BreadcrumbList` | 1,000–1,800 |
| Hindi page | `/hi/<english-slug>/` | Devanagari first + Hinglish | Devanagari + small Hinglish subtitle | Same as its twin | Same types, `inLanguage: "hi"`, Hindi headline | Same as its twin |
| Trust pages | `/about/`, `/about/<person>/`, `/editorial-policy/`, `/how-it-works/` | Plain, with brand | Plain | §14 | `AboutPage` / `Person` / `WebPage` | as needed |
| Legal | `/privacy/`, `/terms/` | Plain, with brand | Plain | — | `WebPage` | — |
| **noindex** | `/reading/`, `/account/`, `/delete-account/`, `/reset-password/`, `/404`, tool-result states | — | — | — | none | — |

---

## 3. P1 blueprints (English)

Character counts checked on 2026-09-26. Brand text reads from `site.ts`.

| URL | Title (chars) | Meta description (chars) | H1 | H2 outline |
|---|---|---|---|---|
| `/` | Free AI Palm Reading Online – See Your Lines on Your Photo (58) | Upload or snap a palm photo and see your heart, head, life and fate lines traced on your own hand. First reading free, no email. No fake predictions. (149) | Free AI palm reading — see your own lines traced on your photo | See a real sample reading · How the free palm reading scanner works (H3: 1 Take or upload a photo · 2 We find your lines · 3 Read what they mean) · What your free reading covers · What AI palm reading can and can't tell you · Learn the lines on your palm · Free palmistry tools · Get the PalmSays app · Questions people ask |
| `/hand-lines/` | Hand Reading Lines: Palm Line Names, Meanings & Chart (53) **(v2, India)** | A labelled palm reading chart of every line on your hand – heart, head, life, fate, sun, marriage and more – and what palmistry says each one means. (148) | Lines on your palm and what they mean | Palm reading chart: every line at a glance (static SVG chart + card to the interactive palm map, tool 11) · What are the lines on your palm called? (names table) · The three major lines (H3 each, 80–120 words → pillar) · The fate line · Minor lines (sun, marriage, children, money, Mercury, bracelets) · Signs on the lines · Left or right hand · Do palm lines change? (2 sentences → blog 3) · What is the rarest palm line? (2 sentences → blog 6) · What palm lines cannot tell you · FAQ |
| `/palm-reading/` | How to Read Palm Lines: A Step-by-Step Guide for Beginners (58) **(v2)** | Learn palm reading in 7 steps: pick the right hand, find your hand shape, read the heart, head, life and fate lines, then the mounts. Free palm chart. (150) — add "and PDF" only once the PDF is live | How to read palm lines: a beginner's step-by-step guide | What you need (→ photo checker) · Step 1: Choose which hand (→ tool 8) · Step 2: Find your hand shape (→ tool 9) · Steps 3–6: heart, head, life, fate · Step 7: Mounts and signs · For a woman or a man (short → `/which-hand-to-read/`) · Common beginner mistakes · Questions palmistry can't answer · Practise: the palm reading quiz (→ tool 12) · FAQ |
| `/heart-line/` | Heart Line on Palm: Meaning, Types & the Love Line (50) | What your heart line (love line) says in palmistry: long or short, curved or straight, forked, broken or chained – with a picture of each type. (143) | Heart line meaning in palmistry (the love line) | Where is the heart line? · Is the love line the same as the heart line? · Heart line types and meanings (12 H3s) · Marks on the heart line · Left vs right hand · When the heart and head lines join (≤ 120 words → simian) · What the heart line can't tell you · Which heart line do you have? (tool card → tool 4) · FAQ · Sources · Step 3 of 7 |
| `/head-line/` | Head Line Palmistry: Meaning, Forks, Breaks & Types (51) | What the head line says about how you think: long, short, straight, sloping, forked (the writer's fork) or broken – with a picture of each type. (144) | Head line meaning in palmistry | Where is the head line? (also called the mind or brain line) · Head line types (10 H3s, incl. forked = writer's fork) · Two head lines? (≤ 3 sentences → `/head-line/double/`) · Education line (vidya rekha), attributed (KEYWORD_MAP K3) · Marks on the head line · Head line vs heart line · What it can't tell you (not an IQ test) · Which head line do you have? (→ tool 5) · FAQ · Step 4 of 7 |
| `/life-line/` | Life Line in Hand: Meaning, Short, Broken & Double Lines (56) **(v2, India)** | The life line does not show how long you live. See what palmistry really reads in it – short, long, broken, double or forked – with a picture of each. (150) | Life line meaning: what it shows (and what it doesn't) | Where is your life line? · **Does a short life line mean a short life? (No)**, first · Life line types (H3s; "Broken" ≤ 3 sentences → `/life-line/broken/`) · Life line age calculation: why we don't do it · For women and men: the same rules · Left vs right hand · Life line vs fate line · Which life line do you have? (→ tool 6) · FAQ · care line · Step 5 of 7 |
| `/fate-line/` | Fate Line on Palm: Meaning, Career Line & No Fate Line (54) | The fate line (destiny or career line) in palmistry: where it starts, breaks and doubles – and what it means if you have no fate line. With pictures. (149) | Fate line meaning in palmistry | Where is the fate line? · Is it the career line or luck line? · **No fate line: it's common**, high up · Where it starts (H3s) · Breaks, forks and double fate lines · The fate line and your work (short → `/career-palmistry/`) · What it can't tell you · Do you have a fate line? (→ tool 7) · FAQ · Step 6 of 7 |
| `/is-palmistry-real/` | Is Palmistry True? What Science Says About Palm Reading (55) **(v2, K9)** | Palmistry is not a science and can't predict the future. What research says, why readings still feel accurate, and how to enjoy palm reading honestly. (150) | Is palmistry true? An honest answer from a palm-reading app | The short answer: is palmistry real or fake? · What science says (H3: no evidence it predicts anything · why readings feel accurate: Barnum/Forer effect, cold reading, confirmation bias) · Where palm lines come from · "Palm reading and astrology are examples of…" · Can palm reading predict death, marriage or children? (2 sentences each → blog 7, marriage, children) · Do palm lines change? (→ blog 3) · So why read palms at all? · How PalmSays handles this · FAQ · Sources |
| `/which-hand-to-read/` | Which Hand to Read in Palmistry? Female & Male Palm Reading (59) **(v2, K2)** | Palm reading for female and male: which hand to read, left or right, what the traditions say, and what stays the same for everyone. Plus a quick quiz. (150) | Which hand to read in palmistry — for women and men | The quick answer · Take the which-hand quiz (tool card → tool 8; **not embedded**) · Your writing hand vs your other hand · Palm reading for female: which hand, and what to look at (links to each line page) · Palm reading for male: which hand, and what to look at · What the traditions say (attributed; `[verify]` Dale 1895) · Left-handed? · Which hand for each line · Why your two hands look different · What palmistry can't tell you (no line reads a woman's or man's destiny, CONTENT_GUIDE §4.2) · FAQ · Step 1 of 7 |
| `/tools/` | Free Palm Reading Tools: Scanner, Quizzes & Line Finders (56) | 12 free palmistry tools: read your palm from a photo, check your photo, find which hand to read and learn the lines. Labels show which ones use AI. (147) | Free palm reading tools | Photo tools (1–3) · Line finders (4–7) · Quizzes and maps (8–12) · Which tools use AI? |
| `/app/` | PalmSays: Palm Reading App for Android (Free to Start) (54) | Scan your palm with your phone camera, see your lines traced and read what they mean. Free to start on Android. What's free, what's paid, and your privacy. (155) | PalmSays — the palm reading app that traces your real lines | What the app does (only features it has today) · Screenshots · What's free and what's paid (from config) · Your photos and privacy · What it can't do · Get it on Google Play · FAQ |
| `/marriage-line/` **(P1, was P2)** | Marriage Line Palmistry: What It Really Means on Your Palm (58) | What the marriage line means in palmistry: one, two or forked lines, for women and men, love or arranged, and why no line shows when or whom you marry. (151) | Marriage line in palmistry: what it really means | Where is the marriage line? · How many marriage lines (none, one, two) · Marriage line types (H3s: forked, broken, long or short, rising or falling) · Love marriage or arranged? No line can tell · The "divorce line" myth (named only to take it apart) · For women and men: the same line · Marriage line vs heart line (→ `/heart-line/`) · What the marriage line can't tell you (limits box + marriage topic line) · FAQ · Sources. No tool card (owner: no marriage tool) |
| `/head-line/double/` **(new, P1-late)** | Two Head Lines in Palmistry: The Double Head Line Explained (59) | Two head lines, or one line with a fork? How to spot a double head line on your palm, what palmistry books say about it, and what it cannot tell you. (149) | Two head lines on your palm: the double head line | What counts as a double head line (vs a forked head line, a sister line, a simian line) · How common is it? (a sourced figure only; else "uncommon") · What the books say (attributed; both readings if they differ) · On one hand or both · Can a photo show it? · What it can't tell you (not an IQ or success test) · Which head line do you have? (→ tool 5) · FAQ · Sources. Breadcrumb Head line → Double head line; links up to `/head-line/` |
| `/simian-line/` **(P1-late, was P2)** | Simian Line (One Line Across the Palm): Meaning & Facts (55) | A simian line is one straight crease across the palm. The medical facts come first, then what palmistry books say about it on one or both hands, calmly. (152) | Simian line: one line across your palm | **The medical facts first** (single palmar crease: usually a normal variation, not a diagnosis on its own, see a doctor for any worry; MedlinePlus / UF Health sources) · What a simian line looks like (vs heart and head lines that touch) · On one hand or both · What palmistry books say (attributed, both readings) · What it can't tell you (limits box + simian topic line) · FAQ · Sources. Medical terms only inside the first section, never in title, meta or CTAs; no reading CTA next to that section (KEYWORD_MAP K10) |

**India data changes (v2, 2026-09-26, KEYWORD_MAP §2.4–2.5):** titles lead with the India term where it is the bigger search ("hand reading lines", "life line in hand", "how to read palm lines"); the H1 or meta keeps the US "palm" form. `/is-palmistry-real/` targets "is palmistry true" (slug unchanged). `/which-hand-to-read/` now owns female and male palm reading (no gender pages). `/marriage-line/` moves up to P1; `/head-line/double/` (new) and `/simian-line/` are P1-late. `/`, `/heart-line/`, `/fate-line/`, `/tools/` and `/app/` blueprints already fit the India data and are unchanged.

**Change from the plan:** the which-hand meta no longer says "20-second" (no measured time) or "what Indian tradition says for women" (no source in the app's rule set yet; `[verify]` Dale 1895 before that claim goes on the page).

### 3.1 Hindi P1

| URL | Title (Devanagari first) | H1 (+ Hinglish subtitle) |
|---|---|---|
| `/hi/` | फ्री हस्तरेखा स्कैनर ऑनलाइन \| Palm Reading in Hindi **(v2: "palm reading in hindi" IN 880/31 has a volume; "hast rekha scanner" moves to the H1 subtitle or meta)** | मुफ़्त AI हस्तरेखा रीडिंग — अपनी फ़ोटो पर अपनी असली रेखाएं देखें · *Hath ki rekha online check — free* |
| `/hi/palm-reading/` | हाथ की रेखा कैसे देखें (चित्र सहित) \| Hath Ki Rekha | हाथ की रेखा कैसे देखें: आसान तरीका [rec] · *hath ki rekha kaise dekhe* |
| `/hi/hand-lines/` | हाथ की रेखाएं और उनका मतलब \| Palm Line Reading in Hindi **(v2: IN 880/28; "hast rekha gyan" moves to the H1 subtitle)** | हाथ की रेखाएं क्या बताती हैं [rec] |
| `/hi/heart-line/` | हृदय रेखा: मतलब, प्रकार और चित्र \| Hriday Rekha | हृदय रेखा: हस्तरेखा में इसका मतलब [rec] · *Heart line / hriday rekha* |
| `/hi/head-line/` | मस्तिष्क रेखा: प्रकार और मतलब (चित्र सहित) | मस्तिष्क रेखा: हस्तरेखा में इसका मतलब [rec] |
| `/hi/life-line/` | हाथ में जीवन रेखा: मतलब और चित्र \| Life Line in Hindi | हाथ में जीवन रेखा: यह क्या बताती है (और क्या नहीं) [rec] |
| `/hi/fate-line/` | भाग्य रेखा: कहां होती है, प्रकार और फोटो \| Bhagya Rekha | भाग्य रेखा: कहां होती है और क्या बताती है [rec] |
| `/hi/app/` | हस्तरेखा ऐप (Android): PalmSays \| Hast Rekha App [rec] | PalmSays — हस्तरेखा ऐप जो आपकी असली रेखाएं बनाता है [rec] |

- `/hi/` meta (plan §3.3): "हथेली की एक फ़ोटो डालें और उस पर अपनी हृदय, मस्तिष्क, जीवन और भाग्य रेखा देखें। पहली रीडिंग मुफ़्त, बिना साइन-अप। हिंदी और English में।"
- "फोटो" in a title is allowed only if the page shows a real traced photo; otherwise use "चित्र".
- Every Hindi page publishes only after the owner or the named Hindi reviewer reads it (CONTENT_GUIDE §10).

---

## 4. P2 and P3 guide blueprints

Outlines, metas, FAQs, image alt text and links: **R11 §2.2–2.3, adopted as written**, with these changes:
- Brand is **PalmSays**; `/palm-reading-pdf/` is **`/palmistry-pdf/`** (D16).
- Every embedded tool becomes a **tool card** linking to the tool's own page (owner decision). For example, the `/hand-types/` H2 "What hand type do I have?" becomes "How to tell your hand type" plus a card to tool 9.
- Career-line and job-line terms move to `/fate-line/` (KEYWORD_MAP C8), so the career page title changes.
- `/lucky-signs/` is P2 (plan §6.1), not P3.

| URL | Title | H1 |
|---|---|---|
| `/life-line/broken/` | Broken Life Line: What a Break or Gap Really Means | Broken life line meaning |
| `/career-palmistry/` | Career Palmistry: What Palmists Read for Work and Career **(changed)** | Career palmistry: what your palm is said to show about work |
| `/marriage-line/` | **Moved to P1 (v2): see §3** | — |
| `/palmistry-m/` | M on Your Palm: What the Letter M Means in Palmistry | The letter M on your palm: meaning in palmistry |
| `/money-line/` | Money Line on Palm: Wealth Lines & the Money Triangle | Money line on the palm: what palmistry says about wealth |
| `/hand-types/` | Hand Types in Palmistry: Earth, Air, Fire or Water? | Hand types in palmistry: which one is yours? |
| `/simian-line/` | **Moved to P1-late (v2): see §3** | — |
| `/sun-line/` | Sun Line Palmistry: Apollo Line Meaning & Types | Sun line (Apollo line) meaning in palmistry |
| `/palm-crosses/` | Cross on Your Palm: Mystic Cross & X Meanings | Cross on the palm: what an X means in palmistry |
| `/children-line/` | Children Lines on Palm: What Palmistry Says, Honestly | Children lines on the palm: what the tradition says |
| `/lucky-signs/` | Rare Lucky Signs on Your Palm: Fish, Star & Triangle | Lucky signs on the palm |
| `/palmistry-pdf/` | Free Palm Reading PDF: Printable Palmistry Guide (meta must say "free by email") | Free palm reading PDF |
| `/indian-palmistry/` (P3) | Indian Palmistry (Hast Rekha Shastra) Explained | Indian palmistry: Hast Rekha Shastra explained |
| `/chinese-palmistry/` (P3) | Chinese Palmistry: Five Element Hands & Palm Lines | Chinese palmistry: how palm reading works in the Chinese tradition |
| `/palm-mounts/` (P3) | Palm Mounts in Palmistry: Venus, Moon, Jupiter & More | Mounts of the palm |
| `/history-of-palmistry/` (P3) | History of Palmistry: From India and China to Today | A short history of palmistry |
| `/palmistry-fingers/` (P3) | Fingers in Palmistry: Length, Shape & What They Mean | Fingers in palmistry |
| `/mercury-line/` (P3) | Mercury Line in Palmistry (the So-Called Health Line) | Mercury line meaning |

---

## 5. Tool page blueprints (tools 2–12; tool 1 is home, §3)

Every tool page follows the tool template in `CONTENT_GUIDE.md` §6 and the `tool-page` skill. The honesty label sits under the H1.

| # | URL | Title (chars) | Meta (chars) | H1 | Label |
|---|---|---|---|---|---|
| 2 | `/tools/palm-line-finder/` | Palm Line Finder: See Your Palm Lines Traced on Your Photo (58) | Upload a palm photo and see your heart, head, life and fate lines traced and named. Lines only, no meanings. Uses AI; unclear lines are marked as unclear. (154) | Palm line finder: see your palm lines traced | Uses AI to trace your lines |
| 3 | `/tools/palm-photo-checker/` | Palm Photo Checker: Is Your Photo Good Enough to Read? (54) | Check your palm photo before a reading: light, sharpness and whole-palm framing, checked on your phone. Your photo never leaves your device. (140) | Palm photo checker | Runs on your phone — your photo never leaves this device |
| 4 | `/tools/heart-line-finder/` | Heart Line Finder: Which Heart Line Type Do You Have? (53) | Pick the heart line shape that matches your palm and see what classical palmistry books say about it, with the source. Traditional meanings, not AI. (148) | Heart line finder: which heart line do you have? | Traditional meanings — not AI |
| 5 | `/tools/head-line-finder/` | Head Line Finder: Which Head Line Type Do You Have? (51) | Pick the head line shape that matches your palm – straight, sloping, forked or joined to the life line – and see its traditional meaning and source. (148) | Head line finder: which head line do you have? | Traditional meanings — not AI |
| 6 | `/tools/life-line-finder/` | Life Line Finder: Which Life Line Type Do You Have? (51) | Pick the life line shape that matches your palm and see what palmistry traditionally reads in it, with the source. Length is never read as lifespan. (148) | Life line finder: which life line do you have? | Traditional meanings — not AI |
| 7 | `/tools/fate-line-finder/` | Fate Line Finder: Do You Have a Fate Line, and Which Type? (58) | No fate line, a faint one, a break or a double line? Pick what you see and get the traditional reading with its source. A missing fate line is common. (150) | Fate line finder: do you have a fate line? | Traditional meanings — not AI |
| 8 | `/tools/which-hand-quiz/` | Which Hand Should I Read? Palmistry Hand Quiz (45) | Answer 3 quick questions to find which hand to use for a palm reading – the hand you write with or the other one – and why the tradition says so. (145) | Which hand should you read? Take the quiz | Based on tradition — not AI |
| 9 | `/tools/hand-type-quiz/` | What Hand Type Do I Have? Palmistry Hand Shape Quiz (51) | Measure your palm and fingers to find your hand type in palmistry – earth, air, fire or water – and what the tradition links to each shape. (139) | What hand type do you have? | Your measurements, matched to hand types — not AI |
| 10 | `/tools/palm-signs-checker/` | Palm Signs Checker: M, Cross, Star, Fish & Triangle (51) | Tick the signs you can see on your palm – M, cross, star, triangle, fish, island – and read what palmistry books say about each one, with sources. (146) | Palm signs checker | You tick what you see — meanings from classical books, not AI |
| 11 | `/tools/palm-map/` | Interactive Palm Map: Tap a Line to See Its Meaning (51) | Tap any line or mount on this palm map to see its name, where it runs and what palmistry traditionally reads in it. No photo needed. (132) | Interactive palm map | A map of traditional meanings — not AI |
| 12 | `/tools/palm-reading-quiz/` | Palm Reading Quiz: Can You Spot the Lines? (42) | 10 quick questions on palm diagrams: can you tell the heart line from the head line? Get a score card to share. No photo and no sign-up needed. (143) | Palm reading quiz: can you spot the lines? | A quiz on diagrams — no photo needed |

Tool 2's "no free reading used" wording waits for decision D19. Tool 9's element types need a citable source first (CONTENT_GUIDE §9.4).

---

## 6. Structured data (JSON-LD)

Built from `site.ts` and `src/lib/schema.ts`; BaseLayout joins each page's nodes into **one `@graph`** (the BreadcrumbList stays Breadcrumbs.astro's own block). Stable IDs: `https://palmsays.com/#organization`, `/#website`, `/about/deepak-chauhan/#person`, `/app/#app`, `/tools/#collection`, `{url}#webpage`, `{url}#article`, `{url}#primaryimage`, `{url}#breadcrumb`, `{url}#app` (tools), and the terms `/palmistry-terms/#<id>`. **Entities** (`about` 1–2, `mentions` ≤ 8) come only from `src/lib/entities.ts` (`PAGE_ENTITIES`), whose Wikidata `sameAs` values were each verified live; never add a guessed item (WEB-DEC-049, SEMANTIC_SEO_PLAN.md §5).

| Page | Types | Must include | Must not include |
|---|---|---|---|
| Home (`/`, `/hi/`) | `WebSite`, `Organization`, `WebApplication` | `WebSite` name "PalmSays", url. `Organization` logo, `founder`, `publishingPrinciples` (/editorial-policy/), `knowsAbout` (Wikidata palmistry), `sameAs` = real social profiles only (none yet; the Play listing is the app's `sameAs`, not the company's). `WebPage` `about` palmistry. `WebApplication`: `applicationCategory: "LifestyleApplication"`, `operatingSystem: "Any"`, `offers` price `"0"` in INR and USD, `isAccessibleForFree: true` | Ratings of any kind |
| Guides | `Article`, `BreadcrumbList`, `ImageObject` | headline, image (≥ 1,200 px raster), `datePublished` / `dateModified` (ISO, +05:30), `author` → `Person` with `url`, `publisher` → Organization, `inLanguage`, `about`/`mentions` (entities.ts), `publishingPrinciples`, `citation` = every cited book (`Book`, author `sameAs` only when verified), `image` = the page's own share image. Dates: `site.launchDate` once set (D10). Diagrams (CC BY 4.0, `site.diagramLicence`, WEB-DEC-050): `contentUrl`, `creator`, `creditText: "PalmSays"`, `license`, `acquireLicensePage`, `copyrightNotice` | `author` as an Organization pretending to be a person |
| `/is-palmistry-real/` | `Article` + `citation[]`, `BreadcrumbList` | every cited study | — |
| Tool pages | `WebApplication`, `BreadcrumbList` | name, url, `applicationCategory: "LifestyleApplication"`, `operatingSystem: "Any"`, `offers` price `"0"`, `isAccessibleForFree: true` | Ratings |
| `/tools/` | `CollectionPage`, `ItemList` (12 items, tool 1 = `/`), `BreadcrumbList` | — | — |
| `/app/`, `/hi/app/` | `MobileApplication`, `BreadcrumbList` | `operatingSystem: "ANDROID"`, `applicationCategory` = the Play Console category [verify], `offers` price `"0"`, `installUrl` = the Play link with `referrer=utm_source%3Dweb%26utm_medium%3Dapp_page` | **No `aggregateRating`** (the Play rating was not collected on our site). Google's app rich result needs a rating, so this page shows as a normal result. That is fine. |
| Blog | `BlogPosting`, `BreadcrumbList` | as `Article` | — |
| Author page | `ProfilePage` with `mainEntity: Person` | name, `jobTitle`, `worksFor`, `image`, `sameAs` (only real profiles) | Credentials the person doesn't have |
| FAQ | **No `FAQPage` JSON-LD** (owner decision D9, WEB-DEC-049): Google retired the FAQ rich result on 7 May 2026. Keep the visible `<details>` FAQ | — | `FAQPage` anywhere (check-web fails the build) |
| Hindi pages | Same types as the twin | `inLanguage: "hi"`, Hindi headline and description | English JSON-LD on a Hindi page (palmly's bug, R05) |

**Never, anywhere:** `FAQPage` (retired, D9); `AggregateRating` or `Review` (until we collect reviews on our own site under Google's rules); the Play rating copied into schema; `HowTo` (retired 2023); `Product`/`Offer` for app packs or plans (no web payments). `check-site` fails the build if any of these appear.

**Validate** each template once in Google's Rich Results Test and validator.schema.org before launch, and again after any `SeoHead` change.

Minimal tool example:

```json
{"@context":"https://schema.org","@type":"WebApplication","name":"Palm photo checker","url":"https://palmsays.com/tools/palm-photo-checker/","applicationCategory":"LifestyleApplication","operatingSystem":"Any","isAccessibleForFree":true,"offers":{"@type":"Offer","price":"0","priceCurrency":"INR"},"publisher":{"@id":"https://palmsays.com/#organization"},"inLanguage":"en"}
```

---

## 7. Canonical and hreflang

- Every indexable page has a **self-referencing absolute canonical** with the trailing slash: `https://palmsays.com/heart-line/`.
- hreflang only between **true translations**: `en` ↔ `hi`, plus `x-default` → the English URL. Plain `en` and `hi` (not `en-US`, `hi-IN`). No `hi-Latn` pages: Hinglish lives inside the Hindi page.
- **Both sides list each other and themselves.** A one-sided pair fails the build.
- Add the pair only when the Hindi page is **live** (reviewed). Until then the English page has no hreflang.
- Hindi-only pages (for example `/hi/hast-rekha/` if not equivalent to `/indian-palmistry/`) get `hreflang="hi"` to themselves only, with no `x-default`.
- `/life-line/broken/` has no hreflang until a real Hindi version exists.
- Never set a Hindi page's canonical to its English twin.
- URL parameters (`utm_*`, `?shape=…`, `?ref=`) never change the canonical: it is always the clean URL.
- Blog pagination (`/blog/page/2/`) is self-canonical, not pointed at page 1.
- hreflang goes in `<head>`. If it is also put in `sitemap-hi.xml`, the two must match exactly.

```html
<!-- on https://palmsays.com/heart-line/ and on https://palmsays.com/hi/heart-line/ (same three lines on both) -->
<link rel="alternate" hreflang="en" href="https://palmsays.com/heart-line/">
<link rel="alternate" hreflang="hi" href="https://palmsays.com/hi/heart-line/">
<link rel="alternate" hreflang="x-default" href="https://palmsays.com/heart-line/">
```

---

## 8. URLs, redirects and frozen paths

- **Format:** lowercase, hyphens, ASCII, 1–3 words, no dates, no `.html`, trailing slash always (Astro `trailingSlash: 'always'`, `build.format: 'directory'`; Workers `html_handling: "auto-trailing-slash"`).
- **One host**, HTTPS only with HSTS. 301s: `www` → apex, `http` → `https`, no-slash → slash, `/index.html` → directory, the old legal `.html` URLs → `/privacy/`, `/terms/`, `/delete-account/`, `/reset-password/` (D18; fall back to serving `.html` if Play Console objects).
- **Hindi pages reuse the English slug** under `/hi/`. Hindi-only pages get ASCII Hinglish slugs (`/hi/hast-rekha/`).
- **Frozen App Link paths (never renamed, never redirected to another path; only the usual no-slash → slash 301 applies):** `/palm-reading`, `/hand-lines`, `/heart-line`, `/head-line`, `/life-line`, `/fate-line`, and the same six under `/hi/`, each with and without the trailing slash. The Android app and `assetlinks.json` depend on these exact paths.
- **Any other slug change** needs, in the same commit: a single-hop 301 (no chains), updated internal links, sitemap, canonical, the hreflang partner, `llms.txt`, and a KEYWORD_MAP row. The redirect stays forever. Never reuse an old slug for a different topic.
- `/life-line/broken/` is not an App Link path. The app router opens its Home for `/<line>/*` until the app maps sub-paths (R11 open item 5). Don't add sub-paths to App Links.

---

## 9. Sitemaps

`/sitemap-index.xml` points to five group sitemaps. Submit each one separately in Search Console and Bing so indexing can be filtered per group.

| Sitemap | Contains |
|---|---|
| `sitemap-core.xml` | `/`, `/palm-reading/`, `/hand-lines/`, the 4 pillars, `/is-palmistry-real/`, `/which-hand-to-read/`, `/app/`, trust pages, `/privacy/`, `/terms/` |
| `sitemap-guides.xml` | P2 and P3 guides, `/life-line/broken/`, `/palmistry-pdf/` (the landing page, not the PDF) |
| `sitemap-tools.xml` | `/tools/` and the 11 `/tools/<slug>/` pages (tool 1 is home, in core) |
| `sitemap-blog.xml` | `/blog/` and posts (pagination pages excluded) |
| `sitemap-hi.xml` | every live `/hi/` page |

- Only URLs that return 200, are self-canonical and indexable. `check-site` fails if the sitemap and the set of indexable pages differ.
- `lastmod` = the content's `updated` field. No `changefreq` or `priority` (Google ignores them).
- **Image entries (built 2026-09-28, WEB-DEC-053):** each page's `<url>` in its own group sitemap carries one `<image:image><image:loc>` per diagram FILE it shows (the 1800 px WebP its `<img src>` uses), from `src/lib/diagrams.ts` (`pages`). No separate image sitemap file. Only our own diagrams (CC BY 4.0), never photos. `check-web` fails if a listed image isn't built or the page doesn't show it; a guide that starts showing a diagram adds its path to that diagram's `pages` in the same change.

---

## 10. robots.txt, AI crawlers and llms.txt

```
User-agent: *
Allow: /
Sitemap: https://palmsays.com/sitemap-index.xml
```

- `/reading/` and `/account/` are **not** disallowed: they carry `noindex`, and Google must crawl them to see it (the plan overrides R11 here). There is no `/api/` on this host (the API is `api.palmsays.com`).
- **AI crawlers are allowed by default** (the owner has not asked to block any). That covers search and answer bots (OAI-SearchBot, PerplexityBot, Claude-SearchBot; Googlebot for AI Overviews) and training bots (GPTBot, ClaudeBot, CCBot, Google-Extended). Revisit at day 90 (D6).
- **[verify] on the Cloudflare zone:** Cloudflare's AI-crawler blocking and managed robots.txt settings can add `Disallow` rules for AI bots without touching our file. Confirm they are off and that the live `/robots.txt` matches the block above.
- If the owner later blocks a bot: give it its own `User-agent` group and repeat every rule inside each named group (palmmitra's file fails at this, R02 §7). Blocking Google-Extended does not affect Google Search.

**`/llms.txt`** (built from `site.ts`, the page registry, each guide's answer-first sentence and the 40 terms of `src/lib/entities.ts`, so it cannot drift; WEB-DEC-049). Skeleton:

```
# PalmSays
> Free AI palm reading website and Android app. The AI traces the heart, head, life and fate lines on the user's own palm photo; meanings come from a fixed rule set built from classical palmistry books, each meaning with its source. Hindi and English.

## Honesty rules
- Palmistry is a tradition for reflection, not a science. PalmSays never predicts dates, lifespan, health, marriage timing, number of children or money.
- Free: {free rule from site.ts}. The full reading is in the Android app (paid; prices on /app/).

## Key pages
- [Free palm reading](https://palmsays.com/)
- [Lines on your palm](https://palmsays.com/hand-lines/)
- [Heart line](https://palmsays.com/heart-line/) · [Head line](https://palmsays.com/head-line/) · [Life line](https://palmsays.com/life-line/) · [Fate line](https://palmsays.com/fate-line/)
- [Is palmistry real?](https://palmsays.com/is-palmistry-real/)
- [Free tools](https://palmsays.com/tools/) · [App](https://palmsays.com/app/) · [हिंदी](https://palmsays.com/hi/)
```

No search engine has said it uses `llms.txt`; it is cheap, so we ship it without expecting a ranking effect.

**PDF (D17):** the landing page is indexable; the PDF file itself is served with `X-Robots-Tag: noindex`.

---

## 11. Internal-link graph

```
                          /  (tool 1: free AI palm reading, the page that converts)
                          ▲ every page links here (inline CTA + end block)
          ┌───────────────┴────────────────┐
   HUB /hand-lines/                    HUB /palm-reading/
   every line and sign spoke           7 steps: which hand, hand types, 4 pillars, mounts; PDF; quiz
          ▼
   PILLARS /heart-line/ /head-line/ /life-line/ (+ /broken/) /fate-line/   ◄ "Step n of 7" chain
          │ each → 2–4 siblings + ITS TOOL PAGE + home + /is-palmistry-real/
          ▼
   SPOKES   marriage · children · sun · money · career · mercury · M · crosses · lucky signs · simian · mounts · fingers
   CONTEXT  is-palmistry-real · history · indian (↔ /hi/hast-rekha/) · chinese · which-hand
   TOOLS    /tools/ → 11 tool pages → their guide + home + /app/  (guides link to tools; never embed them)
   BLOG     each post → 1 pillar + home; each pillar → ≤ 3 posts
   /app/    from home, every end block and the footer
   /hi/*    Hindi pages link to Hindi pages; the language switch links the twin
```

**Tool ↔ guide pairs** (one tool card on the guide, placed at its "find yours" H2; the tool links back with "Read the full … guide"):

| Tool | Guide(s) that link to it | Tool links to |
|---|---|---|
| 2 Palm line finder | `/hand-lines/` | `/hand-lines/`, home |
| 3 Palm photo checker | home upload card, `/palm-reading/` ("What you need"), every guide's photo tips | home (hands the photo to `/reading/`) |
| 4–7 Line finders | the matching pillar (+ `/life-line/broken/` for 6, `/career-palmistry/` for 7) | the pillar, home |
| 8 Which-hand quiz | `/which-hand-to-read/`, `/palm-reading/` step 1 | `/which-hand-to-read/`, home |
| 9 Hand-type quiz | `/hand-types/`, `/palm-reading/` step 2 | `/hand-types/`, `/palmistry-fingers/` (P3) |
| 10 Palm signs checker | `/lucky-signs/`, `/palmistry-m/`, `/palm-crosses/` | those three guides |
| 11 Interactive palm map | `/hand-lines/`, `/palm-mounts/` (P3) | `/hand-lines/`, each pillar |
| 12 Palm reading quiz | `/palm-reading/` | `/palm-reading/`, `/hand-lines/` |

**Rules**
- Every indexable page is ≤ 3 clicks from home and has ≥ 2 internal links pointing to it (checked at build; no orphans).
- Anchor text = the target's topic in natural, varied words ("what a broken life line means"). Never "click here". One link per target per section.
- Every "What palmistry can't tell you" box links to `/is-palmistry-real/`.
- Related-link groups (3–4 links): heart · head · simian · marriage | life · fate · broken · mercury | fate · career · sun · money | M · crosses · lucky signs · mounts.
- Breadcrumbs are logical, not taken from the URL (URLs stay flat for App Links): Home › Palm lines › Heart line; Home › Tools › Palm photo checker; होम › हाथ की रेखाएं › हृदय रेखा.
- Footer "Tools" group: the hub + the photo checker, line finder, palm map and quiz. A link appears only once its page is live.

---

## 12. Image SEO

- **Diagrams are original SVG files** used through `<img src="/img/diagrams/forked-heart-line.svg" alt="…" width height>`, because Google Images doesn't index inline SVG. Our colours, readable labels, a small "palmsays.com" in a corner, a caption under each.
- **Hindi diagrams** are separate files with Devanagari labels, so the Hindi alt text and the picture agree.
- **Photos** (real, consented traced palms only; never user uploads): AVIF + WebP in `<picture>`, `srcset` 480 / 768 / 1,200 / 1,600 w, explicit width and height. The LCP image is never lazy and gets `fetchpriority="high"`. Hero ≤ 80 KB; other images ≤ 60 KB.
- **File names** describe the picture (`short-life-line.svg`). **Alt text** describes what is shown, in the page's language, not a keyword list. Decorative icons get `alt=""`.
- **Discover and OG:** every guide has one raster ≥ 1,200 px wide used as `og:image` and `Article.image`. OG images are 1,200 × 630, one per page and language, built at build time; they must pass the Hindi conjunct test (हस्तरेखा, ज्ञान) on day 1.
- **Licensing:** diagrams carry `ImageObject` licence fields for the "Licensable" badge and attribution links. **Decided 2026-09-28: CC BY 4.0, credit "PalmSays (palmsays.com)"** (WEB-DEC-050, `site.diagramLicence`, explained at /editorial-policy/#diagram-licence). Photos are not covered.
- **Set to draw (≈ 40 SVGs, days 0–30):** the master palm chart; heart (12 types), head (10), life (10), fate (≈ 8) variation sets; signs sheet; 4 hand shapes; mounts chart; marriage-line location. Search terms they serve: "palm reading chart", "palmistry images", "हस्त रेखा चित्र सहित", "भाग्य रेखा फोटो", "विवाह रेखा की फोटो".
- **Discover candidates:** M on palm, lucky signs, simian line, hand-type result. Honest titles only.

---

## 13. Core Web Vitals and weight budgets (p75, mobile)

| Page type | HTML gz | CSS gz | Our JS gz | LCP / INP / CLS |
|---|---|---|---|---|
| Guides, blog, legal | ≤ 35 KB | ≤ 25 KB | **0 KB** (guides no longer embed tools) | ≤ 2.0 s / ≤ 150 ms / ≤ 0.05 |
| Home | ≤ 30 KB | ≤ 25 KB | ≤ 60 KB on load (upload starter is a plain Astro script) | ≤ 2.3 s / ≤ 150 ms / ≤ 0.05 |
| Tool pages | ≤ 25 KB | ≤ 25 KB | ≤ 70 KB (one island, loaded when visible; Preact or plain TS if over) | ≤ 2.0 s / ≤ 150 ms / ≤ 0.05 |
| `/reading/` | small shell | ≤ 25 KB | ≤ 180 KB at first; the rule engine loads after upload starts | INP ≤ 150 ms |

TTFB ≤ 200 ms. Fonts ≤ 120 KB English, ≤ 180 KB Hindi; Devanagari fonts load only on `/hi/`. No tag managers, ad scripts or `backdrop-filter` on mobile. Test: Lighthouse CI on every build (Moto G Power profile, Slow 4G) + one real Android Go-class phone; field data from Cloudflare Web Analytics and Search Console. Source: plan §5.14.

---

## 14. E-E-A-T (trust)

All of this is live **before** the P2 guides publish.

| Page / element | What it must say |
|---|---|
| `/about/` | Who makes PalmSays and why, company details, contact, the grievance contact for data questions (DPDP). |
| `/about/deepak-chauhan/` (author) | A real page for the author. Known so far (owner): **Deepak Chauhan, founder and entrepreneur, has built 6+ websites and apps.** The full bio and photo are pending from the owner, so **this page and author bylines wait for them**. It must not claim palmistry credentials he doesn't have. It can say truthfully what he does: builds PalmSays, writes the guides from the classical books listed on `/editorial-policy/`. `Person` schema with real `sameAs` only. |
| Hindi reviewer | **Still needed.** Gets a page `/about/<name>/` once named. Until a named reviewer exists, only the owner can clear a Hindi page, and the byline says nothing about a reviewer. Never invent a reviewer. |
| `/editorial-policy/` | Where meanings come from (the books in CONTENT_GUIDE §9, by name, year and chapter); how rights are handled (public-domain books may be quoted briefly; the others are paraphrased); what we never predict (the 7 blocked-claim types, CONTENT_GUIDE §4); how AI is used (it traces lines on the photo; the text comes from a fixed rule set); that drafts are prepared with AI assistance and checked by a person against the sources [rec]; how corrections work (an email); update cadence (§18); the Hindi review rule. **Don't say the rule set is "reviewed by a person"** until the app's review log has entries (today every corpus rule is `draft`). |
| `/how-it-works/` | What happens to the photo, where it is processed (Modal in the USA and Cloudflare Workers AI) and what is stored (traced line points, landmarks, the observation, the report). Word for word the same as plan §8.4–8.5. |
| Every guide | Byline "Written by Deepak Chauhan" (once the author page is live; before that "Written by the PalmSays team"), "Reviewed by {name}" **only** when a real reviewer read it, "Last reviewed {date}", a sources box, `author.url` in `Article`. |

Honesty is our E-E-A-T angle: the palm-reading site that says what palmistry can't do, with a source for every meaning.

---

## 15. Scaled-content guardrails

- **No templated page sets:** nothing per zodiac sign × line, city, gender, age or name.
- **New-URL test:** a variation gets its own URL only with clear separate demand (≈ 200+ searches a month in the **US or India** export, or strong autocomplete) **and** 1,000+ useful unique words with its own images. `/life-line/broken/` (US) and `/head-line/double/` (India, KEYWORD_MAP K1) pass; everything else is an H3. Gender is never a new URL (K2).
- **12 tool pages are allowed** because each does a distinct task, has its own keyword (KEYWORD_MAP §3) and ≥ 400 unique words. Tools 4–7 share a template, so each must carry line-specific content: how to spot that line, its own types, its own limits, its own FAQ. Keep shared boilerplate to ≤ 30% of the words under the tool [rec].
- **Tool results never create indexable URLs.**
- **No bulk machine translation.** Hindi is written as Hindi and read by a person.
- **Pace:** ≤ 8 new indexable URLs a week in total (guides + tools + posts) [rec; the plan says 5–8 guides].
- Fewer, stronger pages beat many thin ones. When Search Console shows "Crawled – currently not indexed", merge, don't add.

---

## 16. Search Console and Bing

- **Domain property** for `palmsays.com`. Bing Webmaster Tools (import from Search Console). IndexNow through Cloudflare Crawler Hints. BigQuery bulk export on day 1.
- Submit the 5 sitemaps separately.
- **Page groups** (Performance → Page → Custom regex, bookmarked; Search Console uses RE2):

| Group | Regex |
|---|---|
| Home | `^https://palmsays\.com/$` |
| Hindi | `/hi/` |
| Pillars | `/(heart\|head\|life\|fate)-line/` |
| Hubs | `/(hand-lines\|palm-reading)/$` |
| Honest topics (YMYL) | `/(marriage-line\|children-line\|simian-line\|mercury-line\|is-palmistry-real)/` |
| All tools | `/tools/` |
| Photo tools | `/tools/(palm-line-finder\|palm-photo-checker)/` |
| Rule tools | `/tools/((heart\|head\|life\|fate)-line-finder\|which-hand-quiz\|hand-type-quiz\|palm-signs-checker\|palm-map\|palm-reading-quiz)/` |
| Blog | `/blog/` |
| App page | `/app/$` |

- **Brand filter** (exclude to see non-brand growth): `palm ?says|palmsays|palm read ai|palmreadai`. Add the Play listing name if it differs.
- **App Links effect:** on Android phones with the app installed, taps on the 12 App Link paths open the app. Search Console counts the click; web analytics sees no visit. Expect more clicks than sessions on those pages; measure the app side with Play Console `utm_source=web`.
- **Before launch:** a 10-minute manual check of the 12 R11 keywords in an incognito US Google session: images pack, video pack, first 4 "People also ask" questions, AI Overview yes/no. Repeat it in an India session (`gl=in`) for the top 10 India targets (KEYWORD_MAP §2.4), and check two intents: bare "heart line" and "two head line palmistry".

---

## 17. 30 / 60 / 90-day roadmap

"Days" = days after launch. Publishing is paced (§15); Hindi pages go live only after review.

**Days 0–30: launch P1**
- Pages: home, 2 hubs, 4 pillars, `/marriage-line/`, `/is-palmistry-real/`, `/which-hand-to-read/`, `/tools/`, `/app/`, legal. **P1 tools as standalone pages:** 1 (home), 3 photo checker, 8 which-hand quiz, 11 palm map. Then the trust pages (author page once the bio arrives), then **P1-late:** `/head-line/double/` and `/simian-line/` (after its sourced medical section and owner OK). India-first order (KEYWORD_MAP §2.0, v2).
- Technical: split sitemaps, robots, canonical and hreflang, breadcrumbs, schema validated, CWV budgets met in Lighthouse CI, 404 page and redirects.
- The ≈ 40 original diagrams.
- Hindi: `/hi/` and the 2 hubs, then the pillars as they are reviewed.
- Search Console, Bing, BigQuery; request indexing for the P1 set once; the manual US SERP check.
- Links: the Play listing links to the site; our own social profiles; licensed diagrams shared in a few palmistry communities. No link buying.

**Days 31–60: low-KD wins, the other tools, Hindi pillars**
- P2 guides in India-first order (KEYWORD_MAP §2.0): palm crosses, rare palm lines (blog 6), career palmistry (KD 5), hand types, sun line, M on palm, money line, `/life-line/broken/`, children lines, lucky signs; the PDF when its server items are ready.
- **P2 tools** (each ships with or after its guide): 2 palm line finder (after D19), 4–7 line finders, 9 hand-type quiz (with `/hand-types/`), 10 palm signs checker (with `/lucky-signs/`), 12 palm reading quiz.
- Blog posts 1–4 and 6 (post 4 decided per KEYWORD_MAP C18; post 5 dropped, K2).
- Hindi: remaining pillars, marriage, which-hand, M, money, lucky signs, children, `/hi/tools/` and tools.
- First CTR pass: rewrite titles and metas on pages at positions 1–10 with CTR < 2%.
- Devanagari keyword export → re-map Hindi and tool targets (the English-script India export is done: KEYWORD_MAP §2.4).

**Days 61–90: depth and assets**
- P3: fingers first (India ~1.4K), then mounts, history, Mercury line, Indian palmistry with `/hi/hast-rekha/`, Chinese palmistry.
- The PDF (Hindi first, then English). Blog post 7.
- Refresh P1 pages from queries at positions 8–20. First 60–90 s videos on the 4 pillars (`VideoObject`).
- Review "Crawled – currently not indexed"; merge rather than add.
- KPIs, reported separately: indexed ÷ submitted, non-brand impressions and clicks by group, CTR by group, organic reading starts, tool uses, store clicks by page, Hindi share of impressions.

---

## 18. Refresh cadence

- P1 pages every 3 months: add an H2 or FAQ for any query at positions 8–20 the page doesn't answer.
- P2 and P3 pages every 6 months. Tools: monthly function check. `/app/`: every app release.
- Hindi twins re-checked within 2 weeks of any English change.
- Yearly blog prune: posts with no impressions after 12 months are merged into their pillar with a 301.
- Change `dateModified` only when the content really changes.

---

## 19. Pre-publish SEO checklist

Run for every new or changed page. `check-site` covers the items marked (auto).

**Targeting**
- [ ] The primary keyword is this page's in `KEYWORD_MAP.md`; no other page targets it in title, H1 or first sentence.
- [ ] Tool page: its keyword is tool wording, not the guide's (C13); the guide links to it with a tool card and doesn't embed it.

**On-page**
- [ ] Title ≤ 60 (Hindi ≤ ~55), keyword first, "palm/palmistry" where needed, no brand suffix unless allowed (auto).
- [ ] Meta ≤ 155, unique, honest (auto).
- [ ] Exactly one H1 (auto). First paragraph answers in ≤ 40 words.
- [ ] H2s are real questions; FAQ 3–8, visible, not duplicated from the owning page.
- [ ] "Free" is qualified on the first screen, from `site.ts`.

**Technical**
- [ ] Self canonical, absolute, trailing slash (auto).
- [ ] hreflang: pair only if the twin is live; both sides; `x-default` → English (auto).
- [ ] URL follows §8; if it changed: 301 + links + sitemap + hreflang + `llms.txt` updated in the same commit. App Link paths untouched.
- [ ] In the right sitemap if indexable; out of all sitemaps if `noindex` (auto).
- [ ] JSON-LD valid for the page type; no `AggregateRating`, `Review`, `HowTo`, `Product` (auto); Rich Results Test clean.
- [ ] OG title, description, URL and image are this page's own, in its language.

**Links and images**
- [ ] ≥ 2 internal links in; ≤ 3 clicks from home; no broken links (auto).
- [ ] Links out: home CTA, `/is-palmistry-real/` from the limits box, 2–4 siblings, the matching tool or guide, `/app/` in the end block.
- [ ] Diagrams are SVG files with alt text in the page's language, captions, width and height; LCP image not lazy.

**Trust**
- [ ] Byline, "Last reviewed" date, sources box; "Reviewed by" only if a real person reviewed it.
- [ ] YMYL pages: limits box present (auto), owner OK recorded.
- [ ] Hindi page: read by the owner or the named reviewer before it goes live.

**Speed**
- [ ] Lighthouse CI within §13 budgets.

---

## 20. Open items

1. Apex vs `www` (rec: apex) and the Cloudflare AI-crawler settings check (§10).
2. Author bio and photo for `/about/deepak-chauhan/`; a named Hindi reviewer (and an English reviewer, if any).
3. ~~Diagram licence~~ Decided: CC BY 4.0 (WEB-DEC-050).
4. D19 (does the line finder use a free reading) before tool 2's copy is final.
5. A citable source for the element hand types before tool 9 and `/hand-types/` publish (CONTENT_GUIDE §9.4).
6. `WEBSITE_MASTER_PLAN.md` §6.1, §9, §10.1–10.3 and §10.10 need the 12-tool layout and the changes flagged in this file and in KEYWORD_MAP §10.
7. The plan's §10.6 editorial-policy wording ("a fixed rule set reviewed by a person") is not true yet: the app's `knowledge/review-log.json` is empty.
