# PalmSays UX psychology and conversion rules

**Status:** the source of truth for PalmSays flows, calls to action, microcopy, trust and web → app hand-off. It sits beside `DESIGN_SYSTEM.md`, which covers the visuals. The background is in `WEBSITE_MASTER_PLAN.md` §4 and §8, and the full research with its evidence links is in `research/10-user-psychology.md`. Where they disagree, this file wins; log any change in the plan's §17.

**Placeholders.** Copy containing `{brand}`, `{price}`, `{p50}`, `{X}` (the app size in MB) or `{N}` reads its value from `src/config/site.ts`, or from the server. **Never type these numbers into a page.**
- `{brand}` is **PalmSays**.
- `{price}` must follow Play.
- `{p50}` and `{X}` stay hidden until they have been measured.

**Marks.** [verify] means a claim must be proven true before launch. If it can't be proven, drop the claim or change the product.

---

## 1. The 12 rules

1. **Value before any ask.** The first reading needs nothing. An account is asked for only after the user has seen their own lines. Money is never asked for on the web.
2. **Tell the privacy truth where the fear starts.** It goes next to the upload button, not only in the footer.
3. **Proof beats claims.** The user's own photo, with their real lines drawn on it, is our strongest trust signal.
4. **Every meaning points at a visible line** ("because your heart line curves up…"). This beats the Barnum effect that makes skeptics call palm apps fake.
5. **Real scarcity only.** "2 free readings on this website" is said before the first scan, and progress is shown as "1 of 2 used". Never invent limits.
6. **Lock only real content.** A locked part's preview is its real first sentence.
7. **Zero fake social proof.** No counters, testimonials, ratings or "was" prices unless they are real, checkable and above the threshold.
8. **Say what the app costs before install.** "Free" without that is drip pricing under India's rules.
9. **Bad-news lines get calm, attributed answers.** Never dates, lifespan, illness, divorce, number of children or money amounts.
10. **The store button appears at peak intent.** That means after value is delivered, on a locked-part tap, and at 0 free readings. It is device-aware, never blocks the page, and tells iPhone users the truth.
11. **Hindi is a first-class language, not a translation.** Use spoken Hindi, "रीडिंग" (never "credits"), and Hindi errors too.
12. **One dominant action per screen.**

---

## 2. Personas

These are built from market data, competitor reviews and search patterns. No interviews were run, so check them against real visitors after launch.

| Persona | Device and trigger | Main fear | What earns trust | Leaves when | Converts through |
|---|---|---|---|---|---|
| **A. Sunita**, 34, Hindi-first, Tier-2 town | ₹8–10k Android, Jio 4G, Hindi voice search ("हाथ की रेखा देखना"); a WhatsApp reel or a family wedding | Money taken, photo misused, English forms | Hindi on every screen, big buttons, "no payment on this site", seeing her own lines | An English-only step, a slow page, a password, a scary line | Free Hindi reading → the app in Hindi |
| **B. Priya**, 27, urban, English | Mid-range Android; a reel, a friend's share card, a breakup or job change | Data sold, spam, cringe upsells, generic text | Clean design, a real sample, "a tradition, not a science", a premium share card | Fake timers, forced sign-up, vague text | Share card → second reading → app |
| **C. Jessica**, 31, US | iPhone (60.7% of US mobile traffic); searches "palm reading online" | "$1 trial, then $42 subscription" traps, card requests | No card, no sign-up, "for fun and reflection" | Any card field | Web readings and guides; an honest "no iPhone app yet" |
| **D. Rahul**, 29, skeptic | Android; searches "is palmistry real", "can AI read palms" | The same text for everyone | Lines exactly on his photo, "not clear" states, sources, the other-hand test | "100% accurate", "NASA", fake reviews | `/is-palmistry-real/` → reading → other hand |
| **E. Neha**, 26, anxious | Android, late at night; searches "shadi kab hogi hath ki rekha", "short life line" | Getting a verdict; fear-based selling | A calm first line, no dates, something she can do | She gets scared, or we "predict" | Honest guides → reading |
| **F. Anjali**, 45, returning learner | Android + family laptop; searches "how to read palm lines", "hast rekha gyan pdf" | Thin or wrong content | Diagrams, Hindi names, sources, a quiz | She feels talked down to | PDF, quiz, then the app's lessons |

---

## 3. The funnel, stage by stage

### 3.1 Mindset, risk and design answer

