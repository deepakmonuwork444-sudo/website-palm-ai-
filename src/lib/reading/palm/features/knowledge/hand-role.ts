// COPIED from palm-ai-new--feat-m1-foundation/src/features/knowledge/hand-role.ts at app commit fbc2232d837f (2026-09-30).
// Do not edit by hand: change the app, then run `node scripts/sync-palm-lib.mjs` (ARCHITECTURE.md F7).
// @ts-nocheck
import type { Dominance } from '../observation/schema';

import type { RuleCitation } from './types';

/**
 * What the hand being read stands for: the hand a person uses most, or the
 * other one. Shown on every report, so a left-hand and a right-hand reading
 * of the same palm never read as the same thing. When we do not know which
 * hand the person uses most, or they use both, the note says so and applies
 * neither role (DEC-014): "unknown" is never read as the other hand.
 *
 * The book says it of the RIGHT and LEFT hand: the right "denotes the
 * developed or active brain, the left only giving the natural tendencies or
 * inclinations" (Cheiro, Palmistry for All, 1916, ch. XVII). That the right
 * hand means the writing hand — so a left-handed reader swaps them — is the
 * later convention, not the book's; the text says so as "in palmistry
 * tradition" rather than putting it in Cheiro's mouth.
 *
 * Not a KbRule: it describes the hand, it reads no feature on it.
 */

export interface HandRoleNote {
  title: { en: string; hi: string };
  body: { en: string; hi: string };
  cites: RuleCitation[];
}

const CITES: RuleCitation[] = [
  { sourceId: 'cheiro-palmistry-for-all-1916', locator: 'Part I, ch. XVII — Right and Left Hands' },
];

/** Said of both hands: the book's reading, then the convention that maps it to the writing hand. */
export const HAND_ROLE_CONVENTION = {
  en: 'The book reads the right hand as what a person has developed and the left as what they were born with. In palmistry tradition this is taken to mean the hand you write with and the other hand.',
  hi: 'किताब दाएँ हाथ को वह मानती है जो इंसान ने अपने जीवन में बनाया, और बाएँ हाथ को वह जो जन्म से मिला। हस्तरेखा परंपरा में इसका मतलब लिखने वाला हाथ और दूसरा हाथ माना जाता है।',
};

export const HAND_ROLE_NOTES: Record<Dominance, HandRoleNote> = {
  dominant: {
    title: { en: 'What this hand says: what you have built', hi: 'यह हाथ क्या बताता है: आपने क्या बनाया' },
    body: {
      en: 'This is your writing hand. Tradition reads it as the life you have shaped so far and are shaping now — your present and where you are heading. Your other hand shows what you started with.',
      hi: 'यह आपका लिखने वाला हाथ है। परंपरा में इसे वह जीवन माना जाता है जो आपने अब तक बनाया और अभी बना रहे हैं — आपका आज और आप किस ओर बढ़ रहे हैं। दूसरा हाथ दिखाता है कि शुरुआत में आपके पास क्या था।',
    },
    cites: CITES,
  },
  non_dominant: {
    title: { en: 'What this hand says: what you were born with', hi: 'यह हाथ क्या बताता है: जन्म से क्या मिला' },
    body: {
      en: 'This is not your writing hand. Tradition reads it as your natural tendencies — the potential you were born with, before life and effort shaped it. Your writing hand shows what you have made of it.',
      hi: 'यह आपका लिखने वाला हाथ नहीं है। परंपरा में इसे आपकी स्वाभाविक प्रवृत्ति माना जाता है — वह क्षमता जो जन्म से मिली, जीवन और मेहनत से बदलने से पहले। लिखने वाला हाथ दिखाता है कि आपने उससे क्या बनाया।',
    },
    cites: CITES,
  },
  ambidextrous: {
    title: { en: 'What this hand says: both hands alike', hi: 'यह हाथ क्या बताता है: दोनों हाथ बराबर' },
    body: {
      en: 'You use both hands, so the tradition of one writing hand and one other hand is not applied. This hand is read on its own, for what its lines show.',
      hi: 'आप दोनों हाथ इस्तेमाल करते हैं, इसलिए परंपरा का लिखने वाला हाथ और दूसरा हाथ वाला बँटवारा यहाँ लागू नहीं होता। यह हाथ अपने आप में पढ़ा गया है — जो इसकी रेखाएँ दिखाती हैं।',
    },
    cites: CITES,
  },
  unknown: {
    title: { en: 'What this hand says: read on its own', hi: 'यह हाथ क्या बताता है: अपने आप में' },
    body: {
      en: 'We do not know which hand you use most, so this reading is not framed as the writing hand or the other hand. It is read on its own, for what its lines show.',
      hi: 'हमें नहीं पता कि आप कौन-सा हाथ सबसे ज़्यादा इस्तेमाल करते हैं, इसलिए यह रीडिंग लिखने वाले हाथ या दूसरे हाथ के रूप में नहीं पढ़ी गई। यह हाथ अपने आप में पढ़ा गया है — जो इसकी रेखाएँ दिखाती हैं।',
    },
    cites: CITES,
  },
};
