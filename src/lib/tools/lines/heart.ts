import type { LineFinder } from '../finder';
import type { Cite } from '../sources';

/** Heart line finder (tool 4). Rules copied from the app's corpus-rules.ts, 2026-09-26. */

const PFA: Cite = { book: 'cheiro-palmistry-for-all-1916', locator: 'Part I, ch. VII: The Line of Heart' };
const LOTH: Cite = { book: 'cheiro-language-of-the-hand-1900', locator: 'Part II, ch. X: The Line of Heart, pp. 98–101' };
const MARKUN: Cite = { book: 'markun-what-you-should-know-about-palmistry-1927', locator: 'the section on the Heart Line' };
const GUIDE: Cite = { book: 'cheiro-guide-to-the-hand-1900', locator: 'Ch. XIII: The Line of Heart, pp. 84–88' };
const FRITH: Cite = { book: 'frith-practical-palmistry-1895', locator: 'The Heart Line, pp. 57–59' };
const HAM: Cite = { book: 'heron-allen-manual-of-cheirosophy-1885', locator: 'Cheiromancy, § 2: The Line of Heart, pp. 244–245' };
const HAP: Cite = { book: 'heron-allen-practical-cheirosophy-1887', locator: 'The Line of Heart, pp. 114–115' };
const DESB: Cite = { book: 'desbarrolles-chiromancie-nouvelle-1859', locator: 'Ligne de cœur, pp. 215–216' };
const BENHAM: Cite = { book: 'benham-laws-of-scientific-hand-reading-1900', locator: 'Part II, ch. V: The Line of Heart, pp. 389–393' };
const RAPH: Cite = { book: 'raphael-cheirosophy-1901', locator: 'The Heart Line, pp. 121–124' };
const STH: Cite = { book: 'st-hill-grammar-of-palmistry-1893', locator: 'Line of Heart (Mensal), pp. 46–47' };
const SG: Cite = { book: 'saint-germain-practice-of-palmistry-1900', locator: 'The Line of Heart, pp. 242–243' };
const DALE: Cite = { book: 'dale-indian-palmistry-1895', locator: 'The Line of Fortune (the old name for the heart line)' };
const JAIN: Cite = { book: 'jain-samudrik-shastra-1927', locator: 'The top line (the heart line), pp. 10–11' };

const INDEX = ['jupiter', 'under_index'] as const;
const MIDDLE = ['saturn', 'under_middle'] as const;

