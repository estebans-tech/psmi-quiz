import type { Question } from '~/types/question';

export class QuestionValidationError extends Error {
  constructor(message: string, public questionId?: string) {
    super(message);
    this.name = 'QuestionValidationError';
  }
}

export function validateQuestion(q: Question): void {
  if (!q || typeof q !== 'object') throw new QuestionValidationError('Question must be an object');
  if (!q.id) throw new QuestionValidationError('Missing question.id');
  if (q.type !== 'single' && q.type !== 'multi') {
    throw new QuestionValidationError('type must be "single" or "multi"', q.id);
  }
  if (!Array.isArray(q.options) || q.options.length < 2) {
    throw new QuestionValidationError('options must have at least 2 items', q.id);
  }
  const optionIds = new Set(q.options.map(o => o.id));
  if (optionIds.size !== q.options.length) {
    throw new QuestionValidationError('option ids must be unique', q.id);
  }
  if (!Array.isArray(q.correct) || q.correct.length < 1) {
    throw new QuestionValidationError('correct must be a non-empty string[]', q.id);
  }
  for (const cid of q.correct) {
    if (!optionIds.has(cid)) {
      throw new QuestionValidationError(`correct references unknown option id: ${cid}`, q.id);
    }
  }
  if (q.type === 'single' && q.correct.length !== 1) {
    throw new QuestionValidationError('single questions must have exactly 1 correct option', q.id);
  }
  // ⛔️ borttagit kravet på option.explanation
  if (typeof q.prompt !== 'string' || q.prompt.trim() === '') {
    throw new QuestionValidationError('prompt must be a non-empty string', q.id);
  }
  if (typeof q.version !== 'number') {
    throw new QuestionValidationError('version must be a number', q.id);
  }

  // (valfritt) mjuk varning om frågan saknar question.explanation
  if (!q.explanation || q.explanation.trim() === '') {
     
    console.warn(`[question ${q.id}] has no question-level explanation.`);
  }
}

export function validateQuestionBank(questions: Question[]): Question[] {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new QuestionValidationError('Question bank must be a non-empty array');
  }
  const seen = new Set<string>();
  for (const question of questions) {
    validateQuestion(question);
    if (seen.has(question.id)) throw new QuestionValidationError(`Duplicate question id: ${question.id}`, question.id);
    seen.add(question.id);
  }

  return questions;
}
