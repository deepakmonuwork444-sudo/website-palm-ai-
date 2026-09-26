// COPIED from palm-ai-new--feat-m1-foundation/src/features/knowledge/rules.ts at app commit 38389f51b74d (2026-09-26).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import { CORPUS_RULES } from './corpus-rules';
import { SEED_RULES } from './seed-rules';
import type { KbRule } from './types';

/**
 * The rules a reading actually runs on.
 *
 * Book-cited corpus rules replace the seed rules for the same features. A
 * seed rule is dropped here once a corpus rule covers its feature, rather than
 * the two being reported side by side: the seed rule's source was never
 * checked, and some of its wording turned out not to match what the books say
 * (the seed "absent fate line means independence" has no support in any
 * downloaded source).
 *
 * `SEED_RULES` itself is left untouched so the engine tests that exercise it
 * keep testing the engine, not the knowledge.
 */
export const SUPERSEDED_SEED_RULE_IDS: ReadonlySet<string> = new Set([
  // head line, life line and mounts — superseded 2026-09-15 (second extraction)
  'head-long',
  'head-short',
  'head-straight',
  'head-curved',
  'head-broken',
  'head-fork',
  'head-long-curved',
  'life-deep',
  'life-curved',
  'life-straight',
  'life-short-wc',
  'life-short-ihr',
  'mount-venus-raised',
  'mount-jupiter-raised',
  'mount-luna-raised',
  'mount-mercury-raised',
  // heart and fate lines — superseded 2026-09-15 (first extraction)
  'heart-deep',
  'heart-faint',
  'heart-end-jupiter',
  'heart-end-saturn',
  'heart-branches-up',
  'heart-deep-jupiter',
  'fate-present',
  'fate-absent',
  'fate-start-luna',
]);

export const KNOWLEDGE_RULES: KbRule[] = [
  ...CORPUS_RULES,
  ...SEED_RULES.filter((rule) => !SUPERSEDED_SEED_RULE_IDS.has(rule.ruleId)),
];
