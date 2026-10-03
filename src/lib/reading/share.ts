/**
 * Sharing after the report (owner request 2026-09-27). What is shared is a
 * short warm message and the site's link — never the photo, the reading, the
 * name or any detail typed on this device. Nothing says "free" (UX rule:
 * "free" is always qualified), nothing promises a prediction.
 */

import { absoluteUrl, type Locale } from '../../config/site';

/** The site's home in the reader's language: https://palmsays.com/ or …/hi/. */
export function siteLink(locale: Locale): string {
  return absoluteUrl(locale === 'hi' ? '/hi/' : '/');
}

export const SHARE_COPY = {
  message: {
    en: 'I just read my palm on PalmSays. It drew my heart, head, life and fate lines on my own photo. See what your lines say:',
    hi: 'मैंने अभी PalmSays पर अपनी हथेली पढ़वाई। इसने मेरी ही फ़ोटो पर हृदय, मस्तिष्क, जीवन और भाग्य रेखा बनाकर दिखाई। अपनी रेखाएं भी देखिए:',
  },
  title: { en: 'PalmSays: palm reading on your own photo', hi: 'PalmSays: आपकी अपनी फ़ोटो पर हस्तरेखा' },
  keepTitle: { en: 'Keep and share', hi: 'सहेजें और शेयर करें' },
  keepLead: {
    en: 'Download your reading as a PDF, with your photo and lines. Sharing sends only a link to PalmSays, never your photo or details.',
    hi: 'अपनी रीडिंग PDF में डाउनलोड करें, आपकी फ़ोटो और रेखाओं के साथ। शेयर करने पर सिर्फ़ PalmSays का लिंक जाता है, आपकी फ़ोटो या जानकारी कभी नहीं।',
  },
  pdf: { en: 'Download PDF', hi: 'PDF डाउनलोड करें' },
  pdfBusy: { en: 'Making your PDF…', hi: 'आपकी PDF बन रही है…' },
  pdfDone: { en: 'Your PDF is downloaded.', hi: 'आपकी PDF डाउनलोड हो गई।' },
  pdfFailed: {
    en: "The PDF couldn't be made in this browser. Please try again, or open this page in Chrome.",
    hi: 'इस ब्राउज़र में PDF नहीं बन सकी। दोबारा कोशिश करें या यह पेज Chrome में खोलें।',
  },
  whatsapp: { en: 'WhatsApp', hi: 'WhatsApp' },
  share: { en: 'Share', hi: 'शेयर' },
  copy: { en: 'Copy link', hi: 'लिंक कॉपी' },
  copied: { en: 'Link copied', hi: 'लिंक कॉपी हो गया' },
  copyFailed: { en: 'Copy did not work. The link is palmsays.com', hi: 'कॉपी नहीं हुआ। लिंक है palmsays.com' },
  whatsappLabel: { en: 'Share PalmSays on WhatsApp', hi: 'WhatsApp पर PalmSays शेयर करें' },
  shareLabel: { en: 'Share PalmSays', hi: 'PalmSays शेयर करें' },
} as const;

/** The whole text sent: the message and the link. */
export function shareText(locale: Locale): string {
  return `${SHARE_COPY.message[locale]} ${siteLink(locale)}`;
}

/** WhatsApp's own share link (opens the app on phones, WhatsApp Web on computers). */
export function whatsappUrl(locale: Locale): string {
  return `https://wa.me/?text=${encodeURIComponent(shareText(locale))}`;
}

/** What the phone's own share sheet gets (navigator.share). */
export function nativeShareData(locale: Locale): ShareData {
  return { title: SHARE_COPY.title[locale], text: SHARE_COPY.message[locale], url: siteLink(locale) };
}
