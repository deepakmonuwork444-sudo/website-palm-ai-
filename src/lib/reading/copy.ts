/**
 * Every word of the reading screen, English + Hindi. Wording comes from
 * UX_PSYCHOLOGY.md §3.2 / §6 / §10 and plan §8.3; privacy wording ONLY from
 * SECURITY_PRIVACY.md §2 (never "sent once", "never stored", "we keep nothing").
 * Numbers never appear here as literals: free readings come from the server's
 * balance, prices from site.ts.
 *
 * [verify] before the flag is switched on (SECURITY_PRIVACY.md §4): provider
 * retention (privacy rows 2 and the upload line), guest deletion (row 3).
 * Hindi: not read by the owner / Hindi reviewer yet (WEB-FEAT-024 rule).
 */

import { site, type Locale } from '../../config/site';
import type { ReadingErrorCode } from './errors';

type Text = Record<Locale, string>;

export const COPY = {
  pageTitle: { en: 'Your palm reading', hi: 'आपकी हस्तरेखा रीडिंग' },
  pickTitle: { en: 'Read my palm', hi: 'मेरी हथेली पढ़ें' },
  pickLead: {
    en: 'Take one photo of your palm. We trace your heart, head, life and fate lines and show what palmistry says about them.',
    hi: 'हथेली की एक फ़ोटो लें। हम आपकी हृदय, मस्तिष्क, जीवन और भाग्य रेखा बनाकर दिखाते हैं कि हस्तरेखा उनके बारे में क्या कहती है।',
  },
  takePhoto: { en: 'Take a palm photo', hi: 'हथेली की फ़ोटो लें' },
  uploadPhoto: { en: 'Upload a palm photo', hi: 'हथेली की फ़ोटो डालें' },
  fromGallery: { en: 'Choose from gallery', hi: 'गैलरी से चुनें' },
  // Desktop only (WEB-DEC-059): the laptop webcam and the "continue on your phone" QR.
  useWebcam: { en: 'Use laptop camera', hi: 'लैपटॉप कैमरा इस्तेमाल करें' },
  phoneQr: {
    en: 'Phone cameras see palm lines better. Scan to continue on your phone.',
    hi: 'फ़ोन का कैमरा हथेली की रेखाएं बेहतर देखता है। अपने फ़ोन पर जारी रखने के लिए स्कैन करें।',
  },
  phoneQrLabel: { en: 'QR code: open this page on your phone', hi: 'QR कोड: यह पेज अपने फ़ोन पर खोलें' },
  tips: {
    en: ['Open palm', 'Good light', 'Whole hand in the frame'],
    hi: ['खुली हथेली', 'अच्छी रोशनी', 'पूरा हाथ फ़्रेम में'],
  },
  mehndi: {
    en: "Mehndi or ink can hide lines. If a line isn't clear, we'll tell you instead of guessing.",
    hi: 'मेहंदी या स्याही से रेखाएं छिप सकती हैं। कोई रेखा साफ़ न दिखे तो हम अंदाज़ा नहीं लगाएंगे, आपको बता देंगे।',
  },
  cameraNote: {
    en: 'Your device may ask to allow the camera. We only take one photo of your palm.',
    hi: 'डिवाइस कैमरे की अनुमति मांग सकता है। हम सिर्फ़ आपकी हथेली की एक फ़ोटो लेते हैं।',
  },
  uploadLine: {
    en: "We analyse your photo and don't store it on any server. A copy stays on this device.",
    hi: 'हम आपकी फ़ोटो जांचते हैं, पर किसी सर्वर पर सेव नहीं करते। एक कॉपी सिर्फ़ इसी डिवाइस पर रहती है।',
  },
  whatHappens: { en: 'What happens to my photo?', hi: 'मेरी फ़ोटो का क्या होता है?' },
  // Explicit consent before any photo is picked (owner 2026-10-04; GDPR art. 6(1)(a), DPDP s. 6). Unticked by
  // default, kept only in the page's memory (never sent or stored). The link opens the privacy policy in a new tab.
  consentBefore: {
    en: `I am ${site.ageRule} or older, and I agree that my palm photo is sent to ${site.brand}'s processors (including servers in the USA) only to create my reading, as described in the `,
    hi: `मेरी उम्र ${site.ageRule} साल या उससे ज़्यादा है, और मैं सहमत हूं कि मेरी हथेली की फ़ोटो सिर्फ़ मेरी रीडिंग बनाने के लिए ${site.brand} के प्रोसेसर (अमेरिका के सर्वर भी) को भेजी जाए, जैसा `,
  },
  consentLink: { en: 'Privacy Policy', hi: 'प्राइवेसी पॉलिसी (English)' },
  consentAfter: { en: '.', hi: ' में बताया गया है।' },
  newTab: { en: '(opens in a new tab)', hi: '(नए टैब में खुलता है)' },
  consentHint: { en: 'Tick the box above to choose a photo.', hi: 'फ़ोटो चुनने के लिए ऊपर का बॉक्स चुनें।' },
  privacyRows: {
    en: [
      'Before anything is sent, your browser makes the photo smaller and removes hidden data such as your location.',
      "Two small copies go through our server to two services. Modal (USA) traces your lines. Cloudflare Workers AI reads your palm's features. Neither stores the photo.",
      "We save your traced line points, 21 points that mark your hand's shape, and your written reading to your account — not the photo. You can delete them any time on the Account page.",
      'A copy of the photo stays in this browser so you can see your reading again. Clearing browser data removes it.',
      "If you sign up, we keep a one-way code of your email so the free reading can't be repeated — even after you delete your account.",
      'A quick Cloudflare check (Turnstile) stops bots. Page statistics come from Cloudflare Web Analytics, with no cookies.',
    ],
    hi: [
      'कुछ भी भेजने से पहले आपका ब्राउज़र फ़ोटो छोटी करता है और उसमें छिपी जानकारी (जैसे लोकेशन) हटा देता है।',
      'फ़ोटो की दो छोटी कॉपी हमारे सर्वर से होकर दो सेवाओं तक जाती हैं: Modal (अमेरिका) आपकी रेखाएं बनाता है, Cloudflare Workers AI हथेली की बनावट पढ़ता है। दोनों में से कोई फ़ोटो सेव नहीं करता।',
      'हम आपके अकाउंट में रेखाओं के बिंदु, हाथ की बनावट के 21 बिंदु और आपकी लिखी रीडिंग सेव करते हैं — फ़ोटो नहीं। इन्हें आप कभी भी Account पेज से हटा सकते हैं।',
      'फ़ोटो की एक कॉपी इसी ब्राउज़र में रहती है ताकि आप अपनी रीडिंग दोबारा देख सकें। ब्राउज़र का डेटा साफ़ करने पर यह हट जाती है।',
      'साइन-अप करने पर हम आपके ईमेल का एक एकतरफ़ा कोड रखते हैं ताकि मुफ़्त रीडिंग दोबारा न ली जा सके — अकाउंट हटाने के बाद भी।',
      'बॉट रोकने के लिए Cloudflare की एक छोटी जांच (Turnstile) होती है। पेज के आंकड़े Cloudflare Web Analytics से आते हैं, बिना कुकी के।',
    ],
  },
  noPayment: { en: 'We never ask for card or UPI on this website.', hi: 'इस वेबसाइट पर हम कभी कार्ड या UPI नहीं मांगते।' },
  freePromise: {
    en: 'Each free reading shows Love and Personality in full, plus the first sentence of Career & Money and Life Direction. The full reading is in our Android app (paid).',
    hi: 'हर मुफ़्त रीडिंग में प्यार और स्वभाव पूरा, और करियर-पैसा व जीवन की दिशा का पहला वाक्य। पूरी रीडिंग हमारे Android ऐप में है (पैसे वाली)।',
  },

  // Review
  checking: { en: 'Checking your photo on this device…', hi: 'इसी डिवाइस पर आपकी फ़ोटो जांच रहे हैं…' },
  checkPassed: { en: 'Photo looks good.', hi: 'फ़ोटो ठीक है।' },
  failedFree: {
    en: "This photo didn't work, and it didn't use up your free reading.",
    hi: 'यह फ़ोटो काम नहीं आई, और आपकी मुफ़्त रीडिंग ख़र्च नहीं हुई।',
  },
  whichHand: { en: 'Which hand is this?', hi: 'यह कौन सा हाथ है?' },
  whichHandTip: {
    en: 'Most people start with the hand they write with.',
    hi: 'ज़्यादातर लोग उस हाथ से शुरू करते हैं जिससे लिखते हैं।',
  },
  left: { en: 'Left', hi: 'बायां' },
  right: { en: 'Right', hi: 'दायां' },
  writeHand: { en: 'Is this the hand you write with?', hi: 'क्या इसी हाथ से आप लिखते हैं?' },
  yes: { en: 'Yes', hi: 'हां' },
  no: { en: 'No', hi: 'नहीं' },
  usePhoto: { en: 'Use this photo', hi: 'यह फ़ोटो इस्तेमाल करें' },
  retake: { en: 'Retake', hi: 'दोबारा लें' },

  // Working (real stages only, plan §8.1)
  stages: {
    checked: { en: 'Photo checked', hi: 'फ़ोटो जांच ली' },
    gating: { en: 'Quick safety check', hi: 'छोटी सुरक्षा जांच' },
    sending: { en: 'Sending securely', hi: 'सुरक्षित भेज रहे हैं' },
    tracing: { en: 'Tracing your lines', hi: 'आपकी रेखाएं बना रहे हैं' },
    found: { en: 'Lines found', hi: 'रेखाएं मिल गईं' },
    reading: { en: 'Reading your palm', hi: 'आपकी हथेली पढ़ रहे हैं' },
    writing: { en: 'Writing your reading', hi: 'आपकी रीडिंग लिख रहे हैं' },
    done: { en: 'Done', hi: 'हो गया' },
    ready: { en: 'Your reading is ready', hi: 'आपकी रीडिंग तैयार है' },
  },
  slow: {
    en: 'Taking longer than usual. Your internet may be slow. You can wait, or try again.',
    hi: 'आज थोड़ा ज़्यादा समय लग रहा है। शायद इंटरनेट धीमा है। रुकें, या दोबारा कोशिश करें।',
  },
  tryAgain: { en: 'Try again', hi: 'दोबारा कोशिश करें' },

  // Live scan over the photo (WEB-DEC-043): the app's own words, in short.
  skipToReading: { en: 'Skip to my reading', hi: 'सीधे मेरी रीडिंग देखें' },
  scanPhotoLabel: { en: 'Your palm photo being scanned', hi: 'आपकी हथेली की फ़ोटो स्कैन हो रही है' },
  samplePhotoLabel: { en: 'A sample palm photo being scanned', hi: 'एक नमूना हथेली की फ़ोटो स्कैन हो रही है' },
  scanWords: [
    { en: 'Finding your fingers…', hi: 'आपकी उंगलियां खोजी जा रही हैं…' },
    { en: 'Measuring your palm…', hi: 'आपकी हथेली नापी जा रही है…' },
    { en: 'Looking for your lines…', hi: 'आपकी रेखाएं खोजी जा रही हैं…' },
  ],
  readWords: [
    { en: 'Reading your palm…', hi: 'आपकी हथेली पढ़ी जा रही है…' },
    { en: 'Reading line depth and length…', hi: 'रेखाओं की गहराई और लंबाई पढ़ी जा रही है…' },
    { en: 'Matching with the books…', hi: 'किताबों से मिलान हो रहा है…' },
  ],
  handFound: {
    left: { en: 'Found your left hand', hi: 'आपका बायां हाथ मिला' },
    right: { en: 'Found your right hand', hi: 'आपका दायां हाथ मिला' },
  },
  /** "{line}" is the line's name (COPY.lines). */
  lineTraced: { en: '{line} traced', hi: '{line} मिली' },
  lineTracedFaint: { en: '{line} traced, faint in this photo', hi: '{line} मिली, इस फ़ोटो में हल्की' },
  tourLine: { en: 'Reading your {line}…', hi: 'आपकी {line} पढ़ी जा रही है…' },
  tourPalm: { en: 'Reading your whole palm…', hi: 'पूरी हथेली पढ़ी जा रही है…' },
  opening: { en: 'Opening your report…', hi: 'आपकी रिपोर्ट खुल रही है…' },

  // Report
  yourPalm: { en: 'Your palm', hi: 'आपकी हथेली' },
  atGlance: { en: 'Your palm at a glance', hi: 'एक नज़र में आपकी हथेली' },
  notClear: { en: 'not clearly seen', hi: 'साफ़ नहीं दिखी' },
  notClearLine: {
    en: "isn't clear in this photo. We didn't guess.",
    hi: 'इस फ़ोटो में साफ़ नहीं दिखी। हमने अंदाज़ा नहीं लगाया।',
  },
  partsRead: { en: "You've read 2 of 4 parts.", hi: 'आपने 4 में से 2 हिस्से पढ़ लिए।' },
  locked: { en: 'In the app', hi: 'ऐप में' },
  tapToOpen: { en: 'Tap to see how to open it', hi: 'खोलने का तरीका देखें' },
  selfCheck: { en: 'Look at your own hand now. Can you see this?', hi: 'अब अपना हाथ देखिए। क्या आपको यह दिख रहा है?' },
  honesty: {
    en: 'Palmistry is an old tradition, not a science. We show what the tradition says about your lines, not your future.',
    hi: 'हस्तरेखा एक पुरानी परंपरा है, विज्ञान नहीं। हम बताते हैं कि परंपरा आपकी रेखाओं के बारे में क्या कहती है, आपका भविष्य नहीं।',
  },
  signupCta: { en: 'Sign up to read one more palm free', hi: 'साइन-अप करें और एक और हथेली मुफ़्त पढ़ें' },
  fullInApp: { en: 'See the full reading in the app', hi: 'पूरी रीडिंग ऐप में देखें' },
  anotherPalm: { en: 'Read another palm', hi: 'एक और हथेली पढ़ें' },
  otherHandTeaser: {
    en: 'Many palm readers say the hand you don\'t write with shows what you were born with, and your writing hand shows what you\'ve made of it.',
    hi: 'कई हस्तरेखा जानकार मानते हैं कि जिस हाथ से आप नहीं लिखते, वह जन्म का स्वभाव दिखाता है, और लिखने वाला हाथ बताता है कि आपने उसे कैसे जिया।',
  },
  savedHere: {
    en: 'Saved in this browser. Clearing browser data removes it.',
    hi: 'इसी ब्राउज़र में सेव है। ब्राउज़र का डेटा साफ़ करने पर यह हट जाएगी।',
  },
  previewLabel: {
    en: 'Preview mode: these lines are drawn on a sample palm, not on your photo. Nothing was sent.',
    hi: 'प्रीव्यू: ये रेखाएं एक नमूना हथेली पर बनी हैं, आपकी फ़ोटो पर नहीं। कुछ भी भेजा नहीं गया।',
  },
  // The report photo (like the app's): pick one line, or all.
  allLines: { en: 'All lines', hi: 'सभी रेखाएं' },
  linesOnPhoto: { en: 'Lines on the photo', hi: 'फ़ोटो पर रेखाएं' },
  photoHint: {
    en: 'Tap a line or its name to see it on its own. Dashed lines were harder to see.',
    hi: 'किसी रेखा या उसके नाम पर टैप करें, वह अलग से दिखेगी। डैश वाली रेखाएं कम साफ़ दिखीं।',
  },

  // Lock sheet
  lockRest: { en: 'The rest of this part is in the app.', hi: 'इस हिस्से का बाकी भाग ऐप में है।' },
  appPromise: {
    en: 'In the app: all 4 parts of your reading, your lines traced on your photo, compare both hands, short lessons and a quiz, save as PDF or share card, Hindi and English, no ads.',
    hi: 'ऐप में: रीडिंग के चारों हिस्से, फ़ोटो पर आपकी रेखाएं, दोनों हाथों की तुलना, छोटे पाठ और क्विज़, PDF या शेयर कार्ड, हिंदी और English, कोई विज्ञापन नहीं।',
  },
  continuity: {
    en: "In the app you'll take a fresh photo. It takes about a minute. Your web readings stay in this browser.",
    hi: 'ऐप में एक नई फ़ोटो लेनी होगी। करीब एक मिनट लगता है। वेबसाइट की रीडिंग इसी ब्राउज़र में रहेंगी।',
  },
  sameEmail: { en: 'Use the same email in the app.', hi: 'ऐप में वही ईमेल इस्तेमाल करें।' },
  notNow: { en: 'Not now', hi: 'अभी नहीं' },
  close: { en: 'Close', hi: 'बंद करें' },

  // Sign-up sheet
  signupTitle: { en: 'Get 1 more free reading', hi: 'एक और मुफ़्त रीडिंग पाएं' },
  signupLead: {
    en: "Sign up with your email. We'll email you a 6-digit code. No password needed.",
    hi: 'अपने ईमेल से साइन-अप करें। हम आपको 6 अंकों का कोड ईमेल करेंगे। कोई पासवर्ड नहीं चाहिए।',
  },
  signupNotUnlock: {
    en: "Signing up gives you a new reading. It doesn't open the locked parts of this one.",
    hi: 'साइन-अप करने से एक नई रीडिंग मिलती है। इस रीडिंग के बंद हिस्से नहीं खुलते।',
  },
  emailsWeSend: { en: 'We only email you about your account.', hi: 'हम आपको सिर्फ़ आपके अकाउंट से जुड़े ईमेल भेजेंगे।' },
  deleteAnytime: {
    en: 'Delete your account anytime on the Account page.',
    hi: 'अपना अकाउंट कभी भी Account पेज पर जाकर हटा सकते हैं।',
  },
  adults: { en: 'Readings are for people 18+.', hi: 'रीडिंग 18+ उम्र के लोगों के लिए है।' },
  emailLabel: { en: 'Your email', hi: 'आपका ईमेल' },
  sendCode: { en: 'Send my code', hi: 'मेरा कोड भेजें' },
  codeLabel: { en: 'The 6-digit code from the email', hi: 'ईमेल में आया 6 अंकों का कोड' },
  codeSent: {
    en: 'We sent a 6-digit code to this email. It can take a minute to arrive, so check Spam too.',
    hi: 'इस ईमेल पर 6 अंकों का कोड भेजा गया है। आने में एक मिनट लग सकता है, इसलिए Spam फ़ोल्डर भी देखें।',
  },
  verify: { en: 'Verify', hi: 'पुष्टि करें' },
  badEmail: { en: 'Type a full email address, like name@gmail.com.', hi: 'पूरा ईमेल पता लिखें, जैसे name@gmail.com.' },
  badCode: { en: 'Type the 6 digits from the email.', hi: 'ईमेल में आए 6 अंक लिखें।' },
  wrongCode: {
    en: 'That code did not work. It may be mistyped or too old. Check it, or send a new one.',
    hi: 'यह कोड काम नहीं किया। शायद गलत लिखा गया या पुराना हो गया। जाँचें, या नया कोड भेजें।',
  },
  emailTaken: {
    en: 'This email already has an account. Sign in with a code instead.',
    hi: 'इस ईमेल से पहले से अकाउंट है। कोड से साइन-इन करें।',
  },
  signInCode: { en: 'Sign in with a code', hi: 'कोड से साइन-इन करें' },
  takenNote: {
    en: 'Your first reading stays in this browser. That account\'s own free readings apply.',
    hi: 'आपकी पहली रीडिंग इसी ब्राउज़र में रहेगी। उस अकाउंट की अपनी मुफ़्त रीडिंग लागू होंगी।',
  },
  waitCode: { en: 'Please wait a minute before asking for another code.', hi: 'नया कोड माँगने से पहले एक मिनट रुकें।' },
  codesOff: { en: 'Email codes are not switched on yet. Please try again later.', hi: 'ईमेल कोड अभी चालू नहीं हैं। कृपया बाद में कोशिश करें।' },
  sendAgain: { en: 'Send the code again', hi: 'कोड दोबारा भेजें' },

  // Before the last free reading
  lastTitle: { en: 'This is your 2nd and last free reading on this website.', hi: 'यह वेबसाइट पर आपकी दूसरी और आख़िरी मुफ़्त रीडिंग है।' },
  lastFree: { en: 'This is your last free reading on this website.', hi: 'यह वेबसाइट पर आपकी आख़िरी मुफ़्त रीडिंग है।' },
  otherHand: { en: 'Take a photo of my other hand', hi: 'मेरे दूसरे हाथ की फ़ोटो लें' },

  // Zero readings
  zeroTitle: { en: "You've used both free readings on this website", hi: 'आपने वेबसाइट की दोनों मुफ़्त रीडिंग इस्तेमाल कर लीं' },
  zeroLead: {
    en: "Thank you for trying it. Your readings are saved in this browser. Clearing browser data removes them.",
    hi: 'आज़माने के लिए धन्यवाद। आपकी रीडिंग इसी ब्राउज़र में सेव हैं। ब्राउज़र का डेटा साफ़ करने पर ये हट जाएंगी।',
  },
  wantFull: {
    en: 'Want the full reading? The Android app has all 4 parts.',
    hi: 'पूरी रीडिंग चाहिए? Android ऐप में चारों हिस्से हैं।',
  },
  keepLearning: { en: 'Not now? Keep learning free with the guides and tools.', hi: 'अभी नहीं? गाइड और टूल से मुफ़्त में सीखते रहें।' },
  removeHere: { en: 'Remove from this browser', hi: 'इस ब्राउज़र से हटाएं' },
  yourReadings: { en: 'Your readings in this browser', hi: 'इस ब्राउज़र में आपकी रीडिंग' },
  open: { en: 'Open', hi: 'खोलें' },
  readingN: { en: 'Reading', hi: 'रीडिंग' },
  leftHand: { en: 'Left hand', hi: 'बायां हाथ' },
  rightHand: { en: 'Right hand', hi: 'दायां हाथ' },
  backToReadings: { en: 'All my readings', hi: 'मेरी सभी रीडिंग' },

  // Off / not configured
  offTitle: { en: 'The free web reading opens soon', hi: 'मुफ़्त वेब रीडिंग जल्द खुलेगी' },
  offBody: {
    en: 'Until then, the full palm reading is in our Android app.',
    hi: 'तब तक पूरी हस्तरेखा रीडिंग हमारे Android ऐप में है।',
  },
  inApp: {
    en: 'For the best result, open this page in Chrome.',
    hi: 'सबसे अच्छे नतीजे के लिए यह पेज Chrome में खोलें।',
  },
  copyLink: { en: 'Copy link', hi: 'लिंक कॉपी करें' },
  copied: { en: 'Link copied', hi: 'लिंक कॉपी हो गया' },
  easierOnPhone: {
    en: 'Easier on your phone: scan this code to open this page there.',
    hi: 'फ़ोन पर आसान है: यह कोड स्कैन करें और यही पेज फ़ोन पर खोलें।',
  },
  lines: {
    heart: { en: 'Heart line', hi: 'हृदय रेखा' },
    head: { en: 'Head line', hi: 'मस्तिष्क रेखा' },
    life: { en: 'Life line', hi: 'जीवन रेखा' },
    fate: { en: 'Fate line', hi: 'भाग्य रेखा' },
  },
  /** Short names for the labels on the photo (the app's short names). */
  linesShort: {
    heart: { en: 'Heart', hi: 'हृदय' },
    head: { en: 'Head', hi: 'मस्तिष्क' },
    life: { en: 'Life', hi: 'जीवन' },
    fate: { en: 'Fate', hi: 'भाग्य' },
  },
} as const;

