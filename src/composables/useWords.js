import { ref, computed, shallowRef } from 'vue'

const WORDS_PER_LESSON = 20
const CUT_PREFIX = 'word-review-cut-'
const SEEN_PREFIX = 'word-review-seen-'
const SELECTED_BANK_KEY = 'word-review-bank'

/** Available word bank files in public/. Add more here when you add new JSON files. */
export const WORD_BANKS = [
  { id: 'word.json', label: 'word' },
  { id: 'word1.json', label: 'word1' },
]

let wordsData = shallowRef([])
let cutSet = ref(new Set())
let seenSet = ref(new Set())

function getInitialBank() {
  try {
    const saved = localStorage.getItem(SELECTED_BANK_KEY)
    if (saved && WORD_BANKS.some(b => b.id === saved)) return saved
    const defaultBank = WORD_BANKS[0].id
    localStorage.setItem(SELECTED_BANK_KEY, defaultBank)
    return defaultBank
  } catch (_) {}
  return WORD_BANKS[0].id
}

let selectedBank = ref(getInitialBank())

function getCutKey(bank) {
  return CUT_PREFIX + bank
}
function getSeenKey(bank) {
  return SEEN_PREFIX + bank
}

function loadStorage() {
  const bank = selectedBank.value
  try {
    const cut = localStorage.getItem(getCutKey(bank))
    cutSet.value = new Set(cut ? JSON.parse(cut) : [])
  } catch (_) {
    cutSet.value = new Set()
  }
  try {
    const seen = localStorage.getItem(getSeenKey(bank))
    seenSet.value = new Set(seen ? JSON.parse(seen) : [])
  } catch (_) {
    seenSet.value = new Set()
  }
}

// Load cut/seen for the selected bank as soon as the module runs (e.g. on refresh)
loadStorage()

function persistCut() {
  localStorage.setItem(getCutKey(selectedBank.value), JSON.stringify([...cutSet.value]))
}

function persistSeen() {
  localStorage.setItem(getSeenKey(selectedBank.value), JSON.stringify([...seenSet.value]))
}

export function useWords() {
  const loading = ref(false)
  const error = ref(null)

  const words = computed(() => wordsData.value)

  const lessons = computed(() => {
    const list = wordsData.value
    if (!list.length) return []
    const result = []
    const total = list.length
    for (let start = 0; start < total; start += WORDS_PER_LESSON) {
      const end = Math.min(start + WORDS_PER_LESSON, total)
      const lessonWords = list.slice(start, end)
      const lessonIndex = Math.floor(start / WORDS_PER_LESSON) + 1
      const inLesson = lessonWords.map(w => w.no)
      const cutInLesson = inLesson.filter(no => cutSet.value.has(no))
      const seenInLesson = inLesson.filter(no => seenSet.value.has(no))
      const completed = inLesson.every(no => cutSet.value.has(no) || seenSet.value.has(no))
      result.push({
        index: lessonIndex,
        words: lessonWords,
        total: lessonWords.length,
        cutCount: cutInLesson.length,
        seenCount: seenInLesson.length,
        completed,
      })
    }
    return result
  })

  async function fetchWords() {
    loading.value = true
    error.value = null
    const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || ''
    try {
      const res = await fetch(base + selectedBank.value)
      if (!res.ok) throw new Error('Failed to load words')
      const data = await res.json()
      wordsData.value = data
    } catch (e) {
      error.value = e.message
      wordsData.value = []
    } finally {
      loading.value = false
    }
  }

  function setSelectedBank(bankId) {
    if (bankId === selectedBank.value) {
      try {
        localStorage.setItem(SELECTED_BANK_KEY, bankId)
      } catch (_) {}
      return
    }
    persistCut()
    persistSeen()
    selectedBank.value = bankId
    try {
      localStorage.setItem(SELECTED_BANK_KEY, bankId)
    } catch (_) {}
    loadStorage()
    wordsData.value = []
  }

  return {
    words,
    lessons,
    loading,
    error,
    fetchWords,
    wordBanks: WORD_BANKS,
    selectedBank,
    setSelectedBank,
    WORDS_PER_LESSON,
  }
}

export function useCutWords() {
  const isCut = (no) => cutSet.value.has(no)
  const cut = (no) => {
    cutSet.value = new Set([...cutSet.value, no])
    persistCut()
  }
  const restore = (no) => {
    const next = new Set(cutSet.value)
    next.delete(no)
    cutSet.value = next
    persistCut()
  }
  const cutListForLesson = (lessonIndex) => {
    const list = wordsData.value
    const start = (lessonIndex - 1) * WORDS_PER_LESSON
    const end = Math.min(start + WORDS_PER_LESSON, list.length)
    return list.slice(start, end).filter(w => cutSet.value.has(w.no))
  }
  return { cutSet, isCut, cut, restore, cutListForLesson }
}

export function useSeenWords() {
  const markSeen = (no) => {
    seenSet.value = new Set([...seenSet.value, no])
    persistSeen()
  }
  const isSeen = (no) => seenSet.value.has(no)
  return { seenSet, markSeen, isSeen }
}

export function initStorage() {
  loadStorage()
}
