/**
 * Account configuration, read in the browser. The mode follows the reading's
 * (config.ts): `off` = sign-in on the website is not open (production until
 * the owner's setup is done, OWNER_AUTH_SETUP.md); `mock` = previews;
 * `live` = the real backend through the proxy.
 *
 * PUBLIC_GOOGLE_WEB_CLIENT_ID is the app's Google Web client ID (public by
 * design). Without it the Google button is hidden in live mode; the email
 * code still works.
 */

import { readingConfig, type ReadingConfig } from '../reading/config';
import { acceptGoogleClientId } from './google';

export interface AuthConfig {
  reading: ReadingConfig;
  mode: ReadingConfig['mode'];
  /** The Google Web client ID, or null (button hidden in live mode). */
  googleClientId: string | null;
}

export function authConfig(search?: string): AuthConfig {
  const reading = readingConfig(search);
  const mode = reading.mode === 'live' && !reading.publishableKey ? 'off' : reading.mode;
  return { reading, mode, googleClientId: acceptGoogleClientId(import.meta.env.PUBLIC_GOOGLE_WEB_CLIENT_ID) };
}

/** Whether "Continue with Google" can show: mock always (a preview button), live only with a client ID. */
export function googleAvailable(config: Pick<AuthConfig, 'mode' | 'googleClientId'>): boolean {
  return config.mode === 'mock' || (config.mode === 'live' && config.googleClientId !== null);
}

/** What "Continue with Google" needs on a page; null = no Google button (email code only). */
export function googleSetupFor(mode: ReadingConfig['mode'], inApp: boolean): { mode: 'mock' | 'live'; clientId: string | null; inApp: boolean } | null {
  const clientId = acceptGoogleClientId(import.meta.env.PUBLIC_GOOGLE_WEB_CLIENT_ID);
  if (mode === 'mock') return { mode, clientId, inApp };
  if (mode === 'live' && clientId) return { mode, clientId, inApp };
  return null;
}
