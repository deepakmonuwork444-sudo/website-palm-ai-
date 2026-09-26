/**
 * The /reading/ island (client:only): the whole web reading (WEB-FEAT-026/027/028).
 *
 * This shell is small: it decides the mode (off / mock / live, config.ts), the
 * language, and shows the photo picker. The engine (FlowView: the app's copied
 * pipeline, zod, supabase-js in live mode) loads with import() only when a
 * photo is picked, or at once when this browser already has saved readings or
 * a session — never on a first visit's page load, and no guest sign-in happens
 * before a photo is picked.
 */

import './reading.css';

import { lazy, Suspense, useEffect, useState } from 'react';

import type { Locale } from '../../config/site';
import { isInAppBrowser, readingLocale } from '../../lib/reading/browser';
import { readingConfig, type ReadingConfig } from '../../lib/reading/config';
import { COPY } from '../../lib/reading/copy';
import { PickScreen } from './Pick';
import { OffScreen } from './Off';

const FlowView = lazy(() => import('./FlowView'));

const LANG_KEY = 'palmsays-reading-lang';

function storedLang(): string | null {
  try {
    return localStorage.getItem(LANG_KEY);
  } catch {
    return null;
  }
}

/** Saved readings or a stored session in this browser: then the engine loads at once. */
async function hasHistory(): Promise<boolean> {
  try {
    if (localStorage.getItem('palmsays-auth')) return true;
  } catch {
    // Storage blocked.
  }
  if (typeof indexedDB === 'undefined') return false;
  try {
    const dbs = 'databases' in indexedDB ? await indexedDB.databases() : [];
    return dbs.some((db) => db.name === 'palmsays-readings');
  } catch {
    return false;
  }
}

export default function ReadingApp() {
  const [config] = useState<ReadingConfig>(() => readingConfig());
  const [locale, setLocale] = useState<Locale>(() => readingLocale({ search: location.search, referrer: document.referrer, stored: storedLang() }));
  const [engine, setEngine] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const inApp = isInAppBrowser(navigator.userAgent);

  useEffect(() => {
    document.getElementById('reading-root')?.setAttribute('lang', locale);
    const title = document.getElementById('reading-title');
    if (title) title.textContent = COPY.pageTitle[locale];
  }, [locale]);

  useEffect(() => {
    if (config.mode === 'off') return;
    void hasHistory().then((yes) => {
      if (yes) setEngine(true);
    });
  }, [config.mode]);

  const switchLang = () => {
    const next: Locale = locale === 'en' ? 'hi' : 'en';
    setLocale(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {
      // The choice lasts for this page only.
    }
  };

  const pick = (picked: File) => {
    setFile(picked);
    setEngine(true);
  };

  return (
    <div className="rd-app">
      <div className="rd-topbar">
        {config.mode === 'mock' && <span className="rd-badge text-caption">{locale === 'hi' ? 'प्रीव्यू' : 'Preview'}</span>}
        <button type="button" className="rd-lang" onClick={switchLang} lang={locale === 'en' ? 'hi' : 'en'}>
          {locale === 'en' ? 'हिंदी' : 'English'}
        </button>
      </div>
      {config.mode === 'off' ? (
        <OffScreen locale={locale} missing={[]} />
      ) : engine ? (
        <Suspense fallback={<p className="rd-card">{COPY.checking[locale]}</p>}>
          <FlowView config={config} locale={locale} inApp={inApp} initialFile={file} />
        </Suspense>
      ) : (
        <PickScreen locale={locale} inApp={inApp} onFile={pick} />
      )}
    </div>
  );
}
