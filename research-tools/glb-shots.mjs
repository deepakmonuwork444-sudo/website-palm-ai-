// Render a GLB from a few angles in headless Chrome (WebGL via SwiftShader) to judge a model.
// Usage: node glb-shots.mjs <glb path relative to project root> <outDir> [angles comma list in degrees]
import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { mkdirSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const [glb, out, anglesArg = '0,35,90,180'] = process.argv.slice(2);
const root = resolve(import.meta.dirname, '..');
mkdirSync(out, { recursive: true });
const types = { '.js': 'text/javascript', '.html': 'text/html', '.glb': 'model/gltf-binary', '.wasm': 'application/wasm' };
const page = `<!doctype html><html><body style="margin:0;background:#15122e">
<script type="importmap">{"imports":{"three":"/node_modules/three/build/three.module.js","three/addons/":"/node_modules/three/examples/jsm/"}}</script>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
const r = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
r.setSize(600, 800); document.body.appendChild(r.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x15122e);
scene.environment = new THREE.PMREMGenerator(r).fromScene(new RoomEnvironment(), 0.04).texture;
const cam = new THREE.PerspectiveCamera(30, 600/800, 0.01, 100);
const gltf = await new GLTFLoader().loadAsync('/${glb}');
const obj = gltf.scene; const box = new THREE.Box3().setFromObject(obj); const size = box.getSize(new THREE.Vector3()); const c = box.getCenter(new THREE.Vector3());
obj.position.sub(c); const s = 2 / Math.max(size.x, size.y, size.z); const g = new THREE.Group(); g.scale.setScalar(s); g.add(obj); scene.add(g);
let tris = 0; obj.traverse(o => { if (o.isMesh) { tris += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; o.material = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.55 }); } });
cam.position.set(0, 0, 4.4); cam.lookAt(0,0,0);
window.info = { tris, size: size.toArray() };
window.shot = (deg, axis) => { g.rotation.set(0,0,0); g.rotation[axis || 'y'] = deg * Math.PI / 180; r.render(scene, cam); };
window.ortho = () => { const o = new THREE.OrthographicCamera(-0.9, 0.9, 1.2, -1.2, 0.01, 100); o.position.set(0,0,5); const d = new THREE.DirectionalLight(0xffffff, 2.5); d.position.set(0, 3, 0.6); scene.add(d); g.rotation.set(0,0,0); r.render(scene, o); };
window.ready = true;
</script></body></html>`;
const server = createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/') { res.setHeader('content-type', 'text/html'); return res.end(page); }
  try { const data = await readFile(join(root, url)); res.setHeader('content-type', types[extname(url)] ?? 'application/octet-stream'); res.end(data); }
  catch { res.statusCode = 404; res.end(); }
}).listen(4390);
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const tab = await browser.newPage({ viewport: { width: 600, height: 800 } });
tab.on('console', (m) => console.log('console:', m.text()));
tab.on('pageerror', (e) => console.log('pageerror:', e.message));
await tab.goto('http://localhost:4390/');
await tab.waitForFunction(() => window.ready, null, { timeout: 120000 });
console.log(JSON.stringify(await tab.evaluate(() => window.info)));
for (const a of anglesArg.split(',')) {
  if (a === 'ortho') { await tab.evaluate(() => window.ortho()); await tab.screenshot({ path: out + '/ortho.png' }); continue; }
  const [deg, axis] = a.split(':');
  await tab.evaluate(([d, ax]) => window.shot(Number(d), ax), [deg, axis]);
  await tab.screenshot({ path: `${out}/angle-${deg}${axis ?? ''}.png` });
}
await browser.close();
server.close();