| # | Stage | Mindset | Main risk | Design answer |
|---|---|---|---|---|
| 1 | Search result or WhatsApp preview | "Free? In Hindi? Will it really read *my* hand, or is it a money trick?" | A "free" title that later asks for money; a preview that looks like spam | The title and snippet say exactly what is free. Every page has its own OG image. |
| 2 | Landing (the first 5 seconds) | "Is it real, free, in my language? What will I get?" | A cluttered hero, a competing store badge, English only, a slow image | One H1 and one gold button; the traced real sample; 3 true chips; हिंदी / English; hero image ≤ 90 KB; no video, no cookie banner |
| 3 | First scroll | "Show me an example. What's the catch?" | Hidden terms create suspicion | In this order: the sample (meaning first), the 3 steps, the **What's free** box, "Why free?", the honesty box |
| 4 | Upload decision (the biggest fear) | "Where does my hand photo go? It's like a fingerprint. Will my photo work?" | Privacy fear; failure; a blocked camera; uploads failing in the WhatsApp or Instagram browser | Privacy line plus "What happens to my photo?" at the button; tip chips; a hand choice with a default; a gallery option; an in-browser check before sending (a failed check costs nothing) |
| 5 | Waiting | "Is it stuck? Is it doing anything real?" | An unexplained wait; fake steps that a skeptic spots | Only real stages; the lines draw in as soon as the scan returns; the measured p50; a way out after p90 |
| 6 | Reveal (the peak) | "Is this really about *me*?" | Generic text that could fit anyone (the Barnum effect) | Meaning and traced photo together; each meaning shows what we see, what the tradition says and its source; "not clear" states; a self-check; a kind ending; "Try your other hand" |
| 7 | The lock (after reading 1) | "Ah, here's the catch." | Feeling baited | The lock is announced before the scan; the real first sentence; "2 of 4 parts"; the main button is "Read one more palm free — sign up"; tapping a locked part makes the app the main button in that sheet; a note says sign-up doesn't open this reading |
| 8 | Sign-up | "Now the spam starts. Another password?" | Forced accounts; unwanted contact | Email plus a 6-digit code; no password or phone; say which emails we send; "delete account" one link away |
| 9 | Reading 2 | "Let me try the other hand." | Finding out only afterwards that it was the last one | Say "last" **before** the scan; the other-hand tip; a two-hands teaser afterwards |
| 10 | No free readings left | "So it was a trap." | A dead end, guilt copy, a surprise price | Thanks; the 2 saved readings with "save as image"; one next step (the app) with its price; a free path to guides and tools; no guilt |
| 11 | Store-button click | "Will it fit? Is it the real app? Will it charge me straight away?" | Surprise costs (the top reason people abandon, 40%) | A device-aware button with the size and price under it; Google Play only, never an APK |
| 12 | First app open | "Does it remember me?" | An unexpected new scan feels like bait | Say it on the website **before** install: a fresh photo in the app, and the same email |

### 3.2 Microcopy for each stage

