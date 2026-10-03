/**
 * The shared flow of the on-device photo tools (hand type, finger reader,
 * and each photo of left vs right): pick → open (EXIF-rotated, re-encoded,
 * nothing uploaded) → download the hand finder once, with real progress →
 * find the hand → one clear problem with its fix, or the tool's result.
 *
 * Accessibility: every stage is said in words in a polite live region, the
 * result's heading gets focus, and nothing depends on colour alone.
 */

import type { PreparedPhoto } from '../../reading/image';
import { isInAppBrowser } from '../../reading/browser';
import { trackPhotoCheck, trackToolUse, trackUploadStart } from '../analytics';
import { focusHeading, h } from '../dom';
import { DetectorError, findHands, loadHandFinder, type LoadProgress } from '../hand/detector';
import type { PhotoHands } from '../hand/landmarks';
import { mbText } from '../hand/model-files';
import { OPEN_TEXT, PhotoOpenError, drawable, handOffPhoto, openPhoto, takeHandedPhoto } from '../hand/photo';
import { PROBLEM_TEXT, assessHand, type HandVerdict } from '../hand/verdict';
import { FIX_MESSAGES, computeMetrics, evaluateQuality } from '../photo-check';
import type { ToolId } from '../registry';
import { handFigure } from './hand-figure';

export interface PhotoResult {
  prepared: PreparedPhoto;
  /** Object URL of the 1,080 px copy (revoked when the next photo comes). */
  url: string;
  photo: PhotoHands;
  verdict: Extract<HandVerdict, { ok: true }>;
}

export interface ToolLinks {
  /** Send this photo to another tool page (kept in this tab only). */
  handOff(target: string, from: ToolId): void;
}

/** What the run needs from the page: where to write, and how to draw a result. */
export interface PhotoToolView {
  tool: ToolId;
  root: HTMLElement;
  render(result: PhotoResult, links: ToolLinks): { nodes: Node[]; heading: HTMLElement };
}

const DETECTOR_TEXT: Record<DetectorError['code'], string> = {
  offline: 'We couldn’t download the hand finder. Check your internet connection, then try again.',
  unsupported: 'This browser can’t run the hand finder. Please open this page in Chrome, or update your browser.',
  failed: 'The hand finder didn’t load. Please try again in a moment.',
};

export function progressText(progress: LoadProgress): string {
  return `Getting the hand finder ready: ${mbText(progress.loaded)} of ${mbText(progress.total)} MB. This happens once; your browser keeps it for next time.`;
}

