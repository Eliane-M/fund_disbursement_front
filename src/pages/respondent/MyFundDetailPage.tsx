import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'

import { MilestoneActivity } from '@/components/respondent/MilestoneActivity'
import { RespondentLayout } from '@/components/respondent/RespondentLayout'
import { Badge } from '@/components/ui/Badge'
import { fundDisbursementApi } from '@/lib/fund-disbursement-api'
import { installmentStatusLabel, installmentStatusTone } from '@/lib/status-display'

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function MyFundDetailPage() {
  const { fundId = '' } = useParams()
  const { data: fund, isLoading } = useQuery({
    queryKey: ['my-fund', fundId],
    queryFn: () => fundDisbursementApi.myFund(fundId),
  })

  if (isLoading || !fund) {
    return <RespondentLayout title="Loading…">{null}</RespondentLayout>
  }

  return (
    <RespondentLayout
      title={fund.title}
      subtitle={`${fund.organization_name} · ${fund.currency} ${Number(fund.total_amount).toLocaleString()}`}
    >
      <section className="rounded-2xl border border-cream-300 bg-white p-6">
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-navy-500">Funding type</dt>
            <dd className="mt-1 font-medium capitalize text-navy-900">{fund.funding_type.replace('_', ' ')}</dd>
          </div>
          <div>
            <dt className="text-navy-500">Start</dt>
            <dd className="mt-1 font-medium text-navy-900">{formatDate(fund.start_date)}</dd>
          </div>
          <div>
            <dt className="text-navy-500">End</dt>
            <dd className="mt-1 font-medium text-navy-900">{formatDate(fund.end_date)}</dd>
          </div>
          <div>
            <dt className="text-navy-500">Milestone order</dt>
            <dd className="mt-1 font-medium capitalize text-navy-900">{fund.sequencing}</dd>
          </div>
        </dl>
        {fund.notes && <p className="mt-4 text-sm text-navy-700">{fund.notes}</p>}
      </section>

      <section className="mt-6 rounded-2xl border border-cream-300 bg-white p-6">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold text-navy-900">Milestones</h2>
          <p className="text-sm text-navy-500">
            {fund.milestone_total} in total · {fund.milestones.length} open
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {fund.milestones.map((m) => (
            <div key={m.id} className="rounded-xl border border-cream-300 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-navy-900">
                    {m.sequence_position}. {m.title}
                  </p>
                  {m.deliverable_description && (
                    <p className="mt-1 text-sm text-navy-600">{m.deliverable_description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-navy-900">
                    {m.installment.currency} {Number(m.installment.amount).toLocaleString()}
                  </p>
                  <Badge tone={installmentStatusTone[m.installment.status]}>
                    {installmentStatusLabel[m.installment.status]}
                  </Badge>
                </div>
              </div>
              <p className="mt-2 text-xs text-navy-500">
                Due {formatDate(m.due_date)}
                {m.installment.disbursed_at && ` · Paid ${formatDate(m.installment.disbursed_at)}`}
              </p>
              {(m.kpis.length > 0 || m.evidence_requirements.length > 0) && (
                <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                  {m.kpis.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">Targets</p>
                      <ul className="mt-1 list-disc pl-4 text-navy-700">
                        {m.kpis.map((k) => (
                          <li key={k.id ?? k.name}>
                            {k.name}
                            {k.target_value !== null && ` — ${k.target_value}${k.unit ? ` ${k.unit}` : ''}`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {m.evidence_requirements.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                        Evidence required
                      </p>
                      <ul className="mt-1 list-disc pl-4 text-navy-700">
                        {m.evidence_requirements.map((e) => (
                          <li key={e.id ?? e.label}>{e.label}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              <MilestoneActivity milestone={m} fundId={fund.id} />
            </div>
          ))}
          {fund.milestone_total > fund.milestones.length && (
            <p className="rounded-xl border border-dashed border-cream-300 p-4 text-sm text-navy-500">
              {fund.milestone_total - fund.milestones.length} more milestone
              {fund.milestone_total - fund.milestones.length === 1 ? '' : 's'} will be revealed as they open for
              evidence.
            </p>
          )}
          {fund.milestone_total === 0 && <p className="text-sm text-navy-500">No milestones set yet.</p>}
        </div>
      </section>

      <div className="mt-4">
        <Link to="/my/funds" className="text-sm font-semibold text-teal-600 hover:underline">
          ← Back to funds
        </Link>
      </div>
    </RespondentLayout>
  )
}
