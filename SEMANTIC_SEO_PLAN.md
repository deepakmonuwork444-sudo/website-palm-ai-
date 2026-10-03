# SEMANTIC_SEO_PLAN — PalmSays (palmsays.com)

**What this is:** the plan to turn palmsays.com into a topical authority on palmistry. It uses Koray Tuğberk GÜBÜR's Topical Authority / Semantic SEO framework plus standard entity-SEO mechanics. It covers the entity graph, the topical map, a page-by-page gap audit of the real built site, the internal-link network, structured data, a 90-day publishing calendar, measurement, risks, and a phased to-do list.

**Status:** v1, 2026-09-28. **A plan only: no code, content or config was changed.** Nothing here overrides an owner decision. Where this plan wants to change something already decided in `KEYWORD_MAP.md`, `SEO_PLAYBOOK.md`, `CONTENT_GUIDE.md` or `DECISIONS.md`, it says so and lists it under §11 "Owner decisions". Each accepted item then needs a WEB-DEC row and a `PROJECT_MASTER.md` update in the session that builds it.

**Read with:** `KEYWORD_MAP.md` (which URL owns which query; still the source of truth for keywords), `SEO_PLAYBOOK.md` (on-page and technical rules), `CONTENT_GUIDE.md` (voice, honesty, YMYL, templates), `qa/seo-keyword-audit-2026-09-27.md` (keyword placement audit, mostly applied).

**Evidence used:**
- The built site: a preview build in `dist/`, 2026-09-28 14:39. No file in `src/` is newer than the build. Every page was parsed for title, meta, headings, first paragraph, links with their anchors, JSON-LD, images and gzip weight.
- The two raw keyword exports: `research/keywords-us.tsv` and `research/keywords-in.tsv`.
- Three research passes run on 2026-09-28:
  - (a) Koray's framework, from primary and secondary sources;
  - (b) Wikidata IDs and Google/schema.org rules;
  - (c) the top competitor pages for 8 core queries in the US and India.
- All links are in §12.

**Volumes:**
- Written as `volume/KD`. US and India numbers are never added together (WEB-DEC-034).
- `[unverified]` means the term is in neither export.
- `[verify]` means a fact to check before it goes on a page.

---

## 0. The short version (for the owner)

Google ranks a new site fast when it can see three things:
1. **One clear subject.** For us that is palmistry: reading your own palm.
2. **Every important part of that subject covered.** The lines, mounts, hand shapes, fingers, signs, which hand, traditions and science.
3. **Pages that fit together like a map**, all saying the same facts in the same words.

We already have strong line guides, but they have gaps:
- Some parts of palmistry are missing: mounts, minor lines like the girdle of Venus, the marks on the life and fate lines, and a glossary.
- The headings don't follow the "thing → property → value" order Google's systems read best.
- The structured data doesn't tell Google which real-world "things" each page is about.
- Many links use weak words ("Open the guide", "See what the app does").
- The palm chart is invisible to Google Images.

**The fix is 10 moves, in this order** (details in §10):
1. Before launch, the owner OKs the 3 sensitive guides. Without that, the live build refuses to build (§3.0).
2. Fix one wrong FAQ answer on the home page. It says the website reading is open, but it is not.
3. Give every page an "about" label that points to the real-world thing (its Wikidata ID where one exists), and link the author, the books and the editorial policy in the data.
4. Re-order the line guides' headings as line → question → type.
5. Fix the link words site-wide. One phrase always points to one page.
6. Grow `/hand-lines/` with the minor lines, Hindi names and a real chart image.
7. Add a "Palmistry terms" glossary page. It becomes the site's dictionary of every entity.
8. Move the line drawings into one shared file. This frees about 10 KB per guide, so we can add content without breaking the speed budget.
9. Publish new guides steadily, starting slow and speeding up, and never stop for more than a week. Order: mounts, hand types and fingers, sun line, signs, then traditions and history.
10. Publish Hindi pages in the order people search for them, each read by a person first.

---

## 1. Source context, central entity, central search intent

Koray's definitions (research pass a; primary: holisticseo.digital topical-map and topical-authority pages):
- **Source context:** why the site exists and how it makes money. It decides which attributes we cover and how deeply.
- **Central entity:** the one entity present in every section, in the boilerplate and in anchor variations.
- **Central search intent:** the source context and the central entity joined into one intent that runs through the whole site.

### 1.1 The three, written for PalmSays

