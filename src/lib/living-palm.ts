/**
 * Build time only (node:fs): the extra Living palm hands for "See another hand",
 * read from public/models/living-palm/hands.json (written by the living-palm
 * pipeline, research-tools/living-palm/). Only listed hands whose files are all
 * there count; each keeps its photographer for the footer credit.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { HAND_FILES, extraHands, handBase, type HandShape } from '../scripts/living-palm-hands';

const PUBLIC = join(process.cwd(), 'public');

function readList(): unknown {
  const file = join(PUBLIC, 'models', 'living-palm', 'hands.json');
  try {
    return existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as unknown) : [];
  } catch {
    return [];
  }
}

export function listedHands(): HandShape[] {
  return extraHands(readList()).filter((h) => HAND_FILES.every((f) => existsSync(join(PUBLIC, handBase(h.slug), f))));
}

/** The photographers of the listed hands (as hands.json credits them), for the footer. */
export function listedHandAuthors(): string[] {
  const list = readList();
  const items = Array.isArray((list as { hands?: unknown })?.hands) ? (list as { hands: unknown[] }).hands : Array.isArray(list) ? list : [];
  const slugs = new Set(listedHands().map((h) => h.slug));
  const names: string[] = [];
  for (const item of items) {
    const o = item as { slug?: string; credit?: { author?: unknown } } | null;
    const name = o?.credit?.author;
    if (o?.slug && slugs.has(o.slug) && typeof name === 'string' && name && !names.includes(name)) names.push(name);
  }
  return names;
}
