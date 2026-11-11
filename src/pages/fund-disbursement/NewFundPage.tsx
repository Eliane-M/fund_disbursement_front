import { useMutation, useQuery } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { ConsoleLayout } from '@/components/console/ConsoleLayout'
import { MilestonesEditor } from '@/components/fund-disbursement/MilestonesEditor'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { TextField } from '@/components/ui/TextField'
import { useOrganization } from '@/hooks/useOrganization'
import { extractErrorMessage } from '@/lib/api'
import { coreApi } from '@/lib/core-api'
import { fundDisbursementApi } from '@/lib/fund-disbursement-api'
import type { Fund, FundingType, Sequencing } from '@/types/fund-disbursement'

const STEPS = ['Fund details', 'Milestones & KPIs', 'Review & activate'] as const

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="mb-6 flex items-center rounded-2xl border border-cream-300 bg-white p-4">
      {STEPS.map((label, i) => (
        <div key={label} className="flex flex-1 items-center">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                i <= step ? 'bg-navy-900 text-white' : 'bg-cream-200 text-navy-500'
              }`}
            >
              {i + 1}
            </span>
            <span className={`text-sm ${i === step ? 'font-semibold text-navy-900' : 'text-navy-500'}`}>{label}</span>
          </div>
          {i < STEPS.length - 1 && <div className="mx-3 h-px flex-1 bg-cream-300" />}
        </div>
      ))}
    </div>
  )
}

export function NewFundPage() {
  const { activeOrganization } = useOrganization()
  const orgId = activeOrganization!.id
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [step, setStep] = useState(0)
  const [fund, setFund] = useState<Fund | null>(null)

  const [recipient, setRecipient] = useState(searchParams.get('recipient') ?? '')
  const [title, setTitle] = useState('')
  const [fundingType, setFundingType] = useState<FundingType>('grant')
  const [totalAmount, setTotalAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [startDate, setStartDate] = useState('')
  const [sequencing, setSequencing] = useState<Sequencing>('sequential')
  const [agreementReference, setAgreementReference] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { data: respondents } = useQuery({
    queryKey: ['respondents', orgId],
    queryFn: () => coreApi.respondents(orgId),
  })

  const createMutation = useMutation({
    mutationFn: () =>
      fundDisbursementApi.createFund(orgId, {
        recipient,
        title,
        funding_type: fundingType,
        total_amount: totalAmount,
        currency,
        start_date: startDate,
        sequencing,
        agreement_reference: agreementReference || null,
      }),
    onSuccess: (created) => {
      setFund(created)
      setStep(1)
      setError(null)
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  const activateMutation = useMutation({
    mutationFn: () => fundDisbursementApi.transitionFund(fund!.id, 'active'),
    onSuccess: (updated) => navigate(`/fund-disbursement/funds/${updated.id}`),
    onError: (err) => setError(extractErrorMessage(err)),
  })

  function handleSubmitDetails(e: FormEvent) {
    e.preventDefault()
    if (!recipient) {
      setError('Choose a recipient.')
      return
    }
    setError(null)
    createMutation.mutate()
  }

  return (
    <ConsoleLayout title="Create a fund or grant">
      <StepIndicator step={step} />

      {step === 0 && (
        <div className="rounded-2xl border border-cream-300 bg-white p-6">
          <h2 className="mb-1 text-base font-semibold text-navy-900">Fund details</h2>
          <p className="mb-5 text-sm text-navy-500">Linked to the same respondent record used in the Assessment module, where available.</p>
          <form className="flex flex-col gap-4" onSubmit={handleSubmitDetails}>
            {error && <Alert tone="error">{error}</Alert>}
            <Select label="Recipient" value={recipient} onChange={(e) => setRecipient(e.target.value)}>
              <option value="">Choose a recipient…</option>
              {respondents?.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} {r.category_name ? `— ${r.category_name}` : ''}
                </option>
              ))}
            </Select>
            <TextField label="Fund / grant title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <div className="grid grid-cols-3 gap-3">
              <Select label="Funding type" value={fundingType} onChange={(e) => setFundingType(e.target.value as FundingType)}>
                <option value="grant">Grant</option>
                <option value="loan">Loan</option>
                <option value="equity_linked">Equity-linked</option>
                <option value="other">Other</option>
              </Select>
              <TextField label="Total amount" type="number" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} />
              <Select label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="USD">USD</option>
                <option value="RWF">RWF</option>
                <option value="KES">KES</option>
                <option value="EUR">EUR</option>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Start date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <Select
                label="Installment sequencing"
                value={sequencing}
                onChange={(e) => setSequencing(e.target.value as Sequencing)}
                hint={
                  sequencing === 'sequential'
                    ? 'Sequential is recommended when later milestones depend on earlier ones.'
                    : 'Parallel opens every milestone as soon as the fund is activated.'
                }
              >
                <option value="sequential">Sequential — each must complete before the next unlocks</option>
                <option value="parallel">Parallel — all milestones open at once</option>
              </Select>
            </div>
            <TextField
              label="Internal reference / agreement no."
              value={agreementReference}
              onChange={(e) => setAgreementReference(e.target.value)}
              placeholder="Optional"
            />
            <div className="flex justify-end gap-3 border-t border-cream-200 pt-4">
              <Link to="/fund-disbursement/funds">
                <Button fullWidth={false} variant="ghost" className="px-5">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" fullWidth={false} className="px-5" isLoading={createMutation.isPending}>
                Continue to milestones →
              </Button>
            </div>
          </form>
        </div>
      )}

      {step === 1 && fund && (
        <div className="flex flex-col gap-4">
          <MilestonesEditor fundId={fund.id} currency={fund.currency} />
          <div className="flex justify-end gap-3">
            <Button fullWidth={false} variant="ghost" className="px-5" onClick={() => setStep(0)}>
              ← Back
            </Button>
            <Button fullWidth={false} className="px-5" onClick={() => setStep(2)}>
              Continue to review →
            </Button>
          </div>
        </div>
      )}

      {step === 2 && fund && (
        <div className="rounded-2xl border border-cream-300 bg-white p-6">
          {error && (
            <div className="mb-4">
              <Alert tone="error">{error}</Alert>
            </div>
          )}
          <h2 className="mb-4 text-base font-semibold text-navy-900">Review &amp; activate</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-navy-500">Title</dt>
              <dd className="font-medium text-navy-900">{fund.title || 'Untitled fund'}</dd>
            </div>
            <div>
              <dt className="text-navy-500">Total amount</dt>
              <dd className="font-medium text-navy-900">
                {fund.currency} {Number(fund.total_amount).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-navy-500">Status</dt>
              <dd>
                <Badge tone="trial">{fund.lifecycle_status}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-navy-500">Sequencing</dt>
              <dd className="font-medium capitalize text-navy-900">{fund.sequencing}</dd>
            </div>
          </dl>
          <p className="mt-5 text-sm text-navy-500">
            Activating opens the first milestone(s) for evidence submission. Add at least one milestone before
            activating.
          </p>
          <div className="mt-5 flex justify-end gap-3 border-t border-cream-200 pt-4">
            <Button fullWidth={false} variant="ghost" className="px-5" onClick={() => setStep(1)}>
              ← Back to milestones
            </Button>
            <Button fullWidth={false} className="px-5" isLoading={activateMutation.isPending} onClick={() => activateMutation.mutate()}>
              Activate fund
            </Button>
          </div>
        </div>
      )}
    </ConsoleLayout>
  )
}
