import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { tokenStorage } from '@/lib/token-storage'

const baseURL = import.meta.env.API_BASE_URL

export const api = axios.create({ baseURL })

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

api.interceptors.request.use((config) => {
  const access = tokenStorage.getAccess()
  if (access) {
    config.headers.set('Authorization', `Bearer ${access}`)
  }
  return config
})

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refresh = tokenStorage.getRefresh()
  if (!refresh) return null

  try {
    const { data } = await axios.post<{ access: string; refresh?: string }>(
      `${baseURL}/auth/token/refresh/`,
      { refresh },
    )
    tokenStorage.setAccess(data.access)
    if (data.refresh) {
      tokenStorage.set({ access: data.access, refresh: data.refresh })
    }
    return data.access
  } catch {
    tokenStorage.clear()
    return null
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined
    const isAuthEndpoint = config?.url?.includes('/auth/login') || config?.url?.includes('/auth/token/refresh')

    if (error.response?.status === 401 && config && !config._retry && !isAuthEndpoint) {
      config._retry = true
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null
      })
      const newAccess = await refreshPromise
      if (newAccess) {
        config.headers.set('Authorization', `Bearer ${newAccess}`)
        return api(config)
      }
    }

    return Promise.reject(error)
  },
)

export function extractErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    if (typeof data === 'string') return data
    if (data && typeof data === 'object') {
      if (typeof (data as Record<string, unknown>).detail === 'string') {
        return (data as Record<string, string>).detail
      }
      const firstKey = Object.keys(data as Record<string, unknown>)[0]
      if (firstKey) {
        const value = (data as Record<string, unknown>)[firstKey]
        if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
        if (typeof value === 'string') return value
      }
    }
    if (error.message === 'Network Error') {
      return 'Could not reach the server. Check your connection and try again.'
    }
  }
  return fallback
}
