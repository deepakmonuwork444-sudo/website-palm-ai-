---
name: web-reading-flow
description: Use when building or changing the web palm-reading flow, credits, sign-up, Supabase/proxy calls, Turnstile or privacy copy on palmsays.com — the home upload starter, /reading/ (ReadingApp), the report view and locks, email-code sign-up, reading 2, the zero-readings state and app hand-off, /account/ and /delete-account/, reading_balance or any free-reading number. Keeps the server-owned free rule, the privacy wording and the backend contract from breaking.
---

# Web reading flow (palmsays.com)

Background and full detail: `ARCHITECTURE.md` §7 + §11 (frozen contracts), `SECURITY_PRIVACY.md` §1–3 + §7, `WEBSITE_MASTER_PLAN.md` §7.9 and §8.1–8.7. Status and server items: `PROJECT_MASTER.md` §3–4.

## Invariants — never break these

1. **The server owns the free rule.** Reading 1 free as a guest, reading 2 after email sign-up, then 0. The website never counts readings itself: it reads `rpc reading_balance()` and reacts to 402/403. Static copy takes its numbers from `site.ts`; never type a number into a page.
2. **Sign-up gives a new reading, not an unlock.** Reading 1's locked parts stay locked; the sign-up sheet says so in plain words. Never call `unlock_reading` from the web.
3. **The report is built in the browser** with the copied app code: `buildEvidence → synthesise → buildReading → lockSynthesis` (app DEC-038). Love + Personality in full; Career & Money + Life Direction show only their first sentence. Locked text is **dropped before rendering** — never in the DOM, never blurred.
4. **Only `https://api.palmsays.com`.** Never `*.supabase.co` (blocked by Indian ISPs). Every function call sends `apikey: <publishable key>` + `Authorization: Bearer <access token>`.
5. **Turnstile only through `web-gate`.** Never enable Supabase Auth's project-wide captcha (it breaks the app's anonymous sign-in). `auth.signInAnonymously()` runs only after a photo is picked, never on page load; reuse an existing session.
6. **Start through the web cap.** Always `rpc start_web_reading(hand, dominant, idempotency_key)`, never the app's `start_reading` directly. 429 `daily_capacity_reached` shows the honest "used up today" message.
7. **Photo handling.** `createImageBitmap(file, { resizeWidth })` → canvas re-encode (drops EXIF/GPS) → only the 1,080 px (scan) and 768 px (extract) copies leave the device; 96 px for the local check. The original never leaves. `accept="image/*"`, `capture="environment"` on the camera button, never `image/heic` in `accept`.
8. **Privacy copy is word-for-word from `SECURITY_PRIVACY.md` §2.** Never "sent once", "never stored", "we keep nothing", "deleted right after". Line points and landmarks **are** stored — say so.
9. **A failed or unclear photo never uses a reading.** The local check blocks before anything is sent; 422 and 503 are refunded by the server; one idempotency key per photo, reused on retry, so two tabs or a retry never double-charge.
10. **Only real progress.** Stages: Photo checked → Sending securely → Tracing your lines → Lines found (lines draw from the real scan) → Reading your palm → Writing your reading → Done. No per-line ticks during the wait, no timer bars. "Usually about {p50} seconds" only once `readingTimeP50` is measured.
11. **No payments on the web.** Every store button shows the app's price line; desktop gets a QR; iPhone gets the honest note, never an App Store badge.
12. **`src/lib/reading/palm/` is a copy** (WEB-DEC-037). Never edit it by hand; re-run `npm.cmd run sync:palm` (after `npm.cmd test` in the app repo, so the golden reading is refreshed too).
13. **Previews run in mock mode** (`PUBLIC_READING_MODE=mock`, a stored real result). The live backend is used only on production or behind Cloudflare Access.

## States

idle → picked → checking (local) → review (pass / fail with reason) → gating (Turnstile, session, web pass) → scanning → lines drawn → reading (extract) → writing → **revealed 1** → lock sheet / sign-up sheet → code sent → verified → notice before the last free reading → (2–9 again, other hand suggested) → **revealed 2** → **zero readings**.
Returning visitor: opens at "revealed" (IndexedDB) or "zero" (server balance). Errors can happen from "gating" on.

