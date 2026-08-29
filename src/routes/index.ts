import { createWebHistory, createRouter } from 'vue-router'
import { canAccessEmployees } from '../domain/actor-display'
import { useAuthStore } from '../stores/auth'

const authGuard = () => {
  const authStore = useAuthStore()
  if (authStore.token) {
    return true
  }
  return '/login'
}

const canAccessEmployeesGuard = () => {
  const authStore = useAuthStore()
  if (canAccessEmployees(authStore.actor)) {
    return true
  }
  return '/app/dashboard'
}
  
const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  { 
    path: '/login',
    component: () => import('../views/Login/Login.vue'),
  },
  {
    path: "/app",
    name: "template",
    redirect: "/app/dashboard",
    beforeEnter: authGuard,
    component: () => import('../Layout/AppContainer.vue'),
    children: [
      {
        path: "dashboard",
        name: "dashboard",
        component: () => import('../views/Dashboard/Dashboard.vue'),
      },
      {
        path: "employees",
        name: "employees",
        component: () => import('../views/Employees/Employees.vue'),
        beforeEnter: canAccessEmployeesGuard,
      },
    ],
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})