/**
 * The live scan on the working screen (WEB-DEC-043): the web twin of the
 * app's src/components/palm/LiveScan.tsx, with SVG, CSS transforms and the
 * Web Animations API (transforms and opacity only; no library). Driven only
 * by what the reading really has:
 *   A. no scan answer yet (at least 3 s): the photo slowly pushes in (Ken
 *      Burns, then a drift), a gold edge glow pulses, the beam sweeps, short
 *      words say what the scanner looks for;
 *   B. the scanner found the hand: the camera eases onto the palm, the 21 real
 *      landmarks pop in one by one, then the photo outside the hand dims;
 *   C. each line the scanner traced draws itself on in its colour, with a pen
 *      tip, a brief glow and its name popping in at the photo's edge;
 *   D. the finished palm settles for a moment, then the report opens. Only
 *      while the reading is still being written, a slow tour frames each
 *      traced line (a light runs along it), then the whole palm, and the
 *      report opens at the next stop once it is ready. "Skip" ends the show.
 *
 * PACE (owner 2026-09-27, live-show.ts): a long gliding push-in onto the
 * palm, soft dots, each line drawn over 1.6 s with an eased pen and a pause,
 * its name fading in; about 8–12 s from the hand to the report. Presentation
 * only: the reading itself never waits for the show.
 *
 * ALIGNMENT: the photo and every mark on it sit in ONE camera view moved by
 * one transform, drawn in the photo box's own pixels (measured once), so no
 * zoom can move a mark off its place. The beam, the edge glow, the hand tag
 * and the words stay outside it. Names are counter-scaled about the end of
 * their leader, so they keep their size on screen.
 *
 * A line the scanner did not trace is never drawn. No confidence or accuracy
 * numbers. Reduce motion: no camera, beam, glow or tour; one 720 ms fade.
 * Line colours are the website's classic trace colours, not the app's.
 */

import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties } from 'react';

import type { Locale } from '../../config/site';
import { COPY } from '../../lib/reading/copy';
import {
  BEAM_MS,
  BONES_DIM,
  BONES_DIM_MS,
  DOT_COUNT,
  EASE,
  FADE_MS,
  FEATHER,
  FOCUS_DIM,
  GLOW_MS,
  HOLD_MS,
  MIN_SCAN_MS,
  PACE,
  RUN_DELAY_MS,
  RUN_MS,
  WORD_MS,
  alongPolyline,
  camTransform,
  inLiveOrder,
  labelTexts,
  lineTracedWords,
  liveLabels,
  stopMs,
  tourCameras,
  tourWords,
  webRevealTimeline,
  type LiveLabel,
} from '../../lib/reading/live-show';
import { smoothPath } from '../../lib/reading/palm/components/deep-report/access';
import {
  DRIFT_MS,
  HAND_CONNECTIONS,
  KEN_BURNS_MS,
  convexHull,
  expandHull,
  handSilhouette,
  idleCameras,
  palmCamera,
  tourStops,
  type Camera,
  type Pt,
  type TourStop,
} from '../../lib/reading/palm/features/lines/live-scan';
import type { HandSide } from '../../lib/reading/palm/features/observation/taxonomy';
import { isFaint, type StoredHand, type TracedLine, type TracedLineName } from '../../lib/reading/store';

interface Props {
  /** The photo the lines belong to, and its size (only its aspect is used). */
  src: string;
  width: number;
  height: number;
  /** Preview mode's sample palm (not the visitor's photo). */
  sample: boolean;
  /** The scanner's accepted lines; null while the scan is still running. */
  lines: TracedLine[] | null;
  hand: StoredHand | null;
  side: HandSide | null;
  /** The reading is saved: the report may open once the show ends. */
  ready: boolean;
  /** "Skip to my reading" was tapped: no more motion, everything shown at once. */
  skipped: boolean;
  locale: Locale;
  /** The show is over (and the reading is ready). */
  onEnd: () => void;
}

type Phase = 'wait' | 'reveal' | 'tour' | 'hold';

interface LineGeo {
  type: TracedLineName;
  faint: boolean;
  points: Pt[];
  d: string;
  along: { offset: number; point: Pt }[];
}

