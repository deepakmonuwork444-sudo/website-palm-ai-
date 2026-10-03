/**
 * Palm lines for the photo tools (line finder, left vs right): the reading
 * API's scan step only (src/lib/reading/api.ts, frozen contract F6), no
 * report, no reading used.
 *
 * - off: the default and production today. The server's lines-only mode
 *   (WEB-SRV-004 `lines_only` + `web_scan` cap, D19) does not exist, and the
 *   reading's own session (`start_web_reading`) would spend a free reading
 *   slot, so the pages say "opens soon" and upload nothing.
 * - mock: previews and tests (`?reading=mock` on a preview build). The mock
 *   API answers with its STORED sample scan (the app's scan of its guide
 *   photo), so the lines are not the visitor's: the page labels them
 *   "Preview" in words, every time.
 * - live: only once LINES_ONLY_SERVER is true AND the call below is built;
 *   until then a live config still behaves as off.
 */

import type { HandSide } from '../reading/palm/features/observation/taxonomy';
import type { LineServiceResponse } from '../reading/palm/features/lines/types';
import type { ReadingMode } from '../reading/config';
import { ReadingError, toReadingError, type ReadingErrorCode } from '../reading/errors';
import type { PreparedPhoto } from '../reading/image';
import { LINES_ONLY_SERVER } from './registry';

export type LineMode = 'off' | 'mock' | 'live';
export type LineName = 'life' | 'head' | 'heart' | 'fate';
export const LINE_ORDER: readonly LineName[] = ['life', 'head', 'heart', 'fate'];

export interface TracedLine {
  type: LineName;
  /** Normalised 0–1 points on the scanned photo. */
  path: [number, number][];
}

export type LineScanResult =
  | { status: 'ok'; lines: TracedLine[]; mode: LineMode }
  | { status: 'rejected'; reasons: string[]; mode: LineMode };

export function lineMode(readingMode: ReadingMode, linesOnlyServer: boolean = LINES_ONLY_SERVER): LineMode {
  if (readingMode === 'mock') return 'mock';
  if (readingMode === 'live' && linesOnlyServer) return 'live';
  return 'off';
}

/** The scanner's accepted main lines, as the reading draws them (never a guessed line). */
export function linesFromScan(response: Pick<LineServiceResponse, 'lines'>): TracedLine[] {
  const lines = response.lines;
  if (!lines) return [];
  const out: TracedLine[] = [];
  for (const type of LINE_ORDER) {
    const line = lines[type];
    if (line && line.present && line.label === type && line.polyline.length >= 2) {
      out.push({ type, path: line.polyline.map(([x, y]) => [x, y] as [number, number]) });
    }
  }
  return out;
}

export const LINE_NAMES: Record<LineName, string> = {
  life: 'Life line',
  head: 'Head line',
  heart: 'Heart line',
  fate: 'Fate line',
};

/** What the person reads when the scan step fails (UX_PSYCHOLOGY.md §10: what happened + what to do). */
export function scanErrorText(code: ReadingErrorCode): string {
  switch (code) {
    case 'offline':
      return 'You seem to be offline. Check your connection, then try again.';
    case 'scanner_unavailable':
    case 'server':
    case 'rate_limited':
    case 'too_many_attempts':
      return 'Our line scanner didn’t answer this time. Please try again in a minute.';
    case 'daily_capacity_reached':
    case 'service_paused':
      return 'The line scanner has reached today’s limit. Please try again tomorrow.';
    case 'image_too_large':
      return 'This photo is too large to send. Please take a new photo.';
    default:
      return 'The line scanner isn’t open on this website yet. Nothing was uploaded.';
  }
}

/**
 * Runs the scan step for one photo. Mock: the reading API's own mock, walked
 * through the same steps as the real flow (guest, pass, session, scan).
 * `failOnce` previews an error screen (`?mockError=<code>`).
 */
export async function scanLines(photo: PreparedPhoto, hand: HandSide, mode: LineMode, failOnce: string | null = null): Promise<LineScanResult> {
  if (mode !== 'mock') throw new ReadingError('not_configured', 'lines-only scan not built (WEB-SRV-004)');
  try {
    const { createMockApi } = await import('../reading/api-mock');
    const { newKey } = await import('../reading/api');
    const api = createMockApi(failOnce ? { failOnce, failAt: 'scan' } : {});
    await api.ensureGuest();
    await api.webGate('mock-turnstile-token');
    const session = await api.startWebReading(hand, true, newKey());
    const outcome = await api.scan(session.id, photo.scan.base64, hand);
    if (outcome.status !== 'ok') {
      const reasons = outcome.status === 'rejected' ? outcome.response.quality.reasons.map((reason) => reason.message.en) : [];
      return { status: 'rejected', reasons, mode };
    }
    return { status: 'ok', lines: linesFromScan(outcome.response), mode };
  } catch (caught) {
    throw toReadingError(caught);
  }
}
