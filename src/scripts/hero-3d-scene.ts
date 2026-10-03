/**
 * Home hero 3D hand (src/components/home/Hero3D.astro), loaded on demand by
 * src/scripts/hero-3d.ts. A porcelain hand, palm to the viewer, with the four
 * main lines lit in the site's line colours. It floats and sways slowly; the
 * visitor can turn it with a finger or the mouse (horizontal drag; vertical
 * swipes still scroll the page: touch-action pan-y on the canvas).
 *
 * The model (public/models/hero-hand/hand-v1.glb) is an AI-generated mesh
 * (Higgsfield, Hunyuan3D v3), simplified to 32k triangles and quantized
 * (KHR_mesh_quantization: no decoder, no wasm, so the page CSP stays strict).
 *
 * The lines are not in the model: they are a small distance field built here
 * from points traced on a front render of the mesh, projected onto the palm
 * in the shader. So the glow stays sharp at any size and each line can carry
 * a travelling light pulse. Nothing heavy runs on phones: no post-processing,
 * no transmission, DPR capped, the loop stops off screen and when the tab is
 * hidden, and a slow device falls back to the poster.
 */
import {
  NeutralToneMapping,
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DataTexture,
  DirectionalLight,
  Group,
  HemisphereLight,
  LinearFilter,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  Points,
  PointsMaterial,
  RGBAFormat,
  SRGBColorSpace,
  Scene,
  Box3,
  Vector3,
  WebGLRenderer,
  type WebGLProgramParametersWithUniforms,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export const MODEL_URL = '/models/hero-hand/hand-v1.glb';

/**
 * The four lines, traced on a 600 x 800 px orthographic front render of the
 * normalised hand (2 units tall; the frame is 1.8 x 2.4 units). Right hand,
 * palm to the viewer: the thumb is on the left.
 */
const LINES: { color: number; px: [number, number][] }[] = [
  // Heart: from the little-finger edge to between the index and middle fingers.
  { color: 0xff4d5e, px: [[448, 423], [410, 414], [372, 404], [340, 388], [314, 370], [298, 354]] },
  // Head: from the thumb side across the palm, sloping gently down.
  { color: 0x4c8dff, px: [[226, 373], [252, 378], [281, 395], [311, 416], [345, 437], [382, 459]] },
  // Life: round the ball of the thumb to the wrist.
  { color: 0x2fd06a, px: [[228, 382], [250, 420], [266, 465], [270, 510], [264, 552]] },
  // Fate: up the middle of the palm from the wrist.
  { color: 0xb26bff, px: [[332, 556], [329, 505], [325, 455], [320, 408]] },
];
const toHand = ([x, y]: [number, number]): [number, number] => [(x / 600 - 0.5) * 1.8, (0.5 - y / 800) * 2.4];

/** The palm area the line field covers, in hand units. */
const RECT = { x: -0.3, y: -0.56, w: 0.84, h: 0.8 };
const FIELD = 256;
const MAX_D = 0.07;

// Pose and motion.
const BASE_YAW = -0.22;
const BASE_PITCH = -0.1;
const BASE_ROLL = 0.07;
const BASE_Y = 0.06;
const PULSE_START = 0.6;
const PULSE_EACH = 1.5;
const PULSE_GAP = 1.05;
const PULSE_CYCLE = 9;

export interface Hero3DOptions {
  /** prefers-reduced-motion: no float, sway, pulse or drifting dust; drag still works. */
  still: boolean;
  /** Fine hover pointer: the hand leans a little toward the pointer. */
  hover: boolean;
  /** Called once the first frame is on screen (the poster can go). */
  onReady: () => void;
  /** Called when 3D gives up (context lost, too slow): the poster comes back. */
  onFail: () => void;
  /** Test hooks: keep running on slow software GL; render a still frame only. */
  keep?: boolean;
  posterOnly?: boolean;
}

export interface Hero3D {
  setVisible(visible: boolean): void;
  dispose(): void;
}

/** Catmull-Rom through the traced points, as a dense polyline with arc-length progress. */
function densify(points: [number, number][], steps = 10): { x: number; y: number; p: number }[] {
  const pts = points.map(toHand);
  const out: { x: number; y: number; p: number }[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[Math.min(pts.length - 1, i + 2)]!;
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push({ x: f(p0[0], p1[0], p2[0], p3[0]), y: f(p0[1], p1[1], p2[1], p3[1]), p: 0 });
    }
  }
  const last = pts[pts.length - 1]!;
  out.push({ x: last[0], y: last[1], p: 0 });
  let total = 0;
  for (let i = 1; i < out.length; i++) {
    total += Math.hypot(out[i]!.x - out[i - 1]!.x, out[i]!.y - out[i - 1]!.y);
    out[i]!.p = total;
  }
  for (const pt of out) pt.p /= total || 1;
  return out;
}

