/**
 * Every word of sign-in and the account page, English + Hindi
 * (WEB-FEAT-029/062, WEB_AUTH_PLAN.md §3). The reading screen's own words stay
 * in src/lib/reading/copy.ts; the header's in src/i18n/*.ts.
 *
 * Honest by rule (UX_PSYCHOLOGY.md, skill ux-conversion): no count of free
 * readings is written here (they come from the server's balance), prices only
 * from site.ts, "free" always qualified, privacy wording only from
 * SECURITY_PRIVACY.md §2. Hindi: not read by the owner / Hindi reviewer yet.
 */

export const AUTH_COPY = {
  // Google + email, in the reading's sheets and on /account/
  google: { en: 'Continue with Google', hi: 'Google से आगे बढ़ें' },
  orEmail: { en: 'or use your email', hi: 'या अपने ईमेल से' },
  sameAccount: { en: 'Same account works in the PalmSays app.', hi: 'यही अकाउंट PalmSays ऐप में भी चलता है।' },
  agreePrefix: { en: 'By continuing you agree to the', hi: 'आगे बढ़कर आप' },
  terms: { en: 'Terms', hi: 'शर्तों' },
  and: { en: 'and', hi: 'और' },
  privacy: { en: 'Privacy policy', hi: 'प्राइवेसी पॉलिसी' },
  agreeSuffix: { en: '.', hi: 'से सहमत होते हैं।' },
  googleOff: {
    en: "Google sign-in isn't switched on yet. Please use your email instead.",
    hi: 'Google साइन-इन अभी चालू नहीं है। कृपया अपने ईमेल से आगे बढ़ें।',
  },
  googleOffline: { en: 'The internet dropped. Please try Google again.', hi: 'इंटरनेट रुक गया। कृपया Google से फिर कोशिश करें।' },
  googleWait: {
    en: 'Too many tries right now. Please wait a minute and try again.',
    hi: 'अभी बहुत ज़्यादा कोशिशें हुई हैं। एक मिनट रुककर फिर कोशिश करें।',
  },
  googleFailed: {
    en: "Google sign-in didn't finish. Please try again, or use your email.",
    hi: 'Google साइन-इन पूरा नहीं हुआ। फिर कोशिश करें, या ईमेल से आगे बढ़ें।',
  },
  guestNotMoved: {
    en: "You're signed in to your existing account. The reading you made before signing in stays in this browser only. It was not moved into this account.",
    hi: 'आप अपने पहले से बने अकाउंट में साइन इन हो गए। साइन-इन से पहले की गई रीडिंग सिर्फ़ इसी ब्राउज़र में रहेगी। वह इस अकाउंट में नहीं जोड़ी गई।',
  },
  gotIt: { en: 'OK', hi: 'ठीक है' },
  inAppGoogle: {
    en: "Google sign-in doesn't work inside this app's browser. Open this page in Chrome, or use your email below.",
    hi: 'इस ऐप के अंदर वाले ब्राउज़र में Google साइन-इन नहीं चलता। यह पेज Chrome में खोलें, या नीचे ईमेल से आगे बढ़ें।',
  },
  previewGoogle: {
    en: 'Preview: signs in as a sample Google user. Nothing is sent.',
    hi: 'प्रीव्यू: एक नमूना Google यूज़र से साइन इन होता है। कुछ भी भेजा नहीं जाता।',
  },
  previewCode: {
    en: 'Preview: any 6 digits work (000000 shows the wrong-code message).',
    hi: 'प्रीव्यू: कोई भी 6 अंक चलेंगे (000000 पर "गलत कोड" दिखेगा)।',
  },
  signInToReadTitle: { en: 'Sign in to read', hi: 'रीडिंग के लिए साइन इन करें' },
  signInToReadLead: {
    en: 'This browser was signed in to an account before. Sign in again to use your free readings.',
    hi: 'इस ब्राउज़र में पहले एक अकाउंट से साइन इन था। अपनी मुफ़्त रीडिंग के लिए फिर से साइन इन करें।',
  },

  // /account/
  checking: { en: 'Checking your account…', hi: 'आपका अकाउंट देख रहे हैं…' },
  offTitle: { en: 'Sign-in on the website opens soon', hi: 'वेबसाइट पर साइन-इन जल्द खुलेगा' },
  offBody: { en: 'Your PalmSays account already works in our Android app.', hi: 'आपका PalmSays अकाउंट हमारे Android ऐप में पहले से चलता है।' },
  signInTitle: { en: 'Sign in to PalmSays', hi: 'PalmSays में साइन इन करें' },
  signInLead: {
    en: 'Keep your readings in your account and see them on any device.',
    hi: 'अपनी रीडिंग अकाउंट में रखें और किसी भी डिवाइस पर देखें।',
  },
  guestLead: {
    en: 'Sign up to keep the reading you made here in your account and get your next free reading.',
    hi: 'साइन-अप करें: यहां की गई आपकी रीडिंग अकाउंट में रहेगी और अगली मुफ़्त रीडिंग मिलेगी।',
  },
  hello: { en: 'Namaste, {name}', hi: 'नमस्ते, {name}' },
  helloNoName: { en: 'Your account', hi: 'आपका अकाउंट' },
  nameLabel: { en: 'Your name', hi: 'आपका नाम' },
  nameNote: {
    en: 'Used to greet you and in your readings on this website. Kept in this browser only.',
    hi: 'आपको नाम से बुलाने और इस वेबसाइट की रीडिंग में इस्तेमाल होता है। सिर्फ़ इसी ब्राउज़र में रहता है।',
  },
  save: { en: 'Save', hi: 'सेव करें' },
  saved: { en: 'Saved', hi: 'सेव हो गया' },
  emailLabel: { en: 'Email', hi: 'ईमेल' },
  viaGoogle: { en: 'Signed in with Google', hi: 'Google से साइन इन' },
  viaEmail: { en: 'Signed in with an email code', hi: 'ईमेल कोड से साइन इन' },
  freeTitle: { en: 'Free readings on the website', hi: 'वेबसाइट पर मुफ़्त रीडिंग' },
  freeLeftOne: { en: '1 free reading left', hi: '1 मुफ़्त रीडिंग बाकी' },
  freeLeftMany: { en: '{n} free readings left', hi: '{n} मुफ़्त रीडिंग बाकी' },
  moreFrom: { en: 'More readings in the app, plans from {price}/month.', hi: 'और रीडिंग ऐप में, प्लान {price}/महीने से।' },
  freeUsed: {
    en: 'Your free readings on the website are used. Your account is the same in the app.',
    hi: 'वेबसाइट की आपकी मुफ़्त रीडिंग इस्तेमाल हो चुकी हैं। ऐप में भी आपका यही अकाउंट है।',
  },
  planInApp: {
    en: 'You have a plan or readings in the app. Use them in the app; the website gives free readings only.',
    hi: 'ऐप में आपका प्लान या रीडिंग हैं। उन्हें ऐप में इस्तेमाल करें। वेबसाइट पर सिर्फ़ मुफ़्त रीडिंग मिलती हैं।',
  },
  balanceUnknown: { en: "We couldn't check your free readings right now.", hi: 'अभी आपकी मुफ़्त रीडिंग की जानकारी नहीं मिल सकी।' },
  myReadings: { en: 'My readings', hi: 'मेरी रीडिंग' },
  readingsNote: {
    en: 'Saved to your account, not just this browser. The photo stays only on the device where it was taken.',
    hi: 'ये आपके अकाउंट में सेव हैं, सिर्फ़ इस ब्राउज़र में नहीं। फ़ोटो सिर्फ़ उसी डिवाइस पर रहती है जिस पर ली गई थी।',
  },
  noReadings: { en: 'No readings in your account yet.', hi: 'आपके अकाउंट में अभी कोई रीडिंग नहीं है।' },
  readingsError: { en: "We couldn't load your readings. Please try again.", hi: 'आपकी रीडिंग लोड नहीं हो सकीं। कृपया दोबारा कोशिश करें।' },
  hide: { en: 'Hide', hi: 'छिपाएं' },
  cantOpen: { en: "This reading can't be opened here. Open it in the app.", hi: 'यह रीडिंग यहां नहीं खुल सकती। इसे ऐप में खोलें।' },
  fullInApp: { en: 'Open the full report in the app', hi: 'पूरी रिपोर्ट ऐप में खोलें' },
  getApp: { en: 'Get the app', hi: 'ऐप पाएं' },
  signOut: { en: 'Sign out', hi: 'साइन आउट' },
  signOutNote: {
    en: 'Signs out of this browser only. The app on your phone stays signed in.',
    hi: 'सिर्फ़ इस ब्राउज़र से साइन आउट होगा। फ़ोन के ऐप में साइन इन बना रहेगा।',
  },
  deleteAccount: { en: 'Delete my account', hi: 'मेरा अकाउंट हटाएं' },
  signedOut: { en: "You're signed out.", hi: 'आप साइन आउट हो गए।' },
  removeAsk: { en: 'Remove the readings saved in this browser too?', hi: 'क्या इस ब्राउज़र में सेव रीडिंग भी हटानी हैं?' },
  removeYes: { en: 'Remove them', hi: 'हां, हटाएं' },
  removeNo: { en: 'Keep them', hi: 'रहने दें' },
  removed: { en: 'Removed from this browser.', hi: 'इस ब्राउज़र से हटा दी गईं।' },

  // The reading's zero screen: push to the app, honestly
  zeroInApp: {
    en: 'Sign in to the PalmSays app with the same Google account or email: your account is the same there.',
    hi: 'PalmSays ऐप में उसी Google अकाउंट या ईमेल से साइन इन करें: वहां भी यही अकाउंट है।',
  },
  planZero: {
    en: 'You have a plan or readings in the app. Use them there; the website gives free readings only.',
    hi: 'ऐप में आपका प्लान या रीडिंग हैं। उन्हें वहीं इस्तेमाल करें। वेबसाइट पर सिर्फ़ मुफ़्त रीडिंग मिलती हैं।',
  },
} as const;

/** "{name}" / "{n}" / "{price}" in an AUTH_COPY line. */
export function fill(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (whole, key: string) => (key in values ? String(values[key]) : whole));
}

/** A price from site.ts as the site writes it (₹149). */
export function rupeesOf(amount: number): string {
  return `₹${amount}`;
}
