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
  // Pillar attribute gaps (SEMANTIC_SEO_PLAN.md U5, 2026-09-28)
  'heart-curved': { kind: 'heart', paths: ['M56 154 C 90 156, 118 146, 130 120'] },
  'heart-double': { kind: 'heart', paths: [B.heart, 'M57 159 C 83 149, 111 155, 139 139'] },
  'heart-branches-down': {
    kind: 'heart',
    paths: [B.heart, 'M80 147 C 80 151, 79 155, 77 159', 'M102 146 C 102 150, 101 154, 99 158'],
  },
  'heart-absent': { kind: 'heart', paths: [] },

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
  'head-wavy': {
    kind: 'head',
    paths: ['M160 158 C 152 155, 146 165, 138 164 C 130 163, 124 171, 116 170 C 108 169, 100 178, 92 178 C 84 178, 76 187, 68 190'],
  },
  'head-branch-up': { kind: 'head', paths: [B.head, 'M124 166 C 128 159, 133 153, 139 147'] },

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
  'life-branches-up': { kind: 'life', paths: [B.life, 'M143 177 C 140 173, 138 170, 135 167', 'M132 195 C 128 191, 125 188, 121 185'] },

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
  'fate-from-venus': { kind: 'fate', paths: ['M146 232 C 136 212, 124 180, 118 136'] },
  'fate-from-head': { kind: 'fate', paths: ['M116 170 C 117 158, 117 148, 118 136'] },
  'fate-from-heart': { kind: 'fate', paths: ['M118 142 C 118 136, 119 130, 119 124'] },
  'fate-fork': {
    kind: 'fate',
    paths: ['M116 200 C 117 180, 118 160, 118 136', 'M116 200 C 108 214, 98 228, 90 240', 'M116 200 C 124 214, 134 228, 142 238'],
  },
  'fate-wavy': {
    kind: 'fate',
    paths: ['M112 248 C 106 234, 120 222, 114 208 C 108 194, 122 182, 116 168 C 110 156, 122 146, 118 136'],
  },

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

  // Sun line (/sun-line/, WEB-DEC-054): up the palm towards the ring finger (x ≈ 90), in gold. Drawings only:
  // the scanner does not trace the sun line.
  'sun-long': { kind: 'minor', paths: ['M84 236 C 86 204, 88 170, 90 134'] },
  'sun-from-luna': { kind: 'minor', paths: ['M62 226 C 72 200, 84 168, 90 134'] },
  'sun-from-fate': { kind: 'minor', paths: ['M114 198 C 104 178, 94 158, 90 134'] },
  'sun-from-mars': { kind: 'minor', paths: ['M97 192 C 94 172, 91 152, 90 134'] },
  'sun-from-head': { kind: 'minor', paths: ['M94 175 C 92 161, 91 148, 90 134'] },
  'sun-mount-only': { kind: 'minor', paths: ['M90 143 C 90 139, 90 134, 89 129'] },
  'sun-fork': { kind: 'minor', paths: ['M86 206 C 87 182, 89 158, 90 142', 'M90 142 C 88 137, 86 133, 83 129', 'M90 142 C 92 137, 94 133, 97 129'] },
  'sun-double': { kind: 'minor', paths: ['M83 202 C 84 180, 85 157, 85 134', 'M94 202 C 95 180, 96 157, 96 134'] },
  'sun-many': { kind: 'minor', paths: ['M83 143 C 83 139, 83 135, 83 130', 'M90 144 C 90 140, 90 135, 90 130', 'M97 143 C 97 139, 97 135, 97 130'] },
  'sun-broken': { kind: 'minor', paths: ['M85 206 C 86 192, 87 180, 87 168', 'M90 162 C 90 152, 90 143, 90 134'] },
  'sun-absent': { kind: 'minor', paths: [] },

  // Crosses (/palm-crosses/, WEB-DEC-054): a small X in gold, where the books place it. Drawings only.
  'cross-mystic': { kind: 'minor', paths: ['M113 150 L 123 160', 'M123 150 L 113 160'] },
  'cross-mystic-jupiter': { kind: 'minor', paths: ['M131 143 L 141 153', 'M141 143 L 131 153'] },
  'cross-mystic-luna': { kind: 'minor', paths: ['M77 162 L 87 172', 'M87 162 L 77 172'] },
  'cross-jupiter': { kind: 'minor', paths: ['M145 136 L 154 145', 'M154 136 L 145 145'] },
  'cross-saturn': { kind: 'minor', paths: ['M115 126 L 124 135', 'M124 126 L 115 135'] },
  'cross-sun': { kind: 'minor', paths: ['M85 129 L 94 138', 'M94 129 L 85 138'] },
  'cross-mercury': { kind: 'minor', paths: ['M58 132 L 67 141', 'M67 132 L 58 141'] },
  'cross-moon': { kind: 'minor', paths: ['M59 210 L 69 220', 'M69 210 L 59 220'] },
  'cross-venus': { kind: 'minor', paths: ['M145 210 L 155 220', 'M155 210 L 145 220'] },
  'cross-on-line': { kind: 'minor', paths: ['M95 167 L 105 177', 'M105 167 L 95 177'] },

  // Broken life line (/life-line/broken/, WEB-FEAT-036): the kinds of break the books describe, in the
  // life line's colour. Drawings only; the hero shows the scanner's real life line on a photo.
  'life-break-clean': { kind: 'life', paths: ['M160 164 C 145 172, 136 182, 133 193', 'M129 206 C 126 220, 125 233, 130 244'] },
  'life-break-overlap': { kind: 'life', paths: ['M160 164 C 145 172, 136 184, 132 197', 'M139 186 C 132 200, 126 222, 130 244'] },
  'life-break-square': {
    kind: 'life',
    paths: ['M160 164 C 145 172, 136 182, 133 193', 'M129 206 C 126 220, 125 233, 130 244', 'M124 191.5 H 137.5 V 208 H 124 Z'],
  },
  'life-break-sister': {
    kind: 'life',
    paths: ['M160 164 C 145 172, 136 182, 133 193', 'M129 206 C 126 220, 125 233, 130 244', 'M143 185 C 137 197, 135 211, 137 226'],
  },

  // Mercury line (/mercury-line/, WEB-FEAT-058): up the palm to the little finger (x ≈ 63), in gold.
  // Drawings only: the scanner does not trace it.
  'mercury-line': { kind: 'minor', paths: ['M98 240 C 88 212, 74 174, 64 134'] },
  'mercury-short': { kind: 'minor', paths: ['M74 170 C 70 157, 67 146, 64 134'] },
  'mercury-absent': { kind: 'minor', paths: [] },

  // Children lines (/children-line/, WEB-FEAT-045): fine upright lines on the palm edge under the little
  // finger, rising from the marriage line (Cheiro) or from the heart line (Cheiro's Guide). Edge close-up.
  'children-lines': {
    kind: 'minor',
    view: 'edge',
    paths: ['M50 139 C 55 139, 60 138, 65 137', 'M54 138.9 L 54.5 132', 'M57.5 138.6 L 58 131', 'M61 138 L 61.4 133'],
  },
  'children-from-heart': {
    kind: 'minor',
    view: 'edge',
    paths: ['M50 139 C 55 139, 60 138, 65 137', 'M60 150.4 L 60.6 143.5', 'M63.5 149.3 L 64 143'],
  },

  // The M on the palm (/palmistry-m/, WEB-FEAT-039): the four major lines in gold, the shape they make
  // together. A drawing; the guide's hero shows the scanner's real lines on a photo.
  'm-four-lines': { kind: 'minor', paths: [B.heart, B.head, B.life, B.fate], context: { heart: null, head: null, life: null, fate: null } },
  'm-no-fate': { kind: 'minor', paths: [B.heart, B.head, B.life], context: { heart: null, head: null, life: null, fate: null } },

  // Signs (/lucky-signs/, WEB-FEAT-046): small gold marks where the books place them (Cheiro, Dale, Jain).
  // The trident has no fixed place in the books; the drawing puts it under the little finger only to show the shape.
  'sign-star-jupiter': { kind: 'minor', paths: ['M150 133.5 V 144.5', 'M145.2 136.2 L 154.8 141.8', 'M154.8 136.2 L 145.2 141.8'] },
  'sign-star-sun': { kind: 'minor', paths: ['M90 126.5 V 137.5', 'M85.2 129.2 L 94.8 134.8', 'M94.8 129.2 L 85.2 134.8'] },
  'sign-triangle-jupiter': { kind: 'minor', paths: ['M150 133 L 156 144 L 144 144 Z'] },
  'sign-triangle-saturn': { kind: 'minor', paths: ['M120 124 L 126 135 L 114 135 Z'] },
  'sign-square-life': {
    kind: 'minor',
    paths: ['M119.5 199.5 H 131.5 V 211.5 H 119.5 Z'],
    context: { life: 'M160 164 C 142 174, 131 188, 128 202 M123 209 C 121 222, 123 236, 129 246' },
  },
  'sign-fish': { kind: 'minor', paths: ['M87.8 241 C 91 236.6, 95.8 236.6, 99 241 C 95.8 245.4, 91 245.4, 87.8 241 Z M99 241 L 102.2 237.8 V 244.2 Z'] },
  'sign-trident': { kind: 'minor', paths: ['M63 140 V 128.5', 'M58.6 128.2 C 58.6 133, 67.4 133, 67.4 128.2'] },

  // Money and work (/money-line/, /career-palmistry/, WEB-FEAT-040/037): these pages reuse 'mercury-line' above;
  // the popular "money triangle" is the space that line closes with the head and fate lines. Drawings only.
  'money-triangle': { kind: 'minor', paths: ['M98 240 C 88 212, 74 174, 64 134', 'M100 236 L 115 172 L 80 183 Z'] },
} as const satisfies Record<string, Variant>;

