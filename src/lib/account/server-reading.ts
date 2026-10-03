/**
 * A reading saved to the account, opened on /account/ (WEB_AUTH_PLAN.md §5.4).
 *
 * The server keeps the observation (palm_observations) and the written report,
 * not the synthesis the web report shows. The synthesis is deterministic, so it
 * is rebuilt here exactly as runReading builds it (same rules, same options),
 * then LOCKED like the web report before anything is returned — a locked part's
 * text never reaches the page. A row that fails the app's own
 * palmObservationSchema is not opened, like the app's fetchServerReading.
 *
 * Loaded with import() only when a saved reading is opened (it brings the
 * palm engine).
 */

import { scanQuality } from '../reading/palm/features/deep-report/normalise';
import { KNOWLEDGE_RULES } from '../reading/palm/features/knowledge/rules';
import { synthesise } from '../reading/palm/features/knowledge/synthesis';
import { hasFinishedReading, type FinishedSynthesis } from '../reading/palm/features/knowledge/synthesis/modules';
import { palmObservationSchema } from '../reading/palm/features/observation/schema';
import { FREE_LOCKED_SECTIONS, lockSynthesis } from '../reading/palm/features/reading/access';

/** The same match options runReading uses on the web (provisional knowledge on, 0.5 minimum). */
const MATCH_OPTIONS = { includeDraftRules: true, minRuleConfidence: 0.5 };

export function lockedServerReading(payload: unknown, generatedAt: string): FinishedSynthesis | null {
  const parsed = palmObservationSchema.safeParse(payload);
  if (!parsed.success) return null;
  const observation = parsed.data;
  let synthesis;
  try {
    synthesis = synthesise(observation, KNOWLEDGE_RULES, {
      generatedAt,
      scanQuality: scanQuality(observation) ?? null,
      matchOptions: MATCH_OPTIONS,
      previous: null,
    });
  } catch {
    return null;
  }
  return hasFinishedReading(synthesis) ? lockSynthesis(synthesis as FinishedSynthesis, FREE_LOCKED_SECTIONS) : null;
}
