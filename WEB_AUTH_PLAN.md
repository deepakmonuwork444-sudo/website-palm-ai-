# Web sign-up and login (shared with the app) — plan

Status: **APPROVED by the owner 2026-09-27 and BUILT (mock-verified; live not verified)** — decision WEB-DEC-045. Reviewed 2026-09-27 (see §9).

**Owner decisions (2026-09-27):** (1) build everything in this plan now; (2) Google consent-screen brand name = **PalmSays** (app and web); (3) case 2 (a guest switches to an existing account): the guest reading **stays in this browser** with a clear, honest message that it was not moved into the account — **no server move**. Owner setup steps: `OWNER_AUTH_SETUP.md`.
Feature IDs: WEB-FEAT-062 (Google sign-in), WEB-FEAT-029 (`/account/`), WEB-FEAT-066 (web readings in the app).
Date: 2026-09-27.

## 0. What the owner asked for

- Sign up and log in on the website with **one tap on "Continue with Google"**, plus email.
- Name and email **filled in automatically**; the user can change the name.
- **One account for both website and app.** If someone signs up on the website and uses their free reading there, the app must show **0 free** for them. Same the other way round.
- After sign-up the user gets their **pending free reading** and a **proper report**.
- The website should **push the user to the app to buy**.
- Think through every sign-up case so nothing breaks after launch.

## 1. What already exists (facts from both repos)

- **Same Supabase project** (`oeuaauluqlqkuplulzsc`) for both. DEC-046 (app) already says: same account, 1 free as a guest, +1 after the account is verified, then 0 and send them to the app.
- **The free count is on the server**, keyed by user (`user_usage`), and once verified also by a hash of the email (`private.free_grants`, survives account deletion). "Verified" (`private.account_verified`, 0016) = `auth.users.email_confirmed_at` set, **or** a linked Google identity. When a guest becomes verified, `sync_free_ledger` adds the guest's used count to that email's ledger, so guest 1 + verified 1 = 2 in total. **So "used on web → 0 in the app" already works, as long as it's the same account.**
- **Web readings are free readings only** (0022 `start_web_reading` / `claim_extraction`): a pack, a subscription or a promo entitlement is never spent on the web. A paying user therefore sees `no_readings_left` on the web even though the app would let them read.
- **The app** signs in with Google through a native ID token (`signInWithIdToken`, Web client ID `864260847321-9mpk…`), upgrades a guest with `linkIdentity({ provider, token })` (keeps the same user id), and also has email + password and 6-digit email codes. The app sends **no nonce**, so the project has Google **"Skip nonce check" ON** (app OWNER_GUIDE line 173).
- **The website** has an anonymous guest session (`storageKey: 'palmsays-auth'` in `api-live.ts`) and a sign-up by 6-digit email code inside the reading flow (`SignupSheet`: `updateUser({email})` + `verifyOtp('email_change')`; "taken" → "sign in with a code instead"). It has no Google sign-in, no `/account/` page, and no header login. It already has `isInAppBrowser()` in `src/lib/reading/browser.ts` and a per-page CSP helper pattern (`src/lib/tools/hand/csp.ts`).
- **The app's History tab** lists `reading_reports` for the user without a source filter. Opening one (`fetchServerReading`) also loads the matching `palm_observations` row and re-checks it with the app's `palmObservationSchema`; **a row that fails is silently not opened**.
- **Not live yet:** proxy `api.palmsays.com` (and its Auth per-IP fix, D14), migration 0022, `web-gate`, custom SMTP ("Confirm email" is OFF), Google consent screen publishing, and Play billing products.
- **Important consequence of "Confirm email" OFF:** Supabase then applies an email change on a guest **immediately, without sending a code**. So today the website's existing email sign-up would (a) never show a code and (b) let anyone attach **any** address to a guest, get it marked "verified", and use up that real person's free readings. The same flag decides whether Google auto-links into an existing email account (case 4). → Web sign-up of **either** kind must stay closed in production until custom SMTP + "Confirm email" ON (§8).

## 2. The key design choice: Google Identity Services (GIS) + ID token, not the redirect flow

WEB-DEC-018 held Google back because Supabase's OAuth redirect runs on `*.supabase.co`, which Jio and Airtel block.

