import { readingConfig } from '../../reading/config';
import type { ReadingError } from '../../reading/errors';
import type { PreparedPhoto } from '../../reading/image';
import { isInAppBrowser } from '../../reading/browser';
import { trackPhotoCheck, trackToolUse, trackUploadStart } from '../analytics';
import { focusHeading, h, watchStoreClicks } from '../dom';
import { OPEN_TEXT, PhotoOpenError, handOffPhoto, openPhoto } from '../hand/photo';
import { lineMode, scanErrorText, scanLines, type LineMode } from '../line-scan';
import { FIX_MESSAGES, computeMetrics, evaluateQuality } from '../photo-check';
import { linesFigure } from './lines-figure';
import { actionButton } from './result-bits';

/**
 * Tool 2 — palm line finder (/tools/palm-line-finder/). Lines only, no
 * meanings, no reading used. Off (production today): the server-rendered
 * "opens soon" block stays and nothing uploads. Mock (previews, tests):
 * the full flow with the reading API's stored sample scan, labelled
 * "Preview" in words on the result.
 */

const TOOL = 'line-finder' as const;

export function mountLineFinder(): void {
  const root = document.querySelector<HTMLElement>('[data-line-finder]');
  if (!root) return;
  watchStoreClicks(`tool-${TOOL}`);
  const config = readingConfig();
  const mode: LineMode = lineMode(config.mode);
  if (mode === 'off') return;

  const q = <T extends Element>(selector: string) => root.querySelector<T>(selector);
  const off = q<HTMLElement>('[data-off]');
  const on = q<HTMLElement>('[data-on]');
  const start = q<HTMLElement>('[data-start]');
  const work = q<HTMLElement>('[data-work]');
  const workText = q<HTMLElement>('[data-work-text]');
  const result = q<HTMLElement>('[data-result]');
  const status = q<HTMLElement>('[data-status]');
  const inApp = q<HTMLElement>('[data-inapp]');
  if (!off || !on || !start || !work || !workText || !result) return;
  off.hidden = true;
  on.hidden = false;
  if (inApp && isInAppBrowser(navigator.userAgent)) inApp.hidden = false;
  const failOnce = new URLSearchParams(location.search).get('mockError');

  let url: string | null = null;
  let running = 0;
  const say = (text: string) => {
    if (status) status.textContent = text;
  };
  const setWork = (text: string) => {
    work.hidden = false;
    workText.textContent = text;
    say(text);
  };
  const hand = () => (root.querySelector<HTMLInputElement>('input[name="lf-hand"]:checked')?.value === 'left' ? 'left' : 'right');

  const finish = (nodes: Node[], heading: HTMLElement, retakeIsMain: boolean) => {
    work.hidden = true;
    result.replaceChildren(...nodes);
    start.hidden = false;
    const camera = start.querySelector<HTMLElement>('[data-camera-label]');
    camera?.classList.toggle('btn-gold', retakeIsMain);
    camera?.classList.toggle('btn-secondary', !retakeIsMain);
    start.querySelector<HTMLElement>('[data-gallery-label]')?.classList.toggle('t-pc-gallery', retakeIsMain);
    say(heading.textContent ?? '');
    focusHeading(heading);
  };

  const problem = (title: string, text: string) => {
    const heading = h('h2', { class: 't-result-title', text: title });
    finish([heading, h('p', { text }), h('p', { class: 't-caveat', text: 'A failed try costs nothing, and you can try as often as you like.' })], heading, true);
  };

  const run = async (file: Blob & { name?: string }) => {
    const id = ++running;
    trackToolUse(TOOL);
    trackUploadStart(TOOL);
    if (url) URL.revokeObjectURL(url);
    url = null;
    result.replaceChildren();
    start.hidden = true;
    setWork('Opening your photo on this device…');
    let prepared: PreparedPhoto;
    try {
      prepared = await openPhoto(file);
    } catch (caught) {
      if (id !== running) return;
      problem('We couldn’t open that photo', OPEN_TEXT[caught instanceof PhotoOpenError ? caught.problem : 'decode']);
      return;
    }
    if (id !== running) return;
    url = URL.createObjectURL(prepared.blob);
    // The app's own local check first: a photo that fails is never scanned.
    const pixels = evaluateQuality(computeMetrics(prepared.check), prepared.sourceWidth, prepared.sourceHeight);
    trackPhotoCheck(TOOL, pixels.passed, pixels.primaryIssue);
    if (!pixels.passed) {
      problem('Let’s fix one thing first', pixels.primaryIssue ? FIX_MESSAGES[pixels.primaryIssue] : 'That photo did not come out clearly. Please take it again.');
      return;
    }
    setWork(mode === 'mock' ? 'Tracing your lines (preview mode: nothing is uploaded)…' : 'Tracing your lines…');
    try {
      const scan = await scanLines(prepared, hand(), mode, failOnce);
      if (id !== running) return;
      if (scan.status === 'rejected') {
        problem('The scanner couldn’t read this photo', scan.reasons[0] ?? 'Please take the photo again in good light, with the whole palm in the frame.');
        return;
      }
      const count = scan.lines.length;
      const heading = h('h2', { class: 't-result-title', text: count > 0 ? `${count} of 4 main lines traced` : 'No line was clear enough to trace' });
      const nodes: Node[] = [
        heading,
        h('p', { class: 't-result-lead', text: 'Lines only, no meanings. A line we can’t see clearly is listed as “not clearly seen”; we never guess one.' }),
        linesFigure({ src: url, width: prepared.scan.width, height: prepared.scan.height, lines: scan.lines, alt: 'Your palm photo with the traced lines drawn on it', preview: scan.mode === 'mock' }),
        h(
          'div',
          { class: 't-next' },
          h('p', { class: 'font-bold', text: 'More from this photo, on your phone' }),
          h('p', { text: 'Your hand type and your fingers can be measured from the same photo, without uploading it.' }),
          h(
            'div',
            { class: 't-actions' },
            actionButton('Find my hand type from this photo', true, () => go('/tools/hand-type-quiz/', prepared)),
            actionButton('Read my fingers', false, () => go('/tools/finger-reader/', prepared)),
          ),
        ),
      ];
      finish(nodes, heading, false);
    } catch (caught) {
      if (id !== running) return;
      problem('The lines couldn’t be traced this time', scanErrorText((caught as ReadingError).code ?? 'server'));
    }
  };

  const go = (target: string, prepared: PreparedPhoto) => {
    if (handOffPhoto(prepared, TOOL)) window.location.assign(`${target}#photo`);
    else window.location.assign(target);
  };

  for (const input of root.querySelectorAll<HTMLInputElement>('[data-file]')) {
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      input.value = '';
      if (file) void run(file);
    });
  }
}
