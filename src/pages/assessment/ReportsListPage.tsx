import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { ConsoleLayout } from '@/components/console/ConsoleLayout'
import { Badge } from '@/components/ui/Badge'
import { useOrganization } from '@/hooks/useOrganization'
import { assessmentApi } from '@/lib/assessment-api'
import { maturityBandColor, reportShareStatusLabel, reportShareStatusTone } from '@/lib/status-display'

export function ReportsListPage() {
  const { activeOrganization } = useOrganization()
  const orgId = activeOrganization!.id

  const { data: reports } = useQuery({
    queryKey: ['reports', orgId],
    queryFn: () => assessmentApi.reports(orgId),
  })

  return (
    <ConsoleLayout title="Reports">
      <section className="rounded-2xl border border-cream-300 bg-white p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-navy-500">
                <th className="pb-3 font-medium">Respondent</th>
                <th className="pb-3 font-medium">Overall score</th>
                <th className="pb-3 font-medium">Maturity band</th>
                <th className="pb-3 font-medium">Report status</th>
                <th className="pb-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {reports?.map((r) => (
                <tr key={r.id}>
                  <td className="py-3">
                    <p className="font-medium text-navy-900">{r.respondent_name}</p>
                    <p className="text-xs text-navy-500">{r.category_name}</p>
                  </td>
                  <td className="py-3 text-navy-700">{Number(r.overall_score).toFixed(0)}/100</td>
                  <td className={`py-3 font-medium ${maturityBandColor(r.maturity_band_label)}`}>
                    {r.maturity_band_label}
                  </td>
                  <td className="py-3">
                    <Badge tone={reportShareStatusTone[r.share_status]}>
                      {reportShareStatusLabel[r.share_status]}
                    </Badge>
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      to={`/assessment/reports/${r.id}`}
                      className="text-sm font-semibold text-teal-600 hover:underline"
                    >
                      View report →
                    </Link>
                  </td>
                </tr>
              ))}
              {reports?.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-navy-500">
                    No reports yet.
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
