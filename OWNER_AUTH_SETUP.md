# Website sign-in (Google + email) — owner setup steps

> **Ye kya hai:** website par "Continue with Google" aur email-code sign-in chalu karne ke liye aapke dashboard clicks (WEB-DEC-045, `WEB_AUTH_PLAN.md` §6).
> **Kab padhein:** jab website ka sign-in live karna ho. Code taiyaar hai aur preview (mock) mein chal raha hai.

**Zaroori baat:** production mein sign-up (Google ya email) **tab tak OFF rahega jab tak Step 3 aur Step 4 poore na hon.** Warna koi bhi kisi aur ka email apne naam kar sakta hai.
**Kabhi bhi** secret key (`sb_secret_…`, `service_role`, SMTP password, Google client secret) chat mein paste na karein. Sirf dashboard mein daalein.

---

## Step 1 — Google Cloud (10 minute)

1. https://console.cloud.google.com kholein → wahi project jisme app ka Google login hai.
2. **APIs & Services → Credentials** → **OAuth 2.0 Client IDs** mein **Web client** kholein (ID `864260847321-9mpk…` se shuru). Naya client **mat** banayein.
3. **Authorized JavaScript origins → Add URI** — ye chaaron daalein (ek-ek karke):
   - `https://palmsays.com`
   - `https://www.palmsays.com`
   - `http://localhost`
   - `http://localhost:4321`
   (Preview address, jaise `https://xyz.workers.dev`, alag se daalna hoga — wildcard nahi chalta.)
4. **Save** dabayein.
5. **OAuth consent screen** (ya "Google Auth Platform → Branding") kholein:
   - **App name:** `PalmSays`
   - **App logo:** PalmSays logo (`public/logo-512.png`)
   - **Privacy policy link:** `https://palmsays.com/privacy`
   - **Terms link:** `https://palmsays.com/terms`
   - **Authorized domains:** `palmsays.com`
6. **Publishing status → Publish app** (Testing se Production). Logo ki wajah se Google 2–5 din brand check kar sakta hai — normal hai.
7. Dhyan dein: yahi naam (PalmSays) app ke Google login mein bhi dikhega.

## Step 2 — Supabase Auth (5 minute)

1. https://supabase.com/dashboard → project `oeuaauluqlqkuplulzsc`.
2. **Authentication → Sign In / Providers → Google:**
   - **Client IDs** mein wahi Web client ID hona chahiye (app ke liye pehle se hai — sirf check karein).
   - **Skip nonce check** = **ON hi rehne dein** (app ko abhi iski zaroorat hai).
3. **Authentication → Sign In / Providers → "Allow manual linking"** = **ON** (isse mehmaan ki reading usi account mein judti hai).
4. **Authentication → URL Configuration:**
   - **Site URL** = `https://palmsays.com/`
   - **Redirect URLs** mein ye hon: `https://palmsays.com/**`, `https://www.palmsays.com/**`, `palmreadai://**` (app wale pehle se hon to rehne dein — app ke OWNER_GUIDE jaisa).
5. **Save**.

## Step 3 — Email (custom SMTP) — ye sabse zaroori hai (20 minute)

1. Ek SMTP service lein: **Brevo** (free 300 email/din) ya **Gmail app password** (Google account → Security → 2-Step on → App passwords).
2. Supabase → **Authentication → Emails → SMTP Settings → Enable custom SMTP**: host, port, username, password (password sirf yahin daalein), sender = `no-reply@palmsays.com` ya aapka email, sender name = `PalmSays`.
3. **Authentication → Rate Limits → "Emails sent per hour"** = kam se kam `100` (shuru mein 30 hota hai).
4. **Authentication → Sign In / Providers → Email → "Confirm email" = ON.**
5. **Authentication → Emails → Templates:** "Magic Link", "Confirm signup" aur "Change email address" — teeno mein `{{ .Token }}` (6 ank ka code) hona chahiye (app ke OWNER_GUIDE Step 3b jaisa).
6. **Test (zaroori):** app mein naya email + password se sign-up karein → code aata hai? login hota hai? Phir website preview par email code se sign-in karke dekhein. App toot jaaye to "Confirm email" wapas OFF karke mujhe batayein.

## Step 4 — Pehle se baaki kaam (app-repo session + aap)

1. Proxy **`api.palmsays.com`** live karna, **D14 fix ke saath** (asli visitor IP Supabase tak jaaye, ya Auth rate limits badhe hon) — warna sab Google sign-in ek hi IP se gine jaayenge.
2. SQL **0022** (web reading functions) apply karna.
3. **`web-gate` function + Turnstile** live karna.

## Step 5 — Chalu karna (jab 1–4 ho jaayein)

1. Cloudflare build settings mein ye env daalein (sab public hain):
   - `PUBLIC_GOOGLE_WEB_CLIENT_ID=864260847321-9mpkdijstu971k5p8jeg6p114u1vo442.apps.googleusercontent.com`
   - `PUBLIC_SUPABASE_PUBLISHABLE_KEY=…` (sirf publishable key)
2. Localhost par test (project folder mein):
   ```
   cd "D:\palm ai\palm-ai-website"
   npm.cmd run dev
   ```
   phir `http://localhost:4321/account/?reading=live` kholein → "Continue with Google" → apne Gmail se sign in → naam aur email dikhna chahiye.
3. Phone par Jio aur Airtel dono par ek baar Google sign-in try karein.
4. Mujhe batayein — main status "DONE — VERIFIED" tabhi karunga jab ye test pass ho.

---

**Abhi preview (mock) mein kya dekh sakte hain:** `npm.cmd run dev` → `http://localhost:4321/account/` → "Continue with Google" dabayein → sample user "Deepak Kumar" se sign in hota hai (kuch bhi bheja nahi jaata). Email code mein koi bhi 6 ank chalenge (000000 par "galat code" dikhega).
