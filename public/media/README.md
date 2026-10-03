# PalmSays 3D media (`/media/`)

All files here except the 3D product film (a Three.js render, below) are **AI-generated decorative media** (owner decision WEB-DEC-042/044, 2026-09-26),
made with Higgsfield and finished in this repo. None of them shows a real customer, a real result
or invented UI: the only UI shown (on the phone renders) is a real screenshot of our own reading page.
Encoded with `node scripts/compress-media.mjs` (sharp + the project's own `ffmpeg-static`).
Served with a one-year immutable cache (`public/_headers`): **give a changed file a new name**.

Art direction for every file: deep navy studio, frosted milky glass with a lavender-indigo tint,
polished warm gold, soft key light from top-left, warm gold rim light, premium product-render look.

## Icons — `icons/<name>-96.webp`, `icons/<name>-192.webp` (transparent, 2.7–11.8 KB each)

| Name | Used on |
|---|---|
| love, personality, career, direction | Home "What your palm reveals" cards |
| hand-shape, fingers, palm-lines, hands-compare | Home tool cards; `/tools/` hub (hand type, which-hand, finger reader, line finders, both-hands compare) |
| heart-line, head-line, life-line, fate-line | Home guide cards; `/tools/` line finders (line colours = the site's line tokens: heart red, head blue, life green, fate purple) |
| book, question | Home guide cards (how to read palm lines; is palmistry true), `/tools/` palm reading quiz, `/app/` |
| camera, signs, map | `/tools/` photo checker, palm signs checker, palm map |
| scan, globe | `/app/` "What the app does" |
| shield | Spare (not used yet) |

- 16 icons come from ONE image so they share camera, light and material: model `gpt_image_2_5`
  (quality high, 2K, transparent background), prompt "A cohesive premium 3D icon set: 16 icons
  arranged in a clean 4 by 4 grid … thick frosted milky glass with a soft lavender-indigo tint and
  polished warm gold accents …" (heart, person bust, briefcase + coin, compass, open hand, finger
  pillars with a gold measuring bar, [unused tablet], two mirrored hands, open book, question mark,
  camera, phone with scan brackets, globe, folded map with pin, triangle + star, shield with check).
  Sliced into cells, trimmed and centred.
- `palm-lines` and the four `*-line` icons: an empty arch tablet (the brand-mark shape) made with the
  same model, using the icon set as a style reference ("… a thick rounded arch-shaped tablet … face
  completely EMPTY …"). The palm lines were then drawn on it in code with the exact line paths and
  colours of the site (not by the AI), so the colour meaning is exact.

## Film — `video/palm-scan.mp4` (H.264, 1280×720, 5 s, ~400 KB), `video/palm-scan.webm` (VP9, ~140 KB), `video/palm-scan-poster.webp`

Home "How it works". Muted, looping, plays only while on screen; never under
`prefers-reduced-motion` or `html[data-lite]` (the poster stays).
1. Still: `gpt_image_2_5` (high, 2K, 16:9): "A sculpture of a human hand made of thick frosted milky
   glass … palm facing the camera … exactly four fingers and one thumb … on a slim polished gold
   disc plinth. Deep navy studio background …".
2. Film: `seedance_2_5` (omni_reference, 720p, 5 s, no audio), the still as both start and end frame
   (so the loop is seamless): "Locked-off static camera … a thin horizontal band of soft warm golden
   scanning light … glides down across the frosted glass hand … the three fine palm lines engraved in
   the glass light up … then gently fade back …".

## 3D product film — `video/product-film-{en,hi}.mp4` (H.264) / `.webm` (VP9), 1280×720, 30 fps, ~15 s, plus `product-film-{en,hi}-poster.{avif,webp}`

Home "How it works" (replaces the glass-hand film there; `/hi/` gets the Hindi film) and `/app/`
"What the app does". Muted, looping, `preload="none"`, plays only while on screen, never under
`prefers-reduced-motion` (the poster stays). **Not AI-made:** a Three.js render done in this repo.
- Screen = a **real recording** of our own `/reading/` page running in preview (mock) mode on
  `astro dev` (`.env.development`: the app's real pipeline on a stored real scan, labelled "Preview";
  the sample photo `public/samples/hero-palm-1200.jpg`, name "Deepak" / "दीपक", man). Recorded at
  390×800 @2x with Chrome's own screencast at natural speed: `node research-tools/film-record.mjs
  http://localhost:4321 <recDir> en|hi`. Nothing on the screen is drawn, edited or invented; the only
  edits are two trims (the film starts at "found your hand"; the "opening your report" wait is cut
  with a 0.5 s dissolve) and the scripted, eased scrolls (report top → "Your palm at a glance" →
  "Keep and share"). A plain strip in the page's own top colour sits above the page as the status bar.
- Phone and studio = procedural Three.js (`research-tools/film/scene.js`): champagne-gold metal frame,
  black glass, dynamic island, a specular-only glass sheen, soft-box studio reflections, warm key,
  violet and gold rim lights, a navy gradient with a low gold glow (edges = the site's `rgb(2,1,25)`).
  No third-party model.
- Rendered frame by frame (deterministic, 1920×1080, real GPU via headless Chrome), camera on a
  smooth spline: wide 3/4 view → push-in onto the palm while the four lines draw → pull back and
  orbit into the report → slow pull-out. Loop seam = a short fade to the background.
  `node research-tools/film-render.mjs <recDir> <workDir> product-film-en` (encodes with ffmpeg-static,
  downscaled to 720p with lanczos). Contact sheet: `node research-tools/film-sheet.mjs <framesDir> <out.png>`.

## Phone renders — `renders/`

| File | Used on |
|---|---|
| `phone-report-close-{en,hi}-{480,800}.{avif,webp}` (square close-up, 14–41 KB) | Home "A real reading" (`#sample`) |
| `phone-report-{en,hi}-{480,800}.{avif,webp}` (4:5 full shot, 14–44 KB) | `/app/` "What the app does" |

- Phone: `gpt_image_2_5` (high, 2K, 4:5): "a modern smartphone floating in a deep navy studio … polished
  champagne-gold metal frame … turned about 15 degrees … the ENTIRE screen area is a perfectly flat,
  uniform, pure chroma green …".
- Screen: a **real** screenshot (390×844 @2x) of our own `/reading/` page in preview (mock) mode — the
  same real stored scan and the same text as `public/samples/ui-step-3-*.webp` — placed on the green
  screen and in the floor reflection with a perspective warp in code. No UI or text was invented.

## App icon and favicon (in `public/`)

- `favicon.svg`: the brand arch mark (Logo.astro), refined with a glass gradient, a gold-gradient rim
  and lines, and a soft highlight; still one simple shape for 16 px. `favicon-32.png` is rendered from it.
- `apple-touch-icon.png` (180) and `logo-512.png`: a 3D render of the same mark — an indigo glass arch
  tablet with a gold rim made with `gpt_image_2_5`, with the brand's three palm lines drawn on it in
  code in gold. Note: `scripts/make-images.mjs` still writes flat versions of these two files; do not
  re-run it without restoring these (or update that script).

## Tool-page hand — `tools/` (Three.js renders, not AI-made)

The home hero's porcelain hand (`public/models/hero-hand/hand-v1.glb`, same material and lights as
`src/scripts/hero-3d-scene.ts`) rendered straight on in this repo, mirrored to a RIGHT palm as you see
your own (thumb on the right). The model's palm creases are smoothed out of the picture (Laplacian
smoothing inside the palm only), and every line the tools show is drawn on top in SVG from
`src/lib/tools/palm-geometry.ts` (base lines traced on the model's own creases), so nothing in the
picture contradicts a drawn option. All files share one coordinate frame (1000 × 1300).

| File | Used on |
|---|---|
| `hand-right-800.webp` (42 KB) | Line-finder and palm-signs thumbnails (one file per page, cropped with SVG `viewBox`) |
| `hand-right-1000.webp` (55 KB) | Interactive palm map, palm reading quiz |
| `hand-right-192.{avif,webp}`, `hand-left-192.{avif,webp}` (5–9 KB) | Upload wells (photo checker, photo tools, line finder); left vs right slots |
| `palm-square-480`, `palm-long-480`, `fingers-short-480`, `fingers-long-480` `.{avif,webp}` (12–24 KB) | Hand type quiz answers (the same mesh with palm width/length or finger length warped; fixed camera) |

Make: `node research-tools/tool-hand-render.mjs <dir>/r-base.png` (plus `palmW=1.06 palmL=0.94` →
`r-square`, `palmW=0.88 palmL=1.2` → `r-long`, `fingerL=0.72` → `r-short`, `fingerL=1.12` → `r-longf`),
then `node research-tools/tool-hand-export.mjs <dir>`. No Higgsfield credits used.
