import axios from "axios"

export const apiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
    Accept: 'application/json',
  },
}

export const api = axios.create(apiConfig)

api.interceptors.response.use((response) => {
  response.data = response.data?.data ?? response.data
  return response
})


