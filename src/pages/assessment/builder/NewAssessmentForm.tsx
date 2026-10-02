import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ConsoleLayout } from '@/components/console/ConsoleLayout'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { TextField } from '@/components/ui/TextField'
import { extractErrorMessage } from '@/lib/api'
import { assessmentApi } from '@/lib/assessment-api'

export function NewAssessmentForm({ orgId }: { orgId: string }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [versionLabel, setVersionLabel] = useState('v1')
  const [error, setError] = useState<string | null>(null)

  const { data: categories } = useQuery({
    queryKey: ['categories', orgId],
    queryFn: () => assessmentApi.categories(orgId),
  })

  const categoryMutation = useMutation({
    mutationFn: () => assessmentApi.createCategory(orgId, { name: newCategoryName }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['categories', orgId] })
      setCategoryId(created.id)
      setShowNewCategory(false)
      setNewCategoryName('')
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  const mutation = useMutation({
    mutationFn: () =>
      assessmentApi.createAssessment(orgId, { name, category: categoryId, version_label: versionLabel }),
    onSuccess: (created) => navigate(`/assessment/builder/${created.id}`, { replace: true }),
    onError: (err) => setError(extractErrorMessage(err)),
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!categoryId) {
      setError('Choose a category.')
      return
    }
    setError(null)
    mutation.mutate()
  }

  return (
    <ConsoleLayout title="New assessment">
      <div className="max-w-lg rounded-2xl border border-cream-300 bg-white p-6">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {error && <Alert tone="error">{error}</Alert>}
          <TextField label="Name" required value={name} onChange={(e) => setName(e.target.value)} />

          {!showNewCategory ? (
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Select label="Category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="">Choose a category…</option>
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <button
                type="button"
                onClick={() => setShowNewCategory(true)}
                className="pb-2.5 text-sm font-semibold text-teal-600 hover:underline"
              >
                + New
              </button>
            </div>
          ) : (
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <TextField
                  label="New category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </div>
              <Button
                type="button"
                fullWidth={false}
                className="px-4"
                isLoading={categoryMutation.isPending}
                onClick={() => newCategoryName.trim() && categoryMutation.mutate()}
              >
                Create
              </Button>
            </div>
          )}

          <TextField label="Version label" value={versionLabel} onChange={(e) => setVersionLabel(e.target.value)} />
          <Button type="submit" fullWidth={false} className="px-5" isLoading={mutation.isPending}>
            Create draft
          </Button>
        </form>
      </div>
    </ConsoleLayout>
  )
}
