<template>
  <div class="detail">
    <header class="detail-header">
      <button type="button" class="back" @click="goBack" aria-label="返回">‹</button>
      <div class="counts">
        <span class="count-item">剩余 {{ remainingCount }}</span>
      </div>
      <router-link
        v-if="lessonIndex"
        :to="{ name: 'CutList', params: { lessonId: lessonIndex } }"
        class="cut-list-link"
        aria-label="当前课程已斩单词列表"
      >
        已斩
      </router-link>
    </header>

    <template v-if="current">
      <div class="word-area">
        <h1 class="word">{{ current.word }}</h1>
      </div>

      <div class="options">
        <button
          v-for="(opt, i) in options"
          :key="i"
          type="button"
          class="option-card"
          :class="{ chosen: chosenIndex === i, correct: feedback && i === correctIndex, wrong: feedback && chosenIndex === i && i !== correctIndex }"
          :disabled="!!feedback"
          @click="choose(i)"
        >
          {{ opt }}
        </button>
      </div>

      <footer class="detail-footer">
        <button type="button" class="btn-cut" @click="doCut">斩</button>
      </footer>
    </template>

    <div v-else class="empty-state">
      <p>本课没有可学习的单词</p>
      <p class="hint">已斩的单词可在「已斩」列表中恢复</p>
      <button type="button" class="btn-back" @click="goBack">返回课程</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWords, useCutWords, useSeenWords } from '../composables/useWords.js'

const route = useRoute()
const router = useRouter()
const lessonId = computed(() => Number(route.params.lessonId) || 1)
const lessonIndex = lessonId

const { lessons, fetchWords, WORDS_PER_LESSON } = useWords()
const { cut, cutListForLesson } = useCutWords()
const { markSeen, isSeen } = useSeenWords()

const current = ref(null)
const options = ref([])
const chosenIndex = ref(null)
const correctIndex = ref(0)
const feedback = ref(false)
/** Word no's already done this session (answered or 斩), so 剩余 decreases as we go */
const sessionDoneNos = ref(new Set())

const learnableWords = computed(() => {
  const list = lessons.value
  const lesson = list.find(l => l.index === lessonId.value)
  if (!lesson) return []
  const cutInLesson = cutListForLesson(lessonId.value)
  const cutNos = new Set(cutInLesson.map(c => c.no))
  return lesson.words.filter(w => !cutNos.has(w.no))
})

const remainingCount = computed(() =>
  learnableWords.value.filter(w => !sessionDoneNos.value.has(w.no)).length
)

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickOptions(correctWord, allWords) {
  const others = allWords.filter(w => w.no !== correctWord.no && w.meaning !== correctWord.meaning)
  const wrong = shuffle(others).slice(0, 3).map(w => ({ meaning: w.meaning, no: w.no }))
  const opts = shuffle([{ meaning: correctWord.meaning, no: correctWord.no }, ...wrong])
  const idx = opts.findIndex(o => o.no === correctWord.no)
  return { options: opts.map(o => o.meaning), correctIndex: idx }
}

function setNextWord() {
  if (current.value) {
    sessionDoneNos.value = new Set([...sessionDoneNos.value, current.value.no])
  }
  const words = learnableWords.value.filter(w => !sessionDoneNos.value.has(w.no))
  if (!words.length) {
    current.value = null
    options.value = []
    return
  }
  const list = lessons.value
  const all = list.flatMap(l => l.words)
  const newOnes = words.filter(w => !isSeen(w.no))
  const pool = newOnes.length ? newOnes : words
  const word = pool[Math.floor(Math.random() * pool.length)]
  current.value = word
  const { options: optTexts, correctIndex: cIdx } = pickOptions(word, all)
  options.value = optTexts
  correctIndex.value = cIdx
  chosenIndex.value = null
  feedback.value = false
}

function choose(i) {
  if (feedback.value) return
  chosenIndex.value = i
  feedback.value = true
  const correct = i === correctIndex.value
  if (correct) markSeen(current.value.no)
  setTimeout(() => setNextWord(), correct ? 400 : 1200)
}

function doCut() {
  if (!current.value) return
  cut(current.value.no)
  setNextWord()
}

function goBack() {
  router.push({ name: 'Home' })
}

onMounted(async () => {
  await fetchWords()
  sessionDoneNos.value = new Set()
  setNextWord()
})

watch(lessonId, () => {
  sessionDoneNos.value = new Set()
  setNextWord()
})
</script>

<style scoped>
.detail {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-card);
  margin-left: auto;
  margin-right: auto;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 0 0 1px var(--color-border);
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  padding-top: calc(12px + var(--safe-top));
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.back {
  font-size: 1.75rem;
  line-height: 1;
  color: var(--color-primary);
  padding: 4px 8px;
  margin: -4px -8px;
}

.counts {
  display: flex;
  gap: 12px;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.cut-list-link {
  font-size: 0.875rem;
  color: var(--color-primary);
  padding: 6px 10px;
}

.word-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 20px;
  padding-bottom: 160px;
  min-height: 200px;
}

.word {
  margin: 0;
  font-size: clamp(1.75rem, 6vw, 2.5rem);
  font-weight: 700;
  color: var(--color-primary);
}

.options {
  padding: 0 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-card {
  padding: 14px 16px;
  min-height: 48px;
  text-align: left;
  background: var(--color-bg);
  border: 2px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 0.9375rem;
  color: var(--color-text);
  transition: border-color 0.2s, background 0.2s;
}

.option-card:disabled {
  cursor: default;
}

.option-card:not(:disabled):hover {
  border-color: var(--color-primary);
  background: rgba(25, 137, 250, 0.06);
}

.option-card.chosen {
  border-color: var(--color-primary);
  background: rgba(25, 137, 250, 0.08);
}

.option-card.correct {
  border-color: var(--color-success);
  background: rgba(7, 193, 96, 0.1);
}

.option-card.wrong {
  border-color: var(--color-danger);
  background: rgba(238, 10, 36, 0.06);
}

@media (max-width: 600px) {
  .detail-footer {
    padding: 20px 16px;
    padding-bottom: calc(20px + var(--safe-bottom));
  }

  .btn-cut {
    max-width: 100%;
    padding: 14px;
    font-size: 1.125rem;
  }
}

.btn-cut {
  display: block;
  width: 100%;
  max-width: 120px;
  margin: 0 auto;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  background: var(--color-card);
  border: 2px solid var(--color-danger);
  border-radius: var(--radius);
  transition: background 0.2s, color 0.2s;
}

.btn-cut:hover {
  background: var(--color-danger);
  color: #fff;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
  color: var(--color-text-secondary);
}

.empty-state .hint {
  font-size: 0.875rem;
  margin-top: 8px;
}

.btn-back {
  margin-top: 20px;
  padding: 10px 20px;
  color: var(--color-primary);
  font-size: 0.9375rem;
}
</style>
