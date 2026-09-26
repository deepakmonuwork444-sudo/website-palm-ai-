# PalmSays website — Security and privacy

> **What this is:** where every piece of user data goes, the exact privacy sentences we are allowed to show, what must be verified first, headers and CSP, secrets, abuse limits, Turnstile, analytics, legal notes and incident steps.
> **When to read it:** before touching the reading flow, sign-up, account pages, privacy/legal copy, headers, analytics or anything that handles user data. It is the **source of truth for security and privacy**; `WEBSITE_MASTER_PLAN.md` §8.4–8.6, §12.7, §12.9 and `research/09` §3.7–3.8, `research/10` §3.4, §4, §9 are the background.

**Golden rule:** every privacy or trust sentence on the site must be true on the day it ships. If a [verify] item fails, change the product or drop the sentence — never ship the sentence and hope.

---

## 1. What data goes where

| Data | Where it goes | How long | Notes |
|---|---|---|---|
| Original photo | The user's device only | — | Never uploaded at full size |
| Two smaller copies (1,080 px, 768 px, base64) | In transit through `api.palmsays.com` → `scan-palm` → **Modal (USA)** (line tracing) and → `extract-palm` → **Cloudflare Workers AI** (observation) | In transit only; no storage bucket exists | App code says "not stored anywhere". [verify] Modal and Workers AI keep no copies or logs |
| EXIF (incl. GPS) | Removed in the browser by the canvas re-encode before anything is sent | — | Test with a GPS-tagged photo |
| Photo used to show the reading | This browser's **IndexedDB** (with the observation and report) | Until the user removes it or clears site data | Never uploaded again; not moved to the app |
| Traced line points (≤ 100 per line), 21 hand landmarks, written observation | Supabase `palm_observations`, linked to the guest or email user | Until the user deletes it or the account (cascade) | **Stored** — the copy must say so |
| Report + matched rule IDs; session details (hand, status, how it was charged) | Supabase `reading_reports`, `reading_sessions` | Same | |
| Salted daily IP code | `private.session_ip`, `guest_ip_daily` | ≤ 2 days | Abuse limits |
| One-way email code + free readings used | `private.free_grants` | **Kept after account deletion** (fraud prevention) | Must be stated |
| Token-usage log | `private.llm_usage` (0016) | 180 days | |
| Session token | Browser `localStorage` | Until sign-out or clearing | |
| Theme (Day/Night), language choice, install-banner dismissal | Browser `localStorage` | Until clearing | Not personal data |
| Turnstile signals | Cloudflare | Cloudflare's policy | |
| Page views, Web Vitals | Cloudflare Web Analytics, no cookies | Aggregated | |
| Funnel counts | `log_event_counts` daily totals, no user ID | Per migration 0021 | Web events need S10 |
| Email address (after sign-up) | Supabase Auth; the email provider sends the code (S8) | Until account deletion | Only account email until an opt-in list exists |

**Processors to name on `/privacy/`:** Modal (USA) — line tracing; Cloudflare — hosting, proxy, Workers AI, Turnstile, Web Analytics; Supabase — database and sign-in; the email provider once chosen (e.g. Brevo, S8).

## 2. Privacy sentences we may show (exact wording)

Use these as written. Changing the meaning needs a check against §1 and an update here first.

**Upload line (home, reading page)**
- EN: "We analyse your photo and don't store it on any server. A copy stays on this device. *What happens to my photo?*"
- HI: "हम आपकी फ़ोटो जांचते हैं, पर किसी सर्वर पर सेव नहीं करते। एक कॉपी सिर्फ़ इसी डिवाइस पर रहती है। *मेरी फ़ोटो का क्या होता है?*"
- Must be true: [verify] both providers keep nothing.

**"What happens to my photo?" panel** (opens in place; the same text is on `/privacy/#website`)

