import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { ConsoleLayout } from '@/components/console/ConsoleLayout'
import { StatTile } from '@/components/console/StatTile'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useOrganization } from '@/hooks/useOrganization'
import { fundDisbursementApi } from '@/lib/fund-disbursement-api'
import { fundHealthLabel, fundHealthTone } from '@/lib/status-display'

export function DashboardPage() {
  const { activeOrganization } = useOrganization()
  const orgId = activeOrganization!.id

  const { data: stats } = useQuery({
    queryKey: ['fd-dashboard', orgId],
    queryFn: () => fundDisbursementApi.dashboard(orgId),
  })
  const { data: funds } = useQuery({
    queryKey: ['fd-funds', orgId],
    queryFn: () => fundDisbursementApi.funds(orgId),
  })

  return (
    <ConsoleLayout title="Dashboard">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Committed capital" value={stats ? `$${stats.total_committed.toLocaleString()}` : '—'} />
        <StatTile label="Disbursed to date" value={stats ? `$${stats.total_disbursed.toLocaleString()}` : '—'} />
        <StatTile label="Active funds" value={stats?.active_funds ?? '—'} />
        <StatTile label="Installments awaiting review" value={stats?.installments_pending_review ?? '—'} />
      </div>

      <section className="mt-6 rounded-2xl border border-cream-300 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-navy-900">Active funds &amp; grants</h2>
          <Link to="/fund-disbursement/funds/new">
            <Button fullWidth={false} className="px-4 py-2">
              + New fund
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-navy-500">
                <th className="pb-3 font-medium">Recipient</th>
                <th className="pb-3 font-medium">Installments</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {funds?.map((f) => {
                const disbursed = Number(f.disbursed_total ?? 0)
                const total = Number(f.total_amount)
                const pct = total > 0 ? Math.min(100, (disbursed / total) * 100) : 0
                return (
                  <tr key={f.id}>
                    <td className="py-3">
                      <p className="font-medium text-navy-900">{f.recipient_name}</p>
                      <p className="text-xs capitalize text-navy-500">
                        {f.funding_type.replace('_', ' ')} · ${total.toLocaleString()}
                      </p>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-28 rounded-full bg-cream-200">
                          <div className="h-1.5 rounded-full bg-navy-700" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-navy-700">{f.milestone_count} milestones</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge tone={fundHealthTone[f.health_status]}>{fundHealthLabel[f.health_status]}</Badge>
                    </td>
                    <td className="py-3 text-right">
                      <Link to={`/fund-disbursement/funds/${f.id}`} className="text-sm font-semibold text-teal-600 hover:underline">
                        Open fund →
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {funds?.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-sm text-navy-500">
                    No funds yet. Create your first one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </ConsoleLayout>
  )
}
