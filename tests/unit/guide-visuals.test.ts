import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import leftScanJson from '../../src/lib/guides/scans/left-palm-scan.json';
import scanJson from '../../src/lib/guides/scans/guide-palm-scan.json';
import { PAGES } from '../../src/config/pages';
import { examplePhoto, srcsetFiles, tile, WORD_TILE } from '../../src/lib/guides/images';
import { HAND_SHAPE_ORDER, isVariant, VARIANTS, type VariantName } from '../../src/lib/guides/palm-geometry';
import { contextRefs, focusId, PALM_SPRITE, PALM_SPRITE_URL } from '../../src/lib/guides/palm-sprite';
import { guideStrings } from '../../src/lib/guides/strings';
import {
  FINGER_TIPS,
  fingerGuides,
  fingerLabels,
  GUIDE_LINES,
  GUIDE_HEROES,
  GUIDE_PHOTO,
  GUIDE_PHOTO_WIDTHS,
  guideScan,
  LEFT_PALM_PHOTO,
  PUSH,
  ZOOM_STEPS,
  heroCamera,
  lineCrop,
  lineEnds,
  lineLabels,
  MAX_POINTS,
  MOUNT_ORDER,
  mountAreas,
  ORIGIN_STEPS,
  overlaps,
  palmCrop,
  parseGuideScan,
  toScreen,
  TYPE,
  type Box,
  type GuideLine,
} from '../../src/lib/guides/traced-palm';

/**
 * Guide template v4, "teach by seeing" (WEB-DEC-047): the traced hero and the
 * teaching blocks. Honesty first: a line on a photo comes only from the
 * scanner's real output for that photo; then layout (labels inside the photo,
 * never on top of each other, in English and Hindi), the quiz, and links.
 */

const ROOT = process.cwd();
const read = (path: string) => readFileSync(join(ROOT, path), 'utf8').replace(/\r\n/g, '\n');
const COMPONENTS = 'src/components/guides';
const scan = guideScan();
const cam = heroCamera(scan);
const W = GUIDE_PHOTO.width;
const H = GUIDE_PHOTO.height;
const inside = (box: Box, pad = 0) => box.x >= pad - 0.01 && box.y >= pad - 0.01 && box.x + box.w <= W - pad + 0.01 && box.y + box.h <= H - pad + 0.01;

type P = [number, number];
const dist = (p: P, a: P, b: P) => {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
};
/** Points along an "M x y C … C …" path. */
function sampleCubic(d: string): P[] {
  const nums = (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
  const out: P[] = [];
  let [x, y] = [nums[0]!, nums[1]!];
  for (let i = 2; i + 5 < nums.length + 0; i += 6) {
    const [x1, y1, x2, y2, x3, y3] = nums.slice(i, i + 6) as [number, number, number, number, number, number];
    for (const t of [0, 0.25, 0.5, 0.75]) {
      const u = 1 - t;
      out.push([u ** 3 * x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t ** 3 * x3, u ** 3 * y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t ** 3 * y3]);
    }
    [x, y] = [x3, y3];
  }
  out.push([x, y]);
  return out;
}

describe('the guide photo and its scan', () => {
  it('is the real palm4_v2@8a252bb scan of the 1800 × 2400 real HD photo, drawn in a 360 × 480 frame, with 21 landmarks and all 4 lines', () => {
    expect(scanJson.image).toEqual({ width: 1800, height: 2400 });
    expect(GUIDE_PHOTO.file).toEqual({ width: 1800, height: 2400 });
    expect(scan.width).toBe(360);
    expect(scan.height).toBe(480);
    expect(scan.model).toContain('palm4_v2@8a252bb');
    for (const line of GUIDE_LINES) expect(scanJson.lines[line].pixel_confidence, line).toBeGreaterThanOrEqual(0.9);
    expect(scan.landmarks).toHaveLength(21);
    expect(scan.lines.map((t) => t.line)).toEqual(['heart', 'head', 'life', 'fate']);
    expect(scan.missing).toEqual([]);
  });

  it('ships the HD photo at every srcset size (600 to 1800 px), the crop file included, with a licence entry', () => {
    const files = [GUIDE_PHOTO.fallback, GUIDE_PHOTO.crop, ...`${GUIDE_PHOTO.avif}, ${GUIDE_PHOTO.webp}`.split(/,\s*/).map((s) => s.split(' ')[0]!)];
    for (const w of GUIDE_PHOTO_WIDTHS) for (const ext of ['avif', 'webp']) expect(files).toContain(`/images/guides/palm-hero-${w}.${ext}`);
    for (const src of files) expect(existsSync(join(ROOT, 'public', src)), src).toBe(true);
    expect(GUIDE_PHOTO.crop).toBe('/images/guides/palm-hero-1800.webp');
    expect(read('public/samples/LICENSE.txt')).toMatch(/palm-hero-600\.avif[\s\S]*real photo[\s\S]*a-persons-palm-on-white-background-8058729[\s\S]*8a252bb/);
  });

  it('credits the real HD photo in the caption and the alt text, and still labels the AI-made renders (English and Hindi)', () => {
    const en = guideStrings('en').teach;
    expect(en.heroCaption).toBe('A real palm photo (Hanna Pad, Pexels), traced by the real PalmSays scanner. Your reading is made from your own photo.');
    expect(en.heroAlt('heart')).toMatch(/^A real photo/);
    expect(en.photoCaption).toMatch(/real \(Hanna Pad, Pexels\); the other example photos are AI-made/);
    expect(en.shapesCaption).toMatch(/^AI-made 3D/);
    const hi = guideStrings('hi').teach;
    for (const text of [hi.heroCaption, hi.heroAlt('x')]) expect(text).toContain('असली');
    expect(hi.heroCaption).toContain('Pexels');
    for (const text of [hi.photoCaption, hi.shapesCaption, hi.wordsCredit]) expect(text).toContain('AI');
  });

  it('leaves the reading preview (/reading/) on its own photo and scan', () => {
    expect(read('src/lib/guides/traced-palm.ts')).not.toMatch(/reading\/mock\/scan-response/);
    expect(read('src/lib/reading/api-mock.ts')).toMatch(/mock-scan-palm\.webp/);
    expect(existsSync(join(ROOT, 'public/samples/mock-scan-palm.webp'))).toBe(true);
  });

  it('refuses a scan made for another photo shape', () => {
    expect(parseGuideScan({ ...scanJson, image: { width: 480, height: 360 } })).toBeNull();
    expect(parseGuideScan({ nope: true })).toBeNull();
  });

  it('never draws a line the scanner did not return clearly', () => {
    const raw = structuredClone(scanJson) as unknown as { lines: Record<string, { flagged: boolean; present: boolean }> };
    raw.lines.fate!.flagged = true;
    raw.lines.head!.present = false;
    const parsed = parseGuideScan(raw)!;
    expect(parsed.lines.map((t) => t.line)).toEqual(['heart', 'life']);
    expect(parsed.missing).toEqual(['head', 'fate']);
  });

  it('keeps every point inside the photo, at most MAX_POINTS a line', () => {
    for (const trace of scan.lines) {
      expect(trace.points.length).toBeGreaterThanOrEqual(2);
      expect(trace.points.length).toBeLessThanOrEqual(MAX_POINTS);
      for (const [x, y] of trace.points) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(W);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(H);
      }
    }
  });

  it('draws each curve on the scanner’s own polyline (within 1.5 px)', () => {
    const lines = (scanJson as unknown as { lines: Record<string, { polyline: P[] }> }).lines;
    for (const trace of scan.lines) {
      const poly = lines[trace.line]!.polyline.map(([x, y]) => [x * W, y * H] as P);
      expect(trace.d.startsWith(`M${trace.points[0]![0]} ${trace.points[0]![1]}`)).toBe(true);
      for (const p of sampleCubic(trace.d)) {
        const near = Math.min(...poly.slice(1).map((b, i) => dist(p, poly[i]!, b)));
        expect(near, `${trace.line} at ${p.map(Math.round).join(',')}`).toBeLessThanOrEqual(1.5);
      }
    }
  });
});

