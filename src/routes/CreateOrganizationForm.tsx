import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { useOrganization } from '@/hooks/useOrganization'
import { extractErrorMessage } from '@/lib/api'
import { coreApi } from '@/lib/core-api'

export function CreateOrganizationForm({ onCancel }: { onCancel?: () => void }) {
  const queryClient = useQueryClient()
  const { setActiveOrganization } = useOrganization()
  const [name, setName] = useState('')
  const [sectorFocus, setSectorFocus] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => coreApi.createOrganization({ name, sector_focus: sectorFocus }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      setActiveOrganization(created)
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Organization name is required.')
      return
    }
    setError(null)
    mutation.mutate()
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-cream-300 bg-white p-8">
      <h1 className="text-lg font-semibold text-navy-900">Create your organization</h1>
      <p className="mt-1 text-sm text-navy-500">Set up a workspace to start using the console.</p>
      <form className="mt-5 flex flex-col gap-4" onSubmit={handleSubmit}>
        {error && <Alert tone="error">{error}</Alert>}
        <TextField
          label="Organization name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Acme Ventures"
        />
        <TextField
          label="Sector focus"
          value={sectorFocus}
          onChange={(e) => setSectorFocus(e.target.value)}
          placeholder="Optional"
        />
        <Button type="submit" isLoading={mutation.isPending}>
          Create organization
        </Button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-semibold text-teal-600 hover:underline"
          >
            Back to organization list
          </button>
        )}
      </form>
    </div>
  )
}
