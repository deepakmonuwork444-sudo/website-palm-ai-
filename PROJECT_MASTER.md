# PalmSays website — PROJECT MASTER (Part A: control document)

> **What this is:** the live state of the PalmSays website (palmsays.com): features, server work it needs, bugs, active work, the next exact action and the session handoff.
> **When to read it:** first, in every session, before any other file. It is the **source of truth for project status**. `WEBSITE_MASTER_PLAN.md` is the background (the why and the what); this file says where we are.

**Status words (only from evidence):**

| Status | Meaning |
|---|---|
| PLANNED | Not started |
| IN PROGRESS | Being built, not finished |
| IMPLEMENTED — NOT VERIFIED | Code exists, but no passing test, check or phone test proves it |
| DONE — VERIFIED | Proven; the Evidence column links the proof (test name, check output, screenshot path, release log row) |
| NEEDS VERIFICATION | Someone says it is done; no evidence yet |
| BLOCKED | Waiting on the item named in "Depends on" |
| BROKEN | Worked before, fails now (add a WEB-BUG row) |
| DROPPED | Removed by a decision (name the WEB-DEC) |

Rules: a UI without its working backend is never DONE. Never raise a status without an evidence path. Never delete a row; mark it DROPPED. Update only the rows your work touched, in the same turn as the work.

---

## 1. Snapshot

| | |
|---|---|
| Product | **PalmSays** — the public website for the Palm Read AI Android app: a free AI palm reading on the home page, honest guides, 12 free tools, a blog, and an `/app/` page that leads to Google Play. No payments on the website. |
| Domain | `palmsays.com` (owner, 2026-09-26). API host (planned): `api.palmsays.com` = the app's proxy Worker in front of Supabase |
| Stage | Step 1 (foundation) built on branch `feat/web-foundation`, local only: not committed, not deployed. |
| Stack | Astro 7 static + React 19 islands + MDX + Tailwind 4, on Cloudflare Workers static assets (see `ARCHITECTURE.md`) |
| Folder | `D:\palm ai\palm-ai-website` |
| Companion repo | `D:\palm ai\palm-ai-new--feat-m1-foundation` — the app and its Supabase backend. **Read-only from here.** Server work is done there, in its own session, following its `PROJECT_MASTER.md`. |
| Git | `git init` done 2026-09-26, branch `feat/web-foundation`. **No commit yet** — the owner decides commits; Claude cannot push. |
| Author | Deepak Chauhan (full details pending from the owner) |
| Last update | 2026-09-26 — step 1 foundation (scaffold, config, layout, home, /app/, legal .html, SEO plumbing, checks) |

## 2. Document map

