import { trackToolUse } from '../analytics';
import { focusHeading, h, watchStoreClicks, whenVisible } from '../dom';
import { pickedSigns, type PalmSign } from '../signs';
import { citeText } from '../sources';
import { liveGuides, nextStepBlock, sourceList } from './render';

const TOOL = 'signs-checker' as const;

function card(sign: PalmSign, guides: Set<string>): HTMLElement {
  return h(
    'section',
    { class: 't-group', 'data-sign': sign.id },
    h('h3', { class: 't-group-title' }, sign.name, ' ', h('span', { lang: 'hi', class: 'script-system t-caveat', text: sign.hi })),
    h('p', { class: 't-caveat', text: sign.where }),
    h(
      'div',
      { class: 't-reading' },
      h('span', { class: 't-trad', text: 'What the books say' }),
      h('p', { class: 't-reading-text', text: sign.booksSay ?? 'No meaning is given here — see why below.' }),
    ),
    h('div', { class: 't-reading' }, h('span', { class: 't-trad', text: sign.booksSay ? 'What we leave out' : 'Why' }), h('p', { class: 't-reading-text', text: sign.leftOut })),
    sign.cites.length ? sourceList(sign.cites.map(citeText), 3) : h('p', { class: 't-more', text: 'No classical source' }),
    guides.has(sign.guide) ? h('p', {}, h('a', { class: 'text-link', href: sign.guide, text: `Read more about the ${sign.name.toLowerCase()}` })) : null,
  );
}

export function mountSigns(): void {
  const root = document.querySelector<HTMLElement>('[data-signs]');
  const form = root?.querySelector<HTMLFormElement>('form');
  const out = root?.querySelector<HTMLElement>('[data-result]');
  const status = root?.querySelector<HTMLElement>('[data-status]');
  if (!root || !form || !out) return;
  watchStoreClicks(`tool-${TOOL}`);
  const guides = liveGuides(root);

  whenVisible(root, () => {
    form.addEventListener('change', () => trackToolUse(TOOL));
    form.addEventListener('reset', () => window.setTimeout(() => out.replaceChildren(), 0));
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      trackToolUse(TOOL);
      const ids = new FormData(form).getAll('sign').filter((value): value is string => typeof value === 'string');
      const signs = pickedSigns(ids);
      const heading = h('h2', { class: 't-result-title', text: signs.length ? 'What the books say about your signs' : 'Nothing ticked yet' });
      out.replaceChildren(
        heading,
        signs.length
          ? h('p', { class: 't-result-lead', text: 'In our own words, from named books. What they promise or threaten is left out, and each card says what.' })
          : h('p', { class: 't-empty', text: 'Tick at least one sign you can clearly see, then try again. Seeing none is common.' }),
        ...signs.map((sign) => card(sign, guides)),
        nextStepBlock(),
      );
      if (status) status.textContent = signs.length ? `${signs.length} signs explained below.` : 'Tick at least one sign first.';
      focusHeading(heading);
    });
  });
}
