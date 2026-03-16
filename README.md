# 单词复习 (Word Review Plus)

A Vue 3 word review app with lesson grid, word detail with multiple-choice meanings, and a “斩” (cut) feature to mark words as known. Cut words are hidden from learning and can be restored from the cut list.

## Features

- **Home**: Grid of lesson cards (第N课, 20 words per lesson). Green border + checkmark = 已完成; blue border + clock = 未完成.
- **Detail**: One word at a time with 4 definition options. “需新学” / “需复习” in header. **斩** button marks the word as cut (like 百词斩). Top-right “已斩” link opens the cut list for the current lesson.
- **Cut list**: Lists all cut words for the current lesson with a “恢复” button to bring them back into learning.

## Tech

- Vue 3 (Composition API), Vue Router (hash history), Vite.
- Words loaded from `public/word.json`; progress and cut state in `localStorage`.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173 (hash routes: `/#/`, `/#/lesson/1`, `/#/lesson/1/cut-list`).

## Build

```bash
npm run build
```

Output in `dist/`. Serve with any static host; ensure `word.json` is copied to the same path as the built app (e.g. `dist/word.json` if you use `dist` as root).

## Word data

`word.json` must be in `public/` for the dev server. If your source file is at project root, copy it:

```bash
cp word.json public/word.json
```

Format: array of `{ "no": number, "word": string, "meaning": string }`. Lessons are formed by grouping 20 words in order (lesson 1 = no 1–20, lesson 2 = 21–40, etc.).

## Mobile

Layout is responsive; safe area insets are used for notched devices. Touch targets and spacing are tuned for small screens.
