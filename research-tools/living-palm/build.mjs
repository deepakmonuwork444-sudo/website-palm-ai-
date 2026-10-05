// Living palm builder: one real photo + its REAL palm scan -> 2.5D hand assets for the home-page viewer.
//   node research-tools/living-palm/build.mjs <slug> [--out <dir>] [--params '{"kda":0.45}']
// Reads  design-v4/photos-v5/manifest.json (source file + crop), design-v4/photos-v5/raw/<pexels-id>.jpg,
//        design-v4/photos-v5/<slug>.scan.json (real palm4_v2 scan: outline, landmarks, line polylines).
// Writes public/models/living-palm/<slug>/ : palm-albedo.webp, palm-albedo-1024.webp, palm-normal.webp,
//        palm-depth.png (16-bit depth in R/G, coverage in B), palm-shadow.png, palm-meta.json,
//        lines.json (real scan lines + auto label anchors), lines-field.png (distance/progress atlas).
// Lines come ONLY from the scan. Nothing is placed by hand. See README.md.
import sharp from 'sharp'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
import { blur, resize, edt, poisson, smooth, largestComponent, fillHoles, polyMask, erode, dilate, pointInPoly, guidedFilter } from './lib.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const PH = path.join(REPO, 'design-v4/photos-v5');
const argv = process.argv.slice(2); const slug = argv[0];
if (!slug) { console.error('usage: node build.mjs <slug> [--out dir] [--params json]'); process.exit(1); }
const opt = (k) => { const i = argv.indexOf(k); return i > 0 ? argv[i + 1] : undefined; };
const P = { kda: 0.45, hc: 0.20, kc: 0.16, W: 1600, ...JSON.parse(opt('--params') || '{}') };
const OUT = path.resolve(opt('--out') || path.join(REPO, 'public/models/living-palm', slug)) + '/';
const WORK = path.join(HERE, '.cache', slug) + '/';
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(WORK, { recursive: true });
const t0 = Date.now(); const log = (...a) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s]`, ...a);

// ---------------------------------------------------------------- 0. source photo, crop, scan
const man = JSON.parse(fs.readFileSync(path.join(PH, 'manifest.json')));
const photo = man.photos.find((p) => p.slug === slug); if (!photo) throw new Error('slug not in manifest: ' + slug);
const scan = JSON.parse(fs.readFileSync(path.join(PH, slug + '.scan.json')));
if (!scan.hand?.outline || !scan.hand?.landmarks) throw new Error('scan has no hand outline/landmarks (not a whole open palm): ' + slug);
const pid = photo.sourceUrl.match(/(\d+)\/?$/)[1];
const rawFile = fs.readdirSync(path.join(PH, 'raw')).find((f) => f.includes(pid)); if (!rawFile) throw new Error('raw original missing for ' + pid);
const crop = photo.crop;

// orientation: turn the photo (multiples of 90 deg) so the fingers point up. Scan coords are normalised to the crop.
const LM = scan.hand.landmarks; const fx = LM[9][0] - LM[0][0], fy = (LM[9][1] - LM[0][1]) * crop.height / crop.width;
const ROT = Math.abs(fy) >= Math.abs(fx) ? (fy < 0 ? 0 : 180) : (fx < 0 ? 90 : 270); // sharp rotates clockwise
const rot = ([x, y]) => ROT === 0 ? [x, y] : ROT === 90 ? [1 - y, x] : ROT === 180 ? [1 - x, 1 - y] : [y, 1 - x];
const RW = ROT % 180 ? crop.height : crop.width, RH = ROT % 180 ? crop.width : crop.height; // rotated crop size (raw px)
const outlineR = scan.hand.outline.map(rot), lmR = LM.map(rot);
// sub-crop around the hand (normalised rotated-crop coords)
const toRawPx = ([x, y]) => [x * RW, y * RH];
const oPx = outlineR.map(toRawPx), lPx = lmR.map(toRawPx);
const palmWraw = Math.hypot(lPx[5][0] - lPx[17][0], lPx[5][1] - lPx[17][1]) * 1.25; // knuckle span + edges
const wrist = lPx[0]; const tipY = Math.min(...oPx.map((p) => p[1])); const handLen = wrist[1] - tipY;
const mg = 0.10 * palmWraw;
let sx0 = Math.max(0, Math.min(...oPx.map((p) => p[0])) - mg), sx1 = Math.min(RW, Math.max(...oPx.map((p) => p[0])) + mg);
let sy0 = Math.max(0, tipY - mg), sy1 = Math.min(RH, wrist[1] + 0.29 * handLen);
const SUBraw = { left: Math.round(sx0), top: Math.round(sy0), width: Math.round(sx1 - sx0), height: Math.round(sy1 - sy0) };
const W = Math.min(P.W, SUBraw.width), H = Math.round(W * SUBraw.height / SUBraw.width), N = W * H, k = W / SUBraw.width; // raw px -> sub px
const toSub = ([x, y]) => [(x * RW - SUBraw.left) * k, (y * RH - SUBraw.top) * k];
const outline = outlineR.map(toSub), lm = lmR.map(toSub);
const palmW = palmWraw * k; const wristS = lm[0]; const handLenS = handLen * k;
log(slug, rawFile, 'rot', ROT, 'sub', SUBraw, '->', W, 'x', H, 'palmW', palmW.toFixed(0));

const subPng = WORK + 'sub.png';
{ const rm = await sharp(path.join(PH, 'raw', rawFile)).metadata();
  if (photo.original && (rm.width !== photo.original.width || rm.height !== photo.original.height)) throw new Error(`raw size ${rm.width}x${rm.height} != manifest original`);
  const cropped = await sharp(path.join(PH, 'raw', rawFile)).extract(crop).toBuffer();
  const rotated = ROT ? await sharp(cropped).rotate(ROT).toBuffer() : cropped;
  await sharp(rotated).extract(SUBraw).resize(W, H, { kernel: 'lanczos3' }).png().toFile(subPng); }
const { data: rgb } = await sharp(subPng).removeAlpha().raw().toBuffer({ resolveWithObject: true });

// ---------------------------------------------------------------- 1. matte: colour model trained from the scan outline
// fg seeds = deep inside the scan outline; bg seeds = well outside it (forearm corridor below the wrist excluded).
const outM = polyMask(outline, W, H);
const corridor = new Uint8Array(N); { const oBottom = Math.max(...outline.map((p) => p[1]));
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (y > Math.min(oBottom, wristS[1]) - 0.08 * handLenS && Math.abs(x - wristS[0]) < 0.75 * palmW) corridor[y * W + x] = 1; }
const roi = dilate(outM, W, H, (P.roi ?? 0.07) * palmW); for (let i = 0; i < N; i++) if (corridor[i]) roi[i] = 1;
const Q = 5, B = 1 << Q, bin = (i) => ((rgb[i * 3] >> (8 - Q)) << (2 * Q)) | ((rgb[i * 3 + 1] >> (8 - Q)) << Q) | (rgb[i * 3 + 2] >> (8 - Q));
function classify(fgSeed, bgSeed) {
  const hf = new Float32Array(B * B * B), hb = new Float32Array(B * B * B); let nf = 0, nb = 0;
  const binOf = (r, g, b) => ((r >> (8 - Q)) << (2 * Q)) | ((g >> (8 - Q)) << Q) | (b >> (8 - Q)); const SH = P.shadow === false ? [] : [0.5, 0.62, 0.75, 0.88];
  for (let i = 0; i < N; i++) { if (fgSeed[i]) { hf[bin(i)]++; nf++; } else if (bgSeed[i]) { hb[bin(i)]++; nb++;
    // cast shadows of the hand on the wall/table are darker copies of the background: teach the model them too
    for (const s of SH) hb[binOf(rgb[i * 3] * s, rgb[i * 3 + 1] * s, rgb[i * 3 + 2] * s)] += 0.5; } }
  nb *= 1 + 0.5 * SH.length;
  // light 3-D smoothing of the histograms (box 3x3x3) so unseen neighbouring colours are not 0/1
  const sm = (h) => { const o = new Float32Array(h.length); for (let r = 0; r < B; r++) for (let g = 0; g < B; g++) for (let b = 0; b < B; b++) { let s = 0;
    for (let dr = -1; dr <= 1; dr++) for (let dg = -1; dg <= 1; dg++) for (let db = -1; db <= 1; db++) { const R = r + dr, G = g + dg, Bb = b + db; if (R < 0 || G < 0 || Bb < 0 || R >= B || G >= B || Bb >= B) continue; s += h[(R << 2 * Q) | (G << Q) | Bb] * (dr || dg || db ? 0.5 : 1); }
    o[(r << 2 * Q) | (g << Q) | b] = s; } return o; };
  const sf = sm(hf), sb = sm(hb); const p = new Float32Array(N);
  for (let i = 0; i < N; i++) { const j = bin(i); const a = sf[j] / nf + 1e-7, c = sb[j] / nb + 1e-7; p[i] = roi[i] ? a / (a + c + (P.floor ?? 1e-5)) : 0; } // floor: colours seen in neither model count as background
  return p;
}
let fgSeed = erode(outM, W, H, 0.05 * palmW), bgSeed = new Uint8Array(N);
{ const far = dilate(outM, W, H, 0.10 * palmW); for (let i = 0; i < N; i++) bgSeed[i] = !far[i] && !corridor[i] ? 1 : 0; }
let prob = classify(fgSeed, bgSeed), mask;
for (let it = 0; it < 2; it++) { // refine: retrain from the first cut (tighter, real-edge seeds)
  const pb = blur(prob, W, H, 1.2 * W / 1600); const m = new Uint8Array(N); for (let i = 0; i < N; i++) m[i] = pb[i] > 0.5 ? 1 : 0;
  mask = largestComponent(m, W, H);
  fgSeed = erode(mask, W, H, 0.025 * palmW); const nearM = dilate(mask, W, H, 0.03 * palmW); for (let i = 0; i < N; i++) bgSeed[i] = !nearM[i] && !corridor[i] ? 1 : 0;
  // forearm corridor below the wrist: its own colours count as skin (it fades out anyway)
  prob = classify(fgSeed, bgSeed);
}
const pb = blur(prob, W, H, 1.0 * W / 1600);
let alpha = new Float32Array(N); for (let i = 0; i < N; i++) alpha[i] = smooth(0.30, 0.70, pb[i]);
// edge refinement: guided filter with the colour axis that best separates hand from background as the guide,
// so the matte edge snaps to the photo's real edge instead of the classifier's ragged one.
{ const mf = [0, 0, 0], mb = [0, 0, 0]; let nf = 0, nb = 0;
  for (let i = 0; i < N; i++) { if (fgSeed[i]) { for (let c = 0; c < 3; c++) mf[c] += rgb[i * 3 + c]; nf++; } else if (bgSeed[i]) { for (let c = 0; c < 3; c++) mb[c] += rgb[i * 3 + c]; nb++; } }
  const d = mf.map((v, c) => v / nf - mb[c] / nb); const dl = Math.hypot(...d) || 1;
  const G = new Float32Array(N); let gmn = Infinity, gmx = -Infinity;
  for (let i = 0; i < N; i++) { G[i] = (rgb[i * 3] * d[0] + rgb[i * 3 + 1] * d[1] + rgb[i * 3 + 2] * d[2]) / dl; gmn = Math.min(gmn, G[i]); gmx = Math.max(gmx, G[i]); }
  for (let i = 0; i < N; i++) G[i] = (G[i] - gmn) / (gmx - gmn);
  const q = guidedFilter(G, alpha, W, H, Math.max(2, Math.round(P.gr ?? 6 * W / 1600)), P.geps ?? 4e-4);
  for (let i = 0; i < N; i++) alpha[i] = smooth(P.c0 ?? 0.25, P.c1 ?? 0.95, q[i]); } // mild choke: soft photo edges carry background colour
{ const m = new Uint8Array(N); for (let i = 0; i < N; i++) m[i] = alpha[i] > 0.5 ? 1 : 0;
  const comp = largestComponent(m, W, H); const filled = fillHoles(comp, W, H);
  // keep small holes filled (moles, specks, dark creases); big enclosed holes are real gaps between touching fingers
  const lc = Uint8Array.from(comp), lab = new Uint8Array(N), minHole = 400 * (W / 1600) ** 2 * 3;
  for (let i = 0; i < N; i++) if (filled[i] && !comp[i] && !lab[i]) { const pix = [], st = [i]; lab[i] = 1;
    while (st.length) { const q = st.pop(); pix.push(q); const x = q % W; for (const r of [x > 0 ? q - 1 : -1, x < W - 1 ? q + 1 : -1, q - W, q + W]) if (r >= 0 && r < N && filled[r] && !comp[r] && !lab[r]) { lab[r] = 1; st.push(r); } }
    if (pix.length < minHole) for (const q of pix) lc[q] = 1; }
  const near = blur(Float32Array.from(lc), W, H, 3 * W / 1600);
  for (let i = 0; i < N; i++) { if (near[i] < 0.02) alpha[i] = 0; if (lc[i] && near[i] > 0.99) alpha[i] = 1; }
  mask = lc; }
log('matte done, coverage', (mask.reduce((a, b) => a + b, 0) / N).toFixed(3));

// ---------------------------------------------------------------- 2. albedo (edge colours decontaminated) + wrist fade
// wrist fade: starts just below the wrist landmark; if the matte ends earlier (forearm out of focus or out of frame), the fade
// is pulled up so the hand never ends in a hard cut-out edge.
let mBottom = 0; for (let y = H - 1; y >= 0 && !mBottom; y--) { let n = 0; for (let x = 0; x < W; x++) n += mask[y * W + x]; if (n > 0.25 * palmW) mBottom = y; }
let fadeV1 = Math.min(0.995, (wristS[1] + 0.26 * handLenS) / H, (mBottom - 0.01 * handLenS) / H);
const fadeV0 = Math.min((wristS[1] + 0.04 * handLenS) / H, fadeV1 - 0.18 * handLenS / H);
const fade = (v) => 1 - smooth(fadeV0, fadeV1, v);
const inner = new Float32Array(N); for (let i = 0; i < N; i++) inner[i] = alpha[i] > 0.97 ? 1 : 0;
const sg = 6 * W / 1600, wsum = blur(inner, W, H, sg);
const ch = [0, 1, 2].map((c) => { const a = new Float32Array(N); for (let i = 0; i < N; i++) a[i] = rgb[i * 3 + c] * inner[i]; return blur(a, W, H, sg); });
const alb = Buffer.alloc(N * 4);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; const a = alpha[i]; const t = smooth(0.80, 0.97, a);
  for (let c = 0; c < 3; c++) { const fill = wsum[i] > 1e-4 ? ch[c][i] / wsum[i] : rgb[i * 3 + c]; alb[i * 4 + c] = Math.round(rgb[i * 3 + c] * t + fill * (1 - t)); }
  alb[i * 4 + 3] = Math.round(255 * a * fade(y / H)); }
const albedoImg = () => sharp(alb, { raw: { width: W, height: H, channels: 4 } });
await albedoImg().webp({ quality: P.aq ?? 86, alphaQuality: 90, effort: 6 }).toFile(OUT + "palm-albedo.webp");
await albedoImg().resize(Math.min(1024, W)).webp({ quality: P.aq ?? 86, alphaQuality: 90, effort: 6 }).toFile(OUT + "palm-albedo-1024.webp");
await sharp({ create: { width: W, height: H, channels: 4, background: '#0B0A1F' } }).composite([{ input: alb, raw: { width: W, height: H, channels: 4 } }]).png().toBuffer().then((b) => sharp(b).resize(600).png().toFile(WORK + 'matte_prev.png'));
log('albedo done');

// ---------------------------------------------------------------- 3. depth: Poisson inflation of the matte + Depth Anything V2 (local)
const daKey = WORK + `da_${W}x${H}.f32`, daMeta = daKey.replace('.f32', '.json');
if (!fs.existsSync(daKey)) {
  const { pipeline, env, RawImage } = await import('@huggingface/transformers');
  env.cacheDir = path.join(HERE, '.cache/hf');
  const pipe = await pipeline('depth-estimation', 'onnx-community/depth-anything-v2-small', { dtype: 'fp32' });
  const buf = await sharp(subPng).resize(770).png().toBuffer();
  const out = await pipe(await RawImage.fromBlob(new Blob([buf])));
  const pd = out.predicted_depth; const [dh, dw] = pd.dims.slice(-2);
  fs.writeFileSync(daKey, Buffer.from(new Float32Array(pd.data).buffer)); fs.writeFileSync(daMeta, JSON.stringify({ w: dw, h: dh }));
  log('depth anything', dw, dh);
}
const S = 4, w = Math.round(W / S), h = Math.round(H / S);
const aW = resize(alpha, W, H, w, h); const m = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) m[i] = aW[i] > 0.5 ? 1 : 0;
const w2 = w >> 1, h2 = h >> 1; const a2 = resize(alpha, W, H, w2, h2); const m2 = new Uint8Array(w2 * h2); for (let i = 0; i < w2 * h2; i++) m2[i] = a2[i] > 0.5 ? 1 : 0;
let u = resize(poisson(m2, w2, h2, 1500), w2, h2, w, h).map((v) => v * 4); u = poisson(m, w, h, 400, u);
const K_DA = P.kda * palmW, HC = P.hc * palmW, K_CREASE = P.kc;
const inf = new Float32Array(w * h); for (let i = 0; i < w * h; i++) { const hi = Math.sqrt(Math.max(0, 2 * u[i])) * S; inf[i] = HC * Math.tanh(hi / HC); }
const dj = JSON.parse(fs.readFileSync(daMeta)); const da = resize(new Float32Array(fs.readFileSync(daKey).buffer.slice(0)), dj.w, dj.h, w, h);
const dist = edt(m, w, h); const core = new Float32Array(w * h); for (let i = 0; i < w * h; i++) core[i] = dist[i] > 6 * (W / 1600) ? 1 : 0;
const vals = []; for (let i = 0; i < w * h; i++) if (core[i]) vals.push(da[i]); vals.sort((a, b) => a - b);
const lo = vals[Math.floor(vals.length * 0.02)], hi = vals[Math.floor(vals.length * 0.98)];
const dn = new Float32Array(w * h); for (let i = 0; i < w * h; i++) dn[i] = Math.min(1.1, Math.max(-0.1, (da[i] - lo) / (hi - lo))) * core[i];
const bs = W / 1600, num = blur(dn, w, h, 10 * bs), den = blur(core, w, h, 10 * bs), num2 = blur(dn, w, h, 40 * bs), den2 = blur(core, w, h, 40 * bs);
const macro = new Float32Array(w * h);
for (let i = 0; i < w * h; i++) { const near = K_DA * (den[i] > 1e-3 ? num[i] / den[i] : 0), far = K_DA * (den2[i] > 1e-4 ? num2[i] / den2[i] : 0); const wt = Math.min(1, den[i] / 0.15); macro[i] = near * wt + far * (1 - wt) + inf[i]; }
const macroS = blur(macro, w, h, 1.0);
const MW = 257, MH = Math.round(257 * H / W) | 1; const md = resize(macroS, w, h, MW, MH), ma = resize(alpha, W, H, MW, MH);
let zmin = Infinity, zmax = -Infinity; for (const v of md) { zmin = Math.min(zmin, v); zmax = Math.max(zmax, v); }
const mb = Buffer.alloc(MW * MH * 4); for (let i = 0; i < MW * MH; i++) { const q = Math.round(65535 * (md[i] - zmin) / (zmax - zmin)); mb[i * 4] = q >> 8; mb[i * 4 + 1] = q & 255; mb[i * 4 + 2] = Math.round(255 * Math.min(1, ma[i] * 4)); mb[i * 4 + 3] = 255; }
await sharp(mb, { raw: { width: MW, height: MH, channels: 4 } }).png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(OUT + 'palm-depth.png');
{ const dp = Buffer.alloc(w * h); let mx = 0; for (const v of macroS) mx = Math.max(mx, v); for (let i = 0; i < w * h; i++) dp[i] = Math.round(255 * Math.max(0, macroS[i]) / mx * (aW[i] > 0.5 ? 1 : 0.3)); await sharp(dp, { raw: { width: w, height: h, channels: 1 } }).png().toFile(WORK + 'depth_prev.png'); }
log('depth done');

// ---------------------------------------------------------------- 4. object-space normal map: macro shape + real crease detail from the photo
const NW = Math.min(1200, W), NH = Math.round(NW * H / W), sc = W / NW, NWo = Math.min(1024, W); // computed at 1200, stored at 1024 (resampling tames sensor noise)
const Z = blur(resize(macroS, w, h, NW, NH), NW, NH, 2.5 * NW / 1200);
const L = new Float32Array(N); for (let i = 0; i < N; i++) L[i] = 0.3 * rgb[i * 3] + 0.59 * rgb[i * 3 + 1] + 0.11 * rgb[i * 3 + 2];
const Lb = blur(L, W, H, 5 * W / 1600); const hp = new Float32Array(N);
for (let i = 0; i < N; i++) hp[i] = Math.max(-35, Math.min(12, L[i] - Lb[i])) * (alpha[i] > 0.9 ? 1 : 0);
const hpN = resize(blur(hp, W, H, P.hpb ?? 1.0), W, H, NW, NH); for (let i = 0; i < NW * NH; i++) Z[i] += K_CREASE * hpN[i] * (1600 / W);
const nb = Buffer.alloc(NW * NH * 3);
for (let y = 0; y < NH; y++) for (let x = 0; x < NW; x++) { const i = y * NW + x;
  const zx = (Z[y * NW + Math.min(NW - 1, x + 1)] - Z[y * NW + Math.max(0, x - 1)]) / (2 * sc), zy = (Z[Math.min(NH - 1, y + 1) * NW + x] - Z[Math.max(0, y - 1) * NW + x]) / (2 * sc);
  let nx = -zx, ny = zy, nz = 1; const l = Math.hypot(nx, ny, nz); nb[i * 3] = Math.round((nx / l * 0.5 + 0.5) * 255); nb[i * 3 + 1] = Math.round((ny / l * 0.5 + 0.5) * 255); nb[i * 3 + 2] = Math.round((nz / l * 0.5 + 0.5) * 255); }
await sharp(nb, { raw: { width: NW, height: NH, channels: 3 } }).resize(NWo, null, { kernel: 'lanczos3' }).webp({ quality: P.nq ?? 86, effort: 6 }).toFile(OUT + 'palm-normal.webp');
// soft shadow (blurred matte)
{ const SW = 200, SH = Math.round(200 * H / W); const sh = blur(resize(alpha, W, H, SW, SH), SW, SH, 5); const sb = Buffer.alloc(SW * SH);
  for (let i = 0; i < SW * SH; i++) sb[i] = Math.round(255 * Math.min(1, sh[i] * 1.2) * fade(Math.floor(i / SW) / SH));
  await sharp(sb, { raw: { width: SW, height: SH, channels: 1 } }).toColourspace('srgb').png().toFile(OUT + 'palm-shadow.png'); }
log('normal + shadow done');

// ---------------------------------------------------------------- 5. lines: REAL scan polylines -> distance/progress atlas
const KEYS = ['heart', 'head', 'life', 'fate'];
function cr(pts, steps = 8) { const out = [];
  for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let s = 0; s < steps; s++) { const t = s / steps, t2 = t * t, t3 = t2 * t; const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3); out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]); } }
  out.push(pts[pts.length - 1]); return out; }
const smoothPts = (pts, it = 2) => { let p = pts; for (let n = 0; n < it; n++) p = p.map((q, i) => i === 0 || i === p.length - 1 ? q : [(p[i - 1][0] + 2 * q[0] + p[i + 1][0]) / 4, (p[i - 1][1] + 2 * q[1] + p[i + 1][1]) / 4]); return p; };
const lines = KEYS.map((key) => { const l = scan.lines[key]; if (!l || !l.present || !l.polyline || l.polyline.length < 2) return { key, absent: true };
  const d = cr(smoothPts(l.polyline.map(rot).map(toSub), 2)); const cum = [0]; for (let i = 1; i < d.length; i++) cum.push(cum[i - 1] + Math.hypot(d[i][0] - d[i - 1][0], d[i][1] - d[i - 1][1]));
  return { key, pts: d, cum, len: cum.at(-1) }; });
const live = lines.filter((l) => !l.absent);
const MAXD = Math.max(14, 24 * W / 1600), M = 40 * W / 1600;
let fx0 = 1e9, fy0 = 1e9, fx1 = -1e9, fy1 = -1e9; for (const l of live) for (const [x, y] of l.pts) { fx0 = Math.min(fx0, x); fy0 = Math.min(fy0, y); fx1 = Math.max(fx1, x); fy1 = Math.max(fy1, y); }
fx0 -= M; fy0 -= M; fx1 += M; fy1 += M;
const FW = 512, FH = Math.round(FW * (fy1 - fy0) / (fx1 - fx0)), tp = (fx1 - fx0) / FW;
const field = Buffer.alloc(FW * FH * 3 * 3);
for (let j = 0; j < FH; j++) for (let i = 0; i < FW; i++) { const px = fx0 + (i + 0.5) * tp, py = fy0 + (j + 0.5) * tp;
  lines.forEach((l, c) => { let dd = 255, pp = 255;
    if (!l.absent) { let best = 1e18, bp = 0; for (let s = 0; s < l.pts.length - 1; s++) { const [ax, ay] = l.pts[s], [bx, by] = l.pts[s + 1]; const vx = bx - ax, vy = by - ay; const L2 = vx * vx + vy * vy || 1; let t = ((px - ax) * vx + (py - ay) * vy) / L2; t = Math.max(0, Math.min(1, t)); const ex = ax + t * vx - px, ey = ay + t * vy - py; const e = ex * ex + ey * ey; if (e < best) { best = e; bp = (l.cum[s] + t * Math.sqrt(L2)) / l.len; } }
      dd = Math.round(255 * Math.min(1, Math.sqrt(best) / MAXD)); pp = dd >= 255 ? 0 : Math.round(255 * bp); } // progress only matters near the line; zero elsewhere compresses well
    // band 0 = distance heart/head/life, band 1 = progress heart/head/life, band 2 = R fate distance, G fate progress
    if (c < 3) { field[(j * FW + i) * 3 + c] = dd; field[((FH + j) * FW + i) * 3 + c] = pp; } else { const o = ((2 * FH + j) * FW + i) * 3; field[o] = dd; field[o + 1] = pp; field[o + 2] = 0; } }); }
await sharp(field, { raw: { width: FW, height: FH * 3, channels: 3 } }).png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(OUT + 'lines-field.png');
log('line field done', FW, FH);

// ---------------------------------------------------------------- 6. label anchors: computed beside each real line, on the palm, no overlaps
// Palm region = landmark palm polygon (wrist, thumb base, knuckles) grown 22% about its centre (the landmarks sit inside
// the real palm edge), cut at the knuckle line (no fingers) and above the wrist, intersected with the eroded matte.
let cx0 = W, cx1 = 0, cy0 = H, cy1 = 0; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (alb[(y * W + x) * 4 + 3] > 24) { if (x < cx0) cx0 = x; if (x > cx1) cx1 = x; if (y < cy0) cy0 = y; if (y > cy1) cy1 = y; }
const palmPoly0 = [0, 1, 2, 5, 9, 13, 17].map((i) => lm[i]);
const ppc = palmPoly0.reduce((a, p) => [a[0] + p[0] / 7, a[1] + p[1] / 7], [0, 0]);
const palmPoly = palmPoly0.map(([x, y]) => [ppc[0] + (x - ppc[0]) * 1.22, ppc[1] + (y - ppc[1]) * 1.22]);
const kn = (p) => { const [ax, ay] = lm[5], [bx, by] = lm[17]; const s = (q) => (bx - ax) * (q[1] - ay) - (by - ay) * (q[0] - ax); return Math.sign(s(p)) === Math.sign(s(wristS)); };
const mEr = edt(mask, W, H);
const onPalm = ([x, y]) => { const xi = Math.round(x), yi = Math.round(y); if (xi < 0 || yi < 0 || xi >= W || yi >= H) return false;
  return mEr[yi * W + xi] > 0.035 * palmW && kn([x, y]) && y < wristS[1] - 0.02 * handLenS; }; // palm = inside the hand matte, below the knuckle line, above the wrist
const inCore = (p) => pointInPoly(p, palmPoly); // preferred: inside the grown landmark palm polygon
const NAMES = { heart: 'Heart', head: 'Head', life: 'Life', fate: 'Fate' };
// label em-box height in image px: the larger of ~5.5% of palm width (viewer font = 4.5% of palm span) and the viewer's
// minimum font size (13 css px phone when the content fills 86% of a 390 px screen; 16 css px desktop when it fills ~800 px tall)
const lh = Math.max(0.055 * palmW, 13 * (cx1 - cx0) / 335, 16 * (cy1 - cy0) / 800);
const boxOf = (key, c) => { const bw = (NAMES[key].length * 0.5 + 0.3) * lh; return { x0: c[0] - bw / 2, x1: c[0] + bw / 2, y0: c[1] - lh / 2, y1: c[1] + lh / 2, w: bw }; };
const boxPts = (b) => { const o = []; for (let a = 0; a <= 4; a++) for (let c = 0; c <= 2; c++) o.push([b.x0 + (b.x1 - b.x0) * a / 4, b.y0 + (b.y1 - b.y0) * c / 2]); return o; };
const cands = {}; const rej = { palm: 0, line: 0 };
const rd = (q, b) => Math.hypot(Math.max(b.x0 - q[0], 0, q[0] - b.x1), Math.max(b.y0 - q[1], 0, q[1] - b.y1)); // point-to-box distance (0 inside)
for (const l of live) { const list = []; const bw = (NAMES[l.key].length * 0.5 + 0.3) * lh;
  const tryBox = (c, t, side, gap, penalty) => { const b = boxOf(l.key, c); const pts = boxPts(b);
    if (!pts.every(onPalm)) { rej.palm++; return; }
    let dOther = Infinity; for (const o of live) if (o !== l) for (const q of o.pts) dOther = Math.min(dOther, rd(q, b));
    let dOwn = Infinity; for (const q of l.pts) dOwn = Math.min(dOwn, rd(q, b));
    if (dOwn < 0.15 * lh || dOwn > 1.2 * lh || dOther < 0.1 * lh) { rej.line++; return; }
    const score = -Math.abs(t - 0.5) * 2 - gap + Math.min(dOther / lh, 1.5) * 1.2 - (dOther < 0.25 * lh ? 5 : 0) - (pts.every(inCore) ? 0 : 1.5) - penalty;
    list.push({ c, b, t, side, score, dOther }); };
  // beside the line (both sides, three distances) ...
  for (let t = 0.08; t <= 0.921; t += 0.04) { const s = t * l.len; let i = l.cum.findIndex((v) => v >= s); i = Math.max(1, i); const [ax, ay] = l.pts[i - 1], [bx, by] = l.pts[i];
    const tx = bx - ax, ty = by - ay, tl = Math.hypot(tx, ty) || 1; const nx = -ty / tl, ny = tx / tl; const f = (s - l.cum[i - 1]) / ((l.cum[i] - l.cum[i - 1]) || 1); const p = [ax + f * tx, ay + f * ty];
    const he = Math.abs(nx) * bw / 2 + Math.abs(ny) * lh / 2;
    for (const side of [1, -1]) for (const gap of [0.30, 0.55, 0.9]) tryBox([p[0] + side * nx * (he + gap * lh), p[1] + side * ny * (he + gap * lh)], t, side, gap, 0); }
  // ... or just past either end of the line (short lines squeezed between others, e.g. a fate line crossing the head line)
  for (const [e, q, t] of [[l.pts[0], l.pts[Math.min(6, l.pts.length - 1)], 0], [l.pts.at(-1), l.pts[Math.max(0, l.pts.length - 7)], 1]]) {
    const dx = e[0] - q[0], dy = e[1] - q[1], dl = Math.hypot(dx, dy) || 1, ux = dx / dl, uy = dy / dl; const he = Math.abs(ux) * bw / 2 + Math.abs(uy) * lh / 2;
    for (const gap of [0.25, 0.5]) tryBox([e[0] + ux * (he + gap * lh), e[1] + uy * (he + gap * lh)], t, 0, gap, 0.8); }
  cands[l.key] = list.sort((a, b) => b.score - a.score).slice(0, 14); } log("label candidates", JSON.stringify(Object.fromEntries(Object.entries(cands).map(([k, v]) => [k, v.length]))), JSON.stringify(rej));
const overlap = (a, b, pad) => !(a.x1 + pad < b.x0 || b.x1 + pad < a.x0 || a.y1 + pad < b.y0 || b.y1 + pad < a.y0);
const keysL = live.map((l) => l.key).filter((k) => cands[k].length); let best = null;
(function search(i, chosen, sc) { if (i === keysL.length) { if (!best || sc > best.sc) best = { sc, chosen: [...chosen] }; return; }
  for (const c of cands[keysL[i]]) { if (chosen.some((o) => o && overlap(o.b, c.b, 0.2 * lh))) continue; chosen.push(c); search(i + 1, chosen, sc + c.score); chosen.pop(); }
  chosen.push(null); search(i + 1, chosen, sc - 50); chosen.pop(); // dropping a label is the last resort
})(0, [], 0);
const labels = {}; const warnings = [];
if (best) best.chosen.forEach((c, i) => { if (!c) return; labels[keysL[i]] = { uv: [+(c.c[0] / W).toFixed(4), +(c.c[1] / H).toFixed(4)], align: 'center', t: +c.t.toFixed(2), side: c.side, clearOtherLinesPx: Math.round(c.dOther) }; });
for (const l of live) if (!labels[l.key]) warnings.push('no valid label spot for ' + l.key);
for (const k of Object.keys(labels)) if (labels[k].clearOtherLinesPx < 0.25 * lh) warnings.push(k + ' label sits close to another line');
log('labels', JSON.stringify(labels), warnings.join('; '));

// ---------------------------------------------------------------- 7. meta + lines.json
// content box (visible pixels after wrist fade), pivot (palm centre) and palm edges: the viewer frames the hand from these.
const pc = [0, 5, 9, 13, 17].map((i) => lm[i]).reduce((a, p) => [a[0] + p[0] / 5, a[1] + p[1] / 5], [0, 0]);
const pxs = palmPoly.map((p) => p[0]);
const meta = { W, H, worldW: 1.2, worldH: 1.2 * H / W, pxToWorld: 1.2 / W, zmin, zmax, meshW: MW, meshH: MH, normalW: NW, normalH: NH,
  params: { K_DA: +K_DA.toFixed(1), HC: +HC.toFixed(1), K_CREASE, kda: P.kda, hc: P.hc },
  frame: { content: { u0: +(cx0 / W).toFixed(4), u1: +(cx1 / W).toFixed(4), v0: +(cy0 / H).toFixed(4), v1: +(cy1 / H).toFixed(4) },
    pivot: { u: +(pc[0] / W).toFixed(4), v: +(pc[1] / H).toFixed(4) }, palmEdges: { uL: +((pc[0] - palmW / 2) / W).toFixed(4), uR: +((pc[0] + palmW / 2) / W).toFixed(4), v: +(pc[1] / H).toFixed(4), note: 'span = palm width; label em = labelBox.emOfPalmWidth of it' },
    wristFade: { v0: +fadeV0.toFixed(4), v1: +fadeV1.toFixed(4) }, handedness: scan.hand.handedness, rotatedDeg: ROT },
  source: { slug, photo: rawFile, crop, subCropOfRotatedCrop: SUBraw, scan: slug + '.scan.json', model: scan.model?.name } };
fs.writeFileSync(OUT + 'palm-meta.json', JSON.stringify(meta, null, 1));
const linesJson = { rect: { u0: fx0 / W, v0: fy0 / H, u1: fx1 / W, v1: fy1 / H }, maxDistPx: MAXD, texPx: tp, size: [FW, FH], bands: 'rows: [dist heart,head,life] [progress heart,head,life] [R fate dist, G fate progress]',
  lines: lines.map((l) => l.absent ? { key: l.key, absent: true } : { key: l.key, lengthPx: Math.round(l.len), start: [l.pts[0][0] / W, l.pts[0][1] / H], end: [l.pts.at(-1)[0] / W, l.pts.at(-1)[1] / H], mid: [l.pts[l.pts.length >> 1][0] / W, l.pts[l.pts.length >> 1][1] / H],
    uv: l.pts.filter((_, i) => i % 4 === 0 || i === l.pts.length - 1).map(([x, y]) => [+(x / W).toFixed(5), +(y / H).toFixed(5)]) }),
  labels, labelWarnings: warnings, labelBox: { emPx: Math.round(lh), emOfPalmWidth: +(lh / palmW).toFixed(3), note: 'anchors are box centres planned for label text whose em height on screen is at most emPx image px; align=center' },
  source: `${slug}.scan.json (${scan.model?.name || 'real scan'}), polylines mapped from the scan image to this crop; never hand-placed` };
fs.writeFileSync(OUT + 'lines.json', JSON.stringify(linesJson));
// QA overlay: matte + real lines + label boxes
{ let svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><polygon points="${palmPoly.map((p) => p.join(',')).join(' ')}" fill="none" stroke="#ffd400" stroke-width="${3 * bs}" stroke-dasharray="12 8"/>`;
  const C = { heart: '#ff2850', head: '#2f8bff', life: '#20d060', fate: '#b060ff' };
  for (const l of live) svg += `<polyline points="${l.pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="${C[l.key]}" stroke-width="${5 * bs}"/>`;
  if (best) best.chosen.forEach((c, i) => { if (!c) return; svg += `<rect x="${c.b.x0}" y="${c.b.y0}" width="${c.b.x1 - c.b.x0}" height="${c.b.y1 - c.b.y0}" fill="none" stroke="${C[keysL[i]]}" stroke-width="${4 * bs}"/>`; });
  svg += '</svg>';
  await sharp({ create: { width: W, height: H, channels: 4, background: '#0B0A1F' } }).composite([{ input: alb, raw: { width: W, height: H, channels: 4 } }, { input: Buffer.from(svg) }]).png().toBuffer().then((b) => sharp(b).resize(700).jpeg({ quality: 85 }).toFile(WORK + 'qa_overlay.jpg')); }
const sizes = Object.fromEntries(fs.readdirSync(OUT).map((f) => [f, fs.statSync(OUT + f).size]));
const desk = ['palm-albedo.webp', 'palm-normal.webp', 'palm-depth.png', 'palm-shadow.png', 'lines-field.png', 'palm-meta.json', 'lines.json'].reduce((a, f) => a + (sizes[f] || 0), 0);
const phone = desk - (sizes['palm-albedo.webp'] || 0) + (sizes['palm-albedo-1024.webp'] || 0);
fs.writeFileSync(WORK + 'sizes.json', JSON.stringify({ sizes, desktopBytes: desk, phoneBytes: phone }, null, 1));
log('done', OUT, 'desktop', (desk / 1024).toFixed(0) + 'KB', 'phone', (phone / 1024).toFixed(0) + 'KB');
