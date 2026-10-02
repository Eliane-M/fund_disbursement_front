import { type FormEvent, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { AuthLayout } from '@/components/auth/AuthLayout'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { OtpInput } from '@/components/ui/OtpInput'
import { extractErrorMessage } from '@/lib/api'
import { authApi } from '@/lib/auth-api'
import { useCountdown } from '@/lib/use-countdown'

const RESEND_COOLDOWN = 30

export function VerifyEmailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const email = (location.state as { email?: string })?.email ?? searchParams.get('email') ?? ''

  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
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
      await authApi.verifyEmail(email, otp)
      navigate('/login', { state: { notice: 'Email verified. You can now sign in.' } })
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
      await authApi.resendOtp(email, 'email_verification')
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
      <AuthLayout title="Verify your email" subtitle="We couldn't find an email to verify.">
        <Alert tone="error">Start again from the registration page.</Alert>
        <Link to="/register" className="mt-4 inline-block text-sm font-semibold text-teal-600 hover:underline">
          Back to registration
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={`Enter the 6-digit code we sent to ${email}.`}
      footer={
        <>
          Wrong email?{' '}
          <Link to="/register" className="font-semibold text-teal-600 hover:underline">
            Start over
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        {error && <Alert tone="error">{error}</Alert>}
        {notice && <Alert tone="success">{notice}</Alert>}
        <OtpInput value={otp} onChange={setOtp} autoFocus />
        <Button type="submit" isLoading={isSubmitting} disabled={otp.length !== 6}>
          Verify email
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
    </AuthLayout>
  )
}
