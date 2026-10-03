# PalmSays website — Owner guide (aapke kaam)

> **Ye kya hai:** website ke woh kaam jo sirf aap (owner) kar sakte ho — domain, Cloudflare, Google, author details, reviewer, keywords, Play SHA, SQL check. Chhote steps, simple Hinglish.
> **Kab padhna hai:** jab Claude bole "owner step X chahiye", ya jab aap khud aage badhana chaho. Owner ke kaamon ka source of truth yahi file hai; status `PROJECT_MASTER.md` §8 mein hai.

**Commands ke 2 rule:**
- Har command pehle project folder mein jaati hai: `cd "D:\palm ai\palm-ai-website"`
- Aapka PowerShell `npm` / `npx` block karta hai, isliye hamesha **`npm.cmd`** aur **`npx.cmd`** likho.

**Kaunsa kaam pehle:** 1 → 3 → 9 → 10 → 5 (ye live reading aur launch ko rokte hain). Baaki baad mein.

---

## 1. palmsays.com ko Cloudflare pe lao

**Agar domain abhi khareeda nahi hai:** Cloudflare mein login → **Domain Registration → Register Domains** → `palmsays.com` search → khareed lo. Ye apne aap Cloudflare pe aa jayega; step 1 khatam.

**Agar domain kahin aur (GoDaddy, Hostinger, etc.) se khareeda hai:**
1. Cloudflare account banao (free): https://dash.cloudflare.com/sign-up
2. **Add a domain** → `palmsays.com` likho → **Free** plan chuno.
3. Cloudflare purane DNS records dikhayega → sab theek lage to **Continue**.
4. Cloudflare **2 nameservers** dega (jaise `xxx.ns.cloudflare.com`). Inhe copy karo.
5. Jahan domain khareeda tha, wahan **Nameservers** setting kholo → "Custom" chuno → Cloudflare wale 2 nameservers daalo → Save.
6. 10 minute se 24 ghante lag sakte hain. Cloudflare mein domain ke aage **Active** likha aa jaye → ho gaya.

Claude ko batao: "palmsays.com Cloudflare pe Active hai".

## 2. Cloudflare access (Claude ke liye)

Ye tab karna hai jab Claude bole (website ka code ban jane ke baad):
```
cd "D:\palm ai\palm-ai-website"
npx.cmd wrangler login
```
Browser khulega → apne Cloudflare account se **Allow** dabao. Bas.

## 3. Turnstile (bot check) banao

1. Cloudflare dashboard → left menu **Turnstile** → **Add widget**.
2. Name: `PalmSays`. Hostnames: `palmsays.com` aur `www.palmsays.com`.
3. Widget mode: **Managed** → **Create**.
4. 2 keys milengi:
   - **Site key** → Claude ko bhej do (ye public hai, safe hai).
   - **Secret key** → chat mein kisi ko mat bhejo, website folder mein kabhi nahi. Ye sirf app wale project ke Supabase secrets mein jayegi — app-repo session aapko exact command dega.

## 4. Google Search Console (DNS TXT se verify)

1. https://search.google.com/search-console kholo → **Add property** → **Domain** (URL prefix nahi) → `palmsays.com` → Continue.
2. Google ek TXT value dega (`google-site-verification=...`). Copy karo.
3. Cloudflare → `palmsays.com` → **DNS → Records → Add record**: Type `TXT`, Name `@`, Content = copy ki hui value → **Save**.
4. Search Console mein wapas **Verify** dabao. (Kabhi-kabhi 10–30 minute lagte hain.)
5. Claude ko batao "Search Console verified". Sitemap submit Claude launch ke time batayega.

## 5. Author details + photo bhejo (aur company details)

**Author page ke liye (Deepak Chauhan):**
- Naam jaisa page pe dikhana hai.
- 3–4 line bio (founder, 25 saal, 6+ websites/apps — ye mil gaya hai; aur kuch add karna ho to).
- Palmistry se aapka sach mein kya rishta hai: kitne saal se, kaunsi books padhi, kya claim **nahi** karte. Jo sach hai wahi likhenge.
- 1 asli photo (chehra saaf, kam se kam 800×800).
- Social links (optional).

