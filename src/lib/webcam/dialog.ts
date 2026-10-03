/**
 * The laptop camera dialog (WEB-DEC-059), loaded by import() only when
 * "Use laptop camera" is pressed. A native <dialog> (modal, Esc closes) with a
 * mirrored live preview, the palm outline from the guides, an optional
 * 3-second timer, retake and cancel. The capture is NOT mirrored and is handed
 * back as a JPEG File, which the caller pushes through the same path as an
 * uploaded photo. The video never leaves the device; every camera track is
 * stopped when the dialog closes.
 */
// Its CSS is a hashed file linked only when the dialog first opens (a plain CSS import in a lazy chunk is dropped by the build).
import cssUrl from './dialog.css?url';

import { PALM_OUTLINE } from '../guides/palm-geometry';
import { cameraErrorKind, frameToFile, type CameraErrorKind } from './core';

type Locale = 'en' | 'hi';

const TEXT = {
  en: {
    title: 'Use your laptop camera',
    tip: 'Hold your open palm 30 to 40 cm from the camera, in good light. Fit it inside the outline.',
    starting: 'Starting the camera…',
    live: 'Camera on.',
    take: 'Take photo',
    timer: '3-second timer',
    retake: 'Retake',
    use: 'Use this photo',
    cancel: 'Cancel',
    retry: 'Try again',
    upload: 'Upload a palm photo',
    video: 'Live camera preview, shown only on this device',
    shot: 'Your palm photo, shown only on this device',
    taken: 'Photo taken. Use it, or retake.',
    privacy: 'The live video stays on this device. Only the photo you use goes on, the same way as an upload.',
    errors: {
      denied: 'Camera access is blocked. Allow the camera in your browser’s address bar and try again, or upload a photo instead.',
      none: 'We couldn’t find a camera on this device. Upload a palm photo instead.',
      busy: 'Your camera is being used by another app, such as a video call. Close it and try again, or upload a photo instead.',
      insecure: 'The camera works only on a secure (https) page. Upload a palm photo instead.',
      failed: 'The camera didn’t start. Try again, or upload a palm photo instead.',
    } satisfies Record<CameraErrorKind, string>,
  },
  hi: {
    title: 'लैपटॉप कैमरा इस्तेमाल करें',
    tip: 'खुली हथेली कैमरे से 30 से 40 सेमी दूर, अच्छी रोशनी में रखें। उसे आउटलाइन के अंदर रखें।',
    starting: 'कैमरा शुरू हो रहा है…',
    live: 'कैमरा चालू है।',
    take: 'फ़ोटो लें',
    timer: '3 सेकंड का टाइमर',
    retake: 'दोबारा लें',
    use: 'यह फ़ोटो इस्तेमाल करें',
    cancel: 'रद्द करें',
    retry: 'फिर कोशिश करें',
    upload: 'हथेली की फ़ोटो डालें',
    video: 'कैमरे का लाइव दृश्य, सिर्फ़ इसी डिवाइस पर',
    shot: 'आपकी हथेली की फ़ोटो, सिर्फ़ इसी डिवाइस पर',
    taken: 'फ़ोटो ले ली गई। इसे इस्तेमाल करें या दोबारा लें।',
    privacy: 'लाइव वीडियो इसी डिवाइस पर रहता है। सिर्फ़ आपकी चुनी फ़ोटो आगे जाती है, अपलोड की तरह ही।',
    errors: {
      denied: 'कैमरे की अनुमति बंद है। ब्राउज़र के एड्रेस बार में कैमरे की अनुमति दें और फिर कोशिश करें, या फ़ोटो डालें।',
      none: 'इस डिवाइस पर कोई कैमरा नहीं मिला। हथेली की फ़ोटो डालें।',
      busy: 'आपका कैमरा किसी दूसरे ऐप (जैसे वीडियो कॉल) में चल रहा है। उसे बंद करके फिर कोशिश करें, या फ़ोटो डालें।',
      insecure: 'कैमरा सिर्फ़ सुरक्षित (https) पेज पर चलता है। हथेली की फ़ोटो डालें।',
      failed: 'कैमरा शुरू नहीं हुआ। फिर कोशिश करें, या हथेली की फ़ोटो डालें।',
    } satisfies Record<CameraErrorKind, string>,
  },
};

