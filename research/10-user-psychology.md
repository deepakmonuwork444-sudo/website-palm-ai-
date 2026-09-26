# 10 — User psychology for the Palm Read AI website

Researched on 2026-09-26. Desk research only: about 45 web searches and fetches, the 5 competitor teardowns in this folder (`01`–`05`), and the app repo's own records (`PROJECT_MASTER.md` DEC-011/038/043/044, `SECURITY_MASTER.md`, `big-engineers-report/deep-research-report.md`). No user interviews were run, so the personas are **evidence-based assumptions** and should be checked against real visitors after launch.

Scope: the website only (homepage free reading, 25 guides, 12 tools, blog, Play Store handoff). Owner decisions already fixed:
- report 1 free as a guest, report 2 after sign-up, then 0 free readings → the Android app;
- web free report = the same as the app (love + personality in full, career & money + life direction as a one-line preview);
- marriage / children / lifespan guides are honest (the tradition explained, no predictions);
- no fake counters, countdowns, struck prices or invented numbers (competitors 01–05 all use some of these).

Evidence labels: **[research]** = a cited outside source. **[repo]** = our own docs. **[verify]** = a claim about our product that must be checked against the real backend before it goes on a page. **[rec]** = my recommendation, not yet approved.

This is design and copy guidance, not legal advice.

---

## 0. The short version (12 rules)

