---
name: tool-page
description: "Use when building or changing any of the 12 free tool pages on the PalmSays website (palmsays.com): the free AI palm reading (home), palm line finder, palm photo checker, heart/head/life/fate line finders, which-hand quiz, hand-type quiz, palm signs checker, interactive palm map, palm reading quiz, or the /tools/ hub and /hi/tools/ pages. Triggers: tool island/component work, tool copy, result cards, honesty labels, photo privacy notes, tool analytics events, tool performance or accessibility, linking a guide to its tool. Gives the tool list (URL, input, output, AI or rules, keyword), the shared template, honesty labels, privacy, events, a11y/perf and the verify checklist."
---

# Tool pages (PalmSays)

Owner decision (2026-09-26): **all 12 tools get their own page**, with real content under the tool. **One canonical home per tool:** the matching guide links to it with a tool card and never embeds a copy.

Docs:
- `KEYWORD_MAP.md` §3 (tool keywords);
- `SEO_PLAYBOOK.md` §5 (titles, meta, H1), §6 (schema), §11 (tool ↔ guide links), §13 (budgets);
- `CONTENT_GUIDE.md` §6 (tool template), §4 (honesty), §9 (sources);
- plan §7.4–7.5, §8, §9, §13.3.

For copy, also use `content-writer`; for head tags, `seo-page`.

## The 12 tools

