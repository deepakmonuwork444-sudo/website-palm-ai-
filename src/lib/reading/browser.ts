/** Small browser facts for the reading screen (pure, unit-tested). */

import type { Locale } from '../../config/site';

/**
 * WhatsApp, Instagram and Facebook open links in their own browser, where
 * uploads often fail — and where Google does not allow sign-in (embedded
 * webviews, WEB_AUTH_PLAN.md case 7). `; wv)` is the generic Android WebView
 * marker. Chrome Custom Tabs (what WhatsApp on Android often uses) carry
 * Chrome's own user agent, so they are NOT caught here and Google works there.
 */
export function isInAppBrowser(userAgent: string): boolean {
  return /\bFBAN|\bFBAV|FB_IAB|Instagram|WhatsApp|\bLine\/|Snapchat|; wv\)/i.test(userAgent);
}

/** The reading follows the page the visitor came from, or ?lang=hi (one route for both, ARCHITECTURE.md §6). */
export function readingLocale(input: { search: string; referrer: string; stored: string | null }): Locale {
  const query = new URLSearchParams(input.search).get('lang');
  if (query === 'hi' || query === 'en') return query;
  if (input.stored === 'hi' || input.stored === 'en') return input.stored;
  try {
    if (input.referrer && /^\/hi(\/|$)/.test(new URL(input.referrer).pathname)) return 'hi';
  } catch {
    // Not a URL: English.
  }
  return 'en';
}
