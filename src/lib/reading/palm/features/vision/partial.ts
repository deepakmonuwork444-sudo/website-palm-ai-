// COPIED from palm-ai-new--feat-m1-foundation/src/features/vision/partial.ts at app commit 38389f51b74d (2026-09-26).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import { MAJOR_LINES, type MajorLineType } from '../observation/taxonomy';

/**
 * Reads the finished line entries out of a model answer that is still arriving.
 *
 * Display only: it lets the analysing screen show each line as soon as the
 * model has written it. The reading itself is built from the complete answer,
 * validated as usual, so nothing shown here can reach the report unchecked.
 */

export interface PartialLine {
  type: MajorLineType;
  visible: boolean;
  length: string | null;
  depth: string | null;
  curvature: string | null;
  continuity: string | null;
}

function attr(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null;
  const v = (value as { value?: unknown }).value;
  return typeof v === 'string' ? v : null;
}

function toLine(json: string): PartialLine | null {
  try {
    const raw = JSON.parse(json) as Record<string, unknown>;
    const type = raw.type;
    if (typeof type !== 'string' || !(MAJOR_LINES as readonly string[]).includes(type)) return null;
    return {
      type: type as MajorLineType,
      visible: raw.visible === true,
      length: attr(raw.length),
      depth: attr(raw.depth),
      curvature: attr(raw.curvature),
      continuity: attr(raw.continuity),
    };
  } catch {
    return null;
  }
}

/** Every line object in the `lines` array that has been fully written so far. */
export function completedLines(text: string): PartialLine[] {
  const key = text.indexOf('"lines"');
  if (key < 0) return [];
  const open = text.indexOf('[', key);
  if (open < 0) return [];

  const lines: PartialLine[] = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let escaped = false;

  for (let i = open + 1; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{' || ch === '[') {
      if (depth === 0 && ch === '{') start = i;
      depth++;
    } else if (ch === '}' || ch === ']') {
      if (depth === 0) break; // the end of the lines array
      depth--;
      if (depth === 0 && ch === '}' && start >= 0) {
        const line = toLine(text.slice(start, i + 1));
        if (line && !lines.some((l) => l.type === line.type)) lines.push(line);
        start = -1;
      }
    }
  }
  return lines;
}
