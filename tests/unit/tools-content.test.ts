import { describe, expect, it } from 'vitest';

import { findPage } from '../../src/config/pages';
import { playStoreUrl, site } from '../../src/config/site';
import { resetToolUse, setAnalyticsSink, track, trackPhotoCheck, trackToolUse, currentDevice } from '../../src/lib/tools/analytics';
import { FATE_FINDER } from '../../src/lib/tools/lines/fate';
import { HEAD_FINDER } from '../../src/lib/tools/lines/head';
import { HEART_FINDER } from '../../src/lib/tools/lines/heart';
import { LIFE_FINDER } from '../../src/lib/tools/lines/life';
import { LINE_PINS, lineThumb, lineThumbKeys, MAP_VIEWBOX, MOUNT_AREAS, SIGN_SPOTS, signThumb, toPercent } from '../../src/lib/tools/palm-geometry';
import { MAP_SPOTS, spotById } from '../../src/lib/tools/palm-map';
import { HAND_MODEL_LABEL, KIND_ORDER, LINE_SCAN_LIVE, otherTools, TOOLS, toolById, toolMedium } from '../../src/lib/tools/registry';
import { toolsHubSchema } from '../../src/lib/tools/schema';
import { pickedSigns, SIGNS } from '../../src/lib/tools/signs';
import { BOOKS, citeText } from '../../src/lib/tools/sources';

const SLUGS: Record<number, string> = {
  1: '/',
  2: '/tools/palm-line-finder/',
  3: '/tools/palm-photo-checker/',
  4: '/tools/heart-line-finder/',
  5: '/tools/head-line-finder/',
  6: '/tools/life-line-finder/',
  7: '/tools/fate-line-finder/',
  8: '/tools/which-hand-quiz/',
  9: '/tools/hand-type-quiz/',
  10: '/tools/palm-signs-checker/',
  11: '/tools/palm-map/',
  12: '/tools/palm-reading-quiz/',
  13: '/tools/finger-reader/',
  14: '/tools/left-vs-right-palm/',
};

describe('tool registry', () => {
  it('has the 14 tools at their KEYWORD_MAP §3 URLs, each registered as a page', () => {
    expect(TOOLS).toHaveLength(14);
    for (const tool of TOOLS) {
      expect(tool.path).toBe(SLUGS[tool.num]);
      expect(findPage(tool.path), tool.path).toBeDefined();
    }
    expect(new Set(TOOLS.map((tool) => tool.id)).size).toBe(14);
    expect(findPage('/tools/')?.sitemap).toBe('tools');
  });

  it('says AI wherever a model runs (server scanner or on-device hand model); every other label says "not AI" or no photo', () => {
    for (const tool of TOOLS) {
      if (tool.kind === 'ai') expect(tool.label).toMatch(/^Uses AI to trace your lines\./);
      else if (tool.kind === 'hand') expect(tool.label === HAND_MODEL_LABEL || /AI scanner, which receives the photos/.test(tool.label)).toBe(true);
      else if (tool.kind === 'device') expect(tool.label).toBe('Runs on your phone: your photo never leaves this device.');
      else expect(tool.label).toMatch(/not AI|no photo needed/);
    }
    expect(KIND_ORDER).toHaveLength(4);
    expect(HAND_MODEL_LABEL).toMatch(/AI model that runs on your phone/);
  });

  it('keeps the server AI tools "opens soon" and the line finder noindex until their server is live', () => {
    expect(toolById('free-reading').live).toBe(site.webReadingEnabled);
    expect(toolById('line-finder').live).toBe(LINE_SCAN_LIVE);
    expect(findPage('/tools/palm-line-finder/')?.indexable).toBe(LINE_SCAN_LIVE);
    for (const id of ['hand-type', 'finger-reader', 'hand-compare'] as const) expect(toolById(id).live).toBe(true);
  });

  it('builds valid Play referrers for every tool page', () => {
    for (const tool of TOOLS) expect(() => playStoreUrl({ medium: toolMedium(tool.id), campaign: 'end_block' })).not.toThrow();
    expect(otherTools('palm-map').map((tool) => tool.id)).not.toContain('palm-map');
  });

  it('hub schema: CollectionPage + ItemList of all 14, tool 1 = home, no ratings', () => {
    const data = toolsHubSchema({ name: 'x', description: 'y', tools: TOOLS });
    const list = data.mainEntity as { itemListElement: { url: string; position: number }[] };
    expect(data['@type']).toBe('CollectionPage');
    expect(list.itemListElement).toHaveLength(14);
    expect(list.itemListElement[0]?.url).toBe('https://palmsays.com/');
    expect(JSON.stringify(data)).not.toMatch(/Rating|Review/);
  });
});

