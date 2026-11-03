import { offlineQuestions } from './offlineQuestions.ts';
import { englishQuestions } from './englishQuestions.ts';
import { internationalQuestions } from './internationalQuestions.ts';
import { spanishQuestions } from './spanishQuestions.ts';
import { languageQuestions } from './languageQuestions.ts';
import { freshLocalQuestionReserve } from './freshQuestions.ts';
import { curatedHebrewQuestions } from './curatedHebrewQuestions.ts';
import { correctionFor } from './questionCorrections.ts';

export type LocalAnswerKey = { id: number; correct: number };

/** Every bundled bank a local question can be served from. The answer lookup must
 *  cover exactly the banks the question picker draws from — when it did not
 *  (language and Spanish banks were missing), tapping an answer silently did nothing. */
export const bundledQuestionBanks: readonly (readonly LocalAnswerKey[])[] = [
  englishQuestions, offlineQuestions, freshLocalQuestionReserve,
  internationalQuestions, spanishQuestions, languageQuestions, curatedHebrewQuestions,
];

export function findLocalQuestion<T extends LocalAnswerKey>(id: number | undefined, extra: readonly T[] = []): LocalAnswerKey | T | undefined {
  if (typeof id !== 'number') return undefined;
  for (const bank of bundledQuestionBanks) {
    const hit = bank.find(q => q.id === id);
    if (hit) {
      // A reviewed correction (approved appeal) changes how the bundled question is scored too.
      const fix = correctionFor(id);
      return fix ? { ...hit, correct: fix.correct } : hit;
    }
  }
  return extra.find(q => q.id === id);
}

/** True when the question ships inside the app (its corrections are applied on the device). */
export function isBundledQuestion(id: number | undefined): boolean {
  return typeof id === 'number' && bundledQuestionBanks.some(bank => bank.some(q => q.id === id));
}
