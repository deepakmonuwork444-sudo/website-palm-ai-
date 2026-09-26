# KEYWORD_MAP — PalmSays (palmsays.com)

**What this is:** the single map of which URL owns which search. Before you write or change any page, look the keyword up here. How to build the page is in `SEO_PLAYBOOK.md`; how to write it is in `CONTENT_GUIDE.md`.

**Status:** v2, 2026-09-26. v1 was built from `WEBSITE_MASTER_PLAN.md` §6.1, §9, §10.1, §11.3, §11.5, §15b and `research/11-seo-placement.md` §1–4, with **12 standalone tool pages** (owner decision, §15b). v2 adds the owner's **India export**, keeps **US and India data separate** (§2.1–2.3 US, §2.4 India) and sets **India-first priorities** in one merged URL map (§2.0). Decisions K1–K11 are in §2.5.

---

## 0. Data status (read first)

| Data | Status | Where |
|---|---|---|
| US volume and KD | The owner's US export: 298 English keyword rows, 438,170 searches a month in total (301,000 of it is the bare head term "palm reading"). Checked 2026-09-26. The cluster totals in §2.1–2.3 were re-checked against the raw file (heart line ≈ 11,070 and marriage line ≈ 12,710 add up exactly). | `research/keywords-us.tsv` (raw, do not edit) |
| India volume and KD | The owner's India export: 180 English (Latin-script) keyword rows, 234,150 searches a month in total (33,100 of it is "palm reading"). Loaded 2026-09-26. Every India figure in this file comes from this file. | `research/keywords-in.tsv` (raw, do not edit) |
| Hindi and Hinglish (Devanagari) | Google autocomplete (`hl=hi, gl=in`, 35 seeds, 2026-09-26). It proves that people type these words, but it gives **no volumes**. The India export has **no Devanagari rows**, so Devanagari volumes are still unknown. | R11 §4.1 |
| Tool keywords | Mostly **in neither export**. Only scanner / online wording has volumes (home, §2.0). The rest is marked `[unverified]`: it comes from autocomplete evidence or plain tool-intent wording. Check it in Search Console after 30 days. | — |

- **The exports' own "cluster" and "page" columns are the tool's automatic grouping, not our page owners.** For example, the India file files "heart line palm" and "palmistry female" under "life line in hand", and "head line palmistry" under "heart line". This map decides the owner; ignore the TSV's page column.
- "US vol" / "IN vol" = the summed monthly volume of the keywords this page owns in that market. It is demand, not traffic we will get. `~` = rounded. A single keyword is written as `volume/KD`.
- **Intent:** T = do it now (a tool), I = learn, C = compare or choose an app, N = brand or app.
- **Priority** = build phase, set **India-first** (v2): **P1** = launch set, days 0–30 (**P1-late** = in days 0–30 but after the launch-day pages, because it needs a sourced section or owner OK first), **P2** = days 31–60, **P3** = days 61–90 and later (SEO_PLAYBOOK §17). Priority lives **only** in §2.0.

---

## 1. How to use this map

1. **One URL owns each keyword** (its primary and secondaries). If the keyword you want belongs to another page, link to that page with the keyword as the anchor text. Don't target it.
2. Only the owning page may use the keyword in its **title, H1 or first sentence**. Other pages may mention it in body text.
3. **A new keyword** gets a row here first, with its evidence. If it fits no page and fails the new-URL test (SEO_PLAYBOOK §15), it becomes an H2, H3 or FAQ on the closest owner.
4. **Line name vs topic.** A query that names a line (love line, career line, destiny line, line of success, health line) goes to **that line's page**. A life-topic query (career palmistry, palmistry and marriage, money in palmistry) goes to the **topic page**.
5. **Tool vs guide.** Guides own "meaning / types / what is / how to read". Tool pages own "finder / checker / quiz / which … do I have / check my …". A tool title never starts with the guide's primary keyword, and a guide title never contains "finder", "checker" or "quiz".
6. **Modifiers are never pages.** "for female / for male", "left or right hand", "with pictures / चित्र सहित" are handled inside each page (R11 §3.9). The broad gender queries with no line name ("palmistry female", "palm reading for male") belong to `/which-hand-to-read/` (K2); "<line> for female / male" stays on that line's page.
7. **Short, ambiguous head terms** always get "palm" or "palmistry" in the title and H1: heart line, fate line, sun line, marriage line, money line, types of hands.

---

## 2. English pages

§2.0 is the table builders use. §2.1–2.3 hold the **US** keyword sets, §2.4 the **India** keyword sets, §2.5 the India-only insights and the decisions they led to. US and India numbers are never added together.

### 2.0 Merged URL map (one row per URL, India-first priority)

| URL | Primary: US (vol/KD) | Primary: India (vol/KD) | US vol | IN vol | Pri | Hindi pair |
|---|---|---|---|---|---|---|
| `/` | free palm reading 2,900/32 | free palm reading online 12,100/17 | ~18.7K | ~41.6K (+ "palm reading" 33,100/41, shared, C6) | P1 | `/hi/` |
| `/palm-reading/` | how to read palms (not in the export; biggest verified term: palm reading guide 4,400/28) | how to read palm lines 2,900/50 | ~9K | ~3.6K | P1 | `/hi/palm-reading/` |
| `/hand-lines/` | lines on palm (palm reading lines 18,100/31 · lines on palm astrology 18,100/23) | hand reading lines 27,100/50 | ~50K | ~30.3K | P1 | `/hi/hand-lines/` |
| `/heart-line/` | heart line palm 1,000/31 | heart line palmistry 3,600/29 (bare "heart line" 5,400/31: intent not checked, §2.5) | ~11K | ~18.7K | P1 | `/hi/heart-line/` |
| `/head-line/` | head line palmistry 590/14 | head line palmistry 1,300/21 | ~1.5K | ~3.6K | P1 | `/hi/head-line/` |
| `/life-line/` | life line on palm 1,300/17 | life line in hand 9,900/22 | ~8.3K | ~14.9K | P1 | `/hi/life-line/` |
| `/fate-line/` | fate line palm 880/16 | palmistry fate line 2,400/25 | ~6.7K | ~5.0K | P1 | `/hi/fate-line/` |
| `/marriage-line/` | marriage line palm 1,000/7 | marriage line palmistry 4,400/11 | ~12.7K | ~10.3K | **P1** (was P2) | `/hi/marriage-line/` (P2) |
| `/which-hand-to-read/` | which hand to read palm (biggest verified: left hand palm reading for female 390/10) | palmistry female 4,400/30 + palm reading for male 3,600/33 (K2) | ~1.1K | ~15.9K | P1 | `/hi/which-hand-to-read/` (P2) |
| `/is-palmistry-real/` | **is palmistry true** 390/14 (K9; was "is palmistry real", 50/27) | is palmistry true 1,300/34 | ~2.7K | ~2.7K | P1 | later |
| `/app/` | palm reading app 1,000/36 | palm reading app 9,900/37 | ~2.6K (the Play listing owns most of it) | ~12.8K | P1 | `/hi/app/` |
| `/tools/` | free palm reading tools [unverified] | — (not in the export) | — | — | P1 | `/hi/tools/` (P2) |
| Tools 3, 8, 11 | §3 | — | — | — | P1 | `/hi/tools/<slug>/` (P2) |
| `/head-line/double/` **NEW** | — (US has only fork / split wording, ~230, which stays on `/head-line/`) | two head line palmistry 6,600/30 | — | ~6.8K | **P1-late** (after `/head-line/`) | none yet (no hreflang) |
| `/simian-line/` | one line on palm 1,000/34 · simian line palmistry 390/12 | simian line 6,600/28 | ~3K | ~18.7K (about half is medical wording, K10) | **P1-late** (was P2; sourced medical section + owner OK first) | later |
| `/palm-crosses/` | palmistry crosses 880/23 | mystic cross on palm 480/24 | ~1K | ~2.5K | P2 #1 | later |
| `/blog/rarest-palm-lines/` | — (not in the export) | rare hand lines meaning 1,000/31 | — | ~1.5K | P2 #2 (was P3) | — |
| `/career-palmistry/` | career palmistry 880/5 | career palm reading 110/10 | ~1.2K | ~430 | P2 #3 | later |
| `/hand-types/` | different types of hands 720/22 | palm reading fire hand 140/3 | ~2.6K | ~250 | P2 #4 | later |
| `/sun-line/` | sun line palmistry 480/29 | success line on palm 480/30 | ~1.1K | ~480 | P2 #5 | later |
| `/palmistry-m/` | palmistry m 390/23 | — (not in the export) | ~1.5K | 0 | P2 #6 | `/hi/palmistry-m/` |
| `/money-line/` | money line in hand palmistry 320/22 | — | ~1.5K | 0 | P2 #7 | `/hi/money-line/` |
| `/life-line/broken/` | broken life line palmistry 390/14 | — | ~740 | 0 | P2 #8 (was the first P2 guide) | none (no hreflang) |
| `/children-line/` | palm reading children line 210/8 | — | ~1K | 0 | P2 #9 | `/hi/children-line/` |
| `/lucky-signs/` | rare lucky signs on palm 260/6 | — | ~1K | 0 | P2 #10 | `/hi/lucky-signs/` |
| `/palmistry-pdf/` | palm reading pdf 70/3 | palm reading book pdf 590/17 | ~260 | ~980 | P2 (when WEB-SRV-008/013 are ready) | `/hi/palmistry-pdf/` (published days 61–90) |
| Blog posts 1–4 | §4 | §4 | — | — | P2 | — |
| Tools 2, 4–7, 9, 10, 12 | §3 | — | — | — | P2 | later |
| `/palmistry-fingers/` | palmistry fingers 110/5 | palmistry fingers 320/15 | ~250 | ~1.4K (with thumb terms) | P3 #1 | later |
| `/indian-palmistry/` | indian palmistry (palmistry india 170/30) | — | ~350 | 0 | P3 | `/hi/hast-rekha/` (only if equivalent) |
| `/chinese-palmistry/` | chinese palmistry 720/16 | — | ~1.1K | 0 | P3 | — |
| `/palm-mounts/` | palm reading mounts 140/7 | — | ~350 | 0 | P3 | — |
| `/history-of-palmistry/` | history of palmistry 70/31 | — | ~260 | 0 | P3 | — |
| `/mercury-line/` | line of mercury palmistry 70/4 | — | ~140 | 0 | P3 | — |
| Blog post 7 | §4 | — | — | — | P3 | — |
| ~~`/blog/palm-reading-for-female/`~~ (blog 5) | — | — | — | — | **DROPPED** (merged into `/which-hand-to-read/` before it was written, K2) | — |