| # | English | Hindi |
|---|---|---|
| 1 | Before anything is sent, your browser makes the photo smaller and removes hidden data such as your location. | कुछ भी भेजने से पहले आपका ब्राउज़र फ़ोटो छोटी करता है और उसमें छिपी जानकारी (जैसे लोकेशन) हटा देता है। |
| 2 | Two small copies go through our server to two services. Modal (USA) traces your lines. Cloudflare Workers AI reads your palm's features. Neither stores the photo. [verify] | फ़ोटो की दो छोटी कॉपी हमारे सर्वर से होकर दो सेवाओं तक जाती हैं: Modal (अमेरिका) आपकी रेखाएं बनाता है, Cloudflare Workers AI हथेली की बनावट पढ़ता है। दोनों में से कोई फ़ोटो सेव नहीं करता। |
| 3 | We save your traced line points, 21 points that mark your hand's shape, and your written reading to your account — not the photo. You can delete them any time on the Account page. [verify guest deletion] | हम आपके अकाउंट में रेखाओं के बिंदु, हाथ की बनावट के 21 बिंदु और आपकी लिखी रीडिंग सेव करते हैं — फ़ोटो नहीं। इन्हें आप कभी भी Account पेज से हटा सकते हैं। |
| 4 | A copy of the photo stays in this browser so you can see your reading again. Clearing browser data removes it. | फ़ोटो की एक कॉपी इसी ब्राउज़र में रहती है ताकि आप अपनी रीडिंग दोबारा देख सकें। ब्राउज़र का डेटा साफ़ करने पर यह हट जाती है। |
| 5 | If you sign up, we keep a one-way code of your email so the free reading can't be repeated — even after you delete your account. | साइन-अप करने पर हम आपके ईमेल का एक एकतरफ़ा कोड रखते हैं ताकि मुफ़्त रीडिंग दोबारा न ली जा सके — अकाउंट हटाने के बाद भी। |
| 6 | A quick Cloudflare check (Turnstile) stops bots. Page statistics come from Cloudflare Web Analytics, with no cookies. | बॉट रोकने के लिए Cloudflare की एक छोटी जांच (Turnstile) होती है। पेज के आंकड़े Cloudflare Web Analytics से आते हैं, बिना कुकी के। |

**Other trust sentences** (each with its condition)

| Sentence (EN / HI) | Where | Must be true |
|---|---|---|
| "Photo not stored on servers" (bottom CTA bar chip) | Mobile bottom bar | [verify] providers keep nothing |
| "No cookies, no ad trackers" | Footer | Devtools shows **no cookie** on the live site (watch `__cf_bm` from Cloudflare bot features and Turnstile storage) |
| "We never ask for card or UPI on this website." / "इस वेबसाइट पर हम कभी कार्ड या UPI नहीं मांगते।" | Hero chip, lock, zero state | No payments on the web (WEB-DEC-010) |
| "We don't sell your data, and there are no ads — ever." / "हम आपका डेटा नहीं बेचते, और कोई विज्ञापन नहीं — कभी नहीं।" | Footer, privacy, sign-up | No ad pixels; analytics list matches the policy |
| "This photo didn't work — and it didn't use up your free reading." / "यह फ़ोटो काम नहीं आई — और आपकी मुफ़्त रीडिंग ख़र्च नहीं हुई।" | Failed photo | Local check blocks before sending; 422/503 refunded; [verify] retry + idempotency (D24) |
| "Readings are for people 18+" | Footer, sign-up | WEB-DEC-012 |

**Never use** (all are false for the web path): "sent once", "never stored", "we keep nothing", "deleted right after", "used once to find your lines, then deleted", "we don't keep it", and any claim that the reading data is not stored. Also avoid [rec]: "100% private", "military-grade", "fully anonymous" (IP codes and the email code are kept).

**`/privacy/` "On the website" section** — must be live **before** the live reading: what we collect (§1 in plain words), who processes it, what we don't do (no cookies, no ads, no selling), how long each item is kept, DPDP rights (access, correction, erasure via `/account/` and `/delete-account/`; withdrawing consent as easy as giving it; grievance contact), age 18+, cross-border processing stated plainly (Modal in the USA), last-updated date. The app's current `privacy.html` covers only the phone and does not mention stored line points or the token log.

## 3. Rules for code that touches user data

