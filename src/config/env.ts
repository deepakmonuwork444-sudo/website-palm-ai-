/**
 * Build-time environment (ARCHITECTURE.md §9). Only PUBLIC_* values are read.
 *
 * PUBLIC_ENV=production is set only by the production build (Workers Builds).
 * Anything else, including an unset value, is a preview: every page gets
 * `noindex`, and the legal pages may show visible placeholders.
 */

export type BuildEnv = 'preview' | 'production';

export function resolveBuildEnv(value: string | undefined): BuildEnv {
  return value?.trim() === 'production' ? 'production' : 'preview';
}

export const buildEnv: BuildEnv = resolveBuildEnv(import.meta.env.PUBLIC_ENV);
export const isPreview = buildEnv === 'preview';
