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

    // Only redirect to login if token is actually invalid/expired
    // Don't redirect for 403 Forbidden (authorization issues) or other errors
    if (!isAuthEndpoint && status === 401) {
      // Token expired or invalid
      tokenStorage.clear()
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        console.error('Token expired, redirecting to login')
        window.location.assign('/login')
      }
    }

    // For 403, log error but don't redirect - let app handle it
    if (!isAuthEndpoint && status === 403) {
      console.error('Access denied (403) for', requestUrl)
    }

    return Promise.reject(error)
  },
)

