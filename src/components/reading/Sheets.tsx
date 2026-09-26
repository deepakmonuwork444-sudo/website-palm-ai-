/**
 * Bottom sheet on phones, dialog on desktop (DESIGN_SYSTEM.md §7.12): a native
 * <dialog> opened with showModal(), so focus stays inside, Esc closes it and
 * focus returns to the control that opened it. Always a visible "Not now" + ×.
 */

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

import type { Locale } from '../../config/site';
import { COPY } from '../../lib/reading/copy';
import type { ReadingFlow, Sheet as SheetState } from '../../lib/reading/machine';
import type { ReportView } from '../../lib/reading/report';
import Store from './Store';

function Sheet({ title, locale, onClose, children }: { title: string; locale: Locale; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  const titleId = useId();
  useEffect(() => {
    closeRef.current = onClose;
  });
  // Opened once per sheet; Esc (the dialog's "cancel") goes through onClose.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const opener = document.activeElement as HTMLElement | null;
    if (!dialog.open) dialog.showModal();
    const cancel = (event: Event) => {
      event.preventDefault();
      closeRef.current();
    };
    dialog.addEventListener('cancel', cancel);
    return () => {
      dialog.removeEventListener('cancel', cancel);
      if (dialog.open) dialog.close();
      opener?.focus?.();
    };
  }, []);

  return (
    <dialog ref={ref} className="rd-sheet" aria-labelledby={titleId}>
      <div className="rd-sheet-head">
        <h2 id={titleId} className="text-h3 font-bold">
          {title}
        </h2>
        <button type="button" className="rd-x" onClick={onClose} aria-label={COPY.close[locale]}>
          ×
        </button>
      </div>
      <div className="rd-sheet-body">{children}</div>
      <button type="button" className="btn btn-secondary btn-block rd-not-now" onClick={onClose}>
        {COPY.notNow[locale]}
      </button>
    </dialog>
  );
}

export function LockSheet({
  flow,
  locale,
  view,
  section,
  canSignUp,
}: {
  flow: ReadingFlow;
  locale: Locale;
  view: ReportView;
  section: string;
  canSignUp: boolean;
}) {
  const part = view.locked.find((p) => p.key === section);
  return (
    <Sheet title={part?.title ?? ''} locale={locale} onClose={() => flow.closeSheet()}>
      <div className="rd-lock-hero">
        {part?.sentence && <p className="rd-lock-sentence">{part.sentence}</p>}
        <p className="rd-strong">{COPY.lockRest[locale]}</p>
      </div>
      <p>{COPY.appPromise[locale]}</p>
      <Store locale={locale} placement="lock" qr />
      <p className="text-small rd-muted">{COPY.continuity[locale]}</p>
      <p className="text-small rd-muted">{COPY.sameEmail[locale]}</p>
      {canSignUp && (
        <button type="button" className="btn btn-secondary btn-block" onClick={() => flow.openSignup()}>
          {COPY.signupCta[locale]}
        </button>
      )}
    </Sheet>
  );
}

const MESSAGES = {
  codeSent: COPY.codeSent,
  emailTaken: COPY.emailTaken,
  waitCode: COPY.waitCode,
  codesOff: COPY.codesOff,
  badEmail: COPY.badEmail,
  badCode: COPY.badCode,
  wrongCode: COPY.wrongCode,
} as const;

export function SignupSheet({ flow, locale, sheet }: { flow: ReadingFlow; locale: Locale; sheet: Extract<SheetState, { kind: 'signup' }> }) {
  const [email, setEmail] = useState(sheet.email);
  const [code, setCode] = useState('');
  const errorId = useId();
  const message = sheet.message ? MESSAGES[sheet.message][locale] : null;
  const isError = sheet.message !== null && sheet.message !== 'codeSent';

  return (
    <Sheet title={COPY.signupTitle[locale]} locale={locale} onClose={() => flow.closeSheet()}>
      <p>{COPY.signupLead[locale]}</p>
      <p className="rd-note">{COPY.signupNotUnlock[locale]}</p>
      {sheet.step === 'email' ? (
        <form
          className="rd-form"
          onSubmit={(event) => {
            event.preventDefault();
            void flow.submitEmail(email);
          }}
        >
          <label htmlFor="rd-email">{COPY.emailLabel[locale]}</label>
          <input
            id="rd-email"
            className="rd-input"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={isError}
            aria-describedby={message ? errorId : undefined}
            required
          />
          {message && (
            <p id={errorId} className={isError ? 'rd-field-error' : 'rd-field-note'} role={isError ? 'alert' : 'status'}>
              {message}
            </p>
          )}
          {sheet.message === 'emailTaken' && (
            <>
              <p className="text-small rd-muted">{COPY.takenNote[locale]}</p>
              <button type="button" className="btn btn-secondary btn-block" disabled={sheet.busy} onClick={() => void flow.signInInstead()}>
                {COPY.signInCode[locale]}
              </button>
            </>
          )}
          <button type="submit" className="btn btn-gold btn-block" disabled={sheet.busy}>
            {COPY.sendCode[locale]}
          </button>
        </form>
      ) : (
        <form
          className="rd-form"
          onSubmit={(event) => {
            event.preventDefault();
            void flow.submitCode(code);
          }}
        >
          <p className="rd-field-note" role="status">
            {sheet.email}
          </p>
          <label htmlFor="rd-code">{COPY.codeLabel[locale]}</label>
          <input
            id="rd-code"
            className="rd-input rd-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            pattern="[0-9]*"
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            aria-invalid={isError}
            aria-describedby={message ? errorId : undefined}
          />
          {message && (
            <p id={errorId} className={isError ? 'rd-field-error' : 'rd-field-note'} role={isError ? 'alert' : 'status'}>
              {message}
            </p>
          )}
          <button type="submit" className="btn btn-gold btn-block" disabled={sheet.busy}>
            {COPY.verify[locale]}
          </button>
          <button type="button" className="text-link rd-link-button" disabled={sheet.busy} onClick={() => void flow.submitEmail(sheet.email)}>
            {COPY.sendAgain[locale]}
          </button>
        </form>
      )}
      <ul className="rd-small-list text-small rd-muted">
        <li>{COPY.emailsWeSend[locale]}</li>
        <li>{COPY.deleteAnytime[locale]}</li>
        <li>{COPY.adults[locale]}</li>
      </ul>
    </Sheet>
  );
}
