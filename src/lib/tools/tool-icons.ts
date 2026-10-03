import type { IconName } from '../icons';
import type { ToolId } from './registry';

/**
 * The icon that stands for each tool wherever a tool is shown: the tool page's
 * title tile, the "Other free tools" rail, the /tools/ hub and the guide tool
 * cards. One icon per tool (src/lib/icons.ts); no two tools share a drawing.
 */
export const TOOL_ICON: Record<ToolId, IconName> = {
  'free-reading': 'reading',
  'hand-type': 'hand-shape',
  'finger-reader': 'fingers',
  'hand-compare': 'hands-compare',
  'photo-checker': 'photo-check',
  'line-finder': 'line-finder',
  'heart-finder': 'line-heart',
  'head-finder': 'line-head',
  'life-finder': 'line-life',
  'fate-finder': 'line-fate',
  'which-hand': 'which-hand',
  'signs-checker': 'signs',
  'palm-map': 'palm-map',
  'line-quiz': 'quiz',
};
