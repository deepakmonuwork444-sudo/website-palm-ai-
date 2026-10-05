// small image-processing helpers (float arrays, single channel)
export function blur(src, w, h, sigma) {
  if (sigma <= 0) return Float32Array.from(src);
  const r = Math.ceil(sigma * 3), k = new Float32Array(2 * r + 1); let s = 0;
  for (let i = -r; i <= r; i++) { k[i + r] = Math.exp(-(i * i) / (2 * sigma * sigma)); s += k[i + r]; }
  for (let i = 0; i < k.length; i++) k[i] /= s;
  const tmp = new Float32Array(w * h), out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let a = 0; for (let i = -r; i <= r; i++) { const xx = Math.min(w - 1, Math.max(0, x + i)); a += src[y * w + xx] * k[i + r]; } tmp[y * w + x] = a; }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let a = 0; for (let i = -r; i <= r; i++) { const yy = Math.min(h - 1, Math.max(0, y + i)); a += tmp[yy * w + x] * k[i + r]; } out[y * w + x] = a; }
  return out;
}
export function resize(src, w, h, W, H) { // bilinear
  const out = new Float32Array(W * H);
  for (let y = 0; y < H; y++) { const fy = Math.min(h - 1, Math.max(0, (y + 0.5) * h / H - 0.5)); const y0 = Math.floor(fy), y1 = Math.min(h - 1, y0 + 1), ty = fy - y0;
    for (let x = 0; x < W; x++) { const fx = Math.min(w - 1, Math.max(0, (x + 0.5) * w / W - 0.5)); const x0 = Math.floor(fx), x1 = Math.min(w - 1, x0 + 1), tx = fx - x0;
      out[y * W + x] = (src[y0 * w + x0] * (1 - tx) + src[y0 * w + x1] * tx) * (1 - ty) + (src[y1 * w + x0] * (1 - tx) + src[y1 * w + x1] * tx) * ty; } }
  return out;
}
function edt1d(f, n, d, v, z) { let k = 0; v[0] = 0; z[0] = -1e20; z[1] = 1e20;
  for (let q = 1; q < n; q++) { let s; while (true) { const p = v[k]; s = ((f[q] + q * q) - (f[p] + p * p)) / (2 * q - 2 * p); if (s <= z[k]) { k--; if (k < 0) { k = 0; break; } } else break; } k++; v[k] = q; z[k] = s; z[k + 1] = 1e20; }
  k = 0; for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; const p = v[k]; d[q] = (q - p) * (q - p) + f[p]; } }
export function edt(mask, w, h) { // distance (px) from each inside pixel to nearest outside pixel
  const INF = 1e20, g = new Float32Array(w * h); for (let i = 0; i < w * h; i++) g[i] = mask[i] ? INF : 0;
  const n = Math.max(w, h), f = new Float32Array(n), d = new Float32Array(n), v = new Int32Array(n), z = new Float32Array(n + 1);
  for (let x = 0; x < w; x++) { for (let y = 0; y < h; y++) f[y] = g[y * w + x]; edt1d(f, h, d, v, z); for (let y = 0; y < h; y++) g[y * w + x] = d[y]; }
  for (let y = 0; y < h; y++) { for (let x = 0; x < w; x++) f[x] = g[y * w + x]; edt1d(f, w, d, v, z); for (let x = 0; x < w; x++) g[y * w + x] = Math.sqrt(d[x]); }
  return g;
}
export function largestComponent(mask, w, h) {
  const lab = new Int32Array(w * h), sizes = [0]; let cur = 0; const st = [];
  for (let i = 0; i < w * h; i++) if (mask[i] && !lab[i]) { cur++; let n = 0; st.push(i); lab[i] = cur;
    while (st.length) { const p = st.pop(); n++; const x = p % w, y = (p / w) | 0;
      for (const q of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, y > 0 ? p - w : -1, y < h - 1 ? p + w : -1]) if (q >= 0 && mask[q] && !lab[q]) { lab[q] = cur; st.push(q); } }
    sizes.push(n); }
  let best = 1; for (let i = 1; i < sizes.length; i++) if (sizes[i] > sizes[best]) best = i;
  const out = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) out[i] = lab[i] === best ? 1 : 0; return out;
}
export function fillHoles(mask, w, h) { const inv = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) inv[i] = mask[i] ? 0 : 1;
  // flood from border
  const seen = new Uint8Array(w * h), st = [];
  for (let x = 0; x < w; x++) { st.push(x, (h - 1) * w + x); } for (let y = 0; y < h; y++) { st.push(y * w, y * w + w - 1); }
  while (st.length) { const p = st.pop(); if (seen[p] || !inv[p]) continue; seen[p] = 1; const x = p % w, y = (p / w) | 0; if (x > 0) st.push(p - 1); if (x < w - 1) st.push(p + 1); if (y > 0) st.push(p - w); if (y < h - 1) st.push(p + w); }
  const out = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) out[i] = seen[i] ? 0 : 1; return out; }
