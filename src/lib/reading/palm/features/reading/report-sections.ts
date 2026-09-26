// COPIED from palm-ai-new--feat-m1-foundation/src/features/reading/report-sections.ts at app commit 38389f51b74d (2026-09-26).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import type { DeepLineType } from '../deep-report/types';
import { MODULE_LABELS, type FinishedSynthesis } from '../knowledge/synthesis/modules';
import { MODULE_IDS, type Claim, type FeatureRef, type Module, type ModuleId, type ModuleState } from '../knowledge/synthesis/types';
import type { Bilingual, Lang } from '../../i18n';

import { traditionWords } from './humanise';

/**
 * The finished reading cut into its four life sections (owner, 2026-09-21):
 * the report home shows one tile per section, a section page shows its
 * bullets. Pure and UI-free, so the screen, the share text and a saved or
 * exported file all say the same thing in the same words and language.
 *
 * Nothing here decides anything new: every bullet is a claim the synthesis
 * already made, in the curated bilingual words it already carries. Book
 * quotes (English until a person checks their Hindi) never become bullets;
 * they stay in the collapsed "Why this?" part.
 */

export type SectionKey = 'love' | 'career-money' | 'personality' | 'direction';

export const SECTION_KEYS: readonly SectionKey[] = ['love', 'career-money', 'personality', 'direction'];

export const SECTION_MODULES: Record<SectionKey, readonly ModuleId[]> = {
  love: ['love'],
  'career-money': ['career', 'money'],
  personality: ['personality'],
  direction: ['direction'],
};

/** Short tile titles (the long module names are too wide for a 2×2 grid). */
export const SECTION_TITLES: Record<SectionKey, Bilingual> = {
  love: { en: 'Love', hi: 'प्यार' },
  'career-money': { en: 'Career & Money', hi: 'करियर और पैसा' },
  personality: { en: 'Personality', hi: 'स्वभाव' },
  direction: { en: 'Life Direction', hi: 'जीवन की दिशा' },
};

export const STATE_WORDS: Record<ModuleState, { en: string; hi: string; tone: 'success' | 'accent' | 'neutral' }> = {
  strong: { en: 'Clear signs', hi: 'साफ़ संकेत', tone: 'success' },
  supported: { en: 'Some signs', hi: 'कुछ संकेत', tone: 'accent' },
  limited: { en: 'Few signs', hi: 'कम संकेत', tone: 'neutral' },
  insufficient: { en: 'Not enough signs', hi: 'पर्याप्त संकेत नहीं', tone: 'neutral' },
};

export const KIND_LABELS: Partial<Record<Claim['kind'], Bilingual>> = {
  showsUp: { en: 'How it shows up', hi: 'आप कैसे हैं' },
  strength: { en: 'Your strength', hi: 'आपकी ताकत' },
  need: { en: 'What you seek', hi: 'आप क्या चाहते हैं' },
  watch: { en: 'Watch for', hi: 'ध्यान रखें' },
  tension: { en: 'Your inner tension', hi: 'आपकी भीतरी खींचतान' },
  bestFit: { en: 'Where you tend to thrive', hi: 'आप कहाँ खिलते हैं' },
  thinking: { en: 'How you think', hi: 'आप कैसे सोचते हैं' },
  reflection: { en: 'Something to reflect on', hi: 'सोचने लायक बात' },
};

/** Personality's "watch" is its blind spot. */
const BLIND_SPOT: Bilingual = { en: 'Blind spot', hi: 'अनदेखा पहलू' };

const STATE_RANK: Record<ModuleState, number> = { strong: 3, supported: 2, limited: 1, insufficient: 0 };

const NO_SIGNS: Bilingual = {
  en: 'Not enough clear signs in this photo.',
  hi: 'इस फोटो में इसके साफ़ संकेत नहीं मिले।',
};

const pickL = (lang: Lang, text: Bilingual) => (lang === 'hi' ? text.hi : text.en);

/** Every claim of a module, the leading one first. */
export function moduleClaims(m: Module): Claim[] {
  return [m.primary, m.showsUp, m.strength, m.need, m.watch, m.tension, ...m.extra].filter((c): c is Claim => Boolean(c));
}

export function uniqueRefs(claims: readonly Claim[]): FeatureRef[] {
  const seen = new Map<string, FeatureRef>();
  for (const c of claims) for (const ref of c.featureRefs) if (!seen.has(ref.path)) seen.set(ref.path, ref);
  return [...seen.values()];
}

