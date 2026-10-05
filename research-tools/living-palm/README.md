# Living palm pipeline

Turns one licensed palm photo plus its **real** palm scan into the 2.5D "Living palm" asset set used by the home hero
(a real photographed hand, rebuilt in depth, with the scanner's own four lines drawn on it).

## Setup (once)

Run in `D:\palm ai\palm-ai-website` (PowerShell: use `npm.cmd`):

```
npm.cmd install --prefix research-tools/living-palm
npm.cmd install --prefix research-tools          # playwright-core, only for the QA shots
```

Model weights are not in git. On first build `@huggingface/transformers` downloads
**onnx-community/depth-anything-v2-small** (fp32 ONNX, about 99 MB, Apache-2.0) into `research-tools/living-palm/.cache/hf/`.
To fetch it by hand, put `config.json`, `preprocessor_config.json` and `onnx/model.onnx` from
https://huggingface.co/onnx-community/depth-anything-v2-small into `.cache/hf/onnx-community/depth-anything-v2-small/`.
`.cache/` (weights + per-hand intermediates) and `node_modules/` are gitignored.

## Build a hand

```
node research-tools/living-palm/build.mjs <slug> [--out <dir>] [--params "{\"roi\":0.035}"]
```

Inputs: `design-v4/photos-v5/manifest.json` (source photo + crop), `design-v4/photos-v5/raw/<pexels-id>.jpg`
(gitignored originals), `design-v4/photos-v5/<slug>.scan.json` (real palm4_v2 scan: outline, landmarks, line polylines).
The scan must have a hand outline (whole open palm). Output goes to `public/models/living-palm/<slug>/`.

Steps: crop, turn so the fingers point up, matte (colour model seeded by the scan outline, shadow-aware, guided-filter
edge), decontaminated albedo + wrist fade, depth (Poisson inflation + Depth Anything V2), object-space normal map with
real crease detail, soft shadow, line distance/progress atlas from the scan polylines, automatic label anchors.
Lines come only from the scan; nothing is placed by hand.

| file | what |
|---|---|
| `palm-albedo.webp` / `palm-albedo-1024.webp` | colour + alpha, desktop / phone |
| `palm-normal.webp` | object-space normals (1024 wide) |
| `palm-depth.png` | 16-bit depth in R (high) / G (low), coverage in B; mesh grid 257 wide |
| `palm-shadow.png` | blurred matte for the soft wall shadow |
| `lines-field.png` | 512 wide, 3 stacked bands: distance heart/head/life, progress heart/head/life, R fate distance + G fate progress |
| `lines.json` | `rect` of the atlas in photo UV, `maxDistPx`, line polylines (`uv`), `labels` {key: {uv, align}}, `labelBox` |
| `palm-meta.json` | sizes, `zmin/zmax`, `pxToWorld`, `frame` {content box, pivot, palmEdges, wristFade} |

Labels: each label box is tried beside its line (both sides, three gaps) and just past its ends; it must sit inside the
hand matte, below the knuckle line and above the wrist, and clear of the other lines; an exhaustive search picks the
non-overlapping set. The box size assumes the viewer font `max(13 px phone / 16 px desktop, 0.055 x palm width on screen)`
(palm width = `frame.palmEdges`). A label with no valid spot is left out and listed in `labelWarnings`.

Useful `--params`: `roi` (outline dilation for the matte, default 0.07 of palm width; 0.035 for photos with a cast
shadow next to the hand), `c0`/`c1` (matte choke), `geps` (guided-filter smoothness), `kda`/`hc` (depth strength),
`aq`/`nq` (WebP quality).

## Quality gate

```
node research-tools/living-palm/qa/shots.mjs <slug> <outDir> [assetsDir]
```

Renders `qa/viewer.html` (the approved sample viewer, reading `frame` and `labels` from the assets) at 390x844@3 and
1440x900: idle, lines drawn, rotated -18 and +18 deg, plus a contact sheet per size and a screen-space label overlap check.
Look at the sheets; reject hands with a bad cut-out, stretched fingers, wrong depth or lines off the creases.
Passing hands go in `public/models/living-palm/hands.json`. Budget per hand: about 1 MB desktop, 0.8 MB phone.
Progress log: `NOTES.md`.
