import { h, svg } from '../dom';
import { LINE_NAMES, LINE_ORDER, type TracedLine } from '../line-scan';

/**
 * A photo with the scanner's traced lines on it (DESIGN_SYSTEM.md §7.5):
 * lines sit in the photo's own coordinates; a line the scan did not return
 * is never drawn — its chip says "not clearly seen". In preview mode the
 * lines are the mock's stored sample, and the figure says so in words.
 */
export function linesFigure(input: { src: string; width: number; height: number; lines: TracedLine[]; alt: string; preview: boolean }): HTMLElement {
  const { src, width, height, lines, alt, preview } = input;
  const stroke = Math.max(2, Math.round(Math.max(width, height) / 220));
  const frame = h('div', { class: 't-ov-frame' });
  frame.append(h('img', { src, alt, width: String(width), height: String(height), decoding: 'async' }));
  if (lines.length > 0) {
    const layer = svg('svg', { class: 't-ov t-ov-lines', viewBox: `0 0 ${width} ${height}`, preserveAspectRatio: 'none', 'aria-hidden': 'true', focusable: 'false' });
    for (const line of lines) {
      const d = line.path.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${(x * width).toFixed(1)} ${(y * height).toFixed(1)}`).join(' ');
      const g = svg('g', { class: `t-ov-mark t-ov-${line.type}` });
      g.append(svg('path', { class: 't-ov-halo', d, 'stroke-width': String(stroke * 2.2) }), svg('path', { class: 't-ov-line', d, 'stroke-width': String(stroke) }));
      layer.append(g);
    }
    frame.append(layer);
  }
  const found = new Set(lines.map((line) => line.type));
  const chips = h(
    'ul',
    { class: 't-line-chips' },
    ...LINE_ORDER.map((type) =>
      h(
        'li',
        { class: found.has(type) ? 't-line-chip' : 't-line-chip t-line-chip-missing' },
        h('span', { class: `t-chip-dot t-chip-${type}`, 'aria-hidden': 'true' }),
        h('span', { text: found.has(type) ? LINE_NAMES[type] : `${LINE_NAMES[type]}: not clearly seen` }),
      ),
    ),
  );
  const caption = h('figcaption', { class: 't-ov-caption' }, chips);
  if (preview) {
    caption.prepend(
      h('p', { class: 't-preview-note', text: 'Preview mode: these lines come from a stored sample scan, not from your photo. Nothing was uploaded.' }),
    );
  }
  return h('figure', { class: 't-ov-figure' }, frame, caption);
}
