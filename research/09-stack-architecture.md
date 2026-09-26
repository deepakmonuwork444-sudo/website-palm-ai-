# 09 — Stack, architecture and GitHub research (Palm Read AI website)

Date: 2026-09-26. Status: RESEARCH — no code written, no app files changed.
Inputs: `WEBSITE_MASTER_PLAN.md` (phase 5 plan), a read-only look at the app repo `D:\palm ai\palm-ai-new--feat-m1-foundation`, official docs, npm registry and the GitHub API (all checked 2026-09-26).

---

## 0. Short answer

- **Framework: Astro 7 (7.3.x), fully static output, React 19 islands only where needed, MDX guides, Tailwind 4.** Firm recommendation (score 92/100 vs SvelteKit 78, Next.js 74).
- **Hosting: Cloudflare Workers with static assets, not Cloudflare Pages.** One change from the master plan: Astro's Cloudflare adapter (v14) no longer supports Pages, and Cloudflare now tells new projects to start on Workers. For a purely static site both work; Workers keeps the door open for later server features. Static asset requests are free and never use Worker CPU. Nothing is live yet (the app's `deploy-web.mjs` to Pages was never run), so there are no live URLs to break.
- **No server code in the website repo.** The browser talks to the app's existing Supabase project **through the app's own `palm-api` proxy Worker** (`services/supabase-proxy/`, planned as `api.<domain>`), because Indian ISPs have DNS-blocked `*.supabase.co` (BUG-030). Turnstile is checked in a new web-only Supabase edge function in the app repo.
- **Three facts from the app repo change the plan:**
  1. The free-reading rule live today is **2 guest + 4 total** (migration 0013). The web promise "1 guest + 1 after email" needs 0016 applied (0017 for locks/unlock), and the email-OTP path has never been tested.
  2. Daily caps are **shared with the app** (`llm_daily_cap` 34, `guest_free_daily_cap` 30, 6 per IP). An open web reading could use up the app's whole day in minutes, so the web needs its own cap.
  3. The photo is sent **twice** per reading (1080 px to `scan-palm` → Modal, USA; 768 px to `extract-palm` → Cloudflare Workers AI), not "once". Line coordinates and 21 hand landmarks **are stored** in Supabase. The web privacy wording must say exactly this.
- **Changes needed in the app repo (spec only, section 3.6):** apply 0016/0017, deploy the proxy with its IP fixes, a Turnstile gate function + web-only start RPC + web caps, CORS allow-list, custom SMTP, Site URL/redirects, App Links with exact paths, and retiring `web/` + `deploy-web.mjs` once the legal pages move here.

---

## 1. Framework decision

### 1.1 Current versions (npm registry, 2026-09-26)

| Package | Latest | Published | Licence |
|---|---|---|---|
| astro | 7.3.5 | 2026-09-24 | MIT |
| @astrojs/react / mdx / sitemap / cloudflare | 7.0.0 / 8.0.2 / 3.7.4 / 14.3.3 | Sept 2026 | MIT |
| next | 16.3.6 | 2026-09-22 | MIT |
| @opennextjs/cloudflare | 1.20.6 | 2026-09-02 | MIT |
| @sveltejs/kit / svelte / adapter-cloudflare | 2.70.3 / 5.57.1 / 7.2.9 | Aug–Sept 2026 | MIT |
| react | 19.3.0 | 2026-09-09 | MIT |
| tailwindcss (+ @tailwindcss/vite) | 4.3.3 | 2026-07-16 | MIT |
| @supabase/supabase-js | 2.117.2 | 2026-09-25 | MIT |
| wrangler | 4.141.0 | 2026-09-25 | MIT/Apache-2.0 |
| pagefind | 1.5.2 | 2026-04-12 | MIT |

