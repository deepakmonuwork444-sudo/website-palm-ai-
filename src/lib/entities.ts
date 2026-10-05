/**
 * The entity registry (SEMANTIC_SEO_PLAN.md §5.3–5.4, WEB-DEC-049): the palmistry terms the
 * site talks about, with their English and Hindi names, a one-sentence definition, the page
 * that owns each term, and ONLY Wikidata items that were fetched live and checked
 * (2026-09-28, wbgetentities: label, description and enwiki/hiwiki sitelinks matched).
 *
 * Rules:
 * - `wikidata` only when the item is the SAME thing (plan §5.1). No item = no `sameAs`; our own
 *   `@id` (`https://palmsays.com/palmistry-terms/#<id>`) is then the identity. Never guess an id.
 *   Known traps: Q2195421 "heart line" is geometry, Q1615182 is roller coasters, Q113174138 is
 *   not Hindu astrology, Q125364068 (mount of Venus) is a disambiguation page.
 * - `hiwiki` only where plan §5.3 found the Hindi article to be the same topic (handedness and
 *   divination have loose Hindi labels: not used).
 * - Hindi names wait for the Hindi reviewer (D5) before any Hindi glossary page shows them.
 * - Definitions state what palmistry reads, attributed, never a prediction (CONTENT_GUIDE.md §4).
 *
 * Build-time data only (no JS shipped). No runtime imports, so scripts/check-web.mjs can load
 * this file directly with Node's type stripping.
 */

export const TERMS_PATH = '/palmistry-terms/';

export type EntityGroup =
  | 'tradition'
  | 'science'
  | 'hand'
  | 'line-major'
  | 'line-minor'
  | 'line-variant'
  | 'mount'
  | 'shape'
  | 'finger'
  | 'sign'
  | 'reading';

export interface Entity {
  /** Stable id: the glossary anchor and `@id` = https://palmsays.com/palmistry-terms/#<id>. */
  id: string;
  name: { en: string; hi: string };
  /** Other names (English, Hinglish, Devanagari); also used to find the term in page text. */
  alt?: readonly string[];
  group: EntityGroup;
  /** One sentence (≤ 40 words), our own words. */
  def: string;
  /** The page that explains the term best today (null: none built yet; the glossary will). */
  owner: string | null;
  /** Verified Wikidata item of the same thing. */
  wikidata?: `Q${number}`;
  /** English Wikipedia title of that item's sitelink. */
  wikipedia?: string;
  /** Hindi Wikipedia title, only where the article is the same topic. */
  hiwiki?: string;
  /** For the glossary only: a body area or related item this term refers to (not `sameAs`). */
  relatedWikidata?: `Q${number}`;
  /** The app's scan reads this feature (one source of truth for "what the app reads" lists). */
  appReads?: boolean;
  /** The Hindi name is less settled and waits for the Hindi reviewer (the glossary marks it with *). */
  hiCheck?: boolean;
}