## Errors (plan §8.3 has the EN + HI copy)

| Case | UI | Reading used? |
|---|---|---|
| Local check fails (dark, blurry, small, tilted) | Specific fix + Retake | No (nothing sent) |
| HEIC won't decode | "Take a new photo or upload a JPG" (D15) | No |
| No camera / blocked | Gallery + "easier on your phone" QR | No |
| In-app browser (WhatsApp, Instagram, Facebook) | "Open in Chrome" + copy link | No |
| Turnstile fails | "Quick safety check didn't complete" + retry | No |
| 402 `no_readings_left` | Zero-readings state | — |
| 403 `needs_email_verification` | "Enter the 6-digit code" | No |
| 409 `invalid_session` | Restart session silently; then generic error | No |
| 413 | Shrink again, retry once automatically | No |
| 422 `not_a_palm` | "We couldn't find a palm…" | No (refunded) |
| 429 `daily_capacity_reached` | "Today's free readings on the website are used up… or continue in the app" | No |
| 429 `too_many_attempts` / `rate_limited` | "Too many tries from this network…" (shared mobile IPs) | No |
| 503 `scanner_unavailable` | "Our line scanner is busy…" | No (refunded) |
| Offline mid-reading | "You're offline…" then retry with the same key | No |
| Email already has an account | "Sign in with a code instead"; reading 1 stays in this browser | That account's balance [verify] |

## Build steps (in order)

1. Confirm WEB-SRV-001 (free rule 1 + 1 verified on the live project) — until then build against mock mode only (WEB-DEC-009).
2. `lib/web/api.ts`: one client for the proxy, typed error codes, idempotency keys, retry rules.
3. `lib/web/image.ts` + `quality.ts`: decode, resize, EXIF strip, local check with the app's metrics.
4. `ReadingApp` island (`client:only`): the state machine above; one island for the whole flow.
5. Turnstile widget (managed, action `reading`) + anonymous session + `web-gate` + `start_web_reading`.
6. `scan-palm` → draw lines as SVG in the photo's own coordinates (`stroke-dasharray`); missing line = dashed "not clearly seen" chip.
7. `extract-palm` → rule engine loaded with `import()` only after the upload starts → report + locks.
8. Save `palm_observations`, `reading_reports`, `complete_reading`; save {photo, observation, report} in IndexedDB.
9. Lock sheet, sign-up sheet (`updateUser({email})` → `verifyOtp('email_change')`), reading 2, zero state, store hand-off with UTM referrer.
10. `/account/` (balance, delete via `delete-account`, sign out) and `/delete-account/`.
11. Funnel events (only names on the server allow-list, no personal data).

## Needs app-repo work first (do it there, not here)

S1 verify migrations + phone test · S2 proxy at `api.palmsays.com` + IP fix · S3 `web-gate` · S4 `start_web_reading` + web caps (+ `lines_only` for tool 2) · S5 budget · S6 CORS allow-list · S7 Auth Site URL/redirects · S8 SMTP + OTP template · S10 web events on the 0021 allow-list. Status: `PROJECT_MASTER.md` §4. If a server change is needed that is not listed, write it as a spec in `PROJECT_MASTER.md` §4 and stop — never edit the app repo from here.

## Tests to write

- **Unit (Vitest):** state machine transitions; every error code → the right state and copy; idempotency key reused on retry and shared across two tabs; locked text absent from the rendered output; numbers come from `site.ts`/balance, not literals; image pipeline strips EXIF (GPS-tagged fixture) and hits 1,080/768/96 px; `lib/palm` parity tests from the app.
- **E2E (Playwright, mock mode, mobile + desktop):** home → pick photo → review → reading 1 revealed → lock sheet → sign-up → reading 2 → zero state → store button with price; HEIC error; in-app browser notice; returning visitor from IndexedDB; `/account/` delete.
- **Contract:** fixture responses for each backend error code match `ARCHITECTURE.md` §11 F6.
- **Phone matrix before launch:** `QA_RELEASE.md` §5 (Jio, Airtel, iPhone Safari, WhatsApp in-app, desktop QR).

## Before saying "done"

Run the `release-gate` skill. Update the WEB-FEAT rows (status from evidence) and the handoff in `PROJECT_MASTER.md` in the same turn.
