/**
 * The first screen: pick or take a palm photo (DESIGN_SYSTEM.md §7.3). Light
 * on purpose: it renders before the reading engine (the app's rule and
 * synthesis code, zod, supabase-js) is loaded, which happens only once a photo
 * is picked (plan §12.6 bundle rule).
 */

import { useRef, useState, type ChangeEvent } from 'react';

import type { Locale } from '../../config/site';
import { COPY } from '../../lib/reading/copy';
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

function FileButtons({ locale, onFile }: { locale: Locale; onFile: (file: File) => void }) {
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
      <button type="button" className="btn btn-gold btn-block only-desktop" onClick={() => gallery.current?.click()}>
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
