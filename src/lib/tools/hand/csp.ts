/**
 * The two CSP additions a page needs to run the on-device hand model
 * (detector.ts), added per page so every other page keeps the strict policy:
 * - `'wasm-unsafe-eval'` in script-src: lets the page compile WebAssembly
 *   (it does not allow eval() or new Function());
 * - `blob:` in connect-src: the downloaded wasm bytes are handed to the
 *   runtime as a blob: URL of this page (one download, real progress).
 * The runtime's loader script is served from this site (/_astro/), which
 * script-src 'self' already allows.
 */

interface CspApi {
  insertScriptResource(resource: string): void;
  insertDirective(directive: string): void;
}

export function allowHandModel(astro: { csp?: CspApi | undefined }): void {
  astro.csp?.insertScriptResource("'wasm-unsafe-eval'");
  astro.csp?.insertDirective('connect-src blob:');
}
