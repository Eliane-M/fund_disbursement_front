import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { ConsoleLayout } from '@/components/console/ConsoleLayout'
import { InstallmentDetailPanel } from '@/components/fund-disbursement/InstallmentDetailPanel'
import { useOrganization } from '@/hooks/useOrganization'
import { fundDisbursementApi } from '@/lib/fund-disbursement-api'

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

export function MilestoneReviewPage() {
  const { activeOrganization } = useOrganization()
  const orgId = activeOrganization!.id
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data: queue } = useQuery({
    queryKey: ['review-queue', orgId],
    queryFn: () => fundDisbursementApi.reviewQueue(orgId),
  })

  const selected = queue?.find((q) => q.id === selectedId) ?? queue?.[0]
  const effectiveSelectedId = selected?.id ?? null

  return (
    <ConsoleLayout title={selected ? selected.milestone.title : 'Evidence Queue'} subtitle={selected ? `Evidence Queue / ${selected.recipient_name}` : undefined}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[20rem_1fr]">
        <div className="rounded-2xl border border-cream-300 bg-white p-4">
          <p className="mb-3 text-sm font-semibold text-navy-900">Pending review ({queue?.length ?? 0})</p>
          <div className="flex flex-col gap-2">
            {queue?.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  effectiveSelectedId === item.id ? 'border-amber-400 bg-amber-100/40' : 'border-cream-300 hover:border-navy-300'
                }`}
              >
                <p className="text-sm font-semibold text-navy-900">{item.recipient_name}</p>
                <p className="text-xs text-navy-600">
                  Milestone {item.milestone.sequence_position} — {item.milestone.title}
                </p>
                <p className="mt-1 text-xs text-navy-400">
                  {item.latest_submission ? `Submitted ${timeAgo(item.latest_submission.submitted_at)}` : 'Awaiting evidence'}
                </p>
              </button>
            ))}
            {queue?.length === 0 && <p className="text-sm text-navy-500">Nothing needs review right now.</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-cream-300 bg-white p-6">
          {selected ? (
            <InstallmentDetailPanel installmentId={selected.id} />
          ) : (
            <p className="text-sm text-navy-500">Select an item from the queue to review it.</p>
          )}
        </div>
      </div>
    </ConsoleLayout>
  )
}
