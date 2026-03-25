import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initWordBanks } from './composables/useWords.js'
import './styles.css'

async function boot() {
  await initWordBanks()
  createApp(App).use(router).mount('#app')
}

boot()
