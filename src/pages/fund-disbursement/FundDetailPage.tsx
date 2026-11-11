import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ConsoleLayout } from '@/components/console/ConsoleLayout'
import { MilestonesEditor } from '@/components/fund-disbursement/MilestonesEditor'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { extractErrorMessage } from '@/lib/api'
import { fundDisbursementApi } from '@/lib/fund-disbursement-api'
import { fundLifecycleTone, installmentStatusLabel, installmentStatusTone } from '@/lib/status-display'
import type { FundLifecycleStatus } from '@/types/fund-disbursement'

const TABS = ['Details', 'Milestones', 'Schedule'] as const
type Tab = (typeof TABS)[number]

const NEXT_TRANSITIONS: Record<FundLifecycleStatus, { status: FundLifecycleStatus; label: string; danger?: boolean }[]> = {
  draft: [
    { status: 'active', label: 'Activate fund' },
    { status: 'cancelled', label: 'Cancel', danger: true },
  ],
  active: [
    // { status: 'completed', label: 'Mark completed' },
    { status: 'suspended', label: 'Suspend' },
    { status: 'cancelled', label: 'Cancel', danger: true },
  ],
  suspended: [
    { status: 'active', label: 'Resume' },
    { status: 'cancelled', label: 'Cancel', danger: true },
  ],
  completed: [],
  cancelled: [],
}

export function FundDetailPage() {
  const { fundId } = useParams<{ fundId: string }>()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('Details')
  const [error, setError] = useState<string | null>(null)

  const { data: fund } = useQuery({
    queryKey: ['fd-fund', fundId],
    queryFn: () => fundDisbursementApi.fund(fundId!),
    enabled: Boolean(fundId),
  })
  const { data: installments } = useQuery({
    queryKey: ['fd-installments', fundId],
    queryFn: () => fundDisbursementApi.installments(fundId!),
    enabled: Boolean(fundId) && tab === 'Schedule',
  })

  const transitionMutation = useMutation({
    mutationFn: (status: FundLifecycleStatus) => fundDisbursementApi.transitionFund(fundId!, status),
    onSuccess: (updated) => {
      queryClient.setQueryData(['fd-fund', fundId], updated)
      queryClient.invalidateQueries({ queryKey: ['fd-funds'] })
      queryClient.invalidateQueries({ queryKey: ['fd-dashboard'] })
      setError(null)
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  if (!fund) {
    return (
      <ConsoleLayout title="Fund">
        <p className="text-sm text-navy-500">Loading…</p>
      </ConsoleLayout>
    )
  }

  return (
    <ConsoleLayout
      title={fund.title || 'Untitled fund'}
      subtitle={`${fund.recipient_name} · ${fund.currency} ${Number(fund.total_amount).toLocaleString()}`}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Badge tone={fundLifecycleTone[fund.lifecycle_status]}>{fund.lifecycle_status}</Badge>
        <div className="flex flex-wrap items-center gap-2">
          {NEXT_TRANSITIONS[fund.lifecycle_status].map((t) => (
            <Button
              key={t.status}
              fullWidth={false}
              variant={t.danger ? 'ghost' : 'primary'}
              className={t.danger ? 'border border-danger-text px-4 text-danger-text hover:bg-danger-bg' : 'px-4 py-2'}
              isLoading={transitionMutation.isPending}
              onClick={() => transitionMutation.mutate(t.status)}
            >
              {t.label}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      <div className="mb-6 flex gap-1 rounded-lg border border-cream-300 bg-white p-1">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === t ? 'bg-navy-900 text-white' : 'text-navy-600 hover:bg-cream-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Details' && (
        <div className="rounded-2xl border border-cream-300 bg-white p-6">
          <dl className="grid grid-cols-2 gap-5 text-sm">
            <div>
              <dt className="text-navy-500">Recipient</dt>
              <dd className="font-medium text-navy-900">{fund.recipient_name}</dd>
            </div>
            <div>
              <dt className="text-navy-500">Funding type</dt>
              <dd className="font-medium capitalize text-navy-900">{fund.funding_type.replace('_', ' ')}</dd>
            </div>
            <div>
              <dt className="text-navy-500">Total amount</dt>
              <dd className="font-medium text-navy-900">
                {fund.currency} {Number(fund.total_amount).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-navy-500">Sequencing</dt>
              <dd className="font-medium capitalize text-navy-900">{fund.sequencing}</dd>
            </div>
            <div>
              <dt className="text-navy-500">Start date</dt>
              <dd className="font-medium text-navy-900">{fund.start_date}</dd>
            </div>
            <div>
              <dt className="text-navy-500">Agreement reference</dt>
              <dd className="font-medium text-navy-900">{fund.agreement_reference || '—'}</dd>
            </div>
          </dl>
          {fund.notes && (
            <div className="mt-5 border-t border-cream-200 pt-4">
              <p className="text-xs uppercase tracking-wide text-navy-500">Notes</p>
              <p className="mt-1 text-sm text-navy-700">{fund.notes}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'Milestones' && <MilestonesEditor fundId={fund.id} currency={fund.currency} />}

      {tab === 'Schedule' && (
        <div className="rounded-2xl border border-cream-300 bg-white p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-navy-500">
                  <th className="pb-3 font-medium">#</th>
                  <th className="pb-3 font-medium">Milestone</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {installments?.map((inst) => (
                  <tr key={inst.id}>
                    <td className="py-3 text-navy-700">{inst.installment_no}</td>
                    <td className="py-3 font-medium text-navy-900">{inst.milestone.title}</td>
                    <td className="py-3 text-navy-700">
                      {inst.currency} {Number(inst.amount).toLocaleString()}
                    </td>
                    <td className="py-3">
                      <Badge tone={installmentStatusTone[inst.status]}>{installmentStatusLabel[inst.status]}</Badge>
                    </td>
                    <td className="py-3 text-right">
                      <Link to={`/fund-disbursement/installments/${inst.id}`} className="text-sm font-semibold text-teal-600 hover:underline">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
                {installments?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-sm text-navy-500">
                      No milestones yet — add them from the Milestones tab.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ConsoleLayout>
  )
}
