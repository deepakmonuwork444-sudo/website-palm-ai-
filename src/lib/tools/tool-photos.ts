import type { ToolId } from './registry';

/**
 * The REAL image that stands for each tool on cards (owner, 2026-10-05: "tools must show a real
 * result from a real hand, never cheap icons"). Files: public/images/tool-cards/ (sources, the tool
 * run behind each result and the photo credits are in its README.md).
 *  - result: the tool's own output (photo + what the hand model measured), captured by running the
 *    site's tool on a licensed photo. Used edge-to-edge on the home and /tools/ cards.
 *  - square: a crop for small tiles (tool page title, "Other free tools", guide tool cards, hub rows).
 *    The line tools use a Living palm hand with its REAL scanner line(s) drawn on it.
 */
export interface ToolImage {
  /** File stem under /images/tool-cards/ (`<name>-<width>.avif|webp`). */
  name: string;
  widths: readonly number[];
  /** Intrinsic size of the largest file (for width/height, so nothing shifts while it loads). */
  width: number;
  height: number;
}

export interface ToolPhotoSet {
  /** True when the image is the tool's own result on a real photo. */
  result: boolean;
  /** Large card image (only the tools whose card shows a big image). */
  card?: ToolImage;
  square: ToolImage;
  alt: string;
  /** Hindi alt text, for the cards the Hindi home page shows. */
  altHi?: string;
}

export const TOOL_IMAGE_DIR = '/images/tool-cards/';

const sq = (name: string, widths: readonly number[] = [160, 320]): ToolImage => ({ name: `${name}-sq`, widths, width: 320, height: 320 });

export const TOOL_PHOTOS: Record<ToolId, ToolPhotoSet> = {
  'hand-type': {
    result: true,
    card: { name: 'hand-shape', widths: [480, 720, 960, 1200], width: 1200, height: 1500 },
    square: sq('hand-shape'),
    alt: 'Real result of the hand type tool on a real palm photo: palm length, palm width and middle finger measured on the hand',
    altHi: 'हैंड टाइप टूल का असली नतीजा, असली हथेली की फ़ोटो पर: हथेली की लंबाई, चौड़ाई और बीच की उंगली नापी गई',
  },
  'finger-reader': {
    result: true,
    card: { name: 'fingers', widths: [480, 720, 960, 1200], width: 1200, height: 1500 },
    square: sq('fingers'),
    alt: 'Real result of the finger reader on a real palm photo: index and ring fingers and the thumb angle marked on the hand',
    altHi: 'फ़िंगर रीडर का असली नतीजा, असली हथेली की फ़ोटो पर: तर्जनी, अनामिका और अंगूठे का कोण',
  },
  'hand-compare': {
    result: true,
    card: { name: 'left-right', widths: [480, 720, 960, 1280], width: 1280, height: 985 },
    square: sq('left-right'),
    alt: 'Real result of the left vs right tool: the joint points the hand model found on a real left and right palm',
    altHi: 'बाएँ और दाएँ हाथ की तुलना का असली नतीजा: असली बाएँ और दाएँ हाथ पर हैंड मॉडल को मिले जोड़ों के बिंदु',
  },
  'photo-checker': {
    result: false,
    card: { name: 'photo-check', widths: [480, 720, 960], width: 960, height: 1200 },
    square: sq('photo-check'),
    alt: 'A real palm photo that passes the checks: bright, sharp, whole hand in the frame',
  },
  'free-reading': { result: false, square: sq('all-lines', [160, 320, 640]), alt: 'A real palm with the heart, head, life and fate lines our scanner found on it' },
  'line-finder': { result: false, square: sq('all-lines', [160, 320, 640]), alt: 'A real palm with the heart, head, life and fate lines our scanner found on it' },
  'heart-finder': { result: false, square: sq('heart-line'), alt: 'A real palm with its heart line, as our scanner found it' },
  'head-finder': { result: false, square: sq('head-line'), alt: 'A real palm with its head line, as our scanner found it' },
  'life-finder': { result: false, square: sq('life-line'), alt: 'A real palm with its life line, as our scanner found it' },
  'fate-finder': { result: false, square: sq('fate-line'), alt: 'A real palm with its fate line, as our scanner found it' },
  'which-hand': { result: false, square: sq('which-hand'), alt: 'A real photo of a left and a right palm side by side' },
  'signs-checker': { result: false, square: sq('signs'), alt: 'A close-up of the small creases of a real palm' },
  'palm-map': { result: false, square: sq('palm-map'), alt: 'A real palm with its main lines, as our scanner found them' },
  'line-quiz': { result: false, square: sq('quiz'), alt: 'A real palm with the heart, head, life and fate lines our scanner found on it' },
};

/** A tool's id from its slug under /tools/ (guide tool cards know only the slug). */
export const TOOL_ID_BY_SLUG: Record<string, ToolId> = {
  'palm-line-finder': 'line-finder',
  'palm-photo-checker': 'photo-checker',
  'heart-line-finder': 'heart-finder',
  'head-line-finder': 'head-finder',
  'life-line-finder': 'life-finder',
  'fate-line-finder': 'fate-finder',
  'hand-type-quiz': 'hand-type',
  'which-hand-quiz': 'which-hand',
  'palm-signs-checker': 'signs-checker',
  'palm-map': 'palm-map',
  'finger-reader': 'finger-reader',
  'left-vs-right-palm': 'hand-compare',
  'palm-reading-quiz': 'line-quiz',
};

/** The small caption under a real tool result. */
export const RESULT_CAPTION = { en: 'Real result on a real palm', hi: 'असली हथेली पर असली नतीजा' } as const;