| # | English | Hindi |
|---|---|---|
| 2 | **H1:** "Free AI palm reading — see your own lines traced on your photo" | "मुफ़्त AI हस्तरेखा रीडिंग — अपनी फ़ोटो पर अपनी असली रेखाएं देखें" |
| 2 | **Sub-line:** "Take one photo of your palm. We trace your heart, head, life and fate lines and show what palmistry says about them." | "हथेली की एक फ़ोटो लें। हम आपकी हृदय, मस्तिष्क, जीवन और भाग्य रेखा बनाकर दिखाते हैं कि हस्तरेखा उनके बारे में क्या कहती है।" |
| 2 | **Gold button:** "Take a palm photo" (desktop: "Upload a palm photo"). **Link:** "Choose from gallery" | "हथेली की फ़ोटो लें" (desktop: "हथेली की फ़ोटो डालें"). "गैलरी से चुनें" |
| 2 | **Chips** (separate pills, never joined with "·"): "First reading free", "No sign-up", "No payment on this site" | "पहली रीडिंग मुफ़्त", "साइन-अप नहीं", "इस साइट पर कोई पेमेंट नहीं" |
| 2 | **Free qualifier** (inside the card, readable contrast): "2 free readings on this site. The full reading is in our Android app (paid)." | "इस साइट पर 2 रीडिंग मुफ़्त। पूरी रीडिंग हमारे Android ऐप में है (पैसे वाली)।" |
| 2 | **Sample label:** "A real photo, traced by {brand}. Your reading is made from your own photo." | "असली फ़ोटो, जिस पर रेखाएं {brand} ने बनाई हैं। आपकी रीडिंग आपकी अपनी फ़ोटो से बनेगी।" |
| 3 | "Why free? So you can see it work on your own palm first. The full reading lives in our app — that's how we pay our bills." | "मुफ़्त क्यों? ताकि आप पहले अपनी हथेली पर खुद देख लें कि यह काम करता है। पूरी रीडिंग हमारे ऐप में है — उसी से हमारा ख़र्च चलता है।" |
| 3 | **What's free box:** "On this website: 2 free readings — 1 now, 1 more after a free sign-up (a new reading, for example your other hand). Each shows Love and Personality in full, plus the first sentence of Career & Money and Life Direction. The full reading is in our Android app: free to install, full readings are paid (packs from ₹{price})." | "इस वेबसाइट पर 2 रीडिंग मुफ़्त — 1 अभी, और 1 मुफ़्त साइन-अप के बाद (नई रीडिंग, जैसे आपका दूसरा हाथ)। हर रीडिंग में प्यार और स्वभाव पूरा, और करियर-पैसा व जीवन की दिशा का पहला वाक्य। पूरी रीडिंग हमारे Android ऐप में है: ऐप मुफ़्त, पूरी रीडिंग पैसे वाली (पैक ₹{price} से)।" |
| 3 | "Palmistry is an old tradition, not a science. We show what the tradition says about your lines — not your future." | "हस्तरेखा एक पुरानी परंपरा है, विज्ञान नहीं। हम बताते हैं कि परंपरा आपकी रेखाओं के बारे में क्या कहती है — आपका भविष्य नहीं।" |
| 4 | **Tips:** "Open palm", "Good light", "Whole hand in the frame" | "खुली हथेली", "अच्छी रोशनी", "पूरा हाथ फ़्रेम में" |
| 4 | "Which hand? Most people start with the hand they write with." | "कौन सा हाथ? ज़्यादातर लोग उस हाथ से शुरू करते हैं जिससे लिखते हैं।" |
| 4 | "Your phone may ask to allow the camera. We only take one photo of your palm." | "फ़ोन कैमरे की अनुमति मांग सकता है। हम सिर्फ़ आपकी हथेली की एक फ़ोटो लेते हैं।" |
| 4 | "Too dark — move near a window or turn on a light." | "फ़ोटो में अंधेरा है — खिड़की के पास जाएं या लाइट जलाएं।" |
| 4 | "A little blurry — hold the phone still for a second." | "फ़ोटो थोड़ी धुंधली है — एक सेकंड फ़ोन स्थिर रखें।" |
| 4 | "Mehndi or ink can hide lines. If a line isn't clear, we'll tell you instead of guessing." | "मेहंदी या स्याही से रेखाएं छिप सकती हैं। कोई रेखा साफ़ न दिखे तो हम अंदाज़ा नहीं लगाएंगे, आपको बता देंगे।" |
| 5 | "Usually about {p50} seconds." (only once measured) | "आमतौर पर लगभग {p50} सेकंड।" |
| 5 | "Taking longer than usual — your internet may be slow. You can wait, or try again." | "आज थोड़ा ज़्यादा समय लग रहा है — शायद इंटरनेट धीमा है। रुकें, या दोबारा कोशिश करें।" |
| 5 | "Trying again won't use a free reading." (only once the idempotency key is verified) | "दोबारा कोशिश से मुफ़्त रीडिंग ख़र्च नहीं होगी।" |
| 6 | "Your heart line curves up toward your first finger (the pink line). In palmistry this is read as warm, open-hearted love." | "आपकी हृदय रेखा ऊपर तर्जनी उंगली की ओर मुड़ती है (गुलाबी रेखा)। हस्तरेखा में इसे खुले दिल और गर्मजोशी वाले प्यार का संकेत माना जाता है।" |
| 6 | "Look at your own hand now — can you see this curve?" | "अब अपना हाथ देखिए — क्या आपको यह मोड़ दिख रहा है?" |
| 6 | "Your fate line isn't clear in this photo. We didn't guess." | "इस फ़ोटो में आपकी भाग्य रेखा साफ़ नहीं दिखी। हमने अंदाज़ा नहीं लगाया।" |
| 7 | "You've read 2 of 4 parts." | "आपने 4 में से 2 हिस्से पढ़ लिए।" |
| 7 | "Signing up gives you a new reading. It doesn't open the locked parts of this one." | "साइन-अप करने से एक नई रीडिंग मिलती है। इस रीडिंग के बंद हिस्से नहीं खुलते।" |
| 8 | "Get 1 more free reading — sign up with your email. We'll email you a 6-digit code. No password needed." | "एक और मुफ़्त रीडिंग पाएं — अपने ईमेल से साइन-अप करें। हम आपको 6 अंकों का कोड ईमेल करेंगे। कोई पासवर्ड नहीं चाहिए।" |
| 8 | "We only email you about your account." / "Delete your account anytime on the Account page." | "हम आपको सिर्फ़ आपके अकाउंट से जुड़े ईमेल भेजेंगे।" / "अपना अकाउंट कभी भी Account पेज पर जाकर हटा सकते हैं।" |
| 9 | "This is your 2nd and last free reading on this website." | "यह वेबसाइट पर आपकी दूसरी और आख़िरी मुफ़्त रीडिंग है।" |
| 9 | "Many palm readers say the hand you don't write with shows what you were born with, and your writing hand shows what you've made of it." | "कई हस्तरेखा जानकार मानते हैं कि जिस हाथ से आप नहीं लिखते, वह जन्म का स्वभाव दिखाता है, और लिखने वाला हाथ बताता है कि आपने उसे कैसे जिया।" |
| 10 | "You've used both free web readings. Your 2 readings are saved in this browser — clearing browser data removes them. Save them as images to keep." | "आपने वेबसाइट की दोनों मुफ़्त रीडिंग इस्तेमाल कर लीं। आपकी 2 रीडिंग इसी ब्राउज़र में सेव हैं — ब्राउज़र का डेटा साफ़ करने पर ये हट जाएंगी। रखना चाहें तो इमेज के रूप में सेव कर लें।" |
| 10 | **App card:** "Want the full reading? The Android app has all 4 parts, lessons and compare-your-hands. Free to install. Full readings: one-time packs from ₹{price}, or a plan you can cancel anytime in Google Play." (List only the features verified in §8.4.) | "पूरी रीडिंग चाहिए? Android ऐप में चारों हिस्से, सीखने के पाठ और दोनों हाथों की तुलना। ऐप डाउनलोड मुफ़्त। पूरी रीडिंग: ₹{price} से एक-बार वाले पैक, या ऐसा प्लान जिसे Google Play में कभी भी बंद कर सकते हैं।" |
| 10 | "Not now? Keep learning free — guides and tools." | "अभी नहीं? मुफ़्त में सीखते रहें — गाइड और टूल।" |
| 11 | **Price line** (the facts on separate lines or as chips, never joined with "·"): "Free download", "About {X} MB", "Optional paid readings", "No ads" | "मुफ़्त डाउनलोड", "लगभग {X} MB", "पैसे वाली रीडिंग आपकी मर्ज़ी से", "कोई विज्ञापन नहीं" |
| 11 | "Only from Google Play — never an APK file." | "सिर्फ़ Google Play से — कोई APK फ़ाइल नहीं।" |
| 12 | "In the app you'll take a fresh photo — it takes about a minute. Your web readings stay in this browser." | "ऐप में एक नई फ़ोटो लेनी होगी — करीब एक मिनट लगता है। वेबसाइट की रीडिंग इसी ब्राउज़र में रहेंगी।" |

---

## 4. Nine fears and the trust mechanics that remove them

Every mechanic must be **true on launch day**.

