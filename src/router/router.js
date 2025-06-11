import { createWebHashHistory, createRouter } from 'vue-router'

const routes = [
  { path: '/', component: () => import('../components/dict/index.vue') },
  { path: '/detail', component: () => import('../components/dict/detail.vue') },
  { path: '/codeTable', component: () => import('../components/codeTable/index.vue') },
  { path: '/dataSource', component: () => import('../components/dataSource/index.vue') },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router