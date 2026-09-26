import type { APIRoute } from 'astro';

import { buildEnv } from '../config/env';
import { site } from '../config/site';
import { renderLegal, resolveLegalValues, type LegalPage } from './legal';

const templates = import.meta.glob<string>('../legal/*.html', { query: '?raw', import: 'default', eager: true });

/** A static endpoint that emits one frozen legal page at its legacy `.html` URL. */
export function legalRoute(name: LegalPage): APIRoute {
  return () => {
    const template = templates[`../legal/${name}.html`];
    if (!template) throw new Error(`Legal template src/legal/${name}.html is missing`);
    const values = resolveLegalValues(
      {
        brand: site.brand,
        baseUrl: site.baseUrl,
        operatorName: site.company.name,
        contactEmail: site.company.email,
        supabaseUrl: import.meta.env.PUBLIC_SUPABASE_URL,
        supabaseKey: import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      },
      buildEnv === 'production',
    );
    const html = renderLegal(name, template, values, { forceNoindex: buildEnv !== 'production' });
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  };
}
