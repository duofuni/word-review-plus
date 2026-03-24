<template>
  <div class="home">
    <header class="home-header">
      <h1 class="title">单词复习</h1>
      <div class="word-bank-wrap">
        <label for="word-bank-select" class="word-bank-label">选词库</label>
        <select
          id="word-bank-select"
          v-model="selectedBank"
          class="word-bank-select"
          @change="onBankChange"
        >
          <option
            v-for="bank in wordBanks"
            :key="bank.id"
            :value="bank.id"
          >
            {{ bank.label }}
          </option>
        </select>
        <router-link :to="{ name: 'WordBook' }" class="word-book-btn">单词本</router-link>
      </div>
    </header>
    <div v-if="loading" class="loading">加载中…</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="lesson-grid">
      <router-link
        v-for="lesson in lessons"
        :key="lesson.index"
        :to="{ name: 'Detail', params: { lessonId: lesson.index } }"
        class="lesson-card"
        :class="{ completed: lesson.completed }"
      >
        <span class="card-icon" aria-hidden="true">
          <span v-if="lesson.completed" class="icon-check">✓</span>
          <span v-else class="icon-clock">◷</span>
        </span>
        <h2 class="lesson-title">第{{ lesson.index }}课</h2>
        <p class="word-count">{{ lesson.total }}个单词</p>
        <p class="status" :class="lesson.completed ? 'done' : 'pending'">
          <span v-if="lesson.completed" class="status-icon">✓</span>
          <span v-else class="status-icon circle">○</span>
          {{ lesson.completed ? '已完成' : '未完成' }}
        </p>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useWords } from '../composables/useWords.js'

const {
  lessons,
  loading,
  error,
  fetchWords,
  wordBanks,
  selectedBank,
  setSelectedBank,
} = useWords()

function onBankChange(e) {
  setSelectedBank(e.target.value)
  fetchWords()
}

onMounted(() => {
  fetchWords()
})
</script>

<style scoped>
.home {
  min-height: 100%;
  padding: 16px;
  padding-top: calc(16px + var(--safe-top));
}

.home-header {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.word-bank-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.word-bank-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.word-bank-select {
  padding: 6px 10px;
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
  background: var(--color-card);
  color: var(--color-text);
  font-size: 0.875rem;
  min-width: 100px;
  cursor: pointer;
}

.word-bank-select:focus {
  outline: none;
  border-color: var(--color-primary, #07c160);
}

.word-book-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-card);
  color: var(--color-text);
  font-size: 0.875rem;
  white-space: nowrap;
}

.word-book-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
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

.lesson-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 900px) {
  .lesson-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 600px) {
  .lesson-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

.lesson-card {
  position: relative;
  display: block;
  padding: 16px;
  background: var(--color-card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  border: 2px solid var(--color-border);
  transition: border-color 0.2s, transform 0.15s;
}

.lesson-card:hover {
  transform: translateY(-2px);
}

.lesson-card.completed {
  border-color: var(--color-success);
}

.lesson-card:not(.completed) {
  border-color: #c8e1ff;
}

.card-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 14px;
}

.lesson-card.completed .card-icon {
  background: rgba(7, 193, 96, 0.15);
  color: var(--color-success);
}

.lesson-card:not(.completed) .card-icon {
  background: rgba(0, 0, 0, 0.06);
  color: var(--color-text-secondary);
}

.icon-clock {
  font-size: 16px;
  line-height: 1;
}

.lesson-title {
  margin: 0 0 6px 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text);
}

.word-count {
  margin: 0 0 8px 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.status {
  margin: 0;
  font-size: 0.8125rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

.status.done {
  color: var(--color-success);
}

.status.pending {
  color: var(--color-text-secondary);
}

.status-icon {
  font-size: 0.9rem;
}

.status-icon.circle {
  opacity: 0.8;
}
</style>
