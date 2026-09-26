// WEB SHIM for palm-ai-new--feat-m1-foundation/src/i18n/index.ts — written by scripts/sync-palm-lib.mjs, not copied.
// The app version needs React Native; the copied files only use what is below.

export type Lang = 'en' | 'hi';

export interface Bilingual {
  en: string;
  hi: string;
}

export function pick(lang: Lang, en: string, hi: string): string {
  return lang === 'hi' ? hi : en;
}

export function pickB(lang: Lang, text: Bilingual): string {
  return lang === 'hi' ? text.hi : text.en;
}
