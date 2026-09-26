import type { APIRoute } from 'astro';

import { absoluteUrl } from '../config/site';

/**
 * Allows every crawler, AI bots included (SEO_PLAYBOOK.md §10). /reading/ and
 * /account/ are never disallowed: Google must crawl them to see their noindex.
 */
export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('/sitemap-index.xml')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
