import { useQueries, useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { StatTile } from '@/components/console/StatTile'
import { RespondentLayout } from '@/components/respondent/RespondentLayout'
import { Badge } from '@/components/ui/Badge'
import { fundDisbursementApi } from '@/lib/fund-disbursement-api'
import { installmentStatusLabel, installmentStatusTone } from '@/lib/status-display'

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function MyMilestonesPage() {
  const { data: funds } = useQuery({ queryKey: ['my-funds'], queryFn: fundDisbursementApi.myFunds })
  const details = useQueries({
    queries: (funds ?? []).map((f) => ({
      queryKey: ['my-fund', f.id],
      queryFn: () => fundDisbursementApi.myFund(f.id),
    })),
  })

  const rows = details
    .flatMap((q) => (q.data ? q.data.milestones.map((m) => ({ fund: q.data!, m })) : []))
    .sort((a, b) => (a.m.due_date ?? '9999').localeCompare(b.m.due_date ?? '9999'))

  const totalMilestones = details.reduce((sum, q) => sum + (q.data?.milestone_total ?? 0), 0)
  const today = new Date().toISOString().slice(0, 10)
  const isDone = (s: string) => s === 'disbursed' || s === 'cancelled'
  const open = rows.filter((r) => !isDone(r.m.installment.status))
  const overdue = open.filter((r) => r.m.due_date && r.m.due_date < today)

  return (
    <RespondentLayout title="Milestones & Deadlines" subtitle="Milestones currently open across your funds, soonest first.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Total milestones" value={totalMilestones} />
        <StatTile label="Open now" value={open.length} />
        <StatTile label="Overdue" value={overdue.length} />
      </div>

      <section className="mt-6 rounded-2xl border border-cream-300 bg-white p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-navy-500">
                <th className="pb-3 font-medium">Milestone</th>
                <th className="pb-3 font-medium">Fund</th>
                <th className="pb-3 font-medium">Deadline</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {rows.map(({ fund, m }) => (
                <tr key={m.id}>
                  <td className="py-3 font-medium text-navy-900">{m.title}</td>
                  <td className="py-3">
                    <Link to={`/my/funds/${fund.id}`} className="text-teal-600 hover:underline">
                      {fund.title}
                    </Link>
                  </td>
                  <td
                    className={`py-3 ${
                      !isDone(m.installment.status) && m.due_date && m.due_date < today
                        ? 'font-semibold text-danger-text'
                        : 'text-navy-700'
                    }`}
                  >
                    {formatDate(m.due_date)}
                  </td>
                  <td className="py-3 text-navy-700">
                    {m.installment.currency} {Number(m.installment.amount).toLocaleString()}
                  </td>
                  <td className="py-3">
                    <Badge tone={installmentStatusTone[m.installment.status]}>
                      {installmentStatusLabel[m.installment.status]}
                    </Badge>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-navy-500">
                    No milestones are open yet. They appear here as each one opens.
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
