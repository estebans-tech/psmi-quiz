<template>
  <a
    :href="`https://buymeacoffee.com/${slug}`"
    target="_blank"
    rel="noopener noreferrer"
    :class="classes"
    aria-label="Support this project"
  >
    <span aria-hidden>☕</span>
    <span v-if="variant !== 'icon'">{{ label }}</span>
    <span v-else class="sr-only">{{ label }}</span>
  </a>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  slug: string
  variant?: 'subtle' | 'link' | 'icon'
  label?: string
}>(), {
  variant: 'subtle',
  label: 'Support'
})

/**
 * Färgerna är anpassade för ljus bakgrund (vit/grå) för att matcha din app:
 * - subtle: diskret “pill” med ljus grå bakgrund
 * - link: enkel textlänk
 * - icon: liten ikonknapp med ring
 */
const classes = computed(() => {
  if (props.variant === 'link') {
    return 'text-gray-600 hover:text-gray-900 underline decoration-gray-300 hover:decoration-gray-700 text-xs '
  }
  if (props.variant === 'icon') {
    return 'inline-flex items-center gap-2 p-2 rounded-xl text-gray-700 bg-white hover:bg-gray-50 ring-1 ring-gray-300 transition text-xs '
  }
  // subtle (default)
  return 'inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 ring-1 ring-gray-200 transition text-xs '
})
</script>
