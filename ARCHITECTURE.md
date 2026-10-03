# PalmSays website — Architecture

> **What this is:** the technical shape of palmsays.com: stack and pinned versions, folders, every route, content schema, the one config file, languages, the reading flow, what lives in the app repo, env vars, deployment, and the **frozen contracts** that must never break.
> **When to read it:** before any code, route, URL, config or deploy work. It is the **source of truth for architecture and URLs**; `WEBSITE_MASTER_PLAN.md` §6, §8, §12 and `research/09-stack-architecture.md` are the background.

---

## 1. Stack (pinned)

Versions are the npm latest on 2026-09-26 (R09 §1.1). At the scaffold, re-check npm, install **exact** versions (no `^` or `~`), commit `package-lock.json`, and update this table.

| Package | Version | Role |
|---|---|---|
| Node.js | 22+ (Astro 6+ needs it) | Build |
| `astro` | 7.3.5 | Static site, `output: 'static'` |
| `@astrojs/react` / `@astrojs/mdx` / `@astrojs/sitemap` | 7.0.0 / 8.0.2 / 3.7.4 | Islands, MDX, sitemaps with i18n alternates |
| `react`, `react-dom` | 19.3.0 | Islands only |
| `tailwindcss` + `@tailwindcss/vite` | 4.3.3 | `@theme` tokens (`DESIGN_SYSTEM.md`) |
| `@supabase/supabase-js` | 2.117.2 | Auth + RPC, **only via `api.palmsays.com`** |
| `@mediapipe/tasks-vision` | 1.0.1 (Apache-2.0) | On-device hand landmarks for the photo tools (v3, WEB-DEC-039); wasm self-hosted from the package, model in `public/models/`, loaded only after a photo is picked |
| `wrangler` | 4.141.0 | Deploy, previews, rollback |
| `zod` | 4 (the one Astro ships) | Content schemas |
| `pagefind` | 1.5.2 | P3 only (search at ~40 posts) |
| **Pinned at the scaffold, 2026-09-26** (exact, `package-lock.json`) | astro 7.3.5, @astrojs/react 7.0.0, @astrojs/mdx 8.0.2, react/react-dom 19.3.0, tailwindcss + @tailwindcss/vite 4.3.3, wrangler 4.141.0, typescript **6.0.3** (7.0.2 is latest, but @astrojs/check 0.9.10 and typescript-eslint 8.70.1 need ≤ 6.0), @astrojs/check 0.9.10, eslint 10.11.0, typescript-eslint 8.70.1, eslint-plugin-astro 3.2.1, eslint-plugin-jsx-a11y-x 0.2.0, eslint-plugin-react-hooks 7.1.1, vitest 5.0.2, @fontsource/mukta, cormorant-garamond, tiro-devanagari-hindi 5.3.0, uqr 0.1.3 (build-time QR). `@astrojs/sitemap` not used: sitemaps are our endpoints from `src/config/pages.ts`. Site check = `scripts/check-web.mjs` (`check:web` = `check:site`) | Scaffold |
| To pin at scaffold (not version-checked in research) | — | `react-turnstile`, `nanostores`, Paraglide JS, `astro-og-canvas`, `uqr`, `preact` (embedded widgets ≤ 10 KB), `vitest`, `@playwright/test`, Lighthouse CI |
| Not used | — | `@astrojs/cloudflare` 14.x (only if an on-demand route is ever needed), Next.js, SvelteKit, Satori, AGPL libraries, tag managers |

Upgrades: one package family per branch, full `QA_RELEASE.md` gate, note it in `DECISIONS.md` if behaviour changes. Astro 7 is young (June 2026): keep MDX simple (components, few remark/rehype plugins).

## 2. Folder structure