const ENTITY_LIST = [
  // Palmistry and its traditions
  {
    id: 'palmistry',
    name: { en: 'Palmistry', hi: 'हस्तरेखा शास्त्र' },
    alt: ['palm reading', 'hast rekha', 'hast rekha shastra', 'chiromancy', 'हस्तरेखा'],
    group: 'tradition',
    def: 'Palmistry (palm reading, Hast Rekha Shastra) is the old tradition of reading the lines, mounts and shape of the hand for character. It is a tradition for reflection, not a science.',
    owner: '/palm-reading/',
    wikidata: 'Q182687',
    wikipedia: 'Palmistry',
    hiwiki: 'हस्तरेखा शास्त्र',
  },
  {
    id: 'chiromancy',
    name: { en: 'Chiromancy', hi: 'काइरोमैंसी' },
    alt: ['cheiromancy'],
    group: 'tradition',
    def: 'Chiromancy is the older word for reading the lines of the palm; the classical books use it for the line-reading half of palmistry.',
    owner: '/palm-reading/',
  },
  {
    id: 'chirognomy',
    name: { en: 'Chirognomy', hi: 'काइरोग्नोमी' },
    group: 'tradition',
    def: 'Chirognomy is the older word for reading the shape of the hand and fingers, the other half of palmistry beside the lines.',
    owner: '/palm-reading/',
  },
  {
    id: 'samudrika-shastra',
    name: { en: 'Samudrika Shastra', hi: 'सामुद्रिक शास्त्र' },
    alt: ['samudrik shastra', 'samudrika'],
    group: 'tradition',
    def: 'Samudrika Shastra is the Indian tradition of reading the body’s features, of which hand reading (Hast Rekha) is one part.',
    owner: null,
    wikidata: 'Q7410688',
    wikipedia: 'Samudrika Shastra',
    hiwiki: 'सामुद्रिक शास्त्र',
  },
  {
    id: 'hindu-astrology',
    name: { en: 'Hindu astrology', hi: 'भारतीय ज्योतिष' },
    alt: ['vedic astrology', 'jyotish', 'jyotisha'],
    group: 'tradition',
    def: 'Hindu astrology (Jyotisha) is the Indian astrological tradition; Indian palmistry names the mounts after the same planets.',
    owner: null,
    wikidata: 'Q740253',
    wikipedia: 'Hindu astrology',
    hiwiki: 'भारतीय ज्योतिष',
  },
  {
    id: 'astrology',
    name: { en: 'Astrology', hi: 'फलित ज्योतिष' },
    group: 'tradition',
    def: 'Astrology reads the positions of the sun, moon and planets for meaning. Like palmistry, it is a tradition, not a science.',
    owner: '/is-palmistry-real/',
    wikidata: 'Q34362',
    wikipedia: 'Astrology',
    hiwiki: 'फलित ज्योतिष',
  },
  {
    id: 'divination',
    name: { en: 'Divination', hi: 'भविष्य-कथन' },
    group: 'tradition',
    def: 'Divination is any practice that claims to see the future or hidden things; palmistry was long counted among them.',
    owner: null,
    wikidata: 'Q1043197',
    wikipedia: 'Divination',
  },
  {
    id: 'palmist',
    name: { en: 'Palmist', hi: 'हस्तरेखा विशेषज्ञ' },
    alt: ['palm reader', 'chiromancer'],
    group: 'tradition',
    def: 'A palmist (palm reader) is a person who reads hands by the rules of palmistry.',
    owner: null,
    wikidata: 'Q110875660',
  },

  // Science words
  {
    id: 'pseudoscience',
    name: { en: 'Pseudoscience', hi: 'छद्म विज्ञान' },
    group: 'science',
    def: 'A pseudoscience is a set of claims presented as science without scientific evidence. Scientists count palmistry’s predictions as pseudoscience.',
    owner: '/is-palmistry-real/',
    wikidata: 'Q483677',
    wikipedia: 'Pseudoscience',
    hiwiki: 'छद्म विज्ञान',
  },
  {
    id: 'barnum-effect',
    name: { en: 'Barnum effect', hi: 'बार्नम प्रभाव' },
    alt: ['forer effect', 'barnum'],
    group: 'science',
    def: 'The Barnum (Forer) effect is our habit of rating vague, general descriptions as personal and exact. It is one reason readings can feel true.',
    owner: '/is-palmistry-real/',
    wikidata: 'Q653175',
    wikipedia: 'Barnum effect',
  },
  {
    id: 'cold-reading',
    name: { en: 'Cold reading', hi: 'कोल्ड रीडिंग' },
    group: 'science',
    def: 'Cold reading is the trick of guessing things about a stranger from their looks, words and reactions, so that a reading seems to know them.',
    owner: '/is-palmistry-real/',
  },
  {
    id: 'dermatoglyphics',
    name: { en: 'Dermatoglyphics', hi: 'डर्मेटोग्लिफ़िक्स' },
    group: 'science',
    def: 'Dermatoglyphics is the scientific study of the skin ridge patterns of the fingers, palms and soles, such as fingerprints. It is not palmistry.',
    owner: '/is-palmistry-real/',
    wikidata: 'Q904206',
    wikipedia: 'Dermatoglyphics',
  },

  // The hand
  {
    id: 'hand',
    name: { en: 'Hand', hi: 'हाथ' },
    group: 'hand',
    def: 'The hand is the end of the arm: the palm, four fingers and the thumb. Palmistry reads its shape, lines and mounts.',
    owner: '/palm-reading/',
    wikidata: 'Q33767',
    wikipedia: 'Hand',
    hiwiki: 'हाथ',
  },
  {
    id: 'palm',
    name: { en: 'Palm', hi: 'हथेली' },
    group: 'hand',
    def: 'The palm is the inner, central part of the hand between the wrist and the fingers, where the lines are.',
    owner: '/hand-lines/',
    wikidata: 'Q2001588',
    wikipedia: 'Palm of the hand',
  },
  {
    id: 'fingers',
    name: { en: 'Fingers', hi: 'उंगलियां' },
    alt: ['finger', 'finger length', 'index finger', 'ring finger'],
    group: 'finger',
    def: 'Palmistry reads the fingers by their length, shape and joints; the classical books name each finger after a planet (index = Jupiter, middle = Saturn, ring = Sun, little = Mercury).',
    owner: '/palmistry-fingers/',
    wikidata: 'Q620207',
    wikipedia: 'Finger',
    appReads: true,
  },
  {
    id: 'thumb',
    name: { en: 'Thumb', hi: 'अंगूठा' },
    group: 'finger',
    def: 'The thumb is the first finger of the hand. The classical books read its length and how far it opens for will and logic.',
    owner: '/palmistry-fingers/',
    wikidata: 'Q83360',
    wikipedia: 'Thumb',
    hiwiki: 'अंगुष्ठ',
  },
  {
    id: 'fingerprint',
    name: { en: 'Fingerprint', hi: 'अंगुलि छाप' },
    group: 'hand',
    def: 'A fingerprint is the ridge pattern on a fingertip, studied by science as dermatoglyphics. Palm lines are creases, not ridges.',
    owner: '/is-palmistry-real/',
    wikidata: 'Q178022',
    wikipedia: 'Fingerprint',
    hiwiki: 'अंगुलि छाप',
  },
  {
    id: 'thenar-eminence',
    name: { en: 'Thenar eminence', hi: 'अंगूठे के नीचे का उभार' },
    group: 'hand',
    def: 'The thenar eminence is the fleshy pad at the base of the thumb; palmistry calls roughly this area the mount of Venus.',
    owner: null,
    wikidata: 'Q530315',
    wikipedia: 'Thenar eminence',
  },
  {
    id: 'hypothenar-eminence',
    name: { en: 'Hypothenar eminence', hi: 'छोटी उंगली की ओर का उभार' },
    group: 'hand',
    def: 'The hypothenar eminence is the fleshy edge of the palm below the little finger; palmistry calls roughly its lower part the mount of the Moon.',
    owner: null,
    wikidata: 'Q1089522',
    wikipedia: 'Hypothenar eminence',
  },
  {
    id: 'handedness',
    name: { en: 'Handedness', hi: 'हाथ की प्रधानता' },
    alt: ['left-handed', 'right-handed'],
    group: 'hand',
    def: 'Handedness is a person’s preference for using one hand more than the other: right-handed, left-handed or both.',
    owner: '/which-hand-to-read/',
    wikidata: 'Q2421902',
    wikipedia: 'Handedness',
  },
  {
    id: 'dominant-hand',
    name: { en: 'Dominant hand', hi: 'प्रमुख हाथ' },
    alt: ['writing hand', 'the hand you write with', 'active hand'],
    group: 'hand',
    def: 'Your dominant hand is the one you use most, usually the hand you write with. Palmistry reads it as the life you are making.',
    owner: '/which-hand-to-read/',
    wikidata: 'Q19978810',
  },

  // Lines
  {
    id: 'palm-lines',
    name: { en: 'Palm lines', hi: 'हाथ की रेखाएं' },
    alt: ['palmar crease', 'lines on your palm', 'lines on the palm', 'hand lines', 'हस्तरेखा'],
    group: 'line-major',
    def: 'Palm lines are the creases of the palm. Most palms have three major lines (heart, head and life), and many also have a fate line and smaller lines.',
    owner: '/hand-lines/',
    wikidata: 'Q3906698',
    wikipedia: 'Palmar crease',
    appReads: true,
  },
  {
    id: 'heart-line',
    name: { en: 'Heart line', hi: 'हृदय रेखा' },
    alt: ['love line', 'hriday rekha'],
    group: 'line-major',
    def: 'The heart line is the top line across the palm, just under the fingers. Palmistry reads it for your emotional style: how you show affection and relate to people.',
    owner: '/heart-line/',
    appReads: true,
  },
  {
    id: 'head-line',
    name: { en: 'Head line', hi: 'मस्तिष्क रेखा' },
    alt: ['mind line', 'wisdom line', 'mastishk rekha'],
    group: 'line-major',
    def: 'The head line crosses the middle of the palm, below the heart line. Palmistry reads it for how you think, learn and decide.',
    owner: '/head-line/',
    appReads: true,
  },
  {
    id: 'life-line',
    name: { en: 'Life line', hi: 'जीवन रेखा' },
    alt: ['jeevan rekha'],
    group: 'line-major',
    def: 'The life line curves around the base of the thumb. Palmistry reads it for energy and how you meet change, never for how long you will live.',
    owner: '/life-line/',
    wikidata: 'Q1700006',
    appReads: true,
  },
  {
    id: 'fate-line',
    name: { en: 'Fate line', hi: 'भाग्य रेखा' },
    alt: ['destiny line', 'career line', 'bhagya rekha'],
    group: 'line-major',
    def: 'The fate line runs up the middle of the palm towards the middle finger. Palmistry reads it for direction and work; many palms show it faintly or not at all.',
    owner: '/fate-line/',
    appReads: true,
  },
  {
    id: 'sun-line',
    name: { en: 'Sun line', hi: 'सूर्य रेखा' },
    alt: ['apollo line', 'line of apollo', 'line of success'],
    group: 'line-minor',
    def: 'The sun line (line of Apollo) is a short line rising towards the ring finger. The classical books read it for creativity and recognition.',
    owner: '/sun-line/',
  },
  {
    id: 'marriage-line',
    name: { en: 'Marriage line', hi: 'विवाह रेखा' },
    alt: ['marriage lines', 'affection line', 'relationship line', 'shadi ki rekha'],
    group: 'line-minor',
    def: 'Marriage lines are the small lines on the edge of the palm under the little finger. Palmistry books read them as marks of deep affection; no line shows when or whom you marry.',
    owner: '/marriage-line/',
  },
  {
    id: 'mercury-line',
    name: { en: 'Mercury line', hi: 'बुध रेखा' },
    alt: ['health line', 'hepatica'],
    group: 'line-minor',
    def: 'The Mercury line is a line some palms show rising towards the little finger. Old books call it the health line; no palm line shows your health.',
    owner: '/mercury-line/',
  },
  {
    id: 'girdle-of-venus',
    name: { en: 'Girdle of Venus', hi: 'शुक्र वलय' },
    group: 'line-minor',
    def: 'The girdle of Venus is a curved line some palms show above the heart line, under the middle and ring fingers. The classical books read it for sensitivity.',
    owner: '/hand-lines/',
    hiCheck: true,
  },
  {
    id: 'bracelets',
    name: { en: 'Bracelet lines', hi: 'मणिबंध' },
    alt: ['bracelets', 'rascettes', 'wrist lines'],
    group: 'line-minor',
    def: 'Bracelet lines (rascettes) are the creases across the inside of the wrist, just below the palm.',
    owner: '/hand-lines/',
    hiCheck: true,
  },
  {
    id: 'simian-line',
    name: { en: 'Simian line', hi: 'सिमियन रेखा' },
    alt: ['single transverse palmar crease', 'single palmar crease', 'one line across the palm'],
    group: 'line-variant',
    def: 'A simian line is one straight crease across the palm in place of separate heart and head lines. It is usually a normal variation, not a diagnosis on its own.',
    owner: '/simian-line/',
    wikidata: 'Q1934946',
    wikipedia: 'Single transverse palmar crease',
  },
  {
    id: 'double-head-line',
    name: { en: 'Double head line', hi: 'दोहरी मस्तिष्क रेखा' },
    alt: ['two head lines'],
    group: 'line-variant',
    def: 'A double head line is two separate head lines across the middle of the palm, one above the other. It is uncommon.',
    owner: '/head-line/double/',
  },
  {
    id: 'broken-life-line',
    name: { en: 'Broken life line', hi: 'टूटी जीवन रेखा' },
    alt: ['split life line', 'gap in the life line'],
    group: 'line-variant',
    def: 'A broken life line has a gap, or stops and starts again beside itself. Palmistry books read it as a time of big change in how you live, never as death, illness or an accident.',
    owner: '/life-line/broken/',
    hiCheck: true,
  },
  {
    id: 'sydney-line',
    name: { en: 'Sydney line', hi: 'सिडनी रेखा' },
    group: 'line-variant',
    def: 'A Sydney line is a head line that runs right across the palm to its outer edge, with a separate heart line above it.',
    owner: null,
  },

  // Mounts
  {
    id: 'palm-mounts',
    name: { en: 'Mounts of the palm', hi: 'हथेली के पर्वत' },
    alt: ['mounts', 'mount'],
    group: 'mount',
    def: 'Mounts are the fleshy pads of the palm. Palmistry names each after a planet (Venus, Jupiter, Saturn, Sun, Mercury, Mars and the Moon) and reads how full it is.',
    owner: '/palm-mounts/',
  },
  {
    id: 'mount-venus',
    name: { en: 'Mount of Venus', hi: 'शुक्र पर्वत' },
    group: 'mount',
    def: 'The mount of Venus is the pad at the base of the thumb, inside the life line. The classical books read it for warmth and energy.',
    owner: '/palm-mounts/',
    relatedWikidata: 'Q530315',
  },
  {
    id: 'mount-moon',
    name: { en: 'Mount of the Moon', hi: 'चंद्र पर्वत' },
    alt: ['mount of luna', 'lunar mount'],
    group: 'mount',
    def: 'The mount of the Moon is the pad on the outer edge of the palm, low down near the wrist. The classical books read it for imagination.',
    owner: '/palm-mounts/',
    relatedWikidata: 'Q1089522',
  },
  {
    id: 'mount-jupiter',
    name: { en: 'Mount of Jupiter', hi: 'गुरु पर्वत' },
    group: 'mount',
    def: 'The mount of Jupiter is the pad under the index finger. The classical books read it for ambition and leadership.',
    owner: '/palm-mounts/',
  },

  // Reading words
  {
    id: 'which-hand',
    name: { en: 'Which hand to read', hi: 'कौन सा हाथ देखें' },
    alt: ['left or right hand', 'left hand', 'right hand', 'passive hand'],
    group: 'reading',
    def: 'Palmistry looks at both hands: the tradition reads the hand you write with as the life you are making, and the other as what you started with.',
    owner: '/which-hand-to-read/',
  },
  {
    id: 'hand-shape',
    name: { en: 'Hand shape', hi: 'हाथ की बनावट' },
    alt: ['hand type', 'hand types', 'earth hand', 'air hand', 'fire hand', 'water hand'],
    group: 'shape',
    def: 'Hand shape is the palm’s proportions and the fingers’ length. Modern palmistry sorts hands into earth, air, fire and water types; Cheiro used seven types.',
    owner: '/hand-types/',
    appReads: true,
  },
  {
    id: 'palm-signs',
    name: { en: 'Palm signs', hi: 'हथेली के चिह्न' },
    alt: ['signs', 'marks', 'island', 'cross', 'star', 'mystic cross'],
    group: 'sign',
    def: 'Palm signs are small marks on or between the lines, such as islands, crosses, stars, squares and triangles, each read by the classical books.',
    owner: '/lucky-signs/',
  },

  // Glossary terms (SEMANTIC_SEO_PLAN.md §5.4, /palmistry-terms/, WEB-DEC-053). Minor-line readings: Cheiro,
  // Palmistry for All (1916), as /hand-lines/ gives them; signs: src/lib/tools/signs.ts; hand types:
  // src/lib/tools/hand-type.ts and Cheiro Part II ch. I. `owner: null` until a guide explains the term.
  {
    id: 'intuition-line',
    name: { en: 'Intuition line', hi: 'अंतर्ज्ञान रेखा' },
    alt: ['line of intuition'],
    group: 'line-minor',
    def: 'The intuition line is a rare curved line on the outer palm, bowing from under the little finger down towards the mount of the Moon. Cheiro read it for a sensitive, intuitive nature.',
    owner: '/hand-lines/',
    hiCheck: true,
  },
  {
    id: 'travel-lines',
    name: { en: 'Travel lines', hi: 'यात्रा रेखा' },
    group: 'line-minor',
    def: 'Travel lines are short lines on the outer edge of the palm, low on the mount of the Moon. Cheiro read them as journeys; no line gives a date.',
    owner: '/hand-lines/',
    hiCheck: true,
  },
  {
    id: 'line-of-mars',
    name: { en: 'Line of Mars', hi: 'मंगल रेखा' },
    alt: ['inner life line'],
    group: 'line-minor',
    def: 'The line of Mars is a line running just inside the life line, on the ball of the thumb. Cheiro called it the inner life line and read it for a strong temperament.',
    owner: '/hand-lines/',
    hiCheck: true,
  },
  {
    id: 'ring-of-solomon',
    name: { en: 'Ring of Solomon', hi: 'गुरु वलय' },
    group: 'line-minor',
    def: 'The ring of Solomon is a small curved line around the base of the index finger, on the mount of Jupiter. Cheiro counted it among the marks of an interest in mysticism.',
    owner: '/hand-lines/',
    hiCheck: true,
  },
  {
    id: 'via-lasciva',
    name: { en: 'Via lasciva', hi: 'वाया लैसिवा' },
    group: 'line-minor',
    def: 'The via lasciva is a rare curved line low on the palm, joining the mount of the Moon to the ball of the thumb. We don’t repeat the harsh reading old books give it.',
    owner: '/hand-lines/',
    hiCheck: true,
  },
  {
    id: 'children-lines',
    name: { en: 'Children lines', hi: 'संतान रेखा' },
    group: 'line-minor',
    def: 'Children lines are fine upright lines just above the marriage lines. Cheiro read them as children; whether you have children depends on life, health and choice, not on lines.',
    owner: '/children-line/',
  },
  {
    id: 'money-line',
    name: { en: 'Money line', hi: 'धन रेखा' },
    alt: ['dhan rekha'],
    group: 'line-minor',
    def: 'Money line is a newer name. The classical books we use don’t describe a separate money line, and no line predicts money.',
    owner: '/money-line/',
  },
  {
    id: 'mount-saturn',
    name: { en: 'Mount of Saturn', hi: 'शनि पर्वत' },
    group: 'mount',
    def: 'The mount of Saturn is the pad under the middle finger. The classical books read it for seriousness and a thoughtful, careful nature.',
    owner: '/palm-mounts/',
  },
  {
    id: 'mount-sun',
    name: { en: 'Mount of the Sun', hi: 'सूर्य पर्वत' },
    alt: ['mount of apollo'],
    group: 'mount',
    def: 'The mount of the Sun (mount of Apollo) is the pad under the ring finger. The classical books read it for a love of beauty and creative work.',
    owner: '/palm-mounts/',
  },
  {
    id: 'mount-mercury',
    name: { en: 'Mount of Mercury', hi: 'बुध पर्वत' },
    group: 'mount',
    def: 'The mount of Mercury is the pad under the little finger. The classical books read it for quick wit and a gift for words and trade.',
    owner: '/palm-mounts/',
  },
  {
    id: 'mount-mars-inner',
    name: { en: 'Mount of Mars near the thumb', hi: 'मंगल पर्वत (अंगूठे की ओर)' },
    alt: ['inner mount of mars'],
    group: 'mount',
    def: 'The mount of Mars near the thumb is the pad just inside the start of the life line, below Jupiter. The classical books read it for active courage. Books label the two Mars mounts differently.',
    owner: '/palm-mounts/',
    hiCheck: true,
  },
  {
    id: 'mount-mars-outer',
    name: { en: 'Mount of Mars on the outer edge', hi: 'मंगल पर्वत (बाहरी किनारा)' },
    alt: ['outer mount of mars'],
    group: 'mount',
    def: 'The mount of Mars on the outer edge is the pad between the mount of Mercury and the mount of the Moon. The classical books read it for moral courage and self-control.',
    owner: '/palm-mounts/',
    hiCheck: true,
  },
  {
    id: 'plain-of-mars',
    name: { en: 'Plain of Mars', hi: 'मंगल क्षेत्र' },
    group: 'mount',
    def: 'The plain of Mars is the hollow centre of the palm, between the mounts, where the fate line passes between the head and heart lines.',
    owner: '/palm-mounts/',
    hiCheck: true,
  },
  {
    id: 'earth-hand',
    name: { en: 'Earth hand', hi: 'पृथ्वी हाथ' },
    group: 'shape',
    def: 'In the modern four-element system, an earth hand has a square palm and short fingers, and is linked with a practical, steady nature.',
    owner: '/hand-types/',
    hiCheck: true,
  },
  {
    id: 'air-hand',
    name: { en: 'Air hand', hi: 'वायु हाथ' },
    group: 'shape',
    def: 'In the modern four-element system, an air hand has a square palm and long fingers, and is linked with a curious, talkative mind.',
    owner: '/hand-types/',
    hiCheck: true,
  },
  {
    id: 'fire-hand',
    name: { en: 'Fire hand', hi: 'अग्नि हाथ' },
    group: 'shape',
    def: 'In the modern four-element system, a fire hand has a long palm and short fingers, and is linked with energy and enthusiasm.',
    owner: '/hand-types/',
    hiCheck: true,
  },
  {
    id: 'water-hand',
    name: { en: 'Water hand', hi: 'जल हाथ' },
    group: 'shape',
    def: 'In the modern four-element system, a water hand has a long palm and long fingers, and is linked with sensitivity and imagination.',
    owner: '/hand-types/',
    hiCheck: true,
  },
  {
    id: 'elementary-hand',
    name: { en: 'Elementary hand', hi: 'प्रारंभिक हाथ' },
    group: 'shape',
    def: 'The elementary hand is the first of Cheiro’s seven hand types: a short, thick palm with short, heavy fingers.',
    owner: '/hand-types/',
    hiCheck: true,
  },
  {
    id: 'square-hand',
    name: { en: 'Square hand', hi: 'वर्गाकार हाथ' },
    alt: ['useful hand'],
    group: 'shape',
    def: 'The square hand is one of Cheiro’s seven hand types: a square palm, square at the wrist and the finger bases, with square-cut fingertips.',
    owner: '/hand-types/',
    hiCheck: true,
  },
  {
    id: 'spatulate-hand',
    name: { en: 'Spatulate hand', hi: 'चमसाकार हाथ' },
    group: 'shape',
    def: 'The spatulate hand is one of Cheiro’s seven hand types: fingertips that widen at the ends, like a spatula.',
    owner: '/hand-types/',
    hiCheck: true,
  },
  {
    id: 'philosophic-hand',
    name: { en: 'Philosophic hand', hi: 'दार्शनिक हाथ' },
    group: 'shape',
    def: 'The philosophic hand is one of Cheiro’s seven hand types: a long, angular hand with knotty finger joints.',
    owner: '/hand-types/',
    hiCheck: true,
  },
  {
    id: 'conic-hand',
    name: { en: 'Conic hand', hi: 'शंक्वाकार हाथ' },
    alt: ['artistic hand'],
    group: 'shape',
    def: 'The conic hand is one of Cheiro’s seven hand types: a graceful hand with fingers that taper to rounded tips.',
    owner: '/hand-types/',
    hiCheck: true,
  },
  {
    id: 'psychic-hand',
    name: { en: 'Psychic hand', hi: 'आदर्शवादी हाथ' },
    alt: ['idealistic hand'],
    group: 'shape',
    def: 'The psychic (idealistic) hand is one of Cheiro’s seven hand types: a long, narrow hand with slender, pointed fingers.',
    owner: '/hand-types/',
    hiCheck: true,
  },
  {
    id: 'mixed-hand',
    name: { en: 'Mixed hand', hi: 'मिश्रित हाथ' },
    group: 'shape',
    def: 'The mixed hand is the last of Cheiro’s seven hand types: a hand whose fingers each belong to a different type.',
    owner: '/hand-types/',
    hiCheck: true,
  },
  {
    id: 'phalanges',
    name: { en: 'Phalanges', hi: 'पोर' },
    alt: ['phalanx', 'finger sections'],
    group: 'finger',
    def: 'The phalanges are the sections of a finger between its joints: three in each finger, two in the thumb. Palmistry books compare their lengths.',
    owner: '/palmistry-fingers/',
    hiCheck: true,
  },
  {
    id: 'knotty-fingers',
    name: { en: 'Knotty fingers', hi: 'गांठदार उंगलियां' },
    alt: ['knotted fingers'],
    group: 'finger',
    def: 'Knotty fingers have joints that stand out. The classical books read them as a mind that analyses and weighs details before acting.',
    owner: '/palmistry-fingers/',
    hiCheck: true,
  },
  {
    id: 'smooth-fingers',
    name: { en: 'Smooth fingers', hi: 'चिकनी उंगलियां' },
    group: 'finger',
    def: 'Smooth fingers have joints that don’t stand out. The classical books read them as quick, intuitive thinking that acts on impulse.',
    owner: '/palmistry-fingers/',
    hiCheck: true,
  },
  {
    id: 'm-sign',
    name: { en: 'Letter M', hi: 'हाथ में M का निशान' },
    alt: ['m sign', 'm on palm', 'm in hand'],
    group: 'sign',
    def: 'The letter M is not a separate mark: the heart, head and life lines (often with the fate line) draw an M across the palm. It is a modern idea; no classical book reads it.',
    owner: '/palmistry-m/',
  },
  {
    id: 'mystic-cross',
    name: { en: 'Mystic cross', hi: 'रहस्यमय क्रॉस' },
    alt: ['croix mystique'],
    group: 'sign',
    def: 'The mystic cross is a small cross standing on its own between the heart and head lines. Cheiro read it as a gift for, and interest in, mysticism.',
    owner: '/palm-crosses/',
  },
  {
    id: 'star',
    name: { en: 'Star', hi: 'तारा' },
    group: 'sign',
    def: 'A star is three or more short lines crossing at one point, usually on a mount. Cheiro read it as heightening whatever that mount stands for.',
    owner: '/lucky-signs/',
  },
  {
    id: 'triangle',
    name: { en: 'Triangle', hi: 'त्रिभुज' },
    group: 'sign',
    def: 'A triangle is a small, clearly formed triangle on a mount. Cheiro read it by the mount it sits on, for example a talent for managing people under the index finger.',
    owner: '/lucky-signs/',
  },
  {
    id: 'island',
    name: { en: 'Island', hi: 'द्वीप' },
    group: 'sign',
    def: 'An island is a small oval loop where a line splits and joins up again. The old books read it as weakness or illness; palm lines are not a health test.',
    owner: '/tools/palm-signs-checker/',
  },
  {
    id: 'fish',
    name: { en: 'Fish (matsya)', hi: 'मछली का निशान' },
    alt: ['matsya', 'fish sign'],
    group: 'sign',
    def: 'The fish (matsya) is a small fish-shaped mark near the base of the palm. Indian palmistry books count it among the auspicious signs.',
    owner: '/lucky-signs/',
  },
  {
    id: 'trident',
    name: { en: 'Trident (trishul)', hi: 'त्रिशूल' },
    alt: ['trishul'],
    group: 'sign',
    def: 'The trident (trishul) is three short lines rising from one stem. Chhotelal Jain (1927) read it as the sign of a generous, religious-minded person.',
    owner: '/lucky-signs/',
  },
  {
    id: 'cross',
    name: { en: 'Cross', hi: 'क्रॉस' },
    alt: ['cross sign'],
    group: 'sign',
    def: 'A cross is two short lines crossing on the palm. The classical books read a cross by where it sits; the best known is the mystic cross.',
    owner: '/palm-crosses/',
    hiCheck: true,
  },
  {
    id: 'square',
    name: { en: 'Square', hi: 'वर्ग' },
    group: 'sign',
    def: 'A square is four short lines forming a small box, often over a line. Cheiro called it a mark of preservation, read as protection over a break.',
    owner: '/lucky-signs/',
    hiCheck: true,
  },
  {
    id: 'grille',
    name: { en: 'Grille', hi: 'जाली' },
    alt: ['grid'],
    group: 'sign',
    def: 'A grille is a small net of crossing lines, usually on a mount. The classical books read it as working against the qualities of that mount.',
    owner: null,
    hiCheck: true,
  },
  {
    id: 'chain',
    name: { en: 'Chained line', hi: 'जंजीरदार रेखा' },
    alt: ['chain', 'chained'],
    group: 'sign',
    def: 'A chained line is made of small linked loops instead of one clear crease. The classical books read it as a less settled stretch of that line.',
    owner: null,
    hiCheck: true,
  },
  {
    id: 'line-fork',
    name: { en: 'Fork', hi: 'द्विशाखा' },
    alt: ['forked line', 'writer’s fork'],
    group: 'reading',
    def: 'A fork is a line that splits into two branches, usually at its end. The best known is the head line’s writer’s fork.',
    owner: '/head-line/',
    hiCheck: true,
  },
  {
    id: 'sister-line',
    name: { en: 'Sister line', hi: 'सहायक रेखा' },
    alt: ['sister lines'],
    group: 'reading',
    def: 'A sister line is a second line running close beside a main line. The best known is the line of Mars beside the life line.',
    owner: '/hand-lines/',
    hiCheck: true,
  },
  {
    id: 'influence-lines',
    name: { en: 'Influence lines', hi: 'प्रभाव रेखाएं' },
    group: 'reading',
    def: 'Influence lines are fine lines that run beside or cross a main line. The classical books read them as other people’s influence in that part of life.',
    owner: null,
    hiCheck: true,
  },
  {
    id: 'quadrangle',
    name: { en: 'Quadrangle', hi: 'चतुष्कोण' },
    group: 'reading',
    def: 'The quadrangle is the space between the heart line and the head line. The classical books read its width for how broad-minded a person is.',
    owner: '/palm-crosses/',
    hiCheck: true,
  },
  {
    id: 'flexion-crease',
    name: { en: 'Flexion crease', hi: 'मोड़ की रेखा' },
    alt: ['flexion creases', 'palm crease'],
    group: 'science',
    def: 'A flexion crease is a line in the skin where it folds as a joint bends. Palm lines are flexion creases, and most form before birth.',
    owner: '/hand-lines/',
    hiCheck: true,
  },

  // Semantic SEO Phase 3 (WEB-FEAT-040/037): money and work words. Sources: Dale (1895), Heron-Allen (1885),
  // Markun (1927), Raphael (1901), Frith (1895), Benham (1900), read in the corpus texts 2026-10-01.
  {
    id: 'money-triangle',
    name: { en: 'Money triangle', hi: 'धन त्रिकोण' },
    group: 'sign',
    def: 'The money triangle is a modern name for the small space the head, fate and Mercury lines can close. Older books read that triangle as an interest in the occult, not money.',
    owner: '/money-line/',
    hiCheck: true,
  },
  {
    id: 'line-of-fortune',
    name: { en: 'Line of fortune', hi: 'फ़ॉर्च्यून रेखा' },
    group: 'reading',
    def: 'Line of fortune is an old name that different books give to different lines: the heart line in Dale’s Indian Palmistry, the fate line in Heron-Allen and Markun.',
    owner: '/money-line/',
    hiCheck: true,
  },
  {
    id: 'business-line',
    name: { en: 'Business line', hi: 'व्यापार रेखा' },
    group: 'reading',
    def: 'Business line is a modern name used for different lines. No classical book we use names one; the nearest is Benham reading the Mercury line as a guide to business.',
    owner: '/career-palmistry/',
    hiCheck: true,
  },
  {
    id: 'career-palmistry',
    name: { en: 'Career palmistry', hi: 'करियर हस्तरेखा' },
    alt: ['job palmistry', 'palm reading for career'],
    group: 'reading',
    def: 'Career palmistry reads the hand for how you like to work: mainly the fate, head and sun lines, the mounts and the hand’s shape. It describes working style; it can’t choose a job.',
    owner: '/career-palmistry/',
    hiCheck: true,
  },
] as const satisfies readonly Entity[];

