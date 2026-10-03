// COPIED from palm-ai-new--feat-m1-foundation/src/features/report-v2/build.ts at app commit fbc2232d837f (2026-09-30).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import { resolvePath } from '../knowledge/engine';
import { KNOWLEDGE_RULES } from '../knowledge/rules';
import type { KbRule } from '../knowledge/types';
import { legacyDominance } from '../observation/dominance';
import type { LineObservation } from '../observation/schema';
import type { LineType } from '../observation/taxonomy';
import { REPORT_LINES } from '../reading/basis';
import { citationsFor } from '../reading/books';
import { hindiIsVerified } from '../reading/localise';
import type { ReadingOutcome } from '../reading/pipeline';
import type { ReportEvidenceLine } from '../reading/writer';

import {
  PALM_EXPERIENCE_VERSION,
  type Bilingual,
  type DetectedLine,
  type EvidenceKind,
  type ExperienceFocus,
  type ExperienceGap,
  type ExperienceObservation,
  type GapReason,
  type NormPoint,
  type PalmExperience,
  type SemanticName,
  type Visibility,
} from './contract';

/**
 * buildPalmExperience: a saved ReadingOutcome -> the Report V2 contract.
 *
 * Pure and deterministic: same outcome, same experience, same ids. It adds no
 * fact the observation does not hold and no meaning a rule does not give.
 * Geometry (polyline, start, end, breaks, forks, intersections) exists ONLY
 * for lines the palm line scanner traced; an AI-described line has none, and
 * no observation about it may offer SHOW ME.
 */

// ------------------------------------------------------------- thresholds --

/** Line or match confidence at or above this reads as "clear". */
export const VISIBILITY_CLEAR_MIN = 0.75;
/** ...as "visible". */
export const VISIBILITY_VISIBLE_MIN = 0.5;
/** ...as "faint"; below it, "uncertain". */
export const VISIBILITY_FAINT_MIN = 0.3;
/** Intersection points of one line pair closer than this are one crossing. */
export const INTERSECTION_MERGE_DISTANCE = 0.01;
/** SHOW ME for a start/end zone highlights this fraction of the line's points. */
export const ZONE_SEGMENT_FRACTION = 0.2;

const RANK: Record<Visibility, number> = { uncertain: 0, faint: 1, visible: 2, clear: 3 };
const KIND_RANK: Record<EvidenceKind, number> = { not_read: 0, ai_described: 1, traced: 2 };

export function visibilityFor(confidence: number, kind: EvidenceKind): Visibility {
  if (kind === 'not_read') return 'uncertain';
  const v: Visibility =
    confidence >= VISIBILITY_CLEAR_MIN
      ? 'clear'
      : confidence >= VISIBILITY_VISIBLE_MIN
        ? 'visible'
        : confidence >= VISIBILITY_FAINT_MIN
          ? 'faint'
          : 'uncertain';
  // Something only the AI described is never shown as better than "visible".
  return kind === 'ai_described' && RANK[v] > RANK.visible ? 'visible' : v;
}

/** How clearly the camera saw something, in words. The only consumer-facing form: never a percentage. */
export const VISIBILITY_WORDS: Record<Visibility, Bilingual> = {
  clear: { en: 'Clear', hi: 'साफ़' },
  visible: { en: 'Visible', hi: 'दिखी' },
  faint: { en: 'Faint', hi: 'हल्की' },
  uncertain: { en: 'Not clear', hi: 'साफ़ नहीं' },
};

export function visibilityWord(confidence: number, lang: 'en' | 'hi', kind: EvidenceKind = 'traced'): string {
  return VISIBILITY_WORDS[visibilityFor(confidence, kind)][lang];
}

// ------------------------------------------------------------- vocabulary --

