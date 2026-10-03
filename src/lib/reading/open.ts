/**
 * Build time: can a visitor finish a palm scan on this build? The home page's
 * gold action says what it really does (audit 2026-09-26: the words must match
 * the destination). Production follows site.webReadingEnabled only; a preview
 * (including `astro dev`) may run the mock or live reading via PUBLIC_READING_MODE.
 */
import { isPreview } from '../../config/env';
import { playStoreUrl, site, type Locale } from '../../config/site';
import { resolveReadingMode } from './config';

export const webScanOpen =
  resolveReadingMode({ flag: site.webReadingEnabled, preview: isPreview, env: import.meta.env.PUBLIC_READING_MODE }) !== 'off';

/**
 * A page's "scan my palm" action. While the web scan is open: /reading/ (Hindi via ?lang=hi).
 * While it is closed: the Play listing with a utm referrer (playStoreUrl), so the button's
 * words can say "in the app" and still lead somewhere a visitor can finish a reading.
 */
export function scanAction(locale: Locale, placement: { medium: string; campaign: string }): { href: string; app: boolean } {
  if (webScanOpen) return { href: locale === 'hi' ? '/reading/?lang=hi' : '/reading/', app: false };
  return { href: playStoreUrl({ ...placement, locale }), app: true };
}
