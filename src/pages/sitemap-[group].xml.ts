import type { APIRoute, GetStaticPaths } from 'astro';

import type { SitemapGroup } from '../config/pages';
import { activeGroups, sitemapXml } from '../lib/sitemap';

/** One file per non-empty group: sitemap-core.xml, sitemap-hi.xml, … (SEO_PLAYBOOK.md §9). */
export const getStaticPaths = (() => activeGroups().map((group) => ({ params: { group } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) =>
  new Response(sitemapXml(params.group as SitemapGroup), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
