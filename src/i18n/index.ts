import type { Locale } from '../config/site';
import { en, type Dictionary } from './en';
import { hi } from './hi';

export * from './locale';
export type { Dictionary };

const dictionaries: Record<Locale, Dictionary> = { en, hi };

/** The typed UI dictionary for a locale. */
export function t(locale: Locale): Dictionary {
  return dictionaries[locale];
}
