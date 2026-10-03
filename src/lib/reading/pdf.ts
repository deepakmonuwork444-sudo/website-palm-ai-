/**
 * "Download PDF" (owner request 2026-09-27): a real A4 PDF made in the browser.
 *
 * Each page is drawn on a canvas by the browser's own text engine, so Hindi
 * (Devanagari conjuncts and matras) shapes exactly as on screen — a PDF font
 * writer without complex-script shaping would break it. The site's own fonts
 * (Mukta, Cormorant Garamond, Tiro Devanagari Hindi) are already on the page.
 * The pages go into the PDF as images with jsPDF, which is loaded with
 * import() only when the button is tapped (never part of the page's JS).
 *
 * What goes in: the name/details typed on this device, the reading's photo
 * with its traced lines, the at-a-glance, the OPEN parts in full, and the
 * locked parts' title + first sentence only (the rest was dropped before the
 * reading was stored, so it cannot leak), the date, the PalmSays mark and a
 * clickable https://palmsays.com. Everything happens on this device.
 */

import type { Locale } from '../../config/site';
import { site } from '../../config/site';
import { COPY } from './copy';
import { LABEL_GAP, LABEL_H, LABEL_PAD, labelWidth, toPx } from './live-show';
import { smoothPath } from './palm/components/deep-report/access';
import { placeSideLabels } from './palm/features/lines/side-labels';
import { addressName, birthText, isoDay, writesWithText, type PersonalDetails } from './personal';
import type { ReportView } from './report';
import { isFaint, type SavedReading, type TracedLineName } from './store';

/* ── pure helpers (unit-tested) ───────────────────────────────────────── */

/** Words → lines no wider than `max` (a word longer than a line is cut by characters). */
export function wrapWords(text: string, max: number, measure: (s: string) => number): string[] {
  const words = text.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (measure(next) <= max) {
      line = next;
      continue;
    }
    if (line) lines.push(line);
    if (measure(word) <= max) {
      line = word;
      continue;
    }
    // One very long word: cut it by characters.
    let part = '';
    for (const ch of Array.from(word)) {
      if (part && measure(part + ch) > max) {
        lines.push(part);
        part = ch;
      } else part += ch;
    }
    line = part;
  }
  if (line) lines.push(line);
  return lines;
}

/** palmsays-palm-reading-deepak-2026-09-27.pdf (a non-Latin name is left out of the file name). */
export function pdfFileName(name: string, date: Date): string {
  const slug = name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24)
    .replace(/-+$/g, '');
  return `palmsays-palm-reading${slug ? `-${slug}` : ''}-${isoDay(date)}.pdf`;
}

/** The PDF's big title. */
export function pdfTitle(details: PersonalDetails | null, locale: Locale): string {
  const who = addressName(details?.name ?? '', locale);
  if (locale === 'hi') return who ? `${who} की हस्तरेखा रीडिंग` : 'आपकी हस्तरेखा रीडिंग';
  return who ? `Palm reading for ${who}` : 'Your palm reading';
}

export const PDF_COPY = {
  readOn: { en: 'Read on {date}', hi: '{date} को पढ़ी गई' },
  page: { en: 'Page {n} of {total}', hi: 'पेज {n} / {total}' },
  handRead: { en: '{hand} read', hi: '{hand} पढ़ा गया' },
  madeWith: {
    en: 'Made on this device with PalmSays. Your photo and details were not sent anywhere to make this PDF.',
    hi: 'यह PDF PalmSays से इसी डिवाइस पर बनी। इसे बनाने के लिए आपकी फ़ोटो या जानकारी कहीं नहीं भेजी गई।',
  },
  notClearly: { en: 'not clearly seen', hi: 'साफ़ नहीं दिखी' },
} as const;

/* ── drawing ──────────────────────────────────────────────────────────── */

/** A4 at 200 dpi. */
const W = 1654;
const H = 2339;
const MM = W / 210;
const M = Math.round(16 * MM);
const CW = W - 2 * M;
const TOP = Math.round(18 * MM);
const BOTTOM = H - Math.round(22 * MM);

