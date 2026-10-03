import type { Cite } from '../sources';
import { citeText } from '../sources';
import { h } from '../dom';
import { scalePosition } from '../hand/shape';
import { sourceList } from './render';

/**
 * Small result pieces shared by the photo tools: the "where your hand sits"
 * scale, a measured row, a reading card with its sources.
 */

export interface ScaleInput {
  value: number;
  min: number;
  max: number;
  /** The two cut-offs between the three zones. */
  cuts: readonly [number, number];
  labels: readonly [string, string, string];
  /** Read out in full, e.g. "Palm ratio 1.62. Square up to 1.50, long from 1.60." */
  aria: string;
}

export function scaleBar(input: ScaleInput): HTMLElement {
  const { value, min, max, cuts, labels, aria } = input;
  const a = scalePosition(cuts[0], min, max) * 100;
  const b = scalePosition(cuts[1], min, max) * 100;
  const pos = scalePosition(value, min, max) * 100;
  const track = h('div', { class: 't-scale-track' });
  const zones = [
    [0, a],
    [a, b],
    [b, 100],
  ] as const;
  zones.forEach(([from, to], i) => {
    const zone = h('span', { class: `t-scale-zone t-scale-zone-${i}` });
    zone.style.left = `${from}%`;
    zone.style.width = `${to - from}%`;
    track.append(zone);
  });
  const marker = h('span', { class: 't-scale-marker' });
  marker.style.left = `${pos}%`;
  track.append(marker);
  const names = h('div', { class: 't-scale-names', 'aria-hidden': 'true' }, ...labels.map((text) => h('span', { text })));
  return h('div', { class: 't-scale', role: 'img', 'aria-label': aria }, track, names);
}

export function measuredRow(title: string, value: string, extra?: Node): HTMLElement {
  return h(
    'div',
    { class: 't-measured' },
    h('p', { class: 't-measured-head' }, h('span', { class: 't-measured-title', text: title }), h('span', { class: 't-measured-value', text: value })),
    extra ?? null,
  );
}

export function readingCard(input: { title: string; finding: string; meaning: string; cites: readonly Cite[]; note?: string | undefined; tone?: string }): HTMLElement {
  return h(
    'section',
    { class: `t-group t-read${input.tone ? ` t-read-${input.tone}` : ''}` },
    h('h3', { class: 't-group-title', text: input.title }),
    h('p', { class: 't-read-finding', text: input.finding }),
    h('p', { class: 't-reading-text', text: input.meaning }),
    input.note ? h('p', { class: 't-caveat', text: input.note }) : null,
    input.cites.length > 0 ? sourceList(input.cites.map(citeText), 3) : null,
  );
}

/** A plain link styled as a button, for "use this photo in another tool". */
export function actionButton(text: string, primary: boolean, onClick: () => void): HTMLButtonElement {
  const button = h('button', { type: 'button', class: `btn ${primary ? 'btn-gold' : 'btn-secondary'}`, text });
  button.addEventListener('click', onClick);
  return button;
}
