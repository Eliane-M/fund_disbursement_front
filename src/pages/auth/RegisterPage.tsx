import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { AuthLayout } from '@/components/auth/AuthLayout'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { extractErrorMessage } from '@/lib/api'
import { authApi } from '@/lib/auth-api'
import { PHONE_HINT, phoneValidationError } from '@/lib/phone'

export function RegisterPage() {
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const nextPhoneError = phoneValidationError(phoneNumber)
    setPhoneError(nextPhoneError)
    if (nextPhoneError) return
    setError(null)
    setIsSubmitting(true)
    try {
      await authApi.register({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        organization_name: organizationName.trim(),
        phone_number: phoneNumber.trim(),
      })
      navigate('/verify-email', { state: { email } })
    } catch (err) {
      setError(extractErrorMessage(err, 'We could not create your account. Please check your details.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Set up access to the platform console."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-teal-600 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error && <Alert tone="error">{error}</Alert>}
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="First name"
            autoComplete="given-name"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextField
            label="Last name"
            autoComplete="family-name"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <TextField
          label="Organization"
          autoComplete="organization"
          required
          maxLength={255}
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
          placeholder="Your organization's name"
          hint="You'll be the admin of this organization."
        />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@organization.com"
        />
        <TextField
          label="Phone number"
          type="tel"
          autoComplete="tel"
          value={phoneNumber}
          onChange={(e) => {
            setPhoneNumber(e.target.value)
            setPhoneError(null)
          }}
          placeholder="Optional"
          hint={PHONE_HINT}
          error={phoneError ?? undefined}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint="At least 10 characters."
        />
        <Button type="submit" isLoading={isSubmitting} className="mt-2">
          Create account
        </Button>
      </form>
    </AuthLayout>
  )
}
