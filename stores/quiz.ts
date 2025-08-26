import { $fetch } from 'ofetch'
import { defineStore } from 'pinia'
import type { Question } from '~/types/question'
import { mulberry32, shuffle } from '~/utils/rng'
import { isExactMatch } from '~/utils/scoring'
import { orderOptions } from '~/utils/options'

type Selections = Record<string, string[]>
type FlagMap = Record<string, boolean>
type AnswersMap = Record<string, string[]>

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
    answersById: {} as AnswersMap, // <-- tydlig, typad källa för svaren
  }),

  getters: {
    currentQuestion(state): Question | null {
      return state.questions[state.index] ?? null
    },
    getSelectedByQuestionId: (state) => (qid: string): string[] =>
      state.answersById[qid] ?? [],
  
    // ✅ används av Results-sidan (KPI och filter)
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
    async startSession(opts?: { seed?: number | string; lang?: string }) {
      this.loading = true
      this.error = null
      try {
        const lang = (opts?.lang || 'en').toLowerCase()
        // Hämta frågorna från server-API (Nuxt/Nitro)
        const raw = await $fetch<Question[]>(`/api/questions?lang=${encodeURIComponent(lang)}`)

        // Välj RNG: seeded i tester om seed skickas, annars Math.random
        let rng = Math.random
        if (opts?.seed !== undefined && String(opts.seed).trim() !== '') {
          rng = mulberry32(opts.seed!)
        }

        // Alltid shuffle
        const shuffled = shuffle(raw, rng)
        this.questions = shuffled.map(q => ({
          ...q,
          options: orderOptions(q, rng) // ✅ respekterar lockOptionOrder
        }))

        // Nollställ state
        this.index = 0
        this.selections = {}
        this.checked = {}
        this.revealed = {}
        this.finished = false
      } catch (e: any) {
        // Spara fel så UI kan visa
        console.error('Failed to start session:', e)
        this.error = e?.message || 'Network or server error'
        throw e
      } finally {
        this.loading = false
      }
    },
    setAnswer(qid: string, optionIds: string[]) {
      // håll ordningen stabil, ta bort dubbletter
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
      // Vi låter revealed vara oförändrat (policy nu). Vill du dölja auto? avkommentera:
      // this.revealed[qId] = false
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
      // explicit reset (används av “Back to start”)
      this.questions = []
      this.index = 0
      this.selections = {}
      this.checked = {}
      this.revealed = {}
      this.finished = false
      this.loading = false
      this.error = null
    }
  }
})
