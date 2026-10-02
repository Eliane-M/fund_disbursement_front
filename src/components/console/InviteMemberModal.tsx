import { type FormEvent, useState } from 'react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { TextField } from '@/components/ui/TextField'
import { extractErrorMessage } from '@/lib/api'
import type { InviteMemberResult, MembershipRole } from '@/types/assessment'

export function InviteMemberModal({
  onClose,
  onInvite,
  roles = ['org_admin', 'reviewer'],
}: {
  onClose: () => void
  onInvite: (payload: {
    email: string
    first_name: string
    last_name: string
    role: MembershipRole
  }) => Promise<InviteMemberResult>
  roles?: MembershipRole[]
}) {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState<MembershipRole>(roles[0])
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<InviteMemberResult | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const invited = await onInvite({ email, first_name: firstName, last_name: lastName, role })
      setResult(invited)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (result) {
    return (
      <Modal title="Member added" onClose={onClose}>
        <Alert tone="success">{result.full_name || result.email} now has access.</Alert>
        {result.email_sent && (
          <div className="mt-4 rounded-lg border border-cream-300 bg-cream-100 p-4">
            <p className="text-sm text-navy-700">
              This is a brand-new account — we've emailed {result.email} a temporary password. They'll
              verify a one-time code on first sign-in, then set their own password.
            </p>
          </div>
        )}
        <Button className="mt-5" onClick={onClose}>
          Done
        </Button>
      </Modal>
    )
  }

  return (
    <Modal title="Invite a member" onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error && <Alert tone="error">{error}</Alert>}
        <TextField label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <TextField label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <Select label="Role" value={role} onChange={(e) => setRole(e.target.value as MembershipRole)}>
          {roles.map((r) => (
            <option key={r} value={r} className="capitalize">
              {r.replace('_', ' ')}
            </option>
          ))}
        </Select>
        <p className="text-xs text-navy-500">
          If this email already has an account, they're added immediately with no new credentials needed.
        </p>
        <Button type="submit" isLoading={isSubmitting}>
          Send invite
        </Button>
      </form>
    </Modal>
  )
}
