import { describe, expect, it } from 'vitest';

import { resolveBuildEnv } from '../../src/config/env';
import { qrMatrix } from '../../src/lib/qr';
import {
  BANNED_SCHEMA_TYPES,
  mobileApplicationSchema,
  organizationSchema,
  serializeJsonLd,
  webApplicationSchema,
  websiteSchema,
} from '../../src/lib/schema';

describe('build env', () => {
  it('is production only when asked explicitly', () => {
    expect(resolveBuildEnv('production')).toBe('production');
    expect(resolveBuildEnv(' production ')).toBe('production');
    expect(resolveBuildEnv(undefined)).toBe('preview');
    expect(resolveBuildEnv('prod')).toBe('preview');
  });
});

describe('QR', () => {
  it('encodes a Play link with a 4-module quiet zone', () => {
    const { size, path } = qrMatrix('https://play.google.com/store/apps/details?id=com.palmreadai.app');
    expect(size).toBeGreaterThanOrEqual(21 + 8);
    expect(path).toMatch(/^M\d+ \d+h\d+v1h-\d+z/);
    // Nothing is drawn inside the quiet zone.
    for (const [, x, y] of path.matchAll(/M(\d+) (\d+)/g)) {
      expect(Number(x)).toBeGreaterThanOrEqual(4);
      expect(Number(y)).toBeGreaterThanOrEqual(4);
    }
  });

  it('rejects empty text', () => {
    expect(() => qrMatrix('')).toThrow();
  });
});

describe('structured data', () => {
  const all = [
    organizationSchema(),
    websiteSchema('hi'),
    webApplicationSchema({ name: 'x', path: '/', locale: 'en', description: 'y' }),
    mobileApplicationSchema({ locale: 'en', description: 'z' }),
  ];

  it('never contains ratings, reviews, HowTo or Product', () => {
    const text = JSON.stringify(all);
    for (const type of BANNED_SCHEMA_TYPES) expect(text).not.toContain(`"${type}"`);
    expect(text).not.toMatch(/aggregateRating|"review"/i);
  });

  it('uses schema.org and the Play listing', () => {
    for (const data of all) expect(data['@context']).toBe('https://schema.org');
    expect(organizationSchema().sameAs).toEqual(['https://play.google.com/store/apps/details?id=com.palmreadai.app']);
    expect(String(mobileApplicationSchema({ locale: 'en', description: 'z' }).installUrl)).toContain('utm_medium%3Dapp_page');
  });

  it('escapes "<" so data can never close its script tag', () => {
    expect(serializeJsonLd({ a: '</script><script>alert(1)</script>' })).not.toContain('</script>');
  });
});