```
palm-ai-website/
  astro.config.mjs        static, site=https://palmsays.com, trailingSlash 'always', build.format 'directory',
                          i18n {en, hi, prefixDefaultLocale false}, react, mdx, sitemap(i18n), built-in CSP
  wrangler.jsonc          assets.directory ./dist, html_handling auto-trailing-slash, not_found_handling 404-page, no main
  public/_headers         security + cache headers (SECURITY_PRIVACY.md §5)
  public/_redirects       /privacy.html → /privacy/ 301 (+ 3 more legal pages); www → apex is a Cloudflare redirect rule, not this file
  messages/en.json, hi.json   UI strings (Paraglide); guides are MDX, not strings
  src/config/site.ts      THE ONE PLACE for brand, URLs, keys, package, prices, free numbers (§5)
  src/content.config.ts   collections: guides, blog, tools, faqs (§4)
  src/content/guides/{en,hi}/*.mdx · blog/{en,hi}/*.mdx · tools/*.yaml
  src/layouts/            Base, Guide, Tool, Legal, Blog
  src/components/         zero-JS .astro: SeoHead, LangSwitch, ThemeToggle, StoreButton, QrCode, Faq, LimitsBox,
                          SourcesList, StepOf7, Breadcrumbs, PalmDiagram, QuickFacts, VariationCard, Byline
  src/islands/            React: ReadingApp (client:only), PhotoChecker, LineFinder, SpotTheLineQuiz, AccountPanel,
                          DeleteAccount, PdfOptIn. Preact / plain TS for light tools: PalmMap, WhichHandQuiz,
                          LineMeaningFinder, HandTypeFinder, SignsChecker
  src/scripts/            upload-start.ts (home, no React)
  src/lib/reading/palm/   COPIED from the app by scripts/sync-palm-lib.mjs + SOURCE.md (commit, date, files, sha256) — WEB-DEC-037.
                          Never edit by hand — re-sync.
  src/lib/web/            supabase.ts (proxy URL), image.ts, quality.ts, api.ts, idb.ts, events.ts, store-link.ts
  src/lib/entities.ts     entity registry: palmistry terms, verified Wikidata ids, about/mentions per page (WEB-DEC-049)
  src/lib/schema.ts       JSON-LD builders; BaseLayout joins them into one @graph per page (WEB-DEC-049)
  src/pages/              index, [...slug] (guides, both languages), tools/<slug>, blog/…, app, reading, account,
                          privacy, terms, delete-account, reset-password, 404, robots.txt.ts, llms.txt.ts,
                          .well-known/assetlinks.json.ts, og/[...path].png.ts, hi/…
  src/styles/global.css   Tailwind 4 @theme tokens
  scripts/                sync-palm-lib.mjs, check-site.mjs
  tests/                  unit/ (Vitest), e2e/ (Playwright), fixtures/ (mock reading result)
  qa/shots/               screenshots per date + branch (gitignored; paths go in PROJECT_MASTER evidence)
  research/, research-tools/   planning material + screenshot tool (not part of the build)
```

## 3. Route table

Legend — **Rendering:** SSG = static HTML; +island = one interactive component; client-only = static shell drawn in the browser; build file = generated at build. **App Link** = Android opens the app for this exact path (with and without the slash) once S9 is live. **Phase** = build phase (§14 of the plan).

### Core, hubs, pillars, legal (P1)

| URL | Type | Rendering | Indexable | Hindi pair | App Link | Phase |
|---|---|---|---|---|---|---|
| `/` | Home = tool 1, the free reading | SSG + upload-starter script | yes | `/hi/` | no | P1 |
| `/reading/` | Reading flow | client-only (`ReadingApp`) | **noindex**, not in sitemap, not disallowed | one route; UI follows the visitor's language | no | P1 |
| `/palm-reading/` | Hub: how to read palms | SSG | yes | `/hi/palm-reading/` | **yes** | P1 |
| `/hand-lines/` | Hub: lines on the palm + chart; links to tool 11 | SSG | yes | `/hi/hand-lines/` | **yes** | P1 |
| `/heart-line/`, `/head-line/`, `/life-line/`, `/fate-line/` | Line pillars; each links to its meaning-finder tool | SSG | yes | `/hi/<same-slug>/` | **yes** | P1 |
| `/head-line/double/` | Sub-page: two / double head line (KEYWORD_MAP K1, WEB-FEAT-069) | SSG | yes | none (no hreflang) | **no** (exact paths only, F1) | P1-late |
| `/is-palmistry-real/` | Honesty page | SSG | yes | later | no | P1 |
| `/which-hand-to-read/` | Guide; links to tool 8 | SSG | yes | `/hi/which-hand-to-read/` (P2) | no | P1 |
| `/tools/` | Tools hub (links all 12, tool 1 = `/`) | SSG | yes | `/hi/tools/` (P2) | no | P1 |
| `/app/` | App page | SSG + 1 KB device script | yes | `/hi/app/` | no | P1 |
| `/account/`, `/hi/account/` | Sign in (Google + 6-digit email code), name, free readings left, My readings (server, locked like the web report), Get the app, sign out (this browser), delete account link (WEB-FEAT-029/062) | client-only island | noindex, not in sitemap, no hreflang pair (language switch via `langPath`) | — | no | P1 |
| `/privacy/`, `/terms/` | Legal | SSG | yes | Hindi summary later | no | P1 |
| `/delete-account/`, `/reset-password/` | Account pages | SSG + small island | noindex | — | no | P1 |
| `/privacy.html`, `/terms.html`, `/delete-account.html`, `/reset-password.html` | **Frozen legacy URLs** (app + Play Console) | 301 → the URL above | — | — | no | P1 |
| `/hi/` | Hindi home | SSG + script | yes | `/` | no | P1, after owner review |
| `/hi/palm-reading/`, `/hi/hand-lines/`, `/hi/heart-line/`, `/hi/head-line/`, `/hi/life-line/`, `/hi/fate-line/` | Hindi hubs + pillars | SSG | yes | English twins | **yes** | P1, each after owner review |
| `/hi/app/` | Hindi app page | SSG | yes | `/app/` | no | P1, after owner review |
| `/404` | Not found (bilingual) | SSG | noindex | — | — | P1 |
| `/sitemap-index.xml` + `sitemap-{core,guides,tools,blog,hi}.xml`, `/robots.txt`, `/llms.txt` | Crawl files | build file | — | — | — | P1 |
| `/.well-known/assetlinks.json` | App Links proof | build file; `application/json`, no redirect; skipped while the SHA list is empty | — | — | — | P1 (on with S9) |
| `/og/<path>.png` | Share images | build file, one per language | — | — | — | P1 |

