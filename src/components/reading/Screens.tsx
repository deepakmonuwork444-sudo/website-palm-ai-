/**
 * The reading's screens other than the report. One gold action per state
 * (DESIGN_SYSTEM.md §7.1); every failure says what went wrong and how to fix
 * it, and whether a reading was used (only when the server says so).
 */

import { useState } from 'react';

import type { Locale } from '../../config/site';
import { AUTH_COPY } from '../../lib/auth/copy';
import { browserStorage, displayName, signedInUser } from '../../lib/auth/state';
import { ERROR_COPY, COPY } from '../../lib/reading/copy';
import { planFor, type ReadingErrorCode } from '../../lib/reading/errors';
import type { FlowState, ReadingFlow, Stage } from '../../lib/reading/machine';
import { EMPTY_DETAILS, cleanName, deviceStorage, isPersonal, linkDetails, loadLast, saveLast, writesWithShown, type PersonalDetails } from '../../lib/reading/personal';
import { retakeText } from '../../lib/reading/quality';
import type { SavedReading } from '../../lib/reading/store';
import { usePhotoUrl } from './hooks';
import { CheckIcon, InfoIcon } from './Icons';
import { Intake } from './Intake';
import LiveScan from './LiveScan';
import PalmPhoto from './PalmPhoto';
import Store from './Store';

export function CheckingScreen({ locale }: { locale: Locale }) {
  return (
    <section className="rd-card rd-center" aria-live="polite">
      <div className="rd-spinner" aria-hidden="true" />
      <p>{COPY.checking[locale]}</p>
    </section>
  );
}

/**
 * The checked photo, then (on "Use this photo") the short questions before
 * the scan (Intake.tsx). The questions set the hands for the reading; the
 * personal details go to `onDetails` and stay on this device.
 */
export function ReviewScreen({ flow, state, locale, onDetails }: { flow: ReadingFlow; state: FlowState; locale: Locale; onDetails: (details: PersonalDetails | null) => void }) {
  const [asking, setAsking] = useState(false);
  const photo = state.photo;
  if (!photo) return null;
  const passed = photo.gate.passed;
  const problem = retakeText(photo.gate.primaryIssue, locale);
  const begin = (details: PersonalDetails) => {
    const hand = details.hand ?? state.hand;
    flow.setHand(hand);
    const writes = writesWithShown(details, hand);
    if (writes !== null) flow.setWrites(writes);
    saveLast(deviceStorage(), details);
    onDetails(isPersonal(details) || details.writeHand ? details : null);
    void flow.use();
  };
  if (asking && passed) {
    const last = loadLast(deviceStorage());
    const initial: PersonalDetails = { ...EMPTY_DETAILS, ...(last ?? {}), hand: state.hand };
    // Signed in: the account's name (typed on /account/, else Google's given name) fills an empty name. Still editable, still this device only.
    if (!initial.name) {
      const store = browserStorage();
      initial.name = cleanName(displayName(store, signedInUser(store)));
    }
    return <Intake locale={locale} initial={initial} shownHand={state.hand} photoUrl={photo.url} onDone={begin} onSkip={begin} onExit={() => setAsking(false)} />;
  }
  return (
    <section className="rd-card rd-review" aria-labelledby="rd-review-title">
      <h2 id="rd-review-title" className="sr-only">
        {COPY.usePhoto[locale]}
      </h2>
      <PalmPhoto src={photo.url} width={photo.prepared.scan.width} height={photo.prepared.scan.height} alt={COPY.yourPalm[locale]} />
      {passed ? (
        <p className="rd-check-ok" role="status">
          <CheckIcon />
          {COPY.checkPassed[locale]}
        </p>
      ) : (
        <div className="rd-check-fail" role="alert">
          <p className="rd-strong">{problem}</p>
          <p className="text-small">{COPY.failedFree[locale]}</p>
        </div>
      )}
      {passed && (
        <>
          {state.lastNotice && <p className="rd-notice-line text-small">{COPY.lastFree[locale]}</p>}
          <p className="rd-free text-small">{COPY.freePromise[locale]}</p>
          <button type="button" className="btn btn-gold btn-block" onClick={() => setAsking(true)}>
            {COPY.usePhoto[locale]}
          </button>
        </>
      )}
      <button type="button" className={passed ? 'btn btn-secondary btn-block' : 'btn btn-gold btn-block'} onClick={() => flow.retake()}>
        {COPY.retake[locale]}
      </button>
    </section>
  );
}

