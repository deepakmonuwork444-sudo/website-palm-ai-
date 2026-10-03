/**
 * The revealed reading (plan §7.9, DESIGN_SYSTEM.md §7.5–7.6): the traced
 * photo and line chips, "Your palm at a glance" (the one gold-framed card),
 * Love and Personality in full, then Career & Money and Life Direction as
 * locked cards with their real first sentence — the rest of those parts was
 * dropped before this reading was stored, so it is not in the DOM.
 *
 * Personal (owner 2026-09-27): with the details typed on this device the
 * heading speaks to the reader by name ("Deepak," / "दीपक जी,"), a warm
 * opening follows the reading's own at-a-glance, and "Keep and share" offers
 * the PDF, WhatsApp, the phone's share sheet and "Copy link".
 */

import { useMemo, useState } from 'react';

import type { Locale } from '../../config/site';
import type { Balance, WebUser } from '../../lib/reading/api';
import { AUTH_COPY } from '../../lib/auth/copy';
import { COPY } from '../../lib/reading/copy';
import type { ReadingFlow } from '../../lib/reading/machine';
import {
  EMPTY_DETAILS,
  INTAKE_COPY,
  birthText,
  detailsForReading,
  deviceStorage,
  isPersonal,
  linkDetails,
  openingLine,
  reportTitle,
  saveLast,
  writesWithText,
  type PersonalDetails,
} from '../../lib/reading/personal';
import { buildReportView, nextStep, type ReportView } from '../../lib/reading/report';
import type { SavedReading } from '../../lib/reading/store';
import { LockIcon, PenIcon } from './Icons';
import { DetailsForm } from './Intake';
import KeepShare from './KeepShare';
import { Sheet } from './Sheets';
import { usePhotoUrl } from './hooks';
import ReportPhoto from './ReportPhoto';
import Store from './Store';

