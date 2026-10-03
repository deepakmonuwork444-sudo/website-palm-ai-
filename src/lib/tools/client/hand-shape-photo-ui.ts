import { h } from '../dom';
import { CUT } from '../hand/cutoffs';
import { LM } from '../hand/landmarks';
import { SCALES, handShape, ratioText } from '../hand/shape';
import { WARNING_TEXT, sideName } from '../hand/verdict';
import { CHEIRO_TYPES, ELEMENTS, MODERN_SYSTEM_NOTE, type Element } from '../hand-type';
import { citeText } from '../sources';
import { handFigure } from './hand-figure';
import { mountPhotoTool, type PhotoResult, type ToolLinks } from './photo-tool';
import { actionButton, measuredRow, scaleBar } from './result-bits';
import { sourceList } from './render';

/**
 * Tool A — hand type from your own photo (/tools/hand-type-quiz/). The
 * result: your photo with the three measured lengths drawn from the points
 * the model found, the two ratios on their scales, and the element type(s).
 */

const TOOL = 'hand-type' as const;
const MODERN = 'The modern four-element system (20th century), not the classical books';

const PALM_WORD = { square: 'square', long: 'long', between: 'between square and long' } as const;
const FINGER_WORD = { short: 'short', long: 'long', between: 'of average length' } as const;

function headline(elements: Element[]): string {
  if (elements.length === 1) return `Your hand type: ${ELEMENTS[elements[0]!].name}`;
  if (elements.length === 2) return `Your hand sits between two types: ${elements.map((e) => ELEMENTS[e].name.replace(' hand', '')).join(' and ')}`;
  return 'Your hand sits in the middle of all four types';
}

export function renderHandShape(result: PhotoResult, links: ToolLinks): { nodes: Node[]; heading: HTMLElement } {
  const { verdict, prepared, url } = result;
  const m = verdict.measures;
  const shape = handShape(m);
  const heading = h('h2', { class: 't-result-title', text: headline(shape.elements) });
  const lead = h('p', {
    class: 't-result-lead',
    text: `Measured on your photo: your palm is ${PALM_WORD[shape.palm]}, and your fingers are ${FINGER_WORD[shape.fingers]}. Hand types here follow the popular modern four-element system.`,
  });

  const figure = handFigure({
    src: url,
    width: prepared.scan.width,
    height: prepared.scan.height,
    alt: `Your ${sideName(verdict.side)} hand, with the palm length, palm width and middle finger we measured drawn on it`,
    hand: verdict.hand,
    marks: [
      { kind: 'segment', from: LM.WRIST, to: LM.MIDDLE_MCP, tone: 'life', label: 'L' },
      { kind: 'segment', from: LM.INDEX_MCP, to: LM.LITTLE_MCP, tone: 'head', label: 'W' },
      { kind: 'chain', points: [LM.MIDDLE_MCP, LM.MIDDLE_PIP, LM.MIDDLE_DIP, LM.MIDDLE_TIP], tone: 'heart', label: 'F' },
    ],
    legend: [
      { tone: 'life', text: 'L: palm length, wrist to the middle finger’s knuckle' },
      { tone: 'head', text: 'W: palm width, index knuckle to little-finger knuckle' },
      { tone: 'heart', text: 'F: middle finger, knuckle to tip' },
    ],
    caption: 'The dots are the 21 joint points our model found on your photo. Everything was measured on this device.',
  });

  const measures = h(
    'section',
    { class: 't-group', 'aria-label': 'Your measurements' },
    h('h3', { class: 't-group-title', text: 'Your measurements' }),
    measuredRow(
      'Palm: length ÷ width',
      `${ratioText(shape.palmRatio)} (${shape.palm === 'between' ? 'between' : shape.palm})`,
      scaleBar({
        value: shape.palmRatio,
        min: SCALES.palm.min,
        max: SCALES.palm.max,
        cuts: [CUT.palm.square, CUT.palm.long],
        labels: ['Square', 'Between', 'Long'],
        aria: `Your palm ratio is ${ratioText(shape.palmRatio)}. Square up to ${CUT.palm.square.toFixed(2)}, long from ${CUT.palm.long.toFixed(2)}.`,
      }),
    ),
    measuredRow(
      'Middle finger ÷ palm length',
      `${ratioText(shape.fingerRatio)} (${shape.fingers === 'between' ? 'average' : shape.fingers})`,
      scaleBar({
        value: shape.fingerRatio,
        min: SCALES.fingers.min,
        max: SCALES.fingers.max,
        cuts: [CUT.fingers.short, CUT.fingers.long],
        labels: ['Short', 'Average', 'Long'],
        aria: `Your finger ratio is ${ratioText(shape.fingerRatio)}. Short up to ${CUT.fingers.short.toFixed(2)}, long from ${CUT.fingers.long.toFixed(2)}.`,
      }),
    ),
    h('p', { class: 't-caveat', text: `Hand: ${sideName(verdict.side)}, as our model sees it.` }),
  );

  const meanings = h(
    'section',
    { class: 't-group' },
    h('h3', { class: 't-group-title', text: shape.elements.length === 1 ? 'What this type is linked with' : 'What these types are linked with' }),
    ...shape.elements.map((element) =>
      h('div', { class: 't-reading' }, h('p', { class: 't-read-finding', text: ELEMENTS[element].name }), h('p', { class: 't-reading-text', text: ELEMENTS[element].summary })),
    ),
    h('p', { class: 't-caveat', text: MODERN_SYSTEM_NOTE }),
    sourceList([MODERN, citeText(CHEIRO_TYPES)], 2),
  );

  const next = h(
    'div',
    { class: 't-next' },
    h('p', { class: 'font-bold', text: 'Keep going with this photo' }),
    h('p', { text: 'Your photo can go straight to the next tool, still only on this device.' }),
    h(
      'div',
      { class: 't-actions' },
      actionButton('Read my fingers from this photo', true, () => links.handOff('/tools/finger-reader/', TOOL)),
      actionButton('Compare with my other hand', false, () => links.handOff('/tools/left-vs-right-palm/', TOOL)),
    ),
  );

  const notes = [
    ...verdict.warnings.map((w) => WARNING_TEXT[w]),
    'A hand held at an angle to the camera shifts the numbers a little. For a check, take a second photo with the phone held flat above your palm.',
  ];

  return {
    heading,
    nodes: [
      h('div', { class: 't-result-head' }, heading, lead),
      h('div', { class: 't-result-grid' }, figure, h('div', { class: 't-result-side' }, measures, meanings)),
      ...notes.map((text) => h('p', { class: 't-caveat', text })),
      next,
    ],
  };
}

export function mountHandShapePhoto(): void {
  const root = document.querySelector<HTMLElement>('[data-photo-tool="hand-type"]');
  if (!root) return;
  mountPhotoTool({ tool: TOOL, root, render: renderHandShape });
}
