# CONTENT_GUIDE — PalmSays (palmsays.com)

**What this is:** how every word on PalmSays is written: voice and tone in English and Hindi, the honesty rules, the fixed templates for guides, tool pages and blog posts, word counts, sources, the review workflow, banned claims, and examples.

**Read with:** `KEYWORD_MAP.md` (what the page targets) and `SEO_PLAYBOOK.md` (titles, headings, schema). **Precedence:** owner decisions (`WEBSITE_MASTER_PLAN.md` §15b) > this file > the research files. **Content must agree with the app's palmistry knowledge** (read-only, in `D:\palm ai\palm-ai-new--feat-m1-foundation`): `src/features/engagement/lessons.ts`, `src/features/knowledge/` (rules, sources, hand roles), `tools/extract/citations.ts` (blocked claims), `web/guides/content.mjs` (the existing EN + HI guide drafts).

**Status:** v1, 2026-09-26. Author: **Deepak Chauhan** (founder; full bio pending). Hindi reviewer: **not yet named**. India keyword data: pending.

---

## 1. Who we write for (R10 §2)

- **Sunita**, 34, Hindi-first, small town, low-end Android: needs simple Hindi, a clear "free" answer and no fear.
- **Priya**, 27, urban, English: wants it quick, pretty and honest about what's paid.
- **Jessica**, 31, US, iPhone: curious; needs the honest iPhone note.
- **Rahul**, 29, the skeptic: will leave at the first fake claim; stays for sources.
- **Neha**, 26, anxious about love, marriage or career: arrives scared; the first sentence must calm her.
- **Anjali**, 45, a returning learner: wants depth, diagrams and the PDF.

Write so Neha is calmed, Rahul finds nothing false, and Sunita understands every sentence.

---

## 2. Voice and tone: English

- **Calm, warm, plain.** A well-read friend who knows the old books, not a mystic and not a lecturer.
- **Short sentences** (aim for ≤ 18 words), active voice, "you". Explain a term on first use.
- **Attribute, never predict:** "Palmistry books read this as…", "In the tradition…", "Cheiro reads…". Never "you will" or "this means you are".
- **Specific over vague:** "a line that curves up towards the index finger", not "a special line".
- **No mystic purple prose:** no "ancient secrets", "the cosmos", "destiny revealed". No fear words (§11).
- **"We"** = PalmSays. No fake first-person expertise ("I've read thousands of hands"); palmist.io did this with no named author (R01).
- **Spelling:** British (colour, analyse), matching the site's UI copy. Keep searched keyword phrases exactly as people type them.
- **Headings** in sentence case. Brand: **PalmSays** (one word, capital P and S). "The app" = the PalmSays Android app.
- **Numbers:** digits. No statistic without a cited source.

---

## 3. Voice and tone: Hindi

