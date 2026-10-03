/**
 * The palm every tool draws on: the home hero's porcelain 3D hand
 * (public/models/hero-hand/hand-v1.glb) rendered straight on as a RIGHT palm,
 * as you see your own (thumb on the right, little finger on the left), by
 * research-tools/tool-hand-render.mjs → public/media/tools/ (list in
 * public/media/README.md).
 *
 * All coordinates are in the "palm frame": the base render's own pixels at
 * 1000 × 1300. The base lines follow the creases the model was sculpted with
 * (traced on the render before they were smoothed out of the image), so every
 * line a tool shows is drawn here, in the site's line colours, and nothing in
 * the picture contradicts it.
 *
 * Anatomy on this render (frame units): finger-base centres — little 212,640;
 * ring 330,575; middle 475,543; index 625,550. Valleys between fingers —
 * 255,605 / 400,548 / 550,538; thumb web 700,770. Wrist crease y ≈ 1088.
 */

export const FRAME = { width: 1000, height: 1300 } as const;
export const PALM_VIEWBOX = `0 0 ${FRAME.width} ${FRAME.height}`;

/** The base render. The 800 px file serves the small cropped thumbnails; the 1000 px one the big figures. */
export const HAND_IMAGE = { small: '/media/tools/hand-right-800.webp', large: '/media/tools/hand-right-1000.webp' } as const;
/** The small plate in the upload wells (and the left hand, mirrored, for the compare tool). */
export const HAND_PLATE = { right: '/media/tools/hand-right-192', left: '/media/tools/hand-left-192', width: 192, height: 250 } as const;

export type LineName = 'life' | 'head' | 'heart' | 'fate';

export const LINE_ORDER: readonly LineName[] = ['heart', 'head', 'life', 'fate'];

/**
 * The four lines as the tools draw them by default. Heart: from the little-
 * finger edge, highest, rising to end between the index and middle fingers.
 * Head: from the edge between thumb and index, below the heart line, sloping
 * gently across. Life: joined to the head line at its start, arcing round the
 * ball of the thumb (Mount of Venus) to the wrist. Fate: from the wrist up the
 * middle of the palm to the heart line, under the middle finger.
 */
export const LINE_PATHS: Record<LineName, string> = {
  heart: 'M185 762 C 260 752, 330 740, 390 708 C 430 686, 470 652, 520 626',
  head: 'M668 662 C 600 672, 540 700, 480 742 C 430 776, 370 815, 320 852',
  life: 'M662 670 C 600 700, 530 740, 505 805 C 482 865, 474 940, 486 1005 C 494 1045, 500 1065, 508 1085',
  fate: 'M445 1078 C 450 960, 460 800, 468 650',
};

export type MountId = 'jupiter' | 'saturn' | 'sun' | 'mercury' | 'venus' | 'moon' | 'mars-thumb' | 'mars-outer';

export const MOUNT_ORDER: readonly MountId[] = ['jupiter', 'saturn', 'sun', 'mercury', 'venus', 'moon', 'mars-thumb', 'mars-outer'];

/** Mount areas as ellipses (cx, cy, rx, ry), placed where the app's vision prompt defines each zone. */
export const MOUNT_AREAS: Record<MountId, { cx: number; cy: number; rx: number; ry: number }> = {
  jupiter: { cx: 622, cy: 606, rx: 56, ry: 46 },
  saturn: { cx: 476, cy: 590, rx: 56, ry: 42 },
  sun: { cx: 335, cy: 618, rx: 54, ry: 44 },
  mercury: { cx: 214, cy: 676, rx: 42, ry: 48 },
  venus: { cx: 628, cy: 930, rx: 100, ry: 122 },
  moon: { cx: 295, cy: 985, rx: 72, ry: 98 },
  'mars-thumb': { cx: 640, cy: 758, rx: 46, ry: 34 },
  'mars-outer': { cx: 222, cy: 830, rx: 32, ry: 48 },
};

/** The part of the frame the palm map and the quiz show (the fingertips run off the top, softly). */
export const MAP_VIEWBOX = '110 150 800 970';

/** Where each line's tap target sits on the map (on the line; spaced ≥ 13.5% of the map width, about 48 px on a phone). */
export const LINE_PINS: Record<LineName, { x: number; y: number }> = {
  heart: { x: 320, y: 739 },
  head: { x: 440, y: 769 },
  life: { x: 494, y: 1040 },
  fate: { x: 452, y: 880 },
};

