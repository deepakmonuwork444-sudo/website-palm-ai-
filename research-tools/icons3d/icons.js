// PalmSays 3D icon set (owner-approved style, 2026-10-04): one material system (satin brushed gold + ivory enamel),
// one camera and light rig, soft contact shadow, jewellery-grade and minimal. No glow, no gloss-toy look.
// Loaded by render.html in headless Chromium; render.mjs saves the 512 px PNGs and exports the site sizes.
// Every ivory surface sits on a thin gold rim or bezel so it stays readable on light backgrounds.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const SIZE = 512;
const canvas = document.createElement('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(SIZE * 2, SIZE * 2, false); // 2x supersample, downscaled on export
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.setClearColor(0, 0);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;

const scene = new THREE.Scene();
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.02).texture;
scene.environmentIntensity = 1.35;
const camera = new THREE.PerspectiveCamera(22, 1, 0.1, 50);
camera.position.set(0, 0.9, 6.2); camera.lookAt(0, -0.05, 0);
const key = new THREE.DirectionalLight('#fff4e6', 2.0); key.position.set(-0.9, 5.0, 2.2); key.castShadow = true;
key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 18; key.shadow.blurSamples = 25;
Object.assign(key.shadow.camera, { left: -2, right: 2, top: 2, bottom: -2, near: 0.5, far: 12 }); key.shadow.bias = -0.0004;
scene.add(key);
const front = new THREE.DirectionalLight('#fff0dc', 0.9); front.position.set(0.5, 1.2, 5); scene.add(front);
const rim = new THREE.DirectionalLight('#ffe2b0', 1.2); rim.position.set(3, 1.5, -2.5); scene.add(rim);
scene.add(new THREE.HemisphereLight('#f2ecff', '#3a2c20', 0.35));
const ground = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.ShadowMaterial({ opacity: 0.28, color: 0x0a0618 }));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

// ---- one material system: satin brushed gold + ivory enamel
const GOLD = new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#e3b25e'), metalness: 1, roughness: 0.34, anisotropy: 0.5, anisotropyRotation: Math.PI / 2, clearcoat: 0.0 });
const GOLD_DK = GOLD.clone(); GOLD_DK.roughness = 0.4; GOLD_DK.color = new THREE.Color('#c99a46');
/** Deep gold for fine lines laid on ivory (palm lines), so they read at 48 px. */
const GOLD_DEEP = GOLD.clone(); GOLD_DEEP.roughness = 0.42; GOLD_DEEP.color = new THREE.Color('#a5732a'); GOLD_DEEP.envMapIntensity = 0.85;
// Ivory: a touch deeper than the first sample with less environment light, so its form shading reads on light pages too.
const IVORY = new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#e5cfa8'), roughness: 0.46, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.32, sheen: 0.2, sheenColor: new THREE.Color('#fff6e8'), envMapIntensity: 0.7 });

// ---- helpers
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const ext = (shape, depth, bevel = 0.04, mat = GOLD) => { const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.85, bevelSegments: 6, curveSegments: 48 }); g.translate(0, 0, -depth / 2); return new THREE.Mesh(g, mat); };
/** Extrude with separate bevel thickness and outward size (a gold plate with bs > 0 makes a rim around the same ivory shape). */
const plate = (shape, depth, bt, bs, mat) => { const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bt, bevelSize: bs, bevelSegments: 5, curveSegments: 40 }); g.translate(0, 0, -depth / 2); return new THREE.Mesh(g, mat); };
const box = (w, h, d, r, mat) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 5, r), mat);
const sphere = (r, mat) => new THREE.Mesh(new THREE.SphereGeometry(r, 48, 24), mat);
const at = (mesh, x = 0, y = 0, z = 0) => { mesh.position.set(x, y, z); return mesh; };
/** A gold line: a tube with round caps (no open ends). */
function line(pts, r = 0.03, mat = GOLD) {
  const g = new THREE.Group(); const v = pts.map((p) => V(...p));
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(v), 128, r, 16, false), mat));
  for (const p of [v[0], v[v.length - 1]]) g.add(at(sphere(r, mat), p.x, p.y, p.z));
  return g;
}
function roundRectShape(w, h, r, cx = 0, cy = 0) { const s = new THREE.Shape(); const x = cx - w / 2, y = cy - h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; }
const circleShape = (r, cx = 0, cy = 0) => { const s = new THREE.Shape(); s.absarc(cx, cy, r, 0, Math.PI * 2, false); return s; };
function starShape(ro, ri, n = 5) { const s = new THREE.Shape(); for (let i = 0; i <= n * 2; i++) { const a = Math.PI / 2 + (i * Math.PI) / n; const r = i % 2 ? ri : ro; const x = Math.cos(a) * r, y = Math.sin(a) * r; i ? s.lineTo(x, y) : s.moveTo(x, y); } return s; }
function heartShape(k = 1, dy = 0) { const s = new THREE.Shape(); const P = (x, y) => [x * k, y * k + dy];
  s.moveTo(...P(0, -1)); s.bezierCurveTo(...P(-0.55, -0.55), ...P(-1.05, -0.1), ...P(-1.05, 0.35)); s.bezierCurveTo(...P(-1.05, 0.8), ...P(-0.72, 1.02), ...P(-0.5, 1.02));
  s.bezierCurveTo(...P(-0.25, 1.02), ...P(-0.05, 0.88), ...P(0, 0.62)); s.bezierCurveTo(...P(0.05, 0.88), ...P(0.25, 1.02), ...P(0.5, 1.02));
  s.bezierCurveTo(...P(0.72, 1.02), ...P(1.05, 0.8), ...P(1.05, 0.35)); s.bezierCurveTo(...P(1.05, -0.1), ...P(0.55, -0.55), ...P(0, -1)); return s; }
