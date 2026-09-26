import type { APIRoute, GetStaticPaths } from 'astro';

import { assetLinksJson, site } from '../../config/site';

/**
 * /.well-known/assetlinks.json (ARCHITECTURE.md §11 F2), built only when the
 * Play App Signing SHA-256 list in site.ts is not empty: a made-up fingerprint
 * is never published.
 */
export const getStaticPaths = (() => {
  const json = assetLinksJson(site.playPackage, site.assetlinksSha256);
  if (!json) {
    console.warn(
      '[palmsays] assetlinks.json NOT built: site.assetlinksSha256 is empty. Add the Play App Signing SHA-256 (owner item 6).',
    );
    return [];
  }
  return [{ params: { file: 'assetlinks.json' }, props: { json } }];
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  new Response((props as { json: string }).json, { headers: { 'Content-Type': 'application/json' } });