/** A point in the frame as a percentage of the map's view, for HTML buttons laid over it. */
export function toPercent(x: number, y: number, view: string = MAP_VIEWBOX): { left: number; top: number } {
  const [minX, minY, width, height] = view.split(' ').map(Number) as [number, number, number, number];
  return {
    left: Math.round(((x - minX) / width) * 1000) / 10,
    top: Math.round(((y - minY) / height) * 1000) / 10,
  };
}

/* ---------- picker thumbnails ---------- */

/** One drawn line of a thumbnail. `ref` = a faint reference line (e.g. the life line when the question is where the head line starts). */
export interface ThumbPath {
  d: string;
  line: LineName;
  style?: 'thick' | 'thin' | 'chain' | 'ref';
}

/** A glyph on the 24-unit grid placed on the palm (palm signs): centre, drawn width in frame units, rotation in degrees. */
export interface PlacedGlyph {
  d: string;
  x: number;
  y: number;
  size: number;
  rotate?: number;
}

/** A measuring bar on a hand-type picture (gold = the part being asked about). */
export interface MeasureBar {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  tone: 'gold' | 'soft';
}

export type HandPicture = 'base' | 'palm-square' | 'palm-long' | 'fingers-short' | 'fingers-long';

/** Everything one thumbnail shows: which picture, the crop, the lines, and a faint marker at the point that matters. */
export interface PalmFigure {
  view: string;
  picture?: HandPicture;
  paths?: readonly ThumbPath[];
  mark?: { x: number; y: number };
  /** A faint dotted plumb line from the marked point up to the finger it sits under. */
  guide?: { x1: number; y1: number; x2: number; y2: number };
  glyph?: PlacedGlyph;
  bars?: readonly MeasureBar[];
}

/** The hand-type pictures share the frame, moved up 45 units (the long palm and long fingers need the room). */
export const PICTURE: Record<Exclude<HandPicture, 'base'>, { src: string; y: number }> = {
  'palm-square': { src: '/media/tools/palm-square-480', y: -45 },
  'palm-long': { src: '/media/tools/palm-long-480', y: -45 },
  'fingers-short': { src: '/media/tools/fingers-short-480', y: -45 },
  'fingers-long': { src: '/media/tools/fingers-long-480', y: -45 },
};
export const PICTURE_SIZE = { width: 480, height: 624 } as const;

/** Each finder zooms on the part of the palm its line runs through (the finger bases stay in view to show "under which finger"). */
export const THUMB_VIEW: Record<LineName, string> = {
  heart: '140 420 580 400',
  head: '150 500 680 520',
  life: '300 440 540 680',
  fate: '170 520 590 590',
};

const P = LINE_PATHS;
/** Taller crops for "under which finger?" questions, so enough of each finger shows to tell them apart. */
const FINGER_VIEW: Record<LineName, string> = {
  heart: '150 330 560 470',
  head: '150 330 680 690',
  life: '300 380 540 740',
  fate: '150 330 590 780',
};
/** Finger centre lines a little above the palm, where the plumb lines end. */
const FINGER_TOP = { index: { x: 634, y: 440 }, between: { x: 551, y: 476 }, middle: { x: 472, y: 440 }, ring: { x: 322, y: 440 }, little: { x: 186, y: 500 } } as const;
type Variant = Omit<PalmFigure, 'view'> & { view?: string };
/** A variant that ends (or starts) under a finger: taller crop, marker and plumb line. */
const under = (line: LineName, d: string, x: number, y: number, finger: keyof typeof FINGER_TOP, extra: readonly ThumbPath[] = []): Variant => ({
  view: FINGER_VIEW[line],
  paths: [...extra, { d, line }],
  mark: { x, y },
  guide: { x1: x, y1: y - 24, x2: FINGER_TOP[finger].x, y2: FINGER_TOP[finger].y },
});
const at = (x: number, y: number) => ({ x, y });
const one = (line: LineName, d: string, mark?: { x: number; y: number }, style?: ThumbPath['style']): Variant => ({
  paths: [{ d, line, ...(style ? { style } : {}) }],
  ...(mark ? { mark } : {}),
});
const LIFE_REF: ThumbPath = { d: P.life, line: 'life', style: 'ref' };

/**
 * Every option of the four line finders (src/lib/tools/lines/*.ts), keyed by
 * question id → option value. Only the drawing lives here; the questions,
 * labels and rules stay in the finder files.
 */
