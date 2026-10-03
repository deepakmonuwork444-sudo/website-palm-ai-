import { readingConfig } from '../../reading/config';
import type { PreparedPhoto } from '../../reading/image';
import { trackPhotoCheck, trackToolUse, trackUploadStart } from '../analytics';
import { focusHeading, h, svg, watchStoreClicks, whenVisible } from '../dom';
import { OPEN_TEXT, PhotoOpenError, handOffPhoto, openPhoto } from '../hand/photo';
import { lineMode } from '../line-scan';
import { checklist, computeMetrics, evaluateQuality, FIX_MESSAGES, type CheckRow } from '../photo-check';
import { actionButton } from './result-bits';
import { readingLive } from './render';

/**
 * Tool 3 — palm photo checker. The app's pixel checks on a 96 px copy, in
 * this browser; the photo is never uploaded. v3: a passing photo gets a
 * "ready" verdict and goes straight into the photo tools (kept in this tab
 * only, see hand/photo.ts), so the check is a first step, not a dead end.
 */

const TOOL = 'photo-checker' as const;

const ICONS: Record<CheckRow['state'], string> = {
  pass: 'M5 12.5l4.5 4.5L19 7.5',
  fail: 'M6 6l12 12M18 6 6 18',
  unknown: 'M6 12h12',
};
const STATE_WORD: Record<CheckRow['state'], string> = { pass: 'OK', fail: 'Needs a fix', unknown: 'Not checked yet' };

function row(item: CheckRow): HTMLElement {
  const icon = svg('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.2', 'stroke-linecap': 'round', 'aria-hidden': 'true' });
  icon.append(svg('path', { d: ICONS[item.state] }));
  return h(
    'li',
    { class: `t-check t-check-${item.state}` },
    icon,
    h(
      'span',
      {},
      h('span', { class: 't-check-label', text: item.label }),
      h('span', { class: 't-check-state', text: `: ${STATE_WORD[item.state]}` }),
      item.note ? h('span', { class: 't-check-note', text: item.note }) : null,
    ),
  );
}

export function mountPhotoChecker(): void {
  const root = document.querySelector<HTMLElement>('[data-photo-check]');
  if (!root) return;
  const q = <T extends Element>(selector: string) => root.querySelector<T>(selector);
  const start = q<HTMLElement>('[data-start]');
  const review = q<HTMLElement>('[data-review]');
  const preview = q<HTMLImageElement>('[data-preview]');
  const title = q<HTMLElement>('[data-verdict-title]');
  const text = q<HTMLElement>('[data-verdict-text]');
  const checks = q<HTMLElement>('[data-checks]');
  const after = q<HTMLElement>('[data-after]');
  const status = q<HTMLElement>('[data-status]');
  if (!start || !review || !preview || !title || !text || !checks || !after) return;
  watchStoreClicks(`tool-${TOOL}`);

  whenVisible(root, () => {
    let objectUrl: string | null = null;
    const release = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    };
    window.addEventListener('pagehide', release);

    const cameraLabel = q<HTMLElement>('[data-camera-label]');
    const galleryLabel = q<HTMLElement>('[data-gallery-label]');
    const tips = q<HTMLElement>('[data-tips]');
    /** The picker buttons sit under the result: after a check they say "another", and gold only when a retake is the next step. */
    const setPickers = (retake: boolean) => {
      if (cameraLabel) {
        cameraLabel.textContent = retake ? 'Take another photo' : 'Take a new photo';
        cameraLabel.classList.toggle('btn-gold', retake);
        cameraLabel.classList.toggle('btn-secondary', !retake);
      }
      if (galleryLabel) {
        galleryLabel.textContent = 'Choose another photo';
        galleryLabel.classList.toggle('t-pc-gallery', retake);
      }
      if (tips) tips.hidden = false;
    };

    const showError = (message: string) => {
      review.hidden = false;
      preview.hidden = true;
      title.textContent = 'We couldn’t open that photo';
      text.textContent = message;
      checks.replaceChildren();
      after.replaceChildren();
      setPickers(true);
      if (status) status.textContent = message;
      focusHeading(title);
    };

    const go = (prepared: PreparedPhoto, target: string) => {
      if (handOffPhoto(prepared, TOOL)) window.location.assign(`${target}#photo`);
      else window.location.assign(target);
    };

    const readyBlock = (prepared: PreparedPhoto): HTMLElement => {
      const lines = lineMode(readingConfig().mode) !== 'off';
      const live = readingLive();
      return h(
        'div',
        { class: 't-next' },
        h('p', { class: 'font-bold', text: 'Use this photo now' }),
        h('p', { text: 'It moves to the next tool on this device only: nothing is uploaded.' }),
        h(
          'div',
          { class: 't-actions' },
          actionButton('Find my hand type', true, () => go(prepared, '/tools/hand-type-quiz/')),
          actionButton('Read my fingers', false, () => go(prepared, '/tools/finger-reader/')),
          lines ? actionButton('Trace my lines', false, () => go(prepared, '/tools/palm-line-finder/')) : null,
        ),
        lines
          ? null
          : h('p', {
              class: 't-caveat',
              text: live
                ? 'For your lines and their meanings, take this photo to the free reading on our home page.'
                : 'Tracing your lines on this website opens soon; our Android app traces them today.',
            }),
      );
    };

    const check = async (file: File) => {
      trackToolUse(TOOL);
      trackUploadStart(TOOL);
      release();
      review.hidden = false;
      preview.hidden = true;
      title.textContent = 'Checking your photo';
      text.textContent = '';
      checks.replaceChildren();
      after.replaceChildren();
      if (status) status.textContent = 'Checking your photo on this device.';

      let prepared: PreparedPhoto;
      try {
        prepared = await openPhoto(file);
      } catch (caught) {
        showError(OPEN_TEXT[caught instanceof PhotoOpenError ? caught.problem : 'decode']);
        return;
      }
      objectUrl = URL.createObjectURL(prepared.blob);
      preview.src = objectUrl;
      preview.hidden = false;

      const verdict = evaluateQuality(computeMetrics(prepared.check), prepared.sourceWidth, prepared.sourceHeight);
      trackPhotoCheck(TOOL, verdict.passed, verdict.primaryIssue);

      checks.replaceChildren(...checklist(verdict).map(row));
      if (verdict.passed) {
        title.textContent = 'Ready: this photo is clear enough to read';
        text.textContent = 'Bright, sharp, and your palm fills the frame. These are quick pixel checks; the photo tools check your hand itself.';
        after.replaceChildren(readyBlock(prepared));
        setPickers(false);
      } else {
        const issue = verdict.primaryIssue;
        title.textContent = 'Let’s fix one thing';
        text.textContent = issue ? FIX_MESSAGES[issue] : 'That photo did not come out clearly. Please take it again.';
        after.replaceChildren(
          h('p', { class: 't-caveat', text: 'A failed check costs nothing: nothing was uploaded, and you can try as often as you like.' }),
        );
        setPickers(true);
      }
      if (status) status.textContent = `${title.textContent}. ${text.textContent}`;
      focusHeading(title);
    };

    for (const input of root.querySelectorAll<HTMLInputElement>('[data-file]')) {
      input.addEventListener('change', () => {
        const file = input.files?.[0];
        input.value = '';
        if (file) void check(file);
      });
    }
  });
}
