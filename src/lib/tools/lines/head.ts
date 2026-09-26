import type { LineFinder, ThumbPath } from '../finder';
import type { Cite } from '../sources';

/** Head line finder (tool 5). Rules copied from the app's corpus-rules.ts, 2026-09-26. */

const PFA: Cite = { book: 'cheiro-palmistry-for-all-1916', locator: 'Part I, ch. II — The Line of Head' };
const PFA_CLASSES: Cite = { book: 'cheiro-palmistry-for-all-1916', locator: 'Part I, ch. XVII — Different Classes of Lines' };
const LOTH: Cite = { book: 'cheiro-language-of-the-hand-1900', locator: 'Part II, ch. VII — The Line of Head, pp. 87–90' };
const LOTH_LIFE: Cite = { book: 'cheiro-language-of-the-hand-1900', locator: 'Part II, ch. V — The Line of Life, pp. 79–85' };
const MARKUN: Cite = { book: 'markun-what-you-should-know-about-palmistry-1927', locator: 'the section on the Line of the Head' };
const GUIDE: Cite = { book: 'cheiro-guide-to-the-hand-1900', locator: 'Ch. XII — The Line of Head, pp. 79–82' };
const GUIDE_LIFE: Cite = { book: 'cheiro-guide-to-the-hand-1900', locator: 'Ch. XI — The Line of Life, pp. 71–72' };
const FRITH: Cite = { book: 'frith-practical-palmistry-1895', locator: 'The Head Line, pp. 65–68' };
const HAM: Cite = { book: 'heron-allen-manual-of-cheirosophy-1885', locator: 'Cheiromancy, § 3 — The Line of Head, p. 250' };
const HAP: Cite = { book: 'heron-allen-practical-cheirosophy-1887', locator: 'The Line of Head, p. 113' };
const DESB: Cite = { book: 'desbarrolles-chiromancie-nouvelle-1859', locator: 'Ligne de tête, pp. 220–221' };
const BENHAM: Cite = { book: 'benham-laws-of-scientific-hand-reading-1900', locator: 'Part II, ch. VI — The Line of Head, pp. 426–443' };
const RAPH: Cite = { book: 'raphael-cheirosophy-1901', locator: 'The Head Line, pp. 113–115' };
const STH: Cite = { book: 'st-hill-grammar-of-palmistry-1893', locator: 'Line of Head (Cerebral), pp. 40–42' };
const SG: Cite = { book: 'saint-germain-practice-of-palmistry-1900', locator: 'The Line of Head, pp. 214–223' };
const DALE_LIVER: Cite = { book: 'dale-indian-palmistry-1895', locator: 'The Liver Line — the old name for the head line' };
const DALE_LIFE: Cite = { book: 'dale-indian-palmistry-1895', locator: 'The Line of Life' };

const BASE = 'M160 158 C 132 162, 100 172, 68 190';
const LIFE: ThumbPath = { d: 'M160 164 C 134 178, 122 206, 130 244', line: 'life' };

