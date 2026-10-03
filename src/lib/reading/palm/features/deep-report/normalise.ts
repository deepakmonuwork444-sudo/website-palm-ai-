// COPIED from palm-ai-new--feat-m1-foundation/src/features/deep-report/normalise.ts at app commit fbc2232d837f (2026-09-30).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import type { KbRule } from '../knowledge/types';
import type { LineObservation, PalmObservation } from '../observation/schema';
import type { Zone } from '../observation/taxonomy';
import { citationsFor } from '../reading/books';
import type { ReadingReport } from '../reading/writer';
import { parseModelJson } from '../vision/normalise';

import type {
  Bi,
  DeepLineType,
  DeepObservation,
  DeepReport,
  DeepSection,
  DeepSectionId,
  FeatureScore,
  Point,
  ThemeLink,
  TracedLine,
} from './types';
import { DEEP_SECTION_ORDER } from './types';

/**
 * Turns the four write-report answers into a DeepReport.
 *
 * Pure: no network, no React Native, unit-tested in Node. The same principle
 * as the vision normaliser applies: repair may drop what is broken, never fill
 * it in. An observation missing either language is dropped rather than shown
 * half-translated, a confidence is never higher than what the photo showed,
 * and a location point only ever comes from the extraction, never from the
 * writer (a text model has not seen the photo).
 */

/**
 * Four parts, each small enough to finish well inside a minute. The server's
 * claim allows six part calls per session, so four leaves two retries.
 */
export const DEEP_PARTS = ['lines_a', 'lines_b', 'themes_a', 'themes_b'] as const;
export type DeepPart = (typeof DEEP_PARTS)[number];

/**
 * What can be sent to write-report. `themes` is the older single themes part:
 * a write-report deployed before the split only knows it, so the app falls back
 * to it (one call answering both themes parts) until the function is redeployed.
 */
export const LEGACY_THEMES = 'themes' as const;
export type WirePart = DeepPart | typeof LEGACY_THEMES;

export const PART_SECTIONS: Record<DeepPart, readonly DeepSectionId[]> = {
  lines_a: ['overview', 'life', 'head'],
  lines_b: ['heart', 'fate', 'other_lines', 'markings'],
  themes_a: ['personality', 'career_money', 'relationships'],
  themes_b: ['strengths_challenges', 'summary'],
};

const WIRE_SECTIONS: Record<WirePart, readonly DeepSectionId[]> = {
  ...PART_SECTIONS,
  themes: [...PART_SECTIONS.themes_a, ...PART_SECTIONS.themes_b],
};

/** Stored beside a DeepReport so the report screen can offer a retry. */
export interface DeepStatus {
  /** Server session the parts were claimed against; null without a backend. */
  sessionId: string | null;
  /**
   * Parts not written yet: still being written in the background, or failed.
   * Empty when the report is complete. Older saves may say `themes`
   * (see `missingParts`).
   */
  failedParts: DeepPart[];
  /** False once the server has said no more calls are allowed (expired or limit). */
  retryable: boolean;
  /** Why the last part that failed was not written (server vocabulary), for the notice under it. */
  lastReason?: string;
}

/** A saved status's missing parts in today's vocabulary: `themes` becomes both themes parts. */
export function missingParts(status: { failedParts?: readonly string[] } | null | undefined): DeepPart[] {
  const out = new Set<DeepPart>();
  for (const part of status?.failedParts ?? []) {
    if (part === LEGACY_THEMES) {
      out.add('themes_a');
      out.add('themes_b');
    } else if ((DEEP_PARTS as readonly string[]).includes(part)) {
      out.add(part as DeepPart);
    }
  }
  return DEEP_PARTS.filter((p) => out.has(p));
}

export const DEEP_LINE_TYPES: readonly DeepLineType[] = ['life', 'head', 'heart', 'fate', 'sun', 'mercury'];