export type VariantName = keyof typeof VARIANTS;

export function isVariant(name: string): name is VariantName {
  return Object.hasOwn(VARIANTS, name);
}

// ---------------------------------------------------------------------------
// Hand shapes (guide v4, WEB-DEC-047): silhouettes of Cheiro's seven hand
// types (Palmistry for All, 1916, Part II ch. I), all at one scale in a
// 64 × 84 box, little finger on the left and thumb on the right like the palm
// above. Drawings of a type, never someone's hand. One filled path each; every
// part is drawn clockwise so the parts join (nonzero fill).

export type HandShapeKey = 'elementary' | 'square' | 'spatulate' | 'philosophic' | 'conic' | 'psychic' | 'mixed';
export const HAND_SHAPE_ORDER: readonly HandShapeKey[] = ['elementary', 'square', 'spatulate', 'philosophic', 'conic', 'psychic', 'mixed'];
export const HAND_SHAPE_VIEWBOX = '0 0 64 84';

type Tip = 'square' | 'round' | 'point' | 'spatula';

interface HandShapeSpec {
  palm: { w: number; h: number; r: number };
  /** Little, ring, middle, index finger lengths. */
  fingers: [number, number, number, number];
  width: number;
  tips: Tip | [Tip, Tip, Tip, Tip];
  knots?: boolean;
  thumb: number;
}