export type EntityId = (typeof ENTITY_LIST)[number]['id'];

export const ENTITIES: readonly Entity[] = ENTITY_LIST;

const BY_ID = new Map<string, Entity>(ENTITIES.map((entity) => [entity.id, entity]));

export function isEntityId(id: string): id is EntityId {
  return BY_ID.has(id);
}

export function entity(id: EntityId): Entity {
  const found = BY_ID.get(id);
  if (!found) throw new Error(`entities: unknown id ${id}`);
  return found;
}

/** The term's stable `@id`, a path on the (future) glossary page: `/palmistry-terms/#heart-line`. */
export function entityPath(id: EntityId): string {
  return `${TERMS_PATH}#${id}`;
}

/** `sameAs` URLs in plan order: Wikidata, then English Wikipedia, then Hindi Wikipedia (Hindi first on Hindi pages). */
export function entitySameAs(item: Entity, locale: 'en' | 'hi' = 'en'): string[] {
  if (!item.wikidata) return [];
  const wiki = (lang: 'en' | 'hi', title: string) => `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
  const en = item.wikipedia ? [wiki('en', item.wikipedia)] : [];
  const hi = item.hiwiki ? [wiki('hi', item.hiwiki)] : [];
  return [`https://www.wikidata.org/wiki/${item.wikidata}`, ...(locale === 'hi' ? [...hi, ...en] : [...en, ...hi])];
}

