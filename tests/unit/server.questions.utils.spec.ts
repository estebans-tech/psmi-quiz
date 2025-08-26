import { describe, it, expect, vi } from 'vitest'
import { parseFilter, normalizeLang, ALLOWED_CATEGORIES } from '../../server/utils/questions'

describe('questions utils', () => {
  it('normalizeLang: only en; others fallback with warning', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(normalizeLang()).toBe('en')
    expect(normalizeLang('en')).toBe('en')
    expect(normalizeLang('sv')).toBe('en')
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('parseFilter: csv happy path', () => {
    expect(parseFilter('values,events')).toEqual(['values','events'])
  })

  it('parseFilter: all or empty => all categories', () => {
    expect(parseFilter()).toEqual(ALLOWED_CATEGORIES)
    expect(parseFilter('')).toEqual(ALLOWED_CATEGORIES)
    expect(parseFilter('all')).toEqual(ALLOWED_CATEGORIES)
  })

  it('parseFilter: unknowns are ignored (warn) and known kept', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(parseFilter('values,xyz')).toEqual(['values'])
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('parseFilter: if only unknowns, fallback to all', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(parseFilter('nope,xyz')).toEqual(ALLOWED_CATEGORIES)
    spy.mockRestore()
  })
})
