import { describe, expect, it } from 'vitest';

import { isLocale, localeFromPath, localizePath, normalizePath, otherLocale, stripLocale, t } from '../../src/i18n';
import { en } from '../../src/i18n/en';
import { hi } from '../../src/i18n/hi';

/** Every key path of a dictionary, with the kind of value at the end. */
function shape(value: unknown, prefix = ''): string[] {
  if (Array.isArray(value)) {
    return [`${prefix}[${value.length}]`, ...value.flatMap((item, i) => shape(item, `${prefix}[${i}]`))];
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, inner]) => shape(inner, prefix ? `${prefix}.${key}` : key));
  }
  return [`${prefix}:${typeof value}`];
}

describe('locale helpers', () => {
  it('reads the locale from a path', () => {
    expect(localeFromPath('/')).toBe('en');
    expect(localeFromPath('/app/')).toBe('en');
    expect(localeFromPath('/hi')).toBe('hi');
    expect(localeFromPath('/hi/')).toBe('hi');
    expect(localeFromPath('/hi/app/')).toBe('hi');
    expect(localeFromPath('/history-of-palmistry/')).toBe('en');
  });

  it('maps English slugs to Hindi and back', () => {
    expect(localizePath('/', 'hi')).toBe('/hi/');
    expect(localizePath('/app/', 'hi')).toBe('/hi/app/');
    expect(localizePath('/heart-line', 'hi')).toBe('/hi/heart-line/');
    expect(localizePath('/hi/app/', 'en')).toBe('/app/');
    expect(localizePath('/hi/', 'en')).toBe('/');
    expect(localizePath('/hi/app/', 'hi')).toBe('/hi/app/');
    expect(stripLocale('/hi/heart-line/')).toBe('/heart-line/');
  });

  it('normalises paths: leading slash, trailing slash for pages, not for files', () => {
    expect(normalizePath('app')).toBe('/app/');
    expect(normalizePath('/app/?x=1#y')).toBe('/app/');
    expect(normalizePath('//hi//app')).toBe('/hi/app/');
    expect(normalizePath('/privacy.html')).toBe('/privacy.html');
  });

  it('knows its locales', () => {
    expect(isLocale('hi')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(otherLocale('en')).toBe('hi');
    expect(otherLocale('hi')).toBe('en');
  });
});

describe('dictionaries', () => {
  it('Hindi has exactly the same keys, list lengths and value kinds as English', () => {
    expect(shape(hi)).toEqual(shape(en));
  });

  it('formats prices from numbers, not typed strings', () => {
    expect(t('en').store.plansFrom(149)).toBe('Plans from ₹149/month');
    expect(t('hi').store.packsFrom(199)).toContain('₹199');
  });

  it('Hindi strings are Devanagari where they must be', () => {
    expect(t('hi').home.h1).toMatch(/[ऀ-ॿ]/);
    expect(t('hi').lang.switchTo).toBe('English');
    expect(t('en').lang.switchTo).toBe('हिंदी');
  });

  it('uses no template chrome: no arrows, no middle-dot joins, no emoji', () => {
    const all = JSON.stringify([en, hi], (_key, value: unknown) =>
      typeof value === 'function' ? (value as (...args: string[]) => string)('1', '2') : value,
    );
    expect(all).not.toMatch(/→/);
    expect(all).not.toMatch(/ · /);
    expect(all).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});