/**
 * The line field: R = closeness to the nearest line (1 on it, 0 at MAX_D and
 * beyond), G = progress along that line (0..1), B = which line (0, 85, 170, 255).
 */
export function buildLineField(size = FIELD): Uint8Array {
  const data = new Uint8Array(size * size * 4);
  const lines = LINES.map((line) => densify(line.px));
  const best = new Float32Array(size * size).fill(MAX_D);
  for (let i = 0; i < size * size; i++) data[i * 4 + 3] = 255;
  lines.forEach((poly, id) => {
    const xs = poly.map((p) => p.x);
    const ys = poly.map((p) => p.y);
    const x0 = Math.max(0, Math.floor(((Math.min(...xs) - MAX_D - RECT.x) / RECT.w) * (size - 1)));
    const x1 = Math.min(size - 1, Math.ceil(((Math.max(...xs) + MAX_D - RECT.x) / RECT.w) * (size - 1)));
    const y0 = Math.max(0, Math.floor(((Math.min(...ys) - MAX_D - RECT.y) / RECT.h) * (size - 1)));
    const y1 = Math.min(size - 1, Math.ceil(((Math.max(...ys) + MAX_D - RECT.y) / RECT.h) * (size - 1)));
    for (let j = y0; j <= y1; j++) {
      const py = RECT.y + (j / (size - 1)) * RECT.h;
      for (let i = x0; i <= x1; i++) {
        const px = RECT.x + (i / (size - 1)) * RECT.w;
        let d = MAX_D;
        let prog = 0;
        for (let k = 0; k < poly.length - 1; k++) {
          const a = poly[k]!;
          const b = poly[k + 1]!;
          const vx = b.x - a.x;
          const vy = b.y - a.y;
          const len2 = vx * vx + vy * vy || 1e-9;
          const t = Math.max(0, Math.min(1, ((px - a.x) * vx + (py - a.y) * vy) / len2));
          const dd = Math.hypot(px - a.x - vx * t, py - a.y - vy * t);
          if (dd < d) {
            d = dd;
            prog = a.p + (b.p - a.p) * t;
          }
        }
        const index = j * size + i;
        if (d < best[index]!) {
          best[index] = d;
          data[index * 4] = Math.round((1 - d / MAX_D) * 255);
          data[index * 4 + 1] = Math.round(prog * 255);
          data[index * 4 + 2] = id * 85;
        }
      }
    }
  });
  return data;
}

/** Where each line's light pulse is at time t (-1 = off). */
export function pulseAt(t: number, line: number): number {
  const local = ((t - PULSE_START) % PULSE_CYCLE) - line * PULSE_GAP;
  if (t < PULSE_START || local < 0 || local > PULSE_EACH) return -1;
  return -0.15 + (local / PULSE_EACH) * 1.3;
}