export interface WebcamOptions {
  locale?: Locale;
  /** "Upload a palm photo" after a camera error: opens the normal file picker. */
  onUpload?: () => void;
}

type Attrs = Record<string, string | boolean>;

function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs = {}, ...children: (Node | string)[]): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === true) node.setAttribute(key, '');
    else if (value !== false) node.setAttribute(key, value);
  }
  node.append(...children);
  return node;
}

function guide(): SVGSVGElement {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('class', 'wc-guide');
  svg.setAttribute('viewBox', '36 30 178 230');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(ns, 'path');
  path.setAttribute('d', PALM_OUTLINE);
  svg.append(path);
  return svg;
}

let counter = 0;
let styles: Promise<void> | null = null;

/** Links dialog.css once and waits for it (no unstyled flash). */
function loadStyles(): Promise<void> {
  styles ??= new Promise((done) => {
    const link = h('link', { rel: 'stylesheet', href: cssUrl });
    link.addEventListener('load', () => done(), { once: true });
    link.addEventListener('error', () => done(), { once: true });
    document.head.append(link);
  });
  return styles;
}

export async function openWebcam(options: WebcamOptions = {}): Promise<File | null> {
  await loadStyles();
  const t = TEXT[options.locale ?? 'en'];
  const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const id = `wc-${++counter}`;

  const video = h('video', { class: 'wc-video', playsinline: true, muted: true, autoplay: true, 'aria-label': t.video });
  video.muted = true;
  const live = h('div', { class: 'wc-mirror' }, video, guide());
  const shotImg = h('img', { class: 'wc-shot', alt: t.shot, hidden: true });
  const count = h('span', { class: 'wc-count', 'aria-hidden': 'true', hidden: true });
  const stage = h('div', { class: 'wc-stage' }, live, shotImg, count);
  const status = h('p', { class: 'wc-status text-small', role: 'status', 'aria-live': 'polite' });
  const error = h('p', { class: 'wc-error', role: 'alert', hidden: true });

  const timerBox = h('input', { type: 'checkbox', class: 'wc-check' });
  const timer = h('label', { class: 'wc-timer text-small' }, timerBox, t.timer);
  const take = h('button', { type: 'button', class: 'btn btn-gold' }, t.take);
  const use = h('button', { type: 'button', class: 'btn btn-gold' }, t.use);
  const retake = h('button', { type: 'button', class: 'btn btn-secondary' }, t.retake);
  const retry = h('button', { type: 'button', class: 'btn btn-secondary' }, t.retry);
  const upload = h('button', { type: 'button', class: 'btn btn-gold' }, t.upload);
  const cancel = h('button', { type: 'button', class: 'btn btn-secondary' }, t.cancel);

  const dialog = h(
    'dialog',
    { class: 'wc', 'aria-labelledby': `${id}-title`, 'aria-describedby': `${id}-tip` },
    h(
      'div',
      { class: 'wc-box' },
      h('h2', { class: 'wc-title font-display', id: `${id}-title` }, t.title),
      h('p', { class: 'wc-tip text-small', id: `${id}-tip` }, t.tip),
      stage,
      error,
      status,
      h('div', { class: 'wc-actions' }, timer, take, use, retake, retry, upload, cancel),
      h('p', { class: 'wc-privacy text-small' }, t.privacy),
    ),
  );

  type State = 'loading' | 'live' | 'counting' | 'review' | 'error';
  const show = (state: State, kind?: CameraErrorKind) => {
    stage.hidden = state === 'error';
    live.hidden = state === 'review';
    shotImg.hidden = state !== 'review';
    count.hidden = state !== 'counting';
    timer.hidden = state !== 'live' && state !== 'counting';
    take.hidden = state !== 'live' && state !== 'counting' && state !== 'loading';
    take.disabled = state !== 'live';
    use.hidden = retake.hidden = state !== 'review';
    error.hidden = state !== 'error';
    upload.hidden = state !== 'error';
    retry.hidden = state !== 'error' || kind === 'none' || kind === 'insecure';
    if (state === 'error' && kind) error.textContent = t.errors[kind];
    status.textContent = state === 'loading' ? t.starting : state === 'live' ? t.live : state === 'review' ? t.taken : '';
    const focus = { live: take, counting: cancel, review: use, error: upload } as Partial<Record<State, HTMLElement>>;
    focus[state]?.focus();
  };

  let stream: MediaStream | null = null;
  let shot: File | null = null;
  let shotUrl = '';
  let result: File | null = null;
  const timers: number[] = [];

  const stopStream = () => {
    stream?.getTracks().forEach((track) => track.stop());
    stream = null;
    video.srcObject = null;
  };
  const clearTimers = () => timers.splice(0).forEach((handle) => window.clearTimeout(handle));
  const dropShot = () => {
    if (shotUrl) URL.revokeObjectURL(shotUrl);
    shotUrl = '';
    shot = null;
    shotImg.removeAttribute('src');
  };

  const getStream = async (): Promise<MediaStream> => {
    const media = navigator.mediaDevices;
    try {
      return await media.getUserMedia({ video: { width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
    } catch (caught) {
      if ((caught as { name?: string })?.name === 'OverconstrainedError') return media.getUserMedia({ video: true, audio: false });
      throw caught;
    }
  };

  const start = async () => {
    clearTimers();
    dropShot();
    stopStream();
    show('loading');
    if (!window.isSecureContext || typeof navigator.mediaDevices?.getUserMedia !== 'function') {
      show('error', cameraErrorKind(null, window.isSecureContext));
      return;
    }
    try {
      const got = await getStream();
      if (!dialog.open) {
        got.getTracks().forEach((track) => track.stop());
        return;
      }
      stream = got;
      video.srcObject = got;
      if (video.readyState < 1) await new Promise((done) => video.addEventListener('loadedmetadata', done, { once: true }));
      await video.play().catch(() => undefined);
      if (dialog.open) show('live');
    } catch (caught) {
      stopStream();
      if (dialog.open) show('error', cameraErrorKind(caught, window.isSecureContext));
    }
  };

  const snap = async () => {
    try {
      shot = await frameToFile(video, document.createElement('canvas'));
    } catch {
      show('error', 'failed');
      return;
    }
    shotUrl = URL.createObjectURL(shot);
    shotImg.src = shotUrl;
    video.pause();
    show('review');
  };

  take.addEventListener('click', () => {
    if (!timerBox.checked) {
      void snap();
      return;
    }
    show('counting');
    [3, 2, 1].forEach((n, i) =>
      timers.push(
        window.setTimeout(() => {
          count.textContent = String(n);
          status.textContent = String(n);
        }, i * 1000),
      ),
    );
    timers.push(window.setTimeout(() => void snap(), 3000));
  });
  retake.addEventListener('click', () => {
    dropShot();
    void video.play().catch(() => undefined);
    show('live');
  });
  use.addEventListener('click', () => {
    result = shot;
    dialog.close();
  });
  retry.addEventListener('click', () => void start());
  cancel.addEventListener('click', () => dialog.close());
  upload.addEventListener('click', () => {
    dialog.close();
    options.onUpload?.();
  });

  // Keep Tab inside the dialog (showModal already makes the page behind inert).
  dialog.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const items = [...dialog.querySelectorAll<HTMLElement>('button, input')].filter((node) => !node.closest('[hidden]') && !(node as HTMLButtonElement).disabled);
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  return new Promise((resolve) => {
    const cleanUp = () => {
      clearTimers();
      stopStream();
      if (shotUrl) URL.revokeObjectURL(shotUrl);
    };
    const onPageHide = () => dialog.open && dialog.close();
    dialog.addEventListener('close', () => {
      cleanUp();
      window.removeEventListener('pagehide', onPageHide);
      dialog.remove();
      if (opener?.isConnected) opener.focus();
      resolve(result);
    });
    window.addEventListener('pagehide', onPageHide);
    document.body.append(dialog);
    dialog.showModal();
    void start();
  });
}
