import type { DetectedHand } from '../hand/landmarks';
import { HAND_BONES } from '../hand/landmarks';
import { handCrop, type Box } from '../hand/measure';
import { h, svg } from '../dom';

/**
 * The person's own photo with what the model really found drawn on it
 * (DESIGN_SYSTEM.md §7.5 rule: drawings sit exactly on the photo). Photo and
 * drawing are ONE <svg>: the photo is an <image> in its own pixel
 * coordinates and every point is drawn in the same coordinates, so nothing
 * can drift at any screen width. The view is cropped to the hand (with a
 * margin) so a small hand in a wide photo is still easy to see. Only
 * detected landmarks are drawn — never a guessed line. Every colour has a
 * text legend (never colour alone).
 */

export type Tone = 'life' | 'head' | 'heart' | 'fate' | 'gold';

export type Mark =
  /** A straight measurement between two landmarks, with an optional short label. */
  | { kind: 'segment'; from: number; to: number; tone: Tone; label?: string }
  /** A path along landmarks (a finger's bones). */
  | { kind: 'chain'; points: readonly number[]; tone: Tone; label?: string };

export interface LegendItem {
  tone: Tone;
  text: string;
}

export interface FigureInput {
  src: string;
  width: number;
  height: number;
  alt: string;
  hand: DetectedHand | null;
  marks?: Mark[];
  legend?: LegendItem[];
  caption?: string;
  /** Draw the hand's bones and points faintly under the marks (default true). */
  skeleton?: boolean;
}

function pathD(points: { x: number; y: number }[]): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
}

/** A pill label beside a point, nudged away from the line and kept inside the view. */
function label(text: string, at: { x: number; y: number }, normal: { x: number; y: number }, size: number, view: Box, tone: Tone): SVGGElement {
  const w = text.length * size * 0.62 + size * 0.9;
  const hgt = size * 1.5;
  const offset = size * 1.4;
  const cx = Math.min(view.x + view.w - w / 2 - 2, Math.max(view.x + w / 2 + 2, at.x + normal.x * offset));
  const cy = Math.min(view.y + view.h - hgt / 2 - 2, Math.max(view.y + hgt / 2 + 2, at.y + normal.y * offset));
  const g = svg('g', { class: `t-ov-label t-ov-${tone}` });
  g.append(svg('rect', { x: (cx - w / 2).toFixed(1), y: (cy - hgt / 2).toFixed(1), width: w.toFixed(1), height: hgt.toFixed(1), rx: (hgt / 2).toFixed(1) }));
  const t = svg('text', { x: cx.toFixed(1), y: (cy + size * 0.35).toFixed(1), 'font-size': size.toFixed(1), 'text-anchor': 'middle' });
  t.textContent = text;
  g.append(t);
  return g;
}

function unitNormal(a: { x: number; y: number }, b: { x: number; y: number }): { x: number; y: number } {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: -dy / len, y: dx / len };
}

export function handFigure(input: FigureInput): HTMLElement {
  const { src, width, height, alt, hand, marks = [], legend = [], caption, skeleton = true } = input;
  const view: Box = hand ? handCrop(hand.landmarks, width, height) : { x: 0, y: 0, w: width, h: height };
  const long = Math.max(view.w, view.h);
  const stroke = Math.max(1.5, long / 240);
  const fontSize = Math.max(11, long / 30);

  const picture = svg('svg', {
    class: 't-ov-photo',
    viewBox: `${view.x.toFixed(1)} ${view.y.toFixed(1)} ${view.w.toFixed(1)} ${view.h.toFixed(1)}`,
    role: 'img',
    'aria-label': alt,
  });
  picture.append(svg('image', { href: src, x: '0', y: '0', width: String(width), height: String(height), preserveAspectRatio: 'none' }));

  if (hand) {
    const P = (i: number) => ({ x: hand.landmarks[i]!.x * width, y: hand.landmarks[i]!.y * height });
    if (skeleton) {
      const bones = svg('g', { class: 't-ov-bones' });
      for (const [a, b] of HAND_BONES) {
        const d = pathD([P(a), P(b)]);
        bones.append(svg('path', { class: 't-ov-halo', d, 'stroke-width': (stroke * 1.8).toFixed(1) }));
        bones.append(svg('path', { class: 't-ov-bone', d, 'stroke-width': (stroke * 0.7).toFixed(1) }));
      }
      picture.append(bones);
    }
    const labels: SVGGElement[] = [];
    for (const mark of marks) {
      const pts = mark.kind === 'segment' ? [P(mark.from), P(mark.to)] : mark.points.map(P);
      const d = pathD(pts);
      const g = svg('g', { class: `t-ov-mark t-ov-${mark.tone}` });
      g.append(svg('path', { class: 't-ov-halo', d, 'stroke-width': (stroke * 2.6).toFixed(1) }));
      g.append(svg('path', { class: 't-ov-line', d, 'stroke-width': (stroke * 1.3).toFixed(1) }));
      picture.append(g);
      if (mark.label) {
        const a = pts[0]!;
        const b = pts[pts.length - 1]!;
        const mid = mark.kind === 'segment' ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } : pts[Math.floor(pts.length / 2)]!;
        labels.push(label(mark.label, mid, unitNormal(a, b), fontSize, view, mark.tone));
      }
    }
    if (skeleton) {
      const dots = svg('g', { class: 't-ov-dots' });
      for (let i = 0; i < hand.landmarks.length; i += 1) {
        const p = P(i);
        dots.append(svg('circle', { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: (stroke * 1.5).toFixed(1) }));
      }
      picture.append(dots);
    }
    for (const item of labels) picture.append(item);
  }

  const figure = h('figure', { class: 't-ov-figure' }, h('div', { class: 't-ov-frame' }, picture));
  if (legend.length > 0 || caption) {
    const cap = h('figcaption', { class: 't-ov-caption' });
    if (legend.length > 0) {
      cap.append(
        h(
          'ul',
          { class: 't-ov-legend' },
          ...legend.map((item) => h('li', {}, h('span', { class: `t-ov-key t-ov-${item.tone}`, 'aria-hidden': 'true' }), h('span', { text: item.text }))),
        ),
      );
    }
    if (caption) cap.append(h('p', { class: 't-caveat', text: caption }));
    figure.append(cap);
  }
  return figure;
}
