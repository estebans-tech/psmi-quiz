import { ALLOWED_CATEGORIES, type Category, isCategory } from '~/constants/categories'

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
  const known = uniq.filter(isCategory)                // ✅ typesafe
  const unknown = uniq.filter(t => !isCategory(t))
  if (unknown.length) console.warn('[questions] Ignored unknown filters:', unknown)

  return (known.length ? known : [...ALLOWED_CATEGORIES]) as Category[]
}

/** Ladda en kategori-fil. Saknas fil => [] och varning. Parsefel => kastas (500). */
export async function loadCategoryFile(lang: 'en', cat: Category): Promise<QuestionOut[]> {
  const key = `${lang}/${cat}.json`

  // 1) Försök läsa via Nitro server assets (Netlify-kompatibelt)
  try {
    const storage = useStorage<'raw'>('assets:server') // basename i nuxt.config.ts
    const raw = await storage.getItemRaw(key)             // Buffer | null
    if (raw) {
      const arr = JSON.parse(raw.toString('utf-8')) as Question[]
      return arr.map(q => ({ ...q, category: cat }))
    }
  } catch (e) {
    // Om det här kastar är det troligen ett packningsproblem; vi faller vidare.
    console.warn(`[questions] assets read failed for ${key}:`, (e as any)?.message ?? e)
  }

  // 2) I prod (Netlify): om vi kom hit returnerar vi tomt och loggar nyckeln
  console.warn(`[questions] No asset found for key "${key}" (check nitro.serverAssets baseName/dir).`)
  return []
}

/** Huvud-API för routern: returnerar sammanslagen lista (ingen server-shuffle). */
export async function loadQuestions(langRaw?: string, filterRaw?: string | string[]): Promise<QuestionOut[]> {
  const lang = normalizeLang(langRaw)
  const cats = parseFilter(filterRaw)
  const chunks = await Promise.all(cats.map(c => loadCategoryFile(lang, c)))
  return chunks.flat()
}