const CAN_ANIMATE = typeof Element !== 'undefined' && typeof Element.prototype.animate === 'function';
/** Grown and faint first, then exact: a soft edge around the hand instead of a cut-out. */
const RINGS = [
  { grow: FEATHER, alpha: 0.35 },
  { grow: FEATHER / 2, alpha: 0.65 },
  { grow: 0, alpha: 1 },
] as const;
/** A dot fades in and swells softly 0.4 → 1.08 → 1 (the web's calmer pace). */
const POP: Keyframe[] = [
  { opacity: 0, transform: 'scale(0.4)' },
  { opacity: 1, transform: 'scale(1.08)', offset: 0.65 },
  { opacity: 1, transform: 'scale(1)' },
];
/** A line drawing itself on (pathLength 1, dasharray "1 1"); hidden until it starts. */
const DRAW: Keyframe[] = [
  { strokeDashoffset: 1, opacity: 0 },
  { strokeDashoffset: 0.99, opacity: 1, offset: 0.01 },
  { strokeDashoffset: 0, opacity: 1 },
];
/** A line's name fades in and settles (0.9 → 1), from 45 % of its line: calm, no bounce. */
const NAME_IN: Keyframe[] = [
  { opacity: 0, transform: 'scale(0.9)' },
  { opacity: 1, transform: 'scale(1)' },
];
/** The pen tip / runner is on for the whole run, fading at both ends. */
const TIP_ON: Keyframe[] = [{ opacity: 0 }, { opacity: 1, offset: 0.02 }, { opacity: 1, offset: 0.97 }, { opacity: 0 }];

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    if (typeof matchMedia !== 'function') return undefined;
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

/** Keeps each running animation's current value, then stops it (a new move starts from where the view is). */
function settle(list: { current: Animation[] }): void {
  for (const animation of list.current) {
    try {
      animation.commitStyles();
    } catch {
      // Not rendered any more: nothing to keep.
    }
    animation.cancel();
  }
  list.current = [];
}

/** Moves the camera view (and counter-scales the names inside it) to `to`, from wherever it is now. */
function moveCamera(
  cam: HTMLElement,
  counters: HTMLElement[],
  list: { current: Animation[] },
  to: Camera,
  width: number,
  height: number,
  duration: number,
  easing: string,
): Animation {
  settle(list);
  const timing: KeyframeAnimationOptions = { duration, easing, fill: 'forwards' };
  const move = cam.animate([{ transform: camTransform(to, width, height) }], timing);
  list.current = [move, ...counters.map((el) => el.animate([{ transform: `scale(${1 / to.scale})` }], timing))];
  return move;
}

const polygonPath = (points: readonly Pt[]) =>
  points.length < 3 ? '' : `${points.map((p, i) => `${i === 0 ? 'M' : 'L'}${Math.round(p[0])} ${Math.round(p[1])}`).join(' ')} Z`;

/** The hand's shape in the focus mask (black = not dimmed), grown by `grow` px at `alpha` (the app's HandMaskShape). */
function HandShape({ grow, alpha, outline, palm, palmPad, fingerWidth, bones }: { grow: number; alpha: number; outline: Pt[] | null; palm: Pt[]; palmPad: number; fingerWidth: number; bones: [Pt, Pt][] }) {
  if (outline) {
    return grow > 0 ? (
      <path d={polygonPath(outline)} fill="none" stroke="black" strokeOpacity={alpha} strokeWidth={grow * 2} strokeLinejoin="round" />
    ) : (
      <path d={polygonPath(outline)} fill="black" strokeLinejoin="round" />
    );
  }
  return (
    <g opacity={alpha}>
      <path d={polygonPath(palm)} fill="black" stroke="black" strokeWidth={palmPad + grow * 2} strokeLinejoin="round" />
      {bones.map(([a, b], i) => (
        <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="black" strokeWidth={fingerWidth + grow * 2} strokeLinecap="round" />
      ))}
    </g>
  );
}

/** After the reveal: thin and shiny (colour glow, fine core, white sheen); dashed when faint; the tour lights one up. */
function StaticTrace({ line, state }: { line: LineGeo; state: 'normal' | 'on' | 'off' }) {
  const dash = line.faint ? '4 4' : undefined;
  return (
    <g className={`rd-lc-${line.type} rd-st rd-st-${state}`}>
      {state === 'on' && <path className="rd-l-halo" d={line.d} />}
      <path className="rd-l-glow" d={line.d} />
      <path className="rd-l-core" d={line.d} strokeDasharray={dash} />
      <path className="rd-l-sheen" d={line.d} strokeDasharray={dash} />
    </g>
  );
}

