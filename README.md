# PalmSays website (palmsays.com)

The public website for the Palm Read AI Android app: Astro 7 static pages, React 19 islands (none shipped yet), MDX, Tailwind 4, on Cloudflare Workers static assets. Project status and rules: `PROJECT_MASTER.md` and `CLAUDE.md`. Architecture: `ARCHITECTURE.md`.

## Commands

Run these in PowerShell. The owner's PowerShell blocks `npm.ps1`/`npx.ps1`, so always use `npm.cmd` / `npx.cmd`.

```
cd "D:\palm ai\palm-ai-website"
npm.cmd install            # first time only
npm.cmd run dev            # local dev server, http://localhost:4321/
npm.cmd run build          # static build into dist\
npm.cmd run preview        # serve dist\ locally
npm.cmd run check          # astro check (TypeScript + Astro diagnostics)
npm.cmd run lint           # ESLint
npm.cmd run test           # Vitest unit tests
npm.cmd run check:web      # validates dist\ (same script as check:site)
npm.cmd run shots          # screenshots of /, /hi/, /app/ into qa\shots\<date>-<branch>\
npm.cmd run gate           # check, lint, test, build, check:web in order; stops at the first failure
```

`npm.cmd run shots` needs a build first and uses the installed Google Chrome (via `research-tools\`). Extra paths: `npm.cmd run shots -- /hi/app/ /404.html`.

## Build modes

- Default build = **preview**: every page is `noindex`, and the legal pages show visible placeholders for missing company details.
- Production build: set `PUBLIC_ENV=production` (Workers Builds does this). It **fails on purpose** until `company.name` and `company.email` are filled in `src/config/site.ts` and `PUBLIC_SUPABASE_URL` + `PUBLIC_SUPABASE_PUBLISHABLE_KEY` are set (see `.env.example`). Only public values ever go in env or `site.ts`.

## Where things live

| Path | What |
|---|---|
| `src/config/site.ts` | The one config: brand, base URL, Play package, prices, flags (`webReadingEnabled`), SHA-256 list |
| `src/config/pages.ts` | Registry of every page: indexable, sitemap group, hreflang twin. Sitemaps, hreflang, nav and `check:web` read it |
| `src/i18n/en.ts`, `hi.ts` | UI strings (typed; Hindi must have every English key) |
| `src/components/` | Layout pieces: Header, Footer, PalmTrace, StoreButton, QrCode, LockedCard, Chip, Breadcrumbs … |
| `src/legal/*.html` | The four legal pages copied from the app repo; served at the frozen `.html` URLs |
| `src/pages/` | Routes, including `robots.txt`, `llms.txt`, sitemaps and `/.well-known/assetlinks.json` |
| `public/_headers` | Security headers for Cloudflare |
| `scripts/check-web.mjs` | Post-build site validation |
| `scripts/make-images.mjs` | Re-renders the share images, logo and touch icon |
| `wrangler.jsonc` | Cloudflare Workers static-assets config (no deploy from here) |

## Deploy

Not set up to deploy from this machine. The release gate (`QA_RELEASE.md`, skill `release-gate`) must pass first; the owner runs the deploy.
