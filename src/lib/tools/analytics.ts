import type { ToolId } from './registry';

/**
 * Tool analytics hooks, named after the planned cookie-free event list
 * (tool-page skill; plan §13.3). They are NO-OPS today: nothing is sent until
 * WEB-FEAT-030 wires a sink AND the app repo adds the web event names to the
 * 0021 allow-list (WEB-SRV-010). Never pass personal data, photo data or quiz
 * answers tied to a person: only the fields typed below.
 */

export type Device = 'android' | 'ios' | 'desktop' | 'other';

export interface ToolEvents {
  tool_use: { tool: ToolId };
  upload_start: { tool: ToolId };
  photo_check_pass: { tool: ToolId };
  photo_check_fail: { tool: ToolId; reason: string };
  store_click: { page: string; placement: string; device: Device };
  qr_view: { page: string };
  iphone_note_shown: { page: string };
  share_card_create: { tool: ToolId };
}

export type ToolEventName = keyof ToolEvents;
type Sink = <K extends ToolEventName>(name: K, props: ToolEvents[K]) => void;

/** The default sink drops everything (no network, no storage, no cookies). */
const noop: Sink = () => undefined;
let sink: Sink = noop;

/** For unit tests, and later WEB-FEAT-030. Returns a function that restores the no-op. */
export function setAnalyticsSink(next: Sink): () => void {
  sink = next;
  return () => {
    sink = noop;
  };
}

export function track<K extends ToolEventName>(name: K, props: ToolEvents[K]): void {
  try {
    sink(name, props);
  } catch {
    // Analytics must never break a tool.
  }
}

const used = new Set<ToolId>();

/** `tool_use{tool}` once per page load, on the first real interaction (not on page view). */
export function trackToolUse(tool: ToolId): void {
  if (used.has(tool)) return;
  used.add(tool);
  track('tool_use', { tool });
}

/** Test helper: forget which tools were used. */
export function resetToolUse(): void {
  used.clear();
}

export function trackUploadStart(tool: ToolId): void {
  track('upload_start', { tool });
}

export function trackPhotoCheck(tool: ToolId, passed: boolean, reason: string | null): void {
  if (passed) track('photo_check_pass', { tool });
  else track('photo_check_fail', { tool, reason: reason ?? 'unknown' });
}

export function trackStoreClick(page: string, placement: string, device: Device): void {
  track('store_click', { page, placement, device });
}

export function trackShareCard(tool: ToolId): void {
  track('share_card_create', { tool });
}

/** The device class from `<html data-os>` and the pointer (set before paint by BaseLayout). */
export function currentDevice(root: { getAttribute(name: string): string | null } | null, finePointer: boolean): Device {
  const os = root?.getAttribute('data-os');
  if (os === 'android') return 'android';
  if (os === 'ios') return 'ios';
  return finePointer ? 'desktop' : 'other';
}