export const SECTION_TITLES: Record<DeepSectionId, Bi> = {
  overview: { en: 'Your palm at a glance', hi: 'एक नज़र में आपकी हथेली' },
  life: { en: 'Life line', hi: 'जीवन रेखा' },
  head: { en: 'Head line', hi: 'मस्तिष्क रेखा' },
  heart: { en: 'Heart line', hi: 'हृदय रेखा' },
  fate: { en: 'Fate line', hi: 'भाग्य रेखा' },
  other_lines: { en: 'Sun and Mercury lines', hi: 'सूर्य और बुध रेखा' },
  markings: { en: 'Marks, forks and crossings', hi: 'निशान, शाखाएँ और कटाव' },
  personality: { en: 'Personality', hi: 'व्यक्तित्व' },
  career_money: { en: 'Career and money', hi: 'करियर और धन' },
  relationships: { en: 'Relationships', hi: 'रिश्ते' },
  strengths_challenges: { en: 'Strengths and challenges', hi: 'खूबियाँ और चुनौतियाँ' },
  summary: { en: 'Summary', hi: 'सार' },
};

export const DEEP_DISCLAIMER: Bi = {
  en:
    'This report describes what could be seen in your photo and what traditional palmistry says about it. ' +
    'Palmistry is a tradition, not a science: nothing here predicts health, lifespan, wealth, marriage or ' +
    'the future, and it is never medical, financial or legal advice.',
  hi:
    'यह रिपोर्ट बताती है कि आपकी फोटो में क्या दिखा और पारंपरिक हस्तरेखा शास्त्र उसके बारे में क्या कहता है। ' +
    'हस्तरेखा एक परंपरा है, विज्ञान नहीं: यहाँ कुछ भी सेहत, उम्र, धन, शादी या भविष्य की पक्की भविष्यवाणी नहीं है, ' +
    'और यह कभी भी डॉक्टरी, आर्थिक या कानूनी सलाह नहीं है।',
};

/**
 * One line that respects every faith, shown with the disclaimer at runtime
 * (not stored), so readings saved before it existed carry it too.
 */
export const FAITH_NOTE: Bi = {
  en: 'For reflection and fun — not a prediction, and not a replacement for your faith, doctor or advisor.',
  hi: 'यह चिंतन और मनोरंजन के लिए है — भविष्यवाणी नहीं, और आपकी आस्था, डॉक्टर या सलाहकार की जगह नहीं।',
};

export const LINE_NAMES: Record<DeepLineType, Bi> = {
  life: SECTION_TITLES.life,
  head: SECTION_TITLES.head,
  heart: SECTION_TITLES.heart,
  fate: SECTION_TITLES.fate,
  sun: { en: 'Sun line', hi: 'सूर्य रेखा' },
  mercury: { en: 'Mercury line', hi: 'बुध रेखा' },
};

const ZONE_NAMES: Record<Zone, Bi> = {
  jupiter: { en: 'the mount of Jupiter, under the index finger', hi: 'गुरु पर्वत, तर्जनी के नीचे' },
  saturn: { en: 'the mount of Saturn, under the middle finger', hi: 'शनि पर्वत, मध्यमा के नीचे' },
  apollo: { en: 'the mount of the Sun, under the ring finger', hi: 'सूर्य पर्वत, अनामिका के नीचे' },
  mercury: { en: 'the mount of Mercury, under the little finger', hi: 'बुध पर्वत, कनिष्ठा के नीचे' },
  venus: { en: 'the mount of Venus, at the base of the thumb', hi: 'शुक्र पर्वत, अँगूठे की जड़ में' },
  luna: { en: 'the mount of the Moon, low on the outer edge', hi: 'चंद्र पर्वत, हथेली के बाहरी निचले किनारे पर' },
  mars_positive: { en: 'upper Mars, on the outer edge of the palm', hi: 'ऊपरी मंगल, हथेली के बाहरी किनारे पर' },
  mars_negative: { en: 'lower Mars, on the thumb side', hi: 'निचला मंगल, अँगूठे की ओर' },
  plain_of_mars: { en: 'the hollow centre of the palm', hi: 'हथेली के बीच का गहरा हिस्सा' },
  wrist: { en: 'near the wrist', hi: 'कलाई के पास' },
  between_jupiter_and_saturn: { en: 'between the index and middle fingers', hi: 'तर्जनी और मध्यमा के बीच' },
  under_index: { en: 'under the index finger', hi: 'तर्जनी के नीचे' },
  under_middle: { en: 'under the middle finger', hi: 'मध्यमा के नीचे' },
  under_ring: { en: 'under the ring finger', hi: 'अनामिका के नीचे' },
  under_little: { en: 'under the little finger', hi: 'कनिष्ठा के नीचे' },
};

