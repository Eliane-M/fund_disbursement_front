import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'

import { PlatformLayout } from '@/components/platform/PlatformLayout'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { DropdownMenu } from '@/components/ui/DropdownMenu'
import { KeyIcon, MoreVerticalIcon, PauseIcon, PencilIcon, PlayIcon, SlidersIcon, TrashIcon } from '@/components/ui/icons'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { SearchFilterBar } from '@/components/ui/SearchFilterBar'
import { TextField } from '@/components/ui/TextField'
import { useAuth } from '@/hooks/useAuth'
import { extractErrorMessage } from '@/lib/api'
import { PHONE_HINT, phoneValidationError } from '@/lib/phone'
import { platformApi } from '@/lib/platform-api'
import type { PlatformUser } from '@/types/platform'

const PAGE_SIZE = 10

const STATUS_TONE = {
  active: 'success',
  pending: 'trial',
  disabled: 'neutral',
} as const

function EditUserModal({ user, onClose }: { user: PlatformUser; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [firstName, setFirstName] = useState(user.first_name)
  const [lastName, setLastName] = useState(user.last_name)
  const [phoneNumber, setPhoneNumber] = useState(user.phone_number)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      platformApi.updateUser(user.id, {
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber.trim(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-users'] })
      onClose()
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const nextPhoneError = phoneValidationError(phoneNumber)
    setPhoneError(nextPhoneError)
    if (nextPhoneError) return
    setError(null)
    mutation.mutate()
  }

  return (
    <Modal title="Edit user" onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error && <Alert tone="error">{error}</Alert>}
        <TextField label="Email" value={user.email} disabled />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="First name" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <TextField label="Last name" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <TextField
          label="Contact"
          type="tel"
          value={phoneNumber}
          onChange={(e) => {
            setPhoneNumber(e.target.value)
            setPhoneError(null)
          }}
          hint={PHONE_HINT}
          error={phoneError ?? undefined}
        />
        <Button type="submit" isLoading={mutation.isPending}>
          Save changes
        </Button>
      </form>
    </Modal>
  )
}

function AddAdminModal({ onClose, onCreated }: { onClose: () => void; onCreated: (email: string) => void }) {
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      platformApi.createPlatformAdmin({
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone_number: phoneNumber.trim(),
      }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['platform-users'] })
      onCreated(created.email)
      onClose()
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const nextPhoneError = phoneValidationError(phoneNumber)
    setPhoneError(nextPhoneError)
    if (nextPhoneError) return
    setError(null)
    mutation.mutate()
  }

  return (
    <Modal title="Add system admin" onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error && <Alert tone="error">{error}</Alert>}
        <TextField label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="First name" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <TextField label="Last name" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <TextField
          label="Contact"
          type="tel"
          value={phoneNumber}
          onChange={(e) => {
            setPhoneNumber(e.target.value)
            setPhoneError(null)
          }}
          hint={PHONE_HINT}
          error={phoneError ?? undefined}
        />
        <p className="text-xs text-navy-500">
          They'll get a temporary password by email and set their own on first sign-in.
        </p>
        <Button type="submit" isLoading={mutation.isPending}>
          Create system admin
        </Button>
      </form>
    </Modal>
  )
}

export function UsersPage() {
  const { user: currentUser } = useAuth()
  const [showAdd, setShowAdd] = useState(false)
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [editingUser, setEditingUser] = useState<PlatformUser | null>(null)
  const [deletingUser, setDeletingUser] = useState<PlatformUser | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data } = useQuery({
    queryKey: ['platform-users', submittedSearch, page],
    queryFn: () => platformApi.users({ search: submittedSearch, is_platform_admin: true, page, page_size: PAGE_SIZE }),
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['platform-users'] })
  }

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'disabled' }) =>
      platformApi.updateUser(id, { status }),
    onSuccess: invalidate,
    onError: (err) => setError(extractErrorMessage(err)),
  })

  const resetPasswordMutation = useMutation({
    mutationFn: (id: string) => platformApi.resetUserPassword(id),
    onSuccess: (res) => setNotice(res.detail),
    onError: (err) => setError(extractErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => platformApi.deleteUser(id),
    onSuccess: () => {
      invalidate()
      setDeletingUser(null)
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  function handleSearch() {
    setPage(1)
    setSubmittedSearch(search)
  }

  return (
    <PlatformLayout title="System admins" subtitle="Administrators of the whole platform. Organization users are managed from each organization's page."
      actions={
        <Button fullWidth={false} className="px-4 py-2" onClick={() => setShowAdd(true)}>
          + Add system admin
        </Button>
      }>
      <Breadcrumb items={[{ label: 'Platform Console' }, { label: 'System admins' }]} />
      <section className="rounded-2xl border border-cream-300 bg-white p-6">
        {notice && (
          <div className="mb-4">
            <Alert tone="success">{notice}</Alert>
          </div>
        )}
        {error && (
          <div className="mb-4">
            <Alert tone="error">{error}</Alert>
          </div>
        )}

        <SearchFilterBar search={search} onSearchChange={setSearch} onSubmit={handleSearch} placeholder="Search system admins…" />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-navy-500">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Contact</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {data?.results.map((u) => (
                <tr key={u.id}>
                  <td className="py-3 font-medium text-navy-900">{u.full_name || '—'}</td>
                  <td className="py-3 text-navy-600">{u.email}</td>
                  <td className="py-3 text-navy-600">{u.phone_number || '—'}</td>
                  <td className="py-3">
                    <Badge tone={STATUS_TONE[u.status]}>{u.status}</Badge>
                  </td>
                  <td className="py-3">
                    <DropdownMenu
                      trigger={<MoreVerticalIcon />}
                      items={[
                        {
                          label: 'Edit User',
                          icon: <PencilIcon />,
                          onClick: () => setEditingUser(u),
                        },
                        ...(u.id === currentUser?.id
                          ? []
                          : [
                        u.status === 'disabled'
                          ? {
                              label: 'Activate',
                              icon: <PlayIcon />,
                              onClick: () => toggleStatusMutation.mutate({ id: u.id, status: 'active' }),
                            }
                          : {
                              label: 'Deactivate',
                              icon: <PauseIcon />,
                              onClick: () => toggleStatusMutation.mutate({ id: u.id, status: 'disabled' }),
                            },
                          ]),
                        {
                          label: 'Permissions',
                          icon: <SlidersIcon />,
                          onClick: () => {},
                          disabled: true,
                        },
                        {
                          label: 'Reset Password',
                          icon: <KeyIcon />,
                          onClick: () => resetPasswordMutation.mutate(u.id),
                        },
                        ...(u.id === currentUser?.id
                          ? []
                          : [
                              {
                                label: 'Delete',
                                icon: <TrashIcon />,
                                tone: 'danger' as const,
                                onClick: () => setDeletingUser(u),
                              },
                            ]),
                      ]}
                    />
                  </td>
                </tr>
              ))}
              {data?.results.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-navy-500">
                    No system admins found.
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

      {showAdd && <AddAdminModal onClose={() => setShowAdd(false)} onCreated={(email) => setNotice(`System admin created. A temporary password was emailed to ${email}.`)} />}

      {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} />}

      {deletingUser && (
        <ConfirmDialog
          title="Delete user"
          message={`Delete ${deletingUser.full_name || deletingUser.email}? This removes their account and all organization memberships. This can't be undone.`}
          confirmLabel="Delete"
          danger
          isLoading={deleteMutation.isPending}
          onCancel={() => setDeletingUser(null)}
          onConfirm={() => deleteMutation.mutate(deletingUser.id)}
        />
      )}
    </PlatformLayout>
  )
}
