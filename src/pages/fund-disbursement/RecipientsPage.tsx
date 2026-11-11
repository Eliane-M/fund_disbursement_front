import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { ConsoleLayout } from '@/components/console/ConsoleLayout'
import { Badge } from '@/components/ui/Badge'
import { useOrganization } from '@/hooks/useOrganization'
import { coreApi } from '@/lib/core-api'

export function RecipientsPage() {
  const { activeOrganization } = useOrganization()
  const orgId = activeOrganization!.id
  const navigate = useNavigate()

  const { data: respondents } = useQuery({
    queryKey: ['respondents', orgId],
    queryFn: () => coreApi.respondents(orgId),
  })

  return (
    <ConsoleLayout title="Recipients" subtitle="Organizations and individuals eligible to receive funds">
      <section className="rounded-2xl border border-cream-300 bg-white p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-navy-500">
                <th className="pb-3 font-medium">Recipient</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {respondents?.map((r) => (
                <tr key={r.id}>
                  <td className="py-3">
                    <p className="font-medium text-navy-900">{r.name}</p>
                    <p className="text-xs text-navy-500">{r.category_name || '—'}</p>
                  </td>
                  <td className="py-3 capitalize text-navy-700">{r.respondent_type}</td>
                  <td className="py-3">
                    <Badge tone={r.status === 'active' ? 'success' : 'neutral'}>{r.status}</Badge>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => navigate(`/fund-disbursement/funds/new?recipient=${r.id}`)}
                      className="text-sm font-semibold text-teal-600 hover:underline"
                    >
                      New fund →
                    </button>
                  </td>
                </tr>
              ))}
              {respondents?.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-sm text-navy-500">
                    No recipients yet. Add respondents from the Assessment module first.
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
