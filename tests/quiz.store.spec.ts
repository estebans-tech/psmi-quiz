import { describe, it, expect } from 'vitest';
import { validateQuestion, validateQuestionBank, QuestionValidationError } from '~/utils/validation';
import type { Question } from '~/types/question';

const base: Question = {
  id: 'ok',
  type: 'single',
  prompt: 'p',
  options: [{id:'a',text:'A',explanation:'e'},{id:'b',text:'B',explanation:'e'}],
  correct: ['a'],
  version: 1
};

describe('validation', () => {
  it('accepts valid question', () => {
    expect(() => validateQuestion(base)).not.toThrow();
  });

  it('rejects single with multiple correct', () => {
    const q = { ...base, correct: ['a','b'] };
    expect(() => validateQuestion(q)).toThrow(QuestionValidationError);
  });

  it('rejects unknown correct id', () => {
    const q = { ...base, correct: ['z'] };
    expect(() => validateQuestion(q)).toThrow(QuestionValidationError);
  });

  it('bank rejects duplicate ids', () => {
    const q2 = { ...base, id: 'ok' };
    expect(() => validateQuestionBank([base, q2])).toThrow(QuestionValidationError);
  });
});