function Words({ words }: { words: readonly string[] }) {
  const [tick, setTick] = useState(0);
  const rotating = words.length > 1;
  useEffect(() => {
    if (!rotating) return undefined;
    const id = window.setInterval(() => setTick((t) => t + 1), WORD_MS);
    return () => window.clearInterval(id);
  }, [rotating]);
  const text = words[tick % Math.max(1, words.length)] ?? '';
  return (
    <div className="rd-live-word" aria-hidden="true">
      <span key={text}>{text}</span>
    </div>
  );
}

export default function LiveScan({ src, width, height, sample, lines, hand, side, ready, skipped, locale, onEnd }: Props) {
  const reduced = useReducedMotion();
  const still = reduced || skipped || !CAN_ANIMATE;
  const maskId = `rdfocus${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  const boxRef = useRef<HTMLDivElement>(null);
  const camRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const runnerRef = useRef<SVGGElement>(null);
  const runnerMoveRef = useRef<SVGGElement>(null);
  /** Every animated mark by name ("mask", "dot:3", "heart:core"…), set by callback refs. */
  const els = useRef(new Map<string, Element | null>());
  const anims = useRef<Animation[]>([]);
  const camAnims = useRef<Animation[]>([]);
  const timers = useRef<number[]>([]);
  const startedAt = useRef(0);
  const holdAt = useRef(0);
  const revealed = useRef(false);
  const ended = useRef(false);
  const readyRef = useRef(ready);
  const onEndRef = useRef(onEnd);

  /** The photo box, measured once: the drawing's own pixels (a later resize only scales it). */
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [phase, setPhase] = useState<Phase>('wait');
  const [handShown, setHandShown] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [drawing, setDrawing] = useState(-1);
  const [linesStatic, setLinesStatic] = useState(false);
  const [tourIdx, setTourIdx] = useState(-1);

  const register = useCallback((key: string) => (node: Element | null) => {
    els.current.set(key, node);
  }, []);
  const finish = useCallback(() => {
    if (ended.current) return;
    ended.current = true;
    onEndRef.current();
  }, []);

  useEffect(() => {
    readyRef.current = ready;
    onEndRef.current = onEnd;
  });

  useEffect(() => {
    startedAt.current = performance.now();
    const all = anims;
    const cams = camAnims;
    const pending = timers;
    return () => {
      for (const a of [...all.current, ...cams.current]) a.cancel();
      pending.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  useEffect(() => {
    const box = boxRef.current;
    if (!box || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() => {
      if (box.clientWidth > 0 && box.clientHeight > 0) {
        setSize((s) => s ?? { w: box.clientWidth, h: box.clientHeight });
        observer.disconnect();
      }
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const traced = useMemo(() => (lines ? inLiveOrder(lines) : []), [lines]);
  const stops = useMemo(() => tourStops(traced.map((l) => l.type)), [traced]);

  const geo = useMemo(() => {
    if (!size) return null;
    const { w, h } = size;
    const px = (p: readonly [number, number]): Pt => [p[0] * w, p[1] * h];
    const handPts = hand ? hand.landmarks.map(px) : null;
    const shape = hand ? (hand.outline ?? expandHull(convexHull(hand.landmarks), 1.18)) : null;
    const palm = hand && shape && !still ? palmCamera(hand.landmarks, shape, w, h) : null;
    const lineGeo: LineGeo[] = traced.map((line) => {
      const points = line.path.map(px);
      return { type: line.type, faint: isFaint(line), points, d: smoothPath(points), along: alongPolyline(points) };
    });
    const labels = liveLabels(lineGeo, labelTexts(lineGeo.map((l) => l.type), locale, w), w, h, palm);
    return {
      w,
      h,
      handPts,
      palm,
      lineGeo,
      labels,
      tour: tourCameras(lineGeo, labels, w, h),
      silhouette: handPts ? handSilhouette(handPts) : null,
      outline: hand?.outline ? hand.outline.map(px) : null,
    };
  }, [size, hand, traced, still, locale]);

  const labelCounters = useCallback(
    () => (geo?.labels ?? []).map((l) => els.current.get(`${l.type}:at`)).filter((el): el is HTMLElement => el instanceof HTMLElement),
    [geo],
  );

  // The beam sweeps the whole time, softer once the hand shows.
  useEffect(() => {
    const beam = beamRef.current;
    if (!size || reduced || !beam || !CAN_ANIMATE) return undefined;
    const sweep = beam.animate([{ transform: 'translateY(0%)' }, { transform: 'translateY(100%)' }], {
      duration: BEAM_MS,
      easing: EASE.quad,
      iterations: Infinity,
      direction: 'alternate',
    });
    return () => sweep.cancel();
  }, [size, reduced]);

  // A. The gold edge glow pulses until the hand is found.
  useEffect(() => {
    const glow = glowRef.current;
    if (!size || still || handShown || !glow) return undefined;
    const pulse = glow.animate([{ opacity: 0.3 }, { opacity: 1 }], { duration: GLOW_MS, easing: EASE.sine, iterations: Infinity, direction: 'alternate' });
    return () => pulse.cancel();
  }, [size, still, handShown]);

  // A. Ken Burns (1 → 1.15 over 6 s), then a slow drift, until the hand is found.
  useEffect(() => {
    const cam = camRef.current;
    if (!size || still || handShown || !cam) return undefined;
    const { w, h } = size;
    const [kb, d1, d2] = idleCameras(w, h) as [Camera, Camera, Camera];
    let live = true;
    const first = moveCamera(cam, [], camAnims, kb, w, h, KEN_BURNS_MS, EASE.sine);
    first.finished.then(
      () => {
        if (!live || camAnims.current[0] !== first) return;
        settle(camAnims);
        const frames = [kb, d1, d2, kb].map((c) => ({ transform: camTransform(c, w, h), easing: EASE.sine }));
        camAnims.current = [cam.animate(frames, { duration: DRIFT_MS * 3, iterations: Infinity })];
      },
      () => undefined,
    );
    return () => {
      live = false;
    };
  }, [size, still, handShown]);

  // The scan answered: after at least 3 s of scanning, the hand (if the scanner found one).
  useEffect(() => {
    if (phase !== 'wait' || lines === null) return undefined;
    const wait = still ? 0 : Math.max(0, MIN_SCAN_MS - (performance.now() - startedAt.current));
    const timer = window.setTimeout(() => {
      if (hand) {
        setHandShown(true);
        if (still) setFadeIn(true);
      }
      if (hand && !still) {
        setPhase('reveal');
      } else {
        holdAt.current = performance.now();
        setPhase('hold');
      }
    }, wait);
    return () => window.clearTimeout(timer);
  }, [phase, lines, hand, still]);

  // Reduce motion (or a skip before the hand showed): the hand and lines fade in once.
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!fadeIn || !overlay || !CAN_ANIMATE) return;
    overlay.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE_MS, easing: EASE.standard, fill: 'backwards' });
  }, [fadeIn]);

  // B + C. Palm framing, dots, focus, then each traced line, once.
  useEffect(() => {
    const cam = camRef.current;
    if (phase !== 'reveal' || !geo || !cam || revealed.current) return;
    revealed.current = true;
    const n = geo.lineGeo.length;
    const t = webRevealTimeline(DOT_COUNT, n);
    const L = PACE.lineDrawMs;
    const get = (key: string) => els.current.get(key) ?? null;
    const play = (key: string, frames: Keyframe[], timing: KeyframeAnimationOptions) => {
      const el = get(key);
      if (el) anims.current.push(el.animate(frames, { fill: 'both', ...timing }));
    };
    const later = (ms: number, run: () => void) => timers.current.push(window.setTimeout(run, ms));

    // B. A long, soft glide onto the palm; the dots fade in one by one while it moves.
    if (geo.palm) moveCamera(cam, labelCounters(), camAnims, geo.palm, geo.w, geo.h, PACE.palmMoveMs, EASE.glide);
    for (let i = 0; i < DOT_COUNT; i++) play(`dot:${i}`, POP, { delay: t.dotsStart + i * PACE.dotStaggerMs, duration: PACE.dotPopMs, easing: 'ease-out' });
    play('bones', [{ opacity: 0 }, { opacity: 1 }], { delay: t.dotsStart, duration: t.dotsMs * 0.7, easing: EASE.standard });
    if (n > 0) play('bones', [{ opacity: 1 }, { opacity: BONES_DIM }], { delay: t.linesStart, duration: BONES_DIM_MS * 1.5, easing: EASE.standard, fill: 'forwards' });
    play('mask', [{ opacity: 0 }, { opacity: 1 }], { delay: t.focusStart, duration: PACE.focusFadeMs, easing: EASE.standard });
    play('tag', [{ opacity: 0 }, { opacity: 1 }], { delay: t.focusStart, duration: PACE.focusFadeMs, easing: EASE.standard });
    // C. One line at a time: an eased pen (the tip rides the same curve), then its name fades in.
    geo.lineGeo.forEach((line, i) => {
      const start = t.lineStarts[i] ?? 0;
      for (const part of ['flashpath', 'glow', 'core']) play(`${line.type}:${part}`, DRAW, { delay: start, duration: L, easing: EASE.draw });
      // A soft glow as the line completes, fading out over the pause.
      play(`${line.type}:flash`, [{ opacity: 0 }, { opacity: 0.8, offset: 0.45 }, { opacity: 0 }], { delay: start + 0.55 * L, duration: L, easing: EASE.standard });
      play(`${line.type}:tip`, TIP_ON, { delay: start, duration: L, easing: 'linear' });
      if (line.along.length >= 2) {
        const frames = line.along.map(({ offset, point }) => ({ offset, transform: `translate(${point[0]}px, ${point[1]}px)` }));
        play(`${line.type}:tipmove`, frames, { delay: start, duration: L, easing: EASE.draw });
      }
      play(`${line.type}:leader`, [{ opacity: 0 }, { opacity: 1 }], { delay: start + 0.35 * L, duration: PACE.nameInMs, easing: EASE.standard });
      play(`${line.type}:pop`, NAME_IN, { delay: start + 0.45 * L, duration: PACE.nameInMs, easing: EASE.glide });
      later(start, () => setDrawing(i));
    });
    const doneAt = n > 0 ? t.linesEnd + 250 : t.focusStart + PACE.focusFadeMs;
    later(doneAt, () => {
      // Everything now sits at its final look (the marks' own styles); only the camera keeps its framing.
      for (const a of anims.current) a.cancel();
      anims.current = [];
      setLinesStatic(true);
      setDrawing(-1);
      if (n > 0 && !readyRef.current) {
        // The reading is still being written: a slow tour while it is (never to pad a ready one).
        setTourIdx(0);
        setPhase('tour');
      } else {
        holdAt.current = performance.now();
        setPhase('hold');
      }
    });
  }, [phase, geo, labelCounters]);

  // D. Only while the reading is being written: each traced line, then the whole palm; the report opens at the next stop once ready.
  useEffect(() => {
    const cam = camRef.current;
    if (phase !== 'tour' || still || tourIdx < 0 || !geo || !cam || stops.length === 0) return undefined;
    if (tourIdx > 0 && readyRef.current) {
      finish();
      return undefined;
    }
    const stop = stops[tourIdx % stops.length] as TourStop;
    const to = stop === 'palm' ? geo.palm : geo.tour.get(stop);
    if (to) moveCamera(cam, labelCounters(), camAnims, to, geo.w, geo.h, PACE.tourMoveMs, EASE.glide);
    const run: Animation[] = [];
    const line = stop === 'palm' ? null : geo.lineGeo.find((l) => l.type === stop);
    if (line && line.along.length >= 2 && runnerRef.current && runnerMoveRef.current) {
      const timing: KeyframeAnimationOptions = { delay: RUN_DELAY_MS, duration: RUN_MS, easing: EASE.quad, fill: 'both' };
      run.push(runnerRef.current.animate(TIP_ON, timing));
      run.push(runnerMoveRef.current.animate(line.along.map(({ offset, point }) => ({ offset, transform: `translate(${point[0]}px, ${point[1]}px)` })), timing));
    }
    const next = window.setTimeout(() => setTourIdx((i) => i + 1), stopMs(stop));
    return () => {
      window.clearTimeout(next);
      run.forEach((a) => a.cancel());
    };
  }, [phase, still, tourIdx, geo, stops, labelCounters, finish]);

  // "Skip" or reduce motion switched on mid-show: stop every move, show the final picture at rest.
  useEffect(() => {
    if (!still) return;
    for (const a of anims.current) a.cancel();
    anims.current = [];
    for (const a of camAnims.current) a.cancel();
    camAnims.current = [];
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    camRef.current?.style.removeProperty('transform');
    for (const el of els.current.values()) if (el instanceof HTMLElement && el.classList.contains('rd-live-lab-at')) el.style.removeProperty('transform');
  }, [still]);

  // Nothing more to show: the report opens (the page waits for the reading if it is not saved yet).
  const shownPhase: Phase = still && (phase === 'reveal' || phase === 'tour') ? 'hold' : phase;
  useEffect(() => {
    if (shownPhase !== 'hold' || !ready) return undefined;
    const min = skipped ? 0 : reduced ? FADE_MS : HOLD_MS;
    const timer = window.setTimeout(finish, Math.max(0, min - (performance.now() - holdAt.current)));
    return () => window.clearTimeout(timer);
  }, [shownPhase, ready, skipped, reduced, finish]);

  const showStatic = linesStatic || still;
  const stop = shownPhase === 'tour' && tourIdx >= 0 && stops.length > 0 ? stops[tourIdx % stops.length]! : null;
  const highlighted = stop && stop !== 'palm' ? stop : null;
  const drawingLine = shownPhase === 'reveal' && drawing >= 0 ? (traced[drawing] ?? null) : null;

  let words: string[];
  if (ready && (shownPhase === 'hold' || skipped)) words = [COPY.opening[locale]];
  else if (stop) words = [tourWords(stop, locale)];
  else if (drawingLine) words = [lineTracedWords(drawingLine.type, isFaint(drawingLine), locale)];
  else if (shownPhase === 'reveal') words = [COPY.handFound[side ?? 'right'][locale]];
  else if (shownPhase === 'hold' || (lines !== null && !hand)) words = COPY.readWords.map((w) => w[locale]);
  else words = COPY.scanWords.map((w) => w[locale]);

  const dim = (type: TracedLineName) => Boolean(highlighted && highlighted !== type);
  const labelStyle = (label: LiveLabel): CSSProperties =>
    geo
      ? {
          left: `${(label.box.x / geo.w) * 100}%`,
          top: `${(label.box.y / geo.h) * 100}%`,
          width: `${label.box.w}px`,
          height: `${label.box.h}px`,
          transformOrigin: `${label.box.from[0] - label.box.x}px ${label.box.from[1] - label.box.y}px`,
        }
      : {};
  const runner = highlighted && geo ? geo.lineGeo.find((l) => l.type === highlighted) : null;

  return (
    <div
      ref={boxRef}
      className="rd-photo rd-live"
      style={{ aspectRatio: `${width} / ${height}`, ['--rd-aspect' as string]: String(width / height) } as CSSProperties}
      role="img"
      aria-label={sample ? COPY.samplePhotoLabel[locale] : COPY.scanPhotoLabel[locale]}
    >
      {/* THE CAMERA: the photo and every mark on it, moved as one. */}
      <div ref={camRef} className="rd-live-cam">
        <img src={src} alt="" width={width} height={height} />
        {geo && handShown && hand && geo.handPts && (
          <div ref={overlayRef} className="rd-live-overlay">
            {/* The focus mask on its own layer: painted once, never again while the lines animate. */}
            {geo.silhouette && (
              <svg ref={register('mask')} className="rd-live-svg rd-live-mask" viewBox={`0 0 ${geo.w} ${geo.h}`} preserveAspectRatio="none" aria-hidden="true">
                  <defs>
                    <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={geo.w} height={geo.h}>
                      <rect x="0" y="0" width={geo.w} height={geo.h} fill="white" />
                      {RINGS.map(({ grow, alpha }) => (
                        <HandShape
                          key={grow}
                          grow={grow}
                          alpha={alpha}
                          outline={geo.outline}
                          palm={geo.silhouette!.palm}
                          palmPad={geo.silhouette!.palmPad}
                          fingerWidth={geo.silhouette!.fingerWidth}
                          bones={HAND_CONNECTIONS.map(([a, b]) => [geo.handPts![a]!, geo.handPts![b]!] as [Pt, Pt])}
                        />
                      ))}
                    </mask>
                  </defs>
                  <rect x="0" y="0" width={geo.w} height={geo.h} className="rd-live-dim" fillOpacity={FOCUS_DIM} mask={`url(#${maskId})`} />
                  {geo.outline && (
                    <>
                      <path d={polygonPath(geo.outline)} className="rd-live-outline-glow" />
                      <path d={polygonPath(geo.outline)} className="rd-live-outline" />
                    </>
                  )}
              </svg>
            )}
            <svg className="rd-live-svg rd-live-marks" viewBox={`0 0 ${geo.w} ${geo.h}`} preserveAspectRatio="none" aria-hidden="true">
              <g ref={register('bones')} className={traced.length > 0 ? 'rd-live-bones rd-live-bones-dim' : 'rd-live-bones'}>
                {HAND_CONNECTIONS.map(([a, b]) => {
                  const pa = geo.handPts![a]!;
                  const pb = geo.handPts![b]!;
                  return <line key={`${a}-${b}`} x1={pa[0]} y1={pa[1]} x2={pb[0]} y2={pb[1]} />;
                })}
              </g>

              <g className="rd-live-dots">
                {geo.handPts.map((p, i) => (
                  <circle key={i} ref={register(`dot:${i}`)} className="rd-live-dot" cx={p[0]} cy={p[1]} r={i === 0 ? 4.5 : 3} />
                ))}
              </g>

              {geo.lineGeo.map((line) =>
                showStatic ? (
                  <StaticTrace key={line.type} line={line} state={highlighted === null ? 'normal' : highlighted === line.type ? 'on' : 'off'} />
                ) : (
                  <g key={line.type} className={`rd-lc-${line.type}`}>
                    <g ref={register(`${line.type}:flash`)} className="rd-live-flash">
                      <path ref={register(`${line.type}:flashpath`)} className="rd-live-draw rd-l-flash" d={line.d} pathLength={1} />
                    </g>
                    <path ref={register(`${line.type}:glow`)} className="rd-live-draw rd-l-glow" d={line.d} pathLength={1} />
                    <path ref={register(`${line.type}:core`)} className={line.faint ? 'rd-live-draw rd-l-core rd-l-core-faint' : 'rd-live-draw rd-l-core'} d={line.d} pathLength={1} />
                    <g ref={register(`${line.type}:tip`)} className="rd-live-tip">
                      <g ref={register(`${line.type}:tipmove`)}>
                        <circle r={4} className="rd-tip-halo" />
                        <circle r={1.8} className="rd-tip-dot" />
                      </g>
                    </g>
                  </g>
                ),
              )}

              {runner && (
                <g key={`run-${tourIdx}`} ref={runnerRef} className={`rd-live-tip rd-lc-${runner.type}`}>
                  <g ref={runnerMoveRef}>
                    <circle r={5} className="rd-run-halo" />
                    <circle r={2} className="rd-tip-dot" />
                  </g>
                </g>
              )}

              {geo.labels.map((label) => (
                <g key={label.type} ref={register(`${label.type}:leader`)} className={`rd-lc-${label.type} rd-live-leader${dim(label.type) ? ' rd-dim' : ''}`}>
                  <line x1={label.box.from[0]} y1={label.box.from[1]} x2={label.box.anchor[0]} y2={label.box.anchor[1]} />
                  <circle cx={label.box.anchor[0]} cy={label.box.anchor[1]} r={2.5} />
                </g>
              ))}
            </svg>

            {geo.labels.map((label) => (
              <div key={label.type} ref={register(`${label.type}:at`)} className="rd-live-lab-at" style={labelStyle(label)} aria-hidden="true">
                <div ref={register(`${label.type}:pop`)} className={`rd-live-lab rd-lc-${label.type}${dim(label.type) ? ' rd-dim' : ''}`}>
                  {label.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Screen furniture, outside the camera. */}
      {!still && !handShown && <div ref={glowRef} className="rd-live-glow" aria-hidden="true" />}
      {!reduced && (
        <div className={handShown ? 'rd-live-beam-track rd-live-soft' : 'rd-live-beam-track'} aria-hidden="true">
          <div ref={beamRef} className="rd-live-beam">
            <span className="rd-live-beam-glow" />
            <span className="rd-live-beam-line" />
          </div>
        </div>
      )}
      {handShown && side && (
        <div ref={register('tag')} className="rd-live-tag" aria-hidden="true">
          {side === 'left' ? COPY.leftHand[locale] : COPY.rightHand[locale]}
        </div>
      )}
      {size && <Words key={words.join('|')} words={words} />}
    </div>
  );
}
