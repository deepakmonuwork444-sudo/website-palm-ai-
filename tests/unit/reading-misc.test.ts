import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { isInAppBrowser, readingLocale } from '../../src/lib/reading/browser';
import { COPY, ERROR_COPY } from '../../src/lib/reading/copy';
import { EventTally, WEB_COUNT_EVENTS, dayOf, isAllowedEvent } from '../../src/lib/reading/events';
import { base64ToBytes, bytesToBase64, isHeicFile, jpegHasExif, targetSize } from '../../src/lib/reading/image';
import { memoryStore } from '../../src/lib/reading/store';

describe('photo helpers (plan §12.12)', () => {
  it('long edge 1,080 / 768 / 96, never upscaled', () => {
    expect(targetSize(3000, 4000, 1080)).toEqual({ width: 810, height: 1080 });
    expect(targetSize(4000, 3000, 768)).toEqual({ width: 768, height: 576 });
    expect(targetSize(4032, 3024, 96)).toEqual({ width: 96, height: 72 });
    expect(targetSize(500, 400, 1080)).toEqual({ width: 500, height: 400 });
    expect(() => targetSize(0, 10, 96)).toThrow();
  });

  it('knows HEIC by type or name (phones sometimes send no type)', () => {
    expect(isHeicFile({ type: 'image/heic', name: 'a.jpg' })).toBe(true);
    expect(isHeicFile({ type: '', name: 'IMG_0001.HEIC' })).toBe(true);
    expect(isHeicFile({ type: 'image/jpeg', name: 'a.jpg' })).toBe(false);
  });

  it('spots an EXIF (GPS) block in a JPEG, and none after a canvas re-encode', () => {
    // SOI, APP1 "Exif\0\0" (length 8), SOS.
    const withExif = new Uint8Array([0xff, 0xd8, 0xff, 0xe1, 0x00, 0x08, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00, 0xff, 0xda]);
    // SOI, APP0 JFIF (what a canvas writes), SOS.
    const canvas = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x07, 0x4a, 0x46, 0x49, 0x46, 0x00, 0xff, 0xda]);
    expect(jpegHasExif(withExif)).toBe(true);
    expect(jpegHasExif(canvas)).toBe(false);
    expect(jpegHasExif(new Uint8Array([0x89, 0x50]))).toBe(false);
    expect(base64ToBytes(bytesToBase64(withExif))).toEqual(withExif);
  });
});

describe('browser facts', () => {
  it('WhatsApp / Instagram / Facebook in-app browsers', () => {
    expect(isInAppBrowser('Mozilla/5.0 (Linux; Android 13) ... Instagram 300.0')).toBe(true);
    expect(isInAppBrowser('Mozilla/5.0 ... [FBAN/FBIOS;FBAV/400.0]')).toBe(true);
    expect(isInAppBrowser('Mozilla/5.0 (Linux; Android 13) ... WhatsApp/2.24')).toBe(true);
    expect(isInAppBrowser('Mozilla/5.0 (Linux; Android 13) Chrome/129 Mobile Safari/537.36')).toBe(false);
  });

  it('the reading follows ?lang, then the saved choice, then the page the visitor came from', () => {
    expect(readingLocale({ search: '?lang=hi', referrer: '', stored: 'en' })).toBe('hi');
    expect(readingLocale({ search: '', referrer: 'https://palmsays.com/hi/', stored: null })).toBe('hi');
    expect(readingLocale({ search: '', referrer: 'https://palmsays.com/hi/', stored: 'en' })).toBe('en');
    expect(readingLocale({ search: '', referrer: 'not a url', stored: null })).toBe('en');
  });
});

describe('funnel counts (no personal data)', () => {
  // Read from the app repo when it sits next to this one (the owner's laptop); CI without it skips.
  const migration = join(process.cwd(), '..', 'palm-ai-new--feat-m1-foundation', 'supabase', 'migrations', '0022_web_reading.sql');
  it.skipIf(!existsSync(migration))('the same list as the server (app repo migration 0022)', () => {
    const app = readFileSync(migration, 'utf8');
    const json = app.match(/v_allow constant jsonb := '([\s\S]*?)'::jsonb;/)?.[1];
    expect(json).toBeTruthy();
    const server = JSON.parse(json!) as Record<string, string[]>;
    for (const [event, details] of Object.entries(WEB_COUNT_EVENTS)) expect(server[event], event).toEqual([...details]);
  });

  it('only allowed events and details, n ≤ 50, app_version web', () => {
    expect(isAllowedEvent('lock_tap', 'direction')).toBe(true);
    expect(isAllowedEvent('lock_tap', 'love')).toBe(false);
    expect(isAllowedEvent('app_open')).toBe(false);
    const tally = new EventTally('a');
    for (let i = 0; i < 60; i += 1) tally.add('upload_start');
    tally.add('reading_error', 'not_a_palm');
    // @ts-expect-error — not on the list
    tally.add('email_typed', 'asha@example.com');
    const rows = tally.drain(new Date(2026, 8, 26, 10));
    expect(rows).toEqual([
      { event: 'upload_start', detail: '', variant: 'a', app_version: 'web', n: 50, day: '2026-09-26' },
      { event: 'reading_error', detail: 'not_a_palm', variant: 'a', app_version: 'web', n: 1, day: '2026-09-26' },
    ]);
    expect(tally.drain()).toEqual([]);
    expect(dayOf(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('copy and storage', () => {
  it('every error has English and Hindi, and no banned privacy words', () => {
    const banned = /sent once|never stored|we keep nothing|deleted right after|guaranteed|100%|accurate/i;
    for (const [code, copy] of Object.entries(ERROR_COPY)) {
      for (const text of [copy.title.en, copy.body.en]) expect(text, code).not.toMatch(banned);
      expect(copy.title.hi.length, code).toBeGreaterThan(3);
    }
    for (const row of COPY.privacyRows.en) expect(row).not.toMatch(banned);
    expect(COPY.privacyRows.en).toHaveLength(COPY.privacyRows.hi.length);
    // The stored line points are said, not hidden (SECURITY_PRIVACY.md §2 row 3).
    expect(COPY.privacyRows.en.join(' ')).toMatch(/traced line points/);
    expect(COPY.privacyRows.en.join(' ')).toMatch(/Modal \(USA\)/);
  });

  it('memory store keeps readings in order and removes them', async () => {
    const store = memoryStore();
    const base = { handSide: 'left' as const, photo: new Blob(['x']), photoWidth: 1, photoHeight: 1, lines: [], missing: [], synthesis: null, preview: true };
    await store.put({ ...base, id: 'b', createdAt: '2026-09-26T10:00:00Z' });
    await store.put({ ...base, id: 'a', createdAt: '2026-09-25T10:00:00Z' });
    expect((await store.list()).map((r) => r.id)).toEqual(['a', 'b']);
    await store.remove('a');
    expect((await store.list()).map((r) => r.id)).toEqual(['b']);
  });
});
