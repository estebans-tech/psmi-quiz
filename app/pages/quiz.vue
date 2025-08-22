<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '~/stores/quiz'
import QuestionCard from '~/components/QuestionCard.vue'
import RevealControls from '~/components/RevealControls.vue'

const router = useRouter()
const store = useQuizStore()

onMounted(async () => {
  if (store.questions.length === 0) {
    try {
      await store.startSession({ lang: 'en' }) // alltid shuffle i store
    } catch {
      // store.error har redan satts; UI hanterar visning
    }
  }
})

const q = computed(() => store.currentQuestion)
const index = computed(() => store.index)
const total = computed(() => store.questions.length)
const checked = computed(() => store.checked)
const selectedIds = computed(() => (q.value ? (store.selections[q.value.id] ?? []) : []))
const currRevealed = computed(() => q.value ? (store.revealed[q.value.id] ?? false) : false)
const explanationsId = computed(() => q.value ? `explanations-${q.value.id}` : undefined)

function onSelect(optionId: string) { if (q.value) store.selectOption(q.value.id, optionId) }
function onFinish() { store.finish(); router.push('/results') }
function backToStart() { store.$reset(); router.push('/') }
</script>

<template>
  <main class="min-h-screen bg-gray-50">
    <header class="bg-white border-b sticky top-0 z-10">
      <div class="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
        <button @click="backToStart" class="text-sm underline hover:no-underline">
          Back to start
        </button>
        <div class="text-sm text-gray-600">Mode: Study</div>
      </div>
    </header>

    <section class="mx-auto max-w-4xl px-4 py-6 space-y-6">
      <!-- Loading / error -->
      <div v-if="store.loading" class="text-sm text-gray-600">Loading questions…</div>

      <div v-else-if="store.error" class="rounded-lg border border-rose-300 bg-rose-50 p-4 text-rose-800">
        <p class="font-medium">Could not load questions.</p>
        <p class="text-sm">{{ store.error }}</p>
        <button class="mt-3 underline" @click="backToStart">Back to start</button>
      </div>

      <template v-else>
        <QuestionCard
          :question="q"
          :selected-ids="selectedIds"
          :checked="checked[q?.id || ''] || false"
          :revealed="currRevealed"
          :explanations-id="explanationsId"
          :current="index + 1"
          :total="total"
          @select="onSelect"
        />

        <RevealControls
          :can-prev="index > 0"
          :can-next="index < total - 1"
          :can-check="!!q && (selectedIds?.length ?? 0) > 0"
          :can-reveal="!!q"
          :is-last="index === total - 1"
          :revealed="currRevealed"
          :controls-id="explanationsId"
          @prev="store.prev()"
          @next="store.next()"
          @check="q && store.check(q.id)"
          @reveal="q && store.reveal(q.id)"
          @finish="onFinish"
        />
      </template>
    </section>
  </main>
</template>
