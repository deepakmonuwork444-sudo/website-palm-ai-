/**
 * The reading engine's view, loaded with import() only once it is needed
 * (a photo was picked, or this browser has saved readings / a session): it
 * brings the app's copied rule and synthesis code, zod, and — in live mode
 * only — supabase-js.
 */

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

import type { Locale } from '../../config/site';
import { createMockApi } from '../../lib/reading/api-mock';
import type { ReadingApi } from '../../lib/reading/api';
import type { ReadingConfig } from '../../lib/reading/config';
import { EventTally } from '../../lib/reading/events';
import { preparePhoto, shrinkCopy } from '../../lib/reading/image';
import { ReadingFlow, type FlowState } from '../../lib/reading/machine';
import { checkPhoto } from '../../lib/reading/quality';
import { buildReportView } from '../../lib/reading/report';
import { browserStore } from '../../lib/reading/store';
import { fakeTokenSource, turnstileSource, type TokenSource } from '../../lib/reading/turnstile';
import { PickScreen } from './Pick';
import Report from './Report';
import { OffScreen } from './Off';
import { CheckingScreen, ErrorScreen, RejectedScreen, ReviewScreen, WorkingScreen, ZeroScreen } from './Screens';
import { LockSheet, SignupSheet } from './Sheets';

interface Props {
  config: ReadingConfig;
  locale: Locale;
  inApp: boolean;
  initialFile: File | null;
}

async function makeFlow(config: ReadingConfig, locale: Locale, tally: EventTally): Promise<{ flow: ReadingFlow; api: ReadingApi | null; tokens: TokenSource }> {
  let api: ReadingApi | null = null;
  let tokens: TokenSource = fakeTokenSource();
  if (config.mode === 'mock') {
    const mock = createMockApi({ failOnce: new URLSearchParams(location.search).get('mockError') });
    api = mock;
    // Preview QA only (mock mode never talks to a server): lets a test read what would have been sent.
    (window as Window & { __palmsaysMock?: typeof mock }).__palmsaysMock = mock;
  } else if (config.mode === 'live' && config.publishableKey && config.turnstileSiteKey) {
    const { createLiveApi } = await import('../../lib/reading/api-live');
    api = createLiveApi({ apiUrl: config.apiUrl, publishableKey: config.publishableKey });
    tokens = turnstileSource(config.turnstileSiteKey, locale);
  }
  const flow = new ReadingFlow({
    mode: api ? config.mode : 'off',
    api,
    tokens,
    store: browserStore(),
    preparePhoto,
    shrink: (blob) => shrinkCopy(blob),
    checkPhoto: (check, w, h) => checkPhoto(check, w, h),
    objectUrl: (blob) => URL.createObjectURL(blob),
    revokeUrl: (url) => URL.revokeObjectURL(url),
    sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    track: (event, detail) => tally.add(event, detail),
    onceOnline: (callback) => window.addEventListener('online', callback, { once: true }),
    lineDrawMs: 1400,
    slowAfterMs: 45_000,
  });
  return { flow, api, tokens };
}

function Body({ flow, state, locale, inApp, missing }: { flow: ReadingFlow; state: FlowState; locale: Locale; inApp: boolean; missing: string[] }) {
  const screen = state.screen;
  switch (screen.name) {
    case 'loading':
      return <CheckingScreen locale={locale} />;
    case 'off':
      return <OffScreen locale={locale} missing={missing} />;
    case 'idle':
      return (
        <PickScreen
          locale={locale}
          inApp={inApp}
          onFile={(file) => void flow.pick(file)}
          lastNotice={state.lastNotice}
          lastIsSecond={state.readings.length > 0}
          onShowReadings={state.readings.length > 0 ? () => flow.showZero() : null}
        />
      );
    case 'checking':
      return <CheckingScreen locale={locale} />;
    case 'review':
      return <ReviewScreen flow={flow} state={state} locale={locale} />;
    case 'working':
      return <WorkingScreen flow={flow} state={state} locale={locale} />;
    case 'rejected':
      return <RejectedScreen flow={flow} state={state} locale={locale} />;
    case 'error':
      return <ErrorScreen flow={flow} code={screen.code} locale={locale} />;
    case 'zero':
      return <ZeroScreen flow={flow} state={state} locale={locale} />;
    case 'revealed': {
      const reading = flow.reading(screen.readingId);
      if (!reading) return <ZeroScreen flow={flow} state={state} locale={locale} />;
      return (
        <Report
          flow={flow}
          reading={reading}
          locale={locale}
          balance={state.balance}
          user={state.user}
          justRevealed={state.fresh === reading.id}
          readingsCount={state.readings.length}
        />
      );
    }
  }
}

export default function FlowView({ config, locale, inApp, initialFile }: Props) {
  const [ready, setReady] = useState<{ flow: ReadingFlow; api: ReadingApi | null; tokens: TokenSource; tally: EventTally } | null>(null);

  useEffect(() => {
    let alive = true;
    let api: ReadingApi | null = null;
    const tally = new EventTally(config.preview ? 'dev' : 'a');
    void makeFlow(config, locale, tally).then(async (made) => {
      if (!alive) return;
      api = made.api;
      setReady({ ...made, tally });
      await made.flow.init();
      if (initialFile && made.api) await made.flow.pick(initialFile);
    });
    const send = () => {
      // Counts go out once, when the page is hidden (no cookie, no user id).
      void api?.logEvents(tally.drain(), true);
    };
    window.addEventListener('pagehide', send);
    return () => {
      alive = false;
      window.removeEventListener('pagehide', send);
    };
    // The flow is built once per page; language changes only re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flow = ready?.flow ?? null;
  const subscribe = useCallback((listener: () => void) => (flow ? flow.subscribe(listener) : () => undefined), [flow]);
  const snapshot = useCallback(() => (flow ? flow.getState() : null), [flow]);
  const state = useSyncExternalStore(subscribe, snapshot, () => null);

  // A new screen starts at its top: the reading's photo, not wherever the last
  // screen's button was (the review's "Use this photo" sits low on a phone).
  const screenName = state?.screen.name ?? null;
  useEffect(() => {
    if (!screenName || screenName === 'loading') return;
    const root = document.getElementById('reading-root');
    if (root && root.getBoundingClientRect().top < 0) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      root.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    }
  }, [screenName]);

  if (!flow || !state) return <CheckingScreen locale={locale} />;

  const missing = config.mode === 'live' ? [!config.publishableKey && 'PUBLIC_SUPABASE_PUBLISHABLE_KEY', !config.turnstileSiteKey && 'PUBLIC_TURNSTILE_SITE_KEY'].filter((x): x is string => Boolean(x)) : [];
  const sheet = state.sheet;
  const shown = state.screen.name === 'revealed' ? flow.reading(state.screen.readingId) : state.readings[state.readings.length - 1] ?? null;
  const view = sheet?.kind === 'lock' && shown?.synthesis ? buildReportView(shown.synthesis, locale) : null;

  return (
    <>
      <Body flow={flow} state={state} locale={locale} inApp={inApp} missing={missing} />
      {sheet?.kind === 'lock' && view && (
        <LockSheet flow={flow} locale={locale} view={view} section={sheet.section} canSignUp={Boolean(state.balance?.emailNeeded || (state.user?.isGuest ?? true))} />
      )}
      {sheet?.kind === 'signup' && <SignupSheet flow={flow} locale={locale} sheet={sheet} />}
      <div className="rd-turnstile" ref={(el) => ready?.tokens.attach(el)} />
    </>
  );
}
