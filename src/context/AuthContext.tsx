import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { AuthContext, type AuthContextValue } from '@/context/auth-context'
import { authApi } from '@/lib/auth-api'
import { tokenStorage } from '@/lib/token-storage'
import type { User } from '@/types/auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isInitializing, setIsInitializing] = useState(() => Boolean(tokenStorage.getAccess()))

  useEffect(() => {
    if (!tokenStorage.getAccess()) return
    authApi
      .me()
      .then(setUser)
      .catch(() => {
        tokenStorage.clear()
        setUser(null)
      })
      .finally(() => setIsInitializing(false))
  }, [])

  const setSession = useCallback((nextUser: User, tokens: { access: string; refresh: string }) => {
    tokenStorage.set(tokens)
    setUser(nextUser)
  }, [])

  const logout = useCallback(async () => {
    const refresh = tokenStorage.getRefresh()
    tokenStorage.clear()
    setUser(null)
    if (refresh) {
      try {
        await authApi.logout(refresh)
      } catch {
        // Token already invalid/expired locally — nothing else to do.
      }
    }
  }, [])

  const refreshUser = useCallback(async () => {
    const nextUser = await authApi.me()
    setUser(nextUser)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isInitializing,
      setSession,
      logout,
      refreshUser,
    }),
    [user, isInitializing, setSession, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