const n1 = (n: number) => String(Math.round(n * 2) / 2 + 0);

function fingerPath(x: number, w: number, base: number, top: number, tip: Tip): string {
  // Relative commands after the first point: short numbers, light HTML.
  const up = base - top;
  const start = `M${n1(x)} ${n1(base)}`;
  if (tip === 'round') return `${start}v${n1(-(up - w / 2))}a${n1(w / 2)} ${n1(w / 2)} 0 0 1 ${n1(w)} 0v${n1(up - w / 2)}z`;
  if (tip === 'point') return `${start}l${n1(w * 0.12)} ${n1(-(up - w))}q${n1(w * 0.38)} ${n1(-w * 1.35)} ${n1(w * 0.76)} 0l${n1(w * 0.12)} ${n1(up - w)}z`;
  if (tip === 'spatula')
    return `M${n1(x + w * 0.1)} ${n1(base)}l${n1(-w * 0.24)} ${n1(-(up - w * 0.5))}q0 ${n1(-w * 0.5)} ${n1(w * 0.64)} ${n1(-w * 0.5)}t${n1(w * 0.64)} ${n1(w * 0.5)}l${n1(-w * 0.24)} ${n1(up - w * 0.5)}z`;
  return `${start}v${n1(-(up - 1.5))}q0-1.5 1.5-1.5h${n1(w - 3)}q1.5 0 1.5 1.5v${n1(up - 1.5)}z`;
}