export const LINE_NAMES: Record<SemanticName, Bilingual> = {
  heart: { en: 'Heart line', hi: 'हृदय रेखा' },
  head: { en: 'Head line', hi: 'मस्तिष्क रेखा' },
  life: { en: 'Life line', hi: 'जीवन रेखा' },
  fate: { en: 'Fate line', hi: 'भाग्य रेखा' },
  sun: { en: 'Sun line', hi: 'सूर्य रेखा' },
  mercury: { en: 'Mercury line', hi: 'बुध रेखा' },
  relationship: { en: 'Relationship line', hi: 'विवाह रेखा' },
  travel: { en: 'Travel line', hi: 'यात्रा रेखा' },
  intuition: { en: 'Intuition line', hi: 'अंतर्ज्ञान रेखा' },
  girdle_of_venus: { en: 'Girdle of Venus', hi: 'शुक्र मुद्रिका' },
  unclassified: { en: 'Unclassified crease', hi: 'अवर्गीकृत लकीर' },
};

export const LINE_ALIASES: Record<SemanticName, { en: string[]; hi: string[] }> = {
  heart: { en: ['Heart line', 'Line of Heart'], hi: ['हृदय रेखा'] },
  head: { en: ['Head line', 'Line of Head'], hi: ['मस्तिष्क रेखा', 'मस्तक रेखा'] },
  life: { en: ['Life line', 'Line of Life'], hi: ['जीवन रेखा'] },
  fate: { en: ['Fate line', 'Line of Destiny', 'Line of Saturn'], hi: ['भाग्य रेखा', 'शनि रेखा'] },
  sun: { en: ['Sun line', 'Line of Apollo'], hi: ['सूर्य रेखा'] },
  mercury: { en: ['Mercury line', 'Line of Health'], hi: ['बुध रेखा', 'स्वास्थ्य रेखा'] },
  relationship: { en: ['Relationship line', 'Marriage line'], hi: ['विवाह रेखा'] },
  travel: { en: ['Travel line'], hi: ['यात्रा रेखा'] },
  intuition: { en: ['Intuition line'], hi: ['अंतर्ज्ञान रेखा'] },
  girdle_of_venus: { en: ['Girdle of Venus'], hi: ['शुक्र मुद्रिका'] },
  unclassified: { en: ['Unclassified crease'], hi: ['अवर्गीकृत लकीर'] },
};

const VALUE_WORDS: Record<string, Bilingual> = {
  short: { en: 'short', hi: 'छोटी' },
  medium: { en: 'medium', hi: 'मध्यम' },
  long: { en: 'long', hi: 'लंबी' },
  // Depth: "faint" read as a weak or missing line; the scanner only measured a shallow crease.
  faint: { en: 'lightly etched', hi: 'हल्की गहराई' },
  moderate: { en: 'moderate', hi: 'मध्यम' },
  deep: { en: 'deep', hi: 'गहरी' },
  straight: { en: 'straight', hi: 'सीधी' },
  gentle: { en: 'gently curved', hi: 'हल्की घुमावदार' },
  curved: { en: 'curved', hi: 'घुमावदार' },
  continuous: { en: 'continuous', hi: 'अखंड' },
  broken: { en: 'broken', hi: 'टूटी हुई' },
  chained: { en: 'chained', hi: 'जंजीरनुमा' },
  joined: { en: 'joined to the life line', hi: 'जीवन रेखा से जुड़ी' },
  separate: { en: 'a little apart from the life line', hi: 'जीवन रेखा से थोड़ी अलग' },
  wide: { en: 'well apart from the life line', hi: 'जीवन रेखा से काफ़ी अलग' },
  flat: { en: 'flat', hi: 'समतल' },
  normal: { en: 'normal', hi: 'सामान्य' },
  raised: { en: 'raised', hi: 'उभरा हुआ' },
  earth: { en: 'earth', hi: 'पृथ्वी' },
  air: { en: 'air', hi: 'वायु' },
  water: { en: 'water', hi: 'जल' },
  fire: { en: 'fire', hi: 'अग्नि' },
  left: { en: 'left', hi: 'बायाँ' },
  right: { en: 'right', hi: 'दायाँ' },
};

