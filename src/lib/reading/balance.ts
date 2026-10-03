/**
 * The light account types of the reading contract (api.ts re-exports them).
 * Kept apart from api.ts so the account page reads the balance without the
 * palm engine (zod schemas, scanner types) that api.ts brings.
 */

export interface Balance {
  /** Free readings usable right now. */
  freeNow: number;
  /** Free readings still to come, including the one a guest gets by signing up. */
  freeRemaining: number;
  /** The next free reading needs an email code first. */
  emailNeeded: boolean;
  /**
   * Present (true) only when the account has an active plan or pack readings IN THE APP.
   * Web readings are free-only (0022): these people are told "use your plan in the app",
   * never "buy" (WEB_AUTH_PLAN.md case 21). Never counted as free readings.
   */
  appPaid?: true;
}

export interface WebUser {
  id: string;
  email: string | null;
  isGuest: boolean;
}

export type CodeResult = 'sent' | 'taken' | 'wait' | 'unavailable' | 'invalid';
export type VerifyResult = 'ok' | 'wrong' | 'wait';

/** `reading_balance()` → the free numbers the website uses; packs and plans only as the `appPaid` flag. */
export function parseBalance(data: unknown): Balance {
  const row = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  const num = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0);
  const subscription = row.subscription && typeof row.subscription === 'object' ? (row.subscription as Record<string, unknown>) : {};
  const paid = num(row.paid_available) > 0 || row.unlimited === true || subscription.active === true;
  return {
    freeNow: num(row.free_now),
    freeRemaining: num(row.free_remaining),
    emailNeeded: row.email_needed === true,
    ...(paid ? { appPaid: true as const } : {}),
  };
}
