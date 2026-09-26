import { site } from '../../config/site';

/**
 * The 12 free tools (owner decision 2026-09-26: every tool has its own page).
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
  | 'line-quiz';

/** What a tool really is: the hub groups by this (DESIGN_SYSTEM.md §7.7). */
export type ToolKind = 'ai' | 'device' | 'traditional';

export type ToolGlyph = 'photo' | 'trace' | 'heart' | 'head' | 'life' | 'fate' | 'hands' | 'shape' | 'signs' | 'map' | 'quiz';

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
  /** Works today on this website. Photo AI tools wait for the server (webReadingEnabled). */
  live: boolean;
  /** "No sign-up" tag, only when true. */
  noSignUp: boolean;
}

const traditionalLine = 'Traditional meanings from classical books — not AI. No photo needed.';

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
  },
  {
    id: 'line-finder',
    num: 2,
    path: '/tools/palm-line-finder/',
    name: 'Palm line finder',
    blurb: 'See your heart, head, life and fate lines traced and named on your photo.',
    kind: 'ai',
    label: 'Uses AI to trace your lines. Shows lines only — no meanings.',
    glyph: 'photo',
    live: site.webReadingEnabled,
    noSignUp: site.webReadingEnabled,
  },
  {
    id: 'photo-checker',
    num: 3,
    path: '/tools/palm-photo-checker/',
    name: 'Palm photo checker',
    blurb: 'Is your palm photo bright, sharp and close enough to read? Checked in seconds.',
    kind: 'device',
    label: 'Runs on your phone — your photo never leaves this device.',
    glyph: 'photo',
    live: true,
    noSignUp: true,
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
  },
  {
    id: 'which-hand',
    num: 8,
    path: '/tools/which-hand-quiz/',
    name: 'Which-hand quiz',
    blurb: 'Three taps to know which hand to read, and why the tradition says so.',
    kind: 'traditional',
    label: 'Based on palmistry tradition — not AI.',
    glyph: 'hands',
    live: true,
    noSignUp: true,
  },
  {
    id: 'hand-type',
    num: 9,
    path: '/tools/hand-type-quiz/',
    name: 'Hand type quiz',
    blurb: 'Earth, air, fire or water? Find your hand type from your palm and fingers.',
    kind: 'traditional',
    label: 'Your measurements, matched to hand types — not AI.',
    glyph: 'shape',
    live: true,
    noSignUp: true,
  },
  {
    id: 'signs-checker',
    num: 10,
    path: '/tools/palm-signs-checker/',
    name: 'Palm signs checker',
    blurb: 'Tick the M, cross, star, fish or triangle you see and read what the books say.',
    kind: 'traditional',
    label: 'You tick what you see; meanings come from classical books — not AI.',
    glyph: 'signs',
    live: true,
    noSignUp: true,
  },
  {
    id: 'palm-map',
    num: 11,
    path: '/tools/palm-map/',
    name: 'Interactive palm map',
    blurb: 'Tap any line or mount to see its name, where it runs and what it is read for.',
    kind: 'traditional',
    label: 'A map of traditional meanings — not AI.',
    glyph: 'map',
    live: true,
    noSignUp: true,
  },
  {
    id: 'line-quiz',
    num: 12,
    path: '/tools/palm-reading-quiz/',
    name: 'Palm reading quiz',
    blurb: '10 quick questions on palm diagrams. Can you tell the heart line from the head line?',
    kind: 'traditional',
    label: 'A quiz on diagrams — no photo needed.',
    glyph: 'quiz',
    live: true,
    noSignUp: true,
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

/** Hub groups in display order (DESIGN_SYSTEM.md §7.7): AI, on your phone, traditional. */
export const KIND_ORDER: readonly ToolKind[] = ['device', 'traditional', 'ai'];

export const KIND_TITLES: Record<ToolKind, string> = {
  ai: 'Uses AI',
  device: 'Runs on your phone',
  traditional: 'Traditional meanings — not AI',
};

/** The Play referrer medium for a tool page: `tool-<id>` (tool-page skill). */
export function toolMedium(id: ToolId): string {
  return `tool-${id}`;
}
