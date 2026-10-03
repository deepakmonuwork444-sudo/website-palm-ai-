// COPIED from palm-ai-new--feat-m1-foundation/src/features/lines/merge.ts at app commit fbc2232d837f (2026-09-30).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import type {
  LineEvidence,
  LineObservation,
  LineScanInfo,
  MarkObservation,
  MountObservation,
  VisionOutput,
} from '../observation/schema';
import type { LineType, MajorLineType } from '../observation/taxonomy';
import type { PartialLine } from '../vision/partial';

import { withBand } from './bands';
import { deriveGeometry, type BandInfo, type DerivedGeometry, type TracedLine, type TracedLineInput } from './derived';
import {
  PHASE_ONE_LINES,
  TRACED_LINES,
  type LineScanOutcome,
  type LineServiceResponse,
  type TracedLineType,
  type ServiceLine,
} from './types';

/**
 * Merges the line scanner's measurements with the general vision model's answer.
 *
 * The rules, in one place:
 * - heart, head, life: EVERYTHING geometric comes from the scanner (visible,
 *   path, length, curvature, continuity, depth, zones, breaks, forks,
 *   confidence = pixel x semantic). The model's values for them are discarded.
 * - a scanner label of 'unknown' means the line is not visible under that name.
 * - fate traced by the scanner (palm4 model, additive `lines.fate`, accepted
 *   under its own ontology checks): read exactly like heart / head / life and
 *   preferred over the vision model's words. Otherwise fate falls back to the
 *   AI-description rule below.
 * - fate (untraced), sun, mercury: the scanner does not trace them. Since the
 *   truth gate (2026-09-29, lines/truth.ts) the vision model's words about
 *   them are no longer kept: each is `notAnalysed: true` — not visible,
 *   confidence 0, no rule reads it (not even its absence). Other minor lines
 *   the model volunteered are dropped. (`aiOnlyLine` remains for reference.)
 * - mounts and hand shape: never kept from the model (truth gate). Mounts are
 *   taught from the landmarks; the hand type is measured (features/hand).
 * - model crossings are dropped: their positions were placed by a model that
 *   cannot localise, and a report may point at them on the photo.
 * - scanner unavailable: heart, head, life keep the model's descriptive values,
 *   capped at lower confidence, WITHOUT a path. Nothing is drawn on the photo.
 * - stability bands (DEC-019, lines/bands.ts): the scanner's `length_band` /
 *   `length_alt` and the derived geometry's bands are attached to the
 *   attribute (`band`, `altValue`, `effectiveConfidence` = confidence x
 *   BORDERLINE_FACTOR when borderline). The raw `confidence` is never changed.
 *   Anything only the vision model described carries NO band (`unknown`).
 *
 * Pure: unit-tested in Node.
 */

/** Lines the scanner never traces: read only from the vision model's description, when it gives one. */
export const AI_ONLY_LINES = ['fate', 'sun', 'mercury'] as const satisfies readonly LineType[];
/** @deprecated Use AI_ONLY_LINES. These lines are no longer blanket "not analysed". */
export const NOT_ANALYSED_LINES = AI_ONLY_LINES;
/** The ceiling for anything only the general vision model saw. */
export const MODEL_CONFIDENCE_CAP = 0.6;
const MAX_MARKS = 20;
/**
 * Ceiling on anything the scanner measured but the app does not trust enough
 * to interpret: below every rule's floor (0.55–0.6), so the value is kept and
 * shown but no meaning is read from it.
 */
export const NOT_INTERPRETED_CONFIDENCE = 0.5;
/**
 * The depth proxy (crease contrast) is kept and shown, never read.
 * 2026-09-18 (benchmark/derived-calibration-2026-09-18.md): ontology 2026-09-18.2
 * now puts faint / deep at the bottom / top 20% of 1132 labelled-dataset lines
 * (0.08 / 0.18; before, every line was "deep"). But there is no depth ground
 * truth, and the proxy is mostly the PHOTO, not the line: lines of the same
 * photo correlate 0.56–0.76. Read it only once depth is labelled, or the proxy
 * is made relative to the photo (then set this to false).
 */
export const DEPTH_PROXY_UNCALIBRATED = true;

