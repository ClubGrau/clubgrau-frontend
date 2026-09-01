import { createWebHistory, createRouter } from 'vue-router'
import { canAccessEmployees, canVisitLogin } from '../domain/actor-display'
import { useAuthStore } from '../stores/auth'

const authGuard = () => {
  const authStore = useAuthStore()
  if (authStore.token) {
    return true
  }
  return '/login'
}

const guestGuard = () => {
  const authStore = useAuthStore()
  if (canVisitLogin(authStore.actor)) {
    return true
  }
  return { path: '/app', replace: true }
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
    redirect: () => {
      const authStore = useAuthStore()
      return canVisitLogin(authStore.actor) ? '/login' : '/app'
    },
  },
  {
    path: '/login',
    component: () => import('../views/Login/Login.vue'),
    beforeEnter: guestGuard,
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