// COPIED from palm-ai-new--feat-m1-foundation/src/features/knowledge/traits.ts at app commit 38389f51b74d (2026-09-26).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import type { Bilingual } from '../../i18n';

/**
 * The closed trait vocabulary every rule is tagged with (`KbRule.traits`).
 *
 * At most 40 ids, on purpose: the synthesis clusters rules by trait, and a
 * vocabulary that grows with every rule would cluster nothing. A trait is a
 * tendency the classical books describe, in our own plain words. `label` is
 * the name shown on a chip; `phrase` is a short sentence fragment the Palm
 * Story composes with ("{feature phrase} → {trait phrase}").
 *
 * The role a trait carries on a rule (`strength | watch | neutral | tension`)
 * belongs to the rule, not to the trait: the same trait can be a strength on
 * one rule and something to watch on another. No trait here is a weakness.
 *
 * Hindi is plain everyday Hindi and is a draft until a person checks it.
 */

export const AREAS = ['love', 'career', 'money', 'direction', 'self'] as const;
export type AreaId = (typeof AREAS)[number];

export const AREA_LABELS: Record<AreaId, Bilingual> = {
  love: { en: 'Love and closeness', hi: 'प्यार और अपनापन' },
  career: { en: 'Work', hi: 'काम' },
  money: { en: 'Money and effort', hi: 'पैसा और मेहनत' },
  direction: { en: 'Direction in life', hi: 'जीवन की दिशा' },
  self: { en: 'Your nature', hi: 'आपका स्वभाव' },
};

export const TRAIT_IDS = [
  'affectionate',
  'loyal',
  'idealistic',
  'reserved',
  'possessive',
  'sociable',
  'even_tempered',
  'cheerful',
  'generous',
  'sensitive',
  'practical',
  'imaginative',
  'thorough',
  'focused',
  'cautious',
  'decisive',
  'independent',
  'bold',
  'impulsive',
  'self_controlled',
  'determined',
  'quick_tempered',
  'logical',
  'versatile',
  'serious',
  'ambitious',
  'leader',
  'persistent',
  'influenced_by_others',
  'public_facing',
  'business_minded',
  'responsible',
  'restless',
  'changeable',
  'steady',
  'artistic',
  'easygoing_with_money',
  'energetic',
  'low_key',
  'quick_witted',
] as const;
export type TraitId = (typeof TRAIT_IDS)[number];

export interface TraitDef {
  label: Bilingual;
  /** A plain sentence fragment: "you tend to ..." / "आप ... हैं". */
  phrase: Bilingual;
  /** The life areas this trait speaks to (1–2). */
  areas: AreaId[];
}

function trait(en: string, hi: string, phraseEn: string, phraseHi: string, areas: AreaId[]): TraitDef {
  return { label: { en, hi }, phrase: { en: phraseEn, hi: phraseHi }, areas };
}

