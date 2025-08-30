<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

type TocItem = { id: string; text: string; level: 1 | 2 }
const DATA_KEY = 'scrum-guide' // konstant nyckel ⇒ samma SSR/CSR-branch

let data: any
if (import.meta.server) {
  const route = useRoute()
  ;({ data } = await useAsyncData(DATA_KEY, async () => {
    try {
      const mod = await import('~/server/services/scrumGuide')
      const payload = await mod.getScrumGuide(route.query.src as string | undefined)
      return { ok: true, payload }
    } catch (e: any) {
      return { ok: false, message: e?.message || 'Failed to load Scrum Guide' }
    }
  }, { server: true }))
} else {
  const nuxtData = useNuxtData(DATA_KEY)
  data = nuxtData.data
}

const hasError = computed(() => data.value?.ok === false)
const errMsg   = computed(() => String(data.value?.message || 'Unexpected error'))

const payload  = computed(() => (data.value?.ok ? data.value.payload : null))
const toc      = computed(() => (payload.value?.toc ?? []) as TocItem[])
const html     = computed(() => String(payload.value?.html ?? ''))
const source   = computed(() => String(payload.value?.meta?.source ?? ''))
const fetched  = computed(() => String(payload.value?.meta?.fetchedAt ?? ''))
</script>

<template>
  <main class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header: konsekvent och klickbar hem -->
    <header class="bg-white border-b">
      <div class="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <NuxtLink to="/" class="text-lg font-semibold hover:underline">
          Scrum PSMI - Scrum Guide 2020
        </NuxtLink>
      </div>
    </header>

    <section class="mx-auto max-w-6xl px-4 py-6 flex-1 w-full">
      <!-- Felblock (samma på SSR/CSR pga ok:false i data) -->
      <div v-if="hasError" class="rounded-xl border border-red-300 bg-red-50 p-4 text-red-900" role="alert">
        <div class="font-semibold mb-1">Failed to load</div>
        <p class="text-sm">{{ errMsg }}</p>
      </div>

      <!-- Normal vy -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
        <!-- Sidomeny -->
        <nav class="lg:sticky lg:top-6 h-fit bg-white border rounded-xl p-4">
          <h2 class="text-sm font-semibold mb-2">Contents</h2>
          <ul v-if="toc.length" class="space-y-1">
            <li v-for="item in toc" :key="item.id"
                :class="item.level === 1 ? 'mt-2 font-medium' : 'ml-4 text-sm'">
              <a class="hover:underline" :href="'#' + item.id">{{ item.text }}</a>
            </li>
          </ul>
          <p v-else class="text-xs text-gray-500">No sections found.</p>

          <div class="mt-4 pt-4 border-t space-y-1">
            <a v-if="source" :href="source" target="_blank" rel="noopener noreferrer"
               class="text-sm underline text-gray-700 hover:text-gray-900">
              Open source
            </a>
            <p v-if="fetched" class="text-xs text-gray-500">
              Cached at: {{ new Date(fetched).toLocaleString() }}
            </p>
          </div>
        </nav>

        <!-- Innehåll -->
        <article class="prose max-w-none bg-white border rounded-xl p-6">
          <div v-html="html" />
        </article>
      </div>
    </section>
  </main>
</template>

<style>
:root { scroll-behavior: smooth; }
.prose :is(h1[id], h2[id]) { scroll-margin-top: 96px; }
.prose h1 { font-size: 1.5rem; line-height: 1.25; font-weight: 700; margin-top: 1.5rem; margin-bottom: .75rem; }
.prose h2 { font-size: 1.25rem; line-height: 1.3; font-weight: 600; margin-top: 1.25rem; margin-bottom: .5rem; }
.prose h3,
.prose h4 { font-weight: 600; margin: 1.125rem 0 .25rem;  }
.prose p  { color: #1f2937; line-height: 1.75; margin: .75rem 0; }
.prose a  { color: #1d4ed8; text-decoration: underline; }
.prose ul { list-style: disc; padding-left: 1.5rem; }
.prose ol { list-style: decimal; padding-left: 1.5rem; }
</style>
