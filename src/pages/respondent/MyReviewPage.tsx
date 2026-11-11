import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'

import { StatTile } from '@/components/console/StatTile'
import { RespondentLayout } from '@/components/respondent/RespondentLayout'
import { Alert } from '@/components/ui/Alert'
import { assessmentApi } from '@/lib/assessment-api'
import { maturityBandColor } from '@/lib/status-display'

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function MyReviewPage() {
  const [searchParams] = useSearchParams()
  const justSubmitted = searchParams.get('submitted') === '1'

  const { data: invitations } = useQuery({
    queryKey: ['my-assessments'],
    queryFn: assessmentApi.myAssessments,
  })
  const { data: reports, isLoading } = useQuery({
    queryKey: ['my-reports'],
    queryFn: assessmentApi.myReports,
  })

  const awaiting = (invitations ?? []).filter((i) => i.status === 'submitted' && !i.report)
  const average = reports?.length
    ? reports.reduce((sum, r) => sum + Number(r.overall_score), 0) / reports.length
    : null

  return (
    <RespondentLayout title="Review" subtitle="How you did on your assessments.">
      {justSubmitted && (
        <div className="mb-4">
          <Alert tone="success">
            Your assessment was submitted and scored. The organization's reviewers have been notified, and
            your score will appear here once they share it.
          </Alert>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Scores available" value={reports?.length ?? '—'} />
        <StatTile label="Awaiting results" value={awaiting.length} />
        <StatTile label="Average score" value={average === null ? '—' : average.toFixed(0)} />
      </div>

      <section className="mt-6 rounded-2xl border border-cream-300 bg-white p-6">
        <h2 className="text-base font-semibold text-navy-900">Your results</h2>
        <p className="mb-4 mt-1 text-sm text-navy-500">
          A score appears here once the organization that assessed you shares it.
        </p>
        <div className="flex flex-col gap-3">
          {reports?.map((report) => (
            <div
              key={report.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-cream-300 p-4"
            >
              <div>
                <p className="font-medium text-navy-900">{report.assessment_name || 'Assessment'}</p>
                <p className="text-xs text-navy-500">
                  {report.organization_name} · shared {formatDate(report.shared_at)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-navy-900">
                  {Number(report.overall_score).toFixed(0)}
                  <span className="text-sm font-medium text-navy-500">/100</span>
                </p>
                <p className={`text-xs font-medium ${maturityBandColor(report.maturity_band_label)}`}>
                  {report.maturity_band_label}
                </p>
                <Link to={`/my/review/${report.id}`} className="text-sm font-semibold text-teal-600 hover:underline">
                  View full report →
                </Link>
              </div>
            </div>
          ))}
          {awaiting.map((invitation) => (
            <div
              key={invitation.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-dashed border-cream-300 p-4"
            >
              <div>
                <p className="font-medium text-navy-900">{invitation.assessment_name}</p>
                <p className="text-xs text-navy-500">
                  {invitation.organization_name} · submitted {formatDate(invitation.submitted_at)}
                </p>
              </div>
              <span className="text-sm text-navy-500">Awaiting results</span>
            </div>
          ))}
          {!isLoading && reports?.length === 0 && awaiting.length === 0 && (
            <p className="text-sm text-navy-500">No results yet. Complete an assessment to see how you did.</p>
          )}
        </div>
      </section>
    </RespondentLayout>
  )
}
