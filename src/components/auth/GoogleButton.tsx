/**
 * "Continue with Google" (WEB-DEC-045), used on /account/ and in the reading's
 * sheets. Live: Google's own button (GIS, popup, FedCM), loaded only when this
 * component is on screen. Preview (mock): our look-alike button that signs in
 * as the sample Google user; nothing is sent.
 *
 * Hidden when Google can't work: inside an in-app browser / Android WebView
 * (Google blocks sign-in there — the "Open in Chrome" note shows instead),
 * without a client ID in live mode, or when Google's script is blocked.
 * The email code below always stays available.
 */

import { useEffect, useRef, useState } from 'react';

import type { Locale } from '../../config/site';
import { AUTH_COPY } from '../../lib/auth/copy';
import { newNonce } from '../../lib/auth/google';
import type { GoogleCredential } from '../../lib/auth/gis';
import { COPY } from '../../lib/reading/copy';

export interface GoogleSetup {
  mode: 'mock' | 'live';
  clientId: string | null;
  inApp: boolean;
}

interface Props {
  setup: GoogleSetup;
  locale: Locale;
  onCredential: (credential: GoogleCredential) => void;
  busy?: boolean;
  /** Also show One Tap (FedCM) — only on /account/ and after the first free reading. */
  oneTap?: boolean;
  /** A Google error to show under the button. */
  message?: string | null;
  /** The "or use your email" line under the button. */
  divider?: boolean;
}

export function InAppNote({ locale }: { locale: Locale }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rd-notice" role="note">
      <div>
        <p>{AUTH_COPY.inAppGoogle[locale]}</p>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            void navigator.clipboard?.writeText(location.href).then(() => setCopied(true));
          }}
        >
          {copied ? COPY.copied[locale] : COPY.copyLink[locale]}
        </button>
      </div>
    </div>
  );
}

export default function GoogleButton({ setup, locale, onCredential, busy = false, oneTap = false, message = null, divider = true }: Props) {
  const slot = useRef<HTMLDivElement>(null);
  const callback = useRef(onCredential);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    callback.current = onCredential;
  });

  const live = setup.mode === 'live' && setup.clientId !== null && !setup.inApp;
  useEffect(() => {
    if (!live || !setup.clientId) return;
    let alive = true;
    let cancel: (() => void) | null = null;
    void import('../../lib/auth/gis')
      .then(({ startGoogle }) => startGoogle({ clientId: setup.clientId!, locale, onCredential: (c) => callback.current(c) }))
      .then((session) => {
        if (!alive) return;
        cancel = () => session.cancel();
        if (slot.current) session.render(slot.current);
        if (oneTap) session.prompt();
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
      cancel?.();
    };
  }, [live, setup.clientId, locale, oneTap]);

  if (setup.inApp) return <InAppNote locale={locale} />;
  if (setup.mode === 'live' && (!setup.clientId || failed)) return null;

  return (
    <div className="auth-google">
      {setup.mode === 'mock' ? (
        <>
          <button
            type="button"
            className="btn btn-block auth-google-mock"
            disabled={busy}
            onClick={() => callback.current({ token: 'mock-google-id-token', nonce: newNonce() })}
          >
            <img src="/icons/google-g.svg" alt="" width={18} height={18} />
            <span>{AUTH_COPY.google[locale]}</span>
          </button>
          <p className="text-small rd-muted">{AUTH_COPY.previewGoogle[locale]}</p>
        </>
      ) : (
        <div ref={slot} className="auth-google-slot" aria-busy={busy} />
      )}
      {busy && (
        <p className="text-small rd-muted" role="status">
          {AUTH_COPY.checking[locale]}
        </p>
      )}
      {message && (
        <p className="rd-field-error" role="alert">
          {message}
        </p>
      )}
      {divider && (
        <p className="auth-or text-small">
          <span>{AUTH_COPY.orEmail[locale]}</span>
        </p>
      )}
    </div>
  );
}