**Footer aur privacy page ke liye (launch se pehle zaroori):**
- Company / business ka naam (ya aapka legal naam).
- Contact email.
- Grievance contact (data complaints ke liye naam + email — DPDP law ke liye).

## 6. Hindi reviewer dhundo

- Aisa insaan jo achhi, natural Hindi padhe-likhe (palmistry samjhe to aur achha).
- Unka kaam: har Hindi page live hone se **pehle** padhna aur galti batana.
- Chahiye: naam, 2–3 line bio, photo, aur unki haan ki naam website pe dikhega.
- Jab tak reviewer nahi milta, Hindi pages aap khud padhoge — bina padhe koi Hindi page live nahi hoga.

## 7. India keyword export

1. Jis keyword tool se pehli keyword list bani thi, usme database **India** chuno.
2. Ye words search karke export karo: palm reading, palmistry, hast rekha, हस्तरेखा, heart line, life line, fate line, marriage line.
3. File save karo: `D:\palm ai\palm-ai-website\research\keywords-in.tsv`
4. US wali list bhi ho to: `D:\palm ai\palm-ai-website\research\keywords-us.tsv`
5. Claude ko batao "keyword files rakh di".

**Ho gaya (2026-09-26):** dono files mil gayi aur `KEYWORD_MAP.md` mein laga di. Ek chhota kaam baaki hai (zaroori nahi, baad mein bhi chalega): India database mein Hindi (Devanagari) words ki list bhi export karo — हस्तरेखा, हाथ की रेखा, भाग्य रेखा, शादी की रेखा, जीवन रेखा — aur `research\keywords-in-hi.tsv` naam se save karo.

## 8. Play App Signing SHA-256 (Play Console banne ke baad)

Isse Android pe website ke 6 guide links seedha app mein khulenge.
1. Play Console → apna app → **Test and release → Setup → App signing** (kabhi naam "App integrity → App signing" hota hai).
2. **"App signing key certificate"** wale box mein **SHA-256 certificate fingerprint** copy karo. ("Upload key" wala nahi.)
3. Claude ko bhej do (ye public value hai, safe hai).

## 9. SQL check karo (0016, 0017, 0019, 0020, 0021 sach mein lage hain?)

Aapne bola ye SQL lag gaye hain. Claude khud check nahi kar sakta (ye project Claude wale Supabase account mein nahi hai). 1 minute ka check:
1. Supabase dashboard → Palm Read AI project → **SQL Editor → New query**.
2. Ye paste karo aur **Run** dabao (ye sirf padhta hai, kuch nahi badalta):
```sql
select 'guest free is 1' as item, private.stage1_free_allowance() = 1 as ok
union all select 'free total is 2', private.free_allowance_total() = 2
union all select '0017 unlock column', exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'reading_sessions' and column_name = 'unlocked_at')
union all select '0019 gold limit is 20', private.subscription_monthly_limit('monthly') = 20
union all select '0020 trial cap is 5', private.subscription_window_limit('yearly', true, now()) = 5
union all select '0021 event logger exists', has_function_privilege('anon', 'public.log_event_counts(jsonb)', 'EXECUTE');
```
3. Saari rows mein `ok = true` aana chahiye. Result ka **screenshot** Claude ko bhejo.
4. Agar error aaye (jaise "function does not exist") → matlab wo SQL nahi laga. Error ka screenshot bhejo; app-repo session theek karega.
5. Ek phone test bhi chahiye: app mein guest reading → email code se sign-up → code email pe aaya? (Ye app-repo session ki test sheet mein hoga.)

## 10. Budget decide karo (website ki free readings per day)

- Abhi pure app ke liye din mein ~34 AI calls ki limit hai. Website ko **alag limit** chahiye, warna website app ki limit kha jayegi.
- Aapko batana hai: website pe din mein kitni free readings tak paisa kharch karna theek hai. Suggestion: chhota number se shuru karo, har hafte cost dekho, phir badhao.
- Ye number app-repo session set karega.

## 11. Asli haath ki photos (home page ke liye)

- 3–5 logon ke haath (family chalega), alag skin tone, aadmi + aurat.
- Har insaan se likhit haan (consent) — Claude ek chhota consent note bana dega.
- Kabhi AI se bane haath nahi. Jab tak photos nahi aati, home page pe "diagram" likha hua chitra rahega.

