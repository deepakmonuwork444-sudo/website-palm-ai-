// COPIED from palm-ai-new--feat-m1-foundation/src/features/knowledge/synthesis/constants.ts at app commit 38389f51b74d (2026-09-26).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import type { Bilingual } from '../../../i18n';
import { TRAITS, TRAIT_IDS, type AreaId, type TraitId } from '../traits';

/**
 * Everything the synthesis's behaviour hangs on, in one place (DEC-015).
 *
 * `SYNTHESIS_VERSION` is frozen onto every reading. A test hashes these
 * constants together with `TRAIT_RELATIONS` and `TRAIT_AREAS` into
 * `tests/fixtures/synthesis-constants.hash`: change any of them and the test
 * fails until the version is bumped and the fixture regenerated, so a saved
 * reading can always say which rules of synthesis produced it.
 */

export const SYNTHESIS_VERSION = '9';

/** Evidence quality gate (synthesis/gate.ts). */
export const GATE = {
  /** A match is firm only when every trigger is firm AND its effective confidence reaches this. */
  firmMinEffective: 0.5,
  /** One firm `strong` match opens its area alone from this effective confidence. */
  strongOpenMinEffective: 0.6,
  /** A trigger below this is "uncertain" (report-v2 visibility): the match is dropped. */
  uncertainDrop: 0.3,
  /**
   * Weak-line protection (DEC-024): every trigger on one of these lines counts
   * as borderline (support only, never opens an area or leads a section) when
   * the line was read as faint or was traced below "clear" visibility. The fate
   * line is the least reliable trace; the owner's phone test showed a faint
   * fate line swapping a whole section between two photos of one hand.
   */
  weakLines: ['fate'],
  weakLineMinConfidence: 0.75,
} as const;

/**
 * Cross-scan hysteresis (synthesis/cluster.ts): what an area that was open in
 * the person's previous reading of the same hand still needs to STAY open.
 * Opening is never relaxed; with less than this the area closes as usual.
 */
export const HYSTERESIS = {
  /** Firm matches the area must still have. */
  minFirmToHold: 1,
  /**
   * Further matches on trigger paths independent of that firm match (and of
   * each other), every trigger banded firm or borderline, never `unknown`.
   */
  minSupportToHold: 1,
  /**
   * A theme shown in the previous reading keeps its slot while its area is
   * still open. A new area takes a held slot only when its score is at least
   * this multiple of that held theme's score: a material change, not a
   * re-ordering of near-equal scores under the three-theme cap.
   */
  themeTakeoverRatio: 1.5,
} as const;

/** Scoring and ranking (synthesis/rank.ts, cluster.ts). */
export const RANK = {
  /** Borderline evidence counts this much, and only inside an area already open. */
  borderlineWeight: 0.25,
  strongWeight: 1.5,
  normalWeight: 1.0,
  /** Specificity multiplier: 1 + specStep x (conditions - 1), capped. */
  specCap: 2,
  specStep: 0.25,
  /** An open area becomes a theme only from this score. */
  themeMin: 1.0,
  maxThemes: 3,
} as const;

/** Tie order for areas with the same score. */
export const AREA_PRIORITY: readonly AreaId[] = ['love', 'career', 'money', 'direction', 'self'];

/** The trait phrase the Palm Story composes with ("{feature} → {phrase}"). */
export const TRAIT_PHRASES: Record<TraitId, Bilingual> = Object.fromEntries(
  TRAIT_IDS.map((id) => [id, TRAITS[id].phrase]),
) as Record<TraitId, Bilingual>;

/** The key of a trait pair, whichever order the traits come in. */
export function pairKey(a: TraitId, b: TraitId): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function headline(a: TraitId, b: TraitId, en: string, hi: string): [string, Bilingual] {
  return [pairKey(a, b), { en, hi }];
}

/**
 * Curated Palm Story headlines for the two strongest traits, keyed by
 * `pairKey`. A pair not listed falls back to "{label A} · {label B}"
 * (story.ts), so this table only ever improves wording, never decides what is
 * said. Hindi is plain everyday Hindi, a draft until a person checks it.
 */
