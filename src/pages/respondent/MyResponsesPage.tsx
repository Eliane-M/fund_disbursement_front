import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { RespondentLayout } from '@/components/respondent/RespondentLayout'
import { Badge } from '@/components/ui/Badge'
import { assessmentApi } from '@/lib/assessment-api'
import { invitationStatusTone } from '@/lib/status-display'

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function MyResponsesPage() {
  const { data: invitations, isLoading } = useQuery({
    queryKey: ['my-assessments'],
    queryFn: assessmentApi.myAssessments,
  })

  const withResponses = (invitations ?? []).filter((i) => i.status === 'in_progress' || i.status === 'submitted')

  return (
    <RespondentLayout title="Responses" subtitle="The answers you have given on your assessments.">
      <section className="rounded-2xl border border-cream-300 bg-white p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-navy-500">
                <th className="pb-3 font-medium">Assessment</th>
                <th className="pb-3 font-medium">Organization</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Started</th>
                <th className="pb-3 font-medium">Submitted</th>
                <th className="pb-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {withResponses.map((invitation) => (
                <tr key={invitation.id}>
                  <td className="py-3">
                    <p className="font-medium text-navy-900">{invitation.assessment_name}</p>
                    <p className="text-xs text-navy-500">
                      {invitation.category_name || 'Uncategorised'} · {invitation.assessment_version_label}
                    </p>
                  </td>
                  <td className="py-3 text-navy-700">{invitation.organization_name}</td>
                  <td className="py-3">
                    <Badge tone={invitationStatusTone[invitation.status]}>
                      {invitation.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-3 text-navy-700">{formatDate(invitation.started_at)}</td>
                  <td className="py-3 text-navy-700">{formatDate(invitation.submitted_at)}</td>
                  <td className="py-3 text-right">
                    <Link
                      to={`/my/assessments/${invitation.id}`}
                      className="text-sm font-semibold text-teal-600 hover:underline"
                    >
                      {invitation.status === 'submitted' ? 'View answers →' : 'Continue →'}
                    </Link>
                  </td>
                </tr>
              ))}
              {!isLoading && withResponses.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm text-navy-500">
                    You haven't answered any assessments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </RespondentLayout>
  )
}
