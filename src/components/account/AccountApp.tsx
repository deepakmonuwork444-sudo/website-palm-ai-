/**
 * The /account/ and /hi/account/ island (client:only, WEB-FEAT-029/062,
 * WEB_AUTH_PLAN.md §3). Supabase (live) and Google's script load with import()
 * only on this page; nothing here runs on any other page.
 *
 * States: loading → off (sign-in on the website not open) | signed out or a
 * GUEST (the sign-in card: Google first, then the 6-digit email code; a guest
 * never sees "Sign out") | signed in (name kept in this browser, email, free
 * readings from reading_balance, My readings from the server with the web
 * report's locks, Get the app, Sign out = this browser only, Delete account).
 * `?signout=1` (the header's "Sign out") signs out here, then asks whether to
 * remove the readings saved in this browser.
 */

import '../reading/reading.css';
import './account.css';

import { lazy, Suspense, useCallback, useEffect, useId, useRef, useState } from 'react';

import { site, type Locale } from '../../config/site';
import type { AccountApi, AccountReading, CodeVia } from '../../lib/auth/account';
import { authConfig, googleSetupFor } from '../../lib/auth/config';
import { AUTH_COPY, fill, rupeesOf } from '../../lib/auth/copy';
import { browserStorage, displayName, initialOf, markHadAccount, PROFILE_KEY, saveProfileName, syncHeader, type StoredUser } from '../../lib/auth/state';
import type { Balance } from '../../lib/reading/balance';
import { isInAppBrowser } from '../../lib/reading/browser';
import { COPY } from '../../lib/reading/copy';
import { addressName, cleanName, BY_READING_KEY, LAST_KEY } from '../../lib/reading/personal';
import type { FinishedSynthesis } from '../../lib/reading/palm/features/knowledge/synthesis/modules';
import { browserStore } from '../../lib/reading/store';
import GoogleButton, { type GoogleSetup } from '../auth/GoogleButton';
import { InfoIcon } from '../reading/Icons';
import Store from '../reading/Store';

const ServerReport = lazy(() => import('./ServerReport'));

type Phase = 'loading' | 'off' | 'ready';

async function makeApi(mode: 'mock' | 'live', config: ReturnType<typeof authConfig>): Promise<AccountApi> {
  if (mode === 'mock') {
    const { createMockAccount } = await import('../../lib/auth/mock');
    return createMockAccount({
      search: location.search,
      // Preview: "My readings" are the preview readings saved in this browser (already locked).
      savedReadings: async () => (await browserStore().list()).map((r) => ({ id: r.id, createdAt: r.createdAt, handSide: r.handSide, synthesis: r.synthesis })),
    });
  }
  const { createLiveAccount } = await import('../../lib/auth/live');
  return createLiveAccount({ apiUrl: config.reading.apiUrl, publishableKey: config.reading.publishableKey! });
}

function readingHref(locale: Locale): string {
  return locale === 'hi' ? '/reading/?lang=hi' : '/reading/';
}

/* ── the sign-in card (signed out, or a guest) ── */

type CodeMessage = 'codeSent' | 'emailTaken' | 'waitCode' | 'codesOff' | 'badEmail' | 'badCode' | 'wrongCode';

