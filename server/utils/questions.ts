import { readFile } from 'node:fs/promises'
import { join } from 'node:path'


export const ALLOWED_CATEGORIES = ['theory','values','team','events','artifacts', 'roles'] as const
export type Category = typeof ALLOWED_CATEGORIES[number]

export interface QuestionOption { id: string; text: string }
export interface Question {
  id: string
  type: 'single' | 'multi'
  prompt: string
  options: QuestionOption[]
  correct: string[]
  explanation: string
  version: number
  /** true = keep JSON order (no shuffle), false/undefined = shuffle */
  lockOptionOrder?: boolean
}
export interface QuestionOut extends Question {
  category: Category
}

/** Normalisera språk. Just nu bara 'en'. Andra språk loggas och faller tillbaka till 'en'. */
export function normalizeLang(raw?: string): 'en' {
  if (!raw || raw.toLowerCase() === 'en') return 'en'
  console.warn(`[questions] Unsupported lang "${raw}", falling back to "en".`)
  return 'en'
}

/** Parsar CSV-filter. Okända kategorier ignoreras (loggas). Tomt/all => alla. */
export function parseFilter(raw?: string | string[]): Category[] {
  if (!raw) return [...ALLOWED_CATEGORIES]
  const str = Array.isArray(raw) ? raw.join(',') : raw
  const tokens = str.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
  if (tokens.length === 0 || tokens.includes('all')) return [...ALLOWED_CATEGORIES]

  const uniq = Array.from(new Set(tokens))
  const known = uniq.filter(t => (ALLOWED_CATEGORIES as readonly string[]).includes(t))
  const unknown = uniq.filter(t => !known.includes(t))
  if (unknown.length) console.warn('[questions] Ignored unknown filters:', unknown)
  return (known.length ? known : [...ALLOWED_CATEGORIES]) as Category[]
}

/** Ladda en kategori-fil. Saknas fil => [] och varning. Parsefel => kastas (500). */
export async function loadCategoryFile(lang: 'en', cat: Category): Promise<QuestionOut[]> {
  const filePath = join(process.cwd(), 'server', 'data', lang, `${cat}.json`)
  try {
    const json = await readFile(filePath, 'utf-8')
    const arr = JSON.parse(json) as Question[]
    return arr.map(q => ({ ...q, category: cat }))
  } catch (err: any) {
    if (err?.code === 'ENOENT') {
      console.warn(`[questions] Missing file for category "${cat}" at ${filePath} — skipping.`)
      return []
    }
    // Riktigt parse/IO-fel: bubbla upp så handlern svarar 500.
    throw err
  }
}

/** Huvud-API för routern: returnerar sammanslagen lista (ingen server-shuffle). */
export async function loadQuestions(langRaw?: string, filterRaw?: string | string[]): Promise<QuestionOut[]> {
  const lang = normalizeLang(langRaw)
  const cats = parseFilter(filterRaw)
  const chunks = await Promise.all(cats.map(c => loadCategoryFile(lang, c)))
  return chunks.flat()
}
