import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'

import { ReportAnalysis } from '@/components/assessment/ReportAnalysis'
import { RespondentLayout } from '@/components/respondent/RespondentLayout'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { assessmentApi } from '@/lib/assessment-api'
import { printReport } from '@/lib/print-report'

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function MyReportPage() {
  const { reportId = '' } = useParams()
  const { data: report, isLoading } = useQuery({
    queryKey: ['my-report', reportId],
    queryFn: () => assessmentApi.myReport(reportId),
  })

  if (isLoading || !report) {
    return <RespondentLayout title="Your results">{null}</RespondentLayout>
  }

  return (
    <RespondentLayout
      title={report.assessment_name || 'Assessment report'}
      subtitle={`${report.organization_name} · shared ${formatDate(report.shared_at)}`}
    >
      <div className="mb-4 flex justify-end print:hidden">
        <Button
          fullWidth={false}
          className="px-4 py-2"
          onClick={() => printReport(`${report.assessment_name || 'Assessment report'} - ${report.respondent_name}`)}
        >
          ↓ Export PDF
        </Button>
      </div>

      <div className="hidden print:block">
        <h1 className="text-xl font-semibold text-navy-900">{report.assessment_name || 'Assessment report'}</h1>
        <p className="mb-4 text-sm text-navy-600">
          {report.respondent_name} · {report.organization_name}
        </p>
      </div>

      <div className="rounded-2xl border border-cream-300 bg-white p-6">
        <p className="text-sm text-navy-500">Overall maturity score</p>
        <div className="mt-2 flex items-baseline gap-3">
          <span className="text-3xl font-semibold text-navy-900">
            {Number(report.overall_score).toFixed(0)}
            <span className="text-lg text-navy-400">/100</span>
          </span>
          <Badge tone="trial">{report.maturity_band_label}</Badge>
        </div>
        <p className="mt-2 text-xs text-navy-500">Submitted {formatDate(report.submitted_at)}</p>
      </div>

      <ReportAnalysis capabilityScores={report.capability_scores} gaps={report.gaps} />

      <div className="mt-4 print:hidden">
        <Link to="/my/review" className="text-sm font-semibold text-teal-600 hover:underline">
          ← Back to review
        </Link>
      </div>
    </RespondentLayout>
  )
}
