<template>
  <div class="space-y-4">
    <article v-for="q in filtered" :key="q.id" class="rounded-2xl bg-white shadow p-4">
      <h3 class="font-medium">{{ q.prompt }}</h3>

      <div class="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <div class="text-xs uppercase text-gray-500">Your selection</div>
          <div class="break-words">{{ (selections[q.id] || []).join(', ') || '—' }}</div>
        </div>
        <div>
          <div class="text-xs uppercase text-gray-500">Correct</div>
          <div class="break-words">{{ q.correct.join(', ') }}</div>
        </div>
        <div>
          <div class="text-xs uppercase text-gray-500">Explanation</div>
          <p class="mt-1 text-sm text-gray-700">
            {{ q.explanation || '—' }}
          </p>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Question } from '~/types/question'
import { isExactMatch } from '~/utils/scoring'

type Filter = 'all' | 'correct' | 'incorrect'

const props = withDefaults(defineProps<{
  questions?: Question[]
  selections?: Record<string, string[]>
  filter?: Filter
}>(), {
  questions: () => [],
  selections: () => ({}),
  filter: 'all'
})

const filtered = computed(() => {
  const qs = props.questions
  if (props.filter === 'all') return qs
  return qs.filter(q => {
    const sel = props.selections[q.id] || []
    const ok = isExactMatch(sel, q.correct)
    return props.filter === 'correct' ? ok : !ok
  })
})
</script>