const VARIANTS: Record<LineName, Record<string, Record<string, Variant>>> = {
  heart: {
    end: {
      index: under('heart', 'M185 762 C 260 752, 330 740, 390 708 C 460 672, 550 640, 632 600', 632, 600, 'index'),
      between: under('heart', 'M185 762 C 260 752, 330 740, 390 708 C 440 682, 500 640, 548 606', 548, 606, 'between'),
      middle: under('heart', 'M185 762 C 260 752, 330 740, 390 708 C 430 690, 466 660, 478 606', 478, 606, 'middle'),
    },
    length: {
      long: one('heart', 'M185 762 C 260 752, 330 740, 390 708 C 470 666, 570 632, 660 612', at(660, 612)),
      short: one('heart', 'M185 762 C 240 756, 320 742, 385 711', at(385, 711)),
    },
    depth: { deep: one('heart', P.heart, undefined, 'thick'), faint: one('heart', P.heart, undefined, 'thin') },
    continuity: {
      unbroken: one('heart', P.heart),
      broken: {
        paths: [
          { d: 'M185 762 C 235 756, 285 748, 330 738', line: 'heart' },
          { d: 'M372 718 C 410 697, 470 652, 520 626', line: 'heart' },
        ],
      },
      chained: one('heart', P.heart, undefined, 'chain'),
    },
    fork: {
      yes: {
        paths: [
          { d: 'M185 762 C 260 752, 330 740, 390 708 C 404 700, 416 692, 428 685', line: 'heart' },
          { d: 'M428 685 C 462 662, 500 636, 540 610', line: 'heart' },
          { d: 'M428 685 C 466 686, 504 690, 546 692', line: 'heart' },
        ],
      },
    },
    branches: {
      yes: {
        paths: [
          { d: P.heart, line: 'heart' },
          { d: 'M290 744 L 300 700', line: 'heart' },
          { d: 'M362 720 L 374 678', line: 'heart' },
          { d: 'M426 685 L 440 645', line: 'heart' },
        ],
      },
    },
  },
  head: {
    curvature: {
      straight: one('head', 'M668 662 C 580 676, 440 700, 240 730'),
      gentle: one('head', P.head),
      curved: one('head', 'M668 662 C 590 676, 470 740, 400 820 C 360 868, 334 925, 322 975'),
    },
    join: {
      joined: { paths: [LIFE_REF, { d: P.head, line: 'head' }], mark: at(665, 666) },
      separate: { paths: [LIFE_REF, { d: 'M662 646 C 598 656, 540 692, 480 738 C 430 774, 370 813, 320 851', line: 'head' }], mark: at(662, 646) },
      wide: { paths: [LIFE_REF, { d: 'M684 604 C 614 626, 540 682, 478 732 C 428 772, 368 812, 318 850', line: 'head' }], mark: at(684, 604) },
      index: { ...under('head', 'M618 574 C 596 630, 540 690, 480 740 C 430 776, 370 815, 320 852', 618, 574, 'index', [LIFE_REF]), view: '150 380 680 640' },
      inside: { paths: [LIFE_REF, { d: 'M690 760 C 630 736, 560 726, 500 738 C 440 760, 375 810, 320 852', line: 'head' }], mark: at(690, 760) },
    },
    length: {
      long: one('head', 'M668 662 C 580 676, 440 740, 360 800 C 300 842, 250 858, 205 866', at(205, 866)),
      short: one('head', 'M668 662 C 610 670, 540 700, 470 748', at(470, 748)),
    },
    end: {
      outer: { ...one('head', 'M668 662 C 560 684, 380 770, 205 830', at(205, 830)), view: FINGER_VIEW.head },
      moon: { ...one('head', 'M668 662 C 590 676, 470 740, 400 820 C 350 876, 305 935, 280 990', at(280, 990)), view: FINGER_VIEW.head },
      middle: under('head', 'M668 662 C 600 670, 520 676, 476 600', 476, 600, 'middle'),
      ring: under('head', 'M668 662 C 560 684, 390 712, 334 618', 334, 618, 'ring'),
      little: under('head', 'M668 662 C 540 692, 290 752, 216 672', 216, 672, 'little'),
    },
    depth: { deep: one('head', P.head, undefined, 'thick'), faint: one('head', P.head, undefined, 'thin') },
    continuity: {
      unbroken: one('head', P.head),
      broken: {
        paths: [
          { d: 'M668 662 C 620 668, 570 690, 530 712', line: 'head' },
          { d: 'M488 736 C 440 770, 380 812, 320 852', line: 'head' },
        ],
      },
      chained: one('head', P.head, undefined, 'chain'),
    },
    fork: {
      yes: {
        paths: [
          { d: 'M668 662 C 600 672, 540 700, 480 742 C 460 755, 440 768, 420 782', line: 'head' },
          { d: 'M420 782 C 385 810, 350 840, 312 872', line: 'head' },
          { d: 'M420 782 C 385 788, 346 790, 304 788', line: 'head' },
        ],
      },
    },
  },
  life: {
    curvature: {
      curved: one('life', 'M662 670 C 560 720, 440 800, 432 905 C 428 975, 458 1045, 480 1088'),
      straight: one('life', 'M662 670 C 630 725, 600 800, 592 880 C 586 950, 588 1020, 594 1082'),
    },
    length: {
      long: one('life', P.life, at(508, 1085)),
      short: one('life', 'M662 670 C 600 700, 530 740, 505 805 C 494 835, 488 862, 486 892', at(486, 892)),
    },
    start: {
      normal: { ...one('life', P.life, at(662, 670)), view: FINGER_VIEW.life },
      index: under('life', 'M622 578 C 596 650, 530 730, 505 805 C 482 865, 474 940, 486 1005 C 494 1045, 500 1065, 508 1085', 622, 578, 'index'),
      low: { ...one('life', 'M700 768 C 640 786, 540 810, 505 862 C 480 910, 478 970, 488 1020 C 495 1052, 502 1070, 508 1085', at(700, 768)), view: FINGER_VIEW.life },
    },
    end: {
      wrist: one('life', P.life, at(508, 1085)),
      moon: one('life', 'M662 670 C 600 700, 530 740, 505 805 C 480 870, 430 960, 360 1040', at(360, 1040)),
    },
    depth: { deep: one('life', P.life, undefined, 'thick'), faint: one('life', P.life, undefined, 'thin') },
    continuity: {
      unbroken: one('life', P.life),
      broken: {
        paths: [
          { d: 'M662 670 C 600 700, 530 740, 505 805 C 498 822, 494 838, 490 855', line: 'life' },
          { d: 'M483 890 C 476 940, 478 975, 486 1005 C 494 1045, 500 1065, 508 1085', line: 'life' },
        ],
      },
      chained: one('life', P.life, undefined, 'chain'),
    },
    fork: {
      yes: {
        paths: [
          { d: 'M662 670 C 600 700, 530 740, 505 805 C 484 860, 476 920, 482 975', line: 'life' },
          { d: 'M482 975 C 470 1015, 450 1050, 428 1086', line: 'life' },
          { d: 'M482 975 C 500 1015, 518 1050, 540 1084', line: 'life' },
        ],
      },
    },
  },
  fate: {
    visible: {
      deep: one('fate', P.fate, undefined, 'thick'),
      clear: one('fate', P.fate),
      faint: one('fate', P.fate, undefined, 'thin'),
      none: { paths: [] },
    },
    start: {
      wrist: one('fate', P.fate, at(445, 1078)),
      middle: one('fate', 'M455 880 C 458 800, 463 720, 468 650', at(455, 880)),
      moon: one('fate', 'M300 1020 C 360 930, 430 800, 468 650', at(300, 1020)),
      venus: { paths: [LIFE_REF, { d: 'M570 1010 C 530 900, 482 780, 468 650', line: 'fate' }], mark: at(570, 1010) },
    },
    end: {
      middle: under('fate', 'M445 1078 C 450 940, 462 760, 474 576', 474, 576, 'middle'),
      index: under('fate', 'M445 1078 C 455 920, 520 740, 612 590', 612, 590, 'index'),
      ring: under('fate', 'M445 1078 C 440 920, 380 740, 336 598', 336, 598, 'ring'),
      little: under('fate', 'M445 1078 C 430 920, 300 770, 222 650', 222, 650, 'little'),
    },
    continuity: {
      unbroken: one('fate', P.fate),
      broken: {
        paths: [
          { d: 'M445 1078 C 447 1010, 450 950, 452 905', line: 'fate' },
          { d: 'M454 860 C 457 790, 462 720, 468 650', line: 'fate' },
        ],
      },
    },
    double: { yes: { paths: [{ d: P.fate, line: 'fate' }, { d: 'M474 1076 C 480 960, 490 800, 498 656', line: 'fate' }] } },
  },
};

