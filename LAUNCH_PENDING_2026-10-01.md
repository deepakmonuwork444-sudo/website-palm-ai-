# PalmSays website: launch ke liye kya baaki hai (2026-10-01)

> **Ye kya hai:** aaj ka launch-readiness audit: kya chal raha hai, aapko kya karna hai (order mein), Claude ko kya karna hai, bugs, aur app repo ke server kaam par kya depend karta hai.
> **Kab padhein:** launch se pehle. Har command se pehle project folder; hamesha `npm.cmd` / `npx.cmd`.

Audit kaise hua: saare checks chalaye, built site ko phone (390 px) aur desktop (1440 px) par Chrome mein khola, real palm photos se tools chalaye. Server band karke chhoda. Kuch deploy ya push nahi hua.

---

## A. Abhi kya chal raha hai (checks ke saath)

| Check | Result |
|---|---|
| Type check (`astro check`) | 0 errors, 0 warnings (fix ke baad, neeche D dekho) |
| Lint (`eslint .`) | 0 problems (fix ke baad) |
| Unit tests (`vitest`) | 867 / 867 pass (33 files) |
| Build | OK, 59 pages |
| `check:web` (SEO, schema, budgets, honesty rules) | 0 errors, 15 warnings (sab purani: company details khaali, Hindi App Link pages nahi bane, assetlinks khaali, `/app/` meta 156 chars) |
| Links | 0 broken (8,875 internal links) |
| Smoke (har page phone width par) | 62 pages, 0 problems (200, console error nahi, side-scroll nahi, ek H1, title + description, images load) |
| Photo tools e2e (asli palm photos) | PASS: hand type, finger reader, left vs right, photo checker, line finder (mock) asli result dete hain; photo pick ke baad koi request site se bahar nahi gayi |
| Emoji check | Built pages aur source mein koi emoji icon nahi |

Visitor ki tarah dekha:
- **Home** (phone + desktop): hero, gold button "Get my free reading in the app", note "scan on this website opens soon". Fake reading nahi.
- **Guides** (`/palm-reading/`, `/heart-line/` …): theek dikhte hain, images HD (srcset 900–1800 px), side-scroll nahi.
- **Free tools**: apni palm photo daalo, phone par hi asli result (hand type ke saath measurements, 21 points, honest note). Line finder honestly "opens soon" bolta hai (server ka lines-only mode chahiye).
- **Web reading `/reading/`**: production mein flag OFF, honestly "opens soon" + Play button + price. Preview mein `?reading=live` bina keys ke bhi fake result nahi deta, bas "needs PUBLIC_SUPABASE_PUBLISHABLE_KEY, PUBLIC_TURNSTILE_SITE_KEY" dikhata hai. Mock mode asli stored scanner result par chalta hai, "Preview" label ke saath.
- **Account `/account/`**: "Sign-in on the website opens soon", app ka button.
- **Play links**: price line ke saath, utm referrer ke saath, "Palm Read AI" naam ka note.
- **Privacy / Terms / Delete account / Reset password**: khulte hain; company details abhi placeholder hain. `.html` purane URL 301 se naye page par jaate hain (`public/_redirects`).
- **404**: English + Hindi dono, home ka button, status 404.

---

## B. Aapke kaam (owner), isi order mein

**1. Company details Claude ko bhejo** (iske bina production build ruk jaata hai):
- Company / legal naam
- Contact email
- Grievance contact (naam + email, DPDP ke liye)

Aaj ka result:
```
cd "D:\palm ai\palm-ai-website"
node scripts/build-prod.mjs
```
Abhi ye bolta hai: `Missing: company.name, company.email, company.grievanceContact`.

**2. 6 sensitive guides padho aur "OK" bolo** (shaadi, umar, sehat, bachche). Bina OK ke production build inhe mana kar deta hai:
`/life-line/`, `/life-line/broken/`, `/marriage-line/`, `/simian-line/`, `/mercury-line/`, `/children-line/`.
Padhne ke liye:
```
cd "D:\palm ai\palm-ai-website"
npm.cmd run dev
```
phir browser mein `http://localhost:4321/life-line/` (baaki bhi). Har page ke liye Claude ko "OK" ya "launch mein mat daalo" bolo.

**3. Hindi ka faisla:** `/hi/` aur `/hi/app/` abhi Google ke liye khule (indexable) hain, par Hindi kisi reviewer ne nahi padhi. Do raaste:
- (a) Hindi reviewer `/hi/` aur `/hi/app/` padhe, phir launch, ya
- (b) pehle sirf English launch: Claude `/hi/` ko launch se bahar rakhega.
Claude ko (a) ya (b) batao.

