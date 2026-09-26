import { describe, expect, it } from 'vitest';

import {
  candidates,
  CUTOFFS,
  elementOf,
  ELEMENTS,
  fingerLengthFromCm,
  MODERN_SYSTEM_NOTE,
  palmShapeFromCm,
  parseCm,
} from '../../src/lib/tools/hand-type';
import { isCorrect, QUIZ, score, scoreMessage, shareText } from '../../src/lib/tools/quiz';
import { missing, whichHand } from '../../src/lib/tools/which-hand';

describe('which-hand quiz', () => {
  it('asks only what it needs', () => {
    expect(missing({})).toEqual(['tradition']);
    expect(missing({ tradition: 'writing' })).toEqual(['writing']);
    expect(missing({ tradition: 'writing', writing: 'right' })).toEqual(['goal']);
    expect(missing({ tradition: 'writing', writing: 'both' })).toEqual([]);
    expect(missing({ tradition: 'indian' })).toEqual(['person']);
    expect(whichHand({ tradition: 'writing', writing: 'left' })).toBeNull();
  });

  it('writing-hand way: the writing hand for "now", the other for "born", both to compare', () => {
    expect(whichHand({ tradition: 'writing', writing: 'right', goal: 'now' })?.hand).toBe('right');
    expect(whichHand({ tradition: 'writing', writing: 'left', goal: 'now' })?.hand).toBe('left');
    expect(whichHand({ tradition: 'writing', writing: 'right', goal: 'born' })?.hand).toBe('left');
    expect(whichHand({ tradition: 'writing', writing: 'left', goal: 'born' })?.hand).toBe('right');
    const both = whichHand({ tradition: 'writing', writing: 'left', goal: 'both' });
    expect(both?.hand).toBe('both');
    expect(both?.headline).toBe('Read both hands — start with your left');
  });

  it('uses both hands → no writing-hand rule, read the clearer hand', () => {
    const result = whichHand({ tradition: 'writing', writing: 'both' });
    expect(result?.hand).toBe('either');
    expect(result?.cites[0]?.book).toBe('cheiro-palmistry-for-all-1916');
  });

  it('Indian custom (Dale 1895): right for men, left for women, clearest if not said', () => {
    expect(whichHand({ tradition: 'indian', person: 'man' })?.hand).toBe('right');
    expect(whichHand({ tradition: 'indian', person: 'woman' })?.hand).toBe('left');
    expect(whichHand({ tradition: 'indian', person: 'skip' })?.hand).toBe('either');
    for (const person of ['man', 'woman', 'skip'] as const) {
      const result = whichHand({ tradition: 'indian', person });
      expect(result?.cites.map((cite) => cite.book)).toEqual(['dale-indian-palmistry-1895']);
      expect(result?.why.join(' ')).toMatch(/clearly shown/);
    }
  });

  it('always shows the other tradition, and never claims a gender destiny', () => {
    const results = [
      whichHand({ tradition: 'indian', person: 'woman' }),
      whichHand({ tradition: 'writing', writing: 'right', goal: 'now' }),
    ];
    for (const result of results) {
      expect(result?.otherView.length).toBeGreaterThan(20);
      expect(JSON.stringify(result)).not.toMatch(/destiny|fate of|will marry|you will/i);
    }
  });
});

describe('hand type quiz (modern four-element system)', () => {
  it('maps palm shape and finger length to the four elements', () => {
    expect(elementOf('square', 'short')).toBe('earth');
    expect(elementOf('square', 'long')).toBe('air');
    expect(elementOf('long', 'short')).toBe('fire');
    expect(elementOf('long', 'long')).toBe('water');
    for (const [id, info] of Object.entries(ELEMENTS)) expect(elementOf(info.palm, info.fingers)).toBe(id);
  });

  it('keeps every possibility for a "not sure" answer', () => {
    expect(candidates('long', null)).toEqual(['fire', 'water']);
    expect(candidates(null, 'short')).toEqual(['earth', 'fire']);
    expect(candidates(null, null)).toHaveLength(4);
  });

  it('measures with the stated rule of thumb and reports borderline hands', () => {
    expect(palmShapeFromCm(9.5, 8.5)).toEqual({ value: 'square', borderline: false });
    expect(palmShapeFromCm(11, 8)).toEqual({ value: 'long', borderline: false });
    expect(palmShapeFromCm(10, 8.3)).toEqual({ value: null, borderline: true });
    expect(fingerLengthFromCm(7, 10)).toEqual({ value: 'short', borderline: false });
    expect(fingerLengthFromCm(9, 10)).toEqual({ value: 'long', borderline: false });
    expect(fingerLengthFromCm(8, 10)).toEqual({ value: null, borderline: true });
    expect(palmShapeFromCm(Number.NaN, 8)).toBeNull();
    expect(fingerLengthFromCm(0, 10)).toBeNull();
    expect(CUTOFFS.palm.square).toBeLessThan(CUTOFFS.palm.long);
  });

  it('parses centimetres typed on a phone', () => {
    expect(parseCm('10.5')).toBe(10.5);
    expect(parseCm(' 8,5 ')).toBe(8.5);
    expect(parseCm('8')).toBe(8);
    expect(parseCm('abc')).toBeNaN();
    expect(parseCm('')).toBeNaN();
  });

  it('labels the system as modern, not classical', () => {
    expect(MODERN_SYSTEM_NOTE).toMatch(/modern/);
    for (const info of Object.values(ELEMENTS)) expect(info.summary).not.toMatch(/tradition says|the books say|you will/i);
  });
});

describe('palm reading quiz', () => {
  it('has 10 questions, each answer among its options, unique ids', () => {
    expect(QUIZ).toHaveLength(10);
    expect(new Set(QUIZ.map((q) => q.id)).size).toBe(10);
    for (const question of QUIZ) {
      expect(question.options.map((o) => o.id)).toContain(question.answer);
      expect(question.explain.length).toBeGreaterThan(20);
    }
  });

  it('scores answers and ignores unknown ids', () => {
    const perfect = Object.fromEntries(QUIZ.map((q) => [q.id, q.answer]));
    expect(score(perfect)).toBe(10);
    expect(score({ ...perfect, 'spot-heart': 'head', bogus: 'x' })).toBe(9);
    expect(score({})).toBe(0);
    expect(isCorrect(QUIZ[0]!, QUIZ[0]!.answer)).toBe(true);
  });

  it('gives a kind message at every score and a share text with no personal data', () => {
    for (let n = 0; n <= 10; n += 1) expect(scoreMessage(n).length).toBeGreaterThan(10);
    expect(scoreMessage(10)).toMatch(/Every one right/);
    const text = shareText(7, 'https://palmsays.com/tools/palm-reading-quiz/');
    expect(text).toBe('I got 7 of 10 on the PalmSays palm reading quiz. Can you spot the lines? https://palmsays.com/tools/palm-reading-quiz/');
  });

  it('keeps the myth answers honest (no lifespan, missing fate line is common)', () => {
    expect(QUIZ.find((q) => q.id === 'short-life')?.answer).toBe('nothing');
    expect(QUIZ.find((q) => q.id === 'no-fate')?.answer).toBe('common');
  });
});
