import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { TextField } from '@/components/ui/TextField'
import { extractErrorMessage } from '@/lib/api'
import { assessmentApi } from '@/lib/assessment-api'

export function BuilderRecommendationsTab({ assessmentId }: { assessmentId: string }) {
  const queryClient = useQueryClient()
  const [capabilityId, setCapabilityId] = useState('')
  const [bandId, setBandId] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { data: capabilities } = useQuery({
    queryKey: ['capabilities', assessmentId],
    queryFn: () => assessmentApi.capabilities(assessmentId),
  })
  const { data: bands } = useQuery({
    queryKey: ['maturity-bands', assessmentId],
    queryFn: () => assessmentApi.maturityBands(assessmentId),
  })
  const { data: recommendations } = useQuery({
    queryKey: ['recommendations', capabilityId],
    queryFn: () => assessmentApi.recommendations(capabilityId),
    enabled: Boolean(capabilityId),
  })

  const createMutation = useMutation({
    mutationFn: () =>
      assessmentApi.createRecommendation(capabilityId, {
        recommendation_text: text,
        band: bandId || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations', capabilityId] })
      setText('')
      setError(null)
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => assessmentApi.deleteRecommendation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recommendations', capabilityId] }),
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!capabilityId || !text.trim()) return
    setError(null)
    createMutation.mutate()
  }

  if (capabilities?.length === 0) {
    return <Alert tone="info">Add at least one capability before writing recommendations.</Alert>
  }

  const bandLabel = (id: string | null) => bands?.find((b) => b.id === id)?.label ?? 'Gap (no band)'

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Select label="Capability" value={capabilityId} onChange={(e) => setCapabilityId(e.target.value)}>
        <option value="">Choose a capability…</option>
        {capabilities?.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>

      {capabilityId && (
        <>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-cream-300 p-4">
            {error && <Alert tone="error">{error}</Alert>}
            <Select label="Maturity band (leave blank for a gap recommendation)" value={bandId} onChange={(e) => setBandId(e.target.value)}>
              <option value="">Gap (no band)</option>
              {bands?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </Select>
            <TextField label="Recommendation text" value={text} onChange={(e) => setText(e.target.value)} />
            <Button type="submit" fullWidth={false} className="self-start px-4" isLoading={createMutation.isPending}>
              + Add recommendation
            </Button>
          </form>

          <div className="flex flex-col gap-2">
            {recommendations?.map((r) => (
              <div key={r.id} className="rounded-xl border border-cream-300 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-navy-500">{bandLabel(r.band)}</p>
                    <p className="mt-1 text-sm text-navy-800">{r.recommendation_text}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(r.id)}
                    className="text-xs font-semibold text-danger-text hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {recommendations?.length === 0 && (
              <p className="text-sm text-navy-500">No recommendations for this capability yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
