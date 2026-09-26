---
name: ux-conversion
description: Use when writing or changing PalmSays UX flows, CTAs, button labels, the reading/lock/credits ("free readings") messaging, the sign-up sheet, store buttons and price lines, the /app/ page, onboarding, empty and zero-readings states, errors, privacy lines, bad-news palmistry meanings, banners or any English or Hindi microcopy. Enforces honest conversion (no fake urgency or social proof, no drip pricing, CCPA 2023 / FTC / Google rules), fear removal, "free" always qualified, the price beside every store button, and "sign-up = a new reading". Links to UX_PSYCHOLOGY.md.
---

# PalmSays UX and conversion

The goal is: free web reading → trust → Google Play install, reached honestly. Every word must be true on launch day. The owner's rule is that the site never lies, never pressures and never hides a cost.

## 1. Load first

- **`UX_PSYCHOLOGY.md`** is the source of truth. Read §1 (the 12 rules), then the part for your task:
  - funnel stage and copy: §3;
  - fears: §4;
  - levers: §5;
  - bad news: §6;
  - dark patterns: §7;
  - app hand-off: §8;
  - privacy copy: §9;
  - errors: §10;
  - checklist: §11.
- **`src/config/site.ts`** holds every number: free readings, prices, app size, p50, rating threshold, `iosAppAvailable`. **Never type a number or a price into copy.**
- For anything visual, also load the **`palmsays-ui`** skill.
- A new flow or feature needs a plan in chat and the owner's approval before any code.

## 2. Funnel rules

1. **Value first.**
   - Reading 1 needs nothing: no email, no phone, no install.
   - Reading 2 needs only an email and a 6-digit code (no password).
   - Money is never asked for on the web.
2. **Say the whole deal before the first scan:** 2 free readings (1 now, 1 after sign-up); what each shows (Love and Personality in full, plus the first sentence of Career & Money and Life Direction); the full reading is in the paid Android app. This is the What's free box plus the free qualifier in the hero card.
3. **Sign-up = a new reading.** It never opens the locked parts of reading 1, and the copy says so wherever sign-up is offered.
4. **Before reading 2, say it's the last one:** "This is your 2nd and last free reading on this website."
5. **The store button appears at peak intent.**
   - It is secondary after reading 1.
   - It is primary in the lock sheet and at 0 readings.
   - It never appears in the home hero, and never as an interstitial.
   - At most one dismissible banner, hidden for 30 days after dismissal.
6. **Zero readings:**
   - thank the user;
   - show their 2 saved readings (with "save as image");
   - give one next step (the app, with its price) and a free path to guides and tools;
   - no guilt copy.
7. **Only real stages** while the user waits. "Usually about {p50} seconds" appears only once measured. After p90, offer a way out.

## 3. Remove the fear where it starts

