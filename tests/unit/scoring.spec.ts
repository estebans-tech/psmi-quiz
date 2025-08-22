import { describe, it, expect } from 'vitest';
import { isExactMatch, isCorrect } from '~/utils/scoring';
import type { Question } from '~/types/question';

describe('scoring', () => {
  it('exact match works order-independently', () => {
    expect(isExactMatch(['a','c'], ['c','a'])).toBe(true);
    expect(isExactMatch(['a'], ['a','b'])).toBe(false);
    expect(isExactMatch(['a','b'], ['a'])).toBe(false);
  });

  it('isCorrect works for single and multi', () => {
    const single: Question = {
      id: 'q1', type: 'single', prompt: 'p', version: 1, shuffle: false,
      options: [{id:'a',text:'A',explanation:'e'},{id:'b',text:'B',explanation:'e'}],
      correct: ['b']
    };
    const multi: Question = {
      id: 'q2', type: 'multi', prompt: 'p', version: 1, shuffle: false,
      options: [
        {id:'a',text:'A',explanation:'e'},
        {id:'b',text:'B',explanation:'e'},
        {id:'c',text:'C',explanation:'e'}
      ],
      correct: ['a','c']
    };

    expect(isCorrect(single, ['b'])).toBe(true);
    expect(isCorrect(single, ['a'])).toBe(false);

    expect(isCorrect(multi, ['a','c'])).toBe(true);
    expect(isCorrect(multi, ['c','a'])).toBe(true);
    expect(isCorrect(multi, ['a'])).toBe(false);
    expect(isCorrect(multi, ['a','b','c'])).toBe(false);
  });
});
