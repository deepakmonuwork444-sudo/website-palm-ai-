/**
 * The CSP additions for "Continue with Google" (Google Identity Services),
 * added ONLY on /account/, /hi/account/ and /reading/ so every other page keeps
 * the strict policy (same per-page pattern as src/lib/tools/hand/csp.ts).
 * Exactly Google's documented list, no wildcards
 * (https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid#content_security_policy).
 */

interface CspApi {
  insertScriptResource(resource: string): void;
  insertStyleResource(resource: string): void;
  insertDirective(directive: string): void;
}

export const GOOGLE_CSP = {
  script: 'https://accounts.google.com/gsi/client',
  style: 'https://accounts.google.com/gsi/style',
  frame: 'https://accounts.google.com/gsi/',
  connect: 'https://accounts.google.com/gsi/',
} as const;

export function allowGoogleSignIn(astro: { csp?: CspApi | undefined }): void {
  astro.csp?.insertScriptResource(GOOGLE_CSP.script);
  // Astro drops its default 'self' from style-src once any style resource is added: keep our own stylesheets.
  astro.csp?.insertStyleResource("'self'");
  astro.csp?.insertStyleResource(GOOGLE_CSP.style);
  astro.csp?.insertDirective(`frame-src ${GOOGLE_CSP.frame}`);
  astro.csp?.insertDirective(`connect-src ${GOOGLE_CSP.connect}`);
}
