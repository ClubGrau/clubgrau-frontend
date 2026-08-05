import { createMemoryHistory, createRouter } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  { 
    path: '/login',
    component: () => import('../views/Login.vue'),
  },
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
})