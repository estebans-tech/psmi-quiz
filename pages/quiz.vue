<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuizStore } from '~/stores/quiz'

import QuestionCard from '~/components/QuestionCard.vue'
import RevealControls from '~/components/RevealControls.vue'
import ConfirmDialog from '~/components/ConfirmDialog.vue'

import { DEFAULT_MAX, DEFAULT_MODE } from '~/constants/quiz'
import { useAppConfig } from 'nuxt/app'

const app = useAppConfig()
const router = useRouter()
const route = useRoute()
const store = useQuizStore()

// ----- load / reload session from query -----
async function loadFromQuery() {
  if (typeof store.startSessionFromRoute === 'function') {
    await store.startSessionFromRoute()
  } else {
    const lang   = (route.query.lang as string)   || 'en'
    const filter = (route.query.filter as string) || 'all'
    const max    = Number(route.query.max ?? DEFAULT_MAX) || DEFAULT_MAX
    const seed   = route.query.seed as string | undefined
    const mode   = (route.query.mode as string) || DEFAULT_MODE
    await store.startSession({ lang, filter, max, seed, mode: mode as any })
  }
}
watch(() => route.fullPath, () => { void loadFromQuery() }, { immediate: true })

// ----- derived -----
const total = computed(() => store.questions?.length ?? 0)
const hasSession = computed(() => total.value > 0)
const idx = computed(() => store.index)
const q = computed(() => store.currentQuestion)

const selectedIds = computed<string[]>(() => (q.value ? (store.selections[q.value.id] ?? []) : []))
const isChecked   = computed<boolean>(() => (q.value ? !!store.checked[q.value.id]   : false))
const isRevealed  = computed<boolean>(() => (q.value ? !!store.revealed[q.value.id]  : false))

const explId = computed(() => q.value ? `explanations-${q.value.id}` : undefined)

const canPrev   = computed(() => idx.value > 0)
const canNext   = computed(() => idx.value < total.value - 1)
const canCheck  = computed(() => q.value ? (store.selections[q.value.id]?.length ?? 0) > 0 : false)
const canReveal = computed(() => !!q.value)
const isLast    = computed(() => idx.value === total.value - 1)

const hasAnyAnswer = computed(() =>
  Object.values(store.selections).some(arr => (arr?.length ?? 0) > 0)
)

// ----- SR-status när sista frågan nås -----
const srStatus = ref('')
watch([idx, total], ([i, t], [pi, pt]) => {
  if (t > 0 && i === t - 1 && (pi !== i || pt !== t)) {
    srStatus.value = 'Last question. Next is disabled. Use Finish to see results.'
  } else {
    srStatus.value = ''
  }
})

// ----- ConfirmDialog: Back & Restart -----
const showConfirmBack = ref(false)
const showConfirmRestart = ref(false)

function requestBackToStart() {
  const shouldConfirm = hasAnyAnswer.value || store.index > 0
  if (!shouldConfirm) return doBackToStart()
  showConfirmBack.value = true
}
function doBackToStart() {
  if (typeof store.$reset === 'function') store.$reset()
  router.push('/')
}

function requestRestart() {
  const shouldConfirm = hasAnyAnswer.value || store.index > 0
  if (!shouldConfirm) return doRestart()
  showConfirmRestart.value = true
}
async function doRestart() {
  const cfg = store.lastConfig ?? { lang: 'en', filter: 'all', max: DEFAULT_MAX, mode: DEFAULT_MODE }
  await store.startSession(cfg as any)
}

// ----- handlers -----
function onSelect(optionId: string) {
  if (!q.value) return
  store.selectOption(q.value.id, optionId)
}
function onCheck() {
  if (!q.value) return
  if ((store.selections[q.value.id] ?? []).length === 0) return
  store.check(q.value.id)
}
async function onReveal() {
  if (!q.value) return
  const wasOpen = !!store.revealed[q.value.id]
  store.reveal(q.value.id)
  const nowOpen = !wasOpen
  if (nowOpen) {
    await nextTick()
    const id = `explanations-${q.value.id}`
    document.getElementById(id)?.focus()
  }
}
function goPrev() { store.prev() }
function goNext() { store.next() }
function finishAndGoResults() {
  store.finish()
  router.push('/results')
}
</script>