### Tools — standalone pages (WEB-DEC-006; v3 photo tools WEB-DEC-039)

Slugs for tools 4–11 are **proposals**: the plan does not fix them. `KEYWORD_MAP.md` sets the final slug before first publish; after that the slug is frozen and this table must match it. Tool result states (e.g. `?shape=forked`) never create indexable URLs.

| # | Tool | URL | Rendering | Indexable | Hindi pair | Phase |
|---|---|---|---|---|---|---|
| 1 | Free AI palm reading | `/` → `/reading/` | as above | yes | `/hi/` | P1 |
| 2 | Palm line finder (AI scan, no meanings) | `/tools/palm-line-finder/` | SSG + plain TS; wired to the reading API scan step (`src/lib/tools/line-scan.ts`): "opens soon" (no upload) until WEB-SRV-004 `lines_only` exists (`LINES_ONLY_SERVER`), mock on previews (`?reading=mock`) | **no** until `LINE_SCAN_LIVE` | later | P2 |
| 3 | Palm photo checker (on-device pixel maths) | `/tools/palm-photo-checker/` | SSG + plain TS; a passing photo is handed to the photo tools (this tab only) | yes | `/hi/tools/palm-photo-checker/` (P2) | P1 |
| 4–7 | Heart / head / life / fate line finder | `/tools/heart-line-finder/`, `/tools/head-line-finder/`, `/tools/life-line-finder/`, `/tools/fate-line-finder/` (KEYWORD_MAP §3) | SSG + plain TS | yes | later | P2 |
| 8 | Which-hand quiz | `/tools/which-hand-quiz/` | SSG + plain TS | yes | later | P1 |
| 9 | Hand type from your photo (URL kept from the quiz; the quiz stays as the no-photo way) | `/tools/hand-type-quiz/` | SSG + plain TS + on-device hand model | yes | later | P2 |
| 10 | Palm signs checker | `/tools/palm-signs-checker/` (KEYWORD_MAP §3) | SSG + plain TS | yes | later | P2 |
| 11 | Interactive palm map | `/tools/palm-map/` | SSG + plain TS | yes | later | P1 |
| 12 | Palm reading quiz | `/tools/palm-reading-quiz/` | SSG + plain TS | yes | later | P2 |
| 13 | Finger reader (index vs ring, thumb, gaps) | `/tools/finger-reader/` | SSG + plain TS + on-device hand model | yes | later | P2 |
| 14 | Left vs right hand | `/tools/left-vs-right-palm/` | SSG + plain TS + on-device hand model; line half = reading API scan step (off until WEB-SRV-004 `lines_only`) | yes | later | P2 |

Built 2026-09-26 (tools session): slugs are now **frozen**. The rule-based tools and the photo checker use plain TypeScript, not React (DESIGN_SYSTEM.md §11: rule tools ≤ 10–20 KB; React + ReactDOM alone is ≈ 57 KB gzip). Logic and data live in `src/lib/tools/` (pure, unit-tested), markup in `src/components/tools/`, pages in `src/pages/tools/`; tool data is TypeScript, not a `src/content/tools/*.yaml` collection, so the rules are type-checked and tested.

#### On-device hand model (photo tools 9, 13, 14; WEB-DEC-039)

