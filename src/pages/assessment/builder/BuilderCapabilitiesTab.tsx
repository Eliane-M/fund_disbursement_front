import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { extractErrorMessage } from '@/lib/api'
import { assessmentApi } from '@/lib/assessment-api'

function AddSubCapabilityForm({ capabilityId, onDone }: { capabilityId: string; onDone: () => void }) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')

  const mutation = useMutation({
    mutationFn: () => assessmentApi.createSubCapability(capabilityId, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capabilities'] })
      onDone()
    },
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    mutation.mutate()
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Sub-capability name"
        className="flex-1 rounded-lg border border-cream-300 px-3 py-1.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
      />
      <Button type="submit" fullWidth={false} className="px-3 py-1.5 text-xs" isLoading={mutation.isPending}>
        Add
      </Button>
    </form>
  )
}

export function BuilderCapabilitiesTab({ assessmentId }: { assessmentId: string }) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [weightPct, setWeightPct] = useState('0')
  const [targetScore, setTargetScore] = useState('75')
  const [error, setError] = useState<string | null>(null)
  const [addingSubTo, setAddingSubTo] = useState<string | null>(null)

  const { data: capabilities } = useQuery({
    queryKey: ['capabilities', assessmentId],
    queryFn: () => assessmentApi.capabilities(assessmentId),
  })

  const createMutation = useMutation({
    mutationFn: () =>
      assessmentApi.createCapability(assessmentId, { name, weight_pct: weightPct, target_score: targetScore }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capabilities', assessmentId] })
      setName('')
      setWeightPct('0')
      setTargetScore('75')
      setError(null)
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => assessmentApi.deleteCapability(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['capabilities', assessmentId] }),
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    createMutation.mutate()
  }

  const totalWeight = capabilities?.reduce((sum, c) => sum + Number(c.weight_pct), 0) ?? 0

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 rounded-xl border border-cream-300 p-4">
        {error && (
          <div className="w-full">
            <Alert tone="error">{error}</Alert>
          </div>
        )}
        <div className="w-56">
          <TextField label="Capability name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="w-28">
          <TextField
            label="Weight %"
            type="number"
            value={weightPct}
            onChange={(e) => setWeightPct(e.target.value)}
          />
        </div>
        <div className="w-28">
          <TextField
            label="Target score"
            type="number"
            value={targetScore}
            onChange={(e) => setTargetScore(e.target.value)}
          />
        </div>
        <Button type="submit" fullWidth={false} className="px-4" isLoading={createMutation.isPending}>
          + Add capability
        </Button>
      </form>

      <p className="text-xs text-navy-500">
        Total weight: <span className={totalWeight === 100 ? 'text-success-text' : 'text-amber-600'}>{totalWeight}%</span>{' '}
        (aim for 100%)
      </p>

      <div className="flex flex-col gap-3">
        {capabilities?.map((cap) => (
          <div key={cap.id} className="rounded-xl border border-cream-300 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-navy-900">{cap.name}</p>
                <p className="text-xs text-navy-500">
                  Weight {cap.weight_pct}% · Target {cap.target_score ?? '—'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAddingSubTo(addingSubTo === cap.id ? null : cap.id)}
                  className="text-xs font-semibold text-teal-600 hover:underline"
                >
                  + sub-capability
                </button>
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(cap.id)}
                  className="text-xs font-semibold text-danger-text hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>

            {cap.sub_capabilities.length > 0 && (
              <ul className="mt-3 flex flex-col gap-1 pl-3 text-sm text-navy-600">
                {cap.sub_capabilities.map((sub) => (
                  <li key={sub.id} className="list-disc marker:text-amber-500">
                    {sub.name}
                  </li>
                ))}
              </ul>
            )}

            {addingSubTo === cap.id && (
              <AddSubCapabilityForm capabilityId={cap.id} onDone={() => setAddingSubTo(null)} />
            )}
          </div>
        ))}
        {capabilities?.length === 0 && (
          <p className="text-sm text-navy-500">No capabilities yet. Add the first one above.</p>
        )}
      </div>
    </div>
  )
}