Context that matters:
- **Cloudflare acquired the Astro team in January 2026**; Astro stays MIT open source ([Cloudflare press release](https://www.cloudflare.com/press/press-releases/2026/cloudflare-acquires-astro-to-accelerate-the-future-of-high-performance-web-development/), [The New Stack](https://thenewstack.io/cloudflare-acquires-team-behind-open-source-framework-astro/)). Astro on Cloudflare is now the "home platform" pairing.
- **Astro 6.0** (2026-03-10): Node 22+, Vite 7, Zod 4, stable built-in **CSP**, stable **Fonts API**, live content collections, dev server runs `workerd` for Cloudflare ([Astro 6 blog](https://astro.build/blog/astro-6/)).
- **Astro 7.0** (2026-06-22): Rust `.astro` compiler, Rust Markdown/MDX pipeline ("Sätteri"), Vite 8 + Rolldown, builds 15–61% faster, `src/fetch.ts` advanced routing, stable route caching ([Astro 7 blog](https://astro.build/blog/astro-7/), [InfoQ](https://www.infoq.com/news/2026/08/astro-7-release-speed/)). Breaking: stricter HTML (unclosed tags are errors), whitespace collapsed JSX-style, remark/rehype plugins need `@astrojs/markdown-remark` to keep the old pipeline ([morello.dev](https://morello.dev/blog/astro-7)). New project → no migration cost for us; just avoid depending on many remark/rehype plugins.
- **@astrojs/cloudflare v14**: "no longer supports deployment on Cloudflare Pages" — Workers only; `workerd` in dev; env from `cloudflare:workers` ([adapter docs](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)). Not needed at all while the site is 100% static.
- **Cloudflare Pages vs Workers**: Workers has static-asset parity, supports `_headers` and `_redirects` natively, and every new platform feature lands on Workers first; Pages is still supported with no deadline ([migration guide](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)).
- **Next.js 16 on Cloudflare** needs the OpenNext adapter, Node runtime only, Node middleware not supported yet ([OpenNext Cloudflare](https://opennext.js.org/cloudflare)); Next's adapter API became stable in 16.2 ([Next.js blog](https://nextjs.org/blog/nextjs-across-platforms)). Workers free plan gives **10 ms CPU per request** ([limits](https://developers.cloudflare.com/workers/platform/limits/)) — SSR pages on the free plan are fragile; realistically the $5/month paid plan.
- **SvelteKit 2 + adapter-cloudflare** targets Workers static assets and Pages ([docs](https://svelte.dev/docs/kit/adapter-cloudflare)); i18n via Paraglide.

### 1.2 Scored comparison (1–5 per criterion, weighted to 100)

| Criterion (weight) | Astro 7 + React islands | Next.js 16 + OpenNext | SvelteKit 2 |
|---|---|---|---|
| Static SEO pages: per-page HTML, MDX, OG, sitemap (20) | 5 — static HTML by default, content collections, MDX, sitemap with hreflang | 4 — SSG fine, but RSC payload + client router on every page | 4 — prerender + mdsvex, fewer content tools |
| Interactive tools + upload/reading flow (15) | 4 — React islands; shared state across islands needs nanostores | 5 — one React app | 5 — very good client reactivity |
| JS weight / Core Web Vitals by default (15) | 5 — 0 KB JS on guide pages unless an island is used | 3 — React + router runtime on every page (~90–110 KB gz baseline) | 4 — small runtime, still hydrates pages |
| i18n en + hi (10) | 4 — built-in routing, `astro:i18n` helpers, sitemap hreflang; UI strings via Paraglide; hreflang tags written by us | 3 — no App Router i18n built in; next-intl + middleware (middleware ≠ static export) | 4 — Paraglide is first-class |
| Cloudflare fit: free plan, no server, limits (15) | 5 — pure static assets, free, no CPU limit exposure; Cloudflare owns Astro | 2 — Worker SSR, 10 ms CPU on free plan, ISR cache needs R2/KV setup; or `output: export` and lose middleware | 4 — works well; static prerender possible |
| Team/code fit: React+TS app, shadcn, Claude familiarity (10) | 4 — React islands reuse the app's React/TS habits; `.astro` files are HTML-like | 5 — plain React | 2 — new language (Svelte 5 runes) for owner and future sessions |
| Build speed + DX (5) | 4 — Rust compiler fast; v7 is 3 months old | 4 | 3 |
| Longevity / vendor risk (10) | 5 — Cloudflare-backed, MIT | 4 — Vercel-first, adapters now official | 4 — Vercel-sponsored |
| **Weighted total (/100)** | **92** | **74** | **78** |

**Recommendation: Astro 7.3.x, `output: 'static'`, `build.format: 'directory'`, `trailingSlash: 'always'`, React 19 islands, MDX content collections, Tailwind 4 via `@tailwindcss/vite`, deployed as a Cloudflare Worker with static assets (`wrangler.jsonc` → `assets.directory: "./dist"`, no Worker script).** Add `@astrojs/cloudflare` only if we later need an on-demand route (for example per-reading share images).

Risks of this choice and mitigations:
1. Astro 7 is new (Rust compiler, new Markdown pipeline) → pin exact versions, keep MDX simple (components instead of remark plugins), upgrade deliberately.
2. Islands don't share React state → keep the whole reading flow in one island (`<ReadingApp client:load>`); use nanostores only for tiny cross-island flags (credits badge in the header).
3. React runtime (~60 KB gz) on tool pages → only hydrate the tool itself (`client:visible`), keep guide pages 0 KB; Preact compat is the fallback lever if the JS budget is blown.
4. Everything is static → rebuild + deploy for every content change (fine: builds are fast; Workers Builds runs on each push).

---

## 2. GitHub research — useful open-source repos

Numbers from the GitHub REST API on 2026-09-26. "Ref only" = no licence or a copyleft licence that does not fit a proprietary site; do not copy code from these.

### 2.1 Palmistry / palm-line detection

| Repo | Stars | Last push | Licence | What we'd use | Risk |
|---|---|---|---|---|---|
| [google-ai-edge/mediapipe](https://github.com/google-ai-edge/mediapipe) | 37.1k | 2026-09-25 | Apache-2.0 | Hand Landmarker (tasks-vision, WASM in browser): "is this an open palm?", crop/straighten before upload — a better in-browser photo check | A few MB of WASM + model; lazy-load only on the reading page |
| [samuelwbarber/palm-line-reader](https://github.com/samuelwbarber/palm-line-reader) | 0 | 2026-07-10 | MIT | Closest design to ours: UNet (mit_b0, 11 MB fp16 ONNX) in ONNX Runtime Web on a MediaPipe crop; heart/head/life lines | **Do not ship its weights** (trained on scraped r/PalmReading photos, unclear consent). Architecture reference only. Our backend already traces lines |
| [yeonsumia/palmistry](https://github.com/yeonsumia/palmistry) | 54 | 2026-04-30 | Apache-2.0 | Python pipeline reference (warp → line detection → K-means line assignment) for offline evaluation | Python; dataset provenance unstated; keep NOTICE if reused |
| [timerzz/kanxiang](https://github.com/timerzz/kanxiang) | 18 | 2026-09-09 | MIT | Report-structure ideas | Low relevance |
| [Adamya-Gupta/HastAI-PalmReader](https://github.com/Adamya-Gupta/HastAI-PalmReader) | 2 | 2025-06-10 | MIT | UX reference (3D hand + Gemini) | Stale, tiny |
| lakshay102/Palm-Astro-Application, sude-go/PalmSegNet, parkjichung/palm-line-detection | 0–4 | 2026 | None | Segmentation ideas | **Ref only** |

Papers: [U-Net context fusion for palm lines (arXiv 2102.12127)](https://arxiv.org/abs/2102.12127), [arXiv 2509.02248](https://arxiv.org/html/2509.02248v1). Conclusion: nobody open-source has a production-quality web palm tracer; our backend's real tracing stays the differentiator. MediaPipe is the one library worth adding (in-browser "is it a palm" check).

### 2.2 Astrology / spiritual site templates

No maintained Astro astrology theme exists. Use a general Astro base (2.3) plus, only if a birth-chart tool is ever added: [AstroDraw/AstroChart](https://github.com/AstroDraw/AstroChart) (419★, MIT, SVG wheel, Western only), [cosinekitty/astronomy](https://github.com/cosinekitty/astronomy) (1.0k★, MIT, planet positions offline). [RoxyAPI/jyotish-vedic-astrology-app](https://github.com/RoxyAPI/jyotish-vedic-astrology-app) (MIT, Next 16) is a UI reference but needs a paid API. **Avoid** [kerykeion](https://github.com/g-battaglia/kerykeion) (AGPL-3.0 — network use would force releasing our source).

### 2.3 Astro starters (content + tools, i18n, MDX, SEO, OG)

| Repo | Stars | Last push | Licence | What we'd use | Risk |
|---|---|---|---|---|---|
| [withastro/astro](https://github.com/withastro/astro) | 62.8k | 2026-09-26 | MIT | Framework, `create astro` minimal template | — |
| [satnaing/astro-paper](https://github.com/satnaing/astro-paper) | 5.1k | 2026-09-18 | MIT | SEO head, dynamic OG, blog patterns to borrow | Not i18n-first |
| [arthelokyo/astrowind](https://github.com/arthelokyo/astrowind) | 6.0k | 2026-09-12 | MIT | Landing + blog blocks, Tailwind | Heavy widget set; no i18n |
| [withastro/starlight](https://github.com/withastro/starlight) | 9.3k | 2026-09-25 | MIT | Reference for i18n fallback + Pagefind wiring | Looks like docs; don't use as the site shell |
| [zeon-studio/astroplate](https://github.com/zeon-studio/astroplate) | 1.2k | 2026-08-16 | MIT | Tailwind + MDX structure | Vendor upsells themes |
| [incluud/accessible-astro-starter](https://github.com/incluud/accessible-astro-starter) | 1.2k | 2026-09-12 | MIT | Skip links, focus, landmarks patterns | No i18n |
| [opral/paraglide-js](https://github.com/opral/paraglide-js) | 710 | 2026-09-17 | MIT | Typed, tree-shaken en/hi UI strings shared by `.astro` pages and React islands | Extra compile step |
| [area44/astro-shadcn-ui-template](https://github.com/area44/astro-shadcn-ui-template) | 209 | 2026-09-26 | MIT | Astro + Tailwind + shadcn wiring reference | Small team |

Decision: start from the **official minimal template** (not a theme — themes bring pages and widgets we would delete), and borrow SEO/OG patterns from AstroPaper. Astro i18n routing is stable ([docs](https://docs.astro.build/en/guides/internationalization/)); it does **not** emit hreflang tags or translate strings — we add a `<SeoHead>` component that writes `hreflang` + `x-default`, and Paraglide for strings. `@astrojs/sitemap` `i18n` option adds `xhtml:link` alternates ([docs](https://docs.astro.build/en/guides/integrations-guide/sitemap/)).

### 2.4 Component kits

| Repo | Stars | Last push | Licence | Use | Risk |
|---|---|---|---|---|---|
| [shadcn-ui/ui](https://github.com/shadcn-ui/ui) | 124.6k | 2026-09-24 | MIT | Copy-in React components inside islands (dialog, sheet, tabs, toast) — [Astro install guide](https://ui.shadcn.com/docs/installation/astro) | React only → only in hydrated islands |
| [radix-ui/primitives](https://github.com/radix-ui/primitives) / [mui/base-ui](https://github.com/mui/base-ui) | 19.3k / 11.0k | 2026-08 / 2026-09 | MIT | Primitives under shadcn | Dialog ~12 KB gz |
| [starwind-ui/starwind-ui](https://github.com/starwind-ui/starwind-ui) | 737 | 2026-09-26 | MIT | shadcn-style **`.astro` components with zero JS** for static pages (buttons, cards, accordion for FAQ) | Young; API still moving |
| [saadeghi/daisyui](https://github.com/saadeghi/daisyui) | 42.5k | 2026-09-25 | MIT | CSS-only alternative | Different tokens from shadcn — pick one |
| [chakra-ui/ark](https://github.com/chakra-ui/ark) | 5.4k | 2026-09-25 | MIT | Headless state machines | Import per component (full pkg 283 KB gz) |

Decision: **one token set (shadcn CSS variables in Tailwind 4 `@theme`)**; static pages use plain `.astro` components styled with those tokens (borrow Starwind patterns, copy nothing heavy); React islands use shadcn components. FAQ accordions use native `<details>` (0 JS, good for SEO).

### 2.5 Client-side image handling

| Repo | Stars | Last push | Licence | Size (gz) | Use | Risk |
|---|---|---|---|---|---|---|
| Native `createImageBitmap` + canvas | — | — | — | 0 | Decode with EXIF orientation applied (default `imageOrientation: "from-image"`, [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap)), resize, `canvas.toBlob('image/jpeg', 0.85)` → **re-encoding drops all EXIF incl. GPS** | **Default choice** |
| [nodeca/pica](https://github.com/nodeca/pica) | 4.2k | 2026-08-15 | MIT | 16 KB | Higher-quality downscale (Lanczos) if canvas resize blurs lines | Resize only |
| [Donaldcwl/browser-image-compression](https://github.com/Donaldcwl/browser-image-compression) | 1.7k | 2024-03-08 | MIT | 19 KB | Size-targeted compression in a worker | No push since 2024 |
| [fengyuanchen/compressorjs](https://github.com/fengyuanchen/compressorjs) | 5.8k | 2026-09-13 | MIT | 4.5 KB | Simple alternative | — |
| [MikeKovarik/exifr](https://github.com/MikeKovarik/exifr) | 1.2k | 2024-03-29 | MIT | lite < 25 KB | Only if we want to *tell* the user "your photo had location data, we removed it" | Stale; optional |
| [hoppergee/heic-to](https://github.com/hoppergee/heic-to) | 351 | 2026-05-26 | **LGPL-3.0** | 718 KB | HEIC→JPEG on Chrome/Firefox desktop | **LGPL**: lazy-load as a separate unmodified file only after decode fails; get owner OK |
| [alexcorvi/heic2any](https://github.com/alexcorvi/heic2any) | 888 | 2024-04-11 | MIT wrapper, bundles LGPL libheif | 333 KB | Same | Stale; still LGPL inside |
| [jamsinclair/jSquash](https://github.com/jamsinclair/jSquash) | 730 | 2026-01-05 | Apache-2.0 | per codec | MozJPEG/WebP in browser | Extra WASM |

HEIC reality: iPhone Safari's file picker with `accept="image/*"` hands the page a JPEG in most cases (to verify on a real iPhone) and Safari 17+ can decode HEIC itself ([WebKit Safari 17](https://webkit.org/blog/14445/webkit-features-in-safari-17-0/)); HEIC only breaks when an iPhone user uploads a `.heic` file from a desktop Chrome/Firefox/Edge. Plan: try `createImageBitmap`; if it throws on a HEIC file → lazy-load `heic-to`; if the owner refuses LGPL → show "Please upload a JPG or take a photo with your phone". **Do not** put `image/heic` in `accept` (Safari 17+ then converts JPEGs to HEIC — [Apple forum](https://developer.apple.com/forums/thread/743049)).

### 2.6 Line overlay + OG images

| Repo | Stars | Last push | Licence | Use | Risk |
|---|---|---|---|---|---|
| Plain inline SVG | — | — | — | `<svg viewBox="0 0 W H">` over the photo, one `<path>` per line, draw-on animation with `stroke-dasharray`; responsive for free, 0 KB | **Default** |
| [steveruizok/perfect-freehand](https://github.com/steveruizok/perfect-freehand) | 5.7k | 2026-04-13 | MIT | Turns traced points into natural hand-drawn strokes (2 KB) | — |
| [konvajs/react-konva](https://github.com/konvajs/react-konva) | 6.4k | 2026-09-15 | MIT | Only if users must drag/edit lines (~100 KB) | Heavy |
| [rough-stuff/rough](https://github.com/rough-stuff/rough) | 21.2k | 2024-07-28 | MIT | Sketchy style (not our look) | Stale |
| [delucis/astro-og-canvas](https://github.com/delucis/astro-og-canvas) | 282 | 2026-09-23 | MIT | **Build-time OG PNG per page** from content collections; uses CanvasKit (Skia) — peer `astro ^5 ‖ ^6 ‖ ^7` | Devanagari shaping must be tested with a Hindi title on day 1 |
| [vercel/satori](https://github.com/vercel/satori) | 14.0k | 2026-09-22 | MPL-2.0 | JSX→SVG OG images | **Known Indic shaping problems** ([#516 Devanagari](https://github.com/vercel/satori/issues/516), [#215 Tamil](https://github.com/vercel/satori/issues/215)) → not for `/hi/` |
| [fineshopdesign/cf-wasm](https://github.com/fineshopdesign/cf-wasm) (@cf-wasm/og) | 296 | 2026-09-19 | MIT | Satori on Workers for dynamic share images later | Satori shaping caveat; Worker CPU |

Fallback for Hindi OG if CanvasKit shaping fails: a build script that screenshots an HTML template with Playwright (the browser shapes Devanagari correctly; `playwright-core` is already in `research-tools/`).

### 2.7 Other

| Repo | Stars | Licence | Use |
|---|---|---|---|
| [Pagefind/pagefind](https://github.com/Pagefind/pagefind) | 5.5k | MIT | Static search, one index per `<html lang>`, **Hindi stemming supported** ([docs](https://pagefind.app/docs/multilingual/)) — add in week 2+, not needed for ~30 pages |
| [marsidev/react-turnstile](https://github.com/marsidev/react-turnstile) | 853 | MIT | Turnstile widget in the reading island (2.6 KB) |
| [unjs/uqr](https://github.com/unjs/uqr) | 765 | MIT | Build-time SVG QR for "scan to get the app" (0 KB at runtime) |
| [QwikDev/partytown](https://github.com/QwikDev/partytown) | 13.8k | MIT | Not needed (no third-party tags planned) |

---

## 3. Architecture

### 3.1 Folder structure

```
palm-ai-website/
  astro.config.mjs          output 'static', site, trailingSlash 'always', i18n {en, hi}, integrations: react, mdx, sitemap(i18n)
  wrangler.jsonc            name, assets.directory ./dist, html_handling auto-trailing-slash, not_found_handling 404-page
  package.json              exact pinned versions (astro 7.3.x etc.)
  public/
    _headers                security headers, cache rules (section 3.8)
    _redirects              /privacy.html → /privacy/ 301 etc. (section 3.12)
    favicon.svg, robots-images…
  messages/en.json, hi.json UI strings (Paraglide) — guides are MDX, not strings
  src/
    config/site.ts          ONE place: brand, brandHi, domain, playPackage, apiUrl (proxy), publishable key, turnstile site key, locales
    content.config.ts       collections: guides, blog, tools, faqs (section 3.3)
    content/guides/{en,hi}/*.mdx
    content/blog/{en,hi}/*.mdx
    content/tools/*.yaml
    layouts/                Base, Guide, Tool, Legal, Blog
    components/             .astro, zero JS: SeoHead (canonical, hreflang, OG, JSON-LD), LangSwitch, StoreButton, QrCode (uqr, build time),
                            Faq (<details>), LimitsBox, SourcesList, StepOf7, Breadcrumbs, PalmDiagram (inline SVG, translatable labels)
    islands/                React, hydrated only where used: UploadStart (home hero), ReadingApp (/reading/), PhotoChecker, WhichHandQuiz,
                            HandTypeFinder, LineMeaningFinder, SignsChecker, PalmMap, SpotTheLineQuiz, AccountPanel, DeleteAccount, PdfOptIn
    lib/palm/               COPIED pure TS from the app (section 3.5) + SOURCE.md (app commit, date, file list, sha256 per file)
    lib/web/                supabase.ts (client via proxy), image.ts (decode/resize/strip), quality.ts (canvas → app metrics),
                            api.ts (scan-palm, extract-palm, web-gate), idb.ts (readings in IndexedDB), events.ts (funnel counts), store-link.ts
    pages/
      index.astro, [...slug].astro (guides, both locales via getStaticPaths), tools/…, blog/…, app.astro, reading.astro, account.astro,
      privacy.astro, terms.astro, delete-account.astro, reset-password.astro, 404.astro,
      robots.txt.ts, llms.txt.ts, .well-known/assetlinks.json.ts, og/[...path].png.ts (astro-og-canvas)
      hi/…                  Hindi routes (same components, locale 'hi')
    styles/global.css       Tailwind 4 @theme tokens (shadcn variable names)
  scripts/
    sync-palm-lib.mjs       copies the whitelisted app files at a given commit, rewrites imports, writes SOURCE.md, fails on any RN/Expo import
    check-site.mjs          every page: title/description length, one H1, canonical, hreflang pair exists both ways, no broken links, sitemap = indexable pages
  tests/                    vitest (lib/palm parity + lib/web), playwright smoke (home, reading with mocked backend, /hi/)
```

### 3.2 Routing table

SSG = prerendered HTML at build. "Island" = static HTML plus one hydrated component. Client-only = static shell, content rendered in the browser. All static (the site has no server routes).

| Route | Rendering | Index | Hindi pair |
|---|---|---|---|
| `/` | SSG + `UploadStart` island (`client:load`, small: file pick + photo check only; then hands off to `/reading/`) | index | `/hi/` |
| `/palm-reading/`, `/hand-lines/` (+ `PalmMap` island `client:visible`) | SSG | index | `/hi/palm-reading/`, `/hi/hand-lines/` |
| `/heart-line/`, `/head-line/`, `/life-line/`, `/fate-line/` | SSG | index | `/hi/<same>/` |
| `/life-line/broken/` | SSG | index | none at first (no `hreflang` until a real Hindi version exists) |
| `/is-palmistry-real/`, `/which-hand-to-read/` (+ quiz island) | SSG | index | P2 |
| P2/P3 guides (`/marriage-line/`, `/simian-line/`, `/hand-types/`, `/palmistry-m/`, `/money-line/`, `/career-palmistry/`, `/sun-line/`, …) | SSG | index | later, only after owner review |
| `/indian-palmistry/` ↔ `/hi/hast-rekha/` | SSG | index | pair only if the content is equivalent; otherwise two standalone pages |
| `/tools/` | SSG | index | `/hi/tools/` |
| `/tools/<tool>/` (12) | SSG + tool island (`client:visible`; photo tools `client:idle`) | index | `/hi/tools/<tool>/` (English slug kept) |
| `/blog/`, `/blog/<slug>/`, `/blog/page/<n>/` | SSG | index (pages ≥ 2: index, follow, self-canonical) | Hindi posts at `/hi/blog/<slug>/`, paired only when translated |
| `/app/` | SSG + 1 KB inline script (Android → Play button; desktop → QR) | index | `/hi/app/` |
| `/palm-reading-pdf/` | SSG + `PdfOptIn` island | index | later. **Rename suggestion:** `/palmistry-pdf/` (see App Links in 3.6) |
| `/reading/` | client-only (`ReadingApp` `client:only="react"`) | **noindex**, not in sitemap, `Disallow` not used (so noindex is seen) | UI language follows the locale; one route |
| `/account/` | client-only | noindex | same |
| `/privacy/`, `/terms/` | SSG | index | Hindi summary later |
| `/delete-account/`, `/reset-password/` | SSG + small island | noindex | — |
| `/privacy.html`, `/terms.html`, `/delete-account.html`, `/reset-password.html` | `_redirects` 301 → pretty URL | — | — |
| `/sitemap-index.xml` | build (`@astrojs/sitemap` with `i18n`, `filter` drops noindex) | — | — |
| `/robots.txt`, `/llms.txt` | build endpoints | — | — |
| `/.well-known/assetlinks.json` | build endpoint from `site.ts` fingerprints; **skipped when the list is empty** (same rule as the app's builder); `Content-Type: application/json`, no redirect | — | — |
| `/og/<path>.png` | build (astro-og-canvas) | — | per locale |
| `/404` (`404.html`) | SSG, `not_found_handling: "404-page"` | noindex | bilingual text |

URL rules: lowercase, hyphens, trailing slash, no `.html`. Hreflang on every paired page: `en`, `hi`, `x-default` → English. `lang="hi"` on `<html>` for Hindi (Pagefind and screen readers depend on it).

### 3.3 Content collections

`src/content.config.ts` (Astro 6+/7 uses Zod 4 from `astro/zod`, loaders from `astro/loaders`):

```ts
const guides = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/guides' }),
  schema: ({ image }) => z.object({
    title: z.string().max(60),                 // <title> and H1 base
    description: z.string().min(70).max(160),
    locale: z.enum(['en', 'hi']),
    slug: z.string(),                          // 'heart-line' or 'life-line/broken'
    translationKey: z.string(),                // pairs en/hi for hreflang; check-site fails on one-sided pairs
    pillar: z.enum(['palm-reading', 'hand-lines', 'heart-line', 'head-line', 'life-line', 'fate-line', 'signs', 'hand-shape', 'basics']),
    isPillar: z.boolean().default(false),
    keywordCluster: z.object({
      primary: z.string(), secondary: z.array(z.string()).max(15),
      usVolume: z.number().int().optional(), kd: z.number().int().optional(), inVolume: z.number().int().optional(),
    }),
    related: z.array(reference('guides')).max(6),
    tool: reference('tools').optional(),       // the tool button on the page
    appLesson: z.enum(['heart', 'head', 'life', 'fate']).optional(), // deep-link target in the app
    sources: z.array(z.object({                // classical source behind each meaning (the app stores sources per rule)
      title: z.string(), author: z.string().optional(), year: z.number().int().optional(),
      url: z.string().url().optional(), ruleIds: z.array(z.string()).default([]),
    })).min(1),
    reviewedBy: z.object({ name: z.string(), role: z.string(), date: z.coerce.date() }),
    published: z.coerce.date(),
    updated: z.coerce.date(),
    ymyl: z.enum(['none', 'marriage', 'children', 'lifespan', 'health']).default('none'), // forces the limits box + wording lint
    stepOf7: z.number().int().min(1).max(7).optional(),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).max(8).default([]),
    heroImage: image().optional(),
    draft: z.boolean().default(false),
    noindex: z.boolean().default(false),
  }),
});
```

`blog` reuses most fields (adds `pillarLink: reference('guides')`, `author`). `tools` is a YAML collection (3.4). Lints in `check-site.mjs`: a `ymyl` page must contain the `<LimitsBox>`, must not contain year/age/count predictions (regex list shared with the app's `unsafe-terms.ts` idea), `updated ≥ published`, every `ruleIds` entry exists in `lib/palm` rules.

### 3.4 Tools framework (one template)

- **Data:** `src/content/tools/<id>.yaml` → `id, locale titles/descriptions, kind ('photo-ai' | 'photo-local' | 'quiz' | 'picker' | 'map'), usesAI (bool, shown as a label), island (component name), relatedGuides, faq, limits (text), howItWorks (3 steps)`.
- **Layout:** `ToolLayout.astro` renders H1, one-line promise, the island, "How it works", "What this tool cannot tell you", FAQ (`<details>`), related guides, app CTA, JSON-LD `WebApplication` (+ `BreadcrumbList`). The static text around the island is what Google indexes, so no tool page is thin.
- **Island contract:** `export default function Tool({ locale, strings, data })`. `data` is the slice of the app's rule set the tool needs, computed at build time in the `.astro` page and passed as props (JSON in the HTML), so the island does not import the full knowledge base. Result sharing via query (`?shape=forked`) with a self-canonical to the clean URL.
- **Honest labels:** only tools 1–2 call the backend; tool 3 (photo checker) runs in the browser and says "your photo never leaves this device"; 4–12 are rule lookups/quizzes, labelled "traditional meanings, not AI".

### 3.5 Reusing the app's code (copy, not link)

From the read-only look at the app repo (file:line in the app repo):

| Group | Files | Portability | Tests in app |
|---|---|---|---|
| Rule engine + knowledge | `src/features/knowledge/**` (~4.3k LOC; `engine.ts` `buildEvidence` :290), `knowledge/synthesis/**` (~1.9k; `synthesise` :245, `buildReading` in `modules.ts` :357) | Pure — copy as-is | Yes (many) |
| Report sections + locks | `reading/report-sections.ts` (:20-37, love / career-money / personality / direction), `reading/access.ts` (DEC-038: `FREE_OPEN_SECTIONS` love+personality, `lockSynthesis` keeps the first sentence, :32-34, :186-193), `summary.ts`, `humanise.ts`, `localise.ts`, `basis.ts`, `books.ts`, `focus.ts`, `writer.ts`, `pipeline.ts` (`runReading` :274) | Pure | Yes |
| Observation / lines / report-v2 | `observation/*`, `lines/{bands,derived,merge,types,band-config}`, `report-v2/{build,contract}`, `lib/base64.ts`, `theme/index.ts` (colours) | Pure | Yes |
| Photo quality | `quality/{metrics,verdict,live,review}.ts` | Pure | Yes |
| Photo gate | `quality/gate.ts` | Shim: replace expo-image-manipulator + jpeg-js with a 96 px canvas → `getImageData` → `computeMetrics` → `evaluateQuality` (~40 lines) | No (write one) |
| Vision client | `vision/{normalise,provider,prompt,partial,deterministic}.ts` pure; `vision/remote.ts` shim: browser `fetch` instead of `expo/fetch`, canvas downscale 768 px JPEG 0.85 instead of expo-image-manipulator (:275-307) | Mostly pure | Partly |
| Line-scan client | `lines/client.ts` (calls `scan-palm`, 1080 px) | Shim: fetch + canvas | Check |
| Data writes | `reading/repository.ts` (inserts `palm_observations` :102, `reading_reports` :119), `access-api.ts` (`reading_access`, `unlock_reading`) | Shim: web Supabase client | No |
| Not portable | `start-scan.ts` (expo-router, hooks), `store.ts`, `report-lang.ts` (zustand + RN), `deep-report/generate.ts` (unused for new readings, DEC-033) | Rewrite small web equivalents | — |

Rules: `scripts/sync-palm-lib.mjs <app-commit>` copies a whitelist into `src/lib/palm/`, fails if any file imports `react-native`, `expo*` or `@/lib/…` outside the whitelist, and writes `SOURCE.md`. The copied tests run here too (vitest) as a parity check. i18n imports in the app are `import type` only, so they erase at build. **Bundle note:** knowledge + synthesis is the largest JS in the site; load it with a dynamic `import()` on `/reading/` after the upload starts, never on guide pages. Tools 4–7 and 10 get build-time slices (3.4).

### 3.6 Reading flow (web) and the server work it needs

Sequence (mirrors the app's `src/app/analysing.tsx`: guest sign-in :249 → `start_reading` :343 → `scan-palm` :354 → `runReading` :403 → `complete_reading` :441):

```
Browser (home)            Browser (/reading/)                 api.<domain> (app's palm-api proxy Worker) → Supabase
1 pick/take photo  ─────► 2 decode with EXIF rotation, resize, strip EXIF; photo check (app metrics); choose hand L/R + dominant
                           3 Turnstile (managed, action "reading")
                           4 auth.signInAnonymously()  ─────────────► /auth/v1   (reuse the session if one exists)
                           5 POST functions/v1/web-gate {token} ────► NEW: siteverify (hostname + action), writes a 10-min web pass
                           6 rpc start_web_reading(hand, dominant, key) ► NEW wrapper: needs the pass, consumes the WEB cap, then start_reading logic
                           7 POST scan-palm {sessionId, imageBase64 1080px, handSide} ► Modal (USA) traces lines; photo not stored
                           8 POST extract-palm {sessionId, imageBase64 768px, scan} ► claim_extraction CHARGES free_guest; Workers AI
                           9 buildEvidence → synthesise → buildReading → 4 sections → lockSynthesis (DEC-038) — all in the browser
                          10 insert palm_observations + reading_reports; rpc complete_reading
                          11 save {photo 1080px, observation, report} in IndexedDB; show photo + SVG traced lines + report
                          12 "Second free reading — sign up with email": updateUser({email}) → 6-digit code → verifyOtp('email_change')
                             (same user id; the auth.users trigger links the email ledger) → reading 2 (other hand) → charged free_email
                          13 rpc reading_balance() → free_remaining 0 → only "Continue in the app" (Play + QR). No web payments.
```

Headers for every function call: `apikey: <publishable key>` + `Authorization: Bearer <user access token>` (the functions call `auth.getUser()`, so the key alone gets 401). Errors to design screens for (from the functions): 402 `no_readings_left`, 403 `needs_email_verification`, 409 `invalid_session`, 413, 422 `not_a_palm` (refunded), 429 `daily_capacity_reached` / `too_many_attempts` / `rate_limited`, 503 `scanner_unavailable` (refunded). Sign-in on web day 1 = **email + 6-digit code only** (same as the app). Google on web needs an OAuth redirect flow (the app's Google is native-only), a web OAuth client, "manual linking" for guests, and the callback runs on the Supabase host, which may be the blocked `*.supabase.co` → week 2+, after testing on Jio/Airtel.

**App-repo server changes (spec only — do not edit the app repo from here):**

| # | Change | Why | Size |
|---|---|---|---|
| S1 | Apply 0015 → 0016 → 0017 (→ 0020 if decided) in the documented order, then test guest → email on a real phone | Live rule is 2 + 2 (0013); web promise is 1 + 1 (0016); locks/unlock need 0017; email-OTP path never tested | 3 h incl. test |
| S2 | Deploy `services/supabase-proxy` as `api.<domain>`; set `app_limits.trusted_proxy_worker`; fix Auth per-IP limits (raise, or `Sb-Forwarded-For` with an `sb_secret_` key used for `/auth/v1` only) | BUG-030 ISP block; without the fix every proxied user shares one IP → 30 anonymous sign-ins/hour for the whole site ([Supabase rate limits](https://supabase.com/docs/guides/auth/rate-limits)) | 2 h + owner decision |
| S3 | New function `web-gate` (verify_jwt on): POST `{token}` → `siteverify` with secret `TURNSTILE_SECRET`, `remoteip`, `idempotency_key`; accept only `hostname ∈ {<domain>, www.<domain>}` and `action = "reading"`; write `private.web_pass(user_id, expires_at)` | Turnstile tokens are single-use, valid 300 s, and must be checked server-side ([docs](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)) | 2 h |
| S4 | New RPC `start_web_reading(p_hand_side, p_is_dominant, p_idempotency_key)`: requires an unexpired pass, consumes new `app_usage_daily` kinds `web_guest_free` / `web_llm` against new `app_limits.web_guest_free_daily_cap` / `web_llm_daily_cap`, marks `reading_sessions.source = 'web'`, then runs the normal `start_reading` logic. App's `start_reading` unchanged | Keeps the web from using up the app's shared caps; separate kill switch | 2 h |
| S5 | Owner budget decision: raise `llm_daily_cap` (34/day total today) before any web launch | Otherwise the site stops after ~30 readings a day | decision |
| S6 | CORS: replace `*` with an allow-list (`https://<domain>`, `https://www.<domain>`) in the 4 browser-called functions (extract-palm :183-188, scan-palm :69-74, write-report :121-126, delete-account :34-39) + `web-gate`; keep `authorization, x-client-info, apikey, content-type` | Defence in depth (tokens are bearer, not cookies, so `*` is not an open door; the native app sends no Origin and is unaffected) | 0.5 h |
| S7 | Auth dashboard: Site URL `https://<domain>/`; Redirect URLs `https://<domain>/**` (+ `palmreadai://**` already planned); **do not** turn on project-wide captcha (the app's anonymous sign-in sends no token) | Site URL currently points at a page that does not exist | 0.25 h |
| S8 | Custom SMTP (Brevo, open decision #4), Confirm email ON, OTP email template with the code | Built-in email is limited to **2 emails per hour** | 1 h |
| S9 | App Links: set `APP_LINK_HOST`, add intent filters with **exact `path` entries** (`/heart-line` and `/heart-line/`, same under `/hi/`) instead of `pathPrefix` | `pathPrefix="/palm-reading"` would also capture `/palm-reading-pdf/`, and `/life-line` captures `/life-line/broken/` — the router refuses both and opens Home. Android 15+ can also exclude paths in `assetlinks.json` ([docs](https://developer.android.com/training/app-links/configure-assetlinks)) | 1 h + owner SHA-256 |
| S10 | Web funnel events: apply 0021 and let the site call `log_event_counts` (granted to `anon`) with `app_version = 'web'` | One place for counts, no cookies | 0.5 h |
| S11 | After the site is live: retire `web/` + `scripts/deploy-web.mjs` + `build-web*.mjs` (owner approval), point `EXPO_PUBLIC_WEB_BASE_URL` at the domain | One deployer per domain | 0.5 h |
| S12 | Later: Play Integrity in the app, then require "Turnstile pass OR Play Integrity verdict" for any guest free reading | The only way to make the guest free reading hard to farm on both paths | later |

### 3.7 Data and privacy (checked against the app's backend)

| Data | Where it lives | How long |
|---|---|---|
| Original photo | The user's device only | — |
| Downscaled copies (1080 px + 768 px JPEG, base64 in the request body) | Sent through `scan-palm` to Modal (USA) and through `extract-palm` to Cloudflare Workers AI; code comments: "not stored anywhere" / "passed through, never stored"; no Storage bucket exists | In transit only |
| Photo for showing the report | Browser IndexedDB on that device (never uploaded again) | Until the user deletes the reading or clears site data |
| Traced line points (≤100 per line), 21 hand landmarks, written observation | Supabase `palm_observations`, linked to the guest/email user id | Until the user deletes it or the account (cascade) |
| Report payload + matched rule ids; session meta (hand, status, charged_as) | Supabase `reading_reports`, `reading_sessions` | Same |
| Salted daily IP hash | `private.session_ip`, `guest_ip_daily` | ≤ 2 days |
| Normalised email hash + free readings used | `private.free_grants` | **Kept after deletion** (fraud prevention; already in privacy.html) |
| Token usage log | `private.llm_usage` (0016) | 180 days |
| Session tokens | Browser `localStorage` | Until sign-out / clearing |
| Turnstile signals | Cloudflare | Cloudflare policy |
| Page views, Web Vitals | Cloudflare Web Analytics, no cookies | Aggregated |
| Funnel counts | `log_event_counts` daily aggregates, no user id | Per 0021 |

The current `privacy.html` (:46, :72-73) says "No server keeps your palm photo … A small copy stays only on your phone, inside the app". Correct about the photo, but it is phone-only wording and **does not mention** the stored line coordinates and landmarks or the token log. Before the web reading goes live, add a "Website" section: photo sent for analysis (two sizes) to Modal (USA) and Cloudflare Workers AI through our server, not kept by any server; a copy stays in this browser; traced lines, landmarks and the reading text are saved to your guest account; Turnstile and Cloudflare Web Analytics (no cookies). The master plan's line "sent once for analysis" must become "sent for analysis, never stored on a server". Upload-point text (short): "Your photo is analysed by our server and not stored there. A copy stays on this device."

### 3.8 Security

- **Headers (`public/_headers`, all pages):** `Strict-Transport-Security: max-age=31536000; includeSubDomains`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` (the app's `no-referrer` hides our own UTM/referrer from Play and analytics; stricter is fine for `/reading/`, `/account/`, legal account pages), `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'`, `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()`. The camera rule stays: `<input type="file" accept="image/*" capture="environment">` opens the phone's camera app and is **not** blocked by `camera=()` (that rule only covers `getUserMedia`). Only a future live-camera guide would need `camera=(self)` on `/reading/`.
- **CSP:** Astro's built-in CSP (stable since 6.0) writes a `<meta>` with hashes of Astro's own scripts/styles per page ([config reference](https://docs.astro.build/en/reference/configuration-reference/)). Add directives: `default-src 'self'; img-src 'self' data: blob:; connect-src 'self' https://api.<domain> https://cloudflareinsights.com; script-src` + `https://challenges.cloudflare.com https://static.cloudflareinsights.com`; `frame-src https://challenges.cloudflare.com; worker-src 'self' blob:; object-src 'none'; base-uri 'none'; form-action 'self'`. `frame-ancestors` only works as a header, so it stays in `_headers`. No `unsafe-eval` (check heic-to/MediaPipe WASM needs `'wasm-unsafe-eval'` only on `/reading/`).
- **Secrets:** the site holds only public values (publishable key `sb_publishable_…` — Supabase deprecates legacy anon keys by the end of 2026 ([API keys](https://supabase.com/docs/guides/api/api-keys)); Turnstile site key; proxy URL). `TURNSTILE_SECRET` lives only in Supabase function secrets. Deploy token = Cloudflare API token scoped to this Worker. No `.env` values in git; Workers Builds variables for the build.
- **Abuse:** clearing storage creates a new guest. The limits that hold: Supabase 30 anonymous sign-ins/hour/IP (needs S2 behind the proxy), per-IP 6 guest-free/day, the new web daily cap (S4), max 3 scan/extraction claims per session, email ledger by normalised hash (gmail dots/`+tag` stripped, disposable domains get less). Turnstile raises the cost of scripting the web path but cannot close the app path (S12). Watch false blocks from Indian carrier-grade NAT (many users on one IP; BUG-024) and show an honest message.
- **Rate limits in front:** the proxy Worker can add the Workers Rate Limiting binding per IP on `/functions/v1/*` (Workers-only feature). The static site itself needs none.
- **XSS surface:** report text comes from our own rule set, rendered as React text (no `dangerouslySetInnerHTML`); MDX is author-controlled; no user-generated content on the site.

### 3.9 Performance budget

Targets at p75 on mobile (field data, Cloudflare Web Analytics RUM + CrUX later): **LCP ≤ 2.0 s** (Google "good" is 2.5 s), **INP ≤ 150 ms** (good is 200), **CLS ≤ 0.05** (good is 0.1) ([web.dev](https://web.dev/articles/vitals)).

| Page type | JS (gzip) | Other |
|---|---|---|
| Guides, blog, legal | **0 KB** of our JS (only the async Cloudflare beacon) | HTML ≤ 50 KB, CSS ≤ 20 KB, LCP image ≤ 80 KB |
| Tool pages (quiz/picker/map) | ≤ 70 KB (React + one island, hydrated on visible) | data slice ≤ 15 KB |
| Home | ≤ 75 KB (`UploadStart` only) | hero sample image ≤ 100 KB AVIF, `fetchpriority="high"` |
| `/reading/` | ≤ 180 KB initial (React, supabase-js, flow); knowledge/synthesis lazy after upload starts; Turnstile script from Cloudflare; heic-to only on HEIC failure | photo handled in a Worker-thread where possible |

- **Images:** Astro `<Picture>` (sharp at build) → AVIF + WebP, widths 480/960/1440, explicit width/height (CLS). Palm diagrams as inline SVG (sharp at any size, few KB, labels translatable to Hindi). Sample report photo: real, compressed, with the SVG overlay drawn by code.
- **User photos:** `createImageBitmap(file, { resizeWidth })` to avoid decoding 48 MP images at full size on low-end Android; one canvas pass to 1080 px (kept + scan), one to 768 px (extract), one to 96 px (quality check).
- **Fonts:** Astro Fonts API (stable) self-hosts and generates metric-matched fallbacks. Latin: one variable font, `latin` subset only, 1–2 files. Hindi: Noto Sans Devanagari or Mukta (both SIL OFL), `devanagari` subset only, 2 weights, loaded only on `/hi/` pages via `unicode-range`; body text can use the system font (Android already ships Noto Sans Devanagari), web font for headings only. `font-display: swap`.
- **Caching:** `/_astro/*` `Cache-Control: public, max-age=31536000, immutable`; HTML `max-age=0, must-revalidate` (Cloudflare edge still serves it fast).

### 3.10 Analytics without cookies

- Cloudflare Web Analytics: no cookies, no personal data, page views + RUM ([docs](https://developers.cloudflare.com/web-analytics/about/)). It has **no custom events**.
- Funnel events (reading started / photo check failed / reading finished / sign-up / second reading / store click) → batched to `log_event_counts` (S10) with `fetch(…, { keepalive: true })` on `pagehide`. Counts only, no user id, no cookie → no consent banner needed (still listed in the privacy page).
- Play installs by page: Play link `https://play.google.com/store/apps/details?id=com.palmreadai.app&referrer=utm_source%3Dweb%26utm_medium%3D<page>%26utm_campaign%3D<cta>` → Play Console acquisition report. Search Console + Bing Webmaster Tools for search.

### 3.11 OG images and search

- OG: astro-og-canvas at build, 1200×630 per page and locale, brand background + title; must pass a Hindi test (conjuncts like "हस्तरेखा", "ज्ञान") on day 1; fallback: Playwright screenshot script. Per-reading share cards are drawn in the browser (canvas → PNG → Web Share API / WhatsApp), not on a server.
- Search: not needed for ~30 pages. Add Pagefind when the blog passes ~40 posts (`data-pagefind-body` on main content, separate en/hi index).

### 3.12 Deployment, previews, rollback, legal pages

- **Repo + CI:** GitHub → Cloudflare Workers Builds (or a GitHub Action running `wrangler deploy` with a pinned wrangler version). Build: `astro check && vitest run && astro build && node scripts/check-site.mjs`.
- **Previews:** `wrangler versions upload --preview-alias <branch>` → `<branch>-palm-web.<account>.workers.dev` ([version URLs](https://developers.cloudflare.com/workers/configuration/previews/)). Preview builds set `PUBLIC_ENV=preview` → `<meta name="robots" content="noindex">` on every page, and the reading runs in **mock mode** (fixture observation, no backend) because the app has one Supabase project for dev and prod; a real-backend preview only behind Cloudflare Access.
- **Rollback:** `wrangler rollback` or dashboard (last 100 versions, [docs](https://developers.cloudflare.com/workers/configuration/versions-and-deployments/rollbacks/)). Practise once on day 1 and confirm the static assets roll back with the version.
- **Legal pages:** move `privacy`, `terms`, `delete-account`, `reset-password` from the app's `web/` into Astro pages with the shared layout, canonical `/privacy/` etc. Keep the old names working with `_redirects` (`/privacy.html /privacy/ 301`, same for the other three; browsers keep the `#…` part across redirects). Workers' default `html_handling` would otherwise send `/privacy.html` to `/privacy` with a 307 ([docs](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/)); test all eight variants in the preview. `delete-account` uses the site's bundled supabase-js instead of the jsDelivr CDN file. `reset-password.html`'s link flow is orphaned (the app now resets with a 6-digit code), so the page becomes "enter the code from the email" or a pointer to the app. `assetlinks.json` must be served with no redirect and `application/json` ([Android docs](https://developer.android.com/training/app-links/configure-assetlinks)).

---

## 4. Build plan and risks

### 4.1 Honest hours

Hours are focused build time with Claude doing the coding; owner time (review, Hindi reading, dashboard steps) is separate. P1 is about **27 hours**, which is 3 working days, not 1.

**Day 1 — static P1 site live (≈ 10 h):**

| Task | Hours |
|---|---|
| Scaffold Astro 7 + React + MDX + Tailwind 4 + sitemap + wrangler, CI to a preview URL | 1.0 |
| Design tokens, base layout, header/footer, language switch, SeoHead (canonical, hreflang, OG, JSON-LD), StoreButton + QR | 2.0 |
| Content schema + Guide layout (quick facts, variations, myth vs reality, photo tips, FAQ, limits box, sources, step n of 7, scan button) | 1.5 |
| Port `/palm-reading/`, `/hand-lines/`, 4 line pillars (EN + HI already exist in the app's `web/guides/content.mjs`; expand, add sources) | 2.5 |
| `/app/`, `/tools/` hub, legal pages moved + redirects + web privacy section draft | 1.5 |
| robots, llms.txt, sitemap check, OG images (EN + HI test), `check-site`, Lighthouse, deploy to domain, Search Console | 1.5 |

**Day 2 — tools + reading client (≈ 9 h):** sync script + copy `lib/palm` + parity tests (1.5) · image pipeline + photo check + `UploadStart` (1.5) · tools 3, 8, 9 (2.5) · `/is-palmistry-real/` + `/which-hand-to-read/` (2.0) · `/hi/` home + pillar review fixes (1.5).

**Day 3 — live reading (≈ 8 h, needs S1–S5, S7–S8 done in the app repo, ≈ 11 h there):** ReadingApp states + Turnstile + guest session + API calls + error screens (3.0) · report view with locks + SVG traced lines + IndexedDB + share card (2.5) · email code sign-up + second reading + 0-credit app hand-off (1.5) · real-phone test on Android Chrome (Jio) and iPhone Safari (1.0).

**Week 1 total (P2, ≈ 45 h beyond P1):** 10–12 P2 guides at ~1.5–2 h each with sources (20) · tools 2, 4–7, 10, 12 (10) · first 5 blog posts (7) · PDF lead magnet + opt-in (3) · India keyword pass + internal links (2) · Hindi versions of tools hub/tools (3).

### 4.2 Top 10 technical risks

| # | Risk | Mitigation |
|---|---|---|
| 1 | `*.supabase.co` blocked by Indian ISPs (BUG-030) → the web reading fails for many Indian visitors | Site only ever calls `api.<domain>` (the app's proxy Worker, S2); test on Jio and Airtel mobile data before launch |
| 2 | The proxy makes every user one IP → Supabase Auth 30 anonymous sign-ins/hour for the whole site, one shared per-IP guest bucket | `trusted_proxy_worker` (0016) + Auth limits raised or `Sb-Forwarded-For` for `/auth/v1` only (S2) |
| 3 | Free-reading rules not what the web promises (live 2 + 2; 0016/0017 unapplied; email-OTP path untested) | Apply and test S1 before any web copy says "1 free + 1 after sign-up"; read `reading_balance()` for all copy instead of hard-coding numbers |
| 4 | Web traffic uses up the app's shared daily caps (34 LLM calls/day) | Separate web caps + kill switch (S4), owner budget (S5), show "today's free readings are used up, try tomorrow or use the app" |
| 5 | Farming free readings (clear storage, scripts) | Turnstile + web pass, per-IP and daily caps, email hash ledger, monitoring `app_usage_daily`; Play Integrity later (S12) |
| 6 | App Links over-match (`/palm-reading-pdf/`, `/life-line/broken/` open the app's Home) or fail verification | Exact `path` entries (S9), rename to `/palmistry-pdf/`, `assetlinks.json` with no redirect and real fingerprints only |
| 7 | Privacy wording does not match reality (photo sent twice, coordinates stored, browser copy, Turnstile) → DPDP/Play risk | Web section in the privacy page (3.7) reviewed before the reading goes live; upload-point text taken from it |
| 8 | Copied `lib/palm` drifts from the app → web and app give different readings | Sync script with commit hash + sha256, parity tests from the app, show `ruleSetVersion`; re-sync on every app rule change |
| 9 | Photo problems on real devices: HEIC from desktop, huge images crashing low-end Android tabs, EXIF rotation, slow 4G uploads (two uploads per reading) | `createImageBitmap` with resize, early downscale, HEIC fallback (LGPL decision) or a clear message, progress UI, retry with the same idempotency key |
| 10 | Hindi quality and SEO: broken Devanagari in OG images, one-sided hreflang, machine-translated thin pages (Google scaled-content policy) | Hindi OG test, `check-site` hreflang lint, publish `/hi/` pages only after the owner reads them, fewer strong pages over many thin ones ([Google spam policies](https://developers.google.com/search/docs/essentials/spam-policies)) |

Also watch: Astro 7 is three months old (pin versions); the app uses one Supabase project for dev and prod (previews in mock mode); Google sign-in on web is not day 1.

### 4.3 Owner decisions this file adds

1. Hosting on Cloudflare Workers (not Pages) — recommended.
2. Budget: raise the shared daily LLM cap and set a web cap (S4/S5).
3. Proxy client-IP option for Supabase Auth (raise limits vs `Sb-Forwarded-For` + secret key in the Worker).
4. HEIC fallback: allow the LGPL `heic-to` file (lazy-loaded, unmodified) or show "upload a JPG".
5. Rename `/palm-reading-pdf/` → `/palmistry-pdf/`.

## Sources

Framework and hosting: [Astro 6](https://astro.build/blog/astro-6/) · [Astro 7](https://astro.build/blog/astro-7/) · [InfoQ Astro 7](https://www.infoq.com/news/2026/08/astro-7-release-speed/) · [Astro 7 breaking changes](https://morello.dev/blog/astro-7) · [Astro Cloudflare adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/) · [Astro i18n](https://docs.astro.build/en/guides/internationalization/) · [Astro sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/) · [Astro config (CSP, fonts)](https://docs.astro.build/en/reference/configuration-reference/) · [Cloudflare acquires Astro](https://www.cloudflare.com/press/press-releases/2026/cloudflare-acquires-astro-to-accelerate-the-future-of-high-performance-web-development/) · [Pages → Workers](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/) · [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) · [HTML handling](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/) · [Version URLs](https://developers.cloudflare.com/workers/configuration/previews/) · [Rollbacks](https://developers.cloudflare.com/workers/configuration/versions-and-deployments/rollbacks/) · [OpenNext Cloudflare](https://opennext.js.org/cloudflare) · [Next.js across platforms](https://nextjs.org/blog/nextjs-across-platforms) · [SvelteKit adapter-cloudflare](https://svelte.dev/docs/kit/adapter-cloudflare).
Backend and security: [Turnstile server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/) · [Turnstile widget](https://developers.cloudflare.com/turnstile/concepts/widget/) · [Supabase anonymous sign-ins](https://supabase.com/docs/guides/auth/auth-anonymous) · [Supabase rate limits](https://supabase.com/docs/guides/auth/rate-limits) · [Supabase redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls) · [Supabase function CORS](https://supabase.com/docs/guides/functions/cors) · [Supabase API keys](https://supabase.com/docs/guides/api/api-keys) · [Supabase custom domains](https://supabase.com/docs/guides/platform/custom-domains) · [Android assetlinks](https://developer.android.com/training/app-links/configure-assetlinks).
Performance, search, images: [Core Web Vitals](https://web.dev/articles/vitals) · [Cloudflare Web Analytics](https://developers.cloudflare.com/web-analytics/about/) · [Pagefind multilingual](https://pagefind.app/docs/multilingual/) · [Google spam policies](https://developers.google.com/search/docs/essentials/spam-policies) · [WebKit Safari 17](https://webkit.org/blog/14445/webkit-features-in-safari-17-0/) · [MDN createImageBitmap](https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap) · [Safari HEIC accept issue](https://developer.apple.com/forums/thread/743049) · [Satori Devanagari issue](https://github.com/vercel/satori/issues/516).
Versions: npm registry (`registry.npmjs.org/<package>`), GitHub REST API, 2026-09-26.
App repo facts (read-only): `supabase/functions/{scan-palm,extract-palm,write-report,delete-account}/index.ts`, `supabase/migrations/0013_free_readings_and_limits.sql`, `0014`, `0016`, `0017`, `0021`, `src/app/analysing.tsx`, `src/features/{reading,knowledge,vision,quality,deep-report,links}/*`, `services/supabase-proxy/README.md`, `web/{privacy.html,_headers,site.config.json}`, `scripts/{build-web,deploy-web}.mjs`, `PROJECT_MASTER.md` (BUG-030, DEC-036, DEC-038, FEAT-013, FEAT-019).