/** Error copy (plan §8.3, UX_PSYCHOLOGY.md §10). `usedNothing` is said only when the server says so. */
export const ERROR_COPY: Record<ReadingErrorCode, { title: Text; body: Text }> = {
  no_readings_left: {
    title: { en: 'No free readings left here', hi: 'यहां मुफ़्त रीडिंग नहीं बची' },
    body: { en: 'The full reading is in our Android app.', hi: 'पूरी रीडिंग हमारे Android ऐप में है।' },
  },
  needs_email_verification: {
    title: { en: 'Sign up to continue free', hi: 'मुफ़्त जारी रखने के लिए साइन-अप करें' },
    body: { en: 'Enter the 6-digit code we emailed you.', hi: 'हमने जो 6 अंकों का कोड ईमेल किया है, उसे डालें।' },
  },
  invalid_session: {
    title: { en: 'Something went wrong on our side', hi: 'हमारी तरफ़ से कुछ गड़बड़ हुई' },
    body: { en: 'Something went wrong on our side. Please try again.', hi: 'हमारी तरफ़ से कुछ गड़बड़ हुई। कृपया दोबारा कोशिश करें।' },
  },
  image_too_large: {
    title: { en: 'This photo is too large', hi: 'यह फ़ोटो बहुत बड़ी है' },
    body: { en: 'Please take a new photo or choose a smaller one.', hi: 'कृपया नई फ़ोटो लें या छोटी फ़ोटो चुनें।' },
  },
  not_a_palm: {
    title: { en: "We couldn't find a palm", hi: 'हथेली नहीं मिली' },
    body: {
      en: "We couldn't find a palm in this photo. Show your open palm, fingers together, in good light.",
      hi: 'इस फ़ोटो में हथेली नहीं मिली। खुली हथेली, उंगलियां साथ, अच्छी रोशनी में फ़ोटो लें।',
    },
  },
  daily_capacity_reached: {
    title: { en: "Today's free readings are used up", hi: 'आज की मुफ़्त रीडिंग ख़त्म' },
    body: {
      en: "Today's free readings on the website are used up. Please try again tomorrow, or continue in the app.",
      hi: 'आज वेबसाइट की मुफ़्त रीडिंग ख़त्म हो गईं। कल फिर कोशिश करें, या ऐप में जारी रखें।',
    },
  },
  too_many_attempts: {
    title: { en: 'Too many tries', hi: 'बहुत ज़्यादा कोशिशें' },
    body: {
      en: 'Too many tries from this network right now. Please try again later.',
      hi: 'इस नेटवर्क से अभी बहुत ज़्यादा कोशिशें हुई हैं। थोड़ी देर बाद कोशिश करें।',
    },
  },
  rate_limited: {
    title: { en: 'Too many tries', hi: 'बहुत ज़्यादा कोशिशें' },
    body: {
      en: 'Too many tries from this network right now. Please try again later.',
      hi: 'इस नेटवर्क से अभी बहुत ज़्यादा कोशिशें हुई हैं। थोड़ी देर बाद कोशिश करें।',
    },
  },
  scanner_unavailable: {
    title: { en: 'Our line scanner is busy', hi: 'रेखा स्कैनर व्यस्त है' },
    body: { en: 'Our line scanner is busy. Please try again in a few minutes.', hi: 'हमारा रेखा स्कैनर अभी व्यस्त है। कुछ मिनट बाद कोशिश करें।' },
  },
  service_paused: {
    title: { en: "Today's free readings are used up", hi: 'आज की मुफ़्त रीडिंग ख़त्म' },
    body: {
      en: "Today's free readings on the website are used up. Please try again tomorrow, or continue in the app.",
      hi: 'आज वेबसाइट की मुफ़्त रीडिंग ख़त्म हो गईं। कल फिर कोशिश करें, या ऐप में जारी रखें।',
    },
  },
  offline: {
    title: { en: "You're offline", hi: 'आप ऑफ़लाइन हैं' },
    body: { en: "You're offline. We'll continue when you're back.", hi: 'आप ऑफ़लाइन हैं। इंटरनेट आते ही हम आगे बढ़ेंगे।' },
  },
  turnstile: {
    title: { en: 'Safety check did not finish', hi: 'सुरक्षा जांच पूरी नहीं हुई' },
    body: {
      en: "We couldn't complete a quick safety check. Check your connection and try again.",
      hi: 'एक छोटी सुरक्षा जांच पूरी नहीं हो सकी। इंटरनेट देखें और दोबारा कोशिश करें।',
    },
  },
  web_pass_required: {
    title: { en: 'Safety check did not finish', hi: 'सुरक्षा जांच पूरी नहीं हुई' },
    body: {
      en: "We couldn't complete a quick safety check. Check your connection and try again.",
      hi: 'एक छोटी सुरक्षा जांच पूरी नहीं हो सकी। इंटरनेट देखें और दोबारा कोशिश करें।',
    },
  },
  unauthenticated: {
    title: { en: 'Something went wrong on our side', hi: 'हमारी तरफ़ से कुछ गड़बड़ हुई' },
    body: { en: 'Something went wrong on our side. Please try again.', hi: 'हमारी तरफ़ से कुछ गड़बड़ हुई। कृपया दोबारा कोशिश करें।' },
  },
  not_configured: {
    title: { en: 'The web reading is not open yet', hi: 'वेब रीडिंग अभी खुली नहीं है' },
    body: { en: 'Until then, the full palm reading is in our Android app.', hi: 'तब तक पूरी हस्तरेखा रीडिंग हमारे Android ऐप में है।' },
  },
  heic: {
    title: { en: "This photo type doesn't open here", hi: 'यह फ़ोटो यहां नहीं खुल रही' },
    body: {
      en: "This photo type (HEIC) doesn't open here. Take a new photo with your phone, or upload a JPG.",
      hi: 'यह फ़ोटो (HEIC) यहां नहीं खुल रही। फ़ोन से नई फ़ोटो लें या JPG फ़ोटो डालें।',
    },
  },
  decode: {
    title: { en: "This photo didn't open", hi: 'यह फ़ोटो नहीं खुली' },
    body: { en: 'Take a new photo with your phone, or upload a JPG.', hi: 'फ़ोन से नई फ़ोटो लें या JPG फ़ोटो डालें।' },
  },
  server: {
    title: { en: 'Something went wrong on our side', hi: 'हमारी तरफ़ से कुछ गड़बड़ हुई' },
    body: { en: 'Something went wrong on our side. Please try again.', hi: 'हमारी तरफ़ से कुछ गड़बड़ हुई। कृपया दोबारा कोशिश करें।' },
  },
};

export function tr(text: Text, locale: Locale): string {
  return text[locale];
}