const d1 = (n: number) => String(Math.round(n * 10) / 10 + 0);
const circle = (cx: number, cy: number, r: number) => `M${d1(cx - r)} ${n1(cy)}a${d1(r)} ${d1(r)} 0 1 1 ${d1(r * 2)} 0a${d1(r)} ${d1(r)} 0 1 1 ${d1(-r * 2)} 0z`;

/** One silhouette: palm, four fingers, thumb (and joint knots), as a single path. */
export function handShapePath(spec: HandShapeSpec): string {
  const bottom = 82;
  const { w, h, r } = spec.palm;
  const x0 = 29 - w / 2;
  const x1 = x0 + w;
  const top = bottom - h;
  const parts = [
    `M${n1(x0 + r)} ${n1(top)}h${n1(w - 2 * r)}q${n1(r)} 0 ${n1(r)} ${n1(r)}v${n1(h - r - 7)}q0 7-5 7h${n1(-(w - 10))}q-5 0-5-7v${n1(-(h - r - 7))}q0 ${n1(-r)} ${n1(r)} ${n1(-r)}z`,
  ];
  const slot = w / 4;
  spec.fingers.forEach((length, i) => {
    const x = x0 + slot * i + (slot - spec.width) / 2;
    const tip = Array.isArray(spec.tips) ? spec.tips[i]! : spec.tips;
    parts.push(fingerPath(x, spec.width, top + 3, top - length, tip));
    if (spec.knots) for (const t of [0.4, 0.72]) parts.push(circle(x + spec.width / 2, top - length * t, spec.width * 0.6));
  });
  // The thumb: a capsule from the palm's lower right, leaning out and up.
  const bx = x1 - spec.width * 0.4;
  const by = top + h * 0.62;
  const angle = (-58 * Math.PI) / 180;
  const dx = Math.cos(angle) * spec.thumb;
  const dy = Math.sin(angle) * spec.thumb;
  const half = spec.width * 0.62;
  const nx = -Math.sin(angle) * half;
  const ny = Math.cos(angle) * half;
  parts.push(`M${n1(bx - nx)} ${n1(by - ny)}l${n1(dx)} ${n1(dy)}a${n1(half)} ${n1(half)} 0 0 1 ${n1(2 * nx)} ${n1(2 * ny)}l${n1(-dx)} ${n1(-dy)}z`);
  return parts.join('');
}

const SHAPE_SPECS: Record<HandShapeKey, HandShapeSpec> = {
  elementary: { palm: { w: 34, h: 30, r: 4 }, fingers: [11, 14, 16, 14], width: 7.4, tips: 'square', thumb: 13 },
  square: { palm: { w: 31, h: 31, r: 2.5 }, fingers: [15, 19, 21, 19], width: 6.6, tips: 'square', thumb: 17 },
  spatulate: { palm: { w: 30, h: 33, r: 5 }, fingers: [15, 20, 22, 19], width: 6, tips: 'spatula', thumb: 18 },
  philosophic: { palm: { w: 28, h: 37, r: 6 }, fingers: [18, 23, 26, 23], width: 5.4, tips: 'round', knots: true, thumb: 21 },
  conic: { palm: { w: 29, h: 35, r: 8 }, fingers: [17, 22, 24, 21], width: 5.8, tips: 'round', thumb: 19 },
  psychic: { palm: { w: 25, h: 38, r: 9 }, fingers: [20, 26, 28, 25], width: 4.8, tips: 'point', thumb: 21 },
  mixed: { palm: { w: 30, h: 34, r: 5 }, fingers: [16, 21, 23, 20], width: 6, tips: ['point', 'round', 'spatula', 'square'], thumb: 19 },
};

export const HAND_SHAPES: Record<HandShapeKey, string> = Object.fromEntries(
  HAND_SHAPE_ORDER.map((key) => [key, handShapePath(SHAPE_SPECS[key])]),
) as Record<HandShapeKey, string>;
