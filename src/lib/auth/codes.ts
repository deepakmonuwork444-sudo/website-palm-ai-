/**
 * Supabase Auth errors for the 6-digit email codes → what the screen says
 * (never Supabase's raw text). Shared by the reading's sign-up sheet
 * (api-live.ts re-exports these) and the account page.
 */

import type { CodeResult, VerifyResult } from '../reading/balance';
import { ReadingError } from '../reading/errors';

export interface AuthCodeError {
  message?: string | undefined;
  code?: string | undefined;
  status?: number | undefined;
}

export function codeResultOf(error: AuthCodeError): CodeResult {
  const text = String(error.message ?? '').toLowerCase();
  const code = String(error.code ?? '');
  if (code === 'email_exists' || text.includes('already been registered') || text.includes('already registered')) return 'taken';
  if (code === 'otp_disabled' || code === 'email_provider_disabled' || code === 'signup_disabled' || text.includes('disabled')) return 'unavailable';
  if (code === 'user_not_found' || text.includes('signups not allowed')) return 'invalid';
  if (code.startsWith('over_') || text.includes('rate limit') || text.includes('security purposes') || error.status === 429) return 'wait';
  if (code === 'email_address_invalid' || text.includes('invalid')) return 'invalid';
  throw new ReadingError(/fetch|network/i.test(text) ? 'offline' : 'server', code || 'auth');
}

export function verifyResultOf(error: AuthCodeError): VerifyResult {
  const text = String(error.message ?? '').toLowerCase();
  const code = String(error.code ?? '');
  if (code.startsWith('over_') || text.includes('rate limit') || error.status === 429) return 'wait';
  if (/fetch|network/.test(text)) throw new ReadingError('offline', 'verify');
  return 'wrong';
}
