// COPIED from palm-ai-new--feat-m1-foundation/src/features/knowledge/trait-content.ts at app commit 38389f51b74d (2026-09-26).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import type { Bilingual } from '../../i18n';
import type { TraitId } from './traits';

/**
 * Reading copy for every trait, compatible pair, tension pair and overall pattern.
 *
 * The engine picks these texts deterministically from the traits the evidence
 * supports. Every text describes a tendency in everyday life, in hedged words,
 * for reflection only. No prediction, no timing, no outcomes. Context fields
 * exist only for the trait's own areas (see `TRAITS[id].areas`).
 *
 * Hindi is plain everyday Hindi and is a draft until a person checks it.
 */

export const TRAIT_FAMILIES = ['steady', 'careful', 'feeling', 'growth'] as const;
export type TraitFamily = (typeof TRAIT_FAMILIES)[number];

export interface TraitContent {
  family: TraitFamily;
  /** One sentence, starts with "You": the plain meaning. */
  coreMeaning: Bilingual;
  /** One or two sentences: how it tends to show up in normal daily life. */
  realLife: Bilingual;
  /** One sentence: why this helps you. */
  strength: Bilingual;
  /** One sentence, gentle: how this same tendency can work against you. Never frightening. */
  watch: Bilingual;
  /** ONLY if the trait's areas include 'love': how it shows in relationships. */
  relationship?: Bilingual;
  /** ONLY if areas include 'love': what you tend to seek or need from a partner/closeness. */
  relationshipNeed?: Bilingual;
  /** ONLY if areas include 'career': work style. */
  work?: Bilingual;
  /** ONLY if areas include 'career': the kind of work setting that tends to suit you. */
  workEnvironment?: Bilingual;
  /** ONLY if areas include 'money': how you tend to handle money. */
  money?: Bilingual;
  /** ONLY if areas include 'direction': the growth pattern this suggests. */
  growth?: Bilingual;
}