| # | Fear | What we show, and where | Exact copy (EN / HI) | Must be true |
|---|---|---|---|---|
| 1 | **Palm photo privacy** ("it's like a fingerprint") | The privacy line at every upload point; the "What happens to my photo?" panel (§9); EXIF removed; no photo in a share card unless the user chooses it | "We analyse your photo and don't store it on any server. A copy stays on this device." / "हम आपकी फ़ोटो जांचते हैं, पर किसी सर्वर पर सेव नहीं करते। एक कॉपी सिर्फ़ इसी डिवाइस पर रहती है।" | [verify] that Modal and Workers AI keep no copy or logs. Traced line points **are** stored, and we say so. |
| 2 | **"Is this a scam? Will I be charged?"** | "No payment on this site"; company name, real contact and grievance contact in the footer; no card or UPI field anywhere. Shown in the hero chip, the footer, the lock sheet and the zero-readings screen. | "We never ask for card or UPI on this website." / "इस वेबसाइट पर हम कभी कार्ड या UPI नहीं मांगते।" | No payments on the web |
| 3 | **Hidden subscriptions** (the top complaint in 1–3★ competitor reviews) | The price line beside every store button; the `/app/` price table; the zero-readings screen | "Packs are one-time. Plans renew until you cancel in Google Play — we remind you before a trial ends." / "पैक एक बार के होते हैं। प्लान तब तक चलते हैं जब तक आप Google Play में बंद न करें — ट्रायल ख़त्म होने से पहले हम याद दिलाते हैं।" | Prices come from config that follows Play. [verify] on a phone that the app's trial reminder works. |
| 4 | **Spam after giving an email** | The sign-up sheet lists exactly which emails we send; opt-ins unticked; no phone number; delete account | "We only email you about your account." / "हम आपको सिर्फ़ आपके अकाउंट से जुड़े ईमेल भेजेंगे।" | Only account email goes out until an opt-in system exists |
| 5 | **Scary predictions** | The "What palmistry can't tell you" box on every reading and guide; no dates, ages or outcomes; a calm first line (§6) | "No line on your palm can tell how long you'll live, whether you'll marry, or whether you'll have children." / "हथेली की कोई रेखा यह नहीं बता सकती कि आप कितना जिएंगे, शादी होगी या नहीं, या संतान होगी या नहीं।" | The report has no health section |
| 6 | **Being judged for how the hand looks** | Never comment on how a hand looks; no warning colours for "bad" lines; readings private by default. Shown with the upload tips, on the reading and in the share sheet. | "Every hand is readable — rough hands, scars and mehndi are fine. We only look at the lines." / "हर हाथ पढ़ा जा सकता है — खुरदरे हाथ, निशान या मेहंदी, कोई बात नहीं। हम सिर्फ़ रेखाएं देखते हैं।" | The report writer uses no words about appearance |
| 7 | **Data sold** | Footer, privacy page (which names every processor) and sign-up; no ad pixels | "We don't sell your data, and there are no ads — ever." / "हम आपका डेटा नहीं बेचते, और कोई विज्ञापन नहीं — कभी नहीं।" | No ads (DEC-011); the analytics list matches the policy |
| 8 | **Fake AI** ("same text for everyone") | Lines on their photo; an evidence sentence and a source for each meaning; "not clear" states; "Try your other hand"; the `/how-it-works/` page | "Our AI finds and traces your lines. The meanings come from classical palmistry books — the source is under each one." / "हमारा AI आपकी रेखाएं ढूंढकर बनाता है। उनके अर्थ पुरानी हस्तरेखा किताबों से हैं — हर अर्थ के नीचे किताब का नाम है।" | A source exists for every rule (FEAT-009) |
| 9 | **"I'll make a mistake"**, or fear of the language | Hindi everywhere, errors included; icons always with words; retry everywhere; a failed photo costs nothing | "Nothing can go wrong — you can always try again." / "कुछ ग़लत नहीं होगा — आप कभी भी दोबारा कोशिश कर सकते हैं।" | [verify] that a retry doesn't use up a reading |

**Trust basics on every page:**
- company name, contact and a grievance contact (DPDP);
- privacy, terms and delete-account pages;
- the age rule, "Readings are for people 18+";
- a "Last reviewed {date}" line on every guide;
- a named author, Deepak Chauhan, and a named Hindi reviewer once there is one.

---

## 5. Honest motivation levers

| Lever | Allowed (the true version) | Banned |
|---|---|---|
| Real scarcity | "2 free readings on this website", with a live "1 of 2 used" / "2 में से 1 इस्तेमाल हुई" | Timers, "only 3 left today", "offer ends" |
| Curiosity gap | The real first sentence of each locked part; locked part names that match what the app delivers | Blurred fake text, "██" teasers, teasing parts we have no evidence for |
| Goal gradient | "2 of 4 parts read"; pipeline stages that tick when they really finish | Progress bars on a timer |
| Endowed progress | Only progress the user really made ("Photo checked", "Lines found") | "You're 80% done" bonuses |
| Personal, checkable statements | Each meaning names the visible feature it comes from, plus "check it on your hand" | Vague lines that fit anyone |
| Reciprocity | A useful free reading, "save as image", free guides and tools, the Hindi PDF | Gifts that need payment details |
| Authority, honestly | A classical source under each meaning; a named author and reviewer | "Trained on 1,000+ texts", "NASA", "world's first", "professional palmist" |
| Social proof, only when real | The live Play rating with its count and a link, once it reaches 4.0★ with 100+ ratings; live totals rounded down and dated ("{N} palms read on this website since {date}") | Hard-coded counts, "viewing now", "just downloaded" toasts, "Illustrative" testimonials |
| Identity and sharing | A share card on the user's own traced lines, previewed first, with no name by default | Public, indexable reading pages |
| Real seasons | Content tied to Karva Chauth, wedding season or Valentine's Day | Deadlines tied to those events |

