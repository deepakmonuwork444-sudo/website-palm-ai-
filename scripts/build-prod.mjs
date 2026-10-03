/**
 * The production build for palmsays.com (WEB-FEAT-031). A plain `npm run build`
 * is a PREVIEW build (noindex on every page); only this script sets
 * PUBLIC_ENV=production. It refuses to start while something the live site
 * needs is missing, then builds and runs check-web in production mode.
 *
 *   npm run build:prod      build + check (nothing is uploaded)
 *   npm run deploy          build:prod, then `wrangler deploy` (the owner runs this)
 *
 * Public build values come from the shell or from `.env.launch` (gitignored,
 * KEY=VALUE lines, public values only):
 *   PUBLIC_SUPABASE_URL              the Supabase project URL (legacy account pages);
 *                                    https://api.palmsays.com once the proxy (WEB-SRV-002) is live
 *   PUBLIC_SUPABASE_PUBLISHABLE_KEY  the publishable/anon key (never sb_secret_ / service_role)
 * Company name + email come from src/config/site.ts (`company`), for the legal pages.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

import { site } from '../src/config/site.ts';

if (existsSync('.env.launch')) {
  for (const line of readFileSync('.env.launch', 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*(PUBLIC_[A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
}
process.env.PUBLIC_ENV = 'production';

const missing = [];
if (!site.company.name?.trim()) missing.push('company.name in src/config/site.ts (the legal operator name)');
if (!site.company.email?.trim()) missing.push('company.email in src/config/site.ts (the contact email)');
if (!site.company.grievanceContact?.trim()) missing.push('company.grievanceContact in src/config/site.ts (DPDP grievance name + email)');
if (!process.env.PUBLIC_SUPABASE_URL?.trim()) missing.push('PUBLIC_SUPABASE_URL (in .env.launch)');
if (!process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()) missing.push('PUBLIC_SUPABASE_PUBLISHABLE_KEY (in .env.launch)');
if (missing.length) {
  console.error(`\nProduction build stopped. Missing:\n${missing.map((item) => `  - ${item}`).join('\n')}\n`);
  process.exit(1);
}

const run = (command) => {
  console.log(`\n> ${command}`);
  const result = spawnSync(command, { stdio: 'inherit', shell: true, env: process.env });
  if (result.status !== 0) process.exit(result.status ?? 1);
};

run('npx astro build');

const home = readFileSync('dist/index.html', 'utf8');
if (/<meta name="robots" content="[^"]*noindex/.test(home)) {
  console.error('\nThe home page still says noindex: this is not a production build. Nothing to deploy.');
  process.exit(1);
}
run('node scripts/check-web.mjs');
console.log(`\nProduction build for ${site.baseUrl} is ready in dist/.`);