function EmailCode({ api, locale, guest, onDone }: { api: AccountApi; locale: Locale; guest: boolean; onDone: (switched: boolean) => void }) {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [via, setVia] = useState<CodeVia>(guest ? 'email_change' : 'email');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<CodeMessage | null>(null);
  const errorId = useId();
  const isError = message !== null && message !== 'codeSent';

  const send = async (mode: CodeVia) => {
    const clean = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean)) {
      setMessage('badEmail');
      return;
    }
    setBusy(true);
    setMessage(null);
    setVia(mode);
    const result = await api.sendCode(clean, mode).catch(() => 'wait' as const);
    setBusy(false);
    const next: Record<typeof result, CodeMessage> = { sent: 'codeSent', taken: 'emailTaken', wait: 'waitCode', unavailable: 'codesOff', invalid: 'badEmail' };
    setMessage(next[result]);
    if (result === 'sent') setStep('code');
  };

  const verify = async () => {
    const digits = code.replace(/\D/g, '').slice(0, 6);
    if (digits.length !== 6) {
      setMessage('badCode');
      return;
    }
    setBusy(true);
    setMessage(null);
    const result = await api.verifyCode(email.trim(), digits, via).catch(() => 'wait' as const);
    setBusy(false);
    if (result === 'ok') onDone(guest && via === 'email');
    else setMessage(result === 'wait' ? 'waitCode' : 'wrongCode');
  };

  const text = message ? COPY[message][locale] : null;
  return step === 'email' ? (
    <form
      className="rd-form"
      onSubmit={(event) => {
        event.preventDefault();
        void send(guest ? 'email_change' : 'email');
      }}
    >
      <label htmlFor="acct-email">{COPY.emailLabel[locale]}</label>
      <input
        id="acct-email"
        className="rd-input"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        aria-invalid={isError}
        aria-describedby={text ? errorId : undefined}
        required
      />
      {text && (
        <p id={errorId} className={isError ? 'rd-field-error' : 'rd-field-note'} role={isError ? 'alert' : 'status'}>
          {text}
        </p>
      )}
      {message === 'emailTaken' && (
        <>
          <p className="text-small rd-muted">{COPY.takenNote[locale]}</p>
          <button type="button" className="btn btn-secondary btn-block" disabled={busy} onClick={() => void send('email')}>
            {COPY.signInCode[locale]}
          </button>
        </>
      )}
      <button type="submit" className="btn btn-secondary btn-block" disabled={busy}>
        {COPY.sendCode[locale]}
      </button>
    </form>
  ) : (
    <form
      className="rd-form"
      onSubmit={(event) => {
        event.preventDefault();
        void verify();
      }}
    >
      <p className="rd-field-note" role="status">
        {email.trim()}
      </p>
      <label htmlFor="acct-code">{COPY.codeLabel[locale]}</label>
      <input
        id="acct-code"
        className="rd-input rd-code"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        pattern="[0-9]*"
        value={code}
        onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
        aria-invalid={isError}
        aria-describedby={text ? errorId : undefined}
      />
      {text && (
        <p id={errorId} className={isError ? 'rd-field-error' : 'rd-field-note'} role={isError ? 'alert' : 'status'}>
          {text}
        </p>
      )}
      {api.mode === 'mock' && <p className="text-small rd-muted">{AUTH_COPY.previewCode[locale]}</p>}
      <button type="submit" className="btn btn-gold btn-block" disabled={busy}>
        {COPY.verify[locale]}
      </button>
      <button type="button" className="text-link rd-link-button" disabled={busy} onClick={() => void send(via)}>
        {COPY.sendAgain[locale]}
      </button>
    </form>
  );
}

