import { type FormEvent, useState } from 'react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { extractErrorMessage } from '@/lib/api'
import { authApi } from '@/lib/auth-api'

export function SetInitialPasswordOverlay({ onDone }: { onDone: () => void }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      await authApi.setInitialPassword(newPassword)
      onDone()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/20 px-4 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-2xl border border-cream-300 bg-white p-8 shadow-xl">
        <h2 className="text-xl font-semibold text-navy-900">Set your password</h2>
        <p className="mt-1.5 text-sm text-navy-500">
          You're in with the temporary password from your invite email. Choose a password of your own to
          finish setting up your account.
        </p>
        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          {error && <Alert tone="error">{error}</Alert>}
          <TextField
            label="New password"
            type="password"
            autoFocus
            required
            minLength={10}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            hint="At least 10 characters."
          />
          <TextField
            label="Confirm new password"
            type="password"
            required
            minLength={10}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button type="submit" isLoading={isSubmitting}>
            Set password and continue
          </Button>
        </form>
      </div>
    </div>
  )
}
