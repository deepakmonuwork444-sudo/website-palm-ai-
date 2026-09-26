import type { APIRoute } from 'astro';

import { PAGES } from '../config/pages';
import { absoluteUrl, site } from '../config/site';

/**
 * /llms.txt, built from site.ts and the page registry so it cannot drift
 * (SEO_PLAYBOOK.md §10). Lists only live, indexable pages.
 */
const titles: Record<string, string> = {
  '/': site.webReadingEnabled ? 'Free palm reading' : 'Palm reading home and sample reading',
  '/app/': 'Android app',
  '/hi/': 'हिंदी (Hindi home)',
  '/hi/app/': 'Android app (Hindi)',
  '/privacy': 'Privacy policy',
  '/terms': 'Terms of use',
};

export const GET: APIRoute = () => {
  const free = site.webReadingEnabled
    ? `Free: ${site.freeReadings.guest} reading as a guest, ${site.freeReadings.afterEmail} more after an email sign-up. The full reading is in the Android app (paid; prices on /app/).`
    : 'The free web reading is not open yet. The full reading is in the Android app (free to install; paid readings, prices on /app/).';
  const links = PAGES.filter((page) => page.indexable)
    .map((page) => `- [${titles[page.path] ?? page.label ?? page.path}](${absoluteUrl(page.path)})`)
    .join('\n');
  const body = `# ${site.brand}

> AI palm reading website and Android app. The AI traces the heart, head, life and fate lines on the user's own palm photo; meanings come from a fixed rule set built from classical palmistry books, each meaning with its source. Hindi and English.

## Honesty rules

- Palmistry is a tradition for reflection, not a science. ${site.brand} never predicts dates, lifespan, health, marriage timing, number of children or money.
- ${free}

## Key pages

${links}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