describe('palm signs checker content', () => {
  it('every sign says what is left out; books are known; M has no classical source', () => {
    for (const sign of SIGNS) {
      expect(sign.leftOut.length).toBeGreaterThan(20);
      for (const cite of sign.cites) expect(BOOKS[cite.book]).toBeDefined();
      expect(sign.glyph).toMatch(/^M/);
    }
    const m = SIGNS.find((sign) => sign.id === 'm');
    expect(m?.booksSay).toBeNull();
    expect(m?.cites).toHaveLength(0);
    expect(SIGNS.find((sign) => sign.id === 'island')?.booksSay).toBeNull();
  });

  it('never promises an outcome in "what the books say"', () => {
    for (const sign of SIGNS) {
      expect(sign.booksSay ?? '').not.toMatch(/wealth|riches|fame|children|lucky|success|illness|you will/i);
    }
  });

  it('returns picked signs in page order and ignores unknown ids', () => {
    expect(pickedSigns(['star', 'm', 'nope']).map((sign) => sign.id)).toEqual(['m', 'star']);
    expect(pickedSigns([])).toEqual([]);
  });
});

describe('interactive palm map', () => {
  it('has 4 lines and 8 mount spots with unique ids and sources', () => {
    expect(MAP_SPOTS.filter((spot) => spot.kind === 'line')).toHaveLength(4);
    expect(MAP_SPOTS.filter((spot) => spot.kind === 'mount')).toHaveLength(8);
    expect(new Set(MAP_SPOTS.map((spot) => spot.id)).size).toBe(12);
    for (const spot of MAP_SPOTS) {
      expect(citeText(spot.cite)).toMatch(/\(\d{4}\), /);
      expect(spot.bookLead.length).toBeGreaterThan(5);
    }
    expect(spotById('mars-thumb')?.name).toMatch(/near the thumb/);
    expect(spotById('mars-outer')?.name).toMatch(/outer edge/);
  });

  it('keeps every tap target inside the map view and at least 13.5% of its width (about 48px on a phone) apart', () => {
    const [minX, minY, width, height] = MAP_VIEWBOX.split(' ').map(Number) as [number, number, number, number];
    const minGap = width * 0.135;
    const pins = MAP_SPOTS.map((spot) => spot.pin);
    for (const pin of pins) {
      expect(pin.x).toBeGreaterThanOrEqual(minX);
      expect(pin.x).toBeLessThanOrEqual(minX + width);
      expect(pin.y).toBeGreaterThanOrEqual(minY);
      expect(pin.y).toBeLessThanOrEqual(minY + height);
    }
    for (let i = 0; i < pins.length; i += 1) {
      for (let j = i + 1; j < pins.length; j += 1) {
        const a = pins[i]!;
        const b = pins[j]!;
        expect(Math.hypot(a.x - b.x, a.y - b.y), `${MAP_SPOTS[i]?.id} vs ${MAP_SPOTS[j]?.id}`).toBeGreaterThanOrEqual(minGap);
      }
    }
    expect(Object.keys(LINE_PINS)).toHaveLength(4);
    expect(Object.keys(MOUNT_AREAS)).toHaveLength(8);
  });

  it('converts palm-frame coordinates to percentages of the map view', () => {
    expect(toPercent(110, 150)).toEqual({ left: 0, top: 0 });
    expect(toPercent(910, 1120)).toEqual({ left: 100, top: 100 });
    expect(toPercent(510, 635)).toEqual({ left: 50, top: 50 });
  });
});

