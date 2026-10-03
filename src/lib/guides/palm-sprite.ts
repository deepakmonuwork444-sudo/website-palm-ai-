/**
 * The guides' line drawings as one cached SVG sprite (SEMANTIC_SEO_PLAN.md §7.1,
 * WEB-DEC-052). Every variation card (PalmDiagram) and side-by-side row
 * (CompareRow) used to write its line paths into the page; now each is a
 * `<use>` of an id in /img/guides/palm-sprite.svg (built from palm-geometry by
 * src/pages/img/guides/palm-sprite.svg.ts, so it can never drift from VARIANTS).
 *
 * The sprite holds bare geometry only: no colours, classes or styles. Colour,
 * width, dashes and opacity sit on the page's `<use>` (Day/Night CSS
 * variables) and reach the cloned paths by inheritance, which every browser
 * supports for an external `<use>`. The palm outline and its glaze gradient
 * stay in the page (PalmDiagram): a gradient referenced from an external
 * sprite is not reliable across browsers.
 *
 * Ids: `l-<line>` a main line in its usual place · `v-<variant>` the variant's
 * focus line(s) as a group · `c-<variant>-<line>` a main line the variant moves.
 */
import { createHash } from 'node:crypto';

import { BASE_PATHS, VARIANTS, type MainLine, type Variant, type VariantName } from './palm-geometry';

const MAINS: MainLine[] = ['life', 'head', 'heart', 'fate'];

export interface SpriteRef {
  line: MainLine;
  /** The sprite id (without `#`). */
  id: string;
}

/** The dimmed main lines behind a variant (every main line except its own, unless it hides or moves one). */
export function contextRefs(name: VariantName): SpriteRef[] {
  const spec: Variant = VARIANTS[name];
  const refs: SpriteRef[] = [];
  for (const line of MAINS) {
    if (line === spec.kind) continue;
    const moved = spec.context?.[line];
    if (moved === null) continue;
    refs.push({ line, id: typeof moved === 'string' && moved !== BASE_PATHS[line] ? `c-${name}-${line}` : `l-${line}` });
  }
  return refs;
}

/** The variant's own line(s), or null when it has none (an absent line). */
export function focusId(name: VariantName): string | null {
  return (VARIANTS[name] as Variant).paths.length ? `v-${name}` : null;
}

/** The sprite document: one `<path>` or `<g>` per id, inside a never-rendered `<defs>`. */
export function buildPalmSprite(): string {
  const items: string[] = MAINS.map((line) => `<path id="l-${line}" d="${BASE_PATHS[line]}"/>`);
  for (const [name, raw] of Object.entries(VARIANTS)) {
    const spec: Variant = raw;
    if (spec.paths.length) items.push(`<g id="v-${name}">${spec.paths.map((d) => `<path d="${d}"/>`).join('')}</g>`);
    for (const line of MAINS) {
      const moved = spec.context?.[line];
      if (typeof moved === 'string' && moved !== BASE_PATHS[line]) items.push(`<path id="c-${name}-${line}" d="${moved}"/>`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg"><defs>\n${items.join('\n')}\n</defs></svg>\n`;
}

export const PALM_SPRITE = buildPalmSprite();
/** Content-hashed, so the file can be cached for a year (public/_headers) and a change is never served stale. */
export const PALM_SPRITE_URL = `/img/guides/palm-sprite.svg?v=${createHash('sha256').update(PALM_SPRITE).digest('hex').slice(0, 10)}`;

/** The href of one sprite id. */
export const spriteHref = (id: string) => `${PALM_SPRITE_URL}#${id}`;
