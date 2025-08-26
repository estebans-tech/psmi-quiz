<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Question } from '~/types/question'
import OptionItem from '~/components/OptionItem.vue'
import { isExactMatch } from '~/utils/scoring'

const props = withDefaults(defineProps<{
  question?: Question | null
  selectedIds?: string[]
  checked?: boolean
  revealed?: boolean
  explanationsId?: string
  /** 1-based current question index shown to the user (e.g., 3) */
  current?: number
  /** total number of questions (e.g., 10) */
  total?: number
}>(), {
  question: null,
  selectedIds: () => [],
  checked: false,
  revealed: false,
  explanationsId: undefined,
  current: 1,
  total: 1,
})

defineEmits<{ (e: 'select', optionId: string): void }>()
const correctSet = computed(() => new Set(props.question?.correct ?? []))

const hasSelection = computed(() => (props.selectedIds?.length ?? 0) > 0)
const isCurrentCorrect = computed(() =>
  props.question ? isExactMatch(props.selectedIds ?? [], props.question.correct) : false
)

const safeTotal = computed(() => Math.max(1, props.total!))
const safeCurrent = computed(() => Math.max(1, Math.min(props.current!, safeTotal.value)))

// ARIA + visuell bredd: POSITION (3 av 10)
const ariaNow = safeCurrent
const ariaValueText = computed(() => `Question ${safeCurrent.value} of ${safeTotal.value}`)
const progressPct = computed(() => Math.round((ariaNow.value / safeTotal.value) * 100))

// SR-only live announcements (oförändrat i sak)
const liveMsg = ref('')
watch(
  () => [props.checked, props.revealed, isCurrentCorrect.value],
  ([checked, revealed], [prevChecked, prevRevealed]) => {
    if (checked && checked !== prevChecked) {
      liveMsg.value = `Checked: ${isCurrentCorrect.value ? 'Correct' : 'Incorrect'}.`
      return
    }
    if (revealed !== prevRevealed) {
      liveMsg.value = revealed ? 'Explanation shown.' : 'Explanation hidden.'
    }
  }
)

// ids för a11y-kopplingar
const hintId = computed(() => props.question ? `hint-${props.question.id}` : undefined)
const explLabelId = computed(() => props.question ? `expl-label-${props.question.id}` : undefined)
const explRegionId = computed(() => props.explanationsId ?? (props.question ? `explanations-${props.question.id}` : undefined))
</script>

<template>
  <div class="rounded-2xl bg-white shadow p-6">
    <!-- Card header -->
    <div class="mb-3 flex items-center justify-between">
      <span class="text-xs font-medium uppercase tracking-wide">Question</span>
      <div class="flex items-center gap-3">
        <!-- Visuellt vill vi oftast visa position (3/10) oavsett ariaMode -->
        <span class="text-xs font-medium tabular-nums" aria-hidden="true">
          {{ safeCurrent }}<span class="mx-0.5 text-gray-400">/</span>{{ safeTotal }}</span>

          <div
class="relative h-1.5 w-28 rounded-full bg-gray-300"
            role="progressbar"
            aria-label="Progress"
            :aria-valuemin="1"
            :aria-valuemax="safeTotal"
            :aria-valuenow="ariaNow"
            :aria-valuetext="ariaValueText">
          <div
class="absolute inset-y-0 left-0 rounded-full bg-green-600 transition-[width] duration-300"
              :style="{ width: progressPct + '%' }"></div>
        </div>
      </div>
    </div>

    <fieldset
class="space-y-4"
      :aria-describedby="question?.type === 'multi' ? hintId : undefined">
      <legend class="text-base md:text-md font-light text-slate-700">
        {{ question?.prompt || 'Question prompt goes here…' }}
      </legend>

      <!-- 🔊 Status för skärmläsare -->
      <div class="sr-only" aria-live="polite" role="status">{{ liveMsg }}</div>

      <!-- Hint endast för multi -->
      <p v-if="question?.type === 'multi'" :id="hintId" class="text-sm text-gray-600">
        Select all that apply.
      </p>

      <!-- Alternativ -->
      <ul v-if="question" class="mt-3 space-y-2">
        <li v-for="opt in question.options" :key="opt.id">
          <OptionItem
            :option="opt"
            :name="`q-${question.id}`"
            :input-type="question.type === 'single' ? 'radio' : 'checkbox'"
            :selected="selectedIds?.includes(opt.id) || false"
            :is-correct="correctSet.has(opt.id)"
            :show-solution="false"
            @toggle="() => $emit('select', opt.id)"
            @choose="() => $emit('select', opt.id)"
          />
        </li>
      </ul>


      <!-- Statusrad (Correct/Incorrect/No selection) -->
      <div class="mt-3" role="status" aria-live="polite">
        <p v-if="checked" class="text-sm">
          <span v-if="hasSelection"
                class="inline-flex items-center rounded-full px-2 py-0.5"
                :class="isCurrentCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'">
            {{ isCurrentCorrect ? 'Correct' : 'Incorrect' }}
          </span>
          <span v-else class="inline-flex items-center rounded-full px-2 py-0.5 bg-gray-100 text-gray-800">
            No selection
          </span>
        </p>
      </div>

      <!-- Förklaringsregion som knappen styr -->
      <div
        v-if="revealed && (question?.explanation ?? '').trim().length > 0"
        :id="explRegionId"
        role="region"
        :aria-labelledby="explLabelId"
        tabindex="-1"
        class="mt-3"
      >
        <h2 :id="explLabelId" class="sr-only">Answer explanation</h2>
        <p class="text-sm text-gray-700">
          {{ question!.explanation }}
        </p>
      </div>
    </fieldset>
  </div>
</template>