| # | Tool | URL | Input | Output | AI or rules | Keyword | Phase |
|---|---|---|---|---|---|---|---|
| 1 | Free AI palm reading | `/` → `/reading/` (noindex flow) | Palm photo (camera or gallery), hand, writing hand | Lines traced on the photo + the 4-part reading (2 parts open, 2 show their first sentence) | **AI:** Modal line scan + Workers AI observation; meanings from the app's rule engine in the browser | free palm reading | P1 |
| 2 | Palm line finder | `/tools/palm-line-finder/` | Palm photo | Named, traced lines with "not clearly seen" states; no meanings; leads to the reading | **AI:** Modal scan only (D19: no free reading used, own daily cap + Turnstile) | palm line finder | P2 |
| 3 | Palm photo checker | `/tools/palm-photo-checker/` | Photo | Bright, sharp, whole palm, straight, each with a fix; "Use this photo" hands it to `/reading/` | Rules **on the phone** (port of the app's `quality/{metrics,verdict,review}`) | how to take a palm photo for reading | P1 |
| 4 | Heart line finder | `/tools/heart-line-finder/` | Pick the shape from diagrams (length, curve, ending, fork, break, chain) | Traditional meaning + source + "See your real line" | Rules (heart rules in `lib/palm`) | which heart line do I have | P2 |
| 5 | Head line finder | `/tools/head-line-finder/` | Shape: straight/sloping, joined to or separate from the life line, length, fork, break | Same | Rules | which head line do I have | P2 |
| 6 | Life line finder | `/tools/life-line-finder/` | Shape: curve, start, end, break, fork, depth | Same, plus "length is not lifespan" | Rules | which life line do I have | P2 |
| 7 | Fate line finder | `/tools/fate-line-finder/` | None / faint / clear; start (wrist, life line, Moon mount); break; double | Same; "no fate line is common" | Rules | do I have a fate line | P2 |
| 8 | Which-hand quiz | `/tools/which-hand-quiz/` | 3–4 taps: writing hand, what you want to read | Which hand to scan, and why | Rules (`hand-role.ts`) | which hand should I read quiz | P1 |
| 9 | Hand-type quiz | `/tools/hand-type-quiz/` | 2 measurements: palm shape, finger length | Earth, air, fire or water + a share card | Rules. **Source to settle first** (CONTENT_GUIDE §9.4) | what hand type do I have | P2 |
| 10 | Palm signs checker | `/tools/palm-signs-checker/` | Tick the signs you see (M, cross, star, triangle, fish, island) | Traditional meanings + sources | Rules; no app rule exists, so the meanings are cited from the books | palm signs checker | P2 |
| 11 | Interactive palm map | `/tools/palm-map/` | Tap a line or mount | Meaning sheet + guide link + "See it on your palm" | Static (lesson content) | interactive palm reading chart | P1 |
| 12 | Palm reading quiz | `/tools/palm-reading-quiz/` | 10 questions on diagrams | Score card (shareable, no personal data) | Static (web version of the app's lesson quizzes) | palm reading quiz | P2 |

- **Tool ↔ guide pairs:** SEO_PLAYBOOK §11.
- **Never built** (owner): marriage-age, children-count, lifespan or compatibility tools. Never a `/tools/free-palm-reading/` page (it would copy home).
- **Hindi:** `/hi/tools/<same slug>/` in P2, each after review; no scanner keywords (those belong to `/hi/`).

## Shared template (CONTENT_GUIDE §6)

1. Breadcrumb: Home › Tools › {tool}.
2. H1 with a one-line promise, then the **honesty label**.
3. **The tool**, directly under it. Photo tools: the privacy note sits under the button.
4. The result, in place:
   - the meaning in our words + a source chip + "See your real line" → home upload;
   - no result creates a URL; `?shape=` share links canonicalise to the clean URL.
5. **How it works:** 3 true steps, saying where things run.
6. **What palmistry says:** ≤ 2 sentences per type, each with a source; a link to the full guide. Never paste the guide's variation cards.
7. **What this tool can't tell you:** the limits box + the tool's own limits → `/is-palmistry-real/`.
8. **FAQ** (3–6), about using the tool.
9. **Links:** the guide, the free reading (home), 2–3 related tools.
10. **End block:** a device-aware store button with the **price line from `site.ts`** and "Only from Google Play"; QR + "Send to my WhatsApp" on desktop; the honest note on iPhone.
11. The other tools list.

400–900 words under the tool. Schema: `WebApplication` + `BreadcrumbList`, price 0, no ratings.

## Honesty labels (exact; only photo tools mention AI)

| Tools | Label |
|---|---|
| 1 | Uses AI to trace your lines. Meanings come from classical palmistry books, not from AI. |
| 2 | Uses AI to trace your lines. Shows lines only — no meanings. |
| 3 | Runs on your phone — your photo never leaves this device. |
| 4–7 | Traditional meanings from classical books — not AI. No photo needed. |
| 8 | Based on palmistry tradition — not AI. |
| 9 | Your measurements, matched to hand types — not AI. |
| 10 | You tick what you see; meanings come from classical books — not AI. |
| 11 | A map of traditional meanings — not AI. |
| 12 | A quiz on diagrams — no photo needed. |

- **Tools 4–7, 10:** say that phone photos can't show islands, stars, crosses or triangles reliably, which is why you pick or tick them yourself.
- **Tool 6:** "Length is never read as lifespan", plus the care line in its limits box.
- **Tool 7:** "No fate line is common and not a bad sign."

## Privacy for photo tools (copy must match the backend; plan §8.4–8.5)

- **Tool 3:** processing happens on a canvas in the browser. **Verify** in the devtools Network tab that no request carries the image. Re-encoding strips EXIF/GPS.
- **Tool 1:**
  - The photo goes through `api.palmsays.com`: a 1,080 px copy to Modal (USA) for tracing, a 768 px copy to Cloudflare Workers AI.
  - Stored on the server: the traced line points, landmarks, the observation and the report, under the guest or email user until deleted.
  - The web reading stays in this browser (IndexedDB).
  - Link: "What happens to my photo?" → `/how-it-works/`; deletion → `/account/`.
- **Tool 2:** Modal only. **[verify]** what is stored before writing the note.
- **Never write** "never stored" or "not stored on any server" until it's **[verify]**-ed that Modal and Workers AI keep no copies.
- The privacy line comes from `site.ts`, never typed on the page. Readings are for 18+.

## Analytics (cookie-free; plan §13.3)

- **Every tool:** `tool_use{tool}` on the first real interaction, not on page view. Page views come from Cloudflare Web Analytics.
- **Tool ids:** `free-reading`, `line-finder`, `photo-checker`, `heart-finder`, `head-finder`, `life-finder`, `fate-finder`, `which-hand`, `hand-type`, `signs-checker`, `palm-map`, `line-quiz`.
- **Photo tools:** `upload_start`, `photo_check_pass`, `photo_check_fail{reason}`; tool 1 adds the reading events (`reading_start` … `reading_done`, `reading_error{code}`).
- **Store and share:** `store_click{page:'tool-<id>', placement, device}`, `qr_view`, `whatsapp_self`, `iphone_note_shown`, `share_card_create` (tools 9 and 12).
- **Play link referrer:** `utm_source=web&utm_medium=tool-<id>&utm_campaign=<placement>`.
- **Any new event name** must first be on the accepted list (app repo migration 0021). Never send personal data, photo data or answers tied to a person.

## Accessibility and performance

- **JS budget:**
  - ≤ 70 KB gzipped, one island loaded `client:visible`;
  - Preact or plain TS if over;
  - heavy code (image pipeline, Turnstile, rule engine) loads only on tap;
  - guides ship 0 KB (tool cards are static).
- **Page budgets:** HTML ≤ 25 KB, CSS ≤ 25 KB; LCP ≤ 2.0 s, INP ≤ 150 ms, CLS ≤ 0.05. Reserve the result area's height so nothing jumps.
- **Pickers:**
  - a real radio group (keyboard, visible labels); SVG thumbnails with alt text in the page's language;
  - targets ≥ 48 × 48 px; visible focus;
  - the result in `aria-live="polite"`, with focus moved to the result heading;
  - errors say it in words, never by colour alone; reduced-motion version of any animation.
- **Photo input:**
  - `accept="image/*"` with a camera option on phones;
  - HEIC → "Please upload a JPG" (D15);
  - works in the WhatsApp and Instagram in-app browsers, or shows "Open in Chrome".
- **Traced lines** sit exactly on the photo, in its own coordinates. The owner rejected a misaligned scan visual before, so test at 3 screen sizes.
- Devanagari fonts load on `/hi/` only.

## Verify checklist (before a tool page ships)

- [ ] The URL and keyword match KEYWORD_MAP §3; the title, meta and H1 match SEO_PLAYBOOK §5 (lengths checked).
- [ ] The honesty label is exact; AI is mentioned only on tools 1–2.
- [ ] Every result text equals the rule meaning (or a cited book passage for tools 9–10) and carries its source chip.
- [ ] No prediction, blocked claim or banned word; the limits box is present; tool 6 has the care line.
- [ ] 400–900 unique words under the tool; no copy of the guide's variation cards.
- [ ] The guide shows a tool card linking here; this page links back to the guide, home and `/app/`.
- [ ] Photo tools: the privacy note matches the backend; tool 3 sends no image (checked in the Network tab).
- [ ] Events fire once with the right `tool` id; no personal data; the store link carries the referrer UTMs.
- [ ] The price line is next to the store button, from config; the iPhone note appears on iPhone.
- [ ] Keyboard-only run works; screen reader announces the result; 48 px targets; no CLS when the result appears.
- [ ] Lighthouse CI within budget; tested on a real low-end Android and in the WhatsApp in-app browser.
- [ ] `WebApplication` + `BreadcrumbList` validated; no rating markup.
- [ ] Listed on `/tools/` with its label; in `sitemap-tools.xml`; Hindi version only after review.

Report back in short, simple Hinglish: which tool, what changed, what's verified and what isn't.
