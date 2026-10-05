/**
 * The Living palm hands (home hero, src/components/home/LivingPalm.astro).
 *
 * Each hand is a real photographed palm rebuilt in depth, with the four lines
 * of a real PalmSays scan of that same photo drawn on its skin. Its files live
 * in public/models/living-palm/<slug>/ and always have these names:
 *   palm-albedo.webp, palm-albedo-1024.webp  colour (alpha = the hand matte); phones load the 1024 one
 *   palm-normal.webp                         object-space normal map
 *   palm-depth.png                           16-bit depth in R/G, coverage in B (meshW x meshH)
 *   palm-shadow.png                          soft shadow mask
 *   palm-meta.json                           { W, H, worldW, worldH, pxToWorld, zmin, zmax }
 *   lines.json                               { rect, maxDistPx, lines[{ key, mid, ... }] } from the real scan
 *   lines-field.png                          distance + progress atlas of those lines (3 bands)
 *   poster-{600,900,1200}.{avif,webp}        the still hand (no lines): the first paint
 *   poster-lines-{600,900}.{avif,webp}       the still hand with its lines: devices that get no live 3D
 * Posters are 5:7 (1200 x 1680, transparent), the live palm's first frame at the
 * same framing; research-tools/living-palm-poster.mjs makes them from the built page.
 * Add a hand by adding an entry here; the "See another hand" button shows once there are two.
 */
export type LineKey = 'heart' | 'head' | 'life' | 'fate';
export const LINE_KEYS: readonly LineKey[] = ['heart', 'head', 'life', 'fate'];

export interface LabelSpot {
  /** Where the label sits, in photo UV (0..1, y down), beside the real line. */
  uv: [number, number];
  /** Which side of that point the text sits. */
  align: 'left' | 'right' | 'center';
}

export interface LivingHand {
  slug: string;
  /** The point the hand turns around, in photo UV. */
  pivot: { u: number; v: number };
  /** The palm's left and right edges (photo U) at mid height: label size follows the palm's width. */
  edges: [number, number];
  /** Label spots; a missing one sits at the line's middle. */
  labels: Partial<Record<LineKey, LabelSpot>>;
  /** The posters: size of the largest one, and each label's place on it (percent of width/height). */
  poster: { width: number; height: number; labels: Record<LineKey, [number, number]> };
  /** The photo's source (footer credit and the media README). */
  credit: { author: string; url: string };
}

export const HANDS: readonly LivingHand[] = [
  {
    slug: 'hero-palm-a',
    pivot: { u: 0.43, v: 0.47 },
    edges: [0.13, 0.75],
    labels: {
      heart: { uv: [0.235, 0.452], align: 'center' },
      head: { uv: [0.318, 0.548], align: 'right' },
      life: { uv: [0.515, 0.575], align: 'left' },
      fate: { uv: [0.335, 0.618], align: 'right' },
    },
    poster: { width: 1200, height: 1680, labels: { heart: [32.1, 50.1], head: [40, 60.7], life: [57.8, 63.5], fate: [41.6, 68.8] } },
    credit: { author: 'Kevin Malik (Pexels)', url: 'https://www.pexels.com/photo/9017588/' },
  },
];

export const handBase = (slug: string): string => `/models/living-palm/${slug}/`;

/** What the 3D needs of a hand (the first hand also has posters and a credit). */
export type HandShape = Pick<LivingHand, 'slug' | 'pivot' | 'edges' | 'labels'>;

/** Name colours on the skin (day palette), and in gold mode. */
export const LINE_INK: Record<LineKey, string> = { heart: '#B3122B', head: '#1C54B8', life: '#12703A', fate: '#5B3BC4' };
export const GOLD_INK = '#6E4A00';

/** Files every extra hand needs (the posters are only for the first hand). */
export const HAND_FILES = ['palm-albedo.webp', 'palm-albedo-1024.webp', 'palm-normal.webp', 'palm-depth.png', 'palm-shadow.png', 'palm-meta.json', 'lines.json', 'lines-field.png'];

const num = (v: unknown, lo: number, hi: number): v is number => typeof v === 'number' && v >= lo && v <= hi;

/**
 * Extra hands for "See another hand", from public/models/living-palm/hands.json (written by the
 * living-palm pipeline): an array (or { hands: [...] }) of slugs or { slug, pivot?, edges?, labels? }.
 * Only listed hands count; the first hand above is never repeated; missing values get safe defaults
 * (names at each line's middle). The component checks that each listed hand's files exist.
 */
export function extraHands(json: unknown): HandShape[] {
  const list = Array.isArray(json) ? json : Array.isArray((json as { hands?: unknown })?.hands) ? (json as { hands: unknown[] }).hands : [];
  const out: HandShape[] = [];
  for (const item of list) {
    const o = (typeof item === 'string' ? { slug: item } : item) as Partial<HandShape> | null;
    if (!o || typeof o.slug !== 'string' || !/^[a-z0-9-]+$/.test(o.slug)) continue;
    if (o.slug === HANDS[0]!.slug || out.some((h) => h.slug === o.slug)) continue;
    const pivot = o.pivot && num(o.pivot.u, 0, 1) && num(o.pivot.v, 0, 1) ? o.pivot : { u: 0.45, v: 0.47 };
    const edges: [number, number] = Array.isArray(o.edges) && num(o.edges[0], 0, 1) && num(o.edges[1], 0, 1) ? [o.edges[0], o.edges[1]] : [0.15, 0.8];
    const labels: HandShape['labels'] = {};
    for (const k of LINE_KEYS) {
      const s = o.labels?.[k];
      if (s && Array.isArray(s.uv) && num(s.uv[0], 0, 1) && num(s.uv[1], 0, 1) && ['left', 'right', 'center'].includes(s.align)) labels[k] = { uv: [s.uv[0], s.uv[1]], align: s.align };
    }
    out.push({ slug: o.slug, pivot, edges, labels });
  }
  return out;
}
