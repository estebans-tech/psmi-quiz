import type { Question } from '~/types/question';

export function isExactMatch(selection: string[], correct: string[]): boolean {
  if (selection.length !== correct.length) return false;
  const sel = new Set(selection);
  for (const id of correct) if (!sel.has(id)) return false;
  return true;
}

export function isCorrect(question: Question, selection: string[]): boolean {
  // single & multi both use exact match
  return isExactMatch(selection, question.correct);
}