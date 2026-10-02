import { type FormEvent, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { AuthLayout } from '@/components/auth/AuthLayout'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { OtpInput } from '@/components/ui/OtpInput'
import { TextField } from '@/components/ui/TextField'
import { extractErrorMessage } from '@/lib/api'
import { authApi } from '@/lib/auth-api'
import { useCountdown } from '@/lib/use-countdown'

const RESEND_COOLDOWN = 30

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const email = (location.state as { email?: string })?.email ?? ''

  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
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

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      await authApi.resetPassword(email, otp, newPassword)
      navigate('/login', { state: { notice: 'Password updated. You can now sign in.' } })
    } catch (err) {
      setError(extractErrorMessage(err, 'We could not reset your password. Please try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleResend() {
    setError(null)
    setNotice(null)
    setIsResending(true)
    try {
      await authApi.forgotPassword(email)
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
      <AuthLayout title="Reset your password" subtitle="We couldn't find an email for this reset.">
        <Alert tone="error">Start again from the forgot password page.</Alert>
        <Link
          to="/forgot-password"
          className="mt-4 inline-block text-sm font-semibold text-teal-600 hover:underline"
        >
          Back to reset request
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Set a new password"
      subtitle={`Enter the code sent to ${email} and choose a new password.`}
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
        <TextField
          label="New password"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          hint="At least 10 characters."
        />
        <TextField
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button type="submit" isLoading={isSubmitting} disabled={otp.length !== 6}>
          Reset password
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
