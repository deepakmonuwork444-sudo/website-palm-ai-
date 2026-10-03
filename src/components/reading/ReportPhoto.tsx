/**
 * The report's photo with the traced lines (WEB-DEC-043), like the app's
 * PalmPhotoOverlay: smoothed lines in the app's thin, shiny style (a colour
 * glow, a fine core, a white sheen; dashed when the scanner saw the crease
 * faintly), names at the photo's edges joined by thin leaders (no name covers
 * a line), and chips "All lines" + one per line. Tapping a line, its name or
 * its chip picks it: it glows, the others go quiet. The chips are the keyboard
 * way in (buttons with aria-pressed); the photo taps are a pointer shortcut.
 *
 * Drawn in the photo box's own pixels (re-measured on resize), so the widths
 * are screen pixels at any size. A line the scanner did not trace is never
 * drawn: its chip says "not clearly seen". Line colours: the website's trace
 * colours.
 */

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

import type { Locale } from '../../config/site';
import { COPY } from '../../lib/reading/copy';
import { LABEL_GAP, LABEL_H, LABEL_PAD, labelWidth, toPx } from '../../lib/reading/live-show';
import { smoothPath } from '../../lib/reading/palm/components/deep-report/access';
import { placeSideLabels } from '../../lib/reading/palm/features/lines/side-labels';
import { isFaint, type TracedLine, type TracedLineName } from '../../lib/reading/store';
import { CheckIcon } from './Icons';

const ORDER: TracedLineName[] = ['life', 'head', 'heart', 'fate'];
/** The invisible tap stroke around each thin line (the app: controlCompact / 2). */
const HIT_WIDTH = 20;
const LINE_TYPES = new Set<string>(ORDER);

interface Props {
  src: string;
  width: number;
  height: number;
  lines: TracedLine[];
  locale: Locale;
  alt: string;
}

export default function ReportPhoto({ src, width, height, lines, locale, alt }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const [selected, setSelected] = useState<TracedLineName | null>(null);

  useEffect(() => {
    const el = boxRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w > 0 && h > 0) setBox((b) => (b && b.w === w && b.h === h ? b : { w, h }));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // A tap on a line or its name picks it; a second tap puts all lines back.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return undefined;
    const onTap = (event: Event) => {
      const hit = (event.target as Element | null)?.closest?.('[data-line]');
      const type = hit?.getAttribute('data-line');
      if (type && LINE_TYPES.has(type)) setSelected((now) => (now === type ? null : (type as TracedLineName)));
    };
    svg.addEventListener('click', onTap);
    return () => svg.removeEventListener('click', onTap);
  }, [box]);

  const drawn = useMemo(() => ORDER.flatMap((type) => lines.filter((l) => l.type === type && l.path.length >= 2)), [lines]);
  const found = new Set(drawn.map((l) => l.type));
  const missing = ORDER.filter((type) => !found.has(type));
  const names = (list: TracedLineName[]) => list.map((type) => COPY.lines[type][locale]).join(', ');

  const geo = useMemo(() => {
    if (!box) return null;
    const traces = drawn.map((line) => {
      const points = toPx(line.path, box.w, box.h);
      return { type: line.type, faint: isFaint(line), points, d: smoothPath(points) };
    });
    const labels = placeSideLabels(
      traces.map((t) => ({ key: t.type, points: t.points, w: labelWidth(COPY.linesShort[t.type][locale]), h: LABEL_H })),
      box.w,
      box.h,
      LABEL_PAD,
      LABEL_GAP,
    );
    return { traces, labels };
  }, [box, drawn, locale]);

  // The picked line paints last, above the others where they cross.
  const ordered = geo ? [...geo.traces].sort((a, b) => Number(a.type === selected) - Number(b.type === selected)) : [];

  return (
    <figure className="rd-photo-figure">
      <div
        ref={boxRef}
        className="rd-photo rd-rphoto"
        style={{ aspectRatio: `${width} / ${height}`, ['--rd-aspect' as string]: String(width / height) } as CSSProperties}
      >
        <img src={src} alt={alt} width={width} height={height} />
        {geo && box && drawn.length > 0 && (
          <svg ref={svgRef} className="rd-rphoto-svg" viewBox={`0 0 ${box.w} ${box.h}`} preserveAspectRatio="none" aria-hidden="true">
            {ordered.map((line) => {
              const on = selected === line.type;
              const dash = line.faint ? '4 4' : undefined;
              return (
                <g key={line.type} className={`rd-lc-${line.type} rd-st rd-rl${on ? ' rd-rl-on' : ''}${selected && !on ? ' rd-rl-off' : ''}`}>
                  <path className="rd-l-glow" d={line.d} />
                  <path className="rd-l-core" d={line.d} strokeDasharray={dash} />
                  <path className="rd-l-sheen" d={line.d} strokeDasharray={dash} />
                  <path className="rd-l-hit" d={line.d} strokeWidth={HIT_WIDTH} data-line={line.type} />
                </g>
              );
            })}
            {geo.labels.map((label) => {
              const type = label.key as TracedLineName;
              const on = selected === type;
              return (
                <g key={label.key} className={`rd-lc-${type} rd-rlab${on ? ' rd-rlab-on' : ''}${selected && !on ? ' rd-rlab-off' : ''}`} data-line={type}>
                  <path className="rd-rlab-leader" d={`M${label.from[0]} ${label.from[1]} L${label.anchor[0]} ${label.anchor[1]}`} />
                  <circle className="rd-rlab-dot" cx={label.anchor[0]} cy={label.anchor[1]} r={on ? 3 : 2.25} />
                  <rect className="rd-rlab-box" x={label.x} y={label.y} width={label.w} height={label.h} rx={8} />
                  <text className="rd-rlab-text" x={label.x + label.w / 2} y={label.y + label.h / 2 + 12 * 0.35} textAnchor="middle">
                    {COPY.linesShort[type][locale]}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>
      <figcaption className="rd-rphoto-caption">
        <p className="sr-only">
          {locale === 'hi' ? 'मिली रेखाएं:' : 'Lines found:'} {names(ORDER.filter((t) => found.has(t))) || (locale === 'hi' ? 'कोई नहीं' : 'none')}.
          {missing.length > 0 && ` ${locale === 'hi' ? 'साफ़ नहीं दिखीं:' : 'Not clearly seen:'} ${names(missing)}.`}
        </p>
        <div className="rd-chips" role="group" aria-label={COPY.linesOnPhoto[locale]}>
          {drawn.length > 0 && (
            <button type="button" className="rd-chip rd-chip-btn" aria-pressed={selected === null} onClick={() => setSelected(null)}>
              {selected === null && <CheckIcon />}
              <span>{COPY.allLines[locale]}</span>
            </button>
          )}
          {ORDER.map((type) =>
            found.has(type) ? (
              <button key={type} type="button" className="rd-chip rd-chip-btn" aria-pressed={selected === type} onClick={() => setSelected(type)}>
                <span className={`rd-dot rd-dot-${type}`} />
                <span>{COPY.lines[type][locale]}</span>
              </button>
            ) : (
              <span key={type} className="rd-chip rd-chip-missing" aria-hidden="true">
                <span className={`rd-dot rd-dot-${type}`} />
                <span>{COPY.lines[type][locale]}</span>
                <span className="rd-chip-note">({COPY.notClear[locale]})</span>
              </span>
            ),
          )}
        </div>
        {drawn.length > 0 && <p className="text-small rd-muted">{COPY.photoHint[locale]}</p>}
      </figcaption>
    </figure>
  );
}