/**
 * The authors of the cited books (src/lib/guides/books.ts) that have a verified Wikidata item of
 * the SAME person (checked live 2026-09-28). Others (Markun, Frith, Benham, Dale, …) get no sameAs:
 * Q18911751 "Henry Frith" and Q115901021 "Leo Markun" could not be tied to the palmistry books.
 */
export const AUTHOR_SAME_AS: Readonly<Record<string, readonly string[]>> = {
  Cheiro: ['https://www.wikidata.org/wiki/Q728021', 'https://en.wikipedia.org/wiki/Cheiro'],
  'Edward Heron-Allen': ['https://www.wikidata.org/wiki/Q5343439', 'https://en.wikipedia.org/wiki/Edward_Heron-Allen'],
  'Adolphe Desbarrolles': ['https://www.wikidata.org/wiki/Q2824807', 'https://en.wikipedia.org/wiki/Adolphe_Desbarrolles'],
};

/** Every Wikidata item this file uses (for the yearly re-check, plan §5.3 rule 3). */
export function wikidataIds(): string[] {
  const ids = new Set<string>();
  for (const item of ENTITIES) {
    if (item.wikidata) ids.add(item.wikidata);
    if (item.relatedWikidata) ids.add(item.relatedWikidata);
  }
  for (const urls of Object.values(AUTHOR_SAME_AS)) for (const url of urls) if (url.includes('wikidata.org')) ids.add(url.split('/').pop()!);
  return [...ids].sort();
}