/** Print colours: ivory paper, indigo ink, the site's gold (Day theme), the site's trace colours. */
const INK = {
  paper: '#FBF8F1',
  ink: '#17133D',
  muted: '#5B577C',
  gold: '#9A6A0C',
  goldBright: '#E6B85C',
  goldPale: '#F5D98B',
  ivory: '#F6F0E1',
  band1: '#0B0A1F',
  band2: '#26206A',
  markFill: '#1B1640',
  hair: 'rgba(23,19,61,0.14)',
  goldTint: 'rgba(214,170,80,0.10)',
  goldEdge: 'rgba(154,106,12,0.45)',
  labelBg: 'rgba(11,10,31,0.86)',
} as const;

const TRACE_FALLBACK: Record<TracedLineName, string> = { heart: '#FF4D5E', head: '#4C8DFF', life: '#2FD06A', fate: '#B26BFF' };
const ORDER: TracedLineName[] = ['life', 'head', 'heart', 'fate'];

function traceColour(type: TracedLineName): string {
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue(`--color-trace-${type}`).trim();
    return v || TRACE_FALLBACK[type];
  } catch {
    return TRACE_FALLBACK[type];
  }
}

const BODY = 'Mukta, "Nirmala UI", "Noto Sans Devanagari", "Segoe UI", sans-serif';
function displayFont(locale: Locale, size: number): string {
  return locale === 'hi' ? `400 ${size}px "Tiro Devanagari Hindi", "Nirmala UI", serif` : `700 ${size}px "Cormorant Garamond", Georgia, serif`;
}
const body = (size: number, weight = 400, italic = false) => `${italic ? 'italic ' : ''}${weight} ${size}px ${BODY}`;

type Ctx = CanvasRenderingContext2D;

function setFont(ctx: Ctx, font: string): void {
  ctx.font = font;
}

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** The PalmSays mark (Logo.astro): the arch and three gold lines, `size` px tall. */
function drawMark(ctx: Ctx, x: number, y: number, size: number): void {
  const k = size / 28.8;
  ctx.save();
  ctx.translate(x - 3.6 * k, y - 1.6 * k);
  ctx.scale(k, k);
  const arch = new Path2D('M4.5 29.5V14.2C4.5 7.7 9.6 2.5 16 2.5s11.5 5.2 11.5 11.7v15.3Z');
  ctx.fillStyle = INK.markFill;
  ctx.fill(arch);
  ctx.strokeStyle = INK.goldBright;
  ctx.lineWidth = 1.4;
  ctx.lineJoin = 'round';
  ctx.stroke(arch);
  ctx.strokeStyle = INK.goldPale;
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.stroke(new Path2D('M26.2 13.2c-4.4-1.6-9.4-1.4-13.6.8M5.6 16.6c5.2-.3 10 1.3 13.8 4.7M5.6 16.6c4.2 2.3 6.8 6.4 7.2 11.4'));
  ctx.restore();
}

/** One row of the flowing part of the report; rows never split, so a page break falls between them. */
interface Row {
  h: number;
  /** Space above, dropped at the top of a page. */
  gap?: number | undefined;
  /** Keep with this many following rows (headings). */
  keep?: number | undefined;
  draw(ctx: Ctx, y: number): void;
}

function textRows(ctx: Ctx, text: string, opts: { font: string; size: number; lh?: number; color: string; x?: number; width?: number; gap?: number; bar?: string }): Row[] {
  const x = opts.x ?? M;
  const width = opts.width ?? CW;
  setFont(ctx, opts.font);
  const lines = wrapWords(text, width, (s) => ctx.measureText(s).width);
  const lh = Math.round(opts.size * (opts.lh ?? 1.55));
  return lines.map((line, i) => ({
    h: lh,
    gap: i === 0 ? opts.gap : 0,
    draw(c, y) {
      setFont(c, opts.font);
      c.fillStyle = opts.color;
      c.textBaseline = 'middle';
      c.textAlign = 'left';
      c.fillText(line, x, y + lh / 2);
      if (opts.bar) {
        c.fillStyle = opts.bar;
        c.fillRect(x - 26, y, 5, lh);
      }
    },
  }));
}

