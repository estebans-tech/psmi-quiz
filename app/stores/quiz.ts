import { defineStore } from 'pinia';
import type { Question } from '~/types/question';
import { isCorrect } from '~/utils/scoring';
import { loadQuestions } from '~/services/questionLoader';

type Selections = Record<string, string[]>;
type Flags = Record<string, boolean>;

export const useQuizStore = defineStore('quiz', {
  state: () => ({
    questions: [] as Question[],
    index: 0,
    selections: {} as Selections, // qId -> selected option ids
    checked: {} as Flags,         // qId -> user pressed "Check"
    revealed: {} as Flags,        // qId -> user pressed "Show Answer"
    finished: false
  }),

  getters: {
    currentQuestion(state): Question | undefined {
      return state.questions[state.index];
    },
    // computed correctness for any question id
    isCorrectById: (state) => (qId: string): boolean => {
      const q = state.questions.find(q => q.id === qId);
      if (!q) return false;
      const sel = state.selections[qId] ?? [];
      return isCorrect(q, sel);
    },
    summary(state) {
      const correctIds: string[] = [];
      const incorrectIds: string[] = [];
      for (const q of state.questions) {
        const sel = state.selections[q.id] ?? [];
        (isCorrect(q, sel) ? correctIds : incorrectIds).push(q.id);
      }
      return {
        total: state.questions.length,
        correctIds,
        incorrectIds
      };
    }
  },

  actions: {
    async startSession(opts?: { shuffleQuestions?: boolean }) {
      const bank = await loadQuestions();
      this.questions = opts?.shuffleQuestions ? shuffle(bank) : bank;
      this.index = 0;
      this.selections = {};
      this.checked = {};
      this.revealed = {};
      this.finished = false;
    },

    selectOption(qId: string, optionId: string) {
      const q = this.questions.find(x => x.id === qId);
      if (!q) return;
    
      const sel = this.selections[qId] ?? [];
    
      if (q.type === 'single') {
        this.selections[qId] = [optionId];
      } else {
        const i = sel.indexOf(optionId);
        this.selections[qId] = i === -1 ? [...sel, optionId] : sel.filter(x => x !== optionId);
      }
    
      // ✅ resetta status varje gång valet ändras
      this.checked[qId] = false;
    
      // (valfritt) göm svaret igen om användaren ändrar valet
      // this.revealed[qId] = false;
    },

    check(qId: string) {
      const sel = this.selections[qId] ?? []
      if (sel.length === 0) return // gör ingenting om inget är valt
      this.checked[qId] = true
    },

    reveal(qId: string) {
      this.revealed[qId] = !this.revealed[qId];  // toggle
    },

    next() {
      if (this.index < this.questions.length - 1) this.index += 1;
    },

    prev() {
      if (this.index > 0) this.index -= 1;
    },

    finish() {
      this.finished = true;
    }
  }
});

// Local utility to shuffle arrays without leaking outside the store
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}