- **What:** MediaPipe Hand Landmarker (21 points per hand + left/right), npm `@mediapipe/tasks-vision` 1.0.1 and `hand_landmarker.task` float16 v1 (sha256 `fbc2a300…cde1`, 7.8 MB), both Apache-2.0; licence + source in `public/models/hand-landmarker/LICENSE.txt`. Nothing from a CDN: the wasm (11.8 MB SIMD / 11.0 MB fallback) and its loader are emitted by Vite from the package into `/_astro/` (hashed, immutable); the model sits in `/models/hand-landmarker/float16-1/` (`_headers`: immutable).
- **Loading:** only after the visitor picks a photo (`src/lib/tools/hand/detector.ts`): our own fetch with a real byte count ("4.2 of 20 MB, once"), wasm handed over as a `blob:` URL (one download), model as a buffer; the HTTP cache keeps both. Photo downscaled to 768 px before the model; 0.3 confidence + a second pass with a 20 % grey border (recall 195 → 202 of 206 phone photos, many darker skin tones).
- **CSP:** only these pages add `'wasm-unsafe-eval'` to script-src and `blob:` to connect-src (`src/lib/tools/hand/csp.ts` via `Astro.csp`); every other page keeps the strict policy. No inline `style` attributes (the hashed CSP blocks them).
- **Privacy:** the photo is decoded, re-encoded without EXIF and measured in the page; the e2e run (`tests/e2e/photo-tools.mjs`) fails if any request after the pick is not a GET to this site. A photo handed between tools stays in this tab's `sessionStorage` for one page load.
- **Maths:** `src/lib/tools/hand/` (pure, unit-tested: `measure.ts`, `verdict.ts`, `shape.ts`, `fingers.ts`, `compare.ts`); cut-offs in `cutoffs.ts`, set on 485 open-palm photos (Palmistry_seg, CC BY 4.0, app repo dataset).
- **Budget:** check-web counts a photo-tool page (`data-tool-kind` hand/device/ai) against the 70 KB tool budget (QA_RELEASE.md §2.3; today 14–27 KB); the model and the MediaPipe runtime load after the pick and are not counted.

### P2 and P3 pages