function bulletRows(ctx: Ctx, label: string, text: string, gap: number): Row[] {
  const x = M + 44;
  const width = CW - 44;
  const rows: Row[] = [];
  if (label) rows.push(...textRows(ctx, label, { font: body(26, 700), size: 26, lh: 1.4, color: INK.gold, x, width, gap }));
  const lines = textRows(ctx, text, { font: body(31), size: 31, color: INK.ink, x, width, gap: label ? 2 : gap });
  // A label never ends a page alone: it keeps with the first line of its text.
  const lastLabel = rows[rows.length - 1];
  if (lastLabel) lastLabel.keep = 1;
  const first = rows[0] ?? lines[0];
  if (first) {
    const draw = first.draw;
    first.draw = (c, y) => {
      draw(c, y);
      c.fillStyle = INK.goldBright;
      c.beginPath();
      c.arc(M + 14, y + first.h / 2, 6, 0, Math.PI * 2);
      c.fill();
    };
  }
  return [...rows, ...lines];
}

function sectionHeading(locale: Locale, title: string, state: string | null): Row {
  const size = locale === 'hi' ? 50 : 58;
  const h = Math.round(size * 1.35) + 26;
  return {
    h,
    gap: 70,
    keep: 2,
    draw(c, y) {
      setFont(c, displayFont(locale, size));
      c.fillStyle = INK.ink;
      c.textBaseline = 'middle';
      c.textAlign = 'left';
      c.fillText(title, M, y + (h - 26) / 2);
      if (state) {
        setFont(c, body(24, 700));
        const w = c.measureText(state).width + 36;
        const px = M + CW - w;
        const py = y + (h - 26) / 2 - 22;
        roundRect(c, px, py, w, 44, 22);
        c.fillStyle = INK.goldTint;
        c.fill();
        c.strokeStyle = INK.goldEdge;
        c.lineWidth = 2;
        c.stroke();
        c.fillStyle = INK.gold;
        c.textAlign = 'center';
        c.fillText(state, px + w / 2, py + 22);
        c.textAlign = 'left';
      }
      c.fillStyle = INK.hair;
      c.fillRect(M, y + h - 8, CW, 2);
    },
  };
}

/** A locked part: its title and real first sentence in a soft gold card; never more. */
function lockedCard(ctx: Ctx, locale: Locale, title: string, sentence: string | null): Row {
  const pad = 40;
  const inner = CW - 2 * pad;
  const titleSize = locale === 'hi' ? 42 : 48;
  setFont(ctx, body(31));
  const lines = sentence ? wrapWords(sentence, inner, (s) => ctx.measureText(s).width) : [];
  const lh = 48;
  const h = pad + titleSize * 1.4 + (lines.length ? 12 + lines.length * lh : 0) + 16 + 40 + pad;
  return {
    h,
    gap: 28,
    draw(c, y) {
      roundRect(c, M, y, CW, h, 28);
      c.fillStyle = INK.goldTint;
      c.fill();
      c.strokeStyle = INK.goldEdge;
      c.lineWidth = 2;
      c.stroke();
      let cy = y + pad;
      c.textBaseline = 'middle';
      c.textAlign = 'left';
      setFont(c, displayFont(locale, titleSize));
      c.fillStyle = INK.ink;
      c.fillText(title, M + pad, cy + (titleSize * 1.4) / 2);
      setFont(c, body(24, 700));
      c.fillStyle = INK.gold;
      c.textAlign = 'right';
      c.fillText(COPY.locked[locale], M + CW - pad, cy + (titleSize * 1.4) / 2);
      c.textAlign = 'left';
      cy += titleSize * 1.4;
      if (lines.length) {
        cy += 12;
        setFont(c, body(31));
        c.fillStyle = INK.ink;
        for (const line of lines) {
          c.fillText(line, M + pad, cy + lh / 2);
          cy += lh;
        }
      }
      cy += 16;
      setFont(c, body(26, 700));
      c.fillStyle = INK.muted;
      c.fillText(COPY.lockRest[locale], M + pad, cy + 20);
    },
  };
}

