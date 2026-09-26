import { LOCALES, type Locale } from '../config/site';

export { LOCALES, type Locale };
export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Ensures a leading slash and, for page paths (no file extension), a trailing slash. */
export function normalizePath(path: string): string {
  let clean = path.split(/[?#]/)[0] || '/';
  if (!clean.startsWith('/')) clean = `/${clean}`;
  clean = clean.replace(/\/{2,}/g, '/');
  const last = clean.split('/').pop() ?? '';
  if (!clean.endsWith('/') && !last.includes('.')) clean = `${clean}/`;
  return clean;
}

/** The page's language from its path: `/hi` and `/hi/...` are Hindi, everything else English. */
export function localeFromPath(pathname: string): Locale {
  return /^\/hi(\/|$)/.test(pathname) ? 'hi' : DEFAULT_LOCALE;
}

/** The English (unprefixed) path of any page: `/hi/app/` → `/app/`, `/hi/` → `/`. */
export function stripLocale(pathname: string): string {
  const path = normalizePath(pathname);
  if (path === '/hi/') return '/';
  return path.startsWith('/hi/') ? path.slice(3) : path;
}

/** The path of an English page in a locale; Hindi reuses the English slug under /hi/. */
export function localizePath(path: string, locale: Locale): string {
  const base = stripLocale(path);
  if (locale === DEFAULT_LOCALE) return base;
  return base === '/' ? `/${locale}/` : `/${locale}${base}`;
}

/** The same page in the other language (the language switch links here). */
export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'hi' : 'en';
}