/** The approved open right palm (thumb on the right), as seen. */
function handShape(S = 0.95, dx = 0, dy = -0.05) {
  const h = new THREE.Shape(); const P = (x, y) => [x * S + dx, y * S + dy];
  h.moveTo(...P(-0.36, -0.78)); h.lineTo(...P(-0.44, -0.2)); h.lineTo(...P(-0.5, 0.12)); h.lineTo(...P(-0.5, 0.36));
  h.absarc(...P(-0.405, 0.36), 0.095 * S, Math.PI, 0, true); h.lineTo(...P(-0.3, 0.18)); h.lineTo(...P(-0.285, 0.15)); h.lineTo(...P(-0.27, 0.18)); h.lineTo(...P(-0.27, 0.6));
  h.absarc(...P(-0.16, 0.6), 0.1 * S, Math.PI, 0, true); h.lineTo(...P(-0.06, 0.22)); h.lineTo(...P(-0.035, 0.19)); h.lineTo(...P(-0.01, 0.22)); h.lineTo(...P(-0.02, 0.7));
  h.absarc(...P(0.09, 0.7), 0.1 * S, Math.PI, 0, true); h.lineTo(...P(0.19, 0.22)); h.lineTo(...P(0.215, 0.19)); h.lineTo(...P(0.24, 0.22)); h.lineTo(...P(0.23, 0.58));
  h.absarc(...P(0.335, 0.58), 0.095 * S, Math.PI, 0, true); h.lineTo(...P(0.44, -0.02)); h.lineTo(...P(0.66, 0.22));
  h.absarc(...P(0.735, 0.15), 0.1 * S, (3 * Math.PI) / 4, -Math.PI / 4, true); h.lineTo(...P(0.56, -0.38)); h.lineTo(...P(0.36, -0.78)); h.closePath();
  return h;
}
/** The approved ivory hand inlay (depth 0.08, fine bevel). */
const ivoryHand = (S = 0.95, dx = 0, dy = -0.05) => new THREE.Mesh(new THREE.ExtrudeGeometry(handShape(S, dx, dy), { depth: 0.08, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.006, bevelSegments: 5, curveSegments: 40 }), IVORY);
/** A free-standing ivory hand on a thin gold backing that shows as a fine gold outline. */
function rimmedHand(S, mat = IVORY) { const g = new THREE.Group(); const sh = handShape(S, 0, 0);
  g.add(at(plate(sh, 0.06, 0.03, 0.06, GOLD), 0, 0, -0.03));
  if (mat) g.add(at(plate(sh, 0.06, 0.03, 0.004, mat), 0, 0, 0.04)); return g; }
/** Gold coin + rim, the approved medallion base. */
function coin(r = 1.15, face = null) { const g = new THREE.Group();
  const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.14, 160, 1), GOLD_DK); c.rotation.x = Math.PI / 2; g.add(c);
  g.add(at(new THREE.Mesh(new THREE.TorusGeometry(r, 0.06, 24, 200), GOLD), 0, 0, 0.04));
  if (face) { const f = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.07, r - 0.07, 0.06, 160, 1), face); f.rotation.x = Math.PI / 2; f.position.z = 0.06; g.add(f); }
  return g; }
