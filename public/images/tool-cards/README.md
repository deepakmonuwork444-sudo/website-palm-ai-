# Tool card images (real results, real palms)

Owner rule (2026-10-05): tool cards show a REAL result from a real hand, never icons, never invented output.
Used by `src/lib/tools/tool-photos.ts` (home tool section, `/tools/` hub, tool page title tiles,
"Other free tools", guide tool cards). Files are `<name>-<width>.avif` + `.webp` (sharp, Lanczos3,
AVIF q60 4:4:4, WebP q82). Licences and photographers: `public/samples/LICENSE.txt` and
`design-v4/photos-v5/manifest.json` / `manifest-b.json` (all Pexels License: free commercial use,
modification allowed, credited anyway).

## 1. Real tool results (captured 2026-10-05)

Each was made by running the site's OWN tool page (production build, headless Chromium,
playwright-core) on the photo below, exactly as a visitor would: the photo was picked in the tool's
file input, the on-device MediaPipe hand model found the 21 points, and the tool drew its result.
The tool's own result picture (`svg.t-ov-photo`: photo + what the model measured) was then
screenshotted at 3x. Only two things were changed for the card: the `<image>` inside the SVG was
pointed at a sharper copy of the SAME photo (same aspect and coordinates, so every point stays where
the model put it), and the SVG's view box was widened/cropped to frame the hand (nothing drawn by hand,
no point moved).

| Files | Tool | Photo | Tool's real headline |
| --- | --- | --- | --- |
| `hand-shape-*` (4:5, 480/720/960/1200), `hand-shape-sq-*` | `/tools/hand-type-quiz/` (hand type from your photo) | "Person's Hand Doing Stop Hand Sign" by Kevin Malik, Pexels 9017588 (the Living palm hero hand, hero-palm-a), crop x0 y900 4000x5100 of the 4000x6000 original | "Your hand type: Water hand" (palm length / width 1.63, middle finger / palm 0.93) |
| `fingers-*` (4:5), `fingers-sq-*` | `/tools/finger-reader/` | same photo and crop as above | "Index and ring fingers equal, thumb held close" (thumb 12 degrees) |
| `left-right-*` (1.3:1, 480/720/960/1280), `left-right-sq-*` | `/tools/left-vs-right-palm/` | "Photography of left and right palms" by Luis Quintero, Pexels 2258247 (which-hand-both-palms). One photo of ONE person's two hands, split into two photos at x=3120 (left: x416-3120, right: x3120-5824, full height) and given to the tool as the first and second hand. The two result pictures are shown side by side with each view box set to its whole photo, so together they re-form the original photo. | "Your hands differ in 5 of 6 measures" (left: earth or fire, right: earth or air) |

## 2. Living palm hands with their real scanner lines

Cut-out hand (`public/models/living-palm/<hand>/palm-albedo.webp`) with the REAL palm4_v2 scan
polylines of that photo (`lines.json`, uv) drawn on it in the site's trace colours; square crop
around the scanned lines. Credits: `public/models/living-palm/hands.json` and each folder's LICENSE.txt.

| Files | Hand | Lines drawn |
| --- | --- | --- |
| `all-lines-sq-*` (160/320/640) | hero-palm-a (Kevin Malik, Pexels 9017588) | heart, head, life, fate |
| `life-line-sq-*` | hero-palm-a | life |
| `heart-line-sq-*` | hand-type-c (Juan Pablo Serrano, Pexels 1257770) | heart |
| `fate-line-sq-*` | hand-type-c | fate |
| `quiz-sq-*` | hand-type-c | heart, head, life, fate |
| `head-line-sq-*` | hero-palm-c (Amusan John, Pexels 8062714) | head |
| `palm-map-sq-*` | hero-palm-c | heart, head, life, fate |

## 3. Real photos (photo library v5, no lines)

| Files | Source |
| --- | --- |
| `photo-check-*` (4:5), `photo-check-sq-*` | `/images/v5/photo-do-good-1200.webp` (Kevin Malik, Pexels 9017588; the "good photo" example) |
| `which-hand-sq-*` | `/images/v5/which-hand-both-palms-1200.webp` (Luis Quintero, Pexels 2258247), centre square |
| `signs-sq-*` | `/images/v5/palm-lucky-signs-1200.webp` ("Palms of faceless person under sunlight", Angela Roma, Pexels 7479987), centre square |

Regenerate a result if the photo, the hand model or the tool's drawing changes.
