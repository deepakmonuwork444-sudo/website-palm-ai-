# PalmSays website (palmsays.com) — CLAUDE.md

> **What this is:** the entry point for every session in this folder: what the project is, what to read first, which doc and skill to use for what, and the rules that must never break.
> **When to read it:** it is auto-loaded. Follow "Start of every session" before doing anything else.

## The project

- Public website for the Palm Read AI Android app (brand on the web: **PalmSays**, domain **palmsays.com**): a free web palm reading on the home page, honest guides, 12 free tools, a blog, and Play Store conversion. No payments on the website.
- This folder (`D:\palm ai\palm-ai-website`) is a **separate project** from the app repo (`D:\palm ai\palm-ai-new--feat-m1-foundation`). Never mix code between them. The app repo may be **read** for facts; it is never edited from here.
- Server work the website needs (CORS, Auth redirects, web-only Turnstile function, web daily cap, proxy Worker, App Links, event allow-list) is specified as WEB-SRV rows in `PROJECT_MASTER.md` §4 (plan §8.7) and is done **in the app repo**, in its own session, following that repo's `PROJECT_MASTER.md` workflow.
- No code yet. The next build session scaffolds Astro (WEB-FEAT-001) and runs `git init` then.

## Start of every session

1. Read **`PROJECT_MASTER.md`** first (status, next exact action, handoff).
2. Find the task's ID (WEB-FEAT / WEB-SRV / WEB-BUG / WEB-DEC). Read **only** the docs the task needs (doc map below) and load the matching skill(s).
3. Check what already exists before building anything (never rebuild from memory).
4. New feature or redesign → plan in chat (not the Plan Mode tool), then ask the owner for OK before coding. Small bug fixes the owner asks for right away are not features.
5. Before any merge, deploy or "done" → the `release-gate` skill.
6. After meaningful work → update the affected rows of `PROJECT_MASTER.md` (and `DECISIONS.md` if a decision was made) **in the same turn**. This is Claude's job every session; the owner should not have to ask.

## Doc map

| File | Source of truth for | Read when |
|---|---|---|
| `PROJECT_MASTER.md` | Status, features, server items, bugs, next action, handoff | Always first |
| `DECISIONS.md` | All decisions (WEB-DEC), rejected options, open questions | Before changing anything decided |
| `ARCHITECTURE.md` | Stack + versions, folders, routes, config, i18n, deploy, **frozen contracts** | Code, routes, URLs, config, deploy |
| `SECURITY_PRIVACY.md` | Data flow, **allowed privacy sentences**, CSP, secrets, abuse limits, incidents | Reading flow, privacy copy, headers, user data |
| `QA_RELEASE.md` | The "never breaks" gate, deploy, rollback, release log | Before merge/deploy/"done" |
| `OWNER_GUIDE.md` | The owner's manual steps (Hinglish) | When the owner must act |
| `DESIGN_SYSTEM.md` | Tokens, fonts, components, look | UI work |
| `UX_PSYCHOLOGY.md` | Funnel psychology, trust, copy tone | UX, copy, conversion |
| `SEO_PLAYBOOK.md` | Technical + on-page SEO | Any indexable page |
| `CONTENT_GUIDE.md` | Writing rules, honesty, review workflow | Guides, blog, tool content |
| `KEYWORD_MAP.md` | Keyword + slug per page | Before creating any page or URL |
| `WEBSITE_MASTER_PLAN.md` | Plan v2 — background, the "why" (docs cite its §) | Only for the section a doc points to |
| `research/01–11` | Evidence behind the plan | Only when a doc points there |

## Skills (`.claude/skills/`)

| Skill | Use it when |
|---|---|
| `frontend-design` | Designing new UI or reshaping existing UI so it looks intentional, not templated |
| `palmsays-ui` | Building or changing any PalmSays page, component, style, token, font, image, diagram or animation (applies `DESIGN_SYSTEM.md`) |
| `ux-conversion` | Flows, CTAs, button labels, free-reading/lock/credits messaging, sign-up sheet, store buttons + price lines, `/app/`, empty/zero states, errors (applies `UX_PSYCHOLOGY.md`) |
| `seo-page` | Creating or changing any indexable page: title, meta, headings, schema, canonical/hreflang, internal links, sitemap (applies `SEO_PLAYBOOK.md` + `KEYWORD_MAP.md`) |
| `content-writer` | Writing or editing guides, blog posts, tool content, FAQs — English or Hindi (applies `CONTENT_GUIDE.md`) |
| `tool-page` | Building or changing any of the 12 tool pages (tool + real content under it) |
| `web-reading-flow` | The reading flow, credits, sign-up, Supabase/proxy calls, Turnstile, account/delete pages, privacy copy |
| `release-gate` | Before any deploy, merge or "is it done?" claim |
| `supabase` | Any Supabase question (Auth, RPC, functions, logs). From here: read and write specs only — changes happen in the app repo |
| `supabase-postgres-best-practices` | Writing SQL, schema or RLS specs for the app repo (applied there, never from here) |