const MAX_TEXT = 600;
/** The overall reading asks for 150-250 words; Hindi runs longer than English in characters. */
const MAX_OVERALL_TEXT = 3000;
/** Fewer words than this is not the overall reading that was asked for. */
const MIN_OVERALL_WORDS = 60;
const MAX_OBSERVATIONS = 6;
const MAX_LIST = 6;
const MAX_MIND_MAP = 10;
const MAX_RULE_IDS = 4;
const RULE_ID = /^[A-Za-z0-9_.:-]{1,100}$/;
const DEVANAGARI = /[ऀ-ॿ]/;
const LATIN = /[A-Za-z]/;

// ------------------------------------------------------------ primitives --

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function clamp01(value: unknown): number | null {
  const num = typeof value === 'string' ? Number(value) : value;
  if (typeof num !== 'number' || !Number.isFinite(num)) return null;
  return Math.round(Math.min(1, Math.max(0, num)) * 100) / 100;
}

/**
 * A bilingual text, or null. Hindi must actually be Devanagari and English
 * must contain Latin letters: a model that copies one language into the other
 * has not written both, and the report promises both.
 */
export function toBi(value: unknown, maxText = MAX_TEXT): Bi | null {
  const record = asRecord(value);
  const en = typeof record.en === 'string' ? record.en.trim().slice(0, maxText) : '';
  const hi = typeof record.hi === 'string' ? record.hi.trim().slice(0, maxText) : '';
  if (!en || !hi || !LATIN.test(en) || !DEVANAGARI.test(hi)) return null;
  return { en, hi };
}

function toBiList(value: unknown, max: number): Bi[] {
  return (Array.isArray(value) ? value : [])
    .map((entry) => toBi(entry))
    .filter((b): b is Bi => b !== null)
    .slice(0, max);
}

function toLineType(value: unknown): DeepLineType | undefined {
  return typeof value === 'string' && (DEEP_LINE_TYPES as readonly string[]).includes(value)
    ? (value as DeepLineType)
    : undefined;
}

function findLine(observation: PalmObservation, type: string): LineObservation | undefined {
  return observation.lines.find((l) => l.type === type);
}

/** A line outside the scan scope: the writer may not say anything about it. */
function isNotAnalysed(observation: PalmObservation, type: string | undefined): boolean {
  return type !== undefined && findLine(observation, type)?.notAnalysed === true;
}

/**
 * The extraction point and confidence behind a mark or crossing ref. Refs use
 * the array positions write-report was sent: `<line>-mark-<i>`, `crossing-<i>`.
 */
export function resolveRef(
  observation: PalmObservation,
  ref: unknown,
): { point?: Point; confidence: number; line?: DeepLineType } | null {
  if (typeof ref !== 'string') return null;
  const mark = /^([a-z_]+)-mark-(\d+)$/.exec(ref);
  if (mark) {
    const line = findLine(observation, mark[1] ?? '');
    const found = line?.marks[Number(mark[2])];
    if (!line || !found) return null;
    const lineType = toLineType(line.type);
    return {
      ...(found.point ? { point: found.point } : {}),
      confidence: Math.min(found.confidence, line.confidence),
      ...(lineType ? { line: lineType } : {}),
    };
  }
  const crossing = /^crossing-(\d+)$/.exec(ref);
  if (crossing) {
    const found = observation.crossings?.[Number(crossing[1])];
    if (!found) return null;
    const line = toLineType(found.lines[0]);
    return { point: found.point, confidence: found.confidence, ...(line ? { line } : {}) };
  }
  return null;
}

// --------------------------------------------------------------- parsing --

