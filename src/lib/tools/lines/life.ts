import type { LineFinder } from '../finder';
import type { Cite } from '../sources';

/**
 * Life line finder (tool 6). Rules copied from the app's corpus-rules.ts,
 * 2026-09-26. The app's life-line rules carry no reading about health or
 * length of life, whatever the books say; neither does this tool.
 */

const PFA: Cite = { book: 'cheiro-palmistry-for-all-1916', locator: 'Part I, ch. III: The Line of Life' };
const PFA_CLASSES: Cite = { book: 'cheiro-palmistry-for-all-1916', locator: 'Part I, ch. XVII: Different Classes of Lines' };
const LOTH: Cite = { book: 'cheiro-language-of-the-hand-1900', locator: 'Part II, ch. V: The Line of Life, pp. 79–85' };
const MARKUN: Cite = { book: 'markun-what-you-should-know-about-palmistry-1927', locator: 'the section on the Line of Life' };
const MARKUN_LINES: Cite = { book: 'markun-what-you-should-know-about-palmistry-1927', locator: 'the opening of the section on the lines' };
const GUIDE: Cite = { book: 'cheiro-guide-to-the-hand-1900', locator: 'Ch. XI: The Line of Life, pp. 71–72' };
const RAPH: Cite = { book: 'raphael-cheirosophy-1901', locator: 'The Life Line, p. 103' };
const BENHAM: Cite = { book: 'benham-laws-of-scientific-hand-reading-1900', locator: 'Part II, ch. VII: The Line of Life, pp. 470–472' };
const WILL: Cite = { book: 'williams-key-to-palmistry-1902', locator: 'The Life Line of Action' };


