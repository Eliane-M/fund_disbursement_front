import type { AuthTokens } from '@/types/auth'

const ACCESS_TOKEN_KEY = 'fd.access_token'
const REFRESH_TOKEN_KEY = 'fd.refresh_token'

export const tokenStorage = {
  getAccess(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },
  getRefresh(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },
  set(tokens: AuthTokens) {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access)
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh)
  },
  setAccess(access: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, access)
  },
  clear() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },
}
