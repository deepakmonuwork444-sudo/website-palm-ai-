import type { RgbaImage } from '../../src/lib/tools/photo-check';

/**
 * Synthetic palm-like images for the photo-check tests, ported from the app's
 * `src/features/quality/synthetic.ts`. They prove the metrics and verdict
 * logic; threshold calibration still needs real, labelled photos.
 */

type Rgb = [number, number, number];
const BACKGROUND: Rgb = [150, 145, 138];
export const SKIN_LIGHT: Rgb = [196, 146, 118];
export const SKIN_DARK: Rgb = [92, 62, 48];

export function paintPalm(width: number, height: number, skin: Rgb, scale = 1): RgbaImage {
  const data = new Uint8Array(width * height * 4);
  const crease: Rgb = [skin[0] * 0.55, skin[1] * 0.55, skin[2] * 0.55];
  const cx = width / 2;
  const cy = height / 2;
  const rx = width * 0.36 * scale;
  const ry = height * 0.42 * scale;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const o = (y * width + x) * 4;
      const inside = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
      let colour: Rgb = inside ? skin : BACKGROUND;
      if (inside) {
        const u = (x - cx) / rx;
        const v = (y - cy) / ry;
        const onCrease =
          Math.abs(v - 0.15 * Math.sin(u * 3) + 0.1) < 0.025 || Math.abs(v + 0.35 - 0.2 * u) < 0.02 || Math.abs(u + 0.3 + 0.4 * v) < 0.02;
        if (onCrease) colour = crease;
      }
      data[o] = colour[0];
      data[o + 1] = colour[1];
      data[o + 2] = colour[2];
      data[o + 3] = 255;
    }
  }
  return { data, width, height };
}

export function scaleBrightness(image: RgbaImage, factor: number): RgbaImage {
  const data = new Uint8Array(image.data.length);
  for (let i = 0; i < image.data.length; i += 4) {
    data[i] = Math.min(255, Math.round((image.data[i] ?? 0) * factor));
    data[i + 1] = Math.min(255, Math.round((image.data[i + 1] ?? 0) * factor));
    data[i + 2] = Math.min(255, Math.round((image.data[i + 2] ?? 0) * factor));
    data[i + 3] = 255;
  }
  return { data, width: image.width, height: image.height };
}

export function boxBlur(image: RgbaImage, passes: number): RgbaImage {
  const { width, height } = image;
  const radius = Math.max(1, Math.round(width / 32));
  const src = new Uint8Array(image.data);
  const tmp = new Uint8Array(src.length);
  const pass = (from: Uint8Array, to: Uint8Array, horizontal: boolean) => {
    const outer = horizontal ? height : width;
    const inner = horizontal ? width : height;
    for (let o = 0; o < outer; o += 1) {
      for (let i = 0; i < inner; i += 1) {
        let r = 0;
        let g = 0;
        let b = 0;
        let n = 0;
        for (let d = -radius; d <= radius; d += 1) {
          const j = i + d;
          if (j < 0 || j >= inner) continue;
          const idx = (horizontal ? o * width + j : j * width + o) * 4;
          r += from[idx] ?? 0;
          g += from[idx + 1] ?? 0;
          b += from[idx + 2] ?? 0;
          n += 1;
        }
        const idx = (horizontal ? o * width + i : i * width + o) * 4;
        to[idx] = Math.round(r / n);
        to[idx + 1] = Math.round(g / n);
        to[idx + 2] = Math.round(b / n);
        to[idx + 3] = 255;
      }
    }
  };
  for (let p = 0; p < passes; p += 1) {
    pass(src, tmp, true);
    pass(tmp, src, false);
  }
  return { data: src, width, height };
}

export function paintFlat(width: number, height: number, colour: Rgb): RgbaImage {
  const data = new Uint8Array(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = colour[0];
    data[i + 1] = colour[1];
    data[i + 2] = colour[2];
    data[i + 3] = 255;
  }
  return { data, width, height };
}
