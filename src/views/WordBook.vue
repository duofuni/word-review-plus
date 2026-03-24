<template>
  <div class="word-book">
    <header class="book-header">
      <button type="button" class="back" @click="goBack" aria-label="返回">‹</button>
      <h1 class="title">单词本</h1>
      <span class="bank-name">{{ currentBankLabel }}</span>
    </header>

    <div v-if="loading" class="loading">加载中…</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="list">
      <div v-for="word in words" :key="word.no" class="item">
        <h2 class="word">{{ word.word }}</h2>
        <button
          type="button"
          class="meaning-wrap"
          :class="{ shown: isShown(word.no) }"
          @click="toggleMeaning(word.no)"
        >
          <span v-if="isShown(word.no)" class="meaning">{{ word.meaning }}</span>
          <span v-else class="mask" aria-hidden="true"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useWords } from '../composables/useWords.js'

const router = useRouter()
const { words, loading, error, fetchWords, wordBanks, selectedBank } = useWords()
const shownNos = ref(new Set())

const currentBankLabel = computed(() => {
  const current = wordBanks.find(b => b.id === selectedBank.value)
  return current ? current.label : ''
})

function toggleMeaning(no) {
  const next = new Set(shownNos.value)
  if (next.has(no)) next.delete(no)
  else next.add(no)
  shownNos.value = next
}

function isShown(no) {
  return shownNos.value.has(no)
}

function goBack() {
  router.push({ name: 'Home' })
}

onMounted(async () => {
  await fetchWords()
})

watch(selectedBank, async () => {
  shownNos.value = new Set()
  await fetchWords()
})
</script>

<style scoped>
.word-book {
  min-height: 100%;
  background: var(--color-card);
  margin-left: auto;
  margin-right: auto;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 0 0 1px var(--color-border);
}

.book-header {
  position: sticky;
  top: 0;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 12px 16px;
  padding-top: calc(12px + var(--safe-top));
  border-bottom: 1px solid var(--color-border);
  background: var(--color-card);
}

.back {
  justify-self: start;
  font-size: 1.75rem;
  line-height: 1;
  color: var(--color-primary);
  padding: 4px 8px;
  margin: -4px -8px;
}

.title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text);
}

.bank-name {
  justify-self: end;
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
}

.loading,
.error {
  text-align: center;
  padding: 40px 20px;
  color: var(--color-text-secondary);
}

.error {
  color: var(--color-danger);
}

.list {
  padding-bottom: calc(20px + var(--safe-bottom));
}

.item {
  border-bottom: 1px solid var(--color-border);
  padding: 12px 16px;
}

.word {
  margin: 0 0 8px 0;
  font-size: 1.3rem;
  line-height: 1.1;
  color: #2f3a52;
}

.meaning-wrap {
  width: 100%;
  text-align: left;
  padding: 0;
  border: none;
  background: transparent;
}

.mask {
  display: block;
  width: 100%;
  height: 40px;
  border-radius: 2px;
  background: #e6e9ef;
}

.meaning {
  display: block;
  font-size: 1.05rem;
  line-height: 40px;
  height: 40px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #5f6672;
}
</style>
