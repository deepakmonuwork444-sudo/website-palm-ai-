import type { APIRoute } from 'astro';

import { buildEnv } from '../config/env';
import { site } from '../config/site';
import { legacyRedirectHtml, resolveCompany, resolveLegalValues, type CompanyDetails, type LegalPage, type LegalValues } from './legal';

/**
 * A static endpoint for one frozen legacy URL (/privacy.html …, ARCHITECTURE.md §11 F3).
 * The pages themselves now live at /privacy/, /terms/, /delete-account/ and /reset-password/
 * in the site layout (WEB-DEC-029); public/_redirects answers the .html URLs with a 301, and
 * this small file is the fallback behind it.
 *
 * The app's original templates stay in src/legal/ (renderLegal) for the WEB-DEC-029 fallback
 * "serve the .html pages directly" if Play Console ever rejects the redirect.
 */
export function legalRoute(name: LegalPage): APIRoute {
  return () =>
    new Response(legacyRedirectHtml(name, { brand: site.brand, baseUrl: site.baseUrl }), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
}

/** Operator, contact and grievance details for this build (placeholders on a preview; production throws). */
export function companyForBuild(): CompanyDetails {
  return resolveCompany(site.company, buildEnv === 'production');
}

/** The public Supabase values the delete-account page needs (placeholders on a preview; production throws). */
export function legalValuesForBuild(): LegalValues {
  return resolveLegalValues(
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
}
