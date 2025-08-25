<script setup lang="ts">
import { computed } from 'vue'
import ResultCard from '~/components/ResultCard.vue'
import type { Question } from '~/types/question'

type Filter = 'all' | 'correct' | 'incorrect'
type SelectionsMap = Record<string, string[]> // samma shape som store.selections

const props = defineProps<{
  questions: Question[]
  selections: SelectionsMap
  filter: Filter
}>()

function isQuestionCorrect(q: Question, selected: string[]): boolean {
  // exakt mängd-jämförelse (binärt rätt/fel)
  const chosen = new Set(selected ?? [])
  const correct = new Set(q.correct ?? [])
  if (chosen.size !== correct.size) return false
  for (const id of chosen) if (!correct.has(id)) return false
  return true
}

// Bygg rader i EXAKT den ordning frågorna kom (ingen sortering)
const rows = computed(() =>
  (props.questions ?? []).map(q => {
    const selected = props.selections?.[q.id] ?? []
    return {
      question: q,
      answer: { questionId: q.id, selectedOptionIds: selected },
      correct: isQuestionCorrect(q, selected),
    }
  })
)

// Filtrera på frågenivå (all/correct/incorrect)
const filteredRows = computed(() => {
  if (props.filter === 'correct') return rows.value.filter(r => r.correct)
  if (props.filter === 'incorrect') return rows.value.filter(r => !r.correct)
  return rows.value
})
</script>

<template>
  <!-- Rendera listan av kort – ResultCard har redan ARIA för alternativen -->
  <div class="space-y-6">
    <ResultCard
      v-for="r in filteredRows"
      :key="r.question.id"
      :question="r.question"
      :answer="r.answer"
    />
  </div>
</template>