**New approach:**
1. Google's own button (GIS, `accounts.google.com/gsi/client`) runs on our page and returns a Google **ID token** (popup mode; FedCM on where the browser has it).
2. We send that token to `supabase.auth.signInWithIdToken({ provider: 'google', token, nonce })` — or, for a guest, `linkIdentity({ provider: 'google', token, nonce })` — through our proxy `api.palmsays.com`.

This means:
- no browser redirect ever touches `supabase.co`, so the ISP block doesn't matter (the proxy already allows `/auth/v1/*`; Supabase checks the token's issuer and audience from its own config, not from the request host, so the proxy does not break it);
- it is **exactly the method the app already uses**, with the same Web client ID and the same Supabase Google provider, so a Google user is the same person in both;
- Google gives us the name, email and photo, which is the autofill the owner asked for;
- nonce: we create a random nonce per attempt, give GIS its SHA-256 hex and Supabase the raw value. **But** "Skip nonce check" is one project-wide Google setting, and while it is ON (needed by the app) Supabase ignores the nonce completely. So on the web the nonce is harmless but gives no replay protection today. Turning it OFF needs the app to send a nonce first (later, app change).

This supersedes WEB-DEC-018 for Google; it becomes a new decision row, WEB-DEC-045.

## 3. User experience

### Where sign-in lives
- **Header:**
  - Signed out **or a guest**, it shows "Sign in".
  - Signed in, it shows a round **initial** (not the Google photo: that would need `img-src googleusercontent.com` on every page and sends a request to Google) with a small menu: My readings, Account, Sign out.
  - A tiny inline script reads the `palmsays-auth` entry in localStorage and shows "signed in" only when a session exists **and** `user.is_anonymous !== true` (a guest also has a session there). It adds no Supabase code to every page (the 11 KB page budget holds), and never throws if storage is blocked. Supabase and GIS load only on `/account/` and `/reading/`, and only on demand.
