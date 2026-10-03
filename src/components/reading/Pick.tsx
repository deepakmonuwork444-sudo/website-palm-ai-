/**
 * The first screen: pick or take a palm photo (DESIGN_SYSTEM.md §7.3). Light
 * on purpose: it renders before the reading engine (the app's rule and
 * synthesis code, zod, supabase-js) is loaded, which happens only once a photo
 * is picked (plan §12.6 bundle rule).
 */

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';

import type { Locale } from '../../config/site';
import { qrMatrix } from '../../lib/qr';
import { COPY } from '../../lib/reading/copy';
import { DESKTOP_QUERY, phoneUrl, showWebcam } from '../../lib/webcam/core';
import { CheckIcon, InfoIcon, ShieldIcon } from './Icons';

export function PrivacyPanel({ locale }: { locale: Locale }) {
  return (
    <details className="rd-privacy">
      <summary className="text-small">
        <ShieldIcon />
        <span>
          {COPY.uploadLine[locale]} <span className="text-link">{COPY.whatHappens[locale]}</span>
        </span>
      </summary>
      <ol className="text-small">
        {COPY.privacyRows[locale].map((row) => (
          <li key={row}>{row}</li>
        ))}
      </ol>
    </details>
  );
}

/** Desktop with a camera API: offer the laptop webcam (WEB-DEC-059). Phones: always false. */
function useWebcamOffer(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const sync = () => setOn(showWebcam(query.matches, navigator));
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);
  return on;
}

/** Desktop only: a quiet QR card to carry on with the phone's better camera (no utm, no tracking). */
function PhoneQr({ locale }: { locale: Locale }) {
  const matrix = useMemo(() => qrMatrix(phoneUrl(location.href, locale === 'hi' ? { lang: 'hi' } : {})), [locale]);
  return (
    <div className="only-desktop">
      <div className="rd-phone">
        <svg viewBox={`0 0 ${matrix.size} ${matrix.size}`} role="img" aria-label={COPY.phoneQrLabel[locale]} shapeRendering="crispEdges">
          <rect className="rd-qr-light" width={matrix.size} height={matrix.size} rx={matrix.size * 0.068} />
          <path className="rd-qr-dark" d={matrix.path} />
        </svg>
        <p className="text-small rd-muted">{COPY.phoneQr[locale]}</p>
      </div>
    </div>
  );
}

function FileButtons({ locale, onFile }: { locale: Locale; onFile: (file: File) => void }) {
  const webcam = useWebcamOffer();
  const camera = useRef<HTMLInputElement>(null);
  const gallery = useRef<HTMLInputElement>(null);
  const changed = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) onFile(file);
  };
  return (
    <div className="rd-file-buttons">
      {/* Phones: the camera first; desktops: an upload. Never image/heic in accept (plan §12.12). */}
      <input ref={camera} className="sr-only" type="file" accept="image/*" capture="environment" onChange={changed} tabIndex={-1} aria-hidden="true" />
      <input ref={gallery} className="sr-only" type="file" accept="image/*" onChange={changed} tabIndex={-1} aria-hidden="true" />
      <button type="button" className="btn btn-gold btn-block only-touch" onClick={() => camera.current?.click()}>
        {COPY.takePhoto[locale]}
      </button>
      {webcam && (
        <button
          type="button"
          className="btn btn-gold btn-block only-desktop"
          onClick={() => {
            void import('../../lib/webcam/dialog').then(async ({ openWebcam }) => {
              const file = await openWebcam({ locale, onUpload: () => gallery.current?.click() });
              if (file) onFile(file);
            });
          }}
        >
          {COPY.useWebcam[locale]}
        </button>
      )}
      <button type="button" className={`btn ${webcam ? 'btn-secondary' : 'btn-gold'} btn-block only-desktop`} onClick={() => gallery.current?.click()}>
        {COPY.uploadPhoto[locale]}
      </button>
      <button type="button" className="text-link rd-link-button only-touch" onClick={() => gallery.current?.click()}>
        {COPY.fromGallery[locale]}
      </button>
    </div>
  );
}

export function PickScreen({
  locale,
  onFile,
  inApp,
  lastNotice = false,
  lastIsSecond = false,
  onShowReadings,
}: {
  locale: Locale;
  onFile: (file: File) => void;
  inApp: boolean;
  lastNotice?: boolean;
  lastIsSecond?: boolean;
  onShowReadings?: (() => void) | null;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <section className="rd-card rd-pick" aria-labelledby="rd-pick-title">
      <h2 id="rd-pick-title" className="text-h2 font-display">
        {COPY.pickTitle[locale]}
      </h2>
      {lastNotice && (
        <div className="rd-notice" role="status">
          <InfoIcon />
          <div>
            <p className="rd-strong">{lastIsSecond ? COPY.lastTitle[locale] : COPY.lastFree[locale]}</p>
            <p className="text-small">{COPY.otherHandTeaser[locale]}</p>
          </div>
        </div>
      )}
      <p>{COPY.pickLead[locale]}</p>
      {inApp && (
        <div className="rd-notice">
          <InfoIcon />
          <div>
            <p>{COPY.inApp[locale]}</p>
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
      )}
      <ul className="rd-tips" aria-label={locale === 'hi' ? 'फ़ोटो के सुझाव' : 'Photo tips'}>
        {COPY.tips[locale].map((tip) => (
          <li key={tip}>
            <CheckIcon />
            {tip}
          </li>
        ))}
      </ul>
      <FileButtons locale={locale} onFile={onFile} />
      <PhoneQr locale={locale} />
      <p className="text-small rd-muted">{COPY.cameraNote[locale]}</p>
      <p className="text-small rd-muted">{COPY.mehndi[locale]}</p>
      <PrivacyPanel locale={locale} />
      <p className="rd-free text-small">{COPY.freePromise[locale]}</p>
      <p className="text-small rd-muted">{COPY.noPayment[locale]}</p>
      {onShowReadings && (
        <button type="button" className="text-link rd-link-button" onClick={onShowReadings}>
          {COPY.backToReadings[locale]}
        </button>
      )}
    </section>
  );
}
