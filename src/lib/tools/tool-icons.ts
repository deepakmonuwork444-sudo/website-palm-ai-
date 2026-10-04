import type { ToolGlyph, ToolId } from './registry';

/**
 * The 3D gold-and-ivory icon (public/images/icons3d/, MediaIcon.astro) that stands for each tool
 * wherever a tool is shown: the tool page's title tile, the "Other free tools" rail and the /tools/
 * hub. Every tool has its own icon; the line finders show their own line on the palm medallion.
 */
export type ToolIconName =
  | 'scan' | 'all-lines' | 'photo-check' | 'heart-line' | 'head-line' | 'life-line' | 'fate-line'
  | 'hand-shape' | 'which-hand' | 'signs' | 'palm-map' | 'fingers' | 'compare-hands' | 'quiz';

export const TOOL_ICON_BY_ID: Record<ToolId, ToolIconName> = {
  'free-reading': 'scan',
  'line-finder': 'all-lines',
  'photo-checker': 'photo-check',
  'heart-finder': 'heart-line',
  'head-finder': 'head-line',
  'life-finder': 'life-line',
  'fate-finder': 'fate-line',
  'hand-type': 'hand-shape',
  'which-hand': 'which-hand',
  'signs-checker': 'signs',
  'palm-map': 'palm-map',
  'finger-reader': 'fingers',
  'hand-compare': 'compare-hands',
  'line-quiz': 'quiz',
};

/** By glyph, for callers that only know the glyph ('trace' is shared, so it maps to the line finder). */
export const TOOL_ICON: Record<ToolGlyph, ToolIconName> = {
  photo: 'photo-check',
  trace: 'all-lines',
  heart: 'heart-line',
  head: 'head-line',
  life: 'life-line',
  fate: 'fate-line',
  hands: 'which-hand',
  shape: 'hand-shape',
  signs: 'signs',
  map: 'palm-map',
  fingers: 'fingers',
  compare: 'compare-hands',
  quiz: 'quiz',
};

export const toolIcon = (tool: { id: ToolId; glyph: ToolGlyph }): ToolIconName => TOOL_ICON_BY_ID[tool.id] ?? TOOL_ICON[tool.glyph];

/** A tool's icon from its slug under /tools/ (guide tool cards know only the slug). */
export const TOOL_ICON_BY_SLUG: Record<string, ToolIconName> = {
  'palm-line-finder': 'all-lines',
  'palm-photo-checker': 'photo-check',
  'heart-line-finder': 'heart-line',
  'head-line-finder': 'head-line',
  'life-line-finder': 'life-line',
  'fate-line-finder': 'fate-line',
  'hand-type-quiz': 'hand-shape',
  'which-hand-quiz': 'which-hand',
  'palm-signs-checker': 'signs',
  'palm-map': 'palm-map',
  'finger-reader': 'fingers',
  'left-vs-right-palm': 'compare-hands',
  'palm-reading-quiz': 'quiz',
};
