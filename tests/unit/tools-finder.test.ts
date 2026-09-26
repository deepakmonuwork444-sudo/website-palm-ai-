import { describe, expect, it } from 'vitest';

import { evaluate, matches, NOT_SURE, observationFrom, PROVENANCE_CAVEAT, summaries, type LineFinder } from '../../src/lib/tools/finder';
import { FATE_FINDER } from '../../src/lib/tools/lines/fate';
import { HEAD_FINDER } from '../../src/lib/tools/lines/head';
import { HEART_FINDER } from '../../src/lib/tools/lines/heart';
import { LIFE_FINDER } from '../../src/lib/tools/lines/life';
import { BOOKS } from '../../src/lib/tools/sources';

const FINDERS: LineFinder[] = [HEART_FINDER, HEAD_FINDER, LIFE_FINDER, FATE_FINDER];
/** CONTENT_GUIDE.md §11 + the prediction words a meaning must never contain. */
const BANNED = /\b(guaranteed|destined|accurate|you will|death|early death|short life|divorce|infertile|poverty|misfortune|unlucky)\b/i;
const ids = (result: ReturnType<typeof evaluate>) => result.groups.flatMap((group) => group.readings.map((rule) => rule.id));

describe('line finder data (copied from the app corpus rules)', () => {
  for (const finder of FINDERS) {
    describe(finder.line, () => {
      it('keeps app ruleIds, unique, each with at least one known book', () => {
        const seen = new Set<string>();
        for (const rule of finder.rules) {
          expect(rule.id).toMatch(new RegExp(`^cx-${finder.line}-`));
          expect(seen.has(rule.id)).toBe(false);
          seen.add(rule.id);
          expect(rule.cites.length).toBeGreaterThan(0);
          for (const cite of rule.cites) expect(BOOKS[cite.book]).toBeDefined();
        }
      });

      it('shows only reading-scope caveats (refusals stay in the app provenance layer)', () => {
        for (const rule of finder.rules) if (rule.caveat) expect(rule.caveat).not.toMatch(PROVENANCE_CAVEAT);
      });

      it('never uses prediction or banned words in a meaning', () => {
        for (const rule of finder.rules) {
          // The life-line rule names "count of years" only to deny it.
          expect(rule.meaning.replace('against reading its length as a count of years', '')).not.toMatch(BANNED);
        }
      });

      it('has unique option values, never the reserved "not sure" value', () => {
        for (const question of finder.questions) {
          const values = question.options.map((option) => option.value);
          expect(new Set(values).size).toBe(values.length);
          expect(values).not.toContain(NOT_SURE);
        }
      });

      it('every rule can be reached from some combination of answers', () => {
        for (const rule of finder.rules) {
          const obs = Object.fromEntries(
            finder.questions.flatMap((q) => q.options.flatMap((o) => Object.entries(o.set))).filter(([feature]) =>
              rule.when.some((condition) => condition.feature === feature),
            ),
          );
          // For each condition there must be an option whose value satisfies it.
          for (const condition of rule.when) {
            const reachable = finder.questions.some((q) => q.options.some((o) => matches(condition, o.set)));
            expect(reachable, `${rule.id} ${condition.feature}`).toBe(true);
          }
          expect(obs).toBeDefined();
        }
      });

      it('gives a one-line summary per option that has a rule, from single-feature rules only', () => {
        const list = summaries(finder);
        expect(list.length).toBeGreaterThan(3);
        for (const item of list) expect(item.rule.when).toHaveLength(1);
      });
    });
  }
});

