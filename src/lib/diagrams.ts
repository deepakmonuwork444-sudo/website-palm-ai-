/**
 * Our own diagram files (SEMANTIC_SEO_PLAN.md §7.2, §7.4; WEB-FEAT-056; WEB-DEC-051, WEB-DEC-053):
 * labelled drawings rendered to real image files by scripts/make-diagrams.mjs and
 * scripts/make-infographics.mjs into public/img/diagrams/, so Google Images can index them.
 * Glossary diagrams are drawings of the site's own hand geometry, never photos and never AI images;
 * blog infographics (kind 'infographic') may add one licensed real palm photo (Pexels 8058729 by Hanna
 * Pad, Pexels License; design-v4/photo-credits.json) and our own flat outline icons. No AI image in any
 * of them. Our drawings: licence CC BY 4.0 with credit "PalmSays (palmsays.com)" (WEB-DEC-050, owner
 * decision D11); the photo keeps its own licence, said in the caption and in the image.
 *
 * One source for the figure (DiagramFigure.astro), the ImageObject JSON-LD (diagramImageSchema),
 * the image sitemap (<image:image> in the group sitemaps, src/lib/sitemap.ts) and the checks.
 * `pages` = the built pages whose HTML shows the file. A guide that starts showing a diagram adds
 * its path here in the same change (scripts/check-web.mjs fails if a listed page doesn't show it).
 *
 * No runtime imports, so scripts can load this file with Node's type stripping.
 */

export const DIAGRAM_DIR = '/img/diagrams/';

export interface Diagram {
  /** File base name, descriptive (entity + value): public/img/diagrams/<id>.{png,webp,avif}. */
  id: string;
  /** The title written in the image; ImageObject `name`. */
  name: string;
  alt: string;
  caption: string;
  /** Full-size wide file (≥ 1600 px wide). */
  width: number;
  height: number;
  /** The phone layout (<id>-tall.{webp,avif}), shown below 40rem. */
  tall: { width: number; height: number };
  /** The guide it is made for (it may not be built yet). */
  owner: string;
  /** The registry term it shows (src/lib/entities.ts). */
  term: string;
  /** Built pages whose HTML shows it. */
  pages: readonly string[];
  /**
   * 'infographic' = a blog infographic (scripts/make-infographics.mjs): shown on its post only, not in the
   * glossary gallery. It may use the licensed real palm photo (lines on it only from the real scanner's
   * output for that photo); its caption credits the photo. Default: a glossary diagram (a drawing, listed
   * on /palmistry-terms/).
   */
  kind?: 'infographic';
}

