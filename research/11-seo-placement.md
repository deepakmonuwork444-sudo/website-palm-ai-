# 11 — SEO placement plan (per page + site-wide + Hindi)

Date: 2026-09-26. Input: `WEBSITE_MASTER_PLAN.md` (keyword strategy table, URL map, owner decisions), competitor files 01–05, the app's link router (`palm-ai-new--feat-m1-foundation/src/features/links/routes.ts`).

## 0. How this was researched (read first — limits)

| Evidence | Tool | What it is good for | What it is NOT |
|---|---|---|---|
| "Who ranks" lists | WebSearch (US search API) on 2026-09-26 | Which sites and page formats show up for each keyword | **Not a live Google SERP.** Order is not Google's order; SERP features (images pack, videos, PAA box, AI Overview) are not visible in it |
| Page depth | Our own fetch of 31 ranking pages (words in `<main>/<article>`, H2/H3/img counts, JSON-LD types) | Rough length and structure of what ranks | Word counts are ±20 % (some sidebars counted); 3 pages failed (404/202) |
| "People Also Ask" questions | **Google autocomplete** question forms (`suggestqueries.google.com`, `hl=en&gl=us`) | The real questions people type — the best free proxy for PAA | The actual PAA box could not be captured (Google blocks scripted SERPs; Bing's page had no PAA block) |
| Hindi evidence | Google autocomplete `hl=hi&gl=in` for 35 Hindi/Hinglish seeds + WebSearch for 2 Hindi queries | Script choice, modifiers, which topics Indians type | No Hindi volumes (owner's India export still missing) |
| AI Overviews | not observed | — | Treat as "likely present on informational queries"; check by hand in a US incognito session before launch |

Raw autocomplete files: scratchpad `suggest.json`, `suggest2.json` (copied into the tables below where used).

**Manual check before launch (10 minutes, owner or anyone in the US/VPN):** open the 12 keywords in incognito Google US and note: images pack yes/no, video pack yes/no, PAA questions (first 4), AI Overview yes/no. Paste into section 1 tables. Everything below still holds if they differ; only FAQ wording would change.

---

## 1. SERP analysis — 12 most important keywords

Legend — Format: G = written guide, T = online tool, A = app-store page, L = listicle, V = video, I = image/Pinterest/stock, P = PDF/Scribd, Q = Q&A forum, M = medical page. Depth = measured words (our fetch).

### 1.1 `palm reading` (US 301K, KD 52 — head term)
- **Seen:** Google Play app ("Palm Reading & Fortune Teller"), laurenconrad.com (2016 guide, ~2,000 w), almanac.com beginner's guide (~3,270 w, 12 H2 / 34 H3, 19 images), wiccaacademy.com intro, palm-reading.app (tool, ~1,180 w), asknebula.com palm scanner (tool, ~1,120 w), Adobe Stock image, App Store app, eBay book.
- **Format mix:** G 3 · T 2 · A 2 · I 1 · shop 1 → **mixed intent** (learn + do it now + get an app).
- **Autocomplete (PAA proxy):** palm reading lines · guide · near me · lines meaning · marriage line · chart · for female · life line · children line.
- **Angle to beat:** nobody has a free reading AND a proper guide AND an app on one site. Home carries "do it" (tool), `/palm-reading/` carries "learn it", `/app/` carries "app". Do not plan on ranking top 3 in year one; win the long tail around it.

### 1.2 `free palm reading` (+ "free palm reading online / scanner / app")
- **Seen:** Play app, a ChatGPT GPT ("Free Palm Reading with AI"), wishastro.com/tools/palm-reading (tool + **~5,600 w** below it, WebApplication + FAQPage schema), App Store app, palmist.io, palmreading.pro ("No Signup Preview" in the title), palm-reading.app ("100 % private, no sign-up"), creen.ai (tool, ~2,600 w).
- **Format mix:** T 5 · A 2 · AI chat 1 → **tool intent.** Titles promise "no sign-up", "upload photo", "instant".
- **Autocomplete:** free palm reading app · online · scanner · scanner online · app no subscription · ai · scanner online for female · reddit · free no email · free chatgpt · free in hindi.
- **Angle to beat:** working upload/camera above the fold, first reading with **no email** (say it in the title/meta — searchers type "no email", "no sign up"), the user's own lines traced (no competitor does this), honest "what it can't do" box, 1,000–1,500 words of real explanation under the tool (wishastro shows long content under a tool ranks). Address "vs ChatGPT": a chat bot can't show where your lines are.

### 1.3 `palm reading lines`
- **Seen:** almanac.com, cassieuhl.com (~1,140 w, 8 images), rylandpeters.com (~1,100 w, book excerpt), **YouTube video** "How to read your palm lines", **Pinterest board**, a PDF worksheet, wiccaacademy, a spam page on a uw.edu subdomain, Adobe Stock.
- **Format mix:** G 4 · V 1 · I 2 · P 1 → **strong visual intent** (charts, pictures, video).
- **Autocomplete:** palm reading lines meaning · guide · children · marriage · which hand · right hand · left hand · chart · life line.
- **Angle:** a clean, original, labelled palm chart (SVG) that people want to pin/share, plus a 60–90 s video later. Goes to `/hand-lines/`.

### 1.4 `lines on palm` (+ "lines on palm meaning", "what are the lines on your palm called")
- **Seen:** almanac.com, leoweekly.com (sponsored-style article), rylandpeters, Wikipedia "Palm Line" (unrelated — a noise result), laurenconrad, cassieuhl, Pinterest, auntyflo.com/palmistry (~4,240 w, 96 H2, 92 images), Scribd PDF.
- **Format mix:** G 6 · I 1 · P 1 · noise 1.
- **Autocomplete:** lines on palm meaning · of hand · called · name · meaning right hand · reading · **lines on palm down's syndrome** (medical intent inside this query family).
- **Angle:** names table (line → other names → where → what it is read for) that can win a featured snippet for "what are the lines on your palm called"; one short, sourced medical note linking to `/simian-line/`.

### 1.5 `heart line` (palm)
- **Seen:** howstuffworks.com, jobcannon.io (now 404), numerologist.com/palm-reading/heart-line (~2,980 w, 12 H2, 28 images, FAQ), mindbodygreen (~740 w), sisterpalm.com, astroyogi.com (~1,260 w, FAQ), yourchineseastrology.com, Scribd.
- **Format mix:** G 7 · P 1. Depth leader ~3,000 w with **a picture per variation**.
- **Autocomplete:** bare "heart line" is ambiguous (art, drawing, tattoo, emoji, crossword clue) → target **heart line palm / palmistry / meaning**. Questions: what does the heart line mean on your palm · what does it mean if your heart line splits / is broken / forks / is curved / is straight / is short / is long / lines match up.
- **Angle:** a variation gallery (one real traced photo or clean SVG per type), "love line = heart line" clarified up top, "can't tell your soulmate or wedding date" box, meaning finder tool.

### 1.6 `life line` (palm)
- **Seen:** almanac, jobcannon (404), rylandpeters, cassieuhl, lovetoknow.com (~1,540 w, step-by-step), palm-reading.app/palm-reading-life-line (tool + guide), yourchineseastrology, myratna.com, bivs.com "short life line in both hands".
- **Format mix:** G 8 · T 1.
- **Autocomplete:** life line palm which hand · left or right · short · **age calculation** · meaning. Questions: what does a short life line mean · **does a short life line mean early death** · what does a broken life line mean · split life line · broken in two · broken on one hand.
- **Angle:** answer the fear first ("No — the life line does not show how long you live"), then types. Top pages already say "myth", so our edge is photos of each type + sources + the tool. `/life-line/broken/` owns the "broken/split" cluster.

### 1.7 `fate line`
- **Seen:** numerologist.com (~3,030 w, 30 images), cilguru.com, astroyogi (~1,650 w), astroarunpandit.org, askastrologer.com, yourchineseastrology, a jyotisha journal PDF, psychicbook.net, uw.edu spam page.
- **Format mix:** G 8 · P 1 — **Indian astrology sites are strong here.**
- **Autocomplete:** noise (a song "fate line lyrics", an actor) → target **fate line palm / palmistry**. Questions: what does the fate line mean · represent · **what does no fate line mean / what if there is no fate line** · career line palmistry (female/male) · job line palm reading · no career line.
- **Angle:** "no fate line is common and not bad" section high up; clear "career line = fate line" answer; link to `/career-palmistry/`.

### 1.8 `marriage line palm`
- **Seen:** manhattanbride.com, numerologist.com (~3,410 w, 15 H2), **Quora**, lovetoknow (~620 w), palmreading.pro blog (~1,650 w, FAQPage schema), astroarunpandit.org ("Love & Marriage Predictions"), yourchineseastrology (~1,810 w, 22 images), psychicbook.net, jyotisha journal PDF.
- **Format mix:** G 7 · Q 1 · P 1. Most promise predictions (age, number, divorce).
- **Autocomplete:** marriage line on hand · palm reading · **for female** · palmistry; noise: "marriage line mobile home" (manufactured homes). Questions: what does the marriage line mean / look like · how many marriage lines on palm · **why do I have two marriage lines** · different types · marriage line age.
- **Angle (owner decision: honest guide):** explain what the tradition says, show the types with pictures, answer "two lines / forked / divorce line / age" directly and say plainly that no line can give a number, age or date. Honest and specific beats vague; this is also safer.

### 1.9 `one line on palm` (simian line)
- **Seen:** almanac, yourtango.com (M on palm), Wikipedia "One Line" (noise), **ufhealth.org "Single palmar crease" (medical, ~530 w)**, astroyogi simian line (~1,140 w), myratna.com ("…Remedies, and Diseases"), psychicbook.net (~1,660 w), Scribd.
- **Format mix:** G 5 · M 1 · noise 1 → **YMYL mix** (medical meaning next to palmistry).
- **Autocomplete:** one line on palm instead of two · across palm · of hand meaning; simian line: rare? · hereditary? · good or bad? · lucky? · both hands · personality · **down syndrome**; is a simian crease normal.
- **Angle:** the only page that gets both halves right: medical facts first (usually a normal variation, not a diagnosis; cite MedlinePlus/UF Health), then the palmistry tradition. Never list diseases as "predictions". Needs a reviewer.

### 1.10 `types of hands` (palmistry)
- **Seen:** Scribd PDF, numerologist.com/palm-reading/hand-shapes (~3,640 w), fengshui-karma.com (earth/air/fire/water + five elements), astroyogi (~1,010 w), sisterpalm (~2,550 w), yourchineseastrology, astroscience.com, yourhomeofwellness.com, a book shop.
- **Format mix:** G 7 · P 1 · shop 1.
- **Autocomplete:** bare "types of hands" = poker hands, handshakes, handstands → **target "types of hands in palmistry", "hand shape palmistry", "what hand type do I have"** (quiz intent), "what is a fire hand in palmistry", "types of hands and fingers".
- **Angle:** measure-your-hand quiz (2 measurements) with a result card; photos of all 4 shapes; Chinese five-element hands as one section linking to `/chinese-palmistry/`.

### 1.11 `palm reading app`
- **Seen:** App Store ×4, Google Play ×2, genai.works (directory), **mysticmag.com "9 Best Palm Reading Apps in 2026" (~3,180 w, 38 images, video)**, creen.ai.
- **Format mix:** A 6 · L 1 · T 1 · directory 1 → **store pages own this SERP.**
- **Autocomplete:** palm reading app free · online free · free download · reddit · mod apk · **which app is best for palm reading** · is there an app that reads your palm · most accurate palm reading app.
- **Angle:** we win this in the **Play Store (ASO)**, not on the web. The web `/app/` page supports it (screens, what's free, privacy, Play button + QR). A separate honest comparison post ("best palm reading apps — we tested them, ours included, with disclosure") targets the listicle slot.

### 1.12 `is palmistry real`
- **Seen:** Harvard Crimson (1968 "Confessions of a Palmist"), phillyvoice.com ("illusory correlation", ~2,060 w), vocal.media, piscespalmist.com, yourchineseastrology ("Science or Pseudoscience?"), purplegarden.co blog (~1,420 w), occultscience.in, a palmistry app blog, Trustpilot.
- **Format mix:** G 5 · news 2 · other 2.
- **Autocomplete:** is palmistry real · accurate · true · real or fake · a science · **demonic · a sin · witchcraft · haram in islam** · 100 percent correct; how accurate is palm reading (reddit, life line); can palm reading predict the future / death / life expectancy / how many babies / marriage / health; can palm readings be wrong; do palm lines change.
- **Angle:** evidence-first page by a palm-reading product (rare = trust): no predictive evidence, why readings feel accurate (Barnum/Forer effect, cold reading, confirmation bias), what palm creases are, what we will never predict. Religious questions: one short neutral line ("views differ between faiths; we don't take a side") — do not argue theology.

### 1.13 What this means overall
1. **Depth:** line guides that rank run **1,100–3,600 words** (median ≈ 1,650; the strongest, numerologist.com, ≈ 3,000 with 20–30 images). Tool pages that rank carry **1,100–5,600 words** under the tool (median ≈ 1,900). Our targets below sit at "complete, not padded".
2. **Pictures win this niche:** Pinterest, stock photos, YouTube and "with pictures / chart" modifiers appear everywhere (English and Hindi). Original diagrams are our cheapest ranking and link asset.
3. **Ambiguous short heads** ("heart line", "fate line", "types of hands", "marriage line", "sun line", "money line") mix non-palm meanings → always put "palm/palmistry" in title and H1.
4. **"for female / for male" and "which hand"** appear in almost every family (EN + HI). Handle inside each page (a short "left or right hand, women and men" section linking to `/which-hand-to-read/`), never as separate gendered pages.
5. **Fear queries** (short life line = death, two marriage lines, simian = disease, how many children) are common. Answering them honestly and directly is both the ranking angle and our brand.
6. Competitors mark up fake `AggregateRating` inside `MobileApplication` on article pages (astroyogi) — we must not.

---

## 2. Per-page on-page blueprints

Rules that apply to every guide (so they are not repeated below):
- **Title:** ≤60 chars, keyword first, no brand suffix (Google shows the site name separately; set it with `WebSite` schema). Home and `/app/` carry the brand.
- **Meta description:** ≤155 chars, promise + honesty cue. (Google rewrites many; still worth writing.)
- **First paragraph:** a direct 1–2 sentence answer (≤40 words) to the page's main question — this is what featured snippets and AI Overviews lift.
- **Each H2 phrased like the question people type** (from the autocomplete lists) and answered in its first sentence.
- **Template (from master plan):** quick facts box → sections → "Myth vs what palmists actually say" → "What palmistry cannot tell you" box → photo tips → FAQ → "Step n of 7" nav (for the 7 core lessons) → scan CTA.
- **Sources box** at the end of every meaning: the classical text behind it (e.g. Cheiro, *Language of the Hand*, 1894; W. G. Benham, *The Laws of Scientific Hand Reading*, 1900 — both public domain; for Indian readings the Samudrika Shastra tradition), reusing the source already stored per rule in the app.
- **Byline + "Reviewed by" + "Last reviewed" date** (see E-E-A-T, section 3.7).
- **CTA placement (all guides):** (1) small inline CTA after the first section: "Find your [heart] line on your own photo →" (to home `#read`); (2) the matching free tool mid-page (embedded); (3) end block: primary "Read my palm free" + secondary Play badge (QR on desktop). One primary button per screen.
- **Schema (all guides):** `Article` (headline, image, datePublished, dateModified, author → Person URL, publisher → Organization) + `BreadcrumbList`; diagrams as `ImageObject` with `creator`, `creditText`, `license`, `acquireLicensePage` (makes them eligible for the "Licensable" badge in Google Images and invites attribution links). FAQ questions stay visible in HTML; `FAQPage` JSON-LD is optional — **Google only shows FAQ rich results for well-known government and health sites since 2023**, so it earns no rich result for us. No `HowTo` (rich result retired 2023). **No `AggregateRating` anywhere until we collect reviews on our own site under Google's rules — never copy the Play rating into schema.**

### 2.1 P1 pages

#### `/` Home — free AI palm reading (P1)
- **Primary:** free palm reading (free AI palm reading online)
- **Secondary → where:** palm reading scanner / free palm reading scanner online → H2 "How the scanner works"; upload picture palm reading free online / scan palm → H3 "1. Take or upload a photo"; ai palm reading → H1 + H2 "What AI can and can't do"; palm reading app → H2 "Get the app"; palm reading free no sign up / no email → hero sub-line + FAQ; hand reader online → body; palm reading for female → FAQ "which hand".
- **Title:** `Free AI Palm Reading Online – See Your Lines on Your Photo`
- **Meta:** `Upload or snap a palm photo and see your heart, head, life and fate lines traced on your own hand. First reading free, no email. No fake predictions.`
- **H1:** Free AI palm reading from a photo of your hand
- **Outline:**
  - Hero: upload/camera box, photo-tip chips, privacy line at the upload point, one button "Read my palm".
  - H2 See a real sample reading (sample on a real traced photo)
  - H2 How the free palm reading scanner works — H3 1. Take or upload a photo · H3 2. We find your lines · H3 3. Read what they mean
  - H2 What your free reading covers (love + personality full; career & money + life direction preview; 2nd reading after email; more in the app)
  - H2 What AI palm reading can and can't tell you (honest box → `/is-palmistry-real/`)
  - H2 Learn the lines on your palm (4 cards → pillars, 1 → `/hand-lines/`)
  - H2 Free palmistry tools (4 cards → `/tools/`)
  - H2 Get the Palm Read AI app (Play badge, QR on desktop)
  - H2 Questions people ask
- **FAQ:** Is this palm reading really free? · Do I need to sign up or give my email? · Which hand should I scan — left or right (for women and men)? · Do you keep my palm photo? · How accurate is AI palm reading? · Is there an app that reads your palm? · Can palm reading predict death or marriage dates? (no) · What if my lines are faint?
- **Images (alt):** sample `sample-reading-traced-palm.webp` — "Palm photo with the heart, head, life and fate lines traced in colour by Palm Read AI"; 3 step icons (decorative, empty alt); app screenshots — "Palm Read AI app showing a traced palm and the love section of a reading"; OG 1200×630.
- **Schema:** `WebSite` (name, alternateName, url), `Organization` (logo, sameAs → Play listing, socials), `WebApplication` (name "Palm Read AI free palm reading", applicationCategory "LifestyleApplication", operatingSystem "Any", browserRequirements, offers price 0 / USD and INR, isAccessibleForFree true). No ratings.
- **Links out:** `/hand-lines/` ("all the lines on your palm"), `/heart-line/` ("heart line"), `/head-line/`, `/life-line/`, `/fate-line/`, `/palm-reading/` ("learn to read a palm yourself"), `/which-hand-to-read/` ("which hand to scan"), `/is-palmistry-real/` ("is palm reading real?"), `/tools/`, `/app/`, `/hi/` (language switch).
- **CTA:** hero primary only; app badge only after the sample and at the end (and on the result screen).
- **Words:** 900–1,400 under the tool (tool SERP median ≈ 1,900, but our tool itself is the content; add later only if GSC shows gaps).
- **Honest angle:** yes — box near the report preview.

#### `/hand-lines/` — lines-on-palm hub + palm chart (P1)
- **Primary:** lines on palm (lines on palm meaning)
- **Secondary → where:** palm reading lines → H1/intro; what are the lines on your palm called / lines on palm name → H2 names table; palm diagram / palm reading chart / palmistry images → H2 chart; major lines / three main lines → H2; minor lines → H2; lines on palm meaning right hand / left hand → H2 which hand; what your palm lines say → intro; meaning of lines in the palm → table column.
- **Title:** `Lines on Your Palm: Names, Meanings & Palm Reading Chart`
- **Meta:** `A labelled palm reading chart of every line on your hand – heart, head, life, fate, sun, marriage and more – and what palmistry says each one means.`
- **H1:** Lines on your palm and what they mean
- **Outline:**
  - H2 Palm reading chart: every line at a glance (interactive palm map tool + static SVG chart)
  - H2 What are the lines on your palm called? (table: name · other names · where · read for)
  - H2 The three major lines everyone has — H3 Heart line · H3 Head line · H3 Life line (80–120 words each → pillar)
  - H2 The fate line (not everyone has one)
  - H2 Minor lines — H3 Sun (Apollo) line · H3 Marriage (relationship) lines · H3 Children lines · H3 Money lines · H3 Mercury line · H3 Bracelet (rascette) lines
  - H2 Signs on the lines: M, cross, star, triangle, fish, island
  - H2 Left or right hand: which lines do you read?
  - H2 Do palm lines change over time?
  - H2 What is the rarest palm line?
  - H2 What palm lines cannot tell you
  - H2 FAQ
- **FAQ:** What are the lines on your palm called? · What are the three main lines? · Do palm lines change with age? · Why are the lines different on each hand? · What does it mean if a line is missing? · What is the rarest palm line?
- **Images (alt):** `palm-reading-chart.svg` — "Palm reading chart labelling the heart, head, life, fate, sun and marriage lines on a right hand"; `palm-lines-traced-photo.webp` — "Real palm photo with the main palm lines traced and labelled"; one thumbnail per line ("Heart line highlighted on a palm diagram", etc.); signs sheet — "Palm signs chart showing an M, a cross, a star, a triangle and an island".
- **Schema:** Article + BreadcrumbList + ImageObject (chart, licensable) + the palm map as `WebApplication` is not needed (embedded widget).
- **Links out:** every line/sign spoke (heart, head, life, fate, sun, marriage, children, money, mercury, palmistry-m, palm-crosses, lucky-signs, simian-line, palm-mounts), `/which-hand-to-read/`, `/is-palmistry-real/`, `/tools/palm-line-finder/`, home CTA "Find these lines on your own palm photo".
- **Words:** 2,500–3,500 (almanac ≈ 3,270, auntyflo ≈ 4,240, numerologist hub ≈ 3,330).
- **Honest angle:** yes (one box).

#### `/palm-reading/` — how to read a palm (P1)
- **Primary:** how to read palms (palm reading guide)
- **Secondary → where:** how to read palm lines → steps 3–6; how to read palms for beginners / easy → H1 + intro; palm reading for female / for male / which hand → Step 1 + H2; palmistry hand → Step 2; how to read your palm for marriage / number of children → H2 "questions palmistry can't answer"; palm reading pdf → H2 download; can you read your own palm → FAQ.
- **Title:** `How to Read Palms: A Step-by-Step Guide for Beginners`
- **Meta:** `Learn palm reading in 7 steps: pick the right hand, find your hand shape, read the heart, head, life and fate lines, then the mounts. Free chart and PDF.`
- **H1:** How to read palms: a beginner's step-by-step guide
- **Outline:** H2 What you need (light, the right hand, 10 minutes) · H2 Step 1: Choose which hand to read · H2 Step 2: Find your hand shape · H2 Step 3: Read the heart line · H2 Step 4: Read the head line · H2 Step 5: Read the life line · H2 Step 6: Read the fate line · H2 Step 7: Look at the mounts and signs · H2 How to read a palm for a woman or a man · H2 Common beginner mistakes · H2 Questions palmistry can't answer (marriage age, number of children, lifespan) · H2 Practise: spot-the-line quiz · H2 Download the free palm reading PDF · H2 FAQ
- **FAQ:** How do you read palms as a beginner? · Can you read your own palm? · Which hand do you read for a woman? · How long does it take to learn palmistry? · Is there a palm reading PDF? · Do you need both hands?
- **Images (alt):** one diagram per step ("Step 3: tracing the heart line from the little-finger edge"), hand-shape measuring diagram, mounts chart, PDF cover.
- **Schema:** Article + BreadcrumbList (no HowTo).
- **Links out:** `/which-hand-to-read/`, `/hand-types/`, 4 pillars, `/palm-mounts/`, `/palmistry-fingers/`, `/palm-reading-pdf/`, `/tools/palm-reading-quiz/`, `/is-palmistry-real/`, home.
- **Words:** 2,500–3,300 (almanac ≈ 3,270, laurenconrad ≈ 2,000).
- **Honest angle:** yes, as its own H2.

#### `/heart-line/` — heart line = love line (P1, App Link path)
- **Primary:** heart line palm (heart line palmistry / meaning)
- **Secondary → where:** palm reading heart line → intro; love line on palm / palmistry love line → H2 "Is the love line the same…"; what does the heart line mean → first paragraph; broken heart line (KD 5) → H3; forked / split heart line → H3; curved vs straight → H3s; short / long → H3s; heart line ending under index / middle finger → H3s; soulmate line → honest box.
- **Title:** `Heart Line on Palm: Meaning, Types & the Love Line`
- **Meta:** `What your heart line (love line) says in palmistry: long or short, curved or straight, forked, broken or chained – with a picture of each type.`
- **H1:** Heart line meaning in palmistry (the love line)
- **Outline:** H2 Where is the heart line? · H2 Is the love line the same as the heart line? · H2 Heart line types and meanings — H3 Long · Short · Curved · Straight · Ends under the index finger · Ends under the middle finger · Ends between them · Forked (split) · Broken · Chained · Double · Faint · H2 Marks on the heart line: islands, crosses, stars · H2 Heart line on the left vs right hand · H2 When the heart and head line join (simian line) · H2 What the heart line can't tell you (no soulmate name, no wedding date) · H2 Find your heart line on your photo (meaning finder tool) · H2 FAQ
- **FAQ:** What does the heart line mean on your palm? · What does a broken heart line mean? · What does it mean if your heart line forks? · Curved or straight — what's the difference? · Can the heart line predict marriage? · Which hand shows the heart line best?
- **Images (alt):** 12 variation SVGs ("Forked heart line splitting into two branches under the index finger") + 1 traced real photo ("Heart line traced in pink on a real palm photo").
- **Schema:** Article + BreadcrumbList + ImageObject.
- **Links out:** `/hand-lines/`, `/head-line/`, `/marriage-line/`, `/simian-line/`, `/palm-crosses/`, `/which-hand-to-read/`, meaning finder (embedded), home.
- **Words:** 2,200–3,000 (numerologist ≈ 2,980; astroyogi ≈ 1,260).
- **Honest angle:** yes.

#### `/life-line/` — life line (P1, App Link path)
- **Primary:** life line palm (life line palm reading / palmistry)
- **Secondary → where:** does a short life line mean early death → H2 right after intro; life line palm reading short (KD low) → H3; double life line / sister line → H3; forked → H3; life line which hand / left or right → H2; life line age calculation → H2; life expectancy palm reading → H2 answer + honest box; where is your life line → H2.
- **Title:** `Life Line on Palm: Meaning, Short, Broken & Double Lines`
- **Meta:** `The life line does not show how long you live. See what palmistry really reads in it – short, long, broken, double or forked – with a picture of each.`
- **H1:** Life line meaning: what it shows (and what it doesn't)
- **Outline:** H2 Where is your life line? · H2 Does a short life line mean a short life? (No) · H2 Life line types — H3 Long · Short · Deep · Faint · Wide curve · Close to the thumb · Double (sister line) · Forked at the end · Broken (→ `/life-line/broken/`) · Chained · H2 Life line age calculation: why we don't do it · H2 Left vs right hand · H2 Life line vs fate line · H2 FAQ
- **FAQ:** Does a short life line mean early death? · Can palm reading predict life expectancy? · What does a double life line mean? · What if my life line is short on one hand only? · Which hand's life line do you read?
- **Images (alt):** variation SVGs ("Short life line ending in the middle of the palm"), traced photo.
- **Schema:** Article + BreadcrumbList.
- **Links out:** `/life-line/broken/`, `/fate-line/`, `/hand-lines/`, `/is-palmistry-real/` ("can palm reading predict death?"), `/which-hand-to-read/`, `/mercury-line/`, meaning finder, home.
- **Words:** 2,200–3,000 (lovetoknow ≈ 1,540; almanac section).
- **Honest angle:** yes — first H2.

#### `/life-line/broken/` — broken life line (P1 sub-page)
- **Primary:** broken life line
- **Secondary → where:** what does a broken life line mean → first paragraph; split life line / broken in two → H2; broken life line on one hand / both hands → H2; overlapping break / square over a break → H3.
- **Title:** `Broken Life Line: What a Break or Gap Really Means`
- **Meta:** `A gap in your life line is common and does not predict illness or death. How palmists read breaks, overlaps and squares – and what they can't tell you.`
- **H1:** Broken life line meaning
- **Outline:** H2 What counts as a broken life line? · H2 What palmists say a break means — H3 Clean gap · Overlapping break · Break with a square · Break on one hand only · Break on both hands · H2 Split vs broken · H2 What a broken life line cannot tell you · H2 FAQ
- **Images:** 4–5 SVGs ("Life line with an overlapping break halfway down").
- **Schema:** Article + BreadcrumbList (Home › Palm lines › Life line › Broken).
- **Links out:** up to `/life-line/`, `/is-palmistry-real/`, home.
- **Words:** 1,200–1,800.
- **Note:** the app router only accepts exact paths (`/life-line`), so `/life-line/broken/` opens app **Home** when App Links go live. Fix in the app (map `/<line>/*` to the lesson) before listing it in the intent filter.

#### `/fate-line/` — fate / destiny / career line (P1, App Link path)
- **Primary:** fate line palm (fate line palmistry)
- **Secondary → where:** destiny line / palm reading destiny line → H2 names; career line palmistry / palm reading career line (KD 2) → H2 "fate line and career" (short, → `/career-palmistry/`); palmistry luck line → H2 names; no fate line → H2 high up; broken / double fate line → H3s; fate line starting from life line / mount of moon → H3s; Saturn line → names.
- **Title:** `Fate Line on Palm: Meaning, Career Line & No Fate Line`
- **Meta:** `The fate line (destiny or career line) in palmistry: where it starts, breaks and doubles – and what it means if you have no fate line at all. With photos.`
- **H1:** Fate line meaning in palmistry
- **Outline:** H2 Where is the fate line? · H2 Is the fate line the same as the career line or luck line? · H2 No fate line: what it means (it's common) · H2 Where it starts — H3 Wrist · Life line · Mount of the moon · Head line · Heart line · H2 Breaks, forks and double fate lines · H2 Fate line and career · H2 What the fate line can't tell you · H2 FAQ
- **FAQ:** What does the fate line mean? · What does no fate line mean? · Is the fate line the career line? · What does a broken fate line mean? · Can the fate line change?
- **Images:** variation SVGs + traced photo ("Fate line rising from the wrist to the middle finger").
- **Schema:** Article + BreadcrumbList.
- **Links out:** `/career-palmistry/`, `/sun-line/`, `/money-line/`, `/life-line/`, `/hand-lines/`, meaning finder, home.
- **Words:** 2,000–2,800 (numerologist ≈ 3,030; astroyogi ≈ 1,650).
- **Honest angle:** yes.

#### `/head-line/` — head line (P1, App Link path)
- **Primary:** head line palmistry (head line palm)
- **Secondary → where:** what does the head line mean → intro; split / forked head line (writer's fork) → H3; broken head line → H3; long / short / straight / sloping → H3s; head line joined to life line → H3; head line and heart line join → link to simian.
- **Title:** `Head Line Palmistry: Meaning, Forks, Breaks & Types`
- **Meta:** `What the head line says about how you think: long, short, straight, sloping, forked (the writer's fork) or broken – with a picture of each type.`
- **H1:** Head line meaning in palmistry
- **Outline:** H2 Where is the head line? · H2 Head line types — H3 Long · Short · Straight · Sloping · Joined to the life line · Separate from the life line · Forked (writer's fork) · Broken · Chained · Double · H2 Marks on the head line · H2 Head line vs heart line · H2 What the head line can't tell you (not an IQ test) · H2 FAQ
- **FAQ:** What does the head line mean? · What does a split head line mean? · What does a broken head line mean? · What if my head line is short? · Is the head line about intelligence?
- **Schema / links:** Article + BreadcrumbList; `/heart-line/`, `/simian-line/`, `/career-palmistry/`, `/hand-lines/`, meaning finder, home.
- **Words:** 1,800–2,500.

#### `/is-palmistry-real/` — honesty page (P1)
- **Primary:** is palmistry real (is palm reading real)
- **Secondary → where:** how accurate is palm reading → H2; is palmistry true / a science → H2; palm reading and astrology are examples of (quiz query; answer "pseudoscience") → H2 + one-line answer; can palm reading predict the future / death / marriage / babies → H2; do palm lines change → H2; why do palm lines exist → H2; is palm reading a sin / demonic → one neutral FAQ line.
- **Title:** `Is Palmistry Real? What Science Says About Palm Reading`
- **Meta:** `Palmistry is not a science and can't predict the future. What research says, why readings still feel accurate, and how to enjoy palm reading honestly.`
- **H1:** Is palmistry real? An honest answer from a palm-reading app
- **Outline:** H2 The short answer · H2 What science says — H3 No evidence it predicts anything · H3 Why readings feel accurate (Barnum/Forer effect, cold reading, confirmation bias) · H2 Where palm lines come from (flexion creases formed before birth; dermatoglyphics is real medicine but is not palmistry) · H2 "Palm reading and astrology are examples of…" (pseudoscience) · H2 Can palm reading predict death, marriage or children? · H2 Do palm lines change? · H2 So why read palms at all? (reflection, culture, fun) · H2 How Palm Read AI handles this (our never-predict list, how the AI works) · H2 FAQ · Sources
- **FAQ:** How accurate is palm reading? · Is palmistry a science? · Can palm reading predict death? · Do palm lines change over time? · Is palm reading against religion? (views differ; we don't take a side)
- **Images:** simple infographic "What palmistry can / can't tell you" (alt says the same), no stock mystic art.
- **Schema:** Article (+ `citation` list) + BreadcrumbList.
- **Links in:** from every "cannot tell you" box site-wide. **Links out:** `/history-of-palmistry/`, `/simian-line/`, `/editorial-policy/`, home.
- **Words:** 1,800–2,500 (phillyvoice ≈ 2,060, purplegarden ≈ 1,420). Every claim cited (peer-reviewed or reputable sources).

#### `/which-hand-to-read/` + quiz (P1)
- **Primary:** which hand to read palm (which hand do you read for palm reading)
- **Secondary → where:** left hand palm reading for female / palm reading for female which hand → H2 women; right or left hand palmistry → H1; palmistry left hand meaning → H2; which hand for marriage lines / life line → H2 per topic; dominant hand → H2; left-handed people → H3.
- **Title:** `Which Hand to Read in Palmistry: Left or Right?`
- **Meta:** `Most palmists read your dominant hand for your present and the other for your potential. What Indian tradition says for women, plus a 20-second quiz.`
- **H1:** Which hand do you read in palmistry — left or right?
- **Outline:** H2 The quick answer · H2 Take the 20-second quiz (tool embedded — no separate tool URL) · H2 Dominant vs non-dominant hand · H2 Which hand for women and men? (Western vs Indian tradition) · H2 Left-handed? · H2 Which hand for the heart line, life line and marriage lines? · H2 Why the two hands look different · H2 FAQ
- **Schema:** Article + BreadcrumbList (quiz inside page; no separate WebApplication needed).
- **Links out:** 4 pillars, `/marriage-line/`, `/palm-reading/`, home ("scan the hand the quiz picked").
- **Words:** 1,200–1,800.

### 2.2 P2 pages

#### `/marriage-line/` (P2 — honest guide, owner decision)
- **Primary:** marriage line palm (marriage line on hand)
- **Secondary → where:** marriage line palmistry / palm reading marriage line → intro; palmistry and marriage (KD 6) → H2; marriage lines on palm for female → H2 which hand; how many marriage lines / why do I have two → H3s; divorce line → H3 "forked end"; marriage line age → H2 honest; chiromancy marriage line / relationship line → names.
- **Title:** `Marriage Line on Palm: Meaning & How to Read It Honestly`
- **Meta:** `Where the marriage line is, what palmists say one, two or forked lines mean – and why no palm line can tell your marriage age, number or divorce.`
- **H1:** Marriage line in palmistry: what it really means
- **Outline:** H2 Where is the marriage line? · H2 What palmists say it shows (close bonds, not certificates) · H2 Marriage line types — H3 One clear line · Two marriage lines · Many small lines · No marriage line · Forked end (the "divorce line" myth) · Broken · Curving up / down · Touching the heart line · H2 Marriage lines for women and men: which hand? · H2 Marriage line age: why it can't be worked out · H2 What palmistry can't tell you about marriage · H2 Read love in your palm instead: the heart line · H2 FAQ
- **FAQ:** Where is the marriage line on the palm? · How many marriage lines is normal? · What do two marriage lines mean? · Is there a divorce line? · Can palm reading tell when I'll get married? · Which hand do you read for marriage lines?
- **Images:** location SVG ("Marriage lines on the edge of the palm below the little finger"), type SVGs.
- **Schema / links:** Article + BreadcrumbList; `/heart-line/`, `/which-hand-to-read/`, `/children-line/`, `/is-palmistry-real/`, home (CTA framed as "see what your heart line says").
- **Words:** 1,800–2,500 (numerologist ≈ 3,410; yourchineseastrology ≈ 1,810; palmreading.pro ≈ 1,650). **No prediction tool.**

#### `/simian-line/` (P2 — YMYL care)
- **Primary:** simian line
- **Secondary → where:** one line on palm / one line across palm → H1 + intro; single palmar crease / simian crease → H2 names; is a simian line rare / normal → H2 "how common"; simian line both hands → H3; is it lucky / good or bad → H2; simian line personality → palmistry H2; straight line across palm → intro.
- **Title:** `Simian Line (One Line Across the Palm): Meaning & Facts`
- **Meta:** `One line across your palm instead of two? That's a simian line (single palmar crease). What palmistry says, how common it is, and what it doesn't mean.`
- **H1:** Simian line: one line across your palm
- **Outline:** H2 What is a simian line? · H2 How common is it? (cite MedlinePlus / UF Health) · H2 Medical facts: usually a normal variation, not a diagnosis (see a doctor with any worry; no disease lists as "predictions") · H2 What palmistry says about the simian line · H2 On one hand vs both hands · H2 Is a simian line lucky or rare? · H2 What it can't tell you · H2 FAQ · Sources
- **Schema:** Article + BreadcrumbList; reviewer named (ideally a medical reviewer for the medical section; otherwise quote only MedlinePlus-level facts).
- **Links out:** `/heart-line/`, `/head-line/`, `/hand-lines/`, `/is-palmistry-real/`, MedlinePlus (external).
- **Words:** 1,500–2,000.

#### `/hand-types/` + hand-type quiz (P2)
- **Primary:** types of hands in palmistry (hand shape palmistry)
- **Secondary → where:** what hand type do I have → quiz H2; earth / air / fire / water hand → H3s; element hands → H2; what is a fire hand in palmistry → H3; different types of hands → intro; types of hands and fingers → H2 → `/palmistry-fingers/`; Chinese five-element hands → H2 → `/chinese-palmistry/`.
- **Title:** `Hand Types in Palmistry: Earth, Air, Fire or Water?`
- **Meta:** `Find your hand type from two measurements: palm shape and finger length. What earth, air, fire and water hands mean in palmistry – plus a free quiz.`
- **H1:** Hand types in palmistry: which one is yours?
- **Outline:** H2 What hand type do I have? (quiz embedded, measuring diagram) · H2 The four element hand types — H3 Earth · Air · Fire · Water · H2 Mixed hands · H2 Hand types and fingers · H2 Chinese palmistry's five element hands · H2 What hand shape can't tell you · H2 FAQ
- **Images:** 4 hand-shape SVGs ("Fire hand: long rectangular palm with short fingers"), measuring diagram, result card (shareable).
- **Schema:** Article + BreadcrumbList (quiz in page).
- **Words:** 1,800–2,500 (numerologist ≈ 3,640; sisterpalm ≈ 2,550; astroyogi ≈ 1,010).

#### `/palmistry-m/` (P2)
- **Primary:** m on palm (palmistry m)
- **Secondary → where:** letter m on palm meaning / what does the m on your palm mean → intro; m sign on palm → H1; m on both hands / left / right → H2; is the m rare → H2; m on palm spiritual meaning → short H2, framed as belief; x and m on palm → → `/palm-crosses/`.
- **Title:** `M on Your Palm: What the Letter M Means in Palmistry`
- **Meta:** `An M made by your heart, head, life and fate lines is common, not rare. What palmists say it means on the left, right or both hands – with photos.`
- **H1:** The letter M on your palm: meaning in palmistry
- **Outline:** H2 How to spot an M on your palm · H2 What palmists say the M means · H2 M on the left, right or both hands · H2 Is an M on the palm rare? · H2 "Spiritual" meanings: what's belief, what's tradition · H2 M and X together · H2 FAQ
- **Words:** 1,200–1,800. **Discover candidate** (curiosity topic; 1200-px image).

#### `/money-line/` (P2)
- **Primary:** money line on palm
- **Secondary → where:** money line in hand / for female / for male → H2 which hand; wealth line / rich line → H2 names; money triangle → H3; no money line → H3; dhan rekha → Hindi mirror.
- **Title:** `Money Line on Palm: Wealth Lines & the Money Triangle`
- **Meta:** `Which palm lines palmists link to money – sun line, fate line, the money triangle – what they're said to mean, and why no line can predict your income.`
- **H1:** Money line on the palm: what palmistry says about wealth
- **Outline:** H2 Is there one "money line"? · H2 Lines palmists link to money — H3 Sun line · Fate line · Mercury line · Money triangle · H2 No money line: what it means · H2 What your palm can't tell you about money · H2 FAQ
- **Words:** 1,200–1,800. Honest box required.

#### `/career-palmistry/` (P2 — early win, KD 5)
- **Primary:** career palmistry
- **Secondary → where:** career line palmistry / palm reading career line / job line palmistry → H2; career line for female / male → H3; no career line → H3; line of success → H2 sun line; palm reading for career → intro.
- **Title:** `Career Palmistry: Career Line, Job Line & Success Signs`
- **Meta:** `What palmistry reads for work and career: the fate (career) line, sun line, head line and hand shape – how to read them and what they can't decide for you.`
- **H1:** Career palmistry: what your palm is said to show about work
- **Outline:** H2 The career line (fate line) · H2 The line of success (sun line) · H2 The head line and how you work · H2 Hand shape and work style · H2 No career line? · H2 What palmistry can't decide for you · H2 FAQ
- **Words:** 1,500–2,200. Links: `/fate-line/`, `/sun-line/`, `/head-line/`, `/hand-types/`, `/money-line/`, home (career section is previewed in the free reading).

#### `/sun-line/` (P2)
- **Primary:** sun line palmistry (apollo line)
- **Secondary:** what does the sun line mean on your palm · line of success · no sun line · sun line on right hand.
- **Title:** `Sun Line Palmistry: Apollo Line Meaning & Types`
- **Meta:** `The sun line (Apollo line, line of success) runs up to the ring finger. What palmists say it shows, what it means if you have none – with pictures.`
- **H1:** Sun line (Apollo line) meaning in palmistry
- **Note:** "sun line" also means astrocartography; keep "palm/palmistry" in title, H1 and first sentence.
- **Words:** 1,200–1,800.

#### `/chinese-palmistry/` (P2)
- **Primary:** chinese palmistry (chinese palm reading)
- **Secondary:** five element hands (metal, wood, water, fire, earth) · heaven, human and earth lines · palace areas · chinese vs western palmistry.
- **Title:** `Chinese Palmistry: Five Element Hands & Palm Lines`
- **Meta:** `How Chinese palm reading differs from Western palmistry: the five element hand types, the heaven, human and earth lines, and the palm's palace areas.`
- **H1:** Chinese palmistry: how palm reading works in the Chinese tradition
- **Words:** 1,500–2,200. Needs a writer who can source Chinese terms properly (don't invent).

#### `/palm-crosses/` (P2)
- **Primary:** cross on palm (palmistry crosses)
- **Secondary:** what does a cross on your palm mean · mystic cross · x on palm · x and m on palm · cross on right hand.
- **Title:** `Cross on Your Palm: Mystic Cross & X Meanings`
- **Meta:** `What an X or cross on your palm means in palmistry – from the mystic cross between the heart and head lines to crosses on the mounts. With pictures.`
- **H1:** Cross on the palm: what an X means in palmistry
- **Words:** 1,200–1,800.

#### `/children-line/` (P2 — honest guide, owner decision)
- **Primary:** children lines on palm
- **Secondary:** children lines palmistry · how many children palm reading · children line on palm for female · where is the children line · santan rekha (Hindi mirror).
- **Title:** `Children Lines on Palm: What Palmistry Says, Honestly`
- **Meta:** `Where palmists look for "children lines", what the tradition claims, and why no palm line can tell how many children you'll have. Pictures and sources.`
- **H1:** Children lines on the palm: what the tradition says
- **Outline:** H2 Where palmists look · H2 What the tradition claims · H2 Why no line can count your children · H2 For women and men: which hand? · H2 FAQ. **No count tool.**
- **Words:** 1,000–1,500.

#### `/indian-palmistry/` (P2, pairs with `/hi/hast-rekha/`)
- **Primary:** indian palmistry
- **Secondary:** hast rekha shastra · vedic palm reading · samudrika shastra · palmistry india · palm reading hindu · Indian signs (trishul, fish, triangle) · left hand for women (tradition).
- **Title:** `Indian Palmistry (Hast Rekha Shastra) Explained`
- **Meta:** `Hast Rekha Shastra, India's palm-reading tradition: its roots in Samudrika Shastra, how it differs from Western palmistry, and its well-known signs.`
- **H1:** Indian palmistry: Hast Rekha Shastra explained
- **Words:** 1,800–2,500. `hreflang` pair with `/hi/hast-rekha/`.

### 2.3 P3 pages (short blueprints)

| URL | Primary | Title | H1 | Words | Notes |
|---|---|---|---|---|---|
| `/lucky-signs/` | rare lucky signs on palm | `Rare Lucky Signs on Your Palm: Fish, Star & Triangle` | Lucky signs on the palm | 1,500–2,000 | "rare lucky signs" KD 6; embeds the palm-signs checker; Discover candidate; Hindi mirror high value (त्रिशूल / मछली / त्रिभुज) |
| `/palm-mounts/` | palm mounts (mount of venus, mount of luna) | `Palm Mounts in Palmistry: Venus, Moon, Jupiter & More` | Mounts of the palm | 1,500–2,000 | mounts chart SVG |
| `/history-of-palmistry/` | history of palmistry | `History of Palmistry: From India and China to Today` | A short history of palmistry | 1,500–2,000 | cite historians; links to is-palmistry-real |
| `/palmistry-fingers/` | palmistry fingers | `Fingers in Palmistry: Length, Shape & What They Mean` | Fingers in palmistry | 1,200–1,600 | |
| `/palm-reading-pdf/` | palm reading pdf | `Free Palm Reading PDF: Printable Palmistry Guide` | Free palm reading PDF | 500–800 + PDF | email opt-in; PDF itself `noindex` via `X-Robots-Tag` or allowed — see 3.4; Hindi PDF is higher value (see 4) |
| `/mercury-line/` | line of mercury (health line) | `Mercury Line in Palmistry (the So-Called Health Line)` | Mercury line meaning | 1,000–1,400 | **no health claims**; "not a medical test" box up top |

### 2.4 Tools, `/app/`, blog

**Tool URL decision (proposed change for owner OK):** give a tool its own URL only when people search for it or it is useful alone. Tools that explain one topic live **inside** that guide (one URL, no competing thin page):

| Tool | URL | Primary | Title | Schema | Words under tool |
|---|---|---|---|---|---|
| Free AI palm reading | `/` | free palm reading | (home) | WebApplication | 900–1,400 |
| Palm line finder (lines only) | `/tools/palm-line-finder/` | palm line finder / palm line scanner | `Palm Line Finder: See Your Palm Lines Traced Free` | WebApplication | 500–900 |
| Palm photo checker | `/tools/palm-photo-checker/` | how to take a palm photo for reading | `Palm Photo Checker: Is Your Photo Good Enough to Read?` | WebApplication | 500–800 |
| Spot-the-line quiz | `/tools/palm-reading-quiz/` | palm reading quiz | `Palm Reading Quiz: Can You Spot the Lines?` | WebApplication | 400–700 |
| Heart / head / life / fate meaning finders | inside each pillar (`#finder`) | — | — | none extra | — |
| Which hand quiz | inside `/which-hand-to-read/` | — | — | — | — |
| Hand type finder | inside `/hand-types/` | — | — | — | — |
| Rare signs checker | inside `/lucky-signs/` | — | — | — | — |
| Interactive palm map | inside `/hand-lines/` | — | — | — | — |

`/tools/` hub — Title `Free Palm Reading Tools: Scanner, Quizzes & Line Finders`; lists all 12 (links to page anchors for embedded ones); `CollectionPage` + `ItemList` + BreadcrumbList; 400–600 words. Tool pages carry the same honest labelling (which ones use AI).

**`/app/`** — Primary: palm reading app. Secondary: palm reading app free · is there an app that reads your palm · palm reading app for android · hast rekha app (→ `/hi/app/`).
- **Title:** `Palm Read AI App: Free Palm Reading App for Android`
- **Meta:** `Scan your palm with your phone camera, see your lines traced and read what they mean. Free to start on Android. What's free, what's paid, and your privacy.`
- H1 "Palm Read AI — the palm reading app that traces your real lines"; H2 What the app does · Screenshots · What's free and what's paid · Your photos and privacy · What it can't do · Get it on Google Play (phone detection, QR on desktop) · FAQ.
- **Schema:** `MobileApplication` (name, operatingSystem "ANDROID", applicationCategory = same as Play Console category, offers price 0, installUrl/downloadUrl = Play link with `referrer=utm_source%3Dweb%26utm_medium%3Dapp_page`), `BreadcrumbList`. **No `aggregateRating`** (Play's rating is not collected on our page). Note: Google's software-app rich result needs a rating, so this page will show as a normal result — that's fine.
- 600–1,000 words.

**Blog (long tail from autocomplete, each links to one pillar + home):** priority order —
1. `/blog/palm-reading-chatgpt-vs-palm-scanner/` (autocomplete: "palm reading free chatgpt", "palm reading ai prompt")
2. `/blog/best-palm-reading-apps/` (honest test, our app disclosed; targets the mysticmag-style listicle slot)
3. `/blog/do-palm-lines-change/` (pillars' FAQ gives the short answer and links here)
4. `/blog/how-to-take-a-palm-photo/` (supports the photo checker)
5. `/blog/palm-reading-for-female/` (which hand + what to look for; autocomplete strong in EN and HI)
6. `/blog/rarest-palm-lines/`
7. `/blog/can-palm-reading-predict-death/` (fear query; honest; links to life-line)
Schema `BlogPosting` + BreadcrumbList. No dates in URLs.

---

## 3. Site-wide

### 3.1 Internal-link graph

```
                         ┌──────────── /  (free AI palm reading = the conversion page) ────────────┐
                         │                        ▲ every page links here (CTA)                    │
        ┌────────────────┴───────────┐                                   ┌─────────────────────────┴───┐
   HUB /hand-lines/ (what lines mean)                                  HUB /palm-reading/ (how to read)
        │  links to EVERY line/sign spoke                                   │ which-hand, hand-types, 4 pillars,
        ▼                                                                    ▼ mounts, fingers, PDF, quiz
  PILLARS  /heart-line/  /head-line/  /life-line/ (+/broken/)  /fate-line/     ◄── "Step n of 7" chain
        │ each → 2–4 siblings + its embedded tool + home + /is-palmistry-real/
        ▼
  SPOKES  marriage · children · sun · money · career · mercury · M · crosses · lucky signs · simian · mounts · fingers
  CONTEXT is-palmistry-real · history · indian (↔ /hi/hast-rekha/) · chinese · which-hand
  TOOLS   /tools/ hub → tool pages → the pillar they explain → home → /app/
  BLOG    each post → 1 pillar + home; each pillar → ≤3 related posts
  /app/   linked from home, every page's end block, footer
  /hi/*   Hindi pages link to Hindi pages; a language switch links the English twin (and back)
```

Rules:
- Click depth ≤3 from home for every indexable page; no orphans (check at build: every page must have ≥2 internal links in).
- Breadcrumb trail is logical, not the URL: Home › Palm lines › Heart line (URLs stay flat because of App Links). Visible breadcrumb + `BreadcrumbList`.
- Anchor text = the target's topic in natural words ("what a broken life line means", "the marriage line"), varied; never "click here"; one link per target per section.
- Every "What palmistry cannot tell you" box links to `/is-palmistry-real/` (sitewide trust node).
- Footer (lean): Free reading · Palm lines · How to read palms · Tools · App · Is palmistry real? · About · Editorial policy · Privacy · Terms · हिन्दी.
- Sibling sets (related box, 3–4 links): heart ↔ head ↔ simian ↔ marriage; life ↔ fate ↔ broken ↔ mercury; fate ↔ career ↔ sun ↔ money; M ↔ crosses ↔ lucky signs ↔ mounts.

### 3.2 URL rules
- Lowercase, hyphens, ASCII only, 1–3 words, no dates, no file extensions, **trailing slash** (Astro `trailingSlash: 'always'`, `build.format: 'directory'`); 301 the non-slash and `index.html` forms (Cloudflare Pages does the directory redirect; verify).
- One host (pick apex or `www`, 301 the other), HTTPS only.
- **Slugs are permanent** — six of them are App Link paths (`/palm-reading`, `/hand-lines`, `/heart-line`, `/head-line`, `/life-line`, `/fate-line`, each also under `/hi/`). The app router lower-cases, strips one trailing slash and accepts `/hi/<slug>` — so `/hi/` pages **must reuse the English slugs** (a Devanagari or Hinglish slug would not open the app).
- Keep the legacy legal URLs exactly (`/privacy.html`, `/terms.html`, `/delete-account.html`, `/reset-password.html`) — the app and Play Console link them; self-canonical.
- No indexable URLs from parameters: `?utm_*`, `?ref=`, tool states, sort/filter → canonical to the clean URL. Readings and share cards (`/reading/`, `/account/`, `/r/<id>`) → `noindex` (user photos must never be indexed).

### 3.3 Canonical + hreflang
- Every indexable page: self-referencing absolute canonical (`https://<host>/heart-line/`).
- `hreflang` only between true translations: `en` ↔ `hi`, plus `x-default` → the English URL. Each page lists itself and its twin; both sides must point to each other or Google ignores them.
- Use plain `hi` (not `hi-IN`) — Hindi readers outside India exist; use `en` (not `en-US`) — one English version.
- No `hi-Latn` (Hinglish) versions: Google supports script subtags, but separate Latin-Hindi pages would duplicate the Devanagari pages. Hinglish is handled inside the Hindi page (section 4).
- Hindi-only pages without an English twin (e.g. a Hindi-first blog post) get `hreflang="hi"` + self only, no `x-default`.
- Put `hreflang` in the HTML `<head>` (simplest in Astro). Optional: also in `sitemap-hi.xml` — if both, they must match exactly.
- Never canonicalise a Hindi page to its English twin.

### 3.4 Sitemaps + robots + llms.txt
- `/sitemap-index.xml` → `sitemap-core.xml` (home, 2 hubs, 4 pillars, is-real, which-hand, `/app/`), `sitemap-guides.xml` (P2/P3), `sitemap-tools.xml`, `sitemap-blog.xml`, `sitemap-hi.xml`. Submit each file separately in Search Console → the Page-indexing report can be filtered per sitemap (that's the real benefit of splitting).
- `lastmod` only when the main content really changes (Google ignores fake lastmods). Only 200, canonical, indexable URLs.
- `robots.txt`:
  ```
  User-agent: *
  Disallow: /account/
  Disallow: /reading/
  Disallow: /api/
  Sitemap: https://<host>/sitemap-index.xml
  ```
  Do not block CSS/JS. Do **not** disallow `/r/` share pages — they carry `noindex`, and Google must crawl them to see it.
- AI crawlers — **owner decision:** recommended allow search-answer bots (OAI-SearchBot, PerplexityBot, Claude-SearchBot; Googlebot covers AI Overviews) so we can be cited; training bots (GPTBot, ClaudeBot, CCBot, Google-Extended) are a policy choice — blocking Google-Extended does not affect Google Search ranking.
- `/llms.txt`: short Markdown — what Palm Read AI is, the honesty rules, links to home, `/hand-lines/`, 4 pillars, `/is-palmistry-real/`, `/app/`, `/hi/`. Cheap to add; **no search engine has said it uses it**, so expect no ranking effect.
- PDF lead magnet: the landing page is indexable; the PDF file itself `X-Robots-Tag: noindex` (so the email gate isn't bypassed from search) — owner may prefer the PDF indexable for "palm reading pdf" reach; decide once.

### 3.5 Image SEO
- **Diagrams = original SVG files** served through `<img src="/img/diagrams/heart-line-types.svg" alt="…" width height>` (inline SVG is not indexed by Google Images). Readable labels in the SVG, brand colours, a tiny site URL in a corner.
- **Photos** (real traced palms): AVIF + WebP via `<picture>`, `srcset` 480/768/1200/1600 w, explicit width/height, `loading="lazy"` except the LCP image (`fetchpriority="high"`, never lazy). Targets: hero ≤ 80 KB, in-article ≤ 60 KB.
- **Discover / OG:** every guide has one ≥1200 px wide raster (JPG/WebP) set as `og:image` and `Article.image`, plus `<meta name="robots" content="max-image-preview:large">` site-wide (required for big Discover cards).
- Descriptive file names (`forked-heart-line.svg`), alt text that describes what's shown (not keyword lists), captions under diagrams (captions are read by Google Images).
- `ImageObject` licence fields on our diagrams → "Licensable" badge + attribution links from people who reuse them (a link-earning asset).
- Palm photos of real people: only with written consent; never user uploads.

### 3.6 Core Web Vitals budgets (p75, mobile, field data)
| Metric | Google "good" | Our budget |
|---|---|---|
| LCP | ≤ 2.5 s | ≤ 2.0 s guides, ≤ 2.3 s home |
| INP | ≤ 200 ms | ≤ 150 ms |
| CLS | ≤ 0.1 | ≤ 0.05 |
| TTFB | — | ≤ 200 ms (static on Cloudflare) |

Weight budgets: guide pages ≤ 40 KB JS (gz, islands only), ≤ 30 KB CSS; home ≤ 60 KB JS on load — the camera/analysis/report code loads **on tap of "Read my palm"**, not before; fonts: max 2 WOFF2 files, subset, `font-display: swap`; Devanagari font loads only on `/hi/` pages; no third-party tag managers, no ad scripts. Check in Search Console's Core Web Vitals report (field) + Lighthouse CI on every build (lab).

### 3.7 E-E-A-T (trust) package — build before P2
- `/about/`: who makes Palm Read AI, why, contact, company details.
- **Author pages** `/about/<name>/`: a real person, photo, how they know palmistry (years, books studied, readings done), what they don't claim. Reviewer page for the Hindi reviewer. No invented personas or human-named "AI astrologers".
- `/editorial-policy/`: where meanings come from (named classical texts per meaning; the app's rule sources), what we never predict (death, lifespan, health, exact marriage dates, number of children), how AI is used (tracing lines on the photo; text built from a fixed rule set, reviewed by a person), corrections policy, update cadence.
- `/how-it-works/` (or a section on home): what the AI does with the photo, where it's processed, how long kept — must match backend behaviour exactly.
- Each guide: byline, reviewer, "last reviewed" date, sources box. `Person` schema on author pages; `author.url` in `Article`.
- Honesty is the E-E-A-T angle: we are the palm-reading site that says what palmistry can't do, with sources.

### 3.8 Content refresh cadence
- P1 pages: review every 3 months against Search Console queries (add an H2/FAQ for any query with impressions at position 8–20 that the page doesn't answer). Change `dateModified` only when content changes.
- P2/P3: every 6 months. Tools: monthly function check. `/app/`: every app release. Hindi twins: re-check within 2 weeks of any English change (drift).
- Yearly blog prune: merge or 301 posts with no impressions after 12 months into the pillar.

### 3.9 Programmatic-page limits (avoid "scaled content abuse")
Google's spam policy (March 2024) targets many pages made mainly to rank, whatever the method (AI or not). So:
- **No** templated pages per zodiac sign × line, per city, per gender ("heart line for female"), per age, per name.
- A variation gets its own URL only if it has clear separate demand (≥ ~200 US searches/month or strong autocomplete) **and** ≥ 1,000 useful unique words + its own images (like `/life-line/broken/`). Otherwise it's an H3 in the pillar.
- Tool results never create indexable URLs.
- Publishing pace after launch: ≤ 5–8 new guides a week, each human-reviewed (Hindi: owner-reviewed). No bulk AI translation publishing.

### 3.10 Google Discover + Images opportunities
- Images: "palm reading chart", "palmistry images", "palm diagram", "with pictures", "हस्त रेखा चित्र सहित", "भाग्य रेखा फोटो", "विवाह रेखा की फोटो" — original labelled diagrams on every guide (one master chart on `/hand-lines/`).
- Discover (curiosity, evergreen): M on palm, rare lucky signs, simian line, hand types quiz result, "what your hand shape says", fish/trident signs (Hindi). Needs ≥1200 px image + `max-image-preview:large` + an honest, non-clickbait title (Discover policies penalise sensational/misleading titles).
- Video later (60–90 day): 60–90 s YouTube shorts "find your heart line in 30 seconds" embedded on pillars with `VideoObject` — YouTube shows up in "palm reading lines" and Hindi playlists rank for "hast rekha".

### 3.11 Tracking in Search Console
- Domain property (covers apex, www, http/https). Add Bing Webmaster Tools (import from GSC) and turn on Cloudflare Crawler Hints / IndexNow (Bing, Yandex).
- Search Console has no saved "page groups"; use **Performance → Page → Custom (regex)** filters and bookmark the URLs (or a Looker Studio report):

| Group | Regex |
|---|---|
| Home (reading) | `^https://<host>/$` |
| Hindi | `/hi/` |
| Core line pillars | `/(heart|head|life|fate)-line/` |
| Hubs | `/(hand-lines|palm-reading)/$` |
| Honest YMYL | `/(marriage-line|children-line|simian-line|mercury-line|is-palmistry-real)/` |
| Tools | `/tools/` |
| Blog | `/blog/` |
| App page | `/app/$` |

- Query side: filter out the brand (regex `palm read ai|palmreadai`) to see non-brand growth; use the branded-query filter if the property shows it.
- Turn on the free BigQuery bulk export on day 1 (keeps data beyond 16 months, per-URL detail).
- Page-indexing report per sitemap (3.4) — watch "Crawled – currently not indexed" on P2 pages as a quality signal.
- **App Links effect:** on Android phones with our app installed, taps on the 6 App Link paths open the app. Search Console still counts the click, but web analytics won't see a visit — expect GSC clicks > web sessions on those pages. Measure the app side with Play Console `utm_source=web`.

### 3.12 30 / 60 / 90-day SEO roadmap
**Days 0–30 (launch + foundations)**
- Ship P1 (home, 2 hubs, 4 pillars, `/life-line/broken/`, is-real, which-hand), `/tools/` + line finder + photo checker + quiz, `/app/`, legal pages at their exact URLs, about/author/editorial-policy.
- Technical: sitemaps (split), robots, canonical/hreflang, breadcrumbs, schema validated (Rich Results Test + Schema validator), CWV budgets met in Lighthouse CI, 404 page, redirects.
- Original diagram set (master chart + ~40 variation SVGs).
- Hindi: `/hi/` home, `/hi/palm-reading/`, `/hi/hand-lines/` (owner-reviewed).
- GSC + Bing + BigQuery export; URL-inspect and request indexing for the P1 set once.
- Links: Play listing → site; our own social profiles; submit diagrams-with-licence to a few palmistry communities (no link buying).

**Days 31–60 (low-KD wins + Hindi pillars)**
- P2 in this order: career-palmistry (KD 5), marriage-line (KD 7), palmistry-m, money-line, hand-types (+quiz), simian-line, sun-line, palm-crosses, children-line, indian-palmistry, chinese-palmistry.
- Blog posts 1–5.
- Hindi: marriage (शादी/विवाह रेखा), fate (भाग्य रेखा), heart (हृदय रेखा), head (मस्तिष्क रेखा), life (जीवन रेखा), which-hand.
- First GSC pass: rewrite titles/metas of pages with impressions but CTR < 2 % at positions 1–10.
- Get the India keyword export; re-map Hindi targets with real volumes.

**Days 61–90 (depth + assets)**
- P3 pages, lucky-signs (+ Hindi signs page), palm-mounts, PDF lead magnet (English + Hindi), blog 6–7.
- Refresh P1 from GSC queries (positions 8–20). Add internal links from new pages to P1.
- First videos embedded on 4 pillars.
- Review "Crawled – not indexed" and thin pages; merge rather than add.
- KPIs to report (separately, per master plan): indexed pages / submitted, non-brand impressions and clicks by group, CTR by group, organic reading starts, store-button clicks by page (utm), Hindi share of impressions.

---

## 4. Hindi SEO

### 4.1 What people type (Google autocomplete, `hl=hi, gl=in`, 2026-09-26)
- **Hinglish (Latin script) is heavy for "do it" queries:** hast rekha scanner · hast rekha scanner online · hath ki rekha online check · hath ki rekha kaise dekhe (with photo / app / scanner / online free) · hast rekha app (in hindi / free download / ai hast rekha app) · palm reading in hindi free online · shadi ki rekha (konsi hoti hai / kaise dekhe / kaha hoti hai) · bhagya rekha (konsi / kaha / do mukhi) · santan rekha (konsi / in female hand) · dhan rekha (in hand for female / male) · hath me m ka nishan (ka matlab / dono hath / baye / dahine).
- **Devanagari is heavy for "learn" queries:** हस्तरेखा देखना चित्र सहित · हस्तरेखा ज्ञान (हिंदी / चित्र सहित / pdf / पुस्तक / कैसे सीखें) · हस्तरेखा शास्त्र (pdf / के अनुसार / में भाग्य रेखा) · हाथ की रेखा देखने का तरीका (pdf / चित्र / app) · हाथ की रेखाएं क्या बताती है / क्या कहती है / कैसे पढ़ें · शादी की रेखा (कहां / कौन सी / दूसरी शादी की रेखा) · विवाह रेखा (कितनी / की फोटो / दो मुखी) · भाग्य रेखा (के प्रकार / फोटो / पर त्रिशूल / पर क्रॉस) · हृदय रेखा (पर त्रिशूल / मछली / त्रिभुज / टूटी होना) · मस्तिष्क रेखा (के प्रकार / पर त्रिभुज / दो मुखी) · सूर्य रेखा (के प्रकार / पर मछली / त्रिशूल) · धन रेखा (चित्र सहित / कौन सी) · संतान रेखा (कहां / कौन सी) · ऑनलाइन हस्तरेखा स्कैनर free · हस्तरेखा app.
- **Mixed-script queries exist too:** "hath ki रेखाएं", "हस्तरेखा app", "dono हाथ में m का निशान".
- **Modifiers to cover in every Hindi page:** चित्र सहित / with photo · for female / for male (महिला / पुरुष) · कहां होती है / कौन सी है · pdf · app / scanner · signs on lines (त्रिशूल trident, मछली fish, त्रिभुज triangle, क्रॉस cross, चतुर्भुज square) · दो मुखी (forked).
- **Trap:** "जीवन रेखा" / "jeevan rekha" autocomplete is almost all a hospital brand (Jeevan Rekha Hospital, Jaipur). Target "हाथ में जीवन रेखा", "जीवन रेखा का चित्र", "life line in hindi" instead of the bare term.
- **Who ranks (WebSearch sample):** hi.wikipedia "हस्तरेखा शास्त्र", a YouTube Hindi playlist, a Jain library PDF, astrohandlines.com ("Hath Ki Rekha Kaise Dekhe | हाथ की रेखा देखने का तरीका | चित्र सहित"), sanskritexam.com (PDF), hindiraj.net ("हस्तरेखा का ज्ञान – … (चित्र सहित) | Hast Rekha Gyan (Palmistry in Hindi)"), thesimplehelp.com ("हस्त रेखा देखने की विधि चित्र सहित | Hast Rekha Gyan in Hindi With Picture"). → **The ranking Hindi pages use mixed Devanagari + Hinglish titles**, blog-style, no tools. Nobody offers a working Hindi scanner with traced lines (matches competitor files: none of the five has indexed Devanagari pages).

### 4.2 Decision: script and URL strategy
| Element | Choice | Why |
|---|---|---|
| Body text | Devanagari Hindi (simple, spoken style), key terms with Hinglish/English in brackets on first use: "हृदय रेखा (Heart Line / hriday rekha)" | Learn-intent queries are Devanagari; brackets catch Hinglish matches naturally |
| Title | Devanagari first + Hinglish phrase after a separator, ≤ ~55 chars (Devanagari is wider) | Exactly what ranking Hindi pages do; one page catches both scripts |
| Meta description | Devanagari, with one Hinglish phrase | CTR for both groups |
| H1 | Devanagari; a small Hinglish subtitle line under it | |
| FAQ questions | Devanagari; 1–2 questions written the way people type in Hinglish ("hath ki rekha kaise dekhe?") | Mirrors autocomplete |
| URL slug | **English slug under `/hi/`** (`/hi/heart-line/`) | Required: the app router only opens `/hi/<english-slug>`; ASCII URLs stay readable when shared on WhatsApp (Devanagari URLs turn into `%E0%A4…`) |
| Hindi-only pages | ASCII Hinglish slug (`/hi/hast-rekha/`) | Readable, no App Link needed |
| Separate Hinglish pages | **No** | Would duplicate the Devanagari page; mixed titles cover both |
| hreflang | `hi` ↔ `en`, `x-default` → English | 3.3 |
| Structured data | same types, `inLanguage: "hi"`, Hindi headline/description | |
| Font | Noto Sans Devanagari (subset), only on `/hi/` | CWV |

Example titles (Hindi):
- `/hi/` — `फ्री हस्तरेखा स्कैनर ऑनलाइन | Hast Rekha Scanner` 
- `/hi/palm-reading/` — `हाथ की रेखा कैसे देखें (चित्र सहित) | Hath Ki Rekha`
- `/hi/hand-lines/` — `हाथ की रेखाएं और उनका मतलब | Hast Rekha Gyan`
- `/hi/marriage-line/` — `शादी की रेखा (विवाह रेखा) कहां होती है? सच जानें`
- `/hi/fate-line/` — `भाग्य रेखा: कहां होती है, प्रकार और फोटो | Bhagya Rekha`
- `/hi/hast-rekha/` — `हस्तरेखा शास्त्र क्या है? | Hast Rekha Shastra`

### 4.3 Hindi page map and translation order
| # | Hindi URL | English twin | Main Hindi / Hinglish targets | Why this order |
|---|---|---|---|---|
| 1 | `/hi/` | `/` | ऑनलाइन हस्तरेखा स्कैनर free · hast rekha scanner online · hath ki rekha online check · palm reading in hindi free online | The unique thing we have (working scanner); strong "scanner/online/app" autocomplete |
| 2 | `/hi/palm-reading/` | `/palm-reading/` | हाथ की रेखा कैसे देखें · hath ki rekha kaise dekhe · हस्तरेखा देखना चित्र सहित · हस्त रेखा ज्ञान चित्र सहित | Biggest learn cluster; App Link path |
| 3 | `/hi/hand-lines/` | `/hand-lines/` | हाथ की रेखाएं क्या बताती है · palmistry lines in hindi · हस्तरेखा ज्ञान | Hub; App Link path |
| 4 | `/hi/marriage-line/` | `/marriage-line/` | शादी की रेखा · विवाह रेखा · shadi ki rekha konsi hoti hai · दूसरी शादी की रेखा | Very strong Indian demand; our honest version stands out |
| 5 | `/hi/fate-line/` | `/fate-line/` | भाग्य रेखा · bhagya rekha · भाग्य रेखा के प्रकार / फोटो | App Link path; strong autocomplete |
| 6 | `/hi/heart-line/` | `/heart-line/` | हृदय रेखा · हृदय रेखा टूटी होना · हृदय रेखा पर त्रिशूल | App Link path |
| 7 | `/hi/head-line/` | `/head-line/` | मस्तिष्क रेखा · के प्रकार · दो मुखी | App Link path |
| 8 | `/hi/life-line/` | `/life-line/` | हाथ में जीवन रेखा · जीवन रेखा का चित्र · life line in hindi | App Link path; bare term is a hospital brand |
| 9 | `/hi/which-hand-to-read/` | `/which-hand-to-read/` | palm reading for female which hand · महिला का कौन सा हाथ देखें | "for female" everywhere |
| 10 | `/hi/palmistry-m/` | `/palmistry-m/` | hath me m ka nishan · हाथ में M का निशान | Strong Hinglish autocomplete; Discover |
| 11 | `/hi/money-line/` | `/money-line/` | धन रेखा · dhan rekha in hand | |
| 12 | `/hi/lucky-signs/` | `/lucky-signs/` | हाथ में त्रिशूल / मछली / त्रिभुज का निशान | Signs appear on every line in Hindi autocomplete — Hindi may outperform English here |
| 13 | `/hi/children-line/` | `/children-line/` | संतान रेखा · santan rekha | Honest version |
| 14 | `/hi/hast-rekha/` | `/indian-palmistry/` | हस्तरेखा शास्त्र · hast rekha shastra · हस्तरेखा विज्ञान | Culture hub |
| 15 | `/hi/palm-reading-pdf/` | `/palm-reading-pdf/` | हस्त रेखा ज्ञान pdf · हाथ की रेखा देखने का तरीका pdf · hast rekha book pdf | PDF demand is much stronger in Hindi than English → best email lead magnet for India |
| 16 | `/hi/app/` | `/app/` | hast rekha app · हस्तरेखा app · ai hast rekha app | Supports Play ASO |
| — | `/hi/tools/` | `/tools/` | हस्त रेखा स्कैनर इन हिंदी | With the tools |

Rule: a Hindi page goes live only after the owner (or a named Hindi reviewer) reads it. Not machine-published.

---

## 5. Open items for the owner
1. Approve the tool-URL change (embed topic tools in their guide; only 3 standalone tool pages).
2. Decide AI training bots (allow/block) and whether the PDF file itself is indexable.
3. India keyword export (to put volumes on section 4.3).
4. Name a real author and a Hindi reviewer for the E-E-A-T pages.
5. App change before App Links: map `/<line>/*` (e.g. `/life-line/broken/`) to the line's lesson.
6. 10-minute manual Google US SERP check (section 0) before launch.
