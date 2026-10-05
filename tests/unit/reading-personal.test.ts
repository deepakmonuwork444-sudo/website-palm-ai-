import { describe, expect, it } from 'vitest';

import { PACE, webRevealTimeline } from '../../src/lib/reading/live-show';
import { pdfFileName, pdfTitle, wrapWords } from '../../src/lib/reading/pdf';
import {
  BY_READING_KEY,
  EMPTY_DETAILS,
  LAST_KEY,
  addressName,
  ageOn,
  birthText,
  cleanDetails,
  cleanName,
  detailsForReading,
  gendered,
  INTAKE_COPY,
  isAdultBirthDate,
  isPersonal,
  isValidAge,
  isValidBirthDate,
  linkDetails,
  loadLast,
  openingLine,
  reportTitle,
  saveLast,
  writesWithShown,
  writesWithText,
  type KeyValue,
  type PersonalDetails,
} from '../../src/lib/reading/personal';
import { nativeShareData, shareText, siteLink, whatsappUrl } from '../../src/lib/reading/share';

const TODAY = new Date(2026, 8, 27);

function memory(): KeyValue & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

const deepak: PersonalDetails = { ...EMPTY_DETAILS, name: 'Deepak', gender: 'man', hand: 'right', writeHand: 'right', birthDate: '1990-03-12', birthTime: '10:30' };

describe('personal details (this device only)', () => {
  it('cleans a typed name: no markup or control characters, single spaces, at most 40 characters', () => {
    expect(cleanName('  Deepak   Chauhan ')).toBe('Deepak Chauhan');
    expect(cleanName('<script>x</script>')).toBe('script x script');
    expect(cleanName('दीपक')).toBe('दीपक');
    expect(cleanName('a'.repeat(80))).toHaveLength(40);
    expect(cleanName(42)).toBe('');
  });

  it('accepts only real, past birth dates from 1900 and valid times; age only without a date', () => {
    expect(isValidBirthDate('1990-03-12', TODAY)).toBe(true);
    expect(isValidBirthDate('1990-02-30', TODAY)).toBe(false);
    expect(isValidBirthDate('2030-01-01', TODAY)).toBe(false);
    expect(isValidBirthDate('1899-12-31', TODAY)).toBe(false);
    expect(ageOn('1990-09-28', TODAY)).toBe(35);
    expect(ageOn('1990-09-27', TODAY)).toBe(36);
    const d = cleanDetails({ name: 'X', gender: 'robot', hand: 'up', birthDate: 'soon', birthTime: '25:00', age: 34, extra: 'dropped' }, TODAY);
    expect(d).toEqual({ ...EMPTY_DETAILS, name: 'X', age: 34 });
    expect(cleanDetails({ birthDate: '1990-03-12', age: 34 }, TODAY).age).toBeNull();
  });

  it('is for adults only: a typed age or a birth date under 18 is refused, with a kind message', () => {
    expect(isValidAge(17)).toBe(false);
    expect(isValidAge(18)).toBe(true);
    expect(isValidAge(120)).toBe(true);
    expect(isValidAge(121)).toBe(false);
    expect(isAdultBirthDate('2008-09-27', TODAY)).toBe(true);
    expect(isAdultBirthDate('2008-09-28', TODAY)).toBe(false);
    expect(cleanDetails({ age: 12 }, TODAY).age).toBeNull();
    expect(INTAKE_COPY.badAge.en).toContain('for adults 18+');
    expect(INTAKE_COPY.tooYoung.en).toContain('for adults 18+');
  });

  it('keeps the last details and the details of each reading in local storage, and forgets them', () => {
    const s = memory();
    saveLast(s, deepak);
    expect(loadLast(s, TODAY)).toEqual(deepak);
    linkDetails(s, 'r1', deepak);
    linkDetails(s, 'r2', { ...deepak, name: 'Asha', gender: 'woman' });
    expect(detailsForReading(s, 'r1', TODAY)?.name).toBe('Deepak');
    expect(detailsForReading(s, 'r2', TODAY)?.name).toBe('Asha');
    // A reading removed from this browser: its details go too.
    linkDetails(s, 'r3', deepak, ['r2']);
    expect(detailsForReading(s, 'r1', TODAY)).toBeNull();
    linkDetails(s, 'r2', null);
    expect(detailsForReading(s, 'r2', TODAY)).toBeNull();
    expect([...s.data.keys()].sort()).toEqual([BY_READING_KEY, LAST_KEY].sort());
    // Broken JSON or blocked storage never throws.
    s.setItem(LAST_KEY, '{oops');
    expect(loadLast(s, TODAY)).toBeNull();
    expect(loadLast(null, TODAY)).toBeNull();
    expect(() => saveLast(null, deepak)).not.toThrow();
  });

  it('turns the two hand answers into "writes with the hand in the photo"', () => {
    expect(writesWithShown({ hand: 'right', writeHand: 'right' }, 'left')).toBe(true);
    expect(writesWithShown({ hand: null, writeHand: 'left' }, 'left')).toBe(true);
    expect(writesWithShown({ hand: 'left', writeHand: 'right' }, 'left')).toBe(false);
    expect(writesWithShown({ hand: 'left', writeHand: null }, 'left')).toBeNull();
    expect(isPersonal({ ...EMPTY_DETAILS, hand: 'left' })).toBe(false);
    expect(isPersonal({ ...EMPTY_DETAILS, name: 'A' })).toBe(true);
  });
});

