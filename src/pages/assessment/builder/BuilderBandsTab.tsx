import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { PencilIcon, TrashIcon } from '@/components/ui/icons'
import { TextField } from '@/components/ui/TextField'
import { extractErrorMessage } from '@/lib/api'
import { assessmentApi } from '@/lib/assessment-api'
import type { MaturityBand } from '@/types/assessment'

function EditBandRow({ band, onDone }: { band: MaturityBand; onDone: () => void }) {
  const queryClient = useQueryClient()
  const [label, setLabel] = useState(band.label)
  const [minScore, setMinScore] = useState(band.min_score)
  const [maxScore, setMaxScore] = useState(band.max_score)
  const [error, setError] = useState<string | null>(null)

  const updateMutation = useMutation({
    mutationFn: () =>
      assessmentApi.updateMaturityBand(band.id, { label, min_score: minScore, max_score: maxScore }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maturity-bands', band.assessment] })
      onDone()
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!label.trim()) return
    updateMutation.mutate()
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-amber-400 bg-amber-100/30 p-4">
      {error && (
        <div className="mb-3">
          <Alert tone="error">{error}</Alert>
        </div>
      )}
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-48">
          <TextField label="Band label" value={label} onChange={(e) => setLabel(e.target.value)} />
        </div>
        <div className="w-28">
          <TextField label="Min score" type="number" value={minScore} onChange={(e) => setMinScore(e.target.value)} />
        </div>
        <div className="w-28">
          <TextField label="Max score" type="number" value={maxScore} onChange={(e) => setMaxScore(e.target.value)} />
        </div>
        <Button type="submit" fullWidth={false} className="px-4" isLoading={updateMutation.isPending}>
          Save
        </Button>
        <Button type="button" variant="ghost" fullWidth={false} className="px-4" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export function BuilderBandsTab({ assessmentId }: { assessmentId: string }) {
  const queryClient = useQueryClient()
  const [label, setLabel] = useState('')
  const [minScore, setMinScore] = useState('0')
  const [maxScore, setMaxScore] = useState('100')
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const { data: bands } = useQuery({
    queryKey: ['maturity-bands', assessmentId],
    queryFn: () => assessmentApi.maturityBands(assessmentId),
  })

  const createMutation = useMutation({
    mutationFn: () =>
      assessmentApi.createMaturityBand(assessmentId, { label, min_score: minScore, max_score: maxScore }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maturity-bands', assessmentId] })
      setLabel('')
      setError(null)
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => assessmentApi.deleteMaturityBand(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maturity-bands', assessmentId] }),
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!label.trim()) return
    createMutation.mutate()
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 rounded-xl border border-cream-300 p-4">
        {error && (
          <div className="w-full">
            <Alert tone="error">{error}</Alert>
          </div>
        )}
        <div className="w-48">
          <TextField label="Band label" value={label} onChange={(e) => setLabel(e.target.value)} />
        </div>
        <div className="w-28">
          <TextField label="Min score" type="number" value={minScore} onChange={(e) => setMinScore(e.target.value)} />
        </div>
        <div className="w-28">
          <TextField label="Max score" type="number" value={maxScore} onChange={(e) => setMaxScore(e.target.value)} />
        </div>
        <Button type="submit" fullWidth={false} className="px-4" isLoading={createMutation.isPending}>
          + Add band
        </Button>
      </form>

      <div className="flex flex-col gap-2">
        {bands
          ?.slice()
          .sort((a, b) => Number(a.min_score) - Number(b.min_score))
          .map((band) =>
            editingId === band.id ? (
              <EditBandRow key={band.id} band={band} onDone={() => setEditingId(null)} />
            ) : (
              <div key={band.id} className="flex items-center justify-between rounded-xl border border-cream-300 p-4">
                <div>
                  <p className="font-medium text-navy-900">{band.label}</p>
                  <p className="text-xs text-navy-500">
                    {band.min_score} – {band.max_score}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <IconButton label="Edit" icon={<PencilIcon />} onClick={() => setEditingId(band.id)} />
                  <IconButton
                    label="Remove"
                    tone="danger"
                    icon={<TrashIcon />}
                    onClick={() => deleteMutation.mutate(band.id)}
                  />
                </div>
              </div>
            ),
          )}
        {bands?.length === 0 && <p className="text-sm text-navy-500">No maturity bands yet.</p>}
      </div>
    </div>
  )
}
