import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import scanResponse from '../../src/lib/reading/mock/scan-response.json';
import { mostAskedThisWeek } from '../../src/lib/home/most-asked';
import { sampleReport, sampleTeasers } from '../../src/lib/home/sample-reading';
import { loadSampleScan, parseSampleScan } from '../../src/lib/home/sample-scan';
import { READINGS_DB, READINGS_STORE } from '../../src/scripts/home';

/**
 * Home page v3: lines only from real scanner output, sample sentences only
 * from the real engine, no invented popularity, and the saved-readings count
 * reads the reading page's own store without creating it.
 */

describe('hero lines come only from a real scan of the same photo', () => {
  const aspect = scanResponse.image.width / scanResponse.image.height;

  it('draws every present line of a real scan, in photo pixels', () => {
    const scan = parseSampleScan(scanResponse, aspect);
    expect(scan).not.toBeNull();
    expect(scan!.lines.map((l) => l.name)).toEqual(['life', 'head', 'heart', 'fate']);
    expect(scan!.missing).toEqual([]);
    expect(scan!.lines[0]!.d.startsWith('M')).toBe(true);
    expect(scan!.width).toBe(scanResponse.image.width);
  });

  it('refuses a scan made for another crop (the lines would not sit on the photo)', () => {
    expect(parseSampleScan(scanResponse, 16 / 9)).toBeNull();
  });

  it('never draws a line the scanner did not return; it becomes "not clearly seen"', () => {
    const copy = structuredClone(scanResponse) as { lines: Record<string, { present: boolean }> };
    copy.lines.fate!.present = false;
    const scan = parseSampleScan(copy, aspect);
    expect(scan!.lines.map((l) => l.name)).not.toContain('fate');
    expect(scan!.missing).toEqual(['fate']);
  });

  it('draws nothing from junk or an empty scan', () => {
    expect(parseSampleScan({ hello: 'world' }, aspect)).toBeNull();
    const empty = structuredClone(scanResponse) as { lines: Record<string, { present: boolean }> };
    for (const line of Object.values(empty.lines)) line.present = false;
    expect(parseSampleScan(empty, aspect)).toBeNull();
  });

  it('has no hero scan today: the home page shows the photo without lines', () => {
    expect(loadSampleScan('hero-palm', 3 / 4)).toBeNull();
    expect(loadSampleScan('does-not-exist', 3 / 4)).toBeNull();
  });
});

describe('the sample reading is the real engine output, locked like a free reading', () => {
  it('quotes real first sentences for the curiosity cards, in both languages', async () => {
    for (const locale of ['en', 'hi'] as const) {
      const teasers = await sampleTeasers(locale);
      expect(teasers.love).toBeTruthy();
      expect(teasers.personality).toBeTruthy();
      expect(teasers.careerMoney).toBeTruthy();
      // The stored palm has no clear life-direction reading: the card says so instead of inventing one.
      expect(teasers.direction).toBeNull();
    }
    const en = await sampleTeasers('en');
    expect(en.love).toBe('In closeness you usually notice small shifts in your partner and respond with care.');
  });

  it('opens Love and Personality, and shows only the first sentence of the locked parts', async () => {
    const report = await sampleReport('en');
    expect(report.open.map((s) => s.key)).toEqual(['love', 'personality']);
    expect(report.locked.map((p) => p.key)).toEqual(['career-money', 'direction']);
    for (const part of report.locked) {
      if (part.sentence) expect(part.sentence.split(/(?<=[.!?])\s+/)).toHaveLength(1);
    }
  });
});

describe('honest motivation only', () => {
  it('shows no "most asked" block without real data', () => {
    expect(mostAskedThisWeek()).toBeNull();
  });

  it('counts saved readings in the reading page’s own database and store', () => {
    const store = readFileSync(join(process.cwd(), 'src', 'lib', 'reading', 'store.ts'), 'utf8');
    expect(store).toContain(`const DB_NAME = '${READINGS_DB}';`);
    expect(store).toContain(`const STORE = '${READINGS_STORE}';`);
  });
});
