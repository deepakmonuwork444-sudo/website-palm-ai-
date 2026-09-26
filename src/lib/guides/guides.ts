import type { Locale } from '../../config/site';

/**
 * Helpers for the guide template (CONTENT_GUIDE.md §5): the 7-step path,
 * small inline markdown for front-matter text (FAQ answers, quick facts),
 * and word counts. Pure functions only, so unit tests can import them.
 */

export interface GuideStep {
  n: number;
  /** English path; Hindi reuses the slug under /hi/. */
  path: string;
  label: { en: string; hi: string };
}

/** The 7 core steps (CONTENT_GUIDE.md §5 block 17). Steps 2 and 7 are P2/P3 pages. */
export const STEPS: readonly GuideStep[] = [
  { n: 1, path: '/which-hand-to-read/', label: { en: 'Choose which hand to read', hi: 'कौन-सा हाथ देखें' } },
  { n: 2, path: '/hand-types/', label: { en: 'Find your hand shape', hi: 'हाथ का आकार' } },
  { n: 3, path: '/heart-line/', label: { en: 'The heart line', hi: 'हृदय रेखा' } },
  { n: 4, path: '/head-line/', label: { en: 'The head line', hi: 'मस्तिष्क रेखा' } },
  { n: 5, path: '/life-line/', label: { en: 'The life line', hi: 'जीवन रेखा' } },
  { n: 6, path: '/fate-line/', label: { en: 'The fate line', hi: 'भाग्य रेखा' } },
  { n: 7, path: '/palm-mounts/', label: { en: 'Mounts and signs', hi: 'पर्वत और चिह्न' } },
];

/** The nearest live step before and after step `n`. */
export function stepNeighbours(n: number, isLive: (path: string) => boolean): { prev?: GuideStep; next?: GuideStep } {
  const before = STEPS.filter((step) => step.n < n && isLive(step.path)).at(-1);
  const after = STEPS.find((step) => step.n > n && isLive(step.path));
  return { ...(before ? { prev: before } : {}), ...(after ? { next: after } : {}) };
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Tiny, trusted inline markdown for our own front-matter strings:
 * `[text](/path/)`, `**bold**` and `*italic*`. Everything else is escaped.
 * Links must be root-relative or https (check-web then checks they resolve).
 */
export function inlineMarkdown(text: string, locale: Locale = 'en'): string {
  const html = escapeHtml(text)
    .replace(/\[([^\]]+)\]\(((?:\/|https:\/\/)[^)\s]*)\)/g, (_m, label: string, href: string) => {
      const external = href.startsWith('https://');
      return `<a class="text-link" href="${href}"${external ? ' rel="noopener"' : ''}>${label}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  return locale === 'en' ? html.replace(DEVANAGARI_RUN, (run) => `<span lang="hi" class="script-system">${run}</span>`) : html;
}

/**
 * A run of Devanagari words (with the spaces and danda between them). On an
 * English page it gets `lang="hi"` and the system font, so the page never
 * downloads a Devanagari web font (DESIGN_SYSTEM.md §3.2).
 */
const DEVANAGARI_RUN = /[ऀ-ॿ]+(?:[\s।॥-]+[ऀ-ॿ]+)*/g;

/** The same string as plain text (for JSON-LD, which must match the visible words). */
export function plainText(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1$2');
}

/** Words in a text, as a reader counts them (Latin or Devanagari). */
export function wordCount(text: string): number {
  return (text.match(/[\p{L}\p{N}][\p{L}\p{M}\p{N}'’-]*/gu) ?? []).length;
}

/** "26 September 2026" / "26 सितंबर 2026" from YYYY-MM-DD, without time-zone drift. */
export function formatDate(iso: string, locale: Locale): string {
  const [year, month, day] = iso.split('-').map(Number);
  const months = {
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    hi: ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'],
  }[locale];
  return `${day} ${months[(month ?? 1) - 1]} ${year}`;
}

/** ISO date with the India offset for schema.org (SEO_PLAYBOOK.md §6). */
export function isoWithOffset(iso: string): string {
  return `${iso}T09:00:00+05:30`;
}
