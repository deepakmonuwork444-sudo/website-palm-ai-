import type { LineFinder, ThumbPath } from '../finder';
import type { Cite } from '../sources';

/** Fate line finder (tool 7). Rules copied from the app's corpus-rules.ts, 2026-09-26. */

const PFA: Cite = { book: 'cheiro-palmistry-for-all-1916', locator: 'Part I, ch. V — The Line of Destiny or Fate' };
const PFA_CLASSES: Cite = { book: 'cheiro-palmistry-for-all-1916', locator: 'Part I, ch. XVII — Different Classes of Lines' };
const LOTH: Cite = { book: 'cheiro-language-of-the-hand-1900', locator: 'Part II, ch. XI — The Line of Fate, pp. 102–105' };
const MARKUN: Cite = { book: 'markun-what-you-should-know-about-palmistry-1927', locator: 'the section on the Fate Line' };
const GUIDE: Cite = { book: 'cheiro-guide-to-the-hand-1900', locator: 'Ch. XIV — The Line of Fate, p. 89' };
const FRITH: Cite = { book: 'frith-practical-palmistry-1895', locator: 'The Fate Line, p. 88' };
const RAPH: Cite = { book: 'raphael-cheirosophy-1901', locator: 'The Fate Line, p. 132' };
const DALE: Cite = { book: 'dale-indian-palmistry-1895', locator: 'The Line of Saturn — the old name for the fate line' };
const DALE_PLANET: Cite = { book: 'dale-indian-palmistry-1895', locator: 'The Planet Saturn — its mount and the Line of Saturn' };
const JAIN: Cite = { book: 'jain-samudrik-shastra-1927', locator: 'The upward line (the fate line), p. 16' };

const BASE = 'M111 247 C 112 222, 114 196, 118 152';
const LIFE: ThumbPath = { d: 'M160 164 C 134 178, 122 206, 130 244', line: 'life' };
const MIDDLE = ['saturn', 'under_middle'] as const;

