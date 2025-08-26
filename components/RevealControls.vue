
<script setup lang="ts">
withDefaults(defineProps<{
  canPrev?: boolean
  canNext?: boolean
  canCheck?: boolean
  canReveal?: boolean
  isLast?: boolean,
  hideDisabled?: boolean
  revealed?: boolean 
  controlsId?: string        // 👈 id på regionen som visas/döljs
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
  <!-- Toolbar: DOM-ordning styr tabbning; CSS styr visuell placering -->
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3" role="toolbar" aria-label="Question controls">
    <!-- Vänster kluster: Prev + Next (visuellt ihop) -->
    <div class="order-1 flex items-center gap-3">
      <!-- NEXT — 1 i tabbning (först i DOM) men visas höger om Prev via CSS order -->
      <button
        v-if="!hideDisabled || canNext"
        class="order-2 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!canNext"
        @click="$emit('next')"
      >
        Next
      </button>

      <!-- PREVIOUS — 2 i tabbning (andra i DOM), neutral stil -->
      <button
        v-if="!hideDisabled || canPrev"
        class="order-1 px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!canPrev"
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
        :aria-expanded="revealed ? 'true' : 'false'"
        :aria-controls="controlsId"
        @click="$emit('reveal')"
      >
        {{ revealed ? 'Hide Explanation' : 'Show Explanation' }}
      </button>

      <button
        class="px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!canCheck"
        @click="$emit('check')"
      >
        Check Answer
      </button>
    </div>

    <!-- Höger kluster: Finish — tydligt separerad -->
    <div class="order-3 sm:ml-auto sm:pl-6 sm:border-l sm:border-gray-200">
      <button
        class="px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800"
        @click="$emit('finish')"
        aria-describedby="finish-hint"
      >
        Finish
      </button>
      <p id="finish-hint" class="sr-only">Ends the session and shows results.</p>
    </div>
  </div>
</template>
  