export const DIAGRAMS: readonly Diagram[] = [
  // The palm reading chart, split in two simple charts with labels on the lines (owner 2026-10-01; scripts/make-infographics.mjs).
  {
    id: 'four-main-palm-lines-chart',
    name: 'Palm reading chart: the 4 main lines',
    alt: 'Palm reading chart on a drawn palm, each main line labelled on the line itself: the heart line, the top line under the fingers; the head line across the middle of the palm; the life line curving round the thumb; the fate line running up the middle of the palm. Four small palms show each line on its own.',
    caption: 'A labelled drawing, not a real palm: the four main lines, each in its own colour.',
    width: 1800,
    height: 1260,
    tall: { width: 1080, height: 2800 },
    owner: '/hand-lines/',
    term: 'palm-lines',
    pages: ['/hand-lines/', '/palmistry-terms/'],
  },
  {
    id: 'minor-palm-lines-chart',
    name: 'Minor palm lines and where they run',
    alt: 'Nine small drawn palms, each with one minor line in gold and its name: sun line, up towards the ring finger; Mercury line, up towards the little finger; marriage lines, short lines on the edge under the little finger; bracelets, creases across the wrist; girdle of Venus, a curve above the heart line; intuition line, a curve on the outer palm; travel lines, short lines low on the outer edge; line of Mars, just inside the life line; ring of Solomon, round the base of the index finger.',
    caption: 'A labelled drawing, not a real palm. Minor lines vary much more from hand to hand, and many palms have only some of them.',
    width: 1800,
    height: 1300,
    tall: { width: 1080, height: 2680 },
    owner: '/hand-lines/',
    term: 'palm-lines',
    pages: ['/hand-lines/', '/palmistry-terms/'],
  },
  {
    id: 'mounts-of-the-palm-chart',
    name: 'Mounts of the palm: names, Hindi names and where they are',
    alt: 'Chart of the mounts of the palm on a drawn hand: 1 mount of Jupiter under the index finger, 2 Saturn under the middle finger, 3 Sun under the ring finger, 4 Mercury under the little finger, 5 Mars near the thumb, inside the start of the life line, 6 Venus on the ball of the thumb, 7 the Moon on the outer edge above the wrist, 8 Mars on the outer edge, between the heart and head lines, 9 the plain of Mars in the centre; with Hindi names.',
    caption: 'A labelled drawing, not a real palm: the mounts are soft areas, not lines. English and Hindi names (the Hindi names wait for our Hindi reviewer).',
    width: 1800,
    height: 1300,
    tall: { width: 1080, height: 2530 },
    owner: '/palm-mounts/',
    term: 'palm-mounts',
    pages: ['/palm-mounts/', '/palmistry-terms/'],
  },
  {
    id: 'heart-line-start-end-and-types',
    name: 'Heart line: where it starts, where it ends, and its common forms',
    alt: 'Heart line diagram on a drawn palm: it starts on the little-finger edge and ends under the index finger, the middle finger or between them. Six forms side by side: curving up to the index finger, ending under the middle finger, straight across, short, forked at the end, and broken.',
    caption: 'A drawing, not a real palm: where the heart line runs, and six forms the palmistry books describe.',
    width: 1800,
    height: 1250,
    tall: { width: 1080, height: 2440 },
    owner: '/heart-line/',
    term: 'heart-line',
    pages: ['/heart-line/', '/palmistry-terms/'],
  },
  {
    id: 'head-line-start-end-and-types',
    name: 'Head line: where it starts, where it ends, and its common forms',
    alt: 'Head line diagram on a drawn palm: it starts between the thumb and index finger, often joined to the life line, and ends anywhere from the middle of the palm to its outer edge. Six forms side by side: straight, sloping down, long, short, forked at the end, and starting apart from the life line.',
    caption: 'A drawing, not a real palm: where the head line runs, and six forms the palmistry books describe.',
    width: 1800,
    height: 1250,
    tall: { width: 1080, height: 2440 },
    owner: '/head-line/',
    term: 'head-line',
    pages: ['/head-line/', '/palmistry-terms/'],
  },
  {
    id: 'life-line-start-end-and-types',
    name: 'Life line: where it starts, where it ends, and its common forms',
    alt: 'Life line diagram on a drawn palm: it starts between the thumb and index finger and curves around the ball of the thumb towards the wrist. Six forms side by side: a wide curve, close to the thumb, long, short (not a short life), double, and broken.',
    caption: 'A drawing, not a real palm: where the life line runs, and six forms the palmistry books describe. Its length is never read as years.',
    width: 1800,
    height: 1250,
    tall: { width: 1080, height: 2440 },
    owner: '/life-line/',
    term: 'life-line',
    pages: ['/life-line/', '/palmistry-terms/'],
  },
  {
    id: 'fate-line-start-end-and-types',
    name: 'Fate line: where it starts, where it ends, and its common forms',
    alt: 'Fate line diagram on a drawn palm: it starts near the wrist, from the life line or from the mount of the Moon, and runs up towards the middle finger. Six forms side by side: from the wrist, from the life line, from the mount of the Moon, starting in the middle of the palm, broken, and no fate line.',
    caption: 'A drawing, not a real palm: where the fate line runs, and six forms the palmistry books describe. Many palms have no fate line.',
    width: 1800,
    height: 1250,
    tall: { width: 1080, height: 2440 },
    owner: '/fate-line/',
    term: 'fate-line',
    pages: ['/fate-line/', '/palmistry-terms/'],
  },
  {
    id: 'seven-hand-types-chart',
    name: 'Cheiro’s seven hand types, side by side',
    alt: 'Seven drawn hand shapes side by side, from Cheiro’s Palmistry for All (1916): elementary (short, thick palm, short fingers), square (square palm, square fingertips), spatulate (fingertips that widen), philosophic (long hand, knotty joints), conic (rounded, tapering fingers), psychic (long, narrow hand, pointed fingers) and mixed (each finger a different shape).',
    caption: 'Drawings of a type, never a real hand: Cheiro’s seven hand types (Palmistry for All, 1916, Part II, ch. I).',
    width: 1800,
    height: 800,
    tall: { width: 1080, height: 1960 },
    owner: '/hand-types/',
    term: 'hand-shape',
    pages: ['/hand-types/', '/career-palmistry/', '/palmistry-terms/'],
  },
  // Semantic SEO Phase 3 (WEB-FEAT-039/046).
  {
    id: 'm-on-palm-four-lines-chart',
    name: 'The M on the palm: the four lines that form it',
    alt: 'Drawing of the M on the palm: 1 the heart line across the top, 2 the head line across the middle, 3 the life line curving round the thumb, 4 the fate line running up the middle. Two small palms compare a full M, where all four lines meet, with a palm that has no fate line and so no full M.',
    caption: 'A labelled drawing, not a real palm. No classical palmistry book reads an M; the books read the four lines that form it.',
    width: 1800,
    height: 1250,
    tall: { width: 1080, height: 2420 },
    owner: '/palmistry-m/',
    term: 'm-sign',
    pages: ['/palmistry-m/', '/palmistry-terms/'],
  },
  {
    id: 'lucky-signs-on-palm-chart',
    name: 'Lucky signs on the palm: star, triangle, square, fish and trident',
    alt: 'Drawing of five signs on a palm, in gold: 1 a star on the mount under the index finger, 2 a small triangle under the middle finger, 3 a square over a break in the life line, 4 a fish at the base of the palm above the wrist, 5 a trident, three short lines on one stem. Each with its Hindi name.',
    caption: 'A labelled drawing, not a real palm: where the books place each sign. The trident has no fixed place in the books. English and Hindi names (the Hindi names wait for our Hindi reviewer).',
    width: 1800,
    height: 1300,
    tall: { width: 1080, height: 2560 },
    owner: '/lucky-signs/',
    term: 'palm-signs',
    pages: ['/lucky-signs/', '/palmistry-terms/'],
  },
  // Semantic SEO Phase 3, guides B (WEB-FEAT-036/045/058).
  {
    id: 'broken-life-line-types',
    name: 'Broken life line: four kinds of break the books describe',
    alt: 'Four close-up drawings of a broken life line around the base of the thumb: 1 a clean break, a gap with both ends in line; 2 an overlapping break, the second piece starting beside the first; 3 a small square drawn round the gap; 4 a sister line running just inside the life line, across the gap.',
    caption: 'Drawings, not real palms. A break is read as a time of change, never as death, illness or an accident.',
    width: 1800,
    height: 800,
    tall: { width: 1080, height: 1600 },
    owner: '/life-line/broken/',
    term: 'broken-life-line',
    pages: ['/life-line/broken/', '/palmistry-terms/'],
  },
  {
    id: 'mercury-line-path',
    name: 'Mercury line: where it runs on the palm',
    alt: 'Drawing of the Mercury line on a palm, in gold: 1 it starts low on the palm, towards the outer side, 2 it runs up to the mount of Mercury under the little finger, crossing the head and heart lines. Three small palms show a long Mercury line, a short one under the little finger, and none at all.',
    caption: 'A labelled drawing, not a real palm. The Mercury line is not a medical test; many palms have none.',
    width: 1800,
    height: 1060,
    tall: { width: 1080, height: 2080 },
    owner: '/mercury-line/',
    term: 'mercury-line',
    pages: ['/mercury-line/', '/palmistry-terms/'],
  },
  {
    id: 'children-lines-position',
    name: 'Children lines: where the books place them',
    alt: 'Drawing of the outer edge of the palm under the little finger, with a small whole-palm map marking the area: 1 a marriage line running in from the edge, 2 three fine upright lines rising from it, which Cheiro called children lines, 3 the heart line below.',
    caption: 'A labelled drawing, not a real palm. No line can tell whether you will have children, or how many.',
    width: 1800,
    height: 1000,
    tall: { width: 1080, height: 1900 },
    owner: '/children-line/',
    term: 'children-lines',
    pages: ['/children-line/', '/palmistry-terms/'],
  },
  // Blog infographics (owner 2026-10-01; scripts/make-infographics.mjs): 2–3 per post, labels on what they name.
  {
    id: 'rare-palm-lines-at-a-glance',
    name: 'Rare palm lines at a glance',
    alt: 'Six small drawn palms, each with one rare line highlighted and named: simian line, one crease right across the palm, about 1 in 30 people; Sydney line, a head line that runs to the outer edge, 2 to 9 in 100 palms; double head line, two head lines one above the other; girdle of Venus, a curve above the heart line; intuition line, a curve on the outer palm; ring of Solomon, a curve round the index finger. The last four have no count.',
    caption: 'Drawings, not real palms. Only the simian line and the Sydney line have been counted in real hands.',
    width: 1800,
    height: 1720,
    tall: { width: 1080, height: 2630 },
    owner: '/blog/rarest-palm-lines/',
    term: 'palm-lines',
    pages: ['/blog/rarest-palm-lines/'],
    kind: 'infographic',
  },
  {
    id: 'how-rare-palm-lines-numbers',
    name: 'How rare? Only two palm lines have real counts',
    alt: 'Three panels. Simian line: about 1 in 30 people (MedlinePlus), one gold dot among 30. Sydney line: 2 to 9 in 100 palms, depending on the study, on a grid of 100 dots. No reliable count: double head line, no head line, girdle of Venus, intuition line, ring of Solomon, mystic cross and the letter M; books describe them, nobody counted them. A “1 in 1,000” claim with no source is a guess.',
    caption: 'A chart of the published counts. For every other line we found no study and no book that counts it.',
    width: 1800,
    height: 1170,
    tall: { width: 1080, height: 2540 },
    owner: '/blog/rarest-palm-lines/',
    term: 'palm-lines',
    pages: ['/blog/rarest-palm-lines/'],
    kind: 'infographic',
  },
  {
    id: 'palm-lines-form-timeline',
    name: 'When palm lines form, and when they change',
    alt: 'Timeline with a drawn palm at each stage. Weeks 8 to 13 in the womb: the palm creases form. Birth: the heart, head and life lines are already in place. Childhood: the same lines, in the same places. Adult: the major lines stay; fine lines can come and go.',
    caption: 'Drawings, not real palms. Timing from fetal studies (Stevens and colleagues, 1988; Kimura and Kitagawa, 1986).',
    width: 1800,
    height: 1110,
    tall: { width: 1080, height: 2320 },
    owner: '/blog/do-palm-lines-change/',
    term: 'palm-lines',
    pages: ['/blog/do-palm-lines-change/'],
    kind: 'infographic',
  },
  {
    id: 'same-palm-different-photo',
    name: 'Same palm, different photo',
    alt: 'One real palm photo shown four ways: in even daylight the lines show as they are; with side light, shadows look like breaks; at an angle, the lines look squeezed; dim and blurry, fine lines fade and close lines merge. The palm is the same in all four.',
    caption: 'One real palm photo (Hanna Pad, Pexels), edited four ways (light, angle and blur). The hand did not change; only the photo did.',
    width: 1800,
    height: 1030,
    tall: { width: 1080, height: 2110 },
    owner: '/blog/do-palm-lines-change/',
    term: 'palm-lines',
    pages: ['/blog/do-palm-lines-change/'],
    kind: 'infographic',
  },
  {
    id: 'palm-lines-what-changes',
    name: 'What stays, and what can change',
    alt: 'Two panels. Stays for life: the heart, head and life lines, where each line runs, and fingerprint ridges. Can change: how deep or clear a line looks, fine lines and small creases, and bath wrinkles, for a while.',
    caption: 'The table above as a picture.',
    width: 1800,
    height: 850,
    tall: { width: 1080, height: 1650 },
    owner: '/blog/do-palm-lines-change/',
    term: 'palm-lines',
    pages: ['/blog/do-palm-lines-change/'],
    kind: 'infographic',
  },
  {
    id: 'palm-app-five-checks',
    name: '5 checks before you trust a palm app',
    alt: 'Five checks, each with a gold outline icon: the app shows your real lines on your photo; it names its sources; it makes no health or lifespan claims; its prices are on the store listing; and it lets you delete your data.',
    caption: 'Our five checks for any palm reading app.',
    width: 1800,
    height: 860,
    tall: { width: 1080, height: 1890 },
    owner: '/blog/best-palm-reading-apps/',
    term: 'palmistry',
    pages: ['/blog/best-palm-reading-apps/'],
    kind: 'infographic',
  },
  {
    id: 'palm-apps-comparison-matrix',
    name: '6 palm apps on our 5 checks',
    alt: 'Grid of six palm reading apps and PalmSays on five checks. No app’s listing makes clear that it shows your lines on your photo, and Palm Reading & Fortune Teller has no camera scan. No app names its sources. Nebula and Palmist make no health claims; Astroline, Life Palmistry, Palm Reading & Fortune Teller and PalmistryHD do. Nebula and Palmist show prices; Astroline, Palm Reading & Fortune Teller and PalmistryHD only on the App Store; Life Palmistry not at all. Astroline and Nebula let you ask to delete data on Play; Life Palmistry, Palm Reading & Fortune Teller and PalmistryHD say data can’t be deleted; Palmist doesn’t say. PalmSays, our app, meets all five.',
    caption: 'From each store listing on 1 October 2026; listings change. PalmSays is our app.',
    width: 1800,
    height: 1440,
    tall: { width: 1080, height: 2130 },
    owner: '/blog/best-palm-reading-apps/',
    term: 'palmistry',
    pages: ['/blog/best-palm-reading-apps/'],
    kind: 'infographic',
  },
  {
    id: 'chatbot-vs-palm-scanner-flow',
    name: 'One palm photo, two kinds of answer',
    alt: 'Side by side: a real palm photo sent to a chatbot comes back as a description in words, which may include lines that aren’t there. The same photo sent to a palm scanner comes back with the heart, head, life and fate lines traced on the photo, and a line it can’t see clearly is marked.',
    caption: 'A real palm photo (Hanna Pad, Pexels). The coloured lines are the real PalmSays scanner’s output for that photo.',
    width: 1800,
    height: 1300,
    tall: { width: 1080, height: 2140 },
    owner: '/blog/palm-reading-chatgpt-vs-palm-scanner/',
    term: 'palm-lines',
    pages: ['/blog/palm-reading-chatgpt-vs-palm-scanner/'],
    kind: 'infographic',
  },
  {
    id: 'check-any-palm-reading-steps',
    name: 'How to check any palm reading',
    alt: 'Five steps with gold outline icons: 1 ask it to show the line on your photo; 2 ask about a line you don’t have; 3 ask the same question twice; 4 ask which book says that; 5 drop any health or lifespan answer.',
    caption: 'The same five checks work on a chatbot, an app or a person.',
    width: 1800,
    height: 860,
    tall: { width: 1080, height: 1890 },
    owner: '/blog/palm-reading-chatgpt-vs-palm-scanner/',
    term: 'palm-lines',
    pages: ['/blog/palm-reading-chatgpt-vs-palm-scanner/'],
    kind: 'infographic',
  },
];

const BY_ID = new Map(DIAGRAMS.map((item) => [item.id, item]));

export function diagram(id: string): Diagram {
  const found = BY_ID.get(id);
  if (!found) throw new Error(`diagrams: unknown id ${id}`);
  return found;
}

/** The file the page's <img src> uses (1800 px WebP): the image sitemap `<image:loc>` and the ImageObject `contentUrl`. */
export function diagramUrl(item: Diagram): string {
  return `${DIAGRAM_DIR}${item.id}.webp`;
}

/** The full-size PNG (the "download" link). */
export function diagramPng(item: Diagram): string {
  return `${DIAGRAM_DIR}${item.id}.png`;
}

/** Every file a diagram must have in public/img/diagrams/. */
export function diagramFiles(item: Diagram): string[] {
  return ['.png', '.webp', '.avif', '-900.webp', '-900.avif', '-tall.webp', '-tall.avif'].map((end) => `${item.id}${end}`);
}

/** The diagrams a built page shows (image sitemap, JSON-LD). */
export function diagramsOnPage(path: string): Diagram[] {
  return DIAGRAMS.filter((item) => item.pages.includes(path));
}
