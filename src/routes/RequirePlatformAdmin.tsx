import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '@/hooks/useAuth'

export function RequirePlatformAdmin() {
  const { user, isInitializing } = useAuth()

  if (isInitializing) return null

  if (!user?.is_platform_admin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