export function poisson(mask, w, h, iters, init) { // solve lap u = -1 inside, u=0 outside (Gauss-Seidel SOR)
  const u = init ? Float32Array.from(init) : new Float32Array(w * h); const om = 1.9;
  for (let it = 0; it < iters; it++) for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) { const i = y * w + x; if (!mask[i]) { u[i] = 0; continue; }
    const nu = (u[i - 1] + u[i + 1] + u[i - w] + u[i + w] + 1) / 4; u[i] += om * (nu - u[i]); }
  return u;
}
export const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// ---------- added for the reusable pipeline
// rasterise a polygon (points in px) into a 0/1 mask (even-odd scanline fill)
export function polyMask(poly, w, h) {
  const m = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) { const yc = y + 0.5; const xs = [];
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > yc) !== (yj > yc)) xs.push(xi + (yc - yi) * (xj - xi) / (yj - yi)); }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) { const a = Math.max(0, Math.ceil(xs[k] - 0.5)), b = Math.min(w - 1, Math.floor(xs[k + 1] - 0.5)); for (let x = a; x <= b; x++) m[y * w + x] = 1; } }
  return m;
}
export const invert = (m) => { const o = new Uint8Array(m.length); for (let i = 0; i < m.length; i++) o[i] = m[i] ? 0 : 1; return o; };
// signed-ish helpers built on edt: erode/dilate a binary mask by r px
export function erode(m, w, h, r) { const d = edt(m, w, h); const o = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) o[i] = d[i] > r ? 1 : 0; return o; }
export function dilate(m, w, h, r) { const d = edt(invert(m), w, h); const o = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) o[i] = d[i] > r ? 0 : 1; return o; }
export function pointInPoly([x, y], poly) { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < xi + (y - yi) * (xj - xi) / (yj - yi)) c = !c; } return c; }
export function distToPolyline([px, py], pts) { let best = Infinity; for (let s = 0; s < pts.length - 1; s++) { const [ax, ay] = pts[s], [bx, by] = pts[s + 1]; const vx = bx - ax, vy = by - ay; const L2 = vx * vx + vy * vy || 1; let t = ((px - ax) * vx + (py - ay) * vy) / L2; t = Math.max(0, Math.min(1, t)); best = Math.min(best, Math.hypot(ax + t * vx - px, ay + t * vy - py)); } return best; }
// box mean filter of radius r (integral image)
export function boxMean(src, w, h, r) {
  const I = new Float64Array((w + 1) * (h + 1));
  for (let y = 0; y < h; y++) { let row = 0; for (let x = 0; x < w; x++) { row += src[y * w + x]; I[(y + 1) * (w + 1) + x + 1] = I[y * (w + 1) + x + 1] + row; } }
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) { const y0 = Math.max(0, y - r), y1 = Math.min(h, y + r + 1);
    for (let x = 0; x < w; x++) { const x0 = Math.max(0, x - r), x1 = Math.min(w, x + r + 1);
      out[y * w + x] = (I[y1 * (w + 1) + x1] - I[y0 * (w + 1) + x1] - I[y1 * (w + 1) + x0] + I[y0 * (w + 1) + x0]) / ((y1 - y0) * (x1 - x0)); } }
  return out;
}
// He et al. guided filter (grey guide): edge-aware refinement of a rough matte so its edge follows the photo's real edge
export function guidedFilter(I, p, w, h, r, eps) {
  const n = w * h, mI = boxMean(I, w, h, r), mp = boxMean(p, w, h, r);
  const Ip = new Float32Array(n), II = new Float32Array(n); for (let i = 0; i < n; i++) { Ip[i] = I[i] * p[i]; II[i] = I[i] * I[i]; }
  const mIp = boxMean(Ip, w, h, r), mII = boxMean(II, w, h, r); const a = new Float32Array(n), b = new Float32Array(n);
  for (let i = 0; i < n; i++) { const cov = mIp[i] - mI[i] * mp[i], v = mII[i] - mI[i] * mI[i]; a[i] = cov / (v + eps); b[i] = mp[i] - a[i] * mI[i]; }
  const ma = boxMean(a, w, h, r), mb = boxMean(b, w, h, r); const q = new Float32Array(n); for (let i = 0; i < n; i++) q[i] = Math.min(1, Math.max(0, ma[i] * I[i] + mb[i])); return q;
}
