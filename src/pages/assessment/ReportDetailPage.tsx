import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ReportAnalysis } from '@/components/assessment/ReportAnalysis'
import { ConsoleLayout } from '@/components/console/ConsoleLayout'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { assessmentApi } from '@/lib/assessment-api'
import { printReport } from '@/lib/print-report'

export function ReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>()
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)

  const { data: report, isLoading } = useQuery({
    queryKey: ['report', reportId],
    queryFn: () => assessmentApi.report(reportId!),
    enabled: Boolean(reportId),
  })

  const shareMutation = useMutation({
    mutationFn: (shared: boolean) => assessmentApi.updateReportShareStatus(reportId!, shared ? 'shared' : 'withheld'),
    onSuccess: (updated) => {
      queryClient.setQueryData(['report', reportId], updated)
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  function handleCopyLink() {
    if (!report?.share_token) return
    const url = `${window.location.origin}/shared-reports/${report.share_token}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (isLoading || !report) {
    return (
      <ConsoleLayout title="Assessment report">
        <p className="text-sm text-navy-500">Loading…</p>
      </ConsoleLayout>
    )
  }

  return (
    <ConsoleLayout
      title="Assessment report"
      subtitle={report.respondent_name}
    >
      <div className="mb-4 flex justify-end print:hidden">
        <div className="flex items-center gap-2">
          <Button
            fullWidth={false}
            variant="ghost"
            className="px-3 py-2"
            onClick={() => printReport(`Assessment report - ${report.respondent_name}`)}
          >
            ↓ Export PDF
          </Button>
          <Button fullWidth={false} className="px-3 py-2" onClick={handleCopyLink} disabled={!report.share_token}>
            {copied ? 'Copied!' : '⎘ Copy share link'}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-cream-300 bg-white p-6 lg:col-span-2">
          <p className="text-sm text-navy-500">Overall maturity score</p>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-3xl font-semibold text-navy-900">
              {Number(report.overall_score).toFixed(0)}
              <span className="text-lg text-navy-400">/100</span>
            </span>
            <Badge tone="trial">{report.maturity_band_label}</Badge>
          </div>
          {report.submitted_at && (
            <p className="mt-2 text-xs text-navy-500">
              Submitted {new Date(report.submitted_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-cream-300 bg-white p-6">
          <div>
            <p className="text-sm font-medium text-navy-900">Report sharing</p>
            <p className="text-xs text-navy-500">Share this report with the respondent</p>
          </div>
          <Switch
            checked={report.share_status === 'shared'}
            onChange={(checked) => shareMutation.mutate(checked)}
            disabled={shareMutation.isPending}
          />
        </div>
      </div>

      <ReportAnalysis capabilityScores={report.capability_scores} gaps={report.gaps} />
    </ConsoleLayout>
  )
}
