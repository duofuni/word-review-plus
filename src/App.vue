<template>
  <div class="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { initStorage } from './composables/useWords.js'

onMounted(() => {
  initStorage()
})
</script>

<style scoped>
.app {
  min-height: 100%;
  padding-top: var(--safe-top);
  padding-bottom: var(--safe-bottom);
}
</style>
