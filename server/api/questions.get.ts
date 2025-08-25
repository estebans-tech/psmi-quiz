import { defineEventHandler, getQuery, setResponseStatus } from 'h3'
import { loadQuestions } from '../utils/questions'

/**
 * GET /api/questions?lang=en
 * Server-only: läser JSON från server-filsystemet och returnerar som array.
 * OBS: Ingen auth → alla som anropar endpointen får frågorna.
 */

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const lang = typeof q.lang === 'string' ? q.lang : undefined
  const filter = q.filter as string | string[] | undefined

  try {
    const data = await loadQuestions(lang, filter)
    return data
  } catch (err: any) {
    console.error('[questions] Failed to load:', err?.message || err)
    setResponseStatus(event, 500)
    return { error: 'Failed to load questions' }
  }
})