function AuthCard({
  api,
  locale,
  guest,
  google,
  onSignedIn,
}: {
  api: AccountApi;
  locale: Locale;
  guest: boolean;
  google: GoogleSetup | null;
  onSignedIn: (switched: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [googleMessage, setGoogleMessage] = useState<string | null>(null);

  const onGoogle = async (token: string, nonce: string) => {
    setBusy(true);
    setGoogleMessage(null);
    const outcome = await api.google(token, nonce).catch(() => ({ ok: false as const, reason: 'offline' as const }));
    setBusy(false);
    if (outcome.ok) {
      onSignedIn(outcome.switched);
      return;
    }
    const words = { not_configured: AUTH_COPY.googleOff, offline: AUTH_COPY.googleOffline, wait: AUTH_COPY.googleWait, failed: AUTH_COPY.googleFailed } as const;
    setGoogleMessage(words[outcome.reason][locale]);
  };

  return (
    <section className="glass-card acct-card acct-auth" aria-labelledby="acct-auth-title">
      <h2 id="acct-auth-title" className="text-h2 font-display">
        {AUTH_COPY.signInTitle[locale]}
      </h2>
      <p>{guest ? AUTH_COPY.guestLead[locale] : AUTH_COPY.signInLead[locale]}</p>
      {google && <GoogleButton setup={google} locale={locale} busy={busy} oneTap message={googleMessage} onCredential={(c) => void onGoogle(c.token, c.nonce)} />}
      <EmailCode api={api} locale={locale} guest={guest} onDone={onSignedIn} />
      <ul className="rd-small-list text-small rd-muted">
        <li>{AUTH_COPY.sameAccount[locale]}</li>
        <li>{COPY.emailsWeSend[locale]}</li>
        <li>{COPY.adults[locale]}</li>
      </ul>
      <p className="text-small rd-muted">
        {AUTH_COPY.agreePrefix[locale]}{' '}
        <a className="text-link" href="/terms/">
          {AUTH_COPY.terms[locale]}
        </a>{' '}
        {AUTH_COPY.and[locale]}{' '}
        <a className="text-link" href="/privacy/">
          {AUTH_COPY.privacy[locale]}
        </a>
        {locale === 'hi' ? ` ${AUTH_COPY.agreeSuffix.hi}` : AUTH_COPY.agreeSuffix.en}
      </p>
    </section>
  );
}

/* ── signed in ── */

function FreeReadings({ balance, locale }: { balance: Balance | null | undefined; locale: Locale }) {
  if (balance === undefined) return <p className="rd-muted">{AUTH_COPY.checking[locale]}</p>;
  if (balance === null) return <p className="rd-muted">{AUTH_COPY.balanceUnknown[locale]}</p>;
  if (balance.freeNow > 0) {
    return (
      <>
        <p className="acct-free">{balance.freeNow === 1 ? AUTH_COPY.freeLeftOne[locale] : fill(AUTH_COPY.freeLeftMany[locale], { n: balance.freeNow })}</p>
        <a className="btn btn-gold btn-block" href={readingHref(locale)}>
          {COPY.pickTitle[locale]}
        </a>
        {!balance.appPaid && <p className="text-small rd-muted">{fill(AUTH_COPY.moreFrom[locale], { price: rupeesOf(site.appPrices.planFromPerMonth) })}</p>}
      </>
    );
  }
  if (balance.appPaid) return <p className="acct-free">{AUTH_COPY.planInApp[locale]}</p>;
  return (
    <>
      <p className="acct-free">{AUTH_COPY.freeUsed[locale]}</p>
      <p className="text-small rd-muted">{fill(AUTH_COPY.moreFrom[locale], { price: rupeesOf(site.appPrices.planFromPerMonth) })}</p>
    </>
  );
}

function ReadingRow({ api, reading, locale }: { api: AccountApi; reading: AccountReading; locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [synthesis, setSynthesis] = useState<FinishedSynthesis | null | undefined>(undefined);
  const date = new Date(reading.createdAt).toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const hand = reading.handSide === 'left' ? COPY.leftHand[locale] : reading.handSide === 'right' ? COPY.rightHand[locale] : COPY.readingN[locale];
  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && synthesis === undefined) void api.openReading(reading.id).then(setSynthesis, () => setSynthesis(null));
  };
  return (
    <li className="acct-reading">
      <div className="acct-reading-head">
        <div>
          <p className="rd-strong">{hand}</p>
          <p className="text-small rd-muted">{date}</p>
        </div>
        <button type="button" className="btn btn-secondary" aria-expanded={open} onClick={toggle}>
          {open ? AUTH_COPY.hide[locale] : COPY.open[locale]}
        </button>
      </div>
      {open &&
        (synthesis === undefined ? (
          <p className="rd-muted">{COPY.checking[locale]}</p>
        ) : synthesis === null ? (
          <p className="rd-note">{AUTH_COPY.cantOpen[locale]}</p>
        ) : (
          <Suspense fallback={<p className="rd-muted">{COPY.checking[locale]}</p>}>
            <ServerReport synthesis={synthesis} locale={locale} />
          </Suspense>
        ))}
    </li>
  );
}

function MyReadings({ api, locale }: { api: AccountApi; locale: Locale }) {
  const [readings, setReadings] = useState<AccountReading[] | null | undefined>(undefined);
  const fetchReadings = useCallback(() => {
    void api.readings().then(setReadings, () => setReadings(null));
  }, [api]);
  useEffect(fetchReadings, [fetchReadings]);
  const load = () => {
    setReadings(undefined);
    fetchReadings();
  };
  return (
    <section id="readings" className="glass-card acct-card" aria-labelledby="acct-readings-title">
      <h2 id="acct-readings-title" className="text-h3 font-bold">
        {AUTH_COPY.myReadings[locale]}
      </h2>
      <p className="text-small rd-muted">{AUTH_COPY.readingsNote[locale]}</p>
      {readings === undefined && <p className="rd-muted">{COPY.checking[locale]}</p>}
      {readings === null && (
        <div className="rd-notice" role="alert">
          <InfoIcon />
          <div>
            <p>{AUTH_COPY.readingsError[locale]}</p>
            <button type="button" className="btn btn-secondary" onClick={load}>
              {COPY.tryAgain[locale]}
            </button>
          </div>
        </div>
      )}
      {readings && readings.length === 0 && <p>{AUTH_COPY.noReadings[locale]}</p>}
      {readings && readings.length > 0 && (
        <ul className="acct-readings">
          {readings.map((reading) => (
            <ReadingRow key={reading.id} api={api} reading={reading} locale={locale} />
          ))}
        </ul>
      )}
    </section>
  );
}

function NameField({ user, locale }: { user: StoredUser; locale: Locale }) {
  const [name, setName] = useState(() => displayName(browserStorage(), user));
  const [saved, setSaved] = useState(false);
  return (
    <form
      className="rd-form"
      onSubmit={(event) => {
        event.preventDefault();
        const clean = cleanName(name);
        setName(clean);
        saveProfileName(browserStorage(), clean);
        setSaved(true);
        syncHeader();
      }}
    >
      <label htmlFor="acct-name">{AUTH_COPY.nameLabel[locale]}</label>
      <div className="acct-row">
        <input
          id="acct-name"
          className="rd-input"
          type="text"
          autoComplete="given-name"
          maxLength={80}
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setSaved(false);
          }}
        />
        <button type="submit" className="btn btn-secondary">
          {saved ? AUTH_COPY.saved[locale] : AUTH_COPY.save[locale]}
        </button>
      </div>
      <p className="text-small rd-muted">{AUTH_COPY.nameNote[locale]}</p>
    </form>
  );
}

