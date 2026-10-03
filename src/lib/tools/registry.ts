import { site } from '../../config/site';

/**
 * The free tools (owner decision 2026-09-26: every tool has its own page;
 * v3 the same day: tools work from the visitor's OWN palm photo first).
 * One place for each tool's URL, name, honesty label and analytics id, so the
 * hub, the tool template, the "other tools" list and the tests cannot drift.
 * Slugs and keywords: KEYWORD_MAP.md §3. Labels: the tool-page skill (exact text).
 */

/** Analytics ids from the planned event list (tool-page skill, plan §13.3). */
export type ToolId =
  | 'free-reading'
  | 'line-finder'
  | 'photo-checker'
  | 'heart-finder'
  | 'head-finder'
  | 'life-finder'
  | 'fate-finder'
  | 'which-hand'
  | 'hand-type'
  | 'signs-checker'
  | 'palm-map'
  | 'line-quiz'
  | 'finger-reader'
  | 'hand-compare';

/**
 * What a tool really is (DESIGN_SYSTEM.md §7.7):
 * - ai: our AI line scanner on the server (the photo is sent);
 * - hand: an AI hand model that runs on the phone (the photo is not sent);
 * - device: plain pixel maths on the phone;
 * - traditional: no photo, meanings from the books.
 */
export type ToolKind = 'ai' | 'hand' | 'device' | 'traditional';

export type ToolGlyph = 'photo' | 'trace' | 'heart' | 'head' | 'life' | 'fate' | 'hands' | 'shape' | 'signs' | 'map' | 'quiz' | 'fingers' | 'compare';

export interface ToolInfo {
  id: ToolId;
  /** Number in KEYWORD_MAP §3. */
  num: number;
  path: string;
  name: string;
  /** One line: what you get. */
  blurb: string;
  kind: ToolKind;
  /** The exact honesty label shown under the H1 and on the hub card. */
  label: string;
  glyph: ToolGlyph;
  /** Works today on this website. Server AI tools wait for the server. */
  live: boolean;
  /** "No sign-up" tag, only when true. */
  noSignUp: boolean;
  /** Works from the visitor's own palm photo: the hub leads with these. */
  photo: boolean;
}

/**
 * The server's lines-only scan (WEB-SRV-004 `lines_only` + `web_scan` cap,
 * plan D19: no free reading used) is not built yet. Until it is, the line
 * finder and the line half of left-vs-right stay "opens soon" even when the
 * web reading goes live; previews test them in mock mode (?reading=mock).
 */
export const LINES_ONLY_SERVER = false;
export const LINE_SCAN_LIVE = site.webReadingEnabled && LINES_ONLY_SERVER;

const traditionalLine = 'Traditional meanings from classical books, not AI. No photo needed.';
/** Exact label for the on-device hand-model tools (the model is AI, so the label says so). */
export const HAND_MODEL_LABEL = 'Finds your hand with an AI model that runs on your phone. Your photo never leaves this device.';

