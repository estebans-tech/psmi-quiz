// stores/quiz.ts
import { $fetch } from 'ofetch'
import { defineStore } from 'pinia'
import { useRoute } from 'vue-router'
import type { Question } from '~/types/question'
import { mulberry32, shuffle } from '~/utils/rng'
import { isExactMatch } from '~/utils/scoring'
import { orderOptions } from '~/utils/options'

// ✅ delade konstanter/guards
import {
  DEFAULT_MAX,
  normalizeMax,
  DEFAULT_MODE,
  normalizeMode,
  type Mode
} from '~/constants/quiz'

type Selections = Record<string, string[]>
type FlagMap = Record<string, boolean>
type AnswersMap = Record<string, string[]>

type StartConfig = {
  lang?: string
  filter?: string
  max?: number | string
  seed?: number | string
  mode?: Mode
}

const PREFS_KEY = 'quiz.prefs'
type Prefs = {
  lang: string
  filter: string
  max: number
  seed?: string | number
  mode?: Mode
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

    // ✅ nu med komplett typ (inkl. mode)
    lastConfig: null as null | {
      lang: string
      filter: string
      max: number
      seed?: string | number
      mode: Mode
    },
  }),

  getters: {
    currentQuestion(state): Question | null {
      return state.questions[state.index] ?? null
    },
    getSelectedByQuestionId: (state) => (qid: string): string[] =>
      state.answersById[qid] ?? [],

    // (behålls för ev. KPI i UI; Results räknar själv ändå)
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
    // ---- prefs (client only) ----
    readPrefs(): Prefs | null {
      if (typeof localStorage === 'undefined') return null
      try {
        const raw = localStorage.getItem(PREFS_KEY)
        if (!raw) return null
        const p = JSON.parse(raw) as Prefs | null
        if (!p || typeof p !== 'object') return null

        // Normalisera säkert
        const lang = (p.lang || 'en').toLowerCase()
        const filter = (p.filter || 'all')
        const max = normalizeMax(p.max ?? DEFAULT_MAX)
        const mode = normalizeMode(p.mode ?? DEFAULT_MODE)
        const seed = p.seed

        return { lang, filter, max, seed, mode }
      } catch {
        return null
      }
    },
    savePrefs(p: Prefs) {
      if (typeof localStorage === 'undefined') return
      try {
        localStorage.setItem(PREFS_KEY, JSON.stringify(p))
      } catch {}
    },

    // ---- session start via URL ----
    async startSessionFromRoute() {
      const route = useRoute()
      const lang   = ((route.query.lang as string)   || 'en').toLowerCase()
      const filter = (route.query.filter as string)  || 'all'
      const max    = normalizeMax(route.query.max ?? DEFAULT_MAX)
      const seedQ  = route.query.seed as string | undefined
      const mode   = normalizeMode(route.query.mode ?? DEFAULT_MODE)

      await this.startSession({ lang, filter, max, seed: seedQ, mode })
    },

    // ---- huvudstart ----
    async startSession(opts?: StartConfig) {
      this.loading = true
      this.error = null
      try {
        const lang   = (opts?.lang || 'en').toLowerCase()
        const filter = (opts?.filter ?? 'all')
        const max    = normalizeMax(opts?.max ?? DEFAULT_MAX)
        const mode   = normalizeMode(opts?.mode ?? DEFAULT_MODE)
        const seedIn = opts?.seed

        // Hämta (server filtrerar på lang/filter)
        const raw = await $fetch<Question[]>('/api/questions', {
          params: { lang, filter }
        })

        // RNG (seeded om finns)
        let rng = Math.random
        if (seedIn !== undefined && String(seedIn).trim() !== '') {
          rng = mulberry32(seedIn)
        }

        // Shuffle & ordna options (respektera lockOptionOrder)
        const shuffled = shuffle(raw, rng).map(q => ({
          ...q,
          options: orderOptions(q, rng)
        }))

        // Upp till max
        const take = Math.min(shuffled.length, max)
        this.questions = shuffled.slice(0, take)

        // Reset interaktions-state
        this.index = 0
        this.selections = {}
        this.checked = {}
        this.revealed = {}
        this.finished = false

        // ✅ lastConfig komplett & normaliserad
        this.lastConfig = { lang, filter, max, seed: seedIn, mode }

        // ✅ spara prefs
        this.savePrefs(this.lastConfig)
      } catch (e: any) {
        console.error('Failed to start session:', e)
        this.error = e?.message || 'Network or server error'
        this.questions = []
        throw e
      } finally {
        this.loading = false
      }
    },

    // ---- answers API (om du använder det) ----
    setAnswer(qid: string, optionIds: string[]) {
      const unique = Array.from(new Set(optionIds))
      this.answersById[qid] = unique
    },
    resetAnswers() {
      this.answersById = {}
    },

    // ---- navigation ----
    next() { if (this.index < this.questions.length - 1) this.index++ },
    prev() { if (this.index > 0) this.index-- },

    // ---- selection/check/reveal ----
    selectOption(qId: string, optionId: string) {
      const q = this.questions.find(x => x.id === qId)
      if (!q) return
      const prev = this.selections[qId] ?? []
      this.selections[qId] = q.type === 'single'
        ? [optionId]
        : (prev.includes(optionId) ? prev.filter(x => x !== optionId) : [...prev, optionId])

      this.checked[qId] = false
      // this.revealed[qId] = false // behåll policy: lämna oförändrat
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
