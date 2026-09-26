import { trackPhotoCheck, trackToolUse, trackUploadStart } from '../analytics';
import { focusHeading, h, svg, watchStoreClicks, whenVisible } from '../dom';
import {
  analysisSize,
  checklist,
  computeMetrics,
  evaluateQuality,
  fileProblem,
  FIX_MESSAGES,
  type CheckRow,
} from '../photo-check';
import { readingLive } from './render';

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
      h('span', { class: 't-check-state', text: ` — ${STATE_WORD[item.state]}` }),
      item.note ? h('span', { class: 't-check-note', text: item.note }) : null,
    ),
  );
}

/** Decodes the picked file on this device. Throws on formats the browser can't open (often HEIC). */
async function decode(url: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
  await img.decode();
  if (!img.naturalWidth || !img.naturalHeight) throw new Error('empty image');
  return img;
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

    const check = async (file: File) => {
      trackToolUse(TOOL);
      trackUploadStart(TOOL);
      release();
      const problem = fileProblem(file.type, file.name);
      if (problem === 'not-image') {
        showError('That file isn’t a photo. Please choose a JPG or PNG picture of your palm.');
        return;
      }
      objectUrl = URL.createObjectURL(file);
      review.hidden = false;
      preview.hidden = false;
      preview.src = objectUrl;
      title.textContent = 'Checking your photo';
      text.textContent = '';
      checks.replaceChildren();
      after.replaceChildren();
      if (status) status.textContent = 'Checking your photo on this device.';

      let img: HTMLImageElement;
      try {
        img = await decode(objectUrl);
      } catch {
        showError(
          problem === 'heic'
            ? 'This photo is in HEIC format, which this browser can’t open. Please choose a JPG — on an iPhone, set Camera, Formats to Most Compatible.'
            : 'This browser couldn’t read that photo. Please choose a JPG or PNG.',
        );
        return;
      }

      const size = analysisSize(img.naturalWidth, img.naturalHeight);
      const canvas = document.createElement('canvas');
      canvas.width = size.width;
      canvas.height = size.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        showError('This browser can’t check photos. Please try Chrome.');
        return;
      }
      ctx.drawImage(img, 0, 0, size.width, size.height);
      const pixels = ctx.getImageData(0, 0, size.width, size.height);
      const verdict = evaluateQuality(
        computeMetrics({ data: pixels.data, width: size.width, height: size.height }),
        img.naturalWidth,
        img.naturalHeight,
      );
      trackPhotoCheck(TOOL, verdict.passed, verdict.primaryIssue);

      checks.replaceChildren(...checklist(verdict).map(row));
      if (verdict.passed) {
        title.textContent = 'This photo looks clear enough to read';
        text.textContent = 'Bright, sharp, and your palm fills the frame. These are quick pixel checks: the real test is whether your lines can be traced.';
        const live = readingLive();
        after.replaceChildren(
          h(
            'div',
            { class: 't-next' },
            h('p', { class: 'font-bold', text: live ? 'Ready for your reading' : 'Next: your reading' }),
            h('p', {
              text: live
                ? 'Take this photo to the free reading on our home page.'
                : 'The free web reading on this site opens soon. You can read your palm today in our Android app, which runs the same checks.',
            }),
            h('p', {}, h('a', { class: 'text-link', href: live ? '/#read' : '/app/', text: live ? 'Go to the free reading' : 'See what the app does' })),
          ),
        );
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