export interface SectionBullet {
  /** "Your strength", "Watch for"… in the chosen language; absent for an unlabelled claim. */
  label?: string;
  text: string;
  claimId: string;
}

/** The labelled sub-claims of one module (not the leading claim), at most `max`. */
export function moduleBullets(module: Module, lang: Lang, max = 6): SectionBullet[] {
  return moduleClaims(module)
    .filter((c) => c !== module.primary)
    .slice(0, max)
    .map((c) => {
      const label = c.kind === 'watch' && module.id === 'personality' ? BLIND_SPOT : KIND_LABELS[c.kind];
      return { ...(label ? { label: pickL(lang, label) } : {}), text: pickL(lang, c.text), claimId: c.id };
    });
}

/** The first sentence of a text, cut at a word near `max` characters. */
export function shorten(text: string, max = 90): string {
  const first = text.match(/^[\s\S]*?[.!?।](?=\s|$)/)?.[0] ?? text;
  if (first.length <= max) return first;
  const cut = first.slice(0, max);
  const space = cut.lastIndexOf(' ');
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[,;:\s]+$/, '')}…`;
}

/** The lines a set of modules was read from, in first-seen order. */
export function sectionLines(modules: readonly Module[]): DeepLineType[] {
  const out: DeepLineType[] = [];
  for (const ref of uniqueRefs(modules.flatMap(moduleClaims))) {
    const line = ref.lineType as DeepLineType | undefined;
    if (line && !out.includes(line)) out.push(line);
  }
  return out;
}

export interface SectionPart {
  moduleId: ModuleId;
  /** The module's own name, shown as a sub-heading when a section has two parts. */
  subtitle: string;
  state: ModuleState;
  /** The leading claim, in full. Null when the palm had nothing clear to say. */
  summary: string | null;
  /** Why the part is limited or quiet, in plain words. */
  note: string | null;
  bullets: SectionBullet[];
  question: string | null;
}

export interface ReportSectionView {
  key: SectionKey;
  title: string;
  /** The clearest state among its parts. */
  state: ModuleState;
  /** One line for the tile: the leading claim shortened, or why there is none. */
  teaser: string;
  parts: SectionPart[];
  lines: DeepLineType[];
}

/** One section of a finished reading, ready to render or export in `lang`. */
export function reportSection(synthesis: FinishedSynthesis, key: SectionKey, lang: Lang, maxBullets = 6): ReportSectionView {
  const modules = SECTION_MODULES[key].map((id) => synthesis.modules[id]);
  const perPart = modules.length > 1 ? Math.ceil(maxBullets / modules.length) : maxBullets;
  const parts: SectionPart[] = modules.map((m) => {
    // An open section whose leading sentence was already said higher up (the
    // synthesis never repeats a sentence) still has claims: its first claim
    // leads, instead of the section reading "Not enough clear signs" under a
    // "Clear signs" label (audit 2026-09-23).
    const all = moduleBullets(m, lang, m.primary ? perPart : perPart + 1);
    const promoted = !m.primary && all.length > 0 ? all[0]! : null;
    return {
      moduleId: m.id,
      subtitle: pickL(lang, MODULE_LABELS[m.id]),
      state: m.state,
      summary: m.primary ? pickL(lang, m.primary.text) : (promoted?.text ?? null),
      note: m.note ? pickL(lang, m.note) : null,
      bullets: promoted ? all.slice(1) : all,
      question: m.question && (m.primary || promoted) ? pickL(lang, m.question) : null,
    };
  });
  const state = modules.reduce<ModuleState>((best, m) => (STATE_RANK[m.state] > STATE_RANK[best] ? m.state : best), 'insufficient');
  const lead = parts.find((p) => p.summary) ?? null;
  return {
    key,
    title: pickL(lang, SECTION_TITLES[key]),
    state,
    teaser: lead?.summary ? shorten(lead.summary) : shorten(parts.find((p) => p.note)?.note ?? pickL(lang, NO_SIGNS)),
    parts,
    lines: sectionLines(modules),
  };
}

/** "Life at a glance" as at most three short bullets: the headline, the natural strength, the main challenge. */
export function glanceBullets(synthesis: FinishedSynthesis, lang: Lang): { label: string; text: string }[] {
  const { overview } = synthesis;
  if (overview.pattern === 'insufficient') return [{ label: '', text: pickL(lang, overview.sentence) }];
  const out = [{ label: '', text: pickL(lang, overview.sentence) }];
  if (overview.strength) out.push({ label: lang === 'hi' ? 'स्वाभाविक ताकत' : 'Natural strength', text: pickL(lang, overview.strength.text) });
  if (overview.challenge) out.push({ label: lang === 'hi' ? 'मुख्य चुनौती' : 'Main challenge', text: pickL(lang, overview.challenge.text) });
  return out;
}

/* ── Reading the parts (owner, 2026-09-23) ────────────────────────────────
 * After the short glance the reader could not tell that four more parts
 * followed, or which of them they had already opened. These say, in one
 * place, how many parts there are, which were opened, and which comes next.
 */

export interface ReadProgress {
  total: number;
  read: number;
  /** The first part (in report order) not opened yet; null when all were. */
  firstUnread: SectionKey | null;
  isRead: (key: SectionKey) => boolean;
}

/**
 * Progress through the parts, from the section keys opened so far (unknown
 * keys ignored). `order` is the order the parts are offered in: report order,
 * or the reader's focus first on their own reading (focus.ts, DEC-045).
 */
export function readProgress(opened: readonly string[] | undefined, order: readonly SectionKey[] = SECTION_KEYS): ReadProgress {
  const done = new Set((opened ?? []).filter((k): k is SectionKey => (SECTION_KEYS as readonly string[]).includes(k)));
  return {
    total: SECTION_KEYS.length,
    read: done.size,
    firstUnread: order.find((k) => !done.has(k)) ?? null,
    isRead: (key) => done.has(key),
  };
}

/** "Part 2 of 4": the section's 1-based place among the parts, in `order`. */
export function sectionPosition(key: SectionKey, order: readonly SectionKey[] = SECTION_KEYS): { index: number; total: number } {
  return { index: order.indexOf(key) + 1, total: order.length };
}

/**
 * The part to offer after `current`: the next one not opened yet, going on in
 * report order (or `order`) and wrapping round; null when every other part was
 * opened (the page then offers the way back to the report).
 */
export function nextUnreadSection(
  current: SectionKey,
  opened: readonly string[] | undefined,
  order: readonly SectionKey[] = SECTION_KEYS,
): SectionKey | null {
  const done = new Set(opened ?? []);
  const at = order.indexOf(current);
  for (let step = 1; step < order.length; step++) {
    const key = order[(at + step) % order.length]!;
    if (!done.has(key)) return key;
  }
  return null;
}

/**
 * The leading sentence of the reading's clearest section (report order breaks
 * a tie), for a history card: two readings of the same person rarely share it,
 * unlike the overview sentence, which is per pattern. Null when no section
 * could say anything.
 */
export function strongestLine(synthesis: FinishedSynthesis, lang: Lang): string | null {
  let best: Module | null = null;
  for (const id of MODULE_IDS) {
    const m = synthesis.modules[id];
    if (!m?.primary) continue;
    if (!best || STATE_RANK[m.state] > STATE_RANK[best.state]) best = m;
  }
  return best?.primary ? pickL(lang, best.primary.text) : null;
}

/** One line of the share card: a section that could speak, with its leading sentence. */
export interface ShareInsight {
  moduleId: ModuleId;
  title: string;
  body: string;
}

/**
 * The share card's lines for a finished reading: the open sections' leading
 * claims, clearest first, at most `max` — the reading the person actually
 * read, not the older rule-by-rule sections.
 */
export function shareInsights(synthesis: FinishedSynthesis, lang: Lang, max = 3): ShareInsight[] {
  return MODULE_IDS.map((id) => synthesis.modules[id])
    .filter((m): m is Module => Boolean(m?.primary) && m.state !== 'insufficient')
    .map((m, order) => ({ m, order }))
    .sort((a, b) => STATE_RANK[b.m.state] - STATE_RANK[a.m.state] || a.order - b.order)
    .slice(0, max)
    .map(({ m }) => ({ moduleId: m.id, title: pickL(lang, MODULE_LABELS[m.id]), body: shorten(pickL(lang, m.primary!.text), 96) }));
}

/** The share card's subtitle: the reading's own tradition, or a plain generic line (never a fixed tradition name). */
export function shareSubtitle(tradition: string | undefined, lang: Lang): string {
  const words = traditionWords(tradition);
  if (words) return pickL(lang, words);
  return lang === 'hi' ? 'पारंपरिक हस्तरेखा रीडिंग' : 'Traditional palmistry reading';
}

/** The life section a module belongs to (Career and Money share one). */
export function sectionOfModule(id: ModuleId): SectionKey {
  return SECTION_KEYS.find((key) => SECTION_MODULES[key].includes(id)) ?? 'personality';
}