1. **Value before asking.** First reading with no sign-up. Ask for an account only after the user has seen their own lines. Never ask for money on the web. ([NN/g hierarchy of trust](https://www.nngroup.com/articles/commitment-levels/), [NN/g login walls](https://www.nngroup.com/articles/login-walls/))
2. **Tell the privacy truth where the fear starts:** next to the upload button, not only in the footer. ([Schaub et al. 2015](https://www.usenix.org/conference/soups2015/proceedings/presentation/schaub))
3. **Proof beats claims.** The user's own photo with their real lines drawn on it is our strongest trust signal. No competitor does this (`01`–`05`).
4. **Every meaning points at a visible line** ("because your heart line curves up…"). This beats the Barnum effect that makes skeptics call palm apps fake. ([Barnum effect](https://en.wikipedia.org/wiki/Barnum_effect))
5. **Real scarcity only:** "2 free readings on the website". Say it before the first scan, show "1 of 2 used", and never invent limits.
6. **Lock only real content.** The preview of a locked part is its real first sentence (already the app rule, DEC-038).
7. **Zero fake social proof.** No counters, testimonials, ratings or "was" prices unless they are real and can be checked. ([FTC 16 CFR 465](https://www.ftc.gov/legal-library/browse/federal-register-notices/16-cfr-part-465-trade-regulation-rule-use-consumer-reviews-testimonials-final-rule), [CCPA 2023 "false urgency"](https://www.lexology.com/library/detail.aspx?g=9be57080-d215-45a8-b988-27acfc083de4))
8. **Say what the app costs before install.** The web says "free", and the full reading is paid in the app. Under India's rules, "free" without that disclosure is **drip pricing**.
9. **Bad-news lines get calm, direct, tradition-framed answers.** Never dates, lifespan, illness, divorce, or number of children.
10. **The store button appears at the peak moment** (after value, when a locked part is tapped, at 0 free readings). It is device-aware and never blocks the page. The iPhone message is honest.
11. **Hindi is a first-class language, not a translation.** Use simple spoken Hindi, the word "रीडिंग" instead of "credits", and taller line height for Devanagari.
12. **One dominant action per screen**, in line with the owner's premium UI rules.

---

## 1. Facts every page must match (single source of truth)

Trust breaks the moment two pages disagree. Competitors 02 and 03 contradict themselves on speed, refunds and photo storage. Keep these facts in one config file that every page reads, and never hard-code them into copy.

| Fact | Current value | Status |
|---|---|---|
| Web free readings | 2: 1 as guest, 1 after sign-up. Then 0 on the web. | [repo] WEBSITE_MASTER_PLAN |
| What a free reading shows | Love + Personality in full. Career & Money and Life Direction show their first sentence; the rest is locked. | [repo] DEC-038 |
| Does sign-up unlock report 1's locked parts? | **No.** Sign-up gives one more reading. Copy must never imply that it opens the locked parts. | [repo] plan; [verify] |
| Payments on the web | None. Billing is Play-only. | [repo] plan |
| Palm photo | Not stored on our servers. Sent once for analysis (scanner + AI vision step), then discarded. EXIF/location stripped. | [repo] SECURITY S-169, S-203, S-275; **[verify]** which processors see it, and that stripping is real |
| Where web readings are kept | In this browser only (IndexedDB). Not moved to the app. | [repo] plan; [verify] |
| Free allowance web + app | Same account and same rules, so web free readings are probably shared with the app. | [repo] plan; **[verify]** |
| App platforms | Android only. No iPhone app yet. | owner |
| App price truth | Free download. Full readings: one-time packs (4 for ₹199, 10 for ₹349, 25 for ₹749, 50 for ₹1,299; never expire) or a membership (₹149/month, ₹299/month, ₹999/year with a 3-day trial of 5 readings; auto-renews; cancel in Google Play). No ads, ever. | [repo] DEC-011, DEC-043, DEC-044. Read prices from Play/config, never type them in. |
| App features | All 4 parts, lines traced on the photo, compare hands, lessons, quiz, PDF/share card, Hindi + English. | [repo]; [verify] which of these are free |
| Reading time | Show the **measured** p50 only. | [verify] measure on the web build |

---

## 2. Personas

These are six people built from market data, competitor reviews and search patterns. Each one has a "leaves when" list, and those lists are the things our design must never do.

### A. Sunita, 34, Hindi-first, Tier-2 town (for example Kanpur), low-end Android
- **Life:** homemaker who runs a small tailoring business from home; a daughter aged 19.
- **Device and network:** a ₹8–10k Android with 3–4 GB RAM and storage nearly full of WhatsApp media; Jio prepaid with 1.5–2 GB a day. She uses YouTube, WhatsApp, and Google voice search in Hindi. India is 92.8% Android ([StatCounter, Aug 2026](https://gs.statcounter.com/os-market-share/mobile/india)); 55% of Indian internet users are rural and 98% use Indic-language content ([IAMAI–Kantar 2024](https://www.iamai.in/sites/default/files/research/Kantar_%20IAMAI%20report_2024_.pdf)).
- **Goals:** curiosity about herself, and quietly about her daughter's marriage. She wants it "in my own language".
- **Triggers:** a palm-reading reel forwarded on WhatsApp, a wedding in the family, a TV astrology show.
- **Searches** (often voice or Roman Hindi): "हाथ की रेखा देखना", "shadi ki rekha kaise dekhe", "हस्तरेखा ज्ञान", "jeevan rekha chhoti ho to kya hota hai".
- **Fears:** "paise kat jayenge" (money deducted), UPI fraud, her photo being misused, English forms, doing something wrong. New internet users often fear "breaking" something, and sign-ups worry them ([Google, new internet users](https://developers.googleblog.com/en/building-better-products-for-new-internet-users/)).
- **Trusts:** Hindi on every screen, big simple buttons, "इस वेबसाइट पर कोई पेमेंट नहीं", Google sign-in (her Gmail is already on the phone), seeing her own lines. 68% of Indian-language users rate local-language content as more reliable than English ([Google–KPMG 2017](https://assets.kpmg.com/content/dam/kpmg/in/pdf/2017/04/Indian-languages-Defining-Indias-Internet.pdf)).
- **Leaves when:** an English-only step, a slow page, password rules, any word that sounds like payment, a scary line.

### B. Priya, 27, urban Indian English speaker (Bengaluru), mid-range Android
- **Device and network:** a ₹20–30k Android on 5G or Wi-Fi.
- **Triggers:** an Instagram reel, a friend's shared card, a breakup or job switch, Sunday boredom. Gen Z is over 60% of astrology-app users, and about 80% of their questions are about relationships ([Astroyogi report](https://www.republicworld.com/tech/apps/genz-accounts-for-60-user-base-on-astrology-apps-report)).
- **Searches:** "ai palm reading online free", "palm reading app", "heart line meaning", "M on palm meaning".
- **Goals:** fun, a little self-reflection, something good-looking to share.
- **Fears:** data being sold, spam, cringe "astrologer" upsells (gems, pujas), generic text.
- **Trusts:** clean design, a real sample report, "a tradition, not a science" said plainly, speed, a share card that looks premium.
- **Leaves when:** fake counters or timers, forced sign-up, vague text that could fit anyone.

### C. Jessica, 31, curious US user, iPhone
- **Device:** iPhone; 60.7% of US mobile traffic is iOS ([StatCounter, Aug 2026](https://gs.statcounter.com/os-market-share/mobile/united-states-of-america)).
- **Context:** 30% of US adults consult astrology, tarot or fortune tellers at least yearly, mostly "just for fun". Only 1% rely on them a lot for big decisions ([Pew 2025](https://www.pewresearch.org/religion/2025/05/21/3-in-10-americans-consult-astrology-tarot-cards-or-fortune-tellers/)).
- **Searches:** "palm reading online", "free palm reading scanner upload picture", "what does my heart line mean", "broken life line meaning".
- **Fears:** the "$1 trial, then $42 subscription" trap that astrology-app buyers complain about ([Nebula on Trustpilot](https://www.trustpilot.com/review/nebula.app), [Apple Community](https://discussions.apple.com/thread/255702736)); being asked for a card; spam.
- **Trusts:** no card, no sign-up for the first reading, "for fun and reflection" said plainly, a fast result.
- **Our problem:** after 2 readings there is no iPhone app. We must give an honest message and not hide the fact (see §7.2).

### D. Rahul, 29, skeptic (Pune engineer; his mother believes in palmistry)
- **Searches:** "is palmistry real", "can AI read palms", "palm reading app fake".
- **Goals:** test the claim, perhaps to show his mother.
- **Fears:** being fooled by "the same text for everyone". Palm-app reviewers report getting identical readings word for word for different hands ([PalmHD reviews](https://apps.apple.com/us/app/palmhd-palm-reader/id1324828998?see-all=reviews&platform=ipad); [repo] deep-research report).
- **Trusts:** an honest "is palmistry real?" page, lines that sit exactly on the photo, lines marked "not clear" instead of guessed, a source book for each meaning, and an invitation to test the other hand.
- **Leaves when:** "100% accurate", "scientific", "trained on ancient texts", "NASA", "world's first", or reviews that look fake.

### E. Neha, 26, anxious about love, marriage or career (Lucknow / Delhi)
- **State:** family pressure to marry, a recent breakup or a job loss. Often searching late at night.
- **Searches:** "shadi kab hogi hath ki rekha", "vivah rekha tooti ho to", "divorce line in palm", "short life line meaning".
- **Goals:** reassurance, or a verdict.
- **Risk:** fear-based selling elsewhere. Reviewers of large astrology platforms describe warnings of "impending misfortune" followed by paid pujas and gemstones ([Astrotalk on Trustpilot](https://www.trustpilot.com/review/astrotalk.com)).
- **Needs:** a calm, direct answer in the first line; no dates and no fate; something she can do.
- **Leaves when:** we either scare her or pretend to predict. Both lose her.

### F. Anjali, 45, returning learner (Jaipur), Android + family laptop
- **Background:** learned basics from an elder or a book, and likes teaching her children.
- **Searches:** "how to read palm lines", "hast rekha gyan pdf", "mount of venus", "palm reading chart".
- **Goals:** learn, check it on her own palm, compare family hands.
- **Fears:** thin or wrong content, being talked down to.
- **Trusts:** diagrams, Hindi line names, classical sources, a quiz, the same depth on every page.
- **Converts through:** the PDF lead magnet (email opt-in), quizzes, and the app's lessons and compare-hands. She comes back weekly.

---

## 3. Mindset at each funnel stage

For each stage, **think/feel** is the user's inner voice, **risk** is why they drop off, **design** is our answer, and the EN/HI lines are ready-to-use microcopy. Curly-brace values such as `{N}` come from config or live data.

### 3.1 Google search (and WhatsApp/Instagram link previews)
- **Think/feel:** "Free? In Hindi? Will it really read *my* hand, or is it a trick to take money?"
- **Risk:** a "free" title that later demands payment brings bounces and 1-star reviews. A missing or wrong preview on WhatsApp looks like spam.
- **Design:**
  - Make the title and snippet match the query.
  - Say exactly what is free.
  - Give every page its own OG image so WhatsApp shows a real preview (competitors 02 and 04 all preview as the homepage).
  - Use people-first content, not keyword stuffing ([Google](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)).
- **EN title:** "Free AI Palm Reading Online — Your Lines Traced on Your Photo"
- **EN description:** "Upload one palm photo and see your heart, head, life and fate lines drawn on it. First reading free, no sign-up. Hindi & English."
- **HI title:** "मुफ़्त AI हस्तरेखा रीडिंग — अपनी फ़ोटो पर अपनी रेखाएं देखें"
- **HI description:** "हथेली की एक फ़ोटो डालें और उस पर अपनी हृदय, मस्तिष्क, जीवन और भाग्य रेखा देखें। पहली रीडिंग मुफ़्त, बिना साइन-अप। हिंदी और English में।"

### 3.2 Landing (the first 5 seconds)
- **Think/feel:** "Is this real? Is it free? Is it in my language? What will I get?"
- **Risk:** a cluttered hero, a store badge competing with the main action, an English-only first screen, a slow hero image on 4G.
- **Design:**
  - One H1 and one button.
  - A **real sample palm with traced lines** (a photo we own or have consent for).
  - Three true chips.
  - A visible हिंदी / English switch.
  - Hero image under about 150 KB and no autoplay video (competitor 04 preloads a 946 KB video).
- **EN H1:** "See what your palm says — with your own lines drawn on your photo"
- **EN button:** "Read my palm — free"
- **EN chips:** "First reading free · No sign-up · Photo not saved" [verify the photo claim]
- **HI H1:** "आपकी हथेली क्या कहती है — आपकी फ़ोटो पर आपकी असली रेखाएं"
- **HI button:** "मेरी हथेली पढ़ें — मुफ़्त"
- **HI chips:** "पहली रीडिंग मुफ़्त · साइन-अप नहीं · फ़ोटो सेव नहीं होती"

### 3.3 First scroll
- **Think/feel:** "Show me an example. How does it work? What's the catch?"
- **Risk:** hidden terms make people suspicious. Upfront disclosure is one of NN/g's four trust factors ([NN/g](https://www.nngroup.com/articles/trustworthy-design/)).
- **Design:**
  1. The sample report, meaning first.
  2. How it works in three steps.
  3. A **"What's free" box**.
  4. A **"Why is it free?"** line. It answers the Indian "free mein kya fayda?" suspicion honestly.
  5. An honesty box: "a tradition, not a science".
- **EN "What's free":** "On this website: 2 free readings — 1 now, 1 more after a free sign-up. Each shows Love and Personality in full, plus a first look at Career & Money and Life Direction. The full reading is in our Android app (paid)."
- **EN "Why free":** "Why free? So you can see it work on your own palm first. The full reading lives in our app — that's how we pay our bills."
- **EN honesty:** "Palmistry is an old tradition, not a science. We show what the tradition says about your lines — not your future."
- **HI "What's free":** "इस वेबसाइट पर 2 रीडिंग मुफ़्त — 1 अभी, और 1 मुफ़्त साइन-अप के बाद। हर रीडिंग में प्यार और स्वभाव पूरा, और करियर-पैसा व जीवन की दिशा की पहली झलक। पूरी रीडिंग हमारे Android ऐप में है (पैसे वाली)।"
- **HI "Why free":** "मुफ़्त क्यों? ताकि आप पहले अपनी हथेली पर खुद देख लें कि यह काम करता है। पूरी रीडिंग हमारे ऐप में है — उसी से हमारा ख़र्च चलता है।"
- **HI honesty:** "हस्तरेखा एक पुरानी परंपरा है, विज्ञान नहीं। हम बताते हैं कि परंपरा आपकी रेखाओं के बारे में क्या कहती है — आपका भविष्य नहीं।"

### 3.4 Upload decision (the biggest fear moment)
- **Think/feel:** "Where does my hand photo go? Can someone misuse it — it's like a fingerprint? Will my photo even work? Why does it want my camera?"
- **Evidence:** a palm-app reviewer wrote "Don't let them have access to pictures of your hands/fingerprints… they have all the info they need to steal your identity" ([Palmist reviews](https://justuseapp.com/en/app/973861216/palmist/reviews)). 87% of Indians believe some of their personal data has already leaked ([LocalCircles](https://www.localcircles.com/a/press/page/personal-data-leakage)).
- **Risk:** privacy fear, fear of failure, camera permission denied, uploads failing inside WhatsApp or Instagram's in-app browser.
- **Design:**
  - A privacy line right under the button, with a "What happens to my photo?" link.
  - Photo tips as three picture chips.
  - A hand choice with a default.
  - A one-line explanation **before** the browser's camera prompt.
  - A gallery fallback.
  - An **in-browser photo check** that runs before anything is sent.
  - Promise: a failed or unclear photo does not use up a free reading. [verify, rec]
- **EN privacy line:** "Your photo is used once to find your lines, then deleted. We don't keep it, sell it, or use it to identify you." [verify]
- **EN tips:** "Open palm · Good light · Whole hand in the frame"
- **EN hand:** "Which hand? Most people start with the hand they write with."
- **EN before camera:** "Your browser will ask to use the camera. We only take one photo of your palm."
- **EN photo too dark:** "Too dark — move near a window or turn on a light."
- **EN photo blurry:** "A little blurry — hold the phone still for a second."
- **EN mehndi or ink:** "Mehndi or ink can hide lines. If a line isn't clear, we'll tell you instead of guessing."
- **EN failed check:** "This photo didn't work — and it didn't use up your free reading." [verify]
- **HI privacy line:** "आपकी फ़ोटो सिर्फ़ एक बार रेखाएं ढूंढने के लिए इस्तेमाल होती है, फिर हटा दी जाती है। हम इसे न रखते हैं, न बेचते हैं, न इससे आपकी पहचान करते हैं।"
- **HI tips:** "खुली हथेली · अच्छी रोशनी · पूरा हाथ फ़्रेम में"
- **HI hand:** "कौन सा हाथ? ज़्यादातर लोग उस हाथ से शुरू करते हैं जिससे लिखते हैं।"
- **HI before camera:** "ब्राउज़र कैमरा इस्तेमाल करने की अनुमति मांगेगा। हम सिर्फ़ आपकी हथेली की एक फ़ोटो लेंगे।"
- **HI photo too dark:** "फ़ोटो में अंधेरा है — खिड़की के पास जाएं या लाइट जलाएं।"
- **HI photo blurry:** "फ़ोटो थोड़ी धुंधली है — एक सेकंड फ़ोन स्थिर रखें।"
- **HI mehndi or ink:** "मेहंदी या स्याही से रेखाएं छिप सकती हैं। कोई रेखा साफ़ न दिखे तो हम अंदाज़ा नहीं लगाएंगे, आपको बता देंगे।"
- **HI failed check:** "यह फ़ोटो काम नहीं आई — और आपकी मुफ़्त रीडिंग ख़र्च नहीं हुई।"

### 3.5 Waiting
- **Think/feel:** "Is it stuck? Is it doing anything real? Is my data going somewhere?"
- **Evidence:**
  - Unexplained and anxious waits feel longer ([Maister](https://www.columbia.edu/~ww2040/4615S13/Psychology_of_Waiting_Lines.pdf)).
  - Past about 10 seconds, users need to see progress and status ([NN/g](https://www.nngroup.com/articles/response-times-3-important-limits/)).
  - Showing real work raises perceived value, the "labor illusion" ([Buell & Norton 2011](https://www.hbs.edu/faculty/Pages/item.aspx?num=40158)). This works only when the work is real. Staged steps such as "comparing with thousands of palms" (competitor 02) are fake, and a skeptic spots them.
- **Design:**
  - Show only steps that match **real pipeline events**, each ticking when its event actually happens.
  - Draw the traced lines on the photo as soon as they exist. They must sit exactly on the lines, because misaligned animation looked "rushed and untrustworthy" to the owner before.
  - Give an honest time estimate from measured p50.
  - After p90, offer a way out.
- **EN steps:** "Checking your photo ✓ → Finding your hand ✓ → Tracing your heart line… → head line → life line → fate line → Writing your reading"
- **EN time:** "Usually about {p50} seconds."
- **EN slow:** "Taking longer than usual — your internet may be slow. You can wait, or try again. Trying again won't use a free reading." [verify]
- **HI steps:** "फ़ोटो जांच रहे हैं ✓ → हाथ ढूंढ रहे हैं ✓ → हृदय रेखा बना रहे हैं… → मस्तिष्क रेखा → जीवन रेखा → भाग्य रेखा → आपकी रीडिंग लिख रहे हैं"
- **HI time:** "आमतौर पर लगभग {p50} सेकंड।"
- **HI slow:** "आज थोड़ा ज़्यादा समय लग रहा है — शायद इंटरनेट धीमा है। रुकें, या दोबारा कोशिश करें। दोबारा कोशिश से मुफ़्त रीडिंग ख़र्च नहीं होगी।"

### 3.6 Report reveal (the peak)
- **Think/feel:** "Is this really about *me*, or would anyone get this?"
- **Evidence:**
  - People rate generic personality text 4.26/5 as "accurate" ([Forer / Barnum effect](https://en.wikipedia.org/wiki/Barnum_effect)). The same effect makes skeptics call palm apps fake once they notice.
  - People remember an experience by its peak and its end ([Kahneman et al. 1993](https://journals.sagepub.com/doi/10.1111/j.1467-9280.1993.tb00589.x)).
  - People accept imperfect algorithms more when they have a little control ([Dietvorst et al. 2018](https://faculty.wharton.upenn.edu/wp-content/uploads/2016/08/Dietvorst-Simmons-Massey-2018.pdf)).
- **Design:**
  1. The first screen shows the headline meaning **and** the traced photo together (meaning-first, per the owner's report standard).
  2. Each meaning follows the pattern "what we see on your line → what the tradition reads", plus the source book, as the app already does (FEAT-009).
  3. Unclear lines are shown as "not clear", not guessed.
  4. A "check it on your own hand" prompt: the user looks at their real palm and confirms it. This is self-verification.
  5. A kind, useful closing line (the peak-end effect).
  6. "Try your other hand" as the second-reading hook. It also invites the "does every hand get the same text?" test, which we pass.
- **EN header:** "Your palm, your lines"
- **EN evidence line:** "Your heart line curves up toward your first finger (the red line). In palmistry this is read as warm, open-hearted love."
- **EN unclear:** "Your fate line isn't clear in this photo. We didn't guess."
- **EN self-check:** "Look at your own hand now — can you see this curve?"
- **HI header:** "आपकी हथेली, आपकी रेखाएं"
- **HI evidence line:** "आपकी हृदय रेखा ऊपर तर्जनी उंगली की ओर मुड़ती है (लाल रेखा)। हस्तरेखा में इसे खुले दिल और गर्मजोशी वाले प्यार का संकेत माना जाता है।"
- **HI unclear:** "इस फ़ोटो में आपकी भाग्य रेखा साफ़ नहीं दिखी। हमने अंदाज़ा नहीं लगाया।"
- **HI self-check:** "अब अपना हाथ देखिए — क्या आपको यह मोड़ दिख रहा है?"

### 3.7 The lock (after report 1)
- **Think/feel:** "Ah, the catch." Or: "I want the career part — how do I get it?"
- **Risk:** feeling baited. That happens when the lock was not mentioned before the scan, when the preview is fake, or when sign-up is implied to open it.
- **Design:**
  - The lock was already announced (§3.3).
  - The preview is the **real first sentence**.
  - Progress is shown honestly: "2 of 4 parts".
  - Two honest paths, with the dominant one chosen by context:
    - The default primary is **"read one more palm free (sign up)"**. It is the lower commitment step ([NN/g hierarchy](https://www.nngroup.com/articles/commitment-levels/)).
    - If the user **taps a locked part**, that is peak intent for that content, so the app becomes the primary for that sheet.
- **EN locked card:** "Career & Money — '{real first sentence}' … The rest of this part is in the app."
- **EN progress:** "You've read 2 of 4 parts."
- **EN primary:** "Read one more palm free — sign up"
- **EN secondary:** "See the full reading in the app"
- **EN note:** "Signing up gives you a new reading. It doesn't open the locked parts of this one."
- **HI locked card:** "करियर और पैसा — '{असली पहला वाक्य}' … इस हिस्से का बाकी ऐप में है।"
- **HI progress:** "आपने 4 में से 2 हिस्से पढ़ लिए।"
- **HI primary:** "एक और हथेली मुफ़्त पढ़ें — साइन-अप करें"
- **HI secondary:** "पूरी रीडिंग ऐप में देखें"
- **HI note:** "साइन-अप करने से एक नई रीडिंग मिलती है। इस रीडिंग के बंद हिस्से नहीं खुलते।"

### 3.8 Sign-up
- **Think/feel:** "Now the spam starts. Another password. Why do they need this?"
- **Evidence:**
  - 18% of shoppers abandon a checkout when forced to create an account ([Baymard 2025](https://baymard.com/lists/cart-abandonment-rate)).
  - 95% of Indians get unwanted calls every day ([LocalCircles 2024](https://www.localcircles.com/a/press/page/pesky-calls-survey-2024)), so any contact detail feels risky.
  - Under DPDP, the notice must be itemised and in plain language, available in English or any Eighth Schedule language (s.5(3)), and withdrawal must be as easy as consent (s.6(4)) ([DPDP s.5](https://www.dpdpa.com/dpdpa2023/chapter-2/section5.html), [s.6](https://www.dpdpa.com/dpdpa2023/chapter-2/section6.html), [Rules 2025](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251117695301.pdf)).
- **Design:**
  - Put **Continue with Google** first. Every Android user already has a Google account, so it means no typing.
  - Email + password second (the same as the app). Show the password rules upfront.
  - Say exactly which emails we send.
  - Marketing opt-in is a separate, **unticked** box.
  - Delete account is one link away.
  - No phone number.
- **EN headline:** "Sign up free to read one more palm — your other hand, or someone at home."
- **EN email promise:** "We only email you about your account. Palm tips only if you tick the box."
- **EN checkbox (unticked):** "Send me one palm tip a week (stop anytime)."
- **EN notice:** "We use your email to create your account and give your free reading. Delete your account anytime in Settings."
- **HI headline:** "मुफ़्त साइन-अप करें और एक और हथेली पढ़ें — अपना दूसरा हाथ, या घर में किसी और का।"
- **HI email promise:** "हम ईमेल सिर्फ़ आपके अकाउंट के बारे में भेजेंगे। हस्तरेखा टिप्स तभी, जब आप नीचे वाला बॉक्स चुनें।"
- **HI checkbox:** "हर हफ़्ते हस्तरेखा की एक टिप भेजें (कभी भी बंद कर सकते हैं)।"
- **HI notice:** "आपका ईमेल सिर्फ़ अकाउंट बनाने और आपकी मुफ़्त रीडिंग देने के लिए है। अकाउंट कभी भी Settings में जाकर हटा सकते हैं।"

### 3.9 Second report
- **Think/feel:** "Let me try the other hand / my husband's hand." For Rahul: "Will it say the same thing again?"
- **Design:**
  - Suggest the other hand, with the tradition explained.
  - Say clearly that this is the last free web reading, **before** the scan, not after.
  - After the reveal, a side-by-side "your two hands" teaser (full compare-hands is in the app).
- **EN before scan:** "This is your 2nd and last free reading on the website."
- **EN tip:** "Many palm readers say the hand you don't write with shows what you were born with, and your writing hand shows what you've made of it."
- **HI before scan:** "यह वेबसाइट पर आपकी दूसरी और आख़िरी मुफ़्त रीडिंग है।"
- **HI tip:** "कई हस्तरेखा जानकार मानते हैं कि जिस हाथ से आप नहीं लिखते, वह जन्म का स्वभाव दिखाता है, और लिखने वाला हाथ बताता है कि आपने उसे कैसे जिया।"

### 3.10 Zero free readings
- **Think/feel:** disappointment, or "so it was a trap after all".
- **Risk:** a dead end, guilt copy, nagging, or a surprise price on Play.
- **Design:**
  - Thank them.
  - Show that their readings are saved **in this browser**, with a "save as image" option so they keep what they got.
  - One clear next step (the app), with the **price truth**.
  - A free non-app path (guides, tools, quiz), so there is no wall.
  - Never guilt ("Don't you care about your future?" is confirm shaming).
- **EN:** "You've used both free web readings. Your 2 readings are saved in this browser — clearing browser data removes them. Save them as images to keep."
- **EN app card:** "Want the full reading? The Android app has all 4 parts, lessons, and compare-your-hands. Free to install. Full readings: one-time packs from ₹199, or a plan you can cancel anytime in Google Play."
- **EN shared allowance:** "Your 2 free readings count across the website and the app." [verify, then show only if true]
- **EN alternative:** "Not now? Keep learning free — guides and tools."
- **HI:** "आपने वेबसाइट की दोनों मुफ़्त रीडिंग इस्तेमाल कर लीं। आपकी 2 रीडिंग इसी ब्राउज़र में सेव हैं — ब्राउज़र का डेटा साफ़ करने पर ये हट जाएंगी। रखना चाहें तो इमेज के रूप में सेव कर लें।"
- **HI app card:** "पूरी रीडिंग चाहिए? Android ऐप में चारों हिस्से, सीखने के पाठ और दोनों हाथों की तुलना। ऐप डाउनलोड मुफ़्त। पूरी रीडिंग: ₹199 से एक-बार वाले पैक, या ऐसा प्लान जिसे Google Play में कभी भी बंद कर सकते हैं।"
- **HI shared allowance:** "आपकी 2 मुफ़्त रीडिंग वेबसाइट और ऐप दोनों में मिलाकर गिनी जाती हैं।"
- **HI alternative:** "अभी नहीं? मुफ़्त में सीखते रहें — गाइड और टूल।"

### 3.11 Play Store click
- **Think/feel:** "Will it fit on my phone? Is this the real app or some APK? Will it start asking for money right away?"
- **Evidence:** app reviewers call it "bait and switch" when "free" turns into a paywall. "Not a single one of your good reviews mentions having to pay" ([Palmist reviews](https://justuseapp.com/en/app/973861216/palmist/reviews)). Surprise costs are the top reason for abandonment, at 40% ([Baymard](https://baymard.com/lists/cart-abandonment-rate)).
- **Design:**
  - A device-aware button (§7.2).
  - Size and price truth right under it.
  - Link only to Google Play, never to an APK.
  - The same visuals and words as the Play listing (message match).
- **EN under badge:** "Free download · about {X} MB · optional paid readings · no ads"
- **EN safety:** "Only from Google Play — never an APK file."
- **HI under badge:** "मुफ़्त डाउनलोड · लगभग {X} MB · पैसे वाली रीडिंग आपकी मर्ज़ी से · कोई विज्ञापन नहीं"
- **HI safety:** "सिर्फ़ Google Play से — कोई APK फ़ाइल नहीं।"

### 3.12 App install and first open
- **Think/feel:** "Does it remember me? Do I start from zero?"
- **Risk:** web readings live only in the browser. If the app silently asks for a new scan, or asks for payment without saying why, it feels like a bait and switch.
- **Design:**
  - Say it **on the web before install**: "In the app you'll take a fresh photo (about a minute)".
  - Tell them to sign in with the same account.
  - Optional app work: a "Welcome from the website" first screen for `utm_source=web` installs. It should explain the free-reading status in one line. [rec, app change]
- **EN:** "In the app you'll take a fresh photo — it takes about a minute. Sign in with the same account."
- **HI:** "ऐप में एक नई फ़ोटो लेनी होगी — करीब एक मिनट लगता है। उसी अकाउंट से साइन-इन करें।"
- **Bigger lever** [rec, needs owner approval]: carry the web reading to the account (observations only, never the photo). The app could then open the locked parts without a re-scan, which uses the endowment and goal-gradient effects. The trade-off: without the photo, the app cannot show the traced overlay for that reading.

---

## 4. Fears, and the trust mechanics that remove them

Every mechanic below must be **true on launch day**. If one is not true, change the product or drop the claim.

| Fear | What we show | Where | Exact wording (EN / HI) | Must be true |
|---|---|---|---|---|
| **Palm photo privacy / misuse / "it's like a fingerprint"** | Privacy line at upload; a "What happens to my photo?" page listing each step and processor; EXIF stripped; no photo in share cards unless the user chooses. | Upload point, reading page, footer | "Your photo is used once to find your lines, then deleted. We don't keep it, sell it, or use it to identify you." / "आपकी फ़ोटो सिर्फ़ एक बार रेखाएं ढूंढने के लिए इस्तेमाल होती है, फिर हटा दी जाती है…" | No server storage (S-169/S-275); named processors and their log retention; EXIF strip (S-203) [verify] |
| **"Is this a scam? Will I be charged?"** | "No payment on this website." Company name, real contact and address in the footer; no card or UPI field anywhere on the web. | Hero chip, footer, lock, 0-reading screen | "We never ask for card or UPI on this website." / "इस वेबसाइट पर हम कभी कार्ड या UPI नहीं मांगते।" | No web payments ([repo] plan) |
| **Hidden subscriptions** (the top complaint in 1,833 competitor 1–3★ reviews, [repo] DEC-011; [Nebula](https://www.trustpilot.com/review/nebula.app)) | App price truth next to every store button or one tap away: packs are one-time; plans auto-renew, trial length stated, cancel in Google Play. The Play paywall already shows the trial timeline and Day-2 reminder (DEC-038). | Store buttons, /app page, 0-reading screen | "Packs are one-time. Plans renew until you cancel in Google Play — we remind you before a trial ends." / "पैक एक बार के होते हैं। प्लान तब तक चलते हैं जब तक आप Google Play में बंद न करें — ट्रायल ख़त्म होने से पहले हम याद दिलाते हैं।" | Day-2 trial reminder live (DEC-038) [verify on phone]; prices from config |
| **Spam after giving email** | Exact list of the emails we send; an unticked opt-in; one-click unsubscribe; no phone number asked; delete account in Settings. | Sign-up form, footer of every email | "We only email you about your account…" (§3.8) | Email system sends only what we promise; an unsubscribe link; a physical address in marketing email for US law ([CAN-SPAM](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business)) |
| **Bad or scary predictions** (death, divorce, childlessness) | A "What palmistry can't tell you" box on every reading and guide; no dates, ages or outcomes; a calm first line (see §6). | Reading, line guides, topic guides | "No line on your palm can tell how long you'll live, whether you'll marry, or whether you'll have children." / "हथेली की कोई रेखा यह नहीं बता सकती कि आप कितना जिएंगे, शादी होगी या नहीं, या संतान होगी या नहीं।" | Report text rules (no health section already) |
| **Feeling judged** (rough or dark hands, scars, mehndi, a "bad" hand, embarrassment at believing) | Never comment on how a hand looks; neutral line colours; "for fun and reflection" framing; readings private by default; share is optional and previewed. | Upload tips, reading, share sheet | "Every hand is readable — rough hands, scars and mehndi are fine. We only look at the lines." / "हर हाथ पढ़ा जा सकता है — खुरदरे हाथ, निशान या मेहंदी, कोई बात नहीं। हम सिर्फ़ रेखाएं देखते हैं।" | Report writer has no appearance words |
| **Data sold** | "We don't sell your data. No ads, ever." Privacy page names every processor. No ad or remarketing pixels on reading pages (competitor 03's policy was contradicted by its own AdSense script). | Footer, privacy page, sign-up | "We don't sell your data, and there are no ads — ever." / "हम आपका डेटा नहीं बेचते, और कोई विज्ञापन नहीं — कभी नहीं।" | DEC-011 no ads; analytics list matches the policy |
| **Fake AI / "same text for everyone"** (PalmHD reviews) | Lines drawn on their photo; evidence sentence for each meaning; a source book for each meaning; "not clear" states; "Try your other hand — different lines, different reading"; a "How our AI reads your palm" page (what the scanner finds, what the AI writes, what is tradition). | Reveal, second-reading hook, /how-it-works | "Our AI finds and traces your lines. The meanings come from classical palmistry books — the source is under each one." / "हमारा AI आपकी रेखाएं ढूंढकर बनाता है। उनके अर्थ पुरानी हस्तरेखा किताबों से हैं — हर अर्थ के नीचे किताब का नाम है।" | Sources per rule exist ([repo] FEAT-009) |
| **"I'll make a mistake" / language** (new internet users) | Hindi everywhere, including errors; icons always with words; undo and retry everywhere; a failed photo costs nothing. | Whole flow | "Nothing can go wrong — you can always try again." / "कुछ ग़लत नहीं होगा — आप कभी भी दोबारा कोशिश कर सकते हैं।" | Retry does not consume a reading [verify] |

**Trust basics on every page:**
- Company name and a real contact (competitors use a Gmail address or no entity).
- About page with real people.
- Privacy page, terms, and a delete-account page.
- Age rule stated. Under DPDP, under-18s need verifiable parental consent, so state 18+ or build proper consent; competitor 02's 13+ is a risk.
- A "last updated" date on every guide.

---

## 5. Honest motivation: what we use, what we never use

### 5.1 Levers we use (ethical and effective)

| Lever | Evidence | How we use it (true version) | Never |
|---|---|---|---|
| **Real scarcity** | Scarce things feel more valuable ([Worchel et al. 1975](https://www.semanticscholar.org/paper/Effects-of-Supply-and-Demand-on-Ratings-of-Object-Worchel-Lee/e80a3b8c8b27fa69cc6f4fb4c4e497f705f07a89)); genuine urgency works, fake urgency destroys trust once noticed ([CXL](https://cxl.com/blog/creating-urgency/)) | "2 free readings on the website", with a real counter: "1 of 2 used" / "2 में से 1 इस्तेमाल हुई" | Timers, "only 3 left today", "offer ends" |
| **Curiosity gap** | Curiosity comes from a noticed gap in knowledge ([Loewenstein 1994](https://www.researchgate.net/publication/232440476_The_Psychology_of_Curiosity_A_Review_and_Reinterpretation)) | The real first sentence of each locked part; locked part names match what the app delivers | Blurred fake text, "██" teasers (competitor 02), teasing sections we have no evidence for (if a part has no evidence, say so) |
| **Goal gradient** | People speed up near a goal ([Kivetz et al. 2006](https://business.columbia.edu/insights/chazen-global-insights/goal-gradient-hypothesis-resurrected-purchase-acceleration)) | "2 of 4 parts read", pipeline steps ticking as they really finish | Progress bars that move on a timer |
| **Endowed progress** | Pre-filled progress raises completion ([Nunes & Drèze 2006](https://en.wikipedia.org/wiki/Goal_pursuit)) | Only progress the user really made ("Photo checked ✓, hand found ✓") | Artificial "you're 80% done" bonuses |
| **Personalisation from their own lines** | Specific, checkable statements beat Barnum text, and "because" reasons are persuasive when true | Every meaning names the visible feature it comes from; "check it on your hand" | Vague lines that fit anyone |
| **Reciprocity** | Give value first ([NN/g](https://www.nngroup.com/articles/login-walls/)); visible effort creates reciprocity ([Buell & Norton](https://www.hbs.edu/faculty/Pages/item.aspx?num=40158)) | A useful free reading, then "save as image", free guides and tools, the PDF | Gifts that require payment details |
| **Authority, honestly** | Credibility needs up-front disclosure and connection to outside sources ([NN/g](https://www.nngroup.com/articles/trustworthy-design/)) | A classical source under each meaning; a named author or reviewer on guides | "Trained on 1,000+ Shastra texts", "NASA", "world's first" |
| **Social proof, only when real** | Social proof helps, but low numbers backfire ([NN/g](https://www.nngroup.com/articles/social-proof-ux/)); people distrust on-site testimonials ([NN/g](https://www.nngroup.com/articles/social-proof-ux/)) | The live Play rating with its count and a link, **only once it is meaningful** [rec: ≥ 4.0 and ≥ 100 ratings]; live DB totals, rounded down and dated ("{N} palms read on this website since {date}"), excluding test and bot runs | Hard-coded counts, "viewing now", "just downloaded" toasts (competitor 04), "Illustrative" testimonials (competitor 05) |
| **Identity and sharing** | Archetype cards get shared (competitors 03 and 05) | A share card drawn on the user's own traced lines, with a preview of exactly what is shared, and the name off by default | A public indexable page of someone's reading |
| **Seasonal relevance** | Real moments drive interest (competitor 02's Diwali angle) | Content tied to real events (Karva Chauth, wedding season, Valentine's) | Deadlines tied to those events |

### 5.2 Loss framing: the limits
Loss aversion is strong, and that is why it gets abused.
- **Allowed:** only for true, useful facts.
  - "Readings are saved in this browser only — clearing data removes them."
  - "This is your last free web reading."
- **Not allowed:**
  - "Don't miss your destiny."
  - "Your reading will be lost if you leave" (untrue, since it is saved).
  - "Offer ends tonight."
  - Anything tying fear about love, health or family to a purchase.

Aggressive dark patterns can quadruple sign-ups for a dubious service in experiments (11.3% → 37.2%, [Luguri & Strahilevitz 2021](https://academic.oup.com/jla/article/13/1/43/6180579)). That is exactly why regulators now target them. People who recognise a persuasion tactic also discount the brand behind it ([Friestad & Wright 1994](https://academic.oup.com/jcr/article-abstract/21/1/1/1853712)), and the skeptic persona recognises them.

### 5.3 Dark patterns we will never ship

**India — CCPA Guidelines for Prevention and Regulation of Dark Patterns, 2023** (notified 30 Nov 2023; they cover websites and apps; [summary](https://www.lexology.com/library/detail.aspx?g=9be57080-d215-45a8-b988-27acfc083de4), [definitions](https://www.nls.ac.in/wp-content/uploads/2021/04/Dark-Patterns.pdf)). CCPA told platforms to self-audit within 3 months on 5 June 2025 ([advisory](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2134765)). A false or misleading ad can bring up to 2 years' jail and a ₹10 lakh fine for a first offence (Consumer Protection Act s.89). 52 of India's top 53 apps used deceptive patterns in 2024 ([ASCI](https://www.ascionline.in/wp-content/uploads/2024/08/Consious-Patterns-Report-Summary.pdf)). Being clean is a real point of difference.

| # | CCPA pattern | What it would look like on our site | Our rule |
|---|---|---|---|
| 1 | False urgency (incl. false popularity) | Timers, "120 people reading now", "only today" | Never. Show only real, dated counts, or none. |
| 2 | Basket sneaking | (Web has no checkout.) The app adding a plan to a pack buy | Never pre-add anything. |
| 3 | Confirm shaming | "No thanks, I don't care about my love life" | Plain "Not now" / "अभी नहीं". |
| 4 | Forced action | Email required before the first reading; phone number required; app install required to see free content | First reading needs nothing; the second needs only an account; no phone. |
| 5 | Subscription trap | App trial without clear cancel steps | Web explains "cancel in Google Play"; the app keeps the trial timeline and reminder. |
| 6 | Interface interference | A huge "Install" next to a tiny grey "Continue on web" | Secondary options stay readable (AA contrast, ≥ 48 dp targets). |
| 7 | Bait and switch | Implying sign-up opens the locked parts; "free reading" that turns out to be a teaser only | Copy says exactly what sign-up gives (§3.7). |
| 8 | **Drip pricing**, incl. "advertised as free without disclosing that continued use needs an in-app purchase" | "Free palm reading" with the paid app revealed only at the end | "What's free" box on the landing page, price line next to store buttons. |
| 9 | Disguised advertisement | Sponsored or affiliate posts styled as guides | No hidden ads; label anything sponsored. |
| 10 | **Nagging** | App-install banners on every page view; repeated "get the app" pop-ups | One dismissible banner; after dismissal, hidden for 30 days [rec]; never an interstitial. |
| 11 | Trick question | "Uncheck to not stop receiving tips" | Positive, single-meaning wording; unticked opt-ins. |
| 12 | SaaS billing | Silent renewals | App: trial reminder and a clear renewal line (DEC-038/044). |
| 13 | Rogue malware | Scareware, APK downloads | Play links only. |

**India, also:**
- ASCI guidelines on deceptive design in ads: drip pricing, bait and switch, false urgency, disguised ads ([ThePrint](https://theprint.in/economy/drip-pricing-false-urgency-asci-releases-new-guidelines-to-curb-dark-patterns-in-online-ads/1627815/)).
- DPDP: plain-language itemised notice, withdrawal as easy as consent, parental consent for under-18s.

**US:**
- FTC Act §5 (deception).
- **FTC Rule on Consumer Reviews and Testimonials, 16 CFR 465** (in force 21 Oct 2024). It bans fake or AI-written reviews, reviews by people with no real experience, review suppression, and fake social-media indicators. Penalties are up to about $51,744 per violation ([FTC](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials)).
- The FTC's *Bringing Dark Patterns to Light* report (2022) names disguised ads, hard cancellation, buried terms and data-sharing tricks ([FTC](https://www.ftc.gov/news-events/news/press-releases/2022/09/ftc-report-shows-rise-sophisticated-dark-patterns-designed-trick-trap-consumers)).
- The "click-to-cancel" rule was vacated on 8 July 2025 ([Mayer Brown](https://www.mayerbrown.com/en/insights/publications/2025/07/click-to-cancelled-eighth-circuit-vacates-federal-trade-commissions-revised-negative-option-rule)), but ROSCA and state auto-renewal laws still apply. Easy cancellation stays our rule.
- CAN-SPAM for any marketing email.

**Google:**
- Play Misleading Claims / Deceptive Behavior policy. A palm-reading app was repeatedly rejected for misleading claims ([Play community thread](https://support.google.com/googleplay/android-developer/thread/343307498/palm-reading-app-keeps-getting-rejected-misleading-claims-%E2%80%93-app-almost-at-risk-of-suspension?hl=en)).
- Play Subscriptions policy (disclose price, billing period, renewal and how to cancel; [Play](https://support.google.com/googleplay/android-developer/answer/9900533?hl=en)).
- Play Ratings/Reviews policy (no incentivised ratings; [Play](https://support.google.com/googleplay/android-developer/answer/9898684?hl=en)).
- Search guidance: no intrusive interstitials, including app-install prompts ([Google](https://developers.google.com/search/docs/appearance/avoid-intrusive-interstitials)).

---

## 6. Emotional design for bad-news lines

### 6.1 Why this matters
- Negative expectations can cause real distress and even physical symptoms (the nocebo effect; [The Conversation](https://theconversation.com/six-surprising-things-about-placebos-everyone-should-know-220829)).
- Anxious people read to find the verdict. They scan for one frightening word.
- Our Neha persona arrives already scared. Competitors earn money from that fear (misfortune warnings, then pujas or gems). Co–Star's blunt notifications became a meme precisely because harsh astrology stings ([Daily Dot](https://www.dailydot.com/unclick/co-star-astrology-app-push-notifications-memes/)).
- The owner decided these topics get honest guides: the tradition explained, no predictions.

### 6.2 Tone rules
1. **Answer the fear in the first sentence**, calmly. Don't make an anxious reader scroll.
2. **Normalise:** "This is very common."
3. **Attribute, never predict:** "Palmistry books read this as…" / "परंपरा में इसे … माना जाता है". Never "you will".
4. **No dates, ages, lifespan, illness, divorce, children count or money amounts.** Ever.
5. **Name the scary folk reading only to take it apart** ("Some books call this a divorce sign. It can't tell that.").
6. **Offer the photo explanation when it is true:** a line can look broken or short because of light, a crease or the crop.
7. **End with agency:** something the person controls.
8. **Always include a "What palmistry can't tell you" box.**
9. **No remedies for sale:** no gems, pujas or mantras.
10. **Visual calm:** no red or warning icons for "bad" lines; the same colour for every line; no dramatic imagery.
11. **Hindi register:** warm "आप", everyday words. Avoid fear-heavy words (see §6.5).
12. **Care line on lifespan and death-anxiety guides only**, small and at the end. India: Tele-MANAS **14416** or 1-800-891-4416, free and 24×7 in 20+ languages ([Tele-MANAS](https://telemanas.mohfw.gov.in/)). US: **988**.

### 6.3 The three-part block used for every sensitive meaning
1. **What we see** (neutral description of the line).
2. **What the tradition says** (the most common, calm reading, attributed).
3. **What it can't tell you, and what you can do.**

### 6.4 Copy examples

**Short life line**
- EN: "Your life line looks short in this photo. That's very common — and in palmistry, the life line's length is **not** read as how long you'll live. Traditionally it's linked to your energy and how you handle big changes. A line can also look short when the photo crops it or the light is flat. *Palmistry can't tell your lifespan or your health — for health, talk to a doctor.*"
- HI: "इस फ़ोटो में आपकी जीवन रेखा छोटी दिख रही है। ऐसा बहुत लोगों में होता है — और हस्तरेखा में जीवन रेखा की लंबाई से उम्र **नहीं** आंकी जाती। परंपरा में इसे आपकी ऊर्जा और बड़े बदलावों को संभालने के तरीके से जोड़ा जाता है। फ़ोटो में रेखा कट जाए या रोशनी कम हो, तब भी रेखा छोटी दिख सकती है। *हस्तरेखा उम्र या सेहत नहीं बता सकती — सेहत के लिए डॉक्टर से बात करें।*"

**Broken life line**
- EN: "There's a gap in your life line. Palm readers traditionally read a break as a change of direction — a move, a new job, a new chapter — not as danger. If the new part runs alongside the old one for a bit, it's read as a smooth change."
- HI: "आपकी जीवन रेखा में एक जगह गैप है। परंपरा में टूटी रेखा को ख़तरा नहीं, बल्कि दिशा में बदलाव माना जाता है — नई जगह, नया काम, ज़िंदगी का नया दौर। अगर नई रेखा पुरानी के साथ थोड़ी दूर तक चलती है, तो इसे आसान बदलाव माना जाता है।"

**"Divorce line" (a broken or forked marriage line)**
- EN: "Some books call a broken or forked marriage line a 'divorce sign'. Many palm readers today don't read it that way — the small lines under your little finger can't tell anyone's future in a marriage. Traditionally a break is read as a phase that needs attention: talking, time, a change. A relationship depends on the two people in it, not on a line."
- HI: "कुछ किताबें टूटी या दो-मुंही विवाह रेखा को 'तलाक का संकेत' कहती हैं। आज कई हस्तरेखा जानकार ऐसा नहीं मानते — छोटी उंगली के नीचे की ये छोटी रेखाएं किसी की शादी का भविष्य नहीं बता सकतीं। परंपरा में टूटी रेखा को ऐसे दौर की तरह पढ़ा जाता है जिसमें ध्यान देने की ज़रूरत हो — बात करना, थोड़ा समय, कोई बदलाव। रिश्ता दो लोगों से चलता है, रेखा से नहीं।"

**"When will I marry?"**
- EN: "Palmistry books give marriage-line 'ages', but they disagree with each other, and no line can give a date. What the tradition does describe is *how* you love — and that's in your heart line."
- HI: "हस्तरेखा की किताबें विवाह रेखा से 'उम्र' बताती हैं, पर वे आपस में ही मेल नहीं खातीं, और कोई रेखा तारीख़ नहीं बता सकती। परंपरा जो बताती है, वह है आप *कैसे* प्यार करते हैं — और वह आपकी हृदय रेखा में है।"

**Children lines**
- EN: "Old books link tiny lines near the marriage line to children. A palm can't tell whether you'll have children or how many — that depends on life, health and choice, not on lines."
- HI: "पुरानी किताबें विवाह रेखा के पास की बारीक रेखाओं को संतान से जोड़ती हैं। हथेली यह नहीं बता सकती कि आपके बच्चे होंगे या कितने — यह ज़िंदगी, सेहत और आपकी पसंद पर निर्भर है, रेखाओं पर नहीं।"

**Island on the life line** (guides only; the report has no health section)
- EN: "An 'island' on the life line is traditionally read as a tiring or stressful period. It's not a diagnosis. If you're worried about your health, please see a doctor."
- HI: "जीवन रेखा पर 'द्वीप' को परंपरा में थकान या तनाव वाले दौर से जोड़ा जाता है। यह किसी बीमारी की जांच नहीं है। सेहत की चिंता हो तो डॉक्टर को दिखाएं।"

**Faint or unclear line**
- EN: "This line is faint in the photo. Faint doesn't mean weak — it may just be the light."
- HI: "फ़ोटो में यह रेखा हल्की दिख रही है। हल्की का मतलब कमज़ोर नहीं — हो सकता है रोशनी की वजह से हो।"

**Care line** (lifespan and death-anxiety guides only)
- EN: "If this topic is weighing on you, talking helps. In India, call Tele-MANAS on 14416 (free, 24×7). In the US, call or text 988."
- HI: "अगर यह बात आपको परेशान कर रही है, तो किसी से बात करना मदद करता है। भारत में Tele-MANAS 14416 पर कॉल करें (मुफ़्त, 24×7)।"

### 6.5 Words and phrases

| Use (EN) | Use (HI) | Never (EN) | Never (HI) |
|---|---|---|---|
| tradition says, is read as | परंपरा में माना जाता है | you will, destined, guaranteed | आपके साथ होगा, तय है, पक्का |
| tendency, style, phase | झुकाव, स्वभाव, दौर | danger, warning, bad sign | ख़तरा, चेतावनी, बुरा संकेत |
| change of direction | दिशा में बदलाव | death, early death, short life | मृत्यु, अकाल मृत्यु, कम उम्र |
| not clear in this photo | इस फ़ोटो में साफ़ नहीं | divorce is certain, no marriage | तलाक तय, शादी नहीं होगी |
| self-reflection | खुद को समझना | accurate, 100%, scientific | सटीक, 100%, वैज्ञानिक |
| — | — | dosha, inauspicious, remedy (for sale) | दोष, अशुभ, उपाय (बेचने के लिए) |
| — | — | hurry, last chance, limited offer | जल्दी करें, आख़िरी मौका, सीमित ऑफ़र |

"आख़िरी मुफ़्त रीडिंग" (last free reading) is allowed because it is a plain fact, not pressure.

---

## 7. Web → app conversion psychology

### 7.1 When the store button appears
The order of asks follows NN/g's hierarchy of trust: relevance, then personal info, then money and ongoing commitment ([NN/g](https://www.nngroup.com/articles/commitment-levels/)).

| Place | Store button prominence | Why |
|---|---|---|
| Header | Small text link "Get the app" (Android only) | Available, never competing |
| Home hero | **None** (the one action is "Read my palm") | One dominant action; value first |
| Sample report section | Small badge | Shows where the full version lives |
| After report 1 | Secondary; primary is "read one more free (sign up)" | Lower commitment first |
| Tap on a locked part | **Primary** in that sheet | Peak intent for that content (DEC-038 logic) |
| After report 2 / 0 readings | **Primary** | The web has nothing left to give; honest next step |
| Guides and tools | End CTA is "Trace your real lines free" (web); badge in an aside | Keep learners on the web first; for known 0-reading visitors, swap to the app |
| /app page | Full: badge, QR, size, price, features | Intent page |
| Footer | Badge always | Findability |
| Banners | At most one, small and dismissible; hidden 30 days after dismissal [rec]; never full-screen | CCPA "nagging"; Google interstitial guidance |

### 7.2 Device logic
- **Android (India 92.8%):**
  - Play badge linking to `https://play.google.com/store/apps/details?id=…&referrer=utm_source%3Dweb%26utm_medium%3D{page}%26utm_campaign%3D{placement}`. The [Install Referrer](https://developer.android.com/google/play/installreferrer) carries it into the app.
  - Show size and price truth under the badge.
- **iPhone (US 60.7%):**
  - Hide the Play badge.
  - At app-intent moments only (lock, 0 readings): "The iPhone app isn't ready yet. You can keep using the website — guides and tools are free." / "iPhone ऐप अभी तैयार नहीं है। आप वेबसाइट इस्तेमाल करते रहें — गाइड और टूल मुफ़्त हैं।"
  - Optional opt-in "Email me once when it's ready", only if an iPhone app is really planned [rec]. Then send exactly one email.
- **Desktop:**
  - QR code generated on our page (not a third-party QR API).
  - "Send the link to my WhatsApp".
  - "Install from Google Play on this computer — it goes to your phone".
- **In-app browsers** (WhatsApp, Instagram, Facebook), a common Indian entry point:
  - Camera or upload and Play links can misbehave. Detect them and show "Open in Chrome for the best experience" / "बेहतर अनुभव के लिए Chrome में खोलें".
  - Test on real low-end phones.

### 7.3 Desktop → phone handoff
Palm photos are easier on a phone, so on desktop the handoff starts **before** the reading as well as at the app step.
- **Before the reading (desktop):** "Easier on your phone: scan this code to open this page there." / "फ़ोन पर आसान है: यह कोड स्कैन करें और यही पेज फ़ोन पर खोलें।"
- **QR code** (Play link with `utm_medium=qr`): "Scan with your phone camera" / "फ़ोन के कैमरे से स्कैन करें"
- **WhatsApp to self** via `https://wa.me/?text={encoded message + link}`. The user picks their own chat, which WhatsApp shows as "You" ([Message Yourself](https://www.androidcentral.com/apps-software/whatsapp-message-yourself)).
  - EN: "Send to my WhatsApp — pick your own name ('You') at the top of the chat list."
  - HI: "मेरे WhatsApp पर भेजें — चैट लिस्ट में सबसे ऊपर अपना नाम ('You') चुनें।"
- **Play web remote install:** someone signed in to play.google.com with the same Google account can press Install and pick their phone ([Google Play Help](https://support.google.com/googleplay/answer/16671014?co=GENIE.Platform%3DDesktop)).
  - EN: "Or press Install on Google Play here — the app goes straight to your phone (same Google account)."
  - HI: "या यहीं Google Play पर Install दबाएं — ऐप सीधे आपके फ़ोन में आ जाएगा (एक ही Google अकाउंट हो तो)।"
- **Email me the link** (signed-in users): one transactional email that the user asked for.

### 7.4 The app promise: true, specific, with the price
- **Promise only what the app delivers today.** Specific beats grand; "unlock your destiny" is both vague and risky.
- **EN:** "In the app: all 4 parts of your reading · your lines traced on your photo · compare both hands · short lessons and a quiz · save as PDF or share card · Hindi & English · no ads."
- **HI:** "ऐप में: रीडिंग के चारों हिस्से · फ़ोटो पर आपकी रेखाएं · दोनों हाथों की तुलना · छोटे पाठ और क्विज़ · PDF या शेयर कार्ड · हिंदी और English · कोई विज्ञापन नहीं।"
- **Price truth**, always next to the promise or one tap away: packs from ₹199 (one-time, never expire); plans from ₹149/month; the yearly plan has a 3-day trial; cancel in Google Play.
  - Reason: complaints like "not a single good review mentions having to pay" come from hiding this.
  - Reason: CCPA drip pricing (iii) covers "free" without disclosing that continued use needs an in-app purchase.
- **Continuity truth:** "fresh photo in the app", "same account", and "free readings are shared" if that is true (§1).

### 7.5 After install: keep the promise (app side, [rec])
- A `utm_source=web` first-run note that confirms their account and free-reading status in one line.
- The Play listing's first screenshot matches the website hero (the same traced-palm visual), so users know they are in the right place.
- Track 1–3★ reviews that mention "free", "fake", "scam" or "charged" as an **honesty KPI**. It should trend to zero.

### 7.6 What to measure per stage
- Landing → upload start.
- Photo-check pass rate.
- Reading p50/p90 time.
- Reveal → sign-up.
- Sign-up → report 2.
- 0 readings → store click, by placement.
- Store click → install (Play Console, by utm).
- Honesty KPI (above).

Keep personal data out of analytics.

---

## 8. Per-page checklist (designers and writers must pass all that apply)

**A. Truth**
- [ ] Every number comes from the §1 facts config or live data. No invented counts, ratings, "people this week", "was" prices or testimonials.
- [ ] Every "free" says exactly what is free ("first reading", "2 readings"), and the page, or one tap away, says the full reading is paid in the app.
- [ ] Privacy wording matches the privacy policy and the backend word for word.
- [ ] No dates, ages, lifespan, illness, divorce, children-count or money predictions.
- [ ] No "accurate / 100% / scientific / trained on ancient texts / NASA / world's first / professional palmist".
- [ ] Time claims use the measured p50.
- [ ] Claims match competitor-proof standards: no promise of a feature (PDF, sections) that does not exist.

**B. Clarity and language**
- [ ] One dominant action on the screen.
- [ ] The first screen answers what it is, whether it is free, whether it is in my language, and what I get.
- [ ] Hindi version written and reviewed by a native reader: everyday words, "रीडिंग" not "credits", errors in Hindi too.
- [ ] Devanagari: Noto Sans Devanagari (or equivalent), body ≥ 16 px, line height about 0.1 em taller than Latin ([Material](https://m1.material.io/style/typography.html)).
- [ ] Icons always carry a text label.

**C. Trust and privacy**
- [ ] Privacy line at every upload or camera point, plus a link to "What happens to my photo?".
- [ ] Footer: company name, contact, privacy, terms, delete account, age rule.
- [ ] No ad or remarketing scripts on reading pages; analytics listed in the policy.
- [ ] Share previews exactly what will be shared; name off by default; no public indexable readings.

**D. Motivation (only allowed levers)**
- [ ] Scarcity shown = the real state ("1 of 2 used").
- [ ] Locked preview = the real first sentence; locked part names = what the app delivers.
- [ ] Progress indicators tied to real events.
- [ ] Social proof only if real, linked, and above the agreed threshold.

**E. Dark-pattern screen (CCPA 13): none present**
- [ ] False urgency or false popularity
- [ ] Basket sneaking
- [ ] Confirm shaming
- [ ] Forced action
- [ ] Subscription trap
- [ ] Interface interference
- [ ] Bait and switch
- [ ] Drip pricing
- [ ] Disguised ads
- [ ] Nagging (banner frequency cap on)
- [ ] Trick questions (opt-ins unticked, positive wording)
- [ ] SaaS billing
- [ ] Scareware or APK links

**F. Bad-news tone** (any page about lines or life topics)
- [ ] The first sentence answers the fear calmly.
- [ ] Attributed to the tradition; the three-part block used (§6.3).
- [ ] "What palmistry can't tell you" box present.
- [ ] No red or warning styling for "bad" lines; no remedies for sale.
- [ ] Care line only on lifespan or death-anxiety guides.

**G. Store and app**
- [ ] Button is device-aware (Android badge / iPhone honest note / desktop QR + WhatsApp + remote install).
- [ ] Not above the primary action on web-reading pages; no interstitial; dismissible.
- [ ] Price truth and size next to the button or one tap away; "Only from Google Play".
- [ ] Play link has `referrer` UTMs for this page and placement.
- [ ] Continuity truth stated (fresh photo in the app, same account).

**H. Low-end phones and accessibility**
- [ ] Tested on a 3–4 GB RAM Android on slow 4G; hero image ≤ about 150 KB; no autoplay video; no heavy animation loops.
- [ ] Touch targets ≥ 48 × 48 dp; WCAG AA contrast; alt text in the page's language.
- [ ] Works inside WhatsApp and Instagram in-app browsers, or shows "Open in Chrome".
- [ ] Traced lines and any animation sit exactly on the photo (the owner rejected misaligned scan visuals before).

**I. Measurement**
- [ ] Stage events fire (§7.6); no personal data in analytics.

---

## 9. Verify before launch (claims above depend on these)

1. **Photo path:** which services receive the palm photo (the `extract-palm` edge function, its AI vision provider, the line scanner host). Do they log or retain images? Name them in the privacy policy. Confirm EXIF stripping (S-203).
2. **Free allowance:** is it shared between the web and the app for the same account? What happens for a web guest who later installs the app as a guest?
3. **Web readings:** browser-only (IndexedDB) and not in the app? Then the "fresh photo in the app" copy stays.
4. **Failed or unclear photo:** does it consume a free reading? It should not [rec].
5. **Emails:** exactly which emails go out after sign-up, the sender name, unsubscribe, and a physical address for US marketing mail.
6. **App size and minimum Android version** for the "about {X} MB" line.
7. **Prices by country** (INR in India; USD for US Android users). Feed them from one config that follows Play.
8. **Which app features are free** (lessons, quiz, compare hands) before the promise lists them.
9. **Play rating threshold** for showing it (proposed ≥ 4.0 and ≥ 100 ratings).
10. **iPhone plan:** is a waitlist honest (will we really build it)?
11. **Age rule** on the web: 18+ or parental consent (DPDP).
12. **Measured reading time** p50/p90 on the web build, on a low-end phone.

---

## Sources

**Law, regulation and platform policy**
- CCPA Dark Patterns Guidelines 2023: [Lexology summary](https://www.lexology.com/library/detail.aspx?g=9be57080-d215-45a8-b988-27acfc083de4) · [SCC Online](https://www.scconline.com/blog/post/2023/12/04/ccpa-notifies-guidelines-for-prevention-and-regulation-of-dark-patterns-2023-legal-news/) · [definitions text (NLS)](https://www.nls.ac.in/wp-content/uploads/2021/04/Dark-Patterns.pdf) · [Trilegal](https://trilegal.com/wp-content/uploads/2023/12/Guidelines-for-Prevention-and-Regulation-of-Dark-Patterns-2023.pdf)
- CCPA self-audit advisory, 5 June 2025: [PIB](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2134765) · [26 platforms' declarations](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2191948&reg=3&lang=2)
- ASCI *Conscious Patterns* 2024 (52 of 53 apps): [report summary](https://www.ascionline.in/wp-content/uploads/2024/08/Consious-Patterns-Report-Summary.pdf) · [Business Standard](https://www.business-standard.com/technology/apps/52-of-53-top-apps-in-india-use-dark-patterns-says-asci-study-124080101324_1.html)
- ASCI deceptive design guidelines: [ThePrint](https://theprint.in/economy/drip-pricing-false-urgency-asci-releases-new-guidelines-to-curb-dark-patterns-in-online-ads/1627815/)
- DPDP: [Rules 2025 (PIB)](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251117695301.pdf) · [s.5 notice](https://www.dpdpa.com/dpdpa2023/chapter-2/section5.html) · [s.6 consent](https://www.dpdpa.com/dpdpa2023/chapter-2/section6.html)
- FTC: [fake reviews rule](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials) · [16 CFR 465](https://www.ftc.gov/legal-library/browse/federal-register-notices/16-cfr-part-465-trade-regulation-rule-use-consumer-reviews-testimonials-final-rule) · [dark patterns report 2022](https://www.ftc.gov/news-events/news/press-releases/2022/09/ftc-report-shows-rise-sophisticated-dark-patterns-designed-trick-trap-consumers) · [CAN-SPAM guide](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business) · [click-to-cancel vacated (Mayer Brown)](https://www.mayerbrown.com/en/insights/publications/2025/07/click-to-cancelled-eighth-circuit-vacates-federal-trade-commissions-revised-negative-option-rule)
- Google Play: [Subscriptions policy](https://support.google.com/googleplay/android-developer/answer/9900533?hl=en) · [Ratings, reviews & installs](https://support.google.com/googleplay/android-developer/answer/9898684?hl=en) · [Developer Policy Center](https://play.google/developer-content-policy/) · [palm app rejected for misleading claims](https://support.google.com/googleplay/android-developer/thread/343307498/palm-reading-app-keeps-getting-rejected-misleading-claims-%E2%80%93-app-almost-at-risk-of-suspension?hl=en) · [Install Referrer](https://developer.android.com/google/play/installreferrer) · [remote install from a computer](https://support.google.com/googleplay/answer/16671014?co=GENIE.Platform%3DDesktop)
- Google Search: [interstitials and dialogs](https://developers.google.com/search/docs/appearance/avoid-intrusive-interstitials) · [people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)

**UX research**
- NN/g: [trustworthiness factors](https://www.nngroup.com/articles/trustworthy-design/) · [hierarchy of trust](https://www.nngroup.com/articles/commitment-levels/) · [login walls](https://www.nngroup.com/articles/login-walls/) · [response time limits](https://www.nngroup.com/articles/response-times-3-important-limits/) · [social proof](https://www.nngroup.com/articles/social-proof-ux/)
- [Baymard cart abandonment 2025](https://baymard.com/lists/cart-abandonment-rate)
- CXL: [urgency](https://cxl.com/blog/creating-urgency/) · [scarcity](https://cxl.com/blog/scarcity-examples/)
- [Material Design typography (tall scripts)](https://m1.material.io/style/typography.html)
- [Google: new internet users](https://developers.googleblog.com/en/building-better-products-for-new-internet-users/)
- [Schaub et al. 2015, privacy notices](https://www.usenix.org/conference/soups2015/proceedings/presentation/schaub)

**Behavioural science**
- [Loewenstein 1994, curiosity](https://www.researchgate.net/publication/232440476_The_Psychology_of_Curiosity_A_Review_and_Reinterpretation)
- [Kivetz et al. 2006, goal gradient](https://business.columbia.edu/insights/chazen-global-insights/goal-gradient-hypothesis-resurrected-purchase-acceleration)
- [Nunes & Drèze 2006, endowed progress (via goal pursuit)](https://en.wikipedia.org/wiki/Goal_pursuit)
- [Buell & Norton 2011, labor illusion](https://www.hbs.edu/faculty/Pages/item.aspx?num=40158)
- [Maister, psychology of waiting](https://www.columbia.edu/~ww2040/4615S13/Psychology_of_Waiting_Lines.pdf)
- [Kahneman et al. 1993, peak-end](https://journals.sagepub.com/doi/10.1111/j.1467-9280.1993.tb00589.x)
- [Forer / Barnum effect](https://en.wikipedia.org/wiki/Barnum_effect)
- [Worchel et al. 1975, scarcity](https://www.semanticscholar.org/paper/Effects-of-Supply-and-Demand-on-Ratings-of-Object-Worchel-Lee/e80a3b8c8b27fa69cc6f4fb4c4e497f705f07a89)
- [Goldstein, Cialdini & Griskevicius 2008, social norms](https://academic.oup.com/jcr/article/35/3/472/1856257)
- [Dietvorst et al. 2018, algorithm aversion](https://faculty.wharton.upenn.edu/wp-content/uploads/2016/08/Dietvorst-Simmons-Massey-2018.pdf)
- [Friestad & Wright 1994, persuasion knowledge](https://academic.oup.com/jcr/article-abstract/21/1/1/1853712)
- [Luguri & Strahilevitz 2021, dark patterns experiments](https://academic.oup.com/jla/article/13/1/43/6180579)
- [Mathur et al. 2019, dark patterns at scale](https://arxiv.org/abs/1907.07032)
- [Nocebo effect (The Conversation)](https://theconversation.com/six-surprising-things-about-placebos-everyone-should-know-220829)

**Market and audience**
- StatCounter, Aug 2026: [India mobile OS](https://gs.statcounter.com/os-market-share/mobile/india) · [US mobile OS](https://gs.statcounter.com/os-market-share/mobile/united-states-of-america)
- [IAMAI–Kantar Internet in India 2024](https://www.iamai.in/sites/default/files/research/Kantar_%20IAMAI%20report_2024_.pdf)
- [Google–KPMG Indian Languages 2017](https://assets.kpmg.com/content/dam/kpmg/in/pdf/2017/04/Indian-languages-Defining-Indias-Internet.pdf)
- LocalCircles: [spam calls 2024](https://www.localcircles.com/a/press/page/pesky-calls-survey-2024) · [data leaks](https://www.localcircles.com/a/press/page/personal-data-leakage)
- [Pew 2025, astrology / tarot / fortune tellers](https://www.pewresearch.org/religion/2025/05/21/3-in-10-americans-consult-astrology-tarot-cards-or-fortune-tellers/)
- [Astroyogi Gen Z report (Republic World)](https://www.republicworld.com/tech/apps/genz-accounts-for-60-user-base-on-astrology-apps-report)
- [Tele-MANAS](https://telemanas.mohfw.gov.in/)
- [WhatsApp Message Yourself](https://www.androidcentral.com/apps-software/whatsapp-message-yourself)

**App and review complaints**
- [Nebula on Trustpilot](https://www.trustpilot.com/review/nebula.app) · [Apple Community, Nebula charges](https://discussions.apple.com/thread/255702736)
- [Palmist reviews (JustUseApp)](https://justuseapp.com/en/app/973861216/palmist/reviews)
- [PalmHD App Store reviews](https://apps.apple.com/us/app/palmhd-palm-reader/id1324828998?see-all=reviews&platform=ipad)
- [Astrotalk on Trustpilot](https://www.trustpilot.com/review/astrotalk.com)
- [Co–Star notifications (Daily Dot)](https://www.dailydot.com/unclick/co-star-astrology-app-push-notifications-memes/)

**Internal**
- `D:\palm ai\palm-ai-website\WEBSITE_MASTER_PLAN.md` · research `01`–`05`
- App repo `PROJECT_MASTER.md` (DEC-011, DEC-038, DEC-043, DEC-044, FEAT-009, FEAT-030) · `SECURITY_MASTER.md` (S-169, S-203, S-275) · `big-engineers-report/deep-research-report.md`