describe('line finder matching', () => {
  it('matches eq, in and gte, and never an unanswered feature', () => {
    expect(matches({ feature: 'end', op: 'eq', value: 'saturn' }, { end: 'saturn' })).toBe(true);
    expect(matches({ feature: 'end', op: 'in', value: ['jupiter', 'under_index'] }, { end: 'jupiter' })).toBe(true);
    expect(matches({ feature: 'fork', op: 'gte', value: 1 }, { fork: 1 })).toBe(true);
    expect(matches({ feature: 'fork', op: 'gte', value: 1 }, { fork: 0 })).toBe(false);
    expect(matches({ feature: 'end', op: 'eq', value: 'saturn' }, {})).toBe(false);
  });

  it('heart line ending under the index finger: both western readings, from their own books', () => {
    const result = evaluate(HEART_FINDER, { end: 'index' });
    expect(result.answered).toBe(1);
    expect(ids(result)).toEqual(['cx-heart-end-index', 'cx-heart-end-index-ideal']);
    expect(result.groups[0]?.evidence).toEqual(['Ends under the index finger']);
  });

  it('shows combination rules after single features ("taken together")', () => {
    const result = evaluate(HEART_FINDER, { end: 'index', length: 'long', continuity: 'unbroken' });
    const combos = result.groups.filter((group) => group.features.length > 1);
    expect(combos.map((group) => group.readings.map((rule) => rule.id)).flat().sort()).toEqual(
      ['cx-heart-index-continuous', 'cx-heart-long-continuous-dale', 'cx-heart-long-index'].sort(),
    );
    const firstCombo = result.groups.findIndex((group) => group.features.length > 1);
    expect(result.groups.slice(firstCombo).every((group) => group.features.length > 1)).toBe(true);
  });

  it('marks a feature read by two traditions (Cheiro and Dale on a short heart line)', () => {
    const result = evaluate(HEART_FINDER, { length: 'short' });
    expect(ids(result)).toEqual(['cx-heart-short', 'cx-heart-short-dale']);
    expect(result.groups[0]?.traditionsDiffer).toBe(true);
  });

  it('"Not sure" sets nothing and counts as unanswered', () => {
    expect(observationFrom(HEAD_FINDER, { curvature: NOT_SURE })).toEqual({});
    expect(evaluate(HEAD_FINDER, { curvature: NOT_SURE }).answered).toBe(0);
    expect(evaluate(HEAD_FINDER, {}).groups).toEqual([]);
  });

  it('head line joined to the life line shows every book and both traditions', () => {
    const result = evaluate(HEAD_FINDER, { join: 'joined' });
    expect(ids(result)).toEqual(['cx-head-joined-life', 'cx-head-joined-life-advice', 'cx-head-joined-life-shy', 'cx-head-joined-life-dale']);
    expect(result.groups[0]?.traditionsDiffer).toBe(true);
  });

  it('life line: a short line is never read as lifespan, and a settled wrist ending needs "no fork"', () => {
    const short = evaluate(LIFE_FINDER, { length: 'short' });
    expect(ids(short)).toEqual(['cx-life-short']);
    expect(short.groups[0]?.readings[0]?.meaning).toContain('not read that way here');
    expect(ids(evaluate(LIFE_FINDER, { end: 'wrist' }))).toEqual([]);
    expect(ids(evaluate(LIFE_FINDER, { end: 'wrist', fork: 'no' }))).toEqual(['cx-life-end-wrist-settled']);
    expect(ids(evaluate(LIFE_FINDER, { end: 'wrist', fork: 'yes' }))).toEqual([]);
  });

  it('fate line: "no fate line" makes every other answer irrelevant', () => {
    const obs = observationFrom(FATE_FINDER, { visible: 'none', start: 'wrist', continuity: 'broken' });
    expect(obs).toEqual({ visible: false });
    expect(ids(evaluate(FATE_FINDER, { visible: 'none', start: 'wrist' }))).toEqual(['cx-fate-absent']);
  });

  it('fate line: a double line gets the cited book note, not an invented rule', () => {
    const result = evaluate(FATE_FINDER, { double: 'yes' });
    expect(ids(result)).toEqual([]);
    expect(result.groups[0]?.notes.map((note) => note.id)).toEqual(['book-sister-lines']);
  });

  it('fate line: wrist to middle finger reads the combination too', () => {
    const result = evaluate(FATE_FINDER, { start: 'wrist', end: 'middle', continuity: 'unbroken' });
    expect(ids(result)).toEqual(
      expect.arrayContaining(['cx-fate-start-wrist', 'cx-fate-end-middle-dale', 'cx-fate-wrist-middle', 'cx-fate-continuous-middle-dale']),
    );
  });
});