const Z_LINE = 0.19;
const L = (pts) => pts.map(([x, y]) => [x, y, Z_LINE]);
const LINES = {
  heart: L([[-0.44, -0.07], [-0.2, -0.07], [0.05, -0.02], [0.24, 0.08]]),
  head: L([[0.37, -0.15], [0.12, -0.22], [-0.14, -0.3], [-0.34, -0.39]]),
  life: L([[0.37, -0.15], [0.21, -0.29], [0.14, -0.49], [0.18, -0.72]]),
  fate: L([[0.02, -0.73], [0.0, -0.42], [-0.03, -0.1], [-0.04, 0.1]]),
  sun: L([[-0.11, -0.5], [-0.14, -0.2], [-0.15, 0.1]]),
  mercury: L([[0.1, -0.68], [-0.07, -0.42], [-0.24, -0.14], [-0.33, 0.06]]),
  // two short marriage lines on the edge of the palm, between the heart line and the little finger
  marriage1: L([[-0.47, 0.06], [-0.37, 0.075], [-0.26, 0.06]]),
  marriage2: L([[-0.47, -0.02], [-0.39, -0.01], [-0.31, -0.02]]),
};
/** The approved palm medallion. Line icons use a larger, centred hand (S, dx) so the gold line reads at 48 px. */
function palmMedallion(lines, r, mat = GOLD, S = 0.95, dx = 0) { const g = coin(); g.add(at(ivoryHand(S, dx, -0.05), 0, 0, 0.07)); const k = S / 0.95;
  for (const n of lines) g.add(line(LINES[n].map(([x, y, z]) => [x * k + dx, (y + 0.05) * k - 0.05, z]), r, mat)); g.rotation.y = -0.38; return g; }
const lineIcon = (names, r = 0.06) => palmMedallion(names, r, GOLD_DEEP, 1.07, -0.1);

