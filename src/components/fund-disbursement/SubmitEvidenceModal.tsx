import { useMutation, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { TextField } from '@/components/ui/TextField'
import { extractErrorMessage } from '@/lib/api'
import type { EvidencePayload } from '@/lib/fund-disbursement-api'
import type { Milestone } from '@/types/fund-disbursement'

const MAX_FILES = 5
const MAX_BYTES = 10 * 1024 * 1024
const ACCEPT = '.pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip'

export function SubmitEvidenceModal({
  title,
  milestone,
  submit,
  invalidate,
  onClose,
}: {
  title: string
  milestone: Milestone
  submit: (payload: EvidencePayload) => Promise<unknown>
  invalidate: string[][]
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [note, setNote] = useState('')
  const [links, setLinks] = useState<string[]>([''])
  const [uploads, setUploads] = useState<File[]>([])
  const [kpiValues, setKpiValues] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      submit({
        respondent_note: note,
        links: links.filter((l) => l.trim()),
        uploads,
        kpi_results: milestone.kpis
          .filter((k) => k.id && kpiValues[k.id]?.trim())
          .map((k) => ({ milestone_kpi: k.id as string, reported_value: kpiValues[k.id as string] })),
      }),
    onSuccess: () => {
      invalidate.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }))
      onClose()
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!links.some((l) => l.trim()) && uploads.length === 0 && !note.trim()) {
      setError('Add a file, a link or a note.')
      return
    }
    mutation.mutate()
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error && <Alert tone="error">{error}</Alert>}
        {milestone.evidence_requirements.length > 0 && (
          <p className="text-xs text-navy-500">
            Required: {milestone.evidence_requirements.map((e) => e.label).join(', ')}
          </p>
        )}
        {milestone.kpis.length > 0 && (
          <p className="text-xs text-navy-500">
            Enter the result you achieved against each target below, and attach proof.
          </p>
        )}
        {milestone.kpis.map((k) => (
          <TextField
            key={k.id ?? k.name}
            label={`Result achieved: ${k.name}`}
            hint={k.target_value !== null ? `Target: ${k.target_value}${k.unit ? ` ${k.unit}` : ''}` : undefined}
            inputMode="decimal"
            value={kpiValues[k.id as string] ?? ''}
            onChange={(e) => setKpiValues({ ...kpiValues, [k.id as string]: e.target.value })}
          />
        ))}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-navy-800">Evidence files</label>
          <input
            type="file"
            multiple
            accept={ACCEPT}
            onChange={(e) => {
              const picked = Array.from(e.target.files ?? [])
              e.target.value = ''
              const next = [...uploads, ...picked]
              if (next.length > MAX_FILES) return setError(`Attach at most ${MAX_FILES} files.`)
              const tooBig = picked.find((f) => f.size > MAX_BYTES)
              if (tooBig) return setError(`"${tooBig.name}" is larger than 10 MB.`)
              setError(null)
              setUploads(next)
            }}
            className="w-full rounded-lg border border-dashed border-cream-300 bg-cream-100 px-3.5 py-3 text-sm text-navy-700 file:mr-3 file:rounded-md file:border-0 file:bg-navy-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
          />
          <p className="text-xs text-navy-500">PDF, images, Word, Excel, CSV, TXT or ZIP · up to 5 files, 10 MB each.</p>
          {uploads.map((f, i) => (
            <div key={`${f.name}-${i}`} className="flex items-center justify-between rounded-lg bg-cream-100 px-3 py-1.5 text-xs text-navy-700">
              <span className="truncate">{f.name}</span>
              <button
                type="button"
                onClick={() => setUploads(uploads.filter((_, j) => j !== i))}
                className="ml-3 font-semibold text-danger-text hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-navy-800">Evidence links (optional)</label>
          {links.map((link, i) => (
            <input
              key={i}
              value={link}
              onChange={(e) => {
                const next = links.slice()
                next[i] = e.target.value
                setLinks(next)
              }}
              placeholder="https://…"
              className="w-full rounded-lg border border-cream-300 px-3.5 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
            />
          ))}
          <button
            type="button"
            onClick={() => setLinks([...links, ''])}
            className="self-start text-xs font-semibold text-teal-600 hover:underline"
          >
            + add another link
          </button>
        </div>
        <TextField label="Note" value={note} onChange={(e) => setNote(e.target.value)} />
        <Button type="submit" isLoading={mutation.isPending}>
          Submit evidence
        </Button>
      </form>
    </Modal>
  )
}