**Loss framing:**
- **Allowed only for true, useful facts:** "Saved in this browser only — clearing data removes them", "This is your last free web reading".
- **Never:** "Don't miss your destiny", "Your reading will be lost if you leave", "Offer ends tonight", or anything that ties fear about love, health or family to a purchase.

---

## 6. Bad-news lines

### 6.1 Tone rules

1. Answer the fear calmly in the first sentence.
2. Normalise it: "This is very common."
3. **Attribute, never predict:** "Palmistry books read this as…" / "परंपरा में इसे … माना जाता है". Never "you will".
4. Never give dates, ages, lifespan, illness, divorce, number of children or money amounts.
5. Name a scary folk reading only to take it apart.
6. When it is true, give the photo explanation: light, a crease or the crop can make a line look broken or short.
7. End with agency: something the person controls.
8. Always include the "What palmistry can't tell you" box.
9. Sell no remedies: no gems, pujas or mantras.
10. Keep it visually calm. A line keeps its normal colour; no red and no warning icons.
11. In Hindi, use the warm "आप" and everyday words.
12. On lifespan and death-anxiety guides **only**, end with the care line.

**The three-part block for every sensitive meaning:**
1. What we see.
2. What the tradition says, attributed.
3. What it can't tell you, and what you can do.

### 6.2 Copy (use as written)

| Topic | English | Hindi |
|---|---|---|
| Short life line | "Your life line looks short in this photo. That's very common — and in palmistry, the life line's length is **not** read as how long you'll live. Traditionally it's linked to your energy and how you handle big changes. A line can also look short when the photo crops it or the light is flat. *Palmistry can't tell your lifespan or your health — for health, talk to a doctor.*" | "इस फ़ोटो में आपकी जीवन रेखा छोटी दिख रही है। ऐसा बहुत लोगों में होता है — और हस्तरेखा में जीवन रेखा की लंबाई से उम्र **नहीं** आंकी जाती। परंपरा में इसे आपकी ऊर्जा और बड़े बदलावों को संभालने के तरीके से जोड़ा जाता है। फ़ोटो में रेखा कट जाए या रोशनी कम हो, तब भी रेखा छोटी दिख सकती है। *हस्तरेखा उम्र या सेहत नहीं बता सकती — सेहत के लिए डॉक्टर से बात करें।*" |
| Broken life line | "There's a gap in your life line. Palm readers traditionally read a break as a change of direction — a move, a new job, a new chapter — not as danger. If the new part runs alongside the old one for a bit, it's read as a smooth change." | "आपकी जीवन रेखा में एक जगह गैप है। परंपरा में टूटी रेखा को ख़तरा नहीं, बल्कि दिशा में बदलाव माना जाता है — नई जगह, नया काम, ज़िंदगी का नया दौर। अगर नई रेखा पुरानी के साथ थोड़ी दूर तक चलती है, तो इसे आसान बदलाव माना जाता है।" |
| "Divorce line" | "Some books call a broken or forked marriage line a 'divorce sign'. Many palm readers today don't read it that way — the small lines under your little finger can't tell anyone's future in a marriage. Traditionally a break is read as a phase that needs attention: talking, time, a change. A relationship depends on the two people in it, not on a line." | "कुछ किताबें टूटी या दो-मुंही विवाह रेखा को 'तलाक का संकेत' कहती हैं। आज कई हस्तरेखा जानकार ऐसा नहीं मानते — छोटी उंगली के नीचे की ये छोटी रेखाएं किसी की शादी का भविष्य नहीं बता सकतीं। परंपरा में टूटी रेखा को ऐसे दौर की तरह पढ़ा जाता है जिसमें ध्यान देने की ज़रूरत हो — बात करना, थोड़ा समय, कोई बदलाव। रिश्ता दो लोगों से चलता है, रेखा से नहीं।" |
| "When will I marry?" | "Palmistry books give marriage-line 'ages', but they disagree with each other, and no line can give a date. What the tradition does describe is *how* you love — and that's in your heart line." | "हस्तरेखा की किताबें विवाह रेखा से 'उम्र' बताती हैं, पर वे आपस में ही मेल नहीं खातीं, और कोई रेखा तारीख़ नहीं बता सकती। परंपरा जो बताती है, वह है आप *कैसे* प्यार करते हैं — और वह आपकी हृदय रेखा में है।" |
| Children lines | "Old books link tiny lines near the marriage line to children. A palm can't tell whether you'll have children or how many — that depends on life, health and choice, not on lines." | "पुरानी किताबें विवाह रेखा के पास की बारीक रेखाओं को संतान से जोड़ती हैं। हथेली यह नहीं बता सकती कि आपके बच्चे होंगे या कितने — यह ज़िंदगी, सेहत और आपकी पसंद पर निर्भर है, रेखाओं पर नहीं।" |
| Island on the life line (guides only) | "An 'island' on the life line is traditionally read as a tiring or stressful period. It's not a diagnosis. If you're worried about your health, please see a doctor." | "जीवन रेखा पर 'द्वीप' को परंपरा में थकान या तनाव वाले दौर से जोड़ा जाता है। यह किसी बीमारी की जांच नहीं है। सेहत की चिंता हो तो डॉक्टर को दिखाएं।" |
| Faint or unclear line | "This line is faint in the photo. Faint doesn't mean weak — it may just be the light." | "फ़ोटो में यह रेखा हल्की दिख रही है। हल्की का मतलब कमज़ोर नहीं — हो सकता है रोशनी की वजह से हो।" |
| Care line (lifespan and death-anxiety guides only) | "If this topic is weighing on you, talking helps. In India, call Tele-MANAS on 14416 (free, 24×7). In the US, call or text 988." | "अगर यह बात आपको परेशान कर रही है, तो किसी से बात करना मदद करता है। भारत में Tele-MANAS 14416 पर कॉल करें (मुफ़्त, 24×7)।" |

