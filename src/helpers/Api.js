import axios from 'axios'
import { clearAuthCookies, getAuthToken } from './cookies'

export const createIdempotencyKey = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export const BaseUrl =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:5200'

/** Resolve upload paths from the API into absolute URLs. */
export function resolveMediaUrl(path) {
  if (!path) return null
  if (/^https?:\/\//i.test(path) || path.startsWith('blob:')) return path
  return `${BaseUrl}/${String(path).replace(/^\//, '')}`
}

const api = axios.create({
  baseURL: BaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    if (token) {
      config.headers.token = token
      config.headers.Authorization = `Bearer ${token}`
    }

    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      config.headers = config.headers ?? {}
      delete config.headers['Content-Type']
    }

    const method = String(config.method || 'get').toLowerCase()
    const url = config.url || ''
    const isLogin = url.includes('/auth/login')
    if (method === 'post' && !isLogin) {
      config.headers = config.headers ?? {}
      if (!config.headers['Idempotency-Key']) {
        config.headers['Idempotency-Key'] = createIdempotencyKey()
      }
    }

    return config
  },
  (error) => Promise.reject(error)
)

const goToLoginOnce = () => {
  const path = window.location.pathname
  if (path !== '/login') {
    window.location.href = '/login'
  }
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthCookies()
      goToLoginOnce()
    }
    return Promise.reject(error)
  }
)

export default api