export const TRAIT_CONTENT: Record<TraitId, TraitContent> = {
  affectionate: {
    family: 'feeling',
    coreMeaning: { en: 'You tend to love openly and let people feel how much they matter to you.', hi: 'आप खुलकर प्यार करते हैं और सामने वाले को महसूस कराते हैं कि वह आपके लिए कितना ख़ास है।' },
    realLife: {
      en: 'You often remember small things about people and show care through gestures, messages and time spent together.',
      hi: 'आप अक्सर लोगों की छोटी-छोटी बातें याद रखते हैं और छोटे कामों, संदेशों और साथ बिताए समय से परवाह जताते हैं।',
    },
    strength: { en: 'Your warmth can make people feel safe and wanted around you.', hi: 'आपकी गर्मजोशी लोगों को आपके पास सुरक्षित और अपनापन महसूस करा सकती है।' },
    watch: { en: 'When care is not returned in the same way, you may feel hurt more deeply than you show.', hi: 'जब परवाह उसी तरह वापस नहीं मिलती, तो आपको दिखाने से ज़्यादा ठेस लग सकती है।' },
    relationship: { en: 'In closeness you usually give fully and like the bond to feel warm and expressed.', hi: 'रिश्ते में आप आमतौर पर पूरा मन लगाते हैं और चाहते हैं कि अपनापन खुलकर जताया जाए।' },
    relationshipNeed: { en: 'You tend to need a partner who shows affection back, not just feels it quietly.', hi: 'आपको ऐसा साथी चाहिए होता है जो प्यार सिर्फ़ मन में न रखे, बल्कि जताए भी।' },
  },
  loyal: {
    family: 'steady',
    coreMeaning: { en: 'You tend to stay by people once they have earned a place in your heart.', hi: 'आप अक्सर उन लोगों के साथ टिके रहते हैं जो आपके दिल में जगह बना लेते हैं।' },
    realLife: { en: 'You often keep old friendships going and stand by people even when things get difficult.', hi: 'आप अक्सर पुरानी दोस्तियाँ निभाते हैं और मुश्किल समय में भी लोगों का साथ नहीं छोड़ते।' },
    strength: { en: 'People can rely on you, and that trust tends to deepen your bonds over time.', hi: 'लोग आप पर भरोसा कर सकते हैं, और यही भरोसा समय के साथ रिश्तों को गहरा करता है।' },
    watch: { en: 'You may stay with a situation longer than it serves you, out of a sense of duty.', hi: 'फ़र्ज़ के एहसास में आप किसी स्थिति में उससे ज़्यादा देर टिके रह सकते हैं जितना आपके लिए ठीक हो।' },
    relationship: { en: 'In love you usually commit quietly and deeply, and you take promises seriously.', hi: 'प्यार में आप आमतौर पर चुपचाप और गहराई से जुड़ते हैं, और वादों को गंभीरता से लेते हैं।' },
    relationshipNeed: {
      en: 'You often need the same faithfulness in return, and broken trust can take you a long time to forgive.',
      hi: 'आपको बदले में वैसी ही वफ़ादारी चाहिए होती है, और टूटा भरोसा माफ़ करने में आपको वक़्त लग सकता है।',
    },
  },
  idealistic: {
    family: 'feeling',
    coreMeaning: { en: 'You tend to see the best in the person you love, sometimes more than they see in themselves.', hi: 'आप जिसे चाहते हैं उसमें सबसे अच्छा देखते हैं, कभी-कभी उससे भी ज़्यादा जितना वह ख़ुद देखता है।' },
    realLife: {
      en: 'You may hold a clear picture of what real love should feel like and quietly measure moments against it.',
      hi: 'आपके मन में सच्चे प्यार की एक साफ़ तस्वीर हो सकती है, और आप पलों को चुपचाप उसी से मिलाते हैं।',
    },
    strength: { en: 'Your belief in people can bring out their better side.', hi: 'लोगों पर आपका विश्वास उनका बेहतर रूप सामने ला सकता है।' },
    watch: { en: 'When someone falls short of that picture, disappointment may feel sharper than the actual mistake.', hi: 'जब कोई उस तस्वीर पर खरा नहीं उतरता, तो निराशा असल ग़लती से ज़्यादा चुभ सकती है।' },
    relationship: {
      en: 'In a relationship you often bring devotion, respect and a sense that the bond is something special.',
      hi: 'रिश्ते में आप अक्सर समर्पण, इज़्ज़त और यह एहसास लाते हैं कि यह रिश्ता कुछ ख़ास है।',
    },
    relationshipNeed: { en: 'You tend to need a partner you can admire, and who admires you in return.', hi: 'आपको ऐसा साथी चाहिए होता है जिसकी आप क़द्र कर सकें, और जो आपकी भी क़द्र करे।' },
  },
  reserved: {
    family: 'careful',
    coreMeaning: { en: 'You tend to keep your deeper feelings private until you feel truly safe.', hi: 'आप अपनी गहरी भावनाएँ तब तक अपने तक रखते हैं जब तक पूरी तरह सुरक्षित महसूस न करें।' },
    realLife: {
      en: 'You may listen more than you share, and people often learn about your feelings through actions rather than words.',
      hi: 'आप बोलने से ज़्यादा सुनते हैं, और लोग अक्सर आपकी भावनाएँ शब्दों से नहीं, आपके व्यवहार से समझते हैं।',
    },
    strength: { en: 'Your privacy gives you calm, and people tend to trust you with their own secrets.', hi: 'आपका यह संकोच आपको शांति देता है, और लोग अपनी बातें आप पर भरोसे से कहते हैं।' },
    watch: { en: 'Keeping things inside for too long can make others misread you as distant.', hi: 'बातें बहुत देर तक मन में रखने से लोग आपको दूर या रूखा समझ सकते हैं।' },
    relationship: { en: 'In closeness you usually open up slowly, one layer at a time.', hi: 'नज़दीकी में आप आमतौर पर धीरे-धीरे, परत-दर-परत खुलते हैं।' },
    relationshipNeed: { en: 'You often need patience and gentle space from a partner, not pressure to talk.', hi: 'आपको साथी से धैर्य और थोड़ी जगह चाहिए होती है, बात करने का दबाव नहीं।' },
  },
  possessive: {
    family: 'feeling',
    coreMeaning: { en: 'You tend to hold the people you love close and care strongly about keeping them.', hi: 'आप जिन्हें चाहते हैं उन्हें पास रखना चाहते हैं और उन्हें खोने की बहुत परवाह करते हैं।' },
    realLife: { en: 'You may notice quickly when someone drifts, and you often want to know where you stand.', hi: 'कोई थोड़ा भी दूर जाए तो आप जल्दी भाँप लेते हैं, और अक्सर जानना चाहते हैं कि आप कहाँ खड़े हैं।' },
    strength: {
      en: 'Your attachment shows how much you value a bond, and you rarely take people for granted.',
      hi: 'आपका यह लगाव दिखाता है कि आप रिश्ते की कितनी क़द्र करते हैं, और आप लोगों को हल्के में नहीं लेते।',
    },
    watch: { en: 'When you feel unsure, care can turn into holding on a little too tightly.', hi: 'जब मन असुरक्षित हो, तो परवाह थोड़ी ज़्यादा पकड़ में बदल सकती है।' },
    relationship: { en: 'In love you usually give yourself fully and want the bond to feel clearly yours.', hi: 'प्यार में आप आमतौर पर पूरी तरह समर्पित होते हैं और चाहते हैं कि रिश्ता साफ़ तौर पर आपका हो।' },
    relationshipNeed: {
      en: 'You tend to need steady reassurance, and calm honesty often settles you more than promises do.',
      hi: 'आपको लगातार भरोसा चाहिए होता है, और शांत ईमानदारी आपको वादों से ज़्यादा सुकून देती है।',
    },
  },
  sociable: {
    family: 'feeling',
    coreMeaning: { en: 'You tend to come alive around people and make others feel included.', hi: 'आप लोगों के बीच खिल उठते हैं और दूसरों को अपनापन महसूस कराते हैं।' },
    realLife: { en: 'You often start conversations easily, remember names, and bring people together for plans.', hi: 'आप अक्सर आसानी से बातचीत शुरू करते हैं, नाम याद रखते हैं और लोगों को साथ जोड़ते हैं।' },
    strength: { en: 'Your ease with people can open doors and build a wide, warm circle.', hi: 'लोगों से आपकी सहजता नए रास्ते खोल सकती है और एक बड़ा, अपनापन भरा दायरा बनाती है।' },
    watch: { en: 'Making time for everyone can leave little quiet time for yourself.', hi: 'सबके लिए समय निकालते-निकालते अपने लिए शांत समय कम पड़ सकता है।' },
    relationship: { en: 'In love you usually enjoy sharing your world, friends and outings with a partner.', hi: 'प्यार में आप आमतौर पर अपनी दुनिया, दोस्त और घूमना-फिरना साथी के साथ बाँटना पसंद करते हैं।' },
    relationshipNeed: {
      en: 'You often need a partner who enjoys company too, or at least does not mind your social side.',
      hi: 'आपको ऐसा साथी चाहिए होता है जिसे भी लोगों का साथ अच्छा लगे, या कम से कम आपके मिलनसार स्वभाव से परेशानी न हो।',
    },
  },
  even_tempered: {
    family: 'steady',
    coreMeaning: { en: 'You tend to stay calm and fair even when others around you get heated.', hi: 'आप अक्सर शांत और निष्पक्ष रहते हैं, तब भी जब आसपास के लोग भड़क जाएँ।' },
    realLife: {
      en: 'In arguments you usually lower the temperature, and people often come to you to settle things.',
      hi: 'बहस में आप अक्सर माहौल ठंडा करते हैं, और लोग मामला सुलझाने के लिए आपके पास आते हैं।',
    },
    strength: { en: 'Your calm can make you someone others feel safe disagreeing with.', hi: 'आपकी शांति की वजह से लोग आपसे बेझिझक असहमति जता पाते हैं।' },
    watch: { en: 'Staying level can sometimes mean your own frustration goes unspoken for too long.', hi: 'हमेशा संतुलित रहने में कभी-कभी आपकी अपनी नाराज़गी बहुत देर तक अनकही रह जाती है।' },
    relationship: { en: 'In closeness you usually bring stability, and small fights rarely grow big around you.', hi: 'रिश्ते में आप आमतौर पर ठहराव लाते हैं, और छोटी तकरारें आपके साथ बड़ी नहीं होतीं।' },
    relationshipNeed: { en: 'You tend to need a peaceful bond where problems are talked through, not shouted through.', hi: 'आपको ऐसा शांत रिश्ता चाहिए होता है जहाँ बातें चिल्लाकर नहीं, बैठकर सुलझें।' },
  },
  cheerful: {
    family: 'feeling',
    coreMeaning: { en: 'You tend to look for the lighter side and carry a warmth that lifts a room.', hi: 'आप अक्सर बातों का हल्का पहलू देखते हैं, और आपकी गर्मजोशी माहौल को खुशनुमा बना देती है।' },
    realLife: { en: 'You may joke through a tough day and help others smile when they feel low.', hi: 'मुश्किल दिन में भी आप मज़ाक कर लेते हैं और उदास लोगों को मुस्कुराने में मदद करते हैं।' },
    strength: { en: 'Your good mood tends to bounce back quickly, which helps you recover from setbacks.', hi: 'आपका अच्छा मूड जल्दी लौट आता है, जिससे आप झटकों से जल्दी उबर पाते हैं।' },
    watch: { en: 'Keeping things light can sometimes cover feelings that need a serious moment.', hi: 'हर बात हल्की रखने में कभी-कभी वे भावनाएँ दब सकती हैं जिन्हें गंभीरता से सुनना ज़रूरी है।' },
  },
  generous: {
    family: 'feeling',
    coreMeaning: { en: 'You tend to give your time, help and attention freely without keeping score.', hi: 'आप अपना समय, मदद और ध्यान खुले दिल से देते हैं, बिना हिसाब रखे।' },
    realLife: {
      en: 'You may be the first to offer help, share food, or make space for someone who needs it.',
      hi: 'आप अक्सर सबसे पहले मदद के लिए आगे आते हैं, खाना बाँटते हैं या किसी ज़रूरतमंद के लिए जगह बनाते हैं।',
    },
    strength: { en: 'Your giving nature tends to create goodwill that comes back in quiet ways.', hi: 'आपका देने वाला स्वभाव ऐसी सद्भावना बनाता है जो चुपचाप लौटकर आती है।' },
    watch: { en: 'You may give so readily that your own needs slip to the end of the list.', hi: 'आप इतनी आसानी से देते हैं कि आपकी अपनी ज़रूरतें सबसे पीछे छूट सकती हैं।' },
    relationship: {
      en: 'In love you usually show care by doing things, planning surprises and making your partner comfortable.',
      hi: 'प्यार में आप आमतौर पर काम करके, सरप्राइज़ प्लान करके और साथी को आराम देकर परवाह जताते हैं।',
    },
    relationshipNeed: { en: 'You often need to feel appreciated, so that giving feels shared rather than one-sided.', hi: 'आपको क़द्र महसूस होनी चाहिए, ताकि देना एकतरफ़ा नहीं, साझा लगे।' },
  },
  sensitive: {
    family: 'feeling',
    coreMeaning: { en: 'You tend to pick up on moods and unspoken feelings before others notice them.', hi: 'आप मूड और अनकही भावनाओं को दूसरों से पहले भाँप लेते हैं।' },
    realLife: {
      en: 'A harsh word or a tense room may stay with you, and you often sense when someone is quietly upset.',
      hi: 'कोई कड़वी बात या तनाव भरा माहौल आपके मन में देर तक रह सकता है, और आप जान लेते हैं जब कोई चुपचाप परेशान हो।',
    },
    strength: { en: 'Your sensitivity makes you kind, perceptive and good at understanding people.', hi: 'आपकी संवेदनशीलता आपको दयालु, समझदार और लोगों को समझने में अच्छा बनाती है।' },
    watch: { en: 'On busy or tense days, you may absorb the stress around you as if it were your own.', hi: 'भागदौड़ या तनाव के दिनों में आप आसपास का तनाव अपने ऊपर ले सकते हैं।' },
    relationship: { en: 'In closeness you usually notice small shifts in your partner and respond with care.', hi: 'रिश्ते में आप साथी के छोटे-छोटे बदलाव भी देख लेते हैं और प्यार से जवाब देते हैं।' },
    relationshipNeed: { en: 'You tend to need gentleness and a partner who takes your feelings seriously.', hi: 'आपको नरमी और ऐसा साथी चाहिए होता है जो आपकी भावनाओं को गंभीरता से ले।' },
  },
  practical: {
    family: 'careful',
    coreMeaning: { en: 'You tend to trust what works in real life more than ideas that only sound good.', hi: 'आप उन बातों पर ज़्यादा भरोसा करते हैं जो असल में काम करें, न कि सिर्फ़ सुनने में अच्छी लगें।' },
    realLife: {
      en: 'You often ask how something will actually get done, and you like plans with clear steps.',
      hi: 'आप अक्सर पूछते हैं कि कोई काम असल में होगा कैसे, और आपको साफ़ कदमों वाली योजनाएँ पसंद हैं।',
    },
    strength: { en: 'Your common sense helps turn big talk into real results.', hi: 'आपकी व्यावहारिक समझ बड़ी बातों को असली नतीजों में बदलने में मदद करती है।' },
    watch: { en: 'Waiting for proof first can make you miss ideas that need a little faith early on.', hi: 'पहले सबूत का इंतज़ार करने से वे विचार छूट सकते हैं जिन्हें शुरू में थोड़ा भरोसा चाहिए।' },
    work: { en: 'At work you usually focus on what is doable, useful and within reach.', hi: 'काम में आप आमतौर पर उस पर ध्यान देते हैं जो हो सके, काम का हो और पहुँच में हो।' },
    workEnvironment: { en: 'You tend to do well where tasks are concrete and results can be seen.', hi: 'आप वहाँ अच्छा करते हैं जहाँ काम ठोस हो और नतीजे दिखाई दें।' },
  },
  imaginative: {
    family: 'feeling',
    coreMeaning: { en: 'You tend to see possibilities in your mind long before they take shape anywhere else.', hi: 'आप चीज़ों की संभावनाएँ मन में पहले ही देख लेते हैं, उनके आकार लेने से बहुत पहले।' },
    realLife: { en: 'You may daydream, invent stories, or come up with fresh ways to solve ordinary problems.', hi: 'आप सपने बुनते हैं, कहानियाँ गढ़ते हैं, या आम समस्याओं के नए हल ढूँढ लेते हैं।' },
    strength: { en: 'Your imagination can bring originality to whatever you touch.', hi: 'आपकी कल्पना हर काम में कुछ नयापन ला सकती है।' },
    watch: { en: 'Sometimes the idea in your head may feel more exciting than the slow work of building it.', hi: 'कभी-कभी मन का विचार उसे धीरे-धीरे बनाने की मेहनत से ज़्यादा रोमांचक लग सकता है।' },
    work: { en: 'At work you usually bring new angles, ideas and creative solutions.', hi: 'काम में आप आमतौर पर नए नज़रिए, विचार और रचनात्मक हल लाते हैं।' },
    workEnvironment: { en: 'You tend to thrive where there is room to experiment and create.', hi: 'आप वहाँ खिलते हैं जहाँ प्रयोग करने और कुछ नया बनाने की छूट हो।' },
  },
  thorough: {
    family: 'careful',
    coreMeaning: { en: 'You tend to think things through fully before you commit to a step.', hi: 'आप कोई कदम उठाने से पहले बात को पूरी तरह सोच लेते हैं।' },
    realLife: { en: 'You may read the details others skip and double-check before you say yes.', hi: 'आप वे बारीकियाँ पढ़ते हैं जो दूसरे छोड़ देते हैं, और हाँ कहने से पहले दोबारा जाँचते हैं।' },
    strength: { en: 'Your care with details tends to catch mistakes before they happen.', hi: 'बारीकियों पर आपका ध्यान ग़लतियों को होने से पहले ही पकड़ लेता है।' },
    watch: { en: 'When time is short, wanting every detail right can slow you down.', hi: 'जब समय कम हो, तो हर बारीकी सही करने की चाह आपको धीमा कर सकती है।' },
    work: { en: 'At work you usually deliver careful, complete work that others can depend on.', hi: 'काम में आप आमतौर पर सावधानी से पूरा किया काम देते हैं, जिस पर लोग निर्भर रह सकें।' },
    workEnvironment: {
      en: 'You tend to suit places that value quality and give time to do things properly.',
      hi: 'आपको ऐसी जगह जमती है जहाँ गुणवत्ता की क़द्र हो और काम ठीक से करने का समय मिले।',
    },
  },
  focused: {
    family: 'careful',
    coreMeaning: { en: 'You tend to give one thing your full attention rather than spreading yourself thin.', hi: 'आप कई चीज़ों में बँटने के बजाय एक बात पर पूरा ध्यान लगाते हैं।' },
    realLife: { en: 'Once you are into a task, you may lose track of time and tune out distractions.', hi: 'एक बार काम में लग जाएँ, तो आप समय भूल जाते हैं और आसपास की भटकन से कट जाते हैं।' },
    strength: { en: 'Your concentration helps you build real depth and skill.', hi: 'आपकी एकाग्रता आपको सच्ची गहराई और हुनर तक ले जाती है।' },
    watch: { en: 'Deep focus can sometimes make it hard to switch when plans suddenly change.', hi: 'गहरी एकाग्रता में योजना अचानक बदलने पर ध्यान मोड़ना मुश्किल हो सकता है।' },
    work: {
      en: 'At work you usually go deep, finish what you start, and dislike constant interruptions.',
      hi: 'काम में आप आमतौर पर गहराई में जाते हैं, शुरू किया पूरा करते हैं, और बार-बार की रुकावट पसंद नहीं करते।',
    },
    workEnvironment: { en: 'You tend to do your best work in calm settings with clear priorities.', hi: 'आप शांत माहौल और साफ़ प्राथमिकताओं में अपना सबसे अच्छा काम करते हैं।' },
  },
  cautious: {
    family: 'careful',
    coreMeaning: { en: 'You tend to pause and weigh things before you act or commit.', hi: 'आप कुछ करने या हामी भरने से पहले रुककर तौलते हैं।' },
    realLife: { en: 'You may compare options, check reviews, or sleep on a decision before saying yes.', hi: 'आप विकल्पों की तुलना करते हैं, राय जाँचते हैं, या हाँ कहने से पहले एक रात सोचते हैं।' },
    strength: { en: 'Your caution tends to protect you from costly mistakes.', hi: 'आपकी सावधानी आपको महँगी ग़लतियों से बचाती है।' },
    watch: { en: 'Under pressure, careful thinking can turn into hesitation.', hi: 'दबाव में सोच-समझ कभी-कभी झिझक में बदल सकती है।' },
    money: {
      en: 'With money you usually plan ahead, keep something aside, and avoid big risks.',
      hi: 'पैसों में आप आमतौर पर पहले से योजना बनाते हैं, कुछ बचाकर रखते हैं और बड़े जोखिम से बचते हैं।',
    },
  },
  decisive: {
    family: 'growth',
    coreMeaning: { en: 'You tend to size things up quickly and make a call without long delays.', hi: 'आप बातों को जल्दी परखते हैं और बिना ज़्यादा देर किए फ़ैसला कर लेते हैं।' },
    realLife: { en: 'When others go back and forth, you are often the one who says let us just do this.', hi: 'जब दूसरे उलझे रहते हैं, तब अक्सर आप ही कहते हैं कि चलो, यही करते हैं।' },
    strength: { en: 'Your clarity helps things move and gives others confidence.', hi: 'आपकी स्पष्टता काम आगे बढ़ाती है और दूसरों को हौसला देती है।' },
    watch: { en: 'Deciding fast can sometimes mean a quieter detail gets missed.', hi: 'जल्दी फ़ैसला करने में कभी-कभी कोई छोटी पर ज़रूरी बात छूट सकती है।' },
    work: { en: 'At work you usually cut through confusion and keep things moving.', hi: 'काम में आप आमतौर पर उलझन काटते हैं और काम चलता रखते हैं।' },
    workEnvironment: { en: 'You tend to suit fast-moving settings where someone needs to make the call.', hi: 'आपको तेज़ रफ़्तार माहौल जमता है जहाँ किसी को फ़ैसला लेना हो।' },
  },
  independent: {
    family: 'growth',
    coreMeaning: { en: 'You tend to prefer choosing your own path rather than following a set one.', hi: 'आप बनी-बनाई राह पर चलने के बजाय अपनी राह ख़ुद चुनना पसंद करते हैं।' },
    realLife: {
      en: 'You may do things your own way, even when it takes longer, because it feels right to you.',
      hi: 'आप चीज़ें अपने ढंग से करते हैं, भले ही देर लगे, क्योंकि आपको वही सही लगता है।',
    },
    strength: { en: 'Your self-reliance helps you keep going when support is thin.', hi: 'आपकी आत्मनिर्भरता आपको तब भी आगे बढ़ाती है जब साथ कम हो।' },
    watch: { en: 'Doing it all yourself can make it hard to ask for help when you need it.', hi: 'सब कुछ ख़ुद करने की आदत में ज़रूरत पड़ने पर मदद माँगना मुश्किल लग सकता है।' },
    work: {
      en: 'At work you usually do well with ownership and room to decide how things get done.',
      hi: 'काम में आप आमतौर पर तब अच्छा करते हैं जब काम आपका हो और तरीका तय करने की छूट हो।',
    },
    workEnvironment: { en: 'You tend to prefer settings with freedom over close supervision.', hi: 'आपको कड़ी निगरानी से ज़्यादा आज़ादी वाला माहौल पसंद आता है।' },
    growth: {
      en: 'Your growth often comes from trusting your own judgement and building something that feels truly yours.',
      hi: 'आपका विकास अक्सर अपनी समझ पर भरोसे और कुछ ऐसा बनाने से आता है जो सचमुच आपका हो।',
    },
  },
  bold: {
    family: 'growth',
    coreMeaning: { en: 'You tend to speak up and step forward when something matters to you.', hi: 'आप बोलते हैं और आगे बढ़ते हैं, जब कोई बात आपके लिए मायने रखती है।' },
    realLife: {
      en: 'You may be the one who asks the awkward question or defends someone being treated unfairly.',
      hi: 'आप वह सवाल पूछ लेते हैं जो दूसरे टालते हैं, या किसी के साथ ग़लत हो तो उसका साथ देते हैं।',
    },
    strength: { en: 'Your courage helps you take chances that others only think about.', hi: 'आपकी हिम्मत आपको वे मौक़े लेने देती है जिनके बारे में दूसरे सिर्फ़ सोचते हैं।' },
    watch: { en: 'In heated moments, directness can come across stronger than you mean it.', hi: 'गरम माहौल में आपकी साफ़गोई आपके इरादे से ज़्यादा तीखी लग सकती है।' },
    growth: {
      en: 'You often grow by facing what feels hard rather than waiting for the perfect moment.',
      hi: 'आप अक्सर सही मौक़े का इंतज़ार करने के बजाय मुश्किल का सामना करके आगे बढ़ते हैं।',
    },
  },
  impulsive: {
    family: 'growth',
    coreMeaning: { en: 'You tend to act on your feelings and confidence quickly, often in the moment.', hi: 'आप अपनी भावना और आत्मविश्वास पर अक्सर उसी पल, जल्दी कदम उठा लेते हैं।' },
    realLife: {
      en: 'You may say yes to a plan on the spot or buy something the moment it catches your eye.',
      hi: 'आप मौक़े पर ही किसी योजना को हाँ कह देते हैं, या कोई चीज़ पसंद आते ही ले लेते हैं।',
    },
    strength: {
      en: 'Your spontaneity brings energy and helps you grab chances others think over for too long.',
      hi: 'आपकी सहजता जोश लाती है और आपको वे मौक़े पकड़ने देती है जिन पर दूसरे बहुत देर सोचते रहते हैं।',
    },
    watch: { en: 'Acting first can sometimes leave the thinking for later, when it is harder to undo.', hi: 'पहले कदम उठाने से सोचना बाद में होता है, जब बात पलटना मुश्किल हो।' },
    money: {
      en: 'With money you may spend on what feels right in the moment, and plans can shift with your mood.',
      hi: 'पैसों में आप उस पल जो सही लगे उस पर ख़र्च कर सकते हैं, और योजनाएँ मूड के साथ बदल सकती हैं।',
    },
  },
  self_controlled: {
    family: 'steady',
    coreMeaning: { en: 'You tend to keep your reactions in check and stay steady when things get tense.', hi: 'आप अपनी प्रतिक्रियाओं पर काबू रखते हैं और तनाव में भी स्थिर रहते हैं।' },
    realLife: {
      en: 'You may think before replying to a sharp message and rarely show panic in front of others.',
      hi: 'किसी तीखे संदेश का जवाब देने से पहले आप सोचते हैं, और दूसरों के सामने घबराहट कम ही दिखाते हैं।',
    },
    strength: { en: 'Your composure makes people turn to you when things go wrong.', hi: 'आपका संयम ऐसा है कि बात बिगड़ने पर लोग आपकी ओर देखते हैं।' },
    watch: { en: 'Holding everything in can leave you tired inside, even when you look calm.', hi: 'सब कुछ भीतर रोककर रखने से आप बाहर शांत दिखते हुए भी अंदर से थक सकते हैं।' },
  },
  determined: {
    family: 'growth',
    coreMeaning: { en: 'You tend to see a decision through once you have made up your mind.', hi: 'आप एक बार मन बना लें, तो फ़ैसले को अंजाम तक पहुँचाते हैं।' },
    realLife: { en: 'You may keep working on a goal quietly long after others have lost interest.', hi: 'दूसरे जब दिलचस्पी खो देते हैं, तब भी आप चुपचाप अपने लक्ष्य पर लगे रहते हैं।' },
    strength: { en: 'Your resolve helps you finish what many people only start.', hi: 'आपका इरादा आपको वह पूरा करने देता है जो बहुत से लोग सिर्फ़ शुरू करते हैं।' },
    watch: { en: 'Sticking to a plan can sometimes make it hard to change course when needed.', hi: 'योजना पर अड़े रहने से ज़रूरत पड़ने पर रास्ता बदलना मुश्किल हो सकता है।' },
    work: { en: 'At work you usually push through obstacles and keep your eye on the goal.', hi: 'काम में आप आमतौर पर रुकावटों को पार करते हैं और नज़र लक्ष्य पर रखते हैं।' },
    workEnvironment: {
      en: 'You tend to suit roles with clear goals and room to keep pushing.',
      hi: 'आपको ऐसी भूमिकाएँ जमती हैं जहाँ लक्ष्य साफ़ हों और लगातार आगे बढ़ने की गुंजाइश हो।',
    },
    growth: { en: 'Your growth often comes step by step, through commitment rather than sudden breaks.', hi: 'आपका विकास अक्सर अचानक मौक़ों से नहीं, लगन से, कदम-दर-कदम होता है।' },
  },
  quick_tempered: {
    family: 'feeling',
    coreMeaning: {
      en: 'You tend to feel things fast and strongly, and you usually let go just as fast.',
      hi: 'आप चीज़ों को तेज़ी और तीव्रता से महसूस करते हैं, और आमतौर पर उतनी ही जल्दी भूल भी जाते हैं।',
    },
    realLife: { en: 'Unfairness may spark an instant reaction, but you rarely hold a grudge afterwards.', hi: 'नाइंसाफ़ी देखकर तुरंत प्रतिक्रिया आ सकती है, पर बाद में आप मन में गाँठ कम ही रखते हैं।' },
    strength: {
      en: 'Your honesty about feelings means people usually know where they stand with you.',
      hi: 'भावनाओं को लेकर आपकी ईमानदारी से लोग जानते हैं कि वे आपके साथ कहाँ खड़े हैं।',
    },
    watch: { en: 'In a heated moment, words may come out sharper than you truly feel.', hi: 'गरम पल में शब्द आपकी असली भावना से ज़्यादा तीखे निकल सकते हैं।' },
  },
  logical: {
    family: 'careful',
    coreMeaning: { en: 'You tend to solve problems by breaking them down and reasoning step by step.', hi: 'आप समस्याओं को टुकड़ों में बाँटकर, एक-एक कदम तर्क से सुलझाते हैं।' },
    realLife: {
      en: 'You may ask why before accepting something, and you like explanations that actually add up.',
      hi: 'कुछ मानने से पहले आप अक्सर पूछते हैं क्यों, और आपको ऐसी बातें पसंद हैं जिनका हिसाब बैठे।',
    },
    strength: { en: 'Your clear thinking helps you stay fair and make sound choices.', hi: 'आपकी साफ़ सोच आपको निष्पक्ष रहने और सही चुनाव करने में मदद करती है।' },
    watch: { en: 'Leading with reason can sometimes leave feelings, yours or others, unheard.', hi: 'हर बार तर्क से चलने पर कभी-कभी भावनाएँ, आपकी या दूसरों की, अनसुनी रह जाती हैं।' },
    work: { en: 'At work you usually bring structure, analysis and clear reasoning.', hi: 'काम में आप आमतौर पर व्यवस्था, विश्लेषण और साफ़ तर्क लाते हैं।' },
    workEnvironment: { en: 'You tend to suit settings where problems are solved with facts and systems.', hi: 'आपको ऐसा माहौल जमता है जहाँ समस्याएँ तथ्यों और व्यवस्था से सुलझें।' },
  },
  versatile: {
    family: 'growth',
    coreMeaning: { en: 'You tend to adapt easily and move between different ways of thinking.', hi: 'आप आसानी से ढल जाते हैं और सोचने के अलग-अलग ढंगों में सहजता से आते-जाते हैं।' },
    realLife: {
      en: 'You may pick up new skills quickly and fit into very different groups or tasks.',
      hi: 'आप नए हुनर जल्दी सीख लेते हैं और बहुत अलग-अलग लोगों या कामों में घुल-मिल जाते हैं।',
    },
    strength: { en: 'Your flexibility helps you cope with change better than most.', hi: 'आपका लचीलापन आपको बदलाव से ज़्यादातर लोगों से बेहतर निपटने देता है।' },
    watch: { en: 'With so many interests, it may be hard to choose one to go deep on.', hi: 'कई रुचियों के बीच किसी एक को चुनकर उसमें गहराई तक जाना मुश्किल हो सकता है।' },
    work: {
      en: 'At work you usually wear many hats and connect ideas from different areas.',
      hi: 'काम में आप आमतौर पर कई भूमिकाएँ निभाते हैं और अलग-अलग क्षेत्रों के विचार जोड़ते हैं।',
    },
    workEnvironment: { en: 'You tend to enjoy varied work where no two days feel the same.', hi: 'आपको ऐसा काम भाता है जहाँ हर दिन कुछ अलग हो।' },
  },
  serious: {
    family: 'steady',
    coreMeaning: { en: 'You tend to take commitments, choices and people seriously and with care.', hi: 'आप वादों, फ़ैसलों और लोगों को गंभीरता और परवाह से लेते हैं।' },
    realLife: {
      en: 'You may prefer meaningful talk to small talk and think carefully before you promise anything.',
      hi: 'आपको हल्की-फुल्की बातों से ज़्यादा मतलब की बातें पसंद हैं, और कोई वादा करने से पहले आप सोचते हैं।',
    },
    strength: { en: 'Your earnestness means people trust you with things that matter.', hi: 'आपकी गंभीरता की वजह से लोग ज़रूरी बातें आपको सौंपते हैं।' },
    watch: {
      en: 'Carrying things so seriously can make it harder to relax and enjoy the moment.',
      hi: 'हर बात इतनी गंभीरता से लेने में आराम करना और पल का मज़ा लेना मुश्किल हो सकता है।',
    },
    work: { en: 'At work you usually bring dedication, reliability and a firm sense of duty.', hi: 'काम में आप आमतौर पर लगन, भरोसेमंदी और फ़र्ज़ का पक्का एहसास लाते हैं।' },
    workEnvironment: {
      en: 'You tend to suit settings where quality and trust matter more than show.',
      hi: 'आपको ऐसी जगह जमती है जहाँ दिखावे से ज़्यादा गुणवत्ता और भरोसा मायने रखे।',
    },
  },
  ambitious: {
    family: 'growth',
    coreMeaning: { en: 'You tend to aim high and feel driven to make something of your efforts.', hi: 'आप ऊँचा निशाना रखते हैं और अपनी मेहनत से कुछ बड़ा करने की ललक रखते हैं।' },
    realLife: {
      en: 'You may set goals for yourself, track your progress, and feel restless when things stall.',
      hi: 'आप अपने लिए लक्ष्य तय करते हैं, अपनी प्रगति देखते हैं, और काम रुकने पर बेचैन हो जाते हैं।',
    },
    strength: { en: 'Your drive pushes you to grow beyond where you started.', hi: 'आपकी ललक आपको शुरुआत से कहीं आगे बढ़ने को प्रेरित करती है।' },
    watch: {
      en: 'Always reaching for the next goal can make it hard to enjoy what you have already achieved.',
      hi: 'हमेशा अगले लक्ष्य की ओर देखने में जो पा चुके हैं उसका आनंद लेना मुश्किल हो सकता है।',
    },
    work: {
      en: 'At work you usually look for growth, responsibility and chances to prove yourself.',
      hi: 'काम में आप आमतौर पर तरक्की, ज़िम्मेदारी और ख़ुद को साबित करने के मौक़े ढूँढते हैं।',
    },
    workEnvironment: { en: 'You tend to thrive where effort is recognised and there is room to rise.', hi: 'आप वहाँ खिलते हैं जहाँ मेहनत की पहचान हो और ऊपर बढ़ने की जगह हो।' },
    growth: { en: 'Your path often moves upward in steps, each goal opening the next.', hi: 'आपकी राह अक्सर पड़ाव-दर-पड़ाव ऊपर जाती है, हर लक्ष्य अगला रास्ता खोलता है।' },
  },
  leader: {
    family: 'growth',
    coreMeaning: { en: 'You tend to step in, organise people and take charge when things feel unclear.', hi: 'आप उलझी बातों में आगे आकर लोगों को व्यवस्थित करते हैं और कमान सँभालते हैं।' },
    realLife: {
      en: 'In a group plan, you may be the one who sets the time, shares out tasks and keeps everyone on track.',
      hi: 'किसी साझा योजना में अक्सर आप ही समय तय करते हैं, काम बाँटते हैं और सबको पटरी पर रखते हैं।',
    },
    strength: { en: 'Your ability to guide others can help a group work better together.', hi: 'दूसरों को राह दिखाने की आपकी क्षमता टीम को बेहतर जोड़ सकती है।' },
    watch: { en: 'Taking charge often can make it hard to let others lead in their own way.', hi: 'बार-बार कमान सँभालने से दूसरों को उनके ढंग से आगे आने देना मुश्किल हो सकता है।' },
    work: {
      en: 'At work you usually take ownership, organise tasks and help others see the bigger picture.',
      hi: 'काम में आप आमतौर पर ज़िम्मेदारी लेते हैं, काम व्यवस्थित करते हैं और दूसरों को बड़ी तस्वीर दिखाते हैं।',
    },
    workEnvironment: {
      en: 'You tend to suit roles where you can coordinate people and shape decisions.',
      hi: 'आपको ऐसी भूमिकाएँ जमती हैं जहाँ आप लोगों को जोड़ सकें और फ़ैसलों को दिशा दे सकें।',
    },
  },
  persistent: {
    family: 'steady',
    coreMeaning: { en: 'You tend to keep going through early setbacks instead of giving up.', hi: 'आप शुरुआती झटकों के बावजूद हार मानने के बजाय आगे बढ़ते रहते हैं।' },
    realLife: {
      en: 'You may try again after a rejection or keep practising something until it finally clicks.',
      hi: 'आप ना सुनने के बाद फिर कोशिश करते हैं, या किसी चीज़ का अभ्यास तब तक करते हैं जब तक बात बन न जाए।',
    },
    strength: { en: 'Your staying power often turns slow starts into solid progress.', hi: 'आपकी टिके रहने की ताक़त अक्सर धीमी शुरुआत को ठोस प्रगति में बदल देती है।' },
    watch: {
      en: 'Pushing on can sometimes keep you in a plan after it has stopped making sense.',
      hi: 'लगे रहने की आदत आपको उस योजना में भी रोक सकती है जिसका मतलब ख़त्म हो चुका हो।',
    },
    work: {
      en: 'At work you usually outlast difficulty and keep your effort steady over long stretches.',
      hi: 'काम में आप आमतौर पर मुश्किलों से ज़्यादा टिकते हैं और लंबे समय तक मेहनत बनाए रखते हैं।',
    },
    workEnvironment: {
      en: 'You tend to suit work where patient effort builds up and slowly counts.',
      hi: 'आपको ऐसा काम जमता है जहाँ धैर्य भरी मेहनत धीरे-धीरे जुड़ती और गिनी जाती है।',
    },
    money: {
      en: 'With money you usually build little by little through regular effort rather than quick jumps.',
      hi: 'पैसों में आप आमतौर पर अचानक छलाँग से नहीं, नियमित मेहनत से थोड़ा-थोड़ा जोड़ते हैं।',
    },
  },
  influenced_by_others: {
    family: 'feeling',
    coreMeaning: {
      en: 'You tend to grow through the people around you, their advice, support and example.',
      hi: 'आप अपने आसपास के लोगों, उनकी सलाह, साथ और उदाहरण से आगे बढ़ते हैं।',
    },
    realLife: {
      en: 'A mentor, friend or family member may shape your choices more than you realise.',
      hi: 'कोई गुरु, दोस्त या घर का सदस्य आपके फ़ैसलों पर आपकी सोच से ज़्यादा असर डाल सकता है।',
    },
    strength: {
      en: 'Your openness to others helps you learn quickly and find support when you need it.',
      hi: 'दूसरों के लिए आपका खुलापन आपको जल्दी सीखने और ज़रूरत पर साथ पाने में मदद करता है।',
    },
    watch: { en: 'At times, the opinions around you can drown out what you really want.', hi: 'कभी-कभी आसपास की राय आपकी अपनी असली चाह को दबा सकती है।' },
    work: {
      en: 'At work you usually do well with good guidance, teamwork and people who believe in you.',
      hi: 'काम में आप आमतौर पर अच्छे मार्गदर्शन, टीमवर्क और आप पर भरोसा करने वाले लोगों के साथ अच्छा करते हैं।',
    },
    workEnvironment: { en: 'You tend to suit supportive teams more than working completely alone.', hi: 'आपको पूरी तरह अकेले काम करने से ज़्यादा साथ देने वाली टीम जमती है।' },
    growth: {
      en: 'Your direction often becomes clear through the right people and the conversations you share with them.',
      hi: 'आपकी दिशा अक्सर सही लोगों और उनके साथ हुई बातचीत से साफ़ होती है।',
    },
  },
  public_facing: {
    family: 'growth',
    coreMeaning: { en: 'You tend to feel energised when your work is seen and people respond to it.', hi: 'आपमें जोश आ जाता है जब आपका काम लोगों के सामने हो और उस पर प्रतिक्रिया मिले।' },
    realLife: { en: 'You may enjoy presenting, meeting new people or being the face of a plan.', hi: 'आपको प्रस्तुति देना, नए लोगों से मिलना या किसी योजना का चेहरा बनना अच्छा लग सकता है।' },
    strength: { en: 'Your comfort with being seen helps you connect with many people at once.', hi: 'सबके सामने आने की आपकी सहजता आपको एक साथ बहुत से लोगों से जोड़ती है।' },
    watch: {
      en: 'Relying on outside reactions can make quiet, unseen effort feel less rewarding.',
      hi: 'बाहरी प्रतिक्रिया पर टिके रहने से चुपचाप की गई मेहनत कम संतोष दे सकती है।',
    },
    work: { en: 'At work you usually shine when dealing with people, feedback and presentation.', hi: 'काम में आप आमतौर पर लोगों, प्रतिक्रिया और प्रस्तुति के बीच चमकते हैं।' },
    workEnvironment: {
      en: 'You tend to suit visible, people-facing settings rather than a hidden back room.',
      hi: 'आपको छिपे कोने से ज़्यादा ऐसा माहौल जमता है जो लोगों के सामने हो।',
    },
  },
  business_minded: {
    family: 'growth',
    coreMeaning: { en: 'You tend to notice what things are worth and where value can be created.', hi: 'आप जल्दी देख लेते हैं कि किस चीज़ की क्या क़ीमत है और कहाँ फ़ायदा बन सकता है।' },
    realLife: {
      en: 'You may compare prices, spot a good deal, or think about how an idea could earn.',
      hi: 'आप दाम मिलाते हैं, अच्छा सौदा पहचानते हैं, या सोचते हैं कि किसी विचार से कमाई कैसे हो।',
    },
    strength: { en: 'Your sense of value helps you make well-judged trades and choices.', hi: 'क़ीमत की आपकी समझ आपको सोच-समझकर सौदे और फ़ैसले करने में मदद करती है।' },
    watch: {
      en: 'Weighing everything by value may sometimes crowd out things that simply bring joy.',
      hi: 'हर चीज़ को क़ीमत से तौलने में कभी-कभी वे चीज़ें पीछे छूट सकती हैं जो बस खुशी देती हैं।',
    },
    work: {
      en: 'At work you usually think about costs, returns and practical ways to grow.',
      hi: 'काम में आप आमतौर पर लागत, फ़ायदे और बढ़ने के व्यावहारिक तरीक़ों के बारे में सोचते हैं।',
    },
    workEnvironment: {
      en: 'You tend to suit settings involving trade, numbers or building something of your own.',
      hi: 'आपको व्यापार, हिसाब-किताब या अपना कुछ खड़ा करने वाला माहौल जमता है।',
    },
    money: {
      en: 'With money you usually track value closely and look for ways to make effort count.',
      hi: 'पैसों में आप आमतौर पर क़ीमत पर बारीक नज़र रखते हैं और मेहनत का पूरा मोल निकालने के तरीक़े ढूँढते हैं।',
    },
  },
  responsible: {
    family: 'steady',
    coreMeaning: { en: 'You tend to take on duties readily and follow through on what you promised.', hi: 'आप ज़िम्मेदारियाँ आसानी से उठाते हैं और जो वादा किया उसे निभाते हैं।' },
    realLife: { en: 'You may be the one people call when something must get done properly.', hi: 'जब कोई काम ठीक से होना ज़रूरी हो, तो लोग अक्सर आपको ही याद करते हैं।' },
    strength: { en: 'Your reliability builds deep trust with family, friends and colleagues.', hi: 'आपकी भरोसेमंदी परिवार, दोस्तों और साथियों के साथ गहरा विश्वास बनाती है।' },
    watch: { en: 'Carrying more than your share can quietly wear you down.', hi: 'अपने हिस्से से ज़्यादा बोझ उठाना आपको चुपचाप थका सकता है।' },
    work: { en: 'At work you usually become the dependable one who keeps commitments.', hi: 'काम में आप आमतौर पर वह भरोसेमंद इंसान बनते हैं जो वादे निभाता है।' },
    workEnvironment: {
      en: 'You tend to suit roles with clear duties and people who count on you.',
      hi: 'आपको ऐसी भूमिकाएँ जमती हैं जहाँ ज़िम्मेदारियाँ साफ़ हों और लोग आप पर निर्भर हों।',
    },
    growth: {
      en: 'Your growth often comes from the trust you earn, as responsibility slowly turns into respect.',
      hi: 'आपका विकास अक्सर कमाए हुए भरोसे से आता है, जब ज़िम्मेदारी धीरे-धीरे इज़्ज़त में बदलती है।',
    },
  },
  restless: {
    family: 'growth',
    coreMeaning: { en: 'You tend to crave movement, variety and new experiences.', hi: 'आपको चलते रहना, विविधता और नए अनुभव चाहिए होते हैं।' },
    realLife: {
      en: 'You may rearrange your room, plan trips, or start fresh projects when routine feels flat.',
      hi: 'जब रोज़ का ढर्रा फीका लगे, तो आप कमरा बदलते हैं, सफ़र की योजना बनाते हैं या कुछ नया शुरू करते हैं।',
    },
    strength: { en: 'Your urge to explore keeps you open, curious and ready for change.', hi: 'खोजने की आपकी ललक आपको खुला, जिज्ञासु और बदलाव के लिए तैयार रखती है।' },
    watch: {
      en: 'Moving on quickly can sometimes mean leaving before things have had time to grow.',
      hi: 'जल्दी आगे बढ़ जाने में कभी-कभी चीज़ों को पनपने का समय मिलने से पहले ही आप निकल जाते हैं।',
    },
    growth: {
      en: 'Your path may unfold through many turns and places, each one teaching you something.',
      hi: 'आपकी राह कई मोड़ों और जगहों से होकर गुज़र सकती है, और हर मोड़ कुछ सिखाता है।',
    },
  },
  changeable: {
    family: 'growth',
    coreMeaning: { en: 'You tend to follow your interests where they lead, and they often shift.', hi: 'आप अपनी रुचियों के पीछे चलते हैं, और वे अक्सर बदलती रहती हैं।' },
    realLife: {
      en: 'You may start with great enthusiasm and later find something else pulling your attention.',
      hi: 'आप बड़े जोश से शुरू करते हैं और बाद में कोई और चीज़ आपका ध्यान खींच लेती है।',
    },
    strength: {
      en: 'Your openness to change helps you adapt and try what others would not.',
      hi: 'बदलाव के लिए आपका खुलापन आपको ढलने और वह आज़माने देता है जो दूसरे नहीं आज़माते।',
    },
    watch: {
      en: 'Frequent changes of mind can make it harder for others to know what to expect.',
      hi: 'बार-बार मन बदलने से दूसरों को समझना मुश्किल हो सकता है कि आपसे क्या उम्मीद रखें।',
    },
    relationship: {
      en: 'In love your feelings may move in waves, strong at times and distracted at others.',
      hi: 'प्यार में आपकी भावनाएँ लहरों की तरह आ-जा सकती हैं, कभी गहरी, कभी बिखरी।',
    },
    relationshipNeed: {
      en: 'You tend to need a partner who keeps things fresh and gives you room to breathe.',
      hi: 'आपको ऐसा साथी चाहिए होता है जो रिश्ते में ताज़गी रखे और आपको खुलकर साँस लेने दे।',
    },
    growth: {
      en: 'Your direction may form by trying many things before one finally feels like home.',
      hi: 'आपकी दिशा कई चीज़ें आज़माने के बाद बन सकती है, जब कोई एक आख़िरकार अपनी सी लगे।',
    },
  },
  steady: {
    family: 'steady',
    coreMeaning: {
      en: 'You tend to keep to a settled course and build your life patiently, one step at a time.',
      hi: 'आप एक तय राह पर टिके रहते हैं और धीरज से, कदम-दर-कदम अपनी ज़िंदगी बनाते हैं।',
    },
    realLife: {
      en: 'You may prefer familiar routines, trusted places and plans that grow slowly but hold.',
      hi: 'आपको जानी-पहचानी दिनचर्या, भरोसेमंद जगहें और धीरे पर पक्की बढ़ने वाली योजनाएँ पसंद हैं।',
    },
    strength: {
      en: 'Your consistency tends to create security for you and the people who rely on you.',
      hi: 'आपकी निरंतरता आपके लिए और आप पर निर्भर लोगों के लिए सुरक्षा बनाती है।',
    },
    watch: {
      en: 'Liking what is settled may make sudden change feel more unsettling than it needs to.',
      hi: 'जमी हुई चीज़ें पसंद होने से अचानक बदलाव ज़रूरत से ज़्यादा परेशान कर सकता है।',
    },
    relationship: { en: 'In love you usually offer calm, dependable presence rather than grand gestures.', hi: 'प्यार में आप आमतौर पर बड़े दिखावे से ज़्यादा शांत, भरोसेमंद साथ देते हैं।' },
    relationshipNeed: {
      en: 'You tend to need a bond that feels secure and predictable in a good way.',
      hi: 'आपको ऐसा रिश्ता चाहिए होता है जो सुरक्षित लगे और अच्छे मायनों में भरोसेमंद हो।',
    },
    growth: { en: 'Your growth often comes through slow, patient building that holds up over time.', hi: 'आपका विकास अक्सर धीमे, धैर्य भरे निर्माण से होता है जो समय के साथ टिका रहता है।' },
  },
  artistic: {
    family: 'feeling',
    coreMeaning: { en: 'You tend to notice beauty, colour and atmosphere, and they affect how you feel.', hi: 'आप सुंदरता, रंग और माहौल पर ध्यान देते हैं, और इनका असर आपके मन पर पड़ता है।' },
    realLife: {
      en: 'You may care how a room looks, enjoy music or design, or express yourself through something you make.',
      hi: 'आपको फ़र्क़ पड़ता है कि कमरा कैसा दिखता है, संगीत या डिज़ाइन भाता है, या आप कुछ बनाकर ख़ुद को ज़ाहिर करते हैं।',
    },
    strength: { en: 'Your eye for beauty can make ordinary things feel special.', hi: 'सुंदरता की आपकी नज़र आम चीज़ों को ख़ास बना सकती है।' },
    watch: { en: 'Harsh or messy surroundings may drain you more than others realise.', hi: 'कठोर या बिखरा माहौल आपको दूसरों की सोच से ज़्यादा थका सकता है।' },
    work: {
      en: 'At work you usually bring taste, style and attention to how things look and feel.',
      hi: 'काम में आप आमतौर पर अच्छी पसंद, अंदाज़ और चीज़ों के रूप-रंग पर ध्यान लाते हैं।',
    },
    workEnvironment: { en: 'You tend to suit creative settings where presentation and feeling matter.', hi: 'आपको ऐसा रचनात्मक माहौल जमता है जहाँ प्रस्तुति और एहसास मायने रखें।' },
  },
  easygoing_with_money: {
    family: 'steady',
    coreMeaning: {
      en: 'You tend to stay relaxed about everyday spending rather than counting every small sum.',
      hi: 'आप रोज़ के ख़र्चों को लेकर बेफ़िक्र रहते हैं और हर छोटी रक़म नहीं गिनते।',
    },
    realLife: {
      en: 'You may pay for a friend without thinking twice or skip tracking small purchases.',
      hi: 'आप बिना दोबारा सोचे किसी दोस्त का बिल भर देते हैं, या छोटी ख़रीदारी का हिसाब नहीं रखते।',
    },
    strength: { en: 'Your relaxed attitude keeps money from becoming a daily worry.', hi: 'आपका बेफ़िक्र रवैया पैसे को रोज़ की चिंता नहीं बनने देता।' },
    watch: { en: 'Small untracked spends can quietly add up before you notice.', hi: 'बिना हिसाब के छोटे ख़र्चे चुपचाप जुड़कर बड़े हो सकते हैं।' },
    money: {
      en: 'With money you usually spend comfortably day to day and prefer not to stress over small sums.',
      hi: 'पैसों में आप आमतौर पर रोज़ आराम से ख़र्च करते हैं और छोटी रक़मों पर तनाव नहीं लेते।',
    },
  },
  energetic: {
    family: 'growth',
    coreMeaning: { en: 'You tend to carry a lively energy that pulls you toward people and activity.', hi: 'आपमें ऐसी जीवंत ऊर्जा है जो आपको लोगों और काम-काज की ओर खींचती है।' },
    realLife: {
      en: 'You may fill your day with plans, move quickly between tasks and feel flat when things are too still.',
      hi: 'आप दिन को योजनाओं से भर देते हैं, कामों के बीच तेज़ी से चलते हैं, और ठहराव में सुस्त महसूस करते हैं।',
    },
    strength: { en: 'Your energy can motivate others and get things started.', hi: 'आपकी ऊर्जा दूसरों को प्रेरित कर सकती है और काम की शुरुआत करा देती है।' },
    watch: { en: 'Running at full speed can leave little time to rest and recharge.', hi: 'पूरी रफ़्तार से चलते रहने में आराम और दोबारा ताज़ा होने का समय कम पड़ सकता है।' },
  },
  low_key: {
    family: 'careful',
    coreMeaning: { en: 'You tend to keep your energy quiet, steady and mostly inward.', hi: 'आपकी ऊर्जा शांत, स्थिर और ज़्यादातर भीतर की ओर रहती है।' },
    realLife: {
      en: 'You may prefer a calm evening to a crowded party and recharge best in your own space.',
      hi: 'आपको भीड़ भरी पार्टी से ज़्यादा शांत शाम पसंद है, और अपनी जगह में आप सबसे अच्छा सुकून पाते हैं।',
    },
    strength: { en: 'Your calm energy helps you think clearly and stay grounded.', hi: 'आपकी शांत ऊर्जा आपको साफ़ सोचने और ज़मीन से जुड़े रहने में मदद करती है।' },
    watch: {
      en: 'Others may mistake your quiet for lack of interest when you are simply taking things in.',
      hi: 'जब आप बस चीज़ों को समझ रहे होते हैं, तब लोग आपकी चुप्पी को बेरुख़ी समझ सकते हैं।',
    },
  },
  quick_witted: {
    family: 'growth',
    coreMeaning: { en: 'You tend to think on your feet and find the right words quickly.', hi: 'आप मौक़े पर सोच लेते हैं और सही शब्द जल्दी ढूँढ लेते हैं।' },
    realLife: {
      en: 'You may have a ready reply, sense the mood of a room fast, and make people laugh.',
      hi: 'आपके पास जवाब तैयार रहता है, आप माहौल जल्दी भाँप लेते हैं, और लोगों को हँसा देते हैं।',
    },
    strength: { en: 'Your quick mind helps you adapt in conversations and tricky situations.', hi: 'आपका तेज़ दिमाग़ बातचीत और उलझी स्थितियों में आपको ढलने में मदद करता है।' },
    watch: { en: 'A fast reply can sometimes arrive before the thought behind it is complete.', hi: 'कभी-कभी तेज़ जवाब सोच पूरी होने से पहले ही निकल जाता है।' },
    work: {
      en: 'At work you usually do well in conversations, negotiations and fast problem-solving.',
      hi: 'काम में आप आमतौर पर बातचीत, मोलभाव और तेज़ी से हल निकालने में अच्छे रहते हैं।',
    },
    workEnvironment: { en: 'You tend to suit lively settings with people, ideas and quick exchanges.', hi: 'आपको लोगों, विचारों और तेज़ बातचीत वाला जीवंत माहौल जमता है।' },
  },
};

