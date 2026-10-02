import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { TextField } from '@/components/ui/TextField'
import { extractErrorMessage } from '@/lib/api'
import { assessmentApi } from '@/lib/assessment-api'
import type { Capability, QuestionOption, QuestionType } from '@/types/assessment'

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'yes_no', label: 'Yes / No' },
  { value: 'single_select', label: 'Single select' },
  { value: 'multi_select', label: 'Multi select' },
  // { value: 'likert_5', label: 'Likert (1–5)' },
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

export function BuilderQuestionsTab({ assessmentId }: { assessmentId: string }) {
  const queryClient = useQueryClient()
  const [capabilityId, setCapabilityId] = useState('')
  const [text, setText] = useState('')
  const [type, setType] = useState<QuestionType>('yes_no')
  const [maxPoints, setMaxPoints] = useState('10')
  const [numericMin, setNumericMin] = useState('0')
  const [numericMax, setNumericMax] = useState('100')
  const [options, setOptions] = useState<QuestionOption[]>([])
  const [scoreFreeText, setScoreFreeText] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isScored = type !== 'free_text' || scoreFreeText

  const { data: capabilities } = useQuery({
    queryKey: ['capabilities', assessmentId],
    queryFn: () => assessmentApi.capabilities(assessmentId),
  })
  const { data: questions } = useQuery({
    queryKey: ['questions', assessmentId],
    queryFn: () => assessmentApi.questions(assessmentId),
  })

  const capabilityName = (id: string) => capabilities?.find((c: Capability) => c.id === id)?.name ?? id

  const createMutation = useMutation({
    mutationFn: () => {
      const payload: Record<string, unknown> = {
        capability: capabilityId,
        question_text: text,
        question_type: type,
        max_points: maxPoints,
        is_scored: isScored,
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
      return assessmentApi.createQuestion(assessmentId, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', assessmentId] })
      setText('')
      setOptions([])
      setScoreFreeText(false)
      setError(null)
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => assessmentApi.deleteQuestion(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['questions', assessmentId] }),
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!capabilityId) {
      setError('Choose a capability.')
      return
    }
    if (!text.trim()) return
    if (OPTION_TYPES.includes(type) && options.length < 2) {
      setError('Add at least two options.')
      return
    }
    setError(null)
    createMutation.mutate()
  }

  if (capabilities?.length === 0) {
    return <Alert tone="info">Add at least one capability before writing questions.</Alert>
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-cream-300 p-4">
        {error && <Alert tone="error">{error}</Alert>}
        <div className="grid grid-cols-2 gap-3">
          <Select label="Capability" value={capabilityId} onChange={(e) => setCapabilityId(e.target.value)}>
            <option value="">Choose…</option>
            {capabilities?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select label="Type" value={type} onChange={(e) => setType(e.target.value as QuestionType)}>
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
                Free-text answers aren't auto-scored — a reviewer reads each response and assigns points
                manually before it counts toward the capability score.
              </span>
            </span>
          </label>
        )}

        {isScored && (
          <div className="w-32">
            <TextField
              label="Max points"
              type="number"
              value={maxPoints}
              onChange={(e) => setMaxPoints(e.target.value)}
            />
          </div>
        )}

        {type === 'numeric' && (
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Min" type="number" value={numericMin} onChange={(e) => setNumericMin(e.target.value)} />
            <TextField label="Max" type="number" value={numericMax} onChange={(e) => setNumericMax(e.target.value)} />
          </div>
        )}

        {OPTION_TYPES.includes(type) && <OptionsEditor options={options} onChange={setOptions} />}

        <Button type="submit" fullWidth={false} className="self-start px-4" isLoading={createMutation.isPending}>
          + Add question
        </Button>
      </form>

      <div className="flex flex-col gap-3">
        {questions?.map((q) => (
          <div key={q.id} className="rounded-xl border border-cream-300 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-navy-500">
                  {capabilityName(q.capability)} · {q.question_type.replace('_', ' ')}
                  {q.question_type === 'free_text' && (q.is_scored ? ' · scored (manual review)' : ' · note only')}
                </p>
                <p className="mt-1 font-medium text-navy-900">{q.question_text}</p>
                {q.options.length > 0 && (
                  <p className="mt-1 text-xs text-navy-500">
                    {q.options.map((o) => `${o.label} (${o.score_value})`).join(' · ')}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(q.id)}
                className="text-xs font-semibold text-danger-text hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        {questions?.length === 0 && <p className="text-sm text-navy-500">No questions yet.</p>}
      </div>
    </div>
  )
}
