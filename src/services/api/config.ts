import axios from 'axios'
import { useAuthStore } from '../../stores/auth'

export const apiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
}

export const api = axios.create(apiConfig)

api.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

api.interceptors.response.use((response) => {
  response.data = response.data?.data ?? response.data
  return response
})
