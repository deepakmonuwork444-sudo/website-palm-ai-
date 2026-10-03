import { readdirSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { en } from '../../src/i18n/en';
import { hi } from '../../src/i18n/hi';
import { handState } from '../../src/scripts/hand-story';

/**
 * Home v4 hand scroll story (DESIGN_V4_BRIEF.md "Hero change"): never a crowd
 * of hands, only one in focus at a time, and a hand is fully gone before it
 * stops mattering. The words are the same in both languages' beat count.
 */

const HANDS = 5; // four photos and the gold outline

describe('one hand at a time', () => {
  it('shows exactly one hand in full focus at each beat', () => {
    for (let beat = 0; beat < HANDS; beat++) {
      const focused = Array.from({ length: HANDS }, (_, i) => handState(beat - i, i === HANDS - 1)).filter((s) => s.opacity === 1 && s.blur === 0);
      expect(focused).toHaveLength(1);
    }
  });

  it('never has two hands in focus anywhere on the scroll', () => {
    for (let p = 0; p <= HANDS - 1 + 1e-9; p += 0.01) {
      const sharp = Array.from({ length: HANDS }, (_, i) => handState(p - i, i === HANDS - 1)).filter((s) => s.opacity > 0.9);
      expect(sharp.length).toBeLessThanOrEqual(1);
    }
  });

  it('a leaving hand blurs and fades, then is gone', () => {
    const leaving = handState(0.375, false);
    expect(leaving.blur).toBeGreaterThan(0);
    expect(leaving.opacity).toBeGreaterThan(0);
    expect(leaving.opacity).toBeLessThan(1);
    expect(handState(0.6, false).opacity).toBe(0);
  });

  it('a coming hand starts soft and faint', () => {
    const coming = handState(-0.3, false);
    expect(coming.blur).toBeGreaterThan(0);
    expect(coming.opacity).toBeLessThan(1);
    expect(handState(-0.5, false).opacity).toBe(0);
  });

  it('the last beat (the outline) stays on screen', () => {
    expect(handState(0.8, true)).toMatchObject({ opacity: 1, blur: 0 });
  });
});

describe('story content', () => {
  it('has the same beats in English and Hindi', () => {
    expect(hi.home.story.beats).toHaveLength(en.home.story.beats.length);
    expect(en.home.story.beats.length + 2).toBe(HANDS);
  });

  it('ships every picture the story asks for', () => {
    const files = readdirSync(join(process.cwd(), 'public', 'images', 'story'));
    for (let n = 1; n < HANDS; n++) {
      for (const w of [480, 800, 1200]) {
        expect(files).toContain(`hand-${n}-${w}.avif`);
        expect(files).toContain(`hand-${n}-${w}.webp`);
      }
    }
    expect(files).toContain('guide-hand.webp');
  });
});