const yieldToMain = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function dustTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.55)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export async function mountHero3D(frame: HTMLElement, options: Hero3DOptions): Promise<Hero3D> {
  const coarse = matchMedia('(pointer: coarse)').matches || frame.clientWidth < 520;
  let dprCap = coarse ? 1.5 : 1.75;
  const canvas = document.createElement('canvas');
  canvas.className = 'h3-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: !!options.posterOnly });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 0.66;

  const scene = new Scene();
  const camera = new PerspectiveCamera(26, 1, 0.1, 50);
  camera.position.set(0, 0.02, 5.35);
  camera.lookAt(0, 0, 0);

  // Light (natural look, 2026-10-02; was key 2.4, violet rim 4.2, blue rim 2.2, fill 0.12, roughness 0.44,
  // fresnel 0.8, dust on): one warm key, two quiet neutral rims, a soft fill, a matte surface, no dust.
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  scene.environment = pmrem.fromScene(room, 0.04).texture;
  room.dispose();
  pmrem.dispose();
  const key = new DirectionalLight(0xfff0dc, 2.6);
  key.position.set(-2.6, 3.2, 3);
  const rimViolet = new DirectionalLight(0xd8d0f0, 0.9);
  rimViolet.position.set(3.2, 1.6, -2.6);
  const rimBlue = new DirectionalLight(0xd0dcf0, 0.5);
  rimBlue.position.set(-3.4, -0.6, -2.2);
  scene.add(key, rimViolet, rimBlue, new HemisphereLight(0xf2ece0, 0x2a2440, 0.45));
  await yieldToMain();

  const gltf = await new GLTFLoader().loadAsync(MODEL_URL);
  await yieldToMain();

  // Normalise: centre the mesh, 2 units tall, palm facing +z (the model already faces +z).
  const model = gltf.scene;
  const box = new Box3().setFromObject(model);
  const size = box.getSize(new Vector3());
  const hand = new Group();
  const inner = new Group();
  inner.scale.setScalar(2 / Math.max(size.x, size.y, size.z));
  model.position.sub(box.getCenter(new Vector3()));
  inner.add(model);
  hand.add(inner);
  scene.add(hand);
  hand.updateMatrixWorld(true);

  const field = new DataTexture(buildLineField(), FIELD, FIELD, RGBAFormat);
  field.magFilter = LinearFilter;
  field.minFilter = LinearFilter;
  field.needsUpdate = true;
  await yieldToMain();

  const uniforms = {
    uLines: { value: field },
    uRect: { value: [RECT.x, RECT.y, RECT.w, RECT.h] },
    uLineColor: { value: LINES.map((line) => new Color(line.color)) },
    uPulse: { value: [-1, -1, -1, -1] },
    uRim: { value: new Color(0x8e74ff) },
    uRimWarm: { value: new Color(0xf5c982) },
    uMeshToHand: { value: new Matrix4() },
  };
  const material = new MeshStandardMaterial({ color: 0xded4d3, roughness: 0.72, metalness: 0, envMapIntensity: 0.06, transparent: true });
  material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform mat4 uMeshToHand;\nvarying vec3 vHandPos;\nvarying vec3 vHandNormal;')
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvHandPos = (uMeshToHand * vec4(position, 1.0)).xyz;\nvHandNormal = normalize(mat3(uMeshToHand) * objectNormal);',
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
uniform sampler2D uLines; uniform vec4 uRect; uniform vec3 uLineColor[4]; uniform float uPulse[4]; uniform vec3 uRim; uniform vec3 uRimWarm;
varying vec3 vHandPos; varying vec3 vHandNormal;`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
// The wrist sinks into shadow and dissolves into the light below it.
float wrist = smoothstep(-0.84, -0.4, vHandPos.y);
diffuseColor.rgb *= 0.3 + 0.7 * wrist;
diffuseColor.a *= wrist;`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
{
  vec2 luv = (vHandPos.xy - uRect.xy) / uRect.zw;
  float facing = smoothstep(0.18, 0.62, normalize(vHandNormal).z);
  if (facing > 0.0 && luv.x > 0.0 && luv.y > 0.0 && luv.x < 1.0 && luv.y < 1.0) {
    vec4 L = texture2D(uLines, luv);
    float d = (1.0 - L.r) * ${MAX_D.toFixed(3)};
    float aa = max(fwidth(d), 0.0006);
    // Lines taper to a point at both ends, like real creases.
    float taper = smoothstep(0.0, 0.12, L.g) * smoothstep(1.0, 0.86, L.g);
    float w = 0.0072 * (0.35 + 0.65 * taper);
    float core = 1.0 - smoothstep(w - aa, w + aa, d);
    float glow = exp(-d * d / 0.0014) * step(0.004, L.r) * (0.4 + 0.6 * taper);
    float id = floor(L.b * 3.0 + 0.5);
    vec3 c = id < 0.5 ? uLineColor[0] : id < 1.5 ? uLineColor[1] : id < 2.5 ? uLineColor[2] : uLineColor[3];
    float pos = id < 0.5 ? uPulse[0] : id < 1.5 ? uPulse[1] : id < 2.5 ? uPulse[2] : uPulse[3];
    float k = pos < -0.5 ? 0.0 : exp(-pow((L.g - pos) * 6.5, 2.0));
    vec3 hot = mix(c, vec3(1.0), 0.18 + 0.5 * k);
    // Inlaid light: a saturated core, the porcelain around it tinted by the glow.
    diffuseColor.rgb = mix(diffuseColor.rgb, c, clamp(core + glow * 0.08, 0.0, 1.0) * facing);
    totalEmissiveRadiance += (hot * core * (0.45 + 1.2 * k) + c * glow * (0.04 + 0.3 * k)) * facing;
  }
}`,
      )
      .replace(
        '#include <opaque_fragment>',
        `// Rim light: the edges catch warm gold on the key side and violet on the far side.
float fres = pow(1.0 - saturate(dot(normal, normalize(vViewPosition))), 2.4);
outgoingLight += mix(uRim, uRimWarm, smoothstep(0.5, -0.5, normal.x)) * fres * 0.15;
#include <opaque_fragment>`,
      );
  };
  model.traverse((object) => {
    if ((object as Mesh).isMesh) {
      const mesh = object as Mesh;
      mesh.material = material;
      uniforms.uMeshToHand.value.copy(hand.matrixWorld).invert().multiply(mesh.matrixWorld);
    }
  });

  // Dust motes: a few dozen soft points drifting up through the light.
  const DUST = coarse ? 42 : 70;
  const dustPos = new Float32Array(DUST * 3);
  const dustCol = new Float32Array(DUST * 3);
  const dustSeed = new Float32Array(DUST);
  const tints = [new Color(0xf5d98b), new Color(0xb9a4ff), new Color(0xffffff)];
  for (let i = 0; i < DUST; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 3.4;
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 2.8;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 2 - 0.2;
    dustSeed[i] = Math.random() * 100;
    const tint = tints[i % 3]!;
    dustCol.set([tint.r, tint.g, tint.b], i * 3);
  }
  const dustBase = dustCol.slice();
  const dustGeometry = new BufferGeometry();
  dustGeometry.setAttribute('position', new BufferAttribute(dustPos, 3));
  dustGeometry.setAttribute('color', new BufferAttribute(dustCol, 3));
  const dustTex = dustTexture();
  const dust = new Points(
    dustGeometry,
    new PointsMaterial({ size: 0.075, map: dustTex, vertexColors: true, transparent: true, opacity: 0.75, depthWrite: false, blending: AdditiveBlending }),
  );
  // Natural look: the dust motes stay built (reversible) but hidden.
  dust.visible = false;
  scene.add(dust);

  const resize = (): boolean => {
    if (options.posterOnly) {
      // The poster export (research-tools/hero-poster.mjs): one fixed 1200 px square.
      renderer.setPixelRatio(1);
      renderer.setSize(1200, 1200, false);
      return true;
    }
    const side = Math.round(frame.clientWidth);
    if (!side) return false;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
    renderer.setSize(side, side, false);
    return true;
  };
  resize();
  frame.appendChild(canvas);
  // Compile shaders off the main thread where the browser can; otherwise now, before the first frame.
  if (renderer.extensions.has('KHR_parallel_shader_compile')) await renderer.compileAsync(scene, camera);
  else renderer.compile(scene, camera);
  await yieldToMain();

  // ---- motion state ----
  let time = 0;
  let last = 0;
  let raf = 0;
  let visible = true;
  let yaw = 0; // drag offset
  let pitch = 0;
  let velocity = 0;
  let dragging = false;
  let released = -1e9;
  let hoverYaw = 0;
  let hoverPitch = 0;
  let targetHoverYaw = 0;
  let targetHoverPitch = 0;
  let lastX = 0;
  let lastY = 0;
  let lastMoveAt = 0;
  let ready = false;
  let failed = false;
  const samples: number[] = [];
  let lowered = false;
  let scrolledAt = -1e9;
  const onScroll = (): void => {
    scrolledAt = performance.now();
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  const pose = (): void => {
    const sway = options.still ? 0 : Math.sin(time * 0.42) * 0.2;
    const nod = options.still ? 0 : Math.sin(time * 0.31 + 1.2) * 0.035;
    const float = options.still ? 0 : Math.sin(time * 0.85) * 0.035;
    hand.rotation.set(BASE_PITCH + nod + pitch + hoverPitch, BASE_YAW + sway + yaw + hoverYaw, BASE_ROLL, 'YXZ');
    hand.position.y = BASE_Y + float;
    for (let i = 0; i < 4; i++) uniforms.uPulse.value[i] = options.still ? -1 : pulseAt(time, i);
  };

  const drift = (dt: number): void => {
    if (options.still) return;
    for (let i = 0; i < DUST; i++) {
      let y = dustPos[i * 3 + 1]! + dt * (0.05 + (dustSeed[i]! % 1) * 0.06);
      if (y > 1.5) y = -1.4;
      dustPos[i * 3 + 1] = y;
      dustPos[i * 3] = dustPos[i * 3]! + Math.sin(time * 0.5 + dustSeed[i]!) * dt * 0.02;
      const twinkle = 0.45 + 0.55 * Math.max(0, Math.sin(time * 1.3 + dustSeed[i]! * 7));
      // Fade out at the top and bottom of the volume.
      const edge = Math.min(1, (1.5 - y) * 2, (y + 1.4) * 2);
      for (let c = 0; c < 3; c++) dustCol[i * 3 + c] = dustBase[i * 3 + c]! * twinkle * Math.max(0, edge);
    }
    dustGeometry.attributes.position!.needsUpdate = true;
    dustGeometry.attributes.color!.needsUpdate = true;
  };

  const settled = (): boolean =>
    !dragging && Math.abs(yaw) < 0.0015 && Math.abs(pitch) < 0.0015 && Math.abs(velocity) < 0.001 &&
    Math.abs(hoverYaw - targetHoverYaw) < 0.001 && Math.abs(hoverPitch - targetHoverPitch) < 0.001;

  const step = (now: number): void => {
    raf = 0;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    // While the page scrolls the hand holds still (no draws, time paused): the GPU is left to the scroll.
    if (ready && !dragging && now - scrolledAt < 160) {
      if (visible && !failed) raf = requestAnimationFrame(step);
      return;
    }
    if (!options.still) time += dt;
    if (!dragging) {
      yaw += velocity * dt;
      velocity *= Math.exp(-dt * 3.5);
      // After a short hold the hand turns back to show its palm (the shortest way round).
      if (now - released > 1400) {
        yaw = Math.atan2(Math.sin(yaw), Math.cos(yaw));
        yaw *= Math.exp(-dt * 1.8);
        pitch *= Math.exp(-dt * 1.8);
      }
    }
    const ease = 1 - Math.exp(-dt * 3);
    hoverYaw += (targetHoverYaw - hoverYaw) * ease;
    hoverPitch += (targetHoverPitch - hoverPitch) * ease;
    pose();
    drift(dt);
    renderer.render(scene, camera);
    if (!ready) {
      ready = true;
      options.onReady();
    } else if (!options.keep) watchSpeed(dt);
    if (visible && !failed && (!options.still || !settled())) raf = requestAnimationFrame(step);
  };

  /** A device that cannot hold ~22 fps first drops to DPR 1, then hands back to the poster. */
  const watchSpeed = (dt: number): void => {
    if (document.hidden || dragging) return;
    samples.push(dt);
    if (samples.length < 50) return;
    const sorted = [...samples].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)]!;
    samples.length = 0;
    if (median < 0.045) return;
    if (!lowered) {
      lowered = true;
      dprCap = 1;
      resize();
      return;
    }
    fail();
  };

  const kick = (): void => {
    if (!raf && visible && !failed) {
      last = 0;
      raf = requestAnimationFrame(step);
    }
  };

  const fail = (): void => {
    if (failed) return;
    failed = true;
    cancelAnimationFrame(raf);
    raf = 0;
    options.onFail();
  };

  // ---- input ----
  canvas.addEventListener('pointerdown', (event) => {
    dragging = true;
    velocity = 0;
    lastX = event.clientX;
    lastY = event.clientY;
    lastMoveAt = performance.now();
    canvas.setPointerCapture?.(event.pointerId);
    frame.dataset.touched = '';
    kick();
  });
  canvas.addEventListener('pointermove', (event) => {
    if (dragging) {
      const now = performance.now();
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      const unit = 4.2 / Math.max(240, frame.clientWidth);
      yaw += dx * unit;
      velocity = (dx * unit) / Math.max(0.008, (now - lastMoveAt) / 1000);
      velocity = Math.max(-9, Math.min(9, velocity));
      // Touch: vertical movement belongs to page scroll. Mouse: a little tilt.
      if (event.pointerType === 'mouse') pitch = Math.max(-0.45, Math.min(0.45, pitch + dy * unit * 0.6));
      lastX = event.clientX;
      lastY = event.clientY;
      lastMoveAt = now;
      kick();
    }
  });
  const end = (): void => {
    if (!dragging) return;
    dragging = false;
    released = performance.now();
    if (released - lastMoveAt > 80) velocity = 0;
    kick();
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('lostpointercapture', end);
  if (options.hover && !options.still) {
    frame.parentElement?.addEventListener('pointermove', (event) => {
      if (dragging || event.pointerType !== 'mouse') return;
      const box = frame.getBoundingClientRect();
      targetHoverYaw = Math.max(-1, Math.min(1, (event.clientX - box.left) / box.width - 0.5)) * 0.3;
      targetHoverPitch = Math.max(-1, Math.min(1, (event.clientY - box.top) / box.height - 0.5)) * 0.16;
      kick();
    });
    frame.parentElement?.addEventListener('pointerleave', () => {
      targetHoverYaw = 0;
      targetHoverPitch = 0;
      kick();
    });
  }

  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    fail();
  });
  const observer = new ResizeObserver(() => {
    if (resize() && (ready || options.posterOnly)) {
      pose();
      renderer.render(scene, camera);
    }
  });
  observer.observe(frame);

  if (options.posterOnly) {
    pose();
    renderer.render(scene, camera);
    options.onReady();
  } else {
    kick();
  }

  return {
    setVisible(next: boolean) {
      visible = next;
      if (next) kick();
      else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    dispose() {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      dustGeometry.dispose();
      dustTex.dispose();
      field.dispose();
      material.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
