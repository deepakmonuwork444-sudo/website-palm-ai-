// COPIED from palm-ai-new--feat-m1-foundation/src/components/deep-report/access.ts at app commit fbc2232d837f (2026-09-30).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import type { DeepLineType, DeepReport, Point } from '../../features/deep-report/types';

/**
 * Reads the deep report off a reading outcome without trusting its shape.
 *
 * `deep` is attached by generation and persisted with saved readings, so an
 * older build, a partial write or a future version can leave something here
 * the screen cannot draw. Anything unusable falls back to the classic report
 * instead of crashing it; optional lists default to empty.
 */

const isRecord = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v);
const isBi = (v: unknown): boolean => isRecord(v) && typeof v.en === 'string' && typeof v.hi === 'string';
const list = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const EMPTY_BI = { en: '', hi: '' };

/** Line types the screen has a colour and a name for; anything else would crash a lookup. */
const LINE_TYPES: ReadonlySet<string> = new Set<DeepLineType>(['life', 'head', 'heart', 'fate', 'sun', 'mercury']);
const isLineType = (v: unknown): v is DeepLineType => typeof v === 'string' && LINE_TYPES.has(v);
const SCAN_RESULTS: ReadonlySet<unknown> = new Set(['traced', 'unidentified', 'not_found']);
/** An optional `line` that is not a known type is dropped rather than looked up. */
function knownLine<T extends { line?: unknown }>(item: T): T {
  if (item.line === undefined || isLineType(item.line)) return item;
  const rest = { ...item };
  delete rest.line;
  return rest;
}

export function deepReportOf(outcome: unknown): DeepReport | null {
  if (!isRecord(outcome)) return null;
  const deep = outcome.deep;
  if (!isRecord(deep) || deep.version !== 1) return null;
  // A report whose written parts all failed still has the traced lines, photo
  // and scores, which are worth showing next to the retry.
  const sections = list<Record<string, unknown>>(deep.sections)
    .filter((s) => isRecord(s) && typeof s.id === 'string' && isBi(s.title) && Array.isArray(s.observations))
    .map((s) => ({
      ...s,
      intro: isBi(s.intro) ? s.intro : EMPTY_BI,
      observations: list<Record<string, unknown>>(s.observations)
        .filter(
          (o) =>
            isRecord(o) &&
            typeof o.id === 'string' &&
            isBi(o.feature) &&
            isBi(o.location) &&
            isBi(o.traditional) &&
            isBi(o.personal) &&
            typeof o.confidence === 'number',
        )
        .map(knownLine),
    }));
  const report = deep as unknown as DeepReport;
  const scan = isRecord(deep.scanQuality) && isRecord(deep.scanQuality.metrics) && Array.isArray(deep.scanQuality.lines) ? report.scanQuality : undefined;
  return {
    ...report,
    generatedAt: typeof deep.generatedAt === 'string' ? deep.generatedAt : '',
    summary: isBi(deep.summary) ? report.summary : { en: '', hi: '' },
    photoUri: typeof deep.photoUri === 'string' && deep.photoUri.length > 0 ? deep.photoUri : null,
    photoAspect: typeof deep.photoAspect === 'number' && deep.photoAspect > 0 ? deep.photoAspect : null,
    lines: list<DeepReport['lines'][number]>(deep.lines)
      .filter((l) => isRecord(l) && isLineType(l.type) && Array.isArray(l.path))
      .map((l) => ({ ...l, start: isBi(l.start) ? l.start : EMPTY_BI, end: isBi(l.end) ? l.end : EMPTY_BI })),
    sections: sections as unknown as DeepReport['sections'],
    strengths: list<DeepReport['strengths'][number]>(deep.strengths).filter(isBi),
    challenges: list<DeepReport['challenges'][number]>(deep.challenges).filter(isBi),
    mindMap: list<DeepReport['mindMap'][number]>(deep.mindMap)
      .filter((m) => isRecord(m) && isBi(m.theme) && isBi(m.feature) && isBi(m.interpretation))
      .map(knownLine),
    featureScores: list<DeepReport['featureScores'][number]>(deep.featureScores)
      .filter((f) => isRecord(f) && isBi(f.label) && typeof f.value === 'number')
      .map(knownLine),
    disclaimer: isBi(deep.disclaimer) ? report.disclaimer : { en: '', hi: '' },
    overall: isBi(deep.overall) ? report.overall : undefined,
    scanQuality: scan
      ? { ...scan, lines: scan.lines.filter((l) => isRecord(l) && isLineType(l.type) && SCAN_RESULTS.has(l.result)) }
      : undefined,
    notAnalysed: list<unknown>(deep.notAnalysed).filter(isLineType),
  };
}

/** Catmull-Rom through the traced points as cubic Béziers: a hand-drawn line, not a polyline. */
export function smoothPath(points: readonly Point[]): string {
  const first = points[0];
  if (!first) return '';
  const r = (n: number) => Math.round(n * 10) / 10;
  let d = `M${r(first[0])} ${r(first[1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p0 = points[i - 1] ?? p1;
    const p3 = points[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${r(c1x)} ${r(c1y)} ${r(c2x)} ${r(c2y)} ${r(p2[0])} ${r(p2[1])}`;
  }
  return d;
}