/** The photo with its traced lines and side names, drawn as on the report (ReportPhoto.tsx). */
function drawPhoto(ctx: Ctx, image: CanvasImageSource, reading: SavedReading, locale: Locale, x: number, y: number, w: number, h: number): void {
  ctx.save();
  roundRect(ctx, x, y, w, h, 30);
  ctx.clip();
  ctx.fillStyle = INK.band1;
  ctx.fillRect(x, y, w, h);
  ctx.drawImage(image, x, y, w, h);
  // Lines in a 360 px wide box, as on a phone, then scaled: same widths and names as on screen.
  const vw = 360;
  const vh = (vw * h) / w;
  const k = w / vw;
  ctx.translate(x, y);
  ctx.scale(k, k);
  const drawn = ORDER.flatMap((type) => reading.lines.filter((l) => l.type === type && l.path.length >= 2));
  const traces = drawn.map((line) => {
    const points = toPx(line.path, vw, vh);
    return { type: line.type, faint: isFaint(line), points, path: new Path2D(smoothPath(points)) };
  });
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const t of traces) {
    const colour = traceColour(t.type);
    ctx.setLineDash([]);
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = colour;
    ctx.lineWidth = 4;
    ctx.stroke(t.path);
    ctx.globalAlpha = 1;
    ctx.setLineDash(t.faint ? [4, 4] : []);
    ctx.lineWidth = 1.4;
    ctx.stroke(t.path);
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = INK.ivory;
    ctx.lineWidth = 0.45;
    ctx.stroke(t.path);
    ctx.globalAlpha = 1;
  }
  ctx.setLineDash([]);
  const labels = placeSideLabels(
    traces.map((t) => ({ key: t.type, points: t.points, w: labelWidth(COPY.linesShort[t.type][locale]), h: LABEL_H })),
    vw,
    vh,
    LABEL_PAD,
    LABEL_GAP,
  );
  for (const label of labels) {
    const type = label.key as TracedLineName;
    const colour = traceColour(type);
    ctx.strokeStyle = colour;
    ctx.globalAlpha = 0.8;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(label.from[0], label.from[1]);
    ctx.lineTo(label.anchor[0], label.anchor[1]);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.arc(label.anchor[0], label.anchor[1], 2.25, 0, Math.PI * 2);
    ctx.fill();
    roundRect(ctx, label.x, label.y, label.w, label.h, 8);
    ctx.fillStyle = INK.labelBg;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = colour;
    ctx.stroke();
    ctx.fillStyle = INK.ivory;
    setFont(ctx, body(12, 700));
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(COPY.linesShort[type][locale], label.x + label.w / 2, label.y + label.h / 2 + 0.5);
  }
  ctx.restore();
  ctx.save();
  roundRect(ctx, x, y, w, h, 30);
  ctx.strokeStyle = INK.goldEdge;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

export interface PdfInput {
  locale: Locale;
  reading: SavedReading;
  view: ReportView | null;
  details: PersonalDetails | null;
  opening: string | null;
  now?: Date;
}

interface Hero {
  bottom: number;
  draw(ctx: Ctx): void;
  /** Where "palmsays.com" sits in the header (for the link), px. */
  link: { x: number; y: number; w: number; h: number };
}

