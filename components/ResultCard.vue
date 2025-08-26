
<script setup lang="ts">
import { computed } from 'vue'
import type { Question } from '~/types/question'

interface UserAnswer {
  questionId: string
  selectedOptionIds: string[]
}

const props = defineProps<{
  question: Question
  answer: UserAnswer
}>()

// Id-hjälpare för ARIA-kopplingar
const promptId = `prompt-${props.question.id}`
const labelId = (optId: string) => `label-${props.question.id}-${optId}`
const explanationId = (optId: string) => `exp-${props.question.id}-${optId}`

const correctSet = computed(() => new Set(props.question.correct))
const chosenSet  = computed(() => new Set(props.answer.selectedOptionIds))

function optionContainerClasses(optId: string) {
  const chosen  = chosenSet.value.has(optId)
  const correct = correctSet.value.has(optId)

  // Vald = ljusgrå bg; grön ram om korrekt, röd ram om fel; ej vald = neutral
  return [
    'rounded-lg p-3 border transition-colors',
    chosen && correct ? 'border-green-500 bg-gray-50' : '',
    chosen && !correct ? 'border-red-500 bg-gray-50' : '',
    !chosen ? 'border-gray-200 bg-white' : ''
  ]
}

// Frågenivåns binära bedömning för rubriken i boxen
const isQuestionCorrect = computed(() => {
  const chosen = chosenSet.value
  const correct = correctSet.value
  if (chosen.size !== correct.size) return false
  for (const id of chosen) if (!correct.has(id)) return false
  return true
})
</script>

<template>
  <article class="rounded-xl border p-4 bg-white">
    <!-- Frågeprompt (label för listboxen) -->
    <h3 :id="promptId" class="font-semibold mb-4">{{ question.prompt }}</h3>

    <!-- Ingen sortering: exakt samma ordning som question.options -->
    <ul
      class="space-y-2"
      role="listbox"
      :aria-labelledby="promptId"
      aria-label="Resultatlista för svarsalternativ"
      aria-multiselectable="true"
    >
      <li
        v-for="opt in question.options"
        :key="opt.id"
        role="option"
        :aria-selected="chosenSet.has(opt.id) ? 'true' : 'false'"
        :aria-describedby="explanationId(opt.id)"
        :class="optionContainerClasses(opt.id)"
      >
        <!-- Grid: vänster = text+förklaring, höger = centrerad ✓ om korrekt -->
        <div class="grid grid-cols-[1fr_auto] items-stretch gap-3">
          <!-- Vänster kolumn: text + förklaring -->
          <div>
            <div class="flex items-center gap-2">
              <!-- Inga A/B-prefix -->
              <span :id="labelId(opt.id)">{{ opt.text }}</span>
              <!-- SR-hjälp: markera 'vald' för skärmläsare -->
              <span v-if="chosenSet.has(opt.id)" class="sr-only">(selected)</span>
            </div>

            <!-- Per-option explanation: alltid synlig (kan vara tom) -->
            <div
              :id="explanationId(opt.id)"
              class="text-sm text-gray-600 mt-1 min-h-[1.25rem]"
            >
              <span v-if="opt.explanation" class="ml-1">{{ opt.explanation ?? '' }}</span>
            </div>
          </div>

          <!-- Höger kolumn: ✓ om korrekt, centrerad -->
          <div class="min-w-8 px-1 flex items-center justify-center">
            <span
              v-if="correctSet.has(opt.id)"
              class="leading-none text-green-600 text-2xl font-bold select-none"
              aria-hidden="true"
              title="Korrekt alternativ"
            >✓</span>
            <!-- SR-text för korrekt-ikon -->
            <span v-if="correctSet.has(opt.id)" class="sr-only">Correct alternative</span>
          </div>
        </div>
      </li>
    </ul>

    <!-- Frågans generella förklaring i box med rubrik Correct!/Incorrect -->
    <div
      class="mt-4 rounded-md border p-3 text-sm"
      :class="isQuestionCorrect ? 'bg-green-50 text-green-900' : 'border-red-300 bg-red-50 text-red-900'"
    >
      <div class="mb-1 font-semibold" role="heading" aria-level="4">
        {{ isQuestionCorrect ? 'Correct!' : 'Incorrect' }}
      </div>
      <div class="text-[0.95rem]">
        <span class="ml-1">{{ question.explanation ?? '' }}</span>
        <template v-if="question.source">
          <span class="mx-2">•</span>
          <span class="font-semibold">Source:</span>
          <span class="ml-1">{{ question.source }}</span>
        </template>
      </div>
    </div>
  </article>
</template>
