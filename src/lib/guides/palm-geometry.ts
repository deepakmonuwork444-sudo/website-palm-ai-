/**
 * Geometry of the drawn palm used by the guide diagrams (DESIGN_SYSTEM.md §9).
 *
 * Same coordinate system, outline and base line paths as `PalmTrace.astro`
 * (viewBox `36 30 178 230`: little finger on the left, thumb on the right),
 * so every guide diagram is the same drawn hand as the home page. If the
 * palm in PalmTrace changes, change it here too.
 *
 * A variant draws one line (or a minor line) in a shape the books describe,
 * over the other main lines shown dimmed for orientation. These are labelled
 * drawings, never someone's real palm.
 */

export type MainLine = 'heart' | 'head' | 'life' | 'fate';
export type TraceKind = MainLine | 'minor';

export const PALM_VIEWBOX = '36 30 178 230';
/** A close-up of the palm edge under the little finger (marriage lines). */
export const EDGE_VIEWBOX = '38 86 72 72';

export const PALM_OUTLINE =
  'M70 252 C 58 222, 50 192, 50 160 L 50 100 A 12 12 0 0 1 74 100 L 75 126 L 78 64 A 12.5 12.5 0 0 1 103 64 L 104 120 L 107 50 A 13 13 0 0 1 133 50 L 133 122 L 136 72 A 12.5 12.5 0 0 1 161 72 L 161 146 C 166 134, 176 118, 186 112 A 11 11 0 0 1 200 128 C 194 148, 182 170, 170 186 C 160 200, 152 220, 150 252 Z';

export const BASE_PATHS: Record<MainLine, string> = {
  life: 'M160 164 C 134 178, 122 206, 130 244',
  head: 'M160 158 C 132 162, 100 172, 68 190',
  heart: 'M56 152 C 82 142, 110 148, 140 132',
  fate: 'M112 248 C 113 222, 115 190, 118 136',
};

export interface Variant {
  /** Which colour the focus line uses. */
  kind: TraceKind;
  /** The focus line: one or more path segments (none = the line is absent). */
  paths: string[];
  /** How the focus line is drawn. */
  style?: 'normal' | 'faint' | 'chained';
  /** Main lines shown dimmed behind it; `null` hides one (default: every main line except `kind`). */
  context?: Partial<Record<MainLine, string | null>>;
  /** `edge` zooms into the palm edge under the little finger. */
  view?: 'palm' | 'edge';
}

const B = BASE_PATHS;

