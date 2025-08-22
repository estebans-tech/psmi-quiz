<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function start() {
  // Navigera direkt; /quiz laddar session + visar loading/error
  router.push('/quiz')
}
</script>

<template>
  <main class="min-h-screen grid place-items-center bg-gray-50">
    <div class="bg-white shadow rounded-2xl p-6 w-full max-w-md space-y-4">
      <h1 class="text-xl font-semibold">PSM I Trainer</h1>
      <p class="text-sm text-gray-600">
        Practice Professional Scrum Master (PSM I) questions. Questions are shuffled on start.
      </p>
      <button
        class="px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800"
        @click="start"
      >
        Start quiz
      </button>
    </div>
  </main>
</template>
