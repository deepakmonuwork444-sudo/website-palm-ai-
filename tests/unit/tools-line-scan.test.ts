import { describe, expect, it } from 'vitest';

import scanJson from '../../src/lib/reading/mock/scan-response.json';
import { ReadingError } from '../../src/lib/reading/errors';
import type { PreparedPhoto } from '../../src/lib/reading/image';
import { findPage } from '../../src/config/pages';
import { LINE_ORDER, lineMode, linesFromScan, scanErrorText, scanLines } from '../../src/lib/tools/line-scan';
import { LINE_SCAN_LIVE, LINES_ONLY_SERVER, toolById } from '../../src/lib/tools/registry';

const photo = { scan: { base64: 'AAAA', width: 360, height: 480, bytes: 3 } } as unknown as PreparedPhoto;

describe('line finder: the reading API scan step only', () => {
  it('is off unless the preview asks for mock, or the lines-only server exists', () => {
    expect(lineMode('off')).toBe('off');
    expect(lineMode('mock')).toBe('mock');
    expect(lineMode('live', false)).toBe('off');
    expect(lineMode('live', true)).toBe('live');
    expect(LINES_ONLY_SERVER).toBe(false);
    expect(toolById('line-finder').live).toBe(LINE_SCAN_LIVE);
    expect(findPage('/tools/palm-line-finder/')?.indexable).toBe(LINE_SCAN_LIVE);
  });

  it('draws only the lines the scanner returned, in the reading’s order', () => {
    const lines = linesFromScan(scanJson as never);
    expect(lines.map((line) => line.type)).toEqual(LINE_ORDER.filter((type) => (scanJson.lines as Record<string, unknown>)[type]));
    for (const line of lines) expect(line.path.length).toBeGreaterThanOrEqual(2);
    const noFate = structuredClone(scanJson) as { lines: Record<string, { present: boolean }> };
    noFate.lines.fate!.present = false;
    expect(linesFromScan(noFate as never).map((line) => line.type)).not.toContain('fate');
    expect(linesFromScan({ lines: null })).toEqual([]);
  });

  it('mock mode walks guest → pass → session → scan and returns the stored sample', async () => {
    const result = await scanLines(photo, 'left', 'mock');
    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      expect(result.mode).toBe('mock');
      expect(result.lines.length).toBeGreaterThan(0);
    }
  }, 10_000);

  it('a scanner error becomes a plain message; off mode never scans', async () => {
    await expect(scanLines(photo, 'right', 'mock', 'scanner_unavailable')).rejects.toMatchObject({ code: 'scanner_unavailable' });
    await expect(scanLines(photo, 'right', 'off')).rejects.toBeInstanceOf(ReadingError);
    for (const code of ['offline', 'scanner_unavailable', 'daily_capacity_reached', 'image_too_large', 'not_configured'] as const) {
      expect(scanErrorText(code)).toMatch(/\.$/);
    }
  }, 10_000);
});