const round2 = (n: number) => Math.round(Math.min(1, Math.max(0, n)) * 100) / 100;
const round3 = (n: number) => Math.round(n * 1000) / 1000;
const round4 = (n: number) => Math.round(n * 10000) / 10000;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

function unseen(confidence = 0) {
  return { value: null, confidence };
}

export function serviceEvidence(line: ServiceLine): LineEvidence {
  return {
    label: line.label,
    modelClass: line.model_class,
    present: line.present,
    pixelConfidence: round3(line.pixel_confidence),
    semanticConfidence: round3(line.semantic_confidence),
    normalizedLength: line.present ? round3(line.normalized_length) : null,
    lengthClass: line.length_class,
    curvature: line.curvature
      ? {
          chordArcRatio: round3(line.curvature.chord_arc_ratio),
          netTurningDeg: Math.round(line.curvature.net_turning_deg * 10) / 10,
          class: line.curvature.class,
        }
      : null,
    continuity: line.continuity,
    breaks: line.breaks.slice(0, MAX_MARKS).map(([x, y]) => [round3(x), round3(y)]),
    forks: line.forks.slice(0, MAX_MARKS).map(([x, y]) => [round3(x), round3(y)]),
    depthProxy: line.depth_proxy ? { value: round3(line.depth_proxy.value), class: line.depth_proxy.class } : null,
    startZone: line.start_zone,
    endZone: line.end_zone,
    ...(line.partial ? { partial: true } : {}),
    failedChecks: (line.semantic?.checks ?? [])
      .filter((c) => !c.skipped && c.passed === false)
      .map((c) => c.id.slice(0, 60))
      .slice(0, 20),
  };
}