/** "So what?" copy for each COMPATIBLE pair: what the combination may mean in normal life. Key = the two trait ids sorted alphabetically joined by '|', e.g. 'affectionate|loyal'. */
export const COMBINATION_COPY: Readonly<Record<string, Bilingual>> = {
  'cautious|persistent': {
    en: 'You tend to move carefully, then keep going once you start. Slow, well-planned effort that does not give up may be how you build what lasts.',
    hi: 'आप सोच-समझकर कदम उठाते हैं, फिर शुरू करके रुकते नहीं। धीमी, सोची-समझी और लगातार मेहनत ही शायद आपके टिकाऊ काम की नींव है।',
  },
  'affectionate|loyal': {
    en: 'You love warmly and stay faithful once you care. People close to you may feel both cherished and secure, and you tend to hope for the same devotion back.',
    hi: 'आप दिल से प्यार करते हैं और जुड़कर साथ निभाते हैं। आपके करीबी शायद प्यार और सुरक्षा दोनों महसूस करते हैं, और आप बदले में वैसा ही समर्पण चाहते हैं।',
  },
  'affectionate|generous': {
    en: 'Your care tends to show through giving, time, help and small surprises. Love for you is often something you do, not just something you say.',
    hi: 'आपकी परवाह देने में दिखती है, समय, मदद और छोटे सरप्राइज़ में। आपके लिए प्यार अक्सर कहने से ज़्यादा करने की चीज़ है।',
  },
  'cheerful|sociable': {
    en: 'You tend to bring light into a group and enjoy lifting the mood. People may seek you out simply because time with you feels easy.',
    hi: 'आप किसी भी महफ़िल में रौनक लाते हैं और माहौल हल्का करना पसंद करते हैं। लोग शायद इसलिए आपके पास आते हैं क्योंकि आपके साथ समय आसान लगता है।',
  },
  'energetic|sociable': {
    en: 'Your energy seems to grow around people. Busy days full of plans and company may recharge you more than quiet rest does.',
    hi: 'लोगों के बीच आपकी ऊर्जा और बढ़ जाती है। योजनाओं और साथ से भरे दिन आपको शांत आराम से ज़्यादा ताज़ा कर सकते हैं।',
  },
  'logical|practical': {
    en: 'You tend to think clearly and keep your feet on the ground. Problems are usually solved with facts and workable steps rather than guesses or hype.',
    hi: 'आप साफ़ सोचते हैं और ज़मीन से जुड़े रहते हैं। आप अक्सर समस्याएँ अंदाज़ों या शोर से नहीं, तथ्यों और हो सकने वाले कदमों से सुलझाते हैं।',
  },
  'focused|practical': {
    en: 'You tend to pick what matters and stay on it until it is done. That grounded focus often makes you the one who actually finishes things.',
    hi: 'आप ज़रूरी बात चुनकर उसके पूरा होने तक लगे रहते हैं। इसी ठोस एकाग्रता से अक्सर आप ही काम सच में पूरा करते हैं।',
  },
  'focused|thorough': {
    en: 'You go deep and do not rush. Work you care about may take longer, but it usually comes out careful, complete and trustworthy.',
    hi: 'आप गहराई में जाते हैं और जल्दबाज़ी नहीं करते। आपके पसंदीदा काम में समय लग सकता है, पर वह आमतौर पर सधा हुआ और भरोसेमंद होता है।',
  },
  'artistic|imaginative': {
    en: 'You tend to see beauty and possibility at once. Given space to create, you may turn ideas in your head into something others can feel.',
    hi: 'आप सुंदरता और संभावना को एक साथ देखते हैं। रचने की जगह मिले, तो आप मन के विचारों को ऐसी चीज़ में बदल सकते हैं जिसे दूसरे महसूस करें।',
  },
  'ambitious|leader': {
    en: 'You aim high and like to steer. You may feel most alive when you are guiding people toward a goal that matters to you.',
    hi: 'आप ऊँचा निशाना रखते हैं और दिशा देना पसंद करते हैं। लोगों को किसी अहम लक्ष्य की ओर ले जाते हुए आप शायद सबसे जीवंत महसूस करते हैं।',
  },
  'ambitious|determined': {
    en: 'You set big goals and tend to stay with them. Progress may come less from sudden breaks than from refusing to let go.',
    hi: 'आप बड़े लक्ष्य रखते हैं और उन पर टिके रहते हैं। आपकी प्रगति अचानक मौक़ों से कम, और हार न मानने की ज़िद से ज़्यादा आ सकती है।',
  },
  'ambitious|public_facing': {
    en: 'You want to rise and you enjoy being seen. Recognition may matter to you, and visible roles can bring out your best effort.',
    hi: 'आप आगे बढ़ना चाहते हैं और सबके सामने आना पसंद करते हैं। पहचान आपके लिए मायने रख सकती है, और सामने वाली भूमिकाएँ आपकी सबसे अच्छी मेहनत निकाल सकती हैं।',
  },
  'bold|determined': {
    en: 'You tend to step forward and then hold your ground. Once you commit, pushback may make you more resolved rather than less.',
    hi: 'आप आगे बढ़ते हैं और फिर डटे रहते हैं। एक बार ठान लें, तो विरोध आपको कमज़ोर नहीं, और पक्का बना सकता है।',
  },
  'leader|self_controlled': {
    en: 'You take charge while staying calm. In tense moments people may look to you because you lead without losing your composure.',
    hi: 'आप कमान सँभालते हुए भी शांत रहते हैं। तनाव के पलों में लोग शायद आपकी ओर देखते हैं क्योंकि आप संयम खोए बिना राह दिखाते हैं।',
  },
  'cautious|serious': {
    en: 'You think before acting and take choices to heart. You may be slow to commit, but your yes usually means something real.',
    hi: 'आप करने से पहले सोचते हैं और फ़ैसलों को दिल से लेते हैं। हामी भरने में देर हो सकती है, पर आपकी हाँ का पक्का मतलब होता है।',
  },
  'loyal|steady': {
    en: 'You stay faithful and keep a settled course. Relationships and commitments may grow slowly with you, but they tend to last.',
    hi: 'आप वफ़ादार रहते हैं और एक तय राह पर चलते हैं। आपके साथ रिश्ते और वादे शायद धीरे-धीरे बढ़ें, पर वे अक्सर टिके रहते हैं।',
  },
  'responsible|steady': {
    en: 'You carry duties calmly and consistently. Others may build their plans around you because you tend to show up, again and again.',
    hi: 'आप ज़िम्मेदारियाँ शांति और निरंतरता से निभाते हैं। लोग अपनी योजनाएँ आपके भरोसे बना सकते हैं क्योंकि आप बार-बार साथ खड़े होते हैं।',
  },
  'changeable|restless': {
    en: 'You crave change and your interests move quickly. Life may feel fullest when it keeps offering something new to explore.',
    hi: 'आपको बदलाव चाहिए और आपकी रुचियाँ जल्दी बदलती हैं। ज़िंदगी शायद तब सबसे भरी लगती है जब उसमें खोजने को कुछ नया मिलता रहे।',
  },
  'business_minded|practical': {
    en: 'You tend to see value and what is workable at the same time. Ideas usually interest you most when they can become something real and useful.',
    hi: 'आप क़ीमत और हो सकने वाली बात को एक साथ देखते हैं। कोई विचार आपको सबसे ज़्यादा तब भाता है जब वह असली और काम का बन सके।',
  },
  'quick_witted|versatile': {
    en: 'Your mind moves fast and adapts easily. You may shine in changing situations where you need to think, talk and switch gears quickly.',
    hi: 'आपका दिमाग़ तेज़ चलता है और आसानी से ढल जाता है। बदलती स्थितियों में, जहाँ जल्दी सोचना, बोलना और रुख़ बदलना हो, आप चमक सकते हैं।',
  },
  'decisive|independent': {
    en: 'You like to choose your own way and decide quickly. You may prefer owning your choices over waiting for approval from others.',
    hi: 'आप अपनी राह ख़ुद चुनना और जल्दी फ़ैसला करना पसंद करते हैं। आप शायद दूसरों की मंज़ूरी का इंतज़ार करने से ज़्यादा अपने फ़ैसलों की ज़िम्मेदारी लेना पसंद करते हैं।',
  },
};