<template>
  <main class="min-h-screen bg-gray-50 flex flex-col">
    <!-- HEADER -->
    <header class="bg-white border-b">
      <div class="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
        <div>
          <h1 class="text-lg font-semibold">Scrum PSMI - Quiz</h1>
          <p v-if="store.lastConfig" class="text-xs text-gray-500 mt-1">
            <!-- Mode: <span class="font-medium">{{ store.lastConfig.mode || 'study' }}</span> · -->
            Using: <span class="font-medium">{{ store.lastConfig.filter }}</span>
            <!-- max <span class="font-medium">{{ store.lastConfig.max }}</span> -->
            <!-- <span v-if="store.lastConfig.seed"> · seed {{ store.lastConfig.seed }}</span> -->
          </p>
          <!-- 🔊 SR-annons när sista frågan nås -->
          <p v-if="srStatus" class="sr-only" role="status" aria-live="polite">{{ srStatus }}</p>
        </div>
        <div class="flex items-center gap-3">
          <button class="text-sm underline hover:no-underline" @click="requestRestart">
            Restart
          </button>
          <button class="text-sm underline hover:no-underline" @click="requestBackToStart">
            Back to start
          </button>
        </div>
      </div>
    </header>

    <!-- BODY -->
    <section class="mx-auto w-full max-w-5xl px-4 py-6 flex-1">
      <div v-if="store.loading" class="text-sm text-gray-600">Loading questions…</div>

      <div v-else-if="store.error"
           class="rounded-xl border border-red-300 bg-red-50 p-4 text-red-900" role="alert">
        <div class="font-semibold mb-1">Failed to load</div>
        <p class="text-sm">{{ store.error }}</p>
        <button class="mt-3 underline" @click="requestBackToStart">Back to start</button>
      </div>

      <div v-else-if="!hasSession" class="text-sm text-gray-600">
        No questions available for this selection.
        <button class="underline ml-1" @click="requestBackToStart">Back to start</button>
      </div>

      <div v-else class="space-y-6">
        <!-- Question -->
        <QuestionCard
          v-if="q"
          :question="q"
          :selected-ids="selectedIds"
          :checked="isChecked"
          :revealed="isRevealed"
          :explanations-id="explId"
          :current="idx + 1"
          :total="total"
          @select="onSelect"
        />

        <!-- Controls -->
        <RevealControls
          :can-prev="canPrev"
          :can-next="canNext"
          :can-check="canCheck"
          :can-reveal="canReveal"
          :is-last="isLast"
          :revealed="isRevealed"
          :controls-id="explId"
          @prev="goPrev"
          @next="goNext"
          @check="onCheck"
          @reveal="onReveal"
          @finish="finishAndGoResults"
        />
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="bg-white border-t">
      <div class="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
        <BuyMeCoffeeButton :slug="app.bmcSlug" variant="subtle" label="Buy me a coffee" class="hidden" />

        <span class="text-xs text-gray-500">
          {{ total }} question{{ total === 1 ? '' : 's' }} loaded
        </span>
      </div>
    </footer>

    <!-- Confirm Dialogs -->
    <ConfirmDialog
      v-model:open="showConfirmBack"
      title="Leave quiz and reset?"
      message="This will reset your current session and take you back to the start page."
      confirm-text="Reset & Go Back"
      cancel-text="Cancel"
      :destructive="true"
      @confirm="doBackToStart"
    />
    <ConfirmDialog
      v-model:open="showConfirmRestart"
      title="Restart quiz?"
      message="This will reset your current progress and start this quiz over with the same settings."
      confirm-text="Restart"
      cancel-text="Cancel"
      :destructive="true"
      @confirm="doRestart"
    />
  </main>
</template>
