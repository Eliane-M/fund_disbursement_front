import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'
import { useParams } from 'react-router-dom'

import { InviteMemberModal } from '@/components/console/InviteMemberModal'
import { PlatformLayout } from '@/components/platform/PlatformLayout'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { TextField } from '@/components/ui/TextField'
import { extractErrorMessage } from '@/lib/api'
import { platformApi } from '@/lib/platform-api'
import type { PlatformOrganization } from '@/types/platform'

const STATUS_OPTIONS: PlatformOrganization['status'][] = ['trial', 'active', 'suspended', 'closed']

function EditOrganizationModal({
  organization,
  onClose,
}: {
  organization: PlatformOrganization
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [name, setName] = useState(organization.name)
  const [orgType, setOrgType] = useState(organization.org_type)
  const [sectorFocus, setSectorFocus] = useState(organization.sector_focus)
  const [contactEmail, setContactEmail] = useState(organization.contact_email)
  const [phone, setPhone] = useState(organization.phone)
  const [location, setLocation] = useState(organization.location)
  const [status, setStatus] = useState(organization.status)
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      platformApi.updateOrganization(organization.id, {
        name,
        org_type: orgType,
        sector_focus: sectorFocus,
        contact_email: contactEmail,
        phone,
        location,
        status,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['platform-organization', organization.id], updated)
      queryClient.invalidateQueries({ queryKey: ['platform-organizations'] })
      onClose()
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Organization name is required.')
      return
    }
    setError(null)
    mutation.mutate()
  }

  return (
    <Modal title="Edit organization" onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error && <Alert tone="error">{error}</Alert>}
        <TextField label="Organization name" required value={name} onChange={(e) => setName(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Organization type" value={orgType} onChange={(e) => setOrgType(e.target.value)} />
          <TextField label="Sector focus" value={sectorFocus} onChange={(e) => setSectorFocus(e.target.value)} />
        </div>
        <TextField label="Organization email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <TextField label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as PlatformOrganization['status'])}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s}
            </option>
          ))}
        </Select>
        <Button type="submit" isLoading={mutation.isPending}>
          Save changes
        </Button>
      </form>
    </Modal>
  )
}

export function OrganizationDetailPage() {
  const { organizationId } = useParams<{ organizationId: string }>()
  const queryClient = useQueryClient()
  const [showInvite, setShowInvite] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  const { data: organization } = useQuery({
    queryKey: ['platform-organization', organizationId],
    queryFn: () => platformApi.organization(organizationId!),
    enabled: Boolean(organizationId),
  })
  const { data: members } = useQuery({
    queryKey: ['platform-members', organizationId],
    queryFn: () => platformApi.members(organizationId!),
    enabled: Boolean(organizationId),
  })

  if (!organization) {
    return (
      <PlatformLayout title="Organization">
        <p className="text-sm text-navy-500">Loading…</p>
      </PlatformLayout>
    )
  }

  const orgAdmins = members?.filter((m) => m.role === 'org_admin') ?? []

  return (
    <PlatformLayout title="Organization details">
      <Breadcrumb
        items={[
          { label: 'Platform Console' },
          { label: 'Organizations', to: '/platform/organizations' },
          { label: organization.name },
        ]}
      />

      <section className="mb-8 max-w-2xl flex items-start justify-between gap-6 rounded-2xl border border-cream-300 bg-white p-6">
        <div className="min-w-0">
          <h2 className="truncate text-2xl font-semibold text-navy-900">{organization.name}</h2>
          <p className="mt-1 text-sm text-navy-500">#{organization.tenant_no}</p>
          <dl className="mt-4 flex flex-col gap-2 text-sm">
            <div className="flex gap-2">
              <dt className="w-24 text-navy-500">Category</dt>
              <dd className="text-navy-800">{organization.org_type || organization.sector_focus || '—'}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-24 text-navy-500">Org admin</dt>
              <dd className="text-navy-800">
                {orgAdmins.length
                  ? orgAdmins.map((m) => m.full_name || m.email).join(', ')
                  : '—'}
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="w-24 text-navy-500">Status</dt>
              <dd>
                <Badge tone={organization.status === 'active' ? 'success' : 'neutral'}>{organization.status}</Badge>
              </dd>
            </div>
          </dl>
        </div>
        <Button fullWidth={false} onClick={() => setShowEdit(true)}>
          Edit info
        </Button>
      </section>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-navy-900">Members</h2>
        <Button fullWidth={false} onClick={() => setShowInvite(true)}>
          + Invite member
        </Button>
      </div>
      <section className="rounded-2xl border border-cream-300 bg-white p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-navy-500">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {members?.map((m) => (
                <tr key={m.id}>
                  <td className="py-3 font-medium text-navy-900">{m.full_name || '—'}</td>
                  <td className="py-3 text-navy-600">{m.email}</td>
                  <td className="py-3 capitalize text-navy-700">{m.role.replace('_', ' ')}</td>
                  <td className="py-3">
                    <Badge tone={m.status === 'active' ? 'success' : 'neutral'}>{m.status}</Badge>
                  </td>
                </tr>
              ))}
              {members?.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-sm text-navy-500">
                    No members yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showEdit && <EditOrganizationModal organization={organization} onClose={() => setShowEdit(false)} />}

      {showInvite && (
        <InviteMemberModal
          onClose={() => {
            setShowInvite(false)
            queryClient.invalidateQueries({ queryKey: ['platform-members', organizationId] })
            queryClient.invalidateQueries({ queryKey: ['platform-organizations'] })
          }}
          onInvite={(payload) => platformApi.inviteMember(organizationId!, payload)}
        />
      )}
    </PlatformLayout>
  )
}