- The photo is decoded with `createImageBitmap(file, { resizeWidth })`, re-encoded on a canvas (drops EXIF), and sent only as the 1,080 px and 768 px copies. The original never leaves the device.
- Anonymous sign-in happens only after a photo is picked, never on page load.
- Report text is rendered as React text. **No `dangerouslySetInnerHTML`**. MDX is ours; there is no user-generated content.
- Locked report text is dropped before rendering and never sent to the DOM.
- Share cards are drawn in the browser; no photo in a share card unless the user chooses it; no name by default. No public reading URLs.
- Never log photos, tokens, emails or report text to the console or to analytics. Funnel events carry no personal data.
- `/account/` delete uses the app's `delete-account` function through the site's bundled supabase-js (no CDN copy).

## 4. Verify before launch ([verify] list)

Each item must have evidence (link, screenshot, test) in `PROJECT_MASTER.md` before the dependent copy ships.

1. Modal and Cloudflare Workers AI retention and logging of images (upload line, panel row 2, bottom chip).
2. Guest users can delete their data and account (panel row 3, `/account/`).
3. No cookie is set on the live site, including by Turnstile and Cloudflare bot features (footer claim).
4. EXIF/GPS is removed (test with a GPS-tagged JPEG).
5. A failed or unclear photo never uses a free reading; retry with the same idempotency key never double-charges; two tabs never double-charge.
6. Free rule on the live project is 1 guest + 1 after email (WEB-SRV-001) and the email-code path works on a real phone.
7. Whether web and app share free readings for the same email (show copy only if true).
8. Which emails are sent after sign-up, sender name, and (for any marketing mail) unsubscribe + postal address.
9. Age rule text matches the app's terms (18+).
10. Play Console accepts the 301 on the legal URLs (else serve `.html` directly).

## 5. Headers and CSP

`public/_headers`, every page:
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin` (so Play and analytics see our referrer); stricter (e.g. `no-referrer`) on `/reading/`, `/account/`, `/delete-account/`, `/reset-password/`
- `X-Frame-Options: DENY` and CSP `frame-ancestors 'none'` (header only)
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()` — the `capture` file input still opens the phone camera app

**CSP:** Astro's built-in CSP (hashes of its own scripts and styles) plus:
```
default-src 'self'; img-src 'self' data: blob:;
connect-src 'self' https://api.palmsays.com https://cloudflareinsights.com;
script-src 'self' https://challenges.cloudflare.com https://static.cloudflareinsights.com;
frame-src https://challenges.cloudflare.com; worker-src 'self' blob:;
object-src 'none'; base-uri 'none'; form-action 'self'
```
No `unsafe-eval`. `'wasm-unsafe-eval'` only on `/reading/`, and only if a WASM decoder (HEIC, MediaPipe) is ever added. Adding any new origin to the CSP needs a line in this file.

## 6. Secrets

- The site holds **only public values**: the Supabase publishable key (`sb_publishable_…`; legacy anon keys are deprecated by the end of 2026), the Turnstile site key, the proxy URL. They live in `src/config/site.ts`.
- `TURNSTILE_SECRET` lives only in Supabase function secrets (app repo). `sb_secret_…` / `service_role`, Modal keys and SMTP credentials never enter this repo.
- The Cloudflare deploy token is scoped to this Worker and lives only in CI.
- No `.env` values in git. `check-site` fails the build if `dist/` contains `sb_secret_`, `service_role` or `TURNSTILE_SECRET`.

## 7. Abuse controls, rate limits and the web cap

All limits live on the server (app repo). The static site needs none of its own.