const ZONE_WORDS: Record<string, Bilingual> = {
  jupiter: { en: 'Jupiter mount', hi: 'गुरु पर्वत' },
  saturn: { en: 'Saturn mount', hi: 'शनि पर्वत' },
  apollo: { en: 'Sun (Apollo) mount', hi: 'सूर्य पर्वत' },
  mercury: { en: 'Mercury mount', hi: 'बुध पर्वत' },
  venus: { en: 'Venus mount', hi: 'शुक्र पर्वत' },
  luna: { en: 'Moon (Luna) mount', hi: 'चंद्र पर्वत' },
  mars_positive: { en: 'upper Mars', hi: 'ऊपरी मंगल पर्वत' },
  mars_negative: { en: 'lower Mars', hi: 'निचला मंगल पर्वत' },
  plain_of_mars: { en: 'plain of Mars', hi: 'मंगल का मैदान' },
  wrist: { en: 'the wrist', hi: 'कलाई' },
  between_jupiter_and_saturn: { en: 'between Jupiter and Saturn', hi: 'गुरु और शनि पर्वत के बीच' },
  under_index: { en: 'under the index finger', hi: 'तर्जनी के नीचे' },
  under_middle: { en: 'under the middle finger', hi: 'मध्यमा के नीचे' },
  under_ring: { en: 'under the ring finger', hi: 'अनामिका के नीचे' },
  under_little: { en: 'under the little finger', hi: 'छोटी उँगली के नीचे' },
};

const MARK_WORDS: Record<string, Bilingual> = {
  break: { en: 'breaks', hi: 'टूटन' },
  branch_up: { en: 'rising branches', hi: 'ऊपर जाती शाखाएँ' },
  branch_down: { en: 'falling branches', hi: 'नीचे जाती शाखाएँ' },
  fork: { en: 'forks', hi: 'दोफाड़' },
  island: { en: 'islands', hi: 'द्वीप' },
  chain: { en: 'chains', hi: 'जंजीर' },
  cross: { en: 'crosses', hi: 'क्रॉस' },
  star: { en: 'stars', hi: 'तारे' },
  square: { en: 'squares', hi: 'वर्ग' },
  triangle: { en: 'triangles', hi: 'त्रिकोण' },
  tassel: { en: 'tassels', hi: 'गुच्छे' },
};

const ATTR_WORDS: Record<string, Bilingual> = {
  length: { en: 'length', hi: 'लंबाई' },
  depth: { en: 'depth', hi: 'गहराई' },
  curvature: { en: 'curve', hi: 'घुमाव' },
  continuity: { en: 'continuity', hi: 'निरंतरता' },
  start_zone: { en: 'starts at', hi: 'शुरुआत' },
  end_zone: { en: 'ends at', hi: 'अंत' },
  life_join: { en: 'start, beside the life line', hi: 'शुरुआत, जीवन रेखा के पास' },
  prominence: { en: 'prominence', hi: 'उभार' },
};

const TRADITION_NAMES: Record<string, Bilingual> = {
  western_classical: { en: 'Western classical palmistry', hi: 'पाश्चात्य शास्त्रीय हस्तरेखा' },
  indian_hast_rekha: { en: 'Indian Hast Rekha', hi: 'भारतीय हस्तरेखा शास्त्र' },
};

export function traditionName(id: string): Bilingual {
  const known = TRADITION_NAMES[id];
  if (known) return known;
  const words = id.replace(/_/g, ' ');
  return { en: `the ${words} tradition`, hi: `${words} परंपरा` };
}

const word = (table: Record<string, Bilingual>, value: unknown): Bilingual => {
  const key = String(value);
  return table[key] ?? { en: key.replace(/_/g, ' '), hi: key.replace(/_/g, ' ') };
};
const cap = (s: string) => (s ? s[0]!.toUpperCase() + s.slice(1) : s);
const lower = (s: string) => (s ? s[0]!.toLowerCase() + s.slice(1) : s);

// ---------------------------------------------------------------- helpers --

const round3 = (n: number) => Math.round(n * 1000) / 1000;
const lineIdOf = (type: string) => `line.${type}`;

