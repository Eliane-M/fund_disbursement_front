import { type FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate, type Location } from 'react-router-dom'

import { AuthLayout } from '@/components/auth/AuthLayout'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { useAuth } from '@/hooks/useAuth'
import { extractErrorMessage } from '@/lib/api'
import { authApi } from '@/lib/auth-api'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setSession } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(
    (location.state as { notice?: string })?.notice ?? null,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setNotice(null)
    setIsSubmitting(true)
    try {
      const result = await authApi.login(email, password)
      if ('otp_required' in result) {
        navigate('/verify-first-login', { state: { email } })
        return
      }
      setSession(result.user, { access: result.access, refresh: result.refresh })
      const from = (location.state as { from?: Location })?.from
      navigate(from?.pathname ?? '/', { replace: true })
    } catch (err) {
      setError(extractErrorMessage(err, 'We could not sign you in. Check your details and try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Sign in to your console"
      subtitle="Enter your credentials to access your organization."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-teal-600 hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error && <Alert tone="error">{error}</Alert>}
        {notice && <Alert tone="success">{notice}</Alert>}
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@organization.com"
        />
        <div className="flex flex-col gap-1.5">
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••"
          />
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs font-semibold text-teal-600 hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>
        <Button type="submit" isLoading={isSubmitting} className="mt-2">
          Sign in
        </Button>
      </form>
    </AuthLayout>
  )
}