| Fear | Put this at the moment it appears |
|---|---|
| Photo privacy | The privacy line plus "What happens to my photo?" at every upload or camera point, worded exactly as in §9. Never "sent once", "never stored", "we keep nothing" or "deleted right after". |
| Being charged | "No payment on this site." "We never ask for card or UPI on this website." |
| Hidden subscriptions | The price line under every store button: packs one-time, plans renew until cancelled in Google Play. |
| Spam | Which emails we send; opt-ins unticked; delete account one link away |
| Scary verdicts | The "What palmistry can't tell you" box; the three-part block (what we see, what the tradition says, what it can't tell you) |
| Fake AI | An evidence sentence and a source under each meaning; "not clearly seen" instead of guessing; "Try your other hand" |
| Mistakes or language | Hindi everywhere, errors included; "you can always try again"; a failed photo costs nothing |
| No iPhone app | The honest note at app moments only; no App Store badge |

## 4. Honest FOMO: allowed vs banned

| Allowed (true, checkable) | Banned |
|---|---|
| "1 of 2 used" / "2 में से 1 इस्तेमाल हुई" | Countdown timers, "offer ends", "only 3 left today" |
| "This is your last free web reading" | "Don't miss your destiny", "your reading will be lost" |
| The real first sentence of a locked part; "2 of 4 parts read" | Blurred or "██" text, fake faded paragraphs, fear hooks |
| Stage ticks when they really finish | Timer-driven progress bars, "80% done" bonuses |
| The live Play rating (≥ 4.0★ and ≥ 100 ratings) with a link; dated, rounded-down real totals | "Viewing now", "just downloaded" toasts, hard-coded counts, unlinked logos |
| A classical source; a named author and reviewer | "NASA", "100% accurate", "scientific", "trained on 1,000+ texts", "world's first" |
| Real seasons (Karva Chauth, weddings) as content | Deadlines tied to festivals; struck "was" prices; decoy tiers |
| A plain "Not now" / "अभी नहीं" | Confirm shaming ("No thanks, I don't care about love") |

Screen every change against all **13 CCPA 2023 dark patterns** (UX_PSYCHOLOGY.md §7): false urgency, basket sneaking, confirm shaming, forced action, subscription trap, interface interference, bait and switch, drip pricing, disguised ads, nagging, trick questions, SaaS billing and rogue malware. Also check the FTC fake-review rule (16 CFR 465) and Google's interstitial and misleading-claims rules.

## 5. Required copy rules

1. **"Free" is always qualified**: "First reading free", "2 free readings on this site". The full reading is paid in the app, and that is said on the same screen or one tap away.
2. **The price sits beside every store button**, as a price line from `site.ts`: free download, about {X} MB, paid readings from ₹{price}, no ads, and "Only from Google Play — never an APK file".
3. **Say it before install:** "In the app you'll take a fresh photo — it takes about a minute. Your web readings stay in this browser." Use the same email.
4. **Promise only features the app has today.** The list in §8.4 is marked [verify].
5. **iPhone:** "The iPhone app isn't ready yet. You can keep using the website — guides and tools are free."
6. **Buttons say what happens:** "Take a palm photo", "Send my code", "Use this photo". Sentence case, no "→", no "Submit". The same action keeps the same name through the whole flow.
7. **Errors say what went wrong and how to fix it:** "Too dark — move near a window or turn on a light." No "Oops", no apologies.
8. **Bad news:** calm first line, "is read as" / "परंपरा में माना जाता है", never "you will". No dates, ages, lifespan, illness, divorce, children-count or money. End with agency. The care line (Tele-MANAS 14416, US 988) goes only on lifespan and death-anxiety guides.
9. **Hindi:**
   - simple spoken Hindi with the warm "आप";
   - "रीडिंग", never "credits";
   - English words people really use are fine (ऐप, ईमेल, Google Play);
   - a native reviewer checks every page before it goes live.
10. **Never join facts with "·" on screen.** Use separate chips, lines or list items.

## 6. EN/HI patterns to reuse (the full set is in UX_PSYCHOLOGY.md §3.2)

| Pattern | English | Hindi |
|---|---|---|
| Qualified free | "2 free readings on this site. The full reading is in our Android app (paid)." | "इस साइट पर 2 रीडिंग मुफ़्त। पूरी रीडिंग हमारे Android ऐप में है (पैसे वाली)।" |
| Sign-up truth | "Signing up gives you a new reading. It doesn't open the locked parts of this one." | "साइन-अप करने से एक नई रीडिंग मिलती है। इस रीडिंग के बंद हिस्से नहीं खुलते।" |
| Not clear | "Your fate line isn't clear in this photo. We didn't guess." | "इस फ़ोटो में आपकी भाग्य रेखा साफ़ नहीं दिखी। हमने अंदाज़ा नहीं लगाया।" |
| Self-check | "Look at your own hand now — can you see this curve?" | "अब अपना हाथ देखिए — क्या आपको यह मोड़ दिख रहा है?" |
| Last one | "This is your 2nd and last free reading on this website." | "यह वेबसाइट पर आपकी दूसरी और आख़िरी मुफ़्त रीडिंग है।" |
| Continuity | "In the app you'll take a fresh photo — it takes about a minute." | "ऐप में एक नई फ़ोटो लेनी होगी — करीब एक मिनट लगता है।" |
| Not now | "Not now? Keep learning free — guides and tools." | "अभी नहीं? मुफ़्त में सीखते रहें — गाइड और टूल।" |

## 7. Checklist before you finish

- [ ] Every number and price comes from `site.ts` or live data. Nothing is invented or hard-coded.
- [ ] "Free" is qualified. The price line sits beside every store button. The continuity line appears before install.
- [ ] Sign-up is described as a new reading. "Last" is said before reading 2.
- [ ] One dominant action per screen state. The secondary action is readable. "Not now" is plain.
- [ ] Privacy copy matches UX_PSYCHOLOGY.md §9 word for word.
- [ ] No banned lever and none of the 13 CCPA patterns. No prediction, no appearance comments, no remedies.
- [ ] Both languages are done, with Hindi errors included. The Hindi is flagged for native review.
- [ ] Any claim marked [verify] is either verified or left out.
- [ ] `PROJECT_MASTER.md` is updated if the flow's status changed. Report to the owner in short, simple Hinglish.