- **`/account/` and `/hi/account/`** are new pages, noindex, never in the sitemap. Their `Referrer-Policy` stays `strict-origin-when-cross-origin` — **not** `no-referrer` like `/delete-account/`, because Google's button needs the page origin.
  - Signed out, they show the sign-in card:
    - **Continue with Google** (big, first);
    - "or use your email" with a 6-digit code (the existing flow);
    - one line: "Same account works in the PalmSays app";
    - one line: "By continuing you agree to the Terms and Privacy policy" (links).
  - Signed in, they show:
    - the name (editable, kept in this browser) and email (from `user.email`, else the Google identity's email);
    - free readings left, from `reading_balance`; if the user has an active plan or pack readings, "Your plan's readings are used in the app" instead of a buy message;
    - **My readings** (from the server, so they show on any device), shown with **the same locks as the web report**;
    - Get the app;
    - Sign out;
    - Delete account (links the existing `/delete-account/`).
  - A guest (anonymous session) sees the sign-in card, never "Sign out" (a guest who signs out can never get that account back).
- **Inside the reading flow** (`SignupSheet`, `LockSheet`, zero screen): Google button on top, email code below. After sign-up the user comes straight back to where they were and gets their 2nd free reading.

### Autofill
- After Google sign-in, the name (given name) is **pre-filled** in the reading questions and on the account page. The user can edit it; the edited name is saved in this browser only. **Note for the privacy text:** Supabase itself stores Google's name, email and photo link in the account (`auth.users` metadata) — so we must not say the Google name "stays only on this device".
- Email:
  - From Google, it is shown read-only, because it *is* their login. To use a different email they sign in with the email code instead.
  - With the email code, the user types it and the browser can autofill it (`autocomplete="email"`).
  - The code box uses `autocomplete="one-time-code"`, so phones offer the code.
- One Tap (Google's small pop-up that says "Continue as Deepak") appears only on `/account/` and after the first free reading, **not on the home page** (no annoyance, no load cost on SEO pages). Use FedCM (`use_fedcm_for_prompt: true`); where it can't show, the button still works.

### "Push to buy" (honest pressure, no fake timers)
- After free readings run out on the web, the zero screen says "Your 2 free readings are used. Your readings are already in the app — same account." It shows the Play button (with a UTM referrer) and a QR code on desktop.
  - Offer the app's real plan and trial exactly as DEC-036 / 0019 / 0020 define them (yearly with the 3-day trial; trial readings capped by 0020). Don't write a number like "5 readings" until it is checked against those rows.
  - All prices come from the `site.ts` numbers, which are still unverified; nothing is hard-coded in this feature.
  - A user who already has a plan or pack readings is told "Use your plan in the app", never "buy".
- Report: locked parts stay visible but blurred, with "Open the full report in the app".
- Account page: a banner "N free readings left. More in the app from ₹X/month" (X from `site.ts`).
- **Web payments (Razorpay) are NOT in this plan.** Buying stays in the app (Play Billing). A web checkout is a separate, bigger decision (tax, refunds, entitlement sync).

## 4. Every sign-up case, and what happens

| # | Situation | Result |
|---|---|---|
| 1 | New visitor, guest reading, then Google | `linkIdentity` with the ID token keeps the **same user id**, turns the guest into a normal account and fills its email from Google. The guest reading stays in the account and the 2nd free unlocks (ledger: 1 used + 1 left) |
| 2 | Guest on web, but this Google account (or, on the email path, this email) already exists | Link fails with `identity_already_exists` (email path: "taken"), so we fall back to `signInWithIdToken` (email path: sign-in code) with the same token and switch to the existing account. The free count is **that** account's (often 0), so we send them to the app. The guest's reading stays on the old guest account on the server and in this browser only; we say so, like the app's Google message. This is the web version of the app's open BUG-A4. **Owner 2026-09-27: keep it in this browser + the honest message; no server move** |
| 3 | Signs up on web with Google, uses the free reading, then installs the app, same Google | Same user, so the app shows 0 free and the history includes the web reading ✅ owner's main ask (needs case 19) |
| 4 | Signed up in the app with email + password, then Google on web with the same Gmail | Supabase links identities with the same **verified** email automatically, so it's the same user. **Needs "Confirm email" ON first**: while it is OFF every email counts as verified, so someone who registered a victim's Gmail first would receive the victim's Google sign-ins (pre-account takeover). Accounts created while it was OFF stay "confirmed", so turn it ON before any public launch |
| 5 | Signs up on web with the email code, then uses the app | The app supports email codes, so it's the same user ✅. For a password they use "Forgot password" in the app |
| 6 | Deletes the account, then signs up again with the same email | The free count comes back from `free_grants` (hash kept), so **no new free readings** ✅ |
| 7 | Opens the site inside Instagram or Facebook (or another in-app browser / Android WebView) | Google does not allow sign-in in embedded webviews; the GIS button does not work there. We reuse `isInAppBrowser()` and add the generic Android WebView marker `; wv)`; there we show "Open in Chrome" first, with the email code always available ✅. WhatsApp on Android usually opens Chrome Custom Tabs, where Google works — don't block it just because of the name |
| 8 | Third-party cookies blocked, or FedCM off | The GIS button (full pop-up) still works; only One Tap may not show. Email code is the fallback |
| 9 | Pop-up blocked, or the user closes Google | Silent, stays on the card, no error scare |
| 10 | Network drop mid-sign-in | Retry button (new nonce, new token); the session is never half-saved |
| 11 | Two tabs open | One shared Supabase client; supabase-js syncs tabs itself (same storage key), so both tabs update |
| 12 | Session expires or the refresh token is revoked | Auto refresh; if that fails, quietly treat them as signed out. Readings in this browser stay |
| 13 | Signs out on a shared phone | `signOut({ scope: 'local' })` — the default scope is **global** and would also sign them out of the app on their phone. Also `google.accounts.id.disableAutoSelect()`, clear the "me" details, and ask "Remove readings from this browser?" |
| 14 | Hindi user | `/hi/account/`, all copy in Hindi, and Google's button shown in Hindi (`locale: 'hi'`) |
| 15 | Jio/Airtel blocks `supabase.co` | All calls go through `api.palmsays.com`; GIS talks to Google directly ✅ |
| 16 | Bot sign-ups | Anonymous guests are already capped per IP and per day; web readings still need Turnstile through `web-gate`; Google accounts are costly to fake |
| 17 | Email never arrives | "Resend code" after 60 s and "check spam". **Needs custom SMTP**: Supabase's built-in mailer sends only 2 emails an hour and only to the project team's addresses. Custom SMTP starts at 30 an hour — raise it |
| 18 | Google consent screen still in "Testing" | Only test users could sign in. **Must be published** before launch |
| 19 | Web reading payload doesn't match the app's schema | The app silently won't open it. Add a parity test: a web `palm_observations` payload must pass the app's `palmObservationSchema` (same idea as the events-list test), plus one real check that a web reading opens in the app's History |
| 20 | Signed-in user signs out, then starts a reading | The site would make a fresh guest, which gets a new free reading. Keep a "this browser had an account" flag and show "Sign in to read" instead of a silent new guest (soft; the per-IP and daily guest caps are the real limit). Same for a private window — accepted, capped by the caps |
| 21 | User with a plan or pack readings reads on the web after the free ones | Server says `no_readings_left` (web is free-only). Show "Use your plan in the app", not "buy" |
| 22 | Many visitors behind the proxy | Without the D14 fix Supabase sees one IP: all web Google sign-ins **and token refreshes** share 150 per 5 minutes, guest sign-ins 30 an hour. Google sign-in must not open before D14 (`Sb-Forwarded-For` or raised limits) is live |
| 23 | Guest switches to an existing account (case 2) many times | Each switch leaves an empty guest account on the server. Later: an owner SQL job that removes old guest accounts with no readings |

## 5. Build steps (after approval)

1. **One shared Supabase client:** `src/lib/supabase-client.ts`, used by both the reading flow and auth, keeping `storageKey: 'palmsays-auth'` so today's guests keep their session. Two clients with the same storage key cause random sign-outs.
2. **Auth module:** `src/lib/auth/`.
   - `google.ts`: loads GIS on demand, creates a fresh nonce per attempt, renders the button, and does the link-or-sign-in logic ported from the app's pure `google.ts` (`isIdentityTaken`, `isLinkUnavailable`, `friendlyGoogleError`), passing the nonce to both calls.
   - `session.ts`: listener and helpers; sign-out always `scope: 'local'`.
   - In-app browser check: extend the existing `isInAppBrowser()` (no new file).
   - A **mock** version for `npm run dev` (like the reading mock).
3. **UI:**
   - the `AuthCard` React island (Google + email code);
   - the `/account/` and `/hi/account/` pages, registered in `pages.ts` as noindex;
   - the header entry (tiny script, guest-aware);
   - Google buttons in `SignupSheet` and `LockSheet`;
   - name prefill in `Intake`.
4. **My readings:** list `reading_reports` for the user on `/account/` and open the report text with the same locks as the web report. The photo stays only on the device where it was taken (as now), and we say so.
5. **Push to app:** the zero screen, the account banner and locked-part text, all using the existing store button and price rules; plan/pack holders get "use it in the app".
6. **Security:**
   - CSP, **only on `/account/`, `/hi/account/` and `/reading/`** (per-page helper like `tools/hand/csp.ts`), exactly Google's list: `script-src https://accounts.google.com/gsi/client`, `frame-src https://accounts.google.com/gsi/`, `connect-src https://accounts.google.com/gsi/`, `style-src https://accounts.google.com/gsi/style`;
   - no COOP header (if one is ever added it must be `same-origin-allow-popups`);
   - `/account/*` keeps `strict-origin-when-cross-origin` in `public/_headers`;
   - add a JS budget row for `/account/` in `check-web.mjs` (islands are not counted today);
   - update `SECURITY_PRIVACY.md` §5.
7. **Words and legal:**
   - i18n keys EN/HI;
   - privacy text: Google sign-in (name, email, photo link stored in the account), website readings stored in the account, and a website section (the Hindi reviewer checks the Hindi); age line matching the app's policy (owner to confirm, DPDP).
8. **Tests:**
   - unit tests for the link/sign-in/fallback logic, the guest-aware header check, sign-out scope, and the webview check;
   - schema parity test (case 19);
   - Playwright runs in mock mode (sign in, free reading, zero screen, sign out, Hindi);
   - `npm run gate` passes.
9. **Docs:** `PROJECT_MASTER.md`, `DECISIONS.md` (WEB-DEC-045), and `ARCHITECTURE.md` auth section.

## 6. What the owner must do (dashboard clicks, I will write step-by-step)

1. **Google Cloud → the existing Web client** `864260847321-9mpk…`:
   - add Authorized JavaScript origins `https://palmsays.com`, `https://www.palmsays.com`, `http://localhost` **and** `http://localhost:4321` (Google needs both for local tests; preview hosts must be added one by one, no wildcards);
   - publish the consent screen, with app name PalmSays, the logo, and the privacy and terms links (a logo means a short Google brand check; the same screen is shown in the app).
2. **Supabase → Auth:**
   - Google provider ON with the same Web client ID in "Client IDs" (already set for the app, just verify); "Skip nonce check" stays ON for now (the app needs it);
   - "Allow manual linking" ON;
   - Site URL `https://palmsays.com/`;
   - Redirect URLs as in the app's OWNER_GUIDE Step 9.4.
3. **Custom SMTP**, raise its email limit above the starting 30 an hour, then "Confirm email" ON, plus the 6-digit code templates (already listed in the app's OWNER_GUIDE). Check first that the app's email + password sign-up still works with it ON.
4. The already-pending items: proxy `api.palmsays.com` **with the D14 Auth per-IP fix**, SQL 0022, `web-gate` + Turnstile.

Sign-in can be fully built and tested in mock mode now. Real Google sign-in works on localhost as soon as step 1 is done and the proxy is live. **Production sign-up (Google or email) opens only after steps 3 and 4.**

## 7. Out of scope / later

- Web payments (Razorpay).
- Saving the edited name to the server so the app shows it. The app keeps the name on the phone today, so this needs an app change.
- Photo sync across devices (photos never go to the server, by design).
- Gender in the app's engine.
- App sends a nonce, then "Skip nonce check" OFF.
- Clean-up job for old empty guest accounts.

## 8. Risks

- **Pre-hijack and email-claim risk** until "Confirm email" is ON (case 4, and §1: any address can be attached to a guest). Mitigation: no web sign-up of any kind in production before custom SMTP + Confirm email.
- **Shared Auth rate limits behind the proxy** (case 22) until D14 is live.
- **Nonce not checked** while "Skip nonce check" is ON (§2). Low risk (Google tokens are short-lived and audience-bound), fixed later with an app change.
- **GIS script weight** (~90 KB from Google). It loads only on click, or on `/account/`. It is not counted in our budget, but it is watched in Lighthouse.
- **Brand mismatch** on Google's consent screen (Palm Read AI vs PalmSays). The owner picks the name once for both.

## 9. Review notes (2026-09-27)

Adversarial review against both repos and current docs. What changed and why:

1. **Nonce (§2):** hashed-to-Google / raw-to-Supabase is correct, but Supabase's code skips the whole nonce check when "Skip nonce check" is ON, so the web nonce gives no protection while the app needs it ON. Sources: https://supabase.com/docs/guides/auth/social-login/auth-google , https://github.com/supabase/auth/blob/master/internal/api/token_oidc.go
2. **linkIdentity with ID token (case 1/2):** supported in supabase-js 2.117.2 (`linkIdentity(SignInWithIdTokenCredentials)`, sends `nonce` + `link_identity: true`; checked in `node_modules/@supabase/auth-js`). Already-linked → `identity_already_exists` ("Identity is already linked to another user"). Linking to a guest sets `is_anonymous = false` and fills an empty email from the identity; user id kept. Source: https://github.com/supabase/auth/blob/master/internal/api/identity.go , https://supabase.com/docs/guides/auth/auth-identity-linking
3. **Confirm email OFF (§1, case 4, §8):** Supabase applies a guest's email change immediately when autoconfirm is on, so the existing web email-code sign-up is also unsafe/unusable today, not only Google. Auto-linking only uses verified emails (pre-account-takeover note). Sources: https://github.com/supabase/auth/blob/master/internal/api/user.go , https://supabase.com/docs/guides/auth/auth-identity-linking
4. **In-app browsers (case 7):** Google: Android/iOS webviews are not supported for GIS sign-in; Custom Tabs / SFSafariViewController are fine → reuse `isInAppBrowser()` + `; wv)`, don't treat WhatsApp as always blocked. Source: https://developers.google.com/identity/gsi/web/guides/supported-browsers , https://developers.google.com/identity/siwg/best-practices
5. **CSP / origins / referrer (§3, §5.6, §6.1):** exact CSP sources (no `/*` wildcards), both `http://localhost` and `http://localhost:<port>`, `strict-origin-when-cross-origin` recommended (so `/account/` must not copy `/delete-account/`'s `no-referrer`), COOP only matters without FedCM. Source: https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid
6. **Proxy (§2, case 22):** issuer/audience checks don't depend on the request host, and the proxy allows `/auth/v1/*` (`services/supabase-proxy/src/proxy-logic.ts`), so the proxy is fine. But per-IP Auth limits (token endpoint incl. ID token and refresh 150/5 min, anonymous 30/h) make D14 a hard prerequisite. Source: https://supabase.com/docs/guides/auth/rate-limits
7. **SMTP (case 17, §6.3):** built-in mailer = 2 emails/hour and team addresses only; custom SMTP starts at 30/hour. Sources: https://supabase.com/docs/guides/auth/auth-smtp , https://supabase.com/docs/guides/auth/rate-limits
8. **Found in code, not docs:** default `signOut()` scope is global (would sign the app out too) → `scope: 'local'` (case 13); header must ignore guest sessions; Google name/photo are stored server-side in Auth metadata (privacy text); web is free-only (0022) so plan/pack holders need their own message (case 21); sign-out → new guest → extra free reading (case 20); app opens a server reading only if `palm_observations` passes `palmObservationSchema` (case 19); `/account/` island JS is not budget-checked today; "5 trial readings" and "₹149" removed as hard-coded claims.
9. **Checked and correct as written:** free accounting guest 1 + verified 1 via `sync_free_ledger`; Google identity counts as verified (0016 `account_email`); deleted-account ledger (case 6); one shared client/storage key; GIS `locale: 'hi'`.

## 10. Build notes (2026-09-27)

Built as §5 says, in mock mode; nothing deployed, nothing changed in Supabase. Where the build had to choose:

- **Files:** `src/lib/supabase-client.ts` (one shared client), `src/lib/auth/` (`google.ts` link-or-sign-in + nonce, `gis.ts` Google's script, `live.ts` / `mock.ts` / `account.ts` account backends, `state.ts` browser facts, `header-script.ts` the header's inline script, `csp.ts`, `config.ts`, `copy.ts` EN+HI words, `codes.ts`), `src/lib/account/server-reading.ts` (a server reading rebuilt from its observation and LOCKED like the web report), `src/components/auth/GoogleButton.tsx`, `src/components/account/` (`AccountApp.tsx`, `ServerReport.tsx`, `account.css`), `src/pages/account/`, `src/pages/hi/account/`.
- **Header "Sign out"** links to `/account/?signout=1`: the account page signs out (`scope: 'local'`, `disableAutoSelect()`) and then asks "Remove the readings saved in this browser too?". This keeps supabase-js off every other page. "My readings" = `/account/?view=readings`.
- **The header script** needs its SHA-256 in the page CSP (Astro does not hash `is:inline` scripts); BaseLayout adds it. Found while testing: once a page adds a style source, Astro drops its default `'self'` from `style-src`, so `csp.ts` adds `'self'` back.
- **Account page email code:** a guest adds the email to the same account (`updateUser` + `email_change`, as in the reading); someone with no session gets a sign-in/sign-up code (`signInWithOtp`, `shouldCreateUser: true`, type `email`).
- **`/account/` and `/hi/account/`** are two noindex pages without an hreflang pair (the registry allows twins only between indexable pages); the language switch links them (`BaseLayout langPath`).
- **Plan / pack holders** (case 21): `parseBalance` now also returns `appPaid: true` when `reading_balance` shows pack readings, `unlimited` or an active subscription; the zero screen, the report and `/account/` then say "use your plan in the app".
- **Case 20:** the header script (and the account page) set `palmsays-had-account`; on such a browser with no session, "Use this photo" opens "Sign in to read" (Google or code) instead of making a new guest.
- **Mock:** the preview account lives in the same `palmsays-auth` entry (marked `mock: true`, deleted by the live client), so the header, the reading and `/account/` agree. Google (preview) = Deepak Kumar, deepak@example.com; `?mockGoogle=existing` previews case 2; account-page codes accept any 6 digits except 000000 (the reading sheet's mock still wants 123456).
- **Not done here (needs the owner or another session):** the `/privacy/` website section text (Google name/email/photo link in the account; website readings in the account) — legal copy, owner/lawyer review; the age line (DPDP); a Playwright e2e in CI (screenshots only, `research-tools/auth-shots.mjs`); the real-phone check that a web reading opens in the app's History (case 19); everything in §6.
- **To verify once live:** GIS may write a first-party `g_state` cookie for One Tap's cool-down; the footer says "No cookies" (SECURITY_PRIVACY.md §4).