export interface DeepPartResult {
  part: DeepPart;
  sections: DeepSection[];
  /** lines_a: how to find each line's start and end. */
  lineEnds?: Partial<Record<DeepLineType, { start: Bi; end: Bi }>>;
  /** themes_b. */
  strengths?: Bi[];
  challenges?: Bi[];
  /** themes_a. */
  mindMap?: ThemeLink[];
  /** themes_b. */
  summary?: Bi;
  /** themes_b: the overall reading shown first. */
  overall?: Bi;
}

export class DeepPartError extends Error {
  constructor(
    readonly part: WirePart,
    /** Server vocabulary (`session_expired`, `timeout`, …) or `malformed_output`. */
    readonly reason: string,
  ) {
    super(`${part}: ${reason}`);
    this.name = 'DeepPartError';
  }
}

function toObservation(
  value: unknown,
  sectionId: DeepSectionId,
  index: number,
  observation: PalmObservation,
): DeepObservation | null {
  const record = asRecord(value);
  const feature = toBi(record.feature);
  const location = toBi(record.location);
  const traditional = toBi(record.traditional);
  const personal = toBi(record.personal);
  if (!feature || !location || !traditional || !personal) return null;

  const resolved = resolveRef(observation, record.ref);
  const sectionLine = toLineType(sectionId);
  const line = toLineType(record.line) ?? resolved?.line ?? sectionLine;
  const lineObservation = line ? findLine(observation, line) : undefined;
  // Whatever the writer says about a line this scan did not analyse is not
  // evidence; the report shows a fixed "Not analysed yet" block instead.
  if (lineObservation?.notAnalysed) return null;

  // The writer cannot be surer than the photo: cap at what extraction reported.
  const ceiling = resolved?.confidence ?? lineObservation?.confidence ?? 1;
  const stated = clamp01(record.confidence);
  const confidence = Math.min(stated ?? Math.min(ceiling, 0.5), ceiling);

  const ruleIds = (Array.isArray(record.ruleIds) ? record.ruleIds : [])
    .filter((id): id is string => typeof id === 'string' && RULE_ID.test(id))
    .slice(0, MAX_RULE_IDS);

  return {
    id: `${sectionId}-${index}`,
    ...(line ? { line } : {}),
    ...(resolved?.point ? { point: resolved.point } : {}),
    ...(ruleIds.length ? { ruleIds } : {}),
    feature,
    location,
    traditional,
    personal,
    confidence: Math.round(confidence * 100) / 100,
  };
}

function toSection(value: unknown, id: DeepSectionId, observation: PalmObservation): DeepSection | null {
  const record = asRecord(value);
  const observations = (Array.isArray(record.observations) ? record.observations : [])
    .map((entry, i) => toObservation(entry, id, i, observation))
    .filter((o): o is DeepObservation => o !== null)
    .slice(0, MAX_OBSERVATIONS)
    // Ids follow the kept order, so they stay dense after drops.
    .map((o, i) => ({ ...o, id: `${id}-${i}` }));
  if (observations.length === 0) return null;
  return {
    id,
    title: SECTION_TITLES[id],
    intro: toBi(record.intro) ?? { en: '', hi: '' },
    observations,
  };
}

/** Sections as an array of { id }, or (a common model slip) keyed by id. */
function rawSections(body: Record<string, unknown>): Map<string, unknown> {
  const byId = new Map<string, unknown>();
  if (Array.isArray(body.sections)) {
    for (const entry of body.sections) {
      const id = asRecord(entry).id;
      if (typeof id === 'string' && !byId.has(id)) byId.set(id, entry);
    }
  } else {
    for (const [key, entry] of Object.entries(asRecord(body.sections))) byId.set(key, entry);
  }
  for (const id of DEEP_SECTION_ORDER) {
    if (!byId.has(id) && Array.isArray(asRecord(body[id]).observations)) byId.set(id, body[id]);
  }
  return byId;
}

function toThemeLink(value: unknown, observation: PalmObservation): ThemeLink | null {
  const record = asRecord(value);
  const feature = toBi(record.feature);
  const theme = toBi(record.theme);
  const interpretation = toBi(record.interpretation);
  if (!feature || !theme || !interpretation) return null;
  const line = toLineType(record.line);
  if (isNotAnalysed(observation, line)) return null;
  return { feature, theme, interpretation, ...(line ? { line } : {}) };
}