export const HEART_FINDER: LineFinder = {
  line: 'heart',
  questions: [
    {
      id: 'end',
      legend: 'Where does your heart line end?',
      help: 'Start at the little-finger edge of your palm and follow the top line towards your first fingers.',
      options: [
        { value: 'index', label: 'Under the index finger', evidence: 'Ends under the index finger', set: { end: 'jupiter' } },
        { value: 'between', label: 'Between the index and middle fingers', evidence: 'Ends between the index and middle fingers', set: { end: 'between_jupiter_and_saturn' } },
        { value: 'middle', label: 'Under the middle finger', evidence: 'Ends under the middle finger', set: { end: 'saturn' } },
      ],
    },
    {
      id: 'length',
      legend: 'How long is it?',
      options: [
        { value: 'long', label: 'Long: runs most of the way across the palm', evidence: 'A long heart line', set: { length: 'long' } },
        { value: 'short', label: 'Short: covers less than half the palm', evidence: 'A short heart line', set: { length: 'short' } },
      ],
    },
    {
      id: 'depth',
      legend: 'How clearly is it marked?',
      options: [
        { value: 'deep', label: 'Deep and clearly cut', evidence: 'A deep, clearly marked heart line', set: { depth: 'deep' } },
        { value: 'faint', label: 'Faint or thin', evidence: 'A faint heart line', set: { depth: 'faint' } },
      ],
    },
    {
      id: 'continuity',
      legend: 'Is it one unbroken line?',
      options: [
        { value: 'unbroken', label: 'Yes, unbroken', evidence: 'An unbroken heart line', set: { continuity: 'continuous' } },
        { value: 'broken', label: 'It has a break (a gap)', evidence: 'A break in the heart line', set: { continuity: 'broken' } },
        { value: 'chained', label: 'It looks like a chain of small loops', evidence: 'A chained heart line', set: { continuity: 'chained' } },
      ],
    },
    {
      id: 'fork',
      legend: 'Does it split into a fork at the finger end?',
      options: [
        { value: 'yes', label: 'Yes, a fork', evidence: 'A fork at the end', set: { fork: 1 } },
        { value: 'no', label: 'No fork', evidence: 'No fork', set: { fork: 0 } },
      ],
    },
    {
      id: 'branches',
      legend: 'Do small branches rise up from it?',
      options: [
        { value: 'yes', label: 'Yes, two or more', evidence: 'Two or more branches rising up', set: { branchUp: 2 } },
        { value: 'no', label: 'No branches', evidence: 'No rising branches', set: { branchUp: 0 } },
      ],
    },
  ],
  rules: [
    {
      id: 'cx-heart-end-index',
      tradition: 'western',
      when: [{ feature: 'end', op: 'in', value: INDEX }],
      meaning: 'Loyal, steady affection held to high ideals — once you are truly attached, you tend to stay attached.',
      caveat: 'A tendency in how affection is given, not a prediction about any relationship.',
      cites: [PFA, LOTH, MARKUN],
    },
    {
      id: 'cx-heart-end-index-ideal',
      tradition: 'western',
      when: [{ feature: 'end', op: 'in', value: INDEX }],
      meaning: 'An idealistic view of love — a tendency to look up to the person you love.',
      caveat: 'A way of seeing love, not a prediction about any relationship.',
      cites: [BENHAM, GUIDE, RAPH],
    },
    {
      id: 'cx-heart-end-between',
      tradition: 'western',
      when: [{ feature: 'end', op: 'eq', value: 'between_jupiter_and_saturn' }],
      meaning: 'A calm but deep way of caring — not showy in love, but willing to do a great deal for the people you care about.',
      caveat: null,
      cites: [PFA, LOTH, MARKUN, RAPH],
    },
    {
      id: 'cx-heart-end-between-practical',
      tradition: 'western',
      when: [{ feature: 'end', op: 'eq', value: 'between_jupiter_and_saturn' }],
      meaning: 'Sensible, practical affection — strong feeling that is not easily swept away by sentiment.',
      caveat: null,
      cites: [BENHAM],
    },
    {
      id: 'cx-heart-end-middle',
      tradition: 'western',
      when: [{ feature: 'end', op: 'in', value: MIDDLE }],
      meaning: 'Affection that is private and not often put on display, alongside a clear sense of what you want from a relationship.',
      caveat: null,
      cites: [PFA, LOTH],
    },
    {
      id: 'cx-heart-end-middle-physical',
      tradition: 'western',
      when: [{ feature: 'end', op: 'in', value: MIDDLE }],
      meaning: 'Affection that is shown through closeness and presence as much as through words.',
      caveat: null,
      cites: [GUIDE, DESB, HAM, BENHAM],
    },
    {
      id: 'cx-heart-long',
      tradition: 'western',
      when: [{ feature: 'length', op: 'eq', value: 'long' }],
      meaning: 'Strong, wholehearted affection — the old books read a longer heart line as a fuller capacity for attachment.',
      caveat: 'Describes how strongly affection is felt, not how any relationship will go.',
      cites: [HAM, HAP, RAPH, STH, SG, DESB],
    },
    {
      id: 'cx-heart-long-jain',
      tradition: 'indian',
      when: [{ feature: 'length', op: 'eq', value: 'long' }],
      meaning: 'A spirited, cheerful and well-meaning nature.',
      caveat: 'The book speaks of a bright, extended line under the fingers. A photo can judge its length, not its brightness.',
      cites: [JAIN],
    },
    {
      id: 'cx-heart-short',
      tradition: 'western',
      when: [{ feature: 'length', op: 'eq', value: 'short' }],
      meaning: 'Sentiment is shown sparingly — feelings are not always put into words or gestures.',
      caveat: 'This describes how feeling is shown, not how much is felt.',
      cites: [PFA, FRITH],
    },
    {
      id: 'cx-heart-short-dale',
      tradition: 'indian',
      when: [{ feature: 'length', op: 'eq', value: 'short' }],
      meaning: 'Attachment that is slower to hold steady — the reverse of the constancy this tradition reads in a long, unbroken heart line.',
      caveat: null,
      cites: [DALE],
    },
    {
      id: 'cx-heart-deep',
      tradition: 'western',
      when: [{ feature: 'depth', op: 'eq', value: 'deep' }],
      meaning: 'A clearly marked heart line is the form the classical books hold up as the ideal: a warm and steady affectionate nature.',
      caveat: null,
      cites: [PFA, LOTH],
    },
    {
      id: 'cx-heart-faint',
      tradition: 'western',
      when: [{ feature: 'depth', op: 'eq', value: 'faint' }],
      meaning: 'Feelings run quietly under the surface, with a cooler, more detached manner in affection.',
      caveat: null,
      cites: [PFA],
    },
    {
      id: 'cx-heart-broken-dale',
      tradition: 'indian',
      when: [{ feature: 'continuity', op: 'eq', value: 'broken' }],
      meaning: 'Attachment that is slower to hold steady — the reverse of the constancy this tradition reads in a long, unbroken heart line.',
      caveat: null,
      cites: [DALE],
    },
    {
      id: 'cx-heart-chained',
      tradition: 'western',
      when: [{ feature: 'continuity', op: 'eq', value: 'chained' }],
      meaning: 'Attraction forms easily and moves on easily — interest in people shifts more than it settles.',
      caveat: 'Read as a pattern of attraction, not a judgement of character.',
      cites: [PFA, MARKUN],
    },
    {
      id: 'cx-heart-fork',
      tradition: 'western',
      when: [{ feature: 'fork', op: 'gte', value: 1 }],
      meaning: 'A balanced, honest and faithful style of affection — ideals and everyday warmth held together.',
      caveat: 'The books describe a fork at the finger end of the line. A photo cannot always show where the fork sits.',
      cites: [PFA, LOTH, MARKUN, GUIDE, STH, RAPH],
    },
    {
      id: 'cx-heart-fork-jain',
      tradition: 'indian',
      when: [{ feature: 'fork', op: 'gte', value: 1 }],
      meaning: 'A cheerful, bold and generous-minded nature, ready to help friends get things done.',
      caveat: null,
      cites: [JAIN],
    },
    {
      id: 'cx-heart-branches-up',
      tradition: 'western',
      when: [{ feature: 'branchUp', op: 'gte', value: 2 }],
      meaning: 'Friendship carries real weight — warmth is shared through close, supportive friendships.',
      caveat: null,
      cites: [MARKUN],
    },
    {
      id: 'cx-heart-long-index',
      tradition: 'western',
      when: [
        { feature: 'length', op: 'eq', value: 'long' },
        { feature: 'end', op: 'in', value: INDEX },
      ],
      meaning: 'Affection given so fully that it can tip into possessiveness or jealousy — something the old books tell such people to watch.',
      caveat: 'The books describe a heart line running right across the hand. This is a caution about a tendency, not a judgement of character.',
      cites: [LOTH, PFA, HAM, GUIDE, SG, DESB, BENHAM, FRITH],
    },
    {
      id: 'cx-heart-index-continuous',
      tradition: 'western',
      when: [
        { feature: 'end', op: 'in', value: INDEX },
        { feature: 'continuity', op: 'eq', value: 'continuous' },
      ],
      meaning: 'An affectionate disposition with an even temper — the unbroken line reaching the index finger is the form the old books hold up as the well-made heart line.',
      caveat: null,
      cites: [HAM, DESB, STH],
    },
    {
      id: 'cx-heart-long-continuous-dale',
      tradition: 'indian',
      when: [
        { feature: 'length', op: 'eq', value: 'long' },
        { feature: 'continuity', op: 'eq', value: 'continuous' },
      ],
      meaning: 'Constancy — a steady, dependable nature in attachments.',
      caveat: null,
      cites: [DALE],
    },
  ],
};
