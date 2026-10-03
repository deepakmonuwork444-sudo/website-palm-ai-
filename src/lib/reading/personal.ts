/**
 * The visitor's own details for a personal report (owner request 2026-09-27):
 * name, how to address them, which hand is in the photo and which hand they
 * write with, date (or age) and time of birth. All optional; "Skip" never
 * blocks the scan.
 *
 * PRIVACY: kept ONLY in this browser (localStorage), next to the readings
 * saved here. Never sent to the server, never in analytics, never in a share
 * text. The hands go to the reading as before (hand + "writes with it"); the
 * name, gender and birth details never leave the device.
 *
 * HONESTY: palmistry reads the hand, not the birth date or time. The birth
 * details only personalise the report and the PDF; they never change the
 * reading. The reading's sentences come from the app's engine (lib/palm, no
 * gender option); this file only writes the words AROUND them.
 */

import type { Locale } from '../../config/site';

export type Gender = 'woman' | 'man' | 'unsaid';
export type Side = 'left' | 'right';

export interface PersonalDetails {
  name: string;
  gender: Gender | null;
  /** The hand in the photo. */
  hand: Side | null;
  /** The hand they write with. */
  writeHand: Side | null;
  /** YYYY-MM-DD or ''. */
  birthDate: string;
  /** Only when no birth date is given; null = not given. */
  age: number | null;
  /** HH:MM (24 h) or ''. */
  birthTime: string;
}

export const EMPTY_DETAILS: PersonalDetails = { name: '', gender: null, hand: null, writeHand: null, birthDate: '', age: null, birthTime: '' };

export const NAME_MAX = 40;
const GENDERS: readonly Gender[] = ['woman', 'man', 'unsaid'];
const SIDES: readonly Side[] = ['left', 'right'];

