import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '@/hooks/useAuth'

export function PublicOnlyRoute() {
  const { isAuthenticated, isInitializing, user } = useAuth()

  if (isInitializing) return null

  // A user who's authenticated but still mid first-login (OTP verified, new
  // password not set yet) stays on the auth pages so the forced
  // set-password overlay can render over the login/verify screen.
  if (isAuthenticated && !user?.is_first_login) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