export const VARIANTS = {
  // Heart line
  'heart-end-index': { kind: 'heart', paths: [B.heart] },
  'heart-end-middle': { kind: 'heart', paths: ['M56 152 C 78 144, 100 142, 118 126'] },
  'heart-end-between': { kind: 'heart', paths: ['M56 152 C 80 143, 108 144, 132 126'] },
  'heart-straight': { kind: 'heart', paths: ['M56 150 C 84 147, 112 145, 140 143'] },
  'heart-short': { kind: 'heart', paths: ['M56 152 C 68 148, 80 146, 94 145'] },
  'heart-long': { kind: 'heart', paths: ['M51 152 C 90 146, 128 144, 160 138'] },
  'heart-fork': { kind: 'heart', paths: [B.heart, 'M118 141 C 122 136, 125 131, 126 125'] },
  'heart-broken': { kind: 'heart', paths: ['M56 152 C 68 148, 80 146, 90 145', 'M97 147 C 111 146, 126 140, 140 132'] },
  'heart-chained': { kind: 'heart', paths: [B.heart], style: 'chained' },
  'heart-faint': { kind: 'heart', paths: [B.heart], style: 'faint' },
  'heart-branches-up': {
    kind: 'heart',
    paths: [B.heart, 'M80 146 C 80 143, 81 140, 83 136', 'M101 145 C 102 142, 103 139, 105 135'],
  },

  // Head line
  'head-straight': { kind: 'head', paths: ['M160 158 C 130 160, 98 162, 62 164'] },
  'head-gentle': { kind: 'head', paths: [B.head] },
  'head-sloping': { kind: 'head', paths: ['M160 158 C 130 164, 96 184, 76 224'] },
  'head-short': { kind: 'head', paths: ['M160 158 C 146 160, 132 164, 118 168'] },
  'head-long': { kind: 'head', paths: ['M160 158 C 128 162, 90 170, 52 176'] },
  'head-fork': { kind: 'head', paths: [B.head, 'M98 173 C 88 186, 82 198, 78 212'] },
  'head-broken': { kind: 'head', paths: ['M160 158 C 144 160, 128 164, 116 167', 'M109 171 C 96 175, 82 182, 68 190'] },
  'head-chained': { kind: 'head', paths: [B.head], style: 'chained' },
  'head-faint': { kind: 'head', paths: [B.head], style: 'faint' },
  'head-joined': { kind: 'head', paths: [B.head] },
  'head-separate': { kind: 'head', paths: ['M153 149 C 128 155, 98 167, 68 186'] },
  'head-double': { kind: 'head', paths: [B.head, 'M150 150 C 124 152, 96 160, 70 172'] },

  // Life line
  'life-wide': { kind: 'life', paths: [B.life] },
  'life-close': { kind: 'life', paths: ['M160 164 C 150 184, 146 214, 148 246'] },
  'life-short': { kind: 'life', paths: ['M160 164 C 142 176, 132 192, 130 208'] },
  'life-long': { kind: 'life', paths: ['M160 164 C 132 178, 120 212, 136 251'] },
  'life-broken': { kind: 'life', paths: ['M160 164 C 142 174, 131 188, 128 202', 'M123 209 C 121 222, 123 236, 129 246'] },
  'life-double': { kind: 'life', paths: [B.life, 'M153 176 C 140 188, 136 208, 142 238'] },
  'life-fork': { kind: 'life', paths: [B.life, 'M126 226 C 116 234, 110 242, 106 250'] },
  'life-chained': { kind: 'life', paths: [B.life], style: 'chained' },
  'life-faint': { kind: 'life', paths: [B.life], style: 'faint' },
  'life-start-index': { kind: 'life', paths: ['M151 147 C 134 170, 122 206, 130 244'] },

  // Fate line
  'fate-wrist': { kind: 'fate', paths: [B.fate] },
  'fate-from-life': { kind: 'fate', paths: ['M129 204 C 124 186, 120 164, 118 136'] },
  'fate-from-luna': { kind: 'fate', paths: ['M74 232 C 90 210, 106 180, 116 136'] },
  'fate-late': { kind: 'fate', paths: ['M116 190 C 117 172, 118 154, 118 136'] },
  'fate-broken': { kind: 'fate', paths: ['M112 248 C 113 230, 114 212, 114 198', 'M118 192 C 118 174, 118 156, 119 136'] },
  'fate-double': { kind: 'fate', paths: ['M107 248 C 108 222, 109 190, 111 136', 'M119 246 C 120 220, 122 190, 125 138'] },
  'fate-end-index': { kind: 'fate', paths: ['M112 248 C 118 214, 132 176, 146 134'] },
  'fate-end-ring': { kind: 'fate', paths: ['M112 248 C 108 214, 98 176, 90 134'] },
  'fate-absent': { kind: 'fate', paths: [] },
  'fate-faint': { kind: 'fate', paths: [B.fate], style: 'faint' },

  // Marriage lines (the palm edge under the little finger)
  'marriage-one': { kind: 'minor', view: 'edge', paths: ['M50 139 C 55 139, 60 138, 65 137'] },
  'marriage-two': { kind: 'minor', view: 'edge', paths: ['M50 133 C 55 133, 60 132, 65 131', 'M50 142 C 55 142, 60 141, 64 140'] },
  'marriage-long': { kind: 'minor', view: 'edge', paths: ['M50 139 C 62 138, 74 136, 86 131'] },
  'marriage-fork': { kind: 'minor', view: 'edge', paths: ['M50 139 C 54 139, 57 138.5, 60 138', 'M60 138 C 62 136.5, 64 135, 67 134', 'M60 138 C 62 139.5, 64 141, 67 142'] },
  'marriage-broken': { kind: 'minor', view: 'edge', paths: ['M50 139 C 52 139, 54 139, 56 138.8', 'M59 138.6 C 61 138.4, 63 138, 66 137.5'] },
  'marriage-down': { kind: 'minor', view: 'edge', paths: ['M50 138 C 56 138, 61 140, 65 146'] },
  'marriage-up': { kind: 'minor', view: 'edge', paths: ['M50 141 C 56 141, 61 138, 64 131'] },

  // One line across the palm (simian line) and the full map
  simian: {
    kind: 'minor',
    paths: ['M50 164 C 86 159, 124 157, 160 159'],
    context: { heart: null, head: null },
  },
  'heart-head-touching': { kind: 'heart', paths: ['M56 152 C 82 148, 110 158, 140 160'], context: { head: 'M160 158 C 138 161, 116 164, 92 176' } },
} as const satisfies Record<string, Variant>;

export type VariantName = keyof typeof VARIANTS;

export function isVariant(name: string): name is VariantName {
  return Object.hasOwn(VARIANTS, name);
}
