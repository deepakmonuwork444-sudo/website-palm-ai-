import type { LineName, MountId } from './palm-geometry';

/**
 * Palm reading quiz (tool 12): spot the line on a diagram, plus the app's
 * lesson questions (`engagement/lessons.ts`), in English. Pure: the page shows
 * one question at a time; scoring and the share text are unit-tested.
 * No personal data: the score is never sent anywhere.
 */

export interface QuizOption {
  id: string;
  label: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  /** What the diagram highlights, if anything. */
  show: { line: LineName } | { mount: MountId } | null;
  options: readonly QuizOption[];
  answer: string;
  explain: string;
}

const LINES: QuizOption[] = [
  { id: 'heart', label: 'Heart line' },
  { id: 'head', label: 'Head line' },
  { id: 'life', label: 'Life line' },
  { id: 'fate', label: 'Fate line' },
];

export const QUIZ: readonly QuizQuestion[] = [
  {
    id: 'spot-heart',
    prompt: 'Which line is highlighted?',
    show: { line: 'heart' },
    options: LINES,
    answer: 'heart',
    explain: 'The heart line is the uppermost major line, running across the palm just below the fingers.',
  },
  {
    id: 'spot-life',
    prompt: 'Which line is highlighted?',
    show: { line: 'life' },
    options: LINES,
    answer: 'life',
    explain: 'The life line curves around the base of the thumb, from between the thumb and index finger towards the wrist.',
  },
  {
    id: 'spot-head',
    prompt: 'Which line is highlighted?',
    show: { line: 'head' },
    options: LINES,
    answer: 'head',
    explain: 'The head line crosses the middle of the palm. It often begins together with the life line before the two separate.',
  },
  {
    id: 'spot-fate',
    prompt: 'Which line is highlighted?',
    show: { line: 'fate' },
    options: LINES,
    answer: 'fate',
    explain: 'The fate line runs up the middle of the palm towards the middle finger.',
  },
  {
    id: 'mount-jupiter',
    prompt: 'Which mount (parvat) is highlighted?',
    show: { mount: 'jupiter' },
    options: [
      { id: 'jupiter', label: 'Jupiter (Guru)' },
      { id: 'saturn', label: 'Saturn (Shani)' },
      { id: 'mercury', label: 'Mercury (Budh)' },
    ],
    answer: 'jupiter',
    explain: 'The Mount of Jupiter (Guru parvat) is the pad under the index finger, traditionally linked with ambition.',
  },
  {
    id: 'mount-venus',
    prompt: 'Which mount (parvat) is highlighted?',
    show: { mount: 'venus' },
    options: [
      { id: 'moon', label: 'Moon (Chandra)' },
      { id: 'venus', label: 'Venus (Shukra)' },
      { id: 'sun', label: 'Sun (Surya)' },
    ],
    answer: 'venus',
    explain: 'The Mount of Venus (Shukra parvat) is the base of the thumb, inside the life line, traditionally linked with warmth.',
  },
  {
    id: 'short-life',
    prompt: 'A short life line traditionally says…',
    show: null,
    options: [
      { id: 'nothing', label: 'Nothing about how long you live' },
      { id: 'short', label: 'A short life' },
      { id: 'luck', label: 'Bad luck' },
    ],
    answer: 'nothing',
    explain: 'A short life line is not read as a short life. Even the old books warn against reading its length as a count of years.',
  },
  {
    id: 'no-fate',
    prompt: 'A missing fate line is…',
    show: null,
    options: [
      { id: 'rare', label: 'Extremely rare' },
      { id: 'common', label: 'Common, and not a bad sign' },
      { id: 'warning', label: 'A warning' },
    ],
    answer: 'common',
    explain: 'Many palms show the fate line faintly or not at all. That is common and is not read as a bad sign.',
  },
  {
    id: 'curving-head',
    prompt: 'A curving head line is traditionally linked with…',
    show: null,
    options: [
      { id: 'imagination', label: 'Imagination' },
      { id: 'money', label: 'Money' },
      { id: 'health', label: 'Health' },
    ],
    answer: 'imagination',
    explain: 'Traditionally a straighter head line is linked with practical thinking, and a curving one with imagination.',
  },
  {
    id: 'writing-hand',
    prompt: 'The hand you write with is traditionally read as…',
    show: null,
    options: [
      { id: 'making', label: 'The life you are making' },
      { id: 'past', label: 'Your past lives' },
      { id: 'nothing', label: 'Nothing at all' },
    ],
    answer: 'making',
    explain: 'The hand you write with is traditionally read as the life you are making; the other hand as what you started with.',
  },
];

export function isCorrect(question: QuizQuestion, optionId: string): boolean {
  return question.answer === optionId;
}

/** Number of correct answers; unknown question ids are ignored. */
export function score(answers: Readonly<Record<string, string>>): number {
  return QUIZ.filter((question) => answers[question.id] === question.answer).length;
}

/** A plain message for the score card. No comparison with other people (we don't collect scores). */
export function scoreMessage(correct: number, total: number = QUIZ.length): string {
  if (correct === total) return 'Every one right. You know your way around a palm.';
  if (correct >= Math.ceil(total * 0.7)) return 'Well done. You know the main lines.';
  if (correct >= Math.ceil(total * 0.4)) return 'A good start. The palm map is a quick way to learn the rest.';
  return 'Everyone starts somewhere. Try the palm map, then take the quiz again.';
}

/** The text a person can share: their score and the quiz link, nothing else. */
export function shareText(correct: number, url: string, total: number = QUIZ.length): string {
  return `I got ${correct} of ${total} on the PalmSays palm reading quiz. Can you spot the lines? ${url}`;
}
