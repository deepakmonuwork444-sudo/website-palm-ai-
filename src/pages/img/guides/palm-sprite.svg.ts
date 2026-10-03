import type { APIRoute } from 'astro';

import { PALM_SPRITE } from '../../../lib/guides/palm-sprite';

/** The guides' shared line-drawing sprite (src/lib/guides/palm-sprite.ts, WEB-DEC-052). */
export const GET: APIRoute = () => new Response(PALM_SPRITE, { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' } });