function buildHero(ctx: Ctx, input: PdfInput, image: ImageBitmap): Hero {
  const { locale, reading, view, details } = input;
  const title = pdfTitle(details, locale);
  const titleSize = locale === 'hi' ? 74 : 88;
  setFont(ctx, displayFont(locale, titleSize));
  const titleLines = wrapWords(title, CW, (s) => ctx.measureText(s).width);
  const titleLh = Math.round(titleSize * 1.25);
  const titleTop = TOP + 150;
  const dateY = titleTop + titleLines.length * titleLh + 18;
  const bandBottom = dateY + 44 + 70;
  const date = new Date(reading.createdAt).toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  // Details line under the band: the hand read, the writing hand, birth details.
  const hand = reading.handSide === 'left' ? COPY.leftHand[locale] : COPY.rightHand[locale];
  const bits = [PDF_COPY.handRead[locale].replace('{hand}', hand)];
  if (details) {
    const writes = writesWithText(details, locale);
    const born = birthText(details, locale);
    if (writes) bits.push(writes);
    if (born) bits.push(born);
  }
  const detailRows = textRows(ctx, bits.join('   ·   '), { font: body(30, 700), size: 30, color: INK.ink });
  const previewRows = reading.preview ? textRows(ctx, COPY.previewLabel[locale], { font: body(26, 400, true), size: 26, color: INK.muted }) : [];
  let y = bandBottom + 56;
  const detailsTop = y;
  y += [...detailRows, ...previewRows].reduce((s, r) => s + r.h, 0) + 44;

  // Photo (left) + opening and at a glance (right).
  const aspect = reading.photoWidth / reading.photoHeight;
  let pw = 620;
  let ph = pw / aspect;
  if (ph > 860) {
    ph = 860;
    pw = ph * aspect;
  }
  const photoTop = y;
  const gx = M + pw + 64;
  const gw = CW - pw - 64;
  const right: Row[] = [];
  if (input.opening) right.push(...textRows(ctx, input.opening, { font: body(31, 400, true), size: 31, color: INK.ink, x: gx, width: gw }));
  const glanceTitleSize = locale === 'hi' ? 42 : 48;
  const pad = 36;
  const glanceRows: Row[] = [];
  if (view) {
    for (const item of view.glance) {
      if (item.label) glanceRows.push(...textRows(ctx, item.label, { font: body(25, 700), size: 25, lh: 1.4, color: INK.gold, x: gx + pad, width: gw - 2 * pad, gap: 18 }));
      glanceRows.push(...textRows(ctx, item.text, { font: body(29), size: 29, color: INK.ink, x: gx + pad, width: gw - 2 * pad, gap: item.label ? 0 : 18 }));
    }
  } else {
    glanceRows.push(...textRows(ctx, `${COPY.yourPalm[locale]} ${COPY.notClearLine[locale]}`, { font: body(29), size: 29, color: INK.ink, x: gx + pad, width: gw - 2 * pad }));
  }
  const glanceH = pad + glanceTitleSize * 1.4 + glanceRows.reduce((s, r) => s + (r.gap ?? 0) + r.h, 0) + pad;
  const openingH = right.reduce((s, r) => s + r.h, 0);
  const glanceTop = photoTop + (openingH ? openingH + 36 : 0);

  // Legend under the photo.
  const found = new Set(reading.lines.filter((l) => l.path.length >= 2).map((l) => l.type));
  const legendTop = photoTop + ph + 30;
  const legendH = 4 * 44;
  const bottom = Math.max(legendTop + legendH, glanceTop + glanceH);

  const linkText = site.domain;
  setFont(ctx, body(28, 700));
  const linkW = ctx.measureText(linkText).width;
  const link = { x: M + CW - linkW - 8, y: TOP + 20, w: linkW + 16, h: 60 };

  return {
    bottom,
    link,
    draw(c) {
      const band = c.createLinearGradient(0, 0, W, bandBottom);
      band.addColorStop(0, INK.band1);
      band.addColorStop(1, INK.band2);
      c.fillStyle = band;
      c.fillRect(0, 0, W, bandBottom);
      c.fillStyle = INK.goldBright;
      c.fillRect(0, bandBottom - 5, W, 5);
      drawMark(c, M, TOP + 16, 64);
      c.textBaseline = 'middle';
      c.textAlign = 'left';
      setFont(c, '700 54px "Cormorant Garamond", Georgia, serif');
      c.fillStyle = INK.ivory;
      c.fillText(site.brand, M + 80, TOP + 50);
      setFont(c, body(28, 700));
      c.fillStyle = INK.goldPale;
      c.textAlign = 'right';
      c.fillText(linkText, M + CW, TOP + 50);
      c.textAlign = 'left';
      setFont(c, displayFont(locale, titleSize));
      c.fillStyle = INK.ivory;
      titleLines.forEach((line, i) => c.fillText(line, M, titleTop + i * titleLh + titleLh / 2));
      setFont(c, body(32));
      c.fillStyle = INK.goldPale;
      c.fillText(PDF_COPY.readOn[locale].replace('{date}', date), M, dateY + 22);

      let dy = detailsTop;
      for (const r of [...detailRows, ...previewRows]) {
        r.draw(c, dy);
        dy += r.h;
      }

      drawPhoto(c, image, reading, locale, M, photoTop, pw, ph);

      let ly = legendTop;
      for (const type of ORDER) {
        const on = found.has(type);
        c.fillStyle = traceColour(type);
        c.beginPath();
        c.arc(M + 12, ly + 22, 10, 0, Math.PI * 2);
        if (on) c.fill();
        else {
          c.lineWidth = 3;
          c.strokeStyle = traceColour(type);
          c.stroke();
        }
        setFont(c, body(28, on ? 700 : 400));
        c.fillStyle = on ? INK.ink : INK.muted;
        c.textBaseline = 'middle';
        c.fillText(on ? COPY.lines[type][locale] : `${COPY.lines[type][locale]}: ${PDF_COPY.notClearly[locale]}`, M + 38, ly + 22);
        ly += 44;
      }

      let ry = photoTop;
      for (const r of right) {
        r.draw(c, ry);
        ry += r.h;
      }
      roundRect(c, gx, glanceTop, gw, glanceH, 30);
      c.fillStyle = INK.goldTint;
      c.fill();
      c.strokeStyle = INK.goldEdge;
      c.lineWidth = 3;
      c.stroke();
      setFont(c, displayFont(locale, glanceTitleSize));
      c.fillStyle = INK.ink;
      c.textBaseline = 'middle';
      c.fillText(COPY.atGlance[locale], gx + pad, glanceTop + pad + (glanceTitleSize * 1.4) / 2);
      let gy = glanceTop + pad + glanceTitleSize * 1.4;
      for (const r of glanceRows) {
        gy += r.gap ?? 0;
        r.draw(c, gy);
        gy += r.h;
      }
    },
  };
}

