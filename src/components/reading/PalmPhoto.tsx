/**
 * The visitor's photo on the review and "not a palm" screens (DESIGN_SYSTEM.md
 * §7.5): the wrapper takes the photo's aspect ratio and the <img> fills it.
 * The lines are drawn elsewhere: LiveScan.tsx while the reading is made,
 * ReportPhoto.tsx on the report (WEB-DEC-043).
 */

import type { CSSProperties } from 'react';

interface Props {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export default function PalmPhoto({ src, width, height, alt }: Props) {
  return (
    <figure className="rd-photo-figure">
      <div className="rd-photo" style={{ aspectRatio: `${width} / ${height}`, ['--rd-aspect' as string]: String(width / height) } as CSSProperties}>
        <img src={src} alt={alt} width={width} height={height} />
      </div>
    </figure>
  );
}
