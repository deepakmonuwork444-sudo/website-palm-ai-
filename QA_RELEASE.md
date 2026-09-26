# PalmSays website — QA and release gate

> **What this is:** the "never breaks" gate: the checks every change must pass, the content checks, how to deploy to preview and production, how to roll back, what to check after a deploy, and the release log.
> **When to read it:** before any merge, any deploy, and before saying anything is "done". The `release-gate` skill runs this file. It is the **source of truth for QA and releases**; `WEBSITE_MASTER_PLAN.md` §5.14–5.15, §11.6, §12.1, §12.10 are the background.

**The rule:** nothing is merged or deployed, and nothing is called "done", until the required checks below pass **with evidence** (command output, screenshot paths, release-log row). A failed check blocks; it is fixed, not skipped. "Done" also means `PROJECT_MASTER.md` is updated in the same turn.

---

## 1. Gate levels

| Level | When | What must pass |
|---|---|---|
| **A — every change** | Any code, content or config change | §2 checks 1–5 |
| **B — anything users see** | UI, pages, tools, copy, the reading flow | A + §2 checks 6–8 + §4 content checks for touched pages |
| **C — production release** | Before `main` is deployed to palmsays.com | A + B on the whole site + §2 check 9 + §5 phone matrix (if the reading, sign-up, App Links or legal pages changed) + owner OK + §8 post-deploy checks |

## 2. Automated checks

