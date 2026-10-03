/**
 * The home page's sample reading, built at BUILD TIME by the app's own
 * reading engine (the verbatim copy in src/lib/reading/palm, ARCHITECTURE.md F7)
 * from a STORED REAL scan (src/lib/reading/mock/: the app's palm4_v2 scan of a
 * real palm photo, 2026-09-20). Nothing here is written by hand: every sentence
 * the home page quotes is what the reading screen would show for that palm.
 *
 * The synthesis is locked with the same rule as a free web reading
 * (lockSynthesis + FREE_LOCKED_SECTIONS) before anything is read from it, so a
 * locked part can only ever show its real first sentence (DEC-038/042).
 *
 * Server-side only (Astro frontmatter). Never import this from client code.
 */

import type { Locale } from '../../config/site';
import goldenInput from '../reading/mock/golden-input.json';
import scanResponse from '../reading/mock/scan-response.json';
import visionOutput from '../reading/mock/vision-output.json';
import type { FinishedSynthesis } from '../reading/palm/features/knowledge/synthesis/modules';
import type { LineServiceResponse } from '../reading/palm/features/lines/types';
import type { VisionOutput } from '../reading/palm/features/observation/schema';
import { FREE_LOCKED_SECTIONS, lockSynthesis } from '../reading/palm/features/reading/access';
import { runReading, type ReadingInput } from '../reading/palm/features/reading/pipeline';
import { buildReportView, type ReportView } from '../reading/report';

let locked: Promise<FinishedSynthesis> | null = null;

async function lockedSynthesis(): Promise<FinishedSynthesis> {
  const input = goldenInput.reading as unknown as Omit<ReadingInput, 'provider' | 'lineScan'>;
  const outcome = await runReading({
    ...input,
    lineScan: { status: 'ok', response: structuredClone(scanResponse) as unknown as LineServiceResponse, latencyMs: 0 },
    provider: {
      id: goldenInput.provider.id,
      model: goldenInput.provider.model,
      version: goldenInput.provider.version,
      runsOnDevice: false,
      extract: async () => ({ output: structuredClone(visionOutput) as unknown as VisionOutput, latencyMs: 0, costUnits: null }),
    },
  });
  if (!outcome.synthesis) throw new Error('sample-reading: the stored scan produced no synthesis');
  return lockSynthesis(outcome.synthesis as FinishedSynthesis, FREE_LOCKED_SECTIONS);
}

/** What the free reading screen shows for the stored real scan, in `locale`. */
export async function sampleReport(locale: Locale): Promise<ReportView> {
  locked ??= lockedSynthesis();
  return buildReportView(await locked, locale);
}

/** The four parts' first sentences, in report order: the home page's curiosity cards. */
export interface SampleTeasers {
  love: string | null;
  personality: string | null;
  careerMoney: string | null;
  direction: string | null;
}

const first = (text: string | undefined | null): string | null => {
  if (!text) return null;
  const match = text.match(/^.+?[.!?।](?=\s|$)/u);
  return (match ? match[0] : text).trim();
};

export async function sampleTeasers(locale: Locale): Promise<SampleTeasers> {
  const view = await sampleReport(locale);
  const open = (key: string) => {
    const section = view.open.find((s) => s.key === key);
    return first(section?.parts.find((p) => p.summary)?.summary ?? section?.teaser);
  };
  const lockedPart = (key: string) => view.locked.find((p) => p.key === key)?.sentence ?? null;
  return {
    love: open('love'),
    personality: open('personality'),
    careerMoney: lockedPart('career-money'),
    direction: lockedPart('direction'),
  };
}
