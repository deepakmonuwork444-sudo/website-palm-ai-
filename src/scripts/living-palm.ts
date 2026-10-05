/**
 * Home hero Living palm (src/components/home/LivingPalm.astro), page side.
 * Decides whether the live 3D palm may replace the poster and, only after the
 * page has loaded, the browser is idle and the hero is on screen, starts it in
 * a worker (src/scripts/living-palm-worker.ts: three.js on an OffscreenCanvas,
 * so shader compiles and uploads never block this thread). This side forwards
 * input, writes the line names beside the lines and runs the buttons.
 *
 * Devices that get no live palm (Save-Data, 2G, lite devices: 4 cores or
 * fewer or 4 GB memory or less, the same rule as showroom.ts; no OffscreenCanvas,
 * no hardware WebGL 2) keep a still photo of the same hand with its real scan
 * lines and their names. Reduced motion gets the live palm standing still, its
 * lines already drawn; it moves only when dragged.
 */
import { GOLD_INK, HANDS, LINE_INK, LINE_KEYS, extraHands, type HandShape, type LineKey } from './living-palm-hands';
import type { FromWorker, ToWorker } from './living-palm-worker';

type Nav = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean; effectiveType?: string } };

/** Test hooks (research-tools/living-palm-poster.mjs, screenshots). */
interface TestHooks {
  keep?: boolean;
  shot?: boolean;
  ready?: boolean;
  failed?: boolean;
  scene?: {
    pose(yawDeg: number, pitchDeg: number): void;
    setLines(progress: number | null): void;
    snapshot(): Promise<Blob>;
    labelSpots(): Promise<Record<LineKey, [number, number]>>;
  };
}


function allowed(): boolean {
  const nav = navigator as Nav;
  if (!('IntersectionObserver' in window) || !('ResizeObserver' in window) || !('Worker' in window)) return false;
  if (!('transferControlToOffscreen' in HTMLCanvasElement.prototype)) return false;
  if (nav.connection?.saveData) return false;
  if (/(^|-)2g$/.test(nav.connection?.effectiveType ?? '')) return false;
  // deviceMemory rounds down (6 GB reports 4); the fps guard still drops weak devices to the poster.
  if ((nav.hardwareConcurrency ?? 8) < 4 || (nav.deviceMemory ?? 8) < 4) return false;
  return !document.documentElement.hasAttribute('data-lite');
}

function whenIdle(run: () => void): void {
  const idle = () => ('requestIdleCallback' in window ? requestIdleCallback(run, { timeout: 2500 }) : setTimeout(run, 400));
  if (document.readyState === 'complete') idle();
  else window.addEventListener('load', idle, { once: true });
}

/** The still hand with its lines and their names (no live 3D on this device). */
function showStill(stage: HTMLElement): void {
  if ('still' in stage.dataset) return;
  const img = stage.querySelector<HTMLImageElement>('[data-lp-lines-poster]');
  img?.closest('picture')?.querySelectorAll<HTMLSourceElement>('source[data-srcset]').forEach((s) => (s.srcset = s.dataset.srcset ?? ''));
  if (img?.dataset.srcset) img.srcset = img.dataset.srcset;
  if (img?.dataset.src) img.src = img.dataset.src;
  // Each name's place on the poster, in percent (set here: the page's CSP allows no style attributes).
  stage.querySelectorAll<HTMLElement>('[data-at]').forEach((el) => {
    const [x, y] = (el.dataset.at ?? '').split(' ');
    el.style.left = `${x}%`;
    el.style.top = `${y}%`;
    el.style.color = LINE_INK[el.dataset.lpPlabel as LineKey] ?? '';
  });
  const done = (): void => {
    stage.dataset.still = '';
  };
  if (!img || img.complete) done();
  else {
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
  }
}

function parseList(text: string | undefined): unknown {
  try {
    return JSON.parse(text ?? '[]') as unknown;
  } catch {
    return [];
  }
}

