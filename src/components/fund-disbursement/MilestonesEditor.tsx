import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PlusIcon, TrashIcon } from '@/components/ui/icons'
import { Select } from '@/components/ui/Select'
import { TextField } from '@/components/ui/TextField'
import { extractErrorMessage } from '@/lib/api'
import { fundDisbursementApi } from '@/lib/fund-disbursement-api'
import { installmentStatusTone } from '@/lib/status-display'
import type {
  Comparator,
  MetricType,
  Milestone,
  MilestoneEvidenceRequirement,
  MilestoneKPI,
} from '@/types/fund-disbursement'

const METRIC_TYPES: { value: MetricType; label: string }[] = [
  { value: 'number', label: 'Number' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'currency', label: 'Currency' },
  { value: 'boolean', label: 'Yes / No' },
  { value: 'date', label: 'Date' },
  { value: 'text', label: 'Text' },
]

const COMPARATORS: { value: Comparator; label: string }[] = [
  { value: 'gte', label: '≥ at least' },
  { value: 'lte', label: '≤ at most' },
  { value: 'eq', label: '= exactly' },
  { value: 'gt', label: '> more than' },
  { value: 'lt', label: '< less than' },
  { value: 'between', label: 'between' },
]

interface Draft {
  id: string | null
  sequence_position: number
  title: string
  deliverable_description: string
  due_date: string
  amount: string
  currency: string
  unlocks_after_milestone: string | null
  kpis: MilestoneKPI[]
  evidence_requirements: MilestoneEvidenceRequirement[]
}

function blankDraft(sequence_position: number, currency: string): Draft {
  return {
    id: null,
    sequence_position,
    title: '',
    deliverable_description: '',
    due_date: '',
    amount: '',
    currency,
    unlocks_after_milestone: null,
    kpis: [],
    evidence_requirements: [],
  }
}

function toDraft(milestone: Milestone): Draft {
  return {
    id: milestone.id,
    sequence_position: milestone.sequence_position,
    title: milestone.title,
    deliverable_description: milestone.deliverable_description,
    due_date: milestone.due_date ?? '',
    amount: milestone.installment.amount,
    currency: milestone.installment.currency,
    unlocks_after_milestone: milestone.unlocks_after_milestone,
    kpis: milestone.kpis,
    evidence_requirements: milestone.evidence_requirements,
  }
}