export const TRAITS: Record<TraitId, TraitDef> = {
  affectionate: trait('Affectionate', 'स्नेही', 'you feel affection warmly and fully', 'आप दिल से और भरपूर स्नेह करते हैं', ['love']),
  loyal: trait('Loyal', 'वफ़ादार', 'once attached, you tend to stay attached', 'एक बार जुड़ जाएँ तो आप जुड़े ही रहते हैं', ['love']),
  idealistic: trait('Idealistic in love', 'प्यार में आदर्शवादी', 'you tend to look up to the person you love', 'आप जिसे चाहते हैं, उसे ऊँचा दर्जा देते हैं', ['love']),
  reserved: trait('Reserved', 'संकोची', 'you keep your feelings private', 'आप अपनी भावनाएँ अपने तक रखते हैं', ['love', 'self']),
  possessive: trait('Possessive streak', 'अधिकार जताने का झुकाव', 'affection can tip into holding on too tightly', 'स्नेह कभी-कभी ज़्यादा पकड़ में बदल सकता है', ['love']),
  sociable: trait('Sociable', 'मिलनसार', 'you draw people in and enjoy company', 'आप लोगों को अपनी ओर खींचते हैं और साथ पसंद करते हैं', ['love', 'self']),
  even_tempered: trait('Even-tempered', 'संतुलित मिज़ाज', 'your temper stays level', 'आपका मिज़ाज संतुलित रहता है', ['self', 'love']),
  cheerful: trait('Cheerful', 'खुशमिज़ाज', 'you take life lightly and warmly', 'आप ज़िंदगी को हल्के और खुशदिल ढंग से लेते हैं', ['self']),
  generous: trait('Generous', 'उदार', 'you give freely to the people around you', 'आप अपने आसपास के लोगों को खुले दिल से देते हैं', ['love', 'self']),
  sensitive: trait('Sensitive', 'संवेदनशील', 'you feel people and surroundings keenly', 'आप लोगों और माहौल को गहराई से महसूस करते हैं', ['self', 'love']),
  practical: trait('Practical', 'व्यावहारिक', 'you prefer the concrete to the speculative', 'आप कोरी कल्पना से ज़्यादा ठोस बातें पसंद करते हैं', ['self', 'career']),
  imaginative: trait('Imaginative', 'कल्पनाशील', 'your mind reaches for possibility first', 'आपका मन पहले संभावनाओं की ओर जाता है', ['self', 'career']),
  thorough: trait('Thorough', 'गहराई से सोचने वाले', 'you follow an idea a long way before acting', 'आप कदम उठाने से पहले किसी बात को दूर तक सोचते हैं', ['self', 'career']),
  focused: trait('Focused', 'एकाग्र', 'you go deep on one thing rather than wide', 'आप फैलाव से ज़्यादा किसी एक बात में गहराई तक जाते हैं', ['self', 'career']),
  cautious: trait('Cautious', 'सावधान', 'you tend to think before you act', 'आप सोच-समझकर कदम उठाते हैं', ['self', 'money']),
  decisive: trait('Decisive', 'फ़ैसले में तेज़', 'you judge quickly and act on it', 'आप जल्दी परखते हैं और उसी पर चलते हैं', ['self', 'career']),
  independent: trait('Independent', 'स्वतंत्र', 'you prefer to set your own course', 'आप अपनी राह ख़ुद तय करना पसंद करते हैं', ['direction', 'career']),
  bold: trait('Bold', 'साहसी', 'you stand up for yourself readily', 'आप अपने लिए बेझिझक खड़े होते हैं', ['self', 'direction']),
  impulsive: trait('Impulsive streak', 'जल्दबाज़ी का झुकाव', 'confidence can run ahead of careful thought', 'आत्मविश्वास कभी-कभी सोच-विचार से आगे निकल जाता है', ['self', 'money']),
  self_controlled: trait('Self-controlled', 'आत्म-संयमी', 'you stay calm and steady under pressure', 'आप दबाव में भी शांत और स्थिर रहते हैं', ['self']),
  determined: trait('Determined', 'दृढ़', 'you carry a decision through', 'आप लिया हुआ फ़ैसला पूरा करके रहते हैं', ['direction', 'career']),
  quick_tempered: trait('Quick temper', 'जल्दी ग़ुस्सा', 'temper can flare, and it passes', 'ग़ुस्सा जल्दी आता है, और उतर भी जाता है', ['self']),
  logical: trait('Logical', 'तर्कशील', 'you reason problems out step by step', 'आप समस्याओं को तर्क से, एक-एक कदम सुलझाते हैं', ['self', 'career']),
  versatile: trait('Versatile', 'बहुमुखी', 'you hold more than one way of thinking at once', 'आप एक साथ सोचने के एक से ज़्यादा ढंग रखते हैं', ['career', 'self']),
  serious: trait('Serious-minded', 'गंभीर', 'you take a considered, earnest approach', 'आप सोच-विचार भरा, गंभीर रवैया रखते हैं', ['self', 'career']),
  ambitious: trait('Ambitious', 'महत्वाकांक्षी', 'you aim high and want to get there', 'आप ऊँचा लक्ष्य रखते हैं और वहाँ पहुँचना चाहते हैं', ['career', 'direction']),
  leader: trait('Natural leader', 'स्वाभाविक अगुवा', 'you are drawn to organising and taking charge', 'आप व्यवस्था बनाने और कमान सँभालने की ओर खिंचते हैं', ['career']),
  persistent: trait('Persistent', 'लगनशील', 'you push on through early difficulty', 'आप शुरुआती मुश्किलों के बीच भी आगे बढ़ते रहते हैं', ['career', 'money']),
  influenced_by_others: trait('Shaped by others', 'दूसरों से जुड़ा रास्ता', 'other people play a large part in your path', 'आपके रास्ते में दूसरे लोग बड़ी भूमिका निभाते हैं', ['direction', 'career']),
  public_facing: trait('Public-facing', 'लोगों के सामने', 'you are drawn to visible work where response matters', 'आप ऐसे काम की ओर खिंचते हैं जो सबके सामने हो और जहाँ प्रतिक्रिया मायने रखे', ['career']),
  business_minded: trait('Business-minded', 'कारोबारी सोच', 'you are drawn to trade, science and what things are worth', 'आप व्यापार, विज्ञान और चीज़ों की क़ीमत की ओर खिंचते हैं', ['money', 'career']),
  responsible: trait('Responsible', 'ज़िम्मेदार', 'you take on duty readily', 'आप ज़िम्मेदारी सहजता से उठा लेते हैं', ['career', 'direction']),
  restless: trait('Restless', 'बेचैन', 'you want movement, change and new places', 'आप बदलाव, चलते रहना और नई जगहें चाहते हैं', ['direction']),
  changeable: trait('Changeable', 'बदलते रहने वाले', 'interests and plans shift more than they settle', 'रुचियाँ और योजनाएँ टिकने से ज़्यादा बदलती रहती हैं', ['love', 'direction']),
  steady: trait('Steady', 'स्थिर', 'you keep to a settled course', 'आप एक तय राह पर टिके रहते हैं', ['direction', 'love']),
  artistic: trait('Artistic', 'कला-प्रेमी', 'beauty, art and atmosphere matter to you', 'सुंदरता, कला और माहौल आपके लिए मायने रखते हैं', ['career', 'self']),
  easygoing_with_money: trait('Easy-going with money', 'पैसों में बेफ़िक्र', 'you are relaxed about small everyday sums', 'रोज़मर्रा के छोटे ख़र्चों को लेकर आप बेफ़िक्र रहते हैं', ['money']),
  energetic: trait('Energetic', 'ऊर्जावान', 'your energy reaches out into people and activity', 'आपकी ऊर्जा लोगों और काम-काज की ओर बाहर फैलती है', ['self']),
  low_key: trait('Low-key energy', 'शांत ऊर्जा', 'your energy is quiet and held close', 'आपकी ऊर्जा शांत है और भीतर सिमटी रहती है', ['self']),
  quick_witted: trait('Quick-witted', 'हाज़िरजवाब', 'you are quick with words and reading a room', 'आप बात में तेज़ हैं और माहौल जल्दी भाँप लेते हैं', ['self', 'career']),
};

