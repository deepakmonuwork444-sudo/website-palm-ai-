// COPIED from palm-ai-new--feat-m1-foundation/src/features/reading/access.ts at app commit 38389f51b74d (2026-09-26).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import { MODULE_AREA, type FinishedSynthesis } from '../knowledge/synthesis/modules';
import { MODULE_IDS, type Claim, type Module, type ModuleId } from '../knowledge/synthesis/types';
import type { Bilingual, Lang } from '../../i18n';

import { SECTION_KEYS, SECTION_MODULES, SECTION_TITLES, moduleClaims, sectionLines, type SectionKey } from './report-sections';

/**
 * Partial free reading (DEC-038), as pure helpers. No React Native imports:
 * unit-tested in Node (tests/reading-access.test.ts).
 *
 * A FREE reading (charged `free_guest` / `free_email`) opens Love and
 * Personality in full; Career & Money and Life Direction show only their first
 * sentence. Everything else stays open:
 * - a reading saved before this change carries no `access` → full (grandfathered);
 * - a reading charged `paid` / `subscription` / `unlimited` → full;
 * - a reading unlocked with a paid reading (`unlock_reading`, migration 0017) → full;
 * - an active Pro subscription (trial included) → every reading full.
 *
 * The server stays the authority (`reading_access`); this file only decides
 * what the phone shows from what it was told. Hidden text is removed from the
 * synthesis before any screen, file or share builder sees it (`lockSynthesis`,
 * `openPartsOnly`), so no locked sentence can reach the tree, a PDF, the share
 * text or the voice.
 */

export type ReadingAccess = 'full' | 'partial';

/** `reading_sessions.charged_as` (0013 / 0017). */
export type ChargeKind = 'free_guest' | 'free_email' | 'paid' | 'subscription' | 'unlimited';

/** Open in full on a free reading. */
export const FREE_OPEN_SECTIONS: readonly SectionKey[] = ['love', 'personality'];
/** First sentence only on a free reading. */
export const FREE_LOCKED_SECTIONS: readonly SectionKey[] = ['career-money', 'direction'];

/** What a free reading gives, said honestly before the scan (DEC-038). */
export const FREE_READING_PROMISE: Bilingual = {
  en: 'Free reading: Love & Personality in full + a preview of Career and Life Direction',
  hi: 'मुफ़्त रीडिंग: प्यार और स्वभाव पूरे + करियर और जीवन की दिशा की झलक',
};

/** Said in place of a glance line that would repeat a locked part. */
export const LOCKED_GLANCE_LINE: Bilingual = {
  en: 'There is more about this in your full reading.',
  hi: 'इसके बारे में और बातें आपकी पूरी रीडिंग में हैं।',
};

const pickL = (lang: Lang, text: Bilingual) => (lang === 'hi' ? text.hi : text.en);

/** The charge → what it opens; null when the charge is unknown (not yet charged, an old server). */
export function accessFromCharge(chargedAs: string | null | undefined): ReadingAccess | null {
  switch (chargedAs) {
    case 'free_guest':
    case 'free_email':
      return 'partial';
    case 'paid':
    case 'subscription':
    case 'unlimited':
      return 'full';
    default:
      return null;
  }
}

/** The balance just before the reading, the last fallback when neither the charge nor the server says. */
export interface BalanceBefore {
  paidAvailable: number;
  unlimited: boolean;
  subscription?: { active: boolean } | null;
}

/**
 * The access to store with a reading that just finished. In order: the charge
 * the server reported when completing it, the server's `reading_access`
 * answer, and — only when both are missing (an older server without 0017) —
 * the balance the user had before the reading: paid readings, Pro or
 * unlimited → full, else partial. No session at all (on-device mode, no
 * backend, nothing was charged) → full.
 */
export function accessAfterReading(input: {
  hasSession: boolean;
  chargedAs?: string | null;
  serverAccess?: ReadingAccess | null;
  balanceBefore?: BalanceBefore | null;
}): ReadingAccess {
  if (!input.hasSession) return 'full';
  const fromCharge = accessFromCharge(input.chargedAs);
  if (fromCharge) return fromCharge;
  if (input.serverAccess === 'full' || input.serverAccess === 'partial') return input.serverAccess;
  const b = input.balanceBefore;
  if (b && (b.unlimited || b.paidAvailable > 0 || b.subscription?.active === true)) return 'full';
  return 'partial';
}

/**
 * What the phone shows for a saved reading now. No stored access → saved
 * before DEC-038 → full. An active Pro plan (or unlimited) opens every reading.
 */
export function effectiveAccess(stored: ReadingAccess | null | undefined, opts: { proActive?: boolean; unlimited?: boolean } = {}): ReadingAccess {
  if (opts.proActive || opts.unlimited) return 'full';
  return stored === 'partial' ? 'partial' : 'full';
}

