import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'

import { ConsoleLayout } from '@/components/console/ConsoleLayout'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { TextField } from '@/components/ui/TextField'
import { useOrganization } from '@/hooks/useOrganization'
import { extractErrorMessage } from '@/lib/api'
import { assessmentApi } from '@/lib/assessment-api'
import { coreApi } from '@/lib/core-api'
import type { Respondent } from '@/types/assessment'
import { Link } from 'react-router-dom'
import { ArrowLeftIcon } from '@/components/ui/icons'

const RESPONDENT_TYPES = [
  { value: 'company', label: 'Company' },
  { value: 'cooperative', label: 'Cooperative' },
  { value: 'sme', label: 'SME' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'individual', label: 'Individual' },
] as const

type RespondentType = (typeof RESPONDENT_TYPES)[number]['value']

function NewRespondentModal({ orgId, onClose }: { orgId: string; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [respondentType, setRespondentType] = useState<RespondentType>('company')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      coreApi.createRespondent(orgId, {
        name,
        respondent_type: respondentType,
        primary_contact_email: email,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['respondents', orgId] })
      onClose()
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    mutation.mutate()
  }

  return (
    <Modal title="New respondent" onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error && <Alert tone="error">{error}</Alert>}
        <TextField label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
        <TextField
          label="Contact email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          hint="Used to invite them to respond to an assessment."
        />
        <Select
          label="Type"
          value={respondentType}
          onChange={(e) => setRespondentType(e.target.value as RespondentType)}
        >
          {RESPONDENT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Select>
        <Button type="submit" isLoading={mutation.isPending}>
          Create respondent
        </Button>
      </form>
    </Modal>
  )
}

function InviteModal({ respondent, orgId, onClose }: { respondent: Respondent; orgId: string; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [assessmentId, setAssessmentId] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { data: assessments } = useQuery({
    queryKey: ['assessments', orgId],
    queryFn: () => assessmentApi.assessments(orgId),
  })
  const liveAssessments = assessments?.filter((a) => a.status === 'live') ?? []

  const mutation = useMutation({
    mutationFn: () => assessmentApi.createInvitation(assessmentId, respondent.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', orgId] })
      queryClient.invalidateQueries({ queryKey: ['assessments', orgId] })
      onClose()
    },
    onError: (err) => setError(extractErrorMessage(err)),
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!assessmentId) {
      setError('Choose an assessment.')
      return
    }
    setError(null)
    mutation.mutate()
  }

  return (
    <Modal title={`Invite ${respondent.name}`} onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {error && <Alert tone="error">{error}</Alert>}
        {liveAssessments.length === 0 ? (
          <Alert tone="info">Publish an assessment before inviting respondents.</Alert>
        ) : (
          <Select label="Assessment" value={assessmentId} onChange={(e) => setAssessmentId(e.target.value)}>
            <option value="">Choose an assessment…</option>
            {liveAssessments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.version_label})
              </option>
            ))}
          </Select>
        )}
        <Button type="submit" isLoading={mutation.isPending} disabled={liveAssessments.length === 0}>
          Send invitation
        </Button>
      </form>
    </Modal>
  )
}

export function RespondentsPage() {
  const { activeOrganization } = useOrganization()
  const orgId = activeOrganization!.id
  const [showCreate, setShowCreate] = useState(false)
  const [inviteTarget, setInviteTarget] = useState<Respondent | null>(null)

  const { data: respondents } = useQuery({
    queryKey: ['respondents', orgId],
    queryFn: () => coreApi.respondents(orgId),
  })

  return (
    <ConsoleLayout title="Respondents">
      <div className="mb-4 flex items-center justify-between">
        <Link to='/platform/organizations' className="flex items-center gap-2 text-sm text-navy-600 hover:underline">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to organizations
        </Link>
        <Button fullWidth={false} onClick={() => setShowCreate(true)}>
          + New respondent
        </Button>
      </div>
      <section className="rounded-2xl border border-cream-300 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-navy-900">All respondents</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-navy-500">
                <th className="pb-3 font-medium">Respondent</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {respondents?.map((r) => (
                <tr key={r.id}>
                  <td className="py-3">
                    <p className="font-medium text-navy-900">{r.name}</p>
                    <p className="text-xs text-navy-500">{r.category_name || '—'}</p>
                  </td>
                  <td className="py-3 text-navy-600">{r.primary_contact_email || '—'}</td>
                  <td className="py-3 capitalize text-navy-700">{r.respondent_type}</td>
                  <td className="py-3">
                    <Badge tone={r.status === 'active' ? 'success' : 'neutral'}>{r.status}</Badge>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setInviteTarget(r)}
                      className="text-sm font-semibold text-teal-600 hover:underline"
                    >
                      Invite to assessment →
                    </button>
                  </td>
                </tr>
              ))}
              {respondents?.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-navy-500">
                    No respondents yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showCreate && <NewRespondentModal orgId={orgId} onClose={() => setShowCreate(false)} />}
      {inviteTarget && (
        <InviteModal respondent={inviteTarget} orgId={orgId} onClose={() => setInviteTarget(null)} />
      )}
    </ConsoleLayout>
  )
}
