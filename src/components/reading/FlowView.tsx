/**
 * The reading engine's view, loaded with import() only once it is needed
 * (a photo was picked, or this browser has saved readings / a session): it
 * brings the app's copied rule and synthesis code, zod, and — in live mode
 * only — supabase-js.
 */

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

import type { Locale } from '../../config/site';
import { googleSetupFor } from '../../lib/auth/config';
import { AUTH_COPY } from '../../lib/auth/copy';
import { browserStorage, hadAccount, markHadAccount, syncHeader } from '../../lib/auth/state';
import { MOCK_SAMPLE, createMockApi } from '../../lib/reading/api-mock';
import type { ReadingApi } from '../../lib/reading/api';
import type { ReadingConfig } from '../../lib/reading/config';
import { EventTally } from '../../lib/reading/events';
import { preparePhoto, shrinkCopy } from '../../lib/reading/image';
import { ReadingFlow, type FlowState } from '../../lib/reading/machine';
import { deviceStorage, linkDetails, type PersonalDetails } from '../../lib/reading/personal';
import { checkPhoto } from '../../lib/reading/quality';
import { buildReportView } from '../../lib/reading/report';
import { browserStore } from '../../lib/reading/store';
import { fakeTokenSource, turnstileSource, type TokenSource } from '../../lib/reading/turnstile';
import { PickScreen } from './Pick';
import Report from './Report';
import { OffScreen } from './Off';
import { CheckingScreen, ErrorScreen, RejectedScreen, ReviewScreen, WorkingScreen, ZeroScreen } from './Screens';
import { LockSheet, SignupSheet } from './Sheets';
import GoogleButton, { type GoogleSetup } from '../auth/GoogleButton';
import { InfoIcon } from './Icons';

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
    const query = new URLSearchParams(location.search);
    // The preview account is shared with the header and /account/ (lib/auth/mock.ts).
    const mock = createMockApi({ failOnce: query.get('mockError'), persist: browserStorage(), googleExisting: query.get('mockGoogle') === 'existing' });
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
    // The live scan plays before the report (WEB-DEC-043): the reading never waits for the drawing.
    lineDrawMs: 0,
    holdForShow: true,
    slowAfterMs: 45_000,
    // Signed out on a browser that had an account: "Sign in to read", not a silent new guest (case 20).
    hadAccount: () => hadAccount(browserStorage()),
    // Preview only: the stored scan's own photo, so its lines never sit on the visitor's photo.
    ...(config.mode === 'mock'
      ? {
          sample: {
            ...MOCK_SAMPLE,
            load: async () => {
              const res = await fetch(MOCK_SAMPLE.url);
              if (!res.ok) throw new Error('sample photo');
              return res.blob();
            },
          },
        }
      : {}),
  });
  return { flow, api, tokens };
}

function Body({
  flow,
  state,
  locale,
  inApp,
  missing,
  onDetails,
  detailsVersion,
}: {
  flow: ReadingFlow;
  state: FlowState;
  locale: Locale;
  inApp: boolean;
  missing: string[];
  onDetails: (details: PersonalDetails | null) => void;
  detailsVersion: number;
}) {
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
      return <ReviewScreen flow={flow} state={state} locale={locale} onDetails={onDetails} />;
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
          key={`${reading.id}-${detailsVersion}`}
          flow={flow}
          reading={reading}
          locale={locale}
          balance={state.balance}
          user={state.user}
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

  /** Details from the questions before the scan, kept with the reading once it is saved (this device only). */
  const pending = useRef<PersonalDetails | null | undefined>(undefined);
  const [detailsVersion, setDetailsVersion] = useState(0);
  const onDetails = useCallback((details: PersonalDetails | null) => {
    pending.current = details;
  }, []);

  const flow = ready?.flow ?? null;
  const google: GoogleSetup | null = googleSetupFor(config.mode, inApp);
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

  const fresh = state?.fresh ?? null;
  const readingIds = state?.readings.map((r) => r.id).join('|') ?? '';
  useEffect(() => {
    if (!fresh || pending.current === undefined) return;
    linkDetails(deviceStorage(), fresh, pending.current, readingIds.split('|').filter(Boolean));
    pending.current = undefined;
    setDetailsVersion((v) => v + 1);
  }, [fresh, readingIds]);

  // A real (non-guest) account on this browser: remember it (case 20) and refresh the header.
  const signedIn = Boolean(state?.user && !state.user.isGuest);
  useEffect(() => {
    if (signedIn) markHadAccount(browserStorage());
    syncHeader();
  }, [signedIn]);

  if (!flow || !state) return <CheckingScreen locale={locale} />;

  const missing = config.mode === 'live' ? [!config.publishableKey && 'PUBLIC_SUPABASE_PUBLISHABLE_KEY', !config.turnstileSiteKey && 'PUBLIC_TURNSTILE_SITE_KEY'].filter((x): x is string => Boolean(x)) : [];
  const sheet = state.sheet;
  const shown = state.screen.name === 'revealed' ? flow.reading(state.screen.readingId) : state.readings[state.readings.length - 1] ?? null;
  const view = sheet?.kind === 'lock' && shown?.synthesis ? buildReportView(shown.synthesis, locale) : null;

  return (
    <>
      {state.notice === 'guestNotMoved' && (
        <div className="rd-notice" role="status">
          <InfoIcon />
          <div>
            <p>{AUTH_COPY.guestNotMoved[locale]}</p>
            <button type="button" className="btn btn-secondary" onClick={() => flow.dismissNotice()}>
              {AUTH_COPY.gotIt[locale]}
            </button>
          </div>
        </div>
      )}
      <Body flow={flow} state={state} locale={locale} inApp={inApp} missing={missing} onDetails={onDetails} detailsVersion={detailsVersion} />
      {google?.mode === 'live' && !inApp && state.screen.name === 'revealed' && state.fresh && state.user?.isGuest && !sheet && (
        // One Tap after the first free reading only (never on the home page): Google's own small prompt.
        <div className="sr-only">
          <GoogleButton setup={google} locale={locale} oneTap divider={false} onCredential={(c) => void flow.google(c.token, c.nonce)} />
        </div>
      )}
      {sheet?.kind === 'lock' && view && (
        <LockSheet
          flow={flow}
          locale={locale}
          view={view}
          section={sheet.section}
          canSignUp={Boolean(state.balance?.emailNeeded || (state.user?.isGuest ?? true))}
          google={google}
        />
      )}
      {sheet?.kind === 'signup' && <SignupSheet flow={flow} locale={locale} sheet={sheet} google={google} />}
      <div className="rd-turnstile" ref={(el) => ready?.tokens.attach(el)} />
    </>
  );
}
