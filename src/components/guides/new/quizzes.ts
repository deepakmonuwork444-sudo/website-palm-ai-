/**
 * "Check yourself" questions for the P2 guides that are not line pillars
 * (SEMANTIC_SEO_PLAN.md Phase 2 row 2.5, WEB-DEC-054): /palm-mounts/,
 * /hand-types/, /palmistry-fingers/, /sun-line/, /palm-crosses/. Same rules
 * as the v4 CheckQuiz (WEB-DEC-047): 2 or 3 questions, at most 3 options each
 * (the :has() rules in teach.css cover options 0 to 2), exactly one right
 * answer, and a short answer for EVERY option. English only until the Hindi
 * twins exist. tests/unit/guides-p2.test.ts checks these rules.
 */

export interface QuizOption {
  text: string;
  ok: boolean;
  fb: string;
}

export interface QuizItem {
  q: string;
  options: QuizOption[];
}

export const PAGE_QUIZZES: Readonly<Record<string, readonly QuizItem[]>> = {
  '/palm-mounts/': [
    {
      q: 'Where is the mount of Venus?',
      options: [
        { text: 'Under the index finger', ok: false, fb: 'That is the mount of Jupiter.' },
        { text: 'The large pad at the base of the thumb', ok: true, fb: 'It sits inside the curve of the life line.' },
        { text: 'On the outer edge, above the wrist', ok: false, fb: 'That is the mount of the Moon.' },
      ],
    },
    {
      q: 'Which finger has the mount of the Sun under it?',
      options: [
        { text: 'The index finger', ok: false, fb: 'Jupiter sits under the index finger.' },
        { text: 'The ring finger', ok: true, fb: 'The sun line runs up towards it too.' },
        { text: 'The little finger', ok: false, fb: 'Mercury sits under the little finger.' },
      ],
    },
    {
      q: 'How do the books read a flat mount?',
      options: [
        { text: 'As bad luck', ok: false, fb: 'No mount is read as luck, good or bad.' },
        { text: 'Its qualities play a smaller part', ok: true, fb: 'A flat mount softens a quality. It is not a lack.' },
        { text: 'As a sign of illness', ok: false, fb: 'Mounts are not a health test.' },
      ],
    },
  ],
  '/hand-types/': [
    {
      q: 'In the modern element system, a square palm with long fingers is…',
      options: [
        { text: 'An earth hand', ok: false, fb: 'An earth hand has a square palm with short fingers.' },
        { text: 'An air hand', ok: true, fb: 'Square palm, long fingers.' },
        { text: 'A water hand', ok: false, fb: 'A water hand has a long palm with long fingers.' },
      ],
    },
    {
      q: 'Which system do the classical books, such as Cheiro’s, use?',
      options: [
        { text: 'Earth, air, fire and water', ok: false, fb: 'That system is modern. The old books don’t use it.' },
        { text: 'Seven types, from elementary to mixed', ok: true, fb: 'd’Arpentigny set them out, and Cheiro followed him.' },
        { text: 'Only the lines, not the shape', ok: false, fb: 'The classical books read the shape first, then the lines.' },
      ],
    },
    {
      q: 'A hand whose fingers are each a different shape is called…',
      options: [
        { text: 'A mixed hand', ok: true, fb: 'The books read it as versatility.' },
        { text: 'A psychic hand', ok: false, fb: 'A psychic hand is long and narrow, with slender, pointed fingers.' },
        { text: 'A spatulate hand', ok: false, fb: 'A spatulate hand has fingertips that widen at the ends.' },
      ],
    },
  ],
  '/palmistry-fingers/': [
    {
      q: 'Which finger is the finger of Jupiter?',
      options: [
        { text: 'The index finger', ok: true, fb: 'Its mount, Jupiter, sits just below it.' },
        { text: 'The middle finger', ok: false, fb: 'The middle finger is the finger of Saturn.' },
        { text: 'The ring finger', ok: false, fb: 'The ring finger is the finger of the Sun.' },
      ],
    },
    {
      q: 'What do the books read in a wide gap between the index and middle fingers?',
      options: [
        { text: 'Independence of thought', ok: true, fb: 'Each gap is read as a kind of independence.' },
        { text: 'Money slipping away', ok: false, fb: 'The books we use read the gaps for independence, never for money.' },
        { text: 'A health problem', ok: false, fb: 'Finger gaps are not a health test.' },
      ],
    },
    {
      q: 'What are the three sections of each finger called?',
      options: [
        { text: 'Mounts', ok: false, fb: 'Mounts are the pads of the palm.' },
        { text: 'Phalanges', ok: true, fb: 'Cheiro reads them from the tip down: ideals, reason, material things.' },
        { text: 'Bracelets', ok: false, fb: 'Bracelets are the creases across the wrist.' },
      ],
    },
  ],
  '/sun-line/': [
    {
      q: 'Which finger does the sun line run towards?',
      options: [
        { text: 'The middle finger', ok: false, fb: 'That is the fate line.' },
        { text: 'The ring finger', ok: true, fb: 'The mount of the Sun sits under it.' },
        { text: 'The little finger', ok: false, fb: 'That is the Mercury line.' },
      ],
    },
    {
      q: 'What does it mean if you have no sun line?',
      options: [
        { text: 'No success in life', ok: false, fb: 'No line decides success. Even an old palmistry book warns against reading it that way.' },
        { text: 'Nothing bad: it is not read as hardship', ok: true, fb: 'Markun’s book reads it, at most, as an easy-going attitude to small sums.' },
        { text: 'A health problem', ok: false, fb: 'Palm lines are not a health test.' },
      ],
    },
    {
      q: 'Which is another name for the sun line?',
      options: [
        { text: 'The line of Apollo', ok: true, fb: 'Also the line of success, or of brilliancy.' },
        { text: 'The line of Mars', ok: false, fb: 'The line of Mars is a sister line inside the life line.' },
        { text: 'The girdle of Venus', ok: false, fb: 'The girdle of Venus curves above the heart line.' },
      ],
    },
  ],
  '/palm-crosses/': [
    {
      q: 'Where does the mystic cross sit?',
      options: [
        { text: 'Between the heart and head lines', ok: true, fb: 'Most often under the middle finger.' },
        { text: 'On the ball of the thumb', ok: false, fb: 'That is the mount of Venus.' },
        { text: 'Across the wrist', ok: false, fb: 'Those are the bracelet lines.' },
      ],
    },
    {
      q: 'Two long lines crossing on your palm are…',
      options: [
        { text: 'A mystic cross', ok: false, fb: 'The books look for a small, clearly formed X.' },
        { text: 'An ordinary crossing of lines', ok: true, fb: 'Long lines cross on every palm.' },
        { text: 'A rare sign', ok: false, fb: 'Lines crossing is common, not a sign.' },
      ],
    },
    {
      q: 'Can a phone photo show small crosses reliably?',
      options: [
        { text: 'Yes, always', ok: false, fb: 'Small marks are only a few pixels wide in most phone photos.' },
        { text: 'Not usually', ok: true, fb: 'Look at your hand in bright daylight instead.' },
        { text: 'Only on the left hand', ok: false, fb: 'The hand makes no difference; the size of the mark does.' },
      ],
    },
  ],
  // Phase 3 guides (WEB-FEAT-039/046/040/037). Same rules as above.
  '/palmistry-m/': [
    {
      q: 'Which lines form the M on the palm?',
      options: [
        { text: 'The heart, head, life and fate lines', ok: true, fb: 'Where they cross and join, they can look like a capital M.' },
        { text: 'The marriage lines', ok: false, fb: 'Those are short lines on the edge, under the little finger.' },
        { text: 'The creases on the fingers', ok: false, fb: 'The M is made by the major lines in the middle of the palm.' },
      ],
    },
    {
      q: 'What do the classical palmistry books say an M means?',
      options: [
        { text: 'Wealth and luck', ok: false, fb: 'No classical book says this. It is a modern claim.' },
        { text: 'Nothing: they don’t describe an M', ok: true, fb: 'They read the four lines that form it, one by one.' },
        { text: 'A gift for seeing the future', ok: false, fb: 'That is a modern belief with no source in the books.' },
      ],
    },
    {
      q: 'Which line most often decides whether your M is full?',
      options: [
        { text: 'The heart line', ok: false, fb: 'It is the top stroke, but it is not the line that usually goes missing.' },
        { text: 'The fate line', ok: true, fb: 'It is the major line most often faint or missing.' },
        { text: 'The life line', ok: false, fb: 'It curves round the thumb; it is not the line that usually decides.' },
      ],
    },
  ],
  '/lucky-signs/': [
    {
      q: 'What makes a mark a real sign, in Cheiro’s words?',
      options: [
        { text: 'It is large and dark', ok: false, fb: 'Size is not the test. Clearness is.' },
        { text: 'It is clear, not made by lines crossing by chance', ok: true, fb: 'He asks that a triangle be clear and distinct.' },
        { text: 'It is on the left hand', ok: false, fb: 'Signs are read on either hand.' },
      ],
    },
    {
      q: 'What does Cheiro call the square?',
      options: [
        { text: 'The mark of preservation', ok: true, fb: 'He reads it as protection at that point, a symbol in the books.' },
        { text: 'The money sign', ok: false, fb: 'No book calls it that.' },
        { text: 'A bad omen', ok: false, fb: 'The square is one of the kindly read marks.' },
      ],
    },
    {
      q: 'What does Jain’s Hindi book read in a trident (trishul)?',
      options: [
        { text: 'A generous, religious-minded person', ok: true, fb: 'He also calls it lucky; we keep only the tendency.' },
        { text: 'A future fortune', ok: false, fb: 'That would be a promise, which no mark can keep.' },
        { text: 'A health warning', ok: false, fb: 'Palm signs are not a health test.' },
      ],
    },
  ],
  '/money-line/': [
    {
      q: 'Do the classical palmistry books name a money line?',
      options: [
        { text: 'Yes, under the ring finger', ok: false, fb: 'That is the sun line, read for temperament.' },
        { text: 'No, none of them', ok: true, fb: 'Money line is a newer, popular name.' },
        { text: 'Only the Hindi books', ok: false, fb: 'We found no dhan rekha in the Hindi books we use either.' },
      ],
    },
    {
      q: 'In Mrs Dale’s Indian Palmistry, the line of fortune is…',
      options: [
        { text: 'The heart line', ok: true, fb: 'Other books give the name to the fate line or the sun line.' },
        { text: 'A separate money line', ok: false, fb: 'It is another name for a main line.' },
        { text: 'The life line', ok: false, fb: 'Dale gives the name to the heart line.' },
      ],
    },
    {
      q: 'How do older books read the so-called money triangle?',
      options: [
        { text: 'As great wealth', ok: false, fb: 'That reading is modern.' },
        { text: 'As an interest in the occult', ok: true, fb: 'Heron-Allen and Raphael read it that way.' },
        { text: 'As bad luck', ok: false, fb: 'No book we use reads it as bad luck.' },
      ],
    },
  ],
  '/career-palmistry/': [
    {
      q: 'Which line does career palmistry read first?',
      options: [
        { text: 'The fate line', ok: true, fb: 'People also call it the career line.' },
        { text: 'The marriage line', ok: false, fb: 'Marriage lines are not read for work.' },
        { text: 'The bracelets on the wrist', ok: false, fb: 'They are not part of a career reading.' },
      ],
    },
    {
      q: 'What does a missing fate line mean for your career?',
      options: [
        { text: 'No career', ok: false, fb: 'Cheiro wrote that people without one are often very successful.' },
        { text: 'Work that follows your choices, not one fixed track', ok: true, fb: 'It is common, and not a bad sign.' },
        { text: 'An early retirement', ok: false, fb: 'No line gives a date or an event.' },
      ],
    },
    {
      q: 'Can palmistry choose your job?',
      options: [
        { text: 'Yes, from the fate line', ok: false, fb: 'The fate line is read for how you approach work, not which job.' },
        { text: 'Yes, from the hand shape', ok: false, fb: 'Hand shape is read for temperament only.' },
        { text: 'No, it describes a working style', ok: true, fb: 'Your choices, skills and chances decide your career.' },
      ],
    },
  ],
};
