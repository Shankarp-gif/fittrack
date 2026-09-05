import axios from 'axios'
import { tokenStorage } from '../utils/storage'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:1111',
})

api.interceptors.request.use((config) => {
  const accessToken = tokenStorage.getAccessToken()
  if (accessToken && accessToken.split('.').length === 3) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status as number | undefined
    const requestUrl = (error.config?.url as string | undefined) ?? ''
    const isAuthEndpoint = requestUrl.startsWith('/api/auth/')

    if (!isAuthEndpoint && (status === 401 || status === 403)) {
      tokenStorage.clear()
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }

    return Promise.reject(error)
  },
)