const STAGE_ORDER: Stage[] = ['gating', 'sending', 'tracing', 'found', 'reading', 'writing'];
const STAGE_LABEL: Record<Stage, keyof typeof COPY.stages> = {
  gating: 'gating',
  sending: 'sending',
  tracing: 'tracing',
  found: 'found',
  reading: 'reading',
  writing: 'writing',
  done: 'ready',
};

/**
 * The reading being made: the live scan on the photo (WEB-DEC-043), the one
 * status block with the real stage, and "Skip to my reading" the whole time.
 * The report opens when the show ends (or on Skip) once the reading is saved.
 */
export function WorkingScreen({ flow, state, locale }: { flow: ReadingFlow; state: FlowState; locale: Locale }) {
  const [skipped, setSkipped] = useState(false);
  /** "Try again" restarts the scan, and the show with it. */
  const [attempt, setAttempt] = useState(0);
  const photo = state.photo;
  const screen = state.screen;
  if (screen.name !== 'working') return null;
  const index = STAGE_ORDER.indexOf(screen.stage);
  const percent = screen.stage === 'done' ? 100 : Math.round(((index + 1) / (STAGE_ORDER.length + 1)) * 100);
  const skip = () => {
    setSkipped(true);
    flow.endShow();
  };
  const retry = () => {
    setSkipped(false);
    setAttempt((n) => n + 1);
    void flow.retry();
  };
  return (
    <section className="rd-card rd-working" aria-labelledby="rd-working-title">
      <h2 id="rd-working-title" className="sr-only">
        {COPY.stages[STAGE_LABEL[screen.stage]][locale]}
      </h2>
      {photo && (
        <LiveScan
          key={`${photo.key}-${attempt}`}
          src={photo.shown.url}
          width={photo.shown.width}
          height={photo.shown.height}
          sample={photo.shown.sample}
          lines={screen.lines}
          hand={screen.hand}
          side={screen.side}
          ready={screen.stage === 'done'}
          skipped={skipped}
          locale={locale}
          onEnd={() => flow.endShow()}
        />
      )}
      {photo?.shown.sample && <p className="rd-preview text-small">{COPY.previewLabel[locale]}</p>}
      <div className="rd-status" aria-live="polite">
        <p className="rd-strong">{COPY.stages[STAGE_LABEL[screen.stage]][locale]}</p>
        <div className="rd-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label={COPY.stages[STAGE_LABEL[screen.stage]][locale]}>
          <span style={{ width: `${percent}%` }} />
        </div>
      </div>
      {!skipped && (
        <button type="button" className="btn btn-secondary btn-block" onClick={skip}>
          {COPY.skipToReading[locale]}
        </button>
      )}
      {screen.slow && (
        <div className="rd-notice">
          <InfoIcon />
          <div>
            <p>{COPY.slow[locale]}</p>
            <button type="button" className="btn btn-secondary" onClick={retry}>
              {COPY.tryAgain[locale]}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export function RejectedScreen({ flow, state, locale }: { flow: ReadingFlow; state: FlowState; locale: Locale }) {
  const screen = state.screen;
  if (screen.name !== 'rejected') return null;
  return (
    <section className="rd-card" aria-labelledby="rd-rejected-title">
      {state.photo && <PalmPhoto src={state.photo.url} width={state.photo.prepared.scan.width} height={state.photo.prepared.scan.height} alt={COPY.yourPalm[locale]} />}
      <h2 id="rd-rejected-title" className="text-h3 font-bold">
        {ERROR_COPY.not_a_palm.title[locale]}
      </h2>
      <p role="alert">{screen.message[locale]}</p>
      {screen.noCharge && <p className="text-small">{COPY.failedFree[locale]}</p>}
      <button type="button" className="btn btn-gold btn-block" onClick={() => flow.retake()}>
        {COPY.retake[locale]}
      </button>
    </section>
  );
}

export function ErrorScreen({ flow, code, locale }: { flow: ReadingFlow; code: ReadingErrorCode; locale: Locale }) {
  const copy = ERROR_COPY[code];
  const plan = planFor(code);
  return (
    <section className="rd-card" aria-labelledby="rd-error-title">
      <h2 id="rd-error-title" className="text-h3 font-bold">
        {copy.title[locale]}
      </h2>
      <p role="alert">{copy.body[locale]}</p>
      {plan.kind === 'retry' && (
        <button type="button" className="btn btn-gold btn-block" onClick={() => void flow.retry()}>
          {COPY.tryAgain[locale]}
        </button>
      )}
      {plan.kind === 'retake' && (
        <button type="button" className="btn btn-gold btn-block" onClick={() => flow.retake()}>
          {COPY.retake[locale]}
        </button>
      )}
      {plan.kind === 'stop' && <Store locale={locale} placement="reading" qr />}
      {plan.kind === 'retry' && (
        <button type="button" className="btn btn-secondary btn-block" onClick={() => flow.retake()}>
          {COPY.retake[locale]}
        </button>
      )}
    </section>
  );
}

function SavedCard({ flow, reading, locale }: { flow: ReadingFlow; reading: SavedReading; locale: Locale }) {
  const url = usePhotoUrl(reading.photo);
  const date = new Date(reading.createdAt).toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long' });
  return (
    <li className="rd-saved">
      {url && <img src={url} alt="" width={72} height={Math.round((72 * reading.photoHeight) / reading.photoWidth)} />}
      <div>
        <p className="rd-strong">{reading.handSide === 'left' ? COPY.leftHand[locale] : COPY.rightHand[locale]}</p>
        <p className="text-small rd-muted">{date}</p>
        <div className="rd-saved-actions">
          <button type="button" className="btn btn-secondary" onClick={() => flow.showReading(reading.id)}>
            {COPY.open[locale]}
          </button>
          <button
            type="button"
            className="text-link rd-link-button"
            onClick={() => {
              linkDetails(deviceStorage(), reading.id, null);
              void flow.removeReading(reading.id);
            }}
          >
            {COPY.removeHere[locale]}
          </button>
        </div>
      </div>
    </li>
  );
}

export function ZeroScreen({ flow, state, locale }: { flow: ReadingFlow; state: FlowState; locale: Locale }) {
  const none = state.balance ? state.balance.freeRemaining === 0 : false;
  return (
    <section className="rd-card rd-zero" aria-labelledby="rd-zero-title">
      <h2 id="rd-zero-title" className="text-h2 font-display">
        {none ? COPY.zeroTitle[locale] : COPY.yourReadings[locale]}
      </h2>
      {none && <p>{COPY.zeroLead[locale]}</p>}
      {state.readings.length > 0 && (
        <ul className="rd-saved-list" aria-label={COPY.yourReadings[locale]}>
          {state.readings.map((reading) => (
            <SavedCard key={reading.id} flow={flow} reading={reading} locale={locale} />
          ))}
        </ul>
      )}
      {none ? (
        <div className="rd-app-card">
          {/* Plan or pack holders use them in the app (web readings are free-only, case 21): never "buy". */}
          <p className="rd-strong">{state.balance?.appPaid ? AUTH_COPY.planZero[locale] : COPY.wantFull[locale]}</p>
          {!state.balance?.appPaid && <p>{COPY.appPromise[locale]}</p>}
          <Store locale={locale} placement="zero" qr />
          <p className="text-small rd-muted">{COPY.continuity[locale]}</p>
          <p className="text-small rd-muted">{state.user && !state.user.isGuest ? AUTH_COPY.zeroInApp[locale] : COPY.sameEmail[locale]}</p>
        </div>
      ) : (
        <button type="button" className="btn btn-gold btn-block" onClick={() => flow.startNew()}>
          {COPY.anotherPalm[locale]}
        </button>
      )}
      <p className="text-small">
        {COPY.keepLearning[locale]}{' '}
        <a className="text-link" href={locale === 'hi' ? '/hi/' : '/'}>
          {locale === 'hi' ? 'होम' : 'Home'}
        </a>
      </p>
    </section>
  );
}
