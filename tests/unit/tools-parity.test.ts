import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { PROVENANCE_CAVEAT, type LineFinder } from '../../src/lib/tools/finder';
import { FATE_FINDER } from '../../src/lib/tools/lines/fate';
import { HEAD_FINDER } from '../../src/lib/tools/lines/head';
import { HEART_FINDER } from '../../src/lib/tools/lines/heart';
import { LIFE_FINDER } from '../../src/lib/tools/lines/life';
import { MAP_SPOTS } from '../../src/lib/tools/palm-map';

/**
 * Parity with the app's rule set (tool-page verify checklist: "every result
 * text equals the rule meaning"). Compares the finders' hand-copied rules with
 * the synced copy of the app's corpus rules (src/lib/reading/palm, WEB-FEAT-018),
 * when that copy is present in the checkout.
 */
const corpusPath = fileURLToPath(new URL('../../src/lib/reading/palm/features/knowledge/corpus-rules.ts', import.meta.url));
const FINDERS: LineFinder[] = [HEART_FINDER, HEAD_FINDER, LIFE_FINDER, FATE_FINDER];

interface AppRule {
  ruleId: string;
  interpretation: { meaning: string; caveat: string | null };
  citations?: { sourceId: string; locator: string }[];
  conditions: { path: string }[];
}

describe.skipIf(!existsSync(corpusPath))('finder rules match the app corpus rules', async () => {
  const { CORPUS_RULES } = (await import(/* @vite-ignore */ corpusPath)) as { CORPUS_RULES: AppRule[] };
  const byId = new Map(CORPUS_RULES.map((rule) => [rule.ruleId, rule]));

  for (const finder of FINDERS) {
    it(`${finder.line}: same ruleIds, meanings word for word, consumer caveats, same books`, () => {
      for (const rule of finder.rules) {
        const app = byId.get(rule.id);
        expect(app, rule.id).toBeDefined();
        if (!app) continue;
        expect(rule.meaning).toBe(app.interpretation.meaning);
        const appCaveat = app.interpretation.caveat;
        if (appCaveat && !PROVENANCE_CAVEAT.test(appCaveat)) expect(rule.caveat, rule.id).toBe(appCaveat);
        else expect(rule.caveat, rule.id).toBeNull();
        expect(rule.cites.map((cite) => cite.book)).toEqual((app.citations ?? []).map((cite) => cite.sourceId));
        expect(rule.when).toHaveLength(app.conditions.length);
      }
    });
  }

  it('palm map book lines are the app rule meanings', () => {
    for (const spot of MAP_SPOTS) {
      if (!spot.ruleId) continue;
      expect(byId.get(spot.ruleId)?.interpretation.meaning, spot.ruleId).toBe(spot.book);
    }
  });
});
