/**
 * English UI strings. `hi.ts` must provide every key (the `Dictionary` type
 * enforces it). Privacy and trust sentences come word for word from
 * SECURITY_PRIVACY.md §2 / UX_PSYCHOLOGY.md; prices and names come from site.ts.
 */

const rupees = (value: number) => `₹${value}`;

export const en = {
  meta: {
    homeTitleLive: 'Free AI Palm Reading Online – See Your Lines on Your Photo',
    homeDescriptionLive:
      'Upload or snap a palm photo and see your heart, head, life and fate lines traced on your own hand. First reading free, no email. No fake predictions.',
    homeTitleSoon: 'AI Palm Reading That Traces Your Real Lines | PalmSays',
    homeDescriptionSoon:
      'See how PalmSays traces the heart, head, life and fate lines on a palm, with a sample reading. Free web reading opens soon; the Android app works today.',
    appTitle: 'PalmSays: Palm Reading App for Android (Free to Start)',
    appDescription:
      'Scan your palm with your phone camera, see your lines traced and read what they mean. Free to start on Android. What’s free, what’s paid, and your privacy.',
    notFoundTitle: 'Page not found | PalmSays',
    notFoundDescription: 'This page does not exist. Go to the PalmSays home page or read about the lines on your palm.',
  },
  a11y: {
    skipToContent: 'Skip to content',
    mainNav: 'Main',
    footerNav: 'Footer',
    breadcrumb: 'Breadcrumb',
  },
  nav: {
    home: 'Home',
    howItWorks: 'How it works',
    sample: 'Sample reading',
    app: 'App',
    guides: 'Guides',
    tools: 'Tools',
    menu: 'Menu',
    close: 'Close',
    readMyPalm: 'Read my palm',
    trySample: 'Try a sample hand',
    getApp: 'Get the app',
  },
  lang: {
    /** Label of the switch on this page: the other language, in its own script. */
    switchTo: 'हिंदी',
    switchToShort: 'अ',
    switchAria: 'हिंदी में पढ़ें (Read in Hindi)',
  },
  theme: {
    day: 'Day',
    night: 'Night',
    toggleAria: 'Day theme',
  },
  lines: {
    life: {
      name: 'Life line',
      where: 'Curves around the base of the thumb.',
      reads: 'Palmistry reads it for energy and how you meet change — not for how long you live.',
    },
    head: {
      name: 'Head line',
      where: 'Runs across the middle of the palm.',
      reads: 'Read for how you think, learn and decide.',
    },
    heart: {
      name: 'Heart line',
      where: 'The top line, just under the fingers.',
      reads: 'Read for how you love and show feeling.',
    },
    fate: {
      name: 'Fate line',
      where: 'Runs up the middle of the palm toward the middle finger.',
      reads: 'Read for work and life direction. Many hands have no clear fate line — that is common.',
    },
    notClearlySeen: 'not clearly seen',
    guideLink: (name: string) => `Read the ${name.toLowerCase()} guide`,
  },
  palm: {
    diagramAlt: 'A drawn palm with the life, head, heart and fate lines traced in colour.',
    diagramCaption: 'A drawn palm showing the four main lines. Your reading is made from your own photo.',
    sampleAlt: 'The sample palm with the life, head and heart lines traced. The fate line was not clearly seen, so it is not drawn.',
    foundLines: 'Lines shown:',
    missingLines: 'Not clearly seen:',
  },
  store: {
    badgeAlt: 'Get it on Google Play',
    freeToInstall: 'Free to install',
    plansFrom: (price: number) => `Plans from ${rupees(price)}/month`,
    packsFrom: (price: number) => `Packs from ${rupees(price)}, one-time`,
    cancelAnytime: 'Cancel plans anytime in Google Play',
    size: (mb: number) => `About ${mb} MB`,
    noAds: 'No ads',
    onlyPlay: 'Only from Google Play — never an APK file.',
    playName: (name: string) => `On Google Play the app is called ${name} for now — it is the same app.`,
    iphoneNote: 'The iPhone app isn’t ready yet. You can keep using this website.',
    qrCaption: 'Scan with your phone camera',
    remoteInstall: 'Or press Install on Google Play here — the app goes straight to your phone (same Google account).',
    priceLabel: 'App price',
  },
  home: {
    h1Live: 'Free AI palm reading — see your own lines traced on your photo',
    h1Soon: 'AI palm reading that traces your real lines',
    lead: 'Take one photo of your palm. We trace your heart, head, life and fate lines and show what palmistry says about each one.',
    leadSoon: 'The free reading on this website opens soon. Until then, try a sample hand here, or use our Android app today.',
    card: {
      title: 'Read your palm',
      status: 'The free web reading opens soon.',
      statusDetail: 'Nothing is uploaded from this page yet.',
      ownPalm: 'Read my own palm',
      ownPalmBody:
        'Your own reading isn’t open on this website yet. You can read your palm today in our Android app — it traces your lines on your own photo.',
      moreAboutApp: 'More about the app',
    },
    chips: {
      noPayment: 'No payment on this site',
      bilingual: 'Hindi and English',
    },
    sample: {
      title: 'See a sample reading',
      badge: 'Sample',
      intro:
        'This sample uses a drawn palm, not anyone’s real hand. It shows how a reading looks: the lines on the photo, what the scan saw, and what palmistry says.',
      glanceTitle: 'At a glance',
      glance: [
        'You tend to lead with warmth in close relationships.',
        'You think in pictures and possibilities before plans.',
        'Your energy goes outward — to people and activity.',
      ],
      sawLabel: 'What the scan saw',
      saysLabel: 'What palmistry says',
      parts: {
        love: {
          title: 'Love',
          saw: 'The heart line curves up toward the first finger.',
          says: 'In palmistry this is read as warm, open-hearted affection.',
          source: 'Cheiro, Cheiro’s Language of the Hand (1897)',
        },
        personality: {
          title: 'Personality',
          saw: 'The head line is long and slopes gently toward the edge of the palm. The life line curves wide around the thumb.',
          says: 'Palmistry reads this as an imaginative mind that reaches for possibilities first, and energy spent outward on people and activity.',
          source: 'William G. Benham, The Laws of Scientific Hand Reading (1900)',
        },
        career: {
          title: 'Career & Money',
          firstSentence: 'Your head line suggests you do your best work when you can shape ideas your own way.',
        },
        direction: {
          title: 'Life Direction',
          firstSentence: 'The fate line wasn’t clear in this photo, so this part leans on your head and life lines.',
        },
      },
      readCount: 'You’ve read 2 of 4 parts.',
      lockNote:
        'In a free reading, Love and Personality open in full, and Career & Money and Life Direction show their first sentence. The full reading is in our Android app.',
      notClearTitle: 'Fate line: not clearly seen',
      notClearBody: 'We don’t guess. A clearer photo in good light usually helps — and many hands simply have no clear fate line.',
      honesty: 'Palmistry is an old tradition, not a science. We show what the tradition says about your lines — not your future.',
    },
    free: {
      title: 'What’s free, and what’s in the app',
      webTitle: 'On this website',
      web: [
        'A sample reading — free, no sign-up',
        'Soon: a free reading of your own palm, right here',
      ],
      noCard: 'We never ask for card or UPI on this website.',
      appTitle: 'In our Android app',
      app: [
        'Scan your palm with your phone camera',
        'All 4 parts of your reading, with your lines traced on your photo',
        'Hindi and English, no ads',
      ],
    },
    how: {
      title: 'How the palm reading works',
      steps: [
        { title: 'Take a photo of your palm', body: 'Open palm, good light, the whole hand in the frame.' },
        {
          title: 'We find and trace your lines',
          body: 'Our AI finds your heart, head, life and fate lines and draws them on your photo. If a line isn’t clear, we say so instead of guessing.',
        },
        {
          title: 'Read what palmistry says',
          body: 'The meanings come from classical palmistry books — the source is under each one.',
        },
      ],
      soonNote: 'On this website this opens soon. In the Android app it works today.',
    },
    learn: {
      title: 'The four main lines on your palm',
      intro: 'Most palm readings start with these four lines. Here is where each one sits and what the tradition reads in it.',
    },
    app: {
      title: 'Our Android app',
      body: 'Scan your palm with your phone camera and get the full reading in Hindi or English.',
    },
  },
  locked: {
    open: 'Open in the app',
    lockedLabel: 'Locked part',
  },
  appPage: {
    h1: 'Palm reading app for Android that traces your real lines',
    lead: 'Scan your palm with your phone camera. The app traces your heart, head, life and fate lines on your own photo and shows what palmistry says about each.',
    getTitle: 'Get the app',
    continuity: 'In the app you’ll take a fresh photo of your palm.',
    doesTitle: 'What the app does',
    does: [
      'Traces your heart, head, life and fate lines on your own palm photo',
      'Tells you when a line isn’t clear, instead of guessing',
      'Explains what palmistry says about each line, with the book it comes from',
      'Works in Hindi and English, with no ads',
    ],
    priceTitle: 'What’s free and what’s paid',
    price: {
      freeReadings: 'Free readings to start. The app shows what a free reading includes before you begin.',
      plans: (price: number) => `Plans from ${rupees(price)}/month. They renew until you cancel in Google Play.`,
      packs: (price: number) => `Packs from ${rupees(price)}. One-time, and the readings never expire.`,
      payment: 'Google Play handles payment. We never see your card or UPI details.',
    },
    privacyTitle: 'Your photos and privacy',
    privacyBody: 'The privacy policy explains what the app keeps, for how long, and how to delete it.',
    privacyLink: 'Read the privacy policy',
    deleteLink: 'Delete your account',
    limitsTitle: 'What the app can’t tell you',
    limits: 'No line on your palm can tell how long you’ll live, whether you’ll marry, or whether you’ll have children.',
    limitsMore: 'Readings are for reflection. They never give dates, or health, money or legal advice.',
    faqTitle: 'Questions people ask',
    faq: [
      {
        q: 'Is the app free?',
        a: (plan: number, pack: number) =>
          `It’s free to install and starts with free readings. Full readings are paid: plans from ${rupees(plan)}/month, or one-time packs from ${rupees(pack)}.`,
      },
      { q: 'Is there an iPhone app?', a: () => 'Not yet. The app is on Android only, from Google Play.' },
      {
        q: 'Can the app predict my future?',
        a: () => 'No. It shows what the palmistry tradition says about your lines — for reflection, not prediction.',
      },
    ],
  },
  footer: {
    honesty: 'Palmistry is a tradition for reflection. It does not predict health, lifespan or exact dates.',
    groups: { read: 'Read', guides: 'Guides', tools: 'Tools', app: 'App', legal: 'Legal' },
    privacy: 'Privacy policy',
    terms: 'Terms of use',
    deleteAccount: 'Delete your account',
    appPage: 'About the app',
    noCookies: 'No cookies, no ad trackers',
    noSelling: 'We don’t sell your data, and there are no ads — ever.',
    age: (age: number) => `Readings are for people ${age}+`,
    madeIn: 'Made in India',
    contact: 'Contact',
    grievance: 'Grievance contact',
  },
  notFound: {
    title: 'This page doesn’t exist',
    body: 'The link may be old or mistyped.',
    home: 'Go to the home page',
  },
};

export type Dictionary = typeof en;
