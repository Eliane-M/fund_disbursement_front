import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { ConsoleLayout } from '@/components/console/ConsoleLayout'
import { InviteMemberModal } from '@/components/console/InviteMemberModal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useOrganization } from '@/hooks/useOrganization'
import { coreApi } from '@/lib/core-api'

export function MembersPage() {
  const { activeOrganization } = useOrganization()
  const orgId = activeOrganization!.id
  const queryClient = useQueryClient()
  const [showInvite, setShowInvite] = useState(false)

  const { data: members } = useQuery({
    queryKey: ['members', orgId],
    queryFn: () => coreApi.members(orgId),
  })

  return (
    <ConsoleLayout title="Team members">
      <section className="rounded-2xl border border-cream-300 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-navy-900">All members</h2>
          <Button fullWidth={false} className="px-4 py-2" onClick={() => setShowInvite(true)}>
            + Invite member
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
                    No team members yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

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
