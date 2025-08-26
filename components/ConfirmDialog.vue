<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = withDefaults(defineProps<{
  /** v-model */
  open: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  destructive?: boolean
}>(), {
  title: 'Are you sure?',
  message: 'This action cannot be undone.',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  destructive: false
})

const emit = defineEmits<{
  (e: 'update:open', v: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const dialogEl = ref<HTMLElement | null>(null)
const lastActive = ref<HTMLElement | null>(null)

function close(via: 'cancel' | 'confirm' | 'esc' | 'backdrop') {
  emit('update:open', false)
  if (via === 'confirm') emit('confirm')
  else emit('cancel')
  // återställ fokus till tidigare element
  lastActive.value?.focus()
}

function onKeydown(e: KeyboardEvent) {
  if (!props.open) return
  if (e.key === 'Escape') {
    e.preventDefault()
    close('esc')
  } else if (e.key === 'Tab') {
    // enkel fokusfälla
    const root = dialogEl.value
    if (!root) return
    const focusables = root.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (!focusables.length) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    const active = document.activeElement as HTMLElement | null
    if (e.shiftKey) {
      if (active === first || !root.contains(active)) {
        e.preventDefault()
        last!.focus()
      }
    } else {
      if (active === last) {
        e.preventDefault()
        first!.focus()
      }
    }
  }
}

watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    lastActive.value = document.activeElement as HTMLElement | null
    document.documentElement.classList.add('overflow-hidden')
    await nextTick()
    // fokusera första knappen i dialogen
    const firstBtn = dialogEl.value?.querySelector<HTMLElement>('button')
    firstBtn?.focus()
    window.addEventListener('keydown', onKeydown)
  } else {
    document.documentElement.classList.remove('overflow-hidden')
    window.removeEventListener('keydown', onKeydown)
  }
})

onMounted(() => {
  if (props.open) document.documentElement.classList.add('overflow-hidden')
})
onBeforeUnmount(() => {
  document.documentElement.classList.remove('overflow-hidden')
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <teleport to="body">
    <transition name="fade" appear>
      <div v-if="open"
           class="fixed inset-0 z-50 flex items-center justify-center"
           aria-labelledby="dialog-title"
           role="dialog" aria-modal="true">
        <!-- overlay -->
        <div class="absolute inset-0 bg-black/40" @click="close('backdrop')" />

        <!-- panel -->
        <transition name="scale" appear>
          <div ref="dialogEl"
               class="relative z-10 w-full max-w-md rounded-2xl bg-white p-5 shadow-xl outline-none"
          >
            <h2 id="dialog-title" class="text-base font-semibold">
              {{ title }}
            </h2>
            <p class="mt-2 text-sm text-gray-600">
              {{ message }}
            </p>

            <div class="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                class="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50"
                @click="close('cancel')"
              >
                {{ cancelText }}
              </button>
              <button
                type="button"
                class="px-4 py-2 rounded-xl"
                :class="destructive
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-black text-white hover:bg-gray-800'"
                @click="close('confirm')"
              >
                {{ confirmText }}
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 150ms linear; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.scale-enter-active, .scale-leave-active { transition: transform 150ms ease, opacity 150ms linear; }
.scale-enter-from, .scale-leave-to { transform: scale(0.98); opacity: 0; }
</style>
