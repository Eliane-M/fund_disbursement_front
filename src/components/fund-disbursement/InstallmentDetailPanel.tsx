import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { SubmitEvidenceModal } from '@/components/fund-disbursement/SubmitEvidenceModal'
import { EvidenceFileChip } from '@/components/fund-disbursement/EvidenceFileChip'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { TextField } from '@/components/ui/TextField'
import { useOrganization } from '@/hooks/useOrganization'
import { extractErrorMessage } from '@/lib/api'
import { fundDisbursementApi } from '@/lib/fund-disbursement-api'
import { installmentStatusLabel, installmentStatusTone } from '@/lib/status-display'
import type { PaymentMethod } from '@/types/fund-disbursement'

const CAN_ACT_ROLES = ['org_admin', 'reviewer']

function RecordDisbursementForm({ installmentId, amount, currency }: { installmentId: string; amount: string; currency: string }) {
  const queryClient = useQueryClient()
  const [amountPaid, setAmountPaid] = useState(amount)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer')
  const [reference, setReference] = useState('')
  const [paidAt, setPaidAt] = useState(() => new Date().toISOString().slice(0, 16))
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      fundDisbursementApi.disburse(installmentId, {
        amount_paid: amountPaid,
        currency,
        payment_method: paymentMethod,
        payment_reference: reference,
        paid_at: new Date(paidAt).toISOString(),
        note,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fd-installment', installmentId] })
      queryClient.invalidateQueries({ queryKey: ['fd-dashboard'] })
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  return (
    <div className="rounded-xl border border-cream-300 bg-cream-100 p-4">
      <p className="mb-3 text-sm font-semibold text-navy-900">Record disbursement</p>
      {error && (
        <div className="mb-3">
          <Alert tone="error">{error}</Alert>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Amount paid" type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} />
        <Select label="Payment method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
          <option value="bank_transfer">Bank transfer</option>
          <option value="mobile_money">Mobile money</option>
          <option value="cheque">Cheque</option>
          <option value="cash">Cash</option>
          <option value="other">Other</option>
        </Select>
        <TextField label="Payment reference" value={reference} onChange={(e) => setReference(e.target.value)} />
        <TextField label="Paid at" type="datetime-local" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
      </div>
      <div className="mt-3">
        <TextField label="Note" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <Button fullWidth={false} className="mt-3 px-5" isLoading={mutation.isPending} onClick={() => mutation.mutate()}>
        Confirm disbursement
      </Button>
    </div>
  )
}

export function InstallmentDetailPanel({ installmentId }: { installmentId: string }) {
  const { activeOrganization } = useOrganization()
  const queryClient = useQueryClient()
  const [comment, setComment] = useState('')
  const [showSubmit, setShowSubmit] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: installment } = useQuery({
    queryKey: ['fd-installment', installmentId],
    queryFn: () => fundDisbursementApi.installment(installmentId),
  })
  const { data: milestones } = useQuery({
    queryKey: ['fd-milestones', installment?.fund],
    queryFn: () => fundDisbursementApi.milestones(installment!.fund),
    enabled: Boolean(installment?.fund),
  })

  const decideMutation = useMutation({
    mutationFn: (decision: 'approved' | 'rejected' | 'info_requested') => {
      const submissionId = installment?.submissions[0]?.id
      if (!submissionId) throw new Error('No submission to decide on')
      return fundDisbursementApi.decideSubmission(submissionId, decision, comment)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fd-installment', installmentId] })
      queryClient.invalidateQueries({ queryKey: ['review-queue'] })
      queryClient.invalidateQueries({ queryKey: ['fd-milestones', installment?.fund] })
      setComment('')
      setError(null)
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  if (!installment) return <p className="text-sm text-navy-500">Loading…</p>

  const milestone = milestones?.find((m) => m.id === installment.milestone.id)
  const canAct = CAN_ACT_ROLES.includes(activeOrganization?.role ?? '')
  const latestSubmission = installment.submissions[0]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">Milestone</p>
          <h2 className="text-lg font-semibold text-navy-900">{installment.milestone.title}</h2>
          <p className="mt-0.5 text-sm text-navy-500">
            Installment {installment.installment_no} · {installment.currency} {Number(installment.amount).toLocaleString()}
          </p>
        </div>
        <Badge tone={installmentStatusTone[installment.status]}>{installmentStatusLabel[installment.status]}</Badge>
      </div>

      {milestone && milestone.kpis.length > 0 && (
        <div className="rounded-xl border border-cream-300 p-4">
          <p className="mb-2 text-sm font-semibold text-navy-900">KPI targets</p>
          <div className="flex flex-col gap-2 text-sm">
            {milestone.kpis.map((kpi) => {
              const result = latestSubmission?.kpi_results.find((r) => r.milestone_kpi === kpi.id)
              return (
                <div key={kpi.id} className="flex items-center justify-between rounded-lg bg-cream-100 px-3 py-2">
                  <span className="text-navy-700">{kpi.name}</span>
                  <span className="text-navy-500">
                    target: {kpi.comparator} {kpi.target_value} {kpi.unit}
                  </span>
                  <span className="font-semibold text-navy-900">
                    {result ? `reported: ${result.reported_value ?? result.reported_text}` : 'not yet reported'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {latestSubmission && (
        <div>
          <p className="mb-2 text-sm font-semibold text-navy-900">Submitted evidence</p>
          <div className="flex flex-wrap gap-2">
            {latestSubmission.files.map((f) => (
              <EvidenceFileChip key={f.id} file={f} />
            ))}
            {latestSubmission.files.length === 0 && <p className="text-xs text-navy-500">No files or links attached.</p>}
          </div>
          {latestSubmission.respondent_note && (
            <p className="mt-3 rounded-lg bg-cream-100 p-3 text-sm text-navy-700">
              <span className="font-medium">Recipient note:</span> "{latestSubmission.respondent_note}"
            </p>
          )}
        </div>
      )}

      {canAct && installment.status === 'under_review' && latestSubmission && (
        <div className="rounded-xl border border-cream-300 p-4">
          <p className="mb-2 text-sm font-semibold text-navy-900">Decision</p>
          {error && (
            <div className="mb-3">
              <Alert tone="error">{error}</Alert>
            </div>
          )}
          <label className="mb-1 block text-xs font-medium text-navy-700">Comment (logged for audit)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a note visible in the audit trail…"
            rows={2}
            className="mb-3 w-full rounded-lg border border-cream-300 px-3.5 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              fullWidth={false}
              className="bg-success-text px-4 text-white hover:opacity-90"
              isLoading={decideMutation.isPending}
              onClick={() => decideMutation.mutate('approved')}
            >
              ✓ Approve &amp; release
            </Button>
            <Button fullWidth={false} variant="ghost" className="border border-cream-300 px-4" onClick={() => decideMutation.mutate('info_requested')}>
              ⏱ Request more info
            </Button>
            <Button
              fullWidth={false}
              variant="ghost"
              className="border border-danger-text px-4 text-danger-text hover:bg-danger-bg"
              onClick={() => decideMutation.mutate('rejected')}
            >
              ✕ Reject
            </Button>
          </div>
        </div>
      )}

      {canAct && (installment.status === 'awaiting_evidence' || installment.status === 'info_requested') && (
        <Button fullWidth={false} className="self-start px-5" onClick={() => setShowSubmit(true)}>
          Submit evidence
        </Button>
      )}

      {canAct && installment.status === 'ready_for_disbursement' && (
        <RecordDisbursementForm installmentId={installment.id} amount={installment.amount} currency={installment.currency} />
      )}

      {installment.decisions.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-navy-900">Decision history</p>
          <div className="flex flex-col gap-2">
            {installment.decisions.map((d) => (
              <div key={d.id} className="rounded-lg bg-cream-100 px-3 py-2 text-xs text-navy-600">
                <span className="font-medium capitalize text-navy-900">{d.decision.replace('_', ' ')}</span> by {d.reviewer_name} ·{' '}
                {new Date(d.decided_at).toLocaleString()}
                {d.comment && <p className="mt-1 text-navy-600">"{d.comment}"</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {installment.disbursements.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-navy-900">Disbursement record</p>
          {installment.disbursements.map((d) => (
            <div key={d.id} className="rounded-lg bg-success-bg px-3 py-2 text-xs text-success-text">
              {d.currency} {Number(d.amount_paid).toLocaleString()} via {d.payment_method.replace('_', ' ')} · ref {d.payment_reference || '—'} ·{' '}
              {new Date(d.paid_at).toLocaleDateString()}
            </div>
          ))}
        </div>
      )}

      {showSubmit && milestone && (
        <SubmitEvidenceModal
          title="Submit evidence"
          milestone={milestone}
          submit={(payload) => fundDisbursementApi.submitEvidence(installment.id, payload)}
          invalidate={[['fd-installment', installment.id], ['review-queue']]}
          onClose={() => setShowSubmit(false)}
        />
      )}
    </div>
  )
}