**4. Prices Google Play se milao:** website par Plans ₹149/month se, Packs ₹199 se, Yearly ₹999, Monthly ₹299, packs 199/349/749/1299. Play Console mein sahi hain to Claude ko "prices sahi" bolo.

**5. Launch ki date Claude ko batao** (jaise `2026-10-05`). Claude `site.ts` mein `launchDate` daalega (deploy se pehle zaroori).

**6. Purana uncommitted kaam (carry-over) commit karne ki permission:** jab dusra Claude session (design/restyle) khatam ho jaaye, Claude ko bolo "carry-over commit karo". (Kyun abhi nahi: C1 dekho.)

**7. Domain + Cloudflare:** `OWNER_GUIDE.md` §13 Step 1–3 (domain khareedo, SSL Full strict, Always HTTPS). Laptop ko Cloudflare se jodo:
```
cd "D:\palm ai\palm-ai-website"
npx.cmd wrangler login
npx.cmd wrangler whoami
```

**8. Deploy (1–7 ke baad, jab Claude bole "ready"):**
```
cd "D:\palm ai\palm-ai-website"
npm.cmd install
npm.cmd run build:prod
npx.cmd wrangler deploy
```
Aakhir mein "Production build for https://palmsays.com is ready" aana chahiye. Sirf `npm.cmd run build` ke baad kabhi deploy mat karna (wo noindex preview hai).

**9. www redirect + live check:** `OWNER_GUIDE.md` §13 Step 5, phir:
```
cd "D:\palm ai\palm-ai-website"
curl.exe -sI https://palmsays.com/
curl.exe -sI https://www.palmsays.com/
curl.exe -sI https://palmsays.com/privacy.html
curl.exe -s https://palmsays.com/robots.txt
```
Sahi: pehla 200, doosra 301 → palmsays.com, teesra 301 → /privacy/, robots mein Sitemap line. Output ka screenshot Claude ko.

**10. Google Search Console + Bing + Web Analytics:** `OWNER_GUIDE.md` §13 Step 8–10. Web Analytics ka token Claude ko bhejo.

**11. GitHub par push** (Claude push nahi kar sakta):
```
cd "D:\palm ai\palm-ai-website"
git push origin main
```

**12. Baad mein (web reading + sign-in chalu karne ke liye):** Turnstile site banao (`OWNER_GUIDE.md` §3), `OWNER_AUTH_SETUP.md` Step 1–4 (Google origins, Supabase URLs, custom SMTP), web daily budget decide karo (§10), SQL proof query chalao (§9), Play SHA-256 bhejo (§8). Server waale kaam app repo mein hote hain (E dekho).

---

## C. Claude ke baaki kaam

1. **Carry-over commit (aaj nahi kiya).** Working tree mein ~200 changed files + 1,342 nayi files hain (pichhle sessions ka kaam: blog, naye guides, tools, sign-in, webcam, design). Abhi commit nahi kiya kyunki:
   - ek dusra Claude session isi folder mein **abhi** kaam kar raha tha (23:25 tak `HomePage.astro`, `Hero3D.astro`, `diagrams.ts`, `terms.test.ts` badal rahe the; `astro dev` aur infographics script chal rahe the), adha-likha kaam commit ho jaata;
   - nayi files ~608 MB hain, jisme ~420 MB screenshots (`qa/showroom`, `qa/reading-v2`, `qa/tools-3d`, `qa/media3d`, `qa/film`, …) aur ~138 MB raw AI PNGs (`design-v4/guide-assets/*.png`, 5–6 MB each) hain. Inke liye pehle `.gitignore` rules chahiye, warna GitHub repo bhaari ho jaayega.
   Jab session khatam ho: gate dobara, ignore rules, phir ek "carry-over from earlier sessions" commit.