The app repo has its own skills (`palm-knowledge-engine`, `palm-vision-benchmark`, `production-gate`); they belong to that repo's sessions.

## Fixed decisions (details and reasons: `DECISIONS.md`)

- Brand **PalmSays**, domain `palmsays.com` (owner, 2026-09-26); brand and base URL live only in `src/config/site.ts`.
- Astro 7 static pages + React 19 islands + MDX + Tailwind 4, on **Cloudflare Workers** (not Pages). Backend only through `api.palmsays.com` (the app's proxy Worker).
- Design Direction A "Nakshatra Night Web": indigo #0B0A1F, temple gold #E6B85C, ivory #F6F0E1; Cormorant Garamond (English display), Tiro Devanagari Hindi (Hindi display), Mukta (body, both scripts). **Dark by default with a Day toggle.**
- **All 12 tools** get their own standalone page with real content under the tool; the matching guide links to the tool (no second embedded copy).
- Web reading: reading 1 free as a guest; reading 2 after email sign-up (a **new** reading, not an unlock); then 0 → the app. The free report shows Love + Personality in full, Career & Money + Life Direction as a one-line preview — the same as the app.
- Author: Deepak Chauhan (details pending). Honest guides for marriage, children and lifespan.
- Owner says SQL 0016/0017/0019/0020/0021 are applied — **not verified**; verify the free rule (1 + 1) and the web cap before building the live reading.

## NEVER

- **Never edit the app repo from here.** Write the needed change as a WEB-SRV spec in `PROJECT_MASTER.md` §4.
- **Never break a frozen contract** (`ARCHITECTURE.md` §11): App Link exact paths, `assetlinks.json`, the legal `.html` URLs (`privacy.html`, `terms.html`, `delete-account.html`, `reset-password.html`), the server-owned free rule, the backend API contract, the `lib/palm` copy, the noindex rules.
- **Never change or remove a published URL** without a 301 and a sitemap update in the same release.
- **Never deploy, merge or say "done"** without the `release-gate` skill passing with evidence.
- **Never put secrets in client code or git** (`TURNSTILE_SECRET`, `sb_secret_…`, `service_role`, Modal keys, SMTP, deploy tokens). Client code reads only `PUBLIC_*` env vars and `site.ts`.
- **Never turn on Supabase Auth's project-wide captcha** — Turnstile is checked only in the web-only `web-gate` function (the global setting breaks the app).
- **Never make a fake claim:** no fake counters, countdowns, struck prices, invented reviews, ratings or download numbers; the app's price sits next to every store button; "free" is always qualified; no marriage-date, children-count, lifespan, health, divorce or money predictions (guides explain the tradition and its limits).
- **Never write privacy copy that doesn't match the backend:** the photo goes to Modal (USA) and Cloudflare Workers AI; traced line points and landmarks are stored. Use the sentences in `SECURITY_PRIVACY.md` §2 only.
- **Never publish a Hindi page** the owner or the Hindi reviewer has not read.
- **Git:** `git init` at the scaffold; work on feature branches, never directly on `main`; commit or push only when the owner asks (`git push` is blocked for Claude — the owner runs it).
- **Never skip the doc update:** keep `PROJECT_MASTER.md` current in the same turn as the work; status comes from evidence (code without a passing check = "IMPLEMENTED — NOT VERIFIED").

## How the owner works

- Replies: short, simple **Hinglish**, everyday words, no jargon, no long tables or recaps in chat.
- New features: plan in chat → review it twice → owner OK → then code. Never the Plan Mode tool (it resets the owner's auto-accept).
- No permission prompts: batch tool calls, combine steps into one command, prefer Read/Edit/Grep/Glob over shell, don't prefix commands with `cd`.
- Commands handed to the owner always show the project folder and use `npm.cmd` / `npx.cmd` (their PowerShell blocks `npm.ps1`/`npx.ps1`).
- Act as the tester: find and fix real user-flow bugs yourself; for multi-step work, finish everything and hand over **one** combined phone test sheet at the end.
- Don't break what works: change only what the task asked for.
- Never run anything that could harm the laptop, Windows, files or security; stay inside the project.
