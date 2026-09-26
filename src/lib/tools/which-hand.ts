import type { Cite } from './sources';

/**
 * Which-hand quiz (tool 8) — pure logic.
 *
 * Two traditions, both attributed, never mixed silently (CONTENT_GUIDE.md §4.5):
 * - Writing-hand convention (what the app uses, `hand-role.ts`): Cheiro reads the
 *   right hand as what a person has developed and the left as what they were
 *   born with; "in palmistry tradition" this is taken to mean the hand you
 *   write with and the other hand. Both hands used → the rule is not applied.
 * - The Indian custom (Dale, Indian Palmistry, 1895, "The Hand to Examine"):
 *   "the right palm of the male and the left palm of the female", and "in
 *   either case take the hand in which the signs and lines are clearly shown".
 * A custom about which hand to look at — no line reads a man's or a woman's
 * destiny differently (CONTENT_GUIDE.md §4.2).
 */

export type WritingHand = 'right' | 'left' | 'both';
export type Goal = 'now' | 'born' | 'both';
export type Tradition = 'writing' | 'indian';
export type Person = 'man' | 'woman' | 'skip';

export interface WhichHandAnswers {
  tradition?: Tradition;
  writing?: WritingHand;
  goal?: Goal;
  person?: Person;
}

export type HandAdvice = 'right' | 'left' | 'either' | 'both';

export interface WhichHandResult {
  hand: HandAdvice;
  headline: string;
  why: string[];
  cites: Cite[];
  /** Always shown: the other tradition, one line, so neither is hidden. */
  otherView: string;
}

export const CHEIRO_HANDS: Cite = { book: 'cheiro-palmistry-for-all-1916', locator: 'Part I, ch. XVII — Right and Left Hands' };
export const DALE_HAND: Cite = { book: 'dale-indian-palmistry-1895', locator: 'The Hand to Examine' };

const other = (hand: 'right' | 'left'): 'right' | 'left' => (hand === 'right' ? 'left' : 'right');
const cap = (hand: string) => hand.charAt(0).toUpperCase() + hand.slice(1);

const WRITING_VIEW =
  'Many palmists today read the hand you write with, whoever you are: it is read as the life you are making, and the other hand as what you started with.';
const INDIAN_VIEW =
  'An old Indian custom, recorded by Mrs Dale in 1895, reads the right palm of a man and the left palm of a woman.';

/** The questions still needed before a result can be given. */
export function missing(answers: WhichHandAnswers): (keyof WhichHandAnswers)[] {
  const need: (keyof WhichHandAnswers)[] = [];
  if (!answers.tradition) need.push('tradition');
  if (answers.tradition === 'indian') {
    if (!answers.person) need.push('person');
  } else if (answers.tradition === 'writing') {
    if (!answers.writing) need.push('writing');
    if (answers.writing && answers.writing !== 'both' && !answers.goal) need.push('goal');
  }
  return need;
}

export function whichHand(answers: WhichHandAnswers): WhichHandResult | null {
  if (missing(answers).length > 0) return null;

  if (answers.tradition === 'indian') {
    const cites = [DALE_HAND];
    const clearest = 'The same book adds: in either case, take the hand where the lines are clearly shown.';
    if (answers.person === 'man') {
      return {
        hand: 'right',
        headline: 'Read your right hand',
        why: ['In the Indian custom Mrs Dale records, a man’s right palm is the one examined.', clearest],
        cites,
        otherView: WRITING_VIEW,
      };
    }
    if (answers.person === 'woman') {
      return {
        hand: 'left',
        headline: 'Read your left hand',
        why: ['In the Indian custom Mrs Dale records, a woman’s left palm is the one examined.', clearest],
        cites,
        otherView: WRITING_VIEW,
      };
    }
    return {
      hand: 'either',
      headline: 'Read the hand where your lines are clearest',
      why: [
        'The Indian custom reads a man’s right palm and a woman’s left palm. You chose not to say, so use the book’s other rule.',
        clearest,
      ],
      cites,
      otherView: WRITING_VIEW,
    };
  }

  const cites = [CHEIRO_HANDS];
  if (answers.writing === 'both') {
    return {
      hand: 'either',
      headline: 'Read either hand — start with the clearer one',
      why: [
        'You use both hands, so the tradition of one writing hand and one other hand is not applied.',
        'Cheiro’s advice is to look at both hands together and see whether they agree.',
      ],
      cites,
      otherView: INDIAN_VIEW,
    };
  }
  const writing = answers.writing === 'left' ? 'left' : 'right';
  if (answers.goal === 'born') {
    return {
      hand: other(writing),
      headline: `Read your ${other(writing)} hand`,
      why: [
        `It is not your writing hand. Tradition reads it as your natural tendencies — what you started with.`,
        'Cheiro reads the right hand as what a person has developed and the left as what they were born with; in palmistry tradition that is taken to mean the writing hand and the other one.',
      ],
      cites,
      otherView: INDIAN_VIEW,
    };
  }
  if (answers.goal === 'both') {
    return {
      hand: 'both',
      headline: `Read both hands — start with your ${writing}`,
      why: [
        `Your ${writing} hand is your writing hand: tradition reads it as the life you are making now.`,
        `Your ${other(writing)} hand is read as what you started with. Cheiro says to compare the two: where they agree, the sign is read more firmly.`,
      ],
      cites,
      otherView: INDIAN_VIEW,
    };
  }
  return {
    hand: writing,
    headline: `Read your ${writing} hand`,
    why: [
      `${cap(writing)} is your writing hand. Tradition reads it as the life you have shaped so far and are shaping now.`,
      'Cheiro reads the right hand as what a person has developed and the left as what they were born with; in palmistry tradition that is taken to mean the writing hand and the other one.',
    ],
    cites,
    otherView: INDIAN_VIEW,
  };
}
