import { h, svg } from '../dom';

/**
 * Small render helpers shared by the tool scripts. The flag and the live
 * guide list are read from data attributes the server wrote, so the client
 * never links to a page that isn't built.
 */

/**
 * Two icons from the site set (src/lib/icons.ts: document, info), drawn here
 * with DOM calls so the tool scripts don't bundle the whole set. Same drawings.
 */
function iconEl(...parts: SVGElement[]): SVGSVGElement {
  const icon = svg('svg', { viewBox: '0 0 24 24', fill: 'currentColor', 'stroke-width': '2.2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true', focusable: 'false' });
  icon.append(...parts);
  return icon;
}
function soft(...parts: SVGElement[]): SVGGElement {
  const group = svg('g', { opacity: '.4' });
  group.append(...parts);
  return group;
}
const documentIcon = (): SVGSVGElement =>
  iconEl(
    soft(svg('path', { d: 'M6.8 2.4h7.4l5.4 5.4v11a2.8 2.8 0 0 1-2.8 2.8H6.8A2.8 2.8 0 0 1 4 18.8V5.2a2.8 2.8 0 0 1 2.8-2.8Z' })),
    svg('path', { d: 'M14.2 2.4v3.8a1.6 1.6 0 0 0 1.6 1.6h3.8Z' }),
    svg('path', { d: 'M8 12.2h7.6M8 15.6h7.6M8 19h4.6', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }),
  );

/** "Cheiro, Palmistry for All (1916), …" as a small list; the first two, then "and N more books". */
export function sourceList(cites: readonly string[], max = 2): HTMLElement {
  const list = h('ul', { class: 't-sources', 'aria-label': 'Sources' });
  for (const text of cites.slice(0, max)) {
    const icon = documentIcon();
    list.append(h('li', { class: 't-source' }, icon, h('span', { text: text })));
  }
  if (cites.length > max) {
    const more = cites.length - max;
    list.append(h('li', { class: 't-more', text: `and ${more} more ${more === 1 ? 'book' : 'books'}` }));
  }
  return list;
}

/** True when the page was built with the live web reading (data-reading-live on <main> content). */
export function readingLive(): boolean {
  return document.querySelector('[data-tool-page]')?.getAttribute('data-reading-live') === 'true';
}

/** "See your real line": the free reading when it is live, otherwise the app page. */
export function nextStepBlock(): HTMLElement {
  const live = readingLive();
  return h(
    'div',
    { class: 't-next' },
    h('p', { class: 'font-bold', text: 'See your real line' }),
    h('p', {
      text: live
        ? 'Take one photo and see your own lines traced, with what the books say about each one.'
        : 'Our Android app traces your own lines on your photo. The free web reading on this site opens soon.',
    }),
    h(
      'p',
      {},
      h('a', { class: 'text-link', href: live ? '/#read' : '/app/', text: live ? 'Read my palm free' : 'Palm reading app for Android' }),
    ),
  );
}

/** Live guide paths, written by the server as a comma list. */
export function liveGuides(root: HTMLElement): Set<string> {
  return new Set((root.dataset.liveGuides ?? '').split(',').filter(Boolean));
}

/** The small info icon used in notes. */
export function infoIcon(): SVGSVGElement {
  return iconEl(
    soft(svg('circle', { cx: '12', cy: '12', r: '9.8' })),
    svg('rect', { x: '10.85', y: '10.4', width: '2.3', height: '7.2', rx: '1.15' }),
    svg('circle', { cx: '12', cy: '7.4', r: '1.45' }),
  );
}