export const BUILD = {
  // ---------- the six approved icons (gift and scan gain a fine gold rim for light backgrounds)
  gift() { const g = new THREE.Group();
    g.add(at(box(1.5, 1.15, 1.5, 0.07, IVORY), 0, -0.18));
    g.add(at(box(1.64, 0.32, 1.64, 0.07, IVORY), 0, 0.52));
    g.add(at(box(1.67, 0.05, 1.67, 0.02, GOLD), 0, 0.37)); // lid piping
    g.add(at(box(1.54, 0.05, 1.54, 0.02, GOLD), 0, -0.73)); // base piping
    g.add(box(0.24, 1.52, 1.68, 0.03, GOLD)); g.add(box(1.68, 1.52, 0.24, 0.03, GOLD));
    for (const s of [-1, 1]) { const loop = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.065, 20, 64), GOLD); loop.scale.set(1.2, 0.62, 1); loop.position.set(s * 0.28, 0.8, 0); loop.rotation.set(-0.9, 0, s * -0.35); g.add(loop); }
    g.add(at(sphere(0.11, GOLD), 0, 0.76)); g.rotation.y = -0.6; return g; },
  crown() { const g = new THREE.Group(); const s = new THREE.Shape();
    s.moveTo(-1, -0.6); s.lineTo(1, -0.6); s.lineTo(1.08, 0.55); s.lineTo(0.55, 0.05); s.lineTo(0, 0.75); s.lineTo(-0.55, 0.05); s.lineTo(-1.08, 0.55); s.closePath();
    g.add(ext(s, 0.22, 0.05)); g.add(at(box(2.1, 0.26, 0.36, 0.06, GOLD_DK), 0, -0.5));
    for (const [x, y] of [[-1.08, 0.62], [0, 0.84], [1.08, 0.62]]) g.add(at(sphere(0.13, IVORY), x, y, 0.02));
    const gem = sphere(0.15, IVORY); gem.scale.z = 0.55; g.add(at(gem, 0, -0.12, 0.17));
    for (const x of [-0.6, 0.6]) g.add(at(sphere(0.07, IVORY), x, -0.5, 0.19));
    g.rotation.y = -0.38; g.rotation.x = 0.05; return g; },
  bolt() { const g = new THREE.Group(); const s = new THREE.Shape();
    s.moveTo(0.28, 1.05); s.lineTo(-0.62, -0.08); s.lineTo(-0.06, -0.08); s.lineTo(-0.3, -1.05); s.lineTo(0.66, 0.14); s.lineTo(0.08, 0.14); s.closePath(); g.add(ext(s, 0.26, 0.06));
    const inner = new THREE.Shape(); inner.moveTo(0.16, 0.66); inner.lineTo(-0.38, -0.0); inner.lineTo(0.06, -0.0); inner.lineTo(-0.12, -0.62); inner.lineTo(0.42, 0.06); inner.lineTo(-0.02, 0.06); inner.closePath();
    g.add(at(ext(inner, 0.08, 0.02, IVORY), 0, 0, 0.18)); g.rotation.y = -0.42; return g; },
  palm() { return palmMedallion(['heart'], 0.026); },
  scan() { const g = new THREE.Group();
    g.add(at(ext(roundRectShape(1.38, 1.38, 0.34), 0.1, 0.03, GOLD_DK), 0, 0, -0.1)); // gold bezel
    g.add(at(ext(roundRectShape(1.3, 1.3, 0.3), 0.16, 0.05, IVORY), 0, 0, -0.06));
    const Ls = new THREE.Shape(); Ls.moveTo(0, 0); Ls.lineTo(0.55, 0); Ls.lineTo(0.55, 0.1); Ls.lineTo(0.1, 0.1); Ls.lineTo(0.1, 0.55); Ls.lineTo(0, 0.55); Ls.closePath();
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const m = ext(Ls, 0.2, 0.035); m.scale.set(-sx, -sy, 1); m.position.set(sx * 0.95, sy * 0.95, 0.05); g.add(m); }
    g.add(at(box(1.7, 0.08, 0.1, 0.035, GOLD), 0, 0.12, 0.16)); g.rotation.y = -0.4; return g; },
  shield() { const g = new THREE.Group(); const sh = (w, h) => { const s = new THREE.Shape(); s.moveTo(0, h); s.bezierCurveTo(w * 0.45, h * 0.86, w * 0.8, h * 0.92, w, h * 0.82); s.bezierCurveTo(w * 1.0, -h * 0.1, w * 0.55, -h * 0.75, 0, -h); s.bezierCurveTo(-w * 0.55, -h * 0.75, -w * 1.0, -h * 0.1, -w, h * 0.82); s.bezierCurveTo(-w * 0.8, h * 0.92, -w * 0.45, h * 0.86, 0, h); return s; };
    g.add(ext(sh(0.9, 1.05), 0.24, 0.06)); g.add(at(ext(sh(0.7, 0.84), 0.06, 0.02, IVORY), 0, -0.02, 0.17));
    g.add(line([[-0.3, 0.0, 0.25], [-0.08, -0.22, 0.25], [0.34, 0.26, 0.25]], 0.055)); g.rotation.y = -0.4; return g; },

  // ---------- palm lines: the approved medallion with that line in gold
  'heart-line'() { return lineIcon(['heart']); },
  'head-line'() { return lineIcon(['head']); },
  'life-line'() { return lineIcon(['life']); },
  'fate-line'() { return lineIcon(['fate']); },
  'sun-line'() { return lineIcon(['sun']); },
  'mercury-line'() { return lineIcon(['mercury']); },
  'marriage-line'() { return lineIcon(['marriage1', 'marriage2'], 0.055); },
  'all-lines'() { return lineIcon(['heart', 'head', 'life', 'fate'], 0.045); },

  // ---------- home reveals
  love() { const g = new THREE.Group(); g.add(ext(heartShape(0.95), 0.26, 0.07)); g.add(at(ext(heartShape(0.64, 0.05), 0.08, 0.025, IVORY), 0, 0, 0.19)); g.rotation.y = -0.4; return g; },
  personality() { const g = coin(); const R = 1.0; const a1 = -Math.PI + 0.62, a2 = -0.62; const s = new THREE.Shape();
    s.moveTo(Math.cos(a1) * R, Math.sin(a1) * R); s.bezierCurveTo(-0.82, -0.15, -0.45, -0.05, 0, -0.05); s.bezierCurveTo(0.45, -0.05, 0.82, -0.15, Math.cos(a2) * R, Math.sin(a2) * R);
    s.absarc(0, 0, R, a2, a1, true);
    g.add(at(plate(s, 0.08, 0.03, 0.006, IVORY), 0, 0, 0.07));
    const head = sphere(0.33, IVORY); head.scale.z = 0.45; g.add(at(head, 0, 0.36, 0.15));
    g.rotation.y = -0.38; return g; },
  career() { const g = new THREE.Group();
    g.add(at(box(2.0, 1.32, 0.72, 0.13, GOLD), 0, -0.1));
    g.add(at(box(2.04, 0.14, 0.76, 0.05, IVORY), 0, 0.2));
    g.add(at(box(0.4, 0.34, 0.14, 0.06, GOLD_DK), 0, 0.2, 0.38)); g.add(at(box(0.16, 0.1, 0.06, 0.03, IVORY), 0, 0.2, 0.46));
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.075, 20, 64, Math.PI), GOLD_DK); g.add(at(handle, 0, 0.6));
    g.rotation.y = -0.45; return g; },
  direction() { const g = coin(1.15, IVORY);
    const n = new THREE.Shape(); n.moveTo(0, 0.82); n.lineTo(0.19, 0); n.lineTo(0, -0.82); n.lineTo(-0.19, 0); n.closePath();
    const needle = ext(n, 0.06, 0.03, GOLD); needle.rotation.z = -0.62; g.add(at(needle, 0, 0, 0.16));
    const half = new THREE.Shape(); half.moveTo(0, -0.82); half.lineTo(0.19, 0); half.lineTo(-0.19, 0); half.closePath();
    const dk = ext(half, 0.07, 0.03, GOLD_DK); dk.rotation.z = -0.62; g.add(at(dk, 0, 0, 0.17));
    g.add(at(sphere(0.1, GOLD), 0, 0, 0.24));
    for (let i = 0; i < 4; i++) { const a = (i * Math.PI) / 2; const t = box(0.07, 0.17, 0.06, 0.02, GOLD); t.rotation.z = a; g.add(at(t, Math.sin(a) * 0.9, Math.cos(a) * 0.9, 0.11)); }
    g.rotation.y = -0.38; return g; },

  // ---------- tools
  'hand-shape'() { const g = new THREE.Group();
    g.add(ext(roundRectShape(2.1, 2.1, 0.46), 0.14, 0.05, GOLD_DK));
    g.add(at(new THREE.Mesh(new THREE.ExtrudeGeometry(roundRectShape(1.92, 1.92, 0.38), { depth: 0.02, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.02, bevelSegments: 4 }), GOLD), 0, 0, 0.06));
    g.add(at(ivoryHand(1.05, -0.06, -0.08), 0, 0, 0.1)); g.rotation.y = -0.4; return g; },
  // an ivory hand in a gold outline with a gold ring on each finger (the finger reader measures each finger)
  fingers() { const S = 1.1; const g = rimmedHand(S);
    for (const [x, y] of [[-0.405, 0.24], [-0.16, 0.36], [0.09, 0.4], [0.335, 0.34]]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.118 * S, 0.034 * S, 20, 64), GOLD); ring.rotation.x = 1.3; g.add(at(ring, x * S, y * S, 0.005)); }
    g.rotation.y = -0.4; return g; },
  'compare-hands'() { const g = new THREE.Group();
    g.add(ext(roundRectShape(2.9, 2.0, 0.5), 0.14, 0.05, GOLD_DK));
    g.add(at(new THREE.Mesh(new THREE.ExtrudeGeometry(roundRectShape(2.72, 1.82, 0.42), { depth: 0.02, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.02, bevelSegments: 4 }), GOLD), 0, 0, 0.06));
    const a = ivoryHand(0.9, 0.1, -0.05); a.scale.x = -1; g.add(at(a, -0.6, 0, 0.1)); g.add(at(ivoryHand(0.9, 0.1, -0.05), 0.5, 0, 0.1));
    g.add(at(box(0.08, 1.5, 0.08, 0.035, GOLD), -0.05, 0, 0.14)); g.rotation.y = -0.38; return g; },
  'photo-check'() { const g = new THREE.Group();
    g.add(at(box(2.0, 1.34, 0.62, 0.16, IVORY), 0, -0.1)); g.add(at(box(2.03, 0.08, 0.65, 0.03, GOLD), 0, -0.73));
    g.add(at(box(0.62, 0.26, 0.5, 0.08, GOLD), -0.4, 0.66)); g.add(at(box(2.03, 0.42, 0.65, 0.14, GOLD_DK), 0, 0.38));
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.52, 0.3, 96), GOLD); lens.rotation.x = Math.PI / 2; g.add(at(lens, 0, -0.1, 0.36));
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.06, 96), GOLD_DK); glass.rotation.x = Math.PI / 2; g.add(at(glass, 0, -0.1, 0.5));
    g.add(at(sphere(0.07, IVORY), -0.1, 0.0, 0.53));
    const badge = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.12, 96), GOLD); badge.rotation.x = Math.PI / 2; g.add(at(badge, 0.82, 0.6, 0.34));
    g.add(line([[0.68, 0.6, 0.42], [0.78, 0.5, 0.42], [0.97, 0.72, 0.42]], 0.045, IVORY));
    g.rotation.y = -0.4; return g; },
  'which-hand'() { const g = new THREE.Group();
    const a = rimmedHand(0.9); a.scale.x = -1; g.add(at(a, -0.42, -0.06, -0.35));
    const b = new THREE.Group(); b.add(plate(handShape(1.02, 0, 0), 0.1, 0.04, 0.02, GOLD)); b.add(line([[-0.06, -0.33, 0.12], [0.08, -0.47, 0.12], [0.34, -0.17, 0.12]], 0.05, IVORY)); g.add(at(b, 0.42, 0.06, 0.25));
    g.rotation.y = -0.35; return g; },
  quiz() { const g = new THREE.Group(); const s = roundRectShape(1.8, 1.5, 0.42, 0, 0.12); const tail = new THREE.Shape(); tail.moveTo(-0.5, -0.5); tail.lineTo(-0.62, -0.95); tail.lineTo(-0.1, -0.6); tail.closePath();
    for (const [sh, mat, z, bs] of [[s, GOLD, -0.05, 0.065], [tail, GOLD, -0.05, 0.065], [s, IVORY, 0.03, 0.005], [tail, IVORY, 0.03, 0.005]]) g.add(at(plate(sh, 0.1, 0.03, bs, mat), 0, 0, z));
    g.add(line([[-0.28, 0.48, 0.14], [-0.1, 0.65, 0.14], [0.17, 0.62, 0.14], [0.27, 0.42, 0.14], [0.16, 0.22, 0.14], [0.02, 0.1, 0.14], [0.0, -0.06, 0.14]], 0.075));
    g.add(at(sphere(0.085, GOLD), 0, -0.3, 0.14)); g.rotation.y = -0.4; return g; },
  'palm-map'() { const g = new THREE.Group(); const w = 0.72, h = 1.7;
    for (let i = 0; i < 3; i++) { const p = new THREE.Group(); p.add(box(w + 0.1, h + 0.1, 0.05, 0.02, GOLD)); if (i !== 1) p.add(at(box(w, h, 0.07, 0.025, IVORY), 0, 0, 0.02)); p.rotation.y = i % 2 ? -0.42 : 0.42; p.position.set((i - 1) * w * 0.92, 0, i % 2 ? 0.0 : -0.15); g.add(p); }
    g.add(line([[-0.95, -0.55, 0.1], [-0.7, -0.3, 0.08]], 0.035, GOLD_DK));
    const pin = new THREE.Group(); pin.add(at(sphere(0.3, GOLD), 0, 0.42)); const cone = new THREE.Mesh(new THREE.ConeGeometry(0.21, 0.5, 48), GOLD); cone.rotation.x = Math.PI; pin.add(at(cone, 0, 0.13)); const dot = sphere(0.12, IVORY); dot.scale.z = 0.5; pin.add(at(dot, 0, 0.44, 0.24));
    g.add(at(pin, 0.66, 0.0, 0.2)); g.rotation.y = -0.3; return g; },
  signs() { const g = coin(1.15, IVORY); g.add(at(ext(starShape(0.78, 0.33), 0.12, 0.05), 0, -0.02, 0.17)); g.rotation.y = -0.38; return g; },

  // ---------- legal and trust pages
  document() { const g = new THREE.Group(); const s = new THREE.Shape(); const W = 0.75, H = 1.0, F = 0.36;
    s.moveTo(-W, -H); s.lineTo(W, -H); s.lineTo(W, H - F); s.lineTo(W - F, H); s.lineTo(-W, H); s.closePath();
    g.add(at(plate(s, 0.06, 0.03, 0.065, GOLD), 0, 0, -0.04)); g.add(at(plate(s, 0.08, 0.03, 0.004, IVORY), 0, 0, 0.04));
    const fold = new THREE.Shape(); fold.moveTo(W - F, H); fold.lineTo(W - F, H - F); fold.lineTo(W, H - F); fold.closePath(); g.add(at(plate(fold, 0.04, 0.02, 0.01, GOLD), 0, 0, 0.13));
    [[0.62, 0.48], [0.92, 0.22], [0.92, -0.04], [0.6, -0.3]].forEach(([len, y]) => g.add(at(box(len, 0.08, 0.06, 0.03, GOLD), -W + 0.2 + len / 2, y, 0.13)));
    const seal = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 64), GOLD); seal.rotation.x = Math.PI / 2; g.add(at(seal, 0.4, -0.66, 0.14));
    g.rotation.y = -0.4; return g; },
  delete() { const g = new THREE.Group();
    g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.52, 1.45, 96), IVORY), 0, -0.2));
    g.add(at(new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.04, 16, 96), GOLD), 0, -0.92).rotateX(Math.PI / 2));
    g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.14, 96), GOLD), 0, 0.62));
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.06, 16, 48, Math.PI), GOLD); g.add(at(handle, 0, 0.69));
    for (const a of [-0.55, 0, 0.55]) { const rib = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.9, 8, 16), GOLD); const r = 0.6; rib.position.set(Math.sin(a) * r, -0.2, Math.cos(a) * r); rib.rotation.x = -0.09; rib.rotation.z = Math.sin(a) * -0.1; g.add(rib); }
    g.rotation.x = 0.08; return g; },
  key() { const g = new THREE.Group();
    g.add(at(new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.12, 24, 96), GOLD), -0.72, 0));
    const face = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.1, 96), IVORY); face.rotation.x = Math.PI / 2; g.add(at(face, -0.72, 0));
    const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.14, 48), GOLD_DK); hole.rotation.x = Math.PI / 2; g.add(at(hole, -0.72, 0));
    g.add(at(box(1.4, 0.18, 0.18, 0.07, GOLD), 0.3, 0)); g.add(at(box(0.16, 0.34, 0.16, 0.05, GOLD), 0.78, -0.2)); g.add(at(box(0.14, 0.26, 0.16, 0.05, GOLD), 0.52, -0.16));
    g.add(at(box(0.08, 0.3, 0.22, 0.03, GOLD_DK), -0.22, 0));
    g.rotation.z = 0.5; g.rotation.y = -0.4; return g; },
  pen() { const g = new THREE.Group(); const p = new THREE.Group();
    p.add(at(new THREE.Mesh(new THREE.CapsuleGeometry(0.19, 1.5, 12, 48), IVORY), 0, 0.3));
    p.add(at(new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.62, 12, 48), GOLD), 0, 0.72));
    for (const y of [-0.38, 0.1]) { const b = new THREE.Mesh(new THREE.TorusGeometry(0.195, 0.04, 16, 64), GOLD); b.rotation.x = Math.PI / 2; p.add(at(b, 0, y)); }
    p.add(at(box(0.06, 0.62, 0.08, 0.03, GOLD), 0, 0.62, 0.2));
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.13, 0.22, 48), GOLD_DK); p.add(at(grip, 0, -0.56));
    const nib = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.42, 48), GOLD); nib.rotation.x = Math.PI; nib.scale.z = 0.55; p.add(at(nib, 0, -0.86));
    p.rotation.z = -0.75; g.add(at(p, 0.12, 0.22));
    g.add(line([[-0.95, -0.82, 0], [-0.7, -0.68, 0], [-0.45, -0.86, 0], [-0.18, -0.74, 0]], 0.04));
    g.rotation.y = -0.4; return g; },
  refund() { const g = coin(1.15, IVORY); const R = 0.6, a0 = 0.55, a1 = 0.55 + Math.PI * 1.55; const pts = [];
    for (let i = 0; i <= 40; i++) { const a = a0 + ((a1 - a0) * i) / 40; pts.push([Math.cos(a) * R, Math.sin(a) * R, 0.16]); }
    g.add(line(pts, 0.075));
    const e = [Math.cos(a1) * R, Math.sin(a1) * R], t = [-Math.sin(a1), Math.cos(a1)], n = [Math.cos(a1), Math.sin(a1)];
    const tri = new THREE.Shape(); tri.moveTo(e[0] + t[0] * 0.34, e[1] + t[1] * 0.34); tri.lineTo(e[0] + n[0] * 0.24 - t[0] * 0.04, e[1] + n[1] * 0.24 - t[1] * 0.04); tri.lineTo(e[0] - n[0] * 0.24 - t[0] * 0.04, e[1] - n[1] * 0.24 - t[1] * 0.04); tri.closePath();
    g.add(at(ext(tri, 0.08, 0.04), 0, 0, 0.16));
    g.rotation.y = -0.38; return g; },

  // ---------- general
  book() { const g = new THREE.Group();
    for (const s of [-1, 1]) { const half = new THREE.Group();
      half.add(at(box(1.0, 1.42, 0.06, 0.03, GOLD), s * 0.5, 0, -0.06));
      half.add(at(box(0.92, 1.32, 0.1, 0.03, IVORY), s * 0.47, 0, 0.02));
      [0.36, 0.14, -0.08, -0.3].forEach((y, i) => half.add(at(box(i === 3 ? 0.42 : 0.6, 0.06, 0.04, 0.02, GOLD), s * 0.47, y, 0.08)));
      half.rotation.y = s * -0.32; g.add(half); }
    g.add(at(box(0.1, 1.48, 0.12, 0.04, GOLD_DK), 0, 0, -0.08));
    g.rotation.y = -0.2; return g; },
  globe() { const g = new THREE.Group(); const R = 0.78;
    g.add(new THREE.Mesh(new THREE.SphereGeometry(R, 96, 48), IVORY));
    const eq = new THREE.Mesh(new THREE.TorusGeometry(R + 0.005, 0.03, 16, 128), GOLD); eq.rotation.x = Math.PI / 2; g.add(eq);
    for (const a of [-0.6, 0.6, 0]) { const m = new THREE.Mesh(new THREE.TorusGeometry(R + 0.005, a ? 0.026 : 0.03, 16, 128), GOLD); m.rotation.y = a; g.add(m); }
    for (const y of [-0.42, 0.42]) { const r = Math.sqrt(R * R - y * y); const p = new THREE.Mesh(new THREE.TorusGeometry(r + 0.005, 0.024, 16, 96), GOLD); p.rotation.x = Math.PI / 2; g.add(at(p, 0, y)); }
    const stand = new THREE.Mesh(new THREE.TorusGeometry(R + 0.14, 0.05, 16, 96, Math.PI * 1.1), GOLD_DK); stand.rotation.z = -Math.PI * 1.05; g.add(stand);
    g.add(at(box(0.9, 0.12, 0.5, 0.05, GOLD_DK), 0, -1.02)); g.add(at(box(0.1, 0.16, 0.1, 0.03, GOLD_DK), 0, -0.93));
    g.rotation.z = 0.0; g.rotation.y = -0.4; return g; },
  loupe() { const g = new THREE.Group();
    g.add(at(new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.12, 32, 128), GOLD), -0.28, 0.28));
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.08, 96), IVORY); glass.rotation.x = Math.PI / 2; g.add(at(glass, -0.28, 0.28));
    g.add(line([[-0.66, 0.18, 0.08], [-0.42, 0.34, 0.08], [-0.16, 0.32, 0.08], [0.06, 0.46, 0.08]], 0.045));
    const h = new THREE.Group(); h.add(new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.7, 12, 32), IVORY)); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.18, 48), GOLD); h.add(at(c, 0, 0.46));
    h.rotation.z = Math.PI / 4; g.add(at(h, 0.5, -0.5)); g.rotation.y = -0.4; return g; },
};

export function render(name) {
  const obj = BUILD[name](); obj.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  const holder = new THREE.Group(); holder.add(obj); scene.add(holder);
  const bb = new THREE.Box3().setFromObject(holder); const size = bb.getSize(V(0, 0, 0)); const c = bb.getCenter(V(0, 0, 0));
  const s = 1.5 / Math.max(size.x, size.y * 1.05); holder.scale.setScalar(s); holder.position.set(-c.x * s, -c.y * s, -c.z * s);
  const b2 = new THREE.Box3().setFromObject(holder); ground.position.y = b2.min.y - 0.002 + 0.08; holder.position.y += 0.08;
  renderer.render(scene, camera);
  const off = document.createElement('canvas'); off.width = off.height = SIZE; const cx = off.getContext('2d'); cx.imageSmoothingQuality = 'high'; cx.drawImage(canvas, 0, 0, SIZE, SIZE);
  scene.remove(holder); return off.toDataURL('image/png');
}
export const NAMES = Object.keys(BUILD);