| Element | Rule |
|---|---|
| Body | **Devanagari**, simple spoken-style Hindi, warm "आप". Everyday words (फ़ोटो, ऐप, रीडिंग, ऑनलाइन are fine). "रीडिंग", never "क्रेडिट". Avoid heavy Sanskrit except established terms (हृदय रेखा, पर्वत). |
| Key terms | First use with Hinglish/English in brackets: "हृदय रेखा (Heart Line / hriday rekha)". |
| Title | Devanagari first, then a Hinglish phrase after a `\|` separator, ≤ ~55 characters. Keep the spelling people type ("फोटो", "फ्री"). |
| H1 | Devanagari, with a small Hinglish subtitle line under it. |
| Meta | Devanagari with one Hinglish phrase. |
| FAQ | Devanagari, plus 1–2 questions written the way people type in Hinglish ("hath ki rekha kaise dekhe?"). |
| Hinglish (Latin script) | Only where search demands it: the title suffix, the subtitle, 1–2 FAQ questions. Never whole paragraphs. No separate Hinglish pages. |
| Translation | **Write Hindi as Hindi**, not line by line from English, but with the **same claims and the same hedges**, nothing added (the app's `meaningHi` rule). No machine translation is ever published unread. |
| Spelling | Body text uses one consistent nukta style (फ़ोटो, मुफ़्त, ज़्यादा) [rec; the reviewer decides]. |
| Numbers | Latin digits in body text (1, 2, 3). Devanagari numerals (१ २ ३) only as decorative step badges. |
| Alt text, errors, buttons | In Hindi on Hindi pages. |
| Links to English-only pages | Mark them "(English)", e.g. "क्या हस्तरेखा सच है? (English)". |

**Line and sign names** (from `lessons.ts` and R11 §4.1):

| English | Hindi | Hinglish |
|---|---|---|
| Heart line | हृदय रेखा | hriday rekha |
| Head line | मस्तिष्क रेखा | mastishk rekha |
| Life line | जीवन रेखा (search: "हाथ में जीवन रेखा") | jeevan rekha |
| Fate line | भाग्य रेखा | bhagya rekha |
| Sun line | सूर्य रेखा | surya rekha |
| Mercury line | बुध रेखा | budh rekha |
| Marriage line | विवाह रेखा / शादी की रेखा | vivah rekha / shadi ki rekha |
| Children lines | संतान रेखा | santan rekha |
| Money line | धन रेखा | dhan rekha |
| Mounts | पर्वत: गुरु, शनि, सूर्य, बुध, शुक्र, चंद्र, मंगल | parvat |
| Signs | त्रिशूल (trident), मछली (fish), त्रिभुज (triangle), क्रॉस, चतुर्भुज (square), द्वीप (island), तारा (star) | trishul, machhli |
| Forked | दो मुखी / दो शाखाएँ | do mukhi |
| Palmistry | हस्तरेखा / हस्त रेखा शास्त्र | hast rekha (shastra) |

**Hindi words** (R10 §6.5): use परंपरा में माना जाता है, झुकाव, स्वभाव, दौर, दिशा में बदलाव, इस फ़ोटो में साफ़ नहीं, खुद को समझना. Never the Hindi column of §11.

---

## 4. Honesty and YMYL rules

These are the brand. A page that breaks one does not publish.

**4.1 Never predict.** No dates or ages (marriage age, "by 35"), lifespan or death, health, illness or fertility, divorce or number of marriages, whether or how many children, money amounts or wealth outcomes. No prediction tools (owner): no marriage-age, children-count, lifespan or compatibility calculators.

**4.2 The app's blocked claims apply here too.** The app's extraction keeps a register of book statements it refuses to turn into meanings (`tools/extract/citations.ts`, `BLOCKED_CLAIMS`). The same 7 types are banned on the site:

| Type | Example from the books (never repeat as a meaning) |
|---|---|
| death or lifespan | "very often suffer a violent death" |
| medical | "breaks in the Heart Line indicate weakness of the heart" |
| guaranteed financial outcome | "a sign of poverty and want" |
| fatalistic harm | "a certain sign that some terrible tragedy…" |
| criminality | "threatens imprisonment" |
| character accusation | "a vain and lying fellow" |
| gender destiny | statements about a woman's fate from a line |

A famous scary reading may be **named only to take it apart** ("Some books call this a divorce sign. It can't tell that."), and only where people search for it.

**4.3 Tone rules for sensitive meanings** (R10 §6.2):
1. Answer the fear calmly in the **first sentence**.
2. Normalise: "This is very common."
3. Attribute, never predict.
4. No dates, ages, lifespan, illness, divorce, children count or money amounts.
5. Name a scary folk reading only to take it apart.
6. Give the photo explanation when true: light, a crease or the crop can make a line look broken or short.
7. End with agency: something the person controls.
8. Always include the "What palmistry can't tell you" box.
9. No remedies for sale: no gems, pujas, mantras.
10. Visual calm: no red, no warning icons; every line keeps its normal colour.
11. Hindi: warm "आप", everyday words.
12. **Care line** only on lifespan and death-anxiety pages (`/life-line/`, `/life-line/broken/`, `/blog/can-palm-reading-predict-death/`), small, at the end of the limits box: Tele-MANAS **14416** (India, free, 24×7), **988** (US).

**4.4 The three-part block** for every sensitive meaning: (1) what we see; (2) what the tradition says, attributed; (3) what it can't tell you, and what you can do.

**4.5 Traditions differ: show both.** When books read one feature in opposite ways, the app shows both side by side (conflict groups). Do the same: "Cheiro reads … ; Dale's *Indian Palmistry* reads …". Never quietly pick one. Example: traditions disagree about which end of the heart line to read from.

**4.6 Say what a photo can't show.** Breaks, branches and forks show up in a good photo. Islands, chains, crosses, stars, squares and triangles are too small for most phone cameras; the app observes them but leaves them out of reports. Tools and guides must say so. When a line is unclear, the honest answer is "not clear in this photo".

**4.7 Medical topics.**
- **Simian line:** the medical facts come **first**, sourced at MedlinePlus / UF Health level: the single palmar crease is usually a normal variation and, on its own, is not a diagnosis; doctors only look at it together with many other signs; any worry → a doctor. Use "single palmar crease" as the respectful medical name and "simian line" as the search term. Give any prevalence figure exactly as the cited source states it. Never list conditions as "predictions".
- **Mercury line** ("health line"): explain the old name, never read it as health; a "not a medical test" note at the top.
- **Life line:** length is never read as lifespan. The app's life-line rules carry no health or lifespan reading, whatever the books say.

**4.8 AI and product claims.** True: "AI traces the lines on your photo"; "the meanings come from a fixed rule set built from classical palmistry books, each with its source". Never: "AI palmist", "AI predicts", "accurate", "scientific", "trained on 1,000+ ancient texts", "world's first". Don't say the rule set is "reviewed by experts": every corpus rule in the app is still `draft` (its review log is empty).

**4.9 Free, prices and proof.** Every "free" says exactly what is free ("your first reading", "2 of 4 parts") and comes from `site.ts`. The app's price sits next to every store button. No invented counts, ratings, reviews, testimonials, "was" prices or timers. The Play rating appears only at ≥ 4.0★ with 100+ ratings, live and linked.

**4.10 Religion:** one neutral line where people ask ("Views differ between faiths; we don't take a side"). Never argue theology.

**4.11 The limits box.** Default text, then add the topic line.
- **EN default:** "**What palmistry can't tell you.** Palm lines can't tell dates, how long you'll live, your health, whether or when you'll marry, how many children you'll have, or how much money you'll make. Palmistry is a tradition for reflection, not a science. [Is palmistry real?](/is-palmistry-real/)"
- **HI default:** "**हस्तरेखा क्या नहीं बता सकती।** हाथ की रेखाएं कोई तारीख़, आपकी उम्र, आपकी सेहत, शादी कब होगी, कितने बच्चे होंगे या कितना पैसा आएगा — ये बातें नहीं बता सकतीं। हस्तरेखा खुद को समझने की एक परंपरा है, विज्ञान नहीं।" [needs the Hindi reviewer]
- **Topic lines:** heart — "who your partner will be or how a relationship will turn out"; life — "the life line's length is not read as lifespan; for health, talk to a doctor"; marriage — "no line gives a marriage age, a number of marriages or a divorce; a relationship depends on the two people in it"; children — "whether you'll have children or how many depends on life, health and choice, not on lines"; simian and Mercury — "this is not a diagnosis; for any health worry, see a doctor"; money and career — "no line predicts income, a job or success".

---

## 5. Guide template (fixed blocks, in this order)

Every guide, English or Hindi. Each block must earn its place (plan §7.2, §11.1). **Change from the plan:** block 11 is a **tool card** that links to the tool's own page; guides never embed a tool (owner decision: one canonical home per tool).

| # | Block | Rule |
|---|---|---|
| 1 | Breadcrumb | Logical trail: Home › Palm lines › Heart line |
| 2 | H1 + one-line subtitle | Hindi pages: a small Hinglish subtitle |
| 3 | Byline | "Written by Deepak Chauhan" (once his author page is live; before that "Written by the PalmSays team") · "Reviewed by {name}" **only** if a real person reviewed it · "Last reviewed {date}" |
| 4 | Answer first | ≤ 40 words that answer the page's main question. On YMYL pages, this answers the fear. |
| 5 | Header image | The line traced on a real, consented sample photo; until those exist, a labelled SVG marked "diagram" |
| 6 | Quick facts card | Hindi and Sanskrit name, other names, where it sits, what the tradition reads it for, which hand |
| 7 | Small inline CTA | "Find your heart line on your own photo" → the home upload card |
| 8 | TOC | Collapsible chip on mobile, side list on desktop |
| 9 | Sections | H2 = the questions people type; each answered in its first sentence. YMYL: the fear H2 comes first |
| 10 | Variation cards | One per type: SVG thumbnail, the meaning in our words, a source chip. Stacked on mobile |
| 11 | **Tool card** | "Which heart line do you have? Try the heart line finder →", a static thumbnail and the tool's honesty label. Links to `/tools/<slug>/` |
| 12 | Myth vs reality | Common myths answered, with sources |
| 13 | Limits box | §4.11, links to `/is-palmistry-real/`. The care line follows it on lifespan pages only |
| 14 | Photo tips | Links to `/tools/palm-photo-checker/` |
| 15 | FAQ | 3–8, `<details>`, owned questions only (KEYWORD_MAP) |
| 16 | Sources box | Every book and study used on the page (§9) |
| 17 | Step n of 7 pager | Only the 7 core steps: which hand, hand shape, heart, head, life, fate, mounts and signs |
| 18 | End block | Gold "Read my palm free"; the Play badge (QR on desktop) with the price line from config |
| 19 | Related guides | 3–4, from the related-link groups (SEO_PLAYBOOK §11) |

---

## 6. Tool-page content template

For all 12 tools (tool 1 is home and follows the home layout in plan §7.1). The tool comes first; real content sits under it so no page is thin.

| # | Block | Rule |
|---|---|---|
| 1 | Breadcrumb | Home › Tools › {tool} |
| 2 | Icon tile, H1, one-line promise | H1 phrased as a benefit or the question (SEO_PLAYBOOK §5) |
| 3 | **Honesty label** | Directly under the H1. Only photo tools say AI (the `tool-page` skill has the exact labels) |
| 4 | **The tool** | Directly under the label. Photo tools: the privacy note sits under the button |
| 5 | Result, in place | A result card: the meaning in our words, the source chip, "See your real line" → home upload. No result creates a URL |
| 6 | H2 How it works | 3 true steps. Say what runs where (on the phone, or sent to our servers) |
| 7 | H2 What palmistry says | Each type in ≤ 2 sentences, with its source; a link "Read the full {line} guide". Never paste the guide's variation cards |
| 8 | H2 What this tool can't tell you | §4.11 plus the tool's own limits; link to `/is-palmistry-real/` |
| 9 | H2 FAQ | 3–6 questions about using the tool; not the guide's FAQ |
| 10 | Links | The matching guide, the free reading (home), 2–3 related tools |
| 11 | End block | Device-aware store button with the price line from `site.ts`; "Only from Google Play" |
| 12 | Other tools list | Sticky on desktop |

400–900 words below the tool. Tools 4–7 share this template, so each must have its own line-specific "how to spot it", types, limits and FAQ; shared boilerplate ≤ 30% [rec].

---

## 7. Blog post template

Breadcrumb · H1 (the question) · byline and dates · answer first (≤ 40 words) · TOC · sections with one diagram per major section · a mid-post inline CTA to the matching tool or pillar · FAQ · sources · end block · links to 1 pillar and home, plus up to 3 related posts (plan §7.8).

- **Comparison post** (`/blog/best-palm-reading-apps/`): disclose at the top that PalmSays is our app; test every app the same way; state what each one really does and costs, with the date checked; no affiliate links unless disclosed.
- **Fear post** (`/blog/can-palm-reading-predict-death/`): "No" in the first sentence, the three-part block, the care line, owner OK.

---

## 8. Word counts (from the SERP study, R11 §1–2)

| Page | Target at SERP depth | P1 first version |
|---|---|---|
| Home (below the tool) | 900–1,400 | same |
| `/hand-lines/`, `/palm-reading/` | 2,500–3,500 / 2,500–3,300 | compact but complete |
| Heart / life / fate / head pillars | 2,200–3,000 / 2,200–3,000 / 2,000–2,800 / 1,800–2,500 | compact but complete |
| `/is-palmistry-real/` | 1,800–2,500, every claim cited | full |
| `/which-hand-to-read/` | 1,200–1,800 | full |
| `/life-line/broken/` | 1,200–1,800 | — |
| Marriage, hand types, Indian palmistry | 1,800–2,500 | — |
| Career, Chinese | 1,500–2,200 | — |
| Simian, lucky signs, mounts, history | 1,500–2,000 | — |
| M, money, sun, crosses | 1,200–1,800 | — |
| Fingers / children / Mercury | 1,200–1,600 / 1,000–1,500 / 1,000–1,400 | — |
| Tool pages / `/tools/` / `/app/` | 400–900 / 400–600 / 600–1,000 | same |
| Blog posts | 1,000–1,800 | — |

Ranking guides run 1,100–3,600 words (median ≈ 1,650). **Complete, not padded:** a shorter complete page beats a long padded one. P1 pages start from the app's `web/guides/content.mjs` text plus sources and grow in the days 31–60 refresh.

---

## 9. Sources and citations

### 9.1 Facts that must match the app

| Topic | What the app says (source file) |
|---|---|
| Hast Rekha Shastra | Reads the lines, mounts and shape of the hand; "often described as part of Samudrika Shastra" (keep the hedge). Reflection, not prediction. (`lessons.ts` basics) |
| Heart line | The uppermost major line, just below the fingers, from the little-finger edge towards the index or middle finger. Read for emotional life and how a person relates to others. Traditions disagree about which end to read from. (`lessons.ts` heart; `content.mjs`) |
| Head line | Crosses the middle of the palm; often begins together with the life line, then separates. Straighter = practical thinking; curving = imagination; a fork at the end = seeing more than one side. (`lessons.ts` head) |
| Life line | Curves around the base of the thumb, from between thumb and index finger towards the wrist. Read for vitality, stability and meeting change. A short life line is **not** a short life. (`lessons.ts` life; `corpus-rules.ts` header) |
| Fate line | Runs up the middle of the palm towards the middle finger. Read for direction, work and purpose. Often faint or missing: common, not a bad sign. (`lessons.ts` fate) |
| Mounts (parvat) | Guru/Jupiter under the index finger — ambition; Shani/Saturn under the middle — responsibility; Surya/Sun under the ring — creativity; Budh/Mercury under the little — communication; Shukra/Venus at the thumb's base — warmth; Chandra/Moon on the outer edge — imagination; Mangal/Mars — courage. **Name the two Mars mounts by position** ("near the thumb", "on the outer edge"): the app's labels are the reverse of Cheiro's. (`lessons.ts` mounts; `corpus-rules.ts` header) |
| Which hand | The writing hand is read as the life you are making; the other as what you started with. The book (Cheiro, *Palmistry for All*, 1916, Part I ch. XVII) says it of the right and left hand; mapping it to the writing hand is later convention, so write "in palmistry tradition", not "Cheiro says". Both hands used, or not known: the hand is read on its own. (`hand-role.ts`) |
| Marks | Breaks, branches and forks are what the app reads. Islands, chains, crosses, stars, squares, triangles and tassels are observed but excluded from reports (too small for phone photos). (`observation/taxonomy.ts`, `lessons.ts` honest) |
| What the app reads | Rules exist for the heart, head, life, fate and sun lines and the mounts. **No rules** for marriage lines, children lines, the Mercury line, the simian line, M, crosses, stars, fish, triangles, hand types or fingers (§9.4). |
| Report | 4 parts: love and relationships, personality, career and money, life direction. The free web reading opens 2 in full and shows the first sentence of the other 2 (plan §4.7). |

If a guide and the app disagree, the app wins, or the disagreement goes to the owner. Never publish a contradiction.

### 9.2 The books (from the app's `src/features/knowledge/sources.ts`)

| Book | Rights (app) | May we quote? |
|---|---|---|
| Cheiro, *Palmistry for All* (1916) | public domain | Yes, short |
| Cheiro, *Cheiro's Language of the Hand* (1900 edition in the corpus; first published 1894) | public domain | Yes, short |
| Cheiro, *Cheiro's Guide to the Hand* (1900) | public domain | Yes, short |
| Leo Markun, *What You Should Know About Palmistry* (1927) | public domain | Yes, short |
| Mrs J. B. Dale, *Indian Palmistry* (1895) | public domain | Yes, short |
| Henry Frith, *Practical Palmistry* (1895) | public domain | Yes, short |
| Edward Heron-Allen, *A Manual of Cheirosophy* (1885) and *Practical Cheirosophy* (1887) | public domain | Yes, short |
| Adolphe Desbarrolles, *Chiromancie nouvelle* (1859, French) | public domain | Yes, short, translated and marked as our translation |
| W. G. Benham, *The Laws of Scientific Hand Reading* (1900) | **unknown** | **No:** facts only, in our words. (The plan calls it public domain; the app says unknown, and the app wins.) |
| Albert Raphael, *Cheirosophy* (1901) · Comte C. de Saint-Germain, *The Practice of Palmistry for Professional Purposes* (1900) · Katharine St. Hill, *The Grammar of Palmistry* (1893) · Louis Williams, *Key to Palmistry* (1902) | unknown | No: facts only |
| Chhotelal Jain, *Samudrik Shastra ya Bhagya Nirnay* (1927, Hindi) | unknown | No: facts only |
| "Hast Rekha Shastra (general tradition)" | a placeholder in the app, not a book | **Never cite it.** Cite a book, not "the tradition". |

### 9.3 How to cite
- **Every meaning has a source chip:** author, title, year, locator. Example: "Cheiro, *Palmistry for All* (1916), Part I, ch. VII".
- For line meanings, the page's front matter lists the app's `ruleIds`; the build pulls each rule's citation from the synced `lib/palm`, so the site and the app cite the same passage. `check-site` fails on an unknown `ruleId`.
- The meaning is in **our own words**. A quote is allowed only from a public-domain book, ≤ 25 words, in quotation marks, with its locator, and never if it is a blocked claim (§4.2).
- The sources box at the end lists every book and study used on the page.

### 9.4 Topics with no app rule
Marriage lines, children lines, the Mercury line, simian line (palmistry side), M, crosses, stars, fish, triangles, hand types and fingers have no rule in the app.
- Read the chapter in the corpus text (app repo, read-only: `knowledge/raw/<tradition>/`) and cite book + chapter in `sources[]` with `ruleIds: []`. The fact-checker opens the same passage.
- If no corpus book covers the claim, don't write "the tradition says". Cite a named modern book (facts only) or drop the claim.
- **Hand types:** the earth / air / fire / water system is usually credited to 20th-century palmistry (Fred Gettings, *The Book of the Hand*, 1965 [verify]) and is not in the corpus. The corpus books use the older seven types (elementary, square, spatulate, philosophic, conic, psychic, mixed) [verify in Cheiro]. Settle the source before `/hand-types/` and tool 9 publish.

### 9.5 Science and medical sources
- `/is-palmistry-real/`: every claim cited to a peer-reviewed or reputable source (for example the Forer 1949 study for the Barnum effect; a medical or embryology source for how flexion creases form).
- Simian line: MedlinePlus or UF Health level. Link sources normally (not `nofollow`).

### 9.6 Never
Invent a source, quote, page, chapter or statistic ("80% of people…"). Cite a book you didn't open. Cite Wikipedia or an encyclopedia as the source of a meaning (palmreading.pro did, R03). Cite a competitor.

---

## 10. Review workflow

| # | Step | Who | Done when |
|---|---|---|---|
| 1 | Brief | Claude | Keyword and owned secondaries from KEYWORD_MAP; outline and FAQ from SEO_PLAYBOOK and R11 autocomplete |
| 2 | Draft | Claude | Written from `lessons.ts`, `content.mjs`, the rules and the books; every meaning carries a `ruleId` or a book citation |
| 3 | Automatic checks | `check-site` | Lengths, one H1, canonical, hreflang pairs, links, sitemap, `LimitsBox` on YMYL pages, banned words, no age/count/date predictions, `ruleIds` exist, `updated` ≥ `published` |
| 4 | **Fact check against the app** | Claude (a separate pass), then the English reviewer if one is named | Each meaning matches its rule's claim and hedge; §9.1 facts match; no blocked claim; tool result texts equal the rule meanings; no-rule topics checked against the book passage |
| 5 | Hindi | Written as Hindi from the checked English; read in full (body, alt, meta, FAQ, errors) by **the named Hindi reviewer, or the owner until one is named** | `reviewedBy` (hi) set with name and date |
| 6 | Owner OK | Owner | Required for marriage, children, lifespan (`/life-line/`, `/life-line/broken/`, blog 7), simian and Mercury pages |
| 7 | Publish | — | ≤ 8 new indexable URLs a week in total |
| 8 | Refresh | Claude + owner | SEO_PLAYBOOK §18; when the app's rules change (`sync-palm-lib`), re-check pages whose `ruleIds` changed |

Front-matter `status` moves: `draft` → `checked` → `hi-reviewed` (Hindi only) → `owner-ok` (YMYL only) → `published`. A page never skips a step.

**Anti-thin and anti-scaled rules** (SEO_PLAYBOOK §15): no templated page sets; a variation gets a URL only if it passes the new-URL test; tool results never create URLs; no bulk machine translation; every page must answer something no other PalmSays page answers.

---

## 11. Banned phrases and claims

| Never (EN) | Never (HI) | Why |
|---|---|---|
| you will, destined, guaranteed, certain, sure sign | आपके साथ होगा, तय है, पक्का | Prediction |
| danger, warning, bad sign, unlucky, misfortune | ख़तरा, चेतावनी, बुरा संकेत, दुर्भाग्य | Fear |
| death, early death, short life, death line | मृत्यु, अकाल मृत्यु, कम उम्र | Lifespan (except to deny it: "does not mean a short life") |
| divorce is certain, no marriage, second marriage (as a prediction), marriage age | तलाक तय, शादी नहीं होगी, दूसरी शादी होगी | Marriage prediction |
| number of children, sterile, infertile, son/daughter | कितने बच्चे होंगे, संतान नहीं होगी | Children / medical |
| illness names, heart disease, weak health | बीमारी के नाम, कमज़ोर सेहत | Medical |
| you'll be rich, poverty, money will come | धन आएगा, ग़रीबी | Money outcome |
| accurate, 100%, scientific, proven, NASA, trained on ancient texts, world's first | सटीक, 100%, वैज्ञानिक, सिद्ध | False proof |
| AI palmist, AI predicts your future, expert/master palmist (unless a real, named person) | AI ज्योतिषी | False authority |
| dosha, inauspicious, remedy, gemstone, puja, mantra (for sale or advice) | दोष, अशुभ, उपाय, रत्न, पूजा | Remedies |
| hurry, last chance, limited offer, only today, X people reading now, was ₹… | जल्दी करें, आख़िरी मौका, सीमित ऑफ़र | Dark patterns (CCPA 2023) |
| free (unqualified), unlock your destiny | मुफ़्त (बिना शर्त बताए) | Drip pricing |
| thief, liar, criminal, sensual (about a person from a line) | — | Character accusation |

Allowed: "आख़िरी मुफ़्त रीडिंग" / "your last free reading" (a plain fact). `check-site` scans for this list; a hit fails the build unless the sentence is a denial marked for review.

---

## 12. Examples

**Answer first**
- Good: "No. In palmistry, a short life line is not read as a short life. Palm readers link its length to energy and how you handle change, and a photo can make a line look shorter than it is."
- Bad: "Your life line holds the secrets of your destiny, and a short one may be a warning…"

**Three-part block: short life line** (R10 §6.4)
- EN: "Your life line looks short in this photo. That's very common — and in palmistry, the life line's length is **not** read as how long you'll live. Traditionally it's linked to your energy and how you handle big changes. A line can also look short when the photo crops it or the light is flat. *Palmistry can't tell your lifespan or your health — for health, talk to a doctor.*"
- HI: "इस फ़ोटो में आपकी जीवन रेखा छोटी दिख रही है। ऐसा बहुत लोगों में होता है — और हस्तरेखा में जीवन रेखा की लंबाई से उम्र **नहीं** आंकी जाती। परंपरा में इसे आपकी ऊर्जा और बड़े बदलावों को संभालने के तरीके से जोड़ा जाता है। फ़ोटो में रेखा कट जाए या रोशनी कम हो, तब भी रेखा छोटी दिख सकती है। *हस्तरेखा उम्र या सेहत नहीं बता सकती — सेहत के लिए डॉक्टर से बात करें।*"

**Taking a myth apart: "divorce line"**
- EN: "Some books call a broken or forked marriage line a 'divorce sign'. Many palm readers today don't read it that way — the small lines under your little finger can't tell anyone's future in a marriage. Traditionally a break is read as a phase that needs attention: talking, time, a change. A relationship depends on the two people in it, not on a line."

**FAQ answer**
- "**Can palm reading tell when I'll get married?** No. Palmistry books give marriage-line 'ages', but they disagree with each other, and no line can give a date. What the tradition does describe is *how* you love — and that's in your [heart line](/heart-line/)."

**Tool result card (heart line finder)**
- "**Forked heart line.** Many palmistry books read a fork at the end of the heart line as a balance of head and heart. *Source: {book, chapter from the rule}.* Traditional meaning, not AI. [See your real heart line →](/#read)"

**Myth vs reality**
- Myth: "No fate line means no luck." Reality: "Many palms show a faint fate line or none. That is common, and the tradition doesn't read it as a bad sign."

**Alt text**
- EN: "Forked heart line splitting into two branches under the index finger"
- HI: "तर्जनी के नीचे दो शाखाओं में बंटती हृदय रेखा" [needs the Hindi reviewer]
- Bad: "heart line palm reading heart line meaning palmistry"

**Hindi title**
- Good: "भाग्य रेखा: कहां होती है, प्रकार और फोटो | Bhagya Rekha"
- Bad: "Bhagya Rekha Kya Hai Full Detail In Hindi 2026" (Latin-only, dated, padded)

---

## 13. Front matter (content collections, plan §12.3)

Guides: `title` (≤ 60), `description` (≤ 155), `locale`, `slug`, `translationKey`, `pillar`, `isPillar`, `keywordCluster` {primary, secondary ≤ 15, usVolume, kd, inVolume}, `related` (≤ 6), `tool` (the tool page this guide links to), `appLesson`, `sources[]` {title, author, year, locator, url, ruleIds} (≥ 1), `reviewedBy` {name, role, date}, `published`, `updated`, `ymyl` (`none` | `marriage` | `children` | `lifespan` | `health`), `stepOf7`, `faq[]` (≤ 8), `heroImage`, `status`, `draft`, `noindex`.

Tools (YAML): `id`, titles and descriptions per language, `kind` (`photo-ai` | `photo-local` | `quiz` | `picker` | `map`), `usesAI`, `label`, `island`, `guide`, `relatedTools`, `faq`, `limits`, `howItWorks`, `sources`.

---

## 14. Open items

1. Deepak Chauhan's full bio and photo (for the author page and bylines).
2. A named Hindi reviewer; until then, the owner reads every Hindi page.
3. A citable source for the element hand types (§9.4).
4. The Hindi examples here and the limits-box Hindi need the Hindi reviewer.
5. Nukta style for Hindi body text (§3).
6. `[verify]` before claiming it: what Dale 1895 or Jain 1927 say about reading a woman's left hand.
