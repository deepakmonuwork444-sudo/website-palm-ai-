// COPIED from palm-ai-new--feat-m1-foundation/src/features/knowledge/corpus-rules.ts at app commit 38389f51b74d (2026-09-26).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import type { TraitId } from './traits';
import type { ConditionValue, KbRule, RuleCategory, RuleCitation, RuleCondition, RuleTrait } from './types';

/**
 * Rules extracted from the corpus v1 books, 2026-09-15.
 *   First pass:  the heart line, the fate line, and the first "Money and effort" rules.
 *   Second pass: the head line, the life line, and the mounts.
 *   Third pass (2026-09-16): gaps in those features (broken and faint lines,
 *   long and chained life lines), more of Dale's Indian readings, and the
 *   first conflict pair.
 *
 * How each rule was made:
 *   1. The chapter on the feature was read in the downloaded text.
 *   2. The rule names the book and chapter it came from (`citations`).
 *   3. A short verbatim phrase from that chapter is recorded in
 *      `tools/extract/citations.ts`, and a test finds it in the downloaded
 *      book. A rule its source does not actually support fails the build.
 *   4. The meaning is our own plain wording. Where a book predicts — money
 *      that will come, a tragedy, a death, a crime, an illness — only the part
 *      that describes a tendency is kept. The rest is recorded there as a
 *      blocked claim, so it is a decision on file rather than something missed.
 *
 * Every rule stays `draft` until a person checks it against the page. A
 * script or a model writing a rule down never validates it. The check is done
 * on the review sheet (`npm run review:sheet`), and only
 * `npm run review:apply` sets `status` or `hindiReviewed` below — each change
 * it makes is logged in `knowledge/review-log.json`, and a test fails if a
 * rule is marked reviewed without a log entry saying a person did it.
 *
 * `meaningHi` / `caveatHi` are draft Hindi: plain everyday Hindi saying
 * exactly what the English says, with the same hedging and nothing added.
 * They reach a report only when the rule is `human_reviewed` AND its Hindi is
 * `hindiReviewed` (see `features/reading/localise.ts`).
 *
 * Zones follow the definitions in the extraction prompt: the heart line ends
 * under the fingers, the fate line starts near the wrist, the life and head
 * lines start on the thumb side.
 *
 * The two Mars mounts are matched to the books by POSITION, not by name.
 * Cheiro's "first" (positive) Mars lies inside the life line on the thumb
 * side; his "second" (negative, "mental") Mars lies on the outer edge. This
 * app's taxonomy names them the other way round — `mars_negative` is the
 * thumb side, `mars_positive` the outer edge (see `MOUNT_META` and the
 * prompt). Matching by name would have swapped their meanings.
 *
 * The life line carries no reading about health or length of life, whatever
 * the books say. Its rules describe energy and temperament only.
 *
 * Dale's single Mount of Mars sits "on the side of the palm", and her Line of
 * Temper runs "vertically from mount of Mars to mount of Moon" — so it is the
 * outer-edge mount, `mars_positive` here.
 *
 * Conflict groups. Two rules share a `conflictGroup` only where the books
 * genuinely read the same feature in opposite ways, and only across
 * traditions. Both rules in a group must be in the same category: the engine
 * looks for conflicts section by section, so a pair split across two
 * categories would never be shown as a disagreement.
 *
 * Disagreements found but NOT shipped as a pair, because Dale's side is a
 * character accusation and sits in the blocked register instead:
 *   - head line forking toward the Moon: literary talent (Cheiro) against
 *     hypocrisy (Dale);
 *   - heart line ending under the middle finger: reserved affection (Cheiro)
 *     against vanity and lying (Dale);
 *   - fate line broken: a change of occupation (Cheiro, Markun) against a fall
 *     (Dale).
 */

const WC = 'western_classical';
const IHR = 'indian_hast_rekha';

const PFA = 'cheiro-palmistry-for-all-1916';
const LOTH = 'cheiro-language-of-the-hand-1900';
const MARKUN = 'markun-what-you-should-know-about-palmistry-1927';
const DALE = 'dale-indian-palmistry-1895';

const PFA_HEAD = 'Part I, ch. II — The Line of Head';
const PFA_LIFE = 'Part I, ch. III — The Line of Life';
const PFA_FATE = 'Part I, ch. V — The Line of Destiny or Fate';
const PFA_SUN = 'Part I, ch. VI — The Line of the Sun';
const PFA_HEART = 'Part I, ch. VII — The Line of Heart';
const PFA_CLASSES = 'Part I, ch. XVII — Different Classes of Lines';
const PFA_MARS = 'Part II, ch. VI — The Mount of Mars';
const PFA_JUPITER = 'Part II, ch. VII — The Mount of Jupiter';
const PFA_SATURN = 'Part II, ch. VIII — The Mount of Saturn';
const PFA_SUN_MOUNT = 'Part II, ch. IX — The Mount of the Sun';
const PFA_MERCURY = 'Part II, ch. X — The Mount of Mercury';
const PFA_MOON = 'Part II, ch. XI — The Mount of the Moon';
const PFA_VENUS = 'Part II, ch. XII — The Mount of Venus';
const LOTH_MOUNTS = 'Part I, ch. XV — The Mounts, pp. 63–65';
const LOTH_LIFE = 'Part II, ch. V — The Line of Life, pp. 79–85';
const LOTH_HEAD = 'Part II, ch. VII — The Line of Head, pp. 87–90';
const LOTH_HEART = 'Part II, ch. X — The Line of Heart, pp. 98–101';
const LOTH_FATE = 'Part II, ch. XI — The Line of Fate, pp. 102–105';
const MARKUN_MOUNTS = 'the section on the mounts';
const MARKUN_LINES = 'the opening of the section on the lines';
const MARKUN_LIFE = 'the section on the Line of Life';
const MARKUN_HEART = 'the section on the Heart Line';
const MARKUN_HEAD = 'the section on the Line of the Head';
const MARKUN_FATE = 'the section on the Fate Line';
const MARKUN_APOLLO = 'the section on the Line of Apollo';
const DALE_SATURN = 'The Line of Saturn — the old name for the fate line';
const DALE_FORTUNE = 'The Line of Fortune — the old name for the heart line';
const DALE_LIVER = 'The Liver Line — the old name for the head line';
const DALE_VIA_SOLIS = 'The Via Solis — the old name for the sun line';
const DALE_PLANET_SATURN = 'The Planet Saturn — its mount and the Line of Saturn';
const DALE_REF_SATURN = 'References to the Hand, No. 2 — the Mount of Saturn';
const DALE_REF_SUN = 'References to the Hand, No. 3 — the Mount of the Sun';
const DALE_REF_MOON = 'References to the Hand, No. 14 — the Mount of the Moon';
const DALE_REF_MARS = 'References to the Hand, No. 15 — the Mount of Mars';
const DALE_REF_VENUS = 'References to the Hand, No. 16 — the Mount of Venus';
const DALE_MARS = 'The Planet Mars';
const DALE_MOON = 'The Moon — its mount';
const DALE_VENUS = 'The Rule to Tell the Planets — Venus';
const DALE_LIFE = 'The Line of Life';

// ---- fifth pass (2026-09-18): the other catalogued books ----
const BENHAM = 'benham-laws-of-scientific-hand-reading-1900';
const GUIDE = 'cheiro-guide-to-the-hand-1900';
const FRITH = 'frith-practical-palmistry-1895';
const HAM = 'heron-allen-manual-of-cheirosophy-1885';
const HAP = 'heron-allen-practical-cheirosophy-1887';
const RAPH = 'raphael-cheirosophy-1901';
const SG = 'saint-germain-practice-of-palmistry-1900';
const STH = 'st-hill-grammar-of-palmistry-1893';
const DESB = 'desbarrolles-chiromancie-nouvelle-1859';
const WILL = 'williams-key-to-palmistry-1902';
const JAIN = 'jain-samudrik-shastra-1927';

const BENHAM_HEART = 'Part II, ch. V — The Line of Heart, pp. 389–393';
const BENHAM_HEAD = 'Part II, ch. VI — The Line of Head, pp. 426–443';
const BENHAM_LIFE = 'Part II, ch. VII — The Line of Life, pp. 470–472';
const GUIDE_LIFE = 'Ch. XI — The Line of Life, pp. 71–72';
const GUIDE_HEAD = 'Ch. XII — The Line of Head, pp. 79–82';
const GUIDE_HEART = 'Ch. XIII — The Line of Heart, pp. 84–88';
const GUIDE_FATE = 'Ch. XIV — The Line of Fate, p. 89';
const FRITH_HEART = 'The Heart Line, pp. 57–59';
const FRITH_HEAD = 'The Head Line, pp. 65–68';
const FRITH_FATE = 'The Fate Line, p. 88';
const HAM_HEART = 'Cheiromancy, § 2 — The Line of Heart, ¶¶ 551–553, pp. 244–245';
const HAM_HEAD = 'Cheiromancy, § 3 — The Line of Head, ¶ 582, p. 250';
const HAP_HEART = 'Cheiromancy or Palmistry — the Line of Heart, pp. 114–115';
const HAP_HEAD = 'Cheiromancy or Palmistry — the Line of Head, p. 113';
const RAPH_HEART = 'The Heart Line, pp. 121–124';
const RAPH_HEAD = 'The Head Line, pp. 113–115';
const RAPH_LIFE = 'The Life Line, p. 103';
const RAPH_FATE = 'The Fate Line, p. 132';
const SG_HEART = 'The Line of Heart — I–II, Position and Length, pp. 242–243';
const SG_HEAD = 'The Line of Head — Direction, Length, Starting Points, Termination, pp. 214–223';
const STH_HEART = 'Line of Heart (Mensal), pp. 46–47';
const STH_HEAD = 'Line of Head (Cerebral), pp. 40–42';
const DESB_HEART = 'Ligne de cœur, pp. 215–216';
const DESB_HEAD = 'Ligne de tête, pp. 220–221';
const WILL_LIFE = 'The Life Line of Action';
const JAIN_HEART = 'आयु-रेखा (the top line, i.e. the heart line), pp. 10–11';
const JAIN_FATE = 'ऊर्ध्वरेखा (the fate line), p. 16';

// Old books name a region by its mount; the vision layer may name the same
// spot by the finger above it. Both spellings mean one place.
const UNDER_INDEX = ['jupiter', 'under_index'] as const;
const UNDER_MIDDLE = ['saturn', 'under_middle'] as const;
const UNDER_RING = ['apollo', 'under_ring'] as const;
const UNDER_LITTLE = ['mercury', 'under_little'] as const;
/** Cheiro's first Mars: thumb side, inside the life line. */
const THUMB_SIDE_MARS = 'mars_negative';
/** Cheiro's second, "mental" Mars: the outer edge of the palm. */
const OUTER_MARS = 'mars_positive';

const NOT_A_RESULT =
  'The old books call this a sign of success. Here it describes where effort tends to go, not what it will bring.';
const NOT_A_RESULT_HI =
  'पुरानी किताबें इसे सफलता का संकेत कहती हैं। यहाँ यह सिर्फ़ बताता है कि मेहनत किस ओर जाती है, यह नहीं कि उससे क्या मिलेगा।';
const NOT_A_HEALTH_TEST =
  'The old books also read this form as a sign of physical health. That is not claimed here — palm lines are not a health test.';
const NOT_A_HEALTH_TEST_HI =
  'पुरानी किताबें इस रूप को शारीरिक सेहत का संकेत भी मानती हैं। यहाँ ऐसा दावा नहीं किया गया — हाथ की रेखाएँ सेहत की जाँच नहीं हैं।';
/** Dale reads a short and a severed heart line the same way: the reverse of constancy. */
const DALE_LESS_CONSTANT =
  'Attachment that is slower to hold steady — the reverse of the constancy this tradition reads in a long, unbroken heart line.';
const DALE_LESS_CONSTANT_HI =
  'ऐसा लगाव जिसे स्थिर होने में ज़्यादा समय लगता है — यह उस स्थिरता का उल्टा है जो यह परंपरा लंबी, बिना टूटी हृदय रेखा में पढ़ती है।';
const DALE_NOT_A_PREDICTION =
  'A tendency in how attachment holds, not a prediction about any relationship. The book also reverses its claim about bodily strength; that is left out.';
const DALE_NOT_A_PREDICTION_HI =
  'यह लगाव के टिके रहने के ढंग का एक झुकाव है, किसी रिश्ते के बारे में भविष्यवाणी नहीं। किताब शारीरिक ताक़त वाली अपनी बात को भी यहाँ उलट देती है; वह हिस्सा छोड़ दिया गया है।';

function cite(sourceId: string, locator: string): RuleCitation {
  return { sourceId, locator };
}

function when(path: string, operator: RuleCondition['operator'], value: ConditionValue): RuleCondition {
  return { path, operator, value };
}

/** A trait this rule's evidence speaks to. The role is the rule's, not the trait's (see `types.ts`). */
function t(id: TraitId, role: RuleTrait['role'] = 'strength'): RuleTrait {
  return { id, role };
}

interface Spec {
  id: string;
  tradition: string;
  conditions: RuleCondition[];
  category: RuleCategory;
  meaning: string;
  /** Required: every corpus rule carries draft Hindi for the reviewer to check. */
  meaningHi: string;
  caveat?: string;
  caveatHi?: string;
  /** Required: at least one trait, reflecting `meaning` and nothing more. */
  traits: RuleTrait[];
  /** `strong` only where this rule alone names a whole life-area pattern. Absent means `normal`. */
  weight?: KbRule['weight'];
  /** Required: the evidence phrase, one `{path}` placeholder per condition path. */
  short: string;
  /** Required: draft Hindi of `short`, same placeholders. */
  shortHi: string;
  cites: RuleCitation[];
  minConfidence?: number;
  conflictGroup?: string;
  /** Written only by `npm run review:apply`. Absent means `draft`. */
  status?: KbRule['validationStatus'];
  /** Written only by `npm run review:apply`. Absent means not yet checked. */
  hindiReviewed?: boolean;
}

/**
 * A caveat that refuses or strips a claim the books make (health, fertility,
 * length of life, children, marriage, a darker judgement of character, or a
 * promise that was "refused" / "left out" / "not repeated"). Those are
 * provenance, not reading: stacked refusals made the report feel like it kept
 * saying what it will not tell (expert report C; BUG-016).
 *
 * Ordinary hedges stay visible (audit 2026-09-23): "not what it will bring",
 * "a photo cannot show …", or a caveat that merely names success, luck, travel,
 * a cause or a season. Those words used to hide 15 useful caveats.
 */
const PROVENANCE_CAVEAT =
  /health|fertil|length of life|long life|lifespan|children|marriage|refused|left out|not claimed|not repeated|count of years|bodily|desire|passion|harsh|gloom|melanchol|sadness|selfish|trick|quarrel|vanity|dominate|coldness/i;

export function isProvenanceCaveat(caveat: string | null | undefined): boolean {
  return typeof caveat === 'string' && PROVENANCE_CAVEAT.test(caveat);
}

function rule(spec: Spec): KbRule {
  return {
    ruleId: spec.id,
    tradition: spec.tradition,
    conditions: spec.conditions,
    // Higher than the seed floor: a rule with a real source should not be the
    // one that fires on a half-seen feature.
    minConfidence: spec.minConfidence ?? 0.6,
    interpretation: {
      category: spec.category,
      meaning: spec.meaning,
      caveat: spec.caveat ?? null,
      ...(isProvenanceCaveat(spec.caveat) ? { caveatScope: 'provenance' as const } : {}),
      meaningHi: spec.meaningHi,
      caveatHi: spec.caveatHi ?? null,
    },
    sourceIds: [...new Set(spec.cites.map((c) => c.sourceId))],
    citations: spec.cites,
    specificity: spec.conditions.length,
    conflictGroup: spec.conflictGroup ?? null,
    validationStatus: spec.status ?? 'draft',
    hindiReviewed: spec.hindiReviewed ?? false,
    traits: spec.traits,
    weight: spec.weight ?? 'normal',
    short: spec.short,
    shortHi: spec.shortHi,
  };
}

