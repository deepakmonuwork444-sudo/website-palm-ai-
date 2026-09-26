/**
 * Every rule id in the app's rule set (`CORPUS_RULES` in the app repo's
 * `src/features/knowledge/corpus-rules.ts`, commit 38389f5, 2026-09-24;
 * 110 rules, all still `draft` there).
 *
 * A guide lists the rules its meanings come from in `ruleIds`, and a unit
 * test fails on an id that is not here (CONTENT_GUIDE.md §9.3), so a guide
 * can't cite a rule the app doesn't have. Snapshot until WEB-FEAT-018 syncs
 * `lib/palm`; when the app's rules change, refresh this list and re-check the
 * guides whose rules changed.
 */
export const APP_RULE_IDS: readonly string[] = [
  'cx-heart-end-index', 'cx-heart-end-between', 'cx-heart-end-middle', 'cx-heart-short', 'cx-heart-deep',
  'cx-heart-faint', 'cx-heart-chained', 'cx-heart-fork', 'cx-heart-branches-up', 'cx-heart-long-continuous-dale',
  'cx-heart-short-dale', 'cx-heart-broken-dale', 'cx-fate-start-luna', 'cx-fate-start-plain-of-mars',
  'cx-fate-start-wrist', 'cx-fate-start-venus', 'cx-fate-end-index', 'cx-fate-end-ring', 'cx-fate-end-little',
  'cx-fate-end-middle-dale', 'cx-fate-continuous-middle-dale', 'cx-fate-broken', 'cx-fate-deep', 'cx-fate-faint',
  'cx-fate-absent', 'cx-sun-present', 'cx-sun-absent', 'cx-sun-fork', 'cx-sun-deep', 'cx-sun-start-luna',
  'cx-sun-start-plain-of-mars', 'cx-sun-straight-continuous-dale', 'cx-sun-broken-dale', 'cx-head-straight',
  'cx-head-gentle', 'cx-head-curved', 'cx-head-long', 'cx-head-short', 'cx-head-deep', 'cx-head-chained',
  'cx-head-fork', 'cx-head-fork-luna', 'cx-head-faint', 'cx-head-broken', 'cx-head-clear-dale',
  'cx-head-start-index', 'cx-head-start-thumb-mars', 'cx-head-end-luna', 'cx-head-end-little',
  'cx-head-end-outer-mars', 'cx-head-end-middle', 'cx-head-end-ring', 'cx-head-joined-life',
  'cx-head-separate-life', 'cx-head-wide-life', 'cx-life-start-index', 'cx-life-start-thumb-mars',
  'cx-life-curved', 'cx-life-straight', 'cx-life-deep', 'cx-life-broken', 'cx-life-short', 'cx-life-end-luna',
  'cx-life-long', 'cx-life-faint', 'cx-life-chained', 'cx-mount-venus-raised', 'cx-mount-venus-flat',
  'cx-mount-jupiter-raised', 'cx-mount-saturn-raised', 'cx-mount-saturn-flat', 'cx-mount-apollo-raised',
  'cx-mount-mercury-raised', 'cx-mount-luna-raised', 'cx-mount-luna-flat', 'cx-mount-mars-thumb-raised',
  'cx-mount-mars-outer-raised', 'cx-mount-venus-raised-dale', 'cx-mount-venus-flat-dale',
  'cx-mount-saturn-raised-dale', 'cx-mount-apollo-raised-dale', 'cx-mount-luna-raised-dale',
  'cx-mount-mars-outer-raised-dale', 'cx-mount-mars-outer-flat-dale', 'cx-mount-luna-flat-steady',
  'cx-mount-luna-flat-dale', 'cx-heart-long', 'cx-heart-long-index', 'cx-heart-end-index-ideal',
  'cx-heart-end-between-practical', 'cx-heart-end-middle-physical', 'cx-heart-index-continuous',
  'cx-heart-long-jain', 'cx-heart-fork-jain', 'cx-head-end-outer-mars-practical', 'cx-head-open-mars',
  'cx-head-joined-life-advice', 'cx-head-joined-life-shy', 'cx-head-joined-life-dale',
  'cx-head-separate-life-confident', 'cx-head-long-even', 'cx-head-long-straight', 'cx-head-straight-settled',
  'cx-head-gentle-level', 'cx-head-curved-artistic', 'cx-life-end-wrist-settled', 'cx-life-straight-reserved',
  'cx-life-wide-warm', 'cx-fate-wrist-middle', 'cx-fate-broken-jain',
];