describe('no drawn line on a photo unless it is the scanner’s', () => {
  const photoParts = ['PhotoCrop', 'LineLesson', 'MountMap', 'MistakePair', 'CheckQuiz', 'PhotoSteps', 'FlowChoice', 'HeartEnds'];

  it('photo crops write no path data of their own and use only #tpd-* scanner shapes', () => {
    for (const name of photoParts) {
      const source = read(`${COMPONENTS}/${name}.astro`);
      expect(source, name).not.toMatch(/<path\b/);
      expect(source, name).not.toMatch(/#pgd-/);
      for (const [, href] of source.matchAll(/<use[^>]*href=\{?[`"']([^`"'}]+)/g)) expect(href, name).toMatch(/^#tpd-/);
    }
  });

  it('the hero draws on the photo only #tpd-* scanner lines and the name leaders', () => {
    const source = read(`${COMPONENTS}/TracedPalm.astro`);
    const svg = source.slice(source.indexOf('<svg class="tp-svg"'), source.indexOf('</svg>', source.indexOf('<svg class="tp-svg"')));
    const defs = svg.slice(svg.indexOf('<defs>'), svg.indexOf('</defs>'));
    const drawn = svg.replace(defs, '');
    for (const [, href] of drawn.matchAll(/<use[^>]*href=\{`([^`]+)`\}/g)) expect(href).toMatch(/^#tpd-/);
    const paths = [...drawn.matchAll(/<path\b[^>]*\bd=\{(`[^`]*`|[^}]+)\}/g)].map((m) => m[1]);
    expect(paths).toEqual(['`M${label.from[0]} ${label.from[1]}L${label.anchor[0]} ${label.anchor[1]}`']);
    expect(defs).toMatch(/d=\{trace\.d\}/);
  });

  it('the teaching blocks that use the hero’s shapes only appear with the hero', () => {
    for (const file of readdirSync(join(ROOT, 'src/content/guides'))) {
      const raw = read(`src/content/guides/${file}`);
      if (/<(LineLesson|MountMap|CheckQuiz|MistakePair|WhichHand|CompareRow|PhotoSteps|FlowChoice|HeartEnds)\b/.test(raw)) {
        expect(raw, file).toMatch(/^ {2}show: animate$/m);
        expect(raw, file).not.toMatch(/^ {2}photo: left-palm$/m);
      }
    }
  });
});

describe('labels on the hero', () => {
  for (const locale of ['en', 'hi'] as const) {
    const s = guideStrings(locale);
    const labels = lineLabels(scan, s.lineShort, cam);
    const fingers = fingerLabels(scan, s.teach.fingers, cam, labels.map((l) => l.screen));

    it(`${locale}: every line has a name inside the photo, none overlapping`, () => {
      expect(labels.map((l) => l.line).sort()).toEqual([...GUIDE_LINES].sort());
      for (const label of labels) expect(inside(label.screen, 4), label.line).toBe(true);
      for (let i = 0; i < labels.length; i++) for (let j = i + 1; j < labels.length; j++) expect(overlaps(labels[i]!.screen, labels[j]!.screen)).toBe(false);
    });

    it(`${locale}: each leader ends on its own traced line`, () => {
      for (const label of labels) {
        const trace = scan.lines.find((t) => t.line === label.line)!;
        const onLine = trace.points.map((p) => toScreen(p, cam)).some(([x, y]) => Math.hypot(x - label.screen.anchor[0], y - label.screen.anchor[1]) < 0.01);
        expect(onLine, label.line).toBe(true);
      }
    });

    it(`${locale}: finger names sit above their own fingertip, inside the photo, clear of every other name`, () => {
      expect(fingers.map((f) => f.finger)).toEqual([0, 1, 2, 3, 4]);
      const boxes = [...fingers.map((f) => f.screen), ...labels.map((l) => l.screen)];
      for (const finger of fingers) {
        expect(inside(finger.screen, 4), finger.text).toBe(true);
        const tip = toScreen(scan.landmarks![FINGER_TIPS[finger.finger]!]!, cam);
        expect(finger.screen.y + finger.screen.h, finger.text).toBeLessThanOrEqual(tip[1]);
      }
      for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) expect(overlaps(boxes[i]!, boxes[j]!), `${i}/${j}`).toBe(false);
    });
  }

  it('names the fingers in hand order: thumb, then index to little across the palm', () => {
    expect(FINGER_TIPS).toEqual([4, 8, 12, 16, 20]);
    const xs = FINGER_TIPS.map((i) => scan.landmarks![i]![0]);
    // The real photo (2026-10-02) is a right palm seen from the palm side: thumb on the right, little finger on the left.
    expect([...xs].sort((a, b) => b - a)).toEqual(xs);
    expect(guideStrings('en').teach.fingers).toEqual(['Thumb', 'Index', 'Middle', 'Ring', 'Little']);
    expect(guideStrings('hi').teach.fingers).toEqual(['अंगूठा', 'तर्जनी', 'मध्यमा', 'अनामिका', 'कनिष्ठा']);
  });

  it('keeps SVG type at 13 px or more on a 320 px screen, and uses a zoom origin the CSS knows', () => {
    expect(TYPE * (288 / W)).toBeGreaterThanOrEqual(13);
    const css = read(`${COMPONENTS}/TracedPalm.astro`);
    for (const step of ORIGIN_STEPS) {
      expect(css).toContain(`.tpo-x${step} {`);
      expect(css).toContain(`.tpo-y${step} {`);
    }
    for (const cls of cam.classes) expect(cls).toMatch(/^tpo-[xy](30|35|40|45|50|55|60|65|70)$/);
  });
});

describe('the owner’s left palm, the which-hand hero (WEB-DEC-048)', () => {
  const left = guideScan('left-palm');
  const { width: LW, height: LH } = LEFT_PALM_PHOTO;
  const leftCam = heroCamera(left, PUSH, LEFT_PALM_PHOTO.zoom);
  const within = (box: Box, pad = 4) => box.x >= pad - 0.01 && box.y >= pad - 0.01 && box.x + box.w <= LW - pad + 0.01 && box.y + box.h <= LH - pad + 0.01;

  it('is the real palm4_v2@8a252bb scan of the 960 × 1280 photo, drawn in the same 360-wide frame', () => {
    expect(leftScanJson.model.name).toContain('8a252bb');
    expect(leftScanJson.image).toEqual({ width: 960, height: 1280 });
    expect(LEFT_PALM_PHOTO.file).toEqual({ width: 960, height: 1280 });
    expect([left.width, left.height]).toEqual([360, 480]);
    expect(left.landmarks).toHaveLength(21);
    expect(left.lines.map((t) => t.line)).toEqual(['heart', 'head', 'life', 'fate']);
    expect(left.missing).toEqual([]);
  });

  it('ships every photo file, no bigger than the 960 px source, with a licence entry', () => {
    const photo = GUIDE_HEROES['left-palm'].photo;
    for (const src of [photo.fallback, photo.crop, ...`${photo.avif}, ${photo.webp}`.split(/,\s*/).map((x) => x.split(' ')[0]!)]) {
      expect(existsSync(join(ROOT, 'public', src)), src).toBe(true);
      expect(src).not.toMatch(/-1200\./);
    }
    expect(read('public/samples/LICENSE.txt')).toMatch(/left-palm-480\.avif[\s\S]*owner[\s\S]*2026-09-28[\s\S]*8a252bb/);
  });

  it('draws each curve on the scanner’s own polyline (within 1.5 units)', () => {
    const lines = (leftScanJson as unknown as { lines: Record<string, { polyline: P[] }> }).lines;
    for (const trace of left.lines) {
      const poly = lines[trace.line]!.polyline.map(([x, y]) => [x * LW, y * LH] as P);
      for (const p of sampleCubic(trace.d)) {
        const near = Math.min(...poly.slice(1).map((b, i) => dist(p, poly[i]!, b)));
        expect(near, `${trace.line} at ${p.map(Math.round).join(',')}`).toBeLessThanOrEqual(1.5);
      }
    }
  });

  for (const locale of ['en', 'hi'] as const) {
    it(`${locale}: line and finger names inside the framed photo, above their fingertips, none overlapping`, () => {
      const s = guideStrings(locale);
      const labels = lineLabels(left, s.lineShort, leftCam);
      const fingers = fingerLabels(left, s.teach.fingers, leftCam, labels.map((l) => l.screen));
      expect(labels.map((l) => l.line).sort()).toEqual([...GUIDE_LINES].sort());
      const boxes = [...fingers.map((f) => f.screen), ...labels.map((l) => l.screen)];
      for (const box of boxes) expect(within(box)).toBe(true);
      for (const finger of fingers) expect(finger.screen.y + finger.screen.h).toBeLessThanOrEqual(toScreen(left.landmarks![FINGER_TIPS[finger.finger]!]!, leftCam)[1]);
      for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) expect(overlaps(boxes[i]!, boxes[j]!), `${i}/${j}`).toBe(false);
    });
  }

  it('frames with a zoom class the CSS knows; the scan-guide hero keeps its old camera', () => {
    const css = read(`${COMPONENTS}/TracedPalm.astro`);
    for (const step of ZOOM_STEPS.filter((z) => z !== 1)) expect(css).toContain(`.tpz-${Math.round(step * 100)} {`);
    expect(leftCam.classes.at(-1)).toBe(`tpz-${Math.round(LEFT_PALM_PHOTO.zoom * 100)}`);
    expect(heroCamera(scan).classes).toHaveLength(2);
    expect(heroCamera(scan).scale).toBe(1.1);
  });

  it('is used only as the /which-hand-to-read/ hero, with the §9 caption and no reading of this hand', () => {
    const guides = 'src/content/guides';
    for (const file of readdirSync(join(ROOT, guides))) {
      const raw = read(`${guides}/${file}`);
      expect(/^ {2}photo: left-palm$/m.test(raw), file).toBe(file === 'which-hand-to-read.mdx');
    }
    expect(read(`${guides}/which-hand-to-read.mdx`)).toMatch(/^ {2}show: animate$/m);
    const en = guideStrings('en').teach;
    expect(en.leftPalmCaption).toBe('A real photo, traced by PalmSays. Your reading is made from your own photo.');
    expect(en.leftPalmAlt(['Heart', 'Head', 'Life', 'Fate'])).toBe('A real open left palm, photographed indoors, with the heart, head, life and fate lines traced by PalmSays.');
    expect(`${en.leftPalmCaption} ${en.leftPalmAlt(['Heart'])}`).not.toMatch(/accurate|scientific/i);
  });
});

