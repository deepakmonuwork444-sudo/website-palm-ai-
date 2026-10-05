/**
 * A few questions before the scan (owner request 2026-09-27): three short
 * glass steps with progress dots — about you (name, how to address you),
 * your hands (the hand in the photo, the hand you write with), your birth
 * details (date or age, time; optional). Every question is optional and
 * "Skip questions" starts the reading at once with what was answered, so the
 * questions never stand between the visitor and their reading.
 *
 * The details stay on this device (personal.ts); only the hands reach the
 * reading, exactly as the old "Which hand is this?" questions did.
 * `DetailsForm` is the same fields in one form, to add or edit them later
 * from the report.
 */

import { useEffect, useId, useRef, useState } from 'react';

type FormEvent = { preventDefault(): void };

import type { Locale } from '../../config/site';
import {
  INTAKE_COPY as T,
  MAX_AGE,
  MIN_AGE,
  NAME_MAX,
  addressName,
  cleanDetails,
  cleanName,
  gendered,
  isAdultBirthDate,
  isValidAge,
  isValidBirthDate,
  isoDay,
  type Gender,
  type PersonalDetails,
  type Side,
} from '../../lib/reading/personal';
import { CheckIcon, ShieldIcon } from './Icons';

type StepKey = 'you' | 'hands' | 'birth';
const STEPS: StepKey[] = ['you', 'hands', 'birth'];
const GENDERS: Gender[] = ['woman', 'man', 'unsaid'];
const SIDES: Side[] = ['left', 'right'];
/** date: not a real past date; young: a real date, but under 18; age: a typed age outside 18 to 120. */
type BirthErrors = { date?: boolean; young?: boolean; age?: boolean };

function Choice<V extends string>({ label, value, options, onPick, describedBy, wide }: { label: string; value: V | null; options: { value: V; text: string }[]; onPick: (v: V) => void; describedBy?: string; wide?: boolean }) {
  return (
    <div className={wide ? 'rd-pills rd-pills-wide' : 'rd-segmented'} role="radiogroup" aria-label={label} aria-describedby={describedBy}>
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} className={wide ? 'rd-pill' : value === o.value ? 'rd-seg rd-seg-on' : 'rd-seg'} onClick={() => onPick(o.value)}>
          {wide && value === o.value && <CheckIcon />}
          <span>{o.text}</span>
        </button>
      ))}
    </div>
  );
}

function YouFields({ draft, set, locale }: { draft: PersonalDetails; set: (patch: Partial<PersonalDetails>) => void; locale: Locale }) {
  const id = useId();
  return (
    <>
      <div className="rd-field">
        <label htmlFor={`${id}-name`}>{T.nameLabel[locale]}</label>
        <input
          id={`${id}-name`}
          className="rd-input"
          type="text"
          autoComplete="given-name"
          enterKeyHint="next"
          spellCheck={false}
          maxLength={NAME_MAX}
          placeholder={T.namePlaceholder[locale]}
          value={draft.name}
          onChange={(e) => set({ name: e.target.value.slice(0, NAME_MAX * 2) })}
        />
      </div>
      <fieldset className="rd-choice">
        <legend>{T.genderLabel[locale]}</legend>
        <p id={`${id}-why`} className="text-small rd-muted">
          {T.genderWhy[locale]}
        </p>
        <Choice wide label={T.genderLabel[locale]} describedBy={`${id}-why`} value={draft.gender} options={GENDERS.map((g) => ({ value: g, text: T.genders[g][locale] }))} onPick={(gender) => set({ gender })} />
      </fieldset>
    </>
  );
}

function HandFields({ draft, set, locale, shownHand }: { draft: PersonalDetails; set: (patch: Partial<PersonalDetails>) => void; locale: Locale; shownHand: Side }) {
  const sides = SIDES.map((s) => ({ value: s, text: T[s][locale] }));
  const writeLabel = locale === 'hi' ? gendered(draft.gender, T.writeHandLabel.hi) : T.writeHandLabel.en;
  return (
    <>
      <fieldset className="rd-choice">
        <legend>{T.photoHandLabel[locale]}</legend>
        <Choice label={T.photoHandLabel[locale]} value={draft.hand ?? shownHand} options={sides} onPick={(hand) => set({ hand })} />
      </fieldset>
      <fieldset className="rd-choice">
        <legend>{writeLabel}</legend>
        <Choice label={writeLabel} value={draft.writeHand} options={sides} onPick={(writeHand) => set({ writeHand })} />
      </fieldset>
    </>
  );
}

