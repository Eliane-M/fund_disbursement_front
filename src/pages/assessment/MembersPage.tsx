import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { ConsoleLayout } from '@/components/console/ConsoleLayout'
import { InviteMemberModal } from '@/components/console/InviteMemberModal'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { DropdownMenu } from '@/components/ui/DropdownMenu'
import { MoreVerticalIcon, PauseIcon, PencilIcon, PlayIcon, TrashIcon } from '@/components/ui/icons'
import { useAuth } from '@/hooks/useAuth'
import { useOrganization } from '@/hooks/useOrganization'
import { extractErrorMessage } from '@/lib/api'
import type { Membership } from '@/types/assessment'
import { coreApi } from '@/lib/core-api'

export function MembersPage() {
  const { user } = useAuth()
  const { activeOrganization } = useOrganization()
  const orgId = activeOrganization!.id
  const queryClient = useQueryClient()
  const [showInvite, setShowInvite] = useState(false)
  const [removing, setRemoving] = useState<Membership | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data: members } = useQuery({
    queryKey: ['members', orgId],
    queryFn: () => coreApi.members(orgId),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['members', orgId] })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...payload }: { id: string; role?: Membership['role']; status?: string }) =>
      coreApi.updateMembership(id, payload),
    onSuccess: () => {
      setError(null)
      invalidate()
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => coreApi.removeMembership(id),
    onSuccess: () => {
      setRemoving(null)
      invalidate()
    },
    onError: (err) => {
      setRemoving(null)
      setError(extractErrorMessage(err))
    },
  })

  return (
    <ConsoleLayout title="Users">
      <section className="rounded-2xl border border-cream-300 bg-white p-6">
        {error && (
          <div className="mb-4">
            <Alert tone="error">{error}</Alert>
          </div>
        )}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-navy-900">All users</h2>
          <Button fullWidth={false} className="px-4 py-2" onClick={() => setShowInvite(true)}>
            + Add user
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-navy-500">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
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
                  <td className="py-3">
                    {m.user !== user?.id && (
                      <DropdownMenu
                        trigger={<MoreVerticalIcon />}
                        items={[
                          ...(m.role === 'respondent'
                            ? []
                            : [
                                {
                                  label: m.role === 'org_admin' ? 'Make reviewer' : 'Make org admin',
                                  icon: <PencilIcon />,
                                  onClick: () =>
                                    updateMutation.mutate({
                                      id: m.id,
                                      role: m.role === 'org_admin' ? 'reviewer' : 'org_admin',
                                    }),
                                },
                              ]),
                          m.status === 'suspended'
                            ? {
                                label: 'Activate',
                                icon: <PlayIcon />,
                                onClick: () => updateMutation.mutate({ id: m.id, status: 'active' }),
                              }
                            : {
                                label: 'Deactivate',
                                icon: <PauseIcon />,
                                onClick: () => updateMutation.mutate({ id: m.id, status: 'suspended' }),
                              },
                          {
                            label: 'Remove',
                            icon: <TrashIcon />,
                            tone: 'danger' as const,
                            onClick: () => setRemoving(m),
                          },
                        ]}
                      />
                    )}
                  </td>
                </tr>
              ))}
              {members?.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-navy-500">
                    No users yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {removing && (
        <ConfirmDialog
          title="Remove user"
          message={`Remove ${removing.full_name || removing.email} from this organization? They will lose access to it.`}
          confirmLabel="Remove"
          danger
          isLoading={removeMutation.isPending}
          onCancel={() => setRemoving(null)}
          onConfirm={() => removeMutation.mutate(removing.id)}
        />
      )}

      {showInvite && (
        <InviteMemberModal
          onClose={() => {
            setShowInvite(false)
            queryClient.invalidateQueries({ queryKey: ['members', orgId] })
          }}
          onInvite={(payload) => coreApi.inviteMember(orgId, payload)}
        />
      )}
    </ConsoleLayout>
  )
}