function boundingRegion(path: [number, number][]) {
  const xs = path.map((p) => p[0]);
  const ys = path.map((p) => p[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x: round3(x), y: round3(y), w: round3(Math.max(...xs) - x), h: round3(Math.max(...ys) - y) };
}

const LINE_NAMES: Record<TracedLineType, string> = { heart: 'heart', head: 'head', life: 'life', fate: 'fate' };

/** True when the scanner traced this line and it passed that line's ontology checks. */
export function isAcceptedTrace(type: TracedLineType, line: ServiceLine | undefined): boolean {
  return !!line && line.present && line.label === type && line.polyline.length >= 2;
}

/** The scanner's accepted fate trace, or null (not traced, flagged, or an older / non-palm4 scanner). */
export function tracedFate(response: LineServiceResponse): ServiceLine | null {
  const fate = response.lines?.fate;
  return fate && isAcceptedTrace('fate', fate) ? fate : null;
}

/** One heart, head, life or traced fate line, entirely from the scanner. */
export function lineFromService(type: TracedLineType, line: ServiceLine): LineObservation {
  const evidence = serviceEvidence(line);
  const accepted = isAcceptedTrace(type, line);
  if (!accepted) {
    // Not found, or found but failing the line's definition. Confidence 0: this
    // is "could not read it", never "this person has no heart line".
    return {
      type,
      visible: false,
      confidence: 0,
      length: unseen(),
      depth: unseen(),
      curvature: unseen(),
      continuity: unseen(),
      startZone: unseen(),
      endZone: unseen(),
      marks: [],
      regions: [],
      notes: line.present
        ? `A crease was found where the ${LINE_NAMES[type]} line is expected, but it does not fit that line's definition, so it is not read.`
        : null,
      source: 'line-service',
      evidence,
    };
  }

  const confidence = round2(line.pixel_confidence * line.semantic_confidence);
  const observed = <T>(value: T | null) => (value === null ? unseen() : { value, confidence });
  // Ontology 2026-09-19.2+: the scanner says whether the length is near a cut-off. Older scanners: no band.
  const lengthBand =
    line.length_class !== null && line.length_band ? { band: line.length_band, altValue: line.length_alt ?? null } : null;
  const path = line.polyline.map(([x, y]) => [round3(clamp01(x)), round3(clamp01(y))] as [number, number]);
  const marks: MarkObservation[] = [
    ...evidence.breaks.map((point) => ({ kind: 'break' as const, point })),
    ...evidence.forks.map((point) => ({ kind: 'fork' as const, point })),
  ]
    .slice(0, MAX_MARKS)
    .map(({ kind, point }) => ({
      kind,
      count: 1,
      confidence,
      zone: null,
      region: null,
      point: [clamp01(point[0]), clamp01(point[1])] as [number, number],
    }));

  return {
    type,
    visible: true,
    confidence,
    length: withBand(observed(line.length_class), lengthBand),
    depth: DEPTH_PROXY_UNCALIBRATED
      ? { value: line.depth_proxy?.class ?? null, confidence: Math.min(confidence, NOT_INTERPRETED_CONFIDENCE) }
      : observed(line.depth_proxy?.class ?? null),
    curvature: observed(line.curvature?.class ?? null),
    continuity: observed(line.continuity),
    startZone: observed(line.start_zone),
    endZone: observed(line.end_zone),
    marks,
    regions: [boundingRegion(path)],
    notes: null,
    path,
    source: 'line-service',
    evidence,
  };
}

export function notAnalysedLine(type: LineType): LineObservation {
  return { ...emptyLine(type), notAnalysed: true };
}

function emptyLine(type: LineType): LineObservation {
  return {
    type,
    visible: false,
    confidence: 0,
    length: unseen(),
    depth: unseen(),
    curvature: unseen(),
    continuity: unseen(),
    startZone: unseen(),
    endZone: unseen(),
    marks: [],
    regions: [],
    notes: null,
  };
}

const cap = (n: number) => Math.min(n, MODEL_CONFIDENCE_CAP);

/** A model-only line when the scanner could not run: words kept at lower confidence, no geometry to draw. */
export function modelLineWithoutGeometry(line: LineObservation): LineObservation {
  const { path: _path, evidence: _evidence, ...rest } = line;
  const capObserved = <T>(o: { value: T | null; confidence: number }) => ({ value: o.value, confidence: cap(o.confidence) });
  return {
    ...rest,
    confidence: cap(line.confidence),
    length: capObserved(line.length),
    depth: capObserved(line.depth),
    curvature: capObserved(line.curvature),
    continuity: capObserved(line.continuity),
    startZone: capObserved(line.startZone),
    endZone: capObserved(line.endZone),
    marks: line.marks.map(({ point: _point, ...mark }) => ({ ...mark, confidence: cap(mark.confidence) })),
    source: 'model',
  };
}

/**
 * A fate, sun or mercury line as the vision model described it, or "not
 * analysed" when the model did not report it as visible. A model "not visible"
 * is not treated as a confident absence: no rule may read it.
 */
export function aiOnlyLine(type: LineType, output: VisionOutput): LineObservation {
  const fromModel = output.lines.find((l) => l.type === type);
  if (!fromModel || !fromModel.visible || fromModel.confidence <= 0) return notAnalysedLine(type);
  return modelLineWithoutGeometry(fromModel);
}

export const MODEL_PARTS_WARNING = 'Mounts and hand shape come from the general vision model and are read at lower confidence.';
export const SCAN_UNAVAILABLE_WARNING =
  'No line was traced for this photo: heart, head and life line shapes were described by the AI from the photo, at lower confidence, and no line is drawn on it.';
export const AI_ONLY_LINES_WARNING =
  'Fate, sun and mercury lines are described by the AI from the photo, not traced, and are read at lower confidence.';
/** The same warning when the scanner traced the fate line. */
export const AI_ONLY_LINES_FATE_TRACED_WARNING =
  'Sun and mercury lines are described by the AI from the photo, not traced, and are read at lower confidence.';

export interface MergedParts {
  lines: LineObservation[];
  mounts: MountObservation[];
  handShape: VisionOutput['handShape'];
  warnings: string[];
  lineScan: LineScanInfo;
}

export function mergeVisionWithScan(output: VisionOutput, scan: Exclude<LineScanOutcome, { status: 'rejected' }>): MergedParts {
  const derived = scan.status === 'ok' ? derivedFromScan(scan.response) : null;
  const fateTrace = scan.status === 'ok' ? tracedFate(scan.response) : null;
  const traced: LineObservation[] =
    scan.status === 'ok' && scan.response.lines
      ? applyDerivedGeometry(
          [
            ...PHASE_ONE_LINES.map((type) => lineFromService(type, scan.response.lines![type])),
            ...(fateTrace ? [lineFromService('fate', fateTrace)] : []),
          ],
          derived,
        )
      : PHASE_ONE_LINES.map((type) => {
          const fromModel = output.lines.find((l) => l.type === type);
          return fromModel ? modelLineWithoutGeometry(fromModel) : { ...emptyLine(type), source: 'model' as const };
        });

  // Truth gate (2026-09-29, lines/truth.ts): a fate, sun or mercury line the
  // scanner did not trace is never read from the model's words any more — it
  // is "not analysed". A traced fate line replaces it.
  const aiOnlyTypes = AI_ONLY_LINES.filter((type) => !(type === 'fate' && fateTrace));
  const aiOnly = aiOnlyTypes.map((type) => notAnalysedLine(type));
  const lines = [...traced, ...aiOnly];
  const notRead = aiOnly.map((line) => line.type);

  const warnings = [...output.warnings, ...(scan.status === 'ok' ? [] : [SCAN_UNAVAILABLE_WARNING])].slice(0, 20);

  const lineScan: LineScanInfo =
    scan.status === 'ok'
      ? {
          status: 'ok',
          version: scan.response.version.slice(0, 20),
          model: scan.response.model.name.slice(0, 80),
          ...(scan.response.model.sha256 ? { modelSha256: scan.response.model.sha256.slice(0, 64) } : {}),
          ...(scan.response.ontologyVersion ? { ontologyVersion: scan.response.ontologyVersion.slice(0, 40) } : {}),
          ...(scan.response.quality.metrics ? { qualityMetrics: scan.response.quality.metrics } : {}),
          notAnalysed: scan.response.notAnalysed.slice(0, 12).map((n) => n.slice(0, 30)),
          latencyMs: Math.max(0, Math.round(scan.latencyMs)),
          // Hand landmarks and palm width: kept for Report V2 (mounts, palm frame). No rule reads them.
          ...(scan.response.hand
            ? {
                // 4 decimals, as the scanner sends them (2026-09-29; readings before kept 3): at 3 the
                // measured palm ratio moves by ~0.005, enough to cross a hand-type cut-off.
                landmarks: scan.response.hand.landmarks.map(([x, y]) => [round4(x), round4(y)] as [number, number]),
                // For the measured hand (features/hand): the model's side guess and
                // the size of the JPEG the landmarks are normalised on.
                handedness: scan.response.hand.handedness.slice(0, 12),
                handednessScore: round3(clamp01(scan.response.hand.handednessScore)),
              }
            : {}),
          image: { width: Math.round(scan.response.image.width), height: Math.round(scan.response.image.height) },
          ...(scan.response.hand?.palmWidthNormalized !== undefined
            ? { palmWidthNormalized: round3(scan.response.hand.palmWidthNormalized) }
            : {}),
          ...(derived ? { geometry: { version: derived.version, ...derived.measures } } : {}),
        }
      : { status: 'unavailable', reason: scan.reason.slice(0, 40), notAnalysed: notRead };

  // Truth gate: the model's mount prominence and hand shape are never kept
  // (lines/truth.ts). Mounts are taught from the landmarks instead, and the
  // hand type is measured (features/hand).
  return {
    lines,
    mounts: [],
    handShape: { value: null, confidence: 0 },
    warnings,
    lineScan,
  };
}

/** Derived palm geometry for the accepted heart, head, life (and traced fate) lines, or null without landmarks. */
export function derivedFromScan(response: LineServiceResponse): DerivedGeometry | null {
  if (!response.lines || !response.hand) return null;
  const traced: Partial<Record<TracedLine, TracedLineInput>> = {};
  for (const type of TRACED_LINES) {
    const line = response.lines[type];
    if (!line || !isAcceptedTrace(type, line)) continue;
    traced[type] = {
      path: line.polyline,
      chordArcRatio: line.curvature?.chord_arc_ratio ?? null,
      partial: line.partial === true,
      startZone: line.start_zone,
      endZone: line.end_zone,
    };
  }
  return deriveGeometry(response.hand.landmarks, response.image, traced);
}

/**
 * Maps derived geometry onto the fields the rules read (see lines/derived.ts
 * for why each one):
 * - head curvature = slope toward the Moon (the books' "sloping"), not bend;
 * - life curvature = how far the arc sweeps into the palm, not bend;
 * - heart end zone = read against this hand's index and middle knuckles;
 * - start / end zones on a zone border, a head or life start at the palm
 *   edge "on Jupiter", or a life start hidden in a joined start: kept but
 *   not interpreted (confidence below every rule floor);
 * - head `life_join`: joined / separate / wide, from both traced lines.
 * A class in a dead band is read as the nearest class, `borderline`, with the
 * other side as `altValue` (DEC-019); a value outside every class keeps the
 * scanner's value, not interpreted. The scanner's own classes stay untouched
 * in `evidence`.
 */
export function applyDerivedGeometry(lines: LineObservation[], derived: DerivedGeometry | null): LineObservation[] {
  if (!derived) return lines;
  const muted = <T>(o: { value: T | null; confidence: number }) => ({
    value: o.value,
    confidence: Math.min(o.confidence, NOT_INTERPRETED_CONFIDENCE),
  });
  const banded = <T>(value: T, info: BandInfo<T> | null, confidence: number) => withBand({ value, confidence }, info);
  return lines.map((line) => {
    if (line.source !== 'line-service' || !line.visible) return line;
    const type = line.type as TracedLine;
    const next: LineObservation = { ...line };
    const ends = derived.endpoints[type];
    if (ends) {
      next.startZone = ends.start.zone ? { value: ends.start.zone, confidence: line.confidence } : muted(line.startZone);
      next.endZone = ends.end.zone
        ? banded(ends.end.zone, type === 'heart' ? derived.bands.heartEnd : null, line.confidence)
        : muted(line.endZone);
    }
    if (type === 'head') {
      next.curvature = derived.headShape ? banded(derived.headShape, derived.bands.headShape, line.confidence) : muted(line.curvature);
      if (derived.headLifeJoin) {
        const life = lines.find((l) => l.type === 'life');
        next.derived = {
          ...line.derived,
          life_join: banded(derived.headLifeJoin, derived.bands.headLifeJoin, Math.min(line.confidence, life?.confidence ?? 0)),
        };
      }
    }
    if (type === 'fate' && derived.fateLifeStart) {
      // Uncalibrated (derived.ts): kept for the audit trail, below every rule
      // floor, and deliberately without a band until it is calibrated.
      next.derived = {
        ...line.derived,
        life_start: { value: derived.fateLifeStart, confidence: Math.min(line.confidence, NOT_INTERPRETED_CONFIDENCE) },
      };
    }
    if (type === 'life') {
      next.curvature = derived.lifeArc ? banded(derived.lifeArc, derived.bands.lifeArc, line.confidence) : muted(line.curvature);
    }
    return next;
  });
}

/** The analysing screen's live cards, straight from the scanner. */
export function partialLinesFromScan(scan: LineScanOutcome): (PartialLine & { notAnalysed?: boolean })[] {
  if (scan.status !== 'ok' || !scan.response.lines) return [];
  const lines = scan.response.lines;
  const cards: (PartialLine & { notAnalysed?: boolean })[] = PHASE_ONE_LINES.map((type) => {
    const line = lines[type];
    const visible = line.present && line.label === type;
    return {
      type: type as MajorLineType,
      visible,
      length: visible ? line.length_class : null,
      depth: visible ? (line.depth_proxy?.class ?? null) : null,
      curvature: visible ? (line.curvature?.class ?? null) : null,
      continuity: visible ? line.continuity : null,
    };
  });
  // A fate card only when the scanner traced and accepted fate. Otherwise none:
  // the vision model may still describe it later, so "not analysed" would be premature.
  const fate = tracedFate(scan.response);
  if (fate) {
    cards.push({
      type: 'fate',
      visible: true,
      length: fate.length_class,
      depth: fate.depth_proxy?.class ?? null,
      curvature: fate.curvature?.class ?? null,
      continuity: fate.continuity,
    });
  }
  return cards;
}

/** The scanner's bilingual retake reasons, joined for the error screen. */
export function rejectionMessages(scan: Extract<LineScanOutcome, { status: 'rejected' }>): { en: string; hi: string } {
  const reasons = scan.response.quality.reasons;
  if (reasons.length === 0) {
    return {
      en: 'That photo will not give a reliable reading. Try another.',
      hi: 'इस फोटो से भरोसेमंद रीडिंग नहीं मिलेगी। दूसरी फोटो आज़माएँ।',
    };
  }
  return { en: reasons.map((r) => r.message.en).join(' '), hi: reasons.map((r) => r.message.hi).join(' ') };
}
