/**
 * The Living palm (home hero, src/components/home/LivingPalm.astro), drawn in
 * a worker on an OffscreenCanvas so the page's main thread stays free (shader
 * compiles and texture uploads block only this thread). Started by
 * src/scripts/living-palm.ts, which owns the page side: input, the line names,
 * the poster and the buttons.
 *
 * A real photographed hand rebuilt in depth (a displaced mesh from its depth
 * map, skin shading from its colour and normal maps), with the four lines of a
 * real PalmSays scan of that photo drawn on the skin one by one. It turns with
 * a finger or the mouse (with inertia), leans toward the mouse and follows the
 * phone's tilt. The loop stops off screen, while the tab is hidden and while
 * the page scrolls; the pixel ratio drops on a slow device, and a device that
 * still cannot keep up hands back to the poster. Approved sample: "A, Living
 * palm" (owner, 2026-10-04).
 */
import {
  ACESFilmicToneMapping,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  LinearFilter,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  NoColorSpace,
  ObjectSpaceNormalMap,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  Texture,
  Uint32BufferAttribute,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderer,
  type WebGLProgramParametersWithUniforms,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { LINE_KEYS, handBase, type HandShape, type LineKey } from './living-palm-hands';

/** Page -> worker. */
export type ToWorker =
  | { type: 'init'; canvas: OffscreenCanvas; hand: HandShape; w: number; h: number; dpr: number; small: boolean; still: boolean; keep: boolean; shot: boolean }
  | { type: 'size'; w: number; h: number }
  | { type: 'visible'; visible: boolean }
  | { type: 'scroll' }
  | { type: 'drag'; phase: 'down' | 'move' | 'up'; dx: number; dy: number }
  | { type: 'hover'; x: number; y: number }
  | { type: 'tilt'; y: number; p: number }
  | { type: 'gold'; gold: boolean }
  | { type: 'replay' }
  | { type: 'hand'; hand: HandShape }
  | { type: 'pose'; yaw: number; pitch: number }
  | { type: 'lines'; progress: number | null }
  | { type: 'snapshot' }
  | { type: 'spots' };

/** Worker -> page. `at`: the four name anchors in CSS px (x, y pairs), `align`: which side of each the text sits; `on`: bit i = line i drawn. */
export type FromWorker =
  | { type: 'ready' }
  | { type: 'fail'; reason: string }
  | { type: 'frame'; at: number[]; align: string[]; fs: number; on: number }
  | { type: 'hand' }
  | { type: 'snapshot'; png: Blob }
  | { type: 'spots'; spots: Record<LineKey, [number, number]> };

const post = (m: FromWorker): void => (self as unknown as Worker).postMessage(m);

/** The site's line colours, a little deeper so they sit in the skin like ink. */
const COLOUR: Record<LineKey, string> = { heart: '#D42A40', head: '#2F6BDA', life: '#1C9A4E', fate: '#8049E4' };
const GOLD = '#A87418';
/** Line drawing: wait, then each line in turn. */
const DRAW = { delay: 0.9, each: 1.5, gap: 0.45 };
const LIMIT = MathUtils.degToRad(20);
/** Framing: the share of the photo's height shown (fingertips to the faded wrist) and of its width. */
const BASE = { pitch: -0.05, yaw: -0.08, roll: 0.035 };

type Box = { u0: number; u1: number; v0: number; v1: number };
/** frame (living-palm pipeline): the hand's content box, turning point, palm edges and wrist fade, in photo UV. */
interface Frame { content?: Box; pivot?: { u: number; v: number }; palmEdges?: { uL: number; uR: number; v: number }; wristFade?: { v0: number; v1: number } }
interface Meta { W: number; H: number; worldW: number; worldH: number; pxToWorld: number; zmin: number; zmax: number; frame?: Frame }
type Spot = { uv: [number, number]; align: 'left' | 'right' | 'center' };
interface Lines {
  rect: { u0: number; v0: number; u1: number; v1: number };
  maxDistPx: number;
  lines: { key: string; mid: [number, number] }[];
  /** Name spots placed beside each real line, and the name size as a share of the palm's width (pipeline). */
  labels?: Partial<Record<LineKey, Spot>>;
  labelBox?: { emOfPalmWidth?: number };
}
/** hero-palm-a's view (the approved sample's framing): fingertips to the faded wrist. */
const SAMPLE_VIEW: Box = { u0: -0.02, u1: 0.88, v0: 0.01, v1: 0.9 };

interface Built {
  mesh: Mesh;
  shadow: Mesh;
  meta: Meta;
  anchors: Vector3[];
  align: Spot['align'][];
  /** Name size: share of the on-screen palm width (between the edges). */
  em: number;
  /** What the camera frames, in photo UV. */
  view: Box;
  pivot: { u: number; v: number };
  edges: [Vector3, Vector3];
  use(): void;
  dispose(): void;
}

const ease = (x: number): number => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const raf: (cb: (t: number) => void) => number =
  typeof self.requestAnimationFrame === 'function' ? self.requestAnimationFrame.bind(self) : (cb) => setTimeout(() => cb(performance.now()), 16) as unknown as number;
const caf: (id: number) => void = typeof self.cancelAnimationFrame === 'function' ? self.cancelAnimationFrame.bind(self) : (id) => clearTimeout(id);

async function bitmap(url: string, flip: boolean, colour: boolean): Promise<ImageBitmap> {
  const blob = await fetch(url).then((r) => {
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    return r.blob();
  });
  return createImageBitmap(blob, { imageOrientation: flip ? 'flipY' : 'from-image', premultiplyAlpha: 'none', colorSpaceConversion: colour ? 'default' : 'none' });
}
const texture = (img: ImageBitmap): Texture => {
  const t = new Texture(img);
  t.flipY = false;
  t.needsUpdate = true;
  return t;
};

async function start(init: Extract<ToWorker, { type: 'init' }>): Promise<void> {
  const { canvas, still, keep, shot, small } = init;
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
    failIfMajorPerformanceCaveat: true,
    preserveDrawingBuffer: shot,
  });
  let dpr = Math.min(init.dpr || 1, 2.5);
  let W = Math.max(1, init.w);
  let H = Math.max(1, init.h);
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.84;
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(24, 1, 0.1, 50);
  const pmrem = new PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  scene.environment = env;
  scene.environmentIntensity = 0.45;

  // Lights: soft warm key, warm gold rims, cool navy fill.
  const key = new DirectionalLight('#fff1e2', 1.75);
  key.position.set(-1.4, 1.8, 3.2);
  const rim = new DirectionalLight('#ffc57a', 2.6);
  rim.position.set(2.6, 1.2, -1.2);
  const rim2 = new DirectionalLight('#ffd9b0', 1.2);
  rim2.position.set(-2.8, 0.6, -0.8);
  scene.add(key, rim, rim2, new HemisphereLight('#c9c2ff', '#2a1d18', 0.55));
  const rig = new Group();
  scene.add(rig);

  // The skin's line uniforms, shared by every hand.
  const U = {
    uField: { value: null as Texture | null },
    uRect: { value: new Vector4() },
    uMaxD: { value: 24 },
    uImg: { value: new Vector2(1, 1) },
    uProg: { value: new Vector4() },
    uHalfW: { value: 1 },
    uCol: { value: LINE_KEYS.map((k) => new Color(COLOUR[k])) },
    uSSS: { value: 0.12 },
    uInk: { value: 0.86 },
  };

  /** One hand: the displaced mesh from its depth map, its skin, its shadow and its name anchors. */
  async function build(hand: HandShape): Promise<Built> {
    const base = handBase(hand.slug);
    const [meta, lines, albedoImg, normalImg, fieldImg, shadowImg, depth] = await Promise.all([
      fetch(base + 'palm-meta.json').then((r) => r.json() as Promise<Meta>),
      fetch(base + 'lines.json').then((r) => r.json() as Promise<Lines>),
      bitmap(base + (small ? 'palm-albedo-1024.webp' : 'palm-albedo.webp'), true, true),
      bitmap(base + 'palm-normal.webp', true, false),
      bitmap(base + 'lines-field.png', false, false),
      bitmap(base + 'palm-shadow.png', true, false),
      bitmap(base + 'palm-depth.png', false, false),
    ]);
    const albedo = texture(albedoImg);
    albedo.colorSpace = SRGBColorSpace;
    albedo.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const normal = texture(normalImg);
    normal.anisotropy = 4;
    const field = texture(fieldImg);
    field.colorSpace = NoColorSpace;
    field.generateMipmaps = false;
    field.minFilter = LinearFilter;
    const shadowTex = texture(shadowImg);

    // The mesh: one vertex per depth pixel (16-bit depth in R/G, coverage in B).
    const MW = depth.width;
    const MH = depth.height;
    const ctx = new OffscreenCanvas(MW, MH).getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(depth, 0, 0);
    depth.close();
    const px = ctx.getImageData(0, 0, MW, MH).data;
    const zAt = new Float32Array(MW * MH);
    const cov = new Uint8Array(MW * MH);
    for (let i = 0; i < MW * MH; i++) {
      const q = ((px[i * 4]! << 8) | px[i * 4 + 1]!) / 65535;
      zAt[i] = (meta.zmin + q * (meta.zmax - meta.zmin)) * meta.pxToWorld;
      cov[i] = px[i * 4 + 2]!;
    }
    const pivot = meta.frame?.pivot ?? hand.pivot;
    // The turning point's depth (off the hand: the hand's mean depth).
    const p0 = Math.round(pivot.v * (MH - 1)) * MW + Math.round(pivot.u * (MW - 1));
    let z0 = zAt[p0]!;
    if (!cov[p0]) {
      let sum = 0;
      let count = 0;
      for (let i = 0; i < MW * MH; i++) {
        if (!cov[i]) continue;
        sum += zAt[i]!;
        count++;
      }
      z0 = count ? sum / count : 0;
    }
    const pos = new Float32Array(MW * MH * 3);
    const uv = new Float32Array(MW * MH * 2);
    for (let j = 0; j < MH; j++) {
      for (let i = 0; i < MW; i++) {
        const k = j * MW + i;
        const u = i / (MW - 1);
        const v = j / (MH - 1);
        pos[k * 3] = (u - pivot.u) * meta.worldW;
        pos[k * 3 + 1] = (pivot.v - v) * meta.worldH;
        pos[k * 3 + 2] = zAt[k]! - z0;
        uv[k * 2] = u;
        uv[k * 2 + 1] = 1 - v;
      }
    }
    const idx = new Uint32Array((MW - 1) * (MH - 1) * 6);
    let n = 0;
    for (let j = 0; j < MH - 1; j++) {
      for (let i = 0; i < MW - 1; i++) {
        const a = j * MW + i;
        const b = a + 1;
        const c = a + MW;
        const d = c + 1;
        if (cov[a]! + cov[b]! + cov[c]! + cov[d]! === 0) continue;
        idx[n++] = a;
        idx[n++] = c;
        idx[n++] = b;
        idx[n++] = b;
        idx[n++] = c;
        idx[n++] = d;
      }
    }
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(pos, 3));
    geo.setAttribute('uv', new BufferAttribute(uv, 2));
    geo.setIndex(new Uint32BufferAttribute(idx.subarray(0, n), 1));
    geo.computeVertexNormals();

    const sampleZ = (u: number, v: number): number => {
      const x = u * (MW - 1);
      const y = v * (MH - 1);
      const x0 = Math.floor(x);
      const y0 = Math.floor(y);
      const tx = x - x0;
      const ty = y - y0;
      const g = (i: number, j: number): number => zAt[Math.min(MH - 1, j) * MW + Math.min(MW - 1, i)]!;
      return (g(x0, y0) * (1 - tx) + g(x0 + 1, y0) * tx) * (1 - ty) + (g(x0, y0 + 1) * (1 - tx) + g(x0 + 1, y0 + 1) * tx) * ty - z0;
    };
    const toLocal = (u: number, v: number, lift = 0.004): Vector3 =>
      new Vector3((u - pivot.u) * meta.worldW, (pivot.v - v) * meta.worldH, sampleZ(u, v) + lift);

    // The skin, with the scan's lines drawn into it from the distance/progress field.
    const skin = new MeshPhysicalMaterial({
      map: albedo,
      normalMap: normal,
      normalMapType: ObjectSpaceNormalMap,
      roughness: 0.56,
      metalness: 0,
      sheen: 0.45,
      sheenColor: new Color('#ffd2bd'),
      sheenRoughness: 0.55,
      specularIntensity: 0.42,
      ior: 1.42,
      clearcoat: 0.06,
      clearcoatRoughness: 0.42,
      transparent: true,
      alphaTest: 0.01,
    });
    skin.onBeforeCompile = (sh: WebGLProgramParametersWithUniforms) => {
      Object.assign(sh.uniforms, U);
      sh.fragmentShader = sh.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>
          uniform sampler2D uField; uniform vec4 uRect; uniform float uMaxD; uniform vec2 uImg; uniform vec4 uProg; uniform float uHalfW; uniform vec3 uCol[4]; uniform float uSSS; uniform float uInk;
          float lineCov(float d, float hw, float pps) { return 1.0 - smoothstep(hw - 0.6 * pps, hw + 0.6 * pps, d); }`,
        )
        .replace(
          '#include <map_fragment>',
          `#include <map_fragment>
          vec3 lineEmit = vec3(0.0);
          {
            vec2 iuv = vec2(vMapUv.x, 1.0 - vMapUv.y);
            vec2 f = (iuv - uRect.xy) / (uRect.zw - uRect.xy);
            if (f.x > 0.0 && f.x < 1.0 && f.y > 0.0 && f.y < 1.0) {
              vec3 dA = texture2D(uField, vec2(f.x, f.y / 3.0)).rgb * uMaxD;
              vec3 pA = texture2D(uField, vec2(f.x, (f.y + 1.0) / 3.0)).rgb;
              vec2 fF = texture2D(uField, vec2(f.x, (f.y + 2.0) / 3.0)).rg;
              vec4 D = vec4(dA, fF.x * uMaxD); vec4 P = vec4(pA, fF.y);
              float pps = max(0.35, length(fwidth(iuv * uImg)) * 0.7071);
              float hw = max(uHalfW * pps, 1.3);
              for (int k = 0; k < 4; k++) {
                float drawn = 1.0 - smoothstep(uProg[k] - 0.006, uProg[k] + 0.002, P[k]);
                float c = lineCov(D[k], hw, pps) * drawn;
                float shade = (1.0 - smoothstep(hw, hw + 2.2 * pps + 1.5, D[k])) * drawn;
                diffuseColor.rgb *= 1.0 - 0.10 * shade;
                diffuseColor.rgb = mix(diffuseColor.rgb, uCol[k], c * uInk);
                float head = (uProg[k] > 0.0 && uProg[k] < 1.0) ? smoothstep(0.035, 0.0, uProg[k] - P[k]) * drawn : 0.0;
                lineEmit += uCol[k] * c * (0.16 + 1.2 * head) + vec3(1.0, 0.85, 0.55) * head * (1.0 - smoothstep(0.0, hw * 2.5, D[k])) * 0.6;
              }
            }
          }`,
        )
        .replace(
          '#include <emissivemap_fragment>',
          `#include <emissivemap_fragment>
          {
            float nv = clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0);
            float edge = pow(1.0 - nv, 2.0);
            totalEmissiveRadiance += diffuseColor.rgb * vec3(1.0, 0.42, 0.28) * uSSS * (0.55 + 1.6 * edge);
            totalEmissiveRadiance += lineEmit;
          }`,
        );
    };
    const mesh = new Mesh(geo, skin);
    // Soft shadow on an unseen wall behind the hand.
    const shadowMat = new MeshBasicMaterial({ color: 0x03020c, alphaMap: shadowTex, transparent: true, opacity: 0.55, depthWrite: false });
    const shadowGeo = new PlaneGeometry(meta.worldW * 1.06, meta.worldH * 1.06);
    const shadow = new Mesh(shadowGeo, shadowMat);
    shadow.position.set(0.05, -0.07, -0.42);

    // Names: the hand's own spots (hero-palm-a), else the pipeline's spots beside each real line, else the line's middle.
    const mids = Object.fromEntries(lines.lines.map((l) => [l.key, l.mid]));
    const spots = LINE_KEYS.map((k): Spot => hand.labels[k] ?? lines.labels?.[k] ?? { uv: mids[k] ?? [0.5, 0.5], align: 'center' });
    const anchors = spots.map((s) => toLocal(s.uv[0], s.uv[1], 0.01));
    const f = meta.frame;
    const edgeV = f?.palmEdges?.v ?? 0.5;
    const edgeU: [number, number] = f?.palmEdges ? [f.palmEdges.uL, f.palmEdges.uR] : hand.edges;
    const c = f?.content;
    const view: Box = c ? { u0: c.u0 - 0.02, u1: c.u1 + 0.02, v0: Math.max(0, c.v0 - 0.015), v1: f?.wristFade?.v1 ?? c.v1 } : SAMPLE_VIEW;
    return {
      mesh,
      shadow,
      meta,
      anchors,
      align: spots.map((s) => s.align),
      em: f?.palmEdges ? (lines.labelBox?.emOfPalmWidth ?? 0.06) : 0.045,
      view,
      pivot,
      edges: [toLocal(edgeU[0], edgeV), toLocal(edgeU[1], edgeV)],
      use() {
        U.uField.value = field;
        U.uRect.value.set(lines.rect.u0, lines.rect.v0, lines.rect.u1, lines.rect.v1);
        U.uMaxD.value = lines.maxDistPx;
        U.uImg.value.set(meta.W, meta.H);
      },
      dispose() {
        geo.dispose();
        skin.dispose();
        shadowGeo.dispose();
        shadowMat.dispose();
        for (const t of [albedo, normal, field, shadowTex]) t.dispose();
      },
    };
  }

  let current = await build(init.hand);
  current.use();
  rig.add(current.mesh);
  scene.add(current.shadow);

  const shadowAt = new Vector2(0.05, -0.07);
  // ---- layout ----
  const layout = (): void => {
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    const m = current.meta;
    const dist = 3.2;
    camera.position.set(0, 0, dist);
    const v = current.view;
    const needH = (v.v1 - v.v0) * m.worldH;
    const needW = (v.u1 - v.u0) * m.worldW;
    camera.fov = MathUtils.radToDeg(2 * Math.atan(Math.max(needH / 2 / dist, needW / 2 / dist / camera.aspect)));
    camera.updateProjectionMatrix();
    // The view centre to the screen centre (the hand turns around its pivot).
    rig.position.set(-((v.u0 + v.u1) / 2 - current.pivot.u) * m.worldW, -(current.pivot.v - (v.v0 + v.v1) / 2) * m.worldH, 0);
    // The soft shadow sits behind the photo, a little down and to the right (the sample: 0.05, -0.07 for hero-palm-a).
    shadowAt.set((0.5 - current.pivot.u) * m.worldW + rig.position.x - 0.034, (current.pivot.v - 0.5) * m.worldH + rig.position.y + 0.024);
    U.uHalfW.value = Math.max(1, 0.72 * renderer.getPixelRatio());
  };
  layout();

  // ---- motion state ----
  const st = { yaw: 0, pitch: 0, vy: 0, vp: 0, ty: 0, tp: 0, drag: false, lastInput: -1e9, hx: 0, hy: 0, tiltY: 0, tiltP: 0 };
  const motion = !still && !shot;
  let visible = true;
  let failed = false;
  let frameId = 0;
  let last = 0;
  let clock = 0;
  let scrolledAt = -1e9;
  let t0 = performance.now();
  const prog = [0, 0, 0, 0];
  let fixedLines: number | null = still ? 1 : null;
  let ready = false;
  let slowWindows = 0;
  let frames = 0;
  let acc = 0;
  const tmp = new Vector3();

  const project = (v: Vector3): [number, number] => {
    const p = tmp.copy(v).applyMatrix4(current.mesh.matrixWorld).project(camera);
    return [(p.x * 0.5 + 0.5) * W, (-p.y * 0.5 + 0.5) * H];
  };

  const render = (now: number): void => {
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
    last = now;
    if (motion) clock += dt;
    if (!st.drag) {
      st.ty = MathUtils.clamp(st.ty + st.vy, -LIMIT, LIMIT);
      st.tp = MathUtils.clamp(st.tp + st.vp, -LIMIT, LIMIT);
      st.vy *= 0.92;
      st.vp *= 0.92;
      if (now - st.lastInput > 2600) {
        st.ty += (0 - st.ty) * 0.02;
        st.tp += (0 - st.tp) * 0.02;
      }
    }
    const sway = motion ? 1 : 0;
    const gy = st.ty + st.hx * 0.12 + st.tiltY + sway * 0.07 * Math.sin(clock * 0.33);
    const gp = st.tp + st.hy * 0.08 + st.tiltP + sway * 0.025 * (Math.sin(clock * 0.27 + 1.3) - Math.sin(1.3));
    if (shot) {
      st.yaw = gy;
      st.pitch = gp;
    } else {
      st.yaw += (gy - st.yaw) * 0.08;
      st.pitch += (gp - st.pitch) * 0.08;
    }
    rig.rotation.set(BASE.pitch + st.pitch, BASE.yaw + st.yaw, BASE.roll + sway * 0.012 * Math.sin(clock * 0.5));
    const breathe = sway * Math.sin(clock * 1.05);
    current.mesh.scale.setScalar(1 + 0.0035 * breathe);
    current.mesh.position.y = 0.006 * breathe;
    current.shadow.position.x = shadowAt.x - st.yaw * 0.25;
    current.shadow.position.y = shadowAt.y + st.pitch * 0.2;

    const lt = (now - t0) / 1000;
    for (let i = 0; i < 4; i++) prog[i] = fixedLines ?? ease((lt - DRAW.delay - i * (DRAW.each + DRAW.gap)) / DRAW.each);
    U.uProg.value.set(prog[0]!, prog[1]!, prog[2]!, prog[3]! * 1.004);
    renderer.render(scene, camera);

    // Where the names go (the page writes them beside the lines).
    current.mesh.updateWorldMatrix(true, false);
    const xl = project(current.edges[0])[0];
    const xr = project(current.edges[1])[0];
    const fs = Math.round(Math.max(W >= 520 ? 16 : 13, Math.min(20, (xr - xl) * current.em)) * 2) / 2;
    const at: number[] = [];
    for (const a of current.anchors) at.push(...project(a));
    let on = 0;
    prog.forEach((p, i) => (on |= p >= 1 ? 1 << i : 0));
    post({ type: 'frame', at, align: current.align, fs, on });
  };

  /** A device that cannot keep ~42 fps loses pixel ratio (to 1.5, then 1); below ~24 fps at 1 the poster comes back. */
  const watchSpeed = (dt: number): void => {
    if (keep || shot || st.drag) return;
    frames++;
    acc += dt;
    if (acc < 0.75) return;
    const fps = frames / acc;
    frames = 0;
    acc = 0;
    const slow = dpr > 1 ? fps < 42 : fps < 24;
    slowWindows = slow ? slowWindows + 1 : 0;
    if (slowWindows < 2) return;
    slowWindows = 0;
    if (dpr > 1.5) dpr = 1.5;
    else if (dpr > 1) dpr = 1;
    else return fail('slow');
    layout();
  };

  const step = (now: number): void => {
    frameId = 0;
    if (!visible || failed) return;
    frameId = raf(step);
    // While the page scrolls the hand holds still: the GPU is left to the scroll.
    if (ready && !st.drag && now - scrolledAt < 160) {
      last = now;
      return;
    }
    const dt = last ? (now - last) / 1000 : 0;
    render(now);
    if (!ready) {
      ready = true;
      post({ type: 'ready' });
    } else watchSpeed(dt);
  };
  const kick = (): void => {
    if (!frameId && visible && !failed) {
      last = 0;
      frameId = raf(step);
    }
  };
  const fail = (reason: string): void => {
    if (failed) return;
    failed = true;
    caf(frameId);
    frameId = 0;
    post({ type: 'fail', reason });
  };
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    fail('context lost');
  });

  // Compile the skin before the first frame (in this worker: the page does not wait).
  await renderer.compileAsync(scene, camera).catch(() => undefined);
  t0 = performance.now();

  handle = async (m: ToWorker): Promise<void> => {
    switch (m.type) {
      case 'size':
        W = Math.max(1, m.w);
        H = Math.max(1, m.h);
        layout();
        if (!frameId && ready && !failed) render(performance.now());
        break;
      case 'visible':
        visible = m.visible;
        if (visible) kick();
        else if (frameId) {
          caf(frameId);
          frameId = 0;
        }
        break;
      case 'scroll':
        scrolledAt = performance.now();
        break;
      case 'drag':
        if (m.phase === 'down') st.drag = true;
        else if (m.phase === 'up') st.drag = false;
        else {
          st.vy = m.dx * 0.0045;
          st.vp = m.dy * 0.0035;
          st.ty = MathUtils.clamp(st.ty + st.vy, -LIMIT, LIMIT);
          st.tp = MathUtils.clamp(st.tp + st.vp, -LIMIT, LIMIT);
        }
        st.lastInput = performance.now();
        break;
      case 'hover':
        st.hx = m.x;
        st.hy = m.y;
        break;
      case 'tilt':
        st.tiltY = MathUtils.clamp(m.y, -LIMIT, LIMIT);
        st.tiltP = MathUtils.clamp(m.p, -LIMIT * 0.6, LIMIT * 0.6);
        break;
      case 'gold':
        LINE_KEYS.forEach((k, i) => U.uCol.value[i]!.set(m.gold ? GOLD : COLOUR[k]));
        break;
      case 'replay':
        fixedLines = null;
        t0 = performance.now();
        kick();
        break;
      case 'hand': {
        const next = await build(m.hand);
        rig.remove(current.mesh);
        scene.remove(current.shadow);
        current.dispose();
        current = next;
        current.use();
        rig.add(current.mesh);
        scene.add(current.shadow);
        layout();
        await renderer.compileAsync(scene, camera).catch(() => undefined);
        fixedLines = still ? 1 : null;
        t0 = performance.now();
        kick();
        post({ type: 'hand' });
        break;
      }
      case 'pose':
        st.ty = MathUtils.degToRad(m.yaw);
        st.tp = MathUtils.degToRad(m.pitch);
        st.yaw = st.ty;
        st.pitch = st.tp;
        st.vy = 0;
        st.vp = 0;
        st.lastInput = performance.now() + 1e9;
        break;
      case 'lines':
        fixedLines = m.progress;
        break;
      case 'snapshot': {
        render(performance.now());
        post({ type: 'snapshot', png: await canvas.convertToBlob({ type: 'image/png' }) });
        break;
      }
      case 'spots': {
        const spots = {} as Record<LineKey, [number, number]>;
        LINE_KEYS.forEach((k, i) => {
          const [x, y] = project(current.anchors[i]!);
          spots[k] = [(x / W) * 100, (y / H) * 100];
        });
        post({ type: 'spots', spots });
        break;
      }
    }
  };
  for (const m of queue.splice(0)) void handle(m);
  kick();
}

let handle: ((m: ToWorker) => Promise<void>) | null = null;
const queue: ToWorker[] = [];

self.addEventListener('message', (e: MessageEvent<ToWorker>) => {
  const m = e.data;
  if (m.type === 'init') {
    start(m).catch((err: unknown) => post({ type: 'fail', reason: String(err) }));
  } else if (handle) void handle(m);
  else queue.push(m);
});