describe('thumbnails on the 3D hand', () => {
  const finders = [HEART_FINDER, HEAD_FINDER, LIFE_FINDER, FATE_FINDER];
  it('draws only options that exist in the finder data, and every option that had a picture still has one', () => {
    for (const finder of finders) {
      for (const { question, value } of lineThumbKeys(finder.line)) {
        const q = finder.questions.find((item) => item.id === question);
        expect(q, `${finder.line}.${question}`).toBeDefined();
        expect(q?.options.some((option) => option.value === value), `${finder.line}.${question}.${value}`).toBe(true);
      }
      // Plain yes/no follow-ups ("No fork", "No branches", "just one") are the only options without a picture.
      for (const q of finder.questions) {
        for (const option of q.options) {
          const plain = (q.id === 'fork' || q.id === 'branches' || q.id === 'double') && option.value === 'no';
          expect(Boolean(lineThumb(finder.line, q.id, option.value)), `${finder.line}.${q.id}.${option.value}`).toBe(!plain);
        }
      }
    }
  });
  it('keeps each drawn line inside the palm frame and each crop inside the picture', () => {
    for (const finder of finders) {
      for (const { question, value } of lineThumbKeys(finder.line)) {
        const figure = lineThumb(finder.line, question, value)!;
        const [x, y, w, h] = figure.view.split(' ').map(Number) as [number, number, number, number];
        expect(x).toBeGreaterThanOrEqual(0);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(x + w).toBeLessThanOrEqual(1000);
        expect(y + h).toBeLessThanOrEqual(1300);
        for (const path of figure.paths ?? []) {
          const nums = path.d.match(/-?\d+(\.\d+)?/g)!.map(Number);
          for (let i = 0; i < nums.length; i += 2) {
            expect(nums[i]).toBeGreaterThanOrEqual(150);
            expect(nums[i]).toBeLessThanOrEqual(720);
            expect(nums[i + 1]).toBeGreaterThanOrEqual(560);
            expect(nums[i + 1]).toBeLessThanOrEqual(1100);
          }
        }
      }
    }
  });
  it('places every palm sign', () => {
    for (const sign of SIGNS) {
      expect(SIGN_SPOTS[sign.id], sign.id).toBeDefined();
      expect(signThumb(sign.id, sign.glyph)?.view).toBeTruthy();
    }
  });
});

describe('tool analytics hooks', () => {
  it('are no-ops by default and send only typed fields to a sink', () => {
    expect(() => track('tool_use', { tool: 'palm-map' })).not.toThrow();
    const seen: unknown[] = [];
    const restore = setAnalyticsSink((name, props) => seen.push([name, props]));
    resetToolUse();
    trackToolUse('palm-map');
    trackToolUse('palm-map');
    trackPhotoCheck('photo-checker', false, 'too_dark');
    trackPhotoCheck('photo-checker', true, null);
    restore();
    trackToolUse('line-quiz');
    expect(seen).toEqual([
      ['tool_use', { tool: 'palm-map' }],
      ['photo_check_fail', { tool: 'photo-checker', reason: 'too_dark' }],
      ['photo_check_pass', { tool: 'photo-checker' }],
    ]);
  });

  it('never lets a broken sink break a tool', () => {
    const restore = setAnalyticsSink(() => {
      throw new Error('boom');
    });
    expect(() => track('qr_view', { page: 'x' })).not.toThrow();
    restore();
  });

  it('reads the device class from <html data-os>', () => {
    const root = (os: string | null) => ({ getAttribute: () => os });
    expect(currentDevice(root('android'), false)).toBe('android');
    expect(currentDevice(root('ios'), false)).toBe('ios');
    expect(currentDevice(root(null), true)).toBe('desktop');
    expect(currentDevice(null, false)).toBe('other');
  });
});