- US vol for `/` changed from ~21K to ~18.7K only because 2,600 of app wording (palm reading app, free palm reading app, palm astrology app) belongs to `/app/` (C17).
- The P2 order is India-first: pages with India demand first, then the US-only pages. It replaces the P2 order in SEO_PLAYBOOK §17.

### 2.1 US: launch-set pages

| URL | Primary | Secondary keywords this page owns | US vol (KD) | Intent | Hindi twin |
|---|---|---|---|---|---|
| `/` | free palm reading (free AI palm reading online) | ai palm reading · palm reading scanner · free online palm reading scanner (320, KD 7) · scan palm / palm scanner · upload picture palm reading free online (260, KD 5) · palm reading online free · hand reader online · palm reading free no sign up / no email | ~18.7K (5–38); app wording → `/app/` | T | `/hi/` |
| `/palm-reading/` | how to read palms | palm reading guide · how to read palm lines · how to read a palm (for beginners, easy) · palmistry hand · can you read your own palm (FAQ). The head term "palm reading" is shared with home and not targeted (C6). | ~9K (3–31); head term 301K (KD 52) | I | `/hi/palm-reading/` |
| `/hand-lines/` | lines on palm (lines on palm meaning) | palm reading lines · palmistry lines · meaning of lines in the palm · what your palm lines say · what are the lines on your palm called / names · palm reading chart · palm diagram · palmistry images · the three main lines · minor lines | ~50K (21–36) | I | `/hi/hand-lines/` |
| `/heart-line/` | heart line palm (heart line meaning, palmistry) | palm reading heart line · love line on palm · palmistry love line · broken heart line (210, KD 5) · forked / split heart line · curved vs straight · short / long · heart line ending under the index or middle finger · soulmate line (honest box only) | ~11K (5–42) | I | `/hi/heart-line/` |
| `/head-line/` | head line palmistry (head line palm) | what does the head line mean · split / forked head line (writer's fork) · broken head line · long / short / straight / sloping · head line joined to the life line. Two / double head lines → `/head-line/double/` (C22) | ~1.5K (0–23) | I | `/hi/head-line/` |
| `/life-line/` | life line palm (life line palm reading) | does a short life line mean early death (first H2) · short life line · double life line / sister line · forked life line · life line which hand · life line age calculation (answer: we don't do it) · life expectancy palm reading (honest answer) | ~8.3K (12–27) | I | `/hi/life-line/` |
| `/fate-line/` | fate line palm (fate line palmistry) | destiny line · palm reading destiny line · career line palmistry · palm reading career line (110, KD 2) · luck line · job line · Saturn line · no fate line · broken / double fate line · fate line starting from the life line or the mount of the Moon | ~6.7K (2–28) | I | `/hi/fate-line/` |
| `/is-palmistry-real/` | is palmistry true (K9) | is palmistry real · is palm reading real · how accurate is palm reading · is palmistry a science · "palm reading and astrology are examples of" (answer: pseudoscience) · can palm reading predict the future · is palm reading a sin / haram (one neutral FAQ line) | ~2.7K (14–35) | I | later |
| `/which-hand-to-read/` | which hand to read palm | left hand palm reading for female · palm reading for female which hand · right or left hand palmistry · palmistry left hand meaning · left-handed palm reading · which hand for the marriage line or life line. "Dominant hand" is body wording only (K11). | ~1.1K (7–13) | I | `/hi/which-hand-to-read/` (P2) |
| `/tools/` | free palm reading tools | palmistry tools · free palmistry tools | not in export | T | `/hi/tools/` (P2) |
| `/app/` | palm reading app | palm reading app for android · is there an app that reads your palm · PalmSays app · palm reading app free (always written "free to start") · free palm reading app (880) · palm astrology app (720) | ~2.6K (36–38); the Play listing owns most of this result, we win it in the Play Store | N/C | `/hi/app/` |

Tool pages 1, 3, 8 and 11 are also P1: see §3. `/head-line/double/` has no US keyword set (the US export has no "double / two head line" rows).

### 2.2 US: guides (priority and order: §2.0)

| URL | Primary | Secondary keywords this page owns | US vol (KD) | Intent | Hindi twin |
|---|---|---|---|---|---|
| `/life-line/broken/` | broken life line | what does a broken life line mean · split life line · life line broken in two · broken on one hand / both hands · overlapping break · square over a break | inside the life-line total (low KD) | I (YMYL) | none yet, so no hreflang |
| `/career-palmistry/` | career palmistry (880, KD 5) | job palmistry · palm reading for career · career in palmistry for women and men (in-page) | ~1.2K (1–19); part of this total is career-line terms now owned by `/fate-line/` (C8) | I | later |
| `/marriage-line/` | marriage line palm (1,000, KD 7) | marriage line on hand · marriage line palmistry · palm reading marriage line · palmistry and marriage (590, KD 6) · hand line reading marriage line · chiromancy marriage line · relationship line · how many marriage lines · two marriage lines · divorce line (a myth section) · marriage line age (answer: it can't be worked out) | ~12.7K (0–24) | I (YMYL) | `/hi/marriage-line/` · no tool (owner) |
| `/palmistry-m/` | m on palm | palmistry m · letter m on palm meaning · m sign on palm · m on both hands / left / right · is the m rare · m on palm spiritual meaning (framed as belief) | ~1.5K (13–28) | I | `/hi/palmistry-m/` |
| `/money-line/` | money line on palm | money line in hand · wealth line · rich line · money triangle · no money line | ~1.5K (9–28) | I | `/hi/money-line/` |
| `/hand-types/` | types of hands in palmistry | hand shape palmistry · different types of hands (palmistry) · element hands · earth / air / fire / water hand · what is a fire hand in palmistry · types of hands and fingers | ~2.6K (0–42) | I | later |
| `/simian-line/` | simian line | one line on palm · one line across palm · straight line across palm · single palmar crease / simian crease · is a simian line rare / normal · on both hands · is it lucky / good or bad · simian line personality · "lines on palm down syndrome" (medical-facts section only) | ~3K (11–39) | I (YMYL) | later |
| `/sun-line/` | sun line palmistry | Apollo line · line of success · what does the sun line mean on your palm · no sun line · sun line on the right hand | ~1.1K (2–29) | I | later |
| `/palm-crosses/` | cross on palm | palmistry crosses · mystic cross · x on palm · x and m on palm · cross on the right hand | ~1K (19–23) | I | later |
| `/children-line/` | children lines on palm | children line palmistry · how many children palm reading (answer: no line can tell) · children line for women · where is the children line | ~1K (5–16) | I (YMYL) | `/hi/children-line/` · no tool (owner) |
| `/lucky-signs/` | rare lucky signs on palm (260, KD 6) | lucky signs on palm · fish sign on palm · palmistry star · triangle on palm · trident (trishul) on palm | ~1K (4–26) | I | `/hi/lucky-signs/` |
| `/palmistry-pdf/` | palm reading pdf | palmistry guide pdf · palmistry pdf free (free by email) | ~260 (3–19) | I/T | `/hi/palmistry-pdf/` (built in P2, published days 61–90) |

### 2.3 US: later guides (priority: §2.0)

| URL | Primary | Secondary | US vol (KD) | Notes |
|---|---|---|---|---|
| `/indian-palmistry/` | indian palmistry | hast rekha shastra (English page) · vedic palm reading · samudrika shastra · palmistry india · indian hand reading · palm reading hindu | ~350 (14–30) | Pairs with `/hi/hast-rekha/` only if the content is equivalent |
| `/chinese-palmistry/` | chinese palmistry | chinese palm reading · five element hands · heaven, human and earth lines · chinese vs western palmistry | ~1.1K (16) | Needs a specialist source; don't invent Chinese terms |
| `/palm-mounts/` | palm mounts (palm reading mounts) | mount of Venus · mount of the Moon (Luna) · mount of Jupiter · parvat | ~350 (1–7) | The app has a mounts lesson |
| `/history-of-palmistry/` | history of palmistry | origin of palmistry | ~260 (29–33) | Cite historians |
| `/palmistry-fingers/` | palmistry fingers | finger length palmistry · types of fingers | ~250 (5–29) | — |
| `/mercury-line/` | mercury line palmistry | line of Mercury · health line (named only; never read as health) | ~140 (4–9) | YMYL: "not a medical test" box at the top |

### 2.4 India: keywords per page (`research/keywords-in.tsv`)

180 rows, 234,150 searches a month. Every row is assigned to exactly one owner below (checked with a script: no row unassigned, none assigned twice). Volumes are the tool's monthly estimates for India.

| Owner URL | IN vol | Rows | KD range | India keywords (vol/KD), biggest first | Notes |
|---|---|---|---|---|---|
| `/` | 41,550 | 13 | 10–29 | free palm reading online 12,100/17 · palmistry online free 12,100/29 · palm reading online 5,400/13 · free palm reading 3,600/17 · palm reading scanner 2,400/22 · free online palm reading scanner 2,400/15 · palmistry scanner 1,000/20 · hand reading online 590/21 · online palmistry scanner 480/13 · free palm reading scanner 480/16 · palm scanner online 480/13 · palm reading for female online free 260/10 · palm scanner online free 260/13 | India's biggest page, with low KD for its size. Tool intent (C7) |
| shared (C6) | 33,100 | 1 | 41 | palm reading 33,100/41 | No single page targets it; home and `/palm-reading/` both benefit |
| `/hand-lines/` | 30,310 | 6 | 22–50 | hand reading lines 27,100/50 · what your palm lines say about you 2,400/31 · palm crease meaning 320/41 · what does lines on your hands mean 210/31 · major lines in palmistry 170/22 · hand creases 110/30 | KD 50 on the head term: a long-term target. "palm crease / hand creases" are body wording only |
| `/heart-line/` | 18,720 | 16 | 15–39 | heart line 5,400/31 · heart line palmistry 3,600/29 · heart line palm 3,600/29 · love line in hand 1,900/37 · heart line in hand 1,600/33 · palmistry love line 880/39 · types of heart line in palmistry 320/17 · palm reading love line 260/37 · heart line palmistry fork 210/24 · heart line meaning 170/29 · straight heart line palmistry 140/21 · palm reading heart line 140/27 · love life palmistry 140/27 · love life palm reading 140/30 · heart line divided into two parts 110/16 · heart line and life line joined meaning 110/15 | Love-line and love-life terms stay here (C1), not on `/marriage-line/` |
| `/simian-line/` | 18,680 | 18 | 14–40 | simian line 6,600/28 · simian crease 6,600/36 · palmar crease 1,600/27 · single palmar crease 880/36 · simian line palmistry 720/23 · simian line on both hands 320/18 · simian line meaning 260/23 · simian crease meaning 260/32 · straight line on palm 210/27 · transverse palmar crease 170/34 · down syndrome palm 170/40 · heart line and head line joined meaning 140/14 · simian crease on palm 140/23 · single crease on palm 140/23 · simian hand 140/33 · palmar simian crease 110/22 · single horizontal crease on palm 110/20 · simian line on right hand 110/37 | ≈ 10,180 of it is medical-style wording (the crease / palmar / down syndrome rows). Rule K10 |
| `/which-hand-to-read/` | 15,870 | 27 | 7–33 | palmistry female 4,400/30 · palm reading for male 3,600/33 · palmistry lines for female 880/27 · left hand palm reading for female 880/18 · right hand palm reading for female 720/19 · female hand palmistry 720/17 · left hand palm 590/24 · palmistry left hand 590/15 · which hand is used for palm reading 320/23 · which hand is seen in palmistry for male 260/7 · in palmistry which hand is read for a man 260/10 · which hand to read for female in palmistry in india 260/10 · in palmistry which hand is read for a woman 260/15 · which palm to read for female 260/16 · + 13 rows of 110–210 | Female wording ≈ 9,330, male ≈ 4,540, neutral which-hand ≈ 2,000. K2 |
| `/life-line/` | 14,890 | 7 | 19–30 | life line in hand 9,900/22 · short life line palm 2,400/19 · life line in hand for female 1,000/21 · life line in hand for male 720/30 · palm reading life line 590/23 · age line in palmistry 140/24 · lifeline lines 140/30 | "short life line" (2,400): the first H2 answers the fear (CONTENT_GUIDE §4.3). "age line" = life-line age: we never calculate it |
| `/app/` | 12,800 | 2 | 34–37 | palm reading app 9,900/37 · hand reading app 2,900/34 | About 10× the US demand. The Play listing (ASO) and `/app/` share it |
| `/marriage-line/` | 10,340 | 14 | 8–30 | marriage line palmistry 4,400/11 · marriage palm reading 1,300/29 · divorce palm reading marriage line 1,000/13 · marriage lines on palm for female 720/16 · love marriage palm reading 720/19 · palmistry love marriage line 590/21 · palm reading marriage lines 390/23 · palmistry relationship lines 320/19 · relationship lines on palm 320/30 · marriage lines on palm for male 140/8 · love marriage line in palm reading 110/11 · palm reading for female marriage 110/15 · relationship lines on hand 110/21 · palm reading love marriage or arranged 110/26 | Best India ratio: 4,400 at KD 11. YMYL: no date, no number of marriages, no divorce, no love-vs-arranged prediction (CONTENT_GUIDE §4.1–4.2) |
| `/head-line/double/` | 6,810 | 2 | 17–30 | two head line palmistry 6,600/30 · double head line palmistry 210/17 | K1 |
| `/fate-line/` | 4,990 | 8 | 7–25 | palmistry fate line 2,400/25 · career line palmistry 590/10 · career line on palm 590/11 · luck line on palm 480/25 · luck line in palmistry 480/23 · job line in female hand 170/11 · palm reading fate line 140/7 · lucky line in female hand 140/22 | Career, luck and job line = other names of the fate line (C8, K8) |
| `/palm-reading/` | 3,640 | 5 | 37–50 | how to read palm lines 2,900/50 · what is palmistry 320/37 · how to see hand lines 170/41 · how to check hand lines 140/40 · how to see hand astrology 110/49 | High KD on every row: a long-term page |
| `/head-line/` | 3,590 | 12 | 8–27 | head line palmistry 1,300/21 · education line in palmistry 390/19 · education line in hand 320/27 · head line palm 260/14 · mind line in hand 260/14 · head line in hand 210/8 · forked head line palmistry 210/13 · brain line in hand 170/17 · life line and head line not joined meaning 140/10 · mind line palmistry 110/16 · palm reading head line 110/20 · head line and life line joined 110/17 | "Mind line / brain line" are other names. Education line = an H3 (K3). Forked = the writer's-fork H3 (C22) |
| `/is-palmistry-real/` | 2,660 | 7 | 16–47 | is palmistry true 1,300/34 · is palmistry accurate 320/17 · is palm reading accurate 320/43 · is palm reading real 260/47 · is palmistry real 210/29 · palmistry real or fake 140/16 · is palm reading true 110/46 | K9 |
| `/palm-crosses/` | 2,510 | 9 | 23–30 | mystic cross on palm 480/24 · mystic cross palmistry 480/28 · x mark in palm 390/26 · x sign on palm 390/26 · x in palmistry 210/23 · mystic cross 170/23 · x on palm 140/27 · x on palm spiritual meaning 140/30 · cross on palm 110/28 | K4 |
| `/blog/rarest-palm-lines/` | 1,530 | 3 | 18–31 | rare hand lines meaning 1,000/31 · rare palm lines 390/18 · rare hand lines 140/30 | K5 |
| `/palmistry-fingers/` | 1,420 | 8 | 10–25 | palmistry fingers 320/15 · finger astrology 260/12 · palm reading thumb lines 170/21 · palmistry thumb lines 170/15 · lines in fingers 140/18 · thumb palmistry 140/10 · lines on fingers palmistry 110/25 · finger lines meaning 110/17 | Thumb terms = an H2 "The thumb" on this page (no thumb page) |
| `/palmistry-pdf/` | 980 | 2 | 17–25 | palm reading book pdf 590/17 · palm reading book 390/25 | K7 |
| `/sun-line/` | 480 | 1 | 30 | success line on palm 480/30 | "Line of success" = the sun line (C8b) |
| `/career-palmistry/` | 430 | 2 | 10–31 | business line in palmistry 320/31 · career palm reading 110/10 | K8 |
| `/hand-types/` | 250 | 2 | 3–33 | palm reading fire hand 140/3 · hand types in palmistry 110/33 | — |
| `/blog/do-palm-lines-change/` | 110 | 1 | 9 | do palm lines change 110/9 | — |
| `/hi/` | 1,930 | 3 | 26–34 | palmistry reading in hindi 880/26 · palm reading in hindi 880/31 · hand reading in hindi 170/34 | Latin-script queries answered by a Hindi page (K6) |
| `/hi/hand-lines/` | 1,510 | 4 | 26–31 | palm line reading in hindi 880/28 · hand line reading in hindi 210/26 · palm lines in hindi 210/31 · palmistry lines in hindi 210/31 | K6 |
| `/hi/which-hand-to-read/` | 110 | 1 | 20 | palm reading for male in hindi 110/20 | K6 |
| Skipped | 4,940 | 6 | 27–46 | dominant hand meaning 1,300/27 · writing with non dominant hand 1,000/30 · dominant hand 720/46 · left palm 720/28 · non dominant hand meaning 720/28 · non dominant hand 480/38 | K11 |

Not in the India export at all: M on palm, money line, children line, lucky signs (fish, star, trishul), broken life line, mounts, Indian or Chinese palmistry, history. Those pages are US-led (or backed only by Hindi autocomplete), so they sit later in P2 / P3.

**Top 10 India targets** (single keywords, by volume; the shared head term "palm reading" left out):

| # | Keyword | Vol/KD | Owner |
|---|---|---|---|
| 1 | free palm reading online | 12,100/17 | `/` |
| 2 | palmistry online free | 12,100/29 | `/` |
| 3 | life line in hand | 9,900/22 | `/life-line/` |
| 4 | palm reading app | 9,900/37 | `/app/` |
| 5 | two head line palmistry | 6,600/30 | `/head-line/double/` |
| 6 | simian line | 6,600/28 | `/simian-line/` |
| 7 | palm reading online | 5,400/13 | `/` |
| 8 | marriage line palmistry | 4,400/11 | `/marriage-line/` |
| 9 | palmistry female | 4,400/30 | `/which-hand-to-read/` |
| 10 | heart line palmistry (+ bare "heart line" 5,400/31) | 3,600/29 | `/heart-line/` |

Long-term (big but hard): hand reading lines 27,100/50 (`/hand-lines/`), how to read palm lines 2,900/50 (`/palm-reading/`), simian crease 6,600/36 (medical intent; body only on `/simian-line/`).

### 2.5 India-only insights and decisions

**What the India data shows that the US data doesn't**
- **The free reading is India's biggest intent.** Home owns 41,550 a month at KD 10–29, more than any US page except `/hand-lines/`. India-first means the home tool and its Hindi twin come before everything else.
- **India says "hand" and "in hand" where the US says "palm":** hand reading lines 27,100 · life line in hand 9,900 · heart line in hand 1,600 · hand reading app 2,900. India-first titles use the "hand" form where it is the bigger term; the H1 or meta carries the "palm" form for the US. Never both forms stacked in one title.
- **Line pages are much bigger in India:** life line in hand 9,900 (US 880) · heart line palmistry 3,600 (US 1,000) · marriage line palmistry 4,400 (US 390) · simian line 6,600 (US: simian line palmistry 390).
- **Apps:** palm reading app 9,900 + hand reading app 2,900 in India vs about 2,600 of app wording in the US. The Play listing takes most of this; `/app/` must still rank beside it.
- **Gender wording is large** (female ≈ 9,330, male ≈ 4,540 on `/which-hand-to-read/` alone, plus "<line> for female / male" on the line pages). Handled by K2, never with gender pages.
- **India-specific marriage questions:** love marriage vs arranged (720 + 590 + 110 + 110) and "divorce palm reading marriage line" (1,000/13). Answer them honestly on `/marriage-line/`: no line can tell love vs arranged, and the "divorce line" is named only to take it apart (CONTENT_GUIDE §4.2).
- **No Devanagari in the export.** The owner's seeds were English, so the file has only Latin-script queries. Devanagari volumes are still unknown (§7 stays on autocomplete evidence). The "… in hindi" queries (3,550 in total) prove Hindi demand from English-script searchers (K6).
- **Low-KD India wins** (§8): marriage line palmistry 4,400/11 · palm reading online 5,400/13 · free online palm reading scanner 2,400/15 · free palm reading online 12,100/17 · free palm reading 3,600/17 · career line palmistry 590/10 · head line in hand 210/8 · which hand is seen in palmistry for male 260/7 · palm reading fate line 140/7 · palm reading fire hand 140/3.
- **Two figures to check before writing** (an India SERP check, `gl=in`, SEO_PLAYBOOK §16): whether bare "heart line" (5,400) is palmistry intent in India, and whether "two head line palmistry" (6,600) really means two head lines. The tool's figures are estimates.

**Decisions (K1–K11).** Each follows the new-URL test (SEO_PLAYBOOK §15), the honesty rules (CONTENT_GUIDE §4) and the fixed decisions: 12 standalone tools with distinct keywords, love line → heart line (C1), honest marriage / children / lifespan guides, English slugs under `/hi/`, frozen App Link paths (ARCHITECTURE F1).

| # | Question | Decision | Why |
|---|---|---|---|
| K1 | Two / double head line: sub-page or section? | **New sub-page `/head-line/double/`**, P1-late. Owns "two head line palmistry" and "double head line palmistry". "Forked head line" (IN 210/13, US 70/5) stays on `/head-line/` as the writer's-fork H3; the sub-page has one "Two lines or a fork?" section that links back. Not an App Link (F1 lists exact paths only, like `/life-line/broken/`). No Hindi twin yet, so no hreflang. | 6,810 a month in India, nearly twice the whole `/head-line/` India set (3,590). A separate question (do I have two head lines, and what do the books say) that needs its own pictures and 1,000+ words, so it passes the new-URL test (now "US or India" demand). If Search Console shows under 10% of the expected impressions after 60 days, fold it into `/head-line/` with a 301. |
| K2 | Female / male palm reading pages, or fold into `/which-hand-to-read/`? | **Fold. No gender pages.** `/which-hand-to-read/` becomes "which hand to read — female & male palm reading" with an H2 each for female and male (which hand, what is the same for everyone, links to each line page, the limits box). Blog 5 (`/blog/palm-reading-for-female/`) is **dropped** before it is written (C19, merged early). "<line> for female / male" stays on each line page. | The lines and rules are the same on every hand; the only real difference traditions make is which hand is read (the Indian custom of right for men, left for women is `[verify]` in Dale 1895 before it is stated). Two gender pages would repeat the line meanings (thin duplicates, "nothing per gender", SEO_PLAYBOOK §15) and invite "gender destiny" claims (CONTENT_GUIDE §4.2). One page holds 15,870 of India demand. |
| K3 | Education line | **An H3 on `/head-line/`**, "Education line (vidya rekha)", attributed to its source. Never says it predicts exams, degrees or success. | 710 a month (390/19 + 320/27). Not a line in the Western books; Indian sources describe it differently. Check the app's rule set and sources before describing it (CONTENT_GUIDE §9.4). Too little honest content for 1,000 words. |
| K4 | Mystic cross: own page or `/palm-crosses/`? | **Stays on `/palm-crosses/`**, now P2 #1. India primary "mystic cross on palm", US primary "palmistry crosses". The title carries both "mystic cross" and "X". "x on palm spiritual meaning" is framed as belief. | Same topic, one page: India 2,510 across 9 rows plus US ~1K. The page must also say that crosses are too small for most phone photos (CONTENT_GUIDE §4.6). |
| K5 | Rare palm lines: `/lucky-signs/` or its own page? | **Blog 6 `/blog/rarest-palm-lines/`**, retargeted to "rare palm lines" / "rare hand lines meaning", moved from P3 to P2 #2. `/lucky-signs/` keeps rare lucky **signs** (fish, star, triangle, trishul). | Lines are not signs. 1,530 a month in India; no US rows. The post becomes a small hub that links to `/simian-line/`, `/head-line/double/`, the double life line on `/life-line/`, the mystic cross and `/lucky-signs/`. "Rare" only with a sourced figure; otherwise "uncommon". |
| K6 | An English `/palm-reading-in-hindi/` page? | **No. Route the intent to the Hindi pages:** palm reading in hindi, palmistry reading in hindi, hand reading in hindi → `/hi/`; palm line reading / palm lines / palmistry lines / hand line reading in hindi → `/hi/hand-lines/`; palm reading for male in hindi → `/hi/which-hand-to-read/`. Hindi titles carry the Latin-script phrase after the Devanagari (CONTENT_GUIDE §3). | The searcher wants the answer in Hindi. An English page "about Hindi" can't give it and would be a doorway. 3,550 a month. |
| K7 | Palm reading book PDF | **Stays the `/palmistry-pdf/` lead magnet** (P2, WEB-FEAT-053; Hindi first, D17). India primary "palm reading book pdf". Adds an honest "Books palmists use" section that lists the public-domain classics the app cites (CONTENT_GUIDE §9.2), linked to legal free copies. Never a pirated PDF of an in-copyright book. | 980 a month in India vs ~260 US. "palm reading book" (390/25) is partly shopping intent; the books section answers it without selling. |
| K8 | Career line cluster | **Keep C8 / C9.** career line palmistry, career line on palm, job line in female hand → `/fate-line/` (the career line is another name for the fate line). business line in palmistry, career palm reading → `/career-palmistry/`, which explains that books give "business line" to different lines (show both, CONTENT_GUIDE §4.5). No career-line page. | One line, one page. 1,780 a month in India in total. A career-line page would copy `/fate-line/`. |
| K9 | "is palmistry true" vs "is palmistry real" | **"is palmistry true" becomes the primary** of `/is-palmistry-real/` in both markets; "real" stays a secondary. **Slug unchanged.** | India 1,300/34 vs 210/29; US 390/14 vs 50/27. Slug words barely affect ranking, and keeping the slug avoids churn in the docs, the scaffold and links. Title and H1 change in SEO_PLAYBOOK §3. |
| K10 | Medical wording in the simian cluster ("down syndrome palm", "transverse palmar crease", "single palmar crease", "palmar crease", "simian crease") | **Medically responsible, never exploited.** The medical facts come first, sourced at MedlinePlus / UF Health level: a single palmar crease is usually a normal variation; on its own it is **not a diagnosis**; doctors look at it only together with many other signs; for any worry, **see a doctor**. Title, H1, meta and CTAs use the palmistry term "simian line"; the medical wording appears only in that sourced section. No tool, scan, quiz or "check your child" wording for it; no reading CTA next to the medical section; conditions are never linked to a reading or listed as "predictions". Respectful name: "single palmar crease". P1-late only after the section is sourced and the owner OKs it (WEB-FEAT-042). | CONTENT_GUIDE §4.7. About 10,180 of the 18,680 is medical-style wording; parents may be searching after a birth. We serve them the facts and a doctor, not a funnel. |
| K11 | Off-topic India terms | **Skipped:** "writing with non dominant hand" 1,000, "non dominant hand meaning" 720, "non dominant hand" 480, "dominant hand meaning" 1,300, "dominant hand" 720, and bare "left palm" 720. `/which-hand-to-read/` still explains "dominant hand" in one body sentence (it is how palmists choose the hand) but never targets it. | Handedness, neuroscience and writing-practice intent (4,220 a month), not palmistry; a palmistry page can't satisfy it. Bare "left palm" is ambiguous (superstition, anatomy, pain). |

---

## 3. The 12 tools: one canonical page each (owner decision, 2026-09-26)

Each tool has **one** home. The matching guide links to it (a tool card) and never embeds a second copy. Every tool keyword below is distinct from the guide it explains.

| # | Tool | Canonical URL | Primary (distinct) | Secondary | The guide keeps (the tool must not target) | Evidence | Pri |
|---|---|---|---|---|---|---|---|
| 1 | Free AI palm reading | `/` (home is the tool; `/reading/` is the noindex flow) | free palm reading | see the `/` rows in §2.1 (US) and §2.4 (India) | — | US + India exports | P1 |
| 2 | Palm line finder | `/tools/palm-line-finder/` | palm line finder | palm line scanner (body only, never title) · see my palm lines · trace palm lines from a photo · find the lines on my palm | Home keeps "palm reading scanner / palm scanner / AI palm reading"; `/hand-lines/` keeps "lines on palm" | R11 §2.4 [unverified] | P2 |
| 3 | Palm photo checker | `/tools/palm-photo-checker/` | how to take a palm photo for reading | palm photo checker · check my palm photo · best light for a palm photo | Blog post 4 must not target this (C18) | Plan §6.1 [unverified] | P1 |
| 4 | Heart line finder | `/tools/heart-line-finder/` | which heart line do I have | heart line finder · heart line type checker | `/heart-line/`: heart line meaning, types, love line | Tool wording [unverified] | P2 |
| 5 | Head line finder | `/tools/head-line-finder/` | which head line do I have | head line finder · head line type checker | `/head-line/`: head line meaning, types, writer's fork · `/head-line/double/`: two / double head line | [unverified] | P2 |
| 6 | Life line finder | `/tools/life-line-finder/` | which life line do I have | life line finder · life line checker | `/life-line/`: life line meaning, short life line, age calculation | [unverified] | P2 |
| 7 | Fate line finder | `/tools/fate-line-finder/` | do I have a fate line | fate line finder · fate line checker | `/fate-line/`: fate line meaning, "no fate line" meaning, destiny / career line | [unverified] | P2 |
| 8 | Which-hand quiz | `/tools/which-hand-quiz/` | which hand should I read quiz | palm reading hand quiz · left or right hand palm reading quiz | `/which-hand-to-read/`: which hand to read palm, for female, left or right | [unverified] | P1 |
| 9 | Hand-type quiz | `/tools/hand-type-quiz/` | what hand type do I have | hand type quiz · palmistry hand shape quiz · what is my hand type | `/hand-types/`: types of hands, hand shapes, element hands | Autocomplete, R11 §1.10 | P2 |
| 10 | Palm signs checker | `/tools/palm-signs-checker/` | palm signs checker | check the signs on my palm · which signs are on my palm | `/lucky-signs/`: rare lucky signs, fish, star, triangle · `/palmistry-m/`: m on palm · `/palm-crosses/`: cross on palm | [unverified] | P2 |
| 11 | Interactive palm map | `/tools/palm-map/` | interactive palm reading chart | interactive palm map · palmistry map · tap a palm line for its meaning | `/hand-lines/`: palm reading chart, palm diagram, palmistry images (static chart for image search) | [unverified] | P1 |
| 12 | Spot-the-line quiz | `/tools/palm-reading-quiz/` | palm reading quiz | palmistry quiz · palm lines quiz · test your palmistry knowledge | `/palm-reading/`: how to read palms | R11 §2.4 [unverified] | P2 |

- **Never** a `/tools/free-palm-reading/` page. It would copy home. The `/tools/` card for tool 1 links to `/`.
- **Hindi tool pages:** `/hi/tools/` and `/hi/tools/<same slug>/` in P2, each published only after review. Their targets are set from a Devanagari export or Search Console queries (the English-script India export has no Hindi tool wording). They never use "स्कैनर / scanner / online check" terms, which belong to `/hi/` (H1 below).
- **Not built (owner):** marriage-age, children-count, lifespan and compatibility-score tools, in any language.

---

## 4. Blog

Each post links to 1 pillar and to home (R11 §2.4). No dates in URLs.

| # | URL | Primary | Secondary | Must not take from | Pri |
|---|---|---|---|---|---|
| 1 | `/blog/palm-reading-chatgpt-vs-palm-scanner/` | palm reading chatgpt | palm reading free chatgpt · palm reading ai prompt | Home keeps "ai palm reading" | P2 |
| 2 | `/blog/best-palm-reading-apps/` | best palm reading app | which app is best for palm reading · most accurate palm reading app (answered honestly: none is "accurate") · palm reading app reddit | `/app/` keeps "palm reading app", "…for android" and the brand | P2 |
| 3 | `/blog/do-palm-lines-change/` | do palm lines change | can palm lines change over time · do palm lines change with age | Hubs and pillars answer in ≤ 2 sentences and link here (C20) | P2 |
| 4 | `/blog/how-to-take-a-palm-photo/` | **retarget or merge (C18):** recommended new target "palm lines not showing in photo" | why palm lines look faint in photos | Tool 3 owns "how to take a palm photo" | P2 |
| 5 | ~~`/blog/palm-reading-for-female/`~~ | — | — | **DROPPED** before writing: "palm reading for female / male" belongs to `/which-hand-to-read/` (K2, C19) | — |
| 6 | `/blog/rarest-palm-lines/` | rare palm lines (IN 390/18) | rare hand lines meaning (IN 1,000/31) · rare hand lines (IN 140/30) · rarest palm lines · what is the rarest palm line | `/hand-lines/` answers in ≤ 2 sentences and links; `/lucky-signs/` keeps signs (K5) | P2 (was P3) |
| 7 | `/blog/can-palm-reading-predict-death/` | can palm reading predict death | death line on palm · can palmistry predict life expectancy | `/life-line/` keeps "short life line early death"; `/is-palmistry-real/` answers briefly and links | P3 (YMYL, care line) |

---

## 5. Pages with no keyword target

- **Trust (indexable, brand only):** `/about/`, `/about/deepak-chauhan/` (published when the owner sends the full bio), `/about/<hindi-reviewer>/` (once named), `/editorial-policy/`, `/how-it-works/`.
- **Legal (indexable, no targeting):** `/privacy/`, `/terms/`. **noindex:** `/delete-account/`, `/reset-password/`.
- **noindex and never in a sitemap:** `/reading/`, `/account/`, `/404`, any tool-result URL (`?shape=…`), share images.

---

## 6. Cannibalisation rules

| # | Keyword family | Owner | What the other pages do |
|---|---|---|---|
| C1 | love line · palmistry love line · soulmate line | `/heart-line/` | `/marriage-line/` links with the anchor "heart line"; "soulmate" appears only inside the honest box |
| C2 | marriage line · palmistry and marriage · two marriage lines · divorce line · "when will I marry" (palm) | `/marriage-line/` | `/heart-line/` FAQ "Can the heart line predict marriage?" = one sentence ("No") and a link |
| C3 | life-line keywords that sat in the big "lines on palm" group | `/life-line/` | `/hand-lines/` keeps 80–120 words per line and links to the pillar |
| C4 | broken / split life line | `/life-line/broken/` | The "Broken" H3 on `/life-line/` is ≤ 3 sentences and links. "Broken heart line" stays an H3 on `/heart-line/` (no sub-page; it fails the new-URL test) |
| C5 | which hand · left hand palm reading for female · palmistry left hand · **palmistry female · palm reading for male · female / male hand palmistry** (K2) | `/which-hand-to-read/` | Every other page has one short "left or right hand" section that links there. "<line> for female / male" stays on that line page. Tool 8 owns only quiz wording |
| C6 | the head term "palm reading" | Shared, not targeted | Home owns "free / online / scanner / AI / upload". `/palm-reading/` owns "how to / guide / beginners / learn" |
| C7 | scanner · scan palm · palm scanner · AI palm reading · hast rekha scanner · hath ki rekha online check | `/` and `/hi/` | Tool 2 never puts "scanner" in its title or H1 |
| C8 | line names: career line, destiny line, luck line, job line, Saturn line | `/fate-line/` | `/career-palmistry/` links with the anchor "fate (career) line" |
| C8b | line names: line of success, Apollo line | `/sun-line/` | `/career-palmistry/` and `/money-line/` link |
| C8c | line name: health line | `/mercury-line/` | Never read as health anywhere |
| C9 | topics: career palmistry, job palmistry, palm reading for career | `/career-palmistry/` | Fate, sun and head pillars link to it |
| C9b | money line · wealth line · money triangle · dhan rekha | `/money-line/` | Fate and sun pages link |
| C10 | one line on palm · simian line · single palmar crease · heart line and head line joined meaning · medical wording (simian crease, palmar crease, transverse palmar crease, "down syndrome palm") only inside the sourced medical section (K10) | `/simian-line/` | `/heart-line/` and `/head-line/` each keep one H2 "When the heart and head lines join" (≤ 120 words) and link. `/hand-lines/` keeps one sourced sentence and a link |
| C11 | m on palm | `/palmistry-m/` | — |
| C11b | x and m on palm · cross on palm · mystic cross · x mark / x sign on palm (K4) | `/palm-crosses/` | — |
| C11c | fish · star · triangle · trishul · rare lucky signs | `/lucky-signs/` | Line pages keep "<sign> on the <line>" as an H3 and link there |
| C12 | types of hands · hand shape · element hands | `/hand-types/` | Tool 9 owns "what hand type do I have" and "hand type quiz" |
| C13 | "<line> meaning / types / palmistry" | the pillar | Tools 4–7 own "which <line> do I have" and "<line> finder". A tool page sums up each type in ≤ 2 sentences from the rule data and links to the pillar; it never copies the pillar's variation cards |
| C14 | palm reading chart · palm diagram · palmistry images · names of the lines | `/hand-lines/` | Tool 11 owns only the "interactive" wording; its title starts "Interactive Palm Map" |
| C15 | how to read palms · palm reading guide | `/palm-reading/` | Tool 12 owns "palm reading quiz" |
| C16 | palm reading pdf · हस्त रेखा ज्ञान pdf | `/palmistry-pdf/`, `/hi/palmistry-pdf/` | `/palm-reading/` links from one H2 once the PDF is live |
| C17 | palm reading app · hand reading app · free palm reading app · palm astrology app · PalmSays app · palm reading app for android | `/app/` | "best palm reading apps / which app is best" → blog 2 |
| C18 | how to take a palm photo (for reading) | Tool 3 | Blog post 4 must not target it. **Recommended:** merge post 4 into the tool page (fewer, stronger pages). Alternative: retarget it to "palm lines not showing in photo". Owner decides before P2 |
| C19 | palm reading for female / male (broad) | `/which-hand-to-read/` (v2: blog 5 dropped before writing, K2) | Line pages keep "<line> for female / male" in-page. No gender page, ever |
| C20 | do palm lines change · rare palm lines / rare hand lines meaning · can palm reading predict death | Blogs 3, 6 and 7 | Hubs, pillars and `/is-palmistry-real/` answer in ≤ 2 sentences and link |
| C21 | is palmistry true / real / accurate / a science · palmistry real or fake · can it predict the future | `/is-palmistry-real/` | Every limits box links there with varied anchors. No other page targets it |
| C22 | two head lines · double head line | `/head-line/double/` (K1) | `/head-line/` keeps "forked head line" (writer's fork) and one "Two head lines?" H2 of ≤ 3 sentences that links there. Tool 5 never targets it |
| C23 | "… in hindi" (Latin script): palm reading / palmistry reading / palm lines / hand reading in hindi | `/hi/`, `/hi/hand-lines/`, `/hi/which-hand-to-read/` (K6) | English pages never target "in hindi"; they link to their Hindi twin through the language switch |
| C24 | education line (vidya rekha) · mind line · brain line | `/head-line/` (K3) | — |
| C25 | business line in palmistry | `/career-palmistry/` (K8) | `/fate-line/` and `/mercury-line/` may name it once and link |

---

## 7. Hindi and Hinglish targets

**Evidence:** Google autocomplete, `hl=hi, gl=in`, 2026-09-26 (R11 §4.1). **Devanagari: still no volumes** (the India export has no Devanagari rows). **Latin-script "… in hindi" queries do have India volumes** (3,550 a month, §2.4, K6); they are added below with their numbers. Re-rank the Devanagari primaries when a Devanagari export arrives (§10).

**Rules** (details in `CONTENT_GUIDE.md` §3):
- Devanagari body. Titles: Devanagari first, then a Hinglish phrase. English slugs under `/hi/`. No separate Hinglish pages.
- **Modifiers to cover on every Hindi page:** चित्र सहित / with photo · महिला / पुरुष · कहां होती है / कौन सी है · pdf · signs on lines (त्रिशूल, मछली, त्रिभुज, क्रॉस, चतुर्भुज) · दो मुखी (forked). "app / scanner" belongs to `/hi/` and `/hi/app/` only.
- **Trap:** bare "जीवन रेखा" / "jeevan rekha" is mostly a hospital brand in autocomplete. Target "हाथ में जीवन रेखा", "जीवन रेखा का चित्र" and "life line in hindi" instead.

| # | Hindi URL | English twin | Primary | Secondary | Pri |
|---|---|---|---|---|---|
| 1 | `/hi/` | `/` | ऑनलाइन हस्तरेखा स्कैनर (free) | hast rekha scanner (online) · hath ki rekha online check · palm reading in hindi free online · हस्त रेखा स्कैनर इन हिंदी (moved here from `/hi/tools/`, see H1) · **palm reading in hindi (IN 880/31) · palmistry reading in hindi (IN 880/26) · hand reading in hindi (IN 170/34)** | P1, after review |
| 2 | `/hi/palm-reading/` | `/palm-reading/` | हाथ की रेखा कैसे देखें | hath ki rekha kaise dekhe · हाथ की रेखा देखने का तरीका · हस्तरेखा देखना चित्र सहित · हस्तरेखा कैसे सीखें | P1 |
| 3 | `/hi/hand-lines/` | `/hand-lines/` | हाथ की रेखाएं क्या बताती है | हाथ की रेखाएं क्या कहती है / कैसे पढ़ें · हस्तरेखा ज्ञान (चित्र सहित) · hast rekha gyan · **palm line reading in hindi (IN 880/28) · palmistry lines in hindi (IN 210/31) · palm lines in hindi (IN 210/31) · hand line reading in hindi (IN 210/26)** | P1 |
| 4 | `/hi/heart-line/` | `/heart-line/` | हृदय रेखा | hriday rekha · हृदय रेखा टूटी होना · हृदय रेखा पर त्रिशूल / मछली / त्रिभुज (H3s that link to `/hi/lucky-signs/`) | P1 if reviewed in time, else days 31–60 |
| 5 | `/hi/head-line/` | `/head-line/` | मस्तिष्क रेखा | मस्तिष्क रेखा के प्रकार · दो मुखी मस्तिष्क रेखा · मस्तिष्क रेखा पर त्रिभुज · (two / double head line: English sub-page only for now, K1) | same |
| 6 | `/hi/life-line/` | `/life-line/` | हाथ में जीवन रेखा | जीवन रेखा का चित्र · life line in hindi | same |
| 7 | `/hi/fate-line/` | `/fate-line/` | भाग्य रेखा | bhagya rekha (konsi / kaha / do mukhi) · भाग्य रेखा के प्रकार / फोटो · भाग्य रेखा पर त्रिशूल / क्रॉस | same |
| 8 | `/hi/app/` | `/app/` | hast rekha app | हस्तरेखा app · ai hast rekha app · hast rekha app free download (answered: Google Play only) | P1 |
| 9 | `/hi/marriage-line/` | `/marriage-line/` | शादी की रेखा | विवाह रेखा (कितनी / की फोटो / दो मुखी) · shadi ki rekha konsi hoti hai / kaise dekhe / kaha hoti hai · दूसरी शादी की रेखा (honest: no line shows it) | P2 |
| 10 | `/hi/which-hand-to-read/` | `/which-hand-to-read/` | महिला का कौन सा हाथ देखें | palm reading for female which hand · पुरुष का कौन सा हाथ देखें · **palm reading for male in hindi (IN 110/20)** | P2 |
| 11 | `/hi/palmistry-m/` | `/palmistry-m/` | हाथ में M का निशान | hath me m ka nishan (ka matlab / dono hath / baye / dahine) | P2 |
| 12 | `/hi/money-line/` | `/money-line/` | धन रेखा | dhan rekha in hand (for female / male) · धन रेखा चित्र सहित / कौन सी | P2 |
| 13 | `/hi/lucky-signs/` | `/lucky-signs/` | हाथ में त्रिशूल का निशान | हाथ में मछली का निशान · हाथ में त्रिभुज का निशान | P2 |
| 14 | `/hi/children-line/` | `/children-line/` | संतान रेखा | santan rekha (in female hand) · संतान रेखा कहां / कौन सी | P2 |
| 15 | `/hi/tools/` and `/hi/tools/<slug>/` | `/tools/…` | TBD: the India export has no Hindi tool wording; set from Search Console queries after 30 days | Never scanner terms (H1) | P2 |
| 16 | `/hi/palmistry-pdf/` | `/palmistry-pdf/` | हस्त रेखा ज्ञान pdf | हाथ की रेखा देखने का तरीका pdf · hast rekha book pdf · हस्तरेखा शास्त्र pdf | P2 build, publish days 61–90 |
| 17 | `/hi/hast-rekha/` | `/indian-palmistry/` (only if equivalent) | हस्तरेखा शास्त्र | hast rekha shastra · हस्तरेखा शास्त्र क्या है · हस्तरेखा विज्ञान (the page says plainly that it is not a science) | P3 |
| — | later: `/hi/sun-line/` | `/sun-line/` | सूर्य रेखा | सूर्य रेखा के प्रकार · सूर्य रेखा पर मछली / त्रिशूल | Evidence exists; no page planned yet |

**Hindi cannibalisation rules**

| # | Keyword family | Owner |
|---|---|---|
| H1 | स्कैनर · scanner · online check · free online | `/hi/` only (this replaces §11.3 row 15, which gave "हस्त रेखा स्कैनर इन हिंदी" to `/hi/tools/`) |
| H2 | कैसे देखें · देखने का तरीका · kaise dekhe · कैसे सीखें | `/hi/palm-reading/` |
| H2b | क्या बताती है · मतलब · हस्तरेखा ज्ञान | `/hi/hand-lines/` (this replaces §11.3 row 2, which also listed "हस्त रेखा ज्ञान चित्र सहित" under `/hi/palm-reading/`: one owner only) |
| H3 | … pdf | `/hi/palmistry-pdf/` |
| H4 | हस्तरेखा शास्त्र (क्या है) | `/hi/hast-rekha/` (P3). Until it exists, the `/hi/palm-reading/` intro answers it in 2 sentences |
| H5 | "<रेखा> पर <निशान>" | That line's page, as an H3 |
| H5b | "हाथ में <निशान> का निशान" | `/hi/lucky-signs/` (M goes to `/hi/palmistry-m/`) |
| H6 | महिला / for female on any line | An in-page section; the hand question links to `/hi/which-hand-to-read/` |

---

## 8. Write first: low-KD wins

**India** (`keywords-in.tsv`): marriage line palmistry (4,400, KD 11) · palm reading online (5,400, KD 13) · free online palm reading scanner (2,400, KD 15) · free palm reading online (12,100, KD 17) · free palm reading (3,600, KD 17) · career line palmistry (590, KD 10; on `/fate-line/`) · head line in hand (210, KD 8) · which hand is seen in palmistry for male (260, KD 7) · palm reading fate line (140, KD 7) · palm reading fire hand (140, KD 3).

**US** (`keywords-us.tsv`): career palmistry (880, KD 5) · marriage line palm (1,000, KD 7) · palmistry and marriage (590, KD 6) · free online palm reading scanner (320, KD 7) · upload picture palm reading free online (260, KD 5) · rare lucky signs (260, KD 6) · broken heart line (210, KD 5) · palm reading career line (110, KD 2; now on `/fate-line/`, C8).

---

## 9. Excluded: noise and never-target

- **Noise:** bare "heart line" (art, tattoo, emoji, crossword) · "marriage line mobile home" · "fate line lyrics" · bare "types of hands" (poker, handshakes) · "sun line" in the astrocartography sense · bare "जीवन रेखा" (hospital) · "life line define".
- **Off-topic in the India export (K11):** "writing with non dominant hand" · "non dominant hand (meaning)" · "dominant hand (meaning)" (handedness, not palmistry) · bare "left palm" (ambiguous).
- **Medical wording is never a target of its own (K10):** "down syndrome palm", "transverse palmar crease", "simian crease", "palmar crease" appear only inside the sourced medical section of `/simian-line/`, never in a title, meta, CTA or ad.
- **Never target:** "palm reading near me" (a local search; we have no location) · "palm reading app mod apk" (Google Play only, never an APK) · zodiac × line, city, gender, age or name pages (scaled content) · marriage-age, children-count, lifespan or compatibility calculators (owner: no prediction tools).
- **Religion** ("is palmistry a sin / haram / demonic"): one neutral FAQ line on `/is-palmistry-real/` ("views differ between faiths; we don't take a side"). Never its own page.

---

## 10. Open items

1. ~~India export~~ **Done 2026-09-26** (`research/keywords-in.tsv`, §2.4). Still open: a **Devanagari** India export (seeds हस्तरेखा, हाथ की रेखा, भाग्य रेखा, शादी की रेखा, जीवन रेखा; to be saved as `research/keywords-in-hi.tsv`, OWNER_GUIDE §7) to re-rank the §7 primaries and set `/hi/tools/` targets.
2. ~~Raw US file~~ **In the repo** (`research/keywords-us.tsv`). Per-keyword US rows for a page can be pulled from it when that page is written.
3. **Blog post 4:** merge into tool 3 or retarget (C18). **Blog post 5:** dropped (K2); owner to confirm.
3b. **Owner OK** for the India-first moves: `/marriage-line/` and `/simian-line/` into P1 / P1-late, the new `/head-line/double/`, and `/life-line/broken/` moved down to P2 #8.
3c. **India SERP check** (`gl=in`) before writing: bare "heart line" intent, and "two head line palmistry" (K1).
4. **Tool keywords** marked [unverified]: review queries per tool page in Search Console after 30 days.
5. `WEBSITE_MASTER_PLAN.md` §6.1, §9 and §10.1 still show the 3-standalone-tool layout with tools embedded in guides. They need the 12 tool URLs above and the moves in C8 (career line → `/fate-line/`) and H1/H2b.
6. If the Play listing name is not "PalmSays", add it to the brand terms (SEO_PLAYBOOK §16).
