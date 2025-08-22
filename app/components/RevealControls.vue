
<script setup lang="ts">
const props = withDefaults(defineProps<{
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
  <div class="flex flex-wrap items-center gap-3">
    <!-- Previous -->
    <button
      v-if="!hideDisabled || canPrev"
      class="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50"
      :class="!canPrev ? 'opacity-50 cursor-not-allowed hover:bg-white' : ''"
      :disabled="!canPrev"
      @click="$emit('prev')"
    >
      Previous
    </button>

    <!-- Check -->
    <button
      class="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50"
      :class="!canCheck ? 'opacity-50 cursor-not-allowed hover:bg-white' : ''"
      :disabled="!canCheck"
      @click="$emit('check')"
    >
      Check Answer
    </button>

    <!-- Reveal -->
    <button
      class="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50"
      :class="!canReveal ? 'opacity-50 cursor-not-allowed hover:bg-white' : ''"
      :disabled="!canReveal"
      :aria-expanded="revealed ? 'true' : 'false'"
      :aria-controls="controlsId"
      @click="$emit('reveal')"
    >
      {{ revealed ? 'Hide Explanation' : 'Show Explanation' }}
    </button>

    <!-- Next -->
    <button
      v-if="!hideDisabled || canNext"
      class="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50"
      :class="!canNext ? 'opacity-50 cursor-not-allowed hover:bg-white' : ''"
      :disabled="!canNext"
      @click="$emit('next')"
    >
      Next
    </button>

    <div class="ml-auto">
      <button class="px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800"
              @click="$emit('finish')">
        Finish
      </button>
    </div>
  </div>
</template>
  