/** One shared empty list, so a memo keyed on it stays stable. */
const NO_LOCKS: readonly SectionKey[] = [];

/** The locked sections for an access level, in report order. */
export function lockedSections(access: ReadingAccess): readonly SectionKey[] {
  return access === 'partial' ? FREE_LOCKED_SECTIONS : NO_LOCKS;
}

export function isSectionLocked(key: string | null | undefined, locked: readonly SectionKey[]): boolean {
  return Boolean(key) && (locked as readonly string[]).includes(key as string);
}

/** Share of the reading that is open, in whole percent ("Your reading is 50% open"). */
export function openPercent(locked: readonly SectionKey[]): number {
  const total = SECTION_KEYS.length;
  return Math.round(((total - locked.length) / total) * 100);
}

/** "2 more parts in the full reading", for PDF, share, Listen, Compare and Sources. */
export function morePartsLine(count: number, lang: Lang): string {
  if (lang === 'hi') return count === 1 ? 'पूरी रीडिंग में 1 और हिस्सा है' : `पूरी रीडिंग में ${count} और हिस्से हैं`;
  return count === 1 ? '1 more part in the full reading' : `${count} more parts in the full reading`;
}

/** The first sentence of a text, whole (never cut mid-sentence). */
export function firstSentence(text: string): string {
  const trimmed = text.trim();
  const first = trimmed.match(/^[\s\S]*?[.!?।](?=\s|$)/)?.[0] ?? trimmed;
  return first.trim();
}

function lockedModuleIds(locked: readonly SectionKey[]): Set<ModuleId> {
  return new Set(locked.flatMap((key) => SECTION_MODULES[key]));
}

/** The leading claim of a module (or its first claim when the lead was said higher up). */
function leadClaim(m: Module): Claim | null {
  return m.primary ?? moduleClaims(m)[0] ?? null;
}

/** A module reduced to its first sentence: no other claim, note, question or book basis. */
function teaserModule(m: Module): Module {
  const lead = leadClaim(m);
  const primary: Claim | null = lead
    ? { ...lead, text: { en: firstSentence(lead.text.en), hi: firstSentence(lead.text.hi) } }
    : null;
  return { id: m.id, area: m.area, state: m.state, primary, extra: [], basisRuleIds: [] };
}

/** A module with nothing to say (exports skip it). */
function emptyModule(m: Module): Module {
  return { id: m.id, area: m.area, state: m.state, primary: null, extra: [], basisRuleIds: [] };
}

function redact(synthesis: FinishedSynthesis, locked: readonly SectionKey[], reduce: (m: Module) => Module): FinishedSynthesis {
  if (locked.length === 0) return synthesis;
  const ids = lockedModuleIds(locked);
  const hidden = new Set<string>();
  for (const id of ids) for (const c of moduleClaims(synthesis.modules[id])) hidden.add(c.text.en);
  const modules = { ...synthesis.modules };
  for (const id of MODULE_IDS) if (ids.has(id)) modules[id] = reduce(synthesis.modules[id]);
  // The glance never repeats a locked sentence (the synthesis should not, but
  // this is where a leak would show first).
  const safe = (c: Claim | null): Claim | null => (c && hidden.has(c.text.en) ? { ...c, text: LOCKED_GLANCE_LINE } : c);
  const lockedAreas = new Set([...ids].map((id) => MODULE_AREA[id]));
  const overview = {
    ...synthesis.overview,
    sentence: hidden.has(synthesis.overview.sentence.en) ? LOCKED_GLANCE_LINE : synthesis.overview.sentence,
    story: synthesis.overview.story.map((c) => safe(c)!),
    strength: safe(synthesis.overview.strength),
    challenge: safe(synthesis.overview.challenge),
  };
  return {
    ...synthesis,
    overview,
    modules,
    // A theme of a locked area is its reading in other words.
    themes: synthesis.themes.filter((t) => !lockedAreas.has(t.area)),
  };
}

/** For the screen: locked parts keep only their first sentence. */
export function lockSynthesis(synthesis: FinishedSynthesis, locked: readonly SectionKey[]): FinishedSynthesis {
  return redact(synthesis, locked, teaserModule);
}

/** For PDF, share, Listen, Compare, history: locked parts carry nothing at all. */
export function openPartsOnly(synthesis: FinishedSynthesis, locked: readonly SectionKey[]): FinishedSynthesis {
  return redact(synthesis, locked, emptyModule);
}