describe('crops and mount areas', () => {
  it('crops every line inside the photo, with the whole line in view', () => {
    for (const trace of scan.lines) {
      const box = lineCrop(scan, trace.line)!;
      expect(inside(box), trace.line).toBe(true);
      for (const [x, y] of trace.points) expect(x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h, trace.line).toBe(true);
    }
  });

  it('places 8 mount areas inside the palm view, in the order the text lists them', () => {
    const areas = mountAreas(scan);
    const box = palmCrop(scan);
    expect(areas.map((a) => a.key).sort()).toEqual([...MOUNT_ORDER].sort());
    expect(MOUNT_ORDER).toEqual(['jupiter', 'saturn', 'sun', 'mercury', 'marsInner', 'venus', 'moon', 'marsOuter']);
    for (const a of areas) expect(a.cx - a.rx >= box.x && a.cx + a.rx <= box.x + box.w && a.cy - a.ry >= box.y && a.cy + a.ry <= box.y + box.h, a.key).toBe(true);
  });

  it('ships every teaching render and example photo at every srcset size', () => {
    expect(HAND_SHAPE_ORDER).toHaveLength(7);
    const images = [
      ...HAND_SHAPE_ORDER.map((key) => tile(`shape-${key}`)),
      tile('hand-writing'),
      tile('hand-other'),
      ...guideStrings('en').teach.words.map((word) => tile(WORD_TILE[word.key]!)),
      ...guideStrings('en').teach.photoDonts.map((item) => examplePhoto(item.key)),
    ];
    for (const img of images) {
      expect(srcsetFiles(img)).toHaveLength(4);
      for (const src of [img.src, ...srcsetFiles(img)]) expect(existsSync(join(ROOT, 'public', src)), src).toBe(true);
    }
    expect(Object.keys(WORD_TILE).sort()).toEqual(guideStrings('en').teach.words.map((w) => w.key).sort());
  });

  it('the price boxes (shared PricePanel on /app/ and home) use our own 3D icons at 96, 192 and 288 px, no emoji images left', () => {
    const app = read('src/components/PricePanel.astro');
    expect(read('src/components/app/AppPage.astro')).toContain('<PricePanel');
    expect(read('src/components/home/Pricing.astro')).toContain('<PricePanel');
    for (const name of ['gift', 'crown', 'bolt']) {
      for (const w of [96, 192, 288]) for (const ext of ['avif', 'webp']) expect(existsSync(join(ROOT, `public/images/icons3d/${name}-${w}.${ext}`)), `${name}-${w}.${ext}`).toBe(true);
      expect(app).toContain(`icon3d('${name}')`);
    }
    expect(app).not.toMatch(/images\/emoji/);
    expect(existsSync(join(ROOT, 'public/images/emoji'))).toBe(false);
  });
});

