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
