import { createWebHistory, createRouter } from 'vue-router'

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
    redirect: "/app/employees",
    component: () => import('../Layout/AppContainer.vue'),
    children: [
      {
        path: "employees",
        name: "employees",
        component: () => import('../views/Employees/Employees.vue'),
      },
    ],
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})