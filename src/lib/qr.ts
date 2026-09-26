import { encode } from 'uqr';

export interface QrMatrix {
  /** Modules per side, including the quiet zone. */
  size: number;
  /** One SVG path covering every dark module (horizontal runs merged). */
  path: string;
}

/**
 * Builds the QR code at build time (DESIGN_SYSTEM.md §7.9): no third-party
 * QR service, a 4-module quiet zone, error correction M. Dark runs on each
 * row are merged into one `h` segment to keep the SVG small.
 */
export function qrMatrix(text: string, quietZone = 4): QrMatrix {
  if (!text) throw new Error('qrMatrix: empty text');
  const { data } = encode(text, { ecc: 'M', border: quietZone });
  const size = data.length;
  const parts: string[] = [];
  data.forEach((row, y) => {
    let x = 0;
    while (x < size) {
      if (!row[x]) {
        x += 1;
        continue;
      }
      const start = x;
      while (x < size && row[x]) x += 1;
      parts.push(`M${start} ${y}h${x - start}v1h-${x - start}z`);
    }
  });
  return { size, path: parts.join('') };
}