/** The premium "Your tension" insight for each TENSION pair (same key format). Human, specific, balanced: names both sides and what happens when they meet. */
export const TENSION_COPY: Readonly<Record<string, Bilingual>> = {
  'affectionate|reserved': {
    en: 'You appear to feel love deeply, yet you tend to keep it private. Those close to you may sense more warmth than you ever say out loud.',
    hi: 'आप गहराई से प्यार महसूस करते हैं, फिर भी उसे अपने तक रखते हैं। आपके करीबी शायद आपकी कही बातों से ज़्यादा गर्मजोशी महसूस करते हैं।',
  },
  'reserved|sociable': {
    en: 'You enjoy people, yet part of you stays private. You may be easy company on the surface while only a few truly know your inner world.',
    hi: 'आपको लोगों का साथ अच्छा लगता है, फिर भी आपका एक हिस्सा निजी रहता है। ऊपर से आप सहज साथी हैं, पर आपकी भीतरी दुनिया कुछ ही लोग जानते हैं।',
  },
  'independent|influenced_by_others': {
    en: 'You want to choose your own path, yet the people around you shape it strongly. Growth may come from knowing which voices to keep close.',
    hi: 'आप अपनी राह ख़ुद चुनना चाहते हैं, फिर भी आसपास के लोग उसे गहराई से गढ़ते हैं। विकास शायद यह पहचानने से आए कि किसकी बात पास रखनी है।',
  },
  'cheerful|serious': {
    en: 'You carry both lightness and weight. You may joke easily with others while privately taking things far more seriously than you let on.',
    hi: 'आपमें हल्कापन और गंभीरता दोनों हैं। आप दूसरों से आसानी से मज़ाक करते हैं, पर भीतर बातों को दिखाने से कहीं ज़्यादा गंभीरता से लेते हैं।',
  },
  'imaginative|practical': {
    en: 'Your mind reaches for possibilities, while another part asks whether it will actually work. When the two cooperate, dreams may become plans you can build.',
    hi: 'आपका मन संभावनाओं की ओर दौड़ता है, और दूसरा हिस्सा पूछता है कि क्या यह सच में चलेगा। दोनों साथ चलें, तो सपने असली योजनाएँ बन सकते हैं।',
  },
  'cautious|decisive': {
    en: 'You can decide fast, yet you also like to be careful. You may swing between quick action and second thoughts, until you sense which moments need which speed.',
    hi: 'आप जल्दी फ़ैसला कर लेते हैं, फिर भी सावधानी पसंद है। आप तेज़ी और दोबारा सोचने के बीच झूल सकते हैं, जब तक सही रफ़्तार न समझ लें।',
  },
  'bold|sensitive': {
    en: 'You stand up for yourself readily, yet you feel things keenly. You may speak up boldly and still carry the sting of a hard exchange long after.',
    hi: 'आप अपने लिए बेझिझक खड़े होते हैं, फिर भी चीज़ों को गहराई से महसूस करते हैं। खुलकर बोलने के बाद भी कड़वी बहस की चुभन देर तक रह सकती है।',
  },
  'responsible|restless': {
    en: 'You take duty seriously, yet part of you longs for movement and change. You may feel pulled between staying for others and exploring for yourself.',
    hi: 'आप ज़िम्मेदारी को गंभीरता से लेते हैं, फिर भी आपका एक हिस्सा बदलाव को तरसता है। दूसरों के लिए रुकने और अपने लिए खोजने के बीच खिंचाव हो सकता है।',
  },
};