export default function Report({
  flow,
  reading,
  locale,
  balance,
  user,
  readingsCount,
}: {
  flow: ReadingFlow;
  reading: SavedReading;
  locale: Locale;
  balance: Balance | null;
  user: WebUser | null;
  readingsCount: number;
}) {
  const url = usePhotoUrl(reading.photo);
  const view: ReportView | null = useMemo(() => (reading.synthesis ? buildReportView(reading.synthesis, locale) : null), [reading, locale]);
  const step = nextStep(balance, user);
  const hand = reading.handSide === 'left' ? COPY.leftHand[locale] : COPY.rightHand[locale];
  const date = new Date(reading.createdAt).toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long' });
  const [details, setDetails] = useState<PersonalDetails | null>(() => detailsForReading(deviceStorage(), reading.id));
  const [editing, setEditing] = useState(false);
  const overview = reading.synthesis?.overview;
  const opening = view ? openingLine(details, { insufficient: overview?.pattern === 'insufficient', hasStrength: Boolean(overview?.strength) }, locale) : null;
  const facts = details ? [writesWithText(details, locale), birthText(details, locale)].filter((x): x is string => Boolean(x)) : [];
  const saveDetails = (next: PersonalDetails) => {
    const merged: PersonalDetails = { ...next, hand: details?.hand ?? null, writeHand: details?.writeHand ?? null };
    linkDetails(deviceStorage(), reading.id, merged);
    saveLast(deviceStorage(), merged);
    setDetails(merged);
    setEditing(false);
  };

  return (
    <article className="rd-report" aria-labelledby="rd-report-title">
      <header className="rd-report-head">
        <h2 id="rd-report-title" className="text-h2 font-display">
          {reportTitle(details, locale)}
        </h2>
        {opening && <p className="rd-opening">{opening}</p>}
        <p className="rd-muted text-small">
          {[hand, date, ...facts].join(' · ')}
        </p>
        <button type="button" className="text-link rd-link-button rd-link-left rd-edit-details" onClick={() => setEditing(true)}>
          <PenIcon />
          <span>{isPersonal(details) ? INTAKE_COPY.editDetails[locale] : INTAKE_COPY.addDetails[locale]}</span>
        </button>
        {reading.preview && <p className="rd-preview text-small">{COPY.previewLabel[locale]}</p>}
      </header>
      {editing && (
        <Sheet title={INTAKE_COPY.editTitle[locale]} locale={locale} onClose={() => setEditing(false)}>
          <DetailsForm locale={locale} initial={details ?? EMPTY_DETAILS} onSave={saveDetails} />
        </Sheet>
      )}

      {url && (
        <ReportPhoto src={url} width={reading.photoWidth} height={reading.photoHeight} lines={reading.lines} locale={locale} alt={COPY.yourPalm[locale]} />
      )}
      {reading.missing.includes('fate') && (
        <p className="text-small rd-muted">
          {COPY.lines.fate[locale]} {COPY.notClearLine[locale]}
        </p>
      )}

      {view ? (
        <>
          <section className="rd-glance" aria-labelledby="rd-glance-title">
            <h3 id="rd-glance-title" className="text-h3 font-bold">
              {COPY.atGlance[locale]}
            </h3>
            <ul>
              {view.glance.map((item) => (
                <li key={item.text}>
                  {item.label && <span className="rd-label">{item.label}</span>}
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </section>

          {view.open.map((section) => (
            <section key={section.key} className="rd-section" aria-labelledby={`rd-sec-${section.key}`}>
              <div className="rd-section-head">
                <h3 id={`rd-sec-${section.key}`} className="text-h3 font-bold">
                  {section.title}
                </h3>
                <span className={`rd-state rd-state-${section.state}`}>{section.stateWord}</span>
              </div>
              {section.parts.map((part) => (
                <div key={part.moduleId} className="rd-part">
                  {section.parts.length > 1 && <h4 className="rd-subtitle">{part.subtitle}</h4>}
                  {part.summary && <p className="rd-summary">{part.summary}</p>}
                  {part.note && <p className="text-small rd-muted">{part.note}</p>}
                  {part.bullets.length > 0 && (
                    <ul className="rd-bullets">
                      {part.bullets.map((bullet) => (
                        <li key={bullet.claimId}>
                          {bullet.label && <span className="rd-label">{bullet.label}</span>}
                          <span>{bullet.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {part.question && <p className="rd-question">{part.question}</p>}
                </div>
              ))}
            </section>
          ))}

          <p className="rd-parts-read">{COPY.partsRead[locale]}</p>
          <div className="rd-locked-list">
            {view.locked.map((part) => (
              <button key={part.key} type="button" className="rd-locked" onClick={() => flow.openLock(part.key)}>
                <span className="rd-locked-head">
                  <span className="text-h3 font-bold">{part.title}</span>
                  <span className="rd-locked-tag text-caption">
                    <LockIcon />
                    {COPY.locked[locale]}
                  </span>
                </span>
                {part.sentence && <span className="rd-locked-text">{part.sentence}</span>}
                <span className="rd-locked-pill text-small">{COPY.tapToOpen[locale]}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="rd-note">{COPY.notClearLine[locale]}</p>
      )}

      <KeepShare locale={locale} reading={reading} view={view} details={details} opening={opening} gold={step === 'app'} />

      <aside className="rd-honesty text-small">
        <p>{COPY.honesty[locale]}</p>
        <p>{COPY.selfCheck[locale]}</p>
      </aside>

      <div className="rd-actions">
        {step === 'signup' && (
          <>
            <button type="button" className="btn btn-gold btn-block" onClick={() => flow.openSignup()}>
              {COPY.signupCta[locale]}
            </button>
            <p className="text-small rd-muted">{COPY.signupNotUnlock[locale]}</p>
            <details className="rd-more">
              <summary className="btn btn-secondary btn-block">{COPY.fullInApp[locale]}</summary>
              <div className="rd-more-body">
                <Store locale={locale} placement="reading" />
              </div>
            </details>
          </>
        )}
        {step === 'another' && (
          <>
            <button type="button" className="btn btn-gold btn-block" onClick={() => flow.startNew()}>
              {COPY.anotherPalm[locale]}
            </button>
            <p className="text-small rd-muted">{COPY.otherHandTeaser[locale]}</p>
          </>
        )}
        {step === 'app' && (
          <>
            <p className="rd-strong">{balance?.appPaid ? AUTH_COPY.planZero[locale] : COPY.wantFull[locale]}</p>
            {!balance?.appPaid && <p>{COPY.appPromise[locale]}</p>}
            <Store locale={locale} placement="reading" qr />
            <p className="text-small rd-muted">{COPY.continuity[locale]}</p>
          </>
        )}
        <p className="text-small rd-muted">{COPY.savedHere[locale]}</p>
        {readingsCount > 1 && (
          <button type="button" className="text-link rd-link-button" onClick={() => flow.showZero()}>
            {COPY.backToReadings[locale]}
          </button>
        )}
      </div>
    </article>
  );
}