function BirthFields({ draft, set, locale, errors }: { draft: PersonalDetails; set: (patch: Partial<PersonalDetails>) => void; locale: Locale; errors: BirthErrors }) {
  const id = useId();
  const [ageMode, setAgeMode] = useState(() => !draft.birthDate && draft.age !== null);
  const [ageText, setAgeText] = useState(() => (draft.age !== null ? String(draft.age) : ''));
  const today = isoDay(new Date());
  return (
    <>
      {ageMode ? (
        <div className="rd-field">
          <label htmlFor={`${id}-age`}>
            {T.ageLabel[locale]} <span className="rd-opt">({T.optional[locale]})</span>
          </label>
          <input
            id={`${id}-age`}
            className="rd-input rd-input-short"
            type="number"
            inputMode="numeric"
            min={MIN_AGE}
            max={MAX_AGE}
            value={ageText}
            aria-invalid={errors.age || undefined}
            aria-describedby={errors.age ? `${id}-age-err` : undefined}
            onChange={(e) => {
              setAgeText(e.target.value);
              const n = Number(e.target.value);
              set({ age: e.target.value === '' ? null : Number.isFinite(n) ? n : -1, birthDate: '' });
            }}
          />
          {errors.age && (
            <p id={`${id}-age-err`} className="text-small rd-field-error" role="alert">
              {T.badAge[locale]}
            </p>
          )}
        </div>
      ) : (
        <div className="rd-field">
          <label htmlFor={`${id}-date`}>
            {T.birthDateLabel[locale]} <span className="rd-opt">({T.optional[locale]})</span>
          </label>
          <input
            id={`${id}-date`}
            className="rd-input rd-input-short"
            type="date"
            min="1900-01-01"
            max={today}
            value={draft.birthDate}
            aria-invalid={errors.date || errors.young || undefined}
            aria-describedby={errors.date || errors.young ? `${id}-date-err` : undefined}
            onChange={(e) => set({ birthDate: e.target.value, age: null })}
          />
          {(errors.date || errors.young) && (
            <p id={`${id}-date-err`} className="text-small rd-field-error" role="alert">
              {errors.young ? T.tooYoung[locale] : T.badDate[locale]}
            </p>
          )}
        </div>
      )}
      <button
        type="button"
        className="text-link rd-link-button rd-link-left"
        onClick={() => {
          setAgeMode((on) => !on);
          setAgeText('');
          set({ age: null, birthDate: '' });
        }}
      >
        {ageMode ? T.dateInstead[locale] : T.ageInstead[locale]}
      </button>
      <div className="rd-field">
        <label htmlFor={`${id}-time`}>
          {T.birthTimeLabel[locale]} <span className="rd-opt">({T.optional[locale]})</span>
        </label>
        <input id={`${id}-time`} className="rd-input rd-input-short" type="time" value={draft.birthTime} onChange={(e) => set({ birthTime: e.target.value })} />
      </div>
    </>
  );
}

/** Birth answers that cannot be kept (a date in the future, an age of 300, someone under 18). Empty = fine. */
function birthErrors(draft: PersonalDetails): BirthErrors {
  const out: BirthErrors = {};
  const today = new Date();
  if (draft.birthDate && !isValidBirthDate(draft.birthDate, today)) out.date = true;
  else if (draft.birthDate && !isAdultBirthDate(draft.birthDate, today)) out.young = true;
  if (draft.age !== null && !isValidAge(draft.age)) out.age = true;
  return out;
}

function PrivateLine({ locale }: { locale: Locale }) {
  return (
    <p className="rd-intake-private text-small">
      <ShieldIcon />
      <span>{T.deviceOnly[locale]}</span>
    </p>
  );
}