export interface PageEntities {
  /** 1–2 main entities of the page (plan §5.1). */
  about: readonly EntityId[];
  /** Other entities the page really talks about (≤ 8). */
  mentions?: readonly EntityId[];
}

const HOME: PageEntities = { about: ['palmistry'], mentions: ['palm-lines', 'heart-line', 'head-line', 'life-line', 'fate-line'] };
const APP: PageEntities = { about: ['palmistry'], mentions: ['palm-lines', 'heart-line', 'head-line', 'life-line', 'fate-line'] };

/**
 * `about` / `mentions` per built page (content pages; the legal and trust pages describe the
 * company, not a palmistry term). Every mention must appear in the page's visible text:
 * scripts/check-web.mjs checks it on the build.
 */
export const PAGE_ENTITIES: Readonly<Record<string, PageEntities>> = {
  '/': HOME,
  '/hi/': HOME,
  '/app/': APP,
  '/hi/app/': APP,
  // Guides
  '/palm-reading/': {
    about: ['palmistry'],
    mentions: ['palm-lines', 'which-hand', 'hand-shape', 'heart-line', 'head-line', 'life-line', 'fate-line', 'chirognomy'],
  },
  '/hand-lines/': { about: ['palm-lines'], mentions: ['palmistry', 'heart-line', 'head-line', 'life-line', 'fate-line', 'palm'] },
  '/heart-line/': { about: ['heart-line'], mentions: ['palmistry', 'palm-lines', 'head-line', 'simian-line', 'quadrangle', 'sister-line', 'marriage-line'] },
  '/head-line/': { about: ['head-line'], mentions: ['palmistry', 'palm-lines', 'heart-line', 'life-line', 'double-head-line', 'quadrangle', 'mount-jupiter', 'simian-line'] },
  '/head-line/double/': { about: ['double-head-line'], mentions: ['head-line', 'palmistry', 'simian-line'] },
  '/life-line/': { about: ['life-line'], mentions: ['palmistry', 'palm-lines', 'fate-line', 'thumb', 'mount-venus', 'island', 'square', 'influence-lines'] },
  '/fate-line/': { about: ['fate-line'], mentions: ['palmistry', 'palm-lines', 'life-line', 'head-line', 'mount-venus', 'mount-moon', 'square', 'island'] },
  '/is-palmistry-real/': { about: ['palmistry'], mentions: ['astrology', 'barnum-effect', 'palm-lines', 'pseudoscience', 'dermatoglyphics', 'flexion-crease'] },
  '/which-hand-to-read/': { about: ['which-hand'], mentions: ['palmistry', 'dominant-hand', 'palm-lines', 'hand'] },
  '/marriage-line/': { about: ['marriage-line'], mentions: ['palmistry', 'heart-line', 'mount-mercury', 'island'] },
  '/simian-line/': { about: ['simian-line'], mentions: ['heart-line', 'head-line', 'palmistry'] },
  // P2 guides (WEB-DEC-054)
  '/palm-mounts/': { about: ['palm-mounts'], mentions: ['mount-jupiter', 'mount-saturn', 'mount-sun', 'mount-mercury', 'mount-venus', 'mount-moon', 'plain-of-mars', 'palmistry'] },
  '/hand-types/': { about: ['hand-shape'], mentions: ['earth-hand', 'air-hand', 'fire-hand', 'water-hand', 'square-hand', 'conic-hand', 'chirognomy', 'fingers'] },
  '/palmistry-fingers/': { about: ['fingers'], mentions: ['thumb', 'phalanges', 'knotty-fingers', 'smooth-fingers', 'palm-mounts', 'flexion-crease', 'hand-shape', 'palmistry'] },
  '/sun-line/': { about: ['sun-line'], mentions: ['fate-line', 'mount-sun', 'palm-lines', 'hand-shape', 'palmistry'] },
  '/palm-crosses/': { about: ['cross', 'mystic-cross'], mentions: ['quadrangle', 'palm-signs', 'palm-mounts', 'heart-line', 'head-line', 'palmistry'] },
  // Phase 3 guides (WEB-FEAT-039/046/040/037)
  '/palmistry-m/': { about: ['m-sign'], mentions: ['heart-line', 'head-line', 'life-line', 'fate-line', 'palm-lines', 'simian-line', 'mystic-cross', 'palmistry'] },
  '/lucky-signs/': { about: ['palm-signs'], mentions: ['star', 'triangle', 'square', 'fish', 'trident', 'island', 'palm-mounts', 'palmistry'] },
  '/money-line/': { about: ['money-line'], mentions: ['fate-line', 'sun-line', 'head-line', 'mercury-line', 'money-triangle', 'line-of-fortune', 'mount-mercury', 'palmistry'] },
  '/career-palmistry/': { about: ['career-palmistry'], mentions: ['fate-line', 'head-line', 'sun-line', 'hand-shape', 'mount-jupiter', 'mount-mercury', 'business-line', 'palmistry'] },
  // Phase 3 guides B (WEB-FEAT-036/045/058)
  '/life-line/broken/': { about: ['broken-life-line'], mentions: ['life-line', 'square', 'sister-line', 'line-of-mars', 'influence-lines', 'palm-lines', 'palmistry'] },
  '/mercury-line/': { about: ['mercury-line'], mentions: ['mount-mercury', 'mount-moon', 'sun-line', 'marriage-line', 'via-lasciva', 'flexion-crease', 'palm-lines', 'palmistry'] },
  '/children-line/': { about: ['children-lines'], mentions: ['marriage-line', 'heart-line', 'mount-mercury', 'samudrika-shastra', 'palm-lines', 'palmistry'] },
  '/history-of-palmistry/': { about: ['palmistry'], mentions: ['chiromancy', 'chirognomy', 'samudrika-shastra', 'divination', 'palmist', 'palm-lines', 'hand-shape', 'pseudoscience'] },
  // The glossary (WEB-DEC-053): about palmistry; its DefinedTermSet lists every term of this file.
  [TERMS_PATH]: { about: ['palmistry'], mentions: ['palm-lines', 'palm-mounts', 'hand-shape', 'fingers', 'palm-signs', 'heart-line', 'head-line', 'life-line'] },
  // The blog index (WEB-DEC-057); each post sets its own about/mentions in its front matter.
  '/blog/': { about: ['palmistry'], mentions: ['palm-lines'] },
  // Tools
  '/tools/': { about: ['palmistry'], mentions: ['palm-lines', 'hand-shape', 'fingers'] },
  '/tools/palm-photo-checker/': { about: ['palm-lines'], mentions: ['palm'] },
  '/tools/heart-line-finder/': { about: ['heart-line'] },
  '/tools/head-line-finder/': { about: ['head-line'] },
  '/tools/life-line-finder/': { about: ['life-line'] },
  '/tools/fate-line-finder/': { about: ['fate-line'] },
  '/tools/which-hand-quiz/': { about: ['which-hand'], mentions: ['dominant-hand'] },
  '/tools/hand-type-quiz/': { about: ['hand-shape'], mentions: ['fingers'] },
  '/tools/finger-reader/': { about: ['fingers'], mentions: ['thumb'] },
  '/tools/left-vs-right-palm/': { about: ['which-hand'], mentions: ['palm-lines'] },
  '/tools/palm-signs-checker/': { about: ['palm-signs'], mentions: ['palm-lines'] },
  '/tools/palm-map/': { about: ['palm-lines', 'palm-mounts'] },
  '/tools/palm-reading-quiz/': { about: ['palmistry'] },
  '/tools/palm-line-finder/': { about: ['palm-lines'] },
};

/** Paths that describe the company or the rules, not a palmistry term (no `about` term needed). */
export const PAGES_WITHOUT_ENTITIES: readonly string[] = [
  '/privacy/',
  '/terms/',
  '/refunds/',
  '/about/',
  '/editorial-policy/',
  '/about/deepak-chauhan/',
  '/delete-account/',
  '/reset-password/',
  '/privacy',
  '/terms',
  '/delete-account',
  '/reset-password',
  '/404',
  '/reading/',
  '/account/',
  '/hi/account/',
];

export function pageEntities(path: string): PageEntities | null {
  return PAGE_ENTITIES[path] ?? null;
}
