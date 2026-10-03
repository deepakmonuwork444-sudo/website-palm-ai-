/**
 * Shared by scripts/make-og.mjs (writes the per-page share images) and
 * scripts/check-web.mjs (warns when an image's text no longer matches the page).
 * Pure functions only: no browser, no file writes.
 */

/** Share image file name for a registry path: `/` → `home`, `/tools/palm-map/` → `tools-palm-map`. */
export function ogSlug(path) {
  if (path === '/') return 'home';
  return path.replace(/^\/+|\/+$/g, '').replaceAll('/', '-');
}

const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(Number.parseInt(n, 16)));

/** The page's H1 as plain text (screen-reader-only colons included, spacing tidied), or '' when there is none. */
export function h1Text(html) {
  const inner = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? '';
  return decode(inner.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .replace(/\s+([:?,.!;।])/g, '$1')
    .trim();
}
