import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { TextField } from '@/components/ui/TextField'
import { extractErrorMessage } from '@/lib/api'
import { assessmentApi } from '@/lib/assessment-api'
import type { Assessment, AssessmentRespondentType } from '@/types/assessment'

export function BuilderDetailsTab({ assessment, orgId }: { assessment: Assessment; orgId: string }) {
  const queryClient = useQueryClient()
  const [name, setName] = useState(assessment.name)
  const [versionLabel, setVersionLabel] = useState(assessment.version_label)
  const [description, setDescription] = useState(assessment.description)
  const [categoryId, setCategoryId] = useState(assessment.category)
  const [respondentType, setRespondentType] = useState<AssessmentRespondentType>(assessment.respondent_type)
  const [gapThreshold, setGapThreshold] = useState(assessment.gap_threshold_pct)
  const [targetScore, setTargetScore] = useState(assessment.default_target_score)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data: categories } = useQuery({
    queryKey: ['categories', orgId],
    queryFn: () => assessmentApi.categories(orgId),
  })

  const mutation = useMutation({
    mutationFn: () =>
      assessmentApi.updateAssessment(assessment.id, {
        name,
        version_label: versionLabel,
        description,
        category: categoryId,
        respondent_type: respondentType,
        gap_threshold_pct: gapThreshold,
        default_target_score: targetScore,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['assessment', assessment.id], updated)
      queryClient.invalidateQueries({ queryKey: ['assessments', orgId] })
      setNotice('Saved.')
      setError(null)
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setNotice(null)
    mutation.mutate()
  }

  return (
    <form className="flex max-w-2xl flex-col gap-4" onSubmit={handleSubmit}>
      {error && <Alert tone="error">{error}</Alert>}
      {notice && <Alert tone="success">{notice}</Alert>}
      <TextField label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
      <div className="grid grid-cols-2 gap-4">
        <TextField label="Version label" value={versionLabel} onChange={(e) => setVersionLabel(e.target.value)} />
        <Select label="Category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>
      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="grid grid-cols-3 gap-4">
        <Select
          label="Respondent type"
          value={respondentType}
          onChange={(e) => setRespondentType(e.target.value as AssessmentRespondentType)}
        >
          <option value="organization">Organization</option>
          <option value="individual">Individual</option>
          <option value="any">Any</option>
        </Select>
        <TextField
          label="Gap threshold (%)"
          type="number"
          value={gapThreshold}
          onChange={(e) => setGapThreshold(e.target.value)}
        />
        <TextField
          label="Default target score"
          type="number"
          value={targetScore}
          onChange={(e) => setTargetScore(e.target.value)}
        />
      </div>
      <Button type="submit" fullWidth={false} className="px-5" isLoading={mutation.isPending}>
        Save details
      </Button>
    </form>
  )
}