export const FATE_FINDER: LineFinder = {
  line: 'fate',
  exclusive: { feature: 'visible', value: false },
  questions: [
    {
      id: 'visible',
      legend: 'Can you see a fate line?',
      help: 'Look for a line running up the middle of your palm towards the middle finger. Many hands have none.',
      options: [
        { value: 'deep', label: 'Yes, deep and strongly marked', evidence: 'A deep, strongly marked fate line', set: { visible: true, depth: 'deep' }, thumb: [{ d: BASE, line: 'fate', style: 'thick' }] },
        { value: 'clear', label: 'Yes, a clear ordinary line', evidence: 'A clear fate line', set: { visible: true }, thumb: [{ d: BASE, line: 'fate' }] },
        { value: 'faint', label: 'Yes, but faint or thin', evidence: 'A faint fate line', set: { visible: true, depth: 'faint' }, thumb: [{ d: BASE, line: 'fate', style: 'thin' }] },
        { value: 'none', label: 'No, I can’t see one', evidence: 'No fate line', set: { visible: false }, thumb: [] },
      ],
    },
    {
      id: 'start',
      legend: 'Where does it start (the end nearest the wrist)?',
      options: [
        { value: 'wrist', label: 'Right at the wrist', evidence: 'Starts at the wrist', set: { start: 'wrist' }, thumb: [{ d: BASE, line: 'fate' }] },
        { value: 'middle', label: 'Halfway up, in the middle of the palm', evidence: 'Starts in the middle of the palm', set: { start: 'plain_of_mars' }, thumb: [{ d: 'M114 206 C 115 188, 116 170, 118 150', line: 'fate' }] },
        { value: 'moon', label: 'Low on the outer edge of the palm', evidence: 'Starts low on the outer palm (Mount of the Moon)', set: { start: 'luna' }, thumb: [{ d: 'M78 236 C 92 210, 108 180, 118 150', line: 'fate' }] },
        { value: 'venus', label: 'Inside the life line, near the thumb', evidence: 'Starts inside the life line (Mount of Venus)', set: { start: 'venus' }, thumb: [LIFE, { d: 'M146 226 C 136 204, 124 178, 118 150', line: 'fate' }] },
      ],
    },
    {
      id: 'end',
      legend: 'Where does it end (the end nearest the fingers)?',
      options: [
        { value: 'middle', label: 'Under the middle finger', evidence: 'Ends under the middle finger', set: { end: 'saturn' }, thumb: [{ d: 'M111 247 C 112 222, 116 180, 120 130', line: 'fate' }] },
        { value: 'index', label: 'Towards the index finger', evidence: 'Ends towards the index finger', set: { end: 'jupiter' }, thumb: [{ d: 'M111 247 C 112 222, 124 170, 146 130', line: 'fate' }] },
        { value: 'ring', label: 'Towards the ring finger', evidence: 'Ends towards the ring finger', set: { end: 'apollo' }, thumb: [{ d: 'M111 247 C 110 222, 100 170, 92 132', line: 'fate' }] },
        { value: 'little', label: 'Towards the little finger', evidence: 'Ends towards the little finger', set: { end: 'mercury' }, thumb: [{ d: 'M111 247 C 108 220, 86 170, 66 138', line: 'fate' }] },
      ],
    },
    {
      id: 'continuity',
      legend: 'Is it one unbroken line?',
      options: [
        { value: 'unbroken', label: 'Yes, unbroken', evidence: 'An unbroken fate line', set: { continuity: 'continuous' }, thumb: [{ d: BASE, line: 'fate' }] },
        { value: 'broken', label: 'It has a break, or comes in pieces', evidence: 'A broken fate line', set: { continuity: 'broken' }, thumb: [{ d: 'M111 247 C 112 234, 112 222, 113 210', line: 'fate' }, { d: 'M115 198 C 116 184, 117 168, 118 152', line: 'fate' }] },
      ],
    },
    {
      id: 'double',
      legend: 'Is there a second line running beside it?',
      options: [
        { value: 'yes', label: 'Yes, a double line', evidence: 'A double (sister) fate line', set: { double: true }, thumb: [{ d: BASE, line: 'fate' }, { d: 'M120 247 C 121 222, 123 196, 127 154', line: 'fate' }] },
        { value: 'no', label: 'No, just one', evidence: 'A single fate line', set: { double: false } },
      ],
    },
  ],
  rules: [
    {
      id: 'cx-fate-absent',
      tradition: 'western',
      when: [{ feature: 'visible', op: 'eq', value: false }],
      meaning: 'Direction is not set out in advance — work tends to follow circumstances and choices as they come, rather than one fixed track.',
      caveat: null,
      cites: [MARKUN, LOTH],
    },
    {
      id: 'cx-fate-deep',
      tradition: 'western',
      when: [{ feature: 'depth', op: 'eq', value: 'deep' }],
      meaning: 'A steady, routine-shaped working life — consistency and repetition rather than constant change.',
      caveat: 'One old writer warns against reading a heavily marked fate line as luck. It is not read that way here.',
      cites: [MARKUN, PFA],
    },
    {
      id: 'cx-fate-faint',
      tradition: 'western',
      when: [{ feature: 'depth', op: 'eq', value: 'faint' }],
      meaning: 'A strong preference for self-direction — little patience with the idea that anything but your own choices decides your path.',
      caveat: null,
      cites: [PFA],
    },
    {
      id: 'cx-fate-start-wrist',
      tradition: 'western',
      when: [{ feature: 'start', op: 'eq', value: 'wrist' }],
      meaning: 'Responsibility tends to arrive early — a sense of duty toward work that starts young.',
      caveat: null,
      cites: [MARKUN],
    },
    {
      id: 'cx-fate-start-plain-of-mars',
      tradition: 'western',
      when: [{ feature: 'start', op: 'eq', value: 'plain_of_mars' }],
      meaning: 'The self-made pattern: what you build tends to come from your own persistence rather than from an easy start.',
      caveat: null,
      cites: [PFA, LOTH],
    },
    {
      id: 'cx-fate-start-luna',
      tradition: 'western',
      when: [{ feature: 'start', op: 'eq', value: 'luna' }],
      meaning: 'A path shaped a great deal by other people — work where the public, patrons or partners play a large part.',
      caveat: 'Describes where influence comes from, not whether it helps.',
      cites: [PFA, LOTH, MARKUN, GUIDE, FRITH],
    },
    {
      id: 'cx-fate-start-venus',
      tradition: 'western',
      when: [{ feature: 'start', op: 'eq', value: 'venus' }],
      meaning: 'Close relationships and strong feelings weigh heavily on the choices you make about work.',
      caveat: null,
      cites: [PFA],
    },
    {
      id: 'cx-fate-end-middle-dale',
      tradition: 'indian',
      when: [{ feature: 'end', op: 'in', value: MIDDLE }],
      meaning: 'A reflective, deliberate approach to work — decisions are thought through before they are acted on.',
      caveat: null,
      cites: [DALE],
    },
    {
      id: 'cx-fate-end-index',
      tradition: 'western',
      when: [{ feature: 'end', op: 'in', value: ['jupiter', 'under_index'] }],
      meaning: 'Effort is pulled toward responsibility and leading others — ambition that looks for a position of trust.',
      caveat: 'The old books call this a sign of success. Here it describes where effort tends to go, not what it will bring.',
      cites: [PFA, LOTH],
    },
    {
      id: 'cx-fate-end-ring',
      tradition: 'western',
      when: [{ feature: 'end', op: 'in', value: ['apollo', 'under_ring'] }],
      meaning: 'Effort is drawn toward visible, public-facing work, where being recognised matters.',
      caveat: 'The old books call this a sign of success. Here it describes where effort tends to go, not what it will bring.',
      cites: [PFA],
    },
    {
      id: 'cx-fate-end-little',
      tradition: 'western',
      when: [{ feature: 'end', op: 'in', value: ['mercury', 'under_little'] }],
      meaning: 'Effort is drawn toward trade, business or skilled technical work — the fields the old books link with commerce and science.',
      caveat: 'The old books call this a sign of success. Here it describes where effort tends to go, not what it will bring.',
      cites: [PFA],
    },
    {
      id: 'cx-fate-broken',
      tradition: 'western',
      when: [{ feature: 'continuity', op: 'eq', value: 'broken' }],
      meaning: 'A working life that changes direction — more likely to include a real change of occupation or surroundings than one straight road.',
      caveat: 'The books disagree on whether such a change turns out well. Neither view is assumed here.',
      cites: [PFA, MARKUN, RAPH],
    },
    {
      id: 'cx-fate-broken-jain',
      tradition: 'indian',
      when: [{ feature: 'continuity', op: 'eq', value: 'broken' }],
      meaning: 'Quick and capable, but restless — staying with one course is harder than starting one.',
      caveat: null,
      cites: [JAIN],
    },
    {
      id: 'cx-fate-continuous-middle-dale',
      tradition: 'indian',
      when: [
        { feature: 'continuity', op: 'eq', value: 'continuous' },
        { feature: 'end', op: 'in', value: MIDDLE },
      ],
      meaning: 'A quiet, provident and serious-minded nature — the kind of person others go to for considered advice.',
      caveat: null,
      cites: [DALE_PLANET],
    },
    {
      id: 'cx-fate-wrist-middle',
      tradition: 'western',
      when: [
        { feature: 'start', op: 'eq', value: 'wrist' },
        { feature: 'end', op: 'in', value: MIDDLE },
      ],
      meaning: 'A strong, self-directed personality that tends to push past obstacles on its own path.',
      caveat: null,
      cites: [GUIDE],
    },
  ],
  notes: [
    {
      id: 'book-sister-lines',
      when: [{ feature: 'double', op: 'eq', value: true }],
      text: 'The app has no separate rule for a double fate line. Cheiro’s general rule for any sister line — a second line running close beside the first — is that it strengthens the line it runs with.',
      cites: [PFA_CLASSES],
    },
  ],
};