The scaffold (WEB-FEAT-001/016) must create these npm scripts **with these names**; this table is the contract. Run from the project folder with `npm.cmd` (the owner's PowerShell blocks `npm.ps1`).

| # | Check | Command | Passes when |
|---|---|---|---|
| 1 | Typecheck + Astro diagnostics | `npm.cmd run check` (`astro check`) | 0 errors |
| 2 | Lint | `npm.cmd run lint` (ESLint incl. astro + react rules; bans `dangerouslySetInnerHTML`) | 0 errors |
| 3 | Unit tests | `npm.cmd run test` (`vitest run`: `lib/palm` parity, `lib/web`, config, reading state machine + error table with mocked API) | all pass |
| 4 | Build | `npm.cmd run build` (`astro build`) | succeeds, no schema errors |
| 5 | Site validation | `npm.cmd run check:site` (`node scripts/check-site.mjs` on `dist/`, list in §3) | 0 failures |
| 6 | E2E smoke + screenshots | `npm.cmd run test:e2e` (Playwright; mobile 390×844 and desktop 1440×900; home, `/hi/`, one guide, one tool, `/reading/` in mock mode through every state, `/account/`) | all pass; screenshots saved (§2.1) |
| 7 | Accessibility | inside `test:e2e` (axe on every smoke page) + the manual floor in §2.2 | 0 serious/critical axe issues; manual floor OK |
| 8 | Performance budgets | `npm.cmd run lhci` (Lighthouse CI, mobile: Moto G Power profile, 4× CPU, Slow 4G) | every budget in §2.3 met |
| 9 | CI build | `npm.cmd run build:ci` = `astro check && vitest run && astro build && node scripts/check-site.mjs` (the Workers Builds command) | green on the branch |

Shortcut: `npm.cmd run gate` runs 1–8 in order and stops at the first failure.

### 2.1 Screenshots

- Preferred: the Playwright smoke tests save screenshots to `qa/shots/<YYYY-MM-DD>-<branch>/`.
- Quick alternative for any URL (preview or production), mobile + desktop, fold + full page:
  ```
  cd "D:\palm ai\palm-ai-website\research-tools"
  node shot.mjs "..\qa\shots\2026-10-01-my-branch" https://<preview-url>/ https://<preview-url>/hi/
  ```
  (`shot.mjs` uses the installed Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe`.)
- Look at them before claiming anything: one gold button per screen, no horizontal scroll, nothing cut off, Devanagari not clipped, fixed bars ≤ 20% of the screen height, store button shows its price line.

### 2.2 Accessibility floor (plan §5.15)

Touch targets ≥ 48 × 48 px · WCAG AA contrast · visible focus rings · alt text in the page's language · correct `lang` everywhere · text at 200% with no horizontal scroll · Devanagari never letter-spaced or clipped (Hindi headings line-height ≥ 1.45) · icons always with text · errors never colour-only · FAQs use native `<details>` · the traced-photo `figcaption` lists the lines found · a reduced-motion version of every animation.

### 2.3 Performance budgets (plan §5.14)

| Page type | HTML (gzip) | CSS (gzip) | Our JS (gzip) | LCP / INP / CLS (p75 mobile) |
|---|---|---|---|---|
| Guides, blog, legal | ≤ 35 KB | ≤ 25 KB | **0 KB** (≤ 10 KB only if a light Preact/TS widget is on the page) | ≤ 2.0 s / ≤ 150 ms / ≤ 0.05 |
| Home | ≤ 30 KB | ≤ 25 KB | ≤ 60 KB on load (upload starter is not React) | ≤ 2.3 s / ≤ 150 ms / ≤ 0.05 |
| Tool pages | ≤ 25 KB | ≤ 25 KB | ≤ 70 KB (one island, hydrated when visible; switch to Preact if over) | ≤ 2.0 s / ≤ 150 ms / ≤ 0.05 |
| `/reading/` | small shell | ≤ 25 KB | ≤ 180 KB at first; rule engine loads only after the upload starts | INP ≤ 150 ms |

Also: fonts ≤ 120 KB English / ≤ 180 KB Hindi; LCP image ≤ 80 KB (home hero AVIF ≤ 45 KB at 480 px, ≤ 90 KB at 960 px, `fetchpriority="high"`, never lazy); other images ≤ 60 KB; TTFB ≤ 200 ms; no tag managers or ad scripts; no `backdrop-filter` on mobile.

## 3. What `check-site.mjs` must verify

Build fails on any of these:
- **Head:** title ≤ 60 chars, description 70–160, exactly one H1, absolute self-canonical on indexable pages.
- **hreflang:** `en` ↔ `hi` pairs both ways + `x-default` → English; one-sided pairs fail; head tags equal `sitemap-hi.xml`; `/life-line/broken/` has none until a Hindi twin exists.
- **Sitemaps:** equal the set of indexable, canonical, 200 pages; no `noindex` page and no `/reading/` or `/account/` inside; 5 group sitemaps + index.
- **Links:** no broken internal links; every indexed page has ≥ 2 internal links pointing to it and is ≤ 3 clicks from home; footer links only to live pages.
- **Frozen contracts** (`ARCHITECTURE.md` §11): the 12 App Link pages exist; `_redirects` has the 4 legacy `.html` → 301 rules; no published URL disappeared since the last production sitemap unless `_redirects` has a 301 for it; `assetlinks.json` is valid JSON with the right package and is not emitted while the SHA list is empty.
- **Indexing:** `noindex` on `/reading/`, `/account/`, `/delete-account/`, `/reset-password/`, `/404`; on **every** page when `PUBLIC_ENV=preview`; `robots.txt` does not disallow `/reading/` or `/account/`.
- **Structured data:** JSON-LD parses; never `AggregateRating`, `Review` or `HowTo`; `FAQPage` only on pages with ≥ 3 visible FAQs.
- **Content rules:** every `ymyl` page has the LimitsBox; the banned-words list (plan §4.5, `CONTENT_GUIDE.md`) finds nothing; no year, age or count predictions; every `ruleIds` entry exists in `lib/palm`; `updated` ≥ `published`; every store button has its price line.
- **Config:** free-reading numbers in copy come from `site.ts`, and `site.ts` matches the saved server fixture (`tests/fixtures/`). Before each level-C release, refresh that fixture from a real `reading_balance()` (`free_total`, guest share) taken with a test guest session — `reading_balance()` needs a signed-in user.
- **Secrets:** `dist/` contains no `sb_secret_`, `service_role` or `TURNSTILE_SECRET`.
- **JS budgets:** gzip size of our JS per page type within §2.3.

## 4. Content checks (human, per page, before publishing)

- **Honesty:** no fake counters, timers, struck prices, invented reviews, ratings or download numbers; the Play rating only when ≥ 4.0★ with 100+ ratings, live and linked.
- **Free is qualified** and the app's price sits next to every store button (packs one-time; plans auto-renew, cancel in Google Play).
- **No predictions:** no marriage dates, children counts, lifespan, health, divorce or money amounts; sensitive meanings use the three-part block (what we see / what the tradition says / what it can't tell you); the "What palmistry can't tell you" box links `/is-palmistry-real/`.
- **Privacy copy** is word-for-word from `SECURITY_PRIVACY.md` §2, and every [verify] it depends on is closed.
- **Sources:** every meaning has a named source; the simian page uses MedlinePlus/UF Health-level medical facts.
- **Dark patterns:** none of the 13 in plan §4.6 (checklist in `UX_PSYCHOLOGY.md`).
- **Hindi:** written as Hindi (not machine-translated), read by the owner or the named Hindi reviewer before it goes live; OG image passes the conjunct test (हस्तरेखा, ज्ञान).
- **Reviewer + owner OK:** named reviewer and "last reviewed" date on guides; owner OK for marriage, children, lifespan, simian and mercury topics.
- **Pace:** at most 5–8 new guides a week.

## 5. Phone matrix (level C, when the reading, sign-up, App Links or legal pages change)

Real devices, production-like backend (behind Cloudflare Access or production itself):

| Device / network | Check |
|---|---|
| Android Chrome on **Jio** mobile data | Full reading 1 → sign-up code → reading 2 → zero state → store button |
| Android Chrome on **Airtel** mobile data | Same (the `supabase.co` block is ISP-specific) |
| iPhone Safari | Reading works; HEIC → JPEG handover; honest iPhone note, no App Store badge |
| WhatsApp in-app browser | In-app browser notice + copy link; upload still possible |
| Desktop Chrome | Upload from gallery; QR hand-off to phone |
| Android with the app installed | App Link pages open the app at the right lesson; `/life-line/broken/` and `/tools/*` stay in the browser |

The owner runs these; hand over **one combined test sheet** at the end of a batch, not one per step.

## 6. Deploy steps

1. **Branch:** work on a feature branch, never directly on `main`.
2. **Gate:** level A (+ B) passes locally; results pasted into the handoff.
3. **Preview:** `npx.cmd wrangler versions upload --preview-alias <branch>` → `<branch>-<worker>.<account>.workers.dev` (`PUBLIC_ENV=preview`, `noindex`, reading in mock mode). Take screenshots of the preview (§2.1).
4. **Owner review:** send the preview link + screenshot paths + a short test list (Hinglish). Wait for OK.
5. **Production:** level C passes → the owner merges/pushes to `main` (Claude cannot push) → Workers Builds runs `build:ci` and deploys. Or the owner runs the deploy command Claude gives (with the project folder, `npx.cmd`).
6. **Post-deploy checks** (§8) within 15 minutes.
7. **Log it** (§9) and update `PROJECT_MASTER.md` (feature status + evidence, handoff).

## 7. Rollback

- Trigger: any post-deploy check fails, a frozen contract breaks, the reading fails for real users, or a false claim is live.
- Command (project folder): `npx.cmd wrangler rollback` (to the previous version), or Cloudflare dashboard → Workers → the site Worker → Deployments → roll back (last 100 versions).
- Static assets roll back with the version (confirm this once on day 1 — WEB-FEAT-031).
- Backend problems (caps, functions) are not fixed by a site rollback: ask the app-repo session / owner (kill switch = web caps to 0).
- After rollback: re-run §8, add a WEB-BUG row, log it in §9.

## 8. Post-deploy checks (production)

Run with `curl.exe` in PowerShell (or any HTTP client):

| Check | Command | Expected |
|---|---|---|
| Home up | `curl.exe -sI https://palmsays.com/` | 200, HSTS + CSP + other `_headers` present |
| `www` → apex | `curl.exe -sI https://www.palmsays.com/` | 301 → `https://palmsays.com/` |
| Legal redirects (×4) | `curl.exe -sI https://palmsays.com/privacy.html` (and terms, delete-account, reset-password) | 301 → `/privacy/` etc.; each target 200 |
| App Link pages (×12) | `curl.exe -sI https://palmsays.com/heart-line/` | 200 |
| assetlinks | `curl.exe -si https://palmsays.com/.well-known/assetlinks.json` | 200, `application/json`, no redirect, right package + SHA-256 (once S9 is on) |
| robots + sitemaps | `curl.exe -s https://palmsays.com/robots.txt`; open `/sitemap-index.xml` | `Allow: /` + sitemap line; 5 group sitemaps load |
| noindex | `curl.exe -s https://palmsays.com/reading/` | contains `noindex` |
| No cookies | Chrome devtools → Application → Cookies on `/`, `/reading/` | empty (else remove the "No cookies" claim) |
| API reachable | reading page loads the balance through `api.palmsays.com` | no CORS or 4xx errors in the console |

Then:
- **Search Console:** sitemaps submitted and read without errors; URL Inspection on `/`, one pillar, `/hi/`; no new coverage errors.
- **App Links on a phone** (owner, app installed): tap a `palmsays.com/heart-line/` link in WhatsApp → the app opens at the lesson; `palmsays.com/life-line/broken/` → opens in the browser.
- **Uptime monitors** green; certificate expiry alert set.

## 9. Release log

Newest first. One row per production deploy or rollback.

| Date | Version / commit | What changed (WEB-FEAT / WEB-BUG IDs) | Gate level passed (evidence path) | Post-deploy checks | Who deployed | Rollback? |
|---|---|---|---|---|---|---|
| — | — | no releases yet | — | — | — | — |
