  
  <script setup lang="ts">
  import { onMounted, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useQuizStore } from '~/stores/quiz'
  
  const store = useQuizStore()
  const route = useRoute()
  const router = useRouter()
  
  onMounted(async () => {
    if (store.questions.length === 0) {
      const shuffle = route.query.shuffle === '1' || route.query.shuffle === 'true'
      await store.startSession({ shuffleQuestions: shuffle })
    }
  })
  
  const q = computed(() => store.currentQuestion)
  const index = computed(() => store.index)
  const total = computed(() => store.questions.length)
  const checked = computed(() => store.checked)
  const revealed = computed(() => store.revealed)
  const selectedIds = computed(() => (q.value ? (store.selections[q.value.id] ?? []) : []))
  const currRevealed = computed(() => q.value ? (store.revealed[q.value.id] ?? false) : false)
  const explanationsId = computed(() => q.value ? `explanations-${q.value.id}` : undefined)

  const currHasSelection = computed(() => {
    if (!q.value) return false
    const sel = store.selections[q.value.id] ?? []
    return sel.length > 0
  })
  
  function onSelect(optionId: string) {
    if (!q.value) return
    store.selectOption(q.value.id, optionId)
  }
  
  function onFinish() {
    store.finish()
    router.push('/results')
  }
  </script>
  <template>
    <main class="min-h-screen bg-gray-50">
      <header class="sticky top-0 bg-white border-b">
        <div class="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <h1 class="text-lg font-semibold">Scrum PSM I - Actual Exam Questions</h1>
          <div class="text-sm text-gray-600">
            Question <span>{{ index + 1 }}</span> / <span>{{ total }}</span>
          </div>
        </div>
      </header>
  
      <section class="mx-auto max-w-4xl px-4 py-6 space-y-6">
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
          :can-check="!!q && currHasSelection"
          :can-reveal="!!q"
          :is-last="index === total - 1"
          :revealed="currRevealed"
          @prev="store.prev()"
          @next="store.next()"
          @check="q && store.check(q.id)"
          @reveal="q && store.reveal(q.id)"  
          @finish="onFinish"
        />
      </section>
    </main>
  </template>
  