| File | What it holds (source of truth for) | Read it when |
|---|---|---|
| `PROJECT_MASTER.md` | Status, features, bugs, next action, handoff | Always, first |
| `CLAUDE.md` | Entry point: start steps, rules, skills, owner's working style | Auto-loaded |
| `DECISIONS.md` | Every decision (WEB-DEC-###), incl. rejected options and open ones | Before changing anything decided; when a decision is made |
| `ARCHITECTURE.md` | Stack + versions, folders, **route table**, config, i18n, deploy, **frozen contracts** | Any code, route, URL, config or deploy work |
| `SECURITY_PRIVACY.md` | Data flow, **allowed privacy claims**, CSP, secrets, abuse limits, incidents | Reading flow, privacy copy, headers, anything touching user data |
| `QA_RELEASE.md` | The "never breaks" gate, deploy, rollback, release log | Before any merge, deploy or "it's done" |
| `OWNER_GUIDE.md` | Owner's manual steps (Hinglish) | When the owner has to do something |
| `DESIGN_SYSTEM.md` | Tokens, fonts, components, look | Any UI work |
| `UX_PSYCHOLOGY.md` | Funnel psychology, trust mechanics, copy tone | UX, copy, conversion work |
| `SEO_PLAYBOOK.md` | Technical and on-page SEO rules | Any indexable page |
| `CONTENT_GUIDE.md` | Writing rules, honesty, review workflow | Guides, blog, tool content |
| `KEYWORD_MAP.md` | Keyword and slug per page | Before creating any page or URL |
| `WEBSITE_MASTER_PLAN.md` | Plan v2 (background; docs cite its §) | For the "why" |
| `research/01–11` | Evidence behind the plan | Only when a doc points there |
| `research-tools/shot.mjs` | Playwright screenshots (mobile 390×844 + desktop 1440×900) | Smoke screenshots (QA_RELEASE.md) |

`DESIGN_SYSTEM.md`, `UX_PSYCHOLOGY.md`, `SEO_PLAYBOOK.md`, `CONTENT_GUIDE.md` and `KEYWORD_MAP.md` were written by parallel sessions on 2026-09-26; if one is missing, use the plan section it would cover. Skills are listed in `CLAUDE.md`.

## 3. Feature registry — website (this repo)

Phases and hours: `WEBSITE_MASTER_PLAN.md` §14. Tool slugs marked "(slug: KEYWORD_MAP)" are not fixed yet (see `ARCHITECTURE.md` §3).

### P1 — launchable site with the live reading (≈ 27 h here)

| ID | Feature | Plan § | Depends on | Status | Evidence |
|---|---|---|---|---|---|
| WEB-FEAT-001 | Scaffold: `git init`, Astro 7 + React 19 + MDX + Tailwind 4 + sitemap + wrangler, exact pinned versions, npm scripts named as in `QA_RELEASE.md`, CI to a preview URL | §14.2 D1, §12.1 | — | IMPLEMENTED — NOT VERIFIED | Gate 2026-09-26 (`npm.cmd run gate`): check 0 errors, lint 0, test 47/47, build OK, check:web 0 errors; shots `qa/shots/2026-09-26-feat-web-foundation/`. Branch `feat/web-foundation`, nothing committed. Not done: CI + preview URL (no deploy yet). Versions: `ARCHITECTURE.md` §1 |
| WEB-FEAT-002 | Site config `src/config/site.ts` (brand, baseUrl, apiUrl, package, SHA list, prices, free numbers) + build check of config vs server | §4.7, §12.2 | 001 | IMPLEMENTED — NOT VERIFIED | `src/config/site.ts` + `tests/unit/site.test.ts`. Prices marked `verified: false` [verify vs Play]; `webReadingEnabled=false`. Not done: config-vs-server build check (needs a `reading_balance()` fixture) |
| WEB-FEAT-003 | Design tokens, base layout, header, footer, mobile menu, bottom CTA bar, language switch, Day/Night toggle | §5, §6.3–6.4 | 001, `DESIGN_SYSTEM.md` | IMPLEMENTED — NOT VERIFIED | `src/styles/global.css` (DESIGN_SYSTEM §6 tokens), `BaseLayout`, `Header` (menu sheet, अA/हिंदी link, Day toggle), `Footer`; shots checked 390 + 1440, Night + Day. Not done: mobile bottom CTA bar. No phone test |
| WEB-FEAT-004 | `SeoHead` (canonical, hreflang, OG, JSON-LD) + breadcrumbs | §10.3–10.4, §6.5 | 003 | IMPLEMENTED — NOT VERIFIED | SEO head in `src/layouts/BaseLayout.astro`, `src/lib/seo.ts`, `src/lib/schema.ts`, `Breadcrumbs.astro`; check:web verifies canonical, reciprocal hreflang, JSON-LD, no banned schema. Rich Results Test not run |
| WEB-FEAT-005 | `StoreButton` + price line + QR + device logic + iPhone note + UTM referrer | §4.3, §12.7 | 002 | IMPLEMENTED — NOT VERIFIED | `StoreButton.astro` (official badge EN/HI, price line, utm referrer), `QrCode.astro` (build-time SVG), iPhone note via `<html data-os>`; iPhone/Android logic checked in headless Chrome. Prices [verify]; no phone test |
| WEB-FEAT-006 | Content collections (guides, blog, tools, faqs) + Guide layout (all §7.2 blocks, LimitsBox, Sources, Byline) | §12.3, §7.2 | 003 | IMPLEMENTED — NOT VERIFIED | Guides collection `src/content.config.ts` (zod schema = CONTENT_GUIDE §13) + route `src/pages/[...guide].astro` + `src/layouts/GuideLayout.astro` (breadcrumbs, byline → `/about/deepak-chauhan/` stub, answer-first, drawing with the line highlighted (`PalmTrace` `highlight` prop), quick facts, inline CTA honest while `webReadingEnabled=false`, TOC, photo tips, FAQ, sources, step n of 7, end block + StoreButton/price line, related; Article + BreadcrumbList + FAQPage JSON-LD; production build refuses `draft` and YMYL-without-owner-OK guides). MDX components `src/components/guides/*` (Variation cards with drawings `src/lib/guides/palm-geometry.ts`, PalmChart, ThreePart, MythReality, LimitsBox, ToolCard, Hi). Book list + app rule-id snapshot `src/lib/guides/books.ts`, `app-rules.ts` (copies until WEB-FEAT-018). `tests/unit/guides.test.ts`; check-web: guides need the limits box, `<span data-denial>` skips a denied phrase (max 2). Gate 2026-09-26: guide pages 0 check/lint/test errors, check:web 0 errors on guides (HTML ≤ 22.6 KB, JS 1.0 KB gzip); shots `qa/shots/2026-09-26-feat-web-foundation/` (heart, life, marriage, hand-lines). Blog/tools/faqs collections not built (tools use TS data). Rich Results Test not run |
| WEB-FEAT-007 | Hubs `/palm-reading/`, `/hand-lines/` (EN) | §6.1, §7 | 006 | IMPLEMENTED — NOT VERIFIED | `src/content/guides/palm-reading.mdx` (≈ 2,990 visible words, 7 steps, 4 tool cards), `hand-lines.mdx` (≈ 2,250; labelled palm chart, names table). Owner has not read them |
| WEB-FEAT-008 | Line pillars `/heart-line/`, `/head-line/`, `/life-line/`, `/fate-line/` (EN) | §7.3 | 006 | IMPLEMENTED — NOT VERIFIED | `heart-line.mdx` (≈ 2,800 words, 12 types), `head-line.mdx` (≈ 2,680, 10 types + education line per K3), `life-line.mdx` (≈ 2,330, fear answered first, care line; **YMYL lifespan: owner OK needed**), `fate-line.mdx` (≈ 2,390). Every meaning from an app rule (`ruleIds`) or a cited corpus chapter; fact-checked against the corpus text 2026-09-26 |
| WEB-FEAT-009 | `/is-palmistry-real/` | §6.1 | 006 | IMPLEMENTED — NOT VERIFIED | `is-palmistry-real.mdx` (≈ 2,430 words): Forer 1949, Kimura & Kitagawa 1986, Wilson & Mather 1974, Lucas et al. 2019 (DOIs), Skeptic's Dictionary; Article `citation[]` |
| WEB-FEAT-010 | `/which-hand-to-read/` guide (links to tool 8, no embedded copy) | §6.1 | 006 | IMPLEMENTED — NOT VERIFIED | `which-hand-to-read.mdx` (≈ 2,160 words): female + male H2s (K2), Cheiro, Benham, Dale 1895 "The Hand to Examine" (the `[verify]` is closed: the right-male/left-female rule is in Dale), tool card to `/tools/which-hand-quiz/` |
| WEB-FEAT-011 | `/app/` page | §7.6 | 005 | IMPLEMENTED — NOT VERIFIED | `/app/` + `/hi/app/` (`src/components/app/AppPage.astro`); shots in the gate folder. Says the Play name is still "Palm Read AI" (WEB-SRV-014). Hindi copy not reviewed |
| WEB-FEAT-012 | `/tools/` hub | §6.1 | 006 | IMPLEMENTED — NOT VERIFIED | `src/pages/tools/index.astro`: all 12 tools grouped "Runs on your phone" / "Traditional meanings — not AI" / "Uses AI", exact honesty labels, tools 1–2 "opens soon", CollectionPage + ItemList(12) schema, `sitemap-tools.xml`, header + footer links. Title drops "Scanner" while the web scanner is closed (deviation from SEO_PLAYBOOK §3). Shots `qa/shots/2026-09-26-tools/`. No phone test |
| WEB-FEAT-013 | Legal: `/privacy/` (with the "On the website" section), `/terms/`, `/delete-account/`, `/reset-password/` + 301s from the `.html` URLs | §12.11, §8.5(c) | 002; company details from owner | IN PROGRESS | Step 1: the 4 frozen `.html` pages copied from the app repo (`src/legal/`, rendered by `src/lib/legal.ts`, brand = PalmSays, Supabase config via `PUBLIC_SUPABASE_*` env, CSP hashes checked, tests in `tests/unit/legal.test.ts`). Production build fails until company name/email are in `site.ts` (owner item 9). Not done: `/privacy/`… pages + 301s, "On the website" section |
| WEB-FEAT-014 | Crawl files: `robots.txt`, `llms.txt`, 5 group sitemaps, bilingual 404 | §10.5 | 004 | IMPLEMENTED — NOT VERIFIED | `robots.txt`, `llms.txt`, `sitemap-index.xml` + non-empty group sitemaps (core, hi) from `src/config/pages.ts` with hreflang alternates, bilingual `404`; check:web + `tests/unit/sitemap.test.ts` pass. Live host not checked |
| WEB-FEAT-015 | OG images, English + Hindi conjunct test | §12.8 | 004 | IN PROGRESS | Default share images `public/og-default.png` + `og-default-hi.png` (Hindi conjunct हस्तरेखा, ज्ञान rendered OK), `logo-512.png`, `apple-touch-icon.png` from `scripts/make-images.mjs`. Not done: per-page OG images |
| WEB-FEAT-016 | Gate tooling: `check-site.mjs`, Vitest, Playwright smoke, Lighthouse CI | §12.1, `QA_RELEASE.md` | 001 | IN PROGRESS | `scripts/check-web.mjs` (`check:web` = `check:site`; 2026-09-26 tools session: the JS budget now counts statically imported chunks, tool pages HTML ≤ 25 KB), Vitest (223 tests), ESLint, `astro check`, `npm run shots` (+ fonts.json). Not done: Playwright e2e + axe, Lighthouse CI |
| WEB-FEAT-017 | Security headers + CSP (`public/_headers`) | §12.9 | 001 | IMPLEMENTED — NOT VERIFIED | `public/_headers` (HSTS, nosniff, frame-ancestors, Permissions-Policy, immutable `/_astro/*`) + Astro hashed `<meta>` CSP; 0 console/CSP errors in headless Chrome. Live headers not checked (no deploy) |
| WEB-FEAT-018 | `lib/palm` sync script + copied files + `SOURCE.md` + parity tests | §12.6 | 001 | IMPLEMENTED — NOT VERIFIED | `scripts/sync-palm-lib.mjs` (`npm.cmd run sync:palm`) copies 50 app files + 2 web shims into `src/lib/reading/palm/` (WEB-DEC-037: under lib/reading, copies carry `@ts-nocheck`, ESLint-ignored), app commit 38389f51b74d **plus uncommitted app changes in 2 files** (`SOURCE.md`); parity: sha256 of every copy + the web copy gives exactly the app build's reading (`tests/fixtures/palm-golden.json`, written from the app's own compiled code). Gate 2026-09-26 (`npm.cmd run gate`, preview build): astro check 0 errors, ESLint 0, Vitest 285/285 (reading: `tests/unit/reading-{palm,machine,api,misc}.test.ts`), build OK, check:web 0 errors. Re-sync after the app commits |
| WEB-FEAT-019 | Photo pipeline (`createImageBitmap`, EXIF removed, 1080/768/96 px) + in-browser photo check | §12.12 | 018 | IMPLEMENTED — NOT VERIFIED | `src/lib/reading/image.ts` (decode via an img element so the EXIF rotation applies, canvas re-encode 1080/768 JPEG 0.85 + 96 px RGBA, HEIC → "take a new photo or upload a JPG", 413 → shrink to 900 px once), `quality.ts` (app metrics + verdict on the 96 px copy). In Chrome (headless, mock): a GPS-tagged JPEG upload → both sent copies have **no EXIF** (`qa/shots/2026-09-26-web-reading/` (mock mode, 390 + 1440, `results.txt`)). Not tested: real iPhone HEIC, budget Android memory on 48 MP |
| WEB-FEAT-020 | Home `/`: hero promise, self-tracing sample, upload starter script, What's-free box | §3.3, §7.1 | 003, 019; consented photo (D7) or a labelled diagram | IN PROGRESS | `/` built with honest "opens soon" card (flag off: gold = "Try a sample hand", "Read my own palm" → app panel), self-tracing diagram palm (labelled drawing, D7), sample report, what's-free box, steps, lines, app section. Not done: upload starter (needs 019/026); flipping the flag without it fails the build |
| WEB-FEAT-021 | Tool 3 — Palm photo checker `/tools/palm-photo-checker/` | §9 | 019 | IMPLEMENTED — NOT VERIFIED | Camera/gallery file input → 96px canvas → port of the app's `quality/metrics` + `verdict` (same thresholds, `src/lib/tools/photo-check.ts`) → 5 checks with fixes, all in the browser. Playwright 2026-09-26: 0 network requests after picking a photo. Tests `tests/unit/tools-photo-check.test.ts` (synthetic images). "Use this photo" → reading waits for 026 (flag off → app). Not done: real-phone, HEIC and in-app-browser test |
| WEB-FEAT-022 | Tool 8 — Which-hand quiz, standalone page (slug: KEYWORD_MAP) | §9, WEB-DEC-006 | 006 | IMPLEMENTED — NOT VERIFIED | `/tools/which-hand-quiz/`: writing-hand way (Cheiro 1916 ch. XVII, app `hand-role.ts`) + Indian custom (Dale 1895 "The Hand to Examine": man right, woman left, else the clearest hand); both views always shown. Tests `tests/unit/tools-quizzes.test.ts`; shots `qa/shots/2026-09-26-tools/` |
| WEB-FEAT-023 | Tool 11 — Interactive palm map, standalone page, linked from `/hand-lines/` (slug: KEYWORD_MAP) | §9, WEB-DEC-006 | 006 | IMPLEMENTED — NOT VERIFIED | `/tools/palm-map/`: SVG palm, 4 lines + 8 mount spots (both Mars mounts named by position) as real buttons + a list, aria-live panel, app rule meanings + sources. Tests `tools-content.test.ts` (48px spacing); shots `qa/shots/2026-09-26-tools/`. The `/hand-lines/` tool card is the guide session's |
| — | Tool 1 — Free AI palm reading = the home page `/` + `/reading/` (WEB-FEAT-020, 025–028); plan §9: its standalone page "is the home page"; the `/tools/` hub links to `/` | §9 | — | — | |
| WEB-FEAT-024 | Hindi P1: `/hi/`, `/hi/palm-reading/`, `/hi/hand-lines/`, 4 `/hi/<line>/`, `/hi/app/` — each live only after owner/reviewer reads it | §7.7, §11.3 | 007, 008, 011; Hindi reviewer | IN PROGRESS | `/hi/` and `/hi/app/` built (Tiro + Mukta render, no clipping in shots). **Hindi copy not read by the owner/reviewer yet** — must not go live before that |
| WEB-FEAT-025 | Reading mock mode (stored real result) for previews + "Try a sample hand" | §12.10, §3.4 | 018 | IMPLEMENTED — NOT VERIFIED | Sample section on `/` as before. Mock mode: preview builds only, `/reading/?reading=mock` (or PUBLIC_READING_MODE=mock) runs the app's real pipeline on a STORED REAL scanner result (the app's palm4_v2 scan of its stock guide photo, 2026-09-20, `src/lib/reading/mock/`), labelled "Preview: a stored sample scan, not your palm"; free rule 1 + 1 and refusals like the server; `&mockError=<code>` previews each error. Shots `qa/shots/2026-09-26-web-reading/` (mock mode, 390 + 1440, `results.txt`) |
| WEB-FEAT-026 | `ReadingApp`: states, Turnstile, guest session, API calls via `api.palmsays.com`, error screens | §8.1–8.3 | 019, WEB-SRV-001…004, 006, 007; domain | IMPLEMENTED — NOT VERIFIED (mock only; live backend not deployed) | `/reading/` (noindex, registered in `pages.ts`) + island `src/components/reading/` (light shell; engine + supabase-js load with import() only after a photo is picked). `src/lib/reading/`: `machine.ts` (all states, one idempotency key per photo, auto: new session once / shrink once / re-gate once / retry when back online), `api.ts` + `api-live.ts` (supabase-js via the proxy only, never *.supabase.co; functions with apikey + Bearer; XHR upload progress = the real "Sending → Tracing" switch), `turnstile.ts` (managed, action reading, checked only by web-gate), `errors.ts` (every F6 code → its screen), `copy.ts` (EN + HI). Flag stays **false**; preview-only switch `?reading=mock|live`. Gate 2026-09-26 (`npm.cmd run gate`, preview build): astro check 0 errors, ESLint 0, Vitest 285/285 (reading: `tests/unit/reading-{palm,machine,api,misc}.test.ts`), build OK, check:web 0 errors. Live needs PUBLIC_SUPABASE_PUBLISHABLE_KEY + PUBLIC_TURNSTILE_SITE_KEY + the app-repo deploy (WEB-SRV rows) |
| WEB-FEAT-027 | Report view: SVG traced lines, 2 parts open + 2 first-sentence locks, IndexedDB save, share card | §7.9, §8.1 | 026 | IMPLEMENTED — NOT VERIFIED | `Report.tsx` + `PalmPhoto.tsx` (photo-aspect wrapper, lines in photo pixels, drawn life → head → heart → fate, dashed chip for a line not seen), `report.ts` (the app's report-sections/access). `lockSynthesis` runs BEFORE saving: locked text is never stored or in the DOM (test with hidden sentences, EN + HI). IndexedDB `palmsays-readings` (`store.ts`); a returning visitor reopens. Not done: share card |
| WEB-FEAT-028 | Email-code sign-up, reading 2, zero-readings state, app hand-off | §7.9, §8.1 | 027, WEB-SRV-008 | IMPLEMENTED — NOT VERIFIED (mock only) | Sign-up sheet (native dialog): `updateUser({email})` → 6-digit code → `verifyOtp('email_change')`; taken email → "Sign in with a code" (`signInWithOtp`, shouldCreateUser false); "2nd and last" notice + other hand suggested; zero state (saved readings, remove, app card + price line + QR on desktop, iPhone note); lock sheet with the store button. The next step always comes from `reading_balance()` (F4). Real email codes need WEB-SRV-008 |
| WEB-FEAT-029 | `/account/`: email, readings left, delete data + account, sign out | §12.5 | 026 | PLANNED | |
| WEB-FEAT-030 | Funnel events to `log_event_counts` + Cloudflare Web Analytics; no-cookie check | §12.7, §13.3 | WEB-SRV-010 | IN PROGRESS | Reading events built (`src/lib/reading/events.ts` WEB_COUNT_EVENTS = the app repo's migration 0022 list, a test compares both; sent once on pagehide, live mode only, app_version web, variant dev on previews). Not done: Web Analytics, other pages' events, the no-cookie check |
| WEB-FEAT-031 | Production on palmsays.com: DNS, one host + 301, HSTS, rollback practised, uptime + certificate monitoring | §12.10, §6.2 | domain on Cloudflare | PLANNED | |
| WEB-FEAT-032 | Search Console (Domain property), Bing, BigQuery export, sitemaps submitted | §10.9 | 031 | PLANNED | |
| WEB-FEAT-033 | `/.well-known/assetlinks.json` (no redirect, `application/json`; switched on with S9) | §6.1, §12.11 | WEB-SRV-009; Play SHA-256 | IMPLEMENTED — NOT VERIFIED | Built from `site.assetlinksSha256` by `src/pages/.well-known/[file].ts`; skipped with a build warning while empty (today); shape checked by check:web + unit tests. Blocked on the Play SHA-256 (owner item 6) |
| WEB-FEAT-034 | Real-phone pass: Android Chrome on Jio + Airtel data, iPhone Safari, WhatsApp in-app browser | §14.2 D3 | 028 | PLANNED | |
| WEB-FEAT-069 | `/head-line/double/` sub-page (two / double head line; India 6,810 searches a month; not an App Link) — **P1-late** | `KEYWORD_MAP.md` K1, WEB-DEC-035 | 008, 035 | IMPLEMENTED — NOT VERIFIED | `head-line-double.mdx` (≈ 1,690 visible words; Cheiro PFA "Double Lines of Head", LOH p. 89, Benham forked line; "uncommon", no figure). Not an App Link, no hreflang. Waits for the owner's OK of WEB-DEC-035 moves |

### P2 — "week 1" scope (≈ 45 h + ≈ 20 h extras)

| ID | Feature | Plan § | Depends on | Status | Evidence |
|---|---|---|---|---|---|
| WEB-FEAT-035 | Trust pages: `/about/`, author page (Deepak Chauhan), Hindi reviewer page, `/editorial-policy/`, `/how-it-works/` — live before any P2 guide | §10.6 | Author details, reviewer | IN PROGRESS | Author page **stub** `src/pages/about/deepak-chauhan/index.astro` (noindex, "details pending", only known facts; `Person` JSON-LD) so guide bylines can link. Not done: full bio + photo (owner item 4), `/about/`, `/editorial-policy/`, `/how-it-works/` |
| WEB-FEAT-036 | `/life-line/broken/` (P2 #8 in the India-first order, `KEYWORD_MAP.md` §2.0; not an App Link) | §14.3 | 035 | PLANNED | |
| WEB-FEAT-037 | `/career-palmistry/` | §14.3 | 035 | PLANNED | |
| WEB-FEAT-038 | `/marriage-line/` — honest guide, no prediction, owner OK — **moved to P1** (WEB-DEC-035; India 4,400/mo at KD 11) | §14.3, §4.5 | 035 | IMPLEMENTED — NOT VERIFIED | `marriage-line.mdx` (≈ 2,720 visible words): no age/count/divorce/love-vs-arranged prediction, "divorce line" named only to take it apart (Cheiro vs Benham vs Markun), limits box high, no tool card. **YMYL: owner OK needed** (production build refuses it until `status: owner-ok`) |
| WEB-FEAT-039 | `/palmistry-m/` | §14.3 | 035 | PLANNED | |
| WEB-FEAT-040 | `/money-line/` | §14.3 | 035 | PLANNED | |
| WEB-FEAT-041 | `/hand-types/` (links to tool 9) | §14.3 | 035 | PLANNED | |
| WEB-FEAT-042 | `/simian-line/` — sensitive, medical facts first, owner OK — **moved to P1-late** (WEB-DEC-035; India 18,680/mo) | §14.3 | 035 | IMPLEMENTED — NOT VERIFIED | `simian-line.mdx` (≈ 1,900 visible words): medical facts first (MedlinePlus "about 1 out of 30", "often normal"; Nicklaus Children's), not a diagnosis, see a doctor, medical terms only in that section, no inline CTA near it (`inlineCta: false`), Cheiro PFA ch. II + Benham p. 387. **YMYL: owner OK needed** |
| WEB-FEAT-043 | `/sun-line/` | §14.3 | 035 | PLANNED | |
| WEB-FEAT-044 | `/palm-crosses/` | §14.3 | 035 | PLANNED | |
| WEB-FEAT-045 | `/children-line/` — honest guide, no prediction, owner OK | §14.3, §4.5 | 035 | PLANNED | |
| WEB-FEAT-046 | `/lucky-signs/` (links to tool 10) | §14.3 | 035 | PLANNED | |
| WEB-FEAT-047 | Tool 2 — Palm line finder `/tools/palm-line-finder/` (lines only, no reading used — D19) | §9 | WEB-SRV-004 lines-only mode | IN PROGRESS | Page exists as an honest "opens soon" state (labelled drawn sample, no upload, noindex; the build fails if `webReadingEnabled` flips before the live finder exists). Live finder blocked on WEB-SRV-004 lines-only + D19 |
| WEB-FEAT-048 | Tools 4–7 — Heart/head/life/fate line meaning finders, 4 standalone pages (slug: KEYWORD_MAP) | §9, WEB-DEC-006 | 008 | IMPLEMENTED — NOT VERIFIED | `/tools/{heart,head,life,fate}-line-finder/`: radio pickers with zoomed palm thumbnails; results = app corpus rules (ruleIds, meanings word for word, reading-scope caveats only, sources); parity test vs the synced app rules `tests/unit/tools-parity.test.ts`; life page has the care line, fate page "no fate line is common". Shots `qa/shots/2026-09-26-tools/` |
| WEB-FEAT-049 | Tool 9 — Hand-type finder, standalone (slug: KEYWORD_MAP) | §9, §14.4 | 041 | IMPLEMENTED — NOT VERIFIED | `/tools/hand-type-quiz/`: earth/air/fire/water labelled as the popular modern system (no corpus source), Cheiro's seven types cited; optional cm measuring with a stated rule of thumb and "between two types". Tests `tools-quizzes.test.ts` |
| WEB-FEAT-050 | Tool 10 — Rare-signs checker, standalone (slug: KEYWORD_MAP) | §9 | 046 | IMPLEMENTED — NOT VERIFIED | `/tools/palm-signs-checker/`: M, mystic cross, star, triangle, fish, trident, island; meanings from corpus passages read 2026-09-26 (Cheiro 1916 ch. XIII/XV/XVI, Language of the Hand ch. XXII, Dale 1895, Jain 1927); promises/threats left out and said so; M = no classical source. Tests `tools-content.test.ts` |
| WEB-FEAT-051 | Tool 12 — Spot-the-line quiz `/tools/palm-reading-quiz/` | §9 | 006 | IMPLEMENTED — NOT VERIFIED | 10 questions (spot the line/mount + the app's lesson questions), right/wrong in words, score + share text (nothing sent). Tests `tools-quizzes.test.ts` |
| WEB-FEAT-052 | Blog `/blog/` + posts 1–4 and 6 (post 5 dropped, post 6 moved up from 059: WEB-DEC-035) | §11.5 | 035 | PLANNED | |
| WEB-FEAT-053 | PDF lead magnet `/palmistry-pdf/` + double opt-in; PDF file `noindex` | §11.4 | WEB-SRV-008, 013 | PLANNED | |
| WEB-FEAT-054 | India keyword pass + internal-link audit | §14.3 | `research/keywords-in.tsv` | IN PROGRESS | Keyword pass done in the docs: `KEYWORD_MAP.md` v2 §2.0–2.5 (all 180 India rows mapped, US kept separate), WEB-DEC-034/035. The internal-link audit waits for built pages |
| WEB-FEAT-055 | Hindi tools hub + Hindi tool pages | §14.3 | 024 | PLANNED | |
| WEB-FEAT-056 | Original diagram set (master chart + about 40 SVG files) | §14.4, §10.7 | 003 | PLANNED | |
| WEB-FEAT-057 | Hindi twins of 6 P2 guides (which-hand, marriage, M, money, lucky signs, children) | §14.4 | Hindi reviewer | PLANNED | |

### P3 — later (ordered by expected value, §14.5)

| ID | Feature | Depends on | Status | Evidence |
|---|---|---|---|---|
| WEB-FEAT-058 | P3 guides: `/indian-palmistry/` + `/hi/hast-rekha/`, `/chinese-palmistry/`, `/palm-mounts/`, `/history-of-palmistry/`, `/palmistry-fingers/`, `/mercury-line/` | P2 live | PLANNED | |
| WEB-FEAT-059 | Blog post 7 (post 6 moved to 052), then ongoing | 052 | PLANNED | |
| WEB-FEAT-060 | Hindi pages as they are reviewed (blog, P3 twins) | reviewer | PLANNED | |
| WEB-FEAT-061 | First videos on the pillars | — | PLANNED | |
| WEB-FEAT-062 | Google sign-in on the web (D25, after Jio/Airtel tests) | — | PLANNED | |
| WEB-FEAT-063 | MediaPipe open-palm check (only if photo-check data shows a need) | 030 data | PLANNED | |
| WEB-FEAT-064 | Question chips at upload (A/B tested) | 030 | PLANNED | |
| WEB-FEAT-065 | Festival banners (real seasons, never deadlines) | — | PLANNED | |
| WEB-FEAT-066 | Carry web readings into the app account (D23; app change) | launch data | PLANNED | |
| WEB-FEAT-067 | Pagefind site search at about 40 posts | 059 | PLANNED | |
| WEB-FEAT-068 | iPhone store button (only when an iOS app exists) | iOS app | PLANNED | |

## 4. Server and app work — owned by the app repo (WEB-SRV)

Done **in the app repo**, in its own session, following its `PROJECT_MASTER.md`. Specs: plan §8.7. Never edit the app repo from this folder.

| ID | Plan | Change | Needed for | Status | Evidence |
|---|---|---|---|---|---|
| WEB-SRV-001 | S1 | Migrations 0015 → 0016 → 0017 (+ 0019, 0020, 0021) applied; guest → email-code path tested on a real phone | Live reading, all "1 + 1" copy | NEEDS VERIFICATION | Owner says applied (2026-09-26). Not checked: the project is not in Claude's connected Supabase account. Proof SQL: `OWNER_GUIDE.md` step 9. Phone test not recorded. |
| WEB-SRV-002 | S2 | Proxy Worker live as `api.palmsays.com`; `app_limits.trusted_proxy_worker`; Auth per-IP fix (D14) | Live reading | PLANNED | |
| WEB-SRV-003 | S3 | `web-gate` function: Turnstile siteverify, hostname ∈ {palmsays.com, www.palmsays.com}, action `reading`, 10-min `private.web_pass` | Live reading | IMPLEMENTED — NEEDS DEPLOY (app repo) | App repo `supabase/functions/web-gate/{index,logic}.ts` (web origin only, token ≤ 300 s, extra hosts via WEB_TURNSTILE_HOSTNAMES), tests `tests/web-gate.test.ts`; app npm test 1291/1291. Owner: app OWNER_GUIDE Step 9 (TURNSTILE_SECRET + deploy) |
| WEB-SRV-004 | S4 | `start_web_reading` RPC + web caps (`web_guest_free`, `web_llm`) + kill switch + `source='web'`; optional `lines_only` + `web_scan` cap for tool 2 | Live reading, tool 2 | IMPLEMENTED — NEEDS DEPLOY (app repo) | App repo migration `0022_web_reading.sql` + `apply_launch_0022.sql` (13-row proof): web caps **start at 0** (closed), `web_paused`, `web_scan` cap for web scans, web readings charged **free only** (never a pack or plan), the app branch of claim_extraction kept line for line (test). `lines_only` mode NOT built (tool 2, later). Not applied |
| WEB-SRV-005 | S5 | Budget: raise `llm_daily_cap`, set the web caps (D13) | Live reading | OPEN — owner decision | |
| WEB-SRV-006 | S6 | CORS allow-list `https://palmsays.com`, `https://www.palmsays.com` in extract-palm, scan-palm, write-report, delete-account, web-gate | Live reading | IMPLEMENTED — NEEDS DEPLOY (app repo) | App repo `supabase/functions/_shared/cors.ts` `withCors` (palmsays.com, www, localhost dev, WEB_ALLOWED_ORIGINS; no Origin = the app, unchanged) wrapped around the 4 functions + web-gate; tested. Owner redeploys the 4 functions |
| WEB-SRV-007 | S7 | Auth Site URL `https://palmsays.com/`, redirects `https://palmsays.com/**`; **never** the project-wide captcha | Live reading | PLANNED — owner step written | App OWNER_GUIDE Step 9.4: Site URL, redirects (+ www), the "Change email address" template with `{{ .Token }}`, raise "Anonymous sign-ins per hour" (every web visitor looks like the proxy's IP), CAPTCHA stays OFF |
| WEB-SRV-008 | S8 | Custom SMTP (e.g. Brevo), Confirm email on, OTP template showing the code | Sign-up | NEEDS VERIFICATION | App repo lists it as an owner step; state unknown |
| WEB-SRV-009 | S9 | App Links: `APP_LINK_HOST = palmsays.com`, **exact-path** intent filters, real SHA-256 | App Links | PLANNED | `APP_LINK_HOST` is `null` in app `src/features/links/routes.ts:19` (2026-09-26) |
| WEB-SRV-010 | S10 | Let the web log funnel counts: **add the web event names to the 0021 allow-list** (it holds app events only), `app_version='web'` | Measurement | IMPLEMENTED — NEEDS DEPLOY (app repo) | Migration 0022 redefines `log_event_counts` with the app list + 23 web events (body otherwise identical to 0021, tested); same list as `src/lib/reading/events.ts` |
| WEB-SRV-011 | S11 | After launch: retire app `web/` + `deploy-web.mjs`; `EXPO_PUBLIC_WEB_BASE_URL=https://palmsays.com`; app + Play Console legal links → new URLs | Cleanup | PLANNED | |
| WEB-SRV-012 | S12 | Play Integrity in the app; guest free reading needs "Turnstile pass OR Integrity verdict" | Abuse | PLANNED (later) | |
| WEB-SRV-013 | S13 | PDF opt-in list function (double opt-in, unsubscribe, postal address) | PDF | PLANNED (P2) | |
| WEB-SRV-014 | — | App renamed to PalmSays (name, wordmark, store titles) — the app repo's own plan + owner approval | Brand match | PLANNED | App `PROJECT_MASTER.md` §16 |

## 5. Bugs and tech debt

| ID | Bug | Severity | Area | Evidence | Status |
|---|---|---|---|---|---|
| — | none yet | | | | |

## 6. Checks status

| Check | Status |
|---|---|
| Build, typecheck, lint, unit, `check:web` | PASS 2026-09-26 after the web reading: astro check 0, ESLint 0, Vitest 285/285, build OK, check:web 0 errors / 11 warnings (secret-marker rule narrowed to a real `sb_secret_` key: supabase-js itself names the prefix). Before: PASS 2026-09-26 (preview build): `astro check` 0 errors, ESLint 0, Vitest 47/47, build OK, check:web 0 errors / 17 warnings (12 App Link pages not built yet, 4 legal placeholders, assetlinks skipped). Production build fails on purpose until company details + `PUBLIC_SUPABASE_*` exist. **Tools session 2026-09-26 13:47:** Vitest 223/223; tool files 0 lint / 0 type errors; build OK; check:web **FAILS 2 errors** from the reading-flow work in progress (secret-marker string in `_astro/api-live*.js` + `ReadingApp*.js`); `astro check` 8 errors + ESLint 52 errors, all in `src/lib/reading/**` / `src/components/reading/**` (reading session). All 12 `/tools/` pages pass their own checks (JS 1–9.7 KB, HTML ≤ 17.7 KB gzip) |
| e2e (Playwright + axe), Lighthouse CI | Not set up (WEB-FEAT-016) |
| Release log | Empty (`QA_RELEASE.md` §9) |

## 7. Decisions

All decisions: `DECISIONS.md` §1 (WEB-DEC-001…035). Still open and blocking work (`DECISIONS.md` §2): D13/S5 budget, D14 proxy IP, D7 consented hand photos, the Hindi reviewer, company name + contact + grievance contact for the footer and privacy page, tool slugs 4–11, and the other plan §16 recommendations the owner has not answered.

## 8. Owner items that block work

Steps in Hinglish: `OWNER_GUIDE.md`.

1. palmsays.com DNS on Cloudflare + Cloudflare account access — blocks 031, 032, SRV-002/006/007, Turnstile.
2. Turnstile site (hostnames palmsays.com, www.palmsays.com) — blocks 026.
3. Search Console DNS TXT — blocks 032.
4. Author details + photo; a Hindi reviewer — block 024 going live, 035, all P2 guides.
5. ~~India keyword export~~ — done 2026-09-26 (`research/keywords-in.tsv`). Now needed: owner OK for the India-first moves (WEB-DEC-035: marriage and simian into P1, new `/head-line/double/`, blog 5 dropped). Optional: a Devanagari export (`OWNER_GUIDE.md` §7).
6. Play App Signing SHA-256 — blocks 033, SRV-009.
7. Run the SQL proof query — closes SRV-001.
8. Budget for the web cap (S5) — blocks the live reading.
9. Company name, contact email, grievance contact — blocks 013 and the footer.
10. 3–5 consented hand photos (D7) — the hero uses a labelled diagram until then.

## 9. Active work

| | |
|---|---|
| Feature | Step 1 foundation: WEB-FEAT-001–005, 011, 013–017, 020, 024, 025, 033 (see §3 rows) |
| Last completed step | 2026-09-26: `PROJECT_MASTER.md`, `DECISIONS.md`, `ARCHITECTURE.md`, `SECURITY_PRIVACY.md`, `QA_RELEASE.md`, `OWNER_GUIDE.md`, skills `web-reading-flow` + `release-gate`, `CLAUDE.md` rewritten |
| Current step | Step 1 done locally; waiting for owner review of screenshots + Hindi copy, then step 2 (guides + tools content) |

## 10. Next exact action

1. **Website session (this folder):** step 1 is built locally. Next: owner looks at `qa/shots/2026-09-26-feat-web-foundation/` + reads the Hindi copy (`src/i18n/hi.ts`) → owner decides the first commit → step 2 = guides + tools content (WEB-FEAT-006–010, 012, 021–023) with the 12 App Link pages (check:web warns until they exist; production fails without them). (Earlier plan text: plan WEB-FEAT-001 (scaffold) in chat → owner OK → build it on a `*.workers.dev` preview with `noindex` and the reading in mock mode.) Then P1 Day 1 → Day 2 in the §14.2 order (WEB-FEAT-002 … 025). Read first: `ARCHITECTURE.md`, `QA_RELEASE.md`, `DESIGN_SYSTEM.md`.
2. **App-repo session (separate, parallel):** close WEB-SRV-001 (run the proof SQL + phone test of guest → email), then S2, S3, S4, S6, S7, S8, and add the web events to the 0021 allow-list (SRV-010).
3. **Owner:** §8 items 1, 2, 7, 8, 9 first (they block the live reading and launch).

## 11. Session handoff

| | |
|---|---|
| Last work completed | **2026-09-26, web reading session:** WEB-FEAT-018/019/025–028 built (mock-verified only, flag still false) + the app-repo server pieces WEB-SRV-003/004/006/010 (migration 0022, web-gate, CORS; NOT deployed — app OWNER_GUIDE Step 9). Shared files touched with small anchored edits: `package.json` (+@supabase/supabase-js 2.117.2, zod 4.6.5, `sync:palm`), `src/config/pages.ts` (+/reading/), `src/env.d.ts`, `.env.example`, `astro.config.mjs` (preview-only API origin in connect-src), `eslint.config.js` (ignore the palm copy), `scripts/check-web.mjs` (secret marker = a real key only). Blocked: domain + proxy route, Turnstile keys, owner deploy + budget (S5), SMTP (S8), [verify] privacy items, Hindi review. The home upload card still says "opens soon" (WEB-FEAT-020 wires it to /reading/ when the flag flips). **Before:** **2026-09-26, tools session:** `/tools/` hub + 11 tool pages (WEB-FEAT-012, 021–023, 047–051 rows). 10 tools work with no server, in plain TS (≤ 9.7 KB JS gzip per page, started when visible): photo checker (on-device, 0 network requests), 4 line finders (app rule subset with ruleIds + parity test), which-hand quiz, hand type quiz, signs checker, palm map, palm reading quiz; tool 2 "opens soon" (noindex); tool 1 = home. Code `src/lib/tools/**`, `src/components/tools/**`, `src/pages/tools/**`; 79 tests `tests/unit/tools-*.test.ts`; analytics hooks are no-ops (`src/lib/tools/analytics.ts`). Shared edits: `pages.ts` (12 entries), nav + footer "Tools", `en/hi` `nav.tools` + `footer.groups.tools`, `check-web.mjs` (chunk-aware JS weight, tool HTML budget). Screenshot fixes: legends sat on the divider line, result headings hid under the sticky header, picker thumbnails too small (zoomed per line). Open: owner + phone review, `/hi/tools/`, guides' tool cards, read rules from `lib/palm` once WEB-FEAT-018 settles, check:web red from reading JS (secret-marker string). **Same day, guides session:** guide template + 11 English guides (WEB-FEAT-006–010, 038, 042, 069 rows; author stub in 035). Registered in `pages.ts` (core: hubs, pillars, is-real, which-hand; guides: marriage, double head, simian; no hreflang until reviewed Hindi twins), nav "Guides" → `/palm-reading/`, footer Guides group, `llms.txt` labels (`PageEntry.label`), sitemap test no longer hard-codes groups. Meanings checked against the app rules and the corpus text (a research pass verified every quoted passage + web sources; unverifiable sentences were removed). Screenshot fixes: variation cards too narrow on phones (drawing + title row, text full width), prose list/heading styles leaking into cards (scoped to direct MDX children), missing list numbers (Tailwind preflight), limits-box icon eating width, tool-card title repeating the H2, marriage close-up looked like a cut-out (now fills its frame). Open: owner OK for the 3 YMYL guides (life, marriage, simian) and the WEB-DEC-035 moves; owner/Hindi review; per-page OG images + diagram SVG files for Google Images (WEB-FEAT-015/056); Rich Results Test; check:web's 2 current errors are in the reading session's bundles (`_astro/api-live*.js`, `ReadingApp*.js`: secret marker), not in guides. **2026-09-26, tools session:** 12 tool entries + `/tools/` hub; 10 working tools (photo checker, 4 line finders, which-hand quiz, hand type quiz, signs checker, palm map, palm reading quiz) in plain TS (no framework, ≤ 9.7 KB JS gzip per page, loaded when visible), tool 2 "opens soon" (noindex), tool 1 = home. Code: `src/lib/tools/**`, `src/components/tools/**`, `src/pages/tools/**`, tests `tests/unit/tools-*.test.ts` (79). Analytics hooks are no-ops (`src/lib/tools/analytics.ts`, planned event names). Screenshot fixes: legends sat on the divider line, result heading hid under the sticky header, picker thumbnails too small (now zoomed per line). Open: owner/phone review, `/hi/tools/`, guides must add tool cards, rules to be read from `lib/palm` once WEB-FEAT-018 settles. **2026-09-26, step 1 (foundation) build:** Astro 7.3.5 site at the project root (branch `feat/web-foundation`, not committed): `site.ts` config, page registry, EN/HI dictionaries, tokens + fonts (Fontsource, EN pages load no Devanagari — `fonts.json` in the shots folder), BaseLayout SEO head, Header/Footer/menu sheet/Day toggle, PalmTrace (CSS-only beam + draw, reduced motion), StoreButton + price line + QR + iPhone note, LockedCard, Chip; pages `/`, `/hi/`, `/app/`, `/hi/app/`, `404`, the 4 frozen legal `.html` pages; robots, llms.txt, group sitemaps, assetlinks generator, `_headers` + hashed CSP; `check:web`, 47 unit tests, `shots`. Gate PASS (§6). Screenshot fixes made: translucent header/menu sheet let text show through on mobile (made solid), unbulleted lists, steps misaligned + Cormorant "1" read as "I" (now Mukta), Play badge too small/misaligned. Decisions taken inside the plan: legal pages served at the frozen `.html` URLs directly (F3 fallback) until WEB-FEAT-013; own sitemap endpoints instead of `@astrojs/sitemap` (group files + hreflang identical to the head); TypeScript pinned to 6.0.3 (7.0.2 is latest but `@astrojs/check`/typescript-eslint need ≤ 6.0); `eslint-plugin-jsx-a11y-x` (ESLint 10 support). **Earlier same day:** 2026-09-26: project operating system written from plan v2 + owner decisions (§15b). Found while writing: (1) S3/S4 (`web-gate`, `start_web_reading`, web caps) do not exist in the app repo yet; (2) migration 0021's event allow-list has app events only, so web funnel events would be dropped until S10 adds them; (3) 0016's own header says "NOT APPLIED" and the owner says it is applied — unverified. **Keyword session (same day):** the India export was mapped into `KEYWORD_MAP.md` v2 (US and India kept separate, India-first priorities, decisions K1–K11 = WEB-DEC-034/035, new WEB-FEAT-069 `/head-line/double/`); `SEO_PLAYBOOK.md` §3, §3.1, §4, §15–17, `ARCHITECTURE.md` §3, `DECISIONS.md` and `OWNER_GUIDE.md` §7 updated to match. No code touched. |
| Current state | Step 1 code on branch `feat/web-foundation`, local only (not committed, not deployed). `webReadingEnabled=false`: the home page says the web reading opens soon and never fakes a reading. Hindi copy unreviewed. Production build blocked on company details + `PUBLIC_SUPABASE_*` (by design). No domain on Cloudflare yet (not confirmed). |
| Do not touch | The app repo (read only). `WEBSITE_MASTER_PLAN.md` and `research/` (background; change only with owner OK). Frozen contracts in `ARCHITECTURE.md` §11. |
| Open questions | Company/legal details for the footer and privacy page; Hindi reviewer name; whether the free allowance is shared between web and app for the same email (plan §4.7 [verify]); Modal and Workers AI retention (`SECURITY_PRIVACY.md` §4). |