### 6.3 Words

| Use (EN) | Use (HI) | Never (EN) | Never (HI) |
|---|---|---|---|
| tradition says, is read as | परंपरा में माना जाता है | you will, destined, guaranteed | आपके साथ होगा, तय है, पक्का |
| tendency, style, phase | झुकाव, स्वभाव, दौर | danger, warning, bad sign | ख़तरा, चेतावनी, बुरा संकेत |
| change of direction | दिशा में बदलाव | death, early death, short life | मृत्यु, अकाल मृत्यु, कम उम्र |
| not clear in this photo | इस फ़ोटो में साफ़ नहीं | divorce is certain, no marriage | तलाक तय, शादी नहीं होगी |
| self-reflection | खुद को समझना | accurate, 100%, scientific | सटीक, 100%, वैज्ञानिक |
| — | — | dosha, inauspicious, remedy for sale | दोष, अशुभ, उपाय (बेचने के लिए) |
| — | — | hurry, last chance, limited offer | जल्दी करें, आख़िरी मौका, सीमित ऑफ़र |

"आख़िरी मुफ़्त रीडिंग" (last free reading) is allowed, because it is a plain fact, not pressure.

---

## 7. Dark patterns we will never ship

**India: the CCPA's *Guidelines for Prevention and Regulation of Dark Patterns, 2023*.**
- They cover websites and apps.
- CCPA told platforms on 5 June 2025 to self-audit.
- A misleading ad can bring up to 2 years in jail and a ₹10 lakh fine for a first offence (Consumer Protection Act s.89).

| # | CCPA pattern | What it would look like here | Our rule |
|---|---|---|---|
| 1 | False urgency, including false popularity | Timers, "120 people reading now" | Never. Real, dated numbers only, or none. |
| 2 | Basket sneaking | The app adding a plan to a pack purchase | Never pre-add anything |
| 3 | Confirm shaming | "No thanks, I don't care about my love life" | A plain "Not now" / "अभी नहीं" |
| 4 | Forced action | Email before the first reading; a phone number; installing the app to see free content | The first reading needs nothing; the second needs only an email |
| 5 | Subscription trap | An app trial without clear cancel steps | The website explains "cancel in Google Play"; the app keeps its trial reminder |
| 6 | Interface interference | A huge "Install" next to a tiny grey "Continue on web" | Secondary options stay readable (AA contrast, 48px targets) |
| 7 | Bait and switch | Implying sign-up opens the locked parts | The copy says exactly what sign-up gives: **a new reading** |
| 8 | **Drip pricing**, including "free" without saying that continued use needs a purchase | "Free palm reading", with the paid app revealed only at the end | The free qualifier in the hero, the What's free box, and the price beside every store button |
| 9 | Disguised ads | Sponsored posts styled as guides | None; anything sponsored is labelled |
| 10 | Nagging | Install banners on every page view | At most one small banner, dismissible, hidden for 30 days after dismissal. Never an interstitial. |
| 11 | Trick questions | "Uncheck to not stop receiving tips" | Positive, single-meaning wording; opt-ins unticked |
| 12 | SaaS billing | Silent renewals | The app keeps its renewal line and trial reminder |
| 13 | Rogue malware | APK downloads, scareware | Google Play links only |

**Also in India:**
- ASCI's guidelines on deceptive design in ads;
- **DPDP 2023:** a plain itemised notice, withdrawing consent as easy as giving it, and parental consent for under-18s (hence 18+).

**United States:**
- FTC Act §5 (deception).
- The **FTC rule on reviews and testimonials, 16 CFR 465**, in force since 21 Oct 2024. It bans fake or AI-written reviews and fake social indicators; fines are up to about $51,744 per violation.
- The FTC's 2022 dark-patterns report.
- ROSCA and state auto-renewal laws. The federal click-to-cancel rule was vacated on 8 July 2025, but easy cancelling stays our rule.
- CAN-SPAM for any marketing email.

**Google:**
- Play's rules on misleading claims (a palm app was rejected for this), subscriptions, and ratings and reviews;
- Search's guidance against intrusive interstitials, including app-install prompts.

---

## 8. Web → app hand-off

### 8.1 When the store button appears

| Place | Prominence |
|---|---|
| Header | A small "Get the app" text link (Android only) |
| Home hero | **None.** The one action is the reading. |
| Sample reading section | A small badge |
| After reading 1 | Secondary; the primary is "Read one more palm free — sign up" |
| Tap on a locked part | **Primary** in that sheet |
| After reading 2, or 0 readings | **Primary**; the web has nothing left to give |
| Guides and tools | The end CTA is "Read my palm free"; the badge sits in an aside. For visitors known to have 0 readings, swap them. |
| `/app/` | Full: badge, QR code, size, price, features, FAQ |
| Footer | Badge, always |
| Banners | At most one, small, dismissible, hidden for 30 days after dismissal; never full-screen |

### 8.2 Device logic