## 12. Website live karna (push)

Claude `git push` nahi kar sakta. Jab Claude bole "sab checks pass, ready", tab ye chalao (Claude exact branch batayega):
```
cd "D:\palm ai\palm-ai-website"
git push origin main
```
Push ke baad Cloudflare apne aap website update kar dega. Kuch galat ho to Claude purana version wapas laane ki command dega.

(Abhi GitHub se auto-deploy set nahi hai. Pehli baar website live karne ke liye neeche §13 follow karo.)

## 13. Launch day: palmsays.com live karna (web reading abhi OFF rahegi)

> Ek baar ka kaam, ~1 ghanta. Har command se pehle project folder: `cd "D:\palm ai\palm-ai-website"`. Hamesha `npm.cmd` / `npx.cmd`.
> Web palm reading abhi band hai (`webReadingEnabled=false`): gold buttons log ko app pe bhejte hain. Ye theek hai, launch ho sakta hai.

**Shuru karne se pehle (Claude ke saath, ye 2 cheezein chahiye, warna build ruk jayega):**
- Company / aapka legal naam + contact email (privacy aur terms page pe dikhenge). Claude ko bhejo, Claude `site.ts` mein daal dega.
- 3 guides ke liye aapka "OK": `/life-line/`, `/marriage-line/`, `/simian-line/` (umar, shaadi, sehat wale topic). Padh ke Claude ko "OK" bolo; Claude unka status `owner-ok` kar dega.
- Supabase URL + public key `.env.launch` file mein Claude ne pehle hi rakh di hai (ye public values hain, secret nahi).
- **Launch ki date:** jis din deploy karoge, wo date Claude ko batao (jaise `2026-10-05`). Claude `site.ts` mein `launchDate` set karega, taaki har guide ki "published" date launch wala din ho, pehle ki nahi (WEB-DEC-049). Deploy se pehle ye zaroor karo.

### Step 1: Domain khareedo (Cloudflare Registrar, sabse aasaan)
1. https://dash.cloudflare.com → login.
2. Left menu **Domain Registration → Register Domains**.
3. `palmsays.com` search karo → **Purchase** → payment. **Auto-renew ON** rakho.
4. Left menu **Account Home**: `palmsays.com` ke aage **Active** aana chahiye (kuch minute).

Domain kahin aur se liya hai (GoDaddy, Hostinger…)? To §1 wale steps karo (Cloudflare mein "Add a domain" → 2 nameservers copy → registrar mein Custom nameservers). **Active** hone tak ruko (10 min – 24 ghante).

### Step 2: Laptop ko Cloudflare se jodo (sirf pehli baar)
```
cd "D:\palm ai\palm-ai-website"
npx.cmd wrangler login
npx.cmd wrangler whoami
```
Browser khulega → **Allow**. `whoami` mein aapka email + account dikhe = ho gaya.

### Step 3: SSL/TLS setting
1. Cloudflare → `palmsays.com` → left menu **SSL/TLS → Overview** → **Configure** → **Full (strict)** → **Save**.
2. **SSL/TLS → Edge Certificates**: **Always Use HTTPS = ON**, **Minimum TLS Version = TLS 1.2**.
3. Isi page pe "HTTP Strict Transport Security (HSTS)" ko **mat chhedo** — website khud HSTS bhejti hai.

### Step 4: Website upload (deploy)
```
cd "D:\palm ai\palm-ai-website"
npm.cmd run build:prod
npx.cmd wrangler deploy
```
- `build:prod` = asli (Google mein aane wala) build + saare checks. Aakhir mein "Production build for https://palmsays.com is ready" aana chahiye.
- Agar "Production build stopped. Missing: …" aaye → wo line Claude ko bhejo.
- `wrangler deploy` website upload karta hai aur **palmsays.com ko apne aap jod deta hai** (DNS + certificate). Pehli baar certificate mein 5–15 minute lag sakte hain.
- Shortcut (dono ek saath): `npm.cmd run deploy`
- **Kabhi bhi** sirf `npm.cmd run build` ke baad deploy mat karna: wo preview build hai (Google ko "index mat karo" bolta hai).

