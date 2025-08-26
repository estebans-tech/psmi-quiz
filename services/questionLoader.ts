import type { Question } from '~/types/question';
import { validateQuestionBank } from '~/utils/validation';

// Fisher–Yates
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/**
 * Load questions from the bundled JSON.
 * If an individual question has `shuffle: true`, its options are shuffled.
 */
export async function loadQuestions(): Promise<Question[]> {
  // Static import keeps things simple and vite-friendly.
  const data = (await import('~/server/assets/en/core.json')).default as Question[];
  const bank = validateQuestionBank(data);

  // Option-level shuffle, controlled per question
  return bank.map(q => {
    if (q.shuffle) {
      return { ...q, options: shuffle(q.options) };
    }
    return q;
  });
}