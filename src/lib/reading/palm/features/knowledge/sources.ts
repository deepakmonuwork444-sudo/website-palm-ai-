// COPIED from palm-ai-new--feat-m1-foundation/src/features/knowledge/sources.ts at app commit 38389f51b74d (2026-09-26).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import type { KbSource } from './types';

/**
 * Every source a rule may cite.
 *
 * Two generations live here:
 *
 * - Seed sources, written before any book was downloaded. Their locators are
 *   chapter-level guesses, and the Indian entry is a general tradition rather
 *   than a book — it is `unknown` rights and its wording must never be
 *   reproduced. Seed rules that cite them are being superseded one feature at
 *   a time (see `rules.ts`).
 *
 * - Corpus books, downloaded in corpus v1 and catalogued with a rights
 *   decision in `tools/ingest/catalogue.ts`. Their ids, titles, traditions and
 *   rights are the catalogue's, and a test keeps the two in step.
 */
export const KB_SOURCES: KbSource[] = [
  // ---- seed sources ----
  {
    sourceId: 'cheiro-loth-1897',
    title: "Cheiro's Language of the Hand",
    tradition: 'western_classical',
    locator: 'ch. VI-IX, the lines of the hand',
    rights: 'public_domain',
    language: 'en',
  },
  {
    sourceId: 'benham-lshr-1900',
    title: 'The Laws of Scientific Hand Reading',
    tradition: 'western_classical',
    locator: 'the mounts; the line of heart; the line of head',
    rights: 'public_domain',
    language: 'en',
  },
  {
    sourceId: 'hast-rekha-general',
    title: 'Hast Rekha Shastra (general tradition)',
    tradition: 'indian_hast_rekha',
    locator: 'tradition_general — pending corpus ingestion',
    rights: 'unknown',
    language: 'hi',
  },

  // ---- corpus v1 books ----
  {
    sourceId: 'cheiro-palmistry-for-all-1916',
    title: 'Palmistry for All',
    tradition: 'western_classical',
    locator: 'Part I, chapters on the lines',
    rights: 'public_domain',
    language: 'en',
    author: 'Cheiro',
    year: 1916,
  },
  {
    sourceId: 'cheiro-language-of-the-hand-1900',
    title: "Cheiro's Language of the Hand",
    tradition: 'western_classical',
    locator: 'Part II, Cheiromancy',
    rights: 'public_domain',
    language: 'en',
    author: 'Cheiro',
    year: 1900,
  },
  {
    sourceId: 'markun-what-you-should-know-about-palmistry-1927',
    title: 'What You Should Know About Palmistry',
    tradition: 'western_classical',
    locator: 'the sections on the lines',
    rights: 'public_domain',
    language: 'en',
    author: 'Leo Markun',
    year: 1927,
  },
  {
    sourceId: 'dale-indian-palmistry-1895',
    title: 'Indian Palmistry',
    tradition: 'indian_hast_rekha',
    locator: 'the key to the lines, and the chapters on each line',
    rights: 'public_domain',
    language: 'en',
    author: 'Mrs. J. B. Dale',
    year: 1895,
  },
  {
    sourceId: 'benham-laws-of-scientific-hand-reading-1900',
    title: 'The Laws of Scientific Hand Reading',
    tradition: 'western_classical',
    locator: 'Part II, the chapters on the lines',
    // Author's death year unverified: facts only, wording never reproduced.
    rights: 'unknown',
    language: 'en',
    author: 'William G. Benham',
    year: 1900,
  },

  // ---- corpus v1 books first cited in the fifth extraction pass (2026-09-18) ----
  {
    sourceId: 'cheiro-guide-to-the-hand-1900',
    title: "Cheiro's Guide to the Hand",
    tradition: 'western_classical',
    locator: 'the chapters on the lines',
    rights: 'public_domain',
    language: 'en',
    author: 'Cheiro',
    year: 1900,
  },
  {
    sourceId: 'frith-practical-palmistry-1895',
    title: 'Practical Palmistry: a treatise on chirosophy',
    tradition: 'western_classical',
    locator: 'the chapters on the lines',
    rights: 'public_domain',
    language: 'en',
    author: 'Henry Frith',
    year: 1895,
  },
  {
    sourceId: 'heron-allen-manual-of-cheirosophy-1885',
    title: 'A Manual of Cheirosophy',
    tradition: 'western_classical',
    locator: 'Part II, Cheiromancy',
    rights: 'public_domain',
    language: 'en',
    author: 'Edward Heron-Allen',
    year: 1885,
  },
  {
    sourceId: 'heron-allen-practical-cheirosophy-1887',
    title: 'Practical Cheirosophy',
    tradition: 'western_classical',
    locator: 'Cheiromancy or Palmistry',
    rights: 'public_domain',
    language: 'en',
    author: 'Edward Heron-Allen',
    year: 1887,
  },
  {
    sourceId: 'desbarrolles-chiromancie-nouvelle-1859',
    title: 'Chiromancie nouvelle',
    tradition: 'western_classical',
    locator: 'the chapters on the lines',
    rights: 'public_domain',
    language: 'fr',
    author: 'Adolphe Desbarrolles',
    year: 1859,
  },
  {
    sourceId: 'raphael-cheirosophy-1901',
    title: 'Cheirosophy (the hand)',
    tradition: 'western_classical',
    locator: 'the chapters on the lines',
    // Author's death year unverified: facts only, wording never reproduced.
    rights: 'unknown',
    language: 'en',
    author: 'Albert Raphael',
    year: 1901,
  },
  {
    sourceId: 'saint-germain-practice-of-palmistry-1900',
    title: 'The Practice of Palmistry for Professional Purposes',
    tradition: 'western_classical',
    locator: 'the chapters on the lines',
    rights: 'unknown',
    language: 'en',
    author: 'Comte C. de Saint-Germain',
    year: 1900,
  },
  {
    sourceId: 'st-hill-grammar-of-palmistry-1893',
    title: 'The Grammar of Palmistry',
    tradition: 'western_classical',
    locator: 'the chapters on the lines',
    rights: 'unknown',
    language: 'en',
    author: 'Katharine St. Hill',
    year: 1893,
  },
  {
    sourceId: 'williams-key-to-palmistry-1902',
    title: 'Key to Palmistry',
    tradition: 'western_classical',
    locator: 'the chapters on the lines',
    rights: 'unknown',
    language: 'en',
    author: 'Louis Williams',
    year: 1902,
  },
  {
    sourceId: 'jain-samudrik-shastra-1927',
    title: 'Samudrik Shastra ya Bhagya Nirnay',
    tradition: 'indian_hast_rekha',
    locator: 'the sections on each line',
    rights: 'unknown',
    language: 'hi',
    author: 'Chhotelal Jain',
    year: 1927,
  },
];

export function sourceById(sourceId: string): KbSource | undefined {
  return KB_SOURCES.find((s) => s.sourceId === sourceId);
}
