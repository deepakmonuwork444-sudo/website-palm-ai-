// COPIED from palm-ai-new--feat-m1-foundation/src/features/knowledge/line-notes.ts at app commit fbc2232d837f (2026-09-30).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import type { LineType } from '../observation/taxonomy';

import type { RuleCitation } from './types';

/**
 * What the books say about a line when NO rule may be shown for it.
 *
 * A line with no rule should not look like a gap nobody looked into. Where the
 * books were read and everything they say is refused by the product safety
 * rules, the report says so, and names the books — so "no meaning" is a
 * decision on file, not a missing feature.
 *
 * Every citation here is backed by refused passages in `BLOCKED_CLAIMS`
 * (tools/extract/citations.ts), found in the downloaded books by a test.
 */

export interface LineBookNote {
  en: string;
  hi: string;
  cites: RuleCitation[];
}

export const LINE_BOOK_NOTES: Partial<Record<LineType, LineBookNote>> = {
  mercury: {
    en: 'The old books read the Mercury line (also called the Hepatica or health line) almost only as a sign of digestion, illness and health. Palm lines are not a health test, so no meaning is given for it.',
    hi: 'पुरानी किताबें बुध रेखा (जिसे स्वास्थ्य रेखा भी कहते हैं) को लगभग सिर्फ़ पाचन, बीमारी और सेहत का संकेत मानती हैं। हाथ की रेखाएँ सेहत की जाँच नहीं हैं, इसलिए इसका कोई अर्थ नहीं बताया गया।',
    cites: [
      { sourceId: 'cheiro-palmistry-for-all-1916', locator: 'Part I, ch. X — The Line of Health or Hepatica' },
      { sourceId: 'cheiro-language-of-the-hand-1900', locator: 'Part II, ch. XIII — The Line of Health, or the Hepatica' },
      { sourceId: 'markun-what-you-should-know-about-palmistry-1927', locator: 'the Hepatica or Health Line' },
      { sourceId: 'benham-laws-of-scientific-hand-reading-1900', locator: 'Part II, ch. XII — The Line of Mercury' },
    ],
  },
};
