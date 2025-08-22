<template>
    <main class="min-h-screen flex items-center justify-center bg-gray-50">
      <section class="w-full max-w-xl p-6 md:p-10 bg-white rounded-2xl shadow">
        <h1 class="text-2xl md:text-3xl font-semibold">PSM I MCQ Trainer</h1>
        <p class="mt-2 text-gray-600">
          Practice multiple-choice questions. Reveal answers and explanations, then review results.
        </p>
  
        <div class="mt-6 flex items-center justify-between">
          <label class="flex items-center gap-3 cursor-pointer">
            <input v-model="shuffle" type="checkbox" class="h-4 w-4 rounded border-gray-300">
            <span class="text-gray-800">Shuffle questions</span>
          </label>
          <NuxtLink
            :to="{ path: '/quiz', query: { shuffle: shuffle ? '1' : '0' } }"
            class="inline-flex items-center justify-center rounded-xl px-4 py-2 bg-black text-white hover:bg-gray-800"
          >
            Start quiz
          </NuxtLink>
        </div>
      </section>
    </main>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  
  // NOTE: Ingen koppling till store än. Vi sparar användarens val lokalt.
  // I nästa steg kan vi läsa av denna på /quiz via store-setup eller query-param.
  const shuffle = ref(true)
  </script>
  