Deploy mein "custom domain" ki error aaye (domain abhi Active nahi): Step 1 ka Active hone do, phir dobara `npx.cmd wrangler deploy`. Ya haath se: **Workers & Pages → palmsays-web → Settings → Domains & Routes → Add → Custom domain** → `palmsays.com` → Add.

### Step 5: www.palmsays.com → palmsays.com (301 redirect)
1. **DNS → Records → Add record**: Type `AAAA`, Name `www`, IPv6 address `100::`, Proxy status **Proxied** (orange cloud) → **Save**.
2. Left menu **Rules → Overview → Create rule → Redirect Rule** (ya **Templates → "Redirect from WWW to Root"** chuno, wo sab bhar deta hai).
   - Rule name: `www to apex`
   - If incoming requests match: **Custom filter expression** → Field `Hostname`, Operator `equals`, Value `www.palmsays.com`
   - Then: Type **Dynamic**, Expression: `concat("https://palmsays.com", http.request.uri.path)`, Status code **301**, **Preserve query string = ON**
   - **Deploy**.

### Step 6: Check karo ki live hai (PowerShell)
```
curl.exe -sI https://palmsays.com/
curl.exe -sI https://www.palmsays.com/
curl.exe -s https://palmsays.com/robots.txt
curl.exe -s https://palmsays.com/ | Select-String 'name="robots"'
```
Sahi jawab:
- Pehli line: `HTTP/1.1 200` (ya `HTTP/2 200`) aur `strict-transport-security` dikhe.
- Doosri: `301` aur `location: https://palmsays.com/`.
- robots.txt mein `Sitemap: https://palmsays.com/sitemap-index.xml`.
- Chauthi: `index, follow` (agar `noindex` dikhe → galat build gaya, turant Claude ko batao).
- Phone pe https://palmsays.com kholo: home, `/app/`, `/hi/`, ek guide, ek tool.

Output ka screenshot Claude ko bhejo.

### Step 7: Kuch galat ho gaya? Purana version wapas (rollback)
```
cd "D:\palm ai\palm-ai-website"
npx.cmd wrangler deployments list
npx.cmd wrangler rollback
```
`rollback` pichhla version wapas laata hai (poochega "sure?" → `y`). Saare pages + images bhi saath mein wapas aate hain.
Ya dashboard: **Workers & Pages → palmsays-web → Deployments** → purana version → **⋯ → Rollback**. Phir Claude ko batao kya hua.

### Step 8: Google Search Console
1. https://search.google.com/search-console → **Add property** → **Domain** → `palmsays.com` → Continue.
2. Google "Cloudflare" pehchaan lega → **Start verification** → Cloudflare login → **Authorize**. (Ya §4 wala tarika: TXT record `@` pe daalo → **Verify**.)
3. Left menu **Sitemaps** → "Add a new sitemap" mein `sitemap-index.xml` → **Submit**. Phir ek-ek karke: `sitemap-core.xml`, `sitemap-guides.xml`, `sitemap-tools.xml`, `sitemap-hi.xml`.
4. Upar search box mein `https://palmsays.com/` daalo → **Request indexing**.

### Step 9: Bing Webmaster Tools
1. https://www.bing.com/webmasters → Google account se sign in.
2. **Import your sites from GSC** → **Import** → `palmsays.com` chuno → Import. (Sitemaps bhi saath aa jaate hain.)

### Step 10: Cloudflare Web Analytics (bina cookie wala visitor count)
1. Cloudflare → left menu **Analytics & Logs → Web Analytics → Add a site**.
2. Hostname: `palmsays.com` → **Done**. Automatic setup mat chuno; "JS snippet" wala option.
3. Snippet mein `"token": "…"` wali value copy karo → **Claude ko bhejo** (ye public hai). Claude website mein laga dega aur dobara deploy ke liye bolega.

### Baad mein (Claude yaad dilayega)
- ~4 hafte sab theek chale to HSTS "preload" (hstspreload.org pe submit) — Claude batayega.
- Play SHA-256 (§8) aane pe Android App Links on honge.
- Uptime monitor (palmsays.com down ho to email) — optional, free.
