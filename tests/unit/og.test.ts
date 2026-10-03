import { existsSync, readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import ogImages from '../../src/config/og-images.json';
import { findPage } from '../../src/config/pages';
import { h1Text, ogSlug } from '../../scripts/og-lib.mjs';

describe('per-page share images (WEB-FEAT-015)', () => {
  it('names files after the path', () => {
    expect(ogSlug('/')).toBe('home');
    expect(ogSlug('/hi/')).toBe('hi');
    expect(ogSlug('/tools/palm-map/')).toBe('tools-palm-map');
    expect(ogSlug('/head-line/double/')).toBe('head-line-double');
  });

  it('reads the H1 as plain, tidy text', () => {
    expect(h1Text('<h1 class="x">Free AI palm reading<span class="sr-only">:</span> <em>What</em> do your hands say?</h1>')).toBe(
      'Free AI palm reading: What do your hands say?',
    );
    expect(h1Text('<h1>Fate line &amp; career</h1>')).toBe('Fate line & career');
    expect(h1Text('<p>no heading</p>')).toBe('');
  });

  it('every manifest entry is an indexable registered page with a 1200×630 JPEG on disk', () => {
    const entries = Object.entries(ogImages as Record<string, { image: string; title: string }>);
    expect(entries.length).toBeGreaterThan(0);
    for (const [path, entry] of entries) {
      expect(findPage(path)?.indexable, path).toBe(true);
      expect(entry.image).toBe(`/og/${ogSlug(path)}.jpg`);
      const file = `public${entry.image}`;
      expect(existsSync(file), file).toBe(true);
      const bytes = readFileSync(file);
      // JPEG SOF0/SOF2 frame header holds height then width.
      const sof = bytes.findIndex((byte, i) => byte === 0xff && (bytes[i + 1] === 0xc0 || bytes[i + 1] === 0xc2));
      expect(bytes.readUInt16BE(sof + 5), `${file} height`).toBe(630);
      expect(bytes.readUInt16BE(sof + 7), `${file} width`).toBe(1200);
      expect(bytes.length, `${file} size`).toBeLessThan(300 * 1024);
    }
  });
});
