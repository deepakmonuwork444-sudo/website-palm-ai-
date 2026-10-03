import type { ToolGlyph } from './registry';

/**
 * The 3D glass-and-gold icon (public/media/icons/, MediaIcon.astro) that stands
 * for each tool wherever a tool is shown: the tool page's title tile, the
 * "Other free tools" rail and the /tools/ hub. The line tools keep their
 * line's colour (the icons carry the site's line colours).
 */
export type ToolIconName =
  | 'camera' | 'palm-lines' | 'heart-line' | 'head-line' | 'life-line' | 'fate-line'
  | 'hand-shape' | 'signs' | 'map' | 'fingers' | 'hands-compare' | 'question';

export const TOOL_ICON: Record<ToolGlyph, ToolIconName> = {
  photo: 'camera',
  trace: 'palm-lines',
  heart: 'heart-line',
  head: 'head-line',
  life: 'life-line',
  fate: 'fate-line',
  hands: 'hand-shape',
  shape: 'hand-shape',
  signs: 'signs',
  map: 'map',
  fingers: 'fingers',
  compare: 'hands-compare',
  quiz: 'question',
};