/** The thumbnail for one finder option, or undefined when that option has none (plain text answers such as "No fork"). */
export function lineThumb(line: LineName, question: string, value: string): PalmFigure | undefined {
  const variant = VARIANTS[line][question]?.[value];
  return variant ? { ...variant, view: variant.view ?? THUMB_VIEW[line] } : undefined;
}

/** For tests: every drawn option, so each can be checked against the finder data. */
export function lineThumbKeys(line: LineName): { question: string; value: string }[] {
  return Object.entries(VARIANTS[line]).flatMap(([question, options]) => Object.keys(options).map((value) => ({ question, value })));
}

/* ---------- hand-type pictures (palm shape, finger length) ---------- */

const TYPE_VIEW = '0 -45 1000 1300';
/** Palm length is read from the middle-finger base (y 543) to the wrist crease; width just under the fingers (y 650). */
export const HAND_TYPE_FIGURES: Record<'palm-square' | 'palm-long' | 'fingers-short' | 'fingers-long', PalmFigure> = {
  'palm-square': {
    view: TYPE_VIEW,
    picture: 'palm-square',
    bars: [
      { x1: 157, y1: 650, x2: 687, y2: 650, tone: 'gold' },
      { x1: 430, y1: 548, x2: 430, y2: 1055, tone: 'gold' },
    ],
  },
  'palm-long': {
    view: TYPE_VIEW,
    picture: 'palm-long',
    bars: [
      { x1: 203, y1: 650, x2: 643, y2: 650, tone: 'gold' },
      { x1: 430, y1: 548, x2: 430, y2: 1197, tone: 'gold' },
    ],
  },
  'fingers-short': {
    view: TYPE_VIEW,
    picture: 'fingers-short',
    bars: [
      { x1: 472, y1: 186, x2: 472, y2: 536, tone: 'gold' },
      { x1: 472, y1: 552, x2: 472, y2: 1088, tone: 'soft' },
    ],
  },
  'fingers-long': {
    view: TYPE_VIEW,
    picture: 'fingers-long',
    bars: [
      { x1: 472, y1: -22, x2: 472, y2: 536, tone: 'gold' },
      { x1: 472, y1: 552, x2: 472, y2: 1088, tone: 'soft' },
    ],
  },
};

