/**
 * The 3D gold-and-ivory icon (public/images/icons3d/, MediaIcon.astro) for each guide, used on
 * related-guide cards. Each palm line has its own icon: that line in gold on the palm medallion.
 */
export type GuideIconName =
  | 'heart-line' | 'head-line' | 'life-line' | 'fate-line' | 'sun-line' | 'mercury-line' | 'marriage-line' | 'all-lines'
  | 'palm' | 'quiz' | 'book' | 'hand-shape' | 'fingers' | 'signs' | 'palm-map' | 'which-hand' | 'career';

const BY_SLUG: Record<string, GuideIconName> = {
  'heart-line': 'heart-line',
  'head-line': 'head-line',
  'head-line-double': 'head-line',
  'life-line': 'life-line',
  'life-line-broken': 'life-line',
  'fate-line': 'fate-line',
  'money-line': 'fate-line',
  'sun-line': 'sun-line',
  'mercury-line': 'mercury-line',
  'marriage-line': 'marriage-line',
  'children-line': 'marriage-line',
  'simian-line': 'all-lines',
  'palmistry-m': 'all-lines',
  'hand-lines': 'all-lines',
  'palm-reading': 'palm',
  'is-palmistry-real': 'quiz',
  'history-of-palmistry': 'book',
  'hand-types': 'hand-shape',
  'palmistry-fingers': 'fingers',
  'lucky-signs': 'signs',
  'palm-crosses': 'signs',
  'palm-mounts': 'palm-map',
  'which-hand-to-read': 'which-hand',
  'career-palmistry': 'career',
};

/** Icon for a guide path such as "/heart-line/" or "/hi/heart-line/". */
export function guideIcon(path: string, line?: 'heart' | 'head' | 'life' | 'fate'): GuideIconName {
  const slug = path.split('/').filter(Boolean).pop() ?? '';
  return BY_SLUG[slug] ?? (line ? `${line}-line` : 'book');
}
