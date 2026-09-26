/** The honest "opens soon" screen while the web reading is off (site.webReadingEnabled = false). */

import type { Locale } from '../../config/site';
import { COPY } from '../../lib/reading/copy';
import Store from './Store';

export function OffScreen({ locale, missing }: { locale: Locale; missing: string[] }) {
  return (
    <section className="rd-card" aria-labelledby="rd-off-title">
      <h2 id="rd-off-title" className="text-h2 font-display">
        {COPY.offTitle[locale]}
      </h2>
      <p>{COPY.offBody[locale]}</p>
      <Store locale={locale} placement="reading" qr />
      {missing.length > 0 && <p className="text-caption rd-muted">Preview: live mode needs {missing.join(', ')}.</p>}
    </section>
  );
}