2. **Guides ka gold button:** sab guides par "Scan my palm to see mine" aur neeche ka sticky "Scan my palm" `/reading/` par le jaate hain, jahan abhi "opens soon" hai. Home page ki tarah, jab tak web scan band hai, button ke shabd "app mein" wale hone chahiye. (Files `FindPanel.astro`, `EndCta.astro`, `StickyCta.astro` dusra session edit kar raha tha, isliye aaj nahi chhuye.)
3. Owner ke jawab aate hi: company details, 6 guides `owner-ok`, `launchDate`, Hindi faisla, prices `verified: true` (`src/config/site.ts`).
4. `/app/` meta description 156 → 155 characters (English; Hindi wala reviewer ke saath).
5. Home 3D haath par rangeen lines: ye AI 3D model hai (decorative, footer mein credit), scanner ka output nahi. Aapka rule "lines sirf asli scanner se" photos ke liye hai; ye theek hai ya hatana hai, owner se poochna.
6. Hand-type tool ki sample photo 306 px ki hai, phone par 174 px mein dikhti hai (3x screens par thodi soft). Chhota kaam: bada version.
7. `PROJECT_MASTER.md` §5/§6 update (aaj nahi kiya: wahi file dusra session edit kar raha tha). Ye file is audit ka record hai.
8. Lighthouse CI + axe (a11y) abhi set nahi (WEB-FEAT-016).
9. Server live hone ke baad: live reading + sign-in localhost aur Jio/Airtel phones par test, phir ek combined phone test sheet.
10. Proxy live hone par `.env.launch` mein `PUBLIC_SUPABASE_URL` → `https://api.palmsays.com` (Jio par `supabase.co` block hota hai; delete-account page isi URL ko use karta hai).
11. App repo commit hone ke baad `npm.cmd run sync:palm` (palm library copy ka header commit ke saath).

---

## D. Bugs: fix hue / khule

**Fix hue (aaj):**
- **Lint aur type check toot gaye the.** `eslint .` 6,768 errors deta tha aur `astro check` memory khatam hone se crash hota tha (ya 186 errors). Wajah: dusre sessions ke side builds (`dist-style/`, `dist-*`) aur `design-v4/natural-premium/before/` ki purani component copies bhi check ho rahi thi. Fix: `eslint.config.js` aur `tsconfig.json` mein `dist-*` aur `design-v4` ignore; `.gitignore` mein `dist-*/`. Ab dono 0.

**Khule:**
- (Medium) Guides ka "Scan my palm" web scan band hone par "opens soon" page par le jaata hai (C2).
- (Launch blocker, owner) Company details khaali, 6 YMYL guides bina OK, Hindi bina review (B1–B3).
- (Low) `/app/` + `/hi/app/` meta description 1 character lambi.
- (Low) Hand-type sample photo thodi chhoti (C6).

---

## E. App repo ke server kaam par kya depend karta hai

(`PROJECT_MASTER.md` §4 se; app repo mein uske apne session mein hote hain. Website abhi in sab ke bina launch ho sakti hai, web reading OFF ke saath.)

| ID | Kaam | Kiske liye | Status (docs ke hisaab se) |
|---|---|---|---|
| WEB-SRV-001 | Migrations 0016/0017/0019–0021 sach mein lage hain, guest → email phone test | Live reading, "1 + 1 free" | Owner kehte hain lage hain, verify nahi |
| WEB-SRV-002 | Proxy Worker `api.palmsays.com` + D14 (asli visitor IP) | Live reading, sign-in | Planned |
| WEB-SRV-003 | `web-gate` function (Turnstile) | Live reading | Code bana, deploy baaki (`TURNSTILE_SECRET`) |
| WEB-SRV-004 | Migration 0022 `start_web_reading` + web caps (0 se shuru) + kill switch; **lines-only scan mode** | Live reading; line finder + left vs right ki lines | 0022 bana, apply nahi; lines-only mode bana hi nahi |
| WEB-SRV-005 | Budget: `llm_daily_cap` + web caps | Live reading | Owner ka faisla |
| WEB-SRV-006 | CORS: palmsays.com, www (4 functions + web-gate) | Live reading | Code bana, redeploy baaki |
| WEB-SRV-007 | Auth Site URL + redirects, captcha OFF | Sign-in, email code | Owner step likha hai |
| WEB-SRV-008 | Custom SMTP, Confirm email ON, code template | Email sign-up | Pata nahi |
| WEB-SRV-009 | App Links (`APP_LINK_HOST`, exact paths, SHA-256) | Website link se app khulna | Planned |
| WEB-SRV-010 | Web events allow-list (0022 mein) | Funnel counting | 0022 ke saath |
| WEB-SRV-011 | Launch ke baad app ke legal links naye URLs par | Cleanup | Planned |
| WEB-SRV-014 | App ka naam PalmSays (Play par abhi "Palm Read AI") | Brand match | Planned |

Web reading chalu karne ka order: SRV-001 verify → 002 proxy → 0022 apply (004) + budget (005) → 003 web-gate + Turnstile → 006 CORS redeploy → 007/008 Auth + SMTP → website par keys + flag ON (Claude) → phone test.
