// The 3D product film scene (public/media/README.md): a procedural phone in a navy + gold studio.
// Its screen shows ONLY real recorded frames of our own /reading/ page (film-record.mjs).
// Rendered offline, one deterministic frame at a time, by film-render.mjs.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const W = 1920;
const H = 1080;
const SCREEN_PX = [390, 844];
const STRIP = 44; // status strip above the recorded page (the page is 390 x 800)
const MM = 65.6 / SCREEN_PX[0]; // screen width 65.6 mm
const SW = SCREEN_PX[0] * MM;
const SH = SCREEN_PX[1] * MM;
const BW = 71.8;
const BH = SH + 6.2;
const BD = 8.3;

const roundedRect = (w, h, r) => {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
};
/** Flat rounded rectangle with 0..1 UVs across its box. */
const flatRect = (w, h, r) => {
  const g = new THREE.ShapeGeometry(roundedRect(w, h, r), 24);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5);
  return g;
};

// ---------- renderer ----------
const canvas = document.createElement('canvas');
canvas.width = W;
canvas.height = H;
document.body.appendChild(canvas);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, alpha: false });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(28, W / H, 5, 5000);
scene.add(camera);

// ---------- studio environment: a dark room with soft boxes (what the metal and glass reflect) ----------
const envScene = new THREE.Scene();
envScene.background = new THREE.Color(0x05041a);
const panel = (w, h, color, k, pos, look) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide }));
  m.position.set(...pos);
  m.lookAt(...look);
  envScene.add(m);
};
panel(6, 4, 0xfff1dc, 3.2, [-5, 6, 6], [0, 0, 0]); // warm key softbox, top left front
panel(1.2, 9, 0xf5c982, 2.6, [7, 1, 1], [0, 0, 0]); // gold strip, right
panel(1.0, 9, 0x9a78ff, 2.2, [-7, 0, -3], [0, 0, 0]); // violet rim strip, back left
panel(10, 1.0, 0x6fb8ff, 0.8, [0, -6, 2], [0, 0, 0]); // cool floor bounce
panel(14, 5, 0x2a2466, 0.6, [0, 8, -6], [0, 0, 0]); // soft ceiling
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(envScene, 0.035).texture;

const key = new THREE.DirectionalLight(0xffe4bd, 1.6);
key.position.set(-300, 400, 500);
const rimV = new THREE.DirectionalLight(0x9a78ff, 2.4);
rimV.position.set(-400, 100, -300);
const rimG = new THREE.DirectionalLight(0xf5c982, 2.0);
rimG.position.set(450, 150, -200);
scene.add(key, rimV, rimG, new THREE.HemisphereLight(0xd6caff, 0x1a1033, 0.25));

// ---------- background: camera-locked navy gradient with a low gold glow (dithered against banding) ----------
const bgCanvas = document.createElement('canvas');
bgCanvas.width = 960;
bgCanvas.height = 540;
{
  const g = bgCanvas.getContext('2d');
  g.fillStyle = 'rgb(2,1,25)';
  g.fillRect(0, 0, 960, 540);
  let r = g.createRadialGradient(480, 230, 0, 480, 230, 560);
  r.addColorStop(0, 'rgba(32,26,84,0.95)');
  r.addColorStop(0.45, 'rgba(14,11,48,0.8)');
  r.addColorStop(1, 'rgba(2,1,25,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 960, 540);
  g.save();
  g.translate(480, 560);
  g.scale(1, 0.32);
  r = g.createRadialGradient(0, 0, 0, 0, 0, 420);
  r.addColorStop(0, 'rgba(230,184,92,0.22)');
  r.addColorStop(1, 'rgba(230,184,92,0)');
  g.fillStyle = r;
  g.fillRect(-480, -1800, 960, 3600);
  g.restore();
  const d = g.getImageData(0, 0, 960, 540);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < d.data.length; i += 4) {
    const n = (rnd() - 0.5) * 3;
    d.data[i] += n;
    d.data[i + 1] += n;
    d.data[i + 2] += n;
  }
  g.putImageData(d, 0, 0);
}
const bgTex = new THREE.CanvasTexture(bgCanvas);
bgTex.colorSpace = THREE.SRGBColorSpace;
const bgDepth = 4000;
const bgH = 2 * bgDepth * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
const bg = new THREE.Mesh(new THREE.PlaneGeometry(bgH * camera.aspect, bgH), new THREE.MeshBasicMaterial({ map: bgTex, toneMapped: false, depthWrite: false }));
bg.position.z = -bgDepth;
bg.renderOrder = -1;
camera.add(bg);
// The loop's fade: the same gradient laid over everything.
const fadeDepth = 10;
const fadeH = 2 * fadeDepth * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
const fadeMat = new THREE.MeshBasicMaterial({ map: bgTex, toneMapped: false, transparent: true, opacity: 0, depthTest: false, depthWrite: false });
const fade = new THREE.Mesh(new THREE.PlaneGeometry(fadeH * camera.aspect, fadeH), fadeMat);
fade.position.z = -fadeDepth;
fade.renderOrder = 10;
camera.add(fade);

// ---------- the phone ----------
const phone = new THREE.Group();
scene.add(phone);
const metal = new THREE.MeshPhysicalMaterial({ color: 0xd9b77e, metalness: 1, roughness: 0.26, envMapIntensity: 1.15, clearcoat: 0.4, clearcoatRoughness: 0.2 });
const backGlass = new THREE.MeshPhysicalMaterial({ color: 0x1b1730, metalness: 0.2, roughness: 0.45, envMapIntensity: 0.6 });
const bevel = 2.2;
const bodyGeo = new THREE.ExtrudeGeometry(roundedRect(BW - 2 * bevel, BH - 2 * bevel, 11 - bevel), { depth: BD - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 10, curveSegments: 48 });
bodyGeo.translate(0, 0, -(BD - 2 * bevel) / 2);
const body = new THREE.Mesh(bodyGeo, [backGlass, metal]);
phone.add(body);
// Front: black glass bezel, the screen, the dynamic island, and a glass sheen on top.
const zf = BD / 2 + 0.02;
const bezel = new THREE.Mesh(flatRect(BW - 1.9, BH - 1.9, 10.2), new THREE.MeshPhysicalMaterial({ color: 0x020205, roughness: 0.1, metalness: 0, clearcoat: 1, envMapIntensity: 0.7 }));
bezel.position.z = zf;
phone.add(bezel);
const shotCanvas = document.createElement('canvas');
shotCanvas.width = SCREEN_PX[0] * 2;
shotCanvas.height = SCREEN_PX[1] * 2;
const shotCtx = shotCanvas.getContext('2d', { willReadFrequently: true });
const screenTex = new THREE.CanvasTexture(shotCanvas);
screenTex.colorSpace = THREE.SRGBColorSpace;
screenTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
screenTex.minFilter = THREE.LinearMipmapLinearFilter;
screenTex.generateMipmaps = true;
const screen = new THREE.Mesh(flatRect(SW, SH, 8.6), new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }));
screen.position.z = zf + 0.03;
phone.add(screen);
const island = new THREE.Mesh(flatRect(126 * MM * 0.92, 36 * MM, 18 * MM), new THREE.MeshBasicMaterial({ color: 0x000000 }));
island.position.set(0, SH / 2 - (11 + 18) * MM, zf + 0.06);
phone.add(island);
const lens = new THREE.Mesh(new THREE.CircleGeometry(5.5 * MM, 24), new THREE.MeshPhysicalMaterial({ color: 0x0b0d1c, roughness: 0.05, clearcoat: 1, envMapIntensity: 1.2 }));
lens.position.set(40 * MM, SH / 2 - 29 * MM, zf + 0.08);
phone.add(lens);
// Specular-only glass: black diffuse, added on top, so only the studio's reflections show.
const sheen = new THREE.Mesh(flatRect(BW - 1.9, BH - 1.9, 10.2), new THREE.MeshPhysicalMaterial({ color: 0x000000, roughness: 0.06, metalness: 0, envMapIntensity: 0.9, clearcoat: 0.6, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
sheen.position.z = zf + 0.12;
phone.add(sheen);
// Side buttons.
const button = (h, y, side) => {
  const b = new THREE.Mesh(new RoundedBoxGeometry(1.2, h, 3.0, 3, 0.55), metal);
  b.position.set(side * (BW / 2 - 0.1), y, 0);
  phone.add(b);
};
button(9, 38, -1);
button(15, 20, -1);
button(15, 2, -1);
button(22, 20, 1);

// A soft lilac halo behind the phone gives depth.
const haloCanvas = document.createElement('canvas');
haloCanvas.width = haloCanvas.height = 256;
{
  const g = haloCanvas.getContext('2d');
  const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  r.addColorStop(0, 'rgba(142,116,255,0.55)');
  r.addColorStop(0.5, 'rgba(142,116,255,0.14)');
  r.addColorStop(1, 'rgba(142,116,255,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 256, 256);
}
const haloTex = new THREE.CanvasTexture(haloCanvas);
haloTex.colorSpace = THREE.SRGBColorSpace;
const halo = new THREE.Mesh(new THREE.PlaneGeometry(260, 300), new THREE.MeshBasicMaterial({ map: haloTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, opacity: 0.32 }));
halo.position.z = -60;
scene.add(halo);

// ---------- motion: smooth cubic (Catmull-Rom tangents) through keyframes ----------
const spline = (keys, t) => {
  const n = keys.length;
  if (t <= keys[0][0]) return keys[0].slice(1);
  if (t >= keys[n - 1][0]) return keys[n - 1].slice(1);
  let i = 0;
  while (keys[i + 1][0] < t) i++;
  const [t0, ...p0] = keys[i];
  const [t1, ...p1] = keys[i + 1];
  const h = t1 - t0;
  const s = (t - t0) / h;
  const tan = (k, j) => {
    if (k === 0 || k === n - 1) return 0;
    return (keys[k + 1][j + 1] - keys[k - 1][j + 1]) / (keys[k + 1][0] - keys[k - 1][0]);
  };
  const h00 = 2 * s ** 3 - 3 * s ** 2 + 1;
  const h10 = s ** 3 - 2 * s ** 2 + s;
  const h01 = -2 * s ** 3 + 3 * s ** 2;
  const h11 = s ** 3 - s ** 2;
  return p0.map((v, j) => h00 * v + h10 * h * tan(i, j) + h01 * p1[j] + h11 * h * tan(i + 1, j));
};

// ---------- screen: real recorded frames ----------
let cfg;
const cache = new Map();
const loadFrame = async (file) => {
  if (cache.has(file)) return cache.get(file);
  const img = new Image();
  img.src = `/rec/${file}`;
  await img.decode();
  cache.set(file, img);
  if (cache.size > 8) cache.delete(cache.keys().next().value);
  return img;
};
const frameAt = (t) => {
  const fr = cfg.frames;
  let lo = 0;
  let hi = fr.length - 1;
  if (t <= fr[0].t) return fr[0].file;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (fr[mid].t <= t) lo = mid;
    else hi = mid - 1;
  }
  return fr[lo].file;
};
const drawScreen = async (recA, recB, mix) => {
  const g = shotCtx;
  const S = 2;
  const a = await loadFrame(frameAt(recA));
  g.globalAlpha = 1;
  g.drawImage(a, 0, STRIP * S, SCREEN_PX[0] * S, (SCREEN_PX[1] - STRIP) * S);
  if (recB != null && mix > 0) {
    const b = await loadFrame(frameAt(recB));
    g.globalAlpha = mix;
    g.drawImage(b, 0, STRIP * S, SCREEN_PX[0] * S, (SCREEN_PX[1] - STRIP) * S);
    g.globalAlpha = 1;
  }
  // The status strip takes the page's own top colour.
  const px = g.getImageData(2, STRIP * S + 1, 1, 1).data;
  g.fillStyle = `rgb(${px[0]},${px[1]},${px[2]})`;
  g.fillRect(0, 0, SCREEN_PX[0] * S, STRIP * S);
  screenTex.needsUpdate = true;
};

const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

window.film = {
  info: () => ({ gl: renderer.getContext().getParameter(renderer.getContext().VERSION), renderer: (() => { const gl = renderer.getContext(); const ext = gl.getExtension('WEBGL_debug_renderer_info'); return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'n/a'; })() }),
  init: (c) => {
    cfg = c;
    return { duration: c.durA - c.dissolve + c.durB };
  },
  /** Renders film time t (seconds) and returns the frame as a PNG data URL. */
  frame: async (t) => {
    const { durA, durB, dissolve, recA0, recB0, keys, fadeIn, fadeOut } = cfg;
    const T = durA - dissolve + durB;
    const bStart = durA - dissolve;
    const mix = smooth((t - bStart) / dissolve);
    await drawScreen(t < durA ? recA0 + Math.min(t, durA) : recB0 + (t - bStart), t >= bStart && t < durA ? recB0 + (t - bStart) : null, t >= durA ? 0 : mix);
    const [yaw, pitch, dist, tx, ty, roll, pyaw] = spline(keys, t);
    const target = new THREE.Vector3(tx, ty, 0);
    const y = THREE.MathUtils.degToRad(yaw);
    const p = THREE.MathUtils.degToRad(pitch);
    camera.position.set(target.x + dist * Math.sin(y) * Math.cos(p), target.y + dist * Math.sin(p), dist * Math.cos(y) * Math.cos(p));
    camera.up.set(Math.sin(THREE.MathUtils.degToRad(roll)), Math.cos(THREE.MathUtils.degToRad(roll)), 0);
    camera.lookAt(target);
    // The phone breathes: a slow float and a small turn of its own.
    phone.position.y = 1.2 * Math.sin((t / T) * Math.PI * 2);
    phone.rotation.y = THREE.MathUtils.degToRad(pyaw);
    phone.rotation.x = THREE.MathUtils.degToRad(-1.5 + 1.0 * Math.sin((t / T) * Math.PI * 2 + 1));
    halo.position.y = phone.position.y;
    fadeMat.opacity = Math.max(1 - smooth(t / fadeIn), smooth((t - (T - fadeOut)) / fadeOut));
    fade.visible = fadeMat.opacity > 0.001;
    renderer.render(scene, camera);
    return canvas.toDataURL('image/png');
  },
};
window.filmReady = true;