function SignedIn({ api, user, locale, onSignOut }: { api: AccountApi; user: StoredUser; locale: Locale; onSignOut: () => void }) {
  const [balance, setBalance] = useState<Balance | null | undefined>(undefined);
  useEffect(() => {
    void api.balance().then(setBalance, () => setBalance(null));
  }, [api]);
  const name = displayName(browserStorage(), user);
  return (
    <>
      <section className="glass-card acct-card" aria-labelledby="acct-hello">
        <div className="acct-head">
          <span className="acct-avatar" aria-hidden="true">
            {initialOf(name, user.email)}
          </span>
          <div>
            <h2 id="acct-hello" className="text-h2 font-display">
              {name ? fill(AUTH_COPY.hello[locale], { name: addressName(name, locale) }) : AUTH_COPY.helloNoName[locale]}
            </h2>
            <p className="text-small rd-muted">{user.viaGoogle ? AUTH_COPY.viaGoogle[locale] : AUTH_COPY.viaEmail[locale]}</p>
          </div>
        </div>
        <NameField user={user} locale={locale} />
        <div className="rd-field">
          <label htmlFor="acct-email-shown">{AUTH_COPY.emailLabel[locale]}</label>
          <input id="acct-email-shown" className="rd-input" type="email" value={user.email ?? ''} readOnly />
        </div>
      </section>

      <section className="glass-card acct-card" aria-labelledby="acct-free-title">
        <h2 id="acct-free-title" className="text-h3 font-bold">
          {AUTH_COPY.freeTitle[locale]}
        </h2>
        <FreeReadings balance={balance} locale={locale} />
      </section>

      <MyReadings api={api} locale={locale} />

      <section id="get-app" className="glass-card acct-card" aria-labelledby="acct-app-title">
        <h2 id="acct-app-title" className="text-h3 font-bold">
          {AUTH_COPY.getApp[locale]}
        </h2>
        <p className="text-small">{AUTH_COPY.sameAccount[locale]}</p>
        <Store locale={locale} placement="account" qr />
      </section>

      <section className="acct-card acct-plain" aria-label={AUTH_COPY.signOut[locale]}>
        <button type="button" className="btn btn-secondary btn-block" onClick={onSignOut}>
          {AUTH_COPY.signOut[locale]}
        </button>
        <p className="text-small rd-muted">{AUTH_COPY.signOutNote[locale]}</p>
        <a className="text-link text-small" href="/delete-account/">
          {AUTH_COPY.deleteAccount[locale]}
        </a>
      </section>
    </>
  );
}

