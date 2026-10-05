import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { en } from '../../src/i18n/en';
import { hi } from '../../src/i18n/hi';
import { HANDS, LINE_KEYS, extraHands, handBase } from '../../src/scripts/living-palm-hands';

/**
 * The Living palm (home hero): every listed hand has all its files, its lines
 * come from a real scan (lines.json with all four lines), and the line names
 * use the site's own words in both languages.
 */
const FILES = [
  'palm-albedo.webp',
  'palm-albedo-1024.webp',
  'palm-normal.webp',
  'palm-depth.png',
  'palm-shadow.png',
  'palm-meta.json',
  'lines.json',
  'lines-field.png',
  'LICENSE.txt',
  ...[600, 900, 1200].flatMap((w) => [`poster-${w}.avif`, `poster-${w}.webp`]),
  ...[600, 900].flatMap((w) => [`poster-lines-${w}.avif`, `poster-lines-${w}.webp`]),
];
const dir = (slug: string) => join(process.cwd(), 'public', handBase(slug));

describe('Living palm hands', () => {
  it('lists hero-palm-a first, with unique slugs', () => {
    expect(HANDS[0]?.slug).toBe('hero-palm-a');
    expect(new Set(HANDS.map((h) => h.slug)).size).toBe(HANDS.length);
  });

  for (const hand of HANDS) {
    it(`${hand.slug} has every file and a real scan of all four lines`, () => {
      for (const f of FILES) expect(existsSync(join(dir(hand.slug), f)), f).toBe(true);
      const lines = JSON.parse(readFileSync(join(dir(hand.slug), 'lines.json'), 'utf8')) as { lines: { key: string }[] };
      expect(lines.lines.map((l) => l.key).sort()).toEqual([...LINE_KEYS].sort());
      expect(hand.credit.url).toMatch(/^https:\/\//);
      for (const k of LINE_KEYS) {
        const [x, y] = hand.poster.labels[k];
        expect(x > 0 && x < 100 && y > 0 && y < 100).toBe(true);
      }
    });
  }
});

describe('Living palm extra hands (hands.json)', () => {
  it('takes only listed, valid slugs, never repeats the first hand, and fills safe defaults', () => {
    const got = extraHands({ hands: ['hero-palm-a', 'hero-palm-b', { slug: 'hand-type-a', pivot: { u: 0.4, v: 0.5 } }, { slug: '../x' }, 'hero-palm-b', 7] });
    expect(got.map((h) => h.slug)).toEqual(['hero-palm-b', 'hand-type-a']);
    expect(got[1]?.pivot).toEqual({ u: 0.4, v: 0.5 });
    expect(got[0]?.edges).toEqual([0.15, 0.8]);
    expect(extraHands(null)).toEqual([]);
  });
});

describe('Living palm words', () => {
  it('names the lines with the site glossary', () => {
    expect(en.home.livingPalm.lines).toEqual({ heart: 'Heart', head: 'Head', life: 'Life', fate: 'Fate' });
    expect(hi.home.livingPalm.lines).toEqual({ heart: 'हृदय रेखा', head: 'मस्तिष्क रेखा', life: 'जीवन रेखा', fate: 'भाग्य रेखा' });
  });

  it('credits the real photo and says the lines are a real scan', () => {
    expect(en.home.heroCredit([])).toContain('Kevin Malik');
    expect(en.home.heroCredit(['Amusan John'])).toContain('Amusan John');
    expect(hi.home.heroCredit(['Amusan John'])).toContain('Amusan John');
    expect(en.home.heroCredit([])).toMatch(/real PalmSays scans/);
    expect(en.home.heroCredit([])).not.toMatch(/AI-generated/);
    expect(hi.home.heroCredit([])).toContain('Kevin Malik');
  });
});
