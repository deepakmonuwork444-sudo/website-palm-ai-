import { h, svg } from '../dom';

/**
 * Small render helpers shared by the tool scripts. The flag and the live
 * guide list are read from data attributes the server wrote, so the client
 * never links to a page that isn't built.
 */

/** "Cheiro, Palmistry for All (1916), …" as a small list; the first two, then "and N more books". */
export function sourceList(cites: readonly string[], max = 2): HTMLElement {
  const list = h('ul', { class: 't-sources', 'aria-label': 'Sources' });
  for (const text of cites.slice(0, max)) {
    const icon = svg('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.75', 'aria-hidden': 'true' });
    icon.append(svg('path', { d: 'M5 4.5h9.5L19 9v10.5H5z M14.5 4.5V9H19' }));
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
  const icon = svg('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.75', 'aria-hidden': 'true' });
  icon.append(svg('circle', { cx: '12', cy: '12', r: '9' }), svg('path', { d: 'M12 11v5.5M12 7.6v.2', 'stroke-linecap': 'round' }));
  return icon;
}