describe('teaching words', () => {
  for (const locale of ['en', 'hi'] as const) {
    const t = guideStrings(locale).teach;

    it(`${locale}: every quiz question has exactly one right answer and an answer for every option`, () => {
      expect(t.quiz).toHaveLength(3);
      for (const item of t.quiz) {
        expect(item.options.filter((o) => o.ok), item.q).toHaveLength(1);
        for (const option of item.options) expect(option.fb.trim().length, option.text).toBeGreaterThan(10);
        if (item.crop) expect(GUIDE_LINES).toContain(item.crop);
      }
    });

    it(`${locale}: no arrows, middle dots or emoji in the teaching words`, () => {
      const text = JSON.stringify({ ...t, heroAlt: t.heroAlt('x'), lessonCaption: t.lessonCaption('x'), openGuide: t.openGuide('x') });
      expect(text).not.toMatch(/→| · |\p{Extended_Pictographic}/u);
    });
  }

  it('matches the English and Hindi shapes (the Hindi column mirrors every key)', () => {
    const shape = (v: unknown): unknown =>
      Array.isArray(v) ? v.map(shape) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shape(x)])) : typeof v;
    expect(shape(guideStrings('hi').teach)).toEqual(shape(guideStrings('en').teach));
  });
});

describe('the pilot page (/palm-reading/)', () => {
  const raw = read('src/content/guides/palm-reading.mdx');
  const body = raw.split(/^---$/m).slice(2).join('---');
  const slug = (heading: string) => heading.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s/g, '-');
  const headings = [...body.matchAll(/^## (.+)$/gm)].map((m) => slug(m[1] ?? ''));

  it('points every step tile at a heading on the page', () => {
    const hrefs = [...body.matchAll(/href: '([^']+)'/g)].map((m) => m[1] ?? '');
    expect(hrefs).toHaveLength(7);
    for (const href of hrefs) expect(headings, href).toContain(href.slice(1));
  });

  it('uses only drawings that exist in the line lessons, and each line’s guide is a real page', () => {
    const lessons = [...body.matchAll(/<LineLesson line="(\w+)" forms=\{(\[[\s\S]*?\])\} \/>/g)];
    expect(lessons.map((m) => m[1])).toEqual(['heart', 'head', 'life', 'fate']);
    for (const [, line, forms] of lessons) {
      const variants = [...(forms ?? '').matchAll(/\['([\w-]+)', '[^']+'\]/g)].map((m) => m[1] ?? '');
      expect(variants, line).toHaveLength(3);
      for (const variant of variants) {
        expect(isVariant(variant), variant).toBe(true);
        expect(variant.startsWith(`${line}-`), variant).toBe(true);
      }
      expect(PAGES.some((page) => page.path === `/${line}-line/`), line).toBe(true);
    }
  });

  it('keeps the v3 H2s and adds only "Check yourself", before the limits box', () => {
    for (const h of ['What is palm reading?', 'What you need to read a palm', 'Common beginner mistakes', 'Practise: the palm reading quiz']) {
      expect(body).toContain(`## ${h}\n`);
    }
    expect(body.indexOf('## Check yourself: ')).toBeGreaterThan(body.indexOf('## Common beginner mistakes'));
    expect(body.indexOf('<CheckQuiz')).toBeLessThan(body.indexOf('<LimitsBox'));
    expect((body.match(/<LimitsBox/g) ?? []).length).toBe(1);
  });

  it('defines the entity first and has one limits section (heading spec, WEB-DEC-051)', () => {
    const h2s = [...body.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
    expect(h2s[0]).toBe('What is palm reading?');
    // "Words to know" (its own H2 inside the component) comes after the definition, not before it.
    expect(body.indexOf('<WordsToKnow />')).toBeGreaterThan(body.indexOf('## What is palm reading?'));
    expect(body).toContain('chiromancy');
    // The limits box carries its own heading: no second "can't answer / can't tell" section.
    expect(h2s.filter((h) => /can’t (answer|tell)/.test(h ?? ''))).toEqual([]);
    expect(guideStrings('en').teach.wordsTitle).toBe('Palmistry words to know');
  });
});

describe('every teaching figure has alt text and a caption', () => {
  const figures = ['TracedPalm', 'PhotoDoDont', 'WhichHand', 'HandShapes', 'LineLesson', 'MountMap', 'MistakePair', 'PhotoSteps', 'FlowChoice', 'HeartEnds'];
  for (const name of figures) {
    it(name, () => {
      const source = read(`${COMPONENTS}/${name}.astro`);
      const markup = source.slice(source.lastIndexOf('---') + 3);
      expect((markup.match(/<figure\b/g) ?? []).length, 'figures').toBeGreaterThan(0);
      expect((markup.match(/<figure\b/g) ?? []).length, 'captions').toBe((markup.match(/<figcaption\b/g) ?? []).length);
      for (const [tag] of markup.matchAll(/<img\b[^>]*>/g)) expect(tag, name).toMatch(/\balt=\{/);
      for (const [tag] of markup.matchAll(/<(svg|div|PhotoCrop)\b[^>]*role="img"[^>]*>/g)) expect(tag, name).toMatch(/aria-label=/);
      for (const [tag] of markup.matchAll(/<PhotoCrop\b[^>]*>/g)) expect(tag, name).toMatch(/\balt=\{/);
    });
  }

  it('the drawn lines come from the cached sprite, and every id a <use> can ask for exists in it (WEB-DEC-052)', () => {
    const ids = new Set([...PALM_SPRITE.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    for (const name of Object.keys(VARIANTS) as VariantName[]) {
      for (const ref of contextRefs(name)) expect(ids.has(ref.id), `${name} → ${ref.id}`).toBe(true);
      const focus = focusId(name);
      if ((VARIANTS[name] as { paths: readonly string[] }).paths.length) expect(focus && ids.has(focus), name).toBe(true);
      else expect(focus, name).toBeNull();
    }
    expect(PALM_SPRITE_URL).toMatch(/^\/img\/guides\/palm-sprite\.svg\?v=[0-9a-f]{10}$/);
    expect(read('src/pages/img/guides/palm-sprite.svg.ts')).toContain('PALM_SPRITE');
    // Geometry only: no colour, class or style in the sprite (Day/Night come from the page's <use>).
    expect(PALM_SPRITE).not.toMatch(/\s(class|style|fill|stroke)=/);
    for (const name of ['PalmDiagram', 'CompareRow']) {
      const source = read(`${COMPONENTS}/${name}.astro`);
      expect(source, name).toContain('spriteHref(');
      expect(source.slice(source.lastIndexOf('---') + 3), `${name} writes no line path data`).not.toMatch(/<path\b(?![^>]*id="pd-palm")/);
    }
  });

  it('no tilt, no inline style, no define:vars in the teaching components', () => {
    for (const name of [...figures, 'PhotoCrop', 'WordsToKnow', 'ReadFlow', 'StepMap', 'CompareRow', 'LineQuestions', 'CheckQuiz', 'LineAnatomy']) {
      const source = read(`${COMPONENTS}/${name}.astro`);
      expect(source, name).not.toMatch(/data-tilt|\sstyle=|define:vars/);
    }
  });
});

describe('the 4 line guides (guide v4 rollout, 2026-09-28)', () => {
  const PAGES_V4: Record<GuideLine, { h2: string[]; anchors: string[] }> = {
    heart: {
      h2: ['Heart line types and their meanings', 'How to tell the heart line from the head line', 'Is the love line the same as the heart line?', 'Which end of the heart line do you read from?', 'Marks on the heart line', 'Heart line in the left and right hand, for women and men', 'When the heart and head lines join', 'Check yourself: heart line quiz', 'Myths about the heart line'],
      anchors: ['type-heart-end-index', 'type-heart-end-between', 'type-heart-end-middle', 'type-heart-long', 'type-heart-short', 'type-heart-straight', 'type-heart-fork', 'type-heart-broken', 'type-heart-chained', 'type-heart-clear', 'type-heart-faint', 'type-heart-branches-up', 'type-heart-curved', 'type-heart-absent', 'type-heart-branches-down', 'type-heart-double'],
    },
    head: {
      h2: ['Head line types and their meanings', 'How to tell the head line from the heart line', 'Two head lines?', 'Education line (vidya rekha)', 'Marks on the head line', 'Head line in the left and right hand, for women and men', 'When the heart and head lines join', 'Check yourself: head line quiz', 'Myths about the head line'],
      anchors: ['type-head-straight', 'type-head-gentle', 'type-head-sloping', 'type-head-long', 'type-head-short', 'type-head-fork', 'type-head-joined', 'type-head-separate', 'type-head-broken', 'type-head-chained', 'type-head-wavy', 'type-head-branch-up'],
    },
    life: {
      h2: ['Does a short life line mean a short life?', 'Life line types and their meanings', 'Marks on the life line', 'Life line vs fate line', 'Life line age calculation: why we don’t do it', 'Life line in the hand for women and men', 'Left and right hand', 'Check yourself: life line quiz', 'Myths about the life line'],
      anchors: ['type-life-wide', 'type-life-close', 'type-life-long', 'type-life-short', 'type-life-broken', 'type-life-double', 'type-life-fork', 'type-life-chained', 'type-life-faint', 'type-life-start-index', 'type-life-branches-up'],
    },
    fate: {
      h2: ['Fate line types and their meanings', 'Marks on the fate line', 'No fate line? It’s common', 'How to tell the fate line from the life line', 'Is it the career line or the luck line?', 'The fate line and your work', 'Fate line in a woman’s and a man’s hand', 'Check yourself: fate line quiz', 'Myths about the fate line'],
      anchors: ['type-fate-wrist', 'type-fate-from-life', 'type-fate-from-luna', 'type-fate-late', 'type-fate-end-index', 'type-fate-end-ring', 'type-fate-broken', 'type-fate-double', 'type-fate-faint', 'type-fate-from-venus', 'type-fate-from-head', 'type-fate-from-heart', 'type-fate-fork', 'type-fate-wavy'],
    },
  };
  const slug = (heading: string) => heading.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s/g, '-');
  const t = guideStrings('en').teach;

  for (const line of GUIDE_LINES) {
    const raw = read(`src/content/guides/${line}-line.mdx`);
    const body = raw.split(/^---$/m).slice(2).join('---');
    const headings = [...body.matchAll(/^#{2,3} (.+)$/gm)].map((m) => slug(m[1] ?? ''));
    const anchorsNow = [...body.matchAll(/<Variation\b[^>]*>/g)].map(([tag]) => tag.match(/\bid="([^"]+)"/)?.[1] ?? `type-${tag.match(/\bvariant="([^"]+)"/)?.[1]}`);

    describe(`/${line}-line/`, () => {
      it('shows the traced hero with this line in focus, drawn only from the scanner', () => {
        expect(raw).toMatch(new RegExp(`^find:\\n {2}region: ${line}\\n {2}show: animate$`, 'm'));
        const trace = scan.lines.find((tr) => tr.line === line)!;
        expect(trace, 'the scanner returned this line').toBeDefined();
        const ends = lineEnds(scan, line)!;
        const tips = [trace.points[0]!, trace.points.at(-1)!].map((p) => p.join(','));
        expect(tips.sort()).toEqual([ends.start, ends.end].map((p) => p.join(',')).sort());
      });

      it('follows the heading spec H2 by H2 (WEB-DEC-051) and keeps every card anchor', () => {
        const h2s = [...body.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
        expect(h2s).toEqual(PAGES_V4[line].h2);
        expect(anchorsNow.sort()).toEqual([...PAGES_V4[line].anchors].sort());
      });

      it('answers "where is it" once, in the module title; the end matter names the line', () => {
        expect(raw).toMatch(new RegExp(`^ {2}title: 'Where is the ${line} line on your palm\\?'$`, 'm'));
        expect([...body.matchAll(/^## (.+)$/gm)].map((m) => m[1]).filter((h) => /^Where (is|the)\b/.test(h ?? ''))).toEqual([]);
        const name = `${line.charAt(0).toUpperCase()}${line.slice(1)} line`;
        const s = guideStrings('en');
        expect(s.quickFactsOf(name)).toBe(`${name} quick facts`);
        expect(s.faqTitleOf(name)).toBe(`${name}: questions people ask`);
        expect(s.sourcesSummaryOf(name, 2)).toBe(`Sources for this ${line} line guide (2 books and studies)`);
        expect(s.endTitleOf(name)).toBe(`See your own ${line} line`);
        expect(s.lineShort[line]).toBe(name);
      });

      it('groups the cards under attribute questions (H3) with the cards as values (H4)', () => {
        const groups = [...body.matchAll(/^### (.+)\n\n(<CompareRow framed[^\n]*\/>)\n\n<Variations>/gm)];
        expect(groups.length, 'groups').toBeGreaterThanOrEqual(3);
        const questions = t.anatomy.map((a) => a.h.replace('{line}', `${line} line`));
        for (const [, q] of groups) expect(questions).toContain(q);
        for (const [h3] of body.matchAll(/^### .+$/gm)) expect(h3, 'every H3 names the line').toContain(`${line} line`);
        expect(body, 'cards stay at the default H4').not.toMatch(/<Variation\b[^>]*level=/);
        for (const row of body.matchAll(/<CompareRow framed forms=\{(\[[\s\S]*?\])\} \/>/g)) {
          const variants = [...(row[1] ?? '').matchAll(/\['([\w-]+)', '[^']+'\]/g)].map((m) => m[1] ?? '');
          expect(variants.length).toBeGreaterThanOrEqual(2);
          expect(variants.length).toBeLessThanOrEqual(5);
          for (const v of variants) expect(isVariant(v), v).toBe(true);
        }
      });

      it('links each of the 4 questions to a heading on this page', () => {
        expect(body).toContain(`<LineAnatomy line="${line}"`);
        const links: Record<string, string> = {
          ...Object.fromEntries(t.anatomy.map((a) => [a.key, `#${slug(a.h.replace('{line}', `${line} line`))}`])),
          ...(line === 'fate' ? { length: '#no-fate-line-its-common' } : {}),
        };
        if (line === 'fate') expect(body).toContain(`links={{ length: '#no-fate-line-its-common' }}`);
        for (const href of Object.values(links)) expect(headings, href).toContain(href.slice(1));
        expect(t.anatomyHint[line]).toHaveLength(4);
      });

      it('shows where it is in three looks, then keeps the numbered steps for search', () => {
        const at = body.indexOf(`<PhotoSteps line="${line}" />`);
        expect(at).toBeGreaterThan(-1);
        expect(body.slice(at)).toMatch(/^<PhotoSteps[^\n]*\n\n1\. /);
        expect(t.looks[line]).toHaveLength(3);
      });

      it('ends with its own check and one limits box; the life page keeps its three-part block and care line high up', () => {
        expect(body).toContain(`<CheckQuiz line="${line}" />`);
        expect((body.match(/<LimitsBox/g) ?? []).length).toBe(1);
        if (line === 'life') {
          expect(body).toMatch(/<ThreePart[\s\S]*<LimitsBox topic="The life line’s length[^"]*" care \/>/);
          expect(body.indexOf('<CheckQuiz')).toBeGreaterThan(body.indexOf('## Life line vs fate line'));
        } else {
          expect(body.indexOf('<CheckQuiz')).toBeLessThan(body.indexOf('<LimitsBox'));
          expect(body.indexOf('## Check yourself')).toBeLessThan(body.indexOf('<LimitsBox'));
        }
      });

      it('has 2 or 3 questions, one right answer each, an answer for every option', () => {
        const quiz = t.lineQuiz[line];
        expect(quiz.length).toBeGreaterThanOrEqual(2);
        expect(quiz.length).toBeLessThanOrEqual(3);
        for (const item of quiz) {
          expect(item.options.filter((o) => o.ok), item.q).toHaveLength(1);
          for (const option of item.options) expect(option.fb.trim().length, option.text).toBeGreaterThan(10);
          if (item.crop) expect(scan.lines.map((tr) => tr.line)).toContain(item.crop);
        }
      });
    });
  }

  it('draws the finger guides from the scanner’s base-knuckle landmarks, down each finger’s own axis', () => {
    const guides = fingerGuides(scan);
    expect(guides.map((g) => g.finger)).toEqual([1, 2, 3, 4]);
    for (const [i, g] of guides.entries()) {
      const base = scan.landmarks![[5, 9, 13, 17][i]!]!;
      const joint = scan.landmarks![[6, 10, 14, 18][i]!]!;
      expect(Math.hypot(g.from[0] - base[0], g.from[1] - base[1])).toBeLessThanOrEqual(0.71);
      expect((g.to[0] - g.from[0]) * (base[0] - joint[0]) + (g.to[1] - g.from[1]) * (base[1] - joint[1])).toBeGreaterThan(0);
      expect(g.to[1]).toBeGreaterThan(g.from[1]);
      expect(inside({ x: Math.min(g.from[0], g.to[0]), y: Math.min(g.from[1], g.to[1]), w: Math.abs(g.to[0] - g.from[0]), h: Math.abs(g.to[1] - g.from[1]) })).toBe(true);
    }
    const hero = read(`${COMPONENTS}/TracedPalm.astro`);
    expect(hero).toMatch(/<line x1=\{guide\.from\[0\]\} y1=\{guide\.from\[1\]\} x2=\{guide\.to\[0\]\} y2=\{guide\.to\[1\]\} \/>/);
  });

  it('starts each line where the books say: heart at the little-finger edge, head and life by the thumb, fate at the wrist end', () => {
    const lm = scan.landmarks!;
    const heart = lineEnds(scan, 'heart')!;
    // Heart: its first point is nearer the little finger's base (landmark 17) than its last point (either hand).
    expect(Math.hypot(heart.start[0] - lm[17]![0], heart.start[1] - lm[17]![1])).toBeLessThan(Math.hypot(heart.end[0] - lm[17]![0], heart.end[1] - lm[17]![1]));
    for (const line of ['head', 'life'] as const) {
      const { start, end } = lineEnds(scan, line)!;
      expect(Math.hypot(start[0] - lm[5]![0], start[1] - lm[5]![1])).toBeLessThan(Math.hypot(end[0] - lm[5]![0], end[1] - lm[5]![1]));
    }
    expect(lineEnds(scan, 'fate')!.start[1]).toBeGreaterThan(lineEnds(scan, 'fate')!.end[1]);
  });

  it('never draws a focus line the scanner did not return: the hero says "not clearly seen" instead', () => {
    const raw = structuredClone(scanJson) as unknown as { lines: Record<string, { flagged: boolean }> };
    raw.lines.fate!.flagged = true;
    const parsed = parseGuideScan(raw)!;
    expect(lineEnds(parsed, 'fate')).toBeNull();
    const hero = read(`${COMPONENTS}/TracedPalm.astro`);
    expect(hero).toMatch(/const on = focus && found\.has\(focus\) \? focus : undefined;/);
    expect(hero).toMatch(/\{missed && /);
  });

  it('says the photo is real and the dotted lines are guides, in the hero and every new photo block', () => {
    for (const line of GUIDE_LINES) expect(t.focusAlt[line]).toMatch(/^A real photo/);
    expect(t.focusNote('heart line')).toMatch(/^Dotted lines are finger guides, not palm lines\./);
    for (const text of [t.looksCaption, t.flowChoice.caption, t.flowChoiceLF.caption, t.heartEnds.caption]) expect(text).toMatch(/real (palm )?photo \(Hanna Pad, Pexels\)/);
    expect(t.anatomyCaption).toMatch(/^AI-made 3D/);
  });

  it('ships every "4 questions" render at every srcset size', () => {
    for (const item of t.anatomy) {
      const img = tile(item.img);
      expect(srcsetFiles(img)).toHaveLength(4);
      for (const src of [img.src, ...srcsetFiles(img)]) expect(existsSync(join(ROOT, 'public', src)), src).toBe(true);
    }
  });

  it('no arrows, middle dots or emoji in the new line-guide words', () => {
    const text = JSON.stringify({ ...t, focusNote: t.focusNote('x'), looksAlt: { ...t.looksAlt, line: t.looksAlt.line('x') } });
    expect(text).not.toMatch(/→| · |\p{Extended_Pictographic}/u);
  });
});