/* ---------- palm signs (drawn where the books place them) ---------- */

/**
 * Where each sign of the signs checker is drawn (src/lib/tools/signs.ts
 * "where"): the M is the four lines themselves; the mystic cross stands
 * between the heart and head lines under the middle finger; the star and the
 * triangle on mounts (Jupiter under the index finger, Venus at the thumb); the
 * fish near the base of the palm above the wrist; the trident on the Mount of
 * the Sun; the island as a loop in the head line.
 */
export const SIGN_SPOTS: Record<string, { view: string; paths?: readonly ThumbPath[]; x?: number; y?: number; size?: number; rotate?: number }> = {
  m: {
    view: '150 520 600 600',
    paths: LINE_ORDER.map((line) => ({ d: P[line], line })),
  },
  'mystic-cross': {
    view: '300 560 340 290',
    paths: [
      { d: P.heart, line: 'heart', style: 'ref' },
      { d: P.head, line: 'head', style: 'ref' },
    ],
    x: 470,
    y: 708,
    size: 78,
  },
  star: { view: '440 430 400 350', x: 622, y: 612, size: 92 },
  triangle: { view: '450 760 400 350', paths: [LIFE_REF], x: 632, y: 925, size: 92 },
  fish: { view: '240 860 400 350', paths: [LIFE_REF], x: 410, y: 1025, size: 122 },
  trident: { view: '150 430 400 350', x: 335, y: 614, size: 92 },
  island: { view: '280 590 400 350', paths: [{ d: P.head, line: 'head' }], x: 452, y: 762, size: 110, rotate: -33 },
};

/** The thumbnail for one palm sign: `glyph` is the sign's own 24-unit outline (signs.ts). */
export function signThumb(id: string, glyph: string): PalmFigure | undefined {
  const spot = SIGN_SPOTS[id];
  if (!spot) return undefined;
  return {
    view: spot.view,
    ...(spot.paths ? { paths: spot.paths } : {}),
    ...(spot.x !== undefined && spot.y !== undefined && spot.size ? { glyph: { d: glyph, x: spot.x, y: spot.y, size: spot.size, ...(spot.rotate ? { rotate: spot.rotate } : {}) } } : {}),
  };
}