function setup(stage: HTMLElement): void {
  const frame = stage.querySelector<HTMLElement>('[data-lp-frame]');
  if (!frame) return;
  const hooks = ((window as unknown as { __livingPalm?: TestHooks }).__livingPalm ??= {});
  if (!allowed()) {
    whenIdle(() => showStill(stage));
    return;
  }
  // The first hand, then any extra hands the page lists (data-hands, from public/models/living-palm/hands.json).
  const hands: HandShape[] = [HANDS[0]!, ...extraHands(parseList(stage.dataset.hands))];
  const labels = LINE_KEYS.map((k) => frame.querySelector<HTMLElement>(`[data-lp-label="${k}"]`)!);
  const goldBtn = stage.querySelector<HTMLButtonElement>('[data-lp-gold]');
  const replayBtn = stage.querySelector<HTMLButtonElement>('[data-lp-replay]');
  const anotherBtn = stage.querySelector<HTMLButtonElement>('[data-lp-another]');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hover = matchMedia('(hover: hover) and (pointer: fine)').matches;

  let worker: Worker | null = null;
  let onScreen = true;
  let handIndex = 0;
  let failed = false;
  const send = (m: ToWorker, transfer: Transferable[] = []): void => worker?.postMessage(m, transfer);
  const waiters: { [K in FromWorker['type']]?: (m: Extract<FromWorker, { type: K }>) => void } = {};
  const ask = <K extends 'snapshot' | 'spots'>(type: K): Promise<Extract<FromWorker, { type: K }>> =>
    new Promise((resolve) => {
      (waiters as Record<string, unknown>)[type] = resolve;
      send({ type });
    });

  // ---- the names, beside the lines ----
  let fontPx = 0;
  const sizes: [number, number][] = labels.map(() => [0, 0]);
  const measure = (): void => {
    labels.forEach((el, i) => (sizes[i] = [el.offsetWidth, el.offsetHeight]));
  };
  void document.fonts?.ready.then(() => fontPx && measure());
  const paint = (gold: boolean): void => {
    LINE_KEYS.forEach((k, i) => (labels[i]!.style.color = gold ? GOLD_INK : LINE_INK[k]));
  };
  paint(false);
  let linesDone = false;
  const onFrame = (m: Extract<FromWorker, { type: 'frame' }>): void => {
    if (m.fs !== fontPx) {
      fontPx = m.fs;
      for (const el of labels) el.style.fontSize = `${m.fs}px`;
      measure();
    }
    labels.forEach((el, i) => {
      const ax = m.at[i * 2]!;
      const ay = m.at[i * 2 + 1]!;
      const align = m.align[i] ?? 'left';
      if (el.dataset.align !== align) {
        el.dataset.align = align;
        sizes[i] = [el.offsetWidth, el.offsetHeight];
      }
      const [w, h] = sizes[i]!;
      const lx = align === 'right' ? ax - w : align === 'center' ? ax - w / 2 : ax;
      el.style.transform = `translate(${lx.toFixed(1)}px, ${(ay - h / 2).toFixed(1)}px)`;
      el.classList.toggle('on', (m.on & (1 << i)) !== 0);
    });
    const done = m.on === 15;
    if (done !== linesDone) {
      linesDone = done;
      stage.toggleAttribute('data-lines-done', done);
    }
  };

  const fail = (): void => {
    if (failed) return;
    failed = true;
    delete stage.dataset.live;
    hooks.failed = true;
    showStill(stage);
    // Let the canvas fade out over the poster, then free the GPU.
    setTimeout(() => {
      worker?.terminate();
      worker = null;
      frame.querySelector('.lp-canvas')?.remove();
    }, 800);
  };

  const load = (): void => {
    const canvas = document.createElement('canvas');
    canvas.className = 'lp-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    frame.prepend(canvas);
    const box = frame.getBoundingClientRect();
    let offscreen: OffscreenCanvas;
    try {
      offscreen = canvas.transferControlToOffscreen();
      worker = new Worker(new URL('./living-palm-worker.ts', import.meta.url), { type: 'module' });
    } catch {
      fail();
      return;
    }
    worker.addEventListener('message', (e: MessageEvent<FromWorker>) => {
      const m = e.data;
      if (m.type === 'frame') onFrame(m);
      else if (m.type === 'ready') {
        stage.dataset.live = '';
        hooks.ready = true;
      } else if (m.type === 'fail') fail();
      else {
        const wait = waiters[m.type] as ((v: FromWorker) => void) | undefined;
        delete waiters[m.type];
        wait?.(m);
      }
    });
    worker.addEventListener('error', fail);
    send(
      {
        type: 'init',
        canvas: offscreen,
        hand: hands[0]!,
        w: box.width,
        h: box.height,
        dpr: window.devicePixelRatio || 1,
        small: Math.min(screen.width, screen.height) < 500,
        still,
        keep: hooks.keep === true,
        shot: hooks.shot === true,
      },
      [offscreen],
    );
    send({ type: 'visible', visible: onScreen && !document.hidden });
    new ResizeObserver(() => {
      const r = frame.getBoundingClientRect();
      send({ type: 'size', w: r.width, h: r.height });
    }).observe(frame);
    hooks.scene = {
      pose: (yaw, pitch) => send({ type: 'pose', yaw, pitch }),
      setLines: (progress) => send({ type: 'lines', progress }),
      snapshot: () => ask('snapshot').then((m) => m.png),
      labelSpots: () => ask('spots').then((m) => m.spots),
    };

    // ---- input: drag with inertia (vertical swipes still scroll: touch-action pan-y), hover lean, tilt ----
    let drag = false;
    let lx = 0;
    let ly = 0;
    canvas.addEventListener('pointerdown', (e) => {
      drag = true;
      lx = e.clientX;
      ly = e.clientY;
      canvas.setPointerCapture?.(e.pointerId);
      frame.dataset.touched = '';
      send({ type: 'drag', phase: 'down', dx: 0, dy: 0 });
    });
    canvas.addEventListener('pointermove', (e) => {
      if (drag) {
        send({ type: 'drag', phase: 'move', dx: e.clientX - lx, dy: e.pointerType === 'touch' ? 0 : e.clientY - ly });
        lx = e.clientX;
        ly = e.clientY;
      } else if (hover && !still && e.pointerType === 'mouse') {
        const r = canvas.getBoundingClientRect();
        send({ type: 'hover', x: ((e.clientX - r.left) / r.width - 0.5) * 2, y: ((e.clientY - r.top) / r.height - 0.5) * 2 });
      }
    });
    const up = (): void => {
      if (!drag) return;
      drag = false;
      send({ type: 'drag', phase: 'up', dx: 0, dy: 0 });
    };
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('lostpointercapture', up);
    canvas.addEventListener('pointerleave', () => send({ type: 'hover', x: 0, y: 0 }));
    // Phone tilt where no permission prompt is needed (Android); never on iOS (it would ask).
    type DOE = typeof DeviceOrientationEvent & { requestPermission?: unknown };
    if (!still && 'DeviceOrientationEvent' in window && typeof (DeviceOrientationEvent as DOE).requestPermission !== 'function') {
      let b0: number | null = null;
      let g0 = 0;
      window.addEventListener('deviceorientation', (e) => {
        if (e.beta == null || e.gamma == null || !onScreen) return;
        if (b0 === null) {
          b0 = e.beta;
          g0 = e.gamma;
        }
        send({ type: 'tilt', y: (e.gamma - g0) * 0.02, p: (e.beta - b0) * 0.012 });
      });
    }
    window.addEventListener('scroll', () => send({ type: 'scroll' }), { passive: true });
  };

  goldBtn?.addEventListener('click', () => {
    const next = goldBtn.getAttribute('aria-pressed') !== 'true';
    goldBtn.setAttribute('aria-pressed', String(next));
    send({ type: 'gold', gold: next });
    paint(next);
  });
  replayBtn?.addEventListener('click', () => send({ type: 'replay' }));
  if (anotherBtn && hands.length > 1) {
    anotherBtn.hidden = false;
    anotherBtn.addEventListener('click', () => {
      if (!worker || anotherBtn.disabled) return;
      handIndex = (handIndex + 1) % hands.length;
      anotherBtn.disabled = true;
      const w = worker;
      const done = (e: MessageEvent<FromWorker>): void => {
        if (e.data.type !== 'hand') return;
        anotherBtn.disabled = false;
        w.removeEventListener('message', done);
      };
      w.addEventListener('message', done);
      send({ type: 'hand', hand: hands[handIndex]! });
    });
  }

  whenIdle(() => {
    let started = false;
    new IntersectionObserver(
      (entries) => {
        onScreen = entries.some((entry) => entry.isIntersecting);
        if (onScreen && !started) {
          started = true;
          load();
        }
        send({ type: 'visible', visible: onScreen && !document.hidden });
      },
      { rootMargin: '120px 0px' },
    ).observe(stage);
    document.addEventListener('visibilitychange', () => send({ type: 'visible', visible: onScreen && !document.hidden }));
  });
}

document.querySelectorAll<HTMLElement>('[data-living-palm]').forEach(setup);
