import { trackToolUse } from '../analytics';
import { focusHeading, h, watchStoreClicks, whenVisible } from '../dom';
import { citeText } from '../sources';
import { missing, whichHand, type WhichHandAnswers } from '../which-hand';
import { infoIcon, sourceList } from './render';

const TOOL = 'which-hand' as const;

/** Which-hand quiz: questions appear as they become relevant; the result shows as soon as it can. */
export function mountWhichHand(): void {
  const root = document.querySelector<HTMLElement>('[data-which-hand]');
  const form = root?.querySelector<HTMLFormElement>('form');
  const out = root?.querySelector<HTMLElement>('[data-result]');
  const status = root?.querySelector<HTMLElement>('[data-status]');
  if (!root || !form || !out) return;
  watchStoreClicks(`tool-${TOOL}`);

  whenVisible(root, () => {
    const fields = [...form.querySelectorAll<HTMLFieldSetElement>('fieldset[data-q]')];
    let shown = '';

    const answers = (): WhichHandAnswers => {
      const data = new FormData(form);
      const get = (key: string) => {
        const value = data.get(key);
        return typeof value === 'string' && value ? value : undefined;
      };
      const a: WhichHandAnswers = {};
      const tradition = get('tradition');
      const writing = get('writing');
      const goal = get('goal');
      const person = get('person');
      if (tradition === 'writing' || tradition === 'indian') a.tradition = tradition;
      if (writing === 'right' || writing === 'left' || writing === 'both') a.writing = writing;
      if (goal === 'now' || goal === 'born' || goal === 'both') a.goal = goal;
      if (person === 'man' || person === 'woman' || person === 'skip') a.person = person;
      return a;
    };

    const sync = (fromUser: boolean) => {
      const a = answers();
      const need = new Set(missing(a));
      for (const field of fields) {
        const q = field.dataset.q as keyof WhichHandAnswers;
        const relevant =
          q === 'tradition' ||
          (a.tradition === 'indian' && q === 'person') ||
          (a.tradition === 'writing' && (q === 'writing' || (q === 'goal' && a.writing !== undefined && a.writing !== 'both')));
        field.hidden = !relevant;
        field.disabled = !relevant;
      }
      const result = whichHand(a);
      if (!result) {
        out.replaceChildren();
        shown = '';
        if (status && fromUser && need.size) status.textContent = 'One more question below.';
        return;
      }
      const key = JSON.stringify(a);
      if (key === shown) return;
      shown = key;
      const heading = h('h2', { class: 't-result-title', text: result.headline });
      out.replaceChildren(
        heading,
        h('ul', { class: 't-says' }, ...result.why.map((line) => h('li', { class: 't-say', text: line }))),
        sourceList(result.cites.map(citeText)),
        h('p', { class: 't-differ' }, infoIcon(), h('span', { text: `The other view: ${result.otherView}` })),
        h(
          'div',
          { class: 't-next' },
          h('p', { class: 'font-bold', text: 'Next: check your photo of that hand' }),
          h('p', { text: 'Before a reading, make sure the photo is bright, sharp and shows the whole palm. The checker runs on your phone.' }),
          h('p', {}, h('a', { class: 'text-link', href: '/tools/palm-photo-checker/', text: 'Open the palm photo checker' })),
        ),
      );
      if (status) status.textContent = result.headline;
      if (fromUser) focusHeading(heading);
    };

    form.addEventListener('change', () => {
      trackToolUse(TOOL);
      sync(true);
    });
    form.addEventListener('submit', (event) => event.preventDefault());
    form.addEventListener('reset', () => window.setTimeout(() => sync(false), 0));
    sync(false);
  });
}
