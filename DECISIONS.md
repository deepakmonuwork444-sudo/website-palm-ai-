# PalmSays website — Decision log

> **What this is:** every decision made for the website so far (WEB-DEC-###), with the reason, the options we rejected, and where it came from; then the questions that are still open.
> **When to read it:** before changing anything that looks decided, and whenever a new decision is made. It is the **source of truth for decisions**; `WEBSITE_MASTER_PLAN.md` §12, §15b, §16 and Appendix A are the background.

**How to use**
- Add new decisions at the end with the next number. Never renumber, never delete: to change one, add a new row that says "Replaces WEB-DEC-0xx" and mark the old one REPLACED.
- **Status:** `OWNER` = the owner said it · `PLAN` = settled in plan v2 by research (and in `CLAUDE.md`'s fixed decisions or the plan's non-goals); the owner has not objected, so treat it as decided and change it only with owner OK · `REPLACED`.
- Plan decision numbers (D1–D26) and server items (S1–S13) refer to `WEBSITE_MASTER_PLAN.md` §16 and §8.7. The app repo's own decisions are `DEC-###` in its `PROJECT_MASTER.md`.

---

## 1. Decisions

### Brand, scope and product rules

| ID | Date | Decision | Why | Rejected options | Source | Status |
|---|---|---|---|---|---|---|
| WEB-DEC-001 | 2026-09-26 | Brand **PalmSays**. Brand strings live only in `src/config/site.ts`. | Owner choice | "Palm Read AI" as the web brand (the plan's working name) | Plan §15b | OWNER |
| WEB-DEC-002 | 2026-09-26 | Domain **palmsays.com** is the single base URL; the app's App Links host, `EXPO_PUBLIC_WEB_BASE_URL` and `assetlinks.json` point here. API host `api.palmsays.com`. Canonical host = apex; `www` 301s to it [rec, part of plan §6.2 "one host"]. | Owner choice; one host avoids duplicate URLs | Serving both apex and `www` | Plan §15b, §6.2 | OWNER (apex-vs-www detail: PLAN) |
| WEB-DEC-003 | 2026-09-26 | The website is a separate project in `D:\palm ai\palm-ai-website`, built in new sessions opened in this folder. The app repo is never edited from here; the server work it needs is written as specs (S1–S13) and done in app-repo sessions. | One owner per codebase; the app has its own control doc and deploys | Mixing web code into the app repo; editing the app repo from web sessions | Plan header, §8.7, §15b | OWNER |
| WEB-DEC-004 | 2026-09-26 | Free rule: reading 1 free as a guest; reading 2 after a free email sign-up, and it is a **new** reading (it does not unlock reading 1); then 0 free readings → "Continue in the app". The **server** owns the rule; pages read `reading_balance()` and never hard-code live numbers. | Owner's offer; honest and matches the app | The live-DB rule from 0013 (2 guest + 2 after email); sign-up that unlocks reading 1 (bait and switch, CCPA dark pattern 7) | Plan §0, §4.7, Appendix A #2 #9; `CLAUDE.md` | OWNER |
| WEB-DEC-005 | 2026-09-26 (v1) | The web free report is the same as the app's: Love and Personality in full; Career & Money and Life Direction show only their first sentence (`lockSynthesis`, app DEC-038). Locked text is dropped before rendering. | Same product on both surfaces; a real curiosity gap without fake blur | Blurred fake text; a bigger or smaller web report | Plan §4.7, §15b | OWNER |
| WEB-DEC-006 | 2026-09-26 | **All 12 tools get their own standalone page**, each with real content under the tool (how it works, what palmistry says with sources, honest limits, FAQ, links to the guide and the reading). The matching guide **links** to the tool instead of embedding a second copy: one canonical home per tool. | Owner choice; the content rule guards against thin pages | Plan recommendation D5: 3 standalone pages (photo checker, line finder, quiz) with the rest inside guides (R11 §2.4, Appendix A #8) | Plan §15b | OWNER |
| WEB-DEC-007 | 2026-09-26 (v1) | Honest guides for marriage, children and lifespan: they explain the tradition and its limits and never predict. No prediction tools (marriage age, number of children, lifespan, compatibility score). Lifespan is handled inside `/life-line/` and `/life-line/broken/` (the route table has no separate lifespan URL). | Honesty; consumer law; Play's misleading-claims rule | Marriage-age calculator (R03 idea); dates, ages, counts, health, divorce or money predictions | Plan §1.3, §9, §15b; `CLAUDE.md` | OWNER |
| WEB-DEC-008 | 2026-09-26 | Author **Deepak Chauhan** (founder; full details and photo to come from the owner). A Hindi reviewer is still needed. No invented personas; fallback byline "Written by the PalmSays team, reviewed by {real name}". | E-E-A-T needs a real person | Invented expert personas | Plan §15b, §10.6 | OWNER |
| WEB-DEC-009 | 2026-09-26 | Build the reading flow only after the free rule (1 + 1) and the web cap are **verified on the live project**. The owner says 0016, 0017, 0019, 0020 and 0021 are applied; Claude could not check (the project is not in the Supabase account connected to Claude). | Copy that isn't true is a legal and trust risk | Building on the owner's statement alone | Plan §15b, §15 risk 3 | OWNER |
| WEB-DEC-010 | 2026-09-26 | No payments on the website (no card, UPI or wallet); billing stays in Google Play. The app's price sits next to every store button, and "free" is always qualified. | Trust; CCPA drip-pricing rule | Web checkout | Plan §1.3, §4.6 | PLAN |
| WEB-DEC-011 | 2026-09-26 | Non-goals: no ads or ad pixels; no other astrology products (chat, horoscope, kundli, tarot, face reading); no App Store badge or iPhone promises until an iOS app exists (an honest iPhone note instead); no public or indexable reading pages (share cards are made on the device); no mass templated pages (per city, gender, sign). | Focus, honesty, scaled-content policy | Each item above was seen at a competitor | Plan §1.3, §11.7 | PLAN |
| WEB-DEC-012 | 2026-09-26 | Age rule on the web: **18+**, the same as the app (app DEC-032, "age 18 everywhere"). | DPDP treats under-18s as children needing parental consent | 13+ (palmmitra) | Plan D20; app `PROJECT_MASTER.md` §5 | PLAN |

### Design

| ID | Date | Decision | Why | Rejected options | Source | Status |
|---|---|---|---|---|---|---|
| WEB-DEC-013 | 2026-09-26 | Design Direction A **"Nakshatra Night Web"**: indigo #0B0A1F, temple gold #E6B85C, ivory #F6F0E1; Cormorant Garamond (English display), Tiro Devanagari Hindi (Hindi display), Mukta (body, both scripts); one gold button per screen; one trace animation. Details: `DESIGN_SYSTEM.md`. | The app's own brand; best fit for trust and speed | Directions B and C as a whole (B's Day theme and C's single scan beam were borrowed) | Plan §15b, D2, R08 | OWNER |
| WEB-DEC-014 | 2026-09-26 | **Dark by default with a Day toggle**, remembered in `localStorage`; print is always Day. | Owner choice | Following the phone's system theme; Day by default on guides and blog | Plan §15b, D4 | OWNER |

### Stack and architecture

| ID | Date | Decision | Why | Rejected options | Source | Status |
|---|---|---|---|---|---|---|
| WEB-DEC-015 | 2026-09-26 | **Astro 7.3.x**, `output: 'static'`, exact pinned versions, `trailingSlash: 'always'`, `build.format: 'directory'`; React 19 islands only where needed; MDX content collections with Zod 4; Tailwind 4 `@theme` tokens. | Static HTML and 0 KB JS on guides; scored 92/100 | Next.js 16 + OpenNext (74/100: runtime on every page, fragile SSR on the free plan); SvelteKit 2 (78/100: a new language for future sessions) | Plan §12.1, R09 §1 | PLAN |
| WEB-DEC-016 | 2026-09-26 | Hosting on **Cloudflare Workers with static assets** (`wrangler.jsonc`, no Worker script). | Astro's Cloudflare adapter v14 dropped Pages; new features land on Workers first; static requests are free | Cloudflare Pages (v1 plan) | Plan §12.1, Appendix A #1 | PLAN |
| WEB-DEC-017 | 2026-09-26 | The browser reaches Supabase **only through `api.palmsays.com`** (the app's `palm-api` proxy Worker). | Indian ISPs DNS-block `*.supabase.co` (app BUG-030) | supabase-js calling `*.supabase.co` directly | Plan §12.1, Appendix A #5 | PLAN |
| WEB-DEC-018 | 2026-09-26 | Sign-up is **email + 6-digit code** (`updateUser({email})` + `verifyOtp('email_change')`, same user ID). Google sign-in waits until after week 2 and Jio/Airtel tests (D25). | Same as the app; the OAuth callback runs on the blocked Supabase host | Email + password; "Continue with Google" at launch | Plan §12.1, Appendix A #7 | PLAN |
| WEB-DEC-019 | 2026-09-26 | **Turnstile** is checked only in the web-only `web-gate` function, which writes a 10-minute web pass. **Never** Supabase's project-wide captcha. | The app's anonymous sign-in sends no captcha token; the global setting would break the app | Supabase Auth captcha | Plan §12.1, S3, S7 | PLAN |
| WEB-DEC-020 | 2026-09-26 | **Separate web daily caps** (`web_guest_free_daily_cap`, `web_llm_daily_cap`, optional `web_scan`) with their own kill switch; the app's caps stay untouched. | Web traffic could use up the app's shared ~34 AI readings a day | Sharing the app's caps | Plan §8.6, S4, Appendix A #4 | PLAN |
| WEB-DEC-021 | 2026-09-26 | **Cookie-free analytics only**: Cloudflare Web Analytics + daily counts to `log_event_counts` (no user ID). No cookie banner. | Privacy; no consent banner needed | Google Analytics, ad pixels, tag managers | Plan D11, §12.7 | PLAN |
| WEB-DEC-022 | 2026-09-26 | Privacy copy must match the real backend: the photo goes to Modal (USA) and Cloudflare Workers AI; traced line points and landmarks are stored. Wording lives in `SECURITY_PRIVACY.md`. | DPDP, Play policy, trust | "Sent once", "never stored", "we keep nothing", "used once… then deleted" (v1 and R10 drafts) | Plan §8.5, Appendix A #3 #21 | PLAN |
| WEB-DEC-023 | 2026-09-26 | **No palm tracing in the browser.** No AGPL code, no LGPL code bundled into our files, no model weights trained on scraped photos. Our backend's tracing is the product. | No open-source tracer is production quality; licence risk | Browser-side line detection | Plan §1.3, R09 §2 | PLAN |
| WEB-DEC-024 | 2026-09-26 | Reuse the app's pure TypeScript by **copying** it into `src/lib/palm/` with a sync script that records the app commit and sha256 and fails on `react-native`/`expo` imports; parity tests; show `ruleSetVersion`. | The web and app must give the same reading without coupling the repos | Importing from the app repo; a shared package | Plan §12.6 | PLAN |
| WEB-DEC-025 | 2026-09-26 | Previews run the reading in **mock mode** (a stored real result). A real-backend preview only behind Cloudflare Access. Every preview page is `noindex`. | The app has one Supabase project for dev and prod | Previews on the live backend | Plan §12.10 | PLAN |
| WEB-DEC-026 | 2026-09-26 | OG images with `astro-og-canvas` at build time, passing a Hindi conjunct test; fallback a Playwright screenshot script. | Satori has Devanagari shaping bugs | Satori | Plan §12.1, §12.8 | PLAN |

### URLs and SEO contracts

| ID | Date | Decision | Why | Rejected options | Source | Status |
|---|---|---|---|---|---|---|
| WEB-DEC-027 | 2026-09-26 | **App Links use exact paths only**: `/palm-reading`, `/hand-lines`, `/heart-line`, `/head-line`, `/life-line`, `/fate-line`, the same six under `/hi/`, each with and without the trailing slash. Everything else opens in the browser. | `pathPrefix` would catch `/palm-reading-pdf/` and `/life-line/broken/`, which the app's router refuses → users land on app Home | `pathPrefix` intent filters | Plan §6.1, S9, Appendix A #13 | PLAN |
| WEB-DEC-028 | 2026-09-26 | `/palm-reading-pdf/` is renamed `/palmistry-pdf/` (D16). | No App Link rule can ever catch it; nothing is live, so it is free | Keeping `/palm-reading-pdf/` | Plan §6.2, D16 | PLAN |
| WEB-DEC-029 | 2026-09-26 | Legal pages get new canonical URLs `/privacy/`, `/terms/`, `/delete-account/`, `/reset-password/`; the `.html` URLs the app and Play Console use **301** to them (test all 8 variants). Fallback if Play Console rejects the redirect: serve the `.html` pages directly with a self-canonical. | Shared layout; old links keep working | Keeping `.html` as canonical (R11's first advice, kept as the fallback); Workers' default 307 | Plan §12.11, D18 | PLAN |
| WEB-DEC-030 | 2026-09-26 | `/reading/` and `/account/` carry `noindex`, are **not** disallowed in `robots.txt`, and are never in the sitemap. | Google must crawl a page to see its `noindex` | Disallowing them (R11) | Plan §10.5, Appendix A #17 | PLAN |
| WEB-DEC-031 | 2026-09-26 | Hindi lives under `/hi/` with the **English ASCII slugs**; hreflang only between true translations (`en`, `hi`, `x-default` → English); a Hindi page goes live only after the owner or the reviewer has read it. | App Links open only `/hi/<english-slug>`; Devanagari URLs turn into `%E0%A4…` on WhatsApp; scaled-content risk | Devanagari slugs; `hi-IN`/`en-US` codes; bulk machine translation | Plan §6.2, §10.4, Appendix A #14 | PLAN |
| WEB-DEC-032 | 2026-09-26 | A published URL never changes without a 301 and a sitemap update in the same release. Slugs are permanent. | App Links, backlinks and rankings depend on them | — | Plan §6.2 | PLAN |

### Process

| ID | Date | Decision | Why | Rejected options | Source | Status |
|---|---|---|---|---|---|---|
| WEB-DEC-033 | 2026-09-26 | `PROJECT_MASTER.md` Part A is the control document; each topic doc (`ARCHITECTURE.md`, `SECURITY_PRIVACY.md`, `QA_RELEASE.md`, design, UX, SEO, content, keywords) is the source of truth for its topic; the plan is background. No deploy, merge or "done" claim without the `release-gate` skill. | Owner goal: "our project never breaks"; the app repo's docs had drifted | One huge plan file as the working document | Owner instruction 2026-09-26; app DEC-007 | OWNER |

### Keywords

| ID | Date | Decision | Why | Rejected options | Source | Status |
|---|---|---|---|---|---|---|
| WEB-DEC-034 | 2026-09-26 | Keyword exports live at `research/keywords-in.tsv` (India, 180 rows) and `research/keywords-us.tsv` (US, 298 rows), kept raw and never edited. **US and India data stay separate** in `KEYWORD_MAP.md` (§2.1–2.3 US, §2.4 India) and are never added together; §2.0 merges them only as one row per URL with a column for each market. | Owner asked to keep USA and India separate, then plan targeting for both | One merged volume column; `.csv` names (the files arrived as `.tsv`) | Owner 2026-09-26; replaces open item D9 | OWNER |
| WEB-DEC-035 | 2026-09-26 | **India-first keyword plan** (`KEYWORD_MAP.md` v2, decisions K1–K11): new sub-page `/head-line/double/` (P1-late); `/marriage-line/` moves to P1 and `/simian-line/` to P1-late; `/life-line/broken/` moves down to P2 #8; female and male palm reading fold into `/which-hand-to-read/` and blog 5 is dropped before writing; `/is-palmistry-real/` targets "is palmistry true" (slug unchanged); "… in hindi" queries go to the `/hi/` pages; blog 6 retargets to "rare palm lines" and moves to P2; off-topic "dominant hand" terms are skipped; simian medical wording only in a sourced medical section. | India volumes: two head line palmistry 6,600; marriage line palmistry 4,400 at KD 11; simian line 6,600; palmistry female 4,400 + palm reading for male 3,600; is palmistry true 1,300 vs is palmistry real 210 | Gender pages; an English `/palm-reading-in-hindi/` page; a separate mystic-cross or career-line page; renaming the slug to `/is-palmistry-true/` | `research/keywords-in.tsv`; `KEYWORD_MAP.md` §2.5 | PLAN (owner to confirm the P1 moves and dropping blog 5) |

### Tools

| ID | Date | Decision | Why | Rejected options | Source | Status |
|---|---|---|---|---|---|---|
| WEB-DEC-036 | 2026-09-26 | **Tool build choices (tools session):** (1) rule tools and the photo checker are plain TypeScript, started when visible, not React islands; (2) tool logic + data are typed modules in `src/lib/tools/`, not a `src/content/tools/*.yaml` collection; line-finder results are the app's corpus rules (ruleIds, meanings word for word) checked by a parity test; (3) tool 2 `/tools/palm-line-finder/` is an honest "opens soon" page and **noindex** until `webReadingEnabled`; (4) the `/tools/` title drops "Scanner" while the web scanner is closed; (5) the hand type quiz labels earth/air/fire/water as the modern system and cites Cheiro's seven types. | Budgets (DESIGN_SYSTEM.md §11: rule tools ≤ 10–20 KB; React + ReactDOM ≈ 57 KB); testable rules that can't drift from the app; no thin or unkept-promise page indexed; honesty rules (CONTENT_GUIDE.md §4, §9.4) | React islands for every tool; YAML tool content; indexing an empty line-finder page; "Scanner" in the hub title | tools session, `PROJECT_MASTER.md` §3 | BUILT — owner to confirm |
| WEB-DEC-037 | 2026-09-26 | **Web reading build choices (reading session):** (1) the app's pure code is copied to `src/lib/reading/palm/` (not `src/lib/palm/`) keeping the app's folder layout, so no import is rewritten; two web shims (`i18n/index.ts`, `features/quality/gate.ts`); copies carry `@ts-nocheck` and are ESLint-ignored (the app type-checks and lints them; the site's stricter `exactOptionalPropertyTypes` is not applied to a verbatim copy) — parity is proven by sha256 + a golden reading computed by the app's own build; (2) the web runs the app's whole `runReading` (gate check, merge, schema, checks, evidence, report, synthesis), never a re-implementation; (3) web readings are charged as FREE readings only (server rule in 0022) and the web ceilings start at 0 until the owner's budget decision; (4) mock mode = the app's stored real palm4_v2 scan of its stock guide photo, labelled Preview; (5) one route `/reading/`, language from ?lang, the saved choice or the referrer; (6) supabase-js and the rule engine load with import() only after a photo is picked; (7) the "Sending → Tracing" switch is the real end of the upload (XHR progress), no timed stages | Same reading as the app; honest progress; the app's capacity protected | Re-implementing the report on the web; a timed stage switch; a `lib/web/` + `lib/palm/` split | Owner decisions relayed 2026-09-26; plan §8, §12.6 | Decided (session), owner may revisit |

## 2. Still open (not decisions yet)

These are plan §16 recommendations the owner has not answered, plus gaps found while writing the docs. When the owner answers, add a WEB-DEC row above and remove the line here.

| Plan # | Question | Recommendation | Blocks |
|---|---|---|---|
| D13 / S5 | Budget: raise `llm_daily_cap`, size the web caps | Start the web cap small, watch cost per reading weekly, raise step by step | Live reading |
| D14 | Proxy client IP for Supabase Auth | `Sb-Forwarded-For` with a secret key used only for `/auth/v1`; alternative: raise the limits | S2, live reading |
| D3 | Line colours on the web | App theme colours (life #F07A5A, head #6EA8FF, heart #F27BB0, fate #A993FF) | Reading UI, diagrams |
| D6 | AI crawlers | Allow search/answer bots; allow training bots at launch, revisit at 90 days | `robots.txt` |
| D7 | Real hand photos | 3–5 consented hands, varied skin tones, written consent; never AI hands | Hero sample (diagram until then) |
| D15 | HEIC from desktop | "Upload a JPG" message first; lazy LGPL `heic-to` only if events show a need | Reading error screens |
| D17 | PDF gating | Double opt-in, unticked tips box, PDF file `noindex`, Hindi first | WEB-FEAT-053 |
| D19 | Does the line finder use a free reading? | No: lines only, own `web_scan` cap, Turnstile | WEB-FEAT-047, S4 |
| D21 | When to show the Play rating | Only at 4.0★+ with 100+ ratings, live and linked | `/app/`, store buttons |
| D22 | iPhone waitlist | No waitlist; honest note only | — |
| D23 | Carry web readings into the app | Decide after launch data | WEB-FEAT-066 |
| D24 | Failed or unclear photos | Must not use a free reading; [verify] retry and idempotency | Reading copy |
| D25 | Google sign-in on the web | After week 2, once tested on Jio and Airtel | WEB-FEAT-062 |
| D26 | Weekly palm-tip email | Only with a real sender, unsubscribe, content plan; opt-in | — |
| — | Company name, contact email, grievance contact (DPDP) | Owner to provide | Footer, `/privacy/`, launch |
| — | Worker name for Cloudflare | `palmsays-web` [rec]; record at scaffold | WEB-FEAT-001 |
| — | Tool slugs for tools 4–11 | Set in `KEYWORD_MAP.md` before first publish (proposal in `ARCHITECTURE.md` §3) | Tool pages |
