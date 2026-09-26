/**
 * The reading's screens other than the report. One gold action per state
 * (DESIGN_SYSTEM.md §7.1); every failure says what went wrong and how to fix
 * it, and whether a reading was used (only when the server says so).
 */

import type { Locale } from '../../config/site';
import { ERROR_COPY, COPY } from '../../lib/reading/copy';
import { planFor, type ReadingErrorCode } from '../../lib/reading/errors';
import type { FlowState, ReadingFlow, Stage } from '../../lib/reading/machine';
import { retakeText } from '../../lib/reading/quality';
import type { SavedReading } from '../../lib/reading/store';
import { usePhotoUrl } from './hooks';
import { CheckIcon, InfoIcon } from './Icons';
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

export function ReviewScreen({ flow, state, locale }: { flow: ReadingFlow; state: FlowState; locale: Locale }) {
  const photo = state.photo;
  if (!photo) return null;
  const passed = photo.gate.passed;
  const problem = retakeText(photo.gate.primaryIssue, locale);
  return (
    <section className="rd-card rd-review" aria-labelledby="rd-review-title">
      <h2 id="rd-review-title" className="sr-only">
        {COPY.usePhoto[locale]}
      </h2>
      <PalmPhoto src={photo.url} width={photo.prepared.scan.width} height={photo.prepared.scan.height} lines={null} locale={locale} alt={COPY.yourPalm[locale]} />
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
          <fieldset className="rd-choice">
            <legend>{COPY.whichHand[locale]}</legend>
            <p className="text-small rd-muted">{COPY.whichHandTip[locale]}</p>
            <div className="rd-segmented" role="radiogroup" aria-label={COPY.whichHand[locale]}>
              {(['left', 'right'] as const).map((side) => (
                <button key={side} type="button" role="radio" aria-checked={state.hand === side} className={state.hand === side ? 'rd-seg rd-seg-on' : 'rd-seg'} onClick={() => flow.setHand(side)}>
                  {COPY[side][locale]}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="rd-choice">
            <legend>{COPY.writeHand[locale]}</legend>
            <div className="rd-segmented" role="radiogroup" aria-label={COPY.writeHand[locale]}>
              {([true, false] as const).map((value) => (
                <button key={String(value)} type="button" role="radio" aria-checked={state.writes === value} className={state.writes === value ? 'rd-seg rd-seg-on' : 'rd-seg'} onClick={() => flow.setWrites(value)}>
                  {value ? COPY.yes[locale] : COPY.no[locale]}
                </button>
              ))}
            </div>
          </fieldset>
          <p className="rd-free text-small">{COPY.freePromise[locale]}</p>
          <button type="button" className="btn btn-gold btn-block" onClick={() => void flow.use()}>
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
};

export function WorkingScreen({ flow, state, locale }: { flow: ReadingFlow; state: FlowState; locale: Locale }) {
  const photo = state.photo;
  const screen = state.screen;
  if (screen.name !== 'working') return null;
  const index = STAGE_ORDER.indexOf(screen.stage);
  const percent = Math.round(((index + 1) / (STAGE_ORDER.length + 1)) * 100);
  return (
    <section className="rd-card rd-working" aria-labelledby="rd-working-title">
      <h2 id="rd-working-title" className="sr-only">
        {COPY.stages[STAGE_LABEL[screen.stage]][locale]}
      </h2>
      {photo && (
        <PalmPhoto
          src={photo.url}
          width={photo.prepared.scan.width}
          height={photo.prepared.scan.height}
          lines={screen.lines}
          locale={locale}
          scanning={screen.stage === 'sending' || screen.stage === 'tracing'}
          animate
          chips={screen.lines !== null}
          alt={COPY.yourPalm[locale]}
        />
      )}
      <div className="rd-status" aria-live="polite">
        <p className="rd-strong">{COPY.stages[STAGE_LABEL[screen.stage]][locale]}</p>
        <div className="rd-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label={COPY.stages[STAGE_LABEL[screen.stage]][locale]}>
          <span style={{ width: `${percent}%` }} />
        </div>
      </div>
      {screen.slow && (
        <div className="rd-notice">
          <InfoIcon />
          <div>
            <p>{COPY.slow[locale]}</p>
            <button type="button" className="btn btn-secondary" onClick={() => void flow.retry()}>
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
      {state.photo && <PalmPhoto src={state.photo.url} width={state.photo.prepared.scan.width} height={state.photo.prepared.scan.height} lines={null} locale={locale} alt={COPY.yourPalm[locale]} />}
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
          <button type="button" className="text-link rd-link-button" onClick={() => void flow.removeReading(reading.id)}>
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
          <p className="rd-strong">{COPY.wantFull[locale]}</p>
          <p>{COPY.appPromise[locale]}</p>
          <Store locale={locale} placement="zero" qr />
          <p className="text-small rd-muted">{COPY.continuity[locale]}</p>
          <p className="text-small rd-muted">{COPY.sameEmail[locale]}</p>
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
