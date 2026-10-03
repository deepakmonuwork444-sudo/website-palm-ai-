/**
 * After the report (owner request 2026-09-27): "Download PDF" (a real PDF made
 * on this device; pdf.ts and jsPDF load only on tap), "WhatsApp" (wa.me with a
 * short warm message and the site's link), the phone's own "Share" where the
 * browser has one, and "Copy link". Shares carry ONLY the message and the
 * link — never the photo, the reading or the details typed here.
 *
 * `gold`: the PDF is the gold action only when the report has no other gold
 * action (one gold per viewport).
 */

import { useState } from 'react';

import type { Locale } from '../../config/site';
import type { PersonalDetails } from '../../lib/reading/personal';
import type { ReportView } from '../../lib/reading/report';
import { SHARE_COPY as S, nativeShareData, siteLink, whatsappUrl } from '../../lib/reading/share';
import type { SavedReading } from '../../lib/reading/store';
import { ChatIcon, CheckIcon, DownloadIcon, LinkIcon, ShareIcon } from './Icons';

type PdfState = 'idle' | 'busy' | 'done' | 'failed';

export default function KeepShare({
  locale,
  reading,
  view,
  details,
  opening,
  gold,
}: {
  locale: Locale;
  reading: SavedReading;
  view: ReportView | null;
  details: PersonalDetails | null;
  opening: string | null;
  gold: boolean;
}) {
  const [pdf, setPdf] = useState<PdfState>('idle');
  const [copy, setCopy] = useState<'idle' | 'done' | 'failed'>('idle');
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const download = async () => {
    if (pdf === 'busy') return;
    setPdf('busy');
    try {
      const { makeReadingPdf, saveFile } = await import('../../lib/reading/pdf');
      const made = await makeReadingPdf({ locale, reading, view, details, opening });
      saveFile(made.blob, made.fileName);
      setPdf('done');
    } catch {
      setPdf('failed');
    }
  };

  const share = async () => {
    try {
      await navigator.share(nativeShareData(locale));
    } catch {
      // Closed without sharing: nothing to say.
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(siteLink(locale));
      setCopy('done');
    } catch {
      setCopy('failed');
    }
  };

  const status = pdf === 'busy' ? S.pdfBusy[locale] : pdf === 'done' ? S.pdfDone[locale] : pdf === 'failed' ? S.pdfFailed[locale] : copy === 'done' ? S.copied[locale] : copy === 'failed' ? S.copyFailed[locale] : '';

  return (
    <section className="rd-keep" aria-labelledby="rd-keep-title">
      <h3 id="rd-keep-title" className="text-h3 font-bold">
        {S.keepTitle[locale]}
      </h3>
      <p className="text-small rd-muted">{S.keepLead[locale]}</p>
      <button type="button" className={gold ? 'btn btn-gold btn-block rd-pdf' : 'btn btn-secondary btn-block rd-pdf'} onClick={() => void download()} aria-busy={pdf === 'busy' || undefined} disabled={pdf === 'busy'}>
        {pdf === 'busy' ? <span className="rd-mini-spin" aria-hidden="true" /> : pdf === 'done' ? <CheckIcon /> : <DownloadIcon />}
        <span>{pdf === 'busy' ? S.pdfBusy[locale] : S.pdf[locale]}</span>
      </button>
      <div className={canShare ? 'rd-share-row rd-share-3' : 'rd-share-row'}>
        <a className="rd-share-btn" href={whatsappUrl(locale)} target="_blank" rel="noopener noreferrer" aria-label={S.whatsappLabel[locale]}>
          <ChatIcon />
          <span>{S.whatsapp[locale]}</span>
        </a>
        {canShare && (
          <button type="button" className="rd-share-btn" onClick={() => void share()} aria-label={S.shareLabel[locale]}>
            <ShareIcon />
            <span>{S.share[locale]}</span>
          </button>
        )}
        <button type="button" className="rd-share-btn" onClick={() => void copyLink()}>
          {copy === 'done' ? <CheckIcon /> : <LinkIcon />}
          <span>{copy === 'done' ? S.copied[locale] : S.copy[locale]}</span>
        </button>
      </div>
      <p className="text-small rd-keep-status" role="status" aria-live="polite">
        {status}
      </p>
    </section>
  );
}
