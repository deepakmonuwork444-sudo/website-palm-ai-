/**
 * A reading from the account, opened on /account/: the same words and the
 * same locks as the web report (Report.tsx) — Love and Personality in full,
 * Career & Money and Life Direction as their first sentence only (the rest was
 * removed by lockSynthesis before it reached this component). No photo: it
 * stays on the device where it was taken. Loaded with import() on "Open".
 */

import { useMemo } from 'react';

import type { Locale } from '../../config/site';
import { AUTH_COPY } from '../../lib/auth/copy';
import { COPY } from '../../lib/reading/copy';
import type { FinishedSynthesis } from '../../lib/reading/palm/features/knowledge/synthesis/modules';
import { buildReportView } from '../../lib/reading/report';
import { LockIcon } from '../reading/Icons';

export default function ServerReport({ synthesis, locale }: { synthesis: FinishedSynthesis; locale: Locale }) {
  const view = useMemo(() => buildReportView(synthesis, locale), [synthesis, locale]);
  return (
    <div className="rd-report acct-report">
      <section className="rd-glance">
        <h3 className="text-h3 font-bold">{COPY.atGlance[locale]}</h3>
        <ul>
          {view.glance.map((item) => (
            <li key={item.text}>
              {item.label && <span className="rd-label">{item.label}</span>}
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </section>
      {view.open.map((section) => (
        <section key={section.key} className="rd-section">
          <div className="rd-section-head">
            <h3 className="text-h3 font-bold">{section.title}</h3>
            <span className={`rd-state rd-state-${section.state}`}>{section.stateWord}</span>
          </div>
          {section.parts.map((part) => (
            <div key={part.moduleId} className="rd-part">
              {section.parts.length > 1 && <h4 className="rd-subtitle">{part.subtitle}</h4>}
              {part.summary && <p className="rd-summary">{part.summary}</p>}
              {part.bullets.length > 0 && (
                <ul className="rd-bullets">
                  {part.bullets.map((bullet) => (
                    <li key={bullet.claimId}>
                      {bullet.label && <span className="rd-label">{bullet.label}</span>}
                      <span>{bullet.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      ))}
      <div className="rd-locked-list">
        {view.locked.map((part) => (
          <a key={part.key} className="rd-locked" href="#get-app">
            <span className="rd-locked-head">
              <span className="text-h3 font-bold">{part.title}</span>
              <span className="rd-locked-tag text-caption">
                <LockIcon />
                {COPY.locked[locale]}
              </span>
            </span>
            {part.sentence && <span className="rd-locked-text">{part.sentence}</span>}
            <span className="rd-locked-pill text-small">{AUTH_COPY.fullInApp[locale]}</span>
          </a>
        ))}
      </div>
      <p className="text-small rd-muted">{COPY.honesty[locale]}</p>
    </div>
  );
}
