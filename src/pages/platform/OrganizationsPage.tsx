import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'

import { PlatformLayout } from '@/components/platform/PlatformLayout'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { SearchFilterBar } from '@/components/ui/SearchFilterBar'
import { TextField } from '@/components/ui/TextField'
import { extractErrorMessage } from '@/lib/api'
import { PHONE_HINT, phoneValidationError } from '@/lib/phone'
import { platformApi } from '@/lib/platform-api'

const PAGE_SIZE = 10
const STATUS_OPTIONS = [
  { value: 'trial', label: 'Trial' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'closed', label: 'Closed' },
]

function NewOrganizationModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [orgType, setOrgType] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [adminFirstName, setAdminFirstName] = useState('')
  const [adminLastName, setAdminLastName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPhone, setAdminPhone] = useState('')
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [adminPhoneError, setAdminPhoneError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      platformApi.createOrganization({
        name,
        org_type: orgType,
        contact_email: contactEmail,
        phone: phone.trim(),
        location,
        admin: adminEmail
          ? { first_name: adminFirstName, last_name: adminLastName, email: adminEmail, phone: adminPhone.trim() }
          : undefined,
      }),
    onSuccess: () => {
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
    if (adminEmail && (!adminFirstName.trim() || !adminLastName.trim())) {
      setError("The organization administrator's first and last name are required.")
      return
    }
    const nextPhoneError = phoneValidationError(phone)
    const nextAdminPhoneError = phoneValidationError(adminPhone)
    setPhoneError(nextPhoneError)
    setAdminPhoneError(nextAdminPhoneError)
    if (nextPhoneError || nextAdminPhoneError) return
    setError(null)
    mutation.mutate()
  }

  return (
    <Modal title="Create an organization" onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error && <Alert tone="error">{error}</Alert>}
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Organization name" required value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label="Organization email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Organization type" value={orgType} onChange={(e) => setOrgType(e.target.value)} placeholder="e.g. NGO, Government" />
          <TextField
            label="Organization phone"
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value)
              setPhoneError(null)
            }}
            hint={PHONE_HINT}
            error={phoneError ?? undefined}
          />
        </div>
        <TextField label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />

        <div className="mt-2 border-t border-cream-200 pt-4">
          <p className="mb-3 text-sm font-semibold text-navy-900">Organization administrator</p>
          <p className="mb-3 text-xs text-navy-500">Optional — leave the email blank to create the organization without inviting an admin yet.</p>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="First name" value={adminFirstName} onChange={(e) => setAdminFirstName(e.target.value)} />
            <TextField label="Last name" value={adminLastName} onChange={(e) => setAdminLastName(e.target.value)} />
            <TextField label="Email" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
            <TextField
              label="Phone"
              type="tel"
              value={adminPhone}
              onChange={(e) => {
                setAdminPhone(e.target.value)
                setAdminPhoneError(null)
              }}
              hint={PHONE_HINT}
              error={adminPhoneError ?? undefined}
            />
          </div>
        </div>

        <Button type="submit" isLoading={mutation.isPending}>
          Create organization
        </Button>
      </form>
    </Modal>
  )
}

export function OrganizationsPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const { data } = useQuery({
    queryKey: ['platform-organizations', submittedSearch, status, page],
    queryFn: () => platformApi.organizations({ search: submittedSearch, status, page, page_size: PAGE_SIZE }),
  })

  function handleSearch() {
    setPage(1)
    setSubmittedSearch(search)
  }

  return (
    <PlatformLayout title="Organizations">
      <Breadcrumb items={[{ label: 'Platform Console' }, { label: 'Organizations' }]} />
      <section className="rounded-2xl border border-cream-300 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-navy-900">All organizations</h2>
          <Button fullWidth={false} className="px-4 py-2" onClick={() => setShowCreate(true)}>
            + Add Organization
          </Button>
        </div>

        <SearchFilterBar
          search={search}
          onSearchChange={setSearch}
          onSubmit={handleSearch}
          status={status}
          onStatusChange={(v) => {
            setStatus(v)
            setPage(1)
          }}
          statusOptions={STATUS_OPTIONS}
          placeholder="Search organizations…"
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-navy-500">
                <th className="pb-3 font-medium">Organization name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Phone</th>
                <th className="pb-3 font-medium">Location</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {data?.results.map((org) => (
                <tr key={org.id}>
                  <td className="py-3">
                    <p className="font-medium text-navy-900">{org.name}</p>
                    <p className="text-xs text-navy-500">#{org.tenant_no}</p>
                  </td>
                  <td className="py-3 text-navy-600">{org.contact_email || '—'}</td>
                  <td className="py-3 text-navy-700">{org.org_type || '—'}</td>
                  <td className="py-3 text-navy-700">{org.phone || '—'}</td>
                  <td className="py-3 text-navy-700">{org.location || '—'}</td>
                  <td className="py-3">
                    <Badge tone={org.status === 'active' ? 'success' : org.status === 'trial' ? 'trial' : 'neutral'}>
                      {org.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      to={`/platform/organizations/${org.id}`}
                      className="text-sm font-semibold text-teal-600 hover:underline"
                    >
                      Manage →
                    </Link>
                  </td>
                </tr>
              ))}
              {data?.results.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-sm text-navy-500">
                    No organizations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data && (
          <div className="mt-4">
            <Pagination count={data.count} page={data.page} pageSize={data.page_size} onPageChange={setPage} />
          </div>
        )}
      </section>

      {showCreate && <NewOrganizationModal onClose={() => setShowCreate(false)} />}
    </PlatformLayout>
  )
}
