<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '~/stores/quiz'
import { ALLOWED_CATEGORIES, type Category, isCategory } from '~/constants/categories'

const router = useRouter()
const store = useQuizStore()

const allCats = ALLOWED_CATEGORIES
type Cat = Category

const selectedCats = ref<('all' | Cat)[]>(['all'])
const maxOptions = [20, 30, 60, 80, 100, 120] as const
const selectedMax = ref<(typeof maxOptions)[number]>(60)

const isAll = computed(() => selectedCats.value.includes('all'))
const effectiveCats = computed<Cat[]>(() => isAll.value ? [...allCats] : (selectedCats.value as Cat[]))

function toggleAll(checked: boolean) { selectedCats.value = checked ? ['all'] : [] }
function toggleCat(cat: Cat, checked: boolean) {
  const set = new Set(selectedCats.value); set.delete('all')
  if (checked) set.add(cat); else set.delete(cat)
  selectedCats.value = Array.from(set) as any
}

// ✅ Läs prefs och förifyll
onMounted(() => {
  const prefs = store.readPrefs?.()
  if (!prefs) return
  // max
  if (maxOptions.includes(prefs.max as any)) selectedMax.value = prefs.max as any
  // filter
  if (prefs.filter === 'all') {
    selectedCats.value = ['all']
  } else {
    const cats = (prefs.filter || '')
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(isCategory) as Cat[]
    if (cats.length) selectedCats.value = cats
  }
})

function start() {
  const lang = 'en'
  const filter = isAll.value ? 'all' : effectiveCats.value.join(',')
  const max = String(selectedMax.value)
  router.push({ path: '/quiz', query: { lang, filter, max } })
}
</script>

<template>
  <main class="min-h-screen grid place-items-center bg-gray-50">
    <div class="bg-white shadow rounded-2xl p-6 w-full max-w-md space-y-5">
      <h1 class="text-xl font-semibold">Scrum PSMI - Trainer</h1>
      <p class="text-sm text-gray-600">
        Practice Professional Scrum Master (PSM I) questions. Questions are shuffled on start.
      </p>

      <!-- Kategorier -->
      <fieldset class="rounded-xl border p-4">
        <legend class="font-semibold">Choose categories</legend>
        <div class="mt-3 space-y-2">
          <!-- All -->
          <label
            class="flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer"
            :class="isAll ? 'border-black bg-gray-50' : 'border-gray-300 bg-white'"
          >
            <input
              type="checkbox"
              :checked="isAll"
              @change="toggleAll(($event.target as HTMLInputElement).checked)"
              aria-label="All categories"
            />
            <span>All</span>
          </label>

          <!-- Specifika kategorier -->
          <label
            v-for="cat in allCats"
            :key="cat"
            class="flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer"
            :class="isAll
              ? 'opacity-50 cursor-not-allowed border-gray-200'
              : (selectedCats.includes(cat) ? 'border-black bg-gray-50' : 'border-gray-300 bg-white')"
          >
            <input
              type="checkbox"
              :disabled="isAll"
              :checked="selectedCats.includes(cat)"
              @change="toggleCat(cat, ($event.target as HTMLInputElement).checked)"
              :aria-label="`Category: ${cat}`"
            />
            <span class="capitalize">{{ cat }}</span>
          </label>
        </div>
      </fieldset>

      <!-- Antal (max) -->
      <fieldset class="rounded-xl border p-4" role="radiogroup" aria-label="Number of questions (max)">
        <legend class="font-semibold">Number of questions (max)</legend>
        <div class="mt-3 flex flex-wrap gap-2">
          <label
            v-for="n in maxOptions"
            :key="n"
            class="inline-flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer"
            :class="selectedMax === n ? 'border-black bg-gray-50' : 'border-gray-300 bg-white'"
          >
            <input
              class="sr-only"
              type="radio"
              name="max"
              :value="n"
              :checked="selectedMax === n"
              @change="selectedMax = n"
            />
            <span>{{ n }}</span>
          </label>
        </div>
        <p class="mt-2 text-sm text-gray-600">We will fetch <strong>up to</strong> this amount.</p>
      </fieldset>

      <!-- Live status (icke-blockerande) -->
      <p class="text-xs text-gray-600" role="status" aria-live="polite">
        Selected: <span class="font-medium capitalize">{{ isAll ? 'All' : effectiveCats.join(', ') || 'None' }}</span>,
        Max: <span class="font-medium">{{ selectedMax }}</span>
      </p>

      <button
        class="w-full px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800"
        @click="start"
      >
        Start quiz
      </button>
    </div>
  </main>
</template>