export function Intake({
  locale,
  initial,
  shownHand,
  photoUrl,
  onDone,
  onSkip,
  onExit,
}: {
  locale: Locale;
  initial: PersonalDetails;
  /** The hand the reading will use unless they pick another (the machine's suggestion). */
  shownHand: Side;
  photoUrl: string | null;
  onDone: (details: PersonalDetails) => void;
  onSkip: (details: PersonalDetails) => void;
  onExit: () => void;
}) {
  const [draft, setDraft] = useState<PersonalDetails>(initial);
  const [index, setIndex] = useState(0);
  const [errors, setErrors] = useState<BirthErrors>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const titleId = useId();
  const first = useRef(true);
  const step = STEPS[index]!;
  const last = index === STEPS.length - 1;
  const set = (patch: Partial<PersonalDetails>) => {
    setDraft((d) => ({ ...d, ...patch }));
    if ('birthDate' in patch || 'age' in patch) setErrors({});
  };
  const final = (d: PersonalDetails): PersonalDetails => cleanDetails({ ...d, hand: d.hand ?? shownHand });

  // A new step: its heading takes focus (screen readers hear where they are), and the card comes into view.
  useEffect(() => {
    const heading = headingRef.current;
    if (!heading) return;
    if (first.current) {
      first.current = false;
    } else {
      heading.focus({ preventScroll: true });
    }
    const root = document.getElementById('reading-root');
    if (root && root.getBoundingClientRect().top < 0) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      root.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    }
  }, [index]);

  const next = (event: FormEvent) => {
    event.preventDefault();
    if (step === 'birth') {
      const found = birthErrors(draft);
      if (found.date || found.young || found.age) {
        setErrors(found);
        return;
      }
    }
    if (last) onDone(final(draft));
    else setIndex((i) => i + 1);
  };
  const back = () => (index === 0 ? onExit() : setIndex((i) => i - 1));
  const skip = () => {
    const found = birthErrors(draft);
    onSkip(final({ ...draft, ...(found.date || found.young ? { birthDate: '' } : {}), ...(found.age ? { age: null } : {}) }));
  };

  const who = addressName(cleanName(draft.name), locale);
  const titles: Record<StepKey, string> = { you: T.youTitle[locale], hands: T.handsTitle[locale], birth: T.birthTitle[locale] };
  const leads: Record<StepKey, string> = { you: T.youLead[locale], hands: T.handsLead[locale], birth: T.birthLead[locale] };
  const stepText = T.step[locale].replace('{n}', String(index + 1)).replace('{total}', String(STEPS.length));

  return (
    <section className="rd-card rd-intake" aria-labelledby={titleId}>
      <div className="rd-intake-top">
        <ol className="rd-dots" aria-label={stepText}>
          {STEPS.map((s, i) => (
            <li key={s} className={i === index ? 'rd-dot-step rd-dot-now' : i < index ? 'rd-dot-step rd-dot-done' : 'rd-dot-step'} aria-current={i === index ? 'step' : undefined} />
          ))}
        </ol>
        <button type="button" className="rd-skip" onClick={skip}>
          {T.skip[locale]}
        </button>
      </div>
      {index === 0 && photoUrl && (
        <p className="rd-intake-photo text-small">
          <img src={photoUrl} alt="" width={44} height={44} />
          <CheckIcon />
          <span>{T.photoReady[locale]}</span>
        </p>
      )}
      <form key={step} className="rd-intake-step" onSubmit={next} noValidate>
        {step === 'birth' && who && <p className="rd-intake-eyebrow">{T.thanks[locale].replace('{name}', who)}</p>}
        <h2 id={titleId} ref={headingRef} tabIndex={-1} className="text-h2 font-display">
          {titles[step]}
        </h2>
        <p className="rd-intake-lead">{leads[step]}</p>
        {step === 'you' && <YouFields draft={draft} set={set} locale={locale} />}
        {step === 'hands' && <HandFields draft={draft} set={set} locale={locale} shownHand={shownHand} />}
        {step === 'birth' && <BirthFields draft={draft} set={set} locale={locale} errors={errors} />}
        <div className="rd-intake-actions">
          <button type="submit" className="btn btn-gold btn-block">
            {last ? T.start[locale] : T.next[locale]}
          </button>
          <button type="button" className="btn btn-secondary btn-block" onClick={back}>
            {T.back[locale]}
          </button>
        </div>
      </form>
      <PrivateLine locale={locale} />
    </section>
  );
}

/** The same questions (name, address, birth) in one form, to add or edit them from the report. */
export function DetailsForm({ locale, initial, onSave }: { locale: Locale; initial: PersonalDetails; onSave: (details: PersonalDetails) => void }) {
  const [draft, setDraft] = useState<PersonalDetails>(initial);
  const [errors, setErrors] = useState<BirthErrors>({});
  const set = (patch: Partial<PersonalDetails>) => {
    setDraft((d) => ({ ...d, ...patch }));
    if ('birthDate' in patch || 'age' in patch) setErrors({});
  };
  const save = (event: FormEvent) => {
    event.preventDefault();
    const found = birthErrors(draft);
    if (found.date || found.young || found.age) {
      setErrors(found);
      return;
    }
    onSave(cleanDetails(draft));
  };
  return (
    <form className="rd-intake-step rd-details-form" onSubmit={save} noValidate>
      <YouFields draft={draft} set={set} locale={locale} />
      <p className="rd-intake-lead text-small">{T.birthLead[locale]}</p>
      <BirthFields draft={draft} set={set} locale={locale} errors={errors} />
      <button type="submit" className="btn btn-gold btn-block">
        {T.save[locale]}
      </button>
      <PrivateLine locale={locale} />
    </form>
  );
}