| URL | Type | Rendering | Indexable | Hindi pair | App Link | Phase |
|---|---|---|---|---|---|---|
| `/life-line/broken/` | Sub-page | SSG | yes | none (no hreflang) | **no** (exact paths only) | P2 (#8 in the India-first order, KEYWORD_MAP §2.0) |
| `/career-palmistry/`, `/palmistry-m/`, `/money-line/`, `/hand-types/`, `/sun-line/`, `/palm-crosses/`, `/lucky-signs/` | Guides | SSG | yes | `/hi/palmistry-m/`, `/hi/money-line/`, `/hi/lucky-signs/`; others later | no | P2 |
| `/marriage-line/`, `/children-line/` | Honest guides, no tool | SSG | yes | `/hi/marriage-line/`, `/hi/children-line/` | no | `/marriage-line/` **P1** (KEYWORD_MAP v2); `/children-line/` P2 |
| `/simian-line/` | Sensitive guide (medical facts first) | SSG | yes | later | no | **P1-late** (KEYWORD_MAP v2; after the sourced medical section + owner OK) |
| `/palmistry-pdf/` | Lead magnet (PDF file itself `X-Robots-Tag: noindex`) | SSG + opt-in island | yes | `/hi/palmistry-pdf/` | no | P2 |
| `/about/`, `/about/<name>/`, `/editorial-policy/`, `/how-it-works/` | Trust pages | SSG | yes | later | no | P2 (before P2 guides) |
| `/blog/`, `/blog/<slug>/` (built 2026-10-01, WEB-DEC-057; `/blog/page/<n>/` only when the index gets long) | Blog | SSG | yes | `/hi/blog/<slug>/` when translated | no | P2 |
| `/indian-palmistry/` + `/hi/hast-rekha/` | Culture hub (paired only if equivalent) | SSG | yes | see left | no | P3 |
| `/chinese-palmistry/`, `/palm-mounts/`, `/history-of-palmistry/`, `/palmistry-fingers/`, `/mercury-line/` | Guides | SSG | yes | later | no | P3 |

## 4. Content collections

Defined in `src/content.config.ts` with Zod 4. The build fails on any schema error.

**guides** (`src/content/guides/{en,hi}/*.mdx`)
- `title` (≤ 60 chars), `description` (70–160), `locale` (`en` | `hi`), `slug`
- `translationKey` — pairs EN and HI; a one-sided pair fails the build
- `pillar`, `isPillar`, `stepOf7`
- `keywordCluster` {primary, secondary (≤ 15), usVolume, kd, inVolume}
- `related` (≤ 6), `tool` (reference to a tools entry), `appLesson` (deep-link target)
- `sources[]` {title, author, year, url, ruleIds} — at least 1; every `ruleIds` entry must exist in `lib/palm`
- `reviewedBy` {name, role, date}, `published`, `updated` (never before `published`)
- `ymyl` (`none` | `marriage` | `children` | `lifespan` | `health`) — forces the LimitsBox and wording checks
- `faq[]` (≤ 8), `heroImage`, `draft`, `noindex`

**blog** (as built, WEB-DEC-057: `src/content/blog/<slug>.mdx`, route `src/pages/[...guide].astro` (shared with the guides so their CSS stays one file), `src/layouts/BlogLayout.astro`, helpers `src/lib/blog.ts`): `title`, `description`, `path` (`/blog/<slug>/`), `locale`, `h1`, `answer` (≤ 40 words), `summary` (the /blog/ index line), `crumb`, `disclosure?`, `pillar`, `related[]` (≤ 3), `about[]`/`mentions[]` (ids from `src/lib/entities.ts`), `author` (`deepak-chauhan`), `ymyl`, `limits?`, `status`, `published`, `updated`, `reviewedBy?`, `keyword`, `sources[]` (≥ 1, the guides' book/other shapes), `faq[]` (≤ 8). Each post is also a row in `src/config/pages.ts` (sitemap group `blog`).

**tools** (`src/content/tools/*.yaml`) — `id`, `slug`, title + description per language, `kind` (`photo-ai` | `photo-local` | `quiz` | `picker` | `map`), `usesAI` (shown as a label), `island`, `relatedGuides`, `faq`, `limits`, `howItWorks`, `sources`. Every tool page renders the tool plus how it works, what palmistry says (with sources), honest limits, FAQ, and links to its guide and to the reading.

**faqs** — shared FAQ entries referenced by guides and tools.

## 5. Config: one source (`src/config/site.ts`)

Pages never type these values. Static pages import them; live values (balance) come from the server.

| Field | Value today | Status |
|---|---|---|
| `brand` / `brandHi` | `PalmSays` / TBD | brand: owner. Hindi form: ask owner |
| `domain`, `baseUrl` | `palmsays.com`, `https://palmsays.com` | owner |
| `apiUrl` | `https://api.palmsays.com` | waits for S2 |
| `supabasePublishableKey` | `sb_publishable_…` of the app's project | public by design; get from the app side |
| `turnstileSiteKey` | from the owner's Turnstile site | owner step |
| `playPackage` | `com.palmreadai.app` (app `app.json`, 2026-09-26) | If the app repo changes it before the first Play release (WEB-SRV-014), update here and in `assetlinks.json` |
| `appScheme` | `palmreadai` | app `routes.ts` |
| `appLinkPaths` | the 6 paths + `/hi/` twins (§11 F1) | frozen |
| `assetlinksSha256` | `[]` | Play App Signing SHA-256 from owner; empty list = file not served |
| `locales` | `['en', 'hi']` | fixed |
| `launchDate` | `null` | owner sets the go-live day before deploy (OWNER_GUIDE.md §13); becomes every older guide's `datePublished` (WEB-DEC-049) |
| `diagramLicence` | CC BY 4.0, credit "PalmSays (palmsays.com)" | decided 2026-09-28 (WEB-DEC-050); our diagrams only, never photos |
| `freeReadings` | `{ guest: 1, afterEmail: 1 }` | static copy only; a build check compares it with the server; the reading screen always uses `reading_balance()` |
| `appPrices`, `appSizeMb`, `appFreeFeatures` | from Play | [verify] per country before launch |
| `readingTimeP50`, `readingTimeP90` | `null` until measured | copy using them is hidden while `null` |
| `playRating` | threshold 4.0★ and 100+ ratings (D21, proposed) | shown only above the threshold |
| `iosAppAvailable` | `false` | owner |
| `ageRule` | `18` | WEB-DEC-012 |
| `company` {name, email, grievanceContact} | TBD | owner |
| `author` | Deepak Chauhan (details pending) | owner |
| `ruleSetVersion` | read from `src/lib/reading/palm/SOURCE.md` | set by the sync script |

## 6. Languages (i18n)

- Astro i18n: `defaultLocale: 'en'`, `locales: ['en','hi']`, `prefixDefaultLocale: false`. Hindi under `/hi/` with the **English slugs**; Hindi-only pages get ASCII Hinglish slugs (`/hi/hast-rekha/`).
- `<html lang="hi">` on Hindi pages; `:lang(hi)` CSS sets Devanagari fonts and line height ≥ 1.45.
- UI strings: Paraglide (`messages/en.json`, `hi.json`). Guides are MDX per language.
- `SeoHead` writes canonical (self, absolute), hreflang `en` ↔ `hi` + `x-default` → English, only for true translations. The sitemap alternates must match the head tags exactly.
- The reading screen is one route; its language follows the page the visitor came from or their saved choice. Report text uses the app's `localise.ts` (copied), so Hindi reports are the app's own.
- A Hindi page is published only after the owner or the Hindi reviewer has read it.

## 7. Reading flow (summary)

Full spec: plan §8.1–8.3; rules and tests: skill `web-reading-flow`; data and privacy: `SECURITY_PRIVACY.md`.

1. Home/tool: pick or take a photo → IndexedDB → open `/reading/`.
2. Browser: decode with EXIF rotation, resize, re-encode (drops EXIF/GPS), local photo check, hand + writing-hand choice.
3. Turnstile (managed, action `reading`) in the background.
4. `auth.signInAnonymously()` (only after a photo is picked; reuse an existing session).
5. `web-gate {token}` → 10-minute web pass (S3).
6. "Use this photo" → `rpc start_web_reading(hand, dominant, idempotency_key)` → web cap, `source='web'` (S4).
7. `scan-palm` (1,080 px) → Modal traces lines → lines draw onto the photo.
8. `extract-palm` (768 px) → charges the free reading (refunded on 422/503) → Workers AI observation.
9. In the browser: `buildEvidence → synthesise → buildReading → lockSynthesis`; locked text dropped.
10. Save `palm_observations`, `reading_reports`, `rpc complete_reading`.
11. Reveal; save {photo, observation, report} in IndexedDB.
12. Sign-up: `updateUser({email})` → 6-digit code → `verifyOtp('email_change')`.
13. Reading 2 = steps 2–11 again (other hand suggested), charged `free_email`.
14. `reading_balance()` → 0 → zero-readings state → app.

Every call goes to `api.palmsays.com` with `apikey: <publishable key>` and `Authorization: Bearer <user access token>`.

### 7.1 Sign-in and the account (WEB-DEC-045, `WEB_AUTH_PLAN.md`)

- **One Supabase client** for the whole page: `src/lib/supabase-client.ts` (`storageKey: 'palmsays-auth'`, `detectSessionInUrl: false`), used by `api-live.ts` and `lib/auth/live.ts`; reached only through `import()` and only with `readingConfig().apiUrl` (never `*.supabase.co`). A test's injected fetch gets its own client.
- **Google** = Google Identity Services (`lib/auth/gis.ts`, popup + FedCM) → ID token → `signInWithIdToken`, or for a guest `linkIdentity({ provider: 'google', token, nonce })` (same user id); on `identity_already_exists` / linking off → sign in to the existing account, the guest reading stays in this browser and the page says so (`lib/auth/google.ts` `linkOrSignIn`, ported from the app). Fresh nonce per attempt (SHA-256 to Google, raw to Supabase). GIS loads only on `/account/`, `/hi/account/`, `/reading/` when a sign-in card/sheet is on screen; One Tap only on `/account/` and after the first free reading. Hidden in in-app browsers / Android WebView (`isInAppBrowser`, incl. `; wv)`) — "Open in Chrome" note instead; email code always available.
- **Email code:** reading sheet as before (guest `updateUser` → `verifyOtp('email_change')`; "taken" → sign-in code). `/account/`: a guest the same way; no session → `signInWithOtp({ shouldCreateUser: true })` → `verifyOtp('email')`.
- **Sign-out:** only on `/account/` (header link `/account/?signout=1`): `signOut({ scope: 'local' })` + GIS `disableAutoSelect()`, then "remove readings from this browser?". Guests never see "Sign out".
- **Header:** `src/lib/auth/header-script.ts`, inline in `Header.astro` (its hash added to the CSP in `BaseLayout`): signed in = a `palmsays-auth` session whose user is not anonymous → round initial + popover menu (My readings, Account, Sign out); else "Sign in". Sets `palmsays-had-account` (case 20: signed-out browsers get "Sign in to read" instead of a new guest).
- **My readings:** `reading_reports` of the user (any device); opening one re-validates its `palm_observations` with the app's `palmObservationSchema`, re-runs the app's `synthesise` and applies `lockSynthesis` (`lib/account/server-reading.ts`, loaded on "Open"). No photo (it stays on the device where it was taken).
- **Name:** typed on `/account/` → `localStorage palmsays-me` (this browser only); pre-fills the reading's name question, else Google's given name.
- **Mock:** `lib/auth/mock.ts` keeps a pretend session in the same `palmsays-auth` entry (`mock: true`, deleted by the live client).
- **Off:** when the reading mode is `off` (production until `site.webReadingEnabled`) `/account/` says sign-in on the website opens soon and shows the app.

## 8. What lives where

| Here (website repo) | App repo (`palm-ai-new--feat-m1-foundation`) |
|---|---|
| Static pages, content, tools, islands, styles | Supabase schema, migrations, RPCs (`reading_balance`, `start_web_reading`, …) |
| `src/lib/reading/palm/` — a **copy** of the app's pure TS (rules, synthesis, quality metrics, localise) | The original of that code; rule changes happen there first, then re-sync here |
| `site.ts` config, `_headers`, `_redirects`, sitemaps, `robots.txt`, `llms.txt` | Edge functions: `scan-palm`, `extract-palm`, `write-report`, `delete-account`, new `web-gate` |
| `assetlinks.json` file (content from config) | App Links intent filters, `APP_LINK_HOST`, Play App Signing |
| Legal pages (after the move, S11) | The old `web/` folder + `deploy-web.mjs` (retired after launch, S11) |
| Web funnel event sender | `log_event_counts` + its allow-list (web events to be added, S10) |
| — | Proxy Worker `api.palmsays.com`, Modal line scanner, Workers AI, Auth settings, SMTP, all secrets |

**Shared contracts** (a change on either side needs both): API endpoints, headers and error codes (§11 F6); `reading_balance()` shape; App Link paths; legal URLs; package name + SHA-256; the event allow-list; `ruleSetVersion`.

## 9. Environment variables

| Variable | Where | Public? | Purpose |
|---|---|---|---|
| `PUBLIC_ENV` | build | yes | `preview` → `noindex` on every page; `production` |
| `PUBLIC_READING_MODE` | build | yes | `mock` (previews, fixture result) or `live`; honoured on preview builds only (also `?reading=`), production follows `site.webReadingEnabled` |
| `PUBLIC_API_URL` | build | yes | Preview builds only: another https proxy (never `*.supabase.co`); production = `site.apiUrl` |
| `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | build | yes | The publishable key (also the legal pages) |
| `PUBLIC_TURNSTILE_SITE_KEY` | build | yes | Turnstile site key of the palmsays.com widget (until it moves into `site.ts`) |
| `PUBLIC_GOOGLE_WEB_CLIENT_ID` | build | yes | The app's Google **Web** client ID (`864260847321-9mpk…`), shared so one Google user = one account (WEB-DEC-045). Empty → the Google button is hidden in live mode; the email code still works |
| `CLOUDFLARE_API_TOKEN` | CI / Workers Builds only | **no** | Deploy; scoped to this Worker only |
| `CLOUDFLARE_ACCOUNT_ID` | CI only | no (not secret, keep out of client) | Deploy |

Rules:
- Client code may read only `PUBLIC_*` variables and `site.ts`. The publishable key and Turnstile site key are public by design and live in `site.ts`.
- **Never in this repo, env or bundle:** `TURNSTILE_SECRET` (Supabase function secret), `sb_secret_…` / `service_role` keys, Modal keys, SMTP credentials.
- No `.env` values in git. `check-site` fails if `dist/` contains `sb_secret_`, `service_role` or `TURNSTILE_SECRET`.

## 10. Deployment

- **Worker:** Cloudflare Workers with static assets; name set at scaffold (`palmsays-web` [rec]). `wrangler.jsonc`: `assets.directory: "./dist"`, `html_handling: "auto-trailing-slash"`, `not_found_handling: "404-page"`, no `main`.
- **Build (CI):** `astro check && vitest run && astro build && node scripts/check-site.mjs` (npm script `build:ci`, see `QA_RELEASE.md`).
- **Preview:** every branch → `npx.cmd wrangler versions upload --preview-alias <branch>` → `<branch>-<worker>.<account>.workers.dev`, `PUBLIC_ENV=preview`, reading in mock mode. Real-backend preview only behind Cloudflare Access.
- **Production:** `main` → Workers Builds (GitHub) → custom domain `palmsays.com`; `www` 301s to the apex; HTTPS only with HSTS. Production deploys run only after the `release-gate` skill passes and the owner says go (Claude cannot push; the owner pushes or runs the deploy).
- **Launch path (2026-09-28, until Workers Builds is connected):** the owner runs `npm.cmd run deploy` (`scripts/build-prod.mjs`: `PUBLIC_ENV=production` + `.env.launch` public values + check-web, then `wrangler deploy`). `wrangler.jsonc` `routes` = `palmsays.com` custom domain; `www` → apex is a Cloudflare Redirect Rule (proxied `www` AAAA `100::`), not a Worker route. Every `*.workers.dev` host answers `X-Robots-Tag: noindex` (`public/_headers`). Steps: `OWNER_GUIDE.md` §13.
- **Caching:** `/_astro/*`, `/models/*`, `/media/*` `public, max-age=31536000, immutable`; `/images/*`, `/samples/*`, `/badges/*`, `/icons/*`, `/og/*` one day + `stale-while-revalidate` (names reused); HTML `max-age=0, must-revalidate` (Workers default).
- **Rollback:** `npx.cmd wrangler rollback` or the dashboard (last 100 versions). Practise once on day 1 and confirm static assets roll back with the version. Steps in `QA_RELEASE.md` §7.
- **Monitoring:** uptime on `/`, `/hi/`, `/sitemap-index.xml`, one tool page and `api.palmsays.com`, with certificate-expiry alerts.

## 11. FROZEN CONTRACTS

Breaking any of these breaks the app, Play Console, search rankings or the law. Changing one needs: owner OK + a new WEB-DEC row + the app-repo change where marked + the full `release-gate`.

| # | Contract | Rule | Why | Checked by |
|---|---|---|---|---|
| F1 | **App Link paths** | These 12 pages always exist and return 200 at their slash form: `/palm-reading/`, `/hand-lines/`, `/heart-line/`, `/head-line/`, `/life-line/`, `/fate-line/` and the same six under `/hi/`. The no-slash form (e.g. `/heart-line`) redirects to the slash form (Workers auto-trailing-slash); the app's intent filters list both forms. Never rename, never move. No other path is an App Link (`/life-line/broken/`, `/palmistry-pdf/` and all `/tools/` pages open in the browser). | The app's intent filters and router (`routes.ts` `PUBLIC_LINKS`) list exactly these | `check-site`, phone test |
| F2 | **`/.well-known/assetlinks.json`** | 200, `Content-Type: application/json`, **no redirect**, package `com.palmreadai.app` (or its successor, see §5) + the real SHA-256 list; not served while the list is empty | Android verifies App Links from this file | `check-site`, post-deploy curl |
| F3 | **Legal URLs** | `/privacy.html`, `/terms.html`, `/delete-account.html`, `/reset-password.html` always resolve: 301 to `/privacy/`, `/terms/`, `/delete-account/`, `/reset-password/` (the `#…` part is kept). All 8 variants tested. `/delete-account/` must always work. Fallback if Play Console rejects the redirect: serve the `.html` pages directly. | The app and Play Console already link these; Play requires a working delete-account page | post-deploy curl (QA §8) |
| F4 | **Free-reading rules are the server's** | The website never decides who gets a free reading. It reads `reading_balance()`; errors 402/403 drive the UI. Static copy comes from `site.ts` and a build check compares it with the server. No client-side counters of "readings left". | One rule for web and app; copy must be true | `web-reading-flow` tests |
| F5 | **URL rules** | Never change or remove a published URL without a 301 and a sitemap update in the same release. Lowercase ASCII, hyphens, trailing slash, no `.html` (except the F3 legacy names). Query parameters are never indexed; canonical is always the clean URL. | Rankings, backlinks, App Links | `check-site` (redirect map vs previous sitemap) |
| F6 | **Backend API contract** | Only `https://api.palmsays.com`; headers `apikey` + `Authorization: Bearer`; error codes 402 `no_readings_left`, 403 `needs_email_verification`, 409 `invalid_session`, 413, 422 `not_a_palm`, 429 `daily_capacity_reached` / `too_many_attempts` / `rate_limited`, 503 `scanner_unavailable`. | Shared with the app backend | unit tests with mocked responses |
| F7 | **`src/lib/reading/palm` is a copy** (WEB-DEC-037) | Never edited by hand; only `scripts/sync-palm-lib.mjs [app-path]` (`npm.cmd run sync:palm`); `SOURCE.md` sha256 must match | Web and app must give the same reading | parity tests, sha check |
| F8 | **Indexing rules** | `/reading/`, `/account/`, `/delete-account/`, `/reset-password/`, `/404` and every preview page carry `noindex`; `/reading/` and `/account/` are not disallowed in `robots.txt` and never in a sitemap | Google must see the `noindex` | `check-site` |
