/**
 * Funnel counts (plan §13.3, SECURITY_PRIVACY.md §8): daily totals only — no
 * user id, no cookie, no personal data — sent to log_event_counts with
 * app_version 'web' in one batch when the page is hidden.
 *
 * WEB_COUNT_EVENTS MUST equal the list in the app repo's migration 0022
 * (tests/web-reading.test.ts there holds a copy): an event the server does not
 * list is silently skipped.
 */

import type { EventRow } from './api';

export const WEB_COUNT_EVENTS = {
  upload_start: [],
  photo_check_pass: [],
  photo_check_fail: [
    'too_small',
    'too_blurry',
    'too_dark',
    'too_bright',
    'low_contrast',
    'no_palm_detected',
    'palm_too_small_in_frame',
    'possible_back_of_hand',
    'heic',
    'decode',
  ],
  sample_hand_open: [],
  reading_start: ['1', '2'],
  lines_found: [],
  reading_done: ['1', '2'],
  reading_error: [
    'no_readings_left',
    'needs_email_verification',
    'invalid_session',
    'image_too_large',
    'not_a_palm',
    'daily_capacity_reached',
    'too_many_attempts',
    'rate_limited',
    'scanner_unavailable',
    'service_paused',
    'offline',
    'turnstile',
    'other',
  ],
  lock_tap: ['career-money', 'direction'],
  signup_start: [],
  signup_done: [],
  zero_state_view: [],
  store_click: ['reading', 'lock', 'zero', 'home', 'app', 'guide', 'tool', 'header', 'footer', 'other'],
  qr_view: [],
  whatsapp_self: [],
  iphone_note_shown: [],
  inapp_browser_note: [],
  share_card_create: [],
  tool_use: ['tool1', 'tool2', 'tool3', 'tool4', 'tool5', 'tool6', 'tool7', 'tool8', 'tool9', 'tool10', 'tool11', 'tool12'],
  pdf_optin: [],
} as const satisfies Record<string, readonly string[]>;

export type WebEvent = keyof typeof WEB_COUNT_EVENTS;

/** A known event with '' or one of its own details. */
export function isAllowedEvent(event: string, detail = ''): event is WebEvent {
  if (!Object.prototype.hasOwnProperty.call(WEB_COUNT_EVENTS, event)) return false;
  return detail === '' || (WEB_COUNT_EVENTS[event as WebEvent] as readonly string[]).includes(detail);
}

/** The visitor's own date (the server accepts IST today −7 … +1). */
export function dayOf(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** A tally of events, turned into at most 40 rows of n ≤ 50 (the server's limits). */
export class EventTally {
  private counts = new Map<string, number>();

  constructor(private readonly variant: string = 'a') {}

  add(event: WebEvent, detail = ''): void {
    if (!isAllowedEvent(event, detail)) return;
    const key = `${event}|${detail}`;
    this.counts.set(key, Math.min(50, (this.counts.get(key) ?? 0) + 1));
  }

  drain(now: Date = new Date()): EventRow[] {
    const day = dayOf(now);
    const rows = [...this.counts].slice(0, 40).map(([key, n]) => {
      const [event, detail] = key.split('|') as [string, string];
      return { event, detail, variant: this.variant, app_version: 'web', n, day };
    });
    this.counts.clear();
    return rows;
  }
}
