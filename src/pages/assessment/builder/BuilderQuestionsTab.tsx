import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { PencilIcon, TrashIcon } from '@/components/ui/icons'
import { Select } from '@/components/ui/Select'
import { TextField } from '@/components/ui/TextField'
import { extractErrorMessage } from '@/lib/api'
import { assessmentApi } from '@/lib/assessment-api'
import type { Capability, Question, QuestionOption, QuestionType } from '@/types/assessment'

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'yes_no', label: 'Yes / No' },
  { value: 'single_select', label: 'Single select' },
  { value: 'multi_select', label: 'Multi select' },
  { value: 'likert_5', label: 'Likert (1–5)' },
  { value: 'numeric', label: 'Numeric' },
  { value: 'free_text', label: 'Free text' },
]

const OPTION_TYPES: QuestionType[] = ['single_select', 'multi_select', 'likert_5']

function OptionsEditor({
  options,
  onChange,
}: {
  options: QuestionOption[]
  onChange: (options: QuestionOption[]) => void
}) {
  function update(index: number, field: 'label' | 'score_value', value: string) {
    const next = options.slice()
    next[index] = { ...next[index], [field]: value }
    onChange(next)
  }

  function remove(index: number) {
    onChange(options.filter((_, i) => i !== index))
  }

  function add() {
    onChange([...options, { label: '', score_value: 0, likert_position: null, display_order: options.length }])
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-navy-700">Options</p>
      {options.map((opt, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={opt.label}
            onChange={(e) => update(i, 'label', e.target.value)}
            placeholder="Label"
            className="flex-1 rounded-lg border border-cream-300 px-3 py-1.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
          />
          <input
            type="number"
            value={opt.score_value}
            onChange={(e) => update(i, 'score_value', e.target.value)}
            placeholder="Score"
            className="w-24 rounded-lg border border-cream-300 px-3 py-1.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
          />
          <button type="button" onClick={() => remove(i)} className="px-2 text-sm text-danger-text">
            ✕
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="self-start text-xs font-semibold text-teal-600 hover:underline">
        + add option
      </button>
    </div>
  )
}

type StickyDefaults = { capabilityId: string; type: QuestionType }

function QuestionForm({
  capabilities,
  initial,
  submitLabel,
  isPending,
  serverError,
  defaults,
  onDefaultsChange,
  onSubmit,
  onCancel,
}: {
  capabilities: Capability[] | undefined
  initial?: Question
  submitLabel: string
  isPending: boolean
  serverError: string | null
  defaults?: StickyDefaults
  onDefaultsChange?: (next: StickyDefaults) => void
  onSubmit: (payload: Record<string, unknown>) => void
  onCancel?: () => void
}) {
  const [capabilityId, setCapabilityId] = useState(initial?.capability ?? defaults?.capabilityId ?? '')
  const [subCapabilityId, setSubCapabilityId] = useState(initial?.sub_capability ?? '')
  const [text, setText] = useState(initial?.question_text ?? '')
  const [type, setType] = useState<QuestionType>(initial?.question_type ?? defaults?.type ?? 'yes_no')
  const [maxPoints] = useState(initial?.max_points ?? '10')
  const [numericMin, setNumericMin] = useState(initial?.numeric_min ?? '0')
  const [numericMax, setNumericMax] = useState(initial?.numeric_max ?? '100')
  const [options, setOptions] = useState<QuestionOption[]>(initial?.options ?? [])
  const [scoreFreeText, setScoreFreeText] = useState(
    initial ? initial.question_type === 'free_text' && initial.is_scored : false,
  )
  const [formError, setFormError] = useState<string | null>(null)

  const isScored = type !== 'free_text' || scoreFreeText
  const selectedCapability = capabilities?.find((c: Capability) => c.id === capabilityId)
  const subOptions = selectedCapability?.sub_capabilities.filter((s) => !s.is_archived) ?? []

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!capabilityId) {
      setFormError('Choose a capability.')
      return
    }
    if (!text.trim()) return
    if (OPTION_TYPES.includes(type) && options.length < 2) {
      setFormError('Add at least two options.')
      return
    }
    setFormError(null)

    const payload: Record<string, unknown> = {
      capability: capabilityId,
      sub_capability: subCapabilityId || null,
      question_text: text,
      question_type: type,
      max_points: maxPoints,
      is_scored: isScored,
      // Always sent so switching an existing question's type clears options/bounds
      // left behind by the previous type.
      options: [],
      numeric_min: null,
      numeric_max: null,
    }
    if (type === 'yes_no') {
      payload.options = [
        { label: 'Yes', score_value: maxPoints, likert_position: null, display_order: 0 },
        { label: 'No', score_value: 0, likert_position: null, display_order: 1 },
      ]
    } else if (OPTION_TYPES.includes(type)) {
      payload.options = options
    } else if (type === 'numeric') {
      payload.numeric_min = numericMin
      payload.numeric_max = numericMax
    }
    onSubmit(payload)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col gap-3 rounded-xl border p-4 ${
        initial ? 'border-amber-400 bg-amber-100/30' : 'border-cream-300'
      }`}
    >
      {(formError ?? serverError) && <Alert tone="error">{formError ?? serverError}</Alert>}
      <div className={`grid gap-3 ${subOptions.length > 0 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        <Select
          label="Capability"
          value={capabilityId}
          onChange={(e) => {
            setCapabilityId(e.target.value)
            setSubCapabilityId('')
            onDefaultsChange?.({ capabilityId: e.target.value, type })
          }}
        >
          <option value="">Choose…</option>
          {capabilities?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        {subOptions.length > 0 && (
          <Select
            label="Sub-capability (optional)"
            value={subCapabilityId}
            onChange={(e) => setSubCapabilityId(e.target.value)}
          >
            <option value="">No sub-capability</option>
            {subOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        )}
        <Select
          label="Type"
          value={type}
          onChange={(e) => {
            setType(e.target.value as QuestionType)
            onDefaultsChange?.({ capabilityId, type: e.target.value as QuestionType })
          }}
        >
          {QUESTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
      </div>
      <TextField label="Question text" value={text} onChange={(e) => setText(e.target.value)} />

      {type === 'free_text' && (
        <label className="flex items-start gap-2 text-sm text-navy-700">
          <input
            type="checkbox"
            checked={scoreFreeText}
            onChange={(e) => setScoreFreeText(e.target.checked)}
            className="mt-0.5 rounded border-cream-300 text-amber-500 focus:ring-amber-400/60"
          />
          <span>
            Score this question
            <span className="block text-xs text-navy-500">
              Free-text answers aren't auto-scored. A reviewer reads each response and assigns points
              manually before it counts toward the capability score.
            </span>
          </span>
        </label>
      )}
      {type === 'numeric' && (
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Min" type="number" value={numericMin} onChange={(e) => setNumericMin(e.target.value)} />
          <TextField label="Max" type="number" value={numericMax} onChange={(e) => setNumericMax(e.target.value)} />
        </div>
      )}

      {OPTION_TYPES.includes(type) && <OptionsEditor options={options} onChange={setOptions} />}

      <div className="flex items-center gap-2">
        <Button type="submit" fullWidth={false} className="px-4" isLoading={isPending}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" fullWidth={false} className="px-4" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}

function EditQuestionRow({
  question,
  capabilities,
  assessmentId,
  onDone,
}: {
  question: Question
  capabilities: Capability[] | undefined
  assessmentId: string
  onDone: () => void
}) {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const updateMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => assessmentApi.updateQuestion(question.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', assessmentId] })
      onDone()
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  return (
    <QuestionForm
      capabilities={capabilities}
      initial={question}
      submitLabel="Save changes"
      isPending={updateMutation.isPending}
      serverError={error}
      onSubmit={(payload) => updateMutation.mutate(payload)}
      onCancel={onDone}
    />
  )
}

export function BuilderQuestionsTab({ assessmentId }: { assessmentId: string }) {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [createFormKey, setCreateFormKey] = useState(0)
  // Survives the remount that clears the form after each save, so the capability
  // (and with it the sub-capability picker) stays put while adding a run of questions.
  const [createDefaults, setCreateDefaults] = useState<StickyDefaults>({ capabilityId: '', type: 'yes_no' })

  const { data: capabilities } = useQuery({
    queryKey: ['capabilities', assessmentId],
    queryFn: () => assessmentApi.capabilities(assessmentId),
  })
  const { data: questions } = useQuery({
    queryKey: ['questions', assessmentId],
    queryFn: () => assessmentApi.questions(assessmentId),
  })

  const capabilityName = (id: string) => capabilities?.find((c: Capability) => c.id === id)?.name ?? id

  const subCapabilityName = (capId: string, subId: string | null) =>
    subId
      ? capabilities?.find((c: Capability) => c.id === capId)?.sub_capabilities.find((s) => s.id === subId)?.name
      : null

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => assessmentApi.createQuestion(assessmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', assessmentId] })
      setCreateFormKey((k) => k + 1)
      setError(null)
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => assessmentApi.deleteQuestion(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['questions', assessmentId] }),
  })

  if (capabilities?.length === 0) {
    return <Alert tone="info">Add at least one capability before writing questions.</Alert>
  }

  return (
    <div className="flex flex-col gap-6">
      <QuestionForm
        key={createFormKey}
        capabilities={capabilities}
        defaults={createDefaults}
        onDefaultsChange={setCreateDefaults}
        submitLabel="+ Save question"
        isPending={createMutation.isPending}
        serverError={error}
        onSubmit={(payload) => createMutation.mutate(payload)}
      />

      <div className="flex flex-col gap-3">
        {questions?.map((q) =>
          editingId === q.id ? (
            <EditQuestionRow
              key={q.id}
              question={q}
              capabilities={capabilities}
              assessmentId={assessmentId}
              onDone={() => setEditingId(null)}
            />
          ) : (
            <div key={q.id} className="rounded-xl border border-cream-300 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-navy-500">
                    {capabilityName(q.capability)}
                    {subCapabilityName(q.capability, q.sub_capability) &&
                      ` › ${subCapabilityName(q.capability, q.sub_capability)}`}{' '}
                    · {q.question_type.replace('_', ' ')}
                    {q.question_type === 'free_text' && (q.is_scored ? ' · scored (manual review)' : ' · note only')}
                  </p>
                  <p className="mt-1 font-medium text-navy-900">{q.question_text}</p>
                  {q.options.length > 0 && (
                    <p className="mt-1 text-xs text-navy-500">
                      {q.options.map((o) => `${o.label} (${o.score_value})`).join(' · ')}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <IconButton label="Edit" icon={<PencilIcon />} onClick={() => setEditingId(q.id)} />
                  <IconButton
                    label="Remove"
                    tone="danger"
                    icon={<TrashIcon />}
                    onClick={() => deleteMutation.mutate(q.id)}
                  />
                </div>
              </div>
            </div>
          ),
        )}
        {questions?.length === 0 && <p className="text-sm text-navy-500">No questions yet.</p>}
      </div>
    </div>
  )
}