/** FNV-1a 32-bit, hex. Stable across runs and platforms. */
export function stableHash(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export function observationIdFor(ruleId: string, featureIds: readonly string[]): string {
  return `obs_${stableHash(`${ruleId}|${[...featureIds].sort().join(',')}`)}`;
}

function segmentIntersection(a: NormPoint, b: NormPoint, c: NormPoint, d: NormPoint): NormPoint | null {
  const rx = b[0] - a[0];
  const ry = b[1] - a[1];
  const sx = d[0] - c[0];
  const sy = d[1] - c[1];
  const denom = rx * sy - ry * sx;
  if (Math.abs(denom) < 1e-12) return null; // parallel or collinear: not a crossing
  const qx = c[0] - a[0];
  const qy = c[1] - a[1];
  const t = (qx * sy - qy * sx) / denom;
  const u = (qx * ry - qy * rx) / denom;
  if (t < 0 || t > 1 || u < 0 || u > 1) return null;
  return [round3(a[0] + t * rx), round3(a[1] + t * ry)];
}

/** Every crossing of two polylines, near-duplicates merged, in path order. */
export function polylineIntersections(p: readonly NormPoint[], q: readonly NormPoint[]): NormPoint[] {
  const found: NormPoint[] = [];
  for (let i = 0; i + 1 < p.length; i++) {
    for (let j = 0; j + 1 < q.length; j++) {
      const hit = segmentIntersection(p[i]!, p[i + 1]!, q[j]!, q[j + 1]!);
      if (!hit) continue;
      if (found.some((f) => Math.hypot(f[0] - hit[0], f[1] - hit[1]) < INTERSECTION_MERGE_DISTANCE)) continue;
      found.push(hit);
    }
  }
  return found;
}

function kindOfLine(line: LineObservation | undefined): EvidenceKind {
  if (!line || line.notAnalysed || !line.visible) return 'not_read';
  return line.source === 'line-service' && (line.path?.length ?? 0) >= 2 ? 'traced' : 'ai_described';
}

function isUnclassified(line: LineObservation): boolean {
  return line.source === 'line-service' && line.evidence !== undefined && line.evidence.present && line.evidence.label !== line.type;
}

function gapMessage(reason: GapReason, name: Bilingual): Bilingual {
  switch (reason) {
    case 'not_analysed':
      return { en: `${name.en} was not read in this reading.`, hi: `${name.hi} इस रीडिंग में नहीं पढ़ी गई।` };
    case 'not_seen':
      return {
        en: `${name.en} was not seen clearly in this photo, so nothing here is based on it.`,
        hi: `${name.hi} इस फोटो में साफ़ नहीं दिखी, इसलिए यहाँ कुछ भी उस पर आधारित नहीं है।`,
      };
    case 'unclassified':
      return {
        en: `A crease was found where the ${lower(name.en)} is expected, but it does not fit that line's definition, so it is not read.`,
        hi: `जहाँ ${name.hi} होनी चाहिए वहाँ एक लकीर मिली, पर वह उस रेखा की परिभाषा में नहीं बैठती, इसलिए उसे नहीं पढ़ा गया।`,
      };
    case 'not_described':
      return { en: `${name.en} was not described in this reading.`, hi: `${name.hi} का इस रीडिंग में वर्णन नहीं हुआ।` };
  }
}

// ------------------------------------------------------------------ lines --

function detectedLine(line: LineObservation, outcome: ReadingOutcome): DetectedLine {
  const unclassified = isUnclassified(line);
  const semanticName: SemanticName = unclassified ? 'unclassified' : line.type;
  const kind: EvidenceKind = unclassified ? 'not_read' : kindOfLine(line);
  const traced = kind === 'traced';
  const fromScanner = line.source === 'line-service';
  const ev = fromScanner ? line.evidence : undefined;
  const scan = outcome.observation.lineScan;
  const path = traced ? (line.path ?? []).map(([x, y]) => [x, y] as NormPoint) : null;

  return {
    lineId: lineIdOf(line.type),
    semanticName,
    aliases: LINE_ALIASES[semanticName],
    present: unclassified ? true : line.visible,
    evidenceKind: kind,
    visualConfidence: ev ? ev.pixelConfidence : line.confidence,
    semanticConfidence: ev ? ev.semanticConfidence : null,
    visibility: visibilityFor(line.confidence, kind),
    polyline: path,
    start: path ? path[0]! : null,
    end: path ? path[path.length - 1]! : null,
    startZone: unclassified ? null : line.startZone.value,
    endZone: unclassified ? null : line.endZone.value,
    length: { class: unclassified ? null : line.length.value, normalized: ev?.normalizedLength ?? null },
    curvature: {
      class: unclassified ? null : line.curvature.value,
      netTurningDeg: ev?.curvature?.netTurningDeg ?? null,
      chordArcRatio: ev?.curvature?.chordArcRatio ?? null,
    },
    continuity: unclassified ? null : line.continuity.value,
    depth: { class: unclassified ? null : line.depth.value, value: ev?.depthProxy?.value ?? null },
    breaks: traced && ev ? ev.breaks.map(([x, y]) => [x, y] as NormPoint) : [],
    forks: traced && ev ? ev.forks.map(([x, y]) => [x, y] as NormPoint) : [],
    branches: [],
    intersections: [],
    relatedLineIds: [],
    failedChecks: ev?.failedChecks ?? [],
    modelVersion: fromScanner ? (scan?.model ?? null) : outcome.observation.extractor.model,
    ontologyVersion: fromScanner ? (scan?.ontologyVersion ?? null) : null,
  };
}

// ----------------------------------------------------------- observations --

interface FeatureText {
  observed: Bilingual;
  classification: Bilingual;
}

function featureText(outcome: ReadingOutcome, path: string, fallback: string): FeatureText {
  const parts = path.split('.');
  const resolved = resolvePath(outcome.observation, path);
  const value = resolved?.value ?? null;
  const raw: FeatureText = { observed: { en: fallback, hi: fallback }, classification: { en: fallback, hi: fallback } };
  if (!resolved) return raw;

  if (parts[0] === 'line' && parts[1]) {
    const name = LINE_NAMES[parts[1] as LineType] ?? word({}, parts[1]);
    const attr = parts[2] ?? '';
    if (attr === 'visible') {
      const seen = value === true;
      return {
        observed: { en: `${name.en}: ${seen ? 'seen' : 'not seen'}`, hi: `${name.hi}: ${seen ? 'दिखी' : 'नहीं दिखी'}` },
        classification: {
          en: `${name.en} ${seen ? 'present' : 'not seen'}`,
          hi: `${name.hi} ${seen ? 'मौजूद' : 'नहीं दिखी'}`,
        },
      };
    }
    if (attr === 'marks' && parts[3]) {
      const mark = word(MARK_WORDS, parts[3]);
      const count = typeof value === 'number' ? value : 0;
      return {
        observed: { en: `${name.en} — ${mark.en}: ${count}`, hi: `${name.hi} — ${mark.hi}: ${count}` },
        classification:
          count > 0
            ? { en: `${name.en} with ${count} ${mark.en}`, hi: `${count} ${mark.hi} वाली ${name.hi}` }
            : { en: `${name.en} with no ${mark.en}`, hi: `बिना ${mark.hi} वाली ${name.hi}` },
      };
    }
    const attrWord = word(ATTR_WORDS, attr);
    if (value === null) {
      return {
        observed: { en: `${name.en} — ${attrWord.en}: unknown`, hi: `${name.hi} — ${attrWord.hi}: अज्ञात` },
        classification: { en: `${name.en}, ${attrWord.en} unknown`, hi: `${name.hi}, ${attrWord.hi} अज्ञात` },
      };
    }
    if (attr === 'start_zone' || attr === 'end_zone') {
      const zone = word(ZONE_WORDS, value);
      const start = attr === 'start_zone';
      return {
        observed: { en: `${name.en} — ${attrWord.en}: ${zone.en}`, hi: `${name.hi} — ${attrWord.hi}: ${zone.hi}` },
        classification: start
          ? { en: `${name.en} starting at ${zone.en}`, hi: `${zone.hi} से शुरू होती ${name.hi}` }
          : { en: `${name.en} ending at ${zone.en}`, hi: `${zone.hi} पर खत्म होती ${name.hi}` },
      };
    }
    const v = word(VALUE_WORDS, value);
    return {
      observed: { en: `${name.en} — ${attrWord.en}: ${v.en}`, hi: `${name.hi} — ${attrWord.hi}: ${v.hi}` },
      classification: { en: `${cap(v.en)} ${lower(name.en)}`, hi: `${v.hi} ${name.hi}` },
    };
  }

  if (parts[0] === 'mount' && parts[1]) {
    const mount = word(ZONE_WORDS, parts[1]);
    const v = value === null ? { en: 'unknown', hi: 'अज्ञात' } : word(VALUE_WORDS, value);
    return {
      observed: { en: `${cap(mount.en)} — prominence: ${v.en}`, hi: `${mount.hi} — उभार: ${v.hi}` },
      classification: { en: `${cap(v.en)} ${mount.en}`, hi: `${v.hi} ${mount.hi}` },
    };
  }

  if (parts[0] === 'hand') {
    if (parts[1] === 'shape') {
      const v = value === null ? { en: 'unknown', hi: 'अज्ञात' } : word(VALUE_WORDS, value);
      return {
        observed: { en: `Hand shape: ${v.en}`, hi: `हाथ का आकार: ${v.hi}` },
        classification: { en: `${cap(v.en)} hand`, hi: `${v.hi} हाथ` },
      };
    }
    if (parts[1] === 'side') {
      const v = word(VALUE_WORDS, value);
      return {
        observed: { en: `Hand: ${v.en}`, hi: `हाथ: ${v.hi}` },
        classification: { en: `${cap(v.en)} hand`, hi: `${v.hi} हाथ` },
      };
    }
    if (parts[1] === 'is_dominant') {
      const dominant = value === true;
      return {
        observed: { en: `Dominant hand: ${dominant ? 'yes' : 'no'}`, hi: `प्रमुख हाथ: ${dominant ? 'हाँ' : 'नहीं'}` },
        classification: dominant ? { en: 'Dominant hand', hi: 'प्रमुख हाथ' } : { en: 'Non-dominant hand', hi: 'गैर-प्रमुख हाथ' },
      };
    }
  }
  return raw;
}

function joinBi(items: Bilingual[], sep: string): Bilingual {
  return { en: items.map((i) => i.en).join(sep), hi: items.map((i) => i.hi).join(sep) };
}

function evidenceKindFor(featureIds: readonly string[], outcome: ReadingOutcome): EvidenceKind {
  let weakest: EvidenceKind | null = null;
  for (const path of featureIds) {
    const [root, name] = path.split('.');
    let kind: EvidenceKind | null = null;
    if (root === 'line' && name) {
      const line = outcome.observation.lines.find((l) => l.type === name);
      // A rule on a line's absence rests on whoever looked for it.
      kind = !line || line.notAnalysed ? 'not_read' : line.source === 'line-service' && (line.path?.length ?? 0) >= 2 ? 'traced' : 'ai_described';
    } else if (root === 'mount' || (root === 'hand' && name === 'shape')) {
      kind = 'ai_described'; // mounts and hand shape always come from the vision model
    }
    if (kind && (weakest === null || KIND_RANK[kind] < KIND_RANK[weakest])) weakest = kind;
  }
  return weakest ?? 'ai_described';
}

function focusFor(featureIds: readonly string[], lines: readonly DetectedLine[]): ExperienceFocus | null {
  const candidates = featureIds
    .map((path) => {
      const parts = path.split('.');
      if (parts[0] !== 'line' || !parts[1]) return null;
      const line = lines.find((l) => l.lineId === lineIdOf(parts[1]!));
      return line ? { line, parts } : null;
    })
    .filter((c): c is { line: DetectedLine; parts: string[] } => c !== null)
    // Prefer a traced line, so SHOW ME is offered whenever one exists.
    .sort((a, b) => KIND_RANK[b.line.evidenceKind] - KIND_RANK[a.line.evidenceKind]);
  const first = candidates[0];
  if (!first) return null;
  const { line, parts } = first;
  const focus: ExperienceFocus = { lineId: line.lineId };
  const path = line.polyline;
  if (!path || path.length < 2) return focus;
  const attr = parts[2];
  const markKind = parts[3];
  if (attr === 'marks' && markKind === 'break' && line.breaks[0]) focus.point = line.breaks[0];
  else if (attr === 'marks' && markKind === 'fork' && line.forks[0]) focus.point = line.forks[0];
  else if (attr === 'start_zone' || attr === 'end_zone' || attr === 'life_join') {
    const span = Math.max(1, Math.round((path.length - 1) * ZONE_SEGMENT_FRACTION));
    focus.segment = attr !== 'end_zone' ? [0, span] : [path.length - 1 - span, path.length - 1];
  }
  return focus;
}

function experienceObservation(
  entry: ReportEvidenceLine,
  outcome: ReadingOutcome,
  lines: readonly DetectedLine[],
  byId: Map<string, KbRule>,
  rules: readonly KbRule[],
): ExperienceObservation | null {
  if (!entry.ruleId) return null;
  const rule = byId.get(entry.ruleId);
  const featureIds = [...new Set(entry.paths?.length ? entry.paths : (rule?.conditions.map((c) => c.path) ?? []))];
  if (featureIds.length === 0) return null;
  const sourceRefs = citationsFor(entry, rules);
  if (sourceRefs.length === 0) return null;

  const texts = featureIds.map((path) => featureText(outcome, path, entry.observed));
  const kind = evidenceKindFor(featureIds, outcome);
  const tradition = rule?.tradition ?? entry.tradition;
  const name = traditionName(tradition);

  // Layer C: only the rule's meaning, as the report stored it. Hindi only when
  // the rule still says exactly that and its Hindi was checked (localise.ts).
  const current = rule && rule.interpretation.meaning === entry.meaning ? rule : null;
  const hiReviewed = current !== null && hindiIsVerified(current);
  const meaningHi = hiReviewed ? current!.interpretation.meaningHi! : entry.meaning;

  const focus = focusFor(featureIds, lines);
  const focusLine = focus ? lines.find((l) => l.lineId === focus.lineId) : undefined;
  const confidence = round3(entry.confidence);

  return {
    observationId: observationIdFor(entry.ruleId, featureIds),
    featureIds,
    ruleId: entry.ruleId,
    traditionalSystem: tradition,
    traditionName: name,
    sourceRefs,
    importance: confidence,
    confidence,
    visibility: visibilityFor(confidence, kind),
    evidenceKind: kind,
    observed: joinBi(
      texts.map((t) => t.observed),
      '; ',
    ),
    classification: joinBi(
      texts.map((t) => t.classification),
      ' + ',
    ),
    interpretation: {
      en: `In ${name.en}, this is traditionally read as: ${entry.meaning}`,
      hi: `${name.hi} में इसे पारंपरिक रूप से ऐसे पढ़ा जाता है: ${meaningHi}`,
    },
    interpretationHiReviewed: hiReviewed,
    shortCopy: null,
    deepCopy: null,
    focus,
    showable: Boolean(focus && focusLine?.evidenceKind === 'traced' && focusLine.polyline && focusLine.polyline.length >= 2),
  };
}

// ------------------------------------------------------------------ build --

export function buildPalmExperience(
  outcome: ReadingOutcome,
  readingId: string,
  options: { rules?: readonly KbRule[] } = {},
): PalmExperience {
  const rules = options.rules ?? KNOWLEDGE_RULES;
  const obs = outcome.observation;
  const scan = obs.lineScan;

  const lines: DetectedLine[] = [];
  const gaps: ExperienceGap[] = [];
  for (const line of obs.lines) {
    const id = lineIdOf(line.type);
    const name = LINE_NAMES[line.type];
    if (line.notAnalysed) {
      gaps.push({ lineId: id, reason: 'not_analysed', message: gapMessage('not_analysed', name) });
      continue;
    }
    if (isUnclassified(line)) {
      lines.push(detectedLine(line, outcome));
      gaps.push({ lineId: id, reason: 'unclassified', message: gapMessage('unclassified', name) });
      continue;
    }
    if (!line.visible) {
      gaps.push({ lineId: id, reason: 'not_seen', message: gapMessage('not_seen', name) });
      continue;
    }
    lines.push(detectedLine(line, outcome));
  }
  for (const type of REPORT_LINES) {
    if (!obs.lines.some((l) => l.type === type)) {
      gaps.push({ lineId: lineIdOf(type), reason: 'not_described', message: gapMessage('not_described', LINE_NAMES[type]) });
    }
  }

  // Crossings between traced lines only: AI positions are not exact.
  const related = new Map<string, Set<string>>(lines.map((l) => [l.lineId, new Set<string>()]));
  const traced = lines.filter((l) => l.evidenceKind === 'traced' && l.polyline);
  for (let i = 0; i < traced.length; i++) {
    for (let j = i + 1; j < traced.length; j++) {
      const a = traced[i]!;
      const b = traced[j]!;
      for (const point of polylineIntersections(a.polyline!, b.polyline!)) {
        a.intersections.push({ withLineId: b.lineId, point });
        b.intersections.push({ withLineId: a.lineId, point });
        related.get(a.lineId)!.add(b.lineId);
        related.get(b.lineId)!.add(a.lineId);
      }
    }
  }

  const byId = new Map(rules.map((rule) => [rule.ruleId, rule]));
  const observations: ExperienceObservation[] = [];
  const seen = new Set<string>();
  for (const section of outcome.report.sections) {
    for (const entry of section.evidence) {
      const built = experienceObservation(entry, outcome, lines, byId, rules);
      if (!built || seen.has(built.observationId)) continue;
      seen.add(built.observationId);
      observations.push(built);
      const lineIds = built.featureIds
        .map((p) => p.split('.'))
        .filter((p) => p[0] === 'line' && p[1])
        .map((p) => lineIdOf(p[1]!))
        .filter((id) => related.has(id));
      for (const a of lineIds) for (const b of lineIds) if (a !== b) related.get(a)!.add(b);
    }
  }
  for (const line of lines) line.relatedLineIds = [...(related.get(line.lineId) ?? [])].sort();

  const read = lines.filter((l) => l.evidenceKind !== 'not_read');
  return {
    version: PALM_EXPERIENCE_VERSION,
    readingId,
    photo: outcome.photo ? { uri: outcome.photo.uri, aspect: outcome.photo.aspect } : null,
    hand: {
      side: obs.hand.side,
      dominance: legacyDominance(obs.hand),
      landmarks: scan?.landmarks ? scan.landmarks.map(([x, y]) => [x, y] as NormPoint) : null,
      palmWidthNormalized: scan?.palmWidthNormalized ?? null,
    },
    quality: {
      passed: obs.imageQuality.passed,
      issues: [...obs.imageQuality.issues],
      scanMetrics: scan?.qualityMetrics ?? null,
    },
    lines,
    observations,
    gaps,
    counts: {
      readable: read.length,
      traced: read.filter((l) => l.evidenceKind === 'traced').length,
      aiDescribed: read.filter((l) => l.evidenceKind === 'ai_described').length,
      lowConfidence: read.filter((l) => l.visibility === 'faint' || l.visibility === 'uncertain').length,
    },
    provenance: {
      scanStatus: scan?.status ?? 'absent',
      scanReason: scan?.reason ?? null,
      serviceVersion: scan?.version ?? null,
      modelVersion: scan?.model ?? null,
      ontologyVersion: scan?.ontologyVersion ?? null,
      extractor: { provider: obs.extractor.provider, model: obs.extractor.model, version: obs.extractor.version },
    },
  };
}
