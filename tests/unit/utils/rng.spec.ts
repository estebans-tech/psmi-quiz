import { describe, it, expect } from 'vitest'
import { mulberry32, shuffle } from '~/utils/rng'

describe('mulberry32', () => {
  it('är deterministisk för samma seed', () => {
    const a = mulberry32(123), b = mulberry32(123)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })
  it('ger värden i [0,1)', () => {
    const r = mulberry32(1)
    for (let i = 0; i < 1000; i++) {
      const x = r()
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThan(1)
    }
  })
})

describe('shuffle med seed', () => {
  it('ger samma ordning för samma seed', () => {
    const src = [1,2,3,4,5]
    const a = shuffle(src, mulberry32(42))
    const b = shuffle(src, mulberry32(42))
    expect(a).toEqual(b)
    expect(a).not.toEqual(src) // sannolikt om längden > 1
  })
  it('ger olika ordning för olika seed', () => {
    const src = [1,2,3,4,5,6]
    const a = shuffle(src, mulberry32(1))
    const c = shuffle(src, mulberry32(2))
    expect(a).not.toEqual(c)
  })
})