/** A name as typed, made safe to show and print: no control or markup characters, single spaces, at most 40 characters. */
export function cleanName(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const text = raw
    .normalize('NFC')
    .replace(/[\p{Cc}\p{Cf}<>{}[\]\\/|`^~=*_#@$%]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return Array.from(text).slice(0, NAME_MAX).join('').trim();
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Today as YYYY-MM-DD in the visitor's own time zone (the date input's max). */
export function isoDay(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** A real calendar day, not before 1900, not in the future. */
export function isValidBirthDate(value: unknown, today: Date): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number) as [number, number, number];
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return false;
  return y >= 1900 && value <= isoDay(today);
}

export function isValidBirthTime(value: unknown): value is string {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function isValidAge(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 120;
}

/** Age in whole years on `today`. */
export function ageOn(birthDate: string, today: Date): number | null {
  if (!isValidBirthDate(birthDate, today)) return null;
  const [y, m, d] = birthDate.split('-').map(Number) as [number, number, number];
  let age = today.getFullYear() - y;
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age -= 1;
  return age;
}

/** Anything read back from storage (or a form) → safe details; unknown values are dropped. */
export function cleanDetails(raw: unknown, today: Date = new Date()): PersonalDetails {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const birthDate = isValidBirthDate(r.birthDate, today) ? r.birthDate : '';
  return {
    name: cleanName(r.name),
    gender: GENDERS.includes(r.gender as Gender) ? (r.gender as Gender) : null,
    hand: SIDES.includes(r.hand as Side) ? (r.hand as Side) : null,
    writeHand: SIDES.includes(r.writeHand as Side) ? (r.writeHand as Side) : null,
    birthDate,
    age: !birthDate && isValidAge(r.age) ? r.age : null,
    birthTime: isValidBirthTime(r.birthTime) ? r.birthTime : '',
  };
}

/** Did they tell us anything personal (beyond the hands)? */
export function isPersonal(d: PersonalDetails | null): boolean {
  return Boolean(d && (d.name || d.gender || d.birthDate || d.age !== null || d.birthTime));
}

/** "Is this the hand you write with?" for the reading, from the two hand answers (null = not answered). */
export function writesWithShown(d: Pick<PersonalDetails, 'hand' | 'writeHand'>, shown: Side): boolean | null {
  if (!d.writeHand) return null;
  return d.writeHand === (d.hand ?? shown);
}

/* ── this browser only ─────────────────────────────────────────────────── */

/** The last details typed here (to fill the form next time). */
export const LAST_KEY = 'palmsays-reading-me';
/** Details per saved reading (a second reading may be for someone else). */
export const BY_READING_KEY = 'palmsays-reading-people';

export interface KeyValue {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** localStorage when it works (private modes may block it); null = nothing is kept. */
export function deviceStorage(): KeyValue | null {
  try {
    const s = globalThis.localStorage;
    if (!s) return null;
    const probe = '__palmsays_probe';
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

function readJson(storage: KeyValue | null, key: string): unknown {
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}

function writeJson(storage: KeyValue | null, key: string, value: unknown): void {
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked: the details last for this page only.
  }
}

export function loadLast(storage: KeyValue | null, today: Date = new Date()): PersonalDetails | null {
  const raw = readJson(storage, LAST_KEY);
  return raw ? cleanDetails(raw, today) : null;
}

export function saveLast(storage: KeyValue | null, details: PersonalDetails): void {
  writeJson(storage, LAST_KEY, cleanDetails(details));
}

function allByReading(storage: KeyValue | null): Record<string, unknown> {
  const raw = readJson(storage, BY_READING_KEY);
  return raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
}

export function detailsForReading(storage: KeyValue | null, readingId: string, today: Date = new Date()): PersonalDetails | null {
  const raw = allByReading(storage)[readingId];
  return raw ? cleanDetails(raw, today) : null;
}

/** Keeps `details` with a saved reading (null forgets them). Readings no longer saved here can be pruned with `keep`. */
export function linkDetails(storage: KeyValue | null, readingId: string, details: PersonalDetails | null, keep?: readonly string[]): void {
  const all = allByReading(storage);
  if (details) all[readingId] = cleanDetails(details);
  else delete all[readingId];
  if (keep) for (const id of Object.keys(all)) if (id !== readingId && !keep.includes(id)) delete all[id];
  writeJson(storage, BY_READING_KEY, all);
}

/* ── words around the reading ─────────────────────────────────────────── */

/** Hindi grammar that follows the chosen gender; `n` is a sentence built with no gendered verb. */
export function gendered(gender: Gender | null | undefined, forms: { m: string; f: string; n: string }): string {
  if (gender === 'woman') return forms.f;
  if (gender === 'man') return forms.m;
  return forms.n;
}

/** How the report addresses them, with respect (owner): "Deepak ji" in English, "Deepak जी" in Hindi (never twice). */
export function addressName(name: string, locale: Locale): string {
  const clean = cleanName(name);
  if (!clean || /(\s|-)(जी|ji|jee)$/i.test(clean)) return clean;
  return locale === 'en' ? `${clean} ji` : `${clean} जी`;
}

/** The report's heading. */
export function reportTitle(details: PersonalDetails | null, locale: Locale): string {
  const who = addressName(details?.name ?? '', locale);
  if (locale === 'hi') return who ? `${who}, आपकी हस्तरेखा रीडिंग` : 'आपकी हथेली';
  return who ? `${who}, your palm reading` : 'Your palm';
}

/** What the reading's own "at a glance" holds (never invented). */
export interface GlanceShape {
  /** The palm had too little clear to say ("insufficient" overview). */
  insufficient: boolean;
  hasStrength: boolean;
}

/**
 * The warm opening under the heading: follows the reading's own glance, claims
 * nothing about the person, and (in Hindi) follows the chosen gender.
 */
export function openingLine(details: PersonalDetails | null, glance: GlanceShape, locale: Locale): string {
  const g = details?.gender ?? null;
  if (locale === 'hi') {
    const lead = glance.insufficient
      ? 'इस फ़ोटो में रेखाएं पूरी साफ़ नहीं दिखीं, इसलिए यह रीडिंग छोटी और सच्ची रखी गई है।'
      : glance.hasStrength
        ? 'आपकी रेखाओं में एक सुंदर कहानी है। शुरुआत उस स्वाभाविक ताकत से कीजिए जो आपकी हथेली नीचे दिखाती है।'
        : 'आपकी रेखाएं क्या कहती हैं, वह नीचे है। आराम से पढ़िए और हर बात अपने हाथ से मिलाइए।';
    const tail = gendered(g, {
      m: 'आप यह रीडिंग इसी डिवाइस पर कभी भी दोबारा देख सकते हैं।',
      f: 'आप यह रीडिंग इसी डिवाइस पर कभी भी दोबारा देख सकती हैं।',
      n: 'यह रीडिंग इसी डिवाइस पर कभी भी दोबारा देखी जा सकती है।',
    });
    return `${lead} ${tail}`;
  }
  if (glance.insufficient) return 'Your photo showed only part of your lines, so this reading stays short and honest. You can come back to it any time on this device.';
  if (glance.hasStrength) return 'Your lines have a lovely story to tell. Start with the natural strength your palm shows below, and take your time.';
  return 'Here is what your lines say. Read it slowly and compare each point with your own hand.';
}

/* ── the form's words (English + Hindi; Hindi follows the chosen gender) ── */

export const INTAKE_COPY = {
  skip: { en: 'Skip questions', hi: 'सवाल छोड़ें' },
  next: { en: 'Next', hi: 'आगे' },
  back: { en: 'Back', hi: 'पीछे' },
  start: { en: 'Start my reading', hi: 'मेरी रीडिंग शुरू करें' },
  save: { en: 'Save my details', hi: 'मेरी जानकारी सहेजें' },
  step: { en: 'Step {n} of {total}', hi: 'चरण {n} / {total}' },
  photoReady: { en: 'Photo ready', hi: 'फ़ोटो तैयार है' },
  deviceOnly: {
    en: 'These details stay on this device only. They are never sent to us.',
    hi: 'यह जानकारी सिर्फ़ इसी डिवाइस पर रहती है। हमें कभी नहीं भेजी जाती।',
  },
  optional: { en: 'Optional', hi: 'ज़रूरी नहीं' },

  youTitle: { en: 'A little about you', hi: 'आपके बारे में थोड़ा-सा' },
  youLead: {
    en: 'So your report can speak to you by name. Every question is optional.',
    hi: 'ताकि आपकी रिपोर्ट आपको नाम से बुलाए। हर सवाल ज़रूरी नहीं है।',
  },
  nameLabel: { en: 'Your name', hi: 'आपका नाम' },
  namePlaceholder: { en: 'e.g. Deepak', hi: 'जैसे दीपक' },
  genderLabel: { en: 'How should we address you?', hi: 'हम आपको कैसे संबोधित करें?' },
  genderWhy: {
    en: 'Only for respectful wording: in Hindi the words change with it.',
    hi: 'सिर्फ़ सही और सम्मान वाले शब्दों के लिए। हिंदी में शब्द इसी से बदलते हैं।',
  },
  genders: {
    woman: { en: 'Woman', hi: 'महिला' },
    man: { en: 'Man', hi: 'पुरुष' },
    unsaid: { en: 'Prefer not to say', hi: 'न बताना चाहें' },
  },

  handsTitle: { en: 'Your hands', hi: 'आपके हाथ' },
  handsLead: {
    en: 'Palm readers read the two hands a little differently, so this helps your reading.',
    hi: 'हस्तरेखा में दोनों हाथ थोड़े अलग तरह से पढ़े जाते हैं, इसलिए इससे आपकी रीडिंग सही बनती है।',
  },
  photoHandLabel: { en: 'Which hand is in your photo?', hi: 'फ़ोटो में कौन-सा हाथ है?' },
  writeHandLabel: {
    en: 'Which hand do you write with?',
    hi: { m: 'आप किस हाथ से लिखते हैं?', f: 'आप किस हाथ से लिखती हैं?', n: 'आपका लिखने वाला हाथ कौन-सा है?' },
  },
  left: { en: 'Left', hi: 'बायां' },
  right: { en: 'Right', hi: 'दायां' },

  birthTitle: { en: 'Your birth details', hi: 'आपके जन्म की जानकारी' },
  birthLead: {
    en: "Palmistry reads the lines of your hand, not your birth date or time, so these don't change your reading. We only print them on your report and PDF, as a keepsake.",
    hi: 'हस्तरेखा आपके हाथ की रेखाएं पढ़ती है, जन्म की तारीख़ या समय नहीं, इसलिए इनसे आपकी रीडिंग नहीं बदलती। हम इन्हें सिर्फ़ आपकी रिपोर्ट और PDF पर यादगार के तौर पर लिखते हैं।',
  },
  birthDateLabel: { en: 'Date of birth', hi: 'जन्म की तारीख़' },
  ageInstead: { en: 'Enter my age instead', hi: 'इसकी जगह उम्र लिखें' },
  dateInstead: { en: 'Enter my date of birth instead', hi: 'इसकी जगह जन्म की तारीख़ लिखें' },
  ageLabel: { en: 'Your age', hi: 'आपकी उम्र' },
  birthTimeLabel: { en: 'Time of birth', hi: 'जन्म का समय' },
  badDate: { en: 'Pick a real date, not in the future.', hi: 'कोई सही तारीख़ चुनें, जो आगे की न हो।' },
  badAge: { en: 'Type an age from 1 to 120.', hi: '1 से 120 के बीच उम्र लिखें।' },

  editTitle: { en: 'Your details', hi: 'आपकी जानकारी' },
  addDetails: { en: 'Add your name to this report', hi: 'इस रिपोर्ट में अपना नाम जोड़ें' },
  editDetails: { en: 'Edit your details', hi: 'अपनी जानकारी बदलें' },
  born: { en: 'Born', hi: 'जन्म' },
  ageShort: { en: 'Age {n}', hi: 'उम्र {n}' },
  thanks: { en: 'Thank you, {name}.', hi: 'धन्यवाद, {name}।' },
  saved: { en: 'Saved on this device.', hi: 'इसी डिवाइस पर सेव हो गया।' },
} as const;

/** "Writes with the right hand" — Hindi follows the gender (neutral: "लिखने वाला हाथ: दायां"). */
export function writesWithText(details: PersonalDetails, locale: Locale): string | null {
  if (!details.writeHand) return null;
  if (locale === 'en') return `Writes with the ${details.writeHand} hand`;
  const side = details.writeHand === 'left' ? 'बाएं' : 'दाएं';
  return gendered(details.gender, {
    m: `${side} हाथ से लिखते हैं`,
    f: `${side} हाथ से लिखती हैं`,
    n: `लिखने वाला हाथ: ${details.writeHand === 'left' ? 'बायां' : 'दायां'}`,
  });
}

/** "12 March 1990, 10:30 am" / "12 मार्च 1990, 10:30" / "Age 34"; null when nothing was given. */
export function birthText(details: PersonalDetails, locale: Locale): string | null {
  const tag = locale === 'hi' ? 'hi-IN' : 'en-IN';
  let out = '';
  if (details.birthDate) {
    const [y, m, d] = details.birthDate.split('-').map(Number) as [number, number, number];
    out = new Date(y, m - 1, d).toLocaleDateString(tag, { day: 'numeric', month: 'long', year: 'numeric' });
  } else if (details.age !== null) {
    return INTAKE_COPY.ageShort[locale].replace('{n}', String(details.age));
  }
  if (details.birthTime) {
    const [h, min] = details.birthTime.split(':').map(Number) as [number, number];
    const time = new Date(2000, 0, 1, h, min).toLocaleTimeString(tag, { hour: 'numeric', minute: '2-digit' });
    out = out ? `${out}, ${time}` : time;
  }
  return out ? `${INTAKE_COPY.born[locale]}: ${out}` : null;
}
