import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadQuestions(lang = 'en') {
  // Anpassa stigen om din testsökväg skiljer sig. Här: app/tests/unit → server/data/en/core.json
  const file = resolve(__dirname, '../../server/assets', lang, 'core.json')
  const json = readFileSync(file, 'utf-8')
  return JSON.parse(json) as any[]
}

describe('question data sanity', () => {
  it('unique ids, correct refs, TF locked and ordered', () => {
    const data = loadQuestions('en')
    const ids = new Set<string>()

    for (const q of data) {
      // unika fråge-id:n
      expect(ids.has(q.id)).toBe(false)
      ids.add(q.id)

      // correct måste peka på befintliga option-ids
      const optionIds = new Set(q.options.map((o: any) => o.id))
      for (const c of q.correct) expect(optionIds.has(c)).toBe(true)

      // Heuristisk sanity: om exakt True/False i text → kräv lås + ordning
      const texts = q.options.map((o: any) => String(o.text).trim().toLowerCase())
      if (texts.length === 2 && texts.includes('true') && texts.includes('false')) {
        expect(q.lockOptionOrder).toBe(true)
        expect(texts[0]).toBe('true')
        expect(texts[1]).toBe('false')
      }
    }
  })
})