# 单词复习 (Word Review Plus)

A Vue 3 word review app with lesson grid, word detail with multiple-choice meanings, and a “斩” (cut) feature to mark words as known. Cut words are hidden from learning and can be restored from the cut list.

## Features

- **Home**: Grid of lesson cards (第N课, 20 words per lesson). Green border + checkmark = 已完成; blue border + clock = 未完成.
- **Detail**: One word at a time with 4 definition options. “需新学” / “需复习” in header. **斩** button marks the word as cut (like 百词斩). Top-right “已斩” link opens the cut list for the current lesson.
- **Cut list**: Lists all cut words for the current lesson with a “恢复” button to bring them back into learning.

## Tech

- Vue 3 (Composition API), Vue Router (hash history), Vite.
- Word banks: drop any number of JSON files under `public/words/`. A Vite plugin writes `public/words/manifest.json` listing them; the app loads that manifest at startup and builds the “选词库” dropdown. Progress and cut state live in `localStorage` (per bank id, e.g. `words/word.json`).

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

Output in `docs/` (see `vite.config.js`). Serve with any static host; `words/manifest.json` is emitted with the build.

## Word data

Add JSON files under `public/words/` (not `manifest.json`; that file is regenerated when you run `npm run dev` or `npm run build`). Example:

```bash
cp mybank.json public/words/mybank.json
```

Format: array of `{ "no": number, "word": string, "meaning": string }`. Each lesson shows 20 words in a **stable shuffled** order per bank (stored in `localStorage`).

## Mobile

Layout is responsive; safe area insets are used for notched devices. Touch targets and spacing are tuned for small screens.