/** The result a legacy `themes` answer is carried in until `splitLegacyThemes`. */
export interface WirePartResult extends Omit<DeepPartResult, 'part'> {
  part: WirePart;
}

/**
 * One part's raw model text → its cleaned result.
 * @throws DeepPartError('malformed_output') when nothing usable survives.
 */
export function parseDeepPart<P extends WirePart>(
  part: P,
  raw: string,
  observation: PalmObservation,
): P extends DeepPart ? DeepPartResult : WirePartResult;
export function parseDeepPart(part: WirePart, raw: string, observation: PalmObservation): WirePartResult {
  let body: Record<string, unknown>;
  try {
    body = asRecord(parseModelJson(raw).value);
  } catch {
    throw new DeepPartError(part, 'malformed_output');
  }

  const byId = rawSections(body);
  const sunAndMercuryNotAnalysed = isNotAnalysed(observation, 'sun') && isNotAnalysed(observation, 'mercury');
  const sections = WIRE_SECTIONS[part]
    .filter((id) => !(id === 'other_lines' && sunAndMercuryNotAnalysed))
    .map((id) => toSection(byId.get(id), id, observation))
    .filter((s): s is DeepSection => s !== null);

  const result: WirePartResult = { part, sections };

  if (part === 'lines_a') {
    const ends: NonNullable<DeepPartResult['lineEnds']> = {};
    for (const entry of Array.isArray(body.lineEnds) ? body.lineEnds : []) {
      const record = asRecord(entry);
      const type = toLineType(record.type);
      const start = toBi(record.start);
      const end = toBi(record.end);
      if (type && start && end && !ends[type]) ends[type] = { start, end };
    }
    result.lineEnds = ends;
  }

  if (part === 'themes_a' || part === LEGACY_THEMES) {
    result.mindMap = (Array.isArray(body.mindMap) ? body.mindMap : [])
      .map((entry) => toThemeLink(entry, observation))
      .filter((l): l is ThemeLink => l !== null)
      .slice(0, MAX_MIND_MAP);
  }

  let extras = false;
  if (part === 'themes_b' || part === LEGACY_THEMES) {
    result.strengths = toBiList(body.strengths, MAX_LIST);
    result.challenges = toBiList(body.challenges, MAX_LIST);
    const summary = toBi(body.summary);
    if (summary) result.summary = summary;
    const overall = toBi(body.overall, MAX_OVERALL_TEXT);
    if (overall && overall.en.split(/\s+/).length >= MIN_OVERALL_WORDS) result.overall = overall;
    // Its lists and the overall reading are content in their own right.
    extras = Boolean(result.overall || result.summary || result.strengths.length || result.challenges.length);
  }

  if (sections.length === 0 && !extras) throw new DeepPartError(part, 'malformed_output');
  return result;
}

/** A legacy `themes` answer split into the two parts it stands for. */
export function splitLegacyThemes(result: WirePartResult): Record<'themes_a' | 'themes_b', DeepPartResult> {
  const inPart = (part: DeepPart) => result.sections.filter((s) => PART_SECTIONS[part].includes(s.id));
  return {
    themes_a: { part: 'themes_a', sections: inPart('themes_a'), mindMap: result.mindMap ?? [] },
    themes_b: {
      part: 'themes_b',
      sections: inPart('themes_b'),
      strengths: result.strengths ?? [],
      challenges: result.challenges ?? [],
      ...(result.summary ? { summary: result.summary } : {}),
      ...(result.overall ? { overall: result.overall } : {}),
    },
  };
}

// -------------------------------------------------------------- assembly --

function zoneText(zone: Zone | null, prefix: Bi): Bi {
  if (!zone) return { en: 'Not clear in this photo', hi: 'इस फोटो में साफ़ नहीं' };
  const name = ZONE_NAMES[zone];
  return { en: `${prefix.en} ${name.en}`, hi: `${prefix.hi} ${name.hi}` };
}