function flowRows(ctx: Ctx, input: PdfInput): Row[] {
  const { locale, view } = input;
  const rows: Row[] = [];
  if (view) {
    for (const section of view.open) {
      rows.push(sectionHeading(locale, section.title, section.stateWord));
      section.parts.forEach((part, i) => {
        const first = i === 0;
        if (section.parts.length > 1) {
          const sub = textRows(ctx, part.subtitle, { font: body(28, 700), size: 28, lh: 1.4, color: INK.muted, gap: first ? 20 : 44 });
          if (sub[0]) sub[0].keep = 1;
          rows.push(...sub);
        }
        if (part.summary) rows.push(...textRows(ctx, part.summary, { font: body(34), size: 34, lh: 1.5, color: INK.ink, gap: 18 }));
        if (part.note) rows.push(...textRows(ctx, part.note, { font: body(27), size: 27, color: INK.muted, gap: 10 }));
        for (const bullet of part.bullets) rows.push(...bulletRows(ctx, bullet.label ?? "", bullet.text, 20));
        if (part.question) rows.push(...textRows(ctx, part.question, { font: body(30, 400, true), size: 30, color: INK.muted, x: M + 30, width: CW - 30, gap: 22, bar: INK.goldBright }));
      });
    }
    if (view.locked.length) {
      const intro = textRows(ctx, COPY.partsRead[locale], { font: displayFont(locale, locale === 'hi' ? 40 : 46), size: locale === 'hi' ? 40 : 46, lh: 1.4, color: INK.ink, gap: 80 });
      if (intro[0]) intro[0].keep = 1;
      rows.push(...intro);
      for (const part of view.locked) rows.push(lockedCard(ctx, locale, part.title, part.sentence));
    }
  }
  rows.push(...textRows(ctx, COPY.honesty[locale], { font: body(27), size: 27, color: INK.muted, gap: 70 }));
  rows.push(...textRows(ctx, PDF_COPY.madeWith[locale], { font: body(27), size: 27, color: INK.muted, gap: 16 }));
  return rows;
}

