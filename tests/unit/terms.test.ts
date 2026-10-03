import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

import { PAGES, isLive, type PageEntry } from '../../src/config/pages';
import { DIAGRAMS, diagramFiles, diagramUrl, diagramsOnPage } from '../../src/lib/diagrams';
import { ENTITIES, TERMS_PATH, entitySameAs } from '../../src/lib/entities';
import { pageImages, sitemapXml } from '../../src/lib/sitemap';
import { definedTermSetSchema, sectionTerms, termLink, TERM_SECTIONS, TERM_SET_ID } from '../../src/lib/terms';

const root = process.cwd();
const page = readFileSync(join(root, 'src', 'pages', 'palmistry-terms', 'index.astro'), 'utf8');

describe('glossary /palmistry-terms/ (WEB-DEC-053)', () => {
  it('is a registered, indexable page in the core sitemap', () => {
    const entry = PAGES.find((item) => item.path === TERMS_PATH);
    expect(entry).toMatchObject({ indexable: true, sitemap: 'core', label: 'Palmistry terms' });
    // The Hindi twin waits for the Hindi reviewer: not built, not registered.
    expect(PAGES.some((item) => item.path === '/hi/palmistry-terms/')).toBe(false);
  });

  it('lists every registry term exactly once, in a section', () => {
    const listed = TERM_SECTIONS.flatMap((section) => sectionTerms(section).map((item) => item.id));
    expect([...listed].sort()).toEqual(ENTITIES.map((item) => item.id).sort());
    expect(new Set(listed).size).toBe(listed.length);
    expect(ENTITIES.length).toBeGreaterThanOrEqual(60);
    // Section anchors never collide with term anchors or diagram anchors.
    const anchors = [...TERM_SECTIONS.map((s) => s.id), 'diagrams', 'sources', ...ENTITIES.map((e) => e.id), ...DIAGRAMS.map((d) => d.id)];
    expect(new Set(anchors).size).toBe(anchors.length);
  });

  it('links a term only to a built page', () => {
    for (const item of ENTITIES) {
      const link = termLink(item);
      if (link) expect(isLive(link), `${item.id} → ${link}`).toBe(true);
      if (item.owner && !isLive(item.owner)) expect(link).toBeNull();
    }
  });

  it('JSON-LD: one DefinedTermSet, a DefinedTerm per term with a unique registry @id and verified sameAs only', () => {
    const set = definedTermSetSchema();
    expect(set['@type']).toBe('DefinedTermSet');
    expect(set['@id']).toBe(TERM_SET_ID);
    const terms = set.hasDefinedTerm as Record<string, unknown>[];
    expect(terms).toHaveLength(ENTITIES.length);
    const ids = terms.map((term) => term['@id']);
    expect(new Set(ids).size).toBe(ids.length);
    for (const [i, item] of ENTITIES.entries()) {
      const term = terms[i]!;
      expect(term['@type']).toBe('DefinedTerm');
      expect(term['@id']).toBe(`https://palmsays.com/palmistry-terms/#${item.id}`);
      expect(term.name).toBe(item.name.en);
      expect(term.alternateName).toBe(item.name.hi);
      expect(term.description).toBe(item.def);
      const sameAs = entitySameAs(item);
      if (sameAs.length) expect(term.sameAs).toEqual(sameAs);
      else expect(term.sameAs).toBeUndefined();
      expect(String(term.url)).toMatch(/^https:\/\/palmsays\.com\//);
    }
  });

  it('the page renders every term from the registry (no hand-typed list) and no FAQPage', () => {
    expect(page).toMatch(/sectionTerms\(section\)/);
    expect(page).toMatch(/<h3 id=\{item\.id\}/);
    expect(page).toMatch(/lang="hi"/);
    expect(page).toMatch(/definedTermSetSchema\(ENTITIES\)/);
    expect(page).not.toMatch(/FAQPage/);
    expect(page).not.toMatch(/<script(?![^>]*ld\+json)/);
  });
});

describe('diagram files (WEB-FEAT-056, §7.4)', () => {
  const dir = join(root, 'public', 'img', 'diagrams');
  const onDisk = new Set(readdirSync(dir));

  it('exist at every size with descriptive ASCII names', async () => {
    for (const item of DIAGRAMS) {
      expect(item.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)+$/);
      for (const file of diagramFiles(item)) expect(onDisk.has(file), file).toBe(true);
      expect(item.width).toBeGreaterThanOrEqual(1600);
      const png = readFileSync(join(dir, `${item.id}.png`));
      expect(png.readUInt32BE(16), `${item.id}.png width`).toBe(item.width);
      expect(png.readUInt32BE(20), `${item.id}.png height`).toBe(item.height);
      const tall = await sharp(join(dir, `${item.id}-tall.webp`)).metadata();
      expect([tall.width, tall.height], `${item.id}-tall`).toEqual([item.tall.width, item.tall.height]);
      const small = await sharp(join(dir, `${item.id}-900.webp`)).metadata();
      expect(small.width).toBe(900);
    }
  });

  it('carry alt text, a caption and pages that are built', () => {
    for (const item of DIAGRAMS) {
      expect(item.alt.length, item.id).toBeGreaterThan(80);
      for (const path of item.pages) expect(isLive(path), `${item.id} on ${path}`).toBe(true);
      if (item.kind === 'infographic') {
        // Blog infographics: on their post only; an AI-made image would be said in the caption, and the
        // ones with the palm photo credit the real, licensed photo (owner 2026-10-02: no AI-made photo or icon).
        expect(item.pages, item.id).not.toContain(TERMS_PATH);
        if (/AI-made|AI image/.test(item.alt)) expect(item.caption).toMatch(/AI-made/);
        if (['same-palm-different-photo', 'chatbot-vs-palm-scanner-flow'].includes(item.id)) expect(item.caption).toMatch(/real palm photo \(Hanna Pad, Pexels\)/);
        continue;
      }
      expect(item.caption).toMatch(/drawing|Drawings/);
      expect(item.pages).toContain(TERMS_PATH);
    }
  });
});

describe('image sitemap entries (§7.2)', () => {
  const fixture: PageEntry[] = [
    { path: '/hand-lines/', locale: 'en', indexable: true, sitemap: 'core', lastmod: '2026-09-26' },
    { path: '/tools/', locale: 'en', indexable: true, sitemap: 'tools' },
  ];

  it('lists each page’s diagram files under its <url>, with the image namespace only when needed', () => {
    const xml = sitemapXml('core', fixture, 'https://palmsays.com');
    expect(xml).toContain('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');
    expect(xml).toContain('<image:loc>https://palmsays.com/img/diagrams/four-main-palm-lines-chart.webp</image:loc>');
    expect(sitemapXml('tools', fixture)).not.toContain('image:');
  });

  it('covers every diagram at least once, always on the glossary', () => {
    const listed = PAGES.filter((item) => item.indexable).flatMap((item) => pageImages(item.path));
    for (const item of DIAGRAMS) expect(listed, item.id).toContain(diagramUrl(item));
    expect(diagramsOnPage(TERMS_PATH)).toHaveLength(DIAGRAMS.filter((item) => item.kind !== 'infographic').length);
  });
});
