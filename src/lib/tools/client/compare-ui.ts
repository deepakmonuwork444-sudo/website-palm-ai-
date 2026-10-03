import { readingConfig } from '../../reading/config';
import type { ReadingError } from '../../reading/errors';
import type { PreparedPhoto } from '../../reading/image';
import { isInAppBrowser } from '../../reading/browser';
import { trackPhotoCheck, trackToolUse, trackUploadStart } from '../analytics';
import { focusHeading, h, watchStoreClicks } from '../dom';
import { compareHands } from '../hand/compare';
import { DetectorError, findHands, loadHandFinder, type LoadProgress } from '../hand/detector';
import type { PhotoHands } from '../hand/landmarks';
import { OPEN_TEXT, PhotoOpenError, drawable, openPhoto, takeHandedPhoto } from '../hand/photo';
import { PROBLEM_TEXT, assessHand, sideName, type HandVerdict } from '../hand/verdict';
import { LINE_NAMES, LINE_ORDER, lineMode, scanErrorText, scanLines, type LineScanResult } from '../line-scan';
import { citeText } from '../sources';
import { CHEIRO_HANDS, DALE_HAND } from '../which-hand';
import { handFigure } from './hand-figure';
import { linesFigure } from './lines-figure';
import { progressText } from './photo-tool';
import { actionButton } from './result-bits';
import { sourceList } from './render';

/**
 * Tool 14 — left vs right hand (/tools/left-vs-right-palm/). Two photos,
 * each measured on the phone by the hand model; the hands' sides come from
 * the model (with a way out when it is wrong); the comparison lists only
 * measures that land in different bands. Lines of both hands use the
 * reading API's scan step: "opens soon" while it is off, the stored sample
 * in preview mode (labelled).
 */

const TOOL = 'hand-compare' as const;

interface Slot {
  prepared: PreparedPhoto;
  url: string;
  photo: PhotoHands;
  verdict: Extract<HandVerdict, { ok: true }>;
}