export function MilestonesEditor({ fundId, currency }: { fundId: string; currency: string }) {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<Draft | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [newRequirementLabel, setNewRequirementLabel] = useState('')

  const { data: milestones } = useQuery({
    queryKey: ['fd-milestones', fundId],
    queryFn: () => fundDisbursementApi.milestones(fundId),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['fd-milestones', fundId] })

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!draft) throw new Error('No draft')
      const payload = {
        sequence_position: draft.sequence_position,
        title: draft.title,
        deliverable_description: draft.deliverable_description,
        due_date: draft.due_date || null,
        unlocks_after_milestone: draft.unlocks_after_milestone,
        amount: draft.amount,
        currency: draft.currency,
        kpis: draft.kpis,
        evidence_requirements: draft.evidence_requirements,
      }
      return draft.id
        ? fundDisbursementApi.updateMilestone(draft.id, payload)
        : fundDisbursementApi.createMilestone(fundId, payload)
    },
    onSuccess: (saved) => {
      invalidate()
      setDraft(toDraft(saved))
      setError(null)
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fundDisbursementApi.deleteMilestone(id),
    onSuccess: () => {
      invalidate()
      setDraft(null)
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  const totalAmount = milestones?.reduce((sum, m) => sum + Number(m.installment.amount), 0) ?? 0

  function selectMilestone(m: Milestone) {
    setError(null)
    setDraft(toDraft(m))
  }

  function addMilestone() {
    setError(null)
    setDraft(blankDraft((milestones?.length ?? 0) + 1, currency))
  }

  function updateKpi(index: number, patch: Partial<MilestoneKPI>) {
    if (!draft) return
    const kpis = draft.kpis.slice()
    kpis[index] = { ...kpis[index], ...patch }
    setDraft({ ...draft, kpis })
  }

  function addKpi() {
    if (!draft) return
    setDraft({
      ...draft,
      kpis: [
        ...draft.kpis,
        { name: '', metric_type: 'number', comparator: 'gte', target_value: '', target_value_max: null, target_text: '', unit: '', display_order: draft.kpis.length },
      ],
    })
  }

  function removeKpi(index: number) {
    if (!draft) return
    setDraft({ ...draft, kpis: draft.kpis.filter((_, i) => i !== index) })
  }

  function toggleRequirement(index: number) {
    if (!draft) return
    const reqs = draft.evidence_requirements.slice()
    reqs[index] = { ...reqs[index], is_mandatory: !reqs[index].is_mandatory }
    setDraft({ ...draft, evidence_requirements: reqs })
  }

  function removeRequirement(index: number) {
    if (!draft) return
    setDraft({ ...draft, evidence_requirements: draft.evidence_requirements.filter((_, i) => i !== index) })
  }

  function addRequirement() {
    if (!draft || !newRequirementLabel.trim()) return
    setDraft({
      ...draft,
      evidence_requirements: [
        ...draft.evidence_requirements,
        { requirement_type: null, label: newRequirementLabel.trim(), is_mandatory: true, display_order: draft.evidence_requirements.length },
      ],
    })
    setNewRequirementLabel('')
  }

  const otherMilestones = milestones?.filter((m) => m.id !== draft?.id) ?? []

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[18rem_1fr]">
      <div className="flex flex-col gap-3">
        <div className="rounded-xl border border-cream-300 bg-white p-4">
          <p className="text-xs text-navy-500">Total / sequencing</p>
          <p className="mt-1 text-xl font-semibold text-navy-900">
            {currency} {totalAmount.toLocaleString()}
          </p>
          <p className="text-xs text-navy-500">{milestones?.length ?? 0} installments</p>
        </div>

        <div className="flex flex-col gap-2">
          {milestones?.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => selectMilestone(m)}
              className={`rounded-xl border p-3 text-left transition-colors ${
                draft?.id === m.id ? 'border-amber-400 bg-amber-100/40' : 'border-cream-300 bg-white hover:border-navy-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-navy-900">
                  {m.sequence_position}. {m.title || 'Untitled milestone'}
                </p>
              </div>
              <p className="mt-0.5 text-xs text-navy-500">
                {m.kpis.length} KPI{m.kpis.length === 1 ? '' : 's'} · {m.evidence_requirements.length} evidence item
                {m.evidence_requirements.length === 1 ? '' : 's'} · {m.installment.currency}{' '}
                {Number(m.installment.amount).toLocaleString()}
              </p>
              <div className="mt-1.5">
                <Badge tone={installmentStatusTone[m.installment.status]}>{m.installment.status.replace(/_/g, ' ')}</Badge>
              </div>
            </button>
          ))}
        </div>

        <Button fullWidth variant="ghost" className="border border-dashed border-navy-300" onClick={addMilestone}>
          + Add milestone
        </Button>
      </div>

      <div className="rounded-xl border border-cream-300 bg-white p-6">
        {error && (
          <div className="mb-4">
            <Alert tone="error">{error}</Alert>
          </div>
        )}
        {!draft ? (
          <p className="text-sm text-navy-500">Select a milestone on the left, or add a new one.</p>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                {draft.id ? `Editing milestone ${draft.sequence_position} of ${milestones?.length ?? 1}` : 'New milestone'}
              </p>
              {saveMutation.isPending ? (
                <Badge tone="amber">Saving…</Badge>
              ) : (
                <Badge tone="trial">Draft — unsaved changes</Badge>
              )}
            </div>

            <TextField
              label="Milestone title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-navy-800">Deliverable description</label>
              <textarea
                value={draft.deliverable_description}
                onChange={(e) => setDraft({ ...draft, deliverable_description: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-cream-300 bg-white px-3.5 py-2.5 text-sm text-navy-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <TextField
                label="Due date"
                type="date"
                value={draft.due_date}
                onChange={(e) => setDraft({ ...draft, due_date: e.target.value })}
              />
              <TextField
                label="Installment amount"
                type="number"
                value={draft.amount}
                onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
              />
              <Select
                label="Unlocks after"
                value={draft.unlocks_after_milestone ?? ''}
                onChange={(e) => setDraft({ ...draft, unlocks_after_milestone: e.target.value || null })}
              >
                <option value="">No prerequisite — opens with the fund</option>
                {otherMilestones.map((m) => (
                  <option key={m.id} value={m.id}>
                    Unlocks after: {m.title || `Milestone ${m.sequence_position}`}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-navy-900">Measurable KPIs</p>
                <button type="button" onClick={addKpi} className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:underline">
                  <PlusIcon /> Add another KPI
                </button>
              </div>
              <p className="mb-3 text-xs text-navy-500">
                Each KPI defines a metric, a comparator, and a target the recipient's evidence must meet.
              </p>
              <div className="flex flex-col gap-2">
                {draft.kpis.map((kpi, i) => (
                  <div key={i} className="grid grid-cols-[1fr_8rem_8rem_6rem_5rem_auto] items-end gap-2 rounded-lg bg-cream-100 p-2.5">
                    <TextField label="KPI name" value={kpi.name} onChange={(e) => updateKpi(i, { name: e.target.value })} />
                    <Select label="Metric type" value={kpi.metric_type} onChange={(e) => updateKpi(i, { metric_type: e.target.value as MetricType })}>
                      {METRIC_TYPES.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </Select>
                    <Select label="Comparator" value={kpi.comparator} onChange={(e) => updateKpi(i, { comparator: e.target.value as Comparator })}>
                      {COMPARATORS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </Select>
                    <TextField
                      label="Target value"
                      value={kpi.target_value ?? ''}
                      onChange={(e) => updateKpi(i, { target_value: e.target.value })}
                    />
                    <TextField label="Unit" value={kpi.unit} onChange={(e) => updateKpi(i, { unit: e.target.value })} />
                    <button type="button" onClick={() => removeKpi(i)} className="mb-2.5 justify-self-start text-danger-text">
                      <TrashIcon />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-navy-900">Evidence requirements</p>
              <div className="flex flex-wrap items-center gap-2">
                {draft.evidence_requirements.map((req, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                      req.is_mandatory ? 'bg-navy-900 text-white' : 'border border-cream-300 bg-white text-navy-600'
                    }`}
                  >
                    <button type="button" onClick={() => toggleRequirement(i)}>
                      {req.is_mandatory && '✓ '}
                      {req.label}
                    </button>
                    <button type="button" onClick={() => removeRequirement(i)} className="opacity-70 hover:opacity-100">
                      ✕
                    </button>
                  </span>
                ))}
                <input
                  value={newRequirementLabel}
                  onChange={(e) => setNewRequirementLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addRequirement()
                    }
                  }}
                  placeholder="Requirement label…"
                  className="w-44 rounded-full border border-dashed border-cream-300 bg-white px-3 py-1.5 text-xs focus:border-amber-400 focus:outline-none"
                />
                <button type="button" onClick={addRequirement} className="text-xs font-semibold text-teal-600 hover:underline">
                  + Add requirement
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-cream-200 pt-4">
              <div>
                {draft.id && (
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(draft.id!)}
                    className="text-sm font-semibold text-danger-text hover:underline"
                  >
                    Delete milestone
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <Button fullWidth={false} variant="ghost" className="px-4" onClick={() => setDraft(null)}>
                  Cancel
                </Button>
                <Button
                  fullWidth={false}
                  className="px-5"
                  isLoading={saveMutation.isPending}
                  disabled={!draft.title.trim() || !draft.amount}
                  onClick={() => saveMutation.mutate()}
                >
                  Save milestone
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
