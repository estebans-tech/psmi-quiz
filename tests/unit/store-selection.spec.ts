import { describe, it, expect } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useQuizStore } from '~/stores/quiz'

describe('selection resets checked status', () => {
  it('clears checked when selection changes', () => {
    setActivePinia(createPinia())
    const s = useQuizStore()
    s.questions = [{
      id: 'q1', type: 'single', prompt: 'p', version: 1,
      options: [{id:'a',text:'A',explanation:'e'},{id:'b',text:'B',explanation:'e'}],
      correct: ['a']
    }]

    s.selectOption('q1','b')
    s.check('q1')
    expect(s.checked['q1']).toBe(true)

    // ändra valet
    s.selectOption('q1','a')

    // ✔ acceptera både false och undefined (bägge betyder “inte checkad”)
    expect(Boolean(s.checked['q1'])).toBe(false)
  })
})

