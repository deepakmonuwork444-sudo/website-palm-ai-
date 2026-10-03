/**
 * Build time: can a visitor finish a palm scan on this build? The home page's
 * gold action says what it really does (audit 2026-09-26: the words must match
 * the destination). Production follows site.webReadingEnabled only; a preview
 * (including `astro dev`) may run the mock or live reading via PUBLIC_READING_MODE.
 */
import { isPreview } from '../../config/env';
import { site } from '../../config/site';
import { resolveReadingMode } from './config';

export const webScanOpen =
  resolveReadingMode({ flag: site.webReadingEnabled, preview: isPreview, env: import.meta.env.PUBLIC_READING_MODE }) !== 'off';
