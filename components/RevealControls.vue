<script setup lang="ts">
withDefaults(defineProps<{
  canPrev?: boolean
  canNext?: boolean
  canCheck?: boolean
  canReveal?: boolean
  isLast?: boolean
  hideDisabled?: boolean
  revealed?: boolean
  controlsId?: string
}>(), {
  canPrev: false,
  canNext: true,
  canCheck: true,
  canReveal: true,
  isLast: false,
  hideDisabled: false,
  revealed: false,
  controlsId: undefined
})

defineEmits<{
  (e: 'prev'): void
  (e: 'next'): void
  (e: 'check'): void
  (e: 'reveal'): void
  (e: 'finish'): void
}>()
</script>

<template>
  <!-- DOM-ordning = tabb-ordning; layout separerar Finish -->
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3"
       role="toolbar" aria-label="Question controls">

    <!-- 🔊 SR-status när sista frågan är nådd -->
    <p v-if="isLast" class="sr-only" role="status" aria-live="polite">
      Last question. Next is disabled. Use Finish to see results.
    </p>

    <!-- Vänster kluster: Prev + Next -->
    <div class="order-1 flex items-center gap-3">
      <!-- NEXT — först i DOM = första i Tab -->
      <button
        v-if="!hideDisabled || canNext"
        :class="[
          'order-2 px-4 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed',
          // På sista frågan: neutral (som Prev) + disabled
          (isLast
            ? 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
            // Annars: primär grön
            : 'bg-emerald-600 text-white hover:bg-emerald-700')
        ]"
        :disabled="isLast || !canNext"
        :aria-disabled="(isLast || !canNext) ? 'true' : 'false'"
        title="Next"
        @click="$emit('next')"
      >
        Next
      </button>

      <!-- PREVIOUS — neutral -->
      <button
        v-if="!hideDisabled || canPrev"
        class="order-1 px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!canPrev"
        :aria-disabled="!canPrev ? 'true' : 'false'"
        title="Previous"
        @click="$emit('prev')"
      >
        Previous
      </button>
    </div>

    <!-- Mittenkluster: Reveal + Check -->
    <div class="order-2 flex items-center gap-3">
      <button
        class="px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!canReveal"
        :aria-disabled="!canReveal ? 'true' : 'false'"
        :aria-expanded="revealed ? 'true' : 'false'"
        :aria-controls="controlsId"
        title="Show or hide explanation"
        @click="$emit('reveal')"
      >
        {{ revealed ? 'Hide Explanation' : 'Show Explanation' }}
      </button>

      <button
        class="px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!canCheck"
        :aria-disabled="!canCheck ? 'true' : 'false'"
        title="Check your answer"
        @click="$emit('check')"
      >
        Check Answer
      </button>
    </div>

    <!-- Höger kluster: Finish — tydligt separerad -->
    <div class="order-3 sm:ml-auto sm:pl-6 sm:border-l sm:border-gray-200">
      <button
        :class="[
          'px-4 py-2 rounded-xl',
          // På sista frågan: grön primär; annars svart
          (isLast ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-black text-white hover:bg-gray-800')
        ]"
        :aria-describedby="isLast ? 'finish-last-hint' : 'finish-hint'"
        title="Finish and see results"
        @click="$emit('finish')"
      >
        Finish
      </button>
      <p id="finish-hint" class="sr-only">Ends the session and shows results.</p>
      <p id="finish-last-hint" class="sr-only">You are on the last question. Finish will submit and show results.</p>
    </div>
  </div>
</template>
