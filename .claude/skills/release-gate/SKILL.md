---
name: release-gate
description: Use before any deploy (preview or production), any merge to main, and before any "is it done?", "it works", "ready to ship" or status-raising claim on the PalmSays website. Runs the QA_RELEASE.md checklist at the right level, blocks on any failure, and reports the evidence. Never claim done without it.
---

# Release gate (palmsays.com)

The checklist itself lives in `QA_RELEASE.md` (source of truth). This skill is how to run it. No step may be skipped silently: a check that cannot run is reported as **NOT RUN** with the reason, and the result is then **BLOCKED**, not PASS.

## 1. Pick the level

- **A — every change** (code, content, config): checks 1–5.
- **B — anything users see** (pages, UI, tools, copy, reading flow): A + checks 6–8 + content checks for the touched pages.
- **C — production release**: A + B for the whole site + check 9 + the phone matrix (if the reading, sign-up, App Links or legal pages changed) + owner OK + post-deploy checks.

When unsure, use the higher level.

## 2. Run the automated checks

From `D:\palm ai\palm-ai-website`, with `npm.cmd` / `npx.cmd`. Batch them into one command so the owner sees no stream of prompts, and stop at the first failure:

```
npm.cmd run check && npm.cmd run lint && npm.cmd run test && npm.cmd run build && npm.cmd run check:site
```
Level B adds: `npm.cmd run test:e2e` and `npm.cmd run lhci`. (`npm.cmd run gate` runs all of them.)

If a script does not exist yet (before WEB-FEAT-001/016), report NOT RUN — do not substitute a weaker check and call it a pass.

## 3. Look at the evidence yourself

- Open the Playwright screenshots (or take them with `research-tools/shot.mjs`, see `QA_RELEASE.md` §2.1) for every touched page, mobile and desktop. Check: one gold button, no horizontal scroll, nothing clipped, Devanagari intact, store button with its price line.
- Compare the JS/CSS/HTML sizes with the budgets in `QA_RELEASE.md` §2.3.

## 4. Content checks (level B/C, per touched page)

Go through `QA_RELEASE.md` §4: honesty (no fake numbers, reviews or timers), "free" qualified + price next to every store button, no predictions, privacy copy word-for-word from `SECURITY_PRIVACY.md` §2 with its [verify] items closed, sources, no dark patterns, Hindi read by the owner/reviewer, owner OK on sensitive topics.

## 5. Frozen contracts (every level)

Confirm nothing in `ARCHITECTURE.md` §11 changed: App Link pages (F1), `assetlinks.json` (F2), legal `.html` 301s (F3), server-owned free rule (F4), URL rules — no removed or renamed URL without a 301 + sitemap update (F5), API contract (F6), `lib/palm` copy untouched by hand (F7), noindex rules (F8). If one changed on purpose, there must be a new WEB-DEC row with owner OK; otherwise **BLOCK**.

## 6. Decide

- **PASS** only if every required check ran and passed.
- **BLOCKED** if anything failed or did not run. Fix the cause and rerun the failed check (and anything it could affect). Never weaken a check, lower a budget or add an exception to make it pass without a WEB-DEC row and owner OK.
- Production (level C) also needs the owner's explicit go. Claude cannot `git push`; hand the owner the exact command with the project folder.

## 7. Report (short, evidence first)

```
Gate level: B
1 check      PASS
2 lint       PASS
3 test       PASS (212 tests)
4 build      PASS
5 check:site PASS
6 e2e        PASS — screenshots: qa/shots/2026-10-01-feat-home/
7 a11y       PASS (0 serious)
8 lhci       FAIL — home JS 64 KB > 60 KB budget
Frozen contracts: unchanged
Content: n/a
Result: BLOCKED (8)
```
Tell the owner the result in 1–2 short Hinglish lines; keep the table for the handoff.

## 8. After a PASS

- Update `PROJECT_MASTER.md` in the same turn: feature status from evidence (code + passing checks but no phone/owner test = "IMPLEMENTED — NOT VERIFIED"), evidence paths, handoff.
- After a production deploy: run the post-deploy checks (`QA_RELEASE.md` §8) and add a release-log row (§9). If any post-deploy check fails, roll back (§7) and add a WEB-BUG row.
