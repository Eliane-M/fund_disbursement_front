import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts'

import { ConsoleLayout } from '@/components/console/ConsoleLayout'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { assessmentApi } from '@/lib/assessment-api'

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

  const radarData = report.capability_scores.map((c) => ({
    capability: c.capability_name,
    score: Number(c.score_pct),
  }))

  return (
    <ConsoleLayout
      title="Assessment report"
      subtitle={report.respondent_name}
      actions={
        <div className="flex items-center gap-2">
          <Button fullWidth={false} variant="ghost" className="px-3 py-2" disabled title="Coming soon">
            ↓ Export PDF
          </Button>
          <Button fullWidth={false} className="px-3 py-2" onClick={handleCopyLink} disabled={!report.share_token}>
            {copied ? 'Copied!' : '⎘ Copy share link'}
          </Button>
        </div>
      }
    >
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

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-cream-300 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-navy-900">Scores by capability</h2>
          {radarData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="#e8e2d2" />
                  <PolarAngleAxis dataKey="capability" tick={{ fill: '#17202e', fontSize: 11 }} />
                  <Radar dataKey="score" stroke="#132f45" fill="#132f45" fillOpacity={0.65} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-navy-500">No capability scores yet.</p>
          )}
        </section>

        <section className="rounded-2xl border border-cream-300 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-navy-900">Capability vs. target benchmark</h2>
          <div className="flex flex-col gap-4">
            {report.capability_scores.map((c) => {
              const score = Number(c.score_pct)
              const target = c.target_score ? Number(c.target_score) : null
              return (
                <div key={c.capability}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-navy-800">{c.capability_name}</span>
                    <span className="text-navy-500">
                      {score.toFixed(0)} {target != null && `/ ${target.toFixed(0)}`}
                    </span>
                  </div>
                  <div className="relative h-2 rounded-full bg-cream-200">
                    <div
                      className="h-2 rounded-full bg-amber-500"
                      style={{ width: `${Math.min(100, score)}%` }}
                    />
                    {target != null && (
                      <div
                        className="absolute top-[-2px] h-3 w-0.5 bg-navy-700"
                        style={{ left: `${Math.min(100, target)}%` }}
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      <section className="mt-4 rounded-2xl border border-cream-300 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-navy-900">Identified gaps &amp; recommendations</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {report.gaps.map((gap) => (
            <div key={gap.id} className="rounded-xl border border-cream-300 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-navy-900">{gap.capability_name}</p>
                <span className="text-xs font-semibold text-danger-text">{Number(gap.score_pct).toFixed(0)}/100</span>
              </div>
              <p className="mt-1.5 text-sm text-navy-600">{gap.recommendation_text}</p>
            </div>
          ))}
          {report.gaps.length === 0 && <p className="text-sm text-navy-500">No gaps identified.</p>}
        </div>
      </section>
    </ConsoleLayout>
  )
}
