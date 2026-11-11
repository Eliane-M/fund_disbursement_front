import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { ConsoleLayout } from '@/components/console/ConsoleLayout'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useOrganization } from '@/hooks/useOrganization'
import { extractErrorMessage } from '@/lib/api'
import { assessmentApi } from '@/lib/assessment-api'
import type { PendingResponse, ReviewQueueItem } from '@/types/assessment'

function GradeModal({ item, onClose }: { item: ReviewQueueItem; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [scores, setScores] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  const { data: responses } = useQuery({
    queryKey: ['pending-responses', item.id],
    queryFn: () => assessmentApi.pendingResponses(item.id),
  })

  const gradeMutation = useMutation({
    mutationFn: ({ id, score }: { id: string; score: string }) => assessmentApi.gradeResponse(id, score),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-responses', item.id] })
      queryClient.invalidateQueries({ queryKey: ['submission-queue'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      setError(null)
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  return (
    <Modal title={`${item.respondent_name} · ${item.assessment_name}`} onClose={onClose}>
      <div className="flex flex-col gap-4">
        {error && <Alert tone="error">{error}</Alert>}
        <p className="text-sm text-navy-500">
          Written answers are listed below. Where a question is scored, the points you assign update the
          score and the report straight away.
        </p>

        {responses?.length === 0 && (
          <p className="text-sm text-navy-500">The respondent gave no written answers on this submission.</p>
        )}

        {responses?.map((response: PendingResponse) => (
          <div key={response.id} className="rounded-xl border border-cream-300 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-navy-500">
              {response.capability_name}
            </p>
            <p className="mt-1 font-medium text-navy-900">{response.question_text}</p>
            <p className="mt-2 whitespace-pre-wrap rounded-lg bg-cream-100 p-3 text-sm text-navy-700">
              {response.answer_value == null || response.answer_value === ''
                ? 'No answer given.'
                : String(response.answer_value)}
            </p>
            {!response.is_scored ? (
              <p className="mt-3 text-xs text-navy-500">
                Note only — this question isn't scored. Turn on scoring for it in the Assessment Builder if you
                want to give points.
              </p>
            ) : (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                type="number"
                min={0}
                max={Number(response.max_points)}
                placeholder={`0–${Number(response.max_points)}`}
                value={scores[response.id] ?? response.reviewer_score ?? ''}
                onChange={(e) => setScores({ ...scores, [response.id]: e.target.value })}
                className="w-28 rounded-lg border border-cream-300 px-3 py-1.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
              />
              <span className="text-xs text-navy-500">of {Number(response.max_points)} points</span>
              <Button
                type="button"
                fullWidth={false}
                className="px-3 py-1.5 text-xs"
                isLoading={gradeMutation.isPending}
                onClick={() =>
                  gradeMutation.mutate({
                    id: response.id,
                    score: scores[response.id] ?? response.reviewer_score ?? '0',
                  })
                }
              >
                {response.reviewer_score === null ? 'Assign points' : 'Update points'}
              </Button>
              {response.reviewer_score !== null && (
                <Badge tone="success">scored {Number(response.reviewer_score)}</Badge>
              )}
            </div>
            )}
          </div>
        ))}
      </div>
    </Modal>
  )
}

export function SubmissionsPage() {
  const { activeOrganization } = useOrganization()
  const orgId = activeOrganization!.id
  const [grading, setGrading] = useState<ReviewQueueItem | null>(null)

  const { data: queue } = useQuery({
    queryKey: ['submission-queue', orgId],
    queryFn: () => assessmentApi.submissionQueue(orgId),
  })

  return (
    <ConsoleLayout title="Submissions">
      <section className="rounded-2xl border border-cream-300 bg-white p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-navy-500">
                <th className="pb-3 font-medium">Respondent</th>
                <th className="pb-3 font-medium">Assessment</th>
                <th className="pb-3 font-medium">Submitted</th>
                <th className="pb-3 font-medium">Auto score</th>
                <th className="pb-3 font-medium">Manual scoring</th>
                <th className="pb-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {queue?.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 font-medium text-navy-900">{item.respondent_name}</td>
                  <td className="py-3 text-navy-700">{item.assessment_name}</td>
                  <td className="py-3 text-navy-700">
                    {item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="py-3 text-navy-700">
                    {item.overall_score ? `${Number(item.overall_score).toFixed(0)}/100` : '—'}
                  </td>
                  <td className="py-3">
                    {item.pending_review > 0 ? (
                      <Badge tone="amber">{item.pending_review} pending</Badge>
                    ) : (
                      <Badge tone="success">complete</Badge>
                    )}
                    {item.free_text_count > 0 && (
                      <p className="mt-1 text-xs text-navy-500">
                        {item.free_text_count} written answer{item.free_text_count === 1 ? '' : 's'}
                      </p>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setGrading(item)}
                        className="text-sm font-semibold text-teal-600 hover:underline"
                      >
                        Review answers
                      </button>
                      {item.report_id && (
                        <Link
                          to={`/assessment/reports/${item.report_id}`}
                          className="text-sm font-semibold text-teal-600 hover:underline"
                        >
                          Report →
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {queue?.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm text-navy-500">
                    No submitted assessments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {grading && <GradeModal item={grading} onClose={() => setGrading(null)} />}
    </ConsoleLayout>
  )
}