- **Android** (92.8% of India's phones):
  - The Play badge with `referrer` UTMs for page and placement.
  - The **price line directly under it**, plus "Only from Google Play".
- **iPhone:**
  - No badge.
  - At app-intent moments only (the lock sheet, 0 readings, `/app/`): "The iPhone app isn't ready yet. You can keep using the website — guides and tools are free." / "iPhone ऐप अभी तैयार नहीं है। आप वेबसाइट इस्तेमाल करते रहें — गाइड और टूल मुफ़्त हैं।"
  - An "Email me once when it's ready" option only if an iPhone app is really planned.
- **Desktop:**
  - A QR code generated on our own page.
  - "Send to my WhatsApp — pick your own name ('You') at the top of the chat list." / "मेरे WhatsApp पर भेजें — चैट लिस्ट में सबसे ऊपर अपना नाम ('You') चुनें।"
  - "Or press Install on Google Play here — the app goes straight to your phone (same Google account)." / "या यहीं Google Play पर Install दबाएं — ऐप सीधे आपके फ़ोन में आ जाएगा (एक ही Google अकाउंट हो तो)।"
- **Before a reading on desktop:** "Easier on your phone: scan this code to open this page there." / "फ़ोन पर आसान है: यह कोड स्कैन करें और यही पेज फ़ोन पर खोलें।"
- **In-app browsers** (WhatsApp, Instagram, Facebook): "For the best result, open this page in Chrome." / "सबसे अच्छे नतीजे के लिए यह पेज Chrome में खोलें।" (with a copy-link button).

### 8.3 Required rules at every store button

1. **The price sits beside the button:** the price line from `site.ts`, never more than one tap away.
2. **"Free" is always qualified.** It says what is free, and that the full reading is paid in the app.
3. **Tell the continuity truth before install:** "the app starts with a fresh scan" (a new photo, about a minute) and "use the same email". Web readings stay in this browser and do not move to the app.
4. **Promise only what the app does today.** The list is in §8.4. Specific beats grand.
5. **Google Play only.** Never an APK, never an App Store badge before an iOS app exists.

### 8.4 The app promise, with the price

- **EN:** "In the app: all 4 parts of your reading, your lines traced on your photo, compare both hands, short lessons and a quiz, save as PDF or share card, Hindi and English, no ads." Set it as a list or separate lines, not "·".
- **HI:** "ऐप में: रीडिंग के चारों हिस्से, फ़ोटो पर आपकी रेखाएं, दोनों हाथों की तुलना, छोटे पाठ और क्विज़, PDF या शेयर कार्ड, हिंदी और English, कोई विज्ञापन नहीं।"
- **Price truth**, all from config and following Play:
  - packs from ₹199, one-time, never expire;
  - plans from ₹149/month;
  - the yearly plan has a 3-day trial;
  - cancel in Google Play.
- **[verify]:**
  - which features are free;
  - the app size;
  - prices per country;
  - whether free readings are shared between the web and the app (say so only if true).

---

## 9. Privacy copy that matches reality

**Never use these words:** "sent once", "never stored", "we keep nothing", "deleted right after". All four are wrong for the web path.

**The "What happens to my photo?" panel** opens in place and also lives at `/privacy/#website`.

| # | English | Hindi |
|---|---|---|
| 1 | Before anything is sent, your browser makes the photo smaller and removes hidden data such as your location. | कुछ भी भेजने से पहले आपका ब्राउज़र फ़ोटो छोटी करता है और उसमें छिपी जानकारी (जैसे लोकेशन) हटा देता है। |
| 2 | Two small copies go through our server to two services. Modal (USA) traces your lines. Cloudflare Workers AI reads your palm's features. Neither stores the photo. [verify] | फ़ोटो की दो छोटी कॉपी हमारे सर्वर से होकर दो सेवाओं तक जाती हैं: Modal (अमेरिका) आपकी रेखाएं बनाता है, Cloudflare Workers AI हथेली की बनावट पढ़ता है। दोनों में से कोई फ़ोटो सेव नहीं करता। |
| 3 | We save your traced line points, 21 points that mark your hand's shape, and your written reading to your account — not the photo. You can delete them any time on the Account page. [verify guest deletion] | हम आपके अकाउंट में रेखाओं के बिंदु, हाथ की बनावट के 21 बिंदु और आपकी लिखी रीडिंग सेव करते हैं — फ़ोटो नहीं। इन्हें आप कभी भी Account पेज से हटा सकते हैं। |
| 4 | A copy of the photo stays in this browser so you can see your reading again. Clearing browser data removes it. | फ़ोटो की एक कॉपी इसी ब्राउज़र में रहती है ताकि आप अपनी रीडिंग दोबारा देख सकें। ब्राउज़र का डेटा साफ़ करने पर यह हट जाती है। |
| 5 | If you sign up, we keep a one-way code of your email so the free reading can't be repeated — even after you delete your account. | साइन-अप करने पर हम आपके ईमेल का एक एकतरफ़ा कोड रखते हैं ताकि मुफ़्त रीडिंग दोबारा न ली जा सके — अकाउंट हटाने के बाद भी। |
| 6 | A quick Cloudflare check (Turnstile) stops bots. Page statistics come from Cloudflare Web Analytics, with no cookies. | बॉट रोकने के लिए Cloudflare की एक छोटी जांच (Turnstile) होती है। पेज के आंकड़े Cloudflare Web Analytics से आते हैं, बिना कुकी के। |

---

## 10. Errors: say what went wrong and how to fix it

No "Oops", no apologies, no blame. Every error also exists in Hindi. The full list is in the plan's §8.3.

| Case | English | Hindi | Reading used? |
|---|---|---|---|
| HEIC file won't open | "This photo type (HEIC) doesn't open here. Take a new photo with your phone, or upload a JPG." | "यह फ़ोटो (HEIC) यहां नहीं खुल रही। फ़ोन से नई फ़ोटो लें या JPG फ़ोटो डालें।" | No |
| Not a palm | "We couldn't find a palm in this photo. Show your open palm, fingers together, in good light." | "इस फ़ोटो में हथेली नहीं मिली। खुली हथेली, उंगलियां साथ, अच्छी रोशनी में फ़ोटो लें।" | No (refunded) |
| Safety check failed | "We couldn't complete a quick safety check. Check your connection and try again." | "एक छोटी सुरक्षा जांच पूरी नहीं हो सकी। इंटरनेट देखें और दोबारा कोशिश करें।" | No |
| Daily web cap reached | "Today's free readings on the website are used up. Please try again tomorrow — or continue in the app." | "आज वेबसाइट की मुफ़्त रीडिंग ख़त्म हो गईं। कल फिर कोशिश करें — या ऐप में जारी रखें।" | No |
| Too many tries (shared mobile IP) | "Too many tries from this network right now. Please try again later." | "इस नेटवर्क से अभी बहुत ज़्यादा कोशिशें हुई हैं। थोड़ी देर बाद कोशिश करें।" | No |
| Scanner down | "Our line scanner is busy. Please try again in a few minutes." | "हमारा रेखा स्कैनर अभी व्यस्त है। कुछ मिनट बाद कोशिश करें।" | No (refunded) |
| Offline | "You're offline. We'll continue when you're back." | "आप ऑफ़लाइन हैं। इंटरनेट आते ही हम आगे बढ़ेंगे।" | No [verify] |
| Email already registered | "This email already has an account. Sign in with a code instead." | "इस ईमेल से पहले से अकाउंट है। कोड से साइन-इन करें।" | That account's balance applies [verify] |

---

## 11. Per-page UX checklist (pass everything that applies)

**A. Truth**
- [ ] Every number comes from `site.ts` or live data. No invented counts, ratings, "people this week", "was" prices or testimonials.
- [ ] Every "free" says exactly what is free, and the page (or one tap) says the full reading is paid in the app.
- [ ] Privacy wording matches §9 and the backend word for word.
- [ ] No dates, ages, lifespan, illness, divorce, children-count or money predictions. No "accurate", "100%", "scientific", "NASA" or "world's first".
- [ ] Time claims use the measured p50 only. Only features that really exist are promised.

**B. Clarity and language**
- [ ] One dominant action per screen state.
- [ ] The first screen answers: what is it, is it free, is it in my language, what do I get?
- [ ] The Hindi version is written and reviewed by a native reader, uses everyday words, says "रीडिंग" not "credits", and has Hindi errors.
- [ ] Buttons say what happens. The same action keeps the same name through the whole flow.
- [ ] Icons always carry a text label.

**C. Trust and privacy**
- [ ] The privacy line and "What happens to my photo?" sit at every upload or camera point.
- [ ] The footer has the company name, contact, grievance contact, privacy, terms, delete account and the age rule.
- [ ] No ad or remarketing scripts; the analytics are listed in the policy; no cookie banner (and no cookies).
- [ ] Share previews exactly what will be shared, with the name off by default. No public, indexable readings.

**D. Motivation (allowed levers only, §5)**
- [ ] The scarcity shown is the real state. The locked preview is the real first sentence. Progress is tied to real events. Social proof is real, linked and above the threshold.

**E. Dark-pattern screen: none of the 13 CCPA patterns in §7**

**F. Bad-news tone** (any page about lines or life topics)
- [ ] The first sentence is calm; the three-part block is used; the limits box is present; nothing is red or a warning; no remedies are sold; the care line appears only where it belongs.

**G. Store and app** (§8)
- [ ] The button is device-aware; the price line sits beside it; "Only from Google Play"; the referrer UTMs are set.
- [ ] It is never above the primary action on reading pages. No interstitial.
- [ ] The continuity truth is stated: the app starts with a fresh scan, and the same email carries over.
- [ ] Sign-up copy says it gives **a new reading** and doesn't open locked parts.

**H. Low-end phones**
- [ ] Tested on a 3–4 GB RAM Android on slow 4G, and inside the WhatsApp and Instagram browsers (or the page shows "Open in Chrome").
- [ ] Traced lines sit exactly on the photo.

**I. Measurement**
- [ ] The stage events fire: landing → upload start, photo-check pass, p50/p90, reveal → sign-up, sign-up → reading 2, 0 readings → store click by placement.
- [ ] No personal data in analytics.
- [ ] Track the honesty KPI: 1–3★ reviews mentioning "free", "fake", "scam" or "charged" should trend to zero.

---

## 12. Verify before launch (claims above depend on these)

1. Modal's and Workers AI's retention and logging; EXIF stripping.
2. Whether free readings are shared between the web and the app for the same account.
3. That web readings stay browser-only (so the "fresh photo in the app" copy holds).
4. That a failed or unclear photo, and a retry, use no reading.
5. Exactly which emails are sent after sign-up.
6. App size and minimum Android version; prices per country; which app features are free.
7. The Play rating threshold (≥ 4.0★ with ≥ 100 ratings) before any rating is shown.
8. The age rule (18+) against the app's terms.
9. The measured p50/p90 reading time on the web build, on a low-end phone.
10. The live free-reading rule (1 as a guest + 1 after email) on the live project.