/** After a sign-out: shared phones — offer to remove what this browser keeps (case 13). */
function RemoveAsk({ locale, onDone }: { locale: Locale; onDone: () => void }) {
  const [removed, setRemoved] = useState(false);
  const remove = async () => {
    const store = browserStore();
    for (const reading of await store.list().catch(() => [])) await store.remove(reading.id).catch(() => undefined);
    const storage = browserStorage();
    try {
      for (const key of [LAST_KEY, BY_READING_KEY, PROFILE_KEY]) storage?.removeItem(key);
    } catch {
      // Storage blocked: nothing kept there.
    }
    setRemoved(true);
  };
  return (
    <section className="glass-card acct-card" role="status">
      <p className="rd-strong">{AUTH_COPY.signedOut[locale]}</p>
      {removed ? (
        <>
          <p>{AUTH_COPY.removed[locale]}</p>
          <button type="button" className="btn btn-secondary" onClick={onDone}>
            {AUTH_COPY.gotIt[locale]}
          </button>
        </>
      ) : (
        <>
          <p>{AUTH_COPY.removeAsk[locale]}</p>
          <div className="acct-row">
            <button type="button" className="btn btn-secondary" onClick={() => void remove()}>
              {AUTH_COPY.removeYes[locale]}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onDone}>
              {AUTH_COPY.removeNo[locale]}
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export default function AccountApp({ locale }: { locale: Locale }) {
  const [config] = useState(() => authConfig());
  const [inApp] = useState(() => isInAppBrowser(navigator.userAgent));
  const [phase, setPhase] = useState<Phase>(config.mode === 'off' ? 'off' : 'loading');
  const [api, setApi] = useState<AccountApi | null>(null);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [signedOut, setSignedOut] = useState(false);
  const [notice, setNotice] = useState(false);
  const apiRef = useRef<AccountApi | null>(null);
  const google = config.mode === 'off' ? null : googleSetupFor(config.mode, inApp);

  const refresh = useCallback(async () => {
    const current = apiRef.current;
    if (!current) return;
    const me = await current.me().catch(() => null);
    setUser(me);
    if (me && !me.isGuest) markHadAccount(browserStorage());
    syncHeader();
  }, []);

  const signOut = useCallback(async () => {
    const current = apiRef.current;
    if (!current) return;
    await current.signOut();
    // Google must not sign them straight back in with One Tap (case 13).
    if (config.mode === 'live') void import('../../lib/auth/gis').then(({ disableGoogleAutoSelect }) => disableGoogleAutoSelect());
    setSignedOut(true);
    setNotice(false);
    await refresh();
  }, [config.mode, refresh]);

  useEffect(() => {
    if (config.mode === 'off') return;
    let alive = true;
    let unsubscribe: (() => void) | null = null;
    void makeApi(config.mode, config)
      .then(async (made) => {
        if (!alive) return;
        apiRef.current = made;
        setApi(made);
        unsubscribe = made.onChange(() => void refresh());
        const me = await made.me().catch(() => null);
        const params = new URLSearchParams(location.search);
        if (params.has('signout')) {
          params.delete('signout');
          history.replaceState(null, '', `${location.pathname}${params.toString() ? `?${params.toString()}` : ''}${location.hash}`);
          if (me && !me.isGuest) {
            await signOut();
            setPhase('ready');
            return;
          }
        }
        await refresh();
        setPhase('ready');
        // The header's "My readings" (?view=readings): once the list is on screen.
        if (params.get('view') === 'readings') window.setTimeout(() => document.getElementById('readings')?.scrollIntoView({ block: 'start' }), 50);
      })
      .catch(() => {
        if (alive) setPhase('off');
      });
    return () => {
      alive = false;
      unsubscribe?.();
    };
    // Built once per page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSignedIn = (switched: boolean) => {
    setSignedOut(false);
    setNotice(switched);
    void refresh();
  };

  if (phase === 'off') {
    return (
      <section className="glass-card acct-card" aria-labelledby="acct-off-title">
        <h2 id="acct-off-title" className="text-h2 font-display">
          {AUTH_COPY.offTitle[locale]}
        </h2>
        <p>{AUTH_COPY.offBody[locale]}</p>
        <Store locale={locale} placement="account" qr />
      </section>
    );
  }
  if (phase === 'loading' || !api) {
    return (
      <section className="rd-card rd-center" aria-live="polite">
        <div className="rd-spinner" aria-hidden="true" />
        <p>{AUTH_COPY.checking[locale]}</p>
      </section>
    );
  }

  const signedIn = user && !user.isGuest ? user : null;
  return (
    <div className="acct-stack">
      {api.mode === 'mock' && <span className="rd-badge text-caption acct-badge">{locale === 'hi' ? 'प्रीव्यू' : 'Preview'}</span>}
      {notice && (
        <div className="rd-notice" role="status">
          <InfoIcon />
          <div>
            <p>{AUTH_COPY.guestNotMoved[locale]}</p>
            <button type="button" className="btn btn-secondary" onClick={() => setNotice(false)}>
              {AUTH_COPY.gotIt[locale]}
            </button>
          </div>
        </div>
      )}
      {signedOut && !signedIn && <RemoveAsk locale={locale} onDone={() => setSignedOut(false)} />}
      {signedIn ? (
        <SignedIn api={api} user={signedIn} locale={locale} onSignOut={() => void signOut()} />
      ) : (
        <AuthCard api={api} locale={locale} guest={Boolean(user?.isGuest)} google={google} onSignedIn={onSignedIn} />
      )}
    </div>
  );
}