export const HEAD_FINDER: LineFinder = {
  line: 'head',
  questions: [
    {
      id: 'curvature',
      legend: 'What shape is your head line?',
      help: 'It is the line across the middle of your palm, starting near the thumb.',
      options: [
        { value: 'straight', label: 'Straight, almost level', evidence: 'A straight head line', set: { curvature: 'straight' }, thumb: [{ d: 'M160 158 C 130 160, 98 162, 62 166', line: 'head' }] },
        { value: 'gentle', label: 'Gently sloping', evidence: 'A gently sloping head line', set: { curvature: 'gentle' }, thumb: [{ d: 'M160 158 C 132 162, 100 170, 66 184', line: 'head' }] },
        { value: 'curved', label: 'Curving down steeply', evidence: 'A steeply curving head line', set: { curvature: 'curved' }, thumb: [{ d: 'M160 158 C 130 164, 98 186, 80 216', line: 'head' }] },
      ],
    },
    {
      id: 'join',
      legend: 'Where does it start, next to the life line?',
      help: 'The life line is the curve around your thumb.',
      options: [
        { value: 'joined', label: 'Joined to the life line at the start', evidence: 'Joined to the life line at the start', set: { join: 'joined' }, thumb: [LIFE, { d: 'M159 164 C 132 164, 100 172, 68 190', line: 'head' }] },
        { value: 'separate', label: 'Just apart from the life line', evidence: 'Starts just apart from the life line', set: { join: 'separate' }, thumb: [LIFE, { d: 'M156 150 C 130 156, 100 168, 68 188', line: 'head' }] },
        { value: 'wide', label: 'Well apart, with a wide gap', evidence: 'A wide gap from the life line', set: { join: 'wide' }, thumb: [LIFE, { d: 'M148 138 C 126 148, 98 164, 68 186', line: 'head' }] },
        { value: 'index', label: 'Higher up, under the index finger', evidence: 'Starts under the index finger', set: { start: 'jupiter' }, thumb: [LIFE, { d: 'M146 128 C 134 146, 100 166, 68 188', line: 'head' }] },
        { value: 'inside', label: 'Inside the life line, near the thumb', evidence: 'Starts inside the life line', set: { start: 'mars_negative' }, thumb: [LIFE, { d: 'M170 180 C 142 170, 104 174, 68 190', line: 'head' }] },
      ],
    },
    {
      id: 'length',
      legend: 'How long is it?',
      options: [
        { value: 'long', label: 'Long: reaches the outer edge area', evidence: 'A long head line', set: { length: 'long' }, thumb: [{ d: 'M160 158 C 130 162, 96 170, 58 182', line: 'head' }] },
        { value: 'short', label: 'Short: stops near the middle of the palm', evidence: 'A short head line', set: { length: 'short' }, thumb: [{ d: 'M160 158 C 144 160, 128 164, 112 168', line: 'head' }] },
      ],
    },
    {
      id: 'end',
      legend: 'Where does it end?',
      options: [
        { value: 'outer', label: 'At the outer edge, fairly level', evidence: 'Ends on the outer edge, fairly level', set: { end: 'mars_positive' }, thumb: [{ d: 'M160 158 C 130 160, 96 166, 58 170', line: 'head' }] },
        { value: 'moon', label: 'Low on the outer palm, towards the wrist', evidence: 'Ends low on the outer palm (Mount of the Moon)', set: { end: 'luna' }, thumb: [{ d: 'M160 158 C 130 164, 98 186, 78 214', line: 'head' }] },
        { value: 'middle', label: 'Curving up under the middle finger', evidence: 'Ends under the middle finger', set: { end: 'saturn' }, thumb: [{ d: 'M160 158 C 138 158, 124 150, 120 136', line: 'head' }] },
        { value: 'ring', label: 'Curving up under the ring finger', evidence: 'Ends under the ring finger', set: { end: 'apollo' }, thumb: [{ d: 'M160 158 C 132 160, 100 152, 92 138', line: 'head' }] },
        { value: 'little', label: 'Curving up under the little finger', evidence: 'Ends under the little finger', set: { end: 'mercury' }, thumb: [{ d: 'M160 158 C 128 160, 84 158, 66 144', line: 'head' }] },
      ],
    },
    {
      id: 'depth',
      legend: 'How clearly is it marked?',
      options: [
        { value: 'deep', label: 'Deep and clearly cut', evidence: 'A deep, clearly marked head line', set: { depth: 'deep' }, thumb: [{ d: BASE, line: 'head', style: 'thick' }] },
        { value: 'faint', label: 'Faint, lying on the surface', evidence: 'A faint head line', set: { depth: 'faint' }, thumb: [{ d: BASE, line: 'head', style: 'thin' }] },
      ],
    },
    {
      id: 'continuity',
      legend: 'Is it one unbroken line?',
      options: [
        { value: 'unbroken', label: 'Yes, unbroken', evidence: 'An unbroken head line', set: { continuity: 'continuous' }, thumb: [{ d: BASE, line: 'head' }] },
        { value: 'broken', label: 'It has a break (a gap)', evidence: 'A break in the head line', set: { continuity: 'broken' }, thumb: [{ d: 'M160 158 C 144 160, 128 164, 114 167', line: 'head' }, { d: 'M106 171 C 94 176, 80 182, 68 190', line: 'head' }] },
        { value: 'chained', label: 'It looks like a chain of small loops', evidence: 'A chained head line', set: { continuity: 'chained' }, thumb: [{ d: BASE, line: 'head', style: 'chain' }] },
      ],
    },
    {
      id: 'fork',
      legend: 'Does it split into a fork at the end?',
      help: 'Often called the writer’s fork.',
      options: [
        { value: 'yes', label: 'Yes, a fork', evidence: 'A fork at the end', set: { fork: 1 }, thumb: [{ d: 'M160 158 C 132 162, 104 170, 88 178', line: 'head' }, { d: 'M88 178 C 78 180, 70 182, 60 182', line: 'head' }, { d: 'M88 178 C 80 186, 74 194, 68 204', line: 'head' }] },
        { value: 'no', label: 'No fork', evidence: 'No fork', set: { fork: 0 } },
      ],
    },
  ],
  rules: [
    {
      id: 'cx-head-straight',
      tradition: 'western',
      when: [{ feature: 'curvature', op: 'eq', value: 'straight' }],
      meaning: 'Practical common sense — a mind that prefers the concrete and can be relied on to carry a decision through.',
      caveat: null,
      cites: [LOTH, PFA],
    },
    {
      id: 'cx-head-straight-settled',
      tradition: 'western',
      when: [{ feature: 'curvature', op: 'eq', value: 'straight' }],
      meaning: 'Settled opinions and an even mental balance — once a view is formed, it tends to stay.',
      caveat: 'One old book reads a head line with no curve at all as hard and unyielding. Take it as a caution, not a verdict.',
      cites: [BENHAM, GUIDE, RAPH],
    },
    {
      id: 'cx-head-gentle',
      tradition: 'western',
      when: [{ feature: 'curvature', op: 'eq', value: 'gentle' }],
      meaning: 'Imagination kept in hand — creative thinking that is used when it is wanted, on a practical footing.',
      caveat: null,
      cites: [PFA, LOTH],
    },
    {
      id: 'cx-head-gentle-level',
      tradition: 'western',
      when: [{ feature: 'curvature', op: 'eq', value: 'gentle' }],
      meaning: 'Level-headed — logic and imagination kept in balance, so neither runs the show alone.',
      caveat: null,
      cites: [GUIDE, SG, BENHAM, RAPH],
    },
    {
      id: 'cx-head-curved',
      tradition: 'western',
      when: [{ feature: 'curvature', op: 'eq', value: 'curved' }],
      meaning: 'A strongly imaginative, idealistic mind that does its best work when inspiration or mood carries it.',
      caveat: null,
      cites: [LOTH, PFA],
    },
    {
      id: 'cx-head-curved-artistic',
      tradition: 'western',
      when: [{ feature: 'curvature', op: 'eq', value: 'curved' }],
      meaning: 'Best suited to intellectual, artistic or literary work, where imagination is an asset.',
      caveat: null,
      cites: [SG, DESB, BENHAM, FRITH],
    },
    {
      id: 'cx-head-joined-life',
      tradition: 'western',
      when: [{ feature: 'join', op: 'eq', value: 'joined' }],
      meaning: 'A sensitive, careful mind — cautious in your own affairs, and inclined to rein yourself in and underrate what you can do.',
      caveat: 'The books call this the more common form of the head line. It describes a leaning, not a limit.',
      cites: [PFA, LOTH_LIFE, GUIDE],
    },
    {
      id: 'cx-head-joined-life-advice',
      tradition: 'western',
      when: [{ feature: 'join', op: 'eq', value: 'joined' }],
      meaning: "A habit of weighing other people's advice before your own — self-reliance that tends to grow later rather than early.",
      caveat: null,
      cites: [BENHAM, STH, SG, HAP],
    },
    {
      id: 'cx-head-joined-life-shy',
      tradition: 'western',
      when: [{ feature: 'join', op: 'eq', value: 'joined' }],
      meaning: "A shyness that is often hidden behind a quick, confident manner — other people's remarks land harder than they show.",
      caveat: null,
      cites: [FRITH, RAPH],
    },
    {
      id: 'cx-head-joined-life-dale',
      tradition: 'indian',
      when: [{ feature: 'join', op: 'eq', value: 'joined' }],
      meaning: 'Good wit and an even temper — a quick, sharp mind that is at home in practical dealings.',
      caveat: 'The book asks for the two lines to meet at a neat angle. The photo shows only that they meet.',
      cites: [DALE_LIFE],
    },
    {
      id: 'cx-head-separate-life',
      tradition: 'western',
      when: [{ feature: 'join', op: 'eq', value: 'separate' }],
      meaning: 'Independent thinking and quick judgement, with a streak of mental daring — at its best when there is a clear purpose to aim at.',
      caveat: null,
      cites: [PFA, LOTH_LIFE],
    },
    {
      id: 'cx-head-separate-life-confident',
      tradition: 'western',
      when: [{ feature: 'join', op: 'eq', value: 'separate' }],
      meaning: 'Self-reliance and quick decisions — criticism does not easily knock you off course.',
      caveat: 'The same books warn that this goes with impulsiveness, so second thoughts are often the better ones. One old book reads the gap as a light, fanciful mind instead.',
      cites: [STH, FRITH, BENHAM, SG, GUIDE_LIFE, HAM],
    },
    {
      id: 'cx-head-wide-life',
      tradition: 'western',
      when: [{ feature: 'join', op: 'eq', value: 'wide' }],
      meaning: 'Bold and quick to act — confidence that can run ahead of careful thought.',
      caveat: null,
      cites: [LOTH_LIFE, LOTH],
    },
    {
      id: 'cx-head-start-index',
      tradition: 'western',
      when: [{ feature: 'start', op: 'in', value: ['jupiter', 'under_index'] }],
      meaning: 'Ambition joined to judgement — a mind drawn to organising, managing people and taking charge.',
      caveat: 'One old book calls this among the finest forms of the line. Here it describes a way of thinking, not a result.',
      cites: [LOTH, PFA],
    },
    {
      id: 'cx-head-start-thumb-mars',
      tradition: 'western',
      when: [{ feature: 'start', op: 'eq', value: 'mars_negative' }],
      meaning: 'A sensitive, easily unsettled mind that feels friction with other people keenly.',
      caveat: null,
      cites: [LOTH, PFA],
    },
    {
      id: 'cx-head-long',
      tradition: 'western',
      when: [{ feature: 'length', op: 'eq', value: 'long' }],
      meaning: 'Wide intellectual reach — able to take on large, complex subjects and follow them a long way.',
      caveat: null,
      cites: [LOTH, MARKUN, BENHAM],
    },
    {
      id: 'cx-head-short',
      tradition: 'western',
      when: [{ feature: 'length', op: 'eq', value: 'short' }],
      meaning: 'A practical, hands-on mind — most at home with concrete tasks, and able to focus closely on one specialty.',
      caveat: null,
      cites: [LOTH, MARKUN],
    },
    {
      id: 'cx-head-end-outer-mars-practical',
      tradition: 'western',
      when: [{ feature: 'end', op: 'eq', value: 'mars_positive' }],
      meaning: 'Practical ideas about everything — the balanced middle course, with the mind pulled neither to cold calculation nor to fancy.',
      caveat: null,
      cites: [BENHAM],
    },
    {
      id: 'cx-head-end-luna',
      tradition: 'western',
      when: [{ feature: 'end', op: 'eq', value: 'luna' }],
      meaning: 'Imagination with a pull toward the mysterious and the unusual.',
      caveat: null,
      cites: [LOTH, MARKUN],
    },
    {
      id: 'cx-head-end-middle',
      tradition: 'western',
      when: [{ feature: 'end', op: 'in', value: ['saturn', 'under_middle'] }],
      meaning: 'Depth of thought, with an interest in music or in questions of faith.',
      caveat: null,
      cites: [LOTH],
    },
    {
      id: 'cx-head-end-ring',
      tradition: 'western',
      when: [{ feature: 'end', op: 'in', value: ['apollo', 'under_ring'] }],
      meaning: 'A wish to be noticed and known for your ideas.',
      caveat: null,
      cites: [LOTH],
    },
    {
      id: 'cx-head-end-little',
      tradition: 'western',
      when: [{ feature: 'end', op: 'in', value: ['mercury', 'under_little'] }],
      meaning: 'A mind drawn to commerce and science, with a sharpening interest in money and what it is worth.',
      caveat: 'An attitude to money, never a forecast of it.',
      cites: [LOTH, PFA],
    },
    {
      id: 'cx-head-deep',
      tradition: 'western',
      when: [{ feature: 'depth', op: 'eq', value: 'deep' }],
      meaning: 'Concentration and a retentive memory — thinking that goes deep rather than wide.',
      caveat: null,
      cites: [PFA, MARKUN],
    },
    {
      id: 'cx-head-faint',
      tradition: 'western',
      when: [{ feature: 'depth', op: 'eq', value: 'faint' }],
      meaning: 'A mind that ranges more than it concentrates — views can shift before they settle.',
      caveat: 'The book describes a line lying on the surface of the palm rather than cut deep. It is not a measure of intelligence.',
      cites: [PFA],
    },
    {
      id: 'cx-head-broken',
      tradition: 'western',
      when: [{ feature: 'continuity', op: 'eq', value: 'broken' }],
      meaning:
        'A break in the head line. The classical rule for any broken line is that the break interrupts what the line shows at that point, and that where the two ends overlap its qualities carry on — so no separate trait is read from the break itself.',
      caveat: null,
      cites: [PFA_CLASSES],
    },
    {
      id: 'cx-head-chained',
      tradition: 'western',
      when: [{ feature: 'continuity', op: 'eq', value: 'chained' }],
      meaning: 'Ideas shift before they settle, so decisions can take longer to reach.',
      caveat: null,
      cites: [LOTH],
    },
    {
      id: 'cx-head-fork',
      tradition: 'western',
      when: [{ feature: 'fork', op: 'gte', value: 1 }],
      meaning: 'Two ways of thinking at once — the practical and the imaginative — which gives range and tact, and can make choosing harder.',
      caveat: 'The old advice for this form is to trust the first impulse rather than weighing both sides for too long.',
      cites: [PFA, MARKUN, BENHAM, STH, SG],
    },
    {
      id: 'cx-head-open-mars',
      tradition: 'western',
      when: [
        { feature: 'join', op: 'in', value: ['separate', 'wide'] },
        { feature: 'end', op: 'eq', value: 'mars_positive' },
      ],
      meaning: 'A natural organiser — drawn to taking the lead in shared causes and public efforts.',
      caveat: 'The book adds that such people will give up a great deal for a cause. Read that as a leaning, not a forecast.',
      cites: [PFA],
    },
    {
      id: 'cx-head-end-outer-mars',
      tradition: 'western',
      when: [
        { feature: 'end', op: 'eq', value: 'mars_positive' },
        { feature: 'join', op: 'eq', value: 'joined' },
      ],
      meaning: 'Strong will and quiet determination — the ability to hold to a principle while keeping nerves out of sight.',
      caveat: null,
      cites: [PFA],
    },
    {
      id: 'cx-head-fork-luna',
      tradition: 'western',
      when: [
        { feature: 'fork', op: 'gte', value: 1 },
        { feature: 'end', op: 'eq', value: 'luna' },
      ],
      meaning: 'A talent for imaginative writing and storytelling.',
      caveat: null,
      cites: [LOTH],
    },
    {
      id: 'cx-head-long-even',
      tradition: 'western',
      when: [
        { feature: 'length', op: 'eq', value: 'long' },
        { feature: 'continuity', op: 'eq', value: 'continuous' },
      ],
      meaning: 'Sound judgement and a clear, steady mind, with the will to carry a decision through.',
      caveat: null,
      cites: [STH, FRITH, GUIDE],
    },
    {
      id: 'cx-head-long-straight',
      tradition: 'western',
      when: [
        { feature: 'length', op: 'eq', value: 'long' },
        { feature: 'curvature', op: 'eq', value: 'straight' },
      ],
      meaning: 'A clear, logical mind with a strong will — careful and economical in its choices.',
      caveat: null,
      cites: [DESB, SG, STH],
    },
    {
      id: 'cx-head-clear-dale',
      tradition: 'indian',
      when: [
        { feature: 'depth', op: 'eq', value: 'deep' },
        { feature: 'continuity', op: 'eq', value: 'continuous' },
      ],
      meaning: 'A cheerful, inventive turn of mind.',
      caveat: 'The book asks for a well-drawn line of good colour. A photo cannot judge colour fairly, so only a clearly marked, unbroken line is read here.',
      cites: [DALE_LIVER],
    },
  ],
};