1. **Turnstile** (managed) on every reading start, verified in `web-gate` (S3): single-use token, valid 300 s, hostname ∈ {palmsays.com, www.palmsays.com}, action `reading` → 10-minute web pass.
2. **Separate web caps** (S4): `web_guest_free_daily_cap`, `web_llm_daily_cap`, plus `web_scan` for the line finder (D19). Each has a kill switch. The app's caps stay untouched. Budget: owner decision S5/D13.
3. **Per IP:** 6 guest free readings a day; Supabase allows 30 anonymous sign-ins per hour per IP — meaningful only after S2 stops every proxied visitor looking like one IP.
4. **Per session:** at most 3 scan or extraction claims.
5. **Email ledger** by normalised one-way code (Gmail dots and `+tags` stripped; disposable domains get less).
6. **Proxy Worker rate-limiting binding** per IP on `/functions/v1/*`.
7. **Monitoring:** a daily look at web counters in `app_usage_daily`, 429s and Turnstile failures; alert at 80% of the web cap [rec].
8. **Honest messages** for people blocked by mistake behind shared mobile IPs (CGNAT) — texts in plan §8.3.
9. **Later:** Play Integrity in the app; guest free reading needs "Turnstile pass OR Integrity verdict" (S12).
10. **Accepted risks:** clearing browser data gives another guest reading (capped by IP and daily limits); the rule engine runs in the browser, so a technical user could rebuild locked text (same as the app).

**Turnstile rule (never break):** Turnstile is checked **only** in the web-only `web-gate` function. **Never** turn on Supabase Auth's project-wide captcha — the app's anonymous sign-in sends no captcha token, so it would break the app for every user.

## 8. Analytics without cookies

- Page views and Web Vitals: Cloudflare Web Analytics (no cookies, no personal data, no custom events).
- Funnel events: batched to `log_event_counts` with `app_version='web'`, sent with `fetch(…, { keepalive: true })` on `pagehide`. Counts only — no user ID, no cookie. Event names must be on the server allow-list (S10 adds the web events; today 0021 lists app events only, and unknown events are silently skipped).
- Play installs per page: the Play link's `referrer=utm_source%3Dweb%26utm_medium%3D<page>%26utm_campaign%3D<placement>`.
- No Google Analytics, ad pixels, remarketing tags or tag managers. Anything new that could set a cookie needs a WEB-DEC row and a devtools check.

## 9. Legal notes (not legal advice — owner to confirm with a lawyer where marked)

- **India — DPDP Act 2023:** plain itemised notice at collection; consent withdrawal as easy as giving it (s.6(4)); rights of access, correction and erasure (via `/account/`, `/delete-account/`); a grievance contact in the footer and privacy page; 18+ only (under-18s need verifiable parental consent); cross-border processing (Modal, USA) stated plainly; retention per item (§1).
- **India — CCPA dark-pattern guidelines 2023** (Central Consumer Protection Authority): no false urgency, confirm-shaming, forced action, bait and switch, drip pricing, nagging, trick questions. Checklist: plan §4.6 and `UX_PSYCHOLOGY.md`. "Free" always qualified; the app price next to every store button.
- **US:** FTC Act §5; FTC fake reviews and testimonials rule (16 CFR 465); CAN-SPAM for any marketing email (PDF list: unsubscribe + postal address); easy cancel stays our rule for app plans.
- **EU/UK visitors (GDPR):** not covered by the plan. The same rights (access, erasure) are available through `/account/` and `/delete-account/`, processors are named, and no cookies are used; whether anything more is needed is a [verify with a lawyer] item before any EU marketing.
- **Google:** Play policies on misleading claims, subscriptions, ratings; Search guidance against intrusive interstitials (no app-install interstitials).

## 10. Incident steps

1. **Contain.**
   - Cost or abuse spike: ask the app-repo session / owner to set the web caps to 0 (kill switch). Web users then see the honest "used up today" message.
   - Bad release: roll back the Worker (`QA_RELEASE.md` §7).
   - Leaked secret: rotate it where it lives (Cloudflare token in Cloudflare; Turnstile secret in Cloudflare + Supabase secrets; Supabase keys in the Supabase dashboard). The publishable key is public, but rotate it too if abuse depends on it.
2. **Untrue privacy or trust claim found:** remove the sentence from the site in a hotfix the same day, then fix the backend or the wording here.
3. **Personal data exposed:** write down what, when, how many users, and how it was found. The owner informs affected users and the Data Protection Board as the DPDP rules require [verify the exact duties and deadlines with a lawyer].
4. **Record:** a WEB-BUG row in `PROJECT_MASTER.md`, a row in the release log (`QA_RELEASE.md` §9), and a WEB-DEC row if a rule changes.
5. **Follow up:** add a check or test so the same thing cannot ship again.
