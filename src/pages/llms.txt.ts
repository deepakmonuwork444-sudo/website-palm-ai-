import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

import { PAGES } from '../config/pages';
import { absoluteUrl, site } from '../config/site';
import { ENTITIES, TERMS_PATH } from '../lib/entities';
import { webScanOpen } from '../lib/reading/open';

/**
 * /llms.txt, built from site.ts, the page registry, the guides' answer-first sentences and the
 * entity registry, so it cannot drift from the pages (SEO_PLAYBOOK.md §10, SEMANTIC_SEO_PLAN.md
 * §7.3). Lists only live, indexable pages. Google Search does not use this file; other AI crawlers may.
 */
const titles: Record<string, string> = {
  '/': webScanOpen ? 'Free palm reading' : 'Palm reading home and sample reading',
  '/app/': 'Android app',
  '/hi/': 'हिंदी (Hindi home)',
  '/hi/app/': 'Android app (Hindi)',
  '/privacy/': 'Privacy policy',
  '/terms/': 'Terms of use',
};

/** At most this many glossary terms (plan §7.3: the top 40). */
const MAX_TERMS = 40;

export const GET: APIRoute = async () => {
  const free = webScanOpen
    ? `Free: ${site.freeReadings.guest} reading as a guest, ${site.freeReadings.afterEmail} more after an email sign-up. The full reading is in the Android app (paid; prices on /app/).`
    : 'The free web reading is not open yet. The full reading is in the Android app (free to install; paid readings, prices on /app/).';
  const onPlay = (site.appNameOnPlay as string) === site.brand ? '' : ` (on Google Play as ${site.appNameOnPlay})`;

  // Each guide's and blog post's answer-first sentence under its link (from the front matter).
  const answers = new Map(
    [...(await getCollection('guides')), ...(await getCollection('blog'))].map((entry) => [entry.data.path, entry.data.answer]),
  );
  const links = PAGES.filter((page) => page.indexable)
    .map((page) => {
      const line = `- [${titles[page.path] ?? page.label ?? page.path}](${absoluteUrl(page.path)})`;
      const answer = answers.get(page.path);
      return answer ? `${line}: ${answer}` : line;
    })
    .join('\n');

  const live = new Set(PAGES.filter((page) => page.indexable).map((page) => page.path));
  const terms = ENTITIES.slice(0, MAX_TERMS)
    .map((item) => {
      // The owner page when built, else the term's entry on the glossary (WEB-DEC-053).
      const more = item.owner && live.has(item.owner) ? item.owner : live.has(TERMS_PATH) ? `${TERMS_PATH}#${item.id}` : null;
      const where = more ? ` More: ${absoluteUrl(more)}` : '';
      // English only: the Hindi names wait for the Hindi reviewer (D5) before they are published.
      return `- ${item.name.en}: ${item.def}${where}`;
    })
    .join('\n');

  const body = `# ${site.brand}

> AI palm reading website and Android app${onPlay}. The AI traces the heart, head, life and fate lines on the user's own palm photo; meanings come from a fixed rule set built from classical palmistry books, each meaning with its source. Hindi and English.

## Honesty rules

- Palmistry is a tradition for reflection, not a science. ${site.brand} never predicts dates, lifespan, health, marriage timing, number of children or money.
- ${free}

## Key pages

${links}

## Palmistry terms

${terms}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