export const PATTERN_IDS = ['stable_foundation', 'growth_oriented', 'mixed_transitional', 'emotionally_intense', 'careful_steady', 'strong_conflicted', 'insufficient'] as const;
export type PatternId = (typeof PATTERN_IDS)[number];

/** Category name shown as the overall pattern label. */
export const PATTERN_LABELS: Record<PatternId, Bilingual> = {
  stable_foundation: { en: 'Stable foundation', hi: 'स्थिर नींव' },
  growth_oriented: { en: 'Growth-oriented', hi: 'आगे बढ़ने की ओर' },
  mixed_transitional: { en: 'Mixed and transitional', hi: 'मिला-जुला और बदलता दौर' },
  emotionally_intense: { en: 'Emotionally intense', hi: 'भावनाओं की गहराई' },
  careful_steady: { en: 'Careful and steady', hi: 'सावधान और स्थिर' },
  strong_conflicted: { en: 'Strong but inwardly conflicted', hi: 'मज़बूत, पर भीतर से खिंचाव भरा' },
  insufficient: { en: 'Not enough clear evidence', hi: 'पर्याप्त साफ़ संकेत नहीं' },
};

/** Family pair (sorted alphabetically, joined by '|', e.g. 'careful|feeling'; same family twice e.g. 'steady|steady') → the overall pattern, one overall sentence, and one reflection for the Life Direction section. */
export const FAMILY_PATTERNS: Readonly<Record<string, { pattern: PatternId; sentence: Bilingual; reflection: Bilingual }>> = {
  'careful|careful': {
    pattern: 'careful_steady',
    sentence: {
      en: 'Careful, well-considered progress, built on clear thinking and quiet attention to detail.',
      hi: 'सोच-समझकर होने वाली प्रगति, जो साफ़ सोच और बारीकियों पर शांत ध्यान पर टिकी है।',
    },
    reflection: {
      en: 'Your direction may become clearer not by thinking more, but by trusting the thinking you have already done.',
      hi: 'आपकी दिशा शायद ज़्यादा सोचने से नहीं, पहले की गई सोच पर भरोसे से साफ़ हो सकती है।',
    },
  },
  'careful|feeling': {
    pattern: 'careful_steady',
    sentence: {
      en: 'A thoughtful, careful mind paired with a warm and deeply feeling heart.',
      hi: 'एक सोच-समझकर चलने वाला मन, और उसके साथ गर्मजोशी भरा, गहराई से महसूस करने वाला दिल।',
    },
    reflection: {
      en: 'Your path may feel most right when your careful mind and your warm heart are both given a say.',
      hi: 'आपकी राह शायद तब सबसे सही लगे जब सावधान मन और गर्म दिल, दोनों की बात सुनी जाए।',
    },
  },
  'careful|growth': {
    pattern: 'growth_oriented',
    sentence: {
      en: 'A real drive to grow and move forward, steadied by a careful, thinking mind.',
      hi: 'आगे बढ़ने और तरक्की की सच्ची ललक, जिसे एक सावधान, सोचने वाला मन संतुलित रखता है।',
    },
    reflection: {
      en: 'Your forward steps may feel strongest when ambition and careful thought walk together rather than taking turns.',
      hi: 'आपके आगे के कदम शायद तब सबसे मज़बूत लगें जब ललक और सोच बारी-बारी नहीं, साथ-साथ चलें।',
    },
  },
  'careful|steady': {
    pattern: 'stable_foundation',
    sentence: {
      en: 'A grounded, reliable nature that builds slowly and thinks before it moves.',
      hi: 'एक ज़मीन से जुड़ा, भरोसेमंद स्वभाव, जो धीरे-धीरे बनाता है और चलने से पहले सोचता है।',
    },
    reflection: {
      en: 'Growth may come less from speeding up than from trusting what you have already built.',
      hi: 'विकास शायद रफ़्तार बढ़ाने से कम, और जो बना चुके हैं उस पर भरोसे से ज़्यादा आता है।',
    },
  },
  'feeling|feeling': {
    pattern: 'emotionally_intense',
    sentence: {
      en: 'A deeply feeling nature, where warmth, emotion and connection shape most of what you do.',
      hi: 'गहराई से महसूस करने वाला स्वभाव, जहाँ गर्मजोशी, भावना और जुड़ाव आपके ज़्यादातर कामों को दिशा देते हैं।',
    },
    reflection: {
      en: 'Your direction may become clearest when you listen to where your feelings are pointing, not only to what they react to.',
      hi: 'आपकी दिशा शायद तब सबसे साफ़ हो जब आप सुनें कि भावनाएँ किस ओर इशारा करती हैं, न कि सिर्फ़ किस पर भड़कती हैं।',
    },
  },
  'feeling|growth': {
    pattern: 'emotionally_intense',
    sentence: {
      en: 'Strong feelings and a strong drive, often moving you quickly toward the people and goals you care about.',
      hi: 'तेज़ भावनाएँ और तेज़ ललक, जो आपको अक्सर जल्दी उन लोगों और लक्ष्यों की ओर ले जाती हैं जिनकी आप परवाह करते हैं।',
    },
    reflection: {
      en: 'Your energy may carry you far once your heart and your ambition agree on where to go.',
      hi: 'आपकी ऊर्जा शायद आपको दूर तक ले जाए, जब दिल और ललक एक ही मंज़िल पर राज़ी हों।',
    },
  },
  'feeling|steady': {
    pattern: 'stable_foundation',
    sentence: {
      en: 'A warm, caring heart held safely by a steady and dependable nature.',
      hi: 'एक गर्म, परवाह करने वाला दिल, जिसे स्थिर और भरोसेमंद स्वभाव सँभाले रखता है।',
    },
    reflection: {
      en: 'Your life may feel fullest when the people you care for and the ground you stand on grow together.',
      hi: 'आपकी ज़िंदगी शायद तब सबसे भरी लगे जब आपके अपने लोग और आपकी ज़मीन, दोनों साथ-साथ बढ़ें।',
    },
  },
  'growth|growth': {
    pattern: 'growth_oriented',
    sentence: {
      en: 'A forward-moving, energetic nature that keeps looking for change, challenge and new ground.',
      hi: 'आगे बढ़ने वाला, ऊर्जा भरा स्वभाव, जो बदलाव, चुनौती और नई ज़मीन ढूँढता रहता है।',
    },
    reflection: {
      en: 'Your growth may depend less on how fast you move than on which direction earns your full energy.',
      hi: 'आपका विकास शायद रफ़्तार पर कम, और इस पर ज़्यादा टिका है कि आप किस दिशा को पूरी ऊर्जा देते हैं।',
    },
  },
  'growth|steady': {
    pattern: 'mixed_transitional',
    sentence: {
      en: 'A settled, reliable base alongside a real pull toward change and new ground.',
      hi: 'एक जमी हुई, भरोसेमंद नींव, और साथ में बदलाव व नई ज़मीन की ओर सच्चा खिंचाव।',
    },
    reflection: {
      en: 'You may be in a season of balancing what keeps you secure with what keeps you growing.',
      hi: 'आप शायद ऐसे दौर में हैं जहाँ सुरक्षा देने वाली चीज़ों और आगे बढ़ाने वाली चीज़ों के बीच संतुलन बन रहा है।',
    },
  },
  'steady|steady': {
    pattern: 'stable_foundation',
    sentence: {
      en: 'Steady, patient progress, built on reliability and a strong sense of commitment.',
      hi: 'धीमी पर पक्की प्रगति, जो भरोसेमंदी और वादे निभाने की मज़बूत भावना पर टिकी है।',
    },
    reflection: {
      en: 'Your strength may lie in consistency, and the next step may simply be giving yourself a little more room to enjoy it.',
      hi: 'आपकी ताक़त शायद निरंतरता में है, और अगला कदम शायद बस ख़ुद को उसका थोड़ा आनंद लेने की छूट देना है।',
    },
  },
};

