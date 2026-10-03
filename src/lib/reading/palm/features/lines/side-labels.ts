// COPIED from palm-ai-new--feat-m1-foundation/src/features/lines/side-labels.ts at app commit fbc2232d837f (2026-09-30).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import type { Pt } from './live-scan';

/**
 * Line names placed in columns at the photo's left and right edges, away from
 * the palm, each joined to its own line by a thin leader (owner, 2026-09-21:
 * no name may cover a line). Shared by the live scan and the report photo.
 */

export interface SideLabelInput {
  key: string;
  /** The traced line, in pixels of the photo box. */
  points: readonly Pt[];
  w: number;
  h: number;
}

export interface SideLabel {
  key: string;
  side: 'left' | 'right';
  /** The label box. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Where the leader touches the line: the line's point nearest the label's edge. */
  anchor: Pt;
  /** Where the leader leaves the label: the middle of its inner edge. */
  from: Pt;
}

/**
 * Each line goes to the side its own nearest end is closer to, then the side
 * that is fuller hands its farthest line over while that keeps things even.
 * In a column, labels sit level with their anchor and are pushed apart by
 * `gap`, then shifted back inside the photo when they run off it.
 */
export function placeSideLabels(items: readonly SideLabelInput[], width: number, height: number, pad: number, gap: number): SideLabel[] {
  if (width <= 0 || height <= 0) return [];
  const scored = items
    .filter((item) => item.points.length > 0)
    .map((item) => {
      const left = item.points.reduce((a, p) => (p[0] < a[0] ? p : a));
      const right = item.points.reduce((a, p) => (p[0] > a[0] ? p : a));
      const dl = left[0];
      const dr = width - right[0];
      return { item, left, right, dl, dr, side: (dl <= dr ? 'left' : 'right') as 'left' | 'right' };
    });

  const count = (side: 'left' | 'right') => scored.filter((s) => s.side === side).length;
  // Even the columns: move the line whose other side costs least, while it helps.
  for (let guard = 0; guard < scored.length; guard++) {
    const l = count('left');
    const r = count('right');
    if (Math.abs(l - r) <= 1) break;
    const from = l > r ? 'left' : 'right';
    const movable = scored
      .filter((s) => s.side === from)
      .sort((a, b) => (from === 'left' ? a.dr - a.dl - (b.dr - b.dl) : a.dl - a.dr - (b.dl - b.dr)));
    movable[0]!.side = from === 'left' ? 'right' : 'left';
  }

  const out: SideLabel[] = [];
  for (const side of ['left', 'right'] as const) {
    const column = scored
      .filter((s) => s.side === side)
      .map((s) => ({ s, anchor: side === 'left' ? s.left : s.right }))
      .sort((a, b) => a.anchor[1] - b.anchor[1]);
    const ys = column.map(({ s, anchor }) => anchor[1] - s.item.h / 2);
    // Push down so no two overlap.
    for (let i = 1; i < ys.length; i++) {
      const prev = column[i - 1]!.s.item;
      ys[i] = Math.max(ys[i]!, ys[i - 1]! + prev.h + gap);
    }
    // Pull back up from the bottom edge, then keep the top edge.
    for (let i = ys.length - 1; i >= 0; i--) {
      const h = column[i]!.s.item.h;
      const limit = i === ys.length - 1 ? height - pad - h : ys[i + 1]! - gap - h;
      ys[i] = Math.min(ys[i]!, limit);
    }
    for (let i = 0; i < ys.length; i++) {
      const h = column[i]!.s.item.h;
      const floor = i === 0 ? pad : ys[i - 1]! + column[i - 1]!.s.item.h + gap;
      ys[i] = Math.max(ys[i]!, Math.min(floor, height - pad - h));
    }
    column.forEach(({ s, anchor }, i) => {
      const { key, w, h } = s.item;
      const x = side === 'left' ? pad : width - pad - w;
      const y = ys[i]!;
      out.push({ key, side, x, y, w, h, anchor, from: [side === 'left' ? x + w : x, y + h / 2] });
    });
  }
  return out;
}
