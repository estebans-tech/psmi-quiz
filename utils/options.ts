import type { Question, QuestionOption } from '~/types/question'
import { shuffle as shuffleFn } from '~/utils/rng'

/** Shuffla options om inte frågan är låst. Returnerar en NY array. */
export function orderOptions(q: Question, rng: () => number): QuestionOption[] {
  return q.lockOptionOrder === true ? q.options.slice() : shuffleFn(q.options, rng)
}