import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { RespondentLayout } from '@/components/respondent/RespondentLayout'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { extractErrorMessage } from '@/lib/api'
import { assessmentApi } from '@/lib/assessment-api'
import type { AnswerInput, Capability, QuestionnaireQuestion } from '@/types/assessment'

type Draft = Record<string, { value: string; options: string[]; notApplicable: boolean }>

const EMPTY_ANSWER = { value: '', options: [], notApplicable: false }

function QuestionField({
  question,
  answer,
  onChange,
}: {
  question: QuestionnaireQuestion
  answer: Draft[string]
  onChange: (next: Draft[string]) => void
}) {
  const disabled = answer.notApplicable

  function toggleOption(optionId: string, multi: boolean) {
    if (multi) {
      const next = answer.options.includes(optionId)
        ? answer.options.filter((id) => id !== optionId)
        : [...answer.options, optionId]
      onChange({ ...answer, options: next })
    } else {
      onChange({ ...answer, options: [optionId] })
    }
  }

  return (
    <div className="border-t border-cream-200 py-4 first:border-t-0">
      <p className="font-medium text-navy-900">
        {question.question_text}
        {question.is_required && <span className="ml-1 text-danger-text">*</span>}
      </p>
      {question.help_text && <p className="mt-1 text-xs text-navy-500">{question.help_text}</p>}

      <div className={`mt-3 ${disabled ? 'pointer-events-none opacity-40' : ''}`}>
        {(question.question_type === 'yes_no' ||
          question.question_type === 'single_select' ||
          question.question_type === 'likert_5' ||
          question.question_type === 'multi_select') && (
          <div className="flex flex-col gap-2">
            {question.options.map((option) => {
              const multi = question.question_type === 'multi_select'
              const checked = answer.options.includes(option.id)
              return (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    checked ? 'border-amber-400 bg-amber-100/40' : 'border-cream-300 hover:border-amber-400'
                  }`}
                >
                  <input
                    type={multi ? 'checkbox' : 'radio'}
                    name={question.id}
                    checked={checked}
                    onChange={() => toggleOption(option.id, multi)}
                    className="text-amber-500 focus:ring-amber-400/60"
                  />
                  <span className="text-navy-900">{option.label}</span>
                </label>
              )
            })}
          </div>
        )}

        {question.question_type === 'numeric' && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={answer.value}
              onChange={(e) => onChange({ ...answer, value: e.target.value })}
              className="w-40 rounded-lg border border-cream-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
            />
            {question.numeric_unit && <span className="text-sm text-navy-500">{question.numeric_unit}</span>}
            {question.numeric_min !== null && question.numeric_max !== null && (
              <span className="text-xs text-navy-500">
                ({question.numeric_min}–{question.numeric_max})
              </span>
            )}
          </div>
        )}

        {question.question_type === 'free_text' && (
          <textarea
            value={answer.value}
            onChange={(e) => onChange({ ...answer, value: e.target.value })}
            rows={4}
            className="w-full rounded-lg border border-cream-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
          />
        )}
      </div>

      {question.allow_not_applicable && (
        <label className="mt-2 flex items-center gap-2 text-xs text-navy-500">
          <input
            type="checkbox"
            checked={answer.notApplicable}
            onChange={(e) => onChange({ ...answer, notApplicable: e.target.checked })}
            className="rounded border-cream-300 text-amber-500 focus:ring-amber-400/60"
          />
          Not applicable to us
        </label>
      )}
    </div>
  )
}

export function FillAssessmentPage() {
  const { invitationId } = useParams<{ invitationId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<Draft | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['my-assessment', invitationId],
    queryFn: () => assessmentApi.myAssessment(invitationId!),
  })

  const initialDraft = useMemo<Draft>(() => {
    if (!data) return {}
    const base: Draft = {}
    for (const question of data.questions) {
      const existing = data.responses.find((r) => r.question === question.id)
      base[question.id] = {
        value: existing?.answer_value == null ? '' : String(existing.answer_value),
        options: existing?.selected_options ?? [],
        notApplicable: existing?.is_not_applicable ?? false,
      }
    }
    return base
  }, [data])

  const answers = draft ?? initialDraft

  function update(questionId: string, next: Draft[string]) {
    setSaved(false)
    setDraft({ ...answers, [questionId]: next })
  }

  function toPayload(): AnswerInput[] {
    return (data?.questions ?? []).map((question) => ({
      question: question.id,
      answer_value: answers[question.id]?.value || null,
      selected_options: answers[question.id]?.options ?? [],
      is_not_applicable: answers[question.id]?.notApplicable ?? false,
    }))
  }

  const saveMutation = useMutation({
    mutationFn: () => assessmentApi.saveMyAnswers(invitationId!, toPayload()),
    onSuccess: () => {
      setSaved(true)
      setError(null)
      queryClient.invalidateQueries({ queryKey: ['my-assessments'] })
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  const submitMutation = useMutation({
    mutationFn: async () => {
      await assessmentApi.saveMyAnswers(invitationId!, toPayload())
      return assessmentApi.submitMyAssessment(invitationId!)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-assessments'] })
      queryClient.invalidateQueries({ queryKey: ['my-reports'] })
      navigate('/my/review?submitted=1')
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  if (isLoading || !data) {
    return <RespondentLayout title="Loading…">{null}</RespondentLayout>
  }

  const alreadySubmitted = data.invitation.status === 'submitted'
  const questionsByCapability = data.capabilities.map((capability: Capability) => ({
    capability,
    questions: data.questions.filter((q) => q.capability === capability.id),
  }))
  const unanswered = data.questions.filter(
    (q) =>
      q.is_required &&
      !answers[q.id]?.notApplicable &&
      !answers[q.id]?.value &&
      (answers[q.id]?.options.length ?? 0) === 0,
  ).length

  return (
    <RespondentLayout
      title={data.invitation.assessment_name}
      subtitle={`${data.invitation.organization_name} · ${data.questions.length} questions`}
    >
      {error && (
        <div className="mb-4">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      {alreadySubmitted ? (
        <Alert tone="info">
          You submitted this assessment on{' '}
          {new Date(data.invitation.submitted_at ?? '').toLocaleDateString()}. Your answers are locked while
          it is reviewed.
        </Alert>
      ) : (
        <Alert tone="info">
          Your answers save as a draft — you can come back before submitting. Once you submit, your answers
          are locked and sent for review.
        </Alert>
      )}

      <div className="mt-6 flex flex-col gap-6">
        {questionsByCapability.map(({ capability, questions }) =>
          questions.length === 0 ? null : (
            <section key={capability.id} className="rounded-2xl border border-cream-300 bg-white p-6">
              <h2 className="text-base font-semibold text-navy-900">{capability.name}</h2>
              {capability.description && (
                <p className="mt-1 text-sm text-navy-500">{capability.description}</p>
              )}
              <div className="mt-2">
                {questions.map((question) => (
                  <QuestionField
                    key={question.id}
                    question={question}
                    answer={answers[question.id] ?? EMPTY_ANSWER}
                    onChange={(next) => update(question.id, next)}
                  />
                ))}
              </div>
            </section>
          ),
        )}
      </div>

      {!alreadySubmitted && (
        <div className="sticky bottom-0 mt-6 flex flex-wrap items-center gap-3 border-t border-cream-300 bg-cream-100 py-4">
          <Button
            type="button"
            fullWidth={false}
            className="px-5"
            isLoading={submitMutation.isPending}
            disabled={unanswered > 0}
            onClick={() => submitMutation.mutate()}
          >
            Submit assessment
          </Button>
          <Button
            type="button"
            variant="ghost"
            fullWidth={false}
            className="px-5"
            isLoading={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            Save draft
          </Button>
          {unanswered > 0 ? (
            <span className="text-sm text-navy-500">
              {unanswered} required question{unanswered === 1 ? '' : 's'} left
            </span>
          ) : (
            <span className="text-sm text-success-text">All required questions answered</span>
          )}
          {saved && <span className="text-sm text-navy-500">Draft saved</span>}
        </div>
      )}

      <div className="mt-4">
        <Link to="/my/responses" className="text-sm font-semibold text-teal-600 hover:underline">
          ← Back to responses
        </Link>
      </div>
    </RespondentLayout>
  )
}
