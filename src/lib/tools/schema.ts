import { absoluteUrl } from '../../config/site';
import { ORGANIZATION_ID, WEBSITE_ID } from '../schema';
import type { ToolInfo } from './registry';

/**
 * `/tools/` structured data (SEO_PLAYBOOK.md §6): CollectionPage + ItemList of
 * all 12 tools (tool 1 = the home page). No ratings, ever.
 */
export function toolsHubSchema(input: { name: string; description: string; tools: readonly ToolInfo[] }): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: input.name,
    description: input.description,
    url: absoluteUrl('/tools/'),
    inLanguage: 'en',
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORGANIZATION_ID },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: input.tools.length,
      itemListElement: input.tools.map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: tool.name,
        url: absoluteUrl(tool.path),
      })),
    },
  };
}
