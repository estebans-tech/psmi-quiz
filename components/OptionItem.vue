
<script setup lang="ts">
import type { QuestionOption } from '~/types/question'
withDefaults(defineProps<{
  option?: QuestionOption | null
  selected?: boolean
  isCorrect?: boolean
  showSolution?: boolean // ⬅️ Styr om vi får färga
  inputType?: 'radio' | 'checkbox'
  name?: string
}>(), {
  option: null,
  selected: false,
  isCorrect: false,
  showSolution: false,
  inputType: 'radio',
  name: undefined
})

const emit = defineEmits<{ (e: 'toggle'): void }>()

function onChange() { emit('toggle') }
</script>
<template>
  <label class="flex items-start gap-3 cursor-pointer">
    <input
      :type="inputType"
      :name="name"
      class="mt-1 h-5 w-5"
      :checked="selected"
      @change="onChange"
    />
    <div class="flex-1">
      <div
        class="font-normal inline-block px-1 rounded ring-0 ring-offset-0"
        :class="{
          'ring-2 ring-emerald-500': showSolution && isCorrect,
          'ring-2 ring-rose-500': showSolution && selected && !isCorrect
        }"
      >
        {{ option?.text || 'Option text…' }}
      </div>
    </div>
  </label>
</template>