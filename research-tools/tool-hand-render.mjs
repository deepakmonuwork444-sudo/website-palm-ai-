// Tool-page hand stills (public/media/tools/): the home hero's porcelain hand (public/models/hero-hand/hand-v1.glb)
// rendered straight on, palm to the camera, with the hero's material and lights, on a transparent background.
// Mirrored so it is a RIGHT palm as you see your own (thumb on the right), like every tool diagram.
//
// The mesh's own palm creases are smoothed away (Taubin smoothing inside the palm only): every line a tool shows is then
// drawn on top from src/lib/tools/palm-geometry.ts, so a "short" or "broken" line is never contradicted by a
// crease that runs on underneath. The drawn base lines follow where those creases were.
//
// Proportion changes for the hand-type pictures are a smooth warp of the same mesh (palm width, palm length,
// finger length) with a fixed camera, so every picture shares one camera, light and material.
//
// Usage: node tool-hand-render.mjs <out.png> [key=value ...]
//   w=2000 h=2500  size;  palmW=1 palmL=1 fingerL=1  proportion factors;  mirror=1;  smooth=1;  zoom=1
import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const [out, ...rest] = process.argv.slice(2);
const opt = { w: 2000, h: 2500, palmW: 1, palmL: 1, fingerL: 1, mirror: 1, smooth: 1, taubin: 0, zoom: 1, wristY: -0.66, iters: 30 };
for (const kv of rest) {
  const [k, v] = kv.split('=');
  opt[k] = Number(v);
}
const root = resolve(import.meta.dirname, '..');
const types = { '.js': 'text/javascript', '.html': 'text/html', '.glb': 'model/gltf-binary' };
const page = `<!doctype html><html><body style="margin:0;background:transparent">
<script type="importmap">{"imports":{"three":"/node_modules/three/build/three.module.js","three/addons/":"/node_modules/three/examples/jsm/"}}</script>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
const O = ${JSON.stringify(opt)};
const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
r.setPixelRatio(1); r.setSize(O.w, O.h); r.setClearColor(0x000000, 0);
r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 0.66;
document.body.appendChild(r.domElement);
const scene = new THREE.Scene();
const pm = new THREE.PMREMGenerator(r); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
const key = new THREE.DirectionalLight(0xffe4bd, 2.4); key.position.set(-2.6, 3.2, 3);
const fill = new THREE.DirectionalLight(0xfff1e6, 0.7); fill.position.set(2.4, 0.4, 3.2);
const rimViolet = new THREE.DirectionalLight(0x9a78ff, 4.2); rimViolet.position.set(3.2, 1.6, -2.6);
const rimBlue = new THREE.DirectionalLight(0x6fb8ff, 2.2); rimBlue.position.set(-3.4, -0.6, -2.2);
scene.add(key, fill, rimViolet, rimBlue, new THREE.HemisphereLight(0xd6caff, 0x1a1033, 0.12));
const gltf = await new GLTFLoader().loadAsync('/public/models/hero-hand/hand-v1.glb');
const model = gltf.scene;
const box = new THREE.Box3().setFromObject(model); const size = box.getSize(new THREE.Vector3());
const s = 2 / Math.max(size.x, size.y, size.z); const c = box.getCenter(new THREE.Vector3());
const mirror = O.mirror ? -1 : 1;
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// Taubin smoothing inside the palm (an ellipse over the palm, front-facing vertices only).
function smoothPalm(g) {
  const p = g.attributes.position, n = g.attributes.normal, idx = g.index.array, N = p.count;
  const nb = Array.from({ length: N }, () => new Set());
  for (let i = 0; i < idx.length; i += 3) { const a = idx[i], b = idx[i+1], d = idx[i+2]; nb[a].add(b).add(d); nb[b].add(a).add(d); nb[d].add(a).add(b); }
  const w = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const ex = (p.getX(i) + 0.07) / 0.39, ey = (p.getY(i) + 0.155) / 0.375;
    const rr = Math.sqrt(ex * ex + ey * ey);
    w[i] = smooth(1.0, 0.8, rr) * smooth(0.15, 0.45, n.getZ(i)) * (p.getZ(i) > -0.05 ? 1 : 0);
  }
  const P = new Float32Array(p.array); const next = new Float32Array(P.length);
  const pass = (f) => { for (let i = 0; i < N; i++) { const a = i * 3; if (!w[i]) { next[a] = P[a]; next[a+1] = P[a+1]; next[a+2] = P[a+2]; continue; }
    let sx = 0, sy = 0, sz = 0; for (const j of nb[i]) { sx += P[j*3]; sy += P[j*3+1]; sz += P[j*3+2]; } const m = nb[i].size;
    next[a] = P[a] + w[i] * f * (sx / m - P[a]); next[a+1] = P[a+1] + w[i] * f * (sy / m - P[a+1]); next[a+2] = P[a+2] + w[i] * f * (sz / m - P[a+2]); } P.set(next); };
  for (let k = 0; k < O.iters; k++) { pass(0.5); if (O.taubin) pass(-0.53); }
  let active = 0; for (let i = 0; i < N; i++) if (w[i] > 0.5) active++;
  p.array.set(P); p.needsUpdate = true;
  console.log("smooth", N, active);
}

model.updateMatrixWorld(true);
const meshes = []; model.traverse((o) => { if (o.isMesh) meshes.push(o); });
for (const o of meshes) {
  let g = new THREE.BufferGeometry();
  const src = o.geometry.attributes.position; const f = new Float32Array(src.count * 3);
  for (let i = 0; i < src.count; i++) { f[i*3] = src.getX(i); f[i*3+1] = src.getY(i); f[i*3+2] = src.getZ(i); }
  g.setAttribute('position', new THREE.BufferAttribute(f, 3));
  if (o.geometry.index) g.setIndex(Array.from(o.geometry.index.array));
  g.applyMatrix4(o.matrixWorld);
  const p0 = g.attributes.position;
  for (let i = 0; i < p0.count; i++) p0.setXYZ(i, (p0.getX(i) - c.x) * s * mirror, (p0.getY(i) - c.y) * s, (p0.getZ(i) - c.z) * s);
  if (mirror < 0 && g.index) { const idx = g.index.array; for (let i = 0; i < idx.length; i += 3) { const t = idx[i]; idx[i] = idx[i+2]; idx[i+2] = t; } }
  g = mergeVertices(g, 1e-5);
  g.computeVertexNormals();
  if (O.smooth) smoothPalm(g);
  // Warp (hand units as rendered, mirror on: thumb on the +x side). The knuckle line slants down towards the little finger.
  const p = g.attributes.position;
  const kY = (x) => Math.min(0.245, 0.25 + 0.37 * (x + 0.035));
  const thumbW = (x, y) => smooth(0.29, 0.33, x) * smooth(-0.16, -0.06, y) * smooth(0.46, 0.38, y);
  const xc = -0.1;
  const dThumb = (O.palmL - 1) * (kY(0.3) + 0.07);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    const k = kY(x), tw = thumbW(x, y);
    const up = smooth(k - 0.05, k + 0.05, y) * (1 - tw);
    const dPalm = y < k ? (O.palmL - 1) * (k - y) : 0;
    const fingerY = k + (y - k) * O.fingerL;
    let ny = up * fingerY + (1 - up) * y;
    ny -= (1 - up) * ((1 - tw) * dPalm + tw * dThumb);
    const nx = x + (O.palmW - 1) * (x - xc) * (1 - 0.25 * up);
    p.setXYZ(i, nx, ny, p.getZ(i));
  }
  g.computeVertexNormals(); g.computeBoundingBox(); g.computeBoundingSphere();
  const mesh = new THREE.Mesh(g);
  const material = new THREE.MeshStandardMaterial({ color: 0xded4d3, roughness: 0.44, metalness: 0, envMapIntensity: 0.12, transparent: true });
  const wristY = O.wristY - (O.palmL - 1) * 0.9;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uRim = { value: new THREE.Color(0x8e74ff) }; shader.uniforms.uRimWarm = { value: new THREE.Color(0xf5c982) };
    shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\\nvarying vec3 vHandPos;').replace('#include <begin_vertex>', '#include <begin_vertex>\\nvHandPos = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\\nuniform vec3 uRim; uniform vec3 uRimWarm; varying vec3 vHandPos;')
      .replace('#include <color_fragment>', '#include <color_fragment>\\nfloat wrist = smoothstep(' + (wristY - 0.16).toFixed(3) + ', ' + (wristY + 0.22).toFixed(3) + ', vHandPos.y);\\ndiffuseColor.rgb *= 0.3 + 0.7 * wrist;\\ndiffuseColor.a *= wrist;')
      .replace('#include <opaque_fragment>', 'float fres = pow(1.0 - saturate(dot(normal, normalize(vViewPosition))), 2.4);\\noutgoingLight += mix(uRim, uRimWarm, smoothstep(0.5, -0.5, normal.x)) * fres * 0.8;\\n#include <opaque_fragment>');
  };
  mesh.material = material;
  scene.add(mesh);
}
// Fixed camera (the base framing), so every render shares one scale; zoom < 1 leaves room for bigger hands.
const fov = 16; const cam = new THREE.PerspectiveCamera(fov, O.w / O.h, 0.1, 100);
const halfH = 1.06 / O.zoom;
const dist = halfH / Math.tan((fov / 2) * Math.PI / 180) + 0.3;
cam.position.set(0, 0.02, dist); cam.lookAt(0, 0.02, 0);
r.render(scene, cam);
window.png = r.domElement.toDataURL('image/png');
window.ready = true;
</script></body></html>`;
const server = createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/') { res.setHeader('content-type', 'text/html'); return res.end(page); }
  try { const data = await readFile(join(root, url)); res.setHeader('content-type', types[extname(url)] ?? 'application/octet-stream'); res.end(data); }
  catch { res.statusCode = 404; res.end(); }
}).listen(4391);
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const tab = await browser.newPage({ viewport: { width: 800, height: 800 } });
tab.on('console', (m) => console.log('console:', m.text()));
tab.on('pageerror', (e) => console.log('pageerror:', e.message));
await tab.goto('http://localhost:4391/');
await tab.waitForFunction(() => window.ready, null, { timeout: 300000 });
const png = await tab.evaluate(() => window.png);
await browser.close();
server.close();
await writeFile(out, Buffer.from(png.split(',')[1], 'base64'));
console.log('wrote', out);
