/**
 * Home hero (src/components/home/Hero3D.astro): decides whether the live 3D
 * hand may replace the poster, and loads it (three.js, a separate chunk) only
 * after the page has loaded, the browser is idle and the hero is on screen.
 *
 * The poster stays (and nothing heavy downloads) on Save-Data, 2G, lite
 * devices (4 cores or fewer, 4 GB memory or less: the same rule as
 * showroom.ts), without WebGL 2, or if anything fails. Reduced motion still
 * gets the hand, standing still; it moves only when dragged.
 */
type Nav = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean; effectiveType?: string } };

interface TestHooks {
  keep?: boolean;
  posterOnly?: boolean;
  ready?: boolean;
  failed?: boolean;
}

function allowed(): boolean {
  const nav = navigator as Nav;
  if (!('WebGL2RenderingContext' in window) || !('IntersectionObserver' in window) || !('ResizeObserver' in window)) return false;
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

function setup(stage: HTMLElement): void {
  const frame = stage.querySelector<HTMLElement>('[data-hero3d-frame]');
  if (!frame || !allowed()) return;
  const hooks = ((window as unknown as { __hero3d?: TestHooks }).__hero3d ??= {});
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hover = matchMedia('(hover: hover) and (pointer: fine)').matches;

  let scene: { setVisible(v: boolean): void; dispose(): void } | null = null;
  let onScreen = true;
  const load = async (): Promise<void> => {
    try {
      const { mountHero3D } = await import('./hero-3d-scene');
      scene = await mountHero3D(frame, {
        still,
        hover,
        keep: hooks.keep === true,
        posterOnly: hooks.posterOnly === true,
        onReady: () => {
          stage.dataset.live = '';
          hooks.ready = true;
        },
        onFail: () => {
          delete stage.dataset.live;
          hooks.failed = true;
          // Let the canvas fade out over the poster, then free the GPU.
          setTimeout(() => scene?.dispose(), 800);
        },
      });
      scene.setVisible(onScreen && !document.hidden);
    } catch {
      hooks.failed = true;
    }
  };

  whenIdle(() => {
    let started = false;
    new IntersectionObserver(
      (entries) => {
        onScreen = entries.some((entry) => entry.isIntersecting);
        if (onScreen && !started) {
          started = true;
          void load();
        }
        scene?.setVisible(onScreen && !document.hidden);
      },
      { rootMargin: '120px 0px' },
    ).observe(stage);
    document.addEventListener('visibilitychange', () => scene?.setVisible(onScreen && !document.hidden));
  });
}

document.querySelectorAll<HTMLElement>('[data-hero3d]').forEach(setup);
