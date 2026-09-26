import type { Locale } from '../../config/site';

/**
 * UI words of the guide template (the prose itself lives in the MDX files).
 * Kept out of the shared dictionaries so the guide template can grow without
 * touching them. The Hindi column waits for the owner or the Hindi reviewer
 * (CONTENT_GUIDE.md §10); no Hindi guide is built until then.
 */
const en = {
  writtenBy: 'Written by',
  reviewedBy: 'Reviewed by',
  lastReviewed: 'Last reviewed',
  authorPending: 'author page',
  onThisPage: 'On this page',
  quickFacts: 'Quick facts',
  figureLabel: 'Drawing',
  inlineCtaLive: (line: string) => `Find your ${line} on your own photo`,
  inlineCtaLiveAll: 'See your own lines traced on your photo',
  inlineCtaSoon: 'The free reading on this website opens soon. Until then, see how a reading looks in the sample.',
  inlineCtaSoonLink: 'See the sample reading',
  sourceLabel: 'Source',
  whatWeSee: 'What you see',
  whatTraditionSays: 'What the tradition says',
  whatItCantTell: 'What it can’t tell you',
  myth: 'Myth',
  reality: 'Reality',
  limitsTitle: 'What palmistry can’t tell you',
  limitsBody:
    'Palm lines can’t tell dates, how long you’ll live, your health, whether or when you’ll marry, how many children you’ll have, or how much money you’ll make. Palmistry is a tradition for reflection, not a science.',
  limitsLink: 'Is palmistry real?',
  careLine:
    'If worries about your health or your life feel heavy, you don’t have to carry them alone. In India, call Tele-MANAS on 14416 (free, 24×7). In the US, call or text 988.',
  photoTitle: 'Taking a photo to read your palm',
  photoTips: [
    'Use bright, even daylight, near a window. A single lamp throws shadows that look like extra lines.',
    'Hold your hand flat and open, with the whole palm and the wrist crease in the frame.',
    'Keep the phone straight above your palm and hold still, so the lines stay sharp.',
  ],
  photoCantShow:
    'A phone photo shows the main lines well, and their breaks, branches and forks. Islands, chains, crosses, stars and triangles are too small for most phone cameras, so an honest reading leaves them out.',
  photoCheckerLink: 'Check your photo with the palm photo checker',
  faqTitle: 'Questions people ask',
  sourcesTitle: 'Sources',
  sourcesNote:
    'Meanings on this page are written in our own words from these books. Books whose rights are unclear are used for facts only, never quoted.',
  factsOnly: 'facts only',
  inFrench: 'in French',
  inHindi: 'in Hindi',
  stepOf: (n: number) => `Step ${n} of 7`,
  previousStep: 'Previous step',
  nextStep: 'Next step',
  allSteps: 'All 7 steps: how to read palm lines',
  endTitleLive: 'See your own lines',
  endBodyLive: 'Upload one photo of your palm. We trace your lines and show what palmistry says about each one.',
  endButtonLive: 'Read my palm free',
  endTitleSoon: 'See your own lines',
  endBodySoon:
    'The free reading on this website opens soon. Until then, see how a reading looks in the sample, or read your palm today in our Android app.',
  endButtonSoon: 'See a sample reading',
  relatedTitle: 'Related guides',
  toolCardAction: (name: string) => `Try the ${name.toLowerCase()}`,
};

type GuideStrings = typeof en;

