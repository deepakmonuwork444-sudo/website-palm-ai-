// @ts-check
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

import { LOCALES, site } from './src/config/site.ts';

/**
 * Preview builds only (never production): a reading test may point at another
 * https proxy in front of Supabase (PUBLIC_API_URL, src/lib/reading/config.ts).
 * Never *.supabase.co. Production connects only to site.apiUrl.
 */
const previewApi = (() => {
  if (process.env.PUBLIC_ENV?.trim() === 'production') return null;
  try {
    const url = new URL(process.env.PUBLIC_API_URL ?? '');
    if (url.protocol !== 'https:' || /(^|\.)supabase\.(co|in|net)$/i.test(url.hostname)) return null;
    return url.origin === site.apiUrl ? null : url.origin;
  } catch {
    return null;
  }
})();

/**
 * PalmSays website (ARCHITECTURE.md §1–2): static pages, React islands only
 * where a page needs one, MDX content, Tailwind 4 tokens, Cloudflare Workers
 * static assets (wrangler.jsonc). Sitemaps are built from src/config/pages.ts
 * by our own endpoints (group sitemaps + hreflang alternates that match the
 * <head> tags exactly), so @astrojs/sitemap is not used.
 *
 * CSP: Astro hashes its own scripts and styles into a <meta> CSP on every
 * page (SECURITY_PRIVACY.md §5). frame-ancestors can't live in a <meta>; it is
 * in public/_headers.
 */
export default defineConfig({
  site: site.baseUrl,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  i18n: {
    defaultLocale: 'en',
    locales: [...LOCALES],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [react(), mdx()],
  // No Shiki: its inline styles break the hashed CSP. Guides have no code blocks.
  markdown: { syntaxHighlight: false },
  vite: {
    plugins: [tailwindcss()],
  },
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data: blob:",
        "font-src 'self'",
        `connect-src 'self' ${site.apiUrl}${previewApi ? ` ${previewApi}` : ''} https://cloudflareinsights.com`,
        'frame-src https://challenges.cloudflare.com',
        "worker-src 'self' blob:",
        "object-src 'none'",
        "base-uri 'none'",
        "form-action 'self'",
        'upgrade-insecure-requests',
      ],
      scriptDirective: {
        resources: ["'self'", 'https://challenges.cloudflare.com', 'https://static.cloudflareinsights.com'],
      },
    },
  },
});
