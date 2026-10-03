# SEO keyword-placement audit — 2026-09-27

**Scope:** every `indexable: true` page in `src/config/pages.ts` (28 pages), checked against `KEYWORD_MAP.md` v2 and `SEO_PLAYBOOK.md` §1–§5. Read-only audit; no code changed.
**Build checked:** `dist/` from 2026-09-27 18:21 (no `src/` file newer, so no rebuild). It is a **preview build**: every page carries `noindex, nofollow` (`src/lib/seo.ts` `robotsContent`, preview flag). Expected for a preview, but the production build must be re-checked for `index, follow, max-image-preview:large`.
**State checked:** `site.webReadingEnabled = false`, so home and `/hi/` render their "soon" title/meta (`homeTitleSoon`), not the blueprint "live" strings.
**Method:** `scratchpad/extract.mjs` pulled title, meta description, H1 (count + raw HTML), all H2s, first paragraph after the H1, and every internal link on `dist/index.html` with its anchor text. Keyword counts in body text were checked separately.

> **Applied 2026-09-27 (owner OK):** §5 items 1–5 done — home + `/hi/` titles/meta/intro/H2s (soon and live variants), home → `/marriage-line/` + `/hand-lines/` cards, descriptive `/app/` anchors, `/app/` + `/hi/app/` H1/meta/H2 + "hand reading app", tool fixes (finger-reader title/H1, photo-checker title, palm-map meta, hand-type-quiz H2, left-vs-right H2→H3), and from item 6 the life-line H1, heart-line "love line in hand" and the merged marriage-line limits. Not done: item 6 `/hand-lines/` and `/which-hand-to-read/` intros, the optional tool intros/H2s (heart/life-line finders, which-hand quiz, palm signs, `/tools/` H2), item 7 (production build check). Gate PASS. See PROJECT_MASTER.md §11.

Legend: ✓ primary (or a close natural variant) present · ~ partial / variant only · ✗ missing.

---

## 0. Verdict

**Guides: strong. Tools: good. Home + Hindi home: weak — the money keywords are missing.**