export const LIFE_FINDER: LineFinder = {
  line: 'life',
  questions: [
    {
      id: 'curvature',
      legend: 'How wide is the curve around your thumb?',
      help: 'The life line starts between the thumb and index finger and curves down towards the wrist.',
      options: [
        { value: 'curved', label: 'A wide curve, swinging well into the palm', evidence: 'A wide curve', set: { curvature: 'curved' } },
        { value: 'straight', label: 'Close to the thumb, fairly straight', evidence: 'A straighter line close to the thumb', set: { curvature: 'straight' } },
      ],
    },
    {
      id: 'length',
      legend: 'How far down does it go?',
      help: 'Length is never read as lifespan: not by this tool, and not by the old books either.',
      options: [
        { value: 'long', label: 'Long: reaches down towards the wrist', evidence: 'A long life line', set: { length: 'long' } },
        { value: 'short', label: 'Short: stops around the middle of the palm', evidence: 'A shorter life line', set: { length: 'short' } },
      ],
    },
    {
      id: 'start',
      legend: 'Where does it start?',
      options: [
        { value: 'normal', label: 'Between the thumb and index finger (the usual place)', evidence: 'Starts in the usual place', set: {} },
        { value: 'index', label: 'Higher up, under the index finger', evidence: 'Starts under the index finger', set: { start: 'jupiter' } },
        { value: 'low', label: 'Lower down, inside near the thumb', evidence: 'Starts low, inside near the thumb', set: { start: 'mars_negative' } },
      ],
    },
    {
      id: 'end',
      legend: 'Where does it end?',
      options: [
        { value: 'wrist', label: 'At the wrist, around the thumb', evidence: 'Ends at the wrist', set: { end: 'wrist' } },
        { value: 'moon', label: 'Swinging out towards the outer palm', evidence: 'Swings out towards the outer palm (Mount of the Moon)', set: { end: 'luna' } },
      ],
    },
    {
      id: 'depth',
      legend: 'How clearly is it marked?',
      options: [
        { value: 'deep', label: 'Deep and clearly cut', evidence: 'A deep, clearly marked life line', set: { depth: 'deep' } },
        { value: 'faint', label: 'Faint or thin', evidence: 'A faint life line', set: { depth: 'faint' } },
      ],
    },
    {
      id: 'continuity',
      legend: 'Is it one unbroken line?',
      options: [
        { value: 'unbroken', label: 'Yes, unbroken', evidence: 'An unbroken life line', set: { continuity: 'continuous' } },
        { value: 'broken', label: 'It has a break (a gap)', evidence: 'A break in the life line', set: { continuity: 'broken' } },
        { value: 'chained', label: 'It looks like a chain of small loops', evidence: 'A chained life line', set: { continuity: 'chained' } },
      ],
    },
    {
      id: 'fork',
      legend: 'Does it split into a fork at the bottom?',
      options: [
        { value: 'yes', label: 'Yes, a fork', evidence: 'A fork at the end', set: { fork: 1 } },
        { value: 'no', label: 'No fork', evidence: 'No fork', set: { fork: 0 } },
      ],
    },
  ],
  rules: [
    {
      id: 'cx-life-curved',
      tradition: 'western',
      when: [{ feature: 'curvature', op: 'eq', value: 'curved' }],
      meaning: 'An outgoing, physically energetic presence — energy that reaches out toward people and activity.',
      caveat: null,
      cites: [PFA, LOTH],
    },
    {
      id: 'cx-life-wide-warm',
      tradition: 'western',
      when: [{ feature: 'curvature', op: 'eq', value: 'curved' }],
      meaning: 'Warm, generous and sympathetic — someone who draws other people in.',
      caveat: null,
      cites: [BENHAM],
    },
    {
      id: 'cx-life-straight',
      tradition: 'western',
      when: [{ feature: 'curvature', op: 'eq', value: 'straight' }],
      meaning: 'Energy that is held closer in — a quieter, less forceful physical presence.',
      caveat: null,
      cites: [PFA],
    },
    {
      id: 'cx-life-straight-reserved',
      tradition: 'western',
      when: [{ feature: 'curvature', op: 'eq', value: 'straight' }],
      meaning: 'A reserved, self-contained manner — slower to reach out for closeness and warmth.',
      caveat: null,
      cites: [BENHAM, WILL],
    },
    {
      id: 'cx-life-long',
      tradition: 'western',
      when: [{ feature: 'length', op: 'eq', value: 'long' }],
      meaning: 'A long, clearly traced life line — the form the classical books call normal, and read as steady vitality.',
      caveat: null,
      cites: [PFA, LOTH],
    },
    {
      id: 'cx-life-short',
      tradition: 'western',
      when: [{ feature: 'length', op: 'eq', value: 'short' }],
      meaning: 'A shorter life line. Even the old books warn against reading its length as a count of years, and it is not read that way here.',
      caveat: null,
      cites: [MARKUN, LOTH],
    },
    {
      id: 'cx-life-start-index',
      tradition: 'western',
      when: [{ feature: 'start', op: 'in', value: ['jupiter', 'under_index'] }],
      meaning: 'A life steered by ambition from early on, together with good self-command.',
      caveat: null,
      cites: [PFA, LOTH, MARKUN, GUIDE, RAPH],
    },
    {
      id: 'cx-life-start-thumb-mars',
      tradition: 'western',
      when: [{ feature: 'start', op: 'eq', value: 'mars_negative' }],
      meaning: 'A quick temper that takes conscious effort to manage.',
      caveat: null,
      cites: [PFA],
    },
    {
      id: 'cx-life-end-luna',
      tradition: 'western',
      when: [{ feature: 'end', op: 'eq', value: 'luna' }],
      meaning: 'Restlessness and a strong wish to travel and see new places.',
      caveat: 'The books describe a branch toward the Moon mount. The photo records only where the line ends.',
      cites: [LOTH, MARKUN],
    },
    {
      id: 'cx-life-deep',
      tradition: 'western',
      when: [{ feature: 'depth', op: 'eq', value: 'deep' }],
      meaning: 'Stamina that comes more from will and nerve than from sheer physical strength.',
      caveat: null,
      cites: [PFA],
    },
    {
      id: 'cx-life-faint',
      tradition: 'western',
      when: [{ feature: 'depth', op: 'eq', value: 'faint' }],
      meaning: 'A calmer, lower-key kind of energy — steady rather than forceful.',
      caveat: null,
      cites: [PFA_CLASSES, MARKUN_LINES],
    },
    {
      id: 'cx-life-broken',
      tradition: 'western',
      when: [{ feature: 'continuity', op: 'eq', value: 'broken' }],
      meaning: 'A period of major change in the way life is lived.',
      caveat: null,
      cites: [MARKUN],
    },
    {
      id: 'cx-life-chained',
      tradition: 'western',
      when: [{ feature: 'continuity', op: 'eq', value: 'chained' }],
      meaning: 'Energy and purpose that come and go rather than holding steady.',
      caveat: null,
      cites: [PFA_CLASSES],
    },
    {
      id: 'cx-life-end-wrist-settled',
      tradition: 'western',
      when: [
        { feature: 'end', op: 'eq', value: 'wrist' },
        { feature: 'fork', op: 'eq', value: 0 },
      ],
      meaning: 'A settled pattern — a life that tends to keep to familiar ground rather than constant change and travel.',
      caveat: 'The book says such a life will be free from change and travel. Read it as a leaning, not a forecast.',
      cites: [PFA],
    },
  ],
};
