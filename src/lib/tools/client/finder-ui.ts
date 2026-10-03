import { trackToolUse } from '../analytics';
import { focusHeading, h, watchStoreClicks, whenVisible } from '../dom';
import { evaluate, type Answers, type LineFinder, type LineRule } from '../finder';
import type { ToolId } from '../registry';
import { citeText } from '../sources';
import { nextStepBlock, sourceList } from './render';

const LINE_NAMES = { heart: 'heart line', head: 'head line', life: 'life line', fate: 'fate line' } as const;

function readAnswers(form: HTMLFormElement, finder: LineFinder): Answers {
  const data = new FormData(form);
  const answers: Answers = {};
  for (const question of finder.questions) {
    const value = data.get(question.id);
    if (typeof value === 'string' && value) answers[question.id] = value;
  }
  return answers;
}

function reading(rule: LineRule): HTMLElement {
  const tradition = rule.tradition === 'indian' ? 'Indian book' : 'Western books';
  return h(
    'div',
    { class: 't-reading', 'data-rule': rule.id },
    h('span', { class: 't-trad', text: tradition }),
    h('p', { class: 't-reading-text', text: rule.meaning }),
    rule.caveat ? h('p', { class: 't-caveat', text: rule.caveat }) : null,
    sourceList(rule.cites.map(citeText)),
  );
}

/** Wires one line finder page. Answers never leave the page and never change the URL. */
export function mountFinder(finder: LineFinder, tool: ToolId): void {
  const root = document.querySelector<HTMLElement>('[data-finder]');
  const form = root?.querySelector<HTMLFormElement>('form');
  const out = root?.querySelector<HTMLElement>('[data-result]');
  const status = root?.querySelector<HTMLElement>('[data-status]');
  if (!root || !form || !out) return;
  watchStoreClicks(`tool-${tool}`);

  whenVisible(root, () => {
    const exclusive = finder.exclusive;
    const syncExclusive = () => {
      if (!exclusive) return;
      const picked = readAnswers(form, finder);
      const question = finder.questions.find((q) => q.options.some((o) => o.set[exclusive.feature] === exclusive.value));
      const option = question?.options.find((o) => o.value === picked[question.id]);
      const off = option?.set[exclusive.feature] === exclusive.value;
      for (const fieldset of form.querySelectorAll<HTMLFieldSetElement>('fieldset[data-q]')) {
        if (fieldset.dataset.q !== question?.id) fieldset.disabled = off;
      }
    };

    form.addEventListener('change', () => {
      trackToolUse(tool);
      syncExclusive();
    });

    form.addEventListener('reset', () => {
      window.setTimeout(() => {
        syncExclusive();
        out.replaceChildren();
      }, 0);
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      trackToolUse(tool);
      const answers = readAnswers(form, finder);
      const result = evaluate(finder, answers);
      const heading = h('h2', { class: 't-result-title', text: `What the books say about your ${LINE_NAMES[finder.line]}` });
      const blocks: (HTMLElement | null)[] = [];

      if (result.answered === 0) {
        blocks.push(h('p', { class: 't-empty', text: 'Pick at least one answer above (anything except “Not sure”), then try again.' }));
      } else if (result.groups.length === 0) {
        blocks.push(
          h('p', {
            class: 't-empty',
            text: 'The books we use give no separate reading for what you picked. That is usual for the ordinary form of a line. Try another question above.',
          }),
        );
      } else {
        blocks.push(
          h('p', {
            class: 't-result-lead',
            text: 'Traditional meanings from classical palmistry books, for the shape you picked. They describe tendencies, not your future.',
          }),
        );
        for (const group of result.groups) {
          const title = group.features.length > 1 ? `Taken together: ${group.evidence.join(' + ').toLowerCase()}` : group.evidence.join(', ');
          blocks.push(
            h(
              'section',
              { class: 't-group' },
              h('h3', { class: 't-group-title', text: title }),
              group.traditionsDiffer
                ? h('p', { class: 't-differ', text: 'Books from different traditions read this differently. Both are shown.' })
                : null,
              ...group.readings.map(reading),
              ...group.notes.map((note) =>
                h('div', { class: 't-reading' }, h('p', { class: 't-reading-text', text: note.text }), sourceList(note.cites.map(citeText))),
              ),
            ),
          );
        }
      }
      if (finder.line === 'fate' && answers.visible === 'none') {
        blocks.push(h('p', { class: 't-empty', text: 'Having no fate line is common, and it is not a bad sign.' }));
      }
      if (finder.line === 'life') {
        blocks.push(h('p', { class: 't-empty', text: 'Length is never read as lifespan, here or in the app.' }));
      }
      blocks.push(nextStepBlock());
      out.replaceChildren(heading, ...blocks.filter((b): b is HTMLElement => b !== null));
      const count = result.groups.reduce((n, g) => n + g.readings.length + g.notes.length, 0);
      if (status) status.textContent = count ? `${count} traditional meanings shown below.` : 'No meanings to show for these answers.';
      focusHeading(heading);
    });
  });
}