const NOT_ANALYSED_TEXT: Bi = { en: 'Not analysed yet', hi: 'अभी विश्लेषण नहीं किया गया' };

/**
 * Lines for the photo and the report. A path is kept ONLY when the line
 * scanner traced it from crease pixels and accepted it under this name: a
 * model-estimated path is never drawn, and neither is an 'unknown' crease or a
 * line outside the scan scope.
 */
export function tracedLines(observation: PalmObservation, lineEnds: DeepPartResult['lineEnds'] = {}): TracedLine[] {
  return DEEP_LINE_TYPES.flatMap((type): TracedLine[] => {
    const line = findLine(observation, type);
    if (!line) return [];
    if (line.notAnalysed) {
      return [{ type, visible: false, confidence: 0, path: [], start: NOT_ANALYSED_TEXT, end: NOT_ANALYSED_TEXT, notAnalysed: true }];
    }
    const drawn = line.visible && line.source === 'line-service';
    const words = lineEnds[type];
    const evidence = line.evidence;
    return [
      {
        type,
        visible: line.visible,
        confidence: line.confidence,
        path: drawn ? (line.path ?? []) : [],
        start: words?.start ?? zoneText(line.startZone.value, { en: 'Starts at', hi: 'शुरुआत:' }),
        end: words?.end ?? zoneText(line.endZone.value, { en: 'Ends at', hi: 'अंत:' }),
        ...(line.source ? { source: line.source } : {}),
        ...(evidence
          ? {
              pixelConfidence: evidence.pixelConfidence,
              breaks: drawn ? evidence.breaks : [],
              forks: drawn ? evidence.forks : [],
              evidence,
            }
          : {}),
      },
    ];
  });
}

/** The "Scan quality" block, from the scanner's own measurements. */
export function scanQuality(observation: PalmObservation): DeepReport['scanQuality'] {
  const scan = observation.lineScan;
  if (!scan) return undefined;
  const lines = (['heart', 'head', 'life', 'fate'] as const).flatMap((type) => {
    const evidence = findLine(observation, type)?.evidence;
    if (!evidence) return [];
    const result: 'traced' | 'unidentified' | 'not_found' = !evidence.present
      ? 'not_found'
      : evidence.label === type
        ? 'traced'
        : 'unidentified';
    return [{ type, result, pixelConfidence: evidence.pixelConfidence, semanticConfidence: evidence.semanticConfidence }];
  });
  return {
    status: scan.status,
    ...(scan.reason ? { reason: scan.reason } : {}),
    metrics: scan.qualityMetrics ?? {},
    lines,
    ...(scan.ontologyVersion ? { ontologyVersion: scan.ontologyVersion } : {}),
  };
}

/**
 * Clarity bars from the extraction's own confidence, not from the writer:
 * "how clearly this showed in the photo" is a measurement we have, so a text
 * model is not asked to invent one.
 */
export function featureScores(observation: PalmObservation): FeatureScore[] {
  return DEEP_LINE_TYPES.flatMap((type) => {
    const line = findLine(observation, type);
    if (!line?.visible || line.notAnalysed) return [];
    return [{ label: LINE_NAMES[type], value: Math.round(line.confidence * 100) / 100, line: type }];
  });
}

export interface AssembleInput {
  observation: PalmObservation;
  parts: Partial<Record<DeepPart, DeepPartResult>>;
  photoUri: string | null;
  photoAspect: number | null;
  model: string;
  generatedAt?: string;
}