- All 28 pages: exactly one H1; every title ≤ 60 chars (max 59); every meta 132–155 chars. No length failures.
- `<em>` / `.foil` spans inside H1s read as one phrase in HTML (e.g. `<span class="foil">Heart line</span> meaning in palmistry` → "Heart line meaning in palmistry"). No split-heading problem.
- The 11 guides match their SEO_PLAYBOOK blueprints word for word (title, H1, meta) and carry the primary in title, H1 and at least one H2. Only first-paragraph and small India-variant gaps.
- **Home is the biggest problem.** Its India cluster (free palm reading online 12,100 · palmistry online free 12,100 · palm reading online 5,400 · scanner terms ~7K) is **~41.6K a month, the site's largest**, yet the soon-state page has no "free", no "online", no "scanner" in the title, meta, first paragraph or any H2. The word "online" is not on the page at all. Part of this is deliberate honesty (the web reading is closed), but "free" is already used honestly in the H1, and the H2s/intro can carry "AI palm reading" / "free palm reading" today.
- **Cannibalisation risk:** because home's title dropped "Free", `/tools/` ("**Free Palm Reading** Tools…", H1 "Free palm reading tools") is now the only page on the site with "free palm reading" front-loaded in title + H1. Google may send "free palm reading" (US 2,900 · IN 3,600) to `/tools/` instead of home.
- **Hindi:** `/hi/` has **zero** Latin/Hinglish keywords (no "palm reading in hindi" 880/31, no "hast rekha", no "hath ki rekha", no "स्कैनर") — breaks the "Devanagari first + Hinglish phrase" rule. `/hi/app/` title is right but its H1/meta/intro never say "हस्तरेखा ऐप". The **live** Hindi home title (`hi.ts` `homeTitleLive`) is still the v1 string and ignores the v2 blueprint.
- **Internal links from home:** `/marriage-line/` (India #8 target, 4,400 at KD 11 — the best low-KD win) has **no link from home** and is linked from only 5 pages site-wide. `/app/` gets four identical "What does yours say?" anchors and never the anchor "palm reading app".

---

## 1. Core pages

### `/` (home) — primary: free palm reading (US) / free palm reading online (IN), intent T

| Element | Actual | KW |
|---|---|---|
| Title (54) | AI Palm Reading That Traces Your Real Lines \| PalmSays | ~ "AI palm reading" (secondary) front-loaded; ✗ "free", ✗ "online" |
| Meta (152) | See how PalmSays traces the heart, head, life and fate lines on a palm, with a sample reading. Free web reading opens soon; the Android app works today. | ✗ no "palm reading" phrase at all |
| H1 (1) | Free AI palm reading What do your hands say? (eyebrow span + title span in one `<h1>`) | ✓ "free AI palm reading" |
| First para | Take one photo of your palm. We trace your heart, head, life and fate lines on it and show what palmistry reads in them. | ✗ |
| H2s | What your palm reveals · How it works · Free tools that use your photo · A real reading, before you scan yours · Learn to read your own lines · Questions people ask · What's free and what's paid · Want the full reading? | ✗ none contains "palm reading" |
| Body | "online" 0×, "palm reading online" 0×, "palmistry online free" 0×, "scanner" 0×, "free palm reading" 1× (footer link) | ✗ |

**Issues**
1. Title and meta miss the primary. The live strings (`en.ts` `homeTitleLive` "Free AI Palm Reading Online – See Your Lines on Your Photo") are correct but switched off.
2. H1 reads "…palm reading What do…" with no separator in the HTML text (the two spans only look separate). Harmless for ranking; a colon makes the snippet/AI-answer text cleaner.
3. No H2 or intro carries the keyword; the new pricing H2 ("What's free and what's paid") and closing H2 ("Want the full reading?") add nothing.
4. The redesign lost the blueprint H2s "How the free palm reading scanner works", "What AI palm reading can and can't tell you", "Free palmistry tools", "Learn the lines on your palm".

**Suggested fixes (soon state — honest while the web reading is closed)**
- `en.ts` `homeTitleSoon` → **`Free AI Palm Reading: See Your Real Lines Traced | PalmSays`** (59). "Free" is already on the H1 and backed by the 2 free readings in the app; if the owner rules "free" out for the soon state, keep the current title but see the `/tools/` fix below.
- `en.ts` `homeDescriptionSoon` → **`Free AI palm reading: see how PalmSays traces the heart, head, life and fate lines on a real palm. The web reading opens soon; the Android app works today.`** (~150)
- Hero H1: render the eyebrow as `Free AI palm reading:` (colon, or a visually-hidden `: `) so the HTML text reads "Free AI palm reading: What do your hands say?".
- First paragraph → **`Free AI palm reading on your own photo: take one picture of your palm and we trace your heart, head, life and fate lines, then show what palmistry reads in them.`**
- H2 "How it works" → **`How our AI palm reading works`**; "Free tools that use your photo" → **`Free palmistry tools that use your photo`**; "Learn to read your own lines" → **`Learn the lines on your palm`** (and add a card/link to `/hand-lines/` with that anchor).
- When `webReadingEnabled` flips, the live title/meta already carry "Free … Online"; then also add "online" to the intro ("…free palm reading online…") and one H2 with "palm reading scanner" (map §2.1/§2.4; C7).

**Home internal links (from `dist/index.html`)**

| Target | Anchors used | Note |
|---|---|---|
| `/app/` | "App", "Get the app" ×5, "Get my free reading in the app" ×2, "Open my readings", **"What does yours say?" ×4**, two locked-card blocks, "More about the app", "About the app" | ✗ never "palm reading app". Change one (e.g. "More about the app") → **"About our palm reading app"** |
| `/palm-reading/` | "Guides" ×2, "All guides", guide card "How to read palm lines…", footer "How to read palm lines" | ✓ |
| `/hand-lines/` | footer "Lines on your palm" only | ~ add a body link (see H2 fix) |
| `/heart-line/` `/head-line/` `/life-line/` `/fate-line/` `/is-palmistry-real/` | guide card (title + blurb + "Read the guide 6 min read" as one anchor) + footer name | ✓ anchors start with the keyword |
| `/which-hand-to-read/` | footer only | ~ |
| `/marriage-line/`, `/simian-line/`, `/head-line/double/` | **none** | ✗ add a `/marriage-line/` card to "Learn…" section (India 4,400/KD 11) |
| `/tools/` | "Tools" ×2, "See all free tools", footer "Free palm reading tools" | ✓ |
| `/tools/hand-type-quiz/`, `/finger-reader/`, `/left-vs-right-palm/` | tool cards | ✓ |
| `/tools/palm-photo-checker/`, `/palm-map/`, `/palm-reading-quiz/` | footer only | ok |
| `/tools/palm-line-finder/` (noindex) | tool card "…Opens soon" | fine (noindex until live) |
| Line-finder tools, which-hand quiz, palm-signs checker | none from home | ok (linked from 13–15 pages each) |

### `/app/` — primary: palm reading app (US 1,000/36 · IN 9,900/37), intent N/C

| Title (54) | Meta (155) | H1 | Intro | H2 |
|---|---|---|---|---|
| ✓ PalmSays: Palm Reading App for Android (Free to Start) — brand-first per app template | ✗ no "palm reading app" | ✓ "Android palm reading app that traces visible lines on your palm photo" (no brand; blueprint wanted brand + promise) | ✗ | ✗ (What the app does · What's free and what's paid · Your photos and privacy · What the app can't tell you · Questions people ask) |

"hand reading app" (IN 2,900/34) appears **0×** on the page.
**Fixes:** meta → **`PalmSays is a palm reading app for Android: scan your palm, see your lines traced and read what they mean. Free to start. What's free, what's paid, privacy.`** (~155; recount before shipping). H1 → **`PalmSays: the palm reading app that traces your real lines`** (blueprint). H2 "What the app does" → **`What the palm reading app does`**. Add one FAQ/body line using "hand reading app" (e.g. "Is PalmSays a hand reading app? Yes — …").

### `/hi/` — primary: ऑनलाइन हस्तरेखा स्कैनर / palm reading in hindi (IN 880/31), hast rekha scanner, hath ki rekha online check

| Title (44) | Meta (149) | H1 | Intro | H2 |
|---|---|---|---|---|
| ~ "AI हस्तरेखा: हथेली पर असली रेखाएं \| PalmSays" — ✗ no Hinglish phrase | ✗ no Hinglish phrase | ✓ "मुफ़्त AI हस्तरेखा रीडिंग आपके हाथ क्या कहते हैं?" — ✗ no Hinglish subtitle (blueprint: *Hath ki rekha online check — free*) | ~ हस्तरेखा | ~ none carries a target |

Body: "palm reading in hindi" 0×, "hast rekha" 0×, "hath ki rekha" 0×, "स्कैनर" 0×.
**Fixes:** `hi.ts` `homeTitleSoon` → **`AI हस्तरेखा रीडिंग | Palm Reading in Hindi | PalmSays`** (53, Devanagari first + the measured Latin phrase). Meta: append one Hinglish phrase, e.g. "…Android ऐप आज से। Palm reading in Hindi, free." (keep ≤ 155). Hero: add the small Hinglish subtitle under the H1 — **"Hath ki rekha online check — free"** (only once the check is actually online; until then "Hast rekha reading in Hindi"). `hi.ts` `homeTitleLive` is still v1 (`फ्री हस्तरेखा स्कैनर ऑनलाइन | Hast Rekha Scanner`); SEO_PLAYBOOK §3.1 v2 says → **`फ्री हस्तरेखा स्कैनर ऑनलाइन | Palm Reading in Hindi`** with "hast rekha scanner" moved to the H1 subtitle or meta.

### `/hi/app/` — primary: hast rekha app / हस्तरेखा ऐप

| Title (48) | Meta (155) | H1 | Intro | H2 |
|---|---|---|---|---|
| ✓ हस्तरेखा ऐप (Android): PalmSays \| Hast Rekha App | ✗ no "हस्तरेखा ऐप" | ✗ "Android ऐप जो आपकी हथेली की फ़ोटो में दिखने वाली रेखाएं पहचानता है" | ✗ | ✗ |

**Fix:** H1 → **`PalmSays — हस्तरेखा ऐप जो आपकी असली रेखाएं बनाता है`** (blueprint §3.1). Meta start → "PalmSays हस्तरेखा ऐप: फ़ोन कैमरे से हथेली स्कैन करें…". H2 "ऐप क्या करता है" → **"हस्तरेखा ऐप क्या करता है"**. Hindi copy needs the reviewer's OK.

### `/privacy`, `/terms` — no keyword target (brand/legal)
Title, H1, meta fine. Visible placeholder "[OWNER NAME: set company.name in src/config/site.ts]" in the first paragraph — preview-only by design (production build is blocked until set), but must never ship indexed.

---

## 2. Guides (all match their blueprints)

| URL | Primary (US / IN) | Title | H1 | Meta | Intro | H2 | Issue → fix |
|---|---|---|---|---|---|---|---|
| `/palm-reading/` | how to read palms / how to read palm lines | ✓ (58) front | ✓ | ~ "Learn palm reading in 7 steps" | ✓ "To read palm lines…" | ~ "What you need to read a palm" | Minor. H2 "Find your 4 main lines" is duplicated on `/hand-lines/`; fine. |
| `/hand-lines/` | lines on palm / hand reading lines 27,100 | ✓ (53) "Hand Reading Lines" front | ✓ "Lines on your palm…" | ~ "palm reading chart… every line on your hand" | ✗ "Most palms have three major lines…" | ✓ "What are the lines on your palm called?", "Palm reading chart…" | Intro → **"The lines on your palm are the heart line at the top, the head line across the middle and the life line around the thumb; many hands also have a fate line. Palmistry reads each for character, never dates."** (~38 words) |
| `/heart-line/` | heart line palm / heart line palmistry 3,600 | ✓ (50) | ✓ "…in palmistry (the love line)" | ✓ | ✓ | ✓ | India variants "love line in hand" (1,900) and "heart line in hand" (1,600) appear 0×. Add to the "Is the love line the same as the heart line?" answer: "…yes — the love line in your hand is the heart line." |
| `/head-line/` | head line palmistry | ✓ (51) | ✓ | ✓ | ✓ | ✓ incl. "Two head lines?", "Education line (vidya rekha)" (C22, K3 ok) | — |
| `/life-line/` | life line on palm / life line in hand 9,900 | ✓ (56) "Life Line in Hand" front | ~ "Life line meaning: …" (no palm/hand) | ~ | ✓ answers the short-life-line fear first (CONTENT_GUIDE §4.3) | ✓ "Does a short life line mean a short life?", "Life line in the hand for women and men" | Bare "life line" is ambiguous (hospital, insurance). H1 → **"Life line on your palm: what it shows (and what it doesn't)"** |
| `/fate-line/` | fate line palm / palmistry fate line | ✓ (54) | ✓ | ✓ | ✓ | ✓ incl. career/luck line (C8) | — |
| `/is-palmistry-real/` | is palmistry true | ✓ (55) | ✓ | ✓ | ✓ | ✓ "…is palmistry real or fake?" | — |
| `/which-hand-to-read/` | which hand to read palm / palmistry female 4,400 + palm reading for male 3,600 | ✓ (59) | ✓ | ✓ | ~ "Look at both hands…" | ✓ "Palm reading for female/male: …" | Intro → **"Which hand to read in palmistry? Look at both: the hand you write with is read as the life you are making, the other as what you started with. The lines mean the same for women and men."** Exact "palmistry female" 0× (variant "palm reading for female" 3×) — acceptable. |
| `/marriage-line/` | marriage line palm / marriage line palmistry 4,400/11 | ✓ (58) exact India term front | ✓ | ✓ | ✓ | ✓ "What does the marriage line mean in palmistry?" | Two consecutive limit H2s ("What the marriage line can't tell you" + "What palmistry can't tell you") — merge. **No home link** (see §1). |
| `/head-line/double/` | two head line palmistry 6,600 | ✓ (59) | ✓ | ✓ | ✓ | ✓ | — |
| `/simian-line/` | simian line / one line on palm | ✓ (55) | ✓ | ✓ (no medical terms in title/meta, K10 ok) | ✓ facts first | ✓ | — |

Cannibalisation between guides: none found. Guide titles never contain "finder/checker/quiz" (rule 5 ✓). `/heart-line/` and `/head-line/` each keep only the short "When the heart and head lines join" H2 (C10 ✓).

---

## 3. Tools

| URL | Primary (map §3) | Title | H1 | Meta | Intro | H2 | Issue → fix |
|---|---|---|---|---|---|---|---|
| `/tools/` | free palm reading tools | ✓ (56) "Free Palm Reading Tools: Hand Type, Fingers & Palm Photo" | ✓ ("Free `<em>`palm reading`</em>` tools" reads as one phrase) | ~ "Free palmistry tools…" | ✗ | ✗ | **Cannibalises home's "free palm reading"** while home's title lacks "Free" — fix home first (§1). Optional: H2 "From a photo of your palm" → "Free palm reading tools that use your photo". |
| `/tools/palm-photo-checker/` | how to take a palm photo for reading | ~ "Palm Photo Checker: Is Your Photo Good Enough to Read?" (secondary only) | ~ | ~ | ~ | ✓ "How to take a palm photo for a reading" | Blueprint and map disagree; primary only in an H2. Title → **"Palm Photo Checker: How to Take a Palm Photo for Reading"** (56) |
| `/tools/heart-line-finder/` | which heart line do I have | ✓ (53) | ✓ | ✓ | ✗ "Answer a few questions about the top line…" | ✓ | Intro → "Which heart line do you have? Answer a few questions about the top line on your palm…" |
| `/tools/head-line-finder/` | which head line do I have | ✓ (51) | ✓ | ✓ | ✓ | ✓ | — |
| `/tools/life-line-finder/` | which life line do I have | ✓ (51) | ✓ | ✓ | ✗ "…the line around your thumb" | ✓ | Intro → "Which life line do you have? Pick the curve, length and marks of your life line…" |
| `/tools/fate-line-finder/` | do I have a fate line | ✓ (58) | ✓ | ✓ | ✓ | ✓ | — |
| `/tools/which-hand-quiz/` | which hand should I read quiz | ✓ (45) | ✓ | ✓ | ✓ | ✗ | Minor: H2 "How it works" → "How the which-hand quiz works". |
| `/tools/hand-type-quiz/` (after photo change) | what hand type do I have | ✓ (59) "What Hand Type Do I Have? Find It From a Photo of Your Palm" | ✓ | ✓ | ✓ | ✓ "What the hand types mean" | Secondaries "hand type quiz" / "palmistry hand shape quiz" now 0× on page (URL still `/hand-type-quiz/`; the quiz stays as the no-photo way). Add an H2 **"No photo? Take the hand type quiz"** over the quiz fallback. Title lacks "palmistry" — optional: "What Hand Type Do I Have? Palmistry Hand Type From a Photo" (58). |
| `/tools/finger-reader/` | palmistry finger reader [unverified] | ✗ "Finger Reader: Index vs Ring Finger & Thumb From a Photo" | ✗ "Finger reader: …" | ✗ | ~ | ~ | "Finger reader" alone is a hardware term (fingerprint readers). Title → **"Palmistry Finger Reader: Index vs Ring Finger From a Photo"** (58); H1 → "Palmistry finger reader: your fingers and thumb, measured from a photo". Never "palmistry fingers" (guide's term, map §3 #13). |
| `/tools/left-vs-right-palm/` | compare left and right palm | ✓ (50) "Left vs Right Palm: Compare Both Hands…" | ✓ | ✓ | ✓ | ✓ | Tool-UI step labels "First hand" / "Second hand" are H2s — make them H3 or non-heading. No clash with `/which-hand-to-read/` (C5 ✓). |
| `/tools/palm-signs-checker/` | palm signs checker | ✓ (51) | ✓ | ✓ | ✗ | ~ | Title lists "M, Cross, Star, Fish & Triangle" — the future owners are `/palmistry-m/`, `/palm-crosses/`, `/lucky-signs/`. Fine today (no such pages), re-check when they launch. Intro → "Palm signs checker: tick the marks you can see…" |
| `/tools/palm-map/` | interactive palm reading chart | ~ "Interactive Palm Map: Tap a Line to See Its Meaning" (C14 ✓) | ~ | ✗ | ✗ | ✗ | Primary 0× on page. Meta → **"An interactive palm reading chart: tap any line or mount to see its name, where it runs and what palmistry traditionally reads in it. No photo needed."** (~150) |
| `/tools/palm-reading-quiz/` | palm reading quiz | ✓ (42) | ✓ | ~ | ~ | ~ | Minor. |

Scanner wording: no tool uses "scanner" in title/H1 (C7 ✓; DEC-036 dropped it from `/tools/`).

---

## 4. Growth gaps — top 10 keyword clusters with no page yet

(Volumes from KEYWORD_MAP §2.0/§2.4; US and IN kept separate.)

| # | Page to build | Lead keyword (vol/KD) | US vol | IN vol | Map priority |
|---|---|---|---|---|---|
| 1 | `/palm-crosses/` | mystic cross on palm 480/24 (IN) · palmistry crosses 880/23 (US) | ~1K | ~2.5K | P2 #1 |
| 2 | `/hand-types/` | different types of hands 720/22 (US) · palm reading fire hand 140/3 (IN) | ~2.6K | ~250 | P2 #4 |
| 3 | `/palmistry-fingers/` | palmistry fingers 320/15 (IN) + thumb terms | ~250 | ~1.4K | P3 #1 |
| 4 | `/career-palmistry/` | career palmistry 880/**5** (US) · business line in palmistry 320/31 (IN) | ~1.2K | ~430 | P2 #3 (low-KD US win) |
| 5 | `/sun-line/` | sun line palmistry 480/29 · success line on palm 480/30 | ~1.1K | ~480 | P2 #5 |
| 6 | `/blog/rarest-palm-lines/` | rare hand lines meaning 1,000/31 (IN) | — | ~1.5K | P2 #2 |
| 7 | `/hi/hand-lines/` | palm line reading in hindi 880/28 + 3 rows; Devanagari demand unmeasured | — | 1,510 | **P1** (Hindi) |
| 8 | `/palmistry-m/` (+ `/hi/palmistry-m/`) | palmistry m 390/23 | ~1.5K | 0 | P2 #6 |
| 9 | `/money-line/` (+ `/hi/money-line/`) | money line in hand palmistry 320/22 | ~1.5K | 0 | P2 #7 |
| 10 | `/palmistry-pdf/` | palm reading book pdf 590/17 (IN) | ~260 | ~980 | P2 (blocked on WEB-SRV-008/013) |

Next after these: `/chinese-palmistry/` (US ~1.1K), `/children-line/` (~1K), `/lucky-signs/` (~1K, rare lucky signs 260/6), `/life-line/broken/` (~740), blog 2 "best palm reading app", and the other **P1 Hindi guides** (`/hi/palm-reading/`, `/hi/heart-line/`, `/hi/head-line/`, `/hi/life-line/`, `/hi/fate-line/`; volumes unmeasured, but P1 in the map). `/tools/palm-line-finder/` exists but stays noindex until the line scan is live.

**Bigger than any missing page:** the home cluster (~41.6K IN, ~18.7K US) is effectively untargeted while the soon-state strings are live (§1). Fixing the home title/meta/intro/H2s is the single highest-value change.

---

## 5. Priority list

1. Home soon-state title, meta, intro, H1 colon and 3 H2s (§1) — fixes the home miss and the `/tools/` cannibalisation.
2. `/hi/` title/meta Hinglish phrase + H1 subtitle; update `hi.ts` `homeTitleLive` to the v2 blueprint.
3. Home → `/marriage-line/` card; one `/app/` anchor "palm reading app".
4. `/app/` meta + H1 + one H2; "hand reading app" once. `/hi/app/` H1 "हस्तरेखा ऐप".
5. Tool fixes: finger-reader title/H1, palm-photo-checker title, palm-map meta, hand-type-quiz "quiz" H2, left-vs-right H2→H3.
6. Guide intros: `/hand-lines/`, `/which-hand-to-read/`; `/life-line/` H1; `/heart-line/` "love line in hand".
7. Before launch: confirm the production build emits `index, follow, max-image-preview:large` and no legal placeholders.