| Concept | PalmSays |
|---|---|
| **Source context** | *An honest palm-reading product that traces the lines on your own palm photo and explains them from named classical palmistry books, Indian and Western, in Hindi and English.* We earn from the Android app's paid readings (web reading off at launch). **Two sides:** "your own palm, traced by AI", which is the product, and "honest, sourced tradition", which is the trust. |
| **Central entity** | **Palmistry** (palm reading) and its object, **the palm and its lines**. Other names the site must use consistently: palm reading, palmistry, chiromancy (older English), hand reading (India's "hand" wording), हस्तरेखा / हस्त रेखा शास्त्र (Hast Rekha Shastra), "often described as part of" सामुद्रिक शास्त्र (Samudrika Shastra) — keep that hedge (CONTENT_GUIDE §9.1). |
| **Central search intent** | **"Understand what the lines on my own palm mean, and see them on my hand."** Hindi: *"मेरे हाथ की रेखाएं क्या बताती हैं — मेरी अपनी हथेली पर।"* It has a know part (meaning, types, which hand) and a do part (check my hand, scan my palm, get the app). |
| **Topical centroid** (the concept that defines most others) | **Palm line** (रेखा). Lines explain mounts (a line starts or ends on one), signs (they sit on lines), which hand (you compare lines), and the product (it traces lines). |

### 1.2 How every page must show it (the "source context checklist")

Every indexable page, in either language, must:

1. **Name the central entity in the H1 or the answer-first sentence.**
   - A palm-part word: palm, palmistry, hand, हाथ, हथेली, हस्तरेखा.
   - Plus the page's own entity.
   - This already holds on all 28 pages audited.
2. **Anchor the topic on the reader's own hand.**
   - Guides: the "Find your line" module is where this happens. Keep it.
   - Tools: they already work on the visitor's photo or taps.
   - Outer pages (history, traditions, science) end with a bridge back to "your own palm" (§4.3).
3. **State the source.**
   - Every meaning is attributed to a named book (source chip).
   - Every science claim is attributed to a study.
   - This is our knowledge-based-trust (KBT) advantage over Astroyogi, InstaAstro and 99Pandit, which cite nothing (research c).
4. **State the limit once.**
   - One limits box, linking `/is-palmistry-real/`.
   - It must never be repeated across a page (CONTENT_GUIDE §5 v3).
5. **Offer the next step on the product.**
   - "Scan my palm" to `/reading/` (opens soon), or the Play store button, or the matching tool.
   - Not near medical facts (simian K10).
   - Not on topics the scan doesn't read (marriage: `find.cta: false`).
6. **Use the same values for the same attributes everywhere** (KBT). For example:
   - "The heart line starts at the little-finger edge."
   - "A short life line is not read as a short life."
   - "The app reads the four major lines, the sun line and the mounts."
   - These sentences must be word-identical in guide answers, the glossary, tool results, `llms.txt` and the app.

   §5.4 makes the glossary the single source of these sentences.

**What the source context rules out** (research c: it is why competitors are weak, and it is our identity):
- predictions of death, divorce, spouse death, accidents or disease;
- remedies (gems, pujas);
- pay-per-minute astrologers;
- zodiac × line page sets.

Never add them, whatever the volume.

---

## 2. Topical map (the full entity graph)

### 2.1 Graph overview

```
PALMISTRY (central entity)  ── source context: "your own palm, traced + honest, sourced meanings"
│
├─ CORE SECTION (closest to the product: the scan reads it, or it leads straight to "read my palm")
│  ├─ Reading method ............ /palm-reading/  (how to read palms; the entity's definition page)
│  │    ├─ Which hand ............ /which-hand-to-read/  (+ tools 8 and 14)
│  │    └─ Photo for a reading ... tool 3 /tools/palm-photo-checker/
│  ├─ PALM LINES (centroid) ...... /hand-lines/  (hub: names, chart, minor lines)
│  │    ├─ Heart line ............ /heart-line/        (+ tool 4)
│  │    ├─ Head line ............. /head-line/         (+ tool 5) └─ /head-line/double/
│  │    ├─ Life line ............. /life-line/         (+ tool 6) └─ /life-line/broken/ (P2)
│  │    ├─ Fate line ............. /fate-line/         (+ tool 7)
│  │    └─ Sun line .............. /sun-line/ (P2; the app reads it)
│  ├─ MOUNTS ..................... /palm-mounts/ (moved up to P2 top; the app reads mounts; tool 11 shows them)
│  ├─ The product ................ /  (free AI palm reading)  ·  /app/  ·  /tools/ + 13 tools
│  └─ Glossary (entity registry) . /palmistry-terms/ (NEW, §5.4)
│
├─ CORE-ADJACENT (big demand, "read my palm about X"; the scan does NOT read them → bridge to the lines it does read)
│  ├─ Marriage line .............. /marriage-line/  (→ heart line)
│  ├─ Children line .............. /children-line/ (P2)
│  ├─ Money line ................. /money-line/ (P2)  · Career palmistry /career-palmistry/ (P2)
│  ├─ Simian line ................ /simian-line/  (variant of heart + head)
│  ├─ Hand shape ................. /hand-types/ (P2)  (+ tool 9)
│  ├─ Fingers & thumb ............ /palmistry-fingers/ (moved up to P2)  (+ tool 13)
│  └─ Signs & marks .............. /palm-crosses/ · /palmistry-m/ · /lucky-signs/ (P2)  (+ tool 10)
│
└─ OUTER SECTION (history, traditions, science: builds topical relevance + historical data, passes trust inward)
   ├─ Validity .................... /is-palmistry-real/  (+ blog: do palm lines change, can palm reading predict death)
   ├─ Indian tradition ............ /indian-palmistry/ ↔ /hi/hast-rekha/ (P3-first)
   ├─ Chinese tradition ........... /chinese-palmistry/ (P3)
   ├─ History / Western ........... /history-of-palmistry/ (P3)  (Cheiro, Benham, D'Arpentigny, Desbarrolles)
   ├─ Minor/rare lines ............ /mercury-line/ (P3) · /blog/rarest-palm-lines/ (P2)
   └─ Apps & AI ................... /blog/best-palm-reading-apps/ · /blog/palm-reading-chatgpt-vs-palm-scanner/ (P2)
```

**Why the mounts and fingers move up** (this changes the P3 order in KEYWORD_MAP §2.0; owner decision D3):
- **Mounts:**
  - The app's rule set reads mounts (CONTENT_GUIDE §9.1), so it is **product-core**.
  - Tool 11 (palm map) already shows 8 mount spots with no guide behind them.
  - Every ranking "how to read palms" page has a mounts section (research c: Almanac, Numerologist, AstroSage).
  - The US keywords have low KD: palm reading mounts 140/7, mount of moon palm reading 70/4, mount of luna palmistry 70/4, mounts of the hand 70/1.
- **Fingers:** tool 13 (finger reader) is live with no guide partner. India has 1.4K of demand (palmistry fingers 320/15 plus thumb terms).
- Koray's "root attributes" rule: attributes every source covers must be covered first.

### 2.2 How to read the node tables

For each node:
- **URL and status:** ✅ built · 🟡 planned in KEYWORD_MAP · 🆕 new in this plan.
- **Primary and secondary queries** from the exports.
- **EAV attributes.** Koray's attribute types:
  - **R** = root: every competitor covers it; we must.
  - **Ra** = rare: a few cover it; it signals expertise.
  - **U** = unique: only we can give it. Usually "on your own photo", "what the app reads", "books disagree" or a sourced honest answer.
  - A ✗ marks an attribute the built page does not cover yet.
- **Questions:** the question network the page must answer. Short answers go in the FAQ; others are H2s.
- **Hindi twin.**

Attribute order on a page = **prominence first** (how essential to defining the entity), **then popularity** (search demand), always **filtered by the source context** (honesty rules).

### 2.3 Core nodes

#### N1 · Palmistry (the entity page) — `/palm-reading/` ✅
- **Queries:**
  - US primary: how to read palms (not in the export); palm reading guide 4,400/28.
  - India primary: how to read palm lines 2,900/50.
  - Secondaries: what is palmistry 320/37 (IN), how to see hand lines 170/41 (IN), how to check hand lines 140/40 (IN), can you read your own palm.
  - Shared head term: palm reading 301K/52 US and 33,100/41 IN (C6: not targeted by one page).
- **EAV:**
  - R: definition; other names (chiromancy ✗, hand reading, Hast Rekha Shastra ✓); what is read (lines, mounts, hand shape, fingers, marks); which hand; step-by-step method; lighting and photo; the four major lines; mounts (brief); limits.
  - Ra: the **two branches**, chirognomy (hand shape) vs chiromancy (lines) ✗; traditions in one line each (Indian, Chinese, Western) with bridges ✗; how long a reading takes ✗; reading both hands and comparing ✓.
  - U: steps shown on a real photo traced by the real scanner ✓ (v4); a "check yourself" quiz ✓; what the app reads vs doesn't ✓.
- **Questions:** What is palmistry? · How do I read my own palm? · Which hand first? · What are the main lines? · What are the mounts? · Does hand shape matter? · Can you read your own palm? · Is palm reading real? (one line → `/is-palmistry-real/`) · How is Indian palmistry different? (one line → `/indian-palmistry/` when live).
- **Hindi twin:** `/hi/palm-reading/`, "हाथ की रेखा कैसे देखें" (hath ki rekha kaise dekhe).

#### N2 · Palm lines (hub) — `/hand-lines/` ✅
- **Queries:**
  - IN: hand reading lines 27,100/50, what your palm lines say about you 2,400/31, palm crease meaning 320/41, major lines in palmistry 170/22.
  - US: palm reading lines 18,100/31, lines on palm astrology 18,100/23, meaning of lines in the palm 2,400/23, palm diagram 320/35, palmistry images 170/21, palmistry hand images 140/22, palmistry picture 110/23.
- **EAV:**
  - R: names of every line; major vs minor; the three major + fate; a chart; which hand; do lines change (2 sentences → blog 3); signs on lines.
  - R ✗: **a real chart image file** (today the chart is inline SVG, and Google Images can't index it; X8, §7.4).
  - Minor lines covered today: sun ✓, Mercury ✓, marriage ✓, children ✓, money ✓, bracelets ✓.
  - Minor lines missing ✗: **girdle of Venus**, **intuition line**, **travel lines**, **line of Mars (sister line)**, **ring of Solomon**, **via lasciva**.
  - Ra: how many lines a palm has ✗; **Hindi and Sanskrit names table** ✗; lines on the fingers (IN "lines in fingers" 140/18 → fingers page) ✗; why palm creases form, medically (flexion creases) ✓.
  - U: which lines the app reads ✓; which marks a phone photo can't show ✓.
- **Questions:** What are the lines on your palm called? · How many lines are on the palm? · What are the major and minor lines? · What does each line mean? · Which line is love / career / money / marriage? · What is the rarest palm line? · Do palm lines change? · What is the M on the palm? (1 line → M page)
- **Hindi twin:** `/hi/hand-lines/`, "हाथ की रेखाएं क्या बताती हैं". Owns palm line reading in hindi 880/28 plus 3 rows (KEYWORD_MAP K6).

#### N3–N6 · The four major line pillars ✅

The 4 pillars share one attribute template. This is Koray's "query template → document template": same attributes, **line-specific values**. Coverage today comes from the built headings.

| Attribute (EAV) | Type | Heart | Head | Life | Fate |
|---|---|---|---|---|---|
| Location (where it runs) | R | ✓ | ✓ (duplicated twice) | ✓ | ✓ |
| Start point(s) | R | ✓ | ✓ joined / not joined | ✓ high start | ✓ wrist/life/Moon/middle · ✗ Venus mount, head line, heart line |
| End point(s) | R | ✓ index/between/middle | ✗ ending on the Moon mount vs across (only via slope) | ✗ where it ends (towards the Moon mount = "travel" reading) | ✓ index, ring · ✗ stopping at the head or heart line |
| Length | R | ✓ | ✓ | ✓ (fear answered first) | — |
| Shape | R | ✓ straight · **✗ curved** | ✓ straight/sloping · ✗ wavy | ✓ wide/close | ✗ wavy |
| Depth / clarity | R | ✓ | ✓ | ✓ | ✓ faint |
| Chains | R | ✓ | ✓ | ✓ | ✗ |
| Breaks | R | ✓ | ✓ | ✓ (→ /broken/) | ✓ |
| Forks | R | ✓ | ✓ writer's fork | ✓ | ✗ forked (Y) fate line |
| Branches up / down | Ra | ✓ up · ✗ down | ✗ | ✗ | ✗ |
| Double / sister line | Ra | ✗ double heart line | ✓ (→ /double/) | ✓ | ✓ |
| Marks on the line (island, cross, star, square) | R | ✓ | ✓ | **✗ section missing** | **✗ section missing** |
| Lines crossing it (influence / worry lines) | Ra | — | — | ✗ | ✗ |
| Missing line ("no X line") | Ra | ✗ | ✗ | ✗ | ✓ |
| Joined with another line | R | ✓ head (simian) | ✓ heart, life | ✗ life + head start | ✓ from the life line |
| Space between lines (quadrangle) | Ra | ✗ | ✗ | — | — |
| Which hand / women and men | R | ✓ | ✓ | ✓ | ✓ |
| Other names and Hindi name | R | ✓ love line; हृदय रेखा | ✓ mind/brain line; मस्तिष्क रेखा | ✓ जीवन रेखा | ✓ destiny/career/Saturn; भाग्य रेखा |
| Traditions disagree | U | ✓ which end to read | ✗ | ✗ | ✗ |
| Age / timing on the line | U (honest) | — | — | ✓ why we don't | ✗ fate "age" myth: 1 sentence, why we don't |
| What a phone photo can and can't show | U | ✓ (module) | ✓ | ✓ | ✓ |
| Which one do you have? (tool) | U | ✓ tool 4 | ✓ tool 5 | ✓ tool 6 | ✓ tool 7 |
| Line vs line comparison | Ra | ✗ heart vs head | ✗ (in blueprint, not built) | ✓ vs fate | ✗ vs sun line |

**Queries per pillar** (all from KEYWORD_MAP §2.1/§2.4, unchanged):
- **Heart:** heart line palmistry 3,600/29 IN, heart line palm 1,000/31 US, love line in hand 1,900/37 IN, heart line in hand 1,600/33 IN, types of heart line 320/17 IN, heart line palmistry fork 210/24 IN, straight heart line 140/21 IN, heart line divided into two parts 110/16 IN, heart line and life line joined meaning 110/15 IN, broken heart line 210/5 US.
- **Head:** head line palmistry 1,300/21 IN, education line 390/19 + 320/27 IN, mind/brain line 260/14 + 170/17 IN, forked 210/13 IN, life line and head line not joined meaning 140/10 IN.
- **Life:** life line in hand 9,900/22 IN, short life line palm 2,400/19 IN, life line for female 1,000/21 IN, for male 720/30 IN, age line 140/24 IN.
- **Fate:** palmistry fate line 2,400/25 IN, career line 590/10 + 590/11 IN, luck line 480/25 + 480/23 IN, fate line palm 880/16 US.

**Questions to add** (from competitor FAQs and PAA-style titles, research c):
- Heart: What does a curved heart line mean? · Double heart line? · What if the marriage line touches the heart line? (1 line → marriage) · No heart line?
- Head: What does a wavy head line mean? · What is the space between the head and heart lines? · Does the head line show intelligence? (✓, "not an IQ test")
- Life: What do marks on the life line mean? · Lines crossing the life line? · Can the life line change?
- Fate: Where does my fate line start and what does it mean? (✓) · Forked fate line? · Does the fate line tell when I'll succeed? (No; timing myth) · Can a fate line appear later?

**Hindi twins:** `/hi/heart-line/` (हृदय रेखा · hriday rekha · also प्रेम रेखा), `/hi/head-line/` (मस्तिष्क रेखा), `/hi/life-line/` (हाथ में जीवन रेखा, avoiding bare "जीवन रेखा", which is a hospital brand), `/hi/fate-line/` (भाग्य रेखा · bhagya rekha).

#### N7 · Sun line — `/sun-line/` 🟡 (P2; **product-core**, because the app reads the sun line)
- **Queries:** sun line palmistry 480/29 US, success line on palm 480/30 IN, Apollo line.
- **EAV:**
  - R: location (towards the ring finger), other names (Apollo line, line of success, सूर्य रेखा, Via Solis in Dale), start points, length, missing (common; Markun), breaks, double.
  - Ra: sun line vs fate line; marks.
  - U: the app reads it; it is never a fame or money prediction.
- **Questions:** Where is the sun line? · What does no sun line mean? · Is the sun line the success line? · Sun line on the right vs the left hand?
- **Hindi:** `/hi/sun-line/` later (सूर्य रेखा).

#### N8 · Mounts — `/palm-mounts/` 🟡 moved up (was P3 → **P2 #2**; owner decision D3)
- **Queries:** palm reading mounts 140/7 US, mount of moon palm reading 70/4 US, mount of luna palmistry 70/4 US, mounts of the hand 70/1 US. India [unverified]; the Hindi form is "पर्वत", e.g. शुक्र पर्वत (Devanagari export pending).
- **EAV:**
  - R: what a mount is; the 7 or 8 mounts, each with position, planet name and Indian name:
    - Jupiter / गुरु, under the index finger
    - Saturn / शनि, under the middle finger
    - Sun or Apollo / सूर्य, under the ring finger
    - Mercury / बुध, under the little finger
    - Venus / शुक्र, at the base of the thumb
    - Moon or Luna / चंद्र, on the outer lower palm
    - Mars / मंगल, two mounts named **by position** (CONTENT_GUIDE §9.1: the app's labels are the reverse of Cheiro's)
  - R, continued: what each is read for (app rule wording); developed vs flat; which hand.
  - Ra: the plain of Mars; displaced mounts (leaning towards a neighbour); marks on mounts (→ signs pages); Rahu/Ketu in Indian readings (attributed, [verify] source in Dale or Jain).
  - U: the mounts on the real traced photo (areas labelled as AREAS, WEB-DEC-047 rule); what the app reads on mounts.
- **Questions:** What are the mounts on the palm? · How many mounts are there? · Which mount is under which finger? · What does a raised or flat mount mean? · What is the mount of Venus? · What is the mount of the Moon? · Which mount is for money? (honest: no mount predicts money)
- **Hindi twin:** `/hi/palm-mounts/` (हथेली के पर्वत · hast rekha parvat [verify term with the reviewer]).
- **Tool pair:** tool 11 `/tools/palm-map/` (already shows the mounts; add a "Read the mounts guide" link when live).

#### N9 · Which hand — `/which-hand-to-read/` ✅
- **Queries:** palmistry female 4,400/30 IN, palm reading for male 3,600/33 IN, plus 25 more India rows (15,870 in total; K2).
- **EAV:**
  - R: writing hand vs other hand ✓; female ✓; male ✓; left-handed ✓; which hand for each line ✓; why the two hands differ ✓.
  - Ra: **one table reconciling the three traditions** ✗ (Western writing hand; Indian: man right, woman left (Dale 1895) ✓ in text; **Chinese 男左女右, "men left, women right"** ✗, [verify] a citable source before stating it); ambidextrous ✗ (no competitor covers it, research c); "active / passive hand" as other names ✗.
  - U: compare both hands on your own photos (tool 14) ✓.
- **Hindi twin:** `/hi/which-hand-to-read/` (महिला का कौन सा हाथ देखें; palm reading for male in hindi 110/20).

#### N10 · Product nodes — `/` ✅, `/app/` ✅, `/tools/` + 13 tools ✅
- **Queries:** free palm reading online 12,100/17 IN, palmistry online free 12,100/29 IN, palm reading scanner 2,400/22 IN, palm reading app 9,900/37 IN, hand reading app 2,900/34 IN, free palm reading 2,900/32 US (full list in KEYWORD_MAP §2.4 and §3).
- **EAV for the product entity:**
  - Name (PalmSays; on Play: "Palm Read AI", WEB-SRV-014).
  - Platform: Android.
  - What it reads: the 4 major lines, the sun line and the mounts.
  - Languages: EN, HI.
  - Price: free to start; paid readings, prices from `site.ts`.
  - Privacy: EXIF stripped; where processed.
  - Accuracy: honest statement.
  - How it differs from ChatGPT (blog 1).
- These values must be word-identical on `/`, `/app/`, `/about/`, `llms.txt` and the Play listing (KBT; §5.5).

#### N11 · Glossary — `/palmistry-terms/` 🆕 (P2 #1; owner decision D2)
- **Queries:** [unverified]: palmistry terms, palmistry glossary, palm reading terms, हस्तरेखा शब्दावली. It **does not need search volume**. Its job is to be the site's **entity registry**: one stable `DefinedTerm` per concept (§5.4), a hub that links every term to its owning page, and the single place the "same value for the same attribute" sentences live.
- The new-URL test (SEO_PLAYBOOK §15) is met on "unique useful content": 60–90 terms with Hindi names, one-sentence definitions and links. No other page on the site holds this.
- **Hindi twin:** `/hi/palmistry-terms/` (हस्तरेखा शब्दकोश), written as Hindi and reviewed.

### 2.4 Core-adjacent nodes (big "read my palm about X" demand; the scan doesn't read them)

Rule for every page in this group:
- One **contextual bridge** to the line the app does read: marriage → heart line; money and career → fate and sun lines; children → heart line and the limits box.
- **No scan CTA where the scan doesn't read the topic** (existing rule).

| Node | URL | Primary (vol/KD) | Key EAV to cover (R / Ra / U) | Hindi twin |
|---|---|---|---|---|
| Marriage line | `/marriage-line/` ✅ | marriage line palmistry 4,400/11 IN · marriage line palm 1,000/7 US · chiromancy marriage line 1,900/13 US | R ✓ location, count, types, love vs arranged, divorce myth, age myth · **Ra ✗ marriage line touching the heart line** (a top India question), ✗ island on the marriage line, ✗ no marriage line · U ✓ can a photo show it | `/hi/marriage-line/` शादी की रेखा / विवाह रेखा (P2; YMYL) |
| Simian line | `/simian-line/` ✅ | simian line 6,600/28 IN · one line on palm 1,000/34 US | R ✓ medical facts first, one or both hands, looks like, books · **Ra ✗ the Sydney line** (a related crease named in the medical literature; [verify] source), ✗ how it differs from a heart and head line that touch (partly ✓) · U ✓ does PalmSays read it | later |
| Double head line | `/head-line/double/` ✅ | two head line palmistry 6,600/30 IN | ✓ complete for its scope | none yet |
| Hand types | `/hand-types/` 🟡 P2 | different types of hands 720/22 US · element hands 320/22 US · palm reading fire hand 140/3 IN | R: the 4 elements (**labelled as the modern system**, CONTENT_GUIDE §9.4), measuring palm length vs width, finger length; **Ra: Cheiro's 7 types** (elementary, square, spatulate, philosophic, conic, psychic, mixed), **chirognomy** (D'Arpentigny, [verify] source); U: find yours from a photo (tool 9) | later |
| Fingers & thumb | `/palmistry-fingers/` 🟡 → **P2** | palmistry fingers 320/15 IN · finger astrology 260/12 IN · thumb lines 170/21 + 170/15 IN · palmistry fingers 110/5 US | R: finger names and mounts under them, length (index vs ring), **phalanges (3 sections)**, thumb (angle, length, phalanges of will and logic), knotty vs smooth joints, finger gaps; **Ra:** finger lines (IN "lines in fingers" 140/18), digit ratio 2D:4D in science (one sourced sentence, → `/is-palmistry-real/`); U: measured on your photo (tool 13) | later |
| Palm crosses | `/palm-crosses/` 🟡 P2 | mystic cross on palm 480/24 IN · palmistry crosses 880/23 US | R: mystic cross (between heart and head lines), X on palm, cross on mounts, on lines, x and m; U: too small for most phone photos (CONTENT_GUIDE §4.6) | later |
| M on palm | `/palmistry-m/` 🟡 P2 | palmistry m 390/23 US | R: what forms the M (heart, head, life, fate), how common, both hands; **U: "no classical source" said plainly** (tool 10 already says it) | `/hi/palmistry-m/` |
| Lucky signs | `/lucky-signs/` 🟡 P2 | rare lucky signs on palm 260/6 US · fish sign 110/21 US | R: fish (मछली), trident (त्रिशूल), star, triangle, square; **Ra: Indian auspicious signs** named in Hindi pages (शंख, चक्र, कमल, स्वस्तिक): attributed only if a corpus book names them ([verify] Jain 1927 / Dale 1895), else "some Indian readers" with no meaning claimed | `/hi/lucky-signs/` |
| Money line | `/money-line/` 🟡 P2 | money line in hand palmistry 320/22 US | R: "no classical book names a separate money line" (✓ already on `/hand-lines/`); which lines are read for work (fate, sun, Mercury); money triangle; U: "no line predicts income" | `/hi/money-line/` धन रेखा |
| Career palmistry | `/career-palmistry/` 🟡 P2 | career palmistry 880/5 US | Topic page (C9); bridges to fate and sun | later |
| Children line | `/children-line/` 🟡 P2 (YMYL) | palm reading children line 210/8 US | honest-only | `/hi/children-line/` संतान रेखा |
| Broken life line | `/life-line/broken/` 🟡 P2 | broken life line palmistry 390/14 US | R: clean vs overlapping break, square over a break (Ra), one or both hands; care line | none |

### 2.5 Outer nodes (historical data, relevance, trust)

| Node | URL | Primary (vol/KD) | Key EAV | Bridge back to core |
|---|---|---|---|---|
| Is palmistry real | `/is-palmistry-real/` ✅ | is palmistry true 1,300/34 IN · 390/14 US | R ✓ science, Barnum/Forer, cold reading, confirmation bias, lines form in the womb, predict death/marriage/children · **Ra ✗ palmistry vs dermatoglyphics** (the real science of skin ridges, not creases), ✗ **flexion creases in medicine** (one sentence → simian), ✗ digit-ratio research (one careful sentence: "studied for prenatal hormones; does not support readings") · U ✓ how PalmSays handles it | "So why read palms at all?" → `/palm-reading/` ✓ |
| Indian palmistry | `/indian-palmistry/` 🟡 → **P3 first** (days 61–70) | palmistry india 170/30 US · indian hand reading 70/20 · vedic palm reading 40/14 | R: Hast Rekha Shastra; "often described as part of" Samudrika Shastra (hedge); how it differs (reading hands by gender; the names of lines and mounts; auspicious signs); books (Dale 1895, Jain 1927); Ra: link to Jyotisha (planet names of the mounts) | → `/hand-lines/` names table, `/palm-mounts/` |
| Hast Rekha (Hindi-only or twin) | `/hi/hast-rekha/` 🟡 | हस्तरेखा शास्त्र / hast rekha shastra (Hindi autocomplete) | Written as Hindi; "not a science" said plainly | → `/hi/hand-lines/` |
| Chinese palmistry | `/chinese-palmistry/` 🟡 P3 | chinese palmistry 720/16 US + 170/16 × 2 | Needs a specialist source (CONTENT_GUIDE); five-element hands; the "heaven/human/earth" lines; which hand (男左女右) | → `/hand-types/`, `/which-hand-to-read/` |
| History | `/history-of-palmistry/` 🟡 P3 | history of palmistry 70/31 US · origins 70/29 US | India → Greece → medieval chiromancy → 19th-century revival (D'Arpentigny, Desbarrolles, Heron-Allen, Cheiro, Benham); cite historians | → `/palm-reading/` |
| Mercury line | `/mercury-line/` 🟡 P3 | line of mercury palmistry 70/4 US | "not a medical test" box at the top (YMYL) | → `/hand-lines/` |
| Blog: do palm lines change | `/blog/do-palm-lines-change/` 🟡 P2 | do palm lines change 110/9 IN | Kimura & Kitagawa 1986 (already cited); fine lines vs creases; photos | → pillars |
| Blog: rarest lines | `/blog/rarest-palm-lines/` 🟡 P2 | rare hand lines meaning 1,000/31 IN | Small hub linking simian, double head, double life, mystic cross, lucky signs (K5) | → those pages |
| Blog: predict death | `/blog/can-palm-reading-predict-death/` 🟡 P3 | can palm reading predict death | YMYL; care line | → `/life-line/` |
| Blog: apps / ChatGPT | blogs 1, 2 🟡 P2 | palm reading chatgpt · best palm reading app | Disclose our app; test the same way | → `/app/`, `/` |

### 2.6 Query templates and the query network

Koray: entities of the same type share a **query template**, and the page type follows the template. Our templates, and where each **variant** goes, so we cover the whole network without scaled pages (SEO_PLAYBOOK §15):

| Query template | Example | Where it is answered |
|---|---|---|
| `<line> meaning / palmistry / in hand` | heart line in hand | The line pillar: title, H1, answer |
| `<line> types` | types of heart line | Pillar H2 "<Line> types" → H3 attribute → H4 value (§3.2) |
| `<attribute value> <line>` | forked / broken / double / short / curved heart line | Pillar H4 (a value card); **never a URL** unless it passes the new-URL test (only `/life-line/broken/` and `/head-line/double/` do) |
| `no <line>` | no fate line | Pillar H4 or H3 |
| `<line> for female / male` | life line for female 1,000/21 IN | One pillar H2 "…for women and men" (built on all 4) |
| `<line> left / right hand` | palmistry left hand | That same H2 + `/which-hand-to-read/` |
| `<sign> on <line>` | island on heart line | Pillar "Marks on the <line>" H2 (**missing on life and fate**) |
| `<sign> on palm meaning` | mystic cross on palm | The sign page (crosses / M / lucky signs) |
| `<mount> meaning` | mount of Venus | `/palm-mounts/` H3 per mount |
| `where is <line/mount>` | where is the marriage line | The owning page, first module (location attribute) |
| `<line> vs <line>` | life line vs fate line | The pillar of the first-named line; ≤ 1 H2 |
| `is <feature> rare / lucky / good` | is simian line lucky | The owning page's FAQ, honest |
| `<topic> in hindi` / Devanagari | palm line reading in hindi | The Hindi twin (K6) |
| `<line> age / when will I …` | marriage line age | Honest H3 on the owner page: "why we don't give one" |
| `<tool intent>`: which / check / find my | which heart line do I have | The tool page (C13) |

**Represented vs representative queries** (Koray via secondary sources): each pillar's **representative query** (for example "heart line palmistry") stands for its **represented** long tail (for example "heart line ending between index and middle finger meaning"). Coverage is measured by how many represented queries a page gets impressions for (§8).

### 2.7 Hindi and Hinglish query behaviour (research b: Google Trends, India, 5 years, 2026-09-28)

**Relative interest** (anchor: "palmistry" = 34):
- palm reading 17 · **hast rekha 11** · **hath ki rekha 9** · palm lines 8 · hastrekha 4
- हस्तरेखा 3 · हाथ की रेखा 3 · samudrik shastra 2 · palmistry in hindi 2
- "-shastra" forms ≈ 0

**Romanised Hinglish beats Devanagari about 3–4×.** The English word "palmistry" is the biggest term of all.

**Line names:**
- Romanised: "bhagya rekha" ≈ 8, "surya rekha" 6, "vivah rekha" ≈ 3.
- Devanagari: जीवन रेखा 4, भाग्य रेखा 1.
- Bare "jeevan rekha" is polluted by hospital, pension and portal queries. Only "jeevan rekha in hand" is about palms, which confirms the KEYWORD_MAP §7 trap.

**Rising and related queries:**
- **"hast rekha scanner" +550%** and "hast rekha kaise dekhe" +550% (these belong to `/hi/`, H1).
- "hath ki rekha dekhne wala app" (→ `/hi/app/`).
- हस्तरेखा चित्र सहित / हस्तरेखा देखना चित्र सहित: people want pictures.
- "which hand is seen in palmistry for male / female" +300–400% (→ `/which-hand-to-read/` + its Hindi twin).
- "is palmistry real" +200%.
- "types of heart line".

**How Hindi publishers ship:** Devanagari headlines, a romanised or English label ("Hast Rekha:" / "Palmistry in Hindi"), and English URL slugs (Amar Ujala, Zee Hindi, AajTak, Astroyogi Hindi).

**Rules for our Hindi pages** (add to CONTENT_GUIDE §3 when accepted):
1. Title = Devanagari first + **one romanised phrase** ("Hast Rekha", "Hath Ki Rekha", "Bhagya Rekha") + "Palmistry" where it fits. For example: "भाग्य रेखा: कहां होती है, प्रकार और चित्र | Bhagya Rekha".
2. The H1 subtitle carries the romanised query ("hath ki rekha kaise dekhe").
3. The body stays Devanagari. The romanised term appears once more in the answer-first sentence or the quick facts, so the page matches both scripts.
4. "चित्र सहित" / "with pictures" goes in a title only when the page has real labelled diagrams (§7.4).
5. `/hi/` owns "hast rekha scanner" (C7/H1). Put it in the H1 subtitle **only when the web scanner is live**. Until then use "Hast Rekha in Hindi" (the honesty rule).

---

## 3. Gap audit of the current site (built HTML, 2026-09-28)

### 3.0 Cross-cutting findings (these matter more than any single page)

| # | Finding | Evidence | Impact | Fix (phase) |
|---|---|---|---|---|
| X1 | **The production build will refuse to build.** `GuideLayout` throws on a YMYL guide whose status is not `owner-ok` or `published`. `/life-line/` (lifespan), `/marriage-line/` (marriage) and `/simian-line/` (health) are all `status: checked`. | `src/layouts/GuideLayout.astro` L58–61; the MDX front matter | Launch is blocked, or 3 of the biggest India pages (14.9K + 10.3K + 18.7K a month) are missing | Owner reads and OKs the three (D1). **Phase 1, day −1** |
| X2 | **Home FAQ contradicts the site state** (KBT). The visible FAQ and its FAQPage JSON-LD say "On this website you get 2 free readings: 1 now…", while `webReadingEnabled=false` and the page says "opens soon". | `dist/index.html` | Knowledge-based-trust hit, honesty-rule break (CONTENT_GUIDE §4.9), and a wrong fact AI Overviews may quote | A "soon" variant of that FAQ answer, like the title and meta already have. **Phase 1** |
| X3 | **Structured data names no entities.** No `about` or `mentions`, no `@id` graph (the Article isn't linked to a WebPage, the author isn't linked to the Person `@id`), and the **book sources are left out of `citation`** (only titled "other" sources are included). No `publishingPrinciples`. | `src/lib/schema.ts`, `GuideLayout.astro` L108–131 | Google gets no explicit entity signal and no link from content to the named books or the author entity | §5. **Phase 1** (≈ 0.3–0.5 KB gzip per guide) |
| X4 | **`Article.image` is `og-default.png` on every guide**, although per-page OG images exist (`/og/heart-line.jpg` …). | JSON-LD vs `og:image` | Weaker Discover and image eligibility; one image for 11 different entities | Use the page's own OG image plus an `ImageObject`. **Phase 1** |
| X5 | **Heading vectors are flat.** In line pillars, the attribute group labels ("Where does it start and end?", "How long is it?") and the values ("Long heart line") are all H3s, so the hierarchy entity → attribute → value is lost. `/head-line/` has both "Where is the head line?" and "Where the head line starts and ends". The location H2 comes *after* the types grid, while the module H2 is "Find your heart line". | Heading dumps (§3.1) | Contextual hierarchy unclear; duplicated location sections dilute the page | §3.2 heading spec. **Phase 1** (copy and one component) |
| X6 | **Boilerplate H2s on every guide:** "Quick facts", "Questions people ask", "Sources (n books and studies)", "See your own lines", "Related guides", "Check yourself". The same words appear on 11 pages. | Headings | Generic headings carry no entity (Koray: "no generic headings") and make every page's heading vector look alike | Put the entity in them ("Heart line quick facts", "Heart line questions") or make end-matter headings lower weight (§3.2). **Phase 1** |
| X7 | **Weak and duplicated anchors.** | Link extraction (§4.5) | Anchor-text index gets noise; the first link to a target often carries a sentence | §4.4 anchor rules + §4.5 table. **Phase 1** |
| X8 | **The palm chart and all type drawings are inline SVG** (44–87 inline `<svg>` per guide). `/hand-lines/` has **zero `<img>`**, yet it owns "palm reading chart / palm diagram / palmistry images" (US 320 + 170 + 140 + 110 …). | `dist/hand-lines/` | Google Images can't index inline SVG (SEO_PLAYBOOK §12 says so itself); the image-search queries are lost | Chart and key diagrams as `<img>` SVG files (WEB-FEAT-056) + an image sitemap. **Phase 1 (chart) / 2 (set)** |
| X9 | **Guide HTML is at the weight budget.** HTML gzip: `/palm-reading/` 34.3 KB, `/heart-line/` 33.7, `/head-line/` 33.4, `/life-line/` 32.1 (budget 35). Inline SVG alone is 12–12.8 KB of that; header + footer ≈ 8.5 KB. Shared CSS 22.7/25 KB. | Weight breakdown (scratch script) | No room to add the attributes above without breaking the budget | Move the variation drawings to **one cached SVG sprite**: frees ≈ 8–10 KB per guide (§7.1). **Phase 2, before content growth** |
| X10 | **No page defines the palmistry vocabulary.** "Chiromancy" appears 0 times site-wide, "chirognomy" 0, "girdle of Venus" 0, "dermatoglyphics" 0, "mount of Venus" once. Mounts have no page though tool 11 and the app use them. | Term counts in the MDX files | Missing root and rare attributes of the central entity; the central entity's other names are missing | Glossary (§5.4), `/palm-mounts/`, `/hand-lines/` minor lines. **Phases 1–2** |
| X11 | **Brand entity is split:** Organization "PalmSays", MobileApplication "Palm Read AI" (Play), author page `noindex` (no bio yet). | JSON-LD, `pages.ts` | Google may not join site, app and author into one entity | One stated relation "PalmSays (on Google Play as Palm Read AI)" everywhere; author page indexable when the bio arrives; Play rename is WEB-SRV-014 (D8) |
| X12 | **All guides say `published: 2026-09-26`**, before the site is public. | Front matter | A small trust oddity in `datePublished` | Set `published` to the go-live date at launch (D10) |

### 3.1 Page-by-page

Legend: **Attr** = missing attributes/questions (§2) · **Head** = heading vector · **1st** = answer-first sentence · **Ent** = entity mentions · **Sch** = schema · **Links** = internal links/anchors · **Can** = cannibalisation.

#### `/` (home)
- **1st:** ✓ "Free AI palm reading on your own photo…" (the audit fix is applied).
- **Head:** ✓ "How our AI palm reading works", "Learn the lines on your palm". The H3s "Love / Personality / Career & money / Life direction" are repeated twice (under "What your palm reveals" and in the sample). Make the sample's H3s "Sample: love" or non-headings.
- **Ent:** no one-line definition of palm reading; add it to the "What your palm reveals" intro ("Palm reading (palmistry, हस्तरेखा) reads the lines, mounts and shape of the hand…"). This is the central entity on the root page.
- **Sch:** Organization + WebSite + FAQPage. Add a `WebPage` node with `about: Palmistry` (Q182687, §5.2) and drop the FAQPage JSON-LD (D9). `WebApplication` returns when the reading goes live (correct as is).
- **Links:**
  - ✗ no link to `/which-hand-to-read/` (India 15.9K). Add it in "How it works" step 1 ("which hand to photograph").
  - ✗ `/simian-line/` and `/head-line/double/` not needed from home.
  - Guide cards wrap title + blurb + "Read the guide 6 min read" in one anchor. Fix to a title-only anchor (§4.4 R6).
- **Other:** ✗ **FAQ contradiction X2**.
- **Can:** ✓ none (the `/tools/` "free palm reading tools" H1 is its own keyword; keep).

#### `/hi/` (Hindi home)
- **Ent:** ✓ हस्तरेखा; ✗ no "Hast Rekha" in Latin script in the body, no "हाथ की रेखा". Romanised "hast rekha" (11) and "hath ki rekha" (9) are searched 3–4× more than the Devanagari forms (§2.7). Add "Hast Rekha" once to the answer-first sentence and "hath ki rekha" once in the "How it works" intro.
- **Links:** guide cards link English guides with the anchor "English में …" plus a blurb, which is a long, mixed-language anchor. When the Hindi twins go live, link them; until then keep the anchor to the Hindi line name only ("हृदय रेखा (English)").
- **Other:** **must be read by the owner or reviewer before launch, or set `noindex`** (CONTENT_GUIDE §10). Same for `/hi/app/`.

#### `/palm-reading/` (N1)
- **Head:**
  - The first body H2s are "Find your 4 main lines" (module) and "Words to know", and **"What is palm reading?" is third**. Move the definition H2 to directly after the module (Koray: define the entity first).
  - "Words to know" → "Palmistry words to know" + a link to `/palmistry-terms/` once live.
  - "Questions palmistry can't answer" and "What palmistry can't tell you" are **two limit sections**. Merge them (the CONTENT_GUIDE §5 "one limits box" rule).
- **Attr:**
  - ✗ chiromancy vs chirognomy (one sentence under "What is palm reading?").
  - ✗ other names (chiromancy, hand reading, हस्तरेखा) in one sentence.
  - ✗ one line per tradition with bridges (Indian, Chinese, Western).
  - ✗ fingers and thumb (step 2 covers hand shape only; add 2 sentences + link `/palmistry-fingers/` when live).
  - ✗ minor lines (1 sentence → `/hand-lines/#minor-lines`).
- **1st:** ✓.
- **Sch:** add `about: Palmistry` (Q-id §5.3); `mentions`: hand, palm lines, mounts, Hast Rekha / Samudrika.
- **Links:** ✓ 42 main-content links (the high end; don't add more than 3); ✗ `/app/` (end block), ✗ `/tools/`.
- **Weight:** 34.3 KB, **at budget**. No additions before the sprite move (X9).

#### `/hand-lines/` (N2)
- **1st:** "Most palms have three major lines…". Use the audit's suggested sentence, which names "the lines on your palm are…" (it answers "what are the lines on your palm called", the representative query).
- **Head:** ✓ a good vector. "Want to see your own lines traced?" is a CTA H2 in the middle of the content: demote it to a non-heading card.
- **Attr:**
  - ✗ girdle of Venus, intuition line, travel lines, line of Mars / sister line, ring of Solomon, via lasciva: each an H3 of 40–80 words under "Minor lines", attributed (Cheiro / Benham), with the "app doesn't read it" note.
  - ✗ **a names table with Hindi / Sanskrit names**: हृदय रेखा, मस्तिष्क रेखा, जीवन रेखा, भाग्य रेखा, सूर्य रेखा, बुध / स्वास्थ्य रेखा, विवाह रेखा, संतान रेखा, मणिबंध रेखा, यात्रा रेखा [verify the minor ones with the reviewer].
  - ✗ "How many lines are on the palm?" (short answer: 3 major + fate, minor lines vary).
- **Image:** ✗ **the chart as an `<img>` file** `/img/diagrams/palm-lines-chart.svg` with descriptive alt; a Hindi version with Devanagari labels for `/hi/hand-lines/`.
- **Sch:** add `about: palm-lines` (the glossary term, `sameAs` palmar crease Q3906698, §5.3), `mentions` the 4 lines + `palmistry` (Q182687).
- **Links:** ✓ 37. "Open the guide" is used 4 times (one per line card); change each to "<line> meaning" ("heart line meaning", …). ✗ `/app/`. The breadcrumb parent should be `/palm-reading/` (Home › How to read palms › Palm lines) so the hierarchy follows the entity graph (front matter `parent`).
- **Can:** ✓.

#### `/heart-line/` (N3)
- **Head:**
  - The module H2 "Find your heart line" and a later H2 "Where is the heart line?" hold the same attribute. Rename the module title to **"Where is the heart line on your palm?"** and fold the later H2's unique sentences into the module steps or quick facts.
  - Group labels → H3 questions with the entity ("Where does your heart line end?"); types → H4 (§3.2).
- **Attr:** ✗ curved heart line (H4; a top competitor type), ✗ double heart line (H4, attributed; IN "heart line divided into two parts" 110/16 is related), ✗ branches going down, ✗ no heart line, ✗ heart line touching the marriage line (1 FAQ line → marriage), ✗ heart vs head line (1 short H2 or FAQ).
- **Sch:** `about`: heart line (the glossary DefinedTerm; **no Wikidata item exists** for the heart, head or fate line, §5.3); `mentions`: palmistry (Q182687), palm lines (Q3906698), head line, simian line (Q1934946); Cheiro (Q728021) goes in the book citations.
- **Links:** ✗ `/palm-reading/` (add "how to read palm lines" in the "Check yourself" or next-step area); ✗ `/head-line/double/` not needed.
- **Weight:** 33.7 KB, **at budget**; the new H4s need the sprite move first.

#### `/head-line/` (N4)
- **Head:** duplicated location H2s: "Where is the head line?" + "Where the head line starts and ends". Merge them into the module title "Where is the head line on your palm?" plus the types group "Where does your head line start and end?".
- **Attr:** ✗ wavy head line, ✗ the quadrangle (space between head and heart lines, Ra), ✗ branches, ✗ **head line vs heart line** (in the SEO_PLAYBOOK blueprint, not built), ✗ no head line.
- **Links:** ✗ `/palm-reading/`; ✗ `/marriage-line/` isn't needed.

#### `/life-line/` (N5, YMYL)
- **Head:** ✓ the fear H2 first, the limits box second (intended, YMYL).
- **Attr:**
  - ✗ **"Marks on the life line"** H2: island, square (Ra: "a square over a break"), cross; all attributed, no health or accident reading; say the phone photo can't show them.
  - ✗ lines crossing the life line (influence / worry lines): attributed, no fear.
  - ✗ where it ends (towards the wrist vs the Moon mount).
  - ✗ branches up / down.
  - ✗ the life line and the mount of Venus (the area it circles; → mounts page).
- **Sch:** `about`: `life-line` (**Q1700006**, the only major line with a Wikidata item); `mentions`: palmistry, palm lines, fate line.
- **Other:** the owner's OK is needed (X1).
- **Links:** ✗ `/palm-reading/`; (+ `/life-line/broken/` when live).

#### `/fate-line/` (N6)
- **Attr:**
  - ✗ "Marks on the fate line" H2.
  - ✗ forked fate line.
  - ✗ start points: the Venus mount, the head line, the heart line.
  - ✗ "Does the fate line show when I'll succeed?": 1 honest H3 (books time it; we don't).
  - ✗ fate line vs sun line (→ `/sun-line/` when live).
  - ✗ wavy.
- **Links:** ✗ `/palm-reading/`; later `/career-palmistry/` and `/sun-line/` with anchors "career palmistry" and "sun line".

#### `/is-palmistry-real/`
- **Attr:**
  - ✗ palmistry vs dermatoglyphics (2 sentences: ridge patterns are a real science field; creases and meanings are not).
  - ✗ flexion creases in medicine (1 sentence → `/simian-line/`).
  - ✗ one careful digit-ratio sentence (only with a peer-reviewed citation).
  - ✓ religion FAQ present.
- **Sch:** `about`: Palmistry (Q182687); `mentions`: pseudoscience (Q483677), Barnum effect (Q653175), astrology (Q34362), palm lines (Q3906698), and later dermatoglyphics (Q904206). Cold reading and confirmation bias go in as glossary terms only (no Q-id was verified). Keep `citation[]` (it works today).
- **Links:** only 14 in main content. ✗ heart, head and fate pillars (in "Can palm reading predict…", link each line name once); ✗ `/simian-line/`.

#### `/which-hand-to-read/` (N9)
- **1st:** ✓ ("Look at both hands…").
- **Attr:** ✗ a three-tradition table (Western, Indian ✓, Chinese [verify source]); ✗ ambidextrous; ✗ "active / passive hand".
- **Links:** ✗ `/hand-lines/`.
- **Anchors in:** "Which hand to read" appears 20 times (footer + body). Fine as one target, but vary the body ones ("which hand to read for women").

#### `/marriage-line/` (YMYL)
- **Attr:** ✗ **the marriage line touching or cutting the heart line** (India's question; an honest answer: books read it as…, attributed; no death or divorce claim, CONTENT_GUIDE §4.2); ✗ island on the marriage line; ✗ "no marriage line" (is it in "How many…"? Make it an H3 if not).
- **Links in:** 7 pages link to it: `/`, `/hi/`, `/palm-reading/`, `/hand-lines/`, `/heart-line/`, `/is-palmistry-real/` and `/which-hand-to-read/`. Enough for now. Improve the anchor quality with link #24 (§4.5), and add a link from `/children-line/` when it is live.
- **Other:** the owner's OK is needed (X1).

#### `/head-line/double/` and `/simian-line/`
- **Double:** ✓ complete for its scope; it gets links from only 4 pages (fine for a sub-page).
- **Simian:**
  - Head: ✓ medical first.
  - Attr: ✗ the Sydney line (Ra, [verify] source); ✗ "simian line vs heart and head lines that touch" (partly in "What does it look like").
  - Sch: `about` = single transverse palmar crease (Wikidata, §5.3). **Do not add medical conditions to `mentions`** (the K10 spirit: no medical targeting).
  - The owner's OK is needed (X1).

#### `/tools/` and the 13 tool pages
- **Head:** tool pages repeat generic H2s ("How it works", "Keep going", "Your whole palm, in our app", "Other free tools"). Put the tool entity in them ("How the heart line finder works"). Keep "Other free tools" as a nav block without a heading, or with an H2 "More free palmistry tools".
- **Sch:** `WebApplication` without `about`. Add `about` → the line or feature DefinedTerm (heart line finder → heart line) and `isPartOf` → `/tools/` CollectionPage `@id`.
- **Links:** tool → guide anchors are "Read the full heart line guide" (✓ contains the entity); keep.
- **Can:** ✓ (C13 respected).

#### `/app/` and `/hi/app/`
- **Sch:** `MobileApplication` lacks `url` / `sameAs` (the Play listing), `downloadUrl`, `screenshot`, `featureList`, `availableLanguage` / `inLanguage` ["en", "hi"], `@id`. **No `aggregateRating`** (correct; §5.2).
- **Links in:** 8 of 20 anchors are "See what the app does" (generic), one on each of the 8 rule-tool pages. Change them to "PalmSays palm reading app" (vary: "palm reading app for Android", "what the app reads"). The locked-card anchors on home carry body sentences ("Career & Money Locked part With money you usually…"); make them title-only.
- **Ent:** ✗ one sentence "PalmSays is listed on Google Play as Palm Read AI" (X11) near the top of `/app/` and on `/about/`.

#### `/about/`, `/editorial-policy/`, `/about/deepak-chauhan/`
- **Sch:** the Organization has `founder` on `/about/` ✓. Add:
  - `knowsAbout` (palmistry Q182687, which is also Hast Rekha Shastra; Samudrika Shastra Q7410688; palmar crease Q3906698), a strong topical-entity signal;
  - `publishingPrinciples` → `/editorial-policy/`;
  - `sameAs`: real profiles only.
- **Person** (noindex stub): add `knowsAbout` and `image` + `sameAs` once the bio arrives. **Make the page indexable then** (D6). The Article `author` must reference `{"@id": ".../#person"}`.
- **Links in:** `/about/` and `/editorial-policy/` get links from only 2 pages plus the footer. Add "editorial policy" to each guide's Sources block ("How we choose sources").

### 3.2 Heading-vector spec (all guides)

Koray: heading vectors start at the title tag; each heading holds different information; more important questions come first; no generic headings; H2s as questions.

**Line pillar order** (the v3 "types first" user-first rule is kept):
1. H1 (unchanged).
2. Answer-first (unchanged).
3. **H2 "Where is the <line> on your palm?"** (the module; it absorbs the old "Find your…" + "Where is…").
4. **H2 "<Line> types and their meanings"**, containing:
   - **H3 "Where does your <line> start and end?"**, then **H4** values ("<Line> ending under the index finger"…)
   - **H3 "How long is your <line>?"**, then H4 long / short
   - **H3 "What shape is your <line>?"**, then H4 straight / curved / sloping / wavy
   - **H3 "How clear is your <line>?"**, then H4 deep / faint / chained
   - **H3 "Does your <line> break, fork or branch?"**, then H4 broken / forked / branches / double
5. H2 "Marks on the <line>" (all 4 pillars).
6. H2 life-topic questions in prominence order (for example "Is the love line the same as the heart line?", "Which end of the heart line do you read from?").
7. H2 "<Line> in the left and right hand, for women and men".
8. H2 "<Line> vs <other line>" (one).
9. H2 "Check yourself: <line> quiz" (renamed).
10. Limits box (its own heading, once).
11. H2 "Myths about the <line>".
12. **End matter with entity words:** "<Line> quick facts" · "<Line>: questions people ask" · "Sources for this <line> guide" · "See your own <line>" · "Related palm lines".

- **YMYL exception:** on `/life-line/` (and later `/life-line/broken/`), the fear H2 ("Does a short life line mean a short life?") and the limits box stay **directly after the module**, before the types (CONTENT_GUIDE §4.3). Items 4–9 follow them. `/marriage-line/` keeps its limits box high, as built.
- **Why H4 for values:** it encodes entity → attribute → value (EAV) directly in the document outline, which is the structure Koray's framework aims for, and it keeps every value (the represented query) as a real heading.
- **TOC** stays H2-only (no visual change).
- **Component change:** only `Variations.astro` / `Variation.astro` (group label level + value level).
- **Owner decision D4** (it changes the heading levels of an owner-approved template; visually it can look identical).

---

## 4. Semantic content network and internal-linking spec

### 4.1 Link graph

```
                 /  (source context: free AI palm reading)           /app/ (monetisation)
                 ▲  every page (breadcrumb Home + end block)          ▲  home, every end block (NEW contextual anchor), footer
                 │
   /palm-reading/  (Palmistry: entity definition + method) ◄──────── outer pages bridge in here
     ├─► /which-hand-to-read/ ─► tools 8, 14
     ├─► /hand-lines/ (Palm lines hub) ─┬─► /heart-line/ ─► tool 4 · /simian-line/ · /marriage-line/ (bridge)
     │                                  ├─► /head-line/  ─► tool 5 · /head-line/double/ · /simian-line/
     │                                  ├─► /life-line/  ─► tool 6 · /life-line/broken/
     │                                  ├─► /fate-line/  ─► tool 7 · /career-palmistry/ · /sun-line/
     │                                  ├─► /sun-line/ · /mercury-line/ · /money-line/ · /children-line/
     │                                  └─► /palm-crosses/ · /palmistry-m/ · /lucky-signs/ ─► tool 10
     ├─► /palm-mounts/ ─► tool 11
     ├─► /hand-types/ ─► tool 9     /palmistry-fingers/ ─► tool 13
     ├─► /is-palmistry-real/ ◄─ every limits box
     └─► /palmistry-terms/ (glossary) ─► every term's owning page
   OUTER: /indian-palmistry/, /chinese-palmistry/, /history-of-palmistry/, blog ──► bridge sentence → core page
```

**Rules for the graph:**
- **Hub → spoke:** every hub links every live spoke once, in its main content, with the spoke's canonical anchor.
- **Spoke → hub:** every spoke links its hub (breadcrumb + one contextual link).
- **Siblings:** 2–4 per page, only where the text naturally compares them (same attribute type: line ↔ line, sign ↔ sign, mount ↔ line that starts on it).
- **Every line pillar → `/palm-reading/`** once ✗ (missing today), with the anchor "how to read palm lines".
- **Every guide → `/app/`** once, in the end block ✗, with the anchor "PalmSays palm reading app" (vary: "palm reading app for Android"). Today guides link Play directly but never `/app/`, so `/app/` gets no topical links from the guides.
- **Every tool → its guide** (✓) and **every guide → its tool** (✓ module + tool card).
- **Outer → core bridges:** every outer page ends its main content with a bridge paragraph that names a core entity and links it (§4.3).

### 4.2 Breadcrumbs (logical, not URL-based)
- Change `/hand-lines/` `parent` → `/palm-reading/`. Every line crumb becomes Home › How to read palms › Palm lines › Heart line. That encodes Palmistry → Lines → Heart line.
- `/palm-mounts/`, `/hand-types/`, `/palmistry-fingers/`, `/which-hand-to-read/` (already), `/is-palmistry-real/` (already) → parent `/palm-reading/`.
- Signs pages and minor-line pages → parent `/hand-lines/`. Sub-pages → their pillar (as now).
- Hindi crumbs mirror this: होम › हाथ की रेखा कैसे देखें › हाथ की रेखाएं › हृदय रेखा.
- Crumb names = the entity name ("Palm lines", "Heart line"), never "Guides".

### 4.3 Contextual bridges (outer → core; core-adjacent → product-core)

| From | Bridge sentence (pattern) | Link → anchor |
|---|---|---|
| `/marriage-line/` | "What palmistry does read for love is the heart line…" | `/heart-line/` → "heart line" ✓ |
| `/money-line/`, `/career-palmistry/` | "The lines books read for work are the fate line and the sun line…" | `/fate-line/` → "fate line"; `/sun-line/` → "sun line" |
| `/children-line/` | "Palmistry reads how you relate to people in the heart line…" | `/heart-line/` → "heart line" |
| `/is-palmistry-real/` | "If you still want to read your palm as a tradition, start here" (✓ exists as "So why read palms at all?") | `/palm-reading/` → "how to read palm lines" |
| `/indian-palmistry/` | "The four lines Indian and Western books share are…" | `/hand-lines/` → "lines on your palm" |
| `/chinese-palmistry/` | "The five-element hand shapes are close to the modern Western element hands…" | `/hand-types/` → "hand types in palmistry" |
| `/history-of-palmistry/` | "Cheiro's books are the ones PalmSays cites for most line meanings…" | `/editorial-policy/` → "how we choose sources"; `/palm-reading/` |
| `/palm-mounts/` | "Lines start and end on mounts: the heart line on the mount of Mercury…" | the pillars, with line anchors |
| Blog posts | Each post's last section links 1 pillar + home (✓ KEYWORD_MAP §4) | — |
| `/palmistry-terms/` | Each term's definition ends with "Read more: <owner page>" | owner page → term name |

**Placement** (Koray): supplementary links in the **last section's paragraphs**, never in the answer-first paragraph, never on the first words of a paragraph. The answer-first paragraphs have 0 links today ✓ (keep it so).

### 4.4 Anchor-text rules (adds to KEYWORD_MAP rule 1 and SEO_PLAYBOOK §11)

| # | Rule | Source |
|---|---|---|
| R1 | **One anchor phrase → one target, site-wide.** Keep an anchor registry (`src/lib/entities.ts`, §5.4): "heart line" and "love line" → `/heart-line/` only; "marriage line" → `/marriage-line/`; "palm reading app" → `/app/`; "free palm reading" → `/`; "palm reading tools" → `/tools/`; "which hand to read" → `/which-hand-to-read/`; "how to read palm lines" → `/palm-reading/`; "lines on your palm" → `/hand-lines/`. check-web flags an anchor used for two targets. | Koray: same anchor to different pages confuses ranking |
| R2 | Anchor = the target's canonical topic (its primary keyword, H1 noun phrase or a synonym from its keyword cluster). Never "click here", "Open the guide", "Read the guide", "See what the app does", "their own page", "All tools". | Koray: align anchor with target title/H1 |
| R3 | **≤ 3 identical anchors per page in main content.** The **first** link to a target in the main content gets the best anchor (only the first link's anchor is assumed to count). | Koray (Oncrawl case study) |
| R4 | No links in the answer-first paragraph; no link on the first word of a paragraph. | Koray |
| R5 | Main content ≥ boilerplate: every indexable guide has ≥ 5 contextual in-body links to other guides (not counting breadcrumb, related, footer). Guides have 14–42 main-content links in total today (template links included); don't grow past ~45. | Koray (≈ 10–15 contextual) + SEO_PLAYBOOK |
| R6 | **Card links are title-only anchors** (stretched-link CSS `::after` keeps the whole card clickable). The accessible name = the title. Fixes the home and `/hi/` guide cards, the tool cards, and the locked cards on home / `/app/`. | Clean anchor-text index |
| R7 | The line pager (`LineSteps`) uses full names: "Heart line", not "Heart". | R2 |
| R8 | Vary the central entity across anchors (palm reading / palmistry / hand reading / हस्तरेखा) **only across different targets' registered synonyms**, never the same synonym to two targets. | Koray: synonyms, central entity in anchors |
| R9 | Hindi pages: Devanagari anchors to Hindi pages; a link to an English page has the Hindi entity name + "(English)", with `hreflang="en"` on the `<a>` (the component already does this). | CONTENT_GUIDE §3 |
| R10 | Footer = hubs + trust + legal only, once the site passes ~30 guides. The footer's line links then move to `/hand-lines/`. The footer is boilerplate: it gives crawl paths, not relevance. | Koray: avoid footer reliance |

### 4.5 Links to add or change (from → to → anchor)

| # | From | To | Anchor | Where on the page |
|---|---|---|---|---|
| 1 | `/` | `/which-hand-to-read/` | which hand to photograph | "How it works", step 1 |
| 2 | `/` | `/palm-reading/` | how to read palm lines | "Learn the lines on your palm" intro (replaces a generic "Guides") |
| 3 | `/heart-line/`, `/head-line/`, `/life-line/`, `/fate-line/` | `/palm-reading/` | how to read palm lines (vary: "the 7 steps of a palm reading") | "Check yourself" intro or the end-of-guide next step |
| 4 | all 11 guides (end block) | `/app/` | PalmSays palm reading app / palm reading app for Android (alternate) | End block, above the Play badge |
| 5 | `/hand-lines/` | `/app/` | palm reading app | "The PalmSays app reads the four major lines…" sentence |
| 6 | `/is-palmistry-real/` | `/heart-line/`, `/head-line/`, `/fate-line/` | heart line · head line · fate line | "Can palm reading predict…?" and "Where palm lines come from" |
| 7 | `/is-palmistry-real/` | `/simian-line/` | single palmar crease (simian line) | "Where palm lines come from" (medical creases sentence) |
| 8 | `/which-hand-to-read/` | `/hand-lines/` | lines on your palm | "Which hand for each line?" intro |
| 9 | `/hand-lines/` | `/palm-mounts/` (when live) | mounts of the palm | Intro and a new "Lines and mounts" sentence |
| 10 | `/palm-reading/` step 7 | `/palm-mounts/` (when live) | palm mounts in palmistry | Step 7 |
| 11 | `/palm-reading/` step 2 | `/hand-types/`, `/palmistry-fingers/` (when live) | hand types in palmistry · fingers in palmistry | Step 2 |
| 12 | `/tools/palm-map/` | `/palm-mounts/` (when live) | read the mounts guide → "palm mounts guide" | Result panel footer |
| 13 | `/fate-line/` | `/sun-line/`, `/career-palmistry/` (when live) | sun line · career palmistry | "The fate line and your work" |
| 14 | `/heart-line/` | `/marriage-line/` | marriage line (✓ exists; check it is the first link to that target) | FAQ "Can the heart line predict marriage?" |
| 15 | every guide Sources block | `/editorial-policy/` | how we choose sources | Under the sources list |
| 16 | `/palm-reading/` "Words to know" | `/palmistry-terms/` (when live) | palmistry terms (glossary) | End of that block |
| 17 | `/` guide cards, `/hi/` guide cards | each guide | title only ("Heart line") | R6 fix |
| 18 | `/` locked cards (the sample reading) | `/app/` | "the full reading in the app" (title-only) | R6 fix |
| 19 | the 8 rule-tool pages ("See what the app does") | `/app/` | PalmSays palm reading app · palm reading app for Android · what the app reads (rotate) | Tool end block |
| 20 | `LineSteps` (all pillars) | pillars | Heart line / Head line / Life line / Fate line | R7 fix |
| 21 | `/hand-lines/` (4× "Open the guide"), `/palm-reading/` ("Open the guide" / "Open the <line> guide" in the line lessons), `/head-line/` → double, `/head-line/double/` → head, `/simian-line/` → heart | the pillar or sub-page | "heart line meaning", "double head line", "head line meaning" (entity + meaning) | R2 fix (the component's default text) |
| 22 | `/palm-reading/` | `/head-line/double/` | double head line (replaces "their own page") | Step 4 (head line) |
| 23 | `/simian-line/` | `/hand-lines/` | lines on your palm | "What does a simian line look like?" |
| 24 | `/marriage-line/` | `/which-hand-to-read/` | which hand to read for the marriage line | "For women and men: the same line" |

### 4.6 Related-guides logic
- **Selection:** same EAV parent first (line ↔ line), then the **attribute bridge** (heart → marriage; head → double; life → broken; fate → career/sun), then one outer page (`/is-palmistry-real/` only on pages without a limits-box link to it).
- **Size:** 3–4. **Anchor:** the crumb (entity name).
- **Never related-link** a page that isn't live (✓ `isLive` already filters).
- When `/palm-mounts/` is live, pillars get the mount their line starts or ends on (heart → mounts, a Mercury/Jupiter mention) as the 4th related item.

---

## 5. Entity and structured-data spec

### 5.1 Principles (Google rules, verified 2026; research pass b)
- Structured data must describe **visible content**. No markup for things not on the page.
- **FAQPage:**
  - **Google retired the FAQ rich result entirely.** The changelog of 8 May 2026 says it no longer appears in Search from 7 May 2026, and the docs were removed on 15 June 2026. It was limited to government and health sites from Aug 2023.
  - The type is still valid schema.org and harmless, but it has **no Google display value** and costs bytes on every guide.
  - **Plan (D9): drop the FAQPage JSON-LD** from guides and home. Keep the visible `<details>` FAQ, which is what users, snippets and AI answers read. This also updates SEO_PLAYBOOK §6 (the "FAQ" row).
- **HowTo:** rich results deprecated (2023). Never used (✓ banned in `schema.ts`).
- **No `AggregateRating` or `Review`** (✓ banned). The app rich result needs a rating, so `/app/` shows as a normal result. That is fine.
- **Article** (Google docs updated 2026-09-08):
  - No required properties.
  - Recommended: `headline`, `image`, `datePublished` / `dateModified` (ISO 8601 with a timezone) and `author`.
  - `image`: ideally 16:9, 4:3 and 1:1 versions, each ≥ 50K pixels.
  - `author`: a Person, `name` = the name only, plus a `url` or `sameAs` to a profile page.
  - Since March 2026 Google uses `primaryImageOfPage` and `og:image` when choosing thumbnails. This makes X4 (a per-page image) worth doing.
- **BreadcrumbList:**
  - Needs ≥ 2 items.
  - Google prefers a "typical user path" over mirroring the URL (✓ our logical crumbs).
  - Not shown on mobile results since Jan 2025, but still used on desktop and for understanding.
- **Ratings in structured data:** SoftwareApplication / MobileApplication rich results **require** `aggregateRating` or `review`, which must come from real users and not be self-serving (Google, updated July 2026). We have none on our site, so `/app/` gets no app rich result. **Never add a rating.**
- **Deprecated types** (for awareness; none used here): Book Actions (deprecation reversed), Course Info, Claim Review, Estimated Salary, Learning Video, Special Announcement, Vehicle Listing (2025), Practice Problem (2026), HowTo (2023), Sitelinks Search Box (2024).
- **`about` / `mentions`:** schema.org properties with no rich-result feature. Their value is entity disambiguation (understanding), not display. Use sparingly and truthfully: `about` = 1–2 main entities; `mentions` ≤ 8.
- **`sameAs`:** only to the exact same entity (Wikidata item + Wikipedia article). Never to a broader or related item.
- **`DefinedTerm` / `DefinedTermSet`:** schema.org types for glossary terms (`name`, `description`, `inDefinedTermSet`, `termCode`, `url`, `alternateName`). No rich result; used for understanding.

### 5.2 JSON-LD per page type (one `@graph` per page; stable `@id`s)

**IDs:**
- `https://palmsays.com/#organization`, `https://palmsays.com/#website`, `https://palmsays.com/about/deepak-chauhan/#person` (as today).
- New: `{url}#webpage`, `{url}#article`, `{url}#primaryimage`, `{url}#breadcrumb`, `https://palmsays.com/app/#app`, `https://palmsays.com/palmistry-terms/#set`, `https://palmsays.com/palmistry-terms/#<term-id>` (the entity registry, §5.4).

**Guide** (all guides; Hindi = same with `inLanguage: "hi"` and Hindi names):
```json
{"@context":"https://schema.org","@graph":[
 {"@type":"WebPage","@id":"https://palmsays.com/heart-line/#webpage","url":"https://palmsays.com/heart-line/",
  "name":"Heart Line on Palm: Meaning, Types & the Love Line","isPartOf":{"@id":"https://palmsays.com/#website"},
  "breadcrumb":{"@id":"https://palmsays.com/heart-line/#breadcrumb"},"primaryImageOfPage":{"@id":"https://palmsays.com/heart-line/#primaryimage"},
  "inLanguage":"en","lastReviewed":"2026-09-26",
  "about":{"@id":"https://palmsays.com/palmistry-terms/#heart-line"}},
 {"@type":"Article","@id":"https://palmsays.com/heart-line/#article","isPartOf":{"@id":"https://palmsays.com/heart-line/#webpage"},
  "mainEntityOfPage":{"@id":"https://palmsays.com/heart-line/#webpage"},
  "headline":"Heart line meaning in palmistry (the love line)","description":"…",
  "image":{"@id":"https://palmsays.com/heart-line/#primaryimage"},
  "datePublished":"…+05:30","dateModified":"…+05:30","inLanguage":"en",
  "author":{"@id":"https://palmsays.com/about/deepak-chauhan/#person"},
  "publisher":{"@id":"https://palmsays.com/#organization"},
  "publishingPrinciples":"https://palmsays.com/editorial-policy/",
  "about":[{"@id":"https://palmsays.com/palmistry-terms/#heart-line"}],
  "mentions":[{"@id":"https://palmsays.com/palmistry-terms/#palmistry"},{"@id":"https://palmsays.com/palmistry-terms/#head-line"},
              {"@id":"https://palmsays.com/palmistry-terms/#simian-line"},{"@id":"https://palmsays.com/palmistry-terms/#marriage-line"}],
  "citation":[{"@type":"Book","name":"Palmistry for All","datePublished":"1916",
               "author":{"@type":"Person","name":"Cheiro","sameAs":["https://www.wikidata.org/wiki/Q728021","https://en.wikipedia.org/wiki/Cheiro"]}},
              {"@type":"Book","name":"Indian Palmistry","datePublished":"1895","author":{"@type":"Person","name":"Mrs J. B. Dale"}}]},
 {"@type":"ImageObject","@id":"https://palmsays.com/heart-line/#primaryimage","url":"https://palmsays.com/og/heart-line.jpg","width":1200,"height":630},
 {"@type":"BreadcrumbList","@id":"https://palmsays.com/heart-line/#breadcrumb","itemListElement":[…]}
]}
```
(No FAQPage node: retired by Google in May 2026, D9.)

**`about` choices** for pages with a verified Wikidata item (§5.3):
- `/life-line/` → `life-line` (Q1700006)
- `/hand-lines/` → `palm-lines` (Q3906698)
- `/simian-line/` → `simian-line` (Q1934946)
- `/palm-reading/`, `/is-palmistry-real/` → `palmistry` (Q182687)

Heart, head and fate have **no** Wikidata item. Their `about` is our own DefinedTerm, plus `mentions` → `palmistry` (Q182687) and `palm-lines` (Q3906698), so the page is still tied to known entities.
- The DefinedTerm nodes themselves (with `sameAs` → Wikidata/Wikipedia) live **once**, on `/palmistry-terms/`. Other pages reference them by `@id`, which keeps each guide's JSON-LD small (≈ +0.3–0.5 KB gzip, not +2 KB).
- **One exception:** for the page's own `about` term, also inline `name` (+ `sameAs` where §5.3 has one), so the page is self-describing even if a crawler doesn't join `@id`s across pages. Google handles cross-page `@id`s inconsistently, so this is cheap insurance.
- **Reviewer:** when a real reviewer exists, `WebPage.reviewedBy` = Person (name, url) + `lastReviewed`. **Never before** (CONTENT_GUIDE §4.8).
- **Book `citation`s:** every `bookSource` in the front matter becomes a `Book` (name, author Person, datePublished = the edition year from `books.ts`). `sameAs` only for authors with a verified Wikidata item (Cheiro; others only if verified, §5.3).

**Home `/` and `/hi/`:** Organization + WebSite (as now), plus a `WebPage` (`about` → `#palmistry`, `mentions` → the 4 major lines). The FAQPage JSON-LD is dropped (D9); the visible FAQ stays, with the X2 fix. `WebApplication` returns when the web reading is live.

**Tool page:** `WebApplication` (as now) + `@id` `{url}#app` + `isPartOf` → `https://palmsays.com/tools/#collection` + `about` → the term it serves (heart line finder → `#heart-line`; palm map → `#palm-lines` + `#palm-mounts`; hand type → `#hand-shape`; finger reader → `#fingers`; which-hand quiz and left-vs-right → `#which-hand`; signs checker → `#palm-signs`; photo checker → `#palm-photo`; quiz → `#palmistry`), plus BreadcrumbList.

**`/tools/`:** CollectionPage (`@id #collection`) + ItemList (✓) + `about` → `#palmistry`.

**`/app/` and `/hi/app/`:**
```json
{"@type":"MobileApplication","@id":"https://palmsays.com/app/#app","name":"Palm Read AI","alternateName":"PalmSays",
 "url":"https://palmsays.com/app/","sameAs":["https://play.google.com/store/apps/details?id=com.palmreadai.app"],
 "installUrl":"<Play link with referrer>","downloadUrl":"https://play.google.com/store/apps/details?id=com.palmreadai.app",
 "operatingSystem":"ANDROID","applicationCategory":"LifestyleApplication","inLanguage":["en","hi"],
 "featureList":["Traces the heart, head, life and fate lines on your palm photo","Meanings from named classical palmistry books","Hindi and English"],
 "screenshot":["https://palmsays.com/…/app-screen-1.webp"],"offers":{"@type":"Offer","price":"0","priceCurrency":"INR"},
 "publisher":{"@id":"https://palmsays.com/#organization"},"about":{"@id":"https://palmsays.com/palmistry-terms/#palmistry"}}
```
- No `aggregateRating`.
- `featureList` strings = the same sentences as the page (KBT).
- `applicationCategory` `[verify]` against the Play Console.

**Organization** (on `/` and `/about/`):
```json
{"@type":"Organization","@id":"https://palmsays.com/#organization","name":"PalmSays","url":"https://palmsays.com/",
 "logo":{"@type":"ImageObject","url":"https://palmsays.com/logo-512.png","width":512,"height":512},
 "founder":{"@id":"https://palmsays.com/about/deepak-chauhan/#person"},
 "publishingPrinciples":"https://palmsays.com/editorial-policy/",
 "knowsAbout":["https://www.wikidata.org/wiki/Q182687","https://www.wikidata.org/wiki/Q7410688","https://www.wikidata.org/wiki/Q3906698"],
 "sameAs":["https://play.google.com/store/apps/details?id=com.palmreadai.app" /* + real social profiles only */],
 "owns":{"@id":"https://palmsays.com/app/#app"}}
```
(`legalName`, `address`, `email` once the company details are set: owner item 9.)

**Person** (author page, when indexable): `ProfilePage` with `mainEntity` Person (`@id #person`, name, url, `jobTitle` "Founder", `worksFor` → org, `image`, `knowsAbout` → Palmistry (Wikidata), `sameAs` = real profiles). **No palmistry credentials he doesn't have.**

**Hindi pages:** the same graph with `inLanguage: "hi"`, a Hindi `headline` and `name`, and a DefinedTerm `alternateName` in Devanagari. **Never English JSON-LD text on a Hindi page** (palmly's bug, R05).

### 5.3 Verified Wikidata / Wikipedia IDs

Every ID below was fetched live from the Wikidata API on 2026-09-28 (research pass b). **Items that do not exist are listed as "none"; never invent or approximate one.** `sameAs` goes only to the **same** thing; a related thing goes in `about` / `mentions` instead.

| Our term (glossary id) | Wikidata | Label / description (as returned) | enwiki | hiwiki | How we use it |
|---|---|---|---|---|---|
| Palmistry (`palmistry`); also Hast Rekha Shastra | **Q182687** | palmistry: "foretelling the future through the study of the palm". Aliases include chiromancy, chirognomy, cheiromancy, chirology, palm reading, hand analysis. Hindi label **हस्तरेखा शास्त्र** | [Palmistry](https://en.wikipedia.org/wiki/Palmistry) | [हस्तरेखा शास्त्र](https://hi.wikipedia.org/wiki/हस्तरेखा_शास्त्र) | `sameAs` on the `palmistry` DefinedTerm; `about` on `/`, `/palm-reading/`, `/is-palmistry-real/`, `/tools/`, `/app/`; `knowsAbout` on the Organization and Person. **Hast Rekha Shastra is the same item** (its hi label), so no separate `sameAs` |
| Chirognomy, chiromancy | none (aliases of Q182687) | — | — | — | Glossary terms with **no** `sameAs` (they are aspects, not separate items) |
| Life line (`life-line`) | **Q1700006** | life line (no description); instance of palmar crease | none (dewiki: Lebenslinie) | none | `sameAs` on `life-line` → `about` on `/life-line/` |
| Heart, head, fate, sun lines | **none** | Q2195421 "heart line" is geometry; Q1615182 is roller coasters: **never use** | — | — | DefinedTerm only (our own `@id` is the identity) |
| Palm lines / palmar crease (`palm-lines`) | **Q3906698** | palmar crease: "skin wrinkles in the palm of the hand" | [Palmar crease](https://en.wikipedia.org/wiki/Palmar_crease) | none | `sameAs` on `palm-lines` (same physical thing; the palmistry meaning is our description) → `about` on `/hand-lines/` |
| Simian line (`simian-line`) | **Q1934946** | single transverse palmar crease: "medical condition" | [Single transverse palmar crease](https://en.wikipedia.org/wiki/Single_transverse_palmar_crease) | none | `sameAs` on `simian-line` → `about` on `/simian-line/`. **No medical conditions in `mentions`** (K10) |
| Dermatoglyphics | **Q904206** | "scientific study of finger- and toeprints" | [Dermatoglyphics](https://en.wikipedia.org/wiki/Dermatoglyphics) | none | `mentions` on `/is-palmistry-real/` (after U8) |
| Hand | **Q33767** | "extremity at the end of an arm…" | [Hand](https://en.wikipedia.org/wiki/Hand) | [हाथ](https://hi.wikipedia.org/wiki/हाथ) | `mentions` on `/palm-reading/`, `/hand-types/` |
| Palm (of the hand) | **Q2001588** | "central region of the front of the human hand…" | [Palm of the hand](https://en.wikipedia.org/wiki/Palm_of_the_hand) | none | `mentions` on `/palm-reading/`, `/hand-lines/` |
| Finger | **Q620207** | "one of usually five articulated digits…" | [Finger](https://en.wikipedia.org/wiki/Finger) | none | `about` on `/palmistry-fingers/` (with our `fingers` term) |
| Thumb | **Q83360** | "first finger of the hand" | [Thumb](https://en.wikipedia.org/wiki/Thumb) | [अंगुष्ठ](https://hi.wikipedia.org/wiki/अंगुष्ठ) | `mentions` on `/palmistry-fingers/`, `/tools/finger-reader/` |
| Fingerprint | **Q178022** | "biometric identifier" | [Fingerprint](https://en.wikipedia.org/wiki/Fingerprint) | [अंगुलि छाप](https://hi.wikipedia.org/wiki/अंगुलि_छाप) | `mentions` on `/is-palmistry-real/` (dermatoglyphics sentence) |
| Mount of Venus (`mount-venus`) | none usable (Q125364068 = a disambiguation page) | — | — | — | DefinedTerm with **`about` → thenar eminence Q530315** (the body area it names), not `sameAs` |
| Thenar eminence | **Q530315** | "most fleshy portion of the palm… adjacent to the second joint of the thumb" | [Thenar eminence](https://en.wikipedia.org/wiki/Thenar_eminence) | none | `about` target of `mount-venus`; `mentions` on `/palm-mounts/` |
| Hypothenar eminence | **Q1089522** | "group of three muscles of the palm" | [Hypothenar eminence](https://en.wikipedia.org/wiki/Hypothenar_eminence) | none | `about` target of `mount-moon` (the outer lower palm; [verify] the wording "roughly the area of") |
| Samudrika Shastra (`samudrika-shastra`) | **Q7410688** | "vedic study of body feature and aura reading" | [Samudrika Shastra](https://en.wikipedia.org/wiki/Samudrika_Shastra) | [सामुद्रिक शास्त्र](https://hi.wikipedia.org/wiki/सामुद्रिक_शास्त्र) | `sameAs` on its term; `mentions` on `/palm-reading/`, `/indian-palmistry/`; `knowsAbout` |
| Hindu astrology / Jyotisha | **Q740253** | "astrology originating from Ancient India" (aliases: Vedic astrology, jyotisha) | [Hindu astrology](https://en.wikipedia.org/wiki/Hindu_astrology) | [भारतीय ज्योतिष](https://hi.wikipedia.org/wiki/भारतीय_ज्योतिष) | `mentions` on `/indian-palmistry/`, `/palm-mounts/` (planet names). **Do not use** the enwiki "Jyotisha" sitelink item Q113174138 (it is a different item) |
| Astrology | **Q34362** | astrology | [Astrology](https://en.wikipedia.org/wiki/Astrology) | [फलित ज्योतिष](https://hi.wikipedia.org/wiki/फलित_ज्योतिष) | `mentions` on `/is-palmistry-real/` ("palm reading and astrology are examples of…") |
| Divination | **Q1043197** | divination | [Divination](https://en.wikipedia.org/wiki/Divination) | ([दैववाणी](https://hi.wikipedia.org/wiki/दैववाणी): the label looks loose; don't use it) | `mentions` on `/history-of-palmistry/` |
| Pseudoscience | **Q483677** | "unscientific claims wrongly presented as scientific" | [Pseudoscience](https://en.wikipedia.org/wiki/Pseudoscience) | [छद्म विज्ञान](https://hi.wikipedia.org/wiki/छद्म_विज्ञान) | `mentions` on `/is-palmistry-real/` |
| Barnum effect (Forer effect) | **Q653175** | the Barnum effect (alias: Forer effect) | [Barnum effect](https://en.wikipedia.org/wiki/Barnum_effect) | none | `mentions` on `/is-palmistry-real/`; glossary term `sameAs` |
| Cheiro (William John Warner) | **Q728021** | "Irish astrologer, palmist, and numerologist (1866–1936)" | [Cheiro](https://en.wikipedia.org/wiki/Cheiro) | [कीरो](https://hi.wikipedia.org/wiki/कीरो) | `sameAs` on the author Person in every `Book` citation of Cheiro's books; `mentions` on `/history-of-palmistry/` |
| Handedness | **Q2421902** | handedness | [Handedness](https://en.wikipedia.org/wiki/Handedness) | (the hiwiki link is about left-handers, and its label looks wrong: don't use it) | `mentions` on `/which-hand-to-read/` |
| Dominant hand (`dominant-hand`) | **Q19978810** | "hand favored or used primarily by a handed individual" | none | none | `sameAs` on its term; `mentions` on `/which-hand-to-read/` (body wording only, K11) |
| Palmist (profession) | **Q110875660** | chiromancer: "profession; palm reader" | none | none | Glossary term `palmist` `sameAs` |
| Mobile app / Android | **Q620615** / **Q94** | mobile app / Android | [Mobile app](https://en.wikipedia.org/wiki/Mobile_app) / [Android](https://en.wikipedia.org/wiki/Android_(operating_system)) | [मोबाइल अनुप्रयोग](https://hi.wikipedia.org/wiki/मोबाइल_अनुप्रयोग) / [एंड्रॉइड](https://hi.wikipedia.org/wiki/एंड्रॉइड_(प्रचालन_तंत्र)) | Not needed (`operatingSystem: "ANDROID"` is enough). Skip |
| Chinese palmistry | **none** | — | — | — | DefinedTerm only |

**Rules:**
1. `sameAs` lists the Wikidata URL (`https://www.wikidata.org/wiki/Q182687`), then the enwiki URL, then the hiwiki URL if one exists.
2. On Hindi pages, the hiwiki URL may come first.
3. Re-check the IDs once a year (Wikidata items can be merged).

### 5.4 The glossary / entity registry — `/palmistry-terms/` (+ `/hi/palmistry-terms/`)

**One data file, many uses:** `src/lib/entities.ts` (build-time data, no JS shipped). Each entry:

| Field | Example (heart line) | Used by |
|---|---|---|
| `id` | `heart-line` | `@id` = `https://palmsays.com/palmistry-terms/#heart-line`; the anchor registry key |
| `name.en` / `name.hi` | Heart line / हृदय रेखा | Glossary, JSON-LD `name` / `alternateName` |
| `alt` | love line · mensal line (older English) · hriday rekha · प्रेम रेखा | `alternateName`; synonym anchors (R8) |
| `group` | line-major | Glossary sections; related logic |
| `def.en` / `def.hi` | "The heart line is the highest long line across the palm, just below the fingers, starting at the little-finger edge. Palmistry reads it for emotional life." (≤ 40 words) | The glossary text; **must equal the pillar's location + reading sentence** (a check-web test compares them) → KBT consistency |
| `owner` | `/heart-line/` | Glossary "Read more" link; anchor registry target |
| `anchors` | heart line · love line | R1 check (one phrase → one target) |
| `wikidata` / `wikipedia` / `hiwiki` | only verified values (§5.3) | `sameAs` |
| `appReads` | true | "What the app reads" lists (one source of truth) |

**Glossary page design** (~1,500–2,500 words; the guide layout without the Find module):
- **H1:** "Palmistry terms: a glossary of palm reading words (with Hindi names)". **Title:** "Palmistry Terms: Palm Reading Glossary with Hindi Names" (55).
- **Answer-first:** "Palmistry has its own words for the lines, mounts, shapes and marks of the hand. This glossary gives each term's meaning in one sentence, its Hindi name, and the guide that explains it."
- **Sections (H2),** each term an `<h3 id="heart-line">` + a `<dl>` definition:
  - Palmistry and its traditions (palmistry, chiromancy, chirognomy, Hast Rekha Shastra, Samudrika Shastra, dermatoglyphics)
  - The major lines
  - The minor lines (sun, Mercury, marriage, children, girdle of Venus, intuition, travel, bracelets, ring of Solomon, line of Mars, via lasciva, money line (modern), education line)
  - Mounts (Jupiter … Mars × 2, plain of Mars)
  - Hand shapes (elements; Cheiro's 7)
  - Fingers and thumb (phalanges, knotty / smooth, thumb angle)
  - Signs and marks (island, chain, cross, mystic cross, star, square, triangle, grille, fork, tassel, trident / trishul, fish / matsya, M)
  - Reading words (dominant / writing hand, active / passive hand, sister line, influence line, quadrangle)
  - Variants (simian line / single palmar crease, Sydney line, double head line)
  - Science words (flexion crease, Barnum effect, cold reading)
- **Each term:** the Hindi name in a `<span lang="hi">`, the definition, "Read more: <owner page>" (anchor = term name), and a source chip when the definition makes a tradition claim.
- **Schema:** `DefinedTermSet` (`@id #set`, name, `inLanguage`) + `hasDefinedTerm` → every `DefinedTerm` (`@id #<id>`, name, `alternateName` [Hindi, other names], description = `def`, `inDefinedTermSet`, `url` = the owning page, `sameAs` = verified Wikidata / Wikipedia). About 90 terms at ≈ 150 bytes gzip each ≈ 10–14 KB gzip of JSON-LD. **Budget:** give the glossary its own budget row (HTML ≤ 45 KB gzip; no inline SVG; no FAQPage) or split JSON-LD per section (D2).
- **Links:** from the footer ("Palmistry terms"), `/palm-reading/` "Words to know", `/hand-lines/` names table, and every guide's quick facts "Other names" line (one link).
- **Hindi:** `/hi/palmistry-terms/` is cheap to review (short entries) and **entity-rich in Devanagari**. It is the fastest way to give the Hindi section topical coverage before all the Hindi twins exist. Hindi order #3 (§6.4).

### 5.5 Knowledge-based-trust (consistency) checks (new check-web rules)
1. Each guide's answer-first "where it is" clause == `entities.ts` `def` for its `about` term (normalised).
2. "What the app reads" lists on `/`, `/app/`, `/hand-lines/`, `/about/` and `llms.txt` come from `entities.ts` `appReads` (no hand-typed lists).
3. The free-reading FAQ text on home = `site.ts` state (soon vs live) → prevents X2 happening again.
4. Numbers (prevalence of the single palmar crease, "about 1 in 30" per MedlinePlus) appear only from one constant with its source.
5. The brand relation sentence ("PalmSays, on Google Play as Palm Read AI") comes from `site.ts`.

---

## 6. Content production plan

### 6.1 Update first (existing pages; days −7 to 14)

In this order; each is small and makes the pages already built stronger:

| # | Page | Change | Words | Blocked by |
|---|---|---|---|---|
| U1 | `/` | X2 FAQ fix; one-sentence palm reading definition; links #1, #2; card anchors (R6) | +40 | — |
| U2 | `/hand-lines/` | New answer-first; names table with Hindi names; 6 minor-line H3s (girdle of Venus, intuition, travel, line of Mars / sister, ring of Solomon, via lasciva: 40–80 words each, attributed, "the app doesn't read it"); "How many lines…" H3; chart `<img>` file; parent → `/palm-reading/`; demote the CTA H2 | +700 | Hindi names [verify] with the reviewer; chart file |
| U3 | 4 pillars | Heading spec §3.2 (module title, H3 questions, H4 values); end-matter headings with the entity; link #3 | ±0 | D4; the sprite move for anything that adds weight |
| U4 | `/life-line/`, `/fate-line/` | "Marks on the <line>" H2 (islands, squares, crosses; attributed; photo limits); fate start points (Venus, head, heart) + forked + timing myth; life: crossing lines, ending, branches | +350 each | Sprite move (weight); life = the owner's OK again (YMYL) |
| U5 | `/heart-line/`, `/head-line/` | Heart: curved, double, branches down, no heart line, heart vs head. Head: wavy, quadrangle, branches, head vs heart (from the blueprint) | +300 each | Sprite move |
| U6 | `/palm-reading/` | Definition H2 moved up; chiromancy / chirognomy + other names; traditions line with bridges; fingers 2 sentences; merge the 2 limit sections | +150 | Sprite move (34.3 KB) |
| U7 | `/which-hand-to-read/` | Three-tradition table (Chinese row only with a source); ambidextrous; active / passive | +200 | Source for the Chinese rule [verify] |
| U8 | `/is-palmistry-real/` | Dermatoglyphics vs palmistry; flexion creases sentence; links #6, #7 | +150 | — |
| U9 | `/marriage-line/` | "Marriage line touching the heart line" H3 (honest), island, no marriage line | +200 | The owner's OK (YMYL) |
| U10 | Tools (13) | Entity words in generic H2s; `about` schema | ±0 | — |
| U11 | `/app/`, `/about/` | Brand relation sentence; anchors #19; schema §5.2 | +30 | — |

### 6.2 New pages (ordered; P2 and P3 from PROJECT_MASTER plus the new nodes)

Each follows CONTENT_GUIDE v3 (v4 teaching blocks where they fit) and the heading spec §3.2. "Query template" = the representative query → the represented set it must cover.

| Order | URL | Feature | Query template → represented queries | Heading vector (H2s in order) | Required attributes (R / Ra / U) | Words | Visuals |
|---|---|---|---|---|---|---|---|
| N-1 | `/palmistry-terms/` 🆕 | new WEB-FEAT (D2) | "palmistry terms" → "what is the <term> in palmistry" | See §5.4 | §5.4 | 1,500–2,500 | none (text + dl) |
| N-2 | `/palm-mounts/` | WEB-FEAT-058 → moved up (D3) | "palm mounts" → mount of Venus / Moon / Jupiter / Saturn / Sun / Mercury / Mars; raised / flat mount; which mount is for… | Where are the mounts on your palm? · Mount by mount (H3 each, with Hindi and planet name) · Raised, flat or displaced mounts · Mounts and the lines that start on them · Marks on the mounts · Which hand · Check yourself · limits · Myths (e.g. "mount for money") · FAQ | §2.3 N8 | 1,500–2,000 | Mount chart `<img>` (EN + HI labels); photo areas labelled AREAS (v4) |
| N-3 | `/hand-types/` | WEB-FEAT-041 | "hand types in palmistry" → earth/air/fire/water hand, square/conic/spatulate hand, what is my hand type | What hand type do you have? (tool card 9) · The four element hands (modern system, H3 each) · Cheiro's seven hand types · Palm shape vs finger length · Mixed hands · Which hand · limits · FAQ | §2.4 | 1,800–2,500 | 4 hand-shape drawings (files) |
| N-4 | `/palmistry-fingers/` | WEB-FEAT-058 → P2 | "palmistry fingers" → index vs ring finger, thumb palmistry, finger lines, phalanges, knotty fingers | Finger by finger (H3 each + mount) · Finger length: index vs ring · The thumb (angle, length, phalanges) · Phalanges (3 sections) · Joints and gaps · Lines on the fingers · Science note (digit ratio, 1 sentence → real) · limits · FAQ | §2.4 | 1,200–1,600 | Finger chart file; tool 13 card |
| N-5 | `/sun-line/` | WEB-FEAT-043 | "sun line palmistry" → Apollo line, success line, no sun line, sun line types | Where is the sun line? · Other names · Sun line types (H3 → H4) · No sun line: common · Sun line vs fate line · Marks · Which hand · limits · FAQ | §2.3 N7 | 1,200–1,800 | Variation drawings in the sprite + 1 file |
| N-6 | `/palm-crosses/` | WEB-FEAT-044 | "cross on palm" → mystic cross, X on palm, cross on mounts / lines | What is a mystic cross? · X on the palm · Crosses on mounts (H3s) · Crosses on lines · Can a photo show a cross? · limits · FAQ | §2.4 | 1,200–1,800 | Positions chart file |
| N-7 | `/blog/rarest-palm-lines/` | WEB-FEAT-052 (post 6) | "rare palm lines" → rarest line, rare hand lines meaning | Hub post (K5) | — | 1,000–1,500 | — |
| N-8 | `/palmistry-m/` | WEB-FEAT-039 | "m on palm" → m on both hands, left / right, is it rare | What forms an M? · How common is it? (sourced or "no figure") · Both hands · What books say (no classical source) · limits · FAQ | §2.4 | 1,200–1,600 | M diagram file |
| N-9 | `/lucky-signs/` | WEB-FEAT-046 | "lucky signs on palm" → fish, trident, star, triangle, square | Sign by sign (H3) · Indian signs (attributed) · Can a photo show them? · limits · FAQ | §2.4 | 1,500–2,000 | Signs sheet file |
| N-10 | `/money-line/` | WEB-FEAT-040 | "money line" → wealth line, money triangle, no money line | Is there a money line? · Lines read for work · Money triangle · limits · FAQ | §2.4 | 1,200–1,600 | — |
| N-11 | `/career-palmistry/` | WEB-FEAT-037 | "career palmistry" → job palmistry, business line | §2.4 | — | 1,500–2,200 | — |
| N-12 | `/life-line/broken/` | WEB-FEAT-036 | "broken life line" → overlapping, square over a break, one or both hands | SEO_PLAYBOOK §4 | care line | 1,200–1,800 | Break drawings |
| N-13 | `/children-line/` | WEB-FEAT-045 (YMYL) | "children line" (honest) | SEO_PLAYBOOK §4 | owner OK | 1,000–1,500 | — |
| N-14 | `/blog/do-palm-lines-change/` | WEB-FEAT-052 (post 3) | "do palm lines change" | Answer · creases vs fine lines · photos · FAQ | — | 1,000–1,500 | — |
| N-15 | `/blog/best-palm-reading-apps/`, `/blog/palm-reading-chatgpt-vs-palm-scanner/` | WEB-FEAT-052 (posts 1, 2) | "best palm reading app", "palm reading chatgpt" | CONTENT_GUIDE §7 | Disclosure | 1,200–1,800 | Screens |
| N-16 | `/indian-palmistry/` (+ `/hi/hast-rekha/`) | WEB-FEAT-058 → P3 first | "indian palmistry" → hast rekha shastra, samudrika shastra, vedic palm reading | What is Hast Rekha Shastra? · Samudrika Shastra (hedged) · Names of lines and mounts in Indian palmistry (table) · Which hand in Indian tradition · Auspicious signs (attributed) · Books (Dale 1895, Jain 1927) · How it differs from Western palmistry · limits · FAQ | §2.5 | 1,800–2,500 | Names chart (HI) |
| N-17 | `/history-of-palmistry/` | WEB-FEAT-058 | "history of palmistry" → origin, Cheiro, Aristotle myth | Timeline H2s · the 19th-century revival · Palmistry today (apps) · Sources | historians | 1,500–2,000 | Timeline (text) |
| N-18 | `/chinese-palmistry/` | WEB-FEAT-058 | "chinese palmistry" | Needs a specialist source first | — | 1,500–2,200 | — |
| N-19 | `/mercury-line/` | WEB-FEAT-058 (YMYL health) | "mercury line" | "Not a medical test" first | owner OK | 1,000–1,400 | — |
| N-20 | `/blog/can-palm-reading-predict-death/` | WEB-FEAT-059 | fear post | CONTENT_GUIDE §7 | owner OK, care line | 1,000–1,500 | — |
| N-21 | `/palmistry-pdf/` | WEB-FEAT-053 | lead magnet | blocked on WEB-SRV-008/013 | — | — | — |

### 6.3 Publishing cadence (momentum) — first 90 days

Koray's evidence (research a):
- A new domain ranks faster when it launches with a **connected network** and **keeps momentum rising**. His GetWordly launch went from one article every 3 days, to one every 2 days, to daily, then more.
- Stopping publication signals lost momentum.

This is balanced with SEO_PLAYBOOK §15, which caps us at ≤ 8 new indexable URLs a week, and with our review gates.

| Window | New URLs / week | What (in order) | Also counts as momentum |
|---|---|---|---|
| **Launch day (D0)** | ≈ 31 at once | Everything built: home, `/hi/`, `/app/`, `/hi/app/` (after review), 11 guides (YMYL after the owner's OK), `/tools/` + 12 indexable tools, `/about/`, `/editorial-policy/`, legal | Submit sitemaps; request indexing for the 11 guides + home + `/app/` |
| Days 1–14 (4 URLs) | ≈ 2 | `/palmistry-terms/`, `/palm-mounts/`, `/hand-types/`, `/hi/hand-lines/` | U1–U11 updates (`dateModified` changes only when the content really changes) |
| Days 15–30 (6) | ≈ 3 | `/palmistry-fingers/`, `/sun-line/`, `/palm-crosses/`, `/hi/palm-reading/`, `/hi/palmistry-terms/`, blog 6 | GSC-driven tweaks |
| Days 31–60 (≈ 15) | ≈ 3–4 | `/palmistry-m/`, `/lucky-signs/`, `/money-line/`, `/career-palmistry/`, `/life-line/broken/`, `/children-line/`, blogs 1, 2, 3; Hindi `/hi/life-line/`, `/hi/heart-line/`, `/hi/fate-line/`, `/hi/head-line/`, `/hi/marriage-line/`, `/hi/which-hand-to-read/` | First CTR pass |
| Days 61–90 (≈ 20–25) | ≈ 5–6 | `/indian-palmistry/` + `/hi/hast-rekha/`, `/history-of-palmistry/`, `/mercury-line/`, `/chinese-palmistry/` (if sourced), blog 7; Hindi `/hi/palm-mounts/`, `/hi/palmistry-m/`, `/hi/money-line/`, `/hi/lucky-signs/`, `/hi/children-line/`, `/hi/sun-line/`; `/hi/tools/` + the Hindi tool pages as reviewed (up to 13) | Refresh P1 pages from positions 8–20 |

- **Never a gap longer than 7 days** without a new URL or a real content update. If a review blocks a page, publish the next unblocked one.
- **Core before outer:** the outer section starts only after the core mounts / types / fingers / sun nodes exist, so outer pages have core pages to bridge into (Koray: outer pages pass relevance *to* the core).
- **Total by day 90:** ≈ 31 + ≈ 45–50 = ≈ 80 URLs (EN + HI), all distinct entities or attributes, no templated sets. Every week stays within the ≤ 8 cap.
- **If a page is blocked**, swap in the next unblocked page:
  - `/hand-types/` needs its element-system source settled (CONTENT_GUIDE §9.4);
  - `/chinese-palmistry/` needs a specialist source;
  - Hindi pages need the reviewer.

  For example, `/palmistry-fingers/` or `/sun-line/` can move forward. The rising rate matters more than the exact order within a window.

### 6.4 Hindi rollout order (each only after a person reads it; CONTENT_GUIDE §10)

1. `/hi/` + `/hi/app/`: built, **review before launch** (or `noindex`).
2. `/hi/hand-lines/`: the only Hindi hub with measured demand (1,510 IN "in hindi" rows); names table + chart with Devanagari labels.
3. `/hi/palmistry-terms/`: short entries, easy to review, gives the Hindi section entity coverage quickly.
4. `/hi/palm-reading/`: हाथ की रेखा कैसे देखें (strong Hindi autocomplete).
5. `/hi/life-line/`: हाथ में जीवन रेखा. India's biggest line page in English (9,900); Hindi competitors are fear-driven (Zee: "age, health and accidents"), so an honest page is a clear gap.
6. `/hi/heart-line/`: हृदय रेखा / प्रेम रेखा.
7. `/hi/fate-line/`: भाग्य रेखा.
8. `/hi/head-line/`: मस्तिष्क रेखा.
9. `/hi/marriage-line/`: शादी की रेखा (YMYL; the Hindi competitor predicts spouse death and divorce, research c, so honest content is the biggest trust gap).
10. `/hi/which-hand-to-read/`.
11. `/hi/palm-mounts/`, then the P2 Hindi twins (`/hi/palmistry-m/`, `/hi/money-line/`, `/hi/lucky-signs/`, `/hi/children-line/`), then `/hi/hast-rekha/`, then `/hi/tools/`.

Titles follow CONTENT_GUIDE §3 (Devanagari first + a Hinglish phrase). Every Hindi page covers the modifiers list (चित्र सहित / with pictures, महिला / पुरुष, कहां होती है, …) from KEYWORD_MAP §7. **"चित्र सहित" / "with pictures" is promised only when the page really has labelled pictures** (research c: Hindi competitors promise pictures and don't deliver; we can).

---

## 7. Technical and performance items (cost of retrieval)

Koray calls cost of retrieval the idea underneath topical authority: make the site cheap for Google to crawl, understand and serve. Practical rules: fewer requests, concise HTML, a consistent structure, formats that are easy to extract.

### 7.1 Weight budgets (the plan must fit them)

| Item | Now | Plan |
|---|---|---|
| Guide HTML gzip (budget 35 KB) | 26.9–34.3 KB; inline SVG 7.5–12.8 KB of it | **Move variation-card drawings to one SVG sprite** (`/img/guides/shapes.<hash>.svg`, `<symbol>` + `<use href>`; same-origin, cached across all guides; colours via `currentColor` / CSS variables). Expected: −8 to −10 KB per pillar. That pays for the JSON-LD `about`/`mentions` (+0.3–0.5 KB) and the new attribute sections (+1.5–3 KB) with room left. **Keep the hero trace inline** (LCP, the animation). |
| Shared CSS gzip (budget 25 KB) | 22.7 KB on v4 guides | No new global CSS. The glossary uses existing prose + `dl` styles. Any new component CSS is page-scoped (like `teach.css`). If a raise is ever needed, it takes a WEB-DEC row with the measured reason (no silent raise). |
| Header + footer gzip | ≈ 8.5 KB per page | Optional: slim the footer when R10 applies (fewer line links) |
| JSON-LD | 1.2–1.3 KB gzip | ≤ 2 KB per guide after §5.2 (DefinedTerms by `@id`); the glossary has its own row |
| FAQPage JSON-LD | inside the above (≈ 0.4–0.6 KB gzip per guide) | **Drop** (Google retired the FAQ rich result in May 2026; D9); the visible FAQ stays |

### 7.2 Crawl paths and sitemaps
- Every indexable page ≤ 3 clicks from home (✓ today; the glossary is linked from the footer and `/palm-reading/`).
- **Image sitemap** entries (`<image:image>`) for the diagram files in `sitemap-guides.xml` / `sitemap-core.xml` (SEO_PLAYBOOK §9 optional → **do it** once the chart files exist).
- `lastmod` = the real content date (✓). A new page is added to `pages.ts` in the same commit (✓ rule).
- IndexNow via Cloudflare Crawler Hints for Bing (SEO_PLAYBOOK §16) on every publish.
- Production robots: confirm `index, follow, max-image-preview:large` in the production build (audit item 7 still open).

### 7.3 `llms.txt` (cheap; Google says Search does not use it — AI optimization guide, 2026 — other AI crawlers may)
- Add a "Palmistry terms" section generated from `entities.ts`: the term, its one-line `def`, its URL, top 40 terms. This gives AI crawlers the same values as the pages (KBT).
- Add each guide's answer-first sentence under its link (from the front matter), so the file can't drift.
- Keep the honesty rules block (✓).

### 7.4 Images (diagrams)
- **File names** describe the entity + value: `heart-line-ending-under-index-finger.svg`, `palm-lines-chart.svg`, `mounts-of-the-palm-chart.svg`; Hindi: `hi-palm-lines-chart.svg` (ASCII file names; Devanagari only in alt and labels).
- **Alt text:** entity + value + where ("Forked heart line splitting into two branches under the index finger"), in the page's language; a caption under each figure.
- **ImageObject** licence fields (SEO_PLAYBOOK §12) on the chart files; CC BY 4.0 [rec], owner decision (open item).
- **Real photos:** only the credited or consented samples (✓); lines on a photo only from real scanner output (✓ rule).

### 7.5 OG, hreflang, canonical
- OG: per-page images exist (✓). Add them to `Article.image` (X4). Hindi pages need Hindi OG images (✓ `/og/hi*.jpg` pattern).
- hreflang: only live pairs (✓). When a Hindi twin goes live, add `twin` to both registry rows in the same commit (✓ `registryProblems`).
- Canonical: self, absolute, trailing slash (✓). The glossary's `#term` fragments never become canonical URLs.

### 7.6 AI Overviews / AI Mode
Google's guidance (research b):
- "AI features and your website", updated 2025-12-10: there are no extra requirements or special optimisations. The page must be indexed and eligible for a snippet.
- The AI optimization guide (May–July 2026) adds:
  - favour **non-commodity content** (unique, experience-based);
  - structured data is **not required** for generative AI search;
  - `llms.txt` is not used by Google Search;
  - "AEO/GEO is still SEO."

For us, the non-commodity content is the reader's own palm, a real scanner trace, a source for every meaning, and honest Hindi.

What helps us be cited:
- the answer-first sentences (✓);
- consistent facts across pages (KBT, §5.5);
- named sources (✓);
- entity clarity (§5).

**Risk:** AI Overviews answer "what does a forked heart line mean" without a click. Counter:
- the **unique** attributes only we have: "on your own photo", the tools, "books disagree", Hindi honest answers;
- the product CTA.

Measure the effect with GSC impressions vs CTR per group (§8).

---

## 8. Measurement

### 8.1 Search Console set-up (adds to SEO_PLAYBOOK §16)

**Page-group regexes** (RE2), including new groups for the topical sections:

| Group | Regex |
|---|---|
| Core: method + hub | `/(palm-reading\|hand-lines\|which-hand-to-read)/$` |
| Core: line pillars + sub-pages | `/(heart\|head\|life\|fate\|sun)-line/` |
| Core: mounts, shape, fingers | `/(palm-mounts\|hand-types\|palmistry-fingers)/` |
| Core-adjacent (life topics) | `/(marriage\|children\|money)-line/\|/career-palmistry/` |
| Signs | `/(palm-crosses\|palmistry-m\|lucky-signs)/` |
| Outer | `/(is-palmistry-real\|indian-palmistry\|chinese-palmistry\|history-of-palmistry\|mercury-line)/\|/blog/` |
| Glossary | `/palmistry-terms/` |
| Hindi | `/hi/` |
| Tools | `/tools/` |
| Product | `^https://palmsays\.com/$\|/app/$` |

**Brand filter:** as SEO_PLAYBOOK §16 (plus "palm read ai").

### 8.2 Representative and represented queries to watch

| Node | Representative query (watch position) | Represented queries (count them: coverage signal) |
|---|---|---|
| Heart | heart line palmistry / heart line in hand | forked, broken, curved, straight, double, ending under index/middle, love line, heart line for female |
| Head | head line palmistry | forked (writer's fork), sloping, joined to the life line, education line, mind line |
| Life | life line in hand | short life line, double life line, broken, for female/male, age line |
| Fate | palmistry fate line | no fate line, career line, luck line, double fate line, starting from the life line |
| Hub | hand reading lines / lines on palm | names of lines, palm reading chart, major lines, minor lines, girdle of Venus |
| Method | how to read palm lines | how to read your own palm, what is palmistry |
| Which hand | palmistry female / palm reading for male | left hand for female, which hand for marriage line |
| Marriage | marriage line palmistry | two marriage lines, love marriage line, marriage line touching heart line |
| Mounts | palm reading mounts | mount of Venus / Moon / Jupiter … |
| Hindi | palm line reading in hindi, हाथ की रेखा | जीवन रेखा, भाग्य रेखा, शादी की रेखा … |

**KPI of topical coverage:**
- **distinct queries with impressions per page** and **per group** (Koray: queries, impressions and average position rising together = positive re-ranking);
- **number of pages with ≥ 1 click** (network activation).

### 8.3 Checkpoints

| Day | Check | Healthy | If not |
|---|---|---|---|
| 3 | Pages indexed (URL Inspection for the 11 guides + home + app) | ≥ 80% indexed | Check robots/noindex in production, sitemaps, canonical; request indexing again |
| 7 | Impressions start per group; any "Crawled – currently not indexed" | Impressions on ≥ 3 groups | Improve internal links to the silent group (§4.5) |
| 14 | Distinct queries per page | Pillars ≥ 30 queries each | Add missing attributes (§3.1) to the pages with the fewest queries |
| 30 | Positions for the representative queries; CTR by group; Hindi share | Pillars average position ≤ 30; the low-KD wins (marriage line palmistry KD 11, palm reading online KD 13) ≤ 20 | Title/meta CTR pass; add the represented queries seen at positions 8–20 as H3s/FAQs |
| 60 | `/head-line/double/` K1 check (< 10% of expected impressions → fold); glossary impressions; mounts / types / fingers ranking | Each new core page has impressions within 14 days of publishing | If new pages are slow to index: publish slower, strengthen hub links; merge weak pages |
| 90 | Indexed ÷ submitted; non-brand clicks by group; store clicks by page; AI Overview presence on the top 10 queries (manual check) | Indexed ≥ 90%; clicks rising week on week for 6 weeks | Review "Crawled – not indexed" → merge, don't add (SEO_PLAYBOOK §15) |

---

## 9. Risks, and what must NOT change

### 9.1 Risks

| Risk | Where | Guard |
|---|---|---|
| **YMYL harm** (lifespan, marriage, children, health) | life, marriage, children, simian, Mercury, blog 7 | Owner OK gate (✓ in code); limits box; three-part block; care line; CONTENT_GUIDE §4 unchanged. New attributes (marks on the life line, marriage line touching the heart line) are written **attributed, without** death, accident, divorce or illness readings, even though competitors print them |
| **Thin content / scaled content** | Glossary, sign pages, Hindi twins | Every page answers something no other page does; no templated sets (zodiac × line, gender pages); Hindi written as Hindi, not machine-translated; ≤ 8 new URLs a week |
| **Cannibalisation** | Glossary vs owner pages; mounts vs palm map; hand types vs tool 9; fingers vs tool 13 | Glossary: one sentence per term + link, no H1/title target on any term; the tools keep tool wording (C12, C13, map §3 #13); a new KEYWORD_MAP row for `/palmistry-terms/` and `/palm-mounts/` (moved) before building |
| **Entity mismatch** | `sameAs` to the wrong Wikidata item | Only verified IDs (§5.3); if no exact item exists, no `sameAs` (the DefinedTerm alone) |
| **Weight budget broken by additions** | Pillars at 32–34 KB | Sprite move **before** U3–U6 content (phase order); check-web budget gate stays |
| **AI Overviews take clicks** | Informational line queries | Unique attributes + product CTA; measure CTR by group |
| **Topic drifts into YMYL** | Any page that reads health, lifespan, money or marriage outcomes | Google's rater guidelines treat entertainment / self-reflection framing of astrology-type content differently from hard factual claims (secondary sources; the PDF was not text-verified). Health, money, lifespan or marriage predictions push a page into YMYL scrutiny. Keep the "tradition for reflection" framing and attribution on every page |
| **Honesty rules and Koray's "certainty" micro-semantics** | Copy style | Be certain about facts and sources ("Cheiro reads a forked heart line as…"); attribution replaces hedging; never state a tradition claim as fact. CONTENT_GUIDE §11 banned words still apply. Koray's "never use everyday language" is **not** adopted (our readers need plain words, CONTENT_GUIDE §2) |
| **Hindi review bottleneck** | All `/hi/` pages | Name a reviewer (D5); until then the owner reviews, starting with the short glossary entries |
| **Launch blocked** | X1 | Owner OK or temporarily remove the three YMYL pages from the registry (not recommended: 43.9K of India demand) |

### 9.2 What must NOT change
- **Frozen App Link paths** and legal URLs (SEO_PLAYBOOK §8): `/palm-reading`, `/hand-lines`, the 4 line paths, their `/hi/` twins, and the `.html` legal 301s.
- **KEYWORD_MAP ownership** (one URL per keyword). This plan only adds rows (glossary, and moves mounts/fingers up) and a priority change.
- **Honesty rules, banned claims, YMYL gates, the medical-first simian page, no CTA near medical facts, no marriage scan CTA.**
- **Owner-approved design** (v3/v4 guide templates, glass showroom, home hero). §3.2 changes heading **levels and words only**; visuals stay identical (DONT-BREAK rule).
- **Same content on phone, tablet and desktop** (owner rule). No attribute section hidden on mobile.
- **No ratings or reviews schema, no HowTo, no Product.**
- **Lines on photos only from real scanner output** (WEB-DEC-047/048).

---

## 10. Phased implementation plan

Effort = focused build hours for Claude (a session), plus owner time where noted. "Dep" = depends on.

### Phase 1 — before and at launch (cheap, high impact)

| # | Task | Effort | Dep | Impact |
|---|---|---|---|---|
| 1.1 | Owner reads and OKs `/life-line/`, `/marriage-line/`, `/simian-line/` (status → `owner-ok`) | Owner 1–2 h | — | **Unblocks the production build** + 43.9K India demand |
| 1.2 | Home FAQ soon/live variant (X2) + KBT check rule 3 (§5.5) | 1 h | — | Trust + correct AI answers |
| 1.3 | `src/lib/entities.ts` (≈ 40 first terms: palmistry, 4 major lines, minor lines, mounts, which hand, simian, double head, signs used on built pages) with **verified** Wikidata only | 3 h | §5.3 | The entity registry every later step uses |
| 1.4 | Schema graph: WebPage + Article `@id`s, `about`/`mentions` from front matter (`about: [id]`, `mentions: [ids]`), author `@id`, `publishingPrinciples`, **book citations**, per-page `Article.image`, tools `about` + `isPartOf`, MobileApplication fields, Organization `knowsAbout` + `publishingPrinciples`; drop the FAQPage JSON-LD (D9); check-web: validate the entity ids + R1 anchor registry | 4 h | 1.3, D9 | Explicit entity signals on all ≈ 31 launch pages |
| 1.5 | Anchor fixes R6/R7 + links #1–#8, #15, #17–#24 (§4.5) | 3 h | — | Clean anchor-text index; hub ↔ spoke closure |
| 1.6 | Breadcrumb parent `/hand-lines/` → `/palm-reading/` | 0.5 h | — | Hierarchy = entity graph |
| 1.7 | Heading spec §3.2 on the 4 pillars (module title, H3 questions, H4 values, end-matter headings with the entity), `/head-line/` duplicate merge, `/palm-reading/` definition moved up + limits merge | 3 h | D4 | Heading vectors match EAV |
| 1.8 | `/hand-lines/` U2 (minor lines, names table, chart `<img>` file, new answer-first) | 4 h + reviewer check of the Hindi names | Chart file | Covers root/rare attributes of the centroid + image search |
| 1.9 | `/hi/` + `/hi/app/` review (or `noindex` at launch) | Owner 1 h | — | Hindi can launch indexed |
| 1.10 | Production checks: robots meta, sitemaps, `llms.txt` with terms; GSC + Bing + IndexNow; page groups §8.1 | 2 h + owner (DNS/GSC) | WEB-FEAT-031/032 | Measurement from day 0 |
| 1.11 | Set `published` to the go-live date on all guides (D10) | 0.2 h | Launch date | Accurate dates |
| 1.12 | Record the accepted decisions: WEB-DEC rows, KEYWORD_MAP rows (glossary, mounts/fingers priority), SEO_PLAYBOOK §6 FAQ row, CONTENT_GUIDE §3 Hindi title rule, PROJECT_MASTER feature rows | 0.5 h | Owner decisions | Docs stay the source of truth |

**Phase 1 total:** ≈ 21–22 h Claude + ≈ 4 h owner.

### Phase 2 — first 30 days

| # | Task | Effort | Dep |
|---|---|---|---|
| 2.1 | **SVG sprite move** for variation drawings (all guides; visual parity screenshots 390 + 1440) | 5 h | — (**before 2.3–2.5**) |
| 2.2 | `/palmistry-terms/` (EN) with the DefinedTermSet + footer link + registry row + KEYWORD_MAP row | 5 h | 1.3, D2 |
| 2.3 | Pillar attribute gaps U4, U5 (marks on life/fate, fate start points/fork/timing, heart curved/double/down branches/no line, head wavy/quadrangle/branches/head vs heart) | 6 h | 2.1; life = owner OK |
| 2.4 | U6–U9 (`/palm-reading/`, `/which-hand-to-read/`, `/is-palmistry-real/`, `/marriage-line/`) | 4 h | 2.1; marriage = owner OK; the Chinese-rule source |
| 2.5 | New: `/palm-mounts/` (+ mount chart file) → `/hand-types/` → `/palmistry-fingers/` → `/sun-line/` → `/palm-crosses/` → blog 6 | ≈ 5 h each (≈ 30 h) | D3; sources settled (hand types, CONTENT_GUIDE §9.4) |
| 2.6 | Hindi: `/hi/hand-lines/`, `/hi/palmistry-terms/`, `/hi/palm-reading/` (+ Devanagari chart) | ≈ 4 h each + reviewer | D5 |
| 2.7 | Diagram set part 1 (chart, mounts, heart/head/life/fate value files for image search) + image sitemap | 8 h | WEB-FEAT-056 |
| 2.8 | Day-14 and day-30 GSC reviews (§8.3) → add represented queries seen at positions 8–20 | 2 h each | GSC data |

**Phase 2 total:** ≈ 70–75 h Claude + reviewer time.

### Phase 3 — days 30–90

| # | Task | Effort | Dep |
|---|---|---|---|
| 3.1 | P2 guides: M, lucky signs, money, career, broken life line, children (YMYL) | ≈ 5 h each | Owner OK for children |
| 3.2 | Blogs 1, 2, 3 (then 7, YMYL) | ≈ 4 h each | — |
| 3.3 | Hindi pillars → marriage → which-hand → mounts → P2 twins → `/hi/tools/` | ≈ 4 h each + reviewer | D5 |
| 3.4 | Outer: `/indian-palmistry/` + `/hi/hast-rekha/`, `/history-of-palmistry/`, `/mercury-line/` (YMYL), `/chinese-palmistry/` (only with a specialist source) | ≈ 6 h each | Sources |
| 3.5 | Diagram set part 2 + Hindi-labelled versions | 8 h | 2.7 |
| 3.6 | Day-60 and day-90 checkpoints: K1 fold test, merges, CTR pass, refresh from positions 8–20 | 3 h each | GSC |
| 3.7 | Glossary grows to ≈ 90 terms as new pages go live (each new page adds its terms and `about` id) | ongoing | — |

---

## 11. Owner decisions needed

| # | Decision | Recommendation |
|---|---|---|
| D1 | OK the three YMYL guides (life line, marriage line, simian line) for launch. Without it, the production build fails. | Read them and OK them (or ask for changes) before launch day |
| D2 | Add a new page `/palmistry-terms/` (glossary + entity registry) with an EN and HI version; its own weight budget row | Yes, P2 #1 |
| D3 | Re-order: `/palm-mounts/` and `/palmistry-fingers/` move up from P3 to P2 (right after the glossary); `/indian-palmistry/` becomes the first P3 page | Yes: the app reads mounts; tools 11 and 13 need their guides |
| D4 | Heading levels in the line guides: attribute questions as H3, types as H4; the module title becomes "Where is the <line> on your palm?"; end-matter headings carry the line name. Same look on screen. | Yes |
| D5 | Name a Hindi reviewer (all Hindi pages wait on this) | As soon as possible; until then the owner reviews the short glossary first |
| D6 | Send the author bio and photo so `/about/deepak-chauhan/` can be indexed (E-E-A-T for every guide byline) | Yes, before the P2 guides |
| D7 | Launch all ≈ 31 built pages on day 0 (then a rising cadence), rather than staging them | Yes |
| D8 | Play listing name: keep "Palm Read AI", or rename to include PalmSays (WEB-SRV-014) | Rename to "PalmSays: Palm Reading" (or add PalmSays to the title) so the site, the app and the brand are one entity |
| D9 | Drop the FAQPage JSON-LD from guides and home. Google stopped showing FAQ results on 7 May 2026; the visible FAQ stays. This changes SEO_PLAYBOOK §6. | Yes: it frees bytes, and Google no longer uses it for display |
| D10 | Set every guide's `published` date to the go-live date | Yes |
| D11 | Diagram licence (CC BY 4.0 with attribution, SEO_PLAYBOOK open item) | Yes (helps links from other sites) |
| D12 | Real social profiles for `Organization.sameAs` (only if they will be kept up) | Optional; never list an empty profile |

---

## 12. Sources

**Koray Tuğberk GÜBÜR, framework** (research pass a; [P] = primary, [S] = secondary):
- [P] https://www.holisticseo.digital/theoretical-seo/topical-authority/
- [P] https://www.holisticseo.digital/seo-research-study/topical-map
- [P] https://www.holisticseo.digital/seo-research-study/entity-attribute-value
- [P] https://www.holisticseo.digital/theoretical-seo/ranking/ (initial ranking, re-ranking)
- [P] https://www.holisticseo.digital/on-page-seo/anchor-text/
- [P] https://www.oncrawl.com/technical-seo/importance-topical-authority-semantic-seo/ (≤ 15 links per page, "anchor ≤ 3 times", heading vectors)
- [P] https://www.oncrawl.com/on-page-seo/creating-semantic-content-networks-with-query-document-templates-case-study/
- [P] https://sitechecker.pro/interview-koray-tugberk-gubur/ · https://www.rebootonline.com/blog/q-and-a-koray-tugberk-gubur/ · https://majestic.com/seo-in-2022/koray-tugberk-gubur
- [P] https://x.com/KorayGubur/status/1917196653213438322 (cost of retrieval) · https://x.com/KorayGubur/status/1993070918868844770 (AI Overviews case)
- [S] https://rokonz.com/resources/semantic-seo-glossary · https://www.fatrank.com/identify-the-root-rare-and-unique-attributes-of-an-entity/
- Knowledge-based trust paper: https://arxiv.org/abs/1502.03519

**Not verified in primary sources** (treated as secondary):
- the 40-word answer;
- the root / rare / unique definitions;
- represented vs representative queries;
- FAQ and schema `about`/`mentions` advice. **No primary Koray statement on these was found.**

**Competitors** (research pass c, fetched 2026-09-28): Almanac · Astroyogi (heart/head/fate; Hindi heart and marriage) · InstaAstro · Numerologist (life/head/fate/marriage) · LoveToKnow (life) · mindbodygreen · Kaucim · YourChineseAstrology · 99Pandit · Astrohandlines · AstroSage · Wikipedia (Palmistry; Single transverse palmar crease) · Healthline · PubMed 31301248 · palm-reading.app · thepalmreading.com · pandit.ai palm scanner · Zee Hindi · Amar Ujala. URLs in the research notes; key ones:
- https://www.almanac.com/how-read-palms-beginners-guide-pictures
- https://www.astroyogi.com/palmreading/heart-line
- https://numerologist.com/palm-reading/life-line
- https://www.lovetoknow.com/life/astrology/palm-reading-life-lines
- https://hindi.astroyogi.com/palmreading/marriage-line
- https://www.kaucim.ai/en/articles/which-hand-to-read-palmistry
- https://99pandit.com/blog/hast-rekha-gyan-in-hindi/
- https://pandit.ai/palm-scanner
- https://en.wikipedia.org/wiki/Palmistry

**Google / schema.org** (research pass b, live docs checked 2026-09-28):
- https://developers.google.com/search/updates (FAQ rich result gone from 7 May 2026)
- https://developers.google.com/search/docs/appearance/structured-data/article
- https://developers.google.com/search/docs/appearance/structured-data/breadcrumb · https://developers.google.com/search/blog/2025/01/simplifying-breadcrumbs
- https://developers.google.com/search/docs/appearance/structured-data/software-app · https://developers.google.com/search/docs/appearance/structured-data/review-snippet
- https://developers.google.com/search/docs/appearance/structured-data/organization · https://developers.google.com/search/docs/appearance/structured-data/profile-page
- https://developers.google.com/search/blog/2025/06/simplifying-search-results · https://developers.google.com/search/blog/2025/11/update-on-our-efforts
- https://developers.google.com/search/docs/appearance/google-images
- https://developers.google.com/search/docs/specialty/international/localized-versions
- https://developers.google.com/search/docs/essentials/spam-policies (scaled content abuse)
- https://developers.google.com/search/docs/appearance/ai-features · https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- schema.org: https://schema.org/about · https://schema.org/mentions · https://schema.org/DefinedTerm · https://schema.org/DefinedTermSet · https://schema.org/sameAs
- Wikidata IDs: §5.3 (each fetched from the Wikidata API).
- India query data: Google Trends (geo=IN, 5 years), queried 2026-09-28.

**Internal:**
- `KEYWORD_MAP.md` v2 · `SEO_PLAYBOOK.md` v1 · `CONTENT_GUIDE.md` · `DECISIONS.md` (WEB-DEC-034/035/038/047/048) · `PROJECT_MASTER.md` §3 · `qa/seo-keyword-audit-2026-09-27.md`
- Built HTML `dist/` (2026-09-28 14:39)
- The app repo `src/features/engagement/lessons.ts` (Hindi line names), read-only
