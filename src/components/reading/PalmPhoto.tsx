/**
 * The visitor's own photo with the scanner's real lines drawn on it
 * (DESIGN_SYSTEM.md §7.5). The wrapper takes the photo's aspect ratio; the
 * <img> and the <svg viewBox="0 0 w h"> both fill it, so the lines sit exactly
 * on the photo at any width. Lines draw in the order life, head, heart, fate
 * (stroke-dashoffset, CSS only; reduced motion shows them at once). A line the
 * scan did not return is never drawn: its chip is dashed "not clearly seen".
 */

import { useMemo, type CSSProperties } from 'react';

import type { Locale } from '../../config/site';
import { COPY } from '../../lib/reading/copy';
import type { TracedLine, TracedLineName } from '../../lib/reading/store';

const ORDER: TracedLineName[] = ['life', 'head', 'heart', 'fate'];

interface Props {
  src: string;
  width: number;
  height: number;
  lines: TracedLine[] | null;
  locale: Locale;
  /** The gold beam while the scan runs. */
  scanning?: boolean;
  /** Draw the lines in (true right after the scan; false for a saved reading). */
  animate?: boolean;
  /** Show the line chips under the photo. */
  chips?: boolean;
  alt: string;
}

function pathD(points: [number, number][], width: number, height: number): string {
  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${(x * width).toFixed(1)} ${(y * height).toFixed(1)}`).join(' ');
}

export default function PalmPhoto({ src, width, height, lines, locale, scanning = false, animate = false, chips = false, alt }: Props) {
  const drawn = useMemo(() => ORDER.flatMap((type) => lines?.filter((l) => l.type === type) ?? []), [lines]);
  const found = new Set(drawn.map((l) => l.type));
  const stroke = Math.max(2, Math.round(Math.max(width, height) / 220));
  const names = (list: TracedLineName[]) => list.map((type) => COPY.lines[type][locale]).join(', ');
  const missing = ORDER.filter((type) => !found.has(type));

  return (
    <figure className="rd-photo-figure">
      <div className="rd-photo" style={{ aspectRatio: `${width} / ${height}`, ['--rd-aspect' as string]: String(width / height) } as CSSProperties}>
        <img src={src} alt={alt} width={width} height={height} />
        {drawn.length > 0 && (
          <svg className={animate ? 'rd-lines rd-animate' : 'rd-lines'} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
            {drawn.map((line, index) => (
              <g key={line.type} className={`rd-trace rd-trace-${line.type}`} style={{ animationDelay: `${index * 150}ms` }}>
                <path className="rd-halo" d={pathD(line.path, width, height)} pathLength={1} strokeWidth={stroke * 2.2} />
                <path className="rd-stroke" d={pathD(line.path, width, height)} pathLength={1} strokeWidth={stroke} />
              </g>
            ))}
          </svg>
        )}
        {scanning && (
          <div className="rd-beam-track" aria-hidden="true">
            <div className="rd-beam" />
          </div>
        )}
      </div>
      {chips && lines && (
        <figcaption>
          <p className="sr-only">
            {locale === 'hi' ? 'मिली रेखाएं:' : 'Lines found:'} {names(ORDER.filter((t) => found.has(t))) || '—'}.
            {missing.length > 0 && ` ${locale === 'hi' ? 'साफ़ नहीं दिखीं:' : 'Not clearly seen:'} ${names(missing)}.`}
          </p>
          <ul className="rd-chips" aria-hidden="true">
            {ORDER.map((type) => (
              <li key={type} className={found.has(type) ? 'rd-chip' : 'rd-chip rd-chip-missing'}>
                <span className={`rd-dot rd-dot-${type}`} />
                <span>{COPY.lines[type][locale]}</span>
                {!found.has(type) && <span className="rd-chip-note">— {COPY.notClear[locale]}</span>}
              </li>
            ))}
          </ul>
        </figcaption>
      )}
    </figure>
  );
}
