/**
 * Tiny browser helpers shared by the tool scripts (no framework: rule-based
 * tools stay within the 10–20 KB JS budget, DESIGN_SYSTEM.md §11).
 * Text is always set with textContent — never HTML — so rule or user text can
 * never inject markup.
 */

import { trackStoreClick, currentDevice } from './analytics';

type Child = Node | string | null | undefined | false;

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | boolean | undefined> = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === false) continue;
    if (key === 'class') el.className = String(value);
    else if (key === 'text') el.textContent = String(value);
    else el.setAttribute(key, value === true ? '' : String(value));
  }
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    el.append(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return el;
}

/** Run `fn` when the element is near the viewport, then once the browser is idle ("hydrate on visible"). */
export function whenVisible(el: Element, fn: () => void): void {
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
      .requestIdleCallback;
    if (idle) idle(fn, { timeout: 600 });
    else window.setTimeout(fn, 1);
  };
  if (!('IntersectionObserver' in window)) {
    run();
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        run();
      }
    },
    { rootMargin: '200px' },
  );
  observer.observe(el);
  // A user who taps before the observer fires still gets a working tool.
  el.addEventListener('pointerdown', run, { once: true });
  el.addEventListener('focusin', run, { once: true });
}

/** Moves focus to a result heading without scrolling past it twice. */
export function focusHeading(el: HTMLElement | null): void {
  if (!el) return;
  el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

/** Store-button clicks on a tool page → the no-op `store_click` hook. */
export function watchStoreClicks(page: string): void {
  document.addEventListener('click', (event) => {
    const link = (event.target as Element | null)?.closest?.('[data-store-link]');
    if (!link) return;
    const placement =
      link.closest('[data-placement]')?.getAttribute('data-placement') ?? (link.closest('footer') ? 'footer' : 'page');
    trackStoreClick(page, placement, currentDevice(document.documentElement, window.matchMedia('(pointer: fine)').matches));
  });
}

/** An SVG element (namespace-aware). */
export function svg<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string> = {}): SVGElementTagNameMap[K] {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  return el;
}