export const CORPUS_RULES: KbRule[] = [
  // ======== heart line ========
  rule({
    id: 'cx-heart-end-index',
    tradition: WC,
    conditions: [when('line.heart.end_zone', 'in', UNDER_INDEX)],
    category: 'relationships',
    meaning:
      'Loyal, steady affection held to high ideals — once you are truly attached, you tend to stay attached.',
    meaningHi:
      'ऊँचे आदर्शों वाला, वफ़ादार और टिकाऊ स्नेह — जब आप सच में किसी से जुड़ जाते हैं, तो अक्सर जुड़े ही रहते हैं।',
    caveat: 'A tendency in how affection is given, not a prediction about any relationship.',
    caveatHi: 'यह स्नेह देने के ढंग का एक झुकाव है, किसी रिश्ते के बारे में भविष्यवाणी नहीं।',
    traits: [t('loyal'), t('affectionate'), t('idealistic')],
    weight: 'strong',
    short: 'heart line ending {line.heart.end_zone}',
    shortHi: '{line.heart.end_zone} ख़त्म होती हृदय रेखा',
    cites: [cite(PFA, PFA_HEART), cite(LOTH, LOTH_HEART), cite(MARKUN, MARKUN_HEART)],
  }),
  rule({
    id: 'cx-heart-end-between',
    tradition: WC,
    conditions: [when('line.heart.end_zone', 'eq', 'between_jupiter_and_saturn')],
    category: 'emotional_life',
    meaning:
      'A calm but deep way of caring — not showy in love, but willing to do a great deal for the people you care about.',
    meaningHi:
      'परवाह करने का शांत लेकिन गहरा तरीका — प्यार में दिखावा नहीं, पर जिनकी परवाह करते हैं उनके लिए बहुत कुछ करने को तैयार।',
    traits: [t('affectionate'), t('reserved', 'neutral')],
    weight: 'strong',
    short: 'heart line ending {line.heart.end_zone}',
    shortHi: '{line.heart.end_zone} ख़त्म होती हृदय रेखा',
    cites: [cite(PFA, PFA_HEART), cite(LOTH, LOTH_HEART), cite(MARKUN, MARKUN_HEART), cite(RAPH, RAPH_HEART)],
  }),
  rule({
    id: 'cx-heart-end-middle',
    tradition: WC,
    conditions: [when('line.heart.end_zone', 'in', UNDER_MIDDLE)],
    category: 'relationships',
    meaning:
      'Affection that is private and not often put on display, alongside a clear sense of what you want from a relationship.',
    meaningHi:
      'ऐसा स्नेह जो निजी रहता है और कम ही दिखाया जाता है, साथ में यह साफ़ समझ कि आप किसी रिश्ते से क्या चाहते हैं।',
    caveat: 'The old books judge this form harshly. Only the part that describes a style of affection is kept.',
    caveatHi:
      'पुरानी किताबें इस रूप को कठोरता से आँकती हैं। यहाँ सिर्फ़ वह हिस्सा रखा गया है जो स्नेह के ढंग के बारे में है।',
    traits: [t('reserved'), t('practical', 'neutral')],
    weight: 'strong',
    short: 'heart line ending {line.heart.end_zone}',
    shortHi: '{line.heart.end_zone} ख़त्म होती हृदय रेखा',
    cites: [cite(PFA, PFA_HEART), cite(LOTH, LOTH_HEART)],
  }),
  rule({
    id: 'cx-heart-short',
    tradition: WC,
    conditions: [when('line.heart.length', 'eq', 'short')],
    category: 'emotional_life',
    meaning: 'Sentiment is shown sparingly — feelings are not always put into words or gestures.',
    meaningHi: 'भावनाएँ कम ही जताई जाती हैं — मन की बात हमेशा शब्दों या हाव-भाव में नहीं आती।',
    caveat: 'This describes how feeling is shown, not how much is felt.',
    caveatHi: 'यह बताता है कि भावना कैसे दिखाई जाती है, यह नहीं कि कितनी महसूस होती है।',
    traits: [t('reserved')],
    weight: 'strong',
    short: '{line.heart.length} heart line',
    shortHi: '{line.heart.length} हृदय रेखा',
    cites: [cite(PFA, PFA_HEART), cite(FRITH, FRITH_HEART)],
  }),
  rule({
    id: 'cx-heart-deep',
    tradition: WC,
    conditions: [when('line.heart.depth', 'eq', 'deep')],
    category: 'emotional_life',
    meaning:
      'A clearly marked heart line is the form the classical books hold up as the ideal: a warm and steady affectionate nature.',
    meaningHi:
      'साफ़ उभरी हुई हृदय रेखा को पुरानी शास्त्रीय किताबें आदर्श रूप मानती हैं: गर्मजोशी भरा और स्थिर, स्नेही स्वभाव।',
    traits: [t('affectionate'), t('steady')],
    short: '{line.heart.depth} heart line',
    shortHi: '{line.heart.depth} हृदय रेखा',
    cites: [cite(PFA, PFA_HEART), cite(LOTH, LOTH_HEART)],
  }),
  rule({
    id: 'cx-heart-faint',
    tradition: WC,
    conditions: [when('line.heart.depth', 'eq', 'faint')],
    category: 'emotional_life',
    meaning: 'Feelings run quietly under the surface, with a cooler, more detached manner in affection.',
    meaningHi: 'भावनाएँ भीतर ही भीतर चुपचाप रहती हैं, और स्नेह में व्यवहार थोड़ा ठंडा और दूरी वाला रहता है।',
    caveat: 'A manner, not an absence of love. The old wording for this is harsher than anything a photo can support.',
    caveatHi:
      'यह व्यवहार का ढंग है, प्यार की कमी नहीं। पुरानी किताबों के शब्द इसके लिए इतने कठोर हैं कि कोई फोटो उनका साथ नहीं दे सकती।',
    traits: [t('reserved')],
    short: '{line.heart.depth} heart line',
    shortHi: '{line.heart.depth} हृदय रेखा',
    cites: [cite(PFA, PFA_HEART)],
  }),
  rule({
    id: 'cx-heart-chained',
    tradition: WC,
    conditions: [when('line.heart.continuity', 'eq', 'chained')],
    category: 'relationships',
    meaning: 'Attraction forms easily and moves on easily — interest in people shifts more than it settles.',
    meaningHi: 'आकर्षण आसानी से बनता है और आसानी से आगे बढ़ जाता है — लोगों में रुचि टिकने से ज़्यादा बदलती रहती है।',
    caveat: 'Read as a pattern of attraction, not a judgement of character.',
    caveatHi: 'इसे आकर्षण का एक ढर्रा समझें, चरित्र पर कोई फ़ैसला नहीं।',
    traits: [t('changeable', 'neutral')],
    weight: 'strong',
    short: '{line.heart.continuity} heart line',
    shortHi: '{line.heart.continuity} हृदय रेखा',
    cites: [cite(PFA, PFA_HEART), cite(MARKUN, MARKUN_HEART)],
  }),
  rule({
    id: 'cx-heart-fork',
    tradition: WC,
    conditions: [when('line.heart.marks.fork', 'gte', 1)],
    category: 'relationships',
    meaning:
      'A balanced, honest and faithful style of affection — ideals and everyday warmth held together.',
    meaningHi: 'संतुलित, ईमानदार और वफ़ादार स्नेह — आदर्श और रोज़ की गर्मजोशी, दोनों साथ-साथ।',
    caveat: 'The books describe a fork at the finger end of the line. A photo cannot always show where the fork sits.',
    caveatHi:
      'किताबें रेखा के उँगलियों वाले सिरे पर दो शाखाओं (फ़ोर्क) की बात करती हैं। फोटो में हमेशा नहीं दिखता कि यह फ़ोर्क कहाँ है।',
    traits: [t('loyal'), t('even_tempered')],
    short: 'heart line with a fork ({line.heart.marks.fork})',
    shortHi: 'हृदय रेखा में फ़ोर्क ({line.heart.marks.fork})',
    cites: [
      cite(PFA, PFA_HEART),
      cite(LOTH, LOTH_HEART),
      cite(MARKUN, MARKUN_HEART),
      cite(GUIDE, GUIDE_HEART),
      cite(STH, STH_HEART),
      cite(RAPH, RAPH_HEART),
    ],
  }),
  rule({
    id: 'cx-heart-branches-up',
    tradition: WC,
    conditions: [when('line.heart.marks.branch_up', 'gte', 2)],
    category: 'relationships',
    meaning: 'Friendship carries real weight — warmth is shared through close, supportive friendships.',
    meaningHi: 'दोस्ती का सच में बड़ा महत्व है — अपनापन करीबी और साथ देने वाली दोस्तियों में बँटता है।',
    traits: [t('sociable'), t('affectionate')],
    short: 'heart line with upward branches ({line.heart.marks.branch_up})',
    shortHi: 'हृदय रेखा पर ऊपर जाती शाखाएँ ({line.heart.marks.branch_up})',
    cites: [cite(MARKUN, MARKUN_HEART)],
  }),
  rule({
    id: 'cx-heart-long-continuous-dale',
    tradition: IHR,
    conditions: [
      when('line.heart.length', 'eq', 'long'),
      when('line.heart.continuity', 'eq', 'continuous'),
    ],
    category: 'relationships',
    meaning: 'Constancy — a steady, dependable nature in attachments.',
    meaningHi: 'स्थिरता — लगाव और रिश्तों में टिकाऊ, भरोसेमंद स्वभाव।',
    caveat: 'The book pairs this with bodily strength. That health claim is left out.',
    caveatHi: 'किताब इसके साथ शारीरिक ताक़त की बात भी जोड़ती है। सेहत से जुड़ा वह दावा यहाँ छोड़ दिया गया है।',
    traits: [t('loyal'), t('steady')],
    short: '{line.heart.length}, {line.heart.continuity} heart line',
    shortHi: '{line.heart.length}, {line.heart.continuity} हृदय रेखा',
    cites: [cite(DALE, DALE_FORTUNE)],
  }),
  rule({
    id: 'cx-heart-short-dale',
    tradition: IHR,
    conditions: [when('line.heart.length', 'eq', 'short')],
    category: 'relationships',
    meaning: DALE_LESS_CONSTANT,
    meaningHi: DALE_LESS_CONSTANT_HI,
    caveat: DALE_NOT_A_PREDICTION,
    caveatHi: DALE_NOT_A_PREDICTION_HI,
    traits: [t('changeable', 'neutral')],
    short: '{line.heart.length} heart line',
    shortHi: '{line.heart.length} हृदय रेखा',
    cites: [cite(DALE, DALE_FORTUNE)],
  }),
  rule({
    id: 'cx-heart-broken-dale',
    tradition: IHR,
    conditions: [when('line.heart.continuity', 'eq', 'broken')],
    category: 'relationships',
    meaning: DALE_LESS_CONSTANT,
    meaningHi: DALE_LESS_CONSTANT_HI,
    caveat: DALE_NOT_A_PREDICTION,
    caveatHi: DALE_NOT_A_PREDICTION_HI,
    traits: [t('changeable', 'neutral')],
    short: '{line.heart.continuity} heart line',
    shortHi: '{line.heart.continuity} हृदय रेखा',
    cites: [cite(DALE, DALE_FORTUNE)],
    // A break is easy to see where there is none; be sure first.
    minConfidence: 0.7,
  }),

  // ======== fate line: where it starts ========
  rule({
    id: 'cx-fate-start-luna',
    tradition: WC,
    conditions: [when('line.fate.start_zone', 'eq', 'luna')],
    category: 'work_and_direction',
    meaning:
      'A path shaped a great deal by other people — work where the public, patrons or partners play a large part.',
    meaningHi:
      'ऐसा रास्ता जिसे दूसरे लोग काफ़ी हद तक बनाते हैं — ऐसा काम जिसमें जनता, सहारा देने वाले संरक्षक या साझेदार बड़ी भूमिका निभाते हैं।',
    caveat: 'Describes where influence comes from, not whether it helps.',
    caveatHi: 'यह बताता है कि असर कहाँ से आता है, यह नहीं कि उससे मदद मिलती है या नहीं।',
    traits: [t('influenced_by_others')],
    weight: 'strong',
    short: 'fate line starting {line.fate.start_zone}',
    shortHi: '{line.fate.start_zone} से शुरू होती भाग्य रेखा',
    cites: [
      cite(PFA, PFA_FATE),
      cite(LOTH, LOTH_FATE),
      cite(MARKUN, MARKUN_FATE),
      cite(GUIDE, GUIDE_FATE),
      cite(FRITH, FRITH_FATE),
    ],
  }),
  rule({
    id: 'cx-fate-start-plain-of-mars',
    tradition: WC,
    conditions: [when('line.fate.start_zone', 'eq', 'plain_of_mars')],
    category: 'money_and_effort',
    meaning:
      'The self-made pattern: what you build tends to come from your own persistence rather than from an easy start.',
    meaningHi:
      'अपने दम पर आगे बढ़ने का ढर्रा: आप जो बनाते हैं, वह अक्सर किसी आसान शुरुआत से नहीं, बल्कि आपकी अपनी लगन से आता है।',
    caveat: 'The books promise eventual success here. That promise is not repeated — it describes effort, not an outcome.',
    caveatHi:
      'किताबें यहाँ आख़िरकार सफलता का वादा करती हैं। वह वादा यहाँ नहीं दोहराया गया — यह मेहनत के बारे में है, नतीजे के बारे में नहीं।',
    traits: [t('persistent'), t('independent')],
    weight: 'strong',
    short: 'fate line starting {line.fate.start_zone}',
    shortHi: '{line.fate.start_zone} से शुरू होती भाग्य रेखा',
    cites: [cite(PFA, PFA_FATE), cite(LOTH, LOTH_FATE)],
  }),
  rule({
    id: 'cx-fate-start-wrist',
    tradition: WC,
    conditions: [when('line.fate.start_zone', 'eq', 'wrist')],
    category: 'work_and_direction',
    meaning: 'Responsibility tends to arrive early — a sense of duty toward work that starts young.',
    meaningHi: 'ज़िम्मेदारी अक्सर जल्दी आ जाती है — काम के प्रति फ़र्ज़ की भावना, जो कम उम्र से शुरू होती है।',
    caveat: 'Some old books also promise great success for this form. That promise is left out.',
    caveatHi: 'कुछ पुरानी किताबें इस रूप के लिए बड़ी सफलता का वादा भी करती हैं। वह वादा यहाँ छोड़ दिया गया है।',
    traits: [t('responsible')],
    short: 'fate line starting {line.fate.start_zone}',
    shortHi: '{line.fate.start_zone} से शुरू होती भाग्य रेखा',
    cites: [cite(MARKUN, MARKUN_FATE)],
  }),
  rule({
    id: 'cx-fate-start-venus',
    tradition: WC,
    conditions: [when('line.fate.start_zone', 'eq', 'venus')],
    category: 'work_and_direction',
    meaning: 'Close relationships and strong feelings weigh heavily on the choices you make about work.',
    meaningHi: 'करीबी रिश्ते और गहरी भावनाएँ काम से जुड़े आपके फ़ैसलों पर बहुत असर डालती हैं।',
    traits: [t('influenced_by_others', 'neutral')],
    short: 'fate line starting {line.fate.start_zone}',
    shortHi: '{line.fate.start_zone} से शुरू होती भाग्य रेखा',
    cites: [cite(PFA, PFA_FATE)],
  }),

  // ======== fate line: where it ends ========
  rule({
    id: 'cx-fate-end-index',
    tradition: WC,
    conditions: [when('line.fate.end_zone', 'in', UNDER_INDEX)],
    category: 'work_and_direction',
    meaning:
      'Effort is pulled toward responsibility and leading others — ambition that looks for a position of trust.',
    meaningHi:
      'मेहनत ज़िम्मेदारी और दूसरों की अगुवाई की ओर खिंचती है — ऐसी महत्वाकांक्षा जो भरोसे वाले पद की तलाश में रहती है।',
    caveat: NOT_A_RESULT,
    caveatHi: NOT_A_RESULT_HI,
    traits: [t('ambitious'), t('leader'), t('responsible')],
    weight: 'strong',
    short: 'fate line ending {line.fate.end_zone}',
    shortHi: '{line.fate.end_zone} ख़त्म होती भाग्य रेखा',
    cites: [cite(PFA, PFA_FATE), cite(LOTH, LOTH_FATE)],
  }),
  rule({
    id: 'cx-fate-end-ring',
    tradition: WC,
    conditions: [when('line.fate.end_zone', 'in', UNDER_RING)],
    category: 'work_and_direction',
    meaning: 'Effort is drawn toward visible, public-facing work, where being recognised matters.',
    meaningHi: 'मेहनत ऐसे काम की ओर जाती है जो सबके सामने हो और लोगों से जुड़ा हो, जहाँ पहचान मिलना मायने रखता है।',
    caveat: NOT_A_RESULT,
    caveatHi: NOT_A_RESULT_HI,
    traits: [t('public_facing')],
    weight: 'strong',
    short: 'fate line ending {line.fate.end_zone}',
    shortHi: '{line.fate.end_zone} ख़त्म होती भाग्य रेखा',
    cites: [cite(PFA, PFA_FATE)],
  }),
  rule({
    id: 'cx-fate-end-little',
    tradition: WC,
    conditions: [when('line.fate.end_zone', 'in', UNDER_LITTLE)],
    category: 'money_and_effort',
    meaning:
      'Effort is drawn toward trade, business or skilled technical work — the fields the old books link with commerce and science.',
    meaningHi:
      'मेहनत व्यापार, कारोबार या हुनर वाले तकनीकी काम की ओर जाती है — वे क्षेत्र जिन्हें पुरानी किताबें वाणिज्य और विज्ञान से जोड़ती हैं।',
    caveat: NOT_A_RESULT,
    caveatHi: NOT_A_RESULT_HI,
    traits: [t('business_minded')],
    weight: 'strong',
    short: 'fate line ending {line.fate.end_zone}',
    shortHi: '{line.fate.end_zone} ख़त्म होती भाग्य रेखा',
    cites: [cite(PFA, PFA_FATE)],
  }),
  rule({
    id: 'cx-fate-end-middle-dale',
    tradition: IHR,
    conditions: [when('line.fate.end_zone', 'in', UNDER_MIDDLE)],
    category: 'work_and_direction',
    meaning: 'A reflective, deliberate approach to work — decisions are thought through before they are acted on.',
    meaningHi: 'काम के प्रति सोच-विचार वाला, सधा हुआ रवैया — फ़ैसलों पर अमल करने से पहले उन्हें अच्छी तरह सोचा जाता है।',
    traits: [t('cautious'), t('serious')],
    short: 'fate line ending {line.fate.end_zone}',
    shortHi: '{line.fate.end_zone} ख़त्म होती भाग्य रेखा',
    cites: [cite(DALE, DALE_SATURN)],
  }),
  rule({
    id: 'cx-fate-continuous-middle-dale',
    tradition: IHR,
    conditions: [
      when('line.fate.continuity', 'eq', 'continuous'),
      when('line.fate.end_zone', 'in', UNDER_MIDDLE),
    ],
    category: 'temperament',
    meaning:
      'A quiet, provident and serious-minded nature — the kind of person others go to for considered advice.',
    meaningHi:
      'शांत, आगे की सोचकर चलने वाला और गंभीर स्वभाव — ऐसा व्यक्ति जिसके पास लोग सोची-समझी सलाह लेने आते हैं।',
    caveat: 'The book adds a melancholy streak to this picture. It is noted as a caution, not a reading.',
    caveatHi: 'किताब इस तस्वीर में उदासी की एक झलक भी जोड़ती है। उसे यहाँ एक सावधानी के रूप में लिखा गया है, रीडिंग के रूप में नहीं।',
    traits: [t('serious'), t('cautious')],
    short: '{line.fate.continuity} fate line ending {line.fate.end_zone}',
    shortHi: '{line.fate.end_zone} ख़त्म होती {line.fate.continuity} भाग्य रेखा',
    cites: [cite(DALE, DALE_PLANET_SATURN)],
  }),

  // ======== fate line: its character ========
  rule({
    id: 'cx-fate-broken',
    tradition: WC,
    conditions: [when('line.fate.continuity', 'eq', 'broken')],
    category: 'work_and_direction',
    meaning:
      'A working life that changes direction — more likely to include a real change of occupation or surroundings than one straight road.',
    meaningHi:
      'ऐसा कामकाजी जीवन जो दिशा बदलता है — एक सीधी राह के बजाय इसमें पेशे या माहौल का सच्चा बदलाव आने की संभावना ज़्यादा रहती है।',
    caveat: 'The books disagree on whether such a change turns out well. Neither view is assumed here.',
    caveatHi: 'किताबों में इस पर मतभेद है कि ऐसा बदलाव अच्छा निकलता है या नहीं। यहाँ इनमें से कोई भी राय मानकर नहीं चला गया।',
    traits: [t('restless', 'neutral')],
    weight: 'strong',
    short: '{line.fate.continuity} fate line',
    shortHi: '{line.fate.continuity} भाग्य रेखा',
    cites: [cite(PFA, PFA_FATE), cite(MARKUN, MARKUN_FATE), cite(RAPH, RAPH_FATE)],
  }),
  rule({
    id: 'cx-fate-deep',
    tradition: WC,
    conditions: [when('line.fate.depth', 'eq', 'deep')],
    category: 'work_and_direction',
    meaning: 'A steady, routine-shaped working life — consistency and repetition rather than constant change.',
    meaningHi: 'स्थिर, रोज़ के तय ढर्रे वाला कामकाजी जीवन — लगातार बदलाव के बजाय एक-सा काम और दोहराव।',
    caveat: 'One old writer warns against reading a heavily marked fate line as luck. It is not read that way here.',
    caveatHi: 'एक पुराने लेखक चेताते हैं कि बहुत गहरी भाग्य रेखा को किस्मत का संकेत न समझा जाए। यहाँ भी इसे ऐसे नहीं पढ़ा गया।',
    traits: [t('steady')],
    short: '{line.fate.depth} fate line',
    shortHi: '{line.fate.depth} भाग्य रेखा',
    cites: [cite(MARKUN, MARKUN_FATE), cite(PFA, PFA_FATE)],
  }),
  rule({
    id: 'cx-fate-faint',
    tradition: WC,
    conditions: [when('line.fate.depth', 'eq', 'faint')],
    category: 'work_and_direction',
    meaning:
      'A strong preference for self-direction — little patience with the idea that anything but your own choices decides your path.',
    meaningHi:
      'अपनी राह ख़ुद तय करने की गहरी चाह — इस विचार के लिए कम धैर्य कि आपके अपने फ़ैसलों के सिवा कुछ और आपका रास्ता तय करता है।',
    traits: [t('independent')],
    short: '{line.fate.depth} fate line',
    shortHi: '{line.fate.depth} भाग्य रेखा',
    cites: [cite(PFA, PFA_FATE)],
  }),
  rule({
    id: 'cx-fate-absent',
    tradition: WC,
    conditions: [when('line.fate.visible', 'eq', false)],
    category: 'work_and_direction',
    meaning:
      'Direction is not set out in advance — work tends to follow circumstances and choices as they come, rather than one fixed track.',
    meaningHi:
      'दिशा पहले से तय नहीं होती — काम किसी एक तय पटरी पर चलने के बजाय, जैसे-जैसे हालात बनते हैं और फ़ैसले लिए जाते हैं, उनके साथ चलता है।',
    caveat:
      'The old books disagree sharply about a missing fate line: one judges it harshly, another notes that people without it often do well. Neither judgement is shown as a prediction.',
    caveatHi:
      'भाग्य रेखा न होने पर पुरानी किताबों में तीखा मतभेद है: एक इसे कठोरता से आँकती है, दूसरी कहती है कि जिनके हाथ में यह रेखा नहीं होती, वे अक्सर अच्छा करते हैं। इनमें से किसी भी राय को भविष्यवाणी के रूप में नहीं दिखाया गया।',
    traits: [t('independent', 'neutral')],
    weight: 'strong',
    short: '{line.fate.visible} fate line',
    shortHi: '{line.fate.visible} भाग्य रेखा',
    cites: [cite(MARKUN, MARKUN_FATE), cite(LOTH, LOTH_FATE)],
    // Absence is a confident observation, not a faint one; it must be sure.
    minConfidence: 0.7,
  }),

  // ======== sun line: attitude to money ========
  // Dormant until the vision layer reports the sun line. The engine returns
  // nothing for a line the observation does not contain, so these cannot
  // fire on a guess; they are here so extraction is not redone later.
  rule({
    id: 'cx-sun-present',
    tradition: WC,
    conditions: [when('line.sun.visible', 'eq', true)],
    category: 'temperament',
    meaning: 'Sensitive to surroundings — beauty, order and atmosphere affect how you feel and how well you work.',
    meaningHi:
      'आसपास के माहौल के प्रति संवेदनशील — सुंदरता, साफ़-सुथरी व्यवस्था और वातावरण इस पर असर डालते हैं कि आप कैसा महसूस करते हैं और कितना अच्छा काम करते हैं।',
    traits: [t('sensitive'), t('artistic', 'neutral')],
    short: '{line.sun.visible} sun line',
    shortHi: '{line.sun.visible} सूर्य रेखा',
    cites: [cite(PFA, PFA_SUN)],
  }),
  rule({
    id: 'cx-sun-absent',
    tradition: WC,
    conditions: [when('line.sun.visible', 'eq', false)],
    category: 'money_and_effort',
    meaning: 'An easy-going attitude to small, everyday sums of money.',
    meaningHi: 'रोज़मर्रा के छोटे-मोटे पैसों को लेकर बेफ़िक्र रवैया।',
    caveat: 'The source is explicit that a missing sun line is not a sign of hardship. It describes a habit, never an income.',
    caveatHi: 'स्रोत साफ़ कहता है कि सूर्य रेखा न होना तंगी का संकेत नहीं है। यह एक आदत के बारे में है, कमाई के बारे में कभी नहीं।',
    traits: [t('easygoing_with_money')],
    short: '{line.sun.visible} sun line',
    shortHi: '{line.sun.visible} सूर्य रेखा',
    cites: [cite(MARKUN, MARKUN_APOLLO)],
    minConfidence: 0.7,
  }),
  rule({
    id: 'cx-sun-fork',
    tradition: WC,
    conditions: [when('line.sun.marks.fork', 'gte', 1)],
    category: 'money_and_effort',
    meaning: 'A tendency to spread effort across more than one line of work at once.',
    meaningHi: 'एक ही समय में एक से ज़्यादा कामों में मेहनत बाँटने का झुकाव।',
    caveat: 'The same source warns this can mean too many interests. It describes a working style, never how much comes in.',
    caveatHi:
      'यही स्रोत चेताता है कि इसका मतलब बहुत सारी रुचियाँ भी हो सकता है। यह काम करने के ढंग के बारे में है, कभी इस बारे में नहीं कि कितनी आमदनी होती है।',
    traits: [t('versatile', 'neutral')],
    short: 'sun line with a fork ({line.sun.marks.fork})',
    shortHi: 'सूर्य रेखा में फ़ोर्क ({line.sun.marks.fork})',
    cites: [cite(MARKUN, MARKUN_APOLLO)],
  }),

  // ======== sun line: fourth pass, 2026-09-17 ========
  // The sun line is read from the vision model's description (never traced),
  // so these fire only at the model's capped confidence. Most of what the
  // books say about it promises luck, riches or honours; only the part that
  // describes a tendency is kept (see BLOCKED_CLAIMS).
  rule({
    id: 'cx-sun-deep',
    tradition: WC,
    conditions: [when('line.sun.depth', 'eq', 'deep')],
    category: 'temperament',
    meaning: 'A bright, warm manner that tends to draw people in and give you some sway with them.',
    meaningHi: 'एक खिला हुआ, अपनापन भरा ढंग जो लोगों को आपकी ओर खींचता है और उन पर आपकी बात का कुछ असर रहता है।',
    caveat: 'The book also promises recognition, reward and honours for a well-marked sun line. That promise is not repeated here.',
    caveatHi: 'किताब साफ़ दिखने वाली सूर्य रेखा के लिए पहचान, इनाम और सम्मान का वादा भी करती है। वह वादा यहाँ नहीं दोहराया गया।',
    traits: [t('sociable')],
    short: '{line.sun.depth} sun line',
    shortHi: '{line.sun.depth} सूर्य रेखा',
    cites: [cite(PFA, PFA_SUN)],
  }),
  rule({
    id: 'cx-sun-start-luna',
    tradition: WC,
    conditions: [when('line.sun.start_zone', 'eq', 'luna')],
    category: 'work_and_direction',
    meaning:
      'Work where the response of an audience matters a great deal — the old books link this form with performers, speakers and others who work in front of the public.',
    meaningHi:
      'ऐसा काम जिसमें लोगों की प्रतिक्रिया बहुत मायने रखती है — पुरानी किताबें इस रूप को कलाकारों, वक्ताओं और जनता के सामने काम करने वाले लोगों से जोड़ती हैं।',
    caveat: 'The book calls this lucky and changeable. It describes the kind of work, not what it will bring.',
    caveatHi: 'किताब इसे भाग्यशाली और बदलता रहने वाला कहती है। यह काम के प्रकार के बारे में है, इस बारे में नहीं कि उससे क्या मिलेगा।',
    traits: [t('public_facing')],
    short: 'sun line starting {line.sun.start_zone}',
    shortHi: '{line.sun.start_zone} से शुरू होती सूर्य रेखा',
    cites: [cite(PFA, PFA_SUN)],
  }),
  rule({
    id: 'cx-sun-start-plain-of-mars',
    tradition: WC,
    conditions: [when('line.sun.start_zone', 'eq', 'plain_of_mars')],
    category: 'money_and_effort',
    meaning: 'A habit of pushing on through early difficulties in the work you want to be known for.',
    meaningHi: 'जिस काम से आप पहचान चाहते हैं, उसमें शुरुआती मुश्किलों के बीच भी आगे बढ़ते रहने की आदत।',
    caveat: NOT_A_RESULT,
    caveatHi: NOT_A_RESULT_HI,
    traits: [t('persistent')],
    short: 'sun line starting {line.sun.start_zone}',
    shortHi: '{line.sun.start_zone} से शुरू होती सूर्य रेखा',
    cites: [cite(PFA, PFA_SUN)],
  }),
  rule({
    id: 'cx-sun-straight-continuous-dale',
    tradition: IHR,
    conditions: [when('line.sun.curvature', 'eq', 'straight'), when('line.sun.continuity', 'eq', 'continuous')],
    category: 'temperament',
    meaning: 'A manner that tends to earn the goodwill of senior and influential people.',
    meaningHi: 'ऐसा ढंग जो अक्सर बड़े और असरदार लोगों की सद्भावना जीत लेता है।',
    caveat: 'The book promises the favour of great men and honours. That promise is not repeated — it describes how you tend to come across.',
    caveatHi: 'किताब बड़े लोगों की कृपा और सम्मान का वादा करती है। वह वादा यहाँ नहीं दोहराया गया — यह बताता है कि आप दूसरों को कैसे लगते हैं।',
    traits: [t('sociable')],
    short: '{line.sun.curvature}, {line.sun.continuity} sun line',
    shortHi: '{line.sun.curvature}, {line.sun.continuity} सूर्य रेखा',
    cites: [cite(DALE, DALE_VIA_SOLIS)],
  }),
  rule({
    id: 'cx-sun-broken-dale',
    tradition: IHR,
    conditions: [when('line.sun.continuity', 'eq', 'broken')],
    category: 'work_and_direction',
    meaning: 'Putting your work forward may meet friction — rivalry or obstacles from others along the way.',
    meaningHi: 'अपना काम सामने रखने में रुकावट आ सकती है — रास्ते में दूसरों से होड़ या अड़चनें।',
    caveat: 'A pattern this tradition describes, not a prediction about any person or event.',
    caveatHi: 'यह परंपरा का बताया एक ढर्रा है, किसी व्यक्ति या घटना के बारे में भविष्यवाणी नहीं।',
    traits: [t('public_facing', 'watch')],
    short: '{line.sun.continuity} sun line',
    shortHi: '{line.sun.continuity} सूर्य रेखा',
    cites: [cite(DALE, DALE_VIA_SOLIS)],
    // A break is easy to see where there is none; be sure first.
    minConfidence: 0.7,
  }),

  // ======== head line: its shape ========
  rule({
    id: 'cx-head-straight',
    tradition: WC,
    conditions: [when('line.head.curvature', 'eq', 'straight')],
    category: 'thinking_style',
    meaning:
      'Practical common sense — a mind that prefers the concrete and can be relied on to carry a decision through.',
    meaningHi:
      'व्यावहारिक समझ-बूझ — ऐसा दिमाग़ जो ठोस बातें पसंद करता है, और जिस पर भरोसा किया जा सकता है कि लिया गया फ़ैसला पूरा करेगा।',
    traits: [t('practical'), t('determined')],
    weight: 'strong',
    short: '{line.head.curvature} head line',
    shortHi: '{line.head.curvature} मस्तिष्क रेखा',
    cites: [cite(LOTH, LOTH_HEAD), cite(PFA, PFA_HEAD)],
  }),
  rule({
    id: 'cx-head-gentle',
    tradition: WC,
    conditions: [when('line.head.curvature', 'eq', 'gentle')],
    category: 'thinking_style',
    meaning:
      'Imagination kept in hand — creative thinking that is used when it is wanted, on a practical footing.',
    meaningHi: 'काबू में रखी कल्पना — रचनात्मक सोच, जो ज़रूरत पड़ने पर व्यावहारिक ज़मीन पर रहकर इस्तेमाल होती है।',
    traits: [t('imaginative'), t('practical')],
    short: '{line.head.curvature} head line',
    shortHi: '{line.head.curvature} मस्तिष्क रेखा',
    cites: [cite(PFA, PFA_HEAD), cite(LOTH, LOTH_HEAD)],
  }),
  rule({
    id: 'cx-head-curved',
    tradition: WC,
    conditions: [when('line.head.curvature', 'eq', 'curved')],
    category: 'thinking_style',
    meaning:
      'A strongly imaginative, idealistic mind that does its best work when inspiration or mood carries it.',
    meaningHi: 'बहुत कल्पनाशील और आदर्शवादी दिमाग़, जो सबसे अच्छा काम तब करता है जब प्रेरणा या मूड साथ दे।',
    caveat: 'Old books attach much darker claims to an extreme slope of this line. Those are refused here.',
    caveatHi: 'पुरानी किताबें इस रेखा के बहुत ज़्यादा ढलान के साथ कहीं ज़्यादा नकारात्मक दावे जोड़ती हैं। वे यहाँ नहीं माने गए।',
    traits: [t('imaginative'), t('idealistic')],
    weight: 'strong',
    short: '{line.head.curvature} head line',
    shortHi: '{line.head.curvature} मस्तिष्क रेखा',
    cites: [cite(LOTH, LOTH_HEAD), cite(PFA, PFA_HEAD)],
  }),
  rule({
    id: 'cx-head-long',
    tradition: WC,
    conditions: [when('line.head.length', 'eq', 'long')],
    category: 'thinking_style',
    meaning: 'Wide intellectual reach — able to take on large, complex subjects and follow them a long way.',
    meaningHi: 'दूर तक पहुँचने वाली बुद्धि — बड़े और उलझे हुए विषयों को हाथ में लेकर उन्हें दूर तक समझते चले जाने की क्षमता।',
    caveat: 'Two old books add that mental power of this kind can be used selfishly. Read that as a caution, not a verdict.',
    caveatHi:
      'दो पुरानी किताबें यह भी कहती हैं कि इस तरह की दिमाग़ी ताक़त का इस्तेमाल स्वार्थ के लिए हो सकता है। इसे एक सावधानी समझें, फ़ैसला नहीं।',
    traits: [t('thorough')],
    short: '{line.head.length} head line',
    shortHi: '{line.head.length} मस्तिष्क रेखा',
    cites: [cite(LOTH, LOTH_HEAD), cite(MARKUN, MARKUN_HEAD), cite(BENHAM, BENHAM_HEAD)],
  }),
  rule({
    id: 'cx-head-short',
    tradition: WC,
    conditions: [when('line.head.length', 'eq', 'short')],
    category: 'thinking_style',
    meaning:
      'A practical, hands-on mind — most at home with concrete tasks, and able to focus closely on one specialty.',
    meaningHi:
      'व्यावहारिक, ख़ुद हाथ से काम करने वाला दिमाग़ — ठोस कामों में सबसे सहज, और किसी एक ख़ास विषय पर पूरा ध्यान लगा सकने वाला।',
    caveat: 'One old book reads an extremely short line far more darkly. That reading is refused here.',
    caveatHi: 'एक पुरानी किताब बहुत ही छोटी रेखा को कहीं ज़्यादा नकारात्मक ढंग से पढ़ती है। वह व्याख्या यहाँ नहीं मानी गई।',
    traits: [t('practical'), t('focused')],
    short: '{line.head.length} head line',
    shortHi: '{line.head.length} मस्तिष्क रेखा',
    cites: [cite(LOTH, LOTH_HEAD), cite(MARKUN, MARKUN_HEAD)],
  }),
  rule({
    id: 'cx-head-deep',
    tradition: WC,
    conditions: [when('line.head.depth', 'eq', 'deep')],
    category: 'thinking_style',
    meaning: 'Concentration and a retentive memory — thinking that goes deep rather than wide.',
    meaningHi: 'एकाग्रता और बातें याद रखने वाली याददाश्त — ऐसी सोच जो फैलाव से ज़्यादा गहराई में जाती है।',
    traits: [t('focused'), t('thorough')],
    short: '{line.head.depth} head line',
    shortHi: '{line.head.depth} मस्तिष्क रेखा',
    cites: [cite(PFA, PFA_HEAD), cite(MARKUN, MARKUN_HEAD)],
  }),
  rule({
    id: 'cx-head-chained',
    tradition: WC,
    conditions: [when('line.head.continuity', 'eq', 'chained')],
    category: 'thinking_style',
    meaning: 'Ideas shift before they settle, so decisions can take longer to reach.',
    meaningHi: 'विचार टिकने से पहले बदलते रहते हैं, इसलिए किसी फ़ैसले तक पहुँचने में ज़्यादा समय लग सकता है।',
    caveat: 'Other old books attach claims about the mind’s health to this form. Those are refused here.',
    caveatHi: 'दूसरी पुरानी किताबें इस रूप के साथ मानसिक सेहत से जुड़े दावे जोड़ती हैं। वे यहाँ नहीं माने गए।',
    traits: [t('changeable', 'watch')],
    short: '{line.head.continuity} head line',
    shortHi: '{line.head.continuity} मस्तिष्क रेखा',
    cites: [cite(LOTH, LOTH_HEAD)],
  }),
  rule({
    id: 'cx-head-fork',
    tradition: WC,
    conditions: [when('line.head.marks.fork', 'gte', 1)],
    category: 'thinking_style',
    meaning:
      'Two ways of thinking at once — the practical and the imaginative — which gives range and tact, and can make choosing harder.',
    meaningHi:
      'एक साथ सोचने के दो ढंग — व्यावहारिक और कल्पनाशील — जिनसे सोच में फैलाव और बात सँभालने की समझ आती है, पर चुनना कठिन भी हो सकता है।',
    caveat: 'The old advice for this form is to trust the first impulse rather than weighing both sides for too long.',
    caveatHi: 'इस रूप के लिए पुरानी सलाह है कि दोनों पक्षों को बहुत देर तक तौलने के बजाय मन में पहले आई बात पर भरोसा करें।',
    traits: [t('versatile'), t('decisive', 'tension')],
    short: 'head line with a fork ({line.head.marks.fork})',
    shortHi: 'मस्तिष्क रेखा में फ़ोर्क ({line.head.marks.fork})',
    cites: [
      cite(PFA, PFA_HEAD),
      cite(MARKUN, MARKUN_HEAD),
      cite(BENHAM, BENHAM_HEAD),
      cite(STH, STH_HEAD),
      cite(SG, SG_HEAD),
    ],
  }),
  rule({
    id: 'cx-head-fork-luna',
    tradition: WC,
    conditions: [when('line.head.marks.fork', 'gte', 1), when('line.head.end_zone', 'eq', 'luna')],
    category: 'thinking_style',
    meaning: 'A talent for imaginative writing and storytelling.',
    meaningHi: 'कल्पना भरे लेखन और कहानी कहने की प्रतिभा।',
    caveat:
      'The book describes a fine fork at the end of a sloping line; a photo cannot always show where a fork sits. Another old book reads this same fork very differently, in terms that are refused here.',
    caveatHi:
      'किताब ढलान वाली रेखा के सिरे पर एक बारीक फ़ोर्क (दो शाखाओं) की बात करती है; फोटो में हमेशा नहीं दिखता कि फ़ोर्क कहाँ है। एक दूसरी पुरानी किताब इसी फ़ोर्क को बिल्कुल अलग ढंग से पढ़ती है, ऐसे शब्दों में जो यहाँ नहीं माने गए।',
    traits: [t('imaginative'), t('artistic')],
    short: 'head line with a fork ({line.head.marks.fork}) ending {line.head.end_zone}',
    shortHi: '{line.head.end_zone} ख़त्म होती मस्तिष्क रेखा, फ़ोर्क के साथ ({line.head.marks.fork})',
    cites: [cite(LOTH, LOTH_HEAD)],
  }),
  rule({
    id: 'cx-head-faint',
    tradition: WC,
    conditions: [when('line.head.depth', 'eq', 'faint')],
    category: 'thinking_style',
    meaning: 'A mind that ranges more than it concentrates — views can shift before they settle.',
    meaningHi: 'ऐसा दिमाग़ जो एक जगह टिकने से ज़्यादा इधर-उधर घूमता है — राय पक्की होने से पहले बदल सकती है।',
    caveat:
      'The book describes a line lying on the surface of the palm rather than cut deep. It is not a measure of intelligence.',
    caveatHi:
      'किताब ऐसी रेखा की बात करती है जो गहरी कटी होने के बजाय हथेली की सतह पर ही हो। यह बुद्धि का पैमाना नहीं है।',
    traits: [t('changeable', 'neutral')],
    short: '{line.head.depth} head line',
    shortHi: '{line.head.depth} मस्तिष्क रेखा',
    cites: [cite(PFA, PFA_HEAD)],
  }),
  rule({
    id: 'cx-head-broken',
    tradition: WC,
    conditions: [when('line.head.continuity', 'eq', 'broken')],
    category: 'thinking_style',
    meaning:
      'A break in the head line. The classical rule for any broken line is that the break interrupts what the line shows at that point, and that where the two ends overlap its qualities carry on — so no separate trait is read from the break itself.',
    meaningHi:
      'मस्तिष्क रेखा में टूट। किसी भी टूटी रेखा के लिए पुराना शास्त्रीय नियम यह है कि उस जगह पर टूट रेखा के अर्थ को रोक देती है, और जहाँ दोनों सिरे एक-दूसरे के ऊपर आ जाते हैं वहाँ रेखा के गुण आगे चलते रहते हैं — इसलिए सिर्फ़ टूट से कोई अलग गुण नहीं पढ़ा गया।',
    caveat: 'Older books attach far darker claims to a broken head line. Those are refused here.',
    caveatHi: 'पुरानी किताबें टूटी मस्तिष्क रेखा के साथ कहीं ज़्यादा नकारात्मक दावे जोड़ती हैं। वे यहाँ नहीं माने गए।',
    traits: [t('changeable', 'neutral')],
    short: '{line.head.continuity} head line',
    shortHi: '{line.head.continuity} मस्तिष्क रेखा',
    cites: [cite(PFA, PFA_CLASSES)],
    // A break is easy to see where there is none; be sure first.
    minConfidence: 0.7,
  }),
  rule({
    id: 'cx-head-clear-dale',
    tradition: IHR,
    conditions: [when('line.head.depth', 'eq', 'deep'), when('line.head.continuity', 'eq', 'continuous')],
    category: 'temperament',
    meaning: 'A cheerful, inventive turn of mind.',
    meaningHi: 'खुशमिज़ाज और नई-नई बातें सोचने वाला मन।',
    caveat:
      'The book asks for a well-drawn line of good colour. A photo cannot judge colour fairly, so only a clearly marked, unbroken line is read here.',
    caveatHi:
      'किताब अच्छे रंग वाली, साफ़ खिंची रेखा की बात करती है। फोटो से रंग का ठीक अंदाज़ा नहीं लगता, इसलिए यहाँ सिर्फ़ साफ़ उभरी, बिना टूटी रेखा को पढ़ा गया है।',
    traits: [t('cheerful'), t('imaginative')],
    short: '{line.head.depth}, {line.head.continuity} head line',
    shortHi: '{line.head.depth}, {line.head.continuity} मस्तिष्क रेखा',
    cites: [cite(DALE, DALE_LIVER)],
  }),

  // ======== head line: where it starts and ends ========
  rule({
    id: 'cx-head-start-index',
    tradition: WC,
    conditions: [when('line.head.start_zone', 'in', UNDER_INDEX)],
    category: 'thinking_style',
    meaning: 'Ambition joined to judgement — a mind drawn to organising, managing people and taking charge.',
    meaningHi:
      'समझदारी के साथ जुड़ी महत्वाकांक्षा — ऐसा दिमाग़ जो व्यवस्था बनाने, लोगों को सँभालने और कमान अपने हाथ में लेने की ओर खिंचता है।',
    caveat: 'One old book calls this among the finest forms of the line. Here it describes a way of thinking, not a result.',
    caveatHi: 'एक पुरानी किताब इसे इस रेखा के सबसे अच्छे रूपों में गिनती है। यहाँ यह सोचने के ढंग के बारे में है, नतीजे के बारे में नहीं।',
    traits: [t('ambitious'), t('leader')],
    short: 'head line starting {line.head.start_zone}',
    shortHi: '{line.head.start_zone} से शुरू होती मस्तिष्क रेखा',
    cites: [cite(LOTH, LOTH_HEAD), cite(PFA, PFA_HEAD)],
  }),
  rule({
    id: 'cx-head-start-thumb-mars',
    tradition: WC,
    conditions: [when('line.head.start_zone', 'eq', THUMB_SIDE_MARS)],
    category: 'thinking_style',
    meaning: 'A sensitive, easily unsettled mind that feels friction with other people keenly.',
    meaningHi: 'संवेदनशील मन, जो आसानी से बेचैन हो जाता है और दूसरों के साथ होने वाली खटपट को गहराई से महसूस करता है।',
    caveat: 'The books describe this line starting inside the life line. Their harsher claims about this form are refused.',
    caveatHi: 'किताबें बताती हैं कि यह रेखा जीवन रेखा के अंदर से शुरू होती है। इस रूप के बारे में उनके ज़्यादा कठोर दावे नहीं माने गए।',
    traits: [t('sensitive', 'neutral')],
    short: 'head line starting {line.head.start_zone}',
    shortHi: '{line.head.start_zone} से शुरू होती मस्तिष्क रेखा',
    cites: [cite(LOTH, LOTH_HEAD), cite(PFA, PFA_HEAD)],
  }),
  rule({
    id: 'cx-head-end-luna',
    tradition: WC,
    conditions: [when('line.head.end_zone', 'eq', 'luna')],
    category: 'thinking_style',
    meaning: 'Imagination with a pull toward the mysterious and the unusual.',
    meaningHi: 'ऐसी कल्पना जो रहस्यमय और अनोखी बातों की ओर खिंचती है।',
    traits: [t('imaginative')],
    short: 'head line ending {line.head.end_zone}',
    shortHi: '{line.head.end_zone} ख़त्म होती मस्तिष्क रेखा',
    cites: [cite(LOTH, LOTH_HEAD), cite(MARKUN, MARKUN_HEAD)],
  }),
  rule({
    id: 'cx-head-end-little',
    tradition: WC,
    conditions: [when('line.head.end_zone', 'in', UNDER_LITTLE)],
    category: 'money_and_effort',
    meaning: 'A mind drawn to commerce and science, with a sharpening interest in money and what it is worth.',
    meaningHi: 'व्यापार और विज्ञान की ओर खिंचने वाला दिमाग़, जिसमें पैसे और उसकी क़ीमत को लेकर रुचि बढ़ती जाती है।',
    caveat: 'An attitude to money, never a forecast of it.',
    caveatHi: 'यह पैसे के प्रति नज़रिया है, पैसे की भविष्यवाणी कभी नहीं।',
    traits: [t('business_minded')],
    short: 'head line ending {line.head.end_zone}',
    shortHi: '{line.head.end_zone} ख़त्म होती मस्तिष्क रेखा',
    cites: [cite(LOTH, LOTH_HEAD), cite(PFA, PFA_HEAD)],
  }),
  rule({
    id: 'cx-head-end-outer-mars',
    tradition: WC,
    // The book reads this ending for a head line JOINED to the life line
    // ("this class of Line of Head ... straight on to the Mental Mount of Mars").
    conditions: [when('line.head.end_zone', 'eq', OUTER_MARS), when('line.head.life_join', 'eq', 'joined')],
    category: 'thinking_style',
    meaning: 'Strong will and quiet determination — the ability to hold to a principle while keeping nerves out of sight.',
    meaningHi: 'मज़बूत इच्छाशक्ति और शांत दृढ़ता — अपनी घबराहट ज़ाहिर किए बिना किसी सिद्धांत पर टिके रहने की क्षमता।',
    traits: [t('determined'), t('self_controlled')],
    short: 'head line ending {line.head.end_zone}, starting {line.head.life_join}',
    shortHi: 'शुरुआत में {line.head.life_join}, {line.head.end_zone} ख़त्म होती मस्तिष्क रेखा',
    cites: [cite(PFA, PFA_HEAD)],
  }),
  rule({
    id: 'cx-head-end-middle',
    tradition: WC,
    conditions: [when('line.head.end_zone', 'in', UNDER_MIDDLE)],
    category: 'thinking_style',
    meaning: 'Depth of thought, with an interest in music or in questions of faith.',
    meaningHi: 'सोच में गहराई, साथ में संगीत या आस्था से जुड़े सवालों में रुचि।',
    traits: [t('thorough'), t('serious')],
    short: 'head line ending {line.head.end_zone}',
    shortHi: '{line.head.end_zone} ख़त्म होती मस्तिष्क रेखा',
    cites: [cite(LOTH, LOTH_HEAD)],
  }),
  rule({
    id: 'cx-head-end-ring',
    tradition: WC,
    conditions: [when('line.head.end_zone', 'in', UNDER_RING)],
    category: 'temperament',
    meaning: 'A wish to be noticed and known for your ideas.',
    meaningHi: 'अपने विचारों के लिए लोगों की नज़र में आने और पहचाने जाने की चाह।',
    traits: [t('public_facing', 'neutral')],
    short: 'head line ending {line.head.end_zone}',
    shortHi: '{line.head.end_zone} ख़त्म होती मस्तिष्क रेखा',
    cites: [cite(LOTH, LOTH_HEAD)],
  }),

  // ======== head line: joined to or separate from the life line ========
  // Measured from the traced head and life lines (lines/derived.ts).
  rule({
    id: 'cx-head-joined-life',
    tradition: WC,
    conditions: [when('line.head.life_join', 'eq', 'joined')],
    category: 'thinking_style',
    meaning:
      'A sensitive, careful mind — cautious in your own affairs, and inclined to rein yourself in and underrate what you can do.',
    meaningHi:
      'संवेदनशील और सावधान मन — अपने मामलों में सतर्क, और ख़ुद को रोककर रखने व अपनी क्षमता को कम आँकने की ओर झुका हुआ।',
    caveat: 'The books call this the more common form of the head line. It describes a leaning, not a limit.',
    caveatHi: 'किताबें इसे मस्तिष्क रेखा का ज़्यादा आम रूप बताती हैं। यह एक झुकाव है, कोई सीमा नहीं।',
    traits: [t('cautious'), t('sensitive')],
    weight: 'strong',
    short: 'head line starting {line.head.life_join}',
    shortHi: 'शुरुआत में {line.head.life_join} मस्तिष्क रेखा',
    cites: [cite(PFA, PFA_HEAD), cite(LOTH, LOTH_LIFE), cite(GUIDE, GUIDE_HEAD)],
    // Dale reads the same join as a quick, sharp wit: both are shown, side by side.
    conflictGroup: 'head_life_joined',
  }),
  rule({
    id: 'cx-head-separate-life',
    tradition: WC,
    conditions: [when('line.head.life_join', 'eq', 'separate')],
    category: 'thinking_style',
    meaning:
      'Independent thinking and quick judgement, with a streak of mental daring — at its best when there is a clear purpose to aim at.',
    meaningHi:
      'स्वतंत्र सोच और जल्दी परखने की क्षमता, साथ में दिमाग़ी हिम्मत — सबसे अच्छी तब, जब सामने कोई साफ़ मक़सद हो।',
    traits: [t('independent'), t('decisive'), t('bold')],
    weight: 'strong',
    short: 'head line starting {line.head.life_join}',
    shortHi: 'शुरुआत में {line.head.life_join} मस्तिष्क रेखा',
    cites: [cite(PFA, PFA_HEAD), cite(LOTH, LOTH_LIFE)],
  }),
  rule({
    id: 'cx-head-wide-life',
    tradition: WC,
    conditions: [when('line.head.life_join', 'eq', 'wide')],
    category: 'temperament',
    meaning: 'Bold and quick to act — confidence that can run ahead of careful thought.',
    meaningHi: 'साहसी और जल्दी क़दम उठाने वाले — ऐसा आत्मविश्वास जो कभी-कभी सोच-विचार से आगे निकल जाता है।',
    caveat: 'The old books word this far more harshly. Only the tendency is kept, as something to watch, not a verdict.',
    caveatHi: 'पुरानी किताबें इसे कहीं ज़्यादा कठोर शब्दों में कहती हैं। यहाँ सिर्फ़ झुकाव रखा गया है — ध्यान रखने की बात, कोई फ़ैसला नहीं।',
    traits: [t('bold'), t('impulsive', 'watch')],
    short: 'head line starting {line.head.life_join}',
    shortHi: 'शुरुआत में {line.head.life_join} मस्तिष्क रेखा',
    cites: [cite(LOTH, LOTH_LIFE), cite(LOTH, LOTH_HEAD)],
  }),

  // ======== life line: energy and temperament only ========
  rule({
    id: 'cx-life-start-index',
    tradition: WC,
    conditions: [when('line.life.start_zone', 'in', UNDER_INDEX)],
    category: 'temperament',
    meaning: 'A life steered by ambition from early on, together with good self-command.',
    meaningHi: 'शुरू से ही महत्वाकांक्षा के सहारे चलने वाला जीवन, साथ में ख़ुद पर अच्छा काबू।',
    traits: [t('ambitious'), t('self_controlled')],
    short: 'life line starting {line.life.start_zone}',
    shortHi: '{line.life.start_zone} से शुरू होती जीवन रेखा',
    cites: [
      cite(PFA, PFA_LIFE),
      cite(LOTH, LOTH_LIFE),
      cite(MARKUN, MARKUN_LIFE),
      cite(GUIDE, GUIDE_LIFE),
      cite(RAPH, RAPH_LIFE),
    ],
  }),
  rule({
    id: 'cx-life-start-thumb-mars',
    tradition: WC,
    conditions: [when('line.life.start_zone', 'eq', THUMB_SIDE_MARS)],
    category: 'temperament',
    meaning: 'A quick temper that takes conscious effort to manage.',
    meaningHi: 'जल्दी आने वाला ग़ुस्सा, जिसे सँभालने के लिए सोच-समझकर कोशिश करनी पड़ती है।',
    caveat: 'The book adds harsher claims about young people with this form. Those are left out.',
    caveatHi: 'किताब इस रूप वाले युवाओं के बारे में और कठोर दावे जोड़ती है। वे यहाँ छोड़ दिए गए हैं।',
    traits: [t('quick_tempered', 'watch')],
    short: 'life line starting {line.life.start_zone}',
    shortHi: '{line.life.start_zone} से शुरू होती जीवन रेखा',
    cites: [cite(PFA, PFA_LIFE)],
  }),
  rule({
    id: 'cx-life-curved',
    tradition: WC,
    conditions: [when('line.life.curvature', 'eq', 'curved')],
    category: 'vitality',
    meaning: 'An outgoing, physically energetic presence — energy that reaches out toward people and activity.',
    meaningHi: 'मिलनसार और शारीरिक रूप से ऊर्जावान व्यक्तित्व — ऐसी ऊर्जा जो लोगों और काम-काज की ओर बाहर फैलती है।',
    caveat: NOT_A_HEALTH_TEST,
    caveatHi: NOT_A_HEALTH_TEST_HI,
    traits: [t('energetic'), t('sociable')],
    short: '{line.life.curvature} life line',
    shortHi: '{line.life.curvature} जीवन रेखा',
    cites: [cite(PFA, PFA_LIFE), cite(LOTH, LOTH_LIFE)],
  }),
  rule({
    id: 'cx-life-straight',
    tradition: WC,
    conditions: [when('line.life.curvature', 'eq', 'straight')],
    category: 'vitality',
    meaning: 'Energy that is held closer in — a quieter, less forceful physical presence.',
    meaningHi: 'ऐसी ऊर्जा जो भीतर सिमटी रहती है — शांत, कम ज़ोरदार शारीरिक मौजूदगी।',
    caveat: NOT_A_HEALTH_TEST,
    caveatHi: NOT_A_HEALTH_TEST_HI,
    traits: [t('low_key')],
    short: '{line.life.curvature} life line',
    shortHi: '{line.life.curvature} जीवन रेखा',
    cites: [cite(PFA, PFA_LIFE)],
  }),
  rule({
    id: 'cx-life-deep',
    tradition: WC,
    conditions: [when('line.life.depth', 'eq', 'deep')],
    category: 'vitality',
    meaning: 'Stamina that comes more from will and nerve than from sheer physical strength.',
    meaningHi: 'ऐसा दम-ख़म जो सिर्फ़ शारीरिक ताक़त से ज़्यादा इच्छाशक्ति और हिम्मत से आता है।',
    caveat: 'Describes a kind of drive, not a health assessment.',
    caveatHi: 'यह एक तरह की अंदरूनी लगन के बारे में है, सेहत की जाँच नहीं।',
    traits: [t('determined')],
    short: '{line.life.depth} life line',
    shortHi: '{line.life.depth} जीवन रेखा',
    cites: [cite(PFA, PFA_LIFE)],
  }),
  rule({
    id: 'cx-life-broken',
    tradition: WC,
    conditions: [when('line.life.continuity', 'eq', 'broken')],
    category: 'work_and_direction',
    meaning: 'A period of major change in the way life is lived.',
    meaningHi: 'जीवन जीने के ढंग में बड़े बदलाव का एक दौर।',
    caveat: 'Other old books read a break in this line far more darkly. That reading is refused here.',
    caveatHi: 'दूसरी पुरानी किताबें इस रेखा की टूट को कहीं ज़्यादा नकारात्मक ढंग से पढ़ती हैं। वह व्याख्या यहाँ नहीं मानी गई।',
    traits: [t('restless', 'neutral')],
    short: '{line.life.continuity} life line',
    shortHi: '{line.life.continuity} जीवन रेखा',
    cites: [cite(MARKUN, MARKUN_LIFE)],
    // A break is easy to see where there is none; be sure first.
    minConfidence: 0.7,
  }),
  rule({
    id: 'cx-life-short',
    tradition: WC,
    conditions: [when('line.life.length', 'eq', 'short')],
    category: 'vitality',
    meaning:
      'A shorter life line. Even the old books warn against reading its length as a count of years, and it is not read that way here.',
    meaningHi:
      'छोटी जीवन रेखा। पुरानी किताबें भी चेताती हैं कि इसकी लंबाई को उम्र के सालों की गिनती न समझा जाए, और यहाँ भी इसे ऐसे नहीं पढ़ा गया।',
    traits: [t('low_key', 'neutral')],
    short: '{line.life.length} life line',
    shortHi: '{line.life.length} जीवन रेखा',
    cites: [cite(MARKUN, MARKUN_LIFE), cite(LOTH, LOTH_LIFE)],
  }),
  rule({
    id: 'cx-life-end-luna',
    tradition: WC,
    conditions: [when('line.life.end_zone', 'eq', 'luna')],
    category: 'temperament',
    meaning: 'Restlessness and a strong wish to travel and see new places.',
    meaningHi: 'बेचैनी, और घूमने-फिरने व नई जगहें देखने की तेज़ इच्छा।',
    caveat: 'The books describe a branch toward the Moon mount. The photo records only where the line ends.',
    caveatHi: 'किताबें चंद्र पर्वत की ओर जाती एक शाखा की बात करती हैं। फोटो में सिर्फ़ यह दर्ज होता है कि रेखा कहाँ ख़त्म होती है।',
    traits: [t('restless')],
    short: 'life line ending {line.life.end_zone}',
    shortHi: '{line.life.end_zone} ख़त्म होती जीवन रेखा',
    cites: [cite(LOTH, LOTH_LIFE), cite(MARKUN, MARKUN_LIFE)],
  }),
  rule({
    id: 'cx-life-long',
    tradition: WC,
    conditions: [when('line.life.length', 'eq', 'long')],
    category: 'vitality',
    meaning: 'A long, clearly traced life line — the form the classical books call normal, and read as steady vitality.',
    meaningHi:
      'लंबी, साफ़ खिंची जीवन रेखा — वह रूप जिसे पुरानी शास्त्रीय किताबें सामान्य कहती हैं, और स्थिर जीवन-ऊर्जा के रूप में पढ़ती हैं।',
    caveat:
      'The same books read the length of this line as a count of years and as a sign of health. Neither is claimed here.',
    caveatHi:
      'यही किताबें इस रेखा की लंबाई को उम्र के सालों की गिनती और सेहत का संकेत भी मानती हैं। यहाँ इनमें से कोई दावा नहीं किया गया।',
    traits: [t('steady'), t('energetic')],
    short: '{line.life.length} life line',
    shortHi: '{line.life.length} जीवन रेखा',
    cites: [cite(PFA, PFA_LIFE), cite(LOTH, LOTH_LIFE)],
  }),
  rule({
    id: 'cx-life-faint',
    tradition: WC,
    conditions: [when('line.life.depth', 'eq', 'faint')],
    category: 'vitality',
    meaning: 'A calmer, lower-key kind of energy — steady rather than forceful.',
    meaningHi: 'शांत, धीमी तरह की ऊर्जा — ज़ोरदार के बजाय स्थिर।',
    caveat:
      'The books speak of pale lines, and one adds a claim about health that is refused. A photo shows only that the line looks faint, which is not quite the same thing.',
    caveatHi:
      'किताबें फीके रंग की रेखाओं की बात करती हैं, और एक किताब सेहत से जुड़ा दावा भी जोड़ती है जो यहाँ नहीं माना गया। फोटो सिर्फ़ यह दिखाती है कि रेखा हल्की लगती है, जो पूरी तरह एक ही बात नहीं है।',
    traits: [t('low_key')],
    short: '{line.life.depth} life line',
    shortHi: '{line.life.depth} जीवन रेखा',
    cites: [cite(PFA, PFA_CLASSES), cite(MARKUN, MARKUN_LINES)],
  }),
  rule({
    id: 'cx-life-chained',
    tradition: WC,
    conditions: [when('line.life.continuity', 'eq', 'chained')],
    category: 'vitality',
    meaning: 'Energy and purpose that come and go rather than holding steady.',
    meaningHi: 'ऊर्जा और मक़सद, जो स्थिर रहने के बजाय आते-जाते रहते हैं।',
    caveat:
      'The books read a chained life line mainly as a sign about the body. That is refused here; only their general reading of chained lines is kept.',
    caveatHi:
      'किताबें जंजीरनुमा जीवन रेखा को मुख्य रूप से शरीर से जुड़ा संकेत मानती हैं। वह बात यहाँ नहीं मानी गई; जंजीरनुमा रेखाओं के बारे में सिर्फ़ उनकी आम व्याख्या रखी गई है।',
    traits: [t('changeable', 'neutral')],
    short: '{line.life.continuity} life line',
    shortHi: '{line.life.continuity} जीवन रेखा',
    cites: [cite(PFA, PFA_CLASSES)],
  }),

  // ======== mounts ========
  rule({
    id: 'cx-mount-venus-raised',
    tradition: WC,
    conditions: [when('mount.venus.prominence', 'eq', 'raised')],
    category: 'temperament',
    meaning: 'Warmth, sympathy and a love of beauty — colour, music and the company of others.',
    meaningHi: 'गर्मजोशी, हमदर्दी और सुंदरता से प्रेम — रंग, संगीत और दूसरों का साथ।',
    caveat: 'The books also read a large Venus mount as strong health and strong passion. Only the part about temperament is kept.',
    caveatHi:
      'किताबें बड़े शुक्र पर्वत को अच्छी सेहत और तेज़ आवेग का संकेत भी मानती हैं। यहाँ सिर्फ़ स्वभाव वाला हिस्सा रखा गया है।',
    traits: [t('affectionate'), t('sociable'), t('artistic')],
    short: '{mount.venus.prominence} Venus mount',
    shortHi: '{mount.venus.prominence} शुक्र पर्वत',
    cites: [cite(LOTH, LOTH_MOUNTS), cite(PFA, PFA_VENUS), cite(MARKUN, MARKUN_MOUNTS)],
  }),
  rule({
    id: 'cx-mount-venus-flat',
    tradition: WC,
    conditions: [when('mount.venus.prominence', 'eq', 'flat')],
    category: 'emotional_life',
    meaning: 'Affection that lives more in the mind than in outward passion.',
    meaningHi: 'ऐसा स्नेह जो बाहर दिखने वाले आवेग से ज़्यादा मन में बसता है।',
    caveat:
      'The books disagree: one calls this coldness, another says the feeling may be just as strong but more mental than physical. Neither is certain.',
    caveatHi:
      'किताबों में मतभेद है: एक इसे ठंडापन कहती है, दूसरी कहती है कि भावना उतनी ही गहरी हो सकती है, बस शारीरिक से ज़्यादा मानसिक। दोनों में से कोई बात पक्की नहीं है।',
    traits: [t('reserved', 'neutral')],
    short: '{mount.venus.prominence} Venus mount',
    shortHi: '{mount.venus.prominence} शुक्र पर्वत',
    cites: [cite(PFA, PFA_VENUS), cite(MARKUN, MARKUN_MOUNTS)],
  }),
  rule({
    id: 'cx-mount-jupiter-raised',
    tradition: WC,
    conditions: [when('mount.jupiter.prominence', 'eq', 'raised')],
    category: 'temperament',
    meaning: 'Ambition, pride and enthusiasm — a wish to lead, organise and carry a goal through.',
    meaningHi: 'महत्वाकांक्षा, स्वाभिमान और उत्साह — अगुवाई करने, व्यवस्था बनाने और किसी लक्ष्य को पूरा करने की चाह।',
    caveat: 'The old books warn that, taken too far, this turns into vanity and a need to dominate.',
    caveatHi: 'पुरानी किताबें चेताती हैं कि हद से ज़्यादा होने पर यह घमंड और दूसरों पर हावी होने की ज़रूरत में बदल जाता है।',
    traits: [t('ambitious'), t('leader')],
    short: '{mount.jupiter.prominence} Jupiter mount',
    shortHi: '{mount.jupiter.prominence} गुरु पर्वत',
    cites: [cite(LOTH, LOTH_MOUNTS), cite(PFA, PFA_JUPITER), cite(MARKUN, MARKUN_MOUNTS)],
  }),
  rule({
    id: 'cx-mount-saturn-raised',
    tradition: WC,
    conditions: [when('mount.saturn.prominence', 'eq', 'raised')],
    category: 'temperament',
    meaning: 'Seriousness and prudence — a liking for quiet, solitude and earnest work.',
    meaningHi: 'गंभीरता और समझदारी — शांति, एकांत और मन लगाकर किए गए काम की पसंद।',
    caveat: 'Old books add gloom to an overdeveloped Saturn mount. That is not read into it here.',
    caveatHi: 'पुरानी किताबें बहुत ज़्यादा उभरे शनि पर्वत के साथ उदासी भी जोड़ती हैं। यहाँ उसमें यह अर्थ नहीं पढ़ा गया।',
    traits: [t('serious'), t('cautious')],
    short: '{mount.saturn.prominence} Saturn mount',
    shortHi: '{mount.saturn.prominence} शनि पर्वत',
    cites: [cite(LOTH, LOTH_MOUNTS), cite(PFA, PFA_SATURN), cite(MARKUN, MARKUN_MOUNTS)],
  }),
  rule({
    id: 'cx-mount-saturn-flat',
    tradition: WC,
    conditions: [when('mount.saturn.prominence', 'eq', 'flat')],
    category: 'temperament',
    meaning: 'A light-hearted approach to life — sombre, serious matters hold less pull.',
    meaningHi: 'जीवन के प्रति हल्का-फुल्का, खुशदिल नज़रिया — भारी और गंभीर बातें कम खींचती हैं।',
    caveat: 'Read as a lighter manner, not a lack of depth.',
    caveatHi: 'इसे हल्के-फुल्के अंदाज़ के रूप में पढ़ें, गहराई की कमी के रूप में नहीं।',
    traits: [t('cheerful')],
    short: '{mount.saturn.prominence} Saturn mount',
    shortHi: '{mount.saturn.prominence} शनि पर्वत',
    cites: [cite(PFA, PFA_SATURN), cite(MARKUN, MARKUN_MOUNTS)],
    // This mount is rarely high on anyone; only a confident "flat" counts.
    minConfidence: 0.7,
  }),
  rule({
    id: 'cx-mount-apollo-raised',
    tradition: WC,
    conditions: [when('mount.apollo.prominence', 'eq', 'raised')],
    category: 'temperament',
    meaning: 'Enthusiasm for beauty — art, poetry and pleasing surroundings — with a warm, generous manner.',
    meaningHi: 'सुंदरता के लिए उत्साह — कला, कविता और मन को भाने वाला माहौल — साथ में गर्मजोशी भरा, उदार व्यवहार।',
    traits: [t('artistic'), t('generous')],
    short: '{mount.apollo.prominence} Sun mount',
    shortHi: '{mount.apollo.prominence} सूर्य पर्वत',
    cites: [cite(LOTH, LOTH_MOUNTS), cite(PFA, PFA_SUN_MOUNT), cite(MARKUN, MARKUN_MOUNTS)],
  }),
  rule({
    id: 'cx-mount-mercury-raised',
    tradition: WC,
    conditions: [when('mount.mercury.prominence', 'eq', 'raised')],
    category: 'communication',
    meaning: 'Quick wit and a ready tongue, with a flair for commerce, science and anything that needs a sharp mind.',
    meaningHi:
      'तेज़ हाज़िरजवाबी और बात करने में फुर्ती, साथ में व्यापार, विज्ञान और तेज़ दिमाग़ माँगने वाले हर काम की सूझ-बूझ।',
    caveat: 'Old books warn that an extreme form of this mount turns cleverness into trickery. That is a caution in the books, not a judgement of you.',
    caveatHi:
      'पुरानी किताबें चेताती हैं कि इस पर्वत का बहुत बढ़ा हुआ रूप चतुराई को चालबाज़ी में बदल देता है। यह किताबों की एक चेतावनी है, आपके बारे में कोई फ़ैसला नहीं।',
    traits: [t('quick_witted'), t('business_minded')],
    short: '{mount.mercury.prominence} Mercury mount',
    shortHi: '{mount.mercury.prominence} बुध पर्वत',
    cites: [cite(PFA, PFA_MERCURY), cite(LOTH, LOTH_MOUNTS), cite(MARKUN, MARKUN_MOUNTS)],
  }),
  rule({
    id: 'cx-mount-luna-raised',
    tradition: WC,
    conditions: [when('mount.luna.prominence', 'eq', 'raised')],
    category: 'temperament',
    meaning: 'A strong imagination and romantic ideals, with a love of travel, scenery and anything new.',
    meaningHi: 'तेज़ कल्पना-शक्ति और रूमानी आदर्श, साथ में यात्रा, प्राकृतिक नज़ारों और हर नई चीज़ से लगाव।',
    traits: [t('imaginative'), t('restless', 'neutral')],
    short: '{mount.luna.prominence} Moon mount',
    shortHi: '{mount.luna.prominence} चंद्र पर्वत',
    cites: [cite(LOTH, LOTH_MOUNTS), cite(PFA, PFA_MOON), cite(MARKUN, MARKUN_MOUNTS)],
  }),
  rule({
    id: 'cx-mount-luna-flat',
    tradition: WC,
    conditions: [when('mount.luna.prominence', 'eq', 'flat')],
    category: 'thinking_style',
    meaning: 'A reasoning, organising mind that prefers to work problems out quietly rather than by flights of imagination.',
    meaningHi:
      'तर्क से सोचने और चीज़ों को व्यवस्थित करने वाला दिमाग़, जो कल्पना की उड़ान के बजाय चुपचाप सोच-विचार कर समस्याएँ सुलझाना पसंद करता है।',
    traits: [t('logical'), t('practical')],
    short: '{mount.luna.prominence} Moon mount',
    shortHi: '{mount.luna.prominence} चंद्र पर्वत',
    cites: [cite(PFA, PFA_MOON)],
  }),
  rule({
    id: 'cx-mount-mars-thumb-raised',
    tradition: WC,
    conditions: [when(`mount.${THUMB_SIDE_MARS}.prominence`, 'eq', 'raised')],
    category: 'temperament',
    meaning: 'Active courage and a fighting spirit — quick to stand up for yourself, with a temper that flares and passes.',
    meaningHi:
      'सक्रिय साहस और जुझारू जज़्बा — अपने लिए जल्दी खड़े हो जाना, और ऐसा ग़ुस्सा जो भड़कता है और जल्दी उतर भी जाता है।',
    caveat: 'When very large, the books read this as quarrelsome.',
    caveatHi: 'बहुत बड़ा होने पर किताबें इसे झगड़ालू स्वभाव के रूप में पढ़ती हैं।',
    traits: [t('bold'), t('quick_tempered', 'watch')],
    short: '{mount.mars_negative.prominence} thumb-side Mars mount',
    shortHi: '{mount.mars_negative.prominence} अँगूठे की ओर का मंगल पर्वत',
    cites: [cite(LOTH, LOTH_MOUNTS), cite(PFA, PFA_MARS)],
  }),
  rule({
    id: 'cx-mount-mars-outer-raised',
    tradition: WC,
    conditions: [when(`mount.${OUTER_MARS}.prominence`, 'eq', 'raised')],
    category: 'temperament',
    meaning: 'Moral courage and self-control — steady resistance to what seems wrong, and calm under pressure.',
    meaningHi: 'नैतिक साहस और आत्म-संयम — जो ग़लत लगे उसका डटकर विरोध, और दबाव में भी शांत रहना।',
    traits: [t('self_controlled'), t('bold')],
    short: '{mount.mars_positive.prominence} outer Mars mount',
    shortHi: '{mount.mars_positive.prominence} बाहरी मंगल पर्वत',
    cites: [cite(LOTH, LOTH_MOUNTS), cite(PFA, PFA_MARS), cite(MARKUN, MARKUN_MOUNTS)],
  }),

  // ======== mounts: Dale's Indian readings ========
  rule({
    id: 'cx-mount-venus-raised-dale',
    tradition: IHR,
    conditions: [when('mount.venus.prominence', 'eq', 'raised')],
    category: 'temperament',
    meaning: 'A merry, sociable nature with a love of beauty and pleasure — music, painting and good company.',
    meaningHi: 'हँसमुख, मिलनसार स्वभाव, जिसे सुंदरता और आनंद से प्रेम है — संगीत, चित्रकारी और अच्छी संगत।',
    caveat:
      'The same book reads a very large mount as changeable in affection, and adds claims about desire that are left out.',
    caveatHi:
      'यही किताब बहुत बड़े पर्वत को स्नेह में बदलते रहने का संकेत मानती है, और इच्छाओं के बारे में कुछ दावे भी जोड़ती है जो यहाँ छोड़ दिए गए हैं।',
    traits: [t('cheerful'), t('sociable'), t('artistic')],
    short: '{mount.venus.prominence} Venus mount',
    shortHi: '{mount.venus.prominence} शुक्र पर्वत',
    cites: [cite(DALE, DALE_VENUS), cite(DALE, DALE_REF_VENUS)],
  }),
  rule({
    id: 'cx-mount-venus-flat-dale',
    tradition: IHR,
    conditions: [when('mount.venus.prominence', 'eq', 'flat')],
    category: 'emotional_life',
    meaning: 'A cooler, more reserved manner in affection.',
    meaningHi: 'स्नेह में थोड़ा ठंडा और ज़्यादा संकोच भरा व्यवहार।',
    caveat: "The book's longer passage on a low Venus mount adds harsh judgements of character. Those are refused here.",
    caveatHi: 'दबे हुए शुक्र पर्वत पर किताब का लंबा हिस्सा चरित्र के बारे में कठोर फ़ैसले जोड़ता है। वे यहाँ नहीं माने गए।',
    traits: [t('reserved')],
    short: '{mount.venus.prominence} Venus mount',
    shortHi: '{mount.venus.prominence} शुक्र पर्वत',
    cites: [cite(DALE, DALE_REF_VENUS)],
  }),
  rule({
    id: 'cx-mount-saturn-raised-dale',
    tradition: IHR,
    conditions: [when('mount.saturn.prominence', 'eq', 'raised')],
    category: 'temperament',
    meaning: 'Wisdom and prudence — a careful, considered way of going about things.',
    meaningHi: 'विवेक और समझदारी — सावधानी और सोच-विचार के साथ काम करने का तरीका।',
    caveat: 'When the mount is very full, the book reads quietness turning to sadness. That is a caution, not a reading here.',
    caveatHi: 'जब पर्वत बहुत भरा हुआ हो, तो किताब चुप्पी को उदासी में बदलते हुए पढ़ती है। यहाँ यह एक सावधानी है, रीडिंग नहीं।',
    traits: [t('cautious'), t('serious')],
    short: '{mount.saturn.prominence} Saturn mount',
    shortHi: '{mount.saturn.prominence} शनि पर्वत',
    cites: [cite(DALE, DALE_REF_SATURN)],
  }),
  rule({
    id: 'cx-mount-apollo-raised-dale',
    tradition: IHR,
    conditions: [when('mount.apollo.prominence', 'eq', 'raised')],
    category: 'temperament',
    meaning: 'A gift for art and a bright, inventive intelligence.',
    meaningHi: 'कला की ख़ास प्रतिभा, और तेज़, नई-नई बातें खोजने वाली बुद्धि।',
    caveat: 'The book judges a very full mount harshly. That judgement is refused here.',
    caveatHi: 'किताब बहुत भरे हुए पर्वत को कठोरता से आँकती है। वह फ़ैसला यहाँ नहीं माना गया।',
    traits: [t('artistic'), t('imaginative')],
    short: '{mount.apollo.prominence} Sun mount',
    shortHi: '{mount.apollo.prominence} सूर्य पर्वत',
    cites: [cite(DALE, DALE_REF_SUN)],
  }),
  rule({
    id: 'cx-mount-luna-raised-dale',
    tradition: IHR,
    conditions: [when('mount.luna.prominence', 'eq', 'raised')],
    category: 'temperament',
    meaning: 'Imagination, refinement and a feeling for poetry.',
    meaningHi: 'कल्पना, सुरुचि और कविता के लिए लगाव।',
    caveat: 'The book reads a very large mount far more darkly. That reading is refused here.',
    caveatHi: 'किताब बहुत बड़े पर्वत को कहीं ज़्यादा नकारात्मक ढंग से पढ़ती है। वह व्याख्या यहाँ नहीं मानी गई।',
    traits: [t('imaginative'), t('artistic')],
    short: '{mount.luna.prominence} Moon mount',
    shortHi: '{mount.luna.prominence} चंद्र पर्वत',
    cites: [cite(DALE, DALE_REF_MOON)],
  }),
  rule({
    id: 'cx-mount-mars-outer-raised-dale',
    tradition: IHR,
    conditions: [when(`mount.${OUTER_MARS}.prominence`, 'eq', 'raised')],
    category: 'temperament',
    meaning: 'Courage and firmness of purpose — bold, and hard to deter.',
    meaningHi: 'साहस और इरादे की मज़बूती — निडर, और जिसे आसानी से रोका न जा सके।',
    caveat: 'In excess, the book reads this as hot passion and a contentious streak.',
    caveatHi: 'ज़रूरत से ज़्यादा होने पर किताब इसे तेज़ आवेश और बहस-झगड़े की आदत के रूप में पढ़ती है।',
    traits: [t('bold'), t('determined')],
    short: '{mount.mars_positive.prominence} outer Mars mount',
    shortHi: '{mount.mars_positive.prominence} बाहरी मंगल पर्वत',
    cites: [cite(DALE, DALE_REF_MARS), cite(DALE, DALE_MARS)],
  }),
  rule({
    id: 'cx-mount-mars-outer-flat-dale',
    tradition: IHR,
    conditions: [when(`mount.${OUTER_MARS}.prominence`, 'eq', 'flat')],
    category: 'temperament',
    meaning: 'A rash streak — boldness that can run ahead of caution.',
    meaningHi: 'जल्दबाज़ी की आदत — ऐसी हिम्मत जो सावधानी से आगे निकल सकती है।',
    caveat: "The book's word is temerity. Read it as a tendency to act before weighing risks, not as a judgement of character.",
    caveatHi:
      'किताब का शब्द "temerity" (दुस्साहस) है। इसे जोखिम तौलने से पहले कदम उठा लेने के झुकाव के रूप में पढ़ें, चरित्र पर फ़ैसले के रूप में नहीं।',
    traits: [t('impulsive', 'watch'), t('bold', 'neutral')],
    short: '{mount.mars_positive.prominence} outer Mars mount',
    shortHi: '{mount.mars_positive.prominence} बाहरी मंगल पर्वत',
    cites: [cite(DALE, DALE_REF_MARS)],
  }),

  // ======== conflict: a flat Mount of the Moon ========
  // Cheiro reads a steady, loyal, responsible nature; Dale reads inconstancy
  // "in life and actions". Same feature, opposite readings, two traditions:
  // both are shown, side by side, and neither is chosen.
  rule({
    id: 'cx-mount-luna-flat-steady',
    tradition: WC,
    conditions: [when('mount.luna.prominence', 'eq', 'flat')],
    category: 'temperament',
    meaning:
      'A steady, dependable nature — decided views, loyalty once friendship is given, and an ease with carrying responsibility for others.',
    meaningHi:
      'स्थिर, भरोसेमंद स्वभाव — पक्की राय, दोस्ती हो जाने पर वफ़ादारी, और दूसरों की ज़िम्मेदारी सहजता से उठा लेना।',
    caveat:
      'The book gives this reading for a flat mount and, separately, for people born in a certain season. Only the flat mount is read here.',
    caveatHi:
      'किताब यह व्याख्या चपटे पर्वत के लिए देती है, और अलग से साल के एक ख़ास मौसम में जन्मे लोगों के लिए भी। यहाँ सिर्फ़ चपटे पर्वत को पढ़ा गया है।',
    traits: [t('steady'), t('loyal'), t('responsible')],
    short: '{mount.luna.prominence} Moon mount',
    shortHi: '{mount.luna.prominence} चंद्र पर्वत',
    cites: [cite(PFA, PFA_MOON)],
    conflictGroup: 'mount_luna_flat_steadiness',
  }),
  rule({
    id: 'cx-mount-luna-flat-dale',
    tradition: IHR,
    conditions: [when('mount.luna.prominence', 'eq', 'flat')],
    category: 'temperament',
    meaning: 'A changeable way of living and acting — plans and habits shift more than they settle.',
    meaningHi: 'जीने और काम करने का बदलता रहने वाला ढंग — योजनाएँ और आदतें टिकने से ज़्यादा बदलती रहती हैं।',
    caveat:
      'The book describes the mount as flat, soft and small; a photo shows only that it is flat. Its harsher words for this form are refused.',
    caveatHi:
      'किताब पर्वत को चपटा, नरम और छोटा बताती है; फोटो सिर्फ़ यह दिखाती है कि वह चपटा है। इस रूप के लिए किताब के ज़्यादा कठोर शब्द यहाँ नहीं माने गए।',
    traits: [t('changeable', 'neutral')],
    short: '{mount.luna.prominence} Moon mount',
    shortHi: '{mount.luna.prominence} चंद्र पर्वत',
    cites: [cite(DALE, DALE_MOON)],
    conflictGroup: 'mount_luna_flat_steadiness',
  }),
  // ======== fifth pass (2026-09-18): the rest of the catalogued books ========
  // Aimed at what the line scanner measures on nearly every palm and no rule
  // read: heart length and ending, head ending on the outer Mars and its join
  // with the life line, head slope, the life line's sweep and its ending at the
  // wrist. Benham, Cheiro's Guide, Saint-Germain and Desbarrolles trace the
  // heart line from the index finger outward, so their "rising from Jupiter /
  // Saturn" is this app's heart line ENDING under the index / middle finger.
  // Western books that disagree with each other keep one rule and say so in
  // the caveat: a conflict group only shows a disagreement across traditions.

  // ---- heart line ----
  rule({
    id: 'cx-heart-long',
    tradition: WC,
    conditions: [when('line.heart.length', 'eq', 'long')],
    category: 'emotional_life',
    meaning:
      'Strong, wholehearted affection — the old books read a longer heart line as a fuller capacity for attachment.',
    meaningHi:
      'मज़बूत, पूरे दिल से होने वाला स्नेह — पुरानी किताबें लंबी हृदय रेखा को लगाव की ज़्यादा भरपूर क्षमता के रूप में पढ़ती हैं।',
    caveat: 'Describes how strongly affection is felt, not how any relationship will go.',
    caveatHi: 'यह बताता है कि स्नेह कितनी गहराई से महसूस होता है, यह नहीं कि कोई रिश्ता कैसा चलेगा।',
    traits: [t('affectionate')],
    weight: 'strong',
    short: '{line.heart.length} heart line',
    shortHi: '{line.heart.length} हृदय रेखा',
    cites: [
      cite(HAM, HAM_HEART),
      cite(HAP, HAP_HEART),
      cite(RAPH, RAPH_HEART),
      cite(STH, STH_HEART),
      cite(SG, SG_HEART),
      cite(DESB, DESB_HEART),
    ],
  }),
  rule({
    id: 'cx-heart-long-index',
    tradition: WC,
    // "Right across the hand, from side to side": long AND reaching the index side.
    conditions: [when('line.heart.length', 'eq', 'long'), when('line.heart.end_zone', 'in', UNDER_INDEX)],
    category: 'relationships',
    meaning:
      'Affection given so fully that it can tip into possessiveness or jealousy — something the old books tell such people to watch.',
    meaningHi:
      'इतना भरपूर स्नेह कि वह कभी-कभी अधिकार जताने या जलन में बदल सकता है — पुरानी किताबें ऐसे लोगों को इस पर ध्यान रखने को कहती हैं।',
    caveat:
      'The books describe a heart line running right across the hand. This is a caution about a tendency, not a judgement of character.',
    caveatHi:
      'किताबें पूरी हथेली के आर-पार जाती हृदय रेखा की बात करती हैं। यह एक झुकाव के बारे में सावधानी है, चरित्र पर कोई फ़ैसला नहीं।',
    traits: [t('affectionate'), t('possessive', 'watch')],
    short: '{line.heart.length} heart line ending {line.heart.end_zone}',
    shortHi: '{line.heart.end_zone} ख़त्म होती {line.heart.length} हृदय रेखा',
    cites: [
      cite(LOTH, LOTH_HEART),
      cite(PFA, PFA_HEART),
      cite(HAM, HAM_HEART),
      cite(GUIDE, GUIDE_HEART),
      cite(SG, SG_HEART),
      cite(DESB, DESB_HEART),
      cite(BENHAM, BENHAM_HEART),
      cite(FRITH, FRITH_HEART),
    ],
  }),
  rule({
    id: 'cx-heart-end-index-ideal',
    tradition: WC,
    conditions: [when('line.heart.end_zone', 'in', UNDER_INDEX)],
    category: 'emotional_life',
    meaning: 'An idealistic view of love — a tendency to look up to the person you love.',
    meaningHi: 'प्यार के बारे में आदर्शवादी नज़रिया — जिसे आप चाहते हैं, उसे ऊँचा दर्जा देने का झुकाव।',
    caveat: 'A way of seeing love, not a prediction about any relationship.',
    caveatHi: 'यह प्यार को देखने का एक ढंग है, किसी रिश्ते के बारे में भविष्यवाणी नहीं।',
    traits: [t('idealistic')],
    short: 'heart line ending {line.heart.end_zone}',
    shortHi: '{line.heart.end_zone} ख़त्म होती हृदय रेखा',
    cites: [cite(BENHAM, BENHAM_HEART), cite(GUIDE, GUIDE_HEART), cite(RAPH, RAPH_HEART)],
  }),
  rule({
    id: 'cx-heart-end-between-practical',
    tradition: WC,
    conditions: [when('line.heart.end_zone', 'eq', 'between_jupiter_and_saturn')],
    category: 'relationships',
    meaning: 'Sensible, practical affection — strong feeling that is not easily swept away by sentiment.',
    meaningHi: 'समझदारी भरा, व्यावहारिक स्नेह — गहरी भावना, जो भावुकता में आसानी से बह नहीं जाती।',
    traits: [t('practical'), t('affectionate')],
    short: 'heart line ending {line.heart.end_zone}',
    shortHi: '{line.heart.end_zone} ख़त्म होती हृदय रेखा',
    cites: [cite(BENHAM, BENHAM_HEART)],
  }),
  rule({
    id: 'cx-heart-end-middle-physical',
    tradition: WC,
    conditions: [when('line.heart.end_zone', 'in', UNDER_MIDDLE)],
    category: 'emotional_life',
    meaning: 'Affection that is shown through closeness and presence as much as through words.',
    meaningHi: 'ऐसा स्नेह जो शब्दों जितना ही पास रहने और साथ होने से जताया जाता है।',
    caveat:
      'The old books call this ending more physical than idealistic in love, and some add selfishness. Only the style of affection is kept.',
    caveatHi:
      'पुरानी किताबें इस सिरे को प्यार में आदर्श से ज़्यादा शारीरिक बताती हैं, और कुछ इसमें स्वार्थ भी जोड़ती हैं। यहाँ सिर्फ़ स्नेह जताने का ढंग रखा गया है।',
    traits: [t('affectionate')],
    short: 'heart line ending {line.heart.end_zone}',
    shortHi: '{line.heart.end_zone} ख़त्म होती हृदय रेखा',
    cites: [cite(GUIDE, GUIDE_HEART), cite(DESB, DESB_HEART), cite(HAM, HAM_HEART), cite(BENHAM, BENHAM_HEART)],
  }),
  rule({
    id: 'cx-heart-index-continuous',
    tradition: WC,
    conditions: [when('line.heart.end_zone', 'in', UNDER_INDEX), when('line.heart.continuity', 'eq', 'continuous')],
    category: 'temperament',
    meaning:
      'An affectionate disposition with an even temper — the unbroken line reaching the index finger is the form the old books hold up as the well-made heart line.',
    meaningHi:
      'स्नेही स्वभाव और संतुलित मिज़ाज — तर्जनी तक पहुँचती बिना टूटी रेखा को पुरानी किताबें अच्छी बनी हृदय रेखा का रूप मानती हैं।',
    caveat: 'One book adds good health to this picture. That claim is left out.',
    caveatHi: 'एक किताब इस तस्वीर में अच्छी सेहत भी जोड़ती है। वह दावा यहाँ छोड़ दिया गया है।',
    traits: [t('affectionate'), t('even_tempered')],
    short: '{line.heart.continuity} heart line ending {line.heart.end_zone}',
    shortHi: '{line.heart.end_zone} ख़त्म होती {line.heart.continuity} हृदय रेखा',
    cites: [cite(HAM, HAM_HEART), cite(DESB, DESB_HEART), cite(STH, STH_HEART)],
  }),
  rule({
    id: 'cx-heart-long-jain',
    tradition: IHR,
    conditions: [when('line.heart.length', 'eq', 'long')],
    category: 'temperament',
    meaning: 'A spirited, cheerful and well-meaning nature.',
    meaningHi: 'जोशीला, खुशमिज़ाज और नेक इरादों वाला स्वभाव।',
    caveat:
      'The book speaks of a bright, extended line under the fingers. A photo can judge its length, not its brightness.',
    caveatHi: 'किताब उँगलियों के नीचे चमकदार, फैली हुई रेखा की बात करती है। फोटो उसकी लंबाई आँक सकती है, चमक नहीं।',
    traits: [t('cheerful'), t('generous')],
    short: '{line.heart.length} heart line',
    shortHi: '{line.heart.length} हृदय रेखा',
    cites: [cite(JAIN, JAIN_HEART)],
  }),
  rule({
    id: 'cx-heart-fork-jain',
    tradition: IHR,
    conditions: [when('line.heart.marks.fork', 'gte', 1)],
    category: 'temperament',
    meaning: 'A cheerful, bold and generous-minded nature, ready to help friends get things done.',
    meaningHi: 'खुशमिज़ाज, साहसी और बड़े दिल वाला स्वभाव, जो दोस्तों के काम बनाने में मदद को तैयार रहता है।',
    caveat: 'The book also calls this sign lucky. That promise is left out.',
    caveatHi: 'किताब इस चिह्न को भाग्यशाली भी कहती है। वह वादा यहाँ छोड़ दिया गया है।',
    traits: [t('cheerful'), t('bold'), t('generous')],
    short: 'heart line with a fork ({line.heart.marks.fork})',
    shortHi: 'हृदय रेखा में फ़ोर्क ({line.heart.marks.fork})',
    cites: [cite(JAIN, JAIN_HEART)],
  }),

  // ---- head line ----
  rule({
    id: 'cx-head-end-outer-mars-practical',
    tradition: WC,
    conditions: [when('line.head.end_zone', 'eq', OUTER_MARS)],
    category: 'thinking_style',
    meaning:
      'Practical ideas about everything — the balanced middle course, with the mind pulled neither to cold calculation nor to fancy.',
    meaningHi:
      'हर बात में व्यावहारिक सोच — संतुलित बीच का रास्ता, जिसमें मन न तो रूखे हिसाब-किताब की ओर खिंचता है, न कोरी कल्पना की ओर।',
    traits: [t('practical')],
    short: 'head line ending {line.head.end_zone}',
    shortHi: '{line.head.end_zone} ख़त्म होती मस्तिष्क रेखा',
    cites: [cite(BENHAM, BENHAM_HEAD)],
  }),
  rule({
    id: 'cx-head-open-mars',
    tradition: WC,
    conditions: [when('line.head.life_join', 'in', ['separate', 'wide']), when('line.head.end_zone', 'eq', OUTER_MARS)],
    category: 'work_and_direction',
    meaning: 'A natural organiser — drawn to taking the lead in shared causes and public efforts.',
    meaningHi: 'स्वाभाविक रूप से व्यवस्था करने वाले — साझा मक़सद और लोगों से जुड़े कामों में आगे बढ़कर अगुवाई करने की ओर खिंचाव।',
    caveat: 'The book adds that such people will give up a great deal for a cause. Read that as a leaning, not a forecast.',
    caveatHi: 'किताब यह भी कहती है कि ऐसे लोग किसी मक़सद के लिए बहुत कुछ छोड़ देते हैं। इसे एक झुकाव समझें, भविष्यवाणी नहीं।',
    traits: [t('leader')],
    short: 'head line starting {line.head.life_join}, ending {line.head.end_zone}',
    shortHi: 'शुरुआत में {line.head.life_join}, {line.head.end_zone} ख़त्म होती मस्तिष्क रेखा',
    cites: [cite(PFA, PFA_HEAD)],
  }),
  rule({
    id: 'cx-head-joined-life-advice',
    tradition: WC,
    conditions: [when('line.head.life_join', 'eq', 'joined')],
    category: 'thinking_style',
    meaning:
      "A habit of weighing other people's advice before your own — self-reliance that tends to grow later rather than early.",
    meaningHi:
      'अपनी राय से पहले दूसरों की सलाह तौलने की आदत — ऐसा आत्मनिर्भरपन जो अक्सर जल्दी के बजाय बाद में बढ़ता है।',
    caveat:
      'The books read how far the two lines stay joined; a photo shows only that they are joined. Their harsher words about timidity are refused.',
    caveatHi:
      'किताबें यह पढ़ती हैं कि दोनों रेखाएँ कितनी दूर तक जुड़ी रहती हैं; फोटो सिर्फ़ यह दिखाती है कि वे जुड़ी हैं। डरपोकपन के बारे में उनके कठोर शब्द यहाँ नहीं माने गए।',
    traits: [t('cautious', 'neutral'), t('independent', 'watch')],
    short: 'head line starting {line.head.life_join}',
    shortHi: 'शुरुआत में {line.head.life_join} मस्तिष्क रेखा',
    cites: [cite(BENHAM, BENHAM_HEAD), cite(STH, STH_HEAD), cite(SG, SG_HEAD), cite(HAP, HAP_HEAD)],
  }),
  rule({
    id: 'cx-head-joined-life-shy',
    tradition: WC,
    conditions: [when('line.head.life_join', 'eq', 'joined')],
    category: 'emotional_life',
    meaning:
      "A shyness that is often hidden behind a quick, confident manner — other people's remarks land harder than they show.",
    meaningHi:
      'ऐसा संकोच जो अक्सर फुर्तीले, आत्मविश्वासी अंदाज़ के पीछे छिपा रहता है — दूसरों की टिप्पणियाँ जितना दिखता है उससे ज़्यादा चुभती हैं।',
    traits: [t('sensitive', 'neutral'), t('reserved', 'neutral')],
    short: 'head line starting {line.head.life_join}',
    shortHi: 'शुरुआत में {line.head.life_join} मस्तिष्क रेखा',
    cites: [cite(FRITH, FRITH_HEAD), cite(RAPH, RAPH_HEAD)],
  }),
  rule({
    id: 'cx-head-joined-life-dale',
    tradition: IHR,
    conditions: [when('line.head.life_join', 'eq', 'joined')],
    category: 'thinking_style',
    meaning: 'Good wit and an even temper — a quick, sharp mind that is at home in practical dealings.',
    meaningHi: 'अच्छी सूझ-बूझ और संतुलित मिज़ाज — तेज़, पैना दिमाग़ जो व्यावहारिक लेन-देन में सहज रहता है।',
    caveat: 'The book asks for the two lines to meet at a neat angle. The photo shows only that they meet.',
    caveatHi: 'किताब कहती है कि दोनों रेखाएँ एक साफ़ कोण पर मिलें। फोटो सिर्फ़ यह दिखाती है कि वे मिलती हैं।',
    traits: [t('quick_witted'), t('even_tempered'), t('practical')],
    short: 'head line starting {line.head.life_join}',
    shortHi: 'शुरुआत में {line.head.life_join} मस्तिष्क रेखा',
    cites: [cite(DALE, DALE_LIFE)],
    conflictGroup: 'head_life_joined',
  }),
  rule({
    id: 'cx-head-separate-life-confident',
    tradition: WC,
    conditions: [when('line.head.life_join', 'eq', 'separate')],
    category: 'temperament',
    meaning: 'Self-reliance and quick decisions — criticism does not easily knock you off course.',
    meaningHi: 'आत्मनिर्भरता और जल्दी फ़ैसले — आलोचना आपको आसानी से रास्ते से नहीं हटाती।',
    caveat:
      'The same books warn that this goes with impulsiveness, so second thoughts are often the better ones. One old book reads the gap as a light, fanciful mind instead.',
    caveatHi:
      'यही किताबें चेताती हैं कि इसके साथ जल्दबाज़ी भी आती है, इसलिए दोबारा सोची हुई बात अक्सर बेहतर होती है। एक पुरानी किताब इस दूरी को इसके बजाय हल्के, कल्पना में खोए मन के रूप में पढ़ती है।',
    traits: [t('independent'), t('decisive'), t('impulsive', 'watch')],
    short: 'head line starting {line.head.life_join}',
    shortHi: 'शुरुआत में {line.head.life_join} मस्तिष्क रेखा',
    cites: [
      cite(STH, STH_HEAD),
      cite(FRITH, FRITH_HEAD),
      cite(BENHAM, BENHAM_HEAD),
      cite(SG, SG_HEAD),
      cite(GUIDE, GUIDE_LIFE),
      cite(HAM, HAM_HEAD),
    ],
  }),
  rule({
    id: 'cx-head-long-even',
    tradition: WC,
    conditions: [when('line.head.length', 'eq', 'long'), when('line.head.continuity', 'eq', 'continuous')],
    category: 'thinking_style',
    meaning: 'Sound judgement and a clear, steady mind, with the will to carry a decision through.',
    meaningHi: 'सही परख और साफ़, स्थिर मन, साथ में किसी फ़ैसले को अंत तक निभाने की इच्छाशक्ति।',
    traits: [t('thorough'), t('determined'), t('steady')],
    short: '{line.head.length}, {line.head.continuity} head line',
    shortHi: '{line.head.length}, {line.head.continuity} मस्तिष्क रेखा',
    cites: [cite(STH, STH_HEAD), cite(FRITH, FRITH_HEAD), cite(GUIDE, GUIDE_HEAD)],
  }),
  rule({
    id: 'cx-head-long-straight',
    tradition: WC,
    conditions: [when('line.head.length', 'eq', 'long'), when('line.head.curvature', 'eq', 'straight')],
    category: 'thinking_style',
    meaning: 'A clear, logical mind with a strong will — careful and economical in its choices.',
    meaningHi: 'साफ़, तर्क से चलने वाला दिमाग़ और मज़बूत इच्छाशक्ति — अपने फ़ैसलों में सावधान और किफ़ायती।',
    caveat:
      'Several old books read a very long, straight line as over-calculation or meanness. That judgement is refused; only care with resources is kept.',
    caveatHi:
      'कई पुरानी किताबें बहुत लंबी, सीधी रेखा को ज़रूरत से ज़्यादा हिसाब-किताब या कंजूसी मानती हैं। वह फ़ैसला यहाँ नहीं माना गया; सिर्फ़ साधनों के साथ सावधानी वाली बात रखी गई है।',
    traits: [t('logical'), t('determined'), t('cautious')],
    short: '{line.head.length}, {line.head.curvature} head line',
    shortHi: '{line.head.length}, {line.head.curvature} मस्तिष्क रेखा',
    cites: [cite(DESB, DESB_HEAD), cite(SG, SG_HEAD), cite(STH, STH_HEAD)],
  }),
  rule({
    id: 'cx-head-straight-settled',
    tradition: WC,
    conditions: [when('line.head.curvature', 'eq', 'straight')],
    category: 'thinking_style',
    meaning: 'Settled opinions and an even mental balance — once a view is formed, it tends to stay.',
    meaningHi: 'पक्की राय और संतुलित मन — एक बार कोई राय बन जाए, तो वह अक्सर टिकी रहती है।',
    caveat: 'One old book reads a head line with no curve at all as hard and unyielding. Take it as a caution, not a verdict.',
    caveatHi: 'एक पुरानी किताब बिना किसी मोड़ वाली मस्तिष्क रेखा को कठोर और न झुकने वाला मानती है। इसे सावधानी समझें, फ़ैसला नहीं।',
    traits: [t('steady'), t('practical')],
    short: '{line.head.curvature} head line',
    shortHi: '{line.head.curvature} मस्तिष्क रेखा',
    cites: [cite(BENHAM, BENHAM_HEAD), cite(GUIDE, GUIDE_HEAD), cite(RAPH, RAPH_HEAD)],
  }),
  rule({
    id: 'cx-head-gentle-level',
    tradition: WC,
    conditions: [when('line.head.curvature', 'eq', 'gentle')],
    category: 'thinking_style',
    meaning: 'Level-headed — logic and imagination kept in balance, so neither runs the show alone.',
    meaningHi: 'संतुलित सोच — तर्क और कल्पना में तालमेल, ताकि अकेले कोई एक ही हावी न हो।',
    traits: [t('logical'), t('imaginative')],
    short: '{line.head.curvature} head line',
    shortHi: '{line.head.curvature} मस्तिष्क रेखा',
    cites: [cite(GUIDE, GUIDE_HEAD), cite(SG, SG_HEAD), cite(BENHAM, BENHAM_HEAD), cite(RAPH, RAPH_HEAD)],
  }),
  rule({
    id: 'cx-head-curved-artistic',
    tradition: WC,
    conditions: [when('line.head.curvature', 'eq', 'curved')],
    category: 'work_and_direction',
    meaning: 'Best suited to intellectual, artistic or literary work, where imagination is an asset.',
    meaningHi: 'बौद्धिक, कलात्मक या साहित्यिक काम के लिए सबसे उपयुक्त, जहाँ कल्पना एक ताक़त होती है।',
    caveat: 'Old books attach claims about the mind’s health to an extreme slope. Those are refused here.',
    caveatHi: 'पुरानी किताबें बहुत ज़्यादा ढलान के साथ मानसिक सेहत से जुड़े दावे जोड़ती हैं। वे यहाँ नहीं माने गए।',
    traits: [t('imaginative'), t('artistic')],
    short: '{line.head.curvature} head line',
    shortHi: '{line.head.curvature} मस्तिष्क रेखा',
    cites: [cite(SG, SG_HEAD), cite(DESB, DESB_HEAD), cite(BENHAM, BENHAM_HEAD), cite(FRITH, FRITH_HEAD)],
  }),

  // ---- life line ----
  rule({
    id: 'cx-life-end-wrist-settled',
    tradition: WC,
    // "No line or branch leaving it ... keeps to the form of a semi-circle round the Mount of Venus".
    conditions: [when('line.life.end_zone', 'eq', 'wrist'), when('line.life.marks.fork', 'eq', 0)],
    category: 'temperament',
    meaning: 'A settled pattern — a life that tends to keep to familiar ground rather than constant change and travel.',
    meaningHi: 'ठहराव वाला ढर्रा — ऐसा जीवन जो लगातार बदलाव और यात्राओं के बजाय जानी-पहचानी ज़मीन पर टिका रहता है।',
    caveat: 'The book says such a life will be free from change and travel. Read it as a leaning, not a forecast.',
    caveatHi: 'किताब कहती है कि ऐसा जीवन बदलाव और यात्रा से मुक्त रहेगा। इसे एक झुकाव समझें, भविष्यवाणी नहीं।',
    traits: [t('steady')],
    short: 'life line ending {line.life.end_zone} with {line.life.marks.fork} forks',
    shortHi: '{line.life.end_zone} ख़त्म होती जीवन रेखा, फ़ोर्क: {line.life.marks.fork}',
    cites: [cite(PFA, PFA_LIFE)],
  }),
  rule({
    id: 'cx-life-straight-reserved',
    tradition: WC,
    conditions: [when('line.life.curvature', 'eq', 'straight')],
    category: 'emotional_life',
    meaning: 'A reserved, self-contained manner — slower to reach out for closeness and warmth.',
    meaningHi: 'संकोची, अपने में सिमटा हुआ स्वभाव — नज़दीकी और अपनापन पाने के लिए आगे बढ़ने में धीमा।',
    caveat: 'The books tie this form to fertility and to length of life. Both claims are refused.',
    caveatHi: 'किताबें इस रूप को संतान होने और उम्र की लंबाई से जोड़ती हैं। ये दोनों दावे यहाँ नहीं माने गए।',
    traits: [t('reserved')],
    short: '{line.life.curvature} life line',
    shortHi: '{line.life.curvature} जीवन रेखा',
    cites: [cite(BENHAM, BENHAM_LIFE), cite(WILL, WILL_LIFE)],
  }),
  rule({
    id: 'cx-life-wide-warm',
    tradition: WC,
    conditions: [when('line.life.curvature', 'eq', 'curved')],
    category: 'emotional_life',
    meaning: 'Warm, generous and sympathetic — someone who draws other people in.',
    meaningHi: 'गर्मजोशी भरा, उदार और हमदर्द — ऐसा व्यक्ति जो दूसरों को अपनी ओर खींचता है।',
    caveat: 'The book also predicts early marriage, children and long life for this form. Those claims are refused.',
    caveatHi: 'किताब इस रूप के लिए जल्दी शादी, संतान और लंबी उम्र की भविष्यवाणी भी करती है। वे दावे यहाँ नहीं माने गए।',
    traits: [t('affectionate'), t('generous'), t('sociable')],
    short: '{line.life.curvature} life line',
    shortHi: '{line.life.curvature} जीवन रेखा',
    cites: [cite(BENHAM, BENHAM_LIFE)],
  }),

  // ---- fate line (described by the vision model, never traced) ----
  rule({
    id: 'cx-fate-wrist-middle',
    tradition: WC,
    conditions: [when('line.fate.start_zone', 'eq', 'wrist'), when('line.fate.end_zone', 'in', UNDER_MIDDLE)],
    category: 'work_and_direction',
    meaning: 'A strong, self-directed personality that tends to push past obstacles on its own path.',
    meaningHi: 'मज़बूत, अपनी राह ख़ुद तय करने वाला व्यक्तित्व, जो अपने रास्ते की रुकावटों को पार करता चलता है।',
    caveat: 'The book also promises success for this form. That promise is left out — it describes drive, not an outcome.',
    caveatHi: 'किताब इस रूप के लिए सफलता का वादा भी करती है। वह वादा यहाँ छोड़ दिया गया है — यह लगन के बारे में है, नतीजे के बारे में नहीं।',
    traits: [t('independent'), t('determined'), t('persistent')],
    short: 'fate line starting {line.fate.start_zone}, ending {line.fate.end_zone}',
    shortHi: '{line.fate.start_zone} से शुरू होकर {line.fate.end_zone} ख़त्म होती भाग्य रेखा',
    cites: [cite(GUIDE, GUIDE_FATE)],
  }),
  rule({
    id: 'cx-fate-broken-jain',
    tradition: IHR,
    conditions: [when('line.fate.continuity', 'eq', 'broken')],
    category: 'work_and_direction',
    meaning: 'Quick and capable, but restless — staying with one course is harder than starting one.',
    meaningHi: 'फुर्तीले और काबिल, पर बेचैन — कोई काम शुरू करना उसे टिककर निभाने से आसान लगता है।',
    caveat: 'The book speaks of a fate line cut by small lines and seen in pieces. It also praises health and looks; that is left out.',
    caveatHi:
      'किताब छोटी रेखाओं से कटी और टुकड़ों में दिखती भाग्य रेखा की बात करती है। वह सेहत और रूप की तारीफ़ भी करती है; वह हिस्सा छोड़ दिया गया है।',
    traits: [t('restless', 'watch')],
    short: '{line.fate.continuity} fate line',
    shortHi: '{line.fate.continuity} भाग्य रेखा',
    cites: [cite(JAIN, JAIN_FATE)],
  }),
];