export function mountPhotoTool(view: PhotoToolView): void {
  const { root, tool } = view;
  const q = <T extends Element>(selector: string) => root.querySelector<T>(selector);
  const start = q<HTMLElement>('[data-start]');
  const work = q<HTMLElement>('[data-work]');
  const workText = q<HTMLElement>('[data-work-text]');
  const bar = q<HTMLProgressElement>('[data-work-bar]');
  const result = q<HTMLElement>('[data-result]');
  const status = q<HTMLElement>('[data-status]');
  const inApp = q<HTMLElement>('[data-inapp]');
  if (!start || !work || !workText || !bar || !result) return;
  if (inApp && isInAppBrowser(navigator.userAgent)) inApp.hidden = false;

  let url: string | null = null;
  let last: { prepared: PreparedPhoto; photo: PhotoHands } | null = null;
  let running = 0;

  const say = (text: string) => {
    if (status) status.textContent = text;
  };
  const setWork = (text: string, progress?: LoadProgress | null) => {
    work.hidden = false;
    workText.textContent = text;
    if (progress) {
      bar.hidden = false;
      bar.max = progress.total;
      bar.value = progress.loaded;
    } else {
      bar.hidden = true;
    }
  };
  const release = () => {
    if (url) URL.revokeObjectURL(url);
    url = null;
  };
  window.addEventListener('pagehide', release);

  /** The pickers come back under the result as "another photo": gold only when a retake is the next step. */
  const pickers = (retakeIsMain: boolean) => {
    start.hidden = false;
    // After a result, only the retake buttons and the privacy line stay: no repeated tips.
    for (const el of start.querySelectorAll<HTMLElement>('[data-first-only]')) el.hidden = !retakeIsMain;
    for (const label of start.querySelectorAll<HTMLElement>('[data-first-label]')) label.textContent = label.dataset.againText ?? label.textContent;
    const camera = start.querySelector<HTMLElement>('[data-camera-label]');
    camera?.classList.toggle('btn-gold', retakeIsMain);
    camera?.classList.toggle('btn-secondary', !retakeIsMain);
    start.querySelector<HTMLElement>('[data-gallery-label]')?.classList.toggle('t-pc-gallery', retakeIsMain);
  };

  const links: ToolLinks = {
    handOff(target, from) {
      if (last && handOffPhoto(last.prepared, from)) window.location.assign(`${target}#photo`);
      else window.location.assign(target);
    },
  };

  const showProblem = (title: string, fix: string, figure: HTMLElement | null, extra: Node[] = []) => {
    work.hidden = true;
    const heading = h('h2', { class: 't-result-title', text: title });
    result.replaceChildren(
      h('div', { class: 't-problem' }, figure, h('div', { class: 't-problem-text' }, heading, h('p', { text: fix }), ...extra)),
      h('p', { class: 't-caveat', text: 'Nothing was uploaded, and you can try as often as you like.' }),
    );
    pickers(true);
    say(`${title}. ${fix}`);
    focusHeading(heading);
  };

  const showResult = (verdict: Extract<HandVerdict, { ok: true }>, prepared: PreparedPhoto, photo: PhotoHands) => {
    work.hidden = true;
    const view2 = view.render({ prepared, url: url!, photo, verdict }, links);
    result.replaceChildren(...view2.nodes);
    pickers(false);
    say(`${view2.heading.textContent ?? ''}. The full result is below the heading.`);
    focusHeading(view2.heading);
  };

  const judge = (prepared: PreparedPhoto, photo: PhotoHands, override: { palm?: boolean } = {}) => {
    const verdict = assessHand(photo, override);
    trackPhotoCheck(tool, verdict.ok, verdict.ok ? null : verdict.problem);
    if (verdict.ok) {
      showResult(verdict, prepared, photo);
      return;
    }
    const text = PROBLEM_TEXT[verdict.problem];
    let fix = text.fix;
    if (verdict.problem === 'no_hand') {
      // The pixel check often knows why: too dark, blurry, too far.
      const pixels = evaluateQuality(computeMetrics(prepared.check), prepared.sourceWidth, prepared.sourceHeight);
      // Only light and focus: framing advice would contradict "fit your whole hand".
      const issue = pixels.primaryIssue;
      if (!pixels.passed && (issue === 'too_dark' || issue === 'too_bright' || issue === 'too_blurry')) fix = `${FIX_MESSAGES[issue]} ${fix}`;
    }
    const figure = verdict.hand
      ? handFigure({ src: url!, width: prepared.scan.width, height: prepared.scan.height, alt: 'Your photo, with the points we found drawn on it', hand: verdict.hand })
      : handFigure({ src: url!, width: prepared.scan.width, height: prepared.scan.height, alt: 'Your photo', hand: null });
    const extra: Node[] = [];
    if (verdict.problem === 'back_of_hand') {
      const button = h('button', { type: 'button', class: 'btn btn-secondary', text: 'This is my palm, measure it' });
      button.addEventListener('click', () => judge(prepared, photo, { palm: true }));
      extra.push(h('p', { class: 't-caveat', text: 'Our model can mix up the palm and the back of the hand on some photos.' }), button);
    }
    showProblem(text.title, fix, figure, extra);
  };

  const run = async (file: Blob & { name?: string }) => {
    const id = ++running;
    trackToolUse(tool);
    trackUploadStart(tool);
    release();
    result.replaceChildren();
    start.hidden = true;
    setWork('Opening your photo on this device…');
    say('Opening your photo on this device.');
    // Start the (one-time) download at once; it runs while the photo opens.
    const seen: { progress: LoadProgress | null } = { progress: null };
    const finder = loadHandFinder((progress) => {
      seen.progress = progress;
      if (id === running && progress.loaded < progress.total) setWork(progressText(progress), progress);
    });
    let prepared: PreparedPhoto;
    try {
      prepared = await openPhoto(file);
    } catch (caught) {
      finder.catch(() => undefined);
      if (id !== running) return;
      const problem = caught instanceof PhotoOpenError ? caught.problem : 'decode';
      showProblem('We couldn’t open that photo', OPEN_TEXT[problem], null);
      return;
    }
    if (id !== running) return;
    url = URL.createObjectURL(prepared.blob);
    const now = seen.progress;
    if (now && now.loaded < now.total) setWork(progressText(now), now);
    let photo: PhotoHands;
    try {
      const landmarker = await finder;
      if (id !== running) return;
      setWork('Finding your hand…');
      say('Finding your hand.');
      photo = await findHands(await drawable(prepared), landmarker);
    } catch (caught) {
      if (id !== running) return;
      const code = caught instanceof DetectorError ? caught.code : 'failed';
      const retry = h('button', { type: 'button', class: 'btn btn-secondary', text: 'Try again' });
      retry.addEventListener('click', () => void run(file));
      showProblem('The hand finder didn’t start', DETECTOR_TEXT[code], null, [retry]);
      return;
    }
    if (id !== running) return;
    last = { prepared, photo };
    judge(prepared, photo);
  };

  for (const input of root.querySelectorAll<HTMLInputElement>('[data-file]')) {
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      input.value = '';
      if (file) void run(file);
    });
  }

  // A photo handed over by another tool (the person tapped "Use this photo" there).
  if (window.location.hash === '#photo') {
    const handed = takeHandedPhoto();
    history.replaceState(null, '', window.location.pathname + window.location.search);
    if (handed) {
      root.scrollIntoView({ block: 'start' });
      void run(handed.blob);
    }
  }
}
