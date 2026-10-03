import { h, watchStoreClicks } from '../dom';
import { fingerHeadline, readFingerLength, readGaps, readIndexRing, readLittle, readThumb, type GapName } from '../hand/fingers';
import { LM } from '../hand/landmarks';
import { WARNING_TEXT, sideName } from '../hand/verdict';
import { handFigure, type Mark } from './hand-figure';
import { mountPhotoTool, type PhotoResult, type ToolLinks } from './photo-tool';
import { actionButton, readingCard } from './result-bits';

/**
 * Tool B — finger reader from your own photo (/tools/finger-reader/): index
 * vs ring finger, the thumb's opening and length, the gaps between the
 * fingers, the little finger and finger length — measured on the photo,
 * drawn on it, and read from the classical books with their sources.
 */

const TOOL = 'finger-reader' as const;

const GAP_MARK: Record<GapName, [number, number]> = {
  indexMiddle: [LM.INDEX_TIP, LM.MIDDLE_TIP],
  middleRing: [LM.MIDDLE_TIP, LM.RING_TIP],
  ringLittle: [LM.RING_TIP, LM.LITTLE_TIP],
};

export function renderFingers(result: PhotoResult, links: ToolLinks): { nodes: Node[]; heading: HTMLElement } {
  const { verdict, prepared, url } = result;
  const m = verdict.measures;
  const indexRing = readIndexRing(m);
  const thumb = readThumb(m);
  const gaps = readGaps(m);
  const little = readLittle(m);
  const length = readFingerLength(m);

  const heading = h('h2', { class: 't-result-title', text: fingerHeadline(m) });
  const lead = h('p', {
    class: 't-result-lead',
    text: 'Measured on your photo, then read from the classical palmistry books. Each reading names its book.',
  });

  const marks: Mark[] = [
    { kind: 'chain', points: [LM.INDEX_MCP, LM.INDEX_PIP, LM.INDEX_DIP, LM.INDEX_TIP], tone: 'head', label: 'Index' },
    { kind: 'chain', points: [LM.RING_MCP, LM.RING_PIP, LM.RING_DIP, LM.RING_TIP], tone: 'heart', label: 'Ring' },
    { kind: 'chain', points: [LM.THUMB_MCP, LM.THUMB_IP, LM.THUMB_TIP], tone: 'fate', label: `${Math.round(m.thumbAngle)}°` },
    ...gaps.wide.map((name): Mark => ({ kind: 'segment', from: GAP_MARK[name][0], to: GAP_MARK[name][1], tone: 'gold', label: 'Gap' })),
  ];
  const figure = handFigure({
    src: url,
    width: prepared.scan.width,
    height: prepared.scan.height,
    alt: `Your ${sideName(verdict.side)} hand, with your index finger, ring finger and thumb drawn from the points we found`,
    hand: verdict.hand,
    marks,
    legend: [
      { tone: 'head', text: 'Index finger (Jupiter), knuckle to tip' },
      { tone: 'heart', text: 'Ring finger (Sun, or Apollo), knuckle to tip' },
      { tone: 'fate', text: 'Thumb, with its angle from the index finger' },
      ...(gaps.wide.length > 0 ? [{ tone: 'gold' as const, text: 'A gap wider than usual' }] : []),
    ],
    caption: 'The dots are the 21 joint points our model found on your photo. Everything was measured on this device.',
  });

  const cards = [
    readingCard({
      title: 'Index finger and ring finger',
      finding: `${indexRing.finding} (Index ${Math.round(m.indexRingLength * 100)}% of ring, knuckle to tip.)`,
      meaning: indexRing.meaning,
      cites: indexRing.cites,
      note: indexRing.note,
      tone: 'head',
    }),
    readingCard({ title: 'Your thumb', finding: thumb.finding, meaning: thumb.meaning, cites: thumb.cites, note: thumb.note, tone: 'fate' }),
    readingCard({ title: 'Spaces between your fingers', finding: gaps.finding, meaning: gaps.meaning, cites: gaps.cites, note: gaps.note }),
    readingCard({ title: 'Little finger', finding: little.finding, meaning: little.meaning, cites: little.cites, note: little.note }),
    readingCard({ title: 'Finger length', finding: length.finding, meaning: length.meaning, cites: length.cites }),
  ];

  const setNote = h(
    'p',
    { class: 't-caveat' },
    'Not measured: how low or high your thumb is set. On a photo, the thumb’s base point moves as the thumb opens, so one photo can’t tell the two apart, and we don’t guess.',
  );

  const next = h(
    'div',
    { class: 't-next' },
    h('p', { class: 'font-bold', text: 'Keep going with this photo' }),
    h('p', { text: 'Your photo can go straight to the next tool, still only on this device.' }),
    h(
      'div',
      { class: 't-actions' },
      actionButton('Find my hand type from this photo', true, () => links.handOff('/tools/hand-type-quiz/', TOOL)),
      actionButton('Compare with my other hand', false, () => links.handOff('/tools/left-vs-right-palm/', TOOL)),
    ),
  );

  return {
    heading,
    nodes: [
      h('div', { class: 't-result-head' }, heading, lead),
      h('div', { class: 't-result-grid' }, figure, h('div', { class: 't-result-side' }, cards[0]!, cards[1]!)),
      h('div', { class: 't-result-cards' }, ...cards.slice(2)),
      ...verdict.warnings.map((w) => h('p', { class: 't-caveat', text: WARNING_TEXT[w] })),
      setNote,
      next,
    ],
  };
}

export function mountFingerReader(): void {
  const root = document.querySelector<HTMLElement>('[data-photo-tool="finger-reader"]');
  if (!root) return;
  watchStoreClicks(`tool-${TOOL}`);
  mountPhotoTool({ tool: TOOL, root, render: renderFingers });
}
