/**
 * The palmistry books a guide may cite (CONTENT_GUIDE.md §9.2).
 *
 * A read-only copy of the corpus books in the app's
 * `src/features/knowledge/sources.ts` (app repo, commit 38389f5, 2026-09-24).
 * Ids, titles, years and rights are the app's; if the two ever differ, the
 * app wins. WEB-FEAT-018 (the `lib/palm` sync) will replace this hand copy.
 *
 * `rights: 'unknown'` books are cited for facts only: never quoted.
 * The app's placeholder "Hast Rekha Shastra (general tradition)" is not a
 * book and is deliberately missing, so a guide cannot cite it.
 */

export interface Book {
  author: string;
  title: string;
  year: number;
  rights: 'public_domain' | 'unknown';
  /** Language of the book when it is not English. */
  language?: 'fr' | 'hi';
}

export const BOOKS = {
  'cheiro-palmistry-for-all-1916': { author: 'Cheiro', title: 'Palmistry for All', year: 1916, rights: 'public_domain' },
  'cheiro-language-of-the-hand-1900': {
    author: 'Cheiro',
    title: 'Cheiro’s Language of the Hand',
    year: 1900,
    rights: 'public_domain',
  },
  'cheiro-guide-to-the-hand-1900': { author: 'Cheiro', title: 'Cheiro’s Guide to the Hand', year: 1900, rights: 'public_domain' },
  'markun-what-you-should-know-about-palmistry-1927': {
    author: 'Leo Markun',
    title: 'What You Should Know About Palmistry',
    year: 1927,
    rights: 'public_domain',
  },
  'dale-indian-palmistry-1895': { author: 'Mrs J. B. Dale', title: 'Indian Palmistry', year: 1895, rights: 'public_domain' },
  'frith-practical-palmistry-1895': { author: 'Henry Frith', title: 'Practical Palmistry', year: 1895, rights: 'public_domain' },
  'heron-allen-manual-of-cheirosophy-1885': {
    author: 'Edward Heron-Allen',
    title: 'A Manual of Cheirosophy',
    year: 1885,
    rights: 'public_domain',
  },
  'heron-allen-practical-cheirosophy-1887': {
    author: 'Edward Heron-Allen',
    title: 'Practical Cheirosophy',
    year: 1887,
    rights: 'public_domain',
  },
  'desbarrolles-chiromancie-nouvelle-1859': {
    author: 'Adolphe Desbarrolles',
    title: 'Chiromancie nouvelle',
    year: 1859,
    rights: 'public_domain',
    language: 'fr',
  },
  'benham-laws-of-scientific-hand-reading-1900': {
    author: 'William G. Benham',
    title: 'The Laws of Scientific Hand Reading',
    year: 1900,
    rights: 'unknown',
  },
  'raphael-cheirosophy-1901': { author: 'Albert Raphael', title: 'Cheirosophy', year: 1901, rights: 'unknown' },
  'saint-germain-practice-of-palmistry-1900': {
    author: 'Comte C. de Saint-Germain',
    title: 'The Practice of Palmistry for Professional Purposes',
    year: 1900,
    rights: 'unknown',
  },
  'st-hill-grammar-of-palmistry-1893': {
    author: 'Katharine St. Hill',
    title: 'The Grammar of Palmistry',
    year: 1893,
    rights: 'unknown',
  },
  'williams-key-to-palmistry-1902': { author: 'Louis Williams', title: 'Key to Palmistry', year: 1902, rights: 'unknown' },
  'jain-samudrik-shastra-1927': {
    author: 'Chhotelal Jain',
    title: 'Samudrik Shastra ya Bhagya Nirnay',
    year: 1927,
    rights: 'unknown',
    language: 'hi',
  },
} as const satisfies Record<string, Book>;

export type BookId = keyof typeof BOOKS;

export function isBookId(id: string): id is BookId {
  return Object.hasOwn(BOOKS, id);
}

/** "Cheiro, Palmistry for All (1916)": the short form used on source chips. */
export function bookLabel(id: BookId): string {
  const book: Book = BOOKS[id];
  return `${book.author}, ${book.title} (${book.year})`;
}
