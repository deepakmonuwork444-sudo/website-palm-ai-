import { absoluteUrl } from '../config/site';
import { isLive } from '../config/pages';
import { ENTITIES, TERMS_PATH, entitySameAs, type Entity, type EntityGroup } from './entities';

/**
 * The glossary /palmistry-terms/ (SEMANTIC_SEO_PLAN.md §5.4, owner decision D2, WEB-DEC-053):
 * built ONLY from src/lib/entities.ts, so every term, Hindi name, definition and owner page is the
 * same value everywhere on the site (knowledge-based trust). Build-time data; no JS shipped.
 */

export interface TermSection {
  /** The section's anchor id (never the same as a term id). */
  id: string;
  title: string;
  /** Short contents label. */
  label: string;
  groups: readonly EntityGroup[];
}

/** Sections in reading order; every registry group is in exactly one section (unit test). */
export const TERM_SECTIONS: readonly TermSection[] = [
  { id: 'traditions', title: 'Palmistry and its traditions', label: 'Traditions', groups: ['tradition'] },
  { id: 'the-hand', title: 'The hand and which hand to read', label: 'The hand', groups: ['hand'] },
  { id: 'major-lines', title: 'The major lines', label: 'Major lines', groups: ['line-major'] },
  { id: 'minor-lines', title: 'The minor lines', label: 'Minor lines', groups: ['line-minor'] },
  { id: 'unusual-lines', title: 'Unusual line patterns', label: 'Unusual lines', groups: ['line-variant'] },
  { id: 'mounts', title: 'Mounts of the palm', label: 'Mounts', groups: ['mount'] },
  { id: 'hand-shapes', title: 'Hand shapes and hand types', label: 'Hand shapes', groups: ['shape'] },
  { id: 'fingers-and-thumb', title: 'Fingers and thumb', label: 'Fingers and thumb', groups: ['finger'] },
  { id: 'signs-and-marks', title: 'Signs and marks on the palm', label: 'Signs and marks', groups: ['sign'] },
  { id: 'reading-words', title: 'Words palm readers use', label: 'Reading words', groups: ['reading'] },
  { id: 'science-words', title: 'Science words', label: 'Science words', groups: ['science'] },
];

export function sectionTerms(section: TermSection, entities: readonly Entity[] = ENTITIES): Entity[] {
  return entities.filter((item) => section.groups.includes(item.group));
}

/** The page that explains the term, only while it is built (planned pages get no link). */
export function termLink(item: Entity): string | null {
  return item.owner && item.owner !== TERMS_PATH && isLive(item.owner) ? item.owner : null;
}

export const TERM_SET_ID = absoluteUrl(`${TERMS_PATH}#set`);

/**
 * JSON-LD: one DefinedTermSet with every DefinedTerm (`@id` = the registry id used site-wide,
 * `alternateName` = the Hindi name, `description` = the definition, `url` = the owner page when
 * built, else the glossary entry; `sameAs` = verified Wikidata / Wikipedia only).
 */
export function definedTermSetSchema(entities: readonly Entity[] = ENTITIES): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': TERM_SET_ID,
    name: 'Palmistry terms: a glossary of palm reading words',
    url: absoluteUrl(TERMS_PATH),
    inLanguage: 'en',
    hasDefinedTerm: entities.map((item) => {
      const link = termLink(item);
      const sameAs = entitySameAs(item);
      return {
        '@type': 'DefinedTerm',
        '@id': absoluteUrl(`${TERMS_PATH}#${item.id}`),
        name: item.name.en,
        alternateName: item.name.hi,
        description: item.def,
        url: absoluteUrl(link ?? `${TERMS_PATH}#${item.id}`),
        ...(sameAs.length ? { sameAs } : {}),
      };
    }),
  };
}
