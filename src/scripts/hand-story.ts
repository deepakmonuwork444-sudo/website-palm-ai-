/**
 * Home v4 hand scroll story (src/components/home/HandStory.astro).
 * Reads how far the visitor has scrolled through the beats and gives every
 * picture on the sticky stage its state: coming in (soft blur), in focus,
 * leaving (blur and drift up), or hidden. Only one hand is ever in focus.
 *
 * Lite mode (low memory, few cores, Save-Data) drops the blur, the costliest
 * part on low-end Android; reduced motion keeps only the fade. The words are
 * never touched: they are plain HTML in normal flow on every device.
 */

type Nav = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

const ENTER_FROM = -0.5;
const FOCUS_FROM = -0.1;
const FOCUS_TO = 0.15;
const LEAVE_TO = 0.6;

export interface HandState {
  opacity: number;
  blur: number;
  scale: number;
  shift: number;
}

const smooth = (t: number) => t * t * (3 - 2 * t);

/** State of one hand at distance `d` (story progress minus the hand's index). */
export function handState(d: number, last: boolean): HandState {
  if (d <= ENTER_FROM || (!last && d >= LEAVE_TO)) return { opacity: 0, blur: 0, scale: 1, shift: 0 };
  if (d < FOCUS_FROM) {
    const t = smooth((d - ENTER_FROM) / (FOCUS_FROM - ENTER_FROM));
    return { opacity: t, blur: (1 - t) * 14, scale: 0.94 + 0.06 * t, shift: (1 - t) * 24 };
  }
  if (last || d <= FOCUS_TO) return { opacity: 1, blur: 0, scale: 1, shift: 0 };
  const t = smooth((d - FOCUS_TO) / (LEAVE_TO - FOCUS_TO));
  return { opacity: 1 - t, blur: t * 18, scale: 1 + 0.05 * t, shift: -t * 36 };
}

function isLite(): boolean {
  const nav = navigator as Nav;
  if (nav.connection?.saveData) return true;
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4) return true;
  return typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4;
}

function setup(root: HTMLElement): void {
  const stage = root.querySelector<HTMLElement>('.story-stage');
  const zone = root.querySelector<HTMLElement>('.stage-hands');
  const beats = [...root.querySelectorAll<HTMLElement>('[data-beat]')];
  const hands = [...root.querySelectorAll<HTMLElement>('[data-hand]')];
  const dots = [...root.querySelectorAll<HTMLElement>('[data-dot]')];
  if (!stage || !zone || beats.length === 0 || hands.length !== beats.length) return;

  const lite = isLite();
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Below 64rem the words sit under the picture and scroll up through it.
  const stacked = window.matchMedia('(max-width: 63.99rem)');
  let frame = 0;
  let active = -1;

  const progress = (): number => {
    const anchor = stage.getBoundingClientRect().top;
    for (let index = beats.length - 1; index >= 0; index--) {
      const box = beats[index]!.getBoundingClientRect();
      if (box.top <= anchor || index === 0) {
        const fraction = (anchor - box.top) / Math.max(1, box.height);
        return Math.max(0, index + Math.min(1, fraction));
      }
    }
    return 0;
  };

  const paint = (): void => {
    frame = 0;
    const p = progress();
    const calm = still.matches;
    hands.forEach((hand, index) => {
      const s = handState(p - index, index === hands.length - 1);
      const blur = lite || calm ? 0 : s.blur;
      hand.style.opacity = s.opacity.toFixed(3);
      hand.style.visibility = s.opacity > 0.001 ? 'visible' : 'hidden';
      hand.style.transform = calm ? '' : `translate3d(0, ${s.shift.toFixed(1)}px, 0) scale(${s.scale.toFixed(3)})`;
      hand.style.filter = blur > 0.2 ? `blur(${blur.toFixed(1)}px)` : '';
    });
    fadeWords();
    const now = Math.min(dots.length - 1, Math.round(p));
    if (now !== active) {
      dots.forEach((dot, index) => dot.toggleAttribute('data-on', index === now));
      active = now;
    }
  };

  /** Phones/tablets: a beat's words fade out as they rise into the picture, so text never sits on a hand. */
  const fadeWords = (): void => {
    if (!stacked.matches) {
      beats.forEach((beat) => {
        beat.style.opacity = '';
        beat.style.pointerEvents = '';
      });
      return;
    }
    const box = zone.getBoundingClientRect();
    const gone = box.top + box.height * 0.3;
    beats.forEach((beat) => {
      const top = (beat.firstElementChild ?? beat).getBoundingClientRect().top;
      const o = Math.max(0, Math.min(1, (top - gone) / Math.max(1, box.bottom - gone)));
      beat.style.opacity = o >= 1 ? '' : o.toFixed(3);
      beat.style.pointerEvents = o < 0.05 ? 'none' : '';
    });
  };

  const request = (): void => {
    if (!frame) frame = requestAnimationFrame(paint);
  };

  let listening = false;
  const listen = (on: boolean): void => {
    if (on === listening) return;
    listening = on;
    if (on) {
      window.addEventListener('scroll', request, { passive: true });
      window.addEventListener('resize', request);
      request();
    } else {
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
    }
  };

  // Work only while the story is on screen.
  new IntersectionObserver((entries) => listen(entries.some((entry) => entry.isIntersecting))).observe(root);
  still.addEventListener('change', request);
  stacked.addEventListener('change', request);
  paint();
}

if (typeof document !== 'undefined') {
  document.querySelectorAll<HTMLElement>('[data-story]').forEach(setup);
}
