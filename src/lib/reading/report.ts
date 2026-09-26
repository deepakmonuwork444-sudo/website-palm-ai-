/**
 * What the report screen renders, built only from the LOCKED synthesis
 * (lockSynthesis, applied before the reading is stored). Love and Personality
 * in full; Career & Money and Life Direction as their title + real first
 * sentence (DEC-038). Every word is the app's own (report-sections.ts,
 * access.ts), so the web and the app say the same thing.
 */

import type { Locale } from '../../config/site';
import type { Balance, WebUser } from './api';
import type { FinishedSynthesis } from './palm/features/knowledge/synthesis/modules';
import { FREE_LOCKED_SECTIONS, FREE_OPEN_SECTIONS, lockedTeaser } from './palm/features/reading/access';
import { STATE_WORDS, glanceBullets, reportSection, type ReportSectionView, type SectionKey } from './palm/features/reading/report-sections';

export interface LockedPart {
  key: SectionKey;
  title: string;
  /** The part's real first sentence (null when the palm had nothing clear to say there). */
  sentence: string | null;
}

export interface ReportView {
  glance: { label: string; text: string }[];
  open: (ReportSectionView & { stateWord: string })[];
  locked: LockedPart[];
}

/** What the page offers next, from the server's balance (never counted here, F4). */
export type NextStep = 'signup' | 'another' | 'app';

export function nextStep(balance: Balance | null, user: WebUser | null): NextStep {
  if (balance) {
    if (balance.freeNow > 0) return 'another';
    if (balance.emailNeeded) return 'signup';
    return 'app';
  }
  return user && !user.isGuest ? 'app' : 'signup';
}

export function buildReportView(synthesis: FinishedSynthesis, locale: Locale): ReportView {
  return {
    glance: glanceBullets(synthesis, locale),
    open: FREE_OPEN_SECTIONS.map((key) => {
      const view = reportSection(synthesis, key, locale);
      return { ...view, stateWord: locale === 'hi' ? STATE_WORDS[view.state].hi : STATE_WORDS[view.state].en };
    }),
    locked: FREE_LOCKED_SECTIONS.map((key) => ({ key, ...lockedTeaser(synthesis, key, locale) })),
  };
}