export function mountCompare(): void {
  const root = document.querySelector<HTMLElement>('[data-compare]');
  if (!root) return;
  watchStoreClicks(`tool-${TOOL}`);
  const q = <T extends Element>(selector: string) => root.querySelector<T>(selector);
  const work = q<HTMLElement>('[data-work]');
  const workText = q<HTMLElement>('[data-work-text]');
  const bar = q<HTMLProgressElement>('[data-work-bar]');
  const out = q<HTMLElement>('[data-compare-result]');
  const status = q<HTMLElement>('[data-status]');
  const inApp = q<HTMLElement>('[data-inapp]');
  const slotEls = [...root.querySelectorAll<HTMLElement>('[data-slot]')];
  if (!work || !workText || !bar || !out || slotEls.length !== 2) return;
  const output: HTMLElement = out;
  if (inApp && isInAppBrowser(navigator.userAgent)) inApp.hidden = false;
  const mode = lineMode(readingConfig().mode);
  const failOnce = new URLSearchParams(location.search).get('mockError');

  const slots: (Slot | null)[] = [null, null];
  let sameSideOk = false;
  const runs = [0, 0];

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
    } else bar.hidden = true;
  };

  /** One gold action: the first empty slot's camera; none once both are filled (the result leads). */
  const golds = () => {
    const firstEmpty = slots.findIndex((slot) => slot === null);
    slotEls.forEach((el, i) => {
      const main = i === firstEmpty;
      const camera = el.querySelector<HTMLElement>('[data-camera-label]');
      camera?.classList.toggle('btn-gold', main);
      camera?.classList.toggle('btn-secondary', !main);
      el.querySelector<HTMLElement>('[data-gallery-label]')?.classList.toggle('t-pc-gallery', main);
      const text = el.querySelector<HTMLElement>('[data-first-label]');
      if (text && slots[i]) text.textContent = 'Take another photo';
    });
  };

  const body = (i: number) => slotEls[i]!.querySelector<HTMLElement>('[data-slot-body]')!;
  const title = (i: number) => slotEls[i]!.querySelector<HTMLElement>('[data-slot-title]')!;

  const slotProblem = (i: number, heading: string, text: string, extra: Node[] = []) => {
    const hEl = h('h3', { class: 't-slot-problem', text: heading });
    body(i).replaceChildren(hEl, h('p', { text }), ...extra);
    say(`${heading}. ${text}`);
    golds();
    focusHeading(hEl);
  };

  const place = (i: number, verdict: Extract<HandVerdict, { ok: true }>, prepared: PreparedPhoto, url: string, photo: PhotoHands) => {
    slots[i] = { prepared, url, photo, verdict };
    title(i).textContent = `${sideName(verdict.side) === 'left' ? 'Left' : 'Right'} hand`;
    body(i).replaceChildren(
      handFigure({
        src: url,
        width: prepared.scan.width,
        height: prepared.scan.height,
        alt: `Photo ${i + 1}: your ${sideName(verdict.side)} hand, with the points our model found`,
        hand: verdict.hand,
      }),
      h('p', { class: 't-caveat', text: `Looks like your ${sideName(verdict.side)} hand.` }),
    );
    golds();
    renderCompare();
  };

  const judge = (i: number, prepared: PreparedPhoto, url: string, photo: PhotoHands, override: { palm?: boolean } = {}) => {
    const verdict = assessHand(photo, override);
    trackPhotoCheck(TOOL, verdict.ok, verdict.ok ? null : verdict.problem);
    if (verdict.ok) {
      place(i, verdict, prepared, url, photo);
      return;
    }
    slots[i] = null;
    const text = PROBLEM_TEXT[verdict.problem];
    const extra: Node[] = [];
    if (verdict.problem === 'back_of_hand') extra.push(actionButton('This is my palm, measure it', false, () => judge(i, prepared, url, photo, { palm: true })));
    slotProblem(i, text.title, text.fix, extra);
    renderCompare();
  };

  const run = async (i: number, file: Blob & { name?: string }) => {
    const id = ++runs[i]!;
    trackToolUse(TOOL);
    trackUploadStart(TOOL);
    const old = slots[i];
    if (old) URL.revokeObjectURL(old.url);
    slots[i] = null;
    renderCompare();
    body(i).replaceChildren(h('p', { class: 't-caveat', text: 'Opening your photo on this device…' }));
    const seen: { progress: LoadProgress | null } = { progress: null };
    const finder = loadHandFinder((progress) => {
      seen.progress = progress;
      if (progress.loaded < progress.total) setWork(progressText(progress), progress);
      else work.hidden = true;
    });
    let prepared: PreparedPhoto;
    try {
      prepared = await openPhoto(file);
    } catch (caught) {
      finder.catch(() => undefined);
      if (id !== runs[i]) return;
      slotProblem(i, 'We couldn’t open that photo', OPEN_TEXT[caught instanceof PhotoOpenError ? caught.problem : 'decode']);
      return;
    }
    const url = URL.createObjectURL(prepared.blob);
    let photo: PhotoHands;
    try {
      const landmarker = await finder;
      work.hidden = true;
      if (id !== runs[i]) return;
      body(i).replaceChildren(h('p', { class: 't-caveat', text: 'Finding your hand…' }));
      say(`Photo ${i + 1}: finding your hand.`);
      photo = await findHands(await drawable(prepared), landmarker);
    } catch (caught) {
      work.hidden = true;
      if (id !== runs[i]) return;
      const code = caught instanceof DetectorError ? caught.code : 'failed';
      const retry = actionButton('Try again', false, () => void run(i, file));
      slotProblem(
        i,
        'The hand finder didn’t start',
        code === 'offline' ? 'We couldn’t download the hand finder. Check your internet connection, then try again.' : 'This browser can’t run the hand finder. Please open this page in Chrome, or update your browser.',
        [retry],
      );
      return;
    }
    if (id !== runs[i]) return;
    judge(i, prepared, url, photo);
  };

  function renderCompare(): void {
    const [a, b] = slots;
    if (!a || !b) {
      output.replaceChildren();
      return;
    }
    const same = a.verdict.side === b.verdict.side;
    if (same && !sameSideOk) {
      const heading = h('h2', { class: 't-result-title', text: `Both photos look like your ${sideName(a.verdict.side)} hand` });
      output.replaceChildren(
        heading,
        h('p', { text: 'Take a photo of your other hand in one of the two places above. If they really are your two hands, our model guessed a side wrong.' }),
        actionButton('They are my two hands, compare anyway', false, () => {
          sameSideOk = true;
          renderCompare();
        }),
      );
      say(heading.textContent ?? '');
      focusHeading(heading);
      return;
    }
    // Columns follow the photo slots above, so the table reads in the same order as the photos; each header names its hand.
    const handName = (slot: Slot) => (sideName(slot.verdict.side) === 'left' ? 'Left hand' : 'Right hand');
    const names = same ? ['Photo 1', 'Photo 2'] : [handName(a), handName(b)];
    const { rows, differences } = compareHands(a.verdict.measures, b.verdict.measures);
    const heading = h('h2', {
      class: 't-result-title',
      text: differences === 0 ? `Your two hands match on all ${rows.length} measures` : `Your hands differ in ${differences} of ${rows.length} measures`,
    });
    const table = h(
      'table',
      { class: 't-compare-table' },
      h('caption', { class: 't-sr', text: 'Your two hands, measure by measure' }),
      h('thead', {}, h('tr', {}, h('th', { scope: 'col', text: 'Measure' }), h('th', { scope: 'col', text: names[0]! }), h('th', { scope: 'col', text: names[1]! }))),
      h(
        'tbody',
        {},
        ...rows.map((row) =>
          h(
            'tr',
            { class: row.differs ? 'is-diff' : '' },
            h('th', { scope: 'row' }, h('span', { text: row.label }), row.differs ? h('span', { class: 't-diff-tag', text: 'Differs' }) : null),
            h('td', { text: row.left }),
            h('td', { text: row.right }),
          ),
        ),
      ),
    );
    const tradition = h(
      'section',
      { class: 't-group' },
      h('h3', { class: 't-group-title', text: 'Why palmists compare both hands' }),
      h('p', {
        class: 't-reading-text',
        text: 'Cheiro reads one hand as what you were born with and the other as what you have made of it, so a difference between them is read as change you brought about. Many palmists today take the hand you write with as the second one.',
      }),
      h('p', { class: 't-reading-text', text: 'An old Indian custom, recorded by Mrs Dale in 1895, reads a man’s right palm and a woman’s left, or whichever hand shows its lines clearly.' }),
      sourceList([citeText(CHEIRO_HANDS), citeText(DALE_HAND)], 2),
    );
    const lines = linesSection();
    output.replaceChildren(
      heading,
      h('p', { class: 't-result-lead', text: 'Only measures that fall in a different band count as a difference, so small photo-to-photo wobble is not shown as one.' }),
      table,
      tradition,
      lines,
    );
    say(heading.textContent ?? '');
    focusHeading(heading);
  }

  function linesSection(): HTMLElement {
    const box = h('section', { class: 't-next' }, h('p', { class: 'font-bold', text: 'Compare the lines of both hands' }));
    if (mode === 'off') {
      box.append(
        h('p', { text: 'Tracing the lines of both hands needs our line scanner, which opens soon on this website. Nothing has been uploaded. Our Android app compares both hands’ lines today.' }),
        h('p', {}, h('a', { class: 'text-link', href: '/app/', text: 'PalmSays palm reading app' })),
      );
      return box;
    }
    const button = actionButton('Trace the lines on both photos', true, () => void traceBoth(box, button));
    box.append(h('p', { class: 't-caveat', text: 'Preview mode: nothing is uploaded; the lines come from a stored sample scan.' }), button);
    return box;
  }

  async function traceBoth(box: HTMLElement, button: HTMLButtonElement): Promise<void> {
    const [a, b] = slots;
    if (!a || !b) return;
    button.disabled = true;
    const note = h('p', { class: 't-caveat', text: 'Tracing the lines on both photos…' });
    box.append(note);
    say('Tracing the lines on both photos.');
    let results: LineScanResult[];
    try {
      results = await Promise.all([a, b].map((slot) => scanLines(slot.prepared, sideName(slot.verdict.side), mode, failOnce)));
    } catch (caught) {
      note.textContent = scanErrorText((caught as ReadingError).code ?? 'server');
      button.disabled = false;
      say(note.textContent);
      return;
    }
    const figures = [a, b].map((slot, i) => {
      const result = results[i]!;
      if (result.status !== 'ok') return h('p', { text: `Photo ${i + 1}: the scanner couldn’t read this photo. ${result.reasons[0] ?? ''}` });
      return linesFigure({ src: slot.url, width: slot.prepared.scan.width, height: slot.prepared.scan.height, lines: result.lines, alt: `Photo ${i + 1} with its traced lines`, preview: result.mode === 'mock' });
    });
    const seen = results.map((r) => new Set(r.status === 'ok' ? r.lines.map((l) => l.type) : []));
    const onlyOne = LINE_ORDER.filter((type) => seen[0]!.has(type) !== seen[1]!.has(type)).map((type) => LINE_NAMES[type]);
    const heading = h('h3', { class: 't-group-title', text: onlyOne.length ? `Seen on one hand only: ${onlyOne.join(', ')}` : 'The same lines were traced on both hands' });
    box.replaceChildren(heading, h('div', { class: 't-compare-lines' }, ...figures));
    say(heading.textContent ?? '');
    focusHeading(heading);
  }

  slotEls.forEach((el, i) => {
    for (const input of el.querySelectorAll<HTMLInputElement>('[data-file]')) {
      input.addEventListener('change', () => {
        const file = input.files?.[0];
        input.value = '';
        if (file) void run(i, file);
      });
    }
  });
  golds();

  if (window.location.hash === '#photo') {
    const handed = takeHandedPhoto();
    history.replaceState(null, '', window.location.pathname + window.location.search);
    if (handed) void run(0, handed.blob);
  }
}
