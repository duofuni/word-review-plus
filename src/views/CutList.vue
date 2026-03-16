<template>
  <div class="cut-list-page">
    <header class="cut-list-header">
      <button type="button" class="back" @click="goBack" aria-label="返回">‹</button>
      <h1 class="title">当前课程 · 已斩单词</h1>
    </header>
    <div v-if="cutWords.length === 0" class="empty">
      <p>暂无已斩单词</p>
      <p class="hint">在学习页点击「斩」可将单词标记为已掌握，被斩的单词会出现在这里，可恢复后重新学习。</p>
    </div>
    <ul v-else class="word-list">
      <li v-for="item in cutWords" :key="item.no" class="word-item">
        <div class="word-main">
          <span class="word-text">{{ item.word }}</span>
          <span class="word-meaning">{{ item.meaning }}</span>
        </div>
        <button type="button" class="btn-restore" @click="restore(item.no)">恢复</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWords, useCutWords } from '../composables/useWords.js'

const route = useRoute()
const router = useRouter()
const lessonId = computed(() => Number(route.params.lessonId) || 1)

const { fetchWords } = useWords()
const { cutListForLesson, restore: doRestore } = useCutWords()

const cutWords = computed(() => cutListForLesson(lessonId.value))

function restore(no) {
  doRestore(no)
}

function goBack() {
  router.push({ name: 'Detail', params: { lessonId: lessonId.value } })
}

onMounted(() => {
  fetchWords()
})
</script>

<style scoped>
.cut-list-page {
  min-height: 100%;
  background: var(--color-bg);
  padding-bottom: var(--safe-bottom);
}

.cut-list-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  padding-top: calc(12px + var(--safe-top));
  background: var(--color-card);
  border-bottom: 1px solid var(--color-border);
}

.back {
  font-size: 1.75rem;
  line-height: 1;
  color: var(--color-primary);
  padding: 4px 8px;
  margin: -4px -8px;
}

.title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
}

.empty {
  padding: 40px 24px;
  text-align: center;
  color: var(--color-text-secondary);
}

.empty .hint {
  margin-top: 12px;
  font-size: 0.875rem;
  line-height: 1.5;
}

.word-list {
  padding: 16px;
}

.word-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  background: var(--color-card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  margin-bottom: 10px;
}

.word-main {
  flex: 1;
  min-width: 0;
}

.word-text {
  display: block;
  font-weight: 600;
  font-size: 1rem;
  color: var(--color-primary);
  margin-bottom: 4px;
}

.word-meaning {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.btn-restore {
  flex-shrink: 0;
  padding: 6px 14px;
  font-size: 0.875rem;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: 8px;
  transition: background 0.2s, color 0.2s;
}

.btn-restore:hover {
  background: var(--color-primary);
  color: #fff;
}
</style>
