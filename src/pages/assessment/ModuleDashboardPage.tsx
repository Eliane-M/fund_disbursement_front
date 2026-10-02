import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { ConsoleLayout } from '@/components/console/ConsoleLayout'
import { StatTile } from '@/components/console/StatTile'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useOrganization } from '@/hooks/useOrganization'
import { assessmentApi } from '@/lib/assessment-api'
import { assessmentStatusTone, maturityBandColor, reportShareStatusLabel, reportShareStatusTone } from '@/lib/status-display'

export function ModuleDashboardPage() {
  const { activeOrganization } = useOrganization()
  const orgId = activeOrganization!.id

  const { data: stats } = useQuery({
    queryKey: ['dashboard', orgId],
    queryFn: () => assessmentApi.dashboard(orgId),
  })
  const { data: assessments } = useQuery({
    queryKey: ['assessments', orgId],
    queryFn: () => assessmentApi.assessments(orgId),
  })
  const { data: reports } = useQuery({
    queryKey: ['reports', orgId],
    queryFn: () => assessmentApi.reports(orgId),
  })

  return (
    <ConsoleLayout title="Dashboard">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Active assessments" value={stats?.active_assessments ?? '—'} />
        <StatTile label="Respondents invited" value={stats?.respondents_invited ?? '—'} />
        <StatTile
          label="Avg. maturity score"
          value={stats?.avg_maturity_score != null ? stats.avg_maturity_score.toFixed(1) : '—'}
        />
        <StatTile label="Reports shared" value={stats?.reports_shared ?? '—'} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-cream-300 bg-white p-6 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-navy-900">Assessment frameworks</h2>
            <Link to="/assessment/builder/new">
              <Button fullWidth={false} className="px-4 py-2">
                + New assessment
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-navy-500">
                  <th className="pb-3 font-medium">Framework</th>
                  <th className="pb-3 font-medium">Respondents</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {assessments?.map((a) => (
                  <tr key={a.id}>
                    <td className="py-3">
                      <p className="font-medium text-navy-900">{a.name}</p>
                      <p className="text-xs text-navy-500">{a.category_name}</p>
                    </td>
                    <td className="py-3 text-navy-700">{a.respondent_count} respondents</td>
                    <td className="py-3">
                      <Badge tone={assessmentStatusTone[a.status]}>{a.status}</Badge>
                    </td>
                    <td className="py-3 text-right">
                      <Link to={`/assessment/builder/${a.id}`} className="text-sm font-semibold text-teal-600 hover:underline">
                        Open builder →
                      </Link>
                    </td>
                  </tr>
                ))}
                {assessments?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-sm text-navy-500">
                      No assessments yet. Create your first one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-cream-300 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-navy-900">Module adoption</h2>
          <p className="text-sm text-navy-500">
            Modules run as independent service domains — no shared data between them beyond the common
            respondent record.
          </p>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-cream-300 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-navy-900">Recent respondents</h2>
          <Link to="/assessment/reports" className="text-sm font-semibold text-teal-600 hover:underline">
            View all →
          </Link>
        </div>
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
              {reports?.slice(0, 6).map((r) => (
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
                    <Link to={`/assessment/reports/${r.id}`} className="text-sm font-semibold text-teal-600 hover:underline">
                      View report →
                    </Link>
                  </td>
                </tr>
              ))}
              {reports?.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-navy-500">
                    No respondents yet.
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