export const TOOLS: readonly ToolInfo[] = [
  {
    id: 'free-reading',
    num: 1,
    path: '/',
    name: 'Free AI palm reading',
    blurb: 'Your own lines traced on your photo, with what palmistry says about each one.',
    kind: 'ai',
    label: 'Uses AI to trace your lines. Meanings come from classical palmistry books, not from AI.',
    glyph: 'trace',
    live: site.webReadingEnabled,
    noSignUp: site.webReadingEnabled,
    photo: true,
  },
  {
    id: 'hand-type',
    num: 9,
    path: '/tools/hand-type-quiz/',
    name: 'Hand type from your photo',
    blurb: 'Your palm and fingers measured on your own photo: earth, air, fire or water hand.',
    kind: 'hand',
    label: HAND_MODEL_LABEL,
    glyph: 'shape',
    live: true,
    noSignUp: true,
    photo: true,
  },
  {
    id: 'finger-reader',
    num: 13,
    path: '/tools/finger-reader/',
    name: 'Finger reader',
    blurb: 'Index vs ring finger, your thumb’s angle and the gaps between your fingers, measured on your photo.',
    kind: 'hand',
    label: HAND_MODEL_LABEL,
    glyph: 'fingers',
    live: true,
    noSignUp: true,
    photo: true,
  },
  {
    id: 'hand-compare',
    num: 14,
    path: '/tools/left-vs-right-palm/',
    name: 'Left vs right hand',
    blurb: 'One photo of each hand: see where your two hands differ in shape, fingers and thumb.',
    kind: 'hand',
    label: LINE_SCAN_LIVE
      ? 'Measures both hands with an AI model on your phone. Tracing their lines uses our AI scanner, which receives the photos.'
      : HAND_MODEL_LABEL,
    glyph: 'compare',
    live: true,
    noSignUp: true,
    photo: true,
  },
  {
    id: 'photo-checker',
    num: 3,
    path: '/tools/palm-photo-checker/',
    name: 'Palm photo checker',
    blurb: 'Is your photo bright, sharp and close enough? Checked in seconds, then use it in the photo tools.',
    kind: 'device',
    label: 'Runs on your phone: your photo never leaves this device.',
    glyph: 'photo',
    live: true,
    noSignUp: true,
    photo: true,
  },
  {
    id: 'line-finder',
    num: 2,
    path: '/tools/palm-line-finder/',
    name: 'Palm line finder',
    blurb: 'See your heart, head, life and fate lines traced and named on your photo.',
    kind: 'ai',
    label: 'Uses AI to trace your lines. Shows lines only, no meanings.',
    glyph: 'trace',
    live: LINE_SCAN_LIVE,
    noSignUp: LINE_SCAN_LIVE,
    photo: true,
  },
  {
    id: 'heart-finder',
    num: 4,
    path: '/tools/heart-line-finder/',
    name: 'Heart line finder',
    blurb: 'Pick your heart line’s shape and see what the books say about it.',
    kind: 'traditional',
    label: traditionalLine,
    glyph: 'heart',
    live: true,
    noSignUp: true,
    photo: false,
  },
  {
    id: 'head-finder',
    num: 5,
    path: '/tools/head-line-finder/',
    name: 'Head line finder',
    blurb: 'Straight, sloping, forked or joined? Match your head line to its reading.',
    kind: 'traditional',
    label: traditionalLine,
    glyph: 'head',
    live: true,
    noSignUp: true,
    photo: false,
  },
  {
    id: 'life-finder',
    num: 6,
    path: '/tools/life-line-finder/',
    name: 'Life line finder',
    blurb: 'Match your life line’s curve and marks. Length is never read as lifespan.',
    kind: 'traditional',
    label: traditionalLine,
    glyph: 'life',
    live: true,
    noSignUp: true,
    photo: false,
  },
  {
    id: 'fate-finder',
    num: 7,
    path: '/tools/fate-line-finder/',
    name: 'Fate line finder',
    blurb: 'No fate line, a faint one or a break? See what each form means in the books.',
    kind: 'traditional',
    label: traditionalLine,
    glyph: 'fate',
    live: true,
    noSignUp: true,
    photo: false,
  },
  {
    id: 'which-hand',
    num: 8,
    path: '/tools/which-hand-quiz/',
    name: 'Which-hand quiz',
    blurb: 'Three taps to know which hand to read, and why the tradition says so.',
    kind: 'traditional',
    label: 'Based on palmistry tradition, not AI.',
    glyph: 'hands',
    live: true,
    noSignUp: true,
    photo: false,
  },
  {
    id: 'signs-checker',
    num: 10,
    path: '/tools/palm-signs-checker/',
    name: 'Palm signs checker',
    blurb: 'Tick the M, cross, star, fish or triangle you see and read what the books say.',
    kind: 'traditional',
    label: 'You tick what you see; meanings come from classical books, not AI.',
    glyph: 'signs',
    live: true,
    noSignUp: true,
    photo: false,
  },
  {
    id: 'palm-map',
    num: 11,
    path: '/tools/palm-map/',
    name: 'Interactive palm map',
    blurb: 'Tap any line or mount to see its name, where it runs and what it is read for.',
    kind: 'traditional',
    label: 'A map of traditional meanings, not AI.',
    glyph: 'map',
    live: true,
    noSignUp: true,
    photo: false,
  },
  {
    id: 'line-quiz',
    num: 12,
    path: '/tools/palm-reading-quiz/',
    name: 'Palm reading quiz',
    blurb: '10 quick questions on palm diagrams. Can you tell the heart line from the head line?',
    kind: 'traditional',
    label: 'A quiz on diagrams, with no photo needed.',
    glyph: 'quiz',
    live: true,
    noSignUp: true,
    photo: false,
  },
];

export function toolById(id: ToolId): ToolInfo {
  const tool = TOOLS.find((item) => item.id === id);
  if (!tool) throw new Error(`Unknown tool ${id}`);
  return tool;
}

/** The other tools, for the list at the end of a tool page (the current one left out). */
export function otherTools(id: ToolId): ToolInfo[] {
  return TOOLS.filter((tool) => tool.id !== id);
}

/** Hub groups in display order: photo tools first, then the meaning tools. */
export const KIND_ORDER: readonly ToolKind[] = ['hand', 'device', 'ai', 'traditional'];

export const KIND_TITLES: Record<ToolKind, string> = {
  ai: 'Uses our AI scanner',
  hand: 'Measured on your phone',
  device: 'Runs on your phone',
  traditional: 'Traditional meanings, not AI',
};

/** The Play referrer medium for a tool page: `tool-<id>` (tool-page skill). */
export function toolMedium(id: ToolId): string {
  return `tool-${id}`;
}
