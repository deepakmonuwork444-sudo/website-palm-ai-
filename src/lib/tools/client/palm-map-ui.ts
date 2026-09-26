import { trackToolUse } from '../analytics';
import { h, watchStoreClicks, whenVisible } from '../dom';
import { toPercent } from '../palm-geometry';
import { spotById, type MapSpot } from '../palm-map';
import { citeText } from '../sources';
import { liveGuides, readingLive, sourceList } from './render';

const TOOL = 'palm-map' as const;

function panelFor(spot: MapSpot, guides: Set<string>): HTMLElement[] {
  const links: HTMLElement[] = [];
  if (spot.tool) links.push(h('li', {}, h('a', { class: 'text-link', href: spot.tool, text: `Match your own ${spot.name.toLowerCase()} in the finder` })));
  if (spot.guide && guides.has(spot.guide)) links.push(h('li', {}, h('a', { class: 'text-link', href: spot.guide, text: `Read the ${spot.name.toLowerCase()} guide` })));
  const live = readingLive();
  links.push(
    h('li', {}, h('a', { class: 'text-link', href: live ? '/#read' : '/app/', text: live ? 'See it on your own palm' : 'See it on your own palm, in our app' })),
  );
  return [
    h('h2', { class: 't-map-panel-title' }, spot.name, ' ', h('span', { lang: 'hi', class: 'script-system t-map-hi', text: spot.hi })),
    h('p', { text: spot.where }),
    h('p', { class: 't-caveat', text: spot.readFor }),
    h('div', { class: 't-reading' }, h('span', { class: 't-trad', text: spot.bookLead }), h('p', { class: 't-reading-text', text: spot.book })),
    sourceList([citeText(spot.cite)]),
    h('ul', { class: 't-links' }, ...links),
  ];
}

export function mountPalmMap(): void {
  const root = document.querySelector<HTMLElement>('[data-palm-map]');
  const svgEl = root?.querySelector<SVGSVGElement>('[data-map-svg]');
  const panel = root?.querySelector<HTMLElement>('[data-panel]');
  if (!root || !svgEl || !panel) return;
  watchStoreClicks(`tool-${TOOL}`);
  const guides = liveGuides(root);

  whenVisible(root, () => {
    const buttons = [...root.querySelectorAll<HTMLButtonElement>('button[data-spot]')];
    for (const pin of root.querySelectorAll<HTMLButtonElement>('.t-pin')) {
      const { left, top } = toPercent(Number(pin.dataset.x), Number(pin.dataset.y));
      pin.style.left = `${left}%`;
      pin.style.top = `${top}%`;
      pin.hidden = false;
    }
    root.querySelector<HTMLElement>('[data-map-lists]')?.removeAttribute('hidden');

    const select = (id: string) => {
      const spot = spotById(id);
      if (!spot) return;
      trackToolUse(TOOL);
      for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.spot === id));
      svgEl.setAttribute('data-active', id);
      for (const area of svgEl.querySelectorAll<SVGElement>('[data-area]')) area.classList.toggle('is-active', area.dataset.area === id);
      panel.replaceChildren(...panelFor(spot, guides));
    };

    for (const button of buttons) button.addEventListener('click', () => select(button.dataset.spot ?? ''));
  });
}
