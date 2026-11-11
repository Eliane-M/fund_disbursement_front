import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { ConsoleLayout } from '@/components/console/ConsoleLayout'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useOrganization } from '@/hooks/useOrganization'
import { fundDisbursementApi } from '@/lib/fund-disbursement-api'
import { fundLifecycleTone } from '@/lib/status-display'

export function FundsListPage() {
  const { activeOrganization } = useOrganization()
  const orgId = activeOrganization!.id
  const [search, setSearch] = useState('')

  const { data: funds } = useQuery({
    queryKey: ['fd-funds', orgId],
    queryFn: () => fundDisbursementApi.funds(orgId),
  })

  const filtered = funds?.filter(
    (f) =>
      !search.trim() ||
      f.recipient_name.toLowerCase().includes(search.toLowerCase()) ||
      f.title.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <ConsoleLayout
      title="Funds & Grants"
    >
      <div className="mb-4 flex justify-end">
        <Link to="/fund-disbursement/funds/new">
          <Button fullWidth={false} className="px-4 py-2">
            + New fund
          </Button>
        </Link>
      </div>
      <section className="rounded-2xl border border-cream-300 bg-white p-6">
        <div className="mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by recipient or title…"
            className="w-64 rounded-lg border border-cream-300 bg-white px-3.5 py-2 text-sm text-navy-900 placeholder:text-navy-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-navy-500">
                <th className="pb-3 font-medium">Fund</th>
                <th className="pb-3 font-medium">Recipient</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Milestones</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {filtered?.map((f) => (
                <tr key={f.id}>
                  <td className="py-3">
                    <p className="font-medium text-navy-900">{f.title || 'Untitled fund'}</p>
                    <p className="text-xs capitalize text-navy-500">{f.funding_type.replace('_', ' ')}</p>
                  </td>
                  <td className="py-3 text-navy-700">{f.recipient_name}</td>
                  <td className="py-3 text-navy-700">
                    {f.currency} {Number(f.total_amount).toLocaleString()}
                  </td>
                  <td className="py-3 text-navy-700">{f.milestone_count}</td>
                  <td className="py-3">
                    <Badge tone={fundLifecycleTone[f.lifecycle_status]}>{f.lifecycle_status}</Badge>
                  </td>
                  <td className="py-3 text-right">
                    <Link to={`/fund-disbursement/funds/${f.id}`} className="text-sm font-semibold text-teal-600 hover:underline">
                      Open fund →
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered?.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm text-navy-500">
                    No funds found.
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