/** Trait → areas, derived so the two can never drift apart. */
export const TRAIT_AREAS: Record<TraitId, AreaId[]> = Object.fromEntries(
  TRAIT_IDS.map((id) => [id, TRAITS[id].areas]),
) as Record<TraitId, AreaId[]>;

export type TraitRelationKind = 'exclusive' | 'tension' | 'compatible';

export interface TraitRelation {
  a: TraitId;
  b: TraitId;
  kind: TraitRelationKind;
}

function rel(a: TraitId, b: TraitId, kind: TraitRelationKind): TraitRelation {
  return { a, b, kind };
}

/**
 * How two traits sit together when both are read from one palm.
 *   exclusive  — cannot both be shown; the weaker evidence is suppressed.
 *   tension    — both stay, and the pair is named as a tension.
 *   compatible — reinforce each other in a theme.
 * Pairs not listed are simply independent.
 */
export const TRAIT_RELATIONS: TraitRelation[] = [
  rel('changeable', 'steady', 'exclusive'),
  rel('restless', 'steady', 'exclusive'),
  rel('changeable', 'loyal', 'exclusive'),
  rel('impulsive', 'cautious', 'exclusive'),
  rel('quick_tempered', 'even_tempered', 'exclusive'),
  rel('energetic', 'low_key', 'exclusive'),

  rel('reserved', 'affectionate', 'tension'),
  rel('reserved', 'sociable', 'tension'),
  rel('independent', 'influenced_by_others', 'tension'),
  rel('cheerful', 'serious', 'tension'),
  rel('practical', 'imaginative', 'tension'),
  rel('decisive', 'cautious', 'tension'),
  rel('bold', 'sensitive', 'tension'),
  rel('restless', 'responsible', 'tension'),

  rel('cautious', 'persistent', 'compatible'),
  rel('affectionate', 'loyal', 'compatible'),
  rel('affectionate', 'generous', 'compatible'),
  rel('sociable', 'cheerful', 'compatible'),
  rel('sociable', 'energetic', 'compatible'),
  rel('practical', 'logical', 'compatible'),
  rel('practical', 'focused', 'compatible'),
  rel('thorough', 'focused', 'compatible'),
  rel('imaginative', 'artistic', 'compatible'),
  rel('ambitious', 'leader', 'compatible'),
  rel('ambitious', 'determined', 'compatible'),
  rel('ambitious', 'public_facing', 'compatible'),
  rel('bold', 'determined', 'compatible'),
  rel('leader', 'self_controlled', 'compatible'),
  rel('serious', 'cautious', 'compatible'),
  rel('steady', 'loyal', 'compatible'),
  rel('steady', 'responsible', 'compatible'),
  rel('restless', 'changeable', 'compatible'),
  rel('business_minded', 'practical', 'compatible'),
  rel('quick_witted', 'versatile', 'compatible'),
  rel('independent', 'decisive', 'compatible'),
];

export function isTraitId(value: string): value is TraitId {
  return (TRAIT_IDS as readonly string[]).includes(value);
}
