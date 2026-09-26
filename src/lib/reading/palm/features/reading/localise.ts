// COPIED from palm-ai-new--feat-m1-foundation/src/features/reading/localise.ts at app commit 38389f51b74d (2026-09-26).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import { KNOWLEDGE_RULES } from '../knowledge/rules';
import type { KbRule } from '../knowledge/types';

import type { ReadingReport, ReportEvidenceLine } from './writer';

/**
 * Prepares a stored report for display, at render time.
 *
 * A report is saved as English prose plus the id of every rule behind it —
 * on the phone and on the server alike. Nothing here changes what was saved:
 * old readings open exactly as before, and the lookups below only ever swap
 * in text a person has checked.
 *
 * Two decisions are made from the CURRENT rules rather than from the stored
 * report, so both follow the review as it progresses:
 *
 * - Hindi. A paragraph, caveat or evidence line is shown in Hindi only when
 *   its rule is `human_reviewed`, its Hindi is `hindiReviewed`, and the stored
 *   English is still word for word the rule's English — so the Hindi always
 *   translates what the report actually said. Anything else stays English,
 *   as it always has.
 * - Provisional. The notice shows while any rule behind the report is not
 *   human-reviewed, is unknown (a retired seed rule), or has changed its
 *   wording since the report was written.
 *
 * No React Native imports: unit-tested in Node.
 */

export type ReportLang = 'en' | 'hi';

export interface PresentedReport {
  report: ReadingReport;
  /** Hindi was asked for, but some interpretation is still shown in English. */
  untranslated: boolean;
}

/** Hindi for this rule may be shown: the rule and its Hindi are both checked. */
export function hindiIsVerified(rule: KbRule): boolean {
  return (
    rule.validationStatus === 'human_reviewed' &&
    rule.hindiReviewed === true &&
    Boolean(rule.interpretation.meaningHi)
  );
}

function rulesById(rules: readonly KbRule[]): Map<string, KbRule> {
  return new Map(rules.map((rule) => [rule.ruleId, rule]));
}

/** The rule behind an evidence line, only if it still says what the report says. */
function currentRule(entry: ReportEvidenceLine, byId: Map<string, KbRule>): KbRule | null {
  const rule = byId.get(entry.ruleId);
  return rule && rule.interpretation.meaning === entry.meaning ? rule : null;
}

export function isReportProvisional(report: ReadingReport, rules: readonly KbRule[] = KNOWLEDGE_RULES): boolean {
  const byId = rulesById(rules);
  return report.sections.some((section) =>
    section.evidence.some((entry) => currentRule(entry, byId)?.validationStatus !== 'human_reviewed'),
  );
}

export function presentReport(
  report: ReadingReport,
  lang: ReportLang,
  rules: readonly KbRule[] = KNOWLEDGE_RULES,
): PresentedReport {
  const byId = rulesById(rules);
  const provisional = isReportProvisional(report, rules);
  if (lang !== 'hi') return { report: { ...report, provisional }, untranslated: false };

  let untranslated = false;
  const sections = report.sections.map((section) => {
    const verified = section.evidence
      .map((entry) => currentRule(entry, byId))
      .filter((rule): rule is KbRule => rule !== null && hindiIsVerified(rule));

    const paragraphs = section.paragraphs.map((paragraph) => {
      const hi = verified.find((rule) => rule.interpretation.meaning === paragraph)?.interpretation.meaningHi;
      if (hi) return hi;
      untranslated = true;
      return paragraph;
    });

    const caveats = section.caveats.map((caveat) => {
      const hi = verified.find((rule) => rule.interpretation.caveat === caveat)?.interpretation.caveatHi;
      if (hi) return hi;
      untranslated = true;
      return caveat;
    });

    const evidence = section.evidence.map((entry) => {
      const rule = currentRule(entry, byId);
      const hi = rule && hindiIsVerified(rule) ? rule.interpretation.meaningHi : undefined;
      return hi ? { ...entry, meaning: hi } : entry;
    });

    return { ...section, paragraphs, caveats, evidence };
  });

  return { report: { ...report, provisional, sections }, untranslated };
}