const hi: GuideStrings = {
  writtenBy: 'लेखक',
  reviewedBy: 'जाँच',
  lastReviewed: 'आख़िरी बार जाँचा गया',
  authorPending: 'लेखक पेज',
  onThisPage: 'इस पेज पर',
  quickFacts: 'मुख्य बातें',
  figureLabel: 'चित्र',
  inlineCtaLive: (line: string) => `अपनी फ़ोटो पर अपनी ${line} देखें`,
  inlineCtaLiveAll: 'अपनी फ़ोटो पर अपनी रेखाएं देखें',
  inlineCtaSoon: 'इस वेबसाइट पर मुफ़्त रीडिंग जल्द खुलेगी। तब तक सैंपल में देखें कि रीडिंग कैसी दिखती है।',
  inlineCtaSoonLink: 'सैंपल रीडिंग देखें',
  sourceLabel: 'स्रोत',
  whatWeSee: 'जो दिखता है',
  whatTraditionSays: 'परंपरा क्या कहती है',
  whatItCantTell: 'यह क्या नहीं बता सकती',
  myth: 'भ्रम',
  reality: 'सच',
  limitsTitle: 'हस्तरेखा क्या नहीं बता सकती',
  limitsBody:
    'हाथ की रेखाएं कोई तारीख़, आपकी उम्र, आपकी सेहत, शादी कब होगी, कितने बच्चे होंगे या कितना पैसा आएगा — ये बातें नहीं बता सकतीं। हस्तरेखा खुद को समझने की एक परंपरा है, विज्ञान नहीं।',
  limitsLink: 'क्या हस्तरेखा सच है?',
  careLine: 'अगर सेहत या ज़िंदगी की चिंता भारी लग रही है, तो आज ही किसी से बात करें। भारत में: Tele-MANAS 14416 (मुफ़्त, 24×7)।',
  photoTitle: 'हथेली की फ़ोटो कैसे लें',
  photoTips: [
    'दिन की अच्छी, बराबर रोशनी में, खिड़की के पास फ़ोटो लें। एक लैंप की परछाईं अतिरिक्त रेखा जैसी दिखती है।',
    'हाथ सीधा और खुला रखें — पूरी हथेली और कलाई की रेखा फ़ोटो में आए।',
    'फ़ोन को हथेली के ठीक ऊपर सीधा रखें और हिलाएं नहीं, ताकि रेखाएं साफ़ आएं।',
  ],
  photoCantShow:
    'फ़ोन की फ़ोटो में मुख्य रेखाएं, उनकी टूट, शाखाएं और दो मुखी सिरे अच्छे से दिखते हैं। द्वीप, जंजीर, क्रॉस, तारे और त्रिभुज ज़्यादातर फ़ोन कैमरे में साफ़ नहीं आते, इसलिए ईमानदार रीडिंग इन्हें छोड़ देती है।',
  photoCheckerLink: 'पाम फ़ोटो चेकर से अपनी फ़ोटो जाँचें',
  faqTitle: 'लोग क्या पूछते हैं',
  sourcesTitle: 'स्रोत',
  sourcesNote:
    'इस पेज के अर्थ इन किताबों से हमारे अपने शब्दों में लिखे गए हैं। जिन किताबों के अधिकार साफ़ नहीं हैं, उनसे सिर्फ़ तथ्य लिए गए हैं, उद्धरण नहीं।',
  factsOnly: 'सिर्फ़ तथ्य',
  inFrench: 'फ़्रेंच में',
  inHindi: 'हिंदी में',
  stepOf: (n: number) => `7 में से कदम ${n}`,
  previousStep: 'पिछला कदम',
  nextStep: 'अगला कदम',
  allSteps: 'सभी 7 कदम: हाथ की रेखा कैसे देखें',
  endTitleLive: 'अपनी रेखाएं देखें',
  endBodyLive: 'अपनी हथेली की एक फ़ोटो डालें। हम आपकी रेखाएं बनाते हैं और बताते हैं कि हस्तरेखा हर रेखा के बारे में क्या कहती है।',
  endButtonLive: 'मेरी हथेली मुफ़्त पढ़ें',
  endTitleSoon: 'अपनी रेखाएं देखें',
  endBodySoon:
    'इस वेबसाइट पर मुफ़्त रीडिंग जल्द खुलेगी। तब तक सैंपल में देखें कि रीडिंग कैसी दिखती है, या आज ही हमारे Android ऐप में अपनी हथेली पढ़ें।',
  endButtonSoon: 'सैंपल रीडिंग देखें',
  relatedTitle: 'और गाइड',
  toolCardAction: (name: string) => `${name} आज़माएं`,
};

const strings: Record<Locale, GuideStrings> = { en, hi };

export function guideStrings(locale: Locale): GuideStrings {
  return strings[locale];
}
