import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Logo } from '@/components/auth/Logo'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { useAuth } from '@/hooks/useAuth'
import { extractErrorMessage } from '@/lib/api'
import { authApi } from '@/lib/auth-api'

function ProfileDetailsForm() {
  const { user, refreshUser } = useAuth()
  const [firstName, setFirstName] = useState(user?.first_name ?? '')
  const [lastName, setLastName] = useState(user?.last_name ?? '')
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number ?? '')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setNotice(null)
    setIsSubmitting(true)
    try {
      await authApi.updateProfile({ first_name: firstName, last_name: lastName, phone_number: phoneNumber })
      await refreshUser()
      setNotice('Profile updated.')
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {error && <Alert tone="error">{error}</Alert>}
      {notice && <Alert tone="success">{notice}</Alert>}
      <div className="grid grid-cols-2 gap-4">
        <TextField label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <TextField label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
      </div>
      <TextField label="Email" value={user?.email ?? ''} disabled />
      <TextField label="Phone number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
      <Button type="submit" fullWidth={false} className="self-start px-5" isLoading={isSubmitting}>
        Save changes
      </Button>
    </form>
  )
}

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setNotice(null)
    setIsSubmitting(true)
    try {
      await authApi.changePassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setNotice('Password changed.')
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {error && <Alert tone="error">{error}</Alert>}
      {notice && <Alert tone="success">{notice}</Alert>}
      <TextField
        label="Current password"
        type="password"
        required
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />
      <TextField
        label="New password"
        type="password"
        required
        minLength={10}
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        hint="At least 10 characters."
      />
      <Button type="submit" fullWidth={false} className="self-start px-5" isLoading={isSubmitting}>
        Change password
      </Button>
    </form>
  )
}

export function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-svh bg-cream-100">
      <header className="flex items-center justify-between border-b border-cream-300 bg-white px-6 py-4 lg:px-10">
        <Logo />
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm font-semibold text-teal-600 hover:underline">
            ← Back to console
          </Link>
          <button type="button" onClick={handleLogout} className="text-sm font-semibold text-danger-text hover:underline">
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-6 flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-lg font-semibold text-navy-900">
            {user?.first_name?.[0]}
            {user?.last_name?.[0]}
          </span>
          <div>
            <h1 className="text-xl font-semibold text-navy-900">{user?.full_name}</h1>
            <p className="text-sm text-navy-500">{user?.email}</p>
          </div>
        </div>

        <section className="rounded-2xl border border-cream-300 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-navy-900">Profile details</h2>
          <ProfileDetailsForm />
        </section>

        <section className="mt-6 rounded-2xl border border-cream-300 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-navy-900">Change password</h2>
          <ChangePasswordForm />
        </section>

        {user && user.memberships.length > 0 && (
          <section className="mt-6 rounded-2xl border border-cream-300 bg-white p-6">
            <h2 className="mb-4 text-base font-semibold text-navy-900">Organizations</h2>
            <div className="flex flex-col divide-y divide-cream-200">
              {user.memberships.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-navy-800">{m.organization_name}</span>
                  <span className="capitalize text-navy-500">{m.role.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