export function assembleDeepReport(input: AssembleInput): DeepReport {
  const { parts, observation } = input;
  const sections = DEEP_SECTION_ORDER.flatMap((id) =>
    DEEP_PARTS.flatMap((p) => parts[p]?.sections.filter((s) => s.id === id) ?? []),
  );
  const themes = parts.themes_b;
  const byId = (id: DeepSectionId) => sections.find((s) => s.id === id)?.intro;
  const nonEmpty = (b: Bi | undefined) => (b && b.en && b.hi ? b : undefined);

  const quality = scanQuality(observation);
  const notAnalysed = DEEP_LINE_TYPES.filter((type) => isNotAnalysed(observation, type));
  return {
    version: 1,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    model: input.model,
    photoUri: input.photoUri,
    photoAspect: input.photoAspect,
    lines: tracedLines(observation, parts.lines_a?.lineEnds),
    sections,
    strengths: themes?.strengths ?? [],
    challenges: themes?.challenges ?? [],
    mindMap: parts.themes_a?.mindMap ?? [],
    featureScores: featureScores(observation),
    summary:
      nonEmpty(themes?.summary) ?? nonEmpty(byId('summary')) ?? nonEmpty(byId('overview')) ?? { en: '', hi: '' },
    disclaimer: DEEP_DISCLAIMER,
    ...(themes?.overall ? { overall: themes.overall } : {}),
    ...(quality ? { scanQuality: quality } : {}),
    ...(notAnalysed.length > 0 ? { notAnalysed } : {}),
  };
}

/** A saved report taken back apart, so a retry regenerates only the parts that failed. */
export function partsFromReport(report: DeepReport, keep: readonly DeepPart[]): Partial<Record<DeepPart, DeepPartResult>> {
  const parts: Partial<Record<DeepPart, DeepPartResult>> = {};
  for (const part of keep) {
    const sections = report.sections.filter((s) => PART_SECTIONS[part].includes(s.id));
    const result: DeepPartResult = { part, sections };
    if (part === 'lines_a') {
      result.lineEnds = Object.fromEntries(report.lines.map((l) => [l.type, { start: l.start, end: l.end }]));
    }
    if (part === 'themes_a') result.mindMap = report.mindMap;
    if (part === 'themes_b') {
      result.strengths = report.strengths;
      result.challenges = report.challenges;
      if (report.summary.en && report.summary.hi) result.summary = report.summary;
      if (report.overall) result.overall = report.overall;
    }
    parts[part] = result;
  }
  return parts;
}

// ----------------------------------------------------------------- rules --

export interface RuleForWriter {
  id: string;
  meaning: string;
  meaningHi?: string;
  /** The books this meaning comes from, so the writer can name them. */
  books?: string[];
}

const PART_PATH_PREFIXES: Record<WirePart, readonly string[] | null> = {
  lines_a: ['line.life', 'line.head', 'hand.', 'mount.'],
  lines_b: ['line.heart', 'line.fate', 'line.sun', 'line.mercury', 'line.'],
  themes_a: null,
  themes_b: null,
  themes: null,
};

const MAX_RULES_PER_PART = 24;
const MAX_BOOKS = 3;
const MAX_BOOK_LABEL = 160;

/**
 * The matched rules that ground one part. Line parts get the rules that fired
 * on their lines; themes get every match. Evidence saved without `paths`
 * (older reports) can only be placed under themes.
 */
export function rulesForPart(report: ReadingReport, part: WirePart, kb: readonly KbRule[]): RuleForWriter[] {
  const prefixes = PART_PATH_PREFIXES[part];
  const exclude = part === 'lines_b' ? ['line.life', 'line.head'] : [];
  const seen = new Set<string>();
  const out: RuleForWriter[] = [];
  for (const section of report.sections) {
    for (const evidence of section.evidence) {
      if (seen.has(evidence.ruleId)) continue;
      if (prefixes) {
        const paths = evidence.paths ?? [];
        const relevant = paths.some((p) => prefixes.some((x) => p.startsWith(x)) && !exclude.some((x) => p.startsWith(x)));
        if (!relevant) continue;
      }
      seen.add(evidence.ruleId);
      const hi = kb.find((r) => r.ruleId === evidence.ruleId)?.interpretation.meaningHi;
      const books = citationsFor(evidence, kb)
        .map((c) => c.label.slice(0, MAX_BOOK_LABEL))
        .slice(0, MAX_BOOKS);
      out.push({
        id: evidence.ruleId,
        meaning: evidence.meaning.slice(0, 500),
        ...(hi ? { meaningHi: hi.slice(0, 700) } : {}),
        ...(books.length ? { books } : {}),
      });
      if (out.length >= MAX_RULES_PER_PART) return out;
    }
  }
  return out;
}
