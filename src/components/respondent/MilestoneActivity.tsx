import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { EvidenceFileChip } from '@/components/fund-disbursement/EvidenceFileChip'
import { SubmitEvidenceModal } from '@/components/fund-disbursement/SubmitEvidenceModal'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { fundDisbursementApi } from '@/lib/fund-disbursement-api'
import type { Milestone } from '@/types/fund-disbursement'

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function MilestoneActivity({ milestone, fundId }: { milestone: Milestone; fundId: string }) {
  const [open, setOpen] = useState(false)
  const status = milestone.installment.status
  const canSubmit = status === 'awaiting_evidence' || status === 'info_requested'
  const hasHistory = status !== 'not_started' && status !== 'awaiting_evidence'

  const { data } = useQuery({
    queryKey: ['my-installment', milestone.installment.id],
    queryFn: () => fundDisbursementApi.myInstallment(milestone.installment.id),
    enabled: status !== 'not_started',
  })

  const latestSubmission = data?.submissions[0]
  const latestDecision = data?.decisions[0]

  return (
    <div className="mt-3 border-t border-cream-200 pt-3">
      {hasHistory && latestSubmission && (
        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-navy-700">
          <span>
            Attempt {latestSubmission.attempt_no} submitted {formatDate(latestSubmission.submitted_at)}
          </span>
          <Badge tone={latestSubmission.status === 'approved' ? 'success' : latestSubmission.status === 'rejected' ? 'danger' : 'amber'}>
            {latestSubmission.status.replace('_', ' ')}
          </Badge>
        </div>
      )}
      {latestSubmission && latestSubmission.files.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {latestSubmission.files.map((f) => (
            <EvidenceFileChip key={f.id} file={f} />
          ))}
        </div>
      )}
      {latestDecision?.comment && (status === 'info_requested' || status === 'rejected') && (
        <div className="mb-2">
          <Alert tone={status === 'rejected' ? 'error' : 'info'}>
            Reviewer feedback: {latestDecision.comment}
          </Alert>
        </div>
      )}
      {canSubmit && (
        <Button fullWidth={false} onClick={() => setOpen(true)}>
          {status === 'info_requested' ? 'Resubmit evidence' : 'Submit evidence'}
        </Button>
      )}
      {open && <SubmitEvidenceModal
          title={`Submit evidence — ${milestone.title}`}
          milestone={milestone}
          submit={(payload) => fundDisbursementApi.mySubmitEvidence(milestone.installment.id, payload)}
          invalidate={[['my-fund', fundId], ['my-installment', milestone.installment.id], ['my-funds']]}
          onClose={() => setOpen(false)}
        />}
    </div>
  )
}
