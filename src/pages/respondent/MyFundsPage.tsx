import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { StatTile } from '@/components/console/StatTile'
import { GrantCelebration } from '@/components/respondent/GrantCelebration'
import { RespondentLayout } from '@/components/respondent/RespondentLayout'
import { Badge } from '@/components/ui/Badge'
import { fundDisbursementApi } from '@/lib/fund-disbursement-api'
import { fundHealthLabel, fundHealthTone, fundLifecycleTone } from '@/lib/status-display'

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function MyFundsPage() {
  const { data: funds, isLoading } = useQuery({ queryKey: ['my-funds'], queryFn: fundDisbursementApi.myFunds })

  const list = funds ?? []
  const committed = list.reduce((sum, f) => sum + Number(f.total_amount), 0)
  const received = list.reduce((sum, f) => sum + Number(f.disbursed_total ?? 0), 0)
  const currency = list[0]?.currency ?? ''

  return (
    <RespondentLayout title="Funds & Grants" subtitle="Funding that has been granted to you.">
      {funds && <GrantCelebration funds={funds} />}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Funds granted" value={isLoading ? '—' : list.length} />
        <StatTile label="Total committed" value={`${currency} ${committed.toLocaleString()}`.trim()} />
        <StatTile label="Received so far" value={`${currency} ${received.toLocaleString()}`.trim()} />
      </div>

      <section className="mt-6 rounded-2xl border border-cream-300 bg-white p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-navy-500">
                <th className="pb-3 font-medium">Fund</th>
                <th className="pb-3 font-medium">Granted by</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Received</th>
                <th className="pb-3 font-medium">Milestones</th>
                <th className="pb-3 font-medium">Period</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {list.map((fund) => (
                <tr key={fund.id}>
                  <td className="py-3 font-medium text-navy-900">{fund.title}</td>
                  <td className="py-3 text-navy-700">{fund.organization_name}</td>
                  <td className="py-3 text-navy-700">
                    {fund.currency} {Number(fund.total_amount).toLocaleString()}
                  </td>
                  <td className="py-3 text-navy-700">
                    {fund.currency} {Number(fund.disbursed_total ?? 0).toLocaleString()}
                  </td>
                  <td className="py-3 text-navy-700">{fund.milestone_count}</td>
                  <td className="py-3 text-navy-700">
                    {formatDate(fund.start_date)} – {formatDate(fund.end_date)}
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                      <Badge tone={fundLifecycleTone[fund.lifecycle_status]}>{fund.lifecycle_status}</Badge>
                      <Badge tone={fundHealthTone[fund.health_status]}>{fundHealthLabel[fund.health_status]}</Badge>
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <Link to={`/my/funds/${fund.id}`} className="text-sm font-semibold text-teal-600 hover:underline">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
              {!isLoading && list.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-sm text-navy-500">
                    No funds have been granted to you yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </RespondentLayout>
  )
}
