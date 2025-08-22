<template>
    <main class="min-h-screen bg-gray-50">
      <header class="bg-white border-b">
        <div class="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <h1 class="text-lg font-semibold">Scrum PSM I - Results</h1>
          <button @click="backToStart" class="text-sm underline hover:no-underline">
      Back to start
    </button>
        </div>
      </header>
  
      <section class="mx-auto max-w-5xl px-4 py-6">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div class="rounded-2xl bg-white shadow p-4">
            <div class="text-2xl font-semibold text-emerald-600">{{ summary.correctIds.length }}</div>
            <div class="text-sm text-gray-500">Correct</div>
          </div>
          <div class="rounded-2xl bg-white shadow p-4">
            <div class="text-2xl font-semibold text-rose-600">{{ summary.incorrectIds.length }}</div>
            <div class="text-sm text-gray-500">Incorrect</div>
          </div>
          <div class="rounded-2xl bg-white shadow p-4">
            <div class="text-2xl font-semibold">{{ summary.total }}</div>
            <div class="text-sm text-gray-500">Total</div>
          </div>
        </div>
  
        <div class="mt-6 flex items-center gap-2">
          <button
            class="px-4 py-2 rounded-xl border"
            :class="filter === 'all' ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300'"
            @click="filter = 'all'">
            All
          </button>
          <button
            class="px-4 py-2 rounded-xl border"
            :class="filter === 'correct' ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300'"
            @click="filter = 'correct'">
            Correct
          </button>
          <button
            class="px-4 py-2 rounded-xl border"
            :class="filter === 'incorrect' ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300'"
            @click="filter = 'incorrect'">
            Incorrect
          </button>
        </div>
  
        <div class="mt-6">
          <ResultsList :questions="questions" :selections="selections" :filter="filter" />
        </div>
  
        <div class="mt-8">
          <NuxtLink to="/" class="underline">Back to start</NuxtLink>
        </div>
      </section>
    </main>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useQuizStore } from '~/stores/quiz'
  
  type Filter = 'all' | 'correct' | 'incorrect'
  const filter = ref<Filter>('all')
  
  const store = useQuizStore()
  const router = useRouter()
  const questions = computed(() => store.questions)
  const selections = computed(() => store.selections)
  const summary = computed(() => store.summary)

  function backToStart() {
  store.$reset()
  router.push('/')
}
  </script>
  