export const STORY_HEADLINES: Readonly<Record<string, Bilingual>> = Object.fromEntries([
  headline('affectionate', 'loyal', 'A warm heart and steady bonds', 'गर्म दिल और पक्के रिश्ते'),
  headline('affectionate', 'generous', 'Open-hearted and giving', 'खुले दिल वाले और देने वाले'),
  headline('affectionate', 'idealistic', 'Love held to high ideals', 'ऊँचे आदर्शों वाला प्यार'),
  headline('affectionate', 'sensitive', 'Feels deeply, loves warmly', 'गहराई से महसूस, दिल से प्यार'),
  headline('affectionate', 'sociable', 'Warmth that draws people in', 'ऐसी गर्मजोशी जो लोगों को अपनी ओर खींचती है'),
  headline('affectionate', 'practical', 'A warm heart with a steady head', 'गर्म दिल, ठंडा दिमाग़'),
  headline('affectionate', 'reserved', 'Deep feeling, quietly kept', 'गहरी भावना, चुपचाप सँभाली हुई'),
  headline('affectionate', 'thorough', 'A warm heart and a thoughtful mind', 'गर्म दिल और सोचने वाला दिमाग़'),
  headline('affectionate', 'determined', 'Warm-hearted and resolute', 'दिल के गर्म और इरादे के पक्के'),
  headline('loyal', 'steady', 'Steady on every front', 'हर मोर्चे पर स्थिर'),
  headline('loyal', 'idealistic', 'Devoted, and true to your ideals', 'समर्पित, और अपने आदर्शों पर टिके हुए'),
  headline('loyal', 'practical', 'Loyal, with both feet on the ground', 'वफ़ादार, और ज़मीन से जुड़े हुए'),
  headline('idealistic', 'imaginative', "A dreamer's heart and mind", 'सपने देखने वाला दिल और दिमाग़'),
  headline('reserved', 'practical', 'Private, and practical', 'निजी, और व्यावहारिक'),
  headline('reserved', 'cautious', 'Quiet, careful and self-contained', 'शांत, सावधान और अपने में पूरे'),
  headline('reserved', 'thorough', 'Quiet depth', 'शांत गहराई'),
  headline('reserved', 'focused', 'Quiet and single-minded', 'शांत और एक ही लक्ष्य पर टिके'),
  headline('reserved', 'determined', 'Quiet, and hard to move', 'शांत, और अपनी जगह से न हिलने वाले'),
  headline('sociable', 'cheerful', 'Easy company and a light heart', 'मिलनसार और हल्का दिल'),
  headline('sociable', 'energetic', 'Outgoing energy', 'बाहर की ओर बहती ऊर्जा'),
  headline('sociable', 'practical', 'Good with people, good with facts', 'लोगों में भी सहज, बातों में भी पक्के'),
  headline('energetic', 'determined', 'Energy with a will behind it', 'इरादे के साथ चलती ऊर्जा'),
  headline('energetic', 'practical', 'Energy put to practical use', 'काम में लगती ऊर्जा'),
  headline('practical', 'logical', 'Clear, grounded thinking', 'साफ़ और ज़मीन से जुड़ी सोच'),
  headline('practical', 'focused', 'Practical and single-minded', 'व्यावहारिक और एकाग्र'),
  headline('practical', 'determined', 'Practical, and follows through', 'व्यावहारिक, और पूरा करके रहने वाले'),
  headline('practical', 'imaginative', 'Ideas with their feet on the ground', 'ज़मीन से जुड़ी कल्पना'),
  headline('practical', 'cautious', 'Careful and down to earth', 'सावधान और ज़मीन से जुड़े'),
  headline('practical', 'business_minded', 'A practical head for trade', 'कारोबार के लिए व्यावहारिक सोच'),
  headline('practical', 'even_tempered', 'Level-headed and practical', 'संतुलित और व्यावहारिक'),
  headline('thorough', 'focused', 'Depth over breadth', 'फैलाव से ज़्यादा गहराई'),
  headline('thorough', 'determined', 'Thinks it through, then sees it through', 'पहले पूरा सोचते हैं, फिर पूरा करते हैं'),
  headline('imaginative', 'artistic', 'Imagination that seeks beauty', 'सुंदरता खोजती कल्पना'),
  headline('imaginative', 'sensitive', 'Imaginative and finely tuned', 'कल्पनाशील और संवेदनशील'),
  headline('cautious', 'persistent', 'Careful, and keeps going', 'सावधान, और डटे रहने वाले'),
  headline('cautious', 'sensitive', 'Careful and perceptive', 'सावधान और गहरी समझ वाले'),
  headline('cautious', 'serious', 'Serious and careful', 'गंभीर और सावधान'),
  headline('cautious', 'determined', 'Careful, then unstoppable', 'पहले सावधान, फिर अडिग'),
  headline('decisive', 'independent', 'Your own course, chosen quickly', 'अपनी राह, जल्दी चुनी हुई'),
  headline('bold', 'independent', 'Bold and self-directed', 'साहसी और अपनी राह पर चलने वाले'),
  headline('bold', 'determined', 'Bold, and carries it through', 'साहसी, और पूरा करके रहने वाले'),
  headline('bold', 'decisive', 'Quick and fearless in judgement', 'फ़ैसले में तेज़ और बेझिझक'),
  headline('ambitious', 'leader', 'Aims high and takes charge', 'ऊँचा लक्ष्य, कमान अपने हाथ'),
  headline('ambitious', 'determined', 'Ambition with staying power', 'टिकाऊ महत्वाकांक्षा'),
  headline('ambitious', 'public_facing', 'Made for a visible stage', 'सबके सामने चमकने के लिए बने'),
  headline('leader', 'self_controlled', 'Calm authority', 'शांत दबदबा'),
  headline('determined', 'persistent', 'Keeps on until it is done', 'जब तक पूरा न हो, लगे रहना'),
  headline('determined', 'steady', 'A steady will', 'अडिग इरादा'),
  headline('determined', 'self_controlled', 'Calm resolve', 'शांत दृढ़ता'),
  headline('steady', 'responsible', 'Reliable through and through', 'पूरी तरह भरोसेमंद'),
  headline('restless', 'changeable', 'Always moving, always new', 'हमेशा चलते, हमेशा कुछ नया'),
  headline('quick_witted', 'versatile', 'A quick mind with many angles', 'तेज़ दिमाग़, कई नज़रिए'),
  headline('even_tempered', 'quick_witted', 'Sharp wit, even temper', 'पैनी सूझ, संतुलित मिज़ाज'),
  headline('cheerful', 'generous', 'Light-hearted and giving', 'खुशदिल और उदार'),
]);
