import { trackShareCard, trackToolUse } from '../analytics';
import { focusHeading, h, watchStoreClicks, whenVisible } from '../dom';
import {
  candidates,
  ELEMENTS,
  fingerLengthFromCm,
  MODERN_SYSTEM_NOTE,
  palmShapeFromCm,
  parseCm,
  type FingerLength,
  type PalmShape,
} from '../hand-type';
import { infoIcon } from './render';

const TOOL = 'hand-type' as const;
const PALM_TEXT: Record<PalmShape, string> = { square: 'square palm', long: 'long palm' };
const FINGER_TEXT: Record<FingerLength, string> = { short: 'short fingers', long: 'long fingers' };

export function mountHandType(): void {
  const root = document.querySelector<HTMLElement>('[data-hand-type]');
  const form = root?.querySelector<HTMLFormElement>('form');
  const out = root?.querySelector<HTMLElement>('[data-result]');
  const status = root?.querySelector<HTMLElement>('[data-status]');
  const measureNote = root?.querySelector<HTMLElement>('[data-measure-note]');
  if (!root || !form || !out) return;
  watchStoreClicks(`tool-${TOOL}`);

  whenVisible(root, () => {
    const pick = (name: string): string | null => {
      const value = new FormData(form).get(name);
      return typeof value === 'string' && value ? value : null;
    };
    const setRadio = (name: string, value: string) => {
      const input = form.querySelector<HTMLInputElement>(`input[name="${name}"][value="${value}"]`);
      if (input) input.checked = true;
    };

    const render = (fromUser: boolean) => {
      const palmRaw = pick('palm');
      const fingerRaw = pick('fingers');
      if (!palmRaw || !fingerRaw) {
        out.replaceChildren();
        return;
      }
      const palm = palmRaw === 'square' || palmRaw === 'long' ? palmRaw : null;
      const fingers = fingerRaw === 'short' || fingerRaw === 'long' ? fingerRaw : null;
      const list = candidates(palm, fingers);
      const one = list.length === 1;
      const first = ELEMENTS[list[0]!];
      const heading = h('h2', {
        class: 't-result-title',
        text: one
          ? `In the modern system, yours is ${/^[aeiou]/i.test(first.name) ? 'an' : 'a'} ${first.name.toLowerCase()}`
          : 'Your hand sits between types',
      });
      const cards = list.map((element) => {
        const info = ELEMENTS[element];
        return h(
          'section',
          { class: 't-group' },
          h('h3', { class: 't-group-title', text: info.name }),
          h('p', { class: 't-caveat', text: `${PALM_TEXT[info.palm]}, ${FINGER_TEXT[info.fingers]}` }),
          h('p', { class: 't-reading-text', text: info.summary }),
        );
      });
      const shareBtn = h('button', { type: 'button', class: 'btn btn-secondary', text: 'Share my hand type' });
      const shared = h('p', { class: 't-caveat', role: 'status' });
      shareBtn.addEventListener('click', async () => {
        const names = list.map((element) => ELEMENTS[element].name.toLowerCase()).join(' or ');
        const text = `My hand type in the four-element system: ${names}. Find yours: ${location.origin}/tools/hand-type-quiz/`;
        trackShareCard(TOOL);
        try {
          if (navigator.share) await navigator.share({ text });
          else {
            await navigator.clipboard.writeText(text);
            shared.textContent = 'Copied. Paste it into WhatsApp or any chat.';
          }
        } catch {
          // The person closed the share sheet: nothing to do.
        }
      });
      out.replaceChildren(
        heading,
        ...(one ? [] : [h('p', { class: 't-result-lead', text: 'Your answers fit more than one type, which is common. Both are shown.' })]),
        ...cards,
        h('p', { class: 't-differ' }, infoIcon(), h('span', { text: MODERN_SYSTEM_NOTE })),
        h('div', { class: 't-actions' }, shareBtn),
        shared,
      );
      if (status) status.textContent = heading.textContent ?? '';
      if (fromUser) focusHeading(heading);
    };

    form.addEventListener('change', (event) => {
      trackToolUse(TOOL);
      if ((event.target as HTMLInputElement).type === 'radio') render(true);
    });
    form.addEventListener('submit', (event) => event.preventDefault());
    form.addEventListener('reset', () =>
      window.setTimeout(() => {
        out.replaceChildren();
        if (measureNote) measureNote.textContent = '';
      }, 0),
    );

    root.querySelector('[data-measure]')?.addEventListener('click', () => {
      trackToolUse(TOOL);
      const value = (name: string) => parseCm(form.querySelector<HTMLInputElement>(`input[name="${name}"]`)?.value ?? '');
      const length = value('palm-length');
      const width = value('palm-width');
      const finger = value('finger-length');
      const palm = palmShapeFromCm(length, width);
      const fingers = fingerLengthFromCm(finger, length);
      if (!palm || !fingers) {
        if (measureNote) measureNote.textContent = 'Please enter all three measurements in centimetres, for example 10.5.';
        return;
      }
      setRadio('palm', palm.value ?? 'not-sure');
      setRadio('fingers', fingers.value ?? 'not-sure');
      const notes: string[] = [];
      notes.push(palm.value ? `Palm: ${palm.value}.` : 'Palm: between square and long.');
      notes.push(fingers.value ? `Fingers: ${fingers.value}.` : 'Fingers: between short and long.');
      if (measureNote) measureNote.textContent = `${notes.join(' ')} Your answers above have been filled in.`;
      render(true);
    });
  });
}
