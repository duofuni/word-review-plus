import { ref, computed, shallowRef } from 'vue'

const WORDS_PER_LESSON = 20
const CUT_PREFIX = 'word-review-cut-'
const SEEN_PREFIX = 'word-review-seen-'
const ORDER_PREFIX = 'word-review-order-'
const SELECTED_BANK_KEY = 'word-review-bank'

let wordsData = shallowRef([])
let cutSet = ref(new Set())
let seenSet = ref(new Set())

/** Populated by initWordBanks() from public/words/_manifest.json */
export const wordBanks = ref([])

let selectedBank = ref('')

function getCutKey(bank) {
  return CUT_PREFIX + bank
}
function getSeenKey(bank) {
  return SEEN_PREFIX + bank
}
function getOrderKey(bank) {
  return ORDER_PREFIX + bank
}

function labelFromFilename(name) {
  return name.replace(/\.json$/i, '') || name
}

function migrateLegacyBankKeys(oldId, newId) {
  const prefixes = [CUT_PREFIX, SEEN_PREFIX, ORDER_PREFIX]
  for (const p of prefixes) {
    const oldKey = p + oldId
    const newKey = p + newId
    try {
      if (localStorage.getItem(oldKey) != null && localStorage.getItem(newKey) == null) {
        localStorage.setItem(newKey, localStorage.getItem(oldKey))
      }
    } catch (_) {}
  }
}

function migrateLegacySelectedBank(banks) {
  try {
    const saved = localStorage.getItem(SELECTED_BANK_KEY)
    if (!saved || saved.startsWith('words/')) return
    const newId = `words/${saved}`
    if (banks.some((b) => b.id === newId)) {
      migrateLegacyBankKeys(saved, newId)
      localStorage.setItem(SELECTED_BANK_KEY, newId)
    }
  } catch (_) {}
}

function resolveSelectedBank(banks) {
  if (!banks.length) return ''
  try {
    migrateLegacySelectedBank(banks)
    const saved = localStorage.getItem(SELECTED_BANK_KEY)
    if (saved && banks.some((b) => b.id === saved)) return saved
    const first = banks[0].id
    localStorage.setItem(SELECTED_BANK_KEY, first)
    return first
  } catch (_) {}
  return banks[0].id
}

function loadStorage() {
  const bank = selectedBank.value
  if (!bank) {
    cutSet.value = new Set()
    seenSet.value = new Set()
    return
  }
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

function persistCut() {
  if (!selectedBank.value) return
  localStorage.setItem(getCutKey(selectedBank.value), JSON.stringify([...cutSet.value]))
}

function persistSeen() {
  if (!selectedBank.value) return
  localStorage.setItem(getSeenKey(selectedBank.value), JSON.stringify([...seenSet.value]))
}

function shuffleWords(list) {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function getStableShuffledWords(bankId, words) {
  const ids = words.map((w) => w.no)
  const idSet = new Set(ids)

  try {
    const saved = localStorage.getItem(getOrderKey(bankId))
    if (saved) {
      const order = JSON.parse(saved)
      const valid =
        Array.isArray(order) &&
        order.length === ids.length &&
        order.every((no) => idSet.has(no))
      if (valid) {
        const byNo = new Map(words.map((w) => [w.no, w]))
        return order.map((no) => byNo.get(no)).filter(Boolean)
      }
    }
  } catch (_) {}

  const shuffled = shuffleWords(words)
  try {
    localStorage.setItem(getOrderKey(bankId), JSON.stringify(shuffled.map((w) => w.no)))
  } catch (_) {}
  return shuffled
}

export async function initWordBanks() {
  const base =
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || ''
  try {
    const res = await fetch(`${base}words/_manifest.json`)
    if (!res.ok) throw new Error('manifest')
    const data = await res.json()
    const files = Array.isArray(data.files) ? data.files : []
    const banks = files.map((name) => ({
      id: `words/${name}`,
      label: labelFromFilename(name),
    }))
    wordBanks.value = banks
    selectedBank.value = resolveSelectedBank(banks)
  } catch (_) {
    wordBanks.value = []
    selectedBank.value = ''
  }
  loadStorage()
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
      const inLesson = lessonWords.map((w) => w.no)
      const cutInLesson = inLesson.filter((no) => cutSet.value.has(no))
      const seenInLesson = inLesson.filter((no) => seenSet.value.has(no))
      const completed = inLesson.every((no) => cutSet.value.has(no) || seenSet.value.has(no))
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
    const base =
      (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || ''
    if (!selectedBank.value) {
      wordsData.value = []
      loading.value = false
      return
    }
    try {
      const res = await fetch(base + selectedBank.value)
      if (!res.ok) throw new Error('Failed to load words')
      const data = await res.json()
      wordsData.value = getStableShuffledWords(selectedBank.value, data)
    } catch (e) {
      error.value = e.message
      wordsData.value = []
    } finally {
      loading.value = false
    }
  }

  function setSelectedBank(bankId) {
    const valid = wordBanks.value.some((b) => b.id === bankId)
    if (!valid && bankId) return

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
    wordBanks,
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
    return list.slice(start, end).filter((w) => cutSet.value.has(w.no))
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
