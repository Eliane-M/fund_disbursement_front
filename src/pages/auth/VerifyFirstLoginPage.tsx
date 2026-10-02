import { type FormEvent, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { AuthLayout } from '@/components/auth/AuthLayout'
import { SetInitialPasswordOverlay } from '@/components/auth/SetInitialPasswordOverlay'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { OtpInput } from '@/components/ui/OtpInput'
import { useAuth } from '@/hooks/useAuth'
import { extractErrorMessage } from '@/lib/api'
import { authApi } from '@/lib/auth-api'
import { useCountdown } from '@/lib/use-countdown'

const RESEND_COOLDOWN = 30

export function VerifyFirstLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setSession, refreshUser } = useAuth()

  const email = (location.state as { email?: string })?.email ?? ''

  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [needsPasswordSetup, setNeedsPasswordSetup] = useState(false)
  const { secondsLeft, start, isRunning } = useCountdown()

  useEffect(() => {
    start(RESEND_COOLDOWN)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const result = await authApi.verifyFirstLogin(email, otp)
      setSession(result.user, { access: result.access, refresh: result.refresh })
      if (result.user.is_first_login) {
        setNeedsPasswordSetup(true)
      } else {
        navigate('/', { replace: true })
      }
    } catch (err) {
      setError(extractErrorMessage(err, 'That code did not work. Please try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleResend() {
    setError(null)
    setNotice(null)
    setIsResending(true)
    try {
      await authApi.resendOtp(email, 'first_login')
      setNotice('A new code has been sent to your email.')
      start(RESEND_COOLDOWN)
    } catch (err) {
      setError(extractErrorMessage(err, 'We could not resend the code. Please try again shortly.'))
    } finally {
      setIsResending(false)
    }
  }

  if (!email) {
    return (
      <AuthLayout title="Confirm it's you" subtitle="We couldn't find an email to verify.">
        <Alert tone="error">Start again from the sign-in page.</Alert>
        <Link to="/login" className="mt-4 inline-block text-sm font-semibold text-teal-600 hover:underline">
          Back to sign in
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Confirm it's you"
      subtitle={`This is your first sign-in. Enter the 6-digit code we sent to ${email}.`}
      footer={
        <Link to="/login" className="font-semibold text-teal-600 hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        {error && <Alert tone="error">{error}</Alert>}
        {notice && <Alert tone="success">{notice}</Alert>}
        <OtpInput value={otp} onChange={setOtp} autoFocus />
        <Button type="submit" isLoading={isSubmitting} disabled={otp.length !== 6}>
          Verify and continue
        </Button>
        <button
          type="button"
          onClick={handleResend}
          disabled={isRunning || isResending}
          className="text-sm font-semibold text-teal-600 hover:underline disabled:cursor-not-allowed disabled:text-navy-400 disabled:no-underline"
        >
          {isRunning ? `Resend code in ${secondsLeft}s` : isResending ? 'Sending…' : 'Resend code'}
        </button>
      </form>

      {needsPasswordSetup && (
        <SetInitialPasswordOverlay
          onDone={async () => {
            await refreshUser()
            navigate('/', { replace: true })
          }}
        />
      )}
    </AuthLayout>
  )
}