/** Overall sentence + reflection for the two patterns not reached by a family pair. */
export const SPECIAL_PATTERN_COPY: Record<'strong_conflicted' | 'insufficient', { sentence: Bilingual; reflection: Bilingual }> = {
  strong_conflicted: {
    sentence: {
      en: 'A strong nature with inner pulls in different directions, which can make choices feel weightier than they look.',
      hi: 'एक मज़बूत स्वभाव, जिसमें भीतर अलग-अलग दिशाओं के खिंचाव हैं, इसलिए फ़ैसले दिखने से ज़्यादा भारी लग सकते हैं।',
    },
    reflection: {
      en: 'Your different sides may not need settling, only understanding, so that each can have its place.',
      hi: 'आपके अलग-अलग पहलुओं को शायद सुलझाने की नहीं, समझने की ज़रूरत है, ताकि हर एक को अपनी जगह मिले।',
    },
  },
  insufficient: {
    sentence: {
      en: 'This photo did not give enough clear evidence for one overall picture of you.',
      hi: 'इस फोटो से इतने साफ़ संकेत नहीं मिले कि आपकी एक पूरी तस्वीर बनाई जा सके।',
    },
    reflection: {
      en: 'A clearer overall pattern may show up with a sharper, brighter photo.',
      hi: 'एक साफ़ और ज़्यादा रोशनी वाली तस्वीर से पूरा पैटर्न बेहतर दिख सकता है।',
    },
  },
};