/** A locked part's teaser: its title and first sentence (null when it had nothing to say). */
export function lockedTeaser(synthesis: FinishedSynthesis, key: SectionKey, lang: Lang): { title: string; sentence: string | null } {
  const lead = SECTION_MODULES[key].map((id) => leadClaim(synthesis.modules[id])).find(Boolean) ?? null;
  return { title: pickL(lang, SECTION_TITLES[key]), sentence: lead ? firstSentence(pickL(lang, lead.text)) : null };
}

/**
 * The paywall's faded teaser (DEC-042): the first sentence of each locked
 * module's lead, the `first` part first, then the other locked parts, at most
 * `max`. Only sentences the locked report tile already shows (`lockSynthesis`
 * keeps exactly these), so the fade hides nothing that is not already public —
 * no hidden sentence reaches the paywall.
 */
export function lockedTeaserLines(
  synthesis: FinishedSynthesis,
  locked: readonly SectionKey[],
  first: SectionKey | null,
  lang: Lang,
  max = 3,
): string[] {
  const order = first && locked.includes(first) ? [first, ...locked.filter((k) => k !== first)] : [...locked];
  const out: string[] = [];
  for (const key of order) {
    for (const id of SECTION_MODULES[key]) {
      const lead = leadClaim(synthesis.modules[id]);
      const line = lead ? firstSentence(pickL(lang, lead.text)) : '';
      if (line && !out.includes(line)) out.push(line);
      if (out.length >= max) return out;
    }
  }
  return out;
}

/** The palm lines read ONLY by locked parts: dimmed on the paywall's photo. */
export function linesOnlyInLocked(synthesis: FinishedSynthesis, locked: readonly SectionKey[]): string[] {
  const open = new Set(SECTION_KEYS.filter((k) => !locked.includes(k)).flatMap((k) => sectionLines(SECTION_MODULES[k].map((id) => synthesis.modules[id]))));
  const closed = locked.flatMap((k) => sectionLines(SECTION_MODULES[k].map((id) => synthesis.modules[id])));
  return [...new Set(closed.filter((l) => !open.has(l)))];
}

/* ── Unlocking (0017) ─────────────────────────────────────────────────── */

export type UnlockRoute = 'open' | 'confirm' | 'paywall';

/**
 * What a tap on a locked part does: Pro (or unlimited) opens it at once; a
 * user with paid readings is asked to spend one; everyone else sees the
 * paywall. Without a server session there is nothing to unlock by credit.
 */
export function unlockRoute(input: { proActive: boolean; unlimited?: boolean; paidAvailable: number; hasSession: boolean }): UnlockRoute {
  if (input.proActive || input.unlimited) return 'open';
  if (input.paidAvailable > 0 && input.hasSession) return 'confirm';
  return 'paywall';
}

export type UnlockFailure = 'no_readings' | 'not_charged' | 'not_found' | 'unavailable' | 'network' | 'error';

/** An `unlock_reading` / `reading_access` error → what the screen does about it. */
export function unlockFailureOf(error: { message?: string | null; code?: string | null } | null | undefined): UnlockFailure {
  const message = String(error?.message ?? '');
  const code = String(error?.code ?? '');
  if (code === 'P0014' || /no_readings_left/.test(message)) return 'no_readings';
  if (code === 'P0017' || /reading_not_charged/.test(message)) return 'not_charged';
  if (/session_not_found/.test(message)) return 'not_found';
  // PostgREST: the function does not exist yet (0017 not applied).
  if (code === 'PGRST202' || code === '42883' || /could not find the function|function .* does not exist/i.test(message)) return 'unavailable';
  if (/network|fetch|timeout|failed to fetch/i.test(message)) return 'network';
  return 'error';
}

/** `unlock_reading`'s answer → ok, or null when it is not a success. */
export function unlockOk(data: unknown): { charged: boolean; paidLeft: number | null } | null {
  if (!data || typeof data !== 'object') return null;
  const row = data as Record<string, unknown>;
  if (row.ok !== true || row.access !== 'full') return null;
  const left = typeof row.paid_left === 'number' && Number.isFinite(row.paid_left) ? Math.max(0, Math.floor(row.paid_left)) : null;
  return { charged: row.charged === true, paidLeft: left };
}

/** `reading_access` rows → session id → access. Unknown values are dropped. */
export function accessRows(data: unknown): Map<string, ReadingAccess> {
  const out = new Map<string, ReadingAccess>();
  if (!Array.isArray(data)) return out;
  for (const row of data) {
    if (!row || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    if (typeof r.session_id === 'string' && (r.access === 'full' || r.access === 'partial')) out.set(r.session_id, r.access);
  }
  return out;
}

/** `reading_access` takes at most 200 ids per call (too_many_ids above). */
export const ACCESS_BATCH = 200;

export function batches<T>(items: readonly T[], size = ACCESS_BATCH): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
