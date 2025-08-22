import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import QuestionCard from '~/components/QuestionCard.vue'

describe('QuestionCard – progress (position mode)', () => {
  it('sets ARIA correctly for 3/10', () => {
    const w = mount(QuestionCard, { props: { current: 3, total: 10 } })
    const bar = w.get('[role="progressbar"]')
    expect(bar.attributes('aria-valuemin')).toBe('1')
    expect(bar.attributes('aria-valuemax')).toBe('10')
    expect(bar.attributes('aria-valuenow')).toBe('3')
    expect(bar.attributes('aria-valuetext')).toBe('Question 3 of 10')
  })

  it('renders visual width ≈ 30%', () => {
    const w = mount(QuestionCard, { props: { current: 3, total: 10 } })
    const fill = w.get('[role="progressbar"] > div')
    // width sätts inline via style. Vi kollar procent-strängen.
    expect(fill.attributes('style')).toContain('width: 30%')
  })

  it('clamps values: current > total -> now = total', () => {
    const w = mount(QuestionCard, { props: { current: 999, total: 7 } })
    const bar = w.get('[role="progressbar"]')
    expect(bar.attributes('aria-valuenow')).toBe('7')
    expect(bar.attributes('aria-valuetext')).toBe('Question 7 of 7')
  })
})