describe('words around the reading', () => {
  it('addresses by name: "Deepak ji," in English, "Deepak जी" in Hindi, never "जी" twice', () => {
    expect(reportTitle(deepak, 'en')).toBe('Deepak ji, your palm reading');
    expect(reportTitle(deepak, 'hi')).toBe('Deepak जी, आपकी हस्तरेखा रीडिंग');
    expect(addressName('दीपक', 'hi')).toBe('दीपक जी');
    expect(addressName('Deepak ji', 'hi')).toBe('Deepak ji');
    expect(addressName('Deepak ji', 'en')).toBe('Deepak ji');
    expect(reportTitle(null, 'en')).toBe('Your palm');
    expect(reportTitle({ ...EMPTY_DETAILS, gender: 'woman' }, 'hi')).toBe('आपकी हथेली');
  });

  it('Hindi grammar follows the chosen gender; neutral wording when it was not given', () => {
    expect(gendered('woman', { m: 'सकते', f: 'सकती', n: 'n' })).toBe('सकती');
    expect(gendered('man', { m: 'सकते', f: 'सकती', n: 'n' })).toBe('सकते');
    expect(gendered('unsaid', { m: 'सकते', f: 'सकती', n: 'n' })).toBe('n');
    const glance = { insufficient: false, hasStrength: true };
    expect(openingLine({ ...deepak, gender: 'woman' }, glance, 'hi')).toContain('देख सकती हैं');
    expect(openingLine(deepak, glance, 'hi')).toContain('देख सकते हैं');
    const neutral = openingLine(null, glance, 'hi');
    expect(neutral).toContain('देखी जा सकती है');
    expect(neutral).not.toMatch(/सकते हैं|सकती हैं/);
    expect(writesWithText({ ...deepak, gender: 'woman' }, 'hi')).toBe('दाएं हाथ से लिखती हैं');
    expect(writesWithText({ ...deepak, gender: null }, 'hi')).toBe('लिखने वाला हाथ: दायां');
    expect(writesWithText(deepak, 'en')).toBe('Writes with the right hand');
  });

  it('the opening follows the reading\'s own glance and claims nothing about the person', () => {
    expect(openingLine(null, { insufficient: true, hasStrength: false }, 'en')).toMatch(/only part of your lines/);
    expect(openingLine(null, { insufficient: false, hasStrength: true }, 'en')).toMatch(/natural strength/);
    expect(openingLine(null, { insufficient: false, hasStrength: false }, 'en')).not.toMatch(/strength/);
  });

  it('prints birth details as given (date + time, or age)', () => {
    expect(birthText(deepak, 'en')).toMatch(/^Born: 12 March 1990, 10:30/);
    expect(birthText({ ...EMPTY_DETAILS, age: 34 }, 'en')).toBe('Age 34');
    expect(birthText(EMPTY_DETAILS, 'en')).toBeNull();
  });
});

describe('sharing sends only a message and the site link', () => {
  it('WhatsApp and the share sheet carry the link, never private details', () => {
    expect(siteLink('en')).toBe('https://palmsays.com/');
    expect(siteLink('hi')).toBe('https://palmsays.com/hi/');
    const url = whatsappUrl('en');
    expect(url.startsWith('https://wa.me/?text=')).toBe(true);
    const text = decodeURIComponent(url.slice('https://wa.me/?text='.length));
    expect(text).toBe(shareText('en'));
    expect(text).toContain('https://palmsays.com/');
    expect(text.toLowerCase()).not.toContain('free');
    expect(decodeURIComponent(whatsappUrl('hi'))).toContain('https://palmsays.com/hi/');
    expect(nativeShareData('en').url).toBe('https://palmsays.com/');
  });
});

describe('PDF helpers', () => {
  const measure = (s: string) => s.length * 10;

  it('wraps words to the width and cuts a word longer than a line', () => {
    expect(wrapWords('aa bb cc dd', 50, measure)).toEqual(['aa bb', 'cc dd']);
    expect(wrapWords('  one  ', 50, measure)).toEqual(['one']);
    expect(wrapWords('abcdefghij', 40, measure)).toEqual(['abcd', 'efgh', 'ij']);
    expect(wrapWords('', 40, measure)).toEqual([]);
  });

  it('names the file and titles the page by name (non-Latin names stay out of the file name)', () => {
    expect(pdfFileName('Deepak Chauhan', TODAY)).toBe('palmsays-palm-reading-deepak-chauhan-2026-09-27.pdf');
    expect(pdfFileName('दीपक', TODAY)).toBe('palmsays-palm-reading-2026-09-27.pdf');
    expect(pdfTitle(deepak, 'en')).toBe('Palm reading for Deepak ji');
    expect(pdfTitle(deepak, 'hi')).toBe('Deepak जी की हस्तरेखा रीडिंग');
    expect(pdfTitle(null, 'hi')).toBe('आपकी हस्तरेखा रीडिंग');
  });
});

describe('the calmer reveal (owner 2026-09-27)', () => {
  it('lasts about 8–12 s from the hand to the report for 3–4 traced lines, one line at a time', () => {
    expect(webRevealTimeline(21, 2).totalMs).toBeGreaterThanOrEqual(7000);
    for (const n of [3, 4]) {
      const t = webRevealTimeline(21, n);
      expect(t.totalMs).toBeGreaterThanOrEqual(8000);
      expect(t.totalMs).toBeLessThanOrEqual(12000);
      // Never two lines drawing at once.
      for (let i = 1; i < n; i++) expect(t.lineStarts[i]! - t.lineStarts[i - 1]!).toBeGreaterThanOrEqual(PACE.lineDrawMs);
    }
    // Lines start only once the camera has nearly landed on the palm.
    expect(webRevealTimeline(21, 4).linesStart).toBeGreaterThanOrEqual(PACE.palmMoveMs * 0.75);
    expect(webRevealTimeline(21, 0).lineStarts).toEqual([]);
  });
});
