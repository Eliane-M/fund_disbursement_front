import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { ConsoleLayout } from '@/components/console/ConsoleLayout'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useOrganization } from '@/hooks/useOrganization'
import { extractErrorMessage } from '@/lib/api'
import { assessmentApi } from '@/lib/assessment-api'
import { assessmentStatusTone } from '@/lib/status-display'
import { BuilderBandsTab } from '@/pages/assessment/builder/BuilderBandsTab'
import { BuilderCapabilitiesTab } from '@/pages/assessment/builder/BuilderCapabilitiesTab'
import { BuilderDetailsTab } from '@/pages/assessment/builder/BuilderDetailsTab'
import { BuilderQuestionsTab } from '@/pages/assessment/builder/BuilderQuestionsTab'
import { BuilderRecommendationsTab } from '@/pages/assessment/builder/BuilderRecommendationsTab'
import { NewAssessmentForm } from '@/pages/assessment/builder/NewAssessmentForm'

const TABS = ['Details', 'Capabilities', 'Questions', 'Maturity bands', 'Recommendations'] as const
type Tab = (typeof TABS)[number]

export function AssessmentBuilderPage() {
  const { assessmentId } = useParams<{ assessmentId: string }>()
  const { activeOrganization } = useOrganization()
  const orgId = activeOrganization!.id
  const [tab, setTab] = useState<Tab>('Details')
  const [publishError, setPublishError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: assessment, isLoading } = useQuery({
    queryKey: ['assessment', assessmentId],
    queryFn: () => assessmentApi.assessment(assessmentId!),
    enabled: Boolean(assessmentId) && assessmentId !== 'new',
  })

  const publishMutation = useMutation({
    mutationFn: () => assessmentApi.publishAssessment(assessmentId!),
    onSuccess: (updated) => {
      queryClient.setQueryData(['assessment', assessmentId], updated)
      queryClient.invalidateQueries({ queryKey: ['assessments', orgId] })
      setPublishError(null)
    },
    onError: (err) => setPublishError(extractErrorMessage(err)),
  })

  if (assessmentId === 'new') {
    return <NewAssessmentForm orgId={orgId} />
  }

  if (isLoading || !assessment) {
    return (
      <ConsoleLayout title="Assessment builder">
        <p className="text-sm text-navy-500">Loading…</p>
      </ConsoleLayout>
    )
  }

  return (
    <ConsoleLayout title="Assessment builder">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-navy-900">{assessment.name}</h2>
          <p className="mt-0.5 text-sm text-navy-500">
            {assessment.category_name} · {assessment.version_label}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Badge tone={assessmentStatusTone[assessment.status]}>{assessment.status}</Badge>
          <Button
            fullWidth={false}
            className="px-4 py-2"
            onClick={() => publishMutation.mutate()}
            isLoading={publishMutation.isPending}
            disabled={assessment.status === 'live'}
          >
            {assessment.status === 'live' ? 'Published' : 'Publish'}
          </Button>
        </div>
      </div>

      {publishError && (
        <div className="mb-4">
          <Alert tone="error">{publishError}</Alert>
        </div>
      )}

      <div className="mb-6 flex gap-1 rounded-lg border border-cream-300 bg-white p-1">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === t ? 'bg-navy-900 text-white' : 'text-navy-600 hover:bg-cream-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-cream-300 bg-white p-6">
        {tab === 'Details' && <BuilderDetailsTab key={assessment.id} assessment={assessment} orgId={orgId} />}
        {tab === 'Capabilities' && <BuilderCapabilitiesTab assessmentId={assessment.id} />}
        {tab === 'Questions' && <BuilderQuestionsTab assessmentId={assessment.id} />}
        {tab === 'Maturity bands' && <BuilderBandsTab assessmentId={assessment.id} />}
        {tab === 'Recommendations' && <BuilderRecommendationsTab assessmentId={assessment.id} />}
      </div>
    </ConsoleLayout>
  )
}