/** Rows → pages: page 1 starts under the hero, the others at the top margin. */
function paginate(rows: Row[], firstTop: number): { row: Row; y: number }[][] {
  const pages: { row: Row; y: number }[][] = [[]];
  let y = firstTop;
  let top = true;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    let need = (top ? 0 : (row.gap ?? 0)) + row.h;
    for (let j = 1; j <= (row.keep ?? 0) && rows[i + j]; j++) need += (rows[i + j]!.gap ?? 0) + rows[i + j]!.h;
    if (!top && y + need > BOTTOM) {
      pages.push([]);
      y = TOP;
      top = true;
    }
    if (!top) y += row.gap ?? 0;
    pages[pages.length - 1]!.push({ row, y });
    y += row.h;
    top = false;
  }
  return pages;
}

function drawFooter(ctx: Ctx, locale: Locale, n: number, total: number): { x: number; y: number; w: number; h: number } {
  const y = H - Math.round(13 * MM);
  ctx.fillStyle = INK.hair;
  ctx.fillRect(M, y - 44, CW, 2);
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  setFont(ctx, body(25, 700));
  ctx.fillStyle = INK.ink;
  const brand = `${site.brand}  ·  `;
  ctx.fillText(brand, M, y);
  const bw = ctx.measureText(brand).width;
  ctx.fillStyle = INK.gold;
  const url = site.baseUrl.replace(/^https?:\/\//, '');
  ctx.fillText(url, M + bw, y);
  const uw = ctx.measureText(url).width;
  setFont(ctx, body(25));
  ctx.fillStyle = INK.muted;
  ctx.textAlign = 'right';
  ctx.fillText(PDF_COPY.page[locale].replace('{n}', String(n)).replace('{total}', String(total)), M + CW, y);
  ctx.textAlign = 'left';
  return { x: M + bw - 6, y: y - 24, w: uw + 12, h: 48 };
}

async function loadFonts(locale: Locale): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return;
  const sample = locale === 'hi' ? 'हस्तरेखा रीडिंग PalmSays' : 'PalmSays palm reading';
  const faces = [body(31), body(31, 700), body(31, 400, true), '700 48px "Cormorant Garamond"', ...(locale === 'hi' ? ['400 48px "Tiro Devanagari Hindi"'] : [])];
  await Promise.all(faces.map((f) => document.fonts.load(f, sample).catch(() => []))).catch(() => undefined);
}

/** Builds the PDF on this device and returns it with its file name. */
export async function makeReadingPdf(input: PdfInput): Promise<{ blob: Blob; fileName: string }> {
  const now = input.now ?? new Date();
  const [{ jsPDF }] = await Promise.all([import('jspdf'), loadFonts(input.locale)]);
  const image = await createImageBitmap(input.reading.photo);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas');
  const hero = buildHero(ctx, input, image);
  const pages = paginate(flowRows(ctx, input), hero.bottom + 40);

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  pdf.setProperties({ title: `${site.brand}: palm reading`, subject: 'Palm reading', author: site.brand, creator: site.baseUrl, keywords: 'palm reading, palmistry' });
  const toMm = (v: number) => v / MM;
  pages.forEach((page, index) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = INK.paper;
    ctx.fillRect(0, 0, W, H);
    if (index === 0) hero.draw(ctx);
    for (const { row, y } of page) row.draw(ctx, y);
    const footLink = drawFooter(ctx, input.locale, index + 1, pages.length);
    if (index > 0) pdf.addPage();
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    pdf.link(toMm(footLink.x), toMm(footLink.y), toMm(footLink.w), toMm(footLink.h), { url: site.baseUrl });
    if (index === 0) pdf.link(toMm(hero.link.x), toMm(hero.link.y), toMm(hero.link.w), toMm(hero.link.h), { url: site.baseUrl });
  });
  image.close();
  canvas.width = 0;
  canvas.height = 0;
  return { blob: pdf.output('blob'), fileName: pdfFileName(input.details?.name ?? '', now) };
}

/** Saves a file through a temporary link (Chrome, Safari, Firefox; the phone's Downloads). */
export function saveFile(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
