import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('../views/Home.vue'), meta: { title: '首页' } },
  { path: '/lesson/:lessonId', name: 'Detail', component: () => import('../views/Detail.vue'), meta: { title: '学习' } },
  { path: '/lesson/:lessonId/cut-list', name: 'CutList', component: () => import('../views/CutList.vue'), meta: { title: '已斩单词' } },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} - 单词复习` : '单词复习'
})

export default router
