/**
 * The account page's backend contract (WEB-FEAT-029). Two implementations:
 * live.ts (the shared Supabase client through the proxy) and mock.ts
 * (previews: a pretend account kept in this browser, nothing sent).
 * Light on purpose: types only, no Supabase and no palm engine here.
 */

import type { FinishedSynthesis } from '../reading/palm/features/knowledge/synthesis/modules';
import type { Balance, CodeResult, VerifyResult } from '../reading/balance';
import type { GoogleOutcome } from './google';
import type { StoredUser } from './state';

export interface AccountReading {
  id: string;
  createdAt: string;
  handSide: 'left' | 'right' | null;
}

export type CodeVia = 'email_change' | 'email';

export interface AccountApi {
  readonly mode: 'mock' | 'live';
  /** The session in this browser (a guest too); null when there is none. */
  me(): Promise<StoredUser | null>;
  /** reading_balance(); null when it could not be read. */
  balance(): Promise<Balance | null>;
  /** Google ID token: a guest links it (same account), anyone else signs in. */
  google(token: string, nonce: string): Promise<GoogleOutcome>;
  /** email_change: a guest adds an email to the SAME account; email: sign in (or sign up) with a code. */
  sendCode(email: string, via: CodeVia): Promise<CodeResult>;
  verifyCode(email: string, code: string, via: CodeVia): Promise<VerifyResult>;
  /** Readings saved to the account (any device), newest first. */
  readings(): Promise<AccountReading[]>;
  /** One reading as the web shows it: rebuilt from the saved observation, then LOCKED like the web report. */
  openReading(id: string): Promise<FinishedSynthesis | null>;
  /** This browser only (`scope: 'local'`): the app on the phone stays signed in. */
  signOut(): Promise<void>;
  /** Called when the session changes (another tab, a token refresh that failed). */
  onChange(listener: () => void): () => void;
}
