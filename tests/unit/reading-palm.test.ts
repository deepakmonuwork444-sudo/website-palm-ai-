import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

import { describe, expect, it } from 'vitest';

import golden from '../fixtures/palm-golden.json';
import goldenInput from '../../src/lib/reading/mock/golden-input.json';
import scanResponse from '../../src/lib/reading/mock/scan-response.json';
import visionOutput from '../../src/lib/reading/mock/vision-output.json';
import type { FinishedSynthesis } from '../../src/lib/reading/palm/features/knowledge/synthesis/modules';
import { MODULE_IDS } from '../../src/lib/reading/palm/features/knowledge/synthesis/types';
import type { LineServiceResponse } from '../../src/lib/reading/palm/features/lines/types';
import type { VisionOutput } from '../../src/lib/reading/palm/features/observation/schema';
import { FREE_LOCKED_SECTIONS, firstSentence, lockSynthesis } from '../../src/lib/reading/palm/features/reading/access';
import { runReading, type ReadingInput } from '../../src/lib/reading/palm/features/reading/pipeline';
import { SECTION_MODULES, moduleClaims } from '../../src/lib/reading/palm/features/reading/report-sections';
import { buildReportView } from '../../src/lib/reading/report';

/**
 * src/lib/reading/palm is a verbatim copy of the app's code (ARCHITECTURE.md F7):
 * every file matches the sha256 recorded by scripts/sync-palm-lib.mjs, nothing
 * reaches for React Native, and the copy gives EXACTLY the reading the app's
 * own compiled code gave for the same stored scan (tests/fixtures/palm-golden.json).
 */

const PALM = join(process.cwd(), 'src', 'lib', 'reading', 'palm');

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? files(full) : [full];
  });
}

const stable = (value: unknown) => JSON.parse(JSON.stringify(value, (key, v) => (key === 'capturedAt' || key === 'generatedAt' ? '<time>' : v)));

async function readMock(): Promise<Awaited<ReturnType<typeof runReading>>> {
  const input = goldenInput.reading as unknown as Omit<ReadingInput, 'provider' | 'lineScan'>;
  return runReading({
    ...input,
    lineScan: { status: 'ok', response: structuredClone(scanResponse) as unknown as LineServiceResponse, latencyMs: 0 },
    provider: {
      id: goldenInput.provider.id,
      model: goldenInput.provider.model,
      version: goldenInput.provider.version,
      runsOnDevice: false,
      extract: async () => ({ output: structuredClone(visionOutput) as unknown as VisionOutput, latencyMs: 0, costUnits: null }),
    },
  });
}

describe('src/lib/reading/palm is an untouched copy', () => {
  const source = readFileSync(join(PALM, 'SOURCE.md'), 'utf8');
  const rows = [...source.matchAll(/^\| `([^`]+)` \| ([0-9a-f]{64}|web shim) \|/gm)].map((m) => ({ path: m[1]!, sha: m[2]! }));
  const onDisk = files(PALM)
    .filter((f) => f.endsWith('.ts'))
    .map((f) => relative(PALM, f).split(sep).join('/'));

  it('lists every file, and only those', () => {
    expect(rows.length).toBeGreaterThan(40);
    expect(rows.map((r) => r.path).sort()).toEqual([...onDisk].sort());
  });

  it('every copy matches the app file byte for byte (after its 3-line header)', () => {
    for (const row of rows) {
      const text = readFileSync(join(PALM, ...row.path.split('/')), 'utf8');
      if (row.sha === 'web shim') {
        expect(text.startsWith('// WEB SHIM for palm-ai-new--feat-m1-foundation/src/')).toBe(true);
        continue;
      }
      const lines = text.split('\n');
      expect(lines[0]).toMatch(new RegExp(`^// COPIED from palm-ai-new--feat-m1-foundation/src/${row.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} at app commit [0-9a-f]{7,40}`));
      const body = lines.slice(3).join('\n');
      expect(createHash('sha256').update(body).digest('hex'), row.path).toBe(row.sha);
    }
  });

  it('nothing reaches for React Native, Expo or a network client', () => {
    for (const file of files(PALM).filter((f) => f.endsWith('.ts'))) {
      const text = readFileSync(file, 'utf8');
      expect(text, file).not.toMatch(/from ['"](react-native|expo[^'"]*|@supabase\/[^'"]*|zustand[^'"]*)['"]/);
    }
  });
});

describe('the web copy reads a palm exactly like the app', () => {
  it('same observation, report, synthesis and locks as the app build (golden)', async () => {
    const outcome = await readMock();
    expect(stable(outcome.observation)).toEqual(golden.observation);
    expect(stable(outcome.report)).toEqual(golden.report);
    expect(stable(outcome.synthesis)).toEqual(golden.synthesis);
    const locked = lockSynthesis(outcome.synthesis as FinishedSynthesis, FREE_LOCKED_SECTIONS);
    expect(stable(locked)).toEqual(golden.locked);
  });

  it('a free reading keeps only the first sentence of Career & Money and Life Direction', async () => {
    const outcome = await readMock();
    const full = structuredClone(outcome.synthesis) as FinishedSynthesis;
    // The stored scan's locked parts are short, so give them rich text to hide:
    // every claim of a locked module gets a second sentence nobody may see.
    const lockedIds = new Set(FREE_LOCKED_SECTIONS.flatMap((key) => SECTION_MODULES[key]));
    const love = full.modules.love;
    for (const id of MODULE_IDS) {
      if (!lockedIds.has(id)) continue;
      const claims = moduleClaims(love).map((claim, i) => ({
        ...claim,
        id: `${id}-${i}`,
        text: { en: `Lead ${id} ${i}. HIDDEN-${id}-${i} words.`, hi: `अग्र ${id} ${i}। छिपा-${id}-${i} शब्द।` },
      }));
      full.modules[id] = { ...love, id, area: full.modules[id].area, primary: claims[0]!, showsUp: claims[1]!, strength: claims[2]!, extra: claims.slice(3) };
    }
    const locked = lockSynthesis(full, FREE_LOCKED_SECTIONS);
    for (const locale of ['en', 'hi'] as const) {
      const rendered = JSON.stringify(buildReportView(locked, locale));
      expect(rendered).not.toMatch(/HIDDEN-|छिपा-/);
      for (const id of lockedIds) expect(rendered).not.toContain(`Lead ${id} 1`);
    }
    // What IS shown for a locked part: its title and the lead's first sentence only.
    const view = buildReportView(locked, 'en');
    expect(view.locked).toEqual([
      { key: 'career-money', title: 'Career & Money', sentence: 'Lead career 0.' },
      { key: 'direction', title: 'Life Direction', sentence: 'Lead direction 0.' },
    ]);
    expect(firstSentence('One. Two.')).toBe('One.');
    expect(view.open.map((s) => s.key)).toEqual(['love', 'personality']);
    // The stored (locked) synthesis itself carries nothing more either.
    expect(JSON.stringify(locked)).not.toMatch(/HIDDEN-|छिपा-/);
  });
});
