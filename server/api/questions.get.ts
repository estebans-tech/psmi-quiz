import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { defineEventHandler, getQuery, setResponseStatus } from 'h3'

/**
 * GET /api/questions?lang=en
 * Server-only: läser JSON från server-filsystemet och returnerar som array.
 * OBS: Ingen auth → alla som anropar endpointen får frågorna.
 */
export default defineEventHandler(async (event) => {
  const { lang = 'en' } = getQuery(event) as { lang?: string }
  const filePath = join(process.cwd(), 'server', 'data', String(lang), 'core.json')

  try {
    const json = await readFile(filePath, 'utf-8')
    const questions = JSON.parse(json)
    return questions
  } catch (err: any) {
    setResponseStatus(event, 500)
    return { error: `Failed to load questions for lang="${lang}": ${err?.message || 'unknown error'}` }
  }
})
