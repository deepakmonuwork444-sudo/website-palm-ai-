/**
 * English UI strings. `hi.ts` must provide every key (the `Dictionary` type
 * enforces it). Privacy and trust sentences come word for word from
 * SECURITY_PRIVACY.md §2 / UX_PSYCHOLOGY.md; prices and names come from site.ts.
 */

const rupees = (value: number) => `₹${Number(value).toLocaleString('en-IN')}`;

export const en = {
  meta: {
    homeTitleLive: 'Free AI Palm Reading Online: See Your Lines on Your Photo',
    homeDescriptionLive:
      'Free AI palm reading online: upload or snap a palm photo and see your heart, head, life and fate lines traced on your own hand. First reading free, no email.',
    homeTitleSoon: 'Free AI Palm Reading: See Your Real Lines Traced | PalmSays',
    homeDescriptionSoon:
      'Free AI palm reading: see how PalmSays traces the heart, head, life and fate lines on a real palm. The web reading opens soon; the Android app works today.',
    appTitle: 'PalmSays: Palm Reading App for Android (Free to Start)',
    appDescription:
      'PalmSays is a palm reading app for Android: scan your palm, see your lines traced, read what they mean. Free to start. What’s free, what’s paid, privacy.',
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
    scan: 'Scan my palm',
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
      reads: 'Palmistry reads it for energy and how you meet change, not for how long you live.',
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
      reads: 'Read for work and life direction. Many hands have no clear fate line, and that is common.',
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
  /** Header sign-in + /account/ page shell (WEB-FEAT-029/062). The account page's own words: src/lib/auth/copy.ts. */
  account: {
    signIn: 'Sign in',
    myReadings: 'My readings',
    account: 'Account',
    signOut: 'Sign out',
    menuAria: 'Your account menu',
    pageTitle: 'Your account | PalmSays',
    pageDescription: 'Sign in to PalmSays with Google or an email code. The same account works in the PalmSays app.',
    pageHeading: 'Your PalmSays account',
    noscript: 'Signing in needs JavaScript. Please turn it on, or open this page in Chrome.',
  },
  store: {
    badgeAlt: 'Get it on Google Play',
    freeToInstall: 'Free to install',
    plansFrom: (price: number) => `Plans from ${rupees(price)}/month`,
    packsFrom: (price: number) => `Packs from ${rupees(price)}, one-time`,
    cancelAnytime: 'Cancel plans anytime in Google Play',
    size: (mb: number) => `About ${mb} MB`,
    noAds: 'No ads',
    onlyPlay: 'Only from Google Play, never as an APK file.',
    playName: (name: string) => `PalmSays is currently listed as ${name} on Google Play. It is the same app.`,
    iphoneNote: 'The iPhone app isn’t ready yet. You can keep using this website.',
    qrCaption: 'Scan with your phone camera',
    remoteInstall: 'Or press Install on Google Play here, and the app goes straight to your phone (same Google account).',
    priceLabel: 'App price',
  },
  home: {
    heroCredit: 'The 3D hand in the opening is an AI-generated model, not a real customer.',
    h1: 'See your own palm lines, traced and read',
    lead: 'Free AI palm reading on your own photo. We trace your heart, head, life and fate lines on it and show what palmistry reads in them.',
    scan: {
      cta: 'Scan my palm for free',
      facts: (n: number) => `${n} free readings. No payment. Hindi and English.`,
      // While the web scan is closed the same button goes to the app page, and says so.
      ctaApp: 'Get my free reading in the app',
      factsApp: (n: number) => `${n} free readings in our Android app. No payment. The scan on this website opens soon.`,
      honesty: 'Palmistry is a tradition for reflection, not a prediction.',
      exampleTag: 'Example photo',
      note: 'Your lines appear here after your scan',
      scannedNote: 'A real scan: lines traced by PalmSays',
      photoAlt: 'A real photo of an open palm inside a phone frame. No lines are drawn on it; lines appear only after a real scan.',
      credit: 'Photo: Hanna Pad on Pexels.',
      saved: (n: number) => (n === 1 ? 'You have 1 reading saved in this browser.' : `You have ${n} readings saved in this browser.`),
      savedLink: 'Open my readings',
    },
    // v4 opening scroll story (DESIGN_V4_BRIEF.md): one hand at a time, then "Now, yours".
    story: {
      eyebrow: 'Free AI palm reading',
      title: { before: 'What do your', em: 'hands', after: 'say?' },
      beats: [
        {
          label: 'Every hand is different',
          title: { before: 'No two hands are the', em: 'same.', after: '' },
          body: 'Different fingers, different mounts, different lines. Palmistry reads every hand on its own.',
        },
        {
          label: 'An old tradition',
          title: { before: 'Read for', em: 'centuries.', after: '' },
          body: 'From India to Europe, palm readers have looked to the same main lines: heart, head, life and fate.',
        },
        {
          label: 'Every age',
          title: { before: 'Every age, its own', em: 'story.', after: '' },
          body: 'Young or old, every palm has lines worth reading.',
        },
      ],
      yours: {
        label: 'Your turn',
        title: { before: 'Now,', em: 'yours.', after: '' },
        body: 'Take a photo of your palm with your phone, or upload one. Your own lines are traced on it, then read.',
        photoLink: 'Where your photo goes',
      },
      aiNote: 'The hands in the opening story are AI-generated pictures, not real customers.',
    },
    reveals: {
      title: 'What your palm reveals',
      sub: 'Four parts, each read from your own lines. The lines below are from a real PalmSays reading.',
      sampleTag: 'Sample',
      ask: 'Get your free palm reading',
      parts: { love: 'Love', personality: 'Personality', careerMoney: 'Career & money', direction: 'Life direction' },
      directionNone: 'In this palm the fate line was too faint to read, so the reading said so instead of guessing.',
    },
    how: {
      title: 'How our AI palm reading works',
      steps: [
        {
          title: 'Take one photo of your open palm',
          body: 'Good light, the whole hand in the frame, and see [which hand to photograph](/which-hand-to-read/) first. Your phone checks the photo before anything is sent.',
          alt: 'The first screen of the reading: photo tips and the Take a palm photo button.',
        },
        {
          title: 'We trace your lines on your photo',
          body: 'Heart, head, life and fate. If a line isn’t clear, we tell you instead of guessing.',
          alt: 'The reading screen while it traces the lines on a palm photo.',
        },
        {
          title: 'Read what palmistry says',
          body: 'Love and Personality in full, plus the first line of Career & money and Life direction.',
          alt: 'The start of a finished reading: the palm at a glance and the Love part.',
        },
      ],
      previewNote: 'Real screens from the reading page.',
    },
    tools: {
      title: 'Free palmistry tools that use your photo',
      sub: 'Short, focused checks on your own hand.',
      open: 'Try it on your photo',
      soon: 'Opens soon',
      local: 'On your phone',
      all: 'See all free tools',
      items: {
        handShape: { name: 'Hand shape from your photo', blurb: 'Your palm and finger proportions, and the hand type palmistry gives them.' },
        fingers: { name: 'Finger reader', blurb: 'Your finger lengths side by side, and what palmistry reads in them.' },
        lineFinder: { name: 'Palm line finder', blurb: 'Your heart, head, life and fate lines, named on your own photo.' },
        leftRight: { name: 'Left vs right hand', blurb: 'Both your hands compared: what differs, and how the tradition reads it.' },
      },
      englishNote: '',
    },
    sample: {
      title: 'A real reading, before you scan yours',
      tag: 'Sample',
      note: 'Real text from PalmSays, made from a real palm scan. Your reading is made from your own photo.',
      glanceTitle: 'At a glance',
      readCount: 'You’ve read 2 of 4 parts.',
      lockedNone: 'Nothing clear enough in this palm to preview.',
      lockNote: 'In a free reading these two parts show their first line. The full reading is in our Android app (paid).',
      cta: 'Scan my palm',
    },
    guides: {
      title: 'Learn the lines on your palm',
      sub: 'Honest guides, with a picture of each line. New to palmistry? Start with [how to read palm lines](/palm-reading/).',
      items: {
        heart: 'Heart line',
        head: 'Head line',
        life: 'Life line',
        fate: 'Fate line',
        marriage: 'Marriage line',
        handLines: 'Lines on your palm',
        palmReading: 'How to read palm lines',
        isReal: 'Is palmistry true?',
      },
      blurbs: {
        heart: 'Love and feelings: what its length, curve and forks mean.',
        head: 'How you think: long, short, sloping or forked.',
        life: 'Energy and big changes, not how long you live.',
        fate: 'Career and direction, and what no fate line means.',
        marriage: 'The small lines under the little finger, and what they can’t tell.',
        handLines: 'Every main line on your hand, with a palm reading chart.',
        palmReading: 'Seven steps to read any palm, from hand to lines.',
        isReal: 'What science says, and how to enjoy it honestly.',
      },
      read: 'Read the guide',
      minutes: (n: number) => `${n} min read`,
      inEnglish: '',
      all: 'All guides',
    },
    faq: {
      title: 'Questions people ask',
      items: [
        {
          q: 'Is the palm reading really free?',
          // `open` = a visitor can finish a scan on this website today (src/lib/reading/open.ts); check-web blocks the live claim while it is off.
          a: (guest: number, afterEmail: number, open: boolean) =>
            open
              ? `Yes. On this website you get ${guest + afterEmail} free readings: ${guest} now, and ${afterEmail} more after a free email sign-up. Each shows Love and Personality in full, plus the first line of Career & money and Life direction. The full reading is in our Android app, which is paid. We never ask for card details on this website.`
              : `Yes, to start. The palm scan on this website opens soon. Today our Android app gives you ${guest + afterEmail} free readings: ${guest} right away, and ${afterEmail} more with a free account. Each shows Love and Personality in full, plus the first line of Career & money and Life direction. The full reading in the app is paid. We never ask for card details on this website.`,
        },
        {
          q: 'What happens to my photo?',
          a: (_guest: number, _afterEmail: number, open: boolean) =>
            open
              ? 'Before anything is sent, your browser makes the photo smaller and removes hidden data such as your location. A copy of the photo stays in this browser so you can see your reading again. Clearing browser data removes it.'
              : 'The photo tools on this website check your photo on your own phone, and nothing is uploaded. When the palm scan here opens, your browser will make the photo smaller and remove hidden data such as your location before anything is sent.',
        },
        {
          q: 'Can palmistry predict my future?',
          a: () =>
            'No. Palmistry is an old tradition, not a science. We show what the tradition says about your lines, not your future. No line can tell how long you’ll live, whether you’ll marry, or whether you’ll have children.',
        },
        {
          q: 'Which hand should I scan?',
          a: () => 'Most people start with the hand they write with. Your second free reading is a good time to scan the other hand.',
        },
        {
          q: 'What if my photo isn’t clear?',
          a: () =>
            'Your phone checks the photo first. If it’s too dark or blurry, we tell you how to fix it, and nothing is sent. If one line isn’t clear, the reading says so instead of guessing.',
        },
      ],
      privacyLink: 'Read the privacy policy',
    },
    app: {
      title: 'Want the full reading?',
      body: 'Our Android app has all 4 parts of your reading, with your lines traced on your photo.',
      ticks: ['All 4 parts: Love, Personality, Career & money, Life direction', 'Scan with your phone camera', 'Hindi and English, no ads'],
      more: 'About our palm reading app',
    },
    // Pricing on the home page: the same facts and numbers as /app/ (appPage.price); numbers come from site.ts.
    pricing: {
      title: 'What’s free and what’s paid',
      sub: 'Start free. The full reading is in our Android app, paid through Google Play, never on this site.',
      free: {
        name: 'Free',
        lead: '',
        tail: 'readings',
        how: (guest: number, afterEmail: number) => `${guest} right away, ${afterEmail} more with a free account`,
        points: () => ['Love and Personality in full', 'The first line of Career & money and Life direction'],
      },
      packs: {
        name: 'Packs',
        lead: 'from',
        tail: 'one-time',
        how: 'Pay once; the readings never expire',
        points: (sizes: readonly number[]) => [
          `${Array.from(sizes).slice(0, -1).join(', ')} or ${Array.from(sizes).slice(-1)} full readings`,
          'All 4 parts in every reading',
        ],
      },
      plans: {
        name: 'Plans',
        lead: 'from',
        tail: '/month',
        how: 'Renews until you cancel in Google Play',
        points: (lite: number, full: number) => [
          `Monthly Lite: ${lite} full readings a month`,
          `Monthly and Yearly: ${full} full readings a month`,
          'Unused readings don’t carry over',
        ],
      },
      same: 'Packs and plans open the same full reading.',
      where: 'In our Android app',
    },
    mostAsked: {
      title: 'Most asked this week',
      weekEnding: (date: string) => `Week ending ${date}`,
    },
  },
  locked: {
    open: 'Open in the app',
    lockedLabel: 'Locked part',
  },
  appPage: {
    h1: 'PalmSays: the palm reading app that traces your real lines',
    lead: 'Scan your palm with your phone camera. This hand reading app traces your heart, head, life and fate lines on your own photo and shows what palmistry says about each.',
    getTitle: 'Get the app',
    continuity: 'In the app you’ll take a fresh photo of your palm.',
    photoNote: 'In the app, you scan your palm with your phone camera',
    doesTitle: 'What the palm reading app does',
    does: [
      'Traces your heart, head, life and fate lines on your own palm photo',
      'Measures your hand type and fingers on the same photo, and shows where the mounts sit',
      'Tells you when a line isn’t clear, instead of guessing',
      'Explains what palmistry says about each line, with the book it comes from',
      'Opens in English, with a switch to Hindi, and has no ads',
    ],
    priceTitle: 'What’s free and what’s paid',
    price: {
      freeReadings: (guest: number, afterEmail: number) =>
        `Free: ${guest + afterEmail} readings (${guest} right away, ${afterEmail} more with a free account). A free reading shows Love and Personality in full, and the first line of Career & money and Life direction.`,
      // The price boxes (WEB-DEC-046): the app paywall's two tabs, Membership and One-time packs; numbers from site.appPlans / site.appPacks.
      switchLabel: 'Choose how to pay',
      currencyNote: 'Prices below are in Indian rupees (₹). Outside India, Google Play shows the price in your own currency before you pay.',
      getInApp: 'Get it in the app',
      startFree: 'Start free in the app',
      membershipTitle: 'Membership',
      membershipLead: 'New readings every month. Cancel anytime in Google Play.',
      packsTitle: 'One-time packs',
      packsLead: 'Pay once, with no autopay. The readings never expire.',
      planNames: { yearly: 'Yearly', monthly: 'Monthly', lite: 'Monthly Lite' },
      per: { year: '/year', month: '/month' },
      spoken: {
        year: (price: number) => `${rupees(price)} a year`,
        month: (price: number) => `${rupees(price)} a month`,
      },
      readingsAMonth: (count: number) => `${count} full readings a month`,
      trial: (days: number, readings: number) => `${days} days free, ${readings} readings`,
      yearlyPerMonth: (perMonth: number, under: number) => `About ${rupees(perMonth)} a month, under ${rupees(under)} a reading`,
      yearlyVsMonthly: (twelve: number) => `12 months of Monthly cost ${rupees(twelve)}`,
      planPerReading: (price: number) => `About ${rupees(price)} a reading`,
      readingsWord: 'readings',
      packTags: { me: 'Just for me', family: 'Me + family', bigFamily: 'Big family', friends: 'Family + friends' },
      packPerReading: (price: number) => `${rupees(price)} a reading`,
      renewal: 'Plans renew on their own until you cancel in Google Play. Unused monthly readings don’t carry over.',
      trialNote: (days: number, readings: number, price: number) =>
        `Yearly starts free for ${days} days, with ${readings} readings. Then it’s ${rupees(price)} a year; cancel in Google Play before the trial ends and you pay nothing.`,
      sameReading: 'Packs and plans open the same full reading, with all 4 parts.',
      payment: 'Google Play handles payment. We never see your card details.',
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
        a: () => 'No. It shows what the palmistry tradition says about your lines. It is for reflection, not prediction.',
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
    about: 'About us',
    editorialPolicy: 'How we write guides',
    noCookies: 'No cookies, no ad trackers',
    noSelling: 'We don’t sell your data, and there are no ads, ever.',
    age: (age: number) => `Readings are for people ${age}+`,
    madeIn: 'Made in India',
    contact: 'Contact',
    grievance: 'Grievance contact',
    toTop: 'Back to top',
  },
  notFound: {
    title: 'This page doesn’t exist',
    body: 'The link may be old or mistyped.',
    home: 'Go to the home page',
  },
};

export type Dictionary = typeof en;
