// stores/quiz.ts
import { $fetch } from 'ofetch'
import { defineStore } from 'pinia'
import type { Question } from '~/types/question'
import { mulberry32, shuffle } from '~/utils/rng'
import { isExactMatch } from '~/utils/scoring'
import { orderOptions } from '~/utils/options'

type Selections = Record<string, string[]>
type FlagMap = Record<string, boolean>
type AnswersMap = Record<string, string[]>

type StartConfig = {
  lang?: string        // e.g. 'en'
  filter?: string      // e.g. 'all' eller 'events,roles'
  max?: number         // "upp till" detta antal
  seed?: number | string
}

export const useQuizStore = defineStore('quiz', {
  state: () => ({
    questions: [] as Question[],
    index: 0,
    selections: {} as Selections,
    checked: {} as FlagMap,
    revealed: {} as FlagMap,
    finished: false,
    loading: false,
    error: null as string | null,
    answersById: {} as AnswersMap,

    // 🔎 Nytt: för /quiz-headern och felsökning
    lastConfig: null as null | { lang: string; filter: string; max: number; seed?: string | number },
  }),

  getters: {
    currentQuestion(state): Question | null {
      return state.questions[state.index] ?? null
    },
    getSelectedByQuestionId: (state) => (qid: string): string[] =>
      state.answersById[qid] ?? [],

    // ✅ används fortfarande av äldre vyer; Results-sidan räknar numera själv
    summary(state) {
      const total = state.questions.length
      const correctIds: string[] = []
      const incorrectIds: string[] = []

      for (const q of state.questions) {
        const sel = state.selections[q.id] || []
        if (sel.length === 0) continue
        if (isExactMatch(sel, q.correct)) correctIds.push(q.id)
        else incorrectIds.push(q.id)
      }

      const answered = correctIds.length + incorrectIds.length
      const correct = correctIds.length
      const incorrect = incorrectIds.length
      const remaining = total - answered
      const percent = total ? Math.round((correct / total) * 100) : 0

      return { total, answered, correct, incorrect, remaining, percent, correctIds, incorrectIds }
    }
  },

  actions: {
    /**
     * Starta session baserat på query-parametrar i /quiz:
     *   /quiz?lang=en&filter=all&max=60&seed=123
     */
    async startSessionFromRoute() {
      const route = useRoute()
      const lang   = ((route.query.lang as string)   || 'en').toLowerCase()
      const filter = (route.query.filter as string)  || 'all'
      const max    = Number(route.query.max ?? 60)   || 60
      const seedQ  = route.query.seed as string | undefined

      await this.startSession({
        lang,
        filter,
        max,
        seed: (seedQ !== undefined && String(seedQ).trim() !== '') ? seedQ : undefined
      })
    },

    /**
     * Huvudstart: server filtrerar på lang/filter, klient skär ner "upp till max".
     * Shuffle sker alltid; orderOptions respekterar lockOptionOrder.
     */
    async startSession(opts?: StartConfig) {
      this.loading = true
      this.error = null
      try {
        const lang   = (opts?.lang || 'en').toLowerCase()
        const filter = (opts?.filter ?? 'all') // 'all' eller csv: 'events,roles'
        const max    = typeof opts?.max === 'number' && opts!.max > 0 ? Math.floor(opts!.max) : 60

        // 1) Hämta serverfiltrerade frågor (Nuxt/Nitro API)
        const raw = await $fetch<Question[]>('/api/questions', {
          params: { lang, filter }
        })

        // 2) Välj RNG: seeded i tester om seed skickas, annars Math.random
        let rng = Math.random
        if (opts?.seed !== undefined && String(opts.seed).trim() !== '') {
          rng = mulberry32(opts.seed!)
        }

        // 3) Alltid shuffle (frågor + options per fråga)
        const shuffled = shuffle(raw, rng).map(q => ({
          ...q,
          options: orderOptions(q, rng) // ✅ respekterar lockOptionOrder
        }))

        // 4) "Upp till max"
        const take = Math.min(shuffled.length, max)
        this.questions = shuffled.slice(0, take)

        // 5) Nollställ interaktionsstate
        this.index = 0
        this.selections = {}
        this.checked = {}
        this.revealed = {}
        this.finished = false

        // 6) Spara config för UI/diagnostik
        this.lastConfig = { lang, filter, max, seed: opts?.seed }
      } catch (e: any) {
        console.error('Failed to start session:', e)
        this.error = e?.message || 'Network or server error'
        this.questions = []
        throw e
      } finally {
        this.loading = false
      }
    },

    setAnswer(qid: string, optionIds: string[]) {
      const unique = Array.from(new Set(optionIds))
      this.answersById[qid] = unique
    },
    resetAnswers() {
      this.answersById = {}
    },

    next() {
      if (this.index < this.questions.length - 1) this.index++
    },
    prev() {
      if (this.index > 0) this.index--
    },

    selectOption(qId: string, optionId: string) {
      const q = this.questions.find(x => x.id === qId)
      if (!q) return

      const prev = this.selections[qId] ?? []
      this.selections[qId] = q.type === 'single'
        ? [optionId]
        : (prev.includes(optionId) ? prev.filter(x => x !== optionId) : [...prev, optionId])

      // Nollställ status vid ändring
      this.checked[qId] = false
      // this.revealed[qId] = false // Behåll nuvarande policy: revealed oförändrat
    },

    check(qId: string) {
      const sel = this.selections[qId] ?? []
      if (sel.length === 0) return
      this.checked[qId] = true
    },

    reveal(qId: string) {
      this.revealed[qId] = !this.revealed[qId]
    },

    finish() {
      this.finished = true
      this.index = Math.min(this.index, this.questions.length - 1)
    },

    $reset() {
      this.questions = []
      this.index = 0
      this.selections = {}
      this.checked = {}
      this.revealed = {}
      this.finished = false
      this.loading = false
      this.error = null
      this.answersById = {}
      this.lastConfig = null
    